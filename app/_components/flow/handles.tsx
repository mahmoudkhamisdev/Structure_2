"use client";

import React from "react";
import { Handle, Position } from "@xyflow/react";
import { NodeQuickConnectArrow } from "./NodeQuickConnectArrow";

interface ChenNodeHandlesProps {
  isConnectable?: boolean;
  nodeId?: string;
  showQuickConnect?: boolean;
}

const handleCommonClasses =
  "!w-2 !h-2 !bg-muted-foreground/60 hover:!bg-primary !z-40";

export function ChenNodeHandles({
  isConnectable = true,
  nodeId,
  showQuickConnect = true,
}: ChenNodeHandlesProps) {
  return (
    <>
      {showQuickConnect && isConnectable && (
        <>
          <NodeQuickConnectArrow nodeId={nodeId} direction="top" />
          <NodeQuickConnectArrow nodeId={nodeId} direction="right" />
          <NodeQuickConnectArrow nodeId={nodeId} direction="bottom" />
          <NodeQuickConnectArrow nodeId={nodeId} direction="left" />
        </>
      )}
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
