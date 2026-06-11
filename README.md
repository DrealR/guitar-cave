# Guitar Cave 🎸

**Reemy's personal guitar study tool** — the fretboard, every chord's internal anatomy, the
daily practice loop, and the songs. One place instead of scattered worksheets and photos.
Built for one player who practices twice a day and checks this on his phone between reps.

> **Live: https://guitar-cave.vercel.app** · [fretboard](https://guitar-cave.vercel.app/fretboard) · [chords](https://guitar-cave.vercel.app/chords) · [songs](https://guitar-cave.vercel.app/songs)

> **The tool serves the reps — it does not replace them.**

## The teaching model (why this app looks the way it does)

Theory clicked for Reemy *relationally* — shapes as bodies, distances as identity. The app
encodes that language everywhere:

- **The strum is time.** The right hand is the pulse; chords are bodies that appear within it.
- **A chord is a body:** the **Root** is its identity (gold, everywhere in the app), the
  **5th** is its spine — power, always exactly 7 half-steps, it never moves (gray) — and the
  **3rd** is its soul — the mood note: 3 half-steps = minor/sad, 4 = major/happy (blue).
- **The shape carries the quality; the fret carries the letter.** A chord shape freezes the
  interval gaps into hand geometry, so sliding it keeps major/minor and changes only the name.
  Shapes are named for their open-chord birthplaces (C-A-G-E-D). The "slide the shape" page
  exists to make you *feel* this.
- **Home (the tonic) is the local sun.** Numbers 1–7 are roles in a key: 1 home, 4 lift,
  5 tension, 6 bittersweet. Songs are orbits; they end at the sun.
- **The 12 and the 7:** twelve notes repeat at fret 12; a scale picks 7 of them
  (W-W-H-W-W-W-H for major); pentatonics keep 5. Octave shape: up 2 strings, over 2 frets.

## What's inside (v1)

| page | what it does |
|---|---|
| **Practice** (home) | The real daily loop, checkable morning/night; 1–5 comfort grades per skill; strong-vs-needs-reps overview; everything editable; localStorage |
| **Fretboard** | Frets 0–12, all note names, octave finder (tap a note → every place it lives), scale highlighting (major / minor / both pentatonics) |
| **Chords** | Every chord as anatomy — root/3rd/5th colored; open chords + E/A/D-shape barres nameable at any fret; **slide-the-shape**; key families (the 7 chords of G, C, D, A, E) |
| **Songs** | Stand By Me, Knocking on Heaven's Door, Three Little Birds, Happy Together — chords, letters AND numbers, strums in D/U, capo, where home is; plus the learning queue |

## The engineering rule

**Compute, don't hardcode.** Note names, chord names, scale highlights, and interval colors
all derive from one chromatic system — a 12-note array, tuning offsets, and interval math
(`note(string, fret) = chromatic[(open + fret) % 12]`). Shapes are interval offsets from a
root string. The chord-naming math is unit-tested (E/A/D shapes, frets 1–12).

```bash
npm install
node --test src/lib/music.test.ts   # the math proves itself
npm run dev
```

## Stack

Next.js (App Router) · React · Tailwind v4 · TypeScript · localStorage. No backend, no
accounts, no dependencies beyond the frame. Static data modules — easy to extend.

---

*v1 scope held deliberately small: fretboard, chords, tracker, songs. Future layers
(audio, piano bridge, CHIMERA framing) must earn their way in.*
