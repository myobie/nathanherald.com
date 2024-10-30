+++
title = "The disharmony between “web components” (custom elements) and react-like “framework components” is real"
date = "2024-10-30T11:08:47+01:00"
+++

_**The primary difference is passing down data vs. passing down behavior, and this causes a ton of confusion.**_

[Recent][1] [discourse][2] about “web components” vs react-like “framework components” is continuing to highlight a fundamental disconnect between these two types of components.

There is one main irreconcilable difference that many seem to forget to highlight:

**The DOM is about passing data down and dispatching events up, while framework components are all about passing behavior down through “props.”**

And this is why it’s sometimes difficult for framework authors to support custom elements – they are fundamentally incompatible models.

[lit][lit] tries to bridge the gap by making custom elements look like react, [preact][pwc] does a pretty good best-effort to support custom elements, [react][rwc] is also trying, but in the end they can’t work well together because of these fundamental differences.

## Data down, events up vs. passing behavior down

The DOM is an “object model” that is very [object oriented][oo]. One of the tenets of most object oriented systems is to:

1. Encapsulate behavior and state into objects, and
2. Pass messages / data between those objects. The DOM pretty much works this way.

The `HTMLParagraphElement` inside the `HTMLDIVElement` doesn’t share any state with its parent. It doesn’t need to.

This is why custom elements are classes: classes are one of the things that can encapsulate state and behavior in javascript. _(Sure, they could have been plain objects and I do kinda wish they were, but I get why the spec writers made this choice.)_

Let’s say you want to _react_ to a click of a button inside your custom element – you **shouldn’t pass a function down** to the button to provide to its `onclick` prop, nah you’d just implement `handleEvent` in the custom element which contains the button and listen for the event to bubble up. You don’t even need to know if there are any buttons inside your element, you can just be ready for when there are. And the button doesn’t have to know the custom element is a parent – it dispatches a click either way.

The custom element encapsulates the behavior like this:

```js
class CaptureClick extends HTMLElement {
  static define() {
    customElements.define('capture-click', this)
  }

  constructor() {
    super()
    this.style.display = 'contents'
  }

  handleEvent(e) {
    if (e.type === 'click' && e.target.tagName === 'BUTTON') {
      e.preventDefault()
      e.stopPropagation()
      console.warn('captured', e.target.innerText, e)
    }
  }

  connectedCallback() {
    this.addEventListener('click', this)
  }

  disconnectedCallback() {
    this.removeEventListener('click', this)
  }
}
```

And this can be used either in javascript with `document.createElement()` or in HTML like:

```html
<!-- assuming CustomClick.define() has been run -->
<capture-click>
  <button>Yo!</button>
</capture-click>
```

To someone who works mostly in react-like frameworks, this code is probably very surprising.

> Most framework components today are “functional” or at least _very function oriented_. If you created a class component today someone would ask you what you were doing… and functional components can be really useful if you want to unit test the output from them. You could provide the function some input and then assert on the virtual DOM nodes returned… although I bet you don’t do that. Have you ever unit tested the output of your function components?
> 
> I bet your components need some sort of “context” to work at all, and I bet you need to setup a component hierarchy to provide that context… so not as functional as we hoped, but still pretty nice.

To implement the above in [preact][pwc], I’d just do:

```js
// assuming there is a Button component
export const App = () => {
  const buttonValue = 'Yo!'
  const onClick = e => {
    e.preventDefault()
    e.stopPropagation()
    console.warn('captured', buttonValue, e)
  }

  return (
    <Button onClick={onClick} value={buttonValue}>
  )
}
```

I am **passing behavior down,** from `App` to `Button`. And you see this all over framework component code.

And not just clicks. We pass down functions that query databases, we pass down databases themselves, we store things in a context and then pull it back out many levels down, we pass down callbacks or promises or both…

And hooks aren’t helping – hooks are just hiding the implementation details of state to make things look functional, when they really aren’t.

And listen, I love writing “function components” and I like building apps with preact. [new.space](https://new.space/) is 100% written with preact, signals, and other great libraries. It’s a nice world to be in.

JSX makes it easy to pass behavior down. HTML isn’t JSX tho: **HTML is a serialization of a DOM we wish existed.**

Serialized DOM (HTML) can only pass data as strings in attributes. I’m sure you’ve read something about “attributes vs. props” before and this is main conflict: html attributes are only data and only strings.

## How to bridge the gap?

If you are really motivated, then you can write your custom elements in a DOM-first style and write your react-like components in that style… but I don’t recommend it. It can be a pretty big context switch going back and forth. For existing apps, I recommend staying in that app’s current world. For new apps, build with custom elements… until you can’t.

Custom elements are ready today, you can do anything you want with them. If you want to build a context element to hold some state and then query that state further down the DOM tree, do a quick `this.closest('parent-with-state')?.state` inside the `connectedCallback()` of the child element.

What problems have you not been able to solve with custom elements? What would you love to know more about? [Let me know][masto] and I’ll write up some real examples.



[1]: https://www.abeautifulsite.net/posts/web-components-are-not-the-future-they-re-the-present/
[2]: https://x.com/rich_harris/status/1839484645194277111?s=46&t=5XjJH-Qs6-qiNabMDykXPg
[lit]: https://lit.dev
[pwc]: https://preactjs.com/guide/v10/web-components/
[rwc]: https://react.dev/reference/react-dom/components#custom-html-elements
[oo]: https://www.enjoyalgorithms.com/blog/message-passing-oops
[masto]: https://indieweb.social/@myobie

