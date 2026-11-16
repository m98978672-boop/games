/* Рисунок ИИ §16: полигон IDM после 90 с работы и два графика — торможение от зазора
   (четыре характера) и зелёный от очереди (F-193). Без браузера.
   Запуск: node tools/fig-ai.mjs → docs/ai-idm.png */
import { deflateSync } from 'node:zlib';
import { writeFileSync } from 'node:fs';
import { DRIVER, idmAccel, greenTime, PROFILE_IDS } from '../src/ai2d.js';
import { buildPlay, stepPlay, playStats, PLAY2D, PROFILE_COLOR } from '../src/play2d.js';

globalThis.window = globalThis.window || { addEventListener() {} };

const W = 900, H = 460, buf = new Uint8Array(W * H * 3);
const hex = (s) => [parseInt(s.slice(1, 3), 16), parseInt(s.slice(3, 5), 16), parseInt(s.slice(5, 7), 16)];

const px = (x, y, c, a = 1) => {
  const xi = x | 0, yi = y | 0;
  if (xi < 0 || yi < 0 || xi >= W || yi >= H) return;
  const i = (yi * W + xi) * 3;
  buf[i] = buf[i] * (1 - a) + c[0] * a;
  buf[i + 1] = buf[i + 1] * (1 - a) + c[1] * a;
  buf[i + 2] = buf[i + 2] * (1 - a) + c[2] * a;
};
const disc = (x, y, r, c, a = 1) => {
  for (let dy = -r; dy <= r; dy += 0.5) for (let dx = -r; dx <= r; dx += 0.5) if (dx * dx + dy * dy <= r * r) px(x + dx, y + dy, c, a);
};
const line = (x0, y0, x1, y1, w, c, a = 1) => {
  const n = Math.max(1, Math.hypot(x1 - x0, y1 - y0) * 2);
  for (let i = 0; i <= n; i++) disc(x0 + (x1 - x0) * i / n, y0 + (y1 - y0) * i / n, Math.max(0.5, w / 2), c, a);
};
const rect = (x0, y0, x1, y1, c) => {
  for (let y = Math.max(0, y0 | 0); y < Math.min(H, y1); y++) for (let x = Math.max(0, x0 | 0); x < Math.min(W, x1); x++) px(x, y, c, 1);
};

// фон: тёмный асфальт сверху, «бумага» снизу под графики
rect(0, 0, W, H, [22, 30, 38]);
rect(0, 250, W, H, [246, 243, 236]);

/* ---- верх: полигон после 90 секунд ---- */
const play = buildPlay(424242);
for (let i = 0; i < 1800; i++) stepPlay(play, 0.05);
const st = playStats(play);
const laneY = 128, laneX0 = 60, laneX1 = W - 60;
const k = (laneX1 - laneX0) / PLAY2D.ringM;
rect(laneX0, laneY - 18, laneX1, laneY + 18, [60, 66, 72]);
line(laneX0, laneY, laneX1, laneY, 1, [210, 214, 218], 0.5);
// стоп-линия и три лампы светофора
const stopX = laneX0 + PLAY2D.stopM * k;
for (let y = laneY - 22; y < laneY + 22; y += 4) line(stopX, y, stopX, y + 2, 2, [245, 245, 240]);
const lamps = { green: [93, 220, 132], yellow: [255, 215, 94], red: [255, 106, 82] };
['red', 'yellow', 'green'].forEach((id, i) => {
  const ly = laneY - 78 + i * 22;
  disc(stopX + 4, ly, 8.4, [10, 14, 18]);
  disc(stopX + 4, ly, 6, lamps[id], st.state === id ? 1 : 0.16);
});
line(stopX + 4, laneY - 56, stopX + 4, laneY - 22, 2, [40, 44, 50]);
for (const c of play.cars) {
  const cx = laneX0 + c.x * k;
  const col = hex(PROFILE_COLOR[c.profile.id]);
  rect(cx - 5, laneY - 4, cx + 5, laneY + 4, col);
  if (c.braking > 0.15) {
    disc(cx + 6, laneY - 9, 3.2, [255, 90, 70], 0.35 + 0.6 * c.braking);
    disc(cx + 6, laneY - 9, 6.5, [255, 90, 70], 0.1 + 0.25 * c.braking);
  }
}
// полоса-легенда характеров
PROFILE_IDS.forEach((id, i) => {
  disc(80 + i * 110, 208, 6, hex(PROFILE_COLOR[id]));
});

/* ---- нижний левый: IDM — ускорение от зазора, v = 14 м/с ---- */
const ax0 = 70, ay0 = 420, ax1 = 420, ayTop = 290;
line(ax0, ayTop, ax0, ay0, 1.4, [60, 60, 60]);
line(ax0, (ayTop + ay0) / 2, ax1, (ayTop + ay0) / 2, 1, [150, 150, 150]);
const aMin = -6, aMax = 2, gapMax = 80;
const gx = (g) => ax0 + (g / gapMax) * (ax1 - ax0);
const gy = (a) => ay0 - ((a - aMin) / (aMax - aMin)) * (ay0 - ayTop);
for (const id of ['calm', 'normal', 'aggressive', 'novice']) {
  const P = DRIVER[id], col = hex(PROFILE_COLOR[id]);
  let pxPrev = null, pyPrev = null;
  for (let g = 1; g <= gapMax; g += 0.5) {
    const a = idmAccel(14, (60 + P.over) / 3.6, g, -2, P);
    const x = gx(g), y = gy(Math.max(aMin, Math.min(aMax, a)));
    if (pxPrev !== null) line(pxPrev, pyPrev, x, y, 2.2, col);
    pxPrev = x; pyPrev = y;
  }
}

/* ---- нижний правый: зелёный от очереди (F-193) ---- */
const bx0 = 520, by0 = 420, bx1 = 840, byTop = 310;
line(bx0, byTop, bx0, by0, 1.4, [60, 60, 60]);
line(bx0, by0, bx1, by0, 1.4, [60, 60, 60]);
for (let q = 0; q <= 40; q++) {
  const g = greenTime(q);
  const x = bx0 + (q / 40) * (bx1 - bx0);
  const y = by0 - ((g - 6) / 30) * (by0 - byTop);
  rect(x - 4, y, x + 4, by0, [120, 168, 196]);
  disc(x, y, 1.8, [40, 80, 110]);
}

/* ---- PNG ---- */
const raw = Buffer.alloc((W * 3 + 1) * H);
for (let y = 0; y < H; y++) { raw[y * (W * 3 + 1)] = 0; Buffer.from(buf.buffer, y * W * 3, W * 3).copy(raw, y * (W * 3 + 1) + 1); }
const crcTable = [];
for (let n = 0; n < 256; n++) { let c = n; for (let t = 0; t < 8; t++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; crcTable[n] = c >>> 0; }
const chunk = (type, data) => {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type), data]);
  let crc = 0xffffffff; for (const b of body) crc = crcTable[(crc ^ b) & 0xff] ^ (crc >>> 8);
  const crcB = Buffer.alloc(4); crcB.writeUInt32BE((crc ^ 0xffffffff) >>> 0);
  return Buffer.concat([len, body, crcB]);
};
const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(W, 0); ihdr.writeUInt32BE(H, 4); ihdr[8] = 8; ihdr[9] = 2;
writeFileSync(new URL('../docs/ai-idm.png', import.meta.url),
  Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]));
console.log('ai-idm.png · полигон: свет ' + st.state + ' · очередь ' + st.queue + ' · прошло ' + st.passed +
  ' · ср ' + st.avgKmh.toFixed(0) + ' км/ч · зазор ' + st.minGap.toFixed(1) + ' м');
