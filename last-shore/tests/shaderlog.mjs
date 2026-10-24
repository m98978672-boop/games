import puppeteer from 'puppeteer-core';
import chromiumPkg from '@sparticuz/chromium';
const chromium = chromiumPkg.default || chromiumPkg;
const browser = await puppeteer.launch({
  args: [...chromium.args, '--no-sandbox', '--enable-unsafe-swiftshader'],
  executablePath: await chromium.executablePath(),
  headless: 'shell',
  protocolTimeout: 120000,
  env: { ...process.env, LD_LIBRARY_PATH: '/tmp/nssstub' },
});
const page = await browser.newPage();
await page.setViewport({ width: 800, height: 500 });
const logs = [];
page.on('console', (m) => { const t = m.text(); if (!t.includes('useProgram')) logs.push(`[${m.type()}] ${t}`); });
page.on('pageerror', (e) => logs.push('[pageerror] ' + e.message));
await page.goto('http://127.0.0.1:8080/index.html', { waitUntil: 'load' });
await page.click('#btn-start');
await new Promise((r) => setTimeout(r, 6000));
console.log(logs.join('\n').slice(0, 6000));
await browser.close();
