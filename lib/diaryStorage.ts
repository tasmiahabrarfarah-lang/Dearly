/**
 * lib/diaryStorage.ts
 * A small, typed storage layer for Dearly diary entries.
 * Uses localStorage with a versioned key.
 * All access is guarded for SSR safety.
 */

export interface DiaryEntry {
  id: string;
  title: string;
  body: string;
  createdAt: string;   // ISO 8601
  updatedAt: string;   // ISO 8601
  pageColor: string;   // hex or CSS color name
  fontFamily: string;  // CSS font-family value
  fontSize: number;    // px, e.g. 15
}

const STORAGE_KEY = "dearly:diary:v1";

/** Safely read entries from localStorage. Returns [] on any failure. */
export function loadEntries(): DiaryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Validate minimal shape
    return parsed.filter(
      (e) =>
        e &&
        typeof e.id === "string" &&
        typeof e.body === "string" &&
        typeof e.createdAt === "string"
    );
  } catch {
    return [];
  }
}

/** Persist the full entries array. Returns true on success, false on failure. */
export function saveEntries(entries: DiaryEntry[]): boolean {
  if (typeof window === "undefined") return false;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    return true;
  } catch {
    return false;
  }
}

/** Add or update a single entry. Returns success flag. */
export function upsertEntry(entry: DiaryEntry): boolean {
  const entries = loadEntries();
  const idx = entries.findIndex((e) => e.id === entry.id);
  if (idx >= 0) {
    entries[idx] = entry;
  } else {
    entries.push(entry);
  }
  return saveEntries(entries);
}

/** Delete an entry by id. Returns success flag. */
export function deleteEntry(id: string): boolean {
  const entries = loadEntries().filter((e) => e.id !== id);
  return saveEntries(entries);
}

/** Generate a browser-safe unique ID (no crypto dependency needed). */
export function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

/** Format an ISO date string for display. */
export function formatDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

/** Short date — day + month only */
export function formatDateShort(iso: string): string {
  try {
    return new Intl.DateTimeFormat(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

// ── Default customization values ──────────────────────────────────────────
export const PAGE_COLORS: { label: string; value: string }[] = [
  { label: "Warm Cream",   value: "#fdf6ec" },
  { label: "Soft Ivory",   value: "#faf5e4" },
  { label: "Pale Lavender",value: "#f0ebfa" },
  { label: "Dusty Blue",   value: "#eaf2f8" },
  { label: "Soft Blush",   value: "#fdf0f0" },
];

export const FONT_OPTIONS: { label: string; value: string }[] = [
  { label: "Nunito Sans",  value: "var(--font-nunito), sans-serif" },
  { label: "Lora (Serif)", value: "var(--font-lora), Georgia, serif" },
  { label: "Caveat (Hand)",value: "var(--font-caveat), cursive" },
];

export const FONT_SIZES: { label: string; value: number }[] = [
  { label: "Small",   value: 14 },
  { label: "Medium",  value: 16 },
  { label: "Large",   value: 18 },
  { label: "X-Large", value: 20 },
];

export const DEFAULT_PAGE_COLOR = PAGE_COLORS[0].value;
export const DEFAULT_FONT       = "var(--font-nunito), sans-serif";
export const DEFAULT_FONT_SIZE  = 16;
