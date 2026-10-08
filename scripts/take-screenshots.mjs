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

    await page.goto('http://localhost:3100', { waitUntil: 'networkidle0' });
    await sleep(2000);

    // 1. cases-1440.png
    console.log('Capturing cases-1440.png...');
    await page.evaluate(() => {
      const el = document.getElementById('work');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
    });
    await sleep(1200);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'cases-1440.png') });
    console.log('Saved cases-1440.png');

    // 2. cases-1440-hover.png
    console.log('Capturing cases-1440-hover.png...');
    const card = await page.$('.case-card');
    if (card) {
      const box = await card.boundingBox();
      if (box) {
        await page.mouse.move(box.x + box.width * 0.7, box.y + box.height * 0.3);
      }
    }
    await sleep(600);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'cases-1440-hover.png') });
    console.log('Saved cases-1440-hover.png');

    // 3. message-1440.png
    console.log('Capturing message-1440.png...');
    await page.evaluate(() => {
      const el = document.getElementById('message');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
    });
    await sleep(1200);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'message-1440.png') });
    console.log('Saved message-1440.png');

    // 4. full-page-1440.png
    console.log('Capturing full-page-1440.png...');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'full-page-1440.png'), fullPage: true });
    console.log('Saved full-page-1440.png');

    // 5. full-page-390.png
    console.log('Capturing full-page-390.png...');
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    await sleep(800);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'full-page-390.png'), fullPage: true });
    console.log('Saved full-page-390.png');

    await page.close();
    console.log('All requested screenshots captured successfully!');
  } catch (err) {
    console.error('Screenshot capture error:', err);
  } finally {
    await browser.close();
  }
}

main();
