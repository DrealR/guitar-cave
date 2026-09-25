import { test } from "node:test";
import assert from "node:assert/strict";
import {
  BPM_MAX,
  BPM_MIN,
  DEFAULT_PULSE,
  clampBpm,
  nudgeBpm,
  sanitizePulse,
  secondsPerTick,
  tapTempo,
  tickInfo,
  ticksToSchedule,
} from "./pulse.ts";

/* ---- tempo bounds ---- */
test("clampBpm: rounds and holds the range", () => {
  assert.equal(clampBpm(70), 70);
  assert.equal(clampBpm(70.6), 71);
  assert.equal(clampBpm(5), BPM_MIN);
  assert.equal(clampBpm(999), BPM_MAX);
});

test("clampBpm: garbage falls back to the default slow beat", () => {
  assert.equal(clampBpm(Number.NaN), DEFAULT_PULSE.bpm);
  assert.equal(clampBpm(Number.POSITIVE_INFINITY), DEFAULT_PULSE.bpm);
});

test("nudgeBpm: steps and stays in range", () => {
  assert.equal(nudgeBpm(70, 5), 75);
  assert.equal(nudgeBpm(70, -5), 65);
  assert.equal(nudgeBpm(BPM_MIN, -5), BPM_MIN);
  assert.equal(nudgeBpm(BPM_MAX, 5), BPM_MAX);
});

/* ---- time math: the strum is time ---- */
test("secondsPerTick: quarters and eighths", () => {
  assert.equal(secondsPerTick(60, 1), 1);
  assert.equal(secondsPerTick(60, 2), 0.5);
  assert.equal(secondsPerTick(120, 1), 0.5);
  assert.equal(secondsPerTick(120, 2), 0.25);
});

test("tickInfo: quarters in 4 — only beat 1 is the downbeat", () => {
  const ticks = [0, 1, 2, 3, 4].map((i) => tickInfo(i, 4, 1));
  assert.deepEqual(
    ticks.map((t) => t.beat),
    [0, 1, 2, 3, 0],
  );
  assert.deepEqual(
    ticks.map((t) => t.isDownbeat),
    [true, false, false, false, true],
  );
  assert.ok(ticks.every((t) => t.isBeat));
  assert.deepEqual(
    ticks.map((t) => t.count),
    ["1", "2", "3", "4", "1"],
  );
  assert.ok(ticks.every((t) => t.stroke === "D"));
});

test("tickInfo: eighths — downs on the beat, ups on the &", () => {
  const ticks = [0, 1, 2, 3, 6, 7, 8].map((i) => tickInfo(i, 4, 2));
  assert.deepEqual(
    ticks.map((t) => t.count),
    ["1", "&", "2", "&", "4", "&", "1"],
  );
  assert.deepEqual(
    ticks.map((t) => t.stroke),
    ["D", "U", "D", "U", "D", "U", "D"],
  );
  assert.deepEqual(
    ticks.map((t) => t.isBeat),
    [true, false, true, false, true, false, true],
  );
  assert.equal(ticks[6].isDownbeat, true); // tick 8 wraps to bar start
  assert.equal(ticks[1].isDownbeat, false);
});

test("tickInfo: waltz time (3)", () => {
  assert.deepEqual(
    [0, 1, 2, 3].map((i) => tickInfo(i, 3, 1).beat),
    [0, 1, 2, 0],
  );
});

/* ---- lookahead scheduler ---- */
test("ticksToSchedule: fills the window, never past it", () => {
  const { times, next } = ticksToSchedule(1.0, 1.0, 0.1, 0.25);
  assert.deepEqual(times, [1.0]);
  assert.equal(next, 1.25);

  const wide = ticksToSchedule(1.0, 1.0, 0.6, 0.25);
  assert.deepEqual(wide.times, [1.0, 1.25, 1.5]);
  assert.equal(wide.next, 1.75);
});

test("ticksToSchedule: nothing due yet → no ticks, same next", () => {
  const { times, next } = ticksToSchedule(2.0, 1.0, 0.1, 0.5);
  assert.deepEqual(times, []);
  assert.equal(next, 2.0);
});

test("ticksToSchedule: a stalled tab skips missed ticks instead of a burst", () => {
  // the tab slept for 5s at 0.5s/tick: resume from now, not 10 stacked clicks
  const { times, next } = ticksToSchedule(1.0, 6.0, 0.1, 0.5);
  assert.ok(times.length <= 1);
  assert.ok(next > 6.0);
});

/* ---- tap tempo ---- */
test("tapTempo: steady taps at 500ms → 120 bpm", () => {
  assert.equal(tapTempo([0, 500, 1000, 1500]), 120);
});

test("tapTempo: needs two taps", () => {
  assert.equal(tapTempo([]), null);
  assert.equal(tapTempo([1000]), null);
});

test("tapTempo: a long pause starts a new count", () => {
  // old taps at 1000ms apart, then a 5s gap, then two taps 750ms apart → 80 bpm
  assert.equal(tapTempo([0, 1000, 2000, 7000, 7750]), 80);
});

test("tapTempo: uses only recent taps and clamps", () => {
  assert.equal(tapTempo([0, 100]), BPM_MAX); // 600 bpm → clamped
  const drift = [0, 1000, 2000, 3000, 3600, 4200, 4800, 5400];
  assert.equal(tapTempo(drift), 100); // last 4 intervals are 600ms
});

/* ---- storage boundary ---- */
test("sanitizePulse: valid settings pass through", () => {
  assert.deepEqual(sanitizePulse({ bpm: 90, beatsPerBar: 3, subdivision: 2 }), {
    bpm: 90,
    beatsPerBar: 3,
    subdivision: 2,
  });
});

test("sanitizePulse: malformed fields fall back field by field", () => {
  assert.deepEqual(sanitizePulse(null), DEFAULT_PULSE);
  assert.deepEqual(sanitizePulse("fast"), DEFAULT_PULSE);
  assert.deepEqual(sanitizePulse({ bpm: 900, beatsPerBar: 7, subdivision: 3 }), {
    bpm: BPM_MAX,
    beatsPerBar: DEFAULT_PULSE.beatsPerBar,
    subdivision: DEFAULT_PULSE.subdivision,
  });
});

test("sanitizePulse: returns a fresh object, never the default itself", () => {
  const a = sanitizePulse(undefined);
  assert.notEqual(a, DEFAULT_PULSE);
});
