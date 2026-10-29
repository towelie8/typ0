import { describe, expect, it } from 'vitest'
import { HOME_KEYS, KEYBOARD_WIDTH, KEYS, keyByChar, keyByCode, keysInRow } from './layout'

describe('QWERTZ-Layout', () => {
  it('hat eindeutige KeyboardEvent.codes', () => {
    const codes = KEYS.map((k) => k.code)
    expect(new Set(codes).size).toBe(codes.length)
  })

  it('enthält alle Buchstaben inkl. Umlaute und ß', () => {
    for (const ch of 'abcdefghijklmnopqrstuvwxyzäöüß') {
      expect(keyByChar(ch), ch).toBeDefined()
    }
  })

  it('vertauscht Y und Z gegenüber US-Codes', () => {
    expect(keyByCode('KeyY')?.char).toBe('z')
    expect(keyByCode('KeyZ')?.char).toBe('y')
  })

  it('setzt die Grundstellung auf ASDF und JKLÖ', () => {
    expect(HOME_KEYS).toEqual({
      'l-pinky': 'KeyA',
      'l-ring': 'KeyS',
      'l-middle': 'KeyD',
      'l-index': 'KeyF',
      'r-index': 'KeyJ',
      'r-middle': 'KeyK',
      'r-ring': 'KeyL',
      'r-pinky': 'Semicolon',
      thumb: 'Space',
    })
  })

  it.each([
    ['a', 'l-pinky'], ['q', 'l-pinky'], ['y', 'l-pinky'], ['<', 'l-pinky'],
    ['s', 'l-ring'], ['w', 'l-ring'], ['x', 'l-ring'],
    ['d', 'l-middle'], ['e', 'l-middle'], ['c', 'l-middle'],
    ['f', 'l-index'], ['g', 'l-index'], ['6', 'l-index'], ['7', 'r-index'], ['r', 'l-index'], ['t', 'l-index'], ['v', 'l-index'], ['b', 'l-index'],
    ['j', 'r-index'], ['h', 'r-index'], ['z', 'r-index'], ['u', 'r-index'], ['n', 'r-index'], ['m', 'r-index'],
    ['k', 'r-middle'], ['i', 'r-middle'], [',', 'r-middle'],
    ['l', 'r-ring'], ['o', 'r-ring'], ['.', 'r-ring'],
    ['ö', 'r-pinky'], ['ä', 'r-pinky'], ['ü', 'r-pinky'], ['ß', 'r-pinky'], ['p', 'r-pinky'], ['-', 'r-pinky'], ['#', 'r-pinky'], ['+', 'r-pinky'],
    [' ', 'thumb'],
  ])('ordnet %j dem Finger %s zu', (ch, finger) => {
    expect(keyByChar(ch)?.finger).toBe(finger)
  })

  it('findet Shift-Zeichen über die Taste', () => {
    expect(keyByChar('Ö')?.code).toBe('Semicolon')
    expect(keyByChar('?')?.code).toBe('Minus')
    expect(keyByChar(':')?.code).toBe('Period')
  })

  it('hat in jeder Reihe dieselbe Gesamtbreite', () => {
    for (let row = 0; row <= 4; row++) {
      const rects = keysInRow(row)
      const right = Math.max(...rects.map((r) => r.x + r.width))
      expect(right, `Reihe ${row}`).toBeCloseTo(KEYBOARD_WIDTH)
    }
  })

  it('reiht die Tasten lückenlos und ohne Überlappung aneinander', () => {
    for (let row = 0; row <= 4; row++) {
      const rects = keysInRow(row).sort((a, b) => a.x - b.x)
      expect(rects[0].x, `Reihe ${row} beginnt bei 0`).toBe(0)
      for (let i = 1; i < rects.length; i++) {
        expect(rects[i].x, rects[i].key.code).toBeCloseTo(rects[i - 1].x + rects[i - 1].width)
      }
    }
  })
})
