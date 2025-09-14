# [nathanherald.com](https://nathanherald.com)

I'm using [Netlify](https://app.netlify.com/sites/flamboyant-northcutt-4eefaf/overview) to host this website.

## Flow

Every new post should be a pull-request, will deploy a preview website to netlify, and merging will deploy the production site.

## The font

I love and use [Whitney](https://www.typography.com/fonts/whitney/overview).

I use the book weight for normal text, the bold weight for, uh, bold, and the black weight for main headlines (h1s). I'll be honest, _my type scale isn't really sensible at the moment._ I'll eventually figure that out.

## Local setup

```sh
bin/install
```

### Development server

```sh
bin/serve
```

## Publishing Posts

### Quick Method

To publish a new post (markdown to HTML + add to homepage, archive, RSS):

```sh
bin/publish-post public/posts/til/strudel/index.md
```

### Manual Steps

If you prefer to run each step individually:

```sh
# 1. Convert markdown to HTML
bin/md2html public/posts/til/strudel/index.md

# 2. Add to RSS feed
bin/add-rss-item public/posts/til/strudel/index.md

# 3. Add to homepage (latest 5 posts)
bin/add-to-homepage public/posts/til/strudel/index.md

# 4. Add to posts archive
bin/add-to-archive public/posts/til/strudel/index.md
```

### Post Types

The system automatically detects post types:

- **Blog posts** (⭐️): Regular posts without `externalUrl` in frontmatter
- **Link posts** (🔗): Posts with `externalUrl` field - title becomes clickable link

### Frontmatter Formats

Both YAML (`---`) and TOML (`+++`) frontmatter are supported:

```yaml
---
title: TIL about strudel
date: 2025-09-14T22:23:25+02:00
description: An amazing music programming tool
externalUrl: https://strudel.cc/workshop/getting-started/#examples
---
```

### File Organization

- `public/posts/til/` - Today I Learned posts
- `public/posts/links/` - Link posts to external content  
- `public/posts/` - Regular blog posts

Each post should be in its own directory with `index.md` (and `index.html` after conversion).
