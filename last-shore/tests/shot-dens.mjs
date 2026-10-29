// Дома зверей по видам (v0.19): по кадру на каждый вид.
import puppeteer from 'puppeteer-core';
import chromiumPkg from '@sparticuz/chromium';
const chromium = chromiumPkg.default || chromiumPkg;
const browser = await puppeteer.launch({
  args: [...chromium.args, '--no-sandbox', '--enable-unsafe-swiftshader'],
  executablePath: await chromium.executablePath(), headless: 'shell',
  protocolTimeout: 900000, env: { ...process.env, LD_LIBRARY_PATH: '/tmp/nssstub' },
});
const page = await browser.newPage();
await page.setViewport({ width: 560, height: 380 });
page.on('pageerror', (e) => console.log('ERR', e.message.slice(0, 200)));
await page.goto('http://127.0.0.1:8080/index.html', { waitUntil: 'load' });
await page.click('#btn-start');
const only = process.argv[2] || null;
await new Promise((r) => setTimeout(r, 3500));
const kinds = await page.evaluate((onlyKind) => {
  window.__only = onlyKind;
  const g = window.__game;
  const seen = new Set(); const out = [];
  for (const d of g.world.dens) {
    if (window.__only && d.kind !== window.__only) continue;
    if (seen.has(d.kind)) continue;
    seen.add(d.kind);
    out.push({ kind: d.kind, x: d.x, z: d.z, e: d.entrance });
  }
  // вид сверху-сбоку по направлению входа
  out.forEach((d, i) => {
    const ex = Math.sin(d.e) * 5.2, ez = Math.cos(d.e) * 5.2;
    window['__cam' + i] = () => {
      const h = g.world.heightAt(d.x + ex, d.z + ez);
      g.camera.position.set(d.x + ex, h + 3.4, d.z + ez);
      g.camera.lookAt(d.x, g.world.heightAt(d.x, d.z) + 0.7, d.z);
    };
  });
  return out.map((d) => d.kind);
}, only);
for (let i = 0; i < kinds.length; i++) {
  await page.evaluate((idx) => { window.__game.player.applyCamera = window['__cam' + idx]; }, i);
  await new Promise((r) => setTimeout(r, 700));
  await page.screenshot({ path: `tests/shot-v019-den-${kinds[i]}.png` });
}
console.log('виды:', kinds.join(', '));
await browser.close();
