---
title: TIL about Solid and FOAF
date: 2026-06-26T10:56:01+02:00
description: Solid, linked data, and FOAF are one idea wearing three hats, and one version has quietly been running in production in Belgium for years.
---

# TIL about Solid and FOAF

I've had a note sitting in my reminders for a few days: *"write something about that solid thing and linked data and foaf."* So I finally dug in. As I [wrote about recently,](https://nathanherald.com/posts/practical-rdf-example/) I’m very interested in RDF-* and linked data and Solid and FOAF both come up in my searches every time. So… 

## Solid

Solid (Social Linked Data) is Tim Berners-Lee's project to fix the part of the web where your data lives inside someone else's box. Your stuff goes in a *pod* which is a little datastore you own and “apps” get decoupled from the data. So instead of an app holding your data hostage, it asks your pod for permission to read it. Switch apps, keep everything. Flip a switch, revoke access.

Which, yeah. Obviously we should own and control our own data. So cool idea I guess.

## It's RDF underneath

The data in a pod is just RDF which is the same subject/predicate/object triples from my [recent post.](https://nathanherald.com/posts/practical-rdf-example/) Solid doesn't reinvent how data is shaped, it only seems concerned about the container for the data.

RDF and linked data are about *what your data means and how it connects*. Solid is about *where it lives and who gets to read it*. A pod is just somewhere to keep your slice of the big graph, with a permission system bolted on.

“Linked data” is the glue: triples whose subjects and objects are URLs, and those URLs resolve to more triples. You follow from one fact to the next across the web.

## FOAF

FOAF (Friend of a Friend) is the oldest real example of linked data about *people*. It’s a tiny RDF vocabulary: `foaf:Person`, `foaf:name`, `foaf:knows`, `foaf:homepage`. Dan Brickley and Libby Miller started it around 2000. Probably the first social-semantic-web thing.

The vocabulary's been basically frozen for two decades and the namespace still resolves. And it's what Solid leans on under the hood. A Solid identity is a *WebID*, and a WebID profile is more or less a FOAF file describing you.

So FOAF is the whole idea shrunk to its smallest form. No pods, no server, no protocol. Just a file about you, linking to files about your friends.

## A real Solid use case

In Flanders, the public data company [Athumi](https://athumi.be/en/technologies/solid) put citizen data on Solid pods. The first real use case was: you share your diploma with a recruiter *on consent*, for whatever scope and time window you pick. Before, only the government could pull your diploma from the official database. With a pod, you can hand it over yourself. 

And it’s still going. They’ve [extended the same platform to digital student certificates](https://www.itsme-id.com/en-BE/business/blog/athumi-and-itsme-digital-student-certificate) through the itsme app, with a student app called Dibbs as the first to use it.

## Cool idea and I'm not sure I'd ever use it

Even at that project in Belgium: their own research found people were confused by WebIDs and pods and that the main problem was *explainability*. Which is why every shipping version hides Solid completely behind a normal-looking app like itsme. 

## FOAF me

I’ve published a FOAF file, which looks kinda like this:

```turtle
@prefix foaf: <http://xmlns.com/foaf/0.1/> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .

<#me> a foaf:Person ;
    foaf:name "Nathan Herald" ;
    foaf:homepage <https://nathanherald.com/> ;
    foaf:knows [
        a foaf:Person ;
        foaf:name "A Friend" ;
        rdfs:seeAlso <https://afriend.example/profile.ttl>
    ] .
```

It lives at [`/profile.ttl`](/profile.ttl), so <https://nathanherald.com/profile.ttl#me> is my WebID. That `#me` fragment matters: the file is a *document*, and I'm a *person* it describes.

So no pod for me. Just a little file and I’m now a little node in the web of people, pointing at my friends. Pretty cool.
