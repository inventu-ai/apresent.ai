"use client";

import { useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Wand2, LayoutGrid } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { SimpleCreditDisplay } from "@/components/ui/simple-credit-display";
import { usePresentationState } from "@/states/presentation-state";
import {
  type Themes,
  themes,
  type ThemeProperties,
} from "@/lib/presentation/themes";
import { Spinner } from "@/components/ui/spinner";
import { getCustomThemeById } from "@/app/_actions/presentation/theme-actions";
import { getPresentation } from "@/app/_actions/presentation/presentationActions";
import { type ImageModelList } from "@/app/_actions/image/generate";
import { ThemeBackground } from "@/components/presentation/theme/ThemeBackground";
import { ThemeSettings } from "@/components/presentation/theme/ThemeSettings";
import { Header } from "@/components/presentation/outline/Header";
import { PromptInput } from "@/components/presentation/outline/PromptInput";
import { RegenerateButton } from "@/components/presentation/outline/RegenerateButton";
import { OutlineList } from "@/components/presentation/outline/OutlineList";
import PresentationHeader from "@/components/presentation/presentation-page/PresentationHeader";
import { PresentationsSidebar } from "@/components/presentation/dashboard/PresentationsSidebar";
import { useTranslation } from "@/contexts/LanguageContext";

export default function ApresentAIGenerateWithIdPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const {
    setCurrentPresentation,
    setPresentationInput,
    startPresentationGeneration,
    isGeneratingPresentation,
    isGeneratingOutline,
    setOutline,
    setShouldStartOutlineGeneration,
    setTheme,
    setImageModel,
    setPresentationStyle,
    setLanguage,
    outline,
  } = usePresentationState();

  // Track if this is a fresh navigation or a revisit
  const initialLoadComplete = useRef(false);
  const generationStarted = useRef(false);

  // Use React Query to fetch presentation data
  const { data: presentationData, isLoading: isLoadingPresentation } = useQuery(
    {
      queryKey: ["presentation", id],
      queryFn: async () => {
        const result = await getPresentation(id);
        if (!result.success) {
          throw new Error(result.message ?? "Failed to load presentation");
        }
        return result.presentation;
      },
      enabled: !!id,
    }
  );

  // This effect handles the immediate startup of generation upon first mount
  // only if we're coming fresh from the dashboard (isGeneratingOutline === true)
  useEffect(() => {
    // Only run once on initial page load
    if (initialLoadComplete.current) return;
    initialLoadComplete.current = true;

    // If isGeneratingOutline is true but generation hasn't been started yet,
    // this indicates we just came from the dashboard and should start generation
    if (isGeneratingOutline && !generationStarted.current) {
      console.log("Starting outline generation after navigation");
      generationStarted.current = true;

      // Give the component time to fully mount and establish connections
      // before starting the generation process
      setTimeout(() => {
        setShouldStartOutlineGeneration(true);
      }, 100);
    }
  }, [isGeneratingOutline, setShouldStartOutlineGeneration]);

  // Update presentation state when data is fetched
  useEffect(() => {
    if (presentationData && !isLoadingPresentation) {
      setCurrentPresentation(presentationData.id, presentationData.title);
      // Use the original prompt if available, otherwise use the title
      const { originalPrompt } = usePresentationState.getState();
      setPresentationInput(originalPrompt || presentationData.title);

      if (presentationData.presentation?.outline) {
        setOutline(presentationData.presentation.outline);
      }

      // Set theme if available
      if (presentationData?.presentation?.theme) {
        const themeId = presentationData.presentation.theme;

        // Check if this is a predefined theme
        if (themeId in themes) {
          // Use predefined theme
          setTheme(themeId as Themes);
        } else {
          // If not in predefined themes, treat as custom theme
          void getCustomThemeById(themeId)
            .then((result) => {
              if (result.success && result.theme) {
                // Set the theme with the custom theme data
                const themeData = result.theme
                  .themeData as unknown as ThemeProperties;
                setTheme(themeId, themeData);
              } else {
                // Fallback to default theme if custom theme not found
                console.warn("Custom theme not found:", themeId);
                setTheme("mystique");
              }
            })
            .catch((error) => {
              console.error("Failed to load custom theme:", error);
              // Fallback to default theme on error
              setTheme("mystique");
            });
        }
      }

      // Set imageModel if available
      if (presentationData?.presentation?.imageModel) {
        setImageModel(
          presentationData?.presentation?.imageModel as ImageModelList
        );
      }

      // Set presentationStyle if available
      if (presentationData?.presentation?.presentationStyle) {
        setPresentationStyle(presentationData.presentation.presentationStyle);
      }

      // Set language if available, but only if we're not currently generating
      // (to avoid overriding the detected language during generation)
      if (presentationData.presentation?.language && !isGeneratingOutline) {
        setLanguage(presentationData.presentation.language);
      }
    }
  }, [
    presentationData,
    isLoadingPresentation,
    setCurrentPresentation,
    setPresentationInput,
    setOutline,
    setTheme,
    setImageModel,
    setPresentationStyle,
    setLanguage,
  ]);

  const handleGenerate = async () => {
    // Verificar créditos antes de redirecionar
    try {
      const response = await fetch('/api/user/credits/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'PRESENTATION_CREATION' }),
      });
      
      const creditData = await response.json();
      
      if (!creditData.allowed) {
        // Não redirecionar se não tiver créditos - o modal será mostrado pelo PresentationGenerationManager
        startPresentationGeneration();
        return;
      }
    } catch (error) {
      console.error("Error checking credits:", error);
      return;
    }

    // Só redirecionar se tiver créditos suficientes
    router.push(`/apresentai/${id}`);
    startPresentationGeneration();
  };

  const handleBack = () => {
    router.push('/');
  };

  if (isLoadingPresentation) {
    return (
      <div className="min-h-screen bg-background">
        <PresentationHeader title="Loading..." />
        <PresentationsSidebar />
        <ThemeBackground>
          <div className="flex h-[calc(100vh-3rem)] flex-col items-center justify-center">
            <div className="relative">
              <Spinner className="h-10 w-10 text-primary" />
            </div>
            <div className="space-y-2 text-center">
              <h2 className="text-2xl font-bold">{t.presentation.loadingPresentationOutline}</h2>
              <p className="text-muted-foreground">{t.presentation.pleaseWaitMoment}</p>
            </div>
          </div>
        </ThemeBackground>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <PresentationHeader title="Generate Outline" />
      <PresentationsSidebar />
      
      <ThemeBackground>
        <Button
          variant="ghost"
          className={`flex items-center gap-2 text-muted-foreground hover:text-foreground ${
            isMobile 
              ? "mx-auto mt-4 mb-2" 
              : "absolute left-10 top-16"
          }`}
          onClick={() => router.push('/')}
        >
          <ArrowLeft className="h-4 w-4" />
          {t.presentation.back}
        </Button>
        <div className={`mx-auto max-w-4xl space-y-8 p-8 ${isMobile ? "pt-2" : "pt-6"}`}>
          {/* Back button positioned correctly below navbar */}

          <div className="space-y-8">
            <Header />
            <PromptInput />
            <RegenerateButton />
            <OutlineList />

            <div className="!mb-32 space-y-4 rounded-lg border bg-muted/30 p-6">
              <h2 className="text-lg font-semibold">{t.presentation.customizeTheme}</h2>
              <ThemeSettings />
            </div>
          </div>
        </div>

<div className="fixed bottom-0 left-0 right-0 flex items-center justify-center border-t bg-background/80 p-4 backdrop-blur-sm z-50">
  <div className="flex items-center w-full max-w-4xl">
    {/* Créditos do usuário (esquerda) - posicionado próximo ao botão */}
    <div className="flex-1 flex justify-start pr-4 text-center md:text-start">
      <SimpleCreditDisplay />
    </div>
    
    {/* Botão Gerar (centro) */}
    <div>
      <Button
        size="lg"
        className="gap-2 px-8 text-base"
        onClick={handleGenerate}
        disabled={isGeneratingPresentation}
      >
        <Wand2 className="h-5 w-5" />
        {isGeneratingPresentation ? t.presentation.generating : t.presentation.generateButton}
      </Button>
    </div>

    {/* Total de cartões (direita) - posicionado próximo ao botão */}
    <div className="flex-1 flex justify-end items-center pl-4">
      <LayoutGrid className="h-4 w-4 text-muted-foreground mr-1" />
      <span className="text-base font-medium text-center md:text-start">{outline?.length || 0} {t.presentation.cardsTotal}</span>
    </div>
  </div>
</div>
      </ThemeBackground>
    </div>
  );
}
