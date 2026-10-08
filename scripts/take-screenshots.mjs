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
      if (el) el.scrollIntoView({ behavior: 'instant' });
    });
    await sleep(1000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'retention-1440.png') });
    console.log('Saved retention-1440.png');

    // 2. range-1440.png
    console.log('Capturing range-1440.png...');
    await page.evaluate(() => {
      const el = document.getElementById('range');
      if (el) el.scrollIntoView({ behavior: 'instant' });
    });
    await sleep(1200); // Allow GSAP rise and fade to settle
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'range-1440.png') });
    console.log('Saved range-1440.png');

    // 3. retention-390.png
    console.log('Capturing retention-390.png...');
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    await sleep(500);
    await page.evaluate(() => {
      const el = document.getElementById('retention');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
    });
    await sleep(1000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'retention-390.png') });
    console.log('Saved retention-390.png');

    // 4. range-390.png
    console.log('Capturing range-390.png...');
    await page.evaluate(() => {
      const el = document.getElementById('range');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
    });
    await sleep(1000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'range-390.png') });
    console.log('Saved range-390.png');

    await page.close();
    console.log('Screenshots captured successfully!');
  } catch (err) {
    console.error('Screenshot capture error:', err);
  } finally {
    await browser.close();
  }
}

main();
