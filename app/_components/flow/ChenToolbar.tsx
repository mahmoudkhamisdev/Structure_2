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
} from "@/components/ui/dropdown-menu";
import * as Slider from "@radix-ui/react-slider";
import {
  Trash2,
  Maximize,
  Minimize,
  HelpCircle,
  MousePointer,
  Hand,
  Shapes,
  Undo2,
  Redo2,
  Workflow,
  ArrowDown,
  ArrowRight,
  Palette,
  SlidersHorizontal,
  Check,
  Spline,
  CornerDownRight,
  Minus,
} from "lucide-react";
import type {
  ChenNodeType,
  FlowLayoutDirection,
  FlowEdgeArrowType,
  FlowEdgeRoutingType,
} from "./types";
import { DraggableShapeItem } from "./DraggableShapeItem";
import { ShapesPalette } from "./ShapesPalette";
import { flowchartShapes } from "./flowchartShapes";
import { NodeColorGrid } from "./NodeColorPicker";
import { getNodeColors } from "./nodeColors";
import {
  ARROW_TYPES,
  ROUTING_TYPES,
  ArrowPreviewIcon,
} from "./arrowTypes";
import { cn } from "cn";

export type InteractionMode = "pointer" | "hand";

interface ChenToolbarProps {
  mode: InteractionMode;
  onModeChange: (mode: InteractionMode) => void;
  onAddNode: (type: ChenNodeType, label?: string) => void;
  onClear: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
  paletteOpen?: boolean;
  onTogglePalette?: () => void;
  onClosePalette?: () => void;
  isDragging?: boolean;
  layoutDirection?: FlowLayoutDirection;
  onAutoLayout?: (direction: FlowLayoutDirection) => void;
  selectedNodeCount?: number;
  selectedNodeColor?: string;
  onNodeColorChange?: (color: string) => void;
  selectedEdgeCount?: number;
  currentArrowType?: FlowEdgeArrowType;
  currentRoutingType?: FlowEdgeRoutingType;
  onArrowTypeChange?: (arrowType: FlowEdgeArrowType) => void;
  onRoutingTypeChange?: (routingType: FlowEdgeRoutingType) => void;
  onDeleteSelectedEdge?: () => void;
  nodeSpacing?: number;
  onSpacingChange?: (spacing: number) => void;
}

export function ChenToolbar({
  mode,
  onModeChange,
  onAddNode,
  onClear,
  isFullscreen,
  onToggleFullscreen,
  canUndo = false,
  canRedo = false,
  onUndo,
  onRedo,
  paletteOpen: controlledPaletteOpen,
  onTogglePalette,
  onClosePalette,
  isDragging = false,
  layoutDirection,
  onAutoLayout,
  selectedNodeCount = 0,
  selectedNodeColor,
  onNodeColorChange,
  selectedEdgeCount = 0,
  currentArrowType = "directed",
  currentRoutingType = "bezier",
  onArrowTypeChange,
  onRoutingTypeChange,
  onDeleteSelectedEdge,
  nodeSpacing = 60,
  onSpacingChange,
}: ChenToolbarProps) {
  const [localPaletteOpen, setLocalPaletteOpen] = useState(false);
  const paletteOpen = controlledPaletteOpen ?? localPaletteOpen;
  const handleTogglePalette = onTogglePalette ?? (() => setLocalPaletteOpen((prev) => !prev));
  const handleClosePalette = onClosePalette ?? (() => setLocalPaletteOpen(false));

  const { stroke: selectedNodeStroke } = getNodeColors(selectedNodeColor);

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
        className="absolute top-1/2 -translate-y-1/2 right-3.5 z-20 flex flex-col items-center gap-1 p-1.5 rounded-xl border border-border bg-card/95 backdrop-blur-md shadow-lg animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Pointer (Select) and Hand (Pan) Modes */}
        <div className="flex flex-col items-center gap-0.5">
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
            <TooltipContent side="left" sideOffset={8} className="text-xs font-semibold py-1 px-2">
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
            <TooltipContent side="left" sideOffset={8} className="text-xs font-semibold py-1 px-2">
              Pan Tool
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Horizontal Divider */}
        <div className="w-4.5 h-px bg-border my-0.5" />

        {/* Prev / Next History Actions (Undo / Redo) */}
        <div className="flex flex-col items-center gap-0.5">
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
            <TooltipContent side="left" sideOffset={8} className="text-xs font-semibold py-1 px-2">
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
            <TooltipContent side="left" sideOffset={8} className="text-xs font-semibold py-1 px-2">
              Next Action (Ctrl+Y)
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Horizontal Divider */}
        <div className="w-4.5 h-px bg-border my-0.5" />

        {/* Top 4 Quick Shapes (Draggable & Clickable) */}
        <div className="flex flex-col items-center gap-0.5">
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

          {/* Minimized Shape Library Toggle Button */}
          <Tooltip>
            <TooltipTrigger
              render={
                <button
                  type="button"
                  data-shapes-trigger="true"
                  onClick={handleTogglePalette}
                  className={cn(
                    "size-7.5 rounded-lg flex items-center justify-center transition-all active:scale-95 cursor-pointer shadow-2xs border outline-none",
                    paletteOpen
                      ? "bg-primary/10 border-primary/50 text-primary"
                      : "border-border text-foreground hover:bg-accent/80"
                  )}
                >
                  <Shapes className="size-3.5 text-primary" />
                </button>
              }
            />
            <TooltipContent side="left" sideOffset={8} className="text-xs font-semibold py-1 px-2">
              All Shapes Library
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Horizontal Divider */}
        <div className="w-4.5 h-px bg-border my-0.5" />

        {/* Arrow Type Tool */}
        <DropdownMenu>
          <Tooltip>
            <DropdownMenuTrigger
              render={
                <TooltipTrigger
                  render={
                    <button
                      type="button"
                      className={cn(
                        "size-7.5 rounded-lg flex items-center justify-center transition-all active:scale-95 cursor-pointer relative outline-none",
                        selectedEdgeCount > 0
                          ? "bg-primary/15 text-primary border border-primary/40 shadow-xs"
                          : "text-muted-foreground hover:text-foreground hover:bg-accent/80"
                      )}
                    >
                      <ArrowPreviewIcon type={currentArrowType} className="w-5 h-2.5" />
                    </button>
                  }
                />
              }
            />
            <TooltipContent side="left" sideOffset={8} className="text-xs font-semibold py-1 px-2">
              Arrow Type {selectedEdgeCount > 0 ? "(Selected Arrow)" : "(Default)"}
            </TooltipContent>
          </Tooltip>
          <DropdownMenuContent
            side="left"
            align="center"
            sideOffset={8}
            className="w-52 p-1 text-xs shadow-xl rounded-xl"
          >
            <div className="px-2 py-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              {selectedEdgeCount > 0 ? "Selected Arrow Type" : "Default Arrow Type"}
            </div>

            <div className="flex flex-col gap-0.5">
              {ARROW_TYPES.map((opt) => {
                const isSelected = currentArrowType === opt.type;
                return (
                  <button
                    key={opt.type}
                    type="button"
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      e.stopPropagation();
                      onArrowTypeChange?.(opt.type);
                    }}
                    className={cn(
                      "flex items-center justify-between w-full rounded-md px-2 py-1.5 text-xs transition-colors cursor-pointer text-left outline-none",
                      isSelected
                        ? "bg-primary/10 text-primary font-medium"
                        : "hover:bg-accent hover:text-accent-foreground text-foreground"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          "flex items-center justify-center w-7 h-4 rounded bg-muted/60 text-foreground",
                          isSelected && "text-primary"
                        )}
                      >
                        <ArrowPreviewIcon type={opt.type} />
                      </div>
                      <span>{opt.label}</span>
                    </div>
                    {isSelected && <Check className="size-3.5 text-primary shrink-0" />}
                  </button>
                );
              })}
            </div>

            <div className="my-1 h-px bg-border/60" />

            <div className="px-2 py-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              Path Routing
            </div>
            <div className="grid grid-cols-3 gap-1 px-1">
              {ROUTING_TYPES.map((r) => {
                const isSelected = currentRoutingType === r.type;
                return (
                  <button
                    key={r.type}
                    type="button"
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      e.stopPropagation();
                      onRoutingTypeChange?.(r.type);
                    }}
                    title={r.description}
                    className={cn(
                      "flex flex-col items-center justify-center gap-1 rounded-md p-1.5 text-[11px] transition-colors cursor-pointer border",
                      isSelected
                        ? "bg-primary/15 border-primary/40 text-primary font-medium"
                        : "border-transparent hover:bg-accent text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {r.type === "bezier" ? (
                      <Spline className="size-3.5" />
                    ) : r.type === "smoothstep" ? (
                      <CornerDownRight className="size-3.5" />
                    ) : (
                      <Minus className="size-3.5" />
                    )}
                    <span className="text-[10px]">{r.label}</span>
                  </button>
                );
              })}
            </div>

            {selectedEdgeCount > 0 && onDeleteSelectedEdge && (
              <>
                <div className="my-1 h-px bg-border/60" />
                <button
                  type="button"
                  onClick={onDeleteSelectedEdge}
                  className="flex items-center gap-2 w-full rounded-md px-2 py-1.5 text-xs text-destructive hover:bg-destructive/10 cursor-pointer text-left transition-colors outline-none"
                >
                  <Trash2 className="size-3.5" />
                  <span>Delete Selected Arrow</span>
                </button>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Horizontal Divider */}
        <div className="w-4.5 h-px bg-border my-0.5" />

        {/* Node Color Picker (Shows only when clicking on any node) */}
        {selectedNodeCount > 0 && (
          <>
            <DropdownMenu>
              <Tooltip>
                <DropdownMenuTrigger
                  render={
                    <TooltipTrigger
                      render={
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          className={cn(
                            "size-7.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/80 transition-all active:scale-95 cursor-pointer relative",
                            selectedNodeColor && "text-foreground bg-accent/60"
                          )}
                        >
                          <Palette className="size-3.5" />
                          {selectedNodeStroke && (
                            <span
                              className="absolute bottom-1 right-1 size-1.5 rounded-full ring-1 ring-background"
                              style={{ backgroundColor: selectedNodeStroke }}
                            />
                          )}
                        </Button>
                      }
                    />
                  }
                />
                <TooltipContent side="left" sideOffset={8} className="text-xs font-semibold py-1 px-2">
                  Select Color
                </TooltipContent>
              </Tooltip>
              <DropdownMenuContent
                side="left"
                align="center"
                sideOffset={8}
                className="w-auto p-1 shadow-xl rounded-xl"
              >
                <NodeColorGrid
                  currentColor={selectedNodeColor}
                  onSelectColor={(color) => onNodeColorChange?.(color)}
                />
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="w-4.5 h-px bg-border my-0.5" />
          </>
        )}

        {/* View & Canvas Actions */}
        <div className="flex flex-col items-center gap-0.5">
          {/* Auto Format Layout Toggle Button (Vertical <-> Horizontal) */}
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => {
                    const nextDir = layoutDirection === "LR" ? "TB" : "LR";
                    onAutoLayout?.(nextDir);
                    handleClosePalette();
                  }}
                  className={cn(
                    "size-7.5 rounded-lg transition-all active:scale-95 cursor-pointer outline-none flex items-center justify-center",
                    layoutDirection === "LR"
                      ? "text-primary bg-primary/10 hover:bg-primary/20 hover:text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/80"
                  )}
                >
                  {layoutDirection === "LR" ? (
                    <ArrowRight className="size-3.5" />
                  ) : (
                    <ArrowDown className="size-3.5" />
                  )}
                </Button>
              }
            />
            <TooltipContent side="left" sideOffset={8} className="text-xs font-semibold py-1 px-2">
              {layoutDirection === "LR"
                ? "Layout: Horizontal (Click for Vertical)"
                : "Layout: Vertical (Click for Horizontal)"}
            </TooltipContent>
          </Tooltip>

          {/* Node Spacing Range Slider Dropdown */}
          <DropdownMenu>
            <Tooltip>
              <DropdownMenuTrigger
                render={
                  <TooltipTrigger
                    render={
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        className="size-7.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/80 transition-all active:scale-95 cursor-pointer outline-none flex items-center justify-center"
                      >
                        <SlidersHorizontal className="size-3.5" />
                      </Button>
                    }
                  />
                }
              />
              <TooltipContent side="left" sideOffset={8} className="text-xs font-semibold py-1 px-2">
                Node Spacing: Small &ndash; Large
              </TooltipContent>
            </Tooltip>
            <DropdownMenuContent
              side="left"
              align="center"
              sideOffset={8}
              className="w-56 p-3 shadow-xl rounded-xl"
            >
              <div
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
                className="flex flex-col gap-2.5 select-none"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground">Node Spacing</span>
                  <span className="text-[11px] font-medium text-muted-foreground">
                    {nodeSpacing}px ({nodeSpacing <= 35 ? "Small" : nodeSpacing >= 95 ? "Large" : "Medium"})
                  </span>
                </div>

                <div className="py-1">
                  <Slider.Root
                    className="relative flex h-4 w-full touch-none select-none items-center cursor-pointer"
                    min={20}
                    max={150}
                    step={5}
                    value={[nodeSpacing]}
                    onValueChange={([val]: number[]) => onSpacingChange?.(val)}
                  >
                    <Slider.Track className="relative h-2 w-full grow rounded-full bg-secondary">
                      <Slider.Range className="absolute h-full rounded-full bg-primary" />
                    </Slider.Track>
                    <Slider.Thumb className="block size-4 rounded-full border border-primary/50 bg-background shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer" />
                  </Slider.Root>
                </div>

                <div className="flex items-center justify-between text-[10px] text-muted-foreground font-medium px-0.5">
                  <span>Small</span>
                  <span>Medium</span>
                  <span>Large</span>
                </div>

                <div className="grid grid-cols-3 gap-1 pt-1.5 border-t border-border/60">
                  <Button
                    variant="outline"
                    size="sm"
                    type="button"
                    onClick={() => onSpacingChange?.(30)}
                    className={cn(
                      "h-6 px-1 text-[10px] cursor-pointer",
                      nodeSpacing <= 40 && "bg-primary! text-primary-foreground! hover:bg-primary/90!"
                    )}
                  >
                    Small
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    type="button"
                    onClick={() => onSpacingChange?.(60)}
                    className={cn(
                      "h-6 px-1 text-[10px] cursor-pointer",
                      nodeSpacing > 40 && nodeSpacing < 85 && "bg-primary! text-primary-foreground! hover:bg-primary/90!"
                    )}
                  >
                    Medium
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    type="button"
                    onClick={() => onSpacingChange?.(100)}
                    className={cn(
                      "h-6 px-1 text-[10px] cursor-pointer",
                      nodeSpacing >= 85 && "bg-primary! text-primary-foreground! hover:bg-primary/90!"
                    )}
                  >
                    Large
                  </Button>
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Full Screen Toggle */}
          {/* <Tooltip>
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
            <TooltipContent side="left" sideOffset={8} className="text-xs font-semibold py-1 px-2">
              {isFullscreen ? "Exit Full Screen" : "Full Screen"}
            </TooltipContent>
          </Tooltip> */}



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
            <TooltipContent side="left" sideOffset={8} className="text-xs font-semibold py-1 px-2 text-destructive">
              Clear Canvas
            </TooltipContent>
          </Tooltip>
        </div>
      </aside>

      {/* Floating Minimized Shape Library Palette */}
      <ShapesPalette
        open={paletteOpen}
        onClose={handleClosePalette}
        portal={true}
        isDragging={isDragging}
        onAddNode={(type, label) => {
          onAddNode(type, label);
          handleClosePalette();
        }}
      />
    </TooltipProvider>
  );
}
