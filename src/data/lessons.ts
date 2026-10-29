import data from './lessons.json'

/**
 * Eine Lektion des Lernpfads. Neue Lektionen werden in `lessons.json` angehängt; freigeschaltet
 * wird in Array-Reihenfolge. Übungstexte enthalten nur Zeichen aus `newKeys` dieser und aller
 * vorigen Lektionen.
 */
export interface Lesson {
  id: string
  title: string
  description: string
  /** Zeichen, die in dieser Lektion dazukommen (" " = Leertaste, Großbuchstaben = mit Shift). */
  newKeys: string[]
  /** Genauigkeit in Prozent, ab der die nächste Lektion freigeschaltet wird. */
  minAccuracy: number
}

export const LESSONS: Lesson[] = data
