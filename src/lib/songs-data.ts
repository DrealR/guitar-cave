/* ============================================================
   Songs — chords, progressions in letters AND numbers, where
   home is, and the strum written as D/U.
   ============================================================ */

export type SongSection = {
  label?: string;
  chords: string[]; // chord names; diagrams resolve from the library
  numbers: string; // progression in numbers
  strum: string; // D/U notation
  note?: string;
};

export type Song = {
  id: string;
  title: string;
  artist?: string;
  key: string; // e.g. "G major"
  home: string; // the tonic chord = the local sun
  capo?: number;
  sections: SongSection[];
  inLoop?: boolean;
};

export const SONGS: Song[] = [
  {
    id: "stand-by-me",
    title: "Stand By Me",
    artist: "Ben E. King",
    key: "G major",
    home: "G",
    inLoop: true,
    sections: [
      {
        chords: ["G", "Em", "C", "D"],
        numbers: "1 – 6m – 4 – 5",
        strum: "D · D-U · D · D-U",
        note: "The classic 1-6-4-5 orbit: home → bittersweet → lift → tension → home. The whole song is one loop around the sun.",
      },
    ],
  },
  {
    id: "knockin",
    title: "Knocking on Heaven's Door",
    artist: "Bob Dylan",
    key: "G major",
    home: "G",
    inLoop: true,
    sections: [
      {
        label: "Line 1",
        chords: ["G", "D", "Am"],
        numbers: "1 – 5 – 2m",
        strum: "D · D-U · U-D-U",
      },
      {
        label: "Line 2",
        chords: ["G", "D", "C"],
        numbers: "1 – 5 – 4",
        strum: "D · D-U · U-D-U",
        note: "Same start, two landings: line 1 falls to the wanderer (2m), line 2 to the lift (4).",
      },
    ],
  },
  {
    id: "three-little-birds",
    title: "Three Little Birds",
    artist: "Bob Marley",
    key: "A major",
    home: "A",
    inLoop: true,
    sections: [
      {
        chords: ["A", "D", "E"],
        numbers: "1 – 4 – 5",
        strum: "D · D-U · D · D-U (lazy, behind the beat)",
        note: "The three pillars of any key: home, lift, tension. Don't worry about a thing.",
      },
    ],
  },
  {
    id: "happy-together",
    title: "Happy Together",
    artist: "The Turtles",
    key: "E minor (shapes) — sounds in F# minor with capo 2",
    home: "Em",
    capo: 2,
    sections: [
      {
        label: "Verse",
        chords: ["Em", "D", "C", "B7"],
        numbers: "1m – ♭7 – ♭6 – 5(7)",
        strum: "D-D-D-DU",
        note: "A staircase walking DOWN to the tension chord — each step darkens until B7 aches back home.",
      },
      {
        label: "Chorus",
        chords: ["E", "Bm", "E", "G"],
        numbers: "1 – 5m – 1 – ♭3",
        strum: "D-D-U-U-D-U · last G: U-D-U-D-U-D",
        note: "The sun comes out: minor home flips to MAJOR E for the chorus.",
      },
    ],
  },
];

/* ============================================================
   The learning queue — songs Reemy wants next (from his list).
   Add chords/sections when you start one; until then it's a
   wishlist with links.
   ============================================================ */

export type QueueSong = { title: string; artist?: string; link?: string };

export const LEARNING_QUEUE: QueueSong[] = [
  { title: "Tell Me Why", link: "https://youtube.com/shorts/b6PNsxdu0BM?si=aB4Dk5X-6ky3XxKF" },
  { title: "Landslide", artist: "Fleetwood Mac" },
  { title: "Home" },
  { title: "Idea 10", artist: "Gibran Alcocer" },
  { title: "Bonnie and Clyde" },
  { title: "Cornfield Chase", artist: "Hans Zimmer (Interstellar)" },
  { title: "Bella's Lullaby", artist: "Carter Burwell" },
  { title: "Drop in the Ocean" },
  { title: "Lose Yourself / Mockingbird", artist: "Eminem" },
  { title: "Free Bird", artist: "Lynyrd Skynyrd" },
  { title: "Golden Brown", artist: "The Stranglers" },
  { title: "Love Story", artist: "Indila" },
  { title: "Riptide", artist: "Vance Joy" },
  { title: "Pariwo", artist: "Prince Emmanuel" },
  { title: "Desire", artist: "Limoblaze, Emandiong" },
  { title: "Gimme! Gimme! Gimme!", artist: "ABBA" },
];

/** Paste a YouTube playlist URL here (or set it in the Songs page UI). */
export const PLAYLIST_URL: string | null = null;
