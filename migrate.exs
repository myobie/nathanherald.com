Path.wildcard("public/**/*.html")
|> Enum.map(fn path ->
  {File.read!(path), path}
end)
|> Enum.map(fn {file, path} ->
  pattern =
    ~r{<a href=(\s*)"https://nathanherald.com/posts/}

  replacement =
    ~S{<a href="/posts/}

  content = String.replace(file, pattern, replacement)

  {content, path}
end)
|> Enum.map(fn {content, path} ->
  File.write!(path, content)
end)
