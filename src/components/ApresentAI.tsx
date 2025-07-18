'use client'

import React from "react"
import { Gravity, MatterBody } from "@/components/ui/gravity"
import PresentationHeader from "@/components/presentation/presentation-page/PresentationHeader"
import { PresentationsSidebar } from "@/components/presentation/dashboard/PresentationsSidebar"
import { Button } from "@/components/ui/button"
import { ArrowUp, Loader2 } from "lucide-react"
import { usePresentationState } from "@/states/presentation-state"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { createEmptyPresentation } from "@/app/_actions/presentation/presentationActions"
import { useMemo, useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useSearchParams } from "next/navigation"
import { LoginModal } from "@/components/auth/LoginModal"
import { useTranslation } from "@/contexts/LanguageContext"

function ApresentAI() {
  const router = useRouter();
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { t } = useTranslation();
  const {
    presentationInput,
    setPresentationInput,
    isGeneratingOutline,
    setCurrentPresentation,
    setIsGeneratingOutline,
    setOriginalPrompt,
  } = usePresentationState();

  // Check for prompt in URL parameters (after login redirect)
  useEffect(() => {
    const promptFromUrl = searchParams.get('prompt');
    if (promptFromUrl && !presentationInput) {
      setPresentationInput(decodeURIComponent(promptFromUrl));
      // Clean up URL
      const url = new URL(window.location.href);
      url.searchParams.delete('prompt');
      window.history.replaceState({}, '', url.toString());
    }
  }, [searchParams, presentationInput, setPresentationInput]);

  // Arrays de cores e fontes para randomização
  const backgroundColors = [
    'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500',
    'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-orange-500',
    'bg-teal-500', 'bg-cyan-500', 'bg-lime-500', 'bg-emerald-500',
    'bg-violet-500', 'bg-fuchsia-500', 'bg-rose-500', 'bg-amber-500',
    'bg-sky-500', 'bg-slate-500', 'bg-gray-500', 'bg-zinc-500'
  ];

  const fontFamilies = [
    'font-sans', 'font-serif', 'font-mono',
    'font-bold', 'font-semibold', 'font-medium',
    'font-light', 'font-thin', 'font-normal',
    'font-extrabold', 'font-black', 'font-extralight',
    'text-xs', 'text-sm', 'text-base', 'text-lg', 'text-xl',
    'text-2xl', 'text-3xl', 'text-4xl', 'text-5xl',
    'uppercase', 'lowercase', 'capitalize',
    'italic', 'not-italic',
    'tracking-tight', 'tracking-normal', 'tracking-wide', 'tracking-wider', 'tracking-widest',
    'leading-tight', 'leading-normal', 'leading-relaxed', 'leading-loose'
  ];

  // Função para gerar estilo aleatório
  const getRandomStyle = () => {
    const bgColor = backgroundColors[Math.floor(Math.random() * backgroundColors.length)];
    const fontFamily = fontFamilies[Math.floor(Math.random() * fontFamilies.length)];
    const textColor = Math.random() > 0.5 ? 'text-white' : 'text-black';
    
    return `text-2xl sm:text-3xl md:text-4xl ${bgColor} ${textColor} ${fontFamily} rounded-full hover:cursor-grab px-12 py-6`;
  };

  // Gerar estilos aleatórios para cada palavra (memoizado para não mudar a cada render)
  const wordStyles = useMemo(() => ({
    ai: getRandomStyle(),
    design: getRandomStyle(),
    templates: getRandomStyle(),
    creative: getRandomStyle(),
    fast: getRandomStyle(),
    smart: getRandomStyle(),
    slides: getRandomStyle(),
    charts: getRandomStyle(),
    visual: getRandomStyle(),
    graphics: getRandomStyle(),
    layout: getRandomStyle(),
    themes: getRandomStyle(),
    content: getRandomStyle(),
    animate: getRandomStyle()
  }), []);

  const handleGenerate = async () => {
    if (!presentationInput.trim()) {
      toast.error("Please enter a topic for your presentation");
      return;
    }

    // Check if user is logged in before proceeding
    if (!session) {
      // Store the prompt to preserve user input during auth flow
      setOriginalPrompt(presentationInput);
      
      // Show friendly login modal instead of redirecting immediately
      setShowLoginModal(true);
      return;
    }

    // Store the original prompt before creating the presentation
    setOriginalPrompt(presentationInput);

    // Set UI loading state
    setIsGeneratingOutline(true);

    try {
      const result = await createEmptyPresentation(
        presentationInput.substring(0, 50) || "Untitled Presentation"
      );

      if (result.success && result.presentation) {
        // Set the current presentation
        setCurrentPresentation(
          result.presentation.id,
          result.presentation.title
        );
        router.push(`/apresentai/generate/${result.presentation.id}`);
      } else {
        setIsGeneratingOutline(false);
        toast.error(result.message || "Failed to create presentation");
      }
    } catch (error) {
      setIsGeneratingOutline(false);
      console.error("Error creating presentation:", error);
      toast.error("Failed to create presentation");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  };

  const handleLoginSuccess = () => {
    setShowLoginModal(false);
    // After login, the user will be redirected back with the prompt
    // The useEffect will handle setting the prompt and we can proceed
  };

  return (
    <div className="fixed inset-0 w-full h-full z-0 bg-background">
      <PresentationHeader title="ApresentAI" />
      <PresentationsSidebar />
      <div className="w-full h-[calc(100vh-3rem)] min-h-[500px] flex flex-col relative">
        <div className="pt-32 text-6xl sm:text-7xl md:text-8xl text-foreground w-full text-center font-normal">
          Create
        </div>
        <p className="pt-1 text-3xl sm:text-4xl md:text-5xl text-foreground w-full text-center font-serif italic">
          presentations with AI
        </p>
        <Gravity gravity={{ x: 0, y: 1 }} className="w-full h-full" resetOnResize={false}>
          <MatterBody
            matterBodyOptions={{ friction: 0.5, restitution: 0.2 }}
            x="30%"
            y="10%"
          >
            <div className={wordStyles.ai}>
              AI
            </div>
          </MatterBody>
          <MatterBody
            matterBodyOptions={{ friction: 0.5, restitution: 0.2 }}
            x="30%"
            y="30%"
          >
            <div className={wordStyles.design}>
              Design
            </div>
          </MatterBody>
          <MatterBody
            matterBodyOptions={{ friction: 0.5, restitution: 0.2 }}
            x="40%"
            y="20%"
            angle={10}
          >
            <div className={wordStyles.templates}>
              Templates
            </div>
          </MatterBody>
          <MatterBody
            matterBodyOptions={{ friction: 0.5, restitution: 0.2 }}
            x="75%"
            y="10%"
          >
            <div className={wordStyles.creative}>
              Creative
            </div>
          </MatterBody>
          <MatterBody
            matterBodyOptions={{ friction: 0.5, restitution: 0.2 }}
            x="80%"
            y="20%"
          >
            <div className={wordStyles.fast}>
              Fast
            </div>
          </MatterBody>
          <MatterBody
            matterBodyOptions={{ friction: 0.5, restitution: 0.2 }}
            x="50%"
            y="10%"
          >
            <div className={wordStyles.smart}>
              Smart
            </div>
          </MatterBody>
          <MatterBody
            matterBodyOptions={{ friction: 0.5, restitution: 0.2 }}
            x="20%"
            y="15%"
          >
            <div className={wordStyles.slides}>
              Slides
            </div>
          </MatterBody>
          <MatterBody
            matterBodyOptions={{ friction: 0.5, restitution: 0.2 }}
            x="60%"
            y="25%"
          >
            <div className={wordStyles.charts}>
              Charts
            </div>
          </MatterBody>
          <MatterBody
            matterBodyOptions={{ friction: 0.5, restitution: 0.2 }}
            x="85%"
            y="35%"
            angle={-15}
          >
            <div className={wordStyles.visual}>
              Visual
            </div>
          </MatterBody>
          <MatterBody
            matterBodyOptions={{ friction: 0.5, restitution: 0.2 }}
            x="15%"
            y="40%"
          >
            <div className={wordStyles.graphics}>
              Graphics
            </div>
          </MatterBody>
          <MatterBody
            matterBodyOptions={{ friction: 0.5, restitution: 0.2 }}
            x="45%"
            y="35%"
            angle={20}
          >
            <div className={wordStyles.layout}>
              Layout
            </div>
          </MatterBody>
          <MatterBody
            matterBodyOptions={{ friction: 0.5, restitution: 0.2 }}
            x="70%"
            y="40%"
          >
            <div className={wordStyles.themes}>
              Themes
            </div>
          </MatterBody>
          <MatterBody
            matterBodyOptions={{ friction: 0.5, restitution: 0.2 }}
            x="25%"
            y="50%"
            angle={-10}
          >
            <div className={wordStyles.content}>
              Content
            </div>
          </MatterBody>
          <MatterBody
            matterBodyOptions={{ friction: 0.5, restitution: 0.2 }}
            x="55%"
            y="50%"
          >
            <div className={wordStyles.animate}>
              Animate
            </div>
          </MatterBody>
        </Gravity>
        
        {/* Input ultra-minimalista - reposicionado */}
        <div className="absolute top-[55%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30 w-full max-w-2xl px-4">
          <div className="relative">
            <textarea
              value={presentationInput}
              onChange={(e) => setPresentationInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t.home.inputPlaceholder}
              className="w-full h-28 pr-16 pl-4 py-5 rounded-xl border border-input bg-background/80 backdrop-blur-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-ring focus:bg-background/90 resize-none transition-all duration-200"
              rows={2}
            />
            <Button
              onClick={handleGenerate}
              disabled={!presentationInput.trim() || isGeneratingOutline}
              className="absolute right-4 top-[65%] transform -translate-y-1/2 h-10 w-10 rounded-full bg-black dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 border-0 p-0 transition-all duration-200"
              size="sm"
            >
              {isGeneratingOutline ? (
                <Loader2 className="h-5 w-5 animate-spin text-white dark:text-black" />
              ) : (
                <ArrowUp className="h-5 w-5 text-white dark:text-black" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        prompt={presentationInput}
        onSuccess={handleLoginSuccess}
      />
    </div>
  );
}

export { ApresentAI };
