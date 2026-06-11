import type { IntervalLabel } from "@/lib/music.ts";

/* ============================================================
   THE INTERVAL COLOR LAW — one map, whole app.
   R = gold · 3/b3 = blue · 5/b5 = gray · 7/b7 = purple
   ============================================================ */

export const INTERVAL_FILL: Record<IntervalLabel, string> = {
  R: "var(--color-root)",
  "3": "var(--color-third)",
  b3: "var(--color-third)",
  "5": "var(--color-fifth)",
  b5: "var(--color-fifth)",
  "7": "var(--color-seventh)",
  b7: "var(--color-seventh)",
};

/** Dark ink for text sitting ON an interval-colored dot (mirrors .dot-* classes). */
export const INTERVAL_INK: Record<IntervalLabel, string> = {
  R: "#14110a",
  "3": "#0b1320",
  b3: "#0b1320",
  "5": "#11141a",
  b5: "#11141a",
  "7": "#160d1d",
  b7: "#160d1d",
};

/** "b3" → "♭3" for display. */
export function prettyInterval(interval: IntervalLabel): string {
  return interval.replace("b", "♭");
}
