"use client";

import React from "react";
import {
  ColorPicker,
  ColorPickerSelection,
  ColorPickerHue,
  ColorPickerAlpha,
  ColorPickerEyeDropper,
  ColorPickerOutput,
  ColorPickerFormat,
} from "@/components/ui/color-picker";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import { getNodeColors } from "./nodeColors";
import { cn } from "cn";

interface NodeColorPickerProps {
  currentColor?: string;
  onSelectColor: (color: string) => void;
  className?: string;
}

export function NodeColorGrid({
  currentColor,
  onSelectColor,
  className,
}: NodeColorPickerProps) {
  const { stroke } = getNodeColors(currentColor);
  const activeColor = stroke || (currentColor && currentColor.startsWith("#") ? currentColor : "#3b82f6");

  return (
    <div
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      className={cn("p-2 flex flex-col gap-2.5 w-64 select-none", className)}
    >
      <div className="flex items-center justify-between px-0.5">
        <span className="text-xs font-semibold text-foreground">Pick Color</span>
        <Button
          variant="ghost"
          size="sm"
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSelectColor("");
          }}
          className="h-6 px-1.5 text-[11px] text-muted-foreground hover:text-destructive flex items-center gap-1 cursor-pointer"
        >
          <RotateCcw className="size-3" />
          <span>Default</span>
        </Button>
      </div>

      <ColorPicker
        defaultValue={activeColor}
        value={currentColor ? activeColor : undefined}
        onChange={(hex) => onSelectColor(hex)}
        className="gap-2.5"
      >
        <ColorPickerSelection className="h-32 rounded-md" />
        <ColorPickerHue />
        <ColorPickerAlpha />
        <div className="flex items-center gap-1.5">
          <ColorPickerEyeDropper />
          <ColorPickerOutput />
          <ColorPickerFormat />
        </div>
      </ColorPicker>
    </div>
  );
}
