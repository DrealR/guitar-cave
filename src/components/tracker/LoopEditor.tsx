"use client";

/* Edit the loop: add, remove, reorder (▲▼ — no drag dependency). */

import { useState } from "react";
import type { LoopItem } from "@/lib/tracker-data.ts";
import { newId, type StoreDoc } from "@/components/tracker/useStore.ts";

type Props = {
  loop: LoopItem[];
  update: (fn: (doc: StoreDoc) => StoreDoc) => void;
};

export default function LoopEditor({ loop, update }: Props) {
  const [label, setLabel] = useState("");
  const [minutes, setMinutes] = useState("5");
  const [error, setError] = useState<string | null>(null);

  const move = (id: string, dir: -1 | 1) => {
    update((doc) => {
      const i = doc.loop.findIndex((x) => x.id === id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= doc.loop.length) return doc;
      const next = [...doc.loop];
      [next[i], next[j]] = [next[j], next[i]];
      return { ...doc, loop: next };
    });
  };

  const remove = (id: string) => {
    update((doc) => ({ ...doc, loop: doc.loop.filter((x) => x.id !== id) }));
  };

  const add = () => {
    const trimmed = label.trim();
    const mins = Number(minutes);
    if (!trimmed) {
      setError("Give the rep a name.");
      return;
    }
    if (!Number.isFinite(mins) || mins <= 0) {
      setError("Minutes must be a positive number.");
      return;
    }
    update((doc) => ({
      ...doc,
      loop: [...doc.loop, { id: newId("loop"), label: trimmed, minutes: mins }],
    }));
    setLabel("");
    setMinutes("5");
    setError(null);
  };

  return (
    <div className="mt-4">
      <ul className="flex flex-col gap-2">
        {loop.map((item, i) => (
          <li
            key={item.id}
            className="flex min-h-12 items-center gap-2 rounded-xl border border-line bg-surface-2 px-3 py-2"
          >
            <span className="flex-1 text-sm font-semibold">{item.label}</span>
            <span className="shrink-0 font-mono text-xs text-dim">{item.minutes}m</span>
            <button
              type="button"
              onClick={() => move(item.id, -1)}
              disabled={i === 0}
              aria-label={`Move ${item.label} up`}
              className="h-10 w-9 rounded-lg border border-line text-dim hover:text-text disabled:opacity-30"
            >
              ▲
            </button>
            <button
              type="button"
              onClick={() => move(item.id, 1)}
              disabled={i === loop.length - 1}
              aria-label={`Move ${item.label} down`}
              className="h-10 w-9 rounded-lg border border-line text-dim hover:text-text disabled:opacity-30"
            >
              ▼
            </button>
            <button
              type="button"
              onClick={() => remove(item.id)}
              aria-label={`Remove ${item.label}`}
              className="h-10 w-9 rounded-lg border border-line text-dim hover:border-root hover:text-root"
            >
              ✕
            </button>
          </li>
        ))}
      </ul>

      {/* add item */}
      <form
        className="mt-3 flex flex-wrap items-center gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          add();
        }}
      >
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="New loop item…"
          aria-label="New loop item label"
          className="min-h-11 min-w-0 flex-1 rounded-xl border border-line bg-surface-2 px-3 text-sm outline-none placeholder:text-faint focus:border-root"
        />
        <input
          value={minutes}
          onChange={(e) => setMinutes(e.target.value)}
          inputMode="numeric"
          aria-label="Minutes"
          className="min-h-11 w-16 rounded-xl border border-line bg-surface-2 px-3 text-center font-mono text-sm outline-none focus:border-root"
        />
        <button type="submit" className="chip" data-on="true">
          ＋ Add
        </button>
      </form>
      {error && <p className="mt-2 text-xs text-root">{error}</p>}
    </div>
  );
}
