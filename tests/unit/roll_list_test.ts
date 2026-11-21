// Unit tests for <nh-roll-list>, the photos index. Run with: deno task test:unit
import { assert, assertEquals } from 'jsr:@std/assert'
import { parseHTML } from 'npm:linkedom'
import { join } from 'jsr:@std/path'
import { serializeAsync } from '../../src/serialize.ts'
import { NhRollListElement } from '../../src/elements/nh-roll-list.ts'
import { NhHeadElement } from '../../src/elements/nh-head.ts'
import { NhHeaderElement } from '../../src/elements/nh-header.ts'
import { NhFooterElement } from '../../src/elements/nh-footer.ts'
import { groupRolls, type RollSummary } from '../../src/elements/film.ts'

const template = await Deno.readTextFile(new URL('../../src/photos/index.html', import.meta.url))

async function render(rolls: RollSummary[]) {
  const dir = await Deno.makeTempDir()
  try {
    await Deno.writeTextFile(join(dir, 'rolls.json'), JSON.stringify(rolls))
    const linkie = parseHTML(template)
    linkie.location = new URL(`file://${dir}/index.html`)
    linkie.customElements.define(NhHeadElement.defaultName, class extends NhHeadElement {})
    linkie.customElements.define(NhHeaderElement.defaultName, class extends NhHeaderElement {})
    linkie.customElements.define(NhFooterElement.defaultName, class extends NhFooterElement {})
    linkie.customElements.define(NhRollListElement.defaultName, class extends NhRollListElement {})
    return parseHTML(await serializeAsync(linkie.document.documentElement)).document
  } finally {
    await Deno.remove(dir, { recursive: true })
  }
}

const frame = (n: number, rating: number) => ({
  n, assetId: `a${n}`, rating, flag: 0, width: 3000, height: 2000,
  thumb: `https://photos.example.com/${n}.thumb.jpg`, image: `https://photos.example.com/${n}.jpg`, imageLongSide: 1280,
})

const roll = (slug: string, extra: Partial<RollSummary> = {}): RollSummary => ({
  slug, title: `Roll ${slug}`, film: 'Ilford Delta 400', format: '35mm', camera: 'Pentax P30t',
  shot: '2025-12', scanned: '2025-12-08', url: `rolls/${slug}/`, frameCount: 36, keepers: 2,
  preview: [frame(3, 5), frame(9, 4), frame(20, 5)], ...extra,
})

Deno.test('lists rolls with a preview strip linking into the contact sheet', async () => {
  const doc = await render([roll('a'), roll('b', { keepers: 0, title: 'Second' })])
  assertEquals(doc.querySelectorAll('.roll-summary').length, 2)
  // Rolls not on a trip are grouped by month, newest first within it
  assertEquals(doc.querySelector('#month-2025-12 h2')?.textContent, 'December 2025')
  const a = doc.querySelector('#a')!, b = doc.querySelector('#b')!
  assertEquals(a.querySelector('h3 a')?.getAttribute('href'), 'rolls/a/')
  assertEquals(a.querySelector('.roll-facts')?.textContent, 'Ilford Delta 400 · Pentax P30t · 35mm · December 2025')
  assertEquals(a.querySelectorAll('.roll-preview .frame').length, 3)
  assertEquals(a.querySelector('.frame a')?.getAttribute('href'), 'rolls/a/#frame-3')
  assertEquals(a.querySelectorAll('.mark-circle').length, 2)
  assert(a.querySelector('.roll-meta')?.textContent?.includes('36 frames, 2 keepers'))
  assertEquals(b.querySelector('.roll-meta')?.textContent?.trim(), 'See the whole roll, 36 frames')
})

Deno.test('page gets the stylesheet, redraw script, and no element scripts', async () => {
  const doc = await render([roll('a')])
  assert(doc.querySelector('link[href="/contact-sheet.css"]'))
  assertEquals(doc.querySelector('title')?.textContent?.trim(), 'I’m Nathan Herald → Film')
  const scripts = [...doc.querySelectorAll('script[type="module"]')].map((s) => s.textContent)
  assertEquals(scripts, ["import { redrawMarks } from 'grease-pencil'; redrawMarks()"])
})

Deno.test('empty index', async () => {
  const doc = await render([])
  assertEquals(doc.querySelector('.roll-list li')?.textContent, 'No rolls yet.')
})

Deno.test('groupRolls: trips together in album order, newest group first, other rolls by month', () => {
  const rolls = [
    roll('2026-11-02-delta-400', { trip: 'SF Film Photos', shot: null, loaded: '2026-11-17', scanned: '2026-11-13' }),
    roll('2025-12-pentax', { shot: '2025-12' }),
    roll('2026-11-01-delta-400', { trip: 'SF Film Photos', shot: null, loaded: '2026-11-17', scanned: '2026-11-13' }),
  ]
  const groups = groupRolls(rolls)
  assertEquals(groups.map((g) => g.id), ['trip-sf-film-photos', 'month-2025-12'])
  assertEquals(groups.map((g) => g.title), ['SF Film Photos', 'December 2025'])
  assertEquals(groups[0].rolls.map((r) => r.slug), ['2026-11-01-delta-400', '2026-11-02-delta-400'])
})

Deno.test('index shows a trip as a heading with its rolls under it, newest first', async () => {
  const doc = await render([
    roll('2026-11-01-delta-400', { trip: 'SF Film Photos', title: 'Delta 400', film: 'Ilford Delta 400' }),
    roll('2026-11-05-ektacolor', { trip: 'SF Film Photos', title: 'Ektacolor Pro 400', film: 'Kodak Ektacolor Pro 400' }),
    roll('2025-12-pentax', { title: 'Pentax P30t first roll', shot: '2025-11' }),
  ])
  const trip = doc.querySelector('#trip-sf-film-photos')!
  assertEquals(trip.querySelector('h2')?.textContent, 'SF Film Photos')
  assertEquals(trip.querySelector('.roll-facts')?.textContent, '2 rolls · Ilford Delta 400 · Kodak Ektacolor Pro 400')
  assertEquals([...trip.querySelectorAll('.roll-summary h3')].map((h) => h.textContent), ['Roll 2 · Ektacolor Pro 400', 'Roll 1 · Delta 400'])
  const month = doc.querySelector('#month-2025-11')!
  assertEquals(month.querySelector('h2')?.textContent, 'November 2025')
  assertEquals(month.querySelector('.roll-summary h3')?.textContent, 'Pentax P30t first roll')
})
