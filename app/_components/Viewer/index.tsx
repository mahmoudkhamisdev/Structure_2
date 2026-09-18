"use client";

import React, { useState } from "react";
import { useContentStore } from "@/store/useContentStore";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { rehypeHeadingIds } from "@/lib/outline";
import { markdownComponents } from "./_components/markdown-components";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChenErdFlow } from "./_components/flow/ChenErdFlow";
import { Eye, Network } from "lucide-react";
import { cn } from "cn";

export function Viewer() {
  const { content, viewerTab, setViewerTab } = useContentStore();

  return (
    <div className="flex flex-col h-full w-full bg-background overflow-hidden">
      {/* Viewer Header with Shadcn Tabs */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-border bg-muted/20 shrink-0">
        <Tabs
          value={viewerTab}
          onValueChange={(val) => setViewerTab(val as "viewer" | "flow")}
          className="w-auto"
        >
          <TabsList className="h-7 bg-muted/60 p-0.5">
            <TabsTrigger
              value="viewer"
              className="h-6 px-2.5 text-xs gap-1.5 data-active:bg-background data-active:shadow-2xs"
            >
              <Eye className="size-3.5" />
              <span>Viewer</span>
            </TabsTrigger>
            <TabsTrigger
              value="flow"
              className="h-6 px-2.5 text-xs gap-1.5 data-active:bg-background data-active:shadow-2xs"
            >
              <Network className="size-3.5" />
              <span>Flow</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {viewerTab === "flow" && (
          <span className="text-[11px] font-mono text-muted-foreground hidden sm:inline-block">
            Chen ERD Notation
          </span>
        )}
      </div>

      {/* Tab Content 1: Markdown Preview */}
      <div
        id="viewer-container"
        className={cn(
          "flex-1 w-full overflow-y-auto bg-background p-6",
          viewerTab !== "viewer" && "hidden"
        )}
      >
        <div className="min-h-full w-full flex flex-col gap-8 outline-none">
          <div dir="auto" className="prose-container">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw, rehypeHeadingIds]}
              components={markdownComponents}
            >
              {content || ""}
            </ReactMarkdown>
          </div>
        </div>
      </div>

      {/* Tab Content 2: Conceptual ERD Chen Notation React Flow */}
      <div
        className={cn(
          "flex-1 h-full w-full overflow-hidden",
          viewerTab !== "flow" && "hidden"
        )}
      >
        <ChenErdFlow />
      </div>
    </div>
  );
}

