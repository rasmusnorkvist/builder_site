import puppeteer from 'puppeteer';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(root, 'temporary screenshots');

const [, , url, label] = process.argv;
if (!url) {
  console.error('Usage: node screenshot.mjs <url> [label]');
  process.exit(1);
}

fs.mkdirSync(outDir, { recursive: true });

function nextFileName() {
  if (label) return `screenshot-${label}.png`;
  const existing = fs.readdirSync(outDir)
    .map(f => f.match(/^screenshot-(\d+)\.png$/))
    .filter(Boolean)
    .map(m => Number(m[1]));
  const next = existing.length ? Math.max(...existing) + 1 : 1;
  return `screenshot-${next}.png`;
}

const browser = await puppeteer.launch();
try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto(url, { waitUntil: 'networkidle0' });
  const filePath = path.join(outDir, nextFileName());
  await page.screenshot({ path: filePath, fullPage: true });
  console.log(`Saved ${filePath}`);
} finally {
  await browser.close();
}
