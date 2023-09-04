+++
title = "Learning about Web Components: Part 2 – Data access and UI updates"
date = "2023-08-27T13:02:22+02:00"
+++

I’ve finally spent a little more time learning enough to write a second post about [Web Components][]. You can read [Part 1 here](/posts/web-components-1/).

This time I focused on two questions:

1. Sometimes the data I work with it local-only in a database in the browser – so how do I pass the database state down through the tree?
2. When sorting or filtering items, how can I do that without completely re-rendering the items from scratch every time?

I have a new [demo page][demo] for this post where you can see the working code: [`demo.html`][demo]

> It’s all in one HTML file, so view source and you’ll see everything there.

## Modeling the database state

I didn’t want to actually setup a full `indexedDB` database, so I made a fake `db` variable and “query function” with a fake delay. Querying `indexedDB` is always `async` (annoying) so I wanted to model that.

```js
const db = Object.freeze([
  { id: 1, src: "./one.jpg", ... },
  ...
].map(i => Object.freeze(i)))

async function simulatedSlowDBQuery() {
  await new Promise(res => setTimeout(res, 200))
  return shuffle(Array.from(db))
}
```

I decided that the `<image-grid>` custom element can “contain” the list of image IDs it’s displaying. And then each `<image-cell>` can “contain” the ID of the database record it represents. So this means each “component” requires a local database to render, which is fine for my use-case for this post.

For this [demo page][demo], the page’s HTML just includes an empty `<image-grid></image-grid>`. There is an “outside function” which will query the DB and provide the record IDs to the empty grid:

```js
const grid = document.querySelector('image-grid')

async function queryThenRenderImages() {
  const records = await simulatedSlowDBQuery()
  grid.recordIds = records.map(i => i.id)
}

// start with a query at boot
queryThenRenderImages()

// query + shuffle every 10s
setInterval(queryThenRenderImages, 10000)
```

I also like that it would be pretty easy to consume an `AsyncIteratable` to do a similar thing:

```js
for await (const records from dbIterable) {
  grid.recordIds = records.map(i => i.id)
}
```

_I do want to try to “server render” the grid and then hydrate it in the browser, that’s just too much for this blog post._

## Reusing `<image-cell>`s when sorting

I’ve added a `shuffle()` to the database query so I can emulate sorting and filtering. One of the things I wanted to solve was how to easily handle sorting with these custom elements. It turns out the secret is the `<slot></slot>` element. 

> [`@keithamus` tipped me off to this over on Mastodon][mastodon] _(sheesh, back on May 7, it certainly took me a while to act on his advice 😂)_.

A [slot is assignable][assign], with something like: `slot.assign(...nodes)`

Two things that took me a bit to figure out:

1. The shadow DOM needs to have its `slotAssignment` set to `'manual'`. This is how I’ve done that:

    ```
    this.attachShadow({ mode: 'open', slotAssignment: 'manual' })
    ```

2. A slot can only be assigned nodes that are children of the shadow DOM’s host. _Yep, that sentence is very specific, wordy, and was hard to be to fully parse and understand at first._

Here is a visual example from Firefox that really helped me get it:

{{<fig
  src="firefox-screenshot@2x.png"
  alt="Screenshot of Firefox showing the DOM setup with the image-grid, it’s shadow-root with a slot filled with references to image-cells"
  />}}

In the above you can see a few things:

* The `<slot>` is a child of the `#shadow-root` element of the `<image-grid>` element
* The `<image-cell>` elements are all children of the `<image-grid>` element, and not children of the `#shadow-root` or `<slot>`
* The `<slot>` shows that it has been “assigned” references to the `<image-cell>` elements

Since the `slot` only holds references to `<image-cell>`s, I can sort those references and re-assign without triggering a full re-paint of those `<image-cell>` elements. 

> _At least, I think that is true._ I haven’t been able to confirm that yet. I’ve tried profiling the page a few times, but I can’t seem to get _proof_ about what is exactly happening. If you know, please [email](mailto:myobie@duck.com) or [@ me on mastodon](https://indieweb.social/@myobie).

A super nice thing is `slot.assignedNodes()` will return the currently assigned nodes, so I don’t need to remember those inside the custom element and can just get them anytime I need them.

## `attributeChangedCallback`

While the `recordIds` of the `<image-grid>` are entirely “private” to the class, I decided to implement the `record-id` attribute of the `<image-cell>` element and actually wire it up to fully work (I think).

I can change the `record-id="4"` in the devtools and the element updates, which is pretty darn cool. But I’m not sure if this really is worth it or not. When passing data down through custom elements with attributes, everything has to be a string and I kinda hate that. So I’m not sure if trying to deal with serialization of these attributes is worth it to not yet.

The “update function” for `<image-cell>` reminds me of a `configureCell()` function when using `UICollectionView` or `UITableView` in iOS apps:

```js
updateTemplate() {
  // “query” for the record
  const record = this.#recordId && db.find(r => r.id == this.#recordId)

  // only update if it’s a different recordId
  if (record?.id !== this.#lastRenderedRecordId) {
    this.shadowRoot.replaceChildren() // clear

    if (record) {
      const template = document.querySelector('template[data-name="image-cell"]')
      this.shadowRoot.append(template.content.cloneNode(true))

      const img = this.shadowRoot.querySelector('img')
      const pName = this.shadowRoot.querySelector('p.name')

      img.alt = record.description
      img.src = record.src
      img.width = record.width
      img.height = record.height

      const nameParts = record.src.split('/')
      pName.innerText = nameParts.at(-1)
    }
  }

  this.#lastRenderedRecordId = record?.id
}
```

I’d say I’m 80% happy with that function. I feel like there is still something I’m missing though 🤔

## Use cases

I could see this being useful for lots of situations:

* Search suggestions
* Search results
* Filtering any kind of list or grid
* Navigating between tabs
* Swapping out a page template by slotting in a header, sidebar/aside, and/or main content area with named slots
* What else can you think of?

## Questions still to answer

* Is it common to support attributes with string serialization, or do most people leave those out and rely on javascript properties instead?
* What examples are there online of Web Components + IndexedDB?
* What are the accessibility implications of having elements in the DOM that are not slotted?
* Passing data down two levels is fine, but how do things look when there are many many levels?

🫡




[Web Components]: https://developer.mozilla.org/en-US/docs/Web/API/Web_components
[demo]: ./demo.html
[assign]: https://developer.mozilla.org/en-US/docs/Web/API/HTMLSlotElement/assign
[mastodon]: https://indieweb.social/@keithamus/110327619515521232

