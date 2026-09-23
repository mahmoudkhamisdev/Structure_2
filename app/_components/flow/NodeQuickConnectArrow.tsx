"use client";

import React, { useState } from "react";
import { useReactFlow, useNodeId, addEdge } from "@xyflow/react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu";
import {
  ArrowUp,
  ArrowRight,
  ArrowDown,
  ArrowLeft,
  MoreHorizontal,
  Shapes,
} from "lucide-react";
import { cn } from "cn";
import type { ChenEdge, ChenNode, FlowchartNodeType, ChenNodeType } from "./types";
import { flowchartShapes } from "./flowchartShapes";
import { computeNodeDimensions } from "./flowParser";
import { ShapesPalette } from "./ShapesPalette";
import { useFlowStore } from "@/store/useFlowStore";

export type ArrowDirection = "top" | "right" | "bottom" | "left";

interface NodeQuickConnectArrowProps {
  nodeId?: string;
  direction?: ArrowDirection;
  className?: string;
}

// 4 Shapes that exist in the Toolbar (Process, Decision, Terminator, Data)
const TOOLBAR_QUICK_SHAPES: {
  type: FlowchartNodeType;
  name: string;
  icon: React.ReactNode;
}[] = [
    {
      type: "process",
      name: "Process",
      icon: (
        <svg className="size-4" viewBox="0 0 20 16" fill="none">
          <rect x="2" y="2.5" width="16" height="11" rx="2" stroke="currentColor" strokeWidth="1.6" />
        </svg>
      ),
    },
    {
      type: "decision",
      name: "Decision",
      icon: (
        <svg className="size-4" viewBox="0 0 20 20" fill="none">
          <polygon points="10,2 18,10 10,18 2,10" stroke="currentColor" strokeWidth="1.6" />
        </svg>
      ),
    },
    {
      type: "terminator",
      name: "Terminator",
      icon: (
        <svg className="size-4" viewBox="0 0 20 16" fill="none">
          <rect x="2" y="3" width="16" height="10" rx="5" stroke="currentColor" strokeWidth="1.6" />
        </svg>
      ),
    },
    {
      type: "data",
      name: "Data / I/O",
      icon: (
        <svg className="size-4" viewBox="0 0 20 16" fill="none">
          <polygon points="5,3 18,3 15,13 2,13" stroke="currentColor" strokeWidth="1.6" />
        </svg>
      ),
    },
  ];

export function NodeQuickConnectArrow({
  nodeId,
  direction = "top",
  className,
}: NodeQuickConnectArrowProps) {
  const contextNodeId = useNodeId();
  const id = nodeId || contextNodeId;
  const { getNode } = useReactFlow();
  const addConnectedNode = useFlowStore((s) => s.addConnectedNode);
  const [open, setOpen] = useState(false);
  const [showAllShapes, setShowAllShapes] = useState(false);

  if (!id) return null;

  // Create shape and link automatically in the specified direction
  const handleCreateAndLink = (shapeType: FlowchartNodeType, shapeLabel?: string) => {
    const sourceNode = getNode(id);
    if (!sourceNode) return;

    const meta = flowchartShapes[shapeType];
    const label = shapeLabel || meta?.defaultLabel || meta?.name || shapeType;
    const dims = computeNodeDimensions(shapeType, label);
    const width = dims.width;
    const height = dims.height;

    const sourcePos = sourceNode.position || { x: 0, y: 0 };
    const sourceWidth = (sourceNode.width as number) || 140;
    const sourceHeight = (sourceNode.height as number) || 52;

    let newX = sourcePos.x;
    let newY = sourcePos.y;
    let sourceHandle = "top-source";
    let targetHandle = "bottom-target";

    if (direction === "top") {
      newX = Math.round(sourcePos.x + (sourceWidth - width) / 2);
      newY = Math.round(sourcePos.y - height - 70);
      sourceHandle = "top-source";
      targetHandle = "bottom-target";
    } else if (direction === "right") {
      newX = Math.round(sourcePos.x + sourceWidth + 70);
      newY = Math.round(sourcePos.y + (sourceHeight - height) / 2);
      sourceHandle = "right-source";
      targetHandle = "left-target";
    } else if (direction === "bottom") {
      newX = Math.round(sourcePos.x + (sourceWidth - width) / 2);
      newY = Math.round(sourcePos.y + sourceHeight + 70);
      sourceHandle = "bottom-source";
      targetHandle = "top-target";
    } else if (direction === "left") {
      newX = Math.round(sourcePos.x - width - 70);
      newY = Math.round(sourcePos.y + (sourceHeight - height) / 2);
      sourceHandle = "left-source";
      targetHandle = "right-target";
    }

    const newId = `${shapeType}-${Date.now()}`;
    const newNode: ChenNode = {
      id: newId,
      type: shapeType,
      position: { x: newX, y: newY },
      width,
      height,
      style: { width, height },
      data: { label },
    };

    const newEdge: ChenEdge = {
      id: `e-${id}-${newId}-${Date.now()}`,
      source: id,
      target: newId,
      sourceHandle,
      targetHandle,
      type: "chen",
      data: {},
    };

    addConnectedNode(newNode, newEdge);
    setOpen(false);
    setShowAllShapes(false);
  };

  // Direction-specific positioning outside around the node and arrow icon
  const directionConfig = {
    top: {
      positionClass: "-top-8 left-1/2 -translate-x-1/2",
      icon: <ArrowUp className="size-4.5 stroke-[2.5]" />,
      side: "top" as const,
    },
    right: {
      positionClass: "top-1/2 -right-8 -translate-y-1/2",
      icon: <ArrowRight className="size-4.5 stroke-[2.5]" />,
      side: "right" as const,
    },
    bottom: {
      positionClass: "-bottom-8 left-1/2 -translate-x-1/2",
      icon: <ArrowDown className="size-4.5 stroke-[2.5]" />,
      side: "bottom" as const,
    },
    left: {
      positionClass: "top-1/2 -left-8 -translate-y-1/2",
      icon: <ArrowLeft className="size-4.5 stroke-[2.5]" />,
      side: "left" as const,
    },
  }[direction];

  return (
    <>
      <div
        className={cn(
          "absolute z-30 nodrag nopan",
          directionConfig.positionClass,
          open
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 group-hover:opacity-100 group-hover:pointer-events-auto pointer-events-none transition-opacity duration-150",
          className
        )}
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <DropdownMenu open={open} onOpenChange={setOpen}>
          <DropdownMenuTrigger
            className={cn(
              "size-7 hover:scale-125 active:scale-95 transition-all flex items-center justify-center cursor-pointer select-none outline-hidden text-muted-foreground hover:text-primary",
              open && "scale-110 text-primary"
            )}
            title={`Create & link shape ${direction}...`}
          >
            {directionConfig.icon}
          </DropdownMenuTrigger>

          {/* 4 Shapes Side-by-Side in Horizontal Toolbar + More Shapes Button */}
          <DropdownMenuContent
            side={directionConfig.side}
            align="center"
            sideOffset={8}
            style={{ width: "max-content", minWidth: "max-content" }}
            className="!w-auto !min-w-0 flex items-center gap-1 p-1 px-1.5 shadow-lg rounded-xl border border-border bg-card/95 backdrop-blur-md z-[100] overflow-visible"
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
          >
            {TOOLBAR_QUICK_SHAPES.map((shape) => (
              <button
                key={shape.type}
                type="button"
                onClick={() => handleCreateAndLink(shape.type)}
                title={shape.name}
                className="size-7.5 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent/80 transition-all active:scale-95 cursor-pointer outline-hidden select-none shrink-0"
              >
                <span className="pointer-events-none flex items-center justify-center">
                  {shape.icon}
                </span>
              </button>
            ))}

            <div className="h-4 w-px bg-border/80 my-auto mx-0.5 shrink-0" />

            {/* More Shapes button: opens the all shapes popup from toolbar */}
            <button
              type="button"
              data-shapes-trigger="true"
              onClick={(e) => {
                e.stopPropagation();
                setOpen(false);
                setShowAllShapes(true);
              }}
              title="All Shapes Library..."
              className="size-7.5 rounded-lg flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-accent/80 transition-all active:scale-95 cursor-pointer outline-hidden select-none shrink-0"
            >
              <MoreHorizontal className="size-4" />
            </button>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Uses the exact ShapesPalette component that exists in the toolbar */}
      {showAllShapes && (
        <ShapesPalette
          open={showAllShapes}
          onClose={() => setShowAllShapes(false)}
          portal={true}
          onAddNode={(type: ChenNodeType, label?: string) => {
            handleCreateAndLink(type as FlowchartNodeType, label);
            setShowAllShapes(false);
          }}
        />
      )}
    </>
  );
}
