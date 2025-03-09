+++
title = "TIL about HTTP Client Hints"
date = "2020-12-16T12:30:08+01:00"
externalURL = "https://tools.ietf.org/html/draft-ietf-httpbis-client-hints-06"
aliases = [
  "/writing/til/client-hints/"
]
+++

While reading [this article by Umar about considerate javascript][article] I was surprised to see the `<meta http-equiv="Accept-CH" …>` method for appending request headers for client information! It's called [Client Hints][ietf]. Sadly, it seems [it's Chrome-only][ch] 😔.

This also lead me to the [Network Information API spec][net] which would be super useful, but [is also Chrome-only][ni] 😔. The amount of Chrome-only APIs is ever growing and seems unstoppable, since all the browser makers rarely agree on priorities.

[article]: https://umaar.com/dev-tips/242-considerate-javascript/
[ietf]: https://tools.ietf.org/html/draft-ietf-httpbis-client-hints-06
[ch]: https://caniuse.com/client-hints-dpr-width-viewport
[net]: https://wicg.github.io/netinfo/
[ni]: https://caniuse.com/netinfo
