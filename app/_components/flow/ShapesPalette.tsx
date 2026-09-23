"use client";

import React, { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import { Search, X, Layers, Sparkles, Type } from "lucide-react";
import { useTheme } from "next-themes";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DraggableShapeItem } from "./DraggableShapeItem";
import { flowchartShapes } from "./flowchartShapes";
import type { ChenNodeType, FlowchartNodeType } from "./types";
import { cn } from "cn";

export interface PaletteShapeItem {
  type: ChenNodeType;
  name: string;
  category: "process" | "data" | "logic" | "connectors";
  description: string;
  icon?: React.ReactNode;
}

export const allPaletteShapes: PaletteShapeItem[] = Object.values(flowchartShapes).map((s) => ({
  type: s.type,
  name: s.name,
  category: s.category,
  description: s.description,
}));

interface ShapesPaletteProps {
  open: boolean;
  onClose: () => void;
  onAddNode: (type: ChenNodeType, label?: string) => void;
  isDragging?: boolean;
  className?: string;
  portal?: boolean;
}

export function ShapesPalette({
  open,
  onClose,
  onAddNode,
  isDragging = false,
  className,
  portal = false,
}: ShapesPaletteProps) {
  const { resolvedTheme } = useTheme();
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof document !== "undefined") {
      return document.documentElement.classList.contains("dark");
    }
    return false;
  });

  useEffect(() => {
    const updateThemeState = () => {
      const isHtmlDark = document.documentElement.classList.contains("dark");
      setIsDark(isHtmlDark);
    };

    updateThemeState();

    const observer = new MutationObserver(updateThemeState);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, [resolvedTheme]);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");
  const paletteRef = React.useRef<HTMLDivElement>(null);

  // Close when clicking outside the popup (e.g. on canvas, toolbar tools, or anywhere outside)
  React.useEffect(() => {
    if (!open || isDragging) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;

      // Keep open if clicking the toolbar toggle button
      if (target.closest("[data-shapes-trigger]")) {
        return;
      }

      // Close if click is outside the palette container
      if (paletteRef.current && !paletteRef.current.contains(target)) {
        onClose();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    // Use capture: true so it catches clicks before canvas or tools stop propagation
    window.addEventListener("pointerdown", handlePointerDown, { capture: true });
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown, { capture: true });
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose, isDragging]);

  const filteredShapes = useMemo(() => {
    return allPaletteShapes.filter((shape) => {
      const matchesCategory = category === "all" || shape.category === category;
      const matchesSearch =
        !search.trim() ||
        shape.name.toLowerCase().includes(search.toLowerCase()) ||
        shape.description.toLowerCase().includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [search, category]);

  if (!open) return null;

  const paletteContent = (
    <div
      ref={paletteRef}
      aria-label="Flowchart Shapes Palette"
      className={cn(
        portal
          ? "fixed right-16 top-1/2 -translate-y-1/2 z-50 w-[94%] max-w-lg rounded-xl border border-border bg-card/95 backdrop-blur-md shadow-2xl p-3 animate-in fade-in zoom-in-95 duration-150"
          : "absolute right-14 top-1/2 -translate-y-1/2 z-30 w-[94%] max-w-lg rounded-xl border border-border bg-card/95 backdrop-blur-md shadow-2xl p-3 animate-in fade-in zoom-in-95 duration-150",
        isDragging && "opacity-0! pointer-events-none",
        className
      )}
    >
      {/* Header with Search and Close */}
      <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-border/70">
        <div className="flex items-center gap-1.5 font-semibold text-xs text-foreground">
          <Layers className="size-4 text-primary" />
          <span>Flow Shapes Library ({allPaletteShapes.length})</span>
        </div>

        <div className="flex items-center gap-2 flex-1 max-w-xs ml-auto">
          <div className="relative w-full">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 size-3 text-muted-foreground pointer-events-none" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter shapes..."
              className="h-7 text-xs pl-7 pr-2"
              autoFocus
            />
          </div>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={onClose}
            title="Minimize / Close"
            className="size-7 rounded-md text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <X className="size-3.5" />
          </Button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="pt-2">
        <Tabs value={category} onValueChange={setCategory} className="w-full">
          <TabsList className="h-7 w-full justify-start overflow-x-auto bg-muted/60 p-0.5 scrollbar-none">
            <TabsTrigger value="all" className="h-6 px-2.5 text-[11px]">
              All ({allPaletteShapes.length})
            </TabsTrigger>
            <TabsTrigger value="process" className="h-6 px-2.5 text-[11px]">
              Process
            </TabsTrigger>
            <TabsTrigger value="data" className="h-6 px-2.5 text-[11px]">
              Data & Docs
            </TabsTrigger>
            <TabsTrigger value="logic" className="h-6 px-2.5 text-[11px]">
              Logic & Branch
            </TabsTrigger>
            <TabsTrigger value="connectors" className="h-6 px-2.5 text-[11px]">
              Connectors
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Shape Grid */}
      <div className="mt-2.5 max-h-64 overflow-y-auto pr-1 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
        {filteredShapes.length === 0 ? (
          <div className="col-span-full py-8 text-center text-xs text-muted-foreground">
            No shapes match "{search}"
          </div>
        ) : (
          filteredShapes.map((shape) => {
            const meta = flowchartShapes[shape.type as FlowchartNodeType];
            const icon = meta ? meta.renderSvg({ className: "max-h-7 max-w-full", isDark }) : shape.icon;
            return (
              <DraggableShapeItem
                key={shape.type}
                type={shape.type}
                name={shape.name}
                description={shape.description}
                icon={icon}
                onAddNode={(type, label) => {
                  onAddNode(type, label);
                  onClose();
                }}
                variant="card"
              />
            );
          })
        )}
      </div>
    </div>
  );

  if (portal && typeof document !== "undefined") {
    return createPortal(paletteContent, document.body);
  }

  return paletteContent;
}
