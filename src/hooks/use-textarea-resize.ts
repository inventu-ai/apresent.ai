import { useEffect, useRef } from "react";

export function useTextareaResize(value: string, minRows: number = 1) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Reset height to auto to get the correct scrollHeight
    textarea.style.height = "auto";
    
    // Calculate the height based on content
    const scrollHeight = textarea.scrollHeight;
    const lineHeight = parseInt(getComputedStyle(textarea).lineHeight);
    const minHeight = lineHeight * minRows;
    
    // Set the height to the larger of minHeight or scrollHeight
    textarea.style.height = `${Math.max(minHeight, scrollHeight)}px`;
  }, [value, minRows]);

  return textareaRef;
}
