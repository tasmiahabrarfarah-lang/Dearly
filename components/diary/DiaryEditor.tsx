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
  PAGE_COLORS,
  FONT_OPTIONS,
  FONT_SIZES,
  formatDate,
} from "@/lib/diaryStorage";
import AudienceControl from "./AudienceControl";
import { createClient } from "@/lib/supabase/client";

interface Props {
  entryId: string | null; // null = new entry
}

export default function DiaryEditor({ entryId }: Props) {
  const { state, openList, saveEntry, createBlankEntry, setEditorDirty } = useDiary();

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
  // Id of this entry once it exists in storage. For a brand-new entry the view's
  // entryId prop stays null forever, and `saved` flips back to false after 2.5s, so
  // the old `entryId ?? (saved ? draft.id : null)` made the sharing panel vanish
  // again shortly after saving. This stays set for the life of the editor.
  const [savedId, setSavedId] = useState<string | null>(existing?.id ?? null);
  const [isDirty, setIsDirty] = useState(false);
  const [saveErrorLocal, setSaveErrorLocal] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [draftStorageKey, setDraftStorageKey] = useState<string | null>(null);
  const draftTouchedRef = useRef(false);

  const preserveDraft = useCallback(() => {
    if (!draftStorageKey || !isDirty) return;
    try { sessionStorage.setItem(draftStorageKey, JSON.stringify(draft)); } catch { /* best effort */ }
  }, [draft, draftStorageKey, isDirty]);

  // Track save feedback
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const draftRevisionRef = useRef(0);

  // Recover a session-only draft under the authenticated account's own key.
  // If auth cannot be verified, don't read another account's browser draft.
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      let scope: string;
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        try {
          const { data, error } = await createClient().auth.getUser();
          if (error || cancelled) return;
          scope = data.user?.id ?? "local";
        } catch { return; }
      } else scope = "local";
      const key = `dearly:diary-draft:${scope}:${entryId ?? "new"}`;
      if (cancelled) return;
      setDraftStorageKey(key);
      try {
        const raw = sessionStorage.getItem(key);
        if (!raw || draftTouchedRef.current) return;
        const recovered = JSON.parse(raw) as Partial<DiaryEntry>;
        if (typeof recovered.id !== "string" || typeof recovered.title !== "string" || typeof recovered.body !== "string" || typeof recovered.createdAt !== "string") return;
        const safeDraft = { ...createBlankEntry(), ...recovered,
          pageColor: PAGE_COLORS.some((item) => item.value === recovered.pageColor) ? recovered.pageColor! : createBlankEntry().pageColor,
          fontFamily: FONT_OPTIONS.some((item) => item.value === recovered.fontFamily) ? recovered.fontFamily! : createBlankEntry().fontFamily,
          fontSize: FONT_SIZES.some((item) => item.value === recovered.fontSize) ? recovered.fontSize! : createBlankEntry().fontSize,
          audience: "only_me" as const, allowedFriendIds: [], excludedFriendIds: [],
        };
        setDraft(safeDraft);
        setIsDirty(true);
        setEditorDirty(true);
      } catch { /* session storage may be unavailable */ }
    })();
    return () => { cancelled = true; };
  }, [entryId, createBlankEntry, setEditorDirty]);

  useEffect(() => {
    if (!draftStorageKey) return;
    const timer = window.setTimeout(() => {
      try {
        if (isDirty) sessionStorage.setItem(draftStorageKey, JSON.stringify(draft));
        else sessionStorage.removeItem(draftStorageKey);
      } catch { /* session storage may be unavailable */ }
    }, 350);
    return () => window.clearTimeout(timer);
  }, [draft, draftStorageKey, isDirty]);

  useEffect(() => {
    if (!isDirty) return;
    const warn = (event: BeforeUnloadEvent) => {
      if (draftStorageKey) {
        preserveDraft();
      }
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [draft, draftStorageKey, isDirty, preserveDraft]);

  useEffect(() => {
    window.addEventListener("dearly:diary-preserve-draft", preserveDraft);
    return () => window.removeEventListener("dearly:diary-preserve-draft", preserveDraft);
  }, [preserveDraft]);

  // When existing entry changes (navigated to a different one)
  useEffect(() => {
    if (existing) {
      setDraft({ ...existing });
      setIsDirty(false);
      setEditorDirty(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entryId]);

  const update = useCallback(
    <K extends keyof DiaryEntry>(key: K, value: DiaryEntry[K]) => {
      draftTouchedRef.current = true;
      draftRevisionRef.current += 1;
      setDraft((prev) => ({ ...prev, [key]: value }));
      setIsDirty(true);
      setEditorDirty(true);
      setSaved(false);
      setSaveErrorLocal(null);
    },
    [setEditorDirty]
  );

  // Audience is persisted through the share rows (not the entry save), so changing it
  // must not mark the entry "Unsaved". Returning `prev` when nothing changed also
  // prevents render loops.
  const handleAudienceChange = useCallback((audience: DiaryEntry["audience"]) => {
    setDraft((prev) => (prev.audience === audience ? prev : { ...prev, audience }));
  }, []);

  const handleSave = async () => {
    if (saving) return;
    // Skip saving empty new entries
    if (!draft.body.trim() && !draft.title.trim()) {
      setSaveErrorLocal("Add a title or some writing before saving.");
      return;
    }
    setSaveErrorLocal(null);
    setSaving(true);

    const now = new Date().toISOString();
    const entryToSave: DiaryEntry = {
      ...draft,
      title: draft.title.trim(),
      updatedAt: now,
      // Only update createdAt if this is brand new
      createdAt: existing || savedId ? draft.createdAt : now,
    };
    const savedRevision = draftRevisionRef.current;

    try {
      const expectedUpdatedAt = existing?.updatedAt ?? (savedId ? draft.updatedAt : undefined);
      const ok = await saveEntry(entryToSave, expectedUpdatedAt);
      if (ok) {
        setSavedId(entryToSave.id);
        if (savedRevision === draftRevisionRef.current) {
          setDraft(entryToSave);
          setIsDirty(false);
          setEditorDirty(false);
          if (draftStorageKey) {
            try { sessionStorage.removeItem(draftStorageKey); } catch { /* best effort */ }
          }
          setSaved(true);
          if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
          savedTimerRef.current = setTimeout(() => setSaved(false), 2500);
        } else {
          setSaveErrorLocal("An earlier version was saved. Save again to keep your newer edits.");
        }
      } else {
        // DiaryContext sets a path-specific error; keep the unsaved draft.
        setSaveErrorLocal(null);
      }
    } finally { setSaving(false); }
  };

  const handleBack = () => {
    if (isDirty) {
      const confirmed = window.confirm(
        "Leave without saving? A session copy will be kept so you can recover this draft later."
      );
      if (!confirmed) return;
      preserveDraft();
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
  }, [draft, isDirty, saving]);

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
            disabled={saving}
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
                <span>{saving ? "Saving…" : "Save Entry"}</span>
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
          <DiaryCustomizationSidebar draft={draft} update={update} entryId={savedId} onAudienceChange={handleAudienceChange} sharingAvailable={state.sharingAvailable} />
        </div>
      </div>

      {/* Mobile: controls below paper */}
      <div
        className="mt-4 sm:hidden flex-shrink-0"
        style={{ borderTop: "1px solid var(--palette-surface-border)", paddingTop: "1rem" }}
      >
        <DiaryCustomizationSidebar draft={draft} update={update} compact entryId={savedId} onAudienceChange={handleAudienceChange} sharingAvailable={state.sharingAvailable} />
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
  entryId: string | null;
  onAudienceChange: (audience: DiaryEntry["audience"]) => void;
  sharingAvailable: boolean;
}

function DiaryCustomizationSidebar({ draft, update, compact, entryId, onAudienceChange, sharingAvailable }: SidebarProps) {
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
          entryId={entryId}
          sharingAvailable={sharingAvailable}
          onAudienceChange={onAudienceChange}
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
