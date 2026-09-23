import type { ChenNode, ChenEdge } from "./types";
import { DEFAULT_FLOW_EXAMPLE, parseFlowFromMarkdown } from "./flowParser";

const initialData = parseFlowFromMarkdown(DEFAULT_FLOW_EXAMPLE);

export const initialChenNodes: ChenNode[] = initialData.nodes;
export const initialChenEdges: ChenEdge[] = initialData.edges;

