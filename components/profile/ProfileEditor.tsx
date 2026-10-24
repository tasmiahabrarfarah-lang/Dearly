"use client";

/**
 * components/profile/ProfileEditor.tsx
 * Full profile customisation panel.
 *
 * Displays in the "My Profile" overlay panel.
 * Allows the user to change: display name, bio, avatar.
 * Dearly ID is shown as read-only with a copy button.
 */

import React, { useState, useTransition, useEffect } from "react";
import { Check, Copy, Loader2, Save, X } from "lucide-react";
import { useProfile } from "./useProfile";
import { AvatarImage, AVATAR_LABELS } from "./avatars";
import { updateProfile } from "@/app/profile/actions";
import { AVATAR_KEYS, PROFILE_CONSTRAINTS, validateUsername } from "@/lib/profile";
import type { AvatarKey, AvatarAccessory } from "@/lib/profile";

export default function ProfileEditor() {
  const { profile, loading, error, reload } = useProfile();

  // ── Edit state ──────────────────────────────────────────────────────────
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [username, setUsername] = useState("");
  const [profileTitle, setProfileTitle] = useState("");
  const [avatarKey, setAvatarKey] = useState<AvatarKey>("fox");
  const [accessory, setAccessory] = useState<AvatarAccessory>("none");
  const [isDirty, setIsDirty] = useState(false);

  // ── Action state ────────────────────────────────────────────────────────
  const [isPending, startTransition] = useTransition();
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  // Sync local state when profile loads (or reloads)
  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name);
      setBio(profile.bio ?? "");
      setUsername(profile.username ?? "");
      setProfileTitle(profile.profile_title ?? "");
      setAvatarKey((profile.avatar_key as AvatarKey) ?? "fox");
      setAccessory(profile.avatar_accessory ?? "none");
      setIsDirty(false);
      setSaveError(null);
      setSaveSuccess(false);
    }
  }, [profile]);

  function markDirty() {
    setIsDirty(true);
    setSaveSuccess(false);
  }

  function handleCancel() {
    if (!profile) return;
    setDisplayName(profile.display_name);
    setBio(profile.bio ?? "");
    setUsername(profile.username ?? "");
    setProfileTitle(profile.profile_title ?? "");
    setAvatarKey((profile.avatar_key as AvatarKey) ?? "fox");
    setAccessory(profile.avatar_accessory ?? "none");
    setIsDirty(false);
    setSaveError(null);
    setSaveSuccess(false);
  }

  function handleSave() {
    setSaveError(null);
    setSaveSuccess(false);

    // Client-side validation
    const trimmedName = displayName.trim();
    if (
      trimmedName.length < PROFILE_CONSTRAINTS.displayName.min ||
      trimmedName.length > PROFILE_CONSTRAINTS.displayName.max
    ) {
      setSaveError(
        `Display name must be ${PROFILE_CONSTRAINTS.displayName.min}–${PROFILE_CONSTRAINTS.displayName.max} characters.`
      );
      return;
    }
    if (bio.length > PROFILE_CONSTRAINTS.bio.max) {
      setSaveError(`Bio must be ${PROFILE_CONSTRAINTS.bio.max} characters or fewer.`);
      return;
    }
    if (username.trim() && validateUsername(username)) { setSaveError(validateUsername(username)); return; }
    if (profileTitle.length > PROFILE_CONSTRAINTS.profileTitle.max) { setSaveError("Profile title must be 40 characters or fewer."); return; }

    startTransition(async () => {
      const result = await updateProfile({
        display_name: trimmedName,
        bio: bio.trim(),
        avatar_key: avatarKey,
        username: username.trim().replace(/^@/, "").toLowerCase(),
        profile_title: profileTitle.trim(),
        avatar_accessory: accessory,
      });

      if (result.error) {
        setSaveError(result.error);
        return;
      }

      setSaveSuccess(true);
      setIsDirty(false);
      reload(); // re-sync with server value
    });
  }

  function handleCopyId() {
    if (!profile) return;
    navigator.clipboard.writeText(`@${profile.dearly_id}`).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  // ── Loading state ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-14 gap-3">
        <Loader2
          size={22}
          className="animate-spin"
          style={{ color: "var(--palette-accent)" }}
        />
        <p className="text-sm" style={{ color: "var(--palette-text-muted)" }}>
          Loading your profile…
        </p>
      </div>
    );
  }

  // ── Error state ─────────────────────────────────────────────────────────
  if (error || !profile) {
    return (
      <div className="flex flex-col items-center text-center gap-4 py-10">
        <p className="text-sm" style={{ color: "#b04040" }} role="alert">
          {error ?? "Could not load your profile."}
        </p>
        <button
          onClick={reload}
          className="px-4 py-2 rounded-xl text-sm font-medium"
          style={{
            background: "var(--palette-ground)",
            color: "var(--palette-text-primary)",
          }}
        >
          Try again
        </button>
      </div>
    );
  }

  const bioRemaining = PROFILE_CONSTRAINTS.bio.max - bio.length;

  return (
    <div className="flex flex-col gap-5">

      <section className="flex items-center gap-3 rounded-2xl p-3" style={{ background: "var(--palette-ground)", border: "1px solid var(--palette-surface-border)" }} aria-label="Profile preview">
        <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0"><AvatarImage avatarKey={avatarKey} accessory={accessory} className="w-full h-full" /></div>
        <div className="min-w-0"><p className="text-sm font-semibold truncate" style={{ color: "var(--palette-text-primary)" }}>{displayName || "Your name"}</p><p className="text-xs truncate" style={{ color: "var(--palette-text-muted)" }}>{username ? `@${username.replace(/^@/, "")}` : "Choose a username"}{profileTitle ? ` · ${profileTitle}` : ""}</p>{bio && <p className="text-xs truncate mt-0.5" style={{ color: "var(--palette-text-muted)" }}>{bio}</p>}</div>
      </section>

      {/* ── Avatar picker ─────────────────────────────────────── */}
      <section aria-labelledby="avatar-label">
        <p
          id="avatar-label"
          className="text-xs font-semibold uppercase tracking-wider mb-3"
          style={{ color: "var(--palette-text-muted)" }}
        >
          Avatar
        </p>
        <div className="grid grid-cols-4 gap-2.5" role="radiogroup" aria-labelledby="avatar-label">
          {AVATAR_KEYS.map((key) => {
            const selected = avatarKey === key;
            return (
              <button
                key={key}
                role="radio"
                aria-checked={selected}
                aria-label={AVATAR_LABELS[key]}
                onClick={() => {
                  setAvatarKey(key);
                  markDirty();
                }}
                className="relative rounded-2xl overflow-hidden transition-all active:scale-95"
                style={{
                  aspectRatio: "1",
                  border: `2px solid ${selected ? "var(--palette-accent)" : "var(--palette-surface-border)"}`,
                  boxShadow: selected ? "0 0 0 2px var(--palette-accent-soft)" : "none",
                }}
              >
                <AvatarImage avatarKey={key} accessory={accessory} className="w-full h-full" />
                {selected && (
                  <span
                    className="absolute bottom-0.5 right-0.5 w-4 h-4 rounded-full flex items-center justify-center"
                    style={{ background: "var(--palette-accent)" }}
                    aria-hidden
                  >
                    <Check size={9} color="#fff" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </section>

      <section aria-label="Avatar accessory" className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--palette-text-muted)" }}>Accessory</p>
        <div className="flex flex-wrap gap-2">{(["none", "glasses", "flower", "bow"] as const).map((item) => <button key={item} type="button" aria-pressed={accessory === item} onClick={() => { setAccessory(item); markDirty(); }} className="rounded-xl px-3 py-2 text-xs capitalize" style={{ color: "var(--palette-text-primary)", border: `1px solid ${accessory === item ? "var(--palette-accent)" : "var(--palette-surface-border)"}`, background: "var(--palette-ground)" }}>{item}</button>)}</div>
      </section>

      {/* ── Display name ──────────────────────────────────────── */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="display-name"
          className="text-xs font-semibold uppercase tracking-wider"
          style={{ color: "var(--palette-text-muted)" }}
        >
          Display Name
        </label>
        <input
          id="display-name"
          type="text"
          value={displayName}
          maxLength={PROFILE_CONSTRAINTS.displayName.max}
          onChange={(e) => {
            setDisplayName(e.target.value);
            markDirty();
          }}
          placeholder="Your name"
          className="w-full px-3 py-2.5 rounded-xl text-sm"
          style={{
            background: "var(--palette-ground)",
            border: "1px solid var(--palette-surface-border)",
            color: "var(--palette-text-primary)",
          }}
          aria-describedby="name-hint"
        />
        <p
          id="name-hint"
          className="text-xs"
          style={{ color: "var(--palette-text-muted)" }}
        >
          Up to {PROFILE_CONSTRAINTS.displayName.max} characters
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="profile-username" className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--palette-text-muted)" }}>Username</label>
        <input id="profile-username" value={username} maxLength={20} onChange={(e) => { setUsername(e.target.value); markDirty(); }} placeholder="your_name" className="w-full px-3 py-2.5 rounded-xl text-sm" style={{ background: "var(--palette-ground)", border: "1px solid var(--palette-surface-border)", color: "var(--palette-text-primary)" }} />
        <p className="text-xs" style={{ color: "var(--palette-text-muted)" }}>3–20 lowercase letters, numbers, or underscores. Your Dearly ID stays the same.</p>
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="profile-title" className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--palette-text-muted)" }}>Profile title</label>
        <input id="profile-title" value={profileTitle} maxLength={40} onChange={(e) => { setProfileTitle(e.target.value); markDirty(); }} placeholder="Keeper of little things" className="w-full px-3 py-2.5 rounded-xl text-sm" style={{ background: "var(--palette-ground)", border: "1px solid var(--palette-surface-border)", color: "var(--palette-text-primary)" }} />
      </div>

      {/* ── Bio ───────────────────────────────────────────────── */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="bio"
          className="text-xs font-semibold uppercase tracking-wider"
          style={{ color: "var(--palette-text-muted)" }}
        >
          About Me <span className="font-normal normal-case">(optional)</span>
        </label>
        <textarea
          id="bio"
          value={bio}
          maxLength={PROFILE_CONSTRAINTS.bio.max}
          rows={3}
          onChange={(e) => {
            setBio(e.target.value);
            markDirty();
          }}
          placeholder="A few words about yourself…"
          className="w-full px-3 py-2.5 rounded-xl text-sm resize-none leading-relaxed"
          style={{
            background: "var(--palette-ground)",
            border: "1px solid var(--palette-surface-border)",
            color: "var(--palette-text-primary)",
          }}
        />
        <p
          className="text-xs text-right"
          style={{
            color: bioRemaining < 20 ? "#b05050" : "var(--palette-text-muted)",
          }}
        >
          {bioRemaining} characters remaining
        </p>
      </div>

      {/* ── Dearly ID (read-only) ──────────────────────────────── */}
      <div
        className="rounded-2xl px-4 py-3 flex items-center justify-between gap-3"
        style={{
          background: "var(--palette-ground)",
          border: "1px solid var(--palette-surface-border)",
        }}
      >
        <div className="min-w-0">
          <p
            className="text-xs font-semibold uppercase tracking-wider mb-0.5"
            style={{ color: "var(--palette-text-muted)" }}
          >
            Your Dearly ID
          </p>
          <p
            className="text-sm font-semibold truncate"
            style={{ color: "var(--palette-text-primary)" }}
          >
            {profile.dearly_id ? `@${profile.dearly_id}` : "—"}
          </p>
          <p className="text-xs mt-0.5" style={{ color: "var(--palette-text-muted)" }}>
            Share this with friends to connect.
          </p>
        </div>
        {profile.dearly_id && (
          <button
            onClick={handleCopyId}
            aria-label={copied ? "Copied!" : "Copy your Dearly ID"}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all active:scale-95 flex-shrink-0"
            style={{
              background: copied ? "#6baf7a" : "var(--palette-surface)",
              border: "1px solid var(--palette-surface-border)",
              color: copied ? "#fff" : "var(--palette-text-muted)",
            }}
          >
            {copied ? <Check size={11} aria-hidden /> : <Copy size={11} aria-hidden />}
            <span>{copied ? "Copied!" : "Copy"}</span>
          </button>
        )}
      </div>

      {/* ── Error / success feedback ───────────────────────────── */}
      {saveError && (
        <p
          className="text-sm rounded-xl px-3 py-2"
          role="alert"
          style={{ background: "#fef0f0", color: "#b04040" }}
        >
          {saveError}
        </p>
      )}
      {saveSuccess && !isDirty && (
        <p
          className="text-sm rounded-xl px-3 py-2 flex items-center gap-2"
          role="status"
          style={{ background: "#f0fef4", color: "#2a7040" }}
        >
          <Check size={14} aria-hidden />
          Profile saved!
        </p>
      )}

      {/* ── Actions ────────────────────────────────────────────── */}
      {isDirty && (
        <div className="flex gap-2">
          <button
            onClick={handleCancel}
            disabled={isPending}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium transition-all active:scale-95 disabled:opacity-50"
            style={{
              background: "var(--palette-ground)",
              border: "1px solid var(--palette-surface-border)",
              color: "var(--palette-text-muted)",
            }}
          >
            <X size={14} aria-hidden />
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isPending}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-95 disabled:opacity-60"
            style={{ background: "var(--palette-accent)", color: "#fff" }}
          >
            {isPending ? (
              <Loader2 size={14} className="animate-spin" aria-hidden />
            ) : (
              <Save size={14} aria-hidden />
            )}
            <span>{isPending ? "Saving…" : "Save Changes"}</span>
          </button>
        </div>
      )}

      {!isDirty && !saveSuccess && (
        <p
          className="text-xs text-center"
          style={{ color: "var(--palette-text-muted)" }}
        >
          Make a change above to edit your profile.
        </p>
      )}
    </div>
  );
}
