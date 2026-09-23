"use client";

import React, { memo } from "react";
import type { NodeProps } from "@xyflow/react";
import type { ChenNode } from "../types";
import { ChenNodeHandles } from "../handles";
import { InlineNodeText } from "../InlineNodeText";
import { NodeContextMenu } from "../NodeContextMenu";
import { ChenNodeResizer } from "../ChenNodeResizer";
import { cn } from "cn";

export const EntityNode = memo(function EntityNode({
  id,
  data,
  selected,
  isConnectable,
}: NodeProps<ChenNode>) {
  return (
    <>
      <ChenNodeResizer isVisible={selected} minWidth={15} minHeight={15} />
      <NodeContextMenu id={id} currentType="entity">
        <div
          className={cn(
            "group relative w-full h-full min-w-0 min-h-0 p-0 rounded-xs",
            "border bg-white dark:bg-card text-card-foreground shadow-xs",
            "flex items-center justify-center text-center",
            "font-semibold text-xs tracking-tight transition-colors duration-100",
            selected
              ? "border-primary ring-2 ring-primary/20 shadow-sm"
              : "border-border hover:border-foreground/30 hover:shadow-sm"
          )}
        >
          <ChenNodeHandles isConnectable={isConnectable} nodeId={id} />
          <div className="min-w-0 max-w-full px-0.5 whitespace-nowrap leading-none flex items-center justify-center">
            <InlineNodeText id={id} label={data.label as string} />
          </div>
        </div>
      </NodeContextMenu>
    </>
  );
});
