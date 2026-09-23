"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useContentStore } from "@/store/useContentStore";
import { exportMarkdownToPdf } from "@/lib/export-pdf";
import {
  exportMarkdownToWord,
  exportMarkdownToHtml,
  copyMarkdownHtml,
} from "@/lib/export-document";
import { exportFlowDiagram } from "@/app/_components/flow/exportFlow";
import { toast } from "sonner";
import {
  Download,
  FileText,
  FileCode,
  FileEdit,
  Image as ImageIcon,
  Copy,
  Check,
  ChevronDown,
  Loader2,
} from "lucide-react";

export function ExportDropdown() {
  const { content, fileName, viewerTab } = useContentStore();
  const [exportingType, setExportingType] = useState<string | null>(null);
  const [copiedHtml, setCopiedHtml] = useState<boolean>(false);

  const isFlow = viewerTab === "flow" || fileName?.toLowerCase().endsWith(".flow");

  const handleExportDiagram = async (format: "png" | "svg" | "pdf") => {
    if (exportingType) return;
    setExportingType(format);

    const labels = {
      png: "PNG image",
      svg: "SVG vector",
      pdf: "PDF document",
    };

    const exportPromise = exportFlowDiagram(format, fileName).then((res) => {
      if (!res) throw new Error(`Failed to generate ${labels[format]}`);
      return res;
    });

    toast.promise(exportPromise, {
      loading: `Generating ${labels[format]}...`,
      success: `${labels[format]} downloaded successfully!`,
      error: (err) => err?.message || `Failed to generate ${labels[format]}`,
    });

    try {
      await exportPromise;
    } catch (err) {
      console.error("Diagram export error:", err);
    } finally {
      setExportingType(null);
    }
  };

  const handleExportPdf = async () => {
    if (exportingType) return;
    setExportingType("pdf");

    const exportPromise = exportMarkdownToPdf(content).then((res) => {
      if (!res) {
        throw new Error("Failed to generate PDF document");
      }
      return res;
    });

    toast.promise(exportPromise, {
      loading: "Generating PDF document...",
      success: "PDF file downloaded successfully!",
      error: (err) => err?.message || "Failed to generate PDF document",
    });

    try {
      await exportPromise;
    } catch (err) {
      console.error("PDF Export error:", err);
    } finally {
      setExportingType(null);
    }
  };

  const handleExportWord = async () => {
    if (exportingType) return;
    setExportingType("word");

    const exportPromise = exportMarkdownToWord(content).then((success) => {
      if (!success) {
        throw new Error("Failed to create Word document");
      }
      return success;
    });

    toast.promise(exportPromise, {
      loading: "Preparing Word document...",
      success: "Word document (.doc) downloaded!",
      error: "Failed to export Word document",
    });

    try {
      await exportPromise;
    } catch (err) {
      console.error("Word Export error:", err);
    } finally {
      setExportingType(null);
    }
  };

  const handleExportHtml = async () => {
    if (exportingType) return;
    setExportingType("html");

    const exportPromise = exportMarkdownToHtml(content).then((success) => {
      if (!success) {
        throw new Error("Failed to create HTML document");
      }
      return success;
    });

    toast.promise(exportPromise, {
      loading: "Generating HTML webpage...",
      success: "HTML webpage (.html) downloaded!",
      error: "Failed to export HTML webpage",
    });

    try {
      await exportPromise;
    } catch (err) {
      console.error("HTML Export error:", err);
    } finally {
      setExportingType(null);
    }
  };

  const handleCopyHtml = async () => {
    if (copiedHtml) return;
    try {
      const success = await copyMarkdownHtml(content);
      if (success) {
        setCopiedHtml(true);
        toast.success("HTML code copied to clipboard!");
        setTimeout(() => setCopiedHtml(false), 2000);
      } else {
        toast.error("Failed to copy HTML code");
      }
    } catch (err) {
      console.error("Copy HTML error:", err);
      toast.error("Failed to copy HTML code");
    }
  };

  const isBusy = exportingType !== null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            disabled={isBusy}
            className="h-8 w-8 sm:w-auto p-0 sm:px-2.5 gap-1.5 text-xs font-medium cursor-pointer transition-colors hover:bg-accent"
            aria-label={isFlow ? "Export Diagram Menu" : "Export Document Menu"}
          >
            {isBusy ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Download className="size-3.5 text-primary" />
            )}
            <span className="hidden sm:inline">
              {isFlow ? "Export Diagram" : "Export Document"}
            </span>
            <ChevronDown className="size-3 opacity-60 ml-0.5 hidden sm:inline" />
          </Button>
        }
      />

      <DropdownMenuContent
        align="end"
        side="bottom"
        sideOffset={6}
        className="w-52 rounded-xl p-1.5 shadow-lg"
      >
        {isFlow ? (
          <DropdownMenuGroup>
            <DropdownMenuLabel className="text-xs font-medium text-muted-foreground px-2 py-1.5">
              Export Diagram
            </DropdownMenuLabel>

            {/* Export as PNG */}
            <DropdownMenuItem
              onClick={() => handleExportDiagram("png")}
              disabled={isBusy}
              className="flex items-center justify-between gap-2 px-2.5 py-2 cursor-pointer text-xs rounded-lg hover:bg-accent focus:bg-accent"
            >
              <div className="flex items-center gap-2">
                <ImageIcon className="size-4 text-emerald-500 shrink-0" />
                <div className="flex flex-col text-left">
                  <span className="font-medium text-foreground">PNG Image</span>
                  <span className="text-[10px] text-muted-foreground">High resolution image (.png)</span>
                </div>
              </div>
              {exportingType === "png" && (
                <Loader2 className="size-3 animate-spin text-muted-foreground" />
              )}
            </DropdownMenuItem>

            {/* Export as SVG */}
            <DropdownMenuItem
              onClick={() => handleExportDiagram("svg")}
              disabled={isBusy}
              className="flex items-center justify-between gap-2 px-2.5 py-2 cursor-pointer text-xs rounded-lg hover:bg-accent focus:bg-accent"
            >
              <div className="flex items-center gap-2">
                <FileCode className="size-4 text-amber-500 shrink-0" />
                <div className="flex flex-col text-left">
                  <span className="font-medium text-foreground">SVG Vector</span>
                  <span className="text-[10px] text-muted-foreground">Scalable vector graphic (.svg)</span>
                </div>
              </div>
              {exportingType === "svg" && (
                <Loader2 className="size-3 animate-spin text-muted-foreground" />
              )}
            </DropdownMenuItem>

            {/* Export as PDF */}
            <DropdownMenuItem
              onClick={() => handleExportDiagram("pdf")}
              disabled={isBusy}
              className="flex items-center justify-between gap-2 px-2.5 py-2 cursor-pointer text-xs rounded-lg hover:bg-accent focus:bg-accent"
            >
              <div className="flex items-center gap-2">
                <FileText className="size-4 text-red-500 shrink-0" />
                <div className="flex flex-col text-left">
                  <span className="font-medium text-foreground">PDF Document</span>
                  <span className="text-[10px] text-muted-foreground">Printable document (.pdf)</span>
                </div>
              </div>
              {exportingType === "pdf" && (
                <Loader2 className="size-3 animate-spin text-muted-foreground" />
              )}
            </DropdownMenuItem>
          </DropdownMenuGroup>
        ) : (
          <>
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-xs font-medium text-muted-foreground px-2 py-1.5">
                Export Document
              </DropdownMenuLabel>

              {/* Export as PDF */}
              <DropdownMenuItem
                onClick={handleExportPdf}
                disabled={isBusy}
                className="flex items-center justify-between gap-2 px-2.5 py-2 cursor-pointer text-xs rounded-lg hover:bg-accent focus:bg-accent"
              >
                <div className="flex items-center gap-2">
                  <FileText className="size-4 text-red-500 shrink-0" />
                  <div className="flex flex-col text-left">
                    <span className="font-medium text-foreground">PDF Document</span>
                    <span className="text-[10px] text-muted-foreground">Vector printable file (.pdf)</span>
                  </div>
                </div>
                {exportingType === "pdf" && (
                  <Loader2 className="size-3 animate-spin text-muted-foreground" />
                )}
              </DropdownMenuItem>

              {/* Export as Word */}
              <DropdownMenuItem
                onClick={handleExportWord}
                disabled={isBusy}
                className="flex items-center justify-between gap-2 px-2.5 py-2 cursor-pointer text-xs rounded-lg hover:bg-accent focus:bg-accent"
              >
                <div className="flex items-center gap-2">
                  <FileEdit className="size-4 text-blue-500 shrink-0" />
                  <div className="flex flex-col text-left">
                    <span className="font-medium text-foreground">Word Document</span>
                    <span className="text-[10px] text-muted-foreground">Editable Microsoft Word (.doc)</span>
                  </div>
                </div>
                {exportingType === "word" && (
                  <Loader2 className="size-3 animate-spin text-muted-foreground" />
                )}
              </DropdownMenuItem>

              {/* Export as HTML Webpage */}
              <DropdownMenuItem
                onClick={handleExportHtml}
                disabled={isBusy}
                className="flex items-center justify-between gap-2 px-2.5 py-2 cursor-pointer text-xs rounded-lg hover:bg-accent focus:bg-accent"
              >
                <div className="flex items-center gap-2">
                  <FileCode className="size-4 text-amber-500 shrink-0" />
                  <div className="flex flex-col text-left">
                    <span className="font-medium text-foreground">HTML Webpage</span>
                    <span className="text-[10px] text-muted-foreground">Standalone webpage (.html)</span>
                  </div>
                </div>
                {exportingType === "html" && (
                  <Loader2 className="size-3 animate-spin text-muted-foreground" />
                )}
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator className="my-1" />

            {/* Copy HTML Code */}
            <DropdownMenuItem
              onClick={handleCopyHtml}
              className="flex items-center justify-between gap-2 px-2.5 py-2 cursor-pointer text-xs rounded-lg hover:bg-accent focus:bg-accent"
            >
              <div className="flex items-center gap-2">
                {copiedHtml ? (
                  <Check className="size-4 text-emerald-500 shrink-0" />
                ) : (
                  <Copy className="size-4 text-muted-foreground shrink-0" />
                )}
                <div className="flex flex-col text-left">
                  <span className="font-medium text-foreground">
                    {copiedHtml ? "Copied to Clipboard!" : "Copy HTML Code"}
                  </span>
                  <span className="text-[10px] text-muted-foreground">Raw formatted HTML markup</span>
                </div>
              </div>
              {copiedHtml && <span className="text-[10px] font-semibold text-emerald-500">Done</span>}
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
