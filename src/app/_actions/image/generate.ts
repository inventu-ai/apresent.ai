"use server";

import { env } from "@/env";
import { supabaseAdmin } from "@/lib/supabase";
import { auth } from "@/server/auth";
import { utapi } from "@/app/api/uploadthing/core";
import { UTFile } from "uploadthing/server";
import { randomUUID } from "crypto";
import { canConsumeCredits, consumeCredits, canUseImageQuality, checkAndResetCreditsIfNeeded, canUseImageModel, consumeImageModelCredits, type CreditAction } from "@/lib/credit-system";

// Helper function to convert aspect ratio to Ideogram format
function convertToIdeogramAspectRatio(aspectRatio: string): string {
  const aspectMap: Record<string, string> = {
    "4:3": "ASPECT_4_3",
    "16:9": "ASPECT_16_9", 
    "1:1": "ASPECT_1_1",
    "3:4": "ASPECT_3_4",
    "9:16": "ASPECT_9_16"
  };
  return aspectMap[aspectRatio] || "ASPECT_4_3";
}

export type ImageModelList =
  | "midjourney-imagine"
  | "flux-pro"
  | "flux-dev"
  | "flux-pro-1.1"
  | "flux-pro-1.1-ultra"
  | "flux-fast-1.1"
  | "ideogram-v2"
  | "ideogram-v2-turbo"
  | "ideogram-v3"
  | "dall-e-3"
  | "google-imagen-3"
  | "google-imagen-3-fast"
  | "gpt-image-1";

// APIFrame implementation for Midjourney and Flux models
async function generateWithAPIFrame(prompt: string, model: string, aspectRatio: string = "4:3"): Promise<string> {
  // Validate API key
  if (!env.APIFRAME_API_KEY) {
    throw new Error("APIFRAME_API_KEY is not configured");
  }

  const modelMap: Record<string, string> = {
    "midjourney-imagine": "midjourney",
    "flux-pro": "flux-pro",
    "flux-dev": "flux-dev",
    "flux-pro-1.1": "flux-pro-1.1",
    "flux-pro-1.1-ultra": "flux-pro-1.1-ultra"
  };

  const apiModel = modelMap[model];
  if (!apiModel) {
    throw new Error(`Unsupported APIFrame model: ${model}`);
  }

  console.log(`APIFrame: Starting generation with model ${apiModel}, prompt: "${prompt.substring(0, 50)}..."`);

  const requestBody = {
    prompt,
    model: apiModel,
    aspect_ratio: aspectRatio
  };

  console.log(`APIFrame: Request body:`, requestBody);

  // Start generation
  const generateResponse = await fetch("https://api.apiframe.pro/imagine", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${env.APIFRAME_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  console.log(`APIFrame: Generation response status: ${generateResponse.status}`);

  if (!generateResponse.ok) {
    const errorText = await generateResponse.text();
    console.error(`APIFrame: Generation failed with status ${generateResponse.status}:`, errorText);
    
    // Parse error for better debugging
    try {
      const errorObj = JSON.parse(errorText);
      if (errorObj.errors && errorObj.errors[0]?.msg) {
        const errorMsg = errorObj.errors[0].msg;
        if (errorMsg.includes("内部错误") || errorMsg.includes("Internal error")) {
          throw new Error(`APIFrame internal error. This may be due to: API key issues, account credits, or temporary service problems. Original error: ${errorText}`);
        }
      }
    } catch (parseError) {
      // If can't parse, use original error
    }
    
    throw new Error(`APIFrame generation failed: ${errorText}`);
  }

  const generateResult = await generateResponse.json();
  console.log(`APIFrame: Generation result:`, generateResult);
  
  const taskId = generateResult.id;

  if (!taskId) {
    console.error(`APIFrame: No task ID in response:`, generateResult);
    throw new Error("No task ID received from APIFrame");
  }

  console.log(`APIFrame: Starting polling for task ${taskId}`);

  // Poll for completion
  let attempts = 0;
  const maxAttempts = 60; // 5 minutes with 5-second intervals
  
  while (attempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
    
    console.log(`APIFrame: Polling attempt ${attempts + 1}/${maxAttempts} for task ${taskId}`);
    
    const statusResponse = await fetch(`https://api.apiframe.pro/imagine/${taskId}`, {
      headers: {
        "Authorization": `Bearer ${env.APIFRAME_API_KEY}`,
      },
    });

    if (!statusResponse.ok) {
      console.error(`APIFrame: Status check failed with status ${statusResponse.status}`);
      throw new Error(`APIFrame status check failed: ${statusResponse.statusText}`);
    }

    const statusResult = await statusResponse.json();
    console.log(`APIFrame: Status result:`, statusResult);
    
    if (statusResult.status === "completed" && statusResult.result?.image_url) {
      console.log(`APIFrame: Generation completed successfully. Image URL: ${statusResult.result.image_url}`);
      return statusResult.result.image_url;
    }
    
    if (statusResult.status === "failed") {
      console.error(`APIFrame: Generation failed:`, statusResult);
      throw new Error(`APIFrame generation failed: ${statusResult.error || statusResult.message || "Unknown error"}`);
    }
    
    // Log current status for debugging
    console.log(`APIFrame: Current status: ${statusResult.status}, waiting...`);
    
    attempts++;
  }
  
  console.error(`APIFrame: Generation timed out after ${maxAttempts} attempts`);
  throw new Error("APIFrame generation timed out");
}

// Ideogram implementation
async function generateWithIdeogram(prompt: string, model: string, aspectRatio: string = "4:3"): Promise<string> {
  const modelMap: Record<string, { endpoint: string, modelName: string }> = {
    "ideogram-v2": { endpoint: "generate", modelName: "V_2" },
    "ideogram-v2-turbo": { endpoint: "generate", modelName: "V_2_TURBO" },
    "ideogram-v3": { endpoint: "generate", modelName: "V_3" }
  };

  const config = modelMap[model];
  if (!config) {
    throw new Error(`Unsupported Ideogram model: ${model}`);
  }

  // Convert aspect ratio to Ideogram format
  const ideogramAspectRatio = convertToIdeogramAspectRatio(aspectRatio);
  
  let requestBody;
  const headers: Record<string, string> = {
    "Api-Key": env.IDEOGRAM_API_KEY,
  };

  if (model === "ideogram-v3") {
    // V3 uses FormData with improved parameters
    const formData = new FormData();
    formData.append("prompt", prompt);
    formData.append("aspect_ratio", ideogramAspectRatio);
    formData.append("style_type", "AUTO"); // Let Ideogram choose best style
    formData.append("magic_prompt", "AUTO"); // Enhanced prompt processing
    
    requestBody = formData;
  } else {
    // V2 and V2 Turbo use JSON with improved parameters
    headers["Content-Type"] = "application/json";
    requestBody = JSON.stringify({
      image_request: {
        prompt,
        model: config.modelName,
        aspect_ratio: ideogramAspectRatio,
        magic_prompt_option: "AUTO", // Enhanced prompt processing for better results
        style_type: "AUTO" // Automatic style selection
      }
    });
  }

  // Use the correct API endpoint based on the model version
  const apiUrl = model === "ideogram-v3" 
    ? `https://api.ideogram.ai/v1/ideogram-v3/generate`
    : `https://api.ideogram.ai/generate`;
    
  console.log(`Making request to Ideogram API: ${apiUrl}`);
  
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
  const { GoogleAuth } = await import("google-auth-library");
  
  if (!env.GOOGLE_CLOUD_PROJECT_ID) {
    throw new Error("GOOGLE_CLOUD_PROJECT_ID not configured");
  }

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
    // Initialize authentication
    let auth;
    if (env.GOOGLE_APPLICATION_CREDENTIALS) {
      auth = new GoogleAuth({
        keyFile: env.GOOGLE_APPLICATION_CREDENTIALS,
        scopes: ["https://www.googleapis.com/auth/cloud-platform"],
      });
    } else {
      // Try Application Default Credentials
      auth = new GoogleAuth({
        scopes: ["https://www.googleapis.com/auth/cloud-platform"],
      });
    }

    const authClient = await auth.getClient();
    const accessToken = await authClient.getAccessToken();

    if (!accessToken.token) {
      throw new Error("Failed to obtain access token");
    }

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
        "Authorization": `Bearer ${accessToken.token}`,
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

export async function generateImageAction(
  prompt: string,
  model: ImageModelList = "flux-dev",
  quality: CreditAction = "BASIC_IMAGE", 
  aspectRatio: "4:3" | "16:9" | "1:1" | "3:4" | "9:16" = "4:3"
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

  const creditCheck = await canConsumeCredits(session.user.id, quality, 1);
  if (!creditCheck.allowed) {
    return {
      success: false,
      error: creditCheck.message || "Créditos insuficientes",
      creditsNeeded: creditCheck.cost,
      currentCredits: creditCheck.currentCredits,
    };
  }

  try {
    console.log(`Generating image with model: ${model}, quality: ${quality}`);

    const creditResult = await consumeCredits(session.user.id, quality, 1);
    if (!creditResult.success) {
      return {
        success: false,
        error: creditResult.message || "Erro ao consumir créditos",
      };
    }

    console.log(`Credits consumed: ${creditResult.creditsUsed}, remaining: ${creditResult.remainingCredits}`);

    let imageUrl: string;

    // Route to appropriate API based on model
    if (["midjourney-imagine", "flux-pro", "flux-dev", "flux-pro-1.1", "flux-pro-1.1-ultra", "flux-fast-1.1"].includes(model)) {
      imageUrl = await generateWithAPIFrame(prompt, model, aspectRatio);
    } else if (["ideogram-v2", "ideogram-v2-turbo", "ideogram-v3"].includes(model)) {
      imageUrl = await generateWithIdeogram(prompt, model, aspectRatio);
    } else if (["dall-e-3", "gpt-image-1"].includes(model)) {
      imageUrl = await generateWithOpenAI(prompt, model);
    } else if (model === "google-imagen-3") {
      imageUrl = await generateWithGoogleImagen(prompt, aspectRatio, false);
    } else if (model === "google-imagen-3-fast") {
      imageUrl = await generateWithGoogleImagen(prompt, aspectRatio, true);
    } else {
      throw new Error(`Unsupported model: ${model}`);
    }

    console.log(`Generated image URL: ${imageUrl}`);

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
    console.log(`Uploaded to UploadThing URL: ${permanentUrl}`);

    const { data: generatedImage, error } = await supabaseAdmin
      .from('GeneratedImage')
      .insert({
        id: randomUUID(),
        url: permanentUrl,
        prompt: prompt,
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
      creditsUsed: creditResult.creditsUsed,
      remainingCredits: creditResult.remainingCredits,
      quality,
    };
  } catch (error) {
    console.error("Error generating image:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to generate image",
    };
  }
}
