"use client";

import * as React from "react";
import { FilePlus, FolderPlus } from "lucide-react";
import { FileNode } from "../types";
import { SidebarGroupLabel } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useContentStore } from "@/store/useContentStore";

type FileTreeToolbarProps = {
  files: FileNode[];
  setFiles: React.Dispatch<React.SetStateAction<FileNode[]>>;
  setEditingNodeId: (id: string) => void;
  setEditingName: (name: string) => void;
};

export function FileTreeToolbar({
  files,
  setFiles,
  setEditingNodeId,
  setEditingName,
}: FileTreeToolbarProps) {
  const { selectNode } = useContentStore();

  const addRootFolder = () => {
    const count = files.filter((f) => f.type === "folder").length;
    const newFolderName = `New Folder ${count + 1}`;
    const newId = crypto.randomUUID();
    const newFolder: FileNode = {
      id: newId,
      name: newFolderName,
      type: "folder",
      children: [],
    };
    setFiles([...files, newFolder]);
    setEditingNodeId(newFolder.id);
    setEditingName(newFolder.name);
    selectNode(
      newId,
      newFolderName,
      "root",
      `# ${newFolderName}\n\nFolder documentation and overview...`,
    );
  };

  const addRootFile = () => {
    const count = files.filter((f) => f.type === "file").length;
    const newFileName = `New File ${count + 1}.md`;
    const newId = crypto.randomUUID();
    const newFile: FileNode = {
      id: newId,
      name: newFileName,
      type: "file",
    };
    setFiles([...files, newFile]);
    setEditingNodeId(newFile.id);
    setEditingName(newFile.name);
    selectNode(
      newId,
      newFileName,
      "root",
      `# ${newFileName}\n\nStart typing your content here...`,
    );
  };

  return (
    <div className="flex items-center justify-between">
      <SidebarGroupLabel>Files</SidebarGroupLabel>
      <div className="flex items-center gap-1 pr-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-sidebar-foreground"
          onClick={addRootFile}
          title="Add File"
        >
          <FilePlus className="size-4 text-muted-foreground" />
          <span className="sr-only">Add File</span>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-sidebar-foreground"
          onClick={addRootFolder}
          title="Add Folder"
        >
          <FolderPlus className="size-4 text-muted-foreground" />
          <span className="sr-only">Add Folder</span>
        </Button>
      </div>
    </div>
  );
}
