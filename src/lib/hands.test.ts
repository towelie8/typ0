import { describe, expect, it } from 'vitest'
import { HOME_KEYS, keyByCode } from '../data/layout'
import { DIGITS, arcPoint, digitForKey, digitTargets, handOf, handShift, homeTip, keyTip, knuckle, targetTip } from './hands'

const key = (code: string) => keyByCode(code)!

describe('Finger der Hände', () => {
  it('hat fünf Finger je Hand', () => {
    expect(DIGITS).toHaveLength(10)
    expect(DIGITS.filter((d) => handOf(d) === 'left')).toHaveLength(5)
  })

  it('ordnet Tasten über die Fingerzone zu', () => {
    expect(digitForKey(key('KeyR'))).toBe('l-index')
    expect(digitForKey(key('Semicolon'))).toBe('r-pinky')
  })

  it('drückt die Leertaste mit dem rechten Daumen', () => {
    expect(digitForKey(key('Space'))).toBe('r-thumb')
  })

  it('nimmt für Alt/Win den Daumen der Seite, auf der die Taste liegt', () => {
    expect(digitForKey(key('AltLeft'))).toBe('l-thumb')
    expect(digitForKey(key('MetaLeft'))).toBe('l-thumb')
    expect(digitForKey(key('AltRight'))).toBe('r-thumb')
  })
})

describe('Geometrie', () => {
  it('legt die Fingerkuppen in der Grundstellung auf die Grundtasten', () => {
    for (const d of DIGITS) {
      if (d.endsWith('thumb')) continue
      const home = key(HOME_KEYS[d as keyof typeof HOME_KEYS])
      const tip = homeTip(d)
      expect(tip.x, d).toBeGreaterThan(home.x)
      expect(tip.x, d).toBeLessThan(home.x + home.width)
      expect(tip.y, d).toBeGreaterThan(home.row)
      expect(tip.y, d).toBeLessThan(home.row + 1)
    }
  })

  it('legt beide Daumen auf die Leertaste, den linken links vom rechten', () => {
    const space = key('Space')
    for (const d of ['l-thumb', 'r-thumb'] as const) {
      const tip = homeTip(d)
      expect(tip.x).toBeGreaterThan(space.x)
      expect(tip.x).toBeLessThan(space.x + space.width)
      expect(Math.floor(tip.y)).toBe(space.row)
    }
    expect(homeTip('l-thumb').x).toBeLessThan(homeTip('r-thumb').x)
  })

  it('setzt die Knöchel unter die Fingerkuppen', () => {
    for (const d of DIGITS) expect(knuckle(d).y, d).toBeGreaterThan(homeTip(d).y)
  })

  it('zielt in den unteren Teil der Taste, damit die Beschriftung sichtbar bleibt', () => {
    const tip = keyTip(key('KeyR'))
    const r = key('KeyR')
    expect(tip.x).toBeCloseTo(r.x + 0.5)
    expect(tip.y).toBeGreaterThan(r.row + 0.5)
    expect(tip.y).toBeLessThan(r.row + 1)
  })

  it('bleibt ohne gedrückte Taste in der Grundstellung', () => {
    expect(targetTip('l-index', null)).toEqual(homeTip('l-index'))
  })

  it('lässt den rechten Daumen beim Drücken der Leertaste liegen', () => {
    expect(targetTip('r-thumb', 'Space')).toEqual(homeTip('r-thumb'))
  })

  it('bewegt die Kuppe zur Zieltaste', () => {
    expect(targetTip('l-index', 'KeyR')).toEqual(keyTip(key('KeyR')))
  })
})

describe('arcPoint', () => {
  it('liegt neben der direkten Linie, damit die Bewegung einen Bogen macht', () => {
    const from = { x: 0, y: 0 }
    const to = { x: 2, y: 0 }
    const p = arcPoint(from, to)
    expect(p.x).toBeCloseTo(1)
    expect(p.y).toBeLessThan(0)
  })

  it('wölbt nach oben, auch wenn die Bewegung nach unten geht', () => {
    const p = arcPoint({ x: 0, y: 0 }, { x: 1, y: 1 })
    expect(p.y).toBeLessThan(0.5)
  })

  it('ist bei gleicher Start- und Zielposition der Punkt selbst', () => {
    expect(arcPoint({ x: 1, y: 1 }, { x: 1, y: 1 })).toEqual({ x: 1, y: 1 })
  })
})

describe('digitTargets', () => {
  it('ordnet gehaltene Tasten ihren Fingern zu', () => {
    expect(digitTargets(['ShiftRight', 'KeyA'])).toEqual({ 'r-pinky': 'ShiftRight', 'l-pinky': 'KeyA' })
  })

  it('nimmt bei zwei Tasten desselben Fingers die zuletzt gedrückte', () => {
    expect(digitTargets(['KeyF', 'KeyR'])).toEqual({ 'l-index': 'KeyR' })
  })
})

describe('handShift', () => {
  it('bewegt die Hand nicht für Tasten in Reichweite', () => {
    expect(handShift('left', { 'l-index': 'KeyR' })).toEqual({ x: 0, y: 0 })
  })

  it('schiebt die Hand ein Stück Richtung Zahlenreihe', () => {
    const s = handShift('left', { 'l-ring': 'Digit2' })
    expect(s.y).toBeLessThan(0)
    expect(handShift('right', { 'l-ring': 'Digit2' })).toEqual({ x: 0, y: 0 })
  })
})
