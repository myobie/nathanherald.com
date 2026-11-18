import { HTMLElement } from 'dom'
import MarkdownIt from 'npm:markdown-it'
import { hashSeed, markElement, markFor, pencilFilterElement, REDRAW_SCRIPT, type MarkKind } from 'grease-pencil'
import { developedBy, elFactory, factsLine, formatDay, formatSpec, frameElement, sheetElement, type Frame, type Roll } from 'film'

// Renders a roll of film as a contact sheet: cut strips of frames with
// sprocket holes and edge numbers, plus grease pencil marks from the
// Lightroom star ratings (X for 1–2 stars, circle for 5 stars).
//
// Data comes from a roll.json written by bin/lr-roll (see src/photos/rolls/).

export { markFor }

const md = new MarkdownIt({ html: false, typographer: true, linkify: true })

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
      // Longer prose about the roll lives in notes.md beside roll.json (lr-roll never touches it)
      const notes = await this.#fetchText(new URL('notes.md', src).href)

      this.textContent = ''
      this.append(this.#render(roll, notes))
      if (this.hasAttribute('page')) this.#applyToPage(roll)
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
  #render(roll: Roll, notesMarkdown: string | null) {
    const doc = this.ownerDocument
    const el = elFactory(doc)
    const spec = formatSpec(roll.format)

    const article = el('article', { class: 'roll' })
    article.append(el('header', {},
      el('h1', {}, roll.title),
      el('p', { class: 'roll-facts' }, factsLine(roll)),
    ))

    const notes = notesMarkdown?.trim() || roll.notes?.trim()
    if (notes) {
      const div = el('div', { class: 'roll-notes' })
      div.innerHTML = md.render(notes)
      article.append(div)
    }

    const sheet = sheetElement(el, roll.format)
    const edge = (roll.film ?? '').toUpperCase()
    for (let i = 0; i < roll.frames.length; i += spec.perStrip) {
      const strip = el('div', { class: 'strip' })
      roll.frames.slice(i, i + spec.perStrip).forEach((frame, idx) => {
        strip.append(this.#frame(roll, frame, edge, spec.aspect, idx, spec.perStrip, spec.perStripNarrow))
      })
      sheet.append(strip)
    }
    article.append(sheet, pencilFilterElement(doc))

    // Only explain the marks that appear on this roll
    const used = new Set(roll.frames.map((f) => markFor(f)))
    const legend = el('dl', { class: 'contact-sheet-legend' })
    const entries: [MarkKind, number, string][] = [
      ['portfolio', 5, 'might go in the portfolio'],
      ['circle', 7, 'five stars, a keeper'],
      ['check', 3, 'four stars, a good one'],
      ['cross', 11, 'one or two stars, a miss'],
    ]
    for (const [kind, seed, text] of entries) {
      if (used.has(kind)) legend.append(el('dt', {}, markElement(doc, kind, seed, 1.5, 'legend-mark')), el('dd', {}, text))
    }
    if (legend.children.length) article.append(legend)

    const meta = [`${roll.frames.length} frames`]
    const developed = developedBy(roll.lab)
    if (developed) meta.push(developed)
    if (roll.scanned) meta.push(`scanned ${formatDay(roll.scanned)}`)
    article.append(el('p', { class: 'roll-meta' }, meta.join(', ')))

    // In the browser, draw the marks again by hand, a little differently on
    // every visit. Without JS the seeded marks from the build stay.
    const redraw = el('script', { type: 'module' })
    redraw.textContent = REDRAW_SCRIPT
    article.append(redraw)

    return article
  }

  #frame(roll: Roll, frame: Frame, edge: string, cellAspect: number, idx: number, perStrip: number, perStripNarrow: number) {
    const doc = this.ownerDocument
    const el = elFactory(doc)
    const mark = markFor(frame)
    const { fig, exposure } = frameElement(el, frame, {
      edge,
      cellAspect,
      id: `frame-${frame.n}`,
      className: mark ? `marked-${mark}` : '',
      rollLens: roll.lens,
    })
    if (!frame.redacted && frame.caption?.trim()) {
      // A sticky page flag on the frame with the start of the comment. Tap
      // (or hover) to read the whole thing. Notes on the right half of a strip
      // open to the left so they stay on screen.
      const html = md.render(frame.caption.trim())
      const scratch = el('div')
      scratch.innerHTML = html
      const preview = (scratch.textContent ?? '').replace(/\s+/g, ' ').trim()
      const side = (idx >= perStrip / 2 ? ' flag-right' : '') + ((idx % perStripNarrow) >= perStripNarrow / 2 ? ' flag-right-narrow' : '')
      const note = el('div', { class: 'flag-note', id: `note-${frame.n}` })
      note.innerHTML = html
      fig.append(el('div', { class: `flag${side}` },
        el('details', {}, el('summary', { class: 'flag-tab', title: preview }, preview)),
        note,
      ))
    }
    if (mark) {
      // Seed from the photo, so each photo keeps its own mark across rolls and builds
      const seed = hashSeed(frame.assetId ?? frame.filename ?? `${roll.slug}-${frame.n}`)
      exposure.append(markElement(doc, mark, seed, cellAspect))
    }
    return fig
  }

  async #fetchText(url: string): Promise<string | null> {
    try {
      const resp = await fetch(url)
      return resp.ok ? await resp.text() : null
    } catch {
      // file:// fetches throw when the file doesn't exist
      return null
    }
  }

  #applyToPage(roll: Roll) {
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

  #removeScript() {
    for (const s of this.ownerDocument.querySelectorAll('script[type="module"]')) {
      if (s.textContent?.includes('NhContactSheetElement')) { s.remove(); break }
    }
  }
}
