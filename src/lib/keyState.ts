import { keyByCode } from '../data/layout'
import { recommendedShift } from './strokes'

export interface KeyState {
  /** Aktuell gehaltene Tasten (KeyboardEvent.code). */
  pressed: ReadonlySet<string>
  /** Zuletzt gedrückte Taste; bleibt nach dem Loslassen für die Fingeranzeige stehen. */
  active: string | null
  /**
   * Wurde Shift mit derselben Hand wie die Zeichentaste gedrückt, die bessere Shift-Taste.
   * Bleibt bis zur nächsten Zeichentaste stehen, damit der Hinweis lesbar ist.
   */
  shiftAdvice: 'ShiftLeft' | 'ShiftRight' | null
}

export type KeyAction =
  | { type: 'press'; code: string }
  | { type: 'release'; code: string }
  | { type: 'releaseAll' }

export const INITIAL_KEY_STATE: KeyState = { pressed: new Set(), active: null, shiftAdvice: null }

export function keyStateReducer(state: KeyState, action: KeyAction): KeyState {
  switch (action.type) {
    case 'press': {
      if (!keyByCode(action.code)) return state
      if (state.pressed.has(action.code) && state.active === action.code) return state
      return {
        pressed: new Set(state.pressed).add(action.code),
        active: action.code,
        shiftAdvice: nextShiftAdvice(state, action.code),
      }
    }
    case 'release': {
      if (!state.pressed.has(action.code)) return state
      const pressed = new Set(state.pressed)
      pressed.delete(action.code)
      return { ...state, pressed }
    }
    case 'releaseAll':
      return state.pressed.size === 0 ? state : { ...state, pressed: new Set() }
  }
}

function nextShiftAdvice(state: KeyState, code: string): KeyState['shiftAdvice'] {
  if (code === 'ShiftLeft' || code === 'ShiftRight') return state.shiftAdvice
  const recommended = recommendedShift(code)
  if (recommended === null) return null
  const wrong = recommended === 'ShiftRight' ? 'ShiftLeft' : 'ShiftRight'
  return state.pressed.has(wrong) && !state.pressed.has(recommended) ? recommended : null
}
