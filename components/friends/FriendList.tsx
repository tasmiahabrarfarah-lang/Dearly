"use client";

/**
 * components/friends/FriendList.tsx
 * Displays the list of accepted friends with a Remove action.
 */

import React, { useState, useTransition } from "react";
import { UserX, Loader2 } from "lucide-react";
import { removeFriend } from "@/app/friends/actions";
import type { Friend } from "@/lib/friends";

interface Props {
  friends: Friend[];
  onFindFriends: () => void;
  onActionComplete: () => void;
}

export default function FriendList({ friends, onFindFriends, onActionComplete }: Props) {
  if (friends.length === 0) {
    return (
      <div className="flex flex-col items-center text-center gap-4 py-4">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
          style={{ background: "var(--palette-ground)" }}
          aria-hidden
        >
          🌱
        </div>
        <div>
          <p className="text-sm font-semibold" style={{ color: "var(--palette-text-primary)" }}>
            Your little circle is waiting to grow.
          </p>
          <p className="text-xs mt-1" style={{ color: "var(--palette-text-muted)" }}>
            Find someone you know by their Dearly ID.
          </p>
        </div>
        <button
          onClick={onFindFriends}
          className="px-4 py-2 rounded-xl text-sm font-semibold transition-all active:scale-95"
          style={{ background: "var(--palette-accent)", color: "#fff" }}
        >
          Find a Friend
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <p
        className="text-xs font-semibold uppercase tracking-wider mb-1"
        style={{ color: "var(--palette-text-muted)" }}
      >
        Friends ({friends.length})
      </p>
      {friends.map((friend) => (
        <FriendCard
          key={friend.friendship_id}
          friend={friend}
          onActionComplete={onActionComplete}
        />
      ))}
    </div>
  );
}

// ── Friend card ───────────────────────────────────────────────────────────
function FriendCard({
  friend,
  onActionComplete,
}: {
  friend: Friend;
  onActionComplete: () => void;
}) {
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleRemove() {
    setError(null);
    startTransition(async () => {
      const res = await removeFriend(friend.friendship_id);
      if (res.error) {
        setError(res.error);
        setConfirmRemove(false);
      } else {
        onActionComplete();
      }
    });
  }

  return (
    <div
      className="rounded-2xl px-4 py-3 flex items-center gap-3 relative overflow-hidden"
      style={{
        background: "var(--palette-ground)",
        border: "1px solid var(--palette-surface-border)",
      }}
    >
      <div
        className="w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center text-base"
        style={{ background: "var(--palette-surface)" }}
        aria-hidden
      >
        ✦
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold truncate" style={{ color: "var(--palette-text-primary)" }}>
          {friend.profile.display_name}
        </p>
        <p className="text-xs" style={{ color: "var(--palette-text-muted)" }}>
          @{friend.profile.dearly_id}
        </p>
        {error && <p className="text-xs mt-1" style={{ color: "#b04040" }} role="alert">{error}</p>}
      </div>

      {/* Remove button */}
      {!confirmRemove ? (
        <button
          onClick={() => setConfirmRemove(true)}
          aria-label={`Remove ${friend.profile.display_name} from friends`}
          className="p-2 rounded-xl transition-colors hover:bg-red-100 active:scale-90"
          style={{ color: "var(--palette-text-muted)" }}
        >
          <UserX size={14} aria-hidden />
        </button>
      ) : (
        /* Confirmation overlay */
        <div
          className="absolute inset-0 rounded-2xl flex items-center justify-center gap-2 px-3"
          style={{ background: "rgba(253,246,236,0.96)" }}
        >
          <p className="text-xs font-medium flex-1 min-w-0" style={{ color: "var(--palette-text-primary)" }}>
            Remove {friend.profile.display_name}?
          </p>
          <button
            onClick={() => setConfirmRemove(false)}
            className="px-2.5 py-1.5 rounded-lg text-xs font-medium glass"
            style={{ color: "var(--palette-text-primary)" }}
          >
            Cancel
          </button>
          <button
            onClick={handleRemove}
            disabled={isPending}
            className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-red-500 text-white hover:bg-red-600 active:scale-95 disabled:opacity-60"
          >
            {isPending ? <Loader2 size={12} className="animate-spin" /> : "Remove"}
          </button>
        </div>
      )}
    </div>
  );
}
