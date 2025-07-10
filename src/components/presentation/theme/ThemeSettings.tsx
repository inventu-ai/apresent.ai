import { usePresentationState } from "@/states/presentation-state";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { type Themes, themes } from "@/lib/presentation/themes";
import { useTheme } from "next-themes";
import { type ImageModelList } from "@/app/_actions/image/generate";
import { ThemeModal } from "./ThemeModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, Star, Zap } from "lucide-react";
import { usePlanBadge } from "@/hooks/usePlanBadge";
import { getModelsForPlan, IMAGE_MODELS_BY_PLAN, isModelAvailableForPlan } from "@/lib/image-model-restrictions";
import { useEffect, useState } from "react";
import { useTranslation } from "@/contexts/LanguageContext";

const MODEL_INFO: Record<ImageModelList, { label: string; provider: string; category: 'FREE' | 'PRO' | 'PREMIUM' }> = {
  "ideogram-v2": { label: "Ideogram V2", provider: "Ideogram", category: 'FREE' },
  "ideogram-v2-turbo": { label: "Ideogram V2 Turbo", provider: "Ideogram", category: 'PRO' },
  "ideogram-v3": { label: "Ideogram V3", provider: "Ideogram", category: 'PREMIUM' },
  "dall-e-3": { label: "DALL-E 3", provider: "OpenAI", category: 'PREMIUM' },
  "google-imagen-3": { label: "Google Imagen 3", provider: "Google", category: 'PRO' },
  "google-imagen-3-fast": { label: "Google Imagen 3 Fast", provider: "Google", category: 'FREE' },
  "google-imagen-4": { label: "Google Imagen 4", provider: "Google", category: 'PREMIUM' },
  "gpt-image-1": { label: "GPT Image 1", provider: "OpenAI", category: 'PREMIUM' },
};

const PLAN_ICONS = {
  FREE: Zap,
  PRO: Star,
  PREMIUM: Crown,
};

const PLAN_COLORS = {
  FREE: "bg-gray-100 text-gray-700",
  PRO: "bg-blue-100 text-blue-700", 
  PREMIUM: "bg-yellow-100 text-yellow-700",
};

const PLAN_LABELS = {
  FREE: "Gratuito",
  PRO: "Pro", 
  PREMIUM: "Premium",
};

// Esta constante será substituída por uma função que usa traduções

export function ThemeSettings() {
  const { theme, setTheme, imageModel, setImageModel } = usePresentationState();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const { t } = useTranslation();
  
  const PRESENTATION_STYLES = [
    { value: "professional", label: t.presentation.presentationStyles.professional },
    { value: "creative", label: t.presentation.presentationStyles.creative },
    { value: "minimal", label: t.presentation.presentationStyles.minimal },
    { value: "bold", label: t.presentation.presentationStyles.bold },
    { value: "elegant", label: t.presentation.presentationStyles.elegant },
  ];
  const [availableModels, setAvailableModels] = useState<ImageModelList[]>([]);
  const { planName, isLoading: planLoading } = usePlanBadge();

  useEffect(() => {
    if (!planLoading) {
      const userModels = getModelsForPlan(planName);
      setAvailableModels(userModels);
      
      // Se o modelo selecionado não está disponível, selecionar o primeiro disponível
      if (imageModel && !userModels.includes(imageModel)) {
        setImageModel(userModels[0] || "ideogram-v2");
      }
    }
  }, [planName, planLoading, imageModel, setImageModel]);

  // Organizar modelos por plano para a interface
  const modelsByPlan = {
    FREE: IMAGE_MODELS_BY_PLAN.FREE,
    PRO: IMAGE_MODELS_BY_PLAN.PRO, 
    PREMIUM: IMAGE_MODELS_BY_PLAN.PREMIUM,
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">{t.presentation.themeLayout}</Label>
          <ThemeModal>
            <Button variant={"link"}>{t.presentation.moreThemes}</Button>
          </ThemeModal>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Object.entries(themes).map(([key, themeOption]) => {
            const modeColors = isDark
              ? themeOption.colors.dark
              : themeOption.colors.light;
            const modeShadows = isDark
              ? themeOption.shadows.dark
              : themeOption.shadows.light;

            return (
              <button
                key={key}
                onClick={() => setTheme(key as Themes)}
                className={cn(
                  "group relative space-y-2 rounded-lg border p-4 text-left transition-all",
                  theme === key
                    ? "border-primary bg-primary/5"
                    : "border-muted hover:border-primary/50 hover:bg-muted/50"
                )}
                style={{
                  borderRadius: themeOption.borderRadius,
                  boxShadow: modeShadows.card,
                  transition: themeOption.transitions.default,
                  backgroundColor:
                    theme === key
                      ? `${modeColors.primary}${isDark ? "15" : "08"}`
                      : isDark
                      ? "rgba(0,0,0,0.3)"
                      : "rgba(255,255,255,0.9)",
                }}
              >
                <div
                  className="font-medium"
                  style={{
                    color: modeColors.heading,
                    fontFamily: themeOption.fonts.heading,
                  }}
                >
                  {themeOption.name}
                </div>
                <div
                  className="text-sm"
                  style={{
                    color: modeColors.text,
                    fontFamily: themeOption.fonts.body,
                  }}
                >
                  {themeOption.description}
                </div>
                <div className="flex gap-2">
                  {[
                    modeColors.primary,
                    modeColors.secondary,
                    modeColors.accent,
                  ].map((color, i) => (
                    <div
                      key={i}
                      className="h-4 w-4 rounded-full ring-1 ring-inset ring-white/10"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <div
                  className="mt-2 text-xs"
                  style={{ color: modeColors.muted }}
                >
                  <span className="block">
                    Heading: {themeOption.fonts.heading}
                  </span>
                  <span className="block">Body: {themeOption.fonts.body}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-4">
        <Label className="text-sm font-medium">{t.presentation.imageGenerationModel}</Label>
        <Select
          value={imageModel || "ideogram-v2"}
          onValueChange={(value) => setImageModel(value as ImageModelList)}
          disabled={planLoading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select image model" />
          </SelectTrigger>
          <SelectContent className="max-h-80">
            {Object.entries(modelsByPlan).map(([planType, models]) => {
              const PlanIcon = PLAN_ICONS[planType as keyof typeof PLAN_ICONS];
              
              return (
                <div key={planType}>
                  {/* Cabeçalho da seção do plano */}
                  <div className="px-2 py-2 text-xs font-medium text-muted-foreground border-b border-border/50 bg-muted/30 flex items-center gap-2">
                    <PlanIcon className="w-3 h-3" />
                    {PLAN_LABELS[planType as keyof typeof PLAN_LABELS]}
                  </div>
                  
                  {/* Modelos da seção */}
                  {models.map((model) => {
                    const info = MODEL_INFO[model];
                    const isAvailable = isModelAvailableForPlan(model, planName);
                    
                    // Determinar qual plano é necessário para este modelo específico
                    let requiredPlanText = '';
                    if (!isAvailable) {
                      if (isModelAvailableForPlan(model, 'PRO')) {
                        requiredPlanText = 'Pro';
                      } else if (isModelAvailableForPlan(model, 'PREMIUM')) {
                        requiredPlanText = 'Premium';
                      }
                    }
                    
                    return (
                      <SelectItem 
                        key={model} 
                        value={model}
                        disabled={!isAvailable}
                        className={!isAvailable ? "opacity-50 cursor-not-allowed" : ""}
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-3">
                            <div className="flex flex-col">
                              <span className={!isAvailable ? "text-muted-foreground" : ""}>
                                {info.label}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {info.provider}
                              </span>
                            </div>
                          </div>
                          {!isAvailable && requiredPlanText && (
                            <Badge variant="secondary" className="text-xs opacity-60">
                              🔒 Requer {requiredPlanText}
                            </Badge>
                          )}
                        </div>
                      </SelectItem>
                    );
                  })}
                </div>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        <Label className="text-sm font-medium">{t.presentation.presentationStyle}</Label>
        <Select defaultValue="professional">
          <SelectTrigger>
            <SelectValue placeholder="Select style" />
          </SelectTrigger>
          <SelectContent>
            {PRESENTATION_STYLES.map((style) => (
              <SelectItem key={style.value} value={style.value}>
                {style.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
