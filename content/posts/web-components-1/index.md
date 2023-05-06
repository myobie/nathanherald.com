+++
title = "Learning about Web Components: Part 1"
date = "2023-05-06T15:35:45+02:00"
+++

I’ve become interested in [Web Components][] again. I’ve kept up with the smattering of standards that make up “Web Components” over the years, but since they were client-only and couldn’t really be server-rendered, they weren’t as interesting to me. Things have changed. [declaritive shadow DOM][] makes server rendering possible and [webc][] seems like a neat way to do single file components (since [html imports][] didn’t make it, which was super sad).

I have a good understanding of how to make _a_ web component, but I don’t really understand yet: how to compose a tree of web components, how to pass state changes down, is it easy and intuitive to bubble events up the tree, and how to do something similar to preact’s “render loop” or even if that type of loop would be desirable. 

I learn best by doing, so today I want to ease back into web components by making a simple grid of images. _Over time I’d like to enhance the grid to be reorderable, editable (add/remove images), and maybe even provide a custom name for each image… but that’s for another day._

I’ve written this part out before I started on the actual components, and we’ll see how far I get in 20 or so minutes…

- - -

I managed to create an `image-grid` component with `image-cell` children which can load and show images in a nice grid. 

[View the demo.html page here](./demo.html).

The html looks like:

```html
<image-grid>
  <image-cell src="./one.jpg"   width="3607" height="3024"></image-cell>
  <image-cell src="./two.jpg"   width="3448" height="4592"></image-cell>
  <image-cell src="./three.jpg" width="4592" height="3448"></image-cell>
  <image-cell src="./four.jpg"  width="3264" height="4928"></image-cell>
  <image-cell src="./five.jpg"  width="4225" height="2798"></image-cell>
  <image-cell src="./six.jpg"   width="4928" height="3264"></image-cell>
</image-grid>
```

This is a good start and I learned a few things:

* Using `<slot></slot>` to mean what `children` means in preact works fine I think
* `:host {}` in the CSS is how to style the custom element itself, which is very handy
* The styles seem truly isolated. I tried to add `body { background-color: pink; }` inside the custom element’s template and it had no affect. I also tried to style `img { outline: 5px solid purple; }` in the parent `image-grid` template and it didn’t affect the images inside the child `image-cell` template. This is what I expected, but it’s the first time I’ve proven it to myself with a working example.

Some notes for myself for next time:

* I think I need to break the `<style>` in the template out into a `.css` file. If I server render this thing it’s going to duplicate the entire `<template>` for each invocation, including all the `<style>`s.
* I don’t like how separate and indirect the `<template>` is from the `customElements.define(…)` call. 
* I don’t like how I’m cascading the `height`, `src`, `width` attributes from the `image-cell` to the `img` tag right now. I’m not sure how to make it better, but it just feels weird to me.
* I always forget how to use css grid to layout images and keep their aspect ratios correct. It’s a battle.

OK, that’s all for today. We’ll see when I take time to make the components more dynamic along with being server rendered.

[Web Components]: https://developer.mozilla.org/en-US/docs/Web/API/Web_components
[declaritive shadow DOM]: https://webkit.org/blog/13851/declarative-shadow-dom/
[webc]: https://github.com/11ty/webc
[html imports]: https://developer.chrome.com/blog/chrome-70-deps-rems/
