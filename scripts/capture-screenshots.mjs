import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';
import path from 'path';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const SCREENSHOT_DIR = path.resolve(process.cwd(), 'screenshots');

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

function getJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

class CDPClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.msgId = 1;
    this.callbacks = new Map();
  }

  async connect() {
    const { WebSocket } = await import('ws').catch(async () => {
      // If ws is not installed, use built-in WebSocket if available in node 24
      return { WebSocket: globalThis.WebSocket };
    });
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.wsUrl);
      this.ws.onopen = () => resolve();
      this.ws.onerror = reject;
      this.ws.onmessage = (evt) => {
        const msg = JSON.parse(evt.data);
        if (msg.id && this.callbacks.has(msg.id)) {
          const cb = this.callbacks.get(msg.id);
          this.callbacks.delete(msg.id);
          if (msg.error) cb.reject(msg.error);
          else cb.resolve(msg.result);
        }
      };
    });
  }

  send(method, params = {}) {
    const id = this.msgId++;
    return new Promise((resolve, reject) => {
      this.callbacks.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async captureScreenshot(filename) {
    const res = await this.send('Page.captureScreenshot', { format: 'png' });
    const buffer = Buffer.from(res.data, 'base64');
    const outPath = path.join(SCREENSHOT_DIR, filename);
    fs.writeFileSync(outPath, buffer);
    console.log(`Saved screenshot: ${filename}`);
  }

  async evaluate(expression) {
    const res = await this.send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    return res.result ? res.result.value : null;
  }
}

async function run() {
  const browserProc = spawn(EDGE_PATH, [
    '--headless=new',
    '--remote-debugging-port=9222',
    '--disable-gpu-sandbox',
    '--enable-webgl',
    '--use-gl=angle',
    '--window-size=1440,900',
    'about:blank',
  ]);

  await sleep(1500);

  try {
    const targets = await getJson('http://127.0.0.1:9222/json');
    const pageTarget = targets.find((t) => t.type === 'page') || targets[0];
    const client = new CDPClient(pageTarget.webSocketDebuggerUrl);
    await client.connect();

    await client.send('Page.enable');
    await client.send('Runtime.enable');
    await client.send('Emulation.setDeviceMetricsOverride', {
      width: 1440,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false,
    });

    // Clear seen flag before navigating
    await client.send('Page.navigate', { url: 'http://localhost:3000' });
    await sleep(600);
    await client.evaluate(`localStorage.removeItem('attention_lab_opening_seen'); location.reload();`);

    // Wait for reload and sequence to start
    console.log('Capturing opening sequence lines...');
    // Line 1: STOP. (starts around 4.5s)
    await sleep(4800);
    await client.captureScreenshot('opening-01-stop.png');

    // Line 2: STOP. YOU DID. (starts around 5.5s)
    await sleep(1100);
    await client.captureScreenshot('opening-02-youdid.png');

    // Line 3: That's the job. (starts around 6.5s)
    await sleep(1100);
    await client.captureScreenshot('opening-03-tagline.png');

    // Wait for opening to complete and hero to reveal
    await sleep(2500);
    await client.captureScreenshot('hero-1440px.png');

    // Switch to Mobile 390px
    console.log('Capturing mobile hero at 390px...');
    await client.send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true,
    });
    await sleep(1000);
    await client.captureScreenshot('hero-390px.png');

    // Measure WebGL draw calls and triangle counts from renderer if available
    const stats = await client.evaluate(`(() => {
      const canvases = document.querySelectorAll('canvas');
      if (!canvases.length) return { drawCalls: 'N/A', triangles: 'N/A' };
      // Check R3F / Three.js gl context if accessible or estimate from geometry
      return {
        canvasFound: true,
        width: window.innerWidth,
        height: window.innerHeight
      };
    })()`);
    console.log('Stats evaluation:', stats);

  } catch (err) {
    console.error('Error during capture:', err);
  } finally {
    browserProc.kill();
  }
}

run();
