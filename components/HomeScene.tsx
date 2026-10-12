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
/* Uses shaped cloud paths for recognizable silhouettes instead of blurred blobs */
function CloudLayer() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 overflow-hidden pointer-events-none"
    >
      <svg
        viewBox="0 0 1200 380"
        preserveAspectRatio="xMidYMin slice"
        className="w-full"
        style={{ position: "absolute", top: 0, left: 0, height: "58%" }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Very subtle blur for softness — not heavy smudge */}
          <filter id="cloud-edge" x="-5%" y="-5%" width="110%" height="110%">
            <feGaussianBlur stdDeviation="2.5" />
          </filter>
          <filter id="cloud-edge-sm" x="-5%" y="-5%" width="110%" height="110%">
            <feGaussianBlur stdDeviation="1.5" />
          </filter>

          {/* Warm light glow behind horizon */}
          <radialGradient id="sun-glow" cx="62%" cy="85%" r="40%">
            <stop offset="0%"   stopColor="#fde8c0" stopOpacity="0.6" />
            <stop offset="45%"  stopColor="#f8d8a8" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#f8d8a8" stopOpacity="0" />
          </radialGradient>

          {/* Cloud fill gradients — top lighter, bottom slightly warmer */}
          <linearGradient id="cloud-fill-a" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#ffffff" stopOpacity="0.92" />
            <stop offset="100%" stopColor="#f0e8f8" stopOpacity="0.72" />
          </linearGradient>
          <linearGradient id="cloud-fill-b" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#f8f2fe" stopOpacity="0.88" />
            <stop offset="100%" stopColor="#ece4f8" stopOpacity="0.65" />
          </linearGradient>
          <linearGradient id="cloud-fill-c" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#ffffff"  stopOpacity="0.80" />
            <stop offset="100%" stopColor="#f4edf8" stopOpacity="0.55" />
          </linearGradient>
        </defs>

        {/* ── Warm light source glow near horizon right ── */}
        <ellipse cx="760" cy="340" rx="380" ry="160"
          fill="url(#sun-glow)" />

        {/* ── CLOUD A — upper left, large fluffy ────────── */}
        <motion.g
          animate={{ x: [0, 16, 0] }}
          transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
          filter="url(#cloud-edge)"
        >
          {/* Puff cluster — several overlapping rounded rects/circles for cloud shape */}
          <circle cx="130" cy="88" r="42" fill="url(#cloud-fill-a)" />
          <circle cx="175" cy="75" r="36" fill="url(#cloud-fill-a)" />
          <circle cx="218" cy="85" r="30" fill="url(#cloud-fill-a)" />
          <circle cx="160" cy="100" r="34" fill="url(#cloud-fill-a)" />
          <circle cx="100" cy="100" r="28" fill="url(#cloud-fill-a)" />
          {/* Base fill to merge bottoms */}
          <rect x="95" y="90" width="160" height="30" rx="0" fill="url(#cloud-fill-a)" />
          {/* Bottom shadow */}
          <rect x="95" y="110" width="160" height="10" rx="4" fill="#d8ccee" opacity="0.18" />
        </motion.g>

        {/* ── CLOUD B — upper centre ─────────────────────── */}
        <motion.g
          animate={{ x: [0, -14, 0] }}
          transition={{ duration: 34, repeat: Infinity, ease: "easeInOut", delay: 5 }}
          filter="url(#cloud-edge)"
        >
          <circle cx="560" cy="62" r="35" fill="url(#cloud-fill-b)" />
          <circle cx="600" cy="50" r="30" fill="url(#cloud-fill-b)" />
          <circle cx="638" cy="60" r="26" fill="url(#cloud-fill-b)" />
          <circle cx="580" cy="75" r="28" fill="url(#cloud-fill-b)" />
          <circle cx="535" cy="72" r="24" fill="url(#cloud-fill-b)" />
          <rect x="530" y="68" width="135" height="22" rx="0" fill="url(#cloud-fill-b)" />
          <rect x="530" y="84" width="135" height="8" rx="3" fill="#d0c8ec" opacity="0.15" />
        </motion.g>

        {/* ── CLOUD C — upper right ─────────────────────── */}
        <motion.g
          animate={{ x: [0, 10, 0] }}
          transition={{ duration: 30, repeat: Infinity, ease: "easeInOut", delay: 10 }}
          filter="url(#cloud-edge)"
        >
          <circle cx="960" cy="90" r="38" fill="url(#cloud-fill-c)" />
          <circle cx="1000" cy="75" r="33" fill="url(#cloud-fill-c)" />
          <circle cx="1040" cy="84" r="28" fill="url(#cloud-fill-c)" />
          <circle cx="985" cy="104" r="30" fill="url(#cloud-fill-c)" />
          <circle cx="935" cy="100" r="25" fill="url(#cloud-fill-c)" />
          <rect x="930" y="96" width="148" height="24" rx="0" fill="url(#cloud-fill-c)" />
          <rect x="930" y="114" width="148" height="8" rx="3" fill="#d8ccf0" opacity="0.14" />
        </motion.g>

        {/* ── Wispy thin clouds — high altitude ─────────── */}
        <motion.g
          animate={{ x: [0, 8, 0] }}
          transition={{ duration: 40, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          filter="url(#cloud-edge-sm)"
        >
          <ellipse cx="380" cy="32" rx="100" ry="10" fill="white" opacity="0.28" />
          <ellipse cx="430" cy="26" rx="60" ry="7" fill="white" opacity="0.22" />
        </motion.g>

        <motion.g
          animate={{ x: [0, -6, 0] }}
          transition={{ duration: 44, repeat: Infinity, ease: "easeInOut", delay: 15 }}
          filter="url(#cloud-edge-sm)"
        >
          <ellipse cx="790" cy="28" rx="85" ry="9" fill="white" opacity="0.24" />
          <ellipse cx="740" cy="22" rx="50" ry="6" fill="white" opacity="0.18" />
        </motion.g>

        {/* ── Small accent cloud — left mid ─────────────── */}
        <motion.g
          animate={{ x: [0, 12, 0] }}
          transition={{ duration: 38, repeat: Infinity, ease: "easeInOut", delay: 7 }}
          filter="url(#cloud-edge-sm)"
        >
          <circle cx="310" cy="148" r="22" fill="white" opacity="0.20" />
          <circle cx="335" cy="140" r="18" fill="white" opacity="0.18" />
          <circle cx="358" cy="148" r="15" fill="white" opacity="0.16" />
          <rect x="305" y="148" width="75" height="14" rx="0" fill="white" opacity="0.18" />
        </motion.g>
      </svg>
    </div>
  );
}

/* ─── Horizon haze — stronger and more painterly ───────────────────── */
function HorizonHaze() {
  return (
    <div
      aria-hidden="true"
      className="absolute pointer-events-none w-full"
      style={{ bottom: "30%", left: 0, height: "180px" }}
    >
      <svg
        viewBox="0 0 1200 180"
        preserveAspectRatio="none"
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="haze-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="var(--palette-horizon)" stopOpacity="0" />
            <stop offset="45%"  stopColor="var(--palette-horizon)" stopOpacity="0.55" />
            <stop offset="75%"  stopColor="var(--palette-horizon)" stopOpacity="0.35" />
            <stop offset="100%" stopColor="var(--palette-horizon)" stopOpacity="0" />
          </linearGradient>
          {/* Warm glow accent toward right */}
          <radialGradient id="haze-warm" cx="65%" cy="50%" r="45%">
            <stop offset="0%"   stopColor="#fde8c0" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#fde8c0" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect x="0" y="0" width="1200" height="180" fill="url(#haze-grad)" />
        <rect x="0" y="0" width="1200" height="180" fill="url(#haze-warm)" />
      </svg>
    </div>
  );
}

/* ─── Ground — SVG illustrated surface ─────────────────────────────── */
function Ground() {
  return (
    <div
      aria-hidden="true"
      className="absolute bottom-0 left-0 w-full pointer-events-none"
      style={{ height: "42%" }}
    >
      <svg
        viewBox="0 0 1200 300"
        preserveAspectRatio="none"
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="ground-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="var(--palette-ground)" />
            <stop offset="55%"  stopColor="var(--palette-ground-mid)" />
            <stop offset="100%" stopColor="var(--palette-ground-mid)" />
          </linearGradient>
          {/* Shading on left */}
          <linearGradient id="ground-shade-l" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="#8060a8" stopOpacity="0.12" />
            <stop offset="35%"  stopColor="#8060a8" stopOpacity="0" />
          </linearGradient>
          {/* Warm highlight from right/light source */}
          <linearGradient id="ground-warm" x1="0" y1="0" x2="1" y2="0">
            <stop offset="50%"  stopColor="#fde8c0" stopOpacity="0" />
            <stop offset="100%" stopColor="#fde8c0" stopOpacity="0.18" />
          </linearGradient>
          {/* Top edge glow */}
          <linearGradient id="ground-ridge" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="var(--palette-accent-soft)" stopOpacity="0.55" />
            <stop offset="100%" stopColor="var(--palette-accent-soft)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Main ground — gently curved top edge (elliptical arc) */}
        <path
          d="M0 50 Q300 0 600 20 Q900 40 1200 15 L1200 300 L0 300 Z"
          fill="url(#ground-fill)"
        />

        {/* Left side shadow */}
        <path
          d="M0 50 Q300 0 600 20 Q900 40 1200 15 L1200 300 L0 300 Z"
          fill="url(#ground-shade-l)"
        />

        {/* Right warm highlight */}
        <path
          d="M0 50 Q300 0 600 20 Q900 40 1200 15 L1200 300 L0 300 Z"
          fill="url(#ground-warm)"
        />

        {/* Top edge luminous ridge — the horizon line */}
        <path
          d="M0 50 Q300 0 600 20 Q900 40 1200 15"
          stroke="url(#ground-ridge)"
          strokeWidth="4"
          fill="none"
          opacity="0.7"
        />

        {/* Subtle inner ground shading (depth) */}
        <path
          d="M0 80 Q300 40 600 58 Q900 75 1200 48 L1200 120 L0 150 Z"
          fill="var(--palette-ground-mid)"
          opacity="0.18"
        />
      </svg>
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

      {/* ── Tree (right side) — roots meet the ground ── */}
      <div
        aria-hidden="true"
        className="absolute pointer-events-none"
        style={{
          right: "3%",
          bottom: "30%",
          width: "clamp(200px, 32vw, 400px)",
          height: "clamp(260px, 48vh, 530px)",
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

      {/* ── Diary — prominent foreground centre ─────────── */}
      <div
        className="absolute z-10"
        style={{
          left: "50%",
          transform: "translateX(-60%)",
          bottom: "clamp(75px, 14%, 130px)",
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
