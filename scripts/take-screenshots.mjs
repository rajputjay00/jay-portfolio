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

    // 1. Capture Opening Sequence Line 3: "That's the job."
    await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => {
      localStorage.removeItem('attention_lab_opening_seen');
      location.reload();
    });

    console.log('Waiting for opening sequence line 3 (That\'s the job.)...');
    // In OpeningOverlay: 4.2s "STOP.", 5.4s "YOU DID.", 6.6s "That's the job."
    await sleep(7200);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'opening-03.png') });
    console.log('Saved opening-03.png');

    // 2. Wait for sequence to complete and capture Desktop Hero (1440px)
    console.log('Waiting for hero reveal at 1440px...');
    await sleep(2500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'hero-1440.png') });
    console.log('Saved hero-1440.png');

    // 3. Hover over the middle of the feed (e.g. x: 1050, y: 450)
    console.log('Moving mouse to hover middle of feed (1050, 450)...');
    await page.mouse.move(1050, 450);
    await sleep(1000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'hero-1440-hover.png') });
    console.log('Saved hero-1440-hover.png');

    // 4. Capture Mobile Hero (390px)
    console.log('Capturing mobile hero at 390px...');
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    await sleep(1500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'hero-390.png') });
    console.log('Saved hero-390.png');

  } catch (err) {
    console.error('Capture error:', err);
  } finally {
    await browser.close();
  }
}

main();
