// ============================================================
//  Модели: растения, камни, подбираемые вещи и звери.
//  Всё собирается из простых фигур (low-poly), красится в вершинные
//  цвета и склеивается в слои — так один инстанс-меш рисует сотни
//  объектов, но силуэт у каждого свой.
// ============================================================

import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { COLORS } from './config.js';

// ---------- вспомогательное ----------

export function colorize(geo, hex) {
  const c = new THREE.Color(hex);
  const n = geo.attributes.position.count;
  const arr = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    arr[i * 3] = c.r;
    arr[i * 3 + 1] = c.g;
    arr[i * 3 + 2] = c.b;
  }
  geo.setAttribute('color', new THREE.BufferAttribute(arr, 3));
  return geo;
}

function jitterGeo(geo, amount, rng) {
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    pos.setXYZ(
      i,
      pos.getX(i) + (rng() - 0.5) * amount,
      pos.getY(i) + (rng() - 0.5) * amount,
      pos.getZ(i) + (rng() - 0.5) * amount
    );
  }
  geo.computeVertexNormals();
  return geo;
}

const _v = new THREE.Vector3();
const _q = new THREE.Quaternion();
const _e = new THREE.Euler();
const _s = new THREE.Vector3();
const _m = new THREE.Matrix4();
const UP = new THREE.Vector3(0, 1, 0);
const RIGHT = new THREE.Vector3(1, 0, 0);

/** Положить геометрию в слой, применив позицию/поворот/масштаб и цвет */
function piece(parts, geo, hex, pos = [0, 0, 0], rot = [0, 0, 0], scale = [1, 1, 1]) {
  const g = flat(geo);
  _q.setFromEuler(_e.set(rot[0], rot[1], rot[2], 'YXZ'));
  _m.compose(_v.set(pos[0], pos[1], pos[2]), _q, _s.set(scale[0], scale[1], scale[2]));
  g.applyMatrix4(_m);
  colorize(g, hex);
  parts.push(g);
  return g;
}

/**
 * Плоская лента по точкам (стержень листа пальмы): строится из квадов
 * по обе стороны от центральной линии, с сужением к концу.
 */
function ribbonGeometry(points, halfWidth, upTilt = 0.35) {
  const positions = [];
  const uvs = [];
  const left = [];
  const right = [];
  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    const prev = points[Math.max(0, i - 1)];
    const next = points[Math.min(points.length - 1, i + 1)];
    const dir = next.clone().sub(prev).normalize();
    // боковой вектор — в плоскости листа (перпендикуляр к направлению, «вбок»)
    const side = new THREE.Vector3(-dir.z, 0, dir.x).normalize();
    if (side.lengthSq() < 0.001) side.set(0, 0, 1);
    const t = i / (points.length - 1);
    const w = halfWidth * Math.sin(Math.PI * Math.min(1, 0.18 + t * 0.95)) * (1 - t * 0.25);
    // края чуть приподняты — лист не совсем плоский (V-образный профиль)
    const lift = new THREE.Vector3(0, w * upTilt, 0);
    left.push(p.clone().addScaledVector(side, w).add(lift));
    right.push(p.clone().addScaledVector(side, -w).add(lift));
  }

  const n = points.length - 1;
  for (let i = 0; i < n; i++) {
    const a = left[i];
    const b = right[i];
    const c = left[i + 1];
    const d = right[i + 1];
    const v0 = i / n;
    const v1 = (i + 1) / n;
    positions.push(a.x, a.y, a.z, b.x, b.y, b.z, c.x, c.y, c.z);
    uvs.push(0, v0, 1, v0, 0, v1);
    positions.push(b.x, b.y, b.z, d.x, d.y, d.z, c.x, c.y, c.z);
    uvs.push(1, v0, 1, v1, 0, v1);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.computeVertexNormals();
  return geo;
}

/** Куда смотрит вектор: поворот «вдоль направления» для цилиндра */
function alignQuat(from, to) {
  const dir = to.clone().sub(from).normalize();
  return new THREE.Quaternion().setFromUnitVectors(UP, dir);
}

/** Деталь модели: красим, поворачиваем, сдвигаем и кладём в слой */
/** Привести геометрию к non-indexed без лишних предупреждений Three.js */
function flat(geo) {
  return geo.index ? geo.toNonIndexed() : geo;
}

function part(parts, geo, hex, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0) {
  if (geo.index) geo = geo.toNonIndexed();
  colorize(geo, hex);
  if (rx) geo.rotateX(rx);
  if (ry) geo.rotateY(ry);
  if (rz) geo.rotateZ(rz);
  geo.translate(x, y, z);
  parts.push(geo);
  return geo;
}

/** Собрать слой из списка геометрий (все — одной indexed-ности) */
function merge(parts) {
  if (!parts.length) return null;
  return mergeGeometries(parts, false);
}

/** Ступенчатый ствол: несколько сужающихся колен с лёгким изгибом */
function trunkPart(parts, rng, height, baseR, topR, hexA, hexB, bend = 0.3, sides = 8) {
  const segments = 5;
  let x = 0;
  let z = 0;
  let y = 0;
  const segH = height / segments;
  for (let i = 0; i < segments; i++) {
    const t = i / segments;
    const r0 = baseR + (topR - baseR) * t;
    const r1 = baseR + (topR - baseR) * (t + 1 / segments);
    const geo = new THREE.CylinderGeometry(r1, r0 * 1.06, segH * 1.04, sides, 1);
    const twist = bend * (i / segments);
    x += Math.sin(twist) * segH * 0.55;
    z += Math.cos(twist * 0.7) * segH * 0.12;
    part(parts, geo, i % 2 ? hexA : hexB, x, y + segH / 2, z);
    y += segH;
  }
  return { x, y, z };
}

// ---------- растения ----------

/**
 * Пальма: ребристый ствол с наклоном, шапка из длинных перистых листьев,
 * гроздь кокосов под кроной.
 */
export function makePalmParts(rng) {
  const bark = [];
  const leaf = [];

  const h = 6.6 + rng() * 4.0;
  const leanX = (rng() - 0.5) * 2.2;      // насколько уходит верхушка
  const leanZ = (rng() - 0.5) * 1.1;
  const bend = 0.55 + rng() * 0.5;         // изгиб ствола
  const baseR = 0.33 + rng() * 0.06;
  const topR = 0.15;

  // ствол идёт по плавной кривой — кольца и крона берут точки оттуда же
  const spine = (t) => new THREE.Vector3(
    leanX * Math.pow(t, bend + 0.6),
    h * t,
    leanZ * Math.pow(t, bend + 0.6)
  );

  const segments = 10;
  for (let i = 0; i < segments; i++) {
    const t0 = i / segments;
    const t1 = (i + 1) / segments;
    const a = spine(t0);
    const b = spine(t1);
    const mid = a.clone().add(b).multiplyScalar(0.5);
    const len = a.distanceTo(b) * 1.06;
    const r0 = baseR + (topR - baseR) * t0;
    const r1 = baseR + (topR - baseR) * t1;

    let geo = new THREE.CylinderGeometry(r1, r0, len, 9, 1);
    geo.applyQuaternion(alignQuat(a, b));
    geo.translate(mid.x, mid.y, mid.z);
    geo = flat(geo);
    bark.push(colorize(geo, i % 2 ? COLORS.trunk : 0x6d4f33));
  }

  // кольца от старых черешков — по той же кривой, с наклоном вдоль ствола
  const rings = 9;
  for (let i = 1; i <= rings; i++) {
    const t = i / (rings + 1);
    const p = spine(t);
    const above = spine(Math.min(1, t + 0.02));
    const ringR = (baseR + (topR - baseR) * t) + 0.035;
    const ring = new THREE.CylinderGeometry(ringR, ringR * 1.04, 0.075, 9, 1);
    ring.applyQuaternion(alignQuat(p, above));
    ring.translate(p.x, p.y, p.z);
    piece(bark, ring, 0x5b4028);
  }

  // --- крона ---
  const top = spine(1);

  // «ананас» у основания листьев, чтобы не было дыры
  piece(leaf, new THREE.IcosahedronGeometry(0.34, 1), 0x4e7a3f, [top.x, top.y - 0.06, top.z], [0, 0, 0], [1, 0.85, 1]);

  const fronds = 9;
  for (let i = 0; i < fronds; i++) {
    const yaw = (i / fronds) * Math.PI * 2 + (rng() - 0.5) * 0.4;
    const len = 2.4 + rng() * 1.5;
    const rise = 0.42 + rng() * 0.4;      // подъём у основания
    const droop = 0.95 + rng() * 0.75;    // провисание к концу
    const leafletColor = i % 2 ? COLORS.frond : COLORS.frondLight;

    // точки центральной линии листа
    const steps = 9;
    const pts = [];
    for (let k = 0; k <= steps; k++) {
      const t = k / steps;
      pts.push(new THREE.Vector3(
        t * len,
        (rise * t - droop * t * t) * len * 0.5,
        0
      ));
    }

    // --- собираем лист в локальных координатах, потом поворачиваем ---
    const pieces = [];

    // плотная лента-лезвие
    pieces.push({ geo: ribbonGeometry(pts, 0.44 + rng() * 0.1, 0.26), color: leafletColor });

    // свисающие «перья» по краям
    for (let k = 1; k < steps; k++) {
      const t = k / steps;
      const p = pts[k];
      const ll = (0.66 - Math.abs(t - 0.45) * 0.6) * (0.7 + len * 0.16);
      for (const side of [1, -1]) {
        let feather = new THREE.BoxGeometry(ll, 0.03, 0.08);
        feather.translate(ll * 0.44, 0, 0);
        feather.rotateZ(-0.42 - t * 0.22);
        feather.rotateY(side * (1.3 + t * 0.25));
        feather.translate(p.x, p.y - 0.02, 0);
        pieces.push({ geo: feather, color: side > 0 ? leafletColor : 0x4e8a3e });
      }
    }

    for (const { geo, color } of pieces) {
      let g = flat(geo);
      g.rotateY(yaw);
      g.translate(top.x, top.y, top.z);
      leaf.push(colorize(g, color));
    }
  }

  // кокосы под кроной
  const nuts = 3 + Math.floor(rng() * 3);
  for (let i = 0; i < nuts; i++) {
    const a = (i / nuts) * Math.PI * 2 + rng();
    const r = 0.17 + rng() * 0.06;
    piece(leaf, new THREE.IcosahedronGeometry(r, 1), COLORS.coconut,
      [top.x + Math.cos(a) * 0.3, top.y - 0.32 - rng() * 0.2, top.z + Math.sin(a) * 0.3]);
  }

  return { bark: merge(bark), leaf: merge(leaf) };
}

/**
 * Лиственное дерево: корни, сужающийся ствол, ветки и многослойная крона.
 */
export function makeTreeParts(rng) {
  const bark = [];
  const leaf = [];

  const h = 5.6 + rng() * 5.0;
  const leanX = (rng() - 0.5) * 1.1;
  const leanZ = (rng() - 0.5) * 1.1;
  const baseR = 0.42 + rng() * 0.12;
  const topR = 0.16;

  const spine = (t) => new THREE.Vector3(
    leanX * t * t,
    h * t,
    leanZ * t * t
  );

  // ствол — сегментами по кривой
  const segments = 8;
  for (let i = 0; i < segments; i++) {
    const t0 = i / segments;
    const t1 = (i + 1) / segments;
    const a = spine(t0);
    const b = spine(t1);
    const mid = a.clone().add(b).multiplyScalar(0.5);
    const len = a.distanceTo(b) * 1.08;
    // у корней ствол заметно толще — «модельный» силуэт
    const flare = i === 0 ? 1.45 : 1;
    const r0 = (baseR + (topR - baseR) * t0) * flare;
    const r1 = baseR + (topR - baseR) * t1;

    let geo = new THREE.CylinderGeometry(r1, r0, len, 9, 1);
    geo.applyQuaternion(alignQuat(a, b));
    geo.translate(mid.x, mid.y, mid.z);
    geo = flat(geo);
    bark.push(colorize(geo, i % 2 ? COLORS.trunk : 0x6a4c30));
  }

  // корни-подпорки: треугольные «крылья» у основания
  const rootCount = 4 + Math.floor(rng() * 2);
  for (let i = 0; i < rootCount; i++) {
    const a = (i / rootCount) * Math.PI * 2 + rng() * 0.4;
    const root = new THREE.ConeGeometry(0.2 + rng() * 0.08, 1.0 + rng() * 0.3, 5, 1);
    part(bark, root, 0x5d4128,
      Math.cos(a) * 0.42, 0.25, Math.sin(a) * 0.42,
      Math.PI * 0.34, -a, 0);
  }

  // ветки: каждая — два колена, второе короче и тоньше
  const branches = 3 + Math.floor(rng() * 2);
  for (let i = 0; i < branches; i++) {
    const a = (i / branches) * Math.PI * 2 + rng() * 0.7;
    const t = 0.5 + rng() * 0.3;
    const origin = spine(t);
    const bl = 1.3 + rng() * 1.1;
    const dir = new THREE.Vector3(Math.cos(a), 0.55 + rng() * 0.45, Math.sin(a)).normalize();
    const end = origin.clone().addScaledVector(dir, bl);

    let branch = new THREE.CylinderGeometry(0.06, 0.14, bl, 6, 1);
    branch.applyQuaternion(alignQuat(origin, end));
    branch.translate(
      (origin.x + end.x) / 2, (origin.y + end.y) / 2, (origin.z + end.z) / 2
    );
    branch = flat(branch);
    bark.push(colorize(branch, 0x6a4c30));

    // отводок
    const a2 = a + (rng() - 0.5) * 1.4;
    const dir2 = new THREE.Vector3(Math.cos(a2), 0.8, Math.sin(a2)).normalize();
    const end2 = end.clone().addScaledVector(dir2, bl * 0.55);
    let twig = new THREE.CylinderGeometry(0.035, 0.07, bl * 0.6, 5, 1);
    twig.applyQuaternion(alignQuat(end, end2));
    twig.translate((end.x + end2.x) / 2, (end.y + end2.y) / 2, (end.z + end2.z) / 2);
    twig = flat(twig);
    bark.push(colorize(twig, 0x74533a));

    // листва на конце ветки — пучок
    for (let k = 0; k < 2; k++) {
      const r = 0.75 + rng() * 0.6;
      const jitter = new THREE.Vector3(
        (rng() - 0.5) * 0.8, (rng() - 0.5) * 0.5, (rng() - 0.5) * 0.8
      );
      piece(leaf, new THREE.IcosahedronGeometry(r, 1),
        k % 2 ? 0x6a9455 : 0x7ea863,
        [end2.x + jitter.x, end2.y + jitter.y, end2.z + jitter.z]);
    }
  }

  // основная крона: ярусами, крупные шапки сверху
  const layers = 3;
  for (let l = 0; l < layers; l++) {
    const ly = h * (0.72 + l * 0.11);
    const count = 4 - l;
    const rad = 1.5 - l * 0.3;
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2 + l * 0.7 + rng() * 0.5;
      const d = rad * (0.55 + rng() * 0.6);
      const r = (1.25 - l * 0.22) * (0.85 + rng() * 0.45);
      piece(leaf, new THREE.IcosahedronGeometry(r, 1),
        l === 0 ? COLORS.jungle : (i % 2 ? 0x6a9455 : 0x82ac66),
        [Math.cos(a) * d, ly + r * 0.3 + rng() * 0.3, Math.sin(a) * d]);
    }
  }
  // макушка
  piece(leaf, new THREE.IcosahedronGeometry(1.15 + rng() * 0.4, 1), 0x8ab86c,
    [0, h * 1.03, 0]);

  return { bark: merge(bark), leaf: merge(leaf) };
}

/** Куст: несколько веток из земли и рыхлая листва поверх */
export function makeBushParts(rng, withBerries) {
  const bark = [];
  const leaf = [];
  const fruit = [];

  const branches = 3 + Math.floor(rng() * 3);
  const tips = [];
  for (let i = 0; i < branches; i++) {
    const a = (i / branches) * Math.PI * 2 + rng() * 0.8;
    const len = 0.55 + rng() * 0.5;
    const dir = new THREE.Vector3(Math.cos(a) * 0.6, 1, Math.sin(a) * 0.6).normalize();
    const end = dir.clone().multiplyScalar(len);

    let stem = new THREE.CylinderGeometry(0.028, 0.06, len, 5, 1);
    stem.applyQuaternion(alignQuat(new THREE.Vector3(0, 0, 0), end));
    stem.translate(end.x / 2, end.y / 2, end.z / 2);
    stem = flat(stem);
    bark.push(colorize(stem, 0x6a4c30));
    tips.push(end);
  }

  // листва: мелкие шапки на концах веток + общий объём
  for (const tip of tips) {
    const r = 0.3 + rng() * 0.22;
    piece(leaf, new THREE.IcosahedronGeometry(r, 1), rng() > 0.5 ? COLORS.bush : 0x6b9c55,
      [tip.x, tip.y + r * 0.4, tip.z]);
  }
  const n = 3 + Math.floor(rng() * 3);
  for (let i = 0; i < n; i++) {
    const r = 0.34 + rng() * 0.3;
    const a = rng() * Math.PI * 2;
    const d = rng() * 0.5;
    piece(leaf, new THREE.IcosahedronGeometry(r, 1), i % 2 ? COLORS.bush : 0x5f9150,
      [Math.cos(a) * d, 0.42 + rng() * 0.34, Math.sin(a) * d]);
  }

  if (withBerries) {
    for (let i = 0; i < 10; i++) {
      const a = rng() * Math.PI * 2;
      const d = 0.18 + rng() * 0.5;
      piece(fruit, new THREE.IcosahedronGeometry(0.085 + rng() * 0.03, 0), COLORS.berry,
        [Math.cos(a) * d, 0.5 + rng() * 0.45, Math.sin(a) * d]);
    }
  }

  const out = { leaf: merge(leaf) };
  if (bark.length) out.bark = merge(bark);
  if (fruit.length) out.fruit = merge(fruit);
  return out;
}

/**
 * Камни: три разные формы — валун, гранёный обломок и слоистая плита.
 * Возвращаем два слоя: сам камень и мох, который лежит только сверху.
 */
export function makeRockParts(rng, kind = null) {
  const rock = [];
  const moss = [];
  const type = kind || ['boulder', 'boulder', 'slab'][Math.floor(rng() * 3)];

  if (type === 'slab') {
    // плита: плоские гранёные глыбы, лежащие друг на друге
    for (let i = 0; i < 3; i++) {
      const chunk = new THREE.DodecahedronGeometry(0.95 - i * 0.16, 0);
      jitterGeo(chunk, 0.12, rng);
      chunk.scale(1.15, 0.34, 0.95);
      part(rock, chunk, i % 2 ? 0x9d978e : COLORS.stone,
        (rng() - 0.5) * 0.45, 0.22 + i * 0.22, (rng() - 0.5) * 0.4,
        (rng() - 0.5) * 0.12, rng() * 3, (rng() - 0.5) * 0.12);
    }
    const chip = new THREE.DodecahedronGeometry(0.36, 0);
    jitterGeo(chip, 0.06, rng);
    part(rock, chip, COLORS.rockDark, 1.05, 0.1, 0.35, rng(), rng(), 0);
  } else {
    // валун: один крупный цельный объём, немного приплюснутый
    const main = new THREE.DodecahedronGeometry(1, 0);
    jitterGeo(main, 0.09, rng);
    main.scale(1.0 + rng() * 0.25, 0.72 + rng() * 0.12, 0.92 + rng() * 0.2);
    part(rock, main, COLORS.stone, 0, 0, 0, 0, rng() * 3, 0);

    // пара вросших обломков у основания — «сидит в земле»
    for (let i = 0; i < 2; i++) {
      const a = rng() * Math.PI * 2;
      const chip = new THREE.DodecahedronGeometry(0.4 + rng() * 0.16, 0);
      jitterGeo(chip, 0.05, rng);
      part(rock, chip, i ? COLORS.rockDark : 0x9d978e,
        Math.cos(a) * 0.85, -0.32, Math.sin(a) * 0.85, rng() * 0.4, rng() * 3, rng() * 0.4);
    }
  }

  const body = merge(rock);
  body.computeBoundingBox();
  const bb = body.boundingBox;
  const sizeY = bb.max.y - bb.min.y;
  const radius = Math.max(Math.abs(bb.max.x), Math.abs(bb.min.x), Math.abs(bb.max.z), Math.abs(bb.min.z));
  // утапливаем низ в землю, чтобы камень не «левитировал» на склоне
  body.translate(0, -bb.min.y - 0.14, 0);
  body.computeBoundingBox();

  // мох: мелкие пятна только сверху
  const topY = body.boundingBox.max.y;
  const patches = 2 + Math.floor(rng() * 2);
  for (let i = 0; i < patches; i++) {
    const a = rng() * Math.PI * 2;
    const d = rng() * radius * 0.45;
    const r = radius * (0.26 + rng() * 0.14);
    const blob = new THREE.IcosahedronGeometry(r, 1);
    jitterGeo(blob, r * 0.18, rng);
    piece(moss, blob, i % 2 ? 0x6d8f45 : 0x5a7b3a,
      [Math.cos(a) * d, topY - sizeY * (0.12 + rng() * 0.16), Math.sin(a) * d],
      [0, rng() * 3, 0],
      [1, 0.34, 1]);
  }

  return { rock: body, moss: merge(moss) };
}

// ---------- подбираемые вещи ----------

/** Геометрии подбираемых предметов: чуть сложнее одного шарика */
export function makePickupGeometries() {
  const geos = {};

  // пара крест-накрест лежащих палок
  {
    const a = new THREE.CylinderGeometry(0.06, 0.075, 0.9, 5, 1);
    a.rotateZ(Math.PI / 2.1);
    a.translate(0, 0.07, 0);
    const b = new THREE.CylinderGeometry(0.05, 0.065, 0.78, 5, 1);
    b.rotateZ(Math.PI / 2.4);
    b.rotateY(0.9);
    b.translate(0.05, 0.16, 0.05);
    geos.wood = mergeGeometries([colorize(flat(a), 0x9a7a4f), colorize(flat(b), 0x7d6039)], false);
  }

  // горка камней
  {
    const parts = [];
    const big = new THREE.IcosahedronGeometry(0.26, 0);
    big.scale(1, 0.8, 0.9);
    parts.push(colorize(flat(big), 0xa39b90));
    const small = new THREE.IcosahedronGeometry(0.15, 0);
    small.translate(0.24, -0.06, 0.1);
    parts.push(colorize(flat(small), 0x8b8478));
    const small2 = new THREE.IcosahedronGeometry(0.12, 0);
    small2.translate(-0.2, -0.08, -0.12);
    parts.push(colorize(flat(small2), 0x9a958c));
    geos.stone = mergeGeometries(parts, false);
  }

  // кокос с хвостиком
  {
    const nut = new THREE.IcosahedronGeometry(0.23, 1);
    const parts = [colorize(flat(nut), 0x8a5f36)];
    const stem = new THREE.ConeGeometry(0.06, 0.16, 4, 1);
    stem.translate(0, 0.24, 0);
    parts.push(colorize(flat(stem), 0x5d7a3a));
    geos.coconut = mergeGeometries(parts, false);
  }

  // пучок волокна
  {
    const parts = [];
    for (let i = 0; i < 4; i++) {
      const blade = new THREE.ConeGeometry(0.055, 0.62, 3, 1);
      blade.rotateZ((i - 1.5) * 0.16);
      blade.rotateX(i * 0.22);
      blade.translate((i - 1.5) * 0.05, 0.1, 0);
      parts.push(colorize(flat(blade), i % 2 ? 0xa9bb6a : 0x8fa855));
    }
    geos.fiber = mergeGeometries(parts, false);
  }

  // гроздь ягод
  {
    const parts = [];
    const spots = [[0, 0.12, 0], [0.14, 0.06, 0.06], [-0.12, 0.05, -0.07], [0.02, 0.18, -0.12]];
    spots.forEach(([x, y, z], i) => {
      const berry = new THREE.IcosahedronGeometry(0.1, 0);
      berry.translate(x, y, z);
      parts.push(colorize(flat(berry), i % 2 ? 0xc23b52 : 0x9d2740));
    });
    geos.berries = mergeGeometries(parts, false);
  }

  return geos;
}

// ---------- звери ----------
// Каждый зверь — группа с узлами, которые двигает mobs.js.

function mat(hex, { roughness = 0.85, flat = true } = {}) {
  return new THREE.MeshStandardMaterial({ color: hex, roughness, flatShading: flat });
}

function mesh(geo, material, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(geo, material);
  m.position.set(x, y, z);
  m.castShadow = true;
  return m;
}

/** Кабан: тяжёлое тело, клыки, короткие ноги */
export function makeBoar() {
  const group = new THREE.Group();
  const fur = mat(0x8a6b4c);
  const furDark = mat(0x6d5238);
  const tusk = mat(0xe8e0cf, { roughness: 0.5 });

  const body = mesh(new THREE.IcosahedronGeometry(0.62, 1), fur);
  body.scale.set(1.35, 0.9, 0.9);
  body.position.y = 0.82;
  group.add(body);

  const hump = mesh(new THREE.IcosahedronGeometry(0.34, 1), furDark);
  hump.scale.set(1.1, 0.9, 0.9);
  hump.position.set(-0.1, 1.16, 0);
  group.add(hump);

  const head = new THREE.Group();
  head.position.set(0.78, 0.88, 0);
  const skull = mesh(new THREE.IcosahedronGeometry(0.34, 1), fur);
  skull.scale.set(1.1, 0.95, 0.95);
  head.add(skull);
  const snout = mesh(new THREE.CylinderGeometry(0.13, 0.18, 0.3, 6, 1), furDark);
  snout.rotation.z = Math.PI / 2;
  snout.position.set(0.3, -0.05, 0);
  head.add(snout);
  for (const side of [-1, 1]) {
    const t = mesh(new THREE.ConeGeometry(0.045, 0.24, 4, 1), tusk);
    t.position.set(0.3, 0.0, 0.14 * side);
    t.rotation.z = -0.9;
    head.add(t);
    const ear = mesh(new THREE.ConeGeometry(0.1, 0.16, 4, 1), furDark);
    ear.position.set(-0.1, 0.3, 0.18 * side);
    ear.rotation.x = 0.3 * side;
    head.add(ear);
  }
  group.add(head);

  const legs = [];
  for (const [x, z] of [[0.36, 0.28], [0.36, -0.28], [-0.38, 0.28], [-0.38, -0.28]]) {
    const leg = mesh(new THREE.CylinderGeometry(0.09, 0.07, 0.55, 5, 1), furDark);
    leg.position.set(x, 0.28, z);
    leg.geometry.translate(0, -0.27, 0);
    group.add(leg);
    legs.push(leg);
  }

  const tail = mesh(new THREE.CylinderGeometry(0.03, 0.05, 0.4, 4, 1), furDark);
  tail.position.set(-0.85, 0.95, 0);
  tail.rotation.z = 0.5;
  group.add(tail);

  return { group, parts: { body, head, legs, tail } };
}

/** Краб: панцирь, клешни, восемь ног на «шарнирах» */
export function makeCrab() {
  const group = new THREE.Group();
  const shell = mat(0xb2402f, { roughness: 0.6 });
  const shellLight = mat(0xd0553c, { roughness: 0.6 });
  const clawMat = mat(0xc94a34, { roughness: 0.55 });

  const body = mesh(new THREE.IcosahedronGeometry(0.34, 1), shell);
  body.scale.set(1.4, 0.6, 1);
  body.position.y = 0.32;
  group.add(body);

  const back = mesh(new THREE.IcosahedronGeometry(0.2, 0), shellLight);
  back.scale.set(1.6, 0.4, 1);
  back.position.y = 0.42;
  group.add(back);

  const legs = [];
  for (const side of [-1, 1]) {
    for (let i = 0; i < 4; i++) {
      const leg = new THREE.Group();
      leg.position.set(0.28 - i * 0.2, 0.28, 0.22 * side);
      const seg = mesh(new THREE.CylinderGeometry(0.034, 0.026, 0.42, 4, 1), shell);
      seg.geometry.translate(0, -0.17, 0);
      seg.rotation.x = 0.7 * side;
      leg.add(seg);
      group.add(leg);
      legs.push(leg);
    }
  }

  const claws = [];
  for (const side of [-1, 1]) {
    const arm = new THREE.Group();
    arm.position.set(0.4, 0.32, 0.24 * side);
    const upper = mesh(new THREE.CylinderGeometry(0.035, 0.03, 0.2, 4, 1), clawMat);
    upper.rotation.z = 1.1;
    upper.position.set(0.08, 0.02, 0.04 * side);
    arm.add(upper);
    const claw = mesh(new THREE.IcosahedronGeometry(0.12, 0), clawMat);
    claw.scale.set(1.5, 0.9, 1);
    claw.position.set(0.2, 0.02, 0.06 * side);
    arm.add(claw);
    group.add(arm);
    claws.push(arm);
  }

  const eyes = new THREE.Group();
  for (const side of [-1, 1]) {
    const stalk = mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.14, 4, 1), shell);
    stalk.position.set(0.16, 0.52, 0.12 * side);
    eyes.add(stalk);
    const eye = mesh(new THREE.IcosahedronGeometry(0.05, 0), mat(0x1c1c22, { roughness: 0.3 }));
    eye.position.set(0.16, 0.62, 0.12 * side);
    eyes.add(eye);
  }
  group.add(eyes);

  return { group, parts: { body, legs, claws, eyes } };
}

/** Чайка: белое тело, длинные крылья, оранжевый клюв */
export function makeGull() {
  const group = new THREE.Group();
  const white = mat(0xf0f1ec, { roughness: 0.7 });
  const grey = mat(0xbcc4c9, { roughness: 0.75 });
  const beakMat = mat(0xdd8a2f, { roughness: 0.5 });

  const body = mesh(new THREE.IcosahedronGeometry(0.26, 1), white);
  body.scale.set(1.5, 0.85, 0.85);
  group.add(body);

  const head = new THREE.Group();
  head.position.set(0.28, 0.08, 0);
  const skull = mesh(new THREE.IcosahedronGeometry(0.13, 1), white);
  head.add(skull);
  const beak = mesh(new THREE.ConeGeometry(0.04, 0.16, 4, 1), beakMat);
  beak.rotation.z = -Math.PI / 2;
  beak.position.set(0.15, 0, 0);
  head.add(beak);
  group.add(head);

  const wings = [];
  for (const side of [-1, 1]) {
    const wing = new THREE.Group();
    wing.position.set(0, 0.06, 0.1 * side);
    const feather = mesh(new THREE.BoxGeometry(0.34, 0.03, 0.52), grey);
    feather.position.set(0, 0, 0.26 * side);
    wing.add(feather);
    const tip = mesh(new THREE.BoxGeometry(0.22, 0.025, 0.3), white);
    tip.position.set(-0.06, 0, 0.55 * side);
    wing.add(tip);
    group.add(wing);
    wings.push(wing);
  }

  const tail = mesh(new THREE.BoxGeometry(0.22, 0.02, 0.16), grey);
  tail.position.set(-0.34, 0.02, 0);
  group.add(tail);

  return { group, parts: { body, head, wings, tail } };
}

/** Змея: цепочка сегментов, которая извивается */
export function makeSnake() {
  const group = new THREE.Group();
  const skinMat = mat(0x5f7a3a, { roughness: 0.7 });
  const bellyMat = mat(0xa8b06a, { roughness: 0.7 });

  const segments = [];
  for (let i = 0; i < 7; i++) {
    const seg = new THREE.Group();
    seg.position.set(-i * 0.13, 0.09, 0);
    const r = 0.115 - i * 0.011;
    const ball = mesh(new THREE.IcosahedronGeometry(r, 1), skinMat);
    ball.scale.set(1.5, 0.82, 0.95);
    seg.add(ball);
    if (i % 2 === 0) {
      const stripe = mesh(new THREE.IcosahedronGeometry(r * 0.62, 0), bellyMat);
      stripe.scale.set(1.1, 0.5, 1.05);
      stripe.position.y = -0.045;
      seg.add(stripe);
    }
    group.add(seg);
    segments.push(seg);
  }

  const head = new THREE.Group();
  head.position.set(0.2, 0.12, 0);
  const skull = mesh(new THREE.IcosahedronGeometry(0.12, 0), skinMat);
  skull.scale.set(1.4, 0.8, 1);
  head.add(skull);
  const tongue = mesh(new THREE.BoxGeometry(0.12, 0.01, 0.02), mat(0xc2354b, { roughness: 0.5 }));
  tongue.position.set(0.16, -0.01, 0);
  head.add(tongue);
  group.add(head);

  return { group, parts: { segments, head, tongue } };
}
