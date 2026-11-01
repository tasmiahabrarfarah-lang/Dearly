"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { GardenState, loadGardenState, saveGardenState } from "@/lib/gardenStorage";

interface GardenContextValue {
  state: GardenState;
  loaded: boolean;
  awardMemory: (entryId: string) => Promise<void>;
}

const GardenContext = createContext<GardenContextValue | null>(null);
const emptyState: GardenState = { memories: 0, rewardedEntryIds: [] };

export function GardenProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<GardenState>(emptyState);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        try {
          const supabase = createClient();
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const [{ data: progress, error: progressError }, { data: events, error: eventsError }] = await Promise.all([
              supabase.from("garden_progress").select("memories").eq("owner_id", user.id).maybeSingle(),
              supabase.from("garden_growth_events").select("entry_id").eq("owner_id", user.id),
            ]);
            if (progressError || eventsError) throw progressError ?? eventsError;
            if (cancelled) return;
            setState({ memories: Number(progress?.memories ?? 0), rewardedEntryIds: (events ?? []).map((event) => String(event.entry_id)) });
            setLoaded(true);
            return;
          }
        } catch {
          // Do not show browser-local rewards when an account may be signed in.
          if (!cancelled) { setState(emptyState); setLoaded(true); }
          return;
        }
      }
      if (!cancelled) { setState(loadGardenState()); setLoaded(true); }
    })();
    return () => { cancelled = true; };
  }, []);

  const awardMemory = useCallback(async (entryId: string) => {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: memories, error } = await supabase.rpc("award_garden_memory", { p_entry_id: entryId });
          if (error) return;
          setState((current) => {
            const next = { memories: Number(memories ?? current.memories), rewardedEntryIds: current.rewardedEntryIds.includes(entryId) ? current.rewardedEntryIds : [...current.rewardedEntryIds, entryId] };
            saveGardenState(next);
            return next;
          });
          return;
        }
      } catch { return; }
    }
    setState((current) => {
      if (current.rewardedEntryIds.includes(entryId)) return current;
      const next = { memories: current.memories + 1, rewardedEntryIds: [...current.rewardedEntryIds, entryId] };
      saveGardenState(next);
      return next;
    });
  }, []);

  return <GardenContext.Provider value={{ state, loaded, awardMemory }}>{children}</GardenContext.Provider>;
}

export function useGarden() {
  const context = useContext(GardenContext);
  if (!context) throw new Error("useGarden must be used within GardenProvider");
  return context;
}
