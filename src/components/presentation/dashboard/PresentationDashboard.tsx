"use client";

import { Wand2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePresentationState } from "@/states/presentation-state";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PresentationInput } from "./PresentationInput";
import { PresentationControls } from "./PresentationControls";
import { PresentationTemplates } from "./PresentationTemplates";
import { PresentationExamples } from "./PresentationExamples";
import { PresentationsSidebar } from "./PresentationsSidebar";
import { useEffect } from "react";
import { PresentationHeader } from "./PresentationHeader";
import { createEmptyPresentation } from "@/app/_actions/presentation/presentationActions";
import { Preview } from "./Preview";

export function PresentationDashboard() {
  const router = useRouter();
  const {
    presentationInput,
    isGeneratingOutline,
    setCurrentPresentation,
    setIsGeneratingOutline,
    // We'll use these instead of directly calling startOutlineGeneration
    setShouldStartOutlineGeneration,
  } = usePresentationState();

  useEffect(() => {
    setCurrentPresentation("", "");
    // Make sure to reset any generation flags when landing on dashboard
    setIsGeneratingOutline(false);
    setShouldStartOutlineGeneration(false);
  }, []);

  const handleGenerate = async () => {
    if (!presentationInput.trim()) {
      toast.error("Please enter a topic for your presentation");
      return;
    }

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
        router.push(`/presentation/generate/${result.presentation.id}`);
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

  const handleCreateBlank = async () => {
    try {
      setIsGeneratingOutline(true);
      const result = await createEmptyPresentation("Untitled Presentation");
      if (result.success && result.presentation) {
        setCurrentPresentation(
          result.presentation.id,
          result.presentation.title
        );
        router.push(`/presentation/generate/${result.presentation.id}`);
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

  return (
    <div className="notebook-section relative w-full">
      <Preview />
      <PresentationsSidebar />
      <div className="relative z-20 flex flex-col min-h-screen pointer-events-none">
        <PresentationHeader />
        
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <div className="w-full max-w-2xl">
            <PresentationInput onSubmit={handleGenerate} />
          </div>
        </div>
      </div>
    </div>
  );
}
