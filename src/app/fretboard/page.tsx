import type { Metadata } from "next";
import FretboardExplorer from "@/components/fretboard/FretboardExplorer";

export const metadata: Metadata = {
  title: "Fretboard — Guitar Cave",
};

export default function FretboardPage() {
  return (
    <div className="flex flex-col gap-4">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Fretboard</h1>
        <p className="mt-1 text-sm text-dim">
          12 notes, six strings — find where every note lives.
        </p>
      </header>
      <FretboardExplorer />
    </div>
  );
}
