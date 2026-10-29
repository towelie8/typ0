import { isPassed } from '../stats'

export interface LessonProgress {
  attempts: number
  bestAccuracy: number
  /** Beste Anschläge pro Minute. */
  bestCpm: number
  /** Mindestens einmal mit der Mindestgenauigkeit abgeschlossen. */
  passed: boolean
}

/** Fortschritt je Lektions-ID. */
export type Progress = Record<string, LessonProgress>

/** Die erste Lektion ist immer offen, jede weitere nach Bestehen der vorigen. */
export function isUnlocked(lessons: { id: string }[], progress: Progress, index: number): boolean {
  return index === 0 || progress[lessons[index - 1].id]?.passed === true
}

export function recordResult(
  progress: Progress,
  lessonId: string,
  result: { accuracy: number; cpm: number },
  minAccuracy: number,
): Progress {
  const old = progress[lessonId]
  return {
    ...progress,
    [lessonId]: {
      attempts: (old?.attempts ?? 0) + 1,
      bestAccuracy: Math.max(old?.bestAccuracy ?? 0, result.accuracy),
      bestCpm: Math.max(old?.bestCpm ?? 0, result.cpm),
      passed: (old?.passed ?? false) || isPassed(result.accuracy, minAccuracy),
    },
  }
}
