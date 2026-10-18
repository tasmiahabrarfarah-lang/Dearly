"use client";

/**
 * TreeStageIllustration — v2 (Tree Visual Refinement)
 *
 * Four tree types with distinct silhouettes, foliage shapes, flower styles,
 * and fruit forms. All share the same five growth stages.
 *
 * Stages:
 *   seed    — small seed/bulb in ground, type-coloured glow
 *   sprout  — short trunk + first leaf pair
 *   teen    — taller trunk + branch stubs + partial canopy (no flowers)
 *   adult   — full canopy + type-specific flowers
 *   mature  — full canopy + flowers + type-specific fruit
 *
 * Tree identities:
 *   moonlight — silver-white foliage, weeping/graceful branches, midnight-blue flowers, teardrop fruit
 *   starlight — green+gold foliage, broad rounded crown, cream flowers, apple fruit
 *   lapis     — deep-blue foliage, tall spired canopy, golden elongated flowers, crystal-drop fruit
 *   ruby      — crimson foliage, wide spreading crown, near-black flowers, champagne-gold faceted fruit
 *
 * Illustrations are static. Supplied image assets can be enabled through treeArtwork.ts.
 */

import React, { useState } from "react";
import Image from "next/image";
import { TreeType, GrowthStage, getTreeMeta, TreeMeta } from "@/lib/treeStorage";
import {
  MOONLIGHT_STAGE_IMAGE_DIMENSIONS,
  TREE_STAGE_IMAGE_ENABLED,
  TREE_STAGE_IMAGE_PATHS,
} from "@/lib/treeArtwork";

interface Props {
  treeType: TreeType;
  stage: GrowthStage;
}

// ── Shared SVG defs (gradients + filter) ─────────────────────────────────
function TreeDefs({ p, id }: { p: TreeMeta["palette"]; id: string }) {
  return (
    <defs>
      {/* Trunk — side-lit, darker on left */}
      <linearGradient id={`trunk-${id}`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%"   stopColor={p.trunk} stopOpacity="0.65" />
        <stop offset="30%"  stopColor={p.trunk} stopOpacity="1" />
        <stop offset="70%"  stopColor={p.trunk} stopOpacity="0.82" />
        <stop offset="100%" stopColor={p.trunk} stopOpacity="0.55" />
      </linearGradient>

      {/* Branches */}
      <linearGradient id={`branch-${id}`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%"   stopColor={p.trunk} stopOpacity="0.9" />
        <stop offset="100%" stopColor={p.trunk} stopOpacity="0.6" />
      </linearGradient>

      {/* Foliage — top-lit */}
      <radialGradient id={`leaf-a-${id}`} cx="38%" cy="32%" r="62%">
        <stop offset="0%"   stopColor={p.foliage} stopOpacity="1" />
        <stop offset="60%"  stopColor={p.foliage} stopOpacity="0.88" />
        <stop offset="100%" stopColor={p.trunk}   stopOpacity="0.55" />
      </radialGradient>

      <radialGradient id={`leaf-b-${id}`} cx="55%" cy="28%" r="58%">
        <stop offset="0%"   stopColor={p.foliage} stopOpacity="0.95" />
        <stop offset="65%"  stopColor={p.foliage} stopOpacity="0.72" />
        <stop offset="100%" stopColor={p.trunk}   stopOpacity="0.5" />
      </radialGradient>

      <radialGradient id={`leaf-c-${id}`} cx="45%" cy="42%" r="56%">
        <stop offset="0%"   stopColor={p.foliage} stopOpacity="0.9" />
        <stop offset="55%"  stopColor={p.foliage} stopOpacity="0.68" />
        <stop offset="100%" stopColor={p.trunk}   stopOpacity="0.45" />
      </radialGradient>

      {/* Ground glow pool */}
      <radialGradient id={`ground-glow-${id}`} cx="50%" cy="100%" r="50%">
        <stop offset="0%"   stopColor={p.ground} stopOpacity="0.5" />
        <stop offset="100%" stopColor={p.ground} stopOpacity="0" />
      </radialGradient>

      {/* Soft bloom filter for glow ellipse */}
      <filter id={`magic-glow-${id}`} x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="9" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
  );
}

// ═══════════════════════════════════════════════════════════
// STAGE 1 — SEED
// ═══════════════════════════════════════════════════════════
function SeedStage({ p }: { p: TreeMeta["palette"] }) {
  return (
    <g>
      {/* Ground shadow */}
      <ellipse cx="140" cy="372" rx="44" ry="9" fill={p.ground} opacity="0.35" />
      {/* Seed body — rounded teardrop shape */}
      <ellipse cx="140" cy="358" rx="13" ry="17" fill={p.trunk} opacity="0.88" />
      {/* Seed cap / crown hint */}
      <ellipse cx="140" cy="343" rx="7" ry="5" fill={p.foliage} opacity="0.72" />
      {/* Tiny emerging shoot */}
      <path d="M140 338 C139 330 140 323 140 317"
        stroke={p.foliage} strokeWidth="2.2" strokeLinecap="round" fill="none" opacity="0.82" />
      <ellipse cx="140" cy="315" rx="5.5" ry="3.5"
        fill={p.foliage} opacity="0.78" transform="rotate(-8, 140, 315)" />
      {/* Static sparkles preserve a little magic without continuous motion. */}
      <circle cx="128" cy="342" r="1.6" fill={p.glow} opacity="0.72" />
      <circle cx="153" cy="346" r="1.3" fill={p.glow} opacity="0.62" />
    </g>
  );
}

// ═══════════════════════════════════════════════════════════
// STAGE 2 — SPROUT
// ═══════════════════════════════════════════════════════════
function SproutStage({ p, id }: { p: TreeMeta["palette"]; id: string }) {
  return (
    <g>
      <ellipse cx="140" cy="372" rx="55" ry="10" fill={`url(#ground-glow-${id})`} />
      {/* Short trunk */}
      <path d="M133 370 C132 350 131 332 133 318 C135 304 137 298 140 293 C143 298 145 304 147 318 C149 332 148 350 147 370 Z"
        fill={`url(#trunk-${id})`} />
      {/* First leaf pair — simple oval blades */}
      <ellipse cx="122" cy="307" rx="16" ry="7"
        fill={`url(#leaf-a-${id})`} opacity="0.9"
        transform="rotate(-20, 122, 307)" />
      <ellipse cx="158" cy="307" rx="16" ry="7"
        fill={`url(#leaf-a-${id})`} opacity="0.88"
        transform="rotate(20, 158, 307)" />
      {/* Second leaf pair higher */}
      <ellipse cx="126" cy="292" rx="13" ry="6"
        fill={`url(#leaf-b-${id})`} opacity="0.85"
        transform="rotate(-28, 126, 292)" />
      <ellipse cx="154" cy="292" rx="13" ry="6"
        fill={`url(#leaf-b-${id})`} opacity="0.82"
        transform="rotate(28, 154, 292)" />
      {/* Ambient glow */}
      <ellipse cx="140" cy="302" rx="28" ry="24"
        fill={p.glow} opacity="0.07" filter={`url(#magic-glow-${id})`}
      />
    </g>
  );
}

// ═══════════════════════════════════════════════════════════
// STAGE 3 — TEEN
// (shared scaffold; canopy shape varies by treeType)
// ═══════════════════════════════════════════════════════════
function TeenStage({ p, id, treeType }: { p: TreeMeta["palette"]; id: string; treeType: TreeType }) {
  return (
    <g>
      <ellipse cx="140" cy="372" rx="68" ry="12" fill={`url(#ground-glow-${id})`} />
      {/* Root flares */}
      <path d="M131 368 C125 362 115 359 105 362 C111 364 125 364 131 368 Z" fill={p.trunk} opacity="0.55" />
      <path d="M149 368 C155 362 165 359 175 362 C169 364 155 364 149 368 Z" fill={p.trunk} opacity="0.55" />
      {/* Trunk */}
      <path d="M129 370 C127 348 123 318 123 296 C123 279 125 266 130 256 C135 266 137 279 137 296 C137 318 133 348 131 370 Z"
        fill={`url(#trunk-${id})`} />
      {/* Branch stubs — vary angle slightly per type */}
      {treeType === "lapis" ? (
        // Lapis: more upright stubs (spire shape)
        <>
          <path d="M123 286 C114 278 102 274 90 276" stroke={`url(#branch-${id})`} strokeWidth="4.5" strokeLinecap="round" fill="none" />
          <path d="M137 280 C148 272 160 268 172 270" stroke={`url(#branch-${id})`} strokeWidth="4" strokeLinecap="round" fill="none" />
          <path d="M130 262 C129 248 128 234 124 222" stroke={`url(#branch-${id})`} strokeWidth="3" strokeLinecap="round" fill="none" />
        </>
      ) : treeType === "ruby" ? (
        // Ruby: wide spreading stubs
        <>
          <path d="M123 290 C108 284 90 282 76 286" stroke={`url(#branch-${id})`} strokeWidth="5" strokeLinecap="round" fill="none" />
          <path d="M137 284 C152 278 170 276 184 280" stroke={`url(#branch-${id})`} strokeWidth="4.5" strokeLinecap="round" fill="none" />
          <path d="M130 268 C128 254 127 240 126 228" stroke={`url(#branch-${id})`} strokeWidth="3.5" strokeLinecap="round" fill="none" />
        </>
      ) : (
        // Moonlight + Starlight: moderate spread
        <>
          <path d="M123 290 C111 284 98 282 86 286" stroke={`url(#branch-${id})`} strokeWidth="4.8" strokeLinecap="round" fill="none" />
          <path d="M137 284 C149 278 163 276 175 280" stroke={`url(#branch-${id})`} strokeWidth="4.2" strokeLinecap="round" fill="none" />
          <path d="M130 265 C128 252 127 240 123 230" stroke={`url(#branch-${id})`} strokeWidth="3.2" strokeLinecap="round" fill="none" />
        </>
      )}
      {/* Partial canopy blob — no flowers yet */}
      <TeenCanopy id={id} treeType={treeType} />
      {/* Ambient glow */}
      <ellipse cx="130" cy="235" rx="72" ry="62"
        fill={p.glow} opacity="0.06" filter={`url(#magic-glow-${id})`}
      />
    </g>
  );
}

function TeenCanopy({ id, treeType }: { id: string; treeType: TreeType }) {
  if (treeType === "lapis") {
    // Lapis teen: tall narrow spire
    return (
      <>
        <path d="M130 172 C120 168 108 174 102 186 C96 198 100 214 110 218 C114 226 122 230 130 228 C138 230 146 226 150 218 C160 214 164 198 158 186 C152 174 140 168 130 172 Z"
          fill={`url(#leaf-a-${id})`} opacity="0.9" />
        <path d="M130 195 C118 190 104 196 98 210 C92 224 96 240 108 244 C112 252 122 256 130 254 C138 256 148 252 152 244 C164 240 168 224 162 210 C156 196 142 190 130 195 Z"
          fill={`url(#leaf-b-${id})`} opacity="0.82" />
      </>
    );
  }
  if (treeType === "ruby") {
    // Ruby teen: wide spreading blobs
    return (
      <>
        <path d="M130 196 C112 190 92 196 82 210 C74 224 80 242 94 246 C100 254 114 258 130 256 C146 258 160 254 166 246 C180 242 186 224 178 210 C168 196 148 190 130 196 Z"
          fill={`url(#leaf-a-${id})`} opacity="0.9" />
        <path d="M78 228 C64 226 54 234 52 246 C56 254 68 258 80 254 C76 260 76 270 84 272 C92 274 100 268 100 260 C108 264 118 264 120 256 C116 246 104 240 94 238 Z"
          fill={`url(#leaf-b-${id})`} opacity="0.82" />
        <path d="M182 232 C196 230 206 238 208 250 C204 258 192 262 180 258 C184 264 184 274 176 276 C168 278 160 272 162 264 C154 268 144 268 142 260 C146 250 158 244 168 242 Z"
          fill={`url(#leaf-b-${id})`} opacity="0.8" />
      </>
    );
  }
  // Moonlight + Starlight teen: rounded mid-canopy
  return (
    <>
      <path d="M130 198 C115 192 98 198 90 212 C84 224 88 240 100 244 C104 252 114 256 130 254 C146 256 156 252 160 244 C172 240 176 224 170 212 C162 198 145 192 130 198 Z"
        fill={`url(#leaf-a-${id})`} opacity="0.9" />
      <path d="M82 232 C70 230 60 236 58 248 C62 256 74 260 86 256 C82 262 82 272 90 274 C98 276 106 270 106 262 C112 266 122 266 124 258 C120 248 108 242 98 240 Z"
        fill={`url(#leaf-b-${id})`} opacity="0.82" />
      <path d="M178 236 C190 234 200 240 202 252 C198 260 186 264 174 260 C178 266 178 276 170 278 C162 280 154 274 156 266 C148 270 138 270 136 262 C140 252 152 246 162 244 Z"
        fill={`url(#leaf-b-${id})`} opacity="0.8" />
    </>
  );
}

// ═══════════════════════════════════════════════════════════
// STAGE 4 + 5 — ADULT / MATURE
// (per-tree-type canopy, flowers, fruit)
// ═══════════════════════════════════════════════════════════
function AdultStage({ p, id, treeType, showFruits }: {
  p: TreeMeta["palette"];
  id: string;
  treeType: TreeType;
  showFruits: boolean;
}) {
  return (
    <g>
      {/* Ground glow pool */}
      <ellipse cx="140" cy="372" rx="80" ry="14" fill={`url(#ground-glow-${id})`} />

      {/* Root flares */}
      <path d="M118 368 C112 360 100 355 86 358 C80 358 76 362 82 364 C88 366 102 362 112 368 Z"
        fill={p.trunk} opacity="0.65" />
      <path d="M162 368 C168 360 180 355 194 358 C200 358 204 362 198 364 C192 366 178 362 168 368 Z"
        fill={p.trunk} opacity="0.65" />

      {/* Trunk body */}
      <path d="M126 370 C124 345 118 310 116 280 C114 255 115 238 118 220 C120 205 124 195 130 185 C136 195 140 205 142 220 C145 238 146 255 144 280 C142 310 136 345 134 370 Z"
        fill={`url(#trunk-${id})`} />
      {/* Trunk shadow side */}
      <path d="M126 370 C124 345 118 310 116 280 C114 255 115 238 118 220 C120 205 124 195 130 185 C128 193 126 205 125 222 C123 240 122 260 122 282 C122 312 124 346 126 370 Z"
        fill={p.trunk} opacity="0.28" />

      {/* Per-type branches and canopy */}
      <AdultCanopy p={p} id={id} treeType={treeType} />

      {/* Per-type flowers */}
      <TreeFlowers p={p} treeType={treeType} />

      {/* Per-type fruit (mature only) */}
      {showFruits && <TreeFruits p={p} treeType={treeType} />}

      {/* Static ambient glow keeps the tree calm and still. */}
      <ellipse cx="130" cy="155"
        rx={showFruits ? 115 : 102} ry={showFruits ? 132 : 118}
        fill={p.glow} opacity={showFruits ? 0.1 : 0.06} filter={`url(#magic-glow-${id})`}
      />

      {/* A few static glints add detail without animating the tree. */}
      {(showFruits
        ? [
            { cx: 52, cy: 195 },
            { cx: 216, cy: 198 },
            { cx: 126, cy: 42 },
          ]
        : [
            { cx: 52, cy: 195 },
            { cx: 216, cy: 198 },
          ]
      ).map((pt, i) => (
        <circle key={i} cx={pt.cx} cy={pt.cy} r="2"
          fill={p.glow} opacity="0.5"
        />
      ))}
    </g>
  );
}

// ── Per-type branch layout + canopy silhouette ────────────────────────────
function AdultCanopy({ p, id, treeType }: { p: TreeMeta["palette"]; id: string; treeType: TreeType }) {
  switch (treeType) {
    // ── MOONLIGHT: graceful weeping branches, elongated drooping clusters ──
    case "moonlight":
      return (
        <g>
          {/* Branches — long, drooping arcs */}
          <path d="M120 265 C106 256 86 248 64 246 C52 244 44 250 42 258"
            stroke={`url(#branch-${id})`} strokeWidth="7" strokeLinecap="round" fill="none" />
          <path d="M76 252 C70 242 66 228 64 214"
            stroke={p.trunk} strokeOpacity="0.6" strokeWidth="3.8" strokeLinecap="round" fill="none" />
          <path d="M56 248 C50 238 46 224 50 212"
            stroke={p.trunk} strokeOpacity="0.5" strokeWidth="2.8" strokeLinecap="round" fill="none" />

          <path d="M140 270 C154 260 174 252 196 250 C208 248 218 254 220 262"
            stroke={`url(#branch-${id})`} strokeWidth="6.5" strokeLinecap="round" fill="none" />
          <path d="M202 252 C208 242 210 228 206 216"
            stroke={p.trunk} strokeOpacity="0.6" strokeWidth="3.2" strokeLinecap="round" fill="none" />

          <path d="M118 228 C102 218 80 210 60 208 C50 207 44 213 44 222"
            stroke={`url(#branch-${id})`} strokeWidth="5.5" strokeLinecap="round" fill="none" />
          <path d="M64 210 C56 200 52 186 56 174"
            stroke={p.trunk} strokeOpacity="0.55" strokeWidth="2.8" strokeLinecap="round" fill="none" />

          <path d="M142 232 C158 220 178 212 198 210 C210 209 218 215 216 224"
            stroke={`url(#branch-${id})`} strokeWidth="5" strokeLinecap="round" fill="none" />
          <path d="M200 212 C208 202 212 188 210 176"
            stroke={p.trunk} strokeOpacity="0.55" strokeWidth="2.8" strokeLinecap="round" fill="none" />

          {/* Upper reaching branches */}
          <path d="M122 198 C104 186 82 178 62 176 C52 175 46 181 46 190"
            stroke={p.foliage} strokeOpacity="0.65" strokeWidth="4.5" strokeLinecap="round" fill="none" />
          <path d="M138 202 C156 188 176 180 198 178 C210 177 216 183 216 192"
            stroke={p.foliage} strokeOpacity="0.65" strokeWidth="4" strokeLinecap="round" fill="none" />
          <path d="M130 188 C127 170 124 152 120 136"
            stroke={p.foliage} strokeOpacity="0.75" strokeWidth="3.5" strokeLinecap="round" fill="none" />
          <path d="M130 188 C133 170 136 152 140 136"
            stroke={p.foliage} strokeOpacity="0.7" strokeWidth="3" strokeLinecap="round" fill="none" />

          {/* Moonlight canopy: elongated drooping clusters (like weeping willow blobs) */}
          {/* Central top */}
          <path d="M130 46 C116 40 100 48 92 62 C84 76 84 94 92 106 C86 108 80 116 82 128 C84 140 96 146 108 142 C106 154 112 164 122 166 C132 168 140 160 140 150 C140 160 148 168 158 166 C168 164 174 154 172 142 C184 146 196 140 198 128 C200 116 194 108 188 106 C196 94 196 76 188 62 C180 48 164 40 130 46 Z"
            fill={`url(#leaf-a-${id})`} opacity="0.92" />
          {/* Left weeping lobe */}
          <path d="M68 126 C54 122 44 130 40 144 C36 158 44 172 56 176 C50 184 52 196 62 200 C72 204 82 196 82 186 C88 192 98 194 104 186 C110 178 108 166 100 162 C108 154 108 140 100 132 C92 124 80 122 68 126 Z"
            fill={`url(#leaf-b-${id})`} opacity="0.86" />
          {/* Right weeping lobe */}
          <path d="M192 130 C206 126 216 134 220 148 C224 162 216 176 204 180 C210 188 208 200 198 204 C188 208 178 200 178 190 C172 196 162 198 156 190 C150 182 152 170 160 166 C152 158 152 144 160 136 C168 128 180 126 192 130 Z"
            fill={`url(#leaf-b-${id})`} opacity="0.84" />
          {/* Lower outer pockets */}
          <path d="M52 190 C40 188 32 198 32 212 C32 224 40 232 52 234 C48 242 50 252 60 254 C70 256 78 248 78 238 C84 242 94 242 98 234 C102 226 98 214 90 210 C94 202 90 192 84 188 C78 184 66 186 52 190 Z"
            fill={`url(#leaf-c-${id})`} opacity="0.78" />
          <path d="M208 194 C222 192 230 202 230 216 C230 228 222 236 210 238 C214 246 212 256 202 258 C192 260 184 252 184 242 C178 246 168 246 164 238 C160 230 164 218 172 214 C168 206 172 196 178 192 C184 188 196 190 208 194 Z"
            fill={`url(#leaf-c-${id})`} opacity="0.76" />
        </g>
      );

    // ── STARLIGHT: broad rounded crown, full warm canopy ─────────────────
    case "starlight":
      return (
        <g>
          {/* Branches — moderate spread, more even */}
          <path d="M120 264 C106 256 88 250 70 248 C58 246 50 252 48 260"
            stroke={`url(#branch-${id})`} strokeWidth="7" strokeLinecap="round" fill="none" />
          <path d="M78 252 C72 242 68 230 70 218"
            stroke={p.trunk} strokeOpacity="0.55" strokeWidth="3.5" strokeLinecap="round" fill="none" />

          <path d="M140 268 C154 260 172 254 192 252 C204 250 214 256 216 264"
            stroke={`url(#branch-${id})`} strokeWidth="6.5" strokeLinecap="round" fill="none" />
          <path d="M198 254 C204 244 208 232 206 220"
            stroke={p.trunk} strokeOpacity="0.55" strokeWidth="3.2" strokeLinecap="round" fill="none" />

          <path d="M118 230 C102 220 84 214 66 212 C56 211 50 217 50 226"
            stroke={`url(#branch-${id})`} strokeWidth="5.5" strokeLinecap="round" fill="none" />
          <path d="M142 232 C158 220 178 214 198 212 C210 211 218 217 218 226"
            stroke={`url(#branch-${id})`} strokeWidth="5" strokeLinecap="round" fill="none" />

          <path d="M122 198 C104 186 84 180 64 178 C54 177 48 183 48 192"
            stroke={p.foliage} strokeOpacity="0.6" strokeWidth="4.5" strokeLinecap="round" fill="none" />
          <path d="M138 202 C156 188 178 182 200 180 C212 179 218 185 218 194"
            stroke={p.foliage} strokeOpacity="0.6" strokeWidth="4" strokeLinecap="round" fill="none" />
          <path d="M130 190 C127 172 124 155 120 140"
            stroke={p.foliage} strokeOpacity="0.7" strokeWidth="3.5" strokeLinecap="round" fill="none" />
          <path d="M130 190 C133 172 136 154 140 140"
            stroke={p.foliage} strokeOpacity="0.65" strokeWidth="3" strokeLinecap="round" fill="none" />

          {/* Starlight canopy: broad round dome clusters */}
          {/* Central dome — wide and full */}
          <path d="M130 42 C114 36 96 44 86 58 C76 72 76 92 86 106 C80 106 72 114 74 126 C76 138 90 144 104 140 C100 152 106 162 118 164 C130 166 140 156 140 146 C140 156 150 166 162 164 C174 162 180 152 176 140 C190 144 204 138 206 126 C208 114 200 106 194 106 C204 92 204 72 194 58 C184 44 166 36 130 42 Z"
            fill={`url(#leaf-a-${id})`} opacity="0.93" />
          {/* Left cluster — rounded blob */}
          <path d="M66 124 C50 120 40 130 38 146 C36 162 46 176 60 180 C56 188 58 200 68 204 C78 208 90 200 90 188 C98 194 110 194 116 186 C122 178 118 164 108 158 C116 148 114 134 106 126 C98 118 82 120 66 124 Z"
            fill={`url(#leaf-b-${id})`} opacity="0.87" />
          {/* Right cluster — rounded blob */}
          <path d="M194 128 C210 124 220 134 222 150 C224 166 214 180 200 184 C206 192 204 204 194 208 C184 212 172 204 172 192 C164 198 152 198 146 190 C140 182 144 168 154 162 C146 152 148 138 158 130 C166 122 180 124 194 128 Z"
            fill={`url(#leaf-b-${id})`} opacity="0.85" />
          {/* Lower side pockets — wide and rounded */}
          <path d="M54 190 C40 188 32 200 34 216 C36 230 48 238 62 236 C58 244 62 254 72 256 C82 258 92 250 90 240 C98 244 110 244 114 236 C118 228 112 216 104 212 C108 202 104 192 96 188 C88 184 68 188 54 190 Z"
            fill={`url(#leaf-c-${id})`} opacity="0.8" />
          <path d="M206 194 C222 192 230 204 228 220 C226 234 214 242 200 240 C204 248 200 258 190 260 C180 262 170 254 172 244 C164 248 152 248 148 240 C144 232 150 220 160 216 C156 206 160 196 168 192 C176 188 196 192 206 194 Z"
            fill={`url(#leaf-c-${id})`} opacity="0.78" />
        </g>
      );

    // ── LAPIS LAZULI: tall spired canopy, upright branches ────────────────
    case "lapis":
      return (
        <g>
          {/* Branches — steeper upward angles for spire shape */}
          <path d="M120 262 C108 252 92 242 74 238 C62 236 54 242 54 252"
            stroke={`url(#branch-${id})`} strokeWidth="6.5" strokeLinecap="round" fill="none" />
          <path d="M78 240 C74 228 72 212 76 198"
            stroke={p.trunk} strokeOpacity="0.6" strokeWidth="3.2" strokeLinecap="round" fill="none" />

          <path d="M140 266 C152 256 168 246 186 242 C198 240 208 246 210 256"
            stroke={`url(#branch-${id})`} strokeWidth="6" strokeLinecap="round" fill="none" />
          <path d="M192 244 C196 232 196 216 192 202"
            stroke={p.trunk} strokeOpacity="0.6" strokeWidth="3" strokeLinecap="round" fill="none" />

          <path d="M118 226 C104 214 88 206 70 202 C60 200 54 206 56 216"
            stroke={`url(#branch-${id})`} strokeWidth="5.2" strokeLinecap="round" fill="none" />
          <path d="M142 228 C158 216 176 208 196 204 C206 202 212 208 212 218"
            stroke={`url(#branch-${id})`} strokeWidth="4.8" strokeLinecap="round" fill="none" />

          <path d="M122 194 C106 180 86 172 66 168 C54 167 48 173 50 182"
            stroke={p.foliage} strokeOpacity="0.7" strokeWidth="4.2" strokeLinecap="round" fill="none" />
          <path d="M138 196 C156 182 178 174 200 170 C212 169 218 175 216 184"
            stroke={p.foliage} strokeOpacity="0.7" strokeWidth="3.8" strokeLinecap="round" fill="none" />
          {/* Strong central upright */}
          <path d="M130 188 C129 168 128 148 126 128"
            stroke={p.foliage} strokeOpacity="0.85" strokeWidth="4" strokeLinecap="round" fill="none" />
          <path d="M130 188 C131 168 132 148 134 128"
            stroke={p.foliage} strokeOpacity="0.8" strokeWidth="3.5" strokeLinecap="round" fill="none" />

          {/* Lapis canopy: tall spire — narrow top, flared bottom */}
          {/* Narrow top spire */}
          <path d="M130 32 C122 28 112 36 108 50 C104 64 108 80 118 88 C112 90 108 98 110 108 C112 118 122 122 130 120 C138 122 148 118 150 108 C152 98 148 90 142 88 C152 80 156 64 152 50 C148 36 138 28 130 32 Z"
            fill={`url(#leaf-a-${id})`} opacity="0.94" />
          {/* Upper mid zone */}
          <path d="M130 76 C114 70 98 78 90 94 C82 110 86 130 98 138 C94 146 96 158 106 162 C116 166 126 158 130 148 C134 158 144 166 154 162 C164 158 166 146 162 138 C174 130 178 110 170 94 C162 78 146 70 130 76 Z"
            fill={`url(#leaf-b-${id})`} opacity="0.9" />
          {/* Flared lower canopy wings */}
          <path d="M64 142 C50 138 40 148 40 162 C40 176 50 186 64 188 C60 196 62 208 72 212 C82 216 94 208 94 196 C102 202 112 202 116 192 C120 182 114 168 104 164 C110 154 108 142 100 136 C92 130 76 134 64 142 Z"
            fill={`url(#leaf-b-${id})`} opacity="0.85" />
          <path d="M196 146 C210 142 220 152 220 166 C220 180 210 190 196 192 C200 200 198 212 188 216 C178 220 166 212 166 200 C158 206 148 206 144 196 C140 186 146 172 156 168 C150 158 152 146 160 140 C168 134 184 138 196 146 Z"
            fill={`url(#leaf-b-${id})`} opacity="0.83" />
          {/* Lower outer fill */}
          <path d="M52 196 C38 194 30 206 32 222 C34 236 48 244 62 240 C58 250 62 262 74 264 C86 266 96 256 94 244 C104 248 116 246 118 236 C122 224 114 212 104 208 C108 198 104 188 96 184 C88 180 66 186 52 196 Z"
            fill={`url(#leaf-c-${id})`} opacity="0.78" />
          <path d="M208 200 C224 198 232 210 230 226 C228 240 214 248 200 244 C204 254 200 266 188 268 C176 270 166 260 168 248 C158 252 146 250 142 240 C138 228 146 216 158 212 C154 202 158 192 166 188 C174 184 196 188 208 200 Z"
            fill={`url(#leaf-c-${id})`} opacity="0.76" />
        </g>
      );

    // ── RUBY: wide spreading crown, heavy outer clusters ──────────────────
    case "ruby":
    default:
      return (
        <g>
          {/* Branches — very wide spread, low angle */}
          <path d="M118 268 C100 258 78 248 56 246 C42 244 34 250 34 260"
            stroke={`url(#branch-${id})`} strokeWidth="7.5" strokeLinecap="round" fill="none" />
          <path d="M64 250 C56 240 52 226 58 212"
            stroke={p.trunk} strokeOpacity="0.55" strokeWidth="3.8" strokeLinecap="round" fill="none" />
          <path d="M44 254 C36 244 34 228 38 214"
            stroke={p.trunk} strokeOpacity="0.45" strokeWidth="2.8" strokeLinecap="round" fill="none" />

          <path d="M142 268 C160 258 182 248 204 246 C218 244 226 250 226 260"
            stroke={`url(#branch-${id})`} strokeWidth="7" strokeLinecap="round" fill="none" />
          <path d="M210 248 C218 238 220 224 214 210"
            stroke={p.trunk} strokeOpacity="0.55" strokeWidth="3.5" strokeLinecap="round" fill="none" />

          <path d="M116 232 C96 220 72 210 50 208 C38 207 32 215 34 226"
            stroke={`url(#branch-${id})`} strokeWidth="6" strokeLinecap="round" fill="none" />
          <path d="M144 232 C164 220 188 210 210 208 C222 207 228 215 226 226"
            stroke={`url(#branch-${id})`} strokeWidth="5.5" strokeLinecap="round" fill="none" />

          <path d="M120 200 C100 186 76 178 54 176 C42 175 36 183 38 194"
            stroke={p.foliage} strokeOpacity="0.6" strokeWidth="5" strokeLinecap="round" fill="none" />
          <path d="M140 202 C160 188 184 180 206 178 C218 177 224 185 222 196"
            stroke={p.foliage} strokeOpacity="0.6" strokeWidth="4.5" strokeLinecap="round" fill="none" />
          <path d="M130 188 C128 170 126 152 124 136"
            stroke={p.foliage} strokeOpacity="0.7" strokeWidth="3.5" strokeLinecap="round" fill="none" />
          <path d="M130 188 C132 170 134 152 136 136"
            stroke={p.foliage} strokeOpacity="0.65" strokeWidth="3" strokeLinecap="round" fill="none" />

          {/* Ruby canopy: wide spreading mass — heavy outer clusters */}
          {/* Central full cluster */}
          <path d="M130 44 C114 38 96 48 86 64 C76 80 78 100 90 112 C84 116 78 126 82 138 C86 150 100 156 114 152 C112 164 118 174 130 176 C142 174 148 164 146 152 C160 156 174 150 178 138 C182 126 176 116 170 112 C182 100 184 80 174 64 C164 48 146 38 130 44 Z"
            fill={`url(#leaf-a-${id})`} opacity="0.93" />
          {/* Wide left wing */}
          <path d="M60 120 C42 114 30 124 28 142 C26 160 38 176 54 180 C48 190 50 204 62 208 C74 212 88 202 88 190 C96 198 110 200 118 190 C126 180 122 166 110 160 C120 148 118 132 108 122 C98 112 78 118 60 120 Z"
            fill={`url(#leaf-b-${id})`} opacity="0.88" />
          {/* Wide right wing */}
          <path d="M200 124 C218 118 230 128 232 146 C234 164 222 180 206 184 C212 194 210 208 198 212 C186 216 172 206 172 194 C164 202 150 204 142 194 C134 184 140 170 152 164 C142 152 144 136 156 126 C166 116 184 120 200 124 Z"
            fill={`url(#leaf-b-${id})`} opacity="0.86" />
          {/* Lower outer heavy blobs */}
          <path d="M42 192 C26 188 18 202 20 220 C22 236 38 246 56 242 C52 252 56 264 70 266 C84 268 96 258 94 244 C104 250 118 248 122 238 C126 226 118 212 106 208 C112 198 108 186 98 182 C88 178 60 184 42 192 Z"
            fill={`url(#leaf-c-${id})`} opacity="0.82" />
          <path d="M218 196 C236 192 244 206 242 224 C240 240 226 250 208 246 C212 256 208 268 194 270 C180 272 168 262 170 248 C160 254 146 252 142 242 C138 230 148 216 162 212 C158 202 162 190 172 186 C182 182 202 186 218 196 Z"
            fill={`url(#leaf-c-${id})`} opacity="0.8" />
        </g>
      );
  }
}

// ── Per-type flower shapes ────────────────────────────────────────────────
function TreeFlowers({ p, treeType }: { p: TreeMeta["palette"]; treeType: TreeType }) {
  switch (treeType) {
    // MOONLIGHT: 5-petal elegantly pointed flowers, midnight-blue
    case "moonlight": {
      const spots = [[106, 84, 6.5], [153, 80, 6], [130, 52, 5.5], [74, 160, 5.5], [188, 162, 5.5], [170, 92, 5], [92, 110, 5]] as const;
      return (
        <g>
          {spots.map(([x, y, size], i) => (
            <g key={i} transform={`translate(${x}, ${y})`}>
              {[0, 72, 144, 216, 288].map((deg, pi) => (
                <path key={pi}
                  d={`M0,0 C${size*0.35},${-size*0.45} ${size*0.55},${-size*1.05} 0,${-size*1.35} C${-size*0.55},${-size*1.05} ${-size*0.35},${-size*0.45} 0,0`}
                  fill={p.flower} opacity="0.9"
                  transform={`rotate(${deg})`}
                />
              ))}
              <circle r={size * 0.3} fill="#c8d8f8" opacity="0.85" />
              <circle r={size * 0.14} cx={-size*0.07} cy={-size*0.07} fill="#ffffff" opacity="0.55" />
            </g>
          ))}
        </g>
      );
    }

    // STARLIGHT: 4-petal rounded flowers, cream/ivory
    case "starlight": {
      const spots = [[108, 84, 7], [154, 80, 6.5], [130, 50, 6], [74, 158, 6], [188, 160, 6], [172, 94, 5.5], [90, 112, 5.5]] as const;
      return (
        <g>
          {spots.map(([x, y, size], i) => (
            <g key={i} transform={`translate(${x}, ${y})`}>
              {[0, 90, 180, 270].map((deg, pi) => (
                <ellipse key={pi}
                  cx="0" cy={-size * 0.95}
                  rx={size * 0.55} ry={size * 0.9}
                  fill={p.flower} opacity="0.87"
                  transform={`rotate(${deg})`}
                />
              ))}
              <circle r={size * 0.32} fill="#ffe88a" opacity="0.92" />
              <circle r={size * 0.14} cx={-size*0.07} cy={-size*0.07} fill="#ffffff" opacity="0.5" />
            </g>
          ))}
        </g>
      );
    }

    // LAPIS: elongated pointed petals (orchid-like), golden
    case "lapis": {
      const spots = [[106, 78, 6.5], [152, 74, 6], [130, 44, 5.5], [70, 152, 5.5], [190, 154, 5.5], [168, 86, 5], [90, 104, 5]] as const;
      return (
        <g>
          {spots.map(([x, y, size], i) => (
            <g key={i} transform={`translate(${x}, ${y})`}>
              {[0, 60, 120, 180, 240, 300].map((deg, pi) => (
                <path key={pi}
                  d={`M0,0 C${size*0.2},${-size*0.4} ${size*0.15},${-size*1.2} 0,${-size*1.5} C${-size*0.15},${-size*1.2} ${-size*0.2},${-size*0.4} 0,0`}
                  fill={p.flower} opacity="0.9"
                  transform={`rotate(${deg})`}
                />
              ))}
              <circle r={size * 0.28} fill="#4060b0" opacity="0.9" />
              <circle r={size * 0.12} cx={-size*0.06} cy={-size*0.06} fill="#c8e0f8" opacity="0.55" />
            </g>
          ))}
        </g>
      );
    }

    // RUBY: tight dark rosette flowers — near-black, distinct from crimson foliage
    case "ruby":
    default: {
      const spots = [[108, 82, 6.5], [154, 78, 6], [130, 50, 5.5], [74, 156, 5.5], [190, 158, 5.5], [170, 90, 5], [92, 108, 5]] as const;
      return (
        <g>
          {spots.map(([x, y, size], i) => (
            <g key={i} transform={`translate(${x}, ${y})`}>
              {/* Outer dark petals */}
              {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, pi) => (
                <ellipse key={pi}
                  cx="0" cy={-size * 0.8}
                  rx={size * 0.38} ry={size * 0.6}
                  fill={p.flower} opacity="0.92"
                  transform={`rotate(${deg})`}
                />
              ))}
              {/* Inner petals — slightly lighter */}
              {[22, 67, 112, 157, 202, 247, 292, 337].map((deg, pi) => (
                <ellipse key={`i${pi}`}
                  cx="0" cy={-size * 0.5}
                  rx={size * 0.25} ry={size * 0.4}
                  fill={p.flower} opacity="0.7"
                  transform={`rotate(${deg})`}
                />
              ))}
              <circle r={size * 0.28} fill="#3a1010" opacity="0.95" />
              <circle r={size * 0.12} cx={-size*0.06} cy={-size*0.06} fill="#ff8888" opacity="0.35" />
            </g>
          ))}
        </g>
      );
    }
  }
}

// ── Per-type fruit shapes (mature only) ──────────────────────────────────
function TreeFruits({ p, treeType }: { p: TreeMeta["palette"]; treeType: TreeType }) {
  switch (treeType) {
    // MOONLIGHT: silver-blue teardrops hanging from tips
    case "moonlight": {
      const drops = [[108, 130], [156, 126], [80, 170], [196, 174], [130, 110]] as const;
      return (
        <g>
          {drops.map(([x, y], i) => (
            <g key={i} transform={`translate(${x}, ${y})`}>
              {/* Teardrop: circle + pointed bottom */}
              <path d="M0,-6 C5,-6 7,-1 7,3 C7,8 3.5,12 0,14 C-3.5,12 -7,8 -7,3 C-7,-1 -5,-6 0,-6 Z"
                fill={p.fruit} opacity="0.9" />
              <ellipse cx="-1.5" cy="-3" rx="2" ry="1.5" fill="#ffffff" opacity="0.35" />
              {/* Tiny stem */}
              <path d="M0,-7 C0,-10 -0.5,-12 0,-14"
                stroke={p.trunk} strokeWidth="1.1" strokeLinecap="round" fill="none" opacity="0.7" />
            </g>
          ))}
        </g>
      );
    }

    // STARLIGHT: round golden apples with a leaf
    case "starlight": {
      const apples = [[108, 130], [158, 126], [80, 168], [196, 172], [130, 110]] as const;
      return (
        <g>
          {apples.map(([x, y], i) => (
            <g key={i} transform={`translate(${x}, ${y})`}>
              <circle r="6.5" fill={p.fruit} opacity="0.92" />
              {/* Apple top indent */}
              <path d="M-1.5,-6.5 C-1,-8 0,-8.5 1,-8 C2,-7.5 2.5,-6 1.5,-5.5"
                stroke={p.trunk} strokeWidth="0.8" fill="none" opacity="0.6" />
              {/* Stem */}
              <path d="M0,-7 C0,-10 0.5,-12 0,-14"
                stroke={p.trunk} strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.75" />
              {/* Tiny leaf */}
              <ellipse cx="2.5" cy="-12" rx="3" ry="1.5"
                fill="#6a9a40" opacity="0.8" transform="rotate(-25, 2.5, -12)" />
              {/* Highlight */}
              <circle r="2.2" cx="-2" cy="-2.5" fill="#ffffff" opacity="0.28" />
            </g>
          ))}
        </g>
      );
    }

    // LAPIS: elongated hanging crystal prisms
    case "lapis": {
      const crystals = [[108, 126], [156, 122], [78, 166], [194, 170], [130, 106]] as const;
      return (
        <g>
          {crystals.map(([x, y], i) => (
            <g key={i} transform={`translate(${x}, ${y})`}>
              {/* Crystal prism: hexagonal column + pointed bottom */}
              <path d="M-3.5,-8 L3.5,-8 L5,0 L3.5,8 L0,13 L-3.5,8 L-5,0 Z"
                fill={p.fruit} opacity="0.88" />
              {/* Crystal facet highlight */}
              <path d="M-3.5,-8 L0,-8 L1.5,0 L0,8 L-3.5,8 Z"
                fill="#ffffff" opacity="0.18" />
              {/* Inner gleam */}
              <ellipse cx="-0.5" cy="-2" rx="1.5" ry="2.5" fill="#a8d0ff" opacity="0.4" />
              {/* Suspension line */}
              <path d="M0,-9 C0,-11 0,-13 0,-15"
                stroke={p.trunk} strokeWidth="0.9" strokeLinecap="round" fill="none" opacity="0.65" />
            </g>
          ))}
        </g>
      );
    }

    // RUBY: champagne-gold faceted fruit with a subtle silvery gleam
    case "ruby":
    default: {
      const fruits = [[108, 130], [156, 126], [78, 168], [196, 172], [130, 108]] as const;
      return (
        <g>
          {fruits.map(([x, y], i) => (
            <g key={i} transform={`translate(${x}, ${y})`}>
              {/* Pentagon outline */}
              <path d="M0,-7 L6.6,-2.2 L4.1,5.7 L-4.1,5.7 L-6.6,-2.2 Z"
                fill={p.fruit} stroke="#eee4d0" strokeWidth="0.55" opacity="0.96" />
              {/* Facet lines */}
              <path d="M0,-7 L0,5.7 M-4.1,5.7 L4.1,5.7"
                stroke="#ffffff" strokeWidth="0.5" opacity="0.2" />
              {/* Highlight */}
              <ellipse cx="-1.5" cy="-2" rx="2" ry="2.5" fill="#fff8e8" opacity="0.38" />
              {/* Stem */}
              <path d="M0,-8 C0,-11 0.5,-13 0,-15"
                stroke={p.trunk} strokeWidth="1.1" strokeLinecap="round" fill="none" opacity="0.7" />
            </g>
          ))}
        </g>
      );
    }
  }
}

// ══════════════════════════════════════════════════════════════
// MAIN EXPORT
// ══════════════════════════════════════════════════════════════
export default function TreeStageIllustration({ treeType, stage }: Props) {
  const [failedImagePath, setFailedImagePath] = useState<string | null>(null);
  const meta = getTreeMeta(treeType);
  const p = meta.palette;
  const id = treeType; // unique gradient/filter prefix
  const imagePath = TREE_STAGE_IMAGE_PATHS[treeType][stage];
  const useStageImage = TREE_STAGE_IMAGE_ENABLED[treeType][stage] && failedImagePath !== imagePath;

  if (useStageImage && treeType === "moonlight") {
    const dimensions = MOONLIGHT_STAGE_IMAGE_DIMENSIONS[stage];

    return (
      <div
        role="img"
        aria-label={`${meta.name} tree — ${stage} stage`}
        className="relative select-none pointer-events-none"
        style={{ width: "100%", height: "100%" }}
      >
        <Image
          src={imagePath}
          width={dimensions.width}
          height={dimensions.height}
          alt=""
          sizes="(max-width: 640px) 220px, (max-width: 1280px) 38vw, 480px"
          className="moonlight-tree-art"
          onError={() => {
            setFailedImagePath(imagePath);
            if (process.env.NODE_ENV !== "production") {
              console.error(`[Dearly] Failed to load Moonlight ${stage} artwork: ${imagePath}`);
            }
          }}
        />
      </div>
    );
  }

  const renderStage = () => {
    switch (stage) {
      case "seed":   return <SeedStage   p={p} />;
      case "sprout": return <SproutStage p={p} id={id} />;
      case "teen":   return <TeenStage   p={p} id={id} treeType={treeType} />;
      case "adult":  return <AdultStage  p={p} id={id} treeType={treeType} showFruits={false} />;
      case "mature": return <AdultStage  p={p} id={id} treeType={treeType} showFruits={true}  />;
    }
  };

  return (
    <div
      role="img"
      aria-label={`${meta.name} tree — ${stage} stage`}
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
