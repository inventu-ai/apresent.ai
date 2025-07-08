"use client";

import { useState, useRef, useCallback } from "react";
import { useTranslation } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { usePresentationState } from "@/states/presentation-state";
import { toast } from "sonner";
import { SlideParser, type PlateSlide } from "@/components/presentation/utils/parser";
import { updatePresentation } from "@/app/_actions/presentation/presentationActions";
import { useCreditValidation } from "@/hooks/useCreditValidation";
import { InsufficientCreditsModal } from "@/components/ui/insufficient-credits-modal";
import { useCredits } from "@/contexts/CreditsContext";
import debounce from "lodash.debounce";
import { Brain } from "lucide-react";

interface GenerateSlideFromTextButtonProps {
  slideIndex: number;
}

/**
 * Função para sanitizar o tópico detalhado antes de enviá-lo para a geração do slide
 * Remove o padrão "0:" que aparece antes de cada palavra e outros problemas de formatação
 */
function sanitizeTopic(topic: string): string {
  // Verificar se o tópico tem o padrão problemático (0:" no início de cada palavra)
  const hasPattern = topic.includes('0:"');
  
  if (hasPattern) {
    
    // Remover o padrão "0:" que aparece antes de cada palavra
    let cleanedTopic = topic.replace(/0:"/g, '');
    
    // Remover aspas desnecessárias no final das palavras
    cleanedTopic = cleanedTopic.replace(/"/g, '');
    
    // Remover quebras de linha e substituir por espaços
    cleanedTopic = cleanedTopic.replace(/\r?\n/g, ' ');
    
    // Normalizar espaços múltiplos
    cleanedTopic = cleanedTopic.replace(/\s+/g, ' ');
    
    return cleanedTopic.trim();
  }
  
  // Se não tiver o padrão problemático, retornar o tópico original
  return topic;
}

/**
 * Função para sanitizar o XML antes de processá-lo
 * Remove caracteres problemáticos e formata corretamente
 * IMPORTANTE: Preserva as tags XML válidas
 */
function sanitizeXml(xml: string, topic: string, presentationTitle: string): string {
  
  // Remover caracteres problemáticos
  let cleanXml = xml
    // Substituir aspas curvas por aspas retas
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    // Substituir traços longos por hífens
    .replace(/[\u2013\u2014]/g, '-')
    // Remover caracteres O" no início de palavras (problema comum)
    .replace(/O"([a-zA-Z])/g, '$1')
    .replace(/O" /g, '')
    // Remover padrão 0:" que pode aparecer no XML
    .replace(/0:"/g, '')
    // Remover caracteres # em qualquer lugar nos títulos
    .replace(/<H1>([^<]*?)#([^<]*?)<\/H1>/g, '<H1>$1$2</H1>')
    .replace(/<H2>([^<]*?)#([^<]*?)<\/H2>/g, '<H2>$1$2</H2>')
    .replace(/<H3>([^<]*?)#([^<]*?)<\/H3>/g, '<H3>$1$2</H3>')
    // Também remover # no início de títulos (caso anterior não pegue)
    .replace(/<H1>\s*#\s*/g, '<H1>')
    .replace(/<H2>\s*#\s*/g, '<H2>')
    .replace(/<H3>\s*#\s*/g, '<H3>')
    // Remover marcadores de lista no início de parágrafos
    .replace(/<P>\s*[-*•○●]\s*/g, '<P>')
    .replace(/<P>\s*\d+\.\s*/g, '<P>')
    // Normalizar quebras de linha
    .replace(/\r?\n/g, ' ')
    // Normalizar espaços múltiplos
    .replace(/\s+/g, ' ')
    // Garantir que tags XML estejam corretamente formatadas
    .replace(/< /g, '<')
    .replace(/ >/g, '>');
    
  // NÃO escapar os caracteres < e > em todo o XML
  // Isso preserva as tags XML válidas
  
  // Verificar se há tags SECTION e fechar se necessário
  if (cleanXml.includes("<SECTION") && !cleanXml.includes("</SECTION>")) {
    cleanXml += "</SECTION>";
  }
  
  // Gerar um título significativo baseado no tópico ou título da apresentação
  const generateMeaningfulTitle = (): string => {
    // Usar o tópico como primeira opção
    if (topic && topic.trim().length > 0) {
      // Limitar o tópico a 6 palavras para o título
      const words = topic.trim().split(/\s+/);
      if (words.length > 6) {
        return words.slice(0, 6).join(' ');
      }
      return topic.trim();
    }
    
    // Usar o título da apresentação como segunda opção
    if (presentationTitle && presentationTitle.trim().length > 0) {
      // Extrair uma parte significativa do título da apresentação
      const words = presentationTitle.trim().split(/\s+/);
      if (words.length > 3) {
        return words.slice(0, 3).join(' ');
      }
      return presentationTitle.trim();
    }
    
    // Fallback para um título genérico mais descritivo
    return "Novo Slide";
  };
  
  // Verificar se há tags H1 e adicionar se não existir
  if (!cleanXml.includes("<H1>") && cleanXml.includes("<SECTION")) {
    // Inserir um H1 com título significativo após a tag SECTION
    const meaningfulTitle = generateMeaningfulTitle();
    cleanXml = cleanXml.replace(/<SECTION[^>]*>/, `$&<H1>${meaningfulTitle}</H1>`);
  }
  
  // Verificar se há tags P e adicionar se não existir
  if (!cleanXml.includes("<P>") && cleanXml.includes("<H1>")) {
    // Inserir um P com conteúdo mais descritivo após a tag H1
    cleanXml = cleanXml.replace(/<\/H1>/, `$&<P>Informações sobre ${topic || "este tópico"}.</P>`);
  }
  
  return cleanXml;
}

export function GenerateSlideFromTextButton({ slideIndex }: GenerateSlideFromTextButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const isProcessingRef = useRef(false);
  const { t } = useTranslation();
  
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
  
  const { 
    slides, 
    setSlides,
    language,
    presentationStyle,
    presentationInput,
    currentPresentationTitle,
    currentPresentationId
  } = usePresentationState();
  
  // Mostrar o botão sempre que houver qualquer texto não vazio em qualquer bloco
  const isEligibleForGeneration = useCallback(() => {
    const slide = slides[slideIndex];
    if (!slide) return false;

    // Procurar por qualquer texto não vazio em qualquer bloco
    for (const node of slide.content) {
      if (node.children && node.children.length > 0) {
        for (const child of node.children) {
          if ('text' in child && typeof child.text === 'string' && child.text.trim().length > 0) {
            return true;
          }
        }
      }
    }
    return false;
  }, [slides, slideIndex]);
  
  // Extrair o texto do card e limpar instruções de prompt
  const getCardText = useCallback(() => {
    const slide = slides[slideIndex];
    if (!slide) return "";

    // Extrair texto de qualquer bloco do slide
    let text = "";
    for (const node of slide.content) {
      if (node.children && node.children.length > 0) {
        for (const child of node.children) {
          if ('text' in child && typeof child.text === 'string') {
            text += child.text + " ";
          }
        }
      }
    }

    // Limpar o texto removendo frases de instrução comuns
    const cleanedText = text.trim()
      .replace(/^(fale|me\s+fale|conte|me\s+conte|descreva|explique|falar|contar|descrever|explicar)\s+(mais\s+)?(sobre|a\s+respeito\s+de|acerca\s+de)?\s+/i, '')
      .replace(/^(o\s+que\s+é|quem\s+é|como\s+funciona|por\s+que|quando|onde|qual|quais)\s+/i, '')
      .replace(/^(gostaria\s+de\s+saber|quero\s+saber|preciso\s+saber|pode\s+me\s+dizer)\s+(mais\s+)?(sobre|a\s+respeito\s+de)?\s+/i, '');

    return cleanedText;
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

    // Verificar créditos antes de gerar slide
    const creditCheck = await checkCredits('SLIDE_GENERATION');
    
    if (!creditCheck.allowed) {
      setCreditError({
        creditsNeeded: creditCheck.cost,
        currentCredits: creditCheck.currentCredits,
        actionName: 'Gerar Slide'
      });
      setShowInsufficientCreditsModal(true);
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
                if ('text' in child && typeof child.text === 'string') {
                  text += child.text + " ";
                }
              }
            }
          }
          return text.trim();
        })
        .filter(text => text.length > 0);
      
      // ETAPA 1: Gerar um tópico detalhado com bullet points
      
      // Extrair títulos dos outros slides para contexto
      const existingTopics = slides
        .filter((_, idx) => idx !== slideIndex)
        .map(slide => {
          // Extrair apenas o título (h1) de cada slide
          for (const node of slide.content) {
            if (node.type === 'h1' && node.children) {
              let title = "";
              for (const child of node.children) {
                if ('text' in child && typeof child.text === 'string') {
                  title += child.text + " ";
                }
              }
              return title.trim();
            }
          }
          return "";
        })
        .filter(title => title.length > 0);
      
      // Chamar a API para gerar o tópico detalhado
      const topicResponse = await fetch('/api/presentation/generate-topic', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          suggestion: cardText,
          existingTopics: existingTopics,
          language: language
        }),
      });
      
      if (!topicResponse.ok) {
        throw new Error('Falha ao gerar o tópico detalhado');
      }
      
      // Obter o tópico detalhado
      const rawDetailedTopic = await topicResponse.text();
      
      // Sanitizar o tópico detalhado antes de usá-lo e remover caracteres "#"
      let detailedTopic = sanitizeTopic(rawDetailedTopic);
      
      // Remover explicitamente qualquer caractere "#" do tópico
      detailedTopic = detailedTopic.replace(/^#\s*/g, '').replace(/#/g, '');
      
      // Log para debug
      console.log('Tópico detalhado após limpeza:', detailedTopic);
      
      // ETAPA 2: Usar o tópico detalhado para gerar o slide
      
      // Obter nome do usuário exatamente como é feito na geração completa
      const userName = (typeof window !== "undefined" && window.localStorage && window.localStorage.getItem("userName")) || "User";
      
      
      // Chamar a API para gerar o slide com o tópico detalhado
      const response = await fetch('/api/presentation/generate-slide', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: presentationInput || currentPresentationTitle || "",
          topic: detailedTopic, // Usar o tópico detalhado em vez do texto simples
          slideIndex,
          language,
          tone: presentationStyle,
          context: otherSlides, // Adicionar contexto dos outros slides
          userName // Exatamente como é feito na geração completa
        }),
      });
      
      if (!response.ok) {
        throw new Error('Falha ao gerar o slide');
      }
      
      // Obter o XML do slide gerado
      const xmlContent = await response.text();
      
      try {
        // Sanitizar o XML antes de processá-lo e remover caracteres # dos títulos
        const sanitizedXml = sanitizeXml(
          xmlContent,
          detailedTopic,
          presentationInput || currentPresentationTitle || ""
        );
        
        // Processar o XML para obter o slide
        const parser = new SlideParser();
        parser.reset();
        parser.parseChunk(sanitizedXml);
        parser.finalize();
        parser.clearAllGeneratingMarks();
        
        const parsedSlides = parser.getAllSlides();
        
        if (parsedSlides.length > 0 && parsedSlides[0]) {
          // Criar uma nova cópia do array de slides
          const updatedSlides = [...slides];
          
          // Substituir o slide no índice especificado, garantindo id estável
          updatedSlides[slideIndex] = {
            ...parsedSlides[0],
            id: parsedSlides[0].id || (slides[slideIndex]?.id) || require("nanoid").nanoid(),
            isNew: false, // Remove a flag após gerar
          };
          
          // Atualizar o estado global com os novos slides
          setSlides(updatedSlides);
          
          // Atualizar no banco de dados
          await updatePresentationInDB(updatedSlides);
          
          // Atualizar os créditos no header
          await refetchCredits();
          
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

  // Só mostrar o botão se o slide for novo e elegível
  const slide = slides[slideIndex];
  if (!slide?.isNew || !isEligibleForGeneration()) {
    return null;
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className={`!size-10 rounded-full absolute right-2 top-2 z-[200] text-indigo-400 hover:text-indigo-600 shadow-md ${isGenerating ? "animate-pulse" : ""}`}
        onClick={generateSlide}
        disabled={isGenerating}
        title={t.presentation.generateSlideWithAI}
      >
        <Brain 
          size={20}
          className={isGenerating ? "animate-pulse" : ""}
        />
      </Button>

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
    </>
  );
}
