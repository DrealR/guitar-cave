"use client";

/* One song — collapsed: title + badges + chord chips.
   Expanded: home callout, then each section with the
   progression in letters AND numbers, strum, diagrams. */

import { useState } from "react";
import type { Song, SongSection } from "@/lib/songs-data.ts";
import { uniqueChords } from "@/components/songs/resolve.ts";
import SectionDiagrams from "@/components/songs/SectionDiagrams";

type Props = {
  song: Song;
  /** custom songs get edit/remove controls */
  onEdit?: () => void;
  onRemove?: () => void;
};

export default function SongCard({ song, onEdit, onRemove }: Props) {
  const [open, setOpen] = useState(false);
  const allChords = uniqueChords(song.sections.flatMap((s) => s.chords));

  return (
    <article className="card overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full flex-col gap-2 px-4 py-4 text-left transition-colors hover:bg-surface-2/60 md:px-5"
      >
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-base font-bold">{song.title}</h3>
          {song.artist && <span className="text-sm text-dim">{song.artist}</span>}
          <span aria-hidden className="ml-auto text-dim">
            {open ? "▾" : "▸"}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
          <span className="rounded-full border border-line bg-surface-2 px-2.5 py-1 text-dim">
            {song.key}
          </span>
          {song.capo !== undefined && (
            <span className="rounded-full border border-line bg-surface-2 px-2.5 py-1 text-dim">
              capo {song.capo}
            </span>
          )}
          {song.inLoop && (
            <span className="rounded-full border border-accent/40 bg-accent/10 px-2.5 py-1 text-accent">
              in the daily loop
            </span>
          )}
          {allChords.map((c) => (
            <span key={c} className="rounded-full border border-line px-2.5 py-1 font-mono text-dim">
              {c}
            </span>
          ))}
        </div>
      </button>

      {open && (
        <div className="border-t border-line px-4 pb-5 pt-4 md:px-5">
          <p className="rounded-xl border border-root/30 bg-root/10 px-3 py-2 text-sm">
            <span className="font-bold text-root">Home = {song.home}</span>
            <span className="text-dim"> — the local sun; the song ends here.</span>
          </p>

          <div className="mt-4 flex flex-col gap-5">
            {song.sections.map((section, i) => (
              <SectionView key={i} section={section} />
            ))}
          </div>

          {(onEdit || onRemove) && (
            <div className="mt-5 flex gap-2 border-t border-line pt-4">
              {onEdit && (
                <button type="button" className="chip" onClick={onEdit}>
                  ✎ Edit
                </button>
              )}
              {onRemove && (
                <button type="button" className="chip" onClick={onRemove}>
                  ✕ Remove
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </article>
  );
}

/* ---- one section ---- */

function SectionView({ section }: { section: SongSection }) {
  const numberTokens = section.numbers.split(/\s*[–—-]\s*/).filter(Boolean);
  const aligned = numberTokens.length === section.chords.length;

  return (
    <div>
      {section.label && (
        <h4 className="mb-2 text-xs font-bold uppercase tracking-wide text-dim">{section.label}</h4>
      )}

      {/* progression — letters and numbers, aligned when they pair up */}
      {aligned ? (
        <div className="flex flex-wrap gap-x-5 gap-y-2">
          {section.chords.map((chord, i) => (
            <div key={i} className="flex min-w-10 flex-col items-center">
              <span className="text-lg font-bold">{chord}</span>
              <span className="font-mono text-sm text-third">{numberTokens[i]}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-1">
          <p className="text-lg font-bold">{section.chords.join("  ·  ")}</p>
          <p className="font-mono text-sm text-third">{section.numbers}</p>
        </div>
      )}

      {/* strum */}
      <p className="mt-3 text-sm">
        <span className="text-xs font-semibold uppercase tracking-wide text-faint">strum </span>
        <code className="rounded-md border border-line bg-surface-2 px-2 py-1 font-mono text-sm">
          {section.strum}
        </code>
      </p>

      {section.note && <p className="mt-2 text-sm italic text-dim">{section.note}</p>}

      <div className="mt-3">
        <SectionDiagrams chords={section.chords} />
      </div>
    </div>
  );
}
