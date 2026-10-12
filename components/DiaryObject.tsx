"use client";

/**
 * DiaryObject
 * The foreground diary — a soft lavender/cream handmade notebook
 * with a ribbon bookmark and a simple star charm.
 * Clicking it opens the diary placeholder panel.
 * Has a gentle hover float animation.
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
      whileHover={{ y: -6, scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 280, damping: 22 }}
      className="
        relative flex flex-col items-center gap-2
        focus-visible:outline-none
        group cursor-pointer
      "
      style={{ background: "transparent", border: "none", padding: 0 }}
    >
      {/* Diary SVG illustration */}
      <div className="relative" style={{ width: 140, height: 110 }}>
        <svg
          viewBox="0 0 140 110"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="cover-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#d8c8f0" />
              <stop offset="100%" stopColor="#c0aae0" />
            </linearGradient>
            <linearGradient id="page-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#fdf8f2" />
              <stop offset="100%" stopColor="#f5eeea" />
            </linearGradient>
            <filter id="diary-shadow">
              <feDropShadow dx="0" dy="6" stdDeviation="8"
                floodColor="#8060c0" floodOpacity="0.25" />
            </filter>
          </defs>

          {/* Drop shadow group */}
          <g filter="url(#diary-shadow)">
            {/* Book pages (right edge visible) */}
            <rect x="18" y="8" width="106" height="90" rx="5"
              fill="url(#page-grad)" />
            {/* Page edge lines */}
            <line x1="118" y1="12" x2="118" y2="94" stroke="#e0d8d0" strokeWidth="0.8" />
            <line x1="121" y1="14" x2="121" y2="92" stroke="#e8e0d8" strokeWidth="0.6" />

            {/* Cover */}
            <rect x="12" y="6" width="106" height="92" rx="6"
              fill="url(#cover-grad)" />

            {/* Cover border */}
            <rect x="16" y="10" width="98" height="84" rx="4"
              fill="none"
              stroke="#b898d8"
              strokeWidth="1.2"
              strokeDasharray="3 3"
            />

            {/* Spine */}
            <rect x="12" y="6" width="12" height="92" rx="4"
              fill="#c0a8e8"
            />
            <line x1="18" y1="6" x2="18" y2="98"
              stroke="#b098d8" strokeWidth="0.8" />

            {/* Ribbon bookmark */}
            <path
              d="M82 6 L82 30 L78 26 L74 30 L74 6"
              fill="#d4a0c0"
            />
            {/* Ribbon end v-notch */}
            <path d="M74 30 L78 26 L82 30" fill="#c090b0" />

            {/* Star charm (centre of cover) */}
            <g transform="translate(65, 53)">
              {/* Outer star */}
              <path
                d="M0,-12 L2.8,-4 L10,-4 L4.2,1 L6.8,9 L0,5 L-6.8,9 L-4.2,1 L-10,-4 L-2.8,-4 Z"
                fill="#c4a8e0"
                stroke="#b090d0"
                strokeWidth="0.8"
              />
              {/* Inner glow dot */}
              <circle r="2.5" fill="#e8d8f8" />
            </g>

            {/* Subtle ruled lines on cover interior */}
            <line x1="30" y1="72" x2="110" y2="72" stroke="#c0a8e0" strokeWidth="0.5" opacity="0.5" />
            <line x1="30" y1="80" x2="110" y2="80" stroke="#c0a8e0" strokeWidth="0.5" opacity="0.5" />
          </g>
        </svg>

        {/* Hover glow ring around diary */}
        <motion.div
          className="absolute inset-0 rounded-xl pointer-events-none"
          style={{
            boxShadow: "0 0 0 0 rgba(155,127,212,0)",
          }}
          animate={{
            boxShadow: [
              "0 0 0 0 rgba(155,127,212,0)",
              "0 0 20px 4px rgba(155,127,212,0.25)",
              "0 0 0 0 rgba(155,127,212,0)",
            ],
          }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        />
      </div>

      {/* Label */}
      <span
        className="
          px-4 py-1.5 rounded-2xl text-sm font-semibold
          glass
          transition-all duration-200
          group-hover:shadow-glow
        "
        style={{
          color: "var(--palette-text-primary)",
          borderColor: "var(--palette-accent-soft)",
        }}
      >
        My Diary
      </span>
    </motion.button>
  );
}
