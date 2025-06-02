"use client";

import { useState, useRef, useCallback } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePresentationState } from "@/states/presentation-state";
import { toast } from "sonner";
import { SlideParser, type PlateSlide } from "@/components/presentation/utils/parser";
import { updatePresentation } from "@/app/_actions/presentation/presentationActions";
import debounce from "lodash.debounce";
import { nanoid } from "nanoid";

interface RegenerateSlideButtonProps {
  slideIndex: number;
}

export function RegenerateSlideButton({ slideIndex }: RegenerateSlideButtonProps) {
  // Estado local para controlar a animação e desabilitar o botão
  const [isRegenerating, setIsRegenerating] = useState(false);
  
  // Ref para evitar múltiplos cliques
  const isProcessingRef = useRef(false);
  
  // Obter apenas o que precisamos do estado global
  const { 
    outline, 
    slides, 
    setSlides,
    language,
    presentationStyle,
    presentationInput,
    currentPresentationTitle,
    currentPresentationId
  } = usePresentationState();
  
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
  
  // Função para regenerar o slide usando a API diretamente
  const handleRegenerateSlide = useCallback(async () => {
    // Verificar se já está processando
    if (isProcessingRef.current) return;
    
    // Verificar se temos um outline válido
    if (!outline || outline.length === 0) {
      toast.error("Não foi possível regenerar o slide. Outline não encontrado.");
      return;
    }
    
    // Verificar se o índice do slide é válido
    if (slideIndex < 0 || slideIndex >= outline.length) {
      toast.error("Índice de slide inválido para regeneração.");
      return;
    }
    
    try {
      // Marcar como processando para evitar múltiplos cliques
      isProcessingRef.current = true;
      setIsRegenerating(true);
      
      // Obter o tópico para este slide
      const topic = outline[slideIndex];
      
      // Chamar a API diretamente
      const response = await fetch('/api/presentation/generate-slide', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: presentationInput || currentPresentationTitle || "",
          topic,
          slideIndex,
          language,
          tone: presentationStyle,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Falha ao regenerar o slide');
      }
      
      // Obter o XML do slide regenerado
      const xmlContent = await response.text();
      
      // Log para depuração
      console.log('XML recebido da API:', xmlContent);
      
      try {
        // Processar o XML para obter o slide
        const parser = new SlideParser();
        parser.reset();
        parser.parseChunk(xmlContent);
        parser.finalize();
        parser.clearAllGeneratingMarks();
        
        const parsedSlides = parser.getAllSlides();
        console.log('Slides processados:', parsedSlides);
        
        if (parsedSlides.length > 0 && parsedSlides[0]) {
          // Criar uma nova cópia do array de slides
          const updatedSlides = [...slides];
          
          // Substituir o slide no índice especificado
          updatedSlides[slideIndex] = parsedSlides[0];
          
          // Atualizar o estado global com os novos slides
          setSlides(updatedSlides);
          
          // Atualizar no banco de dados
          await updatePresentationInDB(updatedSlides);
          
          toast.success("Slide regenerado com sucesso!");
        } else {
          // Tentar criar um slide básico como fallback
          console.warn('Falha no parsing normal, tentando criar slide básico como fallback');
          
          // Extrair qualquer conteúdo de texto do XML
          const textMatch = xmlContent.match(/<H1>(.*?)<\/H1>/i) || 
                           xmlContent.match(/<H2>(.*?)<\/H2>/i) || 
                           xmlContent.match(/<H3>(.*?)<\/H3>/i) ||
                           xmlContent.match(/<P>(.*?)<\/P>/i);
          
          // Garantir que title seja sempre uma string não-nula
          const title = textMatch && textMatch[1] ? textMatch[1] : 'Slide Regenerado';
          
          // Criar um slide básico com o título extraído
          const fallbackSlide: PlateSlide = {
            id: nanoid(),
            content: [
              {
                type: "h1",
                children: [{ text: title }],
              },
              {
                type: "p",
                children: [{ text: "Conteúdo regenerado. Edite este slide conforme necessário." }],
              }
            ],
            alignment: "center",
          };
          
          // Criar uma nova cópia do array de slides
          const updatedSlides = [...slides];
          
          // Substituir o slide no índice especificado
          updatedSlides[slideIndex] = fallbackSlide;
          
          // Atualizar o estado global com os novos slides
          setSlides(updatedSlides);
          
          // Atualizar no banco de dados
          await updatePresentationInDB(updatedSlides);
          
          toast.warning("Slide regenerado com formato básico. Você pode editá-lo manualmente.");
        }
      } catch (parsingError) {
        console.error('Erro ao processar XML do slide:', parsingError, '\nXML recebido:', xmlContent);
        throw new Error('Não foi possível processar o slide regenerado: ' + (parsingError instanceof Error ? parsingError.message : 'Erro desconhecido'));
      }
    } catch (error: unknown) {
      console.error('Erro ao regenerar slide:', error);
      toast.error(`Falha ao regenerar o slide: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      // Limpar o estado de processamento
      setIsRegenerating(false);
      
      // Usar setTimeout para garantir que não haverá cliques acidentais
      setTimeout(() => {
        isProcessingRef.current = false;
      }, 500);
    }
  }, [
    slideIndex, 
    outline, 
    slides, 
    setSlides, 
    language, 
    presentationStyle, 
    presentationInput, 
    currentPresentationTitle,
    currentPresentationId
  ]);
  
  // Criar uma versão com debounce da função de regeneração
  const regenerateSlide = useCallback(
    debounce(() => {
      void handleRegenerateSlide();
    }, 300),
    [handleRegenerateSlide]
  );

  return (
    <Button
      variant="ghost"
      size="icon"
      className="!size-8 rounded-full"
      onClick={regenerateSlide}
      disabled={isRegenerating}
      title="Regenerar slide"
    >
      <RefreshCw 
        className={`h-4 w-4 ${isRegenerating ? "animate-spin" : ""}`} 
      />
    </Button>
  );
}
