import type { Components } from "react-markdown";
import { CodeBlock, InlineCode } from "./CodeBlock";
import { cn } from "@/lib/utils";

/**
 * Custom ReactMarkdown component definitions.
 * Provides clean typography, code block rendering, responsive tables,
 * and automatic text-direction (LTR/RTL) support.
 */
export const markdownComponents: Components = {
    // Headings
    h1: ({ node, className, ...props }) => (
        <h1
            dir="auto"
            className={cn(
                "scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl mb-4 mt-8",
                className
            )}
            {...props}
        />
    ),
    h2: ({ node, className, ...props }) => (
        <h2
            dir="auto"
            className={cn(
                "scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0 mb-4 mt-8",
                className
            )}
            {...props}
        />
    ),
    h3: ({ node, className, ...props }) => (
        <h3
            dir="auto"
            className={cn(
                "scroll-m-20 text-2xl font-semibold tracking-tight mb-4 mt-6",
                className
            )}
            {...props}
        />
    ),
    h4: ({ node, className, ...props }) => (
        <h4
            dir="auto"
            className={cn(
                "scroll-m-20 text-xl font-semibold tracking-tight mb-4 mt-6",
                className
            )}
            {...props}
        />
    ),
    h5: ({ node, className, ...props }) => (
        <h5
            dir="auto"
            className={cn(
                "scroll-m-20 text-lg font-semibold tracking-tight mb-2 mt-4",
                className
            )}
            {...props}
        />
    ),
    h6: ({ node, className, ...props }) => (
        <h6
            dir="auto"
            className={cn(
                "scroll-m-20 text-base font-semibold tracking-tight mb-2 mt-4",
                className
            )}
            {...props}
        />
    ),

    // Paragraphs & Text Content
    p: ({ node, className, ...props }) => (
        <p
            dir="auto"
            className={cn("leading-7 not-first:mt-6", className)}
            {...props}
        />
    ),
    strong: ({ node, className, ...props }) => (
        <strong dir="auto" className={cn("font-bold", className)} {...props} />
    ),
    em: ({ node, className, ...props }) => (
        <em dir="auto" className={cn("italic", className)} {...props} />
    ),
    del: ({ node, className, ...props }) => (
        <del
            dir="auto"
            className={cn("line-through text-muted-foreground", className)}
            {...props}
        />
    ),

    // Lists
    ul: ({ node, className, ...props }) => (
        <ul
            dir="auto"
            className={cn("my-6 ml-6 list-disc [&>li]:mt-2", className)}
            {...props}
        />
    ),
    ol: ({ node, className, ...props }) => (
        <ol
            dir="auto"
            className={cn("my-6 ml-6 list-decimal [&>li]:mt-2", className)}
            {...props}
        />
    ),
    li: ({ node, ...props }) => <li dir="auto" {...props} />,

    // Code & Pre
    pre: ({ children }) => (
        <div className="my-2 not-prose w-full">{children}</div>
    ),
    code: ({ node, className, children, ...props }) => {
        const codeString = String(children || "").replace(/\n$/, "");
        const match = /language-(\w+)/.exec(className || "");
        const isBlock = Boolean(match) || String(children || "").includes("\n");

        if (isBlock) {
            return (
                <CodeBlock
                    language={match ? match[1] : undefined}
                    codeString={codeString}
                >
                    {children}
                </CodeBlock>
            );
        }

        return (
            <InlineCode className={className} {...props}>
                {children}
            </InlineCode>
        );
    },

    // Quotes & Links
    blockquote: ({ node, className, ...props }) => (
        <blockquote
            dir="auto"
            className={cn(
                "mt-6 border-l-2 border-primary pl-6 italic text-muted-foreground",
                className
            )}
            {...props}
        />
    ),
    a: ({ node, className, ...props }) => (
        <a
            dir="auto"
            className={cn(
                "text-primary underline underline-offset-4 hover:text-primary/80 transition-colors",
                className
            )}
            target="_blank"
            rel="noopener noreferrer"
            {...props}
        />
    ),

    // Tables
    table: ({ node, className, ...props }) => (
        <div className="my-6 w-full overflow-x-auto">
            <table
                dir="auto"
                className={cn("w-full border-collapse", className)}
                {...props}
            />
        </div>
    ),
    th: ({ node, className, ...props }) => (
        <th
            dir="auto"
            className={cn(
                "border px-4 py-2 font-bold [[align=center]]:text-center [[align=right]]:text-right bg-muted/40",
                className
            )}
            {...props}
        />
    ),
    td: ({ node, className, ...props }) => (
        <td
            dir="auto"
            className={cn(
                "border px-4 py-2 [[align=center]]:text-center [[align=right]]:text-right",
                className
            )}
            {...props}
        />
    ),

    // Divider
    hr: ({ node, className, ...props }) => (
        <hr className={cn("my-6 border-border/60", className)} {...props} />
    ),
};
