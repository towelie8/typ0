import { FingerHint } from './components/FingerHint'
import { FingerLegend } from './components/FingerLegend'
import { Keyboard } from './components/Keyboard'
import { KeyboardNotice } from './components/KeyboardNotice'
import { useKeyState } from './hooks/useKeyState'
import { usePhysicalKeyboard } from './hooks/usePhysicalKeyboard'

export default function App() {
  const { pressed, active, press, release } = useKeyState()
  const hasKeyboard = usePhysicalKeyboard()

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-6 px-4 py-8">
      <header>
        <h1 className="text-3xl font-bold">typ0</h1>
        <p className="text-slate-600">10-Finger-Schreiben auf der deutschen Tastatur lernen</p>
      </header>
      {!hasKeyboard && <KeyboardNotice />}
      <FingerHint code={active} />
      <Keyboard pressed={pressed} activeCode={active} onPress={press} onRelease={release} />
      <FingerLegend />
    </main>
  )
}
