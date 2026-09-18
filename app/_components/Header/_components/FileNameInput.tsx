"use client";

import { useEffect, useState, useMemo } from "react";
import { useContentStore } from "@/store/useContentStore";
import { Folder, ChevronRight, FileText, Check } from "lucide-react";

export function FileNameInput() {
  const { fileName, setFileName, filePath } = useContentStore();
  const [localName, setLocalName] = useState(fileName);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setLocalName(fileName);
  }, [fileName]);

  const pathSegments = useMemo(() => {
    return (filePath || "workspace")
      .split("/")
      .map((s) => s.trim())
      .filter(Boolean);
  }, [filePath]);

  const handleCommit = () => {
    const trimmed = localName.trim();
    if (!trimmed) {
      setLocalName(fileName);
      return;
    }

    // Ensure it keeps its original extension or defaults to .md if none provided
    const finalName = trimmed.includes(".") ? trimmed : `${trimmed}.md`;
    setLocalName(finalName);
    setFileName(finalName);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 1500);
  };

  return (
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
      {/* Path Breadcrumbs */}
      <div className="hidden sm:flex items-center gap-1 text-muted-foreground/80">
        <Folder className="size-3.5 text-muted-foreground/60" />
        {pathSegments.map((segment, index) => (
          <div key={index} className="flex items-center gap-1">
            <span className="hover:text-foreground transition-colors cursor-default">
              {segment}
            </span>
            <ChevronRight className="size-3 text-muted-foreground/40" />
          </div>
        ))}
      </div>

      {/* Editable File Name Input */}
      <div className="group relative flex items-center gap-1.5 rounded-lg border border-border/70 bg-muted/40 px-2.5 py-1 text-foreground shadow-xs transition-all hover:border-border hover:bg-muted/60 focus-within:border-primary/60 focus-within:bg-background focus-within:ring-2 focus-within:ring-primary/20">
        <FileText className="size-3.5 text-primary shrink-0 transition-colors group-hover:text-primary" />
        
        <input
          type="text"
          value={localName}
          onChange={(e) => setLocalName(e.target.value)}
          onBlur={handleCommit}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.currentTarget.blur();
            } else if (e.key === "Escape") {
              setLocalName(fileName);
              e.currentTarget.blur();
            }
          }}
          aria-label="Edit file name"
          title="Click to edit file name"
          placeholder="document.md"
          className="w-28 sm:w-36 md:w-44 bg-transparent font-mono text-xs font-medium text-foreground placeholder:text-muted-foreground outline-none selection:bg-primary/20"
        />

        {isSaved && (
          <span className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
            <Check className="size-3" />
          </span>
        )}
      </div>
    </div>
  );
}
