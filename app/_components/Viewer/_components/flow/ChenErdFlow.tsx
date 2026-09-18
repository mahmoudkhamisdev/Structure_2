"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  addEdge,
  useReactFlow,
  BackgroundVariant,
  type Connection,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useTheme } from "next-themes";
import { chenNodeTypes } from "./nodeTypes";
import { chenEdgeTypes } from "./edges/ChenEdge";
import { initialChenNodes, initialChenEdges } from "./initial-elements";
import { ChenToolbar, type InteractionMode } from "./ChenToolbar";
import type { ChenNode, ChenEdge, ChenNodeType } from "./types";
import { cn } from "cn";

function ChenErdFlowInner() {
  const { resolvedTheme } = useTheme();
  const reactFlowInstance = useReactFlow();

  const [mode, setMode] = useState<InteractionMode>("pointer");
  const [nodes, setNodes, onNodesChange] = useNodesState<ChenNode>(initialChenNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<ChenEdge>(initialChenEdges);

  const onConnect = useCallback(
    (connection: Connection) => {
      // Default new edges to 'chen' type
      const newEdge: ChenEdge = {
        ...connection,
        id: `e-${connection.source}-${connection.target}-${Date.now()}`,
        type: "chen",
        data: {},
      };
      setEdges((eds) => addEdge(newEdge, eds));
    },
    [setEdges]
  );

  // Add new node in visible area
  const handleAddNode = useCallback(
    (type: ChenNodeType, customLabel?: string) => {
      const id = `${type}-${Date.now()}`;
      const defaultLabels: Record<ChenNodeType, string> = {
        entity: "NewEntity",
        weakEntity: "WeakEntity",
        relationship: "Relates",
        identifyingRelationship: "Identifies",
        attribute: "attr",
        keyAttribute: "pk_id",
        multivaluedAttribute: "multi_val",
        text: "Add your text here...",
      };

      const label = customLabel || defaultLabels[type];

      // Center in current viewport
      const { x = 0, y = 0, zoom = 1 } = reactFlowInstance.getViewport() || {};
      const centerX = (-x + 280) / zoom;
      const centerY = (-y + 220) / zoom;

      const newNode: ChenNode = {
        id,
        type,
        position: {
          x: centerX + (Math.random() * 40 - 20),
          y: centerY + (Math.random() * 40 - 20),
        },
        data: { label },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes]
  );

  // Fullscreen support
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleToggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      if (containerRef.current?.requestFullscreen) {
        containerRef.current.requestFullscreen().catch(() => {
          setIsFullscreen(true);
        });
      } else {
        setIsFullscreen(true);
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  // Export diagram as PNG, SVG, or PDF
  const handleExport = useCallback(
    async (format: "png" | "svg" | "pdf") => {
      try {
        const element = document.querySelector(".react-flow") as HTMLElement;
        if (!element) return;

        const filter = (node: HTMLElement) => {
          if (node?.classList) {
            if (
              node.classList.contains("react-flow__controls") ||
              node.tagName === "ASIDE" ||
              node.getAttribute?.("aria-label") === "ERD Shapes Toolbar"
            ) {
              return false;
            }
          }
          return true;
        };

        const isDark = resolvedTheme === "dark";
        const backgroundColor = isDark ? "#09090b" : "#ffffff";

        if (format === "png") {
          const { toPng } = await import("html-to-image");
          const dataUrl = await toPng(element, {
            filter,
            backgroundColor,
            pixelRatio: 2,
          });
          const a = document.createElement("a");
          a.href = dataUrl;
          a.download = "chen-erd.png";
          a.click();
        } else if (format === "svg") {
          const { toSvg } = await import("html-to-image");
          const dataUrl = await toSvg(element, {
            filter,
            backgroundColor,
          });
          const a = document.createElement("a");
          a.href = dataUrl;
          a.download = "chen-erd.svg";
          a.click();
        } else if (format === "pdf") {
          const { toPng } = await import("html-to-image");
          const { jsPDF } = await import("jspdf");
          const dataUrl = await toPng(element, {
            filter,
            backgroundColor,
            pixelRatio: 2,
          });
          const width = element.offsetWidth;
          const height = element.offsetHeight;
          const orientation = width > height ? "l" : "p";
          const pdf = new jsPDF(orientation, "px", [width, height]);
          pdf.addImage(dataUrl, "PNG", 0, 0, width, height);
          pdf.save("chen-erd.pdf");
        }
      } catch (err) {
        console.error("Export error:", err);
      }
    },
    [resolvedTheme]
  );

  // Clear canvas
  const handleClear = useCallback(() => {
    setNodes([]);
    setEdges([]);
  }, [setNodes, setEdges]);

  const isDark = resolvedTheme === "dark";

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full h-full select-none overflow-hidden bg-background",
        isFullscreen && "fixed inset-0 z-50 w-screen h-screen",
        mode === "hand" ? "cursor-grab active:cursor-grabbing" : "cursor-default"
      )}
    >
      {/* Floating Chen ERD Toolbar with Mouse & Hand tools */}
      <ChenToolbar
        mode={mode}
        onModeChange={setMode}
        onAddNode={handleAddNode}
        onClear={handleClear}
        isFullscreen={isFullscreen}
        onToggleFullscreen={handleToggleFullscreen}
        onExport={handleExport}
      />

      {/* Main React Flow Canvas */}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={chenNodeTypes}
        edgeTypes={chenEdgeTypes}
        colorMode={isDark ? "dark" : "light"}
        panOnDrag={mode === "hand" ? true : [1, 2]}
        selectionOnDrag={mode === "pointer"}
        panOnScroll={mode === "hand"}
        fitView
        fitViewOptions={{ padding: 0.15 }}
        minZoom={0.2}
        maxZoom={2.5}
        proOptions={{ hideAttribution: true }}
        className="w-full h-full bg-background"
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={18}
          size={1}
          color={isDark ? "rgba(255,255,255,0.14)" : "rgba(0,0,0,0.12)"}
        />
        <Controls
          showInteractive={false}
          className="!border !border-border !bg-card/90 !backdrop-blur-md !shadow-md !rounded-xl overflow-hidden !bottom-4 !left-4 dark:[&_button]:!bg-card dark:[&_button]:!border-border dark:[&_button]:!fill-foreground dark:[&_button:hover]:!bg-muted/80"
        />
      </ReactFlow>
    </div>
  );
}

export function ChenErdFlow() {
  return (
    <ReactFlowProvider>
      <ChenErdFlowInner />
    </ReactFlowProvider>
  );
}
