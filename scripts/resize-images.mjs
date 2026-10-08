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
  const files = fs.readdirSync(srcDir).filter((f) => f.endsWith('.jpg') || f.endsWith('.png'));

  for (const file of files) {
    const srcFilePath = path.join(srcDir, file);
    const destFilePath = path.join(targetDir, file);
    const fileData = fs.readFileSync(srcFilePath);
    const base64 = `data:image/jpeg;base64,${fileData.toString('base64')}`;

    const resizedBase64 = await page.evaluate(async (dataUri) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const targetWidth = Math.min(800, img.width);
          const targetHeight = Math.round((img.height / img.width) * targetWidth);
          canvas.width = targetWidth;
          canvas.height = targetHeight;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
          resolve(canvas.toDataURL('image/jpeg', 0.88));
        };
        img.src = dataUri;
      });
    }, base64);

    const buffer = Buffer.from(resizedBase64.replace(/^data:image\/jpeg;base64,/, ''), 'base64');
    fs.writeFileSync(destFilePath, buffer);
    console.log(`Resized ${file} from content/media/images to public/media/images (${buffer.length} bytes)`);
  }

  await browser.close();
  console.log('Images successfully processed and written to public/media/images (originals untouched in content/media/images)!');
}

main();
