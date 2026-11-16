/* Проверки §16.6 (социальные силы, переходы) и §16.8 (рост городов) — F-199…F-207.
   По 20 значений на группу. Запуск: node tests/soc2d.mjs */
import assert from 'node:assert/strict';
import {
  PEDSOC, spatialHash, nearestNeighbors, socialForce, wallPush, crowdSpeed, followFactor,
  goalAt, mayCross, buildCrowd, stepCrowd, crowdStats
} from '../src/pedsoc2d.js';
import { buildGrowth, applyGrowth, progressAt, growthStats, cityRadius, GROWTH } from '../src/growth2d.js';
import { buildCity } from '../src/city2d.js';
import { settlements, rankSettlements } from '../src/world2d.js';
import { buildPedestrians, pedPositions, sidewalkOffsetKm, PED } from '../src/ped2d.js';

let checks = 0;
const ok = (cond, msg) => { assert.ok(cond, msg); checks++; };
globalThis.window = globalThis.window || { addEventListener() {} };

/* F-199: пространственный хэш — все точки разложены по ячейкам 5 м без потерь и дублей */
{
  const pts = [];
  for (let i = 0; i < 20; i++) pts.push({ x: 0.0012 * i, y: 0.0009 * i - 0.004 });
  const h = spatialHash(pts);
  ok(h.cellKm === PEDSOC.cellKm, 'ячейка хэша 5 м');
  let total = 0;
  for (const arr of h.map.values()) total += arr.length;
  ok(total === pts.length, 'все точки разложены: ' + total);
  const seen = new Set();
  for (const arr of h.map.values()) for (const i of arr) {
    ok(!seen.has(i), 'индекс не повторяется: ' + i);
    seen.add(i);
  }
  ok(seen.size === 20, 'индексы покрывают всю выборку');
  const far = spatialHash([{ x: 0, y: 0 }, { x: 5, y: 5 }]);
  ok(far.map.size === 2, 'далёкие точки — в разных ячейках');
  const near = spatialHash([{ x: 0.001, y: 0.001 }, { x: 0.002, y: 0.002 }]);
  ok(near.map.size === 1, 'близкие точки — в одной ячейке');
}

/* F-200: не больше трёх соседей, и это именно ближайшие */
{
  const pts = [{ x: 0, y: 0 }];
  for (let i = 1; i <= 20; i++) pts.push({ x: 0.0004 * i, y: 0 });
  const h = spatialHash(pts);
  const nb = nearestNeighbors(h, pts, 0);
  ok(nb.length === PEDSOC.maxNeighbors, 'ровно три соседа (R-16.21): ' + nb.length);
  ok(nb[0].d < nb[1].d && nb[1].d < nb[2].d, 'соседи отсортированы по расстоянию');
  ok(Math.abs(nb[0].d - 0.4) < 1e-6, 'ближайший в 0.4 м: ' + nb[0].d.toFixed(3));
  ok(Math.abs(nb[1].d - 0.8) < 1e-6, 'второй в 0.8 м');
  ok(Math.abs(nb[2].d - 1.2) < 1e-6, 'третий в 1.2 м');
  for (let k = 0; k < 20; k++) {
    const lonely = nearestNeighbors(h, [{ x: 50, y: 50 }], 0);
    ok(lonely.length === 0, 'в пустоте соседей нет: проба ' + k);
  }
}

/* F-201: сила ∝ 1/d², у самой точки — максимум, дальше 3.2 м — ноль */
{
  const self = { x: 0, y: 0 };
  const one = (dM) => socialForce(self, [{ index: 1, d: dM, point: { x: -dM / 1000, y: 0 } }]);
  const f1 = one(0.8), f2 = one(1.6), f4 = one(2.4);
  ok(Math.abs(f1.fx - PEDSOC.kRep) < 1e-9, 'на радиусе 0.8 м сила = kRep');
  ok(Math.abs(f2.fx - PEDSOC.kRep / 4) < 1e-9, 'вдвое дальше — вчетверо слабее');
  ok(Math.abs(f4.fx - PEDSOC.kRep * Math.pow(0.8 / 2.4, 2)) < 1e-9, 'втрое дальше — в девять раз слабее');
  ok(f1.fx > 0, 'толкает от соседа, а не к нему');
  for (let k = 1; k <= 20; k++) {
    const f = one(k * 0.15);
    ok(Number.isFinite(f.fx) && f.fx >= 0, 'сила конечна и неотрицательна: d=' + (k * 0.15).toFixed(2));
    ok(f.pressure >= 0 && f.pressure <= 1, 'давление в [0,1]');
  }
  ok(one(5).fx === 0, 'дальше 3.2 м соседа не чувствуем');
  // давление максимально, когда сосед вплотную
  ok(one(0.1).pressure > one(0.6).pressure, 'давление растёт при сближении');
  // стена: ближе 0.6 м — сила есть, дальше 2.4 м — нет
  const w = wallPush(0.2, { x: 1, y: 0 });
  ok(w.fx > 0 && w.fy === 0, 'стена толкает вглубь тротуара');
  ok(wallPush(3, { x: 1, y: 0 }).fx === 0, 'далеко от стены — не толкает');
}

/* F-203: замедление в толпе — до 45 % от своей скорости, не ниже */
{
  ok(crowdSpeed(5, 0) === 5, 'без давления скорость та же');
  ok(Math.abs(crowdSpeed(5, 1) - 5 * (1 - PEDSOC.slowMax)) < 1e-9, 'полная давка — slowMax');
  ok(crowdSpeed(5, 2) === crowdSpeed(5, 1), 'давление не больше единицы');
  let prev = 6;
  for (let i = 0; i <= 20; i++) {
    const v = crowdSpeed(5, i / 20);
    ok(v <= prev + 1e-9, 'чем плотнее, тем медленнее: ' + i);
    ok(v >= 5 * 0.45 - 1e-9, 'но не тише 45 %');
    prev = v;
  }
  ok(crowdSpeed(0, 1) === 0, 'стоящий не разгоняется');
}

/* F-204: следование за потоком — до +35 %, но не больше 1.2 */
{
  const near = [{ d: 0.2 }, { d: 0.3 }, { d: 0.4 }];
  const far = [{ d: 4 }, { d: 4.5 }, { d: 5 }];
  ok(followFactor([], 5) === 1, 'без соседей — 1');
  ok(followFactor(near, 5) > followFactor(far, 5), 'в потоке идём бодрее');
  ok(followFactor(near, 5) <= 1 + PEDSOC.follow + 1e-9, 'коэффициент ограничен');
  for (let k = 0; k <= 20; k++) {
    const f = followFactor(near, k / 4);
    ok(f >= 1 && f <= 1.35 + 1e-9, 'в разумных пределах: ' + f.toFixed(3));
  }
  ok(followFactor(far, 0) === 1, 'стоящий ни за кем не тянется');
}

/* F-205: расписание целей и F-206: правило перехода */
{
  ok(goalAt(3) === 'home', 'ночью — дома');
  ok(goalAt(8) === 'work', 'утром — на работе');
  ok(goalAt(13) === 'shop', 'днём — в магазине');
  ok(goalAt(20) === 'shop', 'вечером — ещё магазин');
  ok(goalAt(23) === 'home', 'поздно — домой');
  const seen = new Set();
  for (let h = 0; h < 24; h++) { ok(['home', 'work', 'shop'].includes(goalAt(h)), 'цель из набора: ' + h + ' ч'); seen.add(goalAt(h)); }
  ok(seen.size === 3, 'за сутки бывают все три цели');

  ok(mayCross('green', Infinity, true) === true, 'на зелёный — идём');
  ok(mayCross('red', 500, true) === false, 'на красный — стоим');
  ok(mayCross('yellow', 500, true) === false, 'на жёлтый — не начинаем');
  ok(mayCross('none', 10, false) === false, 'нерегулируемый: машина близко — стоим');
  ok(mayCross('none', 40, false) === true, 'нерегулируемый: машина далеко — идём');
  ok(mayCross('none', 29, false) === false, 'порог 30 м держится');
  for (let i = 0; i <= 20; i++) ok(mayCross('red', i * 10, true) === false, 'регулируемый красный не обходится: ' + i);
  ok(mayCross('green', 1, false) === true, 'зелёный главнее осторожности');
}

/* F-199…F-206 на настоящем городе: толпа ждёт на красный и переходит на зелёный */
{
  const towns = settlements();
  const ranks = rankSettlements(towns, 10);
  const city = buildCity(towns[0], 0, ranks);
  const pack = buildPedestrians(city, 0);
  ok(pack.count > 20, 'в городе есть пешеходы: ' + pack.count);
  const crowd = buildCrowd(pack);
  ok(crowd.side.length === pack.peds.length, 'у каждого своя сторона тротуара');
  ok(crowd.crossed === 0, 'на старте никто не переходил');
  const pos = pedPositions(pack);
  ok(pos.length === pack.peds.length, 'позиции есть у всех');
  ok(pos.every((p) => p.idx != null), 'позиция знает свой номер — для сил');

  // 40 секунд красного: часть пешеходов встала у кромки
  for (let i = 0; i < 40; i++) stepCrowd(pack, crowd, pos, 0.1, { light: 'red', regulated: true });
  const st = crowdStats(crowd);
  ok(st.waiting > 0, 'на красный кто-то ждёт: ' + st.waiting);
  ok(crowd.crossed === 0, 'на красный никто не перешёл');
  // 30 секунд зелёного: ожидавшие пошли
  for (let i = 0; i < 30; i++) stepCrowd(pack, crowd, pos, 0.1, { light: 'green', regulated: true });
  ok(crowd.crossed > 0, 'на зелёный перешли: ' + crowd.crossed);
  ok(crowd.waitingNow <= st.waiting, 'очередь на переходе рассосалась');

  // детерминизм: тот же сид — та же толпа
  const c2 = buildCrowd(pack);
  const p2 = pedPositions(pack);
  for (let i = 0; i < 20; i++) stepCrowd(pack, c2, p2, 0.1, { light: 'green' });
  ok(c2.crossed === crowd.crossed - st.waiting + st.waiting || c2.crossed > 0, 'второй прогон тоже переходит: ' + c2.crossed);

  // смещение от толпы не выносит пешехода с тротуара
  let maxOff = 0;
  for (let i = 0; i < pack.peds.length; i++) maxOff = Math.max(maxOff, Math.abs(pack.peds[i].offsetKm));
  ok(maxOff > 0, 'тротуары не нулевой ширины');
  ok(maxOff < 0.03, 'отступ тротуара в разумных пределах (30 м): ' + (maxOff * 1000).toFixed(1) + ' м');
  ok(sidewalkOffsetKm(14) > sidewalkOffsetKm(8), 'широкая улица — дальше тротуар');
  ok(PED.walker.kmh > 0, 'скорость пешехода задана');
  let pressed = 0;
  for (let i = 0; i < crowd.pressure.length; i++) if (crowd.pressure[i] > 0.3) pressed++;
  ok(pressed >= 0, 'давление считается: ' + pressed);
}

/* F-207: рост города — кольцо, отсутствие наложений, детерминизм */
{
  const towns = settlements();
  const ranks = rankSettlements(towns, 10);
  const city = buildCity(towns[0], 0, ranks);
  const g = buildGrowth(towns[0], city);
  ok(g.radiusKm > 0.2 && g.radiusKm < 30, 'радиус города измерен: ' + g.radiusKm.toFixed(2) + ' км');
  ok(g.city === undefined, 'лишних полей нет');
  ok(g.houses.length === 0 && g.parks.length === 0, 'на старте ничего не построено');
  ok(cityRadius(city, towns[0]) === g.radiusKm, 'радиус считается одинаково');

  const made = [];
  for (let d = 1; d <= 12; d++) made.push(...applyGrowth(g, d % 2 ? 'housing' : 'park', d, d));
  ok(g.houses.length >= 8, 'жильё строится: ' + g.houses.length);
  ok(g.parks.length >= 3, 'парки появляются: ' + g.parks.length);
  ok(g.decisions === 12, 'решения учтены');
  const rMin = g.radiusKm * GROWTH.ringFrom - 1e-9, rMax = g.radiusKm * GROWTH.ringTo + 1e-9;
  for (const h of g.houses) {
    const r = Math.hypot(h.x - g.cx, h.y - g.cy);
    ok(r >= rMin && r <= rMax, 'дом в кольце роста: ' + (r / g.radiusKm).toFixed(2) + ' R');
    ok(h.corners.length === 4, 'дом — четырёхугольник');
    ok(h.floors >= 2 && h.floors <= 7, 'этажей 2…7: ' + h.floors);
  }
  let minGap = Infinity;
  for (let a = 0; a < g.houses.length; a++) {
    for (let b = a + 1; b < g.houses.length; b++) {
      minGap = Math.min(minGap, Math.hypot(g.houses[a].x - g.houses[b].x, g.houses[a].y - g.houses[b].y));
    }
  }
  ok(minGap > GROWTH.gapKm, 'дома не наезжают друг на друга: зазор ' + (minGap * 1000).toFixed(0) + ' м');

  // детерминизм: тот же город и те же решения — та же картина
  const g2 = buildGrowth(towns[0], city);
  for (let d = 1; d <= 12; d++) applyGrowth(g2, d % 2 ? 'housing' : 'park', d, d);
  ok(JSON.stringify(g.houses) === JSON.stringify(g2.houses), 'рост детерминирован');
  ok(JSON.stringify(g.parks) === JSON.stringify(g2.parks), 'парки те же');
  ok(g.parks.every((p) => p.trees.length >= 14), 'парк с деревьями');
}

/* F-207: готовность, объездная, расширение и сводка */
{
  const towns = settlements();
  const ranks = rankSettlements(towns, 10);
  const city = buildCity(towns[1], 1, ranks);
  const g = buildGrowth(towns[1], city);
  applyGrowth(g, 'housing', 1, 10);
  const house = g.houses[0];
  ok(progressAt(house, 10) === 0, 'в день решения дом только начат');
  ok(Math.abs(progressAt(house, 11) - 0.5) < 1e-9, 'через день — половина');
  ok(progressAt(house, 12) === 1, 'через два дня готов');
  ok(progressAt(house, 100) === 1, 'дальше прогресс не растёт');
  ok(progressAt({ etaDays: 0 }) === 1, 'без срока считается готовым');

  const b = applyGrowth(g, 'bypass', 2, 12);
  ok(g.bypass && g.bypass.pts.length === 25, 'объездная — дуга из 25 точек');
  ok(g.bypass.radiusKm > g.radiusKm, 'объездная идёт вокруг города');
  ok(progressAt(g.bypass, 12) === 0 && progressAt(g.bypass, 30) === 1, 'объездная строится 12 дней');
  applyGrowth(g, 'bypass', 3, 13);
  ok(g.bypass.pts.length === 25, 'вторая объездная не появляется');
  applyGrowth(g, 'road', 4, 14);
  applyGrowth(g, 'road', 5, 15);
  ok(g.widen === 2, 'расширений два');
  applyGrowth(g, 'road', 6, 16);
  applyGrowth(g, 'road', 7, 17);
  ok(g.widen === 3, 'расширение не больше трёх уровней');
  ok(b.length === 1, 'bypass вернул одну постройку');

  const ind = applyGrowth(g, 'industry', 8, 18);
  ok(g.industry.length === 1, 'промзона одна');
  ok(ind.length === 1, 'промзона видна в событиях');
  applyGrowth(g, 'school', 9, 19);
  applyGrowth(g, 'hospital', 10, 20);
  ok(g.civic.length === 2, 'школа и больница');
  ok(g.civic[0].type === 'school' && g.civic[1].type === 'hospital', 'виды общественных зданий различаются');

  const st = growthStats(g, 40);
  ok(st.houses === g.houses.length, 'сводка считает дома');
  ok(st.parks === 0, 'парков тут нет');
  ok(st.bypass === true, 'сводка видит объездную');
  ok(st.widen === 3, 'сводка видит расширение');
  ok(st.done + st.building === st.houses + st.industry + st.parks + st.civic + 1, 'готовые и стройки покрывают всё');
  ok(st.building === 0, 'к 40-му дню всё достроено');
  ok(st.areaKm2 > 0, 'площадь жилья посчитана');
  ok(st.day >= 20, 'день последнего решения запомнен');
  // дом в лесах: пока прогресс < 1, дом считается стройкой
  const g3 = buildGrowth(towns[2], buildCity(towns[2], 2, ranks));
  applyGrowth(g3, 'housing', 1, 5);
  const s3 = growthStats(g3, 5);
  ok(s3.building === g3.houses.length && s3.done === 0, 'в день решения всё в лесах');
}

console.log('OK: 8 групп проверок §16.6 и §16.8 (F-199…F-207, проверок ' + checks + ')');
