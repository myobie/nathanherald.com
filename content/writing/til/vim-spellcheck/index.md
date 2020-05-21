+++
title = "TIL about vim’s spellcheck"
date = "2020-05-21T16:05:13+02:00"
+++

I’ve been using vim for years, but I’ve never took the time to learn how to do spellcheck. Instead I always open [iA Writer][] if I need spellcheck. However, I have made way too many spelling errors in code comments or quick files and today I decided to learn how to check the spelling of a document.

Today I added this to my `.vimrc`:

```vim
" spellcheck
command Sp setlocal spell spelllang=en_us
command Spoff setlocal nospell
```

I only want spellcheck to be on in a single buffer at a time and not by default. After it’s enabled one uses `]s` and `[s` to navigate to the next and previous spelling error. With the cursor inside a problem one can use `z=` to bring up a list of suggestions for replacement. It’s been great. Below is a screenshot of this file for example.

{{<fig
  src="screenshot@2x.png"
  alt="Screenshot of this document in vim with spellcheck turned on" />}}
