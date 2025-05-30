import { usePresentationState } from "@/states/presentation-state";

export function PromptInput() {
  const {
    presentationInput,
    setPresentationInput,
    isGeneratingOutline,
  } = usePresentationState();

  return (
    <div className="relative">
      <input
        type="text"
        value={presentationInput}
        onChange={(e) => setPresentationInput(e.target.value)}
        className="w-full rounded-md bg-muted px-4 py-3 text-foreground outline-none focus:ring-2 focus:ring-indigo-400"
        placeholder="Enter your presentation topic..."
        disabled={isGeneratingOutline}
      />
    </div>
  );
}
