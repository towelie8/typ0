import { animate, motion, useMotionValue, useReducedMotion, useTransform, type MotionValue } from 'motion/react'
import { useEffect, useRef } from 'react'
import { FINGERS } from '../data/fingers'
import { keyByCode } from '../data/layout'
import {
  DIGITS, arcPoint, bezier, digitForKey, digitTargets, fingerOf, handOf, handShift, homeTip, knuckle, targetTip,
  type Digit, type Hand, type Point,
} from '../lib/hands'
import { fingerShape, palmOutline, smoothClosedPath } from '../lib/handShape'

/** Fingerdicke in Tasteneinheiten. */
const WIDTH: Record<string, number> = { pinky: 0.38, ring: 0.43, middle: 0.46, index: 0.45, thumb: 0.52 }
/** Gelenkfalten als Anteil der Länge; vom Daumen ist nur das Endglied sichtbar. */
const JOINTS: Record<string, number[]> = { pinky: [0.4, 0.72], ring: [0.42, 0.72], middle: [0.42, 0.72], index: [0.42, 0.72], thumb: [0.7] }
/** Dauer von Hin- und Rückweg in Sekunden. */
const REACH = 0.14
const RETURN = 0.18
/** Verbreiterung des Fingers auf halber Strecke: in der Draufsicht wirkt er angehoben. */
const LIFT = 0.12

/** Hauttöne der Illustration. */
const SKIN = '#f3d2b8'
const SKIN_LINE = '#b47c5c'
const CREASE = '#c58e70'
const NAIL = '#fbebe3'
const NAIL_LINE = '#d6a189'

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
  const kind = digit.slice(2)
  const width = WIDTH[kind] * unit
  const finger = FINGERS[fingerOf(digit)]

  // Fortschritt auf der aktuellen Kurve; die Kurve selbst steht in `path`.
  const progress = useMotionValue(1)
  const path = useRef({ from: home, control: home, to: home })
  const tipX = useTransform(progress, (t) => bezier(path.current.from, path.current.control, path.current.to, t).x * unit)
  const tipY = useTransform(progress, (t) => bezier(path.current.from, path.current.control, path.current.to, t).y * unit)
  const knuckleX = useTransform(shiftX, (v) => (base.x + v) * unit)
  const knuckleY = useTransform(shiftY, (v) => (base.y + v) * unit)
  const shape = useTransform([knuckleX, knuckleY, tipX, tipY, progress], ([kx, ky, tx, ty, t]: number[]) =>
    fingerShape({ x: kx, y: ky }, { x: tx, y: ty }, width * (1 + LIFT * Math.sin(Math.PI * t)), JOINTS[kind]),
  )
  const body = useTransform(shape, (s) => s.body)
  const nail = useTransform(shape, (s) => s.nail)
  const creases = useTransform(shape, (s) => s.creases)
  const shine = useTransform(shape, (s) => s.shine)

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

  return (
    <g data-digit={digit} data-highlight={highlighted || undefined}>
      {/* Leuchtrand in der Zonenfarbe für den aktiven Finger. */}
      {highlighted && <motion.path d={body} fill="none" stroke={finger.stroke} strokeWidth={9} strokeOpacity={0.45} strokeLinejoin="round" />}
      <motion.path d={body} fill={SKIN} stroke={SKIN_LINE} strokeWidth={1.5} strokeLinejoin="round" />
      {/* Tönung in der Zonenfarbe, die Haut bleibt darunter erkennbar. */}
      {highlighted && (
        <motion.path d={body} fill={finger.stroke} fillOpacity={0.5} stroke={finger.stroke} strokeWidth={2.5} strokeLinejoin="round" />
      )}
      <motion.path d={shine} stroke="#fff" strokeOpacity={0.45} strokeWidth={width * 0.22} strokeLinecap="round" />
      <motion.path d={creases} fill="none" stroke={CREASE} strokeWidth={1.4} strokeLinecap="round" />
      <motion.path d={nail} fill={NAIL} stroke={NAIL_LINE} strokeWidth={1.2} />
      {/* Unsichtbare Fingerbeere: markiert die Stelle, die die Taste trifft (für Tests). */}
      <motion.circle data-tip cx={tipX} cy={tipY} r={width / 2} fill="none" />
    </g>
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

  const palm = smoothClosedPath(palmOutline(hand), unit)
  const palmX = useTransform(shiftX, (v) => v * unit)
  const palmY = useTransform(shiftY, (v) => v * unit)
  const bumps = DIGITS.filter((d) => handOf(d) === hand && !d.endsWith('thumb')).map((d) => {
    const k = knuckle(d)
    const r = WIDTH[d.slice(2)] / 2
    return `M${(k.x - r) * unit},${(k.y + 0.02) * unit} Q${k.x * unit},${(k.y - 0.14) * unit} ${(k.x + r) * unit},${(k.y + 0.02) * unit}`
  })

  // Finger zuerst, die Handfläche darüber verdeckt ihre Ansätze; die Gruppe ist als Ganzes transparent.
  return (
    <g data-hand={hand}>
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
      <motion.g style={{ x: palmX, y: palmY }}>
        <path d={palm} fill={SKIN} stroke={SKIN_LINE} strokeWidth={1.5} strokeLinejoin="round" />
        <path d={bumps.join(' ')} fill="none" stroke={CREASE} strokeWidth={1.4} strokeLinecap="round" />
      </motion.g>
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
    <g className="pointer-events-none" opacity={0.9} aria-hidden>
      <HandShape hand="left" targets={targets} highlight={highlight} reduce={reduce} unit={unit} />
      <HandShape hand="right" targets={targets} highlight={highlight} reduce={reduce} unit={unit} />
    </g>
  )
}
