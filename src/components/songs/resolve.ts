/* ============================================================
   ONE resolver: chord NAME → playable diagram (shape + fret).
   Open chords first (computed names + fixed slash names),
   then barre voicings from chromatic math. Null when the
   library has no voicing — render the chip without a diagram.
   ============================================================ */

import {
  OPEN_CHORDS,
  chordNameAt,
  findVoicings,
  type ChordShape,
} from "@/lib/shapes.ts";
import { pcOf, type ChordQuality } from "@/lib/music.ts";

export type ResolvedChord = { shape: ChordShape; baseFret: number };

const cache = new Map<string, ResolvedChord | null>();

export function resolveChord(name: string): ResolvedChord | null {
  const key = name.trim();
  if (!key) return null;
  const hit = cache.get(key);
  if (hit !== undefined) return hit;
  const result = compute(key);
  cache.set(key, result);
  return result;
}

function compute(name: string): ResolvedChord | null {
  /* 1 — open-chord birthplaces (covers fixed names like "F/C") */
  for (const shape of OPEN_CHORDS) {
    const base = shape.openBase ?? 0;
    if (chordNameAt(shape, base) === name) return { shape, baseFret: base };
  }

  /* 2 — parse root + quality, find a barre voicing */
  const parsed = parseChordName(name);
  if (!parsed) return null;
  const voicings = [...findVoicings(parsed.root, parsed.quality)].sort(
    (a, b) => a.baseFret - b.baseFret,
  );
  const first = voicings[0];
  return first ? { shape: first.shape, baseFret: first.baseFret } : null;
}

const NAME_RE = /^([A-G][#b]?)(m|7|dim|°)?$/;

function parseChordName(
  name: string,
): { root: number; quality: ChordQuality | "dom7" } | null {
  const m = NAME_RE.exec(name);
  if (!m) return null;
  const root = pcOf(m[1]);
  if (root < 0) return null;
  const suffix = m[2] ?? "";
  const quality: ChordQuality | "dom7" =
    suffix === "m" ? "minor" : suffix === "7" ? "dom7" : suffix === "" ? "major" : "dim";
  return { root, quality };
}

/** Unique chord names across a list, first-seen order. */
export function uniqueChords(names: string[]): string[] {
  return [...new Set(names.map((n) => n.trim()).filter(Boolean))];
}
