"use client";

import React, { useState, useCallback, useRef, useEffect, useMemo } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  useReactFlow,
  BackgroundVariant,
  MarkerType,
  type Connection,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useTheme } from "next-themes";
import { DragDropProvider, useDroppable } from "@dnd-kit/react";
import { PointerSensor, PointerActivationConstraints, Feedback } from "@dnd-kit/dom";
import { chenNodeTypes } from "./nodeTypes";
import { chenEdgeTypes } from "./edges/ChenEdge";
import { ChenToolbar, type InteractionMode } from "./ChenToolbar";
import { flowchartShapes } from "./flowchartShapes";
import type { ChenNode, ChenEdge, ChenNodeType, FlowchartNodeType, FlowLayoutDirection } from "./types";
import { useContentStore } from "@/store/useContentStore";
import { useFlowStore } from "@/store/useFlowStore";
import {
  computeNodeDimensions,
  layoutNodesAndEdges,
} from "./flowParser";
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
  const { content, fileName, activeNodeId, viewerTab } = useContentStore();

  const {
    nodes,
    edges,
    layoutDirection,
    nodeSpacing,
    setNodes,
    setEdges,
    setLayoutDirection,
    setNodeSpacing,
    onNodesChange,
    onEdgesChange,
    deleteSelected,
    updateNodeColor,
    addNode,
    addEdgeConnection,
    clearCanvas,
    syncToMarkdown,
    syncFromMarkdown,
  } = useFlowStore();

  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof document !== "undefined") {
      return document.documentElement.classList.contains("dark");
    }
    return false;
  });

  useEffect(() => {
    const updateThemeState = () => {
      const isHtmlDark = document.documentElement.classList.contains("dark");
      setIsDark(isHtmlDark);
    };

    updateThemeState();

    const observer = new MutationObserver(updateThemeState);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, [resolvedTheme]);

  const [mode, setMode] = useState<InteractionMode>("pointer");

  // Dynamically update edge marker colors whenever dark/light mode toggles
  useEffect(() => {
    const markerColor = isDark ? "#d4d4d8" : "#71717a";
    setEdges((prevEdges) =>
      prevEdges.map((edge) => ({
        ...edge,
        markerEnd: {
          ...(typeof edge.markerEnd === "object" ? edge.markerEnd : {}),
          type: MarkerType.ArrowClosed,
          color: markerColor,
          width: 15,
          height: 15,
        },
      }))
    );
  }, [isDark, setEdges]);

  const [activeDragItem, setActiveDragItem] = useState<{ type: ChenNodeType; label?: string } | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const lastPointerPosRef = useRef<{ x: number; y: number } | null>(null);
  const userPositionsRef = useRef<Map<string, { x: number; y: number }>>(new Map());
  const activeFileRef = useRef<string | null>(null);

  // Automatically fit view when the flow opens or when switching files/tabs
  useEffect(() => {
    const t1 = setTimeout(() => {
      reactFlowInstance.fitView({ padding: 0.2, duration: 300 });
    }, 80);

    const t2 = setTimeout(() => {
      reactFlowInstance.fitView({ padding: 0.2, duration: 300 });
    }, 250);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [fileName, activeNodeId, viewerTab, reactFlowInstance]);

  // Preserve user dragged positions
  const handleNodesChange = useCallback(
    (changes: any) => {
      onNodesChange(changes);
      for (const change of changes) {
        if (change.type === "position" && change.position && change.id) {
          userPositionsRef.current.set(change.id, change.position);
          const matched = nodes.find((n) => n.id === change.id);
          if (matched?.data?.label) {
            userPositionsRef.current.set(`label:${matched.data.label}`, change.position);
          }
        }
      }
    },
    [onNodesChange, nodes]
  );

  // Synchronize editor text definitions with Flowchart nodes & edges
  useEffect(() => {
    if (!content) return;
    const currentFileKey = activeNodeId || fileName || "flow";
    const isNewFile = activeFileRef.current !== currentFileKey;

    const didSync = syncFromMarkdown(content, userPositionsRef.current);
    if (didSync || isNewFile) {
      if (isNewFile) {
        activeFileRef.current = currentFileKey;
        setTimeout(() => {
          reactFlowInstance.fitView({ padding: 0.2, duration: 400 });
        }, 150);
      }
    }
  }, [content, activeNodeId, fileName, syncFromMarkdown, reactFlowInstance]);

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
    syncToMarkdown(previous.nodes, previous.edges);
    setCanUndo(pastRef.current.length > 0);
    setCanRedo(true);
  }, [nodes, edges, setNodes, setEdges, syncToMarkdown]);

  const handleRedo = useCallback(() => {
    if (futureRef.current.length === 0) return;
    const next = futureRef.current.pop()!;
    pastRef.current.push({
      nodes: JSON.parse(JSON.stringify(nodes)),
      edges: JSON.parse(JSON.stringify(edges)),
    });
    setNodes(next.nodes);
    setEdges(next.edges);
    syncToMarkdown(next.nodes, next.edges);
    setCanUndo(true);
    setCanRedo(futureRef.current.length > 0);
  }, [nodes, edges, setNodes, setEdges, syncToMarkdown]);

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

    const finalNodes = [...updatedOldNodes, ...newNodes];
    const finalEdges = newEdges.length > 0 ? [...edges, ...newEdges] : edges;
    setNodes(finalNodes);
    if (newEdges.length > 0) {
      setEdges(finalEdges);
    }
    syncToMarkdown(finalNodes, finalEdges);
  }, [nodes, edges, takeSnapshot, setNodes, setEdges, syncToMarkdown]);

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

    const finalNodes = [...updatedExistingNodes, ...newNodes];
    const finalEdges = newEdges.length > 0 ? [...edges, ...newEdges] : edges;
    setNodes(finalNodes);
    if (newEdges.length > 0) {
      setEdges(finalEdges);
    }
    syncToMarkdown(finalNodes, finalEdges);
  }, [nodes, edges, takeSnapshot, setNodes, setEdges, syncToMarkdown]);

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
      addEdgeConnection(newEdge);
    },
    [addEdgeConnection, takeSnapshot]
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

      const dims = computeNodeDimensions(type, label);
      const initialWidth = dims.width;
      const initialHeight = dims.height;

      const newNode: ChenNode = {
        id,
        type,
        position,
        width: initialWidth,
        height: initialHeight,
        style: { width: initialWidth, height: initialHeight },
        data: { label },
      };

      addNode(newNode);
    },
    [reactFlowInstance, addNode, takeSnapshot]
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
          target.isContentEditable)
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
          deleteSelected();
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
    deleteSelected,
    nodes,
    edges,
    setNodes,
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
        document.exitFullscreen().catch(() => { });
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

  // Auto format layout (Vertical or Horizontal)
  const handleAutoLayout = useCallback(
    (dir: FlowLayoutDirection) => {
      takeSnapshot();
      setLayoutDirection(dir);
      userPositionsRef.current.clear();

      const result = layoutNodesAndEdges(nodes, edges, dir, nodeSpacing);
      for (const n of result.nodes) {
        userPositionsRef.current.set(n.id, n.position);
      }

      setNodes(result.nodes);
      setEdges(result.edges);
      syncToMarkdown(result.nodes, result.edges, dir);

      setTimeout(() => {
        reactFlowInstance.fitView({ padding: 0.2, duration: 400 });
      }, 50);
    },
    [nodes, edges, reactFlowInstance, setLayoutDirection, setNodes, setEdges, syncToMarkdown, takeSnapshot, nodeSpacing]
  );

  // Dynamic node spacing adjustment
  const handleSpacingChange = useCallback(
    (spacing: number) => {
      takeSnapshot();
      setNodeSpacing(spacing);
      userPositionsRef.current.clear();

      const result = layoutNodesAndEdges(nodes, edges, layoutDirection, spacing);
      for (const n of result.nodes) {
        userPositionsRef.current.set(n.id, n.position);
      }

      setNodes(result.nodes);
      setEdges(result.edges);
    },
    [nodes, edges, layoutDirection, setNodeSpacing, setNodes, setEdges, takeSnapshot]
  );

  // Clear canvas
  const handleClear = useCallback(() => {
    takeSnapshot();
    clearCanvas();
  }, [clearCanvas, takeSnapshot]);

  const handleNodeDragStart = useCallback(() => {
    takeSnapshot();
  }, [takeSnapshot]);

  // Selected node(s) for toolbar color picker
  const selectedNodes = useMemo(() => nodes.filter((n) => n.selected), [nodes]);
  const selectedNode = selectedNodes[0];
  const selectedNodeColor = selectedNode?.data?.color as string | undefined;

  const handleNodeColorChange = useCallback(
    (color: string) => {
      takeSnapshot();
      const firstSelected = nodes.find((n) => n.selected);
      if (firstSelected) {
        updateNodeColor(firstSelected.id, color);
      }
    },
    [nodes, takeSnapshot, updateNodeColor]
  );

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
          canUndo={canUndo}
          canRedo={canRedo}
          onUndo={handleUndo}
          onRedo={handleRedo}
          paletteOpen={paletteOpen}
          onTogglePalette={() => setPaletteOpen((prev) => !prev)}
          onClosePalette={() => setPaletteOpen(false)}
          isDragging={!!activeDragItem}
          layoutDirection={layoutDirection}
          onAutoLayout={handleAutoLayout}
          nodeSpacing={nodeSpacing}
          onSpacingChange={handleSpacingChange}
          selectedNodeCount={selectedNodes.length}
          selectedNodeColor={selectedNodeColor}
          onNodeColorChange={handleNodeColorChange}
        />

        {/* Main React Flow Canvas */}
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={handleNodesChange}
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
          fitViewOptions={{ padding: 0.2 }}
          onInit={(instance) => {
            setTimeout(() => {
              instance.fitView({ padding: 0.2, duration: 300 });
            }, 60);
          }}
          minZoom={0.2}
          maxZoom={2.5}
          proOptions={{ hideAttribution: true }}
          className={cn("w-full h-full bg-background transition-colors duration-200", isDark && "dark")}
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={18}
            size={1}
            color={isDark ? "rgba(255,255,255,0.22)" : "rgba(0,0,0,0.18)"}
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
