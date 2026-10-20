"use client";

/**
 * HomeScene
 * The full-page illustrated home screen.
 * Layers:
 *   1. Background artwork (home-background.webp) — z-0
 *   2. Foreground meadow overlay (foreground-meadow.webp) — z-1, transparent centre
 *   3. Magic particles — z-2
 *   4. Diary object (foreground centre) — z-10
 *   5. UI chrome: header, footer — z-20
 *   6. Overlay panels, diary experience — z-40+
 *   8. NavigatorHint
 */

import React, { useState } from "react";
import Image from "next/image";
import { signOut as signOutAction } from "@/app/auth/actions";

import MagicParticles from "./MagicParticles";
import DiaryObject from "./DiaryObject";
import ProfileCard from "./ProfileCard";
import QuickControls, { QuickControlKey } from "./QuickControls";
import SceneActions, { SceneActionKey } from "./SceneActions";
import OverlayPanel from "./OverlayPanel";
import NavigatorHint from "./NavigatorHint";

import DiaryExperience from "./diary/DiaryExperience";
import { useTheme } from "./ThemeContext";

import { TreeProvider, useTree } from "./tree/TreeContext";
import SeedSelectionModal from "./tree/SeedSelectionModal";

import {
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

/* ─── HomeSceneInner (consumes TreeContext) ─────────────────────────── */
function HomeSceneInner() {
  const { treeState, isLoaded, awardGrowth } = useTree();
  const { palette } = useTheme();

  // Diary has its own full-screen experience
  const [diaryOpen, setDiaryOpen] = useState(false);

  // All other panels stay in OverlayPanel
  const [activePanel, setActivePanel] = useState<Exclude<ActivePanel, "diary">>(null);
  const [panelAnchor, setPanelAnchor] = useState<DOMRect | null>(null);

  const openDiary = () => setDiaryOpen(true);
  const closeDiary = () => setDiaryOpen(false);

  const open = (panel: Exclude<ActivePanel, "diary">, anchor: DOMRect) => {
    setPanelAnchor(anchor);
    setActivePanel(panel);
  };
  const close = () => setActivePanel(null);

  const handleSceneAction = (action: SceneActionKey, anchor: DOMRect) => {
    if (action === "diary")   openDiary();
    if (action === "explore") open("explore", anchor);
    if (action === "world")   open("world", anchor);
  };

  const handleQuickControl = (key: QuickControlKey, anchor: DOMRect) => {
    open(key as Exclude<ActivePanel, "diary">, anchor);
  };

  const renderPanelContent = () => {
    switch (activePanel) {
      case "friends":       return <FriendsPanelContent />;
      case "notifications": return <NotificationsPanelContent />;
      case "settings":      return <SettingsPanelContent />;
      case "profile":       return <ProfilePanelContent />;
      case "explore":       return <ExplorePanelContent />;
      case "world":         return <WorldPanelContent />;
      default:              return null;
    }
  };

  const panelTitles: Record<Exclude<ActivePanel, "diary" | null>, string> = {
    friends:       "Friends",
    notifications: "Notifications",
    settings:      "Settings",
    profile:       "My Profile",
    explore:       "Explore",
    world:         "My World",
  };

  return (
    <main
      className="relative w-screen h-screen overflow-hidden"
    >
      {/* ── Background artwork ──────────────────────────── */}
      <div
        aria-hidden="true"
        className="absolute inset-0 z-0 pointer-events-none"
      >
        <Image
          src={palette.background}
          alt=""
          fill
          priority
          quality={95}
          style={{
            objectFit: "cover",
            objectPosition: palette.id === "morning-sky" ? "center 50%" : "center 38%",
          }}
        />
        {/* Subtle bottom vignette — lifts foreground elements without washing out the sky */}
        {palette.id === "dreamy-lavender" && (
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to top, rgba(60,30,80,0.35) 0%, rgba(60,30,80,0.10) 28%, transparent 55%)",
            }}
          />
        )}
      </div>

      {/* ── Foreground meadow — flowers, grass, rocks at bottom edge ── */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 pointer-events-none"
        style={{ zIndex: 1 }}
      >
        <Image
          src={palette.foreground}
          alt=""
          fill={false}
          width={palette.id === "morning-sky" ? 1870 : 1920}
          height={palette.id === "morning-sky" ? 841 : 540}
          priority
          quality={90}
          style={{
            width: "100%",
            height: "auto",
            objectFit: "contain",
            objectPosition: "bottom center",
            display: "block",
          }}
        />
      </div>

      {/* ── Magic particles (float above background) ────── */}
      <MagicParticles />

      {/* ── UI Chrome — top bar ────────────────────────── */}
      <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 pt-4 sm:px-6 sm:pt-5">
        <div className="flex items-center gap-3 flex-wrap">
          <DearlyWordmark />
          <ProfileCard onOpen={(anchor) => open("profile", anchor)} />
        </div>
        <div className="flex items-center gap-2">
          <QuickControls onOpen={handleQuickControl} />
          {/* Sign-out — small, discreet; uses server action via form */}
          <form action={signOutAction}>
            <button
              type="submit"
              title="Sign out"
              aria-label="Sign out of Dearly"
              className="
                flex items-center justify-center w-8 h-8 rounded-xl
                opacity-50 hover:opacity-80 transition-opacity
                focus-visible:outline-none focus-visible:ring-2
              "
              style={{ color: "var(--palette-text-primary)" }}
            >
              <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4" aria-hidden="true">
                <path d="M13 3h4a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1h-4M9 14l4-4-4-4M13 10H3"
                  stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </form>
        </div>
      </header>


      {/* ── Diary — prominent foreground centre ─────────── */}
      <div
        className="absolute z-10"
        style={{
          left: "50%",
          transform: "translateX(-50%)",
          bottom: "clamp(75px, 14%, 130px)",
        }}
      >
        <DiaryObject onOpen={openDiary} />
      </div>

      {/* ── Bottom scene actions ────────────────────────── */}
      <footer className="absolute bottom-0 left-0 right-0 z-20 flex justify-center pb-5 sm:pb-7">
        <SceneActions onAction={handleSceneAction} />
      </footer>

      {/* ── Navigator hint ─────────────────────────────── */}
      <NavigatorHint />

      {/* ── Overlay panels (non-diary) ──────────────────── */}
      <OverlayPanel
        isOpen={activePanel !== null}
        onClose={close}
        title={activePanel ? panelTitles[activePanel as Exclude<ActivePanel, "diary" | null>] : ""}
        maxWidth={activePanel === "settings" ? "max-w-sm" : "max-w-md"}
        anchorRect={panelAnchor}
      >
        {renderPanelContent()}
      </OverlayPanel>

      {/* ── Diary full-screen experience ────────────────── */}
      <DiaryExperience isOpen={diaryOpen} onClose={closeDiary} onNewEntrySaved={awardGrowth} />

      {/* ── Seed selection modal (only when no tree chosen yet) ── */}
      {isLoaded && !treeState.treeType && <SeedSelectionModal />}
    </main>
  );
}

/* ─── HomeScene — wraps inner scene in TreeProvider ─────────────────── */
export default function HomeScene() {
  return (
    <TreeProvider>
      <HomeSceneInner />
    </TreeProvider>
  );
}
