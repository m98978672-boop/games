// Optional real-browser regression: npm install playwright-core, then set
// NODE_PATH, CHROMIUM_PATH and optionally DD_URL (serve the repository first).
const { chromium } = require('playwright-core');
const assert = require('node:assert/strict');
(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH, headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] });
  try {
    const page = await browser.newPage({ viewport: { width: 1000, height: 650 } });
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto(process.env.DD_URL || 'http://127.0.0.1:4173/dead-district/');
    await page.waitForFunction(() => window.DD_STATE);
    // Use a generated building, with other actors removed to make the route repeatable.
    await page.evaluate(() => { DD_STATE.zombies = []; DD_STATE.npcs = []; Object.assign(DD_STATE.player, { x: 24, y: 11, fx: 0, fy: -1 }); });
    await page.keyboard.press('e');
    assert.ok(await page.evaluate(() => DD_STATE.world.doors['24,10'].open));
    await page.keyboard.down('w'); await page.keyboard.down('d');
    await page.waitForFunction(() => DD_STATE.player.y < 8.05, null, { timeout: 15000 });
    await page.keyboard.up('w'); await page.keyboard.up('d');
    await page.keyboard.down('a'); await page.keyboard.down('w');
    await page.waitForFunction(() => DD_STATE.player.x < 23.2, null, { timeout: 10000 });
    await page.keyboard.up('a'); await page.keyboard.up('w');
    await page.keyboard.down('d'); await page.keyboard.down('s');
    await page.waitForFunction(() => DD_STATE.player.x > 24.8, null, { timeout: 10000 });
    await page.keyboard.up('d'); await page.keyboard.up('s');
    // A real interaction enters the car, hides the standing sprite and keeps the driver in the cabin.
    await page.evaluate(() => {
      Object.assign(DD_STATE.player, { x: 15, y: 15, fx: 0, fy: -1 });
      const car = DD_STATE.vehicles[0]; Object.assign(car, { x: 15, y: 15, angle: 0, fuel: 30 });
      DD_STATE.visible['15,15'] = true;
    });
    await page.keyboard.press('e');
    assert.ok(await page.evaluate(() => !!DD_STATE.player.inVehicleId));
    const carPosition = await page.evaluate(() => DD_STATE.player.x);
    await page.keyboard.down('w');
    await page.waitForFunction(x => DD_STATE.player.x > x + .3, carPosition, { timeout: 10000 });
    await page.keyboard.up('w');
    const driverImages = await page.evaluate(() => {
      DD_STATE.paused = true; const c = document.getElementById('game'), id = DD_STATE.player.inVehicleId;
      DD.Renderer.renderFrame(c, DD_STATE); const occupied = c.toDataURL();
      DD_STATE.player.inVehicleId = 'hidden-test'; DD.Renderer.renderFrame(c, DD_STATE); const empty = c.toDataURL();
      DD_STATE.player.inVehicleId = id; DD_STATE.paused = false; return [occupied, empty];
    });
    assert.notEqual(driverImages[0], driverImages[1], 'водитель показан в машине');
    await page.keyboard.press('e');
    assert.equal(await page.evaluate(() => DD_STATE.player.inVehicleId), '');
    await page.locator('#btn-event').click();
    assert.match(await page.locator('#modal-body').textContent(), /EVT-/);
    await page.locator('#modal-list button').nth(0).click();
    assert.ok(await page.evaluate(() => DD_STATE.encounterDay === DD_STATE.tw.day));
    await page.locator('#modal-close').click();
    await page.locator('#btn-save').click(); await page.locator('#btn-load').click();
    assert.ok(await page.evaluate(() => DD_STATE.encounterDay === DD_STATE.tw.day), 'событие сохраняется');
    await page.keyboard.press('F3');
    await page.locator('#f3-animation-toggle').click();
    await page.locator('#anim-variant').fill('10000');
    await page.locator('#anim-action').selectOption({index: 4});
    await page.locator('#anim-direction').selectOption({index: 3});
    await page.locator('#anim-style').selectOption({index: 4});
    assert.match(await page.locator('#anim-label').textContent(), /ANIM-1000000/);
    await page.locator('#f3-animation-toggle').click();
    await page.locator('#f3-search').fill('MOD-0001');
    await page.locator('.f3-card-preview').first().click();
    const views = [];
    for (let i = 0; i < 4; i++) {
      await page.locator(`[data-f3-direction="${i}"]`).click();
      views.push(await page.locator('#f3-inspect-canvas').evaluate(el => el.toDataURL()));
    }
    assert.equal(new Set(views).size, 4);
    await page.locator('#f3-inspect-bad').click();
    await page.locator('#f3-inspect-note').fill('Проверка');
    await page.locator('#f3-inspect-save-note').click();
    assert.ok(await page.evaluate(() => localStorage.getItem('dd_asset_ratings_v1').includes('Проверка')));
    await page.locator('#f3-search').fill('MESH-0001');
    await page.locator('.f3-card-preview').first().click();
    assert.ok(await page.locator('#f3-inspect-title').evaluate(el => el.getBoundingClientRect().top >= 0));
    const meshViews = [];
    for (let i = 0; i < 4; i++) {
      await page.locator(`[data-f3-direction="${i}"]`).click();
      meshViews.push(await page.locator('#f3-inspect-canvas').evaluate(el => el.toDataURL()));
    }
    assert.equal(new Set(meshViews).size, 4);
    await page.locator('#f3-mesh-number').fill('1002000');
    await page.locator('#f3-mesh-go').click();
    assert.equal(await page.locator('.f3-card-preview').count(), 1);
    await page.locator('.f3-card-preview').first().click();
    assert.match(await page.locator('#f3-inspect-title').textContent(), /VMESH-1002000/);
    await page.locator('#f3-inspect-bad').click();
    await page.locator('#f3-search').fill('');
    await page.locator('#f3-filter-bad').click();
    assert.ok(await page.locator('.f3-code').filter({ hasText: 'VMESH-1002000' }).count());
    await page.locator('[data-f3-rate=all]').click();
    await page.locator('[data-f3-tab=texture]').click();
    await page.locator('#f3-search').fill('TEX-4001');
    await page.locator('.f3-card-preview').first().click();
    const textures = [];
    for (let i = 0; i < 4; i++) {
      await page.locator(`[data-f3-direction="${i}"]`).click();
      textures.push(await page.locator('#f3-inspect-canvas').evaluate(el => el.toDataURL()));
    }
    assert.equal(new Set(textures).size, 4);
    await page.locator('[data-f3-tab=mesh]').click();
    await page.locator('#f3-search').fill('MESH-0001');
    await page.locator('.f3-card-preview').first().click();
    await page.locator('#f3-spin-toggle').click();
    assert.equal(await page.locator('#f3-spin-toggle').getAttribute('aria-pressed'), 'true');
    const textureStats = await page.evaluate(() => {
      const canvas = document.createElement('canvas'); canvas.width = canvas.height = 32;
      const ctx = canvas.getContext('2d', { willReadFrequently: true }); const hashes = new Set();
      const textures = DD.ContentPack.getAll().filter(item => item.kind === 'texture');
      for (const item of textures) {
        DD.ContentPack.renderItemToCanvas(canvas, item, 0, 0);
        const pixels = ctx.getImageData(0, 0, 32, 32).data; let hash = 2166136261;
        for (const value of pixels) hash = Math.imul(hash ^ value, 16777619);
        hashes.add(hash >>> 0);
      }
      return { total: textures.length, distinct: hashes.size };
    });
    assert.deepEqual(textureStats, { total: 10000, distinct: 10000 });
    assert.deepEqual(errors, []);
    console.log('[dead-district browser] OK');
  } finally { await browser.close(); }
})().catch(err => { console.error(err); process.exitCode = 1; });
