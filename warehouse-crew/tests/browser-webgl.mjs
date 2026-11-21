// Optional real-browser smoke test. Start a local server from the repository root,
// then set WC_BROWSER_EXECUTABLE and WC_BROWSER_URL; playwright-core is required.
// Example: WC_BROWSER_EXECUTABLE=/path/to/chromium WC_BROWSER_URL=http://127.0.0.1:8765 node warehouse-crew/tests/browser-webgl.mjs
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
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
  const context = await browser.newContext({ viewport: portrait ? { width: 390, height: 844 } : { width: 844, height: 390 },
    isMobile: true, hasTouch: true });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error' && !m.text().includes('favicon.ico')) errors.push(m.text()); });
  await page.goto(new URL('/warehouse-crew/', base).href, { waitUntil: 'load' });
  await page.waitForFunction(() => window.WC?.game?.api?.ready && document.body.classList.contains('ready'), null, { timeout: 60000 });
  await page.waitForTimeout(1000);
  await page.locator('[data-quick="rest"]').tap();
  const subtitle = page.locator('#dialogue-subtitle');
  assert(await subtitle.isVisible());
  assert.match(await subtitle.innerText(), /передохну/);
  assert.equal(await subtitle.evaluate(e => getComputedStyle(e).pointerEvents), 'none');
  const subtitleBounds = await subtitle.boundingBox();
  assert(subtitleBounds.x >= 0 && subtitleBounds.x + subtitleBounds.width <= (portrait ? 390 : 844));
  await page.screenshot({path: '/tmp/wc-dialogue-' + (portrait ? 'portrait' : 'landscape') + '.png'});
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
    // The WebGL test can take longer on a busy runner: start with a fresh,
    // paused shift so automatically spawned orders cannot affect assertions.
    g.restart(); g.setPaused(true);
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
      sorted, assigned: soon.status === 'claimed', disabled: rows[1].querySelector('.o-take').disabled, lateId: late.id, lateCode: late.code, soonId: soon.id, soonCode: soon.code };
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
  // The paused shift keeps this UI check independent of animation timing.
  await page.evaluate(id => {
    WC.game.sim.state.orders.find(o => o.id === id).physics = true;
    WC.ui.state.lastUiAt = -Infinity; WC.ui.frame(1 / 30);
  }, actual.soonId);
  const movingRow = page.locator('#order-list .order').filter({hasText: actual.soonCode});
  await movingRow.scrollIntoViewIfNeeded();
  await page.waitForFunction(el => { const r = el.getBoundingClientRect(); return r.left >= 0 && r.right <= innerWidth; }, await movingRow.elementHandle());
  assert.match(await movingRow.locator('.o-who').innerText(), /ждёт остановки/);
  assert.match(await movingRow.locator('.o-abc').innerText(), /движется/);
  const movingBounds = await movingRow.boundingBox();
  assert(movingBounds.x >= 0 && movingBounds.x + movingBounds.width <= (portrait ? 390 : 844));
  await page.evaluate(id => {
    WC.game.sim.state.orders.find(o => o.id === id).physics = false;
    WC.ui.state.lastUiAt = -Infinity; WC.ui.frame(1 / 30);
  }, actual.soonId);
  assert.match(await movingRow.locator('.o-who').innerText(), /в работе/);
  console.log('✓ Движущийся груз и ожидание остановки в мобильной очереди');
  await page.evaluate(id => {
    const order = WC.game.sim.state.orders.find(o => o.id === id);
    order.direction = 'return'; order.deadline = -100;
    WC.ui.state.lastUiAt = -Infinity; WC.ui.frame(1 / 30);
  }, actual.lateId);
  const returningRow = page.locator('#order-list .order').filter({hasText:actual.lateCode});
  await returningRow.scrollIntoViewIfNeeded();
  await page.waitForFunction(el => { const r = el.getBoundingClientRect(); return r.left >= 0 && r.right <= innerWidth; }, await returningRow.elementHandle());
  assert.match(await returningRow.locator('.o-info').innerText(), /возврат на полку/);
  assert.equal(await returningRow.locator('.o-timer').innerText(), 'без срока');
  assert.match(await page.locator('#queue-summary').innerText(), /срок ≤ 30 с: 1/);
  const urgentFilter = page.locator('[data-order-filter="soon"]');
  await urgentFilter.scrollIntoViewIfNeeded(); await urgentFilter.tap();
  assert.equal(await page.locator('#order-list .o-code').innerText(), actual.soonCode);
  await page.evaluate(id => {
    const order = WC.game.sim.state.orders.find(o => o.id === id);
    delete order.direction; order.deadline = 100;
    document.querySelector('[data-order-filter="all"]').click();
  }, actual.lateId);
  console.log('✓ Возврат без срока в мобильной очереди и фильтре');
  const concern = await page.evaluate(() => {
    const a = WC.game.api.crew[1], b = WC.game.api.crew[2];
    a.body.energy = .18;
    b.body.injuries.push({type:'muscle',part:'back',severity:.3,at:0,cause:'тест'});
    WC.ui.state.lastUiAt = -Infinity; WC.ui.frame(1 / 30);
    return {a:a.id, aName:a.name, b:b.id, bName:b.name};
  });
  const energyRow = page.locator('#safety-list .safety-row').filter({hasText:concern.aName});
  const injuryRow = page.locator('#safety-list .safety-row').filter({hasText:concern.bName});
  const chooseWorker = energyRow.getByRole('button', {name:'Выбрать: ' + concern.aName});
  await chooseWorker.scrollIntoViewIfNeeded();
  await page.waitForFunction(el => { const r = el.getBoundingClientRect(); return r.left >= 0 && r.right <= innerWidth; }, await chooseWorker.elementHandle());
  const safetySize = await chooseWorker.boundingBox();
  assert(safetySize.height >= 38 && safetySize.x >= 0 && safetySize.x + safetySize.width <= (portrait ? 390 : 844), JSON.stringify(safetySize));
  assert.match(await energyRow.innerText(), /энергия 18%/);
  assert.match(await injuryRow.innerText(), /травма/);
  await page.screenshot({path:'/tmp/wc-safety-' + (portrait ? 'portrait' : 'landscape') + '.png'});
  await chooseWorker.tap(); assert.equal(await page.evaluate(() => WC.game.api.activeWorkerId), concern.a);
  const inspectWorker = injuryRow.getByRole('button', {name:'Осмотреть: ' + concern.bName});
  await inspectWorker.scrollIntoViewIfNeeded(); await inspectWorker.tap();
  assert.equal(await page.evaluate(() => WC.ui.state.inspectorWorkerId), concern.b);
  assert.match(await page.locator('#insp-who').innerText(), new RegExp(concern.bName));
  await page.evaluate(() => {
    WC.ui.closeModal(); WC.game.api.crew[1].body.energy = .8; WC.game.api.crew[2].body.injuries = [];
    WC.ui.select(WC.game.api.crew[0].id); WC.ui.state.lastUiAt = -Infinity; WC.ui.frame(1 / 30);
  });
  assert.equal(await page.locator('#safety-list .safety-row').count(),0);
  const priorityRow = page.locator('#order-list .order').filter({hasText: actual.lateCode});
  const priorityButton = priorityRow.locator('.o-priority');
  await priorityButton.scrollIntoViewIfNeeded();
  assert.equal(await priorityButton.getAttribute('aria-pressed'), 'false');
  const prioritySize = await priorityButton.boundingBox();
  assert(prioritySize.height >= 38 && prioritySize.x >= 0 && prioritySize.x + prioritySize.width <= (portrait ? 390 : 844), JSON.stringify(prioritySize));
  await priorityButton.tap();
  assert.equal(await priorityButton.getAttribute('aria-pressed'), 'true');
  assert.equal(await page.evaluate(id => WC.game.sim.state.orders.find(o => o.id === id).dispatchPriority, actual.lateId), true);
  const filter = name => page.locator('[data-order-filter="' + name + '"]');
  const summary = await page.locator('#queue-summary').innerText();
  assert.match(summary, /Свободных ячеек: 34\/36/);
  assert.match(summary, /срок ≤ 30 с: 1/);
  const pendingFilter = filter('pending'); await pendingFilter.scrollIntoViewIfNeeded();
  const filterBounds = await pendingFilter.boundingBox();
  assert(filterBounds.height >= 38 && filterBounds.x >= 0 && filterBounds.x + filterBounds.width <= (portrait ? 390 : 844));
  await pendingFilter.tap();
  assert.equal(await pendingFilter.getAttribute('aria-pressed'), 'true');
  assert.equal(await page.locator('#order-list .order').count(), 1);
  assert.equal(await page.locator('#order-list .o-code').innerText(), actual.lateCode);
  await filter('working').tap(); assert.equal(await page.locator('#order-list .order').count(), 1);
  await filter('priority').tap(); assert.equal(await page.locator('#order-list .o-code').innerText(), actual.lateCode);
  await page.waitForTimeout(500);
  await page.screenshot({path: '/tmp/wc-queue-' + (portrait ? 'portrait' : 'landscape') + '.png'});
  await filter('soon').tap(); assert.equal(await page.locator('#order-list .order').count(), 1);
  await filter('all').tap(); assert.equal(await page.locator('#order-list .order').count(), 2);
  await page.locator('#btn-voice').scrollIntoViewIfNeeded();
  assert.equal(await page.locator('#btn-voice').getAttribute('aria-pressed'), 'false');
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
    g.api.crew[0].body.energy = .41; g.api.crew[3].body.energy = .19;
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
  assert.equal(await page.evaluate(id => WC.game.sim.state.orders.find(o => o.id === id).dispatchPriority, actual.lateId), true);
  assert.match(await page.locator('#safety-list .safety-row').innerText(), /энергия 19%/);
  assert.equal(await page.locator('#order-list .order').filter({hasText:actual.lateCode}).locator('.o-priority').getAttribute('aria-pressed'), 'true');
  await page.evaluate(() => WC.ui.sheet.set('full', true));
  const reportButton = page.locator('#btn-report');
  await reportButton.scrollIntoViewIfNeeded();
  await page.waitForFunction(el => { const r = el.getBoundingClientRect(); return r.left >= 0 && r.right <= innerWidth; }, await reportButton.elementHandle());
  await reportButton.tap();
  const report = page.locator('.shift-report');
  assert.equal(await report.locator('#report-title').textContent(),'Отчёт смены');
  assert.match(await report.textContent(), /Падения/);
  assert.match(await report.innerText(), /Полина Верес/);
  const reportActions = report.locator('.report-actions button');
  assert.equal(await reportActions.count(), 3);
  for (const button of await reportActions.all()) {
    const rect = await button.boundingBox();
    assert(rect.height >= 38 && rect.x >= 0 && rect.y >= 0 && rect.x + rect.width <= (portrait ? 390 : 844) && rect.y + rect.height <= (portrait ? 844 : 390), JSON.stringify(rect));
  }
  await page.waitForTimeout(500);
  await page.screenshot({path:'/tmp/wc-report-' + (portrait ? 'portrait' : 'landscape') + '.png', animations:'disabled'});
  const [download] = await Promise.all([page.waitForEvent('download'), report.getByRole('button', {name:'Скачать отчёт'}).tap()]);
  const reportFile = JSON.parse(await fs.readFile(await download.path(), 'utf8'));
  assert.equal(reportFile.summary.crew.length,4); assert.equal(reportFile.summary.staff.length,1);
  assert.equal(reportFile.summary.score,800); assert(!reportFile.checkpoint);
  const inspectFromReport = report.getByRole('button', {name:'Осмотреть: ' + await page.evaluate(() => WC.game.api.crew[3].name)});
  await inspectFromReport.scrollIntoViewIfNeeded(); await inspectFromReport.tap();
  assert.equal(await page.evaluate(() => WC.ui.state.inspectorWorkerId),saved.id);
  await page.evaluate(() => WC.ui.closeModal());
  console.log('✓ Мобильный отчёт: показатели, скачивание и инспектор');
  // Headless Chromium не меняет document.hidden при переключении вкладок;
  // явно доставляем это событие, затем проверяем сохранение после перезагрузки.
  const background = await page.evaluate(() => {
    WC.game.setPaused(false); WC.game.api.crew[0].body.energy = .34;
    Object.defineProperty(document, 'hidden', {configurable:true, value:true});
    document.dispatchEvent(new Event('visibilitychange'));
    delete document.hidden;
    const saved = JSON.parse(localStorage.getItem(WC.save.CHECKPOINT_KEY));
    window.dispatchEvent(new Event('pagehide'));
    return saved;
  });
  assert.equal(background.checkpoint.runtime.paused,true);
  assert.equal(background.checkpoint.crew[0].state.body.energy,.34);
  await page.reload({waitUntil:'load'});
  await page.waitForFunction(() => window.WC?.game?.api?.ready && document.body.classList.contains('ready'), null, {timeout:20000});
  assert.equal(await page.evaluate(() => WC.game.api.resumeStatus), 'restored');
  assert.equal(await page.evaluate(() => WC.game.state.paused), true);
  assert.equal(await page.evaluate(() => WC.game.api.crew[0].body.energy), .34);
  console.log('✓ События фона и восстановление смены в Chromium');
  await page.evaluate(() => {
    WC.ui.sheet.set('full', true);
    WC.game.api.log.splice(0, WC.game.api.log.length, ...Array.from({length:26}, (_, i) => ({t:i, text:'Запись ' + i, tone:i%2 ? 'bad' : 'good'})));
    WC.ui.state.lastUiAt = -Infinity; WC.ui.frame(1/30);
  });
  const journalWarning = page.locator('[data-journal-filter="warning"]');
  await journalWarning.scrollIntoViewIfNeeded();
  await page.waitForFunction(el => { const r = el.getBoundingClientRect(); return r.left >= 0 && r.right <= innerWidth; }, await journalWarning.elementHandle());
  const journalButtonSize = await journalWarning.boundingBox();
  assert(journalButtonSize.height >= 38 && journalButtonSize.x + journalButtonSize.width <= (portrait ? 390 : 844));
  await journalWarning.tap();
  assert.equal(await journalWarning.getAttribute('aria-pressed'),'true');
  assert.equal(await page.locator('#journal-list .journal-entry').count(), 12);
  assert.match(await page.locator('#journal-list .journal-entry').first().innerText(),/Проблема.*Запись 25/);
  const journalMore = page.locator('#journal-more');
  await journalMore.scrollIntoViewIfNeeded(); await journalMore.tap();
  assert.equal(await page.locator('#journal-list .journal-entry').count(), 13);
  assert(await journalMore.isHidden());
  await page.screenshot({path:'/tmp/wc-journal-' + (portrait ? 'portrait' : 'landscape') + '.png'});
  console.log('✓ Мобильный журнал, фильтр предупреждений и просмотр истории');
  await page.evaluate(() => WC.game.endShift());
  assert.equal(await page.locator('#report-title').textContent(), 'Смена закрыта');
  assert(await page.locator('.shift-report').getByRole('button', {name:'Новая смена'}).isVisible());
  await page.reload({waitUntil:'load'});
  await page.waitForFunction(() => window.WC?.game?.api?.ready && document.body.classList.contains('ready'), null, {timeout:20000});
  assert.equal(await page.locator('#report-title').textContent(), 'Смена закрыта');
  assert.equal(await page.evaluate(() => WC.game.state.shiftEnded),true);
  console.log('✓ Итоги завершённой смены восстанавливаются после перезагрузки');


  assert.equal(errors.length, 0, errors.join('\n'));
  console.log('✓ Сводка бригады, выбор, инспектор и восстановление на телефоне');
  console.log('✓ Фильтры, сводка и приоритет заказа: мобильный тап и восстановление после перезагрузки');
  console.log('✓ Субтитры, быстрый приказ и настройка озвучки на телефоне');
  console.log('✓ Ночной свет, карта и сохранение режима при перезагрузке в браузере');
  console.log('✓ WebGL, непрозрачные руки, очередь и мобильная шапка (' + (portrait ? 'портрет' : 'ландшафт') + ')');
} finally {
  await browser.close();
}
