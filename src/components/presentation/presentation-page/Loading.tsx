"use client";

import { Spinner } from "@/components/ui/spinner";
import { ThemeBackground } from "../theme/ThemeBackground";
import { useTranslation } from "@/contexts/LanguageContext";

export function LoadingState() {
  const { t } = useTranslation();
  return (
    <ThemeBackground>
      <div className="flex h-[calc(100vh-8rem)] flex-col items-center justify-center">
        <div className="relative">
          <Spinner className="h-10 w-10 text-primary" />
        </div>
        <div className="space-y-2 text-center">
          <h2 className="text-2xl font-bold">{t.presentation.loadingPresentation}</h2>
          <p className="text-muted-foreground">{t.presentation.gettingSlidesReady}</p>
        </div>
      </div>
    </ThemeBackground>
  );
}
