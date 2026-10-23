"use client";

import { DiaryAudience, AUDIENCE_OPTIONS } from "@/lib/diaryStorage";
import DiaryShareControl from "./DiaryShareControl";
import { useCallback, useEffect, useState } from "react";
import { setDiaryEntryShares } from "@/diary/actions";

/**
 * Only these two audiences are backed by the database (an entry is either private,
 * or shared via explicit rows in diary_entry_shares). "all_friends" and
 * "all_friends_except" have no server-side storage or policy yet, so offering them
 * produced a choice that could never be saved. Add them back here once the schema
 * supports them.
 */
const SELECTABLE_AUDIENCES: DiaryAudience[] = ["only_me", "selected_friends"];

export function AudienceBadge({ audience }: { audience: DiaryAudience }) {
  const opt = AUDIENCE_OPTIONS.find((o) => o.value === audience) ?? AUDIENCE_OPTIONS[0];
  return (
    <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium" style={{ background: "var(--palette-ground)", color: "var(--palette-text-muted)" }} title={opt.description} aria-label={`Audience: ${opt.label}`}>
      <span aria-hidden="true">{opt.icon}</span><span>{opt.label}</span>
    </span>
  );
}

interface AudienceControlProps {
  audience: DiaryAudience;
  entryId: string | null;
  sharingAvailable: boolean;
  onAudienceChange?: (audience: DiaryAudience) => void;
}

/**
 * Privacy / audience selector for diary entries.
 * Shows the current audience badge, an audience picker (only_me vs selected_friends),
 * and — once an entry has been saved — the friend sharing panel.
 */
export default function AudienceControl({
  audience,
  entryId,
  sharingAvailable,
  onAudienceChange,
}: AudienceControlProps) {
  const [currentAudience, setCurrentAudience] = useState(audience);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Keep local state in sync when prop changes (e.g. loading a different entry)
  useEffect(() => setCurrentAudience(audience), [audience]);

  const handleAudienceSelect = useCallback(
    async (value: DiaryAudience) => {
      if (busy || value === currentAudience) return;
      setError(null);
      // Switching back to "Only Me" must actually revoke access on the server.
      // Previously this only flipped local UI state, so an entry could look private
      // while its share rows (and friends' read access) stayed in place.
      if (value === "only_me" && entryId && sharingAvailable) {
        setBusy(true);
        const result = await setDiaryEntryShares(entryId, []);
        setBusy(false);
        if (result.error) { setError(result.error); return; }
      }
      setCurrentAudience(value);
      onAudienceChange?.(value);
    },
    [busy, currentAudience, entryId, sharingAvailable, onAudienceChange]
  );

  const handleRecipientsChanged = useCallback(
    (count: number) => {
      const next: DiaryAudience = count ? "selected_friends" : "only_me";
      setCurrentAudience(next);
      onAudienceChange?.(next);
    },
    [onAudienceChange]
  );

  return (
    <div className="flex flex-col gap-2">
      <p
        className="text-xs font-semibold uppercase tracking-wider"
        style={{ color: "var(--palette-text-muted)" }}
      >
        Privacy
      </p>

      {/* ── Audience picker buttons ── */}
      <div className="flex flex-col gap-1">
        {AUDIENCE_OPTIONS.filter((o) => SELECTABLE_AUDIENCES.includes(o.value)).map((opt) => {
          const needsSharing = opt.requiresFriendSystem && !sharingAvailable;
          const isSelected = currentAudience === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => { if (!needsSharing) void handleAudienceSelect(opt.value); }}
              aria-pressed={isSelected}
              disabled={needsSharing || busy}
              title={needsSharing ? "Connect Supabase and apply the diary sharing migration to unlock." : opt.description}
              className="flex items-center gap-2 rounded-xl px-3 py-2 text-left text-sm transition-all duration-150 active:scale-[0.98]"
              style={{
                background: isSelected ? "var(--palette-ground)" : "transparent",
                border: `1.5px solid ${isSelected ? "var(--palette-accent)" : "var(--palette-surface-border)"}`,
                color: "var(--palette-text-primary)",
                opacity: needsSharing ? 0.4 : 1,
                cursor: needsSharing ? "not-allowed" : "pointer",
              }}
            >
              <span aria-hidden="true">{opt.icon}</span>
              <span className="font-medium">{opt.label}</span>
              {needsSharing && (
                <span className="ml-auto text-xs" style={{ color: "var(--palette-text-muted)" }}>
                  Soon
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Description of current audience ── */}
      <p className="text-xs leading-snug" style={{ color: "var(--palette-text-muted)" }}>
        {currentAudience === "only_me"
          ? "Only you can read this entry."
          : "Only the friends you select can read this entry."}
      </p>

      {error && <p role="alert" className="text-xs text-red-700">{error}</p>}

      {/* ── Friend sharing panel (only after saving + Supabase available) ── */}
      {sharingAvailable && currentAudience !== "only_me" && (
        entryId ? (
          <DiaryShareControl
            entryId={entryId}
            onRecipientsChanged={handleRecipientsChanged}
          />
        ) : (
          <p className="text-xs" style={{ color: "var(--palette-text-muted)" }}>
            Save this entry first to choose who can read it.
          </p>
        )
      )}
    </div>
  );
}
