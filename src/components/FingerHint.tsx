import { FINGERS } from '../data/fingers'
import { keyByCode } from '../data/layout'
import { keyName } from '../lib/keyName'

/** Zeigt für die zuletzt gedrückte Taste, welcher Finger zuständig ist. */
export function FingerHint({ code }: { code: string | null }) {
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
    </p>
  )
}
