"use server";

/**
 * app/friends/actions.ts
 * Server Actions for all friendship mutations.
 *
 * Authorization model (enforced server-side, not just client-side):
 *   sendRequest    — only as yourself; not to yourself; not if already related
 *   acceptRequest  — only if you are the addressee of a pending request
 *   declineRequest — only if you are the addressee of a pending request
 *   cancelRequest  — only if you are the requester of a pending request
 *   removeFriend   — only if you are a participant in an accepted friendship
 *
 * All operations validate the authenticated user server-side before touching data.
 * Crossed-request policy: if B sends a request while A→B is pending, B's action
 * is treated as accepting A's existing request (handled in sendRequest).
 */

import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/lib/friends";

// ── Ensure profile exists for the current user ────────────────────────────
// Called opportunistically; idempotent.
export async function ensureProfile(): Promise<ActionResult> {
  const supabase = createClient();
  if (!supabase) return { error: "Supabase is not configured." };

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { error: "Not authenticated." };

  // Check if profile already exists
  const { data: existing } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .single();

  if (existing) return { success: true };

  // Profile doesn't exist — create one via RPC so trigger fires
  // (Trigger should have created it; this is a safety net)
  const { error } = await supabase
    .from("profiles")
    .insert({ id: user.id })
    .single();

  if (error) return { error: error.message };
  return { success: true };
}

// ── Send a friend request ─────────────────────────────────────────────────
export async function sendFriendRequest(
  addresseeId: string
): Promise<ActionResult> {
  const supabase = createClient();
  if (!supabase) return { error: "Supabase is not configured." };

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { error: "Not authenticated." };

  // Server-side self-check (DB also enforces via CHECK constraint)
  if (user.id === addresseeId) {
    return { error: "You cannot send a friend request to yourself." };
  }

  // Verify the addressee has a profile (i.e. is a real user)
  const { data: addresseeProfile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", addresseeId)
    .single();

  if (!addresseeProfile) return { error: "User not found." };

  // Check for an existing relationship in either direction
  const { data: existing } = await supabase
    .from("friendships")
    .select("id, status, requester_id, addressee_id")
    .or(
      `and(requester_id.eq.${user.id},addressee_id.eq.${addresseeId}),` +
      `and(requester_id.eq.${addresseeId},addressee_id.eq.${user.id})`
    )
    .maybeSingle();

  if (existing) {
    if (existing.status === "accepted") {
      return { error: "You are already friends." };
    }
    // Crossed-request: they already sent us a request → auto-accept it
    if (existing.requester_id === addresseeId && existing.addressee_id === user.id) {
      const { error } = await supabase
        .from("friendships")
        .update({ status: "accepted" })
        .eq("id", existing.id)
        .eq("addressee_id", user.id); // RLS double-check
      if (error) return { error: error.message };
      return { success: true };
    }
    // We already sent them a request
    return { error: "A friend request is already pending." };
  }

  // Insert new pending request
  const { error } = await supabase
    .from("friendships")
    .insert({
      requester_id: user.id,
      addressee_id: addresseeId,
      status: "pending",
    });

  if (error) return { error: error.message };
  return { success: true };
}

// ── Accept a received request ─────────────────────────────────────────────
export async function acceptFriendRequest(
  friendshipId: string
): Promise<ActionResult> {
  const supabase = createClient();
  if (!supabase) return { error: "Supabase is not configured." };

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { error: "Not authenticated." };

  // Only update rows where we are the addressee and status is pending
  const { error, count } = await supabase
    .from("friendships")
    .update({ status: "accepted" })
    .eq("id", friendshipId)
    .eq("addressee_id", user.id)  // must be addressed to us
    .eq("status", "pending");     // must still be pending

  if (error) return { error: error.message };
  if (count === 0) return { error: "Request not found or you are not the recipient." };
  return { success: true };
}

// ── Decline a received request ────────────────────────────────────────────
export async function declineFriendRequest(
  friendshipId: string
): Promise<ActionResult> {
  const supabase = createClient();
  if (!supabase) return { error: "Supabase is not configured." };

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { error: "Not authenticated." };

  // Delete only if we are the addressee and status is pending
  const { error, count } = await supabase
    .from("friendships")
    .delete()
    .eq("id", friendshipId)
    .eq("addressee_id", user.id)
    .eq("status", "pending");

  if (error) return { error: error.message };
  if (count === 0) return { error: "Request not found or you are not the recipient." };
  return { success: true };
}

// ── Cancel a sent request ─────────────────────────────────────────────────
export async function cancelFriendRequest(
  friendshipId: string
): Promise<ActionResult> {
  const supabase = createClient();
  if (!supabase) return { error: "Supabase is not configured." };

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { error: "Not authenticated." };

  // Delete only if we are the requester and status is pending
  const { error, count } = await supabase
    .from("friendships")
    .delete()
    .eq("id", friendshipId)
    .eq("requester_id", user.id)
    .eq("status", "pending");

  if (error) return { error: error.message };
  if (count === 0) return { error: "Request not found or you are not the sender." };
  return { success: true };
}

// ── Remove an accepted friend ─────────────────────────────────────────────
export async function removeFriend(
  friendshipId: string
): Promise<ActionResult> {
  const supabase = createClient();
  if (!supabase) return { error: "Supabase is not configured." };

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { error: "Not authenticated." };

  // Delete only if we are a participant and status is accepted
  const { error, count } = await supabase
    .from("friendships")
    .delete()
    .eq("id", friendshipId)
    .eq("status", "accepted")
    .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`);

  if (error) return { error: error.message };
  if (count === 0) return { error: "Friendship not found or you are not a participant." };
  return { success: true };
}
