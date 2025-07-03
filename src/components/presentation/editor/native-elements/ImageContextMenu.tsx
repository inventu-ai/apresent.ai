"use client";

import React, { useState } from "react";
import { useTranslation } from "@/contexts/LanguageContext";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  Copy,
  Link,
  ExternalLink,
  Download,
  Edit,
  Sparkles,
  Eraser,
  Maximize,
  Focus,
  LayoutGrid,
  X,
} from "lucide-react";
import { useDebouncedSave } from "@/hooks/presentation/useDebouncedSave";
import { ImageEditDialog } from "./ImageEditDialog";

interface ImageContextMenuProps {
  children: React.ReactNode;
  imageUrl?: string;
  onEdit?: () => void;
  onRemove?: () => void;
  onAdjustImage?: () => void;
  onImageEdited?: (newImageUrl: string) => void;
}

export function ImageContextMenu({
  children,
  imageUrl,
  onEdit,
  onRemove,
  onAdjustImage,
  onImageEdited,
}: ImageContextMenuProps) {
  const { saveImmediately } = useDebouncedSave();
  const [showEditDialog, setShowEditDialog] = useState(false);
  const { t } = useTranslation();

  // Função para copiar a imagem para a área de transferência
  const handleCopy = async () => {
    try {
      if (!imageUrl) return;
      
      // Fetch da imagem
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      
      // Copiar para a área de transferência
      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob,
        }),
      ]);
      
      console.log("Imagem copiada para a área de transferência");
    } catch (error) {
      console.error("Erro ao copiar imagem:", error);
    }
  };

  // Função para copiar o endereço da imagem
  const handleCopyImageUrl = async () => {
    try {
      if (!imageUrl) return;
      await navigator.clipboard.writeText(imageUrl);
      console.log("URL da imagem copiada para a área de transferência");
    } catch (error) {
      console.error("Erro ao copiar URL da imagem:", error);
    }
  };

  // Função para abrir a imagem em uma nova aba
  const handleOpenInNewTab = () => {
    if (!imageUrl) return;
    window.open(imageUrl, "_blank");
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

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger>{children}</ContextMenuTrigger>
        <ContextMenuContent className="w-64">
        <ContextMenuItem onSelect={onEdit}>
          <Edit className="mr-2 h-4 w-4" />
          {t.imageContextMenu.editImage}
        </ContextMenuItem>
        <ContextMenuItem 
          onSelect={() => setShowEditDialog(true)}
          disabled={!imageUrl || !onImageEdited}
        >
          <Sparkles className="mr-2 h-4 w-4" />
          {t.imageContextMenu.askAI}
        </ContextMenuItem>
        <ContextMenuItem onSelect={onAdjustImage} disabled={!onAdjustImage}>
          <Maximize className="mr-2 h-4 w-4" />
          {t.imageContextMenu.adjustImage}
        </ContextMenuItem>
        
        <ContextMenuSeparator />
        
        <ContextMenuItem onSelect={handleCopy}>
          <Copy className="mr-2 h-4 w-4" />
          {t.imageContextMenu.copy}
        </ContextMenuItem>
        <ContextMenuItem onSelect={handleCopyImageUrl}>
          <Link className="mr-2 h-4 w-4" />
          {t.imageContextMenu.copyImageUrl}
        </ContextMenuItem>
        <ContextMenuItem onSelect={handleOpenInNewTab}>
          <ExternalLink className="mr-2 h-4 w-4" />
          {t.imageContextMenu.openInNewTab}
        </ContextMenuItem>
        <ContextMenuItem onSelect={handleDownload}>
          <Download className="mr-2 h-4 w-4" />
          {t.imageContextMenu.downloadImage}
        </ContextMenuItem>
        
        <ContextMenuSeparator />
        
        <ContextMenuItem onSelect={onRemove} className="text-destructive">
          <X className="mr-2 h-4 w-4" />
          {t.imageContextMenu.removeImage}
        </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      {/* Diálogo de edição de imagem */}
      {imageUrl && onImageEdited && (
        <ImageEditDialog
          isOpen={showEditDialog}
          onClose={() => setShowEditDialog(false)}
          imageUrl={imageUrl}
          onImageEdited={(newImageUrl) => {
            onImageEdited(newImageUrl);
            saveImmediately();
          }}
        />
      )}
    </>
  );
}
