// Records a live website in real time (animations included) to public/site-recording.webm
// Usage: node scripts/record-site.mjs <url> [seconds]
//   e.g. node scripts/record-site.mjs https://www.ecologicpoolservice.com/ 120
import { rename } from "node:fs/promises";
import { chromium } from "playwright-core";

const url = process.argv[2];
const seconds = Number(process.argv[3] ?? 60);
if (!url) {
  console.error("Usage: node scripts/record-site.mjs <url> [seconds]");
  process.exit(1);
}

const size = { width: 1920, height: 1080 };
const browser = await chromium.launch({ channel: "chrome" });
const context = await browser.newContext({
  viewport: size,
  recordVideo: { dir: "public", size },
});
const page = await context.newPage();
await page.goto(url, { waitUntil: "load" });
console.log(`Recording ${url} for ${seconds}s…`);
await page.waitForTimeout(seconds * 1000);
const tempPath = await page.video().path();
await context.close();
await browser.close();
await rename(tempPath, "public/site-recording.webm");
console.log("Saved public/site-recording.webm");
