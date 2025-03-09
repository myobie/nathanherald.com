+++
title = "Building templates for custom elements (web components)"
date = "2024-12-07T21:51:46+01:00"
+++

## What is `<template>`?

If you, like me, have ever tried to use it for “templating” then you’ve probably also been frustrated. I’ve now used `<template>` enough that I think I get it, I think I understand what it’s good for. And it’s not templating.

[`<template>` is for holding document fragments.](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/template) That’s it.

Those DOM fragments are reusable. They expose a `cloneNode()` function which allows one to duplicate it, to then be inserted somewhere. The template’s content doesn’t change, `cloneNode()` just makes a duplicate.

```js
const template = document.createElement('template')
template.innerHTML = '<p><em>Hello</em></p>'

const frag = template.content.cloneNode(true)
// true means deep clone, you almost always want this

document.body.append(frag)
// appending a fragment will move all of its children into the target element
```

The above doesn’t feel like what I would call “a template.”

If you needed 10 `<p>A</p>`s all the same, then this would work great. But most of the time I have some _shared markup_ that I want to reuse, like for building up a list of grocery items for example. I might want to share something like `<li>${name}</li>` and then reuse that over and over for each grocery item.

This is a way to make the grocery list using `<template>`:

```js
const groceryItems = ['milk', 'eggs', 'eggos']
const ul = document.createElement('ul')
const template = document.createElement('template')
template.innerHTML = '<li></li>'

for (const item of groceryItems) {
  const frag = template.content.cloneNode(true)
  frag.querySelector('li').innerHTML = item
  ul.append(frag)
}

document.append(ul)
```

This feels like a lot to just place the grocery item’s name into the `<li>` for each.

Most of us are used to writing something like this in JSX:

```jsx
(
  <ul>
    {groceryItems.map(item => (
      <li>{item}</li>
    ))}
  </ul>
)
```

JSX is not available in the browser tho. It requires a build system… and it’s XML and not HTML. _And_ if you’ve ever had to put in a `{' '}`, well, there are edge cases 😉

What we do have in the browser are _template strings._

## Template strings

Unrelated to `<template>`, template strings are those backtick multi-line strings that can interpolate stuff. Like this:

```js
function say(...what) {
  console.warn(...what)
}

const number = 5

say(`Hello ${number} Again`)
// => 'Hello 5 Again'
```

There is another way to call a function with a template string though:

```js
say`Hello ${number} Again`
// => ["Hello ", " Again"]
// => 5
```

And that is incredibly different. By removing the parentheses and putting the backticks up against the function, it calls it **before** interpolating the number.

You are expected to zip the first array with all the following arguments. If you look at the above example, you can see how first comes a string, then the five, then another string, and then we are done.

Implementing that type of zipping of arrays is annoying… and luckily there is a built in function that will do it for you: `String.raw()`.

```js
function say(strings, ...args) {
  const message = String.raw({ raw: strings }, ...args)
  console.warn(message)
}

const number = 5

say`Hello ${number} Again`
// => 'Hello 5 Again'
```

Let’s make a sweet `html` function that can take a template string and return an `HTMLTemplateElement`.

```js
function html(strings, ...args) {
  const template = document.createElement('template')
  const source = String.raw({ raw: strings }, ...args)
  template.innerHTML = source
  return template
}

const item = 'Milk'

html`
  <ul>
    <li>${item}</li>
  </ul>
`
```

Which is super cool. That already looks _more templatey_ to me. There is still some work to do to though be able to interpolate the entire grocery list, so let’s get to it.

I feel like I need to be able to nest templates to build the full grocery list… so I need to pre-process `args` before passing it to `String.raw()` to deal with any interpolated templates.

To make this easier, I’d like to package this up into my own class so I can keep some state and more easily detect a nested template.

```js
export class Template {
  #embeddedTemplates = new Map()

  constructor(source, ...values) {
    this.element = document.createElement('template')
    // pre-process the template string values
    const updatedValues = this.#prepareValues(values)
    // zip
    this.source = String.raw({ raw: source }, ...updatedValues)
    // assign as the source
    this.element.innerHTML = this.source
  }

  #prepareValues(values) {
    let index = 0

    const prepareValue = v => {
      index += 1
      const i = String(index)

      if (typeof v === 'boolean' || v === null || v === undefined) {
        // if someone interpolates nothing, return an empty string and move on
        return ''
      }

      if (v instanceof Template) {
        // if we find a template, store it in our Map
        this.#embeddedTemplates.set(i, v)
        // substitute a small custom element including the index in the Map for this embedded template
        // our template content must be a string, so we are using this little custom element to stand in for our non-string Template object
        return `<t- data-i="${i}"></t->`
      }

      return String(v)
    }

    return values.map(v => {
      // just in case someone interpolated an array, then let's map over it
      if (Array.isArray(v)) {
        return v.map(prepareValue).join('')
      }

      return prepareValue(v)
    })
  }

  // we'll just always imagine it's true
  cloneNode() {
    const node = this.element.content.cloneNode(true)

    // find all those custom elements that are standing in for embedded template objects
    const embeddedTemplates = node.querySelectorAll('t-')

    // for each custom element, replace it with the cloned fragment of the template object it's standing in for
    embeddedTemplates.forEach(t => {
      const i = t.dataset.i
      const template = this.#embeddedTemplates.get(i)
      t.replaceWith(template.cloneNode())
    })

    return node
  }
}
```

I know that is a lot. I added comments to the code and hopefully that helps a bit.

With that class, I can now write:

```js
function html(strings, ...args) {
  return new Template(strings, ...args)
}

const template = html`
  <ul>
    ${groceryItems.map(item => html`
      <li>${item}</li>
    `)}
  </ul>
`

document.body.append(template.cloneNode()
```

That is looking very _templatey._ Hopefully you can see the nested `html` call in there.

This should give us the html we expect.

[This codepen has a working example](https://codepen.io/myobie/pen/WbewXxB?editors=0010).

- - -

The resulting DOM list isn’t reactive. If I want to add a new item to the grocery list, it won’t update. And that is a bigger topic for another post, hopefully soon.

Hit me up on [mastodon](https://indieweb.social/@myobie) and let me know what you think of my `Template` class, how are you handling templating with custom elements, or anything else 🫡
