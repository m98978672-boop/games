// Реальный браузер: F8 и кнопка работают и в меню, и в живой игре.
import assert from 'node:assert/strict';
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import chromium, { inflate } from '@sparticuz/chromium';
import { chromium as playwright } from 'playwright-core';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.css': 'text/css', '.png': 'image/png', '.svg': 'image/svg+xml' };
const server = http.createServer(async (req, res) => {
  try {
    const file = decodeURIComponent(new URL(req.url, 'http://x').pathname).replace(/^\/+/, '') || 'index.html';
    if (file.split('/').includes('..')) throw Error('path');
    const path = resolve(root, file); if (!path.startsWith(root + sep)) throw Error('path');
    const bytes = await readFile(path);
    res.writeHead(200, { 'content-type': mime[extname(path)] || 'application/octet-stream' }); res.end(bytes);
  } catch { res.writeHead(404); res.end(); }
});
let browser;
try {
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); });
  const req = createRequire(import.meta.url), archive = resolve(dirname(req.resolve('@sparticuz/chromium')), '../bin/al2023.tar.br');
  const libs = resolve(await inflate(archive), 'lib');
  browser = await playwright.launch({ executablePath: process.env.FRONTLINE_CHROMIUM_PATH || await chromium.executablePath(), args: chromium.args, headless: true,
    env: { ...process.env, LD_LIBRARY_PATH: [libs, process.env.LD_LIBRARY_PATH].filter(Boolean).join(':') } });
  const page = await browser.newPage({ viewport: { width: 1100, height: 800 } });
  const errors = []; page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(`http://127.0.0.1:${server.address().port}/`, { waitUntil: 'load' });
  await page.waitForFunction(() => !!window.__frontline);
  await page.keyboard.press('F8');
  assert.equal(await page.locator('#inspector-panel').isVisible(), true);
  assert.match(await page.locator('.inspector-report').textContent(), /Запустите войну/);
  await page.keyboard.press('F8');
  assert.equal(await page.locator('#inspector-panel').isVisible(), false);
  await page.evaluate(() => { const g = window.__frontline.newGame({ seed: 5, aiVsAi: true }); g.paused = true; });
  await page.locator('.inspector-launch').click();
  assert.equal(await page.locator('#inspector-panel').isVisible(), true);
  assert.match(await page.locator('.inspector-report').textContent(), /seed 5/);
  assert.match(await page.locator('.inspector-report').textContent(), /не проверено/);
  const observed = await page.evaluate(() => {
    const app = window.__frontline, u = [...app.game.units.values()][0];
    u.goal = { x: u.x + 100, y: u.y }; u.arrived = false; u.pathFailed = false; u.perception.hasContact = false;
    app.inspector.motion.reset(); app.inspector.refresh(); app.game.time += 5.1; app.inspector.refresh();
    return app.inspector.report.entries.find((e) => e.code === 712);
  });
  assert.equal(observed.status, 'unverified');
  assert.match(observed.fact, /сопоставлено [1-9]/);
  const selected = await page.evaluate(() => {
    const output = document.querySelector('.inspector-report'), range = document.createRange();
    range.selectNodeContents(output); const selection = window.getSelection(); selection.removeAllRanges(); selection.addRange(range);
    const before = selection.toString(); window.__frontline.inspector.refresh();
    return !!before && selection.toString() === before;
  });
  assert.equal(selected, true, 'автообновление не сбрасывает ручное выделение');
  await page.evaluate(() => window.getSelection().removeAllRanges());
  const result = await page.evaluate(() => {
    const app = window.__frontline; app.renderer.bank.images.set('sprites/tank_1_3', null);
    app.game.logistics.stock[1].fuel = -1;
    app.inspector.refresh();
    return app.inspector.report.entries.filter((x) => x.status === 'fail').map((x) => x.code);
  });
  assert.ok(result.includes(702) && result.includes(706), `обнаружены: ${result}`);
  await page.locator('[data-action="close"]').click();
  assert.equal(await page.locator('#inspector-panel').isVisible(), false);
  assert.deepEqual(errors, []);
  console.log('Chromium: F8 в меню, кнопка в игре, реальные найденные повреждения, закрытие, ошибок страницы нет');
} finally {
  if (browser) await browser.close();
  if (server.listening) await new Promise((resolve) => server.close(resolve));
}
