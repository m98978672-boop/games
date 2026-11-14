/* Мир 700 × 700 км в 2D: высота, биом, цвет. Чистый модуль — работает и в воркере, и в тестах.
   Координаты: километры от центра, x — восток, y — север. Море — высота ниже 0. */

export const WORLD2D = {
  sizeKm: 700,
  halfKm: 350,
  seed: 424242,
  seaLevel: 0,
  maxHeight: 2900
};

/* ---------- детерминированный шум ---------- */
function hash2(ix, iy, seed) {
  let h = Math.imul(ix | 0, 374761393) ^ Math.imul(iy | 0, 668265263) ^ Math.imul(seed | 0, 1442695041);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

const smooth = (t) => t * t * (3 - 2 * t);

export function noise2(x, y, seed) {
  const ix = Math.floor(x), iy = Math.floor(y);
  const fx = smooth(x - ix), fy = smooth(y - iy);
  const a = hash2(ix, iy, seed), b = hash2(ix + 1, iy, seed);
  const c = hash2(ix, iy + 1, seed), d = hash2(ix + 1, iy + 1, seed);
  return (a * (1 - fx) + b * fx) * (1 - fy) + (c * (1 - fx) + d * fx) * fy;
}

export function fbm(x, y, seed, octaves) {
  let sum = 0, amp = 1, freq = 1, norm = 0;
  for (let o = 0; o < octaves; o++) {
    sum += amp * noise2(x * freq, y * freq, seed + o * 19);
    norm += amp; amp *= 0.5; freq *= 2;
  }
  return sum / norm;
}

export const ridge = (s) => (1 - Math.abs(2 * s - 1)) ** 2;

export function ridgeFbm(x, y, seed, octaves) {
  let sum = 0, amp = 1, freq = 1, norm = 0;
  for (let o = 0; o < octaves; o++) {
    sum += amp * ridge(noise2(x * freq, y * freq, seed + o * 29));
    norm += amp; amp *= 0.5; freq *= 2;
  }
  return sum / norm;
}

const smoothstep = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

/* ---------- высота в метрах ---------- */
/* Карта читается по четвертям: юго-запад — море, северо-восток — горы, север — тайга
   (чек-лист §37). Суша «поднимается» по диагонали SW → NE. */
export function heightKm(x, y) {
  const cont = fbm(x * 0.0038, y * 0.0038, 101, 4);                  // береговая линия
  const grad = (0.55 * x + 0.80 * y) / WORLD2D.halfKm;               // −1.35…+1.35, SW в минус
  let h = 650 * grad + (cont - 0.5) * 700 + 320;                     // суша северо-востока
  // горная цепь: только на северо-востоке, крупные хребты + мелкие отроги
  // хребет идёт полосой по диагонали, а не заливает весь северо-восток
  const band = smoothstep(0.02, 0.38, grad) * (1 - smoothstep(0.85, 1.25, grad)) *
    smoothstep(-0.10, 0.55, x / WORLD2D.halfKm);
  const plate = band * (0.30 + 0.70 * smoothstep(0.40, 0.75, fbm(x * 0.0024 + 13, y * 0.0024 - 7, 211, 3)));
  const ridBig = ridgeFbm(x * 0.0045 + 31, y * 0.0045 - 17, 307, 3);
  const ridSmall = ridgeFbm(x * 0.014 + 7, y * 0.014 + 11, 617, 3);
  h += 1400 * ridBig * plate + 520 * ridSmall * plate;
  // мелкая складка по всей суше, в горах заметнее
  h += 90 * (fbm(x * 0.022, y * 0.022, 517, 3) - 0.5) * (0.3 + plate);
  // рельеф ближнего плана: холмы 8 км и кочки 3 км — чтобы было что рассматривать в зуме;
  // у самой воды он затухает, иначе берег превращается в «рябь»
  const shore = smoothstep(0, 60, h + 30);
  h += 70 * (fbm(x * 0.13, y * 0.13, 719, 3) - 0.5) * (0.55 + 0.9 * plate) * shore;
  h += 22 * (fbm(x * 0.42, y * 0.42, 941, 2) - 0.5) * shore;
  // острова в юго-западном море
  if (grad < 0.05) {
    const isl = smoothstep(0.62, 0.86, fbm(x * 0.0075 + 91, y * 0.0075 + 13, 823, 3));
    h += 520 * isl * smoothstep(0.05, -0.5, grad);
  }
  // впадины и внутренние озёра
  h -= 380 * smoothstep(0.55, 0.80, fbm(x * 0.0028 - 3, y * 0.0028 + 5, 409, 2));
  // береговая полка: море плавно уходит на −180 м
  if (h < 0) h *= 0.5;
  return Math.max(-180, Math.min(WORLD2D.maxHeight, h));
}

/* ---------- влажность и тепло ---------- */
export function moistureKm(x, y) {
  const north = (y + WORLD2D.halfKm) / WORLD2D.sizeKm;      // 0 — юг, 1 — север
  // юго-восток суше: там степь
  const dry = 1 - 0.40 * Math.max(0, x / WORLD2D.halfKm) * Math.max(0, -y / WORLD2D.halfKm);
  const wet = (0.10 + 0.55 * fbm(x * 0.0052 + 77, y * 0.0052 - 41, 733, 3) + 0.45 * north) * dry;
  return Math.max(0, Math.min(1, wet));
}
export function temperature01(x, y, h) {
  const north = (y + WORLD2D.halfKm) / WORLD2D.sizeKm;   // 0 — юг, 1 — север
  const byNorth = 1 - 0.75 * north;                      // север холоднее: тайга
  const byHeight = 1 - Math.min(1, Math.max(0, h) / 2200) * 0.60;
  return Math.max(0, Math.min(1, byNorth * byHeight));
}

/* ---------- цвет точки: возвращает [r, g, b] ---------- */
const C = {
  deep: [26, 62, 99], sea: [44, 104, 138], shelf: [88, 150, 176], shallow: [126, 178, 196],
  sand: [214, 200, 160], steppe: [166, 168, 112], meadow: [122, 148, 88],
  forest: [74, 108, 66], taiga: [58, 88, 64], rock: [139, 134, 122],
  snow: [240, 243, 244], ice: [222, 234, 238]
};

function mix(a, b, t) {
  const k = Math.max(0, Math.min(1, t));
  return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
}

/* Цвет по готовым числам: высота h (м), влага m, тепло t. Отдельно от шума — чтобы
   рендер считал высоты один раз и добавлял светотень. */
export function colorFor(h, t, m, shade = 1) {
  let c;
  if (h < 0) {
    c = h < -120 ? mix(C.deep, C.sea, (h + 180) / 60) : mix(C.sea, C.shelf, (h + 120) / 120);
    return [c[0] * shade, c[1] * shade, c[2] * shade];
  }
  if (h < 4) {
    c = mix(C.shallow, C.sand, h / 4);
  } else if (h < 700) {
    // суша: степь → луг → лес по влаге, тайга по холоду; песок только у самой воды
    let green = mix(C.steppe, C.meadow, smoothstep(0.30, 0.46, m));
    green = mix(green, C.forest, smoothstep(0.50, 0.64, m));
    if (t < 0.42) green = mix(green, C.taiga, smoothstep(0.42, 0.18, t) * 0.85);
    c = h < 14 ? mix(C.sand, green, (h - 4) / 10) : green;
    // камень проступает с высоты
    c = mix(c, C.rock, smoothstep(460, 760, h) * 0.55);
  } else if (h < 1200) {
    c = mix(m > 0.5 ? C.forest : C.rock, C.rock, (h - 700) / 500);
  } else if (h < 1750) {
    c = mix(C.rock, C.snow, smoothstep(1250, 1750, h) * 0.6);
  } else if (t < 0.3) {
    c = mix(C.snow, C.ice, 0.35);
  } else {
    c = mix(C.rock, C.snow, 0.72 + 0.28 * Math.min(1, (h - 1750) / 500));
  }
  return [c[0] * shade, c[1] * shade, c[2] * shade];
}

export function colorAtKm(x, y) {
  const h = heightKm(x, y);
  return colorFor(h, temperature01(x, y, h), moistureKm(x, y), 1);
}

/* ---------- поселения: детерминированный список на суше ---------- */
const TOWN_NAMES = [
  'Валдор', 'Скархейм', 'Дорн', 'Фьорд-Скар', 'Яр-Вал', 'Литваль', 'Остров', 'Кемь', 'Мшара',
  'Тихвин', 'Заславль', 'Белояр', 'Городец', 'Крутояр', 'Соль-Вал', 'Ветлуга', 'Красный Яр', 'Межа'
];

export function settlements(count = 18) {
  const out = [];
  let seed = 991;
  const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  let guard = 0;
  while (out.length < count && guard++ < 5000) {
    const x = (rnd() * 2 - 1) * (WORLD2D.halfKm - 20);
    const y = (rnd() * 2 - 1) * (WORLD2D.halfKm - 20);
    const h = heightKm(x, y);
    if (h < 12 || h > 620) continue;
    if (out.some((s) => Math.hypot(s.x - x, s.y - y) < 45)) continue;
    out.push({ x, y, h, name: TOWN_NAMES[out.length] || ('п.' + out.length) });
  }
  return out;
}

/* ---------- карта в пиксели ---------- */
export function renderRect(x0, y0, sizeKm, width, height, out) {
  return renderBox(x0, y0, sizeKm, sizeKm, width, height, out);
}

/* Прямоугольный кусок мира: ширина и высота в километрах считаются отдельно.
   Высоты считаются сеткой с полем в 1 пиксель, по ним же — светотень (свет с северо-запада). */
export function renderBox(x0, y0, wKm, hKm, width, height, out) {
  const px = out || new Uint8ClampedArray(width * height * 4);
  const dxKm = wKm / width, dyKm = hKm / height;
  const W = width + 2, H = height + 2;
  const hh = new Float32Array(W * H);
  const mm = new Float32Array(W * H);
  const tt = new Float32Array(W * H);

  for (let j = 0; j < H; j++) {
    const y = y0 + hKm / 2 - (j - 0.5) * dyKm;
    for (let i = 0; i < W; i++) {
      const x = x0 - wKm / 2 + (i - 0.5) * dxKm;
      const k = j * W + i;
      const h = heightKm(x, y);
      hh[k] = h;
      mm[k] = moistureKm(x, y);
      tt[k] = temperature01(x, y, h);
    }
  }

  // свет: с северо-запада, уклон в метрах на километр
  const Lx = -0.62, Ly = 0.78;
  for (let j = 0; j < height; j++) {
    for (let i = 0; i < width; i++) {
      const k = (j + 1) * W + (i + 1);
      const h = hh[k];
      let shade = 1;
      if (h > 0) {
        const dzdx = (hh[k + 1] - hh[k - 1]) / (2 * dxKm);
        const dzdy = (hh[k + W] - hh[k - W]) / (2 * dyKm);
        shade = 1 + (dzdx * Lx + dzdy * Ly) * 0.012;
        shade = Math.max(0.55, Math.min(1.45, shade));
      }
      const [r, g, b] = colorFor(h, tt[k], mm[k], shade);
      const o = (j * width + i) * 4;
      px[o] = r; px[o + 1] = g; px[o + 2] = b; px[o + 3] = 255;
    }
  }
  return px;
}
