"use client";

import React, { memo } from "react";
import type { NodeProps } from "@xyflow/react";
import type { ChenNode } from "../types";
import { ChenNodeHandles } from "../handles";
import { InlineNodeText } from "../InlineNodeText";
import { NodeContextMenu } from "../NodeContextMenu";
import { cn } from "cn";

export const EntityNode = memo(function EntityNode({
  id,
  data,
  selected,
  isConnectable,
}: NodeProps<ChenNode>) {
  return (
    <NodeContextMenu id={id} currentType="entity">
      <div
        className={cn(
          "group relative w-fit px-3.5 py-1.5 rounded-md",
          "border bg-card text-card-foreground shadow-xs",
          "flex items-center justify-center text-center whitespace-nowrap",
          "font-semibold text-sm tracking-tight transition-colors duration-100",
          selected
            ? "border-primary ring-2 ring-primary/20 shadow-sm"
            : "border-border hover:border-foreground/30 hover:shadow-sm"
        )}
      >
        <ChenNodeHandles isConnectable={isConnectable} />
        <InlineNodeText id={id} label={data.label as string} />
      </div>
    </NodeContextMenu>
  );
});
