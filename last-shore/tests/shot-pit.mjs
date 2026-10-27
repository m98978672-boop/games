// v0.14: скриншоты выкопанной ямы (настоящая дыра в рельефе со ступенями).
// Нужен сервер на http://127.0.0.1:8080 и bundle.js из npm run build.
import puppeteer from 'puppeteer-core';
import chromiumPkg from '@sparticuz/chromium';
const chromium = chromiumPkg.default || chromiumPkg;

const browser = await puppeteer.launch({
  args: [...chromium.args, '--no-sandbox', '--enable-unsafe-swiftshader'],
  executablePath: await chromium.executablePath(),
  headless: 'shell',
  protocolTimeout: 240000,
  env: { ...process.env, LD_LIBRARY_PATH: '/tmp/nssstub' },
});
const page = await browser.newPage();
await page.setViewport({ width: 1100, height: 700 });
const errors = [];
page.on('pageerror', (e) => errors.push('ERR ' + e.message.slice(0, 300)));
await page.goto('http://127.0.0.1:8080/index.html', { waitUntil: 'load' });
await page.click('#btn-start');
await new Promise((r) => setTimeout(r, 4000));

// ровное просторное место рядом с героем, копаем широкую и глубокую яму
const info = await page.evaluate(() => {
  const g = window.__game;
  const w = g.world;
  const p = g.player.position;
  let spot = null;
  for (let r = 4; r <= 30 && !spot; r += 1.2) {
    for (let i = 0; i < 20 && !spot; i++) {
      const a = (i / 20) * Math.PI * 2;
      const x = p.x + Math.cos(a) * r;
      const z = p.z + Math.sin(a) * r;
      if (w.heightAt(x, z) < 3.2 || w.slopeAt(x, z) > 0.35) continue;
      let crowded = false;
      for (const c of w.colliders) if (Math.hypot(c.x - x, c.z - z) < 4.5) crowded = true;
      if (!crowded) spot = { x, z };
    }
  }
  if (!spot) return { ok: false };
  for (let i = 0; i < 9; i++) {
    w.playerPos = { x: spot.x + 3.5, z: spot.z };
    w.dig(spot.x, spot.z, { radius: 2.0, depth: 0.45, mine: 99 });
  }
  const pit = w.pitAt(spot.x, spot.z);
  if (!pit) return { ok: false, why: 'ямы нет' };
  // герой стоит у края, камера — свободная, из-за плеча
  const px = pit.x1 + 1.4;
  const pz = (pit.z0 + pit.z1) / 2;
  g.player.position.set(px, w.heightAt(px, pz) + 0.05, pz);
  g.player.facing = g.player.yaw = Math.atan2(-(spot.x - px), -(spot.z - pz));
  const cx = (pit.x0 + pit.x1) / 2;
  const cz = (pit.z0 + pit.z1) / 2;
  window.__pit = { cx, cz, pit };
  g.player.applyCamera = () => {
    g.camera.position.set(cx + 4.2, pit.exitY + 3.0, cz + 4.2);
    g.camera.lookAt(cx, pit.floorY + 1.0, cz);
  };
  return {
    ok: true,
    cells: pit.rect.cells,
    side: pit.side,
    steps: pit.steps,
    stepH: +pit.stepH.toFixed(2),
    run: +pit.runPerStep.toFixed(2),
    depth: +(pit.exitY - pit.floorY).toFixed(2),
    atPoint: +(w.baseHeightAt(spot.x, spot.z) - w.heightAt(spot.x, spot.z)).toFixed(2),
    verts: pit.walls.geometry.attributes.position.count,
  };
});
console.log('яма:', JSON.stringify(info));
await new Promise((r) => setTimeout(r, 1200));
await page.screenshot({ path: 'tests/shot-pit.png' });
await page.screenshot({ path: 'tests/shot-pit-zoom.png', clip: { x: 250, y: 60, width: 640, height: 560 } });

// камера сверху: видно, что край дыры идёт по линиям сетки, ступени вниз
await page.evaluate(() => {
  const g = window.__game;
  const { pit, cx, cz } = window.__pit;
  g.player.applyCamera = () => {
    g.camera.position.set(cx + 0.3, pit.exitY + 7.5, cz + 3.6);
    g.camera.lookAt(cx, pit.floorY + 1.2, cz);
  };
});
await new Promise((r) => setTimeout(r, 1000));
await page.screenshot({ path: 'tests/shot-pit-top.png' });

console.log('ошибки страницы:', errors.length ? errors.join(' | ') : 'нет');
await browser.close();
