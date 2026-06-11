"use client";

import { useStore } from "@/components/tracker/useStore.ts";
import TodayView from "@/components/tracker/TodayView";
import SkillsSection from "@/components/tracker/SkillsSection";

export default function TrackerPage() {
  const { doc, ready, update } = useStore();

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Practice</h1>
        <p className="mt-1 text-sm text-dim">
          The strum is time — never stop the pulse. The tool serves the reps; it does not replace
          them.
        </p>
      </header>

      {ready ? (
        <>
          <TodayView loop={doc.loop} sessions={doc.sessions} update={update} />
          <SkillsSection skills={doc.skills} update={update} />
        </>
      ) : (
        <Skeleton />
      )}
    </div>
  );
}

/* Pre-hydration placeholder — keeps SSR markup stable. */
function Skeleton() {
  return (
    <div className="flex animate-pulse flex-col gap-8" aria-hidden>
      <div className="card h-72" />
      <div className="card h-96" />
    </div>
  );
}
