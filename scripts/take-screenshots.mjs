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
      '--window-size=1396,705',
    ],
  });

  const pageErrors = [];

  try {
    const page = await browser.newPage();
    page.on('console', (msg) => {
      const text = msg.text();
      console.log('PAGE LOG:', text);
      if (msg.type() === 'error' && !text.includes('404')) {
        pageErrors.push(`Console Error: ${text}`);
      }
    });
    page.on('pageerror', (err) => {
      console.log('PAGE ERROR:', err.message);
      pageErrors.push(`Page Error: ${err.message}`);
    });

    await page.setViewport({ width: 1396, height: 705 });

    await page.evaluateOnNewDocument(() => {
      localStorage.setItem('attention_lab_opening_seen', 'true');
    });

    await page.goto('http://localhost:3100', { waitUntil: 'networkidle0' });
    await sleep(2000);

    // 1. range-1396.png
    console.log('Capturing range-1396.png at 1396x705...');
    await page.evaluate(() => {
      const el = document.getElementById('range');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
    });
    await sleep(1500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'range-1396.png') });
    console.log('Saved range-1396.png');

    // 2. proof-1396.png (scribbles and notification visible)
    console.log('Capturing proof-1396.png at 1396x705...');
    await page.evaluate(() => {
      const el = document.getElementById('proof');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
    });
    // Wait for counter animation and scribbles
    await sleep(2500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'proof-1396.png') });
    console.log('Saved proof-1396.png');

    // 3. toast-1396.png
    console.log('Capturing toast-1396.png at 1396x705...');
    await page.evaluate(() => {
      window.dispatchEvent(
        new CustomEvent('show-toast', {
          detail: 'Scrolling past a guy who stops scrolls for a living? Bold.',
        })
      );
    });
    await sleep(800);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'toast-1396.png') });
    console.log('Saved toast-1396.png');

    // 4. hearts-1396.png (L Easter egg)
    console.log('Capturing hearts-1396.png at 1396x705...');
    await page.keyboard.press('KeyL');
    await sleep(600);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'hearts-1396.png') });
    console.log('Saved hearts-1396.png');

    // Wait for hearts to clear
    await sleep(3000);

    // 5. exit-stop-1396.png
    console.log('Capturing exit-stop-1396.png at 1396x705...');
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('trigger-exit-stop'));
    });
    await sleep(600);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'exit-stop-1396.png') });
    console.log('Saved exit-stop-1396.png');

    // Close exit modal
    await page.keyboard.press('Escape');
    await sleep(400);

    // 6. proof-390.png (mobile)
    console.log('Capturing proof-390.png at 390x844...');
    const mobilePage = await browser.newPage();
    await mobilePage.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    await mobilePage.evaluateOnNewDocument(() => {
      localStorage.setItem('attention_lab_opening_seen', 'true');
    });
    await mobilePage.goto('http://localhost:3100#proof', { waitUntil: 'networkidle0' });
    await sleep(2500);
    await mobilePage.evaluate(() => {
      const el = document.getElementById('proof');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
    });
    await sleep(1500);
    await mobilePage.screenshot({ path: path.join(SCREENSHOT_DIR, 'proof-390.png') });
    console.log('Saved proof-390.png');
    await mobilePage.close();

    // 7. 404-1396.png
    console.log('Capturing 404-1396.png at 1396x705...');
    await page.setViewport({ width: 1396, height: 705 });
    await page.goto('http://localhost:3100/non-existent-page', { waitUntil: 'networkidle0' });
    await sleep(1500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '404-1396.png') });
    console.log('Saved 404-1396.png');

    await page.close();

    console.log('--- CAPTURE SUMMARY ---');
    if (pageErrors.length === 0) {
      console.log('CONSOLE STATUS: CLEAN (0 errors)');
    } else {
      console.log(`CONSOLE STATUS: ${pageErrors.length} ERRORS DETECTED:`, pageErrors);
    }
  } catch (err) {
    console.error('Screenshot capture error:', err);
  } finally {
    await browser.close();
  }
}

main();
