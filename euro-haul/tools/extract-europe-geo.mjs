// Генерация src/data/europe-geo.json из Natural Earth 1:50m (пакет world-atlas).
//
//   cd /tmp && npm i world-atlas topojson-client
//   node tools/extract-europe-geo.mjs <путь к node_modules с world-atlas>
//
// Что делает: берёт границы стран, оставляет кольца, пересекающие окно Европы,
// режет их по антимеридиану, упрощает Дугласом–Пекером (0.03°), отдельно
// собирает ВНУТРЕННИЕ границы стран (topojson.mesh) — они рисуются тонкими
// линиями на карте. Результат: { bbox, land, holes, borders }.
import fs from 'node:fs';
const NM = process.argv[2] || '/tmp/geodata/node_modules';
const topo = JSON.parse(fs.readFileSync(NM + '/world-atlas/countries-50m.json', 'utf8'));
const { feature, mesh } = await import(NM + '/topojson-client/dist/topojson-client.js');
const fc = feature(topo, topo.objects.countries);
const BOX = { lon0: -14, lon1: 36, lat0: 33, lat1: 73 };
const inBox = (lon, lat) => lon > BOX.lon0 && lon < BOX.lon1 && lat > BOX.lat0 && lat < BOX.lat1;

function rdp(points, tol) {
  if (points.length < 3) return points.slice();
  const keep = new Uint8Array(points.length);
  keep[0] = keep[points.length - 1] = 1;
  const stack = [[0, points.length - 1]];
  while (stack.length) {
    const [a, b] = stack.pop();
    const [ax, ay] = points[a];
    const [bx, by] = points[b];
    const dx = bx - ax;
    const dy = by - ay;
    const len = Math.hypot(dx, dy);
    let maxD = -1;
    let idx = -1;
    for (let i = a + 1; i < b; i++) {
      const [px, py] = points[i];
      const d = len < 1e-12 ? Math.hypot(px - ax, py - ay) : Math.abs((px - ax) * dy - (py - ay) * dx) / len;
      if (d > maxD) { maxD = d; idx = i; }
    }
    if (maxD > tol && idx > 0) { keep[idx] = 1; stack.push([a, idx], [idx, b]); }
  }
  return points.filter((_, i) => keep[i]);
}

function simplifyRing(ring, tol) {
  if (ring.length < 6) return ring;
  let far = 1;
  let best = -1;
  for (let i = 1; i < ring.length; i++) {
    const d = Math.hypot(ring[i][0] - ring[0][0], ring[i][1] - ring[0][1]);
    if (d > best) { best = d; far = i; }
  }
  const a = rdp(ring.slice(0, far + 1), tol);
  const b = rdp(ring.slice(far), tol);
  return a.concat(b.slice(1));
}

function simplifyLine(line, tol) {
  if (line.length < 3) return line.map(([lon, lat]) => [Math.round(lon * 100) / 100, Math.round(lat * 100) / 100]);
  return rdp(line, tol).map(([lon, lat]) => [Math.round(lon * 100) / 100, Math.round(lat * 100) / 100]);
}

const round = ([lon, lat]) => [Math.round(lon * 100) / 100, Math.round(lat * 100) / 100];

const B = BOX;
function clipRing(ring) {
  // Sutherland–Hodgman: отсечение замкнутого кольца прямоугольником.
  let pts = ring;
  const edges = [
    [(p) => p[0] >= B.lon0, (a, b) => inter(a, b, 0, B.lon0)],
    [(p) => p[0] <= B.lon1, (a, b) => inter(a, b, 0, B.lon1)],
    [(p) => p[1] >= B.lat0, (a, b) => inter(a, b, 1, B.lat0)],
    [(p) => p[1] <= B.lat1, (a, b) => inter(a, b, 1, B.lat1)],
  ];
  for (const [inside, cut] of edges) {
    const out = [];
    for (let i = 0; i < pts.length; i++) {
      const cur = pts[i];
      const prev = pts[(i + pts.length - 1) % pts.length];
      const ci = inside(cur);
      const pi = inside(prev);
      if (ci) {
        if (!pi) out.push(cut(prev, cur));
        out.push(cur);
      } else if (pi) out.push(cut(prev, cur));
    }
    pts = out;
    if (!pts.length) return [];
  }
  return pts;
}
function inter(a, b, axis, val) {
  const t = (val - a[axis]) / (b[axis] - a[axis] || 1e-12);
  const other = axis === 0 ? 1 : 0;
  const o = a[other] + (b[other] - a[other]) * t;
  return axis === 0 ? [val, o] : [o, val];
}
function clipLine(line) {
  const runs = [];
  let run = [];
  for (let i = 0; i < line.length - 1; i++) {
    const a = line[i];
    const b = line[i + 1];
    const seg = clipSeg(a, b);
    if (!seg) {
      if (run.length > 1) runs.push(run);
      run = [];
      continue;
    }
    if (!run.length) run.push(seg.p0);
    run.push(seg.p1);
    if (!seg.full) { if (run.length > 1) runs.push(run); run = []; }
  }
  if (run.length > 1) runs.push(run);
  return runs;
}
function clipSeg(a, b) {
  let t0 = 0;
  let t1 = 1;
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const tests = [
    [-dx, a[0] - B.lon0], [dx, B.lon1 - a[0]],
    [-dy, a[1] - B.lat0], [dy, B.lat1 - a[1]],
  ];
  for (const [p, q] of tests) {
    if (Math.abs(p) < 1e-12) { if (q < 0) return null; continue; }
    const r = q / p;
    if (p < 0) { if (r > t1) return null; if (r > t0) t0 = r; }
    else { if (r < t0) return null; if (r < t1) t1 = r; }
  }
  const full = t0 <= 1e-9 && t1 >= 1 - 1e-9;
  return { p0: [a[0] + dx * t0, a[1] + dy * t0], p1: [a[0] + dx * t1, a[1] + dy * t1], full };
}

const land = [];
const holes = [];
for (const f of fc.features) {
  if (!f.geometry) continue;
  const polys = f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates;
  for (const poly of polys) {
    for (let ri = 0; ri < poly.length; ri++) {
      const ring = poly[ri];
      let hit = false;
      for (const pt of ring) if (inBox(pt[0], pt[1])) { hit = true; break; }
      if (!hit) continue;
      // Кольца, пересекающие антимеридиан, рвём по скачку долготы (иначе линия через всю карту).
      const parts = [];
      let cur = [];
      for (let i = 0; i < ring.length; i++) {
        const pt = ring[i];
        if (cur.length && Math.abs(pt[0] - cur[cur.length - 1][0]) > 180) {
          parts.push(cur);
          cur = [];
        }
        cur.push(pt);
      }
      if (cur.length) parts.push(cur);
      for (const part of parts) {
        if (part.length < 4) continue;
        const s = simplifyRing(part.map(round), 0.03);
        if (s.length < 4) continue;
        (ri === 0 ? land : holes).push(s);
      }
    }
  }
}

// Внутренние границы стран (не берег) — тонкие линии на карте.
const borderMesh = mesh(topo, topo.objects.countries, (a, b) => a !== b);
const borders = [];
for (const line of borderMesh.coordinates) {
  for (const run of clipLine(line)) {
    if (run.length > 1) borders.push(simplifyLine(run, 0.05));
  }
}

// Рамка данных для проекции на карте.
const bbox = [BOX.lon0, BOX.lat0, BOX.lon1, BOX.lat1];

const json = JSON.stringify({ bbox, land, holes, borders });
fs.writeFileSync(new URL('../src/data/europe-geo.json', import.meta.url), json);
console.log('land', land.length, 'holes', holes.length, 'borders', borders.length, 'bbox', bbox, 'sizeKB', Math.round(json.length / 1024));
