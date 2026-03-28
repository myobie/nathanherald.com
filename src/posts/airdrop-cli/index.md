---
title: airdrop CLI
date: 2026-03-28T13:00:00+01:00
description: A small macOS CLI that opens the system AirDrop sharing flow for one or more files.
---

I was surprised there wasn’t already an AirDrop CLI on macOS, so I made one. A tiny CLI that opens the AirDrop sharing flow from the terminal. `airdrop file.txt` and the system AirDrop sheet pops up.

<video width="560" controls>
<source src="demo.mp4" type="video/mp4">
</video>

It’s a few lines of Swift, built with SwiftPM. Install it with `./install.sh` and it drops a binary into `~/bin/airdrop`.

```bash
airdrop /path/to/file
airdrop /path/to/file1 /path/to/file2
```

Source on [GitHub](https://github.com/myobie/airdrop).
