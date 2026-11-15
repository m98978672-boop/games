/* Плотины и ГЭС §5.9 в 2D: бетонная стена в узком месте, водохранилище выше по течению,
   водосброс с пеной, машинный зал и ЛЭП к ближайшему городу. Сверху всё это — форма и значки,
   но с реальной арифметикой: напор, расход, мощность (F-174) и опоры ЛЭП (F-175). */
import { settlements as allSettlements } from './world2d.js';

export const DAM = {
  count: 3,               // §5.9: 2–3 объекта на карте
  minFlowKm2: 12000,      // меньше — не река для ГЭС
  minGapKm: 180,          // створы не ставятся рядом
  runoffLs: 6,            // слой стока, л/(с·км²) — F-174
  eff: 0.86,              // КПД турбины и генератора
  headM: 26,              // средний напор, м
  reservoirKm: 20,        // длина водохранилища вверх по течению
  widen: 4.2,             // во сколько раз водохранилище шире русла у верховья
  towerStepM: 350,        // шаг опор ЛЭП (F-175)
  wallMinM: 220, wallMaxM: 1200
};

/* F-171: створы. Берём самые полноводные реки и на каждой — точку, ближайшую к городу
   (но не в самом городе: плотину в черте не ставят), с зазором между створами. */
export function damSites(rivers, settlements, count = DAM.count) {
  const towns = settlements || allSettlements();
  const lines = (rivers.lines || rivers).filter((l) => l.flowKm2 >= DAM.minFlowKm2);
  lines.sort((a, b) => b.flowKm2 - a.flowKm2);
  const out = [];
  for (const line of lines) {
    if (out.length >= count) break;
    // сколько километров есть выше точки: водохранилищу нужно место
    const upKm = [0];
    for (let i = 1; i < line.pts.length; i++) {
      upKm[i] = upKm[i - 1] + Math.hypot(line.pts[i].x - line.pts[i - 1].x, line.pts[i].y - line.pts[i - 1].y);
    }
    let best = null;
    for (let i = 0; i < line.pts.length; i++) {
      if (upKm[i] < 8) continue;                                       // водохранилище короче 8 км не строим
      const p = line.pts[i];
      let town = null, dist = Infinity;
      for (const t of towns) {
        const d = Math.hypot(t.x - p.x, t.y - p.y);
        if (d < dist) { dist = d; town = t; }
      }
      if (!town || dist < 8 || dist > 60) continue;                 // ЛЭП длиной 8…60 км
      if (!best || dist < best.distKm) best = { i, distKm: dist, town };
    }
    if (!best) continue;
    const p = line.pts[best.i];
    if (out.some((s) => Math.hypot(s.x - p.x, s.y - p.y) < DAM.minGapKm)) continue;
    out.push({
      x: p.x, y: p.y, index: best.i, river: line.name, order: line.order,
      flowKm2: line.flowKm2, widthM: line.widthM, riverIndex: rivers.lines ? rivers.lines.indexOf(line) : 0,
      city: best.town.name, cityX: best.town.x, cityY: best.town.y, lineKm: best.distKm
    });
  }
  return out;
}

/* F-172: стена. Длина — три ширины русла, но в разумных пределах; толщина растёт с длиной
   (плотина держит больше воды — шире по гребню), гребень на 4 м выше воды. */
export function damWall(widthM) {
  const lengthM = Math.max(DAM.wallMinM, Math.min(DAM.wallMaxM, widthM * 3));
  const thicknessM = 8 + lengthM / 60;
  return { lengthKm: lengthM / 1000, lengthM, thicknessM, crestM: 4 };
}

/* F-173: водохранилище — не круг, а чаша вдоль русла: ось идёт по реке вверх по течению,
   полуширина растёт от стены к верховью (гладко, как чаша), форма повторяет изгибы реки.
   Русло приходит точками через 10 км, поэтому ось выбирается с шагом 0.4 км.
   Рисуется полосами (ribbon), а не одним полигоном: на крутых изгибах берега пересекаются,
   и заливка «кольцом» даёт пустоту. */
export function reservoirAxis(pts, index, lenKm = DAM.reservoirKm, widthM = 200, widen = DAM.widen) {
  const step = 0.4;
  const axis = [];
  let acc = 0, i = index;
  axis.push({ x: pts[index].x, y: pts[index].y, half: widthM / 2000 });
  while (acc < lenKm && i > 0) {
    const a = pts[i], b = pts[i - 1];
    const seg = Math.hypot(b.x - a.x, b.y - a.y) || 1e-6;
    let t = 0;
    while (t < seg && acc < lenKm) {
      const dt = Math.min(step, seg - t);
      t += dt; acc += dt;
      const k = t / seg, u = Math.min(1, acc / lenKm);
      const grow = 1 + (widen - 1) * (u * u * (3 - 2 * u));         // плавная чаша
      axis.push({ x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k, half: (widthM / 1000) * 0.5 * grow });
    }
    i--;
  }
  return axis;
}

/* Кольцо берегов — для проверок площади и для тех, кто хочет один полигон. */
export function reservoirPolygon(pts, index, lenKm = DAM.reservoirKm, widthM = 200, widen = DAM.widen) {
  const axis = reservoirAxis(pts, index, lenKm, widthM, widen);
  if (axis.length < 2) return [];
  const left = [], right = [];
  for (let k = 0; k < axis.length; k++) {
    const p = axis[Math.max(0, k - 1)], q = axis[Math.min(axis.length - 1, k + 1)];
    const dx = q.x - p.x, dy = q.y - p.y;
    const len = Math.hypot(dx, dy) || 1e-6;
    const nx = -dy / len, ny = dx / len;
    left.push({ x: axis[k].x + nx * axis[k].half, y: axis[k].y + ny * axis[k].half });
    right.push({ x: axis[k].x - nx * axis[k].half, y: axis[k].y - ny * axis[k].half });
  }
  return left.concat(right.reverse());
}

/* Площадь водохранилища по полосам: сумма (hA + hB) · L — в км². */
export function reservoirAreaKm2(axis) {
  let area = 0;
  for (let k = 1; k < axis.length; k++) {
    const L = Math.hypot(axis[k].x - axis[k - 1].x, axis[k].y - axis[k - 1].y);
    area += (axis[k].half + axis[k - 1].half) * L;                   // трапеция
  }
  return area;
}

/* F-174: расход и мощность. Сток 6 л/(с·км²) даёт Q, мощность P = ρgQHη. */
export function dischargeM3s(areaKm2) {
  return Math.max(0, areaKm2) * DAM.runoffLs / 1000;
}

export function hydroPowerMW(areaKm2, headM = DAM.headM, eff = DAM.eff) {
  const q = dischargeM3s(areaKm2);
  return (1000 * 9.81 * q * headM * eff) / 1e6;
}

/* F-175: опоры ЛЭП от плотины к городу: шаг 350 м, обе крайние опоры на месте. */
export function powerTowers(from, to, stepM = DAM.towerStepM) {
  const dx = to.x - from.x, dy = to.y - from.y;
  const lenKm = Math.hypot(dx, dy);
  const n = Math.max(2, Math.ceil((lenKm * 1000) / stepM) + 1);
  const towers = [];
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    towers.push({ x: from.x + dx * t, y: from.y + dy * t, t });
  }
  return { towers, lenKm, count: towers.length };
}

/* F-176: пена у водосброса — детерминированные точки по хешу, не «случайные» каждый кадр. */
export function foamDots(site, count = 14, spreadKm = 0.35) {
  const h = (a, b) => {
    let x = Math.imul((site.index + 7) * 2654435761 ^ (a * 40503 + b * 12289), 2246822519);
    x = (x ^ (x >>> 15)) >>> 0;
    return (x % 1000) / 1000;
  };
  const dots = [];
  for (let i = 0; i < count; i++) {
    const along = h(i, 1) * spreadKm;
    const across = (h(i, 2) - 0.5) * spreadKm;
    dots.push({ dx: along, dy: across, r: 0.35 + h(i, 3) * 0.65 });
  }
  return dots;
}

/* Сборка: створы + стена + водохранилище + ЛЭП + пена. */
export function buildDams(water, settlements, count = DAM.count) {
  const t0 = Date.now();
  const rivers = water && water.rivers ? water.rivers : { lines: [] };
  const sites = damSites(rivers, settlements, count);
  const dams = sites.map((site) => {
    // имя реки не уникально (на 5294 русла 156 имён), поэтому берём русло по номеру
    const line = rivers.lines[site.riverIndex] || rivers.lines[0];
    const wall = damWall(site.widthM);
    const axis = reservoirAxis(line.pts, site.index, DAM.reservoirKm, site.widthM);
    const reservoir = reservoirPolygon(line.pts, site.index, DAM.reservoirKm, site.widthM);
    const towers = powerTowers({ x: site.x, y: site.y }, { x: site.cityX, y: site.cityY });
    const powerMW = hydroPowerMW(site.flowKm2);
    return { ...site, wall, reservoir, axis, areaKm2: reservoirAreaKm2(axis), towers, powerMW, foam: foamDots(site), flowKm2: site.flowKm2 };
  });
  const totalMW = dams.reduce((s, d) => s + d.powerMW, 0);
  const towersTotal = dams.reduce((s, d) => s + d.towers.count, 0);
  return { dams, count: dams.length, totalMW: Math.round(totalMW), towersTotal, ms: Date.now() - t0 };
}
