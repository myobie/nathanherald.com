---
title: Principles matter more with agents
date: 2026-05-05T00:08:28+02:00
description: Why core principles matter more than architecture, especially when working with coding agents.
---

Whether working with humans or robots, it always helps to have your core principles documented and defined. I find most programmers think the specific architecture, data structures, or the language matters most and should be well defined for all projects… but I disagree.

What matters to me are the core principles and conventions. How do we agree we can read from state safely? How do we agree to mutate state, if at all? What sort of reactivity is important to us and how do we agree to use reactivity in our UI and elsewhere? Where should we keep shared code? How important is sharing code vs. isolation? What defines a unit test? Can unit tests use the disk, the database, the network? How do we avoid mocking everything so we know our app works without having slow tests? Can we tolerate any failing or skipped tests?

If these things aren’t defined, then it doesn’t matter if you choose go or javascript, your app will most likely be buggy and not understandable.

It’s easier to talk about an example to show what I mean.

When building an iOS app with an agent, I find setting some base principles around state to be the most important.

1) All visible state must be exposed through AppState which must be @Observable. AppState must contain and expose literally all visible state, no exceptions. If it is shown, it must be in AppState.

This takes care of how we read from state to present it, how that state is reactive, and helps us pre-decide a ton of things. Inside AppState we keep state as simple structs and enums. If we want to debounce or rate limit state updates, we debounce or rate limit assignments to parts of AppState, we don’t mess with how @Observable works. Etc. Also, AppState is fully unit testable. We can setup and test any version of AppState in a test, which means we can test any version of our app that the user would see. And creating Previews from AppState will be super straightforward.

2) State can only be mutated by methods on AppActions, which has init(appState: AppState). By convention, nothing else can mutate state held by AppState. All methods on AppActions must be unit tested.

AppActions should be super easy to unit test. It should be easy to setup any version of an AppState and then test how a method of AppActions changes it. Which leads me to…

3) The UI can only call methods on AppActions. So views must take init(appActions: AppActions) or use @Environment.

Since AppActions is super unit testable and the UI can only ever call methods on AppActions, then >90% of what the UI does can be unit tested. You can be confident most of the app works just from the tests.

This is super super important when working with others you don’t trust. And a coding agent is a developer you cannot trust 😅

4) All things like date formatters, string formatters, etc must be methods on AppHelpers. All methods on AppHelpers must be unit tested.

This should make sense.

5) Local first, offline first all the time.

Don’t ever allow a coding agent to start building some sort of _online only_ feature. If you want to show something from a remote server, expose it via AppState. Then have a way to read from disk into AppState. Then have a way to fetch from the network and write to disk. And now you can hit the remote server, write to disk, assign into AppState, and the UI reacts automatically and everyone is good. Leave the old version cached on disk if at all possible. Don’t revert to an empty state while fetching. Keep some sort of isFetching in AppState if you need to. Even better: model your state machine with an enum so you can transition through different states which drive the UI. And unit test everything.

Even with strong principles defined, you have to review the agent’s work regularly and make sure it’s still adhering. Drift happens. An agent will start mocking things it shouldn’t, mutating state from outside AppActions, or sneaking in some online-only call. Catch it early and pull the work back in line.

This is enough to get started. And sure, one could say SwiftUI only, Swift 6.2 only, MainActor by default, and one can even start talking about data modeling and schemas… but those should be defined in a different file.

The above, and more, should go into a PRINCIPLES.md file that doesn’t try to be a plan or a spec, but instead can help us build a reliable, resilient app from any plan or spec.

Also, don’t just go from PRINCIPLES.md to SPEC.md, write an IDEA.md and make sure it’s clear that the idea is flexible, it may change as we iterate. Document the problem + the big idea, those likely won’t change. The plan will.

Locking into a super detailed spec too early can prevent you from discovering the best solutions to your problems. This is the same when working with humans or coding agents.

Instead define your core principles, your big idea, the problems you are trying to solve, and then maybe some light specs.
