/* Приливы §5.10 в 2D: море дважды в сутки уходит на ±1.2 м, у пологого берега обнажается
   отмель, а в портах вода у причалов то подходит, то уходит. Модель уровня — в ice2d (F-183),
   здесь геометрия: осушка, порты в устьях больших рек и причалы поперёк берега. */
import { heightKm } from './world2d.js';

export const TIDE2D = {
  maxFlatsKm: 0.9,      // насколько далеко уходит вода при самой малой воде
  lowTide: 0.6,         // выше этого уровня осушки нет
  spanM: 1.8,           // 0.6 − (−1.2) = 1.8 м — весь ход прилива
  ports: 4,             // сколько портов на карте
  minGapKm: 380,        // порты не ставятся ближе
  minFlowKm2: 20000,    // порт — только в устье заметной реки
  seaYMax: -1200,       // южное тёплое море (северные воды не портовые)
  pierLenKm: 0.26,      // длина причала в море
  portInlandKm: 0.22,   // набережная стоит на суше у воды
  piers: 3,             // причалов в порту
  quayKm: 0.42,         // длина набережной вдоль берега
  pileStepKm: 0.05      // сваи вдоль причала
};

/* F-184: ширина осушки, км. Полная вода — 0, малая — максимум, между ними линейно. */
export function flatsKm(tide, maxKm = TIDE2D.maxFlatsKm) {
  const k = (TIDE2D.lowTide - tide) / TIDE2D.spanM;
  return Math.max(0, Math.min(1, k)) * maxKm;
}

/* F-185: нормаль к берегу, смотрящая в море (единичная длина). */
export function coastNormalAt(line, i) {
  const a = line[Math.max(0, i - 1)], b = line[Math.min(line.length - 1, i + 1)];
  let tx = b[0] - a[0], ty = b[1] - a[1];
  const len = Math.hypot(tx, ty) || 1;
  tx /= len; ty /= len;
  let nx = -ty, ny = tx;
  // голосование по трём расстояниям: у узких кос и в бухтах одна проба врёт
  let votes = 0;
  for (const r of [0.3, 0.8, 1.6]) if (isSea(line[i][0] + nx * r, line[i][1] + ny * r)) votes++;
  if (votes < 2) { nx = -nx; ny = -ny; }
  return { nx, ny };
}

function isSea(x, y) {
  return heightKm(x, y) < 0;
}

/* F-186: полоса осушки — берег, сдвинутый в море на flatsKm. Это полигон-кольцо:
   вперёд по сдвинутой линии, назад по самому берегу. */
export function tidalBand(line, tide, maxKm = TIDE2D.maxFlatsKm) {
  const km = flatsKm(tide, maxKm);
  if (km <= 0.001 || line.length < 2) return [];
  const out = [], back = [];
  for (let i = 0; i < line.length; i++) {
    const { nx, ny } = coastNormalAt(line, i);
    out.push([line[i][0] + nx * km, line[i][1] + ny * km]);
    back.push([line[i][0], line[i][1]]);
  }
  return out.concat(back.reverse());
}

/* R-64.1: берег приходит точками через 10–25 км — такую линию нельзя выдавливать в море
   одним куском: полоса уходила бы по хорде через бухты. Режем на шаги не длиннее 2 км. */
export function resample(line, stepKm = 1.5) {
  const out = [];
  for (let i = 0; i < line.length; i++) {
    out.push(line[i]);
    if (i === line.length - 1) break;
    const a = line[i], b = line[i + 1];
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const n = Math.max(1, Math.ceil(len / stepKm));
    for (let k = 1; k < n; k++) {
      const t = k / n;
      out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]);
    }
  }
  return out;
}

/* R-64.2: осушка рисуется полосами по сегментам берега, а не одним кольцом: на изгибах
   берега кольцо пересекается само с собой и заливка «прыгает» через сушу. */
export function tidalQuads(line, tide, maxKm = TIDE2D.maxFlatsKm) {
  const km = flatsKm(tide, maxKm);
  if (km <= 0.001 || line.length < 2) return [];
  const dense = resample(line, 1.5);
  const quads = [];
  for (let i = 0; i < dense.length - 1; i++) {
    const n0 = coastNormalAt(dense, i), n1 = coastNormalAt(dense, i + 1);
    const q = [
      [dense[i][0], dense[i][1]],
      [dense[i][0] + n0.nx * km, dense[i][1] + n0.ny * km],
      [dense[i + 1][0] + n1.nx * km, dense[i + 1][1] + n1.ny * km],
      [dense[i + 1][0], dense[i + 1][1]]
    ];
    // полоса идёт только там, где сдвиг действительно уходит в воду
    if (!isSea(q[1][0], q[1][1]) && !isSea(q[2][0], q[2][1])) continue;
    quads.push(q);
  }
  return quads;
}

/* Берег тёплого моря: линии, у которых вода с юга (y < seaYMax). */
export function seaCoastLines(coast, yMax = TIDE2D.seaYMax) {
  return coast.filter((line) => {
    let sum = 0;
    for (const p of line) sum += p[1];
    return sum / line.length < yMax;
  });
}

/* F-187: порты. Береговая точка становится портом, если рядом (≤ 40 км) впадает большая река:
   имя берём от реки и ближайшего города. Порты не ставятся ближе minGapKm друг к другу,
   а набережная должна стоять на суше — иначе это коса в воде, а не порт. */
export function findPorts(water, coast, towns, opts = {}) {
  const limit = opts.ports || TIDE2D.ports;
  const gap = opts.minGapKm || TIDE2D.minGapKm;
  const maxRiverKm = opts.maxRiverKm || 40;
  const lines = (water && water.rivers && water.rivers.lines) || [];
  const shore = seaCoastLines(coast || []);
  const mouths = lines
    .filter((l) => l.flowKm2 >= (opts.minFlowKm2 || TIDE2D.minFlowKm2) && l.mouth.y < TIDE2D.seaYMax)
    .map((l) => ({ line: l, x: l.mouth.x, y: l.mouth.y, flowKm2: l.flowKm2 }));
  if (!mouths.length) return [];

  const cand = [];
  for (const line of shore) {
    for (let i = 0; i < line.length; i++) {
      let best = null;
      for (const m of mouths) {
        const d = Math.hypot(m.x - line[i][0], m.y - line[i][1]);
        if (!best || d < best.d) best = { d, m };
      }
      if (best && best.d <= maxRiverKm) cand.push({ p: line[i], line, i, d: best.d, mouth: best.m });
    }
  }
  cand.sort((a, b) => a.d - b.d);

  const ports = [];
  for (const c of cand) {
    if (ports.length >= limit) break;
    if (ports.some((p) => Math.hypot(p.x - c.p[0], p.y - c.p[1]) < gap)) continue;
    let { nx, ny } = coastNormalAt(c.line, c.i);
    // причал должен уходить в воду; если нет — разворачиваем нормаль
    if (!isSea(c.p[0] + nx * TIDE2D.pierLenKm, c.p[1] + ny * TIDE2D.pierLenKm)) {
      if (isSea(c.p[0] - nx * TIDE2D.pierLenKm, c.p[1] - ny * TIDE2D.pierLenKm)) { nx = -nx; ny = -ny; }
      else continue;
    }
    // набережная — на суше у воды: идём вглубь берега, пока не выйдем из воды
    let px = null, py = null;
    for (const d of [0.05, 0.12, 0.22, 0.35, 0.5, 0.7, 1.0]) {
      const x2 = c.p[0] - nx * d, y2 = c.p[1] - ny * d;
      if (heightKm(x2, y2) >= 0) { px = x2; py = y2; break; }
    }
    if (px === null) continue;

    let town = null, townDist = Infinity;
    for (const t of towns || []) {
      const d = Math.hypot(t.x - px, t.y - py);
      if (d < townDist) { townDist = d; town = t; }
    }
    const riverName = c.mouth.line.name;
    ports.push({
      name: town && townDist <= 120 ? town.name + ' · ' + riverName : riverName,
      river: riverName, riverIndex: lines.indexOf(c.mouth.line),
      x: px, y: py, nx, ny,
      mouthX: c.mouth.x, mouthY: c.mouth.y, mouthKm: Math.round(c.d),
      flowKm2: c.mouth.flowKm2, widthM: c.mouth.line.widthM,
      town: town ? town.name : null, townDistKm: Math.round(townDist)
    });
  }
  return ports;
}

/* F-188: причалы. Набережная вдоль берега и `piers` причалов поперёк, в море. */
export function pierLines(port, opts = {}) {
  const len = opts.pierLenKm || TIDE2D.pierLenKm;
  const n = opts.piers || TIDE2D.piers;
  const half = (TIDE2D.quayKm / 2) * 1000;
  const tx = -port.ny, ty = port.nx;                       // вдоль берега
  const quay = [
    [port.x - (tx * half) / 1000, port.y - (ty * half) / 1000],
    [port.x + (tx * half) / 1000, port.y + (ty * half) / 1000]
  ];
  const piers = [];
  for (let k = 0; k < n; k++) {
    const t = n === 1 ? 0.5 : k / (n - 1);
    const bx = quay[0][0] + (quay[1][0] - quay[0][0]) * t;
    const by = quay[0][1] + (quay[1][1] - quay[0][1]) * t;
    // причал уходит в море чуть под углом: порты не строят строго по нормали
    const skew = (k - (n - 1) / 2) * 0.18;
    const dx = port.nx + tx * skew, dy = port.ny + ty * skew;
    const dl = Math.hypot(dx, dy) || 1;
    piers.push({
      root: [bx, by],
      tip: [bx + (dx / dl) * len, by + (dy / dl) * len],
      piles: Math.max(2, Math.round(len / TIDE2D.pileStepKm))
    });
  }
  return { quay, piers, lengthKm: len };
}

/* Сборка: порты и их причалы — один раз, дальше только перерисовка уровня воды. */
export function buildTides(water, borders, towns, opts = {}) {
  const t0 = Date.now();
  const coast = (borders && borders.coast) || [];
  const shore = seaCoastLines(coast, opts.seaYMax || TIDE2D.seaYMax);
  const ports = findPorts(water, coast, towns, opts);
  const withPiers = ports.map((p) => {
    const g = pierLines(p, opts);
    // причал обязан дойти до воды: на пологом берегу удлиняем его, но не больше чем вдвое
    g.piers = g.piers.map((pier) => {
      const dx = pier.tip[0] - pier.root[0], dy = pier.tip[1] - pier.root[1];
      for (let k = 1; k <= 2.4; k += 0.2) {
        const tx = pier.root[0] + dx * k, ty = pier.root[1] + dy * k;
        if (isSea(tx, ty)) return { ...pier, tip: [tx, ty], lengthKm: Math.hypot(tx - pier.root[0], ty - pier.root[1]) };
      }
      return pier;
    });
    return { ...p, ...g };
  });
  const shoreKm = shore.reduce((sum, l) => {
    let s = 0;
    for (let i = 1; i < l.length; i++) s += Math.hypot(l[i][0] - l[i - 1][0], l[i][1] - l[i - 1][1]);
    return sum + s;
  }, 0);
  return { ports: withPiers, shoreLines: shore, shoreKm: Math.round(shoreKm), ms: Date.now() - t0 };
}
