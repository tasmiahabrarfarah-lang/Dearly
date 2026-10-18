"use client";

/**
 * TreeIllustration — Revised
 * A Moonlight-style fantasy tree with organic branch structure,
 * individual leaf clusters, distinct flower shapes, layered foliage,
 * subtle shading, and a restrained cool blue-white magical glow.
 *
 * Palette: silver-gray trunk, pale silver-white foliage, midnight-blue flowers.
 * No circles-as-blobs — uses actual branch paths and leaf cluster shapes.
 */

import React from "react";

export default function TreeIllustration() {
  return (
    <div
      aria-label="Moonlight tree — a silver-leafed magical tree"
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
        <defs>
          {/* ── Gradients ───────────────────────────────── */}
          <linearGradient id="trunk-grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"  stopColor="#7a8fa8" />
            <stop offset="35%" stopColor="#b8c8d8" />
            <stop offset="65%" stopColor="#d0dce8" />
            <stop offset="100%" stopColor="#8898b0" />
          </linearGradient>

          <linearGradient id="branch-grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"  stopColor="#9aaabf" />
            <stop offset="50%" stopColor="#c4d0de" />
            <stop offset="100%" stopColor="#8090a8" />
          </linearGradient>

          {/* Leaf cluster fills — main canopy */}
          <radialGradient id="leaf-a" cx="40%" cy="35%" r="60%">
            <stop offset="0%"  stopColor="#e4eef8" />
            <stop offset="55%" stopColor="#c8daf0" />
            <stop offset="100%" stopColor="#a4bcd8" stopOpacity="0.8" />
          </radialGradient>

          <radialGradient id="leaf-b" cx="55%" cy="30%" r="55%">
            <stop offset="0%"  stopColor="#dce8f4" />
            <stop offset="60%" stopColor="#b8cee6" />
            <stop offset="100%" stopColor="#98b8d4" stopOpacity="0.75" />
          </radialGradient>

          <radialGradient id="leaf-c" cx="45%" cy="40%" r="58%">
            <stop offset="0%"  stopColor="#eaf2fb" />
            <stop offset="50%" stopColor="#ccdaea" />
            <stop offset="100%" stopColor="#aac0d8" stopOpacity="0.7" />
          </radialGradient>

          {/* Ground glow pool */}
          <radialGradient id="tree-ground-glow" cx="50%" cy="100%" r="50%">
            <stop offset="0%"  stopColor="#a8c4e8" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#a8c4e8" stopOpacity="0" />
          </radialGradient>

          {/* Magical glow filter */}
          <filter id="magic-glow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="7" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Soft inner filter for foliage depth */}
          <filter id="leaf-soft" x="-5%" y="-5%" width="110%" height="110%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* ── Ground glow pool ──────────────────────────── */}
        <ellipse cx="140" cy="372" rx="80" ry="14"
          fill="url(#tree-ground-glow)" />

        {/* ── ROOT FLARES ──────────────────────────────── */}
        {/* Root left */}
        <path d="M118 368 C112 360 100 355 86 358 C80 358 76 362 82 364 C88 366 102 362 112 368 Z"
          fill="#8898b0" opacity="0.7" />
        {/* Root right */}
        <path d="M162 368 C168 360 180 355 194 358 C200 358 204 362 198 364 C192 366 178 362 168 368 Z"
          fill="#8898b0" opacity="0.7" />

        {/* ── TRUNK ────────────────────────────────────── */}
        {/* Trunk body — organic tapered shape */}
        <path
          d="
            M126 370
            C124 345 118 310 116 280
            C114 255 115 238 118 220
            C120 205 124 195 130 185
            C136 195 140 205 142 220
            C145 238 146 255 144 280
            C142 310 136 345 134 370
            Z
          "
          fill="url(#trunk-grad)"
        />
        {/* Trunk dark side (shading) */}
        <path
          d="
            M126 370
            C124 345 118 310 116 280
            C114 255 115 238 118 220
            C120 205 124 195 130 185
            C128 192 126 204 125 220
            C123 238 122 258 122 280
            C122 310 124 345 126 370
            Z
          "
          fill="#7a8fa8" opacity="0.4"
        />
        {/* Bark detail lines */}
        <path d="M130 280 C128 260 127 240 129 220" stroke="#90a4b8" strokeWidth="0.8" opacity="0.5" strokeLinecap="round" />
        <path d="M132 300 C134 280 135 255 133 235" stroke="#c8d8e8" strokeWidth="0.6" opacity="0.35" strokeLinecap="round" />

        {/* ── BRANCHES ─────────────────────────────────── */}

        {/* Lower-left branch — grows from trunk mid, curves outward */}
        <path
          d="M120 265 C108 258 90 250 72 248 C60 246 50 250 46 256"
          stroke="url(#branch-grad)" strokeWidth="7" strokeLinecap="round" fill="none"
        />
        {/* Sub-branch from lower-left */}
        <path d="M80 252 C74 244 68 234 66 224" stroke="#b0c0d0" strokeWidth="4" strokeLinecap="round" fill="none" />
        <path d="M64 250 C56 244 48 238 44 230" stroke="#a8b8c8" strokeWidth="3" strokeLinecap="round" fill="none" />

        {/* Lower-right branch */}
        <path
          d="M140 270 C152 262 170 254 188 252 C200 250 210 254 214 260"
          stroke="url(#branch-grad)" strokeWidth="6.5" strokeLinecap="round" fill="none"
        />
        {/* Sub-branch from lower-right */}
        <path d="M196 254 C202 246 206 236 204 226" stroke="#b0c0d0" strokeWidth="3.5" strokeLinecap="round" fill="none" />

        {/* Mid-left branch */}
        <path
          d="M118 230 C104 220 86 212 68 210 C58 209 50 213 48 220"
          stroke="url(#branch-grad)" strokeWidth="5.5" strokeLinecap="round" fill="none"
        />
        {/* Sub-branches */}
        <path d="M72 212 C64 204 58 192 60 182" stroke="#b8c8d8" strokeWidth="3" strokeLinecap="round" fill="none" />
        <path d="M56 218 C48 210 42 200 44 188" stroke="#aabcd0" strokeWidth="2.5" strokeLinecap="round" fill="none" />

        {/* Mid-right branch */}
        <path
          d="M142 234 C156 222 174 214 192 212 C204 211 212 215 214 222"
          stroke="url(#branch-grad)" strokeWidth="5" strokeLinecap="round" fill="none"
        />
        <path d="M198 214 C206 206 210 195 208 184" stroke="#b8c8d8" strokeWidth="3" strokeLinecap="round" fill="none" />

        {/* Upper-left branch */}
        <path
          d="M122 200 C106 188 86 180 68 178 C56 177 48 183 48 190"
          stroke="#b8cad8" strokeWidth="4.5" strokeLinecap="round" fill="none"
        />
        <path d="M68 180 C60 170 54 158 56 147" stroke="#b8c8d8" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <path d="M54 185 C46 176 40 162 42 150" stroke="#aabcd0" strokeWidth="2" strokeLinecap="round" fill="none" />

        {/* Upper-right branch */}
        <path
          d="M138 204 C154 190 174 182 194 180 C206 179 214 185 214 192"
          stroke="#b8cad8" strokeWidth="4" strokeLinecap="round" fill="none"
        />
        <path d="M190 182 C198 172 204 158 202 147" stroke="#b8c8d8" strokeWidth="2.5" strokeLinecap="round" fill="none" />

        {/* Top branch — slender upward reach */}
        <path
          d="M130 190 C127 172 124 155 120 140"
          stroke="#c0d0e0" strokeWidth="3.5" strokeLinecap="round" fill="none"
        />
        <path
          d="M130 190 C133 172 136 155 140 140"
          stroke="#c0d0e0" strokeWidth="3" strokeLinecap="round" fill="none"
        />

        {/* ── LEAF CLUSTERS (canopy) ───────────────────── */}
        {/* Drawn as organic blobs — not circles, using path for silhouette */}

        <g>
          {/* ── CLUSTER 1 — Main centre-top ── */}
          <path
            d="
              M130 48
              C118 44 104 50 96 60
              C88 70 86 84 90 96
              C84 96 78 102 80 112
              C82 122 92 126 102 124
              C100 134 104 142 112 144
              C120 146 128 140 130 132
              C132 140 140 146 148 144
              C156 142 160 134 158 124
              C168 126 178 122 180 112
              C182 102 176 96 170 96
              C174 84 172 70 164 60
              C156 50 142 44 130 48
              Z
            "
            fill="url(#leaf-a)"
            opacity="0.93"
          />
          {/* Cluster 1 highlight */}
          <path
            d="M130 55 C122 52 114 58 110 68 C106 78 108 90 116 96 C120 82 126 68 130 55 Z"
            fill="#eef5fc" opacity="0.55"
          />

          {/* ── CLUSTER 2 — Left mid ── */}
          <path
            d="
              M68 130
              C56 126 46 132 42 144
              C38 156 44 168 54 172
              C50 178 50 188 58 192
              C66 196 74 190 76 182
              C82 188 90 190 96 184
              C102 178 100 168 94 164
              C100 158 100 146 94 140
              C88 134 78 130 68 130
              Z
            "
            fill="url(#leaf-b)"
            opacity="0.88"
          />
          {/* Cluster 2 highlight */}
          <path d="M64 136 C56 138 52 148 54 158 C56 148 60 140 64 136 Z" fill="#deeef8" opacity="0.5" />

          {/* ── CLUSTER 3 — Right mid ── */}
          <path
            d="
              M192 134
              C204 130 214 136 218 148
              C222 160 216 172 206 176
              C210 182 210 192 202 196
              C194 200 186 194 184 186
              C178 192 170 194 164 188
              C158 182 160 172 166 168
              C160 162 160 150 166 144
              C172 138 182 134 192 134
              Z
            "
            fill="url(#leaf-b)"
            opacity="0.86"
          />

          {/* ── CLUSTER 4 — Lower-left ── */}
          <path
            d="
              M56 192
              C44 190 36 198 36 210
              C36 220 42 228 52 230
              C48 236 50 244 58 246
              C66 248 74 242 74 234
              C80 238 88 238 92 232
              C96 226 92 216 86 212
              C90 204 88 194 82 190
              C76 186 66 190 56 192
              Z
            "
            fill="url(#leaf-c)"
            opacity="0.82"
          />

          {/* ── CLUSTER 5 — Lower-right ── */}
          <path
            d="
              M204 196
              C216 194 224 202 224 214
              C224 224 218 232 208 234
              C212 240 210 248 202 250
              C194 252 186 246 186 238
              C180 242 172 242 168 236
              C164 230 168 220 174 216
              C170 208 172 198 178 194
              C184 190 194 194 204 196
              Z
            "
            fill="url(#leaf-c)"
            opacity="0.80"
          />

          {/* ── CLUSTER 6 — Top right ── */}
          <path
            d="
              M160 62
              C170 56 182 60 186 70
              C190 80 186 92 178 96
              C182 102 180 112 174 114
              C168 116 162 110 162 102
              C156 106 150 106 148 100
              C146 94 150 86 156 84
              C154 76 156 66 160 62
              Z
            "
            fill="url(#leaf-a)"
            opacity="0.85"
          />

          {/* ── CLUSTER 7 — Top left ── */}
          <path
            d="
              M100 66
              C90 60 78 64 74 74
              C70 84 74 96 82 100
              C78 106 76 116 82 118
              C88 120 94 114 94 106
              C100 110 106 110 108 104
              C110 98 106 90 100 88
              C102 80 100 70 100 66
              Z
            "
            fill="url(#leaf-a)"
            opacity="0.83"
          />

          {/* ── Individual leaf details — give the canopy texture ── */}
          {/* Small oval leaves scattered in clusters */}
          {[
            // [cx, cy, rx, ry, rotation]
            [110, 72, 9, 5, -30],
            [130, 58, 10, 5, 5],
            [150, 76, 9, 5, 25],
            [88, 90, 8, 4, -20],
            [172, 100, 8, 4, 20],
            [60, 148, 8, 4, -15],
            [206, 152, 8, 4, 15],
            [68, 218, 7, 4, -25],
            [212, 222, 7, 4, 25],
            [120, 44, 9, 4, 0],
            [140, 46, 9, 4, 10],
            [178, 70, 7, 4, 30],
            [82, 70, 7, 4, -30],
            [96, 108, 7, 4, -10],
            [164, 112, 7, 4, 10],
          ].map(([cx, cy, rx, ry, rot], i) => (
            <ellipse
              key={i}
              cx={cx} cy={cy} rx={rx} ry={ry}
              fill="#d8ecfa"
              opacity={0.5}
              transform={`rotate(${rot}, ${cx}, ${cy})`}
            />
          ))}

          {/* ── MIDNIGHT-BLUE FLOWERS ── */}
          {/* Each flower: a small central disk + 5 petals radiating out */}
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
              {/* 5 petals */}
              {[0, 72, 144, 216, 288].map((deg, pi) => (
                <path
                  key={pi}
                  d={`M0,0 C${size * 0.4},${-size * 0.5} ${size * 0.6},${-size * 1.1} 0,${-size * 1.4} C${-size * 0.6},${-size * 1.1} ${-size * 0.4},${-size * 0.5} 0,0`}
                  fill={pi % 2 === 0 ? "#1e2d6a" : "#2a3e8a"}
                  opacity="0.88"
                  transform={`rotate(${deg})`}
                />
              ))}
              {/* Center disk */}
              <circle r={size * 0.32} fill="#7080c0" opacity="0.9" />
              {/* Center highlight */}
              <circle r={size * 0.15} cx={-size * 0.08} cy={-size * 0.08} fill="#a0b0e0" opacity="0.8" />
            </g>
          ))}

          {/* ── MAGICAL GLOW — restrained ambient shimmer ── */}
          <ellipse
            cx="130" cy="150"
            rx="105" ry="120"
            fill="#b8d4f8"
            opacity="0.08"
            filter="url(#magic-glow)"
          />

          {/* ── MAGICAL PARTICLES — static light orbs near tips ── */}
          {[
            { cx: 50, cy: 194 },
            { cx: 218, cy: 196 },
            { cx: 120, cy: 44 },
            { cx: 186, cy: 70 },
            { cx: 74, cy: 76 },
            { cx: 208, cy: 230 },
          ].map((p, i) => (
            <circle
              key={i}
              cx={p.cx} cy={p.cy} r="2.2"
              fill="#c8e0f8"
              opacity="0.55"
            />
          ))}
        </g>
      </svg>
    </div>
  );
}
