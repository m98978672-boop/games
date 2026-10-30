// ============================================================
//  Обводки моделей (коллизионные оболочки).
//
//  У каждой модели в мире есть своя обводка — призма из треугольников,
//  повторяющая силуэт модели в плане (выпуклая оболочка её геометрии).
//  Обводка невидима, но живой хитбокс героя (и зверя) сквозь неё
//  не проходит: движение упирается в треугольники, а не в приблизительный
//  круг. Край обводки идёт ровно по краю модели, поэтому вплотную
//  к стволу можно подойти, но не пройти сквозь него.
//
//  Смотреть обводки: F3, затем Ж (на клавиатуре — клавиша «;»).
// ============================================================

import * as THREE from 'three';

/**
 * Выпуклая оболочка на плоскости (x, z) — монотонная цепочка Эндрю.
 * Возвращает точки против часовой стрелки, без повторов.
 */
export function convexHull2D(points) {
  if (!points || points.length < 3) return (points || []).slice();
  const pts = points
    .map((p) => ({ x: p.x, z: p.z }))
    .sort((a, b) => (a.x === b.x ? a.z - b.z : a.x - b.x));

  const cross = (o, a, b) => (a.x - o.x) * (b.z - o.z) - (a.z - o.z) * (b.x - o.x);
  const lower = [];
  for (const p of pts) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) lower.pop();
    lower.push(p);
  }
  const upper = [];
  for (let i = pts.length - 1; i >= 0; i--) {
    const p = pts[i];
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) upper.pop();
    upper.push(p);
  }
  lower.pop();
  upper.pop();
  return lower.concat(upper);
}

/**
 * Оболочка из геометрии модели: берём вершины и сводим к выпуклому контуру.
 * belowY — брать только то, что ниже этой высоты: у дерева обводка должна
 * обнимать ствол и корни, а не крону (иначе получилась бы невидимая стена).
 */
export function hullFromGeometry(geometries, { pad = 0.02, belowY = Infinity, maxRadius = undefined } = {}) {
  const pts = [];
  const limit = maxRadius === undefined ? null : Math.max(0.12, maxRadius);
  for (const geo of geometries) {
    if (!geo) continue;
    const pos = geo.attributes && geo.attributes.position;
    if (!pos) continue;
    const step = Math.max(1, Math.floor(pos.count / 900));   // прореживаем: контур не изменится
    for (let i = 0; i < pos.count; i += step) {
      if (pos.getY(i) > belowY) continue;
      let px = pos.getX(i);
      let pz = pos.getZ(i);
      // обводка не шире «твёрдой» части модели: крона и раскидистые ветки
      // не должны превращаться в невидимую стену
      if (limit !== null) {
        const d = Math.hypot(px, pz);
        if (d > limit) {
          px = (px / d) * limit;
          pz = (pz / d) * limit;
        }
      }
      pts.push({ x: px, z: pz });
    }
  }
  const hull = convexHull2D(pts);
  if (hull.length < 3) return null;
  // обводка чуть шире модели — силуэт должен накрывать её целиком
  const cx = hull.reduce((s, p) => s + p.x, 0) / hull.length;
  const cz = hull.reduce((s, p) => s + p.z, 0) / hull.length;
  return hull.map((p) => {
    const dx = p.x - cx;
    const dz = p.z - cz;
    const len = Math.hypot(dx, dz) || 1;
    return { x: p.x + (dx / len) * pad, z: p.z + (dz / len) * pad };
  });
}

/**
 * Обводка по частям модели, а не одна общая.
 *
 * У дерева «твёрдое» — это ствол и корни, у валуна — камень, у куста —
 * сердцевина. Если снимать одну оболочку со всей модели, она либо шире
 * силуэта (невидимая стена), либо режет углы. Поэтому модель режется на
 * горизонтальные пояса, и у каждого пояса своя призма с своим радиусом:
 * низ — по корням, выше — по стволу, крона в обводку не попадает вовсе.
 *
 * Возвращает [{ poly, minY, maxY }]. Пустой массив — обводить нечего.
 */
export function hullsFromGeometry(geometries, {
  pad = 0.02,
  top = Infinity,          // выше этого — не обводим (крона, листья)
  bands = 2,               // на сколько поясов резать
  basePad = 0.16,          // первый пояс шире: там корни и комель
  maxRadius = undefined,
} = {}) {
  const solid = geometries.filter(Boolean);
  if (!solid.length) return [];
  let minY = Infinity;
  let maxY = -Infinity;
  for (const geo of solid) {
    const pos = geo.attributes && geo.attributes.position;
    if (!pos) continue;
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i);
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
  if (!Number.isFinite(minY)) return [];
  const shellTop = Math.min(maxY, top);
  if (shellTop - minY < 0.15) return [];

  const out = [];
  const span = shellTop - minY;
  for (let b = 0; b < bands; b++) {
    const y0 = minY + (span * b) / bands;
    const y1 = b === bands - 1 ? shellTop : minY + (span * (b + 1)) / bands;
    // радиус сужается с высотой: у корней шире, у верхушки — уже
    const cap = maxRadius === undefined
      ? undefined
      : maxRadius * (b === 0 ? 1 + basePad : 1 - b * 0.12);
    const pts = [];
    for (const geo of solid) {
      const pos = geo.attributes && geo.attributes.position;
      if (!pos) continue;
      const step = Math.max(1, Math.floor(pos.count / 700));
      for (let i = 0; i < pos.count; i += step) {
        const y = pos.getY(i);
        if (y < y0 - 0.02 || y > y1 + 0.02) continue;
        let px = pos.getX(i);
        let pz = pos.getZ(i);
        if (cap !== undefined) {
          const d = Math.hypot(px, pz);
          if (d > cap) { px = (px / d) * cap; pz = (pz / d) * cap; }
        }
        pts.push({ x: px, z: pz });
      }
    }
    const hull = convexHull2D(pts);
    if (hull.length < 3) continue;
    const cx = hull.reduce((acc, p) => acc + p.x, 0) / hull.length;
    const cz = hull.reduce((acc, p) => acc + p.z, 0) / hull.length;
    const poly = hull.map((p) => {
      const dx = p.x - cx;
      const dz = p.z - cz;
      const len = Math.hypot(dx, dz) || 1;
      return { x: p.x + (dx / len) * pad, z: p.z + (dz / len) * pad };
    });
    out.push({ poly, minY: y0, maxY: y1 + 0.02 });
  }
  return out;
}

const CELL = 8;
const key = (cx, cz) => cx * 100000 + cz;

export class ShellField {
  constructor(scene) {
    this.scene = scene;
    this.prisms = [];
    this.grid = new Map();
    this.lines = null;          // отладочный каркас (F3 → Ж)
    this.debug = false;
    this.group = new THREE.Group();
    this.group.name = 'shells';
    this.group.visible = false;
    if (scene) scene.add(this.group);
    this._searchBuf = [];
    this._searchStamp = 0;
    this._triangles = null;
    this.stats = { prisms: 0, triangles: 0 };
  }

  /**
   * Добавить обводку. poly — контур в мировых координатах (x, z),
   * minY/maxY — низ и верх обводки, enabled() — жива ли модель.
   */
  add(kind, poly, minY, maxY, { enabled = null } = {}) {
    if (!poly || poly.length < 3) return null;
    let minX = Infinity;
    let maxX = -Infinity;
    let minZ = Infinity;
    let maxZ = -Infinity;
    for (const p of poly) {
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.z < minZ) minZ = p.z;
      if (p.z > maxZ) maxZ = p.z;
    }
    const prism = { kind, poly, minX, maxX, minZ, maxZ, minY, maxY, enabled };
    this.prisms.push(prism);

    // в сетку — чтобы каждый кадр не перебирать тысячи стволов
    for (let cx = Math.floor(minX / CELL); cx <= Math.floor(maxX / CELL); cx++) {
      for (let cz = Math.floor(minZ / CELL); cz <= Math.floor(maxZ / CELL); cz++) {
        const k = key(cx, cz);
        let bucket = this.grid.get(k);
        if (!bucket) this.grid.set(k, (bucket = []));
        bucket.push(prism);
      }
    }
    this.stats.prisms = this.prisms.length;
    this.lines = null;          // каркас пересоберётся при показе
    this._triangles = null;
    return prism;
  }

  /** Обводки вокруг точки */
  near(x, z, radius) {
    const out = this._searchBuf;
    out.length = 0;
    const stamp = ++this._searchStamp;
    for (let cx = Math.floor((x - radius) / CELL); cx <= Math.floor((x + radius) / CELL); cx++) {
      for (let cz = Math.floor((z - radius) / CELL); cz <= Math.floor((z + radius) / CELL); cz++) {
        const bucket = this.grid.get(key(cx, cz));
        if (!bucket) continue;
        for (const p of bucket) {
          if (p._searchStamp === stamp) continue;
          p._searchStamp = stamp;
          out.push(p);
        }
      }
    }
    return out;
  }

  /**
   * Вытолкнуть круг (живой хитбокс) из обводок.
   * feetY — низ героя: обводку, которая ниже колена, перешагиваем.
   * Возвращает число исправленных пересечений.
   */
  resolve(pos, radius, velocity = null, feetY = 0, stepUp = 0.35, height = 1.85) {
    if (!this.prisms.length) return 0;
    let fixed = 0;
    const top = feetY + height;
    for (const p of this.near(pos.x, pos.z, radius + 1.2)) {
      if (p.enabled && !p.enabled()) continue;
      const precise = p.kind === 'den' || p.kind === 'tree' || p.kind === 'palm' || p.kind === 'rock';
      if (p.maxY < feetY + (precise ? 0 : stepUp)) continue;      // обводка ниже шага — переступаем
      if (p.minY > top) continue;                 // герой целиком выше обводки
      if (pos.x + radius < p.minX || pos.x - radius > p.maxX || pos.z + radius < p.minZ || pos.z - radius > p.maxZ) continue;
      const hit = this._pushOut(p, pos, radius);
      if (!hit) continue;
      pos.x += hit.x;
      pos.z += hit.z;
      if (velocity) {
        const len = Math.hypot(hit.x, hit.z) || 1;
        const nx = hit.x / len;
        const nz = hit.z / len;
        const into = velocity.x * nx + velocity.z * nz;
        if (into < 0) {
          velocity.x -= nx * into;
          velocity.z -= nz * into;
        }
      }
      fixed++;
    }
    return fixed;
  }

  /** Внутри ли точка обводки (для проверок и бота) */
  contains(x, z, y = null) {
    for (const p of this.near(x, z, 0.5)) {
      if (p.enabled && !p.enabled()) continue;
      if (y !== null && (y > p.maxY || y + 1.85 < p.minY)) continue;
      if (x < p.minX || x > p.maxX || z < p.minZ || z > p.maxZ) continue;
      if (this._inside(p.poly, x, z)) return true;
    }
    return false;
  }

  /** Пройдёт ли круг — нужно зверям */
  blocked(x, z, radius, y = 0) {
    for (const p of this.near(x, z, radius + 1.2)) {
      if (p.enabled && !p.enabled()) continue;
      const precise = p.kind === 'den' || p.kind === 'tree' || p.kind === 'palm' || p.kind === 'rock';
      if (p.maxY < y + (precise ? 0 : 0.35)) continue;
      if (p.minY > y + 1.85) continue;
      if (x + radius < p.minX || x - radius > p.maxX || z + radius < p.minZ || z - radius > p.maxZ) continue;
      if (this._inside(p.poly, x, z)) return true;
      const d = this._edgeDistance(p.poly, x, z);
      if (d < radius) return true;
    }
    return false;
  }

  // --- геометрия контура -------------------------------------

  _inside(poly, x, z) {
    // выпуклый контур против часовой стрелки: точка внутри, если слева от всех рёбер
    let inside = true;
    for (let i = 0; i < poly.length; i++) {
      const a = poly[i];
      const b = poly[(i + 1) % poly.length];
      if ((b.x - a.x) * (z - a.z) - (b.z - a.z) * (x - a.x) < 0) { inside = false; break; }
    }
    return inside;
  }

  _edgeDistance(poly, x, z) {
    let best = Infinity;
    for (let i = 0; i < poly.length; i++) {
      const a = poly[i];
      const b = poly[(i + 1) % poly.length];
      const dx = b.x - a.x;
      const dz = b.z - a.z;
      const len2 = dx * dx + dz * dz || 1;
      const t = Math.max(0, Math.min(1, ((x - a.x) * dx + (z - a.z) * dz) / len2));
      const px = a.x + dx * t;
      const pz = a.z + dz * t;
      const d = Math.hypot(x - px, z - pz);
      if (d < best) best = d;
    }
    return best;
  }

  /** На сколько и куда сдвинуть круг, чтобы он вышел из обводки */
  _pushOut(p, pos, radius) {
    const inside = this._inside(p.poly, pos.x, pos.z);
    let best = Infinity;
    let nx = 0;
    let nz = 0;
    let edgeX = 0;
    let edgeZ = 0;
    for (let i = 0; i < p.poly.length; i++) {
      const a = p.poly[i];
      const b = p.poly[(i + 1) % p.poly.length];
      const dx = b.x - a.x;
      const dz = b.z - a.z;
      const len2 = dx * dx + dz * dz || 1;
      const t = Math.max(0, Math.min(1, ((pos.x - a.x) * dx + (pos.z - a.z) * dz) / len2));
      const px = a.x + dx * t;
      const pz = a.z + dz * t;
      const d = Math.hypot(pos.x - px, pos.z - pz);
      if (d < best) { best = d; nx = px; nz = pz; edgeX = dx; edgeZ = dz; }
    }
    if (!inside && best >= radius) return null;

    // направление от ближайшей точки ребра наружу
    let dx = pos.x - nx;
    let dz = pos.z - nz;
    let len = Math.hypot(dx, dz);
    if (len < 1e-4) {
      // В точке на ребре направление — наружная нормаль CCW-контура.
      const edgeLen = Math.hypot(edgeX, edgeZ) || 1;
      return { x: edgeZ / edgeLen * radius, z: -edgeX / edgeLen * radius };
    }
    const push = inside ? best + radius : radius - best;
    const sign = inside ? -1 : 1;
    return { x: sign * (dx / len) * push, z: sign * (dz / len) * push };
  }

  // --- отладка: F3 → Ж ---------------------------------------

  /** Собрать каркас обводок: рёбра призм, как треугольники на просвет */
  buildDebug() {
    if (this.lines || !this.prisms.length) return this.lines;
    const verts = [];
    const tris = [];
    for (const p of this.prisms) {
      const n = p.poly.length;
      // вертикальные рёбра — через одно: каркас читается, но не слепит
      for (let i = 0; i < n; i += 2) {
        const a = p.poly[i];
        verts.push(a.x, p.minY, a.z, a.x, p.maxY, a.z);
      }
      for (let i = 0; i < n; i++) {
        const a = p.poly[i];
        const b = p.poly[(i + 1) % n];
        // верхнее и нижнее кольцо
        verts.push(a.x, p.maxY, a.z, b.x, p.maxY, b.z);
        verts.push(a.x, p.minY, a.z, b.x, p.minY, b.z);
        // треугольники оболочки: верхняя и нижняя крышка + боковая стенка
        tris.push(a.x, p.maxY, a.z, b.x, p.maxY, b.z, p.poly[0].x, p.maxY, p.poly[0].z);
        tris.push(a.x, p.minY, a.z, p.poly[0].x, p.minY, p.poly[0].z, b.x, p.minY, b.z);
        tris.push(a.x, p.minY, a.z, b.x, p.minY, b.z, b.x, p.maxY, b.z);
        tris.push(a.x, p.minY, a.z, b.x, p.maxY, b.z, a.x, p.maxY, a.z);
      }
    }
    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
    // depthTest включён: иначе обводки всех деревьев острова светятся сквозь
    // лес и сквозь друг друга — получается «частокол проводов», а не силуэты
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x7dffb0,
      transparent: true,
      opacity: 0.55,
      depthTest: true,
      depthWrite: false,
    });
    this.lines = new THREE.LineSegments(lineGeo, lineMat);
    this.lines.frustumCulled = false;
    this.lines.renderOrder = 9998;

    const triGeo = new THREE.BufferGeometry();
    triGeo.setAttribute('position', new THREE.Float32BufferAttribute(tris, 3));
    const triMat = new THREE.MeshBasicMaterial({
      color: 0x39a86a,
      transparent: true,
      opacity: 0.12,
      side: THREE.DoubleSide,
      depthTest: true,
      depthWrite: false,
    });
    this.triangles = new THREE.Mesh(triGeo, triMat);
    this.triangles.frustumCulled = false;
    this.triangles.renderOrder = 9997;

    this.group.add(this.triangles);
    this.group.add(this.lines);
    this.stats.triangles = tris.length / 9;
    return this.lines;
  }

  /** Показать/спрятать обводки (F3 → Ж) */
  setVisible(show) {
    this.debug = !!show;
    if (this.debug) {
      // старый каркас мог устареть (модели спилили или добавили) — собираем заново
      if (this.lines) {
        this.group.remove(this.lines);
        this.group.remove(this.triangles);
        this.lines.geometry.dispose();
        this.triangles.geometry.dispose();
        this.lines = null;
        this.triangles = null;
      }
      this.buildDebug();
    }
    this.group.visible = this.debug;
    return this.debug;
  }

  toggle() {
    return this.setVisible(!this.debug);
  }

  /** Модель убрали — обводка исчезает вместе с ней */
  remove(prism) {
    const i = this.prisms.indexOf(prism);
    if (i < 0) return false;
    this.prisms.splice(i, 1);
    for (const bucket of this.grid.values()) {
      const j = bucket.indexOf(prism);
      if (j >= 0) bucket.splice(j, 1);
    }
    this.lines = null;
    this.stats.prisms = this.prisms.length;
    return true;
  }
}
