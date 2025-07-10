/**
 * Sistema de fallback inteligente para modelos de IA de imagem
 * Converte automaticamente entre modelos quando há falhas
 */

import type { ImageModelList } from "@/app/_actions/image/generate";
import { convertToIdeogramV2, convertToIdeogramV3, type AspectRatio, normalizeAspectRatio } from "./aspect-ratio-converter";

export interface FallbackConfig {
  fallbackModel: ImageModelList;
  aspectRatioConverter: (originalRatio: AspectRatio) => string;
  description: string;
}

/**
 * Mapeamento de fallback para modelos Google Imagen
 */
export const FALLBACK_MAPPING: Record<string, FallbackConfig> = {
  "google-imagen-3-fast": {
    fallbackModel: "ideogram-v2-turbo",
    aspectRatioConverter: convertToIdeogramV2,
    description: "Google Imagen 3 Fast → Ideogram V2 Turbo"
  },
  "google-imagen-3": {
    fallbackModel: "ideogram-v2-turbo", 
    aspectRatioConverter: convertToIdeogramV2,
    description: "Google Imagen 3 → Ideogram v2 Turbo"
  }
};

/**
 * Verifica se um modelo tem fallback configurado
 */
export function hasFallback(model: ImageModelList): boolean {
  return model in FALLBACK_MAPPING;
}

/**
 * Obtém configuração de fallback para um modelo
 */
export function getFallbackConfig(model: ImageModelList): FallbackConfig | null {
  return FALLBACK_MAPPING[model] || null;
}

/**
 * Executa fallback automático para um modelo
 */
export async function executeFallback(
  originalModel: ImageModelList,
  prompt: string,
  aspectRatio: string,
  generateFunction: (prompt: string, model: string, aspectRatio: string) => Promise<string>
): Promise<{
  success: boolean;
  imageUrl?: string;
  fallbackModel?: ImageModelList;
  convertedAspectRatio?: string;
  error?: string;
}> {
  const fallbackConfig = getFallbackConfig(originalModel);
  
  if (!fallbackConfig) {
    return {
      success: false,
      error: `Nenhum fallback configurado para o modelo ${originalModel}`
    };
  }

  try {
    // Normaliza e converte aspect ratio
    const normalizedRatio = normalizeAspectRatio(aspectRatio);
    const convertedAspectRatio = fallbackConfig.aspectRatioConverter(normalizedRatio);
    
    console.log(`🔄 Executando fallback: ${fallbackConfig.description}`);
    console.log(`📐 Convertendo aspect ratio: ${aspectRatio} → ${convertedAspectRatio}`);
    
    // Executa geração com modelo de fallback
    const imageUrl = await generateFunction(prompt, fallbackConfig.fallbackModel, convertedAspectRatio);
    
    console.log(`✅ Fallback bem-sucedido: ${originalModel} → ${fallbackConfig.fallbackModel}`);
    
    return {
      success: true,
      imageUrl,
      fallbackModel: fallbackConfig.fallbackModel,
      convertedAspectRatio
    };
    
  } catch (error) {
    console.error(`❌ Fallback falhou para ${originalModel}:`, error);
    
    return {
      success: false,
      fallbackModel: fallbackConfig.fallbackModel,
      error: error instanceof Error ? error.message : 'Erro desconhecido no fallback'
    };
  }
}

/**
 * Executa geração com fallback automático
 */
export async function generateWithFallback(
  model: ImageModelList,
  prompt: string,
  aspectRatio: string,
  generateFunction: (prompt: string, model: string, aspectRatio: string) => Promise<string>
): Promise<{
  success: boolean;
  imageUrl?: string;
  modelUsed: ImageModelList;
  aspectRatioUsed: string;
  wasFallback: boolean;
  fallbackReason?: string;
  error?: string;
}> {
  try {
    // Primeira tentativa com modelo original
    console.log(`🎯 Tentando geração com modelo original: ${model}`);
    const imageUrl = await generateFunction(prompt, model, aspectRatio);
    
    return {
      success: true,
      imageUrl,
      modelUsed: model,
      aspectRatioUsed: aspectRatio,
      wasFallback: false
    };
    
  } catch (originalError) {
    console.warn(`⚠️ Modelo original ${model} falhou:`, originalError);
    
    // Verifica se tem fallback disponível
    if (!hasFallback(model)) {
      return {
        success: false,
        modelUsed: model,
        aspectRatioUsed: aspectRatio,
        wasFallback: false,
        error: `Modelo ${model} falhou e não tem fallback configurado: ${originalError instanceof Error ? originalError.message : 'Erro desconhecido'}`
      };
    }
    
    // Executa fallback
    const fallbackResult = await executeFallback(model, prompt, aspectRatio, generateFunction);
    
    if (fallbackResult.success) {
      return {
        success: true,
        imageUrl: fallbackResult.imageUrl!,
        modelUsed: fallbackResult.fallbackModel!,
        aspectRatioUsed: fallbackResult.convertedAspectRatio!,
        wasFallback: true,
        fallbackReason: `Modelo original ${model} falhou: ${originalError instanceof Error ? originalError.message : 'Erro desconhecido'}`
      };
    } else {
      return {
        success: false,
        modelUsed: model,
        aspectRatioUsed: aspectRatio,
        wasFallback: true,
        error: `Tanto modelo original quanto fallback falharam. Original: ${originalError instanceof Error ? originalError.message : 'Erro desconhecido'}. Fallback: ${fallbackResult.error}`
      };
    }
  }
}

/**
 * Obtém lista de todos os modelos com fallback
 */
export function getModelsWithFallback(): ImageModelList[] {
  return Object.keys(FALLBACK_MAPPING) as ImageModelList[];
}

/**
 * Obtém informações sobre todos os fallbacks configurados
 */
export function getAllFallbackInfo(): Array<{
  originalModel: ImageModelList;
  fallbackModel: ImageModelList;
  description: string;
}> {
  return Object.entries(FALLBACK_MAPPING).map(([originalModel, config]) => ({
    originalModel: originalModel as ImageModelList,
    fallbackModel: config.fallbackModel,
    description: config.description
  }));
}

/**
 * Valida se uma configuração de fallback é válida
 */
export function validateFallbackConfig(
  originalModel: ImageModelList,
  config: FallbackConfig
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Verifica se modelo de fallback é diferente do original
  if (originalModel === config.fallbackModel) {
    errors.push("Modelo de fallback não pode ser igual ao modelo original");
  }
  
  // Verifica se modelo de fallback não tem fallback circular
  if (hasFallback(config.fallbackModel)) {
    errors.push("Modelo de fallback não pode ter seu próprio fallback (evita loops)");
  }
  
  // Testa conversão de aspect ratio
  try {
    const testRatio = normalizeAspectRatio("16:9");
    config.aspectRatioConverter(testRatio);
  } catch (error) {
    errors.push(`Erro na função de conversão de aspect ratio: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Adiciona novo fallback dinamicamente (para testes ou configuração)
 */
export function addFallback(
  originalModel: ImageModelList,
  config: FallbackConfig
): { success: boolean; errors?: string[] } {
  const validation = validateFallbackConfig(originalModel, config);
  
  if (!validation.valid) {
    return {
      success: false,
      errors: validation.errors
    };
  }
  
  FALLBACK_MAPPING[originalModel] = config;
  console.log(`✅ Fallback adicionado: ${originalModel} → ${config.fallbackModel}`);
  
  return { success: true };
}

/**
 * Remove fallback de um modelo
 */
export function removeFallback(originalModel: ImageModelList): boolean {
  if (originalModel in FALLBACK_MAPPING) {
    delete FALLBACK_MAPPING[originalModel];
    console.log(`🗑️ Fallback removido para: ${originalModel}`);
    return true;
  }
  return false;
}
