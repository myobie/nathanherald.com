---
title: pty – a wrapper for detaching from long running processes
date: 2026-03-09T12:00:00+01:00
description: I made a pty wrapper that lets you detach from and reconnect to long running processes, without needing tmux or zellij.
---

I opened my laptop this morning and my existing zellij sessions were using 300% CPU and tons of memory. And it occurred to me: I don't really need all this multiplexing. I just need to detach from a few important long running processes.

So I made [a pty wrapper](https://github.com/myobie/pty) for exactly that. No session management, no window splitting, no status bar, just the ability to keep long running processes alive and reconnect to them. It uses xterm/headless for compatibility with applications like vim.

The goal is you can connect to processes from any kind of shell: ghostty, tmux, iTerm, a terminal over ssh, and all at the same time. The server allows multiple connections per process. This has felt way more flexible to me and therefore more unix-like.

I'm also working on a websocket API for the pty server. I plan to keep iterating on this over the next month. Is this something you'd be interested in using? Try it out and [let me know how it goes on Mastodon](https://indieweb.social/@myobie).
