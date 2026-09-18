"use client";

import React from "react";
import { useReactFlow } from "@xyflow/react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
  ContextMenuShortcut,
} from "@/components/ui/context-menu";
import {
  Trash2,
  ArrowLeftRight,
  Square,
  Layers,
  Diamond,
  Circle,
  Underline as UnderlineIcon,
  CircleDot,
  Type,
  Check,
} from "lucide-react";
import type { ChenNodeType } from "./types";

interface NodeContextMenuProps {
  id: string;
  currentType: ChenNodeType;
  children: React.ReactNode;
}

const typeOptions: {
  type: ChenNodeType;
  label: string;
  icon: React.ReactNode;
}[] = [
  {
    type: "entity",
    label: "Entity (Rectangle)",
    icon: <Square className="size-3.5" />,
  },
  {
    type: "weakEntity",
    label: "Weak Entity (Double Rect)",
    icon: <Layers className="size-3.5" />,
  },
  {
    type: "relationship",
    label: "Relationship (Diamond)",
    icon: <Diamond className="size-3.5" />,
  },
  {
    type: "identifyingRelationship",
    label: "Identifying (Double Diamond)",
    icon: <Diamond className="size-3.5" />,
  },
  {
    type: "attribute",
    label: "Attribute (Oval)",
    icon: <Circle className="size-3.5" />,
  },
  {
    type: "keyAttribute",
    label: "Primary Key (Underlined)",
    icon: <UnderlineIcon className="size-3.5" />,
  },
  {
    type: "multivaluedAttribute",
    label: "Multivalued (Double Oval)",
    icon: <CircleDot className="size-3.5" />,
  },
  {
    type: "text",
    label: "Text Note",
    icon: <Type className="size-3.5" />,
  },
];

export function NodeContextMenu({
  id,
  currentType,
  children,
}: NodeContextMenuProps) {
  const { setNodes, setEdges } = useReactFlow();

  const handleChangeType = (newType: ChenNodeType) => {
    setNodes((nds) =>
      nds.map((n) => {
        if (n.id === id) {
          return {
            ...n,
            type: newType,
          };
        }
        return n;
      })
    );
  };

  const handleDelete = () => {
    setNodes((nds) => nds.filter((n) => n.id !== id));
    setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger>{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-52 text-xs">
        {/* Submenu to Change Node Type */}
        <ContextMenuSub>
          <ContextMenuSubTrigger className="gap-2 cursor-pointer">
            <ArrowLeftRight className="size-3.5 text-muted-foreground" />
            <span>Change Type</span>
          </ContextMenuSubTrigger>
          <ContextMenuSubContent className="w-56 text-xs">
            {typeOptions.map((opt) => {
              const isSelected = opt.type === currentType;
              return (
                <ContextMenuItem
                  key={opt.type}
                  onClick={() => handleChangeType(opt.type)}
                  className="flex items-center justify-between gap-2 cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    {opt.icon}
                    <span>{opt.label}</span>
                  </div>
                  {isSelected && <Check className="size-3 text-primary" />}
                </ContextMenuItem>
              );
            })}
          </ContextMenuSubContent>
        </ContextMenuSub>

        <ContextMenuSeparator />

        {/* Delete Node Option */}
        <ContextMenuItem
          onClick={handleDelete}
          className="text-destructive focus:bg-destructive/10 focus:text-destructive gap-2 cursor-pointer"
        >
          <Trash2 className="size-3.5" />
          <span>Delete Node</span>
          <ContextMenuShortcut>Del</ContextMenuShortcut>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
