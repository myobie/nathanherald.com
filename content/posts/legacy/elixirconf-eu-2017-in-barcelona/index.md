+++
title = "ElixirConf EU 2017 in Barcelona"
description = "A distillation of my conference talk."
date = "2017-06-27T10:01:17.027Z"
mediumUrl = "https://medium.com/@myobie/elixirconf-eu-2017-in-barcelona-3de660eff76d"
aliases = [
  "/writing/legacy/elixirconf-eu-2017-in-barcelona/"
]
+++

Hello.

I design distributed applications from UI to data storage as a career. I started out as a graphic designer, got into programming, and now that has spiraled out of control.

Aside: I built my own presentation software using [choo](https://choo.io) and phoenix. If you want to have a lot more anxiety than necessary, then build your own presentation software. As an example: I don’t have speaker notes because I didn’t have time to implement that feature.

{{<fig src="1-3Ibv-qH5Vo9-Fm8sjGC30A.png" alt="Screenshot of the presenter view for the presentation software I made for myself">}}
This is what the presentation software looks like for me.
{{</fig>}}

### Distributed applications are hard

One has to deal with network partitions, concurrency, locking and/or linearization, stale data, etc. Here is a painting that represents how I feel about distributed systems: they are great fun and I feel dead.

{{<fig src="1-aqjDRpRjbuT3rcWb1K1Pew.jpeg" alt="Painting of a skeleton surfing">}}
By Ted Parker — [_http://ted-parker.com/portfolio/surfs-dead/_](http://ted-parker.com/portfolio/surfs-dead/)
{{</fig>}}

#### Network latency

Network latency can cause stale reads from consistent systems. A server’s response for one request can arrive much later than expected, possibly after one or more other responses that were sent after it. This happens all the time. 😱

{{<fig src="1-S40jbGVy9x1Cnxq4csEXuA.png" alt="Illustration of network request ordering">}}
Networks can cause everything to be out of order, no matter which is sent first.
{{</fig>}}

#### Scaling is hard

One has to deal with load balancing, parallelism, databases, AUTOVACUUM & VACUUM… Even after all these years managing databases is still hard.

### Why build a distributed system in the first place?

Small systems are super fun. I’ve really enjoying building systems for 100 or 1000 users in the past. But to support “billions” of users one has to get good at horizontal scaling, offline support, and dealing with bad networks. This means one must build a distributed system. 💔

### Granularity

I recently watched [a talk](https://youtu.be/bo5WL5IQAd0) by [Joe Armstrong](https://en.wikipedia.org/wiki/Joe_Armstrong_%28programming%29) where he talks about the best ways to build concurrent software. His primary anaolgy is that: if your CPUs or VMs are like buckets or containers and you design your system components like large stones or bowling balls, then you end up with a lot of empty space in the containers. If you instead designed your components like small grains of sand, then you can really fill up each container to the brim with little wasted space.

This really had an impact on me: **granular = scalable.** 💝

### A crazy idea

For a while I and some collegues have had this crazy idea: what if every user had their own database, maybe as a simple file stored on S3?

Having a central database in a system makes a lot of things easier; however, a central database is hard to scale. What if we took this idea of granularity and really went with it?

#### First, we must talk about “time”

Human time cannot be trusted in a distributed system. Instead, we have to invent our own measurement for when our system “moves foward.” _Any working distributed system is an implementation of how that organization has understood time._

**Most systems I’ve worked with have used a central database to control time.** We use transactions to linearize updates to the important parts of our system. This means all our components can be relatively stateless and provide no guaruntees about how time works: we just let the database decide. If we remove the central database, then we need to have another way to control time.

#### Actors

When building Wunderlist’s real-time backend we used actors to wrap each websocket connection. They are a great abstraction to contain state and linearize access to that state.

{{<fig src="1-5HvA-QDfOWgDYSHmewejFA.jpeg" alt="Photo of a girl with a fire extinguisher">}}
Acting like a Firefighter [https://flic.kr/p/dnt7vz](https://flic.kr/p/dnt7vz)
{{</fig>}}

#### Elixir processes

Processess are also a great way to linearize access to state. **What if every user had their own process?**

Elixir processes are addressable, even across machines, by a `pid`. To trust a process as the authority for the state of a user we need to know there will only ever be one process for that user. _If we were to accidentally have two “myobie” processes, then we have a split brain._

#### **:global**

Erlang ships with a `:global` process registry which is shared across all connected nodes. However, we cannot rely on it to be constistent. You may be thinking _are you sure?_

> If any name clashes are discovered, function Resolve is called.  
> <cite>[_http://erlang.org/doc/man/global.html_](http://erlang.org/doc/man/global.html)</cite>

There are three words that jump out at me from that quote: clashes, discovered, and Resolve. It’s reasonable to assume that if it weren’t possible to have duplicates, then there would be no need to have a Resolve function.

😐

#### **:pg2**

A popular erlang library is “process groups 2.” This library does not attempt to provide a consistent view of the cluster’s processes. _Are you sure?_

> pg2 replicates all name lookup information in a way that doesn’t require consistency …  
> <cite>[_http://erlang.org/pipermail/erlang-questions/2012-June/067220.html_](http://erlang.org/pipermail/erlang-questions/2012-June/067220.html)</cite>

This could be very useful for different types of applications where doing something twice wouldn’t hurt (like [phoenix pubsub](https://github.com/phoenixframework/phoenix_pubsub/blob/master/lib/phoenix/pubsub/pg2.ex)), but for my use case I really need to **know** there are zero or one of something at all times.

😐

#### :grpoc

Same. _Are you sure?_

> While gproc has been tested very thoroughly … its reliance on gen\_leader is problematic.  
> <cite>[_https://christophermeiklejohn.com/erlang/2013/06/05/erlang-gproc-failure-semantics.html_](https://christophermeiklejohn.com/erlang/2013/06/05/erlang-gproc-failure-semantics.html)</cite>

Are there problems with `gen_leader`? I don’t know. I’ve read multiple articles saying something negative about `gen_leader`, but I’ve never understood why. I intend to use `gen_leader` sometime in a project and try to get more familiar with it. I don’t want to jump into that today.

😐

#### Elixir.Registry

Elixir ships with a `Registry` as of version 1.4. We are saved!

This registry is local to a single VM and it is consistent. It’s backed by ETS so it’s super fast. It’s _easy_ to be consistent on one machine. 😏

What happens if that one VM stops? Our entire registry disappears and we cannot get any work done until it comes back. 😐 This could be fine if we didn’t mind the downtime, but I kinda do mind.

How do we make 100% certain we never accidentally boot two vms? It may sound like an easy problem, but I’ll tell you it’s not. At Wunderlist we have an email related thing that we can only run one of, but I know we’ve accidentally run two before.

☹

#### Zookeeper

What are we to do? **Let’s outsource the problem to someone else.**

Zookeper is consistent, pretty available, and partition tolerant. And, more importantly, **it includes recipes**. Yes, it has instructions for common use cases including in it’s official documentation!

➡️ [**ZooKeeper Recipes and Solutions** ](https://zookeeper.apache.org/doc/current/recipes.html "https://zookeeper.apache.org/doc/current/recipes.html")

And one recipe is super interesting: **distributed locks.** 🔑

{{<fig src="1-ZdZGgshjhJcdEGlx4P8l6Q.png" alt="Photo of DJ Khalid">}}
“Distributed locks are a major key.” [_https://www.flickr.com/photos/88009602@N05/8696887207_](https://www.flickr.com/photos/
{{</fig>}}

Zookeeper is a battle tested system for getting time under control. We can know if one thing happens before another. That is really helpful.

#### Highlander

{{<fig src="1-VRS7aSZ-QPVkWUE7hzrcLg.png" alt="Photo of the main character from the TV show Highlander">}}
Duncan MacLeod of the clan MacLeod.
{{</fig>}}

I have created a library named after a 90’s TV show.

[_https://github.com/myobie/highlander_](https://github.com/myobie/highlander)

> There can be only one.

It has a concept of “object” which are simple `GenServer`s with some extra abilities:

*   Objects persist their state to S3 during a state update
*   Objects read their state from S3 during `init`
*   Objects respond to calls directly from their in-memory state
*   Objects teardown after some period of inactivity

Highlander also includes a process registry which stores it’s information in Zookeper. Every process has a key named after it’s id and it’s value is the node name it’s running on. This means we can lookup where any process is running and send it messages from any node in the cluster.

#### GenServer :via

There is this `:via` concept with GenServers: they can have a fancy name that is a tuple instead of just an atom.

```elixir
GenServer.call(
  {:via, MyRegistry, {:user, user_id}},
  :do_stuff
)
```

What does a process registry look like in elixir? It implements four methods:

```elixir
defmodule MyRegistry do
  def send(name, message) do
  end
  
  def whereis_name(name) do
  end
  
  def register_name(name) do
  end
  
  def unregister_name(name) do
  end
end
```

How do we find a process through zookeeper?

```elixir
defmodule MyRegistry do
  def whereis_name(name) do
    case ZK.get_node_name(name) do
      # ...
    end
  end
end
```

_Simply query zookeeper for the key (node) with the same name as the process. It’s value will be the node name. From there we can construct a pid._

Registering a new process is similar:

```elixir
defmodule MyRegistry do
  def register_name(name) do
    case ZK.create_znode(name) do
      # ...
    end
  end
end
```

_Registering means trying to create a key (node) with the same name as the process._

In my `ZK` module’s `create_znode` if we are not the first to create the new key in zookeeper, then it will fail accordingly:

```elixir
defmodule ZK do
  def create_znode(name) do
    {:ok, pid} = ZNode.start_link(name)

    if ZNode.first?(pid) do
      {:ok, pid}
    else
      :ok = ZNode.delete(pid)
      {:error, :already_exists}
    end
  end
end
```

How do we know we were first? Zookeeper’s distributed lock recipe shows how to determine that. Here is how it’s implemented in Highlander:

```elixir
defmodule ZNode do
  def init(name) do
    {:ok, path} = 
      Zookeeper.Client.create(:zk,
        prefix(name, UUID.uuid4(:hex)), 
        to_string(Node.self),
        makepath: true, 
        create_mode: :ephemeral_sequential)
    {:ok, %{path: path, name: name}}
  end
end
```

**The most important part of this code snippet is** `**ephemeral_sequential**`**.** It is “ephemeral” so it’s temporary and if we drop our connection to zookeeper all the keys we created will be auto-deleted. It’s “sequential” so that zookeeper will append a number to the keyname we provided (the return value of `prefix/2`).

**Zookeeper keeps time in order.** It’s very good and forming consensus around sequential numbers. So instead of asking everyone in it’s cluster “is this key already taken” it gets agreement on the next number, you create that key, then you look back at all keys that start with the same “prefix” and if you were the lowest number then you must have been first.

Because of the “ephemeral” flag, we need to make sure that if we drop our zookeeper connection that we also `exit` any highlander processes that we had booted — since their keys are no longer set in zookeeper at that point. We can do this with a supervision tree:

```elixir

opts = [host, 
  [stop_on_disconnect: true, name: :zk]]

children = [
  worker(Zookeeper.Client, opts, []),
  worker(Registry.Server, [], []),
  worker(Registry.NodeCycleServer, [], []),
  supervisor(Object.Supervisor, [], [])
]

supervise children, strategy: :rest_for_one
```

The `:rest_for_one` strategy means that if any child dies, then all children declared after it in the array will be `exit`'ed. So we simply put `Zookeeper.Client` first there. That process will exit if it loses it’s connection because above we set `stop_on_disconnect` to `true`. It exiting will cause the registry server, my “node cycle server”, and all objects being supervised to also exit. Once zookeeper reconnects then the registry and object supervisor will restart and we are back in business.

### Developer UX

Highlander “objects” are `GenServer`s with some extra functions. Instead of having to build the same `GenServer`s over and over again, I also created some macros to help with that. An example of making a “todo” object to contain a simple task:

```elixir
defmodule Todo do
  use Highlander.Object, type: :todo

  defobject title: "", completed: false, color: :blue
end
```

`defobject` really just calls `defstruct` behind the scenes and setups up seriliazation for when the todo’s state is persisted to S3. Yes, with this “object,” every todo will be it’s own process and it’s state will be serialized to S3. Here is an example of how to use it:

```elixir
id = UUID.uuid4()

{:ok, todo} = Todo.get id

assert todo.completed == false
assert todo.title == ""
assert todo.color == :blue

todo = %{todo | title: "Hello"}

{:ok, _} = Todo.put id, todo

# any amount of time later

{:ok, todo} = Todo.get id

assert todo.title == "Hello"
```

#### Model everything as a process

With this approach we can model everything in our system as it’s own process. That makes it super easy to serialize access to state, persist it to S3 as necessary, and our system becomes a reflection of the active “objects” currently collaborating.

```elixir

defmodule User do
  use Highlander.Object, type: :user

  defobject name: "", email: ""
end
```

_An example user module._

#### Model all shared objects as their own process

After every user has a process with state, it is tempting to nest everything under the user who created it. For a lot of data this makes perfect sense. But objects which are collaborated on by multiple users needs to be separated out, given it’s own state, and possibly protected with some sort of permissions.

An example might be a shared list, where any user with permission can manage a list of todos:

```elixir
defmodule List do
  use Highlander.Object, type: :list

  defobject title: "", todos: []
end

defmodule Todo do
  defstruct title: "", completed: false, color: :blue
end
```

To manage permission, the `User` probably needs to know which lists it has seen before. And the `List` could keep an array of allowed users. See below:

```elixir
defmodule User do
  use Highlander.Object, type: :user

  defobject name: "", email: "", known_lists: []
end

defmodule List do
  use Highlander.Object, type: :list

  defobject title: "", todos: [], allowed_users: []
    
  def handle_update({:insert_todo, list, todo, user}, state) do
    if Enum.any?(list.allowed_users,
      fn id -> id == user.id end) do
        %{todos: [todo | state.todos]}
    end
  end
end
```

So each list is a concurrent object in the system. If one list because super busy with updates, it wouldn’t slow down any other list’s access or anything like that. The `handle_update` above doesn’t actually work yet: I haven’t decided on the syntax for handling state updates yet. **Do you have opinions or ideas?** Let me know.

### An aside: Multi-VM testing

When building highlander I needed to boot multiple erlang nodes to be able to test cross-node calls and stuff like that. That wasn’t entirely easy or straight forward. It turns out [Phoenix does this](https://github.com/phoenixframework/phoenix_pubsub/tree/master/test/support) to test it’s websockets stuff, so I just copied a lot of that code.

The most interesting bits are:

```elixir
# how to boot a new VM process
def spawn do
  :net_kernel.start([:"primary@127.0.0.1"])
  :erl_boot_server.start([])
  allow_boot to_char_list("127.0.0.1")

  Application.get_env(:highlander,
    :spawn_nodes, [])
  |> Enum.map(&Task.async(fn ->
    {:ok, _node} = spawn_node(&1) 
  end))
  |> Enum.map(&Task.await(&1, 30_000))
end

# how to start a `:slave` and then send it the code to load
defp spawn_node(node_host) do
  {:ok, node} = :slave.start(
    to_char_list("127.0.0.1"), 
    node_name(node_host), 
    inet_loader_args())

  add_code_paths(node)
  transfer_configuration(node)
  ensure_applications_started(node)
  {:ok, node}
end
```

You can see all of it in the [highlander repo’s test folder](https://github.com/myobie/highlander/tree/master/test/support).

{{<fig src="1-FbxEeSZG0ulVSr0BYUBYYQ.png" alt="The skeleton surfing again, but zoomed in">}}
That was fun!
{{</fig>}}

### Scaling

**Granular = scalable.** Having all these small processes is a lot like “pouring sand” into our cluster.

H**ow many locks can a small zookeeper cluster handle?** I don’t know.

If it became a problem one could shard zookeeper. Or one could do what other libraries do and not store a zookeeper key for every process, but instead setup a partition map in zookeeper and use that to shard processes onto the box they map to. Then there would only be a key for every erlang VM and not for every erlang process.

#### Orleans

That is what [orleans](https://github.com/dotnet/orleans) does: setup a partition map in zookeeper. Orleans is what the Halo team used to scale Halo 4 and 5. As far as I know every player, game, etc is a process in the cluster and they collaborate with message passing.

There is also Microsoft Service Fabric which is a lot like Orleans, but tries to help with building stateful and stateless services more than actors. It also uses zookeeper to setup a partition map for it’s services. It also persists the services state across the cluster when that state is updated.

#### [Akka](http://akka.io)

Sure. That’s a good choice. I am not really doing any scala right now and I’m a bit scala’ed out for the moment. As I said before, Wunderlist’s websockets servers are all in scala (using [play](https://playframework.com)) and it’s very reliable and performant. Love it. It’s good. Use it.

#### riak_core

Sure, you could use the riak internals to do your own consensus, but I haven’t yet drank enough coffee in my life to start down that road. Maybe I will one day, and if you are interested then definitely go for it, but I am not able to think about that without having a lot of anxiety. 🤷‍♂️ 🌳 🤷‍♀️

And that’s it. Hope you maybe learned something.

**Have fun. Have crazy ideas. Build things.** 🏁