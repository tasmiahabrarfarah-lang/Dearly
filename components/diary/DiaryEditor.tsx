"use client";

/**
 * DiaryEditor
 * Two-column writing interface:
 *   LEFT  — physical paper writing surface (title + body)
 *   RIGHT — customization sidebar (page color, font, text size) + save/back
 *
 * Handles both new entries (entryId=null) and editing existing ones.
 * Warns before discarding unsaved changes.
 */

import React, { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Save, Check, AlertCircle } from "lucide-react";
import { useDiary } from "./DiaryContext";
import {
  DiaryEntry,
  DiaryAudience,
  PAGE_COLORS,
  FONT_OPTIONS,
  FONT_SIZES,
  formatDate,
} from "@/lib/diaryStorage";
import AudienceControl from "./AudienceControl";

interface Props {
  entryId: string | null; // null = new entry
}

export default function DiaryEditor({ entryId }: Props) {
  const { state, openList, saveEntry, createBlankEntry } = useDiary();

  // Resolve initial entry
  const existing =
    entryId != null
      ? state.entries.find((e) => e.id === entryId) ?? null
      : null;

  // Mutable draft state
  const [draft, setDraft] = useState<DiaryEntry>(() =>
    existing
      ? { ...existing }
      : createBlankEntry()
  );

  const [saved, setSaved] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [saveErrorLocal, setSaveErrorLocal] = useState<string | null>(null);

  // Track save feedback
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // When existing entry changes (navigated to a different one)
  useEffect(() => {
    if (existing) {
      setDraft({ ...existing });
      setIsDirty(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entryId]);

  const update = useCallback(
    <K extends keyof DiaryEntry>(key: K, value: DiaryEntry[K]) => {
      setDraft((prev) => ({ ...prev, [key]: value }));
      setIsDirty(true);
      setSaved(false);
    },
    []
  );

  const handleSave = () => {
    // Skip saving empty new entries
    if (!draft.body.trim() && !draft.title.trim()) {
      setSaveErrorLocal("Add a title or some writing before saving.");
      return;
    }
    setSaveErrorLocal(null);

    const now = new Date().toISOString();
    const entryToSave: DiaryEntry = {
      ...draft,
      title: draft.title.trim(),
      updatedAt: now,
      // Only update createdAt if this is brand new
      createdAt: existing ? draft.createdAt : now,
    };

    const ok = saveEntry(entryToSave);
    if (ok) {
      setDraft(entryToSave);
      setIsDirty(false);
      setSaved(true);
      if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
      savedTimerRef.current = setTimeout(() => setSaved(false), 2500);
    } else {
      setSaveErrorLocal("Couldn't save. Your browser storage may be full.");
    }
  };

  const handleBack = () => {
    if (isDirty) {
      const confirmed = window.confirm(
        "You have unsaved changes. Leave without saving?"
      );
      if (!confirmed) return;
    }
    openList();
  };

  // Keyboard save: Ctrl+S / Cmd+S
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft, isDirty]);

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* ── Editor top bar ───────────────────────────────── */}
      <div
        className="flex items-center justify-between mb-4 pb-3 flex-shrink-0"
        style={{ borderBottom: "1px solid var(--palette-surface-border)" }}
      >
        <button
          onClick={handleBack}
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

        <div className="flex items-center gap-2">
          {/* Unsaved indicator */}
          {isDirty && !saved && (
            <span
              className="text-xs"
              style={{ color: "var(--palette-text-muted)" }}
            >
              Unsaved
            </span>
          )}

          {/* Save button */}
          <button
            onClick={handleSave}
            className="
              flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold
              transition-all duration-150 active:scale-95
            "
            style={{
              background: saved ? "#6baf7a" : "var(--palette-accent)",
              color: "#fff",
            }}
            title="Save (Ctrl+S)"
          >
            {saved ? (
              <>
                <Check size={14} aria-hidden />
                <span>Saved</span>
              </>
            ) : (
              <>
                <Save size={14} aria-hidden />
                <span>Save Entry</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── Error banner ─────────────────────────────────── */}
      {(saveErrorLocal || state.saveError) && (
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-xl mb-3 text-sm flex-shrink-0"
          style={{ background: "#fde8e8", color: "#a02020" }}
          role="alert"
        >
          <AlertCircle size={14} aria-hidden />
          <span>{saveErrorLocal || state.saveError}</span>
        </div>
      )}

      {/* ── Main two-column layout ───────────────────────── */}
      <div className="flex gap-5 min-h-0 flex-1 overflow-hidden">
        {/* LEFT — Paper writing surface */}
        <div className="flex-1 min-w-0 flex flex-col min-h-0">
          <PaperSurface draft={draft} update={update} />
        </div>

        {/* RIGHT — Sidebar */}
        <div
          className="
            w-52 flex-shrink-0 flex flex-col gap-5
            overflow-y-auto
            hidden sm:flex
          "
        >
          <DiaryCustomizationSidebar draft={draft} update={update} />
        </div>
      </div>

      {/* Mobile: controls below paper */}
      <div
        className="mt-4 sm:hidden flex-shrink-0"
        style={{ borderTop: "1px solid var(--palette-surface-border)", paddingTop: "1rem" }}
      >
        <DiaryCustomizationSidebar draft={draft} update={update} compact />
      </div>
    </div>
  );
}

/* ── Paper writing surface ──────────────────────────────────────────────── */
interface PaperProps {
  draft: DiaryEntry;
  update: <K extends keyof DiaryEntry>(key: K, value: DiaryEntry[K]) => void;
}

function PaperSurface({ draft, update }: PaperProps) {
  return (
    <motion.div
      className="relative flex flex-col flex-1 min-h-0 rounded-2xl overflow-hidden"
      style={{
        background: draft.pageColor,
        boxShadow:
          "0 4px 32px rgba(80,50,140,0.13), 0 1px 4px rgba(80,50,140,0.08)",
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

      {/* Ruled lines background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "repeating-linear-gradient(to bottom, transparent, transparent 31px, rgba(160,130,200,0.12) 32px)",
          backgroundPositionY: "80px",
        }}
      />

      {/* Paper inner padding — left of binding line */}
      <div className="relative flex flex-col flex-1 min-h-0 px-6 pt-5 pb-6 pl-14">
        {/* Meta */}
        <p
          className="text-xs mb-3"
          style={{ color: "rgba(100,80,140,0.55)", fontFamily: draft.fontFamily }}
        >
          {formatDate(draft.updatedAt !== draft.createdAt ? draft.updatedAt : draft.createdAt)}
        </p>

        {/* Title field */}
        <input
          type="text"
          value={draft.title}
          onChange={(e) => update("title", e.target.value)}
          placeholder="Title…"
          maxLength={120}
          aria-label="Entry title"
          className="
            w-full bg-transparent border-none outline-none resize-none
            font-semibold mb-4 leading-snug
            placeholder:opacity-30
          "
          style={{
            fontFamily: draft.fontFamily,
            fontSize: `${draft.fontSize + 4}px`,
            color: "var(--palette-text-primary)",
          }}
        />

        {/* Divider */}
        <div
          className="mb-4"
          style={{ borderBottom: "1px solid rgba(160,130,200,0.2)" }}
        />

        {/* Body textarea */}
        <textarea
          value={draft.body}
          onChange={(e) => update("body", e.target.value)}
          placeholder="Write something…"
          aria-label="Entry body"
          className="
            flex-1 min-h-[240px] w-full bg-transparent border-none outline-none
            resize-none leading-8 placeholder:opacity-30
          "
          style={{
            fontFamily: draft.fontFamily,
            fontSize: `${draft.fontSize}px`,
            color: "var(--palette-text-primary)",
            lineHeight: "2",
          }}
        />
      </div>
    </motion.div>
  );
}

/* ── Customization sidebar ──────────────────────────────────────────────── */
interface SidebarProps {
  draft: DiaryEntry;
  update: <K extends keyof DiaryEntry>(key: K, value: DiaryEntry[K]) => void;
  compact?: boolean;
}

function DiaryCustomizationSidebar({ draft, update, compact }: SidebarProps) {
  return (
    <div
      className={
        compact
          ? "flex flex-wrap gap-6"
          : "flex flex-col gap-5"
      }
    >
      {/* ── Audience / Privacy ─── */}
      <div className={compact ? "w-full" : undefined}>
        <AudienceControl
          audience={draft.audience}
          onChange={(value: DiaryAudience) => update("audience", value)}
        />
      </div>

      {/* ── Page color ─── */}
      <div>
        <p
          className="text-xs font-semibold uppercase tracking-wider mb-2"
          style={{ color: "var(--palette-text-muted)" }}
        >
          Page Color
        </p>
        <div className="flex flex-wrap gap-2">
          {PAGE_COLORS.map((c) => (
            <button
              key={c.value}
              aria-label={c.label}
              aria-pressed={draft.pageColor === c.value}
              onClick={() => update("pageColor", c.value)}
              title={c.label}
              className="
                w-7 h-7 rounded-full transition-all duration-150
                active:scale-90
              "
              style={{
                background: c.value,
                border:
                  draft.pageColor === c.value
                    ? "2.5px solid var(--palette-accent)"
                    : "1.5px solid rgba(130,100,180,0.25)",
                boxShadow:
                  draft.pageColor === c.value
                    ? "0 0 0 2px var(--palette-accent-soft)"
                    : "none",
              }}
            />
          ))}
        </div>
      </div>

      {/* ── Font ─── */}
      <div>
        <p
          className="text-xs font-semibold uppercase tracking-wider mb-2"
          style={{ color: "var(--palette-text-muted)" }}
        >
          Font
        </p>
        <div className="flex flex-col gap-1.5">
          {FONT_OPTIONS.map((f) => (
            <button
              key={f.value}
              onClick={() => update("fontFamily", f.value)}
              aria-pressed={draft.fontFamily === f.value}
              className="
                text-left px-3 py-2 rounded-xl text-sm
                transition-all duration-150 active:scale-[0.98]
              "
              style={{
                fontFamily: f.value,
                background:
                  draft.fontFamily === f.value
                    ? "var(--palette-ground)"
                    : "transparent",
                border: `1.5px solid ${
                  draft.fontFamily === f.value
                    ? "var(--palette-accent)"
                    : "var(--palette-surface-border)"
                }`,
                color: "var(--palette-text-primary)",
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Text size ─── */}
      <div>
        <p
          className="text-xs font-semibold uppercase tracking-wider mb-2"
          style={{ color: "var(--palette-text-muted)" }}
        >
          Text Size
        </p>
        <div className="flex flex-wrap gap-1.5">
          {FONT_SIZES.map((s) => (
            <button
              key={s.value}
              onClick={() => update("fontSize", s.value)}
              aria-pressed={draft.fontSize === s.value}
              className="
                px-3 py-1.5 rounded-xl text-xs font-medium
                transition-all duration-150 active:scale-95
              "
              style={{
                background:
                  draft.fontSize === s.value
                    ? "var(--palette-accent)"
                    : "var(--palette-ground)",
                color:
                  draft.fontSize === s.value ? "#fff" : "var(--palette-text-primary)",
                border: "none",
              }}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
