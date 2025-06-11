import type { ImageModelList } from "@/app/_actions/image/generate";

/**
 * Modelos de IA de geração de imagens disponíveis por plano
 */
export const IMAGE_MODELS_BY_PLAN = {
  FREE: [
    "flux-fast-1.1",        // Black Forest - Fast/básico
    "google-imagen-3-fast", // Google - Fast/básico  
    "ideogram-v2",          // Ideogram - Básico
  ] as ImageModelList[],
  
  PRO: [
    "flux-pro",             // Black Forest - Intermediário
    "flux-dev",             // Black Forest - Desenvolvimento
    "flux-pro-1.1",         // Black Forest - Pro melhorado
    "ideogram-v2-turbo",    // Ideogram - Turbo/intermediário
    "google-imagen-3",      // Google - Qualidade padrão
  ] as ImageModelList[],
  
  PREMIUM: [
    "midjourney-imagine",   // Midjourney - Premium
    "dall-e-3",             // OpenAI - Premium
    "flux-pro-1.1-ultra",   // Black Forest - Ultra/máximo
    "ideogram-v3",          // Ideogram - Mais recente/avançado
    "gpt-image-1",          // OpenAI - GPT Image modelo
  ] as ImageModelList[],
} as const;

/**
 * Mapeamento de qualidade de crédito para custos
 */
export const MODEL_CREDIT_MAPPING: Record<ImageModelList, "BASIC_IMAGE" | "ADVANCED_IMAGE" | "PREMIUM_IMAGE"> = {
  // FREE - Modelos básicos (5 créditos)
  "flux-fast-1.1": "BASIC_IMAGE",
  "google-imagen-3-fast": "BASIC_IMAGE", 
  "ideogram-v2": "BASIC_IMAGE",
  
  // PRO - Modelos intermediários (10 créditos)
  "flux-pro": "ADVANCED_IMAGE",
  "flux-dev": "ADVANCED_IMAGE", 
  "flux-pro-1.1": "ADVANCED_IMAGE",
  "ideogram-v2-turbo": "ADVANCED_IMAGE",
  "google-imagen-3": "ADVANCED_IMAGE",
  
  // PREMIUM - Modelos premium (15 créditos)
  "midjourney-imagine": "PREMIUM_IMAGE",
  "dall-e-3": "PREMIUM_IMAGE",
  "flux-pro-1.1-ultra": "PREMIUM_IMAGE", 
  "ideogram-v3": "PREMIUM_IMAGE",
  "gpt-image-1": "PREMIUM_IMAGE",
};

/**
 * Verificar se o Google Imagen está configurado corretamente
 */
export function isGoogleImagenConfigured(): boolean {
  // Sempre retornar true para não filtrar modelos na interface
  // A validação real será feita no backend durante a geração
  return true;
}

/**
 * Obter todos os modelos disponíveis para um plano específico
 */
export function getModelsForPlan(planName: 'FREE' | 'PRO' | 'PREMIUM'): ImageModelList[] {
  let models: ImageModelList[];
  
  switch (planName) {
    case 'FREE':
      models = [...IMAGE_MODELS_BY_PLAN.FREE];
      break;
    case 'PRO':
      models = [...IMAGE_MODELS_BY_PLAN.FREE, ...IMAGE_MODELS_BY_PLAN.PRO];
      break;
    case 'PREMIUM':
      models = [...IMAGE_MODELS_BY_PLAN.FREE, ...IMAGE_MODELS_BY_PLAN.PRO, ...IMAGE_MODELS_BY_PLAN.PREMIUM];
      break;
    default:
      models = [...IMAGE_MODELS_BY_PLAN.FREE];
  }
  
  // Remover modelos do Google Imagen se não estiverem configurados
  if (!isGoogleImagenConfigured()) {
    models = models.filter(model => 
      !model.includes('google-imagen')
    );
  }
  
  return models;
}

/**
 * Verificar se um modelo específico está disponível para um plano
 */
export function isModelAvailableForPlan(model: ImageModelList, planName: 'FREE' | 'PRO' | 'PREMIUM'): boolean {
  // Verificação especial para Google Imagen
  if (model.includes('google-imagen') && !isGoogleImagenConfigured()) {
    return false;
  }
  
  const availableModels = getModelsForPlan(planName);
  return availableModels.includes(model);
}

/**
 * Obter o custo em créditos de um modelo
 */
export function getModelCreditCost(model: ImageModelList): "BASIC_IMAGE" | "ADVANCED_IMAGE" | "PREMIUM_IMAGE" {
  return MODEL_CREDIT_MAPPING[model];
}

/**
 * Obter descrição da categoria do modelo
 */
export function getModelCategory(model: ImageModelList): 'FREE' | 'PRO' | 'PREMIUM' {
  if (IMAGE_MODELS_BY_PLAN.FREE.includes(model)) return 'FREE';
  if (IMAGE_MODELS_BY_PLAN.PRO.includes(model)) return 'PRO';
  if (IMAGE_MODELS_BY_PLAN.PREMIUM.includes(model)) return 'PREMIUM';
  return 'FREE'; // fallback
}

/**
 * Obter informações completas sobre restrições de modelo
 */
export function getModelRestrictionInfo(model: ImageModelList) {
  const category = getModelCategory(model);
  const creditCost = getModelCreditCost(model);
  
  return {
    model,
    category,
    creditCost,
    available: {
      FREE: category === 'FREE',
      PRO: category === 'FREE' || category === 'PRO', 
      PREMIUM: true,
    }
  };
} 