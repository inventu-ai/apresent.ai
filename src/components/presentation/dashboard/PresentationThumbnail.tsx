"use client";

import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import PresentationEditor from "../editor/presentation-editor";
import { type PlateSlide } from "../utils/parser";
import { themes, type Themes, type ThemeProperties, setThemeVariables } from "@/lib/presentation/themes";
import { getCustomThemeById } from "@/app/_actions/presentation/theme-actions";
import { CustomThemeFontLoader } from "../presentation-page/FontLoader";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

interface PresentationThumbnailProps {
  firstSlide: PlateSlide | null;
  theme: string;
  customThemeData?: ThemeProperties | null;
  className?: string;
}

export function PresentationThumbnail({
  firstSlide,
  theme,
  customThemeData,
  className = "",
}: PresentationThumbnailProps) {
  const [mounted, setMounted] = useState(false);
  const [scale, setScale] = useState(0.15);
  const [isReady, setIsReady] = useState(false);
  const [currentThemeData, setCurrentThemeData] = useState<ThemeProperties | null>(customThemeData || null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hiddenContainerRef = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  // Load theme data if it's a custom theme
  useEffect(() => {
    if (theme && !(theme in themes) && !customThemeData) {
      getCustomThemeById(theme)
        .then((result) => {
          if (result.success && result.theme) {
            setCurrentThemeData(result.theme.themeData as ThemeProperties);
          }
        })
        .catch((error) => {
          console.error("Failed to load custom theme for thumbnail:", error);
        });
    } else if (customThemeData) {
      setCurrentThemeData(customThemeData);
    } else if (theme in themes) {
      setCurrentThemeData(themes[theme as keyof typeof themes]);
    }
  }, [theme, customThemeData]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !firstSlide || !containerRef.current || !hiddenContainerRef.current) return;

    const calculateScale = () => {
      const container = containerRef.current;
      const hiddenContainer = hiddenContainerRef.current;
      
      if (!container || !hiddenContainer) return;

      const containerRect = container.getBoundingClientRect();
      const hiddenRect = hiddenContainer.getBoundingClientRect();

      if (containerRect.width > 0 && hiddenRect.width > 0) {
        const newScale = Math.min(
          containerRect.width / hiddenRect.width,
          containerRect.height / hiddenRect.height,
          0.2 // Maximum scale
        );
        
        setScale(newScale);
        setIsReady(true);
      }
    };

    // Small delay to ensure the hidden container is rendered
    const timer = setTimeout(calculateScale, 100);
    
    return () => clearTimeout(timer);
  }, [mounted, firstSlide]);

  // Create isolated theme background style
  const getThemeBackgroundStyle = (themeData: ThemeProperties) => {
    const colors = isDark ? themeData.colors.dark : themeData.colors.light;
    
    return {
      background: isDark
        ? `
          radial-gradient(circle at 10% 10%, ${colors.primary}20 0%, transparent 30%),
          radial-gradient(circle at 90% 20%, ${colors.accent}20 0%, transparent 40%),
          radial-gradient(circle at 50% 80%, ${colors.secondary}15 0%, transparent 50%),
          ${colors.background}
        `
        : `
          radial-gradient(circle at 10% 10%, ${colors.primary}15 0%, transparent 30%),
          radial-gradient(circle at 90% 20%, ${colors.accent}15 0%, transparent 40%),
          radial-gradient(circle at 50% 80%, ${colors.secondary}10 0%, transparent 50%),
          ${colors.background}
        `,
      transition: themeData.transitions.default,
      color: colors.text,
    };
  };

  if (!mounted || !firstSlide) {
    return (
      <div 
        ref={containerRef}
        className={`flex items-center justify-center bg-muted ${className}`}
        style={{ aspectRatio: "16/9" }}
      >
        <div className="text-muted-foreground text-sm">No preview</div>
      </div>
    );
  }

  const themeBackgroundStyle = currentThemeData ? getThemeBackgroundStyle(currentThemeData) : {};

  return (
    <>
      <div 
        ref={containerRef}
        className={`relative overflow-hidden ${className}`}
        style={{ aspectRatio: "16/9" }}
      >
        {isReady && (
          <div
            style={{
              transform: `scale(${scale})`,
              transformOrigin: "top left",
              width: `${100 / scale}%`,
              height: `${100 / scale}%`,
            }}
          >
            <div 
              className="h-full w-full"
              style={themeBackgroundStyle}
            >
              {currentThemeData && <CustomThemeFontLoader themeData={currentThemeData} />}
              <DndProvider backend={HTML5Backend}>
                <PresentationEditor
                  initialContent={firstSlide}
                  className="min-h-[500px] w-full border-0"
                  slideIndex={0}
                  isGenerating={false}
                  readOnly={true}
                  isPreview={true}
                />
              </DndProvider>
            </div>
          </div>
        )}
      </div>

      {/* Hidden container for measuring */}
      {mounted &&
        createPortal(
          <div
            ref={hiddenContainerRef}
            style={{
              position: "fixed",
              top: "-9999px",
              left: "-9999px",
              visibility: "hidden",
              pointerEvents: "none",
              zIndex: -1,
            }}
          >
            <div 
              className="h-full w-full"
              style={themeBackgroundStyle}
            >
              {currentThemeData && <CustomThemeFontLoader themeData={currentThemeData} />}
              <DndProvider backend={HTML5Backend}>
                <PresentationEditor
                  initialContent={firstSlide}
                  className="min-h-[500px] w-[800px]"
                  slideIndex={0}
                  isGenerating={false}
                  readOnly={true}
                  isPreview={true}
                />
              </DndProvider>
            </div>
          </div>,
          document.body
        )}
    </>
  );
} 