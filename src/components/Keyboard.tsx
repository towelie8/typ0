import { FINGERS } from '../data/fingers'
import { HOME_KEYS, ISO_ENTER_INSET, KEYBOARD_WIDTH, KEYS, ROW_COUNT, type KeyDef } from '../data/layout'
import { isLetterKey, keyName } from '../lib/keyName'
import { Hands } from './Hands'

/** Pixel pro Tasteneinheit im SVG-Koordinatensystem. */
const UNIT = 60
const GAP = 4
const RADIUS = 6
/** Platz unter der Tastatur für die Handflächen, in Tasteneinheiten. */
const PALM_SPACE = 1
/** Farbwechsel beim Drücken; bei reduzierter Bewegung sofort. */
const TRANSITION = 'transition-[fill,stroke-width] duration-100 motion-reduce:transition-none'

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

interface KeyCapProps {
  keyDef: KeyDef
  pressed: boolean
  active: boolean
  /** Als Nächstes zu drückende Taste (im Trainer). */
  guided: boolean
  onPress: (code: string) => void
  onRelease: (code: string) => void
}

function KeyCap({ keyDef, pressed, active, guided, onPress, onRelease }: KeyCapProps) {
  const finger = FINGERS[keyDef.finger]
  const x = keyDef.x * UNIT + GAP / 2
  const y = keyDef.row * UNIT + GAP / 2
  const w = keyDef.width * UNIT - GAP
  const h = UNIT - GAP
  const { char, shiftChar, label } = keyDef

  let text
  if (label !== undefined) {
    text = (
      <text x={x + 10} y={y + h / 2} dominantBaseline="central" className={pressed ? 'fill-white text-[15px]' : 'fill-slate-600 text-[15px]'}>
        {label}
      </text>
    )
  } else if (isLetterKey(keyDef)) {
    text = (
      <text x={x + w / 2} y={y + h / 2} textAnchor="middle" dominantBaseline="central" className={`text-[22px] font-semibold ${pressed ? 'fill-white' : 'fill-slate-900'}`}>
        {shiftChar}
      </text>
    )
  } else {
    // Zeichen-Tasten: Shift-Belegung oben, Grundbelegung unten – wie auf der echten Tastatur.
    text = (
      <g className={`text-[17px] ${pressed ? 'fill-white' : 'fill-slate-900'}`}>
        <text x={x + 12} y={y + 17} dominantBaseline="central" className={pressed ? 'fill-white/80' : 'fill-slate-500'}>{shiftChar}</text>
        <text x={x + 12} y={y + h - 16} dominantBaseline="central">{char}</text>
      </g>
    )
  }

  return (
    <g
      data-code={keyDef.code}
      data-finger={keyDef.finger}
      data-home={homeCodes.has(keyDef.code) || undefined}
      data-pressed={pressed || undefined}
      data-active={active || undefined}
      data-guide={guided || undefined}
      className="cursor-pointer"
      onPointerDown={(e) => {
        // Pointer festhalten, damit das Loslassen auch außerhalb der Taste ankommt.
        e.currentTarget.setPointerCapture?.(e.pointerId)
        onPress(keyDef.code)
      }}
      onPointerUp={() => onRelease(keyDef.code)}
      onPointerCancel={() => onRelease(keyDef.code)}
    >
      <title>{`${keyName(keyDef)}: ${finger.name}`}</title>
      {keyDef.shape === 'iso-enter' ? (
        <path d={isoEnterPath(keyDef)} fill={pressed ? finger.stroke : finger.fill} stroke={finger.stroke} strokeWidth={active ? 4 : 1.5} strokeLinejoin="round" className={TRANSITION} />
      ) : (
        <rect x={x} y={y} width={w} height={h} rx={RADIUS} fill={pressed ? finger.stroke : finger.fill} stroke={finger.stroke} strokeWidth={active ? 4 : 1.5} className={TRANSITION} />
      )}
      {guided && (
        // Gestrichelter Rahmen innerhalb der Taste; pulsiert nur ohne reduzierte Bewegung.
        <rect
          x={x + 3}
          y={y + 3}
          width={w - 6}
          height={(keyDef.shape === 'iso-enter' ? 2 * UNIT : UNIT) - GAP - 6}
          rx={RADIUS - 2}
          fill="none"
          stroke="#0f172a"
          strokeWidth={2.5}
          strokeDasharray="6 4"
          className="animate-pulse motion-reduce:animate-none"
        />
      )}
      {text}
      {BUMP_CODES.has(keyDef.code) && (
        <line x1={x + w / 2 - 8} x2={x + w / 2 + 8} y1={y + h - 9} y2={y + h - 9} stroke={pressed ? '#fff' : '#0f172a'} strokeWidth={2} strokeLinecap="round" />
      )}
    </g>
  )
}

interface KeyboardProps {
  pressed: ReadonlySet<string>
  /** Zuletzt gedrückte Taste, wird umrandet. */
  activeCode: string | null
  /** Tasten für das nächste Zeichen im Trainer; die Hände heben dann deren Finger hervor. */
  guide?: string[]
  onPress: (code: string) => void
  onRelease: (code: string) => void
}

/** Deutsche ISO-QWERTZ-Tastatur, Tasten nach Fingerzone eingefärbt, mit Händen darüber. */
export function Keyboard({ pressed, activeCode, guide, onPress, onRelease }: KeyboardProps) {
  return (
    <svg
      viewBox={`0 0 ${KEYBOARD_WIDTH * UNIT} ${(ROW_COUNT + PALM_SPACE) * UNIT}`}
      className="h-auto w-full touch-none select-none"
      role="img"
      aria-label="Deutsche QWERTZ-Tastatur, Tasten nach Fingern eingefärbt"
    >
      {KEYS.map((key) => (
        <KeyCap
          key={key.code}
          keyDef={key}
          pressed={pressed.has(key.code)}
          active={key.code === activeCode}
          guided={guide?.includes(key.code) ?? false}
          onPress={onPress}
          onRelease={onRelease}
        />
      ))}
      <Hands pressed={pressed} activeCode={activeCode} guide={guide} unit={UNIT} />
    </svg>
  )
}
