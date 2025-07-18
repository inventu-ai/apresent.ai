import { useState, useEffect, memo } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, X, Brain, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import ProseMirrorEditor from "@/components/prose-mirror/ProseMirrorEditor";
import { useCompletion } from "ai/react";
import { usePresentationState } from "@/states/presentation-state";
import { toast } from "sonner";
import { useTranslation } from "@/contexts/LanguageContext";
import { consumeCardGenerationCredits, canExecuteAction } from "@/lib/credit-system";
import { useCreditValidation } from "@/hooks/useCreditValidation";
import { InsufficientCreditsModal } from "@/components/ui/insufficient-credits-modal";
import { useUserCredits } from "@/hooks/useUserCredits";

interface OutlineItemProps {
  id: string;
  index: number;
  title: string;
  isNew?: boolean;
  onTitleChange: (id: string, newTitle: string) => void;
  onDelete: (id: string) => void;
  onGenerateTopic?: (id: string, newTitle: string) => void;
}

// Wrap the component with memo to prevent unnecessary re-renders
export const OutlineItem = memo(function OutlineItem({
  id,
  index,
  title,
  isNew = false,
  onTitleChange,
  onDelete,
  onGenerateTopic,
}: OutlineItemProps) {
  // Always editable, no need for isEditing state
  const [editedTitle, setEditedTitle] = useState(title);
  const [isGenerating, setIsGenerating] = useState(false);
  const { language, outline } = usePresentationState();
  const { t } = useTranslation();
  const isMobile = useIsMobile();

  // Credit validation
  const { checkCredits, userId, currentPlan } = useCreditValidation();
  const { nextReset } = useUserCredits();
  const [showInsufficientCreditsModal, setShowInsufficientCreditsModal] = useState(false);
  const [creditError, setCreditError] = useState<{
    creditsNeeded: number;
    currentCredits: number;
    actionName: string;
  } | null>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Update editedTitle when title prop changes
  useEffect(() => {
    setTimeout(() => {
      setEditedTitle(title);
    }, 0);
  }, [title]);

  const handleProseMirrorChange = (newContent: string) => {
    setEditedTitle(newContent);
  };

  const handleProseMirrorBlur = () => {
    if (editedTitle.trim() !== title) {
      onTitleChange(id, editedTitle);
    }
  };

  // Setup AI completion hook for topic generation
  const { complete: generateTopic, isLoading } = useCompletion({
    api: "/api/presentation/generate-topic",
    onResponse: () => {
      setIsGenerating(true);
    },
    onFinish: (prompt, completion) => {
      setIsGenerating(false);
      if (completion) {
        onTitleChange(id, completion);
        toast.success(t.presentation.topicRegenerated);
      }
    },
    onError: (error) => {
      setIsGenerating(false);
      toast.error(t.presentation.topicRegenerationError + ": " + error.message);
    },
  });

  const handleGenerateTopic = async () => {
    if (isGenerating || isLoading) return;
    
    // Verificar créditos antes de gerar tópico
    const creditCheck = await checkCredits('CARD_GENERATION');
    
    if (!creditCheck.allowed) {
      setCreditError({
        creditsNeeded: creditCheck.cost,
        currentCredits: creditCheck.currentCredits,
        actionName: 'Gerar Tópico'
      });
      setShowInsufficientCreditsModal(true);
      return;
    }
    
    setIsGenerating(true);
    try {
      await generateTopic("", {
        body: {
          suggestion: editedTitle,
          existingTopics: outline,
          language,
        },
      });
    } catch (error) {
      console.error("Error generating topic:", error);
      setIsGenerating(false);
      toast.error(t.presentation.topicRegenerationError);
    }
  };

  const handleRegenerateTopic = async () => {
    if (isGenerating || isLoading) return;
    
    // Verificar créditos antes de regenerar tópico
    const creditCheck = await checkCredits('TOPIC_REGENERATION');
    
    if (!creditCheck.allowed) {
      setCreditError({
        creditsNeeded: creditCheck.cost,
        currentCredits: creditCheck.currentCredits,
        actionName: 'Regenerar Tópico'
      });
      setShowInsufficientCreditsModal(true);
      return;
    }
    
    setIsGenerating(true);
    try {
      await generateTopic("", {
        body: {
          suggestion: editedTitle,
          existingTopics: outline.filter((_, i) => i !== index), // Exclude current topic
          language,
          isRegeneration: true,
        },
      });
    } catch (error) {
      console.error("Error regenerating topic:", error);
      setIsGenerating(false);
      toast.error(t.presentation.topicRegenerationError);
    }
  };



  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group flex items-center gap-4 rounded-md bg-muted p-4",
        isDragging && "opacity-50",
        isMobile && "flex-wrap justify-center"
      )}
    >
      <div className={`flex items-center gap-2`}>
        <div
          {...attributes}
          {...listeners}
          className="cursor-move text-muted-foreground hover:text-foreground"
        >
          <GripVertical size={20} />
        </div>
        <span className="min-w-[1.5rem] text-indigo-400">{index}</span>
      </div>
      <div className={`flex-1 ${isMobile ? "w-full text-start" : ""}`}>
        <ProseMirrorEditor
          content={editedTitle}
          onChange={handleProseMirrorChange}
          isEditing={true}
          onBlur={handleProseMirrorBlur}
          className="prose-headings:m-0 prose-headings:text-lg prose-headings:font-semibold prose-p:m-0 prose-ol:m-0 prose-ul:m-0 prose-li:m-0"
          showFloatingToolbar={false}
        />
      </div>
      <div className="flex items-center gap-2">
        {isNew ? (
          <button
            onClick={handleGenerateTopic}
            disabled={isGenerating || isLoading}
            className={cn(
              "text-indigo-400 opacity-100 transition-opacity hover:text-indigo-600",
              (isGenerating || isLoading) && "animate-pulse"
            )}
            title={t.presentation.regenerateTopic}
          >
            <Brain size={20} />
          </button>
        ) : (
          <button
            onClick={handleRegenerateTopic}
            disabled={isGenerating || isLoading}
            className={cn(
              "text-blue-400 opacity-0 transition-opacity hover:text-blue-600 group-hover:opacity-100",
              (isGenerating || isLoading) && "animate-spin opacity-100"
            )}
            title={t.presentation.regenerateTopic}
          >
            <RefreshCw size={18} />
          </button>
        )}
        <button
          onClick={() => onDelete(id)}
          className="text-muted-foreground opacity-0 transition-opacity hover:text-red-400 group-hover:opacity-100"
        >
          <X size={20} />
        </button>
      </div>

      {/* Modal de créditos insuficientes */}
      {creditError && (
        <InsufficientCreditsModal
          open={showInsufficientCreditsModal}
          onOpenChange={setShowInsufficientCreditsModal}
          creditsNeeded={creditError.creditsNeeded}
          currentCredits={creditError.currentCredits}
          actionName={creditError.actionName}
          currentPlan={currentPlan}
          userId={userId}
          nextReset={nextReset || undefined}
        />
      )}
    </div>
  );
});

// Add a display name for debugging purposes
OutlineItem.displayName = "OutlineItem";
