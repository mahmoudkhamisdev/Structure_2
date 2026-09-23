"use client";

import React, { memo } from "react";
import type { NodeProps } from "@xyflow/react";
import type { ChenNode } from "../types";
import { ChenNodeHandles } from "../handles";
import { InlineNodeText } from "../InlineNodeText";
import { NodeContextMenu } from "../NodeContextMenu";
import { ChenNodeResizer } from "../ChenNodeResizer";
import { useTheme } from "next-themes";
import { cn } from "cn";

export const RelationshipNode = memo(function RelationshipNode({
  id,
  data,
  selected,
  isConnectable,
}: NodeProps<ChenNode>) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  return (
    <>
      <ChenNodeResizer isVisible={selected} minWidth={10} minHeight={10} />
      <NodeContextMenu id={id} currentType="relationship">
        <div
          className={cn(
            "group relative inline-flex items-center justify-center w-full h-full min-w-0 min-h-0 p-0 transition-colors duration-100",
            selected && "filter drop-shadow-sm"
          )}
        >
          <ChenNodeHandles isConnectable={isConnectable} nodeId={id} />

          {/* Responsive Diamond Background */}
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
          >
            <polygon
              points="50,2 98,50 50,98 2,50"
              fill={
                isDark
                  ? (selected ? "#27272a" : "#18181b")
                  : (selected ? "#eff6ff" : "#ffffff")
              }
              stroke={selected ? "var(--primary)" : "var(--border)"}
              strokeWidth={selected ? 2 : 1.5}
              vectorEffect="non-scaling-stroke"
            />
          </svg>

          <div className="relative z-10 min-w-0 max-w-full px-0.5 text-[12px] font-medium tracking-tight text-card-foreground whitespace-nowrap leading-none flex items-center justify-center">
            <InlineNodeText id={id} label={data.label as string} />
          </div>
        </div>
      </NodeContextMenu>
    </>
  );
});
