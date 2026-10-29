import type { Progress } from './progress'

/**
 * Ablage für den Lernfortschritt. Komponenten kennen nur diese Schnittstelle; heute steckt
 * `LocalStorageStore` dahinter, später ein Server mit Konten. Deshalb asynchron.
 */
export interface ProgressStore {
  load(): Promise<Progress>
  save(progress: Progress): Promise<void>
}
