/* Проверки льда и инея §5.11 и приливов §5.10 (F-177…F-183). По 20 значений на группу.
   Запуск: node tests/ice2d.mjs */
import assert from 'node:assert/strict';
import {
  ICE, north01, iceThicknessCm, lakeFreezes, riverFreezes, frost01, pickIcebreaker,
  icebreakerAt, tideM, iceState
} from '../src/ice2d.js';
import { snowCover01, sunAltitudeDeg } from '../src/light2d.js';
import { buildRoads } from '../src/roads2d.js';
import { buildWater } from '../src/rivers2d.js';

let checks = 0;
const ok = (cond, msg) => { assert.ok(cond, msg); checks++; };

/* F-177: северность точки — 0 на тёплом берегу, 1 в тайге */
{
  ok(north01(ICE.southY) === 0, 'на южном берегу северности нет');
  ok(north01(ICE.northY) === 1, 'в тайге северность полная');
  let prev = -1;
  for (let i = 0; i < 20; i++) {
    const y = -3600 + i * 360;
    const n = north01(y);
    ok(n >= 0 && n <= 1, 'северность в 0…1: ' + y);
    ok(n >= prev, 'севернее — не меньше: ' + y);
    prev = n;
  }
  ok(north01(-9999) === 0 && north01(9999) === 1, 'за границами страны зажимается');
}

/* F-178: толщина льда растёт со снегом и северностью, у реки тоньше */
{
  let prev = -1;
  for (let i = 0; i < 20; i++) {
    const snow = i / 19;
    const cm = iceThicknessCm(snow, 1);
    ok(cm >= 0 && cm <= ICE.maxIceCm, 'лёд не толще предела: ' + cm);
    ok(cm >= prev, 'чем больше снега, тем толще лёд');
    prev = cm;
  }
  for (let i = 0; i < 20; i++) {
    const n = i / 19;
    ok(iceThicknessCm(1, n) <= ICE.maxIceCm + 1e-9, 'на севере лёд в пределе: ' + n);
  }
  ok(iceThicknessCm(1, 1, true) < iceThicknessCm(1, 1), 'на реке лёд тоньше, чем на озере');
  ok(iceThicknessCm(0, 1) === 0, 'без снега льда нет');
  ok(iceThicknessCm(0.05, 1) > 0, 'первый снег — первый лёд');
  ok(iceThicknessCm(1, 0) < 15, 'на юге даже со снегом лёд тонкий');
}

/* F-179: озеро встаёт на севере и при снеге; очень большое — позже */
{
  const small = { areaKm2: 1200 }, big = { areaKm2: 4000 };
  ok(!lakeFreezes(small, 1, 0.3), 'на юге не встаёт даже малое');
  ok(!lakeFreezes(small, 0.1, 0.9), 'на севере без снега не встаёт');
  ok(lakeFreezes(small, 0.4, 0.6), 'на севере со снегом встаёт');
  ok(!lakeFreezes(big, 0.3, 0.9), 'очень большому озеру нужен мороз покрепче');
  ok(lakeFreezes(big, 0.6, 0.9), 'и оно встаёт при настоящей зиме');
  for (let i = 0; i < 20; i++) {
    const n = i / 19;
    const frozen = lakeFreezes(small, 0.7, n);
    if (n < ICE.lakeFreezeNorth) ok(!frozen, 'южнее порога не встаёт: ' + n.toFixed(2));
    else ok(frozen, 'севернее порога встаёт: ' + n.toFixed(2));
  }
}

/* F-180: река встаёт только мелкая и только в тайге */
{
  ok(riverFreezes(80, 0.8, 0.8), 'мелкая таёжная река встаёт');
  ok(!riverFreezes(300, 0.8, 0.8), 'широкая река течёт подо льдом');
  ok(!riverFreezes(80, 0.1, 0.8), 'без снега не встаёт');
  ok(!riverFreezes(80, 0.8, 0.2), 'на юге не встаёт');
  for (let i = 0; i < 20; i++) {
    const w = 20 + i * 40;
    const frozen = riverFreezes(w, 0.9, 0.9);
    ok(frozen === (w <= ICE.riverFreezeWidthM), 'порог ширины реки: ' + w + ' м');
    ok(riverFreezes(w, 0.9, 0.5) === (w <= ICE.riverFreezeWidthM), 'северность выше порога не мешает');
  }
}

/* F-181: иней по утрам на юге — пока солнце низко и снега нет */
{
  ok(frost01(6, 0, 0.1) > 0.25, 'утром на юге иней есть');
  ok(frost01(-1, 0, 0.1) > 0.6, 'до восхода иней сильнее');
  ok(frost01(30, 0, 0.1) === 0, 'днём инея нет');
  ok(frost01(5, 0.9, 0.1) < frost01(5, 0, 0.1), 'со снегом иней слабее');
  ok(frost01(5, 0, 0.9) === 0, 'на севере это уже лёд, а не иней');
  let prev = 2;
  for (let i = 0; i < 20; i++) {
    const alt = -2 + i * 2;
    const f = frost01(alt, 0, 0.15);
    ok(f >= 0 && f <= 1, 'иней в 0…1: ' + alt);
    ok(f <= prev + 1e-9, 'чем выше солнце, тем меньше инея: ' + alt);
    prev = f;
  }
}

/* F-182: ледокол — на самом большом вставшем озере, ходит по кольцу */
{
  const lakes = [
    { areaKm2: 900, x: 0, y: 3000, ring: [[-20, 2980], [20, 2980], [20, 3020], [-20, 3020]] },
    { areaKm2: 4000, x: 100, y: 3100, ring: [[60, 3060], [140, 3060], [140, 3140], [60, 3140]] }
  ];
  ok(pickIcebreaker(lakes, 0.9, 0.9) === lakes[1], 'выбирает самое крупное озеро');
  ok(pickIcebreaker(lakes, 0.1, 0.9) === null, 'летом ледокола нет');
  ok(pickIcebreaker(lakes, 0.9, 0.1) === null, 'на юге ледокола нет');
  let moved = 0;
  for (let i = 0; i < 20; i++) {
    const a = icebreakerAt(lakes[1], i * 60);
    const b = icebreakerAt(lakes[1], i * 60 + 60);
    ok(a && b, 'ледокол всегда где-то есть: ' + i);
    const d = Math.hypot(a.x - b.x, a.y - b.y);
    if (d > 1e-6) moved++;
    ok(Math.hypot(a.x - lakes[1].x, a.y - lakes[1].y) < 60, 'ледокол не выходит из озера: ' + i);
  }
  ok(moved === 20, 'ледокол ходит, а не стоит');
  ok(icebreakerAt(null, 0) === null, 'без озера ледокола нет');
}

/* F-183: приливы §5.10 — два за сутки, ±1.2 м */
{
  ok(Math.abs(tideM(0) + 1.2) < 1e-9, 'в полночь малая вода −1.2 м');
  ok(Math.abs(tideM(180)) < 1e-9, 'через три часа — ноль');
  ok(Math.abs(tideM(360) - 1.2) < 1e-9, 'через шесть часов полная вода +1.2 м');
  ok(Math.abs(tideM(540)) < 1e-9, 'через девять часов снова ноль');
  let hi = -Infinity, lo = Infinity;
  for (let i = 0; i < 20; i++) {
    const m = i * 72;                                  // сутки по 72 минуты
    const t = tideM(m);
    ok(Math.abs(t) <= 1.2 + 1e-9, 'прилив не выходит за ±1.2 м: ' + m);
    hi = Math.max(hi, t); lo = Math.min(lo, t);
  }
  ok(hi > 1.1 && lo < -1.1, 'амплитуда используется целиком');
  ok(Math.abs(tideM(120) - tideM(120 + 1440)) < 1e-9, 'сутки — тот же прилив');
}

/* Связка на настоящем мире: зима встаёт, лето тает, юг остаётся открытым */
{
  const roads = buildRoads();
  const water = buildWater(roads);
  // день года, а не номер игрового дня: мир начинается с 172-го (лето)
  const wIce = iceState(water, null, { doy: 40, minutes: 8 * 60, centerY: 2000 });
  const sIce = iceState(water, null, { doy: 200, minutes: 13 * 60, centerY: 2000 });
  ok(wIce.snow > 0.5, 'зимой лежит снег: ' + wIce.snow.toFixed(2));
  ok(sIce.snow === 0, 'летом снега нет');
  ok(wIce.frozenLakes > 10, 'зимой встаёт большая часть северных озёр: ' + wIce.frozenLakes);
  ok(sIce.frozenLakes === 0, 'летом озёра открыты');
  ok(wIce.frozenRivers > 100, 'мелкие таёжные реки встают: ' + wIce.frozenRivers);
  ok(sIce.frozenRivers === 0, 'летом реки текут');
  ok(wIce.maxIce >= 40 && wIce.maxIce <= ICE.maxIceCm + 1, 'лёд зимой толстый, но в пределе: ' + wIce.maxIce + ' см');
  ok(wIce.breaker && wIce.breaker.areaKm2 >= ICE.breakerMinAreaKm2, 'зимой работает ледокол');
  ok(!sIce.breaker, 'летом ледокола нет');
  ok(wIce.iceByLake.size === wIce.frozenLakes, 'толщина посчитана для каждого вставшего озера');
  const southIce = iceState(water, null, { doy: 340, minutes: 7 * 60, centerY: -2000 });
  ok(southIce.frost > 0.2, 'осенью на юге утром иней: ' + southIce.frost.toFixed(2));
  ok(southIce.frozenLakes < wIce.frozenLakes, 'на юге встаёт меньше озёр, чем на севере');
  ok(Math.abs(wIce.tide) <= 1.2, 'прилив в пределах');
}

console.log('OK: 8 групп проверок льда §5.11 и приливов §5.10 (F-177…F-183, проверок ' + checks + ')');
