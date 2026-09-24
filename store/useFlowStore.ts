import { create } from "zustand";
import {
  applyNodeChanges,
  applyEdgeChanges,
  MarkerType,
  type NodeChange,
  type EdgeChange,
} from "@xyflow/react";
import type {
  ChenNode,
  ChenEdge,
  FlowLayoutDirection,
  FlowEdgeArrowType,
  FlowEdgeRoutingType,
} from "../app/_components/flow/types";
import {
  computeNodeDimensions,
  serializeFlowToMarkdown,
  parseFlowFromMarkdown,
  getOptimalHandles,
  updateEdgesWithOptimalHandles,
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
  defaultArrow?: FlowEdgeArrowType,
  defaultRouting?: FlowEdgeRoutingType,
): string {
  const nodesSig = nodes
    .map(
      (n) => `${n.id}:${n.type}:${n.data?.label || ""}:${n.data?.color || ""}`,
    )
    .sort()
    .join("|");
  const edgesSig = edges
    .map(
      (e) =>
        `${e.source}:${e.target}:${e.data?.label || ""}:${e.data?.arrowType || ""}:${e.data?.routingType || ""}`
    )
    .sort()
    .join("|");
  return `${dir}::${defaultArrow || ""}::${defaultRouting || ""}::${nodesSig}::${edgesSig}`;
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

  defaultArrowType: FlowEdgeArrowType;
  defaultRoutingType: FlowEdgeRoutingType;
  setDefaultArrowType: (type: FlowEdgeArrowType) => void;
  setDefaultRoutingType: (type: FlowEdgeRoutingType) => void;
  updateEdgeArrowType: (
    edgeId: string,
    arrowType: FlowEdgeArrowType,
    routingType?: FlowEdgeRoutingType
  ) => void;
  setAllEdgesArrowType: (
    arrowType: FlowEdgeArrowType,
    routingType?: FlowEdgeRoutingType
  ) => void;
  deleteEdge: (id: string) => void;

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
  defaultArrowType: "directed",
  defaultRoutingType: "bezier",
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

    // When nodes are dragged or resized, dynamically recalculate connected edge handles
    const hasMovement = changes.some(
      (c) => (c.type === "position" && c.position) || c.type === "dimensions"
    );

    let nextEdges = get().edges;
    if (hasMovement) {
      nextEdges = updateEdgesWithOptimalHandles(nextNodes, nextEdges);
    }

    set({ nodes: nextNodes, edges: nextEdges });

    // If any node was removed, sync to markdown immediately
    const hasRemoval = changes.some((c) => c.type === "remove");
    if (hasRemoval) {
      get().syncToMarkdown(nextNodes, nextEdges);
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

  setDefaultArrowType: (defaultArrowType) => {
    set({ defaultArrowType });
    get().syncToMarkdown(get().nodes, get().edges);
  },

  setDefaultRoutingType: (defaultRoutingType) => {
    set({ defaultRoutingType });
    get().syncToMarkdown(get().nodes, get().edges);
  },

  updateEdgeArrowType: (edgeId, arrowType, routingType) => {
    const nextEdges = get().edges.map((e) => {
      if (e.id === edgeId) {
        return {
          ...e,
          data: {
            ...e.data,
            arrowType,
            routingType: routingType ?? (e.data?.routingType as FlowEdgeRoutingType) ?? "bezier",
            isTotal: arrowType === "thick",
          },
        };
      }
      return e;
    });

    set({ edges: nextEdges });
    get().syncToMarkdown(get().nodes, nextEdges);
  },

  setAllEdgesArrowType: (arrowType, routingType) => {
    const nextRouting = routingType ?? get().defaultRoutingType ?? "bezier";
    const nextEdges = get().edges.map((e) => ({
      ...e,
      data: {
        ...e.data,
        arrowType,
        routingType: nextRouting,
        isTotal: arrowType === "thick",
      },
    }));

    set({
      defaultArrowType: arrowType,
      defaultRoutingType: nextRouting,
      edges: nextEdges,
    });
    get().syncToMarkdown(get().nodes, nextEdges);
  },

  deleteEdge: (id: string) => {
    const nextEdges = get().edges.filter((e) => e.id !== id);
    set({ edges: nextEdges });
    get().syncToMarkdown(get().nodes, nextEdges);
  },

  addConnectedNode: (newNode: ChenNode, newEdge: ChenEdge) => {
    const nextNodes = get().nodes.concat(newNode);
    const sourceNode = nextNodes.find((n) => n.id === newEdge.source);
    const targetNode = nextNodes.find((n) => n.id === newEdge.target);
    const defaultArrow = get().defaultArrowType;
    const defaultRouting = get().defaultRoutingType;
    const arrow = newEdge.data?.arrowType || defaultArrow;
    let edgeToAdd: ChenEdge = {
      ...newEdge,
      type: "chen",
      data: {
        ...newEdge.data,
        arrowType: arrow,
        routingType: newEdge.data?.routingType || defaultRouting,
        isTotal: arrow === "thick",
      },
      markerEnd: newEdge.markerEnd || {
        type: MarkerType.ArrowClosed,
        width: 15,
        height: 15,
      },
    };
    if (sourceNode && targetNode) {
      const handles = getOptimalHandles(sourceNode, targetNode);
      edgeToAdd = {
        ...edgeToAdd,
        sourceHandle: handles.sourceHandle,
        targetHandle: handles.targetHandle,
      };
    }
    const nextEdges = get().edges.concat(edgeToAdd);
    set({ nodes: nextNodes, edges: nextEdges });
    get().syncToMarkdown(nextNodes, nextEdges);
  },

  addEdgeConnection: (newEdge: ChenEdge) => {
    const nodes = get().nodes;
    const sourceNode = nodes.find((n) => n.id === newEdge.source);
    const targetNode = nodes.find((n) => n.id === newEdge.target);
    const defaultArrow = get().defaultArrowType;
    const defaultRouting = get().defaultRoutingType;
    const arrow = newEdge.data?.arrowType || defaultArrow;
    let edgeToAdd: ChenEdge = {
      ...newEdge,
      type: "chen",
      data: {
        ...newEdge.data,
        arrowType: arrow,
        routingType: newEdge.data?.routingType || defaultRouting,
        isTotal: arrow === "thick",
      },
      markerEnd: newEdge.markerEnd || {
        type: MarkerType.ArrowClosed,
        width: 15,
        height: 15,
      },
    };
    if (sourceNode && targetNode) {
      const handles = getOptimalHandles(sourceNode, targetNode);
      edgeToAdd = {
        ...edgeToAdd,
        sourceHandle: handles.sourceHandle,
        targetHandle: handles.targetHandle,
      };
    }
    const nextEdges = get().edges.concat(edgeToAdd);
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
      state.defaultArrowType,
      state.defaultRoutingType,
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
      state.defaultArrowType,
      state.defaultRoutingType,
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
        parsed.defaultArrowType ?? state.defaultArrowType,
        parsed.defaultRoutingType ?? state.defaultRoutingType,
      );
      set({
        nodes: nodesWithSelection,
        edges: parsed.edges,
        defaultArrowType: parsed.defaultArrowType ?? state.defaultArrowType,
        defaultRoutingType: parsed.defaultRoutingType ?? state.defaultRoutingType,
        lastSyncedMarkdown: content,
        lastFingerprint: fingerprint,
      });
      return true;
    }

    return false;
  },
}));
