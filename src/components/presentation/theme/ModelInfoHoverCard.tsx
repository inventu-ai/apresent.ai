import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/contexts/LanguageContext";
import { type ImageModelList } from "@/app/_actions/image/generate";
import { cn } from "@/lib/utils";
import { 
  Palette, 
  Users, 
  Type, 
  Camera, 
  Star, 
  Eye, 
  Target, 
  Zap, 
  Lightbulb 
} from "lucide-react";

interface ModelInfoHoverCardProps {
  children: React.ReactNode;
  model: ImageModelList;
}

// Função para obter velocidade real baseada nos testes
const getModelSpeed = (model: ImageModelList): { speed: number; avgTime: number } => {
  const speedData: Record<ImageModelList, { speed: number; avgTime: number }> = {
    "google-imagen-3-fast": { speed: 5, avgTime: 8 },      // 8s média
    "google-imagen-3": { speed: 4, avgTime: 11.5 },        // 11.5s média  
    "ideogram-v3-turbo": { speed: 4, avgTime: 12.5 },      // 12.5s média
    "google-imagen-4": { speed: 3, avgTime: 16.5 },        // 16.5s média
    "ideogram-v3-quality": { speed: 3, avgTime: 16 },      // 16s média
    "dall-e-3": { speed: 3, avgTime: 18 },                 // 18s média
    "ideogram-v2-turbo": { speed: 2, avgTime: 28.5 },      // 28.5s média
    "gpt-image-1": { speed: 1, avgTime: 56.5 },            // 56.5s média
  };
  
  return speedData[model] || { speed: 3, avgTime: 20 };
};

// Função para obter descrição personalizada do modelo
const getModelDescription = (model: ImageModelList, t: any): string => {
  return t.presentation.modelDescriptions[model] || "Modelo de geração de imagens com IA";
};

// Função para obter "melhor para" com ícones
const getModelBestFor = (model: ImageModelList, t: any): Array<{ icon: React.ComponentType<any>; text: string }> => {
  const bestForData: Record<ImageModelList, Array<{ icon: React.ComponentType<any>; key: keyof typeof t.presentation.modelBestFor }>> = {
    "ideogram-v2-turbo": [
      { icon: Zap, key: "rapidIdeation" },
      { icon: Type, key: "texts" }
    ],
    "google-imagen-3-fast": [
      { icon: Palette, key: "colors" },
      { icon: Palette, key: "artisticStyle" }
    ],
    "ideogram-v3-turbo": [
      { icon: Type, key: "texts" },
      { icon: Palette, key: "artisticStyle" }
    ],
    "google-imagen-3": [
      { icon: Palette, key: "colors" },
      { icon: Users, key: "people" },
      { icon: Type, key: "texts" },
      { icon: Camera, key: "photorealism" }
    ],
    "dall-e-3": [
      { icon: Palette, key: "artisticStyle" },
      { icon: Palette, key: "colors" }
    ],
    "ideogram-v3-quality": [
      { icon: Star, key: "highQuality" },
      { icon: Type, key: "texts" }
    ],
    "google-imagen-4": [
      { icon: Camera, key: "realisticStyle" },
      { icon: Users, key: "people" },
      { icon: Palette, key: "colors" }
    ],
    "gpt-image-1": [
      { icon: Target, key: "ultraRealisticImages" },
      { icon: Users, key: "people" },
      { icon: Eye, key: "details" }
    ],
  };
  
  const modelData = bestForData[model] || [{ icon: Star, key: "highQuality" as keyof typeof t.presentation.modelBestFor }];
  return modelData.map(item => ({
    icon: item.icon,
    text: t.presentation.modelBestFor[item.key]
  }));
};

// Função para obter dados do modelo com traduções
const getModelDetails = (model: ImageModelList, t: any) => {
  const speedInfo = getModelSpeed(model);
  const baseDetails = {
    speed: speedInfo.speed,
    avgTime: speedInfo.avgTime,
    provider: getProviderName(model),
    category: getModelCategory(model),
  };

  return {
    ...baseDetails,
    description: getModelDescription(model, t),
    bestFor: getModelBestFor(model, t),
  };
};

const getProviderName = (model: ImageModelList): string => {
  if (model.includes('ideogram')) return 'Ideogram';
  if (model.includes('dall-e') || model.includes('gpt-image')) return 'OpenAI';
  if (model.includes('google-imagen')) return 'Google';
  return 'Unknown';
};

const getModelCategory = (model: ImageModelList): 'FREE' | 'PRO' | 'PREMIUM' => {
  // Nova estrutura simplificada de modelos
  const modelCategories: Record<ImageModelList, 'FREE' | 'PRO' | 'PREMIUM'> = {
    "ideogram-v2-turbo": 'FREE',
    "google-imagen-3-fast": 'FREE',
    "ideogram-v3-turbo": 'PRO',
    "google-imagen-3": 'PRO',
    "dall-e-3": 'PREMIUM',
    "ideogram-v3-quality": 'PREMIUM',
    "google-imagen-4": 'PREMIUM',
    "gpt-image-1": 'PREMIUM',
  };
  
  return modelCategories[model] || 'PREMIUM';
};

const getModelSpecialty = (model: ImageModelList): string => {
  if (model.includes('fast')) return 'Velocidade';
  if (model.includes('turbo')) return 'Velocidade turbo';
  if (model.includes('quality')) return 'Alta qualidade';
  if (model.includes('ideogram')) return 'Logotipos';
  if (model.includes('dall-e')) return 'Criatividade';
  if (model.includes('google-imagen-4')) return 'Última geração';
  if (model.includes('google-imagen')) return 'Fotorrealismo';
  if (model.includes('gpt-image')) return 'Inovação';
  return 'Alta qualidade';
};

const PLAN_COLORS = {
  FREE: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  PRO: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  PREMIUM: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
};

export function ModelInfoHoverCard({ children, model }: ModelInfoHoverCardProps) {
  const { t } = useTranslation();
  const modelDetails = getModelDetails(model, t);
  const [isVisible, setIsVisible] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = (e: React.MouseEvent) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
    
    // Calcular posição do modal com detecção inteligente
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const modalWidth = 320; // w-80 = 320px
      const modalHeight = 280; // Altura aproximada do modal
      const viewportHeight = window.innerHeight;
      const margin = 8;
      
      // Verificar se o modal sairia da parte inferior da tela
      const wouldOverflowBottom = rect.top + modalHeight > viewportHeight - margin;
      
      // Calcular posição Y
      let yPosition;
      if (wouldOverflowBottom) {
        // Posicionar acima do elemento
        yPosition = Math.max(margin, rect.top - modalHeight - margin);
      } else {
        // Posição normal (abaixo/alinhado com o elemento)
        yPosition = rect.top;
      }
      
      const newPosition = {
        x: Math.max(margin, rect.left - modalWidth - margin), // 8px de margem, mas não sair da tela
        y: yPosition
      };
      setPosition(newPosition);
    }
    
    const id = setTimeout(() => {
      setIsVisible(true);
    }, 300);
    setTimeoutId(id);
  };

  const handleMouseLeave = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
    setIsVisible(false);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [timeoutId]);

  const modalContent = (
    <div 
      className="fixed w-80 p-4 rounded-md border bg-popover text-popover-foreground shadow-lg animate-in fade-in-0 zoom-in-95"
      style={{
        left: position.x,
        top: position.y,
        zIndex: 9999,
      }}
      onMouseEnter={() => {
        // Manter o modal visível quando o mouse está sobre ele
        if (timeoutId) {
          clearTimeout(timeoutId);
          setTimeoutId(null);
        }
      }}
      onMouseLeave={handleMouseLeave}
    >
      <div className="space-y-3">
        {/* Header com nome e provider */}
        <div className="flex items-start justify-between">
          <div>
            <h4 className="font-semibold text-sm">{model.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</h4>
            <p className="text-xs text-muted-foreground">{modelDetails.provider}</p>
          </div>
          <Badge className={`text-xs ${PLAN_COLORS[modelDetails.category]}`}>
            {modelDetails.category}
          </Badge>
        </div>

        {/* Descrição */}
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1">
            {t.presentation.modelInfo.description}
          </p>
          <p className="text-sm">{modelDetails.description}</p>
        </div>

        {/* Velocidade */}
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2 mt-4">
            {t.presentation.modelInfo.speed}
          </p>
          {/* Linhas de velocidade expandidas */}
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((step) => (
              <div
                key={step}
                className={`h-1.5 flex-1 rounded-sm ${
                  step <= modelDetails.speed 
                    ? 'bg-blue-500' 
                    : 'bg-gray-300 dark:bg-gray-600'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Melhor para */}
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2 mt-4">
            {t.presentation.modelInfo.bestFor}
          </p>
          <ul className="space-y-1">
            {modelDetails.bestFor.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <li key={index} className="text-xs flex items-center">
                  <IconComponent className="w-3 h-3 mr-2 flex-shrink-0 text-muted-foreground" />
                  {item.text}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );

  return (
    <div 
      ref={triggerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      
      {isVisible && typeof window !== 'undefined' && createPortal(
        modalContent,
        document.body
      )}
    </div>
  );
}
