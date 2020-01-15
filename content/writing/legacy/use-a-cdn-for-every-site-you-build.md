+++
title = "Always use a CDN"
date = "2015-01-17T16:11:09.600Z"
svbtleUrl = "https://myobie.svbtle.com/use-a-cdn-for-every-site-you-build"
+++

Doing maintenance on a 6 year old project today that "didn't have the budget" for a [CDN]((https://en.wikipedia.org/wiki/Content_delivery_network)) reminded me how important one can be. I'm writing this to remind myself to stick to my guns and always make time for the important things: one of which is using [Cloudfront](https://aws.amazon.com/cloudfront/) or [Cloudflare](https://www.cloudflare.com) every time.

Not every site needs to "scale" (whatever that means), but it's a complete waste of resources to keep answering requests for the same files over and over again. If a project is hosted on heroku, then there is [no web server in front of the application](https://devcenter.heroku.com/articles/http-caching) to intercept requests for files. The application has to answer and handle the same requests over and over again. Even if an app is behind a reverse proxy like apache or nginx, the proxy is still answering and streaming files when it doesn't need to.

Don't under estimate just how easy and useful it is to save money by reducing the requests per second hitting the application boxes. While your site is keeping up fine now, when a spike happens it can deal with more traffic if it only has to serve the dynamic bits. If a page has 4 assets, then a 100% increase is page views could mean a 400% increase in requests per second. A page with lots of logos or icons or whatever might have 100s of assets and every page view is multiplied that much. The simple math is: don't serve assets yourself.

If you're willing to repoint the primary domain's DNS then using Cloudflare is super simple. Sign up, then change DNS settings. Sadly, [Cloudflare does not provide a hostname](https://support.cloudflare.com/hc/en-us/articles/203689034-Does-CloudFlare-provide-me-with-a-CDN-subdomain-or-hostname-) to use, so letting them proxy the entire domain is the only way.

My favorite CDN is Amazon's Cloudfront and it's amazingly simple to setup. All CDN's work the same: the **origin** server is the application's primary domain. Amazon provides a unique hostname to use, just append the original file's path. When Amazon doesn't have a file in it's cache it will ask the origin domain for a fresh copy at that path. All one has to do is prepend the hostname like: `https://abcdefg123.cloudfront.net/images/cats.gif`. Another great thing is Amazon provides SSL for all Cloudfront subdomains, so no mixed content warnings or anything like that.

I just recently set this up for a rails project hosted on heroku by simply making this change to `config/production.rb`:

    config.action_controller.asset_host = 
      "https://abcdefg123.cloudfront.net"

To make things easier for myself I just set it to always use `https` even if the page including the asset is `http`. It's possible to use URLs like `//abcdefg123.cloudfront.net/images/cats.gif` without the protocol which tells the browser "use the same protocol as the base document" kinda sorta. Try it out if you haven't.

For any other type of application or framework it's pretty simple to do something like this pseudo code:

    module.exports = function asset_path(path) {
      if ($application.env === "production") {
        return $application.config.asset_host + path;
      } else {
        return path;
    }

(Yeah, that's javascript referencing a global named `$application`. Sorry.) The basic idea is to make sure every time the path is output for an asset that it is "rendered" so in production it can use a different host.

Since Cloudflare takes over the DNS they let any request for a file not currently cached to pass through. This means less configuration up front, but it _can_ lead to confusion if it's a person's first time using a CDN. It's possible to configure Cloudfront to take over the origin domain as well, but it's not required with Amazon's setup.

After setting up a CDN and making sure all assets have the correct hostname in the URLs, it's important to set the correct headers so the CDN knows how long to keep the files. [Heroku has a great overview of HTTP caching](https://devcenter.heroku.com/articles/increasing-application-performance-with-http-cache-headers) and you should read it. The simplest thing to do is to add a `Cache-Control` header for every asset requested by the CDN backend:

    Cache-Control:public, max-age=31536000

This is precisely what rails does when it serves an asset in production, so I got pretty lucky there. All good web frameworks will do the same thing. If you're project is framework-less or using some new-awesome-hipster-cool-thing-framework then it should be simple to add this header when an asset is requested: if it's not then provide a patch or module or re-consider your choice.

Finally, **check the server access logs to see the new found amazingness!** Offloading traffic can get way more money out of the application boxes and might even allow one to scale down. Not enough writing online talks about scaling down instead of up.