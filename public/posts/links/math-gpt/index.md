+++
title = "MathGPT"
date = "2023-03-14T12:20:55+01:00"
externalUrl = "https://mathgpt.streamlit.app"
+++

> Use GPT3 to solve math problems, and get the code behind each solution!

This is pretty cool, it asks [ChatGPT][] to write python code to solve math problems. It is really pretty amazing to see.

I did wonder if it was actually doing the calculation or if it had memorized a lot of calculations, so I did a test that you should not do.

I asked it to find the 67,879,887,654,898th prime number. I feel bad, because it tried to find the prime, and the entire service went down. It was down for about 40 minutes. It did not find the prime.

I’m not sure how one could protect against [DOS attacks][] when the goal is to have a ML model write a computer program, and then execute it. 🤔 One would have real uptime problems without any protections, but maybe that doesn’t matter if the system can timeout anything and just restart itself.

[ChatGPT]: https://en.wikipedia.org/wiki/ChatGPT
[DOS attacks]: https://en.wikipedia.org/wiki/Denial-of-service_attack
