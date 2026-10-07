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
    // ==========================================
    // STATE A: FRESH VISITOR (empty localStorage)
    // ==========================================
    console.log('\n--- TESTING STATE A: FRESH VISITOR ---');
    const pageFresh = await browser.newPage();
    await pageFresh.setViewport({ width: 1440, height: 900 });

    const freshErrors = [];
    const freshWarnings = [];

    pageFresh.on('console', (msg) => {
      const type = msg.type();
      const text = msg.text();
      if (type === 'error') freshErrors.push(text);
      if (type === 'warning') freshWarnings.push(text);
      console.log(`[Fresh Browser ${type.toUpperCase()}]: ${text}`);
    });

    pageFresh.on('pageerror', (err) => {
      freshErrors.push(err.toString());
      console.error(`[Fresh Page Error]:`, err);
    });

    pageFresh.on('response', (res) => {
      if (res.status() === 404) {
        console.log('[404 URL]:', res.url());
      }
    });

    // Ensure empty localStorage before document loads
    await pageFresh.evaluateOnNewDocument(() => {
      localStorage.clear();
    });

    await pageFresh.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });

    console.log('Capturing opening-01.png (around 4.6s - "STOP.")...');
    await sleep(4600);
    await pageFresh.screenshot({ path: path.join(SCREENSHOT_DIR, 'opening-01.png') });
    console.log('Saved opening-01.png');

    console.log('Capturing opening-03.png (around 7.2s - "STOP. YOU DID. That\'s the job.")...');
    await sleep(2600);
    await pageFresh.screenshot({ path: path.join(SCREENSHOT_DIR, 'opening-03.png') });
    console.log('Saved opening-03.png');

    console.log('Waiting for opening sequence completion and hero reveal (~9.5s)...');
    await sleep(2500);
    await pageFresh.screenshot({ path: path.join(SCREENSHOT_DIR, 'hero-1440-fresh-after-opening.png') });
    console.log('Saved hero-1440-fresh-after-opening.png');

    await pageFresh.close();

    // ==========================================
    // STATE B: RETURNING VISITOR (key set in localStorage)
    // ==========================================
    console.log('\n--- TESTING STATE B: RETURNING VISITOR ---');
    const pageReturning = await browser.newPage();
    await pageReturning.setViewport({ width: 1440, height: 900 });

    const returningErrors = [];
    const returningWarnings = [];

    pageReturning.on('console', (msg) => {
      const type = msg.type();
      const text = msg.text();
      if (type === 'error') freshErrors.push(text);
      if (type === 'warning') returningWarnings.push(text);
      console.log(`[Returning Browser ${type.toUpperCase()}]: ${text}`);
    });

    pageReturning.on('pageerror', (err) => {
      returningErrors.push(err.toString());
      console.error(`[Returning Page Error]:`, err);
    });

    // Set localStorage before page load using evaluateOnNewDocument
    await pageReturning.evaluateOnNewDocument(() => {
      localStorage.setItem('attention_lab_opening_seen', 'true');
    });

    await pageReturning.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
    await sleep(1000);

    console.log('Capturing hero-1440-returning.png...');
    await pageReturning.screenshot({ path: path.join(SCREENSHOT_DIR, 'hero-1440-returning.png') });
    console.log('Saved hero-1440-returning.png');

    // Also capture mobile hero at 390px
    console.log('Capturing hero-390.png (mobile returning)...');
    await pageReturning.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    await sleep(1000);
    await pageReturning.screenshot({ path: path.join(SCREENSHOT_DIR, 'hero-390.png') });
    console.log('Saved hero-390.png');

    await pageReturning.close();

    console.log('\n--- CONSOLE AUDIT SUMMARY ---');
    console.log(`Fresh visitor errors: ${freshErrors.length}, warnings: ${freshWarnings.length}`);
    console.log(`Returning visitor errors: ${returningErrors.length}, warnings: ${returningWarnings.length}`);

  } catch (err) {
    console.error('Capture error:', err);
  } finally {
    await browser.close();
  }
}

main();
