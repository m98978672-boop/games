import assert from 'node:assert/strict';
import puppeteer from 'puppeteer-core';
import chromiumPkg from '@sparticuz/chromium';
const chromium = chromiumPkg.default || chromiumPkg;
const browser = await puppeteer.launch({ args: [...chromium.args, '--no-sandbox', '--enable-unsafe-swiftshader'], executablePath: await chromium.executablePath(), headless: 'shell', protocolTimeout: 120000, env: { ...process.env, LD_LIBRARY_PATH: '/tmp/nssstub' } });
const errors = [];
async function newPhone() {
  const p = await browser.newPage();
  await p.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  p.on('pageerror', err => errors.push(err.message));
  await p.goto('http://127.0.0.1:8080/?safe=1', { waitUntil: 'load' });
  return p;
}
try {
  const host = await newPhone(); const friend = await newPhone();
  for (const p of [host, friend]) {
    await p.click('#btn-rooms'); await p.click('.phone-room summary');
  }
  await host.click('#peer-host');
  await host.waitForFunction("document.querySelector('#peer-out').value.length > 0", {timeout: 20000});
  const invite = await host.$eval('#peer-out', e => e.value);
  await friend.$eval('#peer-in', (e, value) => { e.value = value; }, invite);
  await friend.click('#peer-answer');
  await friend.waitForFunction("document.querySelector('#peer-out').value.length > 0", {timeout: 20000});
  const answer = await friend.$eval('#peer-out', e => e.value);
  await host.$eval('#peer-in', (e, value) => { e.value = value; }, answer);
  await host.click('#peer-apply');
  await Promise.all([host, friend].map(p => p.waitForFunction('window.__roomClient?.room && window.__game?.running', { timeout: 60000 })));
  await host.waitForFunction('window.__roomClient.remote.size > 0', {timeout: 20000});
  await friend.waitForFunction('window.__roomClient.remote.size > 0', {timeout: 20000});
  const attack = await host.$eval('.touch-fire', el => {
    const r = el.getBoundingClientRect();
    return { x: r.x + r.width / 2, y: r.y + r.height / 2, width: r.width, height: r.height };
  });
  assert.ok(attack.width >= 64 && attack.height >= 64);
  await host.touchscreen.touchStart(attack.x, attack.y);
  assert.equal(await host.evaluate(() => window.__game.holdingAttack), true);
  await host.touchscreen.touchEnd();
  assert.equal(await host.evaluate(() => window.__game.holdingAttack), false);
  const bag = await host.$eval('[data-action="bag"]', el => { const r=el.getBoundingClientRect(); return {x:r.x+r.width/2,y:r.y+r.height/2}; });
  await host.touchscreen.tap(bag.x, bag.y);
  assert.equal(await host.$eval('#inventory', el => el.classList.contains('hidden')), false);
  await host.evaluate(() => window.__game.addItem('fiber', 4));
  await host.click('#inventory-tab-craft');
  assert.equal(await host.$eval('#inventory-craft-list', el => el.classList.contains('hidden')), false);
  assert.ok(await host.$$eval('#inventory-craft-list .recipe', es => es.length > 0));
  await host.click('#inventory-craft-list [data-craft="rope"]');
  assert.equal(await host.evaluate(() => window.__game.state.inventory.rope), 1);
  await host.click('#inventory-tab-bag');
  assert.equal(await host.$eval('#inv-list', el => el.classList.contains('hidden')), false);
  await host.evaluate(() => { const game = window.__game, p = game.player.position; game.stations.push({type:'bench',x:p.x+1,y:p.y,z:p.z}); });
  await host.click('#inventory-station');
  assert.equal(await host.$eval('#workshop', el => el.classList.contains('hidden')), false);
  await host.click('#workshop-close');
  assert.equal(await host.$eval('#workshop', el => el.classList.contains('hidden')), true);
  const fog = await host.evaluate(() => {
    const game = window.__game; game.device.weak = false; game.settings.quality = 'auto';
    game.update(.01); return { near:game.scene.fog.near, far:game.scene.fog.far };
  });
  assert.equal(fog.near, 20); assert.ok(fog.far > fog.near);
  assert.deepEqual(errors, []);
  console.log('PHONE WEBRTC, CONTROLS, INVENTORY AND FOG OK');
} finally { await browser.close(); }
