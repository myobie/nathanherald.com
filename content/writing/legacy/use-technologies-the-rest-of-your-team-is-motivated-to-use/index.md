+++
title = "Use technologies the rest of your team is motivated to use"
description = "For great justice"
date = "2013-07-28T15:56:02.105Z"
mediumUrl = "https://medium.com/i-m-h-o/use-technologies-the-rest-of-your-team-is-motivated-to-use-176a064120a7"
+++

{{<fig
  src="0-jgGS-dUw9YsXZ3lJ.jpeg"
  alt="Sticky notes with stick figure drawings reading Project Success, Communication, Teamwork, and Achievement"
  link="https://flickr.com/photos/kenfagerdotcom">}}
via [flickr.com/photos/kenfagerdotcom](https://flickr.com/photos/kenfagerdotcom)
{{</fig>}}

_This is an exposition of point 3 from_ [_Be a good programmer_]({{<relref "be-a-good-programmer">}})_._

Most of my time is spent either reading or editing someone else’s work. Very seldom does one get to start from scratch when building something for the web – and even then we use frameworks and libraries we didn’t write. It’s very important that the code you choose to include in your projects is compatible with your colleague’s interests and motivations.

You may want to write a new app in go, but no one else does. Then don’t do it. Write a personal app in go or write the app in go, but don’t show them and rewrite it in whatever. **It’s important to leave a legacy of making things easier.** Someone in the future will curse your name during a git blame if you’re not careful. It might even be you.

Most of the developers I work with use ruby, rails, mysql or postgres, redis, memcached, git, etc all the time. Now, I’m pretty fortunate, because those are all awesome things to use. However, I learned this lesson more than once working at Livingsocial: **don’t go against the grain unless it’s worth the friction.** (It might be worth it, but make for certain.)

When I was planning out a new set of apis for their iOS app I had planned to use sinatra and redis. At the time, no team had needed a large redis install, so there wasn’t a primary+secondary pair readily available. _The ops guy told me no._ He said we hire rails people and we use mysql. I was pretty miffed at the time, I felt like I was being kept from doing my best work by being limited.

Sinatra and rails are both ruby, how different could they be? How hard could it be to install and maintain an HA redis setup?

It turns out the answers are: _quite different_ and _very hard_.

When building a core service or library that will be used and modified by any number of people, it’s usually best to be a little boring about it. Sure, go ahead and prototype something in closure. But when it comes time to run something in production that serves millions of users, **boring trumps clever almost every time.** When you are away and no one else even knows how to run the tests in the app – well, that’s when they curse your name.

I’m not advocating that we never push things forward or try out new things. Instead, rally the troops and get everyone involved. If everyone on the team is excited to learn something new, then it won’t matter if you are there or not – anyone can jump in and take care of business. You will learn something new way faster if your colleagues are learning it too. They will discover things you didn’t, you can argue about best practices, and bounce things around so they end up the best they can be.
