"use client";

import React, { memo } from "react";
import type { NodeProps } from "@xyflow/react";
import type { ChenNode } from "../types";
import { ChenNodeHandles } from "../handles";
import { InlineNodeText } from "../InlineNodeText";
import { NodeContextMenu } from "../NodeContextMenu";
import { ChenNodeResizer } from "../ChenNodeResizer";
import { cn } from "cn";

export const IdentifyingRelNode = memo(function IdentifyingRelNode({
  id,
  data,
  selected,
  isConnectable,
}: NodeProps<ChenNode>) {
  return (
    <>
      <ChenNodeResizer isVisible={selected} minWidth={10} minHeight={10} />
      <NodeContextMenu id={id} currentType="identifyingRelationship">
        <div
          className={cn(
            "group relative inline-flex items-center justify-center w-full h-full min-w-0 min-h-0 px-2 py-1 transition-colors duration-100",
            selected && "filter drop-shadow-sm"
          )}
        >
          <ChenNodeHandles isConnectable={isConnectable} nodeId={id} />

          {/* Responsive Double Diamond Background */}
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
          >
            {/* Outer Diamond */}
            <polygon
              points="50,2 98,50 50,98 2,50"
              style={{
                fill: selected
                  ? "color-mix(in oklch, var(--primary) 12%, var(--card))"
                  : "var(--card)",
                stroke: selected ? "var(--primary)" : "var(--border)",
                strokeWidth: selected ? 2 : 1.5,
              }}
              className="transition-colors"
              vectorEffect="non-scaling-stroke"
            />
            {/* Inner Diamond */}
            <polygon
              points="50,8 92,50 50,92 8,50"
              style={{
                fill: "transparent",
                stroke: selected ? "var(--primary)" : "var(--border)",
                strokeWidth: 1.2,
              }}
              className="transition-colors"
              vectorEffect="non-scaling-stroke"
            />
          </svg>

          <div className="relative z-10 min-w-0 max-w-full px-2 text-[11.5px] font-medium tracking-tight text-card-foreground truncate">
            <InlineNodeText id={id} label={data.label as string} />
          </div>
        </div>
      </NodeContextMenu>
    </>
  );
});
