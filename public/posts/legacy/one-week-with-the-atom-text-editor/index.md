+++
title = "One week with the Atom text editor"
date = "2018-03-26T21:09:16.271Z"
mediumUrl = "https://medium.com/@myobie/one-week-with-the-atom-text-editor-1134aa0320fe"
aliases = [
  "/writing/legacy/one-week-with-the-atom-text-editor/"
]
+++

Every time I sit down to work I like things to be as similar as possible to the last. However, I do know that there are new tools, techniques, and ideas out there that would pass me by if I didn’t change things up every now and then. So this past week I’ve been using a different text editor.

I normally use [vim](https://www.vim.org). Well, I actually use [neovim](http://neovim.io), which is a fork of vim. Well, really vim was a fork of [vi](https://en.wikipedia.org/wiki/Vi) long ago. The complexity of vim is so high, it’s even hard to explain it’s name, which version I use, etc. Vim is so confusing there is a question on Stack Overflow about it that has been viewed over 1.4 million times: “[How to exit the Vim editor?](https://stackoverflow.com/questions/11828270/how-to-exit-the-vim-editor)”

There is [a Quartz article](https://qz.com/990214/a-million-people-have-visited-this-web-page-explaining-how-to-close-vim-a-notoriously-difficult-text-editing-program/) about that question and the history of vim being difficult. It’s over 30 years old, depending on which version you count. I never recommend vim to people. You really shouldn’t use it unless you want to be super unproductive for six months while you learn it.

Either way, this past week I didn’t vim. Instead I used [Atom](https://atom.io), which was created by [GitHub](https://github.com) and is based on their open source [Electron](https://electronjs.org) framework.

{{<fig src="1-7muQ9MmmrJ8q2DnrQVZTZQ.png" alt="Screentshot of the Atom editor Welcome Guide" />}}

### The Good

Atom has been around long enough to have plugins for everything. It is very unlikely that there isn’t a plugin for your favorite language. One can also customize the UI a lot: you can see above that I’ve hidden the normal title bar and file drawer and it looks really slick.

There is an official plugin for editing concurrently with others named [Teletype](https://teletype.atom.io). This was what really intrigued me to download and give Atom a spin: **built in collaboration.** It works and I really like it. Every other real-time text editing plugin I’ve used has been awful to setup and not really worked well for long periods of time. This really seems to be done right.

It’s super easy to install plugins and packages. The available color schemes are very good as well. The editor defaults are great: it’s the best default setup I’ve ever seen for a text editor. One can download this thing and get working immediately.

{{<fig src="1-7b7JphTAKxI9XJJQaxL0pg.png" alt="Screenshot of source code in Atom" />}}

### The Bad

It can be slow.

Electon (which Atom is built on top of) is a version of [Chromium](https://www.chromium.org) (the open source browser Chrome is built on) and the UI is all web technologies. Something about those super old text editors that is hard to beat is _when you type it shows up immediately._ I’m not saying Atom is too slow for me: I have used it for an entire week and I enjoyed it. However, it really is noticeable sometimes.

It also uses a ton of RAM. This doesn’t matter on my iMac, but on my MacBook this can be a problem. Last week I ended up running Slack (also Electron, so also a Chrome), Atom (another Electron), Microsoft Teams (also Electron, believe it or not), some docker containers, and then Mail and some websites in Safari and I noticed a big difference. Sure, just Atom alone isn’t really a problem. But having a lot of apps that each need the more RAM that most programs hurts my sad little laptop.

### The Ugly

It just doesn’t work sometimes. When I try to find a file by typing a few characters, Atom will tell me that it is still indexing or that my project contains zero files. A restart of the app normally fixes the issue. This was a problem on my super fast iMac as well, so it’s not a performance issue. I took some screenshots.

{{<fig src="1-8j9R2Nfm8svRDxPdzUYosg.png" alt="Screenshot of panel reading 'Indexing project…'" />}}
{{<fig src="1-hUkAEyrUnIcsZwPIlrHg6A.png" alt="Screenshot of panel reading 'Project is empty'" />}}

When I use vim I have [ripgrep](https://github.com/BurntSushi/ripgrep) feed a file list into [fzf](https://github.com/junegunn/fzf) and it works every time and works immediately. There is no caching: it just is able to scan the entire project very quickly every time. It’s easy to get spoiled by things working so fast and it’s really frustrating that Atom doesn’t work at least similarly fast (and sometimes not at all).

### So, what’s the verdict then?

**Atom is really great.**

Just the statement “I have ripgrep feed a file list into fzf” is super complex and confusing and that’s what it’s like using vim. I deal with configuring stuff like that all the time and it does get tiring.

Atom is a single thing to install and it generally works. It includes collaboration features, it has plugins for anything that are easily installed from inside the program, and it has the best defaults of any text editor I’ve ever used.

**I recommend trying it out.**

What do you think of Atom? How often do you try other editors or tools?

I’m going to back to vim. Vim is a problem: once you get into it it’s hard to ever use anything else. I’m glad I tried Atom and next time I need to collaborate on some code with someone I will fire it up immediately.