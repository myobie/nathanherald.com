+++
title = "hub-sync(1) - Fetch git objects from upstream and update local branches."
date = "2020-07-15T10:55:35+02:00"
externalUrl = "https://hub.github.com/hub-sync.1.html"
+++

TIL about `hub sync` which will fetch `origin`, merge into the local `main` branch if possible, and delete any local branches that were deleted remotely 🙌 

If you don’t already use [`hub`](https://github.com/github/hub) then I recommend you take a look ASAP. I’ve use `hub pull-request` for some time, but never looked at all the commands it offers like `sync`.

_I `alias git=hub` so I can type `git sync` to catch everything up and I ❤️  it._
