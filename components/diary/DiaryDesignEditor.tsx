"use client";
import React, { useEffect, useState, useTransition } from "react";
import { Check, Loader2, RotateCcw, Save, X } from "lucide-react";
import { getMyDiaryDesign, saveMyDiaryDesign } from "@/app/diary-design/actions";
import {
  BOOKMARK_COLORS, BOOKMARK_COLOR_LABELS, BOOKMARK_STYLES, BOOKMARK_STYLE_LABELS,
  COVER_COLORS, COVER_COLOR_LABELS, DECORATIONS, DECORATION_LABELS, DEFAULT_DIARY_DESIGN,
  DESIGN_PRESETS, MAX_DECORATIONS,
  announceDiaryDesign, designFromPreset, sameDesign, shadeColor, type DiaryDesign,
} from "@/lib/diaryDesign";
import DiaryCover, { BookmarkSwatch, DecorationShape } from "./DiaryCover";

const focusRing = { "--tw-ring-color": "var(--palette-accent)" } as React.CSSProperties;

/* ── One selectable tile. Fixed 2px border so selecting never shifts the layout. ── */
function Tile({ selected, disabled, title, label, onClick, children }: {
  selected: boolean; disabled?: boolean; title?: string; label: string; onClick: () => void; children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      disabled={disabled}
      title={title}
      onClick={onClick}
      className="relative flex min-h-[68px] min-w-0 flex-col items-center justify-center gap-1.5 rounded-xl border-2 px-1.5 py-2 text-center text-[11px] font-medium leading-tight transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-40"
      style={{
        ...focusRing,
        color: "var(--palette-text-primary)",
        background: selected ? "var(--palette-ground)" : "transparent",
        borderColor: selected ? "var(--palette-accent)" : "var(--palette-surface-border)",
      }}
    >
      {children}
      <span className="max-w-full truncate">{label}</span>
      {selected && (
        <span aria-hidden="true" className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full text-white" style={{ background: "var(--palette-accent)" }}>
          <Check size={10} strokeWidth={3} />
        </span>
      )}
    </button>
  );
}

function Group({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <div role="group" aria-label={title}>
      <div className="mb-2 flex items-baseline justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--palette-text-muted)" }}>{title}</p>
        {hint && <p className="text-[11px]" style={{ color: "var(--palette-text-muted)" }}>{hint}</p>}
      </div>
      {children}
    </div>
  );
}

function Swatch({ color }: { color: string }) {
  return <span aria-hidden="true" className="block h-7 w-7 rounded-full" style={{ background: color, boxShadow: `inset 0 0 0 1.5px ${shadeColor(color, -0.22)}` }} />;
}

export default function DiaryDesignEditor() {
  const [saved, setSaved] = useState<DiaryDesign>(DEFAULT_DIARY_DESIGN);
  const [draft, setDraft] = useState<DiaryDesign>(DEFAULT_DIARY_DESIGN);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    let active = true;
    getMyDiaryDesign().then((r) => {
      if (!active) return;
      if (r.design) { setSaved(r.design); setDraft(r.design); } else setError(r.error ?? "Unable to load design.");
      setLoading(false);
    });
    return () => { active = false; };
  }, []);

  const dirty = !sameDesign(saved, draft);

  function change(values: Partial<DiaryDesign>) {
    setDraft((d) => ({ ...d, ...values, preset_id: "custom" }));
    setNotice("");
  }
  function pickPreset(id: string) { setDraft(designFromPreset(id)); setNotice(""); }
  function toggleDecoration(id: string) {
    const has = draft.decoration_ids.includes(id);
    if (!has && draft.decoration_ids.length >= MAX_DECORATIONS) return;
    change({ decoration_ids: has ? draft.decoration_ids.filter((x) => x !== id) : [...draft.decoration_ids, id] });
  }
  function save() {
    setError(""); setNotice("");
    startTransition(async () => {
      const r = await saveMyDiaryDesign(draft);
      if (r.error || !r.design) { setError(r.error ?? "Unable to save."); return; }
      setSaved(r.design); setDraft(r.design); setNotice("Diary design saved.");
      announceDiaryDesign(r.design); // update the diary on the home screen right away
    });
  }

  if (loading) return <p className="text-sm" style={{ color: "var(--palette-text-muted)" }}>Loading your diary…</p>;

  const decoNames = draft.decoration_ids.map((d) => DECORATION_LABELS[d]).join(", ");
  const summary = `${COVER_COLOR_LABELS[draft.cover_color]} cover · ${BOOKMARK_COLOR_LABELS[draft.bookmark_color]} ${BOOKMARK_STYLE_LABELS[draft.bookmark_style].toLowerCase()} bookmark · ${decoNames || "no decorations"}`;

  return (
    <div className="flex flex-col gap-5">
      {/* Live preview — the exact same artwork that appears on your home screen. */}
      <div className="flex items-center gap-3 rounded-2xl p-3" style={{ background: "var(--palette-ground)" }}>
        <DiaryCover design={draft} title="Live preview of your diary" className="h-auto w-32 flex-shrink-0 sm:w-36" />
        <div className="min-w-0">
          <p className="text-sm font-semibold" style={{ color: "var(--palette-text-primary)" }}>Your little diary</p>
          <p className="mt-1 text-xs leading-snug" style={{ color: "var(--palette-text-muted)" }}>{summary}</p>
          <p className="mt-1.5 text-[11px] font-medium" style={{ color: dirty ? "var(--palette-accent)" : "var(--palette-text-muted)" }}>
            {dirty ? "Unsaved changes" : "Saved — this is how it looks at home"}
          </p>
        </div>
      </div>

      <Group title="Starting styles" hint="Pick one, then tweak">
        <div className="grid grid-cols-3 gap-2">
          {Object.entries(DESIGN_PRESETS).map(([id, p]) => (
            <Tile key={id} selected={draft.preset_id === id} label={p.label} onClick={() => pickPreset(id)}>
              <DiaryCover design={designFromPreset(id)} shadow={false} className="h-auto w-full max-w-[72px]" />
            </Tile>
          ))}
        </div>
      </Group>

      <Group title="Cover color">
        <div className="grid grid-cols-5 gap-2">
          {COVER_COLORS.map((c) => (
            <Tile key={c} selected={draft.cover_color === c} label={COVER_COLOR_LABELS[c]} onClick={() => change({ cover_color: c })}>
              <Swatch color={c} />
            </Tile>
          ))}
        </div>
      </Group>

      <Group title="Decorations" hint={`${draft.decoration_ids.length} of ${MAX_DECORATIONS} chosen`}>
        <div className="grid grid-cols-3 gap-2">
          {DECORATIONS.map((d) => {
            const selected = draft.decoration_ids.includes(d);
            const full = !selected && draft.decoration_ids.length >= MAX_DECORATIONS;
            return (
              <Tile key={d} selected={selected} disabled={full} title={full ? "Remove one to add another" : undefined} label={DECORATION_LABELS[d]} onClick={() => toggleDecoration(d)}>
                <svg viewBox="-14 -14 28 28" className="h-7 w-7" aria-hidden="true">
                  <DecorationShape id={d} size={24} ink={shadeColor(draft.cover_color, -0.5)} hole="var(--palette-ground)" />
                </svg>
              </Tile>
            );
          })}
        </div>
        <p className="mt-1.5 text-[11px]" style={{ color: "var(--palette-text-muted)" }}>They appear on the cover label in the order you pick them.</p>
      </Group>

      <Group title="Bookmark color">
        <div className="grid grid-cols-5 gap-2">
          {BOOKMARK_COLORS.map((c) => (
            <Tile key={c} selected={draft.bookmark_color === c} label={BOOKMARK_COLOR_LABELS[c]} onClick={() => change({ bookmark_color: c })}>
              <Swatch color={c} />
            </Tile>
          ))}
        </div>
      </Group>

      <Group title="Bookmark shape">
        <div className="grid grid-cols-3 gap-2">
          {BOOKMARK_STYLES.map((s) => (
            <Tile key={s} selected={draft.bookmark_style === s} label={BOOKMARK_STYLE_LABELS[s]} onClick={() => change({ bookmark_style: s })}>
              <BookmarkSwatch style={s} color={draft.bookmark_color} className="h-12 w-7" />
            </Tile>
          ))}
        </div>
      </Group>

      <div aria-live="polite">
        {error && <p role="alert" className="text-sm" style={{ color: "#b04040" }}>{error}</p>}
        {notice && <p role="status" className="text-sm" style={{ color: "var(--palette-accent)" }}>{notice}</p>}
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          disabled={!dirty || pending}
          onClick={() => { setDraft(saved); setError(""); setNotice(""); }}
          className="flex min-h-[44px] flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 disabled:opacity-50"
          style={{ ...focusRing, color: "var(--palette-text-primary)", border: "1px solid var(--palette-surface-border)" }}
        >
          <X size={14} aria-hidden="true" />Cancel
        </button>
        <button
          type="button"
          disabled={!dirty || pending}
          onClick={save}
          className="flex min-h-[44px] flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 disabled:opacity-50"
          style={{ ...focusRing, background: "var(--palette-accent)", color: "white" }}
        >
          {pending ? <Loader2 size={14} className="animate-spin" aria-hidden="true" /> : !dirty && notice ? <Check size={14} aria-hidden="true" /> : <Save size={14} aria-hidden="true" />}
          {pending ? "Saving…" : !dirty && notice ? "Saved" : "Save diary"}
        </button>
      </div>

      <button
        type="button"
        onClick={() => { setDraft(designFromPreset("dreamy-garden")); setNotice(""); }}
        className="flex items-center justify-center gap-1.5 self-center text-xs underline focus-visible:outline-none focus-visible:ring-2"
        style={{ ...focusRing, color: "var(--palette-text-muted)" }}
      >
        <RotateCcw size={12} aria-hidden="true" />Reset to the default style
      </button>
    </div>
  );
}
