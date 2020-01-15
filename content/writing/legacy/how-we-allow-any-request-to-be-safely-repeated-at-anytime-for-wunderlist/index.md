+++
title = "How we allow any request to be safely repeated at anytime for Wunderlist"
date = "2015-03-24T12:17:09.248Z"
mediumUrl = "https://medium.com/wunderlist-engineering/how-we-allow-any-request-to-be-safely-repeated-at-anytime-for-wunderlist-e35783ad5ea6"
+++

{{<fig
  src="1-fHM7VzsKEk37wIrfhSkNWA.jpeg"
  alt="A mechanical button reading 'repeat'"
  link="https://www.flickr.com/photos/thomashawk/2681744739">}}
Via [https://www.flickr.com/photos/thomashawk/2681744739](https://www.flickr.com/photos/thomashawk/2681744739)
{{</fig>}}

Stripe recently introduced an [Idempotent requests feature](https://stripe.com/docs/api#idempotent_requests) for their api calls to protect against duplicate charges caused by network failures. While building Wunderlist 3 we needed a similar mechanism for our remote clients to be able to be safely repeat any requests. Mobile networks, corporate firewalls, and general internet connectivity issues are problems way too often. One cannot be sure an operation has successfully arrived without receiving a full, parseable response.

We took a different route to protecting our data and I’d like to detail it for future reference. It could be useful for other’s to compare and contrast Stripe’s and Wunderlist’s methods for idempotent requests.

With stripe, one includes an `Idempotency-Key` header with every request. If a request comes in within the next 24 hours with the same header value then Stripe will return the original response. One could build something like this utilizing redis or memcached to hold all raw responses keyed by the idempotency header’s value with a TTL. 24 hours makes sense for stripe since their clients are mostly background workers on servers. Surely even 1 hour would probably be enough, since most server workers are always working and would retry very quickly.

For Wunderlist, we have clients in remote places that sometimes are offline for days. A user might use their iPhone constantly for weeks, but only open their iPad once every week. Or a person might be on a web client at work, but a phone at home. Instead of using an in-memory cache of responses, we decided to let our databases do most of the work for us. I always favor the dumbest solution that works and so that is what we did (:

All GET requests (which are always reads) to the Wunderlist apis are safe already, so that part is easy.

For write operations every Wunderlist client maintains an an operation queue that is serializable to disk. Every write request is first added to the operation queue. Then, on the other side, an operation worker marks items as in-progress, finished, etc as it processes the requests. Right before a client is quit: it writes the current state to disk. This state is restored into memory on app boot. A request could be cut short by network issues, memory pressure, or just the use quitting the app. The request could have succeeded or it could have never made it to the server, it’s impossible for the client to know.

POSTs (which are always creates) are the hardest since the client has zero knowledge about the server’s state. PUTs (which are updates) are easier, since the client already knowns the server’s identifier for the object being updated. And we decided DELETEs always win and always succeed.

PUTs are easy because our sync algorithm already handles them. Every object in the Wunderlist system has an identifier and a revision. Every update to an object safely increments it’s revision counter by at least 1. Anytime a client updates an object it must send what it knows to be the current revision and identifier along with the properties to update. If the client’s assumed current revision is incorrect, the server immediately rejects the request and asks the client to fetch and merge the newest information. I am not ashamed to say this is identical to how Couch DB works, which is where we got the idea. If a client were to replay a successful update, it would fail because the revision would have changed and the client would be out of date. The client would fetch the new information, merge that in, notice nothing is out of date, and reconcile the operation in the queue to be completed.

For all POST requests, the client generates a header we named `X-Client-Request-ID` which is basically the same as stripe’s `Idempotent-Key` header. This request id is generated as part of the request operation that is added to the in-memory queue, this way it is serialized to and from disk as needed. This means a client can attempt to replay a POST request even if the app was offline for a long time.

On the server side, we let the database do the hard work for us. Every table for all synced objects has the aforementioned id and revision columns along with a `created_by_request_id` column. The request id column has a unique constraint, so there can never be two. To prevent clients from stomping on top of each other’s request id’s, other metadata like the current user’s id and the current device’s identifier are prepended to the already random request id. Since the operation queue is not synced between devices that is enough to keep this super unique.

Our apis return the `created_by_request_id` field in the object’s json so that clients can reconcile any operations currently stuck in their operation queue without having to retry the request.

All Wunderlist clients only perform GETs during a sync and only perform any writes when flushing the operation queue. If a client is currently in read mode then it will scan through the operation queue for each newly downloaded object’s request id, attempting to reconcile an in-memory request if one is found. In write mode: the client will simply send every request from the operation queue.

Since deletes always win they can safely be replayed over and over. The object won’t get any more deleted.

Although there are multiple concepts involved, we have found this system for idempotency to be very easy to understand and very reliable. What really pays is to consider the system in it’s entirety (from client to server) to come up with the best possible solution. Stripe’s is very elegant and could work for a certain type of app. Our solution is tailored for our long term, long range duplicate request issues. I hope this is helpful in some way if you are thinking about these things for your app.

_Originally published at_ [_myobie.svbtle.com_](http://myobie.svbtle.com/how-we-allow-any-request-to-be-safely-repeated-at-anytime-for-wunderlist)_. Yes – I've had many blogs in the past…_