import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';
const exec = await chromium.executablePath();
console.log('exec:', exec);
const browser = await puppeteer.launch({
  args: [...chromium.args, '--no-sandbox', '--disable-dev-shm-usage'],
  executablePath: exec,
  headless: true,
});
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 1 });
await page.goto('http://127.0.0.1:8100/truck-showroom/', { waitUntil: 'networkidle2', timeout: 60000 });
await new Promise((r) => setTimeout(r, 2500));
await page.screenshot({ path: '/tmp/prev/ui-home.png' });
console.log('ok');
await browser.close();
