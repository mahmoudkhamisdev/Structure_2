/**
 * Unified HTML template generator for document exports (PDF, HTML, Word).
 * Ensures identical visual design, typography, and code blocks across all export formats in clean light mode.
 */

export interface GenerateExportHtmlOptions {
  title: string;
  html: string;
  direction?: "ltr" | "rtl" | "auto" | string;
  mode?: "pdf" | "html" | "word";
}

export function generateExportHtml({
  title,
  html,
  direction = "auto",
  mode = "pdf",
}: GenerateExportHtmlOptions): string {
  const safeTitle =
    title.replace(/[^\w\s\u0600-\u06FF-]/gi, "").trim() || "document";

  // 1. Microsoft Word (.doc) Export Template
  if (mode === "word") {
    return `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40' dir="${direction}">
      <head>
        <meta charset="utf-8">
        <title>${safeTitle}</title>
        <!--[if gte mso 9]>
        <xml>
          <w:WordDocument>
            <w:View>Print</w:View>
            <w:Zoom>100</w:Zoom>
            <w:DoNotOptimizeForBrowser/>
          </w:WordDocument>
        </xml>
        <![endif]-->
        <style>
          @page Section1 {
            size: 595.3pt 841.9pt; /* A4 */
            margin: 54.0pt 54.0pt 54.0pt 54.0pt;
            mso-header-margin: 35.4pt;
            mso-footer-margin: 35.4pt;
            mso-paper-source: 0;
          }
          div.Section1 { page: Section1; }
          body {
            font-family: 'Calibri', 'Segoe UI', 'Cairo', Arial, sans-serif;
            font-size: 11pt;
            line-height: 1.6;
            color: #0f172a;
            background-color: #ffffff;
          }
          h1 { font-size: 22pt; font-weight: bold; margin-top: 18pt; margin-bottom: 8pt; color: #0f172a; }
          h2 { font-size: 16pt; font-weight: bold; margin-top: 14pt; margin-bottom: 6pt; color: #1e293b; border-bottom: 1px solid #e2e8f0; padding-bottom: 4pt; }
          h3 { font-size: 13pt; font-weight: bold; margin-top: 12pt; margin-bottom: 4pt; color: #334155; }
          h4 { font-size: 11pt; font-weight: bold; margin-top: 10pt; margin-bottom: 3pt; color: #334155; }
          h5 { font-size: 10pt; font-weight: bold; margin-top: 8pt; margin-bottom: 2pt; color: #475569; }
          h6 { font-size: 9.5pt; font-weight: bold; margin-top: 6pt; margin-bottom: 2pt; color: #475569; }
          p { margin-top: 0; margin-bottom: 8pt; }
          ul, ol { margin-top: 0; margin-bottom: 8pt; padding-inline-start: 20pt; }
          li { margin-top: 2pt; margin-bottom: 2pt; }
          table { width: 100%; border-collapse: collapse; margin: 12pt 0; }
          th, td { border: 1px solid #cbd5e1; padding: 6pt 10pt; text-align: start; }
          th { background-color: #f1f5f9; font-weight: bold; color: #0f172a; }
          tr:nth-child(even) { background-color: #f8fafc; }
          blockquote { border-left: 3.5pt solid #0f172a; padding-left: 10pt; margin: 10pt 0; color: #475569; font-style: italic; background-color: #f8fafc; }
          
          /* CodeBlock in Word */
          .code-block-wrapper {
            border: 1px solid #cbd5e1;
            background-color: #ffffff;
            margin: 12pt 0;
          }
          .code-block-header {
            background-color: #f1f5f9;
            border-bottom: 1px solid #cbd5e1;
            padding: 5pt 10pt;
            font-size: 9pt;
            color: #64748b;
          }
          .code-block-dots {
            display: inline-block;
            margin-right: 6pt;
          }
          .code-block-dots span {
            display: inline-block;
            width: 7pt;
            height: 7pt;
            border-radius: 50%;
            margin-right: 2pt;
          }
          .code-block-dots span:nth-child(1) { background-color: #ef4444; }
          .code-block-dots span:nth-child(2) { background-color: #f59e0b; }
          .code-block-dots span:nth-child(3) { background-color: #10b981; }
          .code-block-lang {
            font-family: 'Consolas', 'Courier New', monospace;
            font-size: 8.5pt;
            font-weight: bold;
            text-transform: uppercase;
            color: #64748b;
          }
          .code-block-copy, button {
            display: none !important;
          }
          .code-block-content {
            padding: 8pt 10pt;
            background-color: #f8fafc;
          }
          pre {
            font-family: 'Consolas', 'Courier New', monospace;
            background-color: #f8fafc;
            color: #0f172a;
            margin: 0;
            padding: 0;
            font-size: 9.5pt;
            line-height: 1.5;
            white-space: pre-wrap;
          }
          code {
            font-family: 'Consolas', 'Courier New', monospace;
            background-color: #f1f5f9;
            color: #0f172a;
            padding: 2pt 4pt;
            font-size: 9.5pt;
            border: 1px solid #e2e8f0;
          }
          a { color: #0284c7; text-decoration: underline; }
          img { max-width: 100%; height: auto; }
          del { color: #94a3b8; text-decoration: line-through; }
          hr { border: none; border-top: 1px solid #e2e8f0; margin: 14pt 0; }
        </style>
      </head>
      <body dir="${direction}">
        <div class="Section1 prose-content">
          ${html}
        </div>
      </body>
    </html>`;
  }

  // 2. PDF and HTML Webpage Templates (Light Mode Only)
  const isPdf = mode === "pdf";

  const layoutStyles = isPdf
    ? `
      @page {
        size: A4 portrait;
        margin: 15mm 15mm 15mm 15mm;
      }

      html, body {
        margin: 0;
        padding: 0;
        background-color: #ffffff !important;
        color: #0f172a !important;
        font-family: 'Cairo', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        line-height: 1.7;
        font-size: 14px;
      }

      .prose-content {
        width: 100%;
        max-width: 100%;
      }
    `
    : `
      html, body {
        margin: 0;
        padding: 40px 20px;
        background-color: #f8fafc !important;
        color: #0f172a !important;
        font-family: 'Cairo', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        line-height: 1.7;
        font-size: 15px;
        display: flex;
        justify-content: center;
      }

      .prose-content {
        width: 100%;
        max-width: 880px;
        background-color: #ffffff !important;
        color: #0f172a !important;
        padding: 48px;
        border-radius: 14px;
        box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05);
        border: 1px solid #e2e8f0 !important;
      }

      @media print {
        @page {
          size: auto;
          margin: 0mm;
        }
        body {
          padding: 0 !important;
          background: #ffffff !important;
          color: #0f172a !important;
        }
        .prose-content {
          max-width: 100% !important;
          padding: 16mm 18mm !important;
          border: none !important;
          box-shadow: none !important;
          background: #ffffff !important;
          color: #0f172a !important;
        }
      }
    `;

  const interactiveStyles = isPdf
    ? `
      /* Hide language icon Code2 in PDF export */
      .code-block-lang svg {
        display: none !important;
      }

      /* Hide copy button and print:hidden elements in PDF export */
      .code-block-copy,
      .print\\:hidden,
      button {
        display: none !important;
      }
    `
    : `
      .code-block-lang svg {
        width: 12px !important;
        height: 12px !important;
        stroke: currentColor !important;
        stroke-width: 2 !important;
      }

      /* Copy Button matching CodeBlock.tsx in Light Mode */
      .code-block-copy {
        display: inline-flex !important;
        align-items: center !important;
        gap: 6px !important;
        border-radius: 6px !important;
        padding: 4px 8px !important;
        font-size: 11px !important;
        font-family: inherit !important;
        font-weight: 500 !important;
        color: #64748b !important;
        background-color: transparent !important;
        border: 1px solid transparent !important;
        cursor: pointer !important;
        transition: all 0.15s ease !important;
        outline: none !important;
        user-select: none !important;
        line-height: 1 !important;
      }

      .code-block-copy:hover {
        background-color: #ffffff !important;
        color: #0f172a !important;
        border-color: rgba(226, 232, 240, 0.7) !important;
      }

      .code-block-copy.copied {
        background-color: rgba(16, 185, 129, 0.1) !important;
        color: #059669 !important;
        border-color: transparent !important;
      }

      .code-block-copy svg {
        width: 12px !important;
        height: 12px !important;
        stroke: currentColor !important;
        stroke-width: 2 !important;
      }

      @media print {
        .code-block-copy,
        .print\\:hidden,
        button {
          display: none !important;
        }
        .code-block-lang svg {
          display: none !important;
        }
      }
    `;

  const scriptTag = isPdf
    ? ""
    : `
      <script>
        (function() {
          var checkSvg = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
          var copySvg = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path></svg>';

          function fallbackCopy(text) {
            var textArea = document.createElement("textarea");
            textArea.value = text;
            textArea.style.position = "fixed";
            textArea.style.left = "-9999px";
            textArea.style.top = "-9999px";
            textArea.style.opacity = "0";
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            var ok = false;
            try {
              ok = document.execCommand('copy');
            } catch (err) {
              ok = false;
            }
            document.body.removeChild(textArea);
            return ok;
          }

          async function copyText(text) {
            if (navigator.clipboard && window.isSecureContext) {
              try {
                await navigator.clipboard.writeText(text);
                return true;
              } catch (e) {
                return fallbackCopy(text);
              }
            }
            return fallbackCopy(text);
          }

          document.addEventListener('click', async function(e) {
            var btn = e.target.closest('.code-block-copy');
            if (!btn) return;
            e.preventDefault();

            var wrapper = btn.closest('.code-block-wrapper');
            if (!wrapper) return;

            var codeEl = wrapper.querySelector('pre code') || wrapper.querySelector('pre');
            if (!codeEl) return;

            var codeText = codeEl.textContent || codeEl.innerText || '';
            codeText = codeText.replace(/\\n$/, '');

            var success = await copyText(codeText);
            if (success) {
              btn.classList.add('copied');
              btn.innerHTML = checkSvg + '<span>Copied!</span>';
              setTimeout(function() {
                btn.innerHTML = copySvg + '<span>Copy</span>';
                btn.classList.remove('copied');
              }, 2000);
            }
          });
        })();
      </script>
    `;

  return `<!DOCTYPE html>
    <html dir="${direction}">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta name="color-scheme" content="light">
        <title>${safeTitle}</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
        <style>
          *, *::before, *::after {
            box-sizing: border-box;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          ${layoutStyles}

          h1, h2, h3, h4, h5, h6 {
            font-family: 'Cairo', sans-serif;
            font-weight: 700;
            color: #0f172a !important;
            line-height: 1.3;
            break-after: avoid !important;
            page-break-after: avoid !important;
          }

          h1 { font-size: 2.2rem; margin-top: 1.8rem; margin-bottom: 0.9rem; }
          h2 { font-size: 1.65rem; margin-top: 1.6rem; margin-bottom: 0.75rem; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.4rem; }
          h3 { font-size: 1.3rem; margin-top: 1.3rem; margin-bottom: 0.5rem; }
          h4 { font-size: 1.1rem; margin-top: 1.1rem; margin-bottom: 0.4rem; }
          h5 { font-size: 1rem; margin-top: 1rem; margin-bottom: 0.3rem; }
          h6 { font-size: 0.9rem; margin-top: 0.9rem; margin-bottom: 0.25rem; }

          p {
            margin-top: 0.7rem;
            margin-bottom: 0.7rem;
            orphans: 3;
            widows: 3;
            color: #0f172a !important;
          }

          ul, ol {
            margin-top: 0.7rem;
            margin-bottom: 0.7rem;
            padding-inline-start: 1.6rem;
            color: #0f172a !important;
          }

          li {
            margin-top: 0.25rem;
            margin-bottom: 0.25rem;
          }

          blockquote {
            margin: 1.2rem 0;
            padding: 0.5rem 1rem;
            border-inline-start: 4px solid #0f172a;
            background-color: #f8fafc !important;
            color: #475569 !important;
            font-style: italic;
            break-inside: avoid;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            margin: 1.2rem 0;
            break-inside: avoid;
          }

          th, td {
            border: 1px solid #cbd5e1;
            padding: 8px 12px;
            text-align: start;
            color: #0f172a !important;
          }

          th {
            background-color: #f1f5f9 !important;
            font-weight: 600;
          }

          tr:nth-child(even) {
            background-color: #f8fafc !important;
          }

          /* CodeBlock Wrapper (Matches CodeBlock.tsx Light Mode: rounded-xl border border-border/70 bg-card shadow-xs) */
          .code-block-wrapper {
            position: relative !important;
            direction: ltr !important;
            text-align: left !important;
            margin: 1.25rem 0 !important;
            border-radius: 12px !important;
            border: 1px solid rgba(226, 232, 240, 0.7) !important;
            background-color: #ffffff !important;
            box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05) !important;
            overflow: hidden !important;
            transition: all 0.2s ease !important;
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }

          /* CodeBlock Header (Matches CodeBlock.tsx Light Mode: flex h-9 items-center justify-between border-b border-border/60 bg-muted/40 px-3.5) */
          .code-block-header {
            display: flex !important;
            align-items: center !important;
            justify-content: space-between !important;
            height: 36px !important;
            padding: 0 14px !important;
            background-color: rgba(241, 245, 249, 0.4) !important;
            border-bottom: 1px solid rgba(226, 232, 240, 0.6) !important;
            user-select: none !important;
            font-size: 12px !important;
          }

          /* Left grouping inside header */
          .code-block-header > div:first-child {
            display: flex !important;
            align-items: center !important;
            gap: 8px !important;
          }

          /* Decorative Window Controls (Matches CodeBlock.tsx: flex items-center gap-1.5 opacity-60 transition-opacity group-hover:opacity-100) */
          .code-block-dots {
            display: inline-flex !important;
            align-items: center !important;
            gap: 6px !important;
            opacity: 0.6 !important;
            transition: opacity 0.2s ease !important;
          }

          .code-block-wrapper:hover .code-block-dots {
            opacity: 1 !important;
          }

          /* Window Dots (Matches CodeBlock.tsx: size-2.5 rounded-full) */
          .code-block-dots span {
            display: inline-block !important;
            width: 10px !important;
            height: 10px !important;
            border-radius: 50% !important;
            flex-shrink: 0 !important;
          }

          .code-block-dots span:nth-child(1) {
            background-color: rgba(248, 113, 113, 0.8) !important; /* bg-red-400/80 */
          }

          .code-block-dots span:nth-child(2) {
            background-color: rgba(251, 191, 36, 0.8) !important; /* bg-amber-400/80 */
          }

          .code-block-dots span:nth-child(3) {
            background-color: rgba(52, 211, 153, 0.8) !important; /* bg-emerald-400/80 */
          }

          /* Language Tag (Matches CodeBlock.tsx: ml-2 flex items-center gap-1 text-muted-foreground) */
          .code-block-lang {
            display: inline-flex !important;
            align-items: center !important;
            gap: 4px !important;
            margin-left: 8px !important;
            color: #64748b !important;
            font-family: 'JetBrains Mono', Consolas, monospace !important;
            font-size: 11px !important;
            font-weight: 500 !important;
            text-transform: uppercase !important;
            letter-spacing: 0.05em !important;
          }

          ${interactiveStyles}

          /* Code Content Container (Matches CodeBlock.tsx: relative overflow-x-auto bg-muted/20 p-4) */
          .code-block-content {
            position: relative !important;
            overflow-x: auto !important;
            background-color: rgba(241, 245, 249, 0.2) !important; /* bg-muted/20 */
            padding: 16px !important;
          }

          /* Pre & Code Element (Matches CodeBlock.tsx: text-left font-mono text-[13px] leading-relaxed text-foreground font-normal whitespace-pre) */
          .code-block-content pre,
          pre {
            background-color: rgba(241, 245, 249, 0.2) !important;
            color: #0f172a !important;
            padding: 12px 16px !important;
            border-radius: 8px !important;
            border: 1px solid #e2e8f0 !important;
            overflow-x: auto !important;
            break-inside: avoid !important;
            page-break-inside: avoid !important;
            margin: 1rem 0 !important;
            font-family: 'JetBrains Mono', monospace !important;
            font-size: 13px !important;
            line-height: 1.625 !important;
            text-align: left !important;
            direction: ltr !important;
            white-space: pre !important;
            tab-size: 2 !important;
          }

          .code-block-content pre {
            background-color: transparent !important;
            border: none !important;
            padding: 0 !important;
            margin: 0 !important;
            border-radius: 0 !important;
          }

          pre code,
          .code-block-content pre code {
            background-color: transparent !important;
            color: inherit !important;
            padding: 0 !important;
            border: none !important;
            font-size: inherit !important;
            font-family: inherit !important;
            font-weight: inherit !important;
            white-space: inherit !important;
          }

          /* Inline code (Matches InlineCode in CodeBlock.tsx: rounded-md border border-border/50 bg-muted/80 px-1.5 py-0.5 font-mono text-[0.875em] font-medium) */
          :not(pre) > code {
            font-family: 'JetBrains Mono', monospace !important;
            background-color: rgba(241, 245, 249, 0.8) !important;
            color: #0f172a !important;
            padding: 0.15em 0.4em !important;
            border-radius: 6px !important;
            border: 1px solid rgba(226, 232, 240, 0.7) !important;
            font-size: 0.875em !important;
            font-weight: 500 !important;
          }

          a {
            color: #0284c7;
            text-decoration: underline;
          }

          img {
            max-width: 100%;
            height: auto;
            break-inside: avoid;
          }

          del {
            color: #94a3b8;
            text-decoration: line-through;
          }

          hr {
            border: none;
            border-top: 1px solid #e2e8f0;
            margin: 1.5rem 0;
          }
        </style>
      </head>
      <body dir="${direction}">
        <div class="prose-content">
          ${html}
        </div>
        ${scriptTag}
      </body>
    </html>`;
}
