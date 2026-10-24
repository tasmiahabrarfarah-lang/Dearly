"use client";

/**
 * components/profile/useProfile.ts
 * Client-side hook that loads the authenticated user's own profile.
 *
 * On a "no rows" result the hook calls ensureProfileExists() server action
 * to create the row, then reloads automatically.  This handles accounts
 * that pre-date the DB trigger.
 */

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ensureProfileExists } from "@/app/profile/actions";
import type { UserProfile } from "@/lib/profile";

export interface UseProfileResult {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  reload: () => void;
}

export function useProfile(): UseProfileResult {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState(0);

  const reload = useCallback(() => setVersion((v) => v + 1), []);

  useEffect(() => {
    let cancelled = false;

    async function fetch() {
      setLoading(true);
      setError(null);

      const supabase = createClient();

      // Get authenticated user
      const {
        data: { user },
        error: authErr,
      } = await supabase.auth.getUser();

      if (authErr || !user) {
        if (!cancelled) {
          setError("Not authenticated.");
          setLoading(false);
        }
        return;
      }

      // Query own profile
      const { data, error: profileErr } = await supabase
        .from("profiles")
        .select("id, display_name, dearly_id, username, profile_title, bio, avatar_key, avatar_accessory, personalization_completed, created_at, updated_at")
        .eq("id", user.id)
        .single();

      if (cancelled) return;

      if (profileErr) {
        // PGRST116 = "no rows" — profile missing; create it via server action
        if (profileErr.code === "PGRST116") {
          const result = await ensureProfileExists();
          if (cancelled) return;
          if ("profile" in result) {
            setProfile(result.profile);
          } else {
            setError(result.error);
          }
          setLoading(false);
          return;
        }
        setError("Could not load your profile. Please refresh.");
        setLoading(false);
        return;
      }

      if (!data) {
        // Shouldn't happen but handle gracefully
        const result = await ensureProfileExists();
        if (cancelled) return;
        if ("profile" in result) {
          setProfile(result.profile);
        } else {
          setError(result.error);
        }
        setLoading(false);
        return;
      }

      setProfile(data as UserProfile);
      setLoading(false);
    }

    void fetch();
    return () => {
      cancelled = true;
    };
  }, [version]);

  return { profile, loading, error, reload };
}
