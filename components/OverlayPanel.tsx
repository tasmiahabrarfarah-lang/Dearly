"use client";

/**
 * OverlayPanel
 * A reusable modal-style panel that slides up from the bottom centre.
 * - Closes with Escape key
 * - Focuses the close button on open for keyboard accessibility
 * - Clicking the backdrop closes the panel
 */

import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface OverlayPanelProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  /** Optional max width, defaults to max-w-md */
  maxWidth?: string;
}

export default function OverlayPanel({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = "max-w-md",
}: OverlayPanelProps) {
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  // Escape key to close
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  // Focus close button when panel opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => closeBtnRef.current?.focus(), 50);
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-40"
            style={{ background: "rgba(30,20,50,0.35)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Panel */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className={`
              fixed inset-x-0 bottom-0 sm:inset-auto sm:left-1/2 sm:top-1/2
              sm:-translate-x-1/2 sm:-translate-y-1/2
              z-50 w-full ${maxWidth} sm:w-[90vw]
              glass rounded-t-3xl sm:rounded-3xl
              shadow-[0_-8px_40px_rgba(100,80,160,0.2)] sm:shadow-soft
              p-6 sm:p-8
            `}
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 60 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <h2
                className="text-lg font-semibold"
                style={{ color: "var(--palette-text-primary)" }}
              >
                {title}
              </h2>
              <button
                ref={closeBtnRef}
                onClick={onClose}
                aria-label="Close panel"
                className="
                  flex items-center gap-1 px-3 py-1.5 rounded-xl text-sm font-medium
                  transition-colors duration-150
                  hover:bg-[var(--palette-ground)]
                  active:scale-95
                "
                style={{ color: "var(--palette-text-muted)" }}
              >
                <X size={15} aria-hidden="true" />
                <span>Close</span>
              </button>
            </div>

            {/* Content */}
            <div className="panel-scroll">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
