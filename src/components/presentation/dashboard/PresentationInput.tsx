import { usePresentationState } from "@/states/presentation-state";
import { ChatInput, ChatInputTextArea, ChatInputSubmit } from "@/components/ui/chat-input";

interface PresentationInputProps {
  onSubmit?: () => void;
}

export function PresentationInput({ onSubmit }: PresentationInputProps) {
  const { presentationInput, setPresentationInput, isGeneratingOutline } =
    usePresentationState();

  const handleSubmit = () => {
    if (onSubmit) {
      onSubmit();
    }
  };

  // Block event propagation to prevent interference with gravity animation
  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div 
      className="flex justify-center pointer-events-auto"
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMove}
      onClick={handleClick}
    >
      <ChatInput
        value={presentationInput}
        onChange={(e) => setPresentationInput(e.target.value)}
        onSubmit={handleSubmit}
        loading={isGeneratingOutline}
        className="w-full max-w-md bg-zinc-950/98 backdrop-blur-sm shadow-lg border-zinc-800"
        variant="default"
      >
        <ChatInputTextArea
          placeholder="What would you like to create a presentation about?"
          className="text-white placeholder-gray-400 bg-transparent"
        />
        <ChatInputSubmit />
      </ChatInput>
    </div>
  );
}
