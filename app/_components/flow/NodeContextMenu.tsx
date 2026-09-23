"use client";

import React from "react";
import { useReactFlow } from "@xyflow/react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubTrigger,
  ContextMenuSubContent,
  ContextMenuSeparator,
} from "@/components/ui/context-menu";
import { Trash2, Palette } from "lucide-react";
import type { ChenNodeType } from "./types";
import { NodeColorGrid } from "./NodeColorPicker";
import { useFlowStore } from "@/store/useFlowStore";

interface NodeContextMenuProps {
  id: string;
  currentType?: ChenNodeType;
  children: React.ReactNode;
}

export function NodeContextMenu({
  id,
  children,
}: NodeContextMenuProps) {
  const { getNode } = useReactFlow();
  const deleteNode = useFlowStore((s) => s.deleteNode);
  const updateNodeColor = useFlowStore((s) => s.updateNodeColor);

  const handleDelete = () => {
    deleteNode(id);
  };

  const currentNode = getNode(id);

  const handleSelectColor = (color: string) => {
    updateNodeColor(id, color);
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger className="w-full h-full block select-none">
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-44 text-xs">
        <ContextMenuSub>
          <ContextMenuSubTrigger className="gap-2 cursor-pointer text-xs">
            <Palette className="size-3.5 text-muted-foreground" />
            <span>Select Color</span>
          </ContextMenuSubTrigger>
          <ContextMenuSubContent className="w-auto p-1 shadow-xl rounded-xl">
            <NodeColorGrid
              currentColor={currentNode?.data?.color as string | undefined}
              onSelectColor={handleSelectColor}
            />
          </ContextMenuSubContent>
        </ContextMenuSub>

        <ContextMenuSeparator className="my-1" />

        {/* Delete Node Option */}
        <ContextMenuItem
          onClick={handleDelete}
          className="text-destructive focus:bg-destructive/10 focus:text-destructive gap-2 cursor-pointer"
        >
          <Trash2 className="size-3.5" />
          <span>Delete</span>
          <ContextMenuShortcut>Del</ContextMenuShortcut>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

