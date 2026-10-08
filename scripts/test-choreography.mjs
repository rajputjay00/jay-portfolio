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

async function runTests() {
  console.log('Launching browser for tests...');
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
    console.log('\n--- 1. TESTING AT 1396x705 ---');
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

    // Verify page starts at top
    const initialScrollY = await page.evaluate(() => window.scrollY);
    console.log(`Initial scroll position: ${initialScrollY}px (should be 0)`);

    // Helper to scroll to trigger progress using window.__lenis
    const scrollToProgress = async (selector, progress) => {
      await page.evaluate(async ({ sel, prog }) => {
        const el = document.querySelector(sel);
        if (!el) return;
        // Find ScrollTrigger for this element
        const st = window.ScrollTrigger?.getAll().find(t => t.trigger === el || t.vars.trigger === el || el.contains(t.trigger));
        let targetScroll = 0;
        if (st) {
          targetScroll = st.start + (st.end - st.start) * prog;
        } else {
          targetScroll = el.offsetTop + el.clientHeight * prog;
        }

        if (window.__lenis) {
          window.__lenis.scrollTo(targetScroll, { immediate: true });
        } else {
          window.scrollTo({ top: targetScroll, behavior: 'instant' });
        }
        window.ScrollTrigger?.update();
      }, { sel: selector, prog: progress });
      await sleep(700);
    };

    // 1. hero-exit-mid.png: Mid hero exit (progress 0.45)
    console.log('Capturing hero-exit-mid.png...');
    await scrollToProgress('#hero', 0.45);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'hero-exit-mid.png') });

    // 2. proof-stage-1.png: Proof section stage 1 (first value 401K alone in center, progress 0.08)
    console.log('Capturing proof-stage-1.png...');
    await scrollToProgress('#proof', 0.08);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'proof-stage-1.png') });

    // 3. proof-stage-final.png: Proof section final state (all 3 values landed, progress 0.95)
    console.log('Capturing proof-stage-final.png...');
    await scrollToProgress('#proof', 0.95);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'proof-stage-final.png') });

    // 4. cases-sideways.png: Case studies sideways section (progress 0.35)
    console.log('Capturing cases-sideways.png...');
    await scrollToProgress('#work', 0.35);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'cases-sideways.png') });

    // 5. interlude-1.png: Statement interlude 1 (progress 0.6)
    console.log('Capturing interlude-1.png...');
    await scrollToProgress('#interlude-1', 0.60);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'interlude-1.png') });

    // 6. range-alive.png: Range wall (progress 0.3)
    console.log('Capturing range-alive.png...');
    await scrollToProgress('#range', 0.30);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'range-alive.png') });

    // Test Message Me section buttons clickable
    console.log('Testing Message Me interactive buttons...');
    await page.evaluate(() => {
      if (window.__lenis) {
        window.__lenis.scrollTo('#message', { immediate: true });
      } else {
        const el = document.getElementById('message');
        if (el) el.scrollIntoView({ behavior: 'instant' });
      }
      window.ScrollTrigger?.update();
    });
    await sleep(800);

    const buttonsWorking = await page.evaluate(() => {
      const btnHiring = Array.from(document.querySelectorAll('button, .reply-btn')).find(b => b.textContent?.includes("hiring"));
      const btnProject = Array.from(document.querySelectorAll('button, .reply-btn')).find(b => b.textContent?.includes("project"));
      if (!btnHiring || !btnProject) return { success: false, reason: 'buttons not found' };

      const rect = btnHiring.getBoundingClientRect();
      const topEl = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
      const isTop = topEl === btnHiring || btnHiring.contains(topEl);
      return { success: isTop, topTag: topEl?.tagName, topClass: topEl?.className };
    });
    console.log('Message me buttons test:', buttonsWorking);

    // ==========================================
    // 2. FPS BENCHMARK (15s continuous scroll)
    // ==========================================
    console.log('\n--- 2. RUNNING 15s FPS BENCHMARK AT 1396x705 ---');
    await scrollToProgress('#hero', 0);

    const fpsStats = await page.evaluate(async () => {
      return new Promise((resolve) => {
        let frames = 0;
        let lastTime = performance.now();
        const fpsHistory = [];
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        const startTime = performance.now();
        const totalDuration = 15000; // 15 seconds

        function onFrame(now) {
          frames++;
          const delta = now - lastTime;
          if (delta >= 1000) {
            const currentFps = (frames * 1000) / delta;
            fpsHistory.push(currentFps);
            frames = 0;
            lastTime = now;
          }

          const elapsed = now - startTime;
          const progress = (elapsed % 7500) / 7500;
          const direction = Math.floor(elapsed / 7500) % 2 === 0 ? 1 : 0;
          const targetY = direction === 1 ? progress * maxScroll : (1 - progress) * maxScroll;
          if (window.__lenis) {
            window.__lenis.scrollTo(targetY, { immediate: true });
          } else {
            window.scrollTo(0, targetY);
          }

          if (elapsed < totalDuration) {
            requestAnimationFrame(onFrame);
          } else {
            const avgFps = fpsHistory.reduce((a, b) => a + b, 0) / (fpsHistory.length || 1);
            const minFps = Math.min(...fpsHistory);
            resolve({
              avgFps: Math.round(avgFps),
              minFps: Math.round(minFps),
              history: fpsHistory.map(f => Math.round(f)),
            });
          }
        }

        requestAnimationFrame(onFrame);
      });
    });

    console.log(`FPS Benchmark Result: Average FPS = ${fpsStats.avgFps}, Lowest FPS = ${fpsStats.minFps}`);
    console.log('FPS timeline:', fpsStats.history.join(', '));

    await page.close();

    // ==========================================
    // 3. DESKTOP TEST @ 1440x900
    // ==========================================
    console.log('\n--- 3. TESTING AT 1440x900 ---');
    const page1440 = await browser.newPage();
    page1440.on('console', (msg) => {
      const text = msg.text();
      if (msg.type() === 'error' && !text.includes('404')) {
        console.error('1440x900 CONSOLE ERROR:', text);
        pageErrors.push(`[1440x900] ${text}`);
      }
    });
    await page1440.setViewport({ width: 1440, height: 900 });
    await page1440.goto('http://localhost:3100', { waitUntil: 'networkidle0' });
    await sleep(1500);

    // Scroll through entire page at 1440x900
    await page1440.evaluate(async () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      for (let y = 0; y <= maxScroll; y += 400) {
        if (window.__lenis) window.__lenis.scrollTo(y, { immediate: true });
        else window.scrollTo(0, y);
        await new Promise(r => setTimeout(r, 40));
      }
    });
    await page1440.close();

    // ==========================================
    // 4. MOBILE TEST @ 390x844
    // ==========================================
    console.log('\n--- 4. TESTING AT 390x844 ---');
    const page390 = await browser.newPage();
    page390.on('console', (msg) => {
      const text = msg.text();
      if (msg.type() === 'error' && !text.includes('404')) {
        console.error('390x844 CONSOLE ERROR:', text);
        pageErrors.push(`[390x844] ${text}`);
      }
    });
    await page390.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    await page390.goto('http://localhost:3100', { waitUntil: 'networkidle0' });
    await sleep(1500);

    // Scroll down gradually
    await page390.evaluate(async () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      for (let y = 0; y <= maxScroll; y += 300) {
        if (window.__lenis) window.__lenis.scrollTo(y, { immediate: true });
        else window.scrollTo(0, y);
        await new Promise(r => setTimeout(r, 30));
      }
    });

    console.log('Capturing full-page-390.png...');
    await page390.screenshot({
      path: path.join(SCREENSHOT_DIR, 'full-page-390.png'),
      fullPage: true,
    });
    await page390.close();

    console.log('\n================ SUMMARY ================');
    console.log(`Console Errors: ${pageErrors.length}`);
    if (pageErrors.length > 0) {
      console.log('Errors:', pageErrors);
    } else {
      console.log('CLEAN CONSOLE - ZERO ERRORS');
    }
  } catch (err) {
    console.error('Test execution failed:', err);
  } finally {
    await browser.close();
  }
}

runTests();
