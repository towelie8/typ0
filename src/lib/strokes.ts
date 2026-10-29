import { keyByChar, keyByCode } from '../data/layout'
import { digitForKey, handOf, type Digit } from './digits'

/** Ein Tastendruck: welcher Finger welche Taste drückt. */
export interface Stroke {
  digit: Digit
  code: string
}

/** Shift-Taste der Gegenhand für eine Zeichentaste; null für Tasten ohne Zeichen und die Leertaste. */
export function recommendedShift(code: string): 'ShiftLeft' | 'ShiftRight' | null {
  const key = keyByCode(code)
  if (!key || key.char === undefined || key.finger === 'thumb') return null
  return handOf(digitForKey(key)) === 'left' ? 'ShiftRight' : 'ShiftLeft'
}

/** Tastendrücke für ein Zeichen; Shift kommt zuerst und liegt bei der Gegenhand. */
export function strokesForChar(char: string): Stroke[] {
  const key = keyByChar(char)
  if (!key) return []
  const stroke: Stroke = { digit: digitForKey(key), code: key.code }
  if (char === key.char) return [stroke]
  const shift = recommendedShift(key.code)!
  return [{ digit: shift === 'ShiftRight' ? 'r-pinky' : 'l-pinky', code: shift }, stroke]
}
