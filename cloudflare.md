> ⚠️ **ABANDONED EXPERIMENT — NOT the live deploy.** This site is hosted on Netlify (see `netlify.toml` and the Deploy section in `CLAUDE.md`). This file documents an unused self-hosting-via-cloudflared idea that was explored but never shipped. Do not treat it as the deploy setup.

# Self-hosting with cloudflared

## Overview

Serve the site from this MacBook Pro using cloudflared. Cloudflare caches everything at the edge so the laptop doesn't need to be online for every request.

## 1. Install and configure cloudflared

```bash
brew install cloudflared
cloudflared tunnel login
cloudflared tunnel create nathanherald
```

This creates a tunnel and gives you a tunnel ID. Add a DNS CNAME in the Cloudflare dashboard pointing your domain to `<tunnel-id>.cfargotunnel.com`.

Create `~/.cloudflared/config.yml`:

```yaml
tunnel: <tunnel-id>
credentials-file: /Users/myobie/.cloudflared/<tunnel-id>.json

ingress:
  - hostname: nathanherald.com
    service: http://localhost:8080
  - service: http_status:404
```

## 2. Serve the site locally

Use any static file server on port 8080. For example:

```bash
cd public && python3 -m http.server 8080
```

Or update `bin/serve` to use port 8080.

## 3. Cache headers

Configure your static file server to send this header on all responses:

```
Cache-Control: public, s-maxage=900, stale-while-revalidate=86400
```

- `s-maxage=900`: Cloudflare serves from cache for 15 minutes
- `stale-while-revalidate=86400`: after 15 min, serve stale immediately and fetch fresh copy from origin in the background. This window lasts 24 hours.

Visitors always get a fast response. Updates appear within ~15 minutes.

## 4. Cloudflare dashboard settings

- **Caching > Configuration**: set caching level to "Standard"
- **Caching > Configuration > Always Online**: enable this as a last resort fallback when the laptop is down for extended periods
- **Caching > Cache Rules**: optionally create a rule to cache everything for `nathanherald.com/*` if the default behavior isn't catching all pages

## 5. Run the tunnel

```bash
cloudflared tunnel run nathanherald
```

To run as a background service:

```bash
sudo cloudflared service install
```

This launches on boot automatically.

## 6. Fonts

Copy fonts into a local directory (e.g. `public/fonts/`) instead of serving from S3. Either git-ignore the font files or keep them local-only. Update CSS to reference `/fonts/` instead of the S3 bucket URL.

## 7. Testing

```bash
# Check tunnel is running
cloudflared tunnel info nathanherald

# Check cache status (look for cf-cache-status header)
curl -sI https://nathanherald.com/ | grep -i cf-cache

# cf-cache-status values:
#   HIT = served from cache
#   MISS = fetched from origin, now cached
#   EXPIRED = was cached, fetched fresh from origin
#   DYNAMIC = not cached (check your cache rules)

# Test stale-while-revalidate by stopping the local server,
# then requesting a page. It should still serve from cache.
```

## 8. After publishing a post

Nothing special needed. The cache will update within 15 minutes via stale-while-revalidate. If you want it faster, purge via the API:

```bash
curl -X POST "https://api.cloudflare.com/client/v4/zones/<zone-id>/purge_cache" \
  -H "Authorization: Bearer <api-token>" \
  -H "Content-Type: application/json" \
  --data '{"purge_everything": true}'
```

But this is optional. 15 minutes is probably fine.
