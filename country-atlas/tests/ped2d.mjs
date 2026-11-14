/* Проверки §13 (2D): пешеходы на тротуарах. Шесть групп по 20 значений — сколько их,
   как быстро идут, где стоит тротуар, что видно в масштабе, фаза шага и точка на улице. */
import assert from 'node:assert/strict';
import {
  PED, PED_LOD, PED_CAP, SIDEWALK_M, STRIDE_HZ,
  pedCount, pedSpeed, sidewalkOffsetKm, pedBudget, stridePhase, pointAt,
  buildPedestrians, advancePeds, pedPositions
} from '../src/ped2d.js';
import { settlements, rankSettlements } from '../src/world2d.js';
import { buildCity } from '../src/city2d.js';

const near = (a, b, eps = 1e-9) => Math.abs(a - b) <= eps;

/* F-151: пешеходов у города — от класса и населения, всегда 6…520 */
{
  const classes = ['capital', 'city', 'town', 'small', 'village'];
  let n = 0;
  for (let i = 0; i < 20; i++) {
    const cls = classes[i % classes.length];
    const pop = 3000 * Math.pow(2.4, i);
    const c = pedCount(cls, pop);
    assert.ok(c >= 6 && c <= 520, 'пешеходов 6…520: ' + cls + '/' + Math.round(pop) + ' → ' + c);
    assert.ok(Number.isInteger(c), 'целое число');
    if (i >= 5) assert.ok(c >= pedCount(cls, 3000 * Math.pow(2.4, i - 5)),
      'с ростом населения пешеходов не меньше');
    n++;
  }
  assert.equal(n, 20, 'двадцать значений числа пешеходов');
  assert.ok(pedCount('capital', 12e6) > pedCount('village', 3000), 'в столице людно');
  assert.equal(pedCount('village', 200), 6, 'у крошечного посёлка пол из шести');
  assert.ok(pedCount('village', 3000) < pedCount('town', 400000), 'в деревне тише, чем в городе');
}

/* F-152: скорость — вид × разброс ±15 %, бегун быстрее пешехода, курьер быстрее всех */
{
  let n = 0;
  for (let i = 0; i < 20; i++) {
    const kind = ['walker', 'runner', 'courier', 'dog', 'child'][i % 5];
    const v = pedSpeed(kind, i);
    const base = PED[kind].kmh;
    assert.ok(v >= base * 0.85 - 1e-9 && v <= base * 1.15 + 1e-9,
      'скорость в ±15 %: ' + kind + ' ' + v.toFixed(2));
    n++;
  }
  assert.equal(n, 20, 'двадцать значений скорости');
  assert.ok(pedSpeed('runner', 3) > pedSpeed('walker', 3), 'бегун быстрее пешехода');
  assert.ok(pedSpeed('courier', 4) > pedSpeed('runner', 4), 'велосипед быстрее бегуна');
  assert.ok(pedSpeed('child', 7) < pedSpeed('walker', 7), 'ребёнок медленнее взрослого');
}

/* F-153: тротуар — половина проезжей части плюс 6 м */
{
  let n = 0;
  for (let i = 0; i < 20; i++) {
    const w = 5 + i * 1.5;                      // 5…33.5 м
    const want = w / 2000 + SIDEWALK_M / 1000;
    assert.ok(near(sidewalkOffsetKm(w), want, 1e-12), 'тротуар при ширине ' + w + ' м');
    assert.ok(sidewalkOffsetKm(w) > w / 2000, 'тротуар снаружи проезжей части');
    n++;
  }
  assert.equal(n, 20, 'двадцать значений отступа тротуара');
  assert.ok(near(sidewalkOffsetKm(10), 0.011, 1e-12), 'улица 10 м — 11 м от оси');
}

/* F-154: бюджет фигур: до 40 px/км — ноль, дальше до 400 */
{
  const scales = [0.13, 0.5, 1, 3, 6, 12, 18, 24, 30, 39, 39.9, 40, 41, 60, 90, 160, 300, 600, 1000, 2];
  let n = 0;
  for (const s of scales) {
    const b = pedBudget(s, 513);
    if (s < PED_LOD) assert.equal(b, 0, 'до ' + PED_LOD + ' px/км пешеходов нет');
    else assert.equal(b, Math.min(PED_CAP, 513), 'иначе вся толпа до 400');
    n++;
  }
  assert.equal(n, 20, 'двадцать значений бюджета');
  assert.equal(pedBudget(90, 5000), 400, 'больше 400 в кадре не рисуем');
}

/* F-155: фаза шага — 2π·f·t, где f растёт со скоростью */
{
  let n = 0;
  for (let i = 0; i < 20; i++) {
    const sec = 0.05 * i;
    const ph = stridePhase('walker', PED.walker.kmh, sec);
    assert.ok(ph >= 0 && ph < 2 * Math.PI, 'фаза в 0…2π');
    if (i > 0) assert.ok(near(stridePhase('walker', 4.8, sec),
      (2 * Math.PI * STRIDE_HZ * sec) % (2 * Math.PI), 1e-9), 'фаза по времени ' + sec.toFixed(2) + ' с');
    n++;
  }
  assert.equal(n, 20, 'двадцать значений фазы');
  assert.ok(stridePhase('courier', 15, 0.1) > stridePhase('walker', 4.8, 0.1), 'быстрее — чаще шаг');
}

/* F-156: точка на ломаной по пройденному пути, с разворотом на конце */
{
  const pts = [[0, 0], [1, 0], [1, 1]];
  const acc = [0, 1, 2];
  let n = 0;
  for (let i = 0; i < 20; i++) {
    const t = i * 0.21;                         // 0…3.99 км
    const p = pointAt(pts, acc, t);
    assert.ok(p.x >= 0 && p.x <= 1 + 1e-9 && p.y >= 0 && p.y <= 1 + 1e-9, 'точка внутри улицы');
    assert.ok(near(Math.hypot(p.dx, p.dy), 1, 1e-9), 'направление единичное');
    n++;
  }
  assert.equal(n, 20, 'двадцать значений точки на улице');
  assert.ok(near(pointAt(pts, acc, 0.5).x, 0.5, 1e-9), 'полпути по первому отрезку');
  assert.ok(near(pointAt(pts, acc, 1.5).y, 0.5, 1e-9), 'полпути по второму отрезку');
  // на конце улицы пешеход разворачивается, а не улетает за угол
  const back = pointAt(pts, acc, 2.5);
  assert.ok(back.dy < 0, 'после разворота идёт обратно');
}

/* Связка с городом: толпа детерминирована, стоит на тротуарах, ходит по игровому времени. */
{
  const towns = settlements();
  const ranks = rankSettlements(towns, 10);
  const city = buildCity(towns[ranks.capital], ranks.capital, ranks);
  const a = buildPedestrians(city, ranks.capital);
  const b = buildPedestrians(city, ranks.capital);
  assert.equal(a.count, b.count, 'сборка детерминирована');
  assert.ok(a.count >= 300 && a.count <= 520, 'в столице 300…520 пешеходов: ' + a.count);
  assert.equal(Object.keys(a.byKind).length, 5, 'все пять видов на улице: ' + JSON.stringify(a.byKind));

  const p0 = pedPositions(a);
  assert.equal(p0.length, a.count, 'у каждого пешехода есть точка');
  for (const p of p0) assert.ok(Number.isFinite(p.x) && Number.isFinite(p.y), 'координаты конечны');

  // все стоят вдоль тротуара: расстояние до оси улицы ≈ отступ тротуара
  let onSidewalk = 0;
  for (let k = 0; k < Math.min(60, a.peds.length); k++) {
    const ped = a.peds[k];
    const st = a.list[ped.streetIdx];
    let best = Infinity;
    for (let i = 1; i < st.pts.length; i++) {
      const [x1, y1] = st.pts[i - 1], [x2, y2] = st.pts[i];
      const vx = x2 - x1, vy = y2 - y1;
      const L2 = vx * vx + vy * vy || 1e-9;
      const u = Math.max(0, Math.min(1, ((p0[k].x - x1) * vx + (p0[k].y - y1) * vy) / L2));
      best = Math.min(best, Math.hypot(p0[k].x - (x1 + vx * u), p0[k].y - (y1 + vy * u)));
    }
    assert.ok(Math.abs(best - Math.abs(ped.offsetKm)) < 0.02, 'пешеход на тротуаре, а не на оси');
    onSidewalk++;
  }
  assert.equal(onSidewalk, 60, 'шестьдесят проверенных пешеходов на тротуаре');

  // ходьба по игровому времени: 4.8 км/ч × 360 = 0.48 км за реальную секунду
  advancePeds(a, 1);
  const p1 = pedPositions(a);
  const walkerK = a.peds.findIndex((p) => p.kind === 'walker');
  const moved = Math.hypot(p1[walkerK].x - p0[walkerK].x, p1[walkerK].y - p0[walkerK].y);
  assert.ok(moved > 0.005 && moved < 0.6, 'пешеход сдвинулся за секунду: ' + moved.toFixed(3) + ' км');
}

console.log('OK: 6 групп проверок пешеходов §13 (F-151…F-156 по 20 значений)');
