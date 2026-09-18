"use client";

import React, { memo } from "react";
import type { NodeProps } from "@xyflow/react";
import type { ChenNode } from "../types";
import { ChenNodeHandles } from "../handles";
import { InlineNodeText } from "../InlineNodeText";
import { NodeContextMenu } from "../NodeContextMenu";
import { cn } from "cn";

export const TextNode = memo(function TextNode({
  id,
  data,
  selected,
  isConnectable,
}: NodeProps<ChenNode>) {
  return (
    <NodeContextMenu id={id} currentType="text">
      <div
        className={cn(
          "group relative w-fit px-1.5 py-0.5 rounded transition-colors duration-100",
          "text-xs text-foreground select-none",
          selected
            ? "border border-dashed border-primary ring-1 ring-primary/20 shadow-2xs"
            : "border border-transparent hover:border-border/50"
        )}
      >
        <ChenNodeHandles isConnectable={isConnectable} />
        <InlineNodeText id={id} label={data.label as string} className="text-left" />
      </div>
    </NodeContextMenu>
  );
});
