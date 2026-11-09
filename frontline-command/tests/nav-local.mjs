// Эксперимент ALG-04: локальные плитки должны совпадать с полной перестройкой.
import assert from 'node:assert/strict';
import { loadConfig } from '../src/core/config.js';
import { Game } from '../src/sim/game.js';

let checks = 0, gridChangedChecks = 0, gridUnchangedChecks = 0;
for (const seed of [5, 7, 11]) {
  const cfg = await loadConfig();
  cfg.flags.wall_nav_local = true;
  cfg.navBudget.maxChunksPerFrame = 100;
  const game = new Game({ cfg, seed, aiVsAi: true });
  const { world, walls, nav } = game;
  // Постройка пересекает существующий контур: нельзя удалять чужие стены.
  const hq = world.buildings.find((b) => b.type === 'hq');
  const overlap = world.addBuilding({ type: 'bunker', faction: 0, x: hq.x + 80, y: hq.y, instant: true });
  walls.attach(overlap); world.rebuildNav(); nav.advance();
  // Край карты также обрезается без выхода за границы массивов.
  const edge = world.addBuilding({ type: 'bunker', faction: 1, x: 14, y: 14, instant: true });
  walls.attach(edge); world.rebuildNav(); nav.advance();
  const buildings = world.buildings.filter((b) => walls.state(b));
  assert.ok(buildings.includes(overlap) && buildings.includes(edge));

  const check = (label) => {
    // Навигационное поле должно быть инвалидировано, даже если клетки не изменились.
    nav.field(1024, 1024);
    assert.ok(nav.cache.size > 0);
    const beforeVersion = world.navVersion;
    const beforeOpen = [...nav.openArr], beforeCost = [...nav.costArr];
    walls.flushNav();
    assert.ok(world.navVersion > beforeVersion, `${label}: версия обновилась`);
    assert.equal(nav.version, world.navVersion, `${label}: сетка обновлена локально`);
    const gridChanged = beforeOpen.some((v, i) => v !== nav.openArr[i]) || beforeCost.some((v, i) => v !== nav.costArr[i]);
    if (gridChanged) gridChangedChecks++; else gridUnchangedChecks++;
    assert.equal(nav.cache.size, gridChanged ? 0 : 1, `${label}: кэш соответствует изменению сетки`);
    const local = Object.fromEntries(['walk','baseWalk','losBlock','solidBlock'].map((key) => [key, [...world[key]]]));
    const open = [...nav.openArr], cost = [...nav.costArr];
    const localField = [...nav.field(1024, 1024).dist];
    world.rebuildNav(); nav.advance();
    for (const key of Object.keys(local)) assert.deepEqual(local[key], [...world[key]], `${label}: ${key}`);
    assert.deepEqual(open, [...nav.openArr], `${label}: навигационная сетка`);
    assert.deepEqual(cost, [...nav.costArr], `${label}: стоимость`);
    assert.deepEqual(localField, [...nav.field(1024, 1024).dist], `${label}: поле и кэш`);
    checks++;
  };
  for (const b of buildings) {
    const st = walls.state(b);
    for (const id of Object.keys(st.doors)) {
      walls.closeDoor(b, id); check(`${seed} ${b.type}/${id} закрыта`);
      walls.openDoor(b, id); check(`${seed} ${b.type}/${id} открыта`);
    }
    const segment = st.segs.find((seg) => st.outline.segments.find((g) => g.id === seg.id)?.blocksMove);
    if (segment) {
      segment.breached = true; walls.queueNavRebuild(b); check(`${seed} ${b.type} пролом`);
      segment.breached = false; walls.queueNavRebuild(b); check(`${seed} ${b.type} ремонт`);
    }
  }
  // Несколько зданий изменены до одного flush.
  for (const b of buildings.slice(0, 4)) {
    const st = walls.state(b); const id = Object.keys(st.doors)[0];
    if (id) walls.closeDoor(b, id); else { st.segs[0].breached = true; walls.queueNavRebuild(b); }
  }
  check(`${seed} пакет`);
  // Лимит количества зданий за кадр сохраняет хвост и со временем
  // приводит маску к тому же состоянию, что полный rebuild.
  cfg.navBudget.maxChunksPerFrame = 1;
  const queued = buildings.filter((bb) => Object.keys(walls.state(bb).doors).length).slice(0, 2);
  for (const bb of queued) walls.toggleDoor(bb, Object.keys(walls.state(bb).doors)[0]);
  assert.equal(walls.navQueue.size, 2);
  let fullFallbacks = 0;
  const rebuild = world.rebuildNav.bind(world);
  world.rebuildNav = () => { fullFallbacks++; return rebuild(); };
  walls.flushNav(); assert.equal(walls.navQueue.size, 1);
  assert.equal(fullFallbacks, 1, 'очередь сверх лимита: полный rebuild не пропускает изменения');
  walls.flushNav(); assert.equal(walls.navQueue.size, 0);
  assert.equal(fullFallbacks, 1, 'остаток, помещающийся в бюджет, обновляется локально');
  world.rebuildNav = rebuild;
  nav.advance(); // fallback полной перестройки оставляет сетку устаревшей до advance
  const finishedWalk = [...world.walk], finishedNav = [...nav.openArr];
  world.rebuildNav(); nav.advance();
  assert.deepEqual(finishedWalk, [...world.walk], 'очередь: финальная маска');
  assert.deepEqual(finishedNav, [...nav.openArr], 'очередь: финальная сетка');
  cfg.navBudget.maxChunksPerFrame = 0;
  walls.queueNavRebuild(queued[0]);
  const noBudgetVersion = world.navVersion;
  walls.flushNav(); assert.equal(world.navVersion, noBudgetVersion); assert.equal(walls.navQueue.size, 1);
  cfg.navBudget.maxChunksPerFrame = 100; walls.flushNav();
  // Неизвестное здание не может оставить устаревшую маску за действительную.
  walls.navQueue.add(99999999);
  const previous = world.navVersion;
  walls.flushNav(); assert.equal(world.navVersion, previous + 1);
  assert.notEqual(nav.version, world.navVersion); nav.advance();
  // Если до локального обновления была пропущена полная перестройка, нельзя
  // выдавать частично обновлённую сетку за актуальную.
  world.rebuildNav();
  const b = buildings[0], id = Object.keys(walls.state(b).doors)[0];
  walls.closeDoor(b, id); walls.queueNavRebuild(b);
  const oldNavVersion = nav.version;
  walls.flushNav();
  assert.equal(nav.version, oldNavVersion);
  nav.advance();
  const open = [...nav.openArr]; world.rebuildNav(); nav.advance();
  assert.deepEqual(open, [...nav.openArr], 'устаревшая сетка перестроена целиком');
}
for (const dep of ['pathing_v2', 'wall_collision_v2']) {
  const cfg = await loadConfig(); cfg.flags.wall_nav_local = true; cfg.flags[dep] = false;
  const warnings = [], warn = console.warn;
  try { console.warn = (s) => warnings.push(s); new Game({ cfg, seed: 5, aiVsAi: true }); }
  finally { console.warn = warn; }
  assert.ok(warnings.some((s) => s.includes('wall_nav_local')), `${dep}: предупреждение`);
}
const off = await loadConfig();
assert.equal(off.flag('wall_nav_local', false), false, 'эксперимент по умолчанию выключен');
assert.ok(gridChangedChecks > 0 && gridUnchangedChecks > 0, 'проверены оба пути кэша');
console.log(`локальная маска стен: ${checks} состояний совпали с полной перестройкой; сетка изменилась ${gridChangedChecks}, не изменилась ${gridUnchangedChecks}; пересечение, край и устаревшая версия проверены`);
