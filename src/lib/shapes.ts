import {
  type IntervalLabel,
  type PitchClass,
  type ChordQuality,
  noteAt,
  shortName,
  qualitySuffix,
} from "./music.ts";

/* ============================================================
   Shapes are frozen identities. A shape locks the interval
   gaps into hand geometry — slide it and the QUALITY stays,
   only the LETTER changes. Names come from open-chord
   birthplaces (CAGED). Every chord name in the app is
   COMPUTED: root string + fret → chromatic math → name.
   ============================================================ */

export type ShapeNote = {
  string: number; // 0 = low E (string 6) … 5 = high e (string 1)
  offset: number; // frets relative to the shape's base fret
  interval: IntervalLabel;
};

export type ChordShape = {
  id: string;
  /** display name of the SHAPE, not the chord (e.g. "E shape") */
  shapeName: string;
  birthplace: "C" | "A" | "G" | "E" | "D"; // CAGED
  quality: ChordQuality | "dom7";
  rootString: number; // which string carries the identity (0=6th, 1=5th, 2=4th)
  /** offset (from base fret) of the root note on rootString — 0 for barres */
  rootOffset: number;
  notes: ShapeNote[];
  muted: number[]; // string indices not played
  moveable: boolean;
  /** for open chords: the base fret is 0 and the name is fixed */
  openBase?: number;
  barre?: { fromString: number; toString: number; offset: number };
  tip?: string;
  /** slash chords etc. — overrides the computed display name */
  fixedName?: string;
};

/* ---- helpers ---- */
const N = (string: number, offset: number, interval: IntervalLabel): ShapeNote => ({
  string,
  offset,
  interval,
});

/* ============================================================
   MOVEABLE SHAPES — the sliders.
   ============================================================ */
export const MOVEABLE_SHAPES: ChordShape[] = [
  {
    id: "e-major",
    shapeName: "E shape — major",
    birthplace: "E",
    quality: "major",
    rootString: 0,
    rootOffset: 0,
    moveable: true,
    muted: [],
    barre: { fromString: 0, toString: 5, offset: 0 },
    notes: [
      N(0, 0, "R"), N(1, 2, "5"), N(2, 2, "R"), N(3, 1, "3"), N(4, 0, "5"), N(5, 0, "R"),
    ],
    tip: "Read the 6th string for the name. Barre at 3 → G major.",
  },
  {
    id: "e-minor",
    shapeName: "E shape — minor",
    birthplace: "E",
    quality: "minor",
    rootString: 0,
    rootOffset: 0,
    moveable: true,
    muted: [],
    barre: { fromString: 0, toString: 5, offset: 0 },
    notes: [
      N(0, 0, "R"), N(1, 2, "5"), N(2, 2, "R"), N(3, 0, "b3"), N(4, 0, "5"), N(5, 0, "R"),
    ],
    tip: "Same as E-major shape with the soul finger lifted — the 3rd drops 1 fret: minor.",
  },
  {
    id: "a-major",
    shapeName: "A shape — major",
    birthplace: "A",
    quality: "major",
    rootString: 1,
    rootOffset: 0,
    moveable: true,
    muted: [0],
    barre: { fromString: 1, toString: 5, offset: 0 },
    notes: [
      N(1, 0, "R"), N(2, 2, "5"), N(3, 2, "R"), N(4, 2, "3"), N(5, 0, "5"),
    ],
    tip: "Read the 5th string. The one-finger version flattens the three middle notes.",
  },
  {
    id: "a-minor",
    shapeName: "A shape — minor",
    birthplace: "A",
    quality: "minor",
    rootString: 1,
    rootOffset: 0,
    moveable: true,
    muted: [0],
    barre: { fromString: 1, toString: 5, offset: 0 },
    notes: [
      N(1, 0, "R"), N(2, 2, "5"), N(3, 2, "R"), N(4, 1, "b3"), N(5, 0, "5"),
    ],
    tip: "Am slid up the neck. The b3 on the B string is the mood.",
  },
  {
    id: "d-major",
    shapeName: "D shape — major",
    birthplace: "D",
    quality: "major",
    rootString: 2,
    rootOffset: 0,
    moveable: true,
    muted: [0, 1],
    notes: [N(2, 0, "R"), N(3, 2, "5"), N(4, 3, "R"), N(5, 2, "3")],
    tip: "Read the 4th string. Small body, bright voice — higher = brighter.",
  },
  {
    id: "d-minor",
    shapeName: "D shape — minor",
    birthplace: "D",
    quality: "minor",
    rootString: 2,
    rootOffset: 0,
    moveable: true,
    muted: [0, 1],
    notes: [N(2, 0, "R"), N(3, 2, "5"), N(4, 3, "R"), N(5, 1, "b3")],
    tip: "D minor shape at fret 5 = G minor. The shape carries the quality; the fret carries the letter.",
  },
];

/* ============================================================
   OPEN CHORDS — the birthplaces (base fret 0).
   ============================================================ */
export const OPEN_CHORDS: ChordShape[] = [
  {
    id: "open-e", shapeName: "E", birthplace: "E", quality: "major",
    rootString: 0, rootOffset: 0, moveable: false, openBase: 0, muted: [],
    notes: [N(0, 0, "R"), N(1, 2, "5"), N(2, 2, "R"), N(3, 1, "3"), N(4, 0, "5"), N(5, 0, "R")],
  },
  {
    id: "open-em", shapeName: "Em", birthplace: "E", quality: "minor",
    rootString: 0, rootOffset: 0, moveable: false, openBase: 0, muted: [],
    notes: [N(0, 0, "R"), N(1, 2, "5"), N(2, 2, "R"), N(3, 0, "b3"), N(4, 0, "5"), N(5, 0, "R")],
  },
  {
    id: "open-a", shapeName: "A", birthplace: "A", quality: "major",
    rootString: 1, rootOffset: 0, moveable: false, openBase: 0, muted: [0],
    notes: [N(1, 0, "R"), N(2, 2, "5"), N(3, 2, "R"), N(4, 2, "3"), N(5, 0, "5")],
  },
  {
    id: "open-am", shapeName: "Am", birthplace: "A", quality: "minor",
    rootString: 1, rootOffset: 0, moveable: false, openBase: 0, muted: [0],
    notes: [N(1, 0, "R"), N(2, 2, "5"), N(3, 2, "R"), N(4, 1, "b3"), N(5, 0, "5")],
  },
  {
    id: "open-c", shapeName: "C", birthplace: "C", quality: "major",
    rootString: 1, rootOffset: 3, moveable: false, openBase: 0, muted: [0],
    notes: [N(1, 3, "R"), N(2, 2, "3"), N(3, 0, "5"), N(4, 1, "R"), N(5, 0, "3")],
  },
  {
    id: "open-d", shapeName: "D", birthplace: "D", quality: "major",
    rootString: 2, rootOffset: 0, moveable: false, openBase: 0, muted: [0, 1],
    notes: [N(2, 0, "R"), N(3, 2, "5"), N(4, 3, "R"), N(5, 2, "3")],
  },
  {
    id: "open-dm", shapeName: "Dm", birthplace: "D", quality: "minor",
    rootString: 2, rootOffset: 0, moveable: false, openBase: 0, muted: [0, 1],
    notes: [N(2, 0, "R"), N(3, 2, "5"), N(4, 3, "R"), N(5, 1, "b3")],
    tip: "The soul note sits on the thinnest string — let it ring clean.",
  },
  {
    id: "open-g", shapeName: "G", birthplace: "G", quality: "major",
    rootString: 0, rootOffset: 3, moveable: false, openBase: 0, muted: [],
    notes: [N(0, 3, "R"), N(1, 2, "3"), N(2, 0, "5"), N(3, 0, "R"), N(4, 0, "3"), N(5, 3, "R")],
  },
  {
    id: "open-b7", shapeName: "B7", birthplace: "A", quality: "dom7",
    rootString: 1, rootOffset: 2, moveable: false, openBase: 0, muted: [0],
    notes: [N(1, 2, "R"), N(2, 1, "3"), N(3, 2, "b7"), N(4, 0, "R"), N(5, 2, "5")],
    tip: "The b7 is the storyteller — it leans the chord toward E (home in the key of E).",
  },
  {
    id: "open-f", shapeName: "F", birthplace: "E", quality: "major",
    rootString: 0, rootOffset: 0, moveable: false, openBase: 1, muted: [],
    barre: { fromString: 0, toString: 5, offset: 0 },
    notes: [N(0, 0, "R"), N(1, 2, "5"), N(2, 2, "R"), N(3, 1, "3"), N(4, 0, "5"), N(5, 0, "R")],
    tip: "F is just the E shape, one fret up — the first time the shape leaves home.",
  },
  {
    id: "open-f-over-c", shapeName: "F/C", birthplace: "C", quality: "major",
    rootString: 2, rootOffset: 3, moveable: false, openBase: 0, muted: [0],
    fixedName: "F/C",
    notes: [N(1, 3, "5"), N(2, 3, "R"), N(3, 2, "3"), N(4, 1, "5"), N(5, 1, "R")],
    tip: "F with its spine (C) in the bass — a slash chord: F over C. Easier grip, fuller floor.",
  },
];

export const ALL_SHAPES = [...OPEN_CHORDS, ...MOVEABLE_SHAPES];

/* ============================================================
   The computation the whole app trusts:
   shape + fret → chord name. Read the root string.
   ============================================================ */

export function chordRootAt(shape: ChordShape, baseFret: number): PitchClass {
  return noteAt(shape.rootString, baseFret + shape.rootOffset);
}

export function chordNameAt(shape: ChordShape, baseFret: number): string {
  if (shape.fixedName) return shape.fixedName;
  const root = chordRootAt(shape, baseFret);
  const suffix = shape.quality === "dom7" ? "7" : qualitySuffix(shape.quality);
  return shortName(root) + suffix;
}

/** Concrete fretted positions for a shape at a fret (for diagrams). */
export function shapeAt(shape: ChordShape, baseFret: number) {
  return shape.notes.map((n) => ({
    string: n.string,
    fret: baseFret + n.offset,
    interval: n.interval,
    pc: noteAt(n.string, baseFret + n.offset),
  }));
}

/** Find a playable voicing of (root, quality) — prefers open chords, then barres. */
export function findVoicings(root: PitchClass, quality: ChordQuality | "dom7") {
  const out: { shape: ChordShape; baseFret: number; name: string }[] = [];
  for (const shape of ALL_SHAPES) {
    if (shape.quality !== quality) continue;
    if (!shape.moveable) {
      if (chordRootAt(shape, shape.openBase ?? 0) === root)
        out.push({ shape, baseFret: shape.openBase ?? 0, name: chordNameAt(shape, shape.openBase ?? 0) });
      continue;
    }
    for (let f = 1; f <= 12; f++) {
      if (chordRootAt(shape, f) === root) {
        out.push({ shape, baseFret: f, name: chordNameAt(shape, f) });
        break; // first (lowest) position per shape
      }
    }
  }
  return out;
}
