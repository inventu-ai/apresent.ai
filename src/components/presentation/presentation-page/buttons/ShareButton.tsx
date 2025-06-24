"use client";
import { useState } from "react";
import { Share, FileText, Download, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/contexts/LanguageContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { usePresentationState } from "@/states/presentation-state";
import { exportToPdf, exportToPowerPoint, exportToPng } from "@/lib/presentation/export-utils";
import { cn } from "@/lib/utils";

export function ShareButton() {
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [isExporting, setIsExporting] = useState<string | null>(null);
  const { t } = useTranslation();
  
  const { slides, currentPresentationTitle } = usePresentationState();

  const handleExport = async (type: 'pdf' | 'pptx' | 'png') => {
    try {
      setIsExporting(type);
      
      // Obter apenas os slides principais, excluindo os previews
      // Usamos o seletor .slide-wrapper para pegar apenas os containers principais de slides
      const slideWrappers = Array.from(
        document.querySelectorAll('.slide-wrapper')
      ) as HTMLElement[];
      
      // Para cada wrapper, encontramos o elemento com data-slide-content="true" que não está dentro de um preview
      const slideElements = slideWrappers
        .map(wrapper => {
          // Encontrar o elemento principal do slide dentro do wrapper
          const slideContent = wrapper.querySelector('[data-slide-content="true"]:not([id^="preview-"])');
          return slideContent as HTMLElement | null;
        })
        .filter((el): el is HTMLElement => el !== null);
      
      console.log(`Exportando ${slideElements.length} slides`);
      
      // Exportar de acordo com o tipo selecionado
      switch (type) {
        case 'pdf':
          await exportToPdf(slides, currentPresentationTitle || 'Apresentação', slideElements);
          break;
        case 'pptx':
          await exportToPowerPoint(slides, currentPresentationTitle || 'Apresentação', slideElements);
          break;
        case 'png':
          await exportToPng(slides, currentPresentationTitle || 'Apresentação', slideElements);
          break;
      }
      
      setIsExporting(null);
    } catch (error) {
      console.error(`Erro ao exportar como ${type}:`, error);
      setIsExporting(null);
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="text-muted-foreground hover:text-foreground"
        onClick={() => setIsShareDialogOpen(true)}
      >
        <Share className="mr-1 h-4 w-4" />
        {t.presentation.share}
      </Button>

      <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Share className="h-5 w-5" />
              Compartilhar {currentPresentationTitle && `"${currentPresentationTitle}"`}
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex flex-col gap-4 py-4">
            <p className="text-sm text-muted-foreground">
              Baixe uma cópia estática do seu gamma para compartilhar com outras pessoas.
            </p>
            
            <div className="flex flex-col gap-2">
              {/* Opção PDF */}
              <ExportOption 
                icon={<FileText className="h-8 w-8 text-red-500" />}
                title="Exportar para PDF"
                description="Documento em formato PDF"
                onClick={() => handleExport('pdf')}
                isLoading={isExporting === 'pdf'}
              />
              
              {/* Opção PowerPoint */}
              <ExportOption 
                icon={<FileText className="h-8 w-8 text-orange-500" />}
                title="Exportar para PowerPoint"
                description="Apresentação em formato PPTX"
                onClick={() => handleExport('pptx')}
                isLoading={isExporting === 'pptx'}
              />
              
              {/* Opção PNG */}
              <ExportOption 
                icon={<Image className="h-8 w-8 text-purple-500" />}
                title="Exportar como PNGs"
                description="Imagens em formato PNG (arquivo ZIP)"
                onClick={() => handleExport('png')}
                isLoading={isExporting === 'png'}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

interface ExportOptionProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
  isLoading: boolean;
}

function ExportOption({ icon, title, description, onClick, isLoading }: ExportOptionProps) {
  return (
    <div 
      className={cn(
        "flex items-center justify-between p-4 rounded-lg border hover:bg-accent cursor-pointer transition-colors",
        isLoading && "opacity-70 cursor-not-allowed"
      )}
      onClick={!isLoading ? onClick : undefined}
    >
      <div className="flex items-center gap-4">
        {icon}
        <div>
          <h3 className="font-medium">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      
      <Button 
        variant={isLoading ? "loading" : "ghost"} 
        size="sm" 
        disabled={isLoading}
      >
        {!isLoading && <Download className="h-4 w-4" />}
      </Button>
    </div>
  );
}
