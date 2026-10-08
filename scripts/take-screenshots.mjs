import puppeteer from 'puppeteer-core';
import path from 'path';
import fs from 'fs';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const SCREENSHOT_DIR = path.resolve(process.cwd(), 'screenshots');

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--enable-webgl',
      '--use-gl=angle',
      '--window-size=1440,900',
    ],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    await page.evaluateOnNewDocument(() => {
      localStorage.setItem('attention_lab_opening_seen', 'true');
    });

    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
    await sleep(1500);

    // 1. retention-1440.png
    console.log('Capturing retention-1440.png...');
    await page.evaluate(() => {
      const el = document.getElementById('retention');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
    });
    await sleep(1000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'retention-1440.png') });
    console.log('Saved retention-1440.png');

    // 2. range-1440.png
    console.log('Capturing range-1440.png...');
    await page.evaluate(() => {
      const el = document.getElementById('range');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
    });
    await sleep(1200);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'range-1440.png') });
    console.log('Saved range-1440.png');

    // 3. about-1440.png
    console.log('Capturing about-1440.png...');
    await page.evaluate(() => {
      const el = document.getElementById('about');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
    });
    await sleep(1000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'about-1440.png') });
    console.log('Saved about-1440.png');

    // 4. message-1440.png
    console.log('Capturing message-1440.png...');
    await page.evaluate(() => {
      const el = document.getElementById('message');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
    });
    await sleep(1000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'message-1440.png') });
    console.log('Saved message-1440.png');

    // 5. message-1440-after-reply.png
    console.log('Capturing message-1440-after-reply.png...');
    await page.evaluate(() => {
      const btn = document.querySelector('.btn-hiring');
      if (btn) btn.click();
    });
    await sleep(1500); // Wait for typing indicator and bot response
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'message-1440-after-reply.png') });
    console.log('Saved message-1440-after-reply.png');

    // 6. full-page-1440.png
    console.log('Capturing full-page-1440.png...');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'full-page-1440.png'), fullPage: true });
    console.log('Saved full-page-1440.png');

    // Mobile Viewport
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    await sleep(500);

    // 7. message-390.png
    console.log('Capturing message-390.png...');
    await page.evaluate(() => {
      const el = document.getElementById('message');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
    });
    await sleep(1000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'message-390.png') });
    console.log('Saved message-390.png');

    // 8. full-page-390.png
    console.log('Capturing full-page-390.png...');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'full-page-390.png'), fullPage: true });
    console.log('Saved full-page-390.png');

    await page.close();
    console.log('All screenshots captured successfully!');
  } catch (err) {
    console.error('Screenshot capture error:', err);
  } finally {
    await browser.close();
  }
}

main();
