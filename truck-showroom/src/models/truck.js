// ============================================================
// ТЯГАЧИ: параметрическая кабина, шасси, колёса и салон.
// Один конструктор собирает все 10 моделей; отличия — в стиле
// кабины (евро / капотник / футуризм / низкопольный), крыше,
// цвете и обвесе. Нос — в −Z, пол кабины ≈ 1,15 м.
// ============================================================
import * as THREE from 'three';
import {
  HALF, PI, TAU, box, rbox, cyl, sphere, torus, plane, mesh, group, pipe,
  wheel as makeWheel, mirror, labelTexture, plateTexture, brandDecalMaterial, accentLine, clamp, rad,
} from '../lib/kit.js';
import { mountDamageSet } from '../lib/damage.js';

const FLOOR = 1.18; // пол кабины над землёй

function paintFor(M, color, opts = {}) {
  return M.paint(color, opts);
}

/** Крыло: полуцилиндрический кожух над колесом, наружный обод по кромке,
 *  внутренний подкрылок и задний грязевой щиток с кронштейном. Один узел и
 *  для передних колёс, и для сдвоенных задних (там кожух шире и накрывает
 *  оба колеса). */
function fender(M, mat, r, width, x, y, z, side, opts = {}) {
  const { flap = true, lip = true } = opts;
  const g = new THREE.Group();
  // кожух арки
  const shellMat = mat.clone ? mat.clone() : mat;
  shellMat.side = THREE.DoubleSide;
  const shell = new THREE.Mesh(new THREE.CylinderGeometry(r, r, width, 26, 1, true, 0, PI), shellMat);
  shell.rotation.z = HALF;
  g.add(shell);
  // внутренний подкрылок: закрывает просвет между шиной и кожухом
  const innerMat = M.rubberTrim.clone ? M.rubberTrim.clone() : M.rubberTrim;
  innerMat.side = THREE.DoubleSide;
  const inner = new THREE.Mesh(new THREE.CylinderGeometry(r - 0.045, r - 0.045, width * 0.92, 22, 1, true, 0, PI), innerMat);
  inner.rotation.z = HALF;
  g.add(inner);
  // наружный обод: крыло читается объёмом, а не тонкой линией
  if (lip) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(r + 0.005, 0.028, 7, 30, PI), mat);
    ring.rotation.y = side > 0 ? -HALF : HALF;
    ring.position.x = side * (width / 2 - 0.01);
    g.add(ring);
  }
  // задний грязевой щиток на кронштейне.
  // Раньше щиток был повёрнут на 90°: тонкая грань смотрела назад, а широкое
  // полотно — вбок, и за колесом торчала «лопата». Щиток должен быть широким
  // ПОПЕРЁК колеса (ось X) и висеть позади покрышки, от кромки арки до земли.
  if (flap) {
    const h = Math.max(0.4, r * 1.05);
    const flapMesh = new THREE.Mesh(new THREE.BoxGeometry(width * 0.92, h, 0.032), M.rubberTrim);
    flapMesh.position.set(0, 0.02 - h / 2, r + 0.055);
    g.add(flapMesh);
    // кронштейн: короткая поперечная планка под кромкой арки
    const bar = new THREE.Mesh(new THREE.BoxGeometry(width * 0.9, 0.045, 0.05), M.darkSteel);
    bar.position.set(0, 0.055, r + 0.02);
    g.add(bar);
  }
  g.position.set(x, y, z);
  return g;
}

export function buildTruck(unit, M) {
  const root = group(null, `truck:${unit.id}`);
  const wheels = [];
  const paintMats = [];
  const anchors = [];
  const blinkers = [];

  const W = unit.wheel || { radius: 0.535, width: 0.42, rimColor: '#d9dde0' };
  const R = W.radius;
  const style = unit.style || 'euro';
  const roofType = unit.roof || 'high';
  const isBonnet = style === 'bonnet';
  const isFuturistic = style === 'futuristic';
  const isLowEntry = style === 'lowentry';
  // кабины сидели слишком высоко: убираем по 12 см от заводской высоты
  const cabH = (unit.cabHeight ?? 3.55) - 0.12;
  const L = unit.length ?? 6.2;
  const CHROME = unit.chrome !== false;
  const HALF_W = 1.27;

  const paint = paintFor(M, unit.paint);
  const paint2 = paintFor(M, unit.paint, { roughness: 0.4, metalness: 0.35 });
  const accent = M.accent(unit.accent || '#e8b45a');
  paintMats.push(paint, paint2, accent);

  // ---------------------------------------------- базовая геометрия
  const frontZ = -L / 2;
  const rearEnd = L / 2;
  const hoodLen = isBonnet ? (unit.bonnet ?? 2.1) : 0;
  const cabFront = frontZ + (isBonnet ? 0.55 + hoodLen : 0.28);
  const cabDepth = clamp((roofType === 'mega' ? 2.75 : 2.35) + (isBonnet ? -0.1 : 0), 1.9, 2.95);
  const cabRear = cabFront + cabDepth;
  const cabW = 2.5;
  const floorY = isLowEntry ? 0.85 : FLOOR;
  const roofY = Math.max(cabH, floorY + 1.55);
  const frontAxle = cabFront + (isLowEntry ? 0.75 : 1.25);
  const rearAxle2 = rearEnd - 0.55;
  const rearAxle1 = rearAxle2 - (unit.heavy ? 1.45 : 1.32);
  const rearAxle3 = unit.heavy ? rearAxle2 + 1.35 : null;
  const frameY = 1.02;
  const fifthWheelZ = (rearAxle1 + rearAxle2) / 2 - 0.62;
  const wheelsRear = [rearAxle1, rearAxle2, rearAxle3].filter((v) => v != null && v < rearEnd + 0.1);

  // ---------------------------------------------- шасси
  const chassis = group(root, 'chassis');
  const railMat = M.darkSteel;
  for (const x of [-0.48, 0.48]) {
    box(chassis, 0.12, 0.28, rearEnd - frontZ - 0.35, railMat, x, frameY, (frontZ + rearEnd) / 2 + 0.1);
  }
  for (let z = frontZ + 1.1; z < rearEnd - 0.2; z += 0.85) {
    box(chassis, 0.95, 0.16, 0.1, railMat, 0, frameY - 0.02, z);
  }
  // задняя поперечина и буксирный узел
  box(chassis, 1.05, 0.22, 0.16, M.darkSteel, 0, frameY - 0.02, rearEnd - 0.15);

  // топливные баки вдоль рамы (слева и справа)
  const tankMat = CHROME ? M.tank : M.plasticGray;
  const tankR = 0.31;
  const tankLen = clamp(L * 0.32, 0.9, 1.7);
  const tankZ = frontZ + 2.1 + tankLen / 2;
  for (const side of [-1, 1]) {
    const tank = cyl(chassis, tankR, tankR, tankLen, tankMat, side * 0.92, 0.72, tankZ, 22);
    tank.rotation.x = HALF;
    const strap = torus(chassis, tankR + 0.012, 0.025, M.darkSteel, side * 0.92, 0.72, tankZ, 20);
    strap.rotation.y = HALF;
    // крышка бака
    const cap = cyl(chassis, 0.09, 0.09, 0.05, M.chromeDark, side * 0.92, 0.72, tankZ + tankLen / 2 - 0.16, 12);
    cap.rotation.x = HALF;
    anchors.push({ pos: [side * 1.22, 0.9, tankZ], label: 'Топливный бак', side: `${side > 0 ? 'справа' : 'слева'}` });
  }
  // аккумуляторный ящик + воздушные баллоны
  rbox(chassis, 0.52, 0.36, 0.62, M.plasticGray, -0.92, 0.72, tankZ - tankLen / 2 - 0.55);
  cyl(chassis, 0.16, 0.16, 0.62, M.chromeDark, 0.9, 0.62, tankZ - tankLen / 2 - 0.6, 14).rotation.x = HALF;

  // ---------------------------------------------- колёса
  const tireMat = M.rubber;
  function addWheel(x, z, opts = {}) {
    const w = makeWheel(M, {
      radius: R,
      width: opts.width ?? W.width,
      style: 'truck',
      rimColor: opts.rimColor ?? W.rimColor,
      tread: tireMat,
    });
    w.position.set(x, R, z);
    if (opts.flip) w.rotation.y = PI;
    root.add(w);
    wheels.push(w);
    return w;
  }
  const frontTrack = 0.98;
  for (const side of [-1, 1]) addWheel(side * frontTrack, frontAxle, { flip: side < 0, width: W.width });
  for (const z of wheelsRear) {
    for (const side of [-1, 1]) {
      addWheel(side * 0.74, z, { width: 0.32, flip: side < 0 });
      addWheel(side * 1.09, z, { width: 0.32, flip: side < 0 });
    }
  }
  if (!unit.thirdAxle && wheelsRear.length > 2) wheelsRear.length = 2;

  // крылья над колёсами: спереди — по ширине шины, сзади — общий кожух на
  // сдвоенные колёса (две арки перекрываются и читаются одним крылом)
  for (const side of [-1, 1]) {
    const f = fender(M, M.plasticGray, R + 0.065, 0.6, side * frontTrack, R + 0.02, frontAxle, side);
    f.visible = unit.fenders !== false;
    root.add(f);
    wheelsRear.forEach((z, i) => {
      // кожух на сдвоенные колёса: ширина ровно по паре шин (раньше был
      // 1,08 м — крыло торчало за борт на 20 см и «парило» над колесом)
      const rf = fender(M, M.plasticGray, R + 0.075, 0.8, side * 0.92, R + 0.02, z, side, {
        flap: i === wheelsRear.length - 1,
      });
      rf.visible = unit.fenders !== false;
      root.add(rf);
    });
  }

  // ---------------------------------------------- кабина
  const cab = group(root, 'cab');
  const winBottom = floorY + 0.72;
  const winTop = Math.min(roofY - 0.4, floorY + 1.58);
  const cabRearZ = isBonnet ? cabRear : cabRear;
  const frontSlant = isFuturistic ? 0.42 : isLowEntry ? 0.1 : 0.22;

  // боковые панели: низ, верх, стойки
  for (const side of [-1, 1]) {
    const x = side * (HALF_W - 0.06);
    rbox(cab, 0.12, winBottom - floorY, cabDepth - 0.1, paint, x, (floorY + winBottom) / 2, (cabFront + cabRearZ) / 2, 0.045);
    rbox(cab, 0.12, Math.max(0.2, roofY - winTop - 0.02), cabDepth - 0.1, paint, x, (winTop + roofY) / 2 + 0.01, (cabFront + cabRearZ) / 2, 0.045);
    // A-стойка
    rbox(cab, 0.13, winTop - winBottom, 0.17, paint, x, (winTop + winBottom) / 2, cabFront + 0.12, 0.04);
    // B-стойка
    rbox(cab, 0.13, winTop - winBottom, 0.13, M.plastic, x, (winTop + winBottom) / 2, cabRearZ - 0.12, 0.04);
    // акцентная полоса по борту + хром-кант: общий приём оформления
    accentLine(cab, {
      length: cabDepth * 0.82, height: 0.075, depth: 0.02,
      x: side * (HALF_W + 0.012), y: winBottom + 0.16, z: (cabFront + cabRearZ) / 2 + 0.02,
      accentMat: accent, chromeMat: M.chromeDark,
    });
    // фирменная надпись на двери — та же, что на решётке и на прицепах
    const doorBadge = brandDecalMaterial(unit, { width: 512, height: 128 });
    if (doorBadge) {
      const p = plane(cab, 0.56, 0.14, doorBadge, side * (HALF_W + 0.022), winBottom - 0.5, cabFront + 1.28);
      p.rotation.y = side > 0 ? HALF : -HALF;
    }
    // дверная ручка
    const handle = rbox(cab, 0.05, 0.06, 0.22, CHROME ? M.chrome : M.plasticGray, side * (HALF_W + 0.02), winBottom - 0.2, cabFront + 1.05, 0.02);
    anchors.push({ pos: [side * (HALF_W + 0.05), winBottom - 0.2, cabFront + 1.05], label: 'Дверь кабины', side: side > 0 ? 'справа' : 'слева' });
  }

  // задняя стенка (с окном для спальника, если кабина высокая)
  rbox(cab, cabW - 0.12, roofY - floorY - 0.04, 0.1, paint, 0, (floorY + roofY) / 2, cabRearZ - 0.02, 0.04);
  if (roofType === 'high' || roofType === 'mega') {
    box(cab, 0.92, 0.5, 0.03, M.glassDark, 0, roofY - 0.62, cabRearZ - 0.08);
  }
  // рёбра жёсткости на задней стенке
  for (const x of [-0.9, -0.3, 0.3, 0.9]) {
    box(cab, 0.04, roofY - floorY - 0.28, 0.05, M.plastic, x, (floorY + roofY) / 2 + 0.04, cabRearZ - 0.09);
  }

  // пол и крыша
  rbox(cab, cabW - 0.1, 0.14, cabDepth, M.plastic, 0, floorY - 0.07, (cabFront + cabRearZ) / 2, 0.04);
  rbox(cab, cabW - 0.04, 0.16, cabDepth - 0.02, paint, 0, roofY + 0.02, (cabFront + cabRearZ) / 2, 0.06);
  // скос крыши спереди
  rbox(cab, cabW - 0.3, 0.12, 0.5, paint, 0, roofY - 0.12, cabFront + 0.16, 0.06);

  // лобовая часть: под стеклом и над стеклом
  const wsBottom = winBottom - 0.12;
  const wsTop = winTop + 0.06;
  const wsFrontZ = cabFront + 0.06;
  rbox(cab, cabW - 0.14, wsBottom - floorY, 0.14, paint, 0, (floorY + wsBottom) / 2, wsFrontZ, 0.05);
  rbox(cab, cabW - 0.14, Math.max(0.12, roofY - wsTop), 0.2, paint, 0, (wsTop + roofY) / 2, wsFrontZ + 0.05, 0.06);
  // лобовое стекло под наклоном
  const wsH = Math.max(0.5, wsTop - wsBottom);
  const ws = plane(cab, cabW - 0.26, wsH, M.glass, 0, (wsBottom + wsTop) / 2, wsFrontZ + 0.03);
  ws.rotation.x = -0.05;
  // боковые окна
  for (const side of [-1, 1]) {
    const sw = plane(cab, cabDepth - 0.42, winTop - winBottom, M.glass, side * (HALF_W - 0.005), (winBottom + winTop) / 2, (cabFront + cabRearZ) / 2 - 0.02);
    sw.rotation.y = side > 0 ? -HALF : HALF;
  }
  // зеркала или камеры
  for (const side of [-1, 1]) {
    if (isFuturistic) {
      const pod = rbox(cab, 0.12, 0.1, 0.22, M.plastic, side * 1.34, winTop - 0.02, cabFront + 0.24, 0.03);
      const lens = box(cab, 0.02, 0.07, 0.12, M.glassDark, side * 1.41, winTop - 0.02, cabFront + 0.24);
      const arm = box(cab, 0.12, 0.06, 0.06, M.plastic, side * 1.29, winTop - 0.02, cabFront + 0.2);
      anchors.push({ pos: [side * 1.42, winTop, cabFront + 0.24], label: 'Камера обзора' });
      continue;
    }
    const armTop = box(cab, 0.34, 0.06, 0.06, CHROME ? M.chrome : M.plastic, side * (HALF_W + 0.16), winTop + 0.12, cabFront + 0.16);
    const armBot = box(cab, 0.28, 0.05, 0.05, CHROME ? M.chrome : M.plastic, side * (HALF_W + 0.14), winBottom + 0.2, cabFront + 0.16);
    const housing = rbox(cab, 0.13, 0.72, 0.24, M.plastic, side * (HALF_W + 0.36), winTop - 0.18, cabFront + 0.16, 0.04);
    box(cab, 0.02, 0.56, 0.18, M.mirror, side * (HALF_W + 0.43), winTop - 0.18, cabFront + 0.16);
    box(cab, 0.015, 0.16, 0.16, M.glassDark, side * (HALF_W + 0.425), winBottom + 0.06, cabFront + 0.16);
    anchors.push({ pos: [side * (HALF_W + 0.45), winTop, cabFront + 0.16], label: 'Зеркало', side: side > 0 ? 'справа' : 'слева' });
  }

  // ---------------------------------------------- нос: маска, решётка, свет, бампер
  const front = group(root, 'front');
  const faceZ = isBonnet ? frontZ + 0.28 : cabFront - 0.1; // наружная плоскость передка
  const grilleMat = M.chromeDark;
  const lampY = floorY + 0.56;
  const plaqueMat = (() => {
    const tex = labelTexture(unit.brand, {
      width: 512, height: 160, bg: '#14181c', fg: '#f4efe3', accent: unit.accent || '#e8b45a',
      font: 'bold 72px Arial, sans-serif', border: false,
    });
    return tex ? new THREE.MeshStandardMaterial({ map: tex, roughness: 0.4, metalness: 0.2, side: THREE.DoubleSide }) : M.chromeDark;
  })();

  /** Решётка радиатора: объёмная рамка из четырёх брусков, тёмная глубина, ламели. */
  function grille(cx, cy, w, h, z, slats = 4) {
    const t = 0.055;
    box(front, w, t, 0.08, grilleMat, cx, cy + h / 2 - t / 2, z);
    box(front, w, t, 0.08, grilleMat, cx, cy - h / 2 + t / 2, z);
    box(front, t, h, 0.08, grilleMat, cx - w / 2 + t / 2, cy, z);
    box(front, t, h, 0.08, grilleMat, cx + w / 2 - t / 2, cy, z);
    box(front, w - 2 * t, h - 2 * t, 0.05, M.plastic, cx, cy, z + 0.03);
    const span = h - 2 * t - 0.07;
    for (let i = 0; i < slats; i++) {
      const y = cy + span / 2 - (slats === 1 ? 0 : (i * span) / (slats - 1));
      box(front, w - 2 * t - 0.03, 0.026, 0.03, grilleMat, cx, y, z - 0.025);
    }
  }

  /** Фара в нише: тёмная ниша, хром-отражатель, линзы и ходовая полоса. */
  function headlamp(x, y, z, w = 0.46, h = 0.32) {
    // ниша в маске + тёмный корпус
    rbox(front, w + 0.06, h + 0.06, 0.05, M.rubberTrim, x, y, z + 0.03, 0.02);
    rbox(front, w, h, 0.04, M.plastic, x, y, z - 0.005, 0.02);
    // горизонтальный блок: две линзы-секции, хром-обод и дневная полоса
    rbox(front, w * 0.88, h * 0.5, 0.03, M.headlight, x, y + h * 0.06, z - 0.035, 0.01);
    box(front, 0.018, h * 0.46, 0.02, M.chromeDark, x, y + h * 0.06, z - 0.052);
    box(front, w * 0.9, 0.016, 0.016, M.chromeDark, x, y + h * 0.32, z - 0.05);
    box(front, w * 0.72, 0.02, 0.018, M.headlight, x, y - h * 0.36, z - 0.042);
    const blink = box(front, w * 0.62, 0.035, 0.02, M.amber, x, y - h * 0.44, z - 0.045);
    blinkers.push(blink);
  }

  if (isBonnet) {
    // капот
    const hood = rbox(front, 2.2, 0.95, hoodLen, paint, 0, floorY + 0.48, frontZ + 0.28 + hoodLen / 2, 0.16);
    hood.geometry.dispose?.();
    rbox(front, 2.14, 0.55, 0.9, paint, 0, floorY + 0.92, cabFront - 0.42, 0.18);
    // решётка и эмблема на передке капота
    grille(0, floorY + 0.5, 1.06, 0.52, faceZ - 0.1, 4);
    plane(front, 0.5, 0.15, plaqueMat, 0, floorY + 0.86, faceZ - 0.12);
    // фары по краям капота
    for (const side of [-1, 1]) headlamp(side * 0.86, lampY, faceZ - 0.05, 0.4, 0.28);
    // выхлопные трубы
    for (const side of [-1, 1]) {
      cyl(front, 0.075, 0.085, 2.3, M.chrome, side * 1.16, floorY + 1.35, cabFront - 0.55, 14);
      cyl(front, 0.09, 0.075, 0.18, M.chromeDark, side * 1.16, floorY + 2.52, cabFront - 0.55, 14);
      box(front, 0.03, 1.5, 0.28, M.chromeDark, side * 1.16, floorY + 0.75, cabFront - 0.55);
    }
  } else {
    // маска на всю ширину передка
    rbox(front, 2.36, 0.78, 0.12, isFuturistic ? M.plasticGray : M.plastic, 0, floorY + 0.38, faceZ - 0.02, 0.05);
    box(front, 2.34, 0.03, 0.04, M.chrome, 0, floorY + 0.76, faceZ - 0.09);
    box(front, 2.34, 0.025, 0.03, M.rubberTrim, 0, floorY + 0.02, faceZ - 0.08);
    if (isFuturistic) {
      // светящаяся полоса и фары-поды
      box(front, 2.2, 0.2, 0.02, accent, 0, floorY + 0.62, faceZ - 0.1);
      box(front, 2.16, 0.075, 0.03, M.headlight, 0, floorY + 0.62, faceZ - 0.115);
      for (const side of [-1, 1]) {
        rbox(front, 0.5, 0.2, 0.08, M.glassDark, side * 0.8, floorY + 0.28, faceZ - 0.08, 0.05);
        const lamp = cyl(front, 0.06, 0.06, 0.03, M.headlight, side * 0.8, floorY + 0.28, faceZ - 0.125, 18);
        lamp.rotation.x = HALF;
        const blink = box(front, 0.34, 0.04, 0.02, M.amber, side * 0.8, floorY + 0.17, faceZ - 0.12);
        blinkers.push(blink);
      }
      const emblem = cyl(front, 0.13, 0.13, 0.03, M.chrome, 0, floorY + 0.38, faceZ - 0.125, 20);
      emblem.rotation.x = HALF;
    } else {
      // решётка по центру + крупные фары в нишах по краям
      grille(0, floorY + 0.3, 1.26, 0.44, faceZ - 0.1, 4);
      plane(front, 0.52, 0.16, plaqueMat, 0, floorY + 0.63, faceZ - 0.11);
      for (const side of [-1, 1]) headlamp(side * 0.87, lampY, faceZ - 0.05);
    }
  }

  // ---------------------------------------------- бампер и нижний обвес
  const bumperZ = frontZ + 0.2; // передняя плоскость балки = frontZ
  const beamY = 0.88; // верх балки 1.10 — прямо под полом кабины
  const bumpMat = unit.chromeBumper ? M.chrome : paint;
  const skirtZ = isBonnet ? frontZ + 0.3 : cabFront - 0.02;
  // юбка от пола кабины/капота до бампера — закрывает зазор
  rbox(front, 2.3, 0.46, 0.3, paint, 0, floorY - 0.16, skirtZ, 0.05);
  // балка бампера
  rbox(front, 2.46, 0.44, 0.4, bumpMat, 0, beamY, bumperZ, 0.09);
  // передняя панель бампера: номер, хром, резиновый молдинг
  rbox(front, 0.62, 0.22, 0.03, M.plastic, 0, beamY + 0.02, bumperZ - 0.19, 0.01);
  plane(front, 0.52, 0.13, new THREE.MeshStandardMaterial({ map: plateTexture('А 001 ТС'), roughness: 0.5, metalness: 0.1 }), 0, beamY + 0.02, bumperZ - 0.21);
  box(front, 2.3, 0.05, 0.02, M.chrome, 0, beamY + 0.14, bumperZ - 0.205);
  box(front, 2.32, 0.03, 0.02, M.rubberTrim, 0, beamY - 0.05, bumperZ - 0.205);
  // нижняя юбка-спойлер под балкой
  rbox(front, 2.24, 0.18, 0.32, M.darkSteel, 0, beamY - 0.3, bumperZ + 0.02, 0.05);
  for (const side of [-1, 1]) {
    // углы, заходящие на борта
    rbox(front, 0.32, 0.42, 0.44, bumpMat, side * 1.15, beamY, bumperZ + 0.12, 0.12);
    // кронштейн балки к лонжерону рамы
    box(front, 0.16, 0.3, 0.62, M.darkSteel, side * 0.44, floorY - 0.22, bumperZ + 0.36);
    // площадка-ступенька на бампере
    box(front, 0.4, 0.035, 0.2, M.rubberTrim, side * 0.95, beamY + 0.235, bumperZ - 0.03);
    // противотуманка: обод и линза заподлицо с балкой
    torus(front, 0.066, 0.014, M.rubberTrim, side * 0.88, beamY - 0.13, bumperZ - 0.19, 18);
    const fog = cyl(front, 0.056, 0.056, 0.02, M.headlight, side * 0.88, beamY - 0.13, bumperZ - 0.19, 18);
    fog.rotation.x = HALF;
    // буксирная проушина
    box(front, 0.06, 0.1, 0.06, M.darkSteel, side * 0.32, beamY - 0.26, bumperZ - 0.18);
  }
  // ступеньки под дверьми
  for (const side of [-1, 1]) {
    const stepZ = cabFront + cabDepth * 0.55;
    box(root, 0.42, 0.05, 0.5, M.darkSteel, side * (HALF_W - 0.16), 0.56, stepZ);
    box(root, 0.42, 0.05, 0.5, M.darkSteel, side * (HALF_W - 0.16), 0.9, stepZ - 0.02);
    box(root, 0.4, 0.5, 0.03, M.plastic, side * (HALF_W - 0.16), 0.75, stepZ + 0.26);
  }

  // ---------------------------------------------- крыша и обвес
  const roof = group(root, 'roof');
  const roofAccent = roofType === 'mega' ? 0.42 : roofType === 'high' ? 0.24 : 0.08;
  if (roofAccent > 0) {
    // надстройка-спальник
    rbox(roof, cabW - 0.18, roofAccent + 0.1, cabDepth - 0.34, paint, 0, roofY + roofAccent / 2 + 0.06, (cabFront + cabRearZ) / 2 - 0.08, 0.09);
    // лобовой обтекатель
    const defl = rbox(roof, cabW - 0.24, 0.36, 0.5, paint2, 0, roofY + roofAccent + 0.02, cabFront + 0.26, 0.08);
    defl.rotation.x = -0.35;
  }
  // боковые обтекатели
  if (unit.deflectors) {
    for (const side of [-1, 1]) {
      const d = rbox(roof, 0.1, 0.5, 1.15, paint2, side * (HALF_W - 0.02), roofY + 0.24, cabRearZ - 0.5, 0.05);
      d.rotation.x = -0.22;
      d.rotation.z = side * 0.04;
    }
  }
  // люк и антенна
  if (roofAccent > 0.1) {
    rbox(roof, 0.62, 0.06, 0.62, M.plasticGray, 0.52, roofY + roofAccent + 0.06, cabRearZ - 0.75, 0.03);
    box(roof, 0.02, 0.34, 0.02, M.darkSteel, -0.95, roofY + roofAccent + 0.2, cabRearZ - 0.55);
    anchors.push({ pos: [0.52, roofY + roofAccent + 0.1, cabRearZ - 0.75], label: 'Люк кабины' });
  }
  // габаритные огни на крыше
  for (const x of [-0.95, -0.5, 0.5, 0.95]) {
    const lamp = sphere(roof, 0.035, M.amber, x, roofY + roofAccent + 0.12, cabFront + 0.48, 8);
  }
  // козырёк над лобовым стеклом
  if (!isFuturistic) {
    const visor = rbox(roof, cabW - 0.3, 0.1, 0.22, paint2, 0, roofY - 0.12, cabFront - 0.06, 0.03);
    visor.rotation.x = 0.2;
  }
  // боковые юбки: закрывают баки между кабиной и задними колёсами,
  // а сами колёса остаются открытыми — у них свои крылья
  if (unit.sideSkirts) {
    // юбка идёт от кабины до первого заднего колеса и закрывает баки
    const z0 = tankZ - tankLen / 2 - 0.06;
    const z1 = Math.min(wheelsRear[0] - R - 0.42, tankZ + tankLen / 2 + 0.22);
    const len = z1 - z0;
    if (len > 0.4) {
      for (const side of [-1, 1]) {
        rbox(root, 0.08, 0.72, len, paint2, side * 1.22, 0.72, (z0 + z1) / 2, 0.03);
        box(root, 0.09, 0.03, len - 0.08, M.rubberTrim, side * 1.22, 0.37, (z0 + z1) / 2);
        box(root, 0.085, 0.022, len - 0.16, accent, side * 1.225, 0.92, (z0 + z1) / 2);
        box(root, 0.085, 0.5, 0.03, paint2, side * 1.22, 0.72, z1 + 0.01);
      }
    }
  }

  // ---------------------------------------------- пятое колесо и задний борт
  const fifth = group(root, 'fifth');
  const plateY = 1.24;
  rbox(fifth, 1.5, 0.1, 1.05, M.darkSteel, 0, plateY, fifthWheelZ, 0.03);
  const jaws = rbox(fifth, 0.42, 0.12, 0.42, M.steel, 0, plateY + 0.04, fifthWheelZ + 0.08, 0.02);
  const handle = cyl(fifth, 0.035, 0.035, 0.8, M.chromeDark, -0.72, plateY - 0.1, fifthWheelZ - 0.3, 8);
  handle.rotation.z = HALF;
  anchors.push({ pos: [0, plateY + 0.15, fifthWheelZ], label: 'Седло (пятое колесо)' });
  // задние фонари и грязезащита
  for (const side of [-1, 1]) {
    box(root, 0.3, 0.16, 0.06, M.taillight, side * 0.78, frameY + 0.05, rearEnd - 0.06);
    box(root, 0.3, 0.08, 0.06, M.amber, side * 0.78, frameY + 0.2, rearEnd - 0.06);
    box(root, 0.06, 0.22, 0.06, M.reverseLight, side * 0.6, frameY + 0.05, rearEnd - 0.06);
  }
  const plateTex = plateTexture('А 001 ТС');
  if (plateTex) {
    plane(root, 0.5, 0.13, new THREE.MeshStandardMaterial({ map: plateTex, roughness: 0.6 }), 0, 0.95, rearEnd - 0.08);
  }

  // ---------------------------------------------- САЛОН
  const interior = buildTruckInterior({
    M, unit, cabFront, cabRear: cabRearZ, cabW, floorY, roofY, winBottom, winTop,
    style, roofType, paint, accent, anchors, isBonnet, isLowEntry,
  });
  cab.add(interior.group);

  // ---------------------------------------------- повреждения
  // 15 точек на каждой машине: двери, оба передних и оба задних крыла,
  // бампер, бак, порог, задняя стенка и крыша кабины, седло, рама, брызговик.
  const dpart = { name: 'дверь кабины', gender: 'f' };
  const xw = HALF_W + 0.022;
  const dmg = mountDamageSet(root, { ...unit, category: 'trucks' }, [
    { part: dpart, side: -1, pos: [-xw, winBottom - 0.56, cabFront + 0.98], w: 0.64, h: 0.42 },
    { part: dpart, side: 1, pos: [xw, winBottom - 0.56, cabFront + 0.98], w: 0.64, h: 0.42 },
    { part: { name: 'переднее крыло', gender: 'n' }, side: -1, pos: [-(frontTrack + 0.32), R + 0.34, frontAxle], w: 0.44, h: 0.3 },
    { part: { name: 'переднее крыло', gender: 'n' }, side: 1, pos: [frontTrack + 0.32, R + 0.34, frontAxle], w: 0.44, h: 0.3 },
    { part: { name: 'заднее крыло', gender: 'n' }, side: 1, pos: [1.33, R + 0.34, wheelsRear[0]], w: 0.62, h: 0.32 },
    { part: { name: 'заднее крыло', gender: 'n' }, side: -1, pos: [-1.33, R + 0.34, wheelsRear[wheelsRear.length - 1]], w: 0.62, h: 0.32 },
    { part: { name: 'передний бампер', gender: 'm' }, side: 1, rotY: PI, pos: [0.5, 0.62, frontZ - 0.02], w: 0.5, h: 0.26 },
    { part: { name: 'передний бампер', gender: 'm' }, side: -1, rotY: PI, pos: [-0.5, 0.62, frontZ - 0.02], w: 0.5, h: 0.26 },
    { part: { name: 'порог кабины', gender: 'm' }, side: -1, pos: [-xw, floorY - 0.06, cabFront + 0.42], w: 0.5, h: 0.26 },
    { part: { name: 'юбка бака', gender: 'f' }, side: 1, pos: [xw, floorY - 0.18, cabFront + 0.5], w: 0.46, h: 0.3 },
    { part: { name: 'задняя стенка кабины', gender: 'f' }, side: 1, rotY: 0, pos: [0.42, floorY + 1.05, cabRearZ + 0.03], w: 0.6, h: 0.46 },
    { part: { name: 'крыша кабины', gender: 'f' }, side: 0, rotX: -HALF, rotY: 0, pos: [0.34, roofY + 0.03, cabRearZ - 0.95], w: 0.7, h: 0.5 },
    { part: { name: 'седло', gender: 'n' }, side: 0, rotX: -HALF, rotY: 0, pos: [0.2, plateY + 0.03, fifthWheelZ], w: 0.5, h: 0.4 },
    { part: { name: 'задняя рама', gender: 'f' }, side: -1, rotY: 0, pos: [-0.36, frameY + 0.02, rearEnd - 0.02], w: 0.46, h: 0.3 },
    { part: { name: 'задний брызговик', gender: 'm' }, side: 1, rotY: 0, pos: [0.5, 0.34, wheelsRear[wheelsRear.length - 1] + R + 0.07], w: 0.5, h: 0.4 },
  ]);
  for (const item of dmg.list) {
    anchors.push({ pos: item.patch.position.clone().toArray(), label: `Повреждение: ${item.spec.label}`, damage: true });
  }

  // точки камер
  const eyeY = floorY + 1.02;
  const seatX = -0.46;
  const views = [
    {
      id: 'driver', label: 'Место водителя', group: 'interior',
      pos: [seatX + 0.06, floorY + 1.16, cabFront + 1.3],
      target: [-0.24, floorY + 0.12, cabFront - 2.0],
      fov: 74, orbit: false, seat: true,
    },
    {
      id: 'passenger', label: 'Место пассажира', group: 'interior',
      pos: [0.6, floorY + 1.3, cabFront + 1.06],
      target: [-0.45, floorY + 0.8, cabFront - 5],
      fov: 70, orbit: false, seat: true,
    },
  ];
  if (roofType === 'high' || roofType === 'mega' || roofType === 'sleeper') {
    views.push({
      id: 'bunk', label: 'Спальное место', group: 'interior',
      pos: [0.3, floorY + 1.66, cabRear - 0.5],
      target: [-0.34, floorY + 1.02, cabFront + 1.1],
      fov: 74, orbit: true, seat: true,
    });
  }
  views.push({
    id: 'exterior', label: 'Снаружи', group: 'exterior',
    pos: [7.6, 3.1, -8.2], target: [0, 1.45, 0.4], fov: 38, orbit: true, autoRotate: true,
  });
  views.push({
    id: 'side', label: 'Борт', group: 'exterior',
    pos: [10.5, 1.9, 0.6], target: [0, 1.5, 0.3], fov: 34, orbit: true,
  });
  views.push({
    id: 'rear', label: 'Сзади', group: 'exterior',
    pos: [-5.6, 3.2, 8.4], target: [0, 1.5, 0.6], fov: 40, orbit: true,
  });

  const layout = { frontZ, rearEnd, cabFront, cabRear: cabRearZ, roofY, floorY, fifthWheelZ, plateY, rearAxle1, rearAxle2, wheelRadius: R, cabWidth: cabW };
  return { root, wheels, paintMats, views, anchors, layout, kind: 'truck', damage: dmg };
}

// ============================================================
// САЛОН ТЯГАЧА
// ============================================================
function buildTruckInterior(c) {
  const { M, cabFront, cabRear, cabW, floorY, roofY, winBottom, winTop, roofType, paint, accent, anchors, style, isLowEntry } = c;
  const g = group(null, 'interior');
  const zMid = (cabFront + cabRear) / 2;
  const dark = M.interiorDark;
  const mid = M.interiorMid;
  const leather = c.unit.luxury ? M.leatherBeige : M.leather;
  const W = cabW - 0.2;

  // --- обшивка: пол, потолок, боковины, задняя стенка
  const mat = rbox(g, W, 0.03, cabRear - cabFront - 0.16, M.rubberTrim, 0, floorY + 0.02, zMid, 0.02);
  // потолок-подкладка
  rbox(g, W - 0.02, 0.05, cabRear - cabFront - 0.2, M.interiorMid, 0, roofY - 0.09, zMid, 0.02);
  // боковые обшивки дверей
  for (const side of [-1, 1]) {
    rbox(g, 0.055, 0.7, cabRear - cabFront - 0.5, dark, side * (cabW / 2 - 0.16), floorY + 0.42, zMid + 0.02, 0.02);
    // подлокотник
    rbox(g, 0.14, 0.1, 0.62, leather, side * (cabW / 2 - 0.19), floorY + 0.62, cabFront + 1.02, 0.03);
    // стеклоподъёмник
    rbox(g, 0.03, 0.04, 0.16, M.chromeDark, side * (cabW / 2 - 0.23), floorY + 0.72, cabFront + 1.0, 0.01);
  }
  // задняя перегородка/обшивка
  rbox(g, W, roofY - floorY - 0.2, 0.06, mid, 0, (floorY + roofY) / 2, cabRear - 0.16, 0.03);

  // --- торпедо
  const dashZ = cabFront + 0.3;      // передний срез панели
  const dashTop = floorY + 0.68;     // верхняя кромка накладки
  const drvX = -0.48;                // ось водителя
  const faceZ = cabFront + 0.56;     // лицевая плоскость к водителю
  const trimMat = c.unit.luxury ? M.wood : M.chromeDark;

  // 1. фронтальная перегородка под лобовым стеклом
  rbox(g, W - 0.02, dashTop - floorY, 0.3, dark, 0, (floorY + dashTop) / 2, cabFront + 0.12, 0.04);
  // 2. верхняя накладка (мягкий пластик) с задним бортиком
  const pad = rbox(g, W - 0.02, 0.16, 0.52, M.plasticGray, 0, dashTop - 0.05, cabFront + 0.34, 0.12);
  pad.rotation.x = 0.05;
  rbox(g, W - 0.08, 0.045, 0.06, M.plasticGray, 0, dashTop + 0.05, cabFront + 0.58, 0.03);
  // 3. лицевая панель к водителю
  const face = rbox(g, W - 0.04, 0.66, 0.12, M.interiorMid, 0, floorY + 0.38, faceZ - 0.05, 0.03);
  face.rotation.x = -0.06;
  // 4. коленная панель (уходит под панель)
  const knee = rbox(g, W - 0.08, 0.34, 0.3, M.interiorDark, 0, floorY + 0.18, cabFront + 0.4, 0.05);
  knee.rotation.x = 0.16;
  // 5. декоративная полоса и строчка
  box(g, W - 0.12, 0.035, 0.03, trimMat, 0, floorY + 0.14, faceZ + 0.01);
  box(g, W - 0.16, 0.012, 0.012, M.chromeDark, 0, floorY + 0.09, faceZ + 0.012);
  box(g, W - 0.16, 0.01, 0.01, M.plasticGray, 0, floorY + 0.66, faceZ + 0.01);

  // 6. козырёк приборов и сам щиток
  const binX = drvX - 0.02, binY = floorY + 0.5, binZ = faceZ + 0.02;
  const hood = rbox(g, 0.98, 0.09, 0.28, M.interiorDark, binX, binY + 0.28, binZ - 0.06, 0.05);
  hood.rotation.x = 0.28;
  rbox(g, 0.94, 0.5, 0.09, M.plastic, binX, binY, binZ, 0.03);
  // циферблаты: два основных + два вспомогательных
  function dial(x, y, r, ticks = 9) {
    const disc = cyl(g, r, r, 0.02, M.plastic, x, y, binZ + 0.06, 24);
    disc.rotation.x = HALF;
    torus(g, r + 0.004, 0.008, M.chromeDark, x, y, binZ + 0.073, 22);
    for (let i = 0; i <= ticks; i++) {
      const a = -PI * 0.78 + (i / ticks) * PI * 1.56;
      const t = box(g, r * 0.05, r * 0.15, 0.006, M.plasticLight, x + Math.cos(a) * r * 0.8, y + Math.sin(a) * r * 0.8, binZ + 0.075);
      t.rotation.z = a - HALF;
    }
    const needle = box(g, r * 0.045, r * 0.78, 0.006, M.taillight, x + Math.cos(-PI * 0.3) * r * 0.39, y + Math.sin(-PI * 0.3) * r * 0.39, binZ + 0.08);
    needle.rotation.z = -PI * 0.3 - HALF;
    const cap = cyl(g, r * 0.1, r * 0.1, 0.02, M.chromeDark, x, y, binZ + 0.082, 12);
    cap.rotation.x = HALF;
  }
  dial(binX - 0.19, binY + 0.04, 0.115, 9);
  dial(binX + 0.19, binY + 0.04, 0.105, 9);
  dial(binX, binY - 0.18, 0.045, 6);
  box(g, 0.13, 0.045, 0.02, M.dashScreen, binX, binY + 0.18, binZ + 0.075);

  // 7. центральная консоль: экран, дефлекторы, шайбы, клавиши
  const cX = 0.08;
  rbox(g, 0.56, 0.64, 0.16, M.interiorDark, cX, floorY + 0.4, faceZ, 0.05);
  rbox(g, 0.48, 0.3, 0.03, M.plastic, cX, floorY + 0.56, faceZ + 0.075, 0.02);
  rbox(g, 0.42, 0.24, 0.02, M.dashScreen, cX, floorY + 0.56, faceZ + 0.092, 0.01);
  box(g, 0.46, 0.012, 0.012, M.chromeDark, cX, floorY + 0.38, faceZ + 0.09);
  // дефлекторы над экраном
  for (const dx of [-0.13, 0.13]) {
    rbox(g, 0.16, 0.07, 0.03, M.plastic, cX + dx, floorY + 0.72, faceZ + 0.09, 0.015);
    for (let i = -1; i <= 1; i++) box(g, 0.012, 0.05, 0.012, M.chromeDark, cX + dx + i * 0.045, floorY + 0.72, faceZ + 0.105);
  }
  // шайбы климата
  for (let i = 0; i < 3; i++) {
    const knob = cyl(g, 0.04, 0.04, 0.03, M.plastic, cX - 0.13 + i * 0.13, floorY + 0.36, faceZ + 0.09, 18);
    knob.rotation.x = HALF;
    const ring = cyl(g, 0.048, 0.048, 0.012, M.chromeDark, cX - 0.13 + i * 0.13, floorY + 0.36, faceZ + 0.078, 20);
    ring.rotation.x = HALF;
    box(g, 0.008, 0.026, 0.008, M.plasticLight, cX - 0.13 + i * 0.13, floorY + 0.375, faceZ + 0.105);
  }
  // ряд клавиш
  for (let i = 0; i < 5; i++) {
    box(g, 0.064, 0.045, 0.02, M.plasticGray, cX - 0.15 + i * 0.075, floorY + 0.24, faceZ + 0.085);
    box(g, 0.03, 0.008, 0.008, i === 0 ? M.taillight : i === 4 ? accent : M.amber, cX - 0.15 + i * 0.075, floorY + 0.25, faceZ + 0.097);
  }
  // 8. бардачок и дефлектор пассажира
  rbox(g, 0.6, 0.24, 0.04, M.plasticGray, 0.78, floorY + 0.36, faceZ + 0.02, 0.02);
  box(g, 0.52, 0.02, 0.02, M.plastic, 0.78, floorY + 0.45, faceZ + 0.045);
  rbox(g, 0.14, 0.035, 0.03, M.chromeDark, 0.78, floorY + 0.37, faceZ + 0.05, 0.01);
  rbox(g, 0.18, 0.08, 0.03, M.plastic, 1.02, floorY + 0.66, faceZ + 0.02, 0.02);
  for (let i = -1; i <= 1; i++) box(g, 0.012, 0.055, 0.012, M.chromeDark, 1.02 + i * 0.05, floorY + 0.66, faceZ + 0.04);
  // 9. боковой дефлектор у водителя
  rbox(g, 0.16, 0.08, 0.03, M.plastic, -1.02, floorY + 0.68, faceZ + 0.02, 0.02);
  for (let i = -1; i <= 1; i++) box(g, 0.012, 0.05, 0.012, M.chromeDark, -1.02 + i * 0.045, floorY + 0.68, faceZ + 0.04);

  // 10. руль и колонка
  const wheelG = group(g, 'steering');
  wheelG.position.set(drvX, floorY + 0.7, faceZ + 0.15);
  wheelG.rotation.x = -0.5;
  torus(wheelG, 0.215, 0.03, M.leather, 0, 0, 0, 40);
  const hub = rbox(wheelG, 0.17, 0.12, 0.07, M.plastic, 0, 0, 0.012, 0.035);
  const emblem = cyl(wheelG, 0.036, 0.036, 0.014, accent, 0, 0.01, 0.05, 18);
  emblem.rotation.x = HALF;
  for (const a of [0, PI, -HALF]) {
    const spoke = box(wheelG, 0.055, 0.15, 0.024, M.plasticGray, Math.cos(a) * 0.105, Math.sin(a) * 0.105, 0.004);
    spoke.rotation.z = a - HALF;
    const trim = box(wheelG, 0.03, 0.13, 0.008, M.chromeDark, Math.cos(a) * 0.105, Math.sin(a) * 0.105, 0.019);
    trim.rotation.z = a - HALF;
  }
  // подрулевой обод-накладка на нижней спице
  box(wheelG, 0.11, 0.02, 0.02, M.chromeDark, 0, -0.16, 0.01);
  // кожух колонки + подрулевые переключатели
  const col = rbox(g, 0.13, 0.12, 0.34, M.plastic, drvX, floorY + 0.54, faceZ - 0.02, 0.04);
  col.rotation.x = 0.45;
  for (const side of [-1, 1]) {
    const stalk = cyl(g, 0.014, 0.014, 0.16, M.chromeDark, drvX + side * 0.16, floorY + 0.7, faceZ - 0.02, 8);
    stalk.rotation.z = HALF;
    sphere(g, 0.026, M.plastic, drvX + side * 0.24, floorY + 0.7, faceZ - 0.02, 10);
  }
  // 11. кнопка пуска и селектор передач на консоли
  const startBtn = cyl(g, 0.028, 0.028, 0.02, accent, 0.5, floorY + 0.3, faceZ + 0.1, 16);
  startBtn.rotation.x = HALF;
  cyl(g, 0.036, 0.036, 0.014, M.chromeDark, 0.5, floorY + 0.3, faceZ + 0.088, 18).rotation.x = HALF;
  if (style === 'euro') {
    const sel = rbox(g, 0.1, 0.05, 0.14, M.plasticGray, 0.42, floorY + 0.2, faceZ + 0.16, 0.02);
    box(g, 0.06, 0.012, 0.012, accent, 0.42, floorY + 0.225, faceZ + 0.225);
  }
  anchors.push({ pos: [drvX, floorY + 0.8, faceZ - 0.3], label: 'Руль и приборы' });
  anchors.push({ pos: [cX, floorY + 0.6, faceZ + 0.1], label: 'Мультимедиа' });
  // --- сиденья
  function seat(x, z, { recline = 0.12, luxury = false } = {}) {
    const s = group(g);
    const base = rbox(s, 0.56, 0.16, 0.56, luxury ? leather : M.fabric, 0, floorY + 0.28, 0, 0.05);
    // боковые валики
    for (const sx of [-1, 1]) rbox(s, 0.09, 0.16, 0.54, luxury ? leather : M.fabric, sx * 0.28, floorY + 0.33, 0, 0.04);
    const back = rbox(s, 0.54, 0.72, 0.16, luxury ? leather : M.fabric, 0, floorY + 0.66, 0.24, 0.06);
    back.rotation.x = recline;
    for (const sx of [-1, 1]) {
      const bol = rbox(s, 0.08, 0.62, 0.14, luxury ? leather : M.fabric, sx * 0.26, floorY + 0.68, 0.24, 0.05);
      bol.rotation.x = recline;
    }
    const head = rbox(s, 0.34, 0.2, 0.14, luxury ? leather : M.fabric, 0, floorY + 1.14, 0.32, 0.06);
    // пневмоподвеска
    const bellows = cyl(s, 0.11, 0.13, 0.16, M.rubberTrim, 0, floorY + 0.18, 0.02, 14);
    // ремень
    const belt = box(s, 0.07, 0.72, 0.02, M.plasticGray, -0.22, floorY + 0.72, 0.36);
    belt.rotation.x = recline;
    belt.rotation.z = -0.12;
    // подголовник-стойки
    for (const sx of [-1, 1]) box(s, 0.02, 0.16, 0.02, M.chromeDark, sx * 0.11, floorY + 1.02, 0.33);
    s.position.set(x, 0, z);
    return s;
  }
  const driverSeat = seat(-0.46, cabFront + 1.02, { recline: 0.14, luxury: !!c.unit.luxury });
  anchors.push({ pos: [-0.46, floorY + 0.62, cabFront + 1.02], label: 'Сиденье водителя' });
  seat(0.56, cabFront + 1.0, { recline: 0.1, luxury: !!c.unit.luxury });

  // --- спальник (только за спинками сидений)
  if (roofType === 'high' || roofType === 'mega' || roofType === 'sleeper') {
    const bunkLen = 0.92;
    const bunkZ = cabRear - bunkLen / 2 - 0.1;
    const bunkY = floorY + 0.96;
    // каркас и матрас
    rbox(g, W - 0.12, 0.1, bunkLen, M.interiorMid, 0, bunkY, bunkZ, 0.02);
    rbox(g, W - 0.24, 0.16, bunkLen - 0.08, M.leatherBeige, 0, bunkY + 0.12, bunkZ, 0.05);
    // подушка у задней стенки
    rbox(g, 0.46, 0.11, 0.3, M.plasticLight, -0.28, bunkY + 0.24, cabRear - 0.26, 0.04);
    // сложенное одеяло
    rbox(g, W - 0.36, 0.07, 0.34, M.accent('#5a6b57'), 0.02, bunkY + 0.23, bunkZ + 0.2, 0.03);
    // шторки по бокам спальника
    for (const side of [-1, 1]) {
      rbox(g, 0.02, 0.52, bunkLen - 0.1, M.fabric, side * (W / 2 - 0.06), bunkY + 0.34, bunkZ, 0.01);
    }
    anchors.push({ pos: [0, bunkY + 0.3, cabRear - 0.35], label: 'Спальное место' });
    if (roofType === 'mega') {
      // верхняя полка
      rbox(g, W - 0.2, 0.09, 1.3, M.interiorMid, 0, floorY + 1.86, cabRear - 0.72, 0.02);
      rbox(g, W - 0.3, 0.12, 1.2, M.leatherBeige, 0, floorY + 1.95, cabRear - 0.72, 0.03);
      // лестница-скоба
      for (const side of [-1, 1]) box(g, 0.03, 0.62, 0.03, M.steel, side * 0.34, floorY + 1.4, cabRear - 0.16);
      for (let i = 0; i < 3; i++) box(g, 0.72, 0.03, 0.03, M.steel, 0, floorY + 1.2 + i * 0.24, cabRear - 0.16);
    }
  }

  // --- шкаф, холодильник, стол (у мега-кабин)
  if (roofType === 'mega' || c.unit.luxury) {
    const cab = rbox(g, 0.5, 0.8, 0.55, M.interiorMid, -1.0, floorY + 0.55, cabRear - 0.55, 0.04);
    const fridge = rbox(g, 0.42, 0.5, 0.5, M.plasticGray, 1.0, floorY + 0.42, cabRear - 0.5, 0.04);
    box(g, 1.6, 0.05, 0.5, M.wood || M.plasticLight, 0, floorY + 0.95, cabRear - 0.5);
    anchors.push({ pos: [1.0, floorY + 0.6, cabRear - 0.5], label: 'Холодильник' });
  }
  // --- крючок/вешалка, светильник
  rbox(g, 0.3, 0.06, 0.06, M.plasticLight, 0.6, roofY - 0.18, zMid, 0.02);
  const lamp = cyl(g, 0.08, 0.08, 0.04, M.headlight, 0, roofY - 0.12, zMid + 0.4, 14);
  lamp.rotation.x = HALF;
  // солнцезащитные козырьки
  for (const side of [-1, 1]) {
    const visor = rbox(g, 0.62, 0.16, 0.03, M.plasticLight, side * 0.5, winTop + 0.05, cabFront + 0.22, 0.02);
    visor.rotation.x = -0.25;
  }
  // педали
  for (const [x, w] of [[-0.64, 0.1], [-0.44, 0.16], [-0.22, 0.1]]) {
    const pedal = box(g, w, 0.03, 0.16, M.steel, x, floorY + 0.16, cabFront + 0.55);
    pedal.rotation.x = 0.5;
  }
  // полка на торпедо
  rbox(g, 0.6, 0.025, 0.3, M.interiorMid, 0.55, dashTop + 0.03, dashZ - 0.04, 0.01);
  box(g, 0.56, 0.008, 0.008, M.chromeDark, 0.55, dashTop + 0.045, dashZ + 0.11);
  // выдвижной ящик
  rbox(g, 0.4, 0.28, 0.4, M.interiorMid, 0.5, floorY + 0.3, cabFront + 1.7, 0.03);

  return { group: g };
}
