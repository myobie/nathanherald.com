+++
title = "The original Wilhelm Scream recording session"
date = "2023-04-21T10:25:56+02:00"
externalURL = "https://blog.freesound.org/?p=1515"
+++

I was really intrigued to hear the original recording of the famous [Wilhelm Scream][], including the context and direction given to the performer. Craig Smith is an audio preservationist and took great pains and care to get the audio from the _Sunset Editorial Sound Effects Library_ collection of tapes, which were used in many TV since the 60’s – the most famous sound being the [Wilhelm Scream][].

Craig uploaded the sounds to [freesound.org](https://freesound.org/people/craigsmith/sounds/675810/) under a public domain license, and I used `ffmpeg` to transform the `.wav` file to a `.mp3` so that you can play the original Wilhelm Scream recording session right here:

{{<audio src="scream.mp3">}}
  [Listen over at freesound.org](https://freesound.org/people/craigsmith/sounds/675810/)
{{</audio>}}

> _Converted with the terminal command:_
>
> `ffmpeg -i scream.wav -vn -ar 48000 -ac 1 -b:a 192k scream.mp3`

_Found via [waxy.org](https://waxy.org/2023/04/restoring-the-original-wilhelm-scream-recording-session/)._

[Wilhelm Scream]: https://en.wikipedia.org/wiki/Wilhelm_scream
