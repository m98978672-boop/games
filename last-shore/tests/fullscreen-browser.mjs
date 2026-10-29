import assert from 'node:assert/strict';
import puppeteer from 'puppeteer-core';
import chromiumPkg from '@sparticuz/chromium';
const chromium = chromiumPkg.default || chromiumPkg;
const browser = await puppeteer.launch({ args:[...chromium.args, '--no-sandbox', '--enable-unsafe-swiftshader'], executablePath:await chromium.executablePath(), headless:'shell', protocolTimeout:120000, env:{...process.env, LD_LIBRARY_PATH:'/tmp/nssstub'} });
try {
  const page = await browser.newPage();
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  await page.setViewport({width:390,height:844,isMobile:true,hasTouch:true});
  await page.goto('http://127.0.0.1:8080/?safe=1', {waitUntil:'load'});
  await page.click('#btn-start');
  await page.waitForFunction('window.__game?.running', {timeout:40000});
  await page.waitForFunction('document.fullscreenElement === document.documentElement', {timeout:10000});
  assert.equal(await page.$eval('#fullscreen-toggle', el => el.getAttribute('aria-label')), 'Выйти из полного экрана');
  await page.click('#fullscreen-toggle');
  await page.waitForFunction('!document.fullscreenElement');
  await page.evaluate(() => window.__game.pause());
  await page.click('#btn-resume');
  assert.equal(await page.evaluate(() => !!document.fullscreenElement), false);
  await page.click('#fullscreen-toggle');
  await page.waitForFunction('!!document.fullscreenElement');
  assert.deepEqual(errors, []);
  console.log('BROWSER FULLSCREEN OK');
} finally { await browser.close(); }
