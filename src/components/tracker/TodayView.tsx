"use client";

/* ============================================================
   The daily loop — morning + night, checked per day.
   Today/yesterday flip, progress line, edit mode.
   ============================================================ */

import { useState } from "react";
import type { LoopItem } from "@/lib/tracker-data.ts";
import type { DayChecks, SessionName, StoreDoc } from "@/components/tracker/useStore.ts";
import { addDays, formatDay, localDateISO } from "@/components/tracker/dates.ts";
import LoopEditor from "@/components/tracker/LoopEditor";

type Props = {
  loop: LoopItem[];
  sessions: Record<string, DayChecks>;
  update: (fn: (doc: StoreDoc) => StoreDoc) => void;
};

const EMPTY_DAY: DayChecks = { morning: [], night: [] };

export default function TodayView({ loop, sessions, update }: Props) {
  const [dayOffset, setDayOffset] = useState<0 | -1>(0);
  const [session, setSession] = useState<SessionName>("morning");
  const [editing, setEditing] = useState(false);

  const date = addDays(new Date(), dayOffset);
  const iso = localDateISO(date);
  const checked = new Set((sessions[iso] ?? EMPTY_DAY)[session]);

  const done = loop.filter((item) => checked.has(item.id));
  const doneMinutes = done.reduce((sum, item) => sum + item.minutes, 0);
  const complete = loop.length > 0 && done.length === loop.length;

  const toggleItem = (id: string) => {
    update((doc) => {
      const day = doc.sessions[iso] ?? EMPTY_DAY;
      const list = day[session];
      const next = list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
      return {
        ...doc,
        sessions: { ...doc.sessions, [iso]: { ...day, [session]: next } },
      };
    });
  };

  return (
    <section className="card p-4 md:p-6" aria-label="Daily loop">
      {/* date header + day flip */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold">{formatDay(date)}</h2>
          <p className="text-sm text-dim">
            {done.length}/{loop.length} · {doneMinutes}m done
          </p>
        </div>
        <div className="flex gap-2" role="group" aria-label="Day">
          <button type="button" className="chip" data-on={dayOffset === 0} onClick={() => setDayOffset(0)}>
            Today
          </button>
          <button type="button" className="chip" data-on={dayOffset === -1} onClick={() => setDayOffset(-1)}>
            Yesterday
          </button>
        </div>
      </div>

      {/* morning / night + edit */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <div className="flex gap-2" role="group" aria-label="Session">
          <button type="button" className="chip" data-on={session === "morning"} onClick={() => setSession("morning")}>
            ☀ Morning
          </button>
          <button type="button" className="chip" data-on={session === "night"} onClick={() => setSession("night")}>
            ☾ Night
          </button>
        </div>
        <button
          type="button"
          className="chip ml-auto"
          data-on={editing}
          onClick={() => setEditing((e) => !e)}
        >
          {editing ? "Done editing" : "Edit"}
        </button>
      </div>

      {/* the loop */}
      {editing ? (
        <LoopEditor loop={loop} update={update} />
      ) : (
        <ul className="mt-4 flex flex-col gap-2">
          {loop.map((item) => {
            const on = checked.has(item.id);
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => toggleItem(item.id)}
                  aria-pressed={on}
                  className={`flex min-h-12 w-full items-center gap-3 rounded-xl border px-3 py-2 text-left transition-colors ${
                    on
                      ? "border-accent/50 bg-accent/10"
                      : "border-line bg-surface-2 hover:border-faint"
                  }`}
                >
                  <span
                    aria-hidden
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border text-sm font-bold ${
                      on ? "border-accent bg-accent text-bg" : "border-faint text-transparent"
                    }`}
                  >
                    ✓
                  </span>
                  <span className={`flex-1 text-sm font-semibold ${on ? "text-dim line-through" : ""}`}>
                    {item.label}
                  </span>
                  <span className="shrink-0 rounded-full border border-line px-2 py-0.5 font-mono text-xs text-dim">
                    {item.minutes}m
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {complete && !editing && (
        <p className="mt-4 rounded-xl border border-accent/40 bg-accent/10 px-4 py-3 text-center text-sm font-semibold text-accent">
          Session complete 🎸 — the pulse never stopped.
        </p>
      )}
    </section>
  );
}
