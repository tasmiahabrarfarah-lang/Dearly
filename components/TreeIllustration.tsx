"use client";

/**
 * TreeIllustration
 * A Moonlight-style tree: cool silver-gray trunk, silver-white foliage,
 * midnight-blue accent flowers, and a soft cool blue-white glow.
 * Entirely inline SVG — no external assets required.
 * The leafy canopy has a gentle leaf-sway animation.
 */

import React from "react";
import { motion } from "framer-motion";

export default function TreeIllustration() {
  return (
    <div
      aria-label="Moonlight tree — a silver-leafed magical tree"
      className="relative select-none pointer-events-none"
      style={{ width: "100%", height: "100%" }}
    >
      <svg
        viewBox="0 0 240 320"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
        aria-hidden="true"
      >
        <defs>
          {/* Glow filter */}
          <filter id="tree-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Soft leaf fill gradient */}
          <radialGradient id="canopy-grad" cx="50%" cy="45%" r="55%">
            <stop offset="0%"   stopColor="#e8eef8" />
            <stop offset="60%"  stopColor="#c8d8ee" />
            <stop offset="100%" stopColor="#a8c0e0" stopOpacity="0.7" />
          </radialGradient>

          {/* Trunk gradient */}
          <linearGradient id="trunk-grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="#9aa8bc" />
            <stop offset="50%"  stopColor="#c0ccd8" />
            <stop offset="100%" stopColor="#8898ac" />
          </linearGradient>

          {/* Ground glow */}
          <radialGradient id="glow-grad" cx="50%" cy="100%" r="40%">
            <stop offset="0%"   stopColor="#b8d0f0" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#b8d0f0" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Ground glow pool */}
        <ellipse cx="120" cy="308" rx="70" ry="14"
          fill="url(#glow-grad)" />

        {/* Trunk */}
        <path
          d="M108 310 C106 280 100 240 104 200 C108 165 116 150 120 145
             C124 150 132 165 136 200 C140 240 134 280 132 310 Z"
          fill="url(#trunk-grad)"
          stroke="#8898ac"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />

        {/* Root flares */}
        <path d="M108 310 C100 308 88 312 80 315" stroke="#9aa8bc" strokeWidth="2" strokeLinecap="round" />
        <path d="M132 310 C140 308 152 312 160 315" stroke="#9aa8bc" strokeWidth="2" strokeLinecap="round" />

        {/* Lower branch left */}
        <path
          d="M110 220 C92 210 72 205 58 208"
          stroke="#aab8cc"
          strokeWidth="6"
          strokeLinecap="round"
        />

        {/* Lower branch right */}
        <path
          d="M130 225 C148 215 168 210 182 213"
          stroke="#aab8cc"
          strokeWidth="5"
          strokeLinecap="round"
        />

        {/* Upper branch left */}
        <path
          d="M112 175 C94 162 74 155 60 158"
          stroke="#b8c8d8"
          strokeWidth="4.5"
          strokeLinecap="round"
        />

        {/* Upper branch right */}
        <path
          d="M128 180 C146 168 166 162 180 164"
          stroke="#b8c8d8"
          strokeWidth="4"
          strokeLinecap="round"
        />

        {/* ── Canopy (animated sway) ──────────────────────────── */}
        <motion.g
          style={{ transformOrigin: "120px 145px" }}
          animate={{ rotate: [-1.5, 1.5, -1.5] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        >
          {/* Main canopy blob — large */}
          <ellipse cx="120" cy="100" rx="78" ry="72"
            fill="url(#canopy-grad)"
            opacity="0.92"
          />

          {/* Secondary cluster left */}
          <ellipse cx="68" cy="118" rx="48" ry="44"
            fill="#ccd8ec"
            opacity="0.8"
          />

          {/* Secondary cluster right */}
          <ellipse cx="172" cy="122" rx="46" ry="42"
            fill="#ccd8ec"
            opacity="0.8"
          />

          {/* Top highlight puff */}
          <ellipse cx="118" cy="52" rx="38" ry="30"
            fill="#e8f0f8"
            opacity="0.7"
          />

          {/* Leaf detail marks */}
          {[
            [85, 72], [105, 52], [132, 58], [152, 78],
            [68, 105], [170, 110], [120, 38], [96, 115],
            [144, 105],
          ].map(([x, y], i) => (
            <ellipse
              key={i}
              cx={x} cy={y} rx="7" ry="5"
              fill="#c8d8ee"
              opacity="0.65"
              style={{ transform: `rotate(${(i * 35) % 180}deg)`, transformOrigin: `${x}px ${y}px` }}
            />
          ))}

          {/* Midnight-blue flowers (adult tree marker) */}
          {[
            [88, 80], [138, 68], [165, 118], [72, 122], [118, 45],
          ].map(([x, y], i) => (
            <g key={i} transform={`translate(${x}, ${y})`}>
              <circle r="5" fill="#2a3a6a" opacity="0.85" />
              <circle r="2.5" fill="#8090c8" opacity="0.9" />
              {[0, 72, 144, 216, 288].map((deg) => (
                <ellipse
                  key={deg}
                  cx={0}
                  cy={-6}
                  rx="1.8"
                  ry="3.5"
                  fill="#3a4e8c"
                  opacity="0.8"
                  transform={`rotate(${deg})`}
                />
              ))}
            </g>
          ))}

          {/* Glow shimmer overlay */}
          <motion.ellipse
            cx="120" cy="95"
            rx="72" ry="65"
            fill="#aac8f0"
            opacity="0"
            filter="url(#tree-glow)"
            animate={{ opacity: [0, 0.18, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          />
        </motion.g>
      </svg>
    </div>
  );
}
