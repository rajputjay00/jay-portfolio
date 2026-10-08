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

    await page.setDefaultNavigationTimeout(60000);
    await page.setViewport({ width: 1396, height: 705 });

    await page.evaluateOnNewDocument(() => {
      localStorage.setItem('attention_lab_opening_seen', 'true');
    });

    await page.goto('http://localhost:3100', { waitUntil: 'networkidle0' });
    await sleep(2000);

    // 1. hooks-1396.png
    console.log('Capturing hooks-1396.png at 1396x705...');
    await page.evaluate(() => {
      const el = document.getElementById('hooks');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
    });
    await sleep(1500);
    // Test entering a custom brand and clicking make hooks
    await page.type('#brand-input', 'Spotify');
    await page.click('.hooks-submit-btn');
    await sleep(800);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'hooks-1396.png') });
    console.log('Saved hooks-1396.png');

    // 2. swipe-1396.png
    console.log('Capturing swipe-1396.png at 1396x705...');
    await page.evaluate(() => {
      const el = document.getElementById('swipe');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
    });
    await sleep(1500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'swipe-1396.png') });
    console.log('Saved swipe-1396.png');

    // 3. swipe-1396-result.png (swipe through 5 cards)
    console.log('Swiping through cards for swipe-1396-result.png...');
    for (let i = 0; i < 5; i++) {
      if (i % 2 === 0) {
        await page.evaluate(() => {
          const btn = document.querySelector('.btn-stop');
          if (btn && btn.click) btn.click();
        });
      } else {
        await page.evaluate(() => {
          const btn = document.querySelector('.btn-scroll');
          if (btn && btn.click) btn.click();
        });
      }
      await sleep(400);
    }
    await page.waitForSelector('.swipe-result-box', { visible: true, timeout: 5000 });
    await sleep(600);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'swipe-1396-result.png') });
    console.log('Saved swipe-1396-result.png');

    // 4. before-after-1396.png
    console.log('Capturing before-after-1396.png at 1396x705...');
    await page.evaluate(() => {
      const el = document.getElementById('before-after');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
    });
    await sleep(1800);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'before-after-1396.png') });
    console.log('Saved before-after-1396.png');

    await page.close();

    // Mobile Captures at 390x844
    console.log('Capturing mobile screenshots at 390x844...');
    const mobilePage = await browser.newPage();
    mobilePage.on('console', (msg) => {
      const text = msg.text();
      console.log('MOBILE LOG:', text);
      if (msg.type() === 'error' && !text.includes('404')) {
        pageErrors.push(`Mobile Console Error: ${text}`);
      }
    });
    mobilePage.on('pageerror', (err) => {
      console.log('MOBILE ERROR:', err.message);
      pageErrors.push(`Mobile Page Error: ${err.message}`);
    });

    await mobilePage.setDefaultNavigationTimeout(60000);
    await mobilePage.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    await mobilePage.evaluateOnNewDocument(() => {
      localStorage.setItem('attention_lab_opening_seen', 'true');
    });
    await mobilePage.goto('http://localhost:3100', { waitUntil: 'networkidle0' });
    await sleep(2000);

    // 5. hooks-390.png
    console.log('Capturing hooks-390.png at 390x844...');
    await mobilePage.evaluate(() => {
      const el = document.getElementById('hooks');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
    });
    await sleep(1500);
    await mobilePage.screenshot({ path: path.join(SCREENSHOT_DIR, 'hooks-390.png') });
    console.log('Saved hooks-390.png');

    // 6. swipe-390.png
    console.log('Capturing swipe-390.png at 390x844...');
    await mobilePage.evaluate(() => {
      const el = document.getElementById('swipe');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
    });
    await sleep(1500);
    await mobilePage.screenshot({ path: path.join(SCREENSHOT_DIR, 'swipe-390.png') });
    console.log('Saved swipe-390.png');

    await mobilePage.close();

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
