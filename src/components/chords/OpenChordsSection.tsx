"use client";

import { useState } from "react";
import {
  INTERVAL_MEANING,
  INTERVAL_SEMITONES,
  STRING_LABELS,
  noteAt,
  shortName,
} from "@/lib/music.ts";
import { OPEN_CHORDS, type ChordShape } from "@/lib/shapes.ts";
import ChordDiagram from "./ChordDiagram";
import { INTERVAL_FILL, INTERVAL_INK, prettyInterval } from "./interval-colors";

/* ============================================================
   Open chords — the birthplaces. Tap one → anatomy card.
   ============================================================ */

const ANATOMY = [
  {
    color: "var(--color-root)",
    label: "Root = identity",
    detail: "the gold note names the chord",
  },
  {
    color: "var(--color-third)",
    label: "3rd = soul",
    detail: "minor 3rd = 3 frets = sad, major = 4 = happy",
  },
  {
    color: "var(--color-fifth)",
    label: "5th = spine",
    detail: "always 7 half-steps; it never moves",
  },
] as const;

/** The note each string sounds, colored by its interval job. */
function PerStringNotes({ shape }: { shape: ChordShape }) {
  const base = shape.openBase ?? 0;
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1">
      {STRING_LABELS.map((label, s) => {
        const note = shape.notes.find((n) => n.string === s);
        const isMuted = shape.muted.includes(s) || !note;
        return (
          <div key={s} className="flex flex-col items-center gap-0.5">
            <span className="font-mono text-[0.65rem] text-faint">{label}</span>
            {isMuted ? (
              <span className="text-sm text-faint">✕</span>
            ) : (
              <span className="text-sm font-semibold" style={{ color: INTERVAL_FILL[note.interval] }}>
                {shortName(noteAt(s, base + note.offset))}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

function OpenChordDetail({ shape }: { shape: ChordShape }) {
  const base = shape.openBase ?? 0;
  const intervals = [...new Set(shape.notes.map((n) => n.interval))].sort(
    (a, b) => INTERVAL_SEMITONES[a] - INTERVAL_SEMITONES[b],
  );

  return (
    <div className="card flex flex-col gap-5 p-4 sm:flex-row sm:items-start">
      <div className="flex shrink-0 justify-center sm:w-60">
        <ChordDiagram shape={shape} baseFret={base} size="lg" />
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-4">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-faint">Notes, string by string</h3>
          <div className="mt-2">
            <PerStringNotes shape={shape} />
          </div>
        </div>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-faint">Anatomy</h3>
          <ul className="mt-2 flex flex-col gap-1.5">
            {ANATOMY.map((a) => (
              <li key={a.label} className="legend">
                <i style={{ background: a.color }} />
                <span>
                  <strong className="text-text">{a.label}</strong> — {a.detail}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {shape.tip && (
          <p className="rounded-lg border border-line bg-surface-2 p-3 text-sm text-dim">{shape.tip}</p>
        )}

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-faint">What each note is doing</h3>
          <ul className="mt-2 flex flex-col gap-1.5">
            {intervals.map((interval) => (
              <li key={interval} className="flex items-start gap-2 text-xs text-dim">
                <span
                  className="mt-px inline-flex h-4 w-8 shrink-0 items-center justify-center rounded-full text-[0.65rem] font-bold"
                  style={{ background: INTERVAL_FILL[interval], color: INTERVAL_INK[interval] }}
                >
                  {prettyInterval(interval)}
                </span>
                <span>{INTERVAL_MEANING[interval]}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function OpenChordsSection() {
  const [selectedId, setSelectedId] = useState(OPEN_CHORDS[0].id);
  const selected = OPEN_CHORDS.find((s) => s.id === selectedId) ?? OPEN_CHORDS[0];

  return (
    <section className="flex flex-col gap-4" aria-label="Open chords">
      <p className="text-sm text-dim">Where the shapes are born. Tap a chord to open its anatomy.</p>

      <OpenChordDetail shape={selected} />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {OPEN_CHORDS.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setSelectedId(s.id)}
            aria-pressed={s.id === selectedId}
            className={`card flex flex-col items-center p-3 transition-colors ${
              s.id === selectedId ? "border-root" : "hover:border-faint"
            }`}
          >
            <ChordDiagram shape={s} baseFret={s.openBase ?? 0} size="sm" />
          </button>
        ))}
      </div>
    </section>
  );
}
