// Кадры в движении: трафик, сцепка, кабина. node tests/_drive.mjs <префикс>
import { createRequire } from 'node:module';
const require2 = createRequire(import.meta.url);
const puppeteer = require2('/tmp/node_modules/puppeteer-core');
const prefix = process.argv[2] || '/tmp/drive-';
const browser = await puppeteer.launch({
  args: ['--no-sandbox', '--no-zygote', '--disable-gpu', '--enable-unsafe-swiftshader', '--use-gl=angle',
    '--use-angle=swiftshader', '--disable-dev-shm-usage', '--user-data-dir=/tmp/pprof' + Math.random().toString(36).slice(2)],
  defaultViewport: { width: 1440, height: 810 }, executablePath: '/tmp/chromium', headless: true,
  env: { ...process.env, LD_LIBRARY_PATH: '/tmp/stubs' },
});
const page = await browser.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push('[pageerror] ' + e.message));
await page.goto('http://127.0.0.1:8123/euro-haul/index.html', { waitUntil: 'domcontentloaded', timeout: 60000 });
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
await wait(1200);
await page.evaluate(() => { const g = window.__game; if (g.saves.slots.some(Boolean)) g.continueCareer(); else g.createCareer('Водитель', 'berlin', 0); });
await wait(1600);
await page.evaluate(() => {
  const g = window.__game;
  if (g.state === 'garage') { const job = g.offers.find((o) => o.from === g.profile.currentCity) || g.offers[0]; g.acceptJob(job); }
});
await wait(2200);
await page.evaluate(() => {
  const g = window.__game;
  g.cameraMode = 'chase'; g.cameraUserSet = true;
  g.timeScale = 1;
  g.input.keys.add('KeyW');
});
await wait(9000);
await page.screenshot({ path: prefix + 'chase.png' });
await page.evaluate(() => { const g = window.__game; g.input.keys.add('KeyA'); });
await wait(1400);
await page.screenshot({ path: prefix + 'turn.png' });
await page.evaluate(() => { const g = window.__game; g.input.keys.delete('KeyA'); g.input.keys.delete('KeyW'); g.cameraMode = 'interior'; g.cameraUserSet = true; });
await wait(1800);
await page.screenshot({ path: prefix + 'cab.png' });
const info = await page.evaluate(() => {
  const g = window.__game;
  return { kmh: Math.round(g.truck.speed * 3.6), lat: +g.truck.lat.toFixed(2), art: +g.truck.trailerYaw.toFixed(3), jack: +g.truck.jackknife.toFixed(2), cars: g.traffic?.cars?.length ?? null };
});
console.log(JSON.stringify(info), 'errors:', errors.join(' | ') || 'нет');
await browser.close();
process.exit(0);
