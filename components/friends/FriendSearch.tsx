"use client";

/**
 * components/friends/FriendSearch.tsx
 * Search for a user by their Dearly ID and show an action card.
 */

import React, { useState, useTransition } from "react";
import { Search, UserPlus, Users, Clock, Loader2 } from "lucide-react";
import { sendFriendRequest } from "@/app/friends/actions";
import type { PublicProfile, FriendshipStatus } from "@/lib/friends";
import type { Friend, FriendRequest } from "@/lib/friends";

interface Props {
  currentUserId: string;
  friends: Friend[];
  incomingRequests: FriendRequest[];
  outgoingRequests: FriendRequest[];
  onActionComplete: () => void;
}

export default function FriendSearch({
  currentUserId,
  friends,
  incomingRequests,
  outgoingRequests,
  onActionComplete,
}: Props) {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<PublicProfile | null | undefined>(
    undefined // undefined = not searched yet
  );
  const [searchError, setSearchError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setIsSearching(true);
    setSearchError(null);
    setActionError(null);
    setActionSuccess(null);
    setResult(undefined);

    try {
      const encoded = encodeURIComponent(query.trim().toLowerCase().replace(/^@/, ""));
      const res = await fetch(`/api/search-user?dearly_id=${encoded}`);
      const json = await res.json();
      if (!res.ok) {
        setSearchError(json.error ?? "Search failed. Please try again.");
      } else {
        setResult(json.result ?? null);
      }
    } catch {
      setSearchError("Could not connect. Please check your connection.");
    } finally {
      setIsSearching(false);
    }
  }

  function getStatus(profile: PublicProfile): { status: FriendshipStatus; friendshipId?: string } {
    if (profile.id === currentUserId) return { status: "none" };
    if (friends.some((f) => f.profile.id === profile.id)) return { status: "friends" };
    const sent = outgoingRequests.find((r) => r.other_user.id === profile.id);
    if (sent) return { status: "request_sent", friendshipId: sent.friendship_id };
    const received = incomingRequests.find((r) => r.other_user.id === profile.id);
    if (received) return { status: "request_received", friendshipId: received.friendship_id };
    return { status: "none" };
  }

  function handleSendRequest(addresseeId: string) {
    setActionError(null);
    setActionSuccess(null);
    startTransition(async () => {
      const res = await sendFriendRequest(addresseeId);
      if (res.error) {
        setActionError(res.error);
      } else {
        setActionSuccess("Friend request sent!");
        onActionComplete();
      }
    });
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Search form */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1 min-w-0">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden>
            <Search size={14} style={{ color: "var(--palette-text-muted)" }} />
          </span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter a Dearly ID…"
            aria-label="Search by Dearly ID"
            className="w-full pl-8 pr-3 py-2 rounded-xl text-sm"
            style={{
              background: "var(--palette-ground)",
              border: "1px solid var(--palette-surface-border)",
              color: "var(--palette-text-primary)",
            }}
          />
        </div>
        <button
          type="submit"
          disabled={isSearching || !query.trim()}
          aria-label="Search"
          className="px-4 py-2 rounded-xl text-sm font-semibold transition-all active:scale-95 disabled:opacity-50"
          style={{ background: "var(--palette-accent)", color: "#fff" }}
        >
          {isSearching ? <Loader2 size={14} className="animate-spin" /> : "Find"}
        </button>
      </form>

      {/* Search error */}
      {searchError && (
        <p className="text-xs px-1" style={{ color: "#b04040" }} role="alert">
          {searchError}
        </p>
      )}

      {/* No result */}
      {result === null && (
        <div
          className="rounded-2xl px-4 py-4 text-center"
          style={{ background: "var(--palette-ground)" }}
        >
          <p className="text-sm font-medium" style={{ color: "var(--palette-text-primary)" }}>
            No one found with that Dearly ID.
          </p>
          <p className="text-xs mt-1" style={{ color: "var(--palette-text-muted)" }}>
            Double-check the ID and try again.
          </p>
        </div>
      )}

      {/* Result card */}
      {result && (
        <SearchResultCard
          profile={result}
          isSelf={result.id === currentUserId}
          status={getStatus(result).status}
          onSend={() => handleSendRequest(result.id)}
          isSending={isPending}
          actionError={actionError}
          actionSuccess={actionSuccess}
        />
      )}
    </div>
  );
}

// ── Result card ───────────────────────────────────────────────────────────
interface ResultCardProps {
  profile: PublicProfile;
  isSelf: boolean;
  status: FriendshipStatus;
  onSend: () => void;
  isSending: boolean;
  actionError: string | null;
  actionSuccess: string | null;
}

function SearchResultCard({
  profile, isSelf, status, onSend, isSending, actionError, actionSuccess,
}: ResultCardProps) {
  return (
    <div
      className="rounded-2xl px-4 py-4 flex flex-col gap-3"
      style={{
        background: "var(--palette-ground)",
        border: "1px solid var(--palette-surface-border)",
      }}
    >
      <div className="flex items-center gap-3">
        {/* Avatar placeholder */}
        <div
          className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center text-lg"
          style={{ background: "var(--palette-surface)" }}
          aria-hidden
        >
          ✦
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold leading-tight truncate" style={{ color: "var(--palette-text-primary)" }}>
            {profile.display_name}
          </p>
          <p className="text-xs mt-0.5" style={{ color: "var(--palette-text-muted)" }}>
            @{profile.dearly_id}
          </p>
        </div>
      </div>

      {/* Status + action */}
      {isSelf ? (
        <p className="text-xs" style={{ color: "var(--palette-text-muted)" }}>
          This is you.
        </p>
      ) : status === "friends" ? (
        <div className="flex items-center gap-1.5" style={{ color: "var(--palette-accent)" }}>
          <Users size={13} aria-hidden />
          <span className="text-xs font-medium">Already friends</span>
        </div>
      ) : status === "request_sent" ? (
        <div className="flex items-center gap-1.5" style={{ color: "var(--palette-text-muted)" }}>
          <Clock size={13} aria-hidden />
          <span className="text-xs font-medium">Request sent — waiting for their reply</span>
        </div>
      ) : status === "request_received" ? (
        <div className="flex items-center gap-1.5" style={{ color: "var(--palette-text-muted)" }}>
          <Clock size={13} aria-hidden />
          <span className="text-xs font-medium">They already sent you a request — check Requests</span>
        </div>
      ) : (
        <button
          onClick={onSend}
          disabled={isSending}
          className="flex items-center justify-center gap-2 w-full py-2 rounded-xl text-sm font-semibold transition-all active:scale-95 disabled:opacity-60"
          style={{ background: "var(--palette-accent)", color: "#fff" }}
          aria-label={`Send friend request to ${profile.display_name}`}
        >
          {isSending ? <Loader2 size={13} className="animate-spin" /> : <UserPlus size={13} aria-hidden />}
          <span>{isSending ? "Sending…" : "Add Friend"}</span>
        </button>
      )}

      {actionError && (
        <p className="text-xs" style={{ color: "#b04040" }} role="alert">{actionError}</p>
      )}
      {actionSuccess && (
        <p className="text-xs" style={{ color: "#2a7040" }} role="status">{actionSuccess}</p>
      )}
    </div>
  );
}
