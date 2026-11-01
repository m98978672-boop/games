import { createRequire } from 'node:module';
const require2 = createRequire(import.meta.url);
const puppeteer = require2('/tmp/node_modules/puppeteer-core');
const chromium = require2('/tmp/node_modules/@sparticuz/chromium');

const url = process.argv[2] || 'http://127.0.0.1:8123/index.html';
const out = process.argv[3] || '/tmp/shot.png';
const w = +(process.argv[4] || 1440);
const h = +(process.argv[5] || 810);

process.env.LD_LIBRARY_PATH = '/tmp/stubs';
const browser = await puppeteer.launch({
  args: ['--no-sandbox', '--no-zygote', '--disable-gpu', '--disable-dev-shm-usage', '--user-data-dir=/tmp/pprof', '--disable-crash-reporter', '--window-size=' + w + ',' + h],
  defaultViewport: { width: w, height: h, deviceScaleFactor: 1 },
  executablePath: '/tmp/chromium',
  headless: true,
  env: { ...process.env, LD_LIBRARY_PATH: '/tmp/stubs' },
});
const page = await browser.newPage();
const logs = [];
page.on('console', (m) => logs.push('[' + m.type() + '] ' + m.text()));
page.on('pageerror', (e) => logs.push('[pageerror] ' + e.message));
await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
await new Promise((r) => setTimeout(r, +(process.env.WAIT || 3500)));
await page.screenshot({ path: out });
console.log(logs.slice(0, 25).join('\n'));
await browser.close();
process.exit(0);
