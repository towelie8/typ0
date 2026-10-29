import { useCallback, useEffect, useState } from 'react'
import { recordResult, type Progress } from '../lib/progress/progress'
import type { ProgressStore } from '../lib/progress/ProgressStore'

/** Lädt den Fortschritt aus dem Store; `null`, solange er noch lädt. */
export function useProgress(store: ProgressStore) {
  const [progress, setProgress] = useState<Progress | null>(null)

  useEffect(() => {
    let cancelled = false
    store.load().then((p) => {
      if (!cancelled) setProgress(p)
    })
    return () => {
      cancelled = true
    }
  }, [store])

  const record = useCallback(
    (lessonId: string, result: { accuracy: number; cpm: number }, minAccuracy: number) => {
      const next = recordResult(progress ?? {}, lessonId, result, minAccuracy)
      setProgress(next)
      void store.save(next)
    },
    [progress, store],
  )

  return { progress, record }
}
