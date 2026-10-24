"use client";

/**
 * DiaryContext
 * Central state manager for the diary experience.
 * Handles entries, current view, editing state.
 * Storage access happens only on the client.
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
} from "react";
import {
  DiaryEntry,
  generateId,
  loadEntries,
  saveEntries,
  upsertEntry,
  deleteEntry,
  DEFAULT_FONT,
  DEFAULT_FONT_SIZE,
  DEFAULT_PAGE_COLOR,
} from "@/lib/diaryStorage";
import { createClient } from "@/lib/supabase/client";
import type { AvatarKey } from "@/lib/profile";

export type SharedDiaryEntry = DiaryEntry & { ownerId: string; ownerName: string; ownerDearlyId: string; ownerAvatarKey: AvatarKey };

function fromDatabase(row: Record<string, unknown>): DiaryEntry {
  return {
    id: String(row.id), title: String(row.title ?? ""), body: String(row.body ?? ""),
    createdAt: String(row.created_at), updatedAt: String(row.updated_at),
    pageColor: String(row.page_color), fontFamily: String(row.font_family),
    fontSize: Number(row.font_size), audience: "only_me", allowedFriendIds: [], excludedFriendIds: [],
  };
}

function toDatabase(entry: DiaryEntry, ownerId: string) {
  return {
    id: entry.id, owner_id: ownerId, title: entry.title, body: entry.body,
    created_at: entry.createdAt, updated_at: entry.updatedAt, page_color: entry.pageColor,
    font_family: entry.fontFamily, font_size: entry.fontSize,
  };
}

// ── View states ───────────────────────────────────────────────────────────
export type DiaryView =
  | { type: "list" }
  | { type: "editor"; entryId: string | null }  // null = new entry
  | { type: "reader"; entryId: string };

// ── State ─────────────────────────────────────────────────────────────────
interface DiaryState {
  entries: DiaryEntry[];
  sharedEntries: SharedDiaryEntry[];
  view: DiaryView;
  saveError: string | null;
  accessNotice: string | null;
  isLoaded: boolean;
  sharingAvailable: boolean;
  editorDirty: boolean;
  loadError: string | null;
}

// ── Actions ───────────────────────────────────────────────────────────────
type DiaryAction =
  | { type: "INIT"; entries: DiaryEntry[]; loadError?: string | null }
  | { type: "INIT_SHARED"; entries: SharedDiaryEntry[]; sharingAvailable: boolean }
  | { type: "UPSERT"; entry: DiaryEntry }
  | { type: "DELETE"; id: string }
  | { type: "SET_VIEW"; view: DiaryView }
  | { type: "SET_SAVE_ERROR"; message: string | null }
  | { type: "SET_ACCESS_NOTICE"; message: string | null }
  | { type: "SET_EDITOR_DIRTY"; dirty: boolean }
  | { type: "REVOKE_SHARED"; id: string };

function diaryReducer(state: DiaryState, action: DiaryAction): DiaryState {
  switch (action.type) {
    case "INIT":
      return { ...state, entries: action.entries, isLoaded: true, loadError: action.loadError ?? null };
    case "INIT_SHARED":
      return { ...state, sharedEntries: action.entries, sharingAvailable: action.sharingAvailable };
    case "UPSERT": {
      const idx = state.entries.findIndex((e) => e.id === action.entry.id);
      const entries =
        idx >= 0
          ? state.entries.map((e, i) => (i === idx ? action.entry : e))
          : [...state.entries, action.entry];
      return { ...state, entries, saveError: null };
    }
    case "DELETE":
      return {
        ...state,
        entries: state.entries.filter((e) => e.id !== action.id),
      };
    case "SET_VIEW":
      return { ...state, view: action.view };
    case "SET_SAVE_ERROR":
      return { ...state, saveError: action.message };
    case "SET_ACCESS_NOTICE":
      return { ...state, accessNotice: action.message };
    case "SET_EDITOR_DIRTY":
      return { ...state, editorDirty: action.dirty };
    case "REVOKE_SHARED":
      return { ...state, sharedEntries: state.sharedEntries.filter((entry) => entry.id !== action.id) };
    default:
      return state;
  }
}

// ── Context value ─────────────────────────────────────────────────────────
interface DiaryContextValue {
  state: DiaryState;
  // Navigation
  openList: () => void;
  openEditor: (entryId: string | null) => void;
  openReader: (entryId: string) => void;
  // Entry operations
  saveEntry: (entry: DiaryEntry, expectedUpdatedAt?: string) => Promise<boolean>;
  removeEntry: (id: string) => Promise<boolean>;
  createBlankEntry: () => DiaryEntry;
  setEditorDirty: (dirty: boolean) => void;
}

const DiaryContext = createContext<DiaryContextValue | null>(null);

export function DiaryProvider({
  children,
  onNewEntrySaved,
  initialEntryId,
}: {
  children: React.ReactNode;
  onNewEntrySaved?: (entryId: string) => void;
  initialEntryId?: string | null;
}) {
  const [state, dispatch] = useReducer(diaryReducer, {
    entries: [],
    sharedEntries: [],
    view: { type: "list" },
    saveError: null,
    isLoaded: false,
    accessNotice: null,
    sharingAvailable: false,
    editorDirty: false,
    loadError: null,
  });

  useEffect(() => {
    if (state.isLoaded && initialEntryId) {
      dispatch({ type: "SET_VIEW", view: { type: "reader", entryId: initialEntryId } });
    }
  }, [state.isLoaded, initialEntryId]);

  // Load account entries from Supabase when signed in. Import existing local entries
  // once, preserving the current browser diary while moving it behind RLS.
  useEffect(() => {
    let cancelled = false;
    const localEntries = loadEntries();
    let signedInAccount = false;
    let allowLocalFallback = !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    void (async () => {
      try {
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) throw new Error("Supabase is not configured");
        const supabase = createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError) throw authError;
        allowLocalFallback = !user;
        if (!user) throw new Error("No signed-in user");
        signedInAccount = true;
        let importFailed = false;
        if (localEntries.length) {
          // Best-effort import of any locally-stored entries into Supabase.
          // If this fails (e.g. RLS mismatch, entries already exist under a
          // different owner), we log and continue — the canonical copy in
          // Supabase is loaded below and sharingAvailable must not be blocked
          // by an optional migration step.
          const { error: importError } = await supabase.from("diary_entries").upsert(
            localEntries.map((entry) => toDatabase(entry, user.id)),
            { onConflict: "id", ignoreDuplicates: true },
          );
          if (importError) { importFailed = true; console.warn("[Dearly] Local entry import skipped:", importError.message); }
        }
        // Load own entries and outgoing share metadata in parallel.
        // The incoming-shared-entries fetch is done separately so a failure there
        // (e.g. friendships table not yet created) never blocks own-entry loading
        // or the sharingAvailable flag.
        const [{ data: ownRows, error: ownError }, { data: shareRows }] = await Promise.all([
          supabase.from("diary_entries").select("*").eq("owner_id", user.id).order("created_at", { ascending: false }),
          supabase.from("diary_entry_shares").select("entry_id, recipient_id").eq("owner_id", user.id),
        ]);
        if (ownError) throw ownError;

        // Fetch entries shared WITH the current user via the shares table, then
        // resolve the actual entry rows by ID. This avoids a broad .neq() scan
        // that triggers can_read_diary_entry on every row (which would fail if
        // the friendships table doesn't exist yet).
        const incomingShareRows = await supabase
          .from("diary_entry_shares")
          .select("entry_id")
          .eq("recipient_id", user.id);
        const incomingEntryIds = (incomingShareRows.data ?? []).map((r) => r.entry_id as string);
        let sharedRawRows: Record<string, unknown>[] = [];
        if (incomingEntryIds.length) {
          const { data: sharedData } = await supabase
            .from("diary_entries")
            .select("*")
            .in("id", incomingEntryIds)
            .order("created_at", { ascending: false });
          sharedRawRows = (sharedData ?? []) as Record<string, unknown>[];
        }

        // Build a set of entry IDs the owner has shared with at least one friend
        const sharedEntryIds = new Set((shareRows ?? []).map((r) => r.entry_id as string));
        // Once entries are account-backed, remove the origin-wide copy so a later
        // account on this browser cannot accidentally inherit another user's diary.
        // Only do this when the import worked; otherwise the local copy is the only copy.
        if (!importFailed) saveEntries([]);
        const shared = sharedRawRows.map((row) => ({ ...fromDatabase(row), ownerId: String(row.owner_id), ownerName: "A friend", ownerDearlyId: "", ownerAvatarKey: "fox" as AvatarKey }));
        if (shared.length) {
          const ids = Array.from(new Set(shared.map((entry) => entry.ownerId)));
          const { data: profiles } = await supabase.from("profiles").select("id, display_name, dearly_id, avatar_key").in("id", ids);
          for (const entry of shared) {
            const profile = profiles?.find((item) => item.id === entry.ownerId);
            if (profile) { entry.ownerName = profile.display_name || "A friend"; entry.ownerDearlyId = profile.dearly_id || ""; entry.ownerAvatarKey = profile.avatar_key || "fox"; }
          }
        }
        if (cancelled) return;
        // Derive audience from share data: entries with at least one recipient are "selected_friends"
        const ownEntries = (ownRows ?? []).map((row) => {
          const entry = fromDatabase(row);
          if (sharedEntryIds.has(entry.id)) entry.audience = "selected_friends";
          return entry;
        });
        dispatch({ type: "INIT", entries: ownEntries });
        dispatch({ type: "INIT_SHARED", entries: shared, sharingAvailable: true });
      } catch {
        if (cancelled) return;
        // A browser-wide diary is only a valid fallback while signed out or
        // when Supabase is not configured. Never show that cache to a signed-in
        // account after an account-backed load fails.
        if (signedInAccount || !allowLocalFallback) {
          dispatch({ type: "INIT", entries: [], loadError: "Couldn't open your saved diary. Your private entries are safe; check your connection and refresh." });
          dispatch({ type: "INIT_SHARED", entries: [], sharingAvailable: false });
          return;
        }
        localEntries.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        dispatch({ type: "INIT", entries: localEntries });
        dispatch({ type: "INIT_SHARED", entries: [], sharingAvailable: false });
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const openList = useCallback(() => {
    dispatch({ type: "SET_EDITOR_DIRTY", dirty: false });
    dispatch({ type: "SET_VIEW", view: { type: "list" } });
    if (!state.sharingAvailable) return;
    const supabase = createClient();
    void supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      // Fetch incoming shared entries via the shares table (avoids the broad
      // .neq scan that would trigger can_read_diary_entry on every row).
      const { data: incomingShares } = await supabase
        .from("diary_entry_shares")
        .select("entry_id")
        .eq("recipient_id", user.id);
      const entryIds = (incomingShares ?? []).map((r) => r.entry_id as string);
      let refreshed: SharedDiaryEntry[] = [];
      if (entryIds.length) {
        const { data } = await supabase
          .from("diary_entries")
          .select("*")
          .in("id", entryIds)
          .order("created_at", { ascending: false });
        refreshed = (data ?? []).map((row) => ({ ...fromDatabase(row), ownerId: String(row.owner_id), ownerName: "A friend", ownerDearlyId: "", ownerAvatarKey: "fox" as AvatarKey }));
        if (refreshed.length) {
          const ids = Array.from(new Set(refreshed.map((entry) => entry.ownerId)));
          const { data: profiles } = await supabase.from("profiles").select("id, display_name, dearly_id, avatar_key").in("id", ids);
          for (const entry of refreshed) {
            const profile = profiles?.find((item) => item.id === entry.ownerId);
            if (profile) { entry.ownerName = profile.display_name || "A friend"; entry.ownerDearlyId = profile.dearly_id || ""; entry.ownerAvatarKey = profile.avatar_key || "fox"; }
          }
        }
      }
      dispatch({ type: "INIT_SHARED", entries: refreshed, sharingAvailable: true });
    }).catch(() => undefined);
  }, [state.sharingAvailable]);
  const openEditor = useCallback(
    (entryId: string | null) =>
      dispatch({ type: "SET_VIEW", view: { type: "editor", entryId } }),
    []
  );
  const openReader = useCallback((entryId: string) => {
    dispatch({ type: "SET_ACCESS_NOTICE", message: null });
    if (!state.sharedEntries.some((entry) => entry.id === entryId)) {
      dispatch({ type: "SET_VIEW", view: { type: "reader", entryId } });
      return;
    }
    void (async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase.from("diary_entries").select("id").eq("id", entryId).maybeSingle();
        if (error) throw error;
        if (!data) {
          dispatch({ type: "REVOKE_SHARED", id: entryId });
          dispatch({ type: "SET_ACCESS_NOTICE", message: "This entry is no longer shared with you." });
          dispatch({ type: "SET_VIEW", view: { type: "list" } });
          return;
        }
        dispatch({ type: "SET_VIEW", view: { type: "reader", entryId } });
      } catch {
        dispatch({ type: "SET_ACCESS_NOTICE", message: "Couldn't verify access to this entry. Please try again." });
        dispatch({ type: "SET_VIEW", view: { type: "list" } });
      }
    })();
  }, [state.sharedEntries]);

  const saveEntry = useCallback(async (entry: DiaryEntry, expectedUpdatedAt?: string): Promise<boolean> => {
    // Check if this is a new entry (not yet in the stored list)
    const isNewEntry = !state.entries.some((e) => e.id === entry.id);

    let ok = false;
    let authResolved = false;
    let signedIn = false;
    let failureMessage = "Couldn't save this entry. Check your connection and try again.";
    try {
      const supabase = createClient();
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      authResolved = true;
      signedIn = Boolean(user);
      if (!user) {
        ok = upsertEntry(entry);
        if (!ok) failureMessage = "Couldn't save to this browser. Its local storage may be full or unavailable. Sign in on this address to save entries to your account.";
      }
      else {
        // Explicit INSERT for new entries and UPDATE for existing ones (an upsert needs
        // INSERT + UPDATE + SELECT policies to all pass at once).
        let dbError: { code?: string } | null = null;
        if (isNewEntry) {
          ({ error: dbError } = await supabase.from("diary_entries").insert(toDatabase(entry, user.id)));
        } else {
          let updateQuery = supabase
            .from("diary_entries")
            .update({
              title: entry.title,
              body: entry.body,
              updated_at: entry.updatedAt,
              page_color: entry.pageColor,
              font_family: entry.fontFamily,
              font_size: entry.fontSize,
            })
            .eq("id", entry.id)
            .eq("owner_id", user.id);
          if (expectedUpdatedAt) updateQuery = updateQuery.eq("updated_at", expectedUpdatedAt);
          const { data: updated, error: updateError } = await updateQuery.select("id");
          dbError = updateError;
          // An UPDATE that matches zero rows is NOT an error, so it used to report
          // "Saved" while writing nothing (e.g. an entry that only ever reached local
          // storage). If no row was updated, create it instead.
          if (!dbError && (updated?.length ?? 0) === 0) {
            if (expectedUpdatedAt) dbError = { code: "CONFLICT" };
            else ({ error: dbError } = await supabase.from("diary_entries").insert(toDatabase(entry, user.id)));
          }
        }
        if (!dbError) {
          ok = true;
        } else {
          // Keep a local backup so the writing isn't lost (it is imported on the next
          // signed-in load), but do NOT report success: the entry is not in the database,
          // so it can't be shared and other devices can't see it.
          upsertEntry(entry);
          const backup = " A copy is kept in this browser.";
          if (dbError.code === "CONFLICT") {
            failureMessage = "This entry changed elsewhere since you opened it. Your edits are saved as a draft here; reload the latest entry before saving again.";
          } else if (dbError.code === "42P01" || dbError.code === "PGRST205") {
            failureMessage = "The diary database table is missing. Apply the diary sharing migration in Supabase, then try again." + backup;
          } else if (dbError.code === "42501" || dbError.code === "403") {
            failureMessage = "Supabase denied this save. Your sign-in may have expired — try signing out and back in, then retry." + backup;
          } else {
            failureMessage = `Supabase couldn't save this entry${dbError.code ? ` (${dbError.code})` : ""}. Check your connection and sign-in, then retry.` + backup;
          }
        }
      }
    } catch {
      if ((authResolved && !signedIn) || (!authResolved && (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY))) {
        ok = upsertEntry(entry);
        if (!ok) failureMessage = "Couldn't save to this browser. Its local storage may be full or unavailable. Sign in on this address to save entries to your account.";
      } else {
        // Preserve a recovery copy, but don't claim a signed-in save succeeded
        // when the account-backed write could not be confirmed.
        upsertEntry(entry);
      }
    }
    if (ok) {
      dispatch({ type: "UPSERT", entry });
      dispatch({ type: "SET_SAVE_ERROR", message: null });
      // Award growth only for genuinely new entries
      if (isNewEntry && onNewEntrySaved) {
        onNewEntrySaved(entry.id);
      }
    } else {
      dispatch({
        type: "SET_SAVE_ERROR",
        message: failureMessage,
      });
    }
    return ok;
  }, [onNewEntrySaved, state.entries]);

  const removeEntry = useCallback(async (id: string) => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      deleteEntry(id);
      dispatch({ type: "DELETE", id });
      return true;
    }
    try {
      const supabase = createClient();
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) return false;
      if (user) {
        const { data, error } = await supabase.from("diary_entries").delete().eq("id", id).eq("owner_id", user.id).select("id");
        if (error || !data?.length) return false;
      } else deleteEntry(id);
    } catch { return false; }
    deleteEntry(id);
    dispatch({ type: "DELETE", id });
    return true;
  }, []);

  const createBlankEntry = useCallback((): DiaryEntry => {
    const now = new Date().toISOString();
    return {
      id: generateId(),
      title: "",
      body: "",
      createdAt: now,
      updatedAt: now,
      pageColor: DEFAULT_PAGE_COLOR,
      fontFamily: DEFAULT_FONT,
      fontSize: DEFAULT_FONT_SIZE,
      // Privacy: every new entry defaults to "only_me"
      audience: "only_me",
      allowedFriendIds: [],
      excludedFriendIds: [],
    };
  }, []);

  const setEditorDirty = useCallback((dirty: boolean) => {
    dispatch({ type: "SET_EDITOR_DIRTY", dirty });
  }, []);

  return (
    <DiaryContext.Provider
      value={{
        state,
        openList,
        openEditor,
        openReader,
        saveEntry,
        removeEntry,
        createBlankEntry,
        setEditorDirty,
      }}
    >
      {children}
    </DiaryContext.Provider>
  );
}

export function useDiary() {
  const ctx = useContext(DiaryContext);
  if (!ctx) throw new Error("useDiary must be used within DiaryProvider");
  return ctx;
}
