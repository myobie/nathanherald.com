+++
title = "Your metrics might be lying to you – an example from Wunderlist"
date = "2020-05-11T14:48:33+02:00"
+++

We all love to see “increased engagement” from customers using the products we create, but it’s not always as clear as it might seem if the increase is positive or negative. It’s sometimes dangerous to have the singular goal to “increase usage of this feature” instead of “help customers get more done.” And even then, when we our goal is 100% focused on helping the customer be a better human, we can sometimes misread the metrics we are collecting.

[TK some sort of screenshot that shows the notification bell]

At Wunderlist, the *notifications about recent activity* feature was akin to the limit theorem: we iterated and iterated, but it always seemed like we couldn’t get to our ideal place to help customers see and understand what’s been happening in their lists. I believe we did our best, but there is one time where we thought we had improved things and it ended up we had done the opposite.

We instrumented the apps to let us know when someone clicked on the *notification bell* and we saw that hardly anyone was clicking on it. So we went to work: how could we help people know there is useful information in the *notifications popover*. 

[TK bell with red dot]

We added a red dot to indicate “hey, there’s some new stuff here.” Clicking to show the *notification popover* would remove the red dot *(until later when there are moar new activity)*. 

And our metrics would way up for clicks on the *notification bell*! **Success.**

Luckily, we dug a bit deeper into the stats and we noticed a strange occurrence: often there were two clicks from the same device in rapid succession, both clicks in less than two seconds. We assumed we had made a mistake in our apps and they were reporting the click twice. But we couldn’t reproduce this ourselves and it wasn’t reported twice every time, just often.

[TK animation of a mouse clicking the bell to show the popover, then clicking again to hide the popover. the red dot is gone at the end of animation. it should loop after some delay.]

We realized our customers were clicking once to show the popover, then immediately again to hide it.

It turned out this was to remove the red dot we added from the UI. **Our metrics were lying:** positive engagement with notifications wasn’t going up as we had thought. Instead, we were annoying people.

Like I typed above: we never got the notifications feature to the point we wanted and that’s OK. Some features are infinite projects, require continual investment and adjustments, and are made incrementally better over time.
