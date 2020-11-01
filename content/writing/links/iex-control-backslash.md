+++
title = "TIL one can exit iex with ⌃\\"
date = "2020-11-01T22:00:27+01:00"
externalUrl = "https://hexdocs.pm/iex/IEx.html#module-exiting-the-shell"
+++

I’ve been using ⌃C + ⌃C to exit `iex` sessions for years. It turns out that works incidentally by invoking the break menu and then breaking out of that. This single keystroke method seems to be the most straightforward way to signal to the BEAM VM that it's time to quit. 