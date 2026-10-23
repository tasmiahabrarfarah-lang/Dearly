"use client";

/**
 * DiaryEntryView
 * Read-only view of a single diary entry.
 * Shows title, date, body with saved formatting.
 * Provides Edit Entry and Back to Entries actions.
 */

import React from "react";
import { motion } from "framer-motion";
import { ArrowLeft, PenLine } from "lucide-react";
import { useDiary } from "./DiaryContext";
import { formatDate } from "@/lib/diaryStorage";
import { AudienceBadge } from "./AudienceControl";
import DiaryShareControl from "./DiaryShareControl";
import { AvatarImage } from "@/components/profile/avatars";

interface Props {
  entryId: string;
}

export default function DiaryEntryView({ entryId }: Props) {
  const { state, openList, openEditor } = useDiary();
  const ownEntry = state.entries.find((e) => e.id === entryId);
  const sharedEntry = state.sharedEntries.find((e) => e.id === entryId);
  const entry = ownEntry ?? sharedEntry;

  if (!entry) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <p style={{ color: "var(--palette-text-muted)" }} className="text-sm">
          Entry not found.
        </p>
        <button
          onClick={openList}
          className="px-4 py-2 rounded-xl text-sm font-medium glass"
          style={{ color: "var(--palette-text-primary)" }}
        >
          Back to Entries
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* ── Top bar ──────────────────────────────────────── */}
      <div
        className="flex items-center justify-between mb-4 pb-3 flex-shrink-0"
        style={{ borderBottom: "1px solid var(--palette-surface-border)" }}
      >
        <button
          onClick={openList}
          className="
            flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium
            hover:bg-[var(--palette-ground)] transition-colors duration-150
            active:scale-95
          "
          style={{ color: "var(--palette-text-muted)" }}
        >
          <ArrowLeft size={15} aria-hidden />
          <span>Back to Entries</span>
        </button>

        <div className="flex-1 flex items-center justify-center gap-2 px-2">
          {sharedEntry ? (
            <span className="flex items-center gap-1.5 text-xs" style={{ color: "var(--palette-text-muted)" }}><AvatarImage avatarKey={sharedEntry.ownerAvatarKey} className="h-5 w-5" /> Shared by {sharedEntry.ownerName} · Read only</span>
          ) : <AudienceBadge audience={entry.audience ?? "only_me"} />}
        </div>

        {ownEntry && state.sharingAvailable && <DiaryShareControl entryId={entry.id} />}
        {ownEntry && <button
          onClick={() => openEditor(entry.id)}
          className="
            flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold
            transition-all duration-150 active:scale-95
          "
          style={{
            background: "var(--palette-accent)",
            color: "#fff",
          }}
        >
          <PenLine size={14} aria-hidden />
          <span>Edit Entry</span>
        </button>}
      </div>

      {/* ── Paper surface ─────────────────────────────────── */}
      <motion.div
        className="flex-1 min-h-0 overflow-y-auto rounded-2xl relative"
        style={{
          background: entry.pageColor,
          boxShadow:
            "0 4px 32px rgba(80,50,140,0.12), 0 1px 4px rgba(80,50,140,0.07)",
          border: "1px solid rgba(160,130,200,0.18)",
        }}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Binding line */}
        <div
          className="absolute top-0 bottom-0 pointer-events-none"
          style={{
            left: "44px",
            width: "1.5px",
            background:
              "linear-gradient(to bottom, rgba(180,150,220,0.35), rgba(180,150,220,0.15) 80%, transparent)",
          }}
        />

        {/* Ruled lines */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "repeating-linear-gradient(to bottom, transparent, transparent 31px, rgba(160,130,200,0.12) 32px)",
            backgroundPositionY: "80px",
          }}
        />

        <div className="relative px-6 pt-5 pb-8 pl-14">
          {sharedEntry && <p className="mb-3 text-xs" style={{ color: "var(--palette-text-muted)" }}>From {sharedEntry.ownerName}{sharedEntry.ownerDearlyId ? ` · @${sharedEntry.ownerDearlyId}` : ""}</p>}
          {/* Date */}
          <p
            className="text-xs mb-4"
            style={{
              color: "rgba(100,80,140,0.5)",
              fontFamily: entry.fontFamily,
            }}
          >
            {formatDate(entry.updatedAt !== entry.createdAt ? entry.updatedAt : entry.createdAt)}
            {entry.updatedAt !== entry.createdAt && (
              <span> &middot; edited</span>
            )}
          </p>

          {/* Title */}
          {entry.title && (
            <h2
              className="font-semibold mb-4 leading-snug"
              style={{
                fontFamily: entry.fontFamily,
                fontSize: `${entry.fontSize + 4}px`,
                color: "var(--palette-text-primary)",
              }}
            >
              {entry.title}
            </h2>
          )}

          {/* Divider */}
          <div
            className="mb-4"
            style={{ borderBottom: "1px solid rgba(160,130,200,0.18)" }}
          />

          {/* Body */}
          <div
            className="leading-8 whitespace-pre-wrap"
            style={{
              fontFamily: entry.fontFamily,
              fontSize: `${entry.fontSize}px`,
              color: "var(--palette-text-primary)",
              lineHeight: "2",
            }}
          >
            {entry.body || (
              <span style={{ opacity: 0.4 }}>Nothing written yet.</span>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
