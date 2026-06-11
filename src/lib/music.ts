/* ============================================================
   The chromatic system — everything in the app is COMPUTED
   from here: 12 notes, tuning offsets, interval math.
   note(string, fret) = chromatic[(open + fret) % 12]
   ============================================================ */

/** Pitch classes from C. Sharps internally; display offers dual names. */
export const CHROMATIC = [
  "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B",
] as const;

export type PitchClass = number; // 0..11

const FLAT_NAMES: Record<string, string> = {
  "C#": "Db", "D#": "Eb", "F#": "Gb", "G#": "Ab", "A#": "Bb",
};

/** "F#" → "F#/Gb"; naturals stay as-is. */
export function displayName(pc: PitchClass, dual = true): string {
  const sharp = CHROMATIC[((pc % 12) + 12) % 12];
  const flat = FLAT_NAMES[sharp];
  return flat && dual ? `${sharp}/${flat}` : sharp;
}

export function shortName(pc: PitchClass): string {
  return CHROMATIC[((pc % 12) + 12) % 12];
}

export function isNatural(pc: PitchClass): boolean {
  return !FLAT_NAMES[shortName(pc)];
}

export function pcOf(name: string): PitchClass {
  const i = CHROMATIC.indexOf(name.replace(/b$/, "") as (typeof CHROMATIC)[number]);
  if (i !== -1) return i;
  /* accept flats */
  const flatToSharp: Record<string, string> = {
    Db: "C#", Eb: "D#", Gb: "F#", Ab: "G#", Bb: "A#",
  };
  return CHROMATIC.indexOf((flatToSharp[name] ?? name) as (typeof CHROMATIC)[number]);
}

/* ---- the instrument ----
   Strings indexed 0..5 where 0 = string 6 (low E), 5 = string 1 (high E).
   Tuning = pitch classes of the open strings: E A D G B E. */
export const TUNING: PitchClass[] = [4, 9, 2, 7, 11, 4];
export const STRING_LABELS = ["E", "A", "D", "G", "B", "e"]; // low → high
export const FRETS = 12;
export const MARKER_FRETS = [3, 5, 7, 9];
export const DOUBLE_MARKER_FRET = 12;

/** The fundamental: pitch class at any position. */
export function noteAt(stringIdx: number, fret: number): PitchClass {
  return (TUNING[stringIdx] + fret) % 12;
}

/** All positions of a pitch class on the board (frets 0..FRETS). */
export function positionsOf(pc: PitchClass): { string: number; fret: number }[] {
  const out: { string: number; fret: number }[] = [];
  for (let s = 0; s < 6; s++)
    for (let f = 0; f <= FRETS; f++)
      if (noteAt(s, f) === pc) out.push({ string: s, fret: f });
  return out;
}

/** The octave shape: from string 6 (0) or string 5 (1): up 2 strings, over 2 frets. */
export function octavePartner(stringIdx: number, fret: number): { string: number; fret: number } | null {
  if ((stringIdx === 0 || stringIdx === 1) && fret + 2 <= FRETS)
    return { string: stringIdx + 2, fret: fret + 2 };
  return null;
}

/* ============================================================
   Intervals — the body language.
   Root = identity · 5th = spine (always 7) · 3rd = soul
   (3 = minor/sad, 4 = major/happy).
   ============================================================ */

export type IntervalLabel = "R" | "b3" | "3" | "5" | "b7" | "7" | "b5";

export const INTERVAL_SEMITONES: Record<IntervalLabel, number> = {
  R: 0, b3: 3, "3": 4, b5: 6, "5": 7, b7: 10, "7": 11,
};

export const INTERVAL_MEANING: Record<IntervalLabel, string> = {
  R: "Root — identity. Who the chord is.",
  "3": "Major 3rd — the soul, 4 frets from root. Happy/bright.",
  b3: "Minor 3rd — the soul, 3 frets from root. Sad/moody.",
  "5": "5th — the spine. Power. Always 7 half-steps from root; it never moves.",
  b5: "Flat 5 — the bent spine of the diminished body.",
  b7: "Flat 7 — the storyteller note; leans the chord forward.",
  "7": "Major 7 — the dreamer note; floats.",
};

/* ============================================================
   Scales — a scale picks 7 (or 5) of the 12.
   Major = W-W-H-W-W-W-H · Natural minor = W-H-W-W-H-W-W
   ============================================================ */

export type ScaleType = "major" | "minor" | "minorPentatonic" | "majorPentatonic";

export const SCALES: Record<ScaleType, { name: string; intervals: number[]; formula: string }> = {
  major: { name: "Major", intervals: [0, 2, 4, 5, 7, 9, 11], formula: "W-W-H-W-W-W-H" },
  minor: { name: "Natural Minor", intervals: [0, 2, 3, 5, 7, 8, 10], formula: "W-H-W-W-H-W-W" },
  minorPentatonic: { name: "Minor Pentatonic", intervals: [0, 3, 5, 7, 10], formula: "the 5 survivors of minor" },
  majorPentatonic: { name: "Major Pentatonic", intervals: [0, 2, 4, 7, 9], formula: "the 5 survivors of major" },
};

export function scaleNotes(root: PitchClass, type: ScaleType): PitchClass[] {
  return SCALES[type].intervals.map((i) => (root + i) % 12);
}

/* ============================================================
   Key families — pick a key, get its 7 chords.
   1 maj · 2 min · 3 min · 4 maj · 5 maj · 6 min · 7 dim
   ============================================================ */

export type ChordQuality = "major" | "minor" | "dim";

export const DEGREE_QUALITY: ChordQuality[] = [
  "major", "minor", "minor", "major", "major", "minor", "dim",
];

export const DEGREE_ROLE = [
  "Home — the local sun. Everything orbits it.",
  "The wanderer — minor, restless.",
  "The dreamer — minor, drifting.",
  "The lift — major, opens the chest.",
  "The tension — major, aches toward home.",
  "The bittersweet — minor, home's sad cousin.",
  "The leaning tower — diminished, falls into home.",
];

export type KeyChord = {
  degree: number; // 1..7
  root: PitchClass;
  quality: ChordQuality;
  numeral: string;
  name: string; // e.g. "Em"
};

export function keyFamily(keyRoot: PitchClass): KeyChord[] {
  const scale = scaleNotes(keyRoot, "major");
  const numerals = ["I", "ii", "iii", "IV", "V", "vi", "vii°"];
  return scale.map((root, i) => {
    const quality = DEGREE_QUALITY[i];
    const name =
      shortName(root) + (quality === "minor" ? "m" : quality === "dim" ? "°" : "");
    return { degree: i + 1, root, quality, numeral: numerals[i], name };
  });
}

export function qualitySuffix(q: ChordQuality): string {
  return q === "minor" ? "m" : q === "dim" ? "°" : "";
}
