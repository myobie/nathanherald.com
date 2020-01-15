+++
title = "I've migrated off medium"
date = "2019-11-21T08:12:27.010Z"
+++

In 2013 I was tired of maintaining my own blog and started posting onto [medium.com](https://medium.com/@myobie) to save myself time. The first post was [The Cost of Education](https://medium.com/i-m-h-o/the-cost-of-education-63e3533b99c3) into a collection named IMHO back when anyone could make and join collections. I even became a paid member to help support "my blogging platform" so I wasn't betting on a free service. Sadly, during the last couple years Medium has just been making things terrible – the worst of which is showing div popovers overtop my writing requesting readers to signup, sometimes not letting them read my writing if they don't become paid members. 

I am no longer a paid member for Medium and I have migrated my writing over to [my own website]({{< ref "writing" >}}). When medium first launched it was a great example of good typography and easy publishing and it's sad to see them ruin it.

### Technology

I'm using [hugo](https://gohugo.io/) to build everything statically. I'm using [now by zeit](https://zeit.co/home) to build, deploy, and host my files. I'm using [iA Writer](https://ia.net/writer) to edit my files on both [macOS](macappstore://itunes.apple.com/app/id775737590?mt=12) and [iOS](macappstore://itunes.apple.com/app/id775737172?mt=12) and I push updates to my files with [git](https://git-scm.com) on macOS and [Working Copy](https://workingcopyapp.com) on iOS. Working Copy is a "file provider" on iOS which lets one edit the files from the git repo in any app like Writer or anything else with access to the Files app.

Zeit creates a test website for every branch I push, so I can easily push a new post from my Mac or phone with a real, live preview and then merge when I'm happy – which is a great workflow for me. hugo is so fast that I never wait more than a couple seconds for everything to rebuild. I’m super happy with this setup 😎

### Trying to go full phone

I'm going to be traveling for a couple weeks without a laptop, so I prepared as much as I could to enable me to be able to do full posts entirely from my phone. Here is what that looks like:

{{<fig
  src="working-copy@3x.png"
  alt="Screenshot or Working Copy shoeing the files for this website">}}
Working Copy showing the files in the git repository for this website
{{</fig>}}

{{<fig
  src="writer@3x.png"
  alt="Screenshot or iA Writer showing the code for this post">}}
iA Writer showing the markdown for this post
{{</fig>}}

{{<fig
  src="github@3x.png"
  alt="Screenshot of the GitHub Mobile app">}}
The fantastic new [GitHub Mobile app](https://github.com/mobile) is great so I've bookmarked this website's repo there
{{</fig>}}

{{<fig
  src="github-pr@3x.png"
  alt="Screenshot of the GitHub Mobile app showing the Pull Request for this post">}}
Zeit's now posts a "check status" and a comment to the Pull Request with the URL for the preview website where my new post is visible
{{</fig>}}

We'll see how it goes posting with my phone. Inserting images is not the best…

### Switching costs 

It took way longer than I hoped or assumed to migrate away from Medium. The switching cost is real and high. I wish it weren't the case, but publishing on the internet reliably is still not "easy."

hugo's shortcodes are always confusing and having to use them for inserting images means I cannot preview images directly in Writer. I may just edit the images in [Pixelmator](https://www.pixelmator.com/ios/) and then use the normal markdown image syntax. 

Zeit makes an assumption that builds are immutable and deterministic. While this is true for my website, there is one input that I consider a change that they do not: for the preview websites for every PR the domain for the website is not `nathanherald.com` so I use an `ENV` variable to inject a predictable domain for hugo to use. When I merge the PR, Zeit looks at the source code and says "I've seen all this before, so I'm not rebuilding again" and it promotes the version of the site built for something other than `nathanherald.com` and that breaks all the images and colors and everything. 

I got annoyed and decided I would just move to [GitHub Actions](https://github.com/features/actions) and just build [wtf I want](https://gist.github.com/myobie/aafd9885aeea21aed19b85a60cacda4f), but I have fallen prey to a bug in Actions that affects me because of my super-early access to the feature. It will be probably get fixed by next week…

I've created a workaround for the Zeit problem and I've sent them an email to ask them to consider the change in `ENV` variables as a "change of inputs" and therefore trigger a new build…

Good times™ as usual. I do love building for the web.