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

    // Scroll to Case studies
    await page.evaluate(() => {
      const el = document.getElementById('work');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
    });
    await sleep(1000);

    // Open first Case Study Card
    console.log('Opening first case study card...');
    await page.evaluate(() => {
      const card = document.querySelector('.case-card');
      if (card && card.click) card.click();
    });
    await page.waitForSelector('.story-viewer-dialog', { visible: true, timeout: 5000 });
    await sleep(800);

    // 1. story-1396-part1.png
    console.log('Capturing story-1396-part1.png at 1396x705...');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'story-1396-part1.png') });
    console.log('Saved story-1396-part1.png');

    // Advance to Part 2 then Part 3
    console.log('Navigating to Part 3...');
    await page.keyboard.press('ArrowRight');
    await sleep(600);
    await page.keyboard.press('ArrowRight');
    await sleep(600);

    // 2. story-1396-part3.png
    console.log('Capturing story-1396-part3.png at 1396x705...');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'story-1396-part3.png') });
    console.log('Saved story-1396-part3.png');

    // Test moving through parts 4 and 5
    console.log('Testing parts 4 and 5...');
    await page.keyboard.press('ArrowRight');
    await sleep(400);
    await page.keyboard.press('ArrowRight');
    await sleep(400);

    // Close reader via Escape
    await page.keyboard.press('Escape');
    await sleep(600);
    await page.close();

    // 3. story-390-part3.png (mobile)
    console.log('Capturing story-390-part3.png at 390x844...');
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
    await mobilePage.goto('http://localhost:3100#work', { waitUntil: 'networkidle0' });
    await sleep(2000);

    await mobilePage.evaluate(() => {
      const card = document.querySelector('.case-card');
      if (card && card.click) card.click();
    });
    await mobilePage.waitForSelector('.story-viewer-dialog', { visible: true, timeout: 5000 });
    await sleep(800);

    // Tap right side or press right arrow to reach Part 3
    await mobilePage.keyboard.press('ArrowRight');
    await sleep(500);
    await mobilePage.keyboard.press('ArrowRight');
    await sleep(500);

    await mobilePage.screenshot({ path: path.join(SCREENSHOT_DIR, 'story-390-part3.png') });
    console.log('Saved story-390-part3.png');

    // Move through remaining parts on mobile too
    await mobilePage.keyboard.press('ArrowRight');
    await sleep(300);
    await mobilePage.keyboard.press('ArrowRight');
    await sleep(300);
    await mobilePage.keyboard.press('Escape');
    await sleep(400);

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
