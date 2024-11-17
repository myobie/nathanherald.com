+++
title = "How to manage reactive state using Custom Elements (Web Components)"
date = "2024-11-17T11:39:10+01:00"
+++

> TL;DR: signals work well in custom elements and grabbing state from a parent through event dispatch is great. [Checkout this codepen.][codepen] 💪

- - -

To make things truly _reactive_ in our custom elements (web components) we need some reactive state primitive. In frameworks, we usually use a hook or some other kind of “handle” to some state _somewhere out there_ in a place we can’t really see. 

This is how I would do this in preact:

```jsx
const App = () => {
  const [count, updateCount] = useState(0)
  const increment = () => updateCount(c => c + 1)
  
  return (
    <>
      <p>
        You’ve clicked the button
        {count} time{count === 1 ? '' : 's'}
      </p>
      <button onClick={increment}>Increment</button>
    </>
  )
}
```

Where is `count` really? We don’t know. It’s _in preact._ Which is fine most of the time. 

But still, isn’t that kinda weird. This “function component” `App` doesn’t take any arguments. And yet, as I call the function over and over, it returns different results depending on some state somewhere not in the function… 

Also, we can’t actually call `App()` ourselves, it will throw… so it’s a function, but not a function for us to use. It’s a function for preact.

This puts a lot of pressure on the UI framework – it now must contain the definition of the views, probably some styling, the state, the behavior, **all of it.**

Writing a unit test for the “counting feature” is also not that easy, we need to setup a render loop, etc. We don’t know where that state is, so we gotta let the framework help us.

It’d be better if our state _itself_ was reactive and our UI just showed that reactive state…

### Signals

Every framework is re-discovering signals these days, and that’s a great thing. _(Checkout the old [S][] library, which is still there after all these years and still works fine… signals have been great for a while.)_

Signals can make your state reactive, let you model your app purely as data, and you can unit test your app’s state without having to write any JSX or do any rendering or any of that.

```js
export const count = signal(0)

export function increment() {
  count.value += 1
}
```

And then our app can just focus on the DOM we wish we had:

```jsx
import { count, increment } from './count.js'

const App = () => {  
  return (
    <>
      <p>
        You’ve clicked the button
        {count.value} time{count.value === 1 ? '' : 's'}
      </p>
      <button onClick={increment}>Increment</button>
    </>
  )
}
```

And if somewhere else needed to either display or increment the count, they could import the functionality the same way. Anytime the count changes, any UI component using its value will re-render. 

This takes a lot of pressure off the UI: it can focus only on the actual UI stuff.

You can imagine writing some tests like:

```js
it('counts', () => {
  assertEquals(count.value, 0)
  increment()
  assertEquals(count.value, 1)
})
```

### Signals work great in custom elements too

We can wire that same state straight up to where it’s used in our custom element:

```js
import { count, increment } from './count.js'

const times = computed(() => {
  return count.value === 1 ? 'time' : 'times'
})

class CounterApp extends HTMLElement {
  static define(name = 'counter-app') {
    customElements.define(name, this)
  }
  
  constructor() {
    super()
    this.style.display = 'contents'
    this.disposes = new Set()
  }

  handleEvent(e) {
    if (e.type === 'click' && e.target.tagName === 'BUTTON') {
      increment()
    }
  }

  connectedCallback() {
    this.addEventListener('click', this)
    
    const countEl = this.querySelector('[data-count]')
    const timesEl = this.querySelector('[data-times]')
    
    this.disposes.add(count.subscribe(c => {
      countEl.innerText = c
    }))
    
    this.disposes.add(times.subscribe(t => {
      timesEl.innerText = t
    }))
    
    const button = this.querySelector('button')
    button.disabled = false
  }

  disconnectedCallback() {
    this.removeEventListener('click', this)
    this.disposes.forEach(cb => cb())
  }
}
```

And then:

```html
<!-- assuming CounterApp.define() has been run -->
<counter-app>
  <p>You’ve clicked the button <span data-count>0</span> <span data-times>times</span></p>
  <button disabled>Increment</button>
</counter-app>
```

_My custom element here requires that you provide the correct HTML: a `p` and a `button`. It’s fine if a custom element has opinions/requirements about it’s children._

Notice in the initial serialized HTML I’ve disabled the button. Then once the custom element is fully attached, I will enable it. This way we never have an enabled button that can’t work on the page. **Old-school progressive enhancement.** 🆒

This component gets the reactive state, encapsulates and wires up the behavior, and then everything is hunky-dory. 

Now, of course, web apps are much larger than this… an entire app’s state **_can_** be modeled, tested, and then consumed by the UI. It is possible. Be optimistic 🤓

And (I say) it’s preferable to have the state outside the UI rather than keeping the app’s state spread throughout our UI code just because `useState()` is the only reactive primitive we have there in our framework…

Moving the app’s state out of the UI layer is a way we can start to bridge the gap between custom elements and framework components. It also makes the decision of “which framework?” less important, so you can feel more free to experiment.

### Give it some context

Keeping an app’s state in globals can be problematic: it makes testing hard and it makes it impossible to have two counters on the page at once (which are related problems).

Most frameworks provide a way to setup a context which can have a sort of “scoped state” that is for any children of the context.

An example in preact might look like:

```jsx
<CounterContext initial={0}>
  <CounterApp />
</CounterContext>
<CounterContext initial={0}>
  <CounterApp />
</CounterContext>
```

And then we’d have two completely independent counter apps on the page at the same time without having to move our reactive state back into the UI components themselves.

**How can we communicate a sophisticated scoped state object (or set of objects) to some of the DOM when using custom elements?**

It’s not about “passing data down,” it’s really about **events bubbling up.**

#### Events are dispatched synchronously 

Yep. Prepare to feel weird about this. Event dispatch is often incredibly misunderstood. _React implemented their own synthetic events because of how weird DOM events are…_

DOM events are like a lightening strike: an event travels down, then bubbles up. There is a capture phase, then a bubble phase. And that entire traversal is synchronous. 🤔 ⚡

So we can use the **events go up** principle of the DOM to grab context from a parent, if there is one.

First, let’s package up all our app’s state into a “factory” or “generate” function:

```js
import { computed, signal } from "https://esm.sh/@preact/signals-core";

export function genState() {
  const count = signal(0)

  const times = computed(() => {
    return count.value === 1 ? 'time' : 'times'
  })

  return {
    count,
    times,
    increment() {
      count.value += 1
    }
  }
}
```

Now we can make as many _app states_ as we like.

Let’s make a custom element to create, contain, and scope that state:

```js
import { genState } from './state.js'

export class CounterContext extends HTMLElement {
  static define() {
    customElements.define('counter-context', this)
  }
  
  constructor() {
    super()
    this.style.display = 'contents'
    this.context = genState()
  }
  
  handleEvent(e) {
    // I just made this event name up
    if (e.type === 'getContext') {
      // if any event comes through wanting a context, I'll throw mine into the detail of the event here and then stop propigation so no further parents can overwrite which allows contexts to be nested, closest one wins
      e.context = this.context
      e.stopPropagation()
    }
  }
  
  connectedCallback() {
    this.addEventListener('getContext', this)
  }
  
  disconnectedCallback() {
    this.removeEventListener('getContext', this)
  }
}

export class GetContextEvent extends Event {
  constructor() {
    super('getContext', { bubbles: true })
    this.context = null
  }
}
```

And now the component which wants to subscribe to some state can check for any context from any parents first, falling back to creating it’s own state if no parents have a context for it:

```js
import { GetContextEvent } from './context.js'

export class CounterApp extends HTMLElement {
  static define(name = 'counter-app') {
    customElements.define(name, this)
  }
  
  constructor() {
    super()
    this.style.display = 'contents'
    this.disposes = new Set()
    this.context = null
  }

  handleEvent(e) {
    if (e.type === 'click' && e.target.tagName === 'BUTTON') {
      this.context?.increment()
    }
  }

 
  connectedCallback() {
    const getContext = new GetContextEvent()
    
    // ⚡
    this.dispatchEvent(getContext)

    // the .context value has been mutated synchronously by the event listener in the parent node
    this.context = getContext.context
    
    if (!this.context) {
      // if no parent provides the context, then we will make our own
      console.warn('no parent context, making local state', this)
      this.context = genState()
    }
    
    this.addEventListener('click', this)
    
    const countEl = this.querySelector('[data-count]')
    const timesEl = this.querySelector('[data-times]')
    
    this.disposes.add(this.context.count.subscribe(c => {
      countEl.innerText = c
    }))
    
    this.disposes.add(this.context.times.subscribe(t => {
      timesEl.innerText = t
    }))
    
    const button = this.querySelector('button')
    button.disabled = false
  }

  disconnectedCallback() {
    this.removeEventListener('click', this)
    this.disposes.forEach(cb => cb())
  }
}
```

And now we can run multiple of these count apps, some of which can have a shared context, some of which can have an isolated context:

```html
<counter-context>
<counter-app>
  <p>You’ve clicked the button <span data-count>0</span> <span data-times>times</span></p>
  <button disabled>Increment</button>
</counter-app>
</counter-context>

<hr>

<!-- both counter-app's will share the context state provided by this counter-context -->
<counter-context>
<counter-app>
  <p>You’ve clicked the button <span data-count>0</span> <span data-times>times</span></p>
  <button disabled>Increment</button>
</counter-app>
  
<counter-app>
  <p>Same count here: <span data-count>0</span> <span data-times>times</span></p>
  <button disabled>Increment</button>
</counter-app>
</counter-context>
```

**Now that feels a lot like a “reusable component” to me.** 💪

➡️ Checkout this codepen: https://codepen.io/myobie/pen/JjgbxyN

Go ahead and move elements in and out of the contexts in the example… hopefully you are starting to imagine how one can build up a sophisticated app with these loosely coupled components through passing simple string data down, and using events to grab more sophisticated objects / states when necessary.

### This will probably be a standard

There is a Community Proposal for a [Context Protocol][] which works exactly the same using event dispatch. Check it out. The event which is dispatched is a little different, it has a `callback` function which is called by a parent – so not direct object mutation like my example above.

So, maybe one day this will be 100% built-in 💪

Try out the [codepen][], try this out in your project, and [let me know how it goes][masto].

[S]: https://github.com/adamhaile/S
[codepen]: https://codepen.io/myobie/pen/JjgbxyN
[masto]: https://indieweb.social/@myobie
[Context Protocol]: https://github.com/webcomponents-cg/community-protocols/blob/main/proposals/context.md
