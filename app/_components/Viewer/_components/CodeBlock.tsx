"use client";

import React, { useState } from "react";
import { Check, Copy, Code2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface CodeBlockProps {
  language?: string;
  codeString: string;
  children: React.ReactNode;
}

export function CodeBlock({ language, codeString, children }: CodeBlockProps) {
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopy = async () => {
    if (copied) return;
    try {
      await navigator.clipboard.writeText(codeString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy code to clipboard:", err);
    }
  };

  return (
    <div className="code-block-wrapper group relative my-5 overflow-hidden rounded-xl border border-border/70 bg-card shadow-xs transition-all">
      {/* Code Header Bar */}
      <div className="code-block-header flex h-9 items-center justify-between border-b border-border/60 bg-muted/40 px-3.5 text-xs select-none">
        <div className="flex items-center gap-2">
          {/* Decorative Window Controls */}
          <div className="code-block-dots flex items-center gap-1.5 opacity-60 transition-opacity group-hover:opacity-100">
            <span className="size-2.5 rounded-full bg-red-400/80 dark:bg-red-500/70" />
            <span className="size-2.5 rounded-full bg-amber-400/80 dark:bg-amber-500/70" />
            <span className="size-2.5 rounded-full bg-emerald-400/80 dark:bg-emerald-500/70" />
          </div>

          {/* Language Tag */}
          <div className="code-block-lang ml-2 flex items-center gap-1 text-muted-foreground">
            <Code2 className="size-3 print:hidden" />
            <span className="font-mono text-[11px] font-medium uppercase tracking-wider">
              {language || "code"}
            </span>
          </div>
        </div>

        {/* Copy Button */}
        <button
          type="button"
          onClick={handleCopy}
          aria-label="Copy code"
          className={cn(
            "code-block-copy print:hidden inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-medium transition-colors cursor-pointer",
            copied
              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              : "text-muted-foreground hover:bg-background hover:text-foreground border border-transparent hover:border-border/50"
          )}
        >
          {copied ? (
            <>
              <Check className="size-3" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="size-3" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code Content Container */}
      <div className="code-block-content relative overflow-x-auto bg-muted/20 p-4 dark:bg-zinc-950/40">
        <pre
          dir="ltr"
          className="text-left font-mono text-[13px] leading-relaxed text-foreground font-normal whitespace-pre"
        >
          <code>{children}</code>
        </pre>
      </div>
    </div>
  );

}

interface InlineCodeProps extends React.HTMLAttributes<HTMLElement> {
  children?: React.ReactNode;
}

export function InlineCode({ children, className, ...props }: InlineCodeProps) {
  return (
    <code
      dir="ltr"
      className={cn(
        "relative mx-0.5 rounded-md border border-border/50 bg-muted/80 px-1.5 py-0.5 font-mono text-[0.875em] font-medium text-foreground selection:bg-primary/20",
        className
      )}
      {...props}
    >
      {children}
    </code>
  );
}
