"use server";

import { env } from "@/env";
import Together from "together-ai";
import { supabaseAdmin } from "@/lib/supabase";
import { auth } from "@/server/auth";
import { utapi } from "@/app/api/uploadthing/core";
import { UTFile } from "uploadthing/server";
import { randomUUID } from "crypto";
import { canConsumeCredits, consumeCredits, canUseImageQuality, checkAndResetCreditsIfNeeded, type CreditAction } from "@/lib/credit-system";

const together = new Together({ apiKey: env.TOGETHER_AI_API_KEY });

export type ImageModelList =
  | "black-forest-labs/FLUX1.1-pro"
  | "black-forest-labs/FLUX.1-schnell"
  | "black-forest-labs/FLUX.1-schnell-Free"
  | "black-forest-labs/FLUX.1-pro"
  | "black-forest-labs/FLUX.1-dev";

export async function generateImageAction(
  prompt: string,
  model: ImageModelList = "black-forest-labs/FLUX.1-schnell-Free",
  quality: CreditAction = "BASIC_IMAGE"
) {
  // Get the current session
  const session = await auth();

  // Check if user is authenticated
  if (!session?.user?.id) {
    throw new Error("You must be logged in to generate images");
  }

  // Verificar se precisa resetar créditos
  await checkAndResetCreditsIfNeeded(session.user.id);

  // Verificar se o usuário pode usar esta qualidade de imagem
  const qualityCheck = await canUseImageQuality(session.user.id, quality);
  if (!qualityCheck.allowed) {
    return {
      success: false,
      error: qualityCheck.message || "Qualidade de imagem não disponível no seu plano",
    };
  }

  // Verificar se o usuário tem créditos suficientes
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

    // Consumir créditos antes da geração
    const creditResult = await consumeCredits(session.user.id, quality, 1);
    if (!creditResult.success) {
      return {
        success: false,
        error: creditResult.message || "Erro ao consumir créditos",
      };
    }

    console.log(`Credits consumed: ${creditResult.creditsUsed}, remaining: ${creditResult.remainingCredits}`);

    // Generate the image using Together AI
    const response = (await together.images.create({
      model: model,
      prompt: prompt,
      width: 1024,
      height: 768,
      steps: model.includes("schnell") ? 4 : 28, // Fewer steps for schnell models
      n: 1,
    })) as unknown as {
      id: string;
      model: string;
      object: string;
      data: {
        url: string;
      }[];
    };

    const imageUrl = response.data[0]?.url;

    if (!imageUrl) {
      throw new Error("Failed to generate image");
    }

    console.log(`Generated image URL: ${imageUrl}`);

    // Download the image from Together AI URL
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error("Failed to download image from Together AI");
    }

    const imageBlob = await imageResponse.blob();
    const imageBuffer = await imageBlob.arrayBuffer();

    // Generate a filename based on the prompt
    const filename = `${prompt.substring(0, 20).replace(/[^a-z0-9]/gi, "_")}_${Date.now()}.png`;

    // Create a UTFile from the downloaded image
    const utFile = new UTFile([new Uint8Array(imageBuffer)], filename);

    // Upload to UploadThing
    const uploadResult = await utapi.uploadFiles([utFile]);

    if (!uploadResult[0]?.data?.ufsUrl) {
      console.error("Upload error:", uploadResult[0]?.error);
      throw new Error("Failed to upload image to UploadThing");
    }

    console.log(uploadResult);
    const permanentUrl = uploadResult[0].data.ufsUrl;
    console.log(`Uploaded to UploadThing URL: ${permanentUrl}`);

    // Store in database with the permanent URL using Supabase
    const { data: generatedImage, error } = await supabaseAdmin
      .from('GeneratedImage')
      .insert({
        id: randomUUID(),
        url: permanentUrl, // Store the UploadThing URL instead of the Together AI URL
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
      error:
        error instanceof Error ? error.message : "Failed to generate image",
    };
  }
}
