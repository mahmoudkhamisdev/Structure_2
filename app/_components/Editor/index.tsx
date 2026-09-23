"use client";

import { useRef, useState, useCallback } from "react";
import { LineNumbers } from "./_components/LineNumbers";
import { EditorTextarea } from "./_components/EditorTextarea";
import { LineHeightMirror } from "./_components/LineHeightMirror";
import { EditorFlowGuide } from "./_components/EditorFlowGuide";
import { useContentStore } from "@/store/useContentStore";

export function Editor() {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  const { fileName, viewerTab } = useContentStore();
  const isFlow = viewerTab === "flow" || fileName?.toLowerCase().endsWith(".flow");

  const [cursorLine, setCursorLine] = useState<number>(1);
  const [lineHeights, setLineHeights] = useState<number[]>([]);
  const [textareaWidth, setTextareaWidth] = useState<number>(0);

  // Synchronize scroll between textarea and line numbers
  const handleScroll = useCallback(() => {
    if (lineNumbersRef.current && textareaRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  }, []);

  return (
    <div className="relative flex flex-col h-full w-full bg-background overflow-hidden">
      {/* Top Flow Guide Bar with Node Creation Cheat Sheet & Copy for AI */}
      {isFlow && <EditorFlowGuide />}

      <div className="relative flex flex-1 h-full w-full overflow-hidden">
        {/* Hidden mirror element to calculate wrapped line heights */}
        <LineHeightMirror
          textareaWidth={textareaWidth}
          setLineHeights={setLineHeights}
        />

        {/* Line Numbers Gutter */}
        <LineNumbers
          lineNumbersRef={lineNumbersRef}
          textareaRef={textareaRef}
          lineHeights={lineHeights}
          cursorLine={cursorLine}
          setCursorLine={setCursorLine}
        />

        {/* Textarea Editor */}
        <EditorTextarea
          textareaRef={textareaRef}
          onScroll={handleScroll}
          onWidthChange={setTextareaWidth}
          setCursorLine={setCursorLine}
        />
      </div>
    </div>
  );
}
