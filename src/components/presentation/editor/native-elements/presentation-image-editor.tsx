import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  RefreshCw,
  Download,
  Trash2,
  Wand2,
  ImageIcon,
  AlertCircle,
  Crown,
  Star,
  Zap,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { usePresentationState } from "@/states/presentation-state";
import { type ImageModelList } from "@/app/_actions/image/generate";
import { ImageUploadDrawer } from "./ImageUploadDrawer";
import { usePlanBadge } from "@/hooks/usePlanBadge";
import { getModelsForPlan, IMAGE_MODELS_BY_PLAN, isModelAvailableForPlan } from "@/lib/image-model-restrictions";
import { useTranslation } from "@/contexts/LanguageContext";

const MODEL_INFO: Record<ImageModelList, { label: string; provider: string; category: 'FREE' | 'PRO' | 'PREMIUM' }> = {
  "midjourney-imagine": { label: "Midjourney Imagine", provider: "Midjourney", category: 'PREMIUM' },
  "flux-pro": { label: "Flux Pro", provider: "Black Forest", category: 'PRO' },
  "flux-dev": { label: "Flux Dev", provider: "Black Forest", category: 'PRO' },
  "flux-pro-1.1": { label: "Flux Pro 1.1", provider: "Black Forest", category: 'PRO' },
  "flux-pro-1.1-ultra": { label: "Flux Pro 1.1 Ultra", provider: "Black Forest", category: 'PREMIUM' },
  "flux-fast-1.1": { label: "Flux Fast 1.1", provider: "Black Forest", category: 'FREE' },
  "ideogram-v2": { label: "Ideogram V2", provider: "Ideogram", category: 'FREE' },
  "ideogram-v2-turbo": { label: "Ideogram V2 Turbo", provider: "Ideogram", category: 'PRO' },
  "ideogram-v3": { label: "Ideogram V3", provider: "Ideogram", category: 'PREMIUM' },
  "dall-e-3": { label: "DALL-E 3", provider: "OpenAI", category: 'PREMIUM' },
  "google-imagen-3": { label: "Google Imagen 3", provider: "Google", category: 'PRO' },
  "google-imagen-3-fast": { label: "Google Imagen 3 Fast", provider: "Google", category: 'FREE' },
  "gpt-image-1": { label: "GPT Image 1", provider: "OpenAI", category: 'PREMIUM' },
};

const PLAN_ICONS = {
  FREE: Zap,
  PRO: Star,
  PREMIUM: Crown,
};

const PLAN_LABELS = {
  FREE: "Gratuito",
  PRO: "Pro", 
  PREMIUM: "Premium",
};

export interface PresentationImageEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageUrl?: string;
  prompt?: string;
  isGenerating?: boolean;
  error?: string;
  onRegenerateWithSamePrompt: () => void;
  onGenerateWithNewPrompt: (prompt: string) => void;
  onRemove?: () => void; // Nova prop para remoção da imagem
  onImageUpload?: (imageUrl: string) => void; // Nova prop para upload de imagem
}

export const PresentationImageEditor = ({
  open,
  onOpenChange,
  imageUrl,
  prompt,
  isGenerating = false,
  error,
  onRegenerateWithSamePrompt,
  onGenerateWithNewPrompt,
  onRemove,
  onImageUpload,
}: PresentationImageEditorProps) => {
  const { imageModel, setImageModel } = usePresentationState();
  const [newPrompt, setNewPrompt] = useState(prompt ?? "");
  const { t } = useTranslation();
  const [availableModels, setAvailableModels] = useState<ImageModelList[]>([]);
  const { planName, isLoading: planLoading } = usePlanBadge();

  // Local error state for UI validation
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (!planLoading) {
      const userModels = getModelsForPlan(planName);
      setAvailableModels(userModels);
      
      // Se o modelo selecionado não está disponível, selecionar o primeiro disponível
      if (imageModel && !userModels.includes(imageModel)) {
        setImageModel(userModels[0] || "flux-fast-1.1");
      }
    }
  }, [planName, planLoading, imageModel, setImageModel]);

  // Organizar modelos por plano para a interface
  const modelsByPlan = {
    FREE: IMAGE_MODELS_BY_PLAN.FREE,
    PRO: IMAGE_MODELS_BY_PLAN.PRO, 
    PREMIUM: IMAGE_MODELS_BY_PLAN.PREMIUM,
  };
  
  // Função para baixar a imagem
  const handleDownload = async () => {
    try {
      if (!imageUrl) return;
      
      // Fetch da imagem para obter como blob
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      
      // Criar URL de objeto a partir do blob
      const blobUrl = URL.createObjectURL(blob);
      
      // Criar um link temporário para download
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `imagem-${Date.now()}.jpg`;
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      
      // Limpar
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl); // Liberar a memória
      
      console.log("Download da imagem iniciado");
    } catch (error) {
      console.error("Erro ao baixar imagem:", error);
    }
  };

  const handleGenerateClick = () => {
    if (!newPrompt.trim()) {
      setLocalError("Please enter a prompt first");
      return;
    }

    // Verificar se o modelo está disponível no plano do usuário
    if (imageModel && !isModelAvailableForPlan(imageModel, planName)) {
      const modelInfo = MODEL_INFO[imageModel];
      const requiredPlan = modelInfo.category === 'PRO' ? 'Pro' : 'Premium';
      setLocalError(`Este modelo requer o plano ${requiredPlan}. Faça upgrade para continuar.`);
      return;
    }

    setLocalError(null);
    onGenerateWithNewPrompt(newPrompt);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full max-w-xl overflow-y-auto sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>Image Generator</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Error message */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Validation error */}
          {localError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{localError}</AlertDescription>
            </Alert>
          )}

          {/* Image preview */}
          <div className="relative overflow-hidden rounded-md border border-border bg-muted">
            {isGenerating ? (
              <div className="flex h-60 items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                  <Spinner className="h-6 w-6" />
                  <span className="text-sm text-muted-foreground">
                    Gerando imagem...
                  </span>
                </div>
              </div>
            ) : imageUrl ? (
              <div className="relative">
                {/* 
                eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl}
                  alt={prompt ?? "Presentation image"}
                  className="h-auto max-h-[300px] w-full object-contain"
                />
                <div className="absolute bottom-2 right-2 flex gap-1">
                  {onImageUpload && <ImageUploadDrawer onImageUpload={onImageUpload} />}
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-8 w-8 rounded-full bg-background/80"
                    onClick={handleDownload}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-8 w-8 rounded-full bg-background/80"
                    onClick={onRemove}
                    disabled={!onRemove}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex h-60 items-center justify-center text-muted-foreground">
                <div className="flex flex-col items-center gap-2">
                  <ImageIcon className="h-10 w-10 opacity-50" />
                  <span>No image generated yet</span>
                </div>
              </div>
            )}
          </div>

          {/* Prompt Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">{t.presentation.imagePrompt}</label>
            <Textarea
              placeholder="Describe the image you want to generate..."
              className="min-h-[100px]"
              value={newPrompt}
              onChange={(e) => setNewPrompt(e.target.value)}
              disabled={isGenerating}
            />
          </div>

          {/* Image Model Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">{t.presentation.imageModel}</label>
            <Select
              value={imageModel}
              onValueChange={(value) => setImageModel(value as ImageModelList)}
              disabled={isGenerating}
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
                        {planType !== 'FREE' && (
                          <Badge variant="outline" className="text-xs px-1 py-0 h-4">
                            PLUS
                          </Badge>
                        )}
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

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <Button
              variant="default"
              className="flex-1"
              onClick={handleGenerateClick}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" /> Gerando...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-4 w-4" /> {t.presentation.generateNew}
                </>
              )}
            </Button>

            {imageUrl && (
              <Button
                variant="outline"
                onClick={onRegenerateWithSamePrompt}
                disabled={isGenerating}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                {t.presentation.regenerate}
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
