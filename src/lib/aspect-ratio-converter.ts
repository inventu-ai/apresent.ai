/**
 * Sistema de conversão de aspect ratio entre diferentes modelos de IA
 */

export type AspectRatio = "4:3" | "16:9" | "1:1" | "3:4" | "9:16";

export type GoogleImagenRatio = "1:1" | "4:3" | "16:9" | "3:4" | "9:16";
export type IdeogramV2Ratio = "ASPECT_1_1" | "ASPECT_4_3" | "ASPECT_16_9" | "ASPECT_3_4" | "ASPECT_9_16";
export type IdeogramV3Ratio = "1x1" | "4x3" | "16x9" | "3x4" | "9x16";

/**
 * Mapeamento de conversão de aspect ratios
 */
const ASPECT_RATIO_MAPPING = {
  "1:1": {
    google: "1:1",
    ideogramV2: "ASPECT_1_1",
    ideogramV3: "1x1"
  },
  "4:3": {
    google: "4:3",
    ideogramV2: "ASPECT_4_3", 
    ideogramV3: "4x3"
  },
  "16:9": {
    google: "16:9",
    ideogramV2: "ASPECT_16_9",
    ideogramV3: "16x9"
  },
  "3:4": {
    google: "3:4",
    ideogramV2: "ASPECT_3_4",
    ideogramV3: "3x4"
  },
  "9:16": {
    google: "9:16",
    ideogramV2: "ASPECT_9_16",
    ideogramV3: "9x16"
  }
} as const;

/**
 * Converte aspect ratio do formato Google para Ideogram v2
 */
export function convertToIdeogramV2(googleRatio: AspectRatio): IdeogramV2Ratio {
  const mapping = ASPECT_RATIO_MAPPING[googleRatio];
  if (!mapping) {
    console.warn(`Aspect ratio ${googleRatio} não suportado, usando 1:1 como fallback`);
    return "ASPECT_1_1";
  }
  return mapping.ideogramV2;
}

/**
 * Converte aspect ratio do formato Google para Ideogram v3
 */
export function convertToIdeogramV3(googleRatio: AspectRatio): IdeogramV3Ratio {
  const mapping = ASPECT_RATIO_MAPPING[googleRatio];
  if (!mapping) {
    console.warn(`Aspect ratio ${googleRatio} não suportado, usando 1:1 como fallback`);
    return "1x1";
  }
  return mapping.ideogramV3;
}

/**
 * Converte aspect ratio entre qualquer formato
 */
export function convertAspectRatio(
  originalRatio: AspectRatio,
  fromModel: "google" | "ideogramV2" | "ideogramV3",
  toModel: "google" | "ideogramV2" | "ideogramV3"
): string {
  const mapping = ASPECT_RATIO_MAPPING[originalRatio];
  
  if (!mapping) {
    console.warn(`Aspect ratio ${originalRatio} não suportado, usando 1:1 como fallback`);
    return toModel === "google" ? "1:1" : 
           toModel === "ideogramV2" ? "ASPECT_1_1" : "1x1";
  }

  switch (toModel) {
    case "google":
      return mapping.google;
    case "ideogramV2":
      return mapping.ideogramV2;
    case "ideogramV3":
      return mapping.ideogramV3;
    default:
      return mapping.google;
  }
}

/**
 * Valida se um aspect ratio é suportado
 */
export function isValidAspectRatio(ratio: string): ratio is AspectRatio {
  return Object.keys(ASPECT_RATIO_MAPPING).includes(ratio);
}

/**
 * Obtém todos os aspect ratios suportados para um modelo
 */
export function getSupportedAspectRatios(model: "google" | "ideogramV2" | "ideogramV3"): string[] {
  return Object.values(ASPECT_RATIO_MAPPING).map(mapping => {
    switch (model) {
      case "google":
        return mapping.google;
      case "ideogramV2":
        return mapping.ideogramV2;
      case "ideogramV3":
        return mapping.ideogramV3;
      default:
        return mapping.google;
    }
  });
}

/**
 * Normaliza aspect ratio para o formato padrão (4:3)
 */
export function normalizeAspectRatio(ratio: string): AspectRatio {
  // Remove espaços e converte para lowercase
  const normalized = ratio.trim().toLowerCase();
  
  // Mapeamento de formatos alternativos
  const alternativeFormats: Record<string, AspectRatio> = {
    "1:1": "1:1",
    "1x1": "1:1",
    "aspect_1_1": "1:1",
    "square": "1:1",
    
    "4:3": "4:3", 
    "4x3": "4:3",
    "aspect_4_3": "4:3",
    
    "16:9": "16:9",
    "16x9": "16:9", 
    "aspect_16_9": "16:9",
    "widescreen": "16:9",
    
    "3:4": "3:4",
    "3x4": "3:4",
    "aspect_3_4": "3:4",
    "portrait": "3:4",
    
    "9:16": "9:16",
    "9x16": "9:16",
    "aspect_9_16": "9:16",
    "vertical": "9:16"
  };
  
  const result = alternativeFormats[normalized];
  if (!result) {
    console.warn(`Formato de aspect ratio '${ratio}' não reconhecido, usando 1:1 como fallback`);
    return "1:1";
  }
  
  return result;
}
