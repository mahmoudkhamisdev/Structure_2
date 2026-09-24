"use client";

import React from "react";
import type { FlowEdgeArrowType, FlowEdgeRoutingType } from "./types";
import { cn } from "cn";

export interface ArrowTypeOption {
  type: FlowEdgeArrowType;
  label: string;
  description: string;
  syntax: string;
}

export const ARROW_TYPES: ArrowTypeOption[] = [
  {
    type: "directed",
    label: "Directed Arrow",
    description: "Solid line with single arrowhead",
    syntax: "-->",
  },
  {
    type: "bidirectional",
    label: "Bidirectional",
    description: "Arrowheads on both ends",
    syntax: "<-->",
  },
  {
    type: "line",
    label: "Plain Line",
    description: "Line without arrowheads",
    syntax: "---",
  },
  {
    type: "dashed",
    label: "Dashed Arrow",
    description: "Dashed line with arrowhead",
    syntax: "-.->",
  },
  {
    type: "dashedLine",
    label: "Dashed Line",
    description: "Dashed line without arrowheads",
    syntax: "-.-",
  },
  {
    type: "thick",
    label: "Thick Arrow",
    description: "Bold thick line with arrowhead",
    syntax: "==>",
  },
];

export interface RoutingTypeOption {
  type: FlowEdgeRoutingType;
  label: string;
  description: string;
}

export const ROUTING_TYPES: RoutingTypeOption[] = [
  {
    type: "bezier",
    label: "Curved",
    description: "Smooth curve",
  },
  {
    type: "smoothstep",
    label: "Orthogonal",
    description: "Right-angle step",
  },
  {
    type: "straight",
    label: "Straight",
    description: "Direct linear path",
  },
];

export function ArrowPreviewIcon({
  type,
  className,
}: {
  type: FlowEdgeArrowType;
  className?: string;
}) {
  switch (type) {
    case "bidirectional":
      return (
        <svg
          viewBox="0 0 28 12"
          className={cn("w-7 h-3 stroke-current fill-current shrink-0", className)}
        >
          <polygon points="6,2 1,6 6,10" />
          <line
            x1="5"
            y1="6"
            x2="23"
            y2="6"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <polygon points="22,2 27,6 22,10" />
        </svg>
      );
    case "line":
      return (
        <svg
          viewBox="0 0 28 12"
          className={cn("w-7 h-3 stroke-current shrink-0", className)}
        >
          <line
            x1="2"
            y1="6"
            x2="26"
            y2="6"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      );
    case "dashed":
      return (
        <svg
          viewBox="0 0 28 12"
          className={cn("w-7 h-3 stroke-current fill-current shrink-0", className)}
        >
          <line
            x1="2"
            y1="6"
            x2="22"
            y2="6"
            strokeWidth="1.8"
            strokeDasharray="3 2"
          />
          <polygon points="21,2 27,6 21,10" />
        </svg>
      );
    case "dashedLine":
      return (
        <svg
          viewBox="0 0 28 12"
          className={cn("w-7 h-3 stroke-current shrink-0", className)}
        >
          <line
            x1="2"
            y1="6"
            x2="26"
            y2="6"
            strokeWidth="1.8"
            strokeDasharray="3.5 2"
          />
        </svg>
      );
    case "thick":
      return (
        <svg
          viewBox="0 0 28 12"
          className={cn("w-7 h-3 stroke-current fill-current shrink-0", className)}
        >
          <line
            x1="2"
            y1="6"
            x2="20"
            y2="6"
            strokeWidth="3.2"
            strokeLinecap="round"
          />
          <polygon points="19,1 27,6 19,11" />
        </svg>
      );
    case "directed":
    default:
      return (
        <svg
          viewBox="0 0 28 12"
          className={cn("w-7 h-3 stroke-current fill-current shrink-0", className)}
        >
          <line
            x1="2"
            y1="6"
            x2="22"
            y2="6"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <polygon points="21,2 27,6 21,10" />
        </svg>
      );
  }
}
