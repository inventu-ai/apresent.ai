"use client";

import debounce from "lodash.debounce";
import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import { usePresentationState } from "@/states/presentation-state";
import PresentationEditor from "../editor/presentation-editor";

interface SlidePreviewRendererProps {
  slideIndex: number;
  slideId: string;
  children?: React.ReactNode; // Make children optional
}

export function SlidePreviewRenderer({
  slideIndex,
  slideId,
}: SlidePreviewRendererProps) {
  const [mounted, setMounted] = useState(false);
  const [scale, setScale] = useState(0.2); // Start with a reasonable default scale
  const [isReady, setIsReady] = useState(false);
  const childrenRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({
    editorWidth: 800, // Default editor width
    editorHeight: 600, // Default editor height
    previewWidth: 0,
    previewHeight: 0,
  });
  
  // Get the slide data from the global state
  const { slides, isGeneratingPresentation } = usePresentationState();
  const slide = useMemo(() => slides[slideIndex], [slides, slideIndex]);
  
  // Generate a stable, unique preview ID
  const previewId = useMemo(() => `preview-${slideId}-${slideIndex}`, [slideId, slideIndex]);

  // Only render on client-side
  useEffect(() => {
    setMounted(true);
  }, []);

  const calculateDimensions = useCallback(() => {
    const slidePreview = document.querySelector(
      `#slide-preview-${slideIndex}`
    );

    if (!slidePreview || !childrenRef.current) return;

    const previewRect = slidePreview.getBoundingClientRect();
    const editorRect = childrenRef.current.getBoundingClientRect();

    const previewWidth = previewRect.width;
    const editorWidth = editorRect.width || 800; // Fallback to default
    const editorHeight = editorRect.height || 600; // Fallback to default

    // Only update if we have valid dimensions
    if (previewWidth > 0 && editorWidth > 0 && editorHeight > 0) {
      const newScale = Math.min(previewWidth / editorWidth, 0.3); // Cap the scale at 0.3
      
      setDimensions({
        editorWidth,
        editorHeight,
        previewWidth,
        previewHeight: previewRect.height,
      });

      setScale(newScale);
      setIsReady(true);
    }
  }, [slideIndex]);

  // Debounced version for resize events
  const debouncedCalculateDimensions = useMemo(
    () => debounce(calculateDimensions, 300),
    [calculateDimensions]
  );

  useEffect(() => {
    if (!mounted) return;

    // Initial calculation with a small delay to ensure DOM is ready
    const initialTimer = setTimeout(() => {
      calculateDimensions();
    }, 100);

    // Setup resize observer for responsive scaling
    const observer = new ResizeObserver(() => {
      debouncedCalculateDimensions();
    });

    const slidePreview = document.querySelector(`#slide-preview-${slideIndex}`);
    if (slidePreview && childrenRef.current) {
      observer.observe(slidePreview);
      observer.observe(childrenRef.current);
    }

    return () => {
      clearTimeout(initialTimer);
      observer.disconnect();
      debouncedCalculateDimensions.cancel();
    };
  }, [slideIndex, mounted, calculateDimensions, debouncedCalculateDimensions]);

  // Recalculate when slide content changes
  useEffect(() => {
    if (mounted && slide) {
      const timer = setTimeout(() => {
        calculateDimensions();
      }, 200);
      
      return () => clearTimeout(timer);
    }
  }, [slide, mounted, calculateDimensions]);

  if (!mounted) return null;

  // Find the preview element to portal into
  const previewElement = document.querySelector(`#slide-preview-${slideIndex}`);
  if (!previewElement) return null;

  // Calculate expected height based on the aspect ratio
  const aspectRatio = dimensions.editorHeight / dimensions.editorWidth;
  const expectedHeight = dimensions.previewWidth * aspectRatio;
  
  // Use a minimum height to prevent layout issues
  const finalHeight = Math.max(expectedHeight || 75, 75);

  // Create a simplified preview editor
  const previewEditor = (
    <PresentationEditor
      initialContent={slide}
      className="min-h-[300px] border"
      id={previewId}
      isPreview={true}
      readOnly={true}
      slideIndex={slideIndex}
      onChange={() => {/* No-op for preview */}}
      isGenerating={isGeneratingPresentation}
    />
  );

  return (
    <div
      ref={childrenRef}
      style={{ 
        position: "absolute", 
        visibility: "hidden",
        width: "800px", // Fixed width for consistent calculations
        height: "600px", // Fixed height for consistent calculations
      }}
    >
      {previewEditor}
      {createPortal(
        <div
          className="max-h-96 transition-all duration-300 ease-in-out"
          style={{
            height: isReady ? `${finalHeight}px` : "75px",
            opacity: isReady ? 1 : 0.7,
          }}
        >
          <div
            style={{
              transform: `scale(${scale})`,
              transformOrigin: "top left",
              width: dimensions.editorWidth,
              height: dimensions.editorHeight,
              pointerEvents: "none",
              transition: "transform 0.2s ease-in-out",
            }}
          >
            {previewEditor}
          </div>
        </div>,
        previewElement
      )}
    </div>
  );
}
