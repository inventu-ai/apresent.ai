"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Upload, X } from "lucide-react";
import { useUploadThing } from "@/hooks/globals/useUploadthing";
import { updateUserAvatar } from "@/app/_actions/profile/updateProfile";
import { toast } from "sonner";

interface AvatarUploadProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentImage: string | null | undefined;
  userId: string;
}

export function AvatarUpload({ open, onOpenChange, currentImage, userId }: AvatarUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const { startUpload } = useUploadThing("imageUploader", {
    onClientUploadComplete: async (res) => {
      if (res?.[0]?.ufsUrl) {
        try {
          await updateUserAvatar(userId, res[0].ufsUrl);
          toast.success("Avatar atualizado com sucesso!");
          onOpenChange(false);
          window.location.reload(); // Refresh to show new avatar
        } catch (error) {
          toast.error("Erro ao atualizar avatar");
        }
      }
      setIsUploading(false);
    },
    onUploadError: (error) => {
      toast.error("Erro no upload: " + error.message);
      setIsUploading(false);
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Por favor, selecione apenas arquivos de imagem");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Arquivo muito grande. Máximo 5MB");
        return;
      }

      setSelectedFile(file);
      
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    await startUpload([selectedFile]);
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    onOpenChange(false);
  };

  const displayImage = previewUrl || currentImage;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Alterar Avatar</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current/Preview Avatar */}
          <div className="flex justify-center">
            <Avatar className="h-32 w-32">
              <AvatarImage src={displayImage || ""} alt="Avatar preview" />
              <AvatarFallback className="text-2xl">
                <Upload className="h-8 w-8" />
              </AvatarFallback>
            </Avatar>
          </div>

          {/* File Input */}
          <div className="space-y-2">
            <label htmlFor="avatar-upload" className="block text-sm font-medium">
              Escolher nova imagem
            </label>
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            <p className="text-xs text-muted-foreground">
              PNG, JPG ou GIF. Máximo 5MB.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={handleCancel} disabled={isUploading}>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button 
              onClick={handleUpload} 
              disabled={!selectedFile || isUploading}
            >
              <Upload className="h-4 w-4 mr-2" />
              {isUploading ? "Enviando..." : "Salvar"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
