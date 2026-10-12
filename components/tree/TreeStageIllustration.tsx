"use client";

/**
 * TreeStageIllustration
 * Renders the correct tree appearance based on growth stage and tree type.
 * 
 * Stages:
 *   seed    — a small seed/bulb in the ground, magical sparkle
 *   sprout  — tiny trunk + first two leaves
 *   teen    — trunk + 3 branch stubs + partial canopy (no flowers)
 *   adult   — full trunk + all branches + full canopy + flowers
 *   mature  — adult + fruits + enhanced glow + more particles
 *
 * All existing Moonlight adult SVG paths are reused.
 * Color is driven by palette from treeStorage.ts.
 * Other tree types use the same geometry with their distinct palette.
 */

import React from "react";
import { motion } from "framer-motion";
import { TreeType, GrowthStage, getTreeMeta, TreeMeta } from "@/lib/treeStorage";

interface Props {
  treeType: TreeType;
  stage: GrowthStage;
}

// ── Shared defs builder ───────────────────────────────────────────────────
function TreeDefs({ p, id }: { p: TreeMeta["palette"]; id: string }) {
  return (
    <defs>
      <linearGradient id={`trunk-${id}`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%"   stopColor={p.trunk} stopOpacity="0.7" />
        <stop offset="35%"  stopColor={p.trunk} stopOpacity="1" />
        <stop offset="65%"  stopColor={p.foliage} stopOpacity="0.5" />
        <stop offset="100%" stopColor={p.trunk} stopOpacity="0.8" />
      </linearGradient>

      <linearGradient id={`branch-${id}`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%"   stopColor={p.trunk} />
        <stop offset="50%"  stopColor={p.foliage} stopOpacity="0.5" />
        <stop offset="100%" stopColor={p.trunk} stopOpacity="0.8" />
      </linearGradient>

      <radialGradient id={`leaf-a-${id}`} cx="40%" cy="35%" r="60%">
        <stop offset="0%"   stopColor={p.foliage} stopOpacity="1" />
        <stop offset="55%"  stopColor={p.foliage} stopOpacity="0.85" />
        <stop offset="100%" stopColor={p.trunk}   stopOpacity="0.6" />
      </radialGradient>

      <radialGradient id={`leaf-b-${id}`} cx="55%" cy="30%" r="55%">
        <stop offset="0%"   stopColor={p.foliage} stopOpacity="0.95" />
        <stop offset="60%"  stopColor={p.foliage} stopOpacity="0.75" />
        <stop offset="100%" stopColor={p.trunk}   stopOpacity="0.55" />
      </radialGradient>

      <radialGradient id={`leaf-c-${id}`} cx="45%" cy="40%" r="58%">
        <stop offset="0%"   stopColor={p.foliage} stopOpacity="0.9" />
        <stop offset="50%"  stopColor={p.foliage} stopOpacity="0.7" />
        <stop offset="100%" stopColor={p.trunk}   stopOpacity="0.5" />
      </radialGradient>

      <radialGradient id={`ground-glow-${id}`} cx="50%" cy="100%" r="50%">
        <stop offset="0%"   stopColor={p.ground} stopOpacity="0.55" />
        <stop offset="100%" stopColor={p.ground} stopOpacity="0" />
      </radialGradient>

      <filter id={`magic-glow-${id}`} x="-40%" y="-40%" width="180%" height="180%">
        <feGaussianBlur stdDeviation="7" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
  );
}

// ── Seed stage ────────────────────────────────────────────────────────────
function SeedStage({ p }: { p: TreeMeta["palette"] }) {
  return (
    <g>
      {/* Ground glow */}
      <ellipse cx="140" cy="372" rx="50" ry="10" fill={p.ground} opacity="0.4" />
      {/* Seed body */}
      <ellipse cx="140" cy="358" rx="14" ry="18"
        fill={p.trunk} opacity="0.9" />
      <ellipse cx="140" cy="352" rx="8" ry="6"
        fill={p.foliage} opacity="0.7" />
      {/* Tiny sprout tip */}
      <path d="M140 340 C138 332 140 326 140 320" stroke={p.foliage} strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.8" />
      <ellipse cx="140" cy="318" rx="6" ry="4" fill={p.foliage} opacity="0.75" transform="rotate(-10, 140, 318)" />
      {/* Magical sparkles */}
      {[
        { cx: 128, cy: 340, r: 1.5, delay: 0 },
        { cx: 152, cy: 344, r: 1.2, delay: 1.2 },
        { cx: 140, cy: 310, r: 1.8, delay: 0.6 },
      ].map((s, i) => (
        <motion.circle
          key={i} cx={s.cx} cy={s.cy} r={s.r}
          fill={p.glow} opacity="0"
          animate={{ opacity: [0, 0.9, 0], scale: [0.5, 1.2, 0.5] }}
          transition={{ duration: 2.5, repeat: Infinity, delay: s.delay, ease: "easeInOut" }}
        />
      ))}
    </g>
  );
}

// ── Sprout stage ──────────────────────────────────────────────────────────
function SproutStage({ p, id }: { p: TreeMeta["palette"]; id: string }) {
  return (
    <g>
      <ellipse cx="140" cy="372" rx="60" ry="11" fill={`url(#ground-glow-${id})`} />
      {/* Stubby trunk */}
      <path
        d="M132 370 C131 348 130 330 132 315 C134 300 136 295 140 290 C144 295 146 300 148 315 C150 330 149 348 148 370 Z"
        fill={`url(#trunk-${id})`}
      />
      {/* Two small leaf pairs */}
      <path d="M140 310 C130 302 118 300 112 306 C118 308 130 308 140 310 Z" fill={`url(#leaf-a-${id})`} opacity="0.9" />
      <path d="M140 310 C150 302 162 300 168 306 C162 308 150 308 140 310 Z" fill={`url(#leaf-a-${id})`} opacity="0.85" />
      <path d="M140 294 C133 287 122 285 118 291 C124 292 133 292 140 294 Z" fill={`url(#leaf-b-${id})`} opacity="0.85" />
      <path d="M140 294 C147 287 158 285 162 291 C156 292 147 292 140 294 Z" fill={`url(#leaf-b-${id})`} opacity="0.80" />
      {/* Glow */}
      <motion.ellipse cx="140" cy="300" rx="30" ry="26"
        fill={p.glow} opacity="0" filter={`url(#magic-glow-${id})`}
        animate={{ opacity: [0, 0.12, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />
    </g>
  );
}

// ── Teen stage ────────────────────────────────────────────────────────────
function TeenStage({ p, id }: { p: TreeMeta["palette"]; id: string }) {
  return (
    <g>
      <ellipse cx="140" cy="372" rx="70" ry="12" fill={`url(#ground-glow-${id})`} />
      {/* Root flares */}
      <path d="M130 368 C124 362 114 359 104 362 C110 364 124 364 130 368 Z" fill={p.trunk} opacity="0.6" />
      <path d="M150 368 C156 362 166 359 176 362 C170 364 156 364 150 368 Z" fill={p.trunk} opacity="0.6" />
      {/* Trunk */}
      <path
        d="M128 370 C126 348 122 318 122 295 C122 278 124 265 130 255 C136 265 138 278 138 295 C138 318 134 348 132 370 Z"
        fill={`url(#trunk-${id})`}
      />
      {/* Three branch stubs */}
      <path d="M122 290 C110 284 96 282 84 286" stroke={`url(#branch-${id})`} strokeWidth="5" strokeLinecap="round" fill="none" />
      <path d="M138 285 C150 278 162 276 174 280" stroke={`url(#branch-${id})`} strokeWidth="4.5" strokeLinecap="round" fill="none" />
      <path d="M130 265 C128 252 126 240 122 230" stroke={p.foliage} strokeOpacity="0.7" strokeWidth="3.5" strokeLinecap="round" fill="none" />
      {/* Partial canopy — 4 leaf clusters, no flowers */}
      <path d="M130 200 C115 194 98 198 90 210 C84 222 88 236 100 240 C104 248 112 252 122 248 C128 254 138 254 144 248 C154 252 162 248 166 240 C178 236 182 222 176 210 C168 198 152 194 130 200 Z"
        fill={`url(#leaf-a-${id})`} opacity="0.9" />
      <path d="M84 230 C72 228 62 234 60 244 C64 252 76 256 88 252 C84 258 84 266 92 268 C100 270 108 264 106 256 C112 260 120 260 122 252 C118 244 108 238 100 236 C100 232 92 228 84 230 Z"
        fill={`url(#leaf-b-${id})`} opacity="0.84" />
      <path d="M176 234 C188 232 198 238 200 248 C196 256 184 260 172 256 C176 262 176 270 168 272 C160 274 152 268 154 260 C148 264 140 264 138 256 C142 248 152 242 160 240 C160 236 168 232 176 234 Z"
        fill={`url(#leaf-b-${id})`} opacity="0.82" />
      {/* Glow */}
      <motion.ellipse cx="130" cy="235" rx="75" ry="65"
        fill={p.glow} opacity="0" filter={`url(#magic-glow-${id})`}
        animate={{ opacity: [0, 0.11, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
      />
      {/* Small particles */}
      {[{ cx: 84, cy: 240, delay: 0 }, { cx: 196, cy: 244, delay: 1.4 }, { cx: 130, cy: 196, delay: 0.7 }].map((p2, i) => (
        <motion.circle key={i} cx={p2.cx} cy={p2.cy} r="2"
          fill={p.glow} opacity="0"
          animate={{ opacity: [0, 0.7, 0], cy: [p2.cy, p2.cy - 7, p2.cy] }}
          transition={{ duration: 4.5, repeat: Infinity, delay: p2.delay }}
        />
      ))}
    </g>
  );
}

// ── Adult stage — full Moonlight-style tree, type palette ─────────────────
function AdultStage({ p, id, showFruits }: { p: TreeMeta["palette"]; id: string; showFruits: boolean }) {
  return (
    <motion.g
      style={{ transformOrigin: "130px 185px" }}
      animate={{ rotate: [-1.2, 1.2, -1.2] }}
      transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
    >
      {/* Ground glow pool */}
      <ellipse cx="140" cy="372" rx="80" ry="14" fill={`url(#ground-glow-${id})`} />

      {/* Root flares */}
      <path d="M118 368 C112 360 100 355 86 358 C80 358 76 362 82 364 C88 366 102 362 112 368 Z" fill={p.trunk} opacity="0.7" />
      <path d="M162 368 C168 360 180 355 194 358 C200 358 204 362 198 364 C192 366 178 362 168 368 Z" fill={p.trunk} opacity="0.7" />

      {/* Trunk */}
      <path d="M126 370 C124 345 118 310 116 280 C114 255 115 238 118 220 C120 205 124 195 130 185 C136 195 140 205 142 220 C145 238 146 255 144 280 C142 310 136 345 134 370 Z"
        fill={`url(#trunk-${id})`} />
      <path d="M126 370 C124 345 118 310 116 280 C114 255 115 238 118 220 C120 205 124 195 130 185 C128 192 126 204 125 220 C123 238 122 258 122 280 C122 310 124 345 126 370 Z"
        fill={p.trunk} opacity="0.35" />
      <path d="M130 280 C128 260 127 240 129 220" stroke={p.foliage} strokeWidth="0.8" opacity="0.4" strokeLinecap="round" />

      {/* All branches — same geometry as original */}
      <path d="M120 265 C108 258 90 250 72 248 C60 246 50 250 46 256" stroke={`url(#branch-${id})`} strokeWidth="7" strokeLinecap="round" fill="none" />
      <path d="M80 252 C74 244 68 234 66 224" stroke={p.foliage} strokeOpacity="0.6" strokeWidth="4" strokeLinecap="round" fill="none" />
      <path d="M64 250 C56 244 48 238 44 230" stroke={p.trunk} strokeWidth="3" strokeLinecap="round" fill="none" />

      <path d="M140 270 C152 262 170 254 188 252 C200 250 210 254 214 260" stroke={`url(#branch-${id})`} strokeWidth="6.5" strokeLinecap="round" fill="none" />
      <path d="M196 254 C202 246 206 236 204 226" stroke={p.foliage} strokeOpacity="0.6" strokeWidth="3.5" strokeLinecap="round" fill="none" />

      <path d="M118 230 C104 220 86 212 68 210 C58 209 50 213 48 220" stroke={`url(#branch-${id})`} strokeWidth="5.5" strokeLinecap="round" fill="none" />
      <path d="M72 212 C64 204 58 192 60 182" stroke={p.foliage} strokeOpacity="0.6" strokeWidth="3" strokeLinecap="round" fill="none" />
      <path d="M56 218 C48 210 42 200 44 188" stroke={p.trunk} strokeWidth="2.5" strokeLinecap="round" fill="none" />

      <path d="M142 234 C156 222 174 214 192 212 C204 211 212 215 214 222" stroke={`url(#branch-${id})`} strokeWidth="5" strokeLinecap="round" fill="none" />
      <path d="M198 214 C206 206 210 195 208 184" stroke={p.foliage} strokeOpacity="0.6" strokeWidth="3" strokeLinecap="round" fill="none" />

      <path d="M122 200 C106 188 86 180 68 178 C56 177 48 183 48 190" stroke={p.foliage} strokeOpacity="0.7" strokeWidth="4.5" strokeLinecap="round" fill="none" />
      <path d="M138 204 C154 190 174 182 194 180 C206 179 214 185 214 192" stroke={p.foliage} strokeOpacity="0.7" strokeWidth="4" strokeLinecap="round" fill="none" />
      <path d="M130 190 C127 172 124 155 120 140" stroke={p.foliage} strokeOpacity="0.8" strokeWidth="3.5" strokeLinecap="round" fill="none" />
      <path d="M130 190 C133 172 136 155 140 140" stroke={p.foliage} strokeOpacity="0.8" strokeWidth="3" strokeLinecap="round" fill="none" />

      {/* All 7 leaf clusters */}
      <path d="M130 48 C118 44 104 50 96 60 C88 70 86 84 90 96 C84 96 78 102 80 112 C82 122 92 126 102 124 C100 134 104 142 112 144 C120 146 128 140 130 132 C132 140 140 146 148 144 C156 142 160 134 158 124 C168 126 178 122 180 112 C182 102 176 96 170 96 C174 84 172 70 164 60 C156 50 142 44 130 48 Z"
        fill={`url(#leaf-a-${id})`} opacity="0.93" />
      <path d="M68 130 C56 126 46 132 42 144 C38 156 44 168 54 172 C50 178 50 188 58 192 C66 196 74 190 76 182 C82 188 90 190 96 184 C102 178 100 168 94 164 C100 158 100 146 94 140 C88 134 78 130 68 130 Z"
        fill={`url(#leaf-b-${id})`} opacity="0.88" />
      <path d="M192 134 C204 130 214 136 218 148 C222 160 216 172 206 176 C210 182 210 192 202 196 C194 200 186 194 184 186 C178 192 170 194 164 188 C158 182 160 172 166 168 C160 162 160 150 166 144 C172 138 182 134 192 134 Z"
        fill={`url(#leaf-b-${id})`} opacity="0.86" />
      <path d="M56 192 C44 190 36 198 36 210 C36 220 42 228 52 230 C48 236 50 244 58 246 C66 248 74 242 74 234 C80 238 88 238 92 232 C96 226 92 216 86 212 C90 204 88 194 82 190 C76 186 66 190 56 192 Z"
        fill={`url(#leaf-c-${id})`} opacity="0.82" />
      <path d="M204 196 C216 194 224 202 224 214 C224 224 218 232 208 234 C212 240 210 248 202 250 C194 252 186 246 186 238 C180 242 172 242 168 236 C164 230 168 220 174 216 C170 208 172 198 178 194 C184 190 194 194 204 196 Z"
        fill={`url(#leaf-c-${id})`} opacity="0.80" />
      <path d="M160 62 C170 56 182 60 186 70 C190 80 186 92 178 96 C182 102 180 112 174 114 C168 116 162 110 162 102 C156 106 150 106 148 100 C146 94 150 86 156 84 C154 76 156 66 160 62 Z"
        fill={`url(#leaf-a-${id})`} opacity="0.85" />
      <path d="M100 66 C90 60 78 64 74 74 C70 84 74 96 82 100 C78 106 76 116 82 118 C88 120 94 114 94 106 C100 110 106 110 108 104 C110 98 106 90 100 88 C102 80 100 70 100 66 Z"
        fill={`url(#leaf-a-${id})`} opacity="0.83" />

      {/* Flowers — 7 per adult+mature */}
      {[
        [105, 82, 7],
        [152, 78, 6.5],
        [130, 52, 6],
        [72, 158, 6],
        [188, 160, 6],
        [168, 90, 5.5],
        [92, 108, 5.5],
      ].map(([x, y, size], i) => (
        <g key={i} transform={`translate(${x}, ${y})`}>
          {[0, 72, 144, 216, 288].map((deg, pi) => (
            <path
              key={pi}
              d={`M0,0 C${size * 0.4},${-size * 0.5} ${size * 0.6},${-size * 1.1} 0,${-size * 1.4} C${-size * 0.6},${-size * 1.1} ${-size * 0.4},${-size * 0.5} 0,0`}
              fill={p.flower}
              opacity="0.88"
              transform={`rotate(${deg})`}
            />
          ))}
          <circle r={size * 0.32} fill={p.foliage} opacity="0.9" />
          <circle r={size * 0.15} cx={-size * 0.08} cy={-size * 0.08} fill="#ffffff" opacity="0.5" />
        </g>
      ))}

      {/* Fruits — mature only */}
      {showFruits && [
        [108, 128, 5.5],
        [156, 124, 5],
        [78, 168, 5],
        [194, 172, 5],
        [130, 108, 4.5],
      ].map(([x, y, r], i) => (
        <g key={i} transform={`translate(${x}, ${y})`}>
          <circle r={r} fill={p.fruit} opacity="0.9" />
          <circle r={r * 0.4} cx={-r * 0.3} cy={-r * 0.3} fill="#ffffff" opacity="0.3" />
          <path d={`M0,${-r} C-1,${-r - 4} 1,${-r - 6} 0,${-r - 8}`} stroke={p.trunk} strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.7" />
        </g>
      ))}

      {/* Magic glow */}
      <motion.ellipse cx="130" cy="150" rx={showFruits ? 118 : 105} ry={showFruits ? 135 : 120}
        fill={p.glow} opacity="0" filter={`url(#magic-glow-${id})`}
        animate={{ opacity: [0, showFruits ? 0.18 : 0.12, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
      />

      {/* Particles — more at mature */}
      {(showFruits
        ? [
            { cx: 50,  cy: 194, dur: 5.5, delay: 0 },
            { cx: 218, cy: 196, dur: 6,   delay: 1 },
            { cx: 120, cy: 44,  dur: 4.5, delay: 2 },
            { cx: 186, cy: 70,  dur: 7,   delay: 0.5 },
            { cx: 74,  cy: 76,  dur: 5,   delay: 3 },
            { cx: 208, cy: 230, dur: 6.5, delay: 1.5 },
            { cx: 130, cy: 30,  dur: 5,   delay: 2.5 },
            { cx: 44,  cy: 165, dur: 4,   delay: 0.8 },
            { cx: 218, cy: 162, dur: 4.8, delay: 1.8 },
          ]
        : [
            { cx: 50,  cy: 194, dur: 5.5, delay: 0 },
            { cx: 218, cy: 196, dur: 6,   delay: 1 },
            { cx: 120, cy: 44,  dur: 4.5, delay: 2 },
            { cx: 186, cy: 70,  dur: 7,   delay: 0.5 },
            { cx: 74,  cy: 76,  dur: 5,   delay: 3 },
            { cx: 208, cy: 230, dur: 6.5, delay: 1.5 },
          ]
      ).map((pt, i) => (
        <motion.circle key={i} cx={pt.cx} cy={pt.cy} r="2.2"
          fill={p.glow} opacity="0"
          animate={{ opacity: [0, 0.7, 0], cy: [pt.cy, pt.cy - 8, pt.cy] }}
          transition={{ duration: pt.dur, repeat: Infinity, ease: "easeInOut", delay: pt.delay }}
        />
      ))}
    </motion.g>
  );
}

// ── Main export ───────────────────────────────────────────────────────────
export default function TreeStageIllustration({ treeType, stage }: Props) {
  const meta = getTreeMeta(treeType);
  const p = meta.palette;
  // Unique gradient/filter ID prefix per tree type to avoid SVG id collisions
  const id = treeType;

  const renderStage = () => {
    switch (stage) {
      case "seed":   return <SeedStage   p={p} />;
      case "sprout": return <SproutStage p={p} id={id} />;
      case "teen":   return <TeenStage   p={p} id={id} />;
      case "adult":  return <AdultStage  p={p} id={id} showFruits={false} />;
      case "mature": return <AdultStage  p={p} id={id} showFruits={true}  />;
    }
  };

  const label = `${meta.name} tree — ${stage} stage`;

  return (
    <div
      aria-label={label}
      className="relative select-none pointer-events-none"
      style={{ width: "100%", height: "100%" }}
    >
      <svg
        viewBox="0 0 280 380"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
        aria-hidden="true"
        overflow="visible"
      >
        <TreeDefs p={p} id={id} />
        {renderStage()}
      </svg>
    </div>
  );
}
