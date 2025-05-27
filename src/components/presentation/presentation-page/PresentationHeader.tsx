"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { usePresentationState } from "@/states/presentation-state";
import { usePathname } from "next/navigation";

// Import our new components
import { ThemeSelector } from "../theme/ThemeSelector";
import { ShareButton } from "./buttons/ShareButton";
import { PresentButton } from "./buttons/PresentButton";
import { SaveStatus } from "./buttons/SaveStatus";
import { Brain } from "@/components/ui/icons";
import SideBarDropdown from "@/components/auth/Dropdown";

interface PresentationHeaderProps {
  title?: string;
}

export default function PresentationHeader({ title }: PresentationHeaderProps) {
  const { currentPresentationTitle, isPresenting } = usePresentationState();
  const [presentationTitle, setPresentationTitle] =
    useState<string>("Presentation");
  const pathname = usePathname();

  // Check if we're on the generate/outline page
  const isPresentationPage = pathname?.includes("/presentation/");

  // Update title when it changes in the state
  useEffect(() => {
    if (currentPresentationTitle) {
      setPresentationTitle(currentPresentationTitle);
    } else if (title) {
      setPresentationTitle(title);
    }
  }, [currentPresentationTitle, title]);

  return (
    <header className="flex h-12 w-full items-center justify-end bg-background px-4">
      {/* Right section with only user dropdown */}
      <div className="flex items-center gap-2">
        {/* User profile dropdown - Keep this on all pages */}
        {!isPresenting && <SideBarDropdown />}
      </div>
    </header>
  );
}
