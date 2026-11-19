// Link preview cards (og:image). bin/gen-og renders an og-card.png (posts) or
// og-card.jpg (film rolls) beside a page's index.html and records it in
// public/og-cards.json. Pages keep pointing at the generic /og.png until a card
// exists; posts that set `image:` in their frontmatter keep their own image.

export const SITE = 'https://nathanherald.com'
export const MANIFEST = 'public/og-cards.json'

export type OgCard = { file: string; hash: string }
export type OgManifest = Record<string, OgCard>

const DEFAULT_IMAGE = /^(?:https:\/\/nathanherald\.com)?\/og\.png$/
const OG_IMAGE_META = /<meta\s+content="([^"]*)"\s+property="og:image"\s*\/?>/

export function cardUrl(dir: string, card: OgCard): string {
  return `${SITE}/${dir}/${card.file}?v=${card.hash.slice(0, 8)}`
}

/** Point a page's og:image at its card, unless the page chose its own image. */
export function applyOgCard(html: string, dir: string, manifest: OgManifest): string {
  const card = manifest[dir]
  if (!card) return html
  return html.replace(OG_IMAGE_META, (tag, current: string) => {
    const isOurs = DEFAULT_IMAGE.test(current) || current.includes('/og-card.')
    return isOurs ? tag.replace(current, cardUrl(dir, card)) : tag
  })
}

export async function readManifest(root: string): Promise<OgManifest> {
  try {
    return JSON.parse(await Deno.readTextFile(`${root}/${MANIFEST}`))
  } catch {
    return {}
  }
}
