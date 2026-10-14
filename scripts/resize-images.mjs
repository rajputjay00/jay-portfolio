import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const srcDir = path.resolve(process.cwd(), 'content/media/images');
const targetDir = path.resolve(process.cwd(), 'public/media/images');

async function main() {
  if (!fs.existsSync(srcDir)) {
    console.log(`Source directory ${srcDir} does not exist.`);
    return;
  }
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  const targetFiles = ['icl_art1.jpg', 'sfc_art1.jpg'];

  const results = [];

  for (const file of targetFiles) {
    const srcFilePath = path.join(srcDir, file);
    if (!fs.existsSync(srcFilePath)) continue;
    const stat = fs.statSync(srcFilePath);

    const ext = path.extname(file).toLowerCase();
    const mime = 'image/jpeg';
    const fileData = fs.readFileSync(srcFilePath);
    const base64 = `data:${mime};base64,${fileData.toString('base64')}`;

    let quality = 0.80;
    let buffer;
    let finalDimensions = { width: 0, height: 0 };

    while (quality >= 0.50) {
      const res = await page.evaluate(async ({ dataUri, q }) => {
        return new Promise((resolve) => {
          const img = new Image();
          img.onload = () => {
            let w = img.naturalWidth || img.width;
            let h = img.naturalHeight || img.height;
            const maxSide = Math.max(w, h);
            if (maxSide > 1600) {
              const scale = 1600 / maxSide;
              w = Math.round(w * scale);
              h = Math.round(h * scale);
            }
            const canvas = document.createElement('canvas');
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, w, h);
            resolve({
              dataUrl: canvas.toDataURL('image/jpeg', q),
              width: w,
              height: h,
            });
          };
          img.src = dataUri;
        });
      }, { dataUri: base64, q: quality });

      buffer = Buffer.from(res.dataUrl.replace(/^data:image\/jpeg;base64,/, ''), 'base64');
      finalDimensions = { width: res.width, height: res.height };

      if (buffer.length < 290 * 1024) {
        break;
      }
      quality -= 0.03;
    }

    const outFileName = file;
    const outSrcPath = path.join(srcDir, outFileName);
    const outTargetPath = path.join(targetDir, outFileName);

    fs.writeFileSync(outSrcPath, buffer);
    fs.writeFileSync(outTargetPath, buffer);

    results.push({
      original: file,
      output: outFileName,
      beforeSize: stat.size,
      afterSize: buffer.length,
      quality: quality.toFixed(2),
      width: finalDimensions.width,
      height: finalDimensions.height,
    });
  }

  await browser.close();

  console.log('=== RE-ENCODED TARGET IMAGES ===');
  for (const r of results) {
    const beforeKb = (r.beforeSize / 1024).toFixed(1);
    const afterKb = (r.afterSize / 1024).toFixed(1);
    const pct = ((1 - r.afterSize / r.beforeSize) * 100).toFixed(1);
    console.log(`${r.original} (${beforeKb} KB) -> ${r.output} (${afterKb} KB, ${r.width}x${r.height}, q=${r.quality}) [-${pct}%]`);
  }
}

main();
