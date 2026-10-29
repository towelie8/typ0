import { describe, expect, it } from 'vitest'
import { INITIAL_KEY_STATE, keyStateReducer } from './keyState'

describe('keyStateReducer', () => {
  it('merkt gedrückte Tasten und die zuletzt gedrückte', () => {
    let s = keyStateReducer(INITIAL_KEY_STATE, { type: 'press', code: 'KeyF' })
    s = keyStateReducer(s, { type: 'press', code: 'ShiftRight' })
    expect([...s.pressed]).toEqual(['KeyF', 'ShiftRight'])
    expect(s.active).toBe('ShiftRight')
  })

  it('behält die zuletzt gedrückte Taste nach dem Loslassen als Anzeige', () => {
    let s = keyStateReducer(INITIAL_KEY_STATE, { type: 'press', code: 'KeyJ' })
    s = keyStateReducer(s, { type: 'release', code: 'KeyJ' })
    expect(s.pressed.size).toBe(0)
    expect(s.active).toBe('KeyJ')
  })

  it('ignoriert Tasten, die es im Layout nicht gibt', () => {
    const s = keyStateReducer(INITIAL_KEY_STATE, { type: 'press', code: 'F5' })
    expect(s).toBe(INITIAL_KEY_STATE)
  })

  it('ändert den Zustand bei Tastenwiederholung nicht', () => {
    const s = keyStateReducer(INITIAL_KEY_STATE, { type: 'press', code: 'KeyA' })
    expect(keyStateReducer(s, { type: 'press', code: 'KeyA' })).toBe(s)
  })

  it('lässt beim Fokusverlust alle Tasten los', () => {
    let s = keyStateReducer(INITIAL_KEY_STATE, { type: 'press', code: 'KeyA' })
    s = keyStateReducer(s, { type: 'releaseAll' })
    expect(s.pressed.size).toBe(0)
    expect(s.active).toBe('KeyA')
  })
})
