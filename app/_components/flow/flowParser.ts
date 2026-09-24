import type {
  ChenNode,
  ChenEdge,
  ChenNodeType,
  FlowLayoutDirection,
  FlowEdgeArrowType,
  FlowEdgeRoutingType,
} from "./types";
import { MarkerType } from "@xyflow/react";

export interface ParsedFlowResult {
  nodes: ChenNode[];
  edges: ChenEdge[];
  hasFlowDefinitions: boolean;
  defaultArrowType?: FlowEdgeArrowType;
  defaultRoutingType?: FlowEdgeRoutingType;
}

export const DEFAULT_FLOW_EXAMPLE = ``;

let measurementCanvas: HTMLCanvasElement | null = null;
let measurementCtx: CanvasRenderingContext2D | null = null;

export function measureExactTextWidth(
  text: string,
  font = "500 12px Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
): number {
  const lines = (text || "").split(/\r?\n/);
  let maxW = 0;

  if (typeof document !== "undefined") {
    try {
      if (!measurementCanvas) {
        measurementCanvas = document.createElement("canvas");
        measurementCtx = measurementCanvas.getContext("2d");
      }
      if (measurementCtx) {
        measurementCtx.font = font;
        for (const line of lines) {
          const w = measurementCtx.measureText(line.trim()).width;
          if (w > maxW) maxW = w;
        }
        if (maxW > 0) return maxW;
      }
    } catch {
      // Fallback to heuristic below
    }
  }

  for (const line of lines) {
    let width = 0;
    for (const ch of line.trim()) {
      if (/[il.,' !:;|\\]/.test(ch)) width += 3.2;
      else if (/[frtj -]/.test(ch)) width += 4.5;
      else if (/[mwMW_@#%&]/.test(ch)) width += 9.5;
      else if (/[A-Z]/.test(ch)) width += 7.5;
      else width += 6.2;
    }
    if (width > maxW) maxW = width;
  }
  return maxW;
}

/**
 * Computes node width and height:
 * - WIDTH tightly fits text with no extra side spaces
 * - HEIGHT maintains comfortable standard flowchart height (does not shrink height)
 */
export function computeNodeDimensions(
  type: ChenNodeType | string,
  label: string
): { width: number; height: number } {
  const lines = (label || "").split(/\r?\n/);
  const lineCount = Math.max(1, lines.length);

  // Additional height if there are multiple lines of text
  const extraHeight = Math.max(0, (lineCount - 1) * 18);
  // Exact pixel width of text
  const textWidth = Math.ceil(measureExactTextWidth(label));

  if (type === "terminator") {
    // Pill / stadium shape: standard 48px height, curved ends (rx = 24px)
    const width = Math.max(50, textWidth + 34);
    const height = 48 + extraHeight;
    return { width, height };
  }

  if (type === "decision" || type === "relationship" || type === "identifyingRelationship") {
    // Diamond shape: standard 54px height, angled corners
    const width = Math.max(56, Math.round(textWidth * 1.25 + 24));
    const height = 54 + extraHeight;
    return { width, height };
  }

  if (type === "database" || type === "storedData" || type === "internalStorage") {
    // Cylinder shape: standard 52px height
    const width = Math.max(40, textWidth + 16);
    const height = 52 + extraHeight;
    return { width, height };
  }

  if (type === "data" || type === "manualInput") {
    // Parallelogram shape: standard 48px height
    const width = Math.max(40, textWidth + 18);
    const height = 48 + extraHeight;
    return { width, height };
  }

  if (type === "subroutine" || type === "preparation") {
    // Standard 48px height
    const width = Math.max(40, textWidth + 18);
    const height = 48 + extraHeight;
    return { width, height };
  }

  if (type === "document" || type === "multidocument") {
    // Standard 50px height
    const width = Math.max(40, textWidth + 16);
    const height = 50 + extraHeight;
    return { width, height };
  }

  if (type === "attribute" || type === "keyAttribute" || type === "multivaluedAttribute") {
    // Oval attribute: standard 40px height
    const width = Math.max(30, textWidth + 12);
    const height = 40 + extraHeight;
    return { width, height };
  }

  // Default process, entity, weakEntity, and generic rectangle shapes:
  // Standard 48px height, width tightly hugging the text (only 8px padding total)
  const width = Math.max(30, textWidth + 8);
  const height = 48 + extraHeight;
  return { width, height };
}

interface RawNode {
  id: string;
  label: string;
  type: ChenNodeType;
  color?: string;
}

interface RawEdge {
  sourceId: string;
  targetId: string;
  label?: string;
  arrowType?: FlowEdgeArrowType;
  routingType?: FlowEdgeRoutingType;
}

/**
 * Parses a raw token like "[Process] #blue", "<Decision>", "[(Database)]", "(Start)" into label, shape type, and optional color
 */
function parseNodeToken(rawToken: string): { label: string; type: ChenNodeType; color?: string } {
  let token = rawToken.trim();
  let color: string | undefined = undefined;

  // Check for trailing #color e.g. [Process] #blue or (Start) #3b82f6
  const trailingColorMatch = token.match(/\s+#([a-zA-Z0-9_-]+)\s*$/);
  if (trailingColorMatch) {
    color = trailingColorMatch[1];
    token = token.slice(0, trailingColorMatch.index).trim();
  }

  // Helper to extract inner color like [Process | blue] or [Process: blue]
  const extractInnerColor = (rawLabel: string) => {
    let lbl = rawLabel.trim();
    if (!color) {
      if (lbl.includes("|")) {
        const parts = lbl.split("|");
        lbl = parts[0].trim();
        color = parts[1].trim().replace(/^#/, "");
      } else {
        const colonMatch = lbl.match(/^(.+?):\s*([a-zA-Z]+|#[0-9a-fA-F]{3,8})$/);
        if (colonMatch) {
          lbl = colonMatch[1].trim();
          color = colonMatch[2].trim().replace(/^#/, "");
        }
      }
    }
    return lbl;
  };

  // [(Database)] -> cylinder database
  if (token.startsWith("[(") && token.endsWith(")]")) {
    return { label: extractInnerColor(token.slice(2, -2)), type: "database", color };
  }
  // [[Subroutine]] -> subroutine
  if (token.startsWith("[[") && token.endsWith("]]")) {
    return { label: extractInnerColor(token.slice(2, -2)), type: "subroutine", color };
  }
  // [/Data/] or [\Data\] -> data/io
  if ((token.startsWith("[/") && token.endsWith("/]")) || (token.startsWith("[\x5C") && token.endsWith("\x5C]"))) {
    return { label: extractInnerColor(token.slice(2, -2)), type: "data", color };
  }
  // ([Terminator]) or (Terminator) -> terminator (pill)
  if (token.startsWith("([") && token.endsWith("])")) {
    return { label: extractInnerColor(token.slice(2, -2)), type: "terminator", color };
  }
  if (token.startsWith("(") && token.endsWith(")")) {
    return { label: extractInnerColor(token.slice(1, -1)), type: "terminator", color };
  }
  // <Decision> or {Decision} -> decision (diamond)
  if (token.startsWith("<") && token.endsWith(">")) {
    return { label: extractInnerColor(token.slice(1, -1)), type: "decision", color };
  }
  if (token.startsWith("{") && token.endsWith("}")) {
    return { label: extractInnerColor(token.slice(1, -1)), type: "decision", color };
  }
  // [Process] -> process (rectangle)
  if (token.startsWith("[") && token.endsWith("]")) {
    return { label: extractInnerColor(token.slice(1, -1)), type: "process", color };
  }

  // Plain word heuristics (e.g. Start, End, Is Valid?)
  const lower = token.toLowerCase();
  if (lower === "start" || lower === "end" || lower === "stop") {
    return { label: token, type: "terminator", color };
  }
  if (token.endsWith("?")) {
    return { label: token, type: "decision", color };
  }

  return { label: extractInnerColor(token), type: "process", color };
}

/**
 * Normalizes label to a stable unique node ID
 */
function normalizeId(label: string): string {
  const slug = label
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `node-${slug || "shape"}`;
}

/**
 * Calculates optimal source and target handles based on relative geometric orientation.
 * Rotates connection handles seamlessly as nodes are dragged around each other:
 * - If target is to the right of source: exit source Right -> enter target Left (arrow points right)
 * - If target is below source: exit source Bottom -> enter target Top (arrow points down)
 * - If target is to the left of source: exit source Left -> enter target Right (arrow points left)
 * - If target is above source: exit source Top -> enter target Bottom (arrow points up)
 */
export function getOptimalHandles(
  sourceNode: {
    id?: string;
    position?: { x: number; y: number };
    width?: number;
    height?: number;
    style?: Record<string, any>;
  },
  targetNode: {
    id?: string;
    position?: { x: number; y: number };
    width?: number;
    height?: number;
    style?: Record<string, any>;
  }
): { sourceHandle: string; targetHandle: string } {
  // Self connection loopback
  if (sourceNode.id && targetNode.id && sourceNode.id === targetNode.id) {
    return {
      sourceHandle: "right-source",
      targetHandle: "top-target",
    };
  }

  const sourcePos = sourceNode.position || { x: 0, y: 0 };
  const targetPos = targetNode.position || { x: 0, y: 0 };

  const sourceW = Number(sourceNode.width ?? sourceNode.style?.width) || 120;
  const sourceH = Number(sourceNode.height ?? sourceNode.style?.height) || 48;
  const targetW = Number(targetNode.width ?? targetNode.style?.width) || 120;
  const targetH = Number(targetNode.height ?? targetNode.style?.height) || 48;

  // Center coordinates of both nodes
  const scx = sourcePos.x + sourceW / 2;
  const scy = sourcePos.y + sourceH / 2;
  const tcx = targetPos.x + targetW / 2;
  const tcy = targetPos.y + targetH / 2;

  const dx = tcx - scx;
  const dy = tcy - scy;

  // Scale dx and dy by half-dimensions to make corner transitions diagonal (aspect-ratio aware)
  const halfW = Math.max(1, (sourceW + targetW) / 4);
  const halfH = Math.max(1, (sourceH + targetH) / 4);

  const nx = dx / halfW;
  const ny = dy / halfH;
  const angle = Math.atan2(ny, nx);

  // 4 quadrants:
  // Right (-45° to +45°): Child is to the RIGHT of main node -> exit Right, enter Left
  // Bottom (+45° to +135°): Child is BELOW main node -> exit Bottom, enter Top
  // Top (-135° to -45°): Child is ABOVE main node -> exit Top, enter Bottom
  // Left: Child is to the LEFT of main node -> exit Left, enter Right
  if (angle >= -Math.PI / 4 && angle < Math.PI / 4) {
    return {
      sourceHandle: "right-source",
      targetHandle: "left-target",
    };
  } else if (angle >= Math.PI / 4 && angle < (3 * Math.PI) / 4) {
    return {
      sourceHandle: "bottom-source",
      targetHandle: "top-target",
    };
  } else if (angle >= (-3 * Math.PI) / 4 && angle < -Math.PI / 4) {
    return {
      sourceHandle: "top-source",
      targetHandle: "bottom-target",
    };
  } else {
    return {
      sourceHandle: "left-source",
      targetHandle: "right-target",
    };
  }
}

/**
 * Updates all edges with dynamic optimal handles matching current node coordinates.
 * Returns the original edge array reference if no handles changed to prevent re-renders.
 */
export function updateEdgesWithOptimalHandles(
  nodes: ChenNode[],
  edges: ChenEdge[]
): ChenEdge[] {
  if (!nodes || nodes.length === 0 || !edges || edges.length === 0) {
    return edges;
  }

  const nodeMap = new Map<string, ChenNode>();
  for (const n of nodes) {
    nodeMap.set(n.id, n);
  }

  let anyChanged = false;
  const nextEdges = edges.map((edge) => {
    const sourceNode = nodeMap.get(edge.source);
    const targetNode = nodeMap.get(edge.target);
    if (!sourceNode || !targetNode) return edge;

    const { sourceHandle, targetHandle } = getOptimalHandles(sourceNode, targetNode);
    if (edge.sourceHandle === sourceHandle && edge.targetHandle === targetHandle) {
      return edge;
    }

    anyChanged = true;
    return {
      ...edge,
      sourceHandle,
      targetHandle,
    };
  });

  return anyChanged ? nextEdges : edges;
}

/**
 * Auto-formats and positions nodes and edges as a clean, readable hierarchical tree (TB or LR)
 */
export function layoutNodesAndEdges(
  nodes: ChenNode[],
  edges: ChenEdge[],
  direction: FlowLayoutDirection = "TB",
  nodeSpacing: number = 60
): { nodes: ChenNode[]; edges: ChenEdge[] } {
  if (nodes.length === 0) {
    return { nodes: [], edges: [] };
  }

  // 1. Map dimensions and build graph adjacency
  const nodeMap = new Map<string, ChenNode>();
  const nodeDims = new Map<string, { width: number; height: number }>();
  const childrenMap = new Map<string, string[]>();
  const parentsMap = new Map<string, string[]>();

  for (const node of nodes) {
    nodeMap.set(node.id, node);
    const d = computeNodeDimensions(node.type, (node.data?.label as string) || "");
    const width = node.width || d.width;
    const height = node.height || d.height;
    nodeDims.set(node.id, { width, height });
    childrenMap.set(node.id, []);
    parentsMap.set(node.id, []);
  }

  // Filter valid edges connecting known nodes
  const validEdges = edges.filter(
    (e) => nodeMap.has(e.source) && nodeMap.has(e.target) && e.source !== e.target
  );

  for (const edge of validEdges) {
    if (!childrenMap.get(edge.source)!.includes(edge.target)) {
      childrenMap.get(edge.source)!.push(edge.target);
    }
    if (!parentsMap.get(edge.target)!.includes(edge.source)) {
      parentsMap.get(edge.target)!.push(edge.source);
    }
  }

  // 2. Break cycles using DFS to identify feedback edges
  const visited = new Set<string>();
  const recursionStack = new Set<string>();
  const feedbackEdges = new Set<string>();

  function detectCycles(nodeId: string) {
    visited.add(nodeId);
    recursionStack.add(nodeId);

    const children = childrenMap.get(nodeId) || [];
    for (const childId of children) {
      if (recursionStack.has(childId)) {
        feedbackEdges.add(`${nodeId}->${childId}`);
      } else if (!visited.has(childId)) {
        detectCycles(childId);
      }
    }

    recursionStack.delete(nodeId);
  }

  for (const node of nodes) {
    if (!visited.has(node.id)) {
      detectCycles(node.id);
    }
  }

  // Clean tree graph without feedback edges for hierarchy depth calculation
  const cleanChildren = new Map<string, string[]>();
  const cleanParents = new Map<string, string[]>();
  const inDegree = new Map<string, number>();

  for (const node of nodes) {
    cleanChildren.set(node.id, []);
    cleanParents.set(node.id, []);
    inDegree.set(node.id, 0);
  }

  for (const edge of validEdges) {
    if (!feedbackEdges.has(`${edge.source}->${edge.target}`)) {
      cleanChildren.get(edge.source)!.push(edge.target);
      cleanParents.get(edge.target)!.push(edge.source);
      inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1);
    }
  }

  // 3. Find root nodes (inDegree === 0)
  const roots: string[] = [];
  for (const [id, deg] of inDegree.entries()) {
    if (deg === 0) roots.push(id);
  }
  if (roots.length === 0 && nodes.length > 0) {
    roots.push(nodes[0].id);
  }

  // 4. Assign ranks (layers) using longest-path layering
  const nodeLayer = new Map<string, number>();
  for (const root of roots) {
    nodeLayer.set(root, 0);
  }

  let changed = true;
  let iterations = 0;
  while (changed && iterations < nodes.length * 2) {
    changed = false;
    iterations++;
    for (const edge of validEdges) {
      if (!feedbackEdges.has(`${edge.source}->${edge.target}`)) {
        const srcLayer = nodeLayer.get(edge.source) ?? 0;
        const tgtLayer = nodeLayer.get(edge.target) ?? 0;
        if (tgtLayer <= srcLayer) {
          nodeLayer.set(edge.target, srcLayer + 1);
          changed = true;
        }
      }
    }
  }

  // Fallback for any disconnected nodes
  for (const node of nodes) {
    if (!nodeLayer.has(node.id)) {
      nodeLayer.set(node.id, 0);
    }
  }

  // 5. Group nodes by layer
  const layerGroups = new Map<number, string[]>();
  for (const [id, layer] of nodeLayer.entries()) {
    if (!layerGroups.has(layer)) layerGroups.set(layer, []);
    layerGroups.get(layer)!.push(id);
  }

  const sortedLayers = Array.from(layerGroups.keys()).sort((a, b) => a - b);

  // 6. Tree-aware ordering within each layer based on parent positions
  for (let i = 1; i < sortedLayers.length; i++) {
    const layer = sortedLayers[i];
    const prevLayer = sortedLayers[i - 1];
    const prevOrder = new Map(layerGroups.get(prevLayer)!.map((id, idx) => [id, idx]));

    layerGroups.get(layer)!.sort((a, b) => {
      const parentsA = cleanParents.get(a) || [];
      const parentsB = cleanParents.get(b) || [];
      const avgA =
        parentsA.length > 0
          ? parentsA.reduce((sum, p) => sum + (prevOrder.get(p) ?? 0), 0) / parentsA.length
          : 999;
      const avgB =
        parentsB.length > 0
          ? parentsB.reduce((sum, p) => sum + (prevOrder.get(p) ?? 0), 0) / parentsB.length
          : 999;
      return avgA - avgB;
    });
  }

  // 7. Calculate Coordinates (Tree Layout)
  const isTB = direction === "TB";
  const siblingGap = Math.max(16, nodeSpacing);
  const layerGap = Math.max(24, Math.round(nodeSpacing * 1.2));

  const getPrimaryDim = (id: string) => {
    const d = nodeDims.get(id)!;
    return isTB ? d.width : d.height;
  };
  const getSecondaryDim = (id: string) => {
    const d = nodeDims.get(id)!;
    return isTB ? d.height : d.width;
  };

  // Bottom-up subtree span calculation
  const subtreeSpan = new Map<string, number>();

  function computeSubtreeSpan(nodeId: string, visitedNodes: Set<string>): number {
    if (visitedNodes.has(nodeId)) {
      return getPrimaryDim(nodeId);
    }
    visitedNodes.add(nodeId);

    const children = (cleanChildren.get(nodeId) || []).filter(
      (c) => (nodeLayer.get(c) ?? 0) > (nodeLayer.get(nodeId) ?? 0)
    );

    if (children.length === 0) {
      const span = getPrimaryDim(nodeId);
      subtreeSpan.set(nodeId, span);
      return span;
    }

    let childrenTotal = 0;
    for (let i = 0; i < children.length; i++) {
      childrenTotal += computeSubtreeSpan(children[i], visitedNodes);
      if (i > 0) childrenTotal += siblingGap;
    }

    const span = Math.max(getPrimaryDim(nodeId), childrenTotal);
    subtreeSpan.set(nodeId, span);
    return span;
  }

  const visitedForSpan = new Set<string>();
  for (const root of roots) {
    computeSubtreeSpan(root, visitedForSpan);
  }
  for (const node of nodes) {
    if (!subtreeSpan.has(node.id)) {
      subtreeSpan.set(node.id, getPrimaryDim(node.id));
    }
  }

  // Top-down position assignment
  const primaryPos = new Map<string, number>();
  const visitedForPos = new Set<string>();

  function assignPositions(nodeId: string, startPrimary: number, availableSpan: number) {
    if (visitedForPos.has(nodeId)) return;
    visitedForPos.add(nodeId);

    const myDim = getPrimaryDim(nodeId);
    const center = startPrimary + availableSpan / 2;
    primaryPos.set(nodeId, center - myDim / 2);

    const children = (cleanChildren.get(nodeId) || []).filter(
      (c) => (nodeLayer.get(c) ?? 0) > (nodeLayer.get(nodeId) ?? 0)
    );

    if (children.length === 0) return;

    const childSpans = children.map((c) => subtreeSpan.get(c) || getPrimaryDim(c));
    const totalChildSpan =
      childSpans.reduce((a, b) => a + b, 0) + (children.length - 1) * siblingGap;

    let childStart = center - totalChildSpan / 2;

    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      const span = childSpans[i];
      assignPositions(child, childStart, span);
      childStart += span + siblingGap;
    }
  }

  let currentTreeStart = 80;
  for (const root of roots) {
    const rootSpan = subtreeSpan.get(root) || getPrimaryDim(root);
    assignPositions(root, currentTreeStart, rootSpan);
    currentTreeStart += rootSpan + siblingGap * 1.5;
  }

  for (const node of nodes) {
    if (!primaryPos.has(node.id)) {
      const span = getPrimaryDim(node.id);
      primaryPos.set(node.id, currentTreeStart);
      currentTreeStart += span + siblingGap;
    }
  }

  // 8. Overlap elimination pass across each layer
  for (const layer of sortedLayers) {
    const layerNodes = layerGroups.get(layer) || [];
    layerNodes.sort((a, b) => (primaryPos.get(a) ?? 0) - (primaryPos.get(b) ?? 0));

    for (let i = 1; i < layerNodes.length; i++) {
      const prevId = layerNodes[i - 1];
      const currId = layerNodes[i];
      const prevEnd = (primaryPos.get(prevId) ?? 0) + getPrimaryDim(prevId) + siblingGap;
      const currStart = primaryPos.get(currId) ?? 0;

      if (currStart < prevEnd) {
        const shift = prevEnd - currStart;
        primaryPos.set(currId, prevEnd);

        // Propagate shift to descendants to preserve tree shape
        const descQueue = [...(cleanChildren.get(currId) || [])];
        const shiftedDesc = new Set<string>();
        while (descQueue.length > 0) {
          const desc = descQueue.shift()!;
          if (!shiftedDesc.has(desc)) {
            shiftedDesc.add(desc);
            primaryPos.set(desc, (primaryPos.get(desc) ?? 0) + shift);
            descQueue.push(...(cleanChildren.get(desc) || []));
          }
        }
      }
    }
  }

  // 9. Bottom-up parent recentering pass to keep parents centered over their children
  for (let l = sortedLayers.length - 2; l >= 0; l--) {
    const layer = sortedLayers[l];
    const layerNodes = layerGroups.get(layer) || [];
    for (const parentId of layerNodes) {
      const children = (cleanChildren.get(parentId) || []).filter(
        (c) => (nodeLayer.get(c) ?? 0) === (nodeLayer.get(parentId) ?? 0) + 1
      );
      if (children.length > 0) {
        const firstChildPos = primaryPos.get(children[0]) ?? 0;
        const lastChild = children[children.length - 1];
        const lastChildPos = primaryPos.get(lastChild) ?? 0;
        const lastChildDim = getPrimaryDim(lastChild);
        const childrenCenter = (firstChildPos + (lastChildPos + lastChildDim)) / 2;
        const myDim = getPrimaryDim(parentId);
        primaryPos.set(parentId, Math.round(childrenCenter - myDim / 2));
      }
    }

    layerNodes.sort((a, b) => (primaryPos.get(a) ?? 0) - (primaryPos.get(b) ?? 0));
    for (let i = 1; i < layerNodes.length; i++) {
      const prevId = layerNodes[i - 1];
      const currId = layerNodes[i];
      const prevEnd = (primaryPos.get(prevId) ?? 0) + getPrimaryDim(prevId) + siblingGap;
      if ((primaryPos.get(currId) ?? 0) < prevEnd) {
        primaryPos.set(currId, prevEnd);
      }
    }
  }

  // 10. Converging node alignment: re-center multi-parent nodes between their parents
  for (const layer of sortedLayers) {
    const layerNodes = layerGroups.get(layer) || [];
    for (let i = 0; i < layerNodes.length; i++) {
      const id = layerNodes[i];
      const parents = cleanParents.get(id) || [];
      if (parents.length > 1) {
        const parentCenters = parents.map((p) => {
          const pos = primaryPos.get(p) ?? 0;
          return pos + getPrimaryDim(p) / 2;
        });
        const targetCenter =
          parentCenters.reduce((a, b) => a + b, 0) / parentCenters.length;
        const myDim = getPrimaryDim(id);
        const desiredPos = targetCenter - myDim / 2;

        const prevEnd =
          i > 0
            ? (primaryPos.get(layerNodes[i - 1]) ?? 0) + getPrimaryDim(layerNodes[i - 1]) + siblingGap
            : -Infinity;
        const nextStart =
          i < layerNodes.length - 1
            ? (primaryPos.get(layerNodes[i + 1]) ?? 0) - siblingGap - myDim
            : Infinity;

        if (desiredPos >= prevEnd && desiredPos <= nextStart) {
          primaryPos.set(id, Math.round(desiredPos));
        }
      }
    }
  }

  // 11. Assign secondary coordinates (Y for TB, X for LR) based on layer
  const secondaryPos = new Map<number, number>();
  const maxSecondaryInLayer = new Map<number, number>();
  let currentSecondary = 80;

  for (const layer of sortedLayers) {
    const layerNodes = layerGroups.get(layer) || [];
    const maxSecDim = Math.max(
      ...layerNodes.map((id) => getSecondaryDim(id)),
      48
    );
    maxSecondaryInLayer.set(layer, maxSecDim);
    secondaryPos.set(layer, currentSecondary);
    currentSecondary += maxSecDim + layerGap;
  }

  // 12. Normalize coordinates so minimum X and Y start cleanly at (80, 80)
  let minPrimary = Infinity;
  for (const pos of primaryPos.values()) {
    if (pos < minPrimary) minPrimary = pos;
  }
  const primaryOffset = 80 - (isFinite(minPrimary) ? minPrimary : 0);

  const updatedNodes: ChenNode[] = nodes.map((node) => {
    const layer = nodeLayer.get(node.id) ?? 0;
    const prim = (primaryPos.get(node.id) ?? 0) + primaryOffset;
    const rowMax = maxSecondaryInLayer.get(layer) || 48;
    const dims = nodeDims.get(node.id)!;
    const mySecDim = isTB ? dims.height : dims.width;
    const sec = (secondaryPos.get(layer) ?? 80) + Math.round((rowMax - mySecDim) / 2);

    const x = Math.round(isTB ? prim : sec);
    const y = Math.round(isTB ? sec : prim);

    return {
      ...node,
      position: { x, y },
      width: dims.width,
      height: dims.height,
      style: { ...(node.style || {}), width: dims.width, height: dims.height },
    };
  });

  // 13. Dynamically compute optimal handles for every edge
  const updatedEdges = updateEdgesWithOptimalHandles(updatedNodes, edges);

  return { nodes: updatedNodes, edges: updatedEdges };
}

/**
 * Parses markdown/text content into nodes and edges for React Flow
 */
export function parseFlowFromMarkdown(
  content: string,
  existingPositions?: Map<string, { x: number; y: number }>,
  defaultDirection: FlowLayoutDirection = "TB",
  nodeSpacing: number = 60
): ParsedFlowResult {
  if (!content || !content.trim()) {
    return { nodes: [], edges: [], hasFlowDefinitions: false };
  }

  const lines = content.split("\n");
  const rawNodesMap = new Map<string, RawNode>();
  const rawEdges: RawEdge[] = [];
  let foundAnyFlowSyntax = false;
  let detectedDirection: FlowLayoutDirection = defaultDirection;
  let detectedDefaultArrow: FlowEdgeArrowType = "directed";
  let detectedRouting: FlowEdgeRoutingType = "bezier";

  // Regex for arrows with optional label
  // Matches: <-- label --> | <--> | -- label --> | --> |label| | --> | -- label -> | -> |label| | -> | == label ==> | ==> | -. label .-> | -.-> | -.- label -.- | -.- | -- label --- | --- | --
  const ARROW_PATTERN =
    /\s*(?:<--\s*([^->\n|]+?)\s*-->|<-->|--\s*([^->\n|]+?)\s*-->|-->\s*\|([^|\n]+)\||-->|--\s*([^->\n|]+?)\s*->|->\s*\|([^|\n]+)\||->|==\s*([^=\n|]+?)\s*==>|==>|-\.\s*([^.\n|]+?)\s*\.->|-\.->|-.-|-+\s*([^->\n|]+?)\s*-+|---+|--)\s*/;

  function detectArrowType(matchStr: string): FlowEdgeArrowType {
    const s = matchStr.trim();
    if (s.startsWith("<") || s.includes("<-->") || s.includes("<--")) {
      return "bidirectional";
    }
    if (s.includes("==>") || s.startsWith("==")) {
      return "thick";
    }
    if (s.includes("-.->") || (s.includes("-.") && s.includes(".->"))) {
      return "dashed";
    }
    if (s.includes("-.-")) {
      return "dashedLine";
    }
    if (s.includes("---") || (s.startsWith("--") && s.endsWith("---"))) {
      return "line";
    }
    return "directed";
  }

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || trimmed.startsWith("//") || trimmed.startsWith("/*")) {
      continue;
    }

    // Check for comment directives like %% routing: smoothstep or %% arrowType: dashed
    if (trimmed.startsWith("%%")) {
      const directiveMatch = trimmed.match(/^%%\s*(routing|arrowType|arrow):\s*([a-zA-Z_-]+)/i);
      if (directiveMatch) {
        foundAnyFlowSyntax = true;
        const key = directiveMatch[1].toLowerCase();
        const val = directiveMatch[2].toLowerCase();
        if (key === "routing") {
          if (val === "bezier" || val === "smoothstep" || val === "straight") {
            detectedRouting = val;
          }
        } else if (key === "arrowtype" || key === "arrow") {
          if (
            val === "directed" ||
            val === "bidirectional" ||
            val === "line" ||
            val === "dashed" ||
            val === "dashedline" ||
            val === "thick"
          ) {
            detectedDefaultArrow = val === "dashedline" ? "dashedLine" : (val as FlowEdgeArrowType);
          }
        }
      }
      continue;
    }

    const lower = trimmed.toLowerCase();
    if (
      lower.startsWith("flowchart lr") ||
      lower.startsWith("graph lr") ||
      lower === "direction lr"
    ) {
      detectedDirection = "LR";
      foundAnyFlowSyntax = true;
      continue;
    }
    if (
      lower.startsWith("flowchart td") ||
      lower.startsWith("flowchart tb") ||
      lower.startsWith("graph td") ||
      lower.startsWith("graph tb") ||
      lower === "direction td" ||
      lower === "direction tb"
    ) {
      detectedDirection = "TB";
      foundAnyFlowSyntax = true;
      continue;
    }

    // Extract inline routing directive from line if present, e.g. %% routing:smoothstep
    let lineRouting: FlowEdgeRoutingType | undefined = undefined;
    const inlineRoutingMatch = trimmed.match(/%%\s*routing:\s*([a-zA-Z_-]+)/i);
    let lineContent = trimmed;
    if (inlineRoutingMatch) {
      const r = inlineRoutingMatch[1].toLowerCase();
      if (r === "bezier" || r === "smoothstep" || r === "straight") {
        lineRouting = r;
      }
      lineContent = trimmed.slice(0, inlineRoutingMatch.index).trim();
    }

    // Check if line contains an arrow connection
    if (ARROW_PATTERN.test(lineContent)) {
      foundAnyFlowSyntax = true;

      // Extract parts and separator matches
      let remaining = lineContent;
      const chainNodes: string[] = [];
      const chainEdgeLabels: (string | undefined)[] = [];
      const chainEdgeArrowTypes: FlowEdgeArrowType[] = [];

      while (true) {
        const match = ARROW_PATTERN.exec(remaining);
        if (!match) {
          if (remaining.trim()) {
            chainNodes.push(remaining.trim());
          }
          break;
        }

        const before = remaining.slice(0, match.index).trim();
        if (before) {
          chainNodes.push(before);
        }

        // Label could be in any capture group
        const label = match.slice(1).find((g) => Boolean(g));
        chainEdgeLabels.push(label ? label.trim() : undefined);
        chainEdgeArrowTypes.push(detectArrowType(match[0]));

        remaining = remaining.slice(match.index + match[0].length);
      }

      // Register nodes and connect along the chain
      for (let i = 0; i < chainNodes.length; i++) {
        const token = chainNodes[i];
        const { label, type, color } = parseNodeToken(token);
        const id = normalizeId(label);

        if (!rawNodesMap.has(id)) {
          rawNodesMap.set(id, { id, label, type, color });
        } else if (color) {
          rawNodesMap.get(id)!.color = color;
        }

        if (i < chainNodes.length - 1) {
          const nextToken = chainNodes[i + 1];
          const { label: nextLabel, type: nextType, color: nextColor } = parseNodeToken(nextToken);
          const nextId = normalizeId(nextLabel);

          if (!rawNodesMap.has(nextId)) {
            rawNodesMap.set(nextId, { id: nextId, label: nextLabel, type: nextType, color: nextColor });
          } else if (nextColor) {
            rawNodesMap.get(nextId)!.color = nextColor;
          }

          rawEdges.push({
            sourceId: id,
            targetId: nextId,
            label: chainEdgeLabels[i],
            arrowType: chainEdgeArrowTypes[i] || detectedDefaultArrow,
            routingType: lineRouting || detectedRouting,
          });
        }
      }
    } else {
      // Check for style directive: style [Process] #blue or style Process blue
      const styleMatch = trimmed.match(/^style\s+(.+?)\s+(?:fill:)?(#?[a-zA-Z0-9_-]+)$/i);
      if (styleMatch) {
        foundAnyFlowSyntax = true;
        const targetToken = styleMatch[1].trim();
        const styleColor = styleMatch[2].trim().replace(/^#/, "");
        const { label } = parseNodeToken(targetToken);
        const id = normalizeId(label);
        if (rawNodesMap.has(id)) {
          rawNodesMap.get(id)!.color = styleColor;
        } else {
          rawNodesMap.set(id, { id, label, type: "process", color: styleColor });
        }
        continue;
      }

      // Check for standalone node like [My Process] #blue or (Start)
      const standaloneMatch = trimmed.match(/^([\[({<].+?[\])}>](?:\s+#[a-zA-Z0-9_-]+)?)\s*$/);
      if (standaloneMatch) {
        foundAnyFlowSyntax = true;
        const { label, type, color } = parseNodeToken(standaloneMatch[1]);
        const id = normalizeId(label);
        if (!rawNodesMap.has(id)) {
          rawNodesMap.set(id, { id, label, type, color });
        } else if (color) {
          rawNodesMap.get(id)!.color = color;
        }
      }
    }
  }

  if (rawNodesMap.size === 0) {
    return { nodes: [], edges: [], hasFlowDefinitions: foundAnyFlowSyntax };
  }

  const initialNodes: ChenNode[] = Array.from(rawNodesMap.values()).map((raw) => {
    const { width, height } = computeNodeDimensions(raw.type, raw.label);
    return {
      id: raw.id,
      type: raw.type,
      position: { x: 0, y: 0 },
      width,
      height,
      style: { width, height },
      data: {
        label: raw.label,
        color: raw.color,
      },
    };
  });

  const initialEdges: ChenEdge[] = rawEdges.map((re, index) => ({
    id: `e-${re.sourceId}-${re.targetId}-${index}`,
    source: re.sourceId,
    target: re.targetId,
    type: "chen",
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: "var(--muted-foreground)",
      width: 15,
      height: 15,
    },
    data: {
      label: re.label || "",
      arrowType: re.arrowType || detectedDefaultArrow,
      routingType: re.routingType || detectedRouting,
    },
  }));

  const layouted = layoutNodesAndEdges(initialNodes, initialEdges, detectedDirection, nodeSpacing);

  // If user has saved/dragged positions, respect them
  if (existingPositions && existingPositions.size > 0) {
    const finalNodes = layouted.nodes.map((n) => {
      if (existingPositions.has(n.id)) {
        return { ...n, position: existingPositions.get(n.id)! };
      }
      return n;
    });

    const finalEdges = updateEdgesWithOptimalHandles(finalNodes, layouted.edges);

    return {
      nodes: finalNodes,
      edges: finalEdges,
      hasFlowDefinitions: true,
      defaultArrowType: detectedDefaultArrow,
      defaultRoutingType: detectedRouting,
    };
  }

  return {
    nodes: layouted.nodes,
    edges: layouted.edges,
    hasFlowDefinitions: true,
    defaultArrowType: detectedDefaultArrow,
    defaultRoutingType: detectedRouting,
  };
}

/**
 * Updates or adds a node color (#color) in the markdown document
 */
export function updateNodeColorInMarkdown(
  content: string,
  nodeLabel: string,
  newColor?: string
): string {
  if (!content || !nodeLabel) return content;

  const escaped = nodeLabel.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  // Matches [Label], (Label), <Label>, etc., optionally with an existing #color
  const pattern = new RegExp(
    `([\\[({<]+${escaped}[\\xy})\\]>]+)(?:\\s+#[a-zA-Z0-9_-]+)?`,
    "g"
  );

  if (newColor && newColor !== "default") {
    const cleanColor = newColor.replace(/^#/, "");
    if (pattern.test(content)) {
      return content.replace(pattern, `$1 #${cleanColor}`);
    } else {
      return `${content.trim()}\n[${nodeLabel}] #${cleanColor}\n`;
    }
  } else {
    // Remove color tag
    return content.replace(pattern, `$1`);
  }
}

/**
 * Converts a node into its bracketed token syntax representation
 */
export function nodeToToken(node: ChenNode, includeColor: boolean = true): string {
  let label = (node.data?.label as string)?.trim() || "Step";
  // Strip outer matching brackets if user typed them into label
  if (
    (label.startsWith("[") && label.endsWith("]")) ||
    (label.startsWith("(") && label.endsWith(")")) ||
    (label.startsWith("{") && label.endsWith("}")) ||
    (label.startsWith("<") && label.endsWith(">"))
  ) {
    label = label.slice(1, -1).trim();
  }

  const type = node.type || "process";
  const color = node.data?.color as string | undefined;
  const colorSuffix =
    includeColor && color && color !== "default"
      ? ` #${color.replace(/^#/, "")}`
      : "";

  let token = `[${label}]`;
  if (type === "terminator") {
    token = `(${label})`;
  } else if (type === "decision") {
    token = `{${label}}`;
  } else if (type === "database") {
    token = `[(${label})]`;
  } else if (type === "subroutine") {
    token = `[[${label}]]`;
  } else if (type === "data") {
    token = `[/${label}/]`;
  } else {
    token = `[${label}]`;
  }

  return `${token}${colorSuffix}`;
}

/**
 * Serializes nodes, edges, and direction back into flowchart markdown syntax.
 * Preserves leading header comments (# Title, // comments) from existing document.
 */
export function serializeFlowToMarkdown(
  nodes: ChenNode[],
  edges: ChenEdge[],
  direction: FlowLayoutDirection = "TB",
  existingContent: string = "",
  defaultArrowType: FlowEdgeArrowType = "directed",
  defaultRoutingType: FlowEdgeRoutingType = "bezier"
): string {
  // Extract leading comment or markdown title lines (# Header, // Comment)
  const headerLines: string[] = [];
  if (existingContent) {
    const lines = existingContent.split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (
        trimmed.startsWith("#") ||
        trimmed.startsWith("//") ||
        trimmed.startsWith("/*")
      ) {
        headerLines.push(line);
      } else if (!trimmed && headerLines.length > 0) {
        headerLines.push(line);
      } else {
        break;
      }
    }
  }

  const headerStr = headerLines.join("\n").trim();

  // If all nodes are removed (e.g. user cleared canvas or deleted all)
  if (nodes.length === 0) {
    return headerStr ? `${headerStr}\n\nflowchart ${direction}\n` : `flowchart ${direction}\n`;
  }

  const outputLines: string[] = [];

  // 1. Add preserved comments/title if any
  if (headerStr) {
    outputLines.push(headerStr);
    outputLines.push("");
  }

  // 2. Direction header and global directives
  outputLines.push(`flowchart ${direction}`);
  if (defaultArrowType && defaultArrowType !== "directed") {
    outputLines.push(`%% arrowType: ${defaultArrowType}`);
  }
  if (defaultRoutingType && defaultRoutingType !== "bezier") {
    outputLines.push(`%% routing: ${defaultRoutingType}`);
  }

  // 3. Connect nodes via edges
  const nodeMap = new Map<string, ChenNode>();
  for (const n of nodes) {
    nodeMap.set(n.id, n);
  }

  const emittedColors = new Set<string>();
  const connectedNodeIds = new Set<string>();

  for (const edge of edges) {
    const sourceNode = nodeMap.get(edge.source);
    const targetNode = nodeMap.get(edge.target);

    if (sourceNode && targetNode) {
      connectedNodeIds.add(sourceNode.id);
      connectedNodeIds.add(targetNode.id);

      const sourceHasColor = !emittedColors.has(sourceNode.id);
      if (sourceHasColor) emittedColors.add(sourceNode.id);

      const targetHasColor = !emittedColors.has(targetNode.id);
      if (targetHasColor) emittedColors.add(targetNode.id);

      const sourceToken = nodeToToken(sourceNode, sourceHasColor);
      const targetToken = nodeToToken(targetNode, targetHasColor);
      const label = (edge.data?.label as string)?.trim();
      const arrowType: FlowEdgeArrowType =
        edge.data?.arrowType || (edge.data?.isTotal ? "thick" : defaultArrowType);

      let arrowToken = "-->";
      if (arrowType === "bidirectional") {
        arrowToken = label ? `<-- ${label} -->` : `<-->`;
      } else if (arrowType === "line") {
        arrowToken = label ? `-- ${label} ---` : `---`;
      } else if (arrowType === "dashed") {
        arrowToken = label ? `-. ${label} .->` : `-.->`;
      } else if (arrowType === "dashedLine") {
        arrowToken = label ? `-. ${label} -.-` : `-.-`;
      } else if (arrowType === "thick") {
        arrowToken = label ? `== ${label} ==>` : `==>`;
      } else {
        arrowToken = label ? `-- ${label} -->` : `-->`;
      }

      // Check if this edge has custom routing that differs from defaultRoutingType
      const edgeRouting = edge.data?.routingType as FlowEdgeRoutingType | undefined;
      let routingComment = "";
      if (edgeRouting && edgeRouting !== defaultRoutingType) {
        routingComment = ` %% routing:${edgeRouting}`;
      }

      outputLines.push(`    ${sourceToken} ${arrowToken} ${targetToken}${routingComment}`);
    }
  }

  // 4. Standalone nodes (nodes not connected to any edge)
  for (const node of nodes) {
    if (!connectedNodeIds.has(node.id)) {
      outputLines.push(`    ${nodeToToken(node, true)}`);
    }
  }

  return outputLines.join("\n") + "\n";
}
