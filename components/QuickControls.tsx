"use client";

/**
 * QuickControls
 * Upper-right compact row with labeled icon buttons:
 * Friends, Notifications, Settings.
 */

import React from "react";
import { motion } from "framer-motion";
import { Users, Bell, Settings, LucideIcon } from "lucide-react";

export type QuickControlKey = "friends" | "notifications" | "settings";

interface QuickControlsProps {
  onOpen: (panel: QuickControlKey, anchor: DOMRect) => void;
}

const CONTROLS: { key: QuickControlKey; label: string; Icon: LucideIcon }[] = [
  { key: "friends",       label: "Friends",       Icon: Users    },
  { key: "notifications", label: "Notifications", Icon: Bell     },
  { key: "settings",      label: "Settings",      Icon: Settings },
];

export default function QuickControls({ onOpen }: QuickControlsProps) {
  return (
    <motion.div
      className="glass rounded-2xl flex items-center gap-1 px-2 py-2 shadow-soft"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      role="toolbar"
      aria-label="Quick controls"
    >
      {CONTROLS.map(({ key, label, Icon }) => (
        <button
          key={key}
          onClick={(event) => onOpen(key, event.currentTarget.getBoundingClientRect())}
          aria-label={label}
          className="
            flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl
            text-xs font-medium
            transition-all duration-150
            hover:bg-[var(--palette-ground)]
            active:scale-95
          "
          style={{ color: "var(--palette-text-muted)" }}
        >
          <Icon size={16} aria-hidden />
          <span className="hidden sm:block">{label}</span>
        </button>
      ))}
    </motion.div>
  );
}
