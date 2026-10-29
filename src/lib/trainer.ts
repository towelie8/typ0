/**
 * Zustand einer Übung. Tasten werden über `KeyboardEvent.code` plus Shift-Zustand geprüft, nicht
 * über das erzeugte Zeichen: so stimmt die Prüfung unabhängig vom eingestellten Layout und auch
 * bei toten Tasten. Ein Fehler blockiert, bis die richtige Taste kommt.
 */
import { keyByChar, keyByCode } from '../data/layout'

export interface TrainerState {
  text: string
  /** Index des nächsten zu tippenden Zeichens. */
  pos: number
  errors: number
  /** Der letzte Anschlag war falsch; das aktuelle Zeichen wird rot markiert. */
  wrong: boolean
  /** Stellen, an denen mindestens ein Fehler passiert ist. */
  errorPositions: ReadonlySet<number>
  startedAt: number | null
  finishedAt: number | null
}

export type TrainerAction = { type: 'key'; code: string; shift: boolean; time: number }

export function createTrainer(text: string): TrainerState {
  return { text, pos: 0, errors: 0, wrong: false, errorPositions: new Set(), startedAt: null, finishedAt: null }
}

/** Taste und Shift-Zustand, die ein Zeichen erzeugen. */
export function expectedStroke(char: string): { code: string; shift: boolean } {
  const key = keyByChar(char)
  if (!key) throw new Error(`Zeichen ${JSON.stringify(char)} fehlt im Layout`)
  return { code: key.code, shift: char !== key.char }
}

export function trainerReducer(state: TrainerState, action: TrainerAction): TrainerState {
  if (state.finishedAt !== null) return state
  // Shift, Tab, Enter … erzeugen kein Zeichen und zählen weder als richtig noch als falsch.
  if (keyByCode(action.code)?.char === undefined) return state

  const expected = expectedStroke(state.text[state.pos])
  const correct = action.code === expected.code && (expected.code === 'Space' || action.shift === expected.shift)
  const startedAt = state.startedAt ?? action.time

  if (!correct) {
    return {
      ...state,
      startedAt,
      errors: state.errors + 1,
      wrong: true,
      errorPositions: new Set(state.errorPositions).add(state.pos),
    }
  }
  const pos = state.pos + 1
  return { ...state, startedAt, pos, wrong: false, finishedAt: pos === state.text.length ? action.time : null }
}
