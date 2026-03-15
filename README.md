# [nathanherald.com](https://nathanherald.com)

Hosted on [Netlify](https://app.netlify.com/sites/flamboyant-northcutt-4eefaf/overview). Posts are committed directly to main and pushed.

## The font

I love and use [Whitney](https://www.typography.com/fonts/whitney/overview).

Book weight for normal text, bold for bold, black for main headlines (h1s).

## Local setup

```sh
bin/install
```

### Development server

```sh
bin/serve
```

## Publishing Posts

```sh
bin/publish-post public/posts/links/my-post/index.md
```

This converts markdown to HTML, adds to RSS, homepage, and archive.

### Pushing

SSH requires Touch ID which doesn't work when using remote control. Use the HTTPS push script instead:

```sh
./bin/git-https-push main
```

### Post Types

- **Blog posts** (⭐️): Regular posts without `externalUrl` in frontmatter
- **Link posts** (🔗): Posts with `externalUrl` field, title becomes clickable link

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

### YouTube Embeds

Use the nocookie domain, plain HTML (no Hugo shortcodes):

```html
<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/{video-id}" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
```

### File Organization

- `public/posts/til/` - Today I Learned posts
- `public/posts/links/` - Link posts to external content
- `public/posts/` - Regular blog posts

Each post should be in its own directory with `index.md` (and `index.html` after conversion).

### Syndication

Follow the POSSE approach: publish on the site first, then optionally syndicate to Mastodon using `toot`:

```sh
toot post "Comment here https://nathanherald.com/posts/links/my-post/"
```

Not every post gets syndicated. Decide per-post.
