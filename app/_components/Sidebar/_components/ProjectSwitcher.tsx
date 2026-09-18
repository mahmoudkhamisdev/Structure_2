"use client";

import * as React from "react";
import { Blocks, ChevronsUpDown, Plus } from "lucide-react";
import { Project } from "../types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuShortcut,
} from "@/components/ui/dropdown-menu";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { ProjectDialog, ProjectFormData } from "./ProjectDialog";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { cn } from "@/lib/utils";

type ProjectSwitcherProps = {
  projects: Project[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  activeProjectId: string;
  setActiveProjectId: (id: string) => void;
};

export function ProjectSwitcher({
  projects,
  setProjects,
  activeProjectId,
  setActiveProjectId,
}: ProjectSwitcherProps) {
  const { isMobile } = useSidebar();
  const activeProject = projects.find((p) => p.id === activeProjectId) || projects[0];

  const [projectDialogOpen, setProjectDialogOpen] = React.useState(false);
  const [projectDialogMode, setProjectDialogMode] = React.useState<"add" | "edit">("add");
  const [editingProject, setEditingProject] = React.useState<ProjectFormData | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);

  // Keyboard shortcut: Ctrl + 1, Ctrl + 2, ... to switch projects
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Do not trigger if typing in an input field (e.g., in a dialog)
      const target = e.target as HTMLElement | null;
      if (target?.tagName === "INPUT") {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey) {
        const digit = parseInt(e.key, 10);
        if (!isNaN(digit) && digit >= 1 && digit <= 9) {
          const index = digit - 1;
          if (index < projects.length) {
            e.preventDefault();
            setActiveProjectId(projects[index].id);
            setIsDropdownOpen(false);
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [projects, setActiveProjectId]);

  const handleDialogSubmit = (data: ProjectFormData) => {
    if (!data.name.trim()) return;

    if (projectDialogMode === "add") {
      const newProject: Project = {
        id: Math.random().toString(36).substr(2, 9),
        name: data.name.trim(),
        plan: data.plan.trim() || "Free",
        files: [],
      };
      setProjects((prev) => [...prev, newProject]);
      setActiveProjectId(newProject.id);
    } else if (data.id) {
      setProjects((prev) =>
        prev.map((p) =>
          p.id === data.id
            ? {
              ...p,
              name: data.name.trim(),
              plan: data.plan.trim(),
            }
            : p,
        ),
      );
    }
    setProjectDialogOpen(false);
  };

  const handleDeleteProject = (id: string) => {
    setProjects((prev) => {
      const filtered = prev.filter((p) => p.id !== id);
      if (activeProjectId === id) {
        if (filtered.length > 0) setActiveProjectId(filtered[0].id);
        else setActiveProjectId("");
      }
      return filtered;
    });
  };

  const openAddProjectDialog = () => {
    setEditingProject(null);
    setProjectDialogMode("add");
    setProjectDialogOpen(true);
  };

  const openEditProjectDialog = (project: Project) => {
    setEditingProject({
      id: project.id,
      name: project.name,
      plan: project.plan,
    });
    setProjectDialogMode("edit");
    setProjectDialogOpen(true);
    setIsDropdownOpen(false);
  };

  return (
    <SidebarHeader>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu
            open={isDropdownOpen}
            onOpenChange={setIsDropdownOpen}
          >
            <DropdownMenuTrigger
              render={
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                />
              }
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <Blocks className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  {activeProject?.name || "No Project"}
                </span>
                <span className="truncate text-xs">
                  {activeProject?.plan || "Select a project"}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-xl"
              align={isMobile ? "end" :"start"}
              side={isMobile ? "bottom" : "right"}
              sideOffset={4}
            >
              <DropdownMenuGroup className="flex flex-col gap-1">
                <DropdownMenuLabel className="text-xs font-normal text-muted-foreground/80 px-2 pt-1 pb-1">
                  Projects
                </DropdownMenuLabel>
                {projects.map((project, index) => {
                  const isActive = activeProjectId === project.id;
                  return (
                    <ContextMenu key={project.id}>
                      <ContextMenuTrigger
                        render={
                          <DropdownMenuItem
                            className={cn(
                              "flex items-center gap-3 px-2 py-2 rounded-xl cursor-pointer hover:bg-accent focus:bg-accent text-foreground transition-colors group",
                              isActive && "bg-accent text-accent-foreground font-medium",
                            )}
                            onClick={() => {
                              setActiveProjectId(project.id);
                              setIsDropdownOpen(false);
                            }}
                          >
                            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-border/70 bg-background shadow-2xs">
                              <Blocks className="size-4 text-foreground/80" />
                            </div>
                            <span className="truncate font-normal text-sm text-foreground flex-1">
                              {project.name}
                            </span>
                            <DropdownMenuShortcut className="text-xs text-muted-foreground/70 font-mono tracking-wider ml-auto">
                              <KbdGroup>
                                <Kbd>Ctrl</Kbd>
                                <span>+</span>
                                <Kbd>{index + 1}</Kbd>
                              </KbdGroup>
                            </DropdownMenuShortcut>
                          </DropdownMenuItem>
                        }
                      />
                      <ContextMenuContent>
                        <ContextMenuItem
                          onClick={() => openEditProjectDialog(project)}
                        >
                          Edit
                        </ContextMenuItem>
                        <ContextMenuItem
                          className="text-red-600 focus:text-red-600"
                          onClick={() => {
                            handleDeleteProject(project.id);
                            setIsDropdownOpen(false);
                          }}
                        >
                          Delete
                        </ContextMenuItem>
                      </ContextMenuContent>
                    </ContextMenu>
                  );
                })}
              </DropdownMenuGroup>
              <DropdownMenuSeparator className="-mx-2 my-1.5 bg-border/60" />
              <DropdownMenuItem
                className="flex items-center gap-3 px-1.5 py-1.5 rounded-xl cursor-pointer hover:bg-accent focus:bg-accent transition-colors group"
                onClick={() => {
                  openAddProjectDialog();
                  setIsDropdownOpen(false);
                }}
              >
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-border/70 bg-background shadow-2xs text-muted-foreground group-hover:text-foreground">
                  <Plus className="size-4" />
                </div>
                <span className="text-sm font-normal text-muted-foreground group-hover:text-foreground">
                  Add project
                </span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>

      <ProjectDialog
        open={projectDialogOpen}
        onOpenChange={setProjectDialogOpen}
        mode={projectDialogMode}
        initialData={editingProject}
        onSubmit={handleDialogSubmit}
      />
    </SidebarHeader>
  );
}
