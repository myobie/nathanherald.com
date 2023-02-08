Path.wildcard("content/**/*.md")
|> Enum.map(fn path ->
  url =
    if String.ends_with?(path, "/index.md") do
      Path.dirname(path)
    else
      String.replace_trailing(path, ".md", "")
    end

  {path, url}
end)
|> Enum.map(fn {path, url} ->
  url = String.replace_leading(url, "content", "") <> "/"
  {path, url}
end)
|> Enum.map(fn {path, url} ->
  {File.read!(path), path, url}
end)
|> Enum.map(fn {file, path, url} ->
  replacement = """
  aliases = [
    "#{url}"
  ]
  +++

  """

  content = String.replace(file, ~r{\+\+\+\n\n}, replacement)

  {content, path}
end)
|> Enum.map(fn {content, path} ->
  File.write!(path, content)
end)
