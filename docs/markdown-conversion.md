# Markdown to HTML Conversion

Convert markdown files to HTML with site template:
```bash
bin/md2html path/to/file.md              # Creates index.html in same dir
bin/md2html path/to/file.md output.html  # Specify output location
```

## Frontmatter (optional)
```yaml
---
title: Page Title
date: 2025-08-19
description: SEO description
---
```

Uses pandoc (GitHub Flavored Markdown). Output is tidied automatically.

## Example
```bash
bin/md2html public/posts/new-post/content.md
# Creates: public/posts/new-post/index.html
```