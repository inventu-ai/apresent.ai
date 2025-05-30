import { usePresentationState } from "@/states/presentation-state";
import { AutosizeTextarea } from "@/components/ui/auto-resize-textarea";

export function PromptInput() {
  const {
    presentationInput,
    setPresentationInput,
    isGeneratingOutline,
  } = usePresentationState();

  return (
    <div className="relative">
      <AutosizeTextarea
        value={presentationInput}
        onChange={(e) => setPresentationInput(e.target.value)}
        className="w-full rounded-md bg-muted px-4 py-3 text-foreground outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
        placeholder="Enter your presentation topic..."
        disabled={isGeneratingOutline}
        minHeight={52}
        maxHeight={200}
      />
    </div>
  );
}
