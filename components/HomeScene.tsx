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
import Image from "next/image";

import MagicParticles from "./MagicParticles";
import DiaryObject from "./DiaryObject";
import ProfileCard from "./ProfileCard";
import QuickControls, { QuickControlKey } from "./QuickControls";
import SceneActions, { SceneActionKey } from "./SceneActions";
import OverlayPanel from "./OverlayPanel";
import NavigatorHint from "./NavigatorHint";

import DiaryExperience from "./diary/DiaryExperience";

import { TreeProvider, useTree } from "./tree/TreeContext";
import TreeStageIllustration from "./tree/TreeStageIllustration";
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

  // Diary has its own full-screen experience
  const [diaryOpen, setDiaryOpen] = useState(false);

  // All other panels stay in OverlayPanel
  const [activePanel, setActivePanel] = useState<Exclude<ActivePanel, "diary">>(null);

  const openDiary = () => setDiaryOpen(true);
  const closeDiary = () => setDiaryOpen(false);

  const open = (panel: Exclude<ActivePanel, "diary">) => setActivePanel(panel);
  const close = () => setActivePanel(null);

  const handleSceneAction = (action: SceneActionKey) => {
    if (action === "diary")   openDiary();
    if (action === "explore") open("explore");
    if (action === "world")   open("world");
  };

  const handleQuickControl = (key: QuickControlKey) => {
    open(key as Exclude<ActivePanel, "diary">);
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
          src="/assets/scenery/home-background.webp"
          alt=""
          fill
          priority
          quality={95}
          style={{
            objectFit: "cover",
            objectPosition: "center 38%",
          }}
        />
        {/* Subtle bottom vignette — lifts foreground elements without washing out the sky */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgba(60,30,80,0.35) 0%, rgba(60,30,80,0.10) 28%, transparent 55%)",
          }}
        />
      </div>

      {/* ── Magic particles (float above background) ────── */}
      <MagicParticles />

      {/* ── Tree (right side) — stage-aware illustration ── */}
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
        {/* Show tree only once treeType is loaded+selected; fallback to seed placeholder */}
        {isLoaded && treeState.treeType ? (
          <TreeStageIllustration
            treeType={treeState.treeType}
            stage={treeState.stage}
          />
        ) : isLoaded ? (
          /* No tree selected yet — show a magical seed glow placeholder */
          <div className="w-full h-full flex items-end justify-center pb-4">
            <motion.div
              className="w-12 h-12 rounded-full"
              style={{ background: "radial-gradient(circle, #d0b8f8 0%, #a088d0 60%, transparent 100%)" }}
              animate={{ opacity: [0.4, 0.8, 0.4], scale: [0.9, 1.1, 0.9] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
        ) : null}
      </div>

      {/* ── UI Chrome — top bar ────────────────────────── */}
      <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 pt-4 sm:px-6 sm:pt-5">
        <div className="flex items-center gap-3 flex-wrap">
          <DearlyWordmark />
          <ProfileCard onOpen={() => open("profile")} />
        </div>
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
