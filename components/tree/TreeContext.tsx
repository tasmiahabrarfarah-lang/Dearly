"use client";

/**
 * TreeContext
 * Global state for tree type selection and growth progression.
 * Loads from localStorage on mount. Exposes awardGrowth() for diary integration.
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  TreeState,
  TreeType,
  loadTreeState,
  saveTreeState,
  applyGrowthReward,
} from "@/lib/treeStorage";

interface TreeContextValue {
  treeState: TreeState;
  isLoaded: boolean;
  selectTree: (type: TreeType) => void;
  /** Call this when a new diary entry is successfully saved. Idempotent per entryId. */
  awardGrowth: (entryId: string) => void;
}

const TreeContext = createContext<TreeContextValue | null>(null);

export function TreeProvider({ children }: { children: React.ReactNode }) {
  const [treeState, setTreeState] = useState<TreeState>({
    treeType: null,
    stage: "seed",
    xp: 0,
    rewardedEntryIds: [],
  });
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from storage on client mount only
  useEffect(() => {
    const loaded = loadTreeState();
    setTreeState(loaded);
    setIsLoaded(true);
  }, []);

  const selectTree = useCallback((type: TreeType) => {
    setTreeState((prev) => {
      const next = { ...prev, treeType: type };
      saveTreeState(next);
      return next;
    });
  }, []);

  const awardGrowth = useCallback((entryId: string) => {
    setTreeState((prev) => {
      const next = applyGrowthReward(prev, entryId);
      if (next !== prev) saveTreeState(next); // only save if something changed
      return next;
    });
  }, []);

  return (
    <TreeContext.Provider value={{ treeState, isLoaded, selectTree, awardGrowth }}>
      {children}
    </TreeContext.Provider>
  );
}

export function useTree() {
  const ctx = useContext(TreeContext);
  if (!ctx) throw new Error("useTree must be used within TreeProvider");
  return ctx;
}
