+++
title = "Change as little as possible to fix a problem"
description = "Fix problems. One at a time. Be good."
date = "2013-06-03T15:00:42.178Z"
mediumUrl = "https://medium.com/i-m-h-o/change-as-little-as-possible-to-fix-a-problem-efb4e47e0211"
aliases = [
  "/writing/legacy/change-as-little-as-possible-to-fix-a-problem/"
]
+++

{{<fig src="0-NX88j1cl5kDz0wbK.jpeg"
  alt="Photo of clouds"
  link="https://flickr.com/photos/acme">}}
_via_ [_flickr.com/photos/acme_](https://flickr.com/photos/acme)
{{</fig>}}

_This is an exposition of point 1 from_ [_Be a good programmer_]({{<relref "be-a-good-programmer">}})_._

When a problem arises or a bug is found, it can sometimes be very difficult to determine the exact cause. We have to look through many files and read lots of code to find one line or paragraph of code that is causing the larger issue. It’s tempting to fix other issues as you read through files and classes or what have you. Indenting or reformatting code, renaming arguments, unwrapping map reduce’s into separate methods, and changing comments on unrelated code are fine, just separate from fixing the bug.

A good programmer knows that they should only commit what is needed to fix the bug. It creates a clean history of changes, where this change is easily explained in its entirety. Also, if the need arises to revert the change, one is not also reverting unrelated code. When unrelated code is reverted, sometimes it never makes it back in a separate commit. Fixing a problem can be frustrating and cause one to forget the other little things to go back and include later. 

There is also the problem of introducing more bugs while fixing the original, which is far more likely if extra changes are included. Multitasking is hard. To be the most effective at curing an application’s ailments focus on finding and solving one problem at a time. If you [change one thing a time](http://en.wikibooks.org/wiki/Computer_Programming_Principles/Maintaining/Debugging#Change_one_thing_at_a_time), then it’s much less likely that other, seemingly unrelated, components will be effected. 

If you make changes trying to fix an issue, but the end result is still broken, then revert. [Do not keep unrelated changes](http://en.wikibooks.org/wiki/Computer_Programming_Principles/Maintaining/Debugging#Back_out_changes_that_have_no_effect) until the problem is solved. Unless you have decided to not solve it anymore - which sometimes is a good answer. Not every problem needs to be fixed immediately. Some bugs require research or timing or other humans to be involved, so don’t go committing things until you have the resources necessary to come up with a full fix. 

Experienced developers mentally give different bugs different priorities, but those can sometimes be incorrectly weighted. Maybe a problem effects an api that you never use or you can continue with your daily work, but someone else cannot. I’ve both caused problems for others as well as been blocked on something. The more power you have to fix something, the less likely you are to ever be blocked. 

Any exception is a bad exception. Don't let bugs keep happening, even if they seem inconsequential. They could mask other, real problems, they are taxing on the application since exceptions are usually slower than the normal code path (especially if you send emails or post to an error reporting service), and they are eventually demotivating. Let exceptions be exceptional. 

If you find yourself demotivated to fix issues, then try to setup a reward system or a dedicated time. Have cleanup Friday’s or bug fix Monday Morning’s. Schedule time once a day to fix the most common bugs. You’ll be much more motivated to fix things once a few fixes have gone in, especially if you receive positive feedback from customers.
