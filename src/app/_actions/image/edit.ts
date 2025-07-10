"use server";

import { auth } from "@/server/auth";
import { consumeImageEditingCredits, canExecuteAction, checkAndResetCreditsIfNeeded, canUseImageModel } from "@/lib/credit-system";
import { type ImageModelList } from "./generate";
import { utapi } from "@/app/api/uploadthing/core";
import { UTFile } from "uploadthing/server";
import { supabaseAdmin } from "@/lib/supabase";

export interface ImageEditResult {
  success: boolean;
  image?: {
    url: string;
    model: string;
    prompt: string;
    originalImage: string;
  };
  error?: string;
  creditsUsed?: number;
}

interface ImageEditOptions {
  imageUrl: string;
  editPrompt: string;
  model: ImageModelList;
  maskUrl?: string;
}

/**
 * Buscar o modelo original de uma imagem no banco de dados
 */
async function getImageModelFromDatabase(imageUrl: string): Promise<ImageModelList | null> {
  try {
    const { data: generatedImage, error } = await supabaseAdmin
      .from('GeneratedImage')
      .select('model')
      .eq('url', imageUrl)
      .single();

    if (error || !generatedImage) {
  
      return null;
    }


    return generatedImage.model as ImageModelList;
  } catch (error) {
    console.error('Error querying database for image model:', error);
    return null;
  }
}

/**
 * Detectar o modelo original da imagem baseado em metadados ou URL
 */
async function detectOriginalModel(imageUrl: string): Promise<ImageModelList> {

  
  // Primeiro, tentar buscar no banco de dados
  const dbModel = await getImageModelFromDatabase(imageUrl);
  if (dbModel) {

    return dbModel;
  }
  
  // Detectar OpenAI/DALL-E baseado nas URLs dos serviços
  // Quando a imagem original é do DALL-E 3, usar gpt-image-1 para edição
  if (
    imageUrl.includes('oaidalleapiprodscus.blob.core.windows.net') ||
    imageUrl.includes('dalle') || 
    imageUrl.includes('openai') ||
    imageUrl.includes('oai-dalle') ||
    imageUrl.includes('dall-e')
  ) {

    return 'gpt-image-1';
  }
  
  // Detectar Ideogram - URLs específicas do Ideogram
  if (
    imageUrl.includes('ideogram.ai') ||
    imageUrl.includes('ideogram')
  ) {
    console.log('detectOriginalModel: detected Ideogram');
    return 'ideogram-v3-quality';
  }
  
  // Para URLs do UploadThing, precisamos usar metadados armazenados
  // Por enquanto, vamos verificar se veio de uma geração recente do Ideogram
  if (imageUrl.includes('ufs.sh') || imageUrl.includes('uploadthing')) {
    console.log('detectOriginalModel: UploadThing URL detected, no database match found');
    // Fallback inteligente baseado em contexto recente
    // Por padrão, assumir Ideogram V3 já que é o modelo mais comum atualmente
    return 'ideogram-v3-quality';
  }
  
  
  // Detectar Google Imagen
  if (
    imageUrl.includes('google') || 
    imageUrl.includes('imagen') ||
    imageUrl.includes('googleapis.com')
  ) {
    console.log('detectOriginalModel: detected Google Imagen');
    return 'google-imagen-3';
  }
  
  console.log('detectOriginalModel: no specific model detected, using Ideogram V3 Quality as fallback');
  // Fallback para Ideogram V3 Quality (modelo mais popular atualmente)
  return 'ideogram-v3-quality';
}

/**
 * Converter base64 para URL permanente usando UploadThing
 */
async function convertBase64ToUrl(base64Data: string, prompt: string): Promise<string> {
  try {
    console.log('Converting base64 to URL...');
    
    // Remove o prefixo data:image/... se presente
    const base64Only = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;
    
    if (!base64Only) {
      throw new Error('Invalid base64 data');
    }
    
    // Converter base64 para buffer
    const binaryString = atob(base64Only);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    // Criar arquivo para upload
    const filename = `edited_${prompt.substring(0, 20).replace(/[^a-z0-9]/gi, "_")}_${Date.now()}.png`;
    const utFile = new UTFile([bytes], filename);
    
    // Upload para UploadThing
    const uploadResult = await utapi.uploadFiles([utFile]);
    
    if (!uploadResult[0]?.data?.ufsUrl) {
      console.error("Upload error:", uploadResult[0]?.error);
      throw new Error("Failed to upload edited image");
    }
    
    const permanentUrl = uploadResult[0].data.ufsUrl;
    console.log('Base64 converted to URL:', permanentUrl);
    
    return permanentUrl;
  } catch (error) {
    console.error('Error converting base64 to URL:', error);
    throw new Error('Failed to convert base64 image to URL');
  }
}

/**
 * Editar imagem usando OpenAI (DALL-E 3 ou GPT Image 1)
 */
async function editWithOpenAI(options: ImageEditOptions): Promise<ImageEditResult> {
  try {
    console.log('OpenAI Edit: Starting image edit with model:', options.model);
    
    const formData = new FormData();
    
    // Download da imagem original
    console.log('OpenAI Edit: Downloading image from:', options.imageUrl.substring(0, 50) + '...');
    const imageResponse = await fetch(options.imageUrl);
    if (!imageResponse.ok) {
      throw new Error(`Failed to download image: ${imageResponse.statusText}`);
    }
    
    const imageBlob = await imageResponse.blob();
    console.log('OpenAI Edit: Image downloaded, size:', imageBlob.size, 'type:', imageBlob.type);
    
    // OpenAI aceita PNG, JPEG, WEBP até 4MB
    formData.append('image', imageBlob, 'image.png');
    formData.append('prompt', options.editPrompt);
    formData.append('n', '1');
    formData.append('size', '1024x1024');
    
    // Adicionar o modelo específico (dall-e-3 ou gpt-image-1)
    formData.append('model', options.model);
    console.log('OpenAI Edit: Using model:', options.model);
    
    if (options.maskUrl) {
      console.log('OpenAI Edit: Adding mask from:', options.maskUrl);
      const maskResponse = await fetch(options.maskUrl);
      if (!maskResponse.ok) {
        console.warn('OpenAI Edit: Failed to download mask, proceeding without it');
      } else {
        const maskBlob = await maskResponse.blob();
        formData.append('mask', maskBlob, 'mask.png');
      }
    }

    console.log('OpenAI Edit: Sending request to OpenAI API');
    const response = await fetch('https://api.openai.com/v1/images/edits', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI Edit: API error response:', errorText);
      throw new Error(`OpenAI API error: ${response.statusText} - ${errorText}`);
    }

    const result = await response.json();
    console.log('OpenAI Edit: Full API response:', JSON.stringify(result, null, 2));
    
    // Verificar se a resposta tem a estrutura esperada
    if (!result.data || !Array.isArray(result.data) || result.data.length === 0) {
      throw new Error('Invalid response structure from OpenAI API');
    }
    
    let finalImageUrl: string;
    const rawImageData = result.data[0]?.url || result.data[0]?.b64_json;
    
    if (!rawImageData) {
      throw new Error('No image data in OpenAI API response');
    }
    
    // Verificar se é base64 ou URL
    if (rawImageData.startsWith('data:image/') || !rawImageData.startsWith('http')) {
      console.log('OpenAI Edit: Converting base64 to permanent URL...');
      finalImageUrl = await convertBase64ToUrl(rawImageData, options.editPrompt);
    } else {
      console.log('OpenAI Edit: Using URL from response:', rawImageData.substring(0, 50) + '...');
      finalImageUrl = rawImageData;
    }
    
    console.log('OpenAI Edit: Success! Final image URL:', finalImageUrl.substring(0, 50) + '...');
    
    return {
      success: true,
      image: {
        url: finalImageUrl,
        model: options.model,
        prompt: options.editPrompt,
        originalImage: options.imageUrl,
      },
    };
  } catch (error) {
    console.error('Error editing with OpenAI:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Editar imagem usando Ideogram V3 ou Remix se não houver máscara
 */
async function editWithIdeogram(options: ImageEditOptions): Promise<ImageEditResult> {
  try {
    console.log('Ideogram Edit: Starting edit with model:', options.model);
    console.log('Ideogram Edit: Edit prompt received:', options.editPrompt);
    
    // Se não tiver máscara, usamos o endpoint de remix que é mais flexível
    if (!options.maskUrl) {
      return await editWithIdeogramRemix(options);
    }
    
    const formData = new FormData();
    
    // Download da imagem original
    console.log('Ideogram Edit: Downloading image from:', options.imageUrl.substring(0, 50) + '...');
    const imageResponse = await fetch(options.imageUrl);
    if (!imageResponse.ok) {
      throw new Error(`Failed to download image: ${imageResponse.statusText}`);
    }
    const imageBlob = await imageResponse.blob();
    console.log('Ideogram Edit: Image downloaded, size:', imageBlob.size);
    
    formData.append('image', imageBlob, 'image.png');
    formData.append('prompt', options.editPrompt);
    formData.append('rendering_speed', 'TURBO');
    formData.append('magic_prompt', 'AUTO');
    
    // Download da máscara
    console.log('Ideogram Edit: Downloading mask from:', options.maskUrl);
    const maskResponse = await fetch(options.maskUrl);
    if (!maskResponse.ok) {
      throw new Error(`Failed to download mask: ${maskResponse.statusText}`);
    }
    const maskBlob = await maskResponse.blob();
    formData.append('mask', maskBlob, 'mask.png');

    console.log('Ideogram Edit: Sending request to Ideogram V3 edit API');
    const response = await fetch('https://api.ideogram.ai/v1/ideogram-v3/edit', {
      method: 'POST',
      headers: {
        'Api-Key': process.env.IDEOGRAM_API_KEY || '',
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Ideogram Edit: API error response:', errorText);
      throw new Error(`Ideogram API error: ${response.statusText} - ${errorText}`);
    }

    const result = await response.json();
    console.log('Ideogram Edit: API response:', result);
    
    if (!result.data || !result.data[0] || !result.data[0].url) {
      throw new Error('Invalid response from Ideogram API');
    }

    // Converter para URL permanente
    const permanentUrl = await convertBase64ToUrl(result.data[0].url, options.editPrompt);
    
    return {
      success: true,
      image: {
        url: permanentUrl,
        model: options.model,
        prompt: options.editPrompt,
        originalImage: options.imageUrl,
      },
    };
  } catch (error) {
    console.error('Error editing with Ideogram:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Usar Ideogram Describe API para obter contexto da imagem
 */
async function describeImageWithIdeogram(imageBlob: Blob): Promise<string> {
  try {
    const formData = new FormData();
    formData.append('image', imageBlob, 'image.png');

    const response = await fetch('https://api.ideogram.ai/describe', {
      method: 'POST',
      headers: {
        'Api-Key': process.env.IDEOGRAM_API_KEY || '',
      },
      body: formData,
    });

    if (!response.ok) {
      console.warn('Ideogram Describe failed, will use basic context');
      return '';
    }

    const result = await response.json();
    if (result.description) {
      console.log('Ideogram Describe: Got description:', result.description);
      return result.description;
    }
    
    return '';
  } catch (error) {
    console.warn('Error describing image with Ideogram:', error);
    return '';
  }
}

/**
 * Editar imagem usando Ideogram Remix (quando não há máscara)
 */
async function editWithIdeogramRemix(options: ImageEditOptions): Promise<ImageEditResult> {
  try {
    console.log('Ideogram Remix: Starting remix with model:', options.model);
    console.log('Ideogram Remix: Edit prompt:', options.editPrompt);
    
    // Download da imagem original
    console.log('Ideogram Remix: Downloading image from:', options.imageUrl.substring(0, 50) + '...');
    const imageResponse = await fetch(options.imageUrl);
    if (!imageResponse.ok) {
      throw new Error(`Failed to download image: ${imageResponse.statusText}`);
    }
    const imageBlob = await imageResponse.blob();
    console.log('Ideogram Remix: Image downloaded, size:', imageBlob.size);
    
    const formData = new FormData();
    
    // Usar parâmetros corretos da API V3 do Ideogram
    formData.append('image', imageBlob, 'image.png');
    
    // Usar o prompt exato do usuário - o Remix deve interpretar automaticamente como edição
    console.log('Ideogram Remix: Using user prompt directly:', options.editPrompt);
    
    formData.append('prompt', options.editPrompt);
    formData.append('image_weight', '95'); // Máximo peso na imagem original (1-100)
    formData.append('rendering_speed', 'TURBO');
    formData.append('magic_prompt', 'OFF'); // Controle total sobre o prompt
    formData.append('num_images', '1');

    console.log('Ideogram Remix: Sending request to Ideogram V3 remix API');
    console.log('Ideogram Remix: FormData contents:', {
      prompt: options.editPrompt,
      image_weight: '95',
      rendering_speed: 'TURBO',
      magic_prompt: 'OFF',
      num_images: '1'
    });
    
    const response = await fetch('https://api.ideogram.ai/v1/ideogram-v3/remix', {
      method: 'POST',
      headers: {
        'Api-Key': process.env.IDEOGRAM_API_KEY || '',
        // Não definir Content-Type para multipart/form-data - deixar o browser fazer
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Ideogram Remix: API error response:', errorText);
      throw new Error(`Ideogram Remix API error: ${response.statusText} - ${errorText}`);
    }

    const result = await response.json();
    console.log('Ideogram Remix: API response:', result);
    
    if (!result.data || !result.data[0] || !result.data[0].url) {
      throw new Error('Invalid response from Ideogram Remix API');
    }

    // A URL do Ideogram é temporária, precisamos baixar e fazer upload permanente
    const imageUrl = result.data[0].url;
    console.log('Ideogram Remix: Downloading result image:', imageUrl);
    
    const finalImageResponse = await fetch(imageUrl);
    if (!finalImageResponse.ok) {
      throw new Error('Failed to download generated image');
    }
    
    const finalImageBlob = await finalImageResponse.blob();
    const imageBuffer = await finalImageBlob.arrayBuffer();
    const filename = `ideogram_remix_${options.editPrompt.substring(0, 20).replace(/[^a-z0-9]/gi, "_")}_${Date.now()}.png`;
    const utFile = new UTFile([new Uint8Array(imageBuffer)], filename);

    const uploadResult = await utapi.uploadFiles([utFile]);
    if (!uploadResult[0]?.data?.ufsUrl) {
      console.error("Upload error:", uploadResult[0]?.error);
      throw new Error("Failed to upload edited image");
    }

    const permanentUrl = uploadResult[0].data.ufsUrl;
    console.log('Ideogram Remix: Uploaded to permanent URL:', permanentUrl);
    
    return {
      success: true,
      image: {
        url: permanentUrl,
        model: options.model,
        prompt: options.editPrompt,
        originalImage: options.imageUrl,
      },
    };
  } catch (error) {
    console.error('Error editing with Ideogram Remix:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}


/**
 * Action principal para edição de imagens
 */
export async function editImageAction(
  imageUrl: string,
  editPrompt: string,
  model?: ImageModelList,
  maskUrl?: string
): Promise<ImageEditResult> {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false,
      error: "Você deve estar logado para editar imagens",
    };
  }

  await checkAndResetCreditsIfNeeded(session.user.id);

  // Sempre usar GPT Image 1 para edições (funciona melhor que outros modelos)
  const targetModel = 'gpt-image-1';
  
  console.log('Image Edit Debug:', {
    imageUrl: imageUrl.substring(0, 100) + '...',
    originalModel: model || 'auto-detected',
    usingModel: targetModel,
    editPrompt: editPrompt,
  });

  // Verificar se o usuário tem créditos suficientes para edição de imagem (20 créditos)
  const creditCheck = await canExecuteAction(session.user.id, 'IMAGE_EDITING');
  
  if (!creditCheck.allowed) {
    return {
      success: false,
      error: `Créditos insuficientes. Necessário: ${creditCheck.cost}, disponível: ${creditCheck.currentCredits}`,
    };
  }

  try {
    // Sempre usar OpenAI (GPT Image 1) para edições
    console.log('Using OpenAI GPT Image 1 for image editing');
    const result = await editWithOpenAI({ imageUrl, editPrompt, model: targetModel, maskUrl });

    if (result.success) {
      // Consumir créditos para edição de imagem
      const consumeResult = await consumeImageEditingCredits(session.user.id);
      
      if (!consumeResult.success) {
        console.error('Error consuming credits:', consumeResult.message);
      }

      result.creditsUsed = creditCheck.cost;
    }

    return result;
  } catch (error) {
    console.error('Error in editImageAction:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro interno do servidor",
    };
  }
}
