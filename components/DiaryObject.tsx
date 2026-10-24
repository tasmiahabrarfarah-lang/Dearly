"use client";

/**
 * DiaryObject
 * The keepsake notebook in the foreground of the home scene.
 *
 * The artwork itself lives in <DiaryCover> (shared with the Settings preview and
 * onboarding), so the diary here always matches what you previewed. After a design
 * is saved anywhere in the app, this component updates immediately.
 *
 * Extras: slow idle float, hover lift, and a soft pulsing glow ring.
 */

import React, { useEffect, useId, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { getMyDiaryDesign } from "@/app/diary-design/actions";
import { DEFAULT_DIARY_DESIGN, DIARY_DESIGN_EVENT, validateDiaryDesign, type DiaryDesign } from "@/lib/diaryDesign";
import DiaryCover from "./diary/DiaryCover";

interface DiaryObjectProps {
  onOpen: () => void;
}

export default function DiaryObject({ onOpen }: DiaryObjectProps) {
  const reduceMotion = useReducedMotion();
  const glowId = useId().replace(/[^a-zA-Z0-9]/g, "") + "-glow";
  const [design, setDesign] = useState<DiaryDesign>(DEFAULT_DIARY_DESIGN);

  useEffect(() => {
    let active = true;
    getMyDiaryDesign().then((result) => { if (active && result.design) setDesign(result.design); });
    const onChanged = (event: Event) => {
      const next = validateDiaryDesign((event as CustomEvent<DiaryDesign>).detail ?? {});
      if (next) setDesign(next);
    };
    window.addEventListener(DIARY_DESIGN_EVENT, onChanged);
    return () => { active = false; window.removeEventListener(DIARY_DESIGN_EVENT, onChanged); };
  }, []);

  return (
    <motion.button
      onClick={onOpen}
      aria-label="Open My Diary"
      animate={reduceMotion ? undefined : { y: [0, -5, 0] }}
      transition={reduceMotion ? undefined : { duration: 4, repeat: Infinity, ease: "easeInOut" }}
      whileHover={reduceMotion ? undefined : { y: -10, scale: 1.04 }}
      whileTap={reduceMotion ? undefined : { scale: 0.97 }}
      className="relative flex flex-col items-center gap-3 focus-visible:outline-none group cursor-pointer"
      style={{ background: "transparent", border: "none", padding: 0 }}
    >
      {/* Sized by both width and height of the screen so it never crowds the header or the bottom actions on short windows. */}
      <div className="relative" style={{ width: "clamp(160px, min(22vw, 30vh), 250px)", aspectRatio: "240 / 185" }}>
        <DiaryCover design={design} className="h-full w-full">
          <defs>
            <filter id={glowId} x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {/* Ambient glow ring, tinted to the chosen cover */}
          <motion.rect
            x="14" y="4" width="202" height="168" rx="12"
            fill="none"
            stroke={design.cover_color}
            strokeWidth="3"
            opacity="0"
            filter={`url(#${glowId})`}
            animate={reduceMotion ? undefined : { opacity: [0, 0.55, 0] }}
            transition={reduceMotion ? undefined : { duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
          />
        </DiaryCover>
      </div>

      <motion.span
        className="px-5 py-2 rounded-2xl text-sm font-semibold glass shadow-soft"
        style={{ color: "var(--palette-text-primary)" }}
        whileHover={{ scale: 1.04 }}
      >
        My Diary
      </motion.span>
    </motion.button>
  );
}
