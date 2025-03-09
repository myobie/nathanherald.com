+++
title = "Document semi-wacky — wacky things"
description = "Sometimes, there are things that need to be documented."
date = "2013-12-05T09:42:53.595Z"
mediumUrl = "https://medium.com/@myobie/document-semi-crazy-wacky-things-d578a34fd6a"
aliases = [
  "/writing/legacy/document-semi-wacky-wacky-things/"
]
+++

_This is an exposition of point 4 from_ [_Be a good programmer_]({{<relref "be-a-good-programmer">}})_._

### So when do you document anything?

**When it’s wacky or super difficult.**

Thing’s aren’t always simple. Payment processors, email systems, history tracking, and other things can get really complicated fast and sometimes you just need document how it works. [Tumblr’s api](http://www.tumblr.com/docs/en/api/v2#auth) uses some complicated signing (HMAC-SHA1) for requesting an oauth token and [it turns out](https://github.com/tumblr/tumblr_client/blob/master/bin/tumblr#L27-L51) it’s not exactly the simplest thing ever and [even wackier](https://github.com/myobie/fetcher/blob/master/services/tumblr.rb#L56-L72) if you don’t want to use any external libraries. That really needs to be documented. It’s wacky.

When integrating with payment systems like paypal or authorize.net or braintree you just gotta do things a certain way and it would help the next person if you documented the order or operations, the libraries used, and the “why?” Asynchronous operations are also notoriously hard to follow, so it’s usually a good idea to put some comments in about when and where things might happen. Job queues, notifications, or feedback loops are all candidates for documenting more than normal.

### When should you not document things?

Pretty much the rest of the time.

Code _should_ speak for itself. Of course. If a programmer’s job is done well, then anyone can get up to speed on what’s going on quickly without having to read too many docs.

Docs that are useless include things like @public or @private or listing out the types for the args for untyped languages (foo(String:bar)). Code examples showing the use of the methods are usually not a good idea because they get out of sync. **If the method is being used in the project, then it’s example usage is already documented.**

A method has three chances to document itself:

1. Using an appropriate name
2. Not being too long
3. Being consistently used throughout the application

#### Use an appropriate name

If a method sends an email, name it as such. But don’t hide indirect side effects. Recently at work we noticed a method named find\_by\_identifier that actually will either find something, create something, and also possibly send an email. It didn’t start out that way, but as the product evolved it gained new responsibilities.

That does not mean the method should have been refactored — refactoring is to change the method’s instructions without changing behavior. Instead, it needs to be re-specified and re-implemented. It’s a **new** thing and deserves that kind of consideration.

#### Don’t be longer than a few lines

The more things a method does, the harder it is to build a mental model of the product or feature one is working on. Having small methods makes refactoring easier and causes less test breakage in the long run. Specify, implement, and refactor until each method is understandable and small.

Don’t worry, you’re not writing a timer for the nuclear missiles. Or, if you are, you shouldn’t listen to me. Seriously.

#### Be consistent

If you create a `find_by_email` method and usually use it like `find_by_email(params[:email])` but then one time you pass in some strange object like `find_by_email(Email.first)` then I am now confused. I thought `params[:email]` was always a String, but now I don’t know. I gotta go digging to learn more to figure out what’s going on.

Do you really need to support both String and Email objects? **Probably not.** Do `find_by_email(Email.first.address)` or `find_by_email(Email.first.to_s)`.

### OK. OK. How do I document this stuff?

#### Be succinct

When you do need to document, it’s best to keep the documentation as close to the actual code as possible — so that means comments. I really like [TomDoc](http://tomdoc.org/) for backend application code It’s quick and simple and helps keep everything consistent.

For javascript I really love [docco](http://jashkenas.github.io/docco/). It’s beautiful and inline. I’m considering moving almost all of my docs to this style.

#### And Libraries

Take the extra step to outline regular usage examples, lists of classes and methods, and maybe answer some frequently asked questions. Since multiple random people might be using the code it needs to be really well explained.

[One of my favorite projects](http://www.sinatrarb.com/documentation.html) has pretty decent documentation. And [Rails’s guides](http://guides.rubyonrails.org/) are pretty great, but the [regular api docs](http://api.rubyonrails.org/) are pretty sad. Sure they list out the methods and everything, but some are missing or just have no documentation at all. This is something _we_ can fix.

I need to know how to install, configure, and do basic tasks with your tool quickly. **Put all of that in the README.**

### Anything else?

**What did I miss?** This is the end of the four part series. What did I leave out or what could I do to make it better?
