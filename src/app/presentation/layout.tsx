import React from "react";
import { PresentationGenerationManager } from "@/components/presentation/dashboard/PresentationGenerationManager";
import PresentationHeader from "@/components/presentation/presentation-page/PresentationHeader";
import { PresentationsSidebar } from "@/components/presentation/dashboard/PresentationsSidebar";
import { ImageQueueDebug } from "@/components/presentation/debug/ImageQueueDebug";
// Import debug utilities to make them available in the browser console
import "@/lib/debug-utils";

export default function PresentationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <PresentationGenerationManager />
      <PresentationsSidebar />
      <div className="flex h-screen w-screen flex-col supports-[(height:100dvh)]:h-[100dvh]">
        <PresentationHeader />
        <main className="relative flex flex-1 overflow-hidden">
          <div className="sheet-container h-full flex-1 place-items-center overflow-y-auto overflow-x-clip">
            {children}
          </div>
        </main>
      </div>
      <ImageQueueDebug />
    </>
  );
}
