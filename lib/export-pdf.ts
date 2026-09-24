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
      const prevTitle = document.title;
      document.title = "";
      window.print();
      document.title = prevTitle;
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
    iframe.style.top = "-10000px";
    iframe.style.left = "-10000px";
    iframe.style.width = "1024px";
    iframe.style.height = "768px";
    iframe.style.border = "0";
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!iframeDoc) {
      const prevTitle = document.title;
      document.title = "";
      window.print();
      document.title = prevTitle;
      return { success: true };
    }

    // Set empty title so browser does not print page title in header
    iframeDoc.title = "";

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
          <title></title>
          ${headNodes}
          <style>
            @page {
              size: auto;
              margin: 0mm !important; /* Removes browser automatic headers (title, date) and footers */
            }
            html, body {
              margin: 0 !important;
              padding: 0 !important;
              background: #ffffff !important;
              color: #0f172a !important;
              height: auto !important;
              overflow: visible !important;
            }
            .prose-container {
              width: 100% !important;
              max-width: 100% !important;
              padding: 16mm 18mm !important;
              box-sizing: border-box !important;
              margin: 0 auto !important;
            }
          </style>
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
      }, 1500);
    }, 300);

    return { success: true };
  } catch {
    const prevTitle = document.title;
    document.title = "";
    window.print();
    document.title = prevTitle;
    return { success: true };
  }
}
