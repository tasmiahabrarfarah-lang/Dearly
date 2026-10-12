"use client";

/**
 * SeedSelectionModal
 * One-time modal shown when no tree type is selected yet.
 * Displays all four tree types with their identity, palette swatches,
 * and a gentle Dearly-styled card layout.
 * Dismissed by selecting a tree — does not appear again.
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";
import { TREE_TYPES, TreeType } from "@/lib/treeStorage";
import { useTree } from "./TreeContext";
import TreeStageIllustration from "./TreeStageIllustration";

export default function SeedSelectionModal() {
  const { selectTree } = useTree();
  const [hovered, setHovered] = useState<TreeType | null>(null);
  const [chosen, setChosen] = useState<TreeType | null>(null);

  const handleSelect = (type: TreeType) => {
    setChosen(type);
    // Small delay so the selection animation plays before closing
    setTimeout(() => selectTree(type), 420);
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: "rgba(20,12,50,0.72)", backdropFilter: "blur(6px)" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="
            relative w-full max-w-2xl rounded-3xl overflow-hidden flex flex-col
          "
          style={{
            background: "var(--palette-surface)",
            border: "1px solid var(--palette-surface-border)",
            boxShadow: "0 32px 96px rgba(40,20,100,0.35)",
            maxHeight: "90vh",
          }}
          initial={{ opacity: 0, scale: 0.90, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94 }}
          transition={{ type: "spring", stiffness: 300, damping: 26 }}
        >
          {/* Header */}
          <div className="px-6 pt-6 pb-4 text-center flex-shrink-0">
            <div className="flex justify-center mb-3">
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center"
                style={{ background: "var(--palette-ground)" }}
              >
                <Sparkles size={20} style={{ color: "var(--palette-accent)" }} aria-hidden />
              </div>
            </div>
            <h2
              className="text-xl font-semibold mb-1"
              style={{ color: "var(--palette-text-primary)", fontFamily: "Georgia, serif" }}
            >
              Choose Your Seed
            </h2>
            <p className="text-sm" style={{ color: "var(--palette-text-muted)" }}>
              Your tree will grow with every memory you write. Choose carefully — this is yours forever.
            </p>
          </div>

          {/* Tree cards */}
          <div className="overflow-y-auto px-5 pb-6 flex-1">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {TREE_TYPES.map((tree) => {
                const isHovered = hovered === tree.id;
                const isChosen  = chosen  === tree.id;
                return (
                  <motion.button
                    key={tree.id}
                    onClick={() => handleSelect(tree.id as TreeType)}
                    onMouseEnter={() => setHovered(tree.id as TreeType)}
                    onMouseLeave={() => setHovered(null)}
                    aria-label={`Choose ${tree.name} tree`}
                    className="
                      relative flex flex-col items-center gap-2
                      rounded-2xl pt-3 pb-4 px-2
                      transition-all duration-200
                      focus-visible:outline-none
                      focus-visible:ring-2
                    "
                    style={{
                      background: isChosen
                        ? `${tree.palette.glow}40`
                        : isHovered
                        ? "var(--palette-ground)"
                        : "transparent",
                      border: `2px solid ${
                        isChosen
                          ? tree.palette.glow
                          : isHovered
                          ? tree.palette.foliage + "80"
                          : "var(--palette-surface-border)"
                      }`,
                      boxShadow: isChosen
                        ? `0 0 20px ${tree.palette.glow}60`
                        : "none",
                    }}
                    animate={isChosen ? { scale: [1, 1.04, 1] } : { scale: 1 }}
                    transition={{ duration: 0.3 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    {/* Mini tree preview */}
                    <div className="w-20 h-24 pointer-events-none">
                      <TreeStageIllustration
                        treeType={tree.id as TreeType}
                        stage="adult"
                      />
                    </div>

                    {/* Name */}
                    <p
                      className="text-xs font-semibold text-center leading-tight"
                      style={{
                        color: isChosen ? tree.palette.trunk : "var(--palette-text-primary)",
                      }}
                    >
                      {tree.name}
                    </p>

                    {/* Description */}
                    <p
                      className="text-xs text-center leading-tight opacity-80"
                      style={{ color: "var(--palette-text-muted)", fontSize: "10px" }}
                    >
                      {tree.description}
                    </p>

                    {/* Palette swatches */}
                    <div className="flex gap-1 mt-1">
                      {[tree.palette.trunk, tree.palette.foliage, tree.palette.flower].map((c) => (
                        <div
                          key={c}
                          className="w-3 h-3 rounded-full border"
                          style={{
                            background: c,
                            borderColor: "rgba(255,255,255,0.3)",
                          }}
                        />
                      ))}
                    </div>

                    {/* Selected check */}
                    {isChosen && (
                      <motion.div
                        className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center"
                        style={{ background: tree.palette.glow }}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 400, damping: 20 }}
                      >
                        <svg viewBox="0 0 10 10" className="w-3 h-3" fill="none">
                          <path d="M2 5 L4 7 L8 3" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </motion.div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
