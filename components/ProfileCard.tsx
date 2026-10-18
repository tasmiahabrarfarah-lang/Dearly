"use client";

/**
 * ProfileCard
 * Upper-left compact profile card with a fantasy avatar SVG,
 * display name, and a short greeting. No level or progress bar.
 */

import React from "react";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";

interface ProfileCardProps {
  onOpen: (anchor: DOMRect) => void;
}

// Simple SVG fantasy fox/spirit avatar
function AvatarIllustration() {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="w-full h-full"
    >
      <defs>
        <radialGradient id="avatar-bg" cx="50%" cy="45%" r="55%">
          <stop offset="0%"   stopColor="#c8b0e8" />
          <stop offset="100%" stopColor="#9880d0" />
        </radialGradient>
      </defs>

      {/* Background circle */}
      <circle cx="24" cy="24" r="24" fill="url(#avatar-bg)" />

      {/* Body (spirit creature) */}
      <ellipse cx="24" cy="32" rx="10" ry="9" fill="#e8e0f8" />

      {/* Head */}
      <circle cx="24" cy="21" r="9" fill="#f0eafa" />

      {/* Ears */}
      <path d="M16 14 L13 6 L20 11 Z" fill="#d8c8f0" />
      <path d="M32 14 L35 6 L28 11 Z" fill="#d8c8f0" />
      <path d="M17 13 L14.5 7.5 L19.5 11.5 Z" fill="#c4a8e0" />
      <path d="M31 13 L33.5 7.5 L28.5 11.5 Z" fill="#c4a8e0" />

      {/* Eyes */}
      <ellipse cx="20.5" cy="21" rx="2.2" ry="2.5" fill="#2a2060" />
      <ellipse cx="27.5" cy="21" rx="2.2" ry="2.5" fill="#2a2060" />
      {/* Eye shine */}
      <circle cx="21.3" cy="19.8" r="0.8" fill="white" />
      <circle cx="28.3" cy="19.8" r="0.8" fill="white" />

      {/* Nose */}
      <ellipse cx="24" cy="24" rx="1.5" ry="1" fill="#c090b0" />

      {/* Cheek blush */}
      <ellipse cx="18" cy="23.5" rx="2.5" ry="1.5" fill="#f0a0c0" opacity="0.45" />
      <ellipse cx="30" cy="23.5" rx="2.5" ry="1.5" fill="#f0a0c0" opacity="0.45" />

      {/* Star on forehead */}
      <path
        d="M24,13 L24.7,15.2 L27,15.2 L25.2,16.5 L25.9,18.7 L24,17.4 L22.1,18.7 L22.8,16.5 L21,15.2 L23.3,15.2 Z"
        fill="#e8d080"
        opacity="0.85"
      />

      {/* Tail hint */}
      <path
        d="M34 38 Q40 34 38 28 Q36 24 32 26"
        stroke="#d8c8f0"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

export default function ProfileCard({ onOpen }: ProfileCardProps) {
  return (
    <motion.button
      onClick={(event) => onOpen(event.currentTarget.getBoundingClientRect())}
      aria-label="Open profile — Little Wanderer"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="
        glass rounded-2xl flex items-center gap-3
        px-3 py-2.5
        shadow-soft cursor-pointer
        hover:shadow-glow transition-all duration-200
        active:scale-[0.98]
        text-left
      "
    >
      {/* Avatar */}
      <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 ring-2 ring-[var(--palette-accent-soft)]">
        <AvatarIllustration />
      </div>

      {/* Text */}
      <div className="min-w-0">
        <p
          className="text-sm font-semibold leading-tight truncate"
          style={{ color: "var(--palette-text-primary)" }}
        >
          Little Wanderer
        </p>
        <p
          className="text-xs leading-tight mt-0.5 truncate"
          style={{ color: "var(--palette-text-muted)" }}
        >
          A quiet, cozy afternoon ✦
        </p>
      </div>

      <ChevronRight
        size={14}
        aria-hidden="true"
        style={{ color: "var(--palette-text-muted)", flexShrink: 0 }}
      />
    </motion.button>
  );
}
