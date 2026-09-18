"use client";

import React, { useMemo, RefObject } from "react";
import { useContentStore } from "@/store/useContentStore";
import { cn } from "@/lib/utils";

interface LineNumbersProps {
  lineNumbersRef: RefObject<HTMLDivElement | null>;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  lineHeights: number[];
  cursorLine: number;
  setCursorLine: (line: number) => void;
}

export function LineNumbers({
  lineNumbersRef,
  textareaRef,
  lineHeights,
  cursorLine,
  setCursorLine,
}: LineNumbersProps) {
  const { content } = useContentStore();

  const lines = useMemo(() => (content || "").split("\n"), [content]);
  const digits = Math.max(String(lines.length).length, 2);
  const gutterWidth = Math.max(digits * 10 + 24, 44);

  // Scroll textarea when mouse wheel is used over the gutter
  const handleGutterWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (textareaRef.current) {
      textareaRef.current.scrollTop += e.deltaY;
    }
  };

  // Jump cursor directly to clicked line
  const handleLineNumberClick = (lineIndex: number) => {
    if (!textareaRef.current) return;
    let charIndex = 0;
    for (let i = 0; i < lineIndex; i++) {
      charIndex += (lines[i] || "").length + 1;
    }
    textareaRef.current.focus();
    textareaRef.current.setSelectionRange(charIndex, charIndex);
    const textBefore = textareaRef.current.value.substring(0, charIndex);
    setCursorLine(textBefore.split("\n").length);
  };

  return (
    <div
      ref={lineNumbersRef}
      onWheel={handleGutterWheel}
      aria-hidden="true"
      className="h-full select-none overflow-hidden border-r border-border/40 bg-muted/10 py-4 px-3 text-right font-mono text-sm leading-6 text-muted-foreground/40 shrink-0 transition-[width] duration-150"
      style={{ width: `${gutterWidth}px` }}
    >
      {(lines || []).map((_, i) => {
        const lineNum = i + 1;
        const isActive = cursorLine === lineNum;
        return (
          <div
            key={i}
            onClick={() => handleLineNumberClick(i)}
            style={{
              height: lineHeights[i] ? `${lineHeights[i]}px` : "1.5rem",
            }}
            className={cn(
              "cursor-pointer leading-6 transition-colors select-none",
              isActive
                ? "font-semibold text-foreground"
                : "text-muted-foreground/40 hover:text-muted-foreground"
            )}
            title={`Line ${lineNum}`}
          >
            {lineNum}
          </div>
        );
      })}
    </div>
  );
}
