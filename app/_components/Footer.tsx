"use client";

import { useMemo } from "react";
import { useContentStore } from "@/store/useContentStore";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  FileEdit,
  Eye,
  Clock,
  Heading,
  Code2,
} from "lucide-react";

export function Footer() {
  const { content } = useContentStore();

  const stats = useMemo(() => {
    const text = content || "";
    const lines = text.length === 0 ? 0 : text.split("\n").length;
    const words = text.trim() ? (text.trim().match(/\S+/g) || []).length : 0;
    const chars = text.length;
    const charsNoSpaces = text.replace(/\s/g, "").length;
    const headings = (text.match(/^#{1,6}\s+.+$/gm) || []).length;
    const codeBlocks = (text.match(/```[\s\S]*?```/g) || []).length;
    const readingTime = Math.max(1, Math.ceil(words / 200));

    // Formatted size
    const bytes = new Blob([text]).size;
    const size =
      bytes < 1024
        ? `${bytes} B`
        : `${(bytes / 1024).toFixed(1)} KB`;

    return {
      lines,
      words,
      chars,
      charsNoSpaces,
      headings,
      codeBlocks,
      readingTime,
      size,
    };
  }, [content]);

  return (
    <footer className="flex h-8 w-full items-center justify-between border-t bg-background/95 px-3 lg:px-4 text-[11px] font-medium text-muted-foreground select-none">
      {/* Left: Editor Details */}
      <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-1.5 text-foreground/90 shrink-0">
          <FileEdit className="size-3.5 text-primary" />
          <span className="font-semibold text-[11px]">Editor</span>
        </div>

        <Separator orientation="vertical" className="h-3.5 shrink-0" />

        <Tooltip>
          <TooltipTrigger className="cursor-default hover:text-foreground transition-colors shrink-0">
            Lines: {stats.lines}
          </TooltipTrigger>
          <TooltipContent side="top">Total lines in document</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger className="cursor-default hover:text-foreground transition-colors shrink-0">
            Words: {stats.words}
          </TooltipTrigger>
          <TooltipContent side="top">Total words in document</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger className="cursor-default hover:text-foreground transition-colors shrink-0">
            Chars: {stats.chars}
          </TooltipTrigger>
          <TooltipContent side="top">
            {stats.chars} characters ({stats.charsNoSpaces} without spaces)
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger className="cursor-default hover:text-foreground transition-colors hidden sm:inline-flex shrink-0">
            Size: {stats.size}
          </TooltipTrigger>
          <TooltipContent side="top">Document file size</TooltipContent>
        </Tooltip>
      </div>

      {/* Right: Viewer Details */}
      <div className="items-center gap-2 sm:gap-3 shrink-0 hidden md:flex ">
        <div className="flex items-center gap-1.5 text-foreground/90 shrink-0">
          <Eye className="size-3.5 text-primary" />
          <span className="font-semibold text-[11px]">Viewer</span>
        </div>

        <Separator orientation="vertical" className="h-3.5 shrink-0" />

        <Tooltip>
          <TooltipTrigger className="inline-flex items-center gap-1 cursor-default hover:text-foreground transition-colors shrink-0">
            <Clock className="size-3 text-muted-foreground" />
            <span>{stats.readingTime} min read</span>
          </TooltipTrigger>
          <TooltipContent side="top">Estimated reading time (~200 wpm)</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger className="hidden md:inline-flex items-center gap-1 cursor-default hover:text-foreground transition-colors shrink-0">
            <Heading className="size-3 text-muted-foreground" />
            <span>{stats.headings} headings</span>
          </TooltipTrigger>
          <TooltipContent side="top">Total section headings</TooltipContent>
        </Tooltip>

        {stats.codeBlocks > 0 && (
          <Tooltip>
            <TooltipTrigger className="hidden lg:inline-flex items-center gap-1 cursor-default hover:text-foreground transition-colors shrink-0">
              <Code2 className="size-3 text-muted-foreground" />
              <span>{stats.codeBlocks} code</span>
            </TooltipTrigger>
            <TooltipContent side="top">Total code blocks</TooltipContent>
          </Tooltip>
        )}
      </div>
    </footer>
  );
}
