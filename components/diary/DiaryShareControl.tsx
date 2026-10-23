"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Users, X } from "lucide-react";
import { useFriends } from "@/components/friends/useFriends";
import { createClient } from "@/lib/supabase/client";
import { setDiaryEntryShares } from "@/diary/actions";

export default function DiaryShareControl({ entryId, onRecipientsChanged }: { entryId: string; onRecipientsChanged?: (count: number) => void }) {
  const { friends, loading: friendsLoading, error: friendsError } = useFriends();
  const [open, setOpen] = useState(false);
  const [recipientIds, setRecipientIds] = useState<string[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const friendById = useMemo(() => new Map(friends.map(({ profile }) => [profile.id, profile])), [friends]);

  const loadRecipients = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const { data, error: queryError } = await supabase
        .from("diary_entry_shares")
        .select("recipient_id")
        .eq("entry_id", entryId);
      if (queryError) throw queryError;
      const ids = (data ?? []).map((row) => row.recipient_id as string);
      setRecipientIds(ids);
      setSelectedIds(ids);
      // NOTE: deliberately NOT calling onRecipientsChanged here. Reporting "0 recipients"
      // on mount made the parent snap the audience back to "only_me" the moment the
      // user picked "Selected Friends", so the picker could never stay on that option.
    } catch {
      setError("Couldn't load sharing details. Make sure the diary sharing migration is installed.");
    } finally {
      setLoading(false);
    }
  }, [entryId]);

  useEffect(() => { void loadRecipients(); }, [loadRecipients]);

  const selectAll = () => setSelectedIds(friends.map(({ profile }) => profile.id));
  const clearAll = () => setSelectedIds([]);
  const toggle = (id: string) => setSelectedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);

  const save = async () => {
    if (recipientIds.length > 0 && selectedIds.length === 0 && !window.confirm("Stop sharing this entry with everyone? They will no longer be able to open it.")) return;
    setSaving(true);
    setError(null);
    setMessage(null);
    const result = await setDiaryEntryShares(entryId, selectedIds);
    setSaving(false);
    if (result.error) { setError(result.error); return; }
    setRecipientIds(selectedIds);
    onRecipientsChanged?.(selectedIds.length);
    setMessage(selectedIds.length ? "Sharing updated." : "This entry is private now.");
    setOpen(false);
  };

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      {recipientIds.length > 0 && (
        <span className="text-xs" style={{ color: "var(--palette-text-muted)" }}>
          Shared with {recipientIds.map((id) => friendById.get(id)?.display_name ?? "a friend").join(", ")}
        </span>
      )}
      <button
        type="button"
        onClick={() => { setMessage(null); setOpen(true); void loadRecipients(); }}
        className="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-medium glass hover:bg-[var(--palette-ground)] focus-visible:outline-none focus-visible:ring-2"
        style={{ color: "var(--palette-text-primary)" }}
      >
        <Users size={14} aria-hidden />
        {recipientIds.length ? "Manage sharing" : "Share with friends"}
      </button>
      {message && <span role="status" className="text-xs" style={{ color: "var(--palette-text-muted)" }}>{message}</span>}
      {error && <span role="alert" className="w-full text-right text-xs text-red-700">{error}</span>}

      {open && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="share-entry-title" className="w-full max-w-md rounded-3xl p-5 shadow-2xl" style={{ background: "var(--palette-surface)", color: "var(--palette-text-primary)", border: "1px solid var(--palette-surface-border)" }}>
            <header className="mb-3 flex items-center justify-between">
              <div>
                <h2 id="share-entry-title" className="text-lg font-semibold">Share with friends</h2>
                <p className="text-xs" style={{ color: "var(--palette-text-muted)" }}>Only selected friends can read this entry.</p>
              </div>
              <button type="button" onClick={() => setOpen(false)} aria-label="Cancel sharing changes" className="rounded-lg p-2 hover:bg-[var(--palette-ground)]"><X size={18} /></button>
            </header>
            {!loading && !friendsLoading && !friendsError && friends.length > 0 && (
              <div className="mb-2 flex gap-3 text-xs font-medium" style={{ color: "var(--palette-accent)" }}>
                <button type="button" onClick={selectAll} className="underline-offset-2 hover:underline">Select all friends</button>
                <button type="button" onClick={clearAll} className="underline-offset-2 hover:underline">Clear</button>
              </div>
            )}
            <div className="max-h-64 overflow-y-auto rounded-2xl p-2" style={{ background: "rgba(255,255,255,0.46)" }}>
              {loading || friendsLoading ? <p className="p-3 text-sm">Loading your friends…</p> : friendsError ? (
                <p role="alert" className="p-3 text-sm text-red-700">{friendsError}</p>
              ) : friends.length === 0 ? (
                <p className="p-3 text-sm" style={{ color: "var(--palette-text-muted)" }}>You don&apos;t have any accepted friends to share with yet.</p>
              ) : friends.map(({ profile }) => (
                <label key={profile.id} className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 hover:bg-[var(--palette-ground)]">
                  <input type="checkbox" checked={selectedIds.includes(profile.id)} onChange={() => toggle(profile.id)} className="h-4 w-4 accent-[var(--palette-accent)]" />
                  <span className="min-w-0"><span className="block text-sm font-medium">{profile.display_name}</span><span className="block text-xs" style={{ color: "var(--palette-text-muted)" }}>@{profile.dearly_id}</span></span>
                  {recipientIds.includes(profile.id) && <span className="ml-auto text-xs" style={{ color: "var(--palette-accent)" }}>Can read</span>}
                </label>
              ))}
            </div>
            <p className="mt-3 text-xs" style={{ color: "var(--palette-text-muted)" }}>You can change access anytime. Revoking access won&apos;t remove copies someone has already seen.</p>
            {error && <p role="alert" className="mt-2 text-sm text-red-700">{error}</p>}
            <footer className="mt-4 flex justify-end gap-2">
              <button type="button" onClick={() => setOpen(false)} className="rounded-xl px-4 py-2 text-sm font-medium glass">Cancel</button>
              <button type="button" disabled={saving || loading || friendsLoading || !!friendsError || !!error} onClick={() => void save()} className="rounded-xl px-4 py-2 text-sm font-semibold text-white disabled:opacity-50" style={{ background: "var(--palette-accent)" }}>{saving ? "Saving…" : "Save sharing"}</button>
            </footer>
          </section>
        </div>
      )}
    </div>
  );
}
