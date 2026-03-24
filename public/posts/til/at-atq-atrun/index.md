---
title: "TIL: at, atq, and atrun"
date: 2026-03-25T01:00:00+01:00
description: Schedule one-off commands to run later from the terminal. Built into Unix.
---

Today I learned about `at`, a built-in Unix command that schedules a one-off command to run at a specific time. Unlike cron, which is for recurring tasks, `at` runs something once and then the job is gone.

```bash
# Schedule a command for 10am
echo 'toot post "Hello from the future"'  | at 10:00

# List pending jobs
atq

# See what a job will run
at -c 1

# Cancel a job
atrm 1
```

On macOS, you need to enable `atrun` first:

```bash
sudo launchctl load -w /System/Library/LaunchDaemons/com.apple.atrun.plist
```

That’s it. No config files, no services to manage. Just `echo "command" | at TIME` and walk away. Incredible.
