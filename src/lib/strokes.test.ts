import { describe, expect, it } from 'vitest'
import { recommendedShift, strokesForChar } from './strokes'

describe('strokesForChar', () => {
  it('braucht für Kleinbuchstaben nur einen Finger', () => {
    expect(strokesForChar('f')).toEqual([{ digit: 'l-index', code: 'KeyF' }])
  })

  it('drückt Shift mit der Gegenhand', () => {
    expect(strokesForChar('A')).toEqual([
      { digit: 'r-pinky', code: 'ShiftRight' },
      { digit: 'l-pinky', code: 'KeyA' },
    ])
    expect(strokesForChar('?')).toEqual([
      { digit: 'l-pinky', code: 'ShiftLeft' },
      { digit: 'r-pinky', code: 'Minus' },
    ])
    expect(strokesForChar('Ö')[0].code).toBe('ShiftLeft')
  })

  it('nimmt für das Leerzeichen den rechten Daumen', () => {
    expect(strokesForChar(' ')).toEqual([{ digit: 'r-thumb', code: 'Space' }])
  })

  it('liefert nichts für unbekannte Zeichen', () => {
    expect(strokesForChar('€')).toEqual([])
  })
})

describe('recommendedShift', () => {
  it('empfiehlt die Shift-Taste der anderen Hand', () => {
    expect(recommendedShift('KeyA')).toBe('ShiftRight')
    expect(recommendedShift('KeyJ')).toBe('ShiftLeft')
  })

  it('hat für Tasten ohne Zeichen keine Empfehlung', () => {
    expect(recommendedShift('Enter')).toBeNull()
    expect(recommendedShift('ShiftLeft')).toBeNull()
    expect(recommendedShift('Space')).toBeNull()
  })
})
