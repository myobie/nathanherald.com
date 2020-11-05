+++
title = "TIL ⌃\\ sends SIGQUIT to the foreground process"
date = "2020-11-05T15:05:38+01:00"
+++

Following up on my [previous TIL post about `iex`][prev], I learned today that I didn't understand control characters in my shell at all. Running `stty -a` shows my current shell settings:

```sh
$ stty -a
...
cchars: discard = ^O; dsusp = ^Y; eof = ^D; eol = <undef>;
	eol2 = <undef>; erase = ^?; intr = ^C; kill = ^U; lnext = ^V;
	min = 1; quit = ^\; reprint = ^R; start = ^Q; status = ^T;
	stop = ^@; susp = ^Z; time = 0; werase = ^W;
```

Control + backslash is right there, labelled as "quit" meaning it will send `SIGQUIT` to the foreground process. Super handy.

[prev]: /writing/links/iex-control-backslash/
