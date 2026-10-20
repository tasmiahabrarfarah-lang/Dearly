"use client";

/**
 * PanelContents — panel bodies for non-diary panels.
 * Friends panel is now fully implemented in components/friends/.
 * Other panels remain as placeholders for future milestones.
 */

import React from "react";
import { Bell, Compass, Sparkles } from "lucide-react";
import { useTheme, PALETTES, PaletteId } from "./ThemeContext";

/* ── Shared helpers ──────────────────────────────────────────────────── */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="text-xs font-semibold uppercase tracking-widest mb-3 mt-5 first:mt-0"
      style={{ color: "var(--palette-text-muted)" }}
    >
      {children}
    </p>
  );
}

function Note({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="text-sm leading-relaxed"
      style={{ color: "var(--palette-text-primary)" }}
    >
      {children}
    </p>
  );
}

function MilestoneChip({ label }: { label: string }) {
  return (
    <span
      className="inline-block text-xs px-2.5 py-1 rounded-full font-medium mt-3"
      style={{
        background: "var(--palette-ground)",
        color: "var(--palette-text-muted)",
      }}
    >
      {label}
    </span>
  );
}


/* ── Friends Panel ───────────────────────────────────────────────────── */
export { default as FriendsPanelContent } from "./friends/FriendsPanelContent";

/* ── Notifications Panel ─────────────────────────────────────────────── */
export function NotificationsPanelContent() {
  return (
    <div className="flex flex-col items-center text-center gap-4 py-2">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center"
        style={{ background: "var(--palette-ground)" }}
      >
        <Bell size={28} style={{ color: "var(--palette-accent)" }} aria-hidden="true" />
      </div>
      <div>
        <h3
          className="text-base font-semibold mb-2"
          style={{ color: "var(--palette-text-primary)" }}
        >
          Notifications
        </h3>
        <Note>
          Gentle, non-intrusive notifications will be added once friends and diary sharing are built. You won&apos;t be overwhelmed — only the moments that matter.
        </Note>
      </div>
      <MilestoneChip label="✦ Coming after friends milestone" />
    </div>
  );
}

/* ── Settings Panel ──────────────────────────────────────────────────── */
export function SettingsPanelContent() {
  const { palette, setPalette, saving, saveError } = useTheme();

  return (
    <div className="flex flex-col gap-5 py-1">
      <SectionLabel>Appearance</SectionLabel>

      <div className="flex flex-col gap-3">
        {PALETTES.map((p) => {
          const active = palette.id === p.id;
          return (
            <button
              key={p.id}
              onClick={() => setPalette(p.id as PaletteId)}
              disabled={saving}
              aria-pressed={active}
              className="
                flex items-center gap-3 w-full text-left
                px-4 py-3 rounded-2xl
                transition-all duration-200
                active:scale-[0.98]
              "
              style={{
                background: active
                  ? "var(--palette-ground)"
                  : "transparent",
                border: `2px solid ${active ? "var(--palette-accent)" : "var(--palette-surface-border)"}`,
                color: "var(--palette-text-primary)",
              }}
            >
              {/* Colour swatch row */}
              <div className="flex gap-1 flex-shrink-0">
                {p.id === "dreamy-lavender"
                  ? ["#c4b5e8", "#ddd0f5", "#f5e8e0"].map((c) => (
                      <div key={c} className="w-4 h-4 rounded-full" style={{ background: c }} />
                    ))
                  : ["#aed6f0", "#c9e8f7", "#fef0d8"].map((c) => (
                      <div key={c} className="w-4 h-4 rounded-full" style={{ background: c }} />
                    ))}
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold leading-tight">{p.label}</p>
                <p
                  className="text-xs leading-tight mt-0.5"
                  style={{ color: "var(--palette-text-muted)" }}
                >
                  {p.description}
                </p>
              </div>

              {active && (
                <span
                  className="text-xs font-semibold flex-shrink-0"
                  style={{ color: "var(--palette-accent)" }}
                >
                  Active
                </span>
              )}
            </button>
          );
        })}
      </div>

      {saving && <p role="status" className="text-xs" style={{ color: "var(--palette-text-muted)" }}>Saving your theme…</p>}
      {saveError && <p role="alert" className="text-xs" style={{ color: "#b4233d" }}>{saveError}</p>}

      <SectionLabel>More settings</SectionLabel>
      <Note>
        Account, privacy, language, and notification settings will be added in future milestones.
      </Note>
      <MilestoneChip label="✦ More options coming later" />
    </div>
  );
}

/* ── Profile Panel ───────────────────────────────────────────────────── */
export { default as ProfilePanelContent } from "./profile/ProfileEditor";

/* ── Explore Panel ───────────────────────────────────────────────────── */
export function ExplorePanelContent() {
  return (
    <div className="flex flex-col items-center text-center gap-4 py-2">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center"
        style={{ background: "var(--palette-ground)" }}
      >
        <Compass size={28} style={{ color: "var(--palette-accent)" }} aria-hidden="true" />
      </div>
      <div>
        <h3
          className="text-base font-semibold mb-2"
          style={{ color: "var(--palette-text-primary)" }}
        >
          Discover Something New
        </h3>
        <Note>
          Explore will let you wander through small discoveries, gentle prompts, and perhaps a little magic — all at your own pace. This feature arrives in a later milestone.
        </Note>
      </div>
      <MilestoneChip label="✦ Coming in a later milestone" />
    </div>
  );
}

/* ── My World Panel ──────────────────────────────────────────────────── */
export function WorldPanelContent() {
  return (
    <div className="flex flex-col items-center text-center gap-4 py-2">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center"
        style={{ background: "var(--palette-ground)" }}
      >
        <Sparkles size={28} style={{ color: "var(--palette-accent)" }} aria-hidden="true" />
      </div>
      <div>
        <h3
          className="text-base font-semibold mb-2"
          style={{ color: "var(--palette-text-primary)" }}
        >
          My World
        </h3>
        <Note>
          World customisation — choosing keepsakes, moving objects, and making this space truly yours — will arrive in a later milestone. For now, enjoy the calm of this beginning.
        </Note>
      </div>
      <MilestoneChip label="✦ World customisation coming later" />
    </div>
  );
}
