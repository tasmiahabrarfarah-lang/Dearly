"use client";

/**
 * HomeScene
 * The full-page illustrated home screen.
 * Layers:
 *   1. Sky gradient background (CSS)
 *   2. SVG clouds (slow drift)
 *   3. Horizon haze
 *   4. Ground / platform
 *   5. Tree (right-of-centre, behind diary)
 *   6. Magic particles
 *   7. Diary object (foreground centre)
 *   8. UI chrome: ProfileCard, QuickControls, SceneActions
 *   9. Overlay panels
 *  10. NavigatorHint
 */

import React, { useState } from "react";
import { motion } from "framer-motion";

import MagicParticles from "./MagicParticles";
import TreeIllustration from "./TreeIllustration";
import DiaryObject from "./DiaryObject";
import ProfileCard from "./ProfileCard";
import QuickControls, { QuickControlKey } from "./QuickControls";
import SceneActions, { SceneActionKey } from "./SceneActions";
import OverlayPanel from "./OverlayPanel";
import NavigatorHint from "./NavigatorHint";

import {
  DiaryPanelContent,
  FriendsPanelContent,
  NotificationsPanelContent,
  SettingsPanelContent,
  ProfilePanelContent,
  ExplorePanelContent,
  WorldPanelContent,
} from "./PanelContents";

/* ─── Panel state type ──────────────────────────────────────────────── */
type ActivePanel =
  | "diary"
  | "friends"
  | "notifications"
  | "settings"
  | "profile"
  | "explore"
  | "world"
  | null;

const PANEL_TITLES: Record<Exclude<ActivePanel, null>, string> = {
  diary:         "My Diary",
  friends:       "Friends",
  notifications: "Notifications",
  settings:      "Settings",
  profile:       "My Profile",
  explore:       "Explore",
  world:         "My World",
};

/* ─── Sky clouds SVG ────────────────────────────────────────────────── */
function CloudLayer() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 overflow-hidden pointer-events-none"
    >
      <svg
        viewBox="0 0 1200 400"
        preserveAspectRatio="xMidYMin slice"
        className="w-full"
        style={{ position: "absolute", top: 0, left: 0, height: "55%" }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter id="cloud-soft">
            <feGaussianBlur stdDeviation="4" />
          </filter>
        </defs>

        {/* Cloud group A — drifts right slowly */}
        <motion.g
          animate={{ x: [0, 18, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        >
          <ellipse cx="160" cy="80" rx="90" ry="32" fill="white" opacity="0.38" filter="url(#cloud-soft)" />
          <ellipse cx="200" cy="65" rx="60" ry="25" fill="white" opacity="0.35" filter="url(#cloud-soft)" />
          <ellipse cx="130" cy="90" rx="55" ry="22" fill="white" opacity="0.28" filter="url(#cloud-soft)" />
        </motion.g>

        {/* Cloud group B — drifts left slowly */}
        <motion.g
          animate={{ x: [0, -12, 0] }}
          transition={{ duration: 28, repeat: Infinity, ease: "easeInOut", delay: 4 }}
        >
          <ellipse cx="600" cy="55" rx="110" ry="30" fill="white" opacity="0.30" filter="url(#cloud-soft)" />
          <ellipse cx="640" cy="40" rx="70" ry="22" fill="white" opacity="0.28" filter="url(#cloud-soft)" />
          <ellipse cx="570" cy="68" rx="65" ry="20" fill="white" opacity="0.22" filter="url(#cloud-soft)" />
        </motion.g>

        {/* Cloud group C */}
        <motion.g
          animate={{ x: [0, 10, 0] }}
          transition={{ duration: 32, repeat: Infinity, ease: "easeInOut", delay: 8 }}
        >
          <ellipse cx="990" cy="95" rx="100" ry="28" fill="white" opacity="0.32" filter="url(#cloud-soft)" />
          <ellipse cx="1030" cy="78" rx="65" ry="22" fill="white" opacity="0.30" filter="url(#cloud-soft)" />
          <ellipse cx="960" cy="108" rx="70" ry="20" fill="white" opacity="0.24" filter="url(#cloud-soft)" />
        </motion.g>

        {/* Wispy high clouds */}
        <ellipse cx="400" cy="30" rx="130" ry="14" fill="white" opacity="0.16" filter="url(#cloud-soft)" />
        <ellipse cx="800" cy="22" rx="100" ry="12" fill="white" opacity="0.14" filter="url(#cloud-soft)" />
      </svg>
    </div>
  );
}

/* ─── Horizon haze ──────────────────────────────────────────────────── */
function HorizonHaze() {
  return (
    <div
      aria-hidden="true"
      className="absolute pointer-events-none w-full"
      style={{
        bottom: "35%",
        left: 0,
        height: "120px",
        background:
          "linear-gradient(to bottom, transparent, var(--palette-horizon) 60%, transparent)",
        opacity: 0.5,
      }}
    />
  );
}

/* ─── Ground platform ───────────────────────────────────────────────── */
function Ground() {
  return (
    <div
      aria-hidden="true"
      className="absolute bottom-0 left-0 w-full pointer-events-none"
      style={{ height: "38%" }}
    >
      {/* Main ground surface */}
      <div
        className="absolute inset-0 rounded-t-[50%_20%]"
        style={{
          background:
            "linear-gradient(to bottom, var(--palette-ground) 0%, var(--palette-ground-mid) 100%)",
        }}
      />
      {/* Ground highlight ridge */}
      <div
        className="absolute top-0 left-0 w-full"
        style={{
          height: "3px",
          background: "var(--palette-accent-soft)",
          opacity: 0.35,
          borderRadius: "50% 50% 0 0 / 100% 100% 0 0",
        }}
      />
    </div>
  );
}

/* ─── Dearly wordmark ───────────────────────────────────────────────── */
function DearlyWordmark() {
  return (
    <div className="flex items-center gap-2 select-none">
      {/* Simple star mark */}
      <svg
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-5 h-5"
        aria-hidden="true"
      >
        <path
          d="M10 1 L11.5 7 L18 7 L12.8 11 L14.8 17 L10 13.5 L5.2 17 L7.2 11 L2 7 L8.5 7 Z"
          fill="var(--palette-accent)"
          opacity="0.8"
        />
      </svg>
      <span
        className="text-xl font-semibold tracking-tight"
        style={{
          fontFamily: "Georgia, serif",
          color: "var(--palette-text-primary)",
        }}
      >
        Dearly
      </span>
    </div>
  );
}

/* ─── HomeScene ─────────────────────────────────────────────────────── */
export default function HomeScene() {
  const [activePanel, setActivePanel] = useState<ActivePanel>(null);

  const open = (panel: ActivePanel) => setActivePanel(panel);
  const close = () => setActivePanel(null);

  // Scene action handler
  const handleSceneAction = (action: SceneActionKey) => {
    if (action === "diary")   open("diary");
    if (action === "explore") open("explore");
    if (action === "world")   open("world");
  };

  // Quick control handler
  const handleQuickControl = (key: QuickControlKey) => {
    open(key as ActivePanel);
  };

  // Panel body renderer
  const renderPanelContent = () => {
    switch (activePanel) {
      case "diary":         return <DiaryPanelContent />;
      case "friends":       return <FriendsPanelContent />;
      case "notifications": return <NotificationsPanelContent />;
      case "settings":      return <SettingsPanelContent />;
      case "profile":       return <ProfilePanelContent />;
      case "explore":       return <ExplorePanelContent />;
      case "world":         return <WorldPanelContent />;
      default:              return null;
    }
  };

  return (
    <main
      className="relative w-screen h-screen overflow-hidden"
      style={{
        background:
          "linear-gradient(to bottom, var(--palette-sky-top) 0%, var(--palette-sky-mid) 40%, var(--palette-sky-low) 65%, var(--palette-horizon) 100%)",
      }}
    >
      {/* ── Background layers ─────────────────────────── */}
      <CloudLayer />
      <HorizonHaze />

      {/* ── Magic particles (behind ground) ────────────── */}
      <MagicParticles />

      {/* ── Ground ────────────────────────────────────── */}
      <Ground />

      {/* ── Tree (right side, larger viewport offset) ── */}
      <div
        aria-hidden="true"
        className="absolute pointer-events-none"
        style={{
          right: "4%",
          bottom: "28%",
          width: "clamp(160px, 28vw, 340px)",
          height: "clamp(200px, 40vh, 440px)",
        }}
      >
        <TreeIllustration />
      </div>

      {/* ── UI Chrome — top bar ────────────────────────── */}
      <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 pt-4 sm:px-6 sm:pt-5">
        {/* Left: Wordmark + Profile */}
        <div className="flex items-center gap-3 flex-wrap">
          <DearlyWordmark />
          <ProfileCard onOpen={() => open("profile")} />
        </div>

        {/* Right: Quick controls */}
        <QuickControls onOpen={handleQuickControl} />
      </header>

      {/* ── Diary — foreground centre-left ─────────────── */}
      <div
        className="absolute z-10"
        style={{
          left: "50%",
          transform: "translateX(-50%)",
          bottom: "clamp(90px, 20%, 160px)",
        }}
      >
        <DiaryObject onOpen={() => open("diary")} />
      </div>

      {/* ── Bottom scene actions ────────────────────────── */}
      <footer
        className="absolute bottom-0 left-0 right-0 z-20 flex justify-center pb-5 sm:pb-7"
      >
        <SceneActions onAction={handleSceneAction} />
      </footer>

      {/* ── Navigator hint ─────────────────────────────── */}
      <NavigatorHint />

      {/* ── Overlay panels ─────────────────────────────── */}
      <OverlayPanel
        isOpen={activePanel !== null}
        onClose={close}
        title={activePanel ? PANEL_TITLES[activePanel] : ""}
        maxWidth={activePanel === "settings" ? "max-w-sm" : "max-w-md"}
      >
        {renderPanelContent()}
      </OverlayPanel>
    </main>
  );
}
