"use client";

import React, { useState, useMemo, useEffect } from "react";
import { MoreHorizontal } from "lucide-react";
import type {
  ChenNode,
  ChenNodeType,
  FlowchartNodeType,
  FlowEdgeArrowType,
  FlowEdgeRoutingType,
} from "./types";
import { ShapesPalette } from "./ShapesPalette";

interface AirConnectPopupProps {
  sourceNode: ChenNode | null;
  sourceScreenPos: { x: number; y: number; width: number; height: number } | null;
  screenPos: { x: number; y: number };
  arrowType?: FlowEdgeArrowType;
  routingType?: FlowEdgeRoutingType;
  onSelectShape: (shapeType: FlowchartNodeType, label?: string) => void;
  onClose: () => void;
}

// 4 Quick Shapes matching NodeQuickConnectArrow (Process, Decision, Terminator, Data)
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

export function AirConnectPopup({
  sourceScreenPos,
  screenPos,
  arrowType = "directed",
  routingType = "bezier",
  onSelectShape,
  onClose,
}: AirConnectPopupProps) {
  const [showAllShapes, setShowAllShapes] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !showAllShapes) {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, showAllShapes]);

  // Compute SVG arrow connecting source to drop point in air
  const arrowPath = useMemo(() => {
    if (!sourceScreenPos) return null;

    const sourceCenter = {
      x: sourceScreenPos.x + sourceScreenPos.width / 2,
      y: sourceScreenPos.y + sourceScreenPos.height / 2,
    };

    const target = screenPos;
    const dx = target.x - sourceCenter.x;
    const dy = target.y - sourceCenter.y;

    // Pick source handle based on angle toward the air target
    let startX = sourceCenter.x;
    let startY = sourceCenter.y;
    let startDir: "left" | "right" | "top" | "bottom" = "right";

    if (Math.abs(dx) > Math.abs(dy)) {
      if (dx >= 0) {
        startX = sourceScreenPos.x + sourceScreenPos.width;
        startY = sourceCenter.y;
        startDir = "right";
      } else {
        startX = sourceScreenPos.x;
        startY = sourceCenter.y;
        startDir = "left";
      }
    } else {
      if (dy >= 0) {
        startX = sourceCenter.x;
        startY = sourceScreenPos.y + sourceScreenPos.height;
        startDir = "bottom";
      } else {
        startX = sourceCenter.x;
        startY = sourceScreenPos.y;
        startDir = "top";
      }
    }

    const endX = target.x;
    const endY = target.y;

    if (routingType === "straight") {
      return {
        d: `M ${startX} ${startY} L ${endX} ${endY}`,
        startX,
        startY,
        endX,
        endY,
      };
    }

    if (routingType === "smoothstep") {
      const midX = (startX + endX) / 2;
      return {
        d: `M ${startX} ${startY} L ${midX} ${startY} L ${midX} ${endY} L ${endX} ${endY}`,
        startX,
        startY,
        endX,
        endY,
      };
    }

    // Default bezier curve
    const distance = Math.hypot(endX - startX, endY - startY);
    const curvature = Math.min(Math.max(distance * 0.45, 40), 160);

    let cp1X = startX;
    let cp1Y = startY;
    if (startDir === "right") cp1X += curvature;
    else if (startDir === "left") cp1X -= curvature;
    else if (startDir === "bottom") cp1Y += curvature;
    else if (startDir === "top") cp1Y -= curvature;

    const cp2X = endX - (dx > 0 ? curvature * 0.5 : -curvature * 0.5);
    const cp2Y = endY;

    return {
      d: `M ${startX} ${startY} C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${endX} ${endY}`,
      startX,
      startY,
      endX,
      endY,
    };
  }, [sourceScreenPos, screenPos, routingType]);

  // Position popup toolbar at drop position
  const popupPos = useMemo(() => {
    const cardWidth = 190;
    const cardHeight = 44;
    const padding = 12;

    let left = screenPos.x - cardWidth / 2;
    if (left + cardWidth > window.innerWidth - padding) {
      left = window.innerWidth - cardWidth - padding;
    }
    if (left < padding) left = padding;

    let top = screenPos.y - cardHeight / 2;
    if (top + cardHeight > window.innerHeight - padding) {
      top = window.innerHeight - cardHeight - padding;
    }
    if (top < padding) top = padding;

    return { left, top };
  }, [screenPos]);

  const hasMarker = arrowType !== "line" && arrowType !== "dashedLine";
  const isDashed = arrowType === "dashed" || arrowType === "dashedLine";
  const strokeWidth = arrowType === "thick" ? 3.2 : 2;

  return (
    <>
      {/* Transparent backdrop to catch clicks outside - only when not in full shapes palette */}
      {!showAllShapes && (
        <div
          className="fixed inset-0 z-[9990] bg-transparent cursor-default"
          onClick={onClose}
          onContextMenu={(e) => {
            e.preventDefault();
            onClose();
          }}
        />
      )}

      {/* SVG Arrow suspended in the air */}
      {arrowPath && (
        <svg
          className="fixed inset-0 z-[9995] pointer-events-none w-screen h-screen overflow-visible"
          style={{ width: "100vw", height: "100vh" }}
        >
          <defs>
            <marker
              id="air-arrowhead"
              markerWidth="10"
              markerHeight="10"
              refX="8"
              refY="5"
              orient="auto"
              markerUnits="strokeWidth"
            >
              <path
                d="M 1 2 L 8 5 L 1 8 Z"
                fill="var(--primary)"
                className="fill-primary"
              />
            </marker>
          </defs>

          {/* Glowing background path */}
          <path
            d={arrowPath.d}
            fill="none"
            stroke="var(--primary)"
            strokeWidth={strokeWidth + 2.5}
            strokeOpacity="0.25"
            strokeLinecap="round"
          />

          {/* Main Air Arrow line */}
          <path
            d={arrowPath.d}
            fill="none"
            stroke="var(--primary)"
            strokeWidth={strokeWidth}
            strokeDasharray={isDashed ? "6 4" : undefined}
            markerEnd={hasMarker ? "url(#air-arrowhead)" : undefined}
            className="stroke-primary transition-all duration-75"
          />

          {/* Origin pulse circle */}
          <circle
            cx={arrowPath.startX}
            cy={arrowPath.startY}
            r="4.5"
            fill="var(--primary)"
            className="fill-primary animate-pulse"
          />

          {/* Target pulse circle */}
          <circle
            cx={arrowPath.endX}
            cy={arrowPath.endY}
            r="4"
            fill="var(--primary)"
            className="fill-primary"
          />
        </svg>
      )}

      {/* Floating Quick Connect Toolbar (matching NodeQuickConnectArrow) */}
      {!showAllShapes && (
        <div
          className="fixed z-[9999] pointer-events-auto flex items-center gap-1 p-1 px-1.5 shadow-xl rounded-xl border border-border bg-card/95 backdrop-blur-md animate-in fade-in-0 zoom-in-95 duration-150"
          style={{ left: `${popupPos.left}px`, top: `${popupPos.top}px` }}
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
        >
          {TOOLBAR_QUICK_SHAPES.map((shape) => (
            <button
              key={shape.type}
              type="button"
              onClick={() => onSelectShape(shape.type)}
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
              setShowAllShapes(true);
            }}
            title="All Shapes Library..."
            className="size-7.5 rounded-lg flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-accent/80 transition-all active:scale-95 cursor-pointer outline-hidden select-none shrink-0"
          >
            <MoreHorizontal className="size-4" />
          </button>
        </div>
      )}

      {/* Uses the exact ShapesPalette component from toolbar */}
      {showAllShapes && (
        <ShapesPalette
          open={showAllShapes}
          onClose={() => {
            setShowAllShapes(false);
            onClose();
          }}
          portal={true}
          onAddNode={(type: ChenNodeType, label?: string) => {
            onSelectShape(type as FlowchartNodeType, label);
            setShowAllShapes(false);
          }}
        />
      )}
    </>
  );
}
