// Реальный прогон в headless Chromium: ошибки консоли, старт, кадры, скриншот.
import puppeteer from 'puppeteer-core';
import chromiumPkg from '@sparticuz/chromium';
import fs from 'node:fs';

const chromium = chromiumPkg.default || chromiumPkg;
const exe = await chromium.executablePath();
const args = [...chromium.args, '--no-sandbox', '--disable-setuid-sandbox', '--enable-unsafe-swiftshader', '--use-angle=swiftshader'];

const browser = await puppeteer.launch({
  args,
  executablePath: exe,
  headless: 'shell',
  // в песочнице нет системных libnss3/libnspr4 — подсовываем заглушки из /tmp/nssstub
  env: { ...process.env, LD_LIBRARY_PATH: process.env.LD_LIBRARY_PATH || '/tmp/nssstub' },
});
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 720 });

const logs = [];
page.on('console', (m) => logs.push(`[${m.type()}] ${m.text()}`.slice(0, 400)));
page.on('pageerror', (e) => logs.push(`[pageerror] ${e.message}`.slice(0, 600)));
page.on('requestfailed', (r) => logs.push(`[requestfailed] ${r.url()} ${r.failure()?.errorText}`));

const url = process.argv[2] || 'http://127.0.0.1:8080/index.html';
await page.goto(url, { waitUntil: 'load', timeout: 60000 });
await new Promise((r) => setTimeout(r, 800));

const status = await page.$eval('#boot-status', (el) => el.textContent);
console.log('boot status:', status);
await page.screenshot({ path: 'tests/shot-start.png' });

// жмём «Начать»
await page.click('#btn-start');
await new Promise((r) => setTimeout(r, 3500));

const info = await page.evaluate(() => {
  const g = window.__game;
  return {
    created: !!g,
    running: g ? g.running : null,
    paused: g ? g.paused : null,
    pos: g ? g.player.position.toArray().map((v) => +v.toFixed(2)) : null,
    clock: g ? g.sky.clockString() : null,
    children: g ? g.scene.children.length : null,
    fps: g ? g.fpsValue : null,
    fatal: document.getElementById('fatal-text').textContent.slice(0, 800),
    fatalVisible: !document.getElementById('fatal').classList.contains('hidden'),
    hudVisible: !document.getElementById('hud').classList.contains('hidden'),
  };
});
console.log('runtime:', JSON.stringify(info, null, 1));
await page.screenshot({ path: 'tests/shot-game.png' });

// проверим добычу: телепорт к дереву и удары
const harvest = await page.evaluate(async () => {
  const g = window.__game;
  const node = g.resources.nodes.find((n) => n.type === 'tree' && n.alive);
  g.player.setPosition(node.x + 2.4, node.z, g.world);
  g.state.inventory.axe = 1;
  g.selectSlot(4);
  const before = { ...g.state.inventory };
  for (let i = 0; i < 14; i++) { g.attackCooldown = 0; g.attack(); }
  return { before, after: { ...g.state.inventory }, alive: node.alive };
});
console.log('harvest:', JSON.stringify(harvest));

// проверим крафт и костёр
const craftAndFire = await page.evaluate(() => {
  const g = window.__game;
  g.state.inventory = Object.assign(g.state.inventory, { fiber: 4, wood: 8, stone: 6, flint: 2 });
  g.craft('rope');
  g.craft('knife');
  g.craft('campfireKit');
  const before = { knife: g.state.inventory.knife, rope: g.state.inventory.rope, kit: g.state.inventory.campfireKit };
  g.placeCampfire();
  const fires = g.resources.campfires.length;
  g.state.thirst = 30;
  const spring = g.resources.springs[0];
  if (spring) { g.player.setPosition(spring.x + 1.5, spring.z, g.world); g.interact(); }
  return { before, fires, thirst: Math.round(g.state.thirst), equipped: g.player.equippedId };
});
console.log('craft/fire:', JSON.stringify(craftAndFire));
await new Promise((r) => setTimeout(r, 600));
await page.screenshot({ path: 'tests/shot-craft.png' });

// немножко ходьбы
await page.evaluate(() => {
  window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyW' }));
});
await new Promise((r) => setTimeout(r, 2000));
await page.evaluate(() => {
  window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyW' }));
});
const after = await page.evaluate(() => (window.__game ? window.__game.player.position.toArray().map((v) => +v.toFixed(2)) : null));
console.log('after walking:', after);
await page.screenshot({ path: 'tests/shot-walk.png' });

console.log('--- console ---');
console.log(logs.slice(0, 40).join('\n') || '(пусто)');

await browser.close();
