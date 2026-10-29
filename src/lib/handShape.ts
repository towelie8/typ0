/**
 * Umrisse der illustrierten Hände (Draufsicht auf den Handrücken). Alles als SVG-Pfad-Strings,
 * weil sich Länge und Richtung der Finger bei jeder Animationsphase ändern.
 */
import { DIGITS, handOf, knuckle, type Hand, type Point } from './hands'

const f = (n: number) => Math.round(n * 100) / 100
const pt = (p: Point) => `${f(p.x)},${f(p.y)}`

export interface FingerShape {
  /** Umriss des Fingers, der Ansatz liegt unter der Handfläche. */
  body: string
  nail: string
  /** Gelenkfalten quer zum Finger. */
  creases: string
  /** Glanzlicht entlang des Fingers, damit er rund wirkt. */
  shine: string
}

/**
 * Finger vom Knöchel `base` zur Kuppe `tip` (Mitte der Fingerbeere) in Pixeln. `joints` sind die
 * Gelenkfalten als Anteil der Länge.
 */
export function fingerShape(base: Point, tip: Point, width: number, joints: number[]): FingerShape {
  const dx = tip.x - base.x
  const dy = tip.y - base.y
  const length = Math.hypot(dx, dy)
  // Richtung entlang des Fingers (u) und quer dazu (n); ohne Länge zeigt er nach oben.
  const u = length > 0 ? { x: dx / length, y: dy / length } : { x: 0, y: -1 }
  const n = { x: -u.y, y: u.x }
  const at = (along: number, across: number): Point => ({
    x: base.x + u.x * along + n.x * across,
    y: base.y + u.y * along + n.y * across,
  })
  const w = width / 2
  const root = -0.6 * width
  const baseHalf = w * 1.12
  const round = 0.55 * width

  const body = [
    `M${pt(at(root, -baseHalf))}`,
    `L${pt(at(length, -w))}`,
    `C${pt(at(length + round, -w))} ${pt(at(length + round, w))} ${pt(at(length, w))}`,
    `L${pt(at(root, baseHalf))}`,
    'Z',
  ].join(' ')

  const nailBack = length - 0.25 * width
  const nailFront = length + 0.12 * width
  const nailHalf = 0.3 * width
  const nail = [
    `M${pt(at(nailBack, -nailHalf))}`,
    `L${pt(at(nailFront, -nailHalf))}`,
    `C${pt(at(nailFront + 0.3 * width, -nailHalf))} ${pt(at(nailFront + 0.3 * width, nailHalf))} ${pt(at(nailFront, nailHalf))}`,
    `L${pt(at(nailBack, nailHalf))}`,
    `C${pt(at(nailBack - 0.08 * width, nailHalf))} ${pt(at(nailBack - 0.08 * width, -nailHalf))} ${pt(at(nailBack, -nailHalf))}`,
    'Z',
  ].join(' ')

  const creases = joints
    .map((j) => {
      const along = j * length
      return `M${pt(at(along, -0.36 * width))} Q${pt(at(along + 0.08 * width, 0))} ${pt(at(along, 0.36 * width))}`
    })
    .join(' ')

  const shine = `M${pt(at(0.12 * length, -0.16 * width))} L${pt(at(Math.max(0.12 * length, length - 0.35 * width), -0.16 * width))}`

  return { body, nail, creases, shine }
}

/** Unterer Rand des Handgelenks; liegt unterhalb des sichtbaren Bereichs, die Hand läuft aus dem Bild. */
const WRIST_Y = 7.5

/**
 * Stützpunkte des Handrückens in Tasteneinheiten: oben knapp über den Knöcheln, innen mit
 * Daumenansatz, unten breit auslaufend zum Handgelenk.
 */
export function palmOutline(hand: Hand): Point[] {
  const digits = DIGITS.filter((d) => handOf(d) === hand)
  const [pinky, ring, middle, index] = (hand === 'left' ? digits.slice(0, 4) : digits.slice(1).reverse()).map(knuckle)
  const thumb = knuckle(hand === 'left' ? 'l-thumb' : 'r-thumb')
  // +1 zeigt zur Daumenseite der Hand.
  const inward = index.x > pinky.x ? 1 : -1
  const p = (x: number, y: number): Point => ({ x, y })
  return [
    p(pinky.x - inward * 0.32, pinky.y + 0.25),
    p(pinky.x, pinky.y - 0.16),
    p(ring.x, ring.y - 0.18),
    p(middle.x, middle.y - 0.18),
    p(index.x, index.y - 0.16),
    p(index.x + inward * 0.3, index.y + 0.2),
    p(index.x + inward * 0.4, index.y + 0.85),
    p(thumb.x + inward * 0.2, thumb.y + 0.55),
    p(thumb.x - inward * 0.4, WRIST_Y),
    p(pinky.x + inward * 0.7, WRIST_Y),
    p(pinky.x - inward * 0.36, pinky.y + 1.2),
  ]
}

/** Geschlossene, glatte Kurve durch alle Punkte (Catmull-Rom als kubische Bézierkurven), skaliert. */
export function smoothClosedPath(points: Point[], scale: number): string {
  const s = (p: Point) => ({ x: p.x * scale, y: p.y * scale })
  const ps = points.map(s)
  const at = (i: number) => ps[(i + ps.length) % ps.length]
  const parts = [`M${pt(ps[0])}`]
  for (let i = 0; i < ps.length; i++) {
    const [p0, p1, p2, p3] = [at(i - 1), at(i), at(i + 1), at(i + 2)]
    const c1 = { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 }
    const c2 = { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 }
    parts.push(`C${pt(c1)} ${pt(c2)} ${pt(p2)}`)
  }
  return parts.join(' ') + ' Z'
}
