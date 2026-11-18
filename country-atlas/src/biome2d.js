/* §99: где на карте лес, где болото, где горы и где технике тяжело.

   Владелец: «на карте не понятны хорошо где границы областей, где дороги, где болота,
   где технике плохо, где леса и так далее».

   До этого на карте были только редкие значки рельефа (около 720 на всю планету) —
   по ним нельзя было понять, где кончается лес и начинается болото. Теперь у мира есть
   *покров*: клетчатая карта земли, где у каждой клетки свой вид (лес, болото, горы,
   степь, пустыня, тундра) и своя проходимость для техники — 1 сухо и ровно,
   0,25 болото, куда машина не пройдёт.

   Модуль не знает ни канвы, ни камеры: только числа, клетки и детерминированный сид. */

import { hash01 } from './accidents2d.js';

export const BIOMES = {
  cellKm: 100,               // сторона клетки покрова, км (400 × 400 клеток на карту)
  // проходимость: доля скорости техники вне дорог
  base: 0.85,
  kinds: {
    forest: { name: 'лес', pass: 0.55, tint: 'rgba(44,92,50,0.66)' },
    swamp: { name: 'болото', pass: 0.25, tint: 'rgba(36,74,72,0.78)' },
    mountain: { name: 'горы', pass: 0.30, tint: 'rgba(146,138,122,0.66)' },
    steppe: { name: 'степь', pass: 0.90, tint: 'rgba(194,176,104,0.44)' },
    desert: { name: 'пустыня', pass: 0.70, tint: 'rgba(216,188,124,0.62)' },
    tundra: { name: 'тундра', pass: 0.50, tint: 'rgba(156,172,172,0.52)' }
  },
  // ниже bad — технике плохо (болота, горы); ниже slow — медленно (лес, тундра, пустыня)
  bad: 0.4,
  slow: 0.7
};

export const BIOME_ORDER = ['forest', 'swamp', 'mountain', 'steppe', 'desert', 'tundra'];
const CODE = { water: 0, forest: 1, swamp: 2, mountain: 3, steppe: 4, desert: 5, tundra: 6 };

/* Гладкий шум: значение в узлах решётки интерполируется, поэтому покров идёт
   пятнами, а не белым шумом по клеткам. */
function smoothNoise(seed, x, y, cellKm, stepKm) {
  const gx = x / stepKm, gy = y / stepKm;
  const ix = Math.floor(gx), iy = Math.floor(gy);
  const fx = gx - ix, fy = gy - iy;
  const sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
  const at = (a, b) => hash01(seed + a * 73856093 + b * 19349663, 907);
  const n00 = at(ix, iy), n10 = at(ix + 1, iy), n01 = at(ix, iy + 1), n11 = at(ix + 1, iy + 1);
  const top = n00 + (n10 - n00) * sx, bot = n01 + (n11 - n01) * sx;
  void cellKm;
  return top + (bot - top) * sy;
}

/* Вид покрова в точке мира: климат по широте плюс два слоя шума — «сырость» и «высота». */
export function kindAt(x, y, seed = 424242, halfKm = 20000) {
  const cold = Math.min(1, Math.abs(y) / (halfKm * 0.82));
  const wet = smoothNoise(seed + 11, x, y, BIOMES.cellKm, 1500) * 0.65
    + smoothNoise(seed + 29, x, y, BIOMES.cellKm, 520) * 0.35;
  const high = smoothNoise(seed + 47, x, y, BIOMES.cellKm, 900);
  if (cold > 0.72) return high > 0.70 ? 'mountain' : 'tundra';
  if (high > 0.83) return 'mountain';
  if (cold < 0.2) {
    if (wet < 0.36) return 'desert';
    if (wet > 0.74) return 'swamp';
    return wet < 0.6 ? 'steppe' : 'forest';
  }
  if (wet < 0.28) return 'desert';
  if (wet < 0.44) return 'steppe';
  if (wet > 0.74) return 'swamp';
  return 'forest';
}

/* Клетчатая карта покрова. code — плотный массив: 0 вода, 1…6 виды покрова.
   Считается один раз на мир, поэтому карта рисуется без задержек. */
export function buildBiomes(lands, seed = 424242, sizeKm = 40000) {
  const cellKm = BIOMES.cellKm;
  const n = Math.ceil(sizeKm / cellKm);
  const half = sizeKm / 2;
  const code = new Uint8Array(n * n);
  // §99: суша растеризуется построчно — проверять каждую из 81 700 клеток полигоном
  // было 450 мс, а построчная заливка по рёбрам укладывается в единицы миллисекунд
  for (const land of (lands || [])) {
    const poly = land.poly;
    for (let j = 0; j < n; j++) {
      const y = -half + (j + 0.5) * cellKm;
      const xs = [];
      for (let i = 0, k = poly.length - 1; i < poly.length; k = i++) {
        const yi = poly[i][1], yk = poly[k][1];
        if ((yi > y) === (yk > y)) continue;
        const t = (y - yi) / (yk - yi || 1e-12);
        xs.push(poly[i][0] + (poly[k][0] - poly[i][0]) * t);
      }
      if (xs.length < 2) continue;
      xs.sort((a, b) => a - b);
      for (let q = 0; q + 1 < xs.length; q += 2) {
        const i0 = Math.max(0, Math.ceil((xs[q] + half) / cellKm - 0.5));
        const i1 = Math.min(n - 1, Math.floor((xs[q + 1] + half) / cellKm - 0.5));
        for (let i = i0; i <= i1; i++) {
          const x = -half + (i + 0.5) * cellKm;
          code[j * n + i] = CODE[kindAt(x, y, seed, half)];
        }
      }
    }
    // §99: береговая клетка, через которую проходит граница материка, — тоже суша.
    // Иначе город у самого берега оказывался «в воде»: его клетка центром попадала
    // в море, и техника не могла войти в прибрежный город.
    const mark = (x, y) => {
      const i = Math.floor((x + half) / cellKm);
      const j = Math.floor((y + half) / cellKm);
      if (i < 0 || j < 0 || i >= n || j >= n) return;
      const at = j * n + i;
      if (code[at]) return;
      code[at] = CODE[kindAt(-half + (i + 0.5) * cellKm, -half + (j + 0.5) * cellKm, seed, half)];
    };
    for (let k = 0, i = poly.length - 1; k < poly.length; i = k++) {
      const x0 = poly[i][0], y0 = poly[i][1], x1 = poly[k][0], y1 = poly[k][1];
      const len = Math.hypot(x1 - x0, y1 - y0);
      const steps = Math.max(1, Math.ceil(len / (cellKm * 0.5)));
      for (let q = 0; q <= steps; q++) {
        mark(x0 + (x1 - x0) * (q / steps), y0 + (y1 - y0) * (q / steps));
      }
    }
  }
  return { size: n, cellKm, sizeKm, code, land: null };
}

/* Код покрова в точке мира — по клетке, в которую попала точка. */
export function codeAt(biomes, x, y) {
  if (!biomes) return 0;
  const half = biomes.sizeKm / 2;
  const i = Math.floor((x + half) / biomes.cellKm);
  const j = Math.floor((y + half) / biomes.cellKm);
  if (i < 0 || j < 0 || i >= biomes.size || j >= biomes.size) return 0;
  return biomes.code[j * biomes.size + i];
}

const KIND_BY_CODE = ['water', ...BIOME_ORDER];

/* Вид покрова под точкой — «лес», «болото», «горы»… или null на воде. */
export function biomeAt(biomes, x, y) {
  const c = codeAt(biomes, x, y);
  if (!c) return null;
  const kind = KIND_BY_CODE[c];
  return { kind, name: BIOMES.kinds[kind].name, pass: BIOMES.kinds[kind].pass };
}

/* Проходимость для техники: 1 — ровно и сухо, 0,25 — болото, 0 — вода. */
export function passabilityAt(biomes, x, y) {
  const b = biomeAt(biomes, x, y);
  return b ? b.pass : 0;
}

/* Сколько клеток занимает каждый покров и сколько их тяжело для техники. */
export function biomeStats(biomes) {
  const counts = { forest: 0, swamp: 0, mountain: 0, steppe: 0, desert: 0, tundra: 0 };
  let land = 0, bad = 0, slow = 0;
  const code = biomes ? biomes.code : [];
  for (let k = 0; k < code.length; k++) {
    const c = code[k];
    if (!c) continue;
    const kind = KIND_BY_CODE[c];
    counts[kind]++;
    land++;
    const pass = BIOMES.kinds[kind].pass;
    if (pass < BIOMES.bad) bad++;
    else if (pass < BIOMES.slow) slow++;
  }
  return {
    land,
    total: code.length,
    kinds: BIOME_ORDER.map((id) => ({ id, name: BIOMES.kinds[id].name, cells: counts[id], pass: BIOMES.kinds[id].pass })),
    bad,
    slow,
    badShare: land ? bad / land : 0,
    slowShare: land ? slow / land : 0,
    landShare: code.length ? land / code.length : 0
  };
}

function inPoly(x, y, poly) {
  if (!poly || poly.length < 3) return false;
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i][0], yi = poly[i][1], xj = poly[j][0], yj = poly[j][1];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi + 1e-12) + xi) inside = !inside;
  }
  return inside;
}
