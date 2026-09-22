"use client";

import * as React from "react";
import { Folder, FileText, ChevronRight, FilePlus, Check, Network } from "lucide-react";
import { FileNode } from "../types";
import { useContentStore } from "@/store/useContentStore";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarMenuAction,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
  InputGroupButton,
} from "@/components/ui/input-group";
import { FolderDropdown } from "./FolderDropdown";

type FileTreeProps = {
  files: FileNode[];
  setFiles: React.Dispatch<React.SetStateAction<FileNode[]>>;
  editingNodeId: string | null;
  setEditingNodeId: (id: string | null) => void;
  editingName: string;
  setEditingName: (name: string) => void;
  openFolders?: Set<string>;
  setOpenFolders?: React.Dispatch<React.SetStateAction<Set<string>>>;
  onOpenCreateFile?: (folder: { id: string; name: string }) => void;
};

export function FileTree({
  files,
  setFiles,
  editingNodeId,
  setEditingNodeId,
  editingName,
  setEditingName,
  openFolders,
  setOpenFolders,
  onOpenCreateFile,
}: FileTreeProps) {
  const { state: sidebarState } = useSidebar();
  const isCollapsed = sidebarState === "collapsed";
  const {
    activeNodeId,
    selectNode,
    setFileName,
    deleteNodeContent,
    fileName,
  } = useContentStore();

  const [activeDropdownFolder, setActiveDropdownFolder] = React.useState<string | null>(null);

  const [internalOpenFolders, setInternalOpenFolders] = React.useState<Set<string>>(
    () => new Set(files.filter((f) => f.type === "folder").map((f) => f.id)),
  );
  const activeOpenFolders = openFolders ?? internalOpenFolders;
  const updateOpenFolders = setOpenFolders ?? setInternalOpenFolders;

  const updateNodeName = React.useCallback(
    (nodes: FileNode[], id: string, newName: string): FileNode[] => {
      return nodes.map((node) => {
        if (node.id === id) {
          return { ...node, name: newName };
        }
        if (node.children) {
          return { ...node, children: updateNodeName(node.children, id, newName) };
        }
        return node;
      });
    },
    [],
  );

  // Sync external name changes (e.g. from Header input) to the file tree
  React.useEffect(() => {
    if (!activeNodeId || !fileName) return;
    setFiles((prev) => {
      const findNodeName = (nodes: FileNode[]): string | null => {
        for (const node of nodes) {
          if (node.id === activeNodeId) return node.name;
          if (node.children) {
            const found = findNodeName(node.children);
            if (found !== null) return found;
          }
        }
        return null;
      };
      const currentName = findNodeName(prev);
      if (currentName !== null && currentName !== fileName) {
        return updateNodeName(prev, activeNodeId, fileName);
      }
      return prev;
    });
  }, [activeNodeId, fileName, setFiles, updateNodeName]);

  const addFolderFile = (folderId: string) => {
    const folder = files.find((f) => f.id === folderId);
    if (!folder || folder.type !== "folder") return;

    const newId = crypto.randomUUID();
    const count = folder.children?.filter((c) => c.type === "file").length || 0;
    const newFileName = `New File ${count + 1}.md`;

    setFiles((prev) =>
      prev.map((node) => {
        if (node.id === folderId && node.type === "folder") {
          const newFile: FileNode = {
            id: newId,
            name: newFileName,
            type: "file",
          };
          return {
            ...node,
            children: [...(node.children || []), newFile],
          };
        }
        return node;
      }),
    );

    setEditingNodeId(newId);
    setEditingName(newFileName);
    updateOpenFolders((prev) => new Set(prev).add(folderId));

    // Connect content & make active
    selectNode(
      newId,
      newFileName,
      folder.name,
      `# ${newFileName}\n\nStart typing your content here...`,
    );
  };

  const handleRenameSubmit = () => {
    if (editingNodeId && editingName.trim()) {
      const trimmed = editingName.trim();
      setFiles((prev) => updateNodeName(prev, editingNodeId, trimmed));
      if (editingNodeId === activeNodeId) {
        setFileName(trimmed);
      }
    }
    setEditingNodeId(null);
  };

  const deleteNode = (id: string) => {
    const filterNodes = (nodes: FileNode[]): FileNode[] => {
      return nodes
        .filter((node) => node.id !== id)
        .map((node) => ({
          ...node,
          children: node.children ? filterNodes(node.children) : undefined,
        }));
    };
    setFiles((prev) => filterNodes(prev));
    deleteNodeContent(id);
  };

  return (
    <SidebarMenu>
      {files.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-2 py-6 text-muted-foreground group-data-[collapsible=icon]:hidden">
          <Folder className="size-8 opacity-20" />
          <p className="text-xs text-center">
            No files yet.
            <br />
            Create one to get started.
          </p>
        </div>
      )}
      {files.map((item) =>
        item.type === "folder" ? (
          <Collapsible
            key={item.id}
            open={activeOpenFolders.has(item.id)}
            onOpenChange={(open) => {
              updateOpenFolders((prev) => {
                const next = new Set(prev);
                if (open) next.add(item.id);
                else next.delete(item.id);
                return next;
              });
            }}
            className="group/collapsible"
          >
            <ContextMenu>
              <ContextMenuTrigger render={<SidebarMenuItem />}>
                <FolderDropdown
                  open={isCollapsed && activeDropdownFolder === item.id}
                  onOpenChange={(open) => {
                    if (!open) setActiveDropdownFolder(null);
                  }}
                  folder={item}
                  onSelectFile={(childId, childName, folderName) => {
                    selectNode(childId, childName, folderName);
                    setActiveDropdownFolder(null);
                  }}
                  onSelectFolder={(folderId, folderName) => {
                    selectNode(folderId, folderName, "root");
                    setActiveDropdownFolder(null);
                  }}
                >
                  <CollapsibleTrigger
                    render={
                      <SidebarMenuButton
                        tooltip={item.name}
                        isActive={activeNodeId === item.id}
                        onClick={(e) => {
                          if (isCollapsed) {
                            e.preventDefault();
                            setActiveDropdownFolder(
                              activeDropdownFolder === item.id ? null : item.id,
                            );
                          } else {
                            selectNode(item.id, item.name, "root");
                          }
                        }}
                        onDoubleClick={(e) => {
                          e.preventDefault();
                          if (isCollapsed) return;
                          setEditingNodeId(item.id);
                          setEditingName(item.name);
                        }}
                      >
                        <ChevronRight
                          className={`transition-transform duration-200 group-data-[collapsible=icon]:hidden ${
                            activeOpenFolders.has(item.id) ? "rotate-90" : ""
                          }`}
                        />
                        <Folder />
                        {editingNodeId === item.id ? (
                          <InputGroup className="h-6">
                            <InputGroupInput
                              value={editingName}
                              onChange={(e) => setEditingName(e.target.value)}
                              onBlur={handleRenameSubmit}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handleRenameSubmit();
                                if (e.key === "Escape") setEditingNodeId(null);
                              }}
                              autoFocus
                              className="text-xs"
                              onClick={(e) => e.stopPropagation()}
                            />
                            <InputGroupAddon align="inline-end">
                              <InputGroupButton
                                type="button"
                                variant="ghost"
                                size="icon-xs"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleRenameSubmit();
                                }}
                              >
                                <Check />
                              </InputGroupButton>
                            </InputGroupAddon>
                          </InputGroup>
                        ) : (
                          <span>{item.name}</span>
                        )}
                      </SidebarMenuButton>
                    }
                  />
                </FolderDropdown>
                <SidebarMenuAction
                  showOnHover
                  title="Add File"
                  onClick={(e: React.MouseEvent) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (onOpenCreateFile) {
                      onOpenCreateFile({ id: item.id, name: item.name });
                    } else {
                      addFolderFile(item.id);
                    }
                  }}
                >
                  <FilePlus />
                  <span className="sr-only">Add File</span>
                </SidebarMenuAction>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.children?.map((child) => (
                      <ContextMenu key={child.id}>
                        <ContextMenuTrigger render={<SidebarMenuSubItem />}>
                          <SidebarMenuSubButton
                            isActive={activeNodeId === child.id}
                            render={
                              <a
                                href="#"
                                title={child.name}
                                onClick={(e) => {
                                  e.preventDefault();
                                  selectNode(child.id, child.name, item.name);
                                }}
                                onDoubleClick={(e) => {
                                  e.preventDefault();
                                  if (isCollapsed) return;
                                  setEditingNodeId(child.id);
                                  setEditingName(child.name);
                                }}
                              >
                                {child.name.toLowerCase().endsWith(".flow") ? (
                                  <Network
                                    className="text-emerald-500! dark:text-emerald-400! shrink-0"
                                  />
                                ) : (
                                  <FileText className="shrink-0" />
                                )}
                                {editingNodeId === child.id ? (
                                  <InputGroup className="h-6">
                                    <InputGroupInput
                                      value={editingName}
                                      onChange={(e) => setEditingName(e.target.value)}
                                      onBlur={handleRenameSubmit}
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter") handleRenameSubmit();
                                        if (e.key === "Escape") setEditingNodeId(null);
                                      }}
                                      autoFocus
                                      className="text-xs"
                                      onClick={(e) => e.stopPropagation()}
                                    />
                                    <InputGroupAddon align="inline-end">
                                      <InputGroupButton
                                        type="button"
                                        variant="ghost"
                                        size="icon-xs"
                                        onClick={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          handleRenameSubmit();
                                        }}
                                      >
                                        <Check />
                                      </InputGroupButton>
                                    </InputGroupAddon>
                                  </InputGroup>
                                ) : (
                                  <span>{child.name}</span>
                                )}
                              </a>
                            }
                          />
                        </ContextMenuTrigger>
                        <ContextMenuContent>
                          <ContextMenuItem
                            onClick={() => {
                              setEditingNodeId(child.id);
                              setEditingName(child.name);
                            }}
                          >
                            Rename
                          </ContextMenuItem>
                          <ContextMenuItem
                            onClick={() => deleteNode(child.id)}
                            className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950"
                          >
                            Delete
                          </ContextMenuItem>
                        </ContextMenuContent>
                      </ContextMenu>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </ContextMenuTrigger>
              <ContextMenuContent>
                <ContextMenuItem
                  onClick={() => {
                    if (onOpenCreateFile) {
                      onOpenCreateFile({ id: item.id, name: item.name });
                    } else {
                      addFolderFile(item.id);
                    }
                  }}
                >
                  <FilePlus className="mr-2 size-4" />
                  New File...
                </ContextMenuItem>
                <ContextMenuItem
                  onClick={() => {
                    setEditingNodeId(item.id);
                    setEditingName(item.name);
                  }}
                >
                  Rename
                </ContextMenuItem>
                <ContextMenuItem
                  onClick={() => deleteNode(item.id)}
                  className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950"
                >
                  Delete
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          </Collapsible>
        ) : (
          <ContextMenu key={item.id}>
            <ContextMenuTrigger render={<SidebarMenuItem />}>
              <SidebarMenuButton
                tooltip={item.name}
                isActive={activeNodeId === item.id}
                onClick={(e) => {
                  e.preventDefault();
                  selectNode(item.id, item.name, "root");
                }}
                onDoubleClick={(e) => {
                  e.preventDefault();
                  if (isCollapsed) return;
                  setEditingNodeId(item.id);
                  setEditingName(item.name);
                }}
              >
                {item.name.toLowerCase().endsWith(".flow") ? (
                  <Network
                    className="!text-emerald-500 dark:!text-emerald-400 shrink-0"
                    style={{ color: "#10b981" }}
                  />
                ) : (
                  <FileText className="shrink-0" />
                )}
                {editingNodeId === item.id ? (
                  <InputGroup className="h-6">
                    <InputGroupInput
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onBlur={handleRenameSubmit}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleRenameSubmit();
                        if (e.key === "Escape") setEditingNodeId(null);
                      }}
                      autoFocus
                      className="text-xs"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <InputGroupAddon align="inline-end">
                      <InputGroupButton
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleRenameSubmit();
                        }}
                      >
                        <Check />
                      </InputGroupButton>
                    </InputGroupAddon>
                  </InputGroup>
                ) : (
                  <span>{item.name}</span>
                )}
              </SidebarMenuButton>
            </ContextMenuTrigger>
            <ContextMenuContent>
              <ContextMenuItem
                onClick={() => {
                  setEditingNodeId(item.id);
                  setEditingName(item.name);
                }}
              >
                Rename
              </ContextMenuItem>
              <ContextMenuItem
                onClick={() => deleteNode(item.id)}
                className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950"
              >
                Delete
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        ),
      )}
    </SidebarMenu>
  );
}
