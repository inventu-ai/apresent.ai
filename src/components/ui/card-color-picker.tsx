import React from "react";
import { cn } from "@/lib/utils";
import debounce from "lodash.debounce";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { DEFAULT_COLORS } from "../text-editor/plate-ui/color-constants";

// Função para determinar se uma cor é clara ou escura
function isLightColor(hexColor: string) {
  // Caso especial para transparente
  if (hexColor === "transparent") {
    // Para transparente, assumimos que o fundo é escuro, então o texto deve ser branco
    return false;
  }
  
  // Converter hex para RGB
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  
  // Calcular luminosidade (fórmula padrão)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Se luminância > 0.5, é uma cor clara
  return luminance > 0.5;
}

interface CardColorPickerProps {
  value: string;
  onChange: (value: string, suggestedTextColor: string) => void;
  disabled?: boolean;
  children?: React.ReactNode;
}

function CardColorPicker({
  value,
  onChange,
  disabled,
  children,
}: CardColorPickerProps) {
  const [customColor, setCustomColor] = React.useState(value);
  const [localColor, setLocalColor] = React.useState(value);

  // Create a debounced version of onChange
  const debouncedOnChange = React.useMemo(
    () =>
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      debounce((color: string) => {
        // Determinar a cor do texto com base na luminosidade
        const suggestedTextColor = isLightColor(color) ? '#000000' : '#FFFFFF';
        onChange(color, suggestedTextColor);
      }, 100), // 100ms delay
    [onChange]
  );

  React.useEffect(() => {
    setCustomColor(value);
    setLocalColor(value);
  }, [value]);

  // Cleanup debounce on unmount
  React.useEffect(() => {
    return () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      debouncedOnChange.cancel();
    };
  }, [debouncedOnChange]);

  const handleColorChange = (color: string) => {
    setLocalColor(color); // Update local state immediately for UI
    setCustomColor(color);
    debouncedOnChange(color); // Debounce the actual onChange call
  };

  return (
    <div id="card-color-picker">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          {children ?? (
            <Button
              variant="outline"
              className={cn("flex h-10 w-10 items-center justify-center p-0")}
              style={localColor === "transparent" ? {
                backgroundImage: "linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%, #ccc), linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%, #ccc)",
                backgroundSize: "8px 8px",
                backgroundPosition: "0 0, 4px 4px",
                border: "1px solid #ccc"
              } : { backgroundColor: localColor }}
              disabled={disabled}
            >
              <span className="sr-only">Pick a color</span>
            </Button>
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent
          container={document.getElementById("card-color-picker") ?? undefined}
          align="start"
          side="bottom"
          className="h-72 overflow-y-auto p-3"
        >
          <div className="grid grid-cols-5 gap-2">
            <TooltipProvider>
              {/* Botão de transparência */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    className={cn(
                      "h-8 w-8 rounded-full transition-transform hover:scale-110 focus:ring-2 focus:ring-offset-2 border border-gray-400",
                      "bg-[linear-gradient(45deg,#ccc_25%,transparent_25%,transparent_75%,#ccc_75%,#ccc),linear-gradient(45deg,#ccc_25%,transparent_25%,transparent_75%,#ccc_75%,#ccc)]",
                      "bg-[length:8px_8px]",
                      "bg-[position:0_0,4px_4px]",
                      localColor === "transparent" && "ring-2 ring-offset-2"
                    )}
                    onClick={() => handleColorChange("transparent")}
                  >
                    <span className="sr-only">Transparent</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="font-medium">Transparent</div>
                </TooltipContent>
              </Tooltip>
              
              {DEFAULT_COLORS.map((color) => (
                <Tooltip key={color.value}>
                  <TooltipTrigger asChild>
                    <button
                      className={cn(
                        "h-8 w-8 rounded-full transition-transform hover:scale-110 focus:ring-2 focus:ring-offset-2",
                        localColor === color.value && "ring-2 ring-offset-2"
                      )}
                      style={{ backgroundColor: color.value }}
                      onClick={() => handleColorChange(color.value)}
                    >
                      <span className="sr-only">{color.name}</span>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="font-medium">{color.name}</div>
                    <div className="text-muted-foreground">{color.value}</div>
                  </TooltipContent>
                </Tooltip>
              ))}

              {/* Custom color picker */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="relative">
                    <input
                      type="color"
                      value={customColor}
                      onChange={(e) => {
                        handleColorChange(e.target.value);
                      }}
                      className="absolute h-8 w-8 cursor-pointer opacity-0"
                    />
                    <button
                      className={cn(
                        "h-8 w-8 rounded-full border-2 border-dashed border-gray-300 bg-white",
                        "flex items-center justify-center transition-transform hover:scale-110"
                      )}
                    >
                      <Plus className="h-4 w-4 text-gray-500" />
                    </button>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="font-medium">Custom color</div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export default CardColorPicker;
