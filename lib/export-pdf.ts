/**
 * Exports the rendered Markdown preview to PDF without opening the browser print dialog.
 * Uses a Playwright Chromium backend to generate high-fidelity vector PDF files with Cairo font,
 * and triggers a direct file download in the user's browser.
 */
export async function exportMarkdownToPdf(
  content?: string,
): Promise<{ success: boolean; error?: string }> {
  let exportWrapper: HTMLElement | null = null;
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

    const direction = proseContainer.getAttribute("dir") || "auto";

    // Clone and sanitize content: remove interactive elements like copy buttons
    const cloned = proseContainer.cloneNode(true) as HTMLElement;
    cloned
      .querySelectorAll(".code-block-copy, button, [aria-label='Copy code']")
      .forEach((el) => el.remove());

    // Create an off-screen container styled for clean, readable light-mode A4 rendering.
    // Positioned at (0,0) with z-index -99999 so it renders at canvas origin,
    // sitting underneath the app layout invisible to the user.
    exportWrapper = document.createElement("div");
    exportWrapper.id = "pdf-render-wrapper";
    exportWrapper.className = "prose-container";
    exportWrapper.setAttribute("dir", direction);
    exportWrapper.style.position = "fixed";
    exportWrapper.style.left = "0";
    exportWrapper.style.top = "0";
    exportWrapper.style.width = "794px"; // Standard A4 width at 96 DPI
    exportWrapper.style.backgroundColor = "#ffffff";
    exportWrapper.style.color = "#0f172a";
    exportWrapper.style.padding = "36px 40px";
    exportWrapper.style.boxSizing = "border-box";
    exportWrapper.style.zIndex = "-99999";
    exportWrapper.style.pointerEvents = "none";
    exportWrapper.style.fontFamily =
      "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Cairo', sans-serif";
    exportWrapper.style.lineHeight = "1.6";

    // Style overrides to ensure pure light-mode print appearance
    const styleOverride = document.createElement("style");
    styleOverride.textContent = `
      #pdf-render-wrapper {
        background-color: #ffffff !important;
        color: #0f172a !important;
      }
      #pdf-render-wrapper * {
        box-sizing: border-box;
      }
      #pdf-render-wrapper h1, #pdf-render-wrapper h2, #pdf-render-wrapper h3, #pdf-render-wrapper h4 {
        color: #0f172a !important;
      }
      #pdf-render-wrapper p, #pdf-render-wrapper li {
        color: #334155 !important;
      }

      /* Code block container: clean sleek dark card matching preview */
      #pdf-render-wrapper .code-block-wrapper {
        background-color: #18181b !important;
        border: 1px solid #27272a !important;
        border-radius: 10px !important;
        overflow: hidden !important;
        margin: 16px 0 !important;
      }
      #pdf-render-wrapper .code-block-header {
        background-color: #27272a !important;
        border-bottom: 1px solid #3f3f46 !important;
        color: #a1a1aa !important;
      }
      #pdf-render-wrapper .code-block-header span {
        color: #a1a1aa !important;
      }
      #pdf-render-wrapper .code-block-content {
        background-color: #18181b !important;
        padding: 14px 16px !important;
      }

      /* Delete white background inside code block */
      #pdf-render-wrapper .code-block-content pre,
      #pdf-render-wrapper .code-block-content code {
        background: transparent !important;
        background-color: transparent !important;
        border: none !important;
        box-shadow: none !important;
        color: #f4f4f5 !important;
        padding: 0 !important;
        margin: 0 !important;
      }
      #pdf-render-wrapper .code-block-content pre span,
      #pdf-render-wrapper .code-block-content code span {
        color: inherit !important;
        background: transparent !important;
      }

      /* Inline code outside pre */
      #pdf-render-wrapper :not(pre) > code {
        background-color: #f1f5f9 !important;
        color: #0f172a !important;
        border: 1px solid #e2e8f0 !important;
        border-radius: 4px !important;
        padding: 2px 6px !important;
      }

      #pdf-render-wrapper table {
        border-color: #cbd5e1 !important;
      }
      #pdf-render-wrapper th, #pdf-render-wrapper td {
        border-color: #e2e8f0 !important;
        color: #0f172a !important;
      }
    `;

    exportWrapper.appendChild(styleOverride);
    exportWrapper.appendChild(cloned);
    document.body.appendChild(exportWrapper);

    // Collect DOM block boundaries for clean page breaking
    const safeCutPoints: number[] = [];
    const elements = exportWrapper.querySelectorAll(
      "h1, h2, h3, h4, h5, h6, p, li, pre, .code-block-wrapper, blockquote, table, tr, hr",
    );
    const wrapperRect = exportWrapper.getBoundingClientRect();

    // Wait for layout/fonts
    await new Promise((resolve) => setTimeout(resolve, 80));

    const { toCanvas } = await import("html-to-image");
    const { jsPDF } = await import("jspdf");

    const canvas = await toCanvas(exportWrapper, {
      pixelRatio: 2,
      backgroundColor: "#ffffff",
      cacheBust: false,
    });

    const scale = canvas.width / (exportWrapper.offsetWidth || 794);
    elements.forEach((el) => {
      const rect = el.getBoundingClientRect();
      const top = Math.round((rect.top - wrapperRect.top) * scale);
      if (top > 0) {
        safeCutPoints.push(top);
      }
    });
    safeCutPoints.sort((a, b) => a - b);

    // Cleanup off-screen element immediately after canvas capture
    if (document.body.contains(exportWrapper)) {
      document.body.removeChild(exportWrapper);
    }
    exportWrapper = null;

    if (!canvas || canvas.width === 0 || canvas.height === 0) {
      throw new Error("Rendered canvas is empty");
    }

    const canvasCtx = canvas.getContext("2d");

    // A4 dimensions in mm: 210 x 297
    const pdf = new jsPDF({
      orientation: "p",
      unit: "mm",
      format: "a4",
      compress: true,
    });

    const pageWidth = 210;
    const pageHeight = 297;
    const marginX = 12;
    const marginY = 12;
    const printableWidth = pageWidth - marginX * 2; // 186mm
    const printableHeight = pageHeight - marginY * 2; // 273mm

    // Calculate height of one A4 page in canvas pixels
    const pagePixelHeight = Math.floor(
      canvas.width * (printableHeight / printableWidth),
    );

    let renderedHeight = 0;
    let pageIndex = 0;

    // Slice canvas page by page using smart text-aware boundaries
    while (renderedHeight < canvas.height) {
      if (pageIndex > 0) {
        pdf.addPage();
      }

      const remainingHeight = canvas.height - renderedHeight;
      let chunkHeight = Math.min(pagePixelHeight, remainingHeight);

      // If content spans to next page, find a clean cut that avoids slicing text
      if (remainingHeight > pagePixelHeight) {
        const targetY = renderedHeight + pagePixelHeight;
        const minY = renderedHeight + Math.floor(pagePixelHeight * 0.7);
        const cleanCutY = findCleanCutY(
          canvasCtx,
          canvas.width,
          targetY,
          minY,
          safeCutPoints,
        );
        chunkHeight = Math.max(10, cleanCutY - renderedHeight);
      }

      // Create a canvas slice for this specific page
      const sliceCanvas = document.createElement("canvas");
      sliceCanvas.width = canvas.width;
      sliceCanvas.height = chunkHeight;

      const sliceCtx = sliceCanvas.getContext("2d");
      if (sliceCtx) {
        sliceCtx.fillStyle = "#ffffff";
        sliceCtx.fillRect(0, 0, sliceCanvas.width, chunkHeight);
        sliceCtx.drawImage(
          canvas,
          0,
          renderedHeight,
          canvas.width,
          chunkHeight,
          0,
          0,
          canvas.width,
          chunkHeight,
        );
      }

      const sliceDataUrl = sliceCanvas.toDataURL("image/jpeg", 0.95);
      const pdfChunkHeightMm = (chunkHeight * printableWidth) / canvas.width;

      pdf.addImage(
        sliceDataUrl,
        "JPEG",
        marginX,
        marginY,
        printableWidth,
        pdfChunkHeightMm,
      );

      renderedHeight += chunkHeight;
      pageIndex++;
    }

    pdf.save(`${docTitle}.pdf`);
    return { success: true };
  } catch (error) {
    if (exportWrapper && document.body.contains(exportWrapper)) {
      document.body.removeChild(exportWrapper);
    }
    console.warn(
      "Direct PDF generation failed, attempting fallback print:",
      error,
    );
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
 * Fallback print mechanism in case canvas generation is unavailable
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
        <body dir="auto" style="background:#ffffff;color:#0f172a;">
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

/**
 * Finds a clean break line that does not slice through text.
 * Prioritizes DOM element boundaries (headings, paragraphs, lists, code blocks),
 * and falls back to scanning for blank pixel rows (whitespace between lines of text).
 */
function findCleanCutY(
  ctx: CanvasRenderingContext2D | null,
  width: number,
  targetY: number,
  minY: number,
  safeCutPoints: number[],
): number {
  // 1. Try to cut at a DOM element boundary (h1-h6, p, li, pre, etc.)
  for (let i = safeCutPoints.length - 1; i >= 0; i--) {
    const pt = safeCutPoints[i];
    if (pt <= targetY && pt >= minY && targetY - pt <= 350) {
      return pt;
    }
  }

  // 2. Scan pixel rows from targetY upwards to find a blank row between lines of text
  if (!ctx) return targetY;

  const searchStartY = Math.max(minY, targetY - 250);
  const searchHeight = targetY - searchStartY;
  if (searchHeight <= 0) return targetY;

  try {
    const imgData = ctx.getImageData(0, searchStartY, width, searchHeight);
    const data = imgData.data;

    // Scan from targetY upwards
    for (let row = searchHeight - 1; row >= 0; row--) {
      let hasDarkText = false;
      const rowOffset = row * width * 4;

      // Sample pixels across this row
      for (let col = 0; col < width; col += 3) {
        const idx = rowOffset + col * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];
        const a = data[idx + 3];

        // Dark text glyphs have low RGB values (< 190) and visible alpha
        if (a > 50 && (r < 190 || g < 190 || b < 190)) {
          hasDarkText = true;
          break;
        }
      }

      // If no dark text found in this row, this is a clean gap between lines
      if (!hasDarkText) {
        return searchStartY + row;
      }
    }
  } catch {
    // If getImageData fails, fallback safely to targetY
    return targetY;
  }

  return targetY;
}

