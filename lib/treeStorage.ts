/**
 * lib/treeStorage.ts
 * Typed storage layer for Dearly tree progression.
 * Pattern mirrors diaryStorage.ts — versioned key, SSR-guarded, graceful errors.
 */

// ── Types ─────────────────────────────────────────────────────────────────

export type TreeType = "moonlight" | "starlight" | "lapis" | "ruby";

export type GrowthStage = "seed" | "sprout" | "teen" | "adult" | "mature";

export const GROWTH_STAGES: GrowthStage[] = [
  "seed",
  "sprout",
  "teen",
  "adult",
  "mature",
];

/**
 * XP required to reach each stage (cumulative from seed).
 * Values are intentionally low for early testing; adjust as needed.
 *   seed    → 0  (starting point)
 *   sprout  → 3  (3 new entries)
 *   teen    → 8  (8 total entries)
 *   adult   → 16 (16 total entries)
 *   mature  → 28 (28 total entries)
 */
export const STAGE_THRESHOLDS: Record<GrowthStage, number> = {
  seed:   0,
  sprout: 3,
  teen:   8,
  adult:  16,
  mature: 28,
};

export interface TreeState {
  treeType: TreeType | null;     // null = not yet chosen
  stage: GrowthStage;
  xp: number;                    // total XP earned
  rewardedEntryIds: string[];    // diary entry IDs already counted
}

// ── Four tree identity metadata ───────────────────────────────────────────

export interface TreeMeta {
  id: TreeType;
  name: string;
  description: string;
  palette: {
    trunk: string;
    foliage: string;
    flower: string;
    fruit: string;
    glow: string;
    ground: string;
  };
}

export const TREE_TYPES: TreeMeta[] = [
  {
    id: "moonlight",
    name: "Moonlight",
    description: "Silver leaves that shimmer like moonlight on still water.",
    palette: {
      trunk:   "#9aaabf",
      foliage: "#c8daf0",
      flower:  "#1e2d6a",
      fruit:   "#7090d0",
      glow:    "#b8d4f8",
      ground:  "#a8c4e8",
    },
  },
  {
    id: "starlight",
    name: "Starlight",
    description: "Golden boughs that glow softly like captured starlight.",
    palette: {
      trunk:   "#a08060",
      foliage: "#f0e0a0",
      flower:  "#d47820",
      fruit:   "#e8c050",
      glow:    "#f8e890",
      ground:  "#e8d070",
    },
  },
  {
    id: "lapis",
    name: "Lapis Lazuli",
    description: "Deep blue foliage dusted with flecks of gold.",
    palette: {
      trunk:   "#506080",
      foliage: "#3860a8",
      flower:  "#c0a820",
      fruit:   "#2840a0",
      glow:    "#6090e0",
      ground:  "#4070c0",
    },
  },
  {
    id: "ruby",
    name: "Ruby",
    description: "Crimson leaves that blush with warmth and quiet fire.",
    palette: {
      trunk:   "#784848",
      foliage: "#e07070",
      flower:  "#ffc0b0",
      fruit:   "#c03030",
      glow:    "#f8a0a0",
      ground:  "#e06060",
    },
  },
];

// ── Storage helpers ────────────────────────────────────────────────────────

const STORAGE_KEY = "dearly:tree:v1";

const DEFAULT_STATE: TreeState = {
  treeType: null,
  stage: "seed",
  xp: 0,
  rewardedEntryIds: [],
};

export function loadTreeState(): TreeState {
  if (typeof window === "undefined") return { ...DEFAULT_STATE };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_STATE };
    const parsed = JSON.parse(raw) as Partial<TreeState>;
    return {
      treeType: isValidTreeType(parsed.treeType) ? parsed.treeType : null,
      stage: isValidStage(parsed.stage) ? parsed.stage : "seed",
      xp: typeof parsed.xp === "number" && parsed.xp >= 0 ? parsed.xp : 0,
      rewardedEntryIds: Array.isArray(parsed.rewardedEntryIds)
        ? parsed.rewardedEntryIds.filter((s) => typeof s === "string")
        : [],
    };
  } catch {
    return { ...DEFAULT_STATE };
  }
}

export function saveTreeState(state: TreeState): boolean {
  if (typeof window === "undefined") return false;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

// ── Growth logic ──────────────────────────────────────────────────────────

/** Returns the correct stage for a given XP total. */
export function stageForXp(xp: number): GrowthStage {
  const stages = [...GROWTH_STAGES].reverse();
  for (const stage of stages) {
    if (xp >= STAGE_THRESHOLDS[stage]) return stage;
  }
  return "seed";
}

/** Apply a growth award for a new diary entry. Idempotent — same entryId never counted twice. */
export function applyGrowthReward(
  state: TreeState,
  entryId: string
): TreeState {
  if (state.rewardedEntryIds.includes(entryId)) return state; // already counted
  const newXp = state.xp + 1;
  const newStage = stageForXp(newXp);
  return {
    ...state,
    xp: newXp,
    stage: newStage,
    rewardedEntryIds: [...state.rewardedEntryIds, entryId],
  };
}

// ── Helpers ───────────────────────────────────────────────────────────────

function isValidTreeType(v: unknown): v is TreeType {
  return v === "moonlight" || v === "starlight" || v === "lapis" || v === "ruby";
}

function isValidStage(v: unknown): v is GrowthStage {
  return GROWTH_STAGES.includes(v as GrowthStage);
}

export function getTreeMeta(type: TreeType): TreeMeta {
  return TREE_TYPES.find((t) => t.id === type)!;
}

/** XP needed to reach the next stage from current, or null if at max. */
export function xpToNextStage(state: TreeState): { needed: number; total: number } | null {
  const idx = GROWTH_STAGES.indexOf(state.stage);
  if (idx >= GROWTH_STAGES.length - 1) return null; // fully mature
  const nextStage = GROWTH_STAGES[idx + 1];
  return {
    needed: STAGE_THRESHOLDS[nextStage] - state.xp,
    total:  STAGE_THRESHOLDS[nextStage] - STAGE_THRESHOLDS[state.stage],
  };
}
