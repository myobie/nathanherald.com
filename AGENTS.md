# Agent Instructions

This file contains information for coding agents about how to work with this website project.

## Project Overview

This is a personal website built with plain HTML, CSS, and bash scripts. Pages can be authored two ways:

1. **Source markdown** (`src/`): Markdown files in `src/posts/` are built using a reusable post template (`src/post.html`) with custom elements (`<nh-head>`, `<nh-page>`, `<nh-markdown>`, etc.). `deno task build` uses linkedom to serialize these to fully expanded static HTML in `public/`. Non-HTML assets (markdown, images) are copied from `src/` to `public/` during build.
2. **Direct to public**: Markdown files in `public/` are converted to full HTML with all boilerplate inline via `bin/md2html`. No build step needed.

Files in `public/` that don't have a `src/` counterpart are untouched by the build. Migration is incremental.

## Deploy

**The site is hosted on Netlify, NOT Cloudflare.** `netlify.toml` sets `publish = "public"` and `build = "bin/install"`. Pushing to GitHub `main` (via `./bin/git-https-push main`) auto-triggers a Netlify build and deploy. End-to-end time from push to live is roughly 30–90 seconds.

Cloudflare appears in response headers (`server: cloudflare`, `cf-ray:`) because Cloudflare is the CDN in front of Netlify. The origin is still Netlify — `x-nf-request-id:` in the response confirms it.

The `cloudflare.md` file in the repo root documents an *abandoned* self-hosting-via-cloudflared experiment. Do not treat it as the deploy setup.

## Post Publishing Workflow

### New posts (src/ path, preferred)

Write a markdown file in `src/posts/`, then publish:

```bash
# Just put your markdown in src/posts/my-post/index.md, then:
./bin/publish-post src/posts/my-post/index.md
```

This will build all src/ posts to public/, add to RSS feed, homepage, and posts archive. No per-post HTML file needed, the build uses `src/post.html` as a template and `<nh-markdown>` renders the markdown.

### Manual steps (if needed)

```bash
deno task build
./bin/add-rss-item src/posts/my-post/index.md
./bin/add-to-homepage src/posts/my-post/index.md
./bin/add-to-archive src/posts/my-post/index.md
```

### Quick Publishing (public/ path, still works)

```bash
./bin/publish-post public/posts/til/new-post/index.md
```

This will convert markdown to HTML (with full boilerplate), add to RSS feed, homepage, and posts archive.

## Custom Elements

Server-side custom elements live in `src/elements/`. They expand during the linkedom build and their inline `<script>` tags are removed from the serialized output. In the browser (dev mode), the scripts define the elements and they expand client-side.

- **`nh-head`** - Populates `<head>` with meta tags, title, stylesheets, favicon, RSS link. Self-removes from DOM after running.
- **`nh-page`** - Full post page wrapper: header nav, article with h1/content/date footer, scripts, site footer. Reactive to attribute changes (title, date, external-url). Supports `external-url` for link posts.
- **`nh-markdown`** - Renders markdown to HTML using markdown-it. Supports `src` (URL), `param` (read URL from query param), and `page` (apply frontmatter to nh-head/nh-page). Used by the post template.
- **`nh-header`** - Section header with wave emoji, home link, archive/RSS nav.
- **`nh-footer`** - Site footer with inline SVG logo.
- **`nh-include`** - Fetches an HTML file and includes its content. Resolves relative URLs against the nearest `nh-markdown` source. Used for embedding interactive demos (canvas, etc.) in markdown posts.
- **`nh-archive-list`** - Fetches `posts.json` and renders the grouped-by-month archive list. Used by the archive page (`src/posts/index.html`).
- **`nh-contact-sheet`** - Renders a roll of film from a `roll.json` as a contact sheet: cut strips with sprocket holes, edge printing, frame numbers, and grease pencil marks (circle for 5 stars, X for 1 to 2 stars). Supports `src` or `param`, and `page` (sets title and description, adds `/contact-sheet.css`). `thumb`/`image` may be paths relative to roll.json or absolute URLs (for a CDN), and may be null.
- **`nh-roll-list`** - The photos index (`src/photos/index.html`, at `/photos/`, unlisted for now). Renders `rolls.json`, which the build generates from every roll.json: title, facts line, and one strip of each roll's best frames linking into its contact sheet. Shared roll types, formats and frame markup live in `src/elements/film.ts`; marks in `src/elements/grease-pencil.ts`. Both are mapped in `deno.json` and the page import maps.
- **`nh-ready`** - Test/canary element. Sets `data-ready` attribute on server, detects it in browser.

Each element exposes `static define(registry)` and is registered by the caller (the build creates per-document subclasses for linkedom, the browser uses inline scripts with `customElements`).

Elements are idempotent: if they detect content is already expanded (from server serialization), they remove their script tag and skip rendering.

## Post Types

The system supports two post types, determined by frontmatter:

### Blog Posts
Regular posts without `externalUrl`:
```yaml
---
title: My Blog Post
date: 2025-09-14T22:23:25+02:00
description: A great blog post
---
```

### Link Posts
Posts that link to external content, identified by `externalUrl`:
```yaml
---
title: Cool External Link
date: 2025-09-14T22:23:25+02:00
description: Found this cool thing
externalUrl: https://example.com
---
```

For link posts, the title becomes a clickable link to the external URL.

## Frontmatter Support

Both YAML and TOML frontmatter are supported:

**YAML format:**
```yaml
---
title: Post Title
date: 2025-09-14T22:23:25+02:00
description: Description here
externalUrl: https://example.com
---
```

**TOML format:**
```toml
+++
title = "Post Title"
date = "2025-09-14T22:23:25+02:00"
description = "Description here"
externalUrl = "https://example.com"
+++
```

## File Structure

```
nathanherald.com/
  deno.json                              # import map + tasks (build, dev, test)
  src/
    elements/
      dom.ts                             # linkedom adapter (server)
      browser-dom.js                     # globalThis adapter (browser)
      nh-head.ts, nh-page.ts, etc.       # custom element definitions
      nh-markdown.ts                     # markdown renderer (markdown-it)
      nh-include.ts                      # HTML file includer
      nh-archive-list.ts                 # archive page list from posts.json
    serialize.ts                         # async HTML serializer (two-pass)
    build.ts                             # walks src/, serializes to public/
    dev.ts                               # dev server (port 8787)
    strip-ts-types.ts                    # compiles .ts to .js for browser
    post.html                            # reusable post template
    index.html                           # homepage (hand-authored, uses nh-head only)
    posts/
      index.html                         # archive page (uses nh-archive-list)
      post-name/index.md                 # markdown source (only file needed per post)
      links/post-name/index.md           # link post markdown
  public/                                # served to visitors, output of build
  tests/
    playwright.config.ts
    serialize.test.ts                    # Playwright tests for each element
  bin/
    md2html                              # markdown to HTML (detects src/ vs public/)
    build                                # runs deno task build
    gen-posts-json                       # generates public/posts.json from all post metadata
    publish-post                         # md2html + RSS + homepage + archive
    serve                                # local HTTP server
```

## Testing Commands

```bash
# Build src/ to public/
deno task build

# Run Playwright tests (22 tests covering each custom element)
deno task test

# Dev server (serves src/ with TS type stripping, port 8787)
deno task dev

# Check git status to see what changed
git status
git diff

# Test locally
./bin/serve
```

## Writing Style

- No hyphens (em dashes). Use commas instead.
- No Hugo shortcodes. Plain HTML for embeds.
- Casual, direct tone. Short paragraphs.
- Forward looking and positive. Don't over-romanticize the past or frame the web negatively.

## Image Optimization

For photos and screenshots, convert to JPEG. For logos and line art, keep as PNG and optimize.

**Photos/screenshots (lossy, convert to JPEG):**
```bash
# Convert PNG to JPEG at quality 85 (best balance of size and quality)
magick input.png -quality 85 output.jpg
```

**PNGs that must stay PNG (logos, line art, transparency):**
```bash
# Lossy PNG compression (reduces to 8-bit palette, huge savings)
pngquant --quality=65-80 --output output.png input.png

# Lossless PNG optimization (smaller savings, no quality loss)
oxipng -o 4 input.png
```

Tools: `brew install pngquant oxipng` (ImageMagick already installed via `brew install imagemagick`)

## Film Rolls from Lightroom

Nathan writes posts and takes photos; agents own the code in this repo and don't need his code review.

`bin/lr-roll` (runs on Silber, where the Lightroom cloud library lives) turns a roll of film into `src/photos/rolls/<slug>/roll.json` plus web JPEGs (`NN.jpg` at `--max`, default 1280px, and `NN.thumb.jpg` at 640px). It is read only: it copies the library's index and `previews.db` to a temp dir, deletes them on exit, and never touches originals or RAWs. Images come from Lightroom's already edited previews, or from a folder of JPEGs exported from Lightroom (`--export-dir`).

```bash
bin/lr-roll --suggest --album "Tegernsee Film"     # propose roll splits, writes nothing
bin/lr-roll --album "Tegernsee Film" --from P9250830 --to P9250867 \
  --title Tegernsee --film "Ilford HP5+" --camera "Leica M7" --shot 2026-09 --dry-run
```

- Images live in Cloudflare R2, not git. By default lr-roll uploads `NN.<hash>.jpg` and `NN.thumb.<hash>.jpg` to the `nathanherald-photos` bucket under `rolls/<slug>/` (Nathan's personal Cloudflare account, `639c0fcd0e5bde025f5bd2eb6e70a6b3`) and writes absolute `https://photos.nathanherald.com/...` URLs into roll.json, so only roll.json is committed. The hash in the name means objects are cached as immutable; a re-export uploads new names. Uploads use `npx wrangler@latest` (allowed in `.claude/settings.json`; wrangler must be logged in on Silber). `--local` keeps the old behavior of writing JPEGs beside roll.json.
- Recent film is camera scanned with an Olympus E-M5 II, so `captureDate` is the scan time, not the shot date, and the camera field is the scanner. Film stock and camera are given by hand.
- **Publishing a roll:** Netlify does not run `deno task build` (its build command is `bin/install`), so commit the roll's `src/photos/rolls/<slug>/roll.json` *and* the built `public/photos/rolls/<slug>/index.html` plus `public/photos/index.html`. Revert unrelated build noise in `public/` (tidy version and cache comment lines) before committing.
- The build turns every `src/photos/rolls/**/roll.json` into an `index.html` beside it, using `src/roll.html` and `<nh-contact-sheet>`. Styles live in `public/contact-sheet.css`.
- `bin/gen-sample-roll [frames] [format]` writes a fake roll to `src/photos/rolls/sample/` (gitignored) for checking the layout. Unit tests for the element: `deno task test:unit`.
- `--suggest` guesses are rough. Confirm roll boundaries with Nathan (that's a photo question, not a code one).
- Album names repeat. If a name matches several albums the script lists them and you pass `--album-id`.

## YouTube Embeds

Use the nocookie domain with plain HTML:
```html
<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/{video-id}" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
```

## Pushing Changes

SSH requires Touch ID which doesn't work remotely. Use the HTTPS push script:
```bash
./bin/git-https-push main
```

## Syndication (POSSE)

Publish on the site first, then optionally syndicate to Mastodon:
```bash
toot post "Comment here https://nathanherald.com/posts/links/my-post/"
```
Not every post gets syndicated. Only when asked.

## Useful Tools

- `web-to-markdown <url>`: Fetches web pages using a real WebKit view. Use when WebFetch can't load JS-heavy pages (YouTube, Threads, etc).
- `toot`: CLI for posting to Mastodon. Authenticated as myobie@indieweb.social.

## Important Notes

- Always read existing posts to understand the site's style and conventions
- The homepage shows the latest 5 posts only
- Link posts get the link emoji, blog posts get the star emoji
- RSS feed is automatically updated with proper URLs
- All HTML is tidied automatically with the configured .tidyrc settings
- `bin/md2html` auto-detects `src/` vs `public/` paths and outputs the appropriate format
