/* Рисунок порта при малой воде §5.10: море, полоса осушки, причалы. Без браузера.
   Запуск: node tools/fig-tide.mjs → docs/tide-port.png */
import { deflateSync } from 'node:zlib';
import { writeFileSync } from 'node:fs';
import { heightKm, settlements } from '../src/world2d.js';
import { buildRoads } from '../src/roads2d.js';
import { buildWater } from '../src/rivers2d.js';
import { buildBorders } from '../src/borders2d.js';
import { buildTides, tidalQuads, flatsKm } from '../src/tide2d.js';
import { tideM } from '../src/ice2d.js';

globalThis.window = globalThis.window || { addEventListener() {} };

const W = 760, H = 760, buf = new Uint8Array(W * H * 3);
const roads = buildRoads();
const water = buildWater(roads);
const borders = buildBorders();
const tides = buildTides(water, borders, settlements());
const port = tides.ports[0];
const tide = tideM(0);                                   // полночь: вода ушла
const scale = 150, cx = port.x + port.nx * 0.9, cy = port.y + port.ny * 0.9;
const X = (x) => W / 2 + (x - cx) * scale, Y = (y) => H / 2 - (y - cy) * scale;

const px = (x, y, r, g, b, a = 1) => {
  const xi = x | 0, yi = y | 0;
  if (xi < 0 || yi < 0 || xi >= W || yi >= H) return;
  const i = (yi * W + xi) * 3;
  buf[i] = buf[i] * (1 - a) + r * a; buf[i + 1] = buf[i + 1] * (1 - a) + g * a; buf[i + 2] = buf[i + 2] * (1 - a) + b * a;
};
const disc = (x, y, r, c, a = 1) => {
  for (let dy = -r; dy <= r; dy += 0.5) for (let dx = -r; dx <= r; dx += 0.5) if (dx * dx + dy * dy <= r * r) px(x + dx, y + dy, c[0], c[1], c[2], a);
};
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

// фон: море и суша по высоте, сэмпл через 4 px
const st = 4;
for (let sy = 0; sy < H; sy += st) {
  for (let sx = 0; sx < W; sx += st) {
    const wx = cx + (sx - W / 2) / scale, wy = cy - (sy - H / 2) / scale;
    const h = heightKm(wx, wy);
    const c = h < 0 ? [74, 132, 168] : h < 3 ? [206, 196, 158] : [158, 168, 132];
    for (let y = sy; y < Math.min(H, sy + st); y++) for (let x = sx; x < Math.min(W, sx + st); x++) px(x, y, c[0], c[1], c[2], 1);
  }
}

// полоса осушки вдоль берега
const km = flatsKm(tide);
if (km > 0.02) {
  for (const l of tides.shoreLines) {
    let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
    for (const p of l) { x0 = Math.min(x0, p[0]); x1 = Math.max(x1, p[0]); y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]); }
    if (x1 < cx - 8 || x0 > cx + 8 || y1 < cy - 8 || y0 > cy + 8) continue;
    for (const q of tidalQuads(l, tide)) poly(q.map((p) => [X(p[0]), Y(p[1])]), [230, 214, 176]);
  }
}

// река в устье
for (const l of water.rivers.lines) {
  if (l.widthM < 25) continue;
  for (let i = 1; i < l.pts.length; i++) {
    const a = l.pts[i - 1], b = l.pts[i];
    if (Math.hypot(a.x - cx, a.y - cy) > 8 && Math.hypot(b.x - cx, b.y - cy) > 8) continue;
    line(X(a.x), Y(a.y), X(b.x), Y(b.y), Math.max(1, (l.widthM / 1000) * scale), [62, 122, 160]);
  }
}

// порт: набережная, причалы, сваи, склад
line(X(port.quay[0][0]), Y(port.quay[0][1]), X(port.quay[1][0]), Y(port.quay[1][1]), 3.4, [74, 70, 62]);
line(X(port.quay[0][0]), Y(port.quay[0][1]), X(port.quay[1][0]), Y(port.quay[1][1]), 1.4, [238, 232, 214]);
for (const pier of port.piers) {
  line(X(pier.root[0]), Y(pier.root[1]), X(pier.tip[0]), Y(pier.tip[1]), 2.6, [84, 78, 68]);
  for (let k = 1; k <= pier.piles; k++) {
    const t = k / (pier.piles + 1);
    disc(X(pier.root[0] + (pier.tip[0] - pier.root[0]) * t), Y(pier.root[1] + (pier.tip[1] - pier.root[1]) * t), 2.0, [60, 56, 48]);
  }
}
const bx = X(port.x - port.nx * 0.12), by = Y(port.y - port.ny * 0.12);
poly([[bx - 14, by - 9], [bx + 14, by - 9], [bx + 14, by + 9], [bx - 14, by + 9]], [198, 186, 166]);

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
writeFileSync(new URL('../docs/tide-port.png', import.meta.url), Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]));
console.log('tide-port.png · порт', port.name, '· прилив', tide.toFixed(2), 'м · осушка', km.toFixed(2), 'км · причалов', port.piers.length);
