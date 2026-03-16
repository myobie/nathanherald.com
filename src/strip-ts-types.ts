const info = new Deno.Command(Deno.execPath(), { args: ['info', '--json'] })
const { typescriptCache } = JSON.parse(new TextDecoder().decode((await info.output()).stdout))

export async function stripTSTypes(filepath: string): Promise<string> {
  const fileUrl = new URL(import.meta.resolve(filepath))
  // NOTE: import() will make deno process the ts into js
  await import(fileUrl.href)
  const jsCache = `file${fileUrl.pathname}.js`

  const contents = (await Deno.readTextFile(`${typescriptCache}/${jsCache}`)).replace(
    /\/\/#\ssourceMappingURL=.+/,
    ''
  )

  return contents
}
