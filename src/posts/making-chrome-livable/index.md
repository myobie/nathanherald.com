---
title: Making Chrome livable
date: 2026-04-19T20:29:08+02:00
description: Three Chrome extensions I built to bring Safari habits over.
---

I’ve used Safari consistently since it came out. I’ve only maybe used something different like [OmniWeb](https://en.wikipedia.org/wiki/OmniWeb) or [Camino](https://en.wikipedia.org/wiki/Camino_%28web_browser%29) or Firefox or whatever, but always returning to Safari.

**Enter vertical tabs in Chrome.** I’ve wanted vertical tabs in my browser since OmniWeb. Chrome’s version isn’t perfect, but it is very good. Combined with split views in windows and I am a happy camper. I’ve been using Chrome Beta to get access to the vertical tabs (which should be shipped out in regular Chrome now) for weeks and I love them.

But there are 3 things I miss from Safari and I _had_ to find a way to fix them.

1. [Right click, Translate. Fixed with my own extension.](https://github.com/myobie/translate-selected-chrome-extension) Chrome wants to translate a whole page, but it misses iframes, dynamic content, etc. I almost always only want to translate a small part and in Safari I can select, right click, and Translate. Well, now I can do the same in Chrome using my own extension.

2. When a link opens a new tab in Safari, the back button is enabled and click back closes the new tab and returns to the original tab. Apparently this is something I use 100s of times a day and it has driven me crazy. So I made a [back to opener chrome extension](https://github.com/myobie/back-to-opener-chrome-extension) that does exactly this. This has made things sooo much better for me.

3. I miss 1Blocker. It’s my fav content blocker and I want to have it in Chrome as well. So I built [a python script to analyze the rules inside 1Blocker.app and churn out a custom chrome extension](https://github.com/myobie/unofficial-1blocker-rule-converter-for-chrome) that contains basically the same rules. After some trial and error, it works!

Fixing these three things has made Chrome really livable for me. They also have synced tab groups, just like Safari, so that works too.

Chrome still doesn’t feel like a Mac app, it feels like a Linux app running on my Mac, but it is much closer to my ideal browser now. I’ve been daily-ing Chrome for a few weeks and I anticipate keeping it as my default browser for many more.
