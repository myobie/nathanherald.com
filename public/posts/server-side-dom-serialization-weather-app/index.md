---
title: Server-side DOM serialization with a weather app example
date: 2025-09-01T12:00:00+02:00
description: A practical demonstration of server-side DOM serialization using custom elements, built with Bun, Deno, and Cloudflare Workers
---

After exploring [server-side rendering and DOM serialization](/posts/web-components-4/) in my Web Components series, I wanted to build a practical example that demonstrates these concepts in action. The result is a weather app that showcases server-side DOM serialization across multiple JavaScript runtimes.

➡️ **[See it live at weather.myobie.wtf](https://weather.myobie.wtf/)** | **[View source on GitHub](https://github.com/myobie/serialized-weather)**

_Questions about the implementation? [Find me on Mastodon](https://indieweb.social/@myobie) to discuss!_

## The Core Idea

This weather app demonstrates building a DOM on the server, serializing it, and sending it back as the initial HTML response. The same DOM gets deserialized and becomes fully interactive in the browser using the exact same custom elements and JavaScript code.

The magic happens with [`linkedom`](https://github.com/WebReflection/linkedom), which acts as a server-side DOM implementation. Here's the basic flow:

```javascript
import { parseHTML } from 'linkedom'
import { serializeAsync } from './serialize.ts'

// Create a server-side DOM
const { document, customElements } = parseHTML(`
  <!doctype html>
  <html><body>
    <weather-app latitude="52.5" longitude="13.4"></weather-app>
  </body></html>
`)

// Define your custom elements on the server
customElements.define('weather-app', WeatherAppElement)

// Let elements render and fetch data
await new Promise(resolve => setTimeout(resolve, 100))

// Serialize the fully-rendered DOM
const html = await serializeAsync(document.documentElement)
return new Response(`<!doctype html>${html}`)
```

The key insight is that you must define your custom elements in both environments: once on the server using linkedom's `customElements` registry, and again in the browser using the native `customElements`. For 99% of my custom element code, linkedom requires no changes from what works in browsers—it's like having another browser target for your components.

## Progressive Enhancement in Action

The app implements true progressive enhancement with intelligent fallbacks:

- **Server-side rendering**: Custom elements run on the server and serialize their initial state
- **Timeout protection**: If server requests take too long, the page renders immediately
- **Client-side recovery**: The browser takes over and retries any failed server requests
- **Graceful degradation**: Works as either a pure SPA or pure server-rendered app

This approach ensures users always get a functional experience, regardless of network conditions or server performance.

## Multi-Runtime Implementation

The repository demonstrates the same serialization approach across different environments:

### Deno Implementation

Uses import maps and native fetch for a clean, standards-based approach. The [Deno version](https://github.com/myobie/serialized-weather/tree/main/deno) shows how modern JavaScript runtimes can handle server-side custom elements elegantly.

### Bun Implementation  

The [Bun implementation](https://github.com/myobie/serialized-weather/tree/main/bun) leverages Bun's speed and Node.js compatibility while maintaining the same serialization patterns. Demonstrates how the approach scales across different runtime performance characteristics.

### Cloudflare Worker

The [Worker version](https://github.com/myobie/serialized-weather/tree/main/worker) runs at the edge with sub-100ms response times. Here's how it sets up server-side rendering:

```javascript
const linkie = parseHTML(code, {
  location: url,
  isServer: true,
  cfGeo: { latitude: request.cf?.latitude, longitude: request.cf?.longitude, nearbyName },
});

// Define custom elements on the server
const KEnvContextElement = class extends EnvContextElement {};
linkie.customElements.define(KEnvContextElement.defaultName, KEnvContextElement);

// Serialize the rendered DOM
const result = await serializeAsync(linkie.document.documentElement);
return new Response(`<!doctype html>${result}`, {
  headers: { 'content-type': 'text/html' },
});
```

### Specialized Variants

- **[Client-only version](https://github.com/myobie/serialized-weather/tree/main/deno-client-only)**: Pure SPA by skipping server-side element registration
- **[Server-only version](https://github.com/myobie/serialized-weather/tree/main/deno-server-only)**: Traditional server-rendered app without client-side JavaScript

## Technical Challenges and Solutions

The main hurdle with server-side custom elements is that they must inherit from `HTMLElement`, which normally only exists in browsers. Here's how the weather app solves this:

### Isomorphic HTMLElement Handling

The key insight is creating environment-specific DOM exports. On the server, we use linkedom's `HTMLElement`:

```javascript
// linkedom-dom.ts (server)
import { parseHTML } from 'npm:linkedom'
const doc = parseHTML('<!doctype html><div></div>')
export const { customElements, Event, HTMLElement } = doc
```

While in the browser, we use the native `HTMLElement`:

```javascript
// browser-dom.js (client)
const c = globalThis.customElements
const E = Event
const HE = HTMLElement
export { c as customElements, E as Event, HE as HTMLElement }
```

[View the complete isomorphic setup →](https://github.com/myobie/serialized-weather/blob/main/deno/linkedom-dom.ts)

### Custom Serialization Strategy

The app includes [a custom async serializer](https://github.com/myobie/serialized-weather/blob/main/deno/serialize.ts) that handles:

- **Element lifecycle management**: Waits for custom elements to be "ready" before serializing
- **Attribute handling**: Sorts attributes for consistent output  
- **Timeout protection**: Prevents slow elements from blocking the entire response
- **Shadow DOM avoidance**: Intentionally keeps serialization simple by avoiding shadow DOM complexity

This approach ensures that server-rendered custom elements maintain their state when the page loads in the browser.

## Building on Previous Work

This weather app serves as the practical companion to the theoretical foundations I laid out in [Web Components Part 4](/posts/web-components-4/). Where that post explored the concepts and research behind server-side custom element serialization, this project shows those ideas implemented across real deployment scenarios.

The combination of both posts provides a complete picture: the research and theory, followed by production-ready implementations that you can run and deploy today.

---

*Try the [live demo](https://weather.myobie.wtf/) and explore the [source code](https://github.com/myobie/serialized-weather) to see server-side DOM serialization in action.*

Have thoughts on this approach or questions about the implementation? [Find me on Mastodon](https://indieweb.social/@myobie) — I'd love to discuss server-side custom elements and DOM serialization strategies!