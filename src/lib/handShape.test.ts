import { describe, expect, it } from 'vitest'
import { DIGITS, handOf, knuckle } from './hands'
import { palmOutline, smoothClosedPath } from './handShape'

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
