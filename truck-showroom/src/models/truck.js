// ============================================================
// ТЯГАЧИ: параметрическая кабина, шасси, колёса и салон.
// Один конструктор собирает все 10 моделей; отличия — в стиле
// кабины (евро / капотник / футуризм / низкопольный), крыше,
// цвете и обвесе. Нос — в −Z, пол кабины ≈ 1,15 м.
// ============================================================
import * as THREE from 'three';
import {
  HALF, PI, TAU, box, rbox, cyl, sphere, torus, plane, mesh, group, pipe,
  wheel as makeWheel, mirror, labelTexture, plateTexture, clamp, rad,
} from '../lib/kit.js';

const FLOOR = 1.18; // пол кабины над землёй

function paintFor(M, color, opts = {}) {
  return M.paint(color, opts);
}

/** Арка крыла: половина цилиндра, накрывающая колесо. */
function fender(M, mat, r, width, x, y, z, side) {
  const g = new THREE.Group();
  // аккуратная пластиковая арка-накладка над колесом
  const arch = new THREE.Mesh(new THREE.TorusGeometry(r, Math.max(0.035, width * 0.055), 6, 24, PI), mat);
  arch.rotation.y = side > 0 ? -HALF : HALF;
  g.add(arch);
  // внутренний подкрылок (тонкий полуцилиндр)
  const shell = new THREE.Mesh(new THREE.CylinderGeometry(r - 0.03, r - 0.03, width * 0.8, 18, 1, true, 0, PI), mat);
  shell.rotation.z = HALF;
  shell.material = mat.clone ? mat.clone() : mat;
  shell.material.side = THREE.DoubleSide;
  g.add(shell);
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
  const cabH = unit.cabHeight ?? 3.55;
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

  // крылья над колёсами
  for (const side of [-1, 1]) {
    const f = fender(M, M.plasticGray, R + 0.05, 0.5, side * frontTrack, R + 0.02, frontAxle, side);
    f.visible = unit.fenders !== false;
    root.add(f);
    for (const z of wheelsRear) {
      const rf = fender(M, M.plasticGray, R + 0.06, 1.02, side * 0.92, R + 0.02, z, side);
      rf.visible = unit.fenders !== false;
      root.add(rf);
    }
    // брызговики
    for (const z of [frontAxle - 0.42, wheelsRear[0] - 0.55]) {
      box(root, 0.42, 0.5, 0.04, M.rubberTrim, side * (z < 0 ? frontTrack : 0.92), R - 0.22, z);
    }
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
    // акцентная полоса по борту
    box(cab, 0.02, 0.075, cabDepth * 0.82, accent, side * (HALF_W + 0.012), winBottom + 0.16, (cabFront + cabRearZ) / 2 + 0.02);
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

  // ---------------------------------------------- решётка, фары, бампер
  const front = group(root, 'front');
  if (isBonnet) {
    // капот
    const hood = rbox(front, 2.2, 0.95, hoodLen, paint, 0, floorY + 0.48, frontZ + 0.28 + hoodLen / 2, 0.16);
    hood.geometry.dispose?.();
    rbox(front, 2.14, 0.55, 0.9, paint, 0, floorY + 0.92, cabFront - 0.42, 0.18);
    // решётка
    box(front, 1.9, 0.72, 0.1, CHROME ? M.chrome : M.plasticGray, 0, floorY + 0.34, frontZ + 0.02);
    for (let i = -3; i <= 3; i++) {
      box(front, 1.8, 0.06, 0.05, M.chromeDark, 0, floorY + 0.34 + i * 0.11, frontZ - 0.03);
    }
    for (const side of [-1, 1]) {
      rbox(front, 0.34, 0.3, 0.1, M.chrome, side * 0.86, floorY + 0.34, frontZ - 0.02, 0.04);
    }
    // выхлопные трубы
    for (const side of [-1, 1]) {
      const stack = cyl(front, 0.075, 0.085, 2.3, M.chrome, side * 1.16, floorY + 1.35, cabFront - 0.55, 14);
      const tip = cyl(front, 0.09, 0.075, 0.18, M.chromeDark, side * 1.16, floorY + 2.52, cabFront - 0.55, 14);
      const shield = box(front, 0.03, 1.5, 0.28, M.chromeDark, side * 1.16, floorY + 0.75, cabFront - 0.55);
    }
  } else {
    // гладкая передняя панель евро/футуризм/низкопольный
    rbox(front, 2.34, isFuturistic ? 0.9 : 0.62, 0.16, isFuturistic ? M.plasticGray : M.plastic, 0, floorY + 0.42, cabFront - 0.02, 0.05);
    if (isFuturistic) {
      // светящаяся полоса вместо решётки
      const strip = box(front, 2.3, 0.1, 0.03, M.headlight, 0, floorY + 0.78, cabFront - 0.11);
      const glow = box(front, 2.32, 0.22, 0.02, accent, 0, floorY + 0.78, cabFront - 0.12);
      glow.material = accent;
      // эмблема
      const emblem = cyl(front, 0.16, 0.16, 0.04, M.chrome, 0, floorY + 0.42, cabFront - 0.12, 20);
      emblem.rotation.x = HALF;
    } else {
      // решётка с ламелями
      const grilleMat = CHROME ? M.chrome : M.plasticGray;
      box(front, 1.5, 0.4, 0.06, M.plastic, 0, floorY + 0.42, cabFront - 0.1);
      for (let i = -2; i <= 2; i++) {
        box(front, 1.44, 0.045, 0.03, grilleMat, 0, floorY + 0.42 + i * 0.085, cabFront - 0.14);
      }
      // эмблема-табличка бренда
      const tex = labelTexture(unit.brand, {
        width: 512, height: 160, bg: '#14181c', fg: '#f4efe3', accent: unit.accent || '#e8b45a',
        font: 'bold 72px Arial, sans-serif', border: false,
      });
      if (tex) {
        const plaque = plane(front, 0.66, 0.2, new THREE.MeshStandardMaterial({ map: tex, roughness: 0.4, metalness: 0.2 }), 0, floorY + 0.42, cabFront - 0.155);
      }
      const plate = cyl(front, 0.19, 0.19, 0.03, M.chrome, 0, floorY + 0.42, cabFront - 0.15, 24);
      plate.rotation.x = HALF;
    }
  }
  // бампер
  const bumperY = isLowEntry ? 0.62 : 0.62;
  const bumperZ = frontZ + 0.06;
  rbox(front, 2.5, 0.42, 0.34, unit.chromeBumper || CHROME ? M.chrome : M.plasticGray, 0, bumperY, bumperZ, 0.05);
  if (!CHROME && !unit.chromeBumper) box(front, 2.3, 0.12, 0.02, M.plastic, 0, bumperY - 0.12, bumperZ - 0.18);
  // противотуманки
  for (const side of [-1, 1]) {
    const fog = cyl(front, 0.075, 0.075, 0.04, M.headlight, side * 0.85, bumperY - 0.1, bumperZ - 0.18, 14);
    fog.rotation.x = HALF;
  }
  // фары
  for (const side of [-1, 1]) {
    const head = rbox(front, 0.5, 0.24, 0.08, M.headlight, side * 0.72, floorY + 0.02, cabFront - 0.12, 0.03);
    const inner = box(front, 0.42, 0.06, 0.03, M.chrome, side * 0.72, floorY - 0.02, cabFront - 0.17);
    const blink = box(front, 0.34, 0.06, 0.03, M.amber, side * 0.72, floorY + 0.13, cabFront - 0.17);
    blinkers.push(blink);
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
  // боковые юбки
  if (unit.sideSkirts) {
    for (const side of [-1, 1]) {
      rbox(root, 0.08, 0.72, cabDepth + (rearEnd - cabRear) * 0.62, paint2, side * 1.22, 0.72, cabRear + (rearEnd - cabRear) * 0.3, 0.03);
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

  // точки камер
  const eyeY = floorY + 1.02;
  const seatX = -0.46;
  const views = [
    {
      id: 'driver', label: 'Место водителя', group: 'interior',
      pos: [seatX + 0.06, floorY + 1.3, cabFront + 1.02],
      target: [-0.24, floorY + 0.68, cabFront - 9],
      fov: 72, orbit: false, seat: true,
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
  return { root, wheels, paintMats, views, anchors, layout, kind: 'truck' };
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
  const dashZ = cabFront + 0.28;
  const dashTop = floorY + 0.82;
  const dash = rbox(g, W - 0.02, 0.46, 0.62, dark, 0, floorY + 0.55, dashZ, 0.08);
  dash.rotation.x = 0.08;
  rbox(g, W - 0.06, 0.14, 0.78, mid, 0, dashTop + 0.02, dashZ + 0.12, 0.06);
  // козырёк приборов: приподнят над панелью, циферблаты смотрят на водителя
  const binZ = dashZ + 0.04;
  const binnacle = rbox(g, 0.7, 0.28, 0.24, dark, -0.46, dashTop + 0.2, binZ, 0.05);
  binnacle.rotation.x = -0.22;
  // центральная консоль
  rbox(g, 0.44, 0.5, 0.28, mid, 0.08, floorY + 0.62, dashZ + 0.34, 0.04);
  // экран мультимедиа
  const screen = rbox(g, 0.34, 0.24, 0.03, M.dashScreen, 0.08, floorY + 0.92, dashZ + 0.2, 0.02);
  screen.rotation.x = -0.12;
  // кнопки и дефлекторы
  for (let i = -1; i <= 1; i++) {
    box(g, 0.035, 0.02, 0.02, M.chromeDark, 0.08 + i * 0.09, floorY + 0.78, dashZ + 0.34);
  }
  for (const side of [-1, 1]) {
    const vent = rbox(g, 0.16, 0.09, 0.03, M.plastic, side * 0.78, dashTop + 0.06, dashZ - 0.02, 0.02);
    for (let i = -1; i <= 1; i++) box(g, 0.012, 0.07, 0.01, M.chromeDark, side * 0.78 + i * 0.045, dashTop + 0.06, dashZ - 0.04);
  }
  // приборная панель: два циферблата перед водителем
  for (const [x, r] of [[-0.64, 0.1], [-0.34, 0.1]]) {
    const dial = cyl(g, r, r, 0.02, M.plastic, x, dashTop + 0.2, binZ + 0.11, 24);
    dial.rotation.x = HALF;
    const ring = torus(g, r, 0.008, M.chromeDark, x, dashTop + 0.2, binZ + 0.12, 20);
    ring.rotation.x = 0;
    // стрелка
    const needle = box(g, 0.012, r * 1.1, 0.006, M.taillight, x, dashTop + 0.2 + r * 0.25, binZ + 0.13);
    needle.rotation.z = 0.6;
  }
  // руль
  const wheelG = group(g, 'steering');
  wheelG.position.set(-0.48, dashTop + 0.19, dashZ + 0.26);
  wheelG.rotation.x = -0.36;
  const rim = torus(wheelG, 0.215, 0.023, M.leather, 0, 0, 0, 40);
  rim.rotation.x = 0;
  const hub = cyl(wheelG, 0.065, 0.07, 0.07, M.plastic, 0, 0, 0.02, 20);
  hub.rotation.x = HALF;
  for (let i = 0; i < 3; i++) {
    const a = rad(90) + i * (TAU / 3);
    const spoke = box(wheelG, 0.04, 0.2, 0.025, M.plasticGray, Math.cos(a) * 0.1, Math.sin(a) * 0.1, 0.0);
    spoke.rotation.z = a - HALF;
  }
  const emblem = cyl(wheelG, 0.032, 0.032, 0.012, accent, 0, 0, 0.06, 16);
  emblem.rotation.x = HALF;
  // колонка руля
  const col = cyl(g, 0.045, 0.06, 0.5, M.plastic, -0.48, dashTop + 0.06, dashZ + 0.06, 12);
  col.rotation.x = 0.62;
  // рычаг КПП / селектор
  if (style === 'euro' || style === 'futuristic') {
    const lever = cyl(g, 0.02, 0.025, 0.3, M.chromeDark, 0.42, dashTop + 0.02, dashZ + 0.12, 8);
    lever.rotation.x = -0.5;
    sphere(g, 0.045, M.plastic, 0.42, dashTop + 0.16, dashZ + 0.24, 10);
  }
  anchors.push({ pos: [-0.48, dashTop + 0.16, dashZ - 0.4], label: 'Руль и приборы' });
  anchors.push({ pos: [0.08, floorY + 0.95, dashZ + 0.15], label: 'Мультимедиа' });

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
  rbox(g, 0.6, 0.03, 0.3, M.plastic, 0.55, dashTop + 0.03, dashZ - 0.12, 0.01);
  // выдвижной ящик
  rbox(g, 0.4, 0.28, 0.4, M.interiorMid, 0.5, floorY + 0.3, cabFront + 1.7, 0.03);

  return { group: g };
}
