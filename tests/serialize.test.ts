import { test, expect } from '@playwright/test'

// These tests verify the built static HTML output in public/.
// All custom elements have already expanded and removed their scripts
// during the server-side build. We're checking the final output.

// --- nh-head ---

test('nh-head: head has title, meta, links', async ({ page }) => {
  await page.goto('/posts/florentine-floor/')

  const title = await page.$eval('title', el => el.textContent?.trim())
  expect(title).toContain('Florentine Floor')

  const description = await page.$eval('meta[name="description"]', el => el.getAttribute('content'))
  expect(description).toBe('How a marble floor slab in a Florentine church became my logo.')

  const ogTitle = await page.$eval('meta[property="og:title"]', el => el.getAttribute('content'))
  expect(ogTitle).toBe('Florentine Floor')

  const faviconSvg = await page.$('link[href="/favicon.svg"]')
  expect(faviconSvg).toBeTruthy()

  const rss = await page.$('link[href="/rss.xml"]')
  expect(rss).toBeTruthy()
})

test('nh-head: self-removed from body', async ({ page }) => {
  await page.goto('/posts/florentine-floor/')
  const nhHead = await page.$('nh-head')
  expect(nhHead).toBeNull()
})

test('nh-head: script removed', async ({ page }) => {
  await page.goto('/posts/florentine-floor/')
  const scripts = await page.$$eval('script[type="module"]', els =>
    els.map(el => el.textContent)
  )
  expect(scripts.some(s => s?.includes('NhHeadElement'))).toBe(false)
})

// --- nh-header ---

test('nh-header: renders nav header', async ({ page }) => {
  await page.goto('/posts/florentine-floor/')

  const header = await page.$('nh-header header.section-header')
  expect(header).toBeTruthy()

  const homeLink = await page.$('nh-header a[href="/"]')
  expect(homeLink).toBeTruthy()

  const archiveLink = await page.$('nh-header a[href="/posts/"]')
  expect(archiveLink).toBeTruthy()
})

test('nh-header: script removed', async ({ page }) => {
  await page.goto('/posts/florentine-floor/')
  const scripts = await page.$$eval('script[type="module"]', els =>
    els.map(el => el.textContent)
  )
  expect(scripts.some(s => s?.includes('NhHeaderElement'))).toBe(false)
})

// --- nh-footer ---

test('nh-footer: renders footer with SVG logo', async ({ page }) => {
  await page.goto('/posts/florentine-floor/')

  const footer = await page.$('nh-footer footer.site-footer')
  expect(footer).toBeTruthy()

  const svg = await page.$('nh-footer svg.footer-logo')
  expect(svg).toBeTruthy()
})

test('nh-footer: script removed', async ({ page }) => {
  await page.goto('/posts/florentine-floor/')
  const scripts = await page.$$eval('script[type="module"]', els =>
    els.map(el => el.textContent)
  )
  expect(scripts.some(s => s?.includes('NhFooterElement'))).toBe(false)
})

// --- nh-page ---

test('nh-page: renders article structure (blog post)', async ({ page }) => {
  await page.goto('/posts/florentine-floor/')

  const article = await page.$('nh-page main.single article')
  expect(article).toBeTruthy()

  const h1 = await page.$eval('nh-page article header h1', el => el.textContent?.trim())
  expect(h1).toBe('Florentine Floor')

  const content = await page.$('nh-page article div.content')
  expect(content).toBeTruthy()

  const dateFooter = await page.$eval('nh-page article footer time', el => el.textContent?.trim())
  expect(dateFooter).toBe('16 March, 2026')
})

test('nh-page: link post has linked title and read more', async ({ page }) => {
  await page.goto('/posts/links/olmotrace/')

  const titleLink = await page.$eval('nh-page article header h1 a', el => el.getAttribute('href'))
  expect(titleLink).toBe('https://allenai.org/blog/olmotrace')

  const readMore = await page.$('nh-page article div.content p.read-more a')
  expect(readMore).toBeTruthy()

  const readMoreText = await readMore!.textContent()
  expect(readMoreText).toBe('Read more at the source')
})

test('nh-page: script removed', async ({ page }) => {
  await page.goto('/posts/florentine-floor/')
  const scripts = await page.$$eval('script[type="module"]', els =>
    els.map(el => el.textContent)
  )
  expect(scripts.some(s => s?.includes('NhPageElement'))).toBe(false)
})

// --- nh-markdown ---

test('nh-markdown: renders content with data-rendered', async ({ page }) => {
  await page.goto('/posts/florentine-floor/')

  const rendered = await page.$eval('nh-markdown', el => el.hasAttribute('data-rendered'))
  expect(rendered).toBe(true)

  const paragraphs = await page.$$('nh-markdown > p')
  expect(paragraphs.length).toBeGreaterThan(0)

  const firstP = await page.$eval('nh-markdown > p', el => el.textContent)
  expect(firstP).toContain('San Miniato al Monte')
})

test('nh-markdown: curly quotes from typographer', async ({ page }) => {
  await page.goto('/posts/florentine-floor/')

  const html = await page.$eval('nh-markdown', el => el.innerHTML)
  expect(html).toContain('\u2019') // curly right single quote
})

test('nh-markdown: iframe passthrough (YouTube)', async ({ page }) => {
  await page.goto('/posts/links/the-killer-trailer/')

  const iframe = await page.$('nh-markdown iframe')
  expect(iframe).toBeTruthy()

  const src = await iframe!.getAttribute('src')
  expect(src).toContain('youtube-nocookie.com')
})

test('nh-markdown: page attribute applies frontmatter', async ({ page }) => {
  await page.goto('/posts/coding-agents-and-agency/')

  // Title from frontmatter
  const title = await page.$eval('title', el => el.textContent?.trim())
  expect(title).toContain('Gaining Agency')

  const h1 = await page.$eval('article header h1', el => el.textContent?.trim())
  expect(h1).toBe('Gaining Agency')

  // Description from frontmatter
  const desc = await page.$eval('meta[name="description"]', el => el.getAttribute('content'))
  expect(desc).toContain('Coding agents')
})

test('nh-markdown: script removed', async ({ page }) => {
  await page.goto('/posts/florentine-floor/')
  const scripts = await page.$$eval('script[type="module"]', els =>
    els.map(el => el.textContent)
  )
  expect(scripts.some(s => s?.includes('NhMarkdownElement'))).toBe(false)
})

// --- nh-include ---

test('nh-include: includes HTML content from file', async ({ page }) => {
  await page.goto('/posts/wave-interference/')

  const included = await page.$eval('nh-include', el => el.hasAttribute('data-included'))
  expect(included).toBe(true)

  const canvas = await page.$('nh-include canvas#wave-canvas')
  expect(canvas).toBeTruthy()
})

test('nh-include: script removed', async ({ page }) => {
  await page.goto('/posts/wave-interference/')
  const scripts = await page.$$eval('script[type="module"]', els =>
    els.map(el => el.textContent)
  )
  expect(scripts.some(s => s?.includes('NhIncludeElement'))).toBe(false)
})

test('nh-include: canvas script preserved', async ({ page }) => {
  await page.goto('/posts/wave-interference/')

  // The canvas inline script should still be there (it's content, not an element script)
  const scripts = await page.$$eval('script:not([type])', els =>
    els.map(el => el.textContent)
  )
  expect(scripts.some(s => s?.includes('wave-canvas'))).toBe(true)
})

test('wave-interference: frontmatter applied', async ({ page }) => {
  await page.goto('/posts/wave-interference/')

  const title = await page.$eval('title', el => el.textContent?.trim())
  expect(title).toContain('Wave Interference')

  const h1 = await page.$eval('article header h1', el => el.textContent?.trim())
  expect(h1).toBe('Wave Interference')
})

// --- Homepage ---

test('homepage: head populated, no nh-head in body', async ({ page }) => {
  await page.goto('/')

  const title = await page.$eval('title', el => el.textContent?.trim())
  expect(title).toContain('Nathan Herald')

  const nhHead = await page.$('nh-head')
  expect(nhHead).toBeNull()

  const main = await page.$('main.home')
  expect(main).toBeTruthy()
})

// --- Importmap ---

test('importmap stays in head', async ({ page }) => {
  await page.goto('/posts/florentine-floor/')

  const importmap = await page.$('script[type="importmap"]')
  expect(importmap).toBeTruthy()

  const content = await importmap!.evaluate(el => el.textContent)
  expect(content).toContain('browser-dom.js')
})

// --- No leaked scripts ---

test('no element scripts in built output', async ({ page }) => {
  await page.goto('/posts/florentine-floor/')

  const scripts = await page.$$eval('script[type="module"]', els =>
    els.map(el => el.textContent)
  )
  expect(scripts.length).toBe(0)
})
