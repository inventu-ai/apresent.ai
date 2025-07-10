import { useEffect } from "react";
import { usePresentationState } from "@/states/presentation-state";
import { useDebouncedSave } from "./useDebouncedSave";

interface UseSlideChangeWatcherOptions {
  /**
   * The delay in milliseconds before triggering a save.
   * @default 1000
   */
  debounceDelay?: number;
}

/**
 * A hook that watches for changes to the slides and triggers
 * a debounced save function whenever changes are detected.
 */
export const useSlideChangeWatcher = (
  options: UseSlideChangeWatcherOptions = {}
) => {
  const { debounceDelay = 1000 } = options;
  const { slides, isGeneratingPresentation } = usePresentationState();
  const { save, saveImmediately } = useDebouncedSave({ delay: debounceDelay });

  // Watch for changes to the slides array and trigger save
  useEffect(() => {
    console.log(`[SLIDE_CHANGE] Detectada mudança nos slides. Total de slides: ${slides.length}`);
    
    // Only save if we have slides and we're not generating
    if (slides.length > 0) {
      console.log(`[SLIDE_CHANGE] Iniciando processo de salvamento...`);
      
      // Log para verificar se há ícones nos slides
      const iconsInSlides = slides.flatMap(slide => 
        slide.content?.filter(child => 
          child.type === "icon"
        ) || []
      );
      
      if (iconsInSlides.length > 0) {
        console.log(`[SLIDE_CHANGE] Encontrados ${iconsInSlides.length} ícones nos slides:`, 
          iconsInSlides.map(icon => ({ id: icon.id, name: (icon as any).name }))
        );
      } else {
        console.log(`[SLIDE_CHANGE] Nenhum ícone encontrado nos slides.`);
      }
      
      save();
    } else {
      console.log(`[SLIDE_CHANGE] Não há slides para salvar ou apresentação está sendo gerada.`);
    }
  }, [slides, save, isGeneratingPresentation]);

  return {
    // Expose the immediate save function for manual saving
    saveImmediately,
  };
};
