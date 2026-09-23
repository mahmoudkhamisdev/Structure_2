"use client";

import React from "react";
import { useReactFlow } from "@xyflow/react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuShortcut,
} from "@/components/ui/context-menu";
import { Trash2 } from "lucide-react";
import type { ChenNodeType } from "./types";

interface NodeContextMenuProps {
  id: string;
  currentType?: ChenNodeType;
  children: React.ReactNode;
}

export function NodeContextMenu({
  id,
  children,
}: NodeContextMenuProps) {
  const { setNodes, setEdges } = useReactFlow();

  const handleDelete = () => {
    setNodes((nds) => nds.filter((n) => n.id !== id));
    setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger className="w-full h-full block select-none">
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-40 text-xs">
        {/* Delete Node Option Only */}
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

