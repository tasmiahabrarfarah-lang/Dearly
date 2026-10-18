"use client";

/**
 * OverlayPanel
 * A reusable modal-style panel that opens beside the control that triggered it.
 * - Closes with Escape key
 * - Focuses the close button on open for keyboard accessibility
 * - Clicking the backdrop closes the panel
 */

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface OverlayPanelProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  /** Optional max width, defaults to max-w-md */
  maxWidth?: string;
  anchorRect: DOMRect | null;
}

export default function OverlayPanel({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = "max-w-md",
  anchorRect,
}: OverlayPanelProps) {
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);

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

  useEffect(() => {
    if (!isOpen) {
      setPosition(null);
      return;
    }

    const placePanel = () => {
      const panel = panelRef.current;
      if (!panel) return;

      const padding = 12;
      const gap = 12;
      const panelWidth = panel.offsetWidth;
      const panelHeight = panel.offsetHeight;
      const fallbackAnchor = {
        top: window.innerHeight / 2,
        bottom: window.innerHeight / 2,
        left: window.innerWidth / 2,
        right: window.innerWidth / 2,
        width: 0,
        height: 0,
      };
      const anchor = anchorRect ?? fallbackAnchor;
      const spaceAbove = anchor.top - gap - padding;
      const spaceBelow = window.innerHeight - anchor.bottom - gap - padding;
      const placeAbove =
        (spaceBelow < panelHeight && spaceAbove > spaceBelow) ||
        (spaceAbove >= panelHeight && spaceBelow < panelHeight);
      const requestedTop = placeAbove
        ? anchor.top - panelHeight - gap
        : anchor.bottom + gap;
      const requestedLeft = anchor.left + anchor.width / 2 - panelWidth / 2;

      setPosition({
        top: Math.max(padding, Math.min(requestedTop, window.innerHeight - panelHeight - padding)),
        left: Math.max(padding, Math.min(requestedLeft, window.innerWidth - panelWidth - padding)),
      });
    };

    placePanel();
    window.addEventListener("resize", placePanel);
    return () => window.removeEventListener("resize", placePanel);
  }, [anchorRect, isOpen, children]);

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
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className={`
              fixed z-50 flex flex-col
              w-[calc(100vw-24px)] ${maxWidth}
              glass rounded-3xl
              shadow-[0_-8px_40px_rgba(100,80,160,0.2)] sm:shadow-soft
              p-6 sm:p-8
            `}
            style={{
              top: position?.top ?? 12,
              left: position?.left ?? 12,
              maxHeight: "calc(100dvh - 24px)",
              visibility: position ? "visible" : "hidden",
            }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
          >
            {/* Header */}
            <div className="flex flex-shrink-0 items-center justify-between mb-5">
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
            <div className="panel-scroll min-h-0">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
