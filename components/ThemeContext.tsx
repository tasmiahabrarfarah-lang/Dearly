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
import { createClient } from "@/lib/supabase/client";

export type PaletteId = "dreamy-lavender" | "morning-sky";

export interface Palette {
  id: PaletteId;
  label: string;
  description: string;
  /** CSS data-palette attribute value */
  dataAttr: string;
  /** Scene artwork is switched as one pair to prevent mixed themes. */
  background: string;
  foreground: string;
}

export const PALETTES: Palette[] = [
  {
    id: "dreamy-lavender",
    label: "Dreamy Lavender",
    description: "Soft purple dusk — calm and introspective.",
    dataAttr: "dreamy-lavender",
    background: "/assets/scenery/home-background.webp",
    foreground: "/assets/scenery/foreground-meadow.webp",
  },
  {
    id: "morning-sky",
    label: "Morning Sky",
    description: "Clear blue dawn — open and hopeful.",
    dataAttr: "morning-sky",
    background: "/assets/scenery/morning-sky-background.png",
    foreground: "/assets/scenery/morning-sky-foreground.png",
  },
];

interface ThemeContextValue {
  palette: Palette;
  setPalette: (id: PaletteId) => Promise<boolean>;
  saving: boolean;
  saveError: string | null;
}

const ThemeContext = createContext<ThemeContextValue>({
  palette: PALETTES[0],
  setPalette: async () => false,
  saving: false,
  saveError: null,
});

const STORAGE_KEY = "dearly-palette";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [palette, setPaletteState] = useState<Palette>(PALETTES[0]);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Restore the account preference when signed in. Local storage remains the
  // fallback for local development without Supabase configuration.
  useEffect(() => {
    let cancelled = false;
    const apply = (id: unknown) => {
      if (typeof id !== "string") return false;
      const found = PALETTES.find((item) => item.id === id);
      if (!found) return false;
      setPaletteState(found);
      return true;
    };

    const saved = localStorage.getItem(STORAGE_KEY);
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      apply(saved);
      return () => { cancelled = true; };
    }

    void (async () => {
      try {
        const supabase = createClient();
        const { data: { user }, error } = await supabase.auth.getUser();
        if (cancelled) return;
        if (!error && user) {
          const accountPalette = user.user_metadata?.palette;
          const restored = apply(accountPalette);
          if (!restored) {
            setPaletteState(PALETTES[0]);
            localStorage.setItem(STORAGE_KEY, PALETTES[0].id);
          } else {
            localStorage.setItem(STORAGE_KEY, accountPalette);
          }
        } else {
          apply(saved);
        }
      } catch {
        if (!cancelled) apply(saved);
      }
    })();

    return () => { cancelled = true; };
  }, []);

  // Apply data-palette attribute to <html> whenever palette changes
  useEffect(() => {
    document.documentElement.setAttribute(
      "data-palette",
      palette.dataAttr
    );
  }, [palette]);

  const setPalette = async (id: PaletteId) => {
    const found = PALETTES.find((p) => p.id === id);
    if (!found) return false;
    setSaveError(null);
    setSaving(true);
    try {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        const supabase = createClient();
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
        if (user) {
          const { error } = await supabase.auth.updateUser({ data: { palette: id } });
          if (error) throw error;
        }
      }
      localStorage.setItem(STORAGE_KEY, id);
      setPaletteState(found);
      return true;
    } catch {
      setSaveError("Your theme could not be saved. Please try again.");
      return false;
    } finally {
      setSaving(false);
    }
  };

  return (
    <ThemeContext.Provider value={{ palette, setPalette, saving, saveError }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
