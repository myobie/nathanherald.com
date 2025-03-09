+++
title = "How to build custom elements that work no matter what order things are loaded"
date = "2024-11-26T19:28:55+01:00"
+++

> TL;DR:
>
> * Put all the important code in `connectedCallback`
> * Either don’t depend on any specific DOM parent being pre-defined, or `await customElements.whenDefined(...)`
> * Cleanup any listeners, etc in the `disconnectedCallback` for good hygiene 

Custom elements are seemingly created in three steps:

1. Subclass HTMLElement
2. Define the tag name
3. Element is constructed

Which seems simple and complete, but it turns out things can happen in a lot of different orders and aren’t nearly that simple.

I’ve done some testing for different scenarios to see when are an elements attributes set, when are the element’s children reachable, and when is the element’s parent reachable? I’m trying to document what I’ve learned below.

Example html I will use to work through this:

```html
<one->
  <two->
  </two->
</one->
```

> `<one->` is a valid custom element name. The only rules are: 1) must start with a letter and 2) must have at least one hyphen (-). `<t->` is a valid custom element name, for example.

> Also, just in case you don’t know, a custom element’s class can have a `constructor` and it can have a `connectedCallback` method which will be called when the element is attached to a document. It’s similar to “on mount” in the react and related world.

There are a few scenarios or orders that custom elements might be defined and discovered:

1. A tag’s name might be in the HTML returned from the server, but the subclass might not be defined yet in the custom elements registry
2. A tag name might show up in the html only after the subclass is defined
3. The element class might be constructed in javascript, unrelated to html parsing
4. Elements might be defined in a non-deterministic order

## A tag’s name might be in the HTML returned from the server, but the subclass might not be defined yet in the custom elements registry

_If you normally put your `<script>`s at the bottom of the `<body>`, the this is your scenario._

The HTML parser will first construct a generic `HTMLElement` since the tag’s name isn’t in the `customElements` registry. The element is style-able by CSS and the CSS can even see if the element is `:defined` or not (if it’s in the `customElements` registry). This can cause a flash of undefined custom elements depending on how you implement the CSS and HTML for the component. Some devs choose to hide `not(:defined)` elements to avoid this.

After some Javascript is loaded and defines the tag name to be a subclass of HTMLElement, the generic HTMLElement will automatically be upgraded and replaced. `customElements.define('one-', OneElement)` will cause the DOM to look for any existing `one-` elements and upgrade them right then.

When an element is upgraded from a generic one to a custom one, the elements `children` are accessible in the class’s `constructor`, `connectedCallback`, etc – it’s a leaf-first situation. So `this.children` will be accurate anywhere, anytime for this scenario.

This is not the end of the story, though. Because of how HTML is parsed and because scripts are run inline, it’s possible that there is more HTML to go through after the `<script>` which defined `OneElement`.

As the HTML parser encounters new `<one->` elements, it will directly instantiate the `OneElement` class right then. So half the page might work one way, the other half might work another way. _(I recommend never letting this happen, it’s just confusing 😅)_

This is identical to the next scenario…

## A tag name might show up in the html only after the subclass is defined

_If you put your `<script>`s in the `<head>` and you do not use `defer`, then this is your scenario._

Since the `OneElement` is already registered into `customElement`, the HTML parser will directly instantiate a new `OneElement` for each `<one->` it encounters. There won’t be a time where the CSS selector `not(:defined)` would match, there is not _upgrade_, and so there is not flash of undefined custom elements.

And the access to `this.children` is the same; whether your code is in the `constructor`, `connectedCallback`, or anywhere else, `this.children` should be what you expect.

However, there is one more scenario that isn’t related to HTML parsing…

## The element class might be constructed in javascript, unrelated to html parsing

I’m sure you’ve had to write code like:

```js
const div = document.createElement('div')
div.id = 'some-id'

const paragraph = document.createElement('p')
paragraph.innerHTML = 'Hello 👋'

div.append(paragraph)
// etc, etc... 
return div
```

And it feels very tedious… well this can happen for custom elements as well.

One can use `document.createElement('one-')` or `new OneElement()` to make a new instance of the custom element… and it doesn’t have its children yet. 

So in this scenario, it is not safe to look at `this.children` or `this.parentNode` in the `constructor`… It also doesn’t have any of it’s attributes set… so you can’t really look for those attributes in the `constructor` either… which can be really annoying. 

However, there is good news, you can trust `this.children` and all the other stuff in the `connectedCallback`.

Try this to prove it to yourself (just try this in the console at any URL):

```js
class A extends HTMLElement { connectedCallback() { console.log('connected!') } }

// if you try `new A()` right now, you will get an error. A custom element can be instantiated until it is defined in the registry.
customElements.define('a-', A)

let a = new A() // yay!
let div = document.createElement('div')

// luckily, this does not call the connectedCallback yet!
div.append(a) 

document.body.append(div)
// "connected!" will be logged, the connectedCallback was finally called
```

As long as custom elements are instantiated, fully prepared, and then added to a document things will probably work out just fine for any code in the `connectedCallback`.

One way I work around this sometimes is to accept attributes and children as optional arguments to the constructor, like this:

```js
class FancyElement extends HTMLElement {
  constructor(attributes, ...children) {
    super()
    
    if (attributes) {
      for (const [key, value] of Object.entries(attributes)) {
        this.setAttribute(key, value)
      }
    }

    if (children.length > 0) {
      this.replaceChildren(...children)
    }
    
    // OH yeah!
  }
}
```

So now I can safely put setup code in the constructor, as long as every dev knows this is how this custom element needs to be used… I don’t do this often, but sometimes this is the easiest way to move forward. _Really tho, just try to only ever put important code in the `connectedCallback` if at all possible._

This is all fine for one custom element, but what if there are many custom elements and they are all defined at different times 🤔

## Elements might be defined in a non-deterministic order

Using the same example from above, assuming none of the subclasses have been defined during HTML parsing:

```html
<one->
  <two->
  </two->
</one->
```

The order the subclasses are defined really matters. If, for some reason, OneElement was going to do something that TwoElement depends on (like setup a database or something), then you better make sure to define OneElement first.

Having a direct dependency on a parent in the DOM is an anti-pattern, try not to do it unless absolutely necessary. 

And, well, if you really want to make sure, then you can wait for the other custom element to be defined inside the connected callback:

```js
export class TwoElement extends HTMLElement {
  static define() {
    customElements.define('two-', this)
  }

  async connectedCallback() {
    await customElements.whenDefined('one-')

    // now the parent is fully there 💪
  }
}
```

This might look like it could end up in a deadlock if two tags were waiting on each other, but it won’t. connectedCallback() is not actually async and the DOM runtime will not await the promise this example returns, so things can work out concurrently just fine.

(You can also use this trick the other way: wait until you know all the custom elements that might be children are defined.)

Still, you can also just make sure things are defined in an outside-in order in your code. That is what I prefer since it’s less code for me to write and I need this rarely.

## Is this all a mess?

Kinda, but I’m OK with it. Custom elements are, IMHO, not a easy as react-like components because they are alive, living in the DOM, and dealing with the real built-in HTML parser and renderer which have to deal with a lot more than just JSX… If you embrace a few conventions, then it normally all works out fine:

* Put all the important code in `connectedCallback`
* Either don’t depend on any specific DOM parent being pre-defined, or `await customElements.whenDefined(...)`
* Cleanup any listeners, etc in the `disconnectedCallback` for good hygiene 

Good luck. [Let me know](https://indieweb.social/@myobie) if I made any mistakes or missed any other scenarios that are tricky with custom elements.







