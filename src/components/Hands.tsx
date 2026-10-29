import { animate, motion, useMotionValue, useReducedMotion, useTransform, type MotionValue } from 'motion/react'
import { useEffect, useId, useRef } from 'react'
import { FINGERS } from '../data/fingers'
import { keyByCode } from '../data/layout'
import {
  arcPoint, bezier, digitForKey, digitTargets, fingerOf, handShift, homeTip, knuckle, targetTip,
  type Digit, type Hand, type Point,
} from '../lib/hands'
import { palmOutline, smoothClosedPath } from '../lib/handShape'

/**
 * Hände als schlichtes Piktogramm: eine Silhouette mit dunklem Umriss, Finger als abgerundete
 * Streifen. Das Innere ist halbtransparent, damit die Tasten darunter lesbar bleiben.
 */

/** Fingerbreite in Tasteneinheiten. */
const WIDTH: Record<string, number> = { pinky: 0.4, ring: 0.44, middle: 0.46, index: 0.46, thumb: 0.5 }
/** Wie weit der Finger unter die Handfläche reicht, damit kein Spalt entsteht. */
const ROOT_DEPTH = 0.35
/** Dauer von Hin- und Rückweg in Sekunden. */
const REACH = 0.14
const RETURN = 0.18
/** Breite des Umrisses in Pixeln. */
const OUTLINE = 4
const OUTLINE_COLOR = '#1e293b'
/** Deckkraft des Inneren (weiß, aktiver Finger in Zonenfarbe). */
const FILL_OPACITY = 0.7

interface FingerMotion {
  digit: Digit
  width: number
  tipX: MotionValue<number>
  tipY: MotionValue<number>
  rootX: MotionValue<number>
  rootY: MotionValue<number>
}

/** Bewegt die Fingerkuppe im Bogen zur gehaltenen Taste und zurück. */
function useFinger(
  digit: Digit,
  target: string | null,
  reduce: boolean,
  shiftX: MotionValue<number>,
  shiftY: MotionValue<number>,
  unit: number,
): FingerMotion {
  const home = homeTip(digit)
  const base = knuckle(digit)
  // Ansatz in Verlängerung des Fingers unter der Handfläche.
  // Der Daumen liegt auf der Handfläche und beginnt am Knöchel.
  const depth = digit.endsWith('thumb') ? 0 : ROOT_DEPTH
  const length = Math.hypot(base.x - home.x, base.y - home.y)
  const root = {
    x: base.x + ((base.x - home.x) / length) * depth,
    y: base.y + ((base.y - home.y) / length) * depth,
  }

  // Fortschritt auf der aktuellen Kurve; die Kurve selbst steht in `path`.
  const progress = useMotionValue(1)
  const path = useRef({ from: home, control: home, to: home })
  const tipX = useTransform(progress, (t) => bezier(path.current.from, path.current.control, path.current.to, t).x * unit)
  const tipY = useTransform(progress, (t) => bezier(path.current.from, path.current.control, path.current.to, t).y * unit)
  const rootX = useTransform(shiftX, (v) => (root.x + v) * unit)
  const rootY = useTransform(shiftY, (v) => (root.y + v) * unit)

  useEffect(() => {
    const to = reduce ? home : targetTip(digit, target)
    // Start ist die aktuelle Position, damit eine unterbrochene Bewegung weich umlenkt.
    const from: Point = { x: tipX.get() / unit, y: tipY.get() / unit }
    path.current = { from, control: reduce ? to : arcPoint(from, to), to }
    progress.jump(0)
    if (reduce) {
      progress.jump(1)
      return
    }
    const controls = animate(progress, 1, { duration: target ? REACH : RETURN, ease: 'easeOut' })
    return () => controls.stop()
    // home ist je Finger konstant.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [digit, target, reduce, unit])

  return { digit, width: WIDTH[digit.slice(2)] * unit, tipX, tipY, rootX, rootY }
}

interface SilhouetteProps {
  fingers: FingerMotion[]
  palm: string
  palmX: MotionValue<number>
  palmY: MotionValue<number>
  color: string
  /** Abweichende Farbe einzelner Finger (Hervorhebung). */
  fingerColor?: (digit: Digit) => string | undefined
  /** Verbreiterung in Pixeln je Seite (für den Umriss). */
  grow: number
}

/**
 * Handfläche und Finger in einer Farbe. Die Handfläche verdeckt die Ansätze der vier Finger;
 * der Daumen liegt darüber, wie bei einer echten Hand.
 */
function Silhouette({ fingers, palm, palmX, palmY, color, fingerColor, grow }: SilhouetteProps) {
  const line = (f: FingerMotion) => (
    <motion.line
      key={f.digit}
      x1={f.rootX}
      y1={f.rootY}
      x2={f.tipX}
      y2={f.tipY}
      stroke={fingerColor?.(f.digit) ?? color}
      strokeWidth={f.width + grow * 2}
      strokeLinecap="round"
    />
  )
  return (
    <>
      {fingers.filter((f) => !f.digit.endsWith('thumb')).map(line)}
      <motion.path d={palm} style={{ x: palmX, y: palmY }} fill={color} stroke={color} strokeWidth={grow * 2} strokeLinejoin="round" />
      {fingers.filter((f) => f.digit.endsWith('thumb')).map(line)}
    </>
  )
}

interface HandShapeProps {
  hand: Hand
  targets: Partial<Record<Digit, string>>
  highlight: ReadonlySet<Digit>
  reduce: boolean
  unit: number
}

function HandShape({ hand, targets, highlight, reduce, unit }: HandShapeProps) {
  const shiftX = useMotionValue(0)
  const shiftY = useMotionValue(0)
  const shift = reduce ? { x: 0, y: 0 } : handShift(hand, targets)

  useEffect(() => {
    const options = { duration: REACH, ease: 'easeOut' } as const
    const controls = [animate(shiftX, shift.x, options), animate(shiftY, shift.y, options)]
    return () => controls.forEach((c) => c.stop())
  }, [shift.x, shift.y, shiftX, shiftY])

  const side = hand === 'left' ? 'l' : 'r'
  const digit = (kind: string) => `${side}-${kind}` as Digit
  const finger = (kind: string) => useFinger(digit(kind), targets[digit(kind)] ?? null, reduce, shiftX, shiftY, unit)
  // Feste Reihenfolge und Anzahl, damit die Hooks bei jedem Rendern gleich aufgerufen werden.
  const fingers = [finger('pinky'), finger('ring'), finger('middle'), finger('index'), finger('thumb')]

  const palm = smoothClosedPath(palmOutline(hand), unit)
  const palmX = useTransform(shiftX, (v) => v * unit)
  const palmY = useTransform(shiftY, (v) => v * unit)
  const maskId = useId()
  const area = { x: -unit, y: -unit, width: 20 * unit, height: 12 * unit }
  const silhouette = { fingers, palm, palmX, palmY }

  return (
    <g data-hand={hand}>
      {/* Die Maske schneidet das Innere aus dem Umriss, sodass nur der Rand übrig bleibt. */}
      <mask id={maskId} maskUnits="userSpaceOnUse" {...area}>
        <rect {...area} fill="white" />
        <Silhouette {...silhouette} color="black" grow={0} />
      </mask>
      <g mask={`url(#${maskId})`}>
        <Silhouette {...silhouette} color={OUTLINE_COLOR} grow={OUTLINE} />
      </g>
      <g opacity={FILL_OPACITY}>
        <Silhouette
          {...silhouette}
          color="white"
          fingerColor={(d) => (highlight.has(d) ? FINGERS[fingerOf(d)].stroke : undefined)}
          grow={0}
        />
      </g>
      {fingers.map((f) => (
        <g key={f.digit} data-digit={f.digit} data-highlight={highlight.has(f.digit) || undefined}>
          {/* Unsichtbare Fingerbeere: markiert die Stelle, die die Taste trifft (für Tests). */}
          <motion.circle data-tip cx={f.tipX} cy={f.tipY} r={f.width / 2} fill="none" />
        </g>
      ))}
    </g>
  )
}

interface HandsProps {
  pressed: ReadonlySet<string>
  activeCode: string | null
  /** Tasten des nächsten Zeichens im Trainer; deren Finger werden statt des zuletzt benutzten hervorgehoben. */
  guide?: string[]
  /** Pixel pro Tasteneinheit im SVG der Tastatur. */
  unit: number
}

/** Beide Hände als Ebene über der Tastatur; Klicks gehen an die Tasten darunter. */
export function Hands({ pressed, activeCode, guide, unit }: HandsProps) {
  const reduce = useReducedMotion() ?? false
  const targets = digitTargets(pressed)
  const codes = guide ?? (activeCode ? [activeCode] : [])
  const highlight = new Set(
    codes.flatMap((code) => {
      const key = keyByCode(code)
      return key ? [digitForKey(key)] : []
    }),
  )

  return (
    <g className="pointer-events-none" aria-hidden>
      <HandShape hand="left" targets={targets} highlight={highlight} reduce={reduce} unit={unit} />
      <HandShape hand="right" targets={targets} highlight={highlight} reduce={reduce} unit={unit} />
    </g>
  )
}
