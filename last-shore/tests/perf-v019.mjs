// Замер нагрузки (v0.19): сколько draw calls и треугольников видит камера
// на обычной точке острова, и сколько стоит поставить костёр.
// Нужен сервер 8080 и bundle.js из npm run build.
import puppeteer from 'puppeteer-core';
import chromiumPkg from '@sparticuz/chromium';
const chromium = chromiumPkg.default || chromiumPkg;
const browser = await puppeteer.launch({
  args: [...chromium.args, '--no-sandbox', '--enable-unsafe-swiftshader'],
  executablePath: await chromium.executablePath(), headless: 'shell',
  protocolTimeout: 900000, env: { ...process.env, LD_LIBRARY_PATH: '/tmp/nssstub' },
});
const page = await browser.newPage();
await page.setViewport({ width: 900, height: 560 });
page.on('pageerror', (e) => console.log('ERR', e.message.slice(0, 200)));
await page.goto('http://127.0.0.1:8080/index.html', { waitUntil: 'load' });
await page.click('#btn-start');
await new Promise((r) => setTimeout(r, 4000));

const read = () => page.evaluate(() => ({
  calls: window.__game.renderer.info.render.calls,
  tris: window.__game.renderer.info.render.triangles,
  geos: window.__game.renderer.info.memory.geometries,
  progs: window.__game.renderer.info.programs.length,
}));

const near = await read();
const fire = await page.evaluate(() => {
  const g = window.__game;
  const p = g.player.position;
  const t0 = performance.now();
  const f = g.resources.addCampfire(p.x + 3, p.z + 2);
  const ms = performance.now() - t0;
  window.__fire = f;
  return +ms.toFixed(1);
});
await new Promise((r) => setTimeout(r, 1200));
const afterFire = await read();
const far = await page.evaluate(() => {
  const g = window.__game;
  const w = g.world;
  let best = null;
  for (let i = 0; i < 6000; i++) {
    const a = Math.random() * Math.PI * 2, r = 118 + Math.random() * 45;
    const x = Math.cos(a) * r, z = Math.sin(a) * r;
    if (w.heightAt(x, z) < -3) { best = { x, z }; break; }
  }
  g.player.position.set(best.x, -0.6, best.z);
});
await new Promise((r) => setTimeout(r, 2500));
const atSea = await read();

console.log('у берега:', JSON.stringify(near));
console.log('после костра: постановка', fire, 'мс ·', JSON.stringify(afterFire));
console.log('в открытом море:', JSON.stringify(atSea));
await browser.close();
