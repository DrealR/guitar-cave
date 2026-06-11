"use client";

/* ============================================================
   Skill grades — 1 to 5 comfort, grouped by category.
   Tap a dot to regrade. The lowest three are the next focus.
   ============================================================ */

import { useState } from "react";
import {
  CATEGORY_LABELS,
  type Skill,
  type SkillCategory,
} from "@/lib/tracker-data.ts";
import { newId, type StoreDoc } from "@/components/tracker/useStore.ts";

type Props = {
  skills: Skill[];
  update: (fn: (doc: StoreDoc) => StoreDoc) => void;
};

const GRADES = [1, 2, 3, 4, 5] as const;
const CATEGORIES = Object.keys(CATEGORY_LABELS) as SkillCategory[];

export default function SkillsSection({ skills, update }: Props) {
  const [editing, setEditing] = useState(false);

  const strong = skills.filter((s) => s.grade >= 4).length;
  const building = skills.filter((s) => s.grade === 3).length;
  const needsReps = skills.filter((s) => s.grade <= 2).length;
  const nextFocus = [...skills].sort((a, b) => a.grade - b.grade || a.label.localeCompare(b.label)).slice(0, 3);

  const setGrade = (id: string, grade: number) => {
    update((doc) => ({
      ...doc,
      skills: doc.skills.map((s) => (s.id === id ? { ...s, grade } : s)),
    }));
  };

  const removeSkill = (id: string) => {
    update((doc) => ({ ...doc, skills: doc.skills.filter((s) => s.id !== id) }));
  };

  return (
    <section className="card p-4 md:p-6" aria-label="Skill grades">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-bold">Skills</h2>
        <button type="button" className="chip" data-on={editing} onClick={() => setEditing((e) => !e)}>
          {editing ? "Done editing" : "Edit"}
        </button>
      </div>

      {/* overview strip */}
      <div className="mt-3 rounded-xl border border-line bg-surface-2 px-4 py-3 text-sm">
        <p className="font-semibold">
          <span className="text-accent">Strong (4–5): {strong}</span>
          <span className="text-faint"> · </span>
          <span className="text-third">Building (3): {building}</span>
          <span className="text-faint"> · </span>
          <span className="text-root">Needs reps (1–2): {needsReps}</span>
        </p>
        {nextFocus.length > 0 && (
          <p className="mt-1.5 text-dim">
            Next focus:{" "}
            {nextFocus.map((s, i) => (
              <span key={s.id}>
                {i > 0 && <span className="text-faint"> · </span>}
                <span className="font-semibold text-text">{s.label}</span>
              </span>
            ))}
          </p>
        )}
      </div>

      {/* groups */}
      <div className="mt-4 flex flex-col gap-5">
        {CATEGORIES.map((cat) => {
          const group = skills.filter((s) => s.category === cat);
          if (group.length === 0) return null;
          const avg = group.reduce((sum, s) => sum + s.grade, 0) / group.length;
          return (
            <div key={cat}>
              <h3 className="flex items-baseline justify-between border-b border-line pb-1.5 text-sm font-bold uppercase tracking-wide text-dim">
                {CATEGORY_LABELS[cat]}
                <span className="font-mono text-xs font-normal text-faint">avg {avg.toFixed(1)}</span>
              </h3>
              <ul className="mt-1 flex flex-col">
                {group.map((skill) => (
                  <li key={skill.id} className="flex min-h-12 items-center gap-2 border-b border-line/50 py-1 last:border-0">
                    <span className="min-w-0 flex-1 truncate text-sm">{skill.label}</span>
                    <div className="flex" role="group" aria-label={`Grade for ${skill.label}`}>
                      {GRADES.map((g) => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => setGrade(skill.id, g)}
                          aria-label={`Grade ${skill.label} ${g} of 5`}
                          aria-pressed={skill.grade === g}
                          className="flex h-11 w-8 items-center justify-center"
                        >
                          <span
                            aria-hidden
                            className={`h-4 w-4 rounded-full border transition-colors ${
                              g === skill.grade
                                ? "border-root bg-root"
                                : g < skill.grade
                                  ? "border-fifth bg-fifth/70"
                                  : "border-faint"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                    {editing && (
                      <button
                        type="button"
                        onClick={() => removeSkill(skill.id)}
                        aria-label={`Remove ${skill.label}`}
                        className="h-10 w-9 shrink-0 rounded-lg border border-line text-dim hover:border-root hover:text-root"
                      >
                        ✕
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      <AddSkillForm update={update} />
    </section>
  );
}

function AddSkillForm({ update }: { update: Props["update"] }) {
  const [label, setLabel] = useState("");
  const [category, setCategory] = useState<SkillCategory>("chords");
  const [error, setError] = useState<string | null>(null);

  const add = () => {
    const trimmed = label.trim();
    if (!trimmed) {
      setError("Name the skill first.");
      return;
    }
    update((doc) => ({
      ...doc,
      skills: [...doc.skills, { id: newId("skill"), label: trimmed, category, grade: 1 }],
    }));
    setLabel("");
    setError(null);
  };

  return (
    <form
      className="mt-5 flex flex-wrap items-center gap-2 border-t border-line pt-4"
      onSubmit={(e) => {
        e.preventDefault();
        add();
      }}
    >
      <input
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        placeholder="New skill…"
        aria-label="New skill label"
        className="min-h-11 min-w-0 flex-1 rounded-xl border border-line bg-surface-2 px-3 text-sm outline-none placeholder:text-faint focus:border-root"
      />
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value as SkillCategory)}
        aria-label="Skill category"
        className="min-h-11 rounded-xl border border-line bg-surface-2 px-3 text-sm outline-none focus:border-root"
      >
        {CATEGORIES.map((c) => (
          <option key={c} value={c}>
            {CATEGORY_LABELS[c]}
          </option>
        ))}
      </select>
      <button type="submit" className="chip" data-on="true">
        ＋ Add
      </button>
      {error && <p className="w-full text-xs text-root">{error}</p>}
    </form>
  );
}
