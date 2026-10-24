import puppeteer from 'puppeteer-core';
import chromiumPkg from '@sparticuz/chromium';
const chromium = chromiumPkg.default || chromiumPkg;
const browser = await puppeteer.launch({
  args: [...chromium.args, '--no-sandbox', '--enable-unsafe-swiftshader'],
  executablePath: await chromium.executablePath(),
  headless: 'shell',
  env: { ...process.env, LD_LIBRARY_PATH: '/tmp/nssstub' },
});

async function checkPage(url, shot, { width = 1440, height = 900, full = false } = {}) {
  const page = await browser.newPage();
  await page.setViewport({ width, height });
  const errs = [];
  page.on('pageerror', (e) => errs.push('ERR ' + e.message.slice(0, 160)));
  page.on('requestfailed', (r) => errs.push('FAIL ' + r.url() + ' ' + r.failure()?.errorText));
  page.on('response', (r) => { if (r.status() >= 400) errs.push('HTTP ' + r.status() + ' ' + r.url()); });
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 40000 });
  await new Promise((r) => setTimeout(r, 900));
  await page.screenshot({ path: shot, fullPage: full });
  console.log(url, errs.length ? errs.join(' | ') : 'OK');
  return page;
}

// 1. витрина (корень)
let page = await checkPage('http://127.0.0.1:8081/', 'tests/shot-site.png');
const links = await page.evaluate(() => [...document.querySelectorAll('a.btn, a.cta')].map((a) => a.getAttribute('href')));
console.log('ссылки на игры:', links.join(', '));
await page.close();

// 2. витрина в копии /site/ + мобильный вид
page = await checkPage('http://127.0.0.1:8081/site/', 'tests/shot-site-alt.png');
await page.close();
page = await checkPage('http://127.0.0.1:8081/', 'tests/shot-site-mobile.png', { width: 390, height: 844, full: true });
await page.close();

// 3. переход по «Играть» в LAST SHORE с витрины
page = await browser.newPage();
await page.setViewport({ width: 1280, height: 720 });
await page.goto('http://127.0.0.1:8081/', { waitUntil: 'load' });
await page.evaluate(() => document.querySelector('a.btn-primary').click());
await new Promise((r) => setTimeout(r, 2500));
const url = page.url();
const started = await page.evaluate(() => !!window.__game || (document.getElementById('boot-status')?.textContent || ''));
await page.click('#btn-start').catch(() => {});
await new Promise((r) => setTimeout(r, 2500));
const state = await page.evaluate(() => ({
  running: window.__game?.running ?? null,
  fatal: document.getElementById('fatal').classList.contains('hidden') ? 'none' : document.getElementById('fatal-text').textContent.slice(0, 150),
  back: !!document.querySelector('.back-link'),
}));
console.log('переход на игру:', url, JSON.stringify({ started, ...state }));
await page.close();

// 4. переход в Линию Фронта
page = await browser.newPage();
await page.setViewport({ width: 1280, height: 720 });
await page.goto('http://127.0.0.1:8081/', { waitUntil: 'load' });
await page.evaluate(() => document.querySelectorAll('a.btn-primary')[1].click());
await new Promise((r) => setTimeout(r, 2500));
console.log('фронт открыт:', page.url());
await page.screenshot({ path: 'tests/shot-site-frontline.png' });
await page.close();

await browser.close();
