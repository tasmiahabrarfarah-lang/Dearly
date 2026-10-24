"use client";

/**
 * ProfileCard
 * Upper-left compact profile card showing the authenticated user's
 * real display name, avatar, and a short greeting.
 *
 * Loads live data via useProfile() hook.
 * Falls back to placeholders while loading.
 */

import React from "react";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { useProfile } from "./profile/useProfile";
import { AvatarImage } from "./profile/avatars";
import type { AvatarKey } from "@/lib/profile";

interface ProfileCardProps {
  onOpen: (anchor: DOMRect) => void;
}

export default function ProfileCard({ onOpen }: ProfileCardProps) {
  const { profile, loading } = useProfile();

  const displayName = loading
    ? "…"
    : profile?.display_name ?? "Little Wanderer";

  const avatarKey: AvatarKey =
    (profile?.avatar_key as AvatarKey | undefined) ?? "fox";

  const greeting = loading
    ? ""
    : profile?.bio
    ? profile.bio.slice(0, 48) + (profile.bio.length > 48 ? "…" : "")
    : "A quiet, cozy afternoon ✦";

  return (
    <motion.button
      onClick={(event) => onOpen(event.currentTarget.getBoundingClientRect())}
      aria-label={`Open profile — ${displayName}`}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="
        glass rounded-2xl flex items-center gap-3
        px-3 py-2.5
        shadow-soft cursor-pointer
        hover:shadow-glow transition-all duration-200
        active:scale-[0.98]
        text-left
      "
    >
      {/* Avatar */}
      <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 ring-2 ring-[var(--palette-accent-soft)]">
        {loading ? (
          // Skeleton shimmer while loading
          <div
            className="w-full h-full rounded-xl animate-pulse"
            style={{ background: "var(--palette-ground)" }}
          />
        ) : (
          <AvatarImage avatarKey={avatarKey} accessory={profile?.avatar_accessory} className="w-full h-full" />
        )}
      </div>

      {/* Text */}
      <div className="min-w-0">
        <p
          className="text-sm font-semibold leading-tight truncate"
          style={{ color: "var(--palette-text-primary)" }}
        >
          {displayName}
        </p>
        {greeting && (
          <p
            className="text-xs leading-tight mt-0.5 truncate"
            style={{ color: "var(--palette-text-muted)" }}
          >
            {greeting}
          </p>
        )}
        {!loading && profile?.username && <p className="text-[10px] leading-tight truncate" style={{ color: "var(--palette-text-muted)" }}>@{profile.username}{profile.profile_title ? ` · ${profile.profile_title}` : ""}</p>}
      </div>

      <ChevronRight
        size={14}
        aria-hidden="true"
        style={{ color: "var(--palette-text-muted)", flexShrink: 0 }}
      />
    </motion.button>
  );
}
