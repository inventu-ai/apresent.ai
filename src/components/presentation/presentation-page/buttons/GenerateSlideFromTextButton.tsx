"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { usePresentationState } from "@/states/presentation-state";
import { toast } from "sonner";
import { SlideParser, type PlateSlide } from "@/components/presentation/utils/parser";
import { updatePresentation } from "@/app/_actions/presentation/presentationActions";
import debounce from "lodash.debounce";
import { Brain } from "lucide-react";

interface GenerateSlideFromTextButtonProps {
  slideIndex: number;
}

export function GenerateSlideFromTextButton({ slideIndex }: GenerateSlideFromTextButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const isProcessingRef = useRef(false);
  
  const { 
    slides, 
    setSlides,
    language,
    presentationStyle,
    presentationInput,
    currentPresentationTitle,
    currentPresentationId
  } = usePresentationState();
  
  // Verificar se é um novo card
  const isNewCard = useCallback(() => {
    const slide = slides[slideIndex];
    if (!slide) return false;
    
    // Verificar se o slide tem apenas um título e nenhum outro conteúdo significativo
    if (slide.content.length <= 1) {
      // Verificar se o conteúdo é um título (h1)
      if (slide.content[0]?.type === "h1" && 
          slide.content[0]?.children && 
          slide.content[0]?.children.length > 0 &&
          slide.content[0]?.children[0]) {
        
        // Verificar se é o texto exato "New Slide" ou qualquer outro texto em um título
        if ('text' in slide.content[0].children[0]) {
          console.log("Novo slide detectado no índice:", slideIndex, "com texto:", slide.content[0].children[0].text);
          return true;
        }
      }
    }
    
    return false;
  }, [slides, slideIndex]);
  
  // Extrair o texto do card
  const getCardText = useCallback(() => {
    const slide = slides[slideIndex];
    if (!slide) return "";
    
    // Extrair o texto do título
    let text = "";
    for (const node of slide.content) {
      if (node.type.startsWith('h') && node.children && node.children.length > 0) {
        for (const child of node.children) {
          if ('text' in child) {
            text += child.text + " ";
          }
        }
      }
    }
    
    return text.trim();
  }, [slides, slideIndex]);
  
  // Função para atualizar a apresentação no banco de dados
  const updatePresentationInDB = async (updatedSlides: typeof slides) => {
    if (!currentPresentationId) return;
    
    try {
      const result = await updatePresentation({
        id: currentPresentationId,
        content: { slides: updatedSlides },
        title: currentPresentationTitle || "",
        theme: usePresentationState.getState().theme,
      });
      
      if (!result.success) {
        throw new Error(result.message || 'Falha ao atualizar apresentação');
      }
    } catch (error: unknown) {
      console.error('Erro ao atualizar apresentação:', error);
    }
  };
  
  // Função para gerar o slide usando a API
  const handleGenerateSlide = useCallback(async () => {
    if (isProcessingRef.current) return;
    
    const cardText = getCardText();
    if (!cardText) {
      toast.error("Não foi possível gerar o slide. Texto não encontrado.");
      return;
    }
    
    try {
      isProcessingRef.current = true;
      setIsGenerating(true);
      
      // Obter o contexto dos outros slides
      const otherSlides = slides
        .filter((_, idx) => idx !== slideIndex)
        .map(slide => {
          let text = "";
          for (const node of slide.content) {
            if (node.children) {
              for (const child of node.children) {
                if ('text' in child) {
                  text += child.text + " ";
                }
              }
            }
          }
          return text.trim();
        })
        .filter(text => text.length > 0);
      
      // Chamar a API para gerar o slide
      const response = await fetch('/api/presentation/generate-slide', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: presentationInput || currentPresentationTitle || "",
          topic: cardText,
          slideIndex,
          language,
          tone: presentationStyle,
          context: otherSlides // Adicionar contexto dos outros slides
        }),
      });
      
      if (!response.ok) {
        throw new Error('Falha ao gerar o slide');
      }
      
      // Obter o XML do slide gerado
      const xmlContent = await response.text();
      
      try {
        // Processar o XML para obter o slide
        const parser = new SlideParser();
        parser.reset();
        parser.parseChunk(xmlContent);
        parser.finalize();
        parser.clearAllGeneratingMarks();
        
        const parsedSlides = parser.getAllSlides();
        
        if (parsedSlides.length > 0 && parsedSlides[0]) {
          // Criar uma nova cópia do array de slides
          const updatedSlides = [...slides];
          
          // Substituir o slide no índice especificado
          updatedSlides[slideIndex] = parsedSlides[0];
          
          // Atualizar o estado global com os novos slides
          setSlides(updatedSlides);
          
          // Atualizar no banco de dados
          await updatePresentationInDB(updatedSlides);
          
          toast.success("Slide gerado com sucesso!");
        } else {
          toast.error("Não foi possível processar o slide gerado.");
        }
      } catch (parsingError) {
        console.error('Erro ao processar XML do slide:', parsingError);
        toast.error(`Falha ao processar o slide: ${parsingError instanceof Error ? parsingError.message : 'Erro desconhecido'}`);
      }
    } catch (error: unknown) {
      console.error('Erro ao gerar slide:', error);
      toast.error(`Falha ao gerar o slide: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setIsGenerating(false);
      
      setTimeout(() => {
        isProcessingRef.current = false;
      }, 500);
    }
  }, [
    slideIndex, 
    slides, 
    setSlides, 
    language, 
    presentationStyle, 
    presentationInput, 
    currentPresentationTitle,
    currentPresentationId,
    getCardText
  ]);
  
  // Criar uma versão com debounce da função de geração
  const generateSlide = useCallback(
    debounce(() => {
      void handleGenerateSlide();
    }, 300),
    [handleGenerateSlide]
  );

  // Se não for um novo card, não renderizar o botão
  if (!isNewCard()) {
    return null;
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className={`!size-10 rounded-full absolute right-2 top-2 z-[200] text-indigo-400 hover:text-indigo-600 shadow-md ${isGenerating ? "animate-pulse" : ""}`}
      onClick={generateSlide}
      disabled={isGenerating}
      title="Gerar slide com IA"
    >
      <Brain 
        size={20}
        className={isGenerating ? "animate-pulse" : ""}
      />
    </Button>
  );
}
