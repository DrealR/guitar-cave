"use client";

/* While the pulse runs, a small pill in the top bar keeps the beat
   visible — and stoppable — from every page. Hidden when silent. */

import { stopPulse, usePulse } from "@/components/pulse/pulse-engine.ts";

export default function PulsePill() {
  const pulse = usePulse();
  if (!pulse.running) return null;

  const downbeat = pulse.info?.isDownbeat ?? false;
  const onBeat = pulse.info?.isBeat ?? false;

  return (
    <button
      type="button"
      onClick={stopPulse}
      aria-label={`Stop the pulse at ${pulse.settings.bpm} bpm`}
      className="ml-auto mr-2 inline-flex min-h-11 items-center gap-2 rounded-full border border-root/60 bg-surface-2 px-3 font-mono text-sm font-semibold text-text md:mr-4"
    >
      <span
        aria-hidden
        className={`h-3 w-3 rounded-full ${downbeat ? "bg-root" : onBeat ? "bg-fifth" : "bg-third"}`}
      />
      {pulse.settings.bpm}
      <span aria-hidden className="text-root">■</span>
    </button>
  );
}
