import type { ChenNode, ChenEdge, ChenNodeType, FlowLayoutDirection } from "./types";
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
  color?: string;
}

interface RawEdge {
  sourceId: string;
  targetId: string;
  label?: string;
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
 * Auto-formats and positions nodes and edges either vertically (Top to Bottom) or horizontally (Left to Right)
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

  const nodeMap = new Map<string, ChenNode>();
  const adj = new Map<string, string[]>();
  const inDegree = new Map<string, number>();

  for (const node of nodes) {
    nodeMap.set(node.id, node);
    adj.set(node.id, []);
    inDegree.set(node.id, 0);
  }

  for (const edge of edges) {
    if (adj.has(edge.source) && adj.has(edge.target)) {
      adj.get(edge.source)!.push(edge.target);
      inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1);
    }
  }

  // Find root nodes (inDegree === 0)
  const roots: string[] = [];
  for (const [id, deg] of inDegree.entries()) {
    if (deg === 0) roots.push(id);
  }
  if (roots.length === 0 && nodes.length > 0) {
    roots.push(nodes[0].id);
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
      if (!path.has(neighbor)) {
        const newPath = new Set(path);
        newPath.add(neighbor);
        queue.push({ id: neighbor, layer: layer + 1, path: newPath });
      }
    }
  }

  // Assign any unranked isolated nodes to layer 0
  for (const node of nodes) {
    if (!nodeLayer.has(node.id)) {
      nodeLayer.set(node.id, 0);
    }
  }

  // Group nodes by layer
  const layers = new Map<number, string[]>();
  for (const [id, layer] of nodeLayer.entries()) {
    if (!layers.has(layer)) layers.set(layer, []);
    layers.get(layer)!.push(id);
  }

  const sortedLayerKeys = Array.from(layers.keys()).sort((a, b) => a - b);
  const nodePositionMap = new Map<string, { x: number; y: number }>();
  const updatedNodes: ChenNode[] = [];

  if (direction === "TB") {
    // Vertical layout (Top to Bottom): each layer is a horizontal row
    let currentY = 80;
    sortedLayerKeys.forEach((layerKey) => {
      const nodeIdsInLayer = layers.get(layerKey) || [];
      const layerNodes = nodeIdsInLayer
        .map((id) => nodeMap.get(id))
        .filter((n): n is ChenNode => !!n);

      const nodeDims = layerNodes.map((n) => {
        const d = computeNodeDimensions(n.type, (n.data?.label as string) || "");
        const width = n.width || d.width;
        const height = n.height || d.height;
        return { width, height };
      });

      const maxHeight = Math.max(...nodeDims.map((d) => d.height), 48);
      const gapX = Math.max(12, Math.round(nodeSpacing * 0.8));
      const totalLayerWidth =
        nodeDims.reduce((acc, d) => acc + d.width, 0) +
        Math.max(0, layerNodes.length - 1) * gapX;

      let currentX = 420 - totalLayerWidth / 2;

      layerNodes.forEach((node, colIdx) => {
        const { width, height } = nodeDims[colIdx];
        const position = { x: Math.round(currentX), y: Math.round(currentY) };
        nodePositionMap.set(node.id, position);
        currentX += width + gapX;

        updatedNodes.push({
          ...node,
          position,
          width,
          height,
          style: { ...(node.style || {}), width, height },
        });
      });

      currentY += maxHeight + Math.max(20, Math.round(nodeSpacing * 1.4));
    });
  } else {
    // Horizontal layout (Left to Right): each layer is a vertical column
    let currentX = 80;
    sortedLayerKeys.forEach((layerKey) => {
      const nodeIdsInLayer = layers.get(layerKey) || [];
      const layerNodes = nodeIdsInLayer
        .map((id) => nodeMap.get(id))
        .filter((n): n is ChenNode => !!n);

      const nodeDims = layerNodes.map((n) => {
        const d = computeNodeDimensions(n.type, (n.data?.label as string) || "");
        const width = n.width || d.width;
        const height = n.height || d.height;
        return { width, height };
      });

      const maxWidth = Math.max(...nodeDims.map((d) => d.width), 120);
      const gapY = Math.max(12, Math.round(nodeSpacing * 0.6));
      const totalLayerHeight =
        nodeDims.reduce((acc, d) => acc + d.height, 0) +
        Math.max(0, layerNodes.length - 1) * gapY;

      let currentY = 280 - totalLayerHeight / 2;

      layerNodes.forEach((node, rowIdx) => {
        const { width, height } = nodeDims[rowIdx];
        const position = { x: Math.round(currentX), y: Math.round(currentY) };
        nodePositionMap.set(node.id, position);
        currentY += height + gapY;

        updatedNodes.push({
          ...node,
          position,
          width,
          height,
          style: { ...(node.style || {}), width, height },
        });
      });

      currentX += maxWidth + Math.max(25, Math.round(nodeSpacing * 1.5));
    });
  }

  // Ensure any isolated nodes not processed retain safe coordinates
  for (const n of nodes) {
    if (!nodePositionMap.has(n.id)) {
      nodePositionMap.set(n.id, n.position);
      updatedNodes.push(n);
    }
  }

  // Update edges with optimal handles based on layout direction
  const updatedEdges: ChenEdge[] = edges.map((edge) => {
    const sourcePos = nodePositionMap.get(edge.source);
    const targetPos = nodePositionMap.get(edge.target);

    let sourceHandle = "bottom-source";
    let targetHandle = "top-target";

    if (sourcePos && targetPos) {
      if (direction === "TB") {
        if (sourcePos.y < targetPos.y - 25) {
          sourceHandle = "bottom-source";
          targetHandle = "top-target";
        } else if (sourcePos.y > targetPos.y + 25) {
          if (sourcePos.x <= targetPos.x) {
            sourceHandle = "left-source";
            targetHandle = "left-target";
          } else {
            sourceHandle = "right-source";
            targetHandle = "right-target";
          }
        } else {
          if (sourcePos.x < targetPos.x) {
            sourceHandle = "right-source";
            targetHandle = "left-target";
          } else {
            sourceHandle = "left-source";
            targetHandle = "right-target";
          }
        }
      } else {
        // Horizontal (LR)
        if (sourcePos.x < targetPos.x - 25) {
          sourceHandle = "right-source";
          targetHandle = "left-target";
        } else if (sourcePos.x > targetPos.x + 25) {
          if (sourcePos.y <= targetPos.y) {
            sourceHandle = "top-source";
            targetHandle = "top-target";
          } else {
            sourceHandle = "bottom-source";
            targetHandle = "bottom-target";
          }
        } else {
          if (sourcePos.y < targetPos.y) {
            sourceHandle = "bottom-source";
            targetHandle = "top-target";
          } else {
            sourceHandle = "top-source";
            targetHandle = "bottom-target";
          }
        }
      }
    }

    return {
      ...edge,
      sourceHandle,
      targetHandle,
    };
  });

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

  // Regex for arrows with optional label
  // Matches: -- label --> | -- label -> | - label -> | --> |label| | -> |label| | --> | -> | ==> | --- | --
  const ARROW_PATTERN =
    /\s*(?:--\s*([^->\n|]+?)\s*-->|--\s*([^->\n|]+?)\s*->|-\s*([^->\n|]+?)\s*->|-->\s*\|([^|\n]+)\||->\s*\|([^|\n]+)\||-->|->|==>|---|--)\s*/;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || trimmed.startsWith("//") || trimmed.startsWith("/*")) {
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

    const posMap = new Map<string, { x: number; y: number }>();
    finalNodes.forEach((n) => posMap.set(n.id, n.position));

    const finalEdges = layouted.edges.map((e) => {
      const sp = posMap.get(e.source);
      const tp = posMap.get(e.target);
      if (!sp || !tp) return e;

      let sourceHandle = e.sourceHandle;
      let targetHandle = e.targetHandle;
      if (detectedDirection === "TB") {
        if (sp.y < tp.y - 25) {
          sourceHandle = "bottom-source";
          targetHandle = "top-target";
        } else if (sp.y > tp.y + 25) {
          sourceHandle = sp.x <= tp.x ? "left-source" : "right-source";
          targetHandle = sp.x <= tp.x ? "left-target" : "right-target";
        }
      } else {
        if (sp.x < tp.x - 25) {
          sourceHandle = "right-source";
          targetHandle = "left-target";
        } else if (sp.x > tp.x + 25) {
          sourceHandle = sp.y <= tp.y ? "top-source" : "bottom-source";
          targetHandle = sp.y <= tp.y ? "top-target" : "bottom-target";
        }
      }
      return { ...e, sourceHandle, targetHandle };
    });

    return {
      nodes: finalNodes,
      edges: finalEdges,
      hasFlowDefinitions: true,
    };
  }

  return {
    nodes: layouted.nodes,
    edges: layouted.edges,
    hasFlowDefinitions: true,
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
  existingContent: string = ""
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

  // 2. Direction header
  outputLines.push(`flowchart ${direction}`);

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

      if (label) {
        outputLines.push(`    ${sourceToken} -- ${label} --> ${targetToken}`);
      } else {
        outputLines.push(`    ${sourceToken} --> ${targetToken}`);
      }
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
