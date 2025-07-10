import React, { useState, useEffect } from "react";
import { usePresentationState } from "@/states/presentation-state";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useEditorRef } from "@udecode/plate-core/react";
import {
  generateImageAction,
  type ImageModelList,
} from "@/app/_actions/image/generate";
import { toast } from "sonner";
import { insertNodes } from "@udecode/plate-common";
import { ImagePlugin } from "@udecode/plate-media/react";
import { FloatingInput } from "./input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePlanBadge } from "@/hooks/usePlanBadge";
import { getModelsForPlan, getModelCategory, IMAGE_MODELS_BY_PLAN, isModelAvailableForPlan } from "@/lib/image-model-restrictions";
import { Badge } from "@/components/ui/badge";
import { Crown, Star, Zap } from "lucide-react";
import { useCreditValidation } from "@/hooks/useCreditValidation";
import { InsufficientCreditsModal } from "@/components/ui/insufficient-credits-modal";
import { useUserCredits } from "@/hooks/useUserCredits";
const MODEL_INFO: Record<ImageModelList, { label: string; provider: string; category: 'FREE' | 'PRO' | 'PREMIUM' }> = {
  "ideogram-v2-turbo": { label: "Ideogram V2 Turbo", provider: "Ideogram", category: 'FREE' },
  "ideogram-v3-turbo": { label: "Ideogram V3 Turbo", provider: "Ideogram", category: 'PRO' },
  "ideogram-v3-quality": { label: "Ideogram V3 Quality", provider: "Ideogram", category: 'PREMIUM' },
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

export function GenerateImageDialogContent({
  setOpen,
  isGenerating,
  setIsGenerating,
}: {
  setOpen: (value: boolean) => void;
  isGenerating: boolean;
  setIsGenerating: (value: boolean) => void;
}) {
  const editor = useEditorRef();
  const [prompt, setPrompt] = useState("");
  const [selectedModel, setSelectedModel] = useState<ImageModelList>("ideogram-v2-turbo");
  const [availableModels, setAvailableModels] = useState<ImageModelList[]>([]);
  const { planName, isLoading: planLoading } = usePlanBadge();

  // Credit validation
  const { checkCredits, userId, currentPlan } = useCreditValidation();
  const { nextReset } = useUserCredits();
  const [showInsufficientCreditsModal, setShowInsufficientCreditsModal] = useState(false);
  const [creditError, setCreditError] = useState<{
    creditsNeeded: number;
    currentCredits: number;
    actionName: string;
  } | null>(null);

  useEffect(() => {
    if (!planLoading) {
      const userModels = getModelsForPlan(planName);
      setAvailableModels(userModels);
      
      // Se o modelo selecionado não está disponível, selecionar o primeiro disponível
      if (!userModels.includes(selectedModel)) {
        setSelectedModel(userModels[0] || "ideogram-v2-turbo");
      }
    }
  }, [planName, planLoading, selectedModel]);

  // Organizar modelos por plano para a interface
  const modelsByPlan = {
    FREE: IMAGE_MODELS_BY_PLAN.FREE,
    PRO: IMAGE_MODELS_BY_PLAN.PRO, 
    PREMIUM: IMAGE_MODELS_BY_PLAN.PREMIUM,
  };

  const generateImage = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    // Verificar se o modelo está disponível no plano do usuário
    if (!isModelAvailableForPlan(selectedModel, planName)) {
      const modelInfo = MODEL_INFO[selectedModel];
      const requiredPlan = modelInfo.category === 'PRO' ? 'Pro' : 'Premium';
      toast.error(`Este modelo requer o plano ${requiredPlan}. Faça upgrade para continuar.`);
      return;
    }

    // Verificar créditos antes de gerar imagem
    const creditCheck = await checkCredits('IMAGE_GENERATION');
    
    if (!creditCheck.allowed) {
      setCreditError({
        creditsNeeded: creditCheck.cost,
        currentCredits: creditCheck.currentCredits,
        actionName: 'Gerar Imagem'
      });
      setShowInsufficientCreditsModal(true);
      return;
    }

    setIsGenerating(true);

    try {
      const result = await generateImageAction(prompt, selectedModel);

      if (!result.success || !result.image?.url) {
        throw new Error(result.error ?? "Failed to generate image");
      }

      insertNodes(editor, {
        children: [{ text: "" }],
        type: ImagePlugin.key,
        url: result.image.url,
        query: prompt,
      });

      setOpen(false);
      toast.success("Image generated successfully!");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to generate image"
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <AlertDialogHeader>
        <AlertDialogTitle>Generate Image with AI</AlertDialogTitle>
        <AlertDialogDescription>
          Enter a detailed description of the image you want to generate
        </AlertDialogDescription>
      </AlertDialogHeader>

      <div className="space-y-4">
        <div className="relative w-full">
          <FloatingInput
            id="prompt"
            className="w-full"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !isGenerating) void generateImage();
            }}
            label="Prompt"
            type="text"
            autoFocus
            disabled={isGenerating}
          />
        </div>

        {isGenerating && (
          <div className="mt-4 space-y-3">
            <div className="h-64 w-full animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800" />
            <div className="text-center text-sm text-gray-500">
              Gerando imagem...
            </div>
          </div>
        )}
      </div>

      <AlertDialogFooter>
        <Select
          value={selectedModel}
          onValueChange={(value) => setSelectedModel(value as ImageModelList)}
          disabled={isGenerating}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a model" />
          </SelectTrigger>
          <SelectContent className="max-h-80">
            {Object.entries(modelsByPlan).map(([planType, models]) => {
              const PlanIcon = PLAN_ICONS[planType as keyof typeof PLAN_ICONS];
              const isUserPlan = planType === 'FREE' || (planType === 'PRO' && ['PRO', 'PREMIUM'].includes(planName)) || (planType === 'PREMIUM' && planName === 'PREMIUM');
              
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
        <div className="flex gap-2">
          <AlertDialogCancel disabled={isGenerating}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              void generateImage();
            }}
            disabled={isGenerating}
          >
            {isGenerating ? "Gerando..." : "Generate"}
          </AlertDialogAction>
        </div>
      </AlertDialogFooter>

      {/* Modal de créditos insuficientes */}
      {creditError && (
        <InsufficientCreditsModal
          open={showInsufficientCreditsModal}
          onOpenChange={setShowInsufficientCreditsModal}
          creditsNeeded={creditError.creditsNeeded}
          currentCredits={creditError.currentCredits}
          actionName={creditError.actionName}
          currentPlan={currentPlan}
          userId={userId}
          nextReset={nextReset || undefined}
        />
      )}
    </>
  );
}

export default function ImageGenerationModel() {
  const { imageGenerationModelOpen, setImageGenerationModelOpen } =
    usePresentationState();
  const [isGenerating, setIsGenerating] = useState(false);
  return (
    <AlertDialog
      open={imageGenerationModelOpen}
      onOpenChange={(value) => {
        setImageGenerationModelOpen(value);
        setIsGenerating(false);
      }}
    >
      <AlertDialogContent className="gap-6">
        <GenerateImageDialogContent
          setOpen={setImageGenerationModelOpen}
          isGenerating={isGenerating}
          setIsGenerating={setIsGenerating}
        />
      </AlertDialogContent>
    </AlertDialog>
  );
}
