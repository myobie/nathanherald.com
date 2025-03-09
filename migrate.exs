Path.wildcard("public/**/*.html")
|> Enum.map(fn path ->
  {File.read!(path), path}
end)
|> Enum.map(fn {file, path} ->
  pattern = ~S{<a href="/posts/rss.xml">}

  replacement = ~S{<a href="/rss.xml">}

  file = String.replace(file, pattern, replacement)

  {file, path}
end)
|> Enum.map(fn {file, path} ->
  File.write!(path, file)
end)
