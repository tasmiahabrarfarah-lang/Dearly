/**
 * lib/profile.ts
 * Shared types for the Profile System v1.0.
 * Safe to import on both client and server.
 */

/** Keys for the curated avatar set. */
export type AvatarKey = "fox" | "bunny" | "cat" | "owl" | "bear" | "deer" | "cloud" | "star";

export const AVATAR_KEYS: AvatarKey[] = [
  "fox", "bunny", "cat", "owl", "bear", "deer", "cloud", "star",
];

/** The full profile record as stored in the database. */
export interface UserProfile {
  id: string;
  display_name: string;
  dearly_id: string;
  bio: string;
  avatar_key: AvatarKey;
  created_at: string;
  updated_at: string;
}

/** Fields that can be updated by the owner. */
export interface ProfileUpdatePayload {
  display_name: string;
  bio: string;
  avatar_key: AvatarKey;
}

/** Validation constraints (mirrors DB CHECK constraints). */
export const PROFILE_CONSTRAINTS = {
  displayName: { min: 1, max: 40 },
  bio: { max: 160 },
} as const;
