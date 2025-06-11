import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Check, Trash2, X } from "lucide-react";
import { useTranslation } from "@/contexts/LanguageContext";

interface SelectionControlsProps {
  isSelecting: boolean;
  selectedCount: number;
  totalCount: number;
  onToggleSelecting: () => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onDelete: () => void;
}

export function SelectionControls({
  isSelecting,
  selectedCount,
  totalCount,
  onToggleSelecting,
  onSelectAll,
  onDeselectAll,
  onDelete,
}: SelectionControlsProps) {
  const { t } = useTranslation();

  if (!isSelecting) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={onToggleSelecting}
        className="gap-2"
      >
        <Check className="h-4 w-4" />
        {t.presentationsDashboard.select}
      </Button>
    );
  }

  const deleteDescription = t.presentationsDashboard.deleteConfirmDescription
    .replace('{count}', selectedCount.toString())
    .replace('{itemType}', selectedCount === 1 ? t.presentationsDashboard.item : t.presentationsDashboard.items);

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={onToggleSelecting}
        className="gap-2"
      >
        <X className="h-4 w-4" />
        {t.presentationsDashboard.cancel}
      </Button>

      {selectedCount > 0 ? (
        <Button
          variant="outline"
          size="sm"
          onClick={onDeselectAll}
          className="gap-2"
        >
          {t.presentationsDashboard.deselectAll} ({selectedCount})
        </Button>
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={onSelectAll}
          className="gap-2"
        >
          {t.presentationsDashboard.selectAll} ({totalCount})
        </Button>
      )}

      {selectedCount > 0 && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm" className="gap-2">
              <Trash2 className="h-4 w-4" />
              {t.presentationsDashboard.delete} ({selectedCount})
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t.presentationsDashboard.deleteConfirmTitle}</AlertDialogTitle>
              <AlertDialogDescription>
                {deleteDescription}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t.presentationsDashboard.cancel}</AlertDialogCancel>
              <AlertDialogAction
                onClick={onDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {t.presentationsDashboard.delete}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
