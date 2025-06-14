"use client";
import { useEffect, useRef } from "react";
import { useCompletion } from "ai/react";
import { toast } from "sonner";
import { usePresentationState } from "@/states/presentation-state";
import { SlideParser, type PlateSlide } from "../utils/parser";
import { updatePresentation } from "@/app/_actions/presentation/presentationActions";
import { extractSlideCount } from "@/lib/utils/prompt-parser";
import { detectLanguage, mapToSystemLanguage, getLanguageDisplayName } from "@/lib/language-detection";

export function PresentationGenerationManager() {
  const {
    numSlides,
    language,
    presentationInput,
    shouldStartOutlineGeneration,
    shouldStartPresentationGeneration,
    setIsGeneratingOutline,
    setShouldStartOutlineGeneration,
    setShouldStartPresentationGeneration,
    resetGeneration,
    setOutline,
    setSlides,
    setIsGeneratingPresentation,
    setNumSlides,
    isNumSlidesManuallySet,
    setLanguage,
  } = usePresentationState();

  // Create a ref for the streaming parser to persist between renders
  const streamingParserRef = useRef<SlideParser>(new SlideParser());

  // Add refs to track the animation frame IDs
  const slidesRafIdRef = useRef<number | null>(null);
  const outlineRafIdRef = useRef<number | null>(null);

  // Create buffer refs to store the latest content
  // Note: The types should match what setOutline and setSlides expect
  const slidesBufferRef = useRef<ReturnType<
    SlideParser["getAllSlides"]
  > | null>(null);
  const outlineBufferRef = useRef<string[] | null>(null);

  // Function to update slides using requestAnimationFrame
  const updateSlidesWithRAF = (): void => {
    // Always check for the latest slides in the buffer
    if (slidesBufferRef.current !== null) {
      setSlides(slidesBufferRef.current);
      slidesBufferRef.current = null;
    }
    // Clear the current frame ID
    slidesRafIdRef.current = null;
    // We don't recursively schedule new frames
    // New frames will be scheduled only when new content arrives
  };

  // Function to update outline using requestAnimationFrame
  const updateOutlineWithRAF = (): void => {
    // Always check for the latest outline in the buffer
    if (outlineBufferRef.current !== null) {
      setOutline(outlineBufferRef.current);
      outlineBufferRef.current = null;
    }
    // Clear the current frame ID
    outlineRafIdRef.current = null;
    // We don't recursively schedule new frames
    // New frames will be scheduled only when new content arrives
  };

  // Outline generation
  const { completion: outlineCompletion, complete: generateOutline } =
    useCompletion({
      api: "/api/presentation/outline",
      body: {
        prompt: presentationInput,
        numberOfCards: numSlides,
        language,
      },
      onFinish: () => {
        setIsGeneratingOutline(false);
        setShouldStartOutlineGeneration(false);
        setShouldStartPresentationGeneration(false);
        const {
          currentPresentationId,
          outline,
          currentPresentationTitle,
          theme,
        } = usePresentationState.getState();
        if (currentPresentationId) {
          void updatePresentation({
            id: currentPresentationId,
            outline,
            title: currentPresentationTitle ?? "",
            theme,
          });
        }
        // Cancel any pending outline animation frame
        if (outlineRafIdRef.current !== null) {
          cancelAnimationFrame(outlineRafIdRef.current);
          outlineRafIdRef.current = null;
        }
      },
      onError: (error) => {
        toast.error("Failed to generate outline: " + error.message);
        resetGeneration();
        // Cancel any pending outline animation frame
        if (outlineRafIdRef.current !== null) {
          cancelAnimationFrame(outlineRafIdRef.current);
          outlineRafIdRef.current = null;
        }
      },
    });

  useEffect(() => {
    if (outlineCompletion && typeof outlineCompletion === "string") {
      // Parse the outline into sections
      const sections = outlineCompletion.split(/^# /gm).filter(Boolean);
      const outlineItems: string[] =
        sections.length > 0
          ? sections.map((section) => `# ${section}`.trim())
          : [outlineCompletion];
      // Store the latest outline in the buffer
      outlineBufferRef.current = outlineItems;
      // Only schedule a new frame if one isn't already pending
      if (outlineRafIdRef.current === null) {
        outlineRafIdRef.current = requestAnimationFrame(updateOutlineWithRAF);
      }
    }
  }, [outlineCompletion]);

  // Watch for outline generation start
  useEffect(() => {
    const startOutlineGeneration = async (): Promise<void> => {
      if (shouldStartOutlineGeneration) {
        try {
          setIsGeneratingOutline(true);
          // Get current state
          const { presentationInput, setLanguage } = usePresentationState.getState();
          
          // Detect language from the prompt
          const detectedLang = detectLanguage(presentationInput ?? "");
          const systemLanguage = mapToSystemLanguage(detectedLang);
          
          // Update the language in the state
          setLanguage(systemLanguage);
          
          // Save the detected language to the database immediately
          const { currentPresentationId } = usePresentationState.getState();
          if (currentPresentationId) {
            try {
              await updatePresentation({
                id: currentPresentationId,
                language: systemLanguage,
              });
            } catch (error) {
              console.error('Failed to save detected language to database:', error);
            }
          }
          
          // Show a toast notification about the detected language
          const languageName = getLanguageDisplayName(systemLanguage);
          toast.info(`Idioma detectado: ${languageName}`, {
            duration: 3000,
          });
          
          let finalSlideCount = numSlides;
          // PRIORITY 1: If user manually set the slide count, ALWAYS use it
          if (isNumSlidesManuallySet) {
            finalSlideCount = numSlides;
      
          } else {
            // PRIORITY 2: Only extract from prompt if user hasn't manually set the slide count
            // Aqui você pode passar algum valor default para maxCards se quiser, ou remover esse argumento do extractSlideCount
            const extractedSlideCount = extractSlideCount(presentationInput ?? "", undefined);
            // Update the numSlides state with the extracted count (but don't mark as manual)
            setNumSlides(extractedSlideCount, false);
            finalSlideCount = extractedSlideCount;
          }
          
          // Start the RAF cycle for outline updates
          if (outlineRafIdRef.current === null) {
            outlineRafIdRef.current =
              requestAnimationFrame(updateOutlineWithRAF);
          }
          await generateOutline(presentationInput ?? "", {
            body: {
              prompt: presentationInput ?? "",
              numberOfCards: finalSlideCount, // Use the final count (extracted or manual)
              language: systemLanguage, // Use the detected language
            },
          });
        } catch (error) {
          console.log(error);
          // Error is handled by onError callback
        } finally {
          setIsGeneratingOutline(false);
          setShouldStartOutlineGeneration(false);
        }
      }
    };
    void startOutlineGeneration();
  }, [shouldStartOutlineGeneration, setNumSlides, numSlides, isNumSlidesManuallySet]);

  const { completion: presentationCompletion, complete: generatePresentation } =
    useCompletion({
      api: "/api/presentation/generate",
      onFinish: (_prompt, _completion) => {
        const { currentPresentationId, currentPresentationTitle, theme, language } =
          usePresentationState.getState();
        const parser = streamingParserRef.current;
        parser.reset();
        parser.parseChunk(_completion);
        parser.finalize();
        parser.clearAllGeneratingMarks();
        const slides = parser.getAllSlides();
        slidesBufferRef.current = slides;
        requestAnimationFrame(updateSlidesWithRAF);
        if (currentPresentationId) {
          void updatePresentation({
            id: currentPresentationId,
            content: { slides: slides },
            title: currentPresentationTitle ?? "",
            theme,
            language, // Save the detected language to the presentation
          });
        }
        setIsGeneratingPresentation(false);
        setShouldStartPresentationGeneration(false);
        // Cancel any pending animation frame
        if (slidesRafIdRef.current !== null) {
          cancelAnimationFrame(slidesRafIdRef.current);
          slidesRafIdRef.current = null;
        }
      },
      onError: (error) => {
        toast.error("Failed to generate presentation: " + error.message);
        resetGeneration();
        streamingParserRef.current.reset();
        // Cancel any pending animation frame
        if (slidesRafIdRef.current !== null) {
          cancelAnimationFrame(slidesRafIdRef.current);
          slidesRafIdRef.current = null;
        }
      },
    });

  useEffect(() => {
    if (presentationCompletion) {
      try {
        streamingParserRef.current.reset();
        streamingParserRef.current.parseChunk(presentationCompletion);
        streamingParserRef.current.finalize();
        const allSlides = streamingParserRef.current.getAllSlides();
        // Store the latest slides in the buffer
        slidesBufferRef.current = allSlides;
        // Only schedule a new frame if one isn't already pending
        if (slidesRafIdRef.current === null) {
          slidesRafIdRef.current = requestAnimationFrame(updateSlidesWithRAF);
        }
      } catch (error) {
        console.error("Error processing presentation XML:", error);
        toast.error("Error processing presentation content");
      }
    }
  }, [presentationCompletion]);

  useEffect(() => {
    if (shouldStartPresentationGeneration) {
      const {
        outline,
        presentationInput,
        language,
        presentationStyle,
        currentPresentationTitle,
      } = usePresentationState.getState();
      
      // Detect language from the prompt if not already detected
      const detectedLang = detectLanguage(presentationInput ?? "");
      const systemLanguage = mapToSystemLanguage(detectedLang);
      
      // Update the language in the state if it's different
      if (systemLanguage !== language) {
        setLanguage(systemLanguage);
      }
      
      // Reset the parser before starting a new generation
      streamingParserRef.current.reset();
      setIsGeneratingPresentation(true);
      // Start the RAF cycle for slide updates
      if (slidesRafIdRef.current === null) {
        slidesRafIdRef.current = requestAnimationFrame(updateSlidesWithRAF);
      }
      
      void generatePresentation(presentationInput ?? "", {
        body: {
          title: presentationInput ?? currentPresentationTitle ?? "",
          outline,
          language: systemLanguage, // Use the detected language
          tone: presentationStyle,
        },
      });
    }
  }, [shouldStartPresentationGeneration]);

  // Clean up RAF on unmount
  useEffect(() => {
    return () => {
      if (slidesRafIdRef.current !== null) {
        cancelAnimationFrame(slidesRafIdRef.current);
        slidesRafIdRef.current = null;
      }
      if (outlineRafIdRef.current !== null) {
        cancelAnimationFrame(outlineRafIdRef.current);
        outlineRafIdRef.current = null;
      }
    };
  }, []);

  return null;
}