"use client";

/* ============================================================
   The Pulse engine — one module-level metronome behind
   useSyncExternalStore, so the beat keeps going while you flip
   to Songs or Chords. A 25ms JS timer looks ahead; the Web
   Audio clock plays each click sample-accurately.
   State is replaced wholesale on every change, never mutated.
   ============================================================ */

import { useSyncExternalStore } from "react";
import {
  DEFAULT_PULSE,
  sanitizePulse,
  secondsPerTick,
  tickInfo,
  ticksToSchedule,
  type PulseSettings,
  type TickInfo,
} from "@/lib/pulse.ts";

const LOOKAHEAD_S = 0.1;
const TIMER_MS = 25;
const START_DELAY_S = 0.06;
const CLICK_S = 0.05;

/* downbeat high · beat mid · "&" low and soft */
const CLICK_VOICE = {
  downbeat: { hz: 1568, peak: 0.9 },
  beat: { hz: 1046, peak: 0.6 },
  and: { hz: 784, peak: 0.3 },
} as const;

export type PulseState = Readonly<{
  running: boolean;
  /** index of the tick currently sounding, -1 before the first */
  tick: number;
  info: TickInfo | null;
  settings: PulseSettings;
  error: string | null;
}>;

const IDLE: PulseState = Object.freeze({
  running: false,
  tick: -1,
  info: null,
  settings: { ...DEFAULT_PULSE },
  error: null,
});

let state: PulseState = IDLE;
const listeners = new Set<() => void>();

let ctx: AudioContext | null = null;
let timer: ReturnType<typeof setInterval> | null = null;
let nextTickTime = 0;
let nextTickIndex = 0;
/** bumps on every start/stop so stale visual timeouts become no-ops */
let runId = 0;
let wakeLock: WakeLockSentinel | null = null;
let visibilityHooked = false;
/** guards a double-tap while audio is still unlocking */
let starting = false;

function setState(patch: Partial<PulseState>): void {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

/* ---- sound ---- */

function playClick(ac: AudioContext, time: number, info: TickInfo): void {
  const voice = info.isDownbeat ? CLICK_VOICE.downbeat : info.isBeat ? CLICK_VOICE.beat : CLICK_VOICE.and;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.frequency.value = voice.hz;
  gain.gain.setValueAtTime(0.0001, time);
  gain.gain.exponentialRampToValueAtTime(voice.peak, time + 0.002);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + CLICK_S);
  osc.connect(gain).connect(ac.destination);
  osc.start(time);
  osc.stop(time + CLICK_S + 0.01);
}

function schedule(): void {
  const ac = ctx;
  if (!ac || !state.running) return;
  const { bpm, beatsPerBar, subdivision } = state.settings;
  const { times, next } = ticksToSchedule(
    nextTickTime,
    ac.currentTime,
    LOOKAHEAD_S,
    secondsPerTick(bpm, subdivision),
  );
  const id = runId;
  times.forEach((time, k) => {
    const index = nextTickIndex + k;
    const info = tickInfo(index, beatsPerBar, subdivision);
    playClick(ac, time, info);
    const delayMs = Math.max(0, (time - ac.currentTime) * 1000);
    setTimeout(() => {
      if (id === runId && state.running) setState({ tick: index, info });
    }, delayMs);
  });
  nextTickIndex += times.length;
  nextTickTime = next;
}

/* ---- keep the phone awake while the pulse runs ---- */

async function acquireWakeLock(): Promise<void> {
  if (typeof navigator === "undefined" || !("wakeLock" in navigator)) return;
  try {
    wakeLock = await navigator.wakeLock.request("screen");
  } catch (err) {
    // denied (low battery, not visible) — the pulse still runs
    console.warn("guitar-cave: screen wake lock unavailable", err);
    wakeLock = null;
  }
}

function releaseWakeLock(): void {
  const lock = wakeLock;
  wakeLock = null;
  lock?.release().catch((err) => console.warn("guitar-cave: wake lock release failed", err));
}

function hookVisibility(): void {
  if (visibilityHooked || typeof document === "undefined") return;
  visibilityHooked = true;
  document.addEventListener("visibilitychange", () => {
    // the browser drops the lock when the tab hides; take it back on return
    if (document.visibilityState === "visible" && state.running && (wakeLock === null || wakeLock.released)) {
      void acquireWakeLock();
    }
  });
}

/* ---- public controls ---- */

type AudioCtor = typeof AudioContext;

function audioCtor(): AudioCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { AudioContext?: AudioCtor; webkitAudioContext?: AudioCtor };
  return w.AudioContext ?? w.webkitAudioContext ?? null;
}

/** Must be called from a tap/click — mobile browsers only unlock audio inside a gesture. */
export async function startPulse(settings: PulseSettings): Promise<void> {
  if (state.running || starting) return;
  const Ctor = audioCtor();
  if (!Ctor) {
    setState({ error: "This browser can't play audio — count it out loud: 1, 2, 3, 4." });
    return;
  }
  starting = true;
  try {
    ctx = ctx ?? new Ctor();
    await ctx.resume();
  } catch (err) {
    console.warn("guitar-cave: audio could not start", err);
    setState({ error: "Couldn't start the sound — tap Start again." });
    return;
  } finally {
    starting = false;
  }
  runId += 1;
  nextTickIndex = 0;
  nextTickTime = ctx.currentTime + START_DELAY_S;
  setState({ running: true, tick: -1, info: null, settings: sanitizePulse(settings), error: null });
  schedule();
  timer = setInterval(schedule, TIMER_MS);
  hookVisibility();
  void acquireWakeLock();
}

export function stopPulse(): void {
  runId += 1;
  if (timer !== null) clearInterval(timer);
  timer = null;
  releaseWakeLock();
  ctx?.suspend().catch((err) => console.warn("guitar-cave: audio suspend failed", err));
  setState({ running: false, tick: -1, info: null });
}

/** Tempo changes land on the next tick; a new meter or feel restarts the bar. */
export function setPulseSettings(settings: PulseSettings): void {
  const next = sanitizePulse(settings);
  const prev = state.settings;
  if (state.running && (next.beatsPerBar !== prev.beatsPerBar || next.subdivision !== prev.subdivision)) {
    nextTickIndex = 0;
  }
  setState({ settings: next });
}

/* ---- the hook ---- */

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

const getSnapshot = () => state;
const getServerSnapshot = () => IDLE;

export function usePulse(): PulseState {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
