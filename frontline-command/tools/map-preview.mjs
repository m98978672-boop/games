// Превью карты: собирает PNG из тайлов и точек, чтобы глазами проверить генерацию мира.
import fs from 'node:fs';
import zlib from 'node:zlib';
import { loadConfig } from '../src/core/config.js';
import { World } from '../src/sim/world.js';

const CRC = (() => { const t = new Int32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c; } return t; })();
const crc32 = (b) => { let c = -1; for (let i = 0; i < b.length; i++) c = CRC[(c ^ b[i]) & 0xff] ^ (c >>> 8); return (c ^ -1) >>> 0; };
const chunk = (t, d) => { const l = Buffer.alloc(4); l.writeUInt32BE(d.length, 0); const body = Buffer.concat([Buffer.from(t, 'ascii'), d]); const c = Buffer.alloc(4); c.writeUInt32BE(crc32(body), 0); return Buffer.concat([l, body, c]); };
function png(w, h, px) {
  const raw = Buffer.alloc((w * 4 + 1) * h);
  for (let y = 0; y < h; y++) { raw[y * (w * 4 + 1)] = 0; px.copy(raw, y * (w * 4 + 1) + 1, y * w * 4, (y + 1) * w * 4); }
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 6;
  return Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
}
const cfg = await loadConfig();
const world = new World(cfg, 7);
const SCALE = 4; // 4096 -> 1024
const W = world.W / SCALE, H = world.H / SCALE;
const px = Buffer.alloc(W * H * 4);
const COL = {
  0: [74, 91, 57], 1: [94, 83, 64], 2: [47, 61, 40], 3: [43, 66, 80], 4: [107, 100, 85], 5: [92, 90, 82],
};
const put = (x, y, c) => {
  if (x < 0 || y < 0 || x >= W || y >= H) return;
  const i = (y * W + x) * 4;
  px[i] = c[0]; px[i + 1] = c[1]; px[i + 2] = c[2]; px[i + 3] = 255;
};
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
  const wx = x * SCALE, wy = y * SCALE;
  const idx = world._idx(wx, wy);
  let c = COL[world.terrain[idx]] || COL[0];
  const n = ((wx * 13 + wy * 7) % 11) / 11 - 0.5;
  c = c.map((v) => Math.max(0, Math.min(255, v + n * 14)));
  put(x, y, c);
}
// точки и структуры
for (const p of world.points) {
  const c = p.owner === 0 ? [110, 170, 235] : p.owner === 1 ? [225, 120, 95] : [220, 220, 200];
  const cx = Math.floor(p.x / SCALE), cy = Math.floor(p.y / SCALE);
  const r = p.type === 'hq' ? 9 : p.type === 'city' ? 7 : 4;
  for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) if (dx * dx + dy * dy <= r * r) put(cx + dx, cy + dy, c);
  // флаг
  for (let dy = -r - 8; dy < -r; dy++) put(cx, cy + dy, [232, 180, 90]);
  for (let dx = 0; dx < 6; dx++) put(cx + dx, cy - r - 8, c);
}
fs.mkdirSync('docs', { recursive: true });
fs.writeFileSync('docs/map-preview.png', png(W, H, px));
console.log('docs/map-preview.png', W + 'x' + H, 'точек:', world.points.length, 'секторов:', world.sectors.length);
