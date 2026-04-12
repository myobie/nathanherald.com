const { chromium } = require('playwright');

const url = process.argv[2];
const outPath = process.argv[3];

if (!url || !outPath) {
  console.error('Usage: og-screenshot.js <url> <output-path>');
  process.exit(1);
}

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  await page.goto(url);
  await page.waitForFunction(() => document.fonts.ready.then(() => true));
  await page.waitForTimeout(500);
  const card = page.locator('.card');
  await card.screenshot({ path: outPath });
  await browser.close();
})();
