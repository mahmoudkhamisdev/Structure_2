"use client";

import React, { useMemo, useState, useEffect, useRef } from "react";
import { useContentStore } from "@/store/useContentStore";
import { extractHeadings, OutlineHeading } from "@/lib/outline";
import { cn } from "@/lib/utils";
import { ListTree, Search, FileText, ChevronRight, X } from "lucide-react";

export function Outlines() {
  const { content } = useContentStore();
  const [activeId, setActiveId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const isUserClickRef = useRef<boolean>(false);

  // Extract headings from markdown content
  const headings = useMemo(() => {
    return extractHeadings(content || "");
  }, [content]);

  // Filter headings based on search query
  const filteredHeadings = useMemo(() => {
    if (!searchQuery.trim()) return headings;
    const query = searchQuery.toLowerCase();
    return (headings || []).filter((h) =>
      h.text.toLowerCase().includes(query)
    );
  }, [headings, searchQuery]);

  // Scroll spy: highlight current heading when scrolling inside Viewer
  useEffect(() => {
    const container = document.getElementById("viewer-container");
    if (!container || !headings.length) return;

    const handleScroll = () => {
      // Don't override if a direct click scroll is in progress
      if (isUserClickRef.current) return;

      const containerRect = container.getBoundingClientRect();
      let currentId = headings[0]?.id || "";

      for (const h of headings) {
        const el = document.getElementById(h.id);
        if (el) {
          const elRect = el.getBoundingClientRect();
          // Offset 140px accommodates top margins and header
          if (elRect.top - containerRect.top <= 140) {
            currentId = h.id;
          } else {
            break;
          }
        }
      }

      if (currentId) {
        setActiveId(currentId);
      }
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => container.removeEventListener("scroll", handleScroll);
  }, [headings]);

  const handleHeadingClick = (id: string) => {
    setActiveId(id);
    isUserClickRef.current = true;

    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });

      // Subtle pulse highlight on the heading in Viewer
      target.classList.add(
        "bg-primary/10",
        "rounded-md",
        "transition-colors",
        "duration-500"
      );
      setTimeout(() => {
        target.classList.remove("bg-primary/10");
        isUserClickRef.current = false;
      }, 1200);
    } else {
      isUserClickRef.current = false;
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-background border-l border-border/40 select-none overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/40 shrink-0">
        <div className="flex items-center gap-2">
          <ListTree className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold tracking-tight text-foreground">
            Outlines
          </span>
        </div>
        <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
          {headings.length}
        </span>
      </div>

      {/* Quick Search (shown if multiple headings exist) */}
      {headings.length > 3 && (
        <div className="px-3 py-2 border-b border-border/20 shrink-0">
          <div className="relative flex items-center">
            <Search className="absolute left-2.5 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter headings..."
              className="w-full bg-muted/40 hover:bg-muted/70 focus:bg-background text-xs pl-8 pr-7 py-1.5 rounded-md border border-border/50 outline-none transition-colors focus:ring-1 focus:ring-primary text-foreground placeholder:text-muted-foreground"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2 text-muted-foreground hover:text-foreground p-0.5"
                aria-label="Clear filter"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Headings List or Empty State */}
      <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {!headings || headings.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4 py-8 text-muted-foreground">
            <div className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center mb-3">
              <FileText className="w-5 h-5 text-muted-foreground/60" />
            </div>
            <p className="text-sm font-medium text-foreground mb-1">
              No outlines found
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-[200px]">
              Add headings with <code className="text-primary font-mono">#</code> in the editor to build your document outline.
            </p>
          </div>
        ) : filteredHeadings.length === 0 ? (
          <div className="text-center py-8 text-xs text-muted-foreground">
            No headings match &quot;{searchQuery}&quot;
          </div>
        ) : (
          (filteredHeadings || []).map((heading) => {
            const isActive = activeId === heading.id;

            // Indentation by heading level
            const indentClass =
              heading.level === 1
                ? "pl-2"
                : heading.level === 2
                ? "pl-5"
                : heading.level === 3
                ? "pl-8"
                : heading.level === 4
                ? "pl-11"
                : heading.level === 5
                ? "pl-13"
                : "pl-15";

            return (
              <button
                key={heading.id}
                onClick={() => handleHeadingClick(heading.id)}
                title={heading.text}
                className={cn(
                  "group w-full flex items-center gap-2 py-1.5 pr-2.5 rounded-md text-left transition-all duration-150 relative",
                  indentClass,
                  isActive
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                )}
              >
                {/* Active Indicator Bar */}
                {isActive && (
                  <span className="absolute left-0 top-1 bottom-1 w-1 rounded-r-full bg-primary" />
                )}

                {/* Level Tag */}
                <span
                  className={cn(
                    "text-[10px] font-mono px-1.5 py-0.2 rounded shrink-0 transition-colors",
                    isActive
                      ? "bg-primary/20 text-primary font-semibold"
                      : "bg-muted text-muted-foreground/70 group-hover:text-foreground"
                  )}
                >
                  H{heading.level}
                </span>

                {/* Heading Text with Auto RTL/LTR support */}
                <span
                  dir="auto"
                  className={cn(
                    "text-xs truncate flex-1 text-start leading-snug",
                    heading.level === 1 ? "font-semibold" : "font-normal"
                  )}
                >
                  {heading.text}
                </span>

                <ChevronRight
                  className={cn(
                    "w-3 h-3 opacity-0 group-hover:opacity-60 transition-opacity shrink-0",
                    isActive && "opacity-80 text-primary"
                  )}
                />
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
