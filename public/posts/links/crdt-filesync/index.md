+++
title = "CRDT File Sync"
date = "2026-02-25T13:05:54+01:00"
description = "A clever approach to syncing: each device writes its own file to a synced folder, then reads all the others to build up the full state"
externalUrl = "https://tonsky.me/blog/crdt-filesync/"
+++

I hadn't ever thought of having each device write its own database / file to a synced folder, and then just periodically having each device read all the other files to accumulate a fully synced state. It's such a simple, clever idea: no conflicts at the file-sync layer because each client only writes to its own file, and CRDTs handle merging the actual data.
