"use client";

import React, { useEffect, useState, useRef } from "react";
import { cn, withRef } from "@udecode/cn";
import { setNode, useEditorRef, withHOC } from "@udecode/plate-common/react";
import { Image, ImagePlugin, useMediaState } from "@udecode/plate-media/react";
import { ResizableProvider } from "@udecode/plate-resizable";
import { MediaPopover } from "@/components/text-editor/plate-ui/media-popover";
import { PlateElement } from "@/components/text-editor/plate-ui/plate-element";
import {
  Resizable,
  ResizeHandle,
  mediaResizeHandleVariants,
} from "@/components/text-editor/plate-ui/resizable";
import { type TImageElement } from "@udecode/plate-media";
import { Spinner } from "@/components/ui/spinner";
import { usePresentationState } from "@/states/presentation-state";
import { PresentationImageEditor } from "./presentation-image-editor";
import { useDebouncedSave } from "@/hooks/presentation/useDebouncedSave";
import { useDraggable } from "../dnd/hooks/useDraggable";
import { generateImageAction } from "@/app/_actions/image/generate";
import { ImageContextMenu } from "./ImageContextMenu";
import { ImageDirectEditor } from "./ImageDirectEditor";

interface ImagePosition {
  x: number;
  y: number;
  scale: number;
}

export interface PresentationImageElementProps {
  className?: string;
  children?: React.ReactNode;
  nodeProps?: Record<string, unknown>;
  element: TImageElement & {
    query?: string;
    position?: ImagePosition;
  };
}

export const PresentationImageElement = withHOC(
  ResizableProvider,
  withRef<typeof PlateElement, PresentationImageElementProps>(
    ({ children, className, nodeProps, ...props }, ref) => {
      const { align = "center", focused, readOnly, selected } = useMediaState();
      const { isDragging, handleRef } = useDraggable({
        element: props.element,
      });
      const imageRef = useRef<HTMLDivElement | null>(null);
      const editor = useEditorRef();
      const { saveImmediately } = useDebouncedSave();
      const [isSheetOpen, setIsSheetOpen] = useState(false);
      const [isAdjusting, setIsAdjusting] = useState(false);
      const [isGenerating, setIsGenerating] = useState(false);
      const [error, setError] = useState<string | undefined>(undefined);
      const [imageUrl, setImageUrl] = useState<string | undefined>(
        props.element.url
      );
      const [imagePosition, setImagePosition] = useState<ImagePosition>({
        x: props.element.position ? props.element.position.x : 50,
        y: props.element.position ? props.element.position.y : 50,
        scale: props.element.position ? props.element.position.scale : 1,
      });
      const { imageModel } = usePresentationState();
      const hasHandledGenerationRef = useRef(false);

      const generateImage = async (prompt: string) => {
        const container = document.querySelector(".presentation-slides");
        const isEditorReadOnly = !container?.contains(imageRef?.current);
        // Prevent image generation in read-only mode
        console.log(isEditorReadOnly, hasHandledGenerationRef.current);
        if (isEditorReadOnly) {
          return;
        }
        setIsGenerating(true);
        setError(undefined);
        try {
          hasHandledGenerationRef.current = true;
          const result = await generateImageAction(prompt, imageModel);
          if (
            result &&
            typeof result === "object" &&
            "success" in result &&
            result.success === true &&
            result.image?.url
          ) {
            const newImageUrl = result.image.url;
            setImageUrl(newImageUrl);

            // Update the element's URL and query in the editor
            setNode(editor, props.element, {
              url: newImageUrl,
              query: prompt,
            });

            // Force an immediate save to ensure the image URL is persisted
            setTimeout(() => {
              void saveImmediately();
            }, 500);
          }
        } catch (error) {
          console.error("Error generating image:", error);
          setError("Failed to generate image. Please try again.");
        } finally {
          setIsGenerating(false);
        }
      };

      // Generate image if query is provided but no URL exists
      useEffect(() => {
        // Skip if in read-only mode, we've already handled this element, or if there's no query or if URL already exists
        if (
          hasHandledGenerationRef.current ||
          !props.element.query ||
          props.element.url ||
          imageUrl
        ) {
          return;
        }

        // Use the same generateImage function we defined above
        if (props.element.query) {
          void generateImage(props.element.query);
        }
      }, [
        props.element.query,
        props.element.url,
        imageUrl,
        props.element.setNodeValue,
      ]);

      return (
        <>
          <MediaPopover plugin={ImagePlugin}>
            <PlateElement ref={ref} className={cn(className)} {...props}>
              <div ref={imageRef}>
                <Resizable
                  align={align}
                  options={{
                    align,
                    readOnly,
                  }}
                >
                  <ResizeHandle
                    className={mediaResizeHandleVariants({ direction: "left" })}
                    options={{ direction: "left" }}
                  />
                  {isGenerating ? (
                    <div className="relative w-full">
                      <div className="absolute inset-0 flex items-center justify-center rounded-sm bg-muted">
                        <div className="flex flex-col items-center gap-2">
                          <Spinner className="h-6 w-6" />
                          <span className="text-sm text-muted-foreground">
                            Generating image...
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="presentation-image-container">
                      <ImageContextMenu 
                        imageUrl={imageUrl}
                        onEdit={() => {
                          if (!readOnly) {
                            setIsSheetOpen(true);
                          }
                        }}
                        onAdjustImage={() => {
                          if (!readOnly) {
                            setIsAdjusting(true);
                          }
                        }}
                        onImageEdited={(newImageUrl) => {
                          if (!readOnly) {
                            console.log('Image edited, updating from:', imageUrl, 'to:', newImageUrl);
                            setImageUrl(newImageUrl);
                            setNode(editor, props.element, {
                              url: newImageUrl,
                            });
                            saveImmediately();
                            // Força re-renderização
                            setTimeout(() => {
                              setImageUrl(prev => prev); // Trigger re-render
                            }, 100);
                          }
                        }}
                      >
                        <div className="relative overflow-hidden" style={{ position: 'relative' }}>
                          <div style={{ 
                            position: isAdjusting ? 'absolute' : 'relative',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            zIndex: isAdjusting ? 100 : 'auto',
                            display: isAdjusting ? 'block' : 'none'
                          }}>
                            {isAdjusting && (
                              <ImageDirectEditor
                                imageUrl={imageUrl}
                                initialPosition={imagePosition}
                                className="absolute inset-0"
                                onPositionChange={(newPosition) => {
                                  // Atualizar o estado local
                                  setImagePosition(newPosition);
                                  
                                  // Atualizar a posição da imagem no editor
                                  if (editor && props.element) {
                                    setNode(editor, props.element, {
                                      position: newPosition,
                                    });
                                    
                                    // Salvar as alterações
                                    setTimeout(() => {
                                      void saveImmediately();
                                    }, 500);
                                  }
                                }}
                                onEditComplete={() => setIsAdjusting(false)}
                              />
                            )}
                          </div>
                          
                          <div style={{ 
                            display: isAdjusting ? 'none' : 'block',
                            position: 'relative'
                          }}>
                            <Image
                              ref={handleRef}
                              key={imageUrl} // Força re-renderização quando URL muda
                              className={cn(
                                "presentation-image",
                                "cursor-pointer",
                                focused &&
                                  selected &&
                                  "ring-2 ring-ring ring-offset-2",
                                isDragging && "opacity-50"
                              )}
                              style={{
                                objectFit: "cover",
                                objectPosition: `${imagePosition.x}% ${imagePosition.y}%`,
                                transform: `scale(${imagePosition.scale})`,
                              }}
                              alt={props.element.query ?? ""}
                              src={imageUrl}
                              onError={(e) => {
                                console.error(
                                  "Presentation image failed to load:",
                                  e,
                                  imageUrl
                                );
                              }}
                              {...nodeProps}
                            />
                          </div>
                        </div>
                      </ImageContextMenu>
                    </div>
                  )}
                  <ResizeHandle
                    className={mediaResizeHandleVariants({
                      direction: "right",
                    })}
                    options={{ direction: "right" }}
                  />
                  {children}
                </Resizable>
              </div>
            </PlateElement>
          </MediaPopover>

          {/* Image Editor Sheet */}
          <PresentationImageEditor
            open={isSheetOpen}
            onOpenChange={setIsSheetOpen}
            imageUrl={imageUrl}
            prompt={props.element.query}
            isGenerating={isGenerating}
            error={error}
            onRegenerateWithSamePrompt={() => {
              if (props.element.query) {
                void generateImage(props.element.query);
              }
            }}
            onGenerateWithNewPrompt={(newPrompt) => {
              void generateImage(newPrompt);
            }}
            onRemove={() => {
              // Remove a imagem definindo a URL como vazia
              if (editor && props.element) {
                setNode(editor, props.element, {
                  url: "",
                });
                
                // Fechar o modal após remover a imagem
                setIsSheetOpen(false);
                
                // Salvar as alterações
                setTimeout(() => {
                  void saveImmediately();
                }, 500);
              }
            }}
            onImageUpload={(newImageUrl) => {
              // Atualizar a URL da imagem no editor
              if (editor && props.element) {
                setNode(editor, props.element, {
                  url: newImageUrl,
                });
                
                // Atualizar o estado local
                setImageUrl(newImageUrl);
                
                // Salvar as alterações
                setTimeout(() => {
                  void saveImmediately();
                }, 500);
              }
            }}
          />

        </>
      );
    }
  )
);
