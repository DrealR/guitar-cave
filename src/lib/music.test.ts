import { test } from "node:test";
import assert from "node:assert/strict";
import {
  noteAt,
  shortName,
  scaleNotes,
  keyFamily,
  octavePartner,
  pcOf,
} from "./music.ts";
import { MOVEABLE_SHAPES, OPEN_CHORDS, chordNameAt, shapeAt } from "./shapes.ts";

const byId = (id: string) =>
  [...MOVEABLE_SHAPES, ...OPEN_CHORDS].find((s) => s.id === id)!;

/* ---- the fundamental: note math ---- */
test("noteAt: known landmarks", () => {
  assert.equal(shortName(noteAt(0, 0)), "E"); // open low E
  assert.equal(shortName(noteAt(0, 3)), "G"); // low-E fret 3
  assert.equal(shortName(noteAt(0, 5)), "A");
  assert.equal(shortName(noteAt(1, 3)), "C"); // A-string fret 3
  assert.equal(shortName(noteAt(2, 5)), "G"); // D-string fret 5
  assert.equal(shortName(noteAt(0, 12)), "E"); // the 12 repeats
  assert.equal(shortName(noteAt(5, 0)), "E"); // high e
});

test("octave shape: +2 strings +2 frets = same note", () => {
  const p = octavePartner(0, 3)!; // G on low E
  assert.deepEqual(p, { string: 2, fret: 5 });
  assert.equal(noteAt(p.string, p.fret), noteAt(0, 3));
  const q = octavePartner(1, 3)!; // C on A string → D string... +2 strings = G string? no: string 1 → 3
  assert.equal(noteAt(q.string, q.fret), noteAt(1, 3));
});

/* ---- the brief's required test: E/A-shape naming, frets 1–12 ---- */
test("E-shape barre naming frets 1-12 (read string 6)", () => {
  const want = ["F", "F#", "G", "G#", "A", "A#", "B", "C", "C#", "D", "D#", "E"];
  const shape = byId("e-major");
  for (let f = 1; f <= 12; f++) assert.equal(chordNameAt(shape, f), want[f - 1], `fret ${f}`);
  const minor = byId("e-minor");
  for (let f = 1; f <= 12; f++) assert.equal(chordNameAt(minor, f), want[f - 1] + "m", `fret ${f}m`);
});

test("A-shape barre naming frets 1-12 (read string 5)", () => {
  const want = ["A#", "B", "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A"];
  const shape = byId("a-major");
  for (let f = 1; f <= 12; f++) assert.equal(chordNameAt(shape, f), want[f - 1], `fret ${f}`);
  const minor = byId("a-minor");
  for (let f = 1; f <= 12; f++) assert.equal(chordNameAt(minor, f), want[f - 1] + "m", `fret ${f}m`);
});

test("D-shape naming (read string 4): fret 5 = G — the brief's own example x2", () => {
  assert.equal(chordNameAt(byId("d-minor"), 5), "Gm"); // "D minor shape at fret 5 = G minor"
  assert.equal(chordNameAt(byId("d-major"), 5), "G");
  assert.equal(chordNameAt(byId("e-major"), 3), "G"); // "E-shape barre at fret 3 → G major"
});

/* ---- every shape's intervals are honest (R=0, 3=4, b3=3, 5=7 semitones) ---- */
test("interval anatomy: 5th always 7 半 from root; 3=4; b3=3", () => {
  const SEMI: Record<string, number> = { R: 0, b3: 3, "3": 4, "5": 7, b7: 10 };
  for (const shape of [...MOVEABLE_SHAPES, ...OPEN_CHORDS]) {
    const base = shape.moveable ? 4 : shape.openBase ?? 0;
    const placed = shapeAt(shape, base);
    const root = placed.find((n) => n.interval === "R")!;
    for (const n of placed) {
      const dist = (n.pc - root.pc + 12) % 12;
      assert.equal(dist, SEMI[n.interval], `${shape.id}: ${n.interval} on string ${n.string}`);
    }
  }
});

/* ---- open chords name themselves correctly ---- */
test("open chords compute their own names", () => {
  const expect: Record<string, string> = {
    "open-e": "E", "open-em": "Em", "open-a": "A", "open-am": "Am",
    "open-c": "C", "open-d": "D", "open-dm": "Dm", "open-g": "G",
    "open-b7": "B7", "open-f": "F", "open-f-over-c": "F/C",
  };
  for (const [id, name] of Object.entries(expect)) {
    const s = byId(id);
    assert.equal(chordNameAt(s, s.openBase ?? 0), name, id);
  }
});

/* ---- scales ---- */
test("C major = the naturals; A minor = same 7", () => {
  assert.deepEqual(scaleNotes(pcOf("C"), "major").map(shortName), ["C", "D", "E", "F", "G", "A", "B"]);
  assert.deepEqual(scaleNotes(pcOf("A"), "minor").map(shortName), ["A", "B", "C", "D", "E", "F", "G"]);
  assert.deepEqual(scaleNotes(pcOf("A"), "minorPentatonic").map(shortName), ["A", "C", "D", "E", "G"]);
  assert.deepEqual(scaleNotes(pcOf("G"), "majorPentatonic").map(shortName), ["G", "A", "B", "D", "E"]);
});

/* ---- key families ---- */
test("key of G: G Am Bm C D Em F#°", () => {
  assert.deepEqual(keyFamily(pcOf("G")).map((c) => c.name), ["G", "Am", "Bm", "C", "D", "Em", "F#°"]);
});
test("key of C: C Dm Em F G Am B°", () => {
  assert.deepEqual(keyFamily(pcOf("C")).map((c) => c.name), ["C", "Dm", "Em", "F", "G", "Am", "B°"]);
});
test("Stand By Me in G: 1-6-4-5 = G Em C D", () => {
  const fam = keyFamily(pcOf("G"));
  assert.deepEqual([1, 6, 4, 5].map((d) => fam[d - 1].name), ["G", "Em", "C", "D"]);
});
test("Three Little Birds in A: 1-4-5 = A D E", () => {
  const fam = keyFamily(pcOf("A"));
  assert.deepEqual([1, 4, 5].map((d) => fam[d - 1].name), ["A", "D", "E"]);
});
