import { FINGERS } from '../data/fingers'
import { keyByCode } from '../data/layout'
import { keyName } from '../lib/keyName'

/** Zeigt für die zuletzt gedrückte Taste, welcher Finger zuständig ist. */
interface FingerHintProps {
  code: string | null
  /** Bessere Shift-Taste, falls Shift mit derselben Hand gedrückt wurde. */
  shiftAdvice?: 'ShiftLeft' | 'ShiftRight' | null
}

export function FingerHint({ code, shiftAdvice = null }: FingerHintProps) {
  const key = code ? keyByCode(code) : undefined
  if (!key) {
    return (
      <p className="text-center text-slate-600" aria-live="polite" data-testid="finger-hint">
        Drücke eine Taste oder klicke auf die Tastatur.
      </p>
    )
  }
  const finger = FINGERS[key.finger]
  return (
    <p className="text-center text-lg" aria-live="polite" data-testid="finger-hint">
      <kbd
        className="mr-2 inline-block min-w-10 rounded-md border-2 px-2 py-0.5 font-semibold"
        style={{ background: finger.fill, borderColor: finger.stroke }}
      >
        {keyName(key)}
      </kbd>
      drückst du mit dem <strong style={{ color: finger.stroke }}>{finger.dative}</strong>.
      {shiftAdvice && (
        <span className="mt-1 block text-base text-amber-700" data-testid="shift-advice">
          Shift drückt die andere Hand: hier der {shiftAdvice === 'ShiftRight' ? 'rechte' : 'linke'} kleine Finger
          auf der {shiftAdvice === 'ShiftRight' ? 'rechten' : 'linken'} Shift-Taste.
        </span>
      )}
    </p>
  )
}
