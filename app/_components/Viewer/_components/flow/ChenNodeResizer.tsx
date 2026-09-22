"use client";

import React from "react";
import {
  NodeResizeControl,
  ResizeControlVariant,
  type ControlPosition,
} from "@xyflow/react";

const LINE_POSITIONS: ControlPosition[] = ["top", "right", "bottom", "left"];
const HANDLE_POSITIONS: ControlPosition[] = [
  "top-left",
  "top",
  "top-right",
  "right",
  "bottom-right",
  "bottom",
  "bottom-left",
  "left",
];

interface ChenNodeResizerProps {
  isVisible?: boolean;
  minWidth?: number;
  minHeight?: number;
  keepAspectRatio?: boolean;
}

export function ChenNodeResizer({
  isVisible,
  minWidth = 10,
  minHeight = 10,
  keepAspectRatio = false,
}: ChenNodeResizerProps) {
  if (!isVisible) return null;

  return (
    <>
      {LINE_POSITIONS.map((pos) => (
        <NodeResizeControl
          key={`line-${pos}`}
          position={pos}
          variant={ResizeControlVariant.Line}
          minWidth={minWidth}
          minHeight={minHeight}
          keepAspectRatio={keepAspectRatio}
          className="!border-dashed !border-primary"
          color="hsl(var(--primary))"
        />
      ))}
      {HANDLE_POSITIONS.map((pos) => (
        <NodeResizeControl
          key={`handle-${pos}`}
          position={pos}
          variant={ResizeControlVariant.Handle}
          minWidth={minWidth}
          minHeight={minHeight}
          keepAspectRatio={keepAspectRatio}
          className="!size-2.5 !rounded-full !bg-primary !border-2 !border-background !shadow-xs"
          color="hsl(var(--primary))"
        />
      ))}
    </>
  );
}
