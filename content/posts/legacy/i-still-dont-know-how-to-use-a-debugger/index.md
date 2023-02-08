+++
title = "I still don’t know how to use a debugger"
date = "2018-05-14T21:59:16.124Z"
mediumUrl = "https://medium.com/@myobie/i-still-dont-know-how-to-use-a-debugger-345d1246a641"
aliases = [
  "/writing/legacy/i-still-dont-know-how-to-use-a-debugger/"
]
+++

{{<fig src="1-1t7U5wQWkmueYNUO3o3CXA.jpeg" alt="Illustration of plants and a bug with a little sign reading 'no bugs'" />}}

Since I wrote my first javascript in the computer lab at my High School in VA using Windows 95, I’ve subscribed to the **println debugging standard practice**. Of course then it was `alert`. Either way, if there is a problem, add print statements everywhere.

Well, **it’s time I finally learn how to use a debugger.** The reason: _I wasted two entire days_.

_Do you use a debugger? Do you have any tips or tricks? How can I break the habit of `console.log` or `IO.inspect` or `println` or whatever?_

### Why now?

You see, I really like [erlang](https://www.erlang.org) and [elixir](https://elixir-lang.org). I am playing around with spawning processes and communicating with them for a bit. Erlang has an insane concept called “[ports](http://erlang.org/doc/tutorial/c_port.html)” (nope, not those [ports](https://en.wikipedia.org/wiki/Port_%28computer_networking%29)) and after learning more about it I really like them. You use `stdout` and `stdin` as binary pipes to communicate back and forth. If anyone breaks either pipe, then everyone shuts everything down. It’s a great way to _know™_ you won’t have zombie processes.

Well. `console.log` writes to `stdout`. Of course, right.

I broke my binary communication protocol by attempting to debug a problem. Because I don’t know how to use a debugger. And, honestly, I _fixed_ this problem by continuing to be ignorant and appending log lines to a file instead.

So yeah, I’m frustrated. Again, my lack of CS skills has caused me problems. Very rarely do I wish I were a “traditionally trained” programmer, but this is one of those times. I am going to finally learn this. Eventually. _When I get time._