+++
title = "S.js and some thoughts about reactive state"
date = "2023-08-17T15:09:37+02:00"
externalURL = "https://github.com/adamhaile/S"
+++

I recently stumbled upon the [S.js][] “reactive state library” and the related [surplus][] web framework which builds upon it, and I wanted to recommend reading though it to any developer wanting to learn more about building web UIs with reactive state. The ideas I see in surplus are _so_ similar to the ideas I’ve been working towards with [with the Shareup team building new.space](https://new.space/).

We’ve been iterating on how our application state is stored and how we interact with it in our UI components. 99% of the app’s state is stored in IndexedDB in the browser, so we really only need an in-memory mirror of the database’s state to hand to the UI when rendering.

Our web app’s UI is written using [preact][], and the default way to handle state in a contemporary (p)react app is to use `useState()` or `useReducer()`. _Sure, there is [redux][], but the boilerplate of actions and all that is a lot for me._

`useState()` is great for a web UI that loads some data, then displays it, and that’s it. It’s not great for a web UI that holds all of its data locally in indexedDB and wants the UI to react to any changes to the underlying storage over time. One either has to put a giant state/reducer way up in a root component or context, or one has lots of little states that all get lost anytime a large part of the UI changes. 

Navigating from one section of the app to another shouldn’t need to completely dump and reload from indexedDB – we just had that state and it doesn’t need to disappear when un-mounting. Yet, if one lifts the state up to a root-ish-level component, then the entire app UI will re-render for every little change to the underlying storage. Showing a progress meter is hilarious in that scenario.

[surplus][] seems like the right idea: lift the state entirely out of the UI, make it reactive by default, and let the UI be a function of the reactive state. Only the parts of the app that use a part of the state need to re-render when that state changes. 

We are using, and really like, [signals][] which are surprisingly very similar to [S.js][]… and [S.js][] and [surplus][] are both like 7–8 years old 🫢 I’m surprised I hadn’t come across it until now. Building high-performance web UIs is still a tough job all these years later 😅

[S.js]: https://github.com/adamhaile/S
[surplus]: https://github.com/adamhaile/surplus
[preact]: https://preactjs.com
[redux]: https://redux.js.org
[signals]: https://preactjs.com/guide/v10/signals/
