"use client";

import React, { memo } from "react";
import type { NodeProps } from "@xyflow/react";
import type { ChenNode } from "../types";
import { ChenNodeHandles } from "../handles";
import { InlineNodeText } from "../InlineNodeText";
import { NodeContextMenu } from "../NodeContextMenu";
import { ChenNodeResizer } from "../ChenNodeResizer";
import { cn } from "cn";

export const KeyAttributeNode = memo(function KeyAttributeNode({
  id,
  data,
  selected,
  isConnectable,
}: NodeProps<ChenNode>) {
  return (
    <>
      <ChenNodeResizer isVisible={selected} minWidth={10} minHeight={10} />
      <NodeContextMenu id={id} currentType="keyAttribute">
        <div
          className={cn(
            "group relative w-full h-full min-w-0 min-h-0 px-2 py-0.5 rounded-full",
            "border bg-card text-card-foreground shadow-2xs",
            "flex items-center justify-center text-center",
            "text-xs transition-colors duration-100",
            selected
              ? "border-primary ring-2 ring-primary/20 shadow-xs"
              : "border-border hover:border-foreground/30 hover:shadow-2xs"
          )}
        >
          <ChenNodeHandles isConnectable={isConnectable} nodeId={id} />
          <div className="min-w-0 max-w-full truncate px-1">
            <InlineNodeText
              id={id}
              label={data.label as string}
              underlined={true}
              className="font-semibold"
            />
          </div>
        </div>
      </NodeContextMenu>
    </>
  );
});
