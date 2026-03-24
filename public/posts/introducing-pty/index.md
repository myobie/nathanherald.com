---
title: Introducing pty
date: 2026-03-24T12:00:00+01:00
description: Persistent terminal sessions. Detach, reconnect, peek, drive, and test real terminal processes.
externalUrl: https://www.npmjs.com/package/@myobie/pty
---

I’ve been using [zellij](https://zellij.dev/) full time for a while and while I liked it better than tmux, I kept running into weird issues. I couldn’t scroll when using the [codex CLI](https://github.com/openai/codex). It would use 300% CPU on my Mac while doing almost nothing. Loading sessions from my iPhone over SSH didn’t render well.

I use [kitty](https://sw.kovidgoyal.net/kitty/) which already supports [splits, tabs, and layouts](https://sw.kovidgoyal.net/kitty/layouts/), so all I really need from a multiplexer is the ability to detach from long running processes and come back to them later.

You don’t need tmux, zellij, or any of those other problematic multiplexers. You just need pty.

[pty](https://github.com/myobie/pty) uses [@xterm/headless](https://github.com/xtermjs/xterm.js/tree/master/headless) to run processes inside a real terminal emulator with a real width, height, full interactivity. Run vim, hx, mactop, dev servers, claude code, codex, whatever. Detach, it keeps running. Attach, you are back in it. Attach from multiple clients at once, perfectly fine. Type on one client, shows up on every attached client.

I took it further: pty resizes to the smallest currently connected client, so my phone never tries to render a shell that is meant for my XDR display.

I added a `peek` command where you can spy on a running process without fully attaching, just get a snapshot (ANSI or plain text). And I made it possible to send text or key combos into a background shell from the outside without attaching.

And then I realized: if we can remotely spy on and drive a real xterm session, then we could make a playwright-like terminal testing framework. And so [pty has a testing library](https://github.com/myobie/pty/blob/main/docs/testing.md). Test your CLI or TUI with vitest. Assert on the real output your users see.

pty is inspired by [abduco](https://github.com/martanne/abduco) and [dtach](https://github.com/crigler/dtach), two minimal session managers that do one thing well. I wanted that same simplicity, but with a real xterm emulator underneath and a testing framework on top.

I’m excited to share this first version of pty and I’m looking for feedback. Hit me up on [threads](https://www.threads.net/@myobie) or [mastodon](https://indieweb.social/@myobie).
