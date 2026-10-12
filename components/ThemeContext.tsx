"use client";

/**
 * ThemeContext
 * Manages the active palette choice and persists it in localStorage.
 * Two palettes are available: "dreamy-lavender" (default) and "morning-sky".
 */

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

export type PaletteId = "dreamy-lavender" | "morning-sky";

export interface Palette {
  id: PaletteId;
  label: string;
  description: string;
  /** CSS data-palette attribute value */
  dataAttr: string;
}

export const PALETTES: Palette[] = [
  {
    id: "dreamy-lavender",
    label: "Dreamy Lavender",
    description: "Soft purple dusk — calm and introspective.",
    dataAttr: "dreamy-lavender",
  },
  {
    id: "morning-sky",
    label: "Morning Sky",
    description: "Clear blue dawn — open and hopeful.",
    dataAttr: "morning-sky",
  },
];

interface ThemeContextValue {
  palette: Palette;
  setPalette: (id: PaletteId) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  palette: PALETTES[0],
  setPalette: () => {},
});

const STORAGE_KEY = "dearly-palette";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [palette, setPaletteState] = useState<Palette>(PALETTES[0]);

  // Restore from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as PaletteId | null;
    if (saved) {
      const found = PALETTES.find((p) => p.id === saved);
      if (found) setPaletteState(found);
    }
  }, []);

  // Apply data-palette attribute to <html> whenever palette changes
  useEffect(() => {
    document.documentElement.setAttribute(
      "data-palette",
      palette.dataAttr
    );
  }, [palette]);

  const setPalette = (id: PaletteId) => {
    const found = PALETTES.find((p) => p.id === id);
    if (!found) return;
    setPaletteState(found);
    localStorage.setItem(STORAGE_KEY, id);
  };

  return (
    <ThemeContext.Provider value={{ palette, setPalette }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
