"use client";

/* The Songs page root — library + custom songs, the add/edit
   form, and the learning queue. One store, one source of truth. */

import { useState } from "react";
import { SONGS, type Song } from "@/lib/songs-data.ts";
import { useStore } from "@/components/tracker/useStore.ts";
import SongCard from "@/components/songs/SongCard";
import AddSongForm from "@/components/songs/AddSongForm";
import LearningQueue from "@/components/songs/LearningQueue";

export default function SongsPage() {
  const { doc, ready, update } = useStore();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Song | null>(null);

  const closeForm = () => {
    setFormOpen(false);
    setEditing(null);
  };

  const startEdit = (song: Song) => {
    setEditing(song);
    setFormOpen(true);
  };

  const removeSong = (id: string) => {
    update((d) => ({ ...d, customSongs: d.customSongs.filter((s) => s.id !== id) }));
    if (editing?.id === id) closeForm();
  };

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Songs</h1>
        <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-dim">
          <span>Reading the strums:</span>
          <span className="legend">
            <code className="rounded border border-line bg-surface-2 px-1.5 font-mono">D</code> down
          </span>
          <span className="legend">
            <code className="rounded border border-line bg-surface-2 px-1.5 font-mono">U</code> up
          </span>
          <span className="legend">
            <code className="rounded border border-line bg-surface-2 px-1.5 font-mono">·</code> let it
            ring
          </span>
        </p>
      </header>

      {ready ? (
        <>
          <section className="flex flex-col gap-3" aria-label="Song list">
            {SONGS.map((song) => (
              <SongCard key={song.id} song={song} />
            ))}
            {doc.customSongs.map((song) => (
              <SongCard
                key={song.id}
                song={song}
                onEdit={() => startEdit(song)}
                onRemove={() => removeSong(song.id)}
              />
            ))}
          </section>

          {formOpen ? (
            <AddSongForm
              key={editing?.id ?? "new"}
              editing={editing}
              update={update}
              onDone={closeForm}
            />
          ) : (
            <button type="button" className="chip self-start" onClick={() => setFormOpen(true)}>
              ＋ Add song
            </button>
          )}

          <LearningQueue
            playlistUrl={doc.playlistUrl}
            queueStarted={doc.queueStarted}
            update={update}
          />
        </>
      ) : (
        <Skeleton />
      )}
    </div>
  );
}

function Skeleton() {
  return (
    <div className="flex animate-pulse flex-col gap-3" aria-hidden>
      <div className="card h-24" />
      <div className="card h-24" />
      <div className="card h-24" />
      <div className="card h-24" />
      <div className="card h-80" />
    </div>
  );
}
