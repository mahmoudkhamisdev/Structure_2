/**
 * Export react-flow diagram as PNG, SVG, or PDF with transparent background
 */
export async function exportFlowDiagram(
  format: "png" | "svg" | "pdf",
  fileName?: string
): Promise<boolean> {
  const element = document.querySelector(".react-flow") as HTMLElement | null;
  if (!element) {
    throw new Error("Flow diagram canvas not found. Make sure the diagram is visible.");
  }

  const baseName =
    (fileName ? fileName.replace(/\.flow$/i, "").replace(/\.md$/i, "") : "") ||
    "diagram";

  const filter = (node: HTMLElement) => {
    if (node.classList) {
      if (
        node.classList.contains("react-flow__panel") ||
        node.classList.contains("react-flow__controls") ||
        node.classList.contains("react-flow__attribution") ||
        node.classList.contains("react-flow__background") ||
        node.classList.contains("react-flow__minimap") ||
        node.tagName === "ASIDE"
      ) {
        return false;
      }
    }
    return true;
  };

  const exportOptions = {
    filter,
    backgroundColor: undefined,
    style: {
      backgroundColor: "transparent",
      background: "transparent",
    },
  };

  if (format === "png") {
    const { toPng } = await import("html-to-image");
    const dataUrl = await toPng(element, {
      ...exportOptions,
      pixelRatio: 2,
    });
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `${baseName}.png`;
    a.click();
    return true;
  }

  if (format === "svg") {
    const { toSvg } = await import("html-to-image");
    const dataUrl = await toSvg(element, exportOptions);
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `${baseName}.svg`;
    a.click();
    return true;
  }

  if (format === "pdf") {
    const { toPng } = await import("html-to-image");
    const { jsPDF } = await import("jspdf");
    const dataUrl = await toPng(element, {
      ...exportOptions,
      pixelRatio: 2,
    });
    const width = element.offsetWidth;
    const height = element.offsetHeight;
    const orientation = width > height ? "l" : "p";
    const pdf = new jsPDF(orientation, "px", [width, height]);
    pdf.addImage(dataUrl, "PNG", 0, 0, width, height);
    pdf.save(`${baseName}.pdf`);
    return true;
  }

  return false;
}
