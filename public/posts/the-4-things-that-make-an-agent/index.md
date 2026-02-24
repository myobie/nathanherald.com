---
title: The 4 things that make an "agent" today
date: 2026-02-24T15:52:16+01:00
description: The definition of an "agent" has expanded beyond just an LLM with tools in a loop. Today it's four things — tools in a loop, scheduled tasks, memory, and skills. Plus why coding agents on your own hardware are the future.
---

# The 4 things that make an "agent" today

Six months ago, we agreed on a definition for an "agent:" [an LLM with tools in a loop][1] [iterating toward a goal][2]. But recently the definition has expanded. While the entire industry has slowly been figuring out what "an agent" is by trying different things, [OpenClaw][3] certainly has captured a lot of people's imaginations and helped crystallize what people _think_ an agent _should_ be able to do.

[1]: https://simonwillison.net/2025/Sep/18/agents/
[2]: https://simonwillison.net/2025/Sep/30/designing-agentic-loops/
[3]: https://openclaw.ai/

## An agent today is 4 things

1. Language model with tools in a loop
2. Scheduled tasks
3. Memory or session persistence
4. Skills

This has become the standard packaging for an agent over the last 6 months. This is basically how OpenClaw describes itself, [Notion's AI agent][4] has roughly the same ideas, and even [Claude][5] and other products from frontier labs are describing themselves in similar ways.

[4]: https://www.notion.com/help/guides/get-started-with-your-personal-agent-in-notion
[5]: https://claude.ai/

**Language models with tools in a loop** is the foundation everything else is built on. The model _reasons_ about a problem, calls a tool, sees the result, and decides what to do next until it reaches its goal or gets stuck. This is the core mechanic, the _engine._

**Scheduled tasks:** everyone seems to always ask agents to "remind me to do this tomorrow", "every Monday and Thursday morning prepare and show me a report about…", "watch this web page and tell me when the price drops…", etc. So this has become table stakes for an agent: can it queue things up for later or to happen regularly? OpenClaw has the [`HEARTBEAT.md`][10], but a sqlite database would work fine as well.

[10]: https://docs.openclaw.ai/gateway/heartbeat

**Memory or session persistence:** the agent needs to not forget everything all the time. Coding agents already have this: you can resume work from the past to jump right back where you were. General agents need this as well.

Simon Willison [has argued][1] that memory is just "more tools," that you can bolt long-term memory onto the basic tools in a loop definition with a read/write memory tool. I think that undersells it.

Long term session persistence is a hard problem because language models have limited ["context windows"][9], so coding agents today implement lossy _compaction_ which isn't great. Everyone is looking for better ways to _remember_ right now.

[9]: https://www.ibm.com/think/topics/context-window

**Skills** are what really captures people's imaginations: **agents can do things on your behalf.** There are even "skill files" that are [almost a standard][11] at this point.

[11]: https://github.com/skillmatic-ai/awesome-agent-skills

The most useful skills are the authenticated ones: like access to your calendar, email, messages, notes, etc. These are also the scariest, the agent could [run away with or delete your emails][12].

[12]: https://www.threads.com/@firerock31/post/DVHGBX2Epgq?xmt=AQF0a-tPvV_-XenNgad1ks8gRHKKJnD-NzAhV2CEDbaVfA

### A note on security

Unless you know how to build secure systems, don't run something like OpenClaw with your real email credentials or trust some SaaS to run it for you. Don't let anyone tell you your credentials are encrypted or that their system is 100% secure or any other nonsense. Nothing is 100% secure, the goals are always:

1. Minimize risk
2. Minimize blast radius
3. Increase your confidence in the system
4. Not be too annoying (or you might turn off the security features)

Doing those things iteratively over time is the only way to actually produce a secure system of any kind.

Also: most best practices for security assume the code we write and execute is trustworthy and we are protecting ourselves from someone gaining access to our systems or seeing our credentials fly by. However, **now the program itself is both dangerous and untrustworthy and can execute arbitrary code.** So if you are not an expert, please know any advice you read might just be coming at this from the wrong angle in the first place.

The agent cannot be trusted with your real credentials or to execute code outside of any sandbox. There must be clear boundaries.

It doesn't matter if your credentials are encrypted at rest if the agent can see them in plain text while it is calling the gmail api to delete all your emails, or worse it starts forwarding your emails to some rando.

I believe any system can be made "secure" for an acceptable definition of "secure," even an agent. And while [there are projects to try to wrap OpenClaw,][13] I am suspicious if it can ever be fully "wrapped" up like that. It really needed to have been built with security and privacy in mind from the start to really get to a place where I would feel confident in it.

[13]: https://github.com/dedene/claw-wrap

## Coding agents on your own hardware are best

I have two personal opinions that I will layer on top:

**1. The best agent is a coding agent and 2. the best place to run an agent is on your own hardware.**

**All agents will be coding agents soon, I predict.** A coding agent can build custom solutions to get to a goal, it can create new skills on-demand, and the programs it writes can be audited, tested, and easily modified. Claude (the non-code one) will already write and execute python code on demand to do things like make word and excel documents… so it already is a coding agent some of the time.

**_Writing executable code that statistically is very close to correct is way more useful and valuable than writing prose that is statistically very close to correct._**

For privacy and security, your agent(s) should run on your hardware. SaaS doesn't seem like a good fit for highly personal agents that can take actions on your behalf. [This is why Mac minis have been flying off the shelves.][6]

[6]: https://www.tomshardware.com/tech-industry/artificial-intelligence/openclaw-fueled-ordering-frenzy-creates-apple-mac-shortage-delivery-for-high-unified-memory-units-now-ranges-from-6-days-to-6-weeks

Your data lives on your device (or in some cloud you chose that your device is connected to) and you shouldn't need to transmit all of that up to someone else's servers just to tally up how my workouts have been going recently… or whatever it is I want an agent to do. Right now it is difficult to directly run a good model locally, so a _local agent_ might still use Claude or ChatGPT for inference.

For local inference, [ollama][7] lets you run open-weights models on your own machine. [`qwen3-coder-next`][8] is a very impressive model for being so small (80B, 85GB at 8-bit) — it very well could power a sophisticated agent today on a high-memory Mac Mini or similar hardware.

[7]: https://ollama.com/
[8]: https://ollama.com/library/qwen3-coder-next

We've been working hard [at my day job](https://new.space/) making it easy to run AI in a private space, and we want to show what a safe, private, capable agent can look like. [Follow our newsletter](https://shareup.world/) for new capabilities coming very soon.

## Where this is heading

OpenClaw showed people what's possible, even if [the security story is pretty scary for it][14].

[14]: https://www.crowdstrike.com/en-us/blog/what-security-teams-need-to-know-about-openclaw-ai-super-agent/

The _pattern_ is what matters, not any single project. Tools in a loop, scheduled tasks, memory, and skills. This is the architecture. Better implementations are coming, ones that are built with security from the ground up, that run on your own hardware, and that treat the agent as untrusted code by default.

## What is your use case for an agent?

What would you use one of these autonomous agents for? What does your dream agent look like?

Hit me up on [mastodon](https://indieweb.social/@myobie) or [threads](https://www.threads.com/@myobie), I'd love to hear what you think.
