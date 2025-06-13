"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Palette } from "lucide-react";
import { useTheme } from "next-themes";
import { usePresentationState } from "@/states/presentation-state";
import { cn } from "@/lib/utils";
import {
  themes,
  type Themes,
  type ThemeProperties,
} from "@/lib/presentation/themes";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useQuery } from "@tanstack/react-query";
import {
  getUserCustomThemes,
} from "@/app/_actions/presentation/theme-actions";
import { Skeleton } from "@/components/ui/skeleton";
import { ThemeCreator } from "./ThemeCreator";
import { useTranslation } from "@/contexts/LanguageContext";

interface CustomTheme {
  id: string;
  name: string;
  description: string | null;
  themeData: ThemeProperties;
  isPublic: boolean;
  logoUrl: string | null;
  userId: string;
  user?: {
    name: string | null;
  };
}

type ThemeId = Themes | `custom-${string}`;

function ThemeCardSkeleton() {
  return (
    <div className="space-y-2 rounded-lg border p-4">
      <Skeleton className="h-6 w-32" />
      <Skeleton className="h-4 w-48" />
      <div className="flex gap-2">
        <Skeleton className="h-4 w-4 rounded-full" />
        <Skeleton className="h-4 w-4 rounded-full" />
        <Skeleton className="h-4 w-4 rounded-full" />
      </div>
    </div>
  );
}

export function ThemeSelector() {
  const { theme: systemTheme } = useTheme();
  const { theme: presentationTheme, setTheme: setPresentationTheme } =
    usePresentationState();
  const [isThemeSheetOpen, setIsThemeSheetOpen] = useState(false);
  const isDark = systemTheme === "dark";
  const { t, language } = useTranslation();

  const getHeadingText = () => {
    return language === 'pt-BR' ? 'Título' :
           language === 'es-ES' ? 'Título' :
           'Heading';
  };

  const getBodyText = () => {
    return language === 'pt-BR' ? 'Corpo' :
           language === 'es-ES' ? 'Cuerpo' :
           'Body';
  };

  // Fetch user themes with React Query
  const { data: userThemes = [], isLoading: isLoadingUserThemes } = useQuery({
    queryKey: ["userThemes"],
    queryFn: async () => {
      const result = await getUserCustomThemes();
      return result.success ? (result.themes as CustomTheme[]) : [];
    },
    enabled: isThemeSheetOpen,
  });

  // Handle theme selection
  const handleThemeSelect = (
    themeKey: ThemeId,
    customData?: ThemeProperties | null
  ) => {
    setPresentationTheme(themeKey as Themes, customData);
    setIsThemeSheetOpen(false);
  };

  return (
    <Sheet open={isThemeSheetOpen} onOpenChange={setIsThemeSheetOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground"
        >
          <Palette className="mr-1 h-4 w-4" />
          {t.presentation.presentationTheme}
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        overlay={false}
        className="absolute bottom-0 top-0 w-full max-w-md overflow-y-auto sm:max-w-lg"
        container={
          typeof window === "undefined"
            ? undefined
            : typeof document !== "undefined"
            ? document.querySelector<HTMLElement>(".sheet-container") ??
              undefined
            : undefined
        }
      >
        <SheetHeader className="mb-5">
          <SheetTitle>{t.presentation.presentationTheme}</SheetTitle>
          <SheetDescription>
            {t.presentation.chooseThemeForPresentation}
          </SheetDescription>
          <div>
            <ThemeCreator>
              <Button>{t.presentation.createNewTheme}</Button>
            </ThemeCreator>
          </div>
        </SheetHeader>

        <div className="space-y-6">
          {/* Built-in Themes */}
          <div>
            <h3 className="mb-3 text-sm font-medium text-muted-foreground">
              {t.presentation.builtInThemes}
            </h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {Object.entries(themes).map(([key, themeData]) => {
                const modeColors = isDark
                  ? themeData.colors.dark
                  : themeData.colors.light;
                const modeShadows = isDark
                  ? themeData.shadows.dark
                  : themeData.shadows.light;

                return (
                  <button
                    key={key}
                    onClick={() => handleThemeSelect(key as Themes)}
                    className={cn(
                      "group relative space-y-2 rounded-lg border p-4 text-left transition-all",
                      presentationTheme === key
                        ? "border-primary bg-primary/5"
                        : "hover:border-primary/50 hover:bg-muted/50"
                    )}
                    style={{
                      borderRadius: themeData.borderRadius,
                      boxShadow: modeShadows.card,
                      transition: themeData.transitions.default,
                    }}
                  >
                    <div
                      className="font-medium"
                      style={{
                        color: modeColors.heading,
                        fontFamily: themeData.fonts.heading,
                      }}
                    >
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </div>
                    <div
                      className="text-sm"
                      style={{
                        color: modeColors.text,
                        fontFamily: themeData.fonts.body,
                      }}
                    >
                      {getHeadingText()} • {getBodyText()}
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
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Themes */}
          <div>
            <h3 className="mb-3 text-sm font-medium text-muted-foreground">
              {t.presentation.myThemes}
            </h3>
            {isLoadingUserThemes ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {[1, 2, 3, 4].map((i) => (
                  <ThemeCardSkeleton key={i} />
                ))}
              </div>
            ) : userThemes.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {userThemes.map((theme) => {
                  const themeData = theme.themeData;
                  const modeColors = isDark
                    ? themeData.colors.dark
                    : themeData.colors.light;
                  const modeShadows = isDark
                    ? themeData.shadows.dark
                    : themeData.shadows.light;

                  return (
                    <button
                      key={theme.id}
                      onClick={() =>
                        handleThemeSelect(theme.id as ThemeId, themeData)
                      }
                      className={cn(
                        "group relative space-y-2 rounded-lg border p-4 text-left transition-all",
                        presentationTheme === theme.id
                          ? "border-primary bg-primary/5"
                          : "hover:border-primary/50 hover:bg-muted/50"
                      )}
                      style={{
                        borderRadius: themeData.borderRadius,
                        boxShadow: modeShadows.card,
                        transition: themeData.transitions.default,
                      }}
                    >
                      <div
                        className="font-medium"
                        style={{
                          color: modeColors.heading,
                          fontFamily: themeData.fonts.heading,
                        }}
                      >
                        {theme.name}
                      </div>
                      <div
                        className="text-sm"
                        style={{
                          color: modeColors.text,
                          fontFamily: themeData.fonts.body,
                        }}
                      >
                        {theme.description ?? "Custom theme"}
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
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8">
                <p className="mb-4 text-sm text-muted-foreground">
                  {t.presentation.themeModal.youHaventCreated}
                </p>
                <ThemeCreator>
                  <Button size="sm">{t.presentation.themeModal.createFirstTheme}</Button>
                </ThemeCreator>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
