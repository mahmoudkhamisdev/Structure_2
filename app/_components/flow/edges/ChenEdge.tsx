"use client";

import React from "react";
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  type EdgeProps,
  useReactFlow,
} from "@xyflow/react";
import type { ChenEdge } from "../types";
import { cn } from "cn";

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
  const { setEdges } = useReactFlow();

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const handleCycleLabel = (e: React.MouseEvent) => {
    e.stopPropagation();
    const current = data?.label || "";
    let next = "1";
    if (current === "1") next = "N";
    else if (current === "N") next = "M";
    else if (current === "M") next = "";
    else next = "1";

    setEdges((edges) =>
      edges.map((edge) => {
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
      })
    );
  };

  const isTotal = data?.isTotal;

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          strokeWidth: isTotal ? 3 : 1.5,
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
