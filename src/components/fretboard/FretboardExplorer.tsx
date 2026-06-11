"use client";

/* ============================================================
   FretboardExplorer — page logic for /fretboard.
   Explore: tap a note → every place that pitch lives (octave finder).
   Scales: pick root + type → the family lights up.
   ============================================================ */

import { useMemo, useState } from "react";
import Fretboard, { type HighlightKind } from "./Fretboard";
import {
  SCALES,
  displayName,
  noteAt,
  octavePartner,
  positionsOf,
  scaleNotes,
  type PitchClass,
  type ScaleType,
} from "@/lib/music.ts";

type Mode = "explore" | "scales";
type Position = { string: number; fret: number };

const ROOTS: PitchClass[] = Array.from({ length: 12 }, (_, i) => i);
const SCALE_TYPES = Object.keys(SCALES) as ScaleType[];
const STRING_PHRASE = ["low-E", "A-string", "D-string", "G-string", "B-string", "high-e"];

export default function FretboardExplorer() {
  const [mode, setMode] = useState<Mode>("explore");
  const [naturalsOnly, setNaturalsOnly] = useState(false);
  const [dual, setDual] = useState(true);
  const [selected, setSelected] = useState<Position | null>(null);
  const [root, setRoot] = useState<PitchClass>(0);
  const [scaleType, setScaleType] = useState<ScaleType>("major");

  const selectedPc = selected ? noteAt(selected.string, selected.fret) : null;

  const highlight = useMemo(() => {
    if (mode === "explore") {
      if (!selected || selectedPc === null) return undefined;
      const explore = (pc: PitchClass, string: number, fret: number): HighlightKind | null => {
        if (pc !== selectedPc) return null;
        return string === selected.string && fret === selected.fret ? "selected" : "octave";
      };
      return explore;
    }
    const notes = scaleNotes(root, scaleType);
    const scale = (pc: PitchClass): HighlightKind | null =>
      pc === root ? "root" : notes.includes(pc) ? "scale" : null;
    return scale;
  }, [mode, selected, selectedPc, root, scaleType]);

  function handleTap(string: number, fret: number, pc: PitchClass) {
    if (mode === "explore") {
      setSelected((prev) =>
        prev && prev.string === string && prev.fret === fret ? null : { string, fret },
      );
      return;
    }
    setRoot(pc); /* in Scales mode, tapping the board re-roots the scale */
  }

  const selectedName = selectedPc !== null ? displayName(selectedPc, dual) : "";
  const placeCount = selectedPc !== null ? positionsOf(selectedPc).length : 0;
  const partner = selected ? octavePartner(selected.string, selected.fret) : null;

  return (
    <div className="flex flex-col gap-4">
      {/* mode */}
      <div role="group" aria-label="Mode" className="flex flex-wrap gap-2">
        {(["explore", "scales"] as const).map((m) => (
          <button
            key={m}
            type="button"
            className="chip"
            data-on={mode === m}
            onClick={() => setMode(m)}
          >
            {m === "explore" ? "Explore" : "Scales"}
          </button>
        ))}
      </div>

      {mode === "scales" && (
        <>
          <div role="group" aria-label="Root note" className="flex flex-wrap gap-1.5">
            {ROOTS.map((pc) => (
              <button
                key={pc}
                type="button"
                className="chip"
                data-on={pc === root}
                onClick={() => setRoot(pc)}
              >
                {displayName(pc, dual)}
              </button>
            ))}
          </div>
          <div role="group" aria-label="Scale type" className="flex flex-wrap gap-1.5">
            {SCALE_TYPES.map((t) => (
              <button
                key={t}
                type="button"
                className="chip"
                data-on={t === scaleType}
                onClick={() => setScaleType(t)}
              >
                {SCALES[t].name}
              </button>
            ))}
          </div>
        </>
      )}

      <Fretboard
        highlight={highlight}
        naturalsOnly={naturalsOnly}
        dual={dual}
        onTapNote={handleTap}
      />

      {/* legend */}
      <div className="flex flex-wrap items-center gap-4">
        <span className="legend">
          <i className="bg-root" /> root
        </span>
        <span className="legend">
          <i className="bg-third" /> scale note
        </span>
        <span className="legend">
          <i className="ring-2 ring-inset ring-root" /> octave
        </span>
      </div>

      {/* display toggles */}
      <div role="group" aria-label="Display options" className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          className="chip"
          data-on={naturalsOnly}
          onClick={() => setNaturalsOnly(true)}
        >
          Naturals only
        </button>
        <button
          type="button"
          className="chip"
          data-on={!naturalsOnly}
          onClick={() => setNaturalsOnly(false)}
        >
          All 12
        </button>
        <span aria-hidden className="text-faint">
          ·
        </span>
        <button
          type="button"
          className="chip"
          data-on={dual}
          aria-pressed={dual}
          onClick={() => setDual((d) => !d)}
        >
          Dual names (F#/Gb)
        </button>
      </div>

      {/* info card */}
      {mode === "explore" &&
        (selected && selectedPc !== null ? (
          <div className="card relative p-4 pr-14">
            <button
              type="button"
              aria-label="Clear selection"
              onClick={() => setSelected(null)}
              className="absolute right-1.5 top-1.5 flex h-11 w-11 items-center justify-center rounded-full text-dim transition-colors hover:text-text"
            >
              ✕
            </button>
            <p className="font-semibold">
              {selectedName} lives in {placeCount} places on this board.
            </p>
            <p className="mt-1 text-sm text-dim">
              From string 6 or 5: up 2 strings, over 2 frets = the same note, one octave up.
            </p>
            {partner && (
              <p className="mt-1 text-sm text-dim">
                {STRING_PHRASE[selected.string]} fret {selected.fret} {selectedName} ↔{" "}
                {STRING_PHRASE[partner.string]} fret {partner.fret} {selectedName}
              </p>
            )}
          </div>
        ) : (
          <div className="card p-4 text-sm text-dim">
            Tap any note to see every place that pitch lives on the board.
          </div>
        ))}

      {mode === "scales" && (
        <div className="card p-4">
          <p className="font-semibold">
            {displayName(root, dual)} {SCALES[scaleType].name}
          </p>
          <p className="mt-1 font-mono text-sm text-root">{SCALES[scaleType].formula}</p>
          <p className="mt-1 text-sm text-dim">
            A scale picks 7 of the 12. The pentatonic keeps 5. Same 12 notes, different family
            chosen.
          </p>
        </div>
      )}

      {/* how the board works */}
      <div className="card p-4">
        <p className="text-xs text-dim">The 12 repeat at fret 12 — the octave is a doubling.</p>
        <p className="mt-1.5 text-xs text-dim">
          String crossing = +5 frets (G→B = +4): the strings fold the ruler.
        </p>
      </div>
    </div>
  );
}
