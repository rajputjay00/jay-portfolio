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

    // 1. Capture Opening Sequence Lines
    await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => {
      localStorage.removeItem('attention_lab_opening_seen');
      location.reload();
    });

    console.log('Capturing line 1: STOP....');
    await sleep(4600);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'opening-01-stop.png') });

    console.log('Capturing line 2: STOP. YOU DID....');
    await sleep(1200);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'opening-02-youdid.png') });

    console.log('Capturing line 3: That\'s the job.....');
    await sleep(1400);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'opening-03-tagline.png') });

    // 2. Capture Hero (Desktop 1440px) after sequence finishes
    console.log('Waiting for sequence completion and Hero reveal...');
    await sleep(3000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'hero-1440px.png') });
    console.log('Saved hero-1440px.png');

    // 3. Mobile Hero (390px)
    console.log('Capturing mobile hero at 390px...');
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    await sleep(1500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'hero-390px.png') });
    console.log('Saved hero-390px.png');

  } catch (err) {
    console.error('Capture error:', err);
  } finally {
    await browser.close();
  }
}

main();
