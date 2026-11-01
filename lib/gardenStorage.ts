export type GardenDecorationId = "wildflowers" | "butterflies" | "mushrooms" | "starlight" | "fireflies";

export interface GardenDecoration {
  id: GardenDecorationId;
  name: string;
  icon: string;
  memoriesRequired: number;
  description: string;
}

export const GARDEN_DECORATIONS: GardenDecoration[] = [
  { id: "wildflowers", name: "Wildflowers", icon: "🌼", memoriesRequired: 1, description: "A little patch of color" },
  { id: "butterflies", name: "Butterflies", icon: "🦋", memoriesRequired: 3, description: "Visitors to the garden" },
  { id: "mushrooms", name: "Mushrooms", icon: "🍄", memoriesRequired: 5, description: "A cozy woodland nook" },
  { id: "starlight", name: "Fallen stars", icon: "✨", memoriesRequired: 8, description: "A soft nighttime sparkle" },
  { id: "fireflies", name: "Fireflies", icon: "🪄", memoriesRequired: 13, description: "Tiny lights at dusk" },
];

export interface GardenState {
  memories: number;
  rewardedEntryIds: string[];
}

const STORAGE_KEY = "dearly:garden:decorations:v1";
const EMPTY_STATE: GardenState = { memories: 0, rewardedEntryIds: [] };

export function loadGardenState(): GardenState {
  if (typeof window === "undefined") return { ...EMPTY_STATE };
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null") as Partial<GardenState> | null;
    return {
      memories: typeof value?.memories === "number" && value.memories >= 0 ? value.memories : 0,
      rewardedEntryIds: Array.isArray(value?.rewardedEntryIds) ? value.rewardedEntryIds.filter((id): id is string => typeof id === "string") : [],
    };
  } catch { return { ...EMPTY_STATE }; }
}

export function saveGardenState(state: GardenState) {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* Database state remains authoritative when signed in. */ }
}
