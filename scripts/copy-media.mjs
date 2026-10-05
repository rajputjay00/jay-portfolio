import fs from 'fs';
import path from 'path';

const projectRoot = process.cwd();
const possibleSourceDirs = [
  path.join(projectRoot, 'content', 'media'),
  path.join(projectRoot, 'content', 'content', 'media')
];
const targetDir = path.join(projectRoot, 'public', 'media');

function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Ensure public/media exists
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

for (const srcDir of possibleSourceDirs) {
  if (fs.existsSync(srcDir)) {
    copyRecursive(srcDir, targetDir);
    console.log(`[copy-media] Copied media assets from ${srcDir} to ${targetDir}`);
  }
}
