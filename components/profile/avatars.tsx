"use client";

/**
 * components/profile/avatars.tsx
 * Curated set of 8 small inline SVG avatars for Dearly.
 * No external files required — all artwork is self-contained.
 *
 * Design language: soft rounded shapes, muted palette tones,
 * star/sparkle motifs consistent with Dearly's aesthetic.
 */

import React from "react";
import type { AvatarKey } from "@/lib/profile";

export const AVATAR_LABELS: Record<AvatarKey, string> = {
  fox:   "Spirit Fox",
  bunny: "Dreamy Bunny",
  cat:   "Cozy Cat",
  owl:   "Night Owl",
  bear:  "Soft Bear",
  deer:  "Gentle Deer",
  cloud: "Cloud Puff",
  star:  "Little Star",
};

// ── Individual SVG avatars ────────────────────────────────────────────────

function FoxAvatar() {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden className="w-full h-full">
      <defs>
        <radialGradient id="fox-bg" cx="50%" cy="45%" r="55%">
          <stop offset="0%" stopColor="#c8b0e8" />
          <stop offset="100%" stopColor="#9880d0" />
        </radialGradient>
      </defs>
      <circle cx="24" cy="24" r="24" fill="url(#fox-bg)" />
      <ellipse cx="24" cy="32" rx="10" ry="9" fill="#e8e0f8" />
      <circle cx="24" cy="21" r="9" fill="#f0eafa" />
      <path d="M16 14 L13 6 L20 11 Z" fill="#d8c8f0" />
      <path d="M32 14 L35 6 L28 11 Z" fill="#d8c8f0" />
      <path d="M17 13 L14.5 7.5 L19.5 11.5 Z" fill="#c4a8e0" />
      <path d="M31 13 L33.5 7.5 L28.5 11.5 Z" fill="#c4a8e0" />
      <ellipse cx="20.5" cy="21" rx="2.2" ry="2.5" fill="#2a2060" />
      <ellipse cx="27.5" cy="21" rx="2.2" ry="2.5" fill="#2a2060" />
      <circle cx="21.3" cy="19.8" r="0.8" fill="white" />
      <circle cx="28.3" cy="19.8" r="0.8" fill="white" />
      <ellipse cx="24" cy="24" rx="1.5" ry="1" fill="#c090b0" />
      <ellipse cx="18" cy="23.5" rx="2.5" ry="1.5" fill="#f0a0c0" opacity="0.45" />
      <ellipse cx="30" cy="23.5" rx="2.5" ry="1.5" fill="#f0a0c0" opacity="0.45" />
      <path d="M24,13 L24.7,15.2 L27,15.2 L25.2,16.5 L25.9,18.7 L24,17.4 L22.1,18.7 L22.8,16.5 L21,15.2 L23.3,15.2 Z" fill="#e8d080" opacity="0.85" />
      <path d="M34 38 Q40 34 38 28 Q36 24 32 26" stroke="#d8c8f0" strokeWidth="3" strokeLinecap="round" fill="none" />
    </svg>
  );
}

function BunnyAvatar() {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden className="w-full h-full">
      <defs>
        <radialGradient id="bunny-bg" cx="50%" cy="45%" r="55%">
          <stop offset="0%" stopColor="#f0c8e8" />
          <stop offset="100%" stopColor="#d090c0" />
        </radialGradient>
      </defs>
      <circle cx="24" cy="24" r="24" fill="url(#bunny-bg)" />
      {/* Long ears */}
      <ellipse cx="17" cy="10" rx="4" ry="9" fill="#f8e0f4" />
      <ellipse cx="31" cy="10" rx="4" ry="9" fill="#f8e0f4" />
      <ellipse cx="17" cy="10" rx="2.2" ry="7" fill="#f0b0d8" />
      <ellipse cx="31" cy="10" rx="2.2" ry="7" fill="#f0b0d8" />
      {/* Body */}
      <ellipse cx="24" cy="33" rx="11" ry="9" fill="#f8f0fc" />
      {/* Head */}
      <circle cx="24" cy="23" r="10" fill="#fff8fe" />
      {/* Eyes */}
      <ellipse cx="20" cy="22" rx="2" ry="2.2" fill="#3a2060" />
      <ellipse cx="28" cy="22" rx="2" ry="2.2" fill="#3a2060" />
      <circle cx="20.7" cy="21.1" r="0.7" fill="white" />
      <circle cx="28.7" cy="21.1" r="0.7" fill="white" />
      {/* Nose */}
      <ellipse cx="24" cy="25.5" rx="1.2" ry="0.9" fill="#e090b8" />
      {/* Blush */}
      <ellipse cx="18.5" cy="25" rx="2.2" ry="1.3" fill="#f8a0c8" opacity="0.5" />
      <ellipse cx="29.5" cy="25" rx="2.2" ry="1.3" fill="#f8a0c8" opacity="0.5" />
    </svg>
  );
}

function CatAvatar() {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden className="w-full h-full">
      <defs>
        <radialGradient id="cat-bg" cx="50%" cy="45%" r="55%">
          <stop offset="0%" stopColor="#b8d8f0" />
          <stop offset="100%" stopColor="#7090c8" />
        </radialGradient>
      </defs>
      <circle cx="24" cy="24" r="24" fill="url(#cat-bg)" />
      {/* Pointy ears */}
      <polygon points="13,18 10,6 19,14" fill="#d8eeff" />
      <polygon points="35,18 38,6 29,14" fill="#d8eeff" />
      <polygon points="14,17 11.5,8 18,14" fill="#c0d0f0" />
      <polygon points="34,17 36.5,8 30,14" fill="#c0d0f0" />
      {/* Body */}
      <ellipse cx="24" cy="33" rx="10" ry="9" fill="#e8f0ff" />
      {/* Head */}
      <circle cx="24" cy="22" r="10" fill="#f0f5ff" />
      {/* Eyes — slightly sleepy */}
      <path d="M18 21 Q20 19.5 22 21" stroke="#2a2a50" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <path d="M26 21 Q28 19.5 30 21" stroke="#2a2a50" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      {/* Nose */}
      <polygon points="24,24.5 22.5,26 25.5,26" fill="#d090a8" />
      {/* Whiskers */}
      <line x1="10" y1="24" x2="19" y2="25" stroke="#8090c0" strokeWidth="0.8" opacity="0.7" />
      <line x1="10" y1="26.5" x2="19" y2="26.5" stroke="#8090c0" strokeWidth="0.8" opacity="0.7" />
      <line x1="38" y1="24" x2="29" y2="25" stroke="#8090c0" strokeWidth="0.8" opacity="0.7" />
      <line x1="38" y1="26.5" x2="29" y2="26.5" stroke="#8090c0" strokeWidth="0.8" opacity="0.7" />
      {/* Blush */}
      <ellipse cx="18" cy="25.5" rx="2.2" ry="1.4" fill="#c0d4f8" opacity="0.55" />
      <ellipse cx="30" cy="25.5" rx="2.2" ry="1.4" fill="#c0d4f8" opacity="0.55" />
    </svg>
  );
}

function OwlAvatar() {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden className="w-full h-full">
      <defs>
        <radialGradient id="owl-bg" cx="50%" cy="45%" r="55%">
          <stop offset="0%" stopColor="#c0d8b0" />
          <stop offset="100%" stopColor="#6a9860" />
        </radialGradient>
      </defs>
      <circle cx="24" cy="24" r="24" fill="url(#owl-bg)" />
      {/* Tufted ears */}
      <path d="M15 16 L12 8 L20 14 Z" fill="#d8eec8" />
      <path d="M33 16 L36 8 L28 14 Z" fill="#d8eec8" />
      {/* Body */}
      <ellipse cx="24" cy="33" rx="11" ry="9" fill="#e8f4e0" />
      {/* Wing marks */}
      <path d="M13 32 Q14 38 20 36" stroke="#b0cc98" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M35 32 Q34 38 28 36" stroke="#b0cc98" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      {/* Head */}
      <circle cx="24" cy="22" r="10" fill="#f0f8e8" />
      {/* Big round eyes */}
      <circle cx="19.5" cy="22" r="5" fill="white" />
      <circle cx="28.5" cy="22" r="5" fill="white" />
      <circle cx="19.5" cy="22" r="3" fill="#3a3020" />
      <circle cx="28.5" cy="22" r="3" fill="#3a3020" />
      <circle cx="20.5" cy="20.8" r="1.1" fill="white" />
      <circle cx="29.5" cy="20.8" r="1.1" fill="white" />
      {/* Beak */}
      <polygon points="24,24.5 22.2,27 25.8,27" fill="#d8a030" />
      {/* Star on head */}
      <path d="M24,12 L24.5,13.8 L26.3,13.8 L24.8,14.9 L25.4,16.7 L24,15.6 L22.6,16.7 L23.2,14.9 L21.7,13.8 L23.5,13.8 Z" fill="#e8d070" opacity="0.9" />
    </svg>
  );
}

function BearAvatar() {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden className="w-full h-full">
      <defs>
        <radialGradient id="bear-bg" cx="50%" cy="45%" r="55%">
          <stop offset="0%" stopColor="#e0c8a8" />
          <stop offset="100%" stopColor="#b89070" />
        </radialGradient>
      </defs>
      <circle cx="24" cy="24" r="24" fill="url(#bear-bg)" />
      {/* Round ears */}
      <circle cx="14" cy="13" r="6" fill="#d8b888" />
      <circle cx="34" cy="13" r="6" fill="#d8b888" />
      <circle cx="14" cy="13" r="3.5" fill="#e8c8a0" />
      <circle cx="34" cy="13" r="3.5" fill="#e8c8a0" />
      {/* Body */}
      <ellipse cx="24" cy="34" rx="12" ry="9" fill="#f0e0c8" />
      {/* Belly patch */}
      <ellipse cx="24" cy="35" rx="7" ry="5.5" fill="#fff8f0" />
      {/* Head */}
      <circle cx="24" cy="23" r="11" fill="#f5e8d0" />
      {/* Snout */}
      <ellipse cx="24" cy="26.5" rx="5" ry="3.5" fill="#ffe0c0" />
      {/* Eyes */}
      <circle cx="19.5" cy="21" r="2.2" fill="#2a1a10" />
      <circle cx="28.5" cy="21" r="2.2" fill="#2a1a10" />
      <circle cx="20.2" cy="20.2" r="0.8" fill="white" />
      <circle cx="29.2" cy="20.2" r="0.8" fill="white" />
      {/* Nose */}
      <ellipse cx="24" cy="25.5" rx="2" ry="1.4" fill="#5a3020" />
      {/* Blush */}
      <ellipse cx="16.5" cy="24.5" rx="2.5" ry="1.5" fill="#f8b080" opacity="0.45" />
      <ellipse cx="31.5" cy="24.5" rx="2.5" ry="1.5" fill="#f8b080" opacity="0.45" />
    </svg>
  );
}

function DeerAvatar() {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden className="w-full h-full">
      <defs>
        <radialGradient id="deer-bg" cx="50%" cy="45%" r="55%">
          <stop offset="0%" stopColor="#f0d8b8" />
          <stop offset="100%" stopColor="#c89060" />
        </radialGradient>
      </defs>
      <circle cx="24" cy="24" r="24" fill="url(#deer-bg)" />
      {/* Antlers */}
      <path d="M16 14 L13 4 M13 4 L10 2 M13 4 L15 1" stroke="#8a6030" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <path d="M32 14 L35 4 M35 4 L38 2 M35 4 L33 1" stroke="#8a6030" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      {/* Big ears */}
      <ellipse cx="13" cy="17" rx="4.5" ry="6" fill="#e8c898" transform="rotate(-20,13,17)" />
      <ellipse cx="35" cy="17" rx="4.5" ry="6" fill="#e8c898" transform="rotate(20,35,17)" />
      <ellipse cx="13" cy="17" rx="2.5" ry="4" fill="#f0a888" transform="rotate(-20,13,17)" />
      <ellipse cx="35" cy="17" rx="2.5" ry="4" fill="#f0a888" transform="rotate(20,35,17)" />
      {/* Body */}
      <ellipse cx="24" cy="33" rx="10" ry="9" fill="#f8e8d0" />
      {/* Head */}
      <circle cx="24" cy="23" r="10" fill="#fdf0e0" />
      {/* Eyes — large and gentle */}
      <ellipse cx="19.5" cy="22" rx="2.5" ry="3" fill="#1a1510" />
      <ellipse cx="28.5" cy="22" rx="2.5" ry="3" fill="#1a1510" />
      <circle cx="20.3" cy="20.8" r="1" fill="white" />
      <circle cx="29.3" cy="20.8" r="1" fill="white" />
      {/* Nose */}
      <ellipse cx="24" cy="26" rx="2.5" ry="1.8" fill="#e8a090" />
      {/* Spots */}
      <circle cx="21" cy="31" r="1.2" fill="#f0c898" opacity="0.7" />
      <circle cx="27" cy="30" r="1" fill="#f0c898" opacity="0.7" />
    </svg>
  );
}

function CloudAvatar() {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden className="w-full h-full">
      <defs>
        <radialGradient id="cloud-bg" cx="50%" cy="45%" r="55%">
          <stop offset="0%" stopColor="#c8e0f8" />
          <stop offset="100%" stopColor="#8ab8e8" />
        </radialGradient>
      </defs>
      <circle cx="24" cy="24" r="24" fill="url(#cloud-bg)" />
      {/* Cloud puff body */}
      <circle cx="16" cy="26" r="8" fill="white" opacity="0.95" />
      <circle cx="24" cy="22" r="10" fill="white" opacity="0.95" />
      <circle cx="32" cy="26" r="8" fill="white" opacity="0.95" />
      <rect x="8" y="26" width="32" height="10" rx="4" fill="white" opacity="0.95" />
      {/* Face */}
      <ellipse cx="19.5" cy="23" rx="2" ry="2.2" fill="#5888c8" />
      <ellipse cx="28.5" cy="23" rx="2" ry="2.2" fill="#5888c8" />
      <circle cx="20.2" cy="22.1" r="0.7" fill="white" />
      <circle cx="29.2" cy="22.1" r="0.7" fill="white" />
      {/* Little smile */}
      <path d="M20 27 Q24 30 28 27" stroke="#5888c8" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      {/* Blush */}
      <ellipse cx="16" cy="26.5" rx="2.2" ry="1.3" fill="#a8c8f0" opacity="0.6" />
      <ellipse cx="32" cy="26.5" rx="2.2" ry="1.3" fill="#a8c8f0" opacity="0.6" />
      {/* Stars */}
      <circle cx="38" cy="12" r="1.5" fill="#f8e050" opacity="0.9" />
      <circle cx="10" cy="14" r="1" fill="#f8e050" opacity="0.8" />
      <circle cx="35" cy="8" r="1" fill="#f8e050" opacity="0.7" />
    </svg>
  );
}

function StarAvatar() {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden className="w-full h-full">
      <defs>
        <radialGradient id="star-bg" cx="50%" cy="45%" r="55%">
          <stop offset="0%" stopColor="#f8e888" />
          <stop offset="100%" stopColor="#e0b030" />
        </radialGradient>
      </defs>
      <circle cx="24" cy="24" r="24" fill="url(#star-bg)" />
      {/* Big star shape */}
      <path d="M24 6 L27.5 16.5 L38.5 16.5 L29.5 23.5 L33 34 L24 27 L15 34 L18.5 23.5 L9.5 16.5 L20.5 16.5 Z" fill="#fff8d0" />
      {/* Face */}
      <ellipse cx="20" cy="21" rx="2.2" ry="2.4" fill="#2a2010" />
      <ellipse cx="28" cy="21" rx="2.2" ry="2.4" fill="#2a2010" />
      <circle cx="20.8" cy="19.9" r="0.8" fill="white" />
      <circle cx="28.8" cy="19.9" r="0.8" fill="white" />
      <path d="M20 25.5 Q24 28.5 28 25.5" stroke="#a07820" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      {/* Blush */}
      <ellipse cx="16" cy="24" rx="2" ry="1.2" fill="#f8c040" opacity="0.5" />
      <ellipse cx="32" cy="24" rx="2" ry="1.2" fill="#f8c040" opacity="0.5" />
      {/* Sparkles */}
      <circle cx="39" cy="9" r="1.8" fill="#fff0a0" opacity="0.9" />
      <circle cx="9" cy="11" r="1.3" fill="#fff0a0" opacity="0.8" />
      <circle cx="42" cy="30" r="1" fill="#fff0a0" opacity="0.7" />
    </svg>
  );
}

// ── Avatar map ────────────────────────────────────────────────────────────

const AVATAR_COMPONENTS: Record<AvatarKey, () => React.JSX.Element> = {
  fox:   FoxAvatar,
  bunny: BunnyAvatar,
  cat:   CatAvatar,
  owl:   OwlAvatar,
  bear:  BearAvatar,
  deer:  DeerAvatar,
  cloud: CloudAvatar,
  star:  StarAvatar,
};

// ── Exported component ────────────────────────────────────────────────────

interface AvatarImageProps {
  avatarKey: AvatarKey;
  className?: string;
}

/**
 * Renders the SVG avatar for the given key.
 * Falls back to the fox avatar for unknown keys.
 */
export function AvatarImage({ avatarKey, className }: AvatarImageProps) {
  const Component = AVATAR_COMPONENTS[avatarKey] ?? FoxAvatar;
  return (
    <div className={className ?? "w-full h-full"}>
      <Component />
    </div>
  );
}
