+++
title = "Why make a Mash?"
date = "2014-12-19T07:45:09.600Z"
svbtleUrl = "https://myobie.svbtle.com/why-make-a-mash"
+++

## [Hashie](https://github.com/intridea/hashie) is fine

Recently, Richard Schneeman wrote a very good article titled [Hashie Considered Harmful - An Ode to Hash and OpenStruct](http://www.schneems.com/2014/12/15/hashie-considered-harmful.html). Give it a read, there is some wisdom there. However, I have a bit of a different take on this issue. I’ve also had this as a draft in Svbtle for way too long.

First, let’s get this straight: if `OpenStruct` is useful then `Hashie::Mash` is useful too. And `OpenStruct` **is** really useful. Also, don’t let anyone tell you “you don’t need a hash-like object that responds to methods” because you very well might need it. Always contrast your goals and the implementation  of a library to make sure it’s as simple as it could be.

Second, don’t take advice about what to use from people who can’t explain the pain or joy around it. It’s like someone who says to use postgres instead of mysql, but has no clear reason to prefer anything. What is the real pain here? What is the real benefit? What circumstances were there?

To be clear, Richard explains that misspellings, insensitive access to hash-like object keys, and increased memory usage can cause issues, and he is correct. However, from certain perspectives, the tools shouldn’t try to help with misspellings at all: Javascript objects don’t raise on missing keys. Memory usage is relative to each application and my libs are not generally my problem, so we differ here too.

I will try to detail why I always tell people to use what they want, but they probably don’t need `Hashie` anyway.

## Why not to use `Hashie`

There is one very good reason not to use `Hashie::Mash` at all that I don’t see explained very often: `#zip`.

```sh
$ gem install hashie
$ irb -rhashie
```

```ruby
address = Hashie::Mash.new(street: "100 Street St", city: "city", zip: 10119)
address.zip # => [[["street", "100 Street St"]], [["city", "city"]], [["zip", 10119]]]
```

It’s honestly that simple. `Mash` inherits from `Hash` which includes `Enumerable` and you have a huge number of keys (175) that have surprising behavior. However, this does not mean `Hashie` is bad or not useful, it’s just how it works and one needs to know that. 

## What to use instead

### Maybe `OpenStruct` is “better”

No, `OpenStruct` is slow. Let’s see some data comparing it to `Hashie`:

```sh
$ gem install benchmark-ips hashie
$ irb -rbenchmark/ips -rhashie -rostruct
```

```ruby
Benchmark.ips do |x|
  x.report("ostruct") { OpenStruct.new(street: "100 Street St").street }
  x.report("hashie") { Hashie::Mash.new(street: "100 Street St").street }
end
```

```txt
Calculating -------------------------------------
             ostruct    12.509k i/100ms
              hashie    23.823k i/100ms
-------------------------------------------------
             ostruct    135.329k (± 7.8%) i/s -    675.486k
              hashie    313.649k (± 5.9%) i/s -      1.572M
```

**`Hashie` is at least twice as fast** for the simple case of building a hash-like object and calling a method on it. This is what my normal usage of these tools looks like, grab some data and call methods on the resulting objects.

### Oh, why would one use “OpenStruct” then?

`OpenStruct` compiles the method into the instance so repeated calls will be fast. Here is what that looks like:

```sh
$ gem install benchmark-ips hashie
$ $ irb -rbenchmark/ips -rhashie -rostruct
```

```ruby
Benchmark.ips do |x|
  x.report("ostruct") {
    o = OpenStruct.new(street: "100 Street St")
    100.times { o.street }
  }
  x.report("hashie") {
    m = Hashie::Mash.new(street: "100 Street St")
    100.times { m.street }
  }
end
```

```txt
Calculating -------------------------------------
             ostruct     4.563k i/100ms
              hashie     1.363k i/100ms
-------------------------------------------------
             ostruct     46.592k (± 3.7%) i/s -    232.713k
              hashie     13.598k (± 4.1%) i/s -     68.150k
```

**`OpenStruct` is over three times faster** for repeated calls to keys. So for long lived objects, `OpenStruct` is way better than `Hashie`. However, there is something **even better** for long lived objects: `Struct`. If your objects are really that long lived you will probably know their schema and you can just make a class (`Struct` is a class factory, so use it) that conforms to that schema. 

### What does this mean?

What it always means: the tools one chooses to use should be tailored to the use case.

I build a lot of apis and those apis all produce and consume JSON which in ruby is best represented as `Hash`’s or `Array`’s of `Hash`’s. However, one of these lines of code is prettier:

```ruby
task_ids = tasks.map(&:id)
task_ids = tasks.map { |task| task[“id”] }
```

There are other examples too where using methods is much preferred from a stylistic point of view. My apis change a lot at first, so dynamically providing the `Hash#keys` as methods allows me to move quicker. It’s possible that eventually I would define a `Struct` for each version of each api later, which is an easy refactor since the tests all still pass because nothing really changes.

If we shouldn’t use `Hashie` and `OpenStruct` is slow, what do we do?

## I made my own Mash

Yeah, I know, NIH and all that. But, as I typed above, evaluate tools on what they are being or will be used for. For my api producing/consuming applications I need hash wrappers that are fast and use very little memory. These wrapped objects are not long lived.

My library is called [`Mashed`](https://github.com/myobie/mashed). It does three things: provides indifferent access in a predictable way, provides a hash wrapper that has a very small method footprint, and represents the internal hash’s keys as methods.

### Indifferent access

Symbols in ruby are kinda annoying. Until 2.2 (due out very soon I guess) they are not garbage collected, so technically you could allow anyone to DDOS your app by making every JSON object into a symbolized hash. (I’ve considered just going down this road and making sure I monitor my app correctly, but I’ve never actually done it.) Luckily this will go away when they are garbage collected and I will even change my implementation when that happens.

But for now, I created the [`StringyHash`](https://github.com/myobie/mashed#stringyhash). It **does not** inherit from `Hash`, but instead wraps and delegates to a hash instance. The [method footprint](https://github.com/myobie/mashed/blob/master/lib/mashed/stringy_hash.rb) is small and it doesn’t extend any built-in ruby classes at all.

The example from the README should explain it all:

```ruby
StringyHash = Mash::StringyHash

sh = StringyHash.new(title: "Hello", starred: false, completed_at: nil)
sh.keys # => ["title", "starred", "completed_at"]
sh[:title] # => "Hello"
sh["title"] # => "Hello"

class Title
  def to_s
    "title"
  end
end

sh[Title.new] # => "Hello"
```

The goal is to be a very sensible delegator to the internal hash instance. I’ve had zero issues so far with this in many production systems. For 2.2 I will make a `SymbolizedHash` class I guess.

### Wrapper with very small method footprint

In ruby, every object has a lot of built-in methods.

```ruby
Object.new.methods.count # => 55
```

Every ruby object has at least 55 methods. If the goal is to provide almost any key that might be set in a `Hash` as a method, that is 55 keys that are impossible to get to. Luckily, ruby allows one to start from a smaller point with `BasicObject`.

```ruby
BasicObject.new.methods.count # =>
# NoMethodError: undefined method `methods' for #<BasicObject:0x007fd454b8fdc8>
```

That’s right, it doesn’t even know what it’s list of methods are. My [`Mash`](https://github.com/myobie/mashed/blob/master/lib/mashed/mash.rb) inherits from `BasicObject` and provides a very small amount of built-in methods. 

```sh
$ gem install mashed
$ irb -rmashed
```

```ruby
Mashed::Mash.new({}).methods.count # => 26
```

I’m always trying to get that number lower as well. Please, if you ever have ideas for how to do that then make a [PR](https://github.com/myobie/mashed/pulls) or [Issue](https://github.com/myobie/mashed/issues).

### Delegate methods to key/value lookups

Now, how does `Mash` fare in the `#zip` example:

```sh
$ gem install mashed
$ irb -rmashed
```

```ruby
address = Mashed::Mash.new(street: "100 Street St", city: "city", zip: 10119)
address.zip # => 10119
```

It works in an unsurprising manner. The “secret” to `Mash` being a good citizen is for it not to be hash-like at all.

Examples:

```ruby
address["zip"] # =>
# NoMethodError: private method `[]' called for #<Mashed::Mash:0x007fb501049cd8>

address.merge(state: "VA") # =>
# NoMethodError: undefined method `merge' for #<Mashed::Mash:0x007fb501049cd8>

address.map { |k,v| puts "#{k}: #{v}" } # =>
# NoMethodError: undefined method `map' for #<Mashed::Mash:0x007fb501049cd8>

address.inspect # => "#<Mashed::Mash @hash=>{\"street\"=>\"100 Street St\", \"city\"=>\"city\", \"zip\"=>10119}>"
```

**It just refused to appear to be a `Hash`.**

There are still problems, one of which is [an issue right now](https://github.com/myobie/mashed/issues/4): single method calls with zero arguments return `nil` if the key is missing. This is inevitable based on the current design constraints: `Mash` acts like a Javascript `Object` where missing keys are `undefined`.

I find this unsurprising since accessing a missing key on a `Hash` returns `nil`. However, I am considering making a monad or something to possibly make it easier to understand.

## Why is `Hashie` not like `Mashed`?

Because it’s a different tool. `Hashie` is actually a great library and everyone should not only try to use it at least once, but read through it’s code. You can learn a ton by seeing how other’s have solved similar problems.

`OpenStruct` is awesome too. If you’re making a ruby script and you want to have no dependencies outside the standard library then use it; this happens to me when I’m working on build or deployment scripts.

## Use what works for you’re current situation

Write tests, evaluate libraries based on their implementation and api, and don’t listen to anyone including me (: