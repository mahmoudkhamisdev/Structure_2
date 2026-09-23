"use client";

import React from "react";
import { useDraggable } from "@dnd-kit/react";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { cn } from "cn";
import type { ChenNodeType } from "./types";

interface DraggableShapeItemProps {
  type: ChenNodeType;
  name: string;
  description: string;
  icon: React.ReactNode;
  onAddNode: (type: ChenNodeType, label?: string) => void;
  onDragStart?: () => void;
  variant?: "toolbar" | "card";
}

export function DraggableShapeItem({
  type,
  name,
  description,
  icon,
  onAddNode,
  variant = "card",
}: DraggableShapeItemProps) {
  const { ref, isDragging } = useDraggable({
    id: `shape-${variant}-${type}`,
    data: { type, label: name },
  });

  if (variant === "toolbar") {
    return (
      <Tooltip>
        <TooltipTrigger
          render={
            <button
              ref={ref as unknown as React.Ref<HTMLButtonElement>}
              type="button"
              onClick={() => onAddNode(type, name)}
              className={cn(
                "size-7.5 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent/80 transition-all cursor-grab active:cursor-grabbing active:scale-95 outline-none select-none",
              )}
              title={name}
            >
              <span className="pointer-events-none flex items-center justify-center">
                {icon}
              </span>
            </button>
          }
        />
        <TooltipContent side="left" sideOffset={8} className="text-xs font-semibold py-1 px-2">
          {name}
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <button
            ref={ref as unknown as React.Ref<HTMLButtonElement>}
            type="button"
            onClick={() => onAddNode(type, name)}
            className={cn(
              "group relative flex flex-col items-center justify-center p-2 rounded-lg border border-border/60 bg-card hover:bg-accent/50 hover:border-border transition-all cursor-grab active:cursor-grabbing text-center select-none active:scale-[0.98] outline-none"
            )}
          >
            <div className="h-9 w-full flex items-center justify-center text-foreground/85 transition-transform group-hover:scale-105 pointer-events-none">
              {icon}
            </div>
            <span className="text-[11px] font-medium text-foreground truncate w-full mt-1 pointer-events-none">
              {name}
            </span>
          </button>
        }
      />
      <TooltipContent side="bottom" sideOffset={6} className="text-xs font-normal py-1 px-2.5 max-w-55 text-center leading-snug">
        {description}
      </TooltipContent>
    </Tooltip>
  );
}
