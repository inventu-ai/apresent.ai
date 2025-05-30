"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, History } from "lucide-react";
import { usePresentationState } from "@/states/presentation-state";
import { usePathname } from "next/navigation";

// Import our new components
import { ThemeSelector } from "../theme/ThemeSelector";
import { ShareButton } from "./buttons/ShareButton";
import { PresentButton } from "./buttons/PresentButton";
import { SaveStatus } from "./buttons/SaveStatus";
import { Brain } from "@/components/ui/icons";
import SideBarDropdown from "@/components/auth/Dropdown";
import { Button } from "@/components/ui/button";

interface PresentationHeaderProps {
  title?: string;
}

export default function PresentationHeader({ title }: PresentationHeaderProps) {
  const { currentPresentationTitle, isPresenting, setIsSheetOpen } = usePresentationState();
  const [presentationTitle, setPresentationTitle] =
    useState<string>("ApresentAI");
  const pathname = usePathname();

  // Check if we're on the final presentation page (not outline/generate)
  const isPresentationPage = pathname?.includes("/apresentai/") && !pathname?.includes("/generate");

  // Function to open presentations sidebar
  const handleViewPresentations = () => {
    setIsSheetOpen(true);
  };

  // Update title when it changes in the state
  useEffect(() => {
    if (currentPresentationTitle) {
      setPresentationTitle(currentPresentationTitle);
    } else if (title) {
      setPresentationTitle(title);
    }
  }, [currentPresentationTitle, title]);

  return (
    <header className="flex h-12 w-full items-center justify-between border-b border-accent bg-background px-4">
      {/* Left section with breadcrumb navigation */}
      <div className="flex items-center gap-2">
        <Link href="/" className="text-muted-foreground hover:text-foreground">
          <Brain className="h-5 w-5"></Brain>
        </Link>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
        <span className="font-medium">{presentationTitle}</span>
      </div>

      {/* Right section with actions */}
      <div className="flex items-center gap-2">
        {/* Save status indicator */}
        <SaveStatus />

        {/* View Presentations button */}
        {!isPresenting && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleViewPresentations}
            className="h-8 w-8"
            title="View Presentations"
          >
            <History className="h-4 w-4" />
          </Button>
        )}

        {/* Theme selector - Only in presentation page, not outline */}
        {isPresentationPage && <ThemeSelector />}

        {/* Share button - Only in presentation page, not outline */}
        {isPresentationPage && !isPresenting && <ShareButton />}

        {/* Present button - Only in presentation page, not outline */}
        {isPresentationPage && <PresentButton />}

        {/* User profile dropdown - Keep this on all pages */}
        {!isPresenting && <SideBarDropdown />}
      </div>
    </header>
  );
}
