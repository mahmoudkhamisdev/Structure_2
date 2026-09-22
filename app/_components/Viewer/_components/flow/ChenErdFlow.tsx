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
import { DragDropProvider, useDroppable } from "@dnd-kit/react";
import { PointerSensor, PointerActivationConstraints, Feedback } from "@dnd-kit/dom";
import { chenNodeTypes } from "./nodeTypes";
import { chenEdgeTypes } from "./edges/ChenEdge";
import { initialChenNodes, initialChenEdges } from "./initial-elements";
import { ChenToolbar, type InteractionMode } from "./ChenToolbar";
import { flowchartShapes } from "./flowchartShapes";
import type { ChenNode, ChenEdge, ChenNodeType, FlowchartNodeType } from "./types";
import { cn } from "cn";

const sensors = [
  PointerSensor.configure({
    activationConstraints: [
      new PointerActivationConstraints.Distance({ value: 5 }),
    ],
  }),
];

const plugins = (defaults: any[]) =>
  defaults.map((plugin) =>
    plugin === Feedback ? Feedback.configure({ feedback: "none" }) : plugin
  );

function ChenErdFlowInner() {
  const { resolvedTheme } = useTheme();
  const reactFlowInstance = useReactFlow();

  const [mode, setMode] = useState<InteractionMode>("pointer");
  const [nodes, setNodes, onNodesChange] = useNodesState<ChenNode>(initialChenNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<ChenEdge>(initialChenEdges);
  const [activeDragItem, setActiveDragItem] = useState<{ type: ChenNodeType; label?: string } | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const lastPointerPosRef = useRef<{ x: number; y: number } | null>(null);

  // Track pointer during drag so shape is 100% centered on mouse cursor
  // Use capture phase so stopPropagation in sensors doesn't prevent tracking
  useEffect(() => {
    const handleMove = (e: MouseEvent | PointerEvent) => {
      lastPointerPosRef.current = { x: e.clientX, y: e.clientY };
      if (activeDragItem) {
        setMousePos({ x: e.clientX, y: e.clientY });
      }
    };

    window.addEventListener("pointermove", handleMove, { capture: true, passive: true });
    window.addEventListener("pointerup", handleMove, { capture: true, passive: true });
    return () => {
      window.removeEventListener("pointermove", handleMove, { capture: true });
      window.removeEventListener("pointerup", handleMove, { capture: true });
    };
  }, [activeDragItem]);

  // Droppable canvas setup via @dnd-kit/react
  const { ref: droppableRef } = useDroppable({
    id: "flow-canvas",
  });

  // History management
  const pastRef = useRef<{ nodes: ChenNode[]; edges: ChenEdge[] }[]>([]);
  const futureRef = useRef<{ nodes: ChenNode[]; edges: ChenEdge[] }[]>([]);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const clipboardRef = useRef<{ nodes: ChenNode[]; edges: ChenEdge[] } | null>(null);

  const takeSnapshot = useCallback(() => {
    pastRef.current.push({
      nodes: JSON.parse(JSON.stringify(nodes)),
      edges: JSON.parse(JSON.stringify(edges)),
    });
    if (pastRef.current.length > 50) {
      pastRef.current.shift();
    }
    futureRef.current = [];
    setCanUndo(true);
    setCanRedo(false);
  }, [nodes, edges]);

  const handleUndo = useCallback(() => {
    if (pastRef.current.length === 0) return;
    const previous = pastRef.current.pop()!;
    futureRef.current.push({
      nodes: JSON.parse(JSON.stringify(nodes)),
      edges: JSON.parse(JSON.stringify(edges)),
    });
    setNodes(previous.nodes);
    setEdges(previous.edges);
    setCanUndo(pastRef.current.length > 0);
    setCanRedo(true);
  }, [nodes, edges, setNodes, setEdges]);

  const handleRedo = useCallback(() => {
    if (futureRef.current.length === 0) return;
    const next = futureRef.current.pop()!;
    pastRef.current.push({
      nodes: JSON.parse(JSON.stringify(nodes)),
      edges: JSON.parse(JSON.stringify(edges)),
    });
    setNodes(next.nodes);
    setEdges(next.edges);
    setCanUndo(true);
    setCanRedo(futureRef.current.length > 0);
  }, [nodes, edges, setNodes, setEdges]);

  const handleDuplicate = useCallback(() => {
    const selectedNodes = nodes.filter((n) => n.selected);
    if (selectedNodes.length === 0) return;

    takeSnapshot();

    const idMap = new Map<string, string>();
    const newNodes: ChenNode[] = selectedNodes.map((node) => {
      const newId = `${node.type}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      idMap.set(node.id, newId);
      return {
        ...node,
        id: newId,
        position: {
          x: node.position.x + 30,
          y: node.position.y + 30,
        },
        selected: true,
      };
    });

    const updatedOldNodes = nodes.map((n) =>
      n.selected ? { ...n, selected: false } : n
    );

    const selectedNodeIds = new Set(selectedNodes.map((n) => n.id));
    const newEdges: ChenEdge[] = edges
      .filter((e) => selectedNodeIds.has(e.source) && selectedNodeIds.has(e.target))
      .map((e) => ({
        ...e,
        id: `e-${idMap.get(e.source)}-${idMap.get(e.target)}-${Date.now()}`,
        source: idMap.get(e.source)!,
        target: idMap.get(e.target)!,
        selected: false,
      }));

    setNodes([...updatedOldNodes, ...newNodes]);
    if (newEdges.length > 0) {
      setEdges((eds) => [...eds, ...newEdges]);
    }
  }, [nodes, edges, takeSnapshot, setNodes, setEdges]);

  const handleCopy = useCallback(() => {
    const selectedNodes = nodes.filter((n) => n.selected);
    if (selectedNodes.length === 0) return;
    const selectedNodeIds = new Set(selectedNodes.map((n) => n.id));
    const selectedEdges = edges.filter(
      (e) => selectedNodeIds.has(e.source) && selectedNodeIds.has(e.target)
    );
    clipboardRef.current = {
      nodes: JSON.parse(JSON.stringify(selectedNodes)),
      edges: JSON.parse(JSON.stringify(selectedEdges)),
    };
  }, [nodes, edges]);

  const handlePaste = useCallback(() => {
    if (!clipboardRef.current || clipboardRef.current.nodes.length === 0) return;

    takeSnapshot();

    const idMap = new Map<string, string>();
    const newNodes: ChenNode[] = clipboardRef.current.nodes.map((node) => {
      const newId = `${node.type}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      idMap.set(node.id, newId);
      return {
        ...node,
        id: newId,
        position: {
          x: node.position.x + 30,
          y: node.position.y + 30,
        },
        selected: true,
      };
    });

    // Offset next paste
    clipboardRef.current = {
      ...clipboardRef.current,
      nodes: clipboardRef.current.nodes.map((n) => ({
        ...n,
        position: { x: n.position.x + 30, y: n.position.y + 30 },
      })),
    };

    const updatedExistingNodes = nodes.map((n) =>
      n.selected ? { ...n, selected: false } : n
    );

    const newEdges: ChenEdge[] = clipboardRef.current.edges.map((e) => ({
      ...e,
      id: `e-${idMap.get(e.source)}-${idMap.get(e.target)}-${Date.now()}`,
      source: idMap.get(e.source)!,
      target: idMap.get(e.target)!,
      selected: false,
    }));

    setNodes([...updatedExistingNodes, ...newNodes]);
    if (newEdges.length > 0) {
      setEdges((eds) => [...eds, ...newEdges]);
    }
  }, [nodes, takeSnapshot, setNodes, setEdges]);

  // Connect handler
  const onConnect = useCallback(
    (connection: Connection) => {
      takeSnapshot();
      const newEdge: ChenEdge = {
        ...connection,
        id: `e-${connection.source}-${connection.target}-${Date.now()}`,
        type: "chen",
        data: {},
      };
      setEdges((eds) => addEdge(newEdge, eds));
    },
    [setEdges, takeSnapshot]
  );

  // Add new node in visible area or dropped coordinates
  const handleAddNode = useCallback(
    (type: ChenNodeType, customLabel?: string, customPosition?: { x: number; y: number }) => {
      takeSnapshot();
      const id = `${type}-${Date.now()}`;
      const defaultLabels: Record<string, string> = {
        entity: "NewEntity",
        weakEntity: "WeakEntity",
        relationship: "Relates",
        identifyingRelationship: "Identifies",
        attribute: "attr",
        keyAttribute: "pk_id",
        multivaluedAttribute: "multi_val",
        text: "Add your text here...",
      };

      const meta = flowchartShapes[type as FlowchartNodeType];
      const label = customLabel || meta?.defaultLabel || defaultLabels[type] || type;

      let position = customPosition;
      if (!position) {
        const { x = 0, y = 0, zoom = 1 } = reactFlowInstance.getViewport() || {};
        const centerX = (-x + 280) / zoom;
        const centerY = (-y + 220) / zoom;
        position = {
          x: centerX + (Math.random() * 40 - 20),
          y: centerY + (Math.random() * 40 - 20),
        };
      }

      const defaultDimensions: Record<string, { w: number; h: number }> = {
        entity: { w: 110, h: 46 },
        weakEntity: { w: 110, h: 46 },
        relationship: { w: 110, h: 52 },
        identifyingRelationship: { w: 110, h: 52 },
        attribute: { w: 96, h: 40 },
        keyAttribute: { w: 96, h: 40 },
        multivaluedAttribute: { w: 96, h: 40 },
        text: { w: 80, h: 32 },
      };
      const initialWidth = meta?.width || defaultDimensions[type]?.w || 120;
      const initialHeight = meta?.height || defaultDimensions[type]?.h || 50;

      const newNode: ChenNode = {
        id,
        type,
        position,
        width: initialWidth,
        height: initialHeight,
        style: { width: initialWidth, height: initialHeight },
        data: { label },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes, takeSnapshot]
  );

  // Drag & Drop handlers for @dnd-kit/react (Center shape on mouse)
  const handleDragStart = useCallback((event: any) => {
    const sourceData = event.operation?.source?.data as
      | { type?: ChenNodeType; label?: string }
      | undefined;
    if (sourceData?.type) {
      setActiveDragItem({ type: sourceData.type, label: sourceData.label });
      const native = event.nativeEvent as PointerEvent | MouseEvent | undefined;
      const x = native?.clientX ?? event.operation?.position?.current?.x ?? lastPointerPosRef.current?.x;
      const y = native?.clientY ?? event.operation?.position?.current?.y ?? lastPointerPosRef.current?.y;
      if (x != null && y != null) {
        lastPointerPosRef.current = { x, y };
        setMousePos({ x, y });
      }
    }
  }, []);

  const handleDragMove = useCallback((event: any) => {
    const native = event.nativeEvent as PointerEvent | MouseEvent | undefined;
    const x = native?.clientX ?? event.operation?.position?.current?.x;
    const y = native?.clientY ?? event.operation?.position?.current?.y;
    if (x != null && y != null) {
      lastPointerPosRef.current = { x, y };
      setMousePos({ x, y });
    }
  }, []);

  const handleDragEnd = useCallback(
    (event: any) => {
      const sourceData = event.operation?.source?.data as
        | { type?: ChenNodeType; label?: string }
        | undefined;
      const type = sourceData?.type;

      if (type) {
        const native = event.nativeEvent as PointerEvent | MouseEvent | undefined;
        const clientX =
          native?.clientX ??
          lastPointerPosRef.current?.x ??
          event.operation?.position?.current?.x ??
          mousePos?.x;
        const clientY =
          native?.clientY ??
          lastPointerPosRef.current?.y ??
          event.operation?.position?.current?.y ??
          mousePos?.y;

        if (clientX != null && clientY != null && reactFlowInstance) {
          const flowPos = reactFlowInstance.screenToFlowPosition({
            x: clientX,
            y: clientY,
          });
          const meta = flowchartShapes[type as FlowchartNodeType];
          const nodeWidth = meta?.width || 140;
          const nodeHeight = meta?.height || 52;

          // Center the shape precisely at the drop cursor location
          const centeredPos = {
            x: flowPos.x - nodeWidth / 2,
            y: flowPos.y - nodeHeight / 2,
          };
          handleAddNode(type, sourceData.label, centeredPos);
        } else {
          handleAddNode(type, sourceData.label);
        }
      }
      setActiveDragItem(null);
      setMousePos(null);
      setPaletteOpen(false);
    },
    [handleAddNode, reactFlowInstance, mousePos]
  );

  // Keyboard actions: Undo, Redo, Duplicate, Copy, Paste, Delete, Select All
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable ||
          target.closest(".nodrag"))
      ) {
        return;
      }

      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
      const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

      // Undo: Ctrl+Z (without shift)
      if (cmdOrCtrl && (e.key === "z" || e.key === "Z") && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
        return;
      }

      // Redo: Ctrl+Y or Ctrl+Shift+Z
      if (
        (cmdOrCtrl && (e.key === "y" || e.key === "Y")) ||
        (cmdOrCtrl && (e.key === "z" || e.key === "Z") && e.shiftKey)
      ) {
        e.preventDefault();
        handleRedo();
        return;
      }

      // Duplicate: Ctrl+D
      if (cmdOrCtrl && (e.key === "d" || e.key === "D")) {
        e.preventDefault();
        handleDuplicate();
        return;
      }

      // Copy: Ctrl+C
      if (cmdOrCtrl && (e.key === "c" || e.key === "C")) {
        handleCopy();
        return;
      }

      // Paste: Ctrl+V
      if (cmdOrCtrl && (e.key === "v" || e.key === "V")) {
        e.preventDefault();
        handlePaste();
        return;
      }

      // Select All: Ctrl+A
      if (cmdOrCtrl && (e.key === "a" || e.key === "A")) {
        e.preventDefault();
        setNodes((nds) => nds.map((n) => ({ ...n, selected: true })));
        return;
      }

      // Delete: Delete or Backspace
      if (e.key === "Delete" || e.key === "Backspace") {
        const hasSelected = nodes.some((n) => n.selected) || edges.some((e) => e.selected);
        if (hasSelected) {
          e.preventDefault();
          takeSnapshot();
          setNodes((nds) => nds.filter((n) => !n.selected));
          setEdges((eds) => eds.filter((e) => !e.selected));
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    handleUndo,
    handleRedo,
    handleDuplicate,
    handleCopy,
    handlePaste,
    takeSnapshot,
    nodes,
    edges,
    setNodes,
    setEdges,
  ]);

  // Fullscreen support
  const containerRef = useRef<HTMLDivElement | null>(null);
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
          if (node.classList) {
            if (
              node.classList.contains("react-flow__panel") ||
              node.classList.contains("react-flow__controls") ||
              node.classList.contains("react-flow__attribution") ||
              node.tagName === "ASIDE"
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
          a.download = "flowchart.png";
          a.click();
        } else if (format === "svg") {
          const { toSvg } = await import("html-to-image");
          const dataUrl = await toSvg(element, {
            filter,
            backgroundColor,
          });
          const a = document.createElement("a");
          a.href = dataUrl;
          a.download = "flowchart.svg";
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
          pdf.save("flowchart.pdf");
        }
      } catch (err) {
        console.error("Export error:", err);
      }
    },
    [resolvedTheme]
  );

  // Clear canvas
  const handleClear = useCallback(() => {
    takeSnapshot();
    setNodes([]);
    setEdges([]);
  }, [setNodes, setEdges, takeSnapshot]);

  const handleNodeDragStart = useCallback(() => {
    takeSnapshot();
  }, [takeSnapshot]);

  const isDark = resolvedTheme === "dark";

  return (
    <DragDropProvider
      sensors={sensors}
      plugins={plugins}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
    >
      <div
        ref={(el) => {
          droppableRef(el);
          containerRef.current = el;
        }}
        className={cn(
          "relative w-full h-full select-none overflow-hidden bg-background",
          isFullscreen && "fixed inset-0 z-50 w-screen h-screen",
          mode === "hand" ? "cursor-grab active:cursor-grabbing" : "cursor-default"
        )}
      >
        {/* Floating Flowchart Toolbar with Minimized Shapes Palette & History */}
        <ChenToolbar
          mode={mode}
          onModeChange={setMode}
          onAddNode={handleAddNode}
          onClear={handleClear}
          isFullscreen={isFullscreen}
          onToggleFullscreen={handleToggleFullscreen}
          onExport={handleExport}
          canUndo={canUndo}
          canRedo={canRedo}
          onUndo={handleUndo}
          onRedo={handleRedo}
          paletteOpen={paletteOpen}
          onTogglePalette={() => setPaletteOpen((prev) => !prev)}
          onClosePalette={() => setPaletteOpen(false)}
          isDragging={!!activeDragItem}
        />

        {/* Main React Flow Canvas */}
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeDragStart={handleNodeDragStart}
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

        {/* Drag Overlay: 100% precisely centered on the mouse cursor */}
        {activeDragItem && mousePos && (
          <div
            className="fixed pointer-events-none select-none z-[9999] -translate-x-1/2 -translate-y-1/2 flex items-center justify-center drop-shadow-2xl opacity-90 scale-105 transition-none"
            style={{
              left: `${mousePos.x}px`,
              top: `${mousePos.y}px`,
              width: `${flowchartShapes[activeDragItem.type as FlowchartNodeType]?.width || 140}px`,
              height: `${flowchartShapes[activeDragItem.type as FlowchartNodeType]?.height || 52}px`,
            }}
          >
            {(() => {
              const meta = flowchartShapes[activeDragItem.type as FlowchartNodeType];
              if (!meta) return null;
              return (
                <>
                  <div className="absolute inset-0 w-full h-full text-primary">
                    {meta.renderSvg({
                      className: "w-full h-full",
                      selected: true,
                      fillColor: "hsl(var(--primary))",
                    })}
                  </div>
                  <span className="relative z-10 text-xs font-semibold text-foreground px-2 text-center truncate max-w-[85%]">
                    {activeDragItem.label || meta.defaultLabel}
                  </span>
                </>
              );
            })()}
          </div>
        )}
      </div>
    </DragDropProvider>
  );
}

export function ChenErdFlow() {
  return (
    <ReactFlowProvider>
      <ChenErdFlowInner />
    </ReactFlowProvider>
  );
}
