+++
title = "TIL about the useUnknownInCatchVariables compiler flag for TypeScript"
date = "2023-02-11T00:08:28+01:00"
externalUrl = "https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-4.html#defaulting-to-the-unknown-type-in-catch-variables---useunknownincatchvariables"
+++

Today I was debugging a confusing situation. 

1. The variable inside a `catch` statement in TypeScript is `any` by default, which is awful
2. Safari was throwing `undefined` when trying to place a `webm` file into a `<video>` element, which was breaking my brain 🤯

I had mistakenly done this, assuming `e` would be an `Error`:

```ts
try {
  putIntoVideoTag(file)
} catch (e) {
  logger.error('What‽’, e.name, e.message)
}
```

So when `e` was `undefined`, it exploded.

One can manually type the `catch` variable so the compiler won’t let you accidentally call `e.name`, like:

```ts
try {
  putIntoVideoTag(file)
} catch (e: unknown) {
  logger.error('What‽’, e)
}
```

But that means I can (and will) forget to do it. 

Well, TIL that TypeScript now supports a flag to make all `catch` variables default to `unknown` which is great: `useUnknownInCatchVariables`

It was added in [the 4.4 release](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-4.html#defaulting-to-the-unknown-type-in-catch-variables---useunknownincatchvariables).

This is now the default in all my TypeScript projects ✨
