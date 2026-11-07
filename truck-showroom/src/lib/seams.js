// ============================================================
// БОТ СТЫКОВ: ищет в геометрии незакрытые швы — «дырки» между деталями.
//
// Как считаем:
//   1) все меши модели сводятся в один список треугольников;
//   2) вершины сшиваются по координатам (1 мм) — общая вершина значит,
//      что детали реально стыкуются;
//   3) ребро, которое осталось у одного треугольника, — это открытый шов
//      (граница поверхности);
//   4) открытые швы складываются в замкнутые контуры. Контур, у которого
//      рядом (в пределах зазора) есть чужая геометрия, — это СТЫК двух
//      деталей; если зазор в нём больше порога, стык не закрыт → дырка.
//
// Ничего не рендерит: чистая геометрия, поэтому годится и для теста, и для бота.
// ============================================================
import * as THREE from 'three';

const WELD = 1000; // 1 мм: точность сшивки вершин

const keyOf = (x, y, z) => `${Math.round(x * WELD)},${Math.round(y * WELD)},${Math.round(z * WELD)}`;

/** Треугольники модели в мировых координатах + цвет материала. */
export function collectTris(root) {
  const tris = [];
  root.updateMatrixWorld(true);
  root.traverseVisible((o) => {
    if (!o.isMesh || o.isInstancedMesh || !o.geometry) return;
    const g = o.geometry;
    const pos = g.attributes.position;
    if (!pos) return;
    const idx = g.index;
    const count = idx ? idx.count : pos.count;
    const mat = (Array.isArray(o.material) ? o.material[0] : o.material) || {};
    const name = o.name || o.parent?.name || 'деталь';
    const a = new THREE.Vector3();
    const b = new THREE.Vector3();
    const c = new THREE.Vector3();
    for (let i = 0; i < count; i += 3) {
      const ia = idx ? idx.getX(i) : i;
      const ib = idx ? idx.getX(i + 1) : i + 1;
      const ic = idx ? idx.getX(i + 2) : i + 2;
      a.fromBufferAttribute(pos, ia).applyMatrix4(o.matrixWorld);
      b.fromBufferAttribute(pos, ib).applyMatrix4(o.matrixWorld);
      c.fromBufferAttribute(pos, ic).applyMatrix4(o.matrixWorld);
      const n = new THREE.Vector3().subVectors(b, a).cross(new THREE.Vector3().subVectors(c, a));
      const len = n.length();
      if (!(len > 1e-9)) continue;
      n.multiplyScalar(1 / len);
      tris.push({
        a: a.clone(), b: b.clone(), c: c.clone(), n,
        area: len * 0.5,
        mesh: name,
        color: mat.color ? mat.color.getHexString() : 'cccccc',
      });
    }
  });
  return tris;
}

/** Сетка треугольников: быстрый поиск «что рядом с этой точкой». */
function buildGrid(tris, cell = 0.12) {
  const map = new Map();
  const box = new THREE.Box3();
  tris.forEach((t, i) => {
    box.min.copy(t.a).min(t.b).min(t.c);
    box.max.copy(t.a).max(t.b).max(t.c);
    const x0 = Math.floor(box.min.x / cell);
    const x1 = Math.floor(box.max.x / cell);
    const y0 = Math.floor(box.min.y / cell);
    const y1 = Math.floor(box.max.y / cell);
    const z0 = Math.floor(box.min.z / cell);
    const z1 = Math.floor(box.max.z / cell);
    for (let x = x0; x <= x1; x++) {
      for (let y = y0; y <= y1; y++) {
        for (let z = z0; z <= z1; z++) {
          const k = `${x},${y},${z}`;
          let arr = map.get(k);
          if (!arr) { arr = []; map.set(k, arr); }
          arr.push(i);
        }
      }
    }
  });
  return { map, cell };
}

const _ab = new THREE.Vector3();
const _ac = new THREE.Vector3();
const _ap = new THREE.Vector3();
const _bp = new THREE.Vector3();
const _cp = new THREE.Vector3();
const _q = new THREE.Vector3();

/** Расстояние от точки до треугольника. */
function distPointTri(p, t) {
  _ab.subVectors(t.b, t.a);
  _ac.subVectors(t.c, t.a);
  _ap.subVectors(p, t.a);
  const d1 = _ab.dot(_ap);
  const d2 = _ac.dot(_ap);
  if (d1 <= 0 && d2 <= 0) return _ap.length();
  _bp.subVectors(p, t.b);
  const d3 = _ab.dot(_bp);
  const d4 = _ac.dot(_bp);
  if (d3 >= 0 && d4 <= d3) return _bp.length();
  const vc = d1 * d4 - d3 * d2;
  if (vc <= 0 && d1 >= 0 && d3 <= 0) {
    const v = d1 / (d1 - d3);
    _q.copy(t.a).addScaledVector(_ab, v);
    return p.distanceTo(_q);
  }
  _cp.subVectors(p, t.c);
  const d5 = _ab.dot(_cp);
  const d6 = _ac.dot(_cp);
  if (d6 >= 0 && d5 <= d6) return _cp.length();
  const vb = d5 * d2 - d1 * d6;
  if (vb <= 0 && d2 >= 0 && d6 <= 0) {
    const w = d2 / (d2 - d6);
    _q.copy(t.a).addScaledVector(_ac, w);
    return p.distanceTo(_q);
  }
  const va = d3 * d6 - d5 * d4;
  if (va <= 0 && (d4 - d3) >= 0 && (d5 - d6) >= 0) {
    _q.copy(t.b).addScaledVector(_cp.subVectors(t.c, t.b), (d4 - d3) / ((d4 - d3) + (d5 - d6)));
    return p.distanceTo(_q);
  }
  const denom = 1 / (va + vb + vc);
  const v = vb * denom;
  const w = vc * denom;
  _q.copy(t.a).addScaledVector(_ab, v).addScaledVector(_ac, w);
  return p.distanceTo(_q);
}

/**
 * Ищет открытые швы и незакрытые стыки.
 * @param {THREE.Object3D} root — собранная модель
 * @param {object} opts — { gap: 0.02 (дырка), touch: 0.03 (что считаем соседом) }
 */
export function analyzeSeams(root, opts = {}) {
  const holeGap = opts.gap ?? 0.02; // 2 см — уже видно как дыра
  const touch = opts.touch ?? 0.06; // ближе 6 см — детали «рядом» (стык)
  const reach = opts.reach ?? 0.18; // дальше — это уже открытый край, не шов
  const maxReport = opts.maxReport ?? 12;
  const tris = collectTris(root);
  if (!tris.length) return { tris: 0, welds: 0, open: [], gaps: [], holes: [], edges: 0 };

  // ---- сшивка вершин
  const verts = new Map();
  const vlist = [];
  const vid = (v) => {
    const k = keyOf(v.x, v.y, v.z);
    let i = verts.get(k);
    if (i === undefined) {
      i = vlist.length;
      verts.set(k, i);
      vlist.push(v.clone());
    }
    return i;
  };
  const faces = tris.map((t) => [vid(t.a), vid(t.b), vid(t.c)]);

  // ---- рёбра
  const edges = new Map();
  faces.forEach((f, ti) => {
    for (let i = 0; i < 3; i++) {
      const p = f[i];
      const q = f[(i + 1) % 3];
      if (p === q) continue;
      const k = p < q ? `${p}|${q}` : `${q}|${p}`;
      let e = edges.get(k);
      if (!e) { e = { a: p, b: q, n: 0, t: [] }; edges.set(k, e); }
      e.n += 1;
      e.t.push(ti);
    }
  });

  const border = [];
  for (const e of edges.values()) {
    if (e.n === 1) border.push({ a: e.a, b: e.b, tri: e.t[0] });
  }
  // для картинок: где именно открытые швы (--seams у tools/render.mjs)
  const borderPoints = opts.withBorder
    ? border.map((e) => [...vlist[e.a].toArray(), ...vlist[e.b].toArray()])
    : null;

  // ---- контуры из открытых рёбер
  const adj = new Map();
  for (const e of border) {
    if (!adj.has(e.a)) adj.set(e.a, []);
    if (!adj.has(e.b)) adj.set(e.b, []);
    adj.get(e.a).push(e);
    adj.get(e.b).push(e);
  }
  const used = new Set();
  const loops = [];
  const edgeKey = (e) => (e.a < e.b ? `${e.a}|${e.b}` : `${e.b}|${e.a}`);
  for (const e of border) {
    if (used.has(edgeKey(e))) continue;
    const loop = [];
    let cur = e;
    const startV = e.a;
    let guard = 0;
    while (cur && !used.has(edgeKey(cur)) && guard++ < 4000) {
      used.add(edgeKey(cur));
      loop.push(cur);
      const to = cur.b;
      if (to === startV) break; // контур замкнулся
      const list = adj.get(to) || [];
      const next = list.find((x) => !used.has(edgeKey(x)));
      if (!next) break; // цепочка оборвалась — это не контур, а щель/край
      cur = next.a === to ? next : { a: next.b, b: next.a, tri: next.tri };
    }
    if (loop.length) loops.push(loop);
  }

  // ---- «что рядом» для каждого открытого ребра
  const grid = buildGrid(tris);
  const near = (p, skipTri) => {
    const cx = Math.floor(p.x / grid.cell);
    const cy = Math.floor(p.y / grid.cell);
    const cz = Math.floor(p.z / grid.cell);
    let best = Infinity;
    let bestTri = -1;
    const R = Math.ceil(reach / grid.cell);
    for (let x = cx - R; x <= cx + R; x++) {
      for (let y = cy - R; y <= cy + R; y++) {
        for (let z = cz - R; z <= cz + R; z++) {
          const arr = grid.map.get(`${x},${y},${z}`);
          if (!arr) continue;
          for (const ti of arr) {
            if (ti === skipTri) continue;
            const d = distPointTri(p, tris[ti]);
            if (d < best) { best = d; bestTri = ti; }
          }
        }
      }
    }
    return { d: best, tri: bestTri };
  };

  // «на виду ли шов»: если из точки можно выйти наружу мимо геометрии,
  // значит этот край не спрятан внутри конструкции
  const isExposed = (p, skipTri) => {
    const dirs = [];
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      dirs.push(new THREE.Vector3(Math.cos(a), 0.55, Math.sin(a)).normalize());
      dirs.push(new THREE.Vector3(Math.cos(a), -0.55, Math.sin(a)).normalize());
    }
    dirs.push(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, -1, 0));
    const probe = new THREE.Vector3();
    for (const d of dirs) {
      let blocked = false;
      for (let step = 0.03; step <= 2.4; step += 0.04) {
        probe.copy(p).addScaledVector(d, step);
        const cx = Math.floor(probe.x / grid.cell);
        const cy = Math.floor(probe.y / grid.cell);
        const cz = Math.floor(probe.z / grid.cell);
        const arr = grid.map.get(`${cx},${cy},${cz}`);
        if (!arr) continue;
        for (const ti of arr) {
          if (ti === skipTri) continue;
          if (distPointTri(probe, tris[ti]) < 0.035) { blocked = true; break; }
        }
        if (blocked) break;
      }
      if (!blocked) return true;
    }
    return false;
  };

  const mid = new THREE.Vector3();
  const open = [];
  for (const loop of loops) {
    let maxGap = 0;
    let sumGap = 0;
    let neighbour = null;
    let allNear = true;
    let anyHole = false;
    for (const e of loop) {
      mid.copy(vlist[e.a]).add(vlist[e.b]).multiplyScalar(0.5);
      const r = near(mid, e.tri);
      if (r.d <= touch) {
        maxGap = Math.max(maxGap, r.d);
        sumGap += r.d;
        if (r.tri >= 0 && !neighbour) neighbour = tris[r.tri].mesh;
        if (r.d > holeGap) anyHole = true;
      } else {
        allNear = false;
      }
    }
    const center = new THREE.Vector3();
    for (const e of loop) center.add(vlist[e.a]);
    center.multiplyScalar(1 / Math.max(1, loop.length));
    const rec = {
      edges: loop.length,
      closed: loop.length >= 3,
      length: +loop.reduce((s2, e) => s2 + vlist[e.a].distanceTo(vlist[e.b]), 0).toFixed(3),
      center: [+center.x.toFixed(2), +center.y.toFixed(2), +center.z.toFixed(2)],
      maxGap: +maxGap.toFixed(4),
      avgGap: +(sumGap / Math.max(1, loop.length)).toFixed(4),
      mesh: tris[loop[0].tri]?.mesh || '?',
      neighbour,
      enclosed: allNear,
    };
    rec.hole = anyHole;
    if (rec.enclosed && rec.closed) {
      if (!anyHole) rec.kind = 'seam';
      else {
        // «на виду ли» — только для справки: щель внутри конструкции
        // и щель на виду одинаково незакрыты, но искать глазами нужно разные
        rec.exposed = isExposed(center, loop[0].tri);
        rec.kind = 'hole';
      }
    }
    open.push(rec);
  }

  const seams = [];
  const holes = [];
  for (const o of open) {
    if (o.kind === 'hole') holes.push(o);
    else if (o.kind === 'seam') seams.push(o);
  }
  const slits = holes.filter((o) => !o.exposed);
  const byGap = (a, b) => (b.maxGap || 0) - (a.maxGap || 0);
  holes.sort(byGap);
  seams.sort(byGap);
  const plainOpen = open.filter((o) => !o.kind);
  plainOpen.sort((a, b) => b.length - a.length);

  return {
    borderPoints,
    tris: tris.length,
    welds: vlist.length,
    edges: border.length,
    loops: loops.length,
    holes: holes.slice(0, maxReport),
    holeCount: holes.length,
    seams: seams.slice(0, maxReport),
    seamCount: seams.length,
    slits: slits.slice(0, maxReport),
    slitCount: slits.length,
    exposedCount: holes.filter((o) => o.exposed).length,
    open: plainOpen.slice(0, maxReport),
    openCount: plainOpen.length,
  };
}

/** Человеческий вердикт по отчёту. */
export function seamVerdict(rep) {
  if (!rep || !rep.tris) return { ok: false, text: 'модель не собралась' };
  if (rep.holeCount) {
    return { ok: false, text: `${rep.holeCount} незакрытых стыков (до ${(rep.holes[0]?.maxGap * 1000).toFixed(0)} мм)` };
  }
  return { ok: true, text: rep.seamCount ? `стыки закрыты, плотных швов ${rep.seamCount}` : 'швы закрыты' };
}
