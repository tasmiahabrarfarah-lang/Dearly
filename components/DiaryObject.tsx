"use client";

/**
 * DiaryObject — Revised
 * A softly illustrated keepsake notebook in the foreground.
 * Much larger than the previous version; drawn with a slight
 * 3/4 perspective feel (still 2D front-facing) to read as a
 * physical object resting on the ground.
 *
 * Features:
 *  - Wider, more notebook-proportioned silhouette
 *  - Visible spine with stitching detail
 *  - Paged right-edge with multiple page lines
 *  - Soft lavender/cream cover with gradient depth
 *  - Dashed inner border frame
 *  - Ribbon bookmark with realistic tail
 *  - Small four-petal flower charm (not a star polygon)
 *  - Gentle drop shadow
 *  - Slow floating idle animation + hover lift
 *  - Pulsing magical glow ring
 */

import React from "react";
import { motion } from "framer-motion";

interface DiaryObjectProps {
  onOpen: () => void;
}

export default function DiaryObject({ onOpen }: DiaryObjectProps) {
  return (
    <motion.button
      onClick={onOpen}
      aria-label="Open My Diary"
      // Idle float
      animate={{ y: [0, -5, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      whileHover={{ y: -10, scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
      className="
        relative flex flex-col items-center gap-3
        focus-visible:outline-none
        group cursor-pointer
      "
      style={{ background: "transparent", border: "none", padding: 0 }}
    >
      {/* ── Diary SVG ───────────────────────────────────────── */}
      <div
        className="relative"
        style={{ width: "clamp(180px, 22vw, 240px)", height: "clamp(140px, 17vw, 185px)" }}
      >
        <svg
          viewBox="0 0 240 185"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
          aria-hidden="true"
          overflow="visible"
        >
          <defs>
            {/* Cover gradient — top-lit */}
            <linearGradient id="diary-cover" x1="0" y1="0" x2="0.3" y2="1">
              <stop offset="0%"   stopColor="#e0cef8" />
              <stop offset="45%"  stopColor="#cebbe8" />
              <stop offset="100%" stopColor="#b8a2d8" />
            </linearGradient>

            {/* Cover highlight */}
            <linearGradient id="diary-cover-hi" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#f0e4ff" stopOpacity="0.65" />
              <stop offset="100%" stopColor="#f0e4ff" stopOpacity="0" />
            </linearGradient>

            {/* Pages gradient */}
            <linearGradient id="diary-pages" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%"   stopColor="#fdf6ef" />
              <stop offset="100%" stopColor="#ede4db" />
            </linearGradient>

            {/* Spine gradient */}
            <linearGradient id="diary-spine" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%"   stopColor="#a088c8" />
              <stop offset="60%"  stopColor="#c4aee0" />
              <stop offset="100%" stopColor="#9878c0" />
            </linearGradient>

            {/* Drop shadow */}
            <filter id="diary-drop" x="-15%" y="-10%" width="130%" height="140%">
              <feDropShadow dx="2" dy="10" stdDeviation="10"
                floodColor="#5830a0" floodOpacity="0.22" />
            </filter>

            {/* Glow filter */}
            <filter id="diary-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* ── GROUP with drop shadow ─────────────────── */}
          <g filter="url(#diary-drop)">

            {/* PAGE STACK — right side, visible underneath cover */}
            {/* Multiple thin slices suggest paper thickness */}
            <rect x="34" y="14" width="186" height="152" rx="6" fill="#f8f0e8" />
            <rect x="34" y="14" width="184" height="152" rx="5" fill="#f4eae0" />
            {/* Individual page lines on right edge */}
            {[198, 202, 206, 210, 214].map((x, i) => (
              <line key={i}
                x1={x} y1={18 + i * 0.5}
                x2={x} y2={162 - i * 0.5}
                stroke="#e0d5c5" strokeWidth="0.7" opacity={0.9 - i * 0.12}
              />
            ))}

            {/* COVER — slightly inset from page edges */}
            <rect x="22" y="10" width="186" height="156" rx="8"
              fill="url(#diary-cover)" />

            {/* Cover highlight band (top-lit effect) */}
            <rect x="22" y="10" width="186" height="60" rx="8"
              fill="url(#diary-cover-hi)" />

            {/* Cover inner frame — dashed border */}
            <rect x="30" y="17" width="170" height="142" rx="5"
              fill="none"
              stroke="#c4a8e8"
              strokeWidth="1.2"
              strokeDasharray="4 3.5"
              opacity="0.7"
            />

            {/* SPINE */}
            <rect x="22" y="10" width="18" height="156" rx="6"
              fill="url(#diary-spine)" />

            {/* Spine stitching dots */}
            {[30, 50, 70, 90, 110, 130, 150].map((y, i) => (
              <circle key={i} cx="31" cy={y} r="1.2" fill="#9070b8" opacity="0.55" />
            ))}

            {/* Spine center line */}
            <line x1="31" y1="10" x2="31" y2="166"
              stroke="#a080c8" strokeWidth="0.6" opacity="0.4" />

            {/* ── RIBBON BOOKMARK ─────────────────────── */}
            {/* Ribbon shaft, hanging from top */}
            <path
              d="M148 10 L148 68 L143 62 L138 68 L138 10 Z"
              fill="#d89ab8"
            />
            {/* Ribbon v-cut tail */}
            <path d="M138 68 L143 62 L148 68" fill="#c488a8" />
            {/* Ribbon highlight */}
            <rect x="139" y="10" width="3" height="50" rx="1"
              fill="#e8b0cc" opacity="0.45" />

            {/* ── COVER DECORATION — four-petal flower ─── */}
            <g transform="translate(115, 88)">
              {/* Petals — four soft rounded petals */}
              {[0, 90, 180, 270].map((deg, i) => (
                <ellipse
                  key={i}
                  cx="0" cy="-13"
                  rx="6" ry="10"
                  fill={i % 2 === 0 ? "#c8a8e8" : "#b898d8"}
                  opacity="0.85"
                  transform={`rotate(${deg})`}
                />
              ))}
              {/* Flower center */}
              <circle r="5.5" fill="#e8d8f8" />
              <circle r="2.8" fill="#d4b8f0" />
              <circle r="1.2" cx="-0.8" cy="-0.8" fill="#f0e8fc" opacity="0.8" />
            </g>

            {/* ── SUBTLE RULED LINES on cover ─────────── */}
            {[112, 122, 132].map((y, i) => (
              <line key={i}
                x1="48" y1={y}
                x2="198" y2={y}
                stroke="#c0a8de" strokeWidth="0.5" opacity={0.3 - i * 0.05}
              />
            ))}

            {/* ── SMALL CORNER DETAILS ─────────────────── */}
            {/* Top-right corner flourish */}
            <path d="M192 18 C196 18 202 22 202 26" stroke="#c4a8e0" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.5" />
            {/* Bottom-right corner flourish */}
            <path d="M192 158 C196 158 202 154 202 150" stroke="#c4a8e0" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.5" />
          </g>

          {/* ── MAGICAL GLOW RING (ambient, pulsing) ──── */}
          <motion.rect
            x="14" y="4" width="202" height="168" rx="12"
            fill="none"
            stroke="#b090e0"
            strokeWidth="3"
            opacity="0"
            filter="url(#diary-glow)"
            animate={{ opacity: [0, 0.45, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
          />
        </svg>
      </div>

      {/* ── Label pill ──────────────────────────────────────── */}
      <motion.span
        className="
          px-5 py-2 rounded-2xl text-sm font-semibold
          glass shadow-soft
        "
        style={{ color: "var(--palette-text-primary)" }}
        whileHover={{ scale: 1.04 }}
      >
        My Diary
      </motion.span>
    </motion.button>
  );
}
