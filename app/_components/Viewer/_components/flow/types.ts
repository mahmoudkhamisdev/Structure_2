import type { Node, Edge } from "@xyflow/react";

export type ChenNodeType =
  | "entity"
  | "weakEntity"
  | "relationship"
  | "identifyingRelationship"
  | "attribute"
  | "keyAttribute"
  | "multivaluedAttribute"
  | "text";

export interface ChenNodeData extends Record<string, unknown> {
  label: string;
  description?: string;
  isEditing?: boolean;
}

export type ChenNode = Node<ChenNodeData, ChenNodeType>;

export interface ChenEdgeData extends Record<string, unknown> {
  label?: string; // e.g. "1", "N", "M", "(0,1)", "(1,N)"
  isTotal?: boolean; // Total participation (double line)
}

export type ChenEdge = Edge<ChenEdgeData>;
