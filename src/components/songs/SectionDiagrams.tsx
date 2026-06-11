"use client";

/* The diagrams row for one song section — every unique chord,
   resolved through the ONE resolver, drawn small. ChordDiagram
   renders its own name caption; chords the library can't voice
   get a dashed placeholder instead. */

import ChordDiagram from "@/components/chords/ChordDiagram";
import { resolveChord, uniqueChords } from "@/components/songs/resolve.ts";

export default function SectionDiagrams({ chords }: { chords: string[] }) {
  const names = uniqueChords(chords);
  if (names.length === 0) return null;

  return (
    <div className="flex flex-wrap items-start gap-3">
      {names.map((name) => {
        const resolved = resolveChord(name);
        return resolved ? (
          <div key={name} className="w-28">
            <ChordDiagram shape={resolved.shape} baseFret={resolved.baseFret} size="sm" />
          </div>
        ) : (
          <div key={name} className="flex w-28 flex-col items-center gap-1 pt-2">
            <div
              className="flex h-20 w-16 items-center justify-center rounded-lg border border-dashed border-line text-[0.65rem] text-faint"
              title="No diagram in the library yet"
            >
              no diagram
            </div>
            <span className="text-sm font-bold">{name}</span>
          </div>
        );
      })}
    </div>
  );
}
