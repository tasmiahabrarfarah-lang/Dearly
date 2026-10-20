"use client";

/**
 * components/friends/FriendRequestList.tsx
 * Shows incoming and outgoing pending friend requests.
 */

import React, { useTransition } from "react";
import { Check, X, Clock, Loader2 } from "lucide-react";
import {
  acceptFriendRequest,
  declineFriendRequest,
  cancelFriendRequest,
} from "@/app/friends/actions";
import type { FriendRequest } from "@/lib/friends";

interface Props {
  incomingRequests: FriendRequest[];
  outgoingRequests: FriendRequest[];
  onActionComplete: () => void;
}

export default function FriendRequestList({
  incomingRequests,
  outgoingRequests,
  onActionComplete,
}: Props) {
  const hasAny = incomingRequests.length > 0 || outgoingRequests.length > 0;

  if (!hasAny) {
    return (
      <p className="text-sm text-center py-4" style={{ color: "var(--palette-text-muted)" }}>
        No pending requests right now.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Incoming */}
      {incomingRequests.length > 0 && (
        <section aria-labelledby="incoming-requests-label">
          <p
            id="incoming-requests-label"
            className="text-xs font-semibold uppercase tracking-wider mb-2"
            style={{ color: "var(--palette-text-muted)" }}
          >
            Received ({incomingRequests.length})
          </p>
          <div className="flex flex-col gap-2">
            {incomingRequests.map((req) => (
              <IncomingRequestCard
                key={req.friendship_id}
                request={req}
                onActionComplete={onActionComplete}
              />
            ))}
          </div>
        </section>
      )}

      {/* Outgoing */}
      {outgoingRequests.length > 0 && (
        <section aria-labelledby="outgoing-requests-label">
          <p
            id="outgoing-requests-label"
            className="text-xs font-semibold uppercase tracking-wider mb-2"
            style={{ color: "var(--palette-text-muted)" }}
          >
            Sent ({outgoingRequests.length})
          </p>
          <div className="flex flex-col gap-2">
            {outgoingRequests.map((req) => (
              <OutgoingRequestCard
                key={req.friendship_id}
                request={req}
                onActionComplete={onActionComplete}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

// ── Incoming request card ─────────────────────────────────────────────────
function IncomingRequestCard({
  request,
  onActionComplete,
}: {
  request: FriendRequest;
  onActionComplete: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = React.useState<string | null>(null);
  const [action, setAction] = React.useState<"accept" | "decline" | null>(null);

  function handle(type: "accept" | "decline") {
    setError(null);
    setAction(type);
    startTransition(async () => {
      const res =
        type === "accept"
          ? await acceptFriendRequest(request.friendship_id)
          : await declineFriendRequest(request.friendship_id);
      if (res.error) {
        setError(res.error);
        setAction(null);
      } else {
        onActionComplete();
      }
    });
  }

  return (
    <div
      className="rounded-2xl px-4 py-3 flex items-center gap-3"
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
          {request.other_user.display_name}
        </p>
        <p className="text-xs" style={{ color: "var(--palette-text-muted)" }}>
          @{request.other_user.dearly_id}
        </p>
        {error && <p className="text-xs mt-1" style={{ color: "#b04040" }} role="alert">{error}</p>}
      </div>
      <div className="flex gap-1.5 flex-shrink-0">
        <button
          onClick={() => handle("decline")}
          disabled={isPending}
          aria-label={`Decline request from ${request.other_user.display_name}`}
          className="p-2 rounded-xl transition-colors hover:bg-red-100 active:scale-90 disabled:opacity-50"
          style={{ color: "#b05050" }}
        >
          {isPending && action === "decline"
            ? <Loader2 size={14} className="animate-spin" />
            : <X size={14} aria-hidden />}
        </button>
        <button
          onClick={() => handle("accept")}
          disabled={isPending}
          aria-label={`Accept request from ${request.other_user.display_name}`}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all active:scale-95 disabled:opacity-50"
          style={{ background: "var(--palette-accent)", color: "#fff" }}
        >
          {isPending && action === "accept"
            ? <Loader2 size={13} className="animate-spin" />
            : <Check size={13} aria-hidden />}
          <span>Accept</span>
        </button>
      </div>
    </div>
  );
}

// ── Outgoing request card ─────────────────────────────────────────────────
function OutgoingRequestCard({
  request,
  onActionComplete,
}: {
  request: FriendRequest;
  onActionComplete: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = React.useState<string | null>(null);

  function handleCancel() {
    setError(null);
    startTransition(async () => {
      const res = await cancelFriendRequest(request.friendship_id);
      if (res.error) {
        setError(res.error);
      } else {
        onActionComplete();
      }
    });
  }

  return (
    <div
      className="rounded-2xl px-4 py-3 flex items-center gap-3"
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
          {request.other_user.display_name}
        </p>
        <p className="text-xs" style={{ color: "var(--palette-text-muted)" }}>
          @{request.other_user.dearly_id}
        </p>
        <div className="flex items-center gap-1 mt-0.5" style={{ color: "var(--palette-text-muted)" }}>
          <Clock size={11} aria-hidden />
          <span className="text-xs">Waiting for reply…</span>
        </div>
        {error && <p className="text-xs mt-1" style={{ color: "#b04040" }} role="alert">{error}</p>}
      </div>
      <button
        onClick={handleCancel}
        disabled={isPending}
        aria-label={`Cancel request to ${request.other_user.display_name}`}
        className="px-3 py-1.5 rounded-xl text-xs font-medium transition-all active:scale-95 disabled:opacity-50"
        style={{
          background: "var(--palette-surface)",
          border: "1px solid var(--palette-surface-border)",
          color: "var(--palette-text-muted)",
        }}
      >
        {isPending ? <Loader2 size={13} className="animate-spin" /> : "Cancel"}
      </button>
    </div>
  );
}
