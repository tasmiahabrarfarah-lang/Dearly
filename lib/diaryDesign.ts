export const COVER_COLORS = ["#cebbe8", "#a8c9e8", "#c6dfc6", "#efc6cc", "#e9d5a8"] as const;
/** Patterns were removed: every diary is plain. Old saved values are still accepted and shown as plain. */
const LEGACY_PATTERNS = ["plain", "stars", "dots", "flowers"] as const;
export const BOOKMARK_COLORS = ["#d89ab8", "#8fb8d8", "#8fb89a", "#d9a95e", "#a88bd0"] as const;
export const BOOKMARK_STYLES = ["pointed", "ribbon", "rounded"] as const;
export const DECORATIONS = ["flower", "star", "heart", "moon", "leaf", "cloud"] as const;
export const MAX_DECORATIONS = 3;

/* Human-readable names, so every option is labelled instead of showing raw ids or hex codes. */
export const COVER_COLOR_LABELS: Record<string, string> = { "#cebbe8": "Lavender", "#a8c9e8": "Sky", "#c6dfc6": "Mint", "#efc6cc": "Blush", "#e9d5a8": "Honey" };
export const BOOKMARK_COLOR_LABELS: Record<string, string> = { "#d89ab8": "Rose", "#8fb8d8": "Blue", "#8fb89a": "Sage", "#d9a95e": "Gold", "#a88bd0": "Violet" };
export const BOOKMARK_STYLE_LABELS: Record<string, string> = { pointed: "Pointed", ribbon: "Ribbon", rounded: "Rounded" };
export const DECORATION_LABELS: Record<string, string> = { flower: "Flower", star: "Star", heart: "Heart", moon: "Moon", leaf: "Leaf", cloud: "Cloud" };

export const DESIGN_PRESETS: Record<string, { label: string; cover_color: string; pattern_id: string; bookmark_color: string; bookmark_style: string; decoration_ids: string[] }> = {
  "dreamy-garden": { label: "Dreamy Garden", cover_color: "#cebbe8", pattern_id: "plain", bookmark_color: "#d89ab8", bookmark_style: "pointed", decoration_ids: ["flower", "leaf"] },
  "morning-sky": { label: "Morning Sky", cover_color: "#a8c9e8", pattern_id: "plain", bookmark_color: "#d9a95e", bookmark_style: "ribbon", decoration_ids: ["cloud", "star"] },
  "little-keepsake": { label: "Little Keepsake", cover_color: "#efc6cc", pattern_id: "plain", bookmark_color: "#a88bd0", bookmark_style: "rounded", decoration_ids: ["heart", "moon"] },
};
export type DiaryDesign = { version: 1; preset_id: string; cover_color: string; pattern_id: string; bookmark_color: string; bookmark_style: string; decoration_ids: string[] };
export const DEFAULT_DIARY_DESIGN: DiaryDesign = { version: 1, preset_id: "dreamy-garden", cover_color: "#cebbe8", pattern_id: "plain", bookmark_color: "#d89ab8", bookmark_style: "pointed", decoration_ids: ["flower", "leaf"] };

/** Build a clean design from a preset (drops the preset's display-only `label`). */
export function designFromPreset(id: string): DiaryDesign {
  const p = DESIGN_PRESETS[id];
  if (!p) return { ...DEFAULT_DIARY_DESIGN, decoration_ids: [...DEFAULT_DIARY_DESIGN.decoration_ids] };
  return { version: 1, preset_id: id, cover_color: p.cover_color, pattern_id: p.pattern_id, bookmark_color: p.bookmark_color, bookmark_style: p.bookmark_style, decoration_ids: [...p.decoration_ids] };
}

/** Field-by-field comparison (JSON.stringify is order-sensitive and gave false "unsaved changes"). */
export function sameDesign(a: DiaryDesign, b: DiaryDesign): boolean {
  return a.preset_id === b.preset_id && a.cover_color === b.cover_color
    && a.bookmark_color === b.bookmark_color && a.bookmark_style === b.bookmark_style
    && a.decoration_ids.length === b.decoration_ids.length && a.decoration_ids.every((d, i) => d === b.decoration_ids[i]);
}

/** Lighten (amount > 0) or darken (amount < 0) a #rrggbb colour. */
export function shadeColor(hex: string, amount: number): string {
  const value = Number.parseInt(hex.slice(1), 16);
  const adjust = (channel: number) => Math.max(0, Math.min(255, Math.round(channel + (amount > 0 ? 255 - channel : -channel) * Math.abs(amount))));
  return `#${[adjust((value >> 16) & 255), adjust((value >> 8) & 255), adjust(value & 255)].map((c) => c.toString(16).padStart(2, "0")).join("")}`;
}

/** Lets the home-screen diary update immediately after the design is saved elsewhere (Settings, onboarding). */
export const DIARY_DESIGN_EVENT = "dearly:diary-design-changed";
export function announceDiaryDesign(design: DiaryDesign) {
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent<DiaryDesign>(DIARY_DESIGN_EVENT, { detail: design }));
}

export function validateDiaryDesign(input: Partial<DiaryDesign>): DiaryDesign | null {
  if (!(COVER_COLORS as readonly string[]).includes(input.cover_color ?? "") || !(LEGACY_PATTERNS as readonly string[]).includes(input.pattern_id ?? "") || !(BOOKMARK_COLORS as readonly string[]).includes(input.bookmark_color ?? "") || !(BOOKMARK_STYLES as readonly string[]).includes(input.bookmark_style ?? "") || !Array.isArray(input.decoration_ids) || input.decoration_ids.length > MAX_DECORATIONS || input.decoration_ids.some((id) => !(DECORATIONS as readonly string[]).includes(id))) return null;
  return { version: 1, preset_id: typeof input.preset_id === "string" && input.preset_id in DESIGN_PRESETS ? input.preset_id : "custom", cover_color: input.cover_color!, pattern_id: "plain", bookmark_color: input.bookmark_color!, bookmark_style: input.bookmark_style!, decoration_ids: Array.from(new Set(input.decoration_ids)) };
}
