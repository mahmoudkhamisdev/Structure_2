import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Project } from "@/app/_components/Sidebar/types";
import { initialProjects } from "@/app/_components/Sidebar/constants";

interface ContentState {
  // Projects
  projects: Project[];
  activeProjectId: string;
  setProjects: (
    projectsOrUpdater: Project[] | ((prev: Project[]) => Project[]),
  ) => void;
  setActiveProjectId: (id: string) => void;

  // Active file / folder content
  activeNodeId: string | null;
  content: string;
  fileName: string;
  filePath: string;
  fileContents: Record<string, string>;
  setContent: (content: string) => void;
  setFileName: (fileName: string) => void;
  setFilePath: (filePath: string) => void;
  setActiveNodeId: (activeNodeId: string | null) => void;
  selectNode: (
    id: string,
    name: string,
    path: string,
    defaultContent?: string,
  ) => void;
  deleteNodeContent: (id: string) => void;
  viewerTab: "viewer" | "flow";
  setViewerTab: (tab: "viewer" | "flow") => void;
}

export const useContentStore = create<ContentState>()(
  persist(
    (set) => ({
      projects: initialProjects,
      activeProjectId: initialProjects[0]?.id || "1",

      setProjects: (projectsOrUpdater) =>
        set((state) => ({
          projects:
            typeof projectsOrUpdater === "function"
              ? projectsOrUpdater(state.projects)
              : projectsOrUpdater,
        })),

      setActiveProjectId: (activeProjectId) => set({ activeProjectId }),

      activeNodeId: null,
      content: "# Hello World!\n\nWelcome to **Formatly**. Start writing your markdown here.",
      fileName: "",
      filePath: "",
      fileContents: {},

      setContent: (content) =>
        set((state) => {
          const activeId = state.activeNodeId;
          if (!activeId) return { content };
          return {
            content,
            fileContents: {
              ...state.fileContents,
              [activeId]: content,
            },
          };
        }),

      setFileName: (fileName) => set({ fileName }),

      setFilePath: (filePath) => set({ filePath }),

      setActiveNodeId: (activeNodeId) => set({ activeNodeId }),

      selectNode: (id, name, path, defaultContent) =>
        set((state) => {
          const existingContent = state.fileContents[id];
          const newContent =
            existingContent !== undefined
              ? existingContent
              : (defaultContent ?? `# ${name}\n\nWrite your content here...`);

          return {
            activeNodeId: id,
            fileName: name,
            filePath: path,
            content: newContent,
            fileContents: {
              ...state.fileContents,
              [id]: newContent,
            },
          };
        }),

      deleteNodeContent: (id) =>
        set((state) => {
          const updatedContents = { ...state.fileContents };
          delete updatedContents[id];

          if (state.activeNodeId === id) {
            return {
              activeNodeId: null,
              fileName: "",
              filePath: "",
              content: "",
              fileContents: updatedContents,
            };
          }
          return { fileContents: updatedContents };
        }),

      viewerTab: "viewer",
      setViewerTab: (viewerTab) => set({ viewerTab }),
    }),
    {
      name: "formatly_app_storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
