"use client";

/**
 * PanelContents — placeholder panel bodies for non-diary panels.
 * The diary is fully implemented in components/diary/.
 */

import React from "react";
import { Users, Bell, Compass, Sparkles, User } from "lucide-react";
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
export function FriendsPanelContent() {
  return (
    <div className="flex flex-col items-center text-center gap-4 py-2">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center"
        style={{ background: "var(--palette-ground)" }}
      >
        <Users size={28} style={{ color: "var(--palette-accent)" }} aria-hidden="true" />
      </div>
      <div>
        <h3
          className="text-base font-semibold mb-2"
          style={{ color: "var(--palette-text-primary)" }}
        >
          Friends & Connections
        </h3>
        <Note>
          Friend search, requests, and visiting each other&apos;s little worlds will be built in a later milestone. For now, your world is peacefully just yours.
        </Note>
      </div>
      <MilestoneChip label="✦ Coming in a later milestone" />
    </div>
  );
}

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
  const { palette, setPalette } = useTheme();

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

      <SectionLabel>More settings</SectionLabel>
      <Note>
        Account, privacy, language, and notification settings will be added in future milestones.
      </Note>
      <MilestoneChip label="✦ More options coming later" />
    </div>
  );
}

/* ── Profile Panel ───────────────────────────────────────────────────── */
export function ProfilePanelContent() {
  return (
    <div className="flex flex-col gap-5 py-1">
      <div className="flex items-center gap-4">
        {/* Large avatar */}
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{ background: "var(--palette-ground)" }}
        >
          <User size={32} style={{ color: "var(--palette-accent)" }} aria-hidden="true" />
        </div>
        <div>
          <p
            className="text-base font-semibold"
            style={{ color: "var(--palette-text-primary)" }}
          >
            Little Wanderer
          </p>
          <p
            className="text-xs mt-1"
            style={{ color: "var(--palette-text-muted)" }}
          >
            Joined Dearly · Milestone 1 Preview
          </p>
        </div>
      </div>

      <SectionLabel>About</SectionLabel>
      <Note>
        A quiet soul who finds magic in small, everyday moments. Loves tea, soft light, and the feeling of a fresh page.
      </Note>

      <SectionLabel>Profile features</SectionLabel>
      <Note>
        A full profile with a bio, customisable avatar, and journal overview will be built in a future milestone.
      </Note>
      <MilestoneChip label="✦ Profile editing coming later" />
    </div>
  );
}

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
