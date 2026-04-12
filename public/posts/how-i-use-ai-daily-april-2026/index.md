---
title: How I use AI daily, April 2026
date: 2026-04-12T18:00:00+02:00
description: Multiple agent sessions, three tiers of automation, a web crawler in elixir, and the goal of a local-first coding agent by the end of the year.
image: /posts/how-i-use-ai-daily-april-2026/og.jpg
---

I keep a list in Reminders for every project I work on. When I sit down in the morning I scan through and pick what to work on. Usually I make a git worktree for the task, spin up [claude code](https://claude.ai/code), and ask it to propose how best to achieve what I’m after. Then I decide: am I writing code or is the agent spiking it out?

All of my work sessions run inside [pty](https://github.com/myobie/pty), a tool I built for persistent terminal sessions. I can detach when I switch or take a break, reattach later, and the conversation is right where I left it and reminding me what I was doing. I jump between pty sessions throughout the day as things need attention – even remotely from my MacBook Air and iPhone.

Some days I have ten things going like a reactor pattern, bouncing between sessions all day. Some days I go deep on one thing and only touch the other sessions during breaks. I let the work decide the shape. It takes real mental energy to context switch this much, like playing multiple chess boards at once. But the sessions are patient. They will be there when I have brain space freed up.

---

I rarely run [codex](https://github.com/openai/codex) directly these days, I use it as a sub-agent. I have a skill configured in claude code to let claude drive codex as a sub-agent. Codex is better at unwinding very complex code or noticing nuanced things, so I let claude dispatch to it and report back the results. My main context stays at the project level and most of the heavy work happens in sub-agents underneath.

---

While I started, like everyone else, trying to build up docs and skills and workflows to prevent claude from making mistakes, I’ve ended up relaxing almost all of it. I’ve removed most of my CLAUDE.md files. Why do I need docs for the robot and not for me? Now I document things for myself and the robot can read those when it needs to.

Everything is context management now. The transformer architecture computes attention weights across the entire context to decide what to generate next. Every token in the context influences the probability distribution of the next token. So when you carefully set up the context, clear problem statement, relevant code, good examples, prior conversation, you are literally shifting the probability distribution toward the output you want.

You are not actually _talking_ to claude. You are attempting to drag the weight of the context into the right starting point so it generates next tokens appropriately to solve your problem. A longer, more detailed context is heavier to drag but lands more precisely. A short vague prompt is light but lands anywhere. The skill is knowing how much context to load and what kind.

[Context](https://simonwillison.net/2025/jun/27/context-engineering/) [engineering](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents) is [real](https://www.philschmid.de/context-engineering) and it is a skill, just like some people are better at googling than others.

---

I wrote about this on my [AI page](/ai/#tiers), but the short version: I run every project at the level of automation that fits it.

**Tier 1, Hands Off.** I am the CEO, the agent is the developer. I never read the code. My personal journal app, my podcast listening app, a handful of CLI tools. The code is not the artifact. The experience of using it is.

**Tier 2, Hands On.** Anything that ships to other people. [new.space](https://new.space/) is in this tier. My cofounder and I review everything carefully. Sometimes I write the code, sometimes the agent spikes it, sometimes we throw the spike away and start over properly.

**Tier 3, Hands Only.** I write near 90% of the code myself because I want to learn. The agent watches, answers questions, handles tedium.

---

My side projects in Tier 1 simply would not exist. A podcast listening app, a personal journal, an image EXIF data manager. I described what I wanted, the agent built them, and I use them every day. I have never looked at the source code for any of them.

For [new.space](https://new.space/) we have a JavaScript file that runs on the page in Safari when someone uses the iOS Share Sheet. It extracts metadata from the page, creates a readable version, handles all the edge cases. Building and testing across dozens of different sites would have been too much effort for our small two-person team, but letting claude hack on it and prove to us it was working made it a project we could actually do. A real increase in quality of life for our users.

---

Today I was working on a potential approval flow for dangerous tool calls in [new.space](https://new.space/) (like "send an email for me"). I pushed claude to build it and use [xcodebuildmcp](https://github.com/nicklama/xcodebuildmcp) to actually test it in the iOS Simulator and prove to me that it works. Then I can try the UI concept myself, give feedback, let it go again. Later today I will test the prototype on my real phone and decide if this is even the direction I want to go.

I do not have to waste time getting the details right just to figure out if the direction is correct. I can have a tireless agent implement it, try it, then decide. And I always have the agent document what it learned and what it would do differently if it had the chance, so if I want to start over I am not starting from zero.

---

I am building a web crawler and search engine in elixir by hand. I want to combine it with a [full download of Wikipedia](https://dumps.wikimedia.org/) for a local offline agent. Crawling millions of sites with a Mac Mini is very possible these days, and with an external drive I think I can easily get to hundreds of millions of pages. I will seed it with sites I trust and it crawls out from there so the inputs are higher quality than trying to index the entire internet.

---

I have built a couple of prototypes for my own agent harness, but nothing good yet. One is in Swift. I think building in a native language and talking to local models natively (not over HTTP) might be a huge advantage, but it limits extensibility and contributions from others.

claude code is my favorite harness right now, but it does a lot of things I probably do not need for every task and might not be optimized for a smaller local model.

For running local models, we built [SHLLM](https://github.com/shareup/shllm), a Swift library for talking to models directly. I also use [ollama](https://ollama.com/) for models too big for my current machine. Qwen 3.5 and Gemma 4 are both genuinely good locally. I plan to get an M5 Mac Studio later this year so I can run larger models myself.

My goal: a local-first coding agent that handles 80 to 90 percent of my day-to-day by the end of this year.

---

I enjoy programming, but it is not important to me to preserve it as "my job." Typing has never been the goal. Anyone who thinks they should fight for the right to type is not on my side. I am fine with someone else typing. I am not 100% thrilled about being a manager of robots, but it is possible to make it fun and keep it lively with a bit of enthusiasm.

---

The worst things that happen with agents are when they touch git. For most projects I handle all the git stuff myself. I do not let the robot do it unless it is a throwaway project. Git is hard for most humans and I would not trust them to use it for me either.

---

I have been pretty clear eyed about AI. I am always skeptical of claims until I see evidence. When I saw claude code when it first came out I knew I needed to try it myself. And when it was able to do a few things I asked it to do, completely by itself, I knew I could mold it into a lot of other projects.

A random text generator running fast enough can do anything with a verification loop. [Monkeys on typewriters writing Shakespeare.](https://en.wikipedia.org/wiki/Infinite_monkey_theorem) The verification loop is what makes it real.

---

This is how I use AI today and I expect things to evolve and change as the tools and models evolve and change. If someone is telling you that AI can’t do anything useful, ignore them. If someone is telling you that AI can do everything, ignore them. Both types of people do not have your best interest in mind.

Try one of the high quality AI coding agent harnesses with a capable model and see for yourself. Be aware: free or low paid tiers are not good enough yet. You are getting worse models running on worse hardware with worse limits. This is unfortunate right now and part of why I am pushing to build a local-first, offline-first setup for myself that is capable.
