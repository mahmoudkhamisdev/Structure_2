"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText, Network, Folder, Plus } from "lucide-react";
import { cn } from "cn";
import { FileType } from "../types";

export interface CreateFileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetFolder: { id: string; name: string } | null;
  onSubmit: (data: {
    name: string;
    fileType: FileType;
    folderId: string | null;
  }) => void;
}

export function CreateFileDialog({
  open,
  onOpenChange,
  targetFolder,
  onSubmit,
}: CreateFileDialogProps) {
  const [fileType, setFileType] = React.useState<FileType>("md");
  const [fileName, setFileName] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (open) {
      setFileType("md");
      setFileName("");
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 60);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let trimmed = fileName.trim();

    // Strip redundant extensions if typed by the user
    if (trimmed.toLowerCase().endsWith(`.${fileType}`)) {
      trimmed = trimmed.slice(0, -(fileType.length + 1)).trim();
    } else if (trimmed.toLowerCase().endsWith(".md")) {
      trimmed = trimmed.slice(0, -3).trim();
    } else if (trimmed.toLowerCase().endsWith(".flow")) {
      trimmed = trimmed.slice(0, -5).trim();
    }

    const baseName = trimmed || (fileType === "flow" ? "diagram" : "note");
    const finalName = `${baseName}.${fileType}`;

    onSubmit({
      name: finalName,
      fileType,
      folderId: targetFolder ? targetFolder.id : null,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle className="text-base">
            Create New File
          </DialogTitle>
          <DialogDescription className="flex items-center gap-1.5 pt-0.5 text-xs">
            <span>Location:</span>
            {targetFolder ? (
              <span className="inline-flex items-center gap-1 font-medium text-foreground bg-muted/80 px-2 py-0.5 rounded text-xs">
                <Folder className="size-3 text-primary" />
                {targetFolder.name}
              </span>
            ) : (
              <span className="inline-flex items-center font-medium text-foreground bg-muted/80 px-2 py-0.5 rounded text-xs">
                Root
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* File Type Selector */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              File Format
            </Label>
            <div className="grid grid-cols-2 gap-2.5">
              {/* Markdown Option */}
              <button
                type="button"
                onClick={() => setFileType("md")}
                className={cn(
                  "flex flex-col items-start p-3 rounded-lg border text-left transition-all cursor-pointer relative",
                  fileType === "md"
                    ? "border-primary bg-primary/5 ring-1 ring-primary shadow-xs"
                    : "border-border/70 bg-card hover:bg-accent/40 hover:border-border"
                )}
              >
                <div className="flex items-center justify-between w-full mb-1.5">
                  <div
                    className={cn(
                      "p-1.5 rounded-md",
                      fileType === "md"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    <FileText className="size-4" />
                  </div>
                  <span
                    className={cn(
                      "text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded",
                      fileType === "md"
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    .md
                  </span>
                </div>
                <div className="font-medium text-xs text-foreground">Markdown</div>
                <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">
                  Rich text notes with preview & outlines
                </p>
              </button>

              {/* Flow Option */}
              <button
                type="button"
                onClick={() => setFileType("flow")}
                className={cn(
                  "flex flex-col items-start p-3 rounded-lg border text-left transition-all cursor-pointer relative",
                  fileType === "flow"
                    ? "border-emerald-500 bg-emerald-500/5 ring-1 ring-emerald-500 shadow-xs"
                    : "border-border/70 bg-card hover:bg-accent/40 hover:border-border"
                )}
              >
                <div className="flex items-center justify-between w-full mb-1.5">
                  <div
                    className={cn(
                      "p-1.5 rounded-md",
                      fileType === "flow"
                        ? "bg-emerald-600 text-white"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    <Network className="size-4" />
                  </div>
                  <span
                    className={cn(
                      "text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded",
                      fileType === "flow"
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    .flow
                  </span>
                </div>
                <div className="font-medium text-xs text-foreground">Flow Diagram</div>
                <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">
                  Chen ERD visual canvas & relationship builder
                </p>
              </button>
            </div>
          </div>

          {/* File Name Input */}
          <div className="space-y-2">
            <Label
              htmlFor="file-name-input"
              className="text-xs font-semibold text-muted-foreground uppercase tracking-wider"
            >
              File Name
            </Label>
            <div className="relative flex items-center">
              <Input
                id="file-name-input"
                ref={inputRef}
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder={fileType === "flow" ? "erd-diagram" : "notes"}
                className=" text-sm pr-16 font-mono shadow-xs"
                autoComplete="off"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-xs font-medium text-muted-foreground pointer-events-none select-none bg-muted px-2 py-1 rounded">
                .{fileType}
              </span>
            </div>
          </div>

          <DialogFooter className="pt-3 gap-2">
            <Button
              type="button"
              variant="outline"
              className=" px-4 text-sm cursor-pointer"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className=" px-4 text-sm gap-2 cursor-pointer"
            >
              <Plus className="size-4" />
              Create {fileType === "flow" ? "Flow File" : "Markdown File"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
