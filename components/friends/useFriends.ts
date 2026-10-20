"use client";

/**
 * components/friends/useFriends.ts
 * React hook that loads friendship data from Supabase and exposes
 * the current user's friends list and pending requests.
 *
 * Data is fetched client-side (anon key, RLS enforced) so only
 * rows the authenticated user owns are returned.
 */

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ensureProfileExists } from "@/app/profile/actions";
import type { Friend, FriendRequest, PublicProfile } from "@/lib/friends";

interface UseFriendsResult {
  myProfile: PublicProfile | null;
  friends: Friend[];
  incomingRequests: FriendRequest[];
  outgoingRequests: FriendRequest[];
  pendingCount: number;
  loading: boolean;
  error: string | null;
  reload: () => void;
}

export function useFriends(): UseFriendsResult {
  const [myProfile, setMyProfile] = useState<PublicProfile | null>(null);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<FriendRequest[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState(0);

  const reload = useCallback(() => setVersion((v) => v + 1), []);

  useEffect(() => {
    let cancelled = false;

    async function fetchAll() {
      setLoading(true);
      setError(null);

      const supabase = createClient();

      // Get authenticated user
      const { data: { user }, error: authErr } = await supabase.auth.getUser();
      if (authErr || !user) {
        if (!cancelled) {
          setError("Not authenticated.");
          setLoading(false);
        }
        return;
      }

      // Load own profile — if missing, create it via server action then retry
      const { data: profileData, error: profileErr } = await supabase
        .from("profiles")
        .select("id, display_name, dearly_id")
        .eq("id", user.id)
        .single();

      if (cancelled) return;

      if (profileErr || !profileData) {
        // PGRST116 = no rows; attempt to create the missing profile
        if (profileErr?.code === "PGRST116" || !profileData) {
          const ensureResult = await ensureProfileExists();
          if (cancelled) return;
          if ("error" in ensureResult) {
            setError("Could not load your profile. Please refresh.");
            setLoading(false);
            return;
          }
          const p = ensureResult.profile;
          setMyProfile({ id: p.id, display_name: p.display_name, dearly_id: p.dearly_id });
        } else {
          setError("Could not load your profile. Please refresh.");
          setLoading(false);
          return;
        }
      } else {
        setMyProfile({
          id: profileData.id,
          display_name: profileData.display_name,
          dearly_id: profileData.dearly_id,
        });
      }

      // Load all friendship rows involving this user
      const { data: rows, error: rowsErr } = await supabase
        .from("friendships")
        .select(`
          id,
          requester_id,
          addressee_id,
          status,
          created_at,
          requester:profiles!friendships_requester_id_fkey(id, display_name, dearly_id),
          addressee:profiles!friendships_addressee_id_fkey(id, display_name, dearly_id)
        `)
        .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`);

      if (cancelled) return;

      if (rowsErr) {
        setError("Could not load friends data.");
        setLoading(false);
        return;
      }

      const newFriends: Friend[] = [];
      const incoming: FriendRequest[] = [];
      const outgoing: FriendRequest[] = [];

      for (const row of rows ?? []) {
        const isRequester = row.requester_id === user.id;

        // The other party's profile
        // Supabase join may return an array or a single object depending on the FK setup.
        // Normalise to a single object.
        const addresseeRaw = row.addressee as unknown;
        const requesterRaw = row.requester as unknown;
        type RawProfile = { id: string; display_name: string; dearly_id: string };
        const normalize = (v: unknown): RawProfile | null => {
          if (!v) return null;
          if (Array.isArray(v)) return (v as RawProfile[])[0] ?? null;
          return v as RawProfile;
        };
        const otherRaw = isRequester ? normalize(addresseeRaw) : normalize(requesterRaw);

        if (!otherRaw) continue;
        const otherProfile: PublicProfile = {
          id: otherRaw.id,
          display_name: otherRaw.display_name,
          dearly_id: otherRaw.dearly_id,
        };

        if (row.status === "accepted") {
          newFriends.push({ friendship_id: row.id, profile: otherProfile });
        } else if (row.status === "pending") {
          if (isRequester) {
            outgoing.push({
              friendship_id: row.id,
              other_user: otherProfile,
              direction: "sent",
              created_at: row.created_at,
            });
          } else {
            incoming.push({
              friendship_id: row.id,
              other_user: otherProfile,
              direction: "received",
              created_at: row.created_at,
            });
          }
        }
      }

      if (!cancelled) {
        setFriends(newFriends);
        setIncomingRequests(incoming);
        setOutgoingRequests(outgoing);
        setLoading(false);
      }
    }

    void fetchAll();
    return () => { cancelled = true; };
  }, [version]);

  return {
    myProfile,
    friends,
    incomingRequests,
    outgoingRequests,
    pendingCount: incomingRequests.length,
    loading,
    error,
    reload,
  };
}
