// Быстрые кадры в заданную погоду/время. node tests/_shots.mjs <prefix>
// Переменные: WEATHER=clear HOUR=11 MODES=chase,cab W=1440 H=810
import { createRequire } from 'node:module';
const require2 = createRequire(import.meta.url);
const puppeteer = require2('/tmp/node_modules/puppeteer-core');
const prefix = process.argv[2] || '/home/user/games/euro-haul/tests/_s';
const weather = process.env.WEATHER || 'clear';
const hour = +(process.env.HOUR || 11);
const modes = (process.env.MODES || 'chase,cab').split(',');
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
await page.goto('http://127.0.0.1:8123/euro-haul/index.html', { waitUntil: 'domcontentloaded', timeout: 60000 });
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
await wait(1100);
await page.evaluate(() => {
  const g = window.__game;
  if (g.saves.slots.some(Boolean)) { g.continueCareer(); return; }
  g.createCareer('Водитель', 'berlin', 0);
});
await wait(1800);
await page.evaluate(() => {
  const g = window.__game;
  if (g.state !== 'garage') return;
  const job = g.offers.find((o) => o.from === g.profile.currentCity) || g.offers[0];
  g.acceptJob(job);
});
await wait(2600);
await page.evaluate((w, h) => {
  const g = window.__game;
  g.setWeather(w, true);
  g.clock.minutes = h * 60;
  g.sky.setTime(h * 60);
  g.truck.s = 4000;
  g.paused = false;
}, weather, hour);
await wait(1500);
for (const mode of modes) {
  await page.evaluate((m) => {
    const g = window.__game;
    g.cameraMode = m === 'cab' ? 'interior' : m;
    g.cameraUserSet = true;
  }, mode);
  await wait(1400);
  await page.screenshot({ path: `${prefix}-${mode}.png` });
}
console.log('errors', errors.slice(0, 5).join(' | ') || 'нет');
await browser.close();
process.exit(0);
