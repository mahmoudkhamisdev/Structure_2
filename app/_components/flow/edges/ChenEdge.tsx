"use client";

import React from "react";
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  getSmoothStepPath,
  getStraightPath,
  MarkerType,
  type EdgeProps,
} from "@xyflow/react";
import type { ChenEdge } from "../types";
import { cn } from "cn";
import { useFlowStore } from "@/store/useFlowStore";

export function ChenEdgeComponent({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
  selected,
}: EdgeProps<ChenEdge>) {
  const setEdges = useFlowStore((s) => s.setEdges);
  const syncToMarkdown = useFlowStore((s) => s.syncToMarkdown);

  const arrowType = data?.arrowType || (data?.isTotal ? "thick" : "directed");
  const routingType = data?.routingType || "bezier";

  let edgePath = "";
  let labelX = 0;
  let labelY = 0;

  if (routingType === "smoothstep") {
    [edgePath, labelX, labelY] = getSmoothStepPath({
      sourceX,
      sourceY,
      sourcePosition,
      targetX,
      targetY,
      targetPosition,
      borderRadius: 10,
    });
  } else if (routingType === "straight") {
    [edgePath, labelX, labelY] = getStraightPath({
      sourceX,
      sourceY,
      targetX,
      targetY,
    });
  } else {
    [edgePath, labelX, labelY] = getBezierPath({
      sourceX,
      sourceY,
      sourcePosition,
      targetX,
      targetY,
      targetPosition,
    });
  }

  const handleCycleLabel = (e: React.MouseEvent) => {
    e.stopPropagation();
    const current = data?.label || "";
    let next = "1";
    if (current === "1") next = "N";
    else if (current === "N") next = "M";
    else if (current === "M") next = "";
    else next = "1";

    setEdges((edges) => {
      const nextEdges = edges.map((edge) => {
        if (edge.id === id) {
          return {
            ...edge,
            data: {
              ...edge.data,
              label: next,
            },
          };
        }
        return edge;
      });
      syncToMarkdown(undefined, nextEdges);
      return nextEdges;
    });
  };

  // Fallback marker if markerEnd prop is missing
  const fallbackMarker = {
    type: MarkerType.ArrowClosed,
    color: selected ? "var(--primary)" : "currentColor",
    width: 15,
    height: 15,
  };
  const effectiveMarker = markerEnd || fallbackMarker;

  // Determine markers and line stroke based on arrowType
  let resolvedMarkerEnd: any = effectiveMarker;
  let resolvedMarkerStart: any = undefined;
  let strokeDasharray = style.strokeDasharray;
  let strokeWidth = data?.isTotal ? 3.2 : 1.6;

  if (arrowType === "line" || arrowType === "dashedLine") {
    resolvedMarkerEnd = undefined;
    resolvedMarkerStart = undefined;
  } else if (arrowType === "bidirectional") {
    resolvedMarkerEnd = effectiveMarker;
    resolvedMarkerStart = effectiveMarker;
  } else if (arrowType === "thick") {
    strokeWidth = 3.2;
    resolvedMarkerEnd = effectiveMarker;
    resolvedMarkerStart = undefined;
  } else {
    resolvedMarkerEnd = effectiveMarker;
    resolvedMarkerStart = undefined;
  }

  if (arrowType === "dashed" || arrowType === "dashedLine") {
    strokeDasharray = "5 4";
  }

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={resolvedMarkerEnd}
        markerStart={resolvedMarkerStart}
        style={{
          ...style,
          strokeWidth,
          strokeDasharray,
          stroke: selected ? "var(--primary)" : "var(--muted-foreground)",
        }}
        className={cn(
          "transition-colors duration-75",
          selected ? "!stroke-primary" : "hover:!stroke-foreground"
        )}
      />

      {data?.label ? (
        <EdgeLabelRenderer>
          <div
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: "all",
            }}
            onClick={handleCycleLabel}
            title="Click to cycle cardinality (1 -> N -> M)"
            className={cn(
              "px-1.5 py-0.5 rounded-sm border bg-card text-card-foreground shadow-2xs",
              "text-[10.5px] font-mono font-semibold cursor-pointer select-none",
              "transition-all hover:scale-105 active:scale-95",
              selected
                ? "border-primary ring-1 ring-primary text-primary"
                : "border-border hover:border-foreground/60"
            )}
          >
            {data.label}
          </div>
        </EdgeLabelRenderer>
      ) : null}
    </>
  );
}

export const chenEdgeTypes = {
  chen: ChenEdgeComponent,
};
