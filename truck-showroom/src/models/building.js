// ============================================================
// ЗДАНИЯ: 20+ процедурных построек для шоурума.
// У каждого дома ЧЕТЫРЕ разных фасада — перед, зад, право, лево —
// плюс общий ракурс. Всё из примитивов: корпус, окна с откосами,
// двери с проёмом, козырьки, вывески, кровля, труба, пандусы.
// ============================================================
import * as THREE from 'three';
import {
  box, cyl, plane, group, labelTexture, HALF, PI,
} from '../lib/kit.js';

function std(color, rough = 0.8, metal = 0.1) {
  return new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal });
}

const GLASS = () => std('#20303c', 0.18, 0.55);
const GLASS_LIT = () => std('#f0d79a', 0.35, 0.05);

/** Корпус: стены, цоколь, парапет. */
function shell(root, { W, D, H, mat, baseMat, roofMat }) {
  const body = group(root, 'body');
  box(body, W, H, D, mat, 0, H / 2, 0);
  // цоколь — чтобы дом не «втыкался» в подиум
  box(body, W + 0.16, 0.5, D + 0.16, baseMat, 0, 0.25, 0);
  // парапет
  box(body, W + 0.12, 0.28, D + 0.12, roofMat, 0, H + 0.1, 0);
  return body;
}

/**
 * Фасад: axis = 'front' | 'back' | 'left' | 'right'.
 * Возвращает функцию «окно» в локальных координатах фасада,
 * чтобы сторона описывалась одинаково, а поворот делал своё дело.
 */
function facadeFrame(root, { axis, W, D }) {
  const g = group(root, `facade-${axis}`);
  const along = axis === 'front' || axis === 'back' ? W : D;
  const out = axis === 'front' ? D / 2 : axis === 'back' ? -D / 2 : axis === 'right' ? W / 2 : -W / 2;
  const rotY = axis === 'front' ? 0 : axis === 'back' ? PI : axis === 'right' ? HALF : -HALF;
  if (axis === 'front' || axis === 'back') g.position.set(0, 0, out);
  else g.position.set(out, 0, 0);
  g.rotation.y = rotY;
  return { g, along, rotY };
}

/** Откос проёма: четыре трапеции от наружного контура к внутреннему.
 *  Так окно действительно «утоплено», а не наклеено на фасад. */
function revealRing(wOut, hOut, wIn, hIn, depth) {
  const p = [];
  const quad = (a, b, c, d) => {
    p.push(...a, ...b, ...c, ...a, ...c, ...d);
  };
  const ox = wOut / 2;
  const oy = hOut / 2;
  const ix = wIn / 2;
  const iy = hIn / 2;
  const O = depth;
  quad([-ox, oy, O], [ox, oy, O], [ix, iy, 0], [-ix, iy, 0]); // верх
  quad([ox, oy, O], [ox, -oy, O], [ix, -iy, 0], [ix, iy, 0]); // право
  quad([ox, -oy, O], [-ox, -oy, O], [-ix, -iy, 0], [ix, -iy, 0]); // низ
  quad([-ox, -oy, O], [-ox, oy, O], [-ix, iy, 0], [-ix, -iy, 0]); // лево
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(p, 3));
  g.computeVertexNormals();
  return g;
}

/** Окно: откос с уклоном, стекло в глубине проёма, импосты заподлицо,
 *  подоконник с капельником. */
function windowUnit(parent, x, y, w = 1.4, h = 1.5, lit = false) {
  const jamb = std('#cdc9bb', 0.78, 0.08);
  jamb.side = THREE.DoubleSide;
  const reveal = new THREE.Mesh(revealRing(w + 0.2, h + 0.2, w, h, 0.072), jamb);
  reveal.position.set(x, y, 0.006);
  reveal.name = 'window-reveal';
  parent.add(reveal);
  // тёмная плоскость в глубине: сам проём
  box(parent, w + 0.02, h + 0.02, 0.012, std('#1b2126', 0.95, 0.03), x, y, 0.01);
  // стекло чуть впереди дна проёма
  const glass = box(parent, w - 0.03, h - 0.03, 0.012, lit ? GLASS_LIT() : GLASS(), x, y, 0.022);
  glass.name = 'window-glass';
  // импосты — тонкие, почти в плоскости стекла
  const frame = std('#e2ded1', 0.45, 0.3);
  box(parent, w, 0.04, 0.022, frame, x, y + h / 2 - 0.02, 0.03);
  box(parent, w, 0.04, 0.022, frame, x, y - h / 2 + 0.02, 0.03);
  box(parent, 0.04, h - 0.08, 0.022, frame, x - w / 2 + 0.02, y, 0.03);
  box(parent, 0.04, h - 0.08, 0.022, frame, x + w / 2 - 0.02, y, 0.03);
  if (w > 1.1) box(parent, 0.03, h - 0.08, 0.02, frame, x, y, 0.032);
  // подоконник с капельником
  box(parent, w + 0.3, 0.055, 0.14, std('#cfcabd', 0.72, 0.1), x, y - h / 2 - 0.1, 0.05);
  box(parent, w + 0.26, 0.03, 0.05, std('#8d8a80', 0.85, 0.05), x, y - h / 2 - 0.14, 0.1);
}

/** Вход: проём, дверное полотно, козырёк, ступени.
 *  Полотно стоит ВПЛОТНУЮ к фасаду и чуть выступает — иначе оно прячется
 *  внутри стены толщиной 30 см и двери просто не видно. */
function entrance(parent, x, h, { w = 1.6, litMat, canopy = true, sign = null } = {}) {
  // обрамление проёма
  box(parent, w + 0.22, h + 0.14, 0.05, std('#191d20', 0.95, 0.05), x, h / 2, 0.03);
  const leaf = box(parent, w, h, 0.05, litMat || std('#3a4046', 0.5, 0.45), x, h / 2, 0.055);
  leaf.name = 'door-leaf';
  // филёнки и ручка
  box(parent, w * 0.7, h * 0.36, 0.012, std('#2c3237', 0.6, 0.35), x, h * 0.68, 0.085);
  box(parent, w * 0.7, h * 0.3, 0.012, std('#2c3237', 0.6, 0.35), x, h * 0.3, 0.085);
  const handle = box(parent, 0.05, 0.2, 0.05, std('#e6e2d6', 0.3, 0.8), x + w * 0.28, h * 0.5, 0.1);
  handle.name = 'door-handle';
  // наличник
  const f = std('#d8d5c8', 0.45, 0.4);
  box(parent, 0.06, h + 0.06, 0.06, f, x - w / 2 - 0.03, h / 2, 0.05);
  box(parent, 0.06, h + 0.06, 0.06, f, x + w / 2 + 0.03, h / 2, 0.05);
  box(parent, w + 0.12, 0.06, 0.06, f, x, h + 0.03, 0.05);
  // ступени
  box(parent, w + 0.5, 0.12, 0.5, std('#9a9c9d', 0.9, 0.05), x, 0.06, 0.3);
  if (canopy) {
    box(parent, w + 1.1, 0.1, 0.7, std('#4b5157', 0.7, 0.3), x, h + 0.42, 0.32);
    for (const s of [-1, 1]) box(parent, 0.05, 0.44, 0.05, std('#4b5157', 0.7, 0.3), x + s * (w / 2 + 0.45), h + 0.2, 0.34);
  }
  if (sign) {
    const tex = labelTexture(sign, { width: 512, height: 128, bg: '#101418', fg: '#f2ecdd', accent: '#e8b45a' });
    if (tex) {
      const m = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.6, metalness: 0.2, side: THREE.DoubleSide });
      const p = plane(parent, Math.min(w + 1.4, 3.2), 0.42, m, x, h + 0.85, 0.05);
      p.name = 'building-sign';
    }
  }
}

/** Ворота/секционные двери — для складов, сервисов, депо.
 *  Секции ворот — наружу от плоскости стены, иначе они «утонут» в фасаде. */
function gate(parent, x, w = 3.2, h = 3.4) {
  box(parent, w + 0.26, h + 0.2, 0.06, std('#15181a', 0.95, 0.05), x, h / 2, 0.03);
  const leafMat = std('#7d868c', 0.55, 0.4);
  for (let i = 0; i < 5; i++) {
    box(parent, w, (h / 5) - 0.04, 0.05, leafMat, x, 0.06 + (i + 0.5) * (h / 5), 0.055);
  }
  box(parent, w + 0.2, 0.1, 0.09, std('#d8d5c8', 0.4, 0.5), x, h + 0.06, 0.05);
  box(parent, 0.06, h, 0.09, std('#c9cdd0', 0.4, 0.5), x - w / 2 - 0.03, h / 2, 0.05);
  box(parent, 0.06, h, 0.09, std('#c9cdd0', 0.4, 0.5), x + w / 2 + 0.03, h / 2, 0.05);
}

function windowsRow(parent, { y, from, to, step, w = 1.3, h = 1.4, litEvery = 0 }) {
  let i = 0;
  for (let x = from; x <= to + 0.01; x += step) {
    windowUnit(parent, x, y, w, h, litEvery > 0 && i % litEvery === 1);
    i += 1;
  }
}

// ------------------------------------------------------------ корпуса по стилям
function panelHouse(body, f, { floors, H, W, D, accent }) {
  const floorH = (H - 1.4) / floors;
  const wallMat = std(accent || '#b9b3a4', 0.92, 0.03);
  box(body, W + 0.06, H - 1.2, D + 0.06, wallMat, 0, 1.2 + (H - 1.2) / 2, 0);
  // межэтажные пояса
  for (let i = 0; i <= floors; i++) {
    const y = 1.2 + i * floorH;
    box(body, W + 0.14, 0.12, D + 0.14, std('#8f8a7c', 0.95, 0.02), 0, y, 0);
  }
  for (const side of ['front', 'back', 'left', 'right']) {
    const fr = f[side];
    const spacing = { front: 2.6, back: 3.5, left: 3.0, right: 3.9 }[side] || 2.8;
    const n = Math.max(2, Math.floor(fr.along / spacing));
    const step = fr.along / n;
    for (let fl = 1; fl < floors; fl++) {
      const y = 1.2 + fl * floorH + floorH * 0.5;
      windowsRow(fr.g, {
        y, from: -fr.along / 2 + step / 2, to: fr.along / 2 - step / 2, step,
        w: Math.min(1.4, step - 0.7), h: floorH - 0.9, litEvery: side === 'front' ? 3 : 4,
      });
    }
  }
}

function brickHouse(body, f, { floors, H, W, D, accent }) {
  const floorH = (H - 1.2) / floors;
  const wallMat = std(accent || '#8a4b39', 0.95, 0.02);
  box(body, W + 0.05, H - 1.1, D + 0.05, wallMat, 0, 1.1 + (H - 1.1) / 2, 0);
  // карниз
  box(body, W + 0.3, 0.3, D + 0.3, std('#6f3b2c', 0.95, 0.02), 0, H - 0.05, 0);
  for (const side of ['front', 'back', 'left', 'right']) {
    const fr = f[side];
    const spacing = { front: 3.0, back: 4.2, left: 3.6, right: 4.6 }[side] || 3.2;
    const n = Math.max(2, Math.floor(fr.along / spacing));
    const step = fr.along / n;
    for (let fl = 0; fl < floors; fl++) {
      const y = 1.6 + fl * floorH;
      windowsRow(fr.g, {
        y, from: -fr.along / 2 + step / 2, to: fr.along / 2 - step / 2, step,
        w: 1.15, h: Math.min(1.6, floorH - 0.7), litEvery: side === 'front' ? 2 : 0,
      });
    }
  }
}

function glassTower(body, f, { floors, H, W, D }) {
  const wallMat = std('#5d6b74', 0.4, 0.5);
  box(body, W, H, D, wallMat, 0, H / 2, 0);
  for (const side of ['front', 'back', 'left', 'right']) {
    const fr = f[side];
    const cols = Math.max(3, Math.round(fr.along / 2.2));
    const rows = Math.max(3, Math.round((H - 1.6) / 2.4));
    const dx = fr.along / cols;
    const dy = (H - 1.6) / rows;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = -fr.along / 2 + dx * (c + 0.5);
        const y = 1.2 + dy * (r + 0.5);
        const pane = box(fr.g, dx - 0.22, dy - 0.22, 0.05, (r + c) % 5 === 0 ? GLASS_LIT() : GLASS(), x, y, 0.03);
        pane.name = 'window-glass';
      }
    }
    // вертикальные импосты
    for (let c = 0; c <= cols; c++) {
      box(fr.g, 0.09, H - 1.4, 0.09, std('#c9cdd0', 0.4, 0.6), -fr.along / 2 + dx * c, H / 2 + 0.1, 0.05);
    }
    for (let r = 0; r <= rows; r++) {
      box(fr.g, fr.along, 0.09, 0.09, std('#c9cdd0', 0.4, 0.6), 0, 1.2 + dy * r, 0.05);
    }
  }
}

function metalShed(body, f, { H, W, D, accent, sign, gates = 2 }) {
  const wallMat = std(accent || '#8e979b', 0.55, 0.35);
  box(body, W, H, D, wallMat, 0, H / 2, 0);
  // рёбра профлиста
  for (const side of ['front', 'back', 'left', 'right']) {
    const fr = f[side];
    for (let x = -fr.along / 2 + 0.5; x < fr.along / 2; x += 0.9) {
      box(fr.g, 0.06, H - 1.4, 0.05, std('#767f84', 0.6, 0.35), x, H / 2 + 0.2, 0.02);
    }
  }
  // ленточное остекление под кровлей — на всех четырёх фасадах
  for (const side of ['front', 'back', 'left', 'right']) {
    const fr = f[side];
    windowsRow(fr.g, {
      y: H - 1.35, from: -fr.along / 2 + 1.8, to: fr.along / 2 - 1.8,
      step: 3.6, w: 1.6, h: 0.75, litEvery: side === 'back' ? 3 : 2,
    });
  }
  const frontF = f.front;
  if (gates === 1) gate(frontF.g, 0, Math.min(4.2, W * 0.5), Math.min(4, H - 1.2));
  else {
    for (let i = 0; i < gates; i++) {
      gate(frontF.g, (i - (gates - 1) / 2) * (frontF.along / gates) * 0.9, Math.min(3.4, frontF.along / gates - 1), Math.min(3.8, H - 1.4));
    }
  }
  // служебная дверь рядом с воротами — иначе на фасаде только ворота
  entrance(frontF.g, frontF.along / 2 - 1.6, 2.05, { w: 1.05, canopy: false });
  if (sign) {
    const tex = labelTexture(sign, { width: 512, height: 110, bg: '#12161b', fg: '#f2ecdd', accent: '#e8b45a' });
    if (tex) {
      const m = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.55, metalness: 0.2, side: THREE.DoubleSide });
      const p = plane(frontF.g, Math.min(6, W * 0.5), 0.7, m, 0, Math.min(H - 0.55, 4.8), 0.05);
      p.name = 'building-sign';
    }
  }
}

function shopHouse(body, f, { H, W, D, accent, sign }) {
  const wallMat = std(accent || '#c9b89a', 0.85, 0.05);
  box(body, W, H, D, wallMat, 0, H / 2, 0);
  const fr = f.front;
  // витрина во всю ширину
  const vitrine = box(fr.g, fr.along - 0.8, Math.min(2.6, H - 1.4), 0.08, GLASS_LIT(), 0, 1.7, 0.02);
  vitrine.name = 'window-glass';
  // боковые и задние окна — фасады не должны быть близнецами
  for (const side of ['left', 'right']) {
    windowsRow(f[side].g, { y: 2.2, from: -f[side].along / 2 + 1.6, to: f[side].along / 2 - 1.6, step: 3.4, w: 1.4, h: 1.6, litEvery: 2 });
  }
  windowsRow(f.back.g, { y: 2.4, from: -f.back.along / 2 + 2, to: f.back.along / 2 - 2, step: 4, w: 1.2, h: 1.2, litEvery: 3 });
  for (let x = -fr.along / 2 + 1; x < fr.along / 2 - 0.5; x += 2.2) {
    box(fr.g, 0.1, Math.min(2.7, H - 1.3), 0.1, std('#4b5157', 0.5, 0.4), x, 1.7, 0.04);
  }
  entrance(fr.g, -fr.along / 2 + 1.6, 2.3, { w: 1.4, sign });
  // козырёк вдоль фасада
  box(fr.g, fr.along - 0.4, 0.12, 1.1, std('#8b2f2a', 0.7, 0.15), 0, Math.min(3.1, H - 0.7), 0.55);
  // окна второго этажа
  if (H > 5) {
    for (const side of ['front', 'back', 'left', 'right']) {
      windowsRow(f[side].g, { y: H - 1.5, from: -f[side].along / 2 + 1.4, to: f[side].along / 2 - 1.4, step: 2.6, w: 1.2, h: 1.2 });
    }
  }
}

function stalinHouse(body, f, { floors, H, W, D, accent }) {
  const floorH = (H - 1.6) / floors;
  const wallMat = std(accent || '#cfc3a4', 0.9, 0.03);
  box(body, W, H, D, wallMat, 0, H / 2, 0);
  box(body, W + 0.4, 0.36, D + 0.4, std('#b6a887', 0.9, 0.03), 0, H - 0.1, 0);
  box(body, W + 0.2, 0.2, D + 0.2, std('#b6a887', 0.9, 0.03), 0, 1.5, 0);
  const fr = f.front;
  for (let fl = 1; fl < floors; fl++) {
    const y = 1.8 + fl * floorH;
    windowsRow(fr.g, { y, from: -fr.along / 2 + 1.6, to: fr.along / 2 - 1.6, step: 2.9, w: 1.3, h: Math.min(1.9, floorH - 0.8), litEvery: 3 });
    // пилястры
    for (let x = -fr.along / 2 + 1.6; x < fr.along / 2 - 1; x += 2.9) {
      box(fr.g, 0.26, floorH - 0.3, 0.16, std('#ded3b7', 0.85, 0.05), x + 1.45, y, 0.06);
    }
  }
  for (const side of ['back', 'left', 'right']) {
    for (let fl = 1; fl < floors; fl++) {
      windowsRow(f[side].g, { y: 1.8 + fl * floorH, from: -f[side].along / 2 + 1.6, to: f[side].along / 2 - 1.6, step: 3.1, w: 1.1, h: 1.5 });
    }
  }
  entrance(fr.g, 0, 2.6, { w: 1.8 });
}

// ------------------------------------------------------------ крыша
function roofDetails(root, { W, D, H, style, accent }) {
  const r = group(root, 'roof');
  if (style === 'gable') {
    // двускатная кровля
    const h = Math.min(3, W * 0.28);
    const shape = new THREE.Shape();
    shape.moveTo(-W / 2 - 0.5, 0);
    shape.lineTo(W / 2 + 0.5, 0);
    shape.lineTo(0, h);
    shape.closePath();
    const geo = new THREE.ExtrudeGeometry(shape, { depth: D + 1, bevelEnabled: false });
    geo.translate(0, 0, -(D + 1) / 2);
    const m = new THREE.Mesh(geo, std(accent || '#5a6066', 0.75, 0.3));
    m.position.set(0, H, 0);
    m.name = 'roof-gable';
    r.add(m);
  } else {
    // плоская кровля: вентиляция, выход, антенна
    box(r, 1.6, 0.9, 1.2, std('#9aa0a4', 0.8, 0.2), W * 0.2, H + 0.6, -D * 0.15);
    box(r, 1.1, 0.7, 1.0, std('#8d9397', 0.8, 0.2), -W * 0.25, H + 0.5, D * 0.12);
    const vent = cyl(r, 0.22, 0.22, 1.1, std('#b9bec1', 0.6, 0.3), W * 0.05, H + 0.7, D * 0.2, 12);
    vent.name = 'roof-vent';
    if (style === 'office' || style === 'glass') {
      const mast = cyl(r, 0.06, 0.08, 2.6, std('#c3c8cb', 0.5, 0.6), -W * 0.1, H + 1.9, -D * 0.2, 8);
      mast.name = 'roof-mast';
    }
  }
}

/** Труба котельной. */
function chimney(root, { H, x = 0, z = 0, h = 12 }) {
  const c = cyl(root, 0.9, 1.15, h, std('#8d5a45', 0.95, 0.02), x, H + h / 2, z, 16);
  c.name = 'chimney';
  for (let y = H + 1.5; y < H + h; y += 2.2) {
    cyl(root, 1.2, 1.2, 0.16, std('#c7bda9', 0.9, 0.05), x, y, z, 16);
  }
}

// ------------------------------------------------------------ сборка
export function buildBuilding(unit, M) {
  const root = group(null, `building:${unit.id}`);
  const accentPaint = M.accent(unit.paint || '#b9b3a4');
  const paintMats = [accentPaint];
  const anchors = [];
  const floors = unit.floors ?? 5;
  const floorH = unit.floorH ?? 3;
  const W = unit.width ?? 18;
  const D = unit.depth ?? 12;
  const H = unit.height ?? Math.max(4, 1.6 + floors * floorH);
  const style = unit.style || 'panel';

  const wall = std(unit.paint || '#b9b3a4', 0.92, 0.04);
  const baseMat = std('#7c7770', 0.95, 0.04);
  const roofMat = std('#6f7478', 0.85, 0.15);
  shell(root, { W, D, H, mat: wall, baseMat, roofMat });

  const f = {
    front: facadeFrame(root, { axis: 'front', W, D }),
    back: facadeFrame(root, { axis: 'back', W, D }),
    left: facadeFrame(root, { axis: 'left', W, D }),
    right: facadeFrame(root, { axis: 'right', W, D }),
  };

  if (style === 'panel') panelHouse(root, f, { floors, H, W, D, accent: unit.paint });
  else if (style === 'brick') brickHouse(root, f, { floors, H, W, D, accent: unit.paint });
  else if (style === 'stalin') stalinHouse(root, f, { floors, H, W, D, accent: unit.paint });
  else if (style === 'glass' || style === 'office') glassTower(root, f, { floors, H, W, D });
  else if (style === 'metal') metalShed(root, f, { H, W, D, accent: unit.paint, gates: unit.gates ?? 2 });
  else if (style === 'shop') shopHouse(root, f, { H, W, D, accent: unit.paint, sign: unit.sign });
  else panelHouse(root, f, { floors, H, W, D, accent: unit.paint });

  // Гарантия «не пустого» фасада: если после стиля на стороне нет окон,
  // добавляем узкий ряд — сзади и с боков он другой, поэтому все четыре
  // фасада читаются по-разному.
  for (const [side, n] of [['front', 3], ['back', 2], ['left', 2], ['right', 3]]) {
    const fr = f[side];
    let count = 0;
    fr.g.traverse((o) => { if (o.isMesh && o.name === 'window-glass') count += 1; });
    if (count >= 2) continue;
    const from = -fr.along / 2 + 2.2;
    const to = fr.along / 2 - 2.2;
    for (let i = 0; i < n; i++) {
      const x = from + ((to - from) * (i + 0.5)) / n;
      windowUnit(fr.g, x, Math.min(H - 1.6, 2.6), 1.15, 1.3, i === 1);
    }
  }

  // вход и вывеска для домов без своего «магазинного» фасада
  if (style !== 'shop' && style !== 'metal') {
    entrance(f.front.g, 0, Math.min(2.5, H * 0.35), { w: 1.7, sign: unit.sign || unit.brand });
  }
  // задний ход: служебная дверь, пандус/док
  entrance(f.back.g, W * 0.16, 2.1, { w: 1.3, canopy: false });
  if (style === 'metal' || style === 'panel' || style === 'brick') {
    box(f.back.g, 2.6, 1.1, 0.6, std('#6f7478', 0.9, 0.1), -W * 0.2, 0.55, 0.3);
  }
  // Стороны не должны быть близнецами: слева водосточная труба, справа
  // ввод питания и вентиляционные решётки. Мелочь, но фасад читается иначе.
  {
    const fl = f.left;
    const pipe = cyl(fl.g, 0.09, 0.09, Math.max(2, H - 0.6), std('#8b9196', 0.7, 0.3), -fl.along / 2 + 0.4, Math.max(2, H - 0.6) / 2, 0.18, 8);
    pipe.name = 'downpipe';
    box(fl.g, 0.5, 0.34, 0.22, std('#4d5155', 0.8, 0.25), fl.along / 2 - 1.2, 1.9, 0.12).name = 'meter-box';
    const fr2 = f.right;
    box(fr2.g, 0.8, 1.1, 0.28, std('#5a6167', 0.85, 0.2), fr2.along / 2 - 1.2, 2.3, 0.16).name = 'power-box';
    for (let i = 0; i < 3; i++) {
      box(fr2.g, 0.7, 0.36, 0.16, std('#3c4348', 0.7, 0.4), -fr2.along / 2 + 1.3 + i * 0.9, Math.min(H - 1.4, 3.4), 0.12).name = 'vent-grille';
    }
  }

  // пожарная лестница сбоку — узнаваемая деталь
  if (H > 8 && (style === 'panel' || style === 'brick' || style === 'stalin')) {
    const side = f.right;
    for (let y = 3; y < H - 1; y += 3) {
      box(side.g, 1.9, 0.08, 0.85, std('#4d5155', 0.7, 0.35), side.along * 0.28, y, 0.42);
      box(side.g, 1.9, 0.7, 0.06, std('#4d5155', 0.7, 0.35), side.along * 0.28, y + 0.42, 0.72);
    }
  }

  roofDetails(root, { W, D, H, style, accent: unit.paint });
  if (unit.chimney) chimney(root, { H, h: unit.chimney, x: W * 0.2, z: -D * 0.1 });

  // навес над заправкой/парковкой
  if (unit.canopy) {
    const cg = group(root, 'canopy');
    box(cg, W * 0.8, 0.28, D * 0.5, std('#d8d5c8', 0.6, 0.2), 0, 4.4, D * 0.75);
    for (const sx of [-1, 1]) {
      for (const sz of [-1, 1]) {
        cyl(cg, 0.16, 0.16, 4.3, std('#b9bec1', 0.5, 0.45), sx * W * 0.32, 2.15, D * 0.75 + sz * D * 0.18, 10);
      }
    }
    box(cg, 1.2, 0.9, 0.5, std('#c8ccce', 0.6, 0.2), W * 0.18, 0.45, D * 0.8);
  }

  // точки осмотра: фасады, вход, крыша, вывеска
  anchors.push({ pos: [0, 2.2, D / 2 + 0.4], label: 'Главный вход' });
  anchors.push({ pos: [0, H / 2, D / 2], label: 'Передний фасад' });
  anchors.push({ pos: [-W / 2 - 0.3, H * 0.55, 0], label: 'Левый фасад', side: 'слева' });
  anchors.push({ pos: [W / 2 + 0.3, H * 0.55, 0], label: 'Правый фасад', side: 'справа' });
  anchors.push({ pos: [0, H * 0.55, -D / 2 - 0.3], label: 'Задний фасад' });
  anchors.push({ pos: [0, H + 0.8, 0], label: 'Кровля' });
  if (unit.chimney) anchors.push({ pos: [W * 0.2, H + unit.chimney * 0.7, -D * 0.1], label: 'Труба' });

  // камеры: четыре фасада + общий ракурс — как просили
  const dist = Math.max(W, D, H) * 1.9 + 6;
  const eye = Math.min(H * 0.55, H - 1.2) + 1.6;
  const views = [
    { id: 'front', label: 'Перед', group: 'exterior', pos: [0, eye, D / 2 + dist * 0.85], target: [0, H * 0.42, 0], fov: 34, orbit: true },
    { id: 'back', label: 'Зад', group: 'exterior', pos: [0, eye, -D / 2 - dist * 0.85], target: [0, H * 0.42, 0], fov: 34, orbit: true },
    { id: 'right', label: 'Справа', group: 'exterior', pos: [W / 2 + dist * 0.85, eye, 0], target: [0, H * 0.42, 0], fov: 34, orbit: true },
    { id: 'left', label: 'Слева', group: 'exterior', pos: [-W / 2 - dist * 0.85, eye, 0], target: [0, H * 0.42, 0], fov: 34, orbit: true },
    {
      id: 'exterior', label: 'Снаружи', group: 'exterior',
      pos: [W * 0.9 + dist * 0.55, H * 0.85 + 2, D * 0.9 + dist * 0.55], target: [0, H * 0.38, 0], fov: 36, orbit: true, autoRotate: true,
    },
  ];

  const layout = { width: W, depth: D, height: H, floors, ground: 0 };
  return { root, wheels: [], paintMats, views, anchors, layout, kind: 'building', damage: null };
}
