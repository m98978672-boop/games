/* Рисунок «север зимой» §5.11: своё полотно, без браузера. Лёд на озёрах и реках, ледокол.
   Запуск: node tools/fig-ice.mjs  → docs/ice-north.png */
import { deflateSync } from 'node:zlib';
import { writeFileSync } from 'node:fs';
import { buildRoads } from '../src/roads2d.js';
import { buildWater } from '../src/rivers2d.js';
import { iceState, north01, ICE } from '../src/ice2d.js';
import { dayOfYearOf } from '../src/light2d.js';

const W = 720, H = 720, buf = new Uint8Array(W * H * 3);
for (let i = 0; i < W * H; i++) { buf[i * 3] = 172; buf[i * 3 + 1] = 180; buf[i * 3 + 2] = 184; }   // зимняя суша
const px = (x, y, r, g, b, a = 1) => {
  const xi = x | 0, yi = y | 0;
  if (xi < 0 || yi < 0 || xi >= W || yi >= H) return;
  const i = (yi * W + xi) * 3;
  buf[i] = buf[i] * (1 - a) + r * a; buf[i + 1] = buf[i + 1] * (1 - a) + g * a; buf[i + 2] = buf[i + 2] * (1 - a) + b * a;
};
const disc = (x, y, r, c, a = 1) => { for (let dy = -r; dy <= r; dy += 0.5) for (let dx = -r; dx <= r; dx += 0.5) if (dx * dx + dy * dy <= r * r) px(x + dx, y + dy, c[0], c[1], c[2], a); };
const line = (x0, y0, x1, y1, w, c) => {
  const n = Math.max(1, Math.hypot(x1 - x0, y1 - y0) * 2);
  for (let i = 0; i <= n; i++) disc(x0 + (x1 - x0) * i / n, y0 + (y1 - y0) * i / n, Math.max(0.5, w / 2), c);
};
const poly = (pts, c) => {
  let minY = Infinity, maxY = -Infinity;
  for (const p of pts) { minY = Math.min(minY, p[1]); maxY = Math.max(maxY, p[1]); }
  for (let y = Math.floor(minY); y <= Math.ceil(maxY); y++) {
    const xs = [];
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i], b = pts[(i + 1) % pts.length];
      if ((a[1] <= y && b[1] > y) || (b[1] <= y && a[1] > y)) xs.push(a[0] + (y - a[1]) / (b[1] - a[1]) * (b[0] - a[0]));
    }
    xs.sort((p, q) => p - q);
    for (let k = 0; k + 1 < xs.length; k += 2) for (let x = Math.ceil(xs[k]); x <= xs[k + 1]; x++) px(x, y, c[0], c[1], c[2], 1);
  }
};

const roads = buildRoads();
const water = buildWater(roads);
const minutes = 230 * 1440 + 8 * 60;              // зима
const doy = dayOfYearOf(Math.floor(minutes / 1440));
const lakes = water.lakes.filter((l) => north01(l.y) > 0.7).sort((a, b) => b.areaKm2 - a.areaKm2);
const lake = lakes[0];
const ice = iceState(water, null, { minutes, doy, centerY: lake.y });
const scale = 5, cx = lake.x, cy = lake.y;
const X = (x) => W / 2 + (x - cx) * scale, Y = (y) => H / 2 - (y - cy) * scale;

for (const l of water.rivers.lines) {
  if (l.widthM < 40) continue;
  for (let i = 1; i < l.pts.length; i++) {
    const a = l.pts[i - 1], b = l.pts[i];
    if (Math.hypot(a.x - cx, a.y - cy) > 70 && Math.hypot(b.x - cx, b.y - cy) > 70) continue;
    const frozen = l.widthM <= ICE.riverFreezeWidthM && north01(a.y) >= 0.4 && ice.snow >= ICE.riverFreezeSnow;
    line(X(a.x), Y(a.y), X(b.x), Y(b.y), Math.max(1, (l.widthM / 1000) * scale), frozen ? [206, 224, 232] : [78, 146, 186]);
  }
}
for (const l of water.lakes) {
  if (Math.hypot(l.x - cx, l.y - cy) > 130) continue;
  const frozen = ice.iceByLake.has(l);
  poly(l.ring.map((p) => [X(p[0]), Y(p[1])]), frozen ? [196, 216, 226] : [58, 117, 155]);
  for (let i = 1; i < l.ring.length; i++) line(X(l.ring[i - 1][0]), Y(l.ring[i - 1][1]), X(l.ring[i][0]), Y(l.ring[i][1]), 1, frozen ? [130, 158, 176] : [40, 84, 116]);
}
{
  let h = Math.round((lake.x * 7 + lake.y * 13) % 1000) | 0;
  const rnd = () => { h = (h * 1103515245 + 12345) & 0x7fffffff; return h / 0x7fffffff; };
  const cm = ice.iceByLake.get(lake) || 50;
  const n = Math.min(9, 3 + Math.round(cm / 12));
  for (let k = 0; k < n; k++) {
    const a = rnd() * Math.PI * 2, r = rnd() * 0.5;
    const x0 = lake.x + Math.cos(a) * r * 6, y0 = lake.y + Math.sin(a) * r * 6;
    const len = 1.5 + rnd() * 6, ang = rnd() * Math.PI;
    line(X(x0), Y(y0), X(x0 + Math.cos(ang) * len), Y(y0 + Math.sin(ang) * len), 1, [140, 168, 186]);
  }
}
if (ice.breakerPos) {
  disc(X(ice.breakerPos.x), Y(ice.breakerPos.y), 3.5, [196, 66, 48]);
  line(X(ice.breakerPos.x), Y(ice.breakerPos.y),
    X(ice.breakerPos.x + Math.cos(ice.breakerPos.heading) * 1.6), Y(ice.breakerPos.y + Math.sin(ice.breakerPos.heading) * 1.6), 1.6, [255, 255, 255]);
}

const raw = Buffer.alloc((W * 3 + 1) * H);
for (let y = 0; y < H; y++) { raw[y * (W * 3 + 1)] = 0; Buffer.from(buf.buffer, y * W * 3, W * 3).copy(raw, y * (W * 3 + 1) + 1); }
const crcTable = [];
for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; crcTable[n] = c >>> 0; }
const chunk = (type, data) => {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type), data]);
  let crc = 0xffffffff; for (const b of body) crc = crcTable[(crc ^ b) & 0xff] ^ (crc >>> 8);
  const crcB = Buffer.alloc(4); crcB.writeUInt32BE((crc ^ 0xffffffff) >>> 0);
  return Buffer.concat([len, body, crcB]);
};
const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(W, 0); ihdr.writeUInt32BE(H, 4); ihdr[8] = 8; ihdr[9] = 2;
writeFileSync(new URL('../docs/ice-north.png', import.meta.url), Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]));
console.log('ice-north.png · день года', doy, '· снег', ice.snow.toFixed(2), '· озёр во льду', ice.frozenLakes,
  '· лёд', ice.iceByLake.get(lake), 'см · ледокол', ice.breaker ? Math.round(ice.breaker.areaKm2) + ' км²' : '—');
