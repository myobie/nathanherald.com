import { serveDir } from 'jsr:@std/http/file-server'
import { stripTSTypes } from './strip-ts-types.ts'

Deno.serve({ port: 8787 }, async (req: Request) => {
  const url = new URL(req.url)
  const pathname = url.pathname

  // Serve .ts files as JavaScript (with types stripped)
  if (pathname.endsWith('.ts')) {
    const relpath = `./${pathname.replace(/^\//, '')}`
    try {
      const contents = await stripTSTypes(relpath)
      return new Response(contents, {
        headers: { 'content-type': 'application/javascript' }
      })
    } catch {
      // Fall through to static serving
    }
  }

  // Serve .js requests by looking for a .ts source file
  if (pathname.endsWith('.js')) {
    const tsPath = `./${pathname.replace(/^\//, '').replace(/\.js$/, '.ts')}`
    try {
      await Deno.stat(`./src/${pathname.replace(/^\//, '').replace(/\.js$/, '.ts')}`)
      const contents = await stripTSTypes(tsPath)
      return new Response(contents, {
        headers: { 'content-type': 'application/javascript' }
      })
    } catch {
      // Fall through to static serving
    }
  }

  return serveDir(req, { fsRoot: './src' })
})
