import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePresentationState } from "@/states/presentation-state";
import { toast } from "sonner";

export function RegenerateButton() {
  const {
    presentationInput,
    startOutlineGeneration,
    isGeneratingOutline,
  } = usePresentationState();

  const handleGenerateOutline = () => {
    if (!presentationInput.trim()) {
      toast.error("Please enter a presentation topic");
      return;
    }

    startOutlineGeneration();
  };

  return (
    <div className="flex justify-center">
      <Button
        onClick={handleGenerateOutline}
        disabled={isGeneratingOutline || !presentationInput.trim()}
        variant="outline"
        className="gap-2"
      >
        <RefreshCw 
          size={16} 
          className={isGeneratingOutline ? "animate-spin" : ""} 
        />
        {isGeneratingOutline ? "Regenerating..." : "Regenerate Outline"}
      </Button>
    </div>
  );
}
