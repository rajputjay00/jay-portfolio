import puppeteer from 'puppeteer-core';
import path from 'path';
import fs from 'fs';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const OUTPUT_DIR = path.resolve(process.cwd(), 'content', 'media', 'images');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function main() {
  console.log('Generating 15 dummy images at 1080x1350...');
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1350, deviceScaleFactor: 1 });

    for (let i = 1; i <= 15; i++) {
      const isDark = [4, 6, 9, 11, 13, 15].includes(i);
      const bg = isDark ? '#121214' : '#ECE8E1';
      const textCol = isDark ? '#F5EFE6' : '#121214';
      const barCol = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)';
      const accent = '#FF5A2B';
      const padIndex = String(i).padStart(2, '0');

      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              width: 1080px;
              height: 1350px;
              background: ${bg};
              color: ${textCol};
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              padding: 90px 80px;
            }
            .header {
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .tag {
              display: inline-flex;
              align-items: center;
              gap: 8px;
              font-size: 24px;
              font-weight: 700;
              letter-spacing: 0.15em;
              text-transform: uppercase;
              color: ${accent};
            }
            .dot {
              width: 14px;
              height: 14px;
              border-radius: 50%;
              background: ${accent};
            }
            .dummy-label {
              font-size: 26px;
              font-weight: 600;
              letter-spacing: 0.2em;
              opacity: 0.6;
            }
            .content {
              display: flex;
              flex-direction: column;
              gap: 32px;
            }
            .title-bar {
              height: 52px;
              background: ${barCol};
              border-radius: 8px;
              width: 75%;
            }
            .text-bar-long {
              height: 28px;
              background: ${barCol};
              border-radius: 6px;
              width: 90%;
            }
            .text-bar-med {
              height: 28px;
              background: ${barCol};
              border-radius: 6px;
              width: 65%;
            }
            .image-box {
              height: 520px;
              background: ${barCol};
              border-radius: 16px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 32px;
              font-weight: 700;
              letter-spacing: 0.15em;
              color: ${textCol};
              opacity: 0.45;
            }
            .footer {
              display: flex;
              justify-content: space-between;
              align-items: center;
              border-top: 2px solid ${barCol};
              padding-top: 36px;
            }
            .metrics-mock {
              display: flex;
              gap: 36px;
            }
            .metric-pill {
              height: 24px;
              width: 90px;
              background: ${barCol};
              border-radius: 12px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="tag"><div class="dot"></div> ATTENTION LAB</div>
            <div class="dummy-label">DUMMY ${padIndex}</div>
          </div>

          <div class="content">
            <div class="title-bar"></div>
            <div class="text-bar-long"></div>
            <div class="text-bar-med"></div>
            <div class="image-box">SAMPLE POST ${padIndex}</div>
          </div>

          <div class="footer">
            <div class="metrics-mock">
              <div class="metric-pill"></div>
              <div class="metric-pill"></div>
              <div class="metric-pill"></div>
            </div>
            <div style="font-size: 22px; opacity: 0.5; font-weight: 500;">1080 × 1350</div>
          </div>
        </body>
        </html>
      `;

      await page.setContent(html, { waitUntil: 'load' });
      const filename = `dummy-${padIndex}.jpg`;
      const outPath = path.join(OUTPUT_DIR, filename);
      await page.screenshot({ path: outPath, type: 'jpeg', quality: 90 });
      console.log(`Saved ${filename}`);

      // Also copy to feed-XX.jpg
      fs.copyFileSync(outPath, path.join(OUTPUT_DIR, `feed-${padIndex}.jpg`));
    }

    // Copy aliases for case study heroes and range wall
    fs.copyFileSync(path.join(OUTPUT_DIR, 'dummy-01.jpg'), path.join(OUTPUT_DIR, 'creativefuel-hero.jpg'));
    fs.copyFileSync(path.join(OUTPUT_DIR, 'dummy-02.jpg'), path.join(OUTPUT_DIR, 'brand-hero.jpg'));
    fs.copyFileSync(path.join(OUTPUT_DIR, 'dummy-03.jpg'), path.join(OUTPUT_DIR, 'sfc-hero.jpg'));
    fs.copyFileSync(path.join(OUTPUT_DIR, 'dummy-04.jpg'), path.join(OUTPUT_DIR, 'campus-hero.jpg'));
    fs.copyFileSync(path.join(OUTPUT_DIR, 'dummy-05.jpg'), path.join(OUTPUT_DIR, 'community-01.jpg'));
    fs.copyFileSync(path.join(OUTPUT_DIR, 'dummy-06.jpg'), path.join(OUTPUT_DIR, 'character-01.jpg'));

    console.log('Successfully generated all dummy images and aliases!');
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error('Image generation error:', err);
  process.exit(1);
});
