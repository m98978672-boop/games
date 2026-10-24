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

  const h = 6.4 + rng() * 3.6;
  const lean = (rng() - 0.5) * 0.75;
  const top = trunkPart(bark, rng, h, 0.38, 0.19, COLORS.trunk, 0x6a4c30, lean, 8);

  // кольца на стволе — плоские диски чуть шире ствола
  for (let i = 1; i < 6; i++) {
    const t = i / 6;
    const r = 0.38 + (0.19 - 0.38) * t;
    const ring = new THREE.CylinderGeometry(r + 0.012, r + 0.022, 0.05, 8, 1);
    part(bark, ring, 0x5c412a,
      Math.sin(lean * t) * h * 0.55, h * t, Math.cos(lean * 0.7 * t) * h * 0.12);
  }

  // крона: 11 листьев-«перьев», поникающих к концам
  const fronds = 11;
  for (let i = 0; i < fronds; i++) {
    const a = (i / fronds) * Math.PI * 2 + rng() * 0.25;
    const len = 2.6 + rng() * 1.7;
    const droop = 0.42 + rng() * 0.38;
    let px = top.x;
    let pz = top.z;
    let py = top.y;

    for (let s = 0; s < 4; s++) {
      const t0 = s / 4;
      const t1 = (s + 1) / 4;
      const w = (0.34 - t0 * 0.24) * (1 + rng() * 0.15);
      const segLen = len / 4;
      const geo = new THREE.BoxGeometry(w, 0.055, segLen * 1.12);
      const dx = Math.cos(a) * segLen * (1 - t0 * 0.35);
      const dz = Math.sin(a) * segLen * (1 - t0 * 0.35);
      const drop = droop * t1 * t1;
      part(leaf, geo, s % 2 ? COLORS.frond : COLORS.frondLight,
        px + dx * 0.5, py - drop * 0.5, pz + dz * 0.5,
        drop * 0.9, -a + Math.PI / 2, 0);
      px += dx;
      pz += dz;
      py -= drop;
    }
  }

  // кокосы под кроной
  const nuts = 3 + Math.floor(rng() * 3);
  for (let i = 0; i < nuts; i++) {
    const a = (i / nuts) * Math.PI * 2;
    part(leaf, new THREE.IcosahedronGeometry(0.2 + rng() * 0.06, 0), COLORS.coconut,
      top.x + Math.cos(a) * 0.34, top.y - 0.42 - rng() * 0.12, top.z + Math.sin(a) * 0.34);
  }

  return { bark: merge(bark), leaf: merge(leaf) };
}

/**
 * Лиственное дерево: корни, сужающийся ствол, ветки и многослойная крона.
 */
export function makeTreeParts(rng) {
  const bark = [];
  const leaf = [];

  const h = 5.2 + rng() * 5.2;
  const bend = (rng() - 0.5) * 0.5;
  const top = trunkPart(bark, rng, h, 0.48, 0.2, COLORS.trunk, 0x6a4c30, bend, 9);

  // корни-подпорки
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + rng() * 0.4;
    const root = new THREE.ConeGeometry(0.18, 0.85, 5, 1);
    part(bark, root, 0x5d4128,
      Math.cos(a) * 0.34, 0.34, Math.sin(a) * 0.34,
      Math.PI * 0.32, 0, -a);
  }

  // ветки
  const branches = 3 + Math.floor(rng() * 2);
  for (let i = 0; i < branches; i++) {
    const a = (i / branches) * Math.PI * 2 + rng();
    const bl = 1.1 + rng() * 1.0;
    const y = h * (0.52 + rng() * 0.22);
    const branch = new THREE.CylinderGeometry(0.07, 0.15, bl, 5, 1);
    part(bark, branch, 0x6a4c30,
      top.x * 0.7 + Math.cos(a) * bl * 0.42, y + bl * 0.3, top.z * 0.7 + Math.sin(a) * bl * 0.42,
      0, 0, 0.95);
  }

  // крона: тёмная «подложка» + светлые шапки сверху
  const blobs = 6 + Math.floor(rng() * 3);
  for (let i = 0; i < blobs; i++) {
    const r = 1.15 + rng() * 1.05;
    const a = rng() * Math.PI * 2;
    const d = rng() * 1.35;
    const geo = new THREE.IcosahedronGeometry(r, 1);
    part(leaf, geo, i % 3 === 0 ? COLORS.jungle : (i % 2 ? 0x6a9455 : 0x7ea863),
      top.x * 0.8 + Math.cos(a) * d,
      h * 0.9 + r * 0.5 + rng() * 1.9,
      top.z * 0.8 + Math.sin(a) * d);
  }

  return { bark: merge(bark), leaf: merge(leaf) };
}

/** Куст: рыхлая шапка листвы, ягоды — отдельным слоем */
export function makeBushParts(rng, withBerries) {
  const leaf = [];
  const fruit = [];

  const n = 5 + Math.floor(rng() * 3);
  for (let i = 0; i < n; i++) {
    const r = 0.36 + rng() * 0.42;
    part(leaf, new THREE.IcosahedronGeometry(r, 1),
      i % 2 ? COLORS.bush : 0x5f9150,
      (rng() - 0.5) * 1.05, r * 0.62 + rng() * 0.3, (rng() - 0.5) * 1.05);
  }
  // пара тонких веточек
  for (let i = 0; i < 2; i++) {
    const a = rng() * Math.PI * 2;
    part(leaf, new THREE.CylinderGeometry(0.03, 0.05, 0.7, 4, 1), 0x6a4c30,
      Math.cos(a) * 0.2, 0.35, Math.sin(a) * 0.2, 0.25, 0, 0.2);
  }

  if (withBerries) {
    for (let i = 0; i < 9; i++) {
      part(fruit, new THREE.IcosahedronGeometry(0.085 + rng() * 0.03, 0), COLORS.berry,
        (rng() - 0.5) * 1.15, 0.45 + rng() * 0.7, (rng() - 0.5) * 1.15);
    }
  }

  const out = { leaf: merge(leaf) };
  if (fruit.length) out.fruit = merge(fruit);
  return out;
}

/** Валун: крупный обломок со сколами и мшистой шапкой */
export function makeRockGeometry(rng) {
  const parts = [];
  const main = new THREE.IcosahedronGeometry(1, 1);
  jitterGeo(main, 0.34, rng);
  main.scale(1.05, 0.72, 0.95);
  part(parts, main, COLORS.stone, 0, 0.42, 0);

  for (let i = 0; i < 2; i++) {
    const frag = new THREE.IcosahedronGeometry(0.3 + rng() * 0.22, 0);
    jitterGeo(frag, 0.16, rng);
    const a = rng() * Math.PI * 2;
    part(parts, frag, COLORS.rockDark,
      Math.cos(a) * 0.95, 0.16, Math.sin(a) * 0.95);
  }

  // мох
  for (let i = 0; i < 2; i++) {
    const moss = new THREE.IcosahedronGeometry(0.34 + rng() * 0.2, 0);
    moss.scale(1, 0.34, 1);
    part(parts, moss, 0x6f8f4a, (rng() - 0.5) * 0.7, 0.85 + rng() * 0.1, (rng() - 0.5) * 0.7);
  }

  return merge(parts);
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
