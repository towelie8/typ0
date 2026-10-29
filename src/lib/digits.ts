/**
 * Finger beider Hände. Das Layout kennt nur einen `thumb`; für Anzeige und Shift-Regel wird er
 * nach Seite aufgeteilt.
 */
import { KEYBOARD_WIDTH, type Finger, type KeyDef } from '../data/layout'

export type Digit =
  | 'l-pinky'
  | 'l-ring'
  | 'l-middle'
  | 'l-index'
  | 'l-thumb'
  | 'r-thumb'
  | 'r-index'
  | 'r-middle'
  | 'r-ring'
  | 'r-pinky'

export type Hand = 'left' | 'right'

export const DIGITS: Digit[] = [
  'l-pinky', 'l-ring', 'l-middle', 'l-index', 'l-thumb', 'r-thumb', 'r-index', 'r-middle', 'r-ring', 'r-pinky',
]

export function handOf(digit: Digit): Hand {
  return digit.startsWith('l-') ? 'left' : 'right'
}

/** Fingerzone im Layout (für Farben und Namen). */
export function fingerOf(digit: Digit): Finger {
  return digit.endsWith('thumb') ? 'thumb' : (digit as Finger)
}

/** Die Leertaste drückt der rechte Daumen, Alt/Win der Daumen auf ihrer Seite. */
export function digitForKey(key: KeyDef): Digit {
  if (key.finger !== 'thumb') return key.finger
  if (key.code === 'Space') return 'r-thumb'
  return key.x + key.width / 2 < KEYBOARD_WIDTH / 2 ? 'l-thumb' : 'r-thumb'
}
