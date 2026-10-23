"use server";

/**
 * app/notes/actions.ts
 * Server Actions for Little Notes v1.0.
 *
 * Authorization is enforced both here and by Supabase Row Level Security.
 * Never trust the client to supply an author_id — it always comes from the
 * authenticated session.
 */

import { createClient } from "@/lib/supabase/server";

const MAX_LENGTH = 500;

// ── Types ─────────────────────────────────────────────────────────────────────

export interface NoteAuthor {
  id: string;
  display_name: string;
  avatar_key: string;
}

export interface LittleNote {
  id: string;
  entry_id: string;
  author_id: string;
  content: string;
  created_at: string;
  author: NoteAuthor | null;
}

export interface NoteActionResult {
  error?: string;
  success?: boolean;
}

export interface GetNotesResult {
  notes?: LittleNote[];
  error?: string;
}

// ── getNotes ──────────────────────────────────────────────────────────────────

/**
 * Fetch all notes for a diary entry.
 * Access is enforced by the RLS policy: can_read_diary_entry(entry_id).
 * If the caller has no access, Supabase returns an empty array (no error leak).
 */
export async function getNotes(entryId: string): Promise<GetNotesResult> {
  if (!entryId || entryId.length > 80) {
    return { error: "Invalid entry." };
  }

  const supabase = createClient();
  if (!supabase) return { error: "Database is not configured." };

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { error: "Please sign in to read notes." };

  const { data: noteRows, error } = await supabase
    .from("little_notes")
    .select("id, entry_id, author_id, content, created_at")
    .eq("entry_id", entryId)
    .order("created_at", { ascending: true });

  if (error) {
    // Table missing = migration not yet applied
    if (error.code === "42P01" || error.code === "PGRST205") {
      return { error: "Little Notes require the little_notes migration to be applied in Supabase." };
    }
    return { error: "Couldn't load notes. Please try again." };
  }

  const rows = noteRows ?? [];

  // Resolve author profiles in a single follow-up query (same pattern as DiaryContext).
  // author_id → auth.users, not profiles, so we can't use a PostgREST join directly.
  const authorIds = Array.from(new Set(rows.map((r) => r.author_id as string)));
  let profileMap = new Map<string, NoteAuthor>();
  if (authorIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, display_name, avatar_key")
      .in("id", authorIds);
    for (const p of profiles ?? []) {
      profileMap.set(p.id as string, {
        id: p.id as string,
        display_name: (p.display_name as string) || "Someone",
        avatar_key: (p.avatar_key as string) || "star",
      });
    }
  }

  const notes: LittleNote[] = rows.map((row) => ({
    id: String(row.id),
    entry_id: String(row.entry_id),
    author_id: String(row.author_id),
    content: String(row.content),
    created_at: String(row.created_at),
    author: profileMap.get(row.author_id as string) ?? null,
  }));

  return { notes };
}

// ── createNote ────────────────────────────────────────────────────────────────

/**
 * Leave a Little Note on a diary entry.
 * Requirements enforced here AND by RLS:
 *   - Caller must be authenticated.
 *   - Caller must currently have read access to the entry.
 *   - Content must be 1–500 non-whitespace characters.
 *   - author_id is ALWAYS set from the session, never from the client payload.
 */
export async function createNote(
  entryId: string,
  content: string,
): Promise<NoteActionResult> {
  // Input validation
  if (!entryId || entryId.length > 80) {
    return { error: "Invalid entry." };
  }
  if (typeof content !== "string") {
    return { error: "Note content is required." };
  }
  const trimmed = content.trim();
  if (trimmed.length === 0) {
    return { error: "Your note can't be empty." };
  }
  if (trimmed.length > MAX_LENGTH) {
    return { error: `Notes must be ${MAX_LENGTH} characters or fewer.` };
  }

  const supabase = createClient();
  if (!supabase) return { error: "Database is not configured." };

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { error: "Please sign in to leave a note." };

  const { error } = await supabase.from("little_notes").insert({
    entry_id: entryId,
    author_id: user.id,   // Always from session — never from client
    content: trimmed,
  });

  if (error) {
    if (error.code === "42P01" || error.code === "PGRST205") {
      return { error: "Little Notes require the little_notes migration to be applied in Supabase." };
    }
    if (error.code === "42501" || error.message?.includes("row-level security")) {
      return { error: "You don't have permission to leave a note on this entry." };
    }
    if (error.code === "23514") {
      // CHECK constraint — empty or too-long content
      return { error: `Notes must be between 1 and ${MAX_LENGTH} characters.` };
    }
    return { error: "Couldn't save your note. Please try again." };
  }

  return { success: true };
}

// ── deleteNote ────────────────────────────────────────────────────────────────

/**
 * Delete a Little Note by ID.
 * RLS enforces that only the note's author or the diary entry owner can delete.
 * The server action validates the note ID format; RLS does the actual permission check.
 */
export async function deleteNote(noteId: string): Promise<NoteActionResult> {
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!noteId || !uuidPattern.test(noteId)) {
    return { error: "Invalid note ID." };
  }

  const supabase = createClient();
  if (!supabase) return { error: "Database is not configured." };

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { error: "Please sign in to delete notes." };

  const { error } = await supabase
    .from("little_notes")
    .delete()
    .eq("id", noteId);

  if (error) {
    if (error.code === "42P01" || error.code === "PGRST205") {
      return { error: "Little Notes migration is not applied." };
    }
    if (error.code === "42501" || error.message?.includes("row-level security")) {
      return { error: "You don't have permission to delete this note." };
    }
    return { error: "Couldn't delete the note. Please try again." };
  }

  return { success: true };
}
