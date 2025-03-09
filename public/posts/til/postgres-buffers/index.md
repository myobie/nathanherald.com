+++
title = "TIL about explain (analyze, buffers) in postgresql"
date = "2022-01-23T18:55:28Z"
externalUrl = "https://www.pgmustard.com/docs/explain/buffers"
aliases = [
  "/writing/til/postgres-buffers/"
]
+++

While reading [some postgres tips][tips] today, as one does, I noticed a parameter to `explain` I hadn't seen before:

```sql
EXPLAIN (ANALYZE, BUFFERS)
SELECT * FROM users WHERE lower(email) = 'email@example.com'
```

[tips]: https://pawelurbanek.com/postgresql-query-bottleneck

`buffers` would have been super useful recently when I was debugging some queries! And there are more I didn't know about like `costs off`, `timing off`, and `summary off`. Next time I'll be more prepared.