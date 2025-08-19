# RSS Feed Management

Add or update RSS items from markdown files:
```bash
bin/add-rss-item public/ai/rss.md        # GUID: https://nathanherald.com/ai/
bin/add-rss-item public/posts/foo/rss.md # GUID: https://nathanherald.com/posts/foo/
```

## How it works
- Generates deterministic GUID from file path
- Updates existing items with same GUID (no duplicates)
- Uses file modification time as pubDate
- Validates XML before saving

## Workflow
1. Write markdown file (e.g., `public/ai/rss.md`)
2. Run `bin/add-rss-item` on the file
3. RSS feed updates with new/updated item

Title comes from first H1 in markdown. HTML is properly escaped for XML.