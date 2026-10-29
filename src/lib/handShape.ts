/** Umriss der Handfläche (Draufsicht auf den Handrücken) als glatte SVG-Kurve. */
import { DIGITS, handOf, knuckle, type Hand, type Point } from './hands'

const f = (n: number) => Math.round(n * 100) / 100
const pt = (p: Point) => `${f(p.x)},${f(p.y)}`

/** Unterer Rand des Handgelenks; liegt unterhalb des sichtbaren Bereichs, die Hand läuft aus dem Bild. */
const WRIST_Y = 9.5

/**
 * Stützpunkte des Handrückens in Tasteneinheiten: oben knapp über den Knöcheln, Seiten fast
 * senkrecht, innen der Daumenansatz, unten schmaler werdend zum Handgelenk.
 */
export function palmOutline(hand: Hand): Point[] {
  const digits = DIGITS.filter((d) => handOf(d) === hand)
  const [pinky, ring, middle, index] = (hand === 'left' ? digits.slice(0, 4) : digits.slice(1).reverse()).map(knuckle)
  const thumb = knuckle(hand === 'left' ? 'l-thumb' : 'r-thumb')
  // +1 zeigt zur Daumenseite der Hand.
  const inward = index.x > pinky.x ? 1 : -1
  const p = (x: number, y: number): Point => ({ x, y })
  return [
    p(pinky.x - inward * 0.24, pinky.y + 0.15),
    p(pinky.x, pinky.y - 0.16),
    p(ring.x, ring.y - 0.18),
    p(middle.x, middle.y - 0.18),
    p(index.x, index.y - 0.16),
    p(index.x + inward * 0.24, index.y + 0.15),
    p(index.x + inward * 0.26, index.y + 0.7),
    p(thumb.x + inward * 0.3, thumb.y + 0.3),
    p(thumb.x + inward * 0.05, WRIST_Y),
    p(pinky.x + inward * 0.35, WRIST_Y),
    p(pinky.x - inward * 0.22, pinky.y + 1.3),
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
