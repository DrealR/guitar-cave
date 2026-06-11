"use client";

/* ============================================================
   One localStorage doc owns all live data: the loop, the
   skill grades, per-day session checks, custom songs, the
   playlist URL, and the learning-queue "started" marks.
   Seeds come from src/lib; the doc never mutates in place.
   ============================================================ */

import { useSyncExternalStore } from "react";
import {
  CATEGORY_LABELS,
  DEFAULT_LOOP,
  DEFAULT_SKILLS,
  type LoopItem,
  type Skill,
  type SkillCategory,
} from "@/lib/tracker-data.ts";
import { PLAYLIST_URL, type Song, type SongSection } from "@/lib/songs-data.ts";

export const STORE_KEY = "guitar-cave-v1";

export type SessionName = "morning" | "night";
export type DayChecks = { morning: string[]; night: string[] };

export type StoreDoc = {
  loop: LoopItem[];
  skills: Skill[];
  /** dateISO (local) → checked loop-item ids per session */
  sessions: Record<string, DayChecks>;
  customSongs: Song[];
  playlistUrl: string | null;
  /** learning-queue titles marked "started" */
  queueStarted: string[];
};

export function defaultDoc(): StoreDoc {
  return {
    loop: DEFAULT_LOOP.map((i) => ({ ...i })),
    skills: DEFAULT_SKILLS.map((s) => ({ ...s })),
    sessions: {},
    customSongs: [],
    playlistUrl: PLAYLIST_URL,
    queueStarted: [],
  };
}

/* ---- validation: never trust what comes out of storage ---- */

const VALID_CATEGORIES = new Set(Object.keys(CATEGORY_LABELS));

function isLoopItem(v: unknown): v is LoopItem {
  if (typeof v !== "object" || v === null) return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o.id === "string" &&
    typeof o.label === "string" &&
    typeof o.minutes === "number" &&
    Number.isFinite(o.minutes)
  );
}

function isSkill(v: unknown): v is Skill {
  if (typeof v !== "object" || v === null) return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o.id === "string" &&
    typeof o.label === "string" &&
    typeof o.category === "string" &&
    VALID_CATEGORIES.has(o.category) &&
    typeof o.grade === "number" &&
    o.grade >= 1 &&
    o.grade <= 5
  );
}

function isStringArray(v: unknown): v is string[] {
  return Array.isArray(v) && v.every((x) => typeof x === "string");
}

function isSongSection(v: unknown): v is SongSection {
  if (typeof v !== "object" || v === null) return false;
  const o = v as Record<string, unknown>;
  return isStringArray(o.chords) && typeof o.numbers === "string" && typeof o.strum === "string";
}

function isSong(v: unknown): v is Song {
  if (typeof v !== "object" || v === null) return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o.id === "string" &&
    typeof o.title === "string" &&
    typeof o.key === "string" &&
    typeof o.home === "string" &&
    Array.isArray(o.sections) &&
    o.sections.every(isSongSection)
  );
}

function sanitizeSessions(v: unknown): Record<string, DayChecks> {
  if (typeof v !== "object" || v === null) return {};
  const out: Record<string, DayChecks> = {};
  for (const [date, day] of Object.entries(v as Record<string, unknown>)) {
    if (typeof day !== "object" || day === null) continue;
    const d = day as Record<string, unknown>;
    out[date] = {
      morning: isStringArray(d.morning) ? d.morning : [],
      night: isStringArray(d.night) ? d.night : [],
    };
  }
  return out;
}

/** Field-by-field: anything malformed falls back to its seed. */
export function sanitizeDoc(raw: unknown): StoreDoc {
  const seed = defaultDoc();
  if (typeof raw !== "object" || raw === null) return seed;
  const o = raw as Record<string, unknown>;
  return {
    loop:
      Array.isArray(o.loop) && o.loop.length > 0 && o.loop.every(isLoopItem)
        ? (o.loop as LoopItem[])
        : seed.loop,
    skills:
      Array.isArray(o.skills) && o.skills.length > 0 && o.skills.every(isSkill)
        ? (o.skills as Skill[])
        : seed.skills,
    sessions: sanitizeSessions(o.sessions),
    customSongs: Array.isArray(o.customSongs) ? o.customSongs.filter(isSong) : [],
    playlistUrl: typeof o.playlistUrl === "string" && o.playlistUrl ? o.playlistUrl : seed.playlistUrl,
    queueStarted: isStringArray(o.queueStarted) ? o.queueStarted : [],
  };
}

/* ============================================================
   The hook — one module-level store behind useSyncExternalStore.
   The server snapshot is the seed; after hydration React swaps
   in the localStorage doc and flips `ready` (so pages render a
   skeleton in SSR HTML and live data right after mount).
   Every update replaces the doc wholesale — never mutates.
   ============================================================ */

export type Store = {
  doc: StoreDoc;
  /** false until hydrated on the client — render a skeleton to avoid SSR mismatch */
  ready: boolean;
  /** immutable update: fn receives the current doc, returns a NEW one */
  update: (fn: (doc: StoreDoc) => StoreDoc) => void;
};

const SERVER_DOC: StoreDoc = defaultDoc();
let cached: StoreDoc | null = null;
const listeners = new Set<() => void>();

function loadDoc(): StoreDoc {
  try {
    const raw = window.localStorage.getItem(STORE_KEY);
    if (raw) return sanitizeDoc(JSON.parse(raw));
  } catch (err) {
    console.warn("guitar-cave: corrupted store, reseeding from defaults", err);
  }
  return defaultDoc();
}

function getSnapshot(): StoreDoc {
  if (cached === null) cached = loadDoc();
  return cached;
}

function getServerSnapshot(): StoreDoc {
  return SERVER_DOC;
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function updateStore(fn: (doc: StoreDoc) => StoreDoc): void {
  cached = fn(getSnapshot());
  try {
    window.localStorage.setItem(STORE_KEY, JSON.stringify(cached));
  } catch (err) {
    console.warn("guitar-cave: could not persist store", err);
  }
  listeners.forEach((l) => l());
}

const getTrue = () => true;
const getFalse = () => false;

export function useStore(): Store {
  const doc = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const ready = useSyncExternalStore(subscribe, getTrue, getFalse);
  return { doc, ready, update: updateStore };
}

/* ---- shared helpers ---- */

export function newId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export type { LoopItem, Skill, SkillCategory, Song, SongSection };
