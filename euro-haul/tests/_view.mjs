// Скриншоты игры в реальном WebGL: node tests/_view.mjs [префикс]
// Требует: локальный сервер на 8123 (из корня репозитория) и Chromium из /tmp.
import { createRequire } from 'node:module';
const require2 = createRequire(import.meta.url);
const puppeteer = require2('/tmp/node_modules/puppeteer-core');

const prefix = process.argv[2] || '/home/user/games/euro-haul/tests/_view';
const base = process.env.URL || 'http://127.0.0.1:8123/euro-haul/index.html';
const W = +(process.env.W || 1440);
const H = +(process.env.H || 810);

const browser = await puppeteer.launch({
  args: ['--no-sandbox', '--no-zygote', '--disable-gpu', '--enable-unsafe-swiftshader', '--use-gl=angle',
    '--use-angle=swiftshader', '--disable-dev-shm-usage', '--user-data-dir=/tmp/pprof' + Math.random().toString(36).slice(2)],
  defaultViewport: { width: W, height: H },
  executablePath: '/tmp/chromium',
  headless: true,
  env: { ...process.env, LD_LIBRARY_PATH: '/tmp/stubs' },
});
const page = await browser.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push('[pageerror] ' + e.message));
page.on('console', (m) => { if (m.type() === 'error') errors.push('[console] ' + m.text()); });
await page.goto(base, { waitUntil: 'domcontentloaded', timeout: 60000 });
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
await wait(1200);

await page.evaluate(() => {
  const g = window.__game;
  if (g.saves.slots.some(Boolean)) { g.continueCareer(); return; }
  g.createCareer('Водитель', 'berlin', 0);
});
await wait(2200);
await page.evaluate(() => {
  const g = window.__game;
  if (g.state !== 'garage') return;
  const job = g.offers.find((o) => o.from === g.profile.currentCity) || g.offers[0];
  g.acceptJob(job);
});
await wait(4200);

// немного проехать, чтобы камера и физика устоялись
await page.evaluate(() => { const g = window.__game; g.cameraMode = 'interior'; g.cameraUserSet = true; });
await wait(1200);
await page.keyboard.down('KeyW');
await wait(6000);
await page.screenshot({ path: `${prefix}-cab.png` });
const telemetry = await page.evaluate(() => {
  const g = window.__game;
  return { speed: +(g.truck.speed * 3.6).toFixed(1), gear: g.truck.gear, rpm: Math.round(g.truck.rpm), lat: +g.truck.lat.toFixed(2) };
});
await wait(2200);
await page.screenshot({ path: `${prefix}-cab2.png` });
await page.keyboard.up('KeyW');

for (const mode of ['chase', 'hood', 'far']) {
  await page.evaluate((m) => { const g = window.__game; g.cameraMode = m; g.cameraUserSet = true; }, mode);
  await wait(1500);
  await page.screenshot({ path: `${prefix}-${mode}.png` });
}
console.log('telemetry', JSON.stringify(telemetry));
console.log('errors', errors.slice(0, 6).join(' | ') || 'нет');
await browser.close();
process.exit(0);
