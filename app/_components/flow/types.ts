import type { Node, Edge } from "@xyflow/react";

export type FlowLayoutDirection = "TB" | "LR";

export type FlowchartNodeType =
  | "terminator"
  | "process"
  | "decision"
  | "delay"
  | "data"
  | "document"
  | "multidocument"
  | "subroutine"
  | "preparation"
  | "display"
  | "manualInput"
  | "manualLoop"
  | "loopLimit"
  | "storedData"
  | "connector"
  | "offpageDown"
  | "offpageUp"
  | "offpageRight"
  | "offpageLeft"
  | "or"
  | "summingJunction"
  | "collate"
  | "sort"
  | "merge"
  | "database"
  | "internalStorage";

export type ChenNodeType =
  | "entity"
  | "weakEntity"
  | "relationship"
  | "identifyingRelationship"
  | "attribute"
  | "keyAttribute"
  | "multivaluedAttribute"
  | "text"
  | FlowchartNodeType;

export interface ChenNodeData extends Record<string, unknown> {
  label: string;
  description?: string;
  isEditing?: boolean;
  color?: string;
}

export type ChenNode = Node<ChenNodeData, ChenNodeType>;

export type FlowEdgeArrowType =
  | "directed"
  | "bidirectional"
  | "line"
  | "dashed"
  | "dashedLine"
  | "thick";

export type FlowEdgeRoutingType = "bezier" | "smoothstep" | "straight";

export interface ChenEdgeData extends Record<string, unknown> {
  label?: string; // e.g. "1", "N", "M", "(0,1)", "(1,N)", "Yes", "No"
  isTotal?: boolean; // Total participation / thick edge
  arrowType?: FlowEdgeArrowType;
  routingType?: FlowEdgeRoutingType;
}

export type ChenEdge = Edge<ChenEdgeData>;
