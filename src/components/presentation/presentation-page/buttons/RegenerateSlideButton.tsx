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
  
  // Extrair o texto do slide atual e limpar instruções de prompt
  const getSlideText = useCallback(() => {
    const slide = slides[slideIndex];
    if (!slide) return "";
    
    // Extrair o texto de todos os elementos do slide
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
    
    // Limpar o texto removendo frases de instrução comuns
    const cleanedText = text.trim()
      .replace(/^(fale|me\s+fale|conte|me\s+conte|descreva|explique|falar|contar|descrever|explicar)\s+(mais\s+)?(sobre|a\s+respeito\s+de|acerca\s+de)?\s+/i, '')
      .replace(/^(o\s+que\s+é|quem\s+é|como\s+funciona|por\s+que|quando|onde|qual|quais)\s+/i, '')
      .replace(/^(gostaria\s+de\s+saber|quero\s+saber|preciso\s+saber|pode\s+me\s+dizer)\s+(mais\s+)?(sobre|a\s+respeito\s+de)?\s+/i, '')
      .replace(/aspectos\s+importantes\s+a\s+serem\s+considerados\s+sobre\s+/i, '');
    
    console.log("Texto original:", text);
    console.log("Texto limpo:", cleanedText);
    
    return cleanedText;
  }, [slides, slideIndex]);
  
  // Função para regenerar o slide usando a API diretamente
  const handleRegenerateSlide = useCallback(async () => {
    // Verificar se já está processando
    if (isProcessingRef.current) return;
    
    // Verificar se o índice do slide é válido
    if (slideIndex < 0 || slideIndex >= slides.length) {
      toast.error("Índice de slide inválido para regeneração.");
      return;
    }
    
    try {
      // Marcar como processando para evitar múltiplos cliques
      isProcessingRef.current = true;
      setIsRegenerating(true);
      
      // Determinar o tópico para este slide
      let topic = "";
      
      // Verificar se temos um outline válido e se o índice está dentro do outline
      let usingOutlineTopic = false;
      if (outline && outline.length > 0 && slideIndex < outline.length) {
        // Usar o tópico do outline (garantindo que seja uma string)
        const outlineTopic = outline[slideIndex];
        if (outlineTopic) {
          topic = outlineTopic;
          usingOutlineTopic = true;
          console.log("Regenerando slide usando tópico do outline:", topic);
        }
      }
      
      // Se não temos um tópico do outline, extrair do slide atual
      if (!topic) {
        topic = getSlideText();
        console.log("Regenerando slide usando texto extraído do slide:", topic);
        
        if (!topic) {
          toast.error("Não foi possível extrair texto do slide para regeneração.");
          setIsRegenerating(false);
          isProcessingRef.current = false;
          return;
        }
      }
      
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
      
      // Se não estamos usando um tópico do outline, gerar um tópico detalhado primeiro
      let detailedTopic = topic;
      
      if (!usingOutlineTopic) {
        // ETAPA 1: Gerar um tópico detalhado com bullet points
        console.log("Etapa 1: Gerando tópico detalhado para:", topic);
        
        // Extrair títulos dos outros slides para contexto
        const existingTopics = slides
          .filter((_, idx) => idx !== slideIndex)
          .map(slide => {
            // Extrair apenas o título (h1) de cada slide
            for (const node of slide.content) {
              if (node.type === 'h1' && node.children) {
                let title = "";
                for (const child of node.children) {
                  if ('text' in child) {
                    title += child.text + " ";
                  }
                }
                return title.trim();
              }
            }
            return "";
          })
          .filter(title => title.length > 0);
        
        try {
          // Chamar a API para gerar o tópico detalhado
          const topicResponse = await fetch('/api/presentation/generate-topic', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              suggestion: topic,
              existingTopics: existingTopics,
              language: language
            }),
          });
          
          if (topicResponse.ok) {
            // Obter o tópico detalhado
            detailedTopic = await topicResponse.text();
            console.log("Tópico detalhado gerado:", detailedTopic);
          } else {
            console.warn("Falha ao gerar tópico detalhado, usando tópico original");
          }
        } catch (topicError) {
          console.error("Erro ao gerar tópico detalhado:", topicError);
          // Continuar com o tópico original em caso de erro
        }
      }
      
      // ETAPA 2: Usar o tópico para gerar o slide
      console.log("Etapa 2: Gerando slide a partir do tópico");
      
      // Chamar a API para gerar o slide
      const response = await fetch('/api/presentation/generate-slide', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: presentationInput || currentPresentationTitle || "",
          topic: detailedTopic, // Usar o tópico detalhado ou o original
          slideIndex,
          language,
          tone: presentationStyle,
          context: otherSlides // Adicionar contexto dos outros slides
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
          
          if (usingOutlineTopic) {
            toast.success("Slide regenerado com sucesso a partir do outline!");
          } else {
            toast.success("Slide regenerado com sucesso a partir do texto do slide!");
          }
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
