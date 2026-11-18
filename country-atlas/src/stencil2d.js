/* §103: берег своей страны — трафарет с карты страны.

   Владелец смотрел на карту мира и говорил: «сделай так, чтобы моя страна была
   как трафарет на карте мира, 1 к 1, но нужными масштабами». То есть берег моей
   страны на карте мира — не выдуманная волнистая линия, а тот самый берег,
   который игрок видит на карте страны: та же кривая, тот же залив, тот же мыс.

   Откуда берег. borders2d.coastline() — изолиния высоты 0 на карте страны,
   главная линия около 10 000 км. Здесь она сглаживается, ресемплится до
   STENCIL.points точек и поворачивается так, чтобы хорда легла на ось X, а суша
   оказалась сверху (y > 0), море — снизу. В таком виде трафарет можно наложить на
   любой берег мира: концы трафарета садятся ровно в две вершины берега, а между
   ними встаёт настоящая береговая линия.

   Про «1 к 1». Масштаб у трафарета один по обеим осям: заливы и мысы не плющатся,
   форма повторяется целиком. Зеркалить берег нельзя — залив стал бы мысом, поэтому
   здесь трафарет только поворачивается и, если нужно, идёт по берегу встречным
   ходом (это тот же берег, а не его отражение).

   Про рельеф. Вместе с берегом переносится и покров: pointToCountry переводит точку
   карты мира в координаты карты страны, и по ней берётся тот же рельеф (горы, лес,
   болото, степь). Поэтому за берегом своей страны на карте мира продолжается её
   собственный рельеф, а за границей страны — обычный мировой. */

import { coastline } from './borders2d.js';
import { heightKm, moistureKm, temperature01 } from './world2d.js';
import { insidePoly } from './planet2d.js';

export const STENCIL = {
  stepKm: 30,        // шаг поля высот: на мире хватает, на карте страны остаётся 20
  points: 120,       // точек в трафарете — примерно по 60 км берега
  smoothPasses: 4,   // сглаживание: сетка высот даёт ступеньки, на мире они видны
  probeKm: 700,      // на сколько отходим от берега, чтобы понять, где суша
  inlandKm: 1100,    // столица стоит на столько км вглубь от своего берега
  minChordKm: 2600,  // короче этого берег мира не берём — трафарет не влезет
  maxChordErr: 0.45  // насколько хорда берега мира может отличаться от трафарета
};

/* Ресемпл по длине дуги: точки встают равномерно, как бы ни была нарисована линия. */
export function arcResample(line, n) {
  if (!line || line.length < 2) return [];
  const acc = [0];
  for (let i = 1; i < line.length; i++) {
    acc.push(acc[i - 1] + Math.hypot(line[i][0] - line[i - 1][0], line[i][1] - line[i - 1][1]));
  }
  const total = acc[acc.length - 1] || 1;
  const out = [];
  let j = 0;
  for (let k = 0; k < n; k++) {
    const want = (k / (n - 1)) * total;
    while (j < acc.length - 2 && acc[j + 1] < want) j++;
    const span = acc[j + 1] - acc[j] || 1;
    const t = Math.max(0, Math.min(1, (want - acc[j]) / span));
    out.push([
      line[j][0] + (line[j + 1][0] - line[j][0]) * t,
      line[j][1] + (line[j + 1][1] - line[j][1]) * t
    ]);
  }
  return out;
}

/* Сглаживание по трём точкам: на сетке 40 км берег идёт ступеньками, на карте мира
   ступеньки читаются как «пила». Форму не меняет — только убирает дрожь. */
export function smoothLine(line, passes = 2) {
  let cur = line.map((p) => [p[0], p[1]]);
  for (let k = 0; k < passes; k++) {
    const next = cur.map((p) => [p[0], p[1]]);
    for (let i = 1; i < cur.length - 1; i++) {
      next[i][0] = (cur[i - 1][0] + cur[i][0] * 2 + cur[i + 1][0]) / 4;
      next[i][1] = (cur[i - 1][1] + cur[i][1] * 2 + cur[i + 1][1]) / 4;
    }
    cur = next;
  }
  return cur;
}

/* Рамка линии: середина хорды и её направление (от первой точки к последней). */
function frameOf(pts) {
  const a = pts[0], b = pts[pts.length - 1];
  let ux = b[0] - a[0], uy = b[1] - a[1];
  const len = Math.hypot(ux, uy) || 1;
  ux /= len; uy /= len;
  return { mid: [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], ux, uy, len };
}

/* Где суша относительно хода вдоль линии: сравниваем высоту слева и справа
   от берега. Плюс — суша слева от хода (то есть со стороны +y трафарета). */
function landSideScore(pts, f) {
  const nx = -f.uy, ny = f.ux;
  let score = 0;
  for (let i = 10; i < pts.length - 10; i += 5) {
    const p = pts[i];
    score += heightKm(p[0] + nx * STENCIL.probeKm, p[1] + ny * STENCIL.probeKm)
      - heightKm(p[0] - nx * STENCIL.probeKm, p[1] - ny * STENCIL.probeKm);
  }
  return score;
}

let shoreCache = null;

/* Трафарет берега своей страны. Считается один раз за сессию. */
export function countryShore() {
  if (shoreCache) return shoreCache;
  const lines = coastline(STENCIL.stepKm) || [];
  let main = null;
  for (const line of lines) if (!main || line.length > main.length) main = line;
  if (!main || main.length < 8) {
    shoreCache = { pts: [], chordKm: 0, sagKm: 0, lengthKm: 0, source: 'none', frame: null };
    return shoreCache;
  }
  let pts = smoothLine(arcResample(main, STENCIL.points), STENCIL.smoothPasses);
  // суша должна быть сверху. Если линия снята так, что суша слева, — идём по ней
  // встречным ходом: это тот же берег, отражением его не портим
  let f = frameOf(pts);
  if (landSideScore(pts, f) < 0) {
    pts = pts.slice().reverse();
    f = frameOf(pts);
  }
  // поворот: хорда ложится на ось X, суша уходит вверх
  const flat = pts.map(([x, y]) => {
    const dx = x - f.mid[0], dy = y - f.mid[1];
    return [dx * f.ux + dy * f.uy, -dx * f.uy + dy * f.ux];
  });
  const chord = flat[flat.length - 1][0] - flat[0][0];
  const cx = (flat[0][0] + flat[flat.length - 1][0]) / 2;
  const norm = flat.map(([x, y]) => [x - cx, y]);
  let length = 0;
  let sag = 0;
  for (let i = 0; i < norm.length; i++) {
    if (i) length += Math.hypot(norm[i][0] - norm[i - 1][0], norm[i][1] - norm[i - 1][1]);
    sag = Math.max(sag, Math.abs(norm[i][1]));
  }
  const land = norm.reduce((a, p) => a + p[1], 0) / norm.length;
  shoreCache = {
    pts: norm,
    chordKm: chord,
    sagKm: sag,
    lengthKm: length,
    landMeanKm: land,               // средний вынос суши: должен быть > 0
    // рамка трафарета: по ней точка карты страны переводится в трафарет и обратно
    frame: { mid: f.mid, ux: f.ux, uy: f.uy, cx },
    // сколько раз берег идёт назад по X: если много, трафарет «завязывается»
    folds: norm.slice(1).filter((p, i) => p[0] < norm[i][0] - 1e-6).length,
    source: 'borders2d'
  };
  return shoreCache;
}

/* Насколько берег мира между A и B отклоняется от прямой: нужно, чтобы трафарет
   сел на ровное место и не полез через другие части берега. */
function chordScore(A, B, path) {
  const dx = B[0] - A[0], dy = B[1] - A[1];
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len, ny = dx / len;
  let dev = 0;
  for (const p of path) dev = Math.max(dev, Math.abs((p[0] - A[0]) * nx + (p[1] - A[1]) * ny));
  return dev;
}

/* Наложить трафарет на берег материка.

   Ищем на берегу такую пару вершин, чтобы хорда между ними была примерно равна
   хорде трафарета (1 к 1 по километрам) и чтобы сам берег между ними был ровным.
   Затем концы трафарета садятся ровно в эти вершины, а всё, что было между ними,
   заменяется настоящим берегом своей страны. Отсюда и «трафарет»: берег материка
   в этом месте становится берегом моей страны.

   Суша трафарета должна лечь внутрь материка. Это решается ходом вдоль берега,
   а не отражением: если внутрь материка смотрит не та сторона, трафарет идёт
   встречным ходом — тот же берег, без зеркала. */
export function graftShore(land, shore, opts = {}) {
  const poly = land.poly;
  const coast = shore && shore.pts && shore.pts.length > 3 ? shore.pts : null;
  if (!coast || poly.length < 8) return null;
  const want = opts.chordKm || shore.chordKm;
  if (!(want > STENCIL.minChordKm)) return null;
  const center = { x: opts.x || 0, y: opts.y || 0 };
  let best = null;
  for (let i = 0; i < poly.length; i++) {
    let run = 0;
    const path = [poly[i]];
    for (let step = 1; step <= 60 && i + step < poly.length; step++) {
      const p = poly[i + step];
      const q = poly[i + step - 1];
      run += Math.hypot(p[0] - q[0], p[1] - q[1]);
      path.push(p);
      const A = poly[i], B = p;
      const chord = Math.hypot(B[0] - A[0], B[1] - A[1]);
      if (chord < want * (1 - STENCIL.maxChordErr)) continue;
      if (chord > want * (1 + STENCIL.maxChordErr)) break;
      if (run < want * 0.9) continue;
      const dev = chordScore(A, B, path);
      const mid = [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2];
      const dist = Math.hypot(mid[0] - center.x, mid[1] - center.y);
      const chordErr = Math.abs(chord - want) / want;
      // ближний к своей стране берег важнее ровного: страна стоит там, где стоит
      const score = chordErr * 3 + dev / want + dist / 60000;
      if (!best || score < best.score) best = { i, j: i + step, A, B, dev, score, chord, mid, dist };
    }
  }
  if (!best) return null;
  const { A, B } = best;
  const chord = best.chord;
  const ux = (B[0] - A[0]) / chord, uy = (B[1] - A[1]) / chord;
  // внутрь материка смотрит левая нормаль хода A→B?
  const nxr = -uy, nyr = ux;
  const mid = best.mid;
  const interiorLeft = insidePoly(mid[0] + nxr * 500, mid[1] + nyr * 500, poly);
  // x̂ трафарета смотрит от A к B (dir = 1) или от B к A (dir = -1)
  const dir = interiorLeft ? 1 : -1;
  const d = [dir * ux, dir * uy];           // куда смотрит ось X трафарета в мире
  const nd = [-d[1], d[0]];                 // куда смотрит его суша (+y)
  const S = dir > 0 ? A : B;                // точка мира под началом трафарета
  const s = chord / (coast[coast.length - 1][0] - coast[0][0]);
  const px0 = coast[0][0];
  const placed = coast.map(([px, py]) => [
    S[0] + s * ((px - px0) * d[0] + py * nd[0]),
    S[1] + s * ((px - px0) * d[1] + py * nd[1])
  ]);
  // в многоугольник трафарет вставляется от A к B: при dir = -1 — встречным ходом
  const insert = dir > 0 ? placed : placed.slice().reverse();
  land.poly = poly.slice(0, best.i + 1).concat(insert, poly.slice(best.j));
  // точка вглубь от середины берега: там стоит своя столица
  const site = { x: mid[0] + (interiorLeft ? nxr : -nxr) * STENCIL.inlandKm, y: mid[1] + (interiorLeft ? nyr : -nyr) * STENCIL.inlandKm };
  // обратный ход: точка карты мира → координаты карты страны. По нему внутри своей
  // страны ставится её собственный рельеф: где на карте страны горы, там и на мире горы.
  const frame = shore.frame;
  const toCountry = (xw, yw) => {
    const dxw = xw - S[0], dyw = yw - S[1];
    const px = (dxw * d[0] + dyw * d[1]) / s + px0;
    const py = (dxw * nd[0] + dyw * nd[1]) / s;
    if (!frame) return [px, py];
    const xs = px + frame.cx;
    return [frame.mid[0] + xs * frame.ux - py * frame.uy, frame.mid[1] + xs * frame.uy + py * frame.ux];
  };
  const fromCountry = (x, y) => {
    if (!frame) return null;
    const dxc = x - frame.mid[0], dyc = y - frame.mid[1];
    const px = (dxc * frame.ux + dyc * frame.uy) - frame.cx;
    const py = dxc * -frame.uy + dyc * frame.ux;
    return [S[0] + s * ((px - px0) * d[0] + py * nd[0]), S[1] + s * ((px - px0) * d[1] + py * nd[1])];
  };
  land.shore = {
    coast: insert,
    chord: dir > 0 ? [A, B] : [B, A],
    chordKm: chord,
    scale: s,
    dir,
    from: best.i,
    to: best.j,
    inland: interiorLeft ? { x: nxr, y: nyr } : { x: -nxr, y: -nyr },
    site,
    toCountry,
    fromCountry
  };
  return land.shore;
}

/* Вид покрова на карте страны — та же классификация, что красит карту страны
   (world2d.colorFor): море, пойма, лес, тайга, камень, снег. Мир называет покров
   своими словами (лес, болото, горы, степь, пустыня, тундра), поэтому здесь перевод. */
export function countryKindAt(x, y) {
  const h = heightKm(x, y);
  if (h < 0) return 'water';
  const t = temperature01(x, y, h);
  const m = moistureKm(x, y);
  if (h > 1150) return 'mountain';
  if (t < 0.30) return 'tundra';
  if (m < 0.30) return 'desert';
  if (m < 0.46) return 'steppe';
  if (m > 0.74) return 'swamp';
  return 'forest';
}
