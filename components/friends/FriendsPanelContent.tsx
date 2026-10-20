"use client";

/**
 * components/friends/FriendsPanelContent.tsx
 * The full Friends panel — tab-switched between Friends list,
 * Requests, and Find (search).
 *
 * Replaces the placeholder FriendsPanelContent in PanelContents.tsx.
 */

import React, { useState } from "react";
import { Users, Bell, Search, Loader2, Copy, Check } from "lucide-react";
import { useFriends } from "./useFriends";
import FriendSearch from "./FriendSearch";
import FriendRequestList from "./FriendRequestList";
import FriendList from "./FriendList";

type Tab = "friends" | "requests" | "find";

export default function FriendsPanelContent() {
  const [tab, setTab] = useState<Tab>("friends");
  const {
    myProfile,
    friends,
    incomingRequests,
    outgoingRequests,
    pendingCount,
    loading,
    error,
    reload,
  } = useFriends();

  const [copied, setCopied] = useState(false);

  function handleCopyId() {
    if (!myProfile) return;
    navigator.clipboard.writeText(`@${myProfile.dearly_id}`).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3">
        <Loader2
          size={24}
          className="animate-spin"
          style={{ color: "var(--palette-accent)" }}
        />
        <p className="text-sm" style={{ color: "var(--palette-text-muted)" }}>
          Loading…
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center text-center py-8 gap-3">
        <p className="text-sm" style={{ color: "#b04040" }} role="alert">
          {error}
        </p>
        <button
          onClick={reload}
          className="px-4 py-2 rounded-xl text-sm font-medium"
          style={{ background: "var(--palette-ground)", color: "var(--palette-text-primary)" }}
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* My Dearly ID card */}
      {myProfile && (
        <div
          className="rounded-2xl px-4 py-3 flex items-center justify-between gap-2"
          style={{
            background: "var(--palette-ground)",
            border: "1px solid var(--palette-surface-border)",
          }}
        >
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider mb-0.5" style={{ color: "var(--palette-text-muted)" }}>
              Your Dearly ID
            </p>
            <p className="text-sm font-semibold truncate" style={{ color: "var(--palette-text-primary)" }}>
              @{myProfile.dearly_id}
            </p>
            <p className="text-xs mt-0.5" style={{ color: "var(--palette-text-muted)" }}>
              Share this with friends to connect.
            </p>
          </div>
          <button
            onClick={handleCopyId}
            aria-label={copied ? "Copied!" : "Copy your Dearly ID"}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all active:scale-95 flex-shrink-0"
            style={{
              background: copied ? "#6baf7a" : "var(--palette-surface)",
              border: "1px solid var(--palette-surface-border)",
              color: copied ? "#fff" : "var(--palette-text-muted)",
            }}
          >
            {copied ? <Check size={12} aria-hidden /> : <Copy size={12} aria-hidden />}
            <span>{copied ? "Copied!" : "Copy"}</span>
          </button>
        </div>
      )}

      {/* Tab bar */}
      <div
        className="flex rounded-2xl overflow-hidden"
        role="tablist"
        aria-label="Friends sections"
        style={{ background: "var(--palette-ground)" }}
      >
        {(
          [
            { id: "friends" as Tab, label: "Friends", icon: <Users size={13} aria-hidden /> },
            {
              id: "requests" as Tab,
              label: "Requests",
              icon: <Bell size={13} aria-hidden />,
              badge: pendingCount,
            },
            { id: "find" as Tab, label: "Find", icon: <Search size={13} aria-hidden /> },
          ] as Array<{ id: Tab; label: string; icon: React.ReactNode; badge?: number }>
        ).map(({ id, label, icon, badge }) => (
          <button
            key={id}
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold transition-all relative"
            style={{
              background: tab === id ? "var(--palette-surface)" : "transparent",
              color: tab === id ? "var(--palette-accent)" : "var(--palette-text-muted)",
              borderRadius: tab === id ? "1rem" : undefined,
              margin: tab === id ? "3px" : undefined,
            }}
          >
            {icon}
            <span>{label}</span>
            {!!badge && (
              <span
                className="absolute top-1 right-1 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center"
                style={{ background: "var(--palette-accent)", color: "#fff" }}
                aria-label={`${badge} pending`}
              >
                {badge > 9 ? "9+" : badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div role="tabpanel">
        {tab === "friends" && (
          <FriendList
            friends={friends}
            onFindFriends={() => setTab("find")}
            onActionComplete={reload}
          />
        )}
        {tab === "requests" && (
          <FriendRequestList
            incomingRequests={incomingRequests}
            outgoingRequests={outgoingRequests}
            onActionComplete={reload}
          />
        )}
        {tab === "find" && myProfile && (
          <FriendSearch
            currentUserId={myProfile.id}
            friends={friends}
            incomingRequests={incomingRequests}
            outgoingRequests={outgoingRequests}
            onActionComplete={reload}
          />
        )}
      </div>
    </div>
  );
}
