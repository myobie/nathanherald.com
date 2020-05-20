+++
title = "TIL about :lcd in vim"
date = "2020-05-15T14:25:59+02:00"
+++

`:lcd` can be used in `vim` to change the directory for a single window (split) which [fzf][] respects and any window/buffer I open from there inherits the same local directory.

I've been using this to have one instance of vim open and keep different projects open in different tabs and it's working well.

[fzf]: https://github.com/junegunn/fzf.vim
