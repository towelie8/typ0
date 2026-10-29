import { describe, expect, it } from 'vitest'
import { LESSONS } from './lessons'
import { keyByChar } from './layout'

describe('Lektionsdaten', () => {
  it('haben eindeutige IDs', () => {
    const ids = LESSONS.map((l) => l.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('beginnen mit der Grundstellung samt Leertaste', () => {
    expect([...LESSONS[0].newKeys].sort()).toEqual([' ', 'a', 'd', 'f', 'j', 'k', 'l', 's', 'ö'])
  })

  it('führen jedes Zeichen genau einmal ein, und nur Zeichen der Tastatur', () => {
    const seen = new Set<string>()
    for (const lesson of LESSONS) {
      for (const ch of lesson.newKeys) {
        expect(keyByChar(ch), `${lesson.id}: ${JSON.stringify(ch)}`).toBeDefined()
        expect(seen.has(ch), `${lesson.id}: ${ch} doppelt`).toBe(false)
        seen.add(ch)
      }
    }
  })

  it('verlangen mindestens 95 % Genauigkeit', () => {
    for (const lesson of LESSONS) expect(lesson.minAccuracy, lesson.id).toBe(95)
  })

  it('folgen dem Lernpfad: Grundreihe, oben, unten, Shift, Zahlen', () => {
    const rowOf = (lessonIndex: number) => new Set(LESSONS[lessonIndex].newKeys.map((c) => keyByChar(c)!.row))
    expect(rowOf(0)).toEqual(new Set([2, 4]))
    expect(rowOf(2)).toEqual(new Set([1]))
    expect(rowOf(4)).toEqual(new Set([3]))
    expect(LESSONS.findIndex((l) => l.newKeys.includes('A'))).toBeGreaterThan(5)
    expect(LESSONS.at(-1)!.newKeys).toContain('1')
  })
})
