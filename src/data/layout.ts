/**
 * Deutsches ISO-QWERTZ-Layout – einzige Quelle für Tastatur, Hände und Textgenerator.
 *
 * Maße in Tasteneinheiten (1 = Breite einer Buchstabentaste). Jede Taste ist über
 * ihren `KeyboardEvent.code` identifiziert; der Code beschreibt die physische
 * Position (US-Benennung), deshalb liefert z. B. `KeyY` auf QWERTZ ein „z“.
 */

export type Finger =
  | 'l-pinky'
  | 'l-ring'
  | 'l-middle'
  | 'l-index'
  | 'thumb'
  | 'r-index'
  | 'r-middle'
  | 'r-ring'
  | 'r-pinky'

export interface KeyDef {
  code: string
  /** Zeichen ohne Shift; fehlt bei Funktionstasten. */
  char?: string
  /** Zeichen mit Shift. */
  shiftChar?: string
  /** Beschriftung für Funktionstasten. */
  label?: string
  row: number
  x: number
  width: number
  finger: Finger
  /** ISO-Enter reicht über zwei Reihen und ist in der unteren schmaler. */
  shape?: 'iso-enter'
}

export const KEYBOARD_WIDTH = 15
export const ROW_COUNT = 5

/** Einrückung des unteren Teils der ISO-Enter-Taste. */
export const ISO_ENTER_INSET = 0.25

type RowSpec = [code: string, char: string | null, shiftChar: string | null, finger: Finger, width?: number, label?: string]

/** Reihen von oben nach unten; x ergibt sich aus der Breite der Vorgänger. */
const ROWS: RowSpec[][] = [
  [
    ['Backquote', '^', '°', 'l-pinky'],
    ['Digit1', '1', '!', 'l-pinky'],
    ['Digit2', '2', '"', 'l-ring'],
    ['Digit3', '3', '§', 'l-middle'],
    ['Digit4', '4', '$', 'l-index'],
    ['Digit5', '5', '%', 'l-index'],
    // Die 6 liegt zwischen T und Z; festgelegt: linker Zeigefinger (Entscheidung 2026-10-29).
    ['Digit6', '6', '&', 'l-index'],
    ['Digit7', '7', '/', 'r-index'],
    ['Digit8', '8', '(', 'r-middle'],
    ['Digit9', '9', ')', 'r-ring'],
    ['Digit0', '0', '=', 'r-pinky'],
    ['Minus', 'ß', '?', 'r-pinky'],
    ['Equal', '´', '`', 'r-pinky'],
    ['Backspace', null, null, 'r-pinky', 2, '⟵'],
  ],
  [
    ['Tab', null, null, 'l-pinky', 1.5, 'Tab'],
    ['KeyQ', 'q', 'Q', 'l-pinky'],
    ['KeyW', 'w', 'W', 'l-ring'],
    ['KeyE', 'e', 'E', 'l-middle'],
    ['KeyR', 'r', 'R', 'l-index'],
    ['KeyT', 't', 'T', 'l-index'],
    ['KeyY', 'z', 'Z', 'r-index'],
    ['KeyU', 'u', 'U', 'r-index'],
    ['KeyI', 'i', 'I', 'r-middle'],
    ['KeyO', 'o', 'O', 'r-ring'],
    ['KeyP', 'p', 'P', 'r-pinky'],
    ['BracketLeft', 'ü', 'Ü', 'r-pinky'],
    ['BracketRight', '+', '*', 'r-pinky'],
    ['Enter', null, null, 'r-pinky', 1.5, '⏎'],
  ],
  [
    ['CapsLock', null, null, 'l-pinky', 1.75, '⇩'],
    ['KeyA', 'a', 'A', 'l-pinky'],
    ['KeyS', 's', 'S', 'l-ring'],
    ['KeyD', 'd', 'D', 'l-middle'],
    ['KeyF', 'f', 'F', 'l-index'],
    ['KeyG', 'g', 'G', 'l-index'],
    ['KeyH', 'h', 'H', 'r-index'],
    ['KeyJ', 'j', 'J', 'r-index'],
    ['KeyK', 'k', 'K', 'r-middle'],
    ['KeyL', 'l', 'L', 'r-ring'],
    ['Semicolon', 'ö', 'Ö', 'r-pinky'],
    ['Quote', 'ä', 'Ä', 'r-pinky'],
    ['Backslash', '#', "'", 'r-pinky'],
  ],
  [
    ['ShiftLeft', null, null, 'l-pinky', 1.25, '⇧'],
    ['IntlBackslash', '<', '>', 'l-pinky'],
    ['KeyZ', 'y', 'Y', 'l-pinky'],
    ['KeyX', 'x', 'X', 'l-ring'],
    ['KeyC', 'c', 'C', 'l-middle'],
    ['KeyV', 'v', 'V', 'l-index'],
    ['KeyB', 'b', 'B', 'l-index'],
    ['KeyN', 'n', 'N', 'r-index'],
    ['KeyM', 'm', 'M', 'r-index'],
    ['Comma', ',', ';', 'r-middle'],
    ['Period', '.', ':', 'r-ring'],
    ['Slash', '-', '_', 'r-pinky'],
    ['ShiftRight', null, null, 'r-pinky', 2.75, '⇧'],
  ],
  [
    ['ControlLeft', null, null, 'l-pinky', 1.25, 'Strg'],
    ['MetaLeft', null, null, 'thumb', 1.25, 'Win'],
    ['AltLeft', null, null, 'thumb', 1.25, 'Alt'],
    ['Space', ' ', ' ', 'thumb', 6.25, ''],
    ['AltRight', null, null, 'thumb', 1.25, 'Alt Gr'],
    ['MetaRight', null, null, 'thumb', 1.25, 'Win'],
    ['ContextMenu', null, null, 'r-pinky', 1.25, '≣'],
    ['ControlRight', null, null, 'r-pinky', 1.25, 'Strg'],
  ],
]

export const KEYS: KeyDef[] = ROWS.flatMap((row, rowIndex) => {
  let x = 0
  return row.map(([code, char, shiftChar, finger, width = 1, label]) => {
    const key: KeyDef = { code, row: rowIndex, x, width, finger }
    if (char !== null) key.char = char
    if (shiftChar !== null) key.shiftChar = shiftChar
    if (label !== undefined) key.label = label
    if (code === 'Enter') key.shape = 'iso-enter'
    x += width
    return key
  })
})

/** Taste, auf der jeder Finger in der Grundstellung ruht. */
export const HOME_KEYS: Record<Finger, string> = {
  'l-pinky': 'KeyA',
  'l-ring': 'KeyS',
  'l-middle': 'KeyD',
  'l-index': 'KeyF',
  'r-index': 'KeyJ',
  'r-middle': 'KeyK',
  'r-ring': 'KeyL',
  'r-pinky': 'Semicolon',
  thumb: 'Space',
}

const byCode = new Map(KEYS.map((k) => [k.code, k]))
const byChar = new Map<string, KeyDef>()
for (const k of KEYS) {
  if (k.char !== undefined) byChar.set(k.char, k)
  if (k.shiftChar !== undefined && !byChar.has(k.shiftChar)) byChar.set(k.shiftChar, k)
}

export function keyByCode(code: string): KeyDef | undefined {
  return byCode.get(code)
}

/** Taste, die das Zeichen erzeugt (mit oder ohne Shift). */
export function keyByChar(char: string): KeyDef | undefined {
  return byChar.get(char)
}

export interface KeyRect {
  key: KeyDef
  x: number
  width: number
}

/** Horizontaler Ausschnitt aller Tasten, die in der Reihe liegen (inkl. ISO-Enter unten). */
export function keysInRow(row: number): KeyRect[] {
  const rects: KeyRect[] = KEYS.filter((k) => k.row === row).map((key) => ({ key, x: key.x, width: key.width }))
  const enter = byCode.get('Enter')!
  if (row === enter.row + 1) {
    rects.push({ key: enter, x: enter.x + ISO_ENTER_INSET, width: enter.width - ISO_ENTER_INSET })
  }
  return rects
}
