import { usePresentationState } from "@/states/presentation-state";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { type Themes, themes } from "@/lib/presentation/themes";
import { useTheme } from "next-themes";
import { type ImageModelList } from "@/app/_actions/image/generate";
import { ThemeModal } from "./ThemeModal";
import { Button } from "@/components/ui/button";

export const IMAGE_MODELS: { value: ImageModelList; label: string }[] = [
  { value: "midjourney-imagine", label: "Midjourney Imagine" },
  { value: "flux-pro", label: "Flux Pro" },
  { value: "flux-dev", label: "Flux Dev" },
  { value: "flux-pro-1.1", label: "Flux Pro 1.1" },
  { value: "flux-pro-1.1-ultra", label: "Flux Pro 1.1 Ultra" },
  { value: "ideogram-v2", label: "Ideogram V2" },
  { value: "ideogram-v2-turbo", label: "Ideogram V2 Turbo" },
  { value: "ideogram-v3", label: "Ideogram V3" },
  { value: "dall-e-3", label: "DALL-E 3" },
  { value: "gpt-image-1", label: "GPT Image 1" },
  { value: "google-imagen-3", label: "Google Imagen 3" },
];

const PRESENTATION_STYLES = [
  { value: "professional", label: "Professional" },
  { value: "creative", label: "Creative" },
  { value: "minimal", label: "Minimal" },
  { value: "bold", label: "Bold" },
  { value: "elegant", label: "Elegant" },
];

export function ThemeSettings() {
  const { theme, setTheme, imageModel, setImageModel } = usePresentationState();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Theme & Layout</Label>
          <ThemeModal>
            <Button variant={"link"}>More Themes</Button>
          </ThemeModal>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Object.entries(themes).map(([key, themeOption]) => {
            const modeColors = isDark
              ? themeOption.colors.dark
              : themeOption.colors.light;
            const modeShadows = isDark
              ? themeOption.shadows.dark
              : themeOption.shadows.light;

            return (
              <button
                key={key}
                onClick={() => setTheme(key as Themes)}
                className={cn(
                  "group relative space-y-2 rounded-lg border p-4 text-left transition-all",
                  theme === key
                    ? "border-primary bg-primary/5"
                    : "border-muted hover:border-primary/50 hover:bg-muted/50"
                )}
                style={{
                  borderRadius: themeOption.borderRadius,
                  boxShadow: modeShadows.card,
                  transition: themeOption.transitions.default,
                  backgroundColor:
                    theme === key
                      ? `${modeColors.primary}${isDark ? "15" : "08"}`
                      : isDark
                      ? "rgba(0,0,0,0.3)"
                      : "rgba(255,255,255,0.9)",
                }}
              >
                <div
                  className="font-medium"
                  style={{
                    color: modeColors.heading,
                    fontFamily: themeOption.fonts.heading,
                  }}
                >
                  {themeOption.name}
                </div>
                <div
                  className="text-sm"
                  style={{
                    color: modeColors.text,
                    fontFamily: themeOption.fonts.body,
                  }}
                >
                  {themeOption.description}
                </div>
                <div className="flex gap-2">
                  {[
                    modeColors.primary,
                    modeColors.secondary,
                    modeColors.accent,
                  ].map((color, i) => (
                    <div
                      key={i}
                      className="h-4 w-4 rounded-full ring-1 ring-inset ring-white/10"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <div
                  className="mt-2 text-xs"
                  style={{ color: modeColors.muted }}
                >
                  <span className="block">
                    Heading: {themeOption.fonts.heading}
                  </span>
                  <span className="block">Body: {themeOption.fonts.body}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-4">
        <Label className="text-sm font-medium">Image Generation Model</Label>
        <Select
          value={imageModel || "flux-dev"}
          onValueChange={(value) => setImageModel(value as ImageModelList)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select image model" />
          </SelectTrigger>
          <SelectContent>
            {IMAGE_MODELS.map((model) => (
              <SelectItem key={model.value} value={model.value}>
                {model.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        <Label className="text-sm font-medium">Presentation Style</Label>
        <Select defaultValue="professional">
          <SelectTrigger>
            <SelectValue placeholder="Select style" />
          </SelectTrigger>
          <SelectContent>
            {PRESENTATION_STYLES.map((style) => (
              <SelectItem key={style.value} value={style.value}>
                {style.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
