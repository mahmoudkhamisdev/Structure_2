"use client";

import React, { memo } from "react";
import type { NodeProps } from "@xyflow/react";
import type { ChenNode, FlowchartNodeType } from "../types";
import { ChenNodeHandles } from "../handles";
import { InlineNodeText } from "../InlineNodeText";
import { NodeContextMenu } from "../NodeContextMenu";
import { flowchartShapes } from "../flowchartShapes";
import { ChenNodeResizer } from "../ChenNodeResizer";
import { cn } from "cn";

export const FlowchartShapeNode = memo(function FlowchartShapeNode({
  id,
  data,
  selected,
  isConnectable,
  type,
}: NodeProps<ChenNode>) {
  const meta = flowchartShapes[type as FlowchartNodeType];

  if (!meta) {
    return (
      <div className="border border-red-500 p-2 bg-red-50 text-xs">
        Unknown shape: {type}
      </div>
    );
  }

  const { width, height } = meta;

  return (
    <>
      <ChenNodeResizer
        isVisible={selected}
        minWidth={15}
        minHeight={15}
      />
      <NodeContextMenu id={id} currentType={type}>
        <div
          className={cn(
            "group relative flex w-full h-full min-w-0 min-h-0 items-center justify-center transition-all duration-150 select-none px-2 py-1",
            selected && "drop-shadow-md"
          )}
        >
          <ChenNodeHandles isConnectable={isConnectable} nodeId={id} />

          {/* SVG Shape Graphic */}
          <div className="absolute inset-0 w-full h-full pointer-events-none text-foreground/85">
            {meta.renderSvg({
              className: "w-full h-full drop-shadow-2xs",
              selected,
              fillColor: "currentColor",
            })}
          </div>

          {/* Inner Centered Label */}
          <div className="relative z-10 min-w-0 max-w-full px-2 py-0.5 text-center font-medium text-xs text-foreground tracking-tight pointer-events-auto leading-tight truncate">
            <InlineNodeText id={id} label={(data?.label as string) || meta.defaultLabel} />
          </div>
        </div>
      </NodeContextMenu>
    </>
  );
});
