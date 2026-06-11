import { noteAt, shortName } from "@/lib/music.ts";
import { chordNameAt, shapeAt, type ChordShape } from "@/lib/shapes.ts";
import { INTERVAL_FILL, INTERVAL_INK, prettyInterval } from "./interval-colors";

/* ============================================================
   Vertical chord diagram (standard chord-chart orientation):
   strings as columns (low E left → high e right), frets as
   rows going down. Pure render — server-compatible.
   Every dot obeys the interval color law.
   ============================================================ */

type Props = {
  shape: ChordShape;
  baseFret: number;
  size?: "sm" | "lg";
};

/* geometry in viewBox units — the SVG scales fluidly with its container */
const STRING_GAP = 28;
const ROW_GAP = 34;
const DOT_R = 11;
const PAD_L = 30;
const PAD_R = 14;
const GRID_TOP = 30;
const MIN_ROWS = 4;
const NUT_WINDOW_MAX = 4; // show the nut when everything fits in frets 1..4

type Position = ReturnType<typeof shapeAt>[number];
type HeaderCell = { text: string; fill: string; fontSize: number };

/** What sits above a string column: ✕ muted · ○ open · the note name it sounds. */
function headerCellFor(shape: ChordShape, positions: Position[], stringIdx: number): HeaderCell | null {
  if (shape.muted.includes(stringIdx)) {
    return { text: "✕", fill: "var(--color-faint)", fontSize: 12 };
  }
  const pos = positions.find((p) => p.string === stringIdx);
  if (!pos) return null;
  if (pos.fret === 0) {
    return { text: "○", fill: INTERVAL_FILL[pos.interval], fontSize: 13 };
  }
  return { text: shortName(noteAt(stringIdx, pos.fret)), fill: "var(--color-dim)", fontSize: 11.5 };
}

export default function ChordDiagram({ shape, baseFret, size = "sm" }: Props) {
  const positions = shapeAt(shape, baseFret);
  const fretted = positions.filter((p) => p.fret > 0);
  const maxFret = fretted.length > 0 ? Math.max(...fretted.map((p) => p.fret)) : 1;
  const minFret = fretted.length > 0 ? Math.min(...fretted.map((p) => p.fret)) : 1;
  const windowStart = maxFret <= NUT_WINDOW_MAX ? 1 : minFret;
  const numRows = Math.max(MIN_ROWS, maxFret - windowStart + 1);
  const showNut = windowStart === 1;

  const x = (stringIdx: number) => PAD_L + stringIdx * STRING_GAP;
  const rowY = (fret: number) => GRID_TOP + (fret - windowStart) * ROW_GAP + ROW_GAP / 2;
  const gridRight = PAD_L + 5 * STRING_GAP;
  const gridBottom = GRID_TOP + numRows * ROW_GAP;
  const width = gridRight + PAD_R;
  const height = gridBottom + 8;

  const name = chordNameAt(shape, baseFret);
  const barre =
    shape.barre && baseFret + shape.barre.offset > 0
      ? { from: shape.barre.fromString, to: shape.barre.toString, fret: baseFret + shape.barre.offset }
      : null;

  return (
    <figure className={`flex flex-col items-center ${size === "lg" ? "w-full max-w-72" : "w-full max-w-36"}`}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full"
        role="img"
        aria-label={`${name} chord diagram — ${shape.shapeName}`}
      >
        {/* above each string: note name / ○ open / ✕ muted */}
        {Array.from({ length: 6 }, (_, s) => {
          const cell = headerCellFor(shape, positions, s);
          if (!cell) return null;
          return (
            <text key={s} x={x(s)} y={20} textAnchor="middle" fontSize={cell.fontSize} fontWeight={600} fill={cell.fill}>
              {cell.text}
            </text>
          );
        })}

        {/* nut (thick top line) or base-fret number beside the first row */}
        {showNut ? (
          <rect x={PAD_L - 2} y={GRID_TOP - 5} width={5 * STRING_GAP + 4} height={5} rx={2} fill="var(--color-text)" />
        ) : (
          <text
            x={PAD_L - 9}
            y={rowY(windowStart) + 4}
            textAnchor="end"
            fontSize={11.5}
            fontWeight={600}
            fill="var(--color-dim)"
          >
            {windowStart}fr
          </text>
        )}

        {/* fret lines (rows) */}
        {Array.from({ length: numRows + 1 }, (_, r) => (
          <line
            key={r}
            x1={PAD_L}
            y1={GRID_TOP + r * ROW_GAP}
            x2={gridRight}
            y2={GRID_TOP + r * ROW_GAP}
            stroke="var(--color-line)"
            strokeWidth={1.5}
          />
        ))}

        {/* strings (columns) */}
        {Array.from({ length: 6 }, (_, s) => (
          <line key={s} x1={x(s)} y1={GRID_TOP} x2={x(s)} y2={gridBottom} stroke="var(--color-line)" strokeWidth={1.5} />
        ))}

        {/* barre — rounded bar across its strings */}
        {barre && (
          <rect
            x={x(barre.from) - (DOT_R + 3)}
            y={rowY(barre.fret) - (DOT_R + 3)}
            width={(barre.to - barre.from) * STRING_GAP + 2 * (DOT_R + 3)}
            height={2 * (DOT_R + 3)}
            rx={DOT_R + 3}
            fill="var(--color-text)"
            fillOpacity={0.13}
          />
        )}

        {/* dots colored by interval, interval label inside */}
        {fretted.map((p) => (
          <g key={p.string}>
            <circle cx={x(p.string)} cy={rowY(p.fret)} r={DOT_R} fill={INTERVAL_FILL[p.interval]} />
            <text
              x={x(p.string)}
              y={rowY(p.fret) + 3.5}
              textAnchor="middle"
              fontSize={10}
              fontWeight={700}
              fill={INTERVAL_INK[p.interval]}
            >
              {prettyInterval(p.interval)}
            </text>
          </g>
        ))}
      </svg>

      <figcaption className="mt-1 text-center">
        <div className={size === "lg" ? "text-2xl font-bold" : "text-sm font-bold"}>{name}</div>
        {shape.shapeName !== name && (
          <div className={`text-dim ${size === "lg" ? "text-xs" : "text-[0.65rem]"}`}>{shape.shapeName}</div>
        )}
      </figcaption>
    </figure>
  );
}
