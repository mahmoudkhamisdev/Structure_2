"use client";

import React from "react";
import type { FlowchartNodeType } from "./types";

export interface FlowchartShapeMeta {
  type: FlowchartNodeType;
  name: string;
  category: "process" | "data" | "logic" | "connectors";
  description: string;
  defaultLabel: string;
  width: number;
  height: number;
  renderSvg: (props: {
    width?: number | string;
    height?: number | string;
    className?: string;
    selected?: boolean;
    fillColor?: string;
    strokeColor?: string;
    isDark?: boolean;
  }) => React.ReactNode;
}

export function getShapeFill(selected?: boolean, fillColor?: string, isDark?: boolean): string {
  if (fillColor && fillColor !== "currentColor") return fillColor;
  const darkMode =
    isDark !== undefined
      ? isDark
      : typeof document !== "undefined" &&
        document.documentElement.classList.contains("dark");
  if (selected) {
    return darkMode ? "#27272a" : "#eff6ff";
  }
  return darkMode ? "#18181b" : "#ffffff";
}
export function getShapeStroke(selected?: boolean, strokeColor?: string): string {
  if (strokeColor && strokeColor !== "currentColor") return strokeColor;
  return selected ? "var(--primary)" : "currentColor";
}


export const flowchartShapes: Record<FlowchartNodeType, FlowchartShapeMeta> = {
  // --- Process & Control ---
  terminator: {
    type: "terminator",
    name: "Terminator",
    category: "process",
    description: "Indicates the beginning or end of a program flow.",
    defaultLabel: "Start / End",
    width: 140,
    height: 52,
    renderSvg: ({ className = "", selected = false, fillColor = "currentColor", strokeColor, isDark }) => (
      <svg preserveAspectRatio="none" viewBox="0 0 140 52" className={className} fill="none">
        <rect
          x="2"
          y="2"
          width="136"
          height="48"
          rx="24"
          fill={getShapeFill(selected, fillColor, isDark)}
          stroke={getShapeStroke(selected, strokeColor)}
          strokeWidth={selected ? 2.2 : 1.6}
        />
      </svg>
    ),
  },

  process: {
    type: "process",
    name: "Process",
    category: "process",
    description: "Indicates any processing function.",
    defaultLabel: "Process",
    width: 140,
    height: 52,
    renderSvg: ({ className = "", selected = false, fillColor = "currentColor", strokeColor, isDark }) => (
      <svg preserveAspectRatio="none" viewBox="0 0 140 52" className={className} fill="none">
        <rect
          x="2"
          y="2"
          width="136"
          height="48"
          rx="4"
          fill={getShapeFill(selected, fillColor, isDark)}
          stroke={getShapeStroke(selected, strokeColor)}
          strokeWidth={selected ? 2.2 : 1.6}
        />
      </svg>
    ),
  },

  subroutine: {
    type: "subroutine",
    name: "Subroutine",
    category: "process",
    description: "Indicates a predefined (named) process such as a subroutine.",
    defaultLabel: "Subroutine",
    width: 140,
    height: 52,
    renderSvg: ({ className = "", selected = false, fillColor = "currentColor", strokeColor, isDark }) => (
      <svg preserveAspectRatio="none" viewBox="0 0 140 52" className={className} fill="none">
        <rect
          x="2"
          y="2"
          width="136"
          height="48"
          rx="4"
          fill={getShapeFill(selected, fillColor, isDark)}
          stroke={getShapeStroke(selected, strokeColor)}
          strokeWidth={selected ? 2.2 : 1.6}
        />
        <line x1="20" y1="2" x2="20" y2="50" stroke={getShapeStroke(selected, strokeColor)} strokeWidth={1.4} />
        <line x1="120" y1="2" x2="120" y2="50" stroke={getShapeStroke(selected, strokeColor)} strokeWidth={1.4} />
      </svg>
    ),
  },

  preparation: {
    type: "preparation",
    name: "Preparation",
    category: "process",
    description: "Indicates a modification to a process or initializing a routine.",
    defaultLabel: "Preparation",
    width: 140,
    height: 52,
    renderSvg: ({ className = "", selected = false, fillColor = "currentColor", strokeColor, isDark }) => (
      <svg preserveAspectRatio="none" viewBox="0 0 140 52" className={className} fill="none">
        <polygon
          points="22,2 118,2 138,26 118,50 22,50 2,26"
          fill={getShapeFill(selected, fillColor, isDark)}
          stroke={getShapeStroke(selected, strokeColor)}
          strokeWidth={selected ? 2.2 : 1.6}
          strokeLinejoin="round"
        />
      </svg>
    ),
  },

  delay: {
    type: "delay",
    name: "Delay",
    category: "process",
    description: "Indicates a delay in the process.",
    defaultLabel: "Delay",
    width: 140,
    height: 52,
    renderSvg: ({ className = "", selected = false, fillColor = "currentColor", strokeColor, isDark }) => (
      <svg preserveAspectRatio="none" viewBox="0 0 140 52" className={className} fill="none">
        <path
          d="M 2 2 L 100 2 A 24 24 0 0 1 100 50 L 2 50 Z"
          fill={getShapeFill(selected, fillColor, isDark)}
          stroke={getShapeStroke(selected, strokeColor)}
          strokeWidth={selected ? 2.2 : 1.6}
          strokeLinejoin="round"
        />
      </svg>
    ),
  },

  // --- Data & Storage ---
  data: {
    type: "data",
    name: "Data",
    category: "data",
    description: "Can represent any type of input or output data.",
    defaultLabel: "Data / I/O",
    width: 140,
    height: 52,
    renderSvg: ({ className = "", selected = false, fillColor = "currentColor", strokeColor, isDark }) => (
      <svg preserveAspectRatio="none" viewBox="0 0 140 52" className={className} fill="none">
        <polygon
          points="24,2 138,2 116,50 2,50"
          fill={getShapeFill(selected, fillColor, isDark)}
          stroke={getShapeStroke(selected, strokeColor)}
          strokeWidth={selected ? 2.2 : 1.6}
          strokeLinejoin="round"
        />
      </svg>
    ),
  },

  document: {
    type: "document",
    name: "Document",
    category: "data",
    description: "Indicates data that can be read by people (e.g. printed output).",
    defaultLabel: "Document",
    width: 140,
    height: 56,
    renderSvg: ({ className = "", selected = false, fillColor = "currentColor", strokeColor, isDark }) => (
      <svg preserveAspectRatio="none" viewBox="0 0 140 56" className={className} fill="none">
        <path
          d="M 2 2 L 138 2 L 138 44 C 114 36, 92 56, 70 48 C 48 40, 26 56, 2 48 Z"
          fill={getShapeFill(selected, fillColor, isDark)}
          stroke={getShapeStroke(selected, strokeColor)}
          strokeWidth={selected ? 2.2 : 1.6}
          strokeLinejoin="round"
        />
      </svg>
    ),
  },

  multidocument: {
    type: "multidocument",
    name: "Multiple Documents",
    category: "data",
    description: "Indicates multiple documents.",
    defaultLabel: "Documents",
    width: 140,
    height: 58,
    renderSvg: ({ className = "", selected = false, fillColor = "currentColor", strokeColor, isDark }) => (
      <svg preserveAspectRatio="none" viewBox="0 0 140 58" className={className} fill="none">
        <path
          d="M 12 2 L 138 2 L 138 38 C 118 32, 98 48, 78 42 C 58 36, 40 46, 24 40 Z"
          stroke={getShapeStroke(selected, strokeColor)}
          strokeOpacity={0.4}
          strokeWidth={1.2}
        />
        <path
          d="M 7 6 L 133 6 L 133 42 C 113 36, 93 52, 73 46 C 53 40, 35 50, 19 44 Z"
          stroke={getShapeStroke(selected, strokeColor)}
          strokeOpacity={0.65}
          strokeWidth={1.4}
        />
        <path
          d="M 2 10 L 128 10 L 128 46 C 108 40, 88 56, 68 50 C 48 44, 28 56, 2 48 Z"
          fill={getShapeFill(selected, fillColor, isDark)}
          stroke={getShapeStroke(selected, strokeColor)}
          strokeWidth={selected ? 2.2 : 1.6}
          strokeLinejoin="round"
        />
      </svg>
    ),
  },

  database: {
    type: "database",
    name: "Database",
    category: "data",
    description: "Indicates structured data that allows searching and sorting.",
    defaultLabel: "Database",
    width: 120,
    height: 64,
    renderSvg: ({ className = "", selected = false, fillColor = "currentColor", strokeColor, isDark }) => (
      <svg preserveAspectRatio="none" viewBox="0 0 120 64" className={className} fill="none">
        <path
          d="M 4 14 L 4 50 C 4 58, 116 58, 116 50 L 116 14"
          fill={getShapeFill(selected, fillColor, isDark)}
          stroke={getShapeStroke(selected, strokeColor)}
          strokeWidth={selected ? 2.2 : 1.6}
        />
        <ellipse
          cx="60"
          cy="14"
          rx="56"
          ry="10"
          fill={getShapeFill(selected, fillColor, isDark)}
          stroke={getShapeStroke(selected, strokeColor)}
          strokeWidth={selected ? 2.2 : 1.6}
        />
        <path
          d="M 4 26 C 4 34, 116 34, 116 26"
          stroke={getShapeStroke(selected, strokeColor)}
          strokeWidth={1.2}
          strokeOpacity={0.7}
        />
        <path
          d="M 4 38 C 4 46, 116 46, 116 38"
          stroke={getShapeStroke(selected, strokeColor)}
          strokeWidth={1.2}
          strokeOpacity={0.7}
        />
      </svg>
    ),
  },

  storedData: {
    type: "storedData",
    name: "Stored Data",
    category: "data",
    description: "Indicates any type of stored data.",
    defaultLabel: "Stored Data",
    width: 140,
    height: 52,
    renderSvg: ({ className = "", selected = false, fillColor = "currentColor", strokeColor, isDark }) => (
      <svg preserveAspectRatio="none" viewBox="0 0 140 52" className={className} fill="none">
        <path
          d="M 18 2 L 138 2 C 122 26, 122 26, 138 50 L 18 50 C 34 26, 34 26, 18 2 Z"
          fill={getShapeFill(selected, fillColor, isDark)}
          stroke={getShapeStroke(selected, strokeColor)}
          strokeWidth={selected ? 2.2 : 1.6}
          strokeLinejoin="round"
        />
      </svg>
    ),
  },

  internalStorage: {
    type: "internalStorage",
    name: "Internal Storage",
    category: "data",
    description: "Indicates an internal storage device.",
    defaultLabel: "Storage",
    width: 130,
    height: 56,
    renderSvg: ({ className = "", selected = false, fillColor = "currentColor", strokeColor, isDark }) => (
      <svg preserveAspectRatio="none" viewBox="0 0 130 56" className={className} fill="none">
        <rect
          x="2"
          y="2"
          width="126"
          height="52"
          rx="4"
          fill={getShapeFill(selected, fillColor, isDark)}
          stroke={getShapeStroke(selected, strokeColor)}
          strokeWidth={selected ? 2.2 : 1.6}
        />
        <line x1="2" y1="16" x2="128" y2="16" stroke={getShapeStroke(selected, strokeColor)} strokeWidth={1.4} />
        <line x1="22" y1="2" x2="22" y2="54" stroke={getShapeStroke(selected, strokeColor)} strokeWidth={1.4} />
      </svg>
    ),
  },

  // --- Logic & Branching ---
  decision: {
    type: "decision",
    name: "Decision",
    category: "logic",
    description: "Indicates a decision point between paths.",
    defaultLabel: "Decision?",
    width: 140,
    height: 64,
    renderSvg: ({ className = "", selected = false, fillColor = "currentColor", strokeColor, isDark }) => (
      <svg preserveAspectRatio="none" viewBox="0 0 140 64" className={className} fill="none">
        <polygon
          points="70,2 138,32 70,62 2,32"
          fill={getShapeFill(selected, fillColor, isDark)}
          stroke={getShapeStroke(selected, strokeColor)}
          strokeWidth={selected ? 2.2 : 1.6}
          strokeLinejoin="round"
        />
      </svg>
    ),
  },

  merge: {
    type: "merge",
    name: "Merge",
    category: "logic",
    description: "Indicates combining multiple sets into one.",
    defaultLabel: "Merge",
    width: 120,
    height: 60,
    renderSvg: ({ className = "", selected = false, fillColor = "currentColor", strokeColor, isDark }) => (
      <svg preserveAspectRatio="none" viewBox="0 0 120 60" className={className} fill="none">
        <polygon
          points="2,4 118,4 60,56"
          fill={getShapeFill(selected, fillColor, isDark)}
          stroke={getShapeStroke(selected, strokeColor)}
          strokeWidth={selected ? 2.2 : 1.6}
          strokeLinejoin="round"
        />
      </svg>
    ),
  },

  collate: {
    type: "collate",
    name: "Collate",
    category: "logic",
    description: "Indicates organizing data into a standard format.",
    defaultLabel: "Collate",
    width: 120,
    height: 60,
    renderSvg: ({ className = "", selected = false, fillColor = "currentColor", strokeColor, isDark }) => (
      <svg preserveAspectRatio="none" viewBox="0 0 120 60" className={className} fill="none">
        <polygon
          points="2,2 118,2 2,58 118,58"
          fill={getShapeFill(selected, fillColor, isDark)}
          stroke={getShapeStroke(selected, strokeColor)}
          strokeWidth={selected ? 2.2 : 1.6}
          strokeLinejoin="round"
        />
      </svg>
    ),
  },

  sort: {
    type: "sort",
    name: "Sort",
    category: "logic",
    description: "Indicates organizing items sequentially.",
    defaultLabel: "Sort",
    width: 130,
    height: 60,
    renderSvg: ({ className = "", selected = false, fillColor = "currentColor", strokeColor, isDark }) => (
      <svg preserveAspectRatio="none" viewBox="0 0 130 60" className={className} fill="none">
        <polygon
          points="65,2 128,30 65,58 2,30"
          fill={getShapeFill(selected, fillColor, isDark)}
          stroke={getShapeStroke(selected, strokeColor)}
          strokeWidth={selected ? 2.2 : 1.6}
          strokeLinejoin="round"
        />
        <line x1="2" y1="30" x2="128" y2="30" stroke={getShapeStroke(selected, strokeColor)} strokeWidth={1.4} />
      </svg>
    ),
  },

  or: {
    type: "or",
    name: "Or",
    category: "logic",
    description: "Logical OR gate / junction point.",
    defaultLabel: "OR",
    width: 60,
    height: 60,
    renderSvg: ({ className = "", selected = false, fillColor = "currentColor", strokeColor, isDark }) => (
      <svg preserveAspectRatio="none" viewBox="0 0 60 60" className={className} fill="none">
        <circle
          cx="30"
          cy="30"
          r="27"
          fill={getShapeFill(selected, fillColor, isDark)}
          stroke={getShapeStroke(selected, strokeColor)}
          strokeWidth={selected ? 2.2 : 1.6}
        />
        <line x1="30" y1="3" x2="30" y2="57" stroke={getShapeStroke(selected, strokeColor)} strokeWidth={1.4} />
        <line x1="3" y1="30" x2="57" y2="30" stroke={getShapeStroke(selected, strokeColor)} strokeWidth={1.4} />
      </svg>
    ),
  },

  summingJunction: {
    type: "summingJunction",
    name: "Summing Junction",
    category: "logic",
    description: "Logical AND / Summing junction point.",
    defaultLabel: "AND",
    width: 60,
    height: 60,
    renderSvg: ({ className = "", selected = false, fillColor = "currentColor", strokeColor, isDark }) => (
      <svg preserveAspectRatio="none" viewBox="0 0 60 60" className={className} fill="none">
        <circle
          cx="30"
          cy="30"
          r="27"
          fill={getShapeFill(selected, fillColor, isDark)}
          stroke={getShapeStroke(selected, strokeColor)}
          strokeWidth={selected ? 2.2 : 1.6}
        />
        <line x1="11" y1="11" x2="49" y2="49" stroke={getShapeStroke(selected, strokeColor)} strokeWidth={1.4} />
        <line x1="49" y1="11" x2="11" y2="49" stroke={getShapeStroke(selected, strokeColor)} strokeWidth={1.4} />
      </svg>
    ),
  },

  // --- Connectors & Flow ---
  connector: {
    type: "connector",
    name: "Connector",
    category: "connectors",
    description: "Indicates an inspection or branch point.",
    defaultLabel: "A",
    width: 52,
    height: 52,
    renderSvg: ({ className = "", selected = false, fillColor = "currentColor", strokeColor, isDark }) => (
      <svg preserveAspectRatio="none" viewBox="0 0 52 52" className={className} fill="none">
        <circle
          cx="26"
          cy="26"
          r="23"
          fill={getShapeFill(selected, fillColor, isDark)}
          stroke={getShapeStroke(selected, strokeColor)}
          strokeWidth={selected ? 2.2 : 1.6}
        />
      </svg>
    ),
  },

  offpageDown: {
    type: "offpageDown",
    name: "Off-page (Down)",
    category: "connectors",
    description: "Cross-reference to another page (points downward).",
    defaultLabel: "Page",
    width: 70,
    height: 60,
    renderSvg: ({ className = "", selected = false, fillColor = "currentColor", strokeColor, isDark }) => (
      <svg preserveAspectRatio="none" viewBox="0 0 70 60" className={className} fill="none">
        <polygon
          points="4,4 66,4 66,38 35,56 4,38"
          fill={getShapeFill(selected, fillColor, isDark)}
          stroke={getShapeStroke(selected, strokeColor)}
          strokeWidth={selected ? 2.2 : 1.6}
          strokeLinejoin="round"
        />
      </svg>
    ),
  },

  offpageUp: {
    type: "offpageUp",
    name: "Off-page (Up)",
    category: "connectors",
    description: "Cross-reference from another page (points upward).",
    defaultLabel: "Page",
    width: 70,
    height: 60,
    renderSvg: ({ className = "", selected = false, fillColor = "currentColor", strokeColor, isDark }) => (
      <svg preserveAspectRatio="none" viewBox="0 0 70 60" className={className} fill="none">
        <polygon
          points="35,4 66,22 66,56 4,56 4,22"
          fill={getShapeFill(selected, fillColor, isDark)}
          stroke={getShapeStroke(selected, strokeColor)}
          strokeWidth={selected ? 2.2 : 1.6}
          strokeLinejoin="round"
        />
      </svg>
    ),
  },

  offpageRight: {
    type: "offpageRight",
    name: "Off-page (Right)",
    category: "connectors",
    description: "Cross-reference pointing to the right.",
    defaultLabel: "Page",
    width: 70,
    height: 60,
    renderSvg: ({ className = "", selected = false, fillColor = "currentColor", strokeColor, isDark }) => (
      <svg preserveAspectRatio="none" viewBox="0 0 70 60" className={className} fill="none">
        <polygon
          points="4,4 48,4 66,30 48,56 4,56"
          fill={getShapeFill(selected, fillColor, isDark)}
          stroke={getShapeStroke(selected, strokeColor)}
          strokeWidth={selected ? 2.2 : 1.6}
          strokeLinejoin="round"
        />
      </svg>
    ),
  },

  offpageLeft: {
    type: "offpageLeft",
    name: "Off-page (Left)",
    category: "connectors",
    description: "Cross-reference pointing to the left.",
    defaultLabel: "Page",
    width: 70,
    height: 60,
    renderSvg: ({ className = "", selected = false, fillColor = "currentColor", strokeColor, isDark }) => (
      <svg preserveAspectRatio="none" viewBox="0 0 70 60" className={className} fill="none">
        <polygon
          points="22,4 66,4 66,56 22,56 4,30"
          fill={getShapeFill(selected, fillColor, isDark)}
          stroke={getShapeStroke(selected, strokeColor)}
          strokeWidth={selected ? 2.2 : 1.6}
          strokeLinejoin="round"
        />
      </svg>
    ),
  },

  display: {
    type: "display",
    name: "Display",
    category: "connectors",
    description: "Data displayed for people to read on a screen.",
    defaultLabel: "Display",
    width: 140,
    height: 52,
    renderSvg: ({ className = "", selected = false, fillColor = "currentColor", strokeColor, isDark }) => (
      <svg preserveAspectRatio="none" viewBox="0 0 140 52" className={className} fill="none">
        <path
          d="M 28 2 L 105 2 C 130 18, 130 34, 105 50 L 28 50 C 4 34, 4 18, 28 2 Z"
          fill={getShapeFill(selected, fillColor, isDark)}
          stroke={getShapeStroke(selected, strokeColor)}
          strokeWidth={selected ? 2.2 : 1.6}
          strokeLinejoin="round"
        />
      </svg>
    ),
  },

  manualInput: {
    type: "manualInput",
    name: "Manual Input",
    category: "connectors",
    description: "Indicates an operation performed manually by a person.",
    defaultLabel: "Manual Input",
    width: 140,
    height: 52,
    renderSvg: ({ className = "", selected = false, fillColor = "currentColor", strokeColor, isDark }) => (
      <svg preserveAspectRatio="none" viewBox="0 0 140 52" className={className} fill="none">
        <polygon
          points="2,16 138,2 138,50 2,50"
          fill={getShapeFill(selected, fillColor, isDark)}
          stroke={getShapeStroke(selected, strokeColor)}
          strokeWidth={selected ? 2.2 : 1.6}
          strokeLinejoin="round"
        />
      </svg>
    ),
  },

  manualLoop: {
    type: "manualLoop",
    name: "Manual Loop",
    category: "connectors",
    description: "Sequence repeating until stopped manually.",
    defaultLabel: "Manual Loop",
    width: 140,
    height: 52,
    renderSvg: ({ className = "", selected = false, fillColor = "currentColor", strokeColor, isDark }) => (
      <svg preserveAspectRatio="none" viewBox="0 0 140 52" className={className} fill="none">
        <polygon
          points="2,2 138,2 118,50 22,50"
          fill={getShapeFill(selected, fillColor, isDark)}
          stroke={getShapeStroke(selected, strokeColor)}
          strokeWidth={selected ? 2.2 : 1.6}
          strokeLinejoin="round"
        />
      </svg>
    ),
  },

  loopLimit: {
    type: "loopLimit",
    name: "Loop Limit",
    category: "connectors",
    description: "Indicates the start of a loop limit.",
    defaultLabel: "Loop Limit",
    width: 140,
    height: 52,
    renderSvg: ({ className = "", selected = false, fillColor = "currentColor", strokeColor, isDark }) => (
      <svg preserveAspectRatio="none" viewBox="0 0 140 52" className={className} fill="none">
        <polygon
          points="20,2 120,2 138,18 138,50 2,50 2,18"
          fill={getShapeFill(selected, fillColor, isDark)}
          stroke={getShapeStroke(selected, strokeColor)}
          strokeWidth={selected ? 2.2 : 1.6}
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
};
