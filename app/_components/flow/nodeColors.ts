export interface ColorPreset {
  id: string;
  name: string;
  stroke: string;
  bgLight: string;
  bgDark: string;
  swatch: string;
}

export const COLOR_PRESETS: ColorPreset[] = [
  {
    id: "default",
    name: "Default",
    stroke: "",
    bgLight: "",
    bgDark: "",
    swatch: "bg-muted-foreground/30 border-border",
  },
  {
    id: "blue",
    name: "Blue",
    stroke: "#3b82f6",
    bgLight: "#eff6ff",
    bgDark: "#172554",
    swatch: "bg-blue-500 border-blue-600",
  },
  {
    id: "emerald",
    name: "Green",
    stroke: "#10b981",
    bgLight: "#ecfdf5",
    bgDark: "#064e3b",
    swatch: "bg-emerald-500 border-emerald-600",
  },
  {
    id: "amber",
    name: "Amber",
    stroke: "#f59e0b",
    bgLight: "#fffbeb",
    bgDark: "#451a03",
    swatch: "bg-amber-500 border-amber-600",
  },
  {
    id: "rose",
    name: "Red",
    stroke: "#f43f5e",
    bgLight: "#fff1f2",
    bgDark: "#4c0519",
    swatch: "bg-rose-500 border-rose-600",
  },
  {
    id: "purple",
    name: "Purple",
    stroke: "#a855f7",
    bgLight: "#faf5ff",
    bgDark: "#3b0764",
    swatch: "bg-purple-500 border-purple-600",
  },
  {
    id: "indigo",
    name: "Indigo",
    stroke: "#6366f1",
    bgLight: "#eef2ff",
    bgDark: "#1e1b4b",
    swatch: "bg-indigo-500 border-indigo-600",
  },
  {
    id: "cyan",
    name: "Cyan",
    stroke: "#06b6d4",
    bgLight: "#ecfeff",
    bgDark: "#083344",
    swatch: "bg-cyan-500 border-cyan-600",
  },
  {
    id: "orange",
    name: "Orange",
    stroke: "#f97316",
    bgLight: "#fff7ed",
    bgDark: "#431407",
    swatch: "bg-orange-500 border-orange-600",
  },
  {
    id: "pink",
    name: "Pink",
    stroke: "#ec4899",
    bgLight: "#fdf2f8",
    bgDark: "#500724",
    swatch: "bg-pink-500 border-pink-600",
  },
];

// Color alias mappings
const COLOR_ALIASES: Record<string, string> = {
  green: "emerald",
  red: "rose",
  yellow: "amber",
  violet: "purple",
  sky: "cyan",
};

/**
 * Returns stroke (border) and fill (background) colors for a node
 */
export function getNodeColors(
  colorInput?: string,
  isDark = false
): { stroke?: string; fill?: string; isCustom: boolean } {
  if (!colorInput || colorInput === "default" || colorInput === "none") {
    return { stroke: undefined, fill: undefined, isCustom: false };
  }

  const clean = colorInput.trim().toLowerCase().replace(/^#/, "");
  const mappedId = COLOR_ALIASES[clean] || clean;

  const preset = COLOR_PRESETS.find(
    (p) => p.id === mappedId || p.name.toLowerCase() === clean
  );

  if (preset && preset.stroke) {
    return {
      stroke: preset.stroke,
      fill: isDark ? preset.bgDark : preset.bgLight,
      isCustom: true,
    };
  }

  // If hex color string provided (e.g. #3b82f6, #3b82f680, #f00)
  if (/^[0-9a-f]{3,8}$/i.test(clean)) {
    if (clean.length === 8) {
      const baseHex = `#${clean.slice(0, 6)}`;
      return {
        stroke: baseHex,
        fill: `#${clean}`,
        isCustom: true,
      };
    }
    const hex = `#${clean}`;
    return {
      stroke: hex,
      fill: isDark ? `${hex}33` : `${hex}1a`, // ~20% or ~10% opacity fill
      isCustom: true,
    };
  }

  // Handle rgb / rgba format
  if (colorInput.startsWith("rgb")) {
    return {
      stroke: colorInput,
      fill: isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.04)",
      isCustom: true,
    };
  }

  return { stroke: undefined, fill: undefined, isCustom: false };
}
