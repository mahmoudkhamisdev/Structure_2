/**
 * Document export utilities for Markdown content:
 * - PDF (via Playwright server API or fallback)
 * - Microsoft Word (.doc format with Office XML)
 * - HTML Webpage (.html standalone format)
 * - Copy HTML code to clipboard
 */

import { generateExportHtml } from "./export-template";

export interface ExportData {
  docTitle: string;
  sanitizedHtml: string;
  direction: string;
}

export interface ExportDataOptions {
  preserveInteractive?: boolean;
}

/**
 * Extracts and sanitizes the rendered HTML from the viewer container.
 */
export function getExportData(
  content?: string,
  options?: ExportDataOptions
): ExportData | null {
  if (typeof window === "undefined") return null;

  const viewerContainer = document.getElementById("viewer-container");
  const proseContainer = viewerContainer?.querySelector(".prose-container");

  if (!viewerContainer || !proseContainer) {
    return null;
  }

  let docTitle = "document";
  if (content) {
    const headingMatch = content.match(/^#+\s+(.+)$/m);
    if (headingMatch && headingMatch[1]) {
      docTitle = headingMatch[1].replace(/[\\/:*?"<>|]/g, "").trim();
    }
  }

  const cloned = proseContainer.cloneNode(true) as HTMLElement;
  if (!options?.preserveInteractive) {
    cloned
      .querySelectorAll(".code-block-copy, button, [aria-label='Copy code']")
      .forEach((el) => el.remove());
  }

  const sanitizedHtml = cloned.innerHTML;
  const direction = proseContainer.getAttribute("dir") || "auto";

  return { docTitle, sanitizedHtml, direction };
}

/**
 * Triggers a client-side file download using a Blob.
 */
function downloadBlob(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.style.display = "none";
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

/**
 * Exports the Markdown preview as a Microsoft Word document (.doc).
 * Word natively renders HTML documents with Office XML metadata.
 */
export async function exportMarkdownToWord(content?: string): Promise<boolean> {
  try {
    const data = getExportData(content);
    if (!data) return false;

    const { docTitle, sanitizedHtml, direction } = data;

    const wordHtml = generateExportHtml({
      title: docTitle,
      html: sanitizedHtml,
      direction,
      mode: "word",
    });

    const blob = new Blob(["\ufeff", wordHtml], {
      type: "application/msword;charset=utf-8",
    });

    downloadBlob(blob, `${docTitle}.doc`);
    return true;
  } catch (err) {
    console.error("Failed to export Word document:", err);
    return false;
  }
}

/**
 * Exports the Markdown preview as a standalone, styled HTML webpage (.html).
 */
export async function exportMarkdownToHtml(content?: string): Promise<boolean> {
  try {
    const data = getExportData(content, { preserveInteractive: true });
    if (!data) return false;

    const { docTitle, sanitizedHtml, direction } = data;

    const htmlDocument = generateExportHtml({
      title: docTitle,
      html: sanitizedHtml,
      direction,
      mode: "html",
    });

    const blob = new Blob([htmlDocument], {
      type: "text/html;charset=utf-8",
    });

    downloadBlob(blob, `${docTitle}.html`);
    return true;
  } catch (err) {
    console.error("Failed to export HTML document:", err);
    return false;
  }
}

/**
 * Copies the styled HTML code directly to clipboard.
 */
export async function copyMarkdownHtml(content?: string): Promise<boolean> {
  try {
    const data = getExportData(content, { preserveInteractive: true });
    if (!data) return false;

    const htmlDocument = generateExportHtml({
      title: data.docTitle,
      html: data.sanitizedHtml,
      direction: data.direction,
      mode: "html",
    });

    await navigator.clipboard.writeText(htmlDocument);
    return true;
  } catch (err) {
    console.error("Failed to copy HTML code to clipboard:", err);
    return false;
  }
}
