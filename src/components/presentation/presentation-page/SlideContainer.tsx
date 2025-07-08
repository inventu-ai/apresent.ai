"use client";

import { GripVertical, Plus, Trash, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { usePresentationState } from "@/states/presentation-state";
import { type PlateSlide } from "../utils/parser";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { RegenerateSlideButton } from "./buttons/RegenerateSlideButton";
import { GenerateSlideFromTextButton } from "./buttons/GenerateSlideFromTextButton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { SlideEditPopover } from "./SlideEditPopover";
import { nanoid } from "nanoid";
import { useEffect, useCallback } from "react";

interface SlideContainerProps {
  children: React.ReactNode;
  index: number;
  id: string;
  className?: string;
}

export function SlideContainer({
  children,
  index,
  id,
  className,
}: SlideContainerProps) {
  const {
    slides,
    setSlides,
    isPresenting,
    currentSlideIndex,
    setCurrentSlideIndex,
    setIsPresenting,
    currentPresentationTitle,
    presentationInput,
  } = usePresentationState();

  const currentSlide = slides[index];
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Improved keyboard navigation for presentation mode
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Only handle keyboard events if we're presenting and this is the current slide
    if (!isPresenting || index !== currentSlideIndex) return;

    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown":
      case " ": // Space bar
        event.preventDefault();
        event.stopPropagation();
        if (currentSlideIndex < slides.length - 1) {
          setCurrentSlideIndex(currentSlideIndex + 1);
        }
        break;
      case "ArrowLeft":
      case "ArrowUp":
        event.preventDefault();
        event.stopPropagation();
        if (currentSlideIndex > 0) {
          setCurrentSlideIndex(currentSlideIndex - 1);
        }
        break;
      case "Escape":
        event.preventDefault();
        event.stopPropagation();
        setIsPresenting(false);
        break;
      case "Home":
        event.preventDefault();
        event.stopPropagation();
        setCurrentSlideIndex(0);
        break;
      case "End":
        event.preventDefault();
        event.stopPropagation();
        setCurrentSlideIndex(slides.length - 1);
        break;
    }
  }, [isPresenting, index, currentSlideIndex, slides.length, setCurrentSlideIndex, setIsPresenting]);

  useEffect(() => {
    if (!isPresenting || index !== currentSlideIndex) return;

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isPresenting, index, currentSlideIndex, handleKeyDown]);

  const addNewSlide = (position: "before" | "after") => {
    // Gerar um título mais descritivo baseado no contexto da apresentação
    const generateMeaningfulTitle = (): string => {
      // Usar o título da apresentação como primeira opção
      if (currentPresentationTitle) {
        // Verificar se o título da apresentação parece ser uma instrução ou comando
        const lowerTitle = currentPresentationTitle.toLowerCase().trim();
        if (lowerTitle.startsWith("faça") || 
            lowerTitle.startsWith("crie") || 
            lowerTitle.startsWith("gere") || 
            lowerTitle.startsWith("make") || 
            lowerTitle.startsWith("create")) {
          return "Novo Slide";
        }
        
        // Extrair uma parte significativa do título da apresentação
        const words = currentPresentationTitle.trim().split(/\s+/);
        if (words.length > 2) {
          return words.slice(0, 2).join(' ');
        }
        return currentPresentationTitle.trim();
      }
      
      // Se não tiver título da apresentação, usar um título genérico mais descritivo
      return "Novo Slide";
    };

    const newSlide: PlateSlide = {
      content: [
        {
          type: "h1",
          children: [{ text: generateMeaningfulTitle() }],
        },
      ],
      id: nanoid(),
      alignment: "center",
      isNew: true, // Flag para identificar slide novo
    };

    const updatedSlides = [...slides];
    const insertIndex = position === "before" ? index : index + 1;
    updatedSlides.splice(insertIndex, 0, newSlide);
    setSlides(updatedSlides);
  };

  const deleteSlide = () => {
    const updatedSlides = [...slides];
    updatedSlides.splice(index, 1);
    setSlides(updatedSlides);
  };

  // Determine if this slide should be visible
  const isCurrentSlide = index === currentSlideIndex;
  const shouldShow = !isPresenting || isCurrentSlide;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group/card-container relative z-10 grid w-full place-items-center pb-6",
        isDragging && "z-50 opacity-50",
        isPresenting && "fixed inset-0 pb-0 group/presentation",
        isCurrentSlide && isPresenting && "z-[999]",
        // Hide slides that are not current during presentation
        !shouldShow && "hidden"
      )}
      {...attributes}
    >
      {/* Exit button for presentation mode */}
      {isPresenting && isCurrentSlide && (
        <Button
          variant="ghost"
          size="icon"
          className="fixed right-4 top-4 z-[1002] h-10 w-10 rounded-full bg-black/50 text-white opacity-0 backdrop-blur-sm transition-opacity duration-300 hover:bg-black/70 group-hover/presentation:opacity-100"
          onClick={() => setIsPresenting(false)}
        >
          <X className="h-5 w-5" />
        </Button>
      )}

      <div
        className={cn(
          "relative w-full",
          !isPresenting && currentSlide?.width !== "M" && "max-w-5xl",
          !isPresenting && currentSlide?.width !== "L" && "max-w-6xl",
          isPresenting && "h-full w-full flex items-center justify-center",
          className
        )}
      >
        {!isPresenting && (
          <>
            {/* Botão de geração de slide com IA */}
            <GenerateSlideFromTextButton slideIndex={index} />
    
          </>
        )}
        {!isPresenting && (
          <div className="absolute left-4 top-2 z-[100] flex items-center gap-1 rounded-full bg-black/30 px-2 py-1 backdrop-blur-sm opacity-0 transition-opacity duration-200 group-hover/card-container:opacity-100">
            <Button
              variant="ghost"
              size="icon"
              className="!size-8 cursor-grab rounded-full bg-black/20 shadow-sm hover:bg-black/40"
              {...listeners}
            >
              <GripVertical className="h-4 w-4 text-white" />
            </Button>

            <SlideEditPopover index={index} />
            
            <RegenerateSlideButton slideIndex={index} />

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="!size-8 rounded-full bg-black/20 shadow-sm hover:bg-black/40 hover:text-destructive"
                >
                  <Trash className="h-4 w-4 text-white" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Slide</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete slide {index + 1}? This
                    action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction asChild>
                    <Button variant="destructive" onClick={deleteSlide}>
                      Delete
                    </Button>
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}

        {children}
      </div>

      {!isPresenting && (
        <div className="absolute bottom-0 left-1/2 z-10 -translate-x-1/2 translate-y-1/2 opacity-0 transition-opacity duration-200 group-hover/card-container:opacity-100">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-full bg-background shadow-md"
            onClick={() => addNewSlide("after")}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      )}

      {isPresenting && isCurrentSlide && (
        <div className="absolute bottom-0.5 left-1 right-1 z-[1001]">
          <div className="flex h-1.5 w-full gap-1">
            {slides.map((_, slideIndex) => (
              <button
                key={slideIndex}
                className={`h-full flex-1 rounded-full transition-all ${
                  slideIndex === currentSlideIndex
                    ? "bg-primary shadow-sm"
                    : "bg-white/20 hover:bg-white/40"
                }`}
                onClick={() => setCurrentSlideIndex(slideIndex)}
                aria-label={`Go to slide ${slideIndex + 1}`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
