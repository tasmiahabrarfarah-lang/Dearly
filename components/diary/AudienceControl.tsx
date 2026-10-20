"use client";

/**
 * AudienceControl
 * Privacy picker for diary entries. Renders a labelled dropdown trigger
 * that opens an inline selector with all four audience options.
 *
 * Only "Only Me" has full backend enforcement in Diary Privacy v1.0.
 * Friend-based options show a "Friends milestone" note because the
 * friend system and Supabase diary migration are not yet complete.
 *
 * Design principles:
 * - Fits inside DiaryCustomizationSidebar without obscuring the writing area.
 * - Uses the existing Dearly palette variables — no new colours.
 * - Accessible: keyboard-navigable, aria-expanded, aria-label on each option.
 * - Works in both desktop sidebar (compact=false) and mobile strip (compact=true).
 */

import React, { useRef, useState, useEffect } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import {
  DiaryAudience,
  AUDIENCE_OPTIONS,
  AudienceOption,
} from "@/lib/diaryStorage";

interface Props {
  audience: DiaryAudience;
  onChange: (value: DiaryAudience) => void;
}

// ── Small badge used on entry list cards and viewer ──────────────────────
export function AudienceBadge({ audience }: { audience: DiaryAudience }) {
  const opt = AUDIENCE_OPTIONS.find((o) => o.value === audience);
  if (!opt) return null;
  return (
    <span
      className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full"
      style={{
        background: "var(--palette-ground)",
        color: "var(--palette-text-muted)",
      }}
      title={opt.description}
      aria-label={`Audience: ${opt.label}`}
    >
      <span aria-hidden="true">{opt.icon}</span>
      <span>{opt.label}</span>
    </span>
  );
}

// ── Main control ──────────────────────────────────────────────────────────
export default function AudienceControl({ audience, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const current: AudienceOption =
    AUDIENCE_OPTIONS.find((o) => o.value === audience) ?? AUDIENCE_OPTIONS[0];

  // Close when clicking outside
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open]);

  return (
    <div ref={containerRef} className="flex flex-col gap-2">
      {/* Section label */}
      <p
        className="text-xs font-semibold uppercase tracking-wider"
        style={{ color: "var(--palette-text-muted)" }}
      >
        Who can read this?
      </p>

      {/* Trigger button */}
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Audience: ${current.label}. Tap to change.`}
        onClick={() => setOpen((v) => !v)}
        className="
          w-full flex items-center justify-between gap-2
          px-3 py-2 rounded-xl text-sm font-medium
          transition-all duration-150 active:scale-[0.98]
          focus-visible:outline-none focus-visible:ring-2
        "
        style={{
          background: "var(--palette-ground)",
          border: "1.5px solid var(--palette-accent)",
          color: "var(--palette-text-primary)",
        }}
      >
        <span className="flex items-center gap-2 min-w-0">
          <span aria-hidden="true">{current.icon}</span>
          <span className="truncate">{current.label}</span>
        </span>
        {open ? (
          <ChevronUp size={14} aria-hidden className="flex-shrink-0" />
        ) : (
          <ChevronDown size={14} aria-hidden className="flex-shrink-0" />
        )}
      </button>

      {/* Dropdown options */}
      {open && (
        <ul
          role="listbox"
          aria-label="Audience options"
          className="flex flex-col gap-1 rounded-2xl overflow-hidden"
          style={{
            border: "1px solid var(--palette-surface-border)",
            background: "var(--palette-surface)",
            boxShadow: "0 4px 20px rgba(80,50,140,0.12)",
          }}
        >
          {AUDIENCE_OPTIONS.map((opt) => {
            const isSelected = opt.value === audience;
            return (
              <li key={opt.value} role="option" aria-selected={isSelected}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  className="
                    w-full text-left px-3 py-2.5 flex flex-col gap-0.5
                    transition-colors duration-100
                    focus-visible:outline-none focus-visible:ring-2
                    active:scale-[0.99]
                  "
                  style={{
                    background: isSelected
                      ? "var(--palette-ground)"
                      : "transparent",
                    color: "var(--palette-text-primary)",
                  }}
                  aria-label={`${opt.label}: ${opt.description}${opt.requiresFriendSystem ? " (requires friends milestone)" : ""}`}
                >
                  {/* Option header row */}
                  <span className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-2 text-sm font-medium">
                      <span aria-hidden="true">{opt.icon}</span>
                      <span>{opt.label}</span>
                    </span>
                    {isSelected && (
                      <span
                        className="text-xs font-semibold flex-shrink-0"
                        style={{ color: "var(--palette-accent)" }}
                        aria-hidden="true"
                      >
                        ✓
                      </span>
                    )}
                  </span>

                  {/* Description */}
                  <span
                    className="text-xs leading-snug pl-6"
                    style={{ color: "var(--palette-text-muted)" }}
                  >
                    {opt.description}
                  </span>

                  {/* Friend-system note */}
                  {opt.requiresFriendSystem && (
                    <span
                      className="text-xs pl-6 mt-0.5"
                      style={{ color: "var(--palette-text-muted)", opacity: 0.75 }}
                    >
                      ✦ Requires the friends milestone
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {/* Inline note for friend-based audiences */}
      {current.requiresFriendSystem && (
        <p
          className="text-xs leading-snug px-1"
          style={{ color: "var(--palette-text-muted)", opacity: 0.8 }}
          role="note"
        >
          Friend sharing will become active once the friends milestone is complete.
        </p>
      )}
    </div>
  );
}
