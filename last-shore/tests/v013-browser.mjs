// v0.13 в настоящем браузере: F8-бот, F9-курсор, полёт, копание до камня
// и до пустоты шахты. Нужен сервер на http://127.0.0.1:8080.
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
await page.setViewport({ width: 1000, height: 620 });
const errors = [];
page.on('pageerror', (e) => errors.push('ERR ' + e.message.slice(0, 400)));
page.on('console', (m) => {
  const t = m.text();
  if (m.type() === 'error' || /Shader|ERROR|THREE.WebGLProgram/i.test(t)) errors.push('LOG ' + t.slice(0, 400));
});

await page.goto('http://127.0.0.1:8080/index.html', { waitUntil: 'load' });
await page.click('#btn-start');
await new Promise((r) => setTimeout(r, 4000));

// --- F8: бот появляется, ходит и ведёт отчёт ---
await page.keyboard.press('F8');
await new Promise((r) => setTimeout(r, 12000));
const walking = await page.evaluate(() => {
  const b = window.__game.bot;
  return {
    active: !!b.active,
    visible: !!b.mesh && b.mesh.visible,
    walked: +(b.walked || 0).toFixed(1),
    state: b.state,
    entries: b.entries.length,
    panel: !document.getElementById('bot-report').classList.contains('hidden'),
    rows: document.querySelectorAll('#bot-list .bot-row').length,
  };
});
await page.screenshot({ path: 'tests/shot-bot.png' });
console.log('бот: появился', walking.active && walking.visible, '· прошёл', walking.walked, 'м ·',
  'состояние', walking.state, '· строк в отчёте', walking.rows, '· панель', walking.panel);

// все проверки — разом в этом же браузере (не ждём медленный headless-шаг)
const checks = await page.evaluate(() => {
  const g = window.__game;
  const b = new window.__botCtor(g);
  return b.checks.map((c) => {
    try {
      const r = c.run(g);
      return { name: c.name, ok: !!r.ok, fact: r.fact, expect: r.expect };
    } catch (err) {
      return { name: c.name, ok: false, fact: 'упало: ' + err.message, expect: '—' };
    }
  });
});
const bad = checks.filter((c) => !c.ok);
console.log('проверок:', checks.length, '· не сходится:', bad.length);
if (bad.length) console.log('НЕ СХОДИТСЯ:\n' + bad.map((b) => `${b.name} → ${b.fact}`).join('\n'));
await page.keyboard.press('F8');
const closed = await page.evaluate(() => document.getElementById('bot-report').classList.contains('hidden'));
console.log('F8 закрывает отчёт:', closed);

// --- F9: курсор отпускается и ловится обратно ---
await page.keyboard.press('F9');
const free = await page.evaluate(() => window.__game.cursorFree);
await page.keyboard.press('F9');
const back = await page.evaluate(() => window.__game.cursorFree);
console.log('F9: свободен', free, '· снова захвачен', !back);

// --- копание: земля → камень → пустота, вода только на пляже ---
const dig = await page.evaluate(() => {
  const g = window.__game;
  const w = g.world;
  let spot = null;
  const p = g.player.position;
  for (let r = 4; r <= 30 && !spot; r += 2) {
    for (let i = 0; i < 20 && !spot; i++) {
      const a = (i / 20) * Math.PI * 2;
      const x = p.x + Math.cos(a) * r;
      const z = p.z + Math.sin(a) * r;
      if (w.heightAt(x, z) > 3 && w.slopeAt(x, z) < 0.45) spot = { x, z };
    }
  }
  if (!spot) return { ok: false, why: 'нет сухого места' };
  const snap = w.heights.slice();
  const seen = [];
  let res = null;
  let reached = false;
  for (let i = 0; i < 20; i++) {
    res = w.dig(spot.x, spot.z, { radius: 1.6, depth: 0.45, mine: 99 });
    seen.push(res.layer);
    if (res.void) { reached = true; break; }
  }
  // яма вырезана из рельефа по клеткам сетки, а не наложена поверху
  const triBase = w.terrainIndexBase ? w.terrainIndexBase.length / 3 : 0;
  const idx = w.terrain.geometry.index;
  const cutTris = triBase - (idx ? idx.count / 3 : 0);
  const pit = w.pitAt(spot.x, spot.z);
  const step = 360 / (Math.round(Math.sqrt(w.heights.length)) - 1);
  const onGrid = pit
    ? [pit.rect.x0, pit.rect.x1, pit.rect.z0, pit.rect.z1]
      .every((v) => Math.abs((v + 180) / step - Math.round((v + 180) / step)) < 1e-6)
    : false;
  const heightsKept = Math.abs(w.heights[0] - snap[0]) < 1e-6;
  const sunk = pit ? w.baseHeightAt(spot.x, spot.z) - w.heightAt(spot.x, spot.z) : 0;
  for (let i = 0; i < snap.length; i++) w.heights[i] = snap[i];
  w.digStore.clear();
  w.surfaceStore.clear();
  w.pits.forEach((pp) => { w.pitGroup.remove(pp.group); if (pp.walls.geometry) pp.walls.geometry.dispose(); });
  w.pits.clear();
  w.cutPits.clear();
  w.cutCells.clear();
  w._rebuildTerrainIndex();
  w._applyHeights();
  return {
    ok: reached && seen.includes('stone') && !seen.includes('sand') && cutTris > 0 && onGrid && !!pit && pit.steps >= 2,
    layers: [...new Set(seen)].join(' → '),
    cutTris,
    onGrid,
    cells: pit ? pit.rect.cells : 0,
    steps: pit ? pit.steps : 0,
    sunk: +sunk.toFixed(2),
    heightsKept,
    water: seen.includes('sand'),
  };
});
console.log('копание:', dig.layers, '· до пустоты шахты:', dig.ok, '· вырезано треугольников:', dig.cutTris,
  '· клеток', dig.cells + '×' + dig.cells, '· край по сетке:', dig.onGrid, '· дно на', dig.sunk, 'м ниже · ступеней', dig.steps,
  '· высоты узлов целы:', dig.heightsKept);

// --- полёт в креативе ---
const fly = await page.evaluate(() => {
  const g = window.__game;
  g.toggleCreative();
  const p = g.player;
  const y0 = p.position.y;
  p.update(0.25, { jump: true }, g.world);
  const up = p.position.y - y0;
  p.update(0.25, { sprint: true }, g.world);
  const down = p.position.y - y0;
  if (g.creative) g.toggleCreative();
  return { up: +up.toFixed(2), down: +down.toFixed(2) };
});
console.log('полёт: вверх', fly.up, 'м · вниз', fly.down, 'м · работает:', fly.up > 0.3 && fly.down < fly.up);

// --- полёт настоящими клавишами: зажали пробел — поднялись, отпустили — висим.
// Игровой цикл на этой странице может стоять (нет захвата курсора), поэтому кадры
// прокручиваем вручную — важно, что клавиши идут через настоящий обработчик.
const heldFly = await page.evaluate(() => {
  const g = window.__game;
  // бот-инспектор после теста F8 продолжает рулить героем — гасим его
  g.bot?.stop?.();
  g.bot = null;
  // после теста копания герой остался в шахте — поднимаемся на поверхность
  if (g.underground) g.exitMine();
  // включаем именно полёт, независимо от того, что осталось от прошлых проверок
  if (!g.creative) g.toggleCreative();
  g.creative = true;
  g.paused = false;                 // после панелей/шахты игра могла встать на паузу
  g.player.fly = true;
  const p = g.player;
  p.position.set(0, 14, 0);
  p.velocity.set(0, 0, 0);
  const fire = (code, type) => window.dispatchEvent(new KeyboardEvent(type, { code, bubbles: true }));
  const run = (n) => { for (let i = 0; i < n; i++) g.update(1 / 30); };
  run(3);
  const y0 = p.position.y;
  fire('Space', 'keydown');
  run(45);
  const up = p.position.y - y0;
  fire('Space', 'keyup');
  run(15);
  const yHover = p.position.y;
  run(30);
  const hover = Math.abs(p.position.y - yHover);
  fire('ShiftLeft', 'keydown');
  run(45);
  const down = p.position.y - yHover;
  fire('ShiftLeft', 'keyup');
  run(15);
  g.toggleCreative();
  return { up: +up.toFixed(2), down: +down.toFixed(2), hover: +hover.toFixed(2),
    dbg: { fly: p.fly, y0: +y0.toFixed(2), y1: +p.position.y.toFixed(2),
      held: g.input.jumpHeld, und: !!g.underground, alive: p.alive, dead: g.dead, running: g.running, paused: g.paused } };
});
console.log('полёт зажатием клавиш: вверх', heldFly.up, 'м · вниз', heldFly.down,
  'м · зависание', heldFly.hover, 'м · работает:',
  heldFly.up > 4 && heldFly.down < -4 && heldFly.hover < 0.4,
  '· отладка', JSON.stringify(heldFly.dbg));

console.log(errors.length ? 'ОШИБКИ:\n' + errors.slice(0, 8).join('\n') : 'ошибок нет');
await browser.close();
