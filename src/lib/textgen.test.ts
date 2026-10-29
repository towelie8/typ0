import { describe, expect, it } from 'vitest'
import { LESSONS } from '../data/lessons'
import { allowedChars, fitWord, generateExercise, seededRandom } from './textgen'

describe('allowedChars', () => {
  it('enthält die Tasten aller bisherigen Lektionen', () => {
    const allowed = allowedChars(LESSONS, 1)
    for (const ch of 'asdfjklö ghä') expect(allowed.has(ch), ch).toBe(true)
    expect(allowed.has('e')).toBe(false)
  })
})

describe('fitWord', () => {
  const allowed = allowedChars(LESSONS, 0)

  it('nimmt Wörter aus gelernten Tasten', () => {
    expect(fitWord('dass', allowed)).toBe('dass')
  })

  it('schreibt vor der Shift-Lektion klein', () => {
    expect(fitWord('Saal', allowed)).toBe('saal')
    expect(fitWord('Öl', allowed)).toBe('öl')
  })

  it('behält die Großschreibung, sobald Shift gelernt ist', () => {
    const shift = LESSONS.findIndex((l) => l.id === 'shift')
    expect(fitWord('Saal', allowedChars(LESSONS, shift))).toBe('Saal')
  })

  it('verwirft Wörter mit ungelernten Tasten', () => {
    expect(fitWord('Haus', allowed)).toBeNull()
  })
})

describe('generateExercise', () => {
  it.each(LESSONS.map((l, i) => [l.id, i] as const))('erzeugt für %s nur erlaubte Zeichen', (_, index) => {
    const allowed = allowedChars(LESSONS, index)
    for (let seed = 1; seed <= 20; seed++) {
      const text = generateExercise(LESSONS, index, seededRandom(seed))
      for (const ch of text) expect(allowed.has(ch), `${JSON.stringify(ch)} in "${text}"`).toBe(true)
    }
  })

  it.each(LESSONS.map((l, i) => [l.id, i] as const))('übt in %s jede neue Taste', (_, index) => {
    const text = generateExercise(LESSONS, index, seededRandom(7))
    for (const ch of LESSONS[index].newKeys) expect(text, JSON.stringify(ch)).toContain(ch)
  })

  it('beginnt mit Nonsens-Silben und endet mit echten Wörtern', () => {
    const text = generateExercise(LESSONS, 0, seededRandom(3))
    const groups = text.split(' ')
    const words = new Set(['das', 'dass', 'als', 'all', 'lass', 'falls', 'ja', 'da', 'saal', 'kalk', 'skala', 'kajak', 'öl', 'fass', 'fall', 'salsa', 'lasso'])
    expect(words.has(groups.at(-1)!)).toBe(true)
    expect(groups.filter((g) => words.has(g)).length).toBeGreaterThanOrEqual(6)
  })

  it('bildet Silbengruppen aus mindestens drei Zeichen', () => {
    for (let seed = 1; seed <= 20; seed++) {
      const groups = generateExercise(LESSONS, 1, seededRandom(seed)).split(' ').slice(0, 5)
      for (const g of groups) expect(g.length, g).toBeGreaterThanOrEqual(3)
    }
  })

  it('hat keine doppelten oder randständigen Leerzeichen', () => {
    for (let seed = 1; seed <= 20; seed++) {
      const text = generateExercise(LESSONS, 6, seededRandom(seed))
      expect(text).toBe(text.trim())
      expect(text).not.toContain('  ')
    }
  })

  it('ist mit gleichem Startwert reproduzierbar', () => {
    expect(generateExercise(LESSONS, 2, seededRandom(42))).toBe(generateExercise(LESSONS, 2, seededRandom(42)))
  })
})
