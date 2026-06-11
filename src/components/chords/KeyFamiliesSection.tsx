"use client";

import { useState } from "react";
import { DEGREE_ROLE, keyFamily, pcOf, type KeyChord } from "@/lib/music.ts";
import { findVoicings } from "@/lib/shapes.ts";
import ChordDiagram from "./ChordDiagram";

/* ============================================================
   Key families — pick a key, meet its 7 chords.
   1 is home. The 5 aches toward it.
   ============================================================ */

const KEYS = ["G", "C", "D", "A", "E"] as const;
type KeyName = (typeof KEYS)[number];

type Voicing = ReturnType<typeof findVoicings>[number];

/** Lowest-fret moveable (barre) voicing, without mutating the input. */
function lowestBarre(voicings: Voicing[]): Voicing | null {
  return voicings
    .filter((v) => v.shape.moveable)
    .reduce<Voicing | null>((best, v) => (best === null || v.baseFret < best.baseFret ? v : best), null);
}

function KeyChordCard({ chord }: { chord: KeyChord }) {
  const voicings = findVoicings(chord.root, chord.quality);
  const open = voicings.find((v) => !v.shape.moveable) ?? null;
  const barre = open ? null : lowestBarre(voicings);

  return (
    <article className="card flex flex-col gap-2 p-3">
      <div className="flex items-baseline justify-between">
        <span className="font-mono text-lg font-bold text-faint">{chord.degree}</span>
        <span className="text-xs font-semibold text-dim">{chord.numeral}</span>
      </div>
      <div className="flex flex-wrap items-baseline gap-x-2">
        <span className="text-xl font-bold">{chord.name}</span>
        <span className="text-xs text-faint">{chord.quality}</span>
      </div>
      <p className="text-xs text-dim">{DEGREE_ROLE[chord.degree - 1]}</p>

      {open && (
        <div className="mt-auto flex flex-col items-center gap-1 pt-2">
          <span className="text-xs font-semibold text-accent">you know this one ✓</span>
          <ChordDiagram shape={open.shape} baseFret={open.baseFret} size="sm" />
        </div>
      )}

      {barre && (
        <div className="mt-auto flex flex-col items-center gap-1 pt-2">
          <span className="text-center text-xs text-dim">
            via {barre.shape.birthplace} shape at fret {barre.baseFret}
          </span>
          <ChordDiagram shape={barre.shape} baseFret={barre.baseFret} size="sm" />
        </div>
      )}

      {!open && !barre && (
        <p className="mt-auto pt-2 text-xs italic text-faint">vii° — the leaning tower (skip for now)</p>
      )}
    </article>
  );
}

export default function KeyFamiliesSection() {
  const [keyName, setKeyName] = useState<KeyName>("G");
  const family = keyFamily(pcOf(keyName));

  return (
    <section className="flex flex-col gap-4" aria-label="Key families">
      <p className="text-sm text-dim">
        1 is home — the local sun. The 5 aches toward it. Songs end on it.
      </p>

      <div className="flex flex-wrap gap-2">
        {KEYS.map((k) => (
          <button
            key={k}
            type="button"
            className="chip"
            data-on={k === keyName}
            aria-pressed={k === keyName}
            onClick={() => setKeyName(k)}
          >
            Key of {k}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
        {family.map((chord) => (
          <KeyChordCard key={chord.degree} chord={chord} />
        ))}
      </div>
    </section>
  );
}
