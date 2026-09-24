"use client";

import React, { useEffect, useRef } from "react";
import {
  ARROW_TYPES,
  ROUTING_TYPES,
  ArrowPreviewIcon,
} from "./arrowTypes";
import type { ChenEdge, FlowEdgeArrowType, FlowEdgeRoutingType } from "./types";
import { useFlowStore } from "@/store/useFlowStore";
import { Check, Trash2, Spline, CornerDownRight, Minus } from "lucide-react";
import { cn } from "cn";

interface EdgeContextMenuProps {
  edge: ChenEdge;
  position: { x: number; y: number };
  onClose: () => void;
}

export function EdgeContextMenu({
  edge,
  position,
  onClose,
}: EdgeContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const updateEdgeArrowType = useFlowStore((s) => s.updateEdgeArrowType);
  const deleteEdge = useFlowStore((s) => s.deleteEdge);

  const currentArrowType: FlowEdgeArrowType =
    edge.data?.arrowType || (edge.data?.isTotal ? "thick" : "directed");
  const currentRoutingType: FlowEdgeRoutingType =
    edge.data?.routingType || "bezier";

  // Close on outside click or escape key
  useEffect(() => {
    const handlePointerDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  const handleSelectArrowType = (type: FlowEdgeArrowType) => {
    updateEdgeArrowType(edge.id, type);
    onClose();
  };

  const handleSelectRouting = (routing: FlowEdgeRoutingType) => {
    updateEdgeArrowType(edge.id, currentArrowType, routing);
    onClose();
  };

  const handleDelete = () => {
    deleteEdge(edge.id);
    onClose();
  };

  // Adjust menu position so it doesn't go off-screen
  const menuWidth = 210;
  const menuHeight = 310;
  const safeX =
    typeof window !== "undefined"
      ? Math.min(position.x, window.innerWidth - menuWidth - 10)
      : position.x;
  const safeY =
    typeof window !== "undefined"
      ? Math.min(position.y, window.innerHeight - menuHeight - 10)
      : position.y;

  return (
    <div
      ref={menuRef}
      style={{ left: `${safeX}px`, top: `${safeY}px` }}
      className={cn(
        "fixed z-50 w-52 rounded-xl border border-border bg-popover/95 p-1 text-popover-foreground shadow-xl backdrop-blur-md",
        "animate-in fade-in-0 zoom-in-95 select-none"
      )}
      onClick={(e) => e.stopPropagation()}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      {/* Header */}
      <div className="px-2 py-1 text-[10.5px] font-semibold text-muted-foreground uppercase tracking-wider">
        Arrow Style
      </div>

      {/* Arrow Types List */}
      <div className="flex flex-col gap-0.5">
        {ARROW_TYPES.map((opt) => {
          const isSelected = currentArrowType === opt.type;
          return (
            <button
              key={opt.type}
              type="button"
              onClick={() => handleSelectArrowType(opt.type)}
              className={cn(
                "flex items-center justify-between w-full rounded-md px-2 py-1.5 text-xs transition-colors cursor-pointer text-left outline-none",
                isSelected
                  ? "bg-primary/10 text-primary font-medium"
                  : "hover:bg-accent hover:text-accent-foreground text-foreground"
              )}
            >
              <div className="flex items-center gap-2.5">
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

      {/* Path Routing Styles */}
      <div className="px-2 py-1 text-[10.5px] font-semibold text-muted-foreground uppercase tracking-wider">
        Path Routing
      </div>
      <div className="grid grid-cols-3 gap-1 px-1">
        {ROUTING_TYPES.map((r) => {
          const isSelected = currentRoutingType === r.type;
          return (
            <button
              key={r.type}
              type="button"
              onClick={() => handleSelectRouting(r.type)}
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

      <div className="my-1 h-px bg-border/60" />

      {/* Delete Edge Option */}
      <button
        type="button"
        onClick={handleDelete}
        className="flex items-center gap-2 w-full rounded-md px-2 py-1.5 text-xs text-destructive hover:bg-destructive/10 cursor-pointer text-left transition-colors outline-none"
      >
        <Trash2 className="size-3.5" />
        <span>Delete Arrow</span>
      </button>
    </div>
  );
}
