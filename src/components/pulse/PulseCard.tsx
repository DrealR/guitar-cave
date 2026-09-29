"use client";

/* ============================================================
   The Pulse — a metronome on the Practice page. Step 1 of the
   protocol: choose a slow beat and hold it before adding
   anything. Eighths show the hand: D on the beat, U on the &.
   Settings live in the store doc; the engine keeps time.
   ============================================================ */

import { useState } from "react";
import {
  BEATS_PER_BAR_OPTIONS,
  BPM_MAX,
  BPM_MIN,
  BPM_STEP,
  clampBpm,
  nudgeBpm,
  tapTempo,
  tickInfo,
  type PulseSettings,
  type Subdivision,
} from "@/lib/pulse.ts";
import type { StoreDoc } from "@/components/tracker/useStore.ts";
import { setPulseSettings, startPulse, stopPulse, usePulse } from "@/components/pulse/pulse-engine.ts";

type Props = {
  settings: PulseSettings;
  update: (fn: (doc: StoreDoc) => StoreDoc) => void;
};

const TAP_MEMORY = 8;
const FEELS: { value: Subdivision; label: string }[] = [
  { value: 1, label: "Beats" },
  { value: 2, label: "D U eighths" },
];

export default function PulseCard({ settings, update }: Props) {
  const pulse = usePulse();
  const [taps, setTaps] = useState<number[]>([]);

  const commit = (next: PulseSettings) => {
    update((doc) => ({ ...doc, pulse: next }));
    setPulseSettings(next);
  };

  const onTap = () => {
    const now = performance.now();
    const nextTaps = [...taps, now].slice(-TAP_MEMORY);
    setTaps(nextTaps);
    const bpm = tapTempo(nextTaps);
    if (bpm !== null) commit({ ...settings, bpm });
  };

  const toggle = () => {
    if (pulse.running) stopPulse();
    else void startPulse(settings);
  };

  return (
    <section className="card p-4 md:p-6" aria-label="Pulse metronome">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-lg font-bold">Pulse</h2>
        <p className="text-xs text-dim">The floor — hold the beat before adding anything.</p>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <button
          type="button"
          className="chip h-12 w-14 justify-center font-mono"
          onClick={() => commit({ ...settings, bpm: nudgeBpm(settings.bpm, -BPM_STEP) })}
          aria-label={`Slower by ${BPM_STEP}`}
        >
          −{BPM_STEP}
        </button>
        <p className="text-center" aria-live="polite">
          <span className="font-mono text-5xl font-bold tabular-nums">{settings.bpm}</span>
          <span className="ml-1 text-sm text-dim">bpm</span>
        </p>
        <button
          type="button"
          className="chip h-12 w-14 justify-center font-mono"
          onClick={() => commit({ ...settings, bpm: nudgeBpm(settings.bpm, BPM_STEP) })}
          aria-label={`Faster by ${BPM_STEP}`}
        >
          +{BPM_STEP}
        </button>
      </div>

      <input
        type="range"
        min={BPM_MIN}
        max={BPM_MAX}
        value={settings.bpm}
        onChange={(e) => commit({ ...settings, bpm: clampBpm(Number(e.target.value)) })}
        aria-label="Tempo in beats per minute"
        className="mt-3 w-full accent-root"
      />

      <BeatLights settings={settings} activeTick={pulse.running ? pulse.tick : -1} />

      <div className="mt-4 grid grid-cols-[1fr_auto] gap-2">
        <button
          type="button"
          onClick={toggle}
          aria-pressed={pulse.running}
          className={`min-h-14 rounded-xl border text-base font-bold transition-colors ${
            pulse.running
              ? "border-root bg-root/15 text-root"
              : "border-accent/60 bg-accent/10 text-accent hover:bg-accent/20"
          }`}
        >
          {pulse.running ? "■ Stop" : "▶ Start the pulse"}
        </button>
        <button type="button" className="chip min-h-14 px-5" onClick={onTap} aria-label="Tap tempo">
          Tap
        </button>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <div className="flex gap-2" role="group" aria-label="Beats per bar">
          {BEATS_PER_BAR_OPTIONS.map((n) => (
            <button
              key={n}
              type="button"
              className="chip font-mono"
              data-on={settings.beatsPerBar === n}
              onClick={() => commit({ ...settings, beatsPerBar: n })}
              aria-label={`${n} beats per bar`}
            >
              {n}/4
            </button>
          ))}
        </div>
        <div className="flex gap-2" role="group" aria-label="Feel">
          {FEELS.map((f) => (
            <button
              key={f.value}
              type="button"
              className="chip"
              data-on={settings.subdivision === f.value}
              onClick={() => commit({ ...settings, subdivision: f.value })}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {pulse.error && <p className="mt-3 text-xs text-root">{pulse.error}</p>}
      <p className="mt-3 text-xs text-faint">
        Same error three times? Slow down {BPM_STEP}. The pulse keeps going if you switch pages.
      </p>
    </section>
  );
}

/* One cell per tick in the bar: gold on 1 (identity), gray on the beats,
   blue on the & (the up-stroke). The lit cell follows the audio clock. */
function BeatLights({ settings, activeTick }: { settings: PulseSettings; activeTick: number }) {
  const { beatsPerBar, subdivision } = settings;
  const ticksPerBar = beatsPerBar * subdivision;
  const activeInBar = activeTick < 0 ? -1 : activeTick % ticksPerBar;
  const cells = Array.from({ length: ticksPerBar }, (_, i) => tickInfo(i, beatsPerBar, subdivision));

  return (
    <ol className="mt-4 flex gap-1.5" aria-hidden>
      {cells.map((cell, i) => {
        const on = i === activeInBar;
        const tone = cell.isDownbeat
          ? "border-root text-root"
          : cell.isBeat
            ? "border-fifth text-fifth"
            : "border-third/60 text-third";
        const lit = cell.isDownbeat
          ? "border-root bg-root text-bg"
          : cell.isBeat
            ? "border-fifth bg-fifth text-bg"
            : "border-third bg-third text-bg";
        return (
          <li
            key={i}
            className={`flex h-12 flex-1 flex-col items-center justify-center rounded-lg border font-mono text-sm font-bold ${
              on ? lit : `${tone} bg-surface-2`
            }`}
          >
            <span>{cell.count}</span>
            {subdivision === 2 && <span className="text-[0.65rem] font-semibold opacity-80">{cell.stroke}</span>}
          </li>
        );
      })}
    </ol>
  );
}
