import fs from 'fs';
import path from 'path';

const CONTENT_DIR = path.resolve(process.cwd(), 'content');
const findings = [];

function scanValue(val, filePath, keyPath) {
  if (val === null || val === undefined) return;

  if (Array.isArray(val)) {
    val.forEach((item, index) => {
      scanValue(item, filePath, `${keyPath}[${index}]`);
    });
    return;
  }

  if (typeof val === 'object') {
    if (val.dummy === true) {
      findings.push({
        file: path.relative(process.cwd(), filePath),
        key: keyPath,
        value: JSON.stringify(val),
        reason: 'Object marked with "dummy": true',
      });
    }
    for (const [k, v] of Object.entries(val)) {
      scanValue(v, filePath, keyPath ? `${keyPath}.${k}` : k);
    }
    return;
  }

  if (typeof val === 'string') {
    if (val.includes('[DUMMY]') || val.includes('TODO') || val.includes('XX') || val.includes('@example.com') || val.includes('@yourhandle')) {
      findings.push({
        file: path.relative(process.cwd(), filePath),
        key: keyPath,
        value: val,
        reason: 'Contains placeholder marker ([DUMMY], TODO, XX, etc.)',
      });
    }
  }
}

function scanMarkdown(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('[DUMMY]') || trimmed.includes('[DUMMY]') || trimmed.includes('TODO') || trimmed.includes('XX')) {
      findings.push({
        file: path.relative(process.cwd(), filePath),
        key: `Line ${index + 1}`,
        value: trimmed,
        reason: 'Markdown line with [DUMMY] marker or placeholder',
      });
    }
  });
}

function walkDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'media') {
        walkDir(fullPath);
      }
    } else if (entry.isFile()) {
      if (entry.name.endsWith('.json')) {
        try {
          const json = JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
          scanValue(json, fullPath, '');
        } catch (err) {
          console.error(`Failed to parse JSON in ${fullPath}:`, err);
        }
      } else if (entry.name.endsWith('.md') && entry.name !== 'README.md') {
        scanMarkdown(fullPath);
      }
    }
  }
}

function main() {
  console.log('=============================================');
  console.log('        CHECK DUMMY CONTENT AUDIT            ');
  console.log('=============================================\n');

  walkDir(CONTENT_DIR);

  if (findings.length === 0) {
    console.log('✔ All content verified. No dummy data found.\n');
    process.exit(0);
  }

  console.log(`Found ${findings.length} dummy/placeholder entries in /content:\n`);

  findings.forEach((finding, idx) => {
    console.log(`[#${idx + 1}] ${finding.file} -> ${finding.key}`);
    console.log(`     Reason: ${finding.reason}`);
    console.log(`     Value:  ${finding.value}`);
  });

  console.log('\n---------------------------------------------');
  console.log(`❌ CHECK FAILED: Found ${findings.length} dummy values in /content.`);
  console.log('To release to production, replace all marked dummy values with verified client data.');
  console.log('---------------------------------------------\n');
  process.exit(1);
}

main();
