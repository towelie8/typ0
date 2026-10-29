import { describe, expect, it } from 'vitest'
import { createTrainer, expectedStroke, trainerReducer, type TrainerState } from './trainer'

const key = (state: TrainerState, code: string, shift = false, time = 0) =>
  trainerReducer(state, { type: 'key', code, shift, time })

describe('expectedStroke', () => {
  it('kennt Taste und Shift für das nächste Zeichen', () => {
    expect(expectedStroke('a')).toEqual({ code: 'KeyA', shift: false })
    expect(expectedStroke('Ö')).toEqual({ code: 'Semicolon', shift: true })
    expect(expectedStroke(' ')).toEqual({ code: 'Space', shift: false })
  })
})

describe('trainerReducer', () => {
  it('rückt bei der richtigen Taste vor', () => {
    const s = key(createTrainer('as'), 'KeyA')
    expect(s.pos).toBe(1)
    expect(s.errors).toBe(0)
  })

  it('blockiert bei einer falschen Taste, zählt den Fehler und markiert die Stelle', () => {
    let s = key(createTrainer('as'), 'KeyS')
    expect(s.pos).toBe(0)
    expect(s.errors).toBe(1)
    expect(s.wrong).toBe(true)
    expect(s.errorPositions.has(0)).toBe(true)
    s = key(s, 'KeyA')
    expect(s.pos).toBe(1)
    expect(s.wrong).toBe(false)
    expect(s.errorPositions.has(0)).toBe(true)
  })

  it('verlangt für Großbuchstaben Shift', () => {
    let s = key(createTrainer('A'), 'KeyA')
    expect(s.pos).toBe(0)
    s = key(s, 'KeyA', true)
    expect(s.pos).toBe(1)
  })

  it('wertet Großbuchstaben auch bei Shift auf derselben Seite als richtig', () => {
    expect(key(createTrainer('A'), 'KeyA', true).pos).toBe(1)
  })

  it('ignoriert Tasten ohne Zeichen wie Shift oder Tab', () => {
    const start = createTrainer('A')
    expect(key(start, 'ShiftRight', true)).toBe(start)
    expect(key(start, 'Tab')).toBe(start)
  })

  it('akzeptiert die Leertaste auch mit gehaltenem Shift', () => {
    expect(key(createTrainer(' a'), 'Space', true).pos).toBe(1)
  })

  it('misst die Zeit vom ersten Anschlag bis zum letzten Zeichen', () => {
    let s = key(createTrainer('as'), 'KeyA', false, 1000)
    expect(s.startedAt).toBe(1000)
    s = key(s, 'KeyS', false, 4000)
    expect(s.finishedAt).toBe(4000)
  })

  it('nimmt nach dem Ende keine Eingaben mehr an', () => {
    const done = key(createTrainer('a'), 'KeyA')
    expect(key(done, 'KeyA')).toBe(done)
  })
})
