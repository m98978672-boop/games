// Optional real-browser smoke test. Start a local server from the repository root,
// then set WC_BROWSER_EXECUTABLE and WC_BROWSER_URL; playwright-core is required.
// Example: WC_BROWSER_EXECUTABLE=/path/to/chromium WC_BROWSER_URL=http://127.0.0.1:8765 node warehouse-crew/tests/browser-webgl.mjs
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const executablePath = process.env.WC_BROWSER_EXECUTABLE;
const base = process.env.WC_BROWSER_URL;
if (!executablePath || !base) {
  console.log('⚠ Реальный WebGL пропущен: задайте WC_BROWSER_EXECUTABLE и WC_BROWSER_URL');
  process.exit(0);
}
let chromium;
try { ({ chromium } = createRequire(import.meta.url)('playwright-core')); }
catch { throw new Error('Установите playwright-core для проверки реального WebGL'); }
const portrait = process.env.WC_BROWSER_VIEW === 'portrait';
const browser = await chromium.launch({ executablePath, headless: true,
  args: ['--no-sandbox', '--no-zygote', '--single-process', '--disable-dev-shm-usage', '--in-process-gpu',
    '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
try {
  const page = await browser.newPage({ viewport: portrait ? { width: 390, height: 844 } : { width: 844, height: 390 },
    isMobile: true, hasTouch: true });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error' && !m.text().includes('favicon.ico')) errors.push(m.text()); });
  await page.goto(new URL('/warehouse-crew/', base).href, { waitUntil: 'load' });
  await page.waitForFunction(() => window.WC?.game?.api?.ready && document.body.classList.contains('ready'), null, { timeout: 60000 });
  await page.waitForTimeout(1000);
  const actual = await page.evaluate(() => {
    const g = WC.game, gl = WC.world.renderer.getContext();
    WC.world.render(1 / 30, g);
    const root = WC.world.scene.children.find(o => o.userData?.rig === g.api.crew[0].id);
    const arms = [];
    root.traverse(o => {
      if (['upperArm', 'forearm', 'hand'].includes(o.userData?.recipe))
        arms.push({ recipe: o.userData.recipe, side: o.material.side, transparent: o.material.transparent, opacity: o.material.opacity });
    });
    const rect = el => { const r = el.getBoundingClientRect(); return { left: r.left, right: r.right, top: r.top, bottom: r.bottom }; };
    const stats = [...document.querySelectorAll('.top-stats .stat')].map(rect);
    const actions = rect(document.querySelector('.top-actions'));
    const header = rect(document.querySelector('.topbar'));
    g.setPaused(true);
    g.api.crew.forEach(w => g.command(w.id, 'wait'));
    g.selectWorker(g.api.crew[0].id);
    const late = g.sim.spawnOrder(), soon = g.sim.spawnOrder();
    late.mass = soon.mass = 8; late.deadline = 100; soon.deadline = 20;
    WC.ui.state.lastUiAt = -Infinity; WC.ui.frame(1 / 30);
    const rows = [...document.querySelectorAll('#order-list .order')];
    const sorted = rows[0].querySelector('.o-code').textContent === soon.code;
    rows[0].querySelector('.o-take').click();
    WC.ui.state.lastUiAt = -Infinity; WC.ui.frame(1 / 30);
    return { version: gl.getParameter(gl.VERSION), glError: gl.getError(), arms, stats, actions, header,
      sorted, assigned: soon.status === 'claimed', disabled: rows[1].querySelector('.o-take').disabled };
  });
  assert.match(actual.version, /WebGL/);
  assert.equal(actual.glError, 0);
  assert.equal(errors.length, 0, errors.join('\n'));
  assert(actual.arms.length >= 6 && actual.arms.every(a => !a.transparent && a.opacity === 1 && (a.recipe === 'hand' || a.side === 2)));
  assert(actual.sorted && actual.assigned && actual.disabled);
  assert(actual.stats.every((r, i) => r.left >= 0 && r.right <= (portrait ? 390 : 844) && r.top >= actual.actions.bottom - 1 && (i === 0 || r.left >= actual.stats[i - 1].right)));
  assert(actual.header.bottom < (portrait ? 125 : 120), 'заголовок не должен занимать слишком много экрана');
  console.log('✓ WebGL, непрозрачные руки, очередь и мобильная шапка (' + (portrait ? 'портрет' : 'ландшафт') + ')');
} finally {
  await browser.close();
}
