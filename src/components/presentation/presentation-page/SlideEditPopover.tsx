import {
  Edit,
  LayoutGrid,
  ArrowUpFromLine,
  FoldVertical,
  PanelRight,
  PanelLeft,
  PanelTop,
  AlignCenter,
  MoveHorizontal,
  Type,
  Heading,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { usePresentationState } from "@/states/presentation-state";
import { cn } from "@/lib/utils";
import { type LayoutType } from "../utils/parser";
import ColorPicker from "@/components/ui/color-picker";
import CardColorPicker from "@/components/ui/card-color-picker";
import { FontPicker } from "@/components/ui/font-picker";
import { useTranslation } from "@/contexts/LanguageContext";

interface SlideEditPopoverProps {
  index: number;
}

type ContentAlignment = "start" | "center" | "end";

export function SlideEditPopover({ index }: SlideEditPopoverProps) {
  const { slides, setSlides } = usePresentationState();
  const { t } = useTranslation();
  const updateSlide = (
    updates: Partial<{
      layoutType: LayoutType;
      bgColor: string;
      width: "M" | "L";
      alignment: ContentAlignment;
      rootImage?: {
        query: string;
        url?: string;
      };
      headingColor?: string;
      textColor?: string;
      headingFont?: string;
      textFont?: string;
    }>
  ) => {
    const updatedSlides = [...slides];
    updatedSlides[index] = {
      ...updatedSlides[index]!,
      ...updates,
    };
    setSlides(updatedSlides);
  };

  const currentSlide = slides[index];
  const currentLayout = currentSlide?.layoutType ?? "left";
  const currentBgColor = currentSlide?.bgColor ?? "#4D4D4D";
  const currentWidth = currentSlide?.width ?? "M";
  const currentAlignment = currentSlide?.alignment ?? "start";
  const currentHeadingColor = currentSlide?.headingColor ?? "#FFFFFF";
  const currentTextColor = currentSlide?.textColor ?? "#FFFFFF";
  const currentHeadingFont = currentSlide?.headingFont ?? "Inter";
  const currentTextFont = currentSlide?.textFont ?? "Inter";

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="!size-8 rounded-full bg-black/20 shadow-sm hover:bg-black/40">
          <Edit className="h-4 w-4 text-white" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-80 rounded-md border border-border bg-background"
        side="bottom"
      >
        <div className="space-y-2">
          {/* Card Color */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded-full bg-current" />
              <span className="text-sm text-zinc-200">{t.presentation.cardColor}</span>
            </div>
            <CardColorPicker
              value={currentBgColor}
              onChange={(color, suggestedTextColor) => {
                // Atualizar a cor do card
                // E sugerir cores de texto, mas apenas se o usuário não tiver personalizado manualmente
                updateSlide({ 
                  bgColor: color,
                  // Só atualizar as cores de texto se forem as cores padrão
                  ...(currentHeadingColor === "#FFFFFF" || currentHeadingColor === "#000000" 
                    ? { headingColor: suggestedTextColor } : {}),
                  ...(currentTextColor === "#FFFFFF" || currentTextColor === "#000000" 
                    ? { textColor: suggestedTextColor } : {})
                });
              }}
            />
          </div>
          {/* Content Alignment */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlignCenter className="h-4 w-4"></AlignCenter>
              <span className="text-sm text-zinc-200">{t.presentation.contentAlignment}</span>
            </div>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="icon"
                className={cn(
                  "h-6 w-6 border-zinc-800 bg-zinc-900",
                  currentAlignment === "start" && "bg-blue-600"
                )}
                onClick={() => updateSlide({ alignment: "start" })}
              >
                <ArrowUpFromLine className="h-3 w-3" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className={cn(
                  "h-6 w-6 border-zinc-800 bg-zinc-900",
                  currentAlignment === "center" && "bg-blue-600"
                )}
                onClick={() => updateSlide({ alignment: "center" })}
              >
                <FoldVertical className="h-3 w-3" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className={cn(
                  "h-6 w-6 border-zinc-800 bg-zinc-900",
                  currentAlignment === "end" && "bg-blue-600"
                )}
                onClick={() => updateSlide({ alignment: "end" })}
              >
                <ArrowUpFromLine className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* Image Placement */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <LayoutGrid className="h-4 w-4" />
              <span className="text-sm text-zinc-200">{t.presentation.cardLayout}</span>
            </div>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="icon"
                className={cn(
                  "h-6 w-6 border-zinc-800 bg-zinc-900",
                  currentLayout === "vertical" && "bg-blue-600"
                )}
                onClick={() => updateSlide({ layoutType: "vertical" })}
              >
                <PanelTop className="h-4 w-4"></PanelTop>
              </Button>
              <Button
                variant="outline"
                size="icon"
                className={cn(
                  "h-6 w-6 border-zinc-800 bg-zinc-900",
                  currentLayout === "left" && "bg-blue-600"
                )}
                onClick={() => updateSlide({ layoutType: "left" })}
              >
                <PanelLeft className="h-4 w-4"></PanelLeft>
              </Button>
              <Button
                variant="outline"
                size="icon"
                className={cn(
                  "h-6 w-6 border-zinc-800 bg-zinc-900",
                  currentLayout === "right" && "bg-blue-600"
                )}
                onClick={() => updateSlide({ layoutType: "right" })}
              >
                <PanelRight className="h-4 w-4"></PanelRight>
              </Button>
            </div>
          </div>

          {/* Card Width */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MoveHorizontal className="h-4 w-4"></MoveHorizontal>
              <span className="text-sm text-zinc-200">{t.presentation.cardWidth}</span>
            </div>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "h-6 border-zinc-800 bg-zinc-900 px-2",
                  currentWidth === "M" && "bg-blue-600"
                )}
                onClick={() => updateSlide({ width: "M" })}
              >
                M
              </Button>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "h-6 border-zinc-800 bg-zinc-900 px-2",
                  currentWidth === "L" && "bg-blue-600"
                )}
                onClick={() => updateSlide({ width: "L" })}
              >
                L
              </Button>
            </div>
          </div>

          {/* Heading Style */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heading className="h-4 w-4" />
              <span className="text-sm text-zinc-200">{t.presentation.slideTitle}</span>
            </div>
            <div className="flex gap-2">
              <ColorPicker
                value={currentHeadingColor}
                onChange={(color) => updateSlide({ headingColor: color })}
              />
              <FontPicker
                value={currentHeadingFont}
                onChange={(font) => updateSlide({ headingFont: font })}
              />
            </div>
          </div>

          {/* Text Style */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Type className="h-4 w-4" />
              <span className="text-sm text-zinc-200">{t.presentation.slideText}</span>
            </div>
            <div className="flex gap-2">
              <ColorPicker
                value={currentTextColor}
                onChange={(color) => updateSlide({ textColor: color })}
              />
              <FontPicker
                value={currentTextFont}
                onChange={(font) => updateSlide({ textFont: font })}
              />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
