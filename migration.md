# Post Migration Status

## Summary

| Category | Count |
|---|---|
| Easy (plain GFM, migrate directly) | 98 |
| Hard (Hugo shortcodes) | 107 |
| HTML-only (no markdown at all) | 2 |
| Already in src/ | 4 |
| **Total** | **211** |

## Already Migrated to src/

- `posts/florentine-floor/` (blog post)
- `posts/links/olmotrace/` (link post)
- `posts/links/the-killer-trailer/` (link post, YouTube iframe)
- `posts/coding-agents-and-agency/` (blog post, long)

## HTML-Only (no markdown source)

- `public/posts/legacy/build-your-mvp-today-b31192e1c920/`
- `public/posts/removing-hugo/`

## Hard Posts: Shortcode Breakdown

The 107 posts with Hugo shortcodes break down into mostly mechanical fixes.

### `{{<fig>}}` (73 files)

Replace with `<figure><img>` HTML. Some have a `link` attribute that wraps the image in an anchor, and some have captions.

Posts using only `fig`:
- `posts/a-ryokan/`
- `posts/backup-your-photos/`
- `posts/gartenstraße/`
- `posts/github-profile-readme/`
- `posts/going-public/`
- `posts/john-gannam/`
- `posts/mid-day-sunny-photo/`
- `posts/updated-the-font/`
- `posts/web-components-2/`
- `posts/travel-songs/`
- `posts/legacy/a-newsletter/`
- `posts/legacy/be-a-good-programmer/`
- `posts/legacy/cloudkit/`
- `posts/legacy/design-a-minimal-roadmap-instead-of-building-an-mvp/`
- `posts/legacy/elixirconf-eu-2017-in-barcelona/`
- `posts/legacy/how-to-install-the-macos-catalina-beta-alongside-mojave/`
- `posts/legacy/how-we-allow-any-request-to-be-safely-repeated-at-anytime-for-wunderlist/`
- `posts/legacy/i-still-dont-know-how-to-use-a-debugger/`
- `posts/legacy/im-getting-engagement/`
- `posts/legacy/karhu-synchron-classic/`
- `posts/legacy/one-week-with-the-atom-text-editor/`
- `posts/legacy/puma-rs-0/`
- `posts/legacy/swift-already-has-a-result-type/`
- `posts/legacy/the-cost-of-education/`
- `posts/legacy/twenty-second-postmortem/`
- `posts/links/a-winged-victory-for-the-sullen/`
- `posts/links/cargobox/`
- `posts/links/gaea/`
- `posts/links/galileo-first-drawings-of-the-moon/`
- `posts/links/gawthornes-hut/`
- `posts/links/klim-type-foundry/`
- `posts/links/mighty-vibe/`
- `posts/links/nathan-walsh/`
- `posts/links/notes-art/`
- `posts/links/olamide-ogunade/`
- `posts/links/otis-kwame-kye-quaicoe/`
- `posts/links/petrichor-by-jean-jullien/`
- `posts/links/polaroid-lab/`
- `posts/links/possibly-maybe/`
- `posts/links/research-notes/`
- `posts/links/the-great-wave/`
- `posts/links/tiny-sculptures/`
- `posts/links/urth-explorer-filter-kit/`
- `posts/links/vintage-omega-apple-sneakers/`
- `posts/links/where-is-webb/`
- `posts/til/how-to-allow-notifications-when-recording-the-screen/`
- `posts/til/less-dash-s/`
- `posts/til/vim-spellcheck/`

### `{{<raw>}}` (43 files)

Just strip the `{{<raw>}}`/`{{</raw>}}` wrapper tags, keep inner HTML as-is.

Posts using only `raw`:
- `posts/digital-card-catalog/`
- `posts/reactive-dom-nodes-and-templates-for-custom-elements/`
- `posts/your-metrics-might-be-lying-to-you/`
- `posts/til/gaia/`
- `posts/links/29-automata/`
- `posts/links/akiko-takakura/`
- `posts/links/ana-vidovic-classical-guitar/`
- `posts/links/backwater-blues/`
- `posts/links/beogram-4000c/`
- `posts/links/casiopea-mint-jams/`
- `posts/links/cassette-mixing/`
- `posts/links/cherimoya-jordan-ward/`
- `posts/links/chompi/`
- `posts/links/dive-olivia-dean/`
- `posts/links/dont-be-a-sucker/`
- `posts/links/dreamy-photography-settings/`
- `posts/links/dublin-goth-new-wave-movement-1989/`
- `posts/links/fazerdaze-bigger/`
- `posts/links/frods/`
- `posts/links/gods-country-trailer/`
- `posts/links/hydraulic-press-interpretive-dance/`
- `posts/links/inside-out-furniture-making/`
- `posts/links/jordan-ward-tiny-desk/`
- `posts/links/largest-known-prime-number/`
- `posts/links/little-sims-no-thank-you/`
- `posts/links/living-alone-in-siberian-forest-for-20-years/`
- `posts/links/men-i-trust/`
- `posts/links/modular-office-unit/`
- `posts/links/nation-of-language-live/`
- `posts/links/nopia/`
- `posts/links/olafur-arnalds-hafursey/`
- `posts/links/patch-notes/`
- `posts/links/q-today/`
- `posts/links/robohands-green/`
- `posts/links/scary-pockets-rich-girl/`
- `posts/links/takako-mamiya-love-trip/`
- `posts/links/the-circle/`
- `posts/links/the-copyist/`
- `posts/links/the-dark-forest/`
- `posts/links/this-video-has-___-views/`
- `posts/links/toro/`
- `posts/links/viking-trailer/`
- `posts/links/why-rappers-stopped-writing/`

### `fig` + `raw` combined (6 files)

- `posts/before-the-bf-there-was-the-t/`
- `posts/eurorack-stereo-mute/`
- `posts/links/1984/`
- `posts/links/gpt4/`
- `posts/links/james-web-space-telescope/`
- `posts/links/oslo-transit-diagram/`

### `{{<relref>}}` / `{{<ref>}}` (5 files)

Need manual URL replacement since Hugo resolved these at build time.

- `posts/legacy/change-as-little-as-possible-to-fix-a-problem/` -- `{{<relref "be-a-good-programmer">}}`
- `posts/legacy/refactor-only-when-you-have-some-sort-of-tests/` -- `{{<relref "be-a-good-programmer">}}`
- `posts/legacy/use-technologies-the-rest-of-your-team-is-motivated-to-use/` -- `{{<relref "be-a-good-programmer">}}`
- `posts/legacy/document-semi-wacky-wacky-things/` -- `{{<relref "be-a-good-programmer">}}`
- `posts/moved-off-medium/` -- `{{< ref "posts" >}}`

### Rare/unique shortcodes (5 files)

Each needs individual attention.

- `posts/web-components-4/` -- `{{<video src="..." type="...">}}` (2 video embeds)
- `posts/legacy/on-queueing/` -- `{{<youtube IPxBKxU8GIQ>}}`
- `posts/reminded-of-the-past/` -- `{{<row-of-photos>}}` + `{{<fig>}}`
- `posts/the-man-from-laramie/` -- `{{<details summary="...">}}` + `{{<fig>}}`
- `posts/links/wilhelm-scream/` -- `{{<audio src="scream.mp3">}}`
