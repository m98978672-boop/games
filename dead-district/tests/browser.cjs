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
    await page.keyboard.down('w');
    await page.waitForFunction(() => DD_STATE.player.y < 8.05, null, { timeout: 15000 });
    await page.keyboard.up('w');
    await page.keyboard.down('a');
    await page.waitForFunction(() => DD_STATE.player.x < 23.2, null, { timeout: 10000 });
    await page.keyboard.up('a');
    await page.keyboard.down('d');
    await page.waitForFunction(() => DD_STATE.player.x > 24.8, null, { timeout: 10000 });
    await page.keyboard.up('d');
    await page.keyboard.press('F3');
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
    await page.locator('#f3-spin-toggle').click();
    assert.equal(await page.locator('#f3-spin-toggle').getAttribute('aria-pressed'), 'true');
    assert.deepEqual(errors, []);
    console.log('[dead-district browser] OK');
  } finally { await browser.close(); }
})().catch(err => { console.error(err); process.exitCode = 1; });
