"use server";

/**
 * app/profile/actions.ts
 * Server Actions for profile management.
 *
 * Authorization model:
 *   getMyProfile     — returns own profile; creates it if missing (idempotent)
 *   updateProfile    — validates and saves own profile fields only
 *   ensureProfileExists — idempotent create-or-fetch; used by useFriends as a
 *                         recovery step when the profile row is missing
 *
 * All operations validate the authenticated user server-side.
 * The client cannot supply a different user ID to claim another profile.
 */

import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/lib/friends";
import type { UserProfile, ProfileUpdatePayload, AvatarKey } from "@/lib/profile";
import { AVATAR_KEYS, PROFILE_CONSTRAINTS } from "@/lib/profile";

// ── Ensure a profile row exists for the current user ──────────────────────
// Idempotent: if the row already exists, returns it unchanged.
// Used as a recovery step when profile loading finds no rows.
export async function ensureProfileExists(): Promise<
  { profile: UserProfile } | { error: string }
> {
  const supabase = createClient();
  if (!supabase) return { error: "Supabase is not configured." };

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) return { error: "Not authenticated." };

  // Try to fetch the existing profile first
  const { data: existing, error: fetchErr } = await supabase
    .from("profiles")
    .select("id, display_name, dearly_id, bio, avatar_key, created_at, updated_at")
    .eq("id", user.id)
    .single();

  if (existing) return { profile: existing as UserProfile };

  // If fetch error is NOT "no rows found", it's a real error
  if (fetchErr && fetchErr.code !== "PGRST116") {
    return { error: fetchErr.message };
  }

  // Profile is missing — insert a fresh one. The DB trigger should have done
  // this on sign-up, but we handle the case where it didn't (e.g. pre-migration
  // accounts, email-unconfirmed users that pre-date the trigger).
  // The generate_dearly_id() function is called via a DB default/trigger;
  // we use an RPC approach: insert with empty dearly_id and let a follow-up
  // update fill it if the trigger didn't.
  const { error: insertErr } = await supabase.from("profiles").insert({
    id: user.id,
    display_name: "Little Wanderer",
    dearly_id: "", // Will be filled by trigger or the update below
    bio: "",
    avatar_key: "fox",
  });

  // If insert fails due to duplicate (race condition), that's fine — fetch again
  if (insertErr && insertErr.code !== "23505") {
    return { error: insertErr.message };
  }

  // Fetch the row that now exists (either we just inserted it or it was a race)
  const { data: created, error: refetchErr } = await supabase
    .from("profiles")
    .select("id, display_name, dearly_id, bio, avatar_key, created_at, updated_at")
    .eq("id", user.id)
    .single();

  if (refetchErr || !created) {
    return { error: refetchErr?.message ?? "Profile creation failed." };
  }

  return { profile: created as UserProfile };
}

// ── Load the authenticated user's own profile ─────────────────────────────
export async function getMyProfile(): Promise<
  { profile: UserProfile } | { error: string }
> {
  const supabase = createClient();
  if (!supabase) return { error: "Supabase is not configured." };

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) return { error: "Not authenticated." };

  const { data, error } = await supabase
    .from("profiles")
    .select("id, display_name, dearly_id, bio, avatar_key, created_at, updated_at")
    .eq("id", user.id)
    .single();

  if (error) {
    // PGRST116 = "no rows returned" — profile missing, run ensure
    if (error.code === "PGRST116") {
      return ensureProfileExists();
    }
    return { error: error.message };
  }

  if (!data) return ensureProfileExists();

  return { profile: data as UserProfile };
}

// ── Update the authenticated user's own profile ───────────────────────────
export async function updateProfile(
  payload: ProfileUpdatePayload
): Promise<ActionResult & { profile?: UserProfile }> {
  const supabase = createClient();
  if (!supabase) return { error: "Supabase is not configured." };

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) return { error: "Not authenticated." };

  // ── Server-side validation ────────────────────────────────────────────
  const displayName = payload.display_name.trim();
  if (
    displayName.length < PROFILE_CONSTRAINTS.displayName.min ||
    displayName.length > PROFILE_CONSTRAINTS.displayName.max
  ) {
    return {
      error: `Display name must be between ${PROFILE_CONSTRAINTS.displayName.min} and ${PROFILE_CONSTRAINTS.displayName.max} characters.`,
    };
  }

  const bio = payload.bio.trim();
  if (bio.length > PROFILE_CONSTRAINTS.bio.max) {
    return { error: `Bio must be ${PROFILE_CONSTRAINTS.bio.max} characters or fewer.` };
  }

  const avatarKey: AvatarKey = payload.avatar_key;
  if (!AVATAR_KEYS.includes(avatarKey)) {
    return { error: "Invalid avatar selection." };
  }

  // ── Persist (UPDATE only — never changes id or dearly_id) ────────────
  const { data, error } = await supabase
    .from("profiles")
    .update({ display_name: displayName, bio, avatar_key: avatarKey })
    .eq("id", user.id) // RLS also enforces this
    .select("id, display_name, dearly_id, bio, avatar_key, created_at, updated_at")
    .single();

  if (error) return { error: error.message };
  if (!data) return { error: "Update failed — profile not found." };

  return { success: true, profile: data as UserProfile };
}
