import { FINGERS, FINGER_ORDER } from '../data/fingers'

/** Farblegende der Fingerzonen. */
export function FingerLegend() {
  return (
    <ul className="flex flex-wrap justify-center gap-2 text-sm" aria-label="Farblegende der Finger">
      {FINGER_ORDER.map((finger) => (
        <li
          key={finger}
          data-finger={finger}
          className="flex items-center gap-2 rounded-full border px-3 py-1"
          style={{ background: FINGERS[finger].fill, borderColor: FINGERS[finger].stroke }}
        >
          <span className="h-3 w-3 rounded-full" style={{ background: FINGERS[finger].stroke }} aria-hidden />
          {FINGERS[finger].name}
        </li>
      ))}
    </ul>
  )
}
