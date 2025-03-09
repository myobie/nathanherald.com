+++
title = "The Network Is Never There for You"
date = "2016-02-26T12:33:36.898Z"
mediumUrl = "https://medium.com/@myobie/the-network-is-never-there-for-you-950db56be2a4"
aliases = [
  "/writing/legacy/the-network-is-never-there-for-you/"
]
+++

_This started as documention for some of the things that are hard about building a distributed system like Wunderlist. The goal is to clarify some assumptions about distributed systems and come up with possible solutions. Mostly: how can one persist data to a database while also notifying others of those changes in a reliable way. Real-time™ is hard._

_Also, there is some pseudo code in this post which is basically javascript. Don’t comment on code style. If there are mistakes, then please let me know. But it’s not really javascript, so don’t worry about it._

![A broken road with a sign reading 'computer error'](1-pVZMTMxNNaoFDBdL2N32aA.jpeg)

It’s tempting to imagine that distributed systems are “simple” or “easy.” I’d like to describe a simple system and go through a few issues that turn out to be a bear. The goal here is to force to the front some basic assumptions one should have when building a distributed system:

*   Adjacent lines of code do not represent an atomic unit of work
*   When network calls fail, it’s impossible to know what happened
*   Transactions and mutexes are only useful inside one process on one computer

The simple system I want to build is this:

A database ([postgres](http://www.postgresql.org)) will hold a value. The value can be updated atomically and the rest of the system wants to be notified about the change in a reliable way. Every change should be queued up so some other part of the system can read and process each one, possibly sending it to other parts of the system like a phone or something. These phones want to know about changes as fast as possible!

This is actually a very complicated problem, so let’s size it down some at first: instead of notifying the system of every change, let’s just publish the latest value to [redis](http://redis.io). A phone can poll frequently for the new value from redis. And let’s just increment a counter in the database. Much simpler.

The value in redis should never be different from the value in the database. (Which is impossible, but still let’s walk through it and see. Also, if you disagree that it’s impossible, then please keep reading and don’t build anything until you’re done :)

There are a lot of ways to increment a counter in postgres. The best ways are to either use a sequence (a built in feature of the database) or to issue a SQL statement similar to:

```
UPDATE counters SET value = value + 1 where counter\_id = 1
```

Let’s assume we have a function updateCounter which performs that SQL and then a function `updateRedis` which does a

```
SET counter:last 2
```

where 2 is the return value from `updateCounter`.

So our code is now:

```
function receiveConnection() {  
    let latest = updateCounter()  
    updateRedis(latest)  
}
```

And this falls down in every way. Let’s go through the problems one by one.

#### Adjacent Lines of Code Are Not Atomic

In our simple two line function, it’s entirely possible that `updateRedis` never gets called. Here is an ASCII diagram of the places this function can fail:

```
function receiveConnection() {  
--->  
--->let latest = updateCounter()  
--->  
--->updateRedis(latest)  
--->  
}
```

While it’s easy to predict where execution of this program starts, it’s impossible to predict where it will end. A simple reason is your process could be killed at any moment. But there are other reasons: memory starvation, hardware failure, CPU load is too high, etc. It’s also impossible to predict how much time this program will spend at any one of the five marked points. There could be slow GC, scheduling issues, CPU load again, etc.

The time it takes to get from updateCounter to `updateRedis` is indeterminate and so our system is inconsistent for an indeterminate amount of time: it’s possible to read a value from redis that is old.

It’s also possible that updateCounter succeeds, but `updateRedis` fails or the program never even makes it that far.

This simple program doesn’t solve our problem and isn’t a very good component in a distributed system.

So let’s add some error checking:

```
function receiveConnection() {  
    var latest

    try {  
        latest = updateCounter()  
    } catch {  
        latest = rollbackCounter()  
    } finally {  
        try {  
            updateRedis(latest)  
        } catch {  
            rollbackCounter()  
        }  
    }  
}
```

This might at first seem great, but it’s actually worse. The `updateRedis` call could succeed and yet appear to fail, so we would rollback the counter. Now the value in redis is greater than the value in the database.

It’s just a futile effort to try to add enough error checking for a simple reason: the errors are mostly meaningless.

#### When Networks Fail, It’s Impossible to Know Why

Network timeouts, writing to the socket failure, reading from the socket failure, packet loss, and any other number of things are the types of failures where the caller has no idea what the callee did. Without a response to inspect we are stuck with Schrödinger’s request. The callee might have succeeded, but the network between the caller might have had a blip.

No amount of rescuing or catching errors can fix this issue. The only real way to take care of this is to make the program (and the request to trigger it) idempotent. Either the program needs to operate in a truly atomic way or it needs to not matter if any one part fails.

We are basically screwed now with what we have. Since the increment is not directly tied to the redis call, this function is not idempotent. Let’s try to make it work that way.

One rule we could add is that the caller needs to let us know what its current view of the world is (the current counter’s value) so we can make sure it’s up to date. If you are not up to date, then you don’t get to make changes. It’s a simple rule, but I find it helps a ton in a lot of cases. I also stole this idea from couchdb.

Our code can now look like:

```
function receiveConnection(remoteValue) {  
    var latest  
    let current = getCounter()  
    if (current == remoteValue) {  
        latest = updateCounter()  
        updateRedis(latest)  
    }  
    return latest  
}
```

Of course, we will have the issue with network failures hiding successful sets from us. This method is not fully idempotent, it just won’t increment the value twice until the caller is updated. But it does only update the counter once per remoteValue instead of over and over again. It would be nice to try to rollback the increment if something goes wrong:

```
function receiveConnection(db, remoteValue) {  
    try {  
        var latest  
        let current = getCounter()  
        if (current == remoteValue) {  
            db.startTransaction()  
            latest = updateCounter()  
            updateRedis(latest)  
            db.commitTransaction()  
        }  
        return latest  
    } catch {  
        db.rollbackTransaction()  
        throw("crap")  
    }  
}
```

So now if the `updateRedis` call throws we can be sure the database value is rolled back. This is a repeatable function since it only works once and is a noop if called again. This seems great.

But, we know that network errors can be false negatives — the call to redis could succeed even if we get an error, the value in redis is then a higher number than the value in the database again. Redis and the database would be out of sync.

And we have another problem. Let me illustrate it with another amazing ASCII diagram:

```
function receiveConnection(db, remoteValue) {  
    try {  
        var latest  
        let current = getCounter()  
        if (current == remoteValue) {  
            db.startTransaction()  
            latest = updateCounter()  
            updateRedis(latest)  
        --->  
            db.commitTransaction() // assume this throws if it fails  
        }  
        return latest  
    } catch(e) {  
        db.rollbackTransaction()  
        throw(e)  
    }  
}
```

There are two things that are wrong at the marked point:

1. It’s impossible to know how long it takes to jump over this point in the program: from updating redis to committing the transaction. It’s also impossible to know how long it will take to fully commit the transaction. So there is some amount of time between updating redis and the transaction committing that we read a value from redis from the future. Until the transaction commits, only this caller with this transaction can read the correct value from both places. **We can’t be consistent even with great error handling.**
2. The program can terminate at this point. It’s possible that updateRedis fully succeeds and receives a response, but the program is terminated and the transaction is never committed. The database would eventually notice this and rollback the changes. No one except this caller would have ever seen the new value in the database, yet the new value would be present in redis. There is no way to be 100% sure our process will never die at this point.

So it seems impossible to reliable do anything across more than one computer.

#### Transactions and Mutexes Are Only Useful Inside One Process on One Computer

Transactions work for postgres because it’s a single process on a single machine. It’s able to use mutexes and global transaction ids to prevent concurrent updates of rows while also knowing what order to apply changes. The postgres team has done a lot of work over the years to make sure things work how they should. Sure, there are [options for systems that can synchronously commit a transaction across multiple machines](http://www.postgresql.org/docs/devel/static/runtime-config-wal.html#GUC-SYNCHRONOUS-COMMIT), but these are daunting solutions with heavy prices to pay in performance and operating costs. And [it’s difficult to get right](http://michael.otacoo.com/postgresql-2/track-commit-synchronous/).

Once the distance between things is more than inside a single computer (or virtual computer) things get hinky. It’s no longer possible to reliably protect against concurrent actions. And since network errors sometimes make it impossible to infer what happened on the other side: it just isn’t possible to reliably commit or rollback something.

Even with more error handling, more rollbacks, more verification, it’s basically impossible to build this system with the given constraints in a simple way.

With this example, we are really just caching the current value in redis. This could also be done with a simple read-through cache. In the middle of the database transaction one can clear the cache and then the next time a read comes in it will repopulate. Here is a code example:

```
function getValue(cache, db) {  
    let cachedValue = cache.get()

    if (cachedValue !=== null) { return cachedValue }

    let currentValue = db.get()  
    cache.set(currentValue)  
    return currentValue  
}
```

This works all right: if the value is missing we just set it and return it. There is a strange thing that can happen, where if [multiple concurrent `getValues` are run there might be multiple processes trying to `cache.set` at the same time](https://en.wikipedia.org/wiki/Cache_stampede). This is odd, but it’s not that big of a deal. This is a problem with all read-through caches — when the cache is missing all the running processes might all try to update it.

What does the setValue look like in this case? (Here we are also making sure [to lock the value for updating while reading it](http://www.postgresql.org/docs/9.0/static/sql-select.html#SQL-FOR-UPDATE-SHARE), so we know we have the truly latest value and it can’t change by anyone else during this transaction.)

```
function setValue(cache, db, currentValue) {  
    try {  
        db.startTransaction()  
        let current = db.selectAndLockForUpdate()  
        if (current != currentValue) {  
            throw("crap")  
        }  
        db.incrementValue()  
        cache.clear()  
        db.commitTransaction()  
    } catch {  
        db.rollbackTransaction()  
    }  
}
```

This is looking pretty good, but another ASCII diagram is in order:

```
function setValue(cache, db, currentValue) {  
    try {  
        db.startTransaction()  
        let current = db.selectAndLockForUpdate()  
        if (current != currentValue) {  
            db.cancelTransaction()  
            throw("crap")  
        }  
        db.incrementValue()  
        cache.clear()  
    --->  
        db.commitTransaction()  
    } catch {  
        db.rollbackTransaction()  
    }  
}
```

How long does the program stay at the marked point in the code? The answer is: **there is no way to know**.

We clear the cache, but then we don’t know how long it will take to actually commit the transaction. If a read were to come in to a different process during that window of time, the old value would be cached in getValue— since no one else can read the new value until this transaction is committed.

We can change the code to this:

```
function setValue(cache, db, currentValue) {  
    try {  
        db.startTransaction()  
        let current = db.selectAndLockForUpdate()  
        if (current != currentValue) {  
            throw("crap")  
        }  
        db.incrementValue()  
        db.commitTransaction()  
        cache.clear()  
    } catch {  
        db.rollbackTransaction()  
    }  
}
```

And now we have the old problem: there is a time window where a new value is committed to the database, but not present in the cache. There also is the possibility that the database transaction completes successfully, but the `cache.clear()` line is never run or has a network failure. It’s also possible that the committing of the transaction only appears to fail (yet another network failure) and we don’t know what to do. Maybe we should just clear the cache everywhere.

I’ve seen things like this before:

```
function setValue(cache, db, currentValue) {  
    try {  
        db.startTransaction()  
        let current = db.selectAndLockForUpdate()  
        if (current != currentValue) {  
            throw("crap")  
        }  
        db.incrementValue()  
        cache.clear()  
        try {  
            db.commitTransaction()  
        } finally {  
            cache.clear()  
        }  
    } catch {  
        db.rollbackTransaction()  
    }  
}
```

This has all the same issues. It’s possible a too early `getValue` makes the first clearing of the cache useless and it’s possible the cache never gets cleared after the transaction finishes. It’s also pretty ugly.

We could change the type of transaction we are using to block all access to the row until we are done with it. This means no one can read the row until we either commit or rollback our transaction. Since every getValue would freeze at the point where the query happens until we are done updating the database, they would have the best current value. Or so it would seem.

A possible order of events is (assume the cache is currently empty, process A is about to execute getValue, and process B is about to execute setValue):

1.  Process A begins and retrieves the current value successfully from the database (value in memory is 3)
2.  Process B fully begins and completes running setValue, updates the database row (value in the database is 4), and clears the cache (a noop, it’s currently empty)
3.  Process A proceeds to set the cache to it’s current in memory value (cache is now at 3)

So now the read-through cache set the value to 3 even though the last successful database query updated it to 4. Great.

How often will this happen? That depends on scale, network topology, and a whole host of things that are probably out of your control. If they are within your control then good for you. But most of us can’t control time. Unless you’re google. Then you can. (I mean seriously, [google found a way to synchronize clocks](http://thetechjournal.com/tech-news/google-uses-atomic-clocks-to-synchronize-its-global-spanner-database.xhtml) so anything is “possible.”)

Now, most people would call this good enough. And at small scale, this is probably good to go. The likelihood of edge cases might be low. But it turns out at even at moderate scale things happen.

How important is it for your application that your data is consistent? If it can be stale for some period of time then you are fine to just set a TTL on the caches and call it done.

Don’t people use caching all the time? What can we do? Can we build a truly reliable system?

Let’s keep going and find out. (Also search for [russian doll caching](https://signalvnoise.com/posts/3113-how-key-based-cache-expiration-works) if you want to have a reliable read-through cache.)

What about the original idea?

> A database that supports transactions will hold a value. The value is updated atomically and the rest of the system wants to be notified about the change in a reliable way.

This sounds like we should just:

```
function receiveConnection(db, currentValue, newValue) {  
    try {  
        db.startTransaction()  
        let current = db.selectAndLockForUpdate()  
        if (current == currentValue) {  
            updateValue(newValue)  
            publishChange(currentValue, newValue)  
            db.commitTransaction()  
        } else {  
            db.rollbackTransaction()  
        }  
    } catch {  
        db.rollbackTransaction()  
    }  
}
```

But this has all the problems discussed above. The worse case for this function is we could publish a value that never gets committed: a value from an alternate future, where it almost made it as the newest version of the value.

If we move things around, it just changes the worst case scenario:

```
function receiveConnection(db, currentValue, newValue) {  
    try {  
        db.startTransaction()  
        let current = db.selectAndLockForUpdate()  
        if (current == currentValue) {  
            updateValue(newValue)  
            db.commitTransaction()  
            publishChange(currentValue, newValue)  
        } else {  
            db.rollbackTransaction()  
        }  
    } catch {  
        db.rollbackTransaction()  
    }  
}
```

Now we might commit something to the database that never gets published. While it’s very unlikely that the process will crash right before trying to publish the change: publishing is a network call. It will fail. And it will fail often.

Even if one got really paranoid and tried to revert upon a publishing fail:

```
function receiveConnection(db, originalValue, newValue) {  
    try {  
        db.startTransaction()  
        let current = db.selectAndLockForUpdate()  
        if (current == originalValue) {  
            updateValue(newValue)  
            db.commitTransaction() // assume this throws if it fails  
            try {  
                publishChange(originalValue, newValue)  
            } catch {  
                db.updateValue(originalValue) // revert  
            }  
        } else {  
            db.rollbackTransaction()  
        }  
    } catch {  
        db.rollbackTransaction()  
    }  
}
```

This is now even worse. We don’t know the timing between the publishing failure and the revert, so it’s possible that another process just finished updating the value again and we would revert that update (we are outside the row-lock at this point). Trying to plug holes like this is an endless game and doesn’t end well.

How can we make it possible to be sure that every published change is also committed? And that every committed change is also published?

We need to:

* Make this truly idempotent
* Make sure to retry after any type of failure
* Make it possible to know if it fully succeeded

### OK, Make Things Reliable Please

The first thing one should consider is “does this really need to be reliable”? What if once a month one screen might show slightly out of date information? Is that acceptable? Maybe it is. Maybe if it saves hundreds of thousands or millions of dollars then it’s fine. It might even be possible to be aware of when that happens, give that customer a coupon for a month of free service, and just move on.

However, if things must be reliable and consistent, then there is only one thing you can do: **plan for failure.**

The rest of this is going to be about how to plan for things to suck.

#### Consistency

The easiest (and usually only) way to have consistency in a system is to localize something down to one processor on one computer. This is the basic idea behind sharding, single-threaded-ness (redis), and even actors in something like Akka or Service Fabric.

If we can get things down to that level, then things will work out. This is one way to plan for failure: to make sure that when things fail they are localized to one process so we know we can rollback its changes.

#### Use the Database

The easiest way to protect against network failure is to not hit the network. Instead of trying to notify every one of every change right when it happens, maybe we just try to store the changes where we are. Periodically we can just send whatever changes are stored to everyone. This isn’t “real-time” per-se, but maybe that’s all right.

Since we are already using a database transaction in our pseudo code, we could just do more work there.

```
function receiveConnection(db, currentValue, newValue) {  
    try {  
        db.startTransaction()  
        let current = db.selectAndLockForUpdate()  
        if (current == currentValue) {  
            db.updateValue(newValue)  
            db.recordChange(currentValue, newValue)  
            db.commitTransaction()  
        } else {  
            db.rollbackTransaction()  
        }  
    } catch {  
        db.rollbackTransaction()  
    }  
}
```

With this code we now know the value update and the change record will either both succeed or both fail. This is now idempotent.

This could put a lot more strain on the database and possibly create scaling issues, but it does fix our consistency problem. Except it doesn’t actually notify others of changes. For that, we now need another process to regularly check for changes to send:

```
function checkForChanges(db) {  
    db.forEachChange(change => publishChange(change))  
}
```

One thing that could happen now is notifying everyone could fail, so it’s best if the fetchChanges works kinda like:

```
function forEachChange(cb) {  
    let changes = db.allChanges()  
    for change in changes {  
        try {  
            db.lockChange(change.id)  
            cb(change)  
            db.deleteAndUnlockChange(change.id)  
        } catch {  
            db.unlockChange(change.id)  
        }  
    }  
}
```

This way if anything fails, then the whole process will just start over. A change is only deleted when we know it’s been sent to everyone successfully. Of course this could be made much better in a lot of ways, but this is the minimum to get it working.

This leads to a scenario where it’s possible a notification appears to have failed, but succeeded–since notifying everyone is a network call. If this happens, the process will the start over and the same change will be sent a second time. **It turns out this is fine, because this was already possible.**

When dealing with sending asynchronous messages (using a message queue or something) one has to choose between at-least-once delivery or at-most-once. There really aren’t other options (unless you can control time or something like that).

At-most-once isn’t acceptable for us, because that means a notification is delivered 0 or 1 times. We wanted to **reliably** send notifications to all connected clients. So we would have to choose at-least-once. And at-least-once means 1 or more (so 2 or 3 or 1,000 times).

So our app would already have to be ok with duplicates. We now have two ways duplicates could happen:

1. `publishChange` falsely appears to have failed, and we retry
2. Our message bus has some network issues and delivers a message twice

This is all right. We’ll have to deal with duplicate messages if we are sending messages over a network. It’s just another type of failure we plan for. (Putting a UUID on every message or something like that means we could match up ones we’ve already received; it’s a pretty “easy” problem to take care of.)

So, now we have a reliable way to notify everyone of every change to the value in the database. We can setup cron or have a process with a time run checkForChanges regularly and let it run.

It’s also worth considering some metrics and alerting for how often the `checkForChanges` is run. If it’s not run within a certain time then notifications are not being sent out. It’s worth investing some time in [setting up some monitoring](https://deadmanssnitch.com/).

If we did want things to be more real-time, we could setup a pubsub channel to throw changes down:

```
function receiveConnection(db, currentValue, newValue) {  
    var change

    try {  
        db.startTransaction()  
        let current = db.selectAndLockForUpdate()  
        if (current == currentValue) {  
            db.updateValue(newValue)  
            change = db.recordChange(currentValue, newValue)  
            db.commitTransaction()  
        } else {  
            db.rollbackTransaction()  
        }  
    } catch {  
        db.rollbackTransaction()  
    }  
    tryToPublishChange(change)  
}
```

`tryToPublishChange` can lock the row, try to publish, and then delete the row if successful. If it fails, no worries–there is a process running that will eventually pickup the change and send it on it’s way. Since we lock each change while we try to publish it, there is no way someone else can read or delete it.

Our system has more components, but it’s simpler. We don’t need as much error checking and we managed to just use what we had in front of us. But there is a real problem with databases: at scale, they are usually a bottleneck. Don’t worry about that until it’s a problem.

We are planning for things to fail and we’ve isolated each part to it’s own process on it’s own computer. So each tiny part can be atomic, which is a huge win!

### Write Twice, Then Verify

_If the database is going to be a problem, then we gotta go a different route._ It’s possible we are already maxing out the queries per second we can handle and we don’t want to add even more and longer locks to our write queries.

If that is the case, then we could go down the route of having three things at play:

1. Write to primary storage
2. Write the change notification to a secondary storage place
3. Periodically (hopefully very often or immediately) take a change, verify the update is in-fact in primary storage, then publish it

This could look something like what we’ve seen before:

```
function receiveConnection(db, currentValue, newValue) {  
    try {  
        db.startTransaction()  
        let current = db.selectAndLockForUpdate()  
        if (current == currentValue) {  
            db.updateValue(newValue)  
            saveChange(currentValue, newValue)  
            db.commitTransaction()  
        } else {  
            db.rollbackTransaction()  
        }  
    } catch {  
        db.rollbackTransaction()  
    }  
}
```

We already know that it’s possible for us to save a change that doesn’t actually get committed: our program could fail after `saveChange` and before or during `commitTransaction`. But the third process that regularly (or constantly) checks each change to make sure that the database reflects the potential truth means we can discard changes that didn’t actually get written.

It’s actually a little more complicated than that. If the external change processor is slow, it’s possible changes pile up. And with our current schema of just storing a value we could accept two writes to the value before the first change is processed. At that point we have no way of knowing if the first change really was persisted–we only know that it’s not the current value in the database.

We could fix this by keeping a history somewhere, by adding some sort of clock or UUID to each change, or by just accepting that overwritten changes don’t need to be sent out as notifications. Append-only storage might be a very good option for this. Maybe we don’t care if phones get all the in-between changes, we only care that they get the final good one. If that’s the case then when things calm down and changes are processed, then everyone will find out about it.

This is a much more complicated system. It involves even more components, but it also spreads the work out which might be important if our primary database is not having the best time.

We are planning for some of the writes to fail and have processes in place to take that into account. There are tradeoffs, for sure, but it _will work–_for some definition of work.

### Just Make Everything Async

And finally, as a third (and possibly way overboard) idea: just change the entire application and it’s API.

Maybe what you want is a way to submit changes, perform them one by one, and only move on to the next one when you know the first has succeeded.

Our API could become a simple ordered list of operations, each wanting to change the value. We could have a function like:

```
function performOperation(q, db, newValue) {  
    try {  
        let current = db.getValue()  
        db.setValue(newValue)  
        publishChange(current, newValue)  
        q.markCurrentOperationComplete()  
    } catch {  
        db.rollbackTransaction()  
        q.retryCurrentOperation()  
    }  
}
```

This is a very simple system which needs a rule: in the event of any failure in an operation, retry the whole thing. This means it’s possible that if the publishChange function were constantly erring we would write the same value into the db over and over, but maybe that’s fine. The other changes would queue up and only progress after we’ve gotten through the current one.

This makes our function atomic and idempotent. Sure, the database will allow reads to the new value for some amount of time before the change notification is sent, but it’s not an incorrect value. We haven’t sent the change notification yet, but we will eventually. There was already some indeterminate amount of time between when we saved and when we sent the notification anyway. And we won’t have any other values until it’s sent.

We are planning for `publishChange` to fail and we are OK with the tradeoffs.

### Conclusion

I’ve detailed lots of issues with the types of code I see in the wild, I’ve listed some options to make things reliable, and I’ve probably made some mistakes along the way. Please comment or send me a note with any feedback or fixes.

Also, don’t build a distributed system if you don’t think your code or network or computer or something will fail. It will fail. Instead, just plan for it. It’s possible to consider lots of angles and just put things in place to either fix the issue or to just document it. Sometimes failure is fine, but don’t be surprised by it if possible.

Whether you’re building an iOS app or deploying some code to heroku, you are working with a distributed system. Two components talking over a network are not near each other and they will eventually act like that is the case. Just be aware. Don’t let anyone tell you something is impossible. Maybe it is, but that doesn’t really matter. What matters is documenting what happens in response to failures.