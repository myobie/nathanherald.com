import { HTMLElement } from 'dom'
import { drawInto, hashSeed, seeded, type MarkKind } from 'grease-pencil'

// Renders a roll of film as a contact sheet: cut strips of frames with
// sprocket holes and edge numbers, plus grease pencil marks from the
// Lightroom star ratings (X for 1–2 stars, circle for 5 stars).
//
// Data comes from a roll.json written by bin/lr-roll (see src/photos/rolls/).

interface Frame {
  n: number
  assetId?: string
  filename?: string
  rating: number
  flag: number
  width: number
  height: number
  thumb: string | null
  image: string | null
  imageLongSide: number | null
}

interface Roll {
  slug: string
  title: string
  film: string | null
  format: string
  camera: string | null
  shot: string | null
  scanned: string | null
  notes: string | null
  frames: Frame[]
}

interface FormatSpec {
  // frames per uncut strip, and per row on narrow screens
  perStrip: number
  perStripNarrow: number
  // aspect of the exposure area (width / height)
  aspect: number
  // sprocket holes per frame edge, 0 for roll film without perforations
  perfs: number
  label: string
}

const FORMATS: Record<string, FormatSpec> = {
  '35mm': { perStrip: 6, perStripNarrow: 3, aspect: 3 / 2, perfs: 8, label: '35mm' },
  'half-frame': { perStrip: 12, perStripNarrow: 6, aspect: 2 / 3, perfs: 4, label: 'Half frame' },
  '120-6x6': { perStrip: 3, perStripNarrow: 3, aspect: 1, perfs: 0, label: '120, 6×6' },
  '120-6x4.5': { perStrip: 4, perStripNarrow: 2, aspect: 3 / 4, perfs: 0, label: '120, 6×4.5' },
  '120-6x7': { perStrip: 3, perStripNarrow: 2, aspect: 7 / 6, perfs: 0, label: '120, 6×7' },
  '110': { perStrip: 6, perStripNarrow: 3, aspect: 17 / 13, perfs: 1, label: '110' },
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December']

const SVG_NS = 'http://www.w3.org/2000/svg'

const f = (n: number) => n.toFixed(1)

export function markFor(frame: Pick<Frame, 'rating'>): MarkKind | null {
  if (frame.rating >= 5) return 'circle'
  if (frame.rating >= 1 && frame.rating <= 2) return 'cross'
  return null
}

export class NhContactSheetElement extends HTMLElement {
  static defaultName = 'nh-contact-sheet'

  static define(registry: CustomElementRegistry, name = this.defaultName) {
    if (!registry.get(name)) {
      registry.define(name, this)
    }
  }

  get isReady() {
    return this.#ready.promise
  }

  #ready = Promise.withResolvers<void>()
  #slug = ''

  async connectedCallback() {
    if (this.hasAttribute('data-rendered')) {
      this.#removeScript()
      this.#ready.resolve()
      return
    }

    try {
      const src = this.#source()
      if (!src) return

      const resp = await fetch(src)
      const roll: Roll = await resp.json()
      // Image paths in roll.json are relative to the roll.json itself
      const base = src

      this.textContent = ''
      this.append(this.#render(roll, base))
      if (this.hasAttribute('page')) this.#applyToPage(roll, base)
      this.setAttribute('data-rendered', '')
    } finally {
      this.#removeScript()
      this.#ready.resolve()
    }
  }

  #source(): string | null {
    const baseURI = this.ownerDocument.baseURI
    const param = this.getAttribute('param')
    if (param) {
      const fromParam = new URL(baseURI).searchParams.get(param)
      return fromParam ? new URL(fromParam, baseURI).href : null
    }
    const src = this.getAttribute('src')
    return src ? new URL(src, baseURI).href : null
  }

  // thumb/image in roll.json are either absolute URLs (e.g. a CDN like
  // https://photos.nathanherald.com/rolls/<slug>/01.jpg) or paths relative to
  // roll.json. The built page lives in the same folder as roll.json, so
  // relative paths can stay relative in the output.
  #href(path: string) {
    return path
  }

  #render(roll: Roll, _base: string) {
    const doc = this.ownerDocument
    const spec = FORMATS[roll.format] ?? FORMATS['35mm']
    this.#slug = roll.slug
    const el = (tag: string, attrs: Record<string, string> = {}, ...kids: (Node | string)[]) => {
      const e = doc.createElement(tag)
      for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v)
      for (const k of kids) e.append(typeof k === 'string' ? doc.createTextNode(k) : k)
      return e
    }

    const article = el('article', { class: 'roll' })

    // Header: title + a short line of facts
    const facts: string[] = []
    if (roll.film) facts.push(roll.film)
    if (roll.camera) facts.push(roll.camera)
    facts.push(spec.label)
    if (roll.shot) facts.push(this.#formatMonth(roll.shot))
    const header = el('header', {},
      el('h1', {}, roll.title),
      el('p', { class: 'roll-facts' }, facts.join(' · ')),
    )
    article.append(header)

    if (roll.notes) {
      for (const para of roll.notes.split(/\n{2,}/)) {
        article.append(el('p', { class: 'roll-notes' }, para.trim()))
      }
    }

    const sheet = el('div', {
      class: `contact-sheet format-${roll.format.replace(/[^a-z0-9-]/gi, '')}${spec.perfs ? '' : ' no-perfs'}`,
      style: `--per-strip: ${spec.perStrip}; --per-strip-narrow: ${spec.perStripNarrow}; --frame-aspect: ${f(spec.aspect * 1000)} / 1000; --perfs: ${spec.perfs};`,
    })

    const edge = (roll.film ?? '').toUpperCase()
    for (let i = 0; i < roll.frames.length; i += spec.perStrip) {
      const strip = el('div', { class: 'strip' })
      for (const frame of roll.frames.slice(i, i + spec.perStrip)) {
        strip.append(this.#frame(frame, edge, spec.aspect, el))
      }
      sheet.append(strip)
    }
    article.append(sheet)
    article.append(this.#pencilFilter())

    const legend = el('dl', { class: 'contact-sheet-legend' },
      el('dt', {}, this.#markSvg('circle', 7, 1.5, 'legend-mark')), el('dd', {}, 'five stars, a keeper'),
      el('dt', {}, this.#markSvg('cross', 11, 1.5, 'legend-mark')), el('dd', {}, 'one or two stars, a miss'),
    )
    article.append(legend)

    const meta: string[] = []
    meta.push(`${roll.frames.length} frames`)
    if (roll.scanned) meta.push(`scanned ${this.#formatDay(roll.scanned)}`)
    article.append(el('p', { class: 'roll-meta' }, meta.join(', ')))

    // In the browser, draw the marks again by hand, a little differently on
    // every visit. Without JS the seeded marks from the build stay.
    const redraw = el('script', { type: 'module' })
    redraw.textContent = "import { redrawMarks } from 'grease-pencil'; redrawMarks()"
    article.append(redraw)

    return article
  }

  #frame(frame: Frame, edge: string, cellAspect: number, el: (tag: string, attrs?: Record<string, string>, ...kids: (Node | string)[]) => HTMLElement) {
    const mark = markFor(frame)
    const portrait = frame.height > frame.width
    // A vertical shot on a horizontal roll (or the reverse on half frame) sits
    // sideways on the film, so it's drawn rotated to fill the frame, like a
    // real contact sheet.
    const rotated = cellAspect !== 1 && portrait === (cellAspect > 1)
    const label = `Frame ${frame.n}` + (frame.rating ? `, ${frame.rating} star${frame.rating === 1 ? '' : 's'}` : '')

    const fig = el('figure', {
      class: 'frame' + (portrait ? ' portrait' : '') + (rotated ? ' rotated' : '') + (mark ? ` marked-${mark}` : ''),
      'data-rating': String(frame.rating),
      id: `frame-${frame.n}`,
    })

    const top = el('div', { class: 'rebate rebate-top', 'aria-hidden': 'true' })
    if (edge && frame.n % 2 === 1) top.append(el('span', { class: 'edge-text' }, edge))

    const exposure = el('div', { class: 'exposure' })
    const thumb = frame.thumb ?? frame.image
    if (thumb) {
      const img = el('img', {
        src: this.#href(thumb),
        alt: label,
        loading: 'lazy',
        decoding: 'async',
        width: String(portrait ? Math.round(640 * frame.width / frame.height) : 640),
        height: String(portrait ? 640 : Math.round(640 * frame.height / frame.width)),
      })
      if (frame.image) {
        exposure.append(el('a', { href: this.#href(frame.image), class: 'never-underline' }, img))
      } else {
        exposure.append(img)
      }
    } else {
      exposure.append(el('span', { class: 'no-scan' }, 'no scan'))
    }
    if (mark) {
      // Seed from the photo, so each photo keeps its own mark across rolls and builds
      const seed = hashSeed(frame.assetId ?? frame.filename ?? `${this.#slug}-${frame.n}`)
      exposure.append(this.#markSvg(mark, seed, cellAspect, 'mark'))
    }

    const bottom = el('div', { class: 'rebate rebate-bottom', 'aria-hidden': 'true' },
      el('span', { class: 'frame-number' }, String(frame.n)),
      el('span', { class: 'frame-number frame-number-a' }, `${frame.n}A`),
    )

    fig.append(top, exposure, bottom)
    return fig
  }

  #markSvg(kind: MarkKind, seed: number, aspect: number, cls: string) {
    const svg = this.ownerDocument.createElementNS(SVG_NS, 'svg')
    svg.setAttribute('class', `${cls} ${cls}-${kind}`)
    svg.setAttribute('preserveAspectRatio', 'none')
    svg.setAttribute('aria-hidden', 'true')
    svg.setAttribute('data-kind', kind)
    svg.setAttribute('data-aspect', aspect.toFixed(4))
    drawInto(svg, kind, seeded(seed), aspect)
    return svg
  }

  // A rough, waxy edge for the strokes.
  #pencilFilter() {
    const doc = this.ownerDocument
    const svg = doc.createElementNS(SVG_NS, 'svg')
    svg.setAttribute('class', 'grease-pencil-defs')
    svg.setAttribute('aria-hidden', 'true')
    svg.setAttribute('width', '0')
    svg.setAttribute('height', '0')
    const filter = doc.createElementNS(SVG_NS, 'filter')
    filter.setAttribute('id', 'grease-pencil')
    filter.setAttribute('x', '-10%')
    filter.setAttribute('y', '-10%')
    filter.setAttribute('width', '120%')
    filter.setAttribute('height', '120%')
    const turbulence = doc.createElementNS(SVG_NS, 'feTurbulence')
    turbulence.setAttribute('type', 'fractalNoise')
    turbulence.setAttribute('baseFrequency', '0.9')
    turbulence.setAttribute('numOctaves', '2')
    turbulence.setAttribute('seed', '3')
    turbulence.setAttribute('result', 'noise')
    const displace = doc.createElementNS(SVG_NS, 'feDisplacementMap')
    displace.setAttribute('in', 'SourceGraphic')
    displace.setAttribute('in2', 'noise')
    displace.setAttribute('scale', '1.6')
    displace.setAttribute('xChannelSelector', 'R')
    displace.setAttribute('yChannelSelector', 'G')
    filter.append(turbulence, displace)
    const defs = doc.createElementNS(SVG_NS, 'defs')
    defs.append(filter)
    svg.append(defs)
    return svg
  }

  #applyToPage(roll: Roll, _base: string) {
    const doc = this.ownerDocument
    const head = doc.head
    if (!head) return

    const facts = [roll.film, roll.camera].filter(Boolean).join(', ')
    const title = roll.title
    const description = `Contact sheet for a roll of film${facts ? `, ${facts}` : ''}.`
    const fullTitle = `I’m Nathan Herald → ${title}`

    head.querySelector('title')?.replaceChildren(doc.createTextNode(fullTitle))
    head.querySelector('meta[name="title"]')?.setAttribute('content', fullTitle)
    head.querySelector('meta[name="description"]')?.setAttribute('content', description)
    head.querySelector('meta[property="og:title"]')?.setAttribute('content', title)
    head.querySelector('meta[property="og:description"]')?.setAttribute('content', description)

    if (!head.querySelector('link[href="/contact-sheet.css"]')) {
      const link = doc.createElement('link')
      link.setAttribute('href', '/contact-sheet.css')
      link.setAttribute('rel', 'stylesheet')
      link.setAttribute('type', 'text/css')
      head.append(link)
    }
  }

  #formatMonth(value: string) {
    const [y, m] = value.split('-')
    return m ? `${MONTHS[parseInt(m, 10) - 1]} ${y}` : y
  }

  #formatDay(value: string) {
    const [y, m, d] = value.split('T')[0].split('-')
    if (!d) return this.#formatMonth(value)
    return `${parseInt(d, 10)} ${MONTHS[parseInt(m, 10) - 1]}, ${y}`
  }

  #removeScript() {
    for (const s of this.ownerDocument.querySelectorAll('script[type="module"]')) {
      if (s.textContent?.includes('NhContactSheetElement')) { s.remove(); break }
    }
  }
}
