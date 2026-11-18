// Unit tests for <nh-contact-sheet>, rendered with linkedom the same way the
// build does. Run with: deno task test:unit
import { assert, assertEquals } from 'jsr:@std/assert'
import { parseHTML } from 'npm:linkedom'
import { dirname, join } from 'jsr:@std/path'
import { serializeAsync } from '../../src/serialize.ts'
import { NhContactSheetElement, markFor } from '../../src/elements/nh-contact-sheet.ts'
import { unratedFrames } from '../../src/elements/film.ts'
import { circleStrokes, crossStrokes, hashSeed, seeded } from '../../src/elements/grease-pencil.ts'
import { NhHeadElement } from '../../src/elements/nh-head.ts'
import { NhHeaderElement } from '../../src/elements/nh-header.ts'
import { NhFooterElement } from '../../src/elements/nh-footer.ts'

const template = await Deno.readTextFile(new URL('../../src/roll.html', import.meta.url))

function frame(n: number, extra: Record<string, unknown> = {}) {
  return {
    n, assetId: `a${n}`, filename: `F${n}.ORF`, rating: 0, flag: 0,
    width: 3000, height: 2000, thumb: `${String(n).padStart(2, '0')}.thumb.jpg`,
    image: `${String(n).padStart(2, '0')}.jpg`, imageLongSide: 1280, ...extra,
  }
}

async function render(roll: Record<string, unknown>, notesMd?: string) {
  const dir = await Deno.makeTempDir()
  try {
    const rollPath = join(dir, 'roll.json')
    await Deno.writeTextFile(rollPath, JSON.stringify(roll))
    if (notesMd !== undefined) await Deno.writeTextFile(join(dir, 'notes.md'), notesMd)
    const pageUrl = new URL(`file://${dir}/index.html`)
    pageUrl.searchParams.set('roll', `file://${rollPath}`)
    const linkie = parseHTML(template)
    linkie.location = pageUrl
    linkie.customElements.define(NhHeadElement.defaultName, class extends NhHeadElement {})
    linkie.customElements.define(NhHeaderElement.defaultName, class extends NhHeaderElement {})
    linkie.customElements.define(NhFooterElement.defaultName, class extends NhFooterElement {})
    linkie.customElements.define(NhContactSheetElement.defaultName, class extends NhContactSheetElement {})
    const html = await serializeAsync(linkie.document.documentElement)
    return parseHTML(html).document
  } finally {
    await Deno.remove(dir, { recursive: true })
  }
}

const base = {
  slug: 'test', title: 'Test Roll', film: 'Kodak Portra 400', format: '35mm',
  camera: 'Leica M7', shot: '2026-09', scanned: '2026-09-25', notes: null,
}

Deno.test('markFor: P for portfolio, circle for 5, check for 4, cross for 1 and 2, nothing for 3', () => {
  assertEquals([0, 1, 2, 3, 4, 5].map((rating) => markFor({ rating })), [null, 'cross', 'cross', null, 'check', 'circle'])
  assertEquals(markFor({ rating: 5, portfolio: true }), 'portfolio')
  assertEquals(markFor({ rating: 3, portfolio: true }), 'portfolio')
  assertEquals(markFor({ rating: 5, portfolio: true, redacted: true }), null)
})

Deno.test('renders strips of six with marks and edge numbers', async () => {
  const frames = Array.from({ length: 13 }, (_, i) => frame(i + 1, { rating: [0, 1, 2, 3, 4, 5][i % 6] }))
  const doc = await render({ ...base, frames })
  assertEquals(doc.querySelectorAll('.strip').length, 3)
  assertEquals(doc.querySelectorAll('.strip')[0].querySelectorAll('.frame').length, 6)
  assertEquals(doc.querySelectorAll('figure.frame').length, 13)
  assertEquals(doc.querySelectorAll('.mark-circle').length, 2)
  assertEquals(doc.querySelectorAll('.mark-cross').length, 4)
  assertEquals(doc.querySelectorAll('.mark-check').length, 2)
  assertEquals(doc.querySelector('#frame-7 .frame-number')?.textContent, '7')
  assertEquals(doc.querySelector('#frame-7 .frame-number-a')?.textContent, '7A')
  assert(doc.querySelector('.edge-text')?.textContent === 'KODAK PORTRA 400')
  assert(!doc.querySelector('script[type="module"]')?.textContent?.includes('NhContactSheetElement'))
})

Deno.test('relative paths stay relative, absolute URLs pass through', async () => {
  const doc = await render({
    ...base,
    frames: [
      frame(1),
      frame(2, { thumb: 'https://photos.example.com/rolls/test/02.thumb.jpg', image: 'https://photos.example.com/rolls/test/02.jpg' }),
    ],
  })
  assertEquals(doc.querySelector('#frame-1 img')?.getAttribute('src'), '01.thumb.jpg')
  assertEquals(doc.querySelector('#frame-1 a')?.getAttribute('href'), '01.jpg')
  assertEquals(doc.querySelector('#frame-2 img')?.getAttribute('src'), 'https://photos.example.com/rolls/test/02.thumb.jpg')
  assertEquals(doc.querySelector('#frame-2 a')?.getAttribute('href'), 'https://photos.example.com/rolls/test/02.jpg')
})

Deno.test('handles frames without previews', async () => {
  const doc = await render({
    ...base,
    frames: [
      frame(1, { thumb: null, image: null, imageLongSide: null }),
      frame(2, { image: null, imageLongSide: null }),
      frame(3, { thumb: null }),
    ],
  })
  assertEquals(doc.querySelector('#frame-1 .no-scan')?.textContent, 'no scan')
  assert(!doc.querySelector('#frame-1 img'))
  assert(doc.querySelector('#frame-2 img') && !doc.querySelector('#frame-2 a'))
  assertEquals(doc.querySelector('#frame-3 img')?.getAttribute('src'), '03.jpg')
})

Deno.test('portrait frames and formats', async () => {
  const doc = await render({ ...base, format: '120-6x6', frames: [frame(1, { width: 2000, height: 3000 }), frame(2), frame(3), frame(4)] })
  assert(doc.querySelector('#frame-1')?.classList.contains('portrait'))
  assert(!doc.querySelector('#frame-1')?.classList.contains('rotated'), 'square frames never rotate')
  assertEquals(doc.querySelectorAll('.strip').length, 2)
  assert(doc.querySelector('.contact-sheet')?.classList.contains('no-perfs'))
})

Deno.test('sideways frames are rotated to fill the cell', async () => {
  const doc = await render({ ...base, frames: [frame(1, { width: 2000, height: 3000 }), frame(2)] })
  assert(doc.querySelector('#frame-1')?.classList.contains('rotated'))
  assert(!doc.querySelector('#frame-2')?.classList.contains('rotated'))
  const half = await render({ ...base, format: 'half-frame', frames: [frame(1, { width: 2000, height: 3000 }), frame(2)] })
  assert(!half.querySelector('#frame-1')?.classList.contains('rotated'))
  assert(half.querySelector('#frame-2')?.classList.contains('rotated'))
})

Deno.test('applies title, description and stylesheet to the page', async () => {
  const doc = await render({ ...base, frames: [frame(1)] })
  assertEquals(doc.querySelector('title')?.textContent?.trim(), 'I’m Nathan Herald → Test Roll')
  assertEquals(doc.querySelector('meta[property="og:title"]')?.getAttribute('content'), 'Test Roll')
  assert(doc.querySelector('meta[name="description"]')?.getAttribute('content')?.includes('Kodak Portra 400'))
  assert(doc.querySelector('link[href="/contact-sheet.css"]'))
  assertEquals(doc.querySelector('.roll-facts')?.textContent, 'Kodak Portra 400 · Leica M7 · 35mm · September 2026')
})

Deno.test('marks are seeded per photo, not per position', async () => {
  const a = await render({ ...base, frames: [frame(1, { rating: 5, assetId: 'photo-x' }), frame(2, { rating: 5, assetId: 'photo-y' })] })
  const b = await render({ ...base, slug: 'other', frames: [frame(1, { rating: 5, assetId: 'photo-y' })] })
  const d = (doc: Document, n: number) => doc.querySelector(`#frame-${n} .mark path`)?.getAttribute('d')
  assert(d(a, 1) && d(a, 2) && d(a, 1) !== d(a, 2), 'different photos get different marks')
  assertEquals(d(b, 1), d(a, 2), 'the same photo gets the same mark on any roll')
})

Deno.test('mark svgs match the frame shape and get redrawn in the browser', async () => {
  const doc = await render({ ...base, frames: [frame(1, { rating: 1 })] })
  const svg = doc.querySelector('#frame-1 svg.mark')!
  assertEquals(svg.getAttribute('data-kind'), 'cross')
  assertEquals(svg.getAttribute('viewBox'), '0 0 150 100')
  assertEquals(Number(svg.getAttribute('data-aspect')), 1.5)
  assert(svg.querySelector('path')?.getAttribute('style')?.startsWith('--weight: '))
  assert(doc.querySelector('filter#grease-pencil feDisplacementMap, filter#grease-pencil fedisplacementmap'))
  const scripts = [...doc.querySelectorAll('script[type="module"]')].map((s) => s.textContent)
  assertEquals(scripts, ["import { redrawMarks } from 'grease-pencil'; redrawMarks()"])
  assert(doc.querySelector('script[type="importmap"]')?.textContent?.includes('/elements/grease-pencil.js'))
})

Deno.test('grease pencil: deterministic per seed, varied across seeds', () => {
  assertEquals(hashSeed('abc'), hashSeed('abc'))
  assert(hashSeed('abc') !== hashSeed('abd'))
  const one = circleStrokes(seeded(42), 1.5)
  assertEquals(one, circleStrokes(seeded(42), 1.5))
  assert(JSON.stringify(one) !== JSON.stringify(circleStrokes(seeded(43), 1.5)))
  const seen = new Set<number>()
  for (let i = 0; i < 200; i++) {
    const c = circleStrokes(seeded(i), 1.5)
    seen.add(c.length)
    for (const s of c) assert(/^M[\d.-]+ [\d.-]+( L[\d.-]+ [\d.-]+)+$/.test(s.d), s.d)
    const x = crossStrokes(seeded(i), 1.5)
    assertEquals(x.length, 2)
    for (const s of x) assert(s.weight >= 0.85 && s.weight <= 1.2)
  }
  assert(seen.has(1) && seen.has(2), 'some circles get a second pass')
})

Deno.test('redacted frames keep their slot but never their image or mark', async () => {
  const doc = await render({
    ...base,
    frames: [frame(1, { rating: 5 }), frame(2, { rating: 5, redacted: true }), frame(3, { rating: 1, redacted: true, thumb: null, image: null })],
  })
  const f2 = doc.querySelector('#frame-2')!
  assert(f2.classList.contains('redacted'))
  assert(!f2.querySelector('img') && !f2.querySelector('a'), 'no image even though roll.json had one')
  assert(!f2.querySelector('svg.mark'))
  assertEquals(f2.querySelector('.redacted-tape')?.textContent, 'redacted')
  assertEquals(f2.querySelector('.frame-number')?.textContent, '2')
  assert(!doc.querySelector('#frame-3 svg.mark'))
  assert(doc.querySelector('#frame-1 svg.mark-circle'))
  assert(!doc.body.innerHTML.includes('02.jpg'), 'redacted image URL never appears in the page')
})

Deno.test('unratedFrames: a roll is only finished when every frame has 1 to 5 stars', () => {
  assertEquals(unratedFrames({ frames: [frame(1, { rating: 3 }), frame(2, { rating: 1 })] }), [])
  const unrated = unratedFrames({ frames: [frame(1, { rating: 0 }), frame(2, { rating: 5, redacted: true }), frame(3, { rating: 0, redacted: true })] })
  assertEquals(unrated.map((f) => f.n), [1, 3])
})

Deno.test('frame captions become sticky flags on their frames', async () => {
  const doc = await render({
    ...base,
    frames: [
      frame(1, { rating: 1, caption: 'Missed *focus*, again.' }),
      frame(2, { rating: 3 }),
      frame(3, { rating: 5, redacted: true, caption: 'should never show' }),
      frame(5, { rating: 3, caption: 'Right side of the strip' }),
    ],
  })
  const flag = doc.querySelector('#frame-1 .flag')!
  assertEquals(flag.querySelector('summary.flag-tab')?.textContent, 'Missed focus, again.')
  assertEquals(flag.querySelector('.flag-note em')?.textContent, 'focus')
  assert(!flag.classList.contains('flag-right'))
  assert(doc.querySelector('#frame-5 .flag')?.classList.contains('flag-right'), 'flags on the right half open to the left')
  assert(!doc.querySelector('#frame-2 .flag'))
  assert(!doc.querySelector('.frame-notes'), 'no list at the bottom anymore')
  assert(!doc.body.innerHTML.includes('should never show'))
})

Deno.test('legend only explains marks used on the roll, including P and check', async () => {
  const doc = await render({ ...base, frames: [frame(1, { rating: 4 }), frame(2, { rating: 5, portfolio: true }), frame(3, { rating: 3 })] })
  const terms = [...doc.querySelectorAll('.contact-sheet-legend dd')].map((d) => d.textContent)
  assertEquals(terms, ['might go in the portfolio', 'four stars, a good one'])
  assert(doc.querySelector('#frame-2 svg.mark-portfolio'))
  assert(doc.querySelector('#frame-1 svg.mark-check'))
  assert(!doc.querySelector('#frame-3 svg.mark'))
})

Deno.test('notes.md beside roll.json renders as markdown above the sheet', async () => {
  const doc = await render({ ...base, notes: 'short note', frames: [frame(1)] }, 'First roll through the **P30t**.\n\nSecond paragraph.')
  const notes = doc.querySelector('.roll-notes')!
  assertEquals(notes.querySelectorAll('p').length, 2)
  assertEquals(notes.querySelector('strong')?.textContent, 'P30t')
  assert(!notes.textContent?.includes('short note'), 'notes.md wins over roll.json notes')
  const order = [...doc.querySelector('article.roll')!.children].map((c) => c.className || c.tagName.toLowerCase())
  assert(order.indexOf('roll-notes') < order.findIndex((c) => c.startsWith('contact-sheet')))
})

Deno.test('roll.json notes still work without notes.md, and no notes means no block', async () => {
  const a = await render({ ...base, notes: 'A short note.', frames: [frame(1)] })
  assertEquals(a.querySelector('.roll-notes p')?.textContent, 'A short note.')
  const b = await render({ ...base, frames: [frame(1)] })
  assert(!b.querySelector('.roll-notes'))
  assert(!b.querySelector('.frame-notes'))
})

Deno.test('lens and lab: roll facts, developed line, per-frame lens only when it differs', async () => {
  const doc = await render({
    ...base, lens: '50mm f/1.7', lab: 'home',
    frames: [frame(1, { lens: '50mm f/1.7' }), frame(2, { lens: '28mm f/2.8' }), frame(3)],
  })
  assertEquals(doc.querySelector('.roll-facts')?.textContent, 'Kodak Portra 400 \u00b7 Leica M7 + 50mm f/1.7 \u00b7 35mm \u00b7 September 2026')
  assert(doc.querySelector('.roll-meta')?.textContent?.includes('developed at home'))
  assertEquals(doc.querySelector('#frame-1 img')?.getAttribute('alt'), 'Frame 1')
  assertEquals(doc.querySelector('#frame-2 img')?.getAttribute('alt'), 'Frame 2, 28mm f/2.8')
  assertEquals(doc.querySelector('#frame-2 img')?.getAttribute('title'), '28mm f/2.8')
  const lab = await render({ ...base, lab: 'Film Speed Lab', frames: [frame(1)] })
  assert(lab.querySelector('.roll-meta')?.textContent?.includes('developed by Film Speed Lab'))
  const none = await render({ ...base, frames: [frame(1)] })
  assert(!none.querySelector('.roll-meta')?.textContent?.includes('developed'))
})

Deno.test('loaded date shows in the meta line', async () => {
  const doc = await render({ ...base, loaded: '2026-11-03', lab: 'Underdog Film Lab', frames: [frame(1)] })
  assertEquals(doc.querySelector('.roll-meta')?.textContent, '1 frame, loaded 3 November, 2026, developed by Underdog Film Lab, scanned 25 September, 2026')
})

Deno.test('roll page links back to its trip and to the previous and next roll', async () => {
  const dir = await Deno.makeTempDir()
  try {
    const mk = (slug: string, title: string) => ({ ...base, slug, title, trip: 'SF Film Photos', url: `rolls/${slug}/`, frameCount: 1, keepers: 0, preview: [] })
    const index = [mk('2026-11-01-delta-400', 'Delta 400'), mk('2026-11-02-delta-400', 'Delta 400'), mk('2026-11-03-delta-400', 'Delta 400')]
    await Deno.mkdir(join(dir, 'rolls', '2026-11-02-delta-400'), { recursive: true })
    await Deno.writeTextFile(join(dir, 'rolls.json'), JSON.stringify(index))
    const rollPath = join(dir, 'rolls', '2026-11-02-delta-400', 'roll.json')
    await Deno.writeTextFile(rollPath, JSON.stringify({ ...base, slug: '2026-11-02-delta-400', title: 'Delta 400', trip: 'SF Film Photos', frames: [frame(1)] }))
    const pageUrl = new URL(`file://${dirname(rollPath)}/index.html`)
    pageUrl.searchParams.set('roll', `file://${rollPath}`)
    const linkie = parseHTML(template)
    linkie.location = pageUrl
    linkie.customElements.define(NhContactSheetElement.defaultName, class extends NhContactSheetElement {})
    const doc = parseHTML(await serializeAsync(linkie.document.documentElement)).document
    assertEquals(doc.querySelector('.roll-trip')?.textContent, 'Roll 2 of 3 from SF Film Photos')
    assertEquals(doc.querySelector('.roll-trip a')?.getAttribute('href'), '/photos/#trip-sf-film-photos')
    assertEquals(doc.querySelector('a[rel=prev]')?.getAttribute('href'), '/photos/rolls/2026-11-01-delta-400/')
    assertEquals(doc.querySelector('a[rel=next]')?.textContent, 'Roll 3: Delta 400 →')
  } finally {
    await Deno.remove(dir, { recursive: true })
  }
})

Deno.test('rolls nested in folders find rolls.json at the top of /photos/', async () => {
  const dir = await Deno.makeTempDir()
  try {
    const path = '2026-10/sf-film-photos/02-delta-400'
    const mk = (p: string) => ({ ...base, slug: p.replaceAll('/', '-'), title: 'Delta 400', trip: 'SF Film Photos', url: `${p}/`, frameCount: 1, keepers: 0, preview: [] })
    await Deno.mkdir(join(dir, path), { recursive: true })
    await Deno.writeTextFile(join(dir, 'rolls.json'), JSON.stringify([mk('2026-10/sf-film-photos/01-delta-400'), mk(path)]))
    const rollPath = join(dir, path, 'roll.json')
    await Deno.writeTextFile(rollPath, JSON.stringify({ ...base, slug: path.replaceAll('/', '-'), path, title: 'Delta 400', trip: 'SF Film Photos', frames: [frame(1)] }))
    const pageUrl = new URL(`file://${dirname(rollPath)}/index.html`)
    pageUrl.searchParams.set('roll', `file://${rollPath}`)
    const linkie = parseHTML(template)
    linkie.location = pageUrl
    linkie.customElements.define(NhContactSheetElement.defaultName, class extends NhContactSheetElement {})
    const doc = parseHTML(await serializeAsync(linkie.document.documentElement)).document
    assertEquals(doc.querySelector('.roll-trip')?.textContent, 'Roll 2 of 2 from SF Film Photos')
    assertEquals(doc.querySelector('a[rel=prev]')?.getAttribute('href'), '/photos/2026-10/sf-film-photos/01-delta-400/')
  } finally {
    await Deno.remove(dir, { recursive: true })
  }
})
