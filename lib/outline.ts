export interface OutlineHeading {
  id: string;
  level: number;
  text: string;
  lineIndex: number;
}

/**
 * Parses markdown text to extract headings (H1-H6) with hierarchical level,
 * clean display text, line number, and a deterministic ID.
 */
export function extractHeadings(markdown: string): OutlineHeading[] {
  if (!markdown) return [];
  const lines = markdown.split("\n");
  const headings: OutlineHeading[] = [];
  let inCodeBlock = false;
  let index = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Toggle fenced code blocks (``` or ~~~)
    if (trimmed.startsWith("```") || trimmed.startsWith("~~~")) {
      inCodeBlock = !inCodeBlock;
      continue;
    }

    if (inCodeBlock) continue;

    // ATX Headings: # H1 ... ###### H6
    const atxMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (atxMatch) {
      const level = atxMatch[1].length;
      const cleanText = atxMatch[2]
        .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1") // clean images
        .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // clean links
        .replace(/[`*_~]/g, "") // clean markdown formatting
        .trim();

      headings.push({
        id: `heading-${index}`,
        level,
        text: cleanText || `Heading ${index + 1}`,
        lineIndex: i + 1,
      });
      index++;
      continue;
    }

    // Setext Headings (line followed by === for H1 or --- for H2)
    if (i + 1 < lines.length && trimmed.length > 0 && !trimmed.startsWith("#")) {
      const nextLine = lines[i + 1].trim();
      let setextLevel = 0;
      if (/^={2,}$/.test(nextLine)) {
        setextLevel = 1;
      } else if (/^-{2,}$/.test(nextLine) && !trimmed.startsWith("-") && !trimmed.startsWith("*")) {
        setextLevel = 2;
      }

      if (setextLevel > 0) {
        const cleanText = trimmed
          .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
          .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
          .replace(/[`*_~]/g, "")
          .trim();

        headings.push({
          id: `heading-${index}`,
          level: setextLevel,
          text: cleanText || `Heading ${index + 1}`,
          lineIndex: i + 1,
        });
        index++;
        i++; // skip underline
      }
    }
  }

  return headings;
}

/**
 * Rehype plugin to attach deterministic IDs (`heading-0`, `heading-1`, ...)
 * to all heading elements (h1-h6) rendered in the Viewer.
 */
export function rehypeHeadingIds() {
  return (tree: any) => {
    let index = 0;
    const walk = (node: any) => {
      if (!node) return;
      if (node.type === "element" && /^h[1-6]$/.test(node.tagName)) {
        if (!node.properties) {
          node.properties = {};
        }
        node.properties.id = `heading-${index++}`;
      }
      if (Array.isArray(node.children)) {
        for (const child of node.children) {
          walk(child);
        }
      }
    };
    walk(tree);
  };
}
