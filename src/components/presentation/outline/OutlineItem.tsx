import { useState, useEffect, memo } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, X, Brain } from "lucide-react";
import { cn } from "@/lib/utils";
import ProseMirrorEditor from "@/components/prose-mirror/ProseMirrorEditor";
import { useCompletion } from "ai/react";
import { usePresentationState } from "@/states/presentation-state";
import { toast } from "sonner";

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
      }
    },
    onError: (error) => {
      setIsGenerating(false);
      toast.error("Failed to generate topic: " + error.message);
    },
  });

  const handleGenerateTopic = async () => {
    if (isGenerating || isLoading) return;
    
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
    }
  };

  // Add console log to debug isNew prop
  console.log(`OutlineItem ${id} (${title.substring(0, 20)}...): isNew=${isNew}`);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group flex items-center gap-4 rounded-md bg-muted p-4",
        isDragging && "opacity-50"
      )}
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-move text-muted-foreground hover:text-foreground"
      >
        <GripVertical size={20} />
      </div>
      <span className="min-w-[1.5rem] text-indigo-400">{index}</span>
      <div className="flex-1">
        <ProseMirrorEditor
          content={editedTitle}
          onChange={handleProseMirrorChange}
          isEditing={true}
          onBlur={handleProseMirrorBlur}
          className="prose-headings:m-0 prose-headings:text-lg prose-headings:font-semibold prose-p:m-0 prose-ol:m-0 prose-ul:m-0 prose-li:m-0"
          showFloatingToolbar={false}
        />
      </div>
      {isNew && (
        <button
          onClick={handleGenerateTopic}
          disabled={isGenerating || isLoading}
          className={cn(
            "text-indigo-400 opacity-100 transition-opacity hover:text-indigo-600",
            (isGenerating || isLoading) && "animate-pulse"
          )}
          title="Generate topic from this suggestion"
        >
          <Brain size={20} />
        </button>
      )}
      <button
        onClick={() => onDelete(id)}
        className="text-muted-foreground opacity-0 transition-opacity hover:text-red-400 group-hover:opacity-100"
      >
        <X size={20} />
      </button>
    </div>
  );
});

// Add a display name for debugging purposes
OutlineItem.displayName = "OutlineItem";
