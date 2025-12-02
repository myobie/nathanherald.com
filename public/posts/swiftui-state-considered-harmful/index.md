+++
title = "SwiftUI @State Considered Harmful"
date = "2025-12-02T12:00:00+01:00"
description = "Why @State for collections causes performance problems and how to fix it with observable classes and identity preservation"
+++

## The Problem with `@State` for Collections

When you're building a SwiftUI app with lists of items, like say podcast episodes, the obvious approach is `@State`:

```swift
struct EpisodeListView: View {
    @State private var episodes: [Episode] = []

    var body: some View {
        List(episodes) { episode in
            EpisodeRow(episode: episode)
        }
    }
}
```

This seems to work at first. But then I notice UI stuttering while using the app…

The moment you change *any* property on *any* episode, SwiftUI invalidates the entire `@State` array. Every `EpisodeRow` re-renders. With 100 episodes and a playback position updating every second, you're re-rendering 100 rows every second. 1,000 episodes and things get real sad. Your UI stutters. Your battery drains.

**The fundamental problem:** `@State` treats the entire array as a single unit of change. SwiftUI can't see *inside* structs to know that only `episodes[42].playbackPosition` changed, for example. It sees "the array changed" and rebuilds everything.

## The Solution: Observable Collections of Observables with Identity Preservation

SwiftUI seems to have a lot of the downsides of the "just rerender everything" frameworks like React. Luckily, I have dealt with react, preact, svelte, etc. **Granular reactivity requires granular changes and stable identity.**

After a lot of iteration, this of what I've landed on. I am not a SwiftUI expert, so please tell me if this is terrible.

**Ive made each item an `@Observable` class, stored them by reference in a dictionary, and I update them in-place.**

```swift
@MainActor
@Observable
final class Episode: Identifiable {
    var id: String
    var title: String
    var playbackPosition: Int
    var isDownloaded: Bool
    // ... other properties

    func update(from snapshot: EpisodeSnapshot) {
        self.title = snapshot.title
        self.playbackPosition = snapshot.playbackPosition
        self.isDownloaded = snapshot.isDownloaded
        // ... update all properties except identity (id)
    }
}
```

When I build an app I am dogmatic that there should be one "app state" that exists outside the UI and is granularly reactive by default. It can be unit tested. And when I look at this object I should be able to imagine what the UI looks like.

```swift
@MainActor
@Observable
final class AppState {
    var episodes: [String: Episode] = [:]

    func mergeEpisodes(_ incoming: [String: EpisodeSnapshot]) {
        let incomingIds = Set(incoming.keys)
        let existingIds = Set(episodes.keys)

        // Remove deleted
        for id in existingIds.subtracting(incomingIds) {
            episodes.removeValue(forKey: id)
        }

        // Update existing or add new
        for (id, incomingEpisode) in incoming {
            if let existing = episodes[id] {
                existing.update(from: incomingEpisode)  // Update in-place!
            } else {
                episodes[id] = Episdoe(from: incomingEpisode)  // New item
            }
        }
    }
}
```

This gives me:

1. **Granular updates:** When `episode.playbackPosition` changes, only views observing that specific property re-render
2. **Stable object identity:** The same `Episode` instance persists across refreshes, so SwiftUI can diff efficiently
3. **Single source of truth:** One `Episode` instance per ID, owned by `AppState`

## Questions You're Probably Asking

### 1. "Why a class instead of a struct?"

Structs are value types. When you put structs in an array and modify one, you get a new array. SwiftUI sees a new array and re-renders everything.

Classes are reference types. When you modify a property on a class instance, the reference stays the same. With `@Observable`, SwiftUI tracks which properties each view actually reads and only re-renders when those specific properties change on the class instance.

```swift
// With structs: entire list re-renders
episodes[0].playbackPosition = 100  // Creates new array

// With classes: only views reading playbackPosition re-render
episodes["id"]?.playbackPosition = 100  // Same reference, property changes
```

### 2. "Won't this cause memory leaks or retain cycles?"

Not if you follow the ownership model. `AppState` owns all `Episode` instances in a dictionary. Views receive references through lookups (`appState.episode(id: episodeId)`). There are no closures capturing episodes, no parent-child cycles—just a flat owner (AppState) and temporary readers (views).

Do you know a better way to enforce this? Let me know, hit me up on [mastodon][].

### 3. "Why a dictionary instead of an array?"

Two reasons:

1. **Fast lookups by ID** - Detail views might need to look up episodes frequently. Make it easy.

2. **Merging is clearer** - When I refresh from disk/network, I get a new set of episodes. With a dictionary, it's obvious how to merge: update existing keys in-place, add new keys, remove missing keys.

Also, computed properties give you arrays when you need them:

```swift
var allEpisodes: [Episode] {
    episodes.values.sorted { $0.date > $1.date }
}
```

Don't sleep on computed properties: those are observable too.

### 4. "What about thread safety?"

Both `Episode` and `AppState` are marked `@MainActor`, so they can only be accessed from the main thread. The compiler enforces this for you.

For crossing actor boundaries (like loading from disk on a background thread), I use an `EpisodeSnapshot` struct. Snapshots are plain value types that can be safely sent anywhere. Background work produces snapshots, then sends them to `AppState` on the main actor to be merged in.

```swift
// Background actor loads data and creates snapshots
let snapshots: [String: EpisodeSnapshot] = await loadFromDisk()

// Send to main actor for merging
await appState.mergeEpisodes(snapshots)
```

This keeps the boundary clean: snapshots cross actors, Episodes stay on main.

### 5. "Why not just use @ObservationIgnored on frequently-changing properties?"

Because then SwiftUI doesn't see the changes at all. If `playbackPosition` is ignored, the progress indicator in the UI never updates. Also, "app state" should only be the actual state. If it isn't useful for the app, then it shouldn't be in there.

The real solution is structuring views to observe only what they display:

```swift
// Good: This view only observes title and date
struct EpisodeRow: View {
    let episode: Episode

    var body: some View {
        VStack {
            Text(episode.title)
            Text(episode.date, style: .date)
        }
    }
}

// The playback position view is separate
struct PlaybackProgress: View {
    let episode: Episode

    var body: some View {
        ProgressView(value: Double(episode.playbackPosition),
                     total: Double(episode.duration))
    }
}
```

Now playback position updates only re-render `PlaybackProgress`, not `EpisodeRow`.

### 6. "How do views get fresh data after updates?"

Detail views should always look up from AppState:

```swift
struct EpisodeDetailView: View {
    let episodeId: String  // Just the ID
    @Environment(AppState.self) private var appState

    private var episode: Episode? {
        appState.episode(id: episodeId)  // Always fresh
    }

    var body: some View {
        if let episode {
            Text(episode.title)
            // ...
        }
    }
}
```

The view holds an ID, not a stale copy. Every access goes through AppState, which holds the authoritative instance.

### 7. "Does this help with testing?"

Enormously. All state lives in `AppState` and I bundle all mutations in `AppActions`. Tests don't need to render SwiftUI at all:

```swift
@MainActor
func testDownloadUpdatesEpisode() async throws {
    let appState = AppState(...)
    let appActions = AppActions(appState: appState, ...)

    // Seed an episode
    let episode = Episode(id: "test", isDownloaded: false, ...)
    appState.episodes["test"] = episode

    // Perform action
    await appActions.downloadEpisode(episode)

    // Assert state changed
    XCTAssertTrue(appState.episodes["test"]?.isDownloaded == true)
}
```

No UI, no simulators, fast and deterministic. The views are just projections of state, so I can just test the state.

### 8. "What about derived/computed state like 'downloaded episodes'?"

Keep derived state as computed properties on `AppState`:

```swift
var downloadedEpisodes: [Episode] {
    episodes.values.filter { $0.isDownloaded }.sorted { $0.date > $1.date }
}

var newEpisodes: [Episode] {
    episodes.values.filter { !$0.hasPlayed }.sorted { $0.date > $1.date }
}
```

These recompute on access, but because `@Observable` tracks reads, a view that only accesses `downloadedEpisodes` won't re-render when `newEpisodes` would change (unless the underlying episodes data changed in a way that affects both). You can move to a memoized version if you find you need to optimize, but wait IMO.

### 9. "How do you handle navigation with reactive data?"

Navigate by ID, not by object:

```swift
// Good: Pass ID
NavigationLink(value: NavigationRoute.episode(episode.id)) {
    EpisodeRow(episode: episode)
}

// In destination
.navigationDestination(for: NavigationRoute.self) { route in
    switch route {
    case .episode(let id):
        EpisodeDetailView(episodeId: id)
    }
}
```

The detail view looks up fresh data from AppState using the ID. Even if the episode updates while navigating, the detail view sees the current state.

### 10. "What about high-frequency updates like playback progress?"

Throttle before mutating state. I use Combine to debounce playback callbacks:

```swift
// AudioPlayerService sends callbacks frequently
// A Combine pipeline throttles to ~250ms before updating AppState
playerProgressPublisher
    .throttle(for: .milliseconds(250), scheduler: DispatchQueue.main, latest: true)
    .sink { [weak self] time in
        self?.appState.currentTime = time
    }
```

The audio callback fires 60x/second. AppState updates 4x/second. The UI is smooth, and you're not burning CPU on excessive re-renders.

### 11. "How does this compare to Redux/TCA?"

Similar in spirit, different in mechanics. Like Redux/TCA:

- Single source of truth (AppState)
- Unidirectional flow (Action → State → UI)
- Testable without UI

Unlike Redux/TCA:

- No action types or reducers—just methods on AppActions
- Native Swift observation instead of custom subscription system
- Reference types for items that need granular updates

It's less ceremony, more direct mutation, but the same core principles.

- - -

Any other questions I missed? Hit me up on [mastodon][].



[mastodon]: https://indieweb.social/@myobie
