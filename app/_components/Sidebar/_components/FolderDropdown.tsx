"use client";

import * as React from "react";
import { FileText, Folder, Network } from "lucide-react";
import { FileNode } from "../types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface FolderDropdownProps {
  folder: FileNode;
  open?: boolean;
  isOpen?: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectFile: (childId: string, fileName: string, folderName: string) => void;
  onSelectFolder?: (folderId: string, folderName: string) => void;
  children: React.ReactNode;
}

export function FolderDropdown({
  folder,
  open,
  isOpen,
  onOpenChange,
  onSelectFile,
  onSelectFolder,
  children,
}: FolderDropdownProps) {
  const isDropdownOpen = open !== undefined ? open : (isOpen ?? false);

  return (
    <DropdownMenu open={isDropdownOpen} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger render={children as React.ReactElement} />
      <DropdownMenuContent side="right" align="start" sideOffset={8} className="w-52">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span className="truncate font-semibold">{folder.name}</span>
          <span className="text-[10px] text-muted-foreground uppercase font-mono tracking-wider">
            Folder
          </span>
        </DropdownMenuLabel>
        {onSelectFolder && (
          <DropdownMenuItem
            className="cursor-pointer text-xs"
            onClick={() => onSelectFolder(folder.id, folder.name)}
          >
            <Folder className="mr-2 size-4 text-primary" />
            <span>Open folder notes</span>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        {!folder.children || folder.children.length === 0 ? (
          <div className="p-2 text-xs text-muted-foreground text-center">
            Empty Folder
          </div>
        ) : (
          folder.children.map((child) => (
            <DropdownMenuItem
              key={child.id}
              className="cursor-pointer text-xs"
              onClick={() => onSelectFile(child.id, child.name, folder.name)}
            >
              {child.name.toLowerCase().endsWith(".flow") ? (
                <Network
                  className="mr-2 size-4 text-emerald-500! dark:text-emerald-400! shrink-0"
                />
              ) : (
                <FileText className="mr-2 size-4 text-muted-foreground shrink-0" />
              )}
              <span className="truncate">{child.name}</span>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
