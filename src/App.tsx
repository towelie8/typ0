import { useCallback, useEffect, useRef, useState } from 'react'
import { FingerHint } from './components/FingerHint'
import { FingerLegend } from './components/FingerLegend'
import { Keyboard } from './components/Keyboard'
import { KeyboardNotice } from './components/KeyboardNotice'
import { LessonPath } from './components/LessonPath'
import { Trainer } from './components/Trainer'
import { LESSONS } from './data/lessons'
import { useKeyState } from './hooks/useKeyState'
import { usePhysicalKeyboard } from './hooks/usePhysicalKeyboard'
import { useProgress } from './hooks/useProgress'
import { LocalStorageStore } from './lib/progress/LocalStorageStore'
import type { ProgressStore } from './lib/progress/ProgressStore'
import { accuracy, charsPerMinute } from './lib/stats'
import { strokesForChar } from './lib/strokes'
import { generateExercise } from './lib/textgen'
import { createTrainer, trainerReducer, type TrainerState } from './lib/trainer'

const defaultStore = new LocalStorageStore()

/** Laufende Übung; `run` unterscheidet Wiederholungen derselben Lektion. */
interface Session {
  index: number
  run: number
  trainer: TrainerState
}

export default function App({ store = defaultStore }: { store?: ProgressStore }) {
  const { progress, record } = useProgress(store)
  const [session, setSession] = useState<Session | null>(null)

  const onKey = useCallback((code: string, shift: boolean) => {
    setSession((s) => s && { ...s, trainer: trainerReducer(s.trainer, { type: 'key', code, shift, time: performance.now() }) })
  }, [])
  const { pressed, active, shiftAdvice, presses, press, release } = useKeyState(onKey)
  const hasKeyboard = usePhysicalKeyboard()

  const start = (index: number) => {
    // Sonst bliebe der geklickte Button fokussiert und Enter würde die Lektion neu starten.
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur()
    setSession((s) => ({ index, run: (s?.run ?? 0) + 1, trainer: createTrainer(generateExercise(LESSONS, index)) }))
  }

  // Ergebnis genau einmal je Durchlauf speichern.
  const recorded = useRef(0)
  useEffect(() => {
    if (!session || session.trainer.finishedAt === null || recorded.current === session.run) return
    recorded.current = session.run
    const { trainer } = session
    const lesson = LESSONS[session.index]
    record(
      lesson.id,
      {
        accuracy: accuracy(trainer.text.length, trainer.errors),
        cpm: charsPerMinute(trainer.text.length, trainer.finishedAt! - trainer.startedAt!),
      },
      lesson.minAccuracy,
    )
  }, [session, record])

  const running = session && session.trainer.finishedAt === null
  const guide = running ? strokesForChar(session.trainer.text[session.trainer.pos]).map((s) => s.code) : undefined

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-6 px-4 py-8">
      <header>
        <h1 className="text-3xl font-bold">typ0</h1>
        <p className="text-slate-600">10-Finger-Schreiben auf der deutschen Tastatur lernen</p>
      </header>
      {!hasKeyboard && <KeyboardNotice />}
      {/* Während der Übung ausgeblendet, damit Text und Tastatur auch auf kleinen Bildschirmen passen. */}
      {progress && !running && (
        <section aria-labelledby="path-title" className="flex flex-col gap-3">
          <div data-testid="path-intro">
            <h2 id="path-title" className="text-xl font-semibold">Lernpfad</h2>
            <p className="text-slate-600">
              Klicke auf eine Lektion und tippe den angezeigten Text ab. Ab 95 % Genauigkeit wird die nächste
              Lektion freigeschaltet. Beginne mit Lektion 1.
            </p>
          </div>
          <LessonPath lessons={LESSONS} progress={progress} current={session?.index ?? null} onSelect={start} />
        </section>
      )}
      {session ? (
        <Trainer
          key={session.run}
          lesson={LESSONS[session.index]}
          state={session.trainer}
          hasNext={session.index + 1 < LESSONS.length}
          onRestart={() => start(session.index)}
          onNext={() => start(session.index + 1)}
          onClose={() => setSession(null)}
        />
      ) : (
        <FingerHint code={active} shiftAdvice={shiftAdvice} />
      )}
      <Keyboard pressed={pressed} activeCode={active} guide={guide} presses={presses} onPress={press} onRelease={release} />
      <FingerLegend />
    </main>
  )
}
