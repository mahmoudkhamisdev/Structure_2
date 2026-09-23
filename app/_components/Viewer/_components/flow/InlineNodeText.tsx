"use client";

import React, { useState, useRef, useEffect } from "react";
import { useReactFlow } from "@xyflow/react";
import { cn } from "cn";
import { computeNodeDimensions } from "./flowParser";

interface InlineNodeTextProps {
  id: string;
  label: string;
  className?: string;
  underlined?: boolean;
}

export function InlineNodeText({
  id,
  label,
  className,
  underlined = false,
}: InlineNodeTextProps) {
  const { setNodes } = useReactFlow();
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(label || "");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setValue(label || "");
  }, [label]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const updateNodeDirectly = (newVal: string) => {
    setNodes((nodes) =>
      nodes.map((node) => {
        if (node.id === id) {
          const dims = computeNodeDimensions(node.type || "process", newVal || " ");
          return {
            ...node,
            width: dims.width,
            height: dims.height,
            style: {
              ...node.style,
              width: dims.width,
              height: dims.height,
            },
            data: {
              ...node.data,
              label: newVal,
            },
          };
        }
        return node;
      })
    );
  };

  const handleFinish = () => {
    setIsEditing(false);
    const finalValue = value.trim() ? value : (label || "Untitled");
    setValue(finalValue);
    updateNodeDirectly(finalValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    e.stopPropagation();
    if (e.key === "Enter") {
      e.preventDefault();
      handleFinish();
    } else if (e.key === "Escape") {
      setValue(label);
      updateNodeDirectly(label);
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <div
        className="nodrag nopan relative inline-flex items-center justify-center min-w-[2rem]"
        onPointerDown={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Mirror element for exact pixel-perfect content sizing */}
        <span
          aria-hidden="true"
          className={cn(
            "invisible whitespace-pre font-inherit text-inherit text-center px-0",
            underlined && "underline underline-offset-4 decoration-1 decoration-foreground",
            className
          )}
        >
          {value || " "}
        </span>

        {/* Input over mirror so node expands dynamically with every character */}
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => {
            const nextVal = e.target.value;
            setValue(nextVal);
            updateNodeDirectly(nextVal);
          }}
          onBlur={handleFinish}
          onKeyDown={handleKeyDown}
          onKeyDownCapture={(e) => e.stopPropagation()}
          onKeyUp={(e) => e.stopPropagation()}
          className={cn(
            "nodrag nopan absolute inset-0 w-full h-full bg-transparent border-0 outline-none ring-0 shadow-none p-0 m-0 text-center font-inherit text-inherit cursor-text",
            underlined && "underline underline-offset-4 decoration-1 decoration-foreground",
            className
          )}
        />
      </div>
    );
  }

  return (
    <span
      onDoubleClick={(e) => {
        e.stopPropagation();
        setIsEditing(true);
      }}
      title="Double-click to edit name"
      className={cn(
        "cursor-text select-none whitespace-pre inline-block px-0",
        underlined && "underline underline-offset-4 decoration-1 decoration-foreground",
        className
      )}
    >
      {label || "Untitled"}
    </span>
  );
}

