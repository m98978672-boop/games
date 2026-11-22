// Настоящий Chromium для горизонтального/вертикального мобильного пульта.
// Нужны playwright-core и исполняемый Chromium:
// WC_DEPS=/path/to/node_modules WC_BROWSER_EXEC=/path/to/chromium node warehouse-crew/tests/panel-browser.mjs
// Дополнительные аргументы Chromium можно передать через WC_BROWSER_ARGS (JSON-массив).
// WC_TEST_WIDTH ограничивает прогон одним размером.
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
let playwright;
try { playwright = createRequire(path.join(process.env.WC_DEPS || path.join(root, 'node_modules'), 'noop.js'))('playwright-core'); }
catch { /* optional dependency */ }
if (!playwright || !process.env.WC_BROWSER_EXEC) {
  console.log('⚠ Chromium-тест пропущен: задайте WC_DEPS и WC_BROWSER_EXEC');
  process.exit(0);
}
const mime = { '.html':'text/html; charset=utf-8', '.js':'text/javascript', '.css':'text/css', '.json':'application/json', '.svg':'image/svg+xml', '.png':'image/png' };
const server = createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  let file = path.resolve(root, '.' + decodeURIComponent(url.pathname));
  if (!file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
  if (url.pathname.endsWith('/')) file = path.join(file, 'index.html');
  try { const data = await readFile(file); res.writeHead(200, {'Content-Type': mime[path.extname(file)] || 'application/octet-stream'}); res.end(data); }
  catch { res.writeHead(404).end(); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const base = 'http://127.0.0.1:' + server.address().port;
const args = process.env.WC_BROWSER_ARGS ? JSON.parse(process.env.WC_BROWSER_ARGS) : ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader'];
let browser;
try {
  // Отдельные процессы для single-process Chromium в серверных окружениях.
  for (const scenario of [
    { width:844, height:390, mobile:true },
    { width:960, height:430, mobile:true },
    { width:1280, height:800, mobile:false },
  ].filter(view => !process.env.WC_TEST_WIDTH || view.width === Number(process.env.WC_TEST_WIDTH))) {
    browser = await playwright.chromium.launch({ executablePath:process.env.WC_BROWSER_EXEC, args, headless:true });
    const page = await browser.newPage({viewport:{width:scenario.width,height:scenario.height}, isMobile:scenario.mobile, hasTouch:scenario.mobile});
    const errors = []; page.on('pageerror', error => errors.push(error.message));
    await page.goto(base + '/warehouse-crew/', {waitUntil:'load', timeout:60000});
    await page.waitForFunction(() => window.WC && WC.game && WC.game.api.ready && WC.world.state.ready, {timeout:60000});
    const open = page.locator('#btn-panel-open'), close = page.locator('#btn-panel-collapse'), panel = page.locator('#control-panel');
    if (!scenario.mobile) {
      assert.equal(await open.isVisible(), false);
      assert.equal(await panel.isVisible(), true);
    } else {
      assert.equal(await page.locator('body').getAttribute('data-sheet'), 'hidden');
      assert.equal(await panel.isVisible(), false);
      assert.equal(await open.isVisible(), true);
      const bounds = await open.boundingBox(); assert(bounds.width >= 44 && bounds.height >= 44);
      assert.equal(await open.getAttribute('aria-controls'), 'control-panel');
      await open.focus(); await page.keyboard.press('Enter');
      assert.equal(await page.locator('body').getAttribute('data-sheet'), 'half');
      assert.equal(await open.isVisible(), false); assert.equal(await close.getAttribute('aria-expanded'), 'true');
      assert.equal(await page.evaluate(() => document.activeElement.id), 'btn-panel-collapse');
      await close.click();
      assert.equal(await open.isVisible(), true); assert.equal(await panel.isVisible(), false);
      assert.equal(await page.evaluate(() => document.activeElement.id), 'btn-panel-open');
      await page.keyboard.press('Space'); await page.waitForTimeout(450);
      assert.equal(await panel.isVisible(), true);
      // Список остатков достижим без обходного пути через магазин.
      await page.evaluate(() => { WC.game.setPaused(true); const o=WC.game.sim.spawnOrder(); WC.game.sim.store(o,WC.game.api.crew[0].id); WC.ui.state.lastUiAt=-Infinity; WC.ui.frame(1/30); });
      await page.locator('#stock-heading').scrollIntoViewIfNeeded(); await page.locator('#stock-heading').click();
      const stock = page.locator('[data-shipping-order]').first(); await stock.scrollIntoViewIfNeeded(); await stock.click();
      assert.equal(await stock.getAttribute('aria-pressed'), 'true');
      await close.click();
      // При повороте на портрет язычок остаётся доступным и открывает шторку.
      await page.setViewportSize({width:390,height:844}); await page.waitForTimeout(500);
      assert.equal(await open.isVisible(), false); assert.equal(await page.locator('#sheet-handle').isVisible(), true);
      await page.locator('#sheet-handle').focus(); await page.keyboard.press('Enter'); await page.waitForTimeout(450);
      assert.notEqual(await page.locator('body').getAttribute('data-sheet'), 'hidden');
      await page.setViewportSize({width:scenario.width,height:scenario.height}); await page.waitForTimeout(500);
      assert.equal(await panel.isVisible(), true);
      await close.click(); assert.equal(await open.isVisible(), true);
    }
    // Ведомость фуры на десктопе и в обеих ориентациях телефона.
    if (scenario.width === 844) { await page.setViewportSize({width:390,height:844}); await page.waitForTimeout(500); }
    async function openControls() {
      if (await open.isVisible()) await open.click();
      else if (await page.locator('#sheet-handle').isVisible() && await page.locator('body').getAttribute('data-sheet') === 'hidden') await page.locator('#sheet-handle').click();
      await page.waitForTimeout(450);
    }
    await openControls();
    const cargoIds = await page.evaluate(() => {
      const g=WC.game; g.restart(); g.setPaused(true);
      const a=g.sim.spawnOrder(), b=g.sim.spawnOrder();
      g.sim.store(a,g.api.crew[0].id); g.sim.store(b,g.api.crew[0].id);
      g.setShippingPriority(a.id,true); WC.ui.state.lastUiAt=-Infinity; WC.ui.frame(1/30);
      return { first:a.id, second:b.id, code:a.code };
    });
    const call = page.locator('[data-call-truck="load"]'); await call.scrollIntoViewIfNeeded(); await call.click();
    const truckId = await page.evaluate(() => WC.game.sim.activeTruck('load').id);
    let details = page.locator('[data-truck-cargo="'+truckId+'"]');
    let summary = details.locator('summary'); await summary.scrollIntoViewIfNeeded(); await summary.click();
    let cargoRow = details.locator('[data-truck-order="'+cargoIds.first+'"]');
    assert.match(await cargoRow.textContent(), /★ отгрузка/); assert.match(await cargoRow.textContent(), /Ожидает бригаду/);
    const r = await cargoRow.boundingBox(); assert(r.x >= 0 && r.x+r.width <= (scenario.width === 844 ? 390 : scenario.width));
    const priorityFilter = page.locator('[data-order-filter="priority"]'); await priorityFilter.scrollIntoViewIfNeeded(); await priorityFilter.click();
    const jump = cargoRow.locator('[data-cargo-order]'); await jump.scrollIntoViewIfNeeded();
    const stateBeforeJump = await page.evaluate(() => {const c=WC.game.captureCheckpoint(); return JSON.stringify({warehouse:c.warehouse,crew:c.crew});});
    await jump.click();
    assert.equal(await page.locator('[data-order-filter="all"]').getAttribute('aria-pressed'), 'true');
    const queueCard = page.locator('#order-list .order:focus');
    assert.equal(await queueCard.getAttribute('aria-label'), 'Заказ '+cargoIds.code);
    assert.equal(await page.evaluate(() => {const c=WC.game.captureCheckpoint(); return JSON.stringify({warehouse:c.warehouse,crew:c.crew});}), stateBeforeJump);
    const visibleArea = await queueCard.evaluate(el => {
      const rects=[el.getBoundingClientRect(), document.querySelector('#order-list').getBoundingClientRect(), document.querySelector('.ctl-scroll').getBoundingClientRect(), document.querySelector('#control-panel').getBoundingClientRect()];
      return Math.min(innerHeight,...rects.map(r=>r.bottom))-Math.max(0,...rects.map(r=>r.top));
    });
    assert(visibleArea > 0, 'переход прокручивает оба вложенных списка до карточки');
    const take = queueCard.locator('.o-take'); await take.scrollIntoViewIfNeeded(); await take.click();
    await page.evaluate(() => { WC.ui.state.lastUiAt=-Infinity; WC.ui.frame(1/30); });
    assert.match(await cargoRow.textContent(), /Назначен:/);
    await summary.scrollIntoViewIfNeeded(); await summary.focus();
    await page.evaluate(() => { WC.ui.state.lastUiAt=-Infinity; WC.ui.frame(1/30); });
    assert.equal(await summary.evaluate(el=>document.activeElement===el),true);
    // Восстановление использует сохранённые данные, а не разметку.
    await page.evaluate(() => WC.save.save(WC.game));
    await page.reload({waitUntil:'load'}); await page.waitForFunction(() => window.WC && WC.game && WC.game.api.ready, {timeout:60000});
    await openControls(); details = page.locator('[data-truck-cargo="'+truckId+'"]'); summary=details.locator('summary');
    await summary.scrollIntoViewIfNeeded(); await summary.click(); cargoRow=details.locator('[data-truck-order="'+cargoIds.first+'"]');
    assert.match(await cargoRow.textContent(), /Назначен:/); assert.match(await cargoRow.textContent(), /★ отгрузка/);
    const jumpClaimed = cargoRow.locator('[data-cargo-order]'); await jumpClaimed.scrollIntoViewIfNeeded(); await jumpClaimed.click();
    assert.equal(await page.locator('#order-list .order:focus').getAttribute('aria-label'), 'Заказ '+cargoIds.code);
    assert.equal(await page.locator('#order-list .order:focus .o-take').isDisabled(),true);
    await summary.scrollIntoViewIfNeeded(); await summary.focus();
    await page.evaluate(id=>{ WC.game.dispatchTruck(id); WC.ui.state.lastUiAt=-Infinity; WC.ui.frame(1/30); },truckId);
    assert.equal(await details.isVisible(),false); assert.equal(await page.evaluate(()=>document.activeElement.id),'dock-heading');
    console.log(`✓ Ведомость фуры: ${scenario.width === 844 ? '390×844' : scenario.width+'×'+scenario.height}, сохранение и отъезд`);
    assert.deepEqual(errors, []);
    console.log(`✓ Chromium ${scenario.width}×${scenario.height}: пульт, фокус и доступность`);
    await browser.close(); browser = null;
  }
} finally {
  if (browser) await browser.close();
  await new Promise(resolve => server.close(resolve));
}
