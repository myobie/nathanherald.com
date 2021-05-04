+++
title = "Collaboration through software: digital paper and card catalogs"
date = "2021-05-04T08:22:42+02:00"
+++

[TK]: #

_A lot of the links are not wired up yet. Just FYI and TK._

- - -

Over the past couple decades, while working on different distributed software and systems, I’ve been able to refine my thoughts about how to categorize and talk about collaborating through software. Also, I enjoy reading about software history and the many HCI research papers one can find about collaboration, like: [AR video conferencing][TK], [Telehealth][TK], and task specific things like [Story planning][TK]. 

[Xerox PARC][TK], from way back when, are responsible for so many different technologies: [Ethernet][TK], [“video links”][TK] and [distributed software][ethernet software] (called “ethernet software” at the time) to help people work with [“digital paper.”][TK] This concept of digital paper really resonates with me most in my experience building software.

[ethernet software]: https://www.researchgate.net/publication/2688342_Personal_Distributed_Computing_The_Alto_and_Ethernet_Software

## Digital paper

I like to always start thinking about a piece of software or a system as a group of people sitting around a table with a sheet of paper and some markers. Everyone can clearly see each other, can easily see when someone is writing or drawing, and it’s not possible to make a mark that cannot be seen by everyone else. Also, everything is spatially arranged: when I make a mark to the left of yours, you also see that it’s to the left of the mark you previously made.

[Miro][TK], [Figma][TK] (and now [FigJam][TK]), [Google Docs][TK], and [Craft][TK] pages are examples of “digital paper.” _(I also sometimes call them “digital whiteboards.”)_ They work like a magic, digitally replicated piece of paper that everyone can see and write on together. Everything is spatially arranged, we can see each other’s “fingers” (cursors), and all changes are immediately visible to everyone.

Digital whiteboards are the easiest collaborative software to talk about because they are both extremely immediate and give everyone 100% visibility. I cannot insert a circle into a Figma doc that you cannot see. The rules or “physics” of the software can be talked through very quickly and everyone “gets it.” 

I recently read [a Microsoft Research paper titled _“Three's Company: Understanding Communication Channels in Three-way Distributed Collaboration”_][threes company] where each participant could see “shadow images” of the other participants arms and hands as they would attempt to work together to accomplish a task like moving a block. Everyone also had audio and video feeds from the others. It seemed like everyone got it and the “additional arms” didn’t seem to bother anyone:

> Despite the fact that we regularly saw three, and occasionally saw six arm shadows (two per person) in the task space, users did not seem to be distracted by this additional clutter. 

[threes company]: https://www.billbuxton.com/3sCompany.pdf

_(I also found the feedback from participants that the video feed was only really useful when preparing for a task, but not during it, super interesting.)_

I also really liked [another paper by Bill Buxton titled _“Telepresence: Integrating Shared Task and Person Spaces”_][shared task and person spaces] which has a great part which says (emphasis mine):

> … the interaction breaks out of being like watching TV, into a direct engagement of the participants. **They meet each other, not the system.** 

[shared task and person spaces]: https://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.589.7276&rep=rep1&type=pdf

## What about email?

Email can also be considered a “digital paper” product, however its immutability and the slow cycle of feedback make it less useful for a lot of tasks. Now, people love email. It’s the most successful distributed technology ever created. 

The rules are understandable: I write something in a place that only I can see, then I hit “send” which will transfer a copy over to another person’s inbox (where I cannot see) for them to read sometime in the future. I can’t “unsend” an email and I can’t modify an email after it’s been sent.

For tasks which don’t need immediacy or really resemble letter writing, then email is the right choice. Personally, email doesn’t interest me much as something to work on. I wish the email protocols could be updated to allow for easy end-to-end encryption, auto-rejection of unknown senders, etc to make it more private and less overwhelming – but I also really get why it’s hard to change something so old and so successful.

## What about chat?

Chat software can be a little fuzzy to pin down. While it might seem like a Slack channel is both fully immediate and fully visible, it turns out there are things one can do that are not shared and Slack tries to make this clear by labelling those messages “Only visible to you”.

{{<raw>}}
<figure>
<img src="slack-screenshot.png" width="468" height="148">
</figure>
{{</raw>}}

By making it less clear if everything is fully shared, **it adds stress** for users who feel uneasy about trying something because “what if everyone sees me make a mistake” or “what if I send this to the wrong place.” _(The old [IRC][TK] software also had ways for “the system” to message you that were only visible to you, so this is not a problem unique to Slack.)_

Using Apple’s Messages can also be confusing: if I delete a message, then does it delete it for the other person? _(No, it doesn’t.)_

I prefer software that is immediate: I would almost always rather use chat over email. But I also prefer software that is visible: I don’t like to be confused about who can see what. But digital paper solutions are not enough on their own.

## Digital paper isn’t enough

Digital paper (or a digital whiteboard) is not enough.  Arranging everything spatially can make it very difficult to find or remember where something was placed. As a canvas for a document grows it becomes harder and harder to keep up. Changes can happen over in an area one is not currently paying attention to. And searching for a note or comment from a month ago is almost impossible.

_Both Miro and Figma continue to add features to try to help mitigate some of these issues (like following a person’s viewpoint [link TK]) which is great. Google Docs can have the table of contents to the left which can help some as well._

The metaphor I use to talk about solving this issue is a digital card catalog.

## Digital card catalog

When I design collaborative software, the metaphor I use the most is a digital card deck or digital card catalog, depending on the size and scope of the software. 

If we each have a [deck of playing cards][TK], and we shuffle them in different ways, we know we still have the same “set of cards” despite the orders being different. I might have the ace of diamonds as my first card and you might have the queen of hearts, but we are not confused by that in any way. I can always search through and find any card you can. Also, if I decide to filter through and make a pile of only hearts, we understand that I am not filtering any cards in your deck.

For a “digital deck of cards” system: the card is like a little shared document. When we draw on the shared ace of clubs, we can all see the updated design immediately. I can also choose to put that card away in the deck and start working on another card. Then I won’t see your updates immediately because I’m on a different piece of digital paper. Everything inside the card is shared and everything outside is personal. 

Sometimes we need a shared way to organize lots of cards which is what I call the “digital card catalog” system: not only is the card a shared digital document, the way the cards are organized is also shared. This is analogous to the [card catalogs found in libraries][TK].

_Aside: a long time ago I learned from a few designers that if one wants inspiration for how to design information or software for people then always look at maps and libraries. They are ways to structure and organize lots of information, they are designed to be heavily used, and they try to work for a large number of people with as little required training as possible. Also, [be aware that there are systemic biases inside libraries and the libarary science field][libraries] that are important to know about and not replicate._

[libraries]: https://www.library.wisc.edu/gwslibrarian/bibliographies/disrupting-whiteness-in-libraries/

While a “deck of cards” is a nice and easy analogy, almost all types of software that I have helped design or helped build have become larger “card catalog” systems.

[Wunderlist][TK] was one: each task was like a little shared document. Any change you make to task is visible to every member of the shared list. And the list itself is the “catalog.” We all see the same tasks in the list at all times.

_One contentious argument we had was whether sorting a list alphabetically was a “shared action” or not. IMO, using the physical analogy to card catalogs, sorting or filtering is not a shared action. However, I lost this argument, and when someone sorted a list it actually sorted those tasks for everyone. I still feel this was a mistake and wish I could have done a better job making the case for personal-only sorting._

People prefer consistent rules or “physics.” [TK link to study or something?] When we are crafting the “universe” of a software product it’s important the physics and “gravity” are consistent and feel good. The rules of physical card catalog systems are already well documented and understood, so one can leverage that to help make our digital card catalog systems easier to use.

One can also look to libraries for how to “announce updates” since it is really impossible for a human to keep track of all the “new cards” in a busy catalog. There are “new releases” or “librarian picks” which try to help guide a person to relevant topics and places. There are many methods to search, filter, and arrange the cards to make it easier to find a specific one.

One could make “topic drawers” which include only the cards relevant to that topic. There is no reason why the same card cannot be present in more than one drawer if it were relevant to many topics. A card could helpfully indicate which other topic drawers it could be found in. This would make sense and be welcomed by library visitors.

Sometimes, in physical libraries, there are cards in the catalog which reference books over at other libraries: a [union card catalog.][TK] Digitally, it’s possible to have a system to not just work with information inside your group or organization, but also with other groups and organizations which could be a huge win. 🙌

## Quick summary

So that’s what I wanted to write about: when I design or build distributed software to help people work together, I almost always think about _digital paper_ organized in a _digital card catalog._ I prefer software to be _extremely immediate_ and it to be clear _what is shared?_ and what is not. This is how we are approaching building [Shareup][TK] and drives a lot of our conversation about how it will work.

I’m curious though, how do you think about collaborative distributed software? How do you think through the rules or _physics_ of the system?
