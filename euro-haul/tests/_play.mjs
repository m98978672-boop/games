// Скриншоты реального WebGL-рендера: меню → гараж → рейс (кабина, трасса, телефон).
import { createRequire } from 'node:module';
const require2 = createRequire(import.meta.url);
const puppeteer = require2('/tmp/node_modules/puppeteer-core');

const base = process.argv[2] || 'http://127.0.0.1:8123/euro-haul/index.html';
const prefix = process.argv[3] || '/home/user/games/euro-haul/tests/_shot';

const browser = await puppeteer.launch({
  args: ['--no-sandbox', '--no-zygote', '--disable-gpu', '--enable-unsafe-swiftshader', '--use-gl=angle', '--use-angle=swiftshader',
    '--disable-dev-shm-usage', '--user-data-dir=/tmp/pprof' + Math.random().toString(36).slice(2), '--disable-crash-reporter', '--window-size=1440,810'],
  defaultViewport: { width: 1440, height: 810 },
  executablePath: '/tmp/chromium',
  headless: true,
  env: { ...process.env, LD_LIBRARY_PATH: '/tmp/stubs' },
});
const page = await browser.newPage();
const logs = [];
page.on('console', (m) => { if (m.type() === 'error') logs.push('[err] ' + m.text()); });
page.on('pageerror', (e) => logs.push('[pageerror] ' + e.message));
await page.goto(base, { waitUntil: 'domcontentloaded', timeout: 60000 });
await new Promise((r) => setTimeout(r, 1200));
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// Новая карьера
await page.click('#btn-new');
await wait(500);
await page.click('[data-act="create-career"]');
await wait(2500);
await page.screenshot({ path: `${prefix}-garage.png` });

// Первый рейс — через API, чтобы не зависеть от разметки кнопок.
await page.evaluate(() => {
  const g = window.__game;
  const job = g.offers.find((o) => o.from === g.profile.currentCity) || g.offers[0];
  g.acceptJob(job);
});
await wait(4500);
await page.screenshot({ path: `${prefix}-drive0.png` });

// камера из кабины
await page.evaluate(() => { window.__game.cameraMode = 'interior'; window.__game.cameraUserSet = true; });
await wait(1200);
await page.screenshot({ path: `${prefix}-cab.png` });
await page.keyboard.down('KeyW');
await wait(6000);
await page.screenshot({ path: `${prefix}-cab2.png` });
await page.keyboard.up('KeyW');
await wait(2500);
// вид сзади
await page.evaluate(() => { window.__game.cameraMode = 'chase'; });
await wait(1500);
await page.screenshot({ path: `${prefix}-chase.png` });
// капот
await page.evaluate(() => { window.__game.cameraMode = 'hood'; });
await wait(1200);
await page.screenshot({ path: `${prefix}-hood.png` });
// пауза
await page.keyboard.press('Escape');
await wait(900);
await page.screenshot({ path: `${prefix}-pause.png` });
// телефон: отдельная страница в портретной ориентации
const phone = await browser.newPage();
await phone.setViewport({ width: 390, height: 844, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
await phone.goto(base, { waitUntil: 'domcontentloaded' });
await new Promise((r) => setTimeout(r, 1500));
await phone.screenshot({ path: `${prefix}-phone-menu.png` });
await phone.evaluate(() => {
  const g = window.__game;
  const job = g.offers.find((o) => o.from === g.profile.currentCity) || g.offers[0];
  g.acceptJob(job);
});
await new Promise((r) => setTimeout(r, 4000));
await phone.evaluate(() => { window.__game.cameraMode = 'chase'; window.__game.cameraUserSet = true; });
await new Promise((r) => setTimeout(r, 1500));
await phone.screenshot({ path: `${prefix}-phone.png` });
console.log(logs.slice(0, 12).join('\n'));
await browser.close();
process.exit(0);
