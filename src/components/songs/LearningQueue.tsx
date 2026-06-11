"use client";

/* Up next — the want-to-learn list, plus the playlist button.
   "Started" marks persist; the playlist URL is settable in-place. */

import { useState } from "react";
import { LEARNING_QUEUE } from "@/lib/songs-data.ts";
import type { StoreDoc } from "@/components/tracker/useStore.ts";

type Props = {
  playlistUrl: string | null;
  queueStarted: string[];
  update: (fn: (doc: StoreDoc) => StoreDoc) => void;
};

export default function LearningQueue({ playlistUrl, queueStarted, update }: Props) {
  const started = new Set(queueStarted);

  const toggleStarted = (title: string) => {
    update((doc) => ({
      ...doc,
      queueStarted: doc.queueStarted.includes(title)
        ? doc.queueStarted.filter((t) => t !== title)
        : [...doc.queueStarted, title],
    }));
  };

  return (
    <section className="card p-4 md:p-6" aria-label="Learning queue">
      <h2 className="text-lg font-bold">Up next — the want-to-learn list</h2>

      <div className="mt-3">
        <PlaylistSlot playlistUrl={playlistUrl} update={update} />
      </div>

      <ul className="mt-4 flex flex-col">
        {LEARNING_QUEUE.map((q) => {
          const on = started.has(q.title);
          return (
            <li
              key={q.title}
              className="flex min-h-12 items-center gap-3 border-b border-line/50 py-1.5 last:border-0"
            >
              <button
                type="button"
                onClick={() => toggleStarted(q.title)}
                aria-pressed={on}
                className="flex min-h-11 min-w-0 flex-1 items-center gap-3 text-left"
              >
                <span
                  aria-hidden
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border text-xs font-bold ${
                    on ? "border-accent bg-accent text-bg" : "border-faint text-transparent"
                  }`}
                >
                  ✓
                </span>
                <span className="min-w-0">
                  <span className={`block truncate text-sm font-semibold ${on ? "text-dim" : ""}`}>
                    {q.title}
                  </span>
                  {q.artist && <span className="block truncate text-xs text-dim">{q.artist}</span>}
                </span>
                {on && <span className="shrink-0 text-xs font-semibold text-accent">started</span>}
              </button>
              {q.link && (
                <a
                  href={q.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 rounded-full border border-line px-3 py-2 text-xs font-semibold text-third hover:border-third"
                >
                  watch ▸
                </a>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/* ---- the playlist button / inline setter ---- */

function PlaylistSlot({ playlistUrl, update }: Pick<Props, "playlistUrl" | "update">) {
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (playlistUrl) {
    return (
      <div className="flex items-center gap-2">
        <a
          href={playlistUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="chip"
          data-on="true"
        >
          📺 My playlist
        </a>
        <button
          type="button"
          className="text-xs text-faint underline hover:text-dim"
          onClick={() => update((doc) => ({ ...doc, playlistUrl: null }))}
        >
          change
        </button>
      </div>
    );
  }

  const save = () => {
    const url = draft.trim();
    if (!/^https?:\/\/.+/.test(url)) {
      setError("Paste a full link (starts with https://).");
      return;
    }
    update((doc) => ({ ...doc, playlistUrl: url }));
    setDraft("");
    setError(null);
  };

  return (
    <form
      className="rounded-xl border border-dashed border-line p-3"
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
    >
      <p className="text-sm text-dim">📺 Paste your YouTube playlist link in settings:</p>
      <div className="mt-2 flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="https://youtube.com/playlist?list=…"
          aria-label="YouTube playlist URL"
          className="min-h-11 min-w-0 flex-1 rounded-xl border border-line bg-surface-2 px-3 text-sm outline-none placeholder:text-faint focus:border-root"
        />
        <button type="submit" className="chip" data-on="true">
          Save
        </button>
      </div>
      {error && <p className="mt-2 text-xs text-root">{error}</p>}
    </form>
  );
}
