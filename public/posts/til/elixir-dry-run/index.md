+++
title = "TIL about ELIXIR_CLI_DRY_RUN for elixir and iex"
date = "2020-12-08T14:28:38+01:00"
aliases = [
  "/writing/til/elixir-dry-run/"
]
+++

While I’ve been working on deploying some [elixir releases][] I’ve been trying to understand how the flags I’m setting end up being seen by erlang. Well, it turns out elixir [has an ENV var for this][var] named `ELIXIR_CLI_DRY_RUN`.

[elixir releases]: https://hexdocs.pm/mix/Mix.Tasks.Release.html
[var]: https://github.com/elixir-lang/elixir/blob/76d245b6081c53228bf99fc1494add5de7872065/bin/elixir#L227

Here is an example:

```sh
$ ELIXIR_CLI_DRY_RUN=1 iex
erl -pa /usr/local/Cellar/elixir/1.11.2/bin/../lib/eex/ebin \
		/usr/local/Cellar/elixir/1.11.2/bin/../lib/elixir/ebin \
		/usr/local/Cellar/elixir/1.11.2/bin/../lib/ex_unit/ebin \
		/usr/local/Cellar/elixir/1.11.2/bin/../lib/iex/ebin \
		/usr/local/Cellar/elixir/1.11.2/bin/../lib/logger/ebin \
		/usr/local/Cellar/elixir/1.11.2/bin/../lib/mix/ebin \
	-noshell \
	-user Elixir.IEx.CLI \
	-extra --no-halt +iex
```

You can see a lot of interesting info here:

* `elixir` or `iex` are always just running `erl` in the end
* `-pa` is to prepend a module load path and elixir makes sure all it’s modules are accessible at boot
* `-noshell` means to, uh, not start the erlang shell, since iex is going to boot up it’s own shell in it’s `start` function with `:user_drv` ([find it in the erl docs](https://erlang.org/doc/man/erl.html))
* `-user` is the first module erlang will call `start` of after boot, in this instance it’s [`Elixir.IEx.CLI`](https://github.com/elixir-lang/elixir/blob/76d245b6081c53228bf99fc1494add5de7872065/lib/iex/lib/iex/cli.ex#L52)
* `-extra` means “`erl` won’t look at these, but they are available with [`:init.get_plain_arguments()`](https://erlang.org/doc/man/init.html#get_plain_arguments-0) which [elixir does a few times](https://github.com/elixir-lang/elixir/search?q=get_plain_arguments)
* `--no-halt` tells elixir not to auto-exit after boot, so iex can setup it’s shell and accept input
* `+iex` is a special flag [elixir looks for while starting up it’s CLI](https://github.com/elixir-lang/elixir/blob/76d245b6081c53228bf99fc1494add5de7872065/lib/elixir/lib/kernel/cli.ex#L301) (which is also [called by `IEx.start`](https://github.com/elixir-lang/elixir/blob/76d245b6081c53228bf99fc1494add5de7872065/lib/iex/lib/iex/cli.ex#L127))

I found this super interesting and it helped me learn a lot about how erlang boots up, how modules are loaded, etc.
