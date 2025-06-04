"use client";

import debounce from "lodash.debounce";
import { useEffect, useState, useRef, useMemo } from "react";
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
  const [scale, setScale] = useState(1);
  const childrenRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({
    editorWidth: 0,
    editorHeight: 0,
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

  useEffect(() => {
    const calculateDimensions = () => {
      const slidePreview = document.querySelector(
        `#slide-preview-${slideIndex}`
      );

      if (!slidePreview || !childrenRef.current) return;

      const previewRect = slidePreview.getBoundingClientRect();
      const editorRect = childrenRef.current.getBoundingClientRect();

      const previewWidth = previewRect.width;
      const previewHeight = previewRect.height;
      const editorWidth = editorRect.width;
      const editorHeight = editorRect.height;
      // Calculate scale for width to fit the preview
      const newScale = previewWidth / editorWidth;
      setDimensions({
        editorWidth,
        editorHeight,
        previewWidth,
        previewHeight,
      });

      setScale(newScale);
    };

    const debouncedCalculateDimensions = debounce(calculateDimensions, 600);

    // Setup resize observer for responsive scaling
    const observer = new ResizeObserver(() => {
      debouncedCalculateDimensions();
    });

    const slidePreview = document.querySelector(`#slide-preview-${slideIndex}`);
    if (slidePreview && childrenRef.current) {
      observer.observe(slidePreview);
      observer.observe(childrenRef.current);
      // Initial calculation
      calculateDimensions();
    }

    return () => {
      observer.disconnect();
    };
  }, [slideIndex, mounted]);

  if (!mounted) return null;

  // Find the preview element to portal into
  const previewElement = document.querySelector(`#slide-preview-${slideIndex}`);
  if (!previewElement) return null;

  // Calculate expected height based on the aspect ratio
  const aspectRatio = dimensions.editorHeight / dimensions.editorWidth;
  const expectedHeight = dimensions.previewWidth * aspectRatio;

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
      style={{ position: "absolute", visibility: "hidden" }}
    >
      {previewEditor}
      {createPortal(
        <div
          className="max-h-96"
          style={{
            height:
              expectedHeight && expectedHeight > 0 ? expectedHeight : "75px",
            transition: "height 150ms ease-in-out",
          }}
        >
          <div
            style={{
              transform: `scale(${scale})`,
              transformOrigin: "top left",
              width: dimensions.editorWidth || 0,
              height: dimensions.editorHeight || 0,
              pointerEvents: "none",
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
