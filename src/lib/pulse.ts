/* ============================================================
   The Pulse — metronome math. The strum is time: the right hand
   is the pulse, and chords are bodies that appear within it.
   Pure functions only; the audio engine lives in
   src/components/pulse and schedules against these.
   ============================================================ */

export const BPM_MIN = 30;
export const BPM_MAX = 240;
export const BPM_STEP = 5;

/** Quarters = one click per beat; eighths = D on the beat, U on the "&". */
export type Subdivision = 1 | 2;
export const BEATS_PER_BAR_OPTIONS = [2, 3, 4] as const;
export type BeatsPerBar = (typeof BEATS_PER_BAR_OPTIONS)[number];

export type PulseSettings = {
  bpm: number;
  beatsPerBar: BeatsPerBar;
  subdivision: Subdivision;
};

/* "Choose a slow beat" — the protocol's first minute. */
export const DEFAULT_PULSE: Readonly<PulseSettings> = Object.freeze({
  bpm: 70,
  beatsPerBar: 4,
  subdivision: 1,
});

/** A new tap count starts after this much silence. */
export const TAP_RESET_MS = 2000;
/** Tap tempo averages only the most recent intervals. */
export const TAP_WINDOW = 4;

export function clampBpm(bpm: number): number {
  if (!Number.isFinite(bpm)) return DEFAULT_PULSE.bpm;
  return Math.min(BPM_MAX, Math.max(BPM_MIN, Math.round(bpm)));
}

export function nudgeBpm(bpm: number, delta: number): number {
  return clampBpm(bpm + delta);
}

export function secondsPerTick(bpm: number, subdivision: Subdivision): number {
  return 60 / clampBpm(bpm) / subdivision;
}

export type TickInfo = {
  /** 0-based beat within the bar */
  beat: number;
  /** true on a beat (not an "&") */
  isBeat: boolean;
  /** true on beat 1 — the accent */
  isDownbeat: boolean;
  /** what you'd count out loud: "1", "&", "2"… */
  count: string;
  /** the hand: down on the beat, up on the & */
  stroke: "D" | "U";
};

export function tickInfo(tick: number, beatsPerBar: number, subdivision: Subdivision): TickInfo {
  const ticksPerBar = beatsPerBar * subdivision;
  const inBar = ((tick % ticksPerBar) + ticksPerBar) % ticksPerBar;
  const beat = Math.floor(inBar / subdivision);
  const isBeat = inBar % subdivision === 0;
  return {
    beat,
    isBeat,
    isDownbeat: inBar === 0,
    count: isBeat ? String(beat + 1) : "&",
    stroke: isBeat ? "D" : "U",
  };
}

/**
 * The lookahead scheduler (the "tale of two clocks" pattern): a coarse JS
 * timer asks which ticks fall inside [now, now + lookahead) and hands them to
 * the precise audio clock. If the tab stalled and we fell more than a tick
 * behind, we realign to `now` instead of firing a burst of stale clicks —
 * the pulse recovers and continues.
 */
export function ticksToSchedule(
  nextTickTime: number,
  now: number,
  lookahead: number,
  tickSeconds: number,
): { times: number[]; next: number } {
  let next = nextTickTime < now - tickSeconds ? now : nextTickTime;
  const times: number[] = [];
  while (next < now + lookahead) {
    times.push(next);
    next += tickSeconds;
  }
  return { times, next };
}

/** BPM from tap timestamps (ms), or null until there are two taps in a run. */
export function tapTempo(tapsMs: readonly number[]): number | null {
  let start = tapsMs.length - 1;
  while (start > 0 && tapsMs[start] - tapsMs[start - 1] <= TAP_RESET_MS) start -= 1;
  const run = tapsMs.slice(Math.max(start, tapsMs.length - 1 - TAP_WINDOW));
  if (run.length < 2) return null;
  const avgMs = (run[run.length - 1] - run[0]) / (run.length - 1);
  if (avgMs <= 0) return null;
  return clampBpm(60000 / avgMs);
}

/* ---- storage boundary: never trust what comes out of localStorage ---- */

function isBeatsPerBar(v: unknown): v is BeatsPerBar {
  return (BEATS_PER_BAR_OPTIONS as readonly unknown[]).includes(v);
}

function isSubdivision(v: unknown): v is Subdivision {
  return v === 1 || v === 2;
}

/** Field-by-field: anything malformed falls back to the default. */
export function sanitizePulse(raw: unknown): PulseSettings {
  if (typeof raw !== "object" || raw === null) return { ...DEFAULT_PULSE };
  const o = raw as Record<string, unknown>;
  return {
    bpm: typeof o.bpm === "number" ? clampBpm(o.bpm) : DEFAULT_PULSE.bpm,
    beatsPerBar: isBeatsPerBar(o.beatsPerBar) ? o.beatsPerBar : DEFAULT_PULSE.beatsPerBar,
    subdivision: isSubdivision(o.subdivision) ? o.subdivision : DEFAULT_PULSE.subdivision,
  };
}
