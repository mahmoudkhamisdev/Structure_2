"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  Copy,
  Check,
  ChevronDown,
  Info,
  ArrowRight,
  Database,
  Diamond,
  Square,
  Circle,
  Layers,
  Code2,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "cn";

export const AI_FLOW_PROMPT_TEMPLATE = `Create a flowchart using this exact syntax:

Nodes & Shapes:
- (Start) or (End) : Terminator shape (pill/rounded)
- [Process Name] : Standard process function (rectangle)
- <Condition?> or {Condition?} : Decision branch (diamond)
- [(Database Name)] : Database / Storage (cylinder)
- [/Input or Output Data/] : Data I/O (parallelogram)
- [[Subroutine Name]] : Predefined process / subroutine

Connections & Branches:
- Direct arrow: [Node A] -> [Node B]
- Labeled branch: <Condition?> -- Yes -> [Node B]
- Labeled branch: <Condition?> -- No -> [Node C]
- Chained connections: [Node A] -> [Node B] -> (End)
- Loop-backs: [Node C] -> [Node A]

Formatting Rules:
- Put one connection per line or chain with ->
- Use descriptive labels inside the brackets
- Lines starting with # or // are ignored as titles or comments

Example:
# User Authentication Flow
[Start] -> [Input Credentials]
[Input Credentials] -> <Verify Account>
<Verify Account> -- Valid -> [(User Database)]
[(User Database)] -> [Open Dashboard]
[Open Dashboard] -> (End)
<Verify Account> -- Invalid -> [Show Error Alert]
[Show Error Alert] -> [Input Credentials]`;

export function EditorFlowGuide() {
  const [copied, setCopied] = useState(false);

  const handleCopyAiPrompt = async () => {
    try {
      await navigator.clipboard.writeText(AI_FLOW_PROMPT_TEMPLATE);
      setCopied(true);
      toast.success("AI prompt guide copied to clipboard! Paste it to ChatGPT/Claude.");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
      toast.error("Failed to copy to clipboard");
    }
  };

  return (
    <div className="border-b border-border/80 bg-muted/30 text-xs select-none shrink-0 transition-all">
      {/* Top Banner Bar */}
      <div className="flex items-center justify-end px-3 py-1.5 gap-2 flex-wrap">
        <Button
          type="button"
          size="sm"
          variant={"outline"}
          onClick={handleCopyAiPrompt}
          className="h-6 px-2.5 text-[11px]"
          title="Copy prompt guide to send to AI (ChatGPT / Claude / Gemini)"
        >
          {copied ? (
            <>
              <Check className="size-3 text-green-600" />
              <span className="text-green-600">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="size-3" />
              <span>Copy Prompt</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
