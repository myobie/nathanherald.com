// Hand drawn grease pencil marks for contact sheets.
//
// The build draws every mark from a seed derived from the photo, so the
// committed HTML is stable. In the browser, redrawMarks() draws them again
// with fresh randomness, so no two visits look quite the same.
//
// Marks are drawn in a viewBox the same shape as the frame (width = 100 *
// aspect, height = 100), so nothing gets stretched.

export type MarkKind = 'circle' | 'cross' | 'check' | 'portfolio'

export interface Stroke {
  d: string
  // multiplier for the CSS stroke width, so strokes vary a little
  weight: number
}

type Rand = () => number

// mulberry32
export function seeded(seed: number): Rand {
  let s = seed >>> 0
  return () => {
    s = (s + 0x6D2B79F5) >>> 0
    let t = s
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// FNV-1a, 32 bit
export function hashSeed(value: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < value.length; i++) {
    h ^= value.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return h >>> 0
}

const fmt = (n: number) => (Math.round(n * 10) / 10).toString()
const between = (r: Rand, lo: number, hi: number) => lo + (hi - lo) * r()

function polyline(points: [number, number][]) {
  return points.map(([x, y], i) => `${i ? 'L' : 'M'}${fmt(x)} ${fmt(y)}`).join(' ')
}

// One lopsided loop, drawn in a single go: uneven radius, a slight tilt, and
// an end that usually overshoots where it started (sometimes falls short).
// Now and then the pencil goes round a second time for part of the way.
export function circleStrokes(r: Rand, aspect: number): Stroke[] {
  const w = 100 * aspect
  const h = 100
  // Keepers should stay visible, so the loop goes around the frame rather
  // than across it: a squarish superellipse that hugs the edges (instead of
  // an ellipse that cuts into the corners), a bit wider than the frame, and
  // taller still, so it runs over the film edge above and below.
  const cx = w / 2 + between(r, -0.02, 0.02) * w
  const cy = h / 2 + between(r, -0.025, 0.025) * h
  const rx = (w / 2) * between(r, 1.0, 1.07)
  const ry = (h / 2) * between(r, 1.1, 1.2)
  const squareness = between(r, 2.8, 3.6)
  const tilt = between(r, -0.05, 0.05)

  // low frequency wobble, a few harmonics, kept small so it doesn't dip into the photo
  const harmonics = [1, 2, 3].map((k) => ({
    k,
    amp: between(r, 0.008, 0.03) / k,
    phase: between(r, 0, Math.PI * 2),
  }))
  const wobble = (a: number) => harmonics.reduce((sum, { k, amp, phase }) => sum + amp * Math.sin(k * a + phase), 0)
  const superCos = (a: number) => Math.sign(Math.cos(a)) * Math.abs(Math.cos(a)) ** (2 / squareness)
  const superSin = (a: number) => Math.sign(Math.sin(a)) * Math.abs(Math.sin(a)) ** (2 / squareness)

  const loop = (start: number, sweep: number, scale: number, drift: number, dx: number, dy: number) => {
    const steps = Math.max(16, Math.round(Math.abs(sweep) / (Math.PI * 2) * 96))
    const pts: [number, number][] = []
    for (let i = 0; i <= steps; i++) {
      const t = i / steps
      const a = start + sweep * t
      // the hand drifts outward as it comes round, so the ends don't meet
      const m = scale * (1 + wobble(a) + drift * t)
      const x = superCos(a) * rx * m
      const y = superSin(a) * ry * m
      pts.push([
        cx + dx + x * Math.cos(tilt) - y * Math.sin(tilt),
        cy + dy + x * Math.sin(tilt) + y * Math.cos(tilt),
      ])
    }
    return polyline(pts)
  }

  const start = between(r, 0, Math.PI * 2)
  const deg = Math.PI / 180
  const extra = r() < 0.15 ? -between(r, 5, 18) * deg : between(r, 10, 40) * deg
  const strokes: Stroke[] = [{
    d: loop(start, Math.PI * 2 + extra, 1, between(r, 0.02, 0.07), 0, 0),
    weight: between(r, 0.9, 1.15),
  }]

  if (r() < 0.3) {
    strokes.push({
      d: loop(start + between(r, 0.5, 2.5), between(r, 60, 160) * deg, between(r, 1.02, 1.06), 0.01,
        between(r, -2, 2), between(r, -2, 2)),
      weight: between(r, 0.6, 0.85),
    })
  }

  return strokes
}

// Two quick, slightly bowed strokes of unequal length that cross off center.
// Sometimes a stroke runs past the edge of the frame, or starts with a tiny
// hook where the pencil landed.
export function crossStrokes(r: Rand, aspect: number): Stroke[] {
  const w = 100 * aspect
  const h = 100

  const stroke = (x1: number, y1: number, x2: number, y2: number): Stroke => {
    const len = Math.hypot(x2 - x1, y2 - y1)
    const bow = between(r, -0.08, 0.08) * len
    const mx = (x1 + x2) / 2 + ((y2 - y1) / len) * bow
    const my = (y1 + y2) / 2 - ((x2 - x1) / len) * bow
    const curve = `Q${fmt(mx)} ${fmt(my)} ${fmt(x2)} ${fmt(y2)}`
    let d = `M${fmt(x1)} ${fmt(y1)} ${curve}`
    if (r() < 0.35) {
      // a little hook where the pencil landed
      const hx = x1 + between(r, -1, 1) * 0.04 * w
      const hy = y1 + between(r, 0.02, 0.05) * h
      d = `M${fmt(hx)} ${fmt(hy)} L${fmt(x1)} ${fmt(y1)} ${curve}`
    }
    return { d, weight: between(r, 0.85, 1.2) }
  }

  const past = () => (r() < 0.3 ? between(r, 1.0, 1.08) : between(r, 0.8, 0.95))
  return [
    stroke(between(r, 0.06, 0.22) * w, between(r, 0.04, 0.2) * h, past() * w, between(r, 0.82, 1.02) * h),
    stroke(between(r, 0.78, 0.96) * w, between(r, 0.04, 0.22) * h, (1 - past()) * w, between(r, 0.8, 1.0) * h),
  ]
}

// A quick tick in the bottom right corner, for a good frame. Kept small and
// in the corner so it covers as little of the photo as possible.
export function checkStrokes(r: Rand, aspect: number): Stroke[] {
  const w = 100 * aspect
  const h = 100
  const size = between(r, 26, 34)
  // the bottom of the tick sits near the corner, spilling onto the film edge
  const bx = w - size * between(r, 0.7, 0.85)
  const by = h - between(r, -2, 6)
  const sx = bx - size * between(r, 0.32, 0.45)
  const sy = by - size * between(r, 0.3, 0.42)
  const ex = bx + size * between(r, 0.5, 0.7)
  const ey = by - size * between(r, 0.95, 1.15)
  const bow = between(r, -4, 3)
  const d = `M${fmt(sx)} ${fmt(sy)} Q${fmt((sx + bx) / 2 - 1)} ${fmt((sy + by) / 2 + 1)} ${fmt(bx)} ${fmt(by)} ` +
    `Q${fmt((bx + ex) / 2 + bow)} ${fmt((by + ey) / 2 + bow)} ${fmt(ex)} ${fmt(ey)}`
  return [{ d, weight: between(r, 0.9, 1.15) }]
}

// A hand written P in the top right corner, for a portfolio frame: a stem,
// then a bowl that loops back to (or a little past) the stem.
export function portfolioStrokes(r: Rand, aspect: number): Stroke[] {
  const w = 100 * aspect
  const hgt = between(r, 30, 38)
  const x0 = w - hgt * between(r, 0.62, 0.78)
  const y0 = between(r, -12, -4)
  const lean = between(r, -3, 4)
  const stem = `M${fmt(x0 - lean)} ${fmt(y0 + hgt)} Q${fmt(x0 + between(r, -1.5, 1.5))} ${fmt(y0 + hgt / 2)} ${fmt(x0)} ${fmt(y0)}`
  const bw = hgt * between(r, 0.42, 0.55)
  const mid = y0 + hgt * between(r, 0.45, 0.56)
  const back = x0 - between(r, -1, 4)
  const bowl = `M${fmt(x0 + between(r, -1, 1))} ${fmt(y0 + between(r, -1, 1.5))} ` +
    `C${fmt(x0 + bw * 1.35)} ${fmt(y0 - hgt * 0.06)} ${fmt(x0 + bw * 1.4)} ${fmt(mid + hgt * 0.04)} ${fmt(back)} ${fmt(mid)}`
  return [
    { d: stem, weight: between(r, 0.95, 1.2) },
    { d: bowl, weight: between(r, 0.85, 1.1) },
  ]
}

export function strokesFor(kind: MarkKind, r: Rand, aspect: number) {
  switch (kind) {
    case 'circle': return circleStrokes(r, aspect)
    case 'cross': return crossStrokes(r, aspect)
    case 'check': return checkStrokes(r, aspect)
    case 'portfolio': return portfolioStrokes(r, aspect)
  }
}

const SVG_NS = 'http://www.w3.org/2000/svg'

/** Replace the paths in a mark <svg> with freshly drawn strokes. */
export function drawInto(svg: Element, kind: MarkKind, r: Rand, aspect: number) {
  const doc = svg.ownerDocument
  svg.setAttribute('viewBox', `0 0 ${fmt(100 * aspect)} 100`)
  while (svg.firstChild) svg.firstChild.remove()
  for (const { d, weight } of strokesFor(kind, r, aspect)) {
    const p = doc.createElementNS(SVG_NS, 'path')
    p.setAttribute('d', d)
    p.setAttribute('vector-effect', 'non-scaling-stroke')
    p.setAttribute('style', `--weight: ${weight.toFixed(2)}`)
    svg.append(p)
  }
}

/** In the browser: redraw every mark on the page with Math.random. */
export function redrawMarks(root: ParentNode = document) {
  for (const svg of root.querySelectorAll('svg.mark[data-kind]')) {
    const kind = svg.getAttribute('data-kind') as MarkKind
    const aspect = Number(svg.getAttribute('data-aspect')) || 1
    drawInto(svg, kind, Math.random, aspect)
  }
}

const SVG = 'http://www.w3.org/2000/svg'

/** A mark <svg> for one frame, drawn from a seed. */
export function markElement(doc: Document, kind: MarkKind, seed: number, aspect: number, cls = 'mark') {
  const svg = doc.createElementNS(SVG, 'svg')
  svg.setAttribute('class', `${cls} ${cls}-${kind}`)
  svg.setAttribute('preserveAspectRatio', 'none')
  svg.setAttribute('aria-hidden', 'true')
  svg.setAttribute('data-kind', kind)
  svg.setAttribute('data-aspect', aspect.toFixed(4))
  drawInto(svg, kind, seeded(seed), aspect)
  return svg
}

/** Hidden <svg> holding the filter that gives strokes a rough, waxy edge. */
export function pencilFilterElement(doc: Document) {
  const make = (tag: string, attrs: Record<string, string>) => {
    const e = doc.createElementNS(SVG, tag)
    for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v)
    return e
  }
  const svg = make('svg', { class: 'grease-pencil-defs', 'aria-hidden': 'true', width: '0', height: '0' })
  const filter = make('filter', { id: 'grease-pencil', x: '-10%', y: '-10%', width: '120%', height: '120%' })
  filter.append(
    make('feTurbulence', { type: 'fractalNoise', baseFrequency: '0.9', numOctaves: '2', seed: '3', result: 'noise' }),
    make('feDisplacementMap', { in: 'SourceGraphic', in2: 'noise', scale: '1.6', xChannelSelector: 'R', yChannelSelector: 'G' }),
  )
  const defs = make('defs', {})
  defs.append(filter)
  svg.append(defs)
  return svg
}

/** The inline module that redraws marks in the browser. */
export const REDRAW_SCRIPT = "import { redrawMarks } from 'grease-pencil'; redrawMarks()"

/**
 * The mark for a frame: P for portfolio, a circle for 5 stars, a check for
 * 4, an X for 1 or 2, nothing for 3 (and nothing for redacted frames).
 */
export function markFor(frame: { rating: number; portfolio?: boolean; redacted?: boolean }): MarkKind | null {
  if (frame.redacted) return null
  if (frame.portfolio) return 'portfolio'
  if (frame.rating >= 5) return 'circle'
  if (frame.rating === 4) return 'check'
  if (frame.rating >= 1 && frame.rating <= 2) return 'cross'
  return null
}
