---
title: csesh – monitoring and reconnecting Claude Code sessions
date: 2026-03-10T12:00:00+01:00
description: A set of bash utilities for monitoring Claude Code sessions and forcing them to reconnect when remote control disconnects.
---

I [removed the CMS from my website](/posts/no-cms/) and now I just ask Claude Code to make new posts for me. I write the text, Claude puts a markdown file in the right place, runs some tooling it made for itself, and boom it's on my website.

I want to take this further with [Claude Code Remote Control](https://code.claude.com/docs/en/remote-control) so I can make a post from my phone anytime by asking the Claude Code on my home Mac to post for me. But it keeps disconnecting.

So I made [csesh](https://github.com/myobie/csesh), a set of bash utilities for monitoring Claude Code sessions and forcing them to reconnect. It builds on my [pty wrapper](/posts/pty/), since I can not only detach from a process, I can send text to the backgrounded pty from the outside. A script can peek at the pty, send it `/reconnect<return>` to trigger a reconnect, and peek again to see if it worked.

The tools:

- **csesh** lists running Claude Code sessions
- **creconnect** reconnects disconnected sessions
- **ckeepalive** automatically reconnects every 5 minutes

It is my goal this year to make sure I own all my data and eventually own my inference, so I can use a local, open source model instead of Claude for this website. One step at a time.
