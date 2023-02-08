+++
title = "CloudKit"
description = "Serverless Collaboration"
date = "2016-08-12T17:45:48.404Z"
mediumUrl = "https://medium.com/@myobie/cloudkit-35f4fcb35f7"
aliases = [
  "/writing/legacy/cloudkit/"
]
+++

The new capabilities in CloudKit for iOS 10 and macOS Sierra are super encouraging. I have been convinced for some time that collaboration and sharing are incredibly important for the future of all mobile productivity software. Productivity software is all about managing data, people, and how they relate to each other. The new additions from Apple make this easier for a larger number of people. As [more enterprises buy iOS devices instead of Windows](http://www.nytimes.com/2016/08/08/technology/once-taunted-by-steve-jobs-companies-are-now-big-customers-of-apple.html?src=me&_r=0), this could be even more important sooner.

When beginning to build the realtime sync for Wunderlist we tried to setup our server architecture as a product which the native applications “consumed.” We have had some success with this approach, but we never truly made a generic “realtime storage and collaboration system.” Which is fine, we make a to-do manager and not a storage service. (Of course we talk sometimes about how fun it would be to make our stack generic and open.)

We knew we were going to build a system that will be obsolete very quickly. Just how people choose between databases (MySQL or Postgres), in the future people will choose between their serverless realtime storage and collaboration products ([CloudKit](https://en.wikipedia.org/wiki/CloudKit), [hoodie](http://hood.ie), [deepstream](https://deepstream.io), …). _(We need a shorter name for serverless realtime storage and collaboration product. Also is it serverless or nobackend?)_

Apple has been very, very slowly evolving iCloud over time and now they have built a file/blob storage system, a record/object storage system, sharing and collaboration (ACLs), and basic conflict management. They are succeeding at a huge scale and I’m sure it will eventually be “realtime.” _(Realtime means: very fast. Like a few seconds or less to get updates anywhere in the world.)_

Already, when using an app that stores data in iCloud Drive: I edit on my iMac, move over to the couch to edit on my MacBook, changes are already there. And later when I’m on the go I make some edits on my iPhone which all syncs together fine. I am collaborating with myself. The next obvious step was to collaborate with any number of people and that is just what is coming soon.

{{<fig
  src="1-5_qp7e2QY6mjv1NfWP38Mw.png"
  alt="Notes’s new sharing screen">}}
Notes’s new sharing screen
{{</fig>}}

Wunderlist’s realtime sync won’t be a competitive advantage for long. Apple’s Notes is a great example of how one can use the new APIs to take an existing product and make it collaborative. I expect in a few years this will be a common service provided by all operating system makers.

While Apple does provide a javascript CloudKit SDK, and it is already being used on the iCloud web version of Notes to provide sharing and collaboration, they don’t offer native SDKs for Android or Windows. ([Someone did port the web service calls to Android](https://github.com/jaumecornado/DroidNubeKit), which is amazing.)

Some things you might want to look into:

* [CloudKit](https://en.wikipedia.org/wiki/CloudKit)
* [pouchdb](https://pouchdb.com)
* [hoodie](http://hood.ie)
* [deepstream](https://deepstream.io)
* [realm](https://realm.io)

_Who is going to create the first good multi-platform serverless/nobackend realtime collaboration and storage system?_
