// Снимок карты Европы и кадра с трафиком.
import { createRequire } from 'node:module';
const require2 = createRequire(import.meta.url);
const puppeteer = require2('/tmp/node_modules/puppeteer-core');
const browser = await puppeteer.launch({
  args: ['--no-sandbox', '--no-zygote', '--disable-gpu', '--enable-unsafe-swiftshader', '--use-gl=angle',
    '--use-angle=swiftshader', '--disable-dev-shm-usage', '--user-data-dir=/tmp/pprof' + Math.random().toString(36).slice(2)],
  defaultViewport: { width: 1440, height: 900 }, executablePath: '/tmp/chromium', headless: true,
  env: { ...process.env, LD_LIBRARY_PATH: '/tmp/stubs' },
});
const page = await browser.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push('[pageerror] ' + e.message));
await page.goto('http://127.0.0.1:8123/euro-haul/index.html', { waitUntil: 'domcontentloaded', timeout: 60000 });
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
await wait(1200);
await page.evaluate(() => { const g = window.__game; if (g.saves.slots.some(Boolean)) g.continueCareer(); else g.createCareer('Водитель', 'berlin', 0); });
await wait(1800);
await page.evaluate(() => { const g = window.__game; g.openGarageTab('map'); });
await wait(1500);
await page.screenshot({ path: '/home/user/games/euro-haul/tests/_map.png' });
console.log('errors', errors.join(' | ') || 'нет');
await browser.close();
process.exit(0);
