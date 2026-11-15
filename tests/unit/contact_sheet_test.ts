// Unit tests for <nh-contact-sheet>, rendered with linkedom the same way the
// build does. Run with: deno task test:unit
import { assert, assertEquals } from 'jsr:@std/assert'
import { parseHTML } from 'npm:linkedom'
import { join } from 'jsr:@std/path'
import { serializeAsync } from '../../src/serialize.ts'
import { NhContactSheetElement, markFor } from '../../src/elements/nh-contact-sheet.ts'
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

async function render(roll: Record<string, unknown>) {
  const dir = await Deno.makeTempDir()
  try {
    const rollPath = join(dir, 'roll.json')
    await Deno.writeTextFile(rollPath, JSON.stringify(roll))
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

Deno.test('markFor: circle for 5, cross for 1 and 2, nothing otherwise', () => {
  assertEquals([0, 1, 2, 3, 4, 5].map((rating) => markFor({ rating })), [null, 'cross', 'cross', null, null, 'circle'])
})

Deno.test('renders strips of six with marks and edge numbers', async () => {
  const frames = Array.from({ length: 13 }, (_, i) => frame(i + 1, { rating: [0, 1, 2, 3, 4, 5][i % 6] }))
  const doc = await render({ ...base, frames })
  assertEquals(doc.querySelectorAll('.strip').length, 3)
  assertEquals(doc.querySelectorAll('.strip')[0].querySelectorAll('.frame').length, 6)
  assertEquals(doc.querySelectorAll('figure.frame').length, 13)
  assertEquals(doc.querySelectorAll('.mark-circle').length, 2)
  assertEquals(doc.querySelectorAll('.mark-cross').length, 4)
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
  assertEquals(doc.querySelectorAll('.strip').length, 2)
  assert(doc.querySelector('.contact-sheet')?.classList.contains('no-perfs'))
})

Deno.test('applies title, description and stylesheet to the page', async () => {
  const doc = await render({ ...base, frames: [frame(1)] })
  assertEquals(doc.querySelector('title')?.textContent?.trim(), 'I’m Nathan Herald → Test Roll')
  assertEquals(doc.querySelector('meta[property="og:title"]')?.getAttribute('content'), 'Test Roll')
  assert(doc.querySelector('meta[name="description"]')?.getAttribute('content')?.includes('Kodak Portra 400'))
  assert(doc.querySelector('link[href="/contact-sheet.css"]'))
  assertEquals(doc.querySelector('.roll-facts')?.textContent, 'Kodak Portra 400 · Leica M7 · 35mm · September 2026')
})
