import { FINGERS } from '../data/fingers'
import { HOME_KEYS, ISO_ENTER_INSET, KEYBOARD_WIDTH, KEYS, ROW_COUNT, type KeyDef } from '../data/layout'

/** Pixel pro Tasteneinheit im SVG-Koordinatensystem. */
const UNIT = 60
const GAP = 4
const RADIUS = 6

const homeCodes = new Set(Object.values(HOME_KEYS))
/** F und J haben auf echten Tastaturen eine fühlbare Markierung. */
const BUMP_CODES = new Set(['KeyF', 'KeyJ'])

/** Umriss der ISO-Enter-Taste: oben volle Breite, unten um ISO_ENTER_INSET eingerückt. */
function isoEnterPath(key: KeyDef): string {
  const left = key.x * UNIT + GAP / 2
  const right = (key.x + key.width) * UNIT - GAP / 2
  const top = key.row * UNIT + GAP / 2
  const middle = (key.row + 1) * UNIT + GAP / 2
  const bottom = (key.row + 2) * UNIT - GAP / 2
  const innerLeft = (key.x + ISO_ENTER_INSET) * UNIT + GAP / 2
  return `M${left},${top} H${right} V${bottom} H${innerLeft} V${middle} H${left} Z`
}

/**
 * Buchstabentasten tragen nur den Großbuchstaben. Das ß zählt nicht dazu:
 * `'ß'.toUpperCase()` ergibt „SS“, die Taste zeigt stattdessen „?“ und „ß“.
 */
function isLetterKey(key: KeyDef): boolean {
  return key.char !== undefined && key.char !== key.shiftChar && key.char.toUpperCase() === key.shiftChar
}

/** Kurzname der Taste für Tooltip und Screenreader. */
function keyName(key: KeyDef): string {
  if (key.code === 'Space') return 'Leertaste'
  if (key.label !== undefined) return key.label
  return isLetterKey(key) ? key.shiftChar! : key.char!
}

function KeyCap({ keyDef }: { keyDef: KeyDef }) {
  const finger = FINGERS[keyDef.finger]
  const x = keyDef.x * UNIT + GAP / 2
  const y = keyDef.row * UNIT + GAP / 2
  const w = keyDef.width * UNIT - GAP
  const h = UNIT - GAP
  const { char, shiftChar, label } = keyDef

  let text
  if (label !== undefined) {
    text = (
      <text x={x + 10} y={y + h / 2} dominantBaseline="central" className="fill-slate-600 text-[15px]">
        {label}
      </text>
    )
  } else if (isLetterKey(keyDef)) {
    text = (
      <text x={x + w / 2} y={y + h / 2} textAnchor="middle" dominantBaseline="central" className="fill-slate-900 text-[22px] font-semibold">
        {shiftChar}
      </text>
    )
  } else {
    // Zeichen-Tasten: Shift-Belegung oben, Grundbelegung unten – wie auf der echten Tastatur.
    text = (
      <g className="fill-slate-900 text-[17px]">
        <text x={x + 12} y={y + 17} dominantBaseline="central" className="fill-slate-500">{shiftChar}</text>
        <text x={x + 12} y={y + h - 16} dominantBaseline="central">{char}</text>
      </g>
    )
  }

  return (
    <g data-code={keyDef.code} data-finger={keyDef.finger} data-home={homeCodes.has(keyDef.code) || undefined}>
      <title>{`${keyName(keyDef)}: ${finger.name}`}</title>
      {keyDef.shape === 'iso-enter' ? (
        <path d={isoEnterPath(keyDef)} fill={finger.fill} stroke={finger.stroke} strokeWidth={1.5} strokeLinejoin="round" />
      ) : (
        <rect x={x} y={y} width={w} height={h} rx={RADIUS} fill={finger.fill} stroke={finger.stroke} strokeWidth={1.5} />
      )}
      {text}
      {BUMP_CODES.has(keyDef.code) && (
        <line x1={x + w / 2 - 8} x2={x + w / 2 + 8} y1={y + h - 9} y2={y + h - 9} stroke="#0f172a" strokeWidth={2} strokeLinecap="round" />
      )}
    </g>
  )
}

/** Deutsche ISO-QWERTZ-Tastatur, Tasten nach Fingerzone eingefärbt. */
export function Keyboard() {
  return (
    <svg
      viewBox={`0 0 ${KEYBOARD_WIDTH * UNIT} ${ROW_COUNT * UNIT}`}
      className="h-auto w-full select-none"
      role="img"
      aria-label="Deutsche QWERTZ-Tastatur, Tasten nach Fingern eingefärbt"
    >
      {KEYS.map((key) => (
        <KeyCap key={key.code} keyDef={key} />
      ))}
    </svg>
  )
}
