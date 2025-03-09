+++
title = "Going public"
date = "2020-01-15T14:08:05+01:00"
aliases = [
  "/writing/going-public/"
]
+++

Today I've done something that I've wanted to do for some time: **I've made the source code for my website public on [github.com][repo] and you can see how the website is built and deployed.**

[repo]: https://github.com/myobie/nathanherald.com

I'm starting a new work journey, founding a new thing named [Shareup][shareup] with [a colleague][], and I've spent the past week working on a new website for it. I want to use a few specific programs and services:

1. Assemble the website with [hugo][]
2. Host the website using [zeit's now][now] service
3. Keep the website up to date by deploying every change with a [GitHub Actions][actions] workflow

[a colleague]: https://anthonydrendel.com

I also want to use the exact same setup for [this here website](https://nathanherald.com) and so I've been using my website as a test area to figure out how best to work with [hugo][], [now][], and [actions][]. After struggling at this for a week, I've gotten it working and I wanted to document what I've learned so I remember (and maybe it's helpful to you too).

You can see the complete source for everything over on GitHub at [github.com/myobie/nathanherald.com][repo].

[shareup]: https://shareup.app
[hugo]: https://gohugo.io
[now]: https://zeit.co/now
[actions]: https://github.com/features/actions

## TL;DR

* I def recommend [hugo][] for building static websites
* I def recommend [now][] for hosting static websites
* I think [GitHub Actions][actions] are great and promising, but they are confusing and not always fully documented
* I spend way too much time making concessions so I can use [this font][font]

This post is pretty long, so here are links to the different sections:

* [Using hugo](#using-hugo)
* [Using now](#using-now)
* [Hosting the font somewhere else](#hosting-the-font-somewhere-else)
* [Generating predictable preview URLs](#generating-predictable-preview-urls)
* [Building a workflow with GitHub Actions](#building-a-workflow-with-github-actions)
* [Putting it all together](#putting-it-all-together)

## Using hugo

I've been making websites with [hugo][] for a while now so I can quickly setup and [configure][] a new hugo website pretty quickly. **The feature of hugo I like the most is its speed.** It's important to me that assembling my website is super quick. I also like that it's a single binary which means I don't have to figure out how to "install" anything.

[configure]: https://github.com/myobie/nathanherald.com/blob/9f7b8e22b1876ab775d4c1e6e67b059121f60b35/config.toml

## Using [now][]

[zeit's now][now] is a fantastic way to host a static website. Getting started with [now][] is super easy, one simply runs `now` in the terminal and it creates a project, deploys, and even copies the resulting URL to your clipboard. It's almost too easy: I've accidentally created a new project a couple times by renaming a directory and zeit deciding "this is a new website" instead of "this is the same website in a new folder." 

## Hosting the font somewhere else

I have a strange and specific requirement for my website because of my [font][]: **the font I've chosen can only be loaded from certain URLs that I need to know ahead of time.** I also don't have permission to "host the font" anywhere publicly ([like this repo][repo]) and those two things meant I needed to do some extra work before I could make the source code for my website publicly viewable.

[font]: https://www.typography.com/fonts/whitney/overview

### Putting the font on S3

I decided to zip up the fonts and put them in an S3 bucket. Then, when now is building the website, it can retrieve them using [s3cmd][]. 

Also, I learned a valuable lesson a while back: **never create AWS resources using the UI.** Creating through the UI means it's easy to forget how or what is setup. 

Instead, **I use [terraform][] for everything I need.** There is a pretty big upfront cost because I can never remember how exactly to create the terraform files.

> _I do create users in the UI because if one uses terraform then it's easy to accidentally store their secret key in a `.tfstate` file or something similar and I don't want to risk it._
> I created a user with zero permissions.

I put some terraform [in a directory named infra][infra] which creates a bucket and gives it a policy where one user can only read from it. Then I [added some code to use `s3cmd`][get font] to retrieve and unzip the font during the install step.

[s3cmd]: https://s3tools.org/s3cmd
[terraform]: https://www.terraform.io
[infra]: https://github.com/myobie/nathanherald.com/tree/9f7b8e22b1876ab775d4c1e6e67b059121f60b35/infra
[get font]: https://github.com/myobie/nathanherald.com/blob/9f7b8e22b1876ab775d4c1e6e67b059121f60b35/bin/install#L26-L36

## Generating predictable preview URLs

When I'm writing a new blog post ([like this one][this-pr]) I want to be able to see a "preview version" in my browser so I can make sure all the images look right, the font is working, etc, so I deploy a "preview site" for every [pull request][] I make. 

Since I want to preview before everyone else sees it, I need to deploy the site somewhere other than `nathanherald.com` which can break my font from loading if I can't predict exactly what the URL of the preview site will be. To make this work I override the "base URL" for hugo to something I call the `PREVIEW_URL`. I can dictate [the exact format of the URL][preview url] and I can clear those URLs with my font provider. 

[this-pr]: https://github.com/myobie/nathanherald.com/pulls/1
[pull request]: https://help.github.com/en/github/collaborating-with-issues-and-pull-requests/about-pull-requests
[preview url]: https://github.com/myobie/nathanherald.com/blob/9f7b8e22b1876ab775d4c1e6e67b059121f60b35/.github/workflows/deploy.yml#L65

## Building a workflow with GitHub Actions

The most difficult part when setting up my website was getting a workflow that works to deploy for every change. I knew exactly what I wanted to happen:

1. Create a deployment through the GitHub API to indicate a deploy is happening 
2. Mark the GitHub deployment as in progress
3. Run `now` passing in a `PREVIEW_URL` so I can preview the site
4. "Alias" the now deployment to the `PREVIEW_URL`
5. Mark the GitHub deployment as complete
6. Post a comment that says "🚀 your changes are deployed" linking to the `PREVIEW_URL`

I thought this wouldn't be too difficult. _I was wrong._

You can see my final [deploy.yml][] workflow in the repo.

[deploy.yml]: https://github.com/myobie/nathanherald.com/blob/d1ceec83d68a835b2aa423141a4214a5877f9292/.github/workflows/deploy.yml#L1

### Build one action to perform all the steps (which didn't work out)

My first attempt was to make one action that performs all these steps and I started that here: [github.com/myobie/deploy-now][deploy-now]. I found a javascript module named `now-client` (which the `now` program itself uses internally) and it exposes [a `createDeployment` function][create deployment function] so it seemed like it was going to be easy.

[deploy-now]: https://github.com/myobie/deploy-now

**The biggest problem I had creating a GitHub Action is there is no local dev environment I know of to test the workflow on my computer.** Sure, there is a [small test example][], but it leaves **a lot** to be desired.

[small test example]: https://github.com/actions/javascript-action/blob/c4da6cbeb333147c98df489667fb8849e97d7dd3/index.test.js#L19

It's also sometimes lacking documentation: like how are arguments passed into your action? It turns out any "inputs" are passed in as ENV vars that begin with `INPUT_` like `INPUT_TOKEN` would be passed in for a step that has `with:` followed by `token: abc`. 

The [javascript toolkit reads in these variables for you][core input], so I decided that I was going to write everything in javascript because there might be other undocumented things I don't know about that [the toolkit][] is magically taking care of.

[create deployment function]: https://github.com/zeit/now/blob/5872114c8734adfef61634eac026434b5a7c7be1/packages/now-client/src/index.ts#L9
[core input]: https://github.com/actions/toolkit/blob/e69833ed16500afaa7d137a9cf6da76fb8fb54da/packages/core/src/core.ts#L69
[the toolkit]: https://github.com/actions/toolkit

#### Using ncc to package everything into one file

After deciding to use javascript I ran into my first roadblock: GitHub Actions doesn't install your npm dependencies before running your code. Instead we are expected to pre-compile our javascript into one, dependency-free `.js` file before pushing. **This is super surprising.** The tool recommended to package up one's javascript is [`ncc`][ncc] (which is apparently a play on acronyms with `gcc`).

[ncc] is easy to use and it natively supports [typescript][], so I then decided that I'd consider using typescript. I setup a ["package script task"][package task] and I made sure to setup [a `pre-commit` hook][pre commit hook] to package my javascript before I push any changes because I will forget.

[package task]: https://github.com/myobie/deploy-now/blob/master/package.json#L16
[ncc]: https://github.com/zeit/ncc
[typescript]: https://www.typescriptlang.org
[pre commit hook]: https://github.com/myobie/deploy-now/blob/master/pre-commit.sample

### Separating the steps out into individual actions

The `now-client` ended up not working the same as just running `now` (for example: rewrites in the `now.json` file weren't sent to zeit) and without being able to easily and quickly test changes locally, **having a single big action ended up being too frustrating.** 

I decided to make smaller, focused actions where each one was small enough that I could more easily understand it and less easily break it. I've ended up with a little [suite of actions][].

[suite of actions]: https://github.com/shareup?utf8=%E2%9C%93&q=-action&type=&language=#org-repositories

### Getting the name of the current branch

When GitHub triggers an Action it provides [a bunch of information][action context], but none of that information reliably includes just the branch name. I want my preview site to include the branch name in its URL (so each branch has it's own preview URL) so I wanted a way to find out just the branch name and have it set as an "output" so I could interpolate it later into the arguments to other actions.

[action context]: https://help.github.com/en/actions/automating-your-workflow-with-github-actions/contexts-and-expression-syntax-for-github-actions

So, I made [output-git-metadata-action][] which does exactly that: it "outputs" some git metadata, including the current branch name.

> **Note:** one has to give the "step" an `id:` in the yaml to be able to reference it later as `${{ steps.id.outputs.output_name }}`. A step can have both an `id` and a `name`; `name` is optional.

[output-git-metadata-action]: https://github.com/shareup/output-git-metadata-action

This action can be used like this:

```yml
jobs:
  yo:
    runs-on: ubuntu-latest
    steps:
      - id: meta
        uses: shareup/output-git-metadata-action@master
      - name: print debugging info
        run: |
          echo "branch: ${BRANCH}"
        env:
          BRANCH: ${{ steps.meta.outputs.branch }}
```

### Creating the GitHub deployment

[Deployments][deployments api] in the GitHub API are very confusing to me. The documentation says "will trigger a `deploy` event" but I am already doing the deployment, I just want the deployments UI of a pull request to light up and show what happened, like this:

{{<fig
  alt="Screenshot of the GitHub Actions bot timeline entry for a deployment"
  src="github-actions-bot-timeline@2x.png" />}}

I assume when I create a deployment through the API it does emit some `deploy` event that no one is paying attention to. Seems wasteful. It would probably make more sense to separate the concept of "creating the deployment record" and "triggering the `deploy` event." It's also very possible (likely) that I just don't understand what I'm doing. `</rant>`

[deployments api]: https://developer.github.com/v3/repos/deployments/

I made [create-deployment-action][] to do what it says: create a deployment. It outputs the deployment's id in case one need's to reference it sometime later.

[create-deployment-action]: https://github.com/shareup/create-deployment-action

And it **doesn't need one to generate a token** or anything: GitHub already provides a default token to every action which has read/write access to the current repository so I just use that inside the action code. I honestly don't know where this is documented or how I found it, I think I might have found it while reading through the source of the [checkout action][].

[checkout action]: https://github.com/actions/checkout/blob/db41740e12847bb616a339b75eb9414e711417df/action.yml#L18

#### `octokit`

I found [`@octokit/rest`][rest] confusing (and it not always having all it's types for typescript working perfectly) and switched to [`@octokit/request`][request] which I hadn't really seen mentioned in any official docs. The request library is much simpler, has better `typescript` types (since it's written in typescript), and one can simply copy the documentation line like `POST /repos/:owner/:repo/issues/:number/labels` [straight from the GitHub API docs][labels docs]. 

[rest]: https://github.com/octokit/rest.js
[request]: https://github.com/octokit/request.js
[labels docs]: https://developer.github.com/v3/issues/labels/#add-labels-to-an-issue

### Updating the status of the GitHub deployment

Creating a deployment is kinda meaningless and empty on its own: one has to "create a deployment status" to mark it as "in progress" or "success" or [something else][states].

I made [create-deployment-status-action][] for this purpose. 

At this point, I could see that I was on my way to creating my own little framework of actions and could write a `yml` file like:

```yml
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: output metadata
        id: meta
        uses: shareup/output-git-metadata-action@master
      - name: create deployment
        id: deployment
        uses: shareup/create-deployment-action@master
        with:
          ref: ${{ steps.meta.outputs.sha }}
      - name: set deployment status to in_progress
        uses: shareup/create-deployment-status-action@master
        with:
          deployment_id: ${{ steps.deployment.outputs.id }}
          state: in_progress
      - name: echo example preview url
        run: |
          echo https://preview-for-branch-${{ steps.meta.outputs.branch }}.example.com
      - name: set deployment status to success
        uses: shareup/create-deployment-status-action@master
        with:
          deployment_id: ${{ steps.deployment.outputs.id }}
          state: success
```

[create-deployment-status-action]: https://github.com/shareup/create-deployment-status-action
[states]: https://developer.github.com/v3/repos/deployments/#parameters-2

I like these super small and granular steps.

### Deploying with `now`

When I want to deploy with `now` locally I just run `now`. I wanted to make an action that does the same. There is a tool in the toolkit named [exec][] to run processes and I could use a `Dockerfile` to make sure `now` is pre-installed.

[exec]: https://github.com/actions/toolkit/tree/e69833ed16500afaa7d137a9cf6da76fb8fb54da/packages/exec

So, I made [now-action][] which executes `now` and accepts inputs for almost every cli flag now accepts.

[now-action]: https://github.com/shareup/now-action

Using [a `Dockerfile`][dockerfile] took me a bit to understand because there are three paths I needed to keep track of: the path we are building the docker image from (the action's repo), the path we are executing the action into (the website's repo), and where the action's files are stored inside the docker image (?).

[dockerfile]: https://github.com/shareup/now-action/blob/7312114e9ea8610c160e005ed7d47d171f1c575c/Dockerfile

I built `FROM node:12` so I knew node was already present and I used `npm` to install `now` globally during the build step.

I decided to just make my own place to store stuff as `/now-action/` and since I was already using `ncc` for the other actions I kept that so I only needed to move `dist/index.js` into the docker image for everything to work by then executing `/now-action/dist/index.js` with `node`. 

Since this action is completely isolated from the others, it can be used on it's own like so:

```yml
jobs:
  now:
    runs-on: ubuntu-latest
    steps:
      - name: checkout
        uses: actions/checkout@v2
      - name: now
        uses: shareup/now-action@master
        with:
          token: ${{ secrets.zeit_token }}
```

One has to set a secret on their repo to [a token from zeit][tokens] so it can use `now` on your behalf.

[tokens]: https://zeit.co/account/tokens

#### Force deploy

now tries to be smart and doesn't regenerate a website if it doesn't see any changes, instead it will attempt to re-use a previous build. This caused me issues when deploying to production because it would re-use a build I had created for a preview website and then all my fonts stopped working because it expected the wrong URL. 😞

I [always pass `force: true`][force true] to the [now-action][] which tells now to always rebuild no matter what. 

_Honestly, I've done a lot of work for this font…_

[force true]: https://github.com/myobie/nathanherald.com/blob/d1ceec83d68a835b2aa423141a4214a5877f9292/.github/workflows/deploy.yml#L63

### Assigning an alias to a now deployment

Running `now` will create a new "deployment" and give it an autogenerated URL, which isn't enough for me: I was to use my custom `PREVIEW_URL`. now allows one to point a domain at a deployment and calls those "aliases."

So, I made [now-alias-assign-action][] which does exactly that.

[now-alias-assign-action]: https://github.com/shareup/now-alias-assign-action

To alias a deployment with a preview URL including the branch name, I could now make a yaml like:

```yml
jobs:
  now:
    runs-on: ubuntu-latest
    steps:
      - name: checkout
        uses: actions/checkout@v2
      - id: meta
        uses: shareup/output-git-metadata-action@master
      - name: now
        id: now
        uses: shareup/now-action@master
        with:
          token: ${{ secrets.zeit_token }}
      - name: alias
        uses: shareup/now-alias-assign-action@master
        with:
          token: ${{ secrets.zeit_token }}
          deployment: ${{ steps.now.outputs.deployment_url }}
          alias: https://preview-for-${{ steps.meta.outputs.branch }}.example.now.sh
```

Aliases should end with `${your-now-username}.now.sh`.

### Posting a comment

The last thing I wanted to do was to post a comment after a deployment with the URL so I could easily click it to see the preview website. 

I made [create-comment-action][] which will either:

* If a pull request is open, post a comment there
* Else, comment directly on the commit that triggered the action

[create-comment-action]: https://github.com/shareup/create-comment-action

At this point I felt _good at making actions_ and I'm not sure if that is a good thing.

## Putting it all together

The [full yaml workflow][workflow] in [my website's repo][repo] has some tricks to differentiate between production and staging.

[workflow]: https://github.com/myobie/nathanherald.com/blob/9f7b8e22b1876ab775d4c1e6e67b059121f60b35/.github/workflows/deploy.yml

I can open a PR, preview my changes, and when I merge the PR the production website is deployed. A list of all the actions I created in the past week are:

* [shareup/output-git-metadata-action](https://github.com/shareup/output-git-metadata-action)
* [shareup/create-deployment-action](https://github.com/shareup/create-deployment-action)
* [shareup/create-deployment-status-action](https://github.com/shareup/create-deployment-status-action)
* [shareup/now-action](https://github.com/shareup/now-action)
* [shareup/now-alias-assign-action](https://github.com/shareup/now-alias-assign-action)
* [shareup/create-comment-action](https://github.com/shareup/create-comment-action)

[GitHub Actions][actions] are very powerful, but also super mysterious. Since I cannot execute workflows on my computer the feedback loop of pushing, waiting, checking the logs is way too slow. It's still amazing and I am super happy now that it works, but getting there was way too difficult. I haven't submitted these actions to "the marketplace" yet because I have to make an icon and a few other things to submit.

[now][] is great. I really like it. It's super simple and I will be using it more and more for static website hosting as well as [serverless functions][].

[serverless functions]: https://zeit.co/docs/v2/serverless-functions/introduction/

[hugo][] is still my favorite way to build websites. It's super fast and the way it organizes content is _alright_. I love making websites and hugo mostly gets out of my way.

While I spent way too much time on this setup, I now feel more confident to make changes, preview the change, and merge to deploy.