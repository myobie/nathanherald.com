import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: '.',
  testMatch: '*.test.ts',
  timeout: 30_000,
  use: {
    baseURL: 'http://localhost:8787',
  },
  webServer: {
    command: 'deno run --allow-net --allow-read jsr:@std/http/file-server ../public -p 8787',
    port: 8787,
    reuseExistingServer: true,
    timeout: 10_000,
  },
})
