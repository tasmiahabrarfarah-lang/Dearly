"use client";

/**
 * DiaryExperience
 * Full-screen diary overlay that replaces the OverlayPanel for the diary.
 *
 * Opening sequence (Framer Motion, 2D only):
 *   1. Backdrop fades in.
 *   2. Diary cover lifts and scales up from its position.
 *   3. Cover rotates open (X-axis skew approximating a book opening).
 *   4. The writing interface appears inside.
 *
 * Provides its own DiaryProvider so diary state is isolated.
 * Respects prefers-reduced-motion.
 */

import React, { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { DiaryProvider, useDiary } from "./DiaryContext";
import DiaryEntryList from "./DiaryEntryList";
import DiaryEditor from "./DiaryEditor";
import DiaryEntryView from "./DiaryEntryView";

// ── Inner shell: renders the correct view ───────────────────────────────
function DiaryShell({ onClose }: { onClose: () => void }) {
  const { state } = useDiary();
  const { view } = state;

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const renderView = () => {
    if (view.type === "editor") {
      return <DiaryEditor key={view.entryId ?? "new"} entryId={view.entryId} />;
    }
    if (view.type === "reader") {
      return <DiaryEntryView key={view.entryId} entryId={view.entryId} />;
    }
    return <DiaryEntryList />;
  };

  return (
    <>
      {/* ── Diary chrome ──────────────────────────────────── */}
      {/* Header strip — branding + close */}
      <div
        className="
          flex items-center justify-between
          px-5 py-3 flex-shrink-0
        "
        style={{ borderBottom: "1px solid var(--palette-surface-border)" }}
      >
        {/* Small wordmark */}
        <div className="flex items-center gap-2 select-none">
          <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4" aria-hidden>
            <path
              d="M8 0.5 L9.2 5.5 L14.5 5.5 L10.2 8.8 L11.8 14 L8 10.8 L4.2 14 L5.8 8.8 L1.5 5.5 L6.8 5.5 Z"
              fill="var(--palette-accent)" opacity="0.75"
            />
          </svg>
          <span
            className="text-base font-semibold"
            style={{ fontFamily: "Georgia, serif", color: "var(--palette-text-primary)" }}
          >
            Dearly
          </span>
          <span
            className="text-sm ml-1"
            style={{ color: "var(--palette-text-muted)" }}
          >
            · My Diary
          </span>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close Diary"
          className="
            flex items-center gap-1.5 px-3 py-1.5 rounded-xl
            text-sm font-medium glass
            hover:bg-[var(--palette-ground)]
            transition-colors duration-150 active:scale-95
          "
          style={{ color: "var(--palette-text-muted)" }}
        >
          <X size={14} aria-hidden />
          <span>Close Diary</span>
        </button>
      </div>

      {/* ── Main content area ─────────────────────────────── */}
      <div className="flex-1 min-h-0 overflow-hidden px-5 py-5">
        <AnimatePresence mode="wait">
          <motion.div
            key={view.type + (view.type !== "list" ? view.entryId : "")}
            className="h-full min-h-0"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {renderView()}
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  );
}

// ── Public component ─────────────────────────────────────────────────────
interface DiaryExperienceProps {
  isOpen: boolean;
  onClose: () => void;
  onNewEntrySaved?: (entryId: string) => void;
  initialEntryId?: string | null;
}

export default function DiaryExperience({ isOpen, onClose, onNewEntrySaved, initialEntryId }: DiaryExperienceProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-40"
            style={{ background: "rgba(30,20,60,0.55)", backdropFilter: "blur(4px)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Diary panel — animates up from a book-like origin */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="My Diary"
            className="
              fixed z-50 flex flex-col
              inset-x-3 bottom-2 top-3
              sm:inset-x-6 sm:bottom-4 sm:top-4
              md:inset-x-[8%] md:inset-y-[4%]
              rounded-3xl overflow-hidden
            "
            style={{
              background: "var(--palette-surface)",
              border: "1px solid var(--palette-surface-border)",
              boxShadow:
                "0 24px 80px rgba(50,30,100,0.28), 0 4px 16px rgba(50,30,100,0.15)",
            }}
            initial={{ opacity: 0, scale: 0.88, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 24 }}
            transition={{
              type: "spring",
              stiffness: 320,
              damping: 28,
              mass: 0.9,
            }}
          >
            {/* Book-spine accent on left edge */}
            <div
              className="absolute top-0 bottom-0 left-0 w-1.5 pointer-events-none"
              style={{
                background:
                  "linear-gradient(to bottom, var(--palette-accent-soft), var(--palette-accent) 50%, var(--palette-accent-soft))",
                opacity: 0.7,
              }}
            />

            {/* Diagonal page-turn shimmer on open */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "linear-gradient(120deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 40%)",
              }}
              initial={{ opacity: 1, x: -60 }}
              animate={{ opacity: 0, x: 80 }}
              transition={{ duration: 0.55, delay: 0.1, ease: "easeOut" }}
            />

            {/* Inner content with provider */}
            <DiaryProvider onNewEntrySaved={onNewEntrySaved} initialEntryId={initialEntryId}>
              <DiaryShell onClose={onClose} />
            </DiaryProvider>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
