+++
title = "Had to update Whitney – the font here"
date = "2023-01-08T11:28:25+01:00"
+++

I use [typography.com’s cloud service](https://www.typography.com/webfonts) so I can use the wonderful [Whitney](https://www.typography.com/fonts/whitney/design-notes) here for my personal website 🥰

However, with [the last post I made][last], the artist’s name had a character in it which didn’t show up correctly: ć. This bothered me quite a bit, so I dug into the “Cloud Dashboard” to see what might be the issue, and it turns out the settings (which I assume are the defaults) are to not provide every possible character as part of the font package – I assume to save some bytes.

I changed from “Basic Latin Accents” to “Extended Latin Accents” and now the ć shows up.

{{<fig
  src="screenshot@2x.png"
  alt="Screenshot of the typography.com dashboard, showing the change from Basic Latin Accents to Extended Latin Accents">}}
Working Copy showing the files in the git repository for this website
{{</fig>}}

> Side note: I am not sure if this “Cloud.typography” service is really being maintained. The dashboard UI has never changed, and appears really tiny on any modern computer screen. They don’t really link to the service from their navigation at all anymore, I had to google the service to find the url to its page. They do link to it during checkout, but it makes we wonder if maybe it’s being deemphasized.
> 
> Either way, this is the only way I can use Whitney here, so it’s worth the trouble I guess. 😞 Maybe I should buy the [Digital Type Capsule](https://www.typography.com/fonts/digital-type-capsule/overview), download them for offline use as woff files, and use those instead? 

What’s the lesson? Just use the entire font file, don’t try to be cute and slim it down. You never know when you might want to use a character which the font supports, but with your version doesn’t include.

[last]: https://nathanherald.com/writing/links/ana-vidovi%C4%87-classical-guitar/
[S3 bucket]: https://aws.amazon.com/s3/
