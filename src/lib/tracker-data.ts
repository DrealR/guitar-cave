/* ============================================================
   Practice tracker defaults — Reemy's real current state.
   The tool serves the reps; it does not replace them.
   localStorage owns the live data; these are the seeds.
   ============================================================ */

export type LoopItem = { id: string; label: string; minutes: number };

export const DEFAULT_LOOP: LoopItem[] = [
  { id: "strum-b7", label: "Strum Patterns + B7", minutes: 5 },
  { id: "open-cycle", label: "Open Chords cycle: E / Em / A / Am / C / D / Dm / G", minutes: 5 },
  { id: "stand-by-me", label: "Stand By Me", minutes: 5 },
  { id: "knockin", label: "Knocking on Heaven's Door", minutes: 5 },
  { id: "barre-e", label: "Barre Chords — E-type up the neck", minutes: 5 },
  { id: "barre-a", label: "Barre Chords — A-type up the neck", minutes: 5 },
  { id: "three-little-birds", label: "Three Little Birds", minutes: 5 },
  { id: "pentatonic", label: "Pentatonic Scale — minor + major shapes", minutes: 5 },
];

export type SkillCategory = "chords" | "barres" | "strums" | "songs" | "fretboard" | "scales" | "technique";

export type Skill = {
  id: string;
  label: string;
  category: SkillCategory;
  grade: number; // 1–5 comfort
};

/* Pre-grades match reality (June 2026): open chords solid, B7 new,
   Dm needs work, barres in progress, F low, string-4 naturals low. */
export const DEFAULT_SKILLS: Skill[] = [
  { id: "ch-e", label: "E", category: "chords", grade: 4 },
  { id: "ch-em", label: "Em", category: "chords", grade: 4 },
  { id: "ch-a", label: "A", category: "chords", grade: 4 },
  { id: "ch-am", label: "Am", category: "chords", grade: 4 },
  { id: "ch-c", label: "C", category: "chords", grade: 4 },
  { id: "ch-d", label: "D", category: "chords", grade: 4 },
  { id: "ch-g", label: "G", category: "chords", grade: 4 },
  { id: "ch-b7", label: "B7", category: "chords", grade: 3 },
  { id: "ch-dm", label: "Dm", category: "chords", grade: 2 },
  { id: "ch-f", label: "F (barre)", category: "chords", grade: 2 },
  { id: "ch-f-c", label: "F/C", category: "chords", grade: 2 },

  { id: "br-e-maj", label: "E-shape barre — major", category: "barres", grade: 2 },
  { id: "br-e-min", label: "E-shape barre — minor", category: "barres", grade: 2 },
  { id: "br-a-maj", label: "A-shape barre — major", category: "barres", grade: 2 },
  { id: "br-a-min", label: "A-shape barre — minor", category: "barres", grade: 2 },
  { id: "br-a-one", label: "One-finger A-shape barre", category: "barres", grade: 2 },
  { id: "br-naming", label: "Naming barres from the root string", category: "barres", grade: 3 },

  { id: "st-patterns", label: "Strum patterns (keep the pulse)", category: "strums", grade: 3 },
  { id: "st-individual", label: "Strumming individual strings", category: "strums", grade: 2 },

  { id: "sg-stand", label: "Stand By Me", category: "songs", grade: 3 },
  { id: "sg-knockin", label: "Knocking on Heaven's Door", category: "songs", grade: 3 },
  { id: "sg-birds", label: "Three Little Birds", category: "songs", grade: 3 },
  { id: "sg-happy", label: "Happy Together", category: "songs", grade: 2 },

  { id: "fb-s6", label: "Naturals — string 6 (frets 1–12)", category: "fretboard", grade: 4 },
  { id: "fb-s5", label: "Naturals — string 5 (frets 1–12)", category: "fretboard", grade: 4 },
  { id: "fb-s4", label: "Naturals — string 4 (learning)", category: "fretboard", grade: 2 },

  { id: "sc-min-pent", label: "Minor pentatonic shapes", category: "scales", grade: 3 },
  { id: "sc-maj-pent", label: "Major pentatonic shapes", category: "scales", grade: 2 },
  { id: "sc-major", label: "Major scale (W-W-H-W-W-W-H)", category: "scales", grade: 2 },

  { id: "tq-tabs", label: "Tabs & note melodies", category: "technique", grade: 2 },
];

export const CATEGORY_LABELS: Record<SkillCategory, string> = {
  chords: "Open chords",
  barres: "Barre chords",
  strums: "Strumming",
  songs: "Songs",
  fretboard: "Fretboard knowledge",
  scales: "Scales",
  technique: "Technique",
};
