"use client";

/**
 * SceneActions
 * Bottom-centre row of main scene actions:
 * Explore | My Diary | My World
 */

import React from "react";
import { motion } from "framer-motion";
import { Compass, BookOpen, Sparkles, LucideIcon } from "lucide-react";

export type SceneActionKey = "explore" | "diary" | "world";

interface SceneActionsProps {
  onAction: (action: SceneActionKey) => void;
}

const ACTIONS: {
  key: SceneActionKey;
  label: string;
  Icon: LucideIcon;
  primary?: boolean;
}[] = [
  { key: "explore", label: "Explore",  Icon: Compass  },
  { key: "diary",   label: "My Diary", Icon: BookOpen, primary: true },
  { key: "world",   label: "My World", Icon: Sparkles },
];

export default function SceneActions({ onAction }: SceneActionsProps) {
  return (
    <motion.div
      className="flex items-center gap-3"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      role="group"
      aria-label="Main actions"
    >
      {ACTIONS.map(({ key, label, Icon, primary }) => (
        <button
          key={key}
          onClick={() => onAction(key)}
          className={`
            flex items-center gap-2
            px-4 py-2.5 rounded-2xl
            text-sm font-semibold
            transition-all duration-150
            active:scale-95
            shadow-soft
            ${primary
              ? "hover:shadow-glow"
              : "hover:bg-[var(--palette-ground-mid)]"
            }
          `}
          style={
            primary
              ? {
                  background: "var(--palette-accent)",
                  color: "#fff",
                  border: "none",
                }
              : {
                  background: "var(--palette-surface)",
                  color: "var(--palette-text-primary)",
                  border: "1px solid var(--palette-surface-border)",
                }
          }
        >
          <Icon size={15} aria-hidden />
          <span>{label}</span>
        </button>
      ))}
    </motion.div>
  );
}
