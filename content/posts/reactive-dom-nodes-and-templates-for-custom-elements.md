+++
title = "Reactive DOM nodes + reactive templates for custom elements (web components)"
date = "2024-12-08T11:15:20+01:00"
+++

[Signals](https://github.com/preactjs/signals) are now my go-to tool to model my reactive state for my apps in the browser. However, the hard part, for me, has been figuring out how I would prefer to bring that reactivity to the DOM. I think I’ve finally landed on a solution that I like using `<template>`.

_For an explainer on `<template>`, [checkout my previous post abut building templates for custom elements][prev]. This post builds on that one._

## Bring the signal to the DOM

The basic way to know when a signal is updated is to `subscrbe()` to it:

```js
const number = signal(0)

number.subscribe(newNumber => {
  console.log('new number!', newNumber)
})

number.value = 1
// log: new number! 1
number.value = 2
// log: new number! 1
```

One can also use an effect to achieve the same thing:

```js
const number = signal(0)

effect(() => {
  // using number.value will auto-subscribe this effect to number
  console.log('new number!', number.value)
})

number.value = 1
// log: new number! 1
number.value = 2
// log: new number! 1
```

#### Dispose

_Both `subscribe()` and `effect()` return a “disposal function” which “turns them off”… basically they stop watching / tracking any signals. You have to manually dispose of these subscriptions. It is annoying to me that one cannot provide an `AbortSignal` to the subscription 😠 Either way, this is what you have to do:_

```js
const number = signal(0)

const dispose = effect(() => {
  console.log('yay', number.value)
})

number.value = 1
// log: yay 1
dispose()
number.value = 2
// no log
```

### `Text`

The easiest way to “bind” a signal to the DOM is to update a `Text` node anytime a signal’s value changes. Assuming the signal (or computed) contains a string, this would work:

```js
function reactiveTextNode(signal) {
  const node = document.createTextNode(signal.value)

  effect(() => {
    node.textContent = signal.value
  })

  return node
}
```

And that’s it. Now we have a `Text` node that can be inserted anywhere in the DOM + it will update anytime it’s signal is updated 💪

Try this in your browser console for a full example:

```js
// paste this on it's own line by itself or else safari will complain
preactSignals = await import('https://esm.sh/@preact/signals-core')
```

```js
// then paste all this at once
const { computed, effect, signal } = preactSignals

function reactiveTextNode(signal) {
  const node = document.createTextNode(signal.value)

  effect(() => {
    node.textContent = signal.value
  })

  return node
}

const name = signal('James')
const hello = computed(() => `Hello ${name.value}`)
const node = reactiveTextNode(hello)

document.body.append(node)
```

```js
// and now you can update the name, which will update the DOM
name.value = 'Alice' // updates!
name.value = 'Bob' // updates again!
```

## Inserting signals into a template

I’d like to be able to directly interpolate a signal like this:

```js
const template = html`
  <p>Hello <strong>${name}</strong></p>
`
```

And it would auto-create the reactive `Text` node.

In my [previous post][prev] I made it possible to nest template by looking through all the interpolated objects looking for a template object, and using a small custom element as a stand-in inside the template’s content.

I’ll do the same for a signal inside my `Template` class:

```js
// when pre-processing the values in the template string...
if (v instanceof Signal) {
  this.#signals.set(i, v)
  return `<s- data-i="${i}"></s->`
}
```

```js
// then later in cloneNode()...
const signals = node.querySelectorAll('s-')

// for each custom element, replace it with a reactive text node
signals.forEach(t => {
  const i = t.dataset.i
  const sig = this.#signals.get(i)
  t.replaceWith(reactiveTextNode(sig))
})
```

This would take care of it. Don’t worry if this feels out of place, it is. _Checkout [this new codepen for a full example with an updated `Template` class and everything else I’m about to write about below][codepen]._

### Updating the signal in response to user input

I’d like to be able to update the name, so I can see it _react_. So I’m going to expand the template to include an input and a custom element which will listen for `input` events and update the signal in response:

```js
const template = html`
  <update-name>
    <input value=${name.value}><br>
    <p>Hello <strong>${name}</strong></p>
  </update-name>
`
```

And the custom element class:

```js
class UpdateName extends HTMLElement {
  constructor() {
    super()
    this.style.display = 'contents'
  }

  handleEvent(e) {
    name.value = e.target.value
  }

  connectedCallback() { this.addEventListener('input', this) }
  disconnectedCallback() { this.removeEventListener('input', this) }
}

customElements.define('update-name', UpdateName)
```

And this now is a complete app. I’ll embed the codepen right here so you can try it out and explore the full source altogether:

{{<raw>}}
<p class="codepen" data-height="300" data-default-tab="html,result" data-slug-hash="qEWZYYv" data-pen-title="Reactive DOM nodes + reactive templates for custom elements (web components)" data-user="myobie" style="height: 300px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid; margin: 1em 0; padding: 1em;">
  <span>See the Pen <a href="https://codepen.io/myobie/pen/qEWZYYv">
  Reactive DOM nodes + reactive templates for custom elements (web components)</a> by Nathan Herald (<a href="https://codepen.io/myobie">@myobie</a>)
  on <a href="https://codepen.io">CodePen</a>.</span>
</p>
<script async src="https://cpwebassets.codepen.io/assets/embed/ei.js"></script>
{{</raw>}}

- - -

## Alternate ways to build reactive templates

[mb21](https://indieweb.social/@mb21@hachyderm.io) [replied](https://indieweb.social/@mb21@hachyderm.io/113616192332556127) to my [previous post][prev] with a link to [github.com/mb21/mastro/tree/main/src/reactive#reactive-mastro](https://github.com/mb21/mastro/tree/main/src/reactive#reactive-mastro) which is a very cool way to handle this.

What I like about it is it shows how you can very quickly _hydrate_ server-side generated markup using their custom element subclass.

I, personally, am not a fan of putting things like _bindings_ or _handlers_ in the html directly. In my journey I’ve arrived at the above _reactive text node_ primitive from which I can build up fairly complex web apps. And DOM elements already bubble up their events, so if I want to handle a click I’ll create a custom element like I showed above to listen for and handle it. I prefer that style.

And this is why the web is great: the tools we have in the browser are incredibly flexible, there isn’t a right way to use them.

If it works, if it meets your customers / readers / viewers needs, if it’s as standard and accessible as it can be, then you did it correctly 🫡

## Open questions

While this is great to see how quickly one can put together some reactive templates, there are still a lot of questions to answer:

* What about a reactive list? (oh don’t get me started 😵‍💫)
* What about template slots? (sure)
* What about server-side rendering? (a very big topic indeed)
* Isn’t this making a template for every single DOM node? (it’s worse than you think)
* Shadow DOM? (they who shall not be named)
* What about effect disposal? (yeah, it’s not easy)

And I’m sure many more. What questions do you have about custom elements that haven’t been answered yet?

I am on a journey to answer these questions, and more, for myself. I think we can build highly-sophisticated web apps with only custom elements today, and I’m going to learn how.

Find me on [mastodon](https://indieweb.social/@myobie) and let me know what you think.

[prev]: https://nathanherald.com/posts/building-templates/
[codepen]: https://codepen.io/myobie/pen/qEWZYYv?editors=0010
