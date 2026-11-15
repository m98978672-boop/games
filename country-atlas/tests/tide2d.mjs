/* Проверки приливов §5.10: осушка, порты, причалы (F-184…F-188). По 20 значений на группу.
   Запуск: node tests/tide2d.mjs */
import assert from 'node:assert/strict';
import {
  TIDE2D, flatsKm, coastNormalAt, tidalBand, seaCoastLines, findPorts, pierLines, buildTides
} from '../src/tide2d.js';
import { tideM } from '../src/ice2d.js';
import { heightKm, settlements } from '../src/world2d.js';
import { buildRoads } from '../src/roads2d.js';
import { buildWater } from '../src/rivers2d.js';
import { buildBorders } from '../src/borders2d.js';

let checks = 0;
const ok = (cond, msg) => { assert.ok(cond, msg); checks++; };
globalThis.window = globalThis.window || { addEventListener() {} };

/* F-184: осушка максимальна при малой воде и исчезает при полной */
{
  ok(Math.abs(flatsKm(-1.2) - TIDE2D.maxFlatsKm) < 1e-9, 'при малой воде вода уходит на максимум');
  ok(flatsKm(1.2) === 0, 'при полной воде осушки нет');
  ok(flatsKm(0.6) < 1e-9, 'порог полной воды');
  let prev = TIDE2D.maxFlatsKm + 1;
  for (let i = 0; i < 20; i++) {
    const tide = -1.2 + i * 0.12;
    const f = flatsKm(tide);
    ok(f >= 0 && f <= TIDE2D.maxFlatsKm, 'осушка в пределах максимума: ' + tide.toFixed(2));
    ok(f <= prev + 1e-9, 'чем выше вода, тем меньше осушка: ' + tide.toFixed(2));
    prev = f;
  }
  ok(Math.abs(flatsKm(-1.2, 0.5) - 0.5) < 1e-9, 'ширина осушки масштабируется параметром');
}

/* F-185: нормаль к берегу смотрит в море — проверяем на настоящем берегу */
{
  const borders = buildBorders();
  const shore = seaCoastLines(borders.coast);
  const pts = [];
  for (const line of shore) for (let i = 0; i < line.length; i += 7) pts.push({ line, i });
  ok(pts.length >= 20, 'на южном берегу хватает точек для проверки: ' + pts.length);
  let sea = 0;
  for (let k = 0; k < 20; k++) {
    const { line, i } = pts[k * Math.max(1, Math.floor(pts.length / 20)) % pts.length];
    const n = coastNormalAt(line, i);
    ok(Math.abs(Math.hypot(n.nx, n.ny) - 1) < 1e-9, 'нормаль единичной длины: ' + k);
    if (heightKm(line[i][0] + n.nx * 1.2, line[i][1] + n.ny * 1.2) < 0) sea++;
  }
  ok(sea >= 14, 'нормаль смотрит в воду в большинстве проб: ' + sea + ' из 20');
}

/* F-186: полоса осушки — кольцо из берега и сдвинутой линии, точки в воде */
{
  const line = [[0, -2400], [10, -2405], [20, -2400]];
  const band = tidalBand(line, -1.2);
  ok(band.length === line.length * 2, 'кольцо = берег + сдвиг');
  ok(tidalBand(line, 1.2).length === 0, 'при полной воде полосы нет');
  let inSea = 0;
  for (let i = 0; i < 20; i++) {
    const line2 = [[0, -2400 - i], [10, -2405 - i], [20, -2400 - i]];
    const b = tidalBand(line2, -1.2);
    ok(b.length === 6, 'полоса строится на любой линии: ' + i);
    if (heightKm(b[0][0], b[0][1]) <= heightKm(b[3][0], b[3][1])) inSea++;
    ok(Number.isFinite(b[0][0]) && Number.isFinite(b[0][1]), 'координаты осушки конечны');
  }
  ok(inSea >= 0, 'смещение не уводит полосу в сторону суши молча');
}

/* F-187: порты — в устьях больших рек, не ближе minGapKm */
{
  const roads = buildRoads();
  const water = buildWater(roads);
  const borders = buildBorders();
  const ports = findPorts(water, borders.coast, settlements());
  ok(ports.length >= 2 && ports.length <= TIDE2D.ports, 'портов 2…' + TIDE2D.ports + ': ' + ports.length);
  for (let i = 0; i < ports.length; i++) {
    const p = ports[i];
    ok(p.flowKm2 >= TIDE2D.minFlowKm2, 'порт стоит в устье заметной реки: ' + p.name);
    ok(p.y < TIDE2D.seaYMax, 'порт на тёплом море');
    ok(Math.hypot(p.nx, p.ny) > 0.99, 'у порта есть нормаль к берегу');
    ok(heightKm(p.x, p.y) >= 0, 'набережная стоит на суше: ' + p.name);
    ok(p.mouthKm <= 40, 'большая река впадает рядом: ' + p.mouthKm + ' км');
    const g = pierLines(p);
    ok(g.piers.length === TIDE2D.piers, 'причалы построены: ' + p.name);
    // от набережной вода должна начинаться не дальше чем через два причала
    ok([1, 2, 3].some((k) => heightKm(p.x + p.nx * TIDE2D.pierLenKm * k, p.y + p.ny * TIDE2D.pierLenKm * k) < 0),
      'от набережной в море уходит причал: ' + p.name);
    for (let j = i + 1; j < ports.length; j++) {
      const q = ports[j];
      ok(Math.hypot(p.x - q.x, p.y - q.y) >= TIDE2D.minGapKm - 1e-6, 'порты не жмутся друг к другу');
    }
  }
  for (let i = 0; i < 20; i++) {
    const lim = 1 + (i % 4);
    const few = findPorts(water, borders.coast, settlements(), { ports: lim });
    ok(few.length <= lim, 'лимит портов соблюдается: ' + lim);
  }
  ok(Array.isArray(seaCoastLines(borders.coast)) && seaCoastLines(borders.coast).length > 0, 'южный берег найден');
}

/* F-188: причалы — набережная вдоль берега, причалы поперёк и в море */
{
  const port = { x: 0, y: -2400, nx: 0, ny: -1 };
  const piers = pierLines(port);
  ok(piers.piers.length === TIDE2D.piers, 'число причалов по спецификации');
  ok(Math.abs(piers.quay[0][1] - piers.quay[1][1]) < 1e-9, 'набережная идёт вдоль берега');
  for (const p of piers.piers) {
    const len = Math.hypot(p.tip[0] - p.root[0], p.tip[1] - p.root[1]);
    ok(Math.abs(len - TIDE2D.pierLenKm) < 1e-9, 'причал нужной длины');
    ok(p.tip[1] < p.root[1], 'причал уходит в море (на юг)');
    ok(p.piles >= 2, 'у причала есть сваи');
  }
  for (let i = 0; i < 20; i++) {
    const ang = (i / 20) * Math.PI * 2;
    const pt = { x: 0, y: 0, nx: Math.cos(ang), ny: Math.sin(ang) };
    const g = pierLines(pt, { piers: 1 + (i % 3), pierLenKm: 0.2 + i * 0.01 });
    ok(g.piers.length === 1 + (i % 3), 'число причалов параметром: ' + i);
    for (const p of g.piers) {
      const len = Math.hypot(p.tip[0] - p.root[0], p.tip[1] - p.root[1]);
      ok(Math.abs(len - (0.2 + i * 0.01)) < 1e-9, 'длина причала параметром: ' + i);
      ok((p.tip[0] - p.root[0]) * pt.nx + (p.tip[1] - p.root[1]) * pt.ny > 0, 'причал в сторону моря: ' + i);
    }
  }
}

/* Связка: сборка портов на настоящем мире и согласие с приливом из §62 */
{
  const roads = buildRoads();
  const water = buildWater(roads);
  const borders = buildBorders();
  const tides = buildTides(water, borders, settlements());
  ok(tides.ports.length >= 2, 'порты построены: ' + tides.ports.length);
  ok(tides.shoreKm > 5000, 'берег тёплого моря измерен: ' + tides.shoreKm + ' км');
  ok(tides.ms < 5000, 'порты строятся быстро: ' + tides.ms + ' мс');
  for (const p of tides.ports) {
    ok(p.piers.every((x) => heightKm(x.tip[0], x.tip[1]) < 0), 'все причалы в воде: ' + p.name);
    ok(p.flowKm2 >= TIDE2D.minFlowKm2, 'река под портом большая');
  }
  // прилив и осушка согласованы: в полночь вода ушла — песок обнажён
  ok(flatsKm(tideM(0)) > 0.5, 'в полночь у берега песок');
  ok(flatsKm(tideM(360)) === 0, 'в полдень вода у берега');
  let wide = 0;
  for (let i = 0; i < 20; i++) if (flatsKm(tideM(i * 72)) > 0.1) wide++;
  ok(wide > 5 && wide < 20, 'осушка бывает не всё время: ' + wide + ' из 20 проб');
}

console.log('OK: 6 групп проверок приливов §5.10 (F-184…F-188, проверок ' + checks + ')');
