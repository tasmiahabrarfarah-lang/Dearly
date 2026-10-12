"use client";

/**
 * MagicParticles
 * A small set of softly glowing orbs that drift upward slowly.
 * Respects prefers-reduced-motion (CSS handles suppression via globals.css).
 * Uses deterministic positions to avoid hydration mismatch.
 */

import React from "react";
import { motion } from "framer-motion";

interface Particle {
  cx: number;
  cy: number;
  r: number;
  delay: number;
  duration: number;
}

// Fixed particle positions — no Math.random() to avoid SSR/hydration mismatch
const PARTICLES: Particle[] = [
  { cx: 12, cy: 78, r: 2.5, delay: 0,   duration: 6 },
  { cx: 28, cy: 60, r: 1.8, delay: 1.2, duration: 7.5 },
  { cx: 45, cy: 88, r: 3,   delay: 2.4, duration: 5.5 },
  { cx: 62, cy: 72, r: 2,   delay: 0.8, duration: 8 },
  { cx: 75, cy: 55, r: 1.5, delay: 3,   duration: 6.5 },
  { cx: 88, cy: 82, r: 2.8, delay: 1.8, duration: 7 },
  { cx: 33, cy: 42, r: 1.6, delay: 4,   duration: 9 },
  { cx: 55, cy: 35, r: 2.2, delay: 2.2, duration: 6.8 },
  { cx: 80, cy: 30, r: 1.4, delay: 0.5, duration: 8.5 },
  { cx: 20, cy: 22, r: 3.2, delay: 3.5, duration: 5.8 },
];

export default function MagicParticles() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none overflow-hidden"
    >
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid slice"
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter id="particle-blur">
            <feGaussianBlur stdDeviation="0.6" />
          </filter>
          <radialGradient id="particle-grad">
            <stop offset="0%"   stopColor="var(--palette-particle)" stopOpacity="0.9" />
            <stop offset="100%" stopColor="var(--palette-particle)" stopOpacity="0" />
          </radialGradient>
        </defs>

        {PARTICLES.map((p, i) => (
          <motion.circle
            key={i}
            cx={p.cx}
            cy={p.cy}
            r={p.r}
            fill="url(#particle-grad)"
            filter="url(#particle-blur)"
            animate={{
              cy: [p.cy, p.cy - 8, p.cy],
              opacity: [0.5, 0.85, 0.5],
            }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </svg>
    </div>
  );
}
