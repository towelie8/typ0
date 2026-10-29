import type { KeyDef } from '../data/layout'

/**
 * Buchstabentasten tragen nur den Großbuchstaben. Das ß zählt nicht dazu:
 * `'ß'.toUpperCase()` ergibt „SS“, die Taste zeigt stattdessen „?“ und „ß“.
 */
export function isLetterKey(key: KeyDef): boolean {
  return key.char !== undefined && key.char !== key.shiftChar && key.char.toUpperCase() === key.shiftChar
}

/** Kurzname der Taste für Anzeige, Tooltip und Screenreader. */
export function keyName(key: KeyDef): string {
  if (key.code === 'Space') return 'Leertaste'
  if (key.label !== undefined) return key.label
  return isLetterKey(key) ? key.shiftChar! : key.char!
}
