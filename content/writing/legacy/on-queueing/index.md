+++
title = "On queueing"
description = "Things can get backed up."
date = "2017-06-29T10:28:44.433Z"
mediumUrl = "https://medium.com/@myobie/on-queueing-460bc14cd6b3"
+++

{{<youtube IPxBKxU8GIQ>}}

When building a web app, or any kind of distributed system, things will probably get backed up. Most people I’ve worked with are surprised if/when this happens the first time. I know I was surprised when I first dealt with it. So remember: _if you use a queue for something, it will queue up eventually._

You might be queueing stuff and not realize it. If you are making HTTP requests from your code then you probably have a request pool. Making a database call probably checks out a connection from a pool or waits in a queue for the next available connection.

At Wunderlist we saw a seemingly simple change have big repercussions when it came to request queueing. Originally most of the Wunderlist backend apps were written in rails and used [unicorn](https://rubygems.org/gems/unicorn/versions/4.9.0). We really wanted to use [puma](https://rubygems.org/gems/puma/versions/3.9.1) to use less memory from forking fewer processes.

According the unicorn documentation:

> Load balancing is done entirely by the operating system kernel. Requests never pile up behind a busy worker process.

This sounds fine. We _assumed_ that’s just how people make HTTP servers. It’s not. A subtle detail about puma is that it queues requests [inside ruby code](https://github.com/puma/puma/blob/master/lib/puma/thread_pool.rb#L26), which means it’s up to the ruby code to manage timeouts and stuff like that. It’s incoming queue is basically unbounded: if you ask it to take a connection, then it will. So it’s up to you to not give it a connection if it’s extremely busy or backed up. _Puma is an extremely well written ruby library and you should read through it’s source sometime._

This reminded me of this article about [queueing with rails on heroku](http://devblog.thinkthroughmath.com/blog/2013/02/27/managing-request-queuing-with-rails-on-heroku/) and it’s worth a read. It pays to have data, graphs, etc to be able to really know what is happening.

We did transition some less critical apps to use puma, but in the end almost all the critical path apps were rewritten in scala (using [play](https://playframework.com)) and so we traded one set of problems for another.

[![People waiting in a line](1-eGTetytn3pVJh6BwfbHrlQ.jpeg)](https://unsplash.com/search/line?photo=VY1EDHABTDE)

### Backing up a bit

Recently I read this amazing article by [Fred Hérbert](https://twitter.com/mononcqc/) about [Handling Overload](http://ferd.ca/handling-overload.html). **You should read it too.** The amount of information in that post is overwhelming.

The basic rule at the beginning is what you need to know: [Little’s Law](https://en.wikipedia.org/wiki/Little%27s_law). From the article:

> \[T\]he capacity of your system is going to be how long a task takes to go through it, \[multiplied\] with how many can be handled at once…

If we can answer 100 requests “simultaneously” and a request takes 200ms on average to complete, then any time there are over 500 requests per second we either queue up, need to apply back-pressure, or drop some requests.

Queueing up is the worst of the three choices IMO. Sitting in a queue means that the average time to process one item is increasing, even though we are not taking longer to do the real work. Every time this happens we start losing capacity slowly. As the average time to handle a request goes up, our ability to answer the newest incoming request before it times out becomes less likely. I believe it’s better to fail fast and let the requester retry later then to let capacity take a dive.

One thing we used to do at LivingSocial during challenging days was to decrease the average time of a request by shutting down expensive operations. Some features had a “feature flag” around them (an if statement) and we could turn off all expensive operations in the critical path to make sure our capacity didn’t drop. This sounds really simple, and that is because it is.

### Take aways

**First:** always be fast. Spending less time on each work item means it’s easier to maintain capacity. Granular work is easier to scale than monolithic work.

**Second:** understand the queues in your system as much as possible. Where can things back up? What are the limits on those queues? Are they unbounded in size? Are there timeouts on the work items? If a work item times out while it’s in a queue, is it removed from the queue or does it persist? Go looking for settings, limits, etc of everything and compile a list of possible capacity killers.

**Third:** collect timing metrics everywhere. Everything is worth measuring. Sometimes you’ll learn that writing to your logs on `stdout` is slowing down your request processing because someone accidentally changed `syslog` to use synchronous `tcp` and not `udp`. It would be easy to think “I don’t need to know how long it takes to write a line of text to the log stream,” but yeah you might need to know that someday.

Have fun. Build cool stuff. Don’t back up if you can help it.

_Any feedback? Did I make a mistake? Am I wrong on the internet?_ [_Send me an email_](mailto:me@nathanherald.com)_._