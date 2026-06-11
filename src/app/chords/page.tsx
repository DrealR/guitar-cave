import type { Metadata } from "next";
import ChordLibrary from "@/components/chords/ChordLibrary";

export const metadata: Metadata = {
  title: "Chords — Guitar Cave",
  description:
    "Every chord is three jobs: gold root (identity), blue 3rd (soul), gray 5th (spine). Open chords, moveable shapes, key families.",
};

export default function ChordsPage() {
  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Chords</h1>
        <p className="mt-1 text-sm text-dim">
          Every chord is three jobs: <span className="text-root">root = identity</span>,{" "}
          <span className="text-third">3rd = soul</span>, <span className="text-fifth">5th = spine</span>.
        </p>
      </header>
      <ChordLibrary />
    </div>
  );
}
