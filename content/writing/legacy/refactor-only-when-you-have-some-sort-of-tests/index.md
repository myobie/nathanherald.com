+++
title = "Refactor only when you have some sort of tests"
description = "Refactor tractor, as Jess says"
date = "2013-07-11T14:22:50.677Z"
mediumUrl = "https://medium.com/i-m-h-o/refactor-only-when-you-have-some-sort-of-tests-54ab8c4d13b0"
+++

{{<fig
  src="0-UhlBcENy99gkZ-dt.jpeg"
  alt="John Deer tracker">}}
via Odalaigh on flickr.com
{{</fig>}}

_This is an exposition of point 2 from_ [_Be a good programmer_]({{<relref "be-a-good-programmer">}})_._

Most of my time as a programmer is spent reading and refactoring code. Very seldom am I just typing out lines and lines of new code - and even when I am, I usually end up refactoring that new code before it’s shipped out.

By definition, you cannot refactor code without some sort of tests. That’s what refactoring is, changing code without changing the end result of it’s work.

A simple example you probably think is stupid is CSS. Change some styles, refresh the page. The refresh is the test. You, the human, are verifying that you didn’t change the way things look. This even applies to developers refactoring scripts or application code, sometimes a human refreshing is how we know we didn’t change anything.

**There are some key points to know:**

1. If a test has always passed, if it never failed in the beginning, then you don’t know if it’s testing anything

2. If a test fails during a refactoring, it was too granular

3. Your tests only try out your assumptions of how the system works

### Tests gotta fail

Writing tests first is good, because you know they will fail, then pass, then you are good. I don’t always do this, but it’s probably the best idea. TDD as they call it.

If you write some code, then write a passing test for it, you don’t know anything from the test. Nothing.

An example in ruby that I see often is using `assert` instead of `assert_equal`. Like this:

```
assert "foo", some_var 
assert_equal "foo", some_var
```

The first assert will always pass because `"foo"` is truthy. `some_var` is actually being given as the `"message"` argument, which is shown if the assert fails.

If you require a test to fail before it succeeds, this type of mistake wouldn’t happen.

### Tests need to be stable

Changing one line of code shouldn’t break a ton of tests. If it does, your tests are probably too granular to mean much. Trying to assert every little thing about a system is dangerous, because it can lead to only testing small interactions, but never knowing if the entire system even works. I’ve seen rails apps with decent coverage and all tests passing that raise errors all the time.

Try to think about the ins and outs of the system, not the actual algorithms going on inside.

### Your tests are flawed

Yeah, it kinda sucks, but your tests are not adequate. The problem is that you only test how you think the system works. It’s ok though, you can’t really help it.

Applications or websites or whatever act in ways that we would never imagine or predict. It’s pretty cool to see someone use a tool you made for things you never thought of. It also means you didn’t write a test for that scenario.

Honestly, you don’t need to test every scenario. But, if users get used to how something works, even if it’s working in a broken way, they will complain and possibly dissent when it changes.

**The solution:** have someone else look at it and/or use it.

Most problems we work on **are human problems** anyway, the computer parts of things is most times figured out. I mean unless your Facebook and you have a bajillion users so you write your own php. Then you are solving problems no one else has. Then it’s whatever. However, more than likely, you are not Facebook.
