/* Проверки 2D-мира: node tests/world2d.mjs */
import assert from 'node:assert/strict';
import { WORLD2D, heightKm, colorAtKm, ridge, renderRect, settlements, rankSettlements, TOWN_COUNT } from '../src/world2d.js';
import { screenToWorld, worldToScreen, clampCenter, zoomAt, shiftBy, gridStep, scaleBarKm, patchPixels, fitScale } from '../src/view2d.js';

assert.equal(WORLD2D.sizeKm, 7000, 'карта ровно 7000 км');
assert.equal(WORLD2D.halfKm, 3500, 'от центра до края 3500 км');

// 1. детерминизм
const a = heightKm(12.34, -56.78), b = heightKm(12.34, -56.78);
assert.equal(a, b, 'высота в точке считается одинаково');

// 2. диапазон
let min = 1e9, max = -1e9, water = 0, total = 0;
for (let y = -3500; y <= 3500; y += 70) {
  for (let x = -3500; x <= 3500; x += 70) {
    const h = heightKm(x, y, 70);
    assert.ok(Number.isFinite(h), 'высота конечна');
    if (h < min) min = h;
    if (h > max) max = h;
    if (h < 0) water++;
    total++;
  }
}
assert.ok(min >= -251, 'дно не ниже −250 м: ' + min);
assert.ok(max <= WORLD2D.maxHeight + 1, 'пик не выше 4800 м: ' + max);
assert.ok(max > 2500, 'есть настоящие горы: ' + Math.round(max));
const share = water / total;
assert.ok(share > 0.12 && share < 0.40, 'море занимает 12–40 %, а не ' + (100 * share).toFixed(1) + '%');

// 3. цвет — три канала в диапазоне
for (const [x, y] of [[0, 0], [-2000, 1000], [1200, -2400], [3000, 3000]]) {
  const c = colorAtKm(x, y);
  assert.equal(c.length, 3);
  assert.ok(c.every((v) => Number.isFinite(v) && v >= 0 && v <= 255), 'цвет в 0…255');
}

// 4. пиксели патча
const w = 64, h = 48;
const px = renderRect(0, 0, 800, w, h);
assert.equal(px.length, w * h * 4, 'RGBA на каждый пиксель');
assert.ok(px.some((v, i) => i % 4 === 3 && v === 255), 'альфа заполнена');

// 5. поселения на суше и не липнут друг к другу
const towns = settlements();
assert.equal(towns.length, TOWN_COUNT, 'поселений ' + TOWN_COUNT);
assert.equal(new Set(towns.map((t) => t.name)).size, towns.length, 'имена не повторяются');
for (const t of towns) assert.ok(t.h >= 12 && t.h <= 1200, 'поселение на суше: ' + t.h);
let minGap = Infinity;
for (let i = 0; i < towns.length; i++) {
  for (let j = i + 1; j < towns.length; j++) {
    minGap = Math.min(minGap, Math.hypot(towns[i].x - towns[j].x, towns[i].y - towns[j].y));
  }
}
assert.ok(minGap >= 89.9, 'поселения не ближе 90 км: ' + minGap.toFixed(1));

// 5б. F-108: столица и хабы
const ranks = rankSettlements(towns, 10);
assert.equal(ranks.hubs.length, 10, 'десять хабов');
assert.ok(ranks.hubs.includes(ranks.capital), 'столица среди хабов');
const capD = Math.hypot(towns[ranks.capital].x, towns[ranks.capital].y);
for (let i = 0; i < towns.length; i++) {
  assert.ok(Math.hypot(towns[i].x, towns[i].y) >= capD - 1e-9, 'столица ближе всех к центру мира');
}

// 6. гребень F-79
for (let i = 0; i <= 20; i++) {
  const r = ridge(i / 20);
  assert.ok(r >= 0 && r <= 1, 'ridge вне [0,1]');
}


/* 7. геометрия вида: каждая формула на 20 значениях --- */
const view = { w: 1600, h: 900 };
const extent = WORLD2D.halfKm;

// F-90: центр всегда внутри карты (20 пар)
for (let i = 0; i < 20; i++) {
  const cx = (i - 10) * 337.7, cy = (10 - i) * 291.3, s = 0.08 + i * 10;
  const c = clampCenter({ x: cx, y: cy }, view, s);
  const halfW = Math.min(view.w / (2 * s), extent), halfH = Math.min(view.h / (2 * s), extent);
  assert.ok(c.x >= -extent + halfW - 1e-9 && c.x <= extent - halfW + 1e-9, 'F-90 x на шаге ' + i);
  assert.ok(c.y >= -extent + halfH - 1e-9 && c.y <= extent - halfH + 1e-9, 'F-90 y на шаге ' + i);
}

// F-93: зум к якорю — точка под курсором неизменна (20 значений)
for (let i = 0; i < 20; i++) {
  const s = 0.4 + i * 3.1, next = 0.08 + ((i * 13) % 40) * 5;
  const center = { x: (i - 10) * 12, y: (i - 10) * -9 };
  const anchor = { x: 120 + i * 61, y: 90 + i * 33 };
  const before = screenToWorld(center, view, s, anchor.x, anchor.y);
  const r = zoomAt(center, view, s, next, anchor);
  const after = screenToWorld(r.center, view, r.scale, anchor.x, anchor.y);
  // якорь держится, пока центр не упёрся в границу карты
  const pinned = Math.abs(r.center.x) < extent - view.w / (2 * r.scale) - 1e-6;
  if (pinned) assert.ok(Math.abs(before.x - after.x) < 1e-6, 'F-93 x на шаге ' + i);
  assert.ok(r.scale >= 0.08 && r.scale <= 600, 'F-93 предел зума');
}

// F-94: сдвиг в пикселях → километры (20 значений)
for (let i = 0; i < 20; i++) {
  const s = 3 + i * 1.5;   // при мелком зуме мир шире экрана и центр прижат к нулю
  const c0 = { x: 0, y: 0 };
  const c1 = shiftBy(c0, view, s, 100, -160);
  assert.ok(Math.abs((c0.x - c1.x) - 100 / s) < 1e-9 || Math.abs(c1.x) === extent, 'F-94 x на шаге ' + i);
  assert.ok(Math.abs((c1.y - c0.y) + 160 / s) < 1e-9 || Math.abs(c1.y) === extent, 'F-94 y на шаге ' + i);
}

// F-95: шаг сетки из ряда 1/2/5/10/25/50/100/250/500/1000, 20 значений
const STEPS = [0.25, 0.5, 1, 2, 5, 10, 25, 50, 100, 250, 500, 1000];
for (let i = 0; i < 20; i++) {
  const s = Math.min(600, 0.08 * Math.pow(1.62, i));   // 0.08 … 600 px/км
  const step = gridStep(s);
  assert.ok(STEPS.includes(step), 'F-95: шаг из ряда, а не ' + step);
  assert.ok(step * s <= 220 + 1e-9, 'F-95: шаг не шире 220 px при s=' + s.toFixed(2));
  const next = STEPS.find((v) => v > step);
  if (next && step !== STEPS[0]) assert.ok(next * s > 220, 'F-95: следующий шаг уже не влезает');
}

// F-99a: линейка не шире 160 px (20 значений)
for (let i = 0; i < 20; i++) {
  const s = Math.min(200, 0.08 * Math.pow(1.5, i));
  const km = scaleBarKm(s);
  if (km !== 1) assert.ok(km * s <= 160 + 1e-9, 'линейка шире 160 px при s=' + s);
}

// F-98: пиксели патча 256…768 (20 значений)
for (let i = 0; i < 20; i++) {
  const px = patchPixels(200 + i * 240, 1 + (i % 3), 768);
  assert.ok(px >= 256 && px <= 768, 'F-98 вне 256…768: ' + px);
}

// вписать мир в экран: 20 размеров окна
for (let i = 0; i < 20; i++) {
  const v = { w: 320 + i * 90, h: 200 + i * 62 };
  const s = fitScale(v);
  assert.ok(s * WORLD2D.sizeKm <= Math.min(v.w, v.h) + 1e-9, 'мир помещается в экран');
  assert.ok(s * WORLD2D.sizeKm >= 0.9 * Math.min(v.w, v.h), 'мир занимает почти весь экран');
}

// перевод экран ↔ мир: 20 точек туда и обратно
for (let i = 0; i < 20; i++) {
  const s = 0.4 + i * 3.3, center = { x: (i - 10) * 15, y: (10 - i) * 11 };
  const p = screenToWorld(center, view, s, 40 + i * 70, 20 + i * 41);
  const q = worldToScreen(center, view, s, p.x, p.y);
  assert.ok(Math.abs(q.x - (40 + i * 70)) < 1e-6 && Math.abs(q.y - (20 + i * 41)) < 1e-6, 'обратный перевод на шаге ' + i);
}


/* 8. протокол воркера: обзор и патч приходят готовыми буферами --- */
{
  const posted = [];
  globalThis.self = { onmessage: null, postMessage: (msg, transfer) => posted.push({ msg, transfer }) };
  await import('../src/map-worker.js');
  const send = (data) => globalThis.self.onmessage({ data });

  send({ type: 'overview', size: 64 });
  const first = posted[0];
  assert.equal(first.msg.type, 'overview');
  assert.equal(first.msg.size, 16, 'первым приходит грубый мир 1/4 стороны (F-111)');
  assert.equal(first.msg.buffer.byteLength, 16 * 16 * 4, 'грубый слой — RGBA 16×16');
  assert.equal(first.msg.full, 64, 'крупный размер назван в сообщении');
  assert.equal(first.transfer.length, 1, 'буфер переносится, а не копируется');
  const tiles = posted.slice(1);
  assert.equal(tiles.length, 4, 'четыре плитки по 1/2 стороны');
  const seen = new Set();
  for (const t of tiles) {
    assert.equal(t.msg.type, 'tile');
    assert.equal(t.msg.size, 32, 'плитка 1/2 стороны');
    assert.equal(t.msg.buffer.byteLength, 32 * 32 * 4, 'плитка — RGBA 32×32');
    assert.equal(t.transfer.length, 1, 'плитка переносится');
    seen.add(t.msg.i + ',' + t.msg.j);
  }
  assert.equal(seen.size, 4, 'четыре разных квадранта');

  send({ type: 'patch', key: 'k1', x0: 10, y0: -20, wKm: 30, hKm: 18, w: 40, h: 24 });
  const p = posted.at(-1).msg;
  assert.equal(p.type, 'patch');
  assert.equal(p.key, 'k1', 'ключ возвращается к отправителю');
  assert.equal(p.buffer.byteLength, 40 * 24 * 4, 'патч — RGBA 40×24');
  assert.equal(new Uint8ClampedArray(p.buffer).filter((v, i) => i % 4 === 3 && v === 255).length, 40 * 24, 'альфа полная');
  assert.deepEqual(posted.at(-1).transfer.length, 1, 'перенос без копии');
  delete globalThis.self;
}

console.log('мир: ' + WORLD2D.sizeKm + ' × ' + WORLD2D.sizeKm + ' км, точек в выборке ' + total);
console.log('поселений: ' + towns.length + ', минимальный зазор ' + minGap.toFixed(0) + ' км, столица ' + towns[ranks.capital].name);
console.log('высота: ' + min.toFixed(0) + '…' + max.toFixed(0) + ' м, море ' + (100 * share).toFixed(1) + '%');

console.log('OK: 8 групп проверок мира 2D (формулы F-90…F-99 по 20 значений, протокол воркера)');
