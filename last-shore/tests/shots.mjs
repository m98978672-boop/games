// Скриншоты ключевых ракурсов: вид от первого лица, лес, ночь у костра.
// Нужен запущенный сервер игры на http://127.0.0.1:8080 (tools/serve.py 8080).
import puppeteer from 'puppeteer-core';
import chromiumPkg from '@sparticuz/chromium';
const chromium = chromiumPkg.default || chromiumPkg;
const browser = await puppeteer.launch({
  args: [...chromium.args, '--no-sandbox', '--enable-unsafe-swiftshader'],
  executablePath: await chromium.executablePath(),
  headless: 'shell', protocolTimeout: 240000,
  env: { ...process.env, LD_LIBRARY_PATH: '/tmp/nssstub' },
});
const page = await browser.newPage();
await page.setViewport({ width: 900, height: 560 });
page.on('pageerror', (e) => console.log('ERR', e.message.slice(0, 300)));
page.on('console', (m) => { const t = m.text(); if (t.includes('Shader') || t.includes('ERROR')) console.log('LOG', t.slice(0, 400)); });
await page.goto('http://127.0.0.1:8080/index.html?safe=1', { waitUntil: 'load' });
await page.click('#btn-start');
await new Promise((r) => setTimeout(r, 4000));
// вид от первого лица + инструмент в руке
await page.evaluate(() => {
  const g = window.__game;
  g.state.inventory.axe = 1;
  g.selectSlot(4);
  g.toggleView();
  g.player.pitch = 0.05;
});
await new Promise((r) => setTimeout(r, 1500));
await page.screenshot({ path: 'tests/shot-fp.png', timeout: 180000 });
// лес, третье лицо
await page.evaluate(() => {
  const g = window.__game;
  g.toggleView();
  const forest = g.resources.nodes.find((n) => n.type === 'tree');
  g.player.setPosition(forest.x + 6, forest.z + 6, g.world);
  g.player.yaw = Math.atan2(-(forest.x - g.player.position.x), -(forest.z - g.player.position.z));
  g.player.pitch = 0.22;
});
await new Promise((r) => setTimeout(r, 1500));
await page.screenshot({ path: 'tests/shot-forest.png', timeout: 180000 });
// ночь с костром, первое лицо
await page.evaluate(() => {
  const g = window.__game;
  g.sky.hour = 21.0;
  g.state.inventory.campfireKit = 1;
  g.placeCampfire();
  g.toggleView();
});
await new Promise((r) => setTimeout(r, 1600));
await page.screenshot({ path: 'tests/shot-night2.png', timeout: 180000 });
await browser.close();
