// ============================================================
// ПОВРЕЖДЕНИЯ: у каждой из 40 машин своя точка повреждения и своя
// текстура (царапина со сколом, вмятина, ржавчина, трещина).
// Текстуры рисуются в обычный Uint8Array и грузятся как DataTexture:
// так они одинаково работают и в браузере, и в тестах без canvas.
// Пятно — не наклейка: у него свой рельеф (сетка, выдавленная по полю
// повреждения) и нормал-карта, посчитанная из того же поля. Поэтому вмятина
// ловит свет как вмятина, царапина блестит металлом, ржавчина бугрится.
// Каждое пятно можно добавить отдельно — они включаются поштучно (X — все).
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

// ------------------------------------------------------------ рельеф пятна
// Высота пятна считается из альфа-канала той же текстуры: где рисунок плотнее,
// там глубже. По полю высот строятся и геометрия (сетка), и нормал-карта —
// поэтому свет читает вмятину как вмятину, а не как плоскую картинку.
const RELIEF = {
  dent: { bump: 0.0075, normal: 2.3, rough: 0.52, metal: 0.14, mode: 'rim' },
  scratch: { bump: 0.0035, normal: 1.8, rough: 0.33, metal: 0.58, mode: 'rim' },
  crack: { bump: 0.0045, normal: 2.1, rough: 0.4, metal: 0.42, mode: 'rim' },
  rust: { bump: 0.0055, normal: 2.7, rough: 0.95, metal: 0.04, mode: 'blister' },
};
const BASE_LIFT = 0.002; // накладка стоит на кузове, а не парит над ним

const heights = new Map();
const normals = new Map();

/** Поле высот повреждения (0..1), сглаженное по 3×3. */
export function damageHeight(kind, seed = 1) {
  const key = `${kind}:${seed % 97}`;
  if (heights.has(key)) return heights.get(key);
  const px = damagePixels(kind, seed);
  const raw = new Float32Array(SIZE * SIZE);
  let max = 0;
  for (let i = 0; i < SIZE * SIZE; i++) {
    const a = px[i * 4 + 3] / 255;
    raw[i] = a;
    if (a > max) max = a;
  }
  const norm = max > 1e-3 ? 0.95 / max : 1;
  const h = new Float32Array(SIZE * SIZE);
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      let sum = 0;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const xx = Math.min(SIZE - 1, Math.max(0, x + dx));
          const yy = Math.min(SIZE - 1, Math.max(0, y + dy));
          sum += raw[yy * SIZE + xx];
        }
      }
      h[y * SIZE + x] = Math.min(1, (sum / 9) * norm);
    }
  }
  heights.set(key, h);
  return h;
}

/** Нормал-карта, посчитанная из поля высот (DataTexture, без canvas). */
export function damageNormalTexture(kind, seed = 1) {
  const key = `${kind}:${seed % 97}`;
  if (normals.has(key)) return normals.get(key);
  const h = damageHeight(kind, seed);
  const R = RELIEF[kind] || RELIEF.dent;
  const strength = R.normal * 3.4;
  const data = new Uint8Array(SIZE * SIZE * 4);
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const l = h[y * SIZE + Math.max(0, x - 1)];
      const r = h[y * SIZE + Math.min(SIZE - 1, x + 1)];
      const up = h[Math.max(0, y - 1) * SIZE + x];
      const dn = h[Math.min(SIZE - 1, y + 1) * SIZE + x];
      const nx = (l - r) * strength;
      const ny = (up - dn) * strength;
      const len = Math.hypot(nx, ny, 1) || 1;
      const i = (y * SIZE + x) * 4;
      data[i] = Math.round((nx / len * 0.5 + 0.5) * 255);
      data[i + 1] = Math.round((ny / len * 0.5 + 0.5) * 255);
      data[i + 2] = Math.round((1 / len * 0.5 + 0.5) * 255);
      data[i + 3] = 255;
    }
  }
  const tex = new THREE.DataTexture(data, SIZE, SIZE, THREE.RGBAFormat);
  tex.magFilter = THREE.LinearFilter;
  tex.minFilter = THREE.LinearFilter;
  tex.needsUpdate = true;
  normals.set(key, tex);
  return tex;
}

/** Детерминированный «шум» для бугров ржавчины. */
function vertexNoise(i, seed) {
  let x = Math.imul(i + 1, 2654435761) ^ Math.imul(seed + 7, 40503);
  x = Math.imul(x ^ (x >>> 15), 2246822507);
  x ^= x >>> 13;
  return ((x >>> 0) % 1000) / 999;
}

/** Сетка пятна с рельефом: не плоская наклейка, а поверхность с объёмом. */
function reliefGeometry(anchor, spec) {
  const w = Math.max(0.12, anchor.w || 0.4);
  const h = Math.max(0.1, anchor.h || 0.3);
  const cols = Math.max(14, Math.min(40, Math.round(w * 46)));
  const rows = Math.max(12, Math.min(40, Math.round(h * 46)));
  const geo = new THREE.PlaneGeometry(w, h, cols, rows);
  const pos = geo.attributes.position;
  const uv = geo.attributes.uv;
  const field = damageHeight(spec.kind, spec.seed);
  const R = RELIEF[spec.kind] || RELIEF.dent;
  let lo = Infinity;
  let hi = -Infinity;
  for (let i = 0; i < pos.count; i++) {
    const x = Math.min(SIZE - 1, Math.max(0, Math.round(uv.getX(i) * (SIZE - 1))));
    const y = Math.min(SIZE - 1, Math.max(0, Math.round(uv.getY(i) * (SIZE - 1))));
    const t = field[y * SIZE + x];
    let z;
    if (R.mode === 'blister') {
      // ржавчина вспучивается неровными буграми, местами язвами вниз
      z = BASE_LIFT + R.bump * t * (0.25 + 1.1 * vertexNoise(i, spec.seed));
    } else {
      // вмятина/царапина: приподнятый вал по кромке рисунка
      z = BASE_LIFT + R.bump * 4 * t * (1 - t);
    }
    pos.setZ(i, z);
    if (z < lo) lo = z;
    if (z > hi) hi = z;
  }
  geo.computeVertexNormals();
  geo.userData.relief = hi - lo;
  geo.userData.damageKind = spec.kind;
  return geo;
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
  const R = RELIEF[spec.kind] || RELIEF.dent;
  const mat = new THREE.MeshStandardMaterial({
    map: tex,
    normalMap: damageNormalTexture(spec.kind, spec.seed),
    normalScale: new THREE.Vector2(R.normal, R.normal),
    color: 0xffffff,
    transparent: true,
    roughness: R.rough,
    metalness: R.metal,
    depthWrite: false,
    side: THREE.DoubleSide,
    polygonOffset: true,
    polygonOffsetFactor: -3,
    polygonOffsetUnits: -3,
  });
  mat.userData.damageKind = spec.kind;
  return mat;
}

/**
 * Ставит на кузов сразу набор пятен (по умолчанию — все 15).
 * anchor = { part:{name,gender}, side, pos:[x,y,z], rotX?, rotY?, w, h }
 */
/**
 * Куда ставить пятно: лучшие точки на кузове. Пятно не должно висеть в
 * воздухе — из анкера пускаем лучи по нормали (центр + края пятна) и
 * прижимаем его к найденной панели. Заодно берём нормаль панели, чтобы
 * пятно на скруглённом борту лежало по поверхности, а не торчало.
 */
function snapToSurface(root, a, normal, w, h) {
  const t = Math.abs(normal.x) > 0.9 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(1, 0, 0);
  const u = new THREE.Vector3().crossVectors(normal, t).normalize();
  const v = new THREE.Vector3().crossVectors(normal, u).normalize();
  const origin = new THREE.Vector3(...a.pos);
  const rc = new THREE.Raycaster();
  rc.far = 2.2;
  const opaqueMesh = (hit) => hit.object.isMesh
    && hit.object.visible !== false
    && !hit.object.userData.damage
    && hit.object.material?.transparent !== true;
  const cast = (dx, dy) => {
    const o = origin.clone()
      .addScaledVector(u, dx * w * 0.34)
      .addScaledVector(v, dy * h * 0.34)
      .addScaledVector(normal, 0.14);
    rc.set(o, normal.clone().negate());
    return rc.intersectObject(root, true).find(opaqueMesh) || null;
  };
  // 1. основной луч из центра пятна
  let hit = cast(0, 0);
  // 2. если центр мимо (анкер стоит чуть в стороне от панели) — ищем соседним
  const fan = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1],
    [2, 0], [-2, 0], [0, 2], [0, -2]];
  if (!hit) {
    let best = null;
    let bestD = Infinity;
    for (const [dx, dy] of fan) {
      const h2 = cast(dx, dy);
      if (!h2) continue;
      const d = Math.abs(dx) + Math.abs(dy);
      if (d < bestD) { best = h2; bestD = d; }
    }
    hit = best;
  }
  // 3. панель может оказаться и с другой стороны анкера (пятно «утоплено»)
  let flipped = false;
  if (!hit) {
    const back = normal.clone().negate();
    const rc2 = new THREE.Raycaster();
    rc2.far = 1.2;
    for (const [dx, dy] of fan) {
      const o = origin.clone()
        .addScaledVector(u, dx * w * 0.34)
        .addScaledVector(v, dy * h * 0.34)
        .addScaledVector(back, 0.05);
      rc2.set(o, normal.clone());
      const h3 = rc2.intersectObject(root, true).find(opaqueMesh);
      if (h3) { hit = h3; flipped = true; break; }
    }
  }
  // 4. последний шанс: ищем ближайшую поверхность по шести направлениям —
  //    пятно всё равно должно лежать на кузове, а не висеть в воздухе
  let dirOut = normal;
  if (!hit) {
    const rc3 = new THREE.Raycaster();
    rc3.far = 3.2;
    let best = null;
    let bestD = Infinity;
    let bestDir = normal;
    for (const d of [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1],
      [0.7, 0.7, 0], [-0.7, 0.7, 0], [0.7, -0.7, 0], [-0.7, -0.7, 0]]) {
      const dir = new THREE.Vector3(...d).normalize();
      const o = origin.clone().addScaledVector(dir, 0.02);
      rc3.set(o, dir.clone().negate());
      const h4 = rc3.intersectObject(root, true).find(opaqueMesh);
      if (h4 && h4.distance < bestD) { best = h4; bestD = h4.distance; bestDir = dir; }
    }
    if (!best) return null;
    hit = best;
    dirOut = bestDir;
  }
  const point = hit.point.clone().addScaledVector(dirOut, 0.003);
  let normalWorld = null;
  if (hit.face && hit.object) {
    const nm = new THREE.Matrix3().getNormalMatrix(hit.object.matrixWorld);
    normalWorld = hit.face.normal.clone().applyMatrix3(nm).normalize();
    if (normalWorld.dot(dirOut) < 0) normalWorld.negate();
  }
  return { point, dist: hit.distance, normalWorld };
}

export function mountDamageSet(root, unit, anchors) {
  const g = group(root, 'damage');
  g.visible = false;
  const list = anchors.map((a, i) => {
    const spec = damageSpecAt(unit, a.part, a.side || 0, i);
    const patch = new THREE.Mesh(reliefGeometry(a, spec), damageMaterial(spec));
    patch.position.set(...a.pos);
    const rotY = a.rotY ?? (a.side ? (a.side > 0 ? HALF : -HALF) : 0);
    patch.rotation.set(a.rotX || 0, rotY, 0);
    // прижимаем к кузову: иначе пятно висит в воздухе и читается наклейкой
    root.updateMatrixWorld(true);
    const nLocal = new THREE.Vector3(0, 0, 1).applyEuler(patch.rotation).normalize();
    const nWorld = nLocal.clone().applyQuaternion(root.getWorldQuaternion(new THREE.Quaternion())).normalize();
    const snap = snapToSurface(root, a, nWorld, a.w || 0.4, a.h || 0.3);
    if (snap) {
      const local = root.worldToLocal(snap.point.clone());
      patch.position.copy(local);
      patch.userData.snap = snap.dist;
      if (snap.normalWorld && snap.normalWorld.dot(nWorld) > 0.72) {
        // лёгкий наклон по панели: на скруглённом борту пятно лежит, а не торчит
        const nLocal2 = snap.normalWorld.clone()
          .applyQuaternion(root.getWorldQuaternion(new THREE.Quaternion()).invert())
          .normalize();
        patch.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), nLocal2);
      }
    }
    patch.userData.anchor = a.pos.slice();
    patch.name = `damage-patch:${i}`;
    patch.userData.damage = true;
    patch.userData.kind = spec.kind;
    patch.userData.label = spec.label;
    // пятно видимо само по себе, но группа скрыта: так работает и общий
    // тумблер, и поштучное добавление (app гасит ненужные пятна)
    g.add(patch);
    return { patch, spec, anchor: a, index: i };
  });
  return { group: g, list, spec: list[0]?.spec || null, count: list.length };
}

/** Совместимость: одно пятно. */
export function mountDamage(root, unit, anchor) {
  const set = mountDamageSet(root, unit, [{ ...anchor, part: anchor.part }]);
  const first = set.list[0];
  return { group: set.group, spec: first.spec, patch: first.patch, count: 1 };
}
