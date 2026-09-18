"use client";

import React, { memo } from "react";
import type { NodeProps } from "@xyflow/react";
import type { ChenNode } from "../types";
import { ChenNodeHandles } from "../handles";
import { InlineNodeText } from "../InlineNodeText";
import { NodeContextMenu } from "../NodeContextMenu";
import { cn } from "cn";

export const RelationshipNode = memo(function RelationshipNode({
  id,
  data,
  selected,
  isConnectable,
}: NodeProps<ChenNode>) {
  return (
    <NodeContextMenu id={id} currentType="relationship">
      <div
        className={cn(
          "group relative inline-flex items-center justify-center w-fit px-6 py-2.5 transition-colors duration-100 whitespace-nowrap",
          selected && "filter drop-shadow-sm"
        )}
      >
        <ChenNodeHandles isConnectable={isConnectable} />

        {/* Responsive Diamond Background */}
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
        >
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
        </svg>

        <div className="relative z-10 text-[12px] font-medium tracking-tight text-card-foreground">
          <InlineNodeText id={id} label={data.label as string} />
        </div>
      </div>
    </NodeContextMenu>
  );
});
