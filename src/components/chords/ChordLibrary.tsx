"use client";

import { useState } from "react";
import OpenChordsSection from "./OpenChordsSection";
import SlideShapeSection from "./SlideShapeSection";
import KeyFamiliesSection from "./KeyFamiliesSection";

/* ============================================================
   Chord Library — the heart of the app.
   Three rooms: the birthplaces, the slide, the families.
   ============================================================ */

const SECTIONS = [
  { id: "open", label: "Open chords" },
  { id: "slide", label: "Slide the shape" },
  { id: "keys", label: "Key families" },
] as const;

type SectionId = (typeof SECTIONS)[number]["id"];

export default function ChordLibrary() {
  const [section, setSection] = useState<SectionId>("open");

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap gap-2" aria-label="Chord library sections">
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            type="button"
            className="chip"
            data-on={section === s.id}
            aria-pressed={section === s.id}
            onClick={() => setSection(s.id)}
          >
            {s.label}
          </button>
        ))}
      </div>

      {section === "open" && <OpenChordsSection />}
      {section === "slide" && <SlideShapeSection />}
      {section === "keys" && <KeyFamiliesSection />}
    </div>
  );
}
