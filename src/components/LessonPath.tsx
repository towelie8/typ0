import type { Lesson } from '../data/lessons'
import { isUnlocked, type Progress } from '../lib/progress/progress'

interface LessonPathProps {
  lessons: Lesson[]
  progress: Progress
  current: number | null
  onSelect: (index: number) => void
}

/** Übersicht des Lernpfads; gesperrte Lektionen sind nicht wählbar. */
export function LessonPath({ lessons, progress, current, onSelect }: LessonPathProps) {
  return (
    <nav aria-label="Lernpfad">
      <ol className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {lessons.map((lesson, index) => {
          const unlocked = isUnlocked(lessons, progress, index)
          const p = progress[lesson.id]
          let status = 'gesperrt'
          if (p?.passed) status = `bestanden · ${p.bestAccuracy.toLocaleString('de-DE')} %`
          else if (unlocked) status = p ? `beste Genauigkeit ${p.bestAccuracy.toLocaleString('de-DE')} %` : 'offen'
          return (
            <li key={lesson.id}>
              <button
                type="button"
                disabled={!unlocked}
                aria-current={index === current ? 'step' : undefined}
                data-lesson={lesson.id}
                data-passed={p?.passed || undefined}
                onClick={() => onSelect(index)}
                className={[
                  'flex w-full items-center gap-3 rounded-lg border px-3 py-2 text-left transition-colors',
                  'disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400',
                  index === current ? 'border-slate-900 bg-white ring-2 ring-slate-900' : 'border-slate-300 bg-white hover:border-slate-500',
                ].join(' ')}
              >
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                    p?.passed ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {p?.passed ? '✓' : index + 1}
                </span>
                <span className="min-w-0">
                  <span className="block truncate font-medium">{lesson.title}</span>
                  <span className="block text-sm text-slate-500">{status}</span>
                </span>
              </button>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
