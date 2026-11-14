/* Мир 7000 × 7000 км в 2D: высота, биом, цвет. Чистый модуль — работает и в воркере, и в тестах.
   Координаты: километры от центра, x — восток, y — север. Море — высота ниже 0.
   `lod` — шаг выборки в километрах: на обзоре мелкий рельеф гасится, чтобы не рябил. */

export const WORLD2D = {
  sizeKm: 7000,
  halfKm: 3500,
  seed: 424242,
  seaLevel: 0,
  maxHeight: 4800
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
   (чек-лист §37). Суша «поднимается» по диагонали SW → NE.
   Крупные формы заданы в масштабе 7000 км, мелкие — в километрах и гаснут на обзоре (lod). */
export function heightKm(x, y, lod = 0) {
  const cont = fbm(x * 0.00038, y * 0.00038, 101, 4);                 // береговая линия, волна ~2600 км
  const grad = (0.55 * x + 0.80 * y) / WORLD2D.halfKm;                // −1.35…+1.35, SW в минус
  let h = 700 * grad + (cont - 0.5) * 1200 + 380;                     // суша северо-востока
  // горная цепь: полоса по диагонали на северо-востоке
  const band = smoothstep(0.02, 0.38, grad) * (1 - smoothstep(0.85, 1.25, grad)) *
    smoothstep(-0.10, 0.55, x / WORLD2D.halfKm);
  const plate = band * (0.30 + 0.70 * smoothstep(0.40, 0.75, fbm(x * 0.00024 + 13, y * 0.00024 - 7, 211, 3)));
  const ridBig = ridgeFbm(x * 0.00045 + 31, y * 0.00045 - 17, 307, 3); // хребты через ~2000 км
  const ridSmall = ridgeFbm(x * 0.0014 + 7, y * 0.0014 + 11, 617, 3);  // отроги через ~700 км
  h += 4200 * ridBig * ridBig * plate + 1500 * ridSmall * ridSmall * plate;   // гребни, не плато
  // средняя складка: 450 км, видна всегда
  h += 160 * (fbm(x * 0.0022, y * 0.0022, 517, 3) - 0.5) * (0.3 + plate);
  // острова в юго-западном море
  if (grad < 0.05) {
    const isl = smoothstep(0.62, 0.86, fbm(x * 0.00075 + 91, y * 0.00075 + 13, 823, 3));
    h += 900 * isl * smoothstep(0.05, -0.5, grad);
  }
  // впадины и внутренние озёра
  h -= 620 * smoothstep(0.55, 0.80, fbm(x * 0.00028 - 3, y * 0.00028 + 5, 409, 2));
  // мелкий рельеф: 50 / 17 / 5 км, гаснет при грубой выборке
  const a50 = 1 - smoothstep(6, 14, lod);
  const a17 = 1 - smoothstep(2, 5, lod);
  const a5 = 1 - smoothstep(0.6, 1.6, lod);
  h += 120 * a50 * (fbm(x * 0.02, y * 0.02, 719, 3) - 0.5) * (0.55 + 0.9 * plate);
  h += 45 * a17 * (fbm(x * 0.06, y * 0.06, 941, 2) - 0.5);
  h += 18 * a5 * (fbm(x * 0.20, y * 0.20, 1103, 2) - 0.5);
  // береговая полка: море плавно уходит на −250 м
  if (h < 0) h *= 0.5;
  return Math.max(-250, Math.min(WORLD2D.maxHeight, h));
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
  const byHeight = 1 - Math.min(1, Math.max(0, h) / 3200) * 0.60;
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
    c = h < -170 ? mix(C.deep, C.sea, (h + 250) / 80) : mix(C.sea, C.shelf, (h + 170) / 170);
    return [c[0] * shade, c[1] * shade, c[2] * shade];
  }
  if (h < 4) {
    c = mix(C.shallow, C.sand, h / 4);
  } else if (h < 1000) {
    // суша: степь → луг → лес по влаге, тайга по холоду; песок только у самой воды
    let green = mix(C.steppe, C.meadow, smoothstep(0.30, 0.46, m));
    green = mix(green, C.forest, smoothstep(0.50, 0.64, m));
    if (t < 0.42) green = mix(green, C.taiga, smoothstep(0.42, 0.18, t) * 0.85);
    c = h < 14 ? mix(C.sand, green, (h - 4) / 10) : green;
    c = mix(c, C.rock, smoothstep(760, 1150, h) * 0.5);
  } else if (h < 2500) {
    // выше леса: зелёный склон долго держится, камень — только у самых гребней
    let high = mix(C.forest, C.taiga, smoothstep(0.55, 0.2, t));
    high = mix(high, C.meadow, smoothstep(0.45, 0.25, m) * 0.3);
    c = mix(high, C.rock, smoothstep(1750, 2500, h) * 0.85);
  } else if (h < 2900) {
    c = mix(C.rock, C.snow, smoothstep(2500, 2900, h) * 0.75);
  } else if (t < 0.3) {
    c = mix(C.snow, C.ice, 0.35);
  } else {
    c = mix(C.rock, C.snow, 0.72 + 0.28 * Math.min(1, (h - 2600) / 800));
  }
  return [c[0] * shade, c[1] * shade, c[2] * shade];
}

export function colorAtKm(x, y) {
  const h = heightKm(x, y);
  return colorFor(h, temperature01(x, y, h), moistureKm(x, y), 1);
}

/* ---------- поселения: детерминированный список на суше ---------- */
/* Имена собираются из морфем §17: два набора (северный и южный) дают 64 уникальных названия. */
const NAME_A = ['Вал', 'Скар', 'Дор', 'Яр', 'Лит', 'Ост', 'Кем', 'Мшар', 'Тихв', 'Заслав', 'Бел',
  'Город', 'Крут', 'Соль', 'Ветл', 'Красн', 'Меж', 'Светл', 'Черн', 'Глух', 'Бор', 'Кам', 'Лес', 'Реч'];
const NAME_B = ['град', 'поль', 'ово', 'ск', 'хейм', 'фьорд', 'яр', 'овка', 'ец', 'ино', 'ань', 'ич'];
/* имя n-го поселения: перестановка 24 × 12 пар морфем, без повторов */
const NAME_SPAN = NAME_A.length * NAME_B.length;
function townName(n) {
  const k = (n * 137) % NAME_SPAN;
  return NAME_A[k % NAME_A.length] + NAME_B[Math.floor(k / NAME_A.length) % NAME_B.length];
}

export const TOWN_COUNT = 120;
export const TOWN_MIN_GAP_KM = 90;

export function settlements(count = TOWN_COUNT) {
  const out = [];
  let seed = 991;
  const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  let guard = 0;
  const edge = WORLD2D.halfKm - 250;
  while (out.length < count && guard++ < 90000) {
    const x = (rnd() * 2 - 1) * edge;
    const y = (rnd() * 2 - 1) * edge;
    const h = heightKm(x, y);
    if (h < 12 || h > 1200) continue;
    if (out.some((s) => Math.hypot(s.x - x, s.y - y) < TOWN_MIN_GAP_KM)) continue;
    out.push({ x, y, h, name: townName(out.length) });
  }
  return out;
}

/* F-108: столица — ближайшее к центру мира поселение, дальше farthest-point до hubCount. */
export function rankSettlements(towns, hubCount = 10) {
  let capital = 0;
  for (let i = 1; i < towns.length; i++) {
    if (Math.hypot(towns[i].x, towns[i].y) < Math.hypot(towns[capital].x, towns[capital].y)) capital = i;
  }
  const hubs = [capital];
  while (hubs.length < Math.min(hubCount, towns.length)) {
    let best = -1, bestD = -1;
    for (let i = 0; i < towns.length; i++) {
      if (hubs.includes(i)) continue;
      let d = Infinity;
      for (const h of hubs) d = Math.min(d, Math.hypot(towns[i].x - towns[h].x, towns[i].y - towns[h].y));
      if (d > bestD) { bestD = d; best = i; }
    }
    if (best === -1) break;
    hubs.push(best);
  }
  return { capital, hubs, hubSet: new Set(hubs) };
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
        shade = 1 + (dzdx * Lx + dzdy * Ly) * 0.007;
        shade = Math.max(0.68, Math.min(1.32, shade));
      }
      const [r, g, b] = colorFor(h, tt[k], mm[k], shade);
      const o = (j * width + i) * 4;
      px[o] = r; px[o + 1] = g; px[o + 2] = b; px[o + 3] = 255;
    }
  }
  return px;
}
