"use client";

import React from "react";
import { Handle, Position } from "@xyflow/react";

interface ChenNodeHandlesProps {
  isConnectable?: boolean;
}

const handleCommonClasses =
  "!w-2 !h-2 !rounded-full !bg-muted-foreground/60 hover:!bg-primary hover:!scale-125 !border !border-background transition-colors duration-100";

export function ChenNodeHandles({ isConnectable = true }: ChenNodeHandlesProps) {
  return (
    <>
      {/* Top Handles */}
      <Handle
        type="target"
        position={Position.Top}
        id="top-target"
        isConnectable={isConnectable}
        className={handleCommonClasses}
      />
      <Handle
        type="source"
        position={Position.Top}
        id="top-source"
        isConnectable={isConnectable}
        className={`${handleCommonClasses} opacity-0! hover:opacity-100!`}
      />

      {/* Right Handles */}
      <Handle
        type="target"
        position={Position.Right}
        id="right-target"
        isConnectable={isConnectable}
        className={handleCommonClasses}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right-source"
        isConnectable={isConnectable}
        className={`${handleCommonClasses} !opacity-0 hover:!opacity-100`}
      />

      {/* Bottom Handles */}
      <Handle
        type="target"
        position={Position.Bottom}
        id="bottom-target"
        isConnectable={isConnectable}
        className={handleCommonClasses}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom-source"
        isConnectable={isConnectable}
        className={`${handleCommonClasses} !opacity-0 hover:!opacity-100`}
      />

      {/* Left Handles */}
      <Handle
        type="target"
        position={Position.Left}
        id="left-target"
        isConnectable={isConnectable}
        className={handleCommonClasses}
      />
      <Handle
        type="source"
        position={Position.Left}
        id="left-source"
        isConnectable={isConnectable}
        className={`${handleCommonClasses} !opacity-0 hover:!opacity-100`}
      />
    </>
  );
}
