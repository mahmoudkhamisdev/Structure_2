"use client";

import React, { useState, useRef, useEffect } from "react";
import { useReactFlow } from "@xyflow/react";
import { cn } from "cn";

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

  const handleFinish = () => {
    setIsEditing(false);
    const trimmed = value.trim() || label || "Untitled";
    setValue(trimmed);
    setNodes((nodes) =>
      nodes.map((node) => {
        if (node.id === id) {
          return {
            ...node,
            data: {
              ...node.data,
              label: trimmed,
            },
          };
        }
        return node;
      })
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleFinish();
    } else if (e.key === "Escape") {
      setValue(label);
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={handleFinish}
        onKeyDown={handleKeyDown}
        style={{ width: `${Math.max(value.length, 1)}ch` }}
        className={cn(
          "bg-transparent border-0 outline-none ring-0 shadow-none p-0 m-0 text-center font-inherit text-inherit cursor-text",
          underlined && "underline underline-offset-4 decoration-1 decoration-foreground",
          className
        )}
      />
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
        "cursor-text select-none whitespace-nowrap",
        underlined && "underline underline-offset-4 decoration-1 decoration-foreground",
        className
      )}
    >
      {label || "Untitled"}
    </span>
  );
}
