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

async function runHeroExitTests() {
  console.log('Launching browser for Hero Exit tests...');
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
    // ==========================================
    // 1. DESKTOP TEST @ 1396x705
    // ==========================================
    console.log('\n--- 1. TESTING HERO EXIT AT 1396x705 ---');
    const page = await browser.newPage();
    page.on('console', (msg) => {
      const text = msg.text();
      if (msg.type() === 'error' && !text.includes('404')) {
        console.error('DESKTOP CONSOLE ERROR:', text);
        pageErrors.push(`[1396x705] ${text}`);
      }
    });
    page.on('pageerror', (err) => {
      console.error('DESKTOP PAGE ERROR:', err.message);
      pageErrors.push(`[1396x705] ${err.message}`);
    });

    await page.setViewport({ width: 1396, height: 705 });
    await page.evaluateOnNewDocument(() => {
      localStorage.setItem('attention_lab_opening_seen', 'true');
    });

    await page.goto('http://localhost:3100', { waitUntil: 'networkidle0' });
    await sleep(2000);

    // Verify hover at top (progress 0)
    console.log('Testing mouse hover over feed at top (progress 0)...');
    await page.mouse.move(950, 350);
    await sleep(600);

    // 1. hero-exit-0.png: Hero at progress 0
    console.log('Capturing hero-exit-0.png at progress 0...');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'hero-exit-0.png') });

    // Helper to scroll hero trigger
    const scrollHeroProgress = async (progress) => {
      await page.evaluate((prog) => {
        const heroEl = document.getElementById('hero');
        const st = window.ScrollTrigger?.getAll().find(t => t.trigger === heroEl || t.vars.trigger === heroEl || heroEl?.contains(t.trigger));
        let targetScroll = 0;
        if (st) {
          targetScroll = st.start + (st.end - st.start) * prog;
        } else {
          targetScroll = window.innerHeight * prog;
        }

        if (window.__lenis) {
          window.__lenis.scrollTo(targetScroll, { immediate: true });
        } else {
          window.scrollTo({ top: targetScroll, behavior: 'instant' });
        }
        window.ScrollTrigger?.update();
      }, progress);
      await sleep(700);
    };

    // 2. hero-exit-3.png: Hero at progress 0.3
    console.log('Capturing hero-exit-3.png at progress 0.3...');
    await scrollHeroProgress(0.3);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'hero-exit-3.png') });

    // 3. hero-exit-7.png: Hero at progress 0.7
    console.log('Capturing hero-exit-7.png at progress 0.7...');
    await scrollHeroProgress(0.7);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'hero-exit-7.png') });

    // Scroll back up to progress 0 to confirm reverse scroll
    console.log('Testing reverse scroll back to top...');
    await scrollHeroProgress(0.0);
    await sleep(500);

    await page.close();

    // ==========================================
    // 2. MOBILE TEST @ 390x844
    // ==========================================
    console.log('\n--- 2. TESTING HERO EXIT AT 390x844 ---');
    const mobilePage = await browser.newPage();
    mobilePage.on('console', (msg) => {
      const text = msg.text();
      if (msg.type() === 'error' && !text.includes('404')) {
        console.error('MOBILE CONSOLE ERROR:', text);
        pageErrors.push(`[390x844] ${text}`);
      }
    });
    await mobilePage.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    await mobilePage.goto('http://localhost:3100', { waitUntil: 'networkidle0' });
    await sleep(1500);

    // Scroll through hero on mobile
    await mobilePage.evaluate(async () => {
      for (let y = 0; y <= window.innerHeight; y += 150) {
        if (window.__lenis) window.__lenis.scrollTo(y, { immediate: true });
        else window.scrollTo(0, y);
        await new Promise(r => setTimeout(r, 40));
      }
    });

    await mobilePage.close();

    console.log('\n================ SUMMARY ================');
    console.log(`Console Errors: ${pageErrors.length}`);
    if (pageErrors.length > 0) {
      console.log('Errors:', pageErrors);
    } else {
      console.log('CLEAN CONSOLE - ZERO ERRORS');
    }
  } catch (err) {
    console.error('Hero Exit test failed:', err);
  } finally {
    await browser.close();
  }
}

runHeroExitTests();
