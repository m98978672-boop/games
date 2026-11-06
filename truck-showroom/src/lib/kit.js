// ============================================================
// ГАРАЖ 3D — набор примитивов, материалов и процедурных текстур.
// Всё строится кодом: ни одной внешней модели или картинки.
// 1 юнит = 1 метр, нос транспорта смотрит в -Z, верх +Y, право +X.
// ============================================================
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

export const HAS_DOM = typeof document !== 'undefined' && typeof document.createElement === 'function';
export const PI = Math.PI;
export const TAU = PI * 2;
export const HALF = PI / 2;
export const rad = (deg) => (deg * PI) / 180;
export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const damp = (a, b, lambda, dt) => lerp(a, b, 1 - Math.exp(-lambda * dt));
export const smooth = (t) => t * t * (3 - 2 * t);

// ------------------------------------------------ текстуры
export function canvasTexture(w, h, draw, { repeat = null, srgb = true } = {}) {
  if (!HAS_DOM) return null;
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d');
  draw(ctx, w, h);
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  if (repeat) t.repeat.set(repeat[0], repeat[1]);
  t.needsUpdate = true;
  return t;
}

function noise(ctx, w, h, amount, alpha = 0.06, size = 1) {
  for (let i = 0; i < amount; i++) {
    const v = Math.random() * 255;
    ctx.fillStyle = `rgba(${v},${v},${v},${alpha})`;
    ctx.fillRect(Math.random() * w, Math.random() * h, size, size);
  }
}

// Белый фон + рельеф протектора: используется как bumpMap шин.
function drawTread(ctx, w, h) {
  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#c8c8c8';
  for (let y = -20; y < h + 20; y += 22) {
    for (let x = 0; x < w; x += 20) {
      const off = (Math.floor(y / 22) % 2) * 10;
      ctx.save();
      ctx.translate(x + off, y);
      ctx.rotate(0.5);
      ctx.fillRect(-9, -4, 18, 8);
      ctx.restore();
    }
  }
  ctx.fillStyle = '#5a5a5a';
  for (let x = 0; x < w; x += 22) ctx.fillRect(x, 0, 3, h);
}

function drawTarp(ctx, w, h) {
  ctx.fillStyle = '#d8d8d8';
  ctx.fillRect(0, 0, w, h);
  // ткацкое переплетение
  ctx.strokeStyle = 'rgba(255,255,255,0.35)';
  ctx.lineWidth = 2;
  for (let x = 0; x < w; x += 6) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let y = 0; y < h; y += 6) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }
  ctx.strokeStyle = 'rgba(0,0,0,0.18)';
  ctx.lineWidth = 3;
  for (let x = 0; x < w; x += 64) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  noise(ctx, w, h, 2600, 0.05, 2);
}

function drawWood(ctx, w, h) {
  ctx.fillStyle = '#a87542';
  ctx.fillRect(0, 0, w, h);
  for (let i = 0; i < 26; i++) {
    const y = (i / 26) * h;
    ctx.fillStyle = i % 2 ? 'rgba(90,52,24,0.25)' : 'rgba(220,170,110,0.16)';
    ctx.fillRect(0, y, w, h / 26 - 2);
    ctx.fillStyle = 'rgba(60,34,14,0.5)';
    ctx.fillRect(0, y + h / 26 - 2, w, 2);
  }
  for (let i = 0; i < 90; i++) {
    ctx.strokeStyle = `rgba(70,40,18,${0.05 + Math.random() * 0.12})`;
    ctx.beginPath();
    const y = Math.random() * h;
    ctx.moveTo(0, y);
    ctx.bezierCurveTo(w * 0.3, y + 6, w * 0.7, y - 8, w, y + 3);
    ctx.stroke();
  }
}

function drawMetal(ctx, w, h) {
  ctx.fillStyle = '#b9bcc0';
  ctx.fillRect(0, 0, w, h);
  for (let i = 0; i < 400; i++) {
    ctx.strokeStyle = `rgba(255,255,255,${0.02 + Math.random() * 0.07})`;
    ctx.beginPath();
    const y = Math.random() * h;
    ctx.moveTo(0, y);
    ctx.lineTo(w, y + (Math.random() - 0.5) * 3);
    ctx.stroke();
  }
  noise(ctx, w, h, 1500, 0.03, 1);
}

/** Текст с разрядкой: canvas не умеет letter-spacing, рисуем по символу. */
function tracked(ctx, text, x, y, tracking = 0) {
  let cx = x;
  for (const ch of text) {
    ctx.fillText(ch, cx, y);
    cx += ctx.measureText(ch).width + tracking;
  }
  return cx - tracking;
}

function fitFont(ctx, text, maxWidth, weight, size, family, tracking = 0) {
  let px = size;
  for (let i = 0; i < 24; i++) {
    ctx.font = `${weight} ${px}px ${family}`;
    const w = ctx.measureText(text).width + tracking * Math.max(0, text.length - 1);
    if (w <= maxWidth) break;
    px *= 0.94;
    if (px < 10) break;
  }
  return px;
}

const FONT_STACK = '"Segoe UI", system-ui, -apple-system, "Helvetica Neue", Arial, sans-serif';

export function labelTexture(lines, opts = {}) {
  const {
    bg = '#12161b',
    fg = '#f2ecdf',
    accent = '#e8b45a',
    width = 512,
    height = 128,
    font = null,
    sub = '',
    subFont = null,
    border = true,
  } = opts;
  return canvasTexture(width, height, (ctx, w, h) => {
    // плотная подложка с лёгким градиентом — не «чёрный прямоугольник»
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, bg);
    g.addColorStop(1, '#0b0e11');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    if (border) {
      ctx.strokeStyle = 'rgba(232,180,90,0.35)';
      ctx.lineWidth = 2;
      ctx.strokeRect(1, 1, w - 2, h - 2);
    }
    // акцентная планка слева
    ctx.fillStyle = accent;
    ctx.fillRect(0, 0, 7, h);
    const pad = 26;
    const main = String(lines || '').toUpperCase();
    const subText = String(sub || '').toUpperCase();
    const area = w - pad - 22;
    const mainSize = subText ? h * 0.4 : h * 0.5;
    const tracking = Math.max(1, h * 0.02);
    const size = font
      ? null
      : fitFont(ctx, main, area, 700, mainSize, FONT_STACK, tracking);
    ctx.font = font || `700 ${size}px ${FONT_STACK}`;
    ctx.fillStyle = fg;
    ctx.textBaseline = 'middle';
    tracked(ctx, main, pad, subText ? h * 0.42 : h * 0.52, tracking);
    if (subText) {
      const subSize = subFont ? null : fitFont(ctx, subText, area, 600, h * 0.17, FONT_STACK, 2);
      ctx.font = subFont || `600 ${subSize}px ${FONT_STACK}`;
      ctx.fillStyle = 'rgba(242,236,223,0.62)';
      tracked(ctx, subText, pad + 1, h * 0.73, 2);
    }
  });
}

export function plateTexture(text) {
  return canvasTexture(256, 64, (ctx, w, h) => {
    ctx.fillStyle = '#f2f2ea';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#1b2634';
    ctx.fillRect(0, 0, 34, h);
    ctx.fillStyle = '#f2f2ea';
    ctx.font = 'bold 13px Arial';
    ctx.fillText('RUS', 4, h - 12);
    ctx.fillStyle = '#111';
    ctx.font = 'bold 40px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(text, 144, 46);
    ctx.strokeStyle = '#777';
    ctx.lineWidth = 3;
    ctx.strokeRect(1, 1, w - 2, h - 2);
  });
}

// ------------------------------------------------ материалы
export function createMaterials(renderer = null) {
  const aniso = Math.min(8, renderer?.capabilities?.getMaxAnisotropy?.() ?? 4);

  const T = {
    tread: canvasTexture(256, 256, drawTread, { srgb: false }),
    tarp: canvasTexture(512, 512, drawTarp, { repeat: [3, 2] }),
    wood: canvasTexture(512, 512, drawWood, { repeat: [1, 4] }),
    metal: canvasTexture(512, 512, drawMetal, { repeat: [2, 1] }),
  };
  for (const t of Object.values(T)) if (t) t.anisotropy = aniso;

  const std = (opts) => new THREE.MeshStandardMaterial(opts);
  const phys = (opts) => new THREE.MeshPhysicalMaterial(opts);

  const M = {
    // краска: отдельный экземпляр на транспорт (чтобы перекрашивать по одному)
    paint(color, opts = {}) {
      return phys({
        color,
        metalness: opts.metalness ?? 0.45,
        roughness: opts.roughness ?? 0.32,
        clearcoat: opts.clearcoat ?? 1,
        clearcoatRoughness: opts.clearcoatRoughness ?? 0.08,
        envMapIntensity: opts.envMapIntensity ?? 1.05,
      });
    },
    accent(color, opts = {}) {
      return phys({
        color,
        metalness: opts.metalness ?? 0.3,
        roughness: opts.roughness ?? 0.34,
        clearcoat: 0.8,
        clearcoatRoughness: 0.12,
      });
    },
    get chrome() {
      return std({ color: 0xf1f3f5, metalness: 1, roughness: 0.08, envMapIntensity: 1.7 });
    },
    get chromeDark() {
      return std({ color: 0xb7bcc2, metalness: 1, roughness: 0.22, envMapIntensity: 1.3 });
    },
    get steel() {
      return std({ color: 0x9aa1a8, metalness: 0.92, roughness: 0.34, map: T.metal, envMapIntensity: 1.1 });
    },
    get darkSteel() {
      return std({ color: 0x2d343a, metalness: 0.85, roughness: 0.45, envMapIntensity: 0.9 });
    },
    get frame() {
      return std({ color: 0x1e2227, metalness: 0.7, roughness: 0.6 });
    },
    get plastic() {
      return std({ color: 0x14181c, metalness: 0.15, roughness: 0.72 });
    },
    get plasticGray() {
      return std({ color: 0x3c454d, metalness: 0.1, roughness: 0.82 });
    },
    get plasticLight() {
      return std({ color: 0xb8bcbc, metalness: 0.1, roughness: 0.6 });
    },
    get rubber() {
      return std({
        color: 0x141618,
        roughness: 0.96,
        metalness: 0,
        bumpMap: T.tread,
        bumpScale: 0.035,
      });
    },
    get rubberTrim() {
      return std({ color: 0x202327, roughness: 0.9, metalness: 0.05 });
    },
    get glass() {
      return phys({
        color: 0xbfe0ee,
        metalness: 0.1,
        roughness: 0.06,
        transparent: true,
        opacity: 0.26,
        envMapIntensity: 1.6,
        depthWrite: false,
        side: THREE.DoubleSide,
      });
    },
    get glassDark() {
      return phys({
        color: 0x2a3c48,
        metalness: 0.2,
        roughness: 0.1,
        transparent: true,
        opacity: 0.55,
        envMapIntensity: 1.3,
        depthWrite: false,
      });
    },
    get mirror() {
      return std({ color: 0xdfe8ee, metalness: 1, roughness: 0.03, envMapIntensity: 2 });
    },
    get headlight() {
      return std({
        color: 0xfdfcf0,
        emissive: 0xfff3cf,
        emissiveIntensity: 0.35,
        roughness: 0.12,
        metalness: 0.25,
      });
    },
    get taillight() {
      return std({ color: 0x8e1b17, emissive: 0xff2a1a, emissiveIntensity: 0.5, roughness: 0.25 });
    },
    get amber() {
      return std({ color: 0xb4661a, emissive: 0xff9b2e, emissiveIntensity: 0.6, roughness: 0.3 });
    },
    get reverseLight() {
      return std({ color: 0xd8dcd2, emissive: 0xd9fff0, emissiveIntensity: 0.15, roughness: 0.3 });
    },
    get interiorDark() {
      return std({ color: 0x22262b, roughness: 0.82, metalness: 0.08 });
    },
    get interiorMid() {
      return std({ color: 0x33393f, roughness: 0.75, metalness: 0.1 });
    },
    get leather() {
      return std({ color: 0x23262a, roughness: 0.62, metalness: 0.05 });
    },
    get leatherBeige() {
      return std({ color: 0xa79479, roughness: 0.68, metalness: 0.04 });
    },
    get fabric() {
      return std({ color: 0x3b4249, roughness: 0.95, metalness: 0.02 });
    },
    get dashScreen() {
      return std({ color: 0x0a0f14, emissive: 0x1d4b63, emissiveIntensity: 0.55, roughness: 0.25 });
    },
    get tarp() {
      return std({ color: 0xdfe3e6, map: T.tarp, roughness: 0.92, metalness: 0.02 });
    },
    get tarpDark() {
      return std({ color: 0x3d444a, map: T.tarp, roughness: 0.94, metalness: 0.02 });
    },
    get wood() {
      return std({ color: 0xb98a52, map: T.wood, roughness: 0.86, metalness: 0.02 });
    },
    get tank() {
      return std({ color: 0xd8dee2, metalness: 0.95, roughness: 0.18, envMapIntensity: 1.5 });
    },
    get tankWhite() {
      return std({ color: 0xe9edee, metalness: 0.35, roughness: 0.3, envMapIntensity: 1.1 });
    },
    get orange() {
      return std({ color: 0xd8691f, metalness: 0.25, roughness: 0.55 });
    },
    get hazard() {
      return std({ color: 0xe08a1e, metalness: 0.2, roughness: 0.6 });
    },
    get rope() {
      return std({ color: 0x6d6455, roughness: 0.95 });
    },
    get containerBlue() {
      return std({ color: 0x275b78, metalness: 0.55, roughness: 0.6 });
    },
    get containerRed() {
      return std({ color: 0x8c3a2a, metalness: 0.5, roughness: 0.62 });
    },
    get containerGreen() {
      return std({ color: 0x3d6547, metalness: 0.5, roughness: 0.6 });
    },
    get concrete() {
      return std({ color: 0x9c9c94, roughness: 0.95 });
    },
  };
  return M;
}

// ------------------------------------------------ геометрия
export function group(parent = null, name = '') {
  const g = new THREE.Group();
  g.name = name;
  if (parent) parent.add(g);
  return g;
}

export function mesh(parent, geometry, material, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(geometry, material);
  m.position.set(x, y, z);
  parent?.add(m);
  return m;
}

export function box(parent, w, h, d, material, x = 0, y = 0, z = 0) {
  return mesh(parent, new THREE.BoxGeometry(w, h, d), material, x, y, z);
}

/** Скруглённый параллелепипед: основа всех кузовов. */
export function rbox(parent, w, h, d, material, x = 0, y = 0, z = 0, radius = 0.05, seg = 2) {
  const r = Math.min(radius, Math.min(w, h, d) / 2 - 0.0005);
  return mesh(parent, new RoundedBoxGeometry(w, h, d, seg, Math.max(0.001, r)), material, x, y, z);
}

export function cyl(parent, rTop, rBot, h, material, x = 0, y = 0, z = 0, seg = 20) {
  return mesh(parent, new THREE.CylinderGeometry(rTop, rBot, h, seg), material, x, y, z);
}

export function sphere(parent, r, material, x = 0, y = 0, z = 0, seg = 16) {
  return mesh(parent, new THREE.SphereGeometry(r, seg, Math.max(6, seg / 2)), material, x, y, z);
}

export function torus(parent, r, tube, material, x = 0, y = 0, z = 0, seg = 24, arc = TAU) {
  return mesh(parent, new THREE.TorusGeometry(r, tube, 10, seg, arc), material, x, y, z);
}

export function plane(parent, w, h, material, x = 0, y = 0, z = 0) {
  return mesh(parent, new THREE.PlaneGeometry(w, h), material, x, y, z);
}

/** Фирменный шильдик: прозрачная надпись бренда для борта или двери.
 *  Один и тот же стиль у тягачей, прицепов и легковых — вся техника
 *  читается как одна серия. */
export function brandDecal(unit, opts = {}) {
  const { width = 512, height = 128, font = null } = opts;
  return labelTexture(unit.brand || 'GARAGE', {
    width,
    height,
    bg: 'rgba(0,0,0,0)',
    fg: '#f4f0e4',
    accent: unit.accent || '#e8b45a',
    font: font || `bold ${Math.round(height * 0.52)}px Arial, sans-serif`,
    border: false,
  });
}

export function brandDecalMaterial(unit, opts = {}) {
  const tex = brandDecal(unit, opts);
  if (!tex) return null;
  return new THREE.MeshStandardMaterial({
    map: tex,
    transparent: true,
    roughness: 0.5,
    metalness: 0.1,
    depthWrite: false,
    side: THREE.DoubleSide,
    polygonOffset: true,
    polygonOffsetFactor: -2,
    polygonOffsetUnits: -2,
  });
}

/** Фирменная линия: акцентная полоса и хром-кант над ней. Общий приём
 *  оформления для всех 40 машин (тягачи, прицепы, легковые).
 *  axis: 'z' — вдоль борта, 'x' — поперёк борта/по корме. */
export function accentLine(parent, opts = {}) {
  const {
    length = 1, height = 0.05, depth = 0.02,
    x = 0, y = 0, z = 0, axis = 'z',
    accentMat, chromeMat, chrome = true,
  } = opts;
  const a = axis === 'z'
    ? box(parent, depth, height, length, accentMat, x, y, z)
    : box(parent, length, height, depth, accentMat, x, y, z);
  let c = null;
  if (chrome && chromeMat) {
    c = axis === 'z'
      ? box(parent, depth * 0.8, height * 0.28, length, chromeMat, x, y + height * 0.78, z)
      : box(parent, length, height * 0.28, depth * 0.8, chromeMat, x, y + height * 0.78, z);
  }
  return { accent: a, chrome: c };
}

/** Зеркально строит детали для левой (-1) и правой (+1) стороны. */
export function mirror(parent, build) {
  build(-1);
  build(1);
}

export function wheel(M, opts = {}) {
  const {
    radius = 0.52,
    width = 0.32,
    style = 'truck',
    rimColor = 0xd7dade,
    tread = M.rubber,
    spokes = 6,
    brakeDisc = true,
  } = opts;
  const g = new THREE.Group();
  const inner = new THREE.Group();
  inner.rotation.z = HALF; // ось колеса — X
  g.add(inner);

  // --- покрышка (профиль вращения)
  const hw = width / 2;
  const bead = radius * 0.6;
  const pts = [
    new THREE.Vector2(bead, -hw),
    new THREE.Vector2(radius * 0.88, -hw * 1.02),
    new THREE.Vector2(radius * 0.985, -hw * 0.78),
    new THREE.Vector2(radius, -hw * 0.42),
    new THREE.Vector2(radius, hw * 0.42),
    new THREE.Vector2(radius * 0.985, hw * 0.78),
    new THREE.Vector2(radius * 0.88, hw * 1.02),
    new THREE.Vector2(bead, hw),
  ];
  const tireGeo = new THREE.LatheGeometry(pts, 40);
  const tire = new THREE.Mesh(tireGeo, tread);
  inner.add(tire);
  // внутренняя стенка, чтобы колесо не было полым
  const wall = new THREE.Mesh(new THREE.CylinderGeometry(bead, bead, width * 0.96, 28, 1, true), M.rubberTrim);
  inner.add(wall);

  // --- диск
  const rimR = radius * 0.58;
  const face = new THREE.Mesh(new THREE.CylinderGeometry(rimR, rimR, width * 0.9, 30), stdMetal(rimColor));
  inner.add(face);
  const lip = new THREE.Mesh(new THREE.TorusGeometry(rimR * 0.99, radius * 0.022, 8, 30), stdMetal(rimColor));
  lip.rotation.x = HALF;
  lip.position.y = hw * 0.86;
  inner.add(lip);

  const faceY = hw * 0.9;
  if (style === 'truck') {
    // фальш-отверстия и ступица
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * TAU;
      const hole = new THREE.Mesh(new THREE.CylinderGeometry(radius * 0.075, radius * 0.075, 0.012, 8), M.plastic);
      hole.position.set(Math.cos(a) * rimR * 0.68, faceY, Math.sin(a) * rimR * 0.68);
      inner.add(hole);
    }
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(radius * 0.2, radius * 0.23, 0.05, 18), stdMetal(rimColor));
    hub.position.y = faceY - 0.006;
    inner.add(hub);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * TAU;
      const nut = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.024, 6), M.chromeDark);
      nut.position.set(Math.cos(a) * radius * 0.13, faceY + 0.018, Math.sin(a) * radius * 0.13);
      inner.add(nut);
    }
  } else {
    // легковой легкосплавный диск: спицы
    const spokeMat = stdMetal(rimColor);
    for (let i = 0; i < spokes; i++) {
      const a = (i / spokes) * TAU;
      const sp = new THREE.Mesh(new THREE.BoxGeometry(radius * 0.16, 0.05, rimR * 0.92), spokeMat);
      sp.position.set(Math.cos(a) * rimR * 0.45, faceY - 0.02, Math.sin(a) * rimR * 0.45);
      sp.rotation.y = -a;
      inner.add(sp);
    }
    // ступица и колпачок утоплены в диск: раньше торчали за покрышку
    // и на виде сбоку из арки выглядывал «пятак»
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(radius * 0.17, radius * 0.19, 0.032, 20), stdMetal(rimColor));
    hub.position.y = faceY - 0.004;
    inner.add(hub);
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * TAU;
      const nut = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.018, 6), M.chromeDark);
      nut.position.set(Math.cos(a) * radius * 0.11, faceY + 0.012, Math.sin(a) * radius * 0.11);
      inner.add(nut);
    }
    // центральный колпачок — заподлицо с плоскостью диска
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(radius * 0.085, radius * 0.085, 0.022, 16), stdMetal(0x1a1e22));
    cap.position.y = faceY + 0.008;
    inner.add(cap);
  }

  if (brakeDisc) {
    const disc = new THREE.Mesh(new THREE.CylinderGeometry(radius * 0.52, radius * 0.52, 0.035, 28), M.darkSteel);
    disc.position.y = -hw * 0.2;
    inner.add(disc);
    const caliper = new THREE.Mesh(new THREE.BoxGeometry(radius * 0.2, 0.09, radius * 0.28), M.plasticGray);
    caliper.position.set(radius * 0.35, -hw * 0.2, radius * 0.28);
    inner.add(caliper);
  }
  g.userData.radius = radius;
  return g;
}

function stdMetal(color) {
  return new THREE.MeshStandardMaterial({ color, metalness: 0.95, roughness: 0.26, envMapIntensity: 1.2 });
}

/** Обтекаемая «капля»/цистерна: вращение профиля вдоль оси Z. */
export function barrel(M, { length, radius, material, rings = 4, ringMat = null, dome = 0.35 }) {
  const g = new THREE.Group();
  const pts = [];
  const steps = 16;
  const half = length / 2;
  const d = Math.min(dome * radius, half * 0.5);
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const z = -half + t * length;
    let r = radius;
    if (z < -half + d) r = radius * Math.sqrt(Math.max(0, 1 - Math.pow(((-half + d - z) / d), 2)));
    if (z > half - d) r = radius * Math.sqrt(Math.max(0, 1 - Math.pow(((z - (half - d)) / d), 2)));
    pts.push(new THREE.Vector2(Math.max(0.02, r), z));
  }
  const geo = new THREE.LatheGeometry(pts.reverse(), 32);
  const lathe = new THREE.Mesh(geo, material);
  lathe.rotation.x = HALF; // ось вращения Y -> Z
  g.add(lathe);
  const rm = ringMat || new THREE.MeshStandardMaterial({ color: 0x8f979d, metalness: 0.9, roughness: 0.35 });
  for (let i = 0; i < rings; i++) {
    const t = rings === 1 ? 0.5 : 0.12 + (i / (rings - 1)) * 0.76;
    const ring = new THREE.Mesh(new THREE.TorusGeometry(radius * 1.005, radius * 0.022, 8, 32), rm);
    ring.position.z = -half + t * length;
    g.add(ring);
  }
  return g;
}

/** Скрученные уголки и прочие мелочи: тонкая труба между точками. */
export function pipe(parent, a, b, radius, material, seg = 8) {
  const start = new THREE.Vector3(...a);
  const end = new THREE.Vector3(...b);
  const dir = end.clone().sub(start);
  const len = dir.length();
  const geo = new THREE.CylinderGeometry(radius, radius, len, seg);
  const m = new THREE.Mesh(geo, material);
  m.position.copy(start).add(end).multiplyScalar(0.5);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
  parent.add(m);
  return m;
}

/** Прямоугольная «скоба» (например, дуга безопасности). */
export function barFrame(parent, w, h, thickness, material, x = 0, y = 0, z = 0, depth = 0.06) {
  box(parent, w, thickness, depth, material, x, y + h / 2, z);
  box(parent, thickness, h, depth, material, x - w / 2 + thickness / 2, y, z);
  box(parent, thickness, h, depth, material, x + w / 2 - thickness / 2, y, z);
}

/**
 * ВЫРЕЗ В ПАНЕЛИ.
 * Не наклейка и не картинка: у проёма есть задняя стенка, утопленная на
 * depth, и четыре боковины — видно толщину панели. Ставится на плоскость
 * XY и смотрит вдоль +Z, поэтому его можно повернуть на любой фасад.
 * inner — что видно в глубине (стекло, тьма, металл).
 */
export function panelCutout(parent, opts = {}) {
  const {
    w = 0.4, h = 0.3, depth = 0.09,
    x = 0, y = 0, z = 0, rotY = 0, rotX = 0,
    name = 'cutout',
    material = null, inner = null, trim = null, thickness = 0.024,
  } = opts;
  const g = group(parent, name);
  g.position.set(x, y, z);
  g.rotation.set(rotX, rotY, 0);
  const shell = material || new THREE.MeshStandardMaterial({ color: 0x1a1f23, roughness: 0.92, metalness: 0.12 });
  const deep = inner || new THREE.MeshStandardMaterial({ color: 0x080a0b, roughness: 1, metalness: 0 });
  const back = box(g, w, h, 0.014, deep, 0, 0, -depth);
  back.name = `${name}-inset`;
  // боковины проёма: именно они дают «толщину» панели на скруглениях света
  box(g, w + thickness, thickness, depth, shell, 0, h / 2 + thickness / 2, -depth / 2);
  box(g, w + thickness, thickness, depth, shell, 0, -h / 2 - thickness / 2, -depth / 2);
  box(g, thickness, h, depth, shell, -w / 2 - thickness / 2, 0, -depth / 2);
  box(g, thickness, h, depth, shell, w / 2 + thickness / 2, 0, -depth / 2);
  if (trim !== null) {
    const t = trim || shell;
    box(g, w + thickness * 2, 0.012, 0.02, t, 0, h / 2 + thickness, 0.004);
    box(g, w + thickness * 2, 0.012, 0.02, t, 0, -h / 2 - thickness, 0.004);
    box(g, 0.012, h + thickness * 2, 0.02, t, -w / 2 - thickness, 0, 0.004);
    box(g, 0.012, h + thickness * 2, 0.02, t, w / 2 + thickness, 0, 0.004);
  }
  const info = { w, h, depth };
  g.userData.cutout = info;
  g.traverse((o) => { if (o.isMesh) o.userData.cutout = info; });
  return g;
}

/** Шов двери: узкая канавка по контуру. Та же толщина панели, но без проёма. */
export function panelSeam(parent, { w, h, x = 0, y = 0, z = 0, rotY = 0, width = 0.014, material = null }) {
  const g = group(parent, 'door-seam');
  g.position.set(x, y, z);
  g.rotation.y = rotY;
  const m = material || new THREE.MeshStandardMaterial({ color: 0x0d1012, roughness: 1 });
  const d = 0.022;
  box(g, w, width, d, m, 0, h / 2, 0);
  box(g, w, width, d, m, 0, -h / 2, 0);
  box(g, width, h, d, m, -w / 2, 0, 0);
  box(g, width, h, d, m, w / 2, 0, 0);
  const info = { w, h, depth: d, seam: true };
  g.userData.cutout = info;
  g.traverse((o) => { if (o.isMesh) o.userData.cutout = info; });
  return g;
}
