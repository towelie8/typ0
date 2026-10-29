/**
 * Übungstexte: zuerst Nonsens-Silben mit Schwerpunkt auf den neuen Tasten, danach echte
 * deutsche Wörter. Es kommen nur Zeichen vor, die bis zur Lektion gelernt wurden.
 */
import type { Lesson } from '../data/lessons'
import { WORDS } from '../data/words'

export type Random = () => number

/** Reproduzierbarer Zufall (mulberry32) für Tests. */
export function seededRandom(seed: number): Random {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Alle Zeichen, die bis einschließlich Lektion `index` gelernt sind. */
export function allowedChars(lessons: Lesson[], index: number): Set<string> {
  return new Set(lessons.slice(0, index + 1).flatMap((l) => l.newKeys))
}

/** Das Wort, wie es geübt werden kann: unverändert, vor der Shift-Lektion klein, sonst null. */
export function fitWord(word: string, allowed: Set<string>): string | null {
  const fits = (w: string) => [...w].every((ch) => allowed.has(ch))
  if (fits(word)) return word
  const lower = word.toLowerCase()
  return fits(lower) ? lower : null
}

/** Mindestlänge des Nonsens-Teils in Zeichen und Anzahl der Wörter danach. */
const DRILL_CHARS = 24
const WORD_COUNT = 8
/** Anteil neuer Tasten in den Silben und an den Wörtern. */
const NEW_KEY_SHARE = 0.6
const NEW_WORD_SHARE = 0.7
const MIN_PREFERRED = 4
/** Satzzeichen, die hinter Wörter passen, und wie oft eines folgt. */
const TRAILING_PUNCTUATION = [',', '.', ';', ':']
const PUNCTUATION_RATE = 0.2

const pick = <T,>(items: T[], rng: Random): T => items[Math.floor(rng() * items.length)]

function shuffle<T>(items: T[], rng: Random): T[] {
  const a = [...items]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** Silbengruppen aus 3–5 Zeichen; jede neue Taste kommt mindestens einmal vor. */
function drills(newChars: string[], pool: string[], rng: Random): string[] {
  const chars = shuffle(newChars, rng)
  const length = Math.max(DRILL_CHARS, newChars.length + 8)
  while (chars.length < length) chars.push(rng() < NEW_KEY_SHARE ? pick(newChars, rng) : pick(pool, rng))
  const groups: string[] = []
  for (let i = 0; i < chars.length; ) {
    let size = 3 + Math.floor(rng() * 3)
    // Einen Rest unter drei Zeichen an diese Gruppe hängen statt allein stehen lassen.
    if (chars.length - (i + size) < 3) size = chars.length - i
    groups.push(chars.slice(i, i + size).join(''))
    i += size
  }
  return groups
}

function words(newChars: string[], allowed: Set<string>, rng: Random): string[] {
  const candidates = [...new Set(WORDS.map((w) => fitWord(w, allowed)).filter((w) => w !== null))]
  if (candidates.length === 0) return []
  const preferred = candidates.filter((w) => newChars.some((ch) => w.includes(ch)))
  // Bei sehr wenigen Wörtern mit neuen Tasten würden sie sich ständig wiederholen.
  const favour = preferred.length >= MIN_PREFERRED
  const punctuation = TRAILING_PUNCTUATION.filter((p) => allowed.has(p))
  const result: string[] = []
  while (result.length < WORD_COUNT) {
    const source = favour && rng() < NEW_WORD_SHARE ? preferred : candidates
    let word = pick(source, rng)
    if (word === result.at(-1)?.replace(/[,.;:]$/, '')) word = pick(source, rng)
    if (punctuation.length > 0 && result.length < WORD_COUNT - 1 && rng() < PUNCTUATION_RATE) {
      word += pick(punctuation, rng)
    }
    result.push(word)
  }
  return result
}

/** Übungstext für Lektion `index`: Silben, dann Wörter, getrennt durch einfache Leerzeichen. */
export function generateExercise(lessons: Lesson[], index: number, rng: Random = Math.random): string {
  const allowed = allowedChars(lessons, index)
  const newChars = lessons[index].newKeys.filter((ch) => ch !== ' ')
  const pool = [...allowed].filter((ch) => ch !== ' ')
  return [...drills(newChars, pool, rng), ...words(newChars, allowed, rng)].join(' ')
}
