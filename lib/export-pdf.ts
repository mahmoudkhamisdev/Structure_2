/**
 * Exports the rendered Markdown preview to PDF without opening the browser print dialog.
 * Uses a Playwright Chromium backend to generate high-fidelity vector PDF files with Cairo font,
 * and triggers a direct file download in the user's browser.
 */
export async function exportMarkdownToPdf(
  content?: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    if (typeof window === "undefined") {
      return {
        success: false,
        error: "Cannot export outside of browser environment",
      };
    }

    const viewerContainer = document.getElementById("viewer-container");
    const proseContainer = viewerContainer?.querySelector(".prose-container");

    if (!viewerContainer || !proseContainer) {
      console.warn(
        "Viewer container or prose element not found; falling back to window.print()",
      );
      window.print();
      return { success: true };
    }

    // Extract document title from the first markdown heading or fallback
    let docTitle = "document";
    if (content) {
      const headingMatch = content.match(/^#+\s+(.+)$/m);
      if (headingMatch && headingMatch[1]) {
        docTitle = headingMatch[1].replace(/[\\/:*?"<>|]/g, "").trim();
      }
    }

    // Clone and sanitize content: remove interactive elements like copy buttons
    const cloned = proseContainer.cloneNode(true) as HTMLElement;
    cloned
      .querySelectorAll(".code-block-copy, button, [aria-label='Copy code']")
      .forEach((el) => el.remove());

    const htmlContent = cloned.innerHTML;
    const direction = proseContainer.getAttribute("dir") || "auto";

    // 1. Send request to server-side Playwright PDF generation endpoint
    const response = await fetch("/api/export-pdf", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        html: htmlContent,
        title: docTitle,
        direction,
      }),
    });

    if (response.ok) {
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = downloadUrl;
      a.download = `${docTitle}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(downloadUrl);
      return { success: true };
    }

    console.warn("Playwright PDF API returned error, attempting fallback...");
    return fallbackPrintPdf(proseContainer, docTitle);
  } catch (error) {
    console.error("Direct PDF export failed:", error);
    const viewerContainer = document.getElementById("viewer-container");
    const proseContainer = viewerContainer?.querySelector(".prose-container");
    if (proseContainer) {
      return fallbackPrintPdf(proseContainer, "document");
    }
    return {
      success: false,
      error: "An unexpected error occurred while exporting PDF.",
    };
  }
}

/**
 * Fallback print mechanism in case the backend headless browser is unavailable
 */
function fallbackPrintPdf(
  proseContainer: Element,
  docTitle: string,
): { success: boolean } {
  try {
    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    iframe.style.opacity = "0";
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!iframeDoc) {
      window.print();
      return { success: true };
    }

    iframeDoc.title = docTitle;
    const headNodes = Array.from(
      document.querySelectorAll("link[rel='stylesheet'], style"),
    )
      .map((node) => node.outerHTML)
      .join("\n");

    const cloned = proseContainer.cloneNode(true) as HTMLElement;
    cloned
      .querySelectorAll(".code-block-copy, button, [aria-label='Copy code']")
      .forEach((el) => el.remove());

    iframeDoc.open();
    iframeDoc.write(`
      <!DOCTYPE html>
      <html dir="auto">
        <head>
          <meta charset="utf-8">
          <title>${docTitle}</title>
          ${headNodes}
        </head>
        <body dir="auto">
          <div class="prose-container">
            ${cloned.innerHTML}
          </div>
        </body>
      </html>
    `);
    iframeDoc.close();

    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 1000);
    }, 300);

    return { success: true };
  } catch {
    window.print();
    return { success: true };
  }
}
