/**
 * lib/profile.ts
 * Shared types for the Profile System v1.0.
 * Safe to import on both client and server.
 */

/** Keys for the curated avatar set. */
export type AvatarKey = "fox" | "bunny" | "cat" | "owl" | "bear" | "deer" | "cloud" | "star";
export type AvatarAccessory = "none" | "glasses" | "flower" | "bow";

export const AVATAR_KEYS: AvatarKey[] = [
  "fox", "bunny", "cat", "owl", "bear", "deer", "cloud", "star",
];

/** The full profile record as stored in the database. */
export interface UserProfile {
  id: string;
  display_name: string;
  dearly_id: string;
  username: string | null;
  profile_title: string;
  bio: string;
  avatar_key: AvatarKey;
  avatar_accessory: AvatarAccessory;
  personalization_completed: boolean;
  created_at: string;
  updated_at: string;
}

/** Fields that can be updated by the owner. */
export interface ProfileUpdatePayload {
  display_name: string;
  bio: string;
  avatar_key: AvatarKey;
  avatar_accessory: AvatarAccessory;
  profile_title: string;
  username: string;
}

/** Validation constraints (mirrors DB CHECK constraints). */
export const PROFILE_CONSTRAINTS = {
  displayName: { min: 1, max: 40 },
  bio: { max: 160 },
  profileTitle: { max: 40 },
  username: { min: 3, max: 20 },
} as const;

export const RESERVED_USERNAMES = ["admin", "administrator", "support", "help", "dearly", "system", "api", "root"] as const;

export function normalizeUsername(value: string): string {
  return value.trim().toLowerCase().replace(/^@/, "");
}

export function validateUsername(value: string): string | null {
  const username = normalizeUsername(value);
  if (username.length < PROFILE_CONSTRAINTS.username.min || username.length > PROFILE_CONSTRAINTS.username.max) {
    return `Username must be ${PROFILE_CONSTRAINTS.username.min}–${PROFILE_CONSTRAINTS.username.max} characters.`;
  }
  if (!/^[a-z0-9_]+$/.test(username)) return "Use lowercase letters, numbers, and underscores only.";
  if ((RESERVED_USERNAMES as readonly string[]).includes(username)) return "That username is reserved. Please choose another.";
  return null;
}
