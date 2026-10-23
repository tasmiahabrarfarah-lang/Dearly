/**
 * lib/diaryStorage.ts
 * A small, typed storage layer for Dearly diary entries.
 * Uses localStorage with a versioned key.
 * All access is guarded for SSR safety.
 */

// ── Privacy / Audience ────────────────────────────────────────────────────
/**
 * The wider audience values are retained to read older local records, but the
 * database sharing table is now the only source of friend access.
 */
export type DiaryAudience =
  | "only_me"
  | "selected_friends"
  | "all_friends"
  | "all_friends_except";

export interface DiaryEntry {
  id: string;
  title: string;
  body: string;
  createdAt: string;   // ISO 8601
  updatedAt: string;   // ISO 8601
  pageColor: string;   // hex or CSS color name
  fontFamily: string;  // CSS font-family value
  fontSize: number;    // px, e.g. 15
  /** Legacy compatibility field. Database entries always load as only_me. */
  audience: DiaryAudience;
  /**
   * Legacy compatibility field; permissions are stored server-side.
   */
  allowedFriendIds: string[];
  /**
   * Legacy compatibility field; permissions are stored server-side.
   */
  excludedFriendIds: string[];
}

const STORAGE_KEY = "dearly:diary:v1";

// ── Default customization values ──────────────────────────────────────────
// Defined here (before normalizeEntry) so defaults can be used in normalization.
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

/**
 * Normalize a raw parsed object into a valid DiaryEntry.
 * - Missing or invalid `audience` → "only_me" (never grants broader access).
 * - Missing `allowedFriendIds`/`excludedFriendIds` → empty arrays.
 * This is the migration path for entries created before Diary Privacy v1.0.
 */
function normalizeEntry(e: Record<string, unknown>): DiaryEntry {
  // Legacy broad audience settings were never server-enforced. Treat them as
  // private during migration; explicit share rows are the only access grant.
  const audience: DiaryAudience = "only_me";

  return {
    id: e.id as string,
    title: typeof e.title === "string" ? e.title : "",
    body: e.body as string,
    createdAt: e.createdAt as string,
    updatedAt: typeof e.updatedAt === "string" ? e.updatedAt : (e.createdAt as string),
    pageColor: typeof e.pageColor === "string" ? e.pageColor : DEFAULT_PAGE_COLOR,
    fontFamily: typeof e.fontFamily === "string" ? e.fontFamily : DEFAULT_FONT,
    fontSize: typeof e.fontSize === "number" ? e.fontSize : DEFAULT_FONT_SIZE,
    audience,
    allowedFriendIds: Array.isArray(e.allowedFriendIds)
      ? (e.allowedFriendIds as string[]).filter((s) => typeof s === "string")
      : [],
    excludedFriendIds: Array.isArray(e.excludedFriendIds)
      ? (e.excludedFriendIds as string[]).filter((s) => typeof s === "string")
      : [],
  };
}

/** Safely read entries from localStorage. Returns [] on any failure. */
export function loadEntries(): DiaryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Validate minimal shape then normalize (handles pre-privacy entries)
    return parsed
      .filter(
        (e) =>
          e &&
          typeof e.id === "string" &&
          typeof e.body === "string" &&
          typeof e.createdAt === "string"
      )
      .map((e) => normalizeEntry(e as Record<string, unknown>));
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

// ── Audience options metadata ──────────────────────────────────────────────
export interface AudienceOption {
  value: DiaryAudience;
  /** Short label shown on buttons and badges */
  label: string;
  /** Icon character or emoji */
  icon: string;
  /** One-line description shown in the picker */
  description: string;
  /**
   * When true, this option requires the friend system milestone to be complete
   * before backend enforcement is possible. The UI shows a "coming soon" note.
   */
  requiresFriendSystem: boolean;
}

export const AUDIENCE_OPTIONS: AudienceOption[] = [
  {
    value: "only_me",
    label: "Only Me",
    icon: "🔒",
    description: "Only you can read this memory.",
    requiresFriendSystem: false,
  },
  {
    value: "all_friends",
    label: "All My Friends",
    icon: "👥",
    description: "Everyone on your friends list can read this entry.",
    requiresFriendSystem: true,
  },
  {
    value: "selected_friends",
    label: "Selected Friends",
    icon: "🤝",
    description: "Choose the friends who can read this entry.",
    requiresFriendSystem: true,
  },
  {
    value: "all_friends_except",
    label: "All My Friends Except…",
    icon: "🚫",
    description: "Share with your friends, excluding selected people.",
    requiresFriendSystem: true,
  },
];
