"use server";

import { createClient } from "@/lib/supabase/server";

export type NotificationKind = "friend_request" | "friend_accepted" | "little_note";
export interface DearlyNotification {
  id: string;
  kind: NotificationKind;
  resource_id: string | null;
  created_at: string;
  read_at: string | null;
}
export interface NotificationPreferences {
  friend_activity: boolean;
  little_notes: boolean;
}

async function currentClient() {
  const supabase = createClient();
  if (!supabase) return { error: "Notifications need a configured database." } as const;
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return { error: "Please sign in to view notifications." } as const;
  return { supabase, user } as const;
}

export async function getNotifications(): Promise<{ notifications?: DearlyNotification[]; preferences?: NotificationPreferences; error?: string }> {
  const auth = await currentClient();
  if ("error" in auth) return { error: auth.error };
  const [notificationsResult, preferencesResult] = await Promise.all([
    auth.supabase.from("notifications").select("id, kind, resource_id, created_at, read_at")
      .eq("recipient_id", auth.user.id).order("created_at", { ascending: false }).limit(50),
    auth.supabase.from("notification_preferences").select("friend_activity, little_notes")
      .eq("user_id", auth.user.id).maybeSingle(),
  ]);
  if (notificationsResult.error) {
    if (notificationsResult.error.code === "42P01" || notificationsResult.error.code === "PGRST205") {
      return { error: "Apply the notifications migration to enable your inbox." };
    }
    return { error: "Couldn't load your notifications. Please try again." };
  }
  if (preferencesResult.error && preferencesResult.error.code !== "42P01" && preferencesResult.error.code !== "PGRST205") {
    return { error: "Couldn't load notification preferences." };
  }
  return {
    notifications: (notificationsResult.data ?? []) as DearlyNotification[],
    preferences: (preferencesResult.data ?? { friend_activity: true, little_notes: true }) as NotificationPreferences,
  };
}

export async function markNotificationRead(id: string): Promise<{ success?: true; error?: string }> {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) return { error: "Invalid notification." };
  const auth = await currentClient();
  if ("error" in auth) return { error: auth.error };
  const { error } = await auth.supabase.from("notifications").update({ read_at: new Date().toISOString() })
    .eq("id", id).eq("recipient_id", auth.user.id).is("read_at", null);
  return error ? { error: "Couldn't update this notification." } : { success: true };
}

export async function markAllNotificationsRead(): Promise<{ success?: true; error?: string }> {
  const auth = await currentClient();
  if ("error" in auth) return { error: auth.error };
  const { error } = await auth.supabase.from("notifications").update({ read_at: new Date().toISOString() })
    .eq("recipient_id", auth.user.id).is("read_at", null);
  return error ? { error: "Couldn't mark notifications as read." } : { success: true };
}

export async function updateNotificationPreference(category: keyof NotificationPreferences, enabled: boolean): Promise<{ success?: true; error?: string }> {
  if (category !== "friend_activity" && category !== "little_notes") return { error: "Invalid preference." };
  const auth = await currentClient();
  if ("error" in auth) return { error: auth.error };
  const { data: current, error: readError } = await auth.supabase.from("notification_preferences")
    .select("friend_activity, little_notes").eq("user_id", auth.user.id).maybeSingle();
  if (readError) return { error: "Couldn't save this preference." };
  const values = {
    user_id: auth.user.id,
    friend_activity: category === "friend_activity" ? enabled : current?.friend_activity ?? true,
    little_notes: category === "little_notes" ? enabled : current?.little_notes ?? true,
    updated_at: new Date().toISOString(),
  };
  const { error } = await auth.supabase.from("notification_preferences").upsert(values, { onConflict: "user_id" });
  return error ? { error: "Couldn't save this preference." } : { success: true };
}
