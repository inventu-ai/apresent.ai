import { usePresentationState } from "@/states/presentation-state";
import { AutosizeTextarea } from "@/components/ui/auto-resize-textarea";
import { useIsMobile } from "@/hooks/use-mobile";

export function PromptInput() {
  const {
    presentationInput,
    setPresentationInput,
    isGeneratingOutline,
  } = usePresentationState();
  const isMobile = useIsMobile();

  return (
    <div className={`relative ${isMobile ? "flex justify-center" : ""}`}>
      <AutosizeTextarea
        value={presentationInput}
        onChange={(e) => setPresentationInput(e.target.value)}
        className={`rounded-md bg-muted px-4 py-3 text-foreground outline-none focus:ring-2 focus:ring-indigo-400 resize-none ${
          isMobile ? "w-[95%]" : "w-full"
        }`}
        placeholder="Enter your presentation topic..."
        disabled={isGeneratingOutline}
        minHeight={52}
        maxHeight={200}
      />
    </div>
  );
}
