import puppeteer from 'puppeteer-core';
import path from 'path';
import fs from 'fs';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const PUBLIC_DIR = path.resolve(process.cwd(), 'public');
const PNG_PATH = path.join(PUBLIC_DIR, 'og.png');
const JPG_PATH = path.join(PUBLIC_DIR, 'og.jpg');

async function main() {
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--window-size=1200,630',
    ],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({
      width: 1200,
      height: 630,
      deviceScaleFactor: 1,
    });

    await page.evaluateOnNewDocument(() => {
      localStorage.setItem('attention_lab_opening_seen', 'true');
    });

    await page.goto('http://localhost:3100/og-card', { waitUntil: 'networkidle0' });

    // Wait for fonts
    await page.evaluate(async () => {
      if (document.fonts) {
        await document.fonts.ready;
      }
      // Wait for all images to complete loading
      const imgs = Array.from(document.querySelectorAll('img'));
      await Promise.all(
        imgs.map((img) => {
          if (img.complete) return Promise.resolve();
          return new Promise((resolve) => {
            img.onload = resolve;
            img.onerror = resolve;
          });
        })
      );
    });

    await new Promise((r) => setTimeout(r, 600));

    const cardElement = await page.$('#og-card');
    if (cardElement) {
      await cardElement.screenshot({
        path: PNG_PATH,
        type: 'png',
      });
    } else {
      await page.screenshot({
        path: PNG_PATH,
        type: 'png',
      });
    }

    const pngStats = fs.statSync(PNG_PATH);
    const pngSizeKb = pngStats.size / 1024;
    console.log(`Saved public/og.png (${pngSizeKb.toFixed(1)} KB)`);

    if (pngSizeKb > 500) {
      console.log(`PNG exceeds 500 KB, saving public/og.jpg at quality 88...`);
      if (cardElement) {
        await cardElement.screenshot({
          path: JPG_PATH,
          type: 'jpeg',
          quality: 88,
        });
      } else {
        await page.screenshot({
          path: JPG_PATH,
          type: 'jpeg',
          quality: 88,
        });
      }
      const jpgStats = fs.statSync(JPG_PATH);
      console.log(`Saved public/og.jpg (${(jpgStats.size / 1024).toFixed(1)} KB)`);
    }
  } finally {
    await browser.close();
  }
}

main();
