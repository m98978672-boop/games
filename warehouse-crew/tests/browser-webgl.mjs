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
  const dayLight = await page.evaluate(() => WC.world.scene.children.find(o => o.isHemisphereLight).intensity);
  await page.evaluate(() => WC.ui.sheet.set('full', true));
  await page.locator('[data-lighting="night"]').scrollIntoViewIfNeeded();
  await page.locator('[data-lighting="night"]').click();
  const lighting = await page.evaluate((day) => {
    const findHemi = () => WC.world.scene.children.find(o => o.isHemisphereLight);
    WC.world.render(1 / 30, WC.game);
    const night = findHemi().intensity;
    const selected = document.querySelector('[data-lighting="night"]').getAttribute('aria-pressed');
    WC.world.setMode('map2d'); const noFog = WC.world.scene.fog === null;
    WC.world.setMode('third'); const fog = WC.world.scene.fog.color.getHex();
    return {day, night, selected, noFog, fog, mode:WC.game.api.shiftMode};
  }, dayLight);
  assert(lighting.day > lighting.night && lighting.night > 0);
  assert.deepEqual({selected:lighting.selected, noFog:lighting.noFog, fog:lighting.fog, mode:lighting.mode},
    {selected:'true', noFog:true, fog:0x080e1c, mode:'night'});
  const saved = await page.evaluate(() => {
    const g = WC.game;
    g.sim.state.stats.score = 1000;
    const hired = g.hireWorker(); const medic = g.buyStaff('medic');
    g.api.crew[0].body.energy = .41;
    g.setSpeed(4); g.setPaused(true);
    return {ok: hired.ok && medic.ok && WC.save.save(g), time: g.sim.state.time,
      id: g.api.crew[3].id, orders: g.sim.state.orders.length};
  });
  assert(saved.ok);
  await page.reload({waitUntil:'load'});
  try { await page.waitForFunction(() => window.WC?.game?.api?.ready && document.body.classList.contains('ready'), null, {timeout:20000}); }
  catch (error) { throw new Error('Повторный запуск: ' + errors.join(' | ') + ' modal=' + await page.locator('#modal-root').innerText()); }
  const resumed = await page.evaluate(() => ({ status: WC.game.api.resumeStatus,
    crew: WC.game.api.crew.length, staff: WC.game.api.staff.length, id: WC.game.api.crew[3]?.id,
    time: WC.game.sim.state.time, orders: WC.game.sim.state.orders.length,
    energy: WC.game.api.crew[0].body.energy, paused: WC.game.state.paused, speed: WC.game.state.speed,
    speedOn: document.querySelector('#speed-seg button.on')?.getAttribute('data-speed'),
    mode: WC.game.api.shiftMode, lightingOn: document.querySelector('#lighting-seg button.on')?.getAttribute('data-lighting'),
    lightLevel: WC.world.scene.children.find(o => o.isHemisphereLight)?.intensity }));
  assert.deepEqual(resumed, {status:'restored', crew:4, staff:1, id:saved.id, time:saved.time, orders:saved.orders,
    energy:.41, paused:true, speed:4, speedOn:'4', mode:'night', lightingOn:'night', lightLevel:lighting.night});
  assert.equal(errors.length, 0, errors.join('\n'));
  console.log('✓ Ночной свет, карта и сохранение режима при перезагрузке в браузере');
  console.log('✓ WebGL, непрозрачные руки, очередь и мобильная шапка (' + (portrait ? 'портрет' : 'ландшафт') + ')');
} finally {
  await browser.close();
}
