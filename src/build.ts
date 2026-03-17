import { parseHTML } from 'npm:linkedom'
import { walk } from 'jsr:@std/fs/walk'
import { relative, join, dirname } from 'jsr:@std/path'
import { ensureDir } from 'jsr:@std/fs/ensure-dir'
import { serializeAsync } from './serialize.ts'
import { NhHeadElement } from './elements/nh-head.ts'
import { NhHeaderElement } from './elements/nh-header.ts'
import { NhFooterElement } from './elements/nh-footer.ts'
import { NhPageElement } from './elements/nh-page.ts'
import { NhReadyElement } from './elements/nh-ready.ts'

const srcDir = new URL('.', import.meta.url).pathname
const projectRoot = join(srcDir, '..')
const publicDir = join(projectRoot, 'public')

const tidyrcPath = join(projectRoot, '.tidyrc')

async function tidy(filepath: string) {
  try {
    const cmd = new Deno.Command('tidy', {
      args: ['-config', tidyrcPath, '-m', filepath],
      stderr: 'null'
    })
    await cmd.output()
  } catch {
    // tidy not installed, skip
  }
}

function registerElements(linkie: ReturnType<typeof parseHTML>) {
  // Each custom element must be unique per document because
  // customElements are per document in linkedom
  const KNhHead = class extends NhHeadElement {}
  linkie.customElements.define(NhHeadElement.defaultName, KNhHead)

  const KNhHeader = class extends NhHeaderElement {}
  linkie.customElements.define(NhHeaderElement.defaultName, KNhHeader)

  const KNhFooter = class extends NhFooterElement {}
  linkie.customElements.define(NhFooterElement.defaultName, KNhFooter)

  const KNhPage = class extends NhPageElement {}
  linkie.customElements.define(NhPageElement.defaultName, KNhPage)

  const KNhReady = class extends NhReadyElement {}
  linkie.customElements.define(NhReadyElement.defaultName, KNhReady)
}

let count = 0

for await (const entry of walk(srcDir, { exts: ['.html'] })) {
  // Skip the elements directory
  if (entry.path.includes('/elements/')) continue

  const relPath = relative(srcDir, entry.path)
  const outPath = join(publicDir, relPath)

  console.log(`Building: ${relPath}`)

  const code = await Deno.readTextFile(entry.path)
  const linkie = parseHTML(code)

  registerElements(linkie)

  const result = await serializeAsync(linkie.document.documentElement)
  const html = `<!DOCTYPE html>\n${result}`

  await ensureDir(dirname(outPath))
  await Deno.writeTextFile(outPath, html)

  await tidy(outPath)

  count++
}

// Copy non-HTML, non-TS assets from src/ to public/
for await (const entry of walk(srcDir, { skip: [/\/elements\//] })) {
  if (entry.isDirectory) continue
  if (entry.path.endsWith('.html') || entry.path.endsWith('.ts')) continue

  const relPath = relative(srcDir, entry.path)
  const outPath = join(publicDir, relPath)

  await ensureDir(dirname(outPath))
  await Deno.copyFile(entry.path, outPath)
}

// Compile element .ts files to .js in public/elements/
import { stripTSTypes } from './strip-ts-types.ts'

const elementsDir = join(srcDir, 'elements')
const publicElementsDir = join(publicDir, 'elements')
await ensureDir(publicElementsDir)

for await (const entry of walk(elementsDir)) {
  if (entry.isDirectory) continue
  const relPath = relative(elementsDir, entry.path)

  if (entry.path.endsWith('.js')) {
    await Deno.copyFile(entry.path, join(publicElementsDir, relPath))
    console.log(`Copied: elements/${relPath}`)
  } else if (entry.path.endsWith('.ts') && relPath !== 'dom.ts') {
    const outName = relPath.replace(/\.ts$/, '.js')
    const js = await stripTSTypes(entry.path)
    await Deno.writeTextFile(join(publicElementsDir, outName), js)
    console.log(`Compiled: elements/${relPath} → elements/${outName}`)
  }
}

console.log(`\nBuilt ${count} HTML file(s).`)
