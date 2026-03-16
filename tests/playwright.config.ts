import { defineConfig } from 'npm:@playwright/test'

export default defineConfig({
  testDir: '.',
  testMatch: '*.test.ts',
  timeout: 30_000,
  use: {
    baseURL: 'http://localhost:8787',
  },
  webServer: {
    command: 'deno run -A ../src/dev.ts',
    port: 8787,
    reuseExistingServer: true,
  },
})
