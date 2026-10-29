import { FINGERS } from '../data/fingers'
import type { Lesson } from '../data/lessons'
import { keyByCode } from '../data/layout'
import { fingerOf } from '../lib/digits'
import { keyName } from '../lib/keyName'
import { accuracy, charsPerMinute, isPassed } from '../lib/stats'
import { strokesForChar } from '../lib/strokes'
import type { TrainerState } from '../lib/trainer'

interface TrainerProps {
  lesson: Lesson
  state: TrainerState
  hasNext: boolean
  onRestart: () => void
  onNext: () => void
  onClose: () => void
}

/** Zerlegt den Text in Wörter, jeweils mit dem folgenden Leerzeichen. */
function words(text: string): { start: number; chars: string[] }[] {
  return [...text.matchAll(/\S+ ?| /g)].map((m) => ({ start: m.index, chars: [...m[0]] }))
}

/** Welche Finger das nächste Zeichen tippen, z. B. „Shift mit dem rechten kleinen Finger, A mit dem linken …“. */
function NextHint({ char }: { char: string }) {
  const strokes = strokesForChar(char)
  return (
    <p className="text-center text-lg" aria-live="polite" data-testid="next-hint">
      {strokes.map((stroke, i) => {
        const finger = FINGERS[fingerOf(stroke.digit)]
        const key = keyByCode(stroke.code)!
        const name = stroke.code === 'ShiftLeft' ? 'linkes Shift' : stroke.code === 'ShiftRight' ? 'rechtes Shift' : keyName(key)
        // Daumen sind im Layout ein Finger; hier zählt die Hand.
        const who = stroke.digit === 'r-thumb' ? 'rechten Daumen' : finger.dative
        return (
          <span key={stroke.code}>
            {i > 0 && ', dazu '}
            <kbd
              className="mx-1 inline-block min-w-10 rounded-md border-2 px-2 py-0.5 font-semibold"
              style={{ background: finger.fill, borderColor: finger.stroke }}
            >
              {name}
            </kbd>
            mit dem <strong style={{ color: finger.stroke }}>{who}</strong>
          </span>
        )
      })}
    </p>
  )
}

/** Anleitung vor dem ersten Anschlag; verschwindet, sobald getippt wird. */
function LessonIntro({ minAccuracy }: { minAccuracy: number }) {
  return (
    <div data-testid="lesson-intro" className="rounded-lg border border-sky-200 bg-sky-50 p-4">
      <p className="font-semibold">So geht's</p>
      <ol className="mt-1 list-decimal space-y-1 pl-5">
        <li>
          Lege die Finger in die Grundstellung: links auf <kbd>A</kbd> <kbd>S</kbd> <kbd>D</kbd> <kbd>F</kbd>,
          rechts auf <kbd>J</kbd> <kbd>K</kbd> <kbd>L</kbd> <kbd>Ö</kbd>, den rechten Daumen auf die Leertaste.
          F und J haben eine fühlbare Markierung.
        </li>
        <li>
          Tippe den Text oben Zeichen für Zeichen ab. Die nächste Taste ist auf der Tastatur gestrichelt
          umrandet, darunter steht, welcher Finger sie drückt. <kbd>␣</kbd> steht für die Leertaste.
        </li>
        <li>Nach jedem Anschlag kehrt der Finger in die Grundstellung zurück. Schau dabei möglichst auf den Bildschirm, nicht auf die Hände.</li>
        <li>
          Bei einem Fehler wird das Zeichen rot und es geht erst mit der richtigen Taste weiter. Ab {minAccuracy} %
          Genauigkeit ist die Lektion bestanden und die nächste wird freigeschaltet.
        </li>
      </ol>
      <p className="mt-2 text-sm text-slate-600">Die Übung startet mit deinem ersten Tastendruck, die Zeit läuft erst ab dann.</p>
    </div>
  )
}

/** Übungszeile mit Fehlermarkierung, Live-Statistik und Ergebnis am Ende. */
export function Trainer({ lesson, state, hasNext, onRestart, onNext, onClose }: TrainerProps) {
  const done = state.finishedAt !== null
  const acc = accuracy(state.pos, state.errors)
  const cpm = done ? charsPerMinute(state.text.length, state.finishedAt! - state.startedAt!) : 0
  const passed = isPassed(acc, lesson.minAccuracy)

  return (
    <section aria-label={`Lektion ${lesson.title}`} className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">{lesson.title}</h2>
          <p className="text-slate-600">{lesson.description}</p>
        </div>
        <button type="button" onClick={onClose} className="shrink-0 rounded-md px-2 py-1 text-sm text-slate-600 hover:bg-slate-100">
          Lektion verlassen
        </button>
      </div>

      <p
        data-testid="exercise"
        data-text={state.text}
        className="font-mono text-2xl leading-relaxed tracking-wide"
        aria-label={`Übungstext: ${state.text}`}
      >
        {words(state.text).map(({ start, chars }) => (
          // Wort samt folgendem Leerzeichen bleibt beim Umbruch zusammen.
          <span key={start} className="inline-block whitespace-nowrap">
            {chars.map((ch, offset) => {
              const i = start + offset
              const status = i < state.pos ? 'done' : i === state.pos && !done ? 'current' : 'todo'
              const error = state.errorPositions.has(i)
              let cls = 'text-slate-400'
              if (status === 'done') cls = error ? 'text-red-600' : 'text-slate-900'
              if (status === 'current') cls = state.wrong ? 'bg-red-100 text-red-700 underline decoration-red-600 decoration-4 underline-offset-8' : 'bg-sky-100 text-slate-900 underline decoration-sky-600 decoration-4 underline-offset-8'
              return (
                <span key={i} data-state={status} data-error={error || undefined} className={`rounded-sm ${cls}`}>
                  {ch === ' ' ? '␣' : ch}
                </span>
              )
            })}
          </span>
        ))}
      </p>

      {state.startedAt === null && <LessonIntro minAccuracy={lesson.minAccuracy} />}

      {!done && (
        <>
          <NextHint char={state.text[state.pos]} />
          <p className="text-center text-sm text-slate-500" data-testid="live-stats">
            Fehler: {state.errors} · Genauigkeit: {acc.toLocaleString('de-DE')} %
          </p>
        </>
      )}

      {done && (
        <div
          data-testid="result"
          data-passed={passed || undefined}
          className={`rounded-lg border p-4 ${passed ? 'border-emerald-300 bg-emerald-50' : 'border-amber-300 bg-amber-50'}`}
        >
          <p className="text-lg font-semibold">
            {passed ? 'Bestanden!' : `Noch nicht ganz: Für die nächste Lektion brauchst du ${lesson.minAccuracy} %.`}
          </p>
          <p className="mt-1">
            Genauigkeit {acc.toLocaleString('de-DE')} % · {cpm} Anschläge pro Minute · {state.errors} Fehler
          </p>
          {passed && hasNext && <p className="mt-1">Die nächste Lektion ist freigeschaltet.</p>}
          <div className="mt-3 flex gap-2">
            <button type="button" onClick={onRestart} className="rounded-md border border-slate-400 bg-white px-3 py-1.5 hover:bg-slate-50">
              Nochmal
            </button>
            {passed && hasNext && (
              <button type="button" onClick={onNext} className="rounded-md bg-slate-900 px-3 py-1.5 text-white hover:bg-slate-700">
                Nächste Lektion
              </button>
            )}
          </div>
        </div>
      )}
    </section>
  )
}
