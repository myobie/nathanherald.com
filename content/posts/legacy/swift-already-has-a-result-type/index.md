+++
title = "Swift already has a Result type"
description = "Maybe."
date = "2017-01-23T11:13:32.360Z"
mediumUrl = "https://medium.com/@myobie/swift-already-has-a-result-type-d4ca300429f1"
aliases = [
  "/writing/legacy/swift-already-has-a-result-type/"
]
+++

{{<fig
  src="1-X6Bjvc5hU9Z0PaTeQMpNGQ.jpeg"
  alt="Photo of a poster reading 'Ask more questions'"
  link="https://unsplash.com/@jdsimcoe">}}
Photo by [JD Simcoe](https://medium.com/u/a833450b230) @ [https://unsplash.com/@jdsimcoe](https://unsplash.com/@jdsimcoe)
{{</fig>}}

Over the last few years I’ve had the privilege of writing and deploying applications using a myriad of languages. Scala, ruby, javascript, haskell, clojure, etc. Every time I pick up a tool, especially if it’s new to me, I try to learn [the grain of it](http://frankchimero.com/writing/the-webs-grain/). A programming language is a toolbox of ideas and concepts that anyone can use to build stuff. Yet, I see a lot of dissatisfaction from my colleagues and peeps online with the tools currently available.

There is a great talk about how [swift is not a functional language](https://realm.io/news/tryswift-rob-napier-swift-legacy-functional-programming/) by Rob Napier and you should watch it. It’s a great lesson about how one should use a language how it’s made and not how one wishes it were. However, I was really disappointed that Rob made the case that swift should add a `Result` enum. Swift already has this feature, but I guess a lot of people don’t like it.

Swift has an `Optional` type, but you don’t normally see it directly. You interact with optionals through language constructs. An example:

```swift
struct Person {
    let name: String
    let bio: String? = nil
}

let person = Person(name: "Nathan")

if let bio = person.bio {
    print("\(person.name)’s bio: \(bio)")
} else {
    print("\(person.name) doesn't have a bio.")
}
```

The words optional, some, and none are nowhere to be found in the above example.

`Optional` is basically a “maybe” type and it’s really nice to have support directly in the language for it. Instead of writing a bunch of `case .some` and other similar statements, we can just use `let` and other language constructs to work through detecting if anything is in there.

This example below is similar to a lot of examples I’ve seen for a `Result` type:

```swift
enum Result<T> {
    case success(T)
    case error(String)
}

func isLowerHalf(_ number: Int) -> Result<Int> {
    if number < 50 {
        return .success(number)
    } else {
        return .error("Sorry.")
    }
}

isLowerHalf(70) // error("Sorry.")
isLowerHalf(20) // success(20)
```

At first glance, this seems pretty nice. I’ve added enums like this to a lot of my swift projects. However, recently I’ve noticed that I always end up having to perform a lot of ceremony to extract the values from the enum:

```swift
let result = isLowerHalf(40)

switch result {
    case .success(let value): print("Yes, \(value) is in the lower half!")
    case .error(let value): print("\(value) Not in the lower half.")
}
```

Or one can try to only extract and use the success case:

```swift
if case let .success(value) = isLowerHalf(20) {
    print("OK, that worked, but it's pretty weird.")
}
```

This is a lot of work to fight against the tools that are already in the language. Swift already has a way of marking a function as returning one of two types, one is a success and the other is an `Error`, and it’s `throws`.

```swift
struct NotLowerHalf: Error {}

func isLowerHalf(_ number: Int) throws -> Int {
    if number < 50 {
        return number
    } else {
        throw NotLowerHalf()
    }
}
```

Now we can use the built in facilities of the language to call the function:

```swift
try? isLowerHalf(70) // nil
try? isLowerHalf(20) // 20
do {
    let value = try isLowerHalf(70)
    print("Yes, \(value) is in the lower half!")
} catch is NotLowerHalf {
    print("Not in the lower half.")
}

if let value = try? isLowerHalf(20) {
    print("OK, that worked, and it's not _too_ weird.")
}

let result = try! isLowerHalf(40) // would cause a crash if it failed
```

Many people I’ve talked to say they avoid `throws` because they believe using exceptions for control flow is bad. I agree, exceptions are not reasonable for control flow most of the time.

`throw` does not raise an exception. From [the swift docs](https://developer.apple.com/library/content/documentation/Swift/Conceptual/Swift_Programming_Language/ErrorHandling.html):

> Swift provides first-class support for throwing, catching, propagating, and manipulating recoverable errors at runtime.

Errors are not exceptional circumstances. Recoverable errors are expected and should be planned for.

A function marked as `throws` returns an unsuccessful result of type `Error` and the compiler forces the programmer to handle both the success and error cases. `do` and `catch` are like specialized `switch` and `case` keywords for when a function might return a success or error value and offer the pattern matching features one expects.

And yes, there is `rethrows` to propagate an error up the function stack. I’ve done the exact same thing in scala to “slipstream” an error from a `Result` up during things like a web request. This is control flow using types and pattern matching and I am very glad that it’s built into the language and not something I have to build on my own each time.

The word `try` is the perfect way to explain what I’m trying to accomplish: _try this and if it doesn’t work out then I’ll handle it this other way._ `do` isn’t my favorite word for the start of the try/catch situation, but I can’t think of anything better.

I’m not a swift expert, I don’t use it everyday, and I’d like to hear what you think about this subject. Should swift add a `Result` enum anyway and let the programmer choose between `throws` and `Result`? Or would that fragment libraries where some throw while others are all enums all the way?

Thanks for reading.