"use client";

import React from "react";
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
  Type,
  MousePointer,
  Hand,
  Download,
  Image as ImageIcon,
  FileCode,
  FileText,
} from "lucide-react";
import type { ChenNodeType } from "./types";
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
}

interface ShapeToolItem {
  type: ChenNodeType;
  name: string;
  description: string;
  icon: React.ReactNode;
}

const shapeTools: ShapeToolItem[] = [
  {
    type: "entity",
    name: "Entity",
    description: "Rectangle - standard entity",
    icon: (
      <svg className="size-4.5" viewBox="0 0 20 16" fill="none">
        <rect
          x="2"
          y="2.5"
          width="16"
          height="11"
          rx="2"
          stroke="currentColor"
          strokeWidth="1.6"
        />
      </svg>
    ),
  },
  {
    type: "weakEntity",
    name: "Weak Entity",
    description: "Double rectangle - dependent entity",
    icon: (
      <svg className="size-4.5" viewBox="0 0 20 16" fill="none">
        <rect
          x="1.5"
          y="1.5"
          width="17"
          height="13"
          rx="2"
          stroke="currentColor"
          strokeWidth="1.3"
        />
        <rect
          x="4"
          y="4"
          width="12"
          height="8"
          rx="1"
          stroke="currentColor"
          strokeWidth="1.3"
        />
      </svg>
    ),
  },
  {
    type: "relationship",
    name: "Relationship",
    description: "Diamond - association",
    icon: (
      <svg className="size-4.5" viewBox="0 0 20 20" fill="none">
        <polygon
          points="10,2 18,10 10,18 2,10"
          stroke="currentColor"
          strokeWidth="1.6"
        />
      </svg>
    ),
  },
  {
    type: "identifyingRelationship",
    name: "Identifying Relationship",
    description: "Double diamond - identifies weak entity",
    icon: (
      <svg className="size-4.5" viewBox="0 0 20 20" fill="none">
        <polygon
          points="10,2 18,10 10,18 2,10"
          stroke="currentColor"
          strokeWidth="1.3"
        />
        <polygon
          points="10,5.5 14.5,10 10,14.5 5.5,10"
          stroke="currentColor"
          strokeWidth="1.3"
        />
      </svg>
    ),
  },
  {
    type: "attribute",
    name: "Attribute",
    description: "Oval - regular property",
    icon: (
      <svg className="size-4.5" viewBox="0 0 20 14" fill="none">
        <ellipse
          cx="10"
          cy="7"
          rx="8.5"
          ry="5.5"
          stroke="currentColor"
          strokeWidth="1.6"
        />
      </svg>
    ),
  },
  {
    type: "keyAttribute",
    name: "Primary Key",
    description: "Underlined oval - unique identifier",
    icon: (
      <svg className="size-4.5" viewBox="0 0 20 16" fill="none">
        <ellipse
          cx="10"
          cy="8"
          rx="8.5"
          ry="5.5"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <line
          x1="5.5"
          y1="9.5"
          x2="14.5"
          y2="9.5"
          stroke="currentColor"
          strokeWidth="1.6"
        />
      </svg>
    ),
  },
  {
    type: "multivaluedAttribute",
    name: "Multivalued Attribute",
    description: "Double oval - multiple values",
    icon: (
      <svg className="size-4.5" viewBox="0 0 20 16" fill="none">
        <ellipse
          cx="10"
          cy="8"
          rx="8.5"
          ry="6.5"
          stroke="currentColor"
          strokeWidth="1.2"
        />
        <ellipse
          cx="10"
          cy="8"
          rx="6"
          ry="4"
          stroke="currentColor"
          strokeWidth="1.2"
        />
      </svg>
    ),
  },
  {
    type: "text",
    name: "Text Note",
    description: "Freeform text and annotation",
    icon: <Type className="size-4" />,
  },
];

export function ChenToolbar({
  mode,
  onModeChange,
  onAddNode,
  onClear,
  isFullscreen,
  onToggleFullscreen,
  onExport,
}: ChenToolbarProps) {
  return (
    <TooltipProvider delay={150}>
      <aside
        aria-label="ERD Shapes Toolbar"
        className="absolute top-3.5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 px-2 py-1.5 rounded-xl border border-border bg-card/90 backdrop-blur-md shadow-lg animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Pointer (Select) and Hand (Pan) Modes */}
        <div className="flex items-center gap-0.5">
          {/* Mouse / Pointer Tool */}
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => onModeChange("pointer")}
                  className={cn(
                    "size-7.5 rounded-lg transition-all active:scale-95",
                    mode === "pointer"
                      ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground shadow-2xs"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/80"
                  )}
                >
                  <MousePointer className="size-3.5" />
                </Button>
              }
            />
            <TooltipContent side="bottom" sideOffset={6} className="text-xs">
              <p className="font-semibold">Select Tool</p>
              <p className="text-[10px] text-muted-foreground">Select and move elements</p>
            </TooltipContent>
          </Tooltip>

          {/* Hand / Pan Tool */}
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => onModeChange("hand")}
                  className={cn(
                    "size-7.5 rounded-lg transition-all active:scale-95",
                    mode === "hand"
                      ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground shadow-2xs"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/80"
                  )}
                >
                  <Hand className="size-3.5" />
                </Button>
              }
            />
            <TooltipContent side="bottom" sideOffset={6} className="text-xs">
              <p className="font-semibold">Pan Tool</p>
              <p className="text-[10px] text-muted-foreground">Drag to pan the canvas</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Vertical Divider */}
        <div className="h-4.5 w-px bg-border mx-0.5" />

        {/* All Chen Shapes & Text side by side */}
        <div className="flex items-center gap-0.5">
          {shapeTools.map((tool) => (
            <Tooltip key={tool.type}>
              <TooltipTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => onAddNode(tool.type)}
                    className="size-7.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/80 transition-all active:scale-95"
                  >
                    {tool.icon}
                  </Button>
                }
              />
              <TooltipContent side="bottom" sideOffset={6} className="text-xs">
                <p className="font-semibold">{tool.name}</p>
                <p className="text-[10px] text-muted-foreground">{tool.description}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>

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
                  className="size-7.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/80 transition-all active:scale-95"
                >
                  {isFullscreen ? (
                    <Minimize className="size-3.5" />
                  ) : (
                    <Maximize className="size-3.5" />
                  )}
                </Button>
              }
            />
            <TooltipContent side="bottom" sideOffset={6} className="text-xs">
              <p className="font-semibold">{isFullscreen ? "Exit Full Screen" : "Full Screen"}</p>
              <p className="text-[10px] text-muted-foreground">
                {isFullscreen ? "Exit fullscreen mode" : "Toggle full screen view"}
              </p>
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
                        className="size-7.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/80 transition-all active:scale-95"
                      >
                        <Download className="size-3.5" />
                      </Button>
                    }
                  />
                }
              />
              <TooltipContent side="bottom" sideOffset={6} className="text-xs">
                <p className="font-semibold">Export Diagram</p>
                <p className="text-[10px] text-muted-foreground">Download as PNG, SVG, or PDF</p>
              </TooltipContent>
            </Tooltip>

            <DropdownMenuContent align="center" className="w-40 text-xs">
              <DropdownMenuItem
                onClick={() => onExport("png")}
                className="gap-2 cursor-pointer"
              >
                <ImageIcon className="size-3.5 text-muted-foreground" />
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

          {/* Chen Legend */}
          <Dialog>
            <Tooltip>
              <DialogTrigger
                render={
                  <TooltipTrigger
                    render={
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        className="size-7.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/80 transition-all active:scale-95"
                      >
                        <HelpCircle className="size-3.5" />
                      </Button>
                    }
                  />
                }
              />
              <TooltipContent side="bottom" sideOffset={6} className="text-xs">
                <p className="font-semibold">Chen Legend</p>
                <p className="text-[10px] text-muted-foreground">View Chen notation reference</p>
              </TooltipContent>
            </Tooltip>

            <DialogContent className="max-w-md sm:max-w-lg">
              <DialogHeader>
                <DialogTitle className="text-base font-semibold">
                  Chen Notation ERD Reference
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Core components of Conceptual Entity-Relationship Diagrams in Chen Notation:
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-1 gap-2 py-2 text-xs">
                <div className="flex items-center justify-between p-2 rounded-lg border border-border bg-card">
                  <div className="flex items-center gap-2">
                    <div className="w-14 h-6 rounded border border-border bg-muted/40 flex items-center justify-center text-[10px] font-semibold">
                      Entity
                    </div>
                    <span className="font-medium">Rectangle: Entity</span>
                  </div>
                  <span className="text-muted-foreground text-[11px]">Independent real-world entity</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg border border-border bg-card">
                  <div className="flex items-center gap-2">
                    <div className="w-14 h-6 rounded border-2 border-border bg-muted/40 flex items-center justify-center text-[10px] font-semibold">
                      Weak
                    </div>
                    <span className="font-medium">Double Rectangle: Weak Entity</span>
                  </div>
                  <span className="text-muted-foreground text-[11px]">Entity dependent on an owner</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg border border-border bg-card">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rotate-45 border border-border bg-muted/40 mx-4" />
                    <span className="font-medium">Diamond: Relationship</span>
                  </div>
                  <span className="text-muted-foreground text-[11px]">Relationship connecting entities</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg border border-border bg-card">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rotate-45 border-2 border-border bg-muted/40 mx-4" />
                    <span className="font-medium">Double Diamond: Identifying Rel</span>
                  </div>
                  <span className="text-muted-foreground text-[11px]">Identifies a weak entity</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg border border-border bg-card">
                  <div className="flex items-center gap-2">
                    <div className="px-3 py-0.5 rounded-full border border-border bg-muted/40 text-[10px]">
                      Attribute
                    </div>
                    <span className="font-medium">Oval: Attribute</span>
                  </div>
                  <span className="text-muted-foreground text-[11px]">Entity or relationship property</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg border border-border bg-card">
                  <div className="flex items-center gap-2">
                    <div className="px-3 py-0.5 rounded-full border border-border bg-muted/40 text-[10px] underline underline-offset-2 font-semibold">
                      PK_ID
                    </div>
                    <span className="font-medium">Underlined Oval: Primary Key</span>
                  </div>
                  <span className="text-muted-foreground text-[11px]">Unique key attribute</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg border border-border bg-card">
                  <div className="flex items-center gap-2">
                    <div className="p-0.5 rounded-full border border-border bg-muted/40">
                      <div className="px-2.5 py-0.2 rounded-full border border-border/80 text-[10px]">
                        Phones
                      </div>
                    </div>
                    <span className="font-medium">Double Oval: Multivalued Attribute</span>
                  </div>
                  <span className="text-muted-foreground text-[11px]">Attribute with multiple values</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg border border-border bg-card">
                  <div className="flex items-center gap-2">
                    <div className="px-3 py-0.5 rounded border border-dashed border-border text-[10px] text-muted-foreground">
                      Text
                    </div>
                    <span className="font-medium">Text Tool: Annotation</span>
                  </div>
                  <span className="text-muted-foreground text-[11px]">Custom notes and labels</span>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Clear Diagram */}
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={onClear}
                  className="size-7.5 rounded-lg text-destructive/80 hover:text-destructive hover:bg-destructive/10 transition-all active:scale-95"
                >
                  <Trash2 className="size-3.5" />
                </Button>
              }
            />
            <TooltipContent side="bottom" sideOffset={6} className="text-xs">
              <p className="font-semibold text-destructive">Clear Canvas</p>
              <p className="text-[10px] text-muted-foreground">Delete all nodes and edges</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </aside>
    </TooltipProvider>
  );
}
