// Генератор растровых спрайтов (PNG) для Frontline: Command.
// Рисуем пиксель-арт программно и сохраняем как обычные PNG-файлы:
// в игре нет ни одной нарисованной кодом фигуры (кроме отладочного оверлея).
// Все полученные файлы — PLACEHOLDER_REPLACE: их можно заменить на CC0-арт.
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

// ---------- минимальный PNG-энкодер ----------
const CRC_TABLE = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();
function crc32(buf) {
  let c = -1;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([len, body, crc]);
}
export function encodePNG(img) {
  const { w, h, px } = img;
  const stride = w * 4 + 1;
  const raw = Buffer.alloc(stride * h);
  for (let y = 0; y < h; y++) {
    raw[y * stride] = 0;
    Buffer.from(px.buffer, y * w * 4, w * 4).copy(raw, y * stride + 1);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

// ---------- холст ----------
const hex = (s) => [parseInt(s.slice(1, 3), 16), parseInt(s.slice(3, 5), 16), parseInt(s.slice(5, 7), 16)];
class Img {
  constructor(w, h) { this.w = w; this.h = h; this.px = new Uint8Array(w * h * 4); }
  set(x, y, c, a = 255) {
    x |= 0; y |= 0;
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return;
    const i = (y * this.w + x) * 4;
    if (a >= 255) { this.px[i] = c[0]; this.px[i + 1] = c[1]; this.px[i + 2] = c[2]; this.px[i + 3] = 255; return; }
    const t = a / 255, ia = this.px[i + 3] / 255;
    this.px[i] = this.px[i] * (1 - t) + c[0] * t;
    this.px[i + 1] = this.px[i + 1] * (1 - t) + c[1] * t;
    this.px[i + 2] = this.px[i + 2] * (1 - t) + c[2] * t;
    this.px[i + 3] = Math.max(this.px[i + 3], 0) || ia * 255;
    this.px[i + 3] = Math.min(255, ia * 255 * (1 - t) + 255 * t);
  }
  rect(x, y, w, h, c, a = 255) { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this.set(x + i, y + j, c, a); }
  circle(cx, cy, r, c, a = 255) {
    for (let y = -r; y <= r; y++) for (let x = -r; x <= r; x++) {
      if (x * x + y * y <= r * r) this.set(cx + x, cy + y, c, a);
    }
  }
  ellipse(cx, cy, rx, ry, c, a = 255) {
    for (let y = -ry; y <= ry; y++) for (let x = -rx; x <= rx; x++) {
      if ((x * x) / (rx * rx) + (y * y) / (ry * ry) <= 1) this.set(cx + x, cy + y, c, a);
    }
  }
  line(x0, y0, x1, y1, c, a = 255) {
    const dx = x1 - x0, dy = y1 - y0;
    const steps = Math.max(Math.abs(dx), Math.abs(dy), 1);
    for (let i = 0; i <= steps; i++) this.set(Math.round(x0 + (dx * i) / steps), Math.round(y0 + (dy * i) / steps), c, a);
  }
  // зашумление для «грязного» военного вида
  noise(seed, amount, dark, light) {
    let s = seed | 0;
    for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++) {
      s = (s * 1664525 + 1013904223) | 0;
      const r = ((s >>> 8) & 0xff) / 255;
      if (r < amount / 2) this.set(x, y, dark, 90);
      else if (r > 1 - amount / 2) this.set(x, y, light, 70);
    }
  }
  outline(c, a = 160) {
    const copy = this.px.slice();
    const alpha = (x, y) => (x < 0 || y < 0 || x >= this.w || y >= this.h ? 0 : copy[(y * this.w + x) * 4 + 3]);
    for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++) {
      if (alpha(x, y) > 0) continue;
      if (alpha(x - 1, y) > 40 || alpha(x + 1, y) > 40 || alpha(x, y - 1) > 40 || alpha(x, y + 1) > 40) this.set(x, y, c, a);
    }
  }
}

// ---------- палитра ----------
const C = {
  outline: hex('#10130f'),
  grass: hex('#4a5b39'), grassLo: hex('#3d4c30'), grassHi: hex('#5b6d44'),
  dirt: hex('#5e5340'), dirtLo: hex('#4a4133'), dirtHi: hex('#6f6349'),
  forest: hex('#2f3d28'), forestHi: hex('#3b4c31'),
  water: hex('#2b4250'), waterHi: hex('#3c5a6b'),
  road: hex('#6b6455'), roadLo: hex('#58513f'),
  city: hex('#5c5a52'), cityLo: hex('#4a4842'),
  mud: hex('#4b4234'), mudLo: hex('#3d362b'),
  steel: hex('#6d7377'), steelLo: hex('#4d5256'), steelHi: hex('#8b9196'),
  rubber: hex('#26292b'), wood: hex('#5a4630'), woodHi: hex('#6d573b'),
  skin: hex('#b08d6b'), helmet: hex('#3f4a35'),
  white: hex('#d7dcd2'), sand: hex('#8a7d5c'),
};
const FACTION = {
  0: { base: hex('#3f5f80'), hi: hex('#5d86ad'), lo: hex('#2b4257'), accent: hex('#4a7fb5') },
  1: { base: hex('#7d4032'), hi: hex('#a75a45'), lo: hex('#54291f'), accent: hex('#b5503a') },
};

const outRoot = path.resolve('assets');
const written = [];
function save(sub, name, img) {
  const dir = path.join(outRoot, sub);
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, `${name}.png`);
  fs.writeFileSync(file, encodePNG(img));
  written.push(path.relative(outRoot, file));
}

// ---------- тайлы ----------
function tileGrass(variant) {
  const img = new Img(32, 32);
  img.rect(0, 0, 32, 32, C.grass);
  img.noise(100 + variant * 7, 0.55, C.grassLo, C.grassHi);
  // редкие кустики
  img.circle(8 + variant * 3, 20 - variant, 2, C.grassLo, 120);
  img.circle(22, 9 + variant * 2, 2, C.grassHi, 90);
  return img;
}
function tileDirt(variant) {
  const img = new Img(32, 32);
  img.rect(0, 0, 32, 32, C.dirt);
  img.noise(200 + variant * 13, 0.6, C.dirtLo, C.dirtHi);
  return img;
}
function tileForest(variant) {
  const img = new Img(32, 32);
  img.rect(0, 0, 32, 32, C.forest);
  img.noise(300 + variant * 3, 0.4, C.dirtLo, C.forestHi);
  for (let i = 0; i < 5; i++) {
    const cx = 5 + ((i * 11 + variant * 4) % 24), cy = 5 + ((i * 7 + variant * 9) % 24);
    img.circle(cx, cy, 4, C.forestHi, 210);
    img.circle(cx - 1, cy - 1, 2, hex('#4d6340'), 170);
  }
  return img;
}
function tileWater(variant) {
  const img = new Img(32, 32);
  img.rect(0, 0, 32, 32, C.water);
  for (let y = 3 + variant; y < 32; y += 7) {
    for (let x = 0; x < 32; x++) img.set(x, y + Math.round(Math.sin((x + variant * 6) / 5) * 1.2), C.waterHi, 120);
  }
  img.noise(400 + variant, 0.25, C.water, C.waterHi);
  return img;
}
function tileRoad(variant) {
  const img = new Img(32, 32);
  img.rect(0, 0, 32, 32, C.road);
  img.noise(500 + variant, 0.5, C.roadLo, C.dirtHi);
  img.rect(0, 14 + variant, 32, 2, C.dirtLo, 90);
  return img;
}
function tileCity(variant) {
  const img = new Img(32, 32);
  img.rect(0, 0, 32, 32, C.city);
  img.noise(600 + variant, 0.45, C.cityLo, hex('#6d6a60'));
  if (variant === 0) { img.rect(4, 6, 9, 7, C.cityLo); img.rect(19, 17, 9, 8, C.cityLo); }
  if (variant === 1) { img.rect(6, 20, 12, 6, C.cityLo); img.rect(21, 4, 6, 10, C.cityLo); }
  return img;
}
function tileMud(variant) {
  const img = new Img(32, 32);
  img.rect(0, 0, 32, 32, C.mud);
  img.noise(700 + variant, 0.6, C.mudLo, C.dirtLo);
  return img;
}

// ---------- юниты ----------
// dir: 0 — восток, 1 — юг, 2 — запад, 3 — север
function soldierBody(img, f, dir, opt = {}) {
  const P = FACTION[f];
  const cx = 16, cy = 17;
  const back = dir === 2 || dir === 3;
  // тень
  img.ellipse(cx, cy + 9, 10, 5, C.outline, 70);
  // ранец (со спины — виден, спереди — нет)
  if (back) { img.rect(cx - 5, cy - 3, 10, 9, P.lo); }
  // плечи/корпус
  img.ellipse(cx, cy, 9, 8, P.base);
  img.ellipse(cx, cy - 1, 7, 5, P.hi, 120);
  // каска
  img.circle(cx, cy - 2, 5, opt.helmet || C.helmet);
  img.circle(cx - 1, cy - 3, 3, C.grassHi, 120);
  // оружие в сторону взгляда
  const arm = { 0: [12, 0], 1: [1, 11], 2: [-12, 0], 3: [-1, -11] }[dir];
  if (opt.weapon !== false) {
    img.line(cx + arm[0] * 0.4, cy + arm[1] * 0.4, cx + arm[0], cy + arm[1], opt.weaponColor || C.rubber);
    img.circle(cx + arm[0], cy + arm[1], 2, C.steelLo);
  }
  // цветной акцент фракции на плече
  const pa = { 0: [4, -4], 1: [-4, 3], 2: [-4, -4], 3: [4, 3] }[dir];
  img.rect(cx + pa[0], cy + pa[1], 3, 3, P.accent);
  return img;
}
function roleSprite(role, f, dir) {
  const img = new Img(32, 32);
  const P = FACTION[f];
  switch (role) {
    case 'mg':
      soldierBody(img, f, dir, { weaponColor: C.steelLo });
      {
        const arm = { 0: [1, 0], 1: [0, 1], 2: [-1, 0], 3: [0, -1] }[dir];
        img.line(16 + arm[0] * 4, 17 + arm[1] * 4, 16 + arm[0] * 11, 17 + arm[1] * 11, C.steel);
        img.rect(16 + arm[0] * 9, 17 + arm[1] * 9, 2, 2, C.rubber);
      }
      break;
    case 'medic':
      soldierBody(img, f, dir, { helmet: hex('#c9cbbd') });
      img.rect(14, 13, 5, 5, C.white);
      img.rect(16, 14, 1, 3, hex('#b23a3a'));
      img.rect(15, 15, 3, 1, hex('#b23a3a'));
      break;
    case 'engineer':
      soldierBody(img, f, dir, { helmet: hex('#8a6d2e') });
      img.rect(11, 20, 10, 4, C.wood);
      img.rect(12, 21, 8, 1, C.woodHi);
      break;
    case 'scout':
      soldierBody(img, f, dir, { helmet: hex('#4a5b39') });
      img.circle(20, 12, 2, C.grassHi, 160);
      break;
    case 'driver':
    case 'tanker':
      soldierBody(img, f, dir, { helmet: hex('#33383a'), weapon: false });
      break;
    case 'infantry':
    default:
      soldierBody(img, f, dir);
      break;
  }
  img.outline(C.outline, 140);
  return img;
}
function vehicleSprite(role, f, dir, size = 64) {
  const img = new Img(size, size);
  const P = FACTION[f];
  const c = size / 2;
  const horizontal = dir === 0 || dir === 2;
  const hullW = role === 'truck' ? (horizontal ? 40 : 22) : (horizontal ? 38 : 30);
  const hullH = role === 'truck' ? (horizontal ? 22 : 40) : (horizontal ? 30 : 38);
  img.ellipse(c, c + 4, hullW / 2 + 3, hullH / 2 + 4, C.outline, 60);
  // гусеницы / колёса
  if (role === 'truck') {
    const wheels = horizontal ? [[-14, -11], [14, -11], [-14, 11], [14, 11]] : [[-11, -14], [11, -14], [-11, 14], [11, 14]];
    for (const w of wheels) { img.rect(c + w[0] - 3, c + w[1] - 3, 6, 6, C.rubber); img.rect(c + w[0] - 2, c + w[1] - 2, 4, 4, C.steelLo); }
  } else {
    if (horizontal) { img.rect(c - hullW / 2 - 4, c - hullH / 2 - 2, hullW + 8, 7, C.rubber); img.rect(c - hullW / 2 - 4, c + hullH / 2 - 5, hullW + 8, 7, C.rubber); }
    else { img.rect(c - hullW / 2 - 2, c - hullH / 2 - 4, 7, hullH + 8, C.rubber); img.rect(c + hullW / 2 - 5, c - hullH / 2 - 4, 7, hullH + 8, C.rubber); }
  }
  // корпус
  img.rect(c - hullW / 2, c - hullH / 2, hullW, hullH, P.base);
  img.rect(c - hullW / 2, c - hullH / 2, hullW, 3, P.hi, 200);
  img.rect(c - hullW / 2, c + hullH / 2 - 3, hullW, 3, P.lo, 200);
  if (role === 'truck') {
    img.rect(c - hullW / 2 + 4, c - hullH / 2 + 5, 10, hullH - 10, P.lo);
    img.rect(c - 2, c - hullH / 2 + 4, hullW - 6, hullH - 8, C.sand);
  } else {
    // башня и ствол
    const turret = 13;
    img.circle(c, c, turret, P.lo);
    img.circle(c, c, turret - 3, P.base);
    img.rect(c - 3, c - 3, 6, 6, P.hi);
    const len = 22;
    const end = { 0: [c + len, c], 1: [c, c + len], 2: [c - len, c], 3: [c, c - len] }[dir];
    img.line(c, c, end[0], end[1], C.steelLo);
    img.line(c, c, end[0], end[1], C.steel, 120);
    img.circle(end[0], end[1], 2, C.steelHi);
  }
  img.outline(C.outline, 130);
  return img;
}
function truckSprite(f, dir) { return vehicleSprite('truck', f, dir, 64); }
function tankSprite(f, dir) { return vehicleSprite('tank', f, dir, 64); }

// ---------- постройки ----------
function buildingSprite(type, f, size) {
  const img = new Img(size, size);
  const c = size / 2;
  const P = f >= 0 ? FACTION[f] : { base: C.sand, hi: C.dirtHi, lo: C.dirtLo, accent: C.sand };
  switch (type) {
    case 'sandbags':
      img.ellipse(c, c, 15, 11, C.outline, 60);
      for (let row = 0; row < 3; row++) {
        for (let i = 0; i < 3; i++) {
          img.ellipse(c - 10 + i * 10 + (row % 2) * 4, c - 7 + row * 7, 6, 4, C.sand);
          img.ellipse(c - 11 + i * 10 + (row % 2) * 4, c - 8 + row * 7, 3, 2, C.dirtHi, 120);
        }
      }
      img.rect(c - 3, c - 9, 5, 4, P.accent);
      break;
    case 'wire':
      img.ellipse(c, c, 15, 12, C.outline, 50);
      for (let i = -12; i <= 12; i += 4) {
        img.line(c + i, c - 11, c + i, c + 11, C.steelLo);
        img.line(c - 12, c + i, c + 12, c + i, C.steelLo, 140);
      }
      for (let i = -10; i <= 12; i += 5) img.line(c - 12, c + i, c + 12, c + i, C.steel, 90);
      break;
    case 'trench':
      img.rect(c - 16, c - 11, 32, 22, C.dirtLo);
      img.rect(c - 14, c - 9, 28, 18, C.mudLo);
      img.rect(c - 14, c - 11, 28, 3, C.dirtHi);
      img.rect(c - 14, c + 9, 28, 3, C.dirtHi);
      img.rect(c - 4, c + 10, 8, 4, P.accent);
      break;
    case 'mg_nest':
      img.ellipse(c, c, 16, 12, C.sand);
      img.ellipse(c, c, 11, 8, C.mudLo);
      img.circle(c, c, 5, C.steelLo);
      img.rect(c + 2, c - 2, 12, 3, C.steel);
      img.rect(c - 6, c + 9, 12, 3, P.accent);
      break;
    case 'bunker':
      img.rect(c - 20, c - 16, 40, 32, C.cityLo);
      img.rect(c - 17, c - 13, 34, 26, C.city);
      img.rect(c - 8, c + 4, 16, 8, C.outline);
      img.rect(c - 22, c + 12, 44, 5, C.dirt);
      img.rect(c - 3, c - 12, 6, 5, P.accent);
      break;
    case 'watchtower':
      img.rect(c - 10, c + 2, 20, 12, C.wood);
      img.line(c - 8, c + 6, c - 3, c - 12, C.wood); img.line(c + 8, c + 6, c + 3, c - 12, C.wood);
      img.rect(c - 12, c - 20, 24, 10, C.woodHi);
      img.rect(c - 12, c - 22, 24, 3, P.accent);
      break;
    case 'depot':
      img.rect(c - 28, c - 20, 56, 40, C.cityLo);
      img.rect(c - 24, c - 16, 48, 32, C.sand);
      for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) img.rect(c - 18 + i * 14, c - 10 + j * 14, 10, 10, C.woodHi);
      img.rect(c - 28, c - 20, 56, 4, P.accent);
      break;
    case 'factory':
      img.rect(c - 30, c - 22, 60, 44, C.cityLo);
      img.rect(c - 26, c - 18, 52, 36, C.city);
      for (let i = 0; i < 4; i++) img.rect(c - 22 + i * 12, c - 14, 8, 28, C.cityLo);
      img.rect(c + 12, c - 30, 10, 12, C.steelLo);
      img.rect(c - 26, c - 22, 52, 4, P.accent);
      break;
    case 'farm':
      img.rect(c - 28, c - 20, 56, 40, C.dirtLo);
      for (let i = 0; i < 5; i++) img.rect(c - 26 + i * 11, c - 18, 5, 36, C.dirtHi, 200);
      img.rect(c - 10, c - 6, 20, 16, C.wood);
      img.rect(c - 10, c - 8, 20, 4, P.accent);
      break;
    case 'hq':
      img.rect(c - 34, c - 26, 68, 52, C.cityLo);
      img.rect(c - 30, c - 22, 60, 44, C.city);
      img.rect(c - 22, c - 14, 44, 28, C.cityLo);
      img.rect(c - 6, c - 30, 12, 8, P.accent);
      img.line(c, c - 30, c, c - 44, C.steel);
      img.rect(c, c - 44, 14, 9, P.accent);
      img.rect(c - 10, c + 12, 20, 6, C.steelLo);
      break;
    case 'city':
      img.rect(c - 40, c - 32, 80, 64, C.cityLo);
      img.rect(c - 36, c - 28, 72, 56, C.city);
      for (let i = 0; i < 6; i++) {
        const bx = c - 30 + (i % 3) * 24, by = c - 22 + Math.floor(i / 3) * 26;
        img.rect(bx, by, 18, 18, C.cityLo);
        img.rect(bx + 2, by + 2, 14, 6, C.woodHi, 120);
      }
      img.rect(c - 40, c - 32, 80, 4, P.accent);
      break;
    case 'bridge':
      img.rect(c - 34, c - 10, 68, 20, C.wood);
      for (let i = -30; i <= 30; i += 10) img.rect(c + i, c - 10, 3, 20, C.woodHi);
      img.rect(c - 34, c - 12, 68, 3, C.steelLo);
      img.rect(c - 34, c + 9, 68, 3, C.steelLo);
      break;
    default:
      img.rect(c - 12, c - 12, 24, 24, C.city);
      break;
  }
  img.outline(C.outline, 120);
  return img;
}

// ---------- эффекты и UI ----------
function muzzleFlash() {
  const img = new Img(16, 16);
  img.circle(8, 8, 3, hex('#ffd27a'));
  img.circle(8, 8, 5, hex('#ffb347'), 120);
  for (let i = 0; i < 4; i++) img.line(8, 8, 8 + Math.cos(i * 1.6) * 7, 8 + Math.sin(i * 1.6) * 7, hex('#fff0c0'), 140);
  return img;
}
function explosion(size = 64) {
  const img = new Img(size, size);
  const c = size / 2;
  img.circle(c, c, size * 0.34, hex('#3a2f24'), 200);
  img.circle(c, c, size * 0.26, hex('#8c5a2b'), 220);
  img.circle(c, c, size * 0.17, hex('#d98c37'), 230);
  img.circle(c, c, size * 0.08, hex('#ffe9b0'), 240);
  return img;
}
function smoke(size = 32) {
  const img = new Img(size, size);
  img.circle(size / 2, size / 2, size * 0.3, hex('#7b7b76'), 90);
  img.circle(size / 2 - 3, size / 2 - 3, size * 0.2, hex('#9a9a94'), 80);
  return img;
}
function decalBlood() {
  const img = new Img(24, 24);
  img.circle(12, 12, 6, hex('#5a1f18'), 120);
  img.circle(9, 14, 3, hex('#6d2620'), 100);
  img.circle(15, 9, 2, hex('#6d2620'), 100);
  return img;
}
function iconText(img, chars, color) {
  // крошечные 3×5 глифы для иконок
  const G = {
    A: ['111', '101', '111', '101', '101'], M: ['101', '111', '111', '101', '101'], '..': [],
  };
  return G[chars] ? G[chars] : null;
}
function icon(kind) {
  const img = new Img(32, 32);
  const P = FACTION[0];
  switch (kind) {
    case 'role_infantry': img.circle(16, 14, 6, C.helmet); img.rect(12, 20, 8, 8, P.base); img.rect(14, 10, 3, 5, C.skin); break;
    case 'role_mg': img.circle(16, 14, 6, C.helmet); img.rect(12, 20, 8, 8, P.base); img.rect(18, 15, 12, 3, C.steel); break;
    case 'role_medic': img.circle(16, 14, 6, hex('#c9cbbd')); img.rect(13, 18, 6, 6, C.white); img.rect(15, 19, 2, 4, hex('#b23a3a')); img.rect(14, 20, 4, 2, hex('#b23a3a')); break;
    case 'role_engineer': img.circle(16, 14, 6, hex('#8a6d2e')); img.rect(8, 20, 16, 5, C.wood); break;
    case 'role_scout': img.circle(16, 16, 7, C.helmet); img.circle(16, 16, 3, C.grassHi); break;
    case 'role_tank': img.rect(4, 12, 24, 12, P.base); img.circle(16, 18, 6, P.lo); img.rect(20, 16, 12, 3, C.steel); break;
    case 'role_truck': img.rect(4, 10, 16, 14, P.base); img.rect(20, 14, 8, 6, C.sand); img.circle(10, 26, 3, C.rubber); img.circle(24, 26, 3, C.rubber); break;
    case 'role_driver': img.circle(16, 14, 6, hex('#33383a')); img.rect(12, 20, 8, 8, P.base); break;
    case 'res_ammo': img.rect(8, 12, 16, 14, C.sand); img.rect(8, 12, 16, 3, P.accent); img.rect(12, 16, 3, 8, C.dirtLo); img.rect(18, 16, 3, 8, C.dirtLo); break;
    case 'res_materials': img.rect(6, 18, 20, 8, C.wood); img.rect(10, 10, 12, 8, C.woodHi); img.rect(6, 18, 20, 2, C.dirtLo); break;
    case 'res_fuel': img.rect(10, 8, 12, 18, C.steelLo); img.rect(12, 12, 8, 10, hex('#c89d3a')); img.rect(22, 12, 4, 4, C.steel); break;
    case 'res_meds': img.rect(8, 8, 16, 16, C.white); img.rect(14, 11, 4, 10, hex('#b23a3a')); img.rect(11, 14, 10, 4, hex('#b23a3a')); break;
    case 'order_move': img.line(6, 26, 24, 8, C.white); img.line(24, 8, 16, 8, C.white); img.line(24, 8, 24, 16, C.white); break;
    case 'order_attack': img.circle(16, 16, 9, hex('#b23a3a'), 90); img.line(16, 5, 16, 27, C.white); img.line(5, 16, 27, 16, C.white); break;
    case 'order_hold': img.rect(8, 18, 16, 6, C.sand); img.rect(14, 10, 4, 8, C.sand); break;
    case 'order_build': img.rect(8, 14, 16, 4, C.wood); img.rect(14, 8, 4, 16, C.woodHi); break;
    case 'order_supply': img.rect(6, 12, 20, 10, C.sand); img.rect(6, 12, 20, 3, P.accent); img.circle(10, 24, 3, C.rubber); img.circle(22, 24, 3, C.rubber); break;
    case 'alert_capture': img.line(16, 4, 26, 22, hex('#d9b45a')); img.line(16, 4, 6, 22, hex('#d9b45a')); img.line(6, 22, 26, 22, hex('#d9b45a')); img.rect(15, 10, 3, 7, C.outline); break;
    case 'pause': img.rect(9, 7, 5, 18, C.white); img.rect(18, 7, 5, 18, C.white); break;
    case 'play': img.line(9, 6, 9, 26, C.white); img.line(9, 6, 25, 16, C.white); img.line(25, 16, 9, 26, C.white); break;
    default: img.circle(16, 16, 8, C.steel); break;
  }
  return img;
}
function logo(size = 128) {
  const img = new Img(size, size);
  img.rect(0, 0, size, size, hex('#1b1f18'));
  img.circle(size / 2, size / 2, size * 0.38, hex('#2b3327'));
  img.circle(size / 2, size / 2, size * 0.3, FACTION[0].base);
  img.rect(size / 2 - 3, size * 0.18, 6, size * 0.5, C.sand);
  img.rect(size * 0.3, size / 2 - 20, size * 0.4, 5, C.sand);
  img.circle(size / 2, size * 0.18, 7, FACTION[1].accent);
  return img;
}

// ---------- сборка ----------
for (let v = 0; v < 3; v++) save('tiles', `grass_${v}`, tileGrass(v));
for (let v = 0; v < 2; v++) save('tiles', `dirt_${v}`, tileDirt(v));
for (let v = 0; v < 3; v++) save('tiles', `forest_${v}`, tileForest(v));
for (let v = 0; v < 2; v++) save('tiles', `water_${v}`, tileWater(v));
for (let v = 0; v < 2; v++) save('tiles', `road_${v}`, tileRoad(v));
for (let v = 0; v < 2; v++) save('tiles', `city_${v}`, tileCity(v));
for (let v = 0; v < 2; v++) save('tiles', `mud_${v}`, tileMud(v));

for (const f of [0, 1]) {
  for (const role of ['infantry', 'mg', 'medic', 'engineer', 'scout', 'driver', 'tanker']) {
    for (let d = 0; d < 4; d++) save('sprites', `${role}_${f}_${d}`, roleSprite(role, f, d));
  }
  for (let d = 0; d < 4; d++) save('sprites', `tank_${f}_${d}`, tankSprite(f, d));
  for (let d = 0; d < 4; d++) save('sprites', `truck_${f}_${d}`, truckSprite(f, d));
}

const builds = {
  sandbags: 64, wire: 64, trench: 64, mg_nest: 64, bunker: 64, watchtower: 64,
  depot: 96, factory: 96, farm: 96, hq: 128, city: 96, bridge: 96,
};
for (const [type, size] of Object.entries(builds)) {
  for (const f of [0, 1, -1]) save('sprites', `${type}_${f < 0 ? 'n' : f}`, buildingSprite(type, f, size));
}

save('fx', 'muzzle', muzzleFlash());
save('fx', 'explosion', explosion(64));
save('fx', 'smoke', smoke(32));
save('fx', 'blood', decalBlood());

for (const k of ['role_infantry', 'role_mg', 'role_medic', 'role_engineer', 'role_scout', 'role_tank', 'role_truck', 'role_driver']) save('ui', k, icon(k));
for (const k of ['res_ammo', 'res_materials', 'res_fuel', 'res_meds']) save('ui', k, icon(k));
for (const k of ['order_move', 'order_attack', 'order_hold', 'order_build', 'order_supply', 'alert_capture', 'pause', 'play']) save('ui', k, icon(k));
save('ui', 'logo', logo(128));

// манифест для SpriteBank (без перебора имён в рантайме)
fs.writeFileSync(path.resolve('assets/manifest.json'), JSON.stringify(written.map((f) => f.replace(/\.png$/, '')), null, 0));

fs.writeFileSync(path.resolve('assets/README.md'), `# Ассеты Frontline: Command

Все PNG в этом каталоге сгенерированы процедурно скриптом \`tools/gen-assets.mjs\`
(растровые, 32×32 юниты, 64×64 техника, 32×32 тайлы). Статус: **PLACEHOLDER_REPLACE** —
замените на CC0/CC-BY пиксель-арт из \`docs/ASSETS_CREDITS.md\` на этапе 9.

Перегенерация: \`node tools/gen-assets.mjs\`.
`);
console.log(`готово: ${written.length} файлов`);
