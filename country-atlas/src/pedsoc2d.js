/* Пешеходы §16.6: социальные силы поверх тротуаров §13. Три ближайших соседа на расчёт
   (пространственный хэш), отталкивание с силой ∝ 1/d², стена как «невидимый сосед»,
   подражание потоку, замедление в толпе. Плюс переход: только по зелёному, на
   нерегулируемом — по «осторожному» правилу (R-16.21–R-16.22).
   Всё детерминировано: сид даёт одну и ту же толпу. */
import { rng, TIME_SCALE } from './transport2d.js';

export const PEDSOC = {
  radiusM: 0.8,        // радиус личного пространства (R-16.21)
  kRep: 0.9,           // сила отталкивания, м/с²
  kWall: 1.8,          // стена: 0.6 м до кромки — уже тесно
  wallM: 0.6,
  maxNeighbors: 3,     // больше трёх соседей не считаем
  follow: 0.35,        // «следование» в потоке
  slowMax: 0.55,       // в плотной толпе скорость падает не больше чем вдвое
  cellKm: 0.005,       // ячейка хэша, 5 м
  crossGapM: 30,       // «осторожное» правило: машина не ближе 30 м
  swapSec: 26          // как часто пешеход вообще хочет перейти улицу
};

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

/* F-199: пространственный хэш 5 × 5 м — соседей ищем в 9 ячейках, а не по всему городу. */
export function spatialHash(points, cellKm = PEDSOC.cellKm) {
  const map = new Map();
  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    const cx = Math.floor(p.x / cellKm), cy = Math.floor(p.y / cellKm);
    const key = cx + ':' + cy;
    let arr = map.get(key);
    if (!arr) { arr = []; map.set(key, arr); }
    arr.push(i);
  }
  return { map, cellKm };
}

/* F-200: до трёх ближайших соседей с расстоянием в метрах (R-16.21: «максимум 3»). */
export function nearestNeighbors(hash, points, index, maxN = PEDSOC.maxNeighbors) {
  const self = points[index];
  const cx = Math.floor(self.x / hash.cellKm), cy = Math.floor(self.y / hash.cellKm);
  const found = [];
  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      const arr = hash.map.get((cx + dx) + ':' + (cy + dy));
      if (!arr) continue;
      for (const j of arr) {
        if (j === index) continue;
        const o = points[j];
        const d = Math.hypot(o.x - self.x, o.y - self.y) * 1000;   // метры
        found.push({ index: j, d, point: o });
      }
    }
  }
  found.sort((a, b) => a.d - b.d);
  return found.slice(0, maxN);
}

/* F-201: сила отталкивания от соседей и от стены. Возвращает вектор (м/с²) и давление
   толпы 0…1 — по нему считается замедление. */
export function socialForce(self, neighbors, wallM = Infinity) {
  let fx = 0, fy = 0, pressure = 0;
  for (const n of neighbors) {
    const dx = self.x - n.point.x, dy = self.y - n.point.y;
    const d = Math.max(0.05, n.d / 1000);                     // км
    const dM = Math.max(0.05, n.d);                            // м
    if (dM >= PEDSOC.radiusM * 4) continue;
    const force = PEDSOC.kRep * Math.pow(PEDSOC.radiusM / dM, 2);
    const len = Math.max(1e-9, Math.hypot(dx, dy));
    fx += (dx / len) * force;
    fy += (dy / len) * force;
    // давление — не только «вплотную»: сосед в 3 м уже заставляет шагнуть в сторону
    pressure = Math.max(pressure, clamp(1 - dM / (PEDSOC.radiusM * 4), 0, 1));
  }
  if (wallM < PEDSOC.wallM * 4) {
    const w = PEDSOC.kWall * clamp(1 - wallM / (PEDSOC.wallM * 4), 0, 1);
    // стена «давит» внутрь тротуара: направление задаёт вызывающий через wallDir
    pressure = Math.max(pressure, clamp(1 - wallM / PEDSOC.wallM, 0, 1));
    fx += w * 0.0; fy += w * 0.0;                              // сила стены — отдельно (wallPush)
  }
  return { fx, fy, pressure };
}

/* F-202: составляющая стены — толкает от кромки тротуара к его середине.
   wallDir — единичный вектор «вглубь тротуара». */
export function wallPush(wallM, wallDir) {
  if (!(wallM < PEDSOC.wallM * 4)) return { fx: 0, fy: 0 };
  const k = PEDSOC.kWall * clamp(1 - wallM / (PEDSOC.wallM * 4), 0, 1);
  return { fx: (wallDir?.x || 0) * k, fy: (wallDir?.y || 0) * k };
}

/* F-203: замедление в толпе: v·(1 − slowMax·давление), но не тише 45 % от своей скорости. */
export function crowdSpeed(speedKmh, pressure) {
  const k = clamp(pressure, 0, 1);
  return speedKmh * (1 - PEDSOC.slowMax * k);
}

/* F-204: «следование» — доля скорости соседа в собственном направлении (0…follow). */
export function followFactor(neighbors, selfSpeedKmh) {
  if (!neighbors.length) return 1;
  let sum = 0;
  for (const n of neighbors) sum += 1 - clamp(n.d / (PEDSOC.radiusM * 6), 0, 1);
  const k = (sum / neighbors.length) * PEDSOC.follow;
  return 1 + k * clamp(selfSpeedKmh / 5, 0, 1);
}

/* F-205: цель пешехода по расписанию (R-16.22): дом → работа → магазин → дом. */
export function goalAt(hour) {
  const h = ((hour % 24) + 24) % 24;
  if (h < 6 || h >= 22) return 'home';
  if (h < 9) return 'work';
  if (h < 12) return 'work';
  if (h < 15) return 'shop';
  if (h < 19) return 'work';
  return 'shop';
}

/* F-206: можно ли переходить (R-16.22). Регулируемый — только зелёный;
   нерегулируемый — «осторожное» правило: ближайшая машина не ближе 30 м. */
export function mayCross(lightState, carGapM = Infinity, regulated = true) {
  if (lightState === 'green') return true;
  if (lightState === 'yellow') return false;
  if (lightState === 'red') return false;
  // нерегулируемый (светофора нет): смотрим на зазор
  return !regulated ? carGapM >= PEDSOC.crossGapM : false;
}

/* Толпа города: у каждого пешехода своя сторона тротуара, желание перейти и ожидание.
   Ничего не двигает само — состояние живёт рядом с пакетом §13. */
export function buildCrowd(pack, seed = 424242) {
  const rand = rng((seed ^ 0x2545f491) + (pack.peds.length * 131));
  const crowd = {
    side: new Float32Array(pack.peds.length),
    shiftKm: new Float32Array(pack.peds.length),   // насколько ушёл к середине тротуара
    nextCross: new Float32Array(pack.peds.length),
    waiting: new Uint8Array(pack.peds.length),
    crosser: new Uint8Array(pack.peds.length),     // переходит улицу не каждый: у большинства цель на той же стороне
    pressure: new Float32Array(pack.peds.length),
    crossed: 0,
    waitingNow: 0
  };
  for (let i = 0; i < pack.peds.length; i++) {
    const p = pack.peds[i];
    crowd.side[i] = Math.sign(p.offsetKm) || 1;
    crowd.nextCross[i] = 60 + rand() * PEDSOC.swapSec * 18;   // первый переход — через 1–9 игровых минут
    crowd.crosser[i] = rand() < 0.2 ? 1 : 0;
  }
  return crowd;
}

/* Шаг толпы: считаем силы, замедление и переход. positions — вывод pedPositions(pack). */
export function stepCrowd(pack, crowd, positions, dtSec, opts = {}) {
  const light = opts.light || 'green';
  const regulated = opts.regulated !== false;
  const sec = Math.max(0, dtSec) * TIME_SCALE;
  if (!positions.length) return crowd;
  const hash = spatialHash(positions);
  let waitingNow = 0;
  for (let i = 0; i < positions.length && i < pack.peds.length; i++) {
    const p = pack.peds[i];
    const pos = positions[i];
    const nb = nearestNeighbors(hash, positions, i);
    const f = socialForce(pos, nb);
    crowd.pressure[i] = f.pressure;

    // переход: раз в ~26 с пешеход хочет перейти; на красный — ждёт у кромки
    crowd.nextCross[i] -= sec;
    if (crowd.nextCross[i] <= 0 && crowd.crosser[i]) {
      const nearCarKm = opts.carGapKm ?? Infinity;
      if (mayCross(light, nearCarKm * 1000, regulated)) {
        crowd.side[i] = -crowd.side[i];
        crowd.crossed++;
        crowd.waiting[i] = 0;
      } else {
        crowd.waiting[i] = 1;
      }
      crowd.nextCross[i] = 240 + ((i * 7) % 300);            // следующий — через 4–9 минут
    } else if (crowd.nextCross[i] <= 0) {
      crowd.nextCross[i] = 300 + ((i * 11) % 240);   // не переходит — идёт дальше по тротуару
    }
    if (crowd.waiting[i]) {
      waitingNow++;
      if (mayCross(light, (opts.carGapKm ?? Infinity) * 1000, regulated)) {
        crowd.side[i] = -crowd.side[i];
        crowd.waiting[i] = 0;
        crowd.crossed++;
      }
    }
    // смещение к середине тротуара от толпы (в км, максимум 0.0004 = 40 см)
    const pressure = f.pressure;
    crowd.shiftKm[i] = Math.min(0.0004, Math.max(0, pressure * 0.0004));
    // «следование» и толпа складываются в коэффициент скорости
    const k = clamp(followFactor(nb, p.speed) * (crowdSpeed(p.speed, pressure) / Math.max(0.1, p.speed)), 0.45, 1.2);
    if (opts.apply !== false) p.speedNow = p.speed * k;
  }
  crowd.waitingNow = waitingNow;
  return crowd;
}

/* Сводка для HUD. */
export function crowdStats(crowd) {
  let waiting = 0, pressed = 0, sum = 0, touched = 0;
  for (let i = 0; i < crowd.pressure.length; i++) {
    if (crowd.waiting[i]) waiting++;
    if (crowd.pressure[i] > 0.02) { sum += crowd.pressure[i]; touched++; }
    if (crowd.pressure[i] > 0.4) pressed++;
  }
  return {
    waiting: crowd.waitingNow || waiting, pressed, touched,
    pressure: touched ? sum / touched : 0, crossed: crowd.crossed
  };
}
