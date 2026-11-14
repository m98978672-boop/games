/* Пешеходы §13 в 2D-карте. Никаких «инстансированных фигур из 4–6 частей» (это 3D,
   §38.2): сверху человек — это точка в 1.6 px с направлением и подшагом ног, который
   виден только в глубоком зуме. Живут на тротуарах улиц города (§9.5) и ходят по игровому
   времени (§44, TIME_SCALE), поэтому картина одинакова у всех и воспроизводима (§16.1). */

import { rng, TIME_SCALE } from './transport2d.js';

/* R-13.1 в 2D: виды пешеходов. Скорость — км/ч по игровому времени. */
export const PED = {
  walker:  { id: 'walker',  name: 'пешеход',      kmh: 4.8,  tone: '#f4eee2', dark: '#6f6a5e' },
  runner:  { id: 'runner',  name: 'бегун',        kmh: 11.0, tone: '#f2f0a8', dark: '#7a7a48' },
  courier: { id: 'courier', name: 'курьер',       kmh: 15.0, tone: '#a8d8f4', dark: '#3f6a86', bike: true },
  dog:     { id: 'dog',     name: 'с собакой',    kmh: 4.2,  tone: '#f4dcb8', dark: '#7b6552', dog: true },
  child:   { id: 'child',   name: 'ребёнок',      kmh: 3.6,  tone: '#f8d2dc', dark: '#85606a' }
};

/* R-13.1: пешеход виден с 40 px/км — раньше он меньше двух пикселей и превращается в шум. */
export const PED_LOD = 40;
/* R-13.1: не больше 400 пешеходов в кадре. */
export const PED_CAP = 400;
/* Ширина тротуара: от кромки проезжей части 6 м (§9.5, тротуар 3 м + газон). */
export const SIDEWALK_M = 6;
/* Фаза шага: 1.9 шага в секунду при 4.8 км/ч — «синус по фазе» из R-13.1. */
export const STRIDE_HZ = 1.9;

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

/* F-151: сколько пешеходов у города. На обзоре города их не больше, чем помещается
   в 400 фигур, поэтому бюджет считается от населения и класса (R-13.1). */
export function pedCount(cls, pop) {
  const base = { capital: 420, city: 280, town: 130, small: 46, village: 10 }[cls] ?? 20;
  const byPop = Math.round(1800 * Math.log10(Math.max(200, pop) / 1000) / 10);
  return clamp(Math.round(base * 0.7 + byPop * 0.3), 6, 520);
}

/* F-152: скорость пешехода, км/ч: вид × детерминированный разброс ±15 %.
   Бегун быстрее пешехода, курьер на велосипеде — быстрее всех (R-13.3). */
export function pedSpeed(kind, index) {
  const spec = PED[kind] || PED.walker;
  const k = ((index * 53) % 13) / 13;            // 0…0.92
  return spec.kmh * (0.85 + 0.3 * k);
}

/* F-153: отступ тротуара от оси улицы, км. Половина проезжей части плюс 6 м тротуара. */
export function sidewalkOffsetKm(widthM) {
  return widthM / 2000 + SIDEWALK_M / 1000;
}

/* F-154: сколько фигур рисуем при данном масштабе: до 400, но не больше, чем в городе. */
export function pedBudget(scale, total) {
  if (!(scale >= PED_LOD)) return 0;
  return Math.min(PED_CAP, total);
}

/* F-155: фаза шага по времени и скорости: 2π·f·v/4.8·t. */
export function stridePhase(kind, speedKmh, seconds) {
  const hz = STRIDE_HZ * (speedKmh / PED.walker.kmh);
  return (2 * Math.PI * hz * seconds) % (2 * Math.PI);
}

/* Длина ломаной в километрах и накопленные длины по точкам. */
function measure(pts) {
  const acc = [0];
  for (let i = 1; i < pts.length; i++) {
    acc.push(acc[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  }
  return { acc, len: acc[acc.length - 1] || 0 };
}

/* F-156: точка на ломаной по пройденному пути t км: {x, y, dx, dy} — позиция и направление.
   Улица замкнута: пешеход дошёл до конца — пошёл обратно (тротуар не обрывается в никуда). */
export function pointAt(pts, acc, t) {
  const len = acc[acc.length - 1] || 0;
  if (len <= 0) return { x: pts[0][0], y: pts[0][1], dx: 1, dy: 0, len };
  let rest = Math.abs(t) % (2 * len);           // туда-обратно
  let back = false;
  if (rest > len) { rest = 2 * len - rest; back = true; }
  let i = 1;
  while (i < acc.length - 1 && acc[i] < rest) i++;
  const a = pts[i - 1], b = pts[i];
  const seg = Math.max(1e-9, acc[i] - acc[i - 1]);
  const u = clamp((rest - acc[i - 1]) / seg, 0, 1);
  const dx = (b[0] - a[0]) / seg, dy = (b[1] - a[1]) / seg;
  return { x: a[0] + (b[0] - a[0]) * u, y: a[1] + (b[1] - a[1]) * u, dx: back ? -dx : dx, dy: back ? -dy : dy, len };
}

/* Сборка пешеходов города: детерминированная, без Math.random (§16.1). */
export function buildPedestrians(city, index, seed = 424242) {
  const rand = rng((seed ^ 0x51ed270b) + index * 7919);
  const streets = city.streets.filter((s) => s.pts && s.pts.length >= 2);
  if (!streets.length) return { peds: [], count: 0, byKind: {} };
  const total = pedCount(city.cls, city.pop);
  const kinds = ['walker', 'walker', 'walker', 'walker', 'runner', 'courier', 'dog', 'child'];
  const peds = [];
  for (let n = 0; n < total; n++) {
    /* Чем ближе к центру, тем люже: улицы берём с весом по major (R-13.2). */
    const streetIdx = rand() < 0.55
      ? Math.floor(rand() * streets.length)
      : Math.floor(rand() * Math.min(streets.length, 24));
    const pick = streets[streetIdx];
    const m = measure(pick.pts);
    if (m.len < 0.05) continue;
    const kind = kinds[Math.floor(rand() * kinds.length)];
    const side = rand() < 0.5 ? -1 : 1;
    peds.push({
      kind,
      streetIdx,
      t: rand() * m.len,
      dir: rand() < 0.5 ? 1 : -1,
      speed: pedSpeed(kind, n),
      offsetKm: sidewalkOffsetKm(pick.widthM) * side,
      phase: rand() * Math.PI * 2,
      tone: PED[kind].tone,
      seed: n
    });
  }
  const byKind = {};
  for (const p of peds) byKind[p.kind] = (byKind[p.kind] || 0) + 1;
  return { peds, count: peds.length, byKind, list: streets, measures: new Map(), streets: streets.length };
}

/* F-119-совместимый шаг: dtSec — реальные секунды, пешеход живёт по игровому времени. */
export function advancePeds(pack, dtSec) {
  const sec = Math.max(0, dtSec) * TIME_SCALE;
  for (const p of pack.peds) {
    const speedKmPerSec = p.speed / 3600;
    p.t += p.dir * speedKmPerSec * sec;
    p.phase = (p.phase + (2 * Math.PI * STRIDE_HZ * (p.speed / PED.walker.kmh)) * sec) % (2 * Math.PI);
  }
}

/* Положение всех пешеходов города, готовое к отрисовке. */
export function pedPositions(pack) {
  const out = [];
  for (const p of pack.peds) {
    let m = pack.measures.get(p.streetIdx);
    if (!m) {
      const st = pack.list[p.streetIdx];
      if (!st) continue;
      m = { ...measure(st.pts), pts: st.pts };
      pack.measures.set(p.streetIdx, m);
    }
    const q = pointAt(m.pts, m.acc, p.t);
    // сдвиг на тротуар: нормаль к направлению
    const nx = -q.dy, ny = q.dx;
    out.push({
      x: q.x + nx * p.offsetKm,
      y: q.y + ny * p.offsetKm,
      dx: q.dx, dy: q.dy,
      kind: p.kind,
      tone: p.tone,
      stride: Math.sin(p.phase),
      bike: !!PED[p.kind].bike,
      dog: !!PED[p.kind].dog
    });
  }
  return out;
}
