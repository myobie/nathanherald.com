+++
title = "TIL about Promise.withResolvers()"
date = "2023-12-18T11:38:06+01:00"
externalUrl = "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/withResolvers"
+++

Seen on [mastodon (@patak@webtoo.ls)](https://m.webtoo.ls/@patak/111484207679580940), I am excited to see that this old trick is being standardized:

```js
let resolve, reject
const promise = new Promise((res, rej) => {
  ;[resolve, reject] = [res, rej]
})
```

I’ve been using [deno’s standard library’s deferred](https://deno.land/std@0.189.0/async/deferred.ts?source=) for a while, and I’ll be happy to swift to `Promise.withResolvers()` soon 💪
