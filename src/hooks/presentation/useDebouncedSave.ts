import { useCallback, useRef, useEffect } from "react";
import debounce from "lodash.debounce";
import { usePresentationState } from "@/states/presentation-state";
import { updatePresentation } from "@/app/_actions/presentation/presentationActions";

interface UseDebouncedSaveOptions {
  /**
   * Debounce delay in milliseconds
   * @default 1000
   */
  delay?: number;
}

/**
 * Custom hook for debounced saving of presentation slides
 * Automatically saves when slides are changed after the specified delay
 * Will not save while content is being generated
 */
export const useDebouncedSave = (options: UseDebouncedSaveOptions = {}) => {
  const { delay = 1000 } = options;
  const { setSavingStatus } = usePresentationState();

  // Create debounced save function
  const debouncedSave = useRef(
    debounce(
      async () => {
        console.log(`[SAVE_DEBOUNCE] Iniciando salvamento debounced...`);
        
        // Get the latest state directly from the store
        const {
          slides,
          currentPresentationId,
          currentPresentationTitle,
          theme,
          outline,
          imageModel,
          presentationStyle,
          language,
        } = usePresentationState.getState();

        console.log(`[SAVE_DEBOUNCE] Estado obtido: ID=${currentPresentationId}, Título=${currentPresentationTitle}, Total de slides=${slides.length}`);

        // Don't save if we're generating content or if there's no presentation
        if (!currentPresentationId || slides.length === 0) {
          console.log(`[SAVE_DEBOUNCE] Salvamento cancelado: ${!currentPresentationId ? 'Sem ID de apresentação' : 'Sem slides'}`);
          return;
        }
        
        try {
          setSavingStatus("saving");
          console.log(`[SAVE_DEBOUNCE] Status de salvamento definido como "saving"`);
          
          // Log para verificar se há ícones nos slides antes de salvar
          const iconsInSlides = slides.flatMap(slide => 
            slide.content?.filter(child => 
              child.type === "icon"
            ) || []
          );
          
          if (iconsInSlides.length > 0) {
            console.log(`[SAVE_DEBOUNCE] Enviando ${iconsInSlides.length} ícones para o banco de dados:`, 
              iconsInSlides.map(icon => ({ id: icon.id, name: (icon as any).name }))
            );
          }

          console.log(`[SAVE_DEBOUNCE] Chamando updatePresentation para ID=${currentPresentationId}`);
          const result = await updatePresentation({
            id: currentPresentationId,
            content: {
              slides,
            },
            title: currentPresentationTitle ?? "",
            outline,
            theme,
            imageModel,
            presentationStyle,
            language,
          });
          
          console.log(`[SAVE_DEBOUNCE] Resultado do salvamento:`, result);

          setSavingStatus("saved");
          console.log(`[SAVE_DEBOUNCE] Status de salvamento definido como "saved"`);
          
          // Reset to idle after 2 seconds
          setTimeout(() => {
            setSavingStatus("idle");
            console.log(`[SAVE_DEBOUNCE] Status de salvamento redefinido para "idle"`);
          }, 2000);
        } catch (error) {
          console.error("[SAVE_DEBOUNCE] Erro ao salvar apresentação:", error);
          setSavingStatus("idle");
        }
      },
      delay,
      { maxWait: delay * 2 }
    )
  ).current;

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      debouncedSave.cancel();
    };
  }, [debouncedSave]);

  // Save slides immediately (useful for manual saves)
  const saveImmediately = useCallback(async () => {
    console.log(`[SAVE_IMMEDIATE] Iniciando salvamento imediato...`);
    debouncedSave.cancel();
    console.log(`[SAVE_IMMEDIATE] Salvamento debounced cancelado`);

    // Get the latest state directly from the store
    const {
      slides,
      currentPresentationId,
      currentPresentationTitle,
      theme,
      outline,
      imageModel,
      presentationStyle,
      language,
    } = usePresentationState.getState();

    console.log(`[SAVE_IMMEDIATE] Estado obtido: ID=${currentPresentationId}, Título=${currentPresentationTitle}, Total de slides=${slides.length}`);

    // Don't save if there's no presentation
    if (!currentPresentationId || slides.length === 0) {
      console.log(`[SAVE_IMMEDIATE] Salvamento cancelado: ${!currentPresentationId ? 'Sem ID de apresentação' : 'Sem slides'}`);
      return;
    }

    try {
      setSavingStatus("saving");
      console.log(`[SAVE_IMMEDIATE] Status de salvamento definido como "saving"`);
      
      // Log para verificar se há ícones nos slides antes de salvar
      const iconsInSlides = slides.flatMap(slide => 
        slide.content?.filter(child => 
          child.type === "icon"
        ) || []
      );
      
      if (iconsInSlides.length > 0) {
        console.log(`[SAVE_IMMEDIATE] Enviando ${iconsInSlides.length} ícones para o banco de dados:`, 
          iconsInSlides.map(icon => ({ id: icon.id, name: (icon as any).name }))
        );
      }

      console.log(`[SAVE_IMMEDIATE] Chamando updatePresentation para ID=${currentPresentationId}`);
      const result = await updatePresentation({
        id: currentPresentationId,
        content: {
          slides,
        },
        title: currentPresentationTitle ?? "",
        outline,
        language,
        imageModel,
        presentationStyle,
        theme,
      });
      
      console.log(`[SAVE_IMMEDIATE] Resultado do salvamento:`, result);

      setSavingStatus("saved");
      console.log(`[SAVE_IMMEDIATE] Status de salvamento definido como "saved"`);
      
      // Reset to idle after 2 seconds
      setTimeout(() => {
        setSavingStatus("idle");
        console.log(`[SAVE_IMMEDIATE] Status de salvamento redefinido para "idle"`);
      }, 2000);
    } catch (error) {
      console.error("[SAVE_IMMEDIATE] Erro ao salvar apresentação:", error);
      setSavingStatus("idle");
    }
  }, [debouncedSave, setSavingStatus]);

  // Trigger save function
  const save = useCallback(() => {
    setSavingStatus("saving");
    void debouncedSave();
  }, [debouncedSave, setSavingStatus]);

  return {
    save,
    saveImmediately,
  };
};
