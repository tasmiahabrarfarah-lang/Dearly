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
  upsertEntry,
  deleteEntry,
  DEFAULT_FONT,
  DEFAULT_FONT_SIZE,
  DEFAULT_PAGE_COLOR,
} from "@/lib/diaryStorage";

// ── View states ───────────────────────────────────────────────────────────
export type DiaryView =
  | { type: "list" }
  | { type: "editor"; entryId: string | null }  // null = new entry
  | { type: "reader"; entryId: string };

// ── State ─────────────────────────────────────────────────────────────────
interface DiaryState {
  entries: DiaryEntry[];
  view: DiaryView;
  saveError: string | null;
  isLoaded: boolean;
}

// ── Actions ───────────────────────────────────────────────────────────────
type DiaryAction =
  | { type: "INIT"; entries: DiaryEntry[] }
  | { type: "UPSERT"; entry: DiaryEntry }
  | { type: "DELETE"; id: string }
  | { type: "SET_VIEW"; view: DiaryView }
  | { type: "SET_SAVE_ERROR"; message: string | null };

function diaryReducer(state: DiaryState, action: DiaryAction): DiaryState {
  switch (action.type) {
    case "INIT":
      return { ...state, entries: action.entries, isLoaded: true };
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
  saveEntry: (entry: DiaryEntry) => boolean;
  removeEntry: (id: string) => void;
  createBlankEntry: () => DiaryEntry;
}

const DiaryContext = createContext<DiaryContextValue | null>(null);

export function DiaryProvider({
  children,
  onNewEntrySaved,
}: {
  children: React.ReactNode;
  onNewEntrySaved?: (entryId: string) => void;
}) {
  const [state, dispatch] = useReducer(diaryReducer, {
    entries: [],
    view: { type: "list" },
    saveError: null,
    isLoaded: false,
  });

  // Load from storage on mount
  useEffect(() => {
    const entries = loadEntries();
    // Sort newest first
    entries.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    dispatch({ type: "INIT", entries });
  }, []);

  const openList = useCallback(
    () => dispatch({ type: "SET_VIEW", view: { type: "list" } }),
    []
  );
  const openEditor = useCallback(
    (entryId: string | null) =>
      dispatch({ type: "SET_VIEW", view: { type: "editor", entryId } }),
    []
  );
  const openReader = useCallback(
    (entryId: string) =>
      dispatch({ type: "SET_VIEW", view: { type: "reader", entryId } }),
    []
  );

  const saveEntry = useCallback((entry: DiaryEntry): boolean => {
    // Check if this is a new entry (not yet in the stored list)
    const existingEntries = loadEntries();
    const isNewEntry = !existingEntries.some((e) => e.id === entry.id);

    const ok = upsertEntry(entry);
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
        message: "Couldn't save — your browser storage may be full.",
      });
    }
    return ok;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onNewEntrySaved]);

  const removeEntry = useCallback((id: string) => {
    deleteEntry(id);
    dispatch({ type: "DELETE", id });
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
    };
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
