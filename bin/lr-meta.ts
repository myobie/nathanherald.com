// lr-meta: helper for bin/lr-roll. Reads `sqlite3 -json` rows of
// { id, h } (Lightroom asset doc id and hex of its MessagePack content) on
// stdin and prints a JSON object { [assetId]: description } on stdout.
//
// The description is Lightroom's caption (xmp.dc.description). Nathan uses
// it as "Film stock • format • lab", and lines starting with ">" are a
// comment on that frame.

import { decode } from 'jsr:@std/msgpack@1'

type Row = { id: string; h: string }

const input = await new Response(Deno.stdin.readable).text()
const rows: Row[] = input.trim() ? JSON.parse(input) : []
const out: Record<string, string> = {}

for (const { id, h } of rows) {
  try {
    const bytes = Uint8Array.from(h.match(/../g) ?? [], (x) => parseInt(x, 16))
    // deno-lint-ignore no-explicit-any
    const doc: any = decode(bytes)
    const d = doc?.xmp?.dc?.description
    const s = typeof d === 'string' ? d : d?.['x-default']
    if (typeof s === 'string' && s.trim()) out[id] = s
  } catch {
    // unreadable doc: no description
  }
}

console.log(JSON.stringify(out))
