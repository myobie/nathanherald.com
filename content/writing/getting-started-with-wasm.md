+++
title = "Getting started with WebAssembly (wasm)"
date = "2020-04-04T18:43:21+02:00"
+++

I’ve been super interested in wasm recently for a few reasons:

* First, to understand, like, what is it?
* Second, to use some existing c libraries in the browser for things like hashing or encryption
* And third, to share the exact same code between different platforms

It turns out WebAssembly is really about building an MVP-computer. `.wasm` files are the binary instructions intended for a stack-based virtual machine. A good thing is that the instructions (the `.wasm`), the function table, and the memory are all separate things in an `Instance` of a `Module`. The memory and function table can be accessible from javascript in a browser which ends up being “fun.”

Since it’s a general computer there are infinite uses for it. My interest is in running existing libraries in the browser. I am not interesting in, and don’t recommend, exposing browser APIs into the wasm VM. And I’m not interested in tons of tooling right now: I want to write some code and see it work in the browser.

## Browser-only

I have some _toolchain-fatigue_ right now, so I’ve been writing javascript that just works in browsers without any transpiling for my POCs (proofs-of-concept). It turns out modern browsers are pretty great and you can write almost anything you want and it Just Works™. `import` and `export` work fine. `async` and `await` are super great. `wasm` files can be fetched, instantiated, and you can call into the instance directly. It all works fine without any other tools.

I do like to use a tiny server to serve files out of a directory on a port on `localhost`. I prefer to use [`serve`][serve].

Assuming you have `npm` and `node` installed, you can get setup with an `index.html` and a javascript file like:

```html
<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Yo</title>
  </head>
  <body>
    <script type="module">
      import { main } from './src/main.js'
      // no top level await yet…
      main().catch(e => {
        console.error(e.message)
        throw e
      }).then(() => {
        console.debug('main complete')
      })
    </script>
  </body>
</html>
```

```js
export async function main () {
  console.debug('working!')
}
```

And then to serve these files:

```sh
$ npx serve
```

[serve]: https://www.npmjs.com/package/serve

### Follow along on [GitHub][repo]

I’ve created [a repo on GitHub][repo] where you can follow along if you like. The [README][repo] links to different branches which have the code at different phases of finished.

[repo]: https://github.com/myobie/wasm-getting-started

## `clang` is all you need

There are some projects which try to be a full toolchain to turn any existing code into a wasm set of instructions, but I’ve found them to be heavy and to produce wasm modules that don’t work without modifications.

It turns out [`clang`][clang] can do everything. The best article I found to describe how it works has been [Compiling C to WebAssembly without Emscripten][1] by [Surma][].

[1]: https://dassur.ma/things/c-to-webassembly/
[Surma]: https://dassur.ma

A very simple example to get us started is to add two numbers together. Make a `src/add/` directory and add `src/add/add.c` to it with:

```c
int add(int a, int b) {
  return a + b;
}
```

_A huge advantage for working with this example first is that javascript can communicate integers/numbers with the wasm instance natively. Things like strings need to be communicated in bytes and pointers, which we will explore later. We are also not using the standard library, which we will also explore later._

### Compile

Make sure you have a very new version of `llvm` and `clang` (and make sure it’s not “Apple clang”). I have `clang` version `9.0.1` as I’m writing this.

If you are on a mac then you can `brew install llvm` and then make sure `/usr/local/opt/llvm/bin` is in your path. You can do it like this:

```sh
$ export PATH="/usr/local/opt/llvm/bin:$PATH"
```

This is going to be anti-climactic:

```sh
$ clang --target=wasm32 -Oz -flto -nostdlib -Wl,--no-entry -Wl,--export-all -Wl,--lto-O2 -o src/add/add.wasm src/add/add.c
```

Here is an explanation of the options given to `clang`:

```sh
--target=wasm32     # target wasm
-Oz                 # optimize for output file size
-flto               # output some info that helps the linker optimize
-nostdlib           # we don't need/have a standard library
-Wl,--no-entry      # there is no main function
-Wl,--export-all    # export all functions
-Wl,--lto-O2        # optimize (to the 2 level)
-o src/add/add.wasm # write the .wasm file
src/add/add.c       # our only source file is the .c
```

Cool. But what did it do? We need to use `wasm2wat` to convert from the binary `wasm` format to the plain-text `wat` format:

```sh
$ npx wasm2wat src/add/add.wasm -o src/add/add.wat
```

The output should be:

```wat
(module
  (type (;0;) (func))
  (type (;1;) (func (param i32 i32) (result i32)))
  (func $__wasm_call_ctors (type 0))
  (func $add (type 1) (param i32 i32) (result i32)
    (local i32 i32 i32 i32 i32 i32)
    global.get 0
    local.set 2
    i32.const 16
    local.set 3
    local.get 2
    local.get 3
    i32.sub
    local.set 4
    local.get 4
    local.get 0
    i32.store offset=12
    local.get 4
    local.get 1
    i32.store offset=8
    local.get 4
    i32.load offset=12
    local.set 5
    local.get 4
    i32.load offset=8
    local.set 6
    local.get 5
    local.get 6
    i32.add
    local.set 7
    local.get 7
    return)
  (table (;0;) 1 1 funcref)
  (memory (;0;) 2)
  (global (;0;) (mut i32) (i32.const 66560))
  (global (;1;) i32 (i32.const 1024))
  (global (;2;) i32 (i32.const 1024))
  (global (;3;) i32 (i32.const 1024))
  (global (;4;) i32 (i32.const 66560))
  (export "memory" (memory 0))
  (export "__wasm_call_ctors" (func $__wasm_call_ctors))
  (export "add" (func $add))
  (export "__dso_handle" (global 1))
  (export "__data_end" (global 2))
  (export "__global_base" (global 3))
  (export "__heap_base" (global 4)))
```

We can already learn a lot about the wasm instance vm from this output:

* The function accepts and returns `i32`s which are 32 bit integers
* The file seems to always go in the same order: imports (we don’t have any yet), function signature types, functions, the table, starting memory data, globals, and then exports
* Our `add` function is one of the exports which is great

### `Module` and `Instance`

We can now compile the `add.wasm` into a [`Module`][module] and then [instantiate it][instance]. We should test to see if the browser has `WebAssembly` first:

```js
if (!window.WebAssembly) {
  throw new Error('Oops, WebAssembly not available!')
}
```

_(Maybe later change this to show something useful to the visitor.)_

Most examples I’ve found online use `fetch` to load the `.wasm` file, so we will too. This is the shortest example I’ve found to load and instantiate:

```js
async function load () {
  const response = await fetch('src/add/add.wasm')
  const bytes = await response.arrayBuffer()
  const { module, instance } = await WebAssembly.instantiate(
    bytes,
    {} // we have no imports, so our importObject is empty
  )
  console.debug(module)
  console.debug(instance)
  return instance
}
```

The `fetch` is async, but one could copy the bytes and embed them into the js file if one wanted to. However, instantiating is always async anyway, so I don’t see the point unless you expect setting up and tearing down another HTTP request to be a big deal.

OK, with the instance ready we can use it to add numbers:

```js
export async function add (a, b) {
  const instance = await load()
  return instance.exports.add(a, b)
}
```

I’ll add some example usages to our `main.js` file:

```js
import { add } from './add.js'

export async function main () {
  console.debug(1, 3, await add(1, 3))
  console.debug(1000, 3000, await add(1000, 3000))
  console.debug(123456789, 123456789, await add(123456789, 123456789))
}
```

Refresh and the console should output the answers. You will also notice that the wasm is being loaded and instantiated over and over each time. We can cache the results of `load`:

```js
const cachedInstance = load()

export async function add (a, b) {
  const instance = await cachedInstance
  return instance.exports.add(a, b)
}
```

This means that loading will start as soon as the `add.js` module is imported the first time and then the same `instance` will be shared by all callers. 

## Standard library

To do more than add we will need a stdlib with things like `malloc`, `free`, etc. Communicating `string`s between wasm and javascript involves the javascript using an exported `malloc` to write the string bytes into the wasm's memory and passing the memory address as a pointer to the wasm function 😱

