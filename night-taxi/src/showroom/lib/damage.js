// ============================================================
// ПОВРЕЖДЕНИЯ: у каждой из 40 машин своя точка повреждения и своя
// текстура (царапина со сколом, вмятина, ржавчина, трещина).
// Текстуры рисуются в обычный Uint8Array и грузятся как DataTexture:
// так они одинаково работают и в браузере, и в тестах без canvas.
// Пятно — отдельная плоскость на кузове; включается кнопкой «Повреждения» (X).
// ============================================================
import * as THREE from 'three';
import { HALF, plane, group } from './kit.js';

export const DAMAGE_TITLES = {
  scratch: 'царапина и скол',
  dent: 'вмятина',
  rust: 'ржавчина',
  crack: 'трещина',
};

const ADJ = {
  f: { 1: 'правая', '-1': 'левая' },
  m: { 1: 'правый', '-1': 'левый' },
  n: { 1: 'правое', '-1': 'левое' },
};

const DEFAULT_PART = {
  trucks: { name: 'дверь кабины', gender: 'f' },
  cars: { name: 'заднее крыло', gender: 'n' },
  trailers: { name: 'борт кузова', gender: 'm' },
};

/** Быстрый детерминированный хеш: у каждой модели своё повреждение. */
function hashOf(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

function rnd(seed) {
  let s = (seed || 1) >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

// ------------------------------------------------------------ мини-растеризатор
const SIZE = 128;

function makeCanvas() {
  const data = new Uint8Array(SIZE * SIZE * 4);
  const blend = (x, y, r, g, b, a) => {
    const px = Math.round(x);
    const py = Math.round(y);
    if (px < 0 || py < 0 || px >= SIZE || py >= SIZE || a <= 0) return;
    const i = (py * SIZE + px) * 4;
    const sa = Math.min(1, a);
    const da = data[i + 3] / 255;
    const oa = sa + da * (1 - sa);
    if (oa <= 0) return;
    data[i] = Math.round((r * sa + data[i] * da * (1 - sa)) / oa);
    data[i + 1] = Math.round((g * sa + data[i + 1] * da * (1 - sa)) / oa);
    data[i + 2] = Math.round((b * sa + data[i + 2] * da * (1 - sa)) / oa);
    data[i + 3] = Math.round(oa * 255);
  };
  const disc = (cx, cy, rad, r, g, b, a, soft = 1.5) => {
    for (let y = Math.floor(cy - rad - soft); y <= cy + rad + soft; y++) {
      for (let x = Math.floor(cx - rad - soft); x <= cx + rad + soft; x++) {
        const d = Math.hypot(x - cx, y - cy);
        if (d <= rad + soft) {
          const k = d <= rad ? 1 : 1 - (d - rad) / soft;
          blend(x, y, r, g, b, a * k);
        }
      }
    }
  };
  const line = (x0, y0, x1, y1, r, g, b, a, w = 1) => {
    const len = Math.hypot(x1 - x0, y1 - y0);
    const steps = Math.max(2, Math.ceil(len * 1.6));
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      disc(x0 + (x1 - x0) * t, y0 + (y1 - y0) * t, w / 2, r, g, b, a, 0.7);
    }
  };
  return { data, blend, disc, line };
}

function drawScratch(cv, random) {
  const { disc, line } = cv;
  // потёртость: светлое облако под бороздами
  for (let i = 0; i < 16; i++) {
    disc(SIZE * (0.3 + random() * 0.4), SIZE * (0.32 + random() * 0.36),
      9 + random() * 15, 232, 230, 224, 0.03, 9);
  }
  // борозды: одна длинная основная, вокруг — короткие, с разрывами
  const ang = -0.3 + random() * 0.6;
  const ca = Math.cos(ang);
  const sa = Math.sin(ang);
  const cx = SIZE * 0.5;
  const cy = SIZE * 0.5;
  for (let i = 0; i < 6; i++) {
    const off = (i - 2.5) * (2.4 + random() * 3.6) + (random() - 0.5) * 2.5;
    const len = SIZE * (i === 2 ? 0.34 : 0.08 + random() * 0.22);
    const shift = (random() - 0.5) * SIZE * 0.12;
    const bx = cx + shift * ca - sa * off;
    const by = cy + shift * sa + ca * off;
    const x0 = bx - ca * len * 0.5;
    const y0 = by - sa * len * 0.5;
    const x1 = bx + ca * len * 0.5;
    const y1 = by + sa * len * 0.5;
    const breakAt = random();
    const split = () => {
      if (breakAt > 0.55) {
        const m0 = 0.35 + random() * 0.2;
        line(x0, y0, x0 + (x1 - x0) * m0, y0 + (y1 - y0) * m0, 246, 244, 238, 0.3, 0.9);
        line(x0 + (x1 - x0) * (m0 + 0.12), y0 + (y1 - y0) * (m0 + 0.12), x1, y1, 246, 244, 238, 0.24, 0.9);
      } else {
        line(x0, y0, x1, y1, 246, 244, 238, 0.26 + random() * 0.2, 0.9);
      }
    };
    line(x0 + 1, y0 + 1.1, x1 + 1, y1 + 1.1, 24, 22, 20, 0.34, 1.1);
    split();
  }
  // сколы до грунта
  for (let i = 0; i < 5; i++) {
    const x = SIZE * (0.34 + random() * 0.32);
    const y = SIZE * (0.36 + random() * 0.28);
    disc(x, y, 1.2 + random() * 2.8, 92, 86, 78, 0.55, 1);
    disc(x - 0.5, y - 0.5, 0.8 + random() * 1.4, 150, 144, 136, 0.4, 1);
  }
}

function drawDent(cv, random) {
  const { disc, line } = cv;
  const cx = SIZE * 0.5;
  const cy = SIZE * 0.52;
  // мягкая тень вмятины — эллипс, темнеющий к центру
  for (let i = 16; i >= 1; i--) {
    disc(cx - i * 0.25, cy - i * 0.2, SIZE * 0.05 + i * 1.9, 18, 17, 16, 0.032, 6);
  }
  // дальняя стенка вмятины ловит свет
  for (let i = 6; i >= 1; i--) {
    disc(cx + i * 0.6, cy + i * 0.5, i * 2.6, 250, 249, 246, 0.022, 5);
  }
  // тонкий блик по нижней кромке
  for (let a = 0.9; a < 2.1; a += 0.06) {
    const r = SIZE * 0.275;
    line(cx + Math.cos(a) * r, cy + Math.sin(a) * r * 0.78,
      cx + Math.cos(a + 0.06) * r, cy + Math.sin(a + 0.06) * r * 0.78, 250, 248, 244, 0.14, 2);
  }
  // скол в центре
  disc(cx - 2, cy - 1, 3.4, 186, 180, 170, 0.7, 1);
  disc(cx - 2.8, cy - 1.6, 1.5, 232, 230, 224, 0.65, 1);
}

function drawRust(cv, random) {
  const { disc, line } = cv;
  for (let i = 0; i < 40; i++) {
    const x = SIZE * (0.22 + random() * 0.56);
    const y = SIZE * (0.22 + random() * 0.56);
    const tone = 0.4 + random() * 0.6;
    disc(x, y, 3 + random() * 12,
      108 + tone * 70, 52 + tone * 30, 20 + tone * 14,
      0.1 + random() * 0.18, 5);
  }
  // тёмные язвы
  for (let i = 0; i < 14; i++) {
    const x = SIZE * (0.25 + random() * 0.5);
    const y = SIZE * (0.25 + random() * 0.5);
    disc(x, y, 1.5 + random() * 3.4, 74, 34, 12, 0.75, 1.5);
  }
  // потёки вниз
  for (let i = 0; i < 7; i++) {
    const x = SIZE * (0.25 + random() * 0.5);
    const y = SIZE * (0.35 + random() * 0.25);
    line(x, y, x + (random() - 0.5) * 5, y + SIZE * (0.08 + random() * 0.14), 112, 58, 24, 0.45, 1.3);
  }
}

function drawCrack(cv, random) {
  const { line, disc } = cv;
  const cx = SIZE * 0.44;
  const cy = SIZE * 0.46;
  const branch = (x, y, ang, len, depth) => {
    if (depth <= 0 || len < 3) return;
    const nx = x + Math.cos(ang) * len;
    const ny = y + Math.sin(ang) * len;
    line(x + 1, y + 1, nx + 1, ny + 1, 22, 30, 36, 0.55, 1.8);
    line(x, y, nx, ny, 252, 253, 255, 0.75, 1.1);
    branch(nx, ny, ang + (random() - 0.5) * 0.9, len * (0.55 + random() * 0.2), depth - 1);
    if (random() > 0.4) branch(nx, ny, ang + (random() - 0.5) * 1.7, len * 0.5, depth - 1);
  };
  for (let i = 0; i < 7; i++) branch(cx, cy, (i / 7) * Math.PI * 2 + random() * 0.4, SIZE * 0.14, 3);
  disc(cx, cy, 2.4, 250, 252, 255, 0.9, 1);
}

const DRAW = { scratch: drawScratch, dent: drawDent, rust: drawRust, crack: drawCrack };
const texCache = new Map();

/** RGBA-данные текстуры повреждения (128×128) — без canvas, работает в тестах. */
export function damagePixels(kind, seed = 1) {
  const key = `${kind}:${seed % 97}`;
  if (texCache.has(key)) return texCache.get(key).data;
  const cv = makeCanvas();
  (DRAW[kind] || drawScratch)(cv, rnd(seed));
  const tex = new THREE.DataTexture(cv.data, SIZE, SIZE, THREE.RGBAFormat);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.magFilter = THREE.LinearFilter;
  tex.minFilter = THREE.LinearFilter;
  tex.needsUpdate = true;
  texCache.set(key, { data: cv.data, tex });
  return cv.data;
}

/** Текстура повреждения (DataTexture, альфа-канал = прозрачность). */
export function damageTexture(kind, seed = 1) {
  damagePixels(kind, seed);
  const key = `${kind}:${seed % 97}`;
  return texCache.get(key).tex;
}

// ------------------------------------------------------------ точки повреждения
// У каждой машины 15 разных пятен: место задаёт модель (она знает геометрию),
// вид и зерно текстуры выбираются детерминированно, но так, чтобы на одной
// машине встретились все четыре вида повреждений.
export const DAMAGE_KINDS = ['scratch', 'dent', 'rust', 'crack'];
export const DAMAGE_SEEDS = 16;
export const DAMAGE_PER_UNIT = 15;

/**
 * Спецификация одного повреждения. part = { name, gender },
 * side = -1 | 1 | 0 (0 — деталь по центру, прилагательное не нужно).
 */
export function damageSpecAt(unit, part, side = 0, index = 0) {
  const h = hashOf(`${unit.category || 'trucks'}:${unit.id}`);
  const kind = DAMAGE_KINDS[(index + (h % 4)) % DAMAGE_KINDS.length];
  const seed = 1 + ((h * 3 + index * 5) % DAMAGE_SEEDS);
  const p = part || DEFAULT_PART[unit.category] || DEFAULT_PART.trucks;
  const adj = side ? (ADJ[p.gender] || ADJ.m)[side] : '';
  return {
    kind,
    seed,
    index,
    side,
    part: p.name,
    label: `${adj ? `${adj} ` : ''}${p.name} — ${DAMAGE_TITLES[kind]}`,
    short: DAMAGE_TITLES[kind],
  };
}

/** Совместимость: одно повреждение по спецификации модели. */
export function damageSpecFor(unit, part = null) {
  return damageSpecAt(unit, part, 0, 0);
}

function damageMaterial(spec) {
  const tex = damageTexture(spec.kind, spec.seed);
  const mat = new THREE.MeshStandardMaterial({
    map: tex,
    color: 0xffffff,
    transparent: true,
    roughness: 0.66,
    metalness: 0.1,
    depthWrite: false,
    side: THREE.DoubleSide,
    polygonOffset: true,
    polygonOffsetFactor: -4,
    polygonOffsetUnits: -4,
  });
  mat.userData.damageKind = spec.kind;
  return mat;
}

/**
 * Ставит на кузов сразу набор пятен (по умолчанию — все 15).
 * anchor = { part:{name,gender}, side, pos:[x,y,z], rotX?, rotY?, w, h }
 */
export function mountDamageSet(root, unit, anchors) {
  const g = group(root, 'damage');
  g.visible = false;
  const list = anchors.map((a, i) => {
    const spec = damageSpecAt(unit, a.part, a.side || 0, i);
    const patch = plane(g, a.w, a.h, damageMaterial(spec), ...a.pos);
    const rotY = a.rotY ?? (a.side ? (a.side > 0 ? HALF : -HALF) : 0);
    patch.rotation.set(a.rotX || 0, rotY, 0);
    patch.name = `damage-patch:${i}`;
    patch.userData.damage = true;
    return { patch, spec, anchor: a };
  });
  return { group: g, list, spec: list[0]?.spec || null, count: list.length };
}

/** Совместимость: одно пятно. */
export function mountDamage(root, unit, anchor) {
  const set = mountDamageSet(root, unit, [{ ...anchor, part: anchor.part }]);
  const first = set.list[0];
  return { group: set.group, spec: first.spec, patch: first.patch, count: 1 };
}
