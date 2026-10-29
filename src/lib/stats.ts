/** Genauigkeit in Prozent, auf eine Nachkommastelle abgerundet (94,99 % gilt nicht als 95 %). */
export function accuracy(chars: number, errors: number): number {
  if (chars + errors === 0) return 100
  return Math.floor((chars * 1000) / (chars + errors)) / 10
}

/** Anschläge pro Minute, gerundet. */
export function charsPerMinute(chars: number, ms: number): number {
  return ms > 0 ? Math.round((chars * 60_000) / ms) : 0
}

export function isPassed(accuracyPercent: number, minAccuracy: number): boolean {
  return accuracyPercent >= minAccuracy
}
