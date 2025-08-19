# This is not my take on AI

_The world doesn’t need another take._

_TL;DR: I’ve concluded that AI is coming and it’s important I understand it and I am in control of my data, of my context. This is why I am personally working to enable local AI workflows on phones and laptops. I’ll keep this page updated as I learn more._

[masto]: https://indieweb.social/@myobie

- - -

<details-controls></details-controls>

- - -

AI tools and companies are progressing fast and I have a lot of questions that I haven’t found easy answers to. **So, I’ve taken some time to research, use AI for real work, and read a lot of takes on AI. I’m collecting what I’ve learned here.** I plan to keep this page semi-up-to-date over time as I learn more. I don’t want to make a lot of blog posts about AI, instead I’ll just have this page here as a living document. I’ll try to pull my “big takeaways” up here to the top.

## Big Takeway #1: AI is here and it’s best for me to understand it

> <iframe allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen frameborder="0" height="315" src= "https://www.youtube-nocookie.com/embed/XAPfNPIvWkM" width="560"></iframe>
>
> Rage Against The Machine -  Know Your Enemy Clip (Live At Finsbury Park)

This stuff is probably coming for you too. Those automated phone systems where you “hit 3 for billing” are terrible and annoying. They are not _better_ than just speaking to a human. And yet, those are forced upon us to save costs, to reduce the number of jobs. AI seems like that times 100: it will reduce costs so much that it will be used whether it’s good or not.

And, if there are productivity gains to be had, and I think there are, then we should own the means to run the programs that deliver them. I’m building new.space where you can make sense of all your tabs, bookmarks, files, and notes in a private, collaborative space using AI as you choose, you are in control. That is one possible way to do own our data and context going forward: build products that respect privacy and user control, letting us choose where our data goes and when.

## Big takeaway #2 for me: Always work on code like an open source project

I’ve always tried to work as close to the open source model as possible, and now I think that is even more important. In an open project you get suggested code changes from people you’ve never met or heard of, their code is of dubious quality, and you have to really vet and understand their code before accepting it into the project. Even those you’ve added as contributors can make mistakes or their accounts can get hacked.

Code originating from generative AI must be seen as a suspicious contribution as well. 

What’s great is we already have tools to handle this. We have pull request reviews, CI, multi-approval requirements before merging, sandboxes or staging environments, etc. All of these things are made to protect us from ourselves, and they will all help protect us from AI tools as well.

TK I’d love to expand on this more soon.

## The internet is full of confusing takes

Some of the smartest people I know are anti-AI and refuse to knowingly use it. Some of the other smartest people I know are using AI everyday, and say everyone else should too. I’ve heard some say they’ve been “AI pilled” (both in a positive and negative way). Some say there is no ethical way to use AI. Some say AI is mistaken so often to be useless. Others say it’s correct so often that they don’t need as many employees/coworkers anymore to do their work. 

In this current moment, if someone tells you what AI can definitely do or what it can definitely not do without a clear demo that you can run yourself, then you can’t believe them. Companies are saying it can do more than it probably can. Skeptics or those against AI are spreading misinformation that it cannot do things which it can objectively do. Both are problematic. 

RE: 

* [My AI Skeptic Friends Are All Nuts](https://fly.io/blog/youre-all-nuts/)
* [Contra Ptacek's Terrible Article On AI](https://ludic.mataroa.blog/blog/contra-ptaceks-terrible-article-on-ai/?utm_source=chatgpt.com)
* [if you are going to write an article making claims like AI can break down problems, it can reason, it can refactor, it can help you learn, it is genuinely capable at the task of producing software, you actually need to provide evidence at this point](https://mastodon.social/@jcoglan/114624176663492584)

## Ethical concerns

Two people I respect:

> …Ethical concerns front and center. First thing. Let’s get this out of the way and then see if thre is anything left worth talking about…
> 
> https://narrativ.es/@janl/114566975034056419

and

> …If you refuse to use these tools on ethical grounds or simply don't bother to keep up with them, I fear your employment prospects are likely to suffer in the short and medium term.
> 
> https://mastodon.social/@searls/114565915634957316

_So here are answers to my own ethical questions, front and center. If you think of more, please hit me up [on mastodon][masto], I’d love to learn/research more._

<details>
<summary>Are all AI tools trained on stolen content?</summary>

No. And this surprised me.

Firefly is trained only on licensed content by Adobe. This seems like a great decision for them, especially from a quality control perspective. 

[Our approach to generative AI with Adobe Firefly](https://www.adobe.com/ai/overview/firefly/gen-ai-approach.html)

>  We only train Adobe Firefly on content where we have permission to do so. 

Phi4 claims to be trained on high quality data like licensed books and academic sources. This is a very good, tool call capable model, so this opens up a ton of local AI use cases where you use your own energy to do AI tasks with a more ethically trained model. 

[phi-4 on Deepinfra](https://deepinfra.com/microsoft/phi-4?utm_source=chatgpt.com)

> Phi-4 is a model built upon a blend of synthetic datasets, data from filtered public domain websites, and acquired academic books and Q&A datasets. The goal of this approach was to ensure that small capable models were trained with data focused on high quality and advanced reasoning.

So it seems very possible to build SMLs and maybe even LLMs in an ethical way with enough effort and will.

However, all the “big models”, frontier LLMs, are in a grey area today. Legally, we don’t know, the courts haven’t ruled yet. Extra-legally, it can feel like theft for sure. The vibes are mixed and that is worth acknowledging. **I don’t believe the law will actually help us here.** One reason is: the lawyers and the judges who would adjudicate this are most likely using these tools. It feels too much of a “the can of worms is already open” or “the egg is already scrambled” situation. Extra-legally, pressure can always be applied towards companies that they behave in a more ethical manner. Sure. We should always strive for that. We don’t have to accept raw capitalism. We are always making trade offs, and that will continue.
</details>

<details>
<summary>Is the transformer pattern itself unethical?</summary>

While I have read more than one person online trying to say it is, I have found no reason to believe that it is. 

Matrix transforms + a giant embedding space seems to be the main magic here, and that’s math.

It helped me to learn more about what is actually going on. Checkout these links:

* [Transformer on Wikipedia](https://en.wikipedia.org/wiki/Transformer_(deep_learning_architecture))
* [Transformers, the tech behind LLMs | Deep Learning Chapter 5](https://www.youtube.com/watch?v=wjZofJX0v4M&pp=ygUTMyBibHVlIHRyYW5zZm9ybWVycw%3D%3D)
* 👉 [The moment we stopped understanding AI: AlexNet](https://www.youtube.com/watch?v=UZDiGooFs54)

If you watch only one explainer video, the [AlexNext](https://www.youtube.com/watch?v=UZDiGooFs54) one is the best to really explain what is going on inside these things _and_ how we got to where we are today.
</details>

<details>
<summary>Does AI break the economic model of the internet?</summary>

The internet does not have one economic model. Advertising is Google’s economic model (and then Facebook copied it as well). Saying “advertising is the economic model of the internet” benefits Google and Facebook, it’s the story they want told. There are other economic models working. Those will remain. Advertising may take a pretty big hit, for sure.
</details>

<details>
<summary>Is it really a good idea to give so much data to just a few very large companies?</summary>

Definitely not. 

And this is one reason I am working hard to enable local AI workflows on phones and laptops. I want to make it easy to bend this tech to benefit us, not bend ourselves to benefit it. It’s more important than ever that we are in control of our data, of our context.
</details>

<details>
<summary>Isn’t this all hype like web3?</summary>

First, I hate that you made me type “web3” on this here website.

Second, web3 is a lot different. My coins get more valuable if you buy a coin. It’s that simple. So I need as many people as possible to buy coins, so I can buy low and sell high. Stable coins might have utility, a lot of adjacent research and math is useful, IPFS is cool, sure, but overall it really seems mostly like a way to make new speculative assets.

AI is not like this at all. My AI tasks don’t start working better, or become more valuable if you use AI too. Also, the companies are losing money because of how expensive all of this is for them. If you use AI right now, you are technically a burden to them. These AI companies are “valuable” today because of future profits, not their profits today. They have cash flowing through them, but most are not capturing much of that cash… instead they are spending money to watch all their revenue flow out. The chip maker is doing quite well though, if you haven’t seen.

So it’s just not the same. The parts that feel the same are probably just general hype cycle dynamics. 
</details>

<details>
<summary>Isn’t this using so much water and energy that we should be concerned?</summary>

Maybe. 

It’s been difficult to find good reporting on this, and I just need more time to look into it. This feels too important to “have a take about” and not just take the time to do the research. So more information TK here.

If you know, or just have some good links, then [hit me up on mastodon][masto].
</details>

## Terms and definitions

<details>
<summary>Some people really don’t like calling it “AI,” because it’s not intelligent…</summary>

Listen, I am still bitter about “cloud computing.” 

You are correct, it is not “intelligent.” However, you can’t always win the messaging wars. I’ve moved on. 

Related: https://solarpunk.moe/@alilly/114928042375589900
</details>

<details>
<summary>What is an agent, what does that really mean?</summary>

An agent is an LLM with possible tool/function calls, running in a loop. The LLM can generate a spec to call a tool, another program calls that tool, then the previous conversation + the return value of the tool is fed back into the LLM. Repeat. Sometimes there is a function call to end the loop, the LLM can generate the spec to call that to finish the task. 

**”Tools in a loop.”**

There are many other definitions of “agent,” but **this is the one I like best right now.**

RE this article by Simon Willison: [Tools in a Loop](https://simonwillison.net/2025/May/22/tools-in-a-loop/).
</details>

## Capabilities Today

_I have found it difficult to understand what AI tools can actually do today. So I’ve been using different AI tools in anger + learning who to trust, who is reasonable about them. Here are some answers to my questions about capabilities._

<details>
<summary>AI tools aren’t _really_ doing anything beyond fancy spell check, next word prediction, right?</summary>

Related: https://mastodon.cloud/@jasongorman/114595098303670564

It is more nuanced. Next word prediction is very important for these products, but there are a few more things going on. 

One thing that is worth watching is [this video about Google’s Alpha Geometry project](https://www.youtube.com/watch?v=4NlrfOl0l8U) and how much “not AI” there is in that system. You don’t need to understand all of the geometry to understand that the AI part of the program isn’t even half of the whole deal.

Another example is [QueryGPT](https://www.uber.com/en-DE/blog/query-gpt/). A specially trained LLM can generate SQL from a plain English query. Then a normal database system will run the SQL and return the results. And, if one wants, the return value from the database could be fed back onto an LLM to generate a more “human friendly” response.

Generative AI (different types of fancy prediction) output is very useful as an input into another system. ChatGPT debuted as just Generative AI without much else, it would spew back text to you and that was it. But today, all of the major AI products are a series of workflows and pipes, where one or more of the steps is generative.

So, yes and no. 

And hopefully you can start to imagine how “generating statistically likely text / code to feed into something else” could be useful sometimes.
</details>

<details>
<summary>Are these AI tools good at/for search?</summary>

Yes. Google search pretty much sucks right now.  

AI research tools can be much better at surfacing the long tail. LLMs themselves have nothing to do with search, but “AI tools” and “agents” which might use LLMs to generate search queries, filters, etc can do a better job at searching than the average person. It feels to me like we are just beginning to see how LLMs and SLMs can help us improve our searching.

Related: 

* [I am disappointed in the AI discourse by Steve Klabnik](https://steveklabnik.com/writing/i-am-disappointed-in-the-ai-discourse/)
* [Local Open Source GPT Researcher](https://github.com/assafelovic/gpt-researcher)
</details>

<details>
<summary>Why would I ask AI to research something for me? Won’t it just invent new things? When I ask AI to research something for me, what do I actually get?</summary>

While working at Microsoft I heard a lot of _Bill Gates stories._ 😅 And while they might just be legends, one of them I remember and is related.

It was said that when Bill needed to learn about some difficult topic, he would pay a team to setup and video record lectures on the topic at top Universities. That team would then synthesize those recordings into a compressed curriculum for him, deliverable in a single binder. Then he could review that and quickly become a pseudo expert. And what a smart idea!

AI research tools can assemble a single folder of compressed information for you today and this works well. And this is a new super power. You can do what Bill Gates did (or maybe didn’t do, but was said to have done).

Giving the LLM some research input and having it generate a distillation or summary is where things might go wrong. It could generate nonsense, sure. Having the folder of resources is the most important part of the final artifact, not the generated “human friendly” summary.
</details>

<details>
<summary>Can AI code as well as a human today?</summary>

Yes.

In my experiments, it does as well as an average person. And I say this confidently. I’ve worked with enough programmers that I think you could easily hit the average with today’s tools. 

Now, to be clear, the average is a pretty low bar, so this isn’t as exciting or damning as it might sound. Today’s AI coding tools seem exactly like an unreliable coding intern who is in a hurry to go home. Which I guess is an achievement for humankind. I do expect AI coding tools to get much better over the next few years. 

Code feels easier to accurately generate than normal language to me, because of its limited grammar. And it can be tested to prove that it works. So I think it’s about the loops of tools that go from generate to test to remove, etc.

Related: https://wandering.shop/@aesthr/114592630789058368

> Sadly, while there are a few studies flying around about coding agents and their affect on productivity, there doesn’t appear to be any **reliable** research yet about this to me. It’s just too early to really know. I only ever see people posting links to studies that validate their already held beliefs. Hopefully we’ll see some peer reviewed research about this in the next couple years.
</details>

<details>
<summary>Won’t these tools generate tons of bad, broken code?</summary>

Yes. 

Humans have done that for a while. Now robots will do it in a more scalable way. 

Related: https://xoxo.zone/@microwavenby/114672517338884522

Also: https://neilmadden.blog/2025/06/06/a-look-at-cloudflares-ai-coded-oauth-library/

Also: https://forum.cursor.com/t/cursor-yolo-deleted-everything-in-my-computer/103131

The most successful projects I’ve worked on have been where I was fixing some awful, existing code. So if you enjoy fixing broken projects, this is your heyday.
</details>

<details>
<summary>Can AI _design_, like posters, graphics, art today?</summary>

Mostly no, from what I’ve seen. 

**You can design websites with AI tool,** but that is because that is coding. If you want a website that is as good as the average website, then yeah, you can poop that out of an AI system today. 

**You can also generate bitmap images using AI tools,** but again that is not quite the same as “design.” 

Posters and graphic design are not code or bitmap images tho. 

[Simon Willison always has each new model generate a pelican riding a bicycle and the results are informative.](https://simonwillison.net/tags/pelican-riding-a-bicycle/)

It feels like someone is probably working on this right now and we’ll see something super surprising in the next couple years. Have you seen things I haven’t, then please [hit me up on mastodon][masto].
</details>

<details>
<summary>No one is making money off this stuff yet, right?</summary>

Some are.

> Duolingo’s earnings are a window into the disconnect between the vocal minority who complain about AI online and the value businesses & people are getting out of it…
>
> https://mas.to/@carnage4life/114993379869191876

Also:

* [Some travel advisors are using AI to help plan trips and boost business](https://www.businessinsider.com/ai-travel-agents-trip-planning-agency-business-growth-2025-8)
* … more TK?
</details>

## The Future

<details>
<summary>Will we even know if the remote coworkers we are chatting with are human or AI?</summary>

Maybe not.

And yeah, that is dystopian. I am not excited about this, but if current trends hold I don’t see how you can be 100% sure.

* [Deepfakes, Scams, and the Age of Paranoia](https://www.wired.com/story/paranoia-social-engineering-real-fake/)
* …TK
</details>

<details>
<summary>So, I won’t be writing copy / writing code in the future?</summary>

I don’t think this is actually the right question. Many programmers move into roles where they write less code and spend almost all their time reviewing code. This is natural over time. And this could happen with AI: code review instead of code gen for code experts. Copy editors are the same: they are good at editing, someone else generates the copy. 

Also, photograph didn’t kill 100% of painting, but it definitely made painting an extra special, rare thing. You can always keep painting, but it might not be the dominant job anymore.
</details>

<details>
<summary>Will my research, coding, writing, etc skills atrophy if I use AI?</summary>

Seems possible. 

It seems to me, if you are an expert, then you are less likely to atrophy. If you are not an expert yet, and you don’t put in the effort, then you are not building any “muscle.” This is true today: if another human does the hard work for you, then you didn’t learn anything. And so that seems likely to be true with AI. 

> Sadly, while there are a few studies flying around, there doesn’t appear to be any reliable research yet about this. It’s just too early to really know. I only ever see people posting links to studies that validate their already held beliefs. Hopefully we’ll see some peer reviewed research about this in the next couple years.

If you are going to use AI, your best bet is probably to ask the AI to help you become an expert, and not to just give you the answers. 
</details>

<details>
<summary>So, every product is going to have AI in it?</summary>

Not every product.

Checkout https://procreate.com/ai, for example. My prediction is there will be a few apps that either intentionally stay out of AI, or AI just never is a good fit for. 
</details>

<details>
<summary>So, every person is going to be use AI everyday?</summary>

No, not everyone.

There definitely will be “AI vegans” and with diverse views about why they are avoiding AI, just like there are diverse views about avoiding meat.
</details>

<details>
<summary>Couldn’t we just turn off all the servers and be done with all of this AI stuff?</summary>

No.

There are very capable open source models, so you’d have to delete code permanently from the universe, and we know that is impossible.

I mean, sure, every government could outlaw AI and the open source models go underground. But this feels like a fantasy to me, and not really worth considering further.
</details>

## Vibes

<details>
<summary>Won’t it feel not great to manage a bunch of robots, all of whom are bad in weirdly different ways at their jobs?</summary>

Yes, it will not feel great for some people.

I am personally not excited to become a robot engineering manager… and it definitely feels to me that that will be a job. I think the main unknown is to what degree things will change. Will there be a few people that change over to manage robots, or will the majority of knowledge workers change over? If I had to guess today, I’d guess majority.

Related: 

> The thing that keeps coming up as I talk to people about AI in their workplaces is how *dehumanizing* it is. It's dehumanizing to ask a machine to do something, and then have to correct it over and over; it's dehumanizing to be told to read something that involved little to no human effort to make.
> 
> https://mstdn.social/@aworkinglibrary/114659560902662745
</details>













