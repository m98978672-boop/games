// v0.17: скриншоты — хвост черепахи и полёт в креативе по зажатому пробелу.
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
await new Promise((r) => setTimeout(r, 4000));

// --- 1. черепаха: вид сзади-сбоку, видно хвост ---
const turtle = await page.evaluate(() => {
  const g = window.__game;
  const m = g.mobs.list.find((x) => x.type === 'turtle') || g.mobs.list[0];
  g.player.model.visible = false;
  g.player.applyCamera = () => {
    g.camera.position.set(m.x - 1.9, m.y + 1.1, m.z + 1.3);
    g.camera.lookAt(m.x - 0.15, m.y + 0.32, m.z);
  };
  g.player.position.set(m.x - 2, m.y, m.z + 1.4);
  return { x: +m.x.toFixed(1), z: +m.z.toFixed(1) };
});
await new Promise((r) => setTimeout(r, 900));
await page.screenshot({ path: 'tests/shot-turtle.png' });

// --- 2. полёт: зажимаем пробел и смотрим на героя со стороны ---
const fly = await page.evaluate(() => {
  const g = window.__game;
  if (!g.creative) g.toggleCreative();
  g.creative = true;
  g.player.fly = true;
  const p = g.player;
  p.position.set(0, 16, 0);
  p.velocity.set(0, 0, 0);
  window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Space', bubbles: true }));
  for (let i = 0; i < 60; i++) g.update(1 / 30);
  window.dispatchEvent(new KeyboardEvent('keyup', { code: 'Space', bubbles: true }));
  const y = p.position.y;
  const w = g.world;
  g.player.model.visible = true;
  g.player.applyCamera = () => {
    g.camera.position.set(p.position.x + 7, p.position.y + 2.4, p.position.z + 7);
    g.camera.lookAt(p.position.x, p.position.y + 0.9, p.position.z);
  };
  return { y: +y.toFixed(1), ground: +w.heightAt(0, 0).toFixed(1), vy: +p.velocity.y.toFixed(2) };
});
await new Promise((r) => setTimeout(r, 1200));
await page.screenshot({ path: 'tests/shot-fly.png' });

console.log('черепаха у', JSON.stringify(turtle), '· полёт: высота', fly.y, 'м при земле',
  fly.ground, 'м → поднялся на', (fly.y - fly.ground).toFixed(1), 'м');
console.log('ошибки страницы:', errors.length ? errors.join(' | ') : 'нет');
await browser.close();
