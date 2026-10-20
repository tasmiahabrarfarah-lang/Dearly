/**
 * lib/friends.ts
 * Shared types for the Friends v1.0 feature.
 * No secrets, no private data — safe to import on both client and server.
 */

// ── Public profile (safe to expose through search / friends list) ─────────
export interface PublicProfile {
  id: string;       // Supabase auth user ID (UUID) — used internally only
  display_name: string;
  dearly_id: string; // The public-facing "@cozy-star-482" identifier
}

// ── Friendship status ─────────────────────────────────────────────────────
export type FriendshipStatus =
  | "none"              // No relationship
  | "request_sent"      // Current user sent a pending request
  | "request_received"  // Current user received a pending request
  | "friends";          // Accepted friendship

// ── Friendship row (from DB) ──────────────────────────────────────────────
export interface FriendshipRow {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: "pending" | "accepted";
  created_at: string;
  updated_at: string;
}

// ── A friend request with the other party's public profile ───────────────
export interface FriendRequest {
  friendship_id: string;
  other_user: PublicProfile;
  direction: "sent" | "received";
  created_at: string;
}

// ── An accepted friend ────────────────────────────────────────────────────
export interface Friend {
  friendship_id: string;
  profile: PublicProfile;
}

// ── Server Action result type ─────────────────────────────────────────────
export interface ActionResult {
  error?: string;
  success?: boolean;
}
