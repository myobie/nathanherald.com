# Claude Code Configuration

This file contains information for Claude Code about how to work with this website project.

## Project Overview

This is a personal website built with plain HTML, CSS, and bash scripts. Pages can be authored two ways:

1. **Source markdown** (`src/`): Markdown files in `src/posts/` are built using a reusable post template (`src/post.html`) with custom elements (`<nh-head>`, `<nh-page>`, `<nh-markdown>`, etc.). `deno task build` uses linkedom to serialize these to fully expanded static HTML in `public/`. Non-HTML assets (markdown, images) are copied from `src/` to `public/` during build.
2. **Direct to public**: Markdown files in `public/` are converted to full HTML with all boilerplate inline via `bin/md2html`. No build step needed.

Files in `public/` that don't have a `src/` counterpart are untouched by the build. Migration is incremental.

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
