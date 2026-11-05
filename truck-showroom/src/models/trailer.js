// ============================================================
// ПРИЦЕПЫ: единая рама, тележка с 2–4 осями и 20 разных кузовов.
// Пол дека стоит на высоте седла тягача (≈1,25 м), нос в −Z.
// ============================================================
import * as THREE from 'three';
import {
  HALF, PI, TAU, box, rbox, cyl, sphere, torus, plane, group, pipe,
  wheel as makeWheel, mirror, labelTexture, plateTexture, clamp, rad,
} from '../lib/kit.js';
import { buildCar } from './car.js';

const DECK = 1.25;

function std(color, rough = 0.65, metal = 0.2) {
  return new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal });
}

export function buildTrailer(unit, M) {
  const root = group(null, `trailer:${unit.id}`);
  const wheels = [];
  const anchors = [];
  const L = unit.length ?? 13.6;
  const W = unit.width ?? 2.55;
  const H = unit.height ?? 2.75;
  const type = unit.type;
  const halfL = L / 2;
  const zFront = -halfL;
  const zRear = halfL;
  const bodyColor = unit.color || '#d5d8d3';
  const bodyMat = std(bodyColor, 0.72, 0.12);
  const bodyMat2 = std(new THREE.Color(bodyColor).multiplyScalar(0.86), 0.78, 0.12);
  const frameMat = M.darkSteel;

  const lowDeck = type === 'lowboy';
  const deckY = lowDeck ? 0.92 : DECK;
  const axleCount = type === 'lowboy' ? 4 : type === 'bdouble' ? 5 : type === 'dolly' || type === 'boat' ? 2 : 3;

  // ------------------------------------------------ рама
  const frame = group(root, 'frame');
  if (type === 'dolly') {
    // роспуск: A-образное дышло и короткая балка
    for (const side of [-1, 1]) {
      pipe(frame, [side * 0.55, DECK - 0.1, zFront + 0.2], [side * 0.02, DECK - 0.1, zFront + 2.4], 0.07, frameMat);
      box(frame, 0.14, 0.24, L - 2.2, frameMat, side * 0.52, DECK - 0.12, 0.6);
    }
    box(frame, 1.2, 0.22, 0.24, frameMat, 0, DECK - 0.1, zFront + 2.4);
    // телескопическая секция
    box(frame, 0.5, 0.18, 2.4, M.steel, 0, DECK - 0.14, zFront + 1.4);
  } else if (lowDeck) {
    // «гусиная шея» + заниженная площадка
    box(frame, 1.1, 0.4, 3.4, frameMat, 0, deckY + 0.16, zFront + 1.7);
    for (const side of [-1, 1]) box(frame, 0.14, 0.42, L - 0.4, frameMat, side * (W / 2 - 0.32), deckY - 0.2, 0.2);
    for (let z = zFront + 0.6; z < zRear; z += 1.2) box(frame, W - 0.6, 0.18, 0.12, frameMat, 0, deckY - 0.18, z);
  } else {
    for (const side of [-1, 1]) {
      box(frame, 0.16, 0.34, L - 0.5, frameMat, side * (W / 2 - 0.22), deckY - 0.2, 0.2);
    }
    for (let z = zFront + 0.8; z < zRear - 0.2; z += 1.15) {
      box(frame, W - 0.4, 0.16, 0.12, frameMat, 0, deckY - 0.22, z);
    }
  }
  // опорные стойки («ноги») и седло
  if (type !== 'dolly' && type !== 'boat') {
    for (const side of [-1, 1]) {
      const leg = rbox(frame, 0.16, 0.9, 0.2, M.plasticGray, side * 0.85, DECK - 0.62, zFront + 1.75, 0.02);
      box(frame, 0.3, 0.06, 0.3, M.darkSteel, side * 0.85, DECK - 1.1, zFront + 1.75);
      pipe(frame, [side * 0.85, DECK - 0.55, zFront + 1.7], [side * 0.85, DECK - 0.18, zFront + 2.0], 0.02, M.chromeDark);
    }
    rbox(frame, 1.0, 0.1, 0.8, frameMat, 0, DECK - 0.33, zFront + 0.5, 0.02);
    cyl(frame, 0.07, 0.07, 0.26, M.steel, 0, DECK - 0.45, zFront + 0.5, 12);
    anchors.push({ pos: [0, DECK - 0.4, zFront + 0.5], label: 'Сцепной шкворень' });
  }

  // ------------------------------------------------ колёса + брызговики
  const R = type === 'lowboy' ? 0.48 : type === 'boat' ? 0.32 : 0.5;
  const axleZ = [];
  if (type === 'bdouble') {
    axleZ.push(zRear - 0.7, zRear - 1.55);
  } else if (type === 'dolly') {
    axleZ.push(1.0, 1.85);
  } else if (type === 'boat') {
    axleZ.push(1.0, 1.8);
  } else {
    for (let i = 0; i < axleCount; i++) axleZ.push(zRear - 0.75 - i * 1.32);
  }
  const track = type === 'boat' ? 1.02 : 0.94;
  for (const z of axleZ) {
    // ось
    cyl(root, 0.09, 0.09, W - 0.35, M.darkSteel, 0, R, z, 10).rotation.z = HALF;
    for (const side of [-1, 1]) {
      if (type === 'boat' || type === 'dolly') {
        const w = makeWheel(M, { radius: R, width: 0.26, style: 'truck', rimColor: '#d2d5d7' });
        w.position.set(side * track, R, z);
        if (side < 0) w.rotation.y = PI;
        root.add(w);
        wheels.push(w);
      } else {
        for (const dx of [0, 0.34]) {
          const w = makeWheel(M, { radius: R, width: 0.3, style: 'truck', rimColor: '#d2d5d7' });
          w.position.set(side * (track + dx), R, z);
          if (side < 0) w.rotation.y = PI;
          root.add(w);
          wheels.push(w);
        }
      }
    }
    // крыло над тележкой
    if (type !== 'boat' && type !== 'dolly') {
      for (const side of [-1, 1]) {
        const f = new THREE.Mesh(new THREE.CylinderGeometry(R + 0.12, R + 0.12, 1.5, 18, 1, true, 0, PI), M.plastic);
        f.material.side = THREE.DoubleSide;
        f.rotation.z = HALF;
        f.rotation.y = HALF;
        f.position.set(side * (track + 0.17), R + 0.04, z);
        f.scale.y = 1.9;
        root.add(f);
      }
    }
  }
  // брызговики сзади тележки
  for (const side of [-1, 1]) {
    const lastAxle = axleZ[axleZ.length - 1];
    box(root, 0.55, 0.5, 0.04, M.rubberTrim, side * (track + 0.17), R - 0.18, lastAxle - 0.62);
    // боковая защита (подножка)
    if (type !== 'boat' && type !== 'dolly' && type !== 'lowboy') box(root, 0.05, 0.12, L * 0.42, M.steel, side * (W / 2 - 0.18), 0.62, zRear - 3.4);
  }

  // ------------------------------------------------ корма (задний борт, фонари)
  const rear = group(root, 'rear');
  const rearY = deckY + (type === 'flatbed' || type === 'logging' || type === 'dolly' ? 0.12 : 0.2);
  box(rear, W - 0.1, 0.16, 0.16, M.steel, 0, deckY - 0.32, zRear - 0.02);
  for (const side of [-1, 1]) {
    box(rear, 0.22, 0.16, 0.06, M.taillight, side * (W / 2 - 0.34), deckY - 0.42, zRear - 0.05);
    box(rear, 0.22, 0.1, 0.06, M.amber, side * (W / 2 - 0.34), deckY - 0.28, zRear - 0.05);
    box(rear, 0.1, 0.16, 0.06, M.reverseLight, side * (W / 2 - 0.58), deckY - 0.42, zRear - 0.05);
    // номерной знак с подсветкой
    box(rear, 0.06, 0.04, 0.1, M.headlight, side * 0.42, deckY - 0.24, zRear - 0.06);
  }
  const plateTex = plateTexture('ВК 4471');
  if (plateTex) {
    plane(rear, 0.5, 0.13, new THREE.MeshStandardMaterial({ map: plateTex, roughness: 0.6 }), 0, deckY - 0.5, zRear - 0.1);
  }
  // бампер-отбойник
  rbox(rear, W - 0.2, 0.16, 0.16, type === 'adr' || type === 'tanker' ? M.hazard : M.steel, 0, 0.55, zRear - 0.12, 0.03);
  // маркерные огни по борту
  for (const side of [-1, 1]) {
    for (let z = zFront + 2.2; z < zRear - 0.6; z += 2.4) {
      sphere(root, 0.032, M.amber, side * (W / 2 + 0.005), deckY + 0.02, z, 6);
    }
  }

  // ------------------------------------------------ кузов
  const body = group(root, 'body');
  const ctx = { M, unit, body, bodyMat, bodyMat2, W, H, L, halfL, zFront, zRear, deckY, R, anchors, frameMat, std };

  switch (type) {
    case 'curtain': curtain(ctx); break;
    case 'van': dryVan(ctx); break;
    case 'reefer': reefer(ctx); break;
    case 'flatbed': flatbed(ctx); break;
    case 'lowboy': lowboy(ctx); break;
    case 'tanker': tanker(ctx, false); break;
    case 'adr': tanker(ctx, true); break;
    case 'silo': silo(ctx); break;
    case 'tipper': tipper(ctx); break;
    case 'livestock': livestock(ctx); break;
    case 'logging': logging(ctx); break;
    case 'dolly': dolly(ctx); break;
    case 'container': container(ctx, false); break;
    case 'refcontainer': container(ctx, true); break;
    case 'carrier': carrier(ctx); break;
    case 'bdouble': bdouble(ctx); break;
    case 'boat': boat(ctx); break;
    case 'glass': glassRack(ctx); break;
    case 'crane': craneBed(ctx); break;
    case 'sidetip': sideTip(ctx); break;
    default: dryVan(ctx);
  }

  // бренд на борту (кроме случаев, когда борт занят)
  const brandOk = ['curtain', 'van', 'reefer', 'tipper', 'livestock'].includes(type);
  if (brandOk) {
    const tex = labelTexture(unit.brand, {
      width: 512, height: 128, bg: 'rgba(0,0,0,0)', fg: '#f7f4ea', accent: '#e8b45a',
      font: 'bold 64px Arial, sans-serif', border: false,
    });
    if (tex) {
      const mat = new THREE.MeshStandardMaterial({ map: tex, transparent: true, roughness: 0.5 });
      for (const side of [-1, 1]) {
        const p = plane(body, 2.4, 0.6, mat, side * (W / 2 + 0.02), deckY + 1.35, zFront + 3.0);
        p.rotation.y = side > 0 ? -HALF : HALF;
      }
    }
  }

  const views = [
    {
      id: 'exterior', label: 'Снаружи', group: 'exterior',
      pos: [12.5, 5.2, -11.5], target: [0, 1.6, 0.6], fov: 38, orbit: true, autoRotate: true,
    },
    { id: 'side', label: 'Сбоку', group: 'exterior', pos: [17.5, 2.6, 1.0], target: [0, 1.7, 0.2], fov: 32, orbit: true },
    { id: 'rear', label: 'Сзади', group: 'exterior', pos: [-6.5, 4.2, 13.5], target: [0, 1.5, 0.4], fov: 40, orbit: true },
    { id: 'front', label: 'Спереди', group: 'exterior', pos: [5.0, 4.0, -14.5], target: [0, 1.4, 0.4], fov: 40, orbit: true },
  ];
  return {
    root, wheels, paintMats: [bodyMat, bodyMat2], views, anchors,
    layout: { frontZ: zFront, rearEnd: zRear, roofY: deckY + H, deckY, axleZ, wheelRadius: R, width: W, length: L },
    kind: 'trailer',
  };
}

// ------------------------------------------------------------ кузова
function curtain(c) {
  const { M, body, bodyMat, bodyMat2, W, H, L, halfL, zFront, deckY, unit } = c;
  const top = deckY + H;
  // пол
  rbox(body, W, 0.12, L - 0.1, M.wood, 0, deckY + 0.06, 0, 0.02);
  box(body, W - 0.12, 0.02, L - 0.3, M.wood, 0, deckY + 0.13, 0);
  // боковые шторы
  const curtainMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#cfd3d0'),
    map: M.tarp?.map || null,
    roughness: 0.93,
    metalness: 0.02,
    side: THREE.DoubleSide,
  });
  for (const side of [-1, 1]) {
    const curt = plane(body, L - 0.4, H - 0.1, curtainMat, side * (W / 2 + 0.005), deckY + H / 2, 0);
    curt.rotation.y = side > 0 ? -HALF : HALF;
    // вертикальные ремни/ролики
    for (let z = zFront + 0.6; z < halfL - 0.4; z += 1.35) {
      box(body, 0.05, H - 0.12, 0.03, M.plasticGray, side * (W / 2 + 0.03), deckY + H / 2, z);
    }
    // нижняя юбка
    box(body, 0.05, 0.12, L - 0.4, M.plasticGray, side * (W / 2), deckY - 0.02, 0);
    // верхний рельс
    box(body, 0.09, 0.09, L - 0.2, M.steel, side * (W / 2), top + 0.02, 0);
  }
  // крыша-тент
  const roofMat = new THREE.MeshStandardMaterial({ color: 0xdfe3e5, map: M.tarp?.map || null, roughness: 0.94 });
  rbox(body, W + 0.04, 0.07, L - 0.2, roofMat, 0, top + 0.04, 0, 0.02);
  for (let z = zFront + 0.8; z < halfL; z += 1.5) box(body, W, 0.05, 0.05, M.steel, 0, top - 0.03, z);
  // передняя стенка
  box(body, W - 0.04, H, 0.1, bodyMat2, 0, deckY + H / 2, zFront + 0.12);
  // задние ворота с замками
  box(body, W - 0.06, H - 0.05, 0.1, bodyMat, 0, deckY + H / 2, halfL - 0.14);
  for (const side of [-1, 1]) {
    box(body, 0.12, H - 0.3, 0.05, M.steel, side * (W / 2 - 1.1), deckY + H / 2, halfL - 0.08);
    box(body, 0.05, 0.5, 0.06, M.chromeDark, side * (W / 2 - 1.1), deckY + 0.75, halfL - 0.05);
  }
  // стойки под шторой
  for (let z = zFront + 1.2; z < halfL - 0.5; z += 3.2) {
    for (const side of [-1, 1]) box(body, 0.06, H, 0.06, M.steel, side * (W / 2 - 0.06), deckY + H / 2, z);
  }
  c.anchors.push({ pos: [0, deckY + 0.6, halfL - 0.2], label: 'Задние ворота' });
  c.anchors.push({ pos: [W / 2 + 0.06, deckY + 1.4, 0], label: 'Боковая шторка' });
}

function dryVan(c) {
  const { M, body, bodyMat, bodyMat2, W, H, L, zFront, zRear, deckY } = c;
  const top = deckY + H;
  rbox(body, W, H, L - 0.3, bodyMat, 0, deckY + H / 2 + 0.05, 0, 0.06);
  // рёбра
  for (let z = zFront + 0.5; z < zRear - 0.4; z += 0.55) {
    for (const side of [-1, 1]) box(body, 0.03, H - 0.2, 0.05, bodyMat2, side * (W / 2 + 0.005), deckY + H / 2, z);
  }
  // крыша с рёбрами
  for (let z = zFront + 0.5; z < zRear - 0.4; z += 0.8) box(body, W - 0.1, 0.03, 0.06, bodyMat2, 0, top + 0.05, z);
  // задние двери
  for (const side of [-1, 1]) {
    const door = rbox(body, W / 2 - 0.1, H - 0.22, 0.08, bodyMat, side * (W / 4 - 0.02), deckY + H / 2, zRear - 0.16, 0.02);
    box(body, 0.05, 0.6, 0.05, M.chromeDark, side * (W / 4 - 0.02) - side * 0.35 + side * 0.05, deckY + 1.0, zRear - 0.1);
    // петли
    for (let y = deckY + 0.4; y < top - 0.2; y += 0.55) box(body, 0.08, 0.12, 0.06, M.steel, side * 0.05, y, zRear - 0.11);
  }
  box(body, 0.03, H - 0.2, 0.02, M.plastic, 0, deckY + H / 2, zRear - 0.1);
  c.anchors.push({ pos: [0, deckY + 0.5, zRear - 0.2], label: 'Двери фургона' });
}

function reefer(c) {
  const { M, body, bodyMat, bodyMat2, W, H, L, zFront, zRear, deckY } = c;
  const top = deckY + H;
  rbox(body, W, H, L - 0.3, bodyMat, 0, deckY + H / 2 + 0.05, 0, 0.07);
  // панели изнутри/снаружи
  for (let z = zFront + 0.4; z < zRear - 0.3; z += 0.9) {
    for (const side of [-1, 1]) box(body, 0.02, H - 0.2, 0.05, bodyMat2, side * (W / 2 + 0.005), deckY + H / 2, z);
  }
  // холодильная установка на передней стенке
  const unitBox = rbox(body, 1.7, 1.15, 0.55, M.plasticLight, 0, deckY + H - 0.72, zFront + 0.2, 0.06);
  box(body, 1.3, 0.9, 0.05, M.plastic, 0, deckY + H - 0.72, zFront - 0.1);
  for (let i = -3; i <= 3; i++) box(body, 0.06, 0.78, 0.03, M.plasticGray, i * 0.16, deckY + H - 0.72, zFront - 0.12);
  // вентилятор
  const fan = cyl(body, 0.3, 0.3, 0.1, M.plastic, 0, deckY + H - 1.35, zFront + 0.15, 20);
  fan.rotation.x = HALF;
  // топливный бачок установки
  rbox(body, 0.5, 0.5, 0.35, M.plasticGray, -0.9, deckY + 0.55, zFront + 0.25, 0.04);
  // дверные петли и уплотнитель
  for (const side of [-1, 1]) {
    box(body, 0.06, H - 0.2, 0.05, M.chromeDark, side * (W / 2 - 0.06), deckY + H / 2, zRear - 0.06);
    for (let y = deckY + 0.4; y < top - 0.2; y += 0.55) box(body, 0.08, 0.12, 0.06, M.steel, side * 0.05, y, zRear - 0.11);
  }
  c.anchors.push({ pos: [0, deckY + H - 0.6, zFront - 0.2], label: 'Холодильная установка' });
}

function flatbed(c) {
  const { M, body, W, L, zFront, zRear, deckY, halfL } = c;
  // стальной пол
  rbox(body, W, 0.12, L - 0.2, M.steel, 0, deckY + 0.06, 0, 0.02);
  for (let z = zFront + 0.4; z < zRear - 0.2; z += 0.6) box(body, W - 0.2, 0.02, 0.06, M.darkSteel, 0, deckY + 0.13, z);
  // борта
  for (const side of [-1, 1]) {
    box(body, 0.07, 0.38, L - 0.3, M.steel, side * (W / 2), deckY + 0.3, 0);
    box(body, 0.05, 0.06, L - 0.3, M.chromeDark, side * (W / 2), deckY + 0.5, 0);
    for (let z = zFront + 0.4; z < zRear - 0.2; z += 1.2) box(body, 0.06, 0.34, 0.05, M.darkSteel, side * (W / 2), deckY + 0.32, z);
  }
  box(body, W, 0.34, 0.07, M.steel, 0, deckY + 0.3, zFront + 0.25);
  // коники (стойки) сзади и спереди
  for (const z of [zFront + 1.0, halfL - 2.0, halfL - 0.6]) {
    for (const side of [-1, 1]) {
      box(body, 0.1, 1.3, 0.1, M.darkSteel, side * (W / 2 - 0.1), deckY + 0.7, z);
      pipe(body, [side * (W / 2 - 0.1), deckY + 1.3, z], [side * 0.2, deckY + 1.34, z], 0.04, M.steel);
    }
  }
  // груз: стальные трубы с ремнями
  for (let i = 0; i < 5; i++) {
    const y = deckY + 0.32 + i * 0.16;
    const pipeG = cyl(body, 0.13, 0.13, L - 2.6, M.steel, -0.35 + (i % 2) * 0.55, y, -0.4, 14);
    pipeG.rotation.x = HALF;
  }
  for (const z of [zFront + 2.2, halfL - 3.0]) {
    box(body, W - 0.3, 0.02, 0.07, M.rope, 0, deckY + 0.9, z);
    for (const side of [-1, 1]) box(body, 0.03, 0.85, 0.03, M.rope, side * (W / 2 - 0.2), deckY + 0.55, z);
  }
  c.anchors.push({ pos: [0, deckY + 0.9, -0.4], label: 'Груз: стальные трубы' });
}

function lowboy(c) {
  const { M, body, W, L, zFront, zRear, deckY, halfL } = c;
  const low = deckY - 0.05;
  // заниженная площадка
  rbox(body, W, 0.16, L - 4.4, M.steel, 0, low, zRear - 3.2, 0.02);
  for (let z = zFront + 3.2; z < zRear - 0.6; z += 0.9) box(body, W - 0.2, 0.06, 0.1, M.darkSteel, 0, low - 0.08, z);
  // «гусиная шея»
  rbox(body, W - 0.2, 0.9, 3.2, M.steel, 0, deckY + 0.4, zFront + 1.9, 0.05);
  box(body, W - 0.4, 0.12, 3.2, M.darkSteel, 0, deckY + 0.86, zFront + 1.9);
  // выдвижная рампа
  const ramp = rbox(body, W - 0.3, 0.12, 3.6, M.steel, 0, low + 0.05, zRear + 1.7, 0.03);
  ramp.rotation.x = -0.12;
  for (const side of [-1, 1]) box(body, 0.06, 0.16, 3.6, M.darkSteel, side * (W / 2 - 0.2), low + 0.12, zRear + 1.7);
  // груз: экскаватор
  const ex = group(body, 'excavator');
  ex.position.set(0, low + 0.08, zRear - 3.4);
  const paM = std('#c9a227', 0.5, 0.3);
  const trk = std('#1b1d1f', 0.85, 0.1);
  for (const side of [-1, 1]) {
    rbox(ex, 0.52, 0.44, 3.0, trk, side * 0.72, 0.3, 0, 0.1);
    for (let i = -2; i <= 2; i++) cyl(ex, 0.2, 0.2, 0.53, M.steel, side * 0.72, 0.3, i * 0.6, 12).rotation.z = HALF;
  }
  rbox(ex, 2.1, 0.3, 2.4, M.darkSteel, 0, 0.6, 0, 0.04);
  rbox(ex, 1.7, 0.72, 1.9, paM, 0, 1.06, 0.2, 0.08);
  rbox(ex, 0.8, 0.9, 0.9, paM, -0.55, 1.5, -0.55, 0.05);
  rbox(ex, 0.62, 0.5, 0.62, M.glassDark, -0.55, 1.6, -0.6, 0.03);
  // стрела
  const boom = rbox(ex, 0.3, 0.28, 2.4, paM, 0.1, 1.6, 0.9, 0.04);
  boom.rotation.x = -0.55;
  const arm = rbox(ex, 0.22, 0.2, 1.8, paM, 0.1, 1.95, 2.6, 0.03);
  arm.rotation.x = 0.5;
  const bucket = rbox(ex, 0.75, 0.5, 0.7, std('#4c4f52', 0.6, 0.4), 0.1, 1.55, 3.25, 0.05);
  c.anchors.push({ pos: [0, low + 1.4, zRear - 3.4], label: 'Груз: гусеничный экскаватор' });
}

function tanker(c, adr) {
  const { M, body, W, L, zFront, zRear, deckY, unit } = c;
  const r = 1.02;
  const y = deckY + r + 0.16;
  const shellMat = adr ? std('#e8e9e4', 0.4, 0.4) : M.tank;
  // обечайка
  const len = L - 2.4;
  const geo = new THREE.CylinderGeometry(r, r, len, 36, 1, false);
  const shell = new THREE.Mesh(geo, shellMat);
  shell.rotation.x = HALF;
  shell.position.set(0, y, -0.2);
  body.add(shell);
  // днища-полусферы
  for (const side of [-1, 1]) {
    const cap = new THREE.Mesh(new THREE.SphereGeometry(r, 32, 16, 0, TAU, 0, HALF), shellMat);
    cap.rotation.x = side > 0 ? -HALF : HALF;
    cap.position.set(0, y, side > 0 ? len / 2 - 0.2 : -len / 2 - 0.2);
    cap.scale.z = 0.55;
    body.add(cap);
  }
  // обечайки-рёбра и кольца
  for (let i = 0; i < 4; i++) {
    const ring = torus(body, r + 0.01, 0.03, M.steel, 0, y, -len / 2 + 0.5 + i * (len - 1) / 3, 32);
    ring.rotation.y = 0;
  }
  // горловины сверху
  for (let i = 0; i < 3; i++) {
    const hatch = cyl(body, 0.26, 0.3, 0.18, M.chromeDark, 0, y + r + 0.06, -len / 3 + i * (len / 3), 20);
    const cover = cyl(body, 0.3, 0.3, 0.05, M.chrome, 0, y + r + 0.16, -len / 3 + i * (len / 3), 20);
    const lever = box(body, 0.5, 0.04, 0.06, M.steel, 0, y + r + 0.2, -len / 3 + i * (len / 3));
  }
  // лестница и площадка
  for (let i = 0; i < 5; i++) {
    box(body, 0.5, 0.04, 0.04, M.steel, 0.6, deckY + 0.5 + i * 0.42, zRear - 0.35);
  }
  for (const side of [-1, 1]) {
    pipe(body, [0.85, deckY + 0.3, zRear - 0.35], [0.85, y + r - 0.1, zRear - 0.35], 0.025, M.steel);
    pipe(body, [0.36, deckY + 0.3, zRear - 0.35], [0.36, y + r - 0.1, zRear - 0.35], 0.025, M.steel);
  }
  // опоры-ложементы
  for (const z of [-len / 2 + 0.6, 0, len / 2 - 0.6]) {
    for (const side of [-1, 1]) box(body, 0.16, 0.5, 0.5, M.darkSteel, side * 0.8, deckY + 0.25, z);
    box(body, W - 0.4, 0.16, 0.6, M.darkSteel, 0, deckY + 0.2, z);
  }
  // нижний налив
  const valve = cyl(body, 0.12, 0.12, 0.4, M.chrome, 0, deckY + 0.1, 0.8, 14);
  valve.rotation.x = HALF;
  if (adr) {
    // оранжевые таблички ADR
    const adrTex = labelTexture('33 1203', {
      width: 256, height: 128, bg: '#e08a1e', fg: '#1a1a1a', accent: '#1a1a1a',
      font: 'bold 54px Arial, sans-serif', border: true,
    });
    if (adrTex) {
      const m = new THREE.MeshStandardMaterial({ map: adrTex, roughness: 0.5 });
      for (const side of [-1, 1]) {
        const p = plane(body, 0.62, 0.3, m, side * (r + 0.02), y + 0.25, -1.5);
        p.rotation.y = side > 0 ? -HALF : HALF;
        const p2 = plane(body, 0.62, 0.3, m, side * (r + 0.02), y + 0.25, 1.6);
        p2.rotation.y = side > 0 ? -HALF : HALF;
      }
      const rearP = plane(body, 0.62, 0.3, m, 0, y - 0.1, len / 2 + 0.18);
    }
    // полосы опасности
    box(body, W - 0.2, 0.1, 0.04, M.hazard, 0, deckY + 0.42, zRear - 0.1);
  }
  c.anchors.push({ pos: [0, y + r + 0.2, -len / 3], label: 'Горловина люка' });
  c.anchors.push({ pos: [0, deckY + 0.1, 1.1], label: 'Нижний налив' });
}

function silo(c) {
  const { M, body, W, L, zFront, zRear, deckY } = c;
  const mat = std('#d3d7d9', 0.45, 0.35);
  const y0 = deckY + 0.2;
  // два конических бункера
  for (let i = 0; i < 2; i++) {
    const z = -L / 4 + 0.2 + i * (L / 2 - 0.4);
    const cone = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 1.05, 2.1, 24, 1, false), mat);
    cone.position.set(0, y0 + 1.05, z);
    body.add(cone);
    const top = new THREE.Mesh(new THREE.SphereGeometry(0.92, 24, 12, 0, TAU, 0, HALF), mat);
    top.position.set(0, y0 + 2.1, z);
    top.scale.set(0.68, 0.5, 1.1);
    body.add(top);
    // верхний люк
    cyl(body, 0.22, 0.26, 0.14, M.chromeDark, 0, y0 + 2.42, z, 16);
    // рёбра
    for (let k = 0; k < 3; k++) {
      const ring = torus(body, 1.0 - k * 0.12, 0.03, M.steel, 0, y0 + 0.5 + k * 0.65, z, 24);
      ring.rotation.y = 0;
    }
  }
  // рама-опоры
  for (const side of [-1, 1]) {
    for (let z = zFront + 1.2; z < zRear; z += 2.4) {
      box(body, 0.1, 1.8, 0.1, M.darkSteel, side * 0.95, y0 + 0.9, z);
    }
  }
  // компрессор спереди
  rbox(body, 0.9, 0.6, 0.7, M.plasticGray, 0, deckY + 0.5, zFront + 0.8, 0.06);
  cyl(body, 0.22, 0.22, 0.5, M.steel, 0.45, deckY + 0.55, zFront + 0.8, 16).rotation.z = HALF;
  // трубопровод
  pipe(body, [0.4, deckY + 0.7, zFront + 0.8], [0.4, deckY + 1.9, zFront + 1.9], 0.05, M.steel);
  // разгрузочные шланги
  for (let i = 0; i < 2; i++) {
    const hose = new THREE.Mesh(new THREE.TorusGeometry(0.35, 0.05, 8, 16, PI), M.rubberTrim);
    hose.position.set(0.15, deckY + 0.35, zRear - 0.6 - i * 0.35);
    hose.rotation.y = HALF;
    body.add(hose);
  }
  c.anchors.push({ pos: [0, deckY + 1.2, 0], label: 'Бункер-цистерна' });
  c.anchors.push({ pos: [0, deckY + 0.55, zFront + 0.8], label: 'Компрессор' });
}

function tipper(c) {
  const { M, body, bodyMat, bodyMat2, W, H, L, zFront, zRear, deckY } = c;
  const h = Math.max(H, 1.7);
  // ковш
  rbox(body, W, 0.14, L - 0.3, M.darkSteel, 0, deckY + 0.2, 0, 0.02);
  for (const side of [-1, 1]) {
    rbox(body, 0.1, h, L - 0.3, bodyMat, side * (W / 2 - 0.05), deckY + 0.2 + h / 2, 0, 0.02);
    box(body, 0.09, 0.1, L - 0.4, M.steel, side * (W / 2 - 0.03), deckY + 0.2 + h, 0);
    // рёбра
    for (let z = zFront + 0.8; z < zRear - 0.3; z += 1.0) box(body, 0.03, h - 0.15, 0.12, bodyMat2, side * (W / 2), deckY + 0.2 + h / 2, z);
  }
  box(body, W - 0.1, h, 0.12, bodyMat, 0, deckY + 0.2 + h / 2, zFront + 0.22);
  // задний борт на петлях
  const tail = rbox(body, W - 0.1, h - 0.15, 0.1, bodyMat, 0, deckY + 0.2 + h / 2, zRear - 0.16, 0.02);
  box(body, W - 0.2, 0.06, 0.06, M.steel, 0, deckY + 0.25 + h, zRear - 0.12);
  for (const side of [-1, 1]) cyl(body, 0.04, 0.04, 0.16, M.chromeDark, side * (W / 2 - 0.15), deckY + 0.25, zRear - 0.16, 8);
  // гидроцилиндр
  const cylBase = rbox(body, 0.18, 0.9, 0.18, M.hazard, -0.55, deckY + 0.75, zFront + 1.2, 0.03);
  const rod = cyl(body, 0.05, 0.05, 1.1, M.chrome, -0.55, deckY + 1.55, zFront + 1.4, 12);
  rod.rotation.x = -0.32;
  // тент-крышка
  const cover = rbox(body, W, 0.06, L - 0.5, M.tarp, 0, deckY + 0.2 + h + 0.04, 0, 0.02);
  // груз: щебень
  const loadMat = std('#6f6a63', 0.98, 0.02);
  for (let i = 0; i < 26; i++) {
    const s = 0.12 + Math.random() * 0.12;
    const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(s, 0), loadMat);
    rock.position.set((Math.random() - 0.5) * (W - 0.5), deckY + 0.25 + h + 0.02, (Math.random() - 0.5) * (L - 1.2));
    rock.rotation.set(Math.random(), Math.random(), Math.random());
    body.add(rock);
  }
  c.anchors.push({ pos: [0, deckY + h + 0.2, 0], label: 'Самосвальный ковш' });
}

function livestock(c) {
  const { M, body, bodyMat, bodyMat2, W, H, L, zFront, zRear, deckY } = c;
  const h = Math.max(H, 2.6);
  // каркас и два яруса
  for (const side of [-1, 1]) {
    for (let z = zFront + 0.8; z < zRear - 0.4; z += 1.2) {
      box(body, 0.1, h, 0.1, M.steel, side * (W / 2 - 0.1), deckY + h / 2, z);
    }
    box(body, 0.1, 0.1, L - 0.5, M.steel, side * (W / 2 - 0.1), deckY + h - 0.1, 0);
    box(body, 0.1, 0.1, L - 0.5, M.darkSteel, side * (W / 2 - 0.1), deckY + h * 0.5, 0);
  }
  // стенки: вертикальные планки
  for (const side of [-1, 1]) {
    for (let z = zFront + 0.6; z < zRear - 0.4; z += 0.14) {
      box(body, 0.04, h - 0.3, 0.03, bodyMat2, side * (W / 2), deckY + h / 2, z);
    }
    // продольные поручни
    for (const y of [0.4, 0.9, 1.4, 1.9]) box(body, 0.07, 0.05, L - 0.4, M.steel, side * (W / 2), deckY + y, 0);
  }
  // межъярусный пол
  box(body, W - 0.2, 0.06, L - 0.5, M.steel, 0, deckY + h * 0.5, 0);
  for (let z = zFront + 1; z < zRear - 0.5; z += 0.8) {
    box(body, W - 0.25, 0.04, 0.06, M.darkSteel, 0, deckY + h * 0.5 + 0.03, z);
  }
  // крыша и вентиляция
  rbox(body, W, 0.08, L - 0.3, bodyMat, 0, deckY + h + 0.05, 0, 0.02);
  for (let i = 0; i < 6; i++) {
    rbox(body, 0.7, 0.18, 0.7, M.plasticGray, 0, deckY + h + 0.16, zFront + 1.4 + i * 2.0, 0.03);
  }
  // задний трап
  const ramp = rbox(body, W - 0.3, 0.08, 2.0, M.steel, 0, deckY + 0.05, zRear + 0.8, 0.02);
  ramp.rotation.x = 0.14;
  // поилки
  for (const side of [-1, 1]) {
    const trough = rbox(body, 0.18, 0.18, 1.4, M.steel, side * 0.75, deckY + 0.6, -2.0, 0.03);
  }
  c.anchors.push({ pos: [0, deckY + h * 0.6, 0], label: 'Двухъярусный отсек' });
}

function logging(c) {
  const { M, body, W, L, zFront, zRear, deckY, halfL } = c;
  // рама
  rbox(body, W - 0.3, 0.16, L - 0.4, M.darkSteel, 0, deckY, 0, 0.02);
  // коники
  const posts = [zFront + 1.4, -1.0, zRear - 2.0];
  for (const z of posts) {
    for (const side of [-1, 1]) {
      const post = rbox(body, 0.12, 1.5, 0.12, M.steel, side * (W / 2 - 0.15), deckY + 0.75, z, 0.02);
      post.rotation.z = side * 0.12;
      box(body, 0.5, 0.12, 0.14, M.darkSteel, side * (W / 2 - 0.3), deckY + 0.1, z);
    }
    box(body, W - 0.2, 0.1, 0.1, M.darkSteel, 0, deckY + 0.1, z);
  }
  // брёвна
  const barkMat = std('#6b4a2e', 0.95, 0.02);
  const endMat = std('#c9a06a', 0.9, 0.02);
  const logs = [];
  let idx = 0;
  for (let row = 0; row < 4; row++) {
    const count = 4 - Math.floor(row / 2);
    for (let i = 0; i < count; i++) {
      const r = 0.19 + Math.random() * 0.05;
      const x = (i - (count - 1) / 2) * 0.47;
      const y = deckY + 0.28 + row * 0.4;
      const z = 0.2 + (Math.random() - 0.5) * 0.5;
      const len = L - 1.6;
      const log = cyl(body, r, r, len, barkMat, x, y, z, 12);
      log.rotation.x = HALF;
      // торцы
      const e1 = cyl(body, r * 0.98, r * 0.98, 0.03, endMat, x, y, z - len / 2, 12);
      e1.rotation.x = HALF;
      const e2 = cyl(body, r * 0.98, r * 0.98, 0.03, endMat, x, y, z + len / 2, 12);
      e2.rotation.x = HALF;
      logs.push(log);
    }
  }
  // стяжные цепи
  for (const z of [zFront + 1.4, -1.0, zRear - 2.0]) {
    box(body, W - 0.2, 0.03, 0.03, M.rope, 0, deckY + 1.7, z);
    for (const side of [-1, 1]) box(body, 0.03, 1.5, 0.03, M.rope, side * (W / 2 - 0.18), deckY + 0.95, z);
  }
  c.anchors.push({ pos: [0, deckY + 1.2, 0], label: 'Штабель брёвен' });
}

function dolly(c) {
  const { M, body, W, L, zFront, zRear, deckY } = c;
  box(body, 0.16, 0.16, L - 2.6, M.darkSteel, 0, deckY - 0.1, 0.5);
  for (const side of [-1, 1]) box(body, 0.14, 0.14, L - 2.8, M.steel, side * 0.5, deckY - 0.14, 0.6);
  // коники
  for (const z of [-1.2, 0.6, 2.4, zRear - 0.3]) {
    for (const side of [-1, 1]) {
      const post = rbox(body, 0.1, 1.4, 0.1, M.steel, side * 1.0, deckY + 0.6, z, 0.02);
      post.rotation.z = side * 0.15;
    }
    box(body, W - 0.4, 0.12, 0.12, M.darkSteel, 0, deckY - 0.05, z);
  }
  // груз: трубы
  for (let i = 0; i < 3; i++) {
    const p = cyl(body, 0.24, 0.24, 7.0, M.steel, -0.6 + i * 0.62, deckY + 0.4 + (i % 2) * 0.1, -0.4, 16);
    p.rotation.x = HALF;
  }
  c.anchors.push({ pos: [0, deckY + 0.8, 1.0], label: 'Коники и трубы' });
}

function containerBody(c, { color = '#275b78', reefer = false } = {}) {
  const { M, body, W, zFront, zRear, deckY } = c;
  const w = Math.min(W, 2.44);
  const h = 2.55;
  const l = 12.2;
  const mat = std(color, 0.7, 0.3);
  const dark = std(new THREE.Color(color).multiplyScalar(0.8), 0.75, 0.3);
  rbox(body, w, h, l, mat, 0, deckY + 0.18 + h / 2, 0, 0.04);
  // гофрированные стенки
  for (let z = zFront + 0.9; z < zRear - 0.8; z += 0.32) {
    for (const side of [-1, 1]) box(body, 0.035, h - 0.18, 0.1, dark, side * (w / 2 + 0.012), deckY + 0.18 + h / 2, z);
  }
  // рама-поддон
  box(body, w, 0.14, l, M.darkSteel, 0, deckY + 0.12, 0);
  // торцевые двери
  for (const side of [-1, 1]) {
    box(body, 0.05, h - 0.2, 0.08, M.steel, side * 0.55, deckY + 0.18 + h / 2, zRear - 0.75);
    for (let i = 0; i < 4; i++) box(body, 0.06, 0.3, 0.06, M.chromeDark, side * 0.55, deckY + 0.4 + i * 0.55, zRear - 0.7);
  }
  for (const side of [-1, 1]) {
    for (const z of [-l / 2 + 0.4, l / 2 - 0.4]) box(body, 0.16, 0.16, 0.16, M.steel, side * (w / 2 - 0.1), deckY + 0.1, z);
  }
  // маркировка
  const tex = labelTexture('PORTLINE', {
    width: 512, height: 128, bg: 'rgba(0,0,0,0)', fg: '#f4f2e8', accent: color,
    font: 'bold 62px Arial, sans-serif', border: false,
  });
  if (tex) {
    const m = new THREE.MeshStandardMaterial({ map: tex, transparent: true, roughness: 0.6 });
    for (const side of [-1, 1]) {
      const p = plane(body, 2.6, 0.65, m, side * (w / 2 + 0.05), deckY + 0.18 + h / 2 + 0.3, 0.8);
      p.rotation.y = side > 0 ? -HALF : HALF;
    }
  }
  if (reefer) {
    rbox(body, w - 0.3, 1.0, 0.5, M.plasticLight, 0, deckY + 0.18 + h - 0.7, zFront + 1.0, 0.05);
    for (let i = -3; i <= 3; i++) box(body, 0.05, 0.7, 0.03, M.plasticGray, i * 0.14, deckY + 0.18 + h - 0.7, zFront + 0.73);
    const fan = cyl(body, 0.28, 0.28, 0.08, M.plastic, 0, deckY + 0.18 + h - 1.3, zFront + 1.0, 18);
    fan.rotation.x = HALF;
  }
  return { w, h, l };
}

function container(c, reefer) {
  const { M, body, W, L, zFront, zRear, deckY, unit } = c;
  // платформа с фитингами
  rbox(body, W - 0.1, 0.18, L - 0.6, M.darkSteel, 0, deckY + 0.05, 0, 0.02);
  for (const z of [-5.2, 5.2]) {
    for (const side of [-1, 1]) {
      box(body, 0.24, 0.14, 0.24, M.steel, side * (W / 2 - 0.3), deckY + 0.16, z);
      box(body, 0.1, 0.05, 0.1, M.chromeDark, side * (W / 2 - 0.3), deckY + 0.26, z);
    }
  }
  containerBody(c, { color: reefer ? '#e8ebe6' : unit.color, reefer });
  c.anchors.push({ pos: [W / 2, deckY + 1.6, 0], label: reefer ? 'Реф-контейнер' : 'Контейнер 40′' });
  c.anchors.push({ pos: [W / 2 - 0.3, deckY + 0.2, -5.2], label: 'Twist-lock фитинг' });
}

function carrier(c) {
  const { M, body, W, L, zFront, zRear, deckY } = c;
  const rail = M.steel;
  const dark = M.darkSteel;
  // нижняя палуба
  for (const side of [-1, 1]) box(body, 0.12, 0.3, L - 0.6, dark, side * (W / 2 - 0.2), deckY - 0.02, 0);
  for (let z = zFront + 0.8; z < zRear - 0.3; z += 1.3) box(body, W - 0.3, 0.1, 0.1, dark, 0, deckY + 0.02, z);
  // стойки и верхняя палуба
  const topY = deckY + 3.3;
  for (const z of [zFront + 1.0, zFront + 6.3, zRear - 1.2]) {
    for (const side of [-1, 1]) {
      box(body, 0.14, 3.4, 0.14, rail, side * (W / 2 - 0.15), deckY + 1.7, z);
    }
  }
  for (const side of [-1, 1]) box(body, 0.14, 0.16, L - 1.2, dark, side * (W / 2 - 0.15), topY, 0);
  for (let z = zFront + 1.2; z < zRear - 0.8; z += 1.4) box(body, W - 0.3, 0.08, 0.1, dark, 0, topY, z);
  // гидравлика
  for (const side of [-1, 1]) {
    const h = rbox(body, 0.12, 1.2, 0.12, M.hazard, side * 1.02, deckY + 0.8, zFront + 3.5, 0.02);
    h.rotation.x = -0.2;
  }
  // автомобили: 3 внизу и 3 наверху (упрощённые модели)
  const colors = ['#2f5d8a', '#c9402f', '#e9ecec', '#e0b528', '#4f5844', '#7a8086'];
  let i = 0;
  for (const z of [zFront + 2.0, zFront + 5.0, zFront + 8.0]) {
    for (let k = 0; k < 1; k++) {
      const car = buildCar({ id: 'carrier-car', name: '', brand: '', style: 'sedan', paint: colors[i % colors.length], accent: '#d8d5c8', length: 4.4, width: 1.8, height: 1.4, wheelbase: 2.6, wheelRadius: 0.31, wheelWidth: 0.2 }, M, { simple: true, wheels: false });
      car.root.position.set(0, deckY + 0.08, z);
      car.root.rotation.y = PI / 2;
      body.add(car.root);
      const top = i < 3 ? topY + 0.08 : deckY + 0.08;
    }
    i++;
  }
  let j = 3;
  for (const z of [zFront + 2.4, zFront + 5.6, zFront + 8.6]) {
    const car = buildCar({ id: 'carrier-car2', name: '', brand: '', style: 'sedan', paint: colors[j % colors.length], accent: '#d8d5c8', length: 4.4, width: 1.8, height: 1.4, wheelbase: 2.6, wheelRadius: 0.31, wheelWidth: 0.2 }, M, { simple: true, wheels: false });
    car.root.position.set(0, topY + 0.1, z);
    car.root.rotation.y = PI / 2;
    body.add(car.root);
    j++;
  }
  // аппарели
  for (const z of [zRear - 0.2]) {
    const r = rbox(body, W - 0.6, 0.1, 2.6, M.steel, 0, deckY - 0.6, zRear + 0.9, 0.02);
    r.rotation.x = 0.2;
  }
  c.anchors.push({ pos: [W / 2, topY - 0.4, zFront + 5.0], label: 'Верхняя палуба' });
}

function bdouble(c) {
  const { M, body, W, L, zFront, zRear, deckY } = c;
  const half = L / 2;
  // передняя секция
  const frontBox = rbox(body, W, 2.7, 7.0, std('#d5d8d3', 0.7, 0.12), 0, deckY + 1.45, zFront + 3.8, 0.05);
  // задняя секция
  const rearBox = rbox(body, W, 2.7, 6.4, std('#d5d8d3', 0.7, 0.12), 0, deckY + 1.45, zRear - 3.6, 0.05);
  // соединительная балка
  box(body, 0.9, 0.3, 2.2, M.darkSteel, 0, deckY + 0.1, 0.4);
  for (const side of [-1, 1]) box(body, 0.12, 0.24, 3.2, M.steel, side * 0.55, deckY + 0.05, 0.4);
  // рёбра кузовов
  for (const sec of [{ z0: zFront + 0.6, z1: zFront + 7.2 }, { z0: zRear - 6.7, z1: zRear - 0.4 }]) {
    for (let z = sec.z0; z < sec.z1; z += 0.6) {
      for (const side of [-1, 1]) box(body, 0.03, 2.5, 0.05, std('#c2c6c2', 0.75, 0.1), side * (W / 2 + 0.006), deckY + 1.45, z);
    }
  }
  // тележка посередине
  for (const z of [1.0, 1.8]) {
    for (const side of [-1, 1]) box(body, 0.1, 0.4, 0.1, M.steel, side * 0.8, deckY - 0.2, z);
  }
  // светоотражающие полосы
  for (const side of [-1, 1]) {
    box(body, 0.02, 0.12, 6.4, M.hazard, side * (W / 2 + 0.02), deckY + 0.35, zFront + 3.8);
    box(body, 0.02, 0.12, 5.8, M.hazard, side * (W / 2 + 0.02), deckY + 0.35, zRear - 3.6);
  }
  c.anchors.push({ pos: [0, deckY + 0.2, 0.4], label: 'Соединительная балка' });
}

function boat(c) {
  const { M, body, W, zFront, zRear, deckY } = c;
  // ложе с роликами
  for (const side of [-1, 1]) {
    const rail = box(body, 0.12, 0.16, 7.0, M.darkSteel, side * 0.85, deckY - 0.2, 0.2);
    for (let z = zFront + 1.4; z < zRear - 1.2; z += 0.9) {
      const roller = cyl(body, 0.11, 0.11, 0.4, M.rubberTrim, side * 0.85, deckY - 0.02, z, 12);
      roller.rotation.z = HALF;
    }
  }
  // дышло
  pipe(body, [-0.4, deckY - 0.3, zFront + 0.5], [0, deckY - 0.3, zFront - 1.1], 0.06, M.steel);
  pipe(body, [0.4, deckY - 0.3, zFront + 0.5], [0, deckY - 0.3, zFront - 1.1], 0.06, M.steel);
  cyl(body, 0.09, 0.09, 0.3, M.steel, 0, deckY - 0.5, zFront - 1.25, 10).rotation.x = HALF;
  // лебёдка
  rbox(body, 0.3, 0.3, 0.4, M.chromeDark, 0, deckY + 0.05, zFront + 0.9, 0.03);
  // катер
  const hullMat = std('#f2f4f2', 0.25, 0.25);
  const hullDark = std('#1f3d5c', 0.4, 0.3);
  const hull = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 0.45, 4.8, 20, 1, false, 0, TAU, 0, HALF), hullMat);
  hull.rotation.x = HALF;
  hull.rotation.z = HALF;
  hull.scale.set(1.0, 0.72, 1.0);
  hull.position.set(0, deckY + 0.5, -0.2);
  body.add(hull);
  // планшир
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.9, 0.08, 8, 24, PI), hullDark);
  rim.rotation.x = HALF;
  rim.position.set(0, deckY + 0.52, -0.2);
  rim.scale.set(1.0, 1.0, 0.72);
  body.add(rim);
  // лобовое стекло и консоль
  const ws = rbox(body, 1.5, 0.5, 0.08, M.glassDark, 0, deckY + 1.0, -2.0, 0.03);
  ws.rotation.x = -0.35;
  rbox(body, 1.4, 0.25, 0.5, M.plasticLight, 0, deckY + 0.8, -1.5, 0.05);
  // сиденье
  rbox(body, 0.7, 0.25, 0.6, std('#2d3440', 0.8, 0.05), 0, deckY + 0.82, -0.9, 0.05);
  // мотор
  rbox(body, 0.45, 0.7, 0.5, M.plastic, 0, deckY + 0.9, 2.3, 0.05);
  box(body, 0.3, 0.3, 0.1, M.plasticGray, 0, deckY + 0.8, 2.58);
  c.anchors.push({ pos: [0, deckY + 1.0, -0.2], label: 'Катер на роликах' });
}

function glassRack(c) {
  const { M, body, W, L, zFront, zRear, deckY } = c;
  // A-образные стойки
  for (let i = 0; i < 5; i++) {
    const z = zFront + 1.6 + i * 2.3;
    for (const side of [-1, 1]) {
      pipe(body, [side * (W / 2 - 0.2), deckY, z], [0, deckY + 3.0, z], 0.06, M.darkSteel);
      pipe(body, [side * (W / 2 - 0.2), deckY, z], [side * 0.6, deckY + 1.6, z], 0.05, M.steel);
    }
    box(body, W - 0.3, 0.1, 0.14, M.darkSteel, 0, deckY + 1.5, z);
  }
  // листы стекла
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0x9fc9c0, metalness: 0.1, roughness: 0.05, transparent: true, opacity: 0.55,
    side: THREE.DoubleSide, envMapIntensity: 1.4,
  });
  for (let i = 0; i < 7; i++) {
    const sheet = box(body, 0.04, 2.3, L - 4.0, glassMat, -0.5 + i * 0.11, deckY + 1.2, 0.2);
    sheet.rotation.z = 0.03;
  }
  // ремни и прокладки
  for (const z of [zFront + 3.0, 0, zRear - 3.2]) {
    box(body, W - 0.2, 0.05, 0.08, M.rope, 0, deckY + 1.0, z);
  }
  box(body, 0.9, 0.16, L - 4.2, M.fabric, -0.2, deckY + 0.12, 0.2);
  c.anchors.push({ pos: [0, deckY + 2.2, 0], label: 'Пакет листового стекла' });
}

function craneBed(c) {
  const { M, body, W, L, zFront, zRear, deckY, halfL } = c;
  rbox(body, W, 0.16, L - 0.3, M.steel, 0, deckY + 0.08, 0, 0.02);
  for (let z = zFront + 0.6; z < zRear - 0.3; z += 0.7) box(body, W - 0.2, 0.02, 0.06, M.darkSteel, 0, deckY + 0.17, z);
  // борта
  for (const side of [-1, 1]) {
    box(body, 0.07, 0.4, L - 0.4, M.steel, side * (W / 2), deckY + 0.35, 0);
    for (let z = zFront + 0.6; z < zRear - 0.3; z += 1.1) box(body, 0.06, 0.36, 0.05, M.darkSteel, side * (W / 2), deckY + 0.36, z);
  }
  // кран-манипулятор у передней стенки
  const craneMat = std('#c94a1e', 0.5, 0.3);
  const baseZ = zFront + 1.7;
  cyl(body, 0.55, 0.6, 0.3, M.darkSteel, 0, deckY + 0.35, baseZ, 20);
  const col = cyl(body, 0.34, 0.34, 1.5, craneMat, 0, deckY + 1.2, baseZ, 18);
  const boom = rbox(body, 0.28, 0.28, 4.2, craneMat, 0, deckY + 2.1, baseZ + 1.4, 0.05);
  boom.rotation.x = 0.42;
  const jib = rbox(body, 0.2, 0.2, 2.4, craneMat, 0, deckY + 2.55, baseZ + 3.6, 0.03);
  jib.rotation.x = -0.55;
  // гидроцилиндр стрелы
  const ram = cyl(body, 0.06, 0.06, 1.5, M.chrome, 0, deckY + 1.35, baseZ + 0.65, 10);
  ram.rotation.x = 1.0;
  // крюк и трос
  pipe(body, [0, deckY + 2.05, baseZ + 4.5], [0, deckY + 1.25, baseZ + 4.5], 0.012, M.steel);
  const hook = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.03, 6, 12, PI * 1.4), M.steel);
  hook.position.set(0, deckY + 1.15, baseZ + 4.5);
  hook.rotation.x = HALF;
  body.add(hook);
  // аутригеры
  for (const side of [-1, 1]) {
    const leg = rbox(body, 0.9, 0.16, 0.22, M.darkSteel, side * (W / 2 + 0.2), deckY - 0.02, baseZ - 1.1, 0.02);
    box(body, 0.16, 0.9, 0.16, M.hazard, side * (W / 2 + 0.5), deckY - 0.45, baseZ - 1.1);
    box(body, 0.38, 0.06, 0.38, M.steel, side * (W / 2 + 0.5), deckY - 0.9, baseZ - 1.1);
  }
  // груз: поддоны
  for (let i = 0; i < 3; i++) {
    rbox(body, 1.1, 1.2, 1.2, M.wood, 0.2, deckY + 0.75, halfL - 2.2 - i * 1.5, 0.02);
  }
  c.anchors.push({ pos: [0, deckY + 2.2, baseZ + 1.4], label: 'Кран-манипулятор' });
}

function sideTip(c) {
  const { M, body, bodyMat, bodyMat2, W, L, zFront, zRear, deckY, unit } = c;
  const h = Math.max(unit.height ?? 1.8, 1.6);
  rbox(body, W, 0.14, L - 0.3, M.darkSteel, 0, deckY + 0.2, 0, 0.02);
  // ковш с наклоном в сторону (показан поднятым)
  const tilt = group(body);
  tilt.position.set(-W / 2 + 0.12, deckY + 0.2, 0);
  tilt.rotation.z = -0.12;
  const mat = bodyMat;
  rbox(tilt, W, h, L - 0.4, mat, W / 2, h / 2, 0, 0.03);
  for (const side of [-1, 1]) {
    box(tilt, 0.08, 0.1, L - 0.5, M.steel, W / 2 + side * (W / 2 - 0.02), h, 0);
    for (let z = zFront + 0.8; z < zRear - 0.3; z += 1.1) box(tilt, 0.03, h - 0.15, 0.1, bodyMat2, W / 2 + side * (W / 2), h / 2, z);
  }
  box(tilt, W, h, 0.1, bodyMat, W / 2, h / 2, zFront + 0.2);
  box(tilt, W, h, 0.1, bodyMat, W / 2, h / 2, zRear - 0.2);
  // гидроцилиндры бокового опрокидывания
  for (const z of [zFront + 1.5, zRear - 1.5]) {
    const hc = cyl(body, 0.09, 0.09, 1.2, M.hazard, -W / 2 + 0.3, deckY + 0.7, z, 12);
    hc.rotation.z = 0.4;
  }
  // груз
  const loadMat = std('#8a7f6a', 0.98, 0.02);
  for (let i = 0; i < 20; i++) {
    const s = 0.1 + Math.random() * 0.1;
    const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(s, 0), loadMat);
    rock.position.set((Math.random() - 0.2) * (W - 0.4), deckY + h + 0.1, (Math.random() - 0.5) * (L - 1));
    rock.rotation.set(Math.random(), Math.random(), Math.random());
    body.add(rock);
  }
  c.anchors.push({ pos: [0, deckY + h, 0], label: 'Боковой самосвал' });
}
