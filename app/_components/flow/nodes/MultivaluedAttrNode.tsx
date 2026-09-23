"use client";

import React, { memo } from "react";
import type { NodeProps } from "@xyflow/react";
import type { ChenNode } from "../types";
import { ChenNodeHandles } from "../handles";
import { InlineNodeText } from "../InlineNodeText";
import { NodeContextMenu } from "../NodeContextMenu";
import { ChenNodeResizer } from "../ChenNodeResizer";
import { cn } from "cn";

export const MultivaluedAttrNode = memo(function MultivaluedAttrNode({
  id,
  data,
  selected,
  isConnectable,
}: NodeProps<ChenNode>) {
  return (
    <>
      <ChenNodeResizer isVisible={selected} minWidth={10} minHeight={10} />
      <NodeContextMenu id={id} currentType="multivaluedAttribute">
        <div
          className={cn(
            "group relative w-full h-full min-w-0 min-h-0 p-[1px] rounded-full",
            "border bg-white dark:bg-card shadow-2xs transition-colors duration-100",
            selected
              ? "border-primary ring-2 ring-primary/20 shadow-xs"
              : "border-border hover:border-foreground/30 hover:shadow-2xs"
          )}
        >
          <ChenNodeHandles isConnectable={isConnectable} nodeId={id} />
          <div className="w-full h-full min-w-0 max-w-full p-0 rounded-full border border-border/80 bg-white dark:bg-card text-card-foreground flex items-center justify-center text-center text-xs whitespace-nowrap leading-none">
            <InlineNodeText id={id} label={data.label as string} />
          </div>
        </div>
      </NodeContextMenu>
    </>
  );
});
