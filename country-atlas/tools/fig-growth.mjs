/* Рисунок §16.6–§16.8: город до и после решений мэра — новые дома, парк, склады,
   школа и объездная; рядом — толпа с силами отталкивания. Без браузера.
   Запуск: node tools/fig-growth.mjs → docs/ai-city.png */
import { deflateSync } from 'node:zlib';
import { writeFileSync } from 'node:fs';
import { settlements, rankSettlements } from '../src/world2d.js';
import { buildCity } from '../src/city2d.js';
import { buildGrowth, applyGrowth, progressAt, growthStats, GROWTH } from '../src/growth2d.js';
import { buildPedestrians, pedPositions } from '../src/ped2d.js';
import { buildCrowd, stepCrowd, spatialHash, nearestNeighbors } from '../src/pedsoc2d.js';

globalThis.window = globalThis.window || { addEventListener() {} };

const W = 960, H = 560, buf = new Uint8Array(W * H * 3);
const px = (x, y, c, a = 1) => {
  const xi = x | 0, yi = y | 0;
  if (xi < 0 || yi < 0 || xi >= W || yi >= H) return;
  const i = (yi * W + xi) * 3;
  buf[i] = buf[i] * (1 - a) + c[0] * a;
  buf[i + 1] = buf[i + 1] * (1 - a) + c[1] * a;
  buf[i + 2] = buf[i + 2] * (1 - a) + c[2] * a;
};
const disc = (x, y, r, c, a = 1) => {
  for (let dy = -r; dy <= r; dy += 0.4) for (let dx = -r; dx <= r; dx += 0.4) if (dx * dx + dy * dy <= r * r) px(x + dx, y + dy, c, a);
};
const line = (x0, y0, x1, y1, w, c, a = 1) => {
  const n = Math.max(1, Math.hypot(x1 - x0, y1 - y0) * 2);
  for (let i = 0; i <= n; i++) disc(x0 + (x1 - x0) * i / n, y0 + (y1 - y0) * i / n, Math.max(0.35, w / 2), c, a);
};
const poly = (pts, c, a = 1) => {
  let minY = Infinity, maxY = -Infinity;
  for (const p of pts) { minY = Math.min(minY, p[1]); maxY = Math.max(maxY, p[1]); }
  for (let y = Math.floor(minY); y <= Math.ceil(maxY); y++) {
    const xs = [];
    for (let i = 0; i < pts.length; i++) {
      const a1 = pts[i], b1 = pts[(i + 1) % pts.length];
      if ((a1[1] <= y && b1[1] > y) || (b1[1] <= y && a1[1] > y)) xs.push(a1[0] + (y - a1[1]) / (b1[1] - a1[1]) * (b1[0] - a1[0]));
    }
    xs.sort((p, q) => p - q);
    for (let k = 0; k + 1 < xs.length; k += 2) for (let x = Math.ceil(xs[k]); x <= xs[k + 1]; x++) px(x, y, c, a);
  }
};

const towns = settlements();
const ranks = rankSettlements(towns, 10);
const pick = 0;
const town = towns[pick];
const city = buildCity(town, pick, ranks);
const g = buildGrowth(town, city);
for (let d = 1; d <= 26; d++) {
  applyGrowth(g, ['housing', 'housing', 'park', 'road', 'industry', 'housing', 'school', 'bypass'][d % 8], d, d);
}
const st = growthStats(g, 40);

const scale = 52;
const panel = (x0, title) => x0;
const P1 = panel(10), P2 = panel(W / 2 + 6);
const CX = (px0) => px0 + 232, CY = H / 2 + 8;

const bg = [26, 31, 29];
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) px(x, y, bg);

function drawCity(px0, withGrowth) {
  const X = (x) => CX(px0) + (x - g.cx) * scale;
  const Y = (y) => CY - (y - g.cy) * scale;
  // кварталы
  for (const bl of city.blocks) {
    poly(bl.corners.map((q) => [X(q[0]), Y(q[1])]), bl.zone === 'park' ? [82, 118, 70] : [66, 64, 58], 0.95);
  }
  // улицы
  for (const s of city.streets) {
    const pts = s.pts || [s.a, s.b];
    for (let k = 1; k < pts.length; k++) {
      line(X(pts[k - 1][0]), Y(pts[k - 1][1]), X(pts[k][0]), Y(pts[k][1]),
        Math.max(0.6, s.widthM / 1000 * scale), s.major ? [214, 208, 196] : [150, 146, 136], 0.8);
    }
  }
  // дома города
  for (const b of city.buildings) {
    const bc = b.corners.map((q) => [X(q[0]), Y(q[1])]);
    poly(bc, [206, 186, 152], 0.92);
    // дом мельче 2 px — ставим точку, иначе кварталы исчезают
    let mnx = Infinity, mxx = -Infinity, mny = Infinity, mxy = -Infinity;
    for (const q of bc) { mnx = Math.min(mnx, q[0]); mxx = Math.max(mxx, q[0]); mny = Math.min(mny, q[1]); mxy = Math.max(mxy, q[1]); }
    if (Math.max(mxx - mnx, mxy - mny) < 2) disc((mnx + mxx) / 2, (mny + mxy) / 2, 1.0, [232, 214, 180], 0.9);
  }
  if (!withGrowth) return;

  // объездная
  if (g.bypass) {
    const bp = g.bypass, p = progressAt(bp, 40);
    for (let k = 1; k < bp.pts.length; k++) {
      line(X(bp.pts[k - 1][0]), Y(bp.pts[k - 1][1]), X(bp.pts[k][0]), Y(bp.pts[k][1]),
        Math.max(2.2, 0.013 * scale), p >= 1 ? [246, 234, 204] : [150, 138, 118]);
    }
  }
  // парки
  for (const park of g.parks) {
    poly(park.corners.map((q) => [X(q[0]), Y(q[1])]), [98, 158, 84]);
    for (const t of park.trees) disc(X(t.x), Y(t.y), Math.max(1.6, t.r * scale * 1.4), [44, 96, 44]);
  }
  // новые дома, склады, школа/больница
  const box = (item, tone, mark) => {
    const p = progressAt(item, 40);
    poly(item.corners.map((q) => [X(q[0]), Y(q[1])]), p >= 1 ? tone : [150, 138, 118], p >= 1 ? 1 : 0.6);
    const w2 = Math.max(3, GROWTH.houseW * scale);
    if (Math.abs(item.x - g.cx) * scale < 999) {
      // крупная метка: дом 14 м на 52 px/км — это меньше пикселя
      disc(X(item.x), Y(item.y), Math.max(3.1, w2 * 0.5), p >= 1 ? tone : [176, 156, 120], 1);
    }
    if (p < 1) {
      const cx = X(item.x), cy = Y(item.y);
      for (let k = -2; k <= 2; k++) line(cx - 3, cy + k * 2, cx + 3, cy + k * 2, 0.7, [200, 176, 130]);
      if (mark) disc(cx, cy, 3.4, [235, 168, 84]);
    } else if (mark) disc(X(item.x), Y(item.y), 2.4, mark);
  };
  for (const h of g.houses) box(h, [250, 206, 110], [255, 236, 160]);
  for (const w of g.industry) box(w, [150, 176, 190], [186, 210, 224]);
  for (const c of g.civic) box(c, c.kind === 'school' ? [252, 238, 150] : [242, 250, 255], c.kind === 'school' ? [255, 246, 186] : [226, 244, 255]);
  // расширение кольца
  if (g.widen > 0) {
    const n = 96, r = g.radiusKm * 0.995;
    for (let k = 1; k <= n; k++) {
      const a1 = (k - 1) / n * Math.PI * 2, a2 = k / n * Math.PI * 2;
      line(X(g.cx + Math.cos(a1) * r), Y(g.cy + Math.sin(a1) * r),
        X(g.cx + Math.cos(a2) * r), Y(g.cy + Math.sin(a2) * r),
        Math.max(1.6, (0.009 + 0.005 * g.widen) * scale), [250, 244, 220], 0.92);
    }
  }
}
drawCity(P1, false);
drawCity(P2, true);

/* ---- нижняя полоса: точка-легенда §16.6 (силы) ---- */
const pack = buildPedestrians(city, pick);
const crowd = buildCrowd(pack);
for (let i2 = 0; i2 < 20; i2++) stepCrowd(pack, crowd, pedPositions(pack), 0.1, { light: 'green' });
const pos = pedPositions(pack);
const hash = spatialHash(pos);
const base = pos[0];
for (let i2 = 1; i2 < pos.length && i2 < 40; i2++) {
  const sx = 60 + (pos[i2].x - base.x) * 1000 * 1.4, sy = H - 110 + (pos[i2].y - base.y) * 1000 * 1.4;
  if (sx < 30 || sx > W - 430 || sy < H - 150 || sy > H - 8) continue;
  disc(sx, sy, 1.9, [246, 240, 226]);
  for (const n of nearestNeighbors(hash, pos, i2)) {
    const nx = 60 + (n.point.x - base.x) * 1000 * 1.4, ny = H - 110 + (n.point.y - base.y) * 1000 * 1.4;
    if (Math.hypot(nx - sx, ny - sy) < 40) line(sx, sy, nx, ny, 0.6, [150, 200, 190], 0.3);
  }
}
// легенда: цвета новых построек
const legend = [[250, 206, 110], [150, 176, 190], [252, 238, 150], [98, 158, 84], [246, 234, 204]];
legend.forEach((c, k) => { disc(W - 360 + k * 66, H - 22, 5, c); });

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
writeFileSync(new URL('../docs/ai-city.png', import.meta.url),
  Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]));
console.log('ai-city.png · ' + town.name + ': домов ' + st.houses + ', парков ' + st.parks + ', общественных ' + st.civic +
  ', объездная ' + (st.bypass ? 'есть' : 'нет') + ', в лесах ' + st.building);
