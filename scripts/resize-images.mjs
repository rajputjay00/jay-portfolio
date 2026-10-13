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
  const files = fs.readdirSync(srcDir).filter((f) => {
    const ext = path.extname(f).toLowerCase();
    return ext === '.jpg' || ext === '.jpeg' || ext === '.png';
  });

  const results = [];

  for (const file of files) {
    const srcFilePath = path.join(srcDir, file);
    const stat = fs.statSync(srcFilePath);
    if (stat.size <= 350 * 1024) {
      continue; // Under 350 KB, exempt
    }

    const ext = path.extname(file).toLowerCase();
    const baseName = path.basename(file, ext);
    const mime = ext === '.png' ? 'image/png' : 'image/jpeg';
    const fileData = fs.readFileSync(srcFilePath);
    const base64 = `data:${mime};base64,${fileData.toString('base64')}`;

    const reencodedBase64 = await page.evaluate(async (dataUri) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth || img.width;
          canvas.height = img.naturalHeight || img.height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', 0.82));
        };
        img.src = dataUri;
      });
    }, base64);

    const buffer = Buffer.from(reencodedBase64.replace(/^data:image\/jpeg;base64,/, ''), 'base64');
    const outFileName = `${baseName}.jpg`;
    const outSrcPath = path.join(srcDir, outFileName);
    const outTargetPath = path.join(targetDir, outFileName);

    fs.writeFileSync(outSrcPath, buffer);
    fs.writeFileSync(outTargetPath, buffer);

    if (ext === '.png' && outFileName !== file) {
      // Remove old .png file
      if (fs.existsSync(srcFilePath)) fs.unlinkSync(srcFilePath);
      const targetOldPng = path.join(targetDir, file);
      if (fs.existsSync(targetOldPng)) fs.unlinkSync(targetOldPng);
    }

    results.push({
      original: file,
      output: outFileName,
      beforeSize: stat.size,
      afterSize: buffer.length,
    });
  }

  await browser.close();

  console.log('=== RE-ENCODED IMAGES (QUALITY 82, ORIGINAL PIXEL SIZE) ===');
  for (const r of results) {
    const beforeKb = (r.beforeSize / 1024).toFixed(1);
    const afterKb = (r.afterSize / 1024).toFixed(1);
    const pct = ((1 - r.afterSize / r.beforeSize) * 100).toFixed(1);
    console.log(`${r.original} (${beforeKb} KB) -> ${r.output} (${afterKb} KB) [-${pct}%]`);
  }
}

main();
