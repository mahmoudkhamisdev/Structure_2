"use client";

import React, { memo } from "react";
import type { NodeProps } from "@xyflow/react";
import type { ChenNode } from "../types";
import { ChenNodeHandles } from "../handles";
import { InlineNodeText } from "../InlineNodeText";
import { NodeContextMenu } from "../NodeContextMenu";
import { cn } from "cn";

export const AttributeNode = memo(function AttributeNode({
  id,
  data,
  selected,
  isConnectable,
}: NodeProps<ChenNode>) {
  return (
    <NodeContextMenu id={id} currentType="attribute">
      <div
        className={cn(
          "group relative w-fit px-3 py-1 rounded-full",
          "border bg-card text-card-foreground shadow-2xs",
          "flex items-center justify-center text-center whitespace-nowrap",
          "text-xs font-normal transition-colors duration-100",
          selected
            ? "border-primary ring-2 ring-primary/20 shadow-xs"
            : "border-border hover:border-foreground/30 hover:shadow-2xs"
        )}
      >
        <ChenNodeHandles isConnectable={isConnectable} />
        <InlineNodeText id={id} label={data.label as string} />
      </div>
    </NodeContextMenu>
  );
});
