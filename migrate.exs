Path.wildcard("content/**/*.md")
|> Enum.map(fn path ->
  {File.read!(path), path}
end)
|> Enum.map(fn {file, path} ->
  pattern = ~r{^content/}

  replacement = "public/"

  path = String.replace(path, pattern, replacement)

  {file, path}
end)
|> Enum.map(fn {file, path} ->
  if String.ends_with?(path, "index.md") do
    {file, path}
  else
    pattern = ~r{/(.+)\.md$}

    replacement = ~S{/\1/index.md}

    path = String.replace(path, pattern, replacement)

    {file, path}
  end
end)
|> Enum.map(fn {file, path} ->
  File.write!(path, file)
end)
