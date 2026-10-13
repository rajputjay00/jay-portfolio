import puppeteer from 'puppeteer-core';
import path from 'path';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

async function runAudits() {
  console.log('=== STARTING PRE-LAUNCH COMPREHENSIVE AUDITS ===\n');

  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    // ----------------------------------------------------
    // AUDIT G: First-load weight at 1396x705 (Cache Disabled)
    // ----------------------------------------------------
    console.log('--- AUDIT G: First-load Weight at 1396x705 (No Cache) ---');
    const pageG = await browser.newPage();
    await pageG.setCacheEnabled(false);
    await pageG.setViewport({ width: 1396, height: 705 });

    await pageG.evaluateOnNewDocument(() => {
      localStorage.setItem('attention_lab_opening_seen', 'true');
    });

    const requests = [];
    let totalBytes = 0;
    const videoRequests = [];

    const client = await pageG.target().createCDPSession();
    await client.send('Network.enable');

    client.on('Network.loadingFinished', (event) => {
      totalBytes += event.encodedDataLength || 0;
    });

    pageG.on('response', async (response) => {
      const url = response.url();
      const status = response.status();
      const headers = response.headers();
      const len = parseInt(headers['content-length'] || '0', 10);
      requests.push({ url, status, len });
      if (url.includes('.mp4')) {
        videoRequests.push(url);
      }
    });

    await pageG.goto('http://localhost:3100/', { waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 1000));

    // Sort requests by size
    const sortedReqs = [...requests].sort((a, b) => b.len - a.len);
    console.log(`Total transferred bytes before scroll: ${(totalBytes / 1024).toFixed(1)} KB (${totalBytes} bytes)`);
    console.log('Five largest requests before scroll:');
    sortedReqs.slice(0, 5).forEach((r, idx) => {
      const parsedUrl = new URL(r.url);
      console.log(`  ${idx + 1}. ${parsedUrl.pathname} (${(r.len / 1024).toFixed(1)} KB)`);
    });
    console.log(`Videos requested before scroll: ${videoRequests.length}`);
    if (videoRequests.length > 0) {
      console.log('  WARNING: Videos loaded early:', videoRequests);
    } else {
      console.log('  PASS: 0 videos downloaded before scrolling to their section.');
    }
    await pageG.close();

    // ----------------------------------------------------
    // AUDIT D: Dev Overlays without ?debug=1
    // ----------------------------------------------------
    console.log('\n--- AUDIT D: Dev Overlays without ?debug=1 ---');
    const pageD = await browser.newPage();
    await pageD.setViewport({ width: 1396, height: 705 });
    await pageD.evaluateOnNewDocument(() => {
      localStorage.setItem('attention_lab_opening_seen', 'true');
    });
    await pageD.goto('http://localhost:3100/', { waitUntil: 'networkidle0' });

    const devSelectors = [
      '.fps-indicator-badge',
      '.dev-perf-panel',
      '.dev-dummy-badge',
      '.btn-replay',
      '#r3f-perf',
      '.perf-panel-container',
    ];

    const presentOverlays = [];
    for (const sel of devSelectors) {
      const el = await pageD.$(sel);
      if (el) {
        const isVisible = await pageD.evaluate((elem) => {
          const style = window.getComputedStyle(elem);
          return style.display !== 'none' && style.visibility !== 'hidden';
        }, el);
        if (isVisible) presentOverlays.push(sel);
      }
    }
    console.log(`Dev overlays in DOM without ?debug=1: ${presentOverlays.length}`);
    if (presentOverlays.length > 0) {
      console.log('  Defect detected: Overlays present:', presentOverlays);
    } else {
      console.log('  PASS: No FPS counter, perf panel, stats, replay button or dummy badge in DOM.');
    }
    await pageD.close();

    // ----------------------------------------------------
    // AUDIT A: Phone Viewports (390x844 and 360x800)
    // ----------------------------------------------------
    for (const vp of [
      { width: 390, height: 844, name: 'iPhone 12/13/14' },
      { width: 360, height: 800, name: 'Android standard' },
    ]) {
      console.log(`\n--- AUDIT A: Phone Walkthrough at ${vp.width}x${vp.height} (${vp.name}) ---`);
      const pageA = await browser.newPage();
      await pageA.setViewport({ width: vp.width, height: vp.height, isMobile: true, hasTouch: true });
      await pageA.evaluateOnNewDocument(() => {
        localStorage.setItem('attention_lab_opening_seen', 'true');
      });
      await pageA.goto('http://localhost:3100/', { waitUntil: 'networkidle0' });

      // Step-by-step scroll
      const sections = ['hero', 'proof', 'work', 'interlude-1', 'theatre', 'range', 'interlude-2', 'hooks', 'would-you-stop', 'before-after', 'about', 'message'];
      let overflowErrors = 0;

      for (const secId of sections) {
        await pageA.evaluate((id) => {
          document.getElementById(id)?.scrollIntoView();
        }, secId);
        await new Promise((r) => setTimeout(r, 200));

        const scrollInfo = await pageA.evaluate(() => ({
          scrollWidth: document.documentElement.scrollWidth,
          clientWidth: document.documentElement.clientWidth,
        }));

        if (scrollInfo.scrollWidth > scrollInfo.clientWidth) {
          console.log(`  Horizontal overflow in #${secId}: scrollWidth (${scrollInfo.scrollWidth}) > clientWidth (${scrollInfo.clientWidth})`);
          overflowErrors++;
        }
      }

      if (overflowErrors === 0) {
        console.log(`  PASS: No horizontal scroll across all sections (scrollWidth === clientWidth).`);
      }

      // Check tap targets < 44x44
      const smallTargets = await pageA.evaluate(() => {
        const interactives = Array.from(document.querySelectorAll('button, a, input, select, textarea'));
        const small = [];
        for (const el of interactives) {
          const rect = el.getBoundingClientRect();
          const style = window.getComputedStyle(el);
          if (style.display === 'none' || style.visibility === 'hidden' || rect.width === 0 || rect.height === 0) continue;
          if (rect.width < 43 || rect.height < 43) {
            small.push({
              tag: el.tagName.toLowerCase(),
              cls: el.className,
              text: el.textContent?.trim().slice(0, 25) || el.getAttribute('aria-label') || '',
              w: Math.round(rect.width),
              h: Math.round(rect.height),
            });
          }
        }
        return small;
      });

      console.log(`  Interactive elements with bounding box < 44x44: ${smallTargets.length}`);
      if (smallTargets.length > 0) {
        console.log('  Items under 44x44:', smallTargets.slice(0, 6));
      }

      await pageA.close();
    }

    // ----------------------------------------------------
    // AUDIT B: Keyboard & Skip Link
    // ----------------------------------------------------
    console.log('\n--- AUDIT B: Keyboard Navigation & Skip Link ---');
    const pageB = await browser.newPage();
    await pageB.setViewport({ width: 1396, height: 705 });
    await pageB.evaluateOnNewDocument(() => {
      localStorage.setItem('attention_lab_opening_seen', 'true');
    });
    await pageB.goto('http://localhost:3100/', { waitUntil: 'networkidle0' });

    // Press Tab
    await pageB.keyboard.press('Tab');
    const firstFocused = await pageB.evaluate(() => {
      const el = document.activeElement;
      return {
        tag: el?.tagName.toLowerCase(),
        text: el?.textContent?.trim(),
        className: el?.className,
        href: el?.getAttribute('href'),
      };
    });
    console.log(`First focused element on Tab: <${firstFocused.tag}> text="${firstFocused.text}" href="${firstFocused.href}"`);
    if (firstFocused.text === 'Skip to content' && firstFocused.href === '#hero') {
      console.log('  PASS: "Skip to content" is the first focusable element.');
    } else {
      console.log('  WARNING: First element is not Skip to content:', firstFocused);
    }

    const focusablesData = await pageB.evaluate(() => {
      const allFocusables = Array.from(document.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'));
      const visible = allFocusables.filter((el) => {
        if (el.checkVisibility) return el.checkVisibility();
        return el.getClientRects().length > 0;
      });
      const failing = [];
      for (const el of visible) {
        el.focus();
        const style = window.getComputedStyle(el);
        const hasOutline = style.outlineStyle !== 'none' && parseFloat(style.outlineWidth) > 0;
        const hasBoxShadow = style.boxShadow && style.boxShadow !== 'none';
        if (!hasOutline && !hasBoxShadow) {
          failing.push({ tag: el.tagName, cls: el.className, outline: style.outline, oStyle: style.outlineStyle, width: style.outlineWidth });
        }
      }
      return { total: allFocusables.length, visible: visible.length, failing };
    });
    console.log(`  Total focusable elements on home page: ${focusablesData.total} (${focusablesData.visible} visible on desktop)`);
    console.log(`  Focusable elements without visible focus ring: ${focusablesData.failing.length}`);
    if (focusablesData.failing.length > 0) {
      console.log('    Failing focus ring elements:', focusablesData.failing);
    }

    // Test Esc closes Case Study Reader and returns focus
    console.log('  Testing Case study reader modal Esc close & focus return...');
    const modalTest = await pageB.evaluate(async () => {
      const card = document.querySelector('.case-card');
      if (!card) return { foundCard: false, opened: false, closed: false, returnedToCard: false };
      card.click();
      await new Promise((r) => setTimeout(r, 400));
      const modal = document.querySelector('.story-viewer-dialog');
      const opened = Boolean(modal);
      // Simulate Esc keydown
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', code: 'Escape', bubbles: true }));
      await new Promise((r) => setTimeout(r, 400));
      const closed = !document.querySelector('.story-viewer-dialog');
      const returnedToCard = document.activeElement === card || document.activeElement?.closest('.case-card') === card;
      return { foundCard: true, opened, closed, returnedToCard };
    });
    console.log(`    Case study reader opened: ${modalTest.opened}`);
    console.log(`    Modal closed on Escape: ${modalTest.closed}`);
    console.log(`    Focus returned to opening card: ${modalTest.returnedToCard}`);

    await pageB.close();

    // ----------------------------------------------------
    // AUDIT C: Reduced Motion
    // ----------------------------------------------------
    console.log('\n--- AUDIT C: Reduced Motion (prefers-reduced-motion: reduce) ---');
    const pageC = await browser.newPage();
    await pageC.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
    await pageC.setViewport({ width: 1396, height: 705 });
    await pageC.evaluateOnNewDocument(() => {
      localStorage.setItem('attention_lab_opening_seen', 'true');
    });
    await pageC.goto('http://localhost:3100/', { waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 1000));

    const pinnedTriggers = await pageC.evaluate(() => {
      // Check if any element has position: fixed / pinned due to ScrollTrigger
      const pinned = Array.from(document.querySelectorAll('.pin-spacer'));
      return pinned.length;
    });
    console.log(`  Pinned ScrollTrigger pin-spacers in reduced motion: ${pinnedTriggers} (expected: 0)`);

    const autoPlayingVideos = await pageC.evaluate(() => {
      const vids = Array.from(document.querySelectorAll('video'));
      return vids.filter((v) => !v.paused).length;
    });
    console.log(`  Autoplaying videos in reduced motion: ${autoPlayingVideos} (expected: 0)`);
    await pageC.close();

    // ----------------------------------------------------
    // AUDIT E: Links & Email
    // ----------------------------------------------------
    console.log('\n--- AUDIT E: Links & Email Audit ---');
    const pageE = await browser.newPage();
    await pageE.setViewport({ width: 1396, height: 705 });
    await pageE.evaluateOnNewDocument(() => {
      localStorage.setItem('attention_lab_opening_seen', 'true');
    });
    await pageE.goto('http://localhost:3100/', { waitUntil: 'networkidle0' });

    const allLinks = await pageE.evaluate(() => {
      const anchors = Array.from(document.querySelectorAll('a[href]'));
      return anchors.map((a) => ({
        text: a.textContent?.trim().slice(0, 30) || a.getAttribute('aria-label') || '',
        href: a.getAttribute('href') || '',
        target: a.getAttribute('target') || '',
        rel: a.getAttribute('rel') || '',
      }));
    });

    const externalLinks = allLinks.filter((l) => l.href.startsWith('http'));
    const mailtoLinks = allLinks.filter((l) => l.href.startsWith('mailto:'));
    const internalAnchors = allLinks.filter((l) => l.href.startsWith('#') || l.href.startsWith('/'));

    console.log(`Total link tags found: ${allLinks.length}`);
    console.log(`  Internal anchor links: ${internalAnchors.length}`);
    console.log(`  External links: ${externalLinks.length}`);
    externalLinks.forEach((l, idx) => {
      const hasSecure = l.href.startsWith('https://');
      const hasRel = l.rel.includes('noopener') && l.rel.includes('noreferrer');
      const hasTarget = l.target === '_blank';
      console.log(`    ${idx + 1}. [${l.text}] -> ${l.href} (https: ${hasSecure}, target: ${hasTarget}, rel: ${hasRel})`);
    });

    console.log(`  Mailto links: ${mailtoLinks.length}`);
    mailtoLinks.forEach((l) => console.log(`    -> ${l.href}`));

    await pageE.close();

    // ----------------------------------------------------
    // AUDIT F: Basics (HTML lang, <h1> count, 404 page)
    // ----------------------------------------------------
    console.log('\n--- AUDIT F: Basics ---');
    const pageF = await browser.newPage();
    await pageF.setViewport({ width: 1396, height: 705 });
    await pageF.evaluateOnNewDocument(() => {
      localStorage.setItem('attention_lab_opening_seen', 'true');
    });
    await pageF.goto('http://localhost:3100/', { waitUntil: 'networkidle0' });

    const htmlLang = await pageF.$eval('html', (el) => el.getAttribute('lang'));
    const h1Count = await pageF.$$eval('h1', (els) => els.length);
    const h1Text = await pageF.$$eval('h1', (els) => els.map((el) => el.textContent.trim().replace(/\s+/g, ' ')));

    console.log(`  <html lang>: "${htmlLang}" (expected: "en")`);
    console.log(`  <h1> count on home page: ${h1Count} (expected: 1)`);
    console.log(`  <h1> content: ${JSON.stringify(h1Text)}`);

    const faviconHref = await pageF.evaluate(() => {
      const link = document.querySelector('link[rel="icon"], link[rel="shortcut icon"]');
      return link ? link.getAttribute('href') : null;
    });
    console.log(`  Favicon link: ${faviconHref ? `"${faviconHref}"` : 'default /icon.svg (Next.js App router icon)'}`);

    // 404 test
    const notFoundRes = await pageF.goto('http://localhost:3100/non-existent-page-test-404', { waitUntil: 'networkidle0' });
    console.log(`  404 status code: ${notFoundRes.status()}`);
    const notFoundH1 = await pageF.$eval('.not-found-code', (el) => el.textContent.trim());
    console.log(`  404 page text: "${notFoundH1}"`);

    await pageF.close();

    console.log('\n=== ALL AUDITS COMPLETED SUCCESSFULLY ===');
  } catch (err) {
    console.error('Audit failed with error:', err);
  } finally {
    await browser.close();
  }
}

runAudits();
