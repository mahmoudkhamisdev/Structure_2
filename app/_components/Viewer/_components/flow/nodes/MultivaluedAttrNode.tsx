"use client";

import React, { memo } from "react";
import type { NodeProps } from "@xyflow/react";
import type { ChenNode } from "../types";
import { ChenNodeHandles } from "../handles";
import { InlineNodeText } from "../InlineNodeText";
import { NodeContextMenu } from "../NodeContextMenu";
import { cn } from "cn";

export const MultivaluedAttrNode = memo(function MultivaluedAttrNode({
  id,
  data,
  selected,
  isConnectable,
}: NodeProps<ChenNode>) {
  return (
    <NodeContextMenu id={id} currentType="multivaluedAttribute">
      <div
        className={cn(
          "group relative w-fit p-[2.5px] rounded-full",
          "border bg-card shadow-2xs transition-colors duration-100",
          selected
            ? "border-primary ring-2 ring-primary/20 shadow-xs"
            : "border-border hover:border-foreground/30 hover:shadow-2xs"
        )}
      >
        <ChenNodeHandles isConnectable={isConnectable} />
        <div className="w-fit px-2.5 py-0.5 rounded-full border border-border/80 bg-muted/20 text-card-foreground flex items-center justify-center text-center text-xs whitespace-nowrap">
          <InlineNodeText id={id} label={data.label as string} />
        </div>
      </div>
    </NodeContextMenu>
  );
});
