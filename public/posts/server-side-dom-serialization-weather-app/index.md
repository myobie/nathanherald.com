+++
title = "Server-side DOM serialization with a weather app example"
date = "2025-01-02T12:00:00+01:00"
description = "A practical demonstration of server-side DOM serialization using custom elements, built with Bun, Deno, and Cloudflare Workers"
+++

After exploring [server-side rendering and DOM serialization][web-components-4] in my Web Components series, I wanted to build a practical example that demonstrates these concepts in action. The result is a weather app that showcases server-side DOM serialization across multiple JavaScript runtimes.

➡️ **[See it live at weather.myobie.wtf](https://weather.myobie.wtf/)** | **[View source on GitHub](https://github.com/myobie/serialized-weather)**

## The Core Idea

This weather app demonstrates building a DOM on the server, serializing it, and sending it back as the initial HTML response. The same DOM gets deserialized and becomes fully interactive in the browser using the exact same custom elements and JavaScript code.

The magic happens with [`linkedom`](https://github.com/WebReflection/linkedom), which acts as a server-side DOM implementation. For 99% of my custom element code, linkedom requires no changes from what works in browsers—it's like having another browser target for your components.

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

Uses import maps and native fetch for a clean, standards-based approach. Shows how modern JavaScript runtimes can handle server-side custom elements elegantly.

### Bun Implementation  

Leverages Bun's speed and Node.js compatibility while maintaining the same serialization patterns. Demonstrates how the approach scales across different runtime performance characteristics.

### Cloudflare Worker

Runs at the edge and Proves that server-side DOM serialization works even in serverless, resource-constrained environments.

### Specialized Variants

- **Client-only version**: Pure SPA by skipping server-side element registration
- **Server-only version**: Traditional server-rendered app without client-side JavaScript, only server serialization

## Technical Challenges and Solutions

The main hurdle with server-side custom elements is that they must inherit from `HTMLElement`, which normally only exists in browsers. The repository explores several workarounds:

1. **Mock HTMLElement**: Create minimal server-side implementations
2. **Runtime detection**: Different code paths for server vs. browser
3. **Element lifecycle management**: Proper handling of `connectedCallback` in server environments
4. **Serialization strategies**: Ensuring shadow DOM and custom element state transfer correctly

## Building on Previous Work

This weather app serves as the practical companion to the theoretical foundations I laid out in [Web Components Part 4][web-components-4]. Where that post explored the concepts and research behind server-side custom element serialization, this project shows those ideas implemented across real deployment scenarios.

The combination of both posts provides a complete picture: the research and theory, followed by production-ready implementations that you can run and deploy today.

---

*Try the [live demo](https://weather.myobie.wtf/) and explore the [source code](https://github.com/myobie/serialized-weather) to see server-side DOM serialization in action.*

[web-components-4]: /posts/web-components-4/