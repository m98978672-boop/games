// ============================================================
// АВТОМОБИЛИ v3. Кузов = единая полилиния верха + боковины с
// настоящими проёмами окон и колёсных арок. Верхняя поверхность
// строится лофтом по тем же точкам, поэтому боковина и крыша
// точно совпадают. 10 типов кузова, у каждого живой салон.
// ============================================================
import * as THREE from 'three';
import {
  HALF, PI, TAU, box, rbox, cyl, sphere, torus, plane, group,
  wheel as makeWheel, labelTexture, plateTexture, clamp, lerp,
  accentLine, brandDecalMaterial, panelCutout, panelSeam,
} from '../lib/kit.js';
import { mountDamageSet } from '../lib/damage.js';

// ------------------------------------------------------------ форма кузова
export function carShape(unit) {
  const L = unit.length ?? 4.7;
  const W = unit.width ?? 1.84;
  const H = unit.height ?? 1.44;
  const style = unit.style || 'sedan';
  const sport = style === 'coupe' || style === 'sport';
  const van = style === 'van';
  const pickup = style === 'pickup';
  const suv = style === 'suv' || pickup || style === 'crossover';
  const micro = style === 'micro';
  const wagon = style === 'wagon';
  const front = -L / 2;
  const rear = L / 2;
  const ground = 0.26;
  // у спорткара кузов низкий (1,22 м), поэтому капот поднят выше середины:
  // иначе арка радиусом R+0.05 прорезала капот сверху и над колесом
  // появлялась «перемычка»-козырь
  const belt = H * (sport ? 0.78 : van ? 0.62 : suv ? 0.66 : 0.66);
  const hoodY = H * (suv ? 0.58 : van ? 0.46 : sport ? 0.66 : 0.56);
  const noseY = H * (suv ? 0.5 : sport ? 0.58 : 0.46);
  const deckY = H * (suv ? 0.7 : van ? 0.62 : sport ? 0.72 : 0.62);
  const hoodZ = front + L * (van ? 0.2 : suv ? 0.24 : 0.27);
  const wsBase = front + L * (van ? 0.3 : suv ? 0.34 : sport ? 0.3 : 0.31);
  const wsTopZ = wsBase + (H - hoodY) * (van ? 0.7 : suv ? 0.85 : 1.05);
  const roofRearZ = rear - L * (wagon ? 0.05 : van ? 0.03 : pickup ? 0.36 : suv ? 0.13 : sport ? 0.4 : 0.31);
  // задняя кромка крыши должна оставаться в габарите: у фургона и универсала
  // формула уводила её на 0.3 м ЗА корму — кузов вырастал за задний бампер
  const rearBaseRaw = roofRearZ + (H - deckY) * (van ? 0.35 : suv ? 0.5 : sport ? 1.6 : 0.95);
  const rearBaseZ = Math.min(rearBaseRaw, rear - 0.1);
  // у пикапа за кабиной — открытый грузовой кузов с бортами
  const bedFrom = pickup ? roofRearZ + 0.16 : null;
  const bedY = pickup ? deckY - 0.06 : null;
  return { L, W, H, style, sport, wagon, van, pickup, suv, micro, front, rear, ground, belt, hoodY, deckY, noseY, hoodZ, wsBase, wsTopZ, roofRearZ, rearBaseZ, bedFrom, bedY };
}

/** Опорные точки верха кузова: [z, y] от носа к корме. */
function topNodes(S) {
  const { front, rear, noseY, hoodY, hoodZ, wsBase, wsTopZ, roofRearZ, rearBaseZ, deckY, H } = S;
  const nodes = [];
  const line = (a, b, n, bulge = 0) => {
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      const z = lerp(a[0], b[0], t);
      const y = lerp(a[1], b[1], t) + Math.sin(t * PI) * bulge;
      nodes.push([z, y]);
    }
  };
  nodes.push([front, noseY]);
  line([front, noseY], [front + 0.05, noseY + 0.03], 1);
  line([front + 0.05, noseY + 0.03], [hoodZ, hoodY], 4, 0.035);
  line([hoodZ, hoodY], [wsBase, hoodY + 0.035], 1);
  line([wsBase, hoodY + 0.035], [wsTopZ, H - 0.015], 1);
  line([wsTopZ, H - 0.015], [roofRearZ, H - 0.02], 4, 0.015);
  line([roofRearZ, H - 0.02], [rearBaseZ, deckY], 3);
  line([rearBaseZ, deckY], [rear, deckY - 0.02], 2);
  return nodes;
}

function topAt(nodes, z, fallback) {
  for (let i = 0; i < nodes.length - 1; i++) {
    const [z0, y0] = nodes[i];
    const [z1, y1] = nodes[i + 1];
    if ((z >= z0 && z <= z1) || (z >= z1 && z <= z0)) {
      const t = Math.abs(z1 - z0) < 1e-6 ? 0 : (z - z0) / (z1 - z0);
      return lerp(y0, y1, clamp(t, 0, 1));
    }
  }
  return fallback;
}

// ------------------------------------------------------------ грузовой кузов пикапа
function buildPickupBed(S, { root, paint, paintDark, black, belt, halfW, M }) {
  const { roofRearZ, rear, bedY, L, W } = S;
  const z0 = roofRearZ + 0.12;      // стенка кабины
  const z1 = rear - 0.06;
  const bedLen = z1 - z0;
  const bedZ = (z0 + z1) / 2;
  const wallH = 0.42;
  const wallY = bedY + wallH / 2;
  // пол кузова
  box(root, W - 0.16, 0.06, bedLen, M.plasticGray, 0, bedY - 0.01, bedZ);
  // борта: два боковых и задний
  for (const side of [-1, 1]) {
    rbox(root, 0.09, wallH, bedLen, paint, side * (halfW - 0.06), wallY, bedZ, 0.02);
    // кант борта
    box(root, 0.11, 0.035, bedLen, paintDark, side * (halfW - 0.06), bedY + wallH - 0.02, bedZ);
  }
  rbox(root, W - 0.1, wallH, 0.09, paint, 0, wallY, z1, 0.02);
  box(root, W - 0.08, 0.035, 0.11, paintDark, 0, bedY + wallH - 0.02, z1);
  // задняя стенка кабины (кабина уже закончилась, но нужна визуальная опора)
  rbox(root, W - 0.12, wallH + 0.08, 0.08, paint, 0, bedY + wallH / 2 + 0.02, z0 - 0.02, 0.02);
  // рёбра жёсткости на полу
  for (let i = 0; i < 6; i++) {
    box(root, W - 0.22, 0.012, 0.035, M.steel, 0, bedY + 0.025, z0 + 0.18 + i * (bedLen - 0.3) / 5);
  }
  // фонари на заднем борту
  for (const side of [-1, 1]) {
    rbox(root, 0.26, 0.1, 0.04, M.taillight, side * (halfW - 0.28), bedY - 0.02, z1 + 0.04, 0.02);
  }
}

// ------------------------------------------------------------ сборка
export function buildCar(unit, M, opts = {}) {
  const simple = opts.simple === true;
  const S = carShape(unit);
  const { L, W, H, front, rear, belt, ground } = S;
  const nodes = topNodes(S);
  const R = unit.wheelRadius ?? 0.33;
  const wW = unit.wheelWidth ?? 0.23;
  const wb = unit.wheelbase ?? L * 0.58;
  const halfW = W / 2;
  const paintColor = unit.paint || '#2f5d8a';
  const accentColor = unit.accent || '#d8d5c8';
  const root = group(null, `car:${unit.id}`);
  const wheels = [];
  const anchors = [];
  let dmgOut = null;
  const paintMats = [];
  const paint = M.paint(paintColor, { metalness: 0.5, roughness: 0.26 });
  const darker = new THREE.Color(paintColor).multiplyScalar(0.78);
  const paintDark = M.paint(darker, { metalness: 0.4, roughness: 0.42 });
  const accent = M.accent(accentColor);
  const chrome = M.chrome;
  const black = M.plastic;
  paintMats.push(paint, paintDark, accent);

  const sideT = 0.09;
  const sideX = halfW - sideT / 2;
  const axleZ = [-wb / 2, wb / 2];
  const floorY = ground + 0.08;

  // ---------- проёмы окон
  const winBottom = belt;
  const aPillar = S.wsBase + Math.max(0.16, L * 0.035);
  // у пикапа окна заканчиваются задней стенкой кабины, а не базой кормы
  const cPillar = S.pickup
    ? S.roofRearZ - 0.04
    : S.rearBaseZ - Math.max(0.14, L * 0.03);
  const bPillarZ = lerp(aPillar, cPillar, S.van ? 0.34 : 0.47);
  const pillarW = S.van || S.micro ? 0.22 : 0.09;
  const pick = (z) => Math.max(winBottom + 0.07, topAt(nodes, z, H) - 0.075);
  const windowHoles = [
    { z0: aPillar, z1: bPillarZ - pillarW / 2 },
    { z0: bPillarZ + pillarW / 2, z1: cPillar },
  ].filter((h) => h.z1 - h.z0 > 0.24);

  // ---------- силуэт и боковины
  const shape = new THREE.Shape();
  // профиль борта: у пикапа он заканчивается за кабиной и идёт по низу кузова
  const sideNodes = S.pickup
    ? [...nodes.filter(([z]) => z <= S.roofRearZ + 0.001), [S.roofRearZ + 0.1, S.bedY + 0.02], [rear - 0.06, S.bedY + 0.02]]
    : nodes;
  const outline = [
    [front, ground],
    ...sideNodes,
    [rear, ground],
  ];
  const archR = R + 0.05;
  const archCY = R + 0.02;
  shape.moveTo(outline[0][0], outline[0][1]);
  // верх силуэта (нос → капот → крыша → корма)
  for (let i = 1; i < outline.length - 1; i++) shape.lineTo(outline[i][0], outline[i][1]);
  // низ силуэта: от кормы к носу, по пути вырезаем колёсные арки
  shape.lineTo(outline[outline.length - 2][0], outline[outline.length - 2][1]);
  shape.lineTo(rear, ground);
  for (const az of [...axleZ].sort((a, b) => b - a)) {
    shape.lineTo(az + archR, ground);
    shape.lineTo(az + archR, archCY);
    const steps = 16;
    for (let i = 1; i <= steps; i++) {
      const a = (i / steps) * PI;
      shape.lineTo(az + Math.cos(a) * archR, archCY + Math.sin(a) * archR);
    }
    shape.lineTo(az - archR, archCY);
    shape.lineTo(az - archR, ground);
  }
  shape.lineTo(front, ground);
  shape.closePath();
  // ---------- арки
  // Арки вырезаем прямо в нижней кромке контура, а не отдельными дырками:
  // круглая дырка радиусом R+0.05 опускалась ниже днища (центр R+0.02),
  // выходила за границу силуэта, и earcut ломал триангуляцию — поверх
  // колеса появлялась синяя «перемычка» краски. Заодно так получается
  // правильная форма арки с вертикальными щеками над днищем.
  // окна
  for (const h of windowHoles) {
    const hole = new THREE.Path();
    const steps = 8;
    const pts = [[h.z0, winBottom + 0.02]];
    for (let i = 0; i <= steps; i++) {
      const z = lerp(h.z0, h.z1, i / steps);
      pts.push([z, pick(z)]);
    }
    pts.push([h.z1, winBottom + 0.02]);
    hole.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) hole.lineTo(pts[i][0], pts[i][1]);
    hole.closePath();
    shape.holes.push(hole);
  }

  if (!simple) {
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: sideT, bevelEnabled: true, bevelThickness: 0.01, bevelSize: 0.01, bevelSegments: 1, curveSegments: 10,
    });
    geo.rotateY(-HALF); // толщина -> −X, профиль остаётся в Z
    geo.computeBoundingBox();
    const bb = geo.boundingBox;
    // ставим внешнюю поверхность ровно на борт
    const dx = halfW - bb.max.x;
    geo.translate(dx, 0, 0);
    for (const side of [-1, 1]) {
      const m = new THREE.Mesh(geo, paint);
      if (side < 0) {
        m.scale.x = -1; // зеркалим на левый борт
      }
      m.castShadow = true;
      root.add(m);
    }

    // ---------- верхняя поверхность: лофт по тем же точкам
    function loft(nodesList, material, widen = 0) {
      const pos = [];
      for (const [z, y] of nodesList) {
        const t = clamp((y - belt) / Math.max(0.2, H - belt), 0, 1);
        const hx = (halfW - 0.015 + widen) * (1 - 0.055 * t * t);
        pos.push(-hx, y, z, hx, y, z);
      }
      const idxPaint = [];
      for (let i = 0; i < nodesList.length - 1; i++) {
        const a = i * 2;
        idxPaint.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
      }
      const idx = idxPaint;
      const g2 = new THREE.BufferGeometry();
      g2.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
      g2.setIndex(idx);
      g2.computeVertexNormals();
      const mat = material.clone ? material.clone() : material;
      mat.side = THREE.DoubleSide;
      root.add(new THREE.Mesh(g2, mat));
    }
    // Верхнюю поверхность рвём на капот, крышу и корму: на месте лобового
    // и заднего стекла остаётся проём, который закрывает прозрачная накладка.
    // Иначе из салона вместо улицы видна «стена» из краски.
    const zEq = (a, b) => Math.abs(a - b) < 1e-4;
    const idxOf = (z) => nodes.findIndex(([nz]) => zEq(nz, z));
    const iWsBase = idxOf(S.wsBase);
    const iWsTop = idxOf(S.wsTopZ);
    const iRoofRear = idxOf(S.roofRearZ);
    const iRearBase = idxOf(S.rearBaseZ);
    const capot = nodes.slice(0, iWsBase + 1);
    const roofNodes = nodes.slice(iWsTop, iRoofRear + 1);
    const korma = nodes.slice(iRearBase);
    if (S.pickup) {
      // у пикапа верх заканчивается задней стенкой кабины, дальше — грузовой кузов.
      // внутрь бортов добавляем стенку кабины, чтобы не было просвета над кузовом
      loft([...roofNodes, [S.roofRearZ + 0.16, S.bedY + 0.02]], paint);
      loft(capot, paint);
      buildPickupBed(S, { root, paint, paintDark, black, belt, halfW, M });
    } else {
      loft(capot, paint);
      loft(roofNodes, paint);
      loft(korma, paint);
    }

    // ---------- стёкла: лобовое и заднее (накладки по поверхности)
    // раньше стекло было почти непрозрачным (opacity 0.62 при тёмном цвете),
    // из салона двор выглядел чёрной стеной — теперь лёгкая тонировка
    const tintedGlass = new THREE.MeshPhysicalMaterial({
      color: 0x9fc4d4, metalness: 0.08, roughness: 0.06, transparent: true, opacity: 0.3,
      envMapIntensity: 1.8, side: THREE.DoubleSide, depthWrite: false,
    });
    const glassQuad = (z0, y0, z1, y1, hw, lift) => {
      const dz = z1 - z0;
      const dy = y1 - y0;
      const len = Math.hypot(dz, dy) || 1;
      // нормаль к поверхности в плоскости ZY (вверх-назад)
      const nx = 0;
      const ny = dz / len;
      const nz = -dy / len;
      const ox = nx * lift, oy = ny * lift, oz = nz * lift;
      const g4 = new THREE.BufferGeometry();
      const pos = [
        -halfW * hw, y0 + oy, z0 + oz, halfW * hw, y0 + oy, z0 + oz,
        -halfW * hw, y1 + oy, z1 + oz, halfW * hw, y1 + oy, z1 + oz,
      ];
      g4.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
      g4.setIndex([0, 1, 2, 1, 3, 2]);
      g4.computeVertexNormals();
      const m = new THREE.Mesh(g4, tintedGlass);
      m.renderOrder = 2;
      root.add(m);
    };
    // лобовое стекло: края на 2–4 см заходят под краску капота и крыши,
    // поэтому по периметру не остаётся щели — раньше стекло «висило» в воздухе
    glassQuad(S.wsBase + 0.02, S.hoodY - 0.045, S.wsTopZ + 0.015, H - 0.012, 0.965, 0.02);
    // заднее стекло (у пикапа — почти вертикальная стенка кабины)
    if (S.pickup) glassQuad(S.roofRearZ + 0.01, H - 0.02, S.roofRearZ + 0.14, S.deckY - 0.05, 0.925, 0.02);
    else glassQuad(S.roofRearZ + 0.015, H - 0.012, S.rearBaseZ + 0.04, S.deckY - 0.05, 0.945, 0.02);
    // чёрные канты стёкол
    for (const [z0, y0, z1, y1, hw] of [
      [S.wsBase + 0.02, S.hoodY - 0.045, S.wsTopZ + 0.015, H - 0.012, 0.965],
      [S.roofRearZ + 0.015, H - 0.012, S.rearBaseZ + 0.04, S.deckY - 0.05, 0.945],
    ]) {
      for (const sx of [-1, 1]) {
        const dzq = z1 - z0, dyq = y1 - y0;
        const lenq = Math.hypot(dzq, dyq) || 1;
        const beam = box(root, 0.035, 0.035, lenq, black, sx * halfW * hw, (y0 + y1) / 2, (z0 + z1) / 2);
        beam.rotation.x = -Math.atan2(dyq, Math.abs(dzq));
        beam.position.y += 0.01;
      }
    }

    // ---------- днище, колёса, арки
    const bottom = new THREE.Mesh(new THREE.PlaneGeometry(W - 0.06, L - 0.16), M.plastic);
    bottom.rotation.x = -HALF;
    bottom.position.y = ground - 0.004;
    root.add(bottom);
    for (const z of axleZ) {
      for (const side of [-1, 1]) {
        const w = makeWheel(M, { radius: R, width: wW, style: 'car', rimColor: S.sport ? '#2b2f33' : '#c3c9cd', tread: M.rubber, spokes: S.sport ? 5 : 6 });
        w.position.set(side * (halfW - wW * 0.52), R, z);
        if (side < 0) w.rotation.y = PI;
        root.add(w);
        wheels.push(w);
        // тонкая тёмная окантовка арки
        const arch = new THREE.Mesh(new THREE.TorusGeometry(R + 0.06, 0.018, 5, 20, PI), black);
        arch.position.set(side * (halfW + 0.012), R + 0.02, z);
        // подкрылок, чтобы за колесом не было пустоты
        const well = new THREE.Mesh(new THREE.CylinderGeometry(R + 0.055, R + 0.055, 0.2, 16, 1, true, 0, PI), M.plastic);
        well.rotation.z = HALF;
        well.position.set(side * (halfW - 0.16), R + 0.02, z);
        root.add(well);
        arch.rotation.y = side > 0 ? -HALF : HALF;
        root.add(arch);
      }
    }
    // пороги и подштамповка — строго между арками: раньше планки шли на всю
    // длину базы, проходили прямо по покрышкам и «протыкали» колёса
    const doorZ0 = axleZ[0] + R + 0.1;
    const doorZ1 = axleZ[1] - R - 0.1;
    const doorLen = Math.max(0.34, doorZ1 - doorZ0);
    const doorMid = (doorZ0 + doorZ1) / 2;
    for (const side of [-1, 1]) {
      rbox(root, 0.055, 0.085, doorLen, black, side * (halfW + 0.001), ground + 0.1, doorMid, 0.02);
      box(root, 0.02, 0.026, doorLen, paintDark, side * (halfW + 0.012), belt - 0.26, doorMid);
      box(root, 0.014, 0.016, doorLen * 0.96, chrome, side * (halfW + 0.012), belt - 0.2, doorMid);
    }

    // ---------- вырезы кузова: двери, лючок бака, номер, решётка
    // Дверь отделена настоящей канавкой по контуру, а не наклейкой: полотно
    // двери чуть выступает, вокруг видна щель. Плюс утопленные ниши — лючок
    // бензобака, номерной знак и воздухозаборник: у них есть глубина.
    {
      const seamMat = new THREE.MeshStandardMaterial({ color: 0x0b0e10, roughness: 1, metalness: 0 });
      const hingeZ = aPillar + 0.1;
      const doorZc = (aPillar + bPillarZ) / 2;
      const rearDoorZc = (bPillarZ + cPillar) / 2;
      for (const side of [-1, 1]) {
        panelSeam(root, {
          w: Math.max(0.3, bPillarZ - aPillar - 0.16), h: Math.max(0.4, belt - ground - 0.34),
          x: side * (halfW + 0.014), y: (belt + ground) / 2 - 0.06, z: doorZc,
          rotY: side > 0 ? HALF : -HALF, width: 0.012, material: seamMat,
        });
        if (cPillar - bPillarZ > 0.3) {
          panelSeam(root, {
            w: Math.max(0.24, cPillar - bPillarZ - 0.14), h: Math.max(0.34, belt - ground - 0.4),
            x: side * (halfW + 0.014), y: (belt + ground) / 2 - 0.08, z: rearDoorZc,
            rotY: side > 0 ? HALF : -HALF, width: 0.011, material: seamMat,
          });
        }
        // ручка двери — утопленная ниша под палец
        panelCutout(root, {
          w: 0.13, h: 0.036, depth: 0.022, x: side * (halfW + 0.002), y: belt - 0.2, z: doorZc + 0.12,
          rotY: side > 0 ? HALF : -HALF, name: 'cutout-handle', material: paintDark,
        });
      }
      // лючок бензобака на левом заднем крыле
      panelCutout(root, {
        w: 0.17, h: 0.17, depth: 0.03, x: -(halfW + 0.004), y: belt - 0.3, z: rear - 0.42,
        rotY: -HALF, name: 'cutout-fuel', material: paintDark, trim: chrome,
      });
      // ниши номера и воздухозаборника
      panelCutout(root, {
        w: 0.46, h: 0.16, depth: 0.035, x: 0, y: ground + 0.42, z: rear + 0.004, rotY: PI,
        name: 'cutout-plate', material: paintDark,
      });
      panelCutout(root, {
        w: Math.min(0.62, W * 0.34), h: 0.1, depth: 0.05, x: 0, y: ground + 0.34, z: front - 0.004, rotY: PI,
        name: 'cutout-intake', material: black, trim: paintDark,
      });
      // решётка радиатора: узкие щели, каждая — свой вырез.
      // Держим их НИЖЕ линии капота (belt), иначе щели торчат над крылом.
      for (let i = 0; i < 3; i++) {
        panelCutout(root, {
          w: Math.min(0.6, W * 0.32), h: 0.03, depth: 0.045, x: 0, y: belt - 0.36 + i * 0.05,
          z: front - 0.004, rotY: PI, name: 'cutout-grille', material: black,
        });
      }
    }

    // ---------- стёкла в проёмах
    // Стекло не «вставлено в дырку», а посажено на резиновый уплотнитель:
    // по контуру проёма идёт рамка-манжета, а само стекло меньше проёма
    // на 1,2 см и лежит в её плоскости.
    const sealMat = M.rubber || black;
    for (const h of windowHoles) {
      for (const side of [-1, 1]) {
        const steps = 8;
        const inset = 0.014;
        const strip = (push) => {
          const pos = [];
          const idx = [];
          for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const z = lerp(h.z0, h.z1, t);
            push(pos, z, t);
          }
          const n = steps + 1;
          for (let i = 0; i < n - 1; i++) idx.push(i, i + 1, n + i, i + 1, n + i + 1, n + i);
          const g = new THREE.BufferGeometry();
          g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
          g.setIndex(idx);
          g.computeVertexNormals();
          return g;
        };
        const xGlass = side * (halfW - 0.018);
        const xSeal = side * (halfW - 0.01);
        // стекло
        const glassGeo = strip((pos, z) => {
          pos.push(xGlass, winBottom + inset, z);
          pos.push(xGlass, pick(z) - inset, z);
        });
        const sideGlass = new THREE.Mesh(glassGeo, M.glass);
        sideGlass.name = 'side-glass';
        root.add(sideGlass);
        // манжета: нижняя полка, верхняя (по линии крыши) и торцевые
        const lower = strip((pos, z) => {
          pos.push(xSeal, winBottom - 0.004, z);
          pos.push(xSeal, winBottom + inset, z);
        });
        const upper = strip((pos, z) => {
          pos.push(xSeal, pick(z) - inset, z);
          pos.push(xSeal, pick(z) + 0.01, z);
        });
        for (const geo of [lower, upper]) {
          const m = new THREE.Mesh(geo, sealMat);
          m.name = 'window-seal';
          root.add(m);
        }
        // торцы проёма (передняя и задняя кромки)
        for (const [zEdge, dir] of [[h.z0, 1], [h.z1, -1]]) {
          const capH = Math.max(0.02, pick(zEdge) - winBottom);
          const cap = box(root, 0.016, capH, 0.03, sealMat,
            side * (halfW - 0.012), winBottom + capH / 2, zEdge + dir * 0.01);
          cap.name = 'window-seal';
        }
      }
    }
    // чёрные накладки стоек
    for (const side of [-1, 1]) {
      const bh = Math.max(0.25, pick(bPillarZ) - winBottom);
      box(root, 0.02, bh, pillarW, black, side * (halfW + 0.004), winBottom + bh / 2, bPillarZ);
    }

    // ---------- торцы кузова
    // Боковина — выдавленный силуэт толщиной 9 см, и между бортами торцы
    // были открыты: спереди и сзади внутрь кузова смотрел салон. Закрываем
    // передок и корму «фартуками» из краски по всей ширине.
    const noseCapZ = front + 0.075;
    const noseCapTop = S.noseY + 0.08;
    const noseCapH = Math.max(0.2, noseCapTop - ground + 0.04);
    rbox(root, W - 0.02, noseCapH, 0.11, paint, 0, ground + noseCapH / 2 - 0.02, noseCapZ, 0.03);
    const tailCapH = Math.max(0.2, S.deckY - ground + 0.02);
    rbox(root, W - 0.02, tailCapH, 0.11, paint, 0, ground + tailCapH / 2 - 0.02, rear - 0.055, 0.03);

    // ---------- перед: решётка, фары, бампер
    // Носовая часть невысокая (от земли до кромки капота ~0,4 м), поэтому
    // раскладываем её в три пояса: бампер снизу, решётка в середине,
    // фары по углам сверху. Всё стоит СНАРУЖИ торца (z < front).
    const noseFront = front - 0.004;
    // высоту решётки ограничиваем: у фургона нос высокий (1,05 м), и без
    // предела получалась чёрная «пасть» на пол-носа
    const grilleTop = S.noseY - 0.11;
    const grilleH = Math.min(0.3, Math.max(0.12, grilleTop - ground - 0.16));
    const grilleBottom = grilleTop - grilleH;
    const grilleY = (grilleTop + grilleBottom) / 2;
    // тёмная ниша решётки + хромированные ламели в ней
    rbox(root, W * 0.4, grilleH + 0.035, 0.05, black, 0, grilleY, noseFront - 0.03, 0.018);
    const slats = 4;
    for (let i = 0; i < slats; i++) {
      const t = slats === 1 ? 0.5 : i / (slats - 1);
      box(root, W * 0.36, 0.011, 0.012, chrome, 0, grilleBottom + 0.025 + t * (grilleH - 0.05), noseFront - 0.058);
    }
    const logo = cyl(root, Math.min(0.052, grilleH * 0.3), Math.min(0.052, grilleH * 0.3), 0.014, chrome, 0, grilleY, noseFront - 0.06, 20);
    logo.rotation.x = HALF;
    for (const side of [-1, 1]) {
      // фара — блок в углу, чуть выступает из торца
      rbox(root, W * 0.31, 0.095, 0.055, M.headlight, side * halfW * 0.63, S.noseY - 0.055, noseFront - 0.018, 0.018);
      box(root, 0.25, 0.012, 0.016, chrome, side * halfW * 0.63, S.noseY - 0.108, noseFront - 0.042);
      // поворотник
      box(root, 0.1, 0.034, 0.042, M.amber, side * halfW * 0.85, S.noseY - 0.105, noseFront - 0.02);
      // противотуманка в бампере
      const fog = cyl(root, 0.038, 0.038, 0.022, M.headlight, side * halfW * 0.6, ground + 0.14, noseFront - 0.03, 10);
      fog.rotation.x = HALF;
    }
    // бампер: единая юбка по всей ширине, снизу — чёрный сплиттер
    rbox(root, W * 0.99, 0.2, 0.24, paintDark, 0, ground + 0.11, front - 0.1, 0.05);
    rbox(root, W * 0.66, 0.075, 0.06, black, 0, ground + 0.03, front - 0.16, 0.02);

    // ---------- корма
    for (const side of [-1, 1]) {
      rbox(root, 0.38, 0.12, 0.08, M.taillight, side * halfW * 0.66, S.deckY - 0.08, rear + 0.03, 0.02);
      box(root, 0.18, 0.045, 0.03, M.reverseLight, side * halfW * 0.56, S.deckY - 0.17, rear + 0.045);
    }
    const plateTex = plateTexture('О 777 АА');
    if (plateTex) {
      const plateMat = new THREE.MeshStandardMaterial({ map: plateTex, roughness: 0.55 });
      // Номер должен висеть НАД бампером (бампер занимает ground…ground+0.27),
      // иначе он за ним прячется. Накладка объёмная: подложка + картинка
      // лицевой стороной назад (плоскость Three.js смотрит в +Z).
      const plateY = Math.max(ground + 0.4, S.deckY - 0.42);
      rbox(root, 0.45, 0.13, 0.03, black, 0, plateY, rear + 0.03, 0.012);
      const p1 = plane(root, 0.42, 0.11, plateMat, 0, plateY, rear + 0.047);
      p1.renderOrder = 1;
    }
    rbox(root, W * 0.98, 0.22, 0.18, paintDark, 0, ground + 0.16, rear + 0.08, 0.05);
    if (S.sport) {
      for (const side of [-1, 1]) {
        const ex = cyl(root, 0.048, 0.048, 0.1, chrome, side * 0.3, ground + 0.08, rear - 0.02, 12);
        ex.rotation.x = HALF;
      }
      rbox(root, W * 0.76, 0.03, 0.24, paint, 0, H + 0.13, S.roofRearZ - 0.12, 0.02);
      for (const side of [-1, 1]) box(root, 0.035, 0.15, 0.1, black, side * W * 0.27, H + 0.06, S.roofRearZ - 0.12);
    }

    // ---------- зеркала, ручки, повторители
    const mz = S.wsBase + 0.06;
    for (const side of [-1, 1]) {
      box(root, 0.14, 0.04, 0.05, black, side * (halfW + 0.02), belt + 0.05, mz);
      rbox(root, 0.15, 0.085, 0.1, paint, side * (halfW + 0.085), belt + 0.07, mz, 0.03);
      box(root, 0.018, 0.055, 0.075, M.mirror, side * (halfW + 0.155), belt + 0.07, mz);
      for (const z of [aPillar + 0.5, bPillarZ + 0.02]) {
        const hz = Math.min(z, cPillar - 0.18);
        rbox(root, 0.03, 0.038, 0.15, chrome, side * (halfW + 0.008), belt - 0.12, hz, 0.02);
      }
    }
    // антенна-плавник
    
    // маркировка на борту — та же фирменная надпись, что на дверях тягачей
    const bMat = brandDecalMaterial(
      { ...unit, brand: unit.brand || 'ASTER', accent: accentColor },
      { width: 512, height: 128, font: 'bold 54px Arial, sans-serif' },
    );
    if (bMat) {
      for (const side of [-1, 1]) {
        const p = plane(root, 0.54, 0.135, bMat, side * (halfW + 0.03), ground + 0.33, S.wsBase - 0.35);
        p.rotation.y = side > 0 ? -HALF : HALF;
      }
    }
    // фирменная линия по борту: акцентная полоса + хром-кант, как у тягачей
    const accentMat = M.accent(accentColor);
    for (const side of [-1, 1]) {
      accentLine(root, {
        length: Math.max(0.8, cPillar - aPillar + 0.2),
        height: 0.03,
        depth: 0.016,
        x: side * (halfW + 0.008),
        y: belt - 0.055,
        z: (aPillar + cPillar) / 2,
        accentMat,
        chromeMat: M.chrome,
      });
    }
    // ---------- повреждения: 15 точек по кузову, у каждого авто свои
    const xb = halfW + 0.012;
    const doorZ = (aPillar + bPillarZ) / 2;
    const rearDoorZ = (bPillarZ + cPillar) / 2;
    dmgOut = mountDamageSet(root, { ...unit, category: 'cars' }, [
      { part: { name: 'передняя дверь', gender: 'f' }, side: -1, pos: [-xb, belt - 0.28, doorZ], w: 0.5, h: 0.28 },
      { part: { name: 'передняя дверь', gender: 'f' }, side: 1, pos: [xb, belt - 0.28, doorZ], w: 0.5, h: 0.28 },
      { part: { name: 'задняя дверь', gender: 'f' }, side: -1, pos: [-xb, belt - 0.45, rearDoorZ], w: 0.46, h: 0.28 },
      { part: { name: 'задняя дверь', gender: 'f' }, side: 1, pos: [xb, belt - 0.45, rearDoorZ], w: 0.46, h: 0.28 },
      { part: { name: 'капот', gender: 'm' }, side: 0, rotX: -HALF, rotY: 0, pos: [0.3, S.hoodY + 0.015, (front + S.wsBase) / 2], w: 0.6, h: 0.44 },
      { part: { name: 'крыша', gender: 'f' }, side: 0, rotX: -HALF, rotY: 0, pos: [-0.2, H + 0.012, S.wsTopZ + (S.roofRearZ - S.wsTopZ) * 0.42], w: 0.56, h: 0.4 },
      { part: { name: 'крышка багажника', gender: 'f' }, side: 0, rotX: -HALF, rotY: 0, pos: [0.2, S.deckY + 0.015, (S.rearBaseZ + rear) / 2], w: 0.54, h: 0.4 },
      { part: { name: 'передний бампер', gender: 'm' }, side: 1, rotY: PI, pos: [0.45, ground + 0.2, front - 0.02], w: 0.5, h: 0.24 },
      { part: { name: 'задний бампер', gender: 'm' }, side: -1, rotY: 0, pos: [-0.42, ground + 0.22, rear + 0.02], w: 0.5, h: 0.24 },
      // крылья — над аркой, а не над шиной: полоса кузова между аркой и
      // поясом. Раньше пятно висело над колесом, в проёме арки.
      { part: { name: 'переднее крыло', gender: 'n' }, side: -1, pos: [-xb, belt - 0.1, axleZ[0] + 0.02], w: 0.32, h: 0.14 },
      { part: { name: 'заднее крыло', gender: 'n' }, side: 1, pos: [xb, belt - 0.1, axleZ[1] - 0.02], w: 0.32, h: 0.14 },
      { part: { name: 'порог', gender: 'm' }, side: -1, pos: [-xb, ground + 0.16, (axleZ[0] + axleZ[1]) / 2], w: 0.5, h: 0.22 },
      { part: { name: 'борт капота', gender: 'm' }, side: 1, pos: [xb, S.hoodY - 0.12, (front + S.wsBase) / 2], w: 0.46, h: 0.26 },
      { part: { name: 'задняя стойка', gender: 'f' }, side: -1, pos: [-xb, belt - 0.12, cPillar + 0.12], w: 0.24, h: 0.22 },
      { part: { name: 'лючок бензобака', gender: 'm' }, side: 1, pos: [xb, belt - 0.44, cPillar + 0.34], w: 0.3, h: 0.24 },
    ]);
    for (const item of dmgOut.list) {
      anchors.push({ pos: item.patch.position.clone().toArray(), label: `Повреждение: ${item.spec.label}`, damage: true });
    }
    anchors.push({ pos: [0, H + 0.06, S.roofRearZ - 0.35], label: 'Крыша' });
    anchors.push({ pos: [sideX, belt + 0.12, bPillarZ], label: 'Дверь водителя' });
    anchors.push({ pos: [0, grilleY, front], label: 'Решётка и фары' });
    anchors.push({ pos: [0, S.deckY - 0.15, rear], label: 'Кормовая часть' });
    for (const z of axleZ) anchors.push({ pos: [halfW, R, z], label: 'Колесо', side: 'справа' });

    // ---------- салон
    root.add(buildCarInterior({ M, S, nodes, pick, unit, halfW, sideT, belt, H, R, anchors, floorY }));
  } else {
    for (const z of axleZ) {
      for (const side of [-1, 1]) {
        const w = makeWheel(M, { radius: R, width: wW, style: 'car', rimColor: '#b9bfc4' });
        w.position.set(side * (halfW - wW * 0.55), R, z);
        if (side < 0) w.rotation.y = PI;
        root.add(w);
      }
    }
    box(root, W * 0.9, 0.1, L * 0.9, black, 0, 0.2, 0);
  }

  const cabW = W - 0.3;
  const eyeY = belt + 0.3;
  // у высоких кузовов (SUV, фургон, пикап) глаза водителя выше и чуть дальше от лобового
  const dashTopAbs = floorY + 0.42;
  const eyeAbs = S.sport ? Math.min(H - 0.12, dashTopAbs + 0.24) : H - (S.micro ? 0.24 : 0.3);
  const tall = eyeAbs - (belt + 0.3);
  // в спорткаре крыша низкая: садимся ближе к стеклу и смотрим вперёд, а не в панель
  // глаз водителя не должен оказаться внутри спинки своего же кресла:
  // у коротких салонов кресло сдвинуто вперёд, камера едет вместе с ним
  const seatZc = Math.min(
    S.wsTopZ + 0.44 + 0.06,
    Math.max((S.rearBaseZ - 0.06 - 0.32) - 0.54, S.wsTopZ + 0.44 - 0.34),
  );
  const eyeZr = Math.min(S.wsTopZ + (S.sport ? 0.42 : S.van ? 0.62 : 0.52), seatZc + 0.06);
  const views = [
    {
      id: 'driver', label: 'Место водителя', group: 'interior',
      pos: [-cabW * 0.22, belt + eyeY * 0 + 0.3 + tall, eyeZr],
      // смотрим не в горизонт, а на приборы — иначе торпедо уходит из кадра
      // Наводим строго на блок приборов (dashTopAbs), а не «на глаз минус N»:
      // у высоких кузовов (SUV, пикап, фургон) взгляд уходил выше панели,
      // и приборы обрезались нижней кромкой кадра.
      target: [-cabW * 0.27, dashTopAbs + 0.07, S.wsTopZ - 0.24],
      fov: S.sport ? 64 : 70, orbit: false, seat: true,
    },
    {
      id: 'salon', label: 'Салон', group: 'interior',
      // снимаем с заднего дивана по центру: передние кресла уходят в стороны,
      // а в кадре остаются торпедо, руль и центральная консоль
      // из прохода между креслами вперёд: торпедо, руль, консоль,
      // стойки и боковые окна — общий вид салона
      // Камеру ставим в проход МЕЖДУ передними креслами, на уровне глаз
      // сидящего, и смотрим вниз-вперёд на торпедо. Раньше она стояла почти
      // в спинке заднего дивана: у универсала кадр был чёрным (камера внутри
      // подголовника), у SUV и пикапа обзор закрывали сами кресла.
      // Высота глаз ограничена потолком (у спорткара крыша ниже — камера
      // «пробивала» её и давала чёрный кадр). Смотрим прямо на торпедо,
      // а не в горизонт: иначе приборы уходят из кадра.
      // Камера — в проходе между передними креслами, чуть ниже потолка и
      // ПОЗАДИ торпедо (dashZ + 0.2): если поставить её на высоту панели,
      // она оказывается внутри её корпуса и кадр перекрывает серое поле.
      pos: [0, Math.min(belt + 0.3, H - 0.2), S.wsTopZ + Math.max(0.42, (S.roofRearZ - S.wsTopZ) * 0.44)],
      // целимся в блок приборов (dashTop + 0.07), а не в горизонт: иначе
      // кадр заполняет капот, а торпедо уходит вниз
      target: [0, floorY + 0.38, S.wsTopZ - 0.55],
      fov: 72, orbit: true, seat: true,
    },
    { id: 'exterior', label: 'Снаружи', group: 'exterior', pos: [6.4, 2.55, -7.0], target: [0, 0.72, 0.05], fov: 32, orbit: true, autoRotate: true },
    { id: 'side', label: 'Сбоку', group: 'exterior', pos: [8.8, 1.3, 0.15], target: [0, 0.72, 0], fov: 27, orbit: true },
    { id: 'rear', label: 'Сзади', group: 'exterior', pos: [-4.7, 2.1, 6.8], target: [0, 0.75, 0.1], fov: 33, orbit: true },
  ];
  const layout = { frontZ: front, rearEnd: rear, roofY: H, floorY, wheelRadius: R, belt, length: L, width: W, wsBase: S.wsBase, wsTopZ: S.wsTopZ, roofRearZ: S.roofRearZ, rearBaseZ: S.rearBaseZ };
  return { root, wheels, paintMats, views, anchors, layout, kind: 'car', damage: dmgOut };
}

// ============================================================
// САЛОН
// ============================================================
function buildCarInterior({ M, S, nodes, pick, unit, halfW, sideT, belt, H, R, anchors, floorY }) {
  const g = group(null, 'interior');
  // ширина салона: раньше между торпедо и бортами оставалось по 15 см
  // пустоты, в щели была видна улица
  const cabW = S.W - 0.16;
  const zFront = S.wsBase + 0.02;
  const zRear = S.rearBaseZ - 0.06;
  const zMid = (zFront + zRear) / 2;
  // Глаз водителя — на 0.44 м позади верхней кромки лобового. Раньше он был
  // на 0.5 м, панель уезжала в салон и съедала место заднему ряду.
  const eyeZ = S.wsTopZ + 0.44;
  // Панель сдвинута вперёд к моторному щиту и стала тоньше (было −0.72 и 0.4):
  // с места водителя она нависала над коленями и занимала пол-кадра.
  const dashZ = eyeZ - 0.80;
  // Кресло водителя не уезжает в корму: если салон короткий (хэтч, пикап,
  // микрокар), сиденье сдвигается вперёд, чтобы заднему ряду осталось место.
  const zRearSeat = zRear - 0.32;
  // Кресло сдвинуто к панели: глаз водителя теперь чуть впереди центра подушки.
  // Нижняя граница — чтобы кресло не упиралось в новую короткую панель.
  const seatZ = Math.min(eyeZ + 0.06, Math.max(zRearSeat - 0.54, eyeZ - 0.34));
  const dark = M.interiorDark;
  const mid = M.interiorMid;
  const sport = S.sport;
  const seatMat = sport ? M.leather : M.fabric;
  const seatTrim = sport ? M.accent(unit.accent || '#d8d5c8') : M.fabric;

  // пол, тоннель, обшивки
  rbox(g, cabW + 0.05, 0.03, zRear - zFront + 0.7, M.rubberTrim, 0, floorY, zMid + 0.1, 0.02);
  for (const x of [-0.34, 0.34]) rbox(g, 0.44, 0.012, 0.44, M.fabric, x, floorY + 0.025, zFront + 0.55, 0.01);
  for (const side of [-1, 1]) {
    const x = side * (cabW / 2 - 0.02);
    rbox(g, 0.04, Math.max(0.24, belt - floorY - 0.08), zRear - zFront + 0.3, dark, x, floorY + 0.28, zMid, 0.02);
    rbox(g, 0.1, 0.055, 0.4, seatTrim, x - side * 0.03, belt - 0.1, seatZ - 0.16, 0.02);
    rbox(g, 0.1, 0.07, 0.32, mid, x - side * 0.04, floorY + 0.4, seatZ + 0.06, 0.02);
    box(g, 0.025, 0.028, 0.1, M.chromeDark, x - side * 0.04, belt - 0.18, seatZ - 0.3);
    const spk = cyl(g, 0.05, 0.05, 0.018, M.plastic, x - side * 0.04, floorY + 0.26, seatZ - 0.52, 10);
    spk.rotation.z = HALF;
  }
  rbox(g, cabW - 0.08, 0.025, S.roofRearZ - S.wsTopZ + 0.1, M.interiorMid, 0, H - 0.13, (S.wsTopZ + S.roofRearZ) / 2, 0.02);
  rbox(g, 0.23, 0.2, zRear - zFront - 0.2, mid, 0, floorY + 0.11, zMid - 0.1, 0.04);
  if (unit.seats > 2) rbox(g, cabW - 0.1, Math.max(0.2, belt - floorY - 0.14), 0.05, dark, 0, floorY + 0.32, zRear + 0.12, 0.02);

  // моторный щит: закрывает просвет между панелью и лобовым, иначе из салона
  // видны колёса и арки. Верх щита делаем НИЖЕ панели (раньше он поднимался
  // на 20 см над торпедо и чёрной стеной закрывал двор из лобового стекла).
  const firewallTop = floorY + 0.44;
  rbox(g, cabW + 0.06, firewallTop - floorY + 0.1, 0.05, dark, 0, (floorY + firewallTop) / 2 - 0.05, zFront - 0.05, 0.02);

  // ---------- торпедо
  // Водитель сидит на +Z и смотрит в −Z, поэтому лицевая плоскость панели —
  // это сторона с МАКСИМАЛЬНЫМ z (dashZ + полтолщины). Раньше приборы стояли
  // на dashZ − 0.02, то есть с обратной стороны панели, и водитель видел
  // чёрную плиту без шкал.
  const dashTop = floorY + 0.42;
  const dashFace = dashZ + 0.155;     // лицевая плоскость, к водителю (корпус 0.3)
  const dashLow = floorY + 0.06;      // низ панели, у педалей
  const dashH = dashTop + 0.08 - dashLow;
  const dashMidY = dashLow + dashH / 2;
  // корпус панели с наклоном лицевой части
  const dashBody = rbox(g, cabW, dashH + 0.03, 0.3, dark, 0, dashMidY, dashZ, 0.05);
  dashBody.rotation.x = -0.05;
  // Сверху панели — узкий кант ПО ВСЕЙ глубине: раньше это была короткая
  // накладка, и с места водителя она читалась как «полка», висящая над
  // приборами в воздухе.
  const dashCapZ = dashZ + 0.005;
  rbox(g, cabW - 0.02, 0.035, 0.26, M.rubberTrim, 0, dashTop + 0.06, dashCapZ, 0.016);
  // Приборный щиток: утоплен в панель под козырёк, тёмное поле со светлыми
  // насечками и красной стрелкой — как в тягачах, чтобы салоны были в одном стиле.
  const binX = -cabW * 0.27;
  const binY = dashTop - 0.05;
  rbox(g, 0.46, 0.2, 0.055, M.plastic, binX, binY, dashFace + 0.012, 0.025);
  for (const [i, dx] of [-0.112, 0.112].entries()) {
    const cx = binX + dx;
    const disc = cyl(g, 0.058, 0.058, 0.016, M.plastic, cx, binY, dashFace + 0.045, 22);
    disc.rotation.x = HALF;
    torus(g, 0.058, 0.006, M.chromeDark, cx, binY, dashFace + 0.054, 22);
    for (let t = 0; t <= 6; t++) {
      const a = -PI * 0.72 + (t / 6) * PI * 1.44;
      const tick = box(g, 0.0045, 0.011, 0.004, M.plasticLight, cx + Math.cos(a) * 0.045, binY + Math.sin(a) * 0.045, dashFace + 0.056);
      tick.rotation.z = a - HALF;
    }
    const na = i === 0 ? -PI * 0.28 : PI * 0.62;
    const needle = box(g, 0.005, 0.038, 0.004, M.taillight, cx + Math.cos(na) * 0.019, binY + Math.sin(na) * 0.019, dashFace + 0.059);
    needle.rotation.z = na - HALF;
    const cap = cyl(g, 0.007, 0.007, 0.012, M.chromeDark, cx, binY, dashFace + 0.062, 10);
    cap.rotation.x = HALF;
  }
  // центральное цифровое окно между шкалами
  box(g, 0.05, 0.018, 0.008, M.dashScreen, binX, binY + 0.03, dashFace + 0.058);
  // мультимедиа по центру панели — лицом к водителю
  rbox(g, 0.38, 0.24, 0.02, M.plastic, 0.06, dashTop - 0.06, dashFace + 0.006, 0.02);
  const scr = rbox(g, 0.34, 0.2, 0.024, M.dashScreen, 0.06, dashTop - 0.06, dashFace + 0.022, 0.02);
  scr.rotation.x = -0.08;
  box(g, 0.36, 0.01, 0.01, M.chromeDark, 0.06, dashTop - 0.175, dashFace + 0.03);
  // дефлекторы обдува и кнопки — по бокам от экрана
  for (const side of [-1, 1]) {
    const x = side === -1 ? cabW * 0.4 : -cabW * 0.4;
    rbox(g, 0.13, 0.055, 0.03, M.plastic, x, dashTop + 0.02, dashFace + 0.006, 0.015);
    for (let i = -1; i <= 1; i++) box(g, 0.01, 0.042, 0.012, M.chromeDark, x + i * 0.034, dashTop + 0.02, dashFace + 0.02);
  }
  // шайбы климата под экраном и ряд клавиш
  for (let i = 0; i < 3; i++) {
    const knob = cyl(g, 0.017, 0.017, 0.016, M.plasticGray, 0.06 - 0.05 + i * 0.05, dashTop - 0.235, dashFace + 0.03, 14);
    knob.rotation.x = HALF;
    torus(g, 0.019, 0.003, M.chromeDark, 0.06 - 0.05 + i * 0.05, dashTop - 0.235, dashFace + 0.04, 14);
  }
  for (let i = 0; i < 4; i++) box(g, 0.022, 0.016, 0.01, M.plasticGray, 0.06 - 0.06 + i * 0.04, dashTop - 0.3, dashFace + 0.03);
  // бардачок и полка для мелочей
  rbox(g, 0.36, 0.12, 0.02, mid, cabW * 0.26, dashTop - 0.2, dashFace + 0.004, 0.02);
  box(g, 0.13, 0.02, 0.02, M.chrome, cabW * 0.26, dashTop - 0.16, dashFace + 0.016);
  // декоративная полоса-кант по всей панели — общий приём с тягачами
  box(g, cabW - 0.12, 0.012, 0.012, M.chromeDark, 0, dashTop - 0.32, dashFace + 0.012);
  // ---------- связка торпедо с кузовом
  // Между панелью и лобовым стеклом был сквозной просвет: из салона
  // просвечивал капот, а снаружи в щель было видно салон. Кладём «полку
  // кузова» от основания лобового до верхней кромки панели и закрываем
  // торцы панели щеками — теперь торпедо составляет одно целое с кузовом.
  const cowlZ0 = zFront - 0.02;
  const cowlZ1 = dashZ + 0.13;
  const cowlLen = Math.max(0.24, cowlZ1 - cowlZ0);
  const cowlTopY = Math.min(dashTop + 0.06, S.hoodY - 0.012);
  rbox(g, cabW + 0.02, 0.055, cowlLen, dark, 0, cowlTopY - 0.028, (cowlZ0 + cowlZ1) / 2, 0.02);
  // поперечная балка под лобовым — продолжение щита моторного отсека
  rbox(g, cabW + 0.04, Math.max(0.1, cowlTopY - floorY - 0.05), 0.06, dark, 0, (floorY + cowlTopY) / 2, cowlZ0 + 0.02, 0.02);
  for (const side of [-1, 1]) {
    rbox(g, 0.05, Math.max(0.2, cowlTopY - floorY), cowlLen + 0.12, mid,
      side * (cabW / 2 - 0.03), (floorY + cowlTopY) / 2, (cowlZ0 + cowlZ1) / 2, 0.02);
  }

  // руль — между водителем и панелью
  const sw = group(g, 'steering');
  sw.position.set(-cabW * 0.27, dashTop - 0.11, dashZ + 0.33);
  sw.rotation.x = -0.42;
  torus(sw, 0.175, 0.021, M.leather, 0, 0, 0, 36);
  // ступица-накладка и спицы «Т»-образно, как на тягачах
  const hub = rbox(sw, 0.14, 0.1, 0.045, M.plastic, 0, 0, 0.012, 0.03);
  for (const a of [0, PI, -HALF]) {
    const sp = box(sw, 0.032, 0.12, 0.018, M.plasticGray, Math.cos(a) * 0.085, Math.sin(a) * 0.085, 0.006);
    sp.rotation.z = a - HALF;
    const trim = box(sw, 0.014, 0.1, 0.006, M.chromeDark, Math.cos(a) * 0.085, Math.sin(a) * 0.085, 0.017);
    trim.rotation.z = a - HALF;
  }
  const em = cyl(sw, 0.024, 0.024, 0.008, M.accent(unit.accent || '#d8d5c8'), 0, 0, 0.038, 14);
  em.rotation.x = HALF;
  // рулевая колонка — от панели к рулю
  const col = cyl(g, 0.032, 0.048, 0.42, M.plastic, -cabW * 0.27, dashTop - 0.06, dashZ + 0.17, 10);
  col.rotation.x = 0.6;
  // селектор, подлокотник, педали
  const gear = cyl(g, 0.016, 0.02, 0.17, M.chromeDark, 0.12, floorY + 0.22, dashZ + 0.22, 8);
  gear.rotation.x = -0.28;
  sphere(g, 0.032, M.plastic, 0.12, floorY + 0.3, dashZ + 0.25, 8);
  rbox(g, 0.21, 0.1, 0.46, mid, 0, floorY + 0.24, (dashZ + zRear) / 2 + 0.1, 0.03);
  for (const x of [-0.045, 0.045]) cyl(g, 0.028, 0.028, 0.02, M.rubberTrim, x, floorY + 0.28, (dashZ + zRear) / 2 - 0.04, 10);
  for (const x of [-cabW * 0.34, -cabW * 0.22]) {
    const pedal = box(g, 0.055, 0.018, 0.09, M.steel, x, floorY + 0.13, dashZ - 0.24);
    pedal.rotation.x = 0.6;
  }
  // зеркало, плафон, козырьки
  rbox(g, 0.19, 0.045, 0.03, M.plastic, 0, H - 0.1, S.roofRearZ - 0.34, 0.02);
  box(g, 0.16, 0.036, 0.007, M.mirror, 0, H - 0.1, S.roofRearZ - 0.358);
  for (const side of [-1, 1]) rbox(g, 0.3, 0.045, 0.018, M.plasticLight, side * 0.24, H - 0.14, S.wsTopZ + 0.2, 0.015);
  const lamp = cyl(g, 0.036, 0.036, 0.016, M.headlight, 0, H - 0.122, zMid, 8);
  lamp.rotation.x = HALF;
  rbox(g, 0.09, 0.04, 0.04, M.plastic, 0, H - 0.14, S.wsTopZ + 0.3, 0.02);

  // сиденья
  function seat(x, z, { rear = false, width = 0.47 } = {}) {
    const s = group(g);
    rbox(s, width, 0.09, 0.44, seatMat, 0, floorY + 0.25, 0, 0.03);
    for (const sx of [-1, 1]) rbox(s, 0.065, 0.12, 0.4, seatTrim, sx * (width / 2 - 0.008), floorY + 0.29, 0, 0.03);
    const tilt = rear ? 0.3 : 0.16;
    const back = rbox(s, width - 0.02, 0.56, 0.13, seatMat, 0, floorY + 0.56, 0.19, 0.05);
    back.rotation.x = tilt;
    for (const sx of [-1, 1]) {
      const bol = rbox(s, 0.055, 0.48, 0.1, seatTrim, sx * (width / 2 - 0.008), floorY + 0.58, 0.2, 0.04);
      bol.rotation.x = tilt;
    }
    rbox(s, width - 0.18, 0.13, 0.1, seatMat, 0, floorY + 0.89, 0.27, 0.03);
    if (!rear) {
      const b = box(s, 0.045, 0.54, 0.01, M.plasticGray, -width / 2 + 0.05, floorY + 0.58, 0.26);
      b.rotation.x = tilt;
    }
    s.position.set(x, 0, z);
    return s;
  }
  seat(-cabW * 0.27, seatZ);
  if (!sport && S.style !== 'micro') seat(cabW * 0.27, seatZ);
  anchors.push({ pos: [-cabW * 0.27, floorY + 0.6, seatZ], label: 'Сиденье водителя' });
  anchors.push({ pos: [0, floorY + 0.52, dashZ], label: 'Торпедо и руль' });
  if (unit.seats > 2) {
    // диван отодвинут в корму: раньше он наезжал на спинки передних кресел,
    // и «задние места» были вжаты в торпедо
    const rz = zRearSeat;
    if (unit.seats >= 5) {
      rbox(g, cabW - 0.08, 0.11, 0.46, seatMat, 0, floorY + 0.27, rz, 0.04);
      for (const sx of [-1, 1]) rbox(g, 0.08, 0.14, 0.44, seatTrim, sx * (cabW / 2 - 0.07), floorY + 0.31, rz, 0.03);
      const back = rbox(g, cabW - 0.06, 0.5, 0.13, seatMat, 0, floorY + 0.58, rz + 0.25, 0.05);
      back.rotation.x = 0.26;
      for (const sx of [-1, 0, 1]) rbox(g, 0.14, 0.1, 0.08, seatMat, sx * (cabW * 0.26), floorY + 0.85, rz + 0.29, 0.02);
      anchors.push({ pos: [0, floorY + 0.52, rz], label: 'Задний ряд' });
    } else {
      seat(-cabW * 0.27, rz, { rear: true });
      seat(cabW * 0.27, rz, { rear: true });
    }
  }
  return g;
}
