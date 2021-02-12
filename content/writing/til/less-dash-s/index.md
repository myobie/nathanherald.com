+++
title = "TIL about less -S"
date = "2021-02-12T12:55:10+01:00"
+++

I was pretty frustrated by some tools that kept outputting way too much info in my terminal so I read through `man less` and finally found the option to not wrap (`-S` or `--chop-long-lines`) and allow lines to scroll off the right edge. _One can move around with the left and right arrows to see all the info._

{{<fig
  src="screenshot@2x.png"
  alt="Screenshot of man less showing the documentation for the -S flag" />}}
