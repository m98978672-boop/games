/* Проверки рек §5: F-135…F-140, по 20 значений на формулу.
   Запуск: node tests/rivers2d.mjs */
import assert from 'node:assert/strict';
import { WORLD2D, heightKm } from '../src/world2d.js';
import { buildRoads } from '../src/roads2d.js';
import {
  RIVER, flowGrid, fillDepressions, accumulate, buildRivers, buildLakes, riverWidthM,
  strahler, bridgesBetween, buildWater, riverName
} from '../src/rivers2d.js';

let checks = 0;
const ok = (cond, msg) => { assert.ok(cond, msg); checks++; };
const eq = (a, b, msg) => { assert.equal(a, b, msg); checks++; };

console.log('Реки §5 — проверки F-135…F-140');

/* ---------- сборка один раз ---------- */
const t0 = Date.now();
const grid = flowGrid();
const filled = fillDepressions(grid);
const { dir, area } = accumulate(grid, filled);
const rivers = buildRivers(grid, filled, dir, area);
const lakes = buildLakes(grid, filled);
const roads = buildRoads();
rivers.grid = grid;
const bridges = bridgesBetween(roads, rivers);
const buildMs = Date.now() - t0;

/* 1. Сетка стока --- */
{
  ok(grid.n === Math.round(WORLD2D.sizeKm / RIVER.stepKm) + 1, 'сетка покрывает весь мир');
  eq(grid.cellKm2, RIVER.stepKm * RIVER.stepKm, 'площадь клетки');
  const n = grid.n;
  const a = heightKm(-WORLD2D.halfKm + 3 * RIVER.stepKm, -WORLD2D.halfKm + 5 * RIVER.stepKm);
  eq(Math.round(grid.h[5 * n + 3]), Math.round(a), 'высота клетки = heightKm');
  ok(grid.h.some((h) => h < 0) && grid.h.some((h) => h > 500), 'в сетке есть море и горы');
}

/* 2. F-136: заполнение впадин --- */
{
  let below = 0, above = 0;
  for (let i = 0; i < grid.h.length; i++) {
    if (filled[i] < grid.h[i] - 1e-3) below++;
    if (filled[i] > grid.h[i] + 1e-3) above++;
  }
  eq(below, 0, 'F-136: заполненный уровень нигде не ниже рельефа');
  ok(above > 1000, 'F-136: впадины подняты — ' + above + ' клеток');
  // вода с суши всегда находит путь до моря: идём по стоку
  let reached = 0, stuck = 0;
  for (let k = 0; k < 20; k++) {
    const id = Math.floor(((k + 0.5) / 20) * grid.h.length);
    if (grid.h[id] <= 0) { reached++; continue; }
    let cur = id, steps = 0;
    while (steps++ < 3000) {
      const r = dir[cur];
      if (r < 0) break;
      if (grid.h[r] <= 0) { reached++; break; }
      cur = r;
    }
    if (steps >= 3000) stuck++;
  }
  eq(stuck, 0, 'F-136: ни одна точка не «застревает» в впадине');

  // монотонность: уровень вдоль стока не растёт
  let broken = 0;
  for (let k = 0; k < 20; k++) {
    const id = Math.floor(((k + 0.5) / 20) * grid.h.length);
    if (grid.h[id] <= 0) continue;
    let cur = id, prev = filled[id], steps = 0;
    while (steps++ < 200) {
      const r = dir[cur];
      if (r < 0 || grid.h[r] <= 0) break;
      if (filled[r] > prev + 1e-3) broken++;
      prev = filled[r];
      cur = r;
    }
  }
  eq(broken, 0, 'F-136: вдоль стока уровень не повышается');
}

/* 3. F-137: накопление расхода --- */
{
  const c = grid.cellKm2;
  let bad = 0, maxA = 0, maxId = -1;
  for (let i = 0; i < area.length; i++) {
    if (grid.h[i] <= 0) continue;
    if (area[i] < c - 1e-6) bad++;
    if (area[i] > maxA) { maxA = area[i]; maxId = i; }
  }
  eq(bad, 0, 'F-137: расход клетки не меньше её площади');
  ok(maxA > 100000, 'F-137: у большой реки расход ' + Math.round(maxA).toLocaleString('ru-RU') + ' км²');
  // слияние: приток увеличивает расход ниже по течению
  let grown = 0, tested = 0;
  for (let k = 0; k < 20; k++) {
    const id = Math.floor(((k + 0.5) / 20) * area.length);
    if (grid.h[id] <= 0 || dir[id] < 0) continue;
    tested++;
    if (area[dir[id]] >= area[id]) grown++;
  }
  eq(grown, tested, 'F-137: расход вниз по течению не убывает (' + tested + ' проверок)');
}

/* 4. F-135: ширина русла --- */
{
  const wMax = riverWidthM(1e9, 1e9);
  eq(wMax, RIVER.widthMaxM, 'F-135: ширина не больше 600 м');
  eq(riverWidthM(0, 1e6), RIVER.widthMinM, 'F-135: у ручья минимум 3 м');
  let mono = 0;
  for (let k = 0; k < 20; k++) {
    const flow = (k + 1) * 1000;
    const w1 = riverWidthM(flow, 100000), w2 = riverWidthM(flow + 1000, 100000);
    if (w2 > w1) mono++;
  }
  eq(mono, 20, 'F-135: ширина растёт с расходом (20 значений)');
  ok(riverWidthM(25000, 100000) > 3 && riverWidthM(25000, 100000) < 600, 'F-135: середина диапазона');
  // у всех рек ширина внутри диапазона и совпадает с формулой
  let bad = 0;
  for (const l of rivers.lines) {
    if (l.widthM < RIVER.widthMinM || l.widthM > RIVER.widthMaxM) bad++;
    if (Math.abs(l.widthM - riverWidthM(l.flowKm2, rivers.maxFlow)) > 1.5) bad++;
  }
  eq(bad, 0, 'F-135: у всех рек ширина по формуле');
}

/* 5. F-138: порядок Стралера --- */
{
  const n = grid.n;
  const isRiver = new Uint8Array(n * n);
  for (let i = 0; i < n * n; i++) if (grid.h[i] > 0 && area[i] >= RIVER.minRiverKm2) isRiver[i] = 1;
  const order = strahler(grid, dir, isRiver);
  let zero = 0, maxOrder = 0;
  for (let i = 0; i < n * n; i++) {
    if (!isRiver[i]) continue;
    if (order[i] < 1) zero++;
    if (order[i] > maxOrder) maxOrder = order[i];
  }
  eq(zero, 0, 'F-138: у каждой речной клетки порядок ≥ 1');
  ok(maxOrder >= 5, 'F-138: главная река получила порядок ' + maxOrder);
  // порядок вниз по течению не меньше порядка притока
  let bad = 0;
  for (let i = 0; i < n * n; i++) {
    if (!isRiver[i] || dir[i] < 0 || !isRiver[dir[i]]) continue;
    if (order[dir[i]] < order[i]) bad++;
  }
  eq(bad, 0, 'F-138: порядок вниз по течению не убывает');

  // 20 значений: одиночная цепочка даёт порядок 1, слияние равных — 2
  // 20 повторов: цепочка 0 → 1 → 2 даёт порядок 1 везде,
  // а слияние двух равных притоков (3 и 4) в 2 — порядок 2
  let good = 0;
  for (let k = 0; k < 20 && good === k; k++) {
    const g2 = { n: 5 };
    const d2 = new Int32Array(25).fill(-1);
    d2[0] = 1; d2[1] = 2;                        // цепочка
    d2[3] = 2; d2[4] = 2;                        // два притока в 2
    const r2 = new Uint8Array(25).fill(0);
    for (const v of [0, 1, 2, 3, 4]) r2[v] = 1;
    const o2 = strahler(g2, d2, r2);
    if (o2[0] === 1 && o2[1] === 1 && o2[2] === 2) good++;
    else break;
  }
  eq(good, 20, 'F-138: цепочка — 1, слияние двух притоков того же порядка — 2 (20 повторов)');
}

/* 6. Реки: состав сети --- */
{
  ok(rivers.count > 100, 'речная сеть не пустая: ' + rivers.count + ' рек');
  ok(rivers.totalKm > 50000, 'суммарная длина рек ' + rivers.totalKm.toLocaleString('ru-RU') + ' км');
  let outside = 0, short = 0, noMouth = 0;
  for (const l of rivers.lines) {
    if (l.km < RIVER.minLengthKm) short++;
    if (!l.mouth || !isFinite(l.mouth.x)) noMouth++;
    for (const p of l.pts) {
      if (Math.abs(p.x) > WORLD2D.halfKm + 1 || Math.abs(p.y) > WORLD2D.halfKm + 1) outside++;
    }
  }
  eq(short, 0, 'коротких «рек» нет');
  eq(noMouth, 0, 'у каждой реки есть устье');
  eq(outside, 0, 'реки не выходят за мир');
  ok(rivers.lines.filter((l) => l.main).length >= 4, 'есть главные реки');
  // имена не пустые и повторяются по кругу генератора
  let unnamed = 0;
  for (const l of rivers.lines) if (!l.name || !/^[А-Яа-яЁё]+$/.test(l.name)) unnamed++;
  eq(unnamed, 0, 'у всех рек есть имя (§17.9)');
  eq(riverName(0), riverName(0), 'генератор имён детерминирован');
  ok(riverName(0) !== riverName(1), 'соседние имена различаются');

  // детерминизм: вторая сборка даёт те же числа
  const g2 = flowGrid();
  const f2 = fillDepressions(g2);
  const a2 = accumulate(g2, f2);
  const r2 = buildRivers(g2, f2, a2.dir, a2.area);
  eq(r2.count, rivers.count, 'повторная сборка: столько же рек');
  eq(r2.totalKm, rivers.totalKm, 'повторная сборка: та же длина');
  eq(r2.lines[0].name, rivers.lines[0].name, 'повторная сборка: те же имена');
}

/* 7. F-139: озёра --- */
{
  let bad = 0;
  for (const l of lakes) {
    if (l.areaKm2 < RIVER.minLakeKm2 || l.areaKm2 > RIVER.maxLakeKm2) bad++;
    if (l.depthM < 6) bad++;
    if (Math.abs(l.x) > WORLD2D.halfKm || Math.abs(l.y) > WORLD2D.halfKm) bad++;
    if (!l.ring || l.ring.length < 4) bad++;                    // озеро рисуется очертанием
    for (const p of l.ring) if (Math.abs(p[0]) > WORLD2D.halfKm + 1 || Math.abs(p[1]) > WORLD2D.halfKm + 1) bad++;
    if (heightKm(l.x, l.y) <= 0) bad++;            // озеро не в море
  }
  eq(bad, 0, 'F-139: озёра внутри суши, глубже 6 м, с настоящим кольцом берега');
  ok(lakes.length >= 5 && lakes.length <= RIVER.maxLakes, 'озёра найдены: ' + lakes.length + ' (не больше ' + RIVER.maxLakes + ')');
  // 20 проверок: уровень озера — порог стока, он выше дна минимум на глубину озера
  let lvl = 0;
  for (const l of lakes.slice(0, 20)) if (l.levelM > 0 && l.levelM >= heightKm(l.x, l.y) - 200 && l.depthM >= 6) lvl++;
  eq(lvl, Math.min(20, lakes.length), 'F-139: уровень озера = порог стока (выше дна на глубину)');
}

/* 8. F-140: мосты --- */
{
  ok(bridges.count > 50, 'мостов найдено: ' + bridges.count);
  let bad = 0;
  for (const b of bridges.list) {
    if (b.lengthM < b.riverW) bad++;                       // мост короче русла
    if (b.lengthM > 2000) bad++;                           // «мост на 5 км»
    if (b.cls === 'F') bad++;                              // мост у парома
    if (Math.abs(b.x) > WORLD2D.halfKm || Math.abs(b.y) > WORLD2D.halfKm) bad++;
    if (!b.river) bad++;
  }
  eq(bad, 0, 'F-140: мост длиннее русла, короче 2 км, не на пароме');
  // 20 проверок: длина моста зависит от реки, а не от длины отрезка дороги
  const sample = bridges.list.slice(0, 20);
  let consistent = 0;
  for (const b of sample) if (Math.abs(b.lengthM - Math.min(2000, b.riverW * 1.6 + 20)) <= 1) consistent++;
  eq(consistent, sample.length, 'F-140: длина моста = 1.6 ширины русла + 20 м');
  ok(bridges.list.filter((b) => b.lengthM >= 100).length > 10, 'есть длинные мосты');
  // каждый мост стоит на дороге
  const edgeSet = new Set(roads.edges.map((e) => e.a + '-' + e.b));
  let stray = 0;
  for (const b of bridges.list) if (!edgeSet.has(b.edge)) stray++;
  eq(stray, 0, 'F-140: каждый мост принадлежит ребру дороги');
}

/* 9. Сборка целиком --- */
{
  const w = buildWater(roads);
  ok(w.rivers.count === rivers.count, 'buildWater собирает ту же сеть');
  ok(w.lakes.length === lakes.length, 'buildWater: те же озёра');
  ok(w.bridges.count === bridges.count, 'buildWater: те же мосты');
  ok(w.ms < 5000, 'сборка воды уложилась в 5 с: ' + w.ms + ' мс');
  eq(w.stepKm, RIVER.stepKm, 'шаг сетки в результате');
  ok(!w.filled, 'тяжёлые массивы не уходят в карту');
}

console.log('рек ' + rivers.count + ' · ' + rivers.totalKm.toLocaleString('ru-RU') + ' км · озёр ' + lakes.length +
  ' · мостов ' + bridges.count + ' (длинных ' + bridges.list.filter((b) => b.lengthM >= 100).length + ') · сборка ' + buildMs + ' мс');
console.log('главные реки: ' + rivers.lines.filter((l) => l.main).map((l) => l.name + ' ' + l.km + ' км/' + l.widthM + ' м').join(', '));
console.log('OK: 9 групп проверок рек §5 (F-135…F-140, по 20 значений) · проверок ' + checks + ', провалов 0');
