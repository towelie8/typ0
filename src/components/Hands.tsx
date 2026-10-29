import { animate, motion, useMotionValue, useReducedMotion, useTransform, type MotionValue } from 'motion/react'
import { useEffect, useRef } from 'react'
import { FINGERS } from '../data/fingers'
import { keyByCode } from '../data/layout'
import {
  DIGITS, arcPoint, bezier, digitForKey, digitTargets, fingerOf, handOf, handShift, homeTip, knuckle, targetTip,
  type Digit, type Hand, type Point,
} from '../lib/hands'

/** Fingerdicke in Tasteneinheiten. */
const WIDTH: Record<string, number> = { pinky: 0.4, ring: 0.44, middle: 0.46, index: 0.46, thumb: 0.5 }
/** Dauer von Hin- und Rückweg in Sekunden. */
const REACH = 0.14
const RETURN = 0.18
/** Vergrößerung der Kuppe auf halber Strecke: in der Draufsicht wirkt der Finger angehoben. */
const LIFT = 0.3

interface DigitShapeProps {
  digit: Digit
  /** Gehaltene Taste dieses Fingers. */
  target: string | null
  highlighted: boolean
  reduce: boolean
  shiftX: MotionValue<number>
  shiftY: MotionValue<number>
  unit: number
}

function DigitShape({ digit, target, highlighted, reduce, shiftX, shiftY, unit }: DigitShapeProps) {
  const home = homeTip(digit)
  const base = knuckle(digit)
  const width = WIDTH[digit.slice(2)] * unit
  const finger = FINGERS[fingerOf(digit)]

  // Fortschritt auf der aktuellen Kurve; die Kurve selbst steht in `path`.
  const progress = useMotionValue(1)
  const path = useRef({ from: home, control: home, to: home })
  const tipX = useTransform(progress, (t) => bezier(path.current.from, path.current.control, path.current.to, t).x * unit)
  const tipY = useTransform(progress, (t) => bezier(path.current.from, path.current.control, path.current.to, t).y * unit)
  const radius = useTransform(progress, (t) => (width / 2) * (1 + LIFT * Math.sin(Math.PI * t)))
  const knuckleX = useTransform(shiftX, (v) => (base.x + v) * unit)
  const knuckleY = useTransform(shiftY, (v) => (base.y + v) * unit)

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

  // Der aktive Finger hat die Farbe der gedrückten Taste; der weiße Rand hebt ihn davon ab.
  const color = highlighted ? finger.stroke : finger.fill
  const outline = highlighted ? '#fff' : finger.stroke
  return (
    <g data-digit={digit} data-highlight={highlighted || undefined}>
      <motion.line x1={knuckleX} y1={knuckleY} x2={tipX} y2={tipY} stroke={outline} strokeWidth={width + 4} strokeLinecap="round" />
      <motion.line x1={knuckleX} y1={knuckleY} x2={tipX} y2={tipY} stroke={color} strokeWidth={width} strokeLinecap="round" />
      <motion.circle data-tip cx={tipX} cy={tipY} r={radius} fill={color} stroke={outline} strokeWidth={2} />
    </g>
  )
}

/** Handfläche als abgerundetes Rechteck unter den Knöcheln. */
function palmRect(hand: Hand) {
  const digits = DIGITS.filter((d) => handOf(d) === hand && !d.endsWith('thumb'))
  const xs = digits.map((d) => knuckle(d).x)
  const top = Math.min(...digits.map((d) => knuckle(d).y)) - 0.15
  const left = Math.min(...xs) - 0.4
  const right = Math.max(...xs) + 0.4
  return { x: left, y: top, width: right - left, height: 1.9 }
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

  const palm = palmRect(hand)
  const palmX = useTransform(shiftX, (v) => v * unit)
  const palmY = useTransform(shiftY, (v) => v * unit)

  return (
    <g data-hand={hand}>
      <motion.rect
        x={palm.x * unit}
        y={palm.y * unit}
        width={palm.width * unit}
        height={palm.height * unit}
        rx={0.6 * unit}
        style={{ x: palmX, y: palmY }}
        className="fill-white/60 stroke-slate-400"
        strokeWidth={1.5}
      />
      {DIGITS.filter((d) => handOf(d) === hand).map((d) => (
        <DigitShape
          key={d}
          digit={d}
          target={targets[d] ?? null}
          highlighted={highlight.has(d)}
          reduce={reduce}
          shiftX={shiftX}
          shiftY={shiftY}
          unit={unit}
        />
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
  const highlight = new Set(codes.flatMap((code) => {
    const key = keyByCode(code)
    return key ? [digitForKey(key)] : []
  }))

  return (
    <g className="pointer-events-none" opacity={0.85} aria-hidden>
      <HandShape hand="left" targets={targets} highlight={highlight} reduce={reduce} unit={unit} />
      <HandShape hand="right" targets={targets} highlight={highlight} reduce={reduce} unit={unit} />
    </g>
  )
}
