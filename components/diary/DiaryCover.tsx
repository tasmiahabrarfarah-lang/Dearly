"use client";

/**
 * DiaryCover — the single source of truth for how a diary looks.
 *
 * The home-screen diary, the live preview in Settings, and the onboarding
 * thumbnails all render this same component, so what you preview is exactly
 * what you get.
 *
 * Layout (viewBox 240×185), nothing is placed on top of anything else:
 *   spine ........ x 22–40
 *   frame ........ x 48–200, y 19–157 (dashed border)
 *   bookmark ..... x 164–178, hangs from the top edge
 *   label plate .. centred at (124, 94), holds 0–3 decorations
 *   ruled lines .. y 130 / 139
 */

import React, { useId } from "react";
import { DEFAULT_DIARY_DESIGN, shadeColor, type DiaryDesign } from "@/lib/diaryDesign";

const BM_X = 164;
const BM_W = 14;
const PLATE_CX = 124;
const PLATE_CY = 94;
const PLATE_H = 40;
const PLATE_WIDTHS = [0, 56, 88, 120]; // by decoration count
const ICON_SIZE = 22;
const ICON_GAP = 32;

function starPath(outer: number, inner: number) {
  const pts: string[] = [];
  for (let k = 0; k < 10; k++) {
    const r = k % 2 === 0 ? outer : inner;
    const a = ((-90 + k * 36) * Math.PI) / 180;
    pts.push(`${(r * Math.cos(a)).toFixed(2)} ${(r * Math.sin(a)).toFixed(2)}`);
  }
  return `M${pts.join("L")}Z`;
}
const STAR_PATH = starPath(11.5, 4.9);

/** One icon, drawn in a 24×24 box centred on (cx, cy). Pure SVG so it looks the same on every device (no emoji fonts). */
export function DecorationShape({ id, size = 24, ink, hole, cx = 0, cy = 0 }: { id: string; size?: number; ink: string; hole: string; cx?: number; cy?: number }) {
  let body: React.ReactNode = null;
  switch (id) {
    case "flower":
      body = <>{[0, 1, 2, 3, 4].map((k) => {
        const a = ((-90 + k * 72) * Math.PI) / 180;
        return <circle key={k} cx={6.6 * Math.cos(a)} cy={6.6 * Math.sin(a)} r={4.7} fill={ink} />;
      })}<circle r={3.3} fill={hole} /></>;
      break;
    case "star":
      body = <path d={STAR_PATH} fill={ink} />;
      break;
    case "heart":
      body = <path d="M0 10.5C-13 1.5-10.5-9-4.6-8.2-2.2-7.8-.6-6.2 0-4.2.6-6.2 2.2-7.8 4.6-8.2 10.5-9 13 1.5 0 10.5Z" fill={ink} />;
      break;
    case "moon":
      body = <path d="M9.3 6.4A11 11 0 1 1 2.6-10.2A9 9 0 1 0 9.3 6.4Z" fill={ink} transform="translate(-1 0)" />;
      break;
    case "leaf":
      body = <><path d="M-9.5 9C-10.5-4 -1-11.5 10.5-10.5 10.5 1 4.5 10.5-9.5 9Z" fill={ink} /><path d="M-9 8.5L4.5-5" stroke={hole} strokeWidth={1.4} strokeLinecap="round" fill="none" /></>;
      break;
    case "cloud":
      body = <g fill={ink}><circle cx={-5.5} cy={2.5} r={5} /><circle cx={0.5} cy={-2} r={7} /><circle cx={7.5} cy={3} r={4.6} /><rect x={-5.5} y={2.5} width={13.5} height={5.2} rx={2} /></g>;
      break;
  }
  return <g transform={`translate(${cx} ${cy}) scale(${size / 24})`}>{body}</g>;
}

/** A small bookmark drawn in the chosen colour (used by the editor's shape picker). */
export function BookmarkSwatch({ style, color, className }: { style: string; color: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 46" className={className} aria-hidden="true">
      <path d={bookmarkPath(style, 5, 14, 3, 28)} fill={color} stroke={shadeColor(color, -0.25)} strokeWidth="0.8" strokeLinejoin="round" />
    </svg>
  );
}

function bookmarkPath(style: string, x: number, w: number, top: number, length = 38) {
  const r = x + w;
  const mid = x + w / 2;
  const end = top + length;
  if (style === "ribbon") return `M${x} ${top}H${r}V${end + 8}L${mid} ${end}L${x} ${end + 8}Z`; // swallowtail
  if (style === "rounded") return `M${x} ${top}H${r}V${end}a${w / 2} ${w / 2} 0 0 1 ${-w} 0Z`; // soft tab
  return `M${x} ${top}H${r}V${end}L${mid} ${end + 9}L${x} ${end}Z`; // pointed pennant
}

interface DiaryCoverProps {
  design?: DiaryDesign;
  className?: string;
  /** Soft drop shadow under the book. Turn off for tiny thumbnails. */
  shadow?: boolean;
  /** Accessible name. Omit to hide the graphic from assistive tech (when a label sits next to it). */
  title?: string;
  /** Extra SVG drawn on top (the home screen adds its glow ring here). */
  children?: React.ReactNode;
}

export default function DiaryCover({ design = DEFAULT_DIARY_DESIGN, className, shadow = true, title, children }: DiaryCoverProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const cover = design.cover_color;
  const ink = shadeColor(cover, -0.5); // decorations: strong contrast on every cover colour
  const plateFill = shadeColor(cover, 0.62);
  const plateStroke = shadeColor(cover, -0.12);
  const lineInk = shadeColor(cover, -0.32);

  const decorations = design.decoration_ids.slice(0, 3);
  const plateW = PLATE_WIDTHS[decorations.length];
  const plate = plateW ? { x: PLATE_CX - plateW / 2, y: PLATE_CY - PLATE_H / 2, w: plateW, h: PLATE_H } : null;

  const bmStroke = shadeColor(design.bookmark_color, -0.28);

  return (
    <svg viewBox="0 0 240 185" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} overflow="visible"
      role={title ? "img" : undefined} aria-label={title} aria-hidden={title ? undefined : true}>
      <defs>
        <linearGradient id={`${uid}-cover`} x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0%" stopColor={shadeColor(cover, 0.2)} />
          <stop offset="45%" stopColor={cover} />
          <stop offset="100%" stopColor={shadeColor(cover, -0.14)} />
        </linearGradient>
        <linearGradient id={`${uid}-hi`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`${uid}-spine`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={shadeColor(cover, -0.26)} />
          <stop offset="60%" stopColor={shadeColor(cover, -0.08)} />
          <stop offset="100%" stopColor={shadeColor(cover, -0.22)} />
        </linearGradient>
        {shadow && (
          <filter id={`${uid}-drop`} x="-15%" y="-10%" width="130%" height="140%">
            <feDropShadow dx="2" dy="10" stdDeviation="10" floodColor="#5830a0" floodOpacity="0.22" />
          </filter>
        )}
      </defs>

      <g filter={shadow ? `url(#${uid}-drop)` : undefined}>
        {/* Page block peeking out on the right */}
        <rect x="34" y="14" width="186" height="152" rx="6" fill="#f8f0e8" />
        <rect x="34" y="14" width="184" height="152" rx="5" fill="#f4eae0" />
        {[211, 214, 217].map((x, i) => (
          <line key={x} x1={x} y1={19 + i} x2={x} y2={161 - i} stroke="#e0d5c5" strokeWidth="0.8" />
        ))}

        {/* Cover */}
        <rect x="22" y="10" width="186" height="156" rx="8" fill={`url(#${uid}-cover)`} />
        <rect x="22" y="10" width="186" height="60" rx="8" fill={`url(#${uid}-hi)`} />

        {/* Spine (rounded on the outer edge only) with stitching */}
        <path d="M30 10H40V166H30a8 8 0 0 1-8-8V18a8 8 0 0 1 8-8Z" fill={`url(#${uid}-spine)`} />
        {[30, 50, 70, 90, 110, 130, 150].map((y) => (
          <circle key={y} cx="31" cy={y} r="1.3" fill={shadeColor(cover, -0.5)} opacity="0.5" />
        ))}

        {/* Dashed frame, kept clear of the spine */}
        <rect x="48" y="19" width="152" height="138" rx="5" stroke={shadeColor(cover, -0.2)} strokeWidth="1.2" strokeDasharray="4 3.5" opacity="0.75" />

        {/* Label plate with decorations */}
        {plate && (
          <g>
            <rect x={plate.x} y={plate.y} width={plate.w} height={plate.h} rx="14" fill={plateFill} stroke={plateStroke} strokeWidth="1" opacity="0.96" />
            {decorations.map((d, i) => (
              <DecorationShape key={d} id={d} size={ICON_SIZE} ink={ink} hole={plateFill}
                cx={PLATE_CX + (i - (decorations.length - 1) / 2) * ICON_GAP} cy={PLATE_CY} />
            ))}
          </g>
        )}

        {/* Ruled lines under the plate */}
        <line x1="96" y1="131" x2="152" y2="131" stroke={lineInk} strokeWidth="1" strokeLinecap="round" opacity="0.4" />
        <line x1="104" y1="140" x2="144" y2="140" stroke={lineInk} strokeWidth="1" strokeLinecap="round" opacity="0.28" />

        {/* Corner flourishes (inside the frame) */}
        <path d="M187 25C192 25 195 28 195 33" stroke={lineInk} strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
        <path d="M187 151C192 151 195 148 195 143" stroke={lineInk} strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />

        {/* Bookmark — drawn last so it always sits on top */}
        <path d={bookmarkPath(design.bookmark_style, BM_X, BM_W, 10)} fill={design.bookmark_color} stroke={bmStroke} strokeWidth="0.9" strokeLinejoin="round" />
        <rect x={BM_X + 2} y="10.5" width="3" height="34" rx="1.2" fill="#ffffff" opacity="0.35" />
      </g>

      {children}
    </svg>
  );
}
