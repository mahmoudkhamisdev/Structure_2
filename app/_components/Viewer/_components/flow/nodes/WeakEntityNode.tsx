"use client";

import React, { memo } from "react";
import type { NodeProps } from "@xyflow/react";
import type { ChenNode } from "../types";
import { ChenNodeHandles } from "../handles";
import { InlineNodeText } from "../InlineNodeText";
import { NodeContextMenu } from "../NodeContextMenu";
import { cn } from "cn";

export const WeakEntityNode = memo(function WeakEntityNode({
  id,
  data,
  selected,
  isConnectable,
}: NodeProps<ChenNode>) {
  return (
    <NodeContextMenu id={id} currentType="weakEntity">
      <div
        className={cn(
          "group relative w-fit p-[3px] rounded-md border",
          "bg-card shadow-xs transition-colors duration-100",
          selected
            ? "border-primary ring-2 ring-primary/20 shadow-sm"
            : "border-border hover:border-foreground/30 hover:shadow-sm"
        )}
      >
        <ChenNodeHandles isConnectable={isConnectable} />
        <div className="w-fit px-3 py-1.5 rounded-xs border border-border bg-card text-card-foreground font-semibold text-sm tracking-tight flex items-center justify-center whitespace-nowrap">
          <InlineNodeText id={id} label={data.label as string} />
        </div>
      </div>
    </NodeContextMenu>
  );
});
