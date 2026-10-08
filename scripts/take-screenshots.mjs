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

    // 1. hero-1440.png (Clean production look, no debug overlays)
    console.log('Capturing hero-1440.png (clean)...');
    await page.evaluateOnNewDocument(() => {
      localStorage.setItem('attention_lab_opening_seen', 'true');
    });
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
    await sleep(1500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'hero-1440.png') });
    console.log('Saved hero-1440.png');

    // 2. hero-1440-debug.png (?debug=1 shows overlays, top-left replay, single FPS)
    console.log('Capturing hero-1440-debug.png...');
    await page.goto('http://localhost:3000/?debug=1', { waitUntil: 'networkidle0' });
    await sleep(1500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'hero-1440-debug.png') });
    console.log('Saved hero-1440-debug.png');

    // 3. proof-1440.png (Scroll to Proof section)
    console.log('Capturing proof-1440.png...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
    await sleep(1000);
    await page.evaluate(() => {
      const el = document.getElementById('proof');
      if (el) el.scrollIntoView();
    });
    await sleep(1500); // Wait for count-up animation to settle
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'proof-1440.png') });
    console.log('Saved proof-1440.png');

    // 4. cases-1440.png (Scroll to Case Studies section)
    console.log('Capturing cases-1440.png...');
    await page.evaluate(() => {
      const el = document.getElementById('work');
      if (el) el.scrollIntoView();
    });
    await sleep(1000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'cases-1440.png') });
    console.log('Saved cases-1440.png');

    // 5. case-reader-1440.png (Click first card to open modal)
    console.log('Capturing case-reader-1440.png...');
    await page.evaluate(() => {
      const card = document.querySelector('.case-card');
      if (card) card.click();
    });
    await sleep(1000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'case-reader-1440.png') });
    console.log('Saved case-reader-1440.png');
    // Press Escape to close modal
    await page.keyboard.press('Escape');
    await sleep(500);

    // 6. cases-390.png (Mobile viewport 390x844 on Case Studies)
    console.log('Capturing cases-390.png...');
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    await page.evaluate(() => {
      const el = document.getElementById('work');
      if (el) {
        const top = el.offsetTop;
        window.scrollTo({ top: top, behavior: 'instant' });
      }
    });
    await sleep(1500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'cases-390.png') });
    console.log('Saved cases-390.png');

    await page.close();
    console.log('All screenshots captured successfully!');
  } catch (err) {
    console.error('Screenshot capture error:', err);
  } finally {
    await browser.close();
  }
}

main();
