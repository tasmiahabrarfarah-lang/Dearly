"use client";

/**
 * NavigatorHint
 * A small, dismissible first-visit guide shown as a softly glowing orb
 * companion with a speech bubble.
 * Dismissal is persisted in localStorage.
 */

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

const STORAGE_KEY = "dearly-navigator-dismissed";

// Tiny spirit-orb SVG
function OrbIcon() {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-10 h-10"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="orb-grad" cx="40%" cy="35%" r="60%">
          <stop offset="0%"   stopColor="#e8dff8" />
          <stop offset="70%"  stopColor="#b090d8" />
          <stop offset="100%" stopColor="#8060c0" stopOpacity="0.8" />
        </radialGradient>
        <filter id="orb-glow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <circle cx="20" cy="20" r="18" fill="url(#orb-grad)" filter="url(#orb-glow)" />
      {/* Eyes */}
      <ellipse cx="15" cy="18" rx="2" ry="2.4" fill="#2a1d50" />
      <ellipse cx="25" cy="18" rx="2" ry="2.4" fill="#2a1d50" />
      <circle cx="15.8" cy="16.8" r="0.8" fill="white" />
      <circle cx="25.8" cy="16.8" r="0.8" fill="white" />
      {/* Smile */}
      <path d="M15 23 Q20 27 25 23" stroke="#3a2060" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      {/* Tiny star */}
      <path d="M20,8 L20.8,10.5 L23.5,10.5 L21.3,12 L22.1,14.5 L20,13 L17.9,14.5 L18.7,12 L16.5,10.5 L19.2,10.5 Z"
        fill="#e8d070" opacity="0.85" />
    </svg>
  );
}

export default function NavigatorHint() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (!dismissed) setVisible(true);
  }, []);

  const dismiss = () => {
    setVisible(false);
    localStorage.setItem(STORAGE_KEY, "true");
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="
            fixed bottom-24 left-4 sm:bottom-28 sm:left-6
            flex items-end gap-2
            z-30 max-w-[260px] sm:max-w-[280px]
          "
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 260, damping: 22, delay: 1.2 }}
        >
          {/* Orb */}
          <motion.div
            className="flex-shrink-0 mb-1"
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <OrbIcon />
          </motion.div>

          {/* Speech bubble */}
          <div
            className="relative glass rounded-2xl rounded-bl-sm px-4 py-3 shadow-soft"
            style={{ minWidth: 0 }}
          >
            {/* Bubble tail (left-bottom) */}
            <div
              className="absolute -left-2 bottom-3 w-0 h-0"
              style={{
                borderTop: "6px solid transparent",
                borderBottom: "6px solid transparent",
                borderRight: "8px solid var(--palette-surface)",
              }}
            />

            <p
              className="text-xs leading-relaxed pr-5"
              style={{ color: "var(--palette-text-primary)" }}
            >
              Welcome to your little world. Your diary is waiting whenever you&apos;re ready. ✦
            </p>

            <button
              onClick={dismiss}
              aria-label="Dismiss welcome guide"
              className="
                absolute top-2 right-2 p-0.5 rounded-lg
                hover:bg-[var(--palette-ground)] transition-colors duration-150
                active:scale-90
              "
              style={{ color: "var(--palette-text-muted)" }}
            >
              <X size={12} aria-hidden="true" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
