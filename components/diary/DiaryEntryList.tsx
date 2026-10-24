"use client";

/**
 * DiaryEntryList
 * Chronological list of saved entries, newest first.
 * Includes empty state, entry preview cards, delete with confirmation.
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PenLine, Trash2, BookOpen, Plus, Search, X } from "lucide-react";
import { useDiary } from "./DiaryContext";
import type { SharedDiaryEntry } from "./DiaryContext";
import { formatDateShort } from "@/lib/diaryStorage";
import { AudienceBadge } from "./AudienceControl";
import { AvatarImage } from "@/components/profile/avatars";

export default function DiaryEntryList() {
  const { state, openEditor, openReader, removeEntry } =
    useDiary();
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const { entries } = state;
  const [listMode, setListMode] = useState<"mine" | "shared">("mine");
  const [query, setQuery] = useState("");

  // Sort newest first (already sorted in context, but defensive)
  const sorted = [...entries].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  const sortedShared = [...state.sharedEntries].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const visibleEntries = (listMode === "mine" ? sorted : sortedShared).filter((entry) =>
    !normalizedQuery || `${entry.title}\n${entry.body}`.toLocaleLowerCase().includes(normalizedQuery)
  );

  const handleNewEntry = () => {
    openEditor(null);
  };

  const handleDelete = async (id: string) => {
    setDeleteError(null);
    if (await removeEntry(id)) setConfirmDeleteId(null);
    else setDeleteError("This entry could not be deleted. Check your connection and try again.");
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* ── Header ──────────────────────────────────────── */}
      <div
        className="flex items-center justify-between pb-4 mb-4"
        style={{ borderBottom: "1px solid var(--palette-surface-border)" }}
      >
        <div>
          <h2
            className="text-lg font-semibold"
            style={{ color: "var(--palette-text-primary)" }}
          >
            My Diary
          </h2>
          <p
            className="text-xs mt-0.5"
            style={{ color: "var(--palette-text-muted)" }}
          >
            {entries.length === 0
              ? "Your pages are waiting for you."
              : `${entries.length} entr${entries.length === 1 ? "y" : "ies"}`}
          </p>
        </div>
        {listMode === "mine" && <button
          onClick={handleNewEntry}
          className="
            flex items-center gap-2 px-4 py-2 rounded-xl
            text-sm font-semibold
            transition-all duration-150 active:scale-95
          "
          style={{
            background: "var(--palette-accent)",
            color: "#fff",
          }}
        >
          <Plus size={15} aria-hidden />
          <span>New Entry</span>
        </button>}
      </div>

      {state.accessNotice && <p role="status" className="mb-3 rounded-xl px-3 py-2 text-sm" style={{ background: "var(--palette-ground)", color: "var(--palette-text-primary)" }}>{state.accessNotice}</p>}
      {deleteError && <p role="alert" className="mb-3 rounded-xl px-3 py-2 text-sm" style={{ background: "rgba(180,40,50,.08)", color: "#a33" }}>{deleteError}</p>}
      {!state.isLoaded && <p role="status" className="py-8 text-center text-sm" style={{ color: "var(--palette-text-muted)" }}>Opening your diary…</p>}

      <div className="mb-3 flex gap-2" role="tablist" aria-label="Diary entries">
        <button type="button" role="tab" aria-selected={listMode === "mine"} onClick={() => setListMode("mine")} className="rounded-xl px-3 py-1.5 text-sm font-medium" style={{ background: listMode === "mine" ? "var(--palette-ground)" : "transparent", color: "var(--palette-text-primary)" }}>My entries</button>
        <button type="button" role="tab" aria-selected={listMode === "shared"} onClick={() => setListMode("shared")} className="rounded-xl px-3 py-1.5 text-sm font-medium" style={{ background: listMode === "shared" ? "var(--palette-ground)" : "transparent", color: "var(--palette-text-primary)" }}>Shared with me{sortedShared.length > 0 ? ` (${sortedShared.length})` : ""}</button>
      </div>

      {state.isLoaded && (listMode === "mine" ? sorted.length : sortedShared.length) > 0 && (
        <label className="mb-3 flex items-center gap-2 rounded-xl px-3 py-2" style={{ background: "var(--palette-ground)", color: "var(--palette-text-muted)" }}>
          <Search size={15} aria-hidden />
          <span className="sr-only">Search {listMode === "mine" ? "my" : "shared"} diary entries</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Find a memory…"
            className="min-w-0 flex-1 rounded-md bg-transparent text-sm outline-none placeholder:opacity-70 focus-visible:ring-2 focus-visible:ring-[var(--palette-accent)]"
            style={{ color: "var(--palette-text-primary)" }}
          />
          {query && <button type="button" onClick={() => setQuery("")} aria-label="Clear search" className="rounded-md p-1 hover:bg-[var(--palette-surface)]"><X size={14} aria-hidden /></button>}
        </label>
      )}

      {/* ── Empty state ──────────────────────────────────── */}
      {state.loadError && <p role="alert" className="mb-3 rounded-xl px-3 py-2 text-sm" style={{ background: "rgba(180,40,50,.08)", color: "#a33" }}>{state.loadError} Refresh the diary to try again.</p>}
      {state.isLoaded && !state.loadError && listMode === "mine" && sorted.length === 0 && (
        <motion.div
          className="flex flex-col items-center justify-center flex-1 gap-5 py-10 text-center"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: "var(--palette-ground)" }}
          >
            <BookOpen
              size={28}
              style={{ color: "var(--palette-accent)" }}
              aria-hidden
            />
          </div>
          <div>
            <p
              className="text-base font-semibold mb-1"
              style={{ color: "var(--palette-text-primary)" }}
            >
              Every little memory has a place here.
            </p>
            <p
              className="text-sm"
              style={{ color: "var(--palette-text-muted)" }}
            >
              Your pages are waiting for you.
            </p>
          </div>
          <button
            onClick={handleNewEntry}
            className="
              flex items-center gap-2 px-5 py-2.5 rounded-xl
              text-sm font-semibold
              transition-all duration-150 active:scale-95
            "
            style={{
              background: "var(--palette-accent)",
              color: "#fff",
            }}
          >
            <PenLine size={15} aria-hidden />
            <span>Write your first entry</span>
          </button>
        </motion.div>
      )}

      {state.isLoaded && !state.loadError && listMode === "shared" && !state.sharingAvailable && (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 py-10 text-center">
          <BookOpen size={28} style={{ color: "var(--palette-accent)" }} aria-hidden />
          <p className="text-sm font-semibold" style={{ color: "var(--palette-text-primary)" }}>Shared entries are unavailable.</p>
          <p className="text-xs" style={{ color: "var(--palette-text-muted)" }}>Connect Supabase and apply the diary sharing migration to enable secure sharing.</p>
        </div>
      )}
      {state.isLoaded && !state.loadError && listMode === "shared" && state.sharingAvailable && sortedShared.length === 0 && (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 py-10 text-center">
          <BookOpen size={28} style={{ color: "var(--palette-accent)" }} aria-hidden />
          <p className="text-sm font-semibold" style={{ color: "var(--palette-text-primary)" }}>No entries have been shared with you yet.</p>
          <p className="text-xs" style={{ color: "var(--palette-text-muted)" }}>When a friend shares a memory, it will appear here.</p>
        </div>
      )}

      {/* ── Entry list ───────────────────────────────────── */}
      <div className="diary-entry-scroll flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto overscroll-contain pr-2">
        {state.isLoaded && !state.loadError && normalizedQuery && visibleEntries.length === 0 && <p role="status" className="py-8 text-center text-sm" style={{ color: "var(--palette-text-muted)" }}>No memories found. Try another word or clear your search.</p>}
        <AnimatePresence initial={false}>
          {state.isLoaded && visibleEntries.map((entry) => {
            const sharedEntry = "ownerId" in entry ? entry as SharedDiaryEntry : null;
            return (
            <motion.div
              key={entry.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="group relative shrink-0 rounded-2xl overflow-hidden"
              style={{
                background: entry.pageColor,
                border: "1px solid var(--palette-surface-border)",
                boxShadow: "0 2px 12px rgba(100,80,160,0.08)",
              }}
            >
              {/* Main click area — opens reader */}
              <button
                className="w-full text-left p-4 pr-20 sm:pr-4"
                onClick={() => openReader(entry.id)}
                aria-label={`Open entry: ${entry.title || "Untitled"}`}
              >
                <p
                  className="font-semibold text-sm leading-snug truncate mb-1"
                  style={{ color: "var(--palette-text-primary)", fontFamily: entry.fontFamily }}
                >
                  {entry.title || (
                    <span style={{ color: "var(--palette-text-muted)" }}>
                      Untitled
                    </span>
                  )}
                </p>
                {sharedEntry && <span className="mb-1 flex items-center gap-1.5 text-xs" style={{ color: "var(--palette-text-muted)" }}><AvatarImage avatarKey={sharedEntry.ownerAvatarKey} accessory={sharedEntry.ownerAvatarAccessory} className="h-5 w-5" /><span>From {sharedEntry.ownerName}</span></span>}
                <p
                  className="text-xs mb-2"
                  style={{ color: "var(--palette-text-muted)" }}
                >
                  {formatDateShort(entry.createdAt)}
                  {entry.updatedAt !== entry.createdAt && " · edited"}
                </p>
                {/* Shared entries and non-default legacy audiences have clear labels. */}
                {sharedEntry ? (
                  <div className="mb-2"><span className="text-xs font-medium" style={{ color: "var(--palette-accent)" }}>Shared with you · Read only</span></div>
                ) : entry.audience && entry.audience !== "only_me" && (
                  <div className="mb-2">
                    <AudienceBadge audience={entry.audience} />
                  </div>
                )}
                {/* Lock icon for private entries — subtle, not alarming */}
                {!sharedEntry && (!entry.audience || entry.audience === "only_me") && (
                  <div className="mb-2">
                    <span
                      className="inline-flex items-center gap-1 text-xs"
                      style={{ color: "var(--palette-text-muted)", opacity: 0.6 }}
                      aria-label="Private entry"
                    >
                      🔒
                    </span>
                  </div>
                )}
                {entry.body && (
                  <p
                    className="text-xs leading-relaxed line-clamp-2"
                    style={{
                      color: "var(--palette-text-primary)",
                      opacity: 0.75,
                      fontFamily: entry.fontFamily,
                    }}
                  >
                    {entry.body.slice(0, 160)}
                    {entry.body.length > 160 && "…"}
                  </p>
                )}
              </button>

              {/* Action buttons */}
              {!sharedEntry && <div
                className="
                  absolute top-3 right-3 flex gap-1
                  opacity-100 sm:opacity-0 sm:group-hover:opacity-100 group-focus-within:opacity-100
                  transition-opacity duration-150
                "
              >
                <button
                  onClick={() => openEditor(entry.id)}
                  aria-label={`Edit entry: ${entry.title || "Untitled"}`}
                  className="
                    p-1.5 rounded-lg text-xs
                    transition-colors duration-100
                    hover:bg-[var(--palette-ground)]
                    active:scale-90
                  "
                  style={{ color: "var(--palette-text-muted)" }}
                >
                  <PenLine size={13} aria-hidden />
                </button>
                <button
                  onClick={() => setConfirmDeleteId(entry.id)}
                  aria-label={`Delete entry: ${entry.title || "Untitled"}`}
                  className="
                    p-1.5 rounded-lg
                    transition-colors duration-100
                    hover:bg-red-100
                    active:scale-90
                  "
                  style={{ color: "#b05050" }}
                >
                  <Trash2 size={13} aria-hidden />
                </button>
              </div>}

              {/* Delete confirmation overlay */}
              {!sharedEntry && <AnimatePresence>
                {confirmDeleteId === entry.id && (
                  <motion.div
                    className="
                      absolute inset-0 rounded-2xl flex flex-col items-center
                      justify-center gap-3 p-4 text-center
                    "
                    style={{ background: "rgba(253,246,236,0.97)" }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <p
                      className="text-sm font-medium"
                      style={{ color: "var(--palette-text-primary)" }}
                    >
                      Delete &ldquo;{entry.title || "Untitled"}&rdquo;?
                    </p>
                    <p
                      className="text-xs"
                      style={{ color: "var(--palette-text-muted)" }}
                    >
                      This cannot be undone.
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setConfirmDeleteId(null)}
                        className="px-3 py-1.5 rounded-xl text-xs font-medium glass"
                        style={{ color: "var(--palette-text-primary)" }}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleDelete(entry.id)}
                        className="
                          px-3 py-1.5 rounded-xl text-xs font-semibold
                          bg-red-500 text-white
                          hover:bg-red-600 active:scale-95
                          transition-all duration-150
                        "
                      >
                        Delete Entry
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>}
            </motion.div>
          );})}
        </AnimatePresence>
      </div>
    </div>
  );
}
