import type { ChenNode, ChenEdge, ChenNodeType } from "./types";
import { MarkerType } from "@xyflow/react";

export interface ParsedFlowResult {
  nodes: ChenNode[];
  edges: ChenEdge[];
  hasFlowDefinitions: boolean;
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
}

interface RawEdge {
  sourceId: string;
  targetId: string;
  label?: string;
}

/**
 * Parses a raw token like "[Process]", "<Decision>", "[(Database)]", "(Start)" into label and shape type
 */
function parseNodeToken(rawToken: string): { label: string; type: ChenNodeType } {
  const token = rawToken.trim();

  // [(Database)] -> cylinder database
  if (token.startsWith("[(") && token.endsWith(")]")) {
    return { label: token.slice(2, -2).trim(), type: "database" };
  }
  // [[Subroutine]] -> subroutine
  if (token.startsWith("[[") && token.endsWith("]]")) {
    return { label: token.slice(2, -2).trim(), type: "subroutine" };
  }
  // [/Data/] or [\Data\] -> data/io
  if ((token.startsWith("[/") && token.endsWith("/]")) || (token.startsWith("[\x5C") && token.endsWith("\x5C]"))) {
    return { label: token.slice(2, -2).trim(), type: "data" };
  }
  // ([Terminator]) or (Terminator) -> terminator (pill)
  if (token.startsWith("([") && token.endsWith("])")) {
    return { label: token.slice(2, -2).trim(), type: "terminator" };
  }
  if (token.startsWith("(") && token.endsWith(")")) {
    return { label: token.slice(1, -1).trim(), type: "terminator" };
  }
  // <Decision> or {Decision} -> decision (diamond)
  if (token.startsWith("<") && token.endsWith(">")) {
    return { label: token.slice(1, -1).trim(), type: "decision" };
  }
  if (token.startsWith("{") && token.endsWith("}")) {
    return { label: token.slice(1, -1).trim(), type: "decision" };
  }
  // [Process] -> process (rectangle)
  if (token.startsWith("[") && token.endsWith("]")) {
    return { label: token.slice(1, -1).trim(), type: "process" };
  }

  // Plain word heuristics (e.g. Start, End, Is Valid?)
  const lower = token.toLowerCase();
  if (lower === "start" || lower === "end" || lower === "stop") {
    return { label: token, type: "terminator" };
  }
  if (token.endsWith("?")) {
    return { label: token, type: "decision" };
  }

  return { label: token, type: "process" };
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
 * Parses markdown/text content into nodes and edges for React Flow
 */
export function parseFlowFromMarkdown(
  content: string,
  existingPositions?: Map<string, { x: number; y: number }>
): ParsedFlowResult {
  if (!content || !content.trim()) {
    return { nodes: [], edges: [], hasFlowDefinitions: false };
  }

  const lines = content.split("\n");
  const rawNodesMap = new Map<string, RawNode>();
  const rawEdges: RawEdge[] = [];
  let foundAnyFlowSyntax = false;

  // Regex for arrows with optional label
  // Matches: -- label --> | -- label -> | - label -> | --> |label| | -> |label| | --> | -> | ==> | --- | --
  const ARROW_PATTERN =
    /\s*(?:--\s*([^->\n|]+?)\s*-->|--\s*([^->\n|]+?)\s*->|-\s*([^->\n|]+?)\s*->|-->\s*\|([^|\n]+)\||->\s*\|([^|\n]+)\||-->|->|==>|---|--)\s*/;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || trimmed.startsWith("//") || trimmed.startsWith("/*")) {
      continue;
    }

    // Check if line contains an arrow connection
    if (ARROW_PATTERN.test(trimmed)) {
      foundAnyFlowSyntax = true;

      // Extract parts and separator matches
      let remaining = trimmed;
      const chainNodes: string[] = [];
      const chainEdgeLabels: (string | undefined)[] = [];

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

        // Label could be in capture group 1, 2, 3, 4, or 5
        const label = match[1] || match[2] || match[3] || match[4] || match[5];
        chainEdgeLabels.push(label ? label.trim() : undefined);

        remaining = remaining.slice(match.index + match[0].length);
      }

      // Register nodes and connect along the chain
      for (let i = 0; i < chainNodes.length; i++) {
        const token = chainNodes[i];
        const { label, type } = parseNodeToken(token);
        const id = normalizeId(label);

        if (!rawNodesMap.has(id)) {
          rawNodesMap.set(id, { id, label, type });
        }

        if (i < chainNodes.length - 1) {
          const nextToken = chainNodes[i + 1];
          const { label: nextLabel, type: nextType } = parseNodeToken(nextToken);
          const nextId = normalizeId(nextLabel);

          if (!rawNodesMap.has(nextId)) {
            rawNodesMap.set(nextId, { id: nextId, label: nextLabel, type: nextType });
          }

          rawEdges.push({
            sourceId: id,
            targetId: nextId,
            label: chainEdgeLabels[i],
          });
        }
      }
    } else {
      // Check for standalone node like [My Process] or (Start)
      const standaloneMatch = trimmed.match(/^([\[({<].+?[\])}>])\s*$/);
      if (standaloneMatch) {
        foundAnyFlowSyntax = true;
        const { label, type } = parseNodeToken(standaloneMatch[1]);
        const id = normalizeId(label);
        if (!rawNodesMap.has(id)) {
          rawNodesMap.set(id, { id, label, type });
        }
      }
    }
  }

  if (rawNodesMap.size === 0) {
    return { nodes: [], edges: [], hasFlowDefinitions: foundAnyFlowSyntax };
  }

  // --- Topological / Layered DAG Layout ---
  const adj = new Map<string, string[]>();
  const inDegree = new Map<string, number>();

  for (const node of rawNodesMap.values()) {
    adj.set(node.id, []);
    inDegree.set(node.id, 0);
  }

  for (const edge of rawEdges) {
    if (adj.has(edge.sourceId) && adj.has(edge.targetId)) {
      adj.get(edge.sourceId)!.push(edge.targetId);
      inDegree.set(edge.targetId, (inDegree.get(edge.targetId) || 0) + 1);
    }
  }

  // Find root nodes (inDegree === 0)
  const roots: string[] = [];
  for (const [id, deg] of inDegree.entries()) {
    if (deg === 0) roots.push(id);
  }
  if (roots.length === 0 && rawNodesMap.size > 0) {
    // If there's a cycle and no clear root, start with the first node
    roots.push(Array.from(rawNodesMap.keys())[0]);
  }

  // Layer ranking using BFS
  const nodeLayer = new Map<string, number>();
  const queue: { id: string; layer: number; path: Set<string> }[] = roots.map((r) => ({
    id: r,
    layer: 0,
    path: new Set([r]),
  }));

  while (queue.length > 0) {
    const { id, layer, path } = queue.shift()!;
    const currentMax = nodeLayer.get(id) ?? -1;
    if (layer > currentMax) {
      nodeLayer.set(id, layer);
    }

    const neighbors = adj.get(id) || [];
    for (const neighbor of neighbors) {
      // Detect cycle / back-edge: if neighbor is already in current path, do not loop
      if (!path.has(neighbor)) {
        const newPath = new Set(path);
        newPath.add(neighbor);
        queue.push({ id: neighbor, layer: layer + 1, path: newPath });
      }
    }
  }

  // Ensure any isolated unranked nodes get assigned to layer 0 or next layer
  let maxLayer = 0;
  for (const layer of nodeLayer.values()) {
    if (layer > maxLayer) maxLayer = layer;
  }
  for (const id of rawNodesMap.keys()) {
    if (!nodeLayer.has(id)) {
      nodeLayer.set(id, 0);
    }
  }

  // Group nodes by layer
  const layers = new Map<number, string[]>();
  for (const [id, layer] of nodeLayer.entries()) {
    if (!layers.has(layer)) layers.set(layer, []);
    layers.get(layer)!.push(id);
  }

  const sortedLayerKeys = Array.from(layers.keys()).sort((a, b) => a - b);

  // Compute final node positions
  const finalNodes: ChenNode[] = [];
  const nodePositionMap = new Map<string, { x: number; y: number }>();

  sortedLayerKeys.forEach((layerKey, layerIdx) => {
    const nodesInLayer = layers.get(layerKey) || [];
    const y = 80 + layerIdx * 135;

    // Calculate dimensions of all nodes in this layer based on their text
    const layerNodeDims = nodesInLayer.map((id) => {
      const raw = rawNodesMap.get(id)!;
      return computeNodeDimensions(raw.type, raw.label);
    });

    const gap = 44; // horizontal gap between nodes in layer
    const totalLayerWidth =
      layerNodeDims.reduce((acc, d) => acc + d.width, 0) +
      Math.max(0, nodesInLayer.length - 1) * gap;

    let currentX = 420 - totalLayerWidth / 2;

    nodesInLayer.forEach((id, colIdx) => {
      const raw = rawNodesMap.get(id)!;
      const { width, height } = layerNodeDims[colIdx];
      const nodeX = currentX;

      // Preserve existing position if user manually moved this node
      let position = { x: Math.round(nodeX), y: Math.round(y) };
      if (existingPositions?.has(id)) {
        position = existingPositions.get(id)!;
      }

      currentX += width + gap;

      nodePositionMap.set(id, position);

      finalNodes.push({
        id,
        type: raw.type,
        position,
        width,
        height,
        style: { width, height },
        data: { label: raw.label },
      });
    });
  });

  // Build final edges with appropriate handle positions and arrowheads
  const finalEdges: ChenEdge[] = rawEdges.map((re, index) => {
    const sourcePos = nodePositionMap.get(re.sourceId);
    const targetPos = nodePositionMap.get(re.targetId);

    let sourceHandle = "bottom-source";
    let targetHandle = "top-target";

    if (sourcePos && targetPos) {
      if (sourcePos.y < targetPos.y - 30) {
        // Flowing downward
        sourceHandle = "bottom-source";
        targetHandle = "top-target";
      } else if (sourcePos.y > targetPos.y + 30) {
        // Looping back upward
        if (sourcePos.x <= targetPos.x) {
          sourceHandle = "left-source";
          targetHandle = "left-target";
        } else {
          sourceHandle = "right-source";
          targetHandle = "right-target";
        }
      } else {
        // Same horizontal layer
        if (sourcePos.x < targetPos.x) {
          sourceHandle = "right-source";
          targetHandle = "left-target";
        } else {
          sourceHandle = "left-source";
          targetHandle = "right-target";
        }
      }
    }

    return {
      id: `e-${re.sourceId}-${re.targetId}-${index}`,
      source: re.sourceId,
      target: re.targetId,
      sourceHandle,
      targetHandle,
      type: "chen",
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: "var(--muted-foreground)",
        width: 15,
        height: 15,
      },
      data: {
        label: re.label || "",
      },
    };
  });

  return {
    nodes: finalNodes,
    edges: finalEdges,
    hasFlowDefinitions: true,
  };
}
