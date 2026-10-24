"use client";

/**
 * LittleNotesSection
 * Displays and accepts Little Notes on a diary entry.
 *
 * Permissions (mirrored from DB RLS):
 *   - Entry owner: can read all notes, can delete any note.
 *   - Authorized recipient: can read notes, can leave a note, can delete own notes.
 *   - Everyone else: section is not rendered.
 *
 * The component re-verifies permissions by checking whether notes load
 * successfully — not by trusting client-side state alone. All mutations
 * go through server actions that independently verify auth + RLS.
 */

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Trash2, Send } from "lucide-react";
import { AvatarImage } from "@/components/profile/avatars";
import type { AvatarKey } from "@/lib/profile";
import {
  getNotes,
  createNote,
  deleteNote,
  type LittleNote,
} from "@/app/notes/actions";

const MAX_LENGTH = 500;

// ── Timestamp helper ──────────────────────────────────────────────────────────

function formatNoteDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

// ── Note card ─────────────────────────────────────────────────────────────────

interface NoteCardProps {
  note: LittleNote;
  /** True when the current user can delete this note (author OR entry owner). */
  canDelete: boolean;
  onDelete: (id: string) => void;
}

function NoteCard({ note, canDelete, onDelete }: NoteCardProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const avatarKey = (note.author?.avatar_key ?? "star") as AvatarKey;
  const displayName = note.author?.display_name ?? "Someone";

  const handleDelete = async () => {
    setDeleting(true);
    setDeleteError(null);
    const result = await deleteNote(note.id);
    setDeleting(false);
    if (result.error) {
      setDeleteError(result.error);
      setConfirmDelete(false);
    } else {
      onDelete(note.id);
    }
  };

  return (
    <div
      className="relative rounded-2xl p-4"
      style={{
        background: "rgba(255,252,255,0.55)",
        border: "1px solid var(--palette-surface-border)",
      }}
    >
      {/* Author row */}
      <div className="flex items-center gap-2.5 mb-2">
        <AvatarImage avatarKey={avatarKey} accessory={note.author?.avatar_accessory} className="h-7 w-7 flex-shrink-0 rounded-full overflow-hidden" />
        <div className="min-w-0 flex-1">
          <p
            className="text-sm font-semibold leading-tight truncate"
            style={{ color: "var(--palette-text-primary)" }}
          >
            {displayName}
          </p>
          <p
            className="text-xs leading-tight"
            style={{ color: "var(--palette-text-muted)", opacity: 0.75 }}
          >
            {formatNoteDate(note.created_at)}
          </p>
        </div>

        {/* Delete action */}
        {canDelete && !confirmDelete && (
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            aria-label="Delete this note"
            className="flex-shrink-0 p-1.5 rounded-lg transition-colors duration-100 hover:bg-red-100 active:scale-90"
            style={{ color: "rgba(160,60,60,0.55)" }}
          >
            <Trash2 size={13} aria-hidden />
          </button>
        )}
      </div>

      {/* Note content — rendered as plain text, never as HTML */}
      <p
        className="text-sm leading-relaxed whitespace-pre-wrap break-words"
        style={{ color: "var(--palette-text-primary)" }}
      >
        {note.content}
      </p>

      {/* Inline delete confirmation */}
      {confirmDelete && (
        <div
          className="mt-3 pt-3 flex items-center justify-between gap-3"
          style={{ borderTop: "1px solid var(--palette-surface-border)" }}
        >
          <p className="text-xs" style={{ color: "var(--palette-text-muted)" }}>
            Remove this note?
          </p>
          <div className="flex gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={() => setConfirmDelete(false)}
              disabled={deleting}
              className="px-3 py-1 rounded-lg text-xs font-medium glass transition-colors hover:bg-[var(--palette-ground)]"
              style={{ color: "var(--palette-text-primary)" }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => void handleDelete()}
              disabled={deleting}
              className="px-3 py-1 rounded-lg text-xs font-semibold bg-red-500 text-white hover:bg-red-600 active:scale-95 transition-all disabled:opacity-50"
            >
              {deleting ? "Removing…" : "Remove"}
            </button>
          </div>
        </div>
      )}

      {deleteError && (
        <p className="mt-2 text-xs text-red-700" role="alert">
          {deleteError}
        </p>
      )}
    </div>
  );
}

// ── Compose form ──────────────────────────────────────────────────────────────

interface ComposeFormProps {
  entryId: string;
  onNoteCreated: (note: LittleNote) => void;
}

function ComposeForm({ entryId, onNoteCreated }: ComposeFormProps) {
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const successTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const remaining = MAX_LENGTH - text.length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return; // prevent duplicate submissions

    const trimmed = text.trim();
    if (!trimmed) {
      setError("Your note can't be empty.");
      return;
    }
    if (trimmed.length > MAX_LENGTH) {
      setError(`Notes must be ${MAX_LENGTH} characters or fewer.`);
      return;
    }

    setSubmitting(true);
    setError(null);

    const result = await createNote(entryId, trimmed);
    setSubmitting(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    // Clear the form and refresh notes
    setText("");
    setSuccess(true);
    if (successTimerRef.current) clearTimeout(successTimerRef.current);
    successTimerRef.current = setTimeout(() => setSuccess(false), 3000);

    // Trigger a re-fetch so the new note appears with its author info
    onNoteCreated({
      id: "_pending_" + Date.now(),
      entry_id: entryId,
      author_id: "",
      content: trimmed,
      created_at: new Date().toISOString(),
      author: null,
    });
  };

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="flex flex-col gap-3">
      <label
        className="text-xs font-semibold uppercase tracking-wider"
        style={{ color: "var(--palette-text-muted)" }}
        htmlFor="little-note-input"
      >
        Leave a note
      </label>

      <div className="relative">
        <textarea
          id="little-note-input"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setError(null);
          }}
          placeholder="Write something warm…"
          maxLength={MAX_LENGTH}
          rows={3}
          disabled={submitting}
          aria-label="Write a little note"
          className="
            w-full resize-none rounded-xl px-4 py-3 text-sm leading-relaxed
            border outline-none transition-colors duration-150
            placeholder:opacity-40
            disabled:opacity-60
          "
          style={{
            background: "rgba(255,252,255,0.65)",
            border: "1.5px solid var(--palette-surface-border)",
            color: "var(--palette-text-primary)",
            fontFamily: "inherit",
          }}
          onFocus={(e) => {
            e.target.style.borderColor = "var(--palette-accent)";
          }}
          onBlur={(e) => {
            e.target.style.borderColor = "var(--palette-surface-border)";
          }}
        />

        {/* Character counter — only shown when nearing the limit */}
        {text.length > MAX_LENGTH - 100 && (
          <span
            className="absolute bottom-2 right-3 text-xs tabular-nums"
            style={{
              color: remaining < 20 ? "#b04040" : "var(--palette-text-muted)",
              opacity: 0.7,
            }}
            aria-live="polite"
          >
            {remaining}
          </span>
        )}
      </div>

      {error && (
        <p className="text-xs text-red-700" role="alert">
          {error}
        </p>
      )}

      <div className="flex items-center justify-between gap-3">
        {success && (
          <p
            className="text-xs"
            style={{ color: "var(--palette-accent)" }}
            role="status"
          >
            ✓ Note left ♡
          </p>
        )}
        {!success && <span />}

        <button
          type="submit"
          disabled={submitting || text.trim().length === 0}
          className="
            inline-flex items-center gap-2 px-4 py-2 rounded-xl
            text-sm font-semibold text-white
            transition-all duration-150 active:scale-95
            disabled:opacity-50 disabled:cursor-not-allowed
            flex-shrink-0
          "
          style={{ background: "var(--palette-accent)" }}
        >
          <Send size={13} aria-hidden />
          <span>{submitting ? "Sending…" : "Leave a Little Note"}</span>
        </button>
      </div>
    </form>
  );
}

// ── Main section ──────────────────────────────────────────────────────────────

interface LittleNotesSectionProps {
  entryId: string;
  /** True when the current user owns this diary entry. */
  isOwner: boolean;
  /** True when the current user is an authorized recipient (not the owner). */
  isRecipient: boolean;
  /** The current user's Supabase auth UID, used to determine note authorship. */
  currentUserId: string | null;
}

export default function LittleNotesSection({
  entryId,
  isOwner,
  isRecipient,
  currentUserId,
}: LittleNotesSectionProps) {
  const [notes, setNotes] = useState<LittleNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Whether loading has completed at least once (so we can show empty state)
  const [loaded, setLoaded] = useState(false);

  const canView = isOwner || isRecipient;
  const canCompose = isRecipient || isOwner;

  const loadNotes = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await getNotes(entryId);
    setLoading(false);
    setLoaded(true);
    if (result.error) {
      setError(result.error);
    } else {
      setNotes(result.notes ?? []);
    }
  }, [entryId]);

  useEffect(() => {
    if (canView) void loadNotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entryId, canView]);

  const handleNoteDeleted = useCallback((id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  }, []);

  // After an optimistic creation, reload from server to get the real note with author info
  const handleNoteCreated = useCallback(() => {
    void loadNotes();
  }, [loadNotes]);

  if (!canView) return null;

  return (
    <section
      aria-labelledby="little-notes-heading"
      className="mt-6"
    >
      {/* ── Section header ── */}
      <div
        className="flex items-center gap-2 pb-3 mb-4"
        style={{ borderBottom: "1px solid var(--palette-surface-border)" }}
      >
        {/* Decorative envelope motif */}
        <span aria-hidden className="text-base select-none" style={{ opacity: 0.6 }}>
          ✉
        </span>
        <h3
          id="little-notes-heading"
          className="text-sm font-semibold uppercase tracking-wider"
          style={{ color: "var(--palette-text-muted)" }}
        >
          Little Notes
        </h3>
      </div>

      {/* ── Loading state ── */}
      {loading && (
        <p
          className="text-sm py-4 text-center"
          style={{ color: "var(--palette-text-muted)" }}
          role="status"
        >
          Loading notes…
        </p>
      )}

      {/* ── Error state ── */}
      {!loading && error && (
        <div
          className="rounded-xl px-4 py-3 text-sm mb-4"
          style={{
            background: "rgba(253,232,232,0.8)",
            color: "#a02020",
            border: "1px solid rgba(200,100,100,0.2)",
          }}
          role="alert"
        >
          {error}
        </div>
      )}

      {/* ── Empty state ── */}
      {!loading && !error && loaded && notes.length === 0 && (
        <div className="text-center py-6 mb-2">
          <p
            className="text-sm leading-relaxed"
            style={{ color: "var(--palette-text-muted)", opacity: 0.8 }}
          >
            {canCompose
              ? "Leave a little note to make this memory even more special."
              : "No notes on this entry yet."}
          </p>
        </div>
      )}

      {/* ── Notes list ── */}
      {!loading && !error && notes.length > 0 && (
        <div className="flex flex-col gap-3 mb-5">
          {notes.map((note) => {
            // Determine delete permission:
            // - Entry owner can delete any note
            // - Note author can delete their own note
            const canDelete =
              isOwner || (!!currentUserId && note.author_id === currentUserId);

            return (
              <NoteCard
                key={note.id}
                note={note}
                canDelete={canDelete}
                onDelete={handleNoteDeleted}
              />
            );
          })}
        </div>
      )}

      {/* ── Compose form ── */}
      {!loading && !error && canCompose && (
        <div
          className="rounded-2xl p-4"
          style={{
            background: "rgba(255,252,255,0.38)",
            border: "1px solid var(--palette-surface-border)",
          }}
        >
          <ComposeForm entryId={entryId} onNoteCreated={handleNoteCreated} />
        </div>
      )}
    </section>
  );
}
