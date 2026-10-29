import { describe, expect, it } from 'vitest'
import { accuracy, charsPerMinute, isPassed } from './stats'

describe('stats', () => {
  it('berechnet die Genauigkeit aus Zeichen und Fehlern', () => {
    expect(accuracy(100, 0)).toBe(100)
    expect(accuracy(95, 5)).toBe(95)
    expect(accuracy(0, 0)).toBe(100)
  })

  it('rundet die Genauigkeit ab, damit 94,99 % nicht als 95 % gilt', () => {
    expect(accuracy(100, 6)).toBe(94.3)
    expect(accuracy(1899, 100)).toBe(94.9)
  })

  it('berechnet Anschläge pro Minute', () => {
    expect(charsPerMinute(120, 60_000)).toBe(120)
    expect(charsPerMinute(50, 30_000)).toBe(100)
    expect(charsPerMinute(10, 0)).toBe(0)
  })

  it('besteht ab der Mindestgenauigkeit', () => {
    expect(isPassed(95, 95)).toBe(true)
    expect(isPassed(94.9, 95)).toBe(false)
  })
})
