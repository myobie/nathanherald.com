+++
title = "TIL how to fix a formula conflict when updating brew"
date = "2020-12-31T12:39:48+01:00"
+++

Today, when updating brew, a formula I had made local modifications to had a conflict and had the `<<<<<` markers inside the ruby code, so it couldn't function properly anymore. I was trying to find a quick way to just accept whatever the latest version of the formula is without my changes and this is what I came up with:

```sh
$ NAME=whatever && cd $(dirname $(brew formula $NAME)) && git checkout origin/master -- ${NAME}.rb && cd -
```
