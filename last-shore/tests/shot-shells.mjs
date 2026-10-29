// Обводки моделей (v0.19): как выглядят пояса призм вокруг стволов.
import puppeteer from 'puppeteer-core';
import chromiumPkg from '@sparticuz/chromium';
const chromium = chromiumPkg.default || chromiumPkg;
const browser = await puppeteer.launch({
  args: [...chromium.args, '--no-sandbox', '--enable-unsafe-swiftshader'],
  executablePath: await chromium.executablePath(), headless: 'shell',
  protocolTimeout: 900000, env: { ...process.env, LD_LIBRARY_PATH: '/tmp/nssstub' },
});
const page = await browser.newPage();
await page.setViewport({ width: 600, height: 420 });
page.on('pageerror', (e) => console.log('ERR', e.message.slice(0, 200)));
await page.goto('http://127.0.0.1:8080/index.html', { waitUntil: 'load' });
await page.click('#btn-start');
await new Promise((r) => setTimeout(r, 3500));
const info = await page.evaluate(() => {
  const g = window.__game;
  const on = g.world.shells.toggle();
  const t = g.world.treeList.find((x) => x.kind === 'tree') || g.world.treeList[0];
  const gy = g.world.heightAt(t.x, t.z);
  g.player.applyCamera = () => {
    g.camera.position.set(t.x + 5.5, gy + 3.0, t.z + 5.5);
    g.camera.lookAt(t.x, gy + 2.4, t.z);
  };
  return { on, stats: g.world.shells.stats, bands: t.shells ? t.shells.length : 0 };
});
await new Promise((r) => setTimeout(r, 900));
await page.screenshot({ path: 'tests/shot-v019-shells.png' });
console.log(JSON.stringify(info));
await browser.close();
