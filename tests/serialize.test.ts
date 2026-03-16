import { test, expect } from 'npm:@playwright/test'
import { parseHTML } from 'npm:linkedom'
import { walk } from 'jsr:@std/fs/walk'
import { relative, join } from 'jsr:@std/path'
import { serializeAsync } from '../src/serialize.ts'
import { NhHeadElement } from '../src/elements/nh-head.ts'
import { NhHeaderElement } from '../src/elements/nh-header.ts'
import { NhFooterElement } from '../src/elements/nh-footer.ts'
import { NhPageElement } from '../src/elements/nh-page.ts'

const srcDir = join(Deno.cwd(), 'src')

function normalize(html: string): string {
  return html
    .replace(/\s+/g, ' ')
    .replace(/> </g, '><')
    .replace(/^\s+|\s+$/g, '')
    .toLowerCase()
}

function registerElements(linkie: ReturnType<typeof parseHTML>) {
  const KNhHead = class extends NhHeadElement {}
  linkie.customElements.define(NhHeadElement.defaultName, KNhHead)
  const KNhHeader = class extends NhHeaderElement {}
  linkie.customElements.define(NhHeaderElement.defaultName, KNhHeader)
  const KNhFooter = class extends NhFooterElement {}
  linkie.customElements.define(NhFooterElement.defaultName, KNhFooter)
  const KNhPage = class extends NhPageElement {}
  linkie.customElements.define(NhPageElement.defaultName, KNhPage)
}

// Collect source HTML files
const sourceFiles: string[] = []
for await (const entry of walk(srcDir, { exts: ['.html'] })) {
  if (entry.path.includes('/elements/')) continue
  sourceFiles.push(relative(srcDir, entry.path))
}

for (const file of sourceFiles) {
  test(`${file}: browser DOM matches linkedom serialization`, async ({ page }) => {
    // 1. Load in browser via dev server
    const url = `/${file.replace(/\/index\.html$/, '/').replace(/\.html$/, '')}`
    await page.goto(url)

    // Wait for custom elements to be defined
    await page.waitForFunction(() => {
      return customElements.get('nh-head') &&
             customElements.get('nh-header') &&
             customElements.get('nh-footer') &&
             customElements.get('nh-page')
    }, { timeout: 10_000 })

    // Small delay for connectedCallbacks to finish
    await page.waitForTimeout(500)

    // Get the browser's body innerHTML (head will differ due to parser behavior)
    const browserBody = await page.evaluate(() => {
      return document.body.innerHTML
    })

    // 2. Serialize with linkedom
    const code = await Deno.readTextFile(join(srcDir, file))
    const linkie = parseHTML(code)
    registerElements(linkie)
    const serialized = await serializeAsync(linkie.document.documentElement)

    // Extract body from serialized HTML
    const bodyMatch = serialized.match(/<body[^>]*>([\s\S]*)<\/body>/)
    const serializedBody = bodyMatch ? bodyMatch[1] : ''

    // Compare normalized body content
    expect(normalize(browserBody)).toBe(normalize(serializedBody))
  })
}
