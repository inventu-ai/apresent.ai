"use server";

import { env } from "@/env";
import { supabaseAdmin } from "@/lib/supabase";
import { auth } from "@/server/auth";
import { utapi } from "@/app/api/uploadthing/core";
import { UTFile } from "uploadthing/server";
import { randomUUID } from "crypto";
import { canConsumeCredits, consumeCredits, canUseImageQuality, checkAndResetCreditsIfNeeded, type CreditAction } from "@/lib/credit-system";

export type ImageModelList =
  | "midjourney-imagine"
  | "flux-pro"
  | "flux-dev"
  | "flux-pro-1.1"
  | "flux-pro-1.1-ultra"
  | "ideogram-v2"
  | "ideogram-v2-turbo"
  | "ideogram-v3"
  | "dall-e-3"
  | "gpt-image-1"
  | "google-imagen-3";

// APIFrame implementation for Midjourney and Flux models
async function generateWithAPIFrame(prompt: string, model: string): Promise<string> {
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

  // Start generation
  const generateResponse = await fetch("https://api.apiframe.pro/imagine", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${env.APIFRAME_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt,
      model: apiModel,
      aspect_ratio: "4:3"
    }),
  });

  if (!generateResponse.ok) {
    const errorText = await generateResponse.text();
    throw new Error(`APIFrame generation failed: ${errorText}`);
  }

  const generateResult = await generateResponse.json();
  const taskId = generateResult.id;

  if (!taskId) {
    throw new Error("No task ID received from APIFrame");
  }

  // Poll for completion
  let attempts = 0;
  const maxAttempts = 60; // 5 minutes with 5-second intervals
  
  while (attempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
    
    const statusResponse = await fetch(`https://api.apiframe.pro/imagine/${taskId}`, {
      headers: {
        "Authorization": `Bearer ${env.APIFRAME_API_KEY}`,
      },
    });

    if (!statusResponse.ok) {
      throw new Error(`APIFrame status check failed: ${statusResponse.statusText}`);
    }

    const statusResult = await statusResponse.json();
    
    if (statusResult.status === "completed" && statusResult.result?.image_url) {
      return statusResult.result.image_url;
    }
    
    if (statusResult.status === "failed") {
      throw new Error(`APIFrame generation failed: ${statusResult.error || "Unknown error"}`);
    }
    
    attempts++;
  }
  
  throw new Error("APIFrame generation timed out");
}

// Ideogram implementation
async function generateWithIdeogram(prompt: string, model: string): Promise<string> {
  const modelMap: Record<string, { endpoint: string, modelName: string }> = {
    "ideogram-v2": { endpoint: "v1/ideogram/generate", modelName: "V_2" },
    "ideogram-v2-turbo": { endpoint: "v1/ideogram/generate", modelName: "V_2_TURBO" },
    "ideogram-v3": { endpoint: "v1/ideogram-v3/generate", modelName: "V_3" }
  };

  const config = modelMap[model];
  if (!config) {
    throw new Error(`Unsupported Ideogram model: ${model}`);
  }

  let requestBody;
  let headers: Record<string, string> = {
    "Api-Key": env.IDEOGRAM_API_KEY,
  };

  if (model === "ideogram-v3") {
    // V3 uses FormData
    const formData = new FormData();
    formData.append("prompt", prompt);
    formData.append("model", config.modelName);
    formData.append("aspect_ratio", "ASPECT_4_3");
    
    requestBody = formData;
  } else {
    // V2 and V2 Turbo use JSON
    headers["Content-Type"] = "application/json";
    requestBody = JSON.stringify({
      image_request: {
        prompt,
        model: config.modelName,
        aspect_ratio: "ASPECT_4_3"
      }
    });
  }

  const response = await fetch(`https://api.ideogram.ai/${config.endpoint}`, {
    method: "POST",
    headers,
    body: requestBody,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Ideogram generation failed: ${errorText}`);
  }

  const result = await response.json();
  const imageUrl = result.data?.[0]?.url;

  if (!imageUrl) {
    throw new Error("No image URL received from Ideogram");
  }

  return imageUrl;
}

// OpenAI implementation
async function generateWithOpenAI(prompt: string, model: string): Promise<string> {
  const modelMap: Record<string, string> = {
    "dall-e-3": "dall-e-3",
    "gpt-image-1": "gpt-4o-mini" // GPT Image 1 model
  };

  const openaiModel = modelMap[model];
  if (!openaiModel) {
    throw new Error(`Unsupported OpenAI model: ${model}`);
  }

  let response;

  if (model === "gpt-image-1") {
    // GPT Image 1 uses chat completions with image generation
    response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Generate an image: ${prompt}`
              }
            ]
          }
        ],
        max_tokens: 300
      }),
    });
  } else {
    // DALL-E 3 uses images endpoint
    response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: openaiModel,
        prompt,
        n: 1,
        size: "1024x1024",
        response_format: "url"
      }),
    });
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI generation failed: ${errorText}`);
  }

  const result = await response.json();
  
  if (model === "gpt-image-1") {
    // Extract base64 image from GPT response
    const content = result.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error("No content received from GPT Image 1");
    }
    
    // GPT Image 1 returns base64 data
    const base64Match = content.match(/data:image\/[^;]+;base64,([^"]+)/);
    if (!base64Match) {
      throw new Error("No base64 image found in GPT Image 1 response");
    }
    
    return `data:image/png;base64,${base64Match[1]}`;
  } else {
    // DALL-E 3 returns URL
    const imageUrl = result.data?.[0]?.url;
    if (!imageUrl) {
      throw new Error("No image URL received from OpenAI");
    }
    return imageUrl;
  }
}

// Google Cloud Imagen implementation (structure ready)
async function generateWithGoogleImagen(prompt: string): Promise<string> {
  // Note: This requires OAuth2 authentication setup
  throw new Error("Google Cloud Imagen requires OAuth2 authentication setup");
}

export async function generateImageAction(
  prompt: string,
  model: ImageModelList = "flux-dev",
  quality: CreditAction = "BASIC_IMAGE"
) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("You must be logged in to generate images");
  }

  await checkAndResetCreditsIfNeeded(session.user.id);

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
    if (["midjourney-imagine", "flux-pro", "flux-dev", "flux-pro-1.1", "flux-pro-1.1-ultra"].includes(model)) {
      imageUrl = await generateWithAPIFrame(prompt, model);
    } else if (["ideogram-v2", "ideogram-v2-turbo", "ideogram-v3"].includes(model)) {
      imageUrl = await generateWithIdeogram(prompt, model);
    } else if (["dall-e-3", "gpt-image-1"].includes(model)) {
      imageUrl = await generateWithOpenAI(prompt, model);
    } else if (model === "google-imagen-3") {
      imageUrl = await generateWithGoogleImagen(prompt);
    } else {
      throw new Error(`Unsupported model: ${model}`);
    }

    console.log(`Generated image URL: ${imageUrl}`);

    let imageBlob: Blob;

    // Handle different response formats
    if (imageUrl.startsWith('data:image/')) {
      // Base64 data (from GPT Image 1 or Google Imagen)
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
