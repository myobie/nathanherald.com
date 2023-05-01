+++
title = "Generate a QR Code in your shell with npx, qrcode-svg, and svgo"
date = "2023-05-01T17:54:58+02:00"
externalURL = "https://mastodon.social/@pepelsbey/110222198088406039"
+++

A very interesting shell script snippet from Vadim to quickly generate a QR Code in your shell. A slightly modified of their original script is:

```bash
function qr() {
  npx qrcode-svg --join --no-prettify --viewbox --padding 0 --ecl L --force --output $1.svg $2
  npx svgo --quiet --precision 0 $1.svg
  open $1.svg
}
```
