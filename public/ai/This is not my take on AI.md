# This is not my take on AI

_The world doesn’t need another take._

_TL;DR: I’ve concluded that AI is coming and it’s important I understand it and I am in control of my data, of my context. This is why I am personally working to enable local AI workflows on phones and laptops. I’ll keep this page updated as I learn more._

[masto]: https://indieweb.social/@myobie

- - -

<details-controls></details-controls>

- - -

AI tools and companies are progressing fast and I have a lot of questions that I haven’t found easy answers to. **So, I’ve taken some time to research, use AI for real work, and read a lot of takes on AI. I’m collecting what I’ve learned here.** I plan to keep this page semi-up-to-date over time as I learn more. I don’t want to make a lot of blog posts about AI, instead I’ll just have this page here as a living document. I’ll try to pull my “big takeaways” up here to the top.

## Big Takeaway #1: AI is here and it's best for me to understand it

> <iframe allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen frameborder="0" height="315" src= "https://www.youtube-nocookie.com/embed/XAPfNPIvWkM" width="560"></iframe>
>
> Rage Against The Machine -  Know Your Enemy Clip (Live At Finsbury Park)

This stuff is probably coming for you too. Those automated phone systems where you “hit 3 for billing” are terrible and annoying. They are not _better_ than just speaking to a human. And yet, those are forced upon us to save costs, to reduce the number of jobs. AI seems like that times 100: it will reduce costs so much that it will be used whether it’s good or not.

And, if there are productivity gains to be had, and I think there are, then we should own the means to run the programs that deliver them. I’m building [new.space](https://new.space/app) where you can make sense of all your tabs, bookmarks, files, and notes in a private, collaborative space using AI as you choose, you are in control. That is one possible way to do own our data and context going forward: build products that respect privacy and user control, letting us choose where our data goes and when.

## Big takeaway #2 for me: Always work on code like an open source project

I’ve always tried to work as close to the open source model as possible, and now I think that is even more important. In an open project you get suggested code changes from people you’ve never met or heard of, their code is of dubious quality, and you have to really vet and understand their code before accepting it into the project. Even those you’ve added as contributors can make mistakes or their accounts can get hacked.

Code originating from generative AI must be seen as a suspicious contribution as well. 

What’s great is we already have tools to handle this. We have pull request reviews, CI, multi-approval requirements before merging, sandboxes or staging environments, etc. All of these things are made to protect us from ourselves, and they will all help protect us from AI tools as well.

TK I'd love to expand on this more soon.

## Big takeaway #3: The lethal trifecta for AI agents

Simon Willison identified the three properties that, when combined in an AI agent system, create a serious security vulnerability:

1. **Access to private data** (emails, files, databases)
2. **Exposure to untrusted content** (web pages, documents from others)
3. **The ability to externally communicate** (HTTP requests, sending emails, etc.)

> LLMs are unable to *reliably distinguish* the importance of instructions based on where they came from.

Removing any one of the three legs is enough to prevent the attack. This is particularly relevant as people adopt [MCP](https://modelcontextprotocol.io/) plugins where mixing tools from different sources can inadvertently assemble all three dangerous ingredients together.

RE: [The lethal trifecta for AI agents](https://simonwillison.net/2025/Jun/16/the-lethal-trifecta/) by Simon Willison.

## The internet is full of confusing takes

Some of the smartest people I know are anti-AI and refuse to knowingly use it. Some of the other smartest people I know are using AI everyday, and say everyone else should too. I’ve heard some say they’ve been “AI pilled” (both in a positive and negative way). Some say there is no ethical way to use AI. Some say AI is mistaken so often to be useless. Others say it’s correct so often that they don’t need as many employees/coworkers anymore to do their work. 

In this current moment, if someone tells you what AI can definitely do or what it can definitely not do without a clear demo that you can run yourself, then you can’t believe them. Companies are saying it can do more than it probably can. Skeptics or those against AI are spreading misinformation that it cannot do things which it can objectively do. Both are problematic. 

RE: 

* [My AI Skeptic Friends Are All Nuts](https://fly.io/blog/youre-all-nuts/)
* [Contra Ptacek's Terrible Article On AI](https://ludic.mataroa.blog/blog/contra-ptaceks-terrible-article-on-ai/?utm_source=chatgpt.com)
* [if you are going to write an article making claims like AI can break down problems, it can reason, it can refactor, it can help you learn, it is genuinely capable at the task of producing software, you actually need to provide evidence at this point](https://mastodon.social/@jcoglan/114624176663492584)

<details>
<summary>Some people really hate AI</summary>

And I think it's important to link to them here. These aren't casual skeptics -- they've thought about it and concluded AI is fundamentally harmful.

* [Every Reason Why I Hate AI and You Should Too](https://malwaretech.com/2025/08/every-reason-why-i-hate-ai.html) by Marcus Hutchins (the security researcher who stopped WannaCry)
* [I Am An AI Hater](https://anthonymoser.github.io/writing/ai/haterdom/2025/08/26/i-am-an-ai-hater.html) by Anthony Moser

I mention further down that there will be "AI vegans." These people are already here and their concerns are worth reading even if you don't fully agree.
</details>

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

Phi-4-mini claims to be trained on high quality data like licensed books and academic sources. This is a very good, tool call capable model that can run on a laptop or phone, so this opens up a ton of local AI use cases where you use your own energy to do AI tasks with a more ethically trained model.

[phi-4-mini on Ollama](https://ollama.com/library/phi4-mini)

> Phi-4-mini is a lightweight model built upon a blend of synthetic datasets, data from filtered public domain websites, and acquired academic books and Q&A datasets. The goal of this approach was to ensure that small capable models were trained with data focused on high quality and advanced reasoning.

So it seems very possible to build SMLs and maybe even LLMs in an ethical way with enough effort and will.

However, all the "big models", frontier LLMs, are in a grey area today. Courts are now ruling, but in contradictory ways: the [UK High Court ruled](https://www.ropesgray.com/en/insights/viewpoints/102lvxe/getty-image-loses-copyright-infringement-claim-against-stability-ai-in-uks-first) (Getty v. Stability AI, Nov 2025) that AI training does NOT constitute copyright infringement because trained models don't "store" copyrighted works. Meanwhile, a [Munich court ruled the opposite](https://www.twobirds.com/en/insights/2025/landmark-ruling-of-the-munich-regional-court-(gema-v-openai)-on-copyright-and-ai-training) (GEMA v. OpenAI, Nov 2025), finding OpenAI violated German copyright law by training on song lyrics. In the US, the [NYT v. OpenAI case](https://www.npr.org/2025/03/26/nx-s1-5288157/new-york-times-openai-copyright-case-goes-forward) is progressing but hasn't gone to trial yet. And the music industry is [settling into licensing deals](https://techcrunch.com/2025/11/25/warner-music-signs-deal-with-ai-music-startup-suno-settles-lawsuit/) rather than waiting for courts.

Extra-legally, it can feel like theft for sure. The vibes are mixed and that is worth acknowledging. **I don't believe the law will actually help us here.** The egg is already scrambled and courts across jurisdictions can't even agree on the basics. Extra-legally, pressure can always be applied towards companies that they behave in a more ethical manner. Sure. We should always strive for that. We don't have to accept raw capitalism. We are always making trade offs, and that will continue.
</details>

<details>
<summary>Is the transformer pattern itself unethical?</summary>

While I have read more than one person online trying to say it is, I have found no reason to believe that it is. 

Matrix transforms + a giant embedding space seems to be the main magic here, and that’s math.

It helped me to learn more about what is actually going on. Checkout these links:

* [Transformer on Wikipedia](https://en.wikipedia.org/wiki/Transformer_(deep_learning_architecture))
* [Transformers, the tech behind LLMs | Deep Learning Chapter 5](https://www.youtube.com/watch?v=wjZofJX0v4M&pp=ygUTMyBibHVlIHRyYW5zZm9ybWVycw%3D%3D)
* 👉 [The moment we stopped understanding AI: AlexNet](https://www.youtube.com/watch?v=UZDiGooFs54)

If you watch only one explainer video, the [AlexNet](https://www.youtube.com/watch?v=UZDiGooFs54) one is the best to really explain what is going on inside these things _and_ how we got to where we are today.
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

AI is not like this at all. My AI tasks don't start working better, or become more valuable if you use AI too. Also, most of the big AI companies are still losing money because of how expensive all of this is for them, though there are exceptions -- Midjourney is profitable with zero outside funding, and Microsoft is making real money on Azure AI. Most AI companies are "valuable" today because of future profits, not their profits today. They have cash flowing through them, but most are not capturing much of that cash… instead they are spending money to watch all their revenue flow out. The chip maker is doing quite well though, if you haven't seen.

So it’s just not the same. The parts that feel the same are probably just general hype cycle dynamics. 
</details>

<details>
<summary>Isn’t this using so much water and energy that we should be concerned?</summary>

Yes, probably.

I've read quite a bit about this now and the honest answer is: the reporting doesn't do a great job of putting things into perspective. A single ChatGPT query uses roughly 5x more electricity than a web search, but what does that actually mean compared to, say, the energy I use making coffee or driving to the store? The articles I've found are better at describing the scale of data center growth than at helping a normal person understand where AI fits into their own energy footprint.

That said, the trajectory is concerning. [MIT Technology Review reports](https://www.technologyreview.com/2025/05/20/1116327/ai-energy-usage-climate-footprint-big-tech/) that by 2028 more than half of data center electricity will go to AI, and no company reports AI-specific environmental metrics. [Brookings reports](https://www.brookings.edu/articles/ai-data-centers-and-water/) that a typical data center uses 300,000 gallons of water per day for cooling, and large ones use 5 million gallons -- and water cooling demand may increase 870%.

The real concern isn't today's usage but the growth trajectory. AI usage is expected to double or triple in the next few years, and infrastructure decisions being made now will lock in environmental impacts for decades. Efficiency improvements are real (newer chips, better cooling) but are being outpaced by demand growth.
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

An agent is an LLM or SLM with possible tool/function calls, running in a loop. The LM can generate a spec to call a tool, another program calls that tool, then the previous conversation + the return value of the tool is fed back into the LLM. Repeat. Sometimes there is a function call to end the loop, the LM can generate the spec to call that to finish the task. 

**”Tools in a loop.”**

There are many other definitions of “agent,” but **this is the one I like best right now.**

RE this article by Simon Willison: [Tools in a Loop](https://simonwillison.net/2025/May/22/tools-in-a-loop/).
</details>

## Capabilities Today

_I have found it difficult to understand what AI tools can actually do today. So I've been using different AI tools in anger + learning who to trust, who is reasonable about them. Here are some answers to my questions about capabilities._

I have shipped code written by LLMs. Sometimes they write exactly the code I would have written and it doesn't need any touch ups. Other times, they produce slop that I have to just clear and try again or write myself. The variance is the thing -- it's not consistently good or consistently bad, it's both, sometimes in the same session.

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

Now, to be clear, the average is a pretty low bar, so this isn't as exciting or damning as it might sound. Today's AI coding tools seem exactly like an unreliable coding intern who is in a hurry to go home. Which I guess is an achievement for humankind. That said, every 3-6 months the quality and reliability of these tools really is increasing, and I do expect them to keep getting better.

Code feels easier to accurately generate than normal language to me, because of its limited grammar. And it can be tested to prove that it works. So I think it's about the loops of tools that go from generate to test to remove, etc. Justin Searls has written that [TDD is more important than ever](https://justin.searls.co/posts/tdd-is-more-important-than-ever/) precisely because AI coding agents need verification to work well. He also [built a project in three hours](https://justin.searls.co/links/2025-09-08-i-ve-got-your-shovelware-right-here/) that would have taken weeks, making it worth doing at all.

There is real research now. A [large RCT at Microsoft, Accenture, and a Fortune 100 company](https://mitsloan.mit.edu/ideas-made-to-matter/how-generative-ai-affects-highly-skilled-workers) (4,867 developers) found Copilot increased completed tasks by 26% -- but almost all the gains went to junior devs (27-39%), while senior devs saw only 8-13%. Meanwhile, a [METR study](https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/) of 16 experienced open-source developers found that AI users were actually **19% slower** on their own repos -- and the developers *believed* they were 20% faster. That perception-reality gap is worth sitting with.

Related: https://wandering.shop/@aesthr/114592630789058368

Also: [Sprinkling Self-Doubt on ChatGPT](https://mastodon.social/@searls/115072539129871055) by Justin Searls.
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

This needs to be split into two answers now.

**Reproducing something visually, pixel for pixel: mostly no.** Posters and graphic design are not code or bitmap images. You can generate bitmap images using AI tools, but that is not quite the same as "design." [Simon Willison always has each new model generate a pelican riding a bicycle and the results are informative.](https://simonwillison.net/tags/pelican-riding-a-bicycle/)

**Creating designs and working apps just by prompting: very much yes.** [Figma Make](https://blog.logrocket.com/ux-design/figma-make-review/) can turn text prompts into working app prototypes and designs, inheriting your existing design system, with no coding required. If you want a website or app prototype that is as good as the average, then yeah, you can get that from a prompt today.

**And you can now generate 3D models from text prompts.** Tools like [Meshy](https://www.meshy.ai/), [Tripo AI](https://www.tripo3d.ai/), and Luma Genie can generate textured, export-ready 3D meshes in 30-60 seconds from a description. These cover modeling, texturing, retopology, and rigging. ([Comparison of text-to-3D tools for 2026](https://www.3daistudio.com/3d-generator-ai-comparison-alternatives-guide/best-3d-generation-tools-2026/12-best-text-to-3d-tools-creators-2026))

This area is moving very fast.
</details>

<details>
<summary>No one is making money off this stuff yet, right?</summary>

Some are, with real numbers now.

[Midjourney](https://getlatka.com/companies/midjourney) generated ~$500M in revenue in 2025 with about 100 employees and **zero outside funding** -- genuinely profitable. [OpenAI](https://finance.yahoo.com/news/openai-cfo-says-annualized-revenue-173519097.html) hit ~$20B annualized revenue but is still burning ~$8B/year. [Anthropic](https://www.bloomberg.com/news/articles/2026-01-21/anthropic-s-revenue-run-rate-tops-9-billion-as-vcs-pile-in) topped $9B run rate. [Cursor](https://fortune.com/2025/12/11/cursor-ipo-1-billion-revenue-brainstorm-ai/) crossed $1B ARR but may be spending nearly 100% of revenue on API costs. Microsoft Azure is growing 39% year-over-year, driven largely by AI.

So there is enormous revenue, but actual profitability among pure-play AI companies is rare. Midjourney is the standout.

That said, a [MIT NANDA initiative study](https://mas.to/@carnage4life/115059290859727270) found that 95% of generative AI deployments fail to generate measurable business value. The money is flowing but the value is concentrated.

> Duolingo's earnings are a window into the disconnect between the vocal minority who complain about AI online and the value businesses & people are getting out of it…
>
> https://mas.to/@carnage4life/114993379869191876

Also: [Some travel advisors are using AI to help plan trips and boost business](https://www.businessinsider.com/ai-travel-agents-trip-planning-agency-business-growth-2025-8)
</details>

## Local AI tools and workflows

_One of my big takeaways above is that we should own our data and context. Here are some tools and projects that enable local AI workflows._

* [qmd](https://github.com/tobi/qmd) by Tobi Lutke -- a local search engine for your personal markdown files, notes, and documents. BM25 + vector semantic search + LLM reranking, all running locally. Has MCP server integration so you can plug it into Claude as a context source.
* [Local Text Summarization With Ollama and Python Is Just String Manipulation](https://nelson.cloud/local-text-summarization-with-ollama-and-python-is-just-string-manipulation/) -- a practical tutorial showing that using local LLMs through Ollama is fundamentally simple: you pass in a string, you get a string back.
* [Ollama Advanced Use Cases and Integrations](https://www.cohorte.co/blog/ollama-advanced-use-cases-and-integrations) -- structured outputs, tool calling, RAG pipelines, all running locally.
* I pushed my own [local marketplace for Claude plugins](https://github.com/myobie/dot-files/commit/66816d0505b6466e5284a5e96c13aaaf1c791def) to my dot-files repo -- an extensible framework for using Codex CLI as specialized agents within Claude for code reviews, debugging, and refactoring.

## People building with AI right now

Mitchell Hashimoto (co-founder of HashiCorp) wrote [My AI Adoption Journey](https://mitchellh.com/writing/my-ai-adoption-journey) documenting his six-phase path from skepticism to running agents continuously. The whole thing is worth reading, but some highlights: he forced himself to do every task twice (once manually, then with an agent) to build real intuition. He dedicates the last 30 minutes of each workday to agent tasks. And he invests heavily in "harness engineering" -- building verification tools and documentation (`AGENTS.md`) that help agents self-correct. He also wrote about [vibing a non-trivial Ghostty feature](https://mitchellh.com/writing/non-trivial-vibing) -- 16 AI sessions, $15.98 in tokens, and about 8 hours across 3 days to ship a real feature. His core takeaway: "Good AI drivers are experts in their domains and utilize AI as an assistant, not a replacement."

## OpenClaw

[OpenClaw](https://openclaw.ai/) ([github](https://github.com/openclaw/openclaw)) is an open-source, self-hosted personal AI agent built by [Peter Steinberger](https://steipete.me/) (steipete, founder of PSPDFKit). It's an AI that doesn't just chat but actually performs tasks: messaging via WhatsApp/Telegram/Slack, browser control, device automation, voice mode, and an extensible skills/plugin system. It runs on your own hardware.

The project has had quite the naming saga: it started as **Clawdis** ([github](https://github.com/steipete/clawdis), Nov 2025), became **Clawdbot** after growing to ~30k stars, then was renamed to **Moltbot** after Anthropic's legal team contacted steipete about the name being too similar to "Claude" -- at which point handle snipers grabbed the old social media accounts within seconds and crypto scammers launched a fake $CLAWD token. It finally landed on **OpenClaw** (Jan 2026) and now has 179k+ GitHub stars.

This project currently has all three legs of the [lethal trifecta](#big-takeaway-3-the-lethal-trifecta-for-ai-agents): access to private data, exposure to untrusted content, and the ability to externally communicate. Worth keeping in mind.

Related:

* [Just One More Prompt](https://steipete.me/posts/just-one-more-prompt) -- steipete reflects on his addiction to AI-powered development, drawing parallels to unsustainable work patterns.
* [Shipping at Inference-Speed](https://steipete.me/posts/2025/shipping-at-inference-speed) -- his development workflow with AI.

## The Future

<details>
<summary>Will we even know if the remote coworkers we are chatting with are human or AI?</summary>

Maybe not.

And yeah, that is dystopian. I am not excited about this, but if current trends hold I don’t see how you can be 100% sure.

* [Deepfakes, Scams, and the Age of Paranoia](https://www.wired.com/story/paranoia-social-engineering-real-fake/)
</details>

<details>
<summary>So, I won’t be writing copy / writing code in the future?</summary>

I don’t think this is actually the right question. Many programmers move into roles where they write less code and spend almost all their time reviewing code. This is natural over time. And this could happen with AI: code review instead of code gen for code experts. Copy editors are the same: they are good at editing, someone else generates the copy. 

Also, photograph didn’t kill 100% of painting, but it definitely made painting an extra special, rare thing. You can always keep painting, but it might not be the dominant job anymore.
</details>

<details>
<summary>Will my research, coding, writing, etc skills atrophy if I use AI?</summary>

Seems likely.

It seems to me, if you are an expert, then you are less likely to atrophy. If you are not an expert yet, and you don't put in the effort, then you are not building any "muscle." This is true today: if another human does the hard work for you, then you didn't learn anything. And so that seems likely to be true with AI.

There is now real research on this. An [Anthropic study](https://www.anthropic.com/research/AI-assistance-coding-skills) (Jan 2026) had 52 junior engineers complete coding tasks with and without AI. The AI group scored **50% on a comprehension quiz** vs **67% for the hand-coding group** -- about two letter grades lower. Debugging skills were hit hardest. And the time savings from using AI were not even statistically significant. As they put it: "AI-enhanced productivity is not a shortcut to competence."

Meanwhile, a [Stanford study](https://digitaleconomy.stanford.edu/publications/canaries-in-the-coal-mine/) found that employment for software devs aged 22-25 has declined nearly 20% from its peak in late 2022. If juniors are being hired less, the pipeline for developing senior talent narrows.

Related: [In the Long Run, LLMs Make Us Dumber](https://desunit.com/blog/in-the-long-run-llms-make-us-dumber/) argues that over-reliance on LLMs weakens cognitive abilities by removing beneficial mental friction.

If you are going to use AI, your best bet is probably to ask the AI to help you become an expert, and not to just give you the answers.
</details>

<details>
<summary>So, every product is going to have AI in it?</summary>

Not every product.

Checkout https://procreate.com/ai, for example. My prediction is there will be a few apps that either intentionally stay out of AI, or AI just never is a good fit for.

Meanwhile, some people are frustrated that AI is being added to products they don't want it in. [One person is considering blocking all browsers except Chrome](https://mastodon.social/@mcc/115176228086016550) because it's the only major browser without built-in AI summarization.
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

Justin Searls wrote about [The Generative Creativity Spectrum](https://justin.searls.co/mails/2025-09/): when creativity's value is internal (writing essays for yourself), AI diminishes it. When it's external (producing output for others), AI can help. Programming sits uncomfortably in the middle -- AI dramatically increases productivity but diminishes the engaging problem-solving that made coding rewarding.

And steipete wrote about the flip side: AI can be [addictive](https://steipete.me/posts/just-one-more-prompt). "Just one more prompt" mirrors unsustainable work patterns. AI restored his passion for building but created a compulsive loop.
</details>

<details>
<summary>The robots are faster than me now and I am the bottleneck</summary>

AI agents can generate code and features so quickly that I may not have time to actually try them out. I have a side project right now where there is something waiting for me to test, to actually sit down and use it, and I haven't had time. The code was generated faster than I can evaluate it. I am the bottleneck.

This is a weird inversion. The hard part used to be writing the code. Now the hard part might be having enough hours in the day to verify, test, and actually experience what was built.
</details>













