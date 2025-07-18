"use client";

import { cn } from "@udecode/cn";
import { ImagePlugin } from "@udecode/plate-media/react";
import { usePresentationState } from "@/states/presentation-state";
import { Spinner } from "@/components/ui/spinner";
import { useEffect, useId, useRef, useState } from "react";
import { DndPlugin, type DragItemNode } from "@udecode/plate-dnd";
import { type DragSourceMonitor } from "react-dnd";
import { PresentationImageEditor } from "./presentation-image-editor";
import { useDebouncedSave } from "@/hooks/presentation/useDebouncedSave";
import { useEditorRef } from "@udecode/plate-core/react";
import { generateImageAction } from "@/app/_actions/image/generate";
import { type PlateSlide } from "../../utils/parser";
import { useDraggable } from "../dnd/hooks/useDraggable";
import { ImageContextMenu } from "./ImageContextMenu";
import { ImageDirectEditor } from "./ImageDirectEditor";
import { useCreditValidation } from "@/hooks/useCreditValidation";
import { InsufficientCreditsModal } from "@/components/ui/insufficient-credits-modal";
import { useCredits } from "@/contexts/CreditsContext";

interface ImagePosition {
  x: number;
  y: number;
  scale: number;
}

export default function RootImage({
  image,
  slideIndex,
  layoutType,
  shouldGenerate = true,
}: {
  image: { query: string; url?: string; position?: ImagePosition };
  slideIndex: number;
  layoutType?: string;
  shouldGenerate?: boolean;
}) {
  const { setSlides, imageModel } = usePresentationState();
  const { saveImmediately } = useDebouncedSave();
  const id = useId();
  const [imageUrl, setImageUrl] = useState<string | undefined>(image.url);
  const [isGenerating, setIsGenerating] = useState(!image.url);
  // Track generation attempts with a more robust approach
  const [generationAttempts, setGenerationAttempts] = useState(0);
  const [lastGenerationTime, setLastGenerationTime] = useState<number>(0);
  const maxGenerationAttempts = 3;
  const generationTimeoutMs = 30000; // 30 seconds timeout
  // State for image editor sheet
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  // State for image adjustment mode
  const [isAdjusting, setIsAdjusting] = useState(false);
  // State for error handling
  const [error, setError] = useState<string | undefined>();
  // State for showing delete popover
  const [showDeletePopover, setShowDeletePopover] = useState(false);
  // State for image position
  const [imagePosition, setImagePosition] = useState<ImagePosition>({
    x: image.position?.x ?? 50,
    y: image.position?.y ?? 50,
    scale: image.position?.scale ?? 1,
  });

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
  const editor = useEditorRef();
  // Create a fake element for dragging - with a unique ID
  const element = {
    id: id, // Unique ID to differentiate from editor nodes
    type: ImagePlugin.key,
    url: imageUrl,
    query: image.query,
    children: [{ text: "" }],
  };

  // Generate image with the given prompt (automatic - no credits)
  const generateImage = async (prompt: string) => {
    if (!shouldGenerate) {
      console.log(`Skipping image generation for slide ${slideIndex} - shouldGenerate is false`);
      return;
    }

    console.log(`🎨 Starting image generation for slide ${slideIndex} with model ${imageModel}`);
    console.log(`📝 Prompt: "${prompt.substring(0, 100)}${prompt.length > 100 ? '...' : ''}"`);
    
    setIsGenerating(true);
    setError(undefined);
    
    try {
      const result = await generateImageAction(prompt, imageModel, "BASIC_IMAGE", "4:3", false);
      
      if (result.success && result.image?.url) {
        const newImageUrl = result.image.url;
        console.log(`✅ Image generation successful for slide ${slideIndex}`);
        console.log(`🔗 Image URL: ${newImageUrl.substring(0, 50)}...`);

        setImageUrl(newImageUrl);

        // Get current slides state
        const { slides } = usePresentationState.getState();

        // Create updated slides array
        const updatedSlides = slides.map((slide: PlateSlide, index: number) => {
          if (index === slideIndex) {
            return {
              ...slide,
              rootImage: {
                query: prompt,
                url: newImageUrl,
              },
            };
          }
          return slide;
        });

        // Update slides with new array - use a timeout to ensure state update happens
        // This will trigger a re-render of both the editor and preview
        setTimeout(() => {
          setSlides(updatedSlides);
          void saveImmediately();
          console.log(`💾 Slide ${slideIndex} state updated and saved`);
        }, 100);

        // Atualizar os créditos no header após geração bem-sucedida
        await refetchCredits();

        // Reset generation state
        setIsGenerating(false);
        console.log(`🏁 Image generation completed for slide ${slideIndex}`);
      } else {
        const errorMsg = result.error || "Unknown error occurred";
        console.error(`❌ Image generation failed for slide ${slideIndex}:`, errorMsg);
        setError(`Failed to generate image: ${errorMsg}`);
        setIsGenerating(false);
      }
    } catch (error) {
      console.error(`💥 Exception during image generation for slide ${slideIndex}:`, error);
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      setError(`Failed to generate image: ${errorMsg}`);
      setIsGenerating(false);
    }
  };

  // Generate image manually (user action - consumes credits)
  const generateImageManually = async (prompt: string) => {
    // Verificar créditos antes de gerar imagem
    const creditCheck = await checkCredits('IMAGE_GENERATION');
    
    if (!creditCheck.allowed) {
      setCreditError({
        creditsNeeded: creditCheck.cost,
        currentCredits: creditCheck.currentCredits,
        actionName: 'Gerar Imagem'
      });
      setShowInsufficientCreditsModal(true);
      return;
    }
    
    setIsGenerating(true);
    setError(undefined);
    try {
      
      const result = await generateImageAction(prompt, imageModel, "BASIC_IMAGE", "4:3", true);
      
      if (result.success && result.image?.url) {
        const newImageUrl = result.image.url;

        setImageUrl(newImageUrl);

        // Get current slides state
        const { slides } = usePresentationState.getState();

        // Create updated slides array
        const updatedSlides = slides.map((slide: PlateSlide, index: number) => {
          if (index === slideIndex) {
            return {
              ...slide,
              rootImage: {
                query: prompt,
                url: newImageUrl,
              },
            };
          }
          return slide;
        });

        // Update slides with new array - use a timeout to ensure state update happens
        // This will trigger a re-render of both the editor and preview
        setTimeout(() => {
          setSlides(updatedSlides);

          // Force an immediate save to ensure the image URL is persisted
          void saveImmediately();
        }, 100);

        // Atualizar os créditos no header após geração bem-sucedida
        await refetchCredits();

        // Ensure the generating state is properly reset
        setIsGenerating(false);
      } else {
        const errorMsg = result.error || "Unknown error occurred";
        console.error("Image generation failed:", errorMsg);
        setError(`Failed to generate image: ${errorMsg}`);
        setIsGenerating(false);
      }
    } catch (error) {
      console.error("Error generating image:", error);
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      setError(`Failed to generate image: ${errorMsg}`);
      setIsGenerating(false);
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate image if query is provided but no URL exists
  useEffect(() => {
    // Skip if there's no query or if URL already exists
    if (!image.query || image.url || imageUrl) {
      return;
    }

    // Skip if we've exceeded max attempts
    if (generationAttempts >= maxGenerationAttempts) {
      console.warn(`Max generation attempts (${maxGenerationAttempts}) reached for slide ${slideIndex}`);
      return;
    }

    // Skip if we're currently generating
    if (isGenerating) {
      return;
    }

    // Check if we need to wait due to recent attempt
    const now = Date.now();
    const timeSinceLastAttempt = now - lastGenerationTime;
    const minDelayBetweenAttempts = 2000; // 2 seconds

    if (timeSinceLastAttempt < minDelayBetweenAttempts && lastGenerationTime > 0) {
      // Schedule retry after delay
      const remainingDelay = minDelayBetweenAttempts - timeSinceLastAttempt;
      console.log(`Scheduling retry for slide ${slideIndex} in ${remainingDelay}ms`);
      
      const timeoutId = setTimeout(() => {
        setGenerationAttempts(prev => prev + 1);
        setLastGenerationTime(Date.now());
      }, remainingDelay);

      return () => clearTimeout(timeoutId);
    }

    // Start generation
    console.log(`Starting image generation for slide ${slideIndex}, attempt ${generationAttempts + 1}/${maxGenerationAttempts}`);
    setGenerationAttempts(prev => prev + 1);
    setLastGenerationTime(now);
    void generateImage(image.query);
  }, [image.query, image.url, imageUrl, slideIndex, generationAttempts, isGenerating, lastGenerationTime]);

  // Timeout detection and retry mechanism
  useEffect(() => {
    if (!isGenerating || !image.query || imageUrl) {
      return;
    }

    const timeoutId = setTimeout(() => {
      console.warn(`Image generation timeout for slide ${slideIndex}, attempting retry...`);
      setIsGenerating(false);
      setError("Generation timeout, retrying...");
      
      // Trigger retry by incrementing attempts (if under limit)
      if (generationAttempts < maxGenerationAttempts) {
        setTimeout(() => {
          setError(undefined);
          setGenerationAttempts(prev => prev + 1);
          setLastGenerationTime(Date.now());
        }, 1000);
      } else {
        setError(`Failed to generate image after ${maxGenerationAttempts} attempts`);
      }
    }, generationTimeoutMs);

    return () => clearTimeout(timeoutId);
  }, [isGenerating, slideIndex, generationAttempts, imageUrl, image.query]);

  // Handle successful drops
  const onDragEnd = (item: DragItemNode, monitor: DragSourceMonitor) => {
    
    const dropResult: { droppedInLayoutZone: boolean } =
      monitor.getDropResult()!;
    // Only remove if it was dropped (didDrop) but NOT in a layout zone
    if (monitor.didDrop() && !dropResult?.droppedInLayoutZone) {
      removeRootImageFromSlide();
    }
    editor.setOption(DndPlugin, "isDragging", false);
  };

  // Use the draggable hook
  const { isDragging, handleRef } = useDraggable({
    element: element,
    drag: {
      end: onDragEnd,
    },
  });

  // Function to remove the root image from the slide after successful drop
  const removeRootImageFromSlide = () => {
    const { slides } = usePresentationState.getState();
    const updatedSlides = slides.map((slide, index) => {
      if (
        index === slideIndex &&
        slide.rootImage &&
        [image.url, imageUrl].includes(slide.rootImage.url ?? "")
      ) {
        // Create a new slide object without the rootImage property
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { rootImage, ...rest } = slide;
        return rest;
      }
      return slide;
    });

    setSlides(updatedSlides);
    // Close popover if open
    setShowDeletePopover(false);
  };

  // Handler for editing the image
  const handleEditImage = () => {
    setIsSheetOpen(true);
  };

  return (
    <>
      <div
        className={cn(
          "flex-1 basis-[45%]",
          layoutType === "vertical" && "h-[300px] max-h-80 overflow-hidden relative"
        )}
      >
        {/* Quando estiver ajustando e for layout vertical, renderizar o editor em posição absoluta */}
        {isAdjusting && layoutType === "vertical" && (
            <div 
              className="absolute inset-0 z-[200]"
              style={{ height: '300px' }}
            >
            <ImageDirectEditor
              imageUrl={imageUrl ?? image.url}
              initialPosition={imagePosition}
              layoutType={layoutType}
              onPositionChange={(newPosition) => {
                // Atualizar o estado local
                setImagePosition(newPosition);
                
                // Atualizar o estado global
                const { slides } = usePresentationState.getState();
                const updatedSlides = slides.map((slide: any, index: number) => {
                  if (index === slideIndex && slide.rootImage) {
                    return {
                      ...slide,
                      rootImage: {
                        ...slide.rootImage,
                        position: newPosition,
                      },
                    };
                  }
                  return slide;
                });
                
                // Atualizar slides e salvar
                setTimeout(() => {
                  setSlides(updatedSlides);
                  void saveImmediately();
                }, 100);
              }}
              onEditComplete={() => setIsAdjusting(false)}
            />
          </div>
        )}
        
        <div
          className={cn(
            "h-full overflow-hidden border bg-background/80 shadow-md backdrop-blur-sm",
            isDragging && "opacity-50",
            isAdjusting && layoutType === "vertical" && "invisible" // Ocultar quando estiver ajustando em layout vertical
          )}
        >
          <div
            ref={handleRef}
            className="h-full cursor-grab active:cursor-grabbing"
          >
            {isGenerating ? (
              <div className="flex h-full flex-col items-center justify-center bg-muted/30 p-4">
                <Spinner className="mb-2 h-8 w-8" />
                <p className="text-sm text-muted-foreground">
                  Gerando imagem...
                </p>
              </div>
            ) : (
              <ImageContextMenu
                imageUrl={imageUrl ?? image.url}
                onEdit={handleEditImage}
                onRemove={removeRootImageFromSlide}
                onAdjustImage={() => setIsAdjusting(true)}
                onImageEdited={(newImageUrl) => {
          
                  setImageUrl(newImageUrl);
                  // Atualizar o estado global
                  const { slides } = usePresentationState.getState();
                  const updatedSlides = slides.map((slide: any, index: number) => {
                    if (index === slideIndex && slide.rootImage) {
                      return {
                        ...slide,
                        rootImage: {
                          ...slide.rootImage,
                          url: newImageUrl,
                        },
                      };
                    }
                    return slide;
                  });
                  setSlides(updatedSlides);
                  saveImmediately();
                  // Força re-renderização
                  setTimeout(() => {
                    setImageUrl(prev => prev); // Trigger re-render
                  }, 100);
                }}
              >
                <div className="relative h-full" tabIndex={0}>
                  {/* Renderizar o editor de ajuste apenas para layouts não verticais */}
                  {isAdjusting && layoutType !== "vertical" && (
                    <div style={{ 
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      zIndex: 100
                    }}>
                      <ImageDirectEditor
                        imageUrl={imageUrl ?? image.url}
                        initialPosition={imagePosition}
                        className="absolute inset-0"
                        layoutType={layoutType}
                        onPositionChange={(newPosition) => {
                          // Atualizar o estado local
                          setImagePosition(newPosition);
                          
                          // Atualizar o estado global
                          const { slides } = usePresentationState.getState();
                          const updatedSlides = slides.map((slide: any, index: number) => {
                            if (index === slideIndex && slide.rootImage) {
                              return {
                                ...slide,
                                rootImage: {
                                  ...slide.rootImage,
                                  position: newPosition,
                                },
                              };
                            }
                            return slide;
                          });
                          
                          // Atualizar slides e salvar
                          setTimeout(() => {
                            setSlides(updatedSlides);
                            void saveImmediately();
                          }, 100);
                        }}
                        onEditComplete={() => setIsAdjusting(false)}
                      />
                    </div>
                  )}
                  
                  <div style={{ 
                    display: (isAdjusting && layoutType !== "vertical") ? 'none' : 'block',
                    position: 'relative',
                    height: layoutType === "vertical" ? '300px' : '100%'
                  }}>
                    {/*  eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      key={imageUrl ?? image.url} // Força re-renderização quando URL muda
                      src={imageUrl ?? image.url}
                      alt={image.query}
                      className="h-full w-full object-cover"
                      style={{
                        objectPosition: `${imagePosition.x}% ${imagePosition.y}%`,
                        transform: `scale(${imagePosition.scale})`,
                      }}
                      onError={(e) => {
                        console.error(
                          "Image failed to load:",
                          e,
                          imageUrl ?? image.url
                        );
                        // Optionally set a fallback image or show an error state
                      }}
                    />
                  </div>
                </div>
              </ImageContextMenu>
            )}
          </div>
        </div>
      </div>

      {/* Image Editor Sheet */}
      <PresentationImageEditor
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        imageUrl={imageUrl ?? image.url}
        prompt={image.query}
        isGenerating={isGenerating}
        error={error}
        onRegenerateWithSamePrompt={() => {
          if (image.query) {
            void generateImageManually(image.query);
          }
        }}
        onGenerateWithNewPrompt={(newPrompt) => {
          void generateImageManually(newPrompt);
        }}
        onRemove={() => {
          // Remove a imagem do slide
          removeRootImageFromSlide();
          
          // Fechar o modal após remover a imagem
          setIsSheetOpen(false);
        }}
        onImageUpload={(newImageUrl) => {
          // Atualizar a URL da imagem
          setImageUrl(newImageUrl);
          
          // Atualizar o estado global
          const { slides } = usePresentationState.getState();
          const updatedSlides = slides.map((slide: PlateSlide, index: number) => {
            if (index === slideIndex) {
              return {
                ...slide,
                rootImage: {
                  query: image.query,
                  url: newImageUrl,
                },
              };
            }
            return slide;
          });
          
          // Atualizar slides e salvar
          setTimeout(() => {
            setSlides(updatedSlides);
            void saveImmediately();
          }, 100);
        }}
      />

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
