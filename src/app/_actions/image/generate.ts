"use server";

import { env } from "@/env";
import { supabaseAdmin } from "@/lib/supabase";
import { auth } from "@/server/auth";
import { utapi } from "@/app/api/uploadthing/core";
import { UTFile } from "uploadthing/server";
// Simple UUID generator for server-side use
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
import { consumeImageGenerationCredits, canExecuteAction, canUseImageQuality, checkAndResetCreditsIfNeeded, canUseImageModel, consumeImageModelCredits, type CreditAction } from "@/lib/credit-system";
import { queueImageGeneration } from "@/lib/image-queue";
import { generateWithFallback } from "@/lib/image-fallback";

// Helper function to convert aspect ratio to Ideogram format
function convertToIdeogramAspectRatio(aspectRatio: string, isV3: boolean = false): string {
  if (isV3) {
    // V3 uses simple format like "4x3"
    const v3AspectMap: Record<string, string> = {
      "4:3": "4x3",
      "16:9": "16x9", 
      "1:1": "1x1",
      "3:4": "3x4",
      "9:16": "9x16"
    };
    return v3AspectMap[aspectRatio] || "4x3";
  } else {
    // V2 and V2 Turbo use ASPECT_ format
    const v2AspectMap: Record<string, string> = {
      "4:3": "ASPECT_4_3",
      "16:9": "ASPECT_16_9", 
      "1:1": "ASPECT_1_1",
      "3:4": "ASPECT_3_4",
      "9:16": "ASPECT_9_16"
    };
    return v2AspectMap[aspectRatio] || "ASPECT_4_3";
  }
}

export type ImageModelList =
  | "ideogram-v2-turbo"
  | "ideogram-v3-turbo"
  | "ideogram-v3-quality"
  | "dall-e-3"
  | "google-imagen-3"
  | "google-imagen-3-fast"
  | "google-imagen-4"
  | "gpt-image-1";


// Ideogram implementation
async function generateWithIdeogram(prompt: string, model: string, aspectRatio: string = "4:3"): Promise<string> {
  const modelMap: Record<string, { endpoint: string, modelName: string, renderingSpeed: string }> = {
    "ideogram-v2-turbo": { endpoint: "generate", modelName: "V_2", renderingSpeed: "TURBO" },
    "ideogram-v3-turbo": { endpoint: "v1/ideogram-v3/generate", modelName: "V_3", renderingSpeed: "TURBO" },
    "ideogram-v3-quality": { endpoint: "v1/ideogram-v3/generate", modelName: "V_3", renderingSpeed: "QUALITY" }
  };

  const config = modelMap[model];
  if (!config) {
    throw new Error(`Unsupported Ideogram model: ${model}`);
  }

  // Convert aspect ratio to Ideogram format
  const isV3 = model.includes("v3");
  const ideogramAspectRatio = convertToIdeogramAspectRatio(aspectRatio, isV3);
  
  if (!env.IDEOGRAM_API_KEY) {
    throw new Error("Ideogram API key not configured");
  }

  let requestBody;
  const headers: Record<string, string> = {
    "Api-Key": env.IDEOGRAM_API_KEY,
  };

  if (isV3) {
    // V3 models use FormData with rendering_speed parameter
    const formData = new FormData();
    formData.append("prompt", prompt);
    formData.append("aspect_ratio", ideogramAspectRatio);
    formData.append("rendering_speed", config.renderingSpeed);
    formData.append("style_type", "AUTO"); // Let Ideogram choose best style
    formData.append("magic_prompt", "AUTO"); // Enhanced prompt processing
    
    requestBody = formData;
  } else {
    // V2 Turbo uses JSON with improved parameters
    headers["Content-Type"] = "application/json";
    requestBody = JSON.stringify({
      image_request: {
        prompt,
        model: config.modelName,
        aspect_ratio: ideogramAspectRatio,
        rendering_speed: config.renderingSpeed,
        magic_prompt_option: "AUTO", // Enhanced prompt processing for better results
        style_type: "AUTO" // Automatic style selection
      }
    });
  }

  // Use the correct API endpoint based on the model version
  const apiUrl = isV3 
    ? `https://api.ideogram.ai/${config.endpoint}`
    : `https://api.ideogram.ai/${config.endpoint}`;
    
  console.log(`Making request to Ideogram API: ${apiUrl} with model ${model} (${config.renderingSpeed})`);
  
  const response = await fetch(apiUrl, {
    method: "POST",
    headers,
    body: requestBody,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Ideogram API Error: ${response.status} ${response.statusText}`, errorText);
    throw new Error(`Ideogram generation failed: ${response.status} ${response.statusText} - ${errorText}`);
  }

  const result = await response.json();
  console.log('Ideogram API Response:', result);
  
  const imageUrl = result.data?.[0]?.url;

  if (!imageUrl) {
    console.error('Ideogram response structure:', result);
    throw new Error("No image URL received from Ideogram");
  }

  return imageUrl;
}

// OpenAI implementation for DALL-E 3 and GPT Image 1
async function generateWithOpenAI(prompt: string, model: string): Promise<string> {
  if (!["dall-e-3", "gpt-image-1"].includes(model)) {
    throw new Error(`Unsupported OpenAI model: ${model}`);
  }

  console.log(`OpenAI: Starting generation with model ${model}, prompt: "${prompt.substring(0, 50)}..."`);

  // Determine model parameters
  let requestBody;
  if (model === "dall-e-3") {
    requestBody = {
      model: "dall-e-3",
      prompt,
      n: 1,
      size: "1024x1024",
      response_format: "url"
    };
  } else if (model === "gpt-image-1") {
    requestBody = {
      model: "gpt-image-1",
      prompt,
      n: 1,
      size: "1024x1024"
    };
  }

  console.log(`OpenAI: Request body:`, requestBody);

  const response = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  console.log(`OpenAI: Generation response status: ${response.status}`);

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`OpenAI: Generation failed with status ${response.status}:`, errorText);
    throw new Error(`OpenAI generation failed: ${errorText}`);
  }

  const result = await response.json();
  console.log(`OpenAI: Generation result:`, result);
  
  // Handle different response formats
  let imageUrl;
  
  if (model === "dall-e-3") {
    // DALL-E 3 returns URL directly
    imageUrl = result.data?.[0]?.url;
    if (!imageUrl) {
      console.error(`OpenAI: No image URL in DALL-E 3 response:`, result);
      throw new Error("No image URL received from DALL-E 3");
    }
  } else if (model === "gpt-image-1") {
    // GPT Image 1 returns base64 data
    const base64Data = result.data?.[0]?.b64_json;
    if (!base64Data) {
      console.error(`OpenAI: No base64 data in GPT Image 1 response:`, result);
      throw new Error("No image data received from GPT Image 1");
    }
    // Convert base64 to data URL
    imageUrl = `data:image/png;base64,${base64Data}`;
    console.log(`OpenAI: Converted base64 to data URL for GPT Image 1`);
  }
  
  console.log(`OpenAI: Generation completed successfully. Image URL: ${imageUrl ? imageUrl.substring(0, 50) + '...' : 'undefined'}`);
  return imageUrl;
}

// Google Cloud Imagen implementation using REST API
async function generateWithGoogleImagen(prompt: string, aspectRatio: string = "1:1", fast: boolean = false): Promise<string> {
  // Check if Google Cloud credentials are properly configured
  if (!env.GOOGLE_CLOUD_PROJECT_ID) {
    throw new Error("Google Imagen indisponível: GOOGLE_CLOUD_PROJECT_ID não configurado");
  }

  const { getGoogleAccessToken } = await import("@/lib/google-auth");

  // Convert aspect ratio to Imagen format
  let imagenAspectRatio = "1:1";
  switch (aspectRatio) {
    case "4:3":
      imagenAspectRatio = "4:3";
      break;
    case "16:9":
      imagenAspectRatio = "16:9";
      break;
    case "3:4":
      imagenAspectRatio = "3:4";
      break;
    case "9:16":
      imagenAspectRatio = "9:16";
      break;
    default:
      imagenAspectRatio = "1:1";
  }

  try {
    // Get access token using our utility function
    const accessToken = await getGoogleAccessToken();

    // Prepare the request - try multiple regions if needed
    const location = "us-central1";
    const model = fast ? "imagen-3.0-fast-generate-001" : "imagen-3.0-generate-001";
    const endpoint = `https://us-central1-aiplatform.googleapis.com/v1/projects/${env.GOOGLE_CLOUD_PROJECT_ID}/locations/${location}/publishers/google/models/${model}:predict`;

    const requestBody = {
      instances: [
        {
          prompt: prompt,
          aspectRatio: imagenAspectRatio,
          safetyFilterLevel: "block_few",
          personGeneration: "allow_adult",
        }
      ],
      parameters: {
        sampleCount: 1,
        addWatermark: false,
        includeSafetyAttributes: false,
        includeRaiReason: false,
      }
    };

    console.log(`Calling Google Imagen${fast ? " Fast" : ""} REST API: ${endpoint}`);
    console.log("Request body:", JSON.stringify(requestBody, null, 2));

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Google Imagen API Error: ${response.status} ${response.statusText}`, errorText);
      
      if (response.status === 401) {
        throw new Error("Google Cloud authentication failed. Please check your credentials and permissions.");
      } else if (response.status === 403) {
        throw new Error("Google Cloud permission denied. Please ensure the Vertex AI API is enabled and proper IAM roles are assigned.");
      } else if (response.status === 404) {
        throw new Error(`Google Imagen model not found. The model "${model}" may not be available in your region or project.`);
      } else if (response.status === 429) {
        throw new Error("Google Cloud quota exceeded. Please check your billing and quota limits.");
      }
      
      throw new Error(`Google Imagen API failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const result = await response.json();
    console.log("Google Imagen API Response:", JSON.stringify(result, null, 2));

    if (!result.predictions || result.predictions.length === 0) {
      console.error("Invalid response structure:", result);
      
      // Check for error in response
      if (result.error) {
        throw new Error(`Google Imagen API error: ${result.error.message || result.error}`);
      }
      
      // Check if response is completely empty
      if (Object.keys(result).length === 0) {
        throw new Error("Google Cloud returned empty response. This may indicate insufficient permissions or model access issues.");
      }
      
      throw new Error(`No predictions received from Google Imagen. Response: ${JSON.stringify(result)}`);
    }

    const prediction = result.predictions[0];
    
    // Extract base64 image data
    let imageData;
    if (prediction.bytesBase64Encoded) {
      imageData = prediction.bytesBase64Encoded;
    } else if (prediction.struct?.fields?.bytesBase64Encoded?.stringValue) {
      imageData = prediction.struct.fields.bytesBase64Encoded.stringValue;
    } else {
      console.error("Prediction structure:", prediction);
      throw new Error("No image data found in Google Imagen response");
    }

    return `data:image/png;base64,${imageData}`;
  } catch (error) {
    console.error("Google Imagen generation error:", error);
    
    if (error instanceof Error) {
      // Re-throw our custom errors as-is
      if (error.message.includes("Google Cloud") || error.message.includes("Google Imagen")) {
        throw error;
      }
    }
    
    throw new Error(`Google Imagen generation failed: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

// Google Cloud Imagen 4 implementation using REST API
async function generateWithGoogleImagen4(prompt: string, aspectRatio: string = "1:1"): Promise<string> {
  // Check if Google Cloud credentials are properly configured
  if (!env.GOOGLE_CLOUD_PROJECT_ID) {
    throw new Error("Google Imagen 4 indisponível: GOOGLE_CLOUD_PROJECT_ID não configurado");
  }

  const { getGoogleAccessToken } = await import("@/lib/google-auth");

  // Convert aspect ratio to Imagen format
  let imagenAspectRatio = "1:1";
  switch (aspectRatio) {
    case "4:3":
      imagenAspectRatio = "4:3";
      break;
    case "16:9":
      imagenAspectRatio = "16:9";
      break;
    case "3:4":
      imagenAspectRatio = "3:4";
      break;
    case "9:16":
      imagenAspectRatio = "9:16";
      break;
    default:
      imagenAspectRatio = "1:1";
  }

  try {
    // Get access token using our utility function
    const accessToken = await getGoogleAccessToken();

    // Prepare the request for Imagen 4
    const location = "us-central1";
    const model = "imagen-4.0-generate-preview-06-06";
    const endpoint = `https://us-central1-aiplatform.googleapis.com/v1/projects/${env.GOOGLE_CLOUD_PROJECT_ID}/locations/${location}/publishers/google/models/${model}:predict`;

    const requestBody = {
      instances: [
        {
          prompt: prompt,
          aspect_ratio: imagenAspectRatio,
          negative_prompt: "",
          person_generation: "allow_all",
          safety_filter_level: "block_few",
          add_watermark: true,
        }
      ],
      parameters: {
        number_of_images: 4,
      }
    };

    console.log(`Calling Google Imagen 4 REST API: ${endpoint}`);
    console.log("Request body:", JSON.stringify(requestBody, null, 2));

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Google Imagen 4 API Error: ${response.status} ${response.statusText}`, errorText);
      
      if (response.status === 401) {
        throw new Error("Google Cloud authentication failed. Please check your credentials and permissions.");
      } else if (response.status === 403) {
        throw new Error("Google Cloud permission denied. Please ensure the Vertex AI API is enabled and proper IAM roles are assigned.");
      } else if (response.status === 404) {
        throw new Error(`Google Imagen 4 model not found. The model "${model}" may not be available in your region or project.`);
      } else if (response.status === 429) {
        throw new Error("Google Cloud quota exceeded. Please check your billing and quota limits.");
      }
      
      throw new Error(`Google Imagen 4 API failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const result = await response.json();
    console.log("Google Imagen 4 API Response:", JSON.stringify(result, null, 2));

    if (!result.predictions || result.predictions.length === 0) {
      console.error("Invalid response structure:", result);
      
      // Check for error in response
      if (result.error) {
        throw new Error(`Google Imagen 4 API error: ${result.error.message || result.error}`);
      }
      
      // Check if response is completely empty
      if (Object.keys(result).length === 0) {
        throw new Error("Google Cloud returned empty response. This may indicate insufficient permissions or model access issues.");
      }
      
      throw new Error(`No predictions received from Google Imagen 4. Response: ${JSON.stringify(result)}`);
    }

    const prediction = result.predictions[0];
    
    // Extract base64 image data - Imagen 4 returns multiple images, we'll take the first one
    let imageData;
    if (prediction.bytesBase64Encoded) {
      imageData = prediction.bytesBase64Encoded;
    } else if (prediction.struct?.fields?.bytesBase64Encoded?.stringValue) {
      imageData = prediction.struct.fields.bytesBase64Encoded.stringValue;
    } else {
      console.error("Prediction structure:", prediction);
      throw new Error("No image data found in Google Imagen 4 response");
    }

    return `data:image/png;base64,${imageData}`;
  } catch (error) {
    console.error("Google Imagen 4 generation error:", error);
    
    if (error instanceof Error) {
      // Re-throw our custom errors as-is
      if (error.message.includes("Google Cloud") || error.message.includes("Google Imagen")) {
        throw error;
      }
    }
    
    throw new Error(`Google Imagen 4 generation failed: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

export async function generateImageAction(
  prompt: string,
  model: ImageModelList = "ideogram-v2-turbo",
  quality: CreditAction = "BASIC_IMAGE", 
  aspectRatio: "4:3" | "16:9" | "1:1" | "3:4" | "9:16" = "4:3",
  shouldConsumeCredits: boolean = true
) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("You must be logged in to generate images");
  }

  await checkAndResetCreditsIfNeeded(session.user.id);

  // Verificar se o usuário pode usar este modelo específico
  const modelCheck = await canUseImageModel(session.user.id, model);
  if (!modelCheck.allowed) {
    return {
      success: false,
      error: modelCheck.message || `Modelo ${model} não disponível no seu plano ${modelCheck.planName}`,
      requiredPlan: modelCheck.requiredPlan,
      availableModels: modelCheck.availableModels,
    };
  }

  const qualityCheck = await canUseImageQuality(session.user.id, quality);
  if (!qualityCheck.allowed) {
    return {
      success: false,
      error: qualityCheck.message || "Qualidade de imagem não disponível no seu plano",
    };
  }

  // Só verificar e consumir créditos se shouldConsumeCredits for true
  if (shouldConsumeCredits) {
    const creditCheck = await canExecuteAction(session.user.id, 'IMAGE_GENERATION');
    if (!creditCheck.allowed) {
      return {
        success: false,
        error: creditCheck.message || "Créditos insuficientes",
        creditsNeeded: creditCheck.cost,
        currentCredits: creditCheck.currentCredits,
      };
    }
  }

  try {
    let creditResult: { success: boolean; creditsUsed: number; remainingCredits: number; message?: string } | null = null;
    if (shouldConsumeCredits) {
      creditResult = await consumeImageGenerationCredits(session.user.id);
      if (!creditResult.success) {
        return {
          success: false,
          error: creditResult.message || "Erro ao consumir créditos",
        };
      }
    }



    // Função de geração que será usada pela fila e fallback
    const generateFunction = async (prompt: string, model: string, aspectRatio: string): Promise<string> => {
      if (["ideogram-v2-turbo", "ideogram-v3-turbo", "ideogram-v3-quality"].includes(model)) {
        return await generateWithIdeogram(prompt, model, aspectRatio);
      } else if (["dall-e-3", "gpt-image-1"].includes(model)) {
        return await generateWithOpenAI(prompt, model);
      } else if (model === "google-imagen-3") {
        return await generateWithGoogleImagen(prompt, aspectRatio, false);
      } else if (model === "google-imagen-3-fast") {
        return await generateWithGoogleImagen(prompt, aspectRatio, true);
      } else if (model === "google-imagen-4") {
        return await generateWithGoogleImagen4(prompt, aspectRatio);
      } else {
        throw new Error(`Unsupported model: ${model}`);
      }
    };

    // Usar sistema de fila para modelos Google e fallback automático
    const generationResult = await generateWithFallback(
      model,
      prompt,
      aspectRatio,
      async (prompt: string, model: string, aspectRatio: string) => {
        return await queueImageGeneration(model as ImageModelList, prompt, aspectRatio, generateFunction);
      }
    );

    if (!generationResult.success) {
      throw new Error(generationResult.error || "Falha na geração de imagem");
    }

    const imageUrl = generationResult.imageUrl!;
    const modelUsed = generationResult.modelUsed;
    const aspectRatioUsed = generationResult.aspectRatioUsed;
    const wasFallback = generationResult.wasFallback;

    // Log informações sobre a geração
    if (wasFallback) {
      console.log(`🔄 Fallback executado: ${model} → ${modelUsed}`);
      console.log(`📐 Aspect ratio convertido: ${aspectRatio} → ${aspectRatioUsed}`);
      console.log(`💡 Motivo: ${generationResult.fallbackReason}`);
    } else {
      console.log(`✅ Geração bem-sucedida com modelo original: ${modelUsed}`);
    }



    let imageBlob: Blob;

    // Handle different response formats
    if (imageUrl.startsWith('data:image/')) {
      // Base64 data (from Google Imagen or other base64 sources)
      const base64Data = imageUrl.split(',')[1];
      if (!base64Data) {
        throw new Error("Invalid base64 data");
      }
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      imageBlob = new Blob([bytes], { type: 'image/png' });
    } else {
      // URL (from APIFrame, Ideogram, DALL-E 3)
      const imageResponse = await fetch(imageUrl);
      if (!imageResponse.ok) {
        throw new Error("Failed to download image");
      }
      imageBlob = await imageResponse.blob();
    }

    const imageBuffer = await imageBlob.arrayBuffer();
    const filename = `${prompt.substring(0, 20).replace(/[^a-z0-9]/gi, "_")}_${Date.now()}.png`;
    const utFile = new UTFile([new Uint8Array(imageBuffer)], filename);

    const uploadResult = await utapi.uploadFiles([utFile]);

    if (!uploadResult[0]?.data?.ufsUrl) {
      console.error("Upload error:", uploadResult[0]?.error);
      throw new Error("Failed to upload image to UploadThing");
    }

    const permanentUrl = uploadResult[0].data.ufsUrl;


    const { data: generatedImage, error } = await supabaseAdmin
      .from('GeneratedImage')
      .insert({
        id: generateUUID(),
        url: permanentUrl,
        prompt: prompt,
        model: model,
        aspectRatio: aspectRatio,
        quality: quality,
        userId: session.user.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("Error saving generated image:", error);
      throw new Error("Failed to save image to database");
    }

    return {
      success: true,
      image: generatedImage,
      creditsUsed: creditResult?.creditsUsed || 0,
      remainingCredits: creditResult?.remainingCredits || 0,
      quality,
      modelUsed,
      aspectRatioUsed,
      wasFallback,
      fallbackReason: wasFallback ? generationResult.fallbackReason : undefined,
    };
  } catch (error) {
    console.error("Error generating image:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to generate image",
    };
  }
}
