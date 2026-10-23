"use client";

import { useCallback, useEffect, useState } from "react";
import { Bell, Check, Heart, MessageCircle, Users } from "lucide-react";
import { getNotifications, markAllNotificationsRead, markNotificationRead, updateNotificationPreference, type DearlyNotification, type NotificationPreferences } from "@/app/notifications/actions";

const copy = {
  friend_request: { text: "You have a new friend request.", Icon: Users, destination: "friends" as const },
  friend_accepted: { text: "Your friend request was accepted.", Icon: Heart, destination: "friends" as const },
  little_note: { text: "A friend left you a little note.", Icon: MessageCircle, destination: "diary" as const },
};

function timeAgo(value: string) {
  const elapsed = Math.max(0, Date.now() - new Date(value).getTime());
  const minutes = Math.floor(elapsed / 60_000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return days < 7 ? `${days}d ago` : new Date(value).toLocaleDateString();
}

export default function NotificationsPanelContent({ onNavigate }: { onNavigate: (destination: "friends" | "diary", entryId?: string) => void }) {
  const [items, setItems] = useState<DearlyNotification[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreferences>({ friend_activity: true, little_notes: true });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const unreadCount = items.filter((item) => !item.read_at).length;

  const refresh = useCallback(async () => {
    const result = await getNotifications();
    if (result.error) setError(result.error);
    else {
      setError(null);
      setItems(result.notifications ?? []);
      if (result.preferences) setPreferences(result.preferences);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
    const timer = window.setInterval(() => { if (document.visibilityState === "visible") void refresh(); }, 60_000);
    const focus = () => { if (document.visibilityState === "visible") void refresh(); };
    window.addEventListener("focus", focus);
    return () => { window.clearInterval(timer); window.removeEventListener("focus", focus); };
  }, [refresh]);

  const markRead = async (item: DearlyNotification) => {
    if (item.read_at) return;
    const result = await markNotificationRead(item.id);
    if (result.error) setError(result.error);
    else setItems((current) => current.map((entry) => entry.id === item.id ? { ...entry, read_at: new Date().toISOString() } : entry));
  };

  const markAll = async () => {
    setSaving(true);
    const result = await markAllNotificationsRead();
    if (result.error) setError(result.error);
    else setItems((current) => current.map((item) => ({ ...item, read_at: item.read_at ?? new Date().toISOString() })));
    setSaving(false);
  };

  const togglePreference = async (key: keyof NotificationPreferences) => {
    const next = !preferences[key];
    setPreferences((current) => ({ ...current, [key]: next }));
    const result = await updateNotificationPreference(key, next);
    if (result.error) {
      setPreferences((current) => ({ ...current, [key]: !next }));
      setError(result.error);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-xs" style={{ color: "var(--palette-text-muted)" }} aria-live="polite">{unreadCount ? `${unreadCount} unread message${unreadCount === 1 ? "" : "s"}` : "A quiet little corner"}</p>
        {!!unreadCount && <button type="button" onClick={markAll} disabled={saving} className="text-xs font-semibold hover:underline" style={{ color: "var(--palette-accent)" }}>Mark all as read</button>}
      </div>
      {loading && <p role="status" className="py-8 text-center text-sm" style={{ color: "var(--palette-text-muted)" }}>Gathering your messages…</p>}
      {error && <p role="alert" className="rounded-xl px-3 py-2 text-sm" style={{ color: "#a33", background: "rgba(180,40,50,.08)" }}>{error}<button className="ml-2 underline" onClick={() => { setLoading(true); void refresh(); }}>Try again</button></p>}
      {!loading && !error && items.length === 0 && <div className="flex flex-col items-center gap-3 py-8 text-center"><span className="flex h-14 w-14 items-center justify-center rounded-2xl" style={{ background: "var(--palette-ground)" }}><Bell size={24} style={{ color: "var(--palette-accent)" }} aria-hidden="true" /></span><div><p className="font-semibold" style={{ color: "var(--palette-text-primary)" }}>No messages just yet</p><p className="mt-1 text-sm" style={{ color: "var(--palette-text-muted)" }}>When a friend reaches out, you’ll find a little note here.</p></div></div>}
      {!loading && !error && items.length > 0 && <ul className="flex flex-col gap-2">{items.map((item) => {
        const details = copy[item.kind];
        const Icon = details?.Icon ?? Bell;
        return <li key={item.id}><button type="button" onClick={async () => { await markRead(item); onNavigate(details?.destination ?? "friends", item.kind === "little_note" ? item.resource_id ?? undefined : undefined); }} className="flex w-full items-start gap-3 rounded-2xl px-3 py-3 text-left transition-colors hover:bg-[var(--palette-ground)]" style={{ background: item.read_at ? "transparent" : "var(--palette-ground)", color: "var(--palette-text-primary)" }}><span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" style={{ background: "var(--palette-surface)", color: "var(--palette-accent)" }}><Icon size={17} aria-hidden="true" /></span><span className="min-w-0 flex-1"><span className="block text-sm leading-snug">{details?.text ?? "A little message is waiting for you."}</span><span className="mt-1 block text-xs" style={{ color: "var(--palette-text-muted)" }}>{timeAgo(item.created_at)}</span></span>{item.read_at ? <Check size={14} className="mt-1 shrink-0" style={{ color: "var(--palette-text-muted)" }} aria-label="Read" /> : <span className="mt-2 h-2 w-2 shrink-0 rounded-full" style={{ background: "var(--palette-accent)" }} aria-label="Unread" />}</button></li>;
      })}</ul>}
      <div className="mt-2 border-t pt-3" style={{ borderColor: "var(--palette-surface-border)" }}><p className="mb-2 text-xs font-semibold" style={{ color: "var(--palette-text-muted)" }}>Little notification wishes</p>{(["friend_activity", "little_notes"] as const).map((key) => <label key={key} className="flex cursor-pointer items-center justify-between gap-3 py-1.5 text-sm" style={{ color: "var(--palette-text-primary)" }}><span>{key === "friend_activity" ? "Friend requests and acceptances" : "Little note arrivals"}</span><input type="checkbox" checked={preferences[key]} onChange={() => void togglePreference(key)} aria-label={key === "friend_activity" ? "Friend request notifications" : "Little note notifications"} /></label>)}</div>
    </div>
  );
}
