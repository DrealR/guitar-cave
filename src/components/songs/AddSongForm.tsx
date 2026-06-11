"use client";

/* Add (or edit) a song — same fields as the library songs.
   Saves into the store doc under customSongs. */

import { useState } from "react";
import type { Song } from "@/lib/songs-data.ts";
import { newId, type StoreDoc } from "@/components/tracker/useStore.ts";

type SectionDraft = { label: string; chords: string; numbers: string; strum: string; note: string };
type SongDraft = {
  title: string;
  artist: string;
  key: string;
  home: string;
  capo: string;
  sections: SectionDraft[];
};

const EMPTY_SECTION: SectionDraft = { label: "", chords: "", numbers: "", strum: "", note: "" };
const EMPTY_DRAFT: SongDraft = {
  title: "",
  artist: "",
  key: "",
  home: "",
  capo: "",
  sections: [EMPTY_SECTION],
};

function songToDraft(song: Song): SongDraft {
  return {
    title: song.title,
    artist: song.artist ?? "",
    key: song.key,
    home: song.home,
    capo: song.capo !== undefined ? String(song.capo) : "",
    sections: song.sections.map((s) => ({
      label: s.label ?? "",
      chords: s.chords.join(", "),
      numbers: s.numbers,
      strum: s.strum,
      note: s.note ?? "",
    })),
  };
}

type Props = {
  /** when set, the form edits this custom song instead of adding.
      Parent must key the form by song id so a new target remounts it. */
  editing: Song | null;
  update: (fn: (doc: StoreDoc) => StoreDoc) => void;
  onDone: () => void;
};

export default function AddSongForm({ editing, update, onDone }: Props) {
  const [draft, setDraft] = useState<SongDraft>(() =>
    editing ? songToDraft(editing) : EMPTY_DRAFT,
  );
  const [error, setError] = useState<string | null>(null);

  const setField = (field: keyof Omit<SongDraft, "sections">, value: string) =>
    setDraft((d) => ({ ...d, [field]: value }));

  const setSection = (i: number, field: keyof SectionDraft, value: string) =>
    setDraft((d) => ({
      ...d,
      sections: d.sections.map((s, j) => (j === i ? { ...s, [field]: value } : s)),
    }));

  const addSection = () => setDraft((d) => ({ ...d, sections: [...d.sections, EMPTY_SECTION] }));

  const removeSection = (i: number) =>
    setDraft((d) => ({ ...d, sections: d.sections.filter((_, j) => j !== i) }));

  const save = () => {
    const title = draft.title.trim();
    const key = draft.key.trim();
    const home = draft.home.trim();
    if (!title || !key || !home) {
      setError("Title, key and home are required.");
      return;
    }
    const capo = draft.capo.trim() === "" ? undefined : Number(draft.capo);
    if (capo !== undefined && (!Number.isInteger(capo) || capo < 0)) {
      setError("Capo must be a whole fret number.");
      return;
    }
    const sections = draft.sections
      .map((s) => ({
        label: s.label.trim() || undefined,
        chords: s.chords.split(",").map((c) => c.trim()).filter(Boolean),
        numbers: s.numbers.trim(),
        strum: s.strum.trim(),
        note: s.note.trim() || undefined,
      }))
      .filter((s) => s.chords.length > 0);
    if (sections.length === 0) {
      setError("Add at least one section with chords (comma-separated).");
      return;
    }

    const song: Song = {
      id: editing?.id ?? newId("song"),
      title,
      artist: draft.artist.trim() || undefined,
      key,
      home,
      capo,
      sections,
    };
    update((doc) => ({
      ...doc,
      customSongs: editing
        ? doc.customSongs.map((s) => (s.id === editing.id ? song : s))
        : [...doc.customSongs, song],
    }));
    setDraft(EMPTY_DRAFT);
    setError(null);
    onDone();
  };

  const field =
    "min-h-11 rounded-xl border border-line bg-surface-2 px-3 text-sm outline-none placeholder:text-faint focus:border-root";

  return (
    <form
      className="card flex flex-col gap-3 p-4 md:p-5"
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
    >
      <h3 className="text-base font-bold">{editing ? `Editing — ${editing.title}` : "Add a song"}</h3>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <input className={field} value={draft.title} onChange={(e) => setField("title", e.target.value)} placeholder="Title *" aria-label="Title" />
        <input className={field} value={draft.artist} onChange={(e) => setField("artist", e.target.value)} placeholder="Artist" aria-label="Artist" />
        <input className={field} value={draft.key} onChange={(e) => setField("key", e.target.value)} placeholder="Key * (e.g. G major)" aria-label="Key" />
        <div className="grid grid-cols-2 gap-2">
          <input className={field} value={draft.home} onChange={(e) => setField("home", e.target.value)} placeholder="Home * (e.g. G)" aria-label="Home chord" />
          <input className={field} value={draft.capo} onChange={(e) => setField("capo", e.target.value)} placeholder="Capo" aria-label="Capo fret" inputMode="numeric" />
        </div>
      </div>

      {draft.sections.map((s, i) => (
        <fieldset key={i} className="rounded-xl border border-line p-3">
          <legend className="px-1 text-xs font-bold uppercase tracking-wide text-dim">
            Section {i + 1}
          </legend>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <input className={field} value={s.label} onChange={(e) => setSection(i, "label", e.target.value)} placeholder="Label (Verse, Chorus…)" aria-label={`Section ${i + 1} label`} />
            <input className={field} value={s.chords} onChange={(e) => setSection(i, "chords", e.target.value)} placeholder="Chords * (G, Em, C, D)" aria-label={`Section ${i + 1} chords`} />
            <input className={`${field} font-mono`} value={s.numbers} onChange={(e) => setSection(i, "numbers", e.target.value)} placeholder="Numbers (1 – 6m – 4 – 5)" aria-label={`Section ${i + 1} numbers`} />
            <input className={`${field} font-mono`} value={s.strum} onChange={(e) => setSection(i, "strum", e.target.value)} placeholder="Strum (D · D-U)" aria-label={`Section ${i + 1} strum`} />
          </div>
          <div className="mt-2 flex items-center gap-2">
            <input className={`${field} flex-1`} value={s.note} onChange={(e) => setSection(i, "note", e.target.value)} placeholder="Note" aria-label={`Section ${i + 1} note`} />
            {draft.sections.length > 1 && (
              <button
                type="button"
                onClick={() => removeSection(i)}
                aria-label={`Remove section ${i + 1}`}
                className="h-11 w-10 shrink-0 rounded-lg border border-line text-dim hover:border-root hover:text-root"
              >
                ✕
              </button>
            )}
          </div>
        </fieldset>
      ))}

      {error && <p className="text-xs text-root">{error}</p>}

      <div className="flex flex-wrap gap-2">
        <button type="button" className="chip" onClick={addSection}>
          ＋ Section
        </button>
        <button type="submit" className="chip ml-auto" data-on="true">
          {editing ? "Save changes" : "Save song"}
        </button>
        <button type="button" className="chip" onClick={onDone}>
          Cancel
        </button>
      </div>
    </form>
  );
}
