"use client";

import React, {
  useRef,
  useEffect,
  useLayoutEffect,
  useMemo,
} from "react";
import { useContentStore } from "@/store/useContentStore";

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

interface LineHeightMirrorProps {
  textareaWidth: number;
  setLineHeights: (heights: number[]) => void;
}

export function LineHeightMirror({
  textareaWidth,
  setLineHeights,
}: LineHeightMirrorProps) {
  const { content } = useContentStore();
  const mirrorRef = useRef<HTMLDivElement>(null);
  const lines = useMemo(() => (content || "").split("\n"), [content]);

  // Recalculate heights for each line in the mirror element
  useIsomorphicLayoutEffect(() => {
    if (!mirrorRef.current) return;
    const children = mirrorRef.current.children;
    const heights = new Array<number>(children.length);
    for (let i = 0; i < children.length; i++) {
      heights[i] = (children[i] as HTMLElement).offsetHeight;
    }
    setLineHeights(heights);
  }, [content, textareaWidth, setLineHeights]);

  return (
    <div
      ref={mirrorRef}
      aria-hidden="true"
      className="pointer-events-none invisible absolute left-0 top-0 overflow-hidden font-mono text-sm leading-6 whitespace-pre-wrap break-words"
      style={{
        width: textareaWidth > 0 ? `${textareaWidth}px` : "auto",
        wordBreak: "break-word",
      }}
    >
      {(lines || []).map((line, i) => (
        <div key={i} className="leading-6 min-h-[1.5rem] break-words">
          {line || "\u00A0"}
        </div>
      ))}
    </div>
  );
}
