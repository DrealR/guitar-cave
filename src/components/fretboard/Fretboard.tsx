"use client";

/* ============================================================
   Fretboard — THE board. Self-contained and prop-driven so
   every page (scales, chords, songs) can reuse it.
   Player's view: high e on top, low E at the bottom.
   ============================================================ */

import {
  DOUBLE_MARKER_FRET,
  FRETS,
  MARKER_FRETS,
  STRING_LABELS,
  displayName,
  isNatural,
  noteAt,
  shortName,
  type PitchClass,
} from "@/lib/music.ts";

export type HighlightKind = "root" | "scale" | "octave" | "selected";

export type FretboardProps = {
  /** How a position should light up, or null for plain. */
  highlight?: (pc: PitchClass, string: number, fret: number) => HighlightKind | null;
  /** Show note names on naturals only (highlights always show theirs). */
  naturalsOnly?: boolean;
  /** Dual accidental names: "F#/Gb" stacked tiny. */
  dual?: boolean;
  onTapNote?: (string: number, fret: number, pc: PitchClass) => void;
  frets?: number;
};

/** Row order top → bottom (player's view): high e … low E. */
const DISPLAY_STRINGS = [5, 4, 3, 2, 1, 0] as const;

/** String "gauge" in px — thicker toward low E (index 0). */
const STRING_THICKNESS_PX = [3.5, 3, 2.5, 2, 1.5, 1] as const;

const ROW_H = "h-10"; /* 40px per string row */
const BOARD_H = "h-60"; /* 6 rows × 40px */

function highlightClasses(kind: HighlightKind | null, natural: boolean): string {
  switch (kind) {
    case "root":
      return "dot-root font-bold";
    case "scale":
      return "bg-[color-mix(in_srgb,var(--color-third)_30%,var(--color-surface))] text-text ring-1 ring-third/70 font-semibold";
    case "octave":
      return "bg-surface text-root ring-2 ring-root font-semibold";
    case "selected":
      return "bg-[color-mix(in_srgb,var(--color-accent)_18%,var(--color-surface))] text-accent ring-2 ring-accent font-bold";
    default:
      return natural ? "text-dim" : "text-faint";
  }
}

function NoteName({ pc, dual }: { pc: PitchClass; dual: boolean }) {
  if (isNatural(pc)) return <span className="text-[11px]">{shortName(pc)}</span>;
  if (!dual) return <span className="text-[10px]">{shortName(pc)}</span>;
  const [sharp, flat] = displayName(pc, true).split("/");
  return (
    <span className="flex flex-col items-center text-[8px] leading-[1.15]">
      <span>{sharp}</span>
      <span>{flat}</span>
    </span>
  );
}

type CellProps = {
  stringIdx: number;
  fret: number;
  highlight?: FretboardProps["highlight"];
  naturalsOnly: boolean;
  dual: boolean;
  onTapNote?: FretboardProps["onTapNote"];
};

function NoteCell({ stringIdx, fret, highlight, naturalsOnly, dual, onTapNote }: CellProps) {
  const pc = noteAt(stringIdx, fret);
  const kind = highlight ? highlight(pc, stringIdx, fret) : null;
  const natural = isNatural(pc);
  const showName = kind !== null || natural || !naturalsOnly;
  return (
    <div className={`relative flex ${ROW_H} items-center justify-center`}>
      {/* the string itself */}
      <span
        aria-hidden
        className="absolute inset-x-0 top-1/2 -translate-y-1/2 bg-faint/50"
        style={{ height: `${STRING_THICKNESS_PX[stringIdx]}px` }}
      />
      <button
        type="button"
        aria-label={`${displayName(pc, dual)}, string ${6 - stringIdx}, fret ${fret}`}
        aria-pressed={kind === "selected" || undefined}
        onClick={onTapNote ? () => onTapNote(stringIdx, fret, pc) : undefined}
        className={`relative z-10 flex h-9 w-9 items-center justify-center rounded-full transition-colors ${highlightClasses(
          kind,
          natural,
        )} ${onTapNote ? "cursor-pointer" : "cursor-default"} ${
          onTapNote && kind === null ? "hover:bg-surface-2" : ""
        }`}
      >
        {showName ? <NoteName pc={pc} dual={dual} /> : null}
      </button>
    </div>
  );
}

function Marker({ position }: { position: string }) {
  return (
    <span
      aria-hidden
      className={`absolute left-1/2 z-0 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-line ${position}`}
    />
  );
}

function FretNumber({ fret, marked }: { fret: number; marked: boolean }) {
  return (
    <div
      aria-hidden
      className={`flex h-6 items-center justify-center font-mono text-[10px] ${
        marked ? "font-bold text-dim" : "text-faint"
      }`}
    >
      {fret}
    </div>
  );
}

type ColumnProps = Omit<CellProps, "stringIdx">;

function FretColumn({ fret, highlight, naturalsOnly, dual, onTapNote }: ColumnProps) {
  const open = fret === 0;
  const single = MARKER_FRETS.includes(fret);
  const double = fret === DOUBLE_MARKER_FRET;
  return (
    <div className={`flex flex-col ${open ? "w-12 bg-surface-2/40" : "w-14"}`}>
      <FretNumber fret={fret} marked={single || double} />
      <div className={`relative ${open ? "" : "border-r border-line"}`}>
        {single && <Marker position="top-1/2" />}
        {double && (
          <>
            <Marker position="top-1/3" />
            <Marker position="top-2/3" />
          </>
        )}
        {DISPLAY_STRINGS.map((s) => (
          <NoteCell
            key={s}
            stringIdx={s}
            fret={fret}
            highlight={highlight}
            naturalsOnly={naturalsOnly}
            dual={dual}
            onTapNote={onTapNote}
          />
        ))}
      </div>
      <FretNumber fret={fret} marked={single || double} />
    </div>
  );
}

export default function Fretboard({
  highlight,
  naturalsOnly = false,
  dual = true,
  onTapNote,
  frets = FRETS,
}: FretboardProps) {
  const fretCols = Array.from({ length: frets }, (_, i) => i + 1);
  const shared = { highlight, naturalsOnly, dual, onTapNote };
  return (
    <div className="card overflow-x-auto">
      <div className="flex w-max min-w-[760px] px-3 py-2">
        {/* sticky string labels — stay visible while the board scrolls */}
        <div className="sticky left-0 z-20 flex flex-col bg-surface pl-1 pr-2">
          <div className="h-6" aria-hidden />
          {DISPLAY_STRINGS.map((s) => (
            <div
              key={s}
              className={`flex ${ROW_H} items-center justify-end font-mono text-xs text-dim`}
            >
              {STRING_LABELS[s]}
            </div>
          ))}
          <div className="h-6" aria-hidden />
        </div>

        {/* fret 0 — the open notes, before the nut */}
        <FretColumn fret={0} {...shared} />

        {/* the nut */}
        <div className="flex flex-col" aria-hidden>
          <div className="h-6" />
          <div className={`${BOARD_H} w-1.5 rounded-full bg-dim/80`} />
          <div className="h-6" />
        </div>

        {fretCols.map((f) => (
          <FretColumn key={f} fret={f} {...shared} />
        ))}
      </div>
    </div>
  );
}
