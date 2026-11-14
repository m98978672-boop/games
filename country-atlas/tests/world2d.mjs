/* Проверки 2D-мира: node tests/world2d.mjs */
import assert from 'node:assert/strict';
import { WORLD2D, heightKm, colorAtKm, ridge, renderRect, settlements } from '../src/world2d.js';
import { screenToWorld, worldToScreen, clampCenter, zoomAt, shiftBy, gridStep, scaleBarKm, patchPixels } from '../src/view2d.js';

assert.equal(WORLD2D.sizeKm, 700, 'карта ровно 700 км');
assert.equal(WORLD2D.halfKm, 350, 'от центра до края 350 км');

// 1. детерминизм
const a = heightKm(12.34, -56.78), b = heightKm(12.34, -56.78);
assert.equal(a, b, 'высота в точке считается одинаково');

// 2. диапазон
let min = 1e9, max = -1e9, water = 0, total = 0;
for (let y = -350; y <= 350; y += 7) {
  for (let x = -350; x <= 350; x += 7) {
    const h = heightKm(x, y);
    assert.ok(Number.isFinite(h), 'высота конечна');
    if (h < min) min = h;
    if (h > max) max = h;
    if (h < 0) water++;
    total++;
  }
}
assert.ok(min >= -181, 'дно не ниже −180 м: ' + min);
assert.ok(max <= WORLD2D.maxHeight + 1, 'пик не выше 2900 м: ' + max);
const share = water / total;
assert.ok(share > 0.12 && share < 0.45, 'море занимает 12–45 %, а не ' + (100 * share).toFixed(1) + '%');

// 3. цвет — три канала в диапазоне
for (const [x, y] of [[0, 0], [-200, 100], [120, -240], [300, 300]]) {
  const c = colorAtKm(x, y);
  assert.equal(c.length, 3);
  assert.ok(c.every((v) => Number.isFinite(v) && v >= 0 && v <= 255), 'цвет в 0…255');
}

// 4. пиксели патча
const w = 64, h = 48;
const px = renderRect(0, 0, 80, w, h);
assert.equal(px.length, w * h * 4, 'RGBA на каждый пиксель');
assert.ok(px.some((v, i) => i % 4 === 3 && v === 255), 'альфа заполнена');

// 5. поселения на суше и не липнут друг к другу
const towns = settlements(18);
assert.equal(towns.length, 18, '18 поселений');
for (const t of towns) assert.ok(t.h >= 12 && t.h <= 620, 'поселение на суше: ' + t.h);
for (let i = 0; i < towns.length; i++) {
  for (let j = i + 1; j < towns.length; j++) {
    const d = Math.hypot(towns[i].x - towns[j].x, towns[i].y - towns[j].y);
    assert.ok(d >= 44.9, 'поселения не ближе 45 км: ' + d.toFixed(1));
  }
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
  const cx = (i - 10) * 137.7, cy = (10 - i) * 91.3, s = 0.35 + i * 4.4;
  const c = clampCenter({ x: cx, y: cy }, view, s);
  const halfW = Math.min(view.w / (2 * s), extent), halfH = Math.min(view.h / (2 * s), extent);
  assert.ok(c.x >= -extent + halfW - 1e-9 && c.x <= extent - halfW + 1e-9, 'F-90 x на шаге ' + i);
  assert.ok(c.y >= -extent + halfH - 1e-9 && c.y <= extent - halfH + 1e-9, 'F-90 y на шаге ' + i);
}

// F-93: зум к якорю — точка под курсором неизменна (20 значений)
for (let i = 0; i < 20; i++) {
  const s = 0.4 + i * 3.1, next = 0.35 + ((i * 13) % 40) * 2.2;
  const center = { x: (i - 10) * 12, y: (i - 10) * -9 };
  const anchor = { x: 120 + i * 61, y: 90 + i * 33 };
  const before = screenToWorld(center, view, s, anchor.x, anchor.y);
  const r = zoomAt(center, view, s, next, anchor);
  const after = screenToWorld(r.center, view, r.scale, anchor.x, anchor.y);
  // якорь держится, пока центр не упёрся в границу карты
  const pinned = Math.abs(r.center.x) < extent - view.w / (2 * r.scale) - 1e-6;
  if (pinned) assert.ok(Math.abs(before.x - after.x) < 1e-6, 'F-93 x на шаге ' + i);
  assert.ok(r.scale >= 0.35 && r.scale <= 90, 'F-93 предел зума');
}

// F-94: сдвиг в пикселях → километры (20 значений)
for (let i = 0; i < 20; i++) {
  const s = 3 + i * 1.5;   // при мелком зуме мир шире экрана и центр прижат к нулю
  const c0 = { x: 0, y: 0 };
  const c1 = shiftBy(c0, view, s, 100, -160);
  assert.ok(Math.abs((c0.x - c1.x) - 100 / s) < 1e-9 || Math.abs(c1.x) === extent, 'F-94 x на шаге ' + i);
  assert.ok(Math.abs((c1.y - c0.y) + 160 / s) < 1e-9 || Math.abs(c1.y) === extent, 'F-94 y на шаге ' + i);
}

// F-95: шаг сетки — три полосы, 20 значений
for (let i = 0; i < 20; i++) {
  const s = 0.35 + i * 4.5;
  const step = gridStep(s);
  const want = s > 12 ? 10 : s > 4 ? 25 : 50;
  assert.equal(step, want, 'F-95 на шаге ' + i);
}

// F-99a: линейка не шире 160 px (20 значений)
for (let i = 0; i < 20; i++) {
  const s = 0.35 + i * 4.5;
  const km = scaleBarKm(s);
  assert.ok(km * s <= 160 + 1e-9, 'линейка шире 160 px при s=' + s);
}

// F-98: пиксели патча 256…1024 (20 значений)
for (let i = 0; i < 20; i++) {
  const px = patchPixels(200 + i * 240, 1 + (i % 3));
  assert.ok(px >= 256 && px <= 1024, 'F-98 вне 256…1024: ' + px);
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
  assert.equal(posted.at(-1).msg.type, 'overview');
  assert.equal(posted.at(-1).msg.buffer.byteLength, 64 * 64 * 4, 'обзор — RGBA 64×64');
  assert.ok(posted.at(-1).transfer.length === 1, 'буфер переносится, а не копируется');

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
console.log('высота: ' + min.toFixed(0) + '…' + max.toFixed(0) + ' м, море ' + (100 * share).toFixed(1) + '%');
console.log('поселений: ' + towns.length + ', ближайшая пара ≥ 45 км');
console.log('OK: 8 групп проверок мира 2D (формулы F-90…F-99 по 20 значений, протокол воркера)');
