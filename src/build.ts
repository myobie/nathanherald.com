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
import { NhMarkdownElement } from './elements/nh-markdown.ts'
import { NhIncludeElement } from './elements/nh-include.ts'
import { NhArchiveListElement } from './elements/nh-archive-list.ts'
import { NhLatestPostsElement } from './elements/nh-latest-posts.ts'

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

  const KNhMarkdown = class extends NhMarkdownElement {}
  linkie.customElements.define(NhMarkdownElement.defaultName, KNhMarkdown)

  const KNhInclude = class extends NhIncludeElement {}
  linkie.customElements.define(NhIncludeElement.defaultName, KNhInclude)

  const KNhArchiveList = class extends NhArchiveListElement {}
  linkie.customElements.define(NhArchiveListElement.defaultName, KNhArchiveList)

  const KNhLatestPosts = class extends NhLatestPostsElement {}
  linkie.customElements.define(NhLatestPostsElement.defaultName, KNhLatestPosts)
}

let count = 0

// Copy non-HTML, non-TS assets from src/ to public/ first
// (posts.json generation needs .md files in public/)
for await (const entry of walk(srcDir, { skip: [/\/elements\//] })) {
  if (entry.isDirectory) continue
  if (entry.name === 'index.html' || entry.name === 'post.html' || entry.path.endsWith('.ts')) continue

  const relPath = relative(srcDir, entry.path)
  const outPath = join(publicDir, relPath)

  await ensureDir(dirname(outPath))
  await Deno.copyFile(entry.path, outPath)
}

// Generate posts.json before building HTML (archive page depends on it)
const genJsonCmd = new Deno.Command(Deno.execPath(), {
  args: ['run', '--allow-read', '--allow-write', join(projectRoot, 'bin', 'gen-posts-json')],
  cwd: projectRoot,
  stdout: 'piped',
  stderr: 'piped',
})
const genJsonOutput = await genJsonCmd.output()
console.log(new TextDecoder().decode(genJsonOutput.stdout).trim())

// Copy posts.json to src/ so the archive element can resolve it during build
await Deno.copyFile(join(publicDir, 'posts.json'), join(srcDir, 'posts.json'))

// Build standalone HTML files (homepage, archive, etc.)
for await (const entry of walk(srcDir, { exts: ['.html'] })) {
  if (entry.path.includes('/elements/')) continue
  // Only build index.html files (skip templates and partials like canvas.html)
  if (entry.name !== 'index.html') continue

  const relPath = relative(srcDir, entry.path)
  const outPath = join(publicDir, relPath)

  console.log(`Building: ${relPath}`)

  const code = await Deno.readTextFile(entry.path)
  const linkie = parseHTML(code)
  linkie.location = new URL(`file://${entry.path}`)

  registerElements(linkie)

  const result = await serializeAsync(linkie.document.documentElement)
  const html = `<!DOCTYPE html>\n${result}`

  await ensureDir(dirname(outPath))
  await Deno.writeTextFile(outPath, html)

  await tidy(outPath)

  count++
}

// Build markdown posts using the post template
const templatePath = join(srcDir, 'post.html')
const templateCode = await Deno.readTextFile(templatePath)

for await (const entry of walk(join(srcDir, 'posts'), { exts: ['.md'] })) {
  const relPath = relative(srcDir, entry.path)
  const outDir = dirname(join(publicDir, relPath))
  const outPath = join(outDir, 'index.html')

  console.log(`Building: ${relPath}`)

  // Parse the template with the markdown file as a query param
  const mdFileUrl = new URL(`file://${entry.path}`)
  const templateUrl = new URL(`file://${templatePath}`)
  templateUrl.searchParams.set('md', mdFileUrl.href)

  const linkie = parseHTML(templateCode)
  linkie.location = templateUrl

  registerElements(linkie)

  const result = await serializeAsync(linkie.document.documentElement)
  const html = `<!DOCTYPE html>\n${result}`

  await ensureDir(outDir)
  await Deno.writeTextFile(outPath, html)

  await tidy(outPath)

  count++
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

console.log(`\nBuilt ${count} file(s).`)
