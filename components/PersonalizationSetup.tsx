"use client";

import { useEffect, useState, useTransition } from "react";
import { Check, Loader2, Sparkles } from "lucide-react";
import { AVATAR_KEYS, type AvatarAccessory, type AvatarKey } from "@/lib/profile";
import { AVATAR_LABELS, AvatarImage } from "@/components/profile/avatars";
import { DEFAULT_DIARY_DESIGN, DESIGN_PRESETS, DECORATION_LABELS, announceDiaryDesign, designFromPreset, type DiaryDesign } from "@/lib/diaryDesign";
import DiaryCover from "@/components/diary/DiaryCover";
import { savePersonalizationSetup } from "@/app/profile/actions";
import { useProfile } from "@/components/profile/useProfile";

const ACCESSORIES: AvatarAccessory[] = ["none", "glasses", "flower", "bow"];

export default function PersonalizationSetup({ onComplete }: { onComplete: () => void }) {
  const { profile } = useProfile();
  const [avatar, setAvatar] = useState<AvatarKey>("fox");
  const [accessory, setAccessory] = useState<AvatarAccessory>("none");
  const [design, setDesign] = useState<DiaryDesign>(DEFAULT_DIARY_DESIGN);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (!profile) return;
    setAvatar(profile.avatar_key);
    setAccessory(profile.avatar_accessory ?? "none");
  }, [profile]);

  function choosePreset(id: string) {
    setDesign(designFromPreset(id));
  }

  function finish() {
    setError("");
    startTransition(async () => {
      const result = await savePersonalizationSetup({ avatar_key: avatar, avatar_accessory: accessory, diary_design: design });
      if (result.error) { setError(result.error); return; }
      announceDiaryDesign(design); // home-screen diary shows the new cover immediately
      onComplete();
    });
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#211833]/55 p-3 sm:p-6" role="dialog" aria-modal="true" aria-labelledby="personalization-title">
      <section className="flex max-h-[min(92dvh,900px)] w-full max-w-2xl flex-col overflow-hidden rounded-3xl shadow-2xl" style={{ background: "var(--palette-surface)", border: "1px solid var(--palette-surface-border)" }}>
        <header className="flex-shrink-0 px-5 py-4 sm:px-7" style={{ borderBottom: "1px solid var(--palette-surface-border)" }}>
          <div className="flex items-center gap-2" style={{ color: "var(--palette-accent)" }}><Sparkles size={17} aria-hidden /><span className="text-xs font-semibold uppercase tracking-wider">A little personalization</span></div>
          <h1 id="personalization-title" className="mt-1 text-xl font-semibold" style={{ color: "var(--palette-text-primary)" }}>Make your world yours</h1>
          <p className="mt-1 text-sm" style={{ color: "var(--palette-text-muted)" }}>Choose an avatar and a diary cover to begin. You can change both any time.</p>
        </header>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-5 sm:px-7">
          <section aria-labelledby="setup-avatar-heading">
            <h2 id="setup-avatar-heading" className="mb-2 text-sm font-semibold" style={{ color: "var(--palette-text-primary)" }}>Your avatar</h2>
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
              {AVATAR_KEYS.map((key) => <button key={key} type="button" aria-pressed={avatar === key} aria-label={AVATAR_LABELS[key]} onClick={() => setAvatar(key)} className="relative aspect-square overflow-hidden rounded-2xl" style={{ border: `2px solid ${avatar === key ? "var(--palette-accent)" : "var(--palette-surface-border)"}`, background: "var(--palette-ground)" }}><AvatarImage avatarKey={key} accessory={accessory} className="h-full w-full" />{avatar === key && <span className="absolute right-1 top-1 rounded-full p-0.5 text-white" style={{ background: "var(--palette-accent)" }}><Check size={10}/></span>}</button>)}
            </div>
            <div className="mt-2 flex flex-wrap gap-2">{ACCESSORIES.map((item) => <button key={item} type="button" aria-pressed={accessory === item} onClick={() => setAccessory(item)} className="rounded-xl px-3 py-1.5 text-xs capitalize" style={{ color: "var(--palette-text-primary)", background: "var(--palette-ground)", border: `1px solid ${accessory === item ? "var(--palette-accent)" : "var(--palette-surface-border)"}` }}>{item}</button>)}</div>
          </section>

          <section aria-labelledby="setup-diary-heading">
            <h2 id="setup-diary-heading" className="mb-2 text-sm font-semibold" style={{ color: "var(--palette-text-primary)" }}>Your diary cover</h2>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {Object.entries(DESIGN_PRESETS).map(([id, preset]) => <button key={id} type="button" aria-pressed={design.preset_id === id} onClick={() => choosePreset(id)} className="flex items-center gap-3 rounded-2xl p-3 text-left" style={{ background: "var(--palette-ground)", border: `2px solid ${design.preset_id === id ? "var(--palette-accent)" : "var(--palette-surface-border)"}` }}>
                <DiaryCover design={designFromPreset(id)} shadow={false} className="h-auto w-16 flex-shrink-0" />
                <span className="min-w-0"><span className="block text-sm font-medium" style={{ color: "var(--palette-text-primary)" }}>{preset.label}</span><span className="mt-0.5 block text-xs" style={{ color: "var(--palette-text-muted)" }}>{preset.decoration_ids.map((d) => DECORATION_LABELS[d]).join(" · ")}</span></span>
                {design.preset_id === id && <Check className="ml-auto flex-shrink-0" size={16} style={{ color: "var(--palette-accent)" }}/>}</button>)}
            </div>
          </section>
          {error && <p role="alert" className="rounded-xl px-3 py-2 text-sm" style={{ color: "#a93246", background: "#fff0f1" }}>{error}</p>}
        </div>

        <footer className="flex-shrink-0 px-5 py-4 sm:px-7" style={{ borderTop: "1px solid var(--palette-surface-border)" }}>
          <button type="button" disabled={pending} onClick={finish} className="w-full rounded-2xl px-4 py-3 text-sm font-semibold text-white disabled:opacity-60" style={{ background: "var(--palette-accent)" }}>{pending ? <><Loader2 size={15} className="mr-2 inline animate-spin"/>Saving your choices…</> : "Save choices and enter Dearly"}</button>
          <p className="mt-2 text-center text-xs" style={{ color: "var(--palette-text-muted)" }}>Your profile and diary settings are saved to your account.</p>
        </footer>
      </section>
    </div>
  );
}
