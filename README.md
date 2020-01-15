# nathanherald.com

I'm using [Zeit's Now](https://zeit.co/myobie/nathanherald.com), [hugo](https://gohugo.io/), and [GitHub Actions](/.github/workflows/deploy.yml).

## Flow

Every new post should be a pull-request, will deploy a preview website to now, and merging will deploy the production site.

## The font

I love and use [Whitney](https://www.typography.com/fonts/whitney/overview).

I use the book weight for normal text, the bold weight for, uh, bold, and the black weight for main headlines (h1s). I'll be honest, _my type scale isn't really sensible at the moment._ I'll eventually figure that out.

## Local setup

```sh
$ bin/install
$ git-crypt unlock
```

### Development server

```sh
$ now dev
```
