/**
 * Geometrie der SVG-Hände, in Tasteneinheiten wie `layout.ts`.
 *
 * Jeder Finger ist ein Strich vom Knöchel (fest auf der Handfläche) zur Kuppe. In Ruhe liegt
 * die Kuppe auf der Grundtaste; beim Drücken wandert sie zur Zieltaste, der Finger wird dabei
 * länger oder kürzer.
 */
import { HOME_KEYS, KEYBOARD_WIDTH, keyByCode, type Finger, type KeyDef } from '../data/layout'

/** Finger beider Hände; `thumb` aus dem Layout wird nach Seite aufgeteilt. */
export type Digit =
  | 'l-pinky'
  | 'l-ring'
  | 'l-middle'
  | 'l-index'
  | 'l-thumb'
  | 'r-thumb'
  | 'r-index'
  | 'r-middle'
  | 'r-ring'
  | 'r-pinky'

export type Hand = 'left' | 'right'

export interface Point {
  x: number
  y: number
}

export const DIGITS: Digit[] = [
  'l-pinky', 'l-ring', 'l-middle', 'l-index', 'l-thumb', 'r-thumb', 'r-index', 'r-middle', 'r-ring', 'r-pinky',
]

export function handOf(digit: Digit): Hand {
  return digit.startsWith('l-') ? 'left' : 'right'
}

/** Fingerzone im Layout (für Farben und Namen). */
export function fingerOf(digit: Digit): Finger {
  return digit.endsWith('thumb') ? 'thumb' : (digit as Finger)
}

/** Die Leertaste drückt der rechte Daumen, Alt/Win der Daumen auf ihrer Seite. */
export function digitForKey(key: KeyDef): Digit {
  if (key.finger !== 'thumb') return key.finger
  if (key.code === 'Space') return 'r-thumb'
  return key.x + key.width / 2 < KEYBOARD_WIDTH / 2 ? 'l-thumb' : 'r-thumb'
}

/** Höhe der Kuppe innerhalb der Taste: im unteren Teil, die Beschriftung bleibt frei. */
const TIP_Y = 0.8

/** Zielpunkt der Fingerkuppe auf einer Taste (bei ISO-Enter im oberen Teil). */
export function keyTip(key: KeyDef): Point {
  return { x: key.x + key.width / 2, y: key.row + TIP_Y }
}

/** Abstand des rechten Daumens zur Mitte der J-Taste; der linke liegt gespiegelt neben F. */
const THUMB_OFFSET = 0.6

export function homeTip(digit: Digit): Point {
  if (digit === 'l-thumb' || digit === 'r-thumb') {
    const space = keyByCode('Space')!
    const index = homeTip(digit === 'l-thumb' ? 'l-index' : 'r-index')
    return { x: index.x + (digit === 'l-thumb' ? THUMB_OFFSET : -THUMB_OFFSET), y: space.row + TIP_Y }
  }
  return keyTip(keyByCode(HOME_KEYS[digit])!)
}

/**
 * Knöchel relativ zur Kuppe in Grundstellung, für die linke Hand. `dx` zeigt zur Handmitte,
 * damit die Finger leicht gefächert sind; die rechte Hand ist gespiegelt.
 */
const KNUCKLE: Record<string, { dx: number; dy: number }> = {
  pinky: { dx: 0.3, dy: 1.35 },
  ring: { dx: 0.12, dy: 1.65 },
  middle: { dx: 0, dy: 1.8 },
  index: { dx: -0.12, dy: 1.65 },
  thumb: { dx: -0.85, dy: 0.95 },
}

export function knuckle(digit: Digit): Point {
  const tip = homeTip(digit)
  const { dx, dy } = KNUCKLE[digit.slice(2)]
  return { x: tip.x + (handOf(digit) === 'left' ? dx : -dx), y: tip.y + dy }
}

/** Wohin die Kuppe zeigt: die gehaltene Taste oder die Grundstellung. */
export function targetTip(digit: Digit, code: string | null): Point {
  const key = code ? keyByCode(code) : undefined
  // Der Daumen drückt die Leertaste dort, wo er liegt.
  if (!key || (digit === 'r-thumb' && key.code === 'Space')) return homeTip(digit)
  return keyTip(key)
}

/** Wölbung des Bogens relativ zur Strecke. */
const ARC_BULGE = 0.3

/**
 * Stützpunkt des Bogens zwischen zwei Kuppenpositionen (quadratische Bézierkurve):
 * seitlich der Mitte, immer nach oben gewölbt, als würde der Finger kurz angehoben.
 */
export function arcPoint(from: Point, to: Point): Point {
  const dx = to.x - from.x
  const dy = to.y - from.y
  const mid = { x: from.x + dx / 2, y: from.y + dy / 2 }
  if (dx === 0 && dy === 0) return mid
  // Normale der Strecke; zeigt sie nach unten, umdrehen.
  let nx = dy
  let ny = -dx
  if (ny > 0 || (ny === 0 && nx > 0)) {
    nx = -nx
    ny = -ny
  }
  return { x: mid.x + nx * ARC_BULGE, y: mid.y + ny * ARC_BULGE }
}

/** Punkt auf der quadratischen Bézierkurve from → control → to bei t ∈ [0, 1]. */
export function bezier(from: Point, control: Point, to: Point, t: number): Point {
  const u = 1 - t
  return {
    x: u * u * from.x + 2 * u * t * control.x + t * t * to.x,
    y: u * u * from.y + 2 * u * t * control.y + t * t * to.y,
  }
}

/** Gehaltene Tasten je Finger; drückt ein Finger mehrere, gilt die zuletzt gedrückte. */
export function digitTargets(pressed: Iterable<string>): Partial<Record<Digit, string>> {
  const targets: Partial<Record<Digit, string>> = {}
  for (const code of pressed) {
    const key = keyByCode(code)
    if (key) targets[digitForKey(key)] = code
  }
  return targets
}

/** Anteil der Strecke, um den die Hand bei Griffen in die Zahlenreihe mitrückt. */
const HAND_FOLLOW = 0.3

/** Verschiebung der ganzen Hand, damit Finger für die Zahlenreihe nicht unnatürlich lang werden. */
export function handShift(hand: Hand, targets: Partial<Record<Digit, string>>): Point {
  for (const digit of DIGITS) {
    const code = targets[digit]
    if (handOf(digit) !== hand || !code || keyByCode(code)?.row !== 0) continue
    const home = homeTip(digit)
    const tip = targetTip(digit, code)
    return { x: (tip.x - home.x) * HAND_FOLLOW, y: (tip.y - home.y) * HAND_FOLLOW }
  }
  return { x: 0, y: 0 }
}
