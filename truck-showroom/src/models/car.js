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
} from '../lib/kit.js';

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
  const belt = H * (sport ? 0.72 : van ? 0.62 : suv ? 0.66 : 0.66);
  const hoodY = H * (suv ? 0.58 : van ? 0.46 : sport ? 0.5 : 0.56);
  const noseY = H * (suv ? 0.5 : 0.46);
  const deckY = H * (suv ? 0.7 : van ? 0.62 : sport ? 0.62 : 0.62);
  const hoodZ = front + L * (van ? 0.2 : suv ? 0.24 : 0.27);
  const wsBase = front + L * (van ? 0.3 : suv ? 0.34 : sport ? 0.3 : 0.31);
  const wsTopZ = wsBase + (H - hoodY) * (van ? 0.7 : suv ? 0.85 : 1.05);
  const roofRearZ = rear - L * (wagon ? 0.05 : van ? 0.03 : pickup ? 0.36 : suv ? 0.13 : sport ? 0.4 : 0.31);
  const rearBaseZ = roofRearZ + (H - deckY) * (van ? 0.35 : suv ? 0.5 : sport ? 1.6 : 0.95);
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
  shape.moveTo(outline[0][0], outline[0][1]);
  for (let i = 1; i < outline.length; i++) shape.lineTo(outline[i][0], outline[i][1]);
  shape.closePath();
  // арки
  for (const az of axleZ) {
    const arch = new THREE.Path();
    arch.absarc(az, R + 0.02, R + 0.05, 0, TAU, false);
    shape.holes.push(arch);
  }
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
    const tintedGlass = new THREE.MeshPhysicalMaterial({
      color: 0x243642, metalness: 0.35, roughness: 0.08, transparent: true, opacity: 0.62,
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
    // лобовое стекло (чуть выше кромки капота)
    glassQuad(S.wsBase - 0.06, S.hoodY + 0.02, S.wsTopZ - 0.03, H - 0.04, 0.9, 0.09);
    // заднее стекло (у пикапа — почти вертикальная стенка кабины)
    if (S.pickup) glassQuad(S.roofRearZ + 0.02, H - 0.05, S.roofRearZ + 0.12, S.deckY + 0.06, 0.86, 0.09);
    else glassQuad(S.roofRearZ + 0.04, H - 0.05, S.rearBaseZ + 0.02, S.deckY + 0.02, 0.88, 0.09);
    // чёрные канты стёкол
    for (const [z0, y0, z1, y1, hw] of [
      [S.wsBase - 0.06, S.hoodY + 0.02, S.wsTopZ - 0.03, H - 0.04, 0.9],
      [S.roofRearZ + 0.04, H - 0.05, S.rearBaseZ + 0.02, S.deckY + 0.02, 0.88],
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
        arch.position.set(side * (halfW + 0.004), R + 0.02, z);
        // подкрылок, чтобы за колесом не было пустоты
        const well = new THREE.Mesh(new THREE.CylinderGeometry(R + 0.055, R + 0.055, 0.2, 16, 1, true, 0, PI), M.plastic);
        well.rotation.z = HALF;
        well.position.set(side * (halfW - 0.16), R + 0.02, z);
        root.add(well);
        arch.rotation.y = side > 0 ? -HALF : HALF;
        root.add(arch);
      }
    }
    // пороги и подштамповка
    for (const side of [-1, 1]) {
      rbox(root, 0.07, 0.1, wb * 0.78, black, side * (halfW + 0.002), ground + 0.13, 0, 0.02);
      box(root, 0.02, 0.028, wb * 0.92, paintDark, side * (halfW + 0.013), belt - 0.26, 0);
      box(root, 0.015, 0.018, wb * 0.9, chrome, side * (halfW + 0.013), belt - 0.2, 0);
    }

    // ---------- стёкла в проёмах
    for (const h of windowHoles) {
      for (const side of [-1, 1]) {
        const pos = [];
        const idx = [];
        const steps = 8;
        for (let i = 0; i <= steps; i++) {
          const z = lerp(h.z0, h.z1, i / steps);
          pos.push(side * (sideX - 0.035), winBottom + 0.015, z);
        }
        for (let i = 0; i <= steps; i++) {
          const z = lerp(h.z0, h.z1, i / steps);
          pos.push(side * (sideX - 0.035), pick(z) - 0.012, z);
        }
        const n = steps + 1;
        for (let i = 0; i < n - 1; i++) idx.push(i, i + 1, n + i, i + 1, n + i + 1, n + i);
        const g3 = new THREE.BufferGeometry();
        g3.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
        g3.setIndex(idx);
        g3.computeVertexNormals();
        root.add(new THREE.Mesh(g3, M.glass));
      }
    }
    // чёрные накладки стоек
    for (const side of [-1, 1]) {
      const bh = Math.max(0.25, pick(bPillarZ) - winBottom);
      box(root, 0.02, bh, pillarW, black, side * (halfW + 0.004), winBottom + bh / 2, bPillarZ);
    }

    // ---------- перед: решётка, фары, бампер
    const noseFront = front + 0.004;
    const grilleY = (ground + S.noseY) / 2 + 0.02;
    rbox(root, W * 0.42, Math.max(0.12, S.noseY - grilleY - 0.06), 0.08, black, 0, grilleY, noseFront - 0.02, 0.02);
    for (let i = -3; i <= 3; i++) box(root, W * 0.38, 0.013, 0.015, chrome, 0, grilleY + i * 0.022, noseFront - 0.06);
    const logo = cyl(root, 0.058, 0.058, 0.018, chrome, 0, grilleY, noseFront - 0.075, 20);
    logo.rotation.x = HALF;
    for (const side of [-1, 1]) {
      rbox(root, 0.34, 0.09, 0.1, M.headlight, side * halfW * 0.68, S.noseY - 0.02, front + 0.06, 0.03);
      box(root, 0.26, 0.016, 0.02, chrome, side * halfW * 0.68, S.noseY - 0.075, front + 0.02);
      box(root, 0.13, 0.04, 0.05, M.amber, side * halfW * 0.84, S.noseY - 0.09, front + 0.04);
      const fog = cyl(root, 0.042, 0.042, 0.025, M.headlight, side * halfW * 0.6, ground + 0.18, front - 0.008, 10);
      fog.rotation.x = HALF;
    }
    rbox(root, W * 0.98, 0.24, 0.22, paintDark, 0, ground + 0.13, front + 0.08, 0.06);
    rbox(root, W * 0.58, 0.1, 0.05, black, 0, ground + 0.05, front + 0.02, 0.02);

    // ---------- корма
    for (const side of [-1, 1]) {
      rbox(root, 0.38, 0.12, 0.1, M.taillight, side * halfW * 0.66, S.deckY - 0.08, rear - 0.01, 0.02);
      box(root, 0.18, 0.045, 0.03, M.reverseLight, side * halfW * 0.56, S.deckY - 0.17, rear + 0.01);
    }
    const plateTex = plateTexture('О 777 АА');
    if (plateTex) plane(root, 0.42, 0.11, new THREE.MeshStandardMaterial({ map: plateTex, roughness: 0.55 }), 0, S.deckY - 0.3, rear + 0.012);
    rbox(root, W * 0.98, 0.22, 0.16, paintDark, 0, ground + 0.16, rear - 0.06, 0.05);
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
    
    // маркировка на борту
    const btex = labelTexture(unit.brand || 'ASTER', {
      width: 256, height: 64, bg: 'rgba(0,0,0,0)', fg: '#f4f0e4', accent: accentColor,
      font: 'bold 40px Arial, sans-serif', border: false,
    });
    if (btex) {
      const mat = new THREE.MeshStandardMaterial({ map: btex, transparent: true, roughness: 0.5 });
      for (const side of [-1, 1]) {
        const p = plane(root, 0.52, 0.13, mat, side * (halfW + 0.03), ground + 0.33, S.wsBase - 0.35);
        p.rotation.y = side > 0 ? -HALF : HALF;
      }
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
  const eyeZr = S.sport ? S.wsTopZ + 0.34 : S.wsTopZ + (S.van ? 0.66 : S.suv ? 0.62 : 0.5);
  const views = [
    {
      id: 'driver', label: 'Место водителя', group: 'interior',
      pos: [-cabW * 0.22, belt + eyeY * 0 + 0.3 + tall, eyeZr],
      target: [-0.06, eyeAbs - (S.sport ? 0.06 : S.suv ? 0.52 : 0.4), S.wsBase - 7],
      fov: S.sport ? 62 : 68, orbit: false, seat: true,
    },
    {
      id: 'salon', label: 'Салон', group: 'interior',
      // снимаем с заднего дивана по центру: передние кресла уходят в стороны,
      // а в кадре остаются торпедо, руль и центральная консоль
      // из прохода между креслами вперёд: торпедо, руль, консоль,
      // стойки и боковые окна — общий вид салона
      pos: [0, floorY + (H - floorY) * 0.6, S.wsTopZ + 0.78],
      target: [0, floorY + (H - floorY) * 0.32, S.wsBase - 3.4],
      fov: 72, orbit: true, seat: true,
    },
    { id: 'exterior', label: 'Снаружи', group: 'exterior', pos: [6.4, 2.55, -7.0], target: [0, 0.72, 0.05], fov: 32, orbit: true, autoRotate: true },
    { id: 'side', label: 'Сбоку', group: 'exterior', pos: [8.8, 1.3, 0.15], target: [0, 0.72, 0], fov: 27, orbit: true },
    { id: 'rear', label: 'Сзади', group: 'exterior', pos: [-4.7, 2.1, 6.8], target: [0, 0.75, 0.1], fov: 33, orbit: true },
  ];
  const layout = { frontZ: front, rearEnd: rear, roofY: H, floorY, wheelRadius: R, belt, length: L, width: W, wsBase: S.wsBase, wsTopZ: S.wsTopZ, roofRearZ: S.roofRearZ, rearBaseZ: S.rearBaseZ };
  return { root, wheels, paintMats, views, anchors, layout, kind: 'car' };
}

// ============================================================
// САЛОН
// ============================================================
function buildCarInterior({ M, S, nodes, pick, unit, halfW, sideT, belt, H, R, anchors, floorY }) {
  const g = group(null, 'interior');
  const cabW = S.W - 0.3;
  const zFront = S.wsBase + 0.02;
  const zRear = S.rearBaseZ - 0.06;
  const zMid = (zFront + zRear) / 2;
  // глаз водителя — за верхней кромкой лобового стекла
  const eyeZ = S.wsTopZ + 0.36;
  const dashZ = eyeZ - 0.62;
  const seatZ = eyeZ + 0.12;
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

  // моторный щит: закрывает просвет между панелью и лобовым,
  // иначе из салона видны колёса и арки
  rbox(g, cabW + 0.06, Math.max(0.3, belt - floorY + 0.16), 0.05, dark, 0, (floorY + belt) / 2 - 0.02, zFront - 0.04, 0.02);

  // торпедо
  const dashTop = floorY + 0.42;
  rbox(g, cabW, 0.32, 0.42, dark, 0, floorY + 0.33, dashZ, 0.06);
  rbox(g, cabW - 0.05, 0.12, 0.54, mid, 0, dashTop + 0.02, dashZ + 0.08, 0.05);
  const binnacle = rbox(g, 0.46, 0.16, 0.24, dark, -cabW * 0.27, dashTop + 0.09, dashZ - 0.08, 0.04);
  binnacle.rotation.x = -0.16;
  for (const x of [-cabW * 0.32, -cabW * 0.22]) {
    const dial = cyl(g, 0.07, 0.07, 0.018, M.plastic, x, dashTop + 0.12, dashZ - 0.02, 18);
    dial.rotation.x = HALF;
    torus(g, 0.068, 0.005, M.chromeDark, x, dashTop + 0.12, dashZ - 0.016, 16);
    const needle = box(g, 0.005, 0.075, 0.004, M.taillight, x, dashTop + 0.145, dashZ - 0.014);
    needle.rotation.z = 0.7;
  }
  const scr = rbox(g, 0.3, 0.19, 0.022, M.dashScreen, 0.07, dashTop + 0.03, dashZ - 0.04, 0.02);
  scr.rotation.x = -0.1;
  for (const side of [-1, 1]) {
    rbox(g, 0.12, 0.055, 0.028, M.plastic, side * 0.37, dashTop + 0.055, dashZ - 0.1, 0.02);
    for (let i = -1; i <= 1; i++) box(g, 0.009, 0.045, 0.01, M.chromeDark, side * 0.37 + i * 0.032, dashTop + 0.055, dashZ - 0.115);
  }
  // руль — между водителем и торпедо (раньше стоял за панелью, у лобового)
  const sw = group(g, 'steering');
  sw.position.set(-cabW * 0.27, dashTop + 0.11, dashZ + 0.3);
  sw.rotation.x = -0.38;
  torus(sw, 0.175, 0.02, M.leather, 0, 0, 0, 34);
  const hub = cyl(sw, 0.055, 0.06, 0.05, M.plastic, 0, 0, 0.02, 16);
  hub.rotation.x = HALF;
  for (let i = 0; i < 3; i++) {
    const a = HALF + i * (TAU / 3);
    const sp = box(sw, 0.03, 0.15, 0.016, M.plasticGray, Math.cos(a) * 0.08, Math.sin(a) * 0.08, 0.012);
    sp.rotation.z = a - HALF;
  }
  const em = cyl(sw, 0.025, 0.025, 0.01, M.accent(unit.accent || '#d8d5c8'), 0, 0, 0.045, 12);
  em.rotation.x = HALF;
  const col = cyl(g, 0.032, 0.048, 0.44, M.plastic, -cabW * 0.27, dashTop + 0.02, dashZ + 0.11, 10);
  col.rotation.x = 0.62;
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
    const rz = zRear - 0.5;
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
