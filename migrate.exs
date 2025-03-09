Path.wildcard("public/**/*.html")
|> Enum.map(fn path ->
  {File.read!(path), path}
end)
|> Enum.map(fn {file, path} ->
  pattern =
    ~S{<link rel="stylesheet" type="text/css" href="https://nathanherald.com/combined.min.31312963d9b6322f358005bab4cfc1a3a286b0ec67f5df6e22434de51d71c004.css" integrity="sha256-MTEpY9m2Mi81gAW6tM/Bo6KGsOxn9d9uIkNN5R1xwAQ=">}

  replacement =
    ~S{<link rel="stylesheet" type="text/css" href="/styles.css">}

  content = String.replace(file, pattern, replacement)

  {content, path}
end)
|> Enum.map(fn {file, path} ->
  pattern =
    ~S{<script async src="https://nathanherald.com/behavior.min.e41a74d07fee42e04abe287c617e80b67998e06c69d3d3c07c6cd91f272bc0bc.js" integrity="sha256-5Bp00H/uQuBKvih8YX6AtnmY4Gxp09PAfGzZHycrwLw="></script>}

  replacement =
    ~S{<script async src="/behavior.js"></script>}

  content = String.replace(file, pattern, replacement)

  {content, path}
end)
|> Enum.map(fn {file, path} ->
  pattern =
    ~S{<link rel="alternate" type="application/rss+xml" href="https://nathanherald.com/posts/rss.xml" title="Archive of all the posts on this site on nathanherald.com">}

  replacement =
    ~S{<link rel="alternate" type="application/rss+xml" href="/rss.xml" title="Feed of all the posts on nathanherald.com">}

  content = String.replace(file, pattern, replacement)

  {content, path}
end)
|> Enum.map(fn {content, path} ->
  File.write!(path, content)
end)
