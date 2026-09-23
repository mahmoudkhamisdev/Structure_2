"use client";

import React from "react";
import { useContentStore } from "@/store/useContentStore";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { rehypeHeadingIds } from "@/lib/outline";
import { markdownComponents } from "./_components/markdown-components";
import { ChenErdFlow } from "@/app/_components/flow/ChenErdFlow";

export function Viewer() {
  const { content, fileName, viewerTab } = useContentStore();
  const isFlow = viewerTab === "flow" || fileName?.toLowerCase().endsWith(".flow");

  if (isFlow) {
    return (
      <div className="flex-1 h-full w-full overflow-hidden bg-background">
        <ChenErdFlow />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full bg-background overflow-hidden">
      {/* Markdown Preview */}
      <div
        id="viewer-container"
        className="flex-1 w-full overflow-y-auto bg-background p-6"
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
    </div>
  );
}

