"use client";

import { useContentStore } from "@/store/useContentStore";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { rehypeHeadingIds } from "@/lib/outline";
import { markdownComponents } from "./_components/markdown-components";

export function Viewer() {
    const { content } = useContentStore();

    return (
        <div
            id="viewer-container"
            className="h-full w-full overflow-y-auto bg-background p-6"
        >
            <div className="min-h-full w-full flex flex-col gap-8 outline-none">
                {/* The ReactMarkdown Preview */}
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
    );
}
