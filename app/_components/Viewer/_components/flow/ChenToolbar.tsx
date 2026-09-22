"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Trash2,
  Maximize,
  Minimize,
  HelpCircle,
  MousePointer,
  Hand,
  Download,
  FileCode,
  FileText,
  Shapes,
  ChevronDown,
  Undo2,
  Redo2,
} from "lucide-react";
import type { ChenNodeType } from "./types";
import { DraggableShapeItem } from "./DraggableShapeItem";
import { ShapesPalette } from "./ShapesPalette";
import { flowchartShapes } from "./flowchartShapes";
import { cn } from "cn";

export type InteractionMode = "pointer" | "hand";

interface ChenToolbarProps {
  mode: InteractionMode;
  onModeChange: (mode: InteractionMode) => void;
  onAddNode: (type: ChenNodeType, label?: string) => void;
  onClear: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  onExport: (format: "png" | "svg" | "pdf") => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
  paletteOpen?: boolean;
  onTogglePalette?: () => void;
  onClosePalette?: () => void;
  isDragging?: boolean;
}

export function ChenToolbar({
  mode,
  onModeChange,
  onAddNode,
  onClear,
  isFullscreen,
  onToggleFullscreen,
  onExport,
  canUndo = false,
  canRedo = false,
  onUndo,
  onRedo,
  paletteOpen: controlledPaletteOpen,
  onTogglePalette,
  onClosePalette,
  isDragging = false,
}: ChenToolbarProps) {
  const [localPaletteOpen, setLocalPaletteOpen] = useState(false);
  const paletteOpen = controlledPaletteOpen ?? localPaletteOpen;
  const handleTogglePalette = onTogglePalette ?? (() => setLocalPaletteOpen((prev) => !prev));
  const handleClosePalette = onClosePalette ?? (() => setLocalPaletteOpen(false));

  // Quick access essential shapes for the minimized bar
  const quickShapes: { type: ChenNodeType; name: string; description: string; icon: React.ReactNode }[] = [
    {
      type: "process",
      name: "Process",
      description: "Rectangle - standard process function",
      icon: (
        <svg className="size-4" viewBox="0 0 20 16" fill="none">
          <rect x="2" y="2.5" width="16" height="11" rx="2" stroke="currentColor" strokeWidth="1.6" />
        </svg>
      ),
    },
    {
      type: "decision",
      name: "Decision",
      description: "Diamond - decision point between paths",
      icon: (
        <svg className="size-4" viewBox="0 0 20 20" fill="none">
          <polygon points="10,2 18,10 10,18 2,10" stroke="currentColor" strokeWidth="1.6" />
        </svg>
      ),
    },
    {
      type: "terminator",
      name: "Terminator",
      description: "Pill shape - start or end of flow",
      icon: (
        <svg className="size-4" viewBox="0 0 20 16" fill="none">
          <rect x="2" y="3" width="16" height="10" rx="5" stroke="currentColor" strokeWidth="1.6" />
        </svg>
      ),
    },
    {
      type: "data",
      name: "Data / I/O",
      description: "Parallelogram - input or output data",
      icon: (
        <svg className="size-4" viewBox="0 0 20 16" fill="none">
          <polygon points="5,3 18,3 15,13 2,13" stroke="currentColor" strokeWidth="1.6" />
        </svg>
      ),
    },
  ];

  return (
    <TooltipProvider delay={150}>
      <aside
        aria-label="Flowchart Shapes Toolbar"
        className="absolute top-3.5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 px-2 py-1.5 rounded-xl border border-border bg-card/95 backdrop-blur-md shadow-lg animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Pointer (Select) and Hand (Pan) Modes */}
        <div className="flex items-center gap-0.5">
          {/* Mouse / Pointer Tool */}
          <Tooltip>
            <TooltipTrigger
              render={
                <button
                  type="button"
                  onClick={() => {
                    onModeChange("pointer");
                    handleClosePalette();
                  }}
                  className={cn(
                    "size-7.5 rounded-lg flex items-center justify-center transition-all active:scale-95 cursor-pointer outline-none",
                    mode === "pointer"
                      ? "bg-primary text-primary-foreground shadow-2xs"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/80"
                  )}
                >
                  <MousePointer className="size-3.5" />
                </button>
              }
            />
            <TooltipContent side="bottom" sideOffset={6} className="text-xs font-semibold py-1 px-2">
              Select Tool
            </TooltipContent>
          </Tooltip>

          {/* Hand / Pan Tool */}
          <Tooltip>
            <TooltipTrigger
              render={
                <button
                  type="button"
                  onClick={() => {
                    onModeChange("hand");
                    handleClosePalette();
                  }}
                  className={cn(
                    "size-7.5 rounded-lg flex items-center justify-center transition-all active:scale-95 cursor-pointer outline-none",
                    mode === "hand"
                      ? "bg-primary text-primary-foreground shadow-2xs"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/80"
                  )}
                >
                  <Hand className="size-3.5" />
                </button>
              }
            />
            <TooltipContent side="bottom" sideOffset={6} className="text-xs font-semibold py-1 px-2">
              Pan Tool
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Vertical Divider */}
        <div className="h-4.5 w-px bg-border mx-0.5" />

        {/* Prev / Next History Actions (Undo / Redo) */}
        <div className="flex items-center gap-0.5">
          {/* Prev Action / Undo */}
          <Tooltip>
            <TooltipTrigger
              render={
                <button
                  type="button"
                  disabled={!canUndo}
                  onClick={() => {
                    onUndo?.();
                    handleClosePalette();
                  }}
                  className={cn(
                    "size-7.5 rounded-lg flex items-center justify-center transition-all active:scale-95 outline-none",
                    canUndo
                      ? "text-muted-foreground hover:text-foreground hover:bg-accent/80 cursor-pointer"
                      : "text-muted-foreground/30 cursor-not-allowed pointer-events-none"
                  )}
                >
                  <Undo2 className="size-3.5" />
                </button>
              }
            />
            <TooltipContent side="bottom" sideOffset={6} className="text-xs font-semibold py-1 px-2">
              Prev Action (Ctrl+Z)
            </TooltipContent>
          </Tooltip>

          {/* Next Action / Redo */}
          <Tooltip>
            <TooltipTrigger
              render={
                <button
                  type="button"
                  disabled={!canRedo}
                  onClick={() => {
                    onRedo?.();
                    handleClosePalette();
                  }}
                  className={cn(
                    "size-7.5 rounded-lg flex items-center justify-center transition-all active:scale-95 outline-none",
                    canRedo
                      ? "text-muted-foreground hover:text-foreground hover:bg-accent/80 cursor-pointer"
                      : "text-muted-foreground/30 cursor-not-allowed pointer-events-none"
                  )}
                >
                  <Redo2 className="size-3.5" />
                </button>
              }
            />
            <TooltipContent side="bottom" sideOffset={6} className="text-xs font-semibold py-1 px-2">
              Next Action (Ctrl+Y)
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Vertical Divider */}
        <div className="h-4.5 w-px bg-border mx-0.5" />

        {/* Top 4 Quick Shapes (Draggable & Clickable) */}
        <div className="flex items-center gap-0.5">
          {quickShapes.map((shape) => (
            <DraggableShapeItem
              key={shape.type}
              type={shape.type}
              name={shape.name}
              description={shape.description}
              icon={shape.icon}
              onAddNode={onAddNode}
              variant="toolbar"
            />
          ))}
        </div>

        {/* Minimized Shape Library Toggle Button */}
        <Tooltip>
          <TooltipTrigger
            render={
              <button
                type="button"
                data-shapes-trigger="true"
                onClick={handleTogglePalette}
                className={cn(
                  "h-7.5 px-2 text-xs gap-1.5 rounded-lg font-medium flex items-center transition-all active:scale-95 cursor-pointer shadow-2xs border outline-none",
                  paletteOpen
                    ? "bg-primary/10 border-primary/50 text-primary"
                    : "border-border text-foreground hover:bg-accent/80"
                )}
              >
                <Shapes className="size-3.5 text-primary" />
                <span className="hidden sm:inline">Shapes</span>
                <ChevronDown
                  className={cn("size-3 text-muted-foreground transition-transform duration-200", paletteOpen && "rotate-180")}
                />
              </button>
            }
          />
          <TooltipContent side="bottom" sideOffset={6} className="text-xs font-semibold py-1 px-2">
            Shapes Library
          </TooltipContent>
        </Tooltip>

        {/* Vertical Divider */}
        <div className="h-4.5 w-px bg-border mx-0.5" />

        {/* View & Canvas Actions */}
        <div className="flex items-center gap-0.5">
          {/* Full Screen Toggle */}
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={onToggleFullscreen}
                  className="size-7.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/80 transition-all active:scale-95 cursor-pointer"
                >
                  {isFullscreen ? (
                    <Minimize className="size-3.5" />
                  ) : (
                    <Maximize className="size-3.5" />
                  )}
                </Button>
              }
            />
            <TooltipContent side="bottom" sideOffset={6} className="text-xs font-semibold py-1 px-2">
              {isFullscreen ? "Exit Full Screen" : "Full Screen"}
            </TooltipContent>
          </Tooltip>

          {/* Export Dropdown */}
          <DropdownMenu>
            <Tooltip>
              <DropdownMenuTrigger
                render={
                  <TooltipTrigger
                    render={
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        className="size-7.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/80 transition-all active:scale-95 cursor-pointer"
                      >
                        <Download className="size-3.5" />
                      </Button>
                    }
                  />
                }
              />
              <TooltipContent side="bottom" sideOffset={6} className="text-xs font-semibold py-1 px-2">
                Export Diagram
              </TooltipContent>
            </Tooltip>
            <DropdownMenuContent side="bottom" align="end" sideOffset={8} className="w-40 text-xs">
              <DropdownMenuItem
                onClick={() => onExport("png")}
                className="gap-2 cursor-pointer"
              >
                <FileText className="size-3.5 text-muted-foreground" />
                <span>Export as PNG</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onExport("svg")}
                className="gap-2 cursor-pointer"
              >
                <FileCode className="size-3.5 text-muted-foreground" />
                <span>Export as SVG</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onExport("pdf")}
                className="gap-2 cursor-pointer"
              >
                <FileText className="size-3.5 text-muted-foreground" />
                <span>Export as PDF</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Clear Canvas Action */}
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => {
                    if (confirm("Clear all nodes and connections?")) {
                      onClear();
                    }
                  }}
                  className="size-7.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all active:scale-95 cursor-pointer"
                >
                  <Trash2 className="size-3.5" />
                </Button>
              }
            />
            <TooltipContent side="bottom" sideOffset={6} className="text-xs font-semibold py-1 px-2 text-destructive">
              Clear Canvas
            </TooltipContent>
          </Tooltip>
        </div>
      </aside>

      {/* Floating Minimized Shape Library Palette */}
      <ShapesPalette
        open={paletteOpen}
        onClose={handleClosePalette}
        isDragging={isDragging}
        onAddNode={(type, label) => {
          onAddNode(type, label);
          handleClosePalette();
        }}
      />
    </TooltipProvider>
  );
}
