---
title: I Don't Have a CMS Anymore
date: 2025-11-19T16:00:00+01:00
description: I replaced hugo with plain HTML + Claude Code. Now Claude maintains my website. No CMS, no build pipeline. Just plain files and an AI agent that does the work “by hand.”
---

I used to run this site on [hugo](https://gohugo.io). Standard static site generator setup: write markdown, run `hugo build`, preview locally, deploy. It worked fine, until it didn’t. A hugo update would break publishing new posts and I would let my site sit broken for months. Or trying to get the HTML how I wanted would require me to learn about shortcodes or weird go template language stuff…

**I deleted all of that.**

Now my website is just HTML files. No CMS at all.

When I want to publish a post, I write a markdown or HTML file and then tell `claude`: "publish it.” That's it.

Claude Code has built up its own scripts to convert the markdown to HTML, update the RSS feed, add the post to the homepage and archive, run all the formatting tools, and handle everything else. I don't touch any of it. I've never even looked at those scripts.

**This is an experiment for me: how far can I push a coding agent?** Can we eliminate traditional tooling entirely? Can the robot just do everything "by hand"?

Static site generators exist because manually maintaining a website, keeping an RSS feed in sync, updating navigation, managing archives, etc, is tedious and error-prone.

But **what if the automation doesn't need to be baked into tooling?** What if it can just be... done, on demand, by an agent? What if we can conjure specific, tailored tools when we need them?

No build step. No framework. No abstractions. Just files.

I still write the posts. I wrote this one.

`claude` does everything else.

This is the same pattern as [the library staff metaphor I wrote about recently](/posts/libraries-have-staff). I'm the user of the library. Claude Code is the staff keeping everything organized and accessible for me.

I didn’t realize the anxiety of just dealing with hugo was keeping me from posting. Now, I don’t have an excuse. It’s way too easy to throw some markdown over to the thing and let it figure it out.

## Take aways

**Agents can replace more infrastructure than I expected.** I thought I'd still need some sort of framework or some kind of build system. Turns out those can be coded up on-demand. And if I change my mind, new tools are produced and run just-in-time.

**Simple systems are easier to maintain.** The less abstraction, the more directly Claude Code can work. Bash scripts and HTML files are transparent. Claude can read them, understand them, modify them. No nested packages or dependencies. No magic.

**The agent maintains its own tools.** It built the publishing scripts, and now it maintains them. When requirements change, It updates the code. What a weird future we have created.

## Future experiments

**Local, private coding agent.** I don’t like sending up tons of data to Anthropic just to publish a blog post. Can I make this work with a local model on my laptop? I’m testing that out when I get time…

## Markdown 👑

_Now, my website is simple._ A handful of posts, static pages, an RSS feed. No complex taxonomy, no search, no comments, no dynamic features.

If I needed those things, I might need real tooling again. Or I might not. Maybe a coding agent can just build that stuff too. I honestly don't know where the line is yet.

Maybe we just need markdown files and a really good agent.
