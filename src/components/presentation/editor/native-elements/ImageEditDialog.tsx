"use client";

import { useState, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

import { Loader2, Sparkles, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { editImageAction, type ImageEditResult } from "@/app/_actions/image/edit";
import { type ImageModelList } from "@/app/_actions/image/generate";
import { toast } from "sonner";

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
  
  // Sempre usar GPT Image 1 para edições
  const selectedModel: ImageModelList = 'gpt-image-1';

  const handleEditImage = useCallback(async () => {
    if (!editPrompt.trim()) {
      setError("Por favor, descreva o que você gostaria de modificar na imagem");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result: ImageEditResult = await editImageAction(imageUrl, editPrompt.trim(), selectedModel);

      if (result.success && result.image) {
        onImageEdited(result.image.url);
        toast.success("Imagem editada com sucesso!", {
          description: `Modelo: ${result.image.model}${result.creditsUsed ? ` • Créditos usados: ${result.creditsUsed}` : ''}`,
        });
        onClose();
        setEditPrompt("");
      } else {
        setError(result.error || "Erro ao editar imagem");
        toast.error("Erro ao editar imagem", {
          description: result.error || "Tente novamente",
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro interno";
      setError(errorMessage);
      toast.error("Erro ao editar imagem", {
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
            Peça à IA para editar a imagem
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Preview da imagem original */}
          <div className="space-y-2">
            <Label>Imagem atual</Label>
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
              Descreva o que você gostaria de modificar na imagem
            </Label>
            <Textarea
              id="edit-prompt"
              placeholder="Por exemplo: Adicione um chapéu azul na pessoa, remova o fundo e substitua por uma paisagem montanhosa, mude a cor da camisa para verde..."
              value={editPrompt}
              onChange={(e) => setEditPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              className="min-h-[100px] resize-none"
              disabled={isLoading}
            />
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Info className="h-4 w-4" />
              <span>Pressione Cmd/Ctrl + Enter para editar rapidamente</span>
            </div>
          </div>

          {/* Informações sobre a funcionalidade */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              A IA irá editar sua imagem preservando a composição original e aplicando apenas as modificações solicitadas. Custo: 20 créditos por edição.
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
            Cancelar
          </Button>
          <Button
            onClick={handleEditImage}
            disabled={isLoading || !editPrompt.trim()}
            className="min-w-[120px]"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Editando...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Editar Imagem
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 