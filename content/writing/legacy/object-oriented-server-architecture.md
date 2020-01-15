+++
title = "Object Oriented System Architecture"
date = "2015-01-23T15:41:30.500Z"
svbtleUrl = "https://myobie.svbtle.com/object-oriented-server-architecture-1"
+++

Building large systems to process web requests, work jobs, and do other things can be daunting without a plan of attack or a system-of-thought. How many components to build, how to separate responsibilities, and when to build small or big are questions that come up over and over again. Having a framework to answer questions is a huge help and keeps things consistent, especially when working on a team.

The best way I’ve found to describe my system-of-thought for building large systems is object oriented system architecture. This means to loosely apply object oriented software design principles to the macro-level of a system's architecture. Basically: micro-services. The term micro-service is pretty vague now-a-days, so I feel it’s important to be more specific.

Over the next few months I plan to take the time to describe different principles, scenarios, and ideas about how to build large systems. The basics are:

* An object is a service
* Build small, well-defined objects
* Objects collaborate by passing messages
* Model different problem domains for the system as discrete objects
* Expose well-defined attributes and methods
* Document and distinguish query and command methods
* Objects own their data, which includes their data-store

A simple example would be a to-do list (I know, I know). There would need to be a lists service and a tasks service at a minimum. The lists service cannot talk to the tasks data-store, instead it must query the tasks service by passing a message to a query method. Things can be broken down even further by separating task reads, task writes, and tasks storage. It is not unthinkable to have a TasksGet, TasksSave, and TasksRepository object in a class based programming language, therefore it’s not unthinkable to have a tasks-get, tasks-save, and tasks-repository service as part of the system architecture.

If I built a service like this then the tasks service would expose an HTTP JSON api for all queries and commands. I would also have an asynchronous queue to facilitate cleanup work, cascade deletes, etc. The tasks service might message itself to cascade a change from one set of tasks to another by enqueuing a message onto a queue for a worker to later pickup.

By thinking on the macro-level about objects, one is free to think about the micro-level more simply. Most small, well-defined services don’t need large software object hierarchies. Each query and command could be defined as a single function, possibly in a very functional language, as long as it’s exposed in a well defined way to the rest of the system. 

Inheritance is even possible by delegating calls from one service to another. A completed-tasks-get service might proxy every message to the tasks-get service, then filter out all non-completed tasks before returning results. Deciding if completed tasks are another service or a method on an existing service is similar to deciding if one should add a method to a class or object or to write a simple delegate object wrapper.

Code is supposed to express the intent of the program and this is more easily achieved if the service has one clearly defined purpose. A service might need sophisticated permissions rules so one might choose a language better at expressing lists of rules or logic programming. Some services might just read and return data with minimal transformation and be represented as a simple function conceptually as well as in code.