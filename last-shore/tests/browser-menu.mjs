import assert from 'node:assert/strict';
import puppeteer from 'puppeteer-core';
import chromiumPkg from '@sparticuz/chromium';
const chromium = chromiumPkg.default || chromiumPkg;
const browser = await puppeteer.launch({args:[...chromium.args,'--no-sandbox','--enable-unsafe-swiftshader'], executablePath: await chromium.executablePath(), headless:'shell', protocolTimeout:120000, env:{...process.env, LD_LIBRARY_PATH:'/tmp/nssstub'}});
const page = await browser.newPage();
const errors=[]; page.on('pageerror', e => errors.push(e.message));
try {
  await page.setViewport({width:390,height:844,isMobile:true,hasTouch:true});
  await page.goto('http://127.0.0.1:8080/?safe=1', {waitUntil:'load'});
  await page.click('#btn-settings'); await page.select('#setting-language','en');
  assert.equal(await page.$eval('#btn-start', e=>e.textContent), 'New game');
  await page.evaluate(() => { const el = document.querySelector('#setting-volume'); el.value=30; el.dispatchEvent(new Event('input',{bubbles:true})); });
  assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('lastshore.settings.v1')).volume), .3);
  await page.click('#btn-settings-close'); await page.click('#btn-start');
  await page.waitForFunction('window.__game && window.__game.running', {timeout:40000});
  await page.evaluate(() => window.__game.pause());
  await page.click('#btn-pause-saves');
  await page.waitForSelector('.save-slot');
  await page.click('.save-slot button');
  assert.ok(await page.evaluate(()=>!!localStorage.getItem('lastshore.slot.1.v1')));
  assert.deepEqual(errors, []); console.log('BROWSER MOBILE MENU + SAVES OK');
} finally { await browser.close(); }
