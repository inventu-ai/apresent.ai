"use client";

import { useState, useCallback } from "react";
import { useTranslation } from "@/contexts/LanguageContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

import { Loader2, Sparkles, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { editImageAction, type ImageEditResult } from "@/app/_actions/image/edit";
import { type ImageModelList } from "@/app/_actions/image/generate";
import { toast } from "sonner";
import { useCreditValidation } from "@/hooks/useCreditValidation";
import { InsufficientCreditsModal } from "@/components/ui/insufficient-credits-modal";
import { useCredits } from "@/contexts/CreditsContext";

interface ImageEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  onImageEdited: (newImageUrl: string) => void;
  originalModel?: ImageModelList; // Modelo original opcional
}

export function ImageEditDialog({ isOpen, onClose, imageUrl, onImageEdited, originalModel }: ImageEditDialogProps) {
  const [editPrompt, setEditPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();
  
  // Sempre usar GPT Image 1 para edições
  const selectedModel: ImageModelList = 'gpt-image-1';

  // Credit validation
  const { checkCredits, userId, currentPlan } = useCreditValidation();
  const { credits, refetchCredits } = useCredits();
  const { nextReset } = credits;
  const [showInsufficientCreditsModal, setShowInsufficientCreditsModal] = useState(false);
  const [creditError, setCreditError] = useState<{
    creditsNeeded: number;
    currentCredits: number;
    actionName: string;
  } | null>(null);

  const handleEditImage = useCallback(async () => {
    if (!editPrompt.trim()) {
      setError(t.images.editDescription);
      return;
    }

    // Verificar créditos antes de editar imagem
    const creditCheck = await checkCredits('IMAGE_EDITING');
    
    if (!creditCheck.allowed) {
      setCreditError({
        creditsNeeded: creditCheck.cost,
        currentCredits: creditCheck.currentCredits,
        actionName: 'Editar Imagem'
      });
      setShowInsufficientCreditsModal(true);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result: ImageEditResult = await editImageAction(imageUrl, editPrompt.trim(), selectedModel);

      if (result.success && result.image) {
        onImageEdited(result.image.url);
        // Atualizar os créditos no header após edição bem-sucedida
        await refetchCredits();
        
        toast.success(t.presentation.imageEdited, {
          description: `Modelo: ${result.image.model}${result.creditsUsed ? ` • Créditos usados: ${result.creditsUsed}` : ''}`,
        });
        onClose();
        setEditPrompt("");
      } else {
        setError(result.error || t.errors.generic);
        toast.error(t.errors.generic, {
          description: result.error || t.common.tryAgain,
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t.errors.serverError;
      setError(errorMessage);
      toast.error(t.errors.generic, {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  }, [imageUrl, editPrompt, onImageEdited, onClose]);

  const handleClose = useCallback(() => {
    if (!isLoading) {
      onClose();
      setEditPrompt("");
      setError(null);
    }
  }, [isLoading, onClose]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      if (!isLoading && editPrompt.trim()) {
        handleEditImage();
      }
    }
  }, [editPrompt, isLoading, handleEditImage]);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            {t.images.editingWithAI}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Preview da imagem original */}
          <div className="space-y-2">
            <Label>{t.common.currentImage}</Label>
            <div className="relative max-w-xs mx-auto">
              <img
                src={imageUrl}
                alt="Imagem para editar"
                className="w-full h-auto rounded-lg border object-cover max-h-48"
              />
            </div>
          </div>



          {/* Campo de prompt */}
          <div className="space-y-2">
            <Label htmlFor="edit-prompt">
              {t.images.editDescription}
            </Label>
            <Textarea
              id="edit-prompt"
              placeholder={t.images.editPromptPlaceholder}
              value={editPrompt}
              onChange={(e) => setEditPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              className="min-h-[100px] resize-none"
              disabled={isLoading}
            />
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Info className="h-4 w-4" />
              <span>{t.common.cmdEnterToSubmit}</span>
            </div>
          </div>

          {/* Informações sobre a funcionalidade */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              {t.images.aiWillEdit}. {t.images.costPerEdit}: 20 {t.userMenu.credits}.
            </AlertDescription>
          </Alert>

          {/* Erro */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
          >
            {t.common.cancel}
          </Button>
          <Button
            onClick={handleEditImage}
            disabled={isLoading || !editPrompt.trim()}
            className="min-w-[120px]"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t.presentation.editingImage}
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                {t.presentation.editImage}
              </>
            )}
          </Button>
        </DialogFooter>

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
      </DialogContent>
    </Dialog>
  );
}
