"use client";

import * as React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { PanelLeft } from "lucide-react";
import { Project } from "./types";
import { ProjectSwitcher } from "./_components/ProjectSwitcher";
import { FileTreeToolbar } from "./_components/FileTreeToolbar";
import { FileTree } from "./_components/FileTree";
import { useContentStore } from "@/store/useContentStore";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const {
    projects,
    setProjects,
    activeProjectId,
    setActiveProjectId,
    activeNodeId,
    selectNode,
  } = useContentStore();

  const activeProject =
    projects.find((p) => p.id === activeProjectId) || projects[0];

  const files = activeProject?.files || [];

  const setFiles = React.useCallback(
    (newFilesOrUpdater: React.SetStateAction<Project["files"]>) => {
      setProjects((prev) =>
        prev.map((p) => {
          if (p.id === activeProjectId) {
            const nextFiles =
              typeof newFilesOrUpdater === "function"
                ? newFilesOrUpdater(p.files)
                : newFilesOrUpdater;
            return { ...p, files: nextFiles };
          }
          return p;
        }),
      );
    },
    [activeProjectId, setProjects],
  );

  const [editingNodeId, setEditingNodeId] = React.useState<string | null>(null);
  const [editingName, setEditingName] = React.useState<string>("");

  React.useEffect(() => {
    if (files.length > 0) {
      const isNodeInList = (nodes: Project["files"]): boolean => {
        return nodes.some(
          (n) => n.id === activeNodeId || (n.children && isNodeInList(n.children)),
        );
      };

      if (!activeNodeId || !isNodeInList(files)) {
        const first = files[0];
        if (first.type === "folder" && first.children && first.children.length > 0) {
          const firstChild = first.children[0];
          selectNode(firstChild.id, firstChild.name, first.name);
        } else {
          selectNode(first.id, first.name, "root");
        }
      }
    }
  }, [activeProjectId, files, activeNodeId, selectNode]);

  return (
    <Sidebar collapsible="icon" {...props}>
      <ProjectSwitcher
        projects={projects}
        setProjects={setProjects}
        activeProjectId={activeProjectId}
        setActiveProjectId={setActiveProjectId}
      />
      <SidebarContent>
        <SidebarGroup>
          <FileTreeToolbar
            files={files}
            setFiles={setFiles}
            setEditingNodeId={setEditingNodeId}
            setEditingName={setEditingName}
          />
          <SidebarGroupContent>
            <FileTree
              files={files}
              setFiles={setFiles}
              editingNodeId={editingNodeId}
              setEditingNodeId={setEditingNodeId}
              editingName={editingName}
              setEditingName={setEditingName}
            />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border p-1.5 hidden md:flex">
        <SidebarDesktopToggle />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

function SidebarDesktopToggle() {
  const { toggleSidebar, state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleSidebar}
      title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      className="h-8 w-full justify-start gap-2.5 px-2 text-xs text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent cursor-pointer group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:justify-center"
    >
      <PanelLeft className="size-4 shrink-0 transition-transform duration-200 group-data-[collapsible=icon]:rotate-180" />
      <span className="group-data-[collapsible=icon]:hidden truncate">
        Collapse sidebar
      </span>
    </Button>
  );
}
