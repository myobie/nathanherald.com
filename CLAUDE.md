# Claude Code Configuration

This file contains information for Claude Code about how to work with this website project.

## Project Overview

This is a personal website built with plain HTML, CSS, and bash scripts. No build tools like Hugo or Jekyll - just markdown-to-HTML conversion and manual HTML editing.

## Post Publishing Workflow

### Quick Publishing
To publish a new post, use the master script:
```bash
./bin/publish-post public/posts/til/new-post/index.md
```

This will:
1. Convert markdown to HTML
2. Add to RSS feed  
3. Add to homepage (latest 5 posts)
4. Add to posts archive

### Manual Steps
If you need to run individual steps:

```bash
# Convert markdown to HTML
./bin/md2html public/posts/til/new-post/index.md

# Add to RSS feed
./bin/add-rss-item public/posts/til/new-post/index.md

# Add to homepage
./bin/add-to-homepage public/posts/til/new-post/index.md

# Add to archive
./bin/add-to-archive public/posts/til/new-post/index.md
```

## Post Types

The system supports two post types, determined by frontmatter:

### Blog Posts (⭐️)
Regular posts without `externalUrl`:
```yaml
---
title: My Blog Post
date: 2025-09-14T22:23:25+02:00
description: A great blog post
---
```

### Link Posts (🔗)
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

Posts should be organized as:
- `public/posts/til/post-name/index.md` - TIL (Today I Learned) posts
- `public/posts/links/post-name/index.md` - Link posts  
- `public/posts/post-name/index.md` - Regular blog posts

## Testing Commands

After publishing, run these to verify:
```bash
# Check git status to see what changed
git status
git diff

# Test locally
./bin/serve

# Build/tidy HTML
./bin/build
```

## Important Notes

- Always read existing posts to understand the site's style and conventions
- The homepage shows the latest 5 posts only
- Link posts get 🔗 emoji, blog posts get ⭐️ emoji
- RSS feed is automatically updated with proper URLs
- All HTML is tidied automatically with the configured .tidyrc settings