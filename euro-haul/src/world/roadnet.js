// Дорожная сеть Европы: граф городов, поиск маршрута и построение геометрии трассы.
import { CITIES, CITY_BY_ID, COUNTRIES } from '../data/cities.js';
import { CITY_POS, project, SCALE } from './geo.js';
import { haversine } from '../core/math.js';
import { astar, clamp, catmull, delaunay, rng, lerp, smoothstep } from '../core/math.js';

const DETOUR = 1.16; // коэффициент извилистости дорог

let networkCache = null;

/** Строит граф дорог: триангуляция Делоне + связи ближайших соседей. */
export function buildNetwork() {
  if (networkCache) return networkCache;
  const list = [...CITY_POS.values()];
  const pts = list.map((c) => ({ x: c.x, y: c.z }));
  const tris = delaunay(pts);
  const adj = new Map(list.map((c) => [c.id, []]));
  const seen = new Set();

  const addEdge = (a, b, aToB) => {
    if (a === b) return;
    const key = a < b ? a + '|' + b : b + '|' + a;
    if (seen.has(key)) return;
    seen.add(key);
    const A = CITY_POS.get(a);
    const B = CITY_POS.get(b);
    const km = haversine(A.lat, A.lon, B.lat, B.lon) * SCALE * (aToB ? 1 : DETOUR);
    adj.get(a).push({ to: b, cost: km, km });
    adj.get(b).push({ to: a, cost: km, km });
  };

  for (const [i, j, k] of tris) {
    addEdge(list[i].id, list[j].id, false);
    addEdge(list[j].id, list[k].id, false);
    addEdge(list[k].id, list[i].id, false);
  }

  // Ближайшие соседи: гарантируют связность и дополнительные прямые трассы.
  for (const c of list) {
    const near = list
      .filter((o) => o.id !== c.id)
      .map((o) => ({ o, d: Math.hypot(o.x - c.x, o.z - c.z) }))
      .sort((a, b) => a.d - b.d)
      .slice(0, 3);
    for (const { o } of near) addEdge(c.id, o.id, true);
  }

  // Проверка связности и сшивание изолированных компонент.
  const comp = new Map();
  let cid = 0;
  for (const c of list) {
    if (comp.has(c.id)) continue;
    const stack = [c.id];
    comp.set(c.id, cid);
    while (stack.length) {
      const cur = stack.pop();
      for (const e of adj.get(cur)) {
        if (!comp.has(e.to)) {
          comp.set(e.to, cid);
          stack.push(e.to);
        }
      }
    }
    cid++;
  }
  if (cid > 1) {
    for (let c = 1; c < cid; c++) {
      const fromGroup = list.filter((x) => comp.get(x.id) === c);
      const toGroup = list.filter((x) => comp.get(x.id) === 0);
      let best = null;
      for (const a of fromGroup) {
        for (const b of toGroup) {
          const d = Math.hypot(a.x - b.x, a.z - b.z);
          if (!best || d < best.d) best = { a, b, d };
        }
      }
      if (best) addEdge(best.a.id, best.b.id, false);
    }
  }

  networkCache = { adj, list };
  return networkCache;
}

const straight = (a, b) => {
  const A = CITY_POS.get(a);
  const B = CITY_POS.get(b);
  return Math.hypot(A.x - B.x, A.z - B.z);
};

/** Кратчайший путь между городами; возвращает список id городов. */
export function findCityPath(fromId, toId) {
  const { adj } = buildNetwork();
  const nodes = new Map();
  for (const c of CITY_POS.values()) {
    nodes.set(c.id, { edges: adj.get(c.id) || [] });
  }
  const path = astar(nodes, fromId, toId, straight);
  return path || [fromId, toId];
}

const kmCache = new Map();

/** Расстояние маршрута по сети (без геометрии), игровые км. */
export function networkRouteKm(fromId, toId) {
  const key = fromId < toId ? fromId + '|' + toId : toId + '|' + fromId;
  if (kmCache.has(key)) return kmCache.get(key);
  const path = findCityPath(fromId, toId);
  let km = 0;
  for (let i = 1; i < path.length; i++) {
    const a = CITY_POS.get(path[i - 1]);
    const b = CITY_POS.get(path[i]);
    km += haversine(a.lat, a.lon, b.lat, b.lon) * SCALE * DETOUR;
  }
  const result = { km, path };
  kmCache.set(key, result);
  return result;
}

function resample(points, step) {
  const out = [];
  let carry = 0;
  let prev = points[0];
  out.push(prev);
  for (let i = 1; i < points.length; i++) {
    const cur = points[i];
    const dx = cur.x - prev.x;
    const dz = cur.z - prev.z;
    const len = Math.hypot(dx, dz);
    if (len < 1e-6) continue;
    let d = step - carry;
    while (d <= len) {
      const t = d / len;
      out.push({ x: prev.x + dx * t, z: prev.z + dz * t, country: cur.country || prev.country });
      d += step;
    }
    carry = len - (d - step);
    prev = cur;
  }
  const last = points[points.length - 1];
  out.push(last);
  return out;
}

function smoothPolyline(pts, iterations, strength = 0.5) {
  for (let it = 0; it < iterations; it++) {
    const next = pts.map((p) => ({ ...p }));
    for (let i = 1; i < pts.length - 1; i++) {
      next[i].x = lerp(pts[i].x, (pts[i - 1].x + pts[i + 1].x) / 2, strength);
      next[i].z = lerp(pts[i].z, (pts[i - 1].z + pts[i + 1].z) / 2, strength);
    }
    for (let i = 0; i < pts.length; i++) {
      pts[i].x = next[i].x;
      pts[i].z = next[i].z;
    }
  }
  return pts;
}

function elevationAt(s) {
  return (
    6.5 * Math.sin(s / 2100 + 0.7) +
    4.2 * Math.sin(s / 890 + 2.1) +
    2.1 * Math.sin(s / 310 + 4.3) +
    1.1 * Math.sin(s / 97 + 1.2)
  );
}

export const ROAD = {
  laneWidth: 3.7,
  lanes: 2,
  carriageway: 7.4,
  median: 3.2,
  shoulder: 1.4,
  halfRoad: 7.4 + 1.4, // от центра правой проезжей части
  guardRail: 9.4,
  verge: 220,
};

/**
 * Полная геометрия рейса: точки через 12 м, высоты, кривизна и объекты трассы.
 * @param {string[]} cityIds
 * @param {number} seed
 */
export function buildRouteGeometry(cityIds, seed = 1) {
  const rand = rng(seed * 7919 + 13);
  const control = [];
  const marks = [];
  for (let i = 0; i < cityIds.length; i++) {
    const city = CITY_POS.get(cityIds[i]);
    if (!city) continue;
    control.push({ x: city.x, z: city.z, city: city.id });
    if (i < cityIds.length - 1) {
      const b = CITY_POS.get(cityIds[i + 1]);
      const dx = b.x - city.x;
      const dz = b.z - city.z;
      const len = Math.hypot(dx, dz);
      const nx = -dz / len;
      const nz = dx / len;
      const bends = clamp(Math.round(len / 1300), 2, 9);
      for (let k = 1; k <= bends; k++) {
        const t = k / (bends + 1);
        const off = (rand() - 0.5) * Math.min(len * 0.16, 1900) * (0.5 + Math.sin(t * Math.PI) * 0.8);
        control.push({
          x: city.x + dx * t + nx * off,
          z: city.z + dz * t + nz * off,
          country: COUNTRIES[CITY_BY_ID.get(i === 0 ? cityIds[0] : cityIds[i]).country],
        });
      }
    }
  }

  // Catmull-Rom через контрольные точки.
  const raw = [];
  for (let i = 0; i < control.length - 1; i++) {
    const p0 = control[Math.max(0, i - 1)];
    const p1 = control[i];
    const p2 = control[i + 1];
    const p3 = control[Math.min(control.length - 1, i + 2)];
    const segLen = Math.hypot(p2.x - p1.x, p2.z - p1.z);
    const steps = Math.max(6, Math.round(segLen / 90));
    for (let k = 0; k < steps; k++) {
      const t = k / steps;
      raw.push({
        x: catmull(p0.x, p1.x, p2.x, p3.x, t),
        z: catmull(p0.z, p1.z, p2.z, p3.z, t),
        country: p1.city ? CITY_BY_ID.get(p1.city).country : p1.country?.name,
      });
    }
  }
  const lastCity = CITY_POS.get(cityIds[cityIds.length - 1]);
  raw.push({ x: lastCity.x, z: lastCity.z, country: lastCity.country });

  smoothPolyline(raw, 4, 0.5);
  const pts = resample(raw, 12);

  // Кумулятивная длина, курс, высота, кривизна.
  let s = 0;
  const samples = [];
  for (let i = 0; i < pts.length; i++) {
    if (i > 0) s += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].z - pts[i - 1].z);
    const a = pts[Math.max(0, i - 1)];
    const b = pts[Math.min(pts.length - 1, i + 1)];
    const hdg = Math.atan2(b.x - a.x, b.z - a.z);
    samples.push({ x: pts[i].x, z: pts[i].z, y: 0, s, hdg, curv: 0, country: pts[i].country });
  }

  const total = s;
  for (const p of samples) p.y = elevationAt(p.s);

  // Кривизна: изменение курса на метр, сглаженное по окну.
  for (let i = 0; i < samples.length; i++) {
    const a = samples[Math.max(0, i - 3)];
    const b = samples[Math.min(samples.length - 1, i + 3)];
    const ds = b.s - a.s || 1;
    let dh = b.hdg - a.hdg;
    while (dh > Math.PI) dh -= Math.PI * 2;
    while (dh < -Math.PI) dh += Math.PI * 2;
    samples[i].curv = dh / ds;
  }
  for (let it = 0; it < 3; it++) {
    const copy = samples.map((p) => p.curv);
    for (let i = 1; i < samples.length - 1; i++) {
      samples[i].curv = (copy[i - 1] + copy[i] * 2 + copy[i + 1]) / 4;
    }
  }

  // Позиции городов на маршруте.
  for (const id of cityIds) {
    const city = CITY_POS.get(id);
    let bestI = 0;
    let bestD = Infinity;
    for (let i = 0; i < samples.length; i++) {
      const d = (samples[i].x - city.x) ** 2 + (samples[i].z - city.z) ** 2;
      if (d < bestD) {
        bestD = d;
        bestI = i;
      }
    }
    marks.push({
      id,
      name: city.name,
      country: city.country,
      s: samples[bestI].s,
      cityX: city.x,
      cityZ: city.z,
    });
  }
  marks.sort((a, b) => a.s - b.s);

  // Городские зоны (ограничение 50 км/ч).
  const zones = marks.map((m) => ({ s: m.s, from: m.s - 1400, to: m.s + 1400 }));

  // Придорожные объекты: заправки и стоянки.
  const stations = [];
  const rests = [];
  const rand2 = rng(seed * 31337 + 7);
  for (let k = 1; k * 6200 < total - 2200; k++) {
    const pos = k * 6200 + (rand2() - 0.5) * 1800;
    if (pos < 1200 || pos > total - 1200) continue;
    const inCity = zones.some((z) => pos > z.from - 300 && pos < z.to + 300);
    if (inCity) continue;
    const side = 1;
    if (rand2() > 0.28) {
      stations.push({
        s: pos,
        lat: side * 17,
        side,
        brand: ['Aurora Fuel', 'NordOel', 'TransStop', 'Vega Petrol'][Math.floor(rand2() * 4)],
        priceMod: 0.92 + rand2() * 0.2,
        id: 'fuel-' + k,
      });
    } else {
      rests.push({ s: pos, lat: side * 20, side, id: 'rest-' + k, name: 'Зона отдыха' });
    }
  }

  // Дорожные работы — редкие участки с ограничением 30.
  const works = [];
  for (let k = 0; k < Math.max(1, Math.floor(total / 16000)); k++) {
    const pos = 4000 + rand2() * Math.max(1000, total - 8000);
    if (zones.some((z) => pos > z.from - 500 && pos < z.to + 500)) continue;
    works.push({ from: pos, to: pos + 220 });
  }

  const pointAt = (dist) => {
    const d = clamp(dist, 0, total);
    const i = clamp(Math.floor(d / 12), 0, samples.length - 2);
    const t = clamp((d - samples[i].s) / (samples[i + 1].s - samples[i].s || 1), 0, 1);
    const a = samples[i];
    const b = samples[i + 1];
    let dh = b.hdg - a.hdg;
    while (dh > Math.PI) dh -= Math.PI * 2;
    while (dh < -Math.PI) dh += Math.PI * 2;
    return {
      x: lerp(a.x, b.x, t),
      z: lerp(a.z, b.z, t),
      y: lerp(a.y, b.y, t),
      hdg: a.hdg + dh * t,
      curv: lerp(a.curv, b.curv, t),
      country: a.country,
    };
  };

  const route = {
    cityIds,
    samples,
    marks,
    zones,
    stations,
    rests,
    works,
    km: total / 1000,
    length: total,
    pointAt,
    seed,
    from: cityIds[0],
    to: cityIds[cityIds.length - 1],
    name:
      (CITY_BY_ID.get(cityIds[0])?.name || '') +
      ' → ' +
      (CITY_BY_ID.get(cityIds[cityIds.length - 1])?.name || ''),
    worldPos(dist, lat) {
      const p = pointAt(dist);
      const nx = Math.cos(p.hdg);
      const nz = -Math.sin(p.hdg);
      return { x: p.x + nx * lat, y: p.y, z: p.z + nz * lat, hdg: p.hdg, curv: p.curv };
    },
  };
  return route;
}

/** Полный маршрут между городами: путь по сети + геометрия. */
export function buildRoute(fromId, toId, seed = 1) {
  const { path } = networkRouteKm(fromId, toId);
  return buildRouteGeometry(path, seed);
}

export function speedLimitAt(route, s) {
  const zone = route.zones.find((z) => s > z.from && s < z.to);
  if (zone) return 50;
  if (route.works.some((w) => s > w.from - 120 && s < w.to + 60)) return 30;
  return 80;
}

export function cityAtProgress(route, s) {
  let best = null;
  for (const m of route.marks) {
    if (m.s <= s + 20) best = m;
  }
  return best;
}

export { CITY_POS, COUNTRIES, smoothstep };
