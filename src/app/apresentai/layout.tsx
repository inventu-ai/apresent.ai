"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { PresentationGenerationManager } from "@/components/presentation/dashboard/PresentationGenerationManager";
import PresentationHeader from "@/components/presentation/presentation-page/PresentationHeader";
import { PresentationsSidebar } from "@/components/presentation/dashboard/PresentationsSidebar";

export default function ApresentAILayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  // Check if it's a generation route or view route
  const isGenerationRoute = pathname?.includes('/generate');
  const isViewRoute = pathname?.match(/\/apresentai\/[^/]+$/) && !pathname?.includes('/generate');
  const isHomePage = pathname === '/apresentai';

  // For generation routes, use the generation layout
  if (isGenerationRoute) {
    return (
      <>
        <PresentationGenerationManager />
        <PresentationsSidebar />
        {children}
      </>
    );
  }

  // For view routes, use the full presentation layout like /presentation
  if (isViewRoute) {
    return (
      <>
        <PresentationGenerationManager />
        <PresentationsSidebar />
        <div className="flex h-screen w-screen flex-col supports-[(height:100dvh)]:h-[100dvh]">
          <PresentationHeader />
          <main className="relative flex flex-1 overflow-hidden">
            <div className="sheet-container h-[calc(100vh-3.8rem)] flex-1 place-items-center overflow-y-auto overflow-x-clip supports-[(height:100dvh)]:h-[calc(100dvh-3.8rem)]">
              {children}
            </div>
          </main>
        </div>
      </>
    );
  }

  // For home page, just render children (no extra layout)
  return <>{children}</>;
}
