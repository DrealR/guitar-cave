import type { Metadata } from "next";
import SongsPage from "@/components/songs/SongsPage";

export const metadata: Metadata = {
  title: "Songs — Guitar Cave",
  description:
    "The repertoire — chords, progressions in letters and numbers, strums, and the learning queue.",
};

export default function Songs() {
  return <SongsPage />;
}
