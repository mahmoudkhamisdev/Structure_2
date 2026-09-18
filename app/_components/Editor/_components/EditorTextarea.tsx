"use client";

import React, { useEffect, useCallback, RefObject } from "react";
import { useContentStore } from "@/store/useContentStore";

interface EditorTextareaProps {
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  onScroll: () => void;
  onWidthChange: (width: number) => void;
  setCursorLine: (line: number) => void;
}

export function EditorTextarea({
  textareaRef,
  onScroll,
  onWidthChange,
  setCursorLine,
}: EditorTextareaProps) {
  const { content, setContent } = useContentStore();

  // Measure textarea text width to calculate exact line wraps
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const updateWidth = () => {
      // 28px = pl-3 (12px) + pr-4 (16px)
      const width = textarea.clientWidth - 28;
      if (width > 0) onWidthChange(width);
    };

    updateWidth();

    const observer = new ResizeObserver(() => {
      updateWidth();
    });

    observer.observe(textarea);
    return () => observer.disconnect();
  }, [textareaRef, onWidthChange]);

  // Track the active line based on cursor position
  const updateCursorLine = useCallback(
    (target?: HTMLTextAreaElement) => {
      const el = target || textareaRef.current;
      if (!el) return;
      const pos = el.selectionStart;
      const textBefore = el.value.substring(0, pos);
      const currentLine = textBefore.split("\n").length;
      setCursorLine(currentLine);
    },
    [textareaRef, setCursorLine]
  );

  // Handle Tab key for 2-space indentation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Tab") {
        e.preventDefault();
        const textarea = e.currentTarget;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;

        const val = content || "";
        const updated = val.substring(0, start) + "  " + val.substring(end);
        setContent(updated);

        requestAnimationFrame(() => {
          textarea.selectionStart = textarea.selectionEnd = start + 2;
          updateCursorLine(textarea);
        });
      }
    },
    [content, setContent, updateCursorLine]
  );

  return (
    <div className="relative flex-1 h-full overflow-hidden">
      <textarea
        ref={textareaRef}
        value={content || ""}
        onChange={(e) => {
          setContent(e.target.value);
          updateCursorLine(e.target);
        }}
        onKeyDown={handleKeyDown}
        onKeyUp={(e) => updateCursorLine(e.currentTarget)}
        onClick={(e) => updateCursorLine(e.currentTarget)}
        onSelect={(e) => updateCursorLine(e.currentTarget)}
        onScroll={onScroll}
        placeholder="Write your markdown here..."
        spellCheck={false}
        autoCapitalize="none"
        autoComplete="off"
        autoCorrect="off"
        className="h-full w-full resize-none border-0 bg-transparent py-4 pl-3 pr-4 font-mono text-sm leading-6 text-foreground placeholder:text-muted-foreground outline-none focus:outline-none focus:ring-0 overflow-y-auto selection:bg-primary/20 selection:text-foreground"
      />
    </div>
  );
}
