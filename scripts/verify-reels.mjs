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

async function run() {
  console.log('--- STARTING VERIFY REELS TEST ---');
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--enable-webgl',
      '--use-gl=angle',
      '--autoplay-policy=no-user-gesture-required',
      '--window-size=1396,705',
    ],
  });

  const errors = [];

  try {
    const page = await browser.newPage();
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const text = msg.text();
        console.log('PAGE ERROR LOG:', text);
        errors.push(text);
      }
    });
    page.on('pageerror', (err) => {
      console.log('UNCAUGHT PAGE ERROR:', err.message);
      errors.push(err.message);
    });

    // 1. OPENING SCREENSHOT (Fresh visitor without localStorage)
    console.log('Testing Opening Experience at 1396x705...');
    await page.setViewport({ width: 1396, height: 705 });
    await page.goto('http://localhost:3100?fresh=1', { waitUntil: 'domcontentloaded' });
    await sleep(1500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'opening.png') });
    console.log('Saved opening.png');

    // Wait for opening to complete or mark as seen
    await page.evaluate(() => {
      localStorage.setItem('attention_lab_opening_seen', 'true');
    });
    await page.goto('http://localhost:3100', { waitUntil: 'networkidle0' });
    await sleep(1500);

    // 2. RANGE WALL SCREENSHOT
    console.log('Testing Range Wall at 1396x705...');
    await page.evaluate(() => {
      const el = document.getElementById('range');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
    });
    await sleep(1000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'range-wall.png') });
    console.log('Saved range-wall.png');

    // 3. ONE REEL HOVERED SCREENSHOT
    console.log('Testing Reel Hover state...');
    const firstReelLink = await page.$('.reel-link-wrap');
    if (firstReelLink) {
      await firstReelLink.hover();
      await sleep(400);
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'reel-hover.png') });
      console.log('Saved reel-hover.png');
    }

    // 4. VERIFY REEL LINK PROPS AND ACCESSIBILITY
    const reelData = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('.reel-link-wrap'));
      return links.map(l => ({
        href: l.getAttribute('href'),
        target: l.getAttribute('target'),
        rel: l.getAttribute('rel'),
        label: l.getAttribute('aria-label'),
        hasBadge: Boolean(l.querySelector('.watch-ig-badge')),
        videoSrc: l.querySelector('video')?.getAttribute('src'),
        muted: l.querySelector('video')?.muted,
        loop: l.querySelector('video')?.loop,
        playsInline: l.querySelector('video')?.playsInline,
        preload: l.querySelector('video')?.preload,
      }));
    });

    console.log(`Found ${reelData.length} reel cards in Range Wall.`);
    reelData.forEach((r, idx) => {
      console.log(`Reel ${idx + 1}: ${r.label} | href: ${r.href} | video: ${r.videoSrc}`);
    });

    // 5. TEST AT 1440x900
    console.log('Testing at 1440x900...');
    await page.setViewport({ width: 1440, height: 900 });
    await sleep(600);

    // 6. TEST AT 390x844 (Mobile)
    console.log('Testing at 390x844...');
    await page.setViewport({ width: 390, height: 844 });
    await sleep(600);

    // 7. CHECK ACTIVE VIDEOS PLAYING
    const playingCount = await page.evaluate(() => {
      const vids = Array.from(document.querySelectorAll('video'));
      return vids.filter(v => !v.paused).length;
    });
    console.log(`Active playing videos count: ${playingCount} (Constraint: <= 3)`);

    console.log('Errors count:', errors.length);
  } catch (err) {
    console.error('Test execution failed:', err);
  } finally {
    await browser.close();
    console.log('--- TEST FINISHED ---');
  }
}

run();
