+++
title = "Learning about Web Components: Part 4 – Researching pre-rendering custom elements and/or SSR"
date = "2023-09-17T21:13:50+02:00"
+++

Now that I’m starting to get a handle on building custom elements which can do things dynamically in the browser, I also want to see how difficult it would be to implement [“server side rendering”][ssr] for my custom elements. There is a noticeable delay when first loading my photo grid demo – the browser must download, parse, and run my javascript, instantiate my custom elements, they then do a simulated database query, and then finally the image grid can render. 

You can see the delay in this screen recording:

{{<video src="prev-demo.mov" type="video/mp4">}}
{{</video>}}

I’d prefer if the HTML returned from the server could already include the first version of the image grid, then the javascript could take over from there once it’s ready in the browser.

The announcement of [Declarative Shadow DOM in WebKit][1] and an [update about support in Chromium][2] are what really got me started looking into web components again in the first place. The promise of being able to serve HTML which can be shown without any javascript means web components are finally ready for use 💪 Firefox has announced they also will be implementing the agreed upon declarative API, so the future is finally here.

The first project I found which talked about declarative shadow DOM + SSR was [ocean][] – which provides “web component server-side rendering” in deno or a service worker. [`lit-labs/ssr`][lit-labs] and [astro’s SSR][astro] are also very cool libraries. 

But those never really clicked for me. None of them seem to be both fully up-to-date with the latest specification + able to render any custom element I might build. 

It clicked for me today when I was rereading the [two][1] [announcements][2] and I finally noticed something I hadn’t noticed before.

From [the Chromium page][2]:

> Because the contents of a **serialized** Declarative Shadow Root are entirely static…

From [the WebKit page][1]:

> In the following example, the outer template element contains an instance of some-component element and its shadow tree content is **serialized** using declarative shadow DOM.

Both pages mention that declarative shadow DOM is supposed to be the serialized version of a living shadow root. This made more sense when I found an older page talking about [a not-yet-standardized and chromium-only built-in function to serialize a custom element `getInnerHTML()`][serialization]. The example shows:

```js
const html = element.getInnerHTML({ includeShadowRoots: true });
```

_I am more interested in more of an `outerHTML` equivalent, but still I can work with this._

Calling `getInnerHTML()` on the `<image-grid>` in the [demo page from part 3 of this series][demo] in Chrome returns:

```html
<image-cell record-id="5">
  <!-- this shadowroot attribute is old and deprecated, see below -->
  <template shadowroot="open">
    <style>
      :host {
        align-items: center;
        display: flex;
        flex-direction: column;
        height: 100%;
        justify-content: center;
        width: 100%;
      }

      img {
        max-width: 100%;
        width: auto;
        height: auto;
        object-fit: contain;
        overflow: hidden;
      }

      .name {
        display: block;
        min-height: min-content;
        text-align: center;
      }
    </style>
    <img alt="Photo of a lot of differently colored tulips" src="./five.jpg" width="1000" height="662">
    <p class="name">five.jpg</p>
  </template>
</image-cell>
<image-cell record-id="4">
  <!-- this shadowroot attribute is old and deprecated, see below -->
  <template shadowroot="open">
    <style>
      :host {
        align-items: center;
        /* ... */
      }

      /* ... */
    </style>
    <img alt="Photo through a hexagonal window into a tea room on a sunny day" src="./four.jpg" width="662" height="1000">
    <p class="name">four.jpg</p>
  </template>
</image-cell>
<!-- ... -->
<template shadowrootmode="open">
  <style>
    :host {
      box-sizing: border-box;
      display: grid;
      gap: 16px;
      grid-template-columns: 1fr 1fr;
      margin: 0 auto;
      max-width: 600px;
      padding: 20px;
    }
  </style>
  
  <slot></slot>
</template>
```

The **first thing** to unpack here is: Chrome’s non-yet-standardized `getInnerHTML()` function is returning `<template>` elements with the old and deprecated `shadowroot` attribute. So this function isn’t going to work out-of-the-box for me. 

Still, it never occurred to me that the DOM might know how to serialize itself. That SSR needn’t be so much about rendering templates or munging strings – instead be about building up a DOM to a state, then serializing it in a fully presentable way.  This feels _simpler_ and _easier_ for me to think about now.

The **second thing** to notice is: when we serialize a shadow root, we must include a full template every time. That means if we have scoped `<style>`s in the `<template>`, they will be repeated over and over for every instance of the custom element. We could handle this by extracting the CSS to a file and `@import`ing it if we cared about optimizing things. 

The [Chrome page][2 css] says we don’t have to worry:

> Styles specified this way are also highly optimized: if the same stylesheet is present in multiple Declarative Shadow Roots, it is only loaded and parsed once. The browser uses a single backing `CSSStyleSheet` that is shared by all of the shadow roots, eliminating duplicate memory overhead.

The **third thing** to notice is: our custom element will have a `shadowRoot` before our code calls `attachShadow()`. We don’t technically have to worry about this: calling `attachShadow()` will clear and return the existing `shadowRoot` which was created by the HTML parser when it found the `<template>` tag in our HTML.

From this information, I figured I could quickly build my own serializer which outputs the up-to-date `<template shadowrootmode=open>` attribute and works more like `outerHTML`.

I found a [“`getInnerHTML()` polyfill” written by `@developit`][polyfill] (who works on preact and [I follow on mastodon][masto]). It’s a bit terse and took a bit for me to grasp, but it’s nice to see that it can be a really short and simple function.

[Here is my version][my gist]. It’s a very quick draft which works for me in all the current major browsers. It won’t work for every use case and isn’t ready for production… it is a proof-of-concept though.

Here is the output from my serializer of the `<image-grid>` custom element from the previous demo page:

```html
<image-grid aria-live="polite" role="region" aria-label="Image grid">
  <image-cell record-id="1">
    <template shadowrootmode="open">
      <style>
        /* ... */
      </style>

      <img alt="Photo of a building on a sunny day" src="./one.jpg" width="1000" height="838">
      <p class="name">one.jpg</p>
    </template>
  </image-cell>
  <image-cell record-id="4">
    <!-- ... -->
  </image-cell>
  <!-- ... -->
  <template shadowrootmode="open">
    <style>
      /* ... */
    </style>

    <slot></slot>
  </template>
</image-grid>
```

OK! I copied and pasted the serialized html from the browser’s console to a new `demo-serialized.html` file, I did some quick hacking to make the components check if the `shadowRoot` already exists, and now I have an example of what the resulting HTML could be like if I could do the serialization on the server.

I recorded a screencast of the page loading now, which is basically immediate:

{{<video src="demo-ssr.mov" type="video/mp4">}}
{{</video>}}

The javascript kicks in and the images continue to re-sort every 10 seconds, just like before.

## What’s next?

I don’t yet know how to run the serializer on the server – maybe one of those [“mock DOM libraries”][mock dom] could make it all work out. When I get some free time I’ll dive into that.

If you have any feedback about any of this, if I made any mistakes, or if you just want to chat about web components or anything else, then [find me on mastodon](https://indieweb.social/@myobie) 👋

[ssr]: https://en.wikipedia.org/wiki/Server-side_scripting
[ocean]: https://github.com/matthewp/ocean
[1]: https://webkit.org/blog/13851/declarative-shadow-dom/
[2]: https://developer.chrome.com/en/articles/declarative-shadow-dom/
[2 css]: https://developer.chrome.com/en/articles/declarative-shadow-dom/#server-rendering-with-style
[lit-labs]: https://www.npmjs.com/package/@lit-labs/ssr
[astro]: https://docs.astro.build/en/guides/server-side-rendering/
[serialization]: https://github.com/mfreed7/declarative-shadow-dom/blob/master/README.md#serialization
[demo]: /posts/web-components-3/demo.html
[masto]: https://mastodon.social/@developit
[polyfill]: https://gist.github.com/developit/54f3e3d1ce9ed0e5a171044edcd0784f
[my gist]: https://gist.github.com/myobie/071458ed72c395f20e97a81316a30e40
[mock dom]: https://github.com/WebReflection/linkedom
