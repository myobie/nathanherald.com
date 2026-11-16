// lr-meta: helper for bin/lr-roll. Reads `sqlite3 -json` rows of
// { id, h } (Lightroom asset doc id and hex of its MessagePack content) on
// stdin and prints { [assetId]: { desc, text } } as JSON on stdout.
//
//   desc: Lightroom's caption (xmp.dc.description). Nathan uses it as
//         "Film stock • format • lab".
//   text: the caption plus the accessibility alt text and extended
//         description (xmp.iptcCore.AltTextAccessibility and
//         ExtDescrAccessibility), one per line. Lines starting with ">" in
//         any of them are a comment on that frame.

import { decode } from 'jsr:@std/msgpack@1'

type Row = { id: string; h: string }

// XMP text is either a plain string or a language alternative object.
// deno-lint-ignore no-explicit-any
function text(v: any): string {
  if (typeof v === 'string') return v
  if (v && typeof v === 'object') {
    const s = v['x-default'] ?? Object.values(v).find((x) => typeof x === 'string')
    if (typeof s === 'string') return s
  }
  return ''
}

const input = await new Response(Deno.stdin.readable).text()
const rows: Row[] = input.trim() ? JSON.parse(input) : []
const out: Record<string, { desc: string; text: string }> = {}

for (const { id, h } of rows) {
  try {
    const bytes = Uint8Array.from(h.match(/../g) ?? [], (x) => parseInt(x, 16))
    // deno-lint-ignore no-explicit-any
    const xmp: any = (decode(bytes) as any)?.xmp ?? {}
    const desc = text(xmp.dc?.description).trim()
    const all = [
      desc,
      text(xmp.iptcCore?.AltTextAccessibility),
      text(xmp.iptcCore?.ExtDescrAccessibility),
    ].map((s) => s.trim()).filter(Boolean).join('\n')
    if (all) out[id] = { desc, text: all }
  } catch {
    // unreadable doc: nothing to say about it
  }
}

console.log(JSON.stringify(out))
