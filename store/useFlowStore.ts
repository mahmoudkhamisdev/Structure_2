import { create } from "zustand";
import {
  applyNodeChanges,
  applyEdgeChanges,
  type NodeChange,
  type EdgeChange,
} from "@xyflow/react";
import type {
  ChenNode,
  ChenEdge,
  FlowLayoutDirection,
} from "../app/_components/flow/types";
import {
  computeNodeDimensions,
  serializeFlowToMarkdown,
  parseFlowFromMarkdown
} from "../app/_components/flow/flowParser";
import { useContentStore } from "@/store/useContentStore";
import {
  initialChenNodes,
  initialChenEdges,
} from "../app/_components/flow/initial-elements";

// Helper to compute structural fingerprint (excludes canvas dragging positions x, y)
function getStructureFingerprint(
  nodes: ChenNode[],
  edges: ChenEdge[],
  dir: FlowLayoutDirection,
): string {
  const nodesSig = nodes
    .map(
      (n) => `${n.id}:${n.type}:${n.data?.label || ""}:${n.data?.color || ""}`,
    )
    .sort()
    .join("|");
  const edgesSig = edges
    .map((e) => `${e.source}:${e.target}:${e.data?.label || ""}`)
    .sort()
    .join("|");
  return `${dir}::${nodesSig}::${edgesSig}`;
}

interface FlowState {
  nodes: ChenNode[];
  edges: ChenEdge[];
  layoutDirection: FlowLayoutDirection;
  nodeSpacing: number;
  lastSyncedMarkdown: string;
  lastFingerprint: string;

  // Setters
  setNodes: (
    nodesOrUpdater: ChenNode[] | ((prev: ChenNode[]) => ChenNode[]),
  ) => void;
  setEdges: (
    edgesOrUpdater: ChenEdge[] | ((prev: ChenEdge[]) => ChenEdge[]),
  ) => void;
  setLayoutDirection: (dir: FlowLayoutDirection) => void;
  setNodeSpacing: (spacing: number) => void;

  // React Flow handlers
  onNodesChange: (changes: NodeChange<ChenNode>[]) => void;
  onEdgesChange: (changes: EdgeChange<ChenEdge>[]) => void;

  // Specific flow mutation actions that directly sync to the editor
  deleteNode: (id: string) => void;
  deleteSelected: () => void;
  updateNodeLabel: (id: string, newLabel: string) => void;
  updateNodeColor: (id: string, color?: string) => void;
  addNode: (newNode: ChenNode) => void;
  addConnectedNode: (newNode: ChenNode, newEdge: ChenEdge) => void;
  addEdgeConnection: (newEdge: ChenEdge) => void;
  clearCanvas: () => void;

  // Sync helpers
  syncToMarkdown: (
    customNodes?: ChenNode[],
    customEdges?: ChenEdge[],
    customDir?: FlowLayoutDirection,
  ) => void;
  syncFromMarkdown: (
    content: string,
    userPositions?: Map<string, { x: number; y: number }>,
  ) => boolean;
}

export const useFlowStore = create<FlowState>()((set, get) => ({
  nodes: initialChenNodes,
  edges: initialChenEdges,
  layoutDirection: "TB",
  nodeSpacing: 60,
  lastSyncedMarkdown: "",
  lastFingerprint: "",

  setNodes: (nodesOrUpdater) => {
    set((state) => ({
      nodes:
        typeof nodesOrUpdater === "function"
          ? nodesOrUpdater(state.nodes)
          : nodesOrUpdater,
    }));
  },

  setEdges: (edgesOrUpdater) => {
    set((state) => ({
      edges:
        typeof edgesOrUpdater === "function"
          ? edgesOrUpdater(state.edges)
          : edgesOrUpdater,
    }));
  },

  setLayoutDirection: (layoutDirection) => {
    set({ layoutDirection });
    get().syncToMarkdown(get().nodes, get().edges, layoutDirection);
  },

  setNodeSpacing: (nodeSpacing) => {
    set({ nodeSpacing });
  },

  onNodesChange: (changes) => {
    const prevNodes = get().nodes;
    const nextNodes = applyNodeChanges(changes, prevNodes) as ChenNode[];
    set({ nodes: nextNodes });

    // If any node was removed, sync to markdown immediately
    const hasRemoval = changes.some((c) => c.type === "remove");
    if (hasRemoval) {
      get().syncToMarkdown(nextNodes, get().edges);
    }
  },

  onEdgesChange: (changes) => {
    const prevEdges = get().edges;
    const nextEdges = applyEdgeChanges(changes, prevEdges) as ChenEdge[];
    set({ edges: nextEdges });

    // If any edge was removed, sync to markdown immediately
    const hasRemoval = changes.some((c) => c.type === "remove");
    if (hasRemoval) {
      get().syncToMarkdown(get().nodes, nextEdges);
    }
  },

  deleteNode: (id: string) => {
    const nextNodes = get().nodes.filter((n) => n.id !== id);
    const nextEdges = get().edges.filter(
      (e) => e.source !== id && e.target !== id,
    );
    set({ nodes: nextNodes, edges: nextEdges });
    get().syncToMarkdown(nextNodes, nextEdges);
  },

  deleteSelected: () => {
    const nextNodes = get().nodes.filter((n) => !n.selected);
    const nextEdges = get().edges.filter((e) => !e.selected);
    set({ nodes: nextNodes, edges: nextEdges });
    get().syncToMarkdown(nextNodes, nextEdges);
  },

  updateNodeLabel: (id: string, newLabel: string) => {
    const nextNodes = get().nodes.map((node) => {
      if (node.id === id) {
        const dims = computeNodeDimensions(
          node.type || "process",
          newLabel || " ",
        );
        return {
          ...node,
          width: dims.width,
          height: dims.height,
          style: {
            ...node.style,
            width: dims.width,
            height: dims.height,
          },
          data: {
            ...node.data,
            label: newLabel,
          },
        };
      }
      return node;
    });

    set({ nodes: nextNodes });
    get().syncToMarkdown(nextNodes, get().edges);
  },

  updateNodeColor: (id: string, color?: string) => {
    const colorVal = color || undefined;
    const nextNodes = get().nodes.map((n) => {
      if (n.id === id || n.selected) {
        return {
          ...n,
          data: {
            ...n.data,
            color: colorVal,
          },
        };
      }
      return n;
    });

    set({ nodes: nextNodes });
    get().syncToMarkdown(nextNodes, get().edges);
  },

  addNode: (newNode: ChenNode) => {
    const nextNodes = get().nodes.concat(newNode);
    set({ nodes: nextNodes });
    get().syncToMarkdown(nextNodes, get().edges);
  },

  addConnectedNode: (newNode: ChenNode, newEdge: ChenEdge) => {
    const nextNodes = get().nodes.concat(newNode);
    const nextEdges = get().edges.concat(newEdge);
    set({ nodes: nextNodes, edges: nextEdges });
    get().syncToMarkdown(nextNodes, nextEdges);
  },

  addEdgeConnection: (newEdge: ChenEdge) => {
    const nextEdges = get().edges.concat(newEdge);
    set({ edges: nextEdges });
    get().syncToMarkdown(get().nodes, nextEdges);
  },

  clearCanvas: () => {
    set({ nodes: [], edges: [] });
    get().syncToMarkdown([], []);
  },

  syncToMarkdown: (customNodes, customEdges, customDir) => {
    const state = get();
    const currentNodes = customNodes ?? state.nodes;
    const currentEdges = customEdges ?? state.edges;
    const currentDir = customDir ?? state.layoutDirection;

    const fingerprint = getStructureFingerprint(
      currentNodes,
      currentEdges,
      currentDir,
    );
    if (fingerprint === state.lastFingerprint) {
      return;
    }

    const currentContent = useContentStore.getState().content;
    const updatedMarkdown = serializeFlowToMarkdown(
      currentNodes,
      currentEdges,
      currentDir,
      currentContent,
    );

    set({
      lastFingerprint: fingerprint,
      lastSyncedMarkdown: updatedMarkdown,
    });

    if (updatedMarkdown !== currentContent) {
      useContentStore.getState().setContent(updatedMarkdown);
    }
  },

  syncFromMarkdown: (content: string, userPositions) => {
    if (!content) {
      return false;
    }

    const state = get();
    // Skip if content matches what we just serialized
    if (content === state.lastSyncedMarkdown) {
      return false;
    }

    const parsed = parseFlowFromMarkdown(
      content,
      userPositions,
      state.layoutDirection,
      state.nodeSpacing,
    );
    if (parsed.hasFlowDefinitions) {
      const selectedSet = new Set(
        state.nodes.filter((n) => n.selected).map((n) => n.id),
      );
      const nodesWithSelection = parsed.nodes.map((n) => ({
        ...n,
        selected: selectedSet.has(n.id),
      }));
      const fingerprint = getStructureFingerprint(
        nodesWithSelection,
        parsed.edges,
        state.layoutDirection,
      );
      set({
        nodes: nodesWithSelection,
        edges: parsed.edges,
        lastSyncedMarkdown: content,
        lastFingerprint: fingerprint,
      });
      return true;
    }

    return false;
  },
}));
