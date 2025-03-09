+++
title = "new AsyncFunction – the async version of new Function"
date = "2023-09-20T20:56:58+02:00"
externalUrl = "https://picostitch.com/tidbits/2023/09/new-async-function-the-async-version-of-new-function/"
+++

TIL

```js
const AsyncFunction = async function () {}.constructor
const fn = new AsyncFunction('await Promise.resolve(1)')
```

🤯