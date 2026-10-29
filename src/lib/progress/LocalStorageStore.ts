import type { LessonProgress, Progress } from './progress'
import type { ProgressStore } from './ProgressStore'

function isLessonProgress(value: unknown): value is LessonProgress {
  if (typeof value !== 'object' || value === null) return false
  const v = value as Record<string, unknown>
  return (
    typeof v.attempts === 'number' &&
    typeof v.bestAccuracy === 'number' &&
    typeof v.bestCpm === 'number' &&
    typeof v.passed === 'boolean'
  )
}

/** Fortschritt im Browser. Fehlender oder kaputter Inhalt ergibt leeren Fortschritt. */
export class LocalStorageStore implements ProgressStore {
  /** Versioniert, damit ein späteres Format den alten Stand nicht falsch liest. */
  static readonly KEY = 'typ0.progress.v1'

  private readonly storage: Storage

  constructor(storage: Storage = window.localStorage) {
    this.storage = storage
  }

  async load(): Promise<Progress> {
    try {
      const parsed: unknown = JSON.parse(this.storage.getItem(LocalStorageStore.KEY) ?? '{}')
      if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return {}
      return Object.fromEntries(Object.entries(parsed).filter(([, v]) => isLessonProgress(v)))
    } catch {
      return {}
    }
  }

  async save(progress: Progress): Promise<void> {
    try {
      this.storage.setItem(LocalStorageStore.KEY, JSON.stringify(progress))
    } catch {
      // Privater Modus oder voller Speicher: Üben geht weiter, nur ohne Speichern.
    }
  }
}
