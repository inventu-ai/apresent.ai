"use client";

import { useState } from "react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import FileUpload from "@/components/ui/file-upload";
import { useUploadThing } from "@/hooks/globals/useUploadthing";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ImageUploadDrawerProps {
  onImageUpload: (imageUrl: string) => void;
}

export function ImageUploadDrawer({ onImageUpload }: ImageUploadDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [imageUrl, setImageUrl] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Hook para upload de arquivos
  const { startUpload, isUploading } = useUploadThing("imageUploader");

  // Função para lidar com o upload de imagem por arquivo
  const handleFileUpload = async (files: File[]) => {
    if (files.length === 0) return;
    
    try {
      setError(null);
      // Garantir que apenas um arquivo seja processado
      const fileToUpload = files[0]; // Pegar apenas o primeiro arquivo
      
      // Verificar se o arquivo existe antes de fazer o upload
      if (!fileToUpload) {
        setError("Nenhum arquivo selecionado");
        return;
      }
      
      const uploadResult = await startUpload([fileToUpload]);
      
      if (uploadResult && uploadResult[0]?.url) {
        // Chamar a função de callback com a nova URL da imagem
        onImageUpload(uploadResult[0].url);
        
        // Fechar o drawer
        setIsOpen(false);
        
        // Limpar os arquivos
        setUploadFiles([]);
      }
    } catch (error) {
      console.error("Erro ao fazer upload da imagem:", error);
      setError("Falha ao fazer upload da imagem. Por favor, tente novamente.");
    }
  };

  // Função para visualizar a imagem da URL
  const handlePreviewUrl = async () => {
    if (!imageUrl.trim()) {
      setError("Por favor, insira uma URL de imagem válida");
      return;
    }

    try {
      setError(null);
      setIsLoadingPreview(true);
      
      // Verificar se a URL é válida
      const response = await fetch(imageUrl, { method: 'HEAD' });
      
      if (!response.ok) {
        throw new Error("URL de imagem inválida ou inacessível");
      }
      
      // Verificar se o conteúdo é uma imagem
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.startsWith('image/')) {
        throw new Error("O URL não aponta para uma imagem válida");
      }
      
      // Definir a URL de prévia
      setPreviewUrl(imageUrl);
    } catch (error) {
      console.error("Erro ao carregar prévia da imagem:", error);
      setError("Não foi possível carregar a imagem. Verifique se a URL é válida e acessível.");
    } finally {
      setIsLoadingPreview(false);
    }
  };

  // Função para usar a imagem da URL
  const handleUseUrlImage = () => {
    if (previewUrl) {
      onImageUpload(previewUrl);
      setIsOpen(false);
      setImageUrl("");
      setPreviewUrl("");
    }
  };

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen} direction="left">
      <DrawerTrigger asChild>
        <Button
          variant="secondary"
          size="icon"
          className="h-8 w-8 rounded-full bg-background/80"
        >
          <Upload className="h-4 w-4" />
        </Button>
      </DrawerTrigger>
      <DrawerContent className="left-0 right-auto w-[400px] max-w-full">
        <DrawerHeader>
          <DrawerTitle>Upload de Imagem</DrawerTitle>
          <DrawerDescription>
            Escolha uma imagem para substituir a atual
          </DrawerDescription>
        </DrawerHeader>
        
        <div className="px-4 space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {/* URL da Imagem */}
          <div className="space-y-2">
            <Label htmlFor="image-url">URL da Imagem</Label>
            <div className="flex gap-2">
              <Input
                id="image-url"
                placeholder="https://exemplo.com/imagem.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
              <Button 
                variant="outline" 
                onClick={handlePreviewUrl}
                disabled={isLoadingPreview || !imageUrl.trim()}
              >
                {isLoadingPreview ? <Spinner className="h-4 w-4" /> : "Visualizar"}
              </Button>
            </div>
          </div>
          
          {/* Prévia da imagem da URL */}
          {previewUrl && (
            <div className="space-y-4">
              <div className="overflow-hidden rounded-md border border-border">
                <img 
                  src={previewUrl} 
                  alt="Prévia da imagem" 
                  className="h-auto max-h-[200px] w-full object-contain"
                />
              </div>
              
              <Button 
                className="w-full" 
                onClick={handleUseUrlImage}
              >
                Usar esta imagem
              </Button>
            </div>
          )}
          
          <Separator className="my-4" />
          
          {/* Upload de arquivo */}
          <div>
            <h4 className="mb-2 text-sm font-medium">Ou faça upload de um arquivo:</h4>
            <FileUpload
              files={uploadFiles}
              setFiles={setUploadFiles}
              onUpload={handleFileUpload}
              isLoading={isUploading}
              multiple={false}
              maxFiles={1}
              acceptedTypes={["jpg", "jpeg", "png", "gif", "webp"]}
              info="Arraste e solte ou clique para selecionar"
            />
          </div>
        </div>
        
        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
