"use client";

import { useState } from "react";
import { shortName } from "@/lib/music.ts";
import { MOVEABLE_SHAPES, chordNameAt, chordRootAt } from "@/lib/shapes.ts";
import ChordDiagram from "./ChordDiagram";

/* ============================================================
   Slide the shape — the core insight, live.
   The shape carries the QUALITY. The fret carries the LETTER.
   ============================================================ */

const MIN_FRET = 1;
const MAX_FRET = 12;

/* big thumb (≥28px) — scoped slider styles; range pseudo-elements
   cannot be styled inline, so this small style block ships with the section */
const SLIDER_CSS = `
.gc-fret-slider {
  -webkit-appearance: none;
  appearance: none;
  height: 10px;
  border-radius: 999px;
  background: var(--color-surface-2);
  border: 1px solid var(--color-line);
}
.gc-fret-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 30px;
  height: 30px;
  border-radius: 999px;
  background: var(--color-root);
  border: 3px solid #14110a;
  cursor: grab;
}
.gc-fret-slider::-moz-range-thumb {
  width: 30px;
  height: 30px;
  border-radius: 999px;
  background: var(--color-root);
  border: 3px solid #14110a;
  cursor: grab;
}
`;

const LEGEND = [
  { color: "var(--color-root)", label: "root" },
  { color: "var(--color-third)", label: "3rd" },
  { color: "var(--color-fifth)", label: "5th" },
] as const;

export default function SlideShapeSection() {
  const [shapeId, setShapeId] = useState(MOVEABLE_SHAPES[0].id);
  const [fret, setFret] = useState(3);

  const shape = MOVEABLE_SHAPES.find((s) => s.id === shapeId) ?? MOVEABLE_SHAPES[0];
  const name = chordNameAt(shape, fret);
  const rootNote = shortName(chordRootAt(shape, fret));
  const rootStringNumber = 6 - shape.rootString; // string 0 = 6th, 1 = 5th, 2 = 4th
  const rootFret = fret + shape.rootOffset;

  const step = (delta: number) =>
    setFret((f) => Math.min(MAX_FRET, Math.max(MIN_FRET, f + delta)));

  return (
    <section className="flex flex-col gap-4" aria-label="Slide the shape">
      <style>{SLIDER_CSS}</style>

      {/* the law */}
      <div className="card p-4 text-center">
        <p className="text-sm font-extrabold uppercase tracking-wider">
          The shape carries the <span className="text-third">quality</span>.{" "}
          The fret carries the <span className="text-root">letter</span>.
        </p>
        <p className="mt-2 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-dim">
          <span>The interval structure stays gold-blue-gray as it slides:</span>
          {LEGEND.map((l) => (
            <span key={l.label} className="legend">
              <i style={{ background: l.color }} />
              {l.label}
            </span>
          ))}
        </p>
      </div>

      {/* shape picker */}
      <div className="flex flex-wrap gap-2">
        {MOVEABLE_SHAPES.map((s) => (
          <button
            key={s.id}
            type="button"
            className="chip"
            data-on={s.id === shape.id}
            aria-pressed={s.id === shape.id}
            onClick={() => setShapeId(s.id)}
          >
            {s.birthplace} {s.quality}
          </button>
        ))}
      </div>

      <div className="card flex flex-col items-center gap-4 p-4">
        <ChordDiagram shape={shape} baseFret={fret} size="lg" />

        {/* fret control: ◀ slider ▶ */}
        <div className="flex w-full max-w-md items-center gap-3">
          <button
            type="button"
            className="chip justify-center disabled:pointer-events-none disabled:opacity-40"
            aria-label="One fret down"
            disabled={fret <= MIN_FRET}
            onClick={() => step(-1)}
          >
            ◀
          </button>
          <input
            type="range"
            className="gc-fret-slider min-w-0 flex-1"
            min={MIN_FRET}
            max={MAX_FRET}
            step={1}
            value={fret}
            aria-label="Base fret"
            aria-valuetext={`Fret ${fret} — ${name}`}
            onChange={(e) => setFret(Number(e.target.value))}
          />
          <button
            type="button"
            className="chip justify-center disabled:pointer-events-none disabled:opacity-40"
            aria-label="One fret up"
            disabled={fret >= MAX_FRET}
            onClick={() => step(1)}
          >
            ▶
          </button>
        </div>
        <p className="font-mono text-xs text-faint">
          fret {fret} of {MAX_FRET}
        </p>

        {/* root-string callout */}
        <p className="rounded-lg border border-line bg-surface-2 px-4 py-3 text-center text-sm text-dim">
          Reading string {rootStringNumber}: fret {rootFret} ={" "}
          <strong className="text-root">{rootNote}</strong> →{" "}
          <strong className="text-text">{name}</strong>
        </p>

        {shape.tip && <p className="text-center text-xs italic text-dim">{shape.tip}</p>}
      </div>

      <p className="text-center text-xs text-faint">
        Shapes are named for their open-chord birthplaces (C-A-G-E-D). No open B chord → no B shape.
      </p>
    </section>
  );
}
