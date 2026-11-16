/* §16.8: то, что видно в мире от решений мэра (R-16.28). Жилой квартал — новые дома
   в кольце роста, промзона — склады, парк — зелёное пятно с деревьями и дорожками,
   школа или больница — большое здание с двором, расширение дороги и объездная — дуга
   вокруг города. Пока дом не готов, он стоит в лесах (стройка). Всё детерминировано
   от номера города и счётчика решений, поэтому картина у всех одна. */
import { rng } from './transport2d.js';

export const GROWTH = {
  houseW: 0.014,        // 14 м
  houseD: 0.010,        // 10 м
  ringFrom: 1.01,       // кольцо роста — сразу за кромкой застройки
  ringTo: 1.14,
  gapKm: 0.022,         // зазор между новыми домами
  maxHouses: 48,
  parkM: 0.075,         // парк 75 × 55 м
  industryW: 0.034,
  industryD: 0.02,
  civicW: 0.042,
  civicD: 0.024,
  etaDays: { house: 2, industry: 4, park: 6, civic: 8, bypass: 12, road: 3 },
  maxBypass: 1
};

/* Радиус застройки города: самый дальний угол квартала от центра поселения.
   У buildCity нет поля center, поэтому центром служит сама точка города (§9). */
export function cityRadius(city, town) {
  const cx = town ? town.x : 0, cy = town ? town.y : 0;
  let r = 0;
  for (const bl of city.blocks || []) {
    for (const q of bl.corners) r = Math.max(r, Math.hypot(q[0] - cx, q[1] - cy));
  }
  return r || 0.3;
}

function centerOf(city, town) {
  return [town.x, town.y];
}

export function buildGrowth(town, city, radiusKm = null) {
  return {
    town: town.name, cx: centerOf(city, town)[0], cy: centerOf(city, town)[1],
    radiusKm: radiusKm || cityRadius(city, town),
    houses: [], industry: [], parks: [], civic: [], bypass: null,
    widen: 0, day: 0, decisions: 0, built: 0
  };
}

/* Свободное место в кольце роста: детерминированный угол и радиус, без наложений. */
function place(growth, rand, spanKm) {
  const taken = [...growth.houses, ...growth.industry, ...growth.civic];
  for (let attempt = 0; attempt < 24; attempt++) {
    const ang = rand() * Math.PI * 2;
    const t = GROWTH.ringFrom + rand() * (GROWTH.ringTo - GROWTH.ringFrom);
    const rad = growth.radiusKm * t;
    const x = growth.cx + Math.cos(ang) * rad;
    const y = growth.cy + Math.sin(ang) * rad;
    let free = true;
    for (const s of taken) {
      if (Math.hypot(s.x - x, s.y - y) < spanKm + GROWTH.gapKm) { free = false; break; }
    }
    for (const p of growth.parks) {
      if (Math.hypot(p.x - x, p.y - y) < spanKm + GROWTH.parkM * 0.8) { free = false; break; }
    }
    if (free) return { x, y, ang };
  }
  return null;
}

/* Квадрат вокруг точки, повёрнутый на угол дома. */
function quad(x, y, w, d, ang) {
  const ca = Math.cos(ang), sa = Math.sin(ang);
  return [[-w / 2, -d / 2], [w / 2, -d / 2], [w / 2, d / 2], [-w / 2, d / 2]]
    .map(([u, v]) => [x + u * ca - v * sa, y + u * sa + v * ca]);
}

/* Одно решение мэра → видимые изменения. Возвращает, что именно выросло. */
export function applyGrowth(growth, actionId, decisionNo, day) {
  const rand = rng(0xa51e + growth.houses.length * 7919 + growth.industry.length * 131 + decisionNo * 17);
  growth.day = Math.max(growth.day, day);
  growth.decisions++;
  const out = [];
  const eta = GROWTH.etaDays[actionId] ?? 2;

  if (actionId === 'housing') {
    const n = 2 + Math.floor(rand() * 3);                     // 2–4 дома за решение
    for (let k = 0; k < n && growth.houses.length < GROWTH.maxHouses; k++) {
      const spot = place(growth, rand, GROWTH.houseW);
      if (!spot) break;
      const h = {
        kind: 'house',
        x: spot.x, y: spot.y, ang: spot.ang + (rand() - 0.5) * 0.5,
        corners: quad(spot.x, spot.y, GROWTH.houseW, GROWTH.houseD, spot.ang),
        floors: 2 + Math.floor(rand() * 6), builtDay: day, etaDays: eta,
        tone: ['#d8c8ae', '#e0d4bc', '#cbbca4', '#e6dcc6'][Math.floor(rand() * 4)],
        roof: '#8a6a4e'
      };
      growth.houses.push(h);
      out.push(h);
    }
  } else if (actionId === 'industry') {
    const spot = place(growth, rand, GROWTH.industryW);
    if (spot) {
      const w = { kind: 'industry', x: spot.x, y: spot.y, ang: spot.ang,
        corners: quad(spot.x, spot.y, GROWTH.industryW, GROWTH.industryD, spot.ang),
        builtDay: day, etaDays: eta, tone: '#9aa0a2', roof: '#6c7476' };
      growth.industry.push(w);
      out.push(w);
    }
  } else if (actionId === 'park') {
    const spot = place(growth, rand, GROWTH.parkM);
    if (spot) {
      const trees = [];
      const n = 14 + Math.floor(rand() * 10);
      for (let k = 0; k < n; k++) {
        trees.push({
          x: spot.x + (rand() - 0.5) * GROWTH.parkM * 0.85,
          y: spot.y + (rand() - 0.5) * GROWTH.parkM * 0.6,
          r: 0.0022 + rand() * 0.0016
        });
      }
      const park = {
        kind: 'park',
        x: spot.x, y: spot.y, ang: spot.ang, w: GROWTH.parkM, d: GROWTH.parkM * 0.72,
        corners: quad(spot.x, spot.y, GROWTH.parkM, GROWTH.parkM * 0.72, spot.ang),
        trees, builtDay: day, etaDays: eta,
        paths: [{ x0: spot.x - GROWTH.parkM * 0.4, y0: spot.y, x1: spot.x + GROWTH.parkM * 0.4, y1: spot.y }]
      };
      growth.parks.push(park);
      out.push(park);
    }
  } else if (actionId === 'school' || actionId === 'hospital') {
    const spot = place(growth, rand, GROWTH.civicW);
    if (spot) {
      const w = { kind: 'civic', type: actionId, x: spot.x, y: spot.y, ang: spot.ang,
        corners: quad(spot.x, spot.y, GROWTH.civicW, GROWTH.civicD, spot.ang),
        builtDay: day, etaDays: eta, tone: actionId === 'school' ? '#d9c9a6' : '#e4e0d6',
        roof: actionId === 'school' ? '#7a5a3e' : '#8a8f92' };
      growth.civic.push(w);
      out.push(w);
    }
  } else if (actionId === 'road') {
    growth.widen = Math.min(3, growth.widen + 1);             // полосы шире
    growth.roadDay = day;
    out.push({ kind: 'road', level: growth.widen, builtDay: day, etaDays: eta });
  } else if (actionId === 'bypass' && !growth.bypass) {
    const r = growth.radiusKm * 1.16;
    const a0 = rand() * Math.PI * 2, span = Math.PI * (0.9 + rand() * 0.5);
    const pts = [];
    for (let k = 0; k <= 24; k++) {
      const a = a0 + (span * k) / 24;
      pts.push([growth.cx + Math.cos(a) * r, growth.cy + Math.sin(a) * r]);
    }
    growth.bypass = { kind: 'bypass', pts, radiusKm: r, builtDay: day, etaDays: eta, span };
    out.push(growth.bypass);
  }
  growth.built += out.length;
  return out;
}

/* F-207: готовность стройки 0…1 по игровым дням. */
export function progressAt(item, day) {
  if (!item || !item.etaDays) return 1;
  return Math.max(0, Math.min(1, (day - (item.builtDay || 0)) / item.etaDays));
}

/* Сколько всего построено и сколько ещё в лесах. */
export function growthStats(growth, day = growth.day) {
  // §98: сводка спрашивается каждый кадр, а меняется раз в день — кэшим по состоянию
  const key = day + ':' + growth.houses.length + ':' + growth.industry.length + ':' + growth.parks.length +
    ':' + growth.civic.length + ':' + growth.widen + ':' + (growth.bypass ? 1 : 0) + ':' + growth.decisions;
  if (growth.statsCache && growth.statsCache.key === key) return growth.statsCache.stats;
  const all = [...growth.houses, ...growth.industry, ...growth.parks, ...growth.civic];
  if (growth.bypass) all.push(growth.bypass);
  let done = 0, building = 0, areaKm2 = 0;
  for (const it of all) {
    const p = progressAt(it, day);
    if (p >= 1) done++; else building++;
  }
  for (const h of growth.houses) areaKm2 += GROWTH.houseW * GROWTH.houseD * (h.floors || 1);
  const stats = {
    houses: growth.houses.length, industry: growth.industry.length,
    parks: growth.parks.length, civic: growth.civic.length,
    bypass: !!growth.bypass, widen: growth.widen,
    done, building, areaKm2, decisions: growth.decisions, day: growth.day
  };
  growth.statsCache = { key, stats };
  return stats;
}
