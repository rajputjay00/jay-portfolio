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

async function capture() {
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

  try {
    // 1. Desktop Viewport (1396x705)
    console.log('--- CAPTURING DESKTOP (1396x705) ---');
    const page = await browser.newPage();
    await page.setViewport({ width: 1396, height: 705 });
    await page.evaluateOnNewDocument(() => {
      localStorage.setItem('attention_lab_opening_seen', 'true');
    });

    await page.goto('http://localhost:3100', { waitUntil: 'domcontentloaded' });
    await sleep(3000);

    // Range wall (1396x705)
    console.log('Capturing range-1396.png...');
    await page.evaluate(() => {
      const el = document.getElementById('range');
      if (window.__lenis) window.__lenis.scrollTo(el, { immediate: true });
      else if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
    });
    await sleep(1500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'range-1396.png') });

    // Case study cards (1396x705)
    console.log('Capturing cases-1396.png...');
    await page.evaluate(() => {
      const el = document.getElementById('work');
      if (window.__lenis) window.__lenis.scrollTo(el, { immediate: true });
      else if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
    });
    await sleep(1500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'cases-1396.png') });

    // Open case study reader modal (1396x705)
    console.log('Opening case study reader for modal-1396.png...');
    await page.evaluate(() => {
      const card = document.querySelector('.desktop-sideways-container .case-card');
      if (card) card.click();
    });
    await sleep(1500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'modal-1396.png') });

    // Close modal
    await page.evaluate(() => {
      const closeBtn = document.querySelector('.story-close-btn');
      if (closeBtn) closeBtn.click();
    });
    await sleep(800);

    // Experience section (1396x705)
    console.log('Capturing experience-1396.png...');
    await page.evaluate(() => {
      const el = document.querySelector('.experience-block');
      if (window.__lenis) window.__lenis.scrollTo(el, { immediate: true, offset: -60 });
      else if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
    });
    await sleep(1500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'experience-1396.png') });

    await page.close();

    // 2. Mobile Viewport (390x844)
    console.log('--- CAPTURING MOBILE (390x844) ---');
    const mobilePage = await browser.newPage();
    await mobilePage.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    await mobilePage.evaluateOnNewDocument(() => {
      localStorage.setItem('attention_lab_opening_seen', 'true');
    });

    await mobilePage.goto('http://localhost:3100', { waitUntil: 'domcontentloaded' });
    await sleep(3000);

    // Range wall (390x844)
    console.log('Capturing range-390.png...');
    await mobilePage.evaluate(() => {
      const el = document.getElementById('range');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
    });
    await sleep(1500);
    await mobilePage.screenshot({ path: path.join(SCREENSHOT_DIR, 'range-390.png') });

    // Case study cards (390x844)
    console.log('Capturing cases-390.png...');
    await mobilePage.evaluate(() => {
      const el = document.getElementById('work');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
    });
    await sleep(1500);
    await mobilePage.screenshot({ path: path.join(SCREENSHOT_DIR, 'cases-390.png') });

    // Open case study reader modal (390x844)
    console.log('Opening case study reader for modal-390.png...');
    await mobilePage.evaluate(() => {
      const card = document.querySelector('.mobile-grid-container .case-card');
      if (card) card.click();
    });
    await sleep(1500);
    await mobilePage.screenshot({ path: path.join(SCREENSHOT_DIR, 'modal-390.png') });

    // Close modal
    await mobilePage.evaluate(() => {
      const closeBtn = document.querySelector('.story-close-btn');
      if (closeBtn) closeBtn.click();
    });
    await sleep(800);

    // Experience section (390x844)
    console.log('Capturing experience-390.png...');
    await mobilePage.evaluate(() => {
      const el = document.querySelector('.experience-block');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
    });
    await sleep(1500);
    await mobilePage.screenshot({ path: path.join(SCREENSHOT_DIR, 'experience-390.png') });

    await mobilePage.close();

    console.log('All 8 screenshots successfully captured.');
  } catch (err) {
    console.error('Capture error:', err);
  } finally {
    await browser.close();
  }
}

capture();
