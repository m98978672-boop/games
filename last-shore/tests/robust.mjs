import puppeteer from 'puppeteer-core';
import chromiumPkg from '@sparticuz/chromium';
const chromium = chromiumPkg.default || chromiumPkg;

const browser = await puppeteer.launch({
  args: [...chromium.args, '--no-sandbox', '--enable-unsafe-swiftshader'],
  executablePath: await chromium.executablePath(),
  headless: 'shell',
  env: { ...process.env, LD_LIBRARY_PATH: '/tmp/nssstub' },
});

async function scenario(name, { url, blockWebGL = false, clickStart = true }) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1100, height: 700 });
  const errs = [];
  page.on('pageerror', (e) => errs.push(e.message.slice(0, 200)));
  if (blockWebGL) {
    await page.evaluateOnNewDocument(() => {
      const orig = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (type, ...rest) {
        if (String(type).includes('webgl') || String(type).includes('experimental')) return null;
        return orig.call(this, type, ...rest);
      };
    });
  }
  await page.goto(url, { waitUntil: 'load' });
  await new Promise((r) => setTimeout(r, 700));
  const boot = await page.$eval('#boot-status', (el) => el.textContent);
  if (clickStart) {
    await page.click('#btn-start').catch(() => {});
    await new Promise((r) => setTimeout(r, 3000));
  }
  const state = await page.evaluate(() => {
    const vis = (id) => { const el = document.getElementById(id); return el && !el.classList.contains('hidden'); };
    return {
      boot: document.getElementById('boot-status')?.textContent,
      nogl: vis('nogl'),
      noglReason: document.getElementById('nogl-reason')?.textContent?.slice(0, 160),
      fatal: vis('fatal'),
      fatalText: document.getElementById('fatal-text')?.textContent?.slice(0, 200),
      running: window.__game?.running ?? null,
      quality: window.__game?.qualityLabel ?? null,
      renderer: window.__game?.renderer ? 'ok' : 'нет',
    };
  });
  await page.screenshot({ path: `tests/shot-${name}.png` });
  console.log(name, JSON.stringify({ boot, ...state, errs }));
  await page.close();
}

await scenario('normal', { url: 'http://127.0.0.1:8080/index.html' });
await scenario('safe', { url: 'http://127.0.0.1:8080/index.html?safe=1' });
await scenario('nowebgl', { url: 'http://127.0.0.1:8080/index.html', blockWebGL: true });

// диагностика со стартового экрана
const page = await browser.newPage();
await page.goto('http://127.0.0.1:8080/index.html', { waitUntil: 'load' });
await page.click('#btn-diag');
await new Promise((r) => setTimeout(r, 400));
const diag = await page.$eval('#diag-text', (el) => el.textContent.slice(0, 600));
console.log('--- diag ---\n' + diag);
await page.screenshot({ path: 'tests/shot-diag.png' });
await page.close();

await browser.close();
