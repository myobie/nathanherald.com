+++
title = "Learning about Web Components: Part 3 – Define in a static initialization block"
date = "2023-09-13T09:50:09+02:00"
+++

<abbr title="Today I learned">TIL<abbr> about: [static initialization blocks][] and how this is useful when defining a [custom element][].

I knew about [static properties][], but I never noticed one can do a `static {}` block directly in a `class` in javascript. Here is an example:

```js
class A {
  static {
    console.log('This output in the console immediately on page load')
    console.log(this) // same as console.log(A)
  }
}
```

The static block is run when the class itself is initialized, not when a new instance is constructed.

Custom elements are defined as classes and need to also register themselves into the custom element registry, and static initialization blocks can help keep that registration code contained within the class:

```js
class ImageGrid extends HTMLElement {
  static {
    customElements.define('image-grid', this)
  }

  constructor() {
    super()
    this.attachShadow({ mode: 'open', slotAssignment: 'manual' })
  }

  // …
}
```

Super cool 😎

I’ve updated the [demo page](./demo.html) to use this technique and it works in all the modern browsers I’ve tried 💪

[static initialization blocks]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Static_initialization_blocks
[custom element]: https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements
[static properties]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/static
