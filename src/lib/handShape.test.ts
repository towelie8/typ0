import { describe, expect, it } from 'vitest'
import { DIGITS, handOf, knuckle } from './hands'
import { fingerShape, palmOutline, smoothClosedPath } from './handShape'

const numbers = (d: string) => (d.match(/-?\d+(\.\d+)?(e-?\d+)?/g) ?? []).map(Number)

describe('fingerShape', () => {
  it('liefert gültige Pfade für jede Richtung', () => {
    for (const tip of [{ x: 0, y: -100 }, { x: 80, y: -60 }, { x: -50, y: 30 }]) {
      const shape = fingerShape({ x: 0, y: 0 }, tip, 24, [0.4, 0.7])
      for (const d of Object.values(shape)) {
        expect(d).not.toContain('NaN')
        expect(d.startsWith('M')).toBe(true)
      }
    }
  })

  it('bleibt gültig, wenn Knöchel und Kuppe zusammenfallen', () => {
    const shape = fingerShape({ x: 5, y: 5 }, { x: 5, y: 5 }, 24, [0.5])
    expect(Object.values(shape).join('')).not.toContain('NaN')
  })

  it('setzt den Nagel an die Fingerspitze', () => {
    // Finger zeigt nach oben: Der Nagel liegt nahe der Kuppe, weit weg vom Knöchel.
    const ys = numbers(fingerShape({ x: 0, y: 0 }, { x: 0, y: -100 }, 24, [0.5]).nail).filter((_, i) => i % 2 === 1)
    expect(Math.max(...ys)).toBeLessThan(-80)
  })

  it('zeichnet eine Gelenkfalte je Gelenk', () => {
    expect(fingerShape({ x: 0, y: 0 }, { x: 0, y: -100 }, 24, [0.4, 0.7]).creases.match(/M/g)).toHaveLength(2)
  })
})

describe('palmOutline', () => {
  it('umschließt die Knöchel beider Hände knapp von oben', () => {
    for (const hand of ['left', 'right'] as const) {
      const outline = palmOutline(hand)
      const top = Math.min(...outline.map((p) => p.y))
      for (const d of DIGITS.filter((d) => handOf(d) === hand && !d.endsWith('thumb'))) {
        expect(knuckle(d).y, d).toBeGreaterThan(top)
        expect(knuckle(d).y - top, d).toBeLessThan(0.8)
      }
    }
  })

  it('reicht unten über die Tastatur hinaus (Handgelenk)', () => {
    expect(Math.max(...palmOutline('left').map((p) => p.y))).toBeGreaterThan(6)
  })

  it('spiegelt die rechte Hand zur linken', () => {
    const left = palmOutline('left').map((p) => p.x)
    const right = palmOutline('right').map((p) => p.x)
    expect(Math.min(...left)).toBeLessThan(Math.min(...right))
  })
})

describe('smoothClosedPath', () => {
  it('erzeugt eine geschlossene Kurve durch alle Punkte', () => {
    const d = smoothClosedPath([{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 0, y: 1 }], 10)
    expect(d.startsWith('M0,0')).toBe(true)
    expect(d.match(/C/g)).toHaveLength(4)
    expect(d.endsWith('Z')).toBe(true)
  })
})
