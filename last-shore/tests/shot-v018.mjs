// v0.18: скриншоты — лес (стволы+кроны), сосновый ярус, поляна дома зверя,
// лодка у берега, ступенчатый склон.
// Нужен сервер на http://127.0.0.1:8080 и bundle.js из npm run build.
import puppeteer from 'puppeteer-core';
import chromiumPkg from '@sparticuz/chromium';
const chromium = chromiumPkg.default || chromiumPkg;

const browser = await puppeteer.launch({
  args: [...chromium.args, '--no-sandbox', '--enable-unsafe-swiftshader'],
  executablePath: await chromium.executablePath(),
  headless: 'shell',
  protocolTimeout: 600000,
  env: { ...process.env, LD_LIBRARY_PATH: '/tmp/nssstub' },
});
const page = await browser.newPage();
await page.setViewport({ width: 960, height: 600 });
const errors = [];
page.on('pageerror', (e) => errors.push('ERR ' + e.message.slice(0, 300)));
await page.goto('http://127.0.0.1:8080/index.html', { waitUntil: 'load' });
await page.click('#btn-start');
await new Promise((r) => setTimeout(r, 4500));

// --- 1. общий вид острова сверху ---
await page.evaluate(() => {
  const g = window.__game;
  g.player.applyCamera = () => {
    g.camera.position.set(-40, 60, 90);
    g.camera.lookAt(0, 6, 0);
  };
});
await new Promise((r) => setTimeout(r, 900));
await page.screenshot({ path: 'tests/shot-v018-island.png' });

// --- 2. в лесу: стволы, кроны, земля ---
const forest = await page.evaluate(() => {
  const g = window.__game;
  const t = g.world.treeList.find((x) => x.kind === 'tree') || g.world.treeList[0] || { x: 0, z: 0, h: 2 };
  g.player.applyCamera = () => {
    g.camera.position.set(t.x + 6, t.h + 3.4, t.z + 6);
    g.camera.lookAt(t.x, t.h + 2.2, t.z);
  };
  return { x: +(t.x || 0).toFixed(1), z: +(t.z || 0).toFixed(1) };
});
await new Promise((r) => setTimeout(r, 900));
await page.screenshot({ path: 'tests/shot-v018-forest.png' });

// --- 3. сосна (ярусы хвои) ---
const pine = await page.evaluate(() => {
  const g = window.__game;
  const list = g.world.pineList || [];
  const pineItem = list[0] || g.world.treeList[0] || { x: 0, z: 0, h: 0, s: 1 };
  const p = pineItem;
  g.player.applyCamera = () => {
    g.camera.position.set(p.x + 4.5, p.h + 5.5, p.z + 4.5);
    g.camera.lookAt(p.x, p.h + 5.5, p.z);
  };
  return { x: +(p.x || 0).toFixed(1), z: +(p.z || 0).toFixed(1), h: +(p.h || 0).toFixed(1) };
});
await new Promise((r) => setTimeout(r, 900));
await page.screenshot({ path: 'tests/shot-v018-pine.png' });

// --- 4. поляна дома зверя ---
const den = await page.evaluate(() => {
  const g = window.__game;
  const d = g.world.dens[0] || { x: 0, z: 0, y: 2 };
  g.player.applyCamera = () => {
    g.camera.position.set(d.x + 9, d.y + 6, d.z + 9);
    g.camera.lookAt(d.x, d.y + 1.2, d.z);
  };
  return { x: +(d.x || 0).toFixed(1), z: +(d.z || 0).toFixed(1) };
});
await new Promise((r) => setTimeout(r, 900));
await page.screenshot({ path: 'tests/shot-v018-den.png' });

// --- 5. лодка у берега ---
const boat = await page.evaluate(() => {
  const g = window.__game;
  const b = (g.boat && g.boat.placed && g.boat.group.position) || null;
  if (!b) return { x: null, z: null };
  g.player.applyCamera = () => {
    g.camera.position.set(b.x + 7, b.y + 4, b.z + 7);
    g.camera.lookAt(b.x, b.y + 0.6, b.z);
  };
  return { x: +b.x.toFixed(1), z: +b.z.toFixed(1) };
});
await new Promise((r) => setTimeout(r, 900));
await page.screenshot({ path: 'tests/shot-v018-boat.png' });

console.log('лес', JSON.stringify(forest), '· сосна', JSON.stringify(pine),
  '· дом', JSON.stringify(den), '· лодка', JSON.stringify(boat));
console.log('ошибки страницы:', errors.length ? errors.slice(0, 3).join(' | ') + ` (всего ${errors.length})` : 'нет');
await browser.close();
