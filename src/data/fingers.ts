import type { Finger } from './layout'

export interface FingerInfo {
  /** Deutscher Name für Anzeige und Screenreader. */
  name: string
  /** Hintergrund der Tasten in dieser Zone. */
  fill: string
  /** Rand und Akzent (Legende, Hervorhebung). */
  stroke: string
}

/** Fingerzonen-Farben; links kühle, rechts warme Töne, damit beide Hände unterscheidbar bleiben. */
export const FINGERS: Record<Finger, FingerInfo> = {
  'l-pinky': { name: 'linker kleiner Finger', fill: '#e0e7ff', stroke: '#4f46e5' },
  'l-ring': { name: 'linker Ringfinger', fill: '#dbeafe', stroke: '#2563eb' },
  'l-middle': { name: 'linker Mittelfinger', fill: '#cffafe', stroke: '#0891b2' },
  'l-index': { name: 'linker Zeigefinger', fill: '#d1fae5', stroke: '#059669' },
  thumb: { name: 'Daumen', fill: '#f1f5f9', stroke: '#64748b' },
  'r-index': { name: 'rechter Zeigefinger', fill: '#fef9c3', stroke: '#ca8a04' },
  'r-middle': { name: 'rechter Mittelfinger', fill: '#ffedd5', stroke: '#ea580c' },
  'r-ring': { name: 'rechter Ringfinger', fill: '#ffe4e6', stroke: '#e11d48' },
  'r-pinky': { name: 'rechter kleiner Finger', fill: '#fae8ff', stroke: '#c026d3' },
}

/** Reihenfolge für die Legende: von links nach rechts über beide Hände. */
export const FINGER_ORDER: Finger[] = [
  'l-pinky', 'l-ring', 'l-middle', 'l-index', 'thumb', 'r-index', 'r-middle', 'r-ring', 'r-pinky',
]
