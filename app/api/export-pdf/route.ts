import { NextRequest, NextResponse } from "next/server";
import { chromium } from "playwright";
import { generateExportHtml } from "@/lib/export-template";

interface ExportPdfPayload {
  html: string;
  title?: string;
  direction?: "ltr" | "rtl" | "auto";
}

export async function POST(request: NextRequest) {
  let browser = null;

  try {
    const body = (await request.json()) as ExportPdfPayload;
    const { html, title = "document", direction = "auto" } = body;

    if (!html || typeof html !== "string") {
      return NextResponse.json(
        { success: false, error: "Invalid HTML content provided" },
        { status: 400 },
      );
    }

    const safeTitle =
      title.replace(/[^\w\s\u0600-\u06FF-]/gi, "").trim() || "document";

    browser = await chromium.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--font-render-hinting=none",
      ],
    });

    const page = await browser.newPage();

    const fullHtml = generateExportHtml({
      title: safeTitle,
      html,
      direction,
      mode: "pdf",
    });

    await page.setContent(fullHtml, { waitUntil: "networkidle" });

    // Wait for fonts to render smoothly
    await page.evaluate(() => document.fonts.ready);

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "15mm",
        right: "15mm",
        bottom: "15mm",
        left: "15mm",
      },
    });

    const encodedFilename = encodeURIComponent(`${safeTitle}.pdf`);

    return new NextResponse(Buffer.from(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${safeTitle}.pdf"; filename*=UTF-8''${encodedFilename}`,
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("Playwright PDF generation error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate PDF via Playwright" },
      { status: 500 },
    );
  } finally {
    if (browser) {
      await browser
        .close()
        .catch((err) => console.error("Error closing browser:", err));
    }
  }
}
