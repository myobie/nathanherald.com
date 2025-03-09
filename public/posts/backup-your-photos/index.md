+++
title = "How I (Now) Backup My Photos"
date = "2024-05-14T23:13:30+02:00"
+++

I’m taking more and more RAW digital photos + scans of film photos and I finally took the time to regularly back them up – **because I was locked out of my Apple account!**

Apple had a problem back on April 26 where some people’s accounts got locked, and it affected me. I woke up and saw that my Apple account was locked, and my phone demanded that I reset my password. So I reset it. Then, after a couple minutes, it demanded that I reset my password yet again.

I’ve seen how these things can go, and getting into a reset loop like that felt like it could end up locking me out of my Apple account entirely. Before: Apple Photos was my only storage + backup of all 800GB of my photos. Now: I need to run to the electronics store and buy a hard drive.

_You can read more about Apple’s issue on [Michael Tsai’s blog post which has tons of links](https://mjtsai.com/blog/2024/04/26/janky-apple-id-security/)._

I turned my iPhone and Mac off, I didn’t want them to accidentally do anything while I was out. I had recently got a [Nothing 2a](https://de.nothing.tech/pages/phone-2a) to test my web work on Android, so I grabbed it and put a prepaid SIM into it so I could do stuff out and about with a phone that I’m not locked out of.

Then I went down to [Saturn](https://www.saturn.de) and picked up a [Samsung T7 Shield](https://semiconductor.samsung.com/consumer-storage/portable-ssd/t7-shield/) drive. Luckily, I had already done a lot of research about which hard drives are reliable, so I knew these were good. There are cheaper drives that have terrible track records (Sandisk, WD, …) and I didn’t want to deal with that on a stressful day where I felt I might lose access to all my photos forever. I grabbed a 4TB drive so I knew I’d have plenty  of space for a while.

I’ve also done a lot of research about which backup program to use on my Mac, and so I knew the best is **[Arq](https://www.arqbackup.com)**. I had already learned that if the drive isn’t plugged in, Arq will just silently fail. I use a MacBook Pro so the T7 might not be plugged in every time Arq runs, and Arq can just handle that scenario quietly without bothering me.

I’ve already checked the box to keep all my originals on my disk and I’ve got a 2TB disk in the laptop, so all my Apple Photos were already on my Mac’s disk when my Apple account got locked. As long as Apple’s iCloud stuff didn’t decide to remove them from my disk because my account was locked and it thought it might be the secure thing to do, then I’d be alright.

{{<fig
  src="photos-settings@2x.png"
  alt="Screenshot of the Settings window of Photos on macOS" />}}

I’ve also been using Adobe Photoshop Lightroom (the cloud-ish one) some for the past few months, so I chose to backup those onto my local disk as well.

{{<fig
  src="adobe-settings@2x.png"
  alt="Screenshot of the Settings window of Adobe Photoshop Lightroom" />}}

So I got back, booted up the Mac, installed Arq, and chose to backup my Photos and Lightroom libraries to the T7 💪 It took a few hours… then I felt a lot better.

I went ahead and reset my password again. By this time Apple seemed to have gotten a handle on whatever was going on, and after this second password reset things stabilized.

Still, I won’t ever trust iCloud Photos to be the only place where my photos live – I will make sure they are always somewhere else.

And to that end, now I had a physical backup here, but it is best practice to also have an off-site backup… so I signed up for [Wasabi](https://wasabi.com). They are one of the cheapest, yet still reliable, places to store stuff online and they only charge for storage – all the bandwidth / transfer is free.

I knew this would take a while, my upload speed at home isn’t great, and Arq handled it really well. It took more than 2 days for everything to initially upload, and now Arq is smart and uploads anything new every night.

So, because of Apple locking my account and scaring me, I now have nightly backups of my photos to a physical drive and a cloud drive:

{{<fig
  src="arq-menu@2x.png"
  alt="Screenshot of my two Arq backups, one to the T7 and one to Wasabi" />}}

It is tempting to feel grateful that Apple had this dumb account locking issue, because it spurred me to finally setup backups for my photos… but no it was still dumb. It really proved to me: **my iPhone and my Apple account are too important.** If I lose access, then I lose quite a lot… which is pretty annoying.

Smart Phones were fun, little, powerful toys for a while. Now they are required for day-to-day life. **I am now motivated to start to *unbundle* stuff from my phone.** 
