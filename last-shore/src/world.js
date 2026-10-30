// ============================================================
//  Мир: остров, рельеф, океан, растительность, камни, подбираемые вещи.
// ============================================================

import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { CONFIG, COLORS } from './config.js';
import { createTerrainMaterial, createPlantMaterial, createStoneMaterial } from './terrain.js';
import { ShellField, hullsFromGeometry } from './shells.js';
import { meshSections } from './mesh-sections.js';
import { cutTerrain } from './terrain-cut.js';
import { advancePitWater } from './ground-physics.js';
import { fbm, ridged, makeRng, clamp, smoothstep } from './noise.js';
import {
  makePalmParts, makeTreeParts, makeBushParts, makeRockParts, makePickupGeometries,
  makePineParts, makeMangroveParts, makeDeadTreeParts,
} from './models.js';

const SIZE = CONFIG.world.size;
const GRID = CONFIG.world.segments + 1;
const STEP = SIZE / (GRID - 1);

// Толщина слоёв под ногами: сначала земля/песок, под ней — камень (тот самый
// каменный слой, в котором идут шахты). Пробив камень насквозь, попадаешь в пустоту.
const SOIL_THICK = 1.35;

// Породы под землёй: чем глубже, тем прочнее. У каждой свой цвет среза,
// своя прочность (сколько метров снимает удар) и своя минимальная кирка.
// Сумма thick = 2.4 м — это и есть каменный слой до пустоты шахты.
const STRATA = [
  {
    id: 'sandstone', name: 'Песчаник', thick: 0.6, hard: 1.2, hp: 12, mine: 1.5,
    top: 0xa78b5c, deep: 0x8f7449, dust: 0xc0a97c,
  },
  {
    id: 'granite', name: 'Гранит', thick: 0.7, hard: 2.0, hp: 20, mine: 2.0,
    top: 0x928f88, deep: 0x77746d, dust: 0x8f8a80,
  },
  {
    id: 'basalt', name: 'Базальт', thick: 0.65, hard: 3.0, hp: 30, mine: 2.4,
    top: 0x6b665f, deep: 0x504c45, dust: 0x5f5a54,
  },
  {
    id: 'obsidian', name: 'Обсидиан', thick: 0.45, hard: 4.6, hp: 46, mine: 2.8,
    top: 0x4b3f52, deep: 0x342b3d, dust: 0x4a3d52,
  },
];
const STONE_THICK = STRATA.reduce((sum, st) => sum + st.thick, 0);
const VOID_COLOR = 0x2b2433;
// Предел роста одной ямы после обвалов: 8 метровых клеток в сторону
const MAX_PIT_CELLS = 8;
const rng0 = (i) => (i * 2.399963) % (Math.PI * 2);

// Размер чанка для отсечения невидимой растительности (м)
const CHUNK = 90;

// Малые острова: кольцо вокруг главного, вне его берегового вала.
// x, z — центр, rad — радиус основания, h — высота холма.
const ISLETS = [
  { x: -122, z: -84, rad: 46, h: 8.5 },
  { x: 128, z: -66, rad: 38, h: 6.0 },
  { x: 96, z: 124, rad: 52, h: 10.5 },
  { x: -108, z: 118, rad: 34, h: 5.0 },
  { x: 8, z: -146, rad: 30, h: 4.2 },
  { x: -160, z: 22, rad: 27, h: 3.6 },
];
const DIG_CELL = 1; // размеры блока добычи — 1 м × 1 м

// Почва под ногами: у каждой полосы свой цвет — от светлого песка
// до красной глины, суглинка, гравия и лесной подстилки
const SAND_ZONES = [
  new THREE.Color(0xefe3b8),   // светлый, выгоревший песок
  new THREE.Color(0xe2d19b),   // обычный пляжный
  new THREE.Color(0xd2bd85),   // золотистый, влажный
  new THREE.Color(0xc4ad7a),   // тёмный у воды
  new THREE.Color(0xf6efd2),   // почти белый коралловый
];
const DIRT_ZONES = [
  { name: 'суглинок', color: new THREE.Color(0x7b5c3d) },
  { name: 'глина', color: new THREE.Color(0x9a6a4a) },
  { name: 'красная глина', color: new THREE.Color(0xa5643f) },
  { name: 'гравий', color: new THREE.Color(0xa9a094) },
  { name: 'лесная подстилка', color: new THREE.Color(0x54452e) },
  { name: 'торф', color: new THREE.Color(0x453a26) },
  { name: 'мох', color: new THREE.Color(0x6f7d45) },
  { name: 'тёмная земля', color: new THREE.Color(0x604a33) },
];

// Палитра травы: несколько оттенков вместо одной заливки
// Участки травы: пять оттенков, между ними — рваные границы
const GRASS_ZONES = [
  { name: 'сочный', color: new THREE.Color(0x5f9f3c) },   // насыщенный зелёный
  { name: 'свежий', color: new THREE.Color(0x8cc85a) },   // светлый, после дождя
  { name: 'тёмный', color: new THREE.Color(0x3f6b2f) },   // тенистый, под кронами
  { name: 'выгоревший', color: new THREE.Color(0xa9b64f) },// жёлто-зелёный
  { name: 'золотистый', color: new THREE.Color(0xc9bb66) },// сухой, почти соломенный
];

const GRASS_TONES = {
  fresh: new THREE.Color(0x8dbb5b),   // свежая после дождя
  rich: new THREE.Color(0x6b9c46),    // сочная
  jungle: new THREE.Color(0x4a7a3c),  // тёмные джунгли
  dry: new THREE.Color(0xb5ab6d),     // выгоревшая на солнце
  moss: new THREE.Color(0x5c7f43),    // мох в низинах
  bloom: new THREE.Color(0xa7cf6c),   // цветущий луг, светлая
};

// ---------- вспомогательное ----------

function colorize(geo, hex) {
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

function addPart(parts, geo, hex, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0) {
  // mergeGeometries не дружит со смесью индексированных и неиндексированных
  if (geo.index) geo = geo.toNonIndexed();
  colorize(geo, hex);
  geo.rotateX(rx);
  geo.rotateY(ry);
  geo.rotateZ(rz);
  geo.translate(x, y, z);
  parts.push(geo);
  return geo;
}

/**
 * Жердь между двумя точками: цилиндр разворачивается по направлению отрезка.
 * Без этого наклонные балки «висят в воздухе» и дом выглядит недоделанным.
 */
function addRod(parts, from, to, r0, r1, hex, sides = 5) {
  const a = new THREE.Vector3(...from);
  const b = new THREE.Vector3(...to);
  const dir = b.clone().sub(a);
  const len = dir.length();
  if (len < 1e-4) return null;
  const geo = new THREE.CylinderGeometry(r0, r1, len, sides, 1);
  geo.translate(0, len * 0.5, 0);
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
  geo.applyQuaternion(q);
  return addPart(parts, geo, hex, a.x, a.y, a.z);
}

/**
 * Дальняя версия кроны: вместо сотен треугольников листвы — три-четыре
 * низкополигональных «облака» по габаритам настоящей кроны. На расстоянии
 * силуэт читается так же, а вершин в разы меньше (LOD-тир).
 */
function makeCrownProxy(leafGeo, { blobs = 3, detail = 0 } = {}) {
  if (!leafGeo) return null;
  if (!leafGeo.boundingBox) leafGeo.computeBoundingBox();
  const b = leafGeo.boundingBox;
  const size = new THREE.Vector3();
  b.getSize(size);
  const center = new THREE.Vector3();
  b.getCenter(center);
  const parts = [];
  const r = Math.max(0.55, Math.max(size.x, size.z) * 0.34);
  const tint = [COLORS.jungle || 0x5f8a45, 0x6d9a52, 0x7da95e];
  for (let i = 0; i < blobs; i++) {
    const a = (i / blobs) * Math.PI * 2;
    const d = i === 0 ? 0 : r * 0.72;
    const geo = new THREE.IcosahedronGeometry(r * (i === 0 ? 1.06 : 0.82), detail);
    addPart(parts, geo, tint[i % tint.length],
      center.x + Math.cos(a) * d,
      center.y + (i === 0 ? 0 : (i % 2 ? 0.22 : -0.14)) * size.y * 0.5,
      center.z + Math.sin(a) * d);
  }
  return mergeGeometries(parts, false);
}

// ---------- мир ----------

export class World {
  constructor(scene, seed = CONFIG.world.seed, textures = null) {
    this.scene = scene;
    this.seed = seed;
    this.textures = textures;
    this.windMaterials = [];
    this.rng = makeRng(seed);
    this.heights = new Float32Array(GRID * GRID);
    this.colliders = [];        // { x, z, r }
    this.digStore = new Map();  // выкопанные лунки: ключ клетки -> глубина
    this.digDamage = new Map(); // частичный урон по текущему слою клетки
    this.pitPhysicsAccumulator = 0;
    this.digEvents = 0;
    this.surfaceStore = new Map();  // чем была клетка до копания: песок/земля/камень
    this.pits = new Map();          // выкопанные ямы: дно, стенки, ступени
    this.cutCells = new Set();      // клетки сетки, вырезанные из рельефа (дыра)
    this.cutPits = new Map();       // ключ клетки -> яма (для heightAt)
    this.terrainIndexBase = null;   // полный индекс рельефа до вырезания
    this.playerPos = null;          // где герой: ступени разворачиваются к нему
    this.baseColors = null;     // исходные цвета рельефа (для показа среза породы)
    this.pickups = [];          // { mesh, kind, name }
    this.chunkMeshes = [];      // куски растительности по чанкам (отсечение видимости)
    this.flatCore = new Set();  // узлы ровных площадок: их уклоны не трогаем
    this.dens = [];             // дома зверей
    this.time = 0;

    // обводки моделей: невидимые треугольные оболочки, сквозь них не пройти
    this.shells = new ShellField(scene);

    this._buildHeights();
    this.baseHeights = this.heights.slice();   // рельеф до копания
    this._buildTerrain();
    this._buildWater();
    this._buildVegetation();
    this._buildPickups();
    this.pitGroup = new THREE.Group();
    this.pitGroup.name = 'pits';
    this.scene.add(this.pitGroup);
  }

  // --- высота острова (аналитическая, считается один раз в сетку) ---
  _rawHeight(x, z) {
    const s = this.seed;
    const r = Math.hypot(x, z) / (SIZE * 0.5);

    // рваный берег: крупный шум двигает линию прибоя
    const coast = (fbm(x * 0.008 + 11.3, z * 0.008 - 4.7, 3, s + 5) - 0.5) * 0.30;
    const edge = 0.64 + coast;
    const mass = smoothstep(edge + 0.20, edge - 0.34, r); // 1 — суша, 0 — открытая вода

    // холмы и мелкий рельеф
    const hills = fbm(x * 0.016, z * 0.016, 4, s + 7);
    const detail = fbm(x * 0.06, z * 0.06, 2, s + 21);

    // горы: чем ближе к центру острова, тем выше; гребни даёт ridged-шум
    const inner = smoothstep(0.62, 0.12, r);
    const ridgeMask = 0.35 + 0.65 * fbm(x * 0.008 + 40, z * 0.008 + 9, 2, s + 3);
    const mountain = Math.pow(ridged(x * 0.012, z * 0.012, 3, s + 11), 1.2) * 27 * inner * ridgeMask;

    const landH = 1.2 + Math.pow(hills, 1.15) * 6.2 + detail * 1.2 + mountain * (0.4 + mass * 0.6);
    const seaH = -1.6 - (1 - mass) * 11.0;

    const main = seaH + (landH - seaH) * mass;
    return Math.max(main, this._isletHeight(x, z, s));
  }

  /**
   * Малые острова вокруг главного: у каждого свой холм, свой пляж и
   * пролив между ним и большой землёй. Высота берётся как максимум —
   * так острова не «привариваются» к берегу, а встают отдельными пятнами.
   */
  _isletHeight(x, z, s = this.seed) {
    let best = -Infinity;
    for (const isl of ISLETS) {
      const dx = x - isl.x;
      const dz = z - isl.z;
      const d = Math.hypot(dx, dz) / isl.rad;
      if (d > 1.5) continue;
      // рваный контур: шум по углу, чтобы остров не был правильным кругом
      const a = Math.atan2(dz, dx);
      const wobble = (fbm(Math.cos(a) * 2.1 + isl.x * 0.01, Math.sin(a) * 2.1 + isl.z * 0.01, 2, s + 71) - 0.5) * 0.34;
      const rr = d * (1 + wobble);
      const shore = smoothstep(1.02, 0.72, rr);
      if (shore <= 0) { best = Math.max(best, -12); continue; }
      const hills = fbm(x * 0.03 + isl.x, z * 0.03 - isl.z, 3, s + 91);
      const peak = isl.h * (0.55 + hills * 0.85) * shore;
      const beach = 0.9 * smoothstep(1.0, 0.86, rr);
      const sea = -1.4 - (1 - shore) * 8.5;
      best = Math.max(best, sea + (peak + beach - sea) * shore);
    }
    return best;
  }

  _buildHeights() {
    for (let iz = 0; iz < GRID; iz++) {
      for (let ix = 0; ix < GRID; ix++) {
        const x = -SIZE / 2 + ix * STEP;
        const z = -SIZE / 2 + iz * STEP;
        this.heights[iz * GRID + ix] = this._rawHeight(x, z);
      }
    }
    this._quantizeSlopes();
  }

  /**
   * Уклоны земли — только из разрешённого набора: 0°, 15°, 30°, 40°.
   * Каждая пара соседних узлов приводится к ближайшей ступени, поэтому
   * склоны получаются «террасами», а обрывов круче 40° на поверхности нет
   * (90° остаются только у стенок выкопанных ям и шахт).
   */
  _quantizeSlopes() {
    // Уклон земли — кратен 15°: 0°, 15°, 30°, а круче 3 ступеней (≈40°) нельзя.
    // Одна ступень = tan(15°) * шаг сетки, поэтому работаем в целых ступенях:
    // heights = k * stepH. Узлы ровных площадок (под моделями) не трогаем.
    const stepH = Math.tan(15 * Math.PI / 180) * STEP;
    const maxSteps = 3;                 // 3 × 15° = 38.8° — предел поверхности
    const maxStepsDiag = 4;             // по диагонали то же ограничение
    const lock = this.flatCore || new Set();
    const n = this.heights.length;
    const k = new Int16Array(n);
    for (let i = 0; i < n; i++) {
      if (lock.has(i)) { k[i] = Math.round(this.heights[i] / stepH); continue; }
      k[i] = Math.round(this.heights[i] / stepH);
    }
    // Ограничение уклонов распространением «вниз»: узел не может быть выше
    // соседа больше чем на лимит. Значения только убывают, поэтому обход
    // сходится всегда и даёт точный предел (никаких зажатых узлов).
    const lim = maxSteps;
    const limD = maxStepsDiag;
    const inQueue = new Uint8Array(n);
    const qn = n + 1;
    const queue = new Int32Array(qn);
    let head = 0;
    let tail = 0;
    const push = (i) => {
      if (inQueue[i]) return;
      inQueue[i] = 1;
      queue[tail] = i;
      tail = (tail + 1) % qn;
    };
    for (let i = 0; i < n; i++) push(i);
    const pairsOf = (i, ix, iz) => {
      // соседи со своим лимитом; понижаем тех, кто выше i + лимит
      let changed = 0;
      const down = (j, d) => {
        if (k[j] > k[i] + d) { k[j] = k[i] + d; push(j); changed++; }
      };
      if (ix > 0) down(i - 1, lim);
      if (ix < GRID - 1) down(i + 1, lim);
      if (iz > 0) down(i - GRID, lim);
      if (iz < GRID - 1) down(i + GRID, lim);
      if (ix > 0 && iz > 0) down(i - GRID - 1, limD);
      if (ix < GRID - 1 && iz > 0) down(i - GRID + 1, limD);
      if (ix > 0 && iz < GRID - 1) down(i + GRID - 1, limD);
      if (ix < GRID - 1 && iz < GRID - 1) down(i + GRID + 1, limD);
      return changed;
    };
    let guard = 0;
    const guardMax = n * 400;
    while (head !== tail && guard < guardMax) {
      const i = queue[head];
      head = (head + 1) % qn;
      inQueue[i] = 0;
      guard++;
      if (lock.has(i)) continue;
      const ix = i % GRID;
      const iz = (i - ix) / GRID;
      // сам узел мог стать выше соседа — сначала подтягиваем его вниз
      let low = k[i];
      if (ix > 0) low = Math.min(low, k[i - 1] + lim);
      if (ix < GRID - 1) low = Math.min(low, k[i + 1] + lim);
      if (iz > 0) low = Math.min(low, k[i - GRID] + lim);
      if (iz < GRID - 1) low = Math.min(low, k[i + GRID] + lim);
      if (ix > 0 && iz > 0) low = Math.min(low, k[i - GRID - 1] + limD);
      if (ix < GRID - 1 && iz > 0) low = Math.min(low, k[i - GRID + 1] + limD);
      if (ix > 0 && iz < GRID - 1) low = Math.min(low, k[i + GRID - 1] + limD);
      if (ix < GRID - 1 && iz < GRID - 1) low = Math.min(low, k[i + GRID + 1] + limD);
      if (low < k[i]) { k[i] = low; pairsOf(i, ix, iz); continue; }
      pairsOf(i, ix, iz);
    }
    for (let i = 0; i < n; i++) {
      if (lock.has(i)) continue;
      this.heights[i] = k[i] * stepH;
    }
    this._quantGuard = guard;
    this._quantGuardMax = guardMax;
    // самопроверка: максимальный уклон поверхности
    this._quantCalls = (this._quantCalls || 0) + 1;
    let worst = 0;
    for (let iz = 0; iz < GRID; iz++) {
      for (let ix = 0; ix < GRID - 1; ix++) {
        const i = iz * GRID + ix;
        if (lock.has(i) || lock.has(i + 1)) continue;
        worst = Math.max(worst, Math.abs(this.heights[i + 1] - this.heights[i]));
      }
    }
    this._quantWorst = worst / stepH;
  }

  /** Высота сетки рельефа (билинейно), без учёта выкопанных ям */
  _gridHeightAt(x, z, arr = this.heights) {
    const gx = clamp((x + SIZE / 2) / STEP, 0, GRID - 1.001);
    const gz = clamp((z + SIZE / 2) / STEP, 0, GRID - 1.001);
    const ix = Math.floor(gx);
    const iz = Math.floor(gz);
    const fx = gx - ix;
    const fz = gz - iz;
    const h00 = arr[iz * GRID + ix];
    const h10 = arr[iz * GRID + ix + 1];
    const h01 = arr[(iz + 1) * GRID + ix];
    const h11 = arr[(iz + 1) * GRID + ix + 1];
    const a = h00 + (h10 - h00) * fx;
    const b = h01 + (h11 - h01) * fx;
    return a + (b - a) * fz;
  }

  /**
   * Высота земли в мировых координатах. Яма вырезана из рельефа, поэтому
   * внутри неё высота — пол ямы или ступень, а не дёрн: герой туда падает.
   */
  heightAt(x, z) {
    const pitY = this.pitFloorAt(x, z);
    if (pitY !== null) return pitY;
    return this._gridHeightAt(x, z);
  }

  slopeAt(x, z) {
    const d = 1.5;
    const dx = (this.heightAt(x + d, z) - this.heightAt(x - d, z)) / (2 * d);
    const dz = (this.heightAt(x, z + d) - this.heightAt(x, z - d)) / (2 * d);
    return Math.hypot(dx, dz);
  }

  _colorFor(h, slope, moisture, x, z) {
    const c = new THREE.Color();
    if (h < 0.35) {
      // мокрый песок у самой воды — тоже из нескольких оттенков
      const wet = fbm(x * 0.05 + 12, z * 0.05 - 3, 2, this.seed + 311);
      c.copy(SAND_ZONES[3]).lerp(SAND_ZONES[1], wet * 0.6);
      c.lerp(new THREE.Color(COLORS.sandWet), 0.55);
    } else if (h < 2.15 + moisture * 0.45) {
      // пляж: пять оттенков песка, границы рваные
      const sp = fbm(x * 0.045 + 5, z * 0.045 - 17, 3, this.seed + 401)
        * 0.6 + fbm(x * 0.013 - 9, z * 0.013 + 22, 2, this.seed + 409) * 0.4;
      const idx = sp < 0.3 ? 3 : sp < 0.45 ? 1 : sp < 0.58 ? 2 : sp < 0.72 ? 0 : 4;
      c.copy(SAND_ZONES[idx]);
      c.offsetHSL(0, (sp - 0.5) * 0.12, (sp - 0.5) * 0.05);
    } else if (slope > 0.85 || h > 19) {
      c.setHex(slope > 1.2 ? COLORS.rockDark : COLORS.rock);
    } else if (h > 15) {
      c.lerpColors(new THREE.Color(COLORS.rock), new THREE.Color(COLORS.snow), smoothstep(17, 24, h));
    } else {
      // --- трава из разных оттенков: участки-пятна дискретных цветов ---
      // три поля шума: крупные районы, их границы и мелкая рябь
      const n1 = fbm(x * 0.019 + 60, z * 0.019 - 12, 3, this.seed + 91);
      const n2 = fbm(x * 0.0095 - 24, z * 0.0095 + 41, 2, this.seed + 137);
      const n3 = fbm(x * 0.075 + 7, z * 0.075 + 90, 2, this.seed + 211);

      const tones = GRASS_TONES;
      // «район» травы: 5 оттенков, границы рваные за счёт шума
      const pick = n1 * 0.62 + n2 * 0.38 + (n3 - 0.5) * 0.16;
      const zones = GRASS_ZONES;
      let tone = zones[0];
      if (pick > 0.34) tone = zones[1];
      if (pick > 0.45) tone = zones[2];
      if (pick > 0.55) tone = zones[3];
      if (pick > 0.64) tone = zones[4];
      c.copy(tone.color);

      // внутри района — своя жизнь: влажная трава зеленее, сухая теплее
      c.lerp(tones.jungle, clamp((moisture - 0.5) * 1.2, 0, 1) * 0.45);
      c.lerp(tones.dry, smoothstep(0.6, 0.85, n1) * 0.3);
      c.offsetHSL((n3 - 0.5) * 0.035, (n3 - 0.5) * 0.2, (n3 - 0.5) * 0.08);
      if (slope > 0.6) c.lerp(new THREE.Color(COLORS.rock), smoothstep(0.6, 0.9, slope) * 0.7);
    }
    return c;
  }

  _buildTerrain() {
    const geo = new THREE.PlaneGeometry(SIZE, SIZE, GRID - 1, GRID - 1);
    geo.rotateX(-Math.PI / 2);

    const pos = geo.attributes.position;
    const colors = new Float32Array(pos.count * 3);
    const splat = new Float32Array(pos.count * 4);
    const tmp = new THREE.Color();

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const h = this.heightAt(x, z);
      pos.setY(i, h);

      const slope = this.slopeAt(x, z);
      const moisture = fbm(x * 0.009 + 3, z * 0.009 - 8, 3, this.seed + 31);
      tmp.copy(this._colorFor(h, slope, moisture, x, z));
      colors[i * 3] = tmp.r;
      colors[i * 3 + 1] = tmp.g;
      colors[i * 3 + 2] = tmp.b;

      // веса текстур: песок / трава / камень / земля
      const sandW = Math.max(
        smoothstep(2.6, 1.2, h),                       // пляж
        1 - smoothstep(0.1, 1.4, h)                     // мокрый песок
      );
      const grassW = smoothstep(1.9, 3.2, h) * (1 - smoothstep(13, 18, h)) * (0.55 + moisture * 0.6);
      const rockW = Math.max(smoothstep(0.55, 1.1, slope), smoothstep(12, 19, h));
      // пятна голой земли и мха: земля не выглядит одним ровным ковром
      const patch = fbm(x * 0.047 + 11, z * 0.047 - 5, 3, this.seed + 77);
      const patch2 = fbm(x * 0.017 - 40, z * 0.017 + 23, 2, this.seed + 13);
      const bare = smoothstep(0.56, 0.82, patch * 0.65 + patch2 * 0.45);
      const dirtW = 0.25 * (1 - grassW) * smoothstep(2.4, 4.5, h) + bare * 0.85 * (1 - smoothstep(12, 16, h));
      // --- почва тоже из разных оттенков: глина, суглинок, гравий, торф, мох ---
      const soilPick = fbm(x * 0.031 + 71, z * 0.031 - 33, 3, this.seed + 523) * 0.66
        + fbm(x * 0.0085 - 14, z * 0.0085 + 8, 2, this.seed + 541) * 0.34;
      const dz = DIRT_ZONES;
      const soil = dz[soilPick < 0.3 ? 5 : soilPick < 0.4 ? 4 : soilPick < 0.5 ? 0
        : soilPick < 0.6 ? 1 : soilPick < 0.68 ? 2 : soilPick < 0.78 ? 3 : 7];
      if (bare > 0.02) {
        tmp.lerp(soil.color, clamp(bare * 0.85, 0, 0.85));
        colors[i * 3] = tmp.r;
        colors[i * 3 + 1] = tmp.g;
        colors[i * 3 + 2] = tmp.b;
      }
      const moss = smoothstep(0.6, 0.78, patch2) * grassW * 0.5;
      if (moss > 0.02) {
        // тёмно-зелёный мох в низинах — отдельный оттенок травы
        tmp.lerp(new THREE.Color(0x5f7f3a), moss * 0.75);
        colors[i * 3] = tmp.r;
        colors[i * 3 + 1] = tmp.g;
        colors[i * 3 + 2] = tmp.b;
      }

      // порядок каналов совпадает с шейдером: трава, песок, камень, земля
      const sum = sandW + grassW + rockW + dirtW || 1;
      splat[i * 4] = grassW / sum;
      splat[i * 4 + 1] = sandW / sum;
      splat[i * 4 + 2] = rockW / sum;
      splat[i * 4 + 3] = dirtW / sum;
    }

    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    this.baseColors = colors.slice();
    geo.setAttribute('splat', new THREE.BufferAttribute(splat, 4));
    geo.computeVertexNormals();

    const mat = this.textures
      ? createTerrainMaterial(this.textures)
      : new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.96, metalness: 0 });

    this.terrain = new THREE.Mesh(geo, mat);
    this.terrain.receiveShadow = true;
    this.terrain.castShadow = false;
    this.scene.add(this.terrain);
    // полный индекс рельефа — из него вырезаются клетки выкопанных ям
    this.terrainIndexBase = geo.index ? geo.index.array.slice() : null;
  }

  _buildWater() {
    // карта высот как текстура: по ней вода узнаёт глубину и рисует прибой
    const data = new Uint8Array(GRID * GRID);
    for (let i = 0; i < this.heights.length; i++) {
      const h = this.heights[i];
      data[i] = Math.max(0, Math.min(255, Math.round(((h + 16) / 44) * 255)));
    }
    const depthTex = new THREE.DataTexture(data, GRID, GRID, THREE.RedFormat, THREE.UnsignedByteType);
    depthTex.magFilter = THREE.LinearFilter;
    depthTex.minFilter = THREE.LinearFilter;
    depthTex.wrapS = THREE.ClampToEdgeWrapping;
    depthTex.wrapT = THREE.ClampToEdgeWrapping;
    depthTex.needsUpdate = true;
    this.depthTexture = depthTex;

    const geo = new THREE.PlaneGeometry(SIZE * 1.9, SIZE * 1.9, 180, 180);
    geo.rotateX(-Math.PI / 2);

    this.waterUniforms = {
      uTime: { value: 0 },
      uDeep: { value: new THREE.Color(0x0a3550) },
      uMid: { value: new THREE.Color(0x105f84) },
      uShallow: { value: new THREE.Color(0x3fbcbf) },
      uFoam: { value: new THREE.Color(0xf2fbff) },
      uSunDir: { value: new THREE.Vector3(0.4, 0.8, 0.3) },
      uSunColor: { value: new THREE.Color(0xffe8b0) },
      uFog: { value: new THREE.Color(0x9fc3d6) },
      uNight: { value: 0 },
      uDepth: { value: depthTex },
      uSize: { value: SIZE },
      uUnder: { value: 0 },
      uBoat: { value: new THREE.Vector4(0, 0, 0, 0) },
      uBoatVisible: { value: 0 },
    };

    const mat = new THREE.ShaderMaterial({
      uniforms: this.waterUniforms,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      vertexShader: /* glsl */ `
        uniform float uTime;
        varying vec3 vWorldPos;
        varying float vWave;

        float wave(vec2 p, float t) {
          return sin(p.x * 0.115 + t * 1.15) * 0.15
               + sin(p.y * 0.165 - t * 0.9) * 0.11
               + sin((p.x + p.y) * 0.055 + t * 0.6) * 0.22
               + sin(length(p) * 0.22 - t * 1.4) * 0.07;
        }

        void main() {
          vec3 pos = position;
          float w = wave(pos.xz, uTime);
          pos.y += w;
          vWave = w;
          vWorldPos = (modelMatrix * vec4(pos, 1.0)).xyz;
          gl_Position = projectionMatrix * viewMatrix * vec4(vWorldPos, 1.0);
        }
      `,
      fragmentShader: /* glsl */ `
        uniform vec3 uDeep;
        uniform vec3 uMid;
        uniform vec3 uShallow;
        uniform vec3 uFoam;
        uniform vec3 uSunDir;
        uniform vec3 uSunColor;
        uniform vec3 uFog;
        uniform float uNight;
        uniform float uTime;
        uniform float uSize;
        uniform float uUnder;
        uniform vec4 uBoat; // x, z, cos(angle), sin(angle)
        uniform float uBoatVisible;
        uniform sampler2D uDepth;

        varying vec3 vWorldPos;
        varying float vWave;

        float hash(vec2 p) {
          return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
        }

        float vnoise(vec2 p) {
          vec2 i = floor(p);
          vec2 f = fract(p);
          vec2 u = f * f * (3.0 - 2.0 * f);
          return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
                     mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
        }

        void main() {
          // Не рисовать поверхность внутри корпуса, иначе вода перекрывает днище.
          vec2 delta = vWorldPos.xz - uBoat.xy;
          vec2 boatLocal = vec2(delta.x * uBoat.z - delta.y * uBoat.w,
                                delta.x * uBoat.w + delta.y * uBoat.z);
          float boatWidth = 0.54 * (1.0 - 0.48 * smoothstep(0.65, 1.85, abs(boatLocal.y)));
          if (uBoatVisible > 0.5 && uUnder < 0.5 && abs(boatLocal.y) < 1.72 && abs(boatLocal.x) < boatWidth) discard;
          vec2 huv = (vWorldPos.xz / uSize) + 0.5;
          float encoded = texture2D(uDepth, clamp(huv, 0.001, 0.999)).r;
          float ground = encoded * 44.0 - 16.0;   // обратно в метры
          float depth = max(0.0, -ground);

          // полностью на суше воды нет
          if (depth <= 0.02) discard;

          vec3 viewDir = normalize(cameraPosition - vWorldPos);

          // нормаль по производным волн
          float e = 0.6;
          float hx = sin((vWorldPos.x + e) * 0.115 + uTime * 1.15) * 0.15 - sin(vWorldPos.x * 0.115 + uTime * 1.15) * 0.15;
          float hz = sin((vWorldPos.z + e) * 0.165 - uTime * 0.9) * 0.11 - sin(vWorldPos.z * 0.165 - uTime * 0.9) * 0.11;
          vec3 n = normalize(vec3(-hx * 2.2, e * 0.9, -hz * 2.2));

          // взгляд из-под воды: поверхность видна снизу как светящийся потолок
          if (!gl_FrontFacing) {
            // луч «глаз → точка поверхности»: под водой смотрит вверх
            vec3 eyeDir = normalize(vWorldPos - cameraPosition);
            float upness = clamp(eyeDir.y, 0.0, 1.0);
            // «окно Снелла»: прямо над головой видно небо, по краям — зеркало воды
            float window = smoothstep(0.62, 0.94, upness);
            vec3 deepTint = uDeep * 1.5 + vec3(0.02, 0.06, 0.09);
            vec3 skyTint = vec3(0.42, 0.72, 0.82) * (1.0 - uNight * 0.7);
            // окно Снелла «дышит» рябью и слегка впитало цвет глубины —
            // иначе снизу видно плоское белое пятно вместо воды
            float ripple = vnoise(vWorldPos.xz * 0.85 + vec2(uTime * 0.35, uTime * 0.22));
            float ripple2 = vnoise(vWorldPos.xz * 2.1 - vec2(uTime * 0.55, uTime * 0.31));
            skyTint *= 0.62 + ripple * 0.55 + ripple2 * 0.3;
            skyTint = mix(skyTint, uDeep * 1.35, 0.28);
            // солнечные «зайчики» сквозь волны — сетка света на потолке
            float caustic = pow(ripple * ripple2, 1.6) * 3.2 * window;
            skyTint += vec3(0.5, 0.86, 0.92) * caustic * (1.0 - uNight * 0.85);
            vec3 colU = mix(deepTint, skyTint, window);
            // блики на внутренней стороне волн
            vec3 nn = normalize(vec3(-n.x, abs(n.y), -n.z));
            float sparkle = pow(max(dot(reflect(-normalize(uSunDir), vec3(n.x, -n.y, n.z)), eyeDir), 0.0), 34.0);
            colU += uSunColor * sparkle * 1.1 * (1.0 - uNight * 0.85);
            float dist = length(cameraPosition - vWorldPos);
            colU = mix(colU, uDeep * 1.1 + vec3(0.0, 0.05, 0.07), clamp((dist - 5.0) / 34.0, 0.0, 0.9));
            float alphaU = 1.0;
            gl_FragColor = vec4(colU, alphaU);
            #include <tonemapping_fragment>
            #include <colorspace_fragment>
            return;
          }

          float fres = pow(1.0 - max(dot(n, viewDir), 0.0), 3.0);
          float diff = max(dot(reflect(-normalize(uSunDir), n), viewDir), 0.0);

          // цвет по глубине: бирюза у берега → глубокая синева
          vec3 col = mix(uShallow, uMid, smoothstep(0.2, 3.2, depth));
          col = mix(col, uDeep, smoothstep(3.0, 11.0, depth));
          col *= 0.86 + vWave * 0.55;

          // солнечные блики на гребнях
          col += uSunColor * pow(diff, 60.0) * 1.6 * (1.0 - uNight * 0.9);
          col = mix(col, vec3(0.70, 0.86, 0.94), fres * 0.42 * (1.0 - uNight * 0.7));

          // прибой: пена у самой кромки, бежит волнами
          float foamNoise = vnoise(vWorldPos.xz * 0.55 + vec2(uTime * 0.22, uTime * 0.14));
          float bands = sin(depth * 9.0 - uTime * 2.2 + foamNoise * 3.0) * 0.5 + 0.5;
          float shore = 1.0 - smoothstep(0.0, 1.15, depth);
          float foam = shore * smoothstep(0.55, 0.98, bands * (0.5 + foamNoise * 0.55)) * 0.8;
          foam += (1.0 - smoothstep(0.0, 0.11, depth)) * 0.45;
          col = mix(col, uFoam, clamp(foam, 0.0, 0.92) * (0.65 + 0.35 * (1.0 - uNight)));

          // прозрачность: у берега почти прозрачно
          float alpha = mix(0.24, 0.9, smoothstep(0.05, 2.6, depth));
          alpha = max(alpha, foam * 0.9);

          float dist = length(cameraPosition - vWorldPos);
          col = mix(col, uFog, clamp((dist - 45.0) / 200.0, 0.0, 0.82));
          alpha = mix(alpha, 1.0, clamp((dist - 120.0) / 220.0, 0.0, 0.9));

          gl_FragColor = vec4(col, alpha);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }
      `,
    });

    this.water = new THREE.Mesh(geo, mat);
    this.water.position.y = CONFIG.world.seaLevel;
    this.water.renderOrder = 2;
    this.water.frustumCulled = false;
    this.scene.add(this.water);
  }

  /**
   * Дома зверей. У каждого вида своё место: у логовища не растёт
   * ни дерево, ни куст, ни камень — зверю есть где встать, и он не
   * рождается внутри модели.
   */
  _planDens() {
    const rng = this.rng;
    const specs = [
      { kind: 'boar', count: 4, hMin: 2.6, hMax: 13, radius: 9 },
      { kind: 'crab', count: 4, hMin: 0.7, hMax: 2.2, radius: 7 },
      { kind: 'gull', count: 3, hMin: 1.0, hMax: 2.6, radius: 8 },
      { kind: 'snake', count: 3, hMin: 2.6, hMax: 11, radius: 7 },
      { kind: 'monkey', count: 4, hMin: 3.5, hMax: 14, radius: 10 },
      { kind: 'turtle', count: 4, hMin: 0.7, hMax: 2.2, radius: 7 },
    ];
    const dens = [];
    for (const sp of specs) {
      let made = 0;
      for (let i = 0; i < 9000 && made < sp.count; i++) {
        const x = (rng() - 0.5) * SIZE * 0.9;
        const z = (rng() - 0.5) * SIZE * 0.9;
        const h = this.heightAt(x, z);
        if (h < sp.hMin || h > sp.hMax) continue;
        if (this.slopeAt(x, z) > 0.45) continue;
        // не на месте высадки героя и не вплотную к другому дому
        if (this.spawnPoint && Math.hypot(x - this.spawnPoint.x, z - this.spawnPoint.z) < 30) continue;
        if (dens.some((d) => Math.hypot(d.x - x, d.z - z) < 28)) continue;
        dens.push({ x, z, kind: sp.kind, radius: sp.radius, y: h });
        made++;
      }
    }
    this.dens = dens;
    this._flatSpots = this._flatSpots || [];
    for (const d of dens) this._flatSpots.push({ x: d.x, z: d.z, r: d.radius * 0.42, y: d.y, tag: 'den' });
  }

  /** Дом зверя в точке (для мобов): ближайший подходящий по биому */
  denFor(kind, near = null) {
    const list = (this.dens || []).filter((d) => d.kind === kind);
    if (!list.length) return null;
    if (!near) return list[Math.floor(this.rng() * list.length)];
    let best = null;
    let bd = Infinity;
    for (const d of list) {
      const dd = Math.hypot(d.x - near.x, d.z - near.z);
      if (dd < bd) { bd = dd; best = d; }
    }
    return best;
  }

  /**
   * Применить все заявки на ровную землю. Под каждой моделью узлы сетки
   * садятся на одну высоту, а сразу за краем — плавный переход.
   */
  _applyFlatSpots() {
    if (!this._flatSpots || !this._flatSpots.length) return;
    const half = SIZE / 2;
    const reachPad = STEP * 1.2;
    for (const sp of this._flatSpots) {
      const cx = Math.round((sp.x + half) / STEP);
      const cz = Math.round((sp.z + half) / STEP);
      const reach = Math.ceil((sp.r + reachPad) / STEP) + 1;
      // цель площадки — среднее по уже сложившемуся рельефу под ней:
      // так соседние площадки не спорят друг с другом
      let sum = 0;
      let n = 0;
      for (let iz = Math.max(1, cz - 1); iz <= Math.min(GRID - 2, cz + 1); iz++) {
        for (let ix = Math.max(1, cx - 1); ix <= Math.min(GRID - 2, cx + 1); ix++) {
          sum += this.heights[iz * GRID + ix];
          n++;
        }
      }
      if (n) sp.y = sum / n;
      for (let iz = Math.max(1, cz - reach); iz <= Math.min(GRID - 2, cz + reach); iz++) {
        for (let ix = Math.max(1, cx - reach); ix <= Math.min(GRID - 2, cx + reach); ix++) {
          if (this._terrainCellCut(ix, iz)) continue;
          // чужое ядро (уже ровная земля под соседней моделью) не трогаем
          if (this.flatCore.has(iz * GRID + ix)) continue;
          const nx = -half + ix * STEP;
          const nz = -half + iz * STEP;
          const d = Math.hypot(nx - sp.x, nz - sp.z);
          if (d > sp.r + reachPad) continue;
          const t = d <= sp.r ? 1 : 1 - smoothstep(sp.r, sp.r + reachPad, d);
          const i = iz * GRID + ix;
          this.heights[i] = this.heights[i] * (1 - t) + sp.y * t;
          if (t >= 1) this.flatCore.add(i);
        }
      }
    }
    this._flatLog = this._flatSpots.slice();
    this._flatSpots.length = 0;
    // ровные площадки не должны давать обрывов по краю: снова усаживаем
    // рельеф на разрешённые ступени (0/15/30/40°)
    this._quantizeSlopes();
    this._applyHeights();
    if (this.baseHeights) this.baseHeights.set(this.heights);
  }

  /**
   * Дома зверей на земле: логовище кабана, нора змеи, гнездо чайки,
   * куча песка краба, гнездо черепахи и веточный настил обезьяны.
   */
  _buildDens() {
    const mat = new THREE.MeshStandardMaterial({
      vertexColors: true, roughness: 0.95, flatShading: true,
    });
    const byKind = new Map();
    for (const d of this.dens) {
      if (!byKind.has(d.kind)) byKind.set(d.kind, []);
      byKind.get(d.kind).push(d);
    }
    const R = (i) => (Math.sin(i * 12.9898) * 43758.5453) % 1;

    /**
     * Дома строятся «как в природе», у каждого вида своё:
     * кабан — навес из веток над вытоптанной ямой-купальней,
     * краб — нора в песчаном бугре с ходами,
     * чайка — гнездо из травы на камне,
     * змея — нора под плоским камнем,
     * обезьяна — шалаш-настил из веток,
     * черепаха — песчаная лежанка с кладкой яиц.
     * Ориентир: вход всегда смотрит наружу поляны (в сторону от центра дома).
     */
    let denParts = [];
    const finishDen = (parts) => {
      denParts = parts;
      return mergeGeometries(parts, false);
    };
    const builders = {
      boar: () => {
        const parts = [];
        // вытоптанная купальня: впадина с грязевым валиком по краю
        addPart(parts, new THREE.CylinderGeometry(1.25, 1.45, 0.36, 11, 1), 0x4a3a28, 0, 0.02, 0);
        addPart(parts, new THREE.CylinderGeometry(0.95, 1.05, 0.16, 10, 1), 0x2f2418, 0, 0.16, 0);
        for (let i = 0; i < 12; i++) {
          const a = (i / 12) * Math.PI * 2;
          addPart(parts, new THREE.IcosahedronGeometry(0.16 + Math.abs(R(i)) * 0.1, 0), 0x5a4630,
            Math.cos(a) * 1.42, 0.1, Math.sin(a) * 1.42, R(i + 1), R(i + 2), 0);
        }
        // навес-шалаш: два столба, перекладина, жерди с перекладины на землю
        const postZ = 1.35;
        for (const sx of [-1, 1]) addRod(parts, [sx * 1.05, 0, postZ], [sx * 1.02, 1.55, postZ], 0.09, 0.13, 0x6b4c30, 5);
        addRod(parts, [-1.25, 1.52, postZ], [1.25, 1.52, postZ], 0.09, 0.09, 0x6b4c30, 5);
        // жерди ложатся на перекладину и уходят к земле позади героя
        for (let i = 0; i < 6; i++) {
          const x = -1.0 + i * 0.4;
          addRod(parts, [x, 1.5, postZ - 0.05], [x * 1.25, 0.1, -0.75], 0.05, 0.075, 0x7a5a37, 4);
        }
        // покров из листвы на жердях
        for (let i = 0; i < 7; i++) {
          const x = -0.9 + i * 0.3;
          addPart(parts, new THREE.IcosahedronGeometry(0.32 + Math.abs(R(i + 7)) * 0.16, 0), 0x5d7f3a,
            x, 1.02 + Math.abs(R(i)) * 0.28, 0.55 + Math.abs(R(i + 4)) * 0.4, R(i), R(i + 2), 0);
        }
        // подстилка под навесом
        addPart(parts, new THREE.CylinderGeometry(1.0, 1.15, 0.12, 9, 1), 0x7d6644, 0, 0.08, 0.55);
        for (let i = 0; i < 9; i++) {
          const a = i * 2.3;
          addPart(parts, new THREE.IcosahedronGeometry(0.1 + Math.abs(R(i)) * 0.07, 0), 0x8a7245,
            Math.cos(a) * (0.75 + Math.abs(R(i + 3)) * 0.35), 0.16, 0.55 + Math.sin(a) * 0.55);
        }
        // следы клыков на стволе-«точилке» сбоку
        addRod(parts, [1.9, 0, -0.3], [1.95, 1.7, -0.4], 0.11, 0.15, 0x7a5a37, 5);
        for (let i = 0; i < 4; i++) {
          addPart(parts, new THREE.BoxGeometry(0.06, 0.03, 0.18), 0xd8cba6, 1.79, 0.55 + i * 0.22, -0.32 - i * 0.02, 0, 0.3, 0);
        }
        return finishDen(parts);
      },
      crab: () => {
        const parts = [];
        // песчаный бугор, наметённый клешнями: широкое основание и валик по краю
        addPart(parts, new THREE.CylinderGeometry(1.35, 1.8, 0.44, 13, 1), 0xdccba2, 0, 0.12, 0);
        for (let i = 0; i < 10; i++) {
          const a = (i / 10) * Math.PI * 2 + 0.3;
          addPart(parts, new THREE.IcosahedronGeometry(0.24 + Math.abs(R(i + 11)) * 0.12, 0), 0xe6d7b0,
            Math.cos(a) * 1.55, 0.2, Math.sin(a) * 1.55, R(i), a, 0);
        }
        // вход-кратер сверху и боковой ход наружу — видно, что это нора
        addPart(parts, new THREE.ConeGeometry(0.78, 0.5, 11, 1), 0x2a2419, 0.12, 0.5, 0.1, Math.PI, 0, 0);
        addPart(parts, new THREE.CylinderGeometry(0.62, 0.7, 0.1, 11, 1), 0xcbb996, 0.12, 0.34, 0.1);
        addPart(parts, new THREE.CylinderGeometry(0.3, 0.36, 0.5, 9, 1), 0x241f16, 0.9, 0.16, 0.12, Math.PI / 2.2, 0, 0);
        addPart(parts, new THREE.TorusGeometry(0.33, 0.06, 4, 9), 0xc9b78d, 1.12, 0.16, 0.12, 0, 0, Math.PI / 2.2);
        // второй выход — маленькая дыра с другой стороны
        addPart(parts, new THREE.CylinderGeometry(0.17, 0.22, 0.3, 8, 1), 0x1b1710, -1.02, 0.18, -0.42, -1.3, 0.2, 0);
        // выброшенный песок, ракушки и панцирь-«дверь»
        for (let i = 0; i < 10; i++) {
          const a = i * 1.7;
          addPart(parts, new THREE.IcosahedronGeometry(0.09 + Math.abs(R(i)) * 0.08, 0), 0xefe6cd,
            Math.cos(a) * (1.25 + Math.abs(R(i + 2)) * 0.55), 0.09, Math.sin(a) * (1.25 + Math.abs(R(i + 4)) * 0.55));
        }
        addPart(parts, new THREE.SphereGeometry(0.16, 7, 5, 0, Math.PI * 2, 0, Math.PI * 0.55), 0xe8dcc4, 1.15, 0.12, -0.5, 0.4, 0, 0.3);
        // следы клешней на песке
        for (let i = 0; i < 6; i++) {
          addPart(parts, new THREE.BoxGeometry(0.05, 0.02, 0.22), 0xbcab85, 1.4 + i * 0.22, 0.05, 0.55 + Math.sin(i) * 0.3, 0, i * 0.6, 0);
        }
        return finishDen(parts);
      },
      gull: () => {
        const parts = [];
        // скальный выступ — гнездо на нём недоступно хищникам
        addPart(parts, new THREE.IcosahedronGeometry(1.2, 1), 0x8b8578, 0, 0.32, 0, 0, 0, 0);
        addPart(parts, new THREE.IcosahedronGeometry(0.7, 0), 0x9a9486, 0.9, 0.5, 0.55, 0, 0.4, 0.2);
        addPart(parts, new THREE.IcosahedronGeometry(0.55, 0), 0x7f7a6e, -0.85, 0.28, -0.5);
        // плоская вершина, на которой лежит гнездо
        addPart(parts, new THREE.CylinderGeometry(0.82, 0.92, 0.16, 9, 1), 0xa39c8c, 0, 1.28, 0);
        // чаша гнезда: витой валик из сухой травы
        for (let i = 0; i < 16; i++) {
          const a = (i / 16) * Math.PI * 2;
          addPart(parts, new THREE.CylinderGeometry(0.045, 0.055, 0.62, 4, 1), i % 2 ? 0x9c8a5c : 0x8a7748,
            Math.cos(a) * 0.55, 1.44, Math.sin(a) * 0.55, 1.2, -a, 0.5);
        }
        addPart(parts, new THREE.CylinderGeometry(0.5, 0.44, 0.1, 10, 1), 0x6d5c38, 0, 1.4, 0);
        // яйца в чаше — их видно сверху
        for (let i = 0; i < 3; i++) {
          const a = (i / 3) * Math.PI * 2 + 0.5;
          addPart(parts, new THREE.SphereGeometry(0.14, 8, 6), 0xf4efdd,
            Math.cos(a) * 0.24, 1.52, Math.sin(a) * 0.24, 0.2, 0, 0);
        }
        addPart(parts, new THREE.SphereGeometry(0.15, 8, 6), 0xefe8d2, 0.03, 1.53, -0.05, 0.1, 0, 0);
        // пух и перья по краю
        for (let i = 0; i < 7; i++) {
          const a = i * 1.1;
          addPart(parts, new THREE.ConeGeometry(0.05, 0.18, 3, 1), 0xf2ecdb,
            Math.cos(a) * 0.75, 1.36, Math.sin(a) * 0.75, 1.4, a, 0.4);
        }
        return finishDen(parts);
      },
      snake: () => {
        const parts = [];
        // плоский камень-крыша, под которым держится тепло
        addPart(parts, new THREE.CylinderGeometry(1.05, 1.2, 0.3, 7, 1), 0x7d7568, 0, 0.55, 0, 0.07, 0.6, 0.05);
        addPart(parts, new THREE.CylinderGeometry(0.7, 0.8, 0.12, 7, 1), 0x8b8376, 0.1, 0.72, 0.05, 0.05, 0.2, 0);
        // опорные валуны по бокам — под камнем остаётся полость
        addPart(parts, new THREE.IcosahedronGeometry(0.5, 0), 0x6f6a5e, 1.0, 0.26, -0.4, 0.2, 0.3, 0);
        addPart(parts, new THREE.IcosahedronGeometry(0.42, 0), 0x6f6a5e, -0.95, 0.22, 0.35, 0, 0.4, 0);
        // сам ход: тёмный наклонный тоннель, виден снаружи
        addPart(parts, new THREE.CylinderGeometry(0.36, 0.26, 0.95, 9, 1), 0x221d17, 0.55, 0.22, 0.55, -1.35, 0.5, 0.3);
        addPart(parts, new THREE.TorusGeometry(0.33, 0.06, 4, 9), 0x5d574c, 0.82, 0.28, 0.82, 0.75, 0.5, 0);
        // выползки: змеиный след на песке
        for (let i = 0; i < 9; i++) {
          const t = i / 8;
          addPart(parts, new THREE.BoxGeometry(0.1, 0.015, 0.16), 0x9a8f76,
            1.5 + Math.sin(t * 5) * 0.35, 0.03, 1.1 + t * 1.5, 0, Math.sin(t * 5) * 0.5, 0);
        }
        // сухие стебли у входа
        for (let i = 0; i < 7; i++) {
          const a = R(i) * Math.PI * 2;
          addPart(parts, new THREE.CylinderGeometry(0.015, 0.03, 0.55, 3, 1), 0x9b8b52,
            Math.cos(a) * (1.15 + Math.abs(R(i + 2)) * 0.45), 0.16, Math.sin(a) * (1.15 + Math.abs(R(i + 4)) * 0.45), 0.5, -a, 0.2);
        }
        return finishDen(parts);
      },
      monkey: () => {
        const parts = [];
        // настил-помост из жердей, приподнятый над землёй
        addPart(parts, new THREE.CylinderGeometry(1.3, 1.4, 0.16, 10, 1), 0x6a4d2f, 0, 0.14, 0);
        for (let i = 0; i < 7; i++) {
          addPart(parts, new THREE.CylinderGeometry(0.06, 0.06, 2.5, 5, 1), i % 2 ? 0x74542f : 0x5f452a,
            0, 0.22, -1.15 + i * 0.38, 0, 0, Math.PI / 2);
        }
        // каркас шалаша: жерди сходятся наверху
        for (let i = 0; i < 8; i++) {
          const a = (i / 8) * Math.PI * 2;
          addRod(parts, [Math.cos(a) * 1.15, 0.2, Math.sin(a) * 1.15],
            [Math.cos(a) * 0.18, 2.05, Math.sin(a) * 0.18], 0.07, 0.05, 0x7d5c38, 4);
        }
        addPart(parts, new THREE.CylinderGeometry(0.14, 0.1, 0.34, 6, 1), 0x6a4d2f, 0, 2.12, 0);
        // покрытие из листвы: шалаш не «скелет», а укрытие
        for (let i = 0; i < 16; i++) {
          const a = (i / 16) * Math.PI * 2 + 0.2;
          const t = 0.35 + (i % 3) * 0.2;
          addPart(parts, new THREE.IcosahedronGeometry(0.36 + Math.abs(R(i)) * 0.16, 0), i % 2 ? 0x5d8a3c : 0x6f9c46,
            Math.cos(a) * (1.15 - t * 0.9), 0.55 + t * 1.5, Math.sin(a) * (1.15 - t * 0.9), R(i), a, 0);
        }
        // вход: проём в настиле и тёмная нора, уходящая под шалаш
        addPart(parts, new THREE.CylinderGeometry(0.46, 0.34, 0.7, 10, 1), 0x241d14, 0, 0.35, 1.02, -1.25, 0, 0);
        addPart(parts, new THREE.TorusGeometry(0.44, 0.07, 4, 10), 0x7d5c38, 0, 0.52, 1.22, 0.9, 0, 0);
        for (const sx of [-1, 1]) addRod(parts, [sx * 0.62, 0.4, 1.3], [sx * 0.5, 1.05, 1.12], 0.06, 0.05, 0x74542f, 4);
        for (let i = 0; i < 6; i++) {
          const a = i * 1.4;
          addPart(parts, new THREE.IcosahedronGeometry(0.28, 1), 0x6f9c46,
            Math.cos(a) * (1.25 + Math.abs(R(i)) * 0.35), 0.3, Math.sin(a) * (1.25 + Math.abs(R(i + 3)) * 0.35));
        }
        // ветка-«стол» с недоеденным плодом
        addRod(parts, [1.35, 0.1, -0.9], [1.7, 1.1, -1.05], 0.06, 0.04, 0x7d5c38, 4);
        addPart(parts, new THREE.SphereGeometry(0.14, 7, 6), 0xc9a24a, 1.68, 1.16, -1.05);
        return finishDen(parts);
      },
      turtle: () => {
        const parts = [];
        // песчаная лежанка — впадина с валиком
        addPart(parts, new THREE.CylinderGeometry(1.35, 1.15, 0.22, 11, 1), 0xd8c79c, 0, 0.1, 0);
        addPart(parts, new THREE.TorusGeometry(1.3, 0.16, 5, 12), 0xcdb98d, 0, 0.16, 0, Math.PI / 2, 0, 0);
        // кладка яиц
        for (let i = 0; i < 5; i++) {
          const a = (i / 5) * Math.PI * 2;
          addPart(parts, new THREE.SphereGeometry(0.11, 6, 5), 0xf1e8d2,
            Math.cos(a) * 0.34, 0.22, Math.sin(a) * 0.34, 0, 0, 0);
        }
        // редкие травинки по краю
        for (let i = 0; i < 8; i++) {
          const a = (i / 8) * Math.PI * 2 + 0.3;
          addPart(parts, new THREE.ConeGeometry(0.05, 0.34, 3, 1), 0x86b556,
            Math.cos(a) * 1.45, 0.2, Math.sin(a) * 1.45);
        }
        return finishDen(parts);
      },
    };
    this.denMeshes = [];
    for (const [kind, list] of byKind) {
      const geo = builders[kind] ? builders[kind]() : null;
      if (!geo) continue;
      // Камуфляж соответствует биому; вход (+Z) остаётся открытым.
      const cover = [geo];
      for (let j = 0; j < 9; j++) {
        const a = Math.PI * 0.25 + j * Math.PI * 1.5 / 8;
        const x = Math.cos(a) * 1.65, z = -Math.sin(a) * 1.65;
        if (kind === 'boar' || kind === 'monkey' || kind === 'snake') {
          addPart(cover, new THREE.IcosahedronGeometry(0.32 + (j % 3) * 0.1, 0),
            j % 2 ? 0x547a3b : 0x6a8b49, x, 0.35, z);
          addPart(cover, new THREE.ConeGeometry(0.15, 0.55, 4), 0x789751, x * 1.12, 0.22, z * 1.12);
        } else {
          addPart(cover, new THREE.IcosahedronGeometry(0.16 + (j % 3) * 0.07, 0),
            kind === 'gull' ? 0x8d887a : 0xcbb995, x, 0.08, z);
          addPart(cover, new THREE.ConeGeometry(0.035, 0.32, 3), 0x9d9a64, x * 1.08, 0.15, z * 1.08);
        }
      }
      const coveredGeo = mergeGeometries(cover, false);
      // Отдельная оболочка каждой твёрдой детали, а не круг вокруг жилища.
      const sectors = [];
      for (const g of denParts) {
        g.computeBoundingBox();
        const box = g.boundingBox;
        if (!box || box.max.y < 0.25 || box.max.y - box.min.y < 0.12) continue;
        // Каждая деталь сохраняет форму в нескольких поясах, без обрезки
        // граней на границах пояса.
        sectors.push(...meshSections([g]));
      }
      const mesh = new THREE.InstancedMesh(coveredGeo, mat, list.length);
      mesh.castShadow = true;
      mesh.frustumCulled = false;
      const dummy = new THREE.Object3D();
      list.forEach((d, i) => {
        // вход смотрит от центра поляны наружу — зверю есть куда выйти
        if (d.entrance === undefined) {
          d.entrance = Math.atan2(d.x, d.z) + Math.PI * 0.5;
          d.entrance = (this.rng() - 0.5) * 0.6 + d.entrance;
        }
        dummy.position.set(d.x, d.y - 0.12, d.z);
        dummy.rotation.set(0, d.entrance, 0);
        dummy.scale.setScalar(0.85 + this.rng() * 0.35);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
        // Детали укрытия участвуют в столкновениях независимо от высоты.
        const sizes = { boar: [1.15, 1.6], monkey: [1.12, 2.0], gull: [0.95, 1.5], snake: [0.9, 0.8], crab: [1.1, 0.45], turtle: [1.1, 0.32] };
        const [r, height] = sizes[kind];
        // Круг используется только при подборе места спавна, не для движения.
        this.colliders.push({ x: d.x, z: d.z, r: r * dummy.scale.x, height: height * dummy.scale.x, kind: 'den', den: d, soft: true });
        d.shells = [];
        const cos = Math.cos(d.entrance), sin = Math.sin(d.entrance), scale = dummy.scale.x;
        for (const sector of sectors) {
          const poly = sector.poly.map(p => ({
            x: d.x + (p.x * cos + p.z * sin) * scale,
            z: d.z + (-p.x * sin + p.z * cos) * scale,
          }));
          d.shells.push(this.shells.add('den', poly, d.y - 0.12 + sector.minY * scale,
            d.y - 0.12 + sector.maxY * scale));
        }
      });
      mesh.instanceMatrix.needsUpdate = true;
      // «дом» статичен: не пересчитываем его матрицу каждый кадр
      mesh.matrixAutoUpdate = false;
      mesh.updateMatrix();
      this.scene.add(mesh);
      this.denMeshes.push(mesh);
    }
  }

  _buildVegetation() {
    const rng = this.rng;
    const palms = [];
    const trees = [];
    const pines = [];
    const mangroves = [];
    const deads = [];
    const bushes = [];
    const rocks = [];
    const tufts = [];

    const moistureAt = (x, z) => fbm(x * 0.009 + 3, z * 0.009 - 8, 3, this.seed + 31);
    const forestAt = (x, z) => fbm(x * 0.012 - 17, z * 0.012 + 6, 3, this.seed + 44);

    const nextScale = () => 0.8 + rng() * 0.55;

    // --- логовища: свободное ядро, растительность вокруг ---
    this._planDens();
    const nearDen = (x, z, pad = 0) => {
      for (const d of this.dens) if (Math.hypot(x - d.x, z - d.z) < Math.min(d.radius, 3.2) + pad) return d;
      return null;
    };

    // --- ровная земля под каждой моделью ---
    // Заявки копятся и применяются одним проходом: иначе на каждый куст
    // пришлось бы пересчитывать все 40 тысяч вершин рельефа.
    // Сохраняем площадки логовищ, запланированные до растительности.
    this._flatSpots = this._flatSpots || [];
    // Площадки не пересекаются: иначе одна заявка «перетирает» другую и
    // под моделью снова получается склон. Нет места — нет модели.
    this._flatStats = { ask: 0, deny: 0 };
    const requestFlat = (x, z, r) => {
      this._flatStats.ask++;
      for (const sp of this._flatSpots) {
        if (Math.hypot(x - sp.x, z - sp.z) < r + sp.r + 0.45) { this._flatStats.deny++; return null; }
      }
      const y = this.heightAt(x, z);
      this._flatSpots.push({ x, z, r, y, y0: y, tag: 'veg' });
      return y;
    };

    // зазор между моделями и свободное ядро у логовища
    const freeSpot = (x, z, r) => this.isFree(x, z, r) && !nearDen(x, z, r + 1.0);

    /**
     * Поставить модель: плоская земля под ней + тугой коллайдер по стволу.
     * Коллайдер идёт по самому стволу (0.3 м), а не по кроне — иначе между
     * деревьями нельзя пробежать. Обводка (shells) добирает точность силуэта.
     */
    const place = (arr, x, z, { s = nextScale(), solid = 0.32, height = 6, kind = 'tree', soft = false, pad = 0, extra = {} } = {}) => {
      // земля под моделью становится ровной; не нашлось места под площадку —
      // модель здесь не появляется
      const h = requestFlat(x, z, Math.max(solid * s + 0.55, pad || STEP * 1.25));
      if (h === null) return null;
      const it = { x, z, h, s, rot: rng() * Math.PI * 2, ...extra };
      arr.push(it);
      const col = { x, z, r: solid * s, height, kind };
      if (soft) col.soft = true;
      this.colliders.push(col);
      it.collider = col;
      return it;
    };

    // выбор места по всему острову, а не только вокруг центра:
    // так заселяются и малые острова
    const scatter = (tries, fn) => {
      for (let i = 0; i < tries; i++) {
        const x = (rng() - 0.5) * SIZE * 0.94;
        const z = (rng() - 0.5) * SIZE * 0.94;
        fn(x, z);
      }
    };

    // камни: на кручах и осыпях, по одному, без грядок
    scatter(14000, (x, z) => {
      if (rocks.length >= 240) return;
      const h = this.heightAt(x, z);
      const slope = this.slopeAt(x, z);
      if (h < 0.6 || h > 26) return;
      if (slope < 0.25 && rng() > 0.2) return;
      if (rng() > 0.45) return;
      const s = 0.45 + rng() * 1.2;
      const ore = s > 0.9 && rng() < 0.035;
      if (!freeSpot(x, z, 0.7 * s)) return;
      // низкие валуны переступаем, поэтому коллайдер чуть уже модели
      place(rocks, x, z, {
        s, solid: 0.62, height: s * 0.95, kind: 'rock', pad: Math.max(1.55, 0.62 * s + 0.5),
        extra: { ore, kind: ore ? 'ore' : 'stone' },
      });
    });

    // пальмы — вдоль берега
    scatter(4200, (x, z) => {
      if (palms.length >= 190) return;
      const h = this.heightAt(x, z);
      if (h < 1.0 || h > 3.6) return;
      const s = nextScale();
      if (!freeSpot(x, z, 0.4 * s)) return;
      place(palms, x, z, { s, solid: 0.3, height: 8, kind: 'palm' });
    });

    // джунгли и редколесье
    scatter(9000, (x, z) => {
      if (trees.length >= 900) return;
      const h = this.heightAt(x, z);
      if (h < 1.8 || h > 16) return;
      const f = forestAt(x, z);
      if (f < 0.42) return;
      if (rng() > 0.62 + f * 0.4) return;
      const s = nextScale();
      if (!freeSpot(x, z, 0.42 * s)) return;
      place(trees, x, z, { s, solid: 0.34, height: 6.5, kind: 'tree' });
    });

    // кусты
    scatter(7000, (x, z) => {
      if (bushes.length >= 700) return;
      const h = this.heightAt(x, z);
      if (h < 1.3 || h > 14) return;
      if (moistureAt(x, z) < 0.42) return;
      const s = nextScale();
      if (!freeSpot(x, z, 0.55 * s)) return;
      // сквозь куст можно пройти: коллайдер мягкий
      place(bushes, x, z, {
        s, solid: 0.42, height: 1.05, kind: 'bush', soft: true,
        extra: { berries: rng() < 0.35, soft: true },
      });
    });

    // сосны — высокогорье, узкая «свеча» из ярусов хвои
    scatter(6000, (x, z) => {
      if (pines.length >= 340) return;
      const h = this.heightAt(x, z);
      if (h < 5.5 || h > 22) return;
      const s = 0.75 + rng() * 0.45;
      if (!freeSpot(x, z, 0.34 * s)) return;
      place(pines, x, z, { s, solid: 0.32, height: 9, kind: 'tree' });
    });

    // мангры — на границе песка и суши, корни-арки над водой
    scatter(6000, (x, z) => {
      if (mangroves.length >= 120) return;
      const h = this.heightAt(x, z);
      if (h < 0.45 || h > 2.4) return;
      const s = 0.85 + rng() * 0.4;
      if (!freeSpot(x, z, 0.4 * s)) return;
      place(mangroves, x, z, { s, solid: 0.3, height: 4, kind: 'tree' });
    });

    // сухостой — там, где сухо и ветрено
    scatter(6000, (x, z) => {
      if (deads.length >= 130) return;
      const h = this.heightAt(x, z);
      if (h < 2.2 || h > 15) return;
      if (moistureAt(x, z) > 0.44) return;
      const s = 0.8 + rng() * 0.5;
      if (!freeSpot(x, z, 0.34 * s)) return;
      place(deads, x, z, { s, solid: 0.32, height: 6, kind: 'tree' });
    });

    // трава — просто украшение, ровнять землю под ней не нужно
    scatter(16000, (x, z) => {
      if (tufts.length >= 2600) return;
      const h = this.heightAt(x, z);
      if (h < 1.4 || h > 15) return;
      if (this.slopeAt(x, z) > 0.85) return;
      tufts.push({ x, z, h, s: 0.6 + rng() * 0.9, rot: rng() * Math.PI * 2 });
    });

    // все заявки на ровную землю — одним проходом
    this._applyFlatSpots();
    for (const d of this.dens) d.y = this.heightAt(d.x, d.z);
    // после выравнивания каждая модель садится точно на свою землю
    for (const list of [palms, trees, pines, mangroves, deads, bushes, rocks]) {
      for (const it of list) it.h = this.heightAt(it.x, it.z);
    }

    // --- материалы ---
    const barkMat = this.textures
      ? createPlantMaterial(this.textures.bark, { sway: 0.005, name: 'bark', repeat: [2, 3] })
      : new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95, flatShading: true });
    const leafMat = this.textures
      ? createPlantMaterial(this.textures.leaf, { sway: 0.013, name: 'leaf', repeat: [2, 2] })
      : new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.9, flatShading: true });
    const grassMat = this.textures
      ? createPlantMaterial(this.textures.grassDetail, { sway: 0.13, name: 'grass' })
      : new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.9, flatShading: true });
    const stoneMat = this.textures
      ? createStoneMaterial(this.textures.rockDetail, { repeat: [1, 1] })
      : new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.85, flatShading: true });

    // кора темнее и серее — не выглядит «пластиковым деревом»
    if (this.textures) barkMat.color.setHex(0x9a8468);
    if (this.textures) leafMat.color.setHex(0xffffff);
    if (this.textures) grassMat.color.setHex(0xffffff);
    if (this.textures) stoneMat.color.setHex(0x9d978e);

    for (const m of [barkMat, leafMat, grassMat]) {
      if (m.userData && m.userData.uniforms) this.windMaterials.push(m);
    }

    const fruitMat = new THREE.MeshStandardMaterial({ color: 0xc23b52, roughness: 0.55, vertexColors: true });
    const mossMat = new THREE.MeshStandardMaterial({ color: 0x7fa257, roughness: 0.95, vertexColors: true, flatShading: true });
    // руда слегка светится в тени — её видно издалека
    const oreMat = new THREE.MeshStandardMaterial({
      color: 0xcfe9f2,
      roughness: 0.32,
      metalness: 0.45,
      vertexColors: true,
      flatShading: true,
      emissive: 0x1d5d74,
      emissiveIntensity: 0.55,
    });
    const layerMaterials = {
      bark: barkMat, leaf: leafMat, rock: stoneMat, fruit: fruitMat, moss: mossMat, ore: oreMat,
    };

    /**
     * Ставит список объектов как InstancedMesh по слоям модели.
     * Каждый объект может состоять из нескольких мешей (ствол + крона),
     * их ссылки хранятся в item.parts — так дерево можно спрятать целиком.
     */
    /**
     * Ставит список объектов как InstancedMesh по слоям модели — по чанкам.
     * Чанк (CHUNK × CHUNK метров) прячется целиком, если его не видно:
     * он за камерой, далеко или вне пирамиды видимости. Далёкие чанки
     * растворяются в тумане, поэтому переход незаметен.
     */
    const buildInstances = (variants, list, {
      castShadow = true, variantOf = null, solidR = 0, cullFar = 340, name = 'veg', lod = null,
    } = {}) => {
      const meshes = [];
      if (!list.length) return meshes;
      const groups = variants.length;
      const dummy = new THREE.Object3D();

      for (let v = 0; v < groups; v++) {
        const variant = variants[v];
        const items = [];

        // габариты варианта: по ним строятся хитбоксы ровно по модели
        let vbox = null;
        for (const geo of Object.values(variant)) {
          if (!geo) continue;
          if (!geo.boundingBox) geo.computeBoundingBox();
          vbox = vbox ? vbox.clone().union(geo.boundingBox) : geo.boundingBox.clone();
        }
        // Твёрдые детали дерева и валуна: отдельные компоненты меша,
        // порезанные по высоте с учётом пересечения самих треугольников.
        // Листва остаётся мягкой, как и раньше; текстура не задаёт объём.
        const solid = name === 'rock' ? [variant.rock] : name === 'bush' ? [] : [variant.bark];
        const shellTop = vbox ? vbox.max.y : 0;
        const hullParts = solid.some(Boolean)
          ? meshSections(solid)
          : hullsFromGeometry(Object.values(variant), {
              pad: 0.02, top: vbox?.max.y, bands: 1,
              maxRadius: solidR ? solidR * 1.1 : undefined,
            });
        const hullLocal = hullParts.length ? hullParts[0].poly : null;

        list.forEach((it, i) => {
          const want = variantOf ? variantOf(it, i) : i % groups;
          if (want === v) items.push(it);
        });
        if (!items.length) continue;

        // --- разбиваем на чанки, чтобы прятать невидимое ---
        const buckets = new Map();
        for (const it of items) {
          const ck = `${Math.floor(it.x / CHUNK)}|${Math.floor(it.z / CHUNK)}`;
          let b = buckets.get(ck);
          if (!b) buckets.set(ck, (b = []));
          b.push(it);
        }

        // LOD: дальняя версия кроны (только у деревьев, там листва тяжёлая)
        const farGeo = (lod && variant.leaf) ? makeCrownProxy(variant.leaf, lod) : null;

        for (const bucket of buckets.values()) {
          const farMeshes = [];
          for (const [layer, geo] of Object.entries(variant)) {
            if (!geo) continue;
            const mat = layerMaterials[layer] || leafMat;
            // для листвы готовим дешёвый дубль: вблизи — полная крона, вдали — прокси
            const useFar = farGeo && layer === 'leaf';
            const mesh = new THREE.InstancedMesh(geo, mat, bucket.length);
            mesh.castShadow = castShadow;
            mesh.receiveShadow = false;
            mesh.frustumCulled = false;
            mesh.name = `${name}:${layer}`;

            bucket.forEach((it, k) => {
              const s = it.s ?? 1;
              dummy.position.set(it.x, it.h - 0.15, it.z);
              dummy.rotation.set(0, it.rot, 0);
              dummy.scale.set(s, s, s);
              dummy.updateMatrix();
              mesh.setMatrixAt(k, dummy.matrix);

              if (!it.bbox && vbox) {
                it.bbox = {
                  w: (vbox.max.x - vbox.min.x) * s,
                  h: (vbox.max.y - vbox.min.y) * s,
                  d: (vbox.max.z - vbox.min.z) * s,
                  minY: vbox.min.y * s,
                };
              }
              // «твёрдая» часть модели: ствол/куст/валун по footprint'у, а не крона
              if (!it.bboxSolid) {
                it.bboxSolid = solidR && vbox
                  ? {
                    w: solidR * 2 * s,
                    h: (vbox.max.y - vbox.min.y) * s,
                    d: solidR * 2 * s,
                    minY: vbox.min.y * s,
                  }
                  : it.bbox;
              }
              if (!it.hullLocal && hullLocal) it.hullLocal = hullLocal;
              if (!it.hulls && hullParts.length) it.hulls = hullParts;
              if (!it.hullY && vbox) it.hullY = { min: vbox.min.y, max: shellTop };
              it.parts = it.parts || [];
              it.parts.push({ mesh, idx: k, baseScale: s, layer });
              it.mesh = mesh;
              it.instIdx = k;
            });
            mesh.instanceMatrix.needsUpdate = true;
            mesh.count = bucket.length;
            // кусок растительности не двигается: матрицу считаем один раз
            mesh.matrixAutoUpdate = false;
            mesh.updateMatrix();
            this.scene.add(mesh);
            meshes.push(mesh);

            // дальний дубль: та же матрица инстансов, дешёвая геометрия
            let farMesh = null;
            if (useFar) {
              farMesh = new THREE.InstancedMesh(farGeo, mat, bucket.length);
              farMesh.castShadow = false;
              farMesh.receiveShadow = false;
              farMesh.frustumCulled = false;
              farMesh.name = `${name}:${layer}:far`;
              farMesh.instanceMatrix = mesh.instanceMatrix;
              farMesh.count = bucket.length;
              farMesh.matrixAutoUpdate = false;
              farMesh.updateMatrix();
              farMesh.visible = false;
              this.scene.add(farMesh);
              farMeshes.push(farMesh);
            }

            // границы чанка — по ним считается видимость
            let cx = 0;
            let cz = 0;
            let maxS = 1;
            for (const it of bucket) { cx += it.x; cz += it.z; maxS = Math.max(maxS, it.s ?? 1); }
            cx /= bucket.length;
            cz /= bucket.length;
            const radius = CHUNK * 0.75 + maxS * 8;
            this.chunkMeshes.push({
              mesh, farMesh, x: cx, z: cz, far: cullFar,
              lodDist: lod ? (lod.dist || 120) : Infinity,
              center: new THREE.Vector3(cx, (vbox ? (vbox.min.y + vbox.max.y) * 0.5 : 4) + 2, cz),
              radius,
            });
          }
        }

        // вариант с ягодами — значит, с этого куста можно собрать урожай
        if (variant.fruit) items.forEach((it) => { it.berries = true; });
        // рудный вариант: другой дроп и название в подсказке
        if (variant.ore) items.forEach((it) => { it.kind = 'ore'; });
      }
      return meshes;
    };

    // варианты моделей
    const palmVariants = [makePalmParts(rng), makePalmParts(rng)];
    const treeVariants = [makeTreeParts(rng), makeTreeParts(rng)];
    const pineVariants = [makePineParts(rng), makePineParts(rng)];
    const mangroveVariants = [makeMangroveParts(rng), makeMangroveParts(rng)];
    const deadVariants = [makeDeadTreeParts(rng)];
    const bushVariants = [makeBushParts(rng, false), makeBushParts(rng, true)];
    const rockVariants = [
      makeRockParts(rng, 'boulder'),
      makeRockParts(rng, 'slab'),
      makeRockParts(rng, 'ore'),
    ];

    this.stats = {
      palms: palms.length, trees: trees.length, pines: pines.length,
      mangroves: mangroves.length, deads: deads.length,
      bushes: bushes.length, rocks: rocks.length, tufts: tufts.length,
    };

    this.palmList = palms;
    // все деревья в одном списке: по нему идут узлы рубки, бот и обводки
    this.treeList = trees.concat(pines, mangroves, deads);
    this.pineList = pines;
    this.mangroveList = mangroves;
    this.deadList = deads;
    this.bushList = bushes;
    this.rockList = rocks;

    // у каждого объекта запоминаем его коллайдер: срубили дерево — обводка исчезла
    const linkColliders = (list) => {
      for (const it of list) {
        it.collider = this.colliders.find(
          (c) => Math.abs(c.x - it.x) < 0.001 && Math.abs(c.z - it.z) < 0.001
        ) || null;
      }
    };
    linkColliders(palms);
    linkColliders(trees);
    linkColliders(pines);
    linkColliders(mangroves);
    linkColliders(deads);
    linkColliders(bushes);
    linkColliders(rocks);

    this.palms = buildInstances(palmVariants, palms, { solidR: 0.3, cullFar: 360, name: 'palm', lod: { dist: 130, blobs: 3 } });
    this.trees = buildInstances(treeVariants, trees, { solidR: 0.34, cullFar: 360, name: 'tree', lod: { dist: 120, blobs: 4 } });
    this.pines = buildInstances(pineVariants, pines, { solidR: 0.32, cullFar: 380, name: 'pine', lod: { dist: 140, blobs: 3 } });
    this.mangroves = buildInstances(mangroveVariants, mangroves, { solidR: 0.3, cullFar: 340, name: 'mangrove', lod: { dist: 120, blobs: 3 } });
    this.deads = buildInstances(deadVariants, deads, { solidR: 0.32, cullFar: 340, name: 'dead' });
    this.bushes = buildInstances(bushVariants, bushes, { solidR: 0.42, cullFar: 220, name: 'bush' });
    // валуны чередуются, а рудный вариант достаётся только рудным камням
    this.rocks = buildInstances(rockVariants, rocks, {
      solidR: 0.7, cullFar: 260, name: 'rock',
      variantOf: (it, i) => (it.ore ? 2 : i % 2 === 0 ? 0 : 1),
    });

    // трава: пучок из нескольких «перьев», качается сильнее всех
    const blades = [];
    for (let i = 0; i < 5; i++) {
      const height = 0.45 + (i % 3) * 0.16;
      const blade = new THREE.ConeGeometry(0.1, height, 3, 1);
      blade.translate((i - 2) * 0.13, height / 2, (i % 2 ? 0.1 : -0.08));
      blades.push(colorize(blade, i % 2 ? 0x86b556 : 0x6f9b45));
    }
    const tuftGeo = mergeGeometries(blades, false);
    this.tufts = buildInstances([{ leaf: tuftGeo }], tufts, { castShadow: false, cullFar: 95, name: 'tuft' });
    this.tuftItems = tufts;
    // у травы свой материал (сильнее качается)
    for (const mesh of this.tufts) mesh.material = grassMat;

    // --- дома зверей, замаскированные окружением ---
    this._buildDens();

    // --- обводки: у каждой модели своя треугольная оболочка по силуэту ---
    this._buildShells();
  }

  /**
   * Обводка каждой модели: выпуклая призма вокруг силуэта.
   * Живой хитбокс сквозь неё не проходит, а край идёт по краю модели —
   * поэтому подойти вплотную можно, а пройти сквозь ствол или валун нет.
   */
  _buildShells() {
    const lists = [
      ['palm', this.palmList], ['tree', this.treeList],
      ['bush', this.bushList], ['rock', this.rockList],
    ];
    for (const [kind, list] of lists) {
      if (!list) continue;
      for (const it of list) {
        if (!it.hullY) continue;
        const s = it.s ?? 1;
        const rot = it.rot || 0;
        const cos = Math.cos(rot);
        const sin = Math.sin(rot);
        const baseY = it.h - 0.15;
        const parts = it.hulls && it.hulls.length
          ? it.hulls
          : (it.hullLocal ? [{ poly: it.hullLocal, minY: it.hullY.min, maxY: it.hullY.max }] : []);
        if (!parts.length) continue;
        it.shells = [];
        for (const hp of parts) {
          const poly = hp.poly.map((p) => ({
            x: it.x + (p.x * cos + p.z * sin) * s,
            z: it.z + (-p.x * sin + p.z * cos) * s,
          }));
          const shell = this.shells.add(kind, poly,
            baseY + hp.minY * s,
            baseY + hp.maxY * s,
            { enabled: () => !it.collider || !it.collider.disabled });
          it.shells.push(shell);
        }
        it.shell = it.shells[0];
        if (it.collider && it.shell && kind !== 'bush') it.collider.meshShell = true;
      }
    }
    this.stats.shells = this.shells.stats.prisms;
  }

  // --- подбираемые вещи ---
  _buildPickups() {
    const rng = this.rng;
    const group = new THREE.Group();
    group.name = 'pickups';
    this.scene.add(group);
    this.pickupGroup = group;

    this.pickupMats = {
      wood: new THREE.MeshStandardMaterial({ color: 0x8a6a42, roughness: 0.9 }),
      stone: new THREE.MeshStandardMaterial({ color: 0x9a958c, roughness: 0.85, flatShading: true }),
      coconut: new THREE.MeshStandardMaterial({ color: 0x6b4a2a, roughness: 0.8, flatShading: true }),
      fiber: new THREE.MeshStandardMaterial({ color: 0x9cae5e, roughness: 0.9 }),
      berry: new THREE.MeshStandardMaterial({ color: 0xb9334a, roughness: 0.6 }),
    };

    this.pickupGeos = makePickupGeometries();
    // все предметы одного вида рисуются одним InstancedMesh: 190 отдельных
    // мешей — это 190 draw call'ов на ровном месте
    this.pickupInstances = {};

    const kinds = [
      { kind: 'wood', name: 'Палка', geo: 'wood', mat: 'wood' },
      { kind: 'stone', name: 'Камень', geo: 'stone', mat: 'stone' },
      { kind: 'fiber', name: 'Волокно', geo: 'fiber', mat: 'fiber' },
      { kind: 'coconut', name: 'Кокос', geo: 'coconut', mat: 'coconut' },
      { kind: 'berries', name: 'Ягоды', geo: 'berries', mat: 'berry' },
    ];
    this.kindInfo = Object.fromEntries(kinds.map((k) => [k.kind, k]));

    let attempts = 0;
    while (this.pickups.length < 190 && attempts < 8000) {
      attempts++;
      const a = rng() * Math.PI * 2;
      const r = Math.sqrt(rng()) * SIZE * 0.36;
      const x = Math.cos(a) * r;
      const z = Math.sin(a) * r;
      const h = this.heightAt(x, z);
      if (h < 1.2 || h > 20) continue;
      if (this.slopeAt(x, z) > 0.6) continue;

      const t = kinds[Math.floor(rng() * kinds.length)];
      if (t.kind === 'coconut' && rng() > 0.35) continue;
      if (t.kind === 'berries' && rng() > 0.6) continue;

      this.addPickup(t.kind, x, z, 0.85 + rng() * 0.35);
    }
  }

  /** Инстанс-меш для вида предмета (создаётся при первом предмете такого вида) */
  _pickupBatch(kind) {
    if (this.pickupInstances[kind]) return this.pickupInstances[kind];
    const info = this.kindInfo[kind];
    const cap = 96;
    const mesh = new THREE.InstancedMesh(this.pickupGeos[info.geo], this.pickupMats[info.mat], cap);
    mesh.castShadow = true;
    mesh.frustumCulled = false;
    mesh.count = 0;
    mesh.matrixAutoUpdate = false;
    mesh.updateMatrix();
    mesh.name = 'pickups-' + kind;
    this.pickupGroup.add(mesh);
    const batch = { mesh, cap, items: [] };
    this.pickupInstances[kind] = batch;
    return batch;
  }

  /** Переложить положения предметов в инстанс-матрицы */
  _refreshPickupBatch(kind) {
    const batch = this.pickupInstances[kind];
    if (!batch) return;
    const n = Math.min(batch.items.length, batch.cap);
    for (let i = 0; i < n; i++) {
      batch.items[i].mesh.updateMatrix();
      batch.mesh.setMatrixAt(i, batch.items[i].mesh.matrix);
    }
    batch.mesh.count = n;
    batch.mesh.instanceMatrix.needsUpdate = true;
  }

  /** Положить предмет на землю (используется и для стартового набора) */
  addPickup(kind, x, z, scale = 1) {
    const info = this.kindInfo[kind];
    if (!info) return null;
    const batch = this._pickupBatch(kind);
    if (batch.items.length >= batch.cap) return null;
    const h = this.heightAt(x, z);
    // «меш» предмета — обычный Object3D: у него те же position/rotation,
    // а рисуется он инстансом вместе с остальными предметами вида
    const mesh = new THREE.Object3D();
    mesh.scale.setScalar(scale);
    mesh.position.set(x, h + 0.22, z);
    mesh.rotation.set((Math.random() - 0.5) * 0.4, Math.random() * Math.PI * 2, (Math.random() - 0.5) * 0.4);
    mesh.updateMatrix();
    mesh.parent = batch.mesh;
    batch.items.push({ mesh });
    const item = { mesh, kind, name: info.name, baseY: h + 0.22 };
    this.pickups.push(item);
    batch.items[batch.items.length - 1].item = item;
    this._refreshPickupBatch(kind);
    return item;
  }

  /**
   * Стартовый набор на берегу: немного ресурсов вокруг точки высадки,
   * чтобы первые минуты не были блужданием по пустому пляжу.
   */
  spawnStarterKit(pos) {
    const kit = ['coconut', 'coconut', 'wood', 'wood', 'fiber', 'stone', 'berries', 'fiber', 'coconut'];
    kit.forEach((kind, i) => {
      const a = (i / kit.length) * Math.PI * 2 + 0.7;
      for (let attempt = 0; attempt < 10; attempt++) {
        const r = 2.6 + attempt * 1.7;
        const x = pos.x + Math.cos(a) * r;
        const z = pos.z + Math.sin(a) * r;
        const h = this.heightAt(x, z);
        if (h > 0.45 && h < 20 && this.slopeAt(x, z) < 0.75) {
          this.addPickup(kind, x, z);
          break;
        }
      }
    });
  }

  /** Погасить или вернуть объект растительности (срубленное дерево, добытый камень) */
  setNodeVisible(item, visible) {
    if (!item || !item.parts || !item.parts.length) return;
    const dummy = this._dummy || (this._dummy = new THREE.Object3D());
    for (const part of item.parts) {
      const target = part.baseScale ?? 1;
      dummy.position.set(item.x, item.h - 0.15, item.z);
      dummy.rotation.set(0, item.rot || 0, 0);
      dummy.scale.setScalar(visible ? target : 0.0001);
      dummy.updateMatrix();
      part.mesh.setMatrixAt(part.idx, dummy.matrix);
      part.mesh.instanceMatrix.needsUpdate = true;
    }
  }

  /** Спрятать/показать один слой модели (например, ягоды на кусте) */
  setLayerVisible(item, layer, visible) {
    if (!item || !item.parts) return;
    const dummy = this._dummy || (this._dummy = new THREE.Object3D());
    for (const part of item.parts) {
      if (part.layer !== layer) continue;
      const target = part.baseScale ?? 1;
      dummy.position.set(item.x, item.h - 0.15, item.z);
      dummy.rotation.set(0, item.rot || 0, 0);
      dummy.scale.setScalar(visible ? target : 0.0001);
      dummy.updateMatrix();
      part.mesh.setMatrixAt(part.idx, dummy.matrix);
      part.mesh.instanceMatrix.needsUpdate = true;
    }
  }

  /** Есть ли у куста слой ягод */
  hasLayer(item, layer) {
    return !!item && !!item.parts && item.parts.some((p) => p.layer === layer);
  }

  /** Ближайший подбираемый предмет в радиусе */
  nearestPickup(pos, reach) {
    let best = null;
    let bestD = reach * reach;
    for (const p of this.pickups) {
      const dx = p.mesh.position.x - pos.x;
      const dz = p.mesh.position.z - pos.z;
      const dy = p.mesh.position.y - pos.y;
      const d = dx * dx + dz * dz + dy * dy * 0.6;
      if (d < bestD) {
        bestD = d;
        best = p;
      }
    }
    return best;
  }

  removePickup(p) {
    p.mesh.parent = null;
    const batch = this.pickupInstances[p.kind];
    if (batch) {
      const j = batch.items.findIndex((b) => b.item === p);
      if (j >= 0) batch.items.splice(j, 1);
      this._refreshPickupBatch(p.kind);
    }
    const i = this.pickups.indexOf(p);
    if (i >= 0) this.pickups.splice(i, 1);
  }

  /**
   * Расталкивание игрока от стволов и валунов.
   * Если передан вектор скорости — убираем её часть «в ствол»,
   * чтобы герой скользил вдоль препятствия, а не залипал в нём.
   */
  // ------------------------------------------------------------
  //  Копание: снимаем один слой земли, песок осыпается, вода заливает
  // ------------------------------------------------------------

  /**
   * Свободно ли место для модели радиусом r. Основания деревьев, кустов и
   * камней — квадратные коробки, поэтому меряем по осям (а не по кругу):
   * так между хитбоксами остаётся честный зазор 5 см даже по диагонали.
   */
  isFree(x, z, r = 0.5, gap = 0.05) {
    for (const c of this.colliders) {
      if (c.disabled) continue;
      const min = c.r + r + gap;
      if (Math.abs(x - c.x) < min && Math.abs(z - c.z) < min) return false;
    }
    return true;
  }

  /** Верхний слой земли в точке: песок, дёрн/земля или камень */
  layerAt(x, z) {
    const h = this.heightAt(x, z);
    if (h < 2.6) return 'sand';
    if (this.slopeAt(x, z) > 0.85) return 'stone';
    return 'soil';
  }

  _digKey(x, z) {
    return `${Math.floor(x / DIG_CELL)},${Math.floor(z / DIG_CELL)}`;
  }

  /** Сколько уже выкопано в этой точке (метры) */
  dugAt(x, z) {
    return this.digStore.get(this._digKey(x, z)) || 0;
  }

  /** Верхний слой клетки до копания: не меняется, пока яма углубляется */
  surfaceOf(x, z) {
    const stored = this.surfaceStore.get(this._digKey(x, z));
    if (stored) return stored;
    const rec = { surface: this.layerAt(x, z), h0: this.heightAt(x, z) };
    this.surfaceStore.set(this._digKey(x, z), rec);
    return rec;
  }

  /**
   * Порода на глубине dug метров от поверхности.
   * Возвращает описание слоя: песчаник → гранит → базальт → обсидиан.
   */
  rockAt(dug, surface = 'soil') {
    const d = surface === 'stone' ? dug : dug - SOIL_THICK;
    if (d < 0) return null;                 // ещё земля/песок
    let acc = 0;
    for (let i = 0; i < STRATA.length; i++) {
      acc += STRATA[i].thick;
      if (d < acc - 1e-6) return STRATA[i];
    }
    return STRATA[STRATA.length - 1];
  }

  /** До какой глубины в этой точке вообще можно копать: земля + камень */
  digCapAt(x, z) {
    return this.surfaceOf(x, z).surface === 'stone' ? STONE_THICK : SOIL_THICK + STONE_THICK;
  }

  /**
   * Что под лопатой прямо сейчас:
   *   surface — что лежит сверху (песок/земля/камень),
   *   layer   — что режется сейчас: 'sand' | 'soil' | 'stone' | 'void',
   *   dug/cap — сколько снято и сколько до пустоты,
   *   stone   — сколько из этого камень.
   * Под землёй всегда камень: это и есть каменный слой, в котором идут шахты.
   */
  probeAt(x, z) {
    const surface = this.surfaceOf(x, z).surface;
    const dug = this.dugAt(x, z);
    const cap = this.digCapAt(x, z);
    let layer;
    if (surface === 'stone') layer = 'stone';
    else if (dug < SOIL_THICK) layer = surface;
    else layer = 'stone';
    if (dug >= cap - 0.001) layer = 'void';
    const rock = layer === 'stone' ? this.rockAt(dug, surface) : null;
    // HP слоя пропорционально оставшейся толщине: повреждение уже хранится в dug.
    const stoneDepth = surface === 'stone' ? dug : Math.max(0, dug - SOIL_THICK);
    const rockIndex = rock ? STRATA.indexOf(rock) : -1;
    const layerStart = rockIndex >= 0 ? STRATA.slice(0, rockIndex).reduce((sum, s) => sum + s.thick, 0) : 0;
    const remaining = rock ? clamp(1 - (stoneDepth - layerStart) / rock.thick, 0, 1) : 0;
    return {
      surface,
      layer,
      dug,
      cap,
      rock,
      rockName: rock ? rock.name : null,
      hardness: rock ? rock.hard : 1,
      hp: rock ? rock.hp * remaining : null,
      maxHp: rock ? rock.hp : null,
      needMine: rock ? rock.mine : 0,
      stone: surface === 'stone' ? dug : Math.max(0, dug - SOIL_THICK),
      bottom: this.heightAt(x, z),
    };
  }

  /** Прочность текущего снимаемого фрагмента отдельной метровой клетки. */
  groundDamageAt(x, z, probe = this.probeAt(x, z)) {
    if (probe.layer === 'void') return null;
    const id = probe.rock?.id || probe.layer;
    const max = probe.rock ? Math.max(5, probe.rock.hp * 0.5) : probe.layer === 'sand' ? 4.5 : 6;
    const saved = this.digDamage.get(this._digKey(x, z));
    const damage = saved && saved.id === id && Math.abs(saved.depth - probe.dug) < 1e-6 ? saved.damage : 0;
    return { id, max, remaining: Math.max(0, max - damage) };
  }

  /** Каждый удар уменьшает прочность; выемка возникает только после разрушения. */
  strikeGround(x, z, { power = 1, mine = 0, creative = false } = {}) {
    const probe = this.probeAt(x, z);
    if (probe.layer === 'void') return { void: true, pending: false };
    if (probe.layer === 'stone' && mine < probe.needMine) return { hard: true, pending: false, rockName: probe.rockName, needMine: probe.needMine };
    const status = this.groundDamageAt(x, z, probe);
    const amount = creative ? status.max : probe.layer === 'stone' ? Math.max(0, mine) : Math.max(0, power);
    const remaining = Math.max(0, status.remaining - amount);
    const key = this._digKey(x, z);
    if (remaining > 0) {
      this.digDamage.set(key, { id: status.id, depth: probe.dug, damage: status.max - remaining });
      return { pending: true, remaining, max: status.max, layer: probe.layer, rock: probe.rock };
    }
    this.digDamage.delete(key);
    return { ...this.dig(x, z, { radius: 0.5, depth: creative ? 0.7 : 0.35, mine }), pending: false };
  }

  /**
   * Снять один слой земли в радиусе. Возвращает
   * { layer, dug, flooded, sandFill, stone } или { hard: true } для камня без кирки.
   * mine — сила кирки: без неё каменный слой не берётся.
   */
  dig(x, z, { radius = 2.0, depth = 0.45, mine = 0 } = {}) {
    if (!this.terrain) return null;
    const key = this._digKey(x, z);
    const probe = this.probeAt(x, z);
    const already = probe.dug;

    if (probe.layer === 'void') {
      return { layer: 'void', void: true, dug: already, flooded: false, hard: false, sandFill: 0, depth: 0 };
    }
    const rock = probe.rock;
    if (probe.layer === 'stone' && mine < (rock ? rock.mine : 1.5)) {
      // порода крепче кирки — не берётся
      return {
        layer: 'stone', dug: already, flooded: false, hard: true, sandFill: 0, depth: 0,
        rock, rockName: rock ? rock.name : 'Камень', needMine: rock ? rock.mine : 1.5,
      };
    }

    // --- разная прочность у разных пород: песчаник крошится легко,
    //     гранит вдвое тяжелее, базальт втрое, обсидиан почти не берётся
    const isStone = probe.layer === 'stone';
    const hard = isStone && rock ? rock.hard : 1;
    const stepDepth = isStone
      ? Math.max(0.05, depth * (mine >= 40 ? 2 : 1) * 10 / (rock ? rock.hp : hard * 10))
      : depth;

    const before = this.heightAt(x, z);
    const newDug = already + stepDepth;
    const topY = this.surfaceOf(x, z).h0;
    const floorY = Math.max(-5, topY - (newDug + 0.25));

    // песок не держит стенку: часть осыпается обратно в яму
    const wetness = this.pitAt(x, z)?.wetness || 0;
    const sandFill = probe.layer === 'sand' ? Math.min(0.2, stepDepth * (0.15 + wetness * 0.08)) : 0;

    this.digStore.set(key, newDug);
    this.digDamage.delete(key);
    this.digEvents++;
    // --- вырезаем яму из рельефа ровно по клеткам сетки ---
    //     высоты узлов не трогаем: край дыры совпадает с линиями сетки,
    //     поэтому ничем не «насаливается» поверх земли
    const pit = this._carvePit(x, z, radius, floorY + sandFill, probe.surface);
    if (pit) {
      const cx = (pit.rect.x0 + pit.rect.x1) / 2;
      const cz = (pit.rect.z0 + pit.rect.z1) / 2;
      this._clearTufts(cx, cz, pit.rect.cells * DIG_CELL * 0.85 + 0.55);
    }

    const after = this.heightAt(x, z);
    const next = this.probeAt(x, z);
    // вода появляется только там, где яма дошла до морской воды —
    // то есть на песчаном пляже, ниже уровня моря. В глубине острова её нет.
    const flooded = probe.surface === 'sand' && after < CONFIG.world.seaLevel - 0.05;
    return {
      layer: probe.layer,
      dug: already + stepDepth,
      step: stepDepth,           // сколько метров породы реально снял удар
      depth: before - after,
      flooded,
      waterSource: flooded ? 'sea' : null,
      hard: false,
      sandFill,
      stone: probe.layer === 'stone',
      rock,
      rockName: rock ? rock.name : null,
      hardness: hard,
      // перегородка рухнула: ямы слились в одну большую дыру
      collapse: !!pit && !!pit.collapsedNow,
      collapsedPits: pit ? pit.collapsedCount || 0 : 0,
      stoneLeft: Math.max(0, next.cap - next.dug),
      void: next.layer === 'void',
      bottom: after,
    };
  }

  /** Высота земли ДО копания: нужна для края ямы и комьев */
  baseHeightAt(x, z) {
    const arr = this.baseHeights || this.heights;
    const gx = clamp((x + SIZE / 2) / STEP, 0, GRID - 1.001);
    const gz = clamp((z + SIZE / 2) / STEP, 0, GRID - 1.001);
    const ix = Math.floor(gx);
    const iz = Math.floor(gz);
    const fx = gx - ix;
    const fz = gz - iz;
    const h00 = arr[iz * GRID + ix];
    const h10 = arr[iz * GRID + ix + 1];
    const h01 = arr[(iz + 1) * GRID + ix];
    const h11 = arr[(iz + 1) * GRID + ix + 1];
    const a = h00 + (h10 - h00) * fx;
    const b = h01 + (h11 - h01) * fx;
    return a + (b - a) * fz;
  }

  /** Ключ клетки сетки (ix, iz) числом: быстрый поиск в Set/Map */
  _cellKey(ix, iz) {
    return ix * 1024 + iz;
  }

  /** Прямоугольник выемки — по метровым клеткам (1..4 на сторону). */
  _pitRect(x, z, radius) {
    const half = SIZE / 2;
    const cells = clamp(Math.round((radius * 2) / DIG_CELL), 1, 4);
    // клетка = квадрат 1 м²; поверхность локально разрезается по её краям
    // яма стоит вокруг точки копания, чтобы под лопатой был отвесный спуск
    const ix0 = clamp(Math.round((x + half) / DIG_CELL - cells / 2), 1, SIZE / DIG_CELL - cells - 1);
    const iz0 = clamp(Math.round((z + half) / DIG_CELL - cells / 2), 1, SIZE / DIG_CELL - cells - 1);
    return {
      cells,
      ix0,
      iz0,
      ix1: ix0 + cells,
      iz1: iz0 + cells,
      x0: -half + ix0 * DIG_CELL,
      x1: -half + (ix0 + cells) * DIG_CELL,
      z0: -half + iz0 * DIG_CELL,
      z1: -half + (iz0 + cells) * DIG_CELL,
    };
  }

  /**
   * Пол ямы под точкой (null — если точки в яме нет). У одной из стенок
   * идут ступени: они и поднимают пол, по ним из ямы выбираются наружу.
   */
  pitFloorAt(x, z) {
    const pits = this.cutPits;
    if (!pits || pits.size === 0) return null;
    const half = SIZE / 2;
    const ix = Math.floor((x + half) / DIG_CELL);
    const iz = Math.floor((z + half) / DIG_CELL);
    if (ix < 0 || iz < 0 || ix >= SIZE / DIG_CELL || iz >= SIZE / DIG_CELL) return null;
    const pit = pits.get(ix * 1024 + iz);
    if (!pit) return null;
    let t;
    if (pit.side === 'n') t = z - pit.z0;
    else if (pit.side === 's') t = pit.z1 - z;
    else if (pit.side === 'w') t = x - pit.x0;
    else t = pit.x1 - x;
    const run = pit.runPerStep || 1;
    const k = Math.max(0, Math.min(pit.steps - 1, pit.steps - 1 - Math.floor(Math.max(0, t) / run)));
    return Math.min(pit.exitY - 0.05, pit.floorY + k * pit.stepH);
  }

  /** Яма, в которой лежит точка (или null) */
  pitAt(x, z) {
    const half = SIZE / 2;
    const ix = Math.floor((x + half) / DIG_CELL);
    const iz = Math.floor((z + half) / DIG_CELL);
    return this.cutPits.get(ix * 1024 + iz) || null;
  }

  /** Пересобрать индекс рельефа без клеток ям — это и есть настоящая дыра */
  _rebuildTerrainIndex() {
    const geo = this.terrain && this.terrain.geometry;
    if (!geo || !this.terrainIndexBase) return 0;
    const rects = Array.from(this.pits.values(), (pit) => pit.rect).filter(Boolean);
    return cutTerrain(geo, this.terrainIndexBase, GRID, STEP, SIZE, rects);
  }

  // Не изменять грубые узлы рельефа, пересекающие уже вырезанные блоки.
  _terrainCellCut(ix, iz) {
    if (!this.cutCells?.size) return false;
    const x0 = Math.floor(ix * STEP / DIG_CELL), x1 = Math.ceil((ix + 1) * STEP / DIG_CELL);
    const z0 = Math.floor(iz * STEP / DIG_CELL), z1 = Math.ceil((iz + 1) * STEP / DIG_CELL);
    for (let x = x0; x < x1; x++) for (let z = z0; z < z1; z++) {
      if (this.cutCells.has(x * 1024 + z)) return true;
    }
    return false;
  }

  /** Убрать яму: её клетки возвращаются рельефу */
  _dropPit(pit) {
    if (!pit) return false;
    let changed = false;
    for (const ck of pit.cells) {
      if (this.cutPits.get(ck) === pit) {
        this.cutPits.delete(ck);
        this.cutCells.delete(ck);
        changed = true;
      }
    }
    if (pit.group) {
      this.pitGroup.remove(pit.group);
      if (pit.walls && pit.walls.geometry) pit.walls.geometry.dispose();
      if (pit.waterMesh) { pit.waterMesh.geometry.dispose(); pit.waterMesh.material.dispose(); }
      if (pit.debris) for (const chunk of pit.debris.children) chunk.geometry.dispose();
      if (pit.mat) pit.mat.dispose();
      if (pit.lumpMat) pit.lumpMat.dispose();
    }
    this.pits.delete(pit.key);
    return changed;
  }

  /** Убрать траву с места, где выкопали яму (иначе травинки висят в воздухе) */
  _clearTufts(x, z, radius) {
    const items = this.tuftItems;
    if (!items || !items.length) return;
    const r2 = (radius * 1.35) ** 2;
    const dummy = new THREE.Object3D();
    for (const it of items) {
      if (it.hidden) continue;
      const dx = it.x - x;
      const dz = it.z - z;
      if (dx * dx + dz * dz > r2) continue;
      it.hidden = true;
      for (const part of it.parts || []) {
        dummy.position.set(it.x, it.h - 0.15, it.z);
        dummy.rotation.set(0, it.rot, 0);
        dummy.scale.setScalar(0.0001);
        dummy.updateMatrix();
        part.mesh.setMatrixAt(part.idx, dummy.matrix);
        part.mesh.instanceMatrix.needsUpdate = true;
      }
    }
  }

  /** Прямоугольник ямы из клеток сетки: мировые координаты и размер */
  _rectBox(r) {
    const half = SIZE / 2;
    return {
      ix0: r.ix0,
      ix1: r.ix1,
      iz0: r.iz0,
      iz1: r.iz1,
      cells: Math.max(r.ix1 - r.ix0, r.iz1 - r.iz0),
      x0: -half + r.ix0 * DIG_CELL,
      x1: -half + r.ix1 * DIG_CELL,
      z0: -half + r.iz0 * DIG_CELL,
      z1: -half + r.iz1 * DIG_CELL,
    };
  }

  /** Касаются ли ямы друг друга (общая стенка или нахлёст клеток) */
  _rectsTouch(a, b) {
    return a.ix0 <= b.ix1 && b.ix0 <= a.ix1 && a.iz0 <= b.iz1 && b.iz0 <= a.iz1;
  }

  /** Это одна и та же яма (тот же прямоугольник) */
  _sameRect(a, b) {
    return a.ix0 === b.ix0 && a.ix1 === b.ix1 && a.iz0 === b.iz0 && a.iz1 === b.iz1;
  }

  /**
   * ВЫКОПАТЬ ЯМУ. Клетки сетки вырезаются из индекса рельефа — в земле
   * появляется настоящая дыра, край которой идёт точно по линиям сетки.
   * Внутрь ставится дно, стенки со слоями пород и ступени, по которым
   * можно вылезти. Высоты узлов рельефа не меняются, поэтому ничего не
   * «насаливается» поверх земли.
   *
   * ОБВАЛ: если рядом (вплотную) уже есть яма, перегородка между ними
   * рушится — обе ямы сливаются в одну большую дыру без внутренней стенки,
   * а пол выравнивается по самой глубокой из них.
   */
  _carvePit(x, z, radius, floorY, surface) {
    if (!this.pitGroup) return null;

    let r = this._pitRect(x, z, radius);
    let floor = floorY;
    let collapsed = 0;

    // --- обвал: подтягиваем все ямы, которые касаются этой (и далее по цепочке)
    const absorbed = new Set();
    let grew = true;
    while (grew) {
      grew = false;
      for (const [, other] of this.pits) {
        if (absorbed.has(other) || !other.rect) continue;
        const o = other.rect;
        if (!this._rectsTouch(r, o)) continue;
        if (this._sameRect(r, o)) continue;         // та же яма — её только углубляем
        const u = {
          ix0: Math.min(r.ix0, o.ix0),
          ix1: Math.max(r.ix1, o.ix1),
          iz0: Math.min(r.iz0, o.iz0),
          iz1: Math.max(r.iz1, o.iz1),
        };
        if (u.ix1 - u.ix0 > MAX_PIT_CELLS || u.iz1 - u.iz0 > MAX_PIT_CELLS) continue;
        r = u;
        floor = Math.min(floor, other.floorY);
        absorbed.add(other);
        collapsed++;
        grew = true;
      }
    }

    const rect = this._rectBox(r);
    const key = `${rect.ix0},${rect.iz0}`;
    const cx = (rect.x0 + rect.x1) / 2;
    const cz = (rect.z0 + rect.z1) / 2;

    // яма с точно таким же прямоугольником — та же дыра, просто глубже
    let pit = null;
    for (const [, other] of this.pits) {
      if (other.rect && this._sameRect(other.rect, rect)) { pit = other; break; }
    }
    if (pit) absorbed.delete(pit);

    let changed = false;
    // Сохраняем приближённый объём воды и сырость при слиянии ям.
    const waterFromOthers = [...absorbed].reduce((n, o) => n + (o.waterDepth || 0) * (o.rect.x1 - o.rect.x0) * (o.rect.z1 - o.rect.z0), 0);
    const wetFromOthers = [...absorbed].reduce((n, o) => Math.max(n, o.wetness || 0), 0);
    for (const o of absorbed) if (this._dropPit(o)) changed = true;

    // ступени выводят к игроку, если он рядом, иначе — туда, где земля ниже
    const out = Math.max(0.8, rect.cells * DIG_CELL * 0.55);
    const cands = [
      { side: 'n', x: cx, z: rect.z0 - out, wx: cx, wz: rect.z0 },
      { side: 's', x: cx, z: rect.z1 + out, wx: cx, wz: rect.z1 },
      { side: 'w', x: rect.x0 - out, z: cz, wx: rect.x0, wz: cz },
      { side: 'e', x: rect.x1 + out, z: cz, wx: rect.x1, wz: cz },
    ];
    for (const c of cands) c.h = this.baseHeightAt(c.x, c.z);
    let pick = null;
    const pp = this.playerPos;
    if (pp) {
      const dx = pp.x - cx;
      const dz = pp.z - cz;
      const d = Math.hypot(dx, dz);
      if (d > 0.4 && d < 14) {
        // ступени — у дальней от героя стены: там, где он копает, получается
        // честная отвесная яма, а не пологий ступенчатый спуск под ногами
        const want = Math.abs(dx) > Math.abs(dz) ? (dx > 0 ? 'w' : 'e') : (dz > 0 ? 'n' : 's');
        pick = cands.find((c) => c.side === want) || null;
      }
    }
    if (!pick) pick = cands.reduce((a, b) => (b.h < a.h ? b : a));

    // верх ступеней — по земле у выхода, чтобы вылезти можно было всегда
    const exitY = this.baseHeightAt(pick.wx, pick.wz);
    const depth = Math.max(0.35, exitY - floor);
    const steps = clamp(Math.ceil(depth / 0.42), 2, 16);
    const stepH = depth / steps;
    const alongX = pick.side === 'n' || pick.side === 's';
    const span = alongX ? rect.z1 - rect.z0 : rect.x1 - rect.x0;
    const stairRun = Math.min(Math.max(1.0, depth * 0.72), span * 0.92);
    const runPerStep = stairRun / steps;

    if (!pit) {
      const wallMat = this.textures
        ? createStoneMaterial(this.textures.rockDetail, { repeat: [1.4, 1.0] })
        : new THREE.MeshStandardMaterial({ roughness: 0.98, flatShading: true });
      wallMat.side = THREE.DoubleSide;
      wallMat.vertexColors = true;
      wallMat.color.setHex(0xffffff);
      const group = new THREE.Group();
      group.name = 'pit';
      const walls = new THREE.Mesh(new THREE.BufferGeometry(), wallMat);
      walls.receiveShadow = true;
      walls.castShadow = false;
      group.add(walls);
      const lumpMat = new THREE.MeshStandardMaterial({ roughness: 1, flatShading: true, color: 0x8a7047 });
      const debris = new THREE.Group();
      for (let i = 0; i < 6; i++) {
        const size = 0.13 + (i % 3) * 0.045;
        debris.add(new THREE.Mesh(new THREE.BoxGeometry(size, size * 0.72, size * 0.9), lumpMat));
      }
      group.add(debris);
      const waterMesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshStandardMaterial({
        color: 0x408ca0, transparent: true, opacity: 0.68, roughness: 0.22,
        metalness: 0.05, depthWrite: false, side: THREE.DoubleSide,
      }));
      waterMesh.rotation.x = -Math.PI / 2;
      waterMesh.visible = false;
      group.add(waterMesh);
      this.pitGroup.add(group);
      pit = { key, group, walls, debris, waterMesh, waterDepth: 0, wetness: 0, debrisMotion: [], mat: wallMat, lumpMat, sig: '', cells: new Set() };
      this.pits.set(key, pit);
    } else if (pit.key !== key) {
      this.pits.delete(pit.key);
      pit.key = key;
      this.pits.set(key, pit);
    }

    // все клетки прямоугольника теперь принадлежат этой яме
    const cells = new Set();
    for (let iz = rect.iz0; iz < rect.iz1; iz++) {
      for (let ix = rect.ix0; ix < rect.ix1; ix++) {
        const ck = ix * 1024 + iz;
        cells.add(ck);
        this.cutPits.set(ck, pit);
        if (!this.cutCells.has(ck)) {
          this.cutCells.add(ck);
          changed = true;
        }
      }
    }
    pit.cells = cells;
    pit.collapsedNow = collapsed > 0;
    pit.collapsedCount = collapsed;
    Object.assign(pit, {
      rect, floorY: floor, exitY, steps, stepH, runPerStep, stairRun, side: pick.side, surface,
      x0: rect.x0, x1: rect.x1, z0: rect.z0, z1: rect.z1,
    });
    if (waterFromOthers) pit.waterDepth += waterFromOthers / ((rect.x1 - rect.x0) * (rect.z1 - rect.z0));
    pit.wetness = Math.max(pit.wetness || 0, wetFromOthers);
    pit.waterMesh.scale.set(rect.x1 - rect.x0, rect.z1 - rect.z0, 1);
    pit.waterMesh.position.set(cx, floor + (pit.waterDepth || 0), cz);
    if (changed) this._rebuildTerrainIndex();

    const sig = `${rect.ix0},${rect.iz0},${rect.ix1},${rect.iz1}|${floor.toFixed(3)}|${pick.side}|${steps}|${surface}`;
    if (pit.sig !== sig) {
      pit.sig = sig;
      this._buildPitGeometry(pit);
    }

    // комья выброшенной земли по краю — уже снаружи дыры
    const chunks = pit.debris.children;
    const halfW = (rect.x1 - rect.x0) / 2 + 0.16;
    const halfD = (rect.z1 - rect.z0) / 2 + 0.16;
    for (let i = 0; i < chunks.length; i++) {
      const a = (i / chunks.length) * Math.PI * 2 + 0.55;
      const px = cx + Math.cos(a) * halfW;
      const pz = cz + Math.sin(a) * halfD;
      chunks[i].position.set(px, this.baseHeightAt(px, pz) + 0.07, pz);
      chunks[i].rotation.y = a * 2.1;
    }
    pit.debrisMotion = [];
    if (collapsed > 0) {
      // Небольшие физические обломки падают внутрь, затем остаются лежать.
      pit.debrisMotion = chunks.map((chunk, i) => {
        const angle = i * Math.PI * 2 / chunks.length;
        chunk.position.set(cx + Math.cos(angle) * (rect.x1 - rect.x0) * 0.32,
          exitY + 0.12 + i * 0.03, cz + Math.sin(angle) * (rect.z1 - rect.z0) * 0.32);
        return { mesh: chunk, vx: -Math.cos(angle) * 0.45, vy: 0.4 + i * 0.08, vz: -Math.sin(angle) * 0.45, active: true };
      });
    }
    pit.group.position.set(0, 0, 0);
    pit.group.visible = true;
    return pit;
  }

  /** Локальная приближённая физика только для существующих ям, с шагом 0,2 с. */
  updatePitPhysics(dt, rain = 0) {
    if (!this.pits.size || !Number.isFinite(dt) || dt <= 0) return;
    this.pitPhysicsAccumulator += dt;
    const step = 0.2;
    while (this.pitPhysicsAccumulator + 1e-9 >= step) {
      this.pitPhysicsAccumulator -= step;
      for (const pit of this.pits.values()) {
        advancePitWater(pit, step, rain, CONFIG.world.seaLevel);
        const rect = pit.rect;
        pit.waterMesh.visible = pit.waterDepth > 0.015;
        pit.waterMesh.position.y = pit.floorY + pit.waterDepth;
        const wet = pit.wetness;
        pit.mat.color.setRGB(1 - wet * 0.17, 1 - wet * 0.15, 1 - wet * 0.1);
        for (const piece of pit.debrisMotion || []) {
          if (!piece.active) continue;
          const p = piece.mesh.position;
          piece.vy -= 9.8 * step;
          p.x = clamp(p.x + piece.vx * step, rect.x0 + 0.08, rect.x1 - 0.08);
          p.z = clamp(p.z + piece.vz * step, rect.z0 + 0.08, rect.z1 - 0.08);
          p.y += piece.vy * step;
          const ground = this.pitFloorAt(p.x, p.z) ?? pit.floorY;
          if (p.y <= ground + 0.08) { p.y = ground + 0.08; piece.active = false; }
          else piece.mesh.rotation.y += step * 1.3;
        }
      }
    }
  }

  /**
   * Дно, стенки и ступени выкопанной ямы.
   * Стенка собрана слоями настоящих пород: дёрн → песчаник → гранит →
   * базальт → обсидиан, поэтому срез ямы видно и понятно, что копаешь.
   */
  _buildPitGeometry(pit) {
    const rect = pit.rect;
    const floorY = pit.floorY;
    const surface = pit.surface;
    const side = pit.side;
    const steps = pit.steps;
    const stepH = pit.stepH;
    const runPerStep = pit.runPerStep;

    const soilTop = new THREE.Color(surface === 'sand' ? 0xd8c193 : surface === 'stone' ? 0xb5aea2 : 0x94764c);
    const soilLow = new THREE.Color(surface === 'sand' ? 0xbda67b : surface === 'stone' ? 0x9c958a : 0x735c3c);

    // полосы среза: от дёрна вниз по породам
    const turf = new THREE.Color(surface === 'sand' ? 0xd9c694 : 0x4e7a34);
    const bands = [
      { d0: 0, d1: 0.14, flat: turf },              // тонкая кромка дёрна/песка
      { d0: 0.14, d1: SOIL_THICK, soil: true },
    ];
    let depthAcc = SOIL_THICK;
    for (const st of STRATA) {
      bands.push({
        d0: depthAcc,
        d1: depthAcc + st.thick,
        a: new THREE.Color(st.top),
        b: new THREE.Color(st.deep),
      });
      depthAcc += st.thick;
    }
    bands.push({ d0: depthAcc, d1: depthAcc + 6, a: new THREE.Color(VOID_COLOR), b: new THREE.Color(VOID_COLOR) });

    // цвет по глубине ниже дёрна: для ступеней и дна
    const toneAt = (dep) => {
      if (dep < 0.14) return turf;
      if (dep < 0.25) return soilTop;
      if (dep < SOIL_THICK) return soilLow;
      for (const st of STRATA) if (dep < st.d0b) return st.tone;
      return new THREE.Color(VOID_COLOR);
    };
    {
      let acc = SOIL_THICK;
      for (const st of STRATA) {
        acc += st.thick;
        st.d0b = acc;                       // глубина низа этой породы
        st.tone = new THREE.Color(st.top);
      }
    }

    const pos = [];
    const col = [];
    const uvs = [];
    const vtx = (px, py, pz, c) => {
      pos.push(px, py, pz);
      col.push(c.r, c.g, c.b);
      uvs.push((px + pz) * 0.55, py * 0.55);
    };
    const quad = (a, b, c, d, tone) => {
      vtx(a[0], a[1], a[2], tone);
      vtx(b[0], b[1], b[2], tone);
      vtx(c[0], c[1], c[2], tone);
      vtx(a[0], a[1], a[2], tone);
      vtx(c[0], c[1], c[2], tone);
      vtx(d[0], d[1], d[2], tone);
    };

    // стенки: срез пород строится по каждой клетке сетки отдельно,
    // верх каждой грани идёт точно по узлам сетки — щелей по краю нет
    const ixN = rect.ix1 - rect.ix0;
    const izN = rect.iz1 - rect.iz0;
    for (let cz = 0; cz < izN; cz++) {
      for (let cx = 0; cx < ixN; cx++) {
        const w0 = rect.x0 + cx * DIG_CELL;
        const w1 = w0 + DIG_CELL;
        const d0 = rect.z0 + cz * DIG_CELL;
        const d1 = d0 + DIG_CELL;
        // только внешний контур ямы: внутри клеток стенок нет,
        // иначе в большой дыре получились бы перегородки
        const sides = [];
        if (cz === 0) sides.push({ ax: w0, az: d0, bx: w1, bz: d0 });
        if (cx === ixN - 1) sides.push({ ax: w1, az: d0, bx: w1, bz: d1 });
        if (cz === izN - 1) sides.push({ ax: w1, az: d1, bx: w0, bz: d1 });
        if (cx === 0) sides.push({ ax: w0, az: d1, bx: w0, bz: d0 });
        for (const sd of sides) {
          // верх стенки повторяет дёрн один в один: щелей по краю дыры нет
          const topA = this.baseHeightAt(sd.ax, sd.az) + 0.02;
          const topB = this.baseHeightAt(sd.bx, sd.bz) + 0.02;
          for (const band of bands) {
            const hiA = Math.min(topA, topA - band.d0);
            const hiB = Math.min(topB, topB - band.d0);
            const lowA = Math.max(floorY, topA - band.d1);
            const lowB = Math.max(floorY, topB - band.d1);
            if (hiA <= floorY + 0.01 && hiB <= floorY + 0.01) break;
            if (hiA <= lowA + 0.005 && hiB <= lowB + 0.005) continue;
            const odd = (cx + cz) % 2 === 0;
            const tone = band.flat ? band.flat : band.soil ? (odd ? soilTop : soilLow) : (odd ? band.a : band.b);
            quad([sd.ax, hiA, sd.az], [sd.bx, hiB, sd.bz], [sd.bx, lowB, sd.bz], [sd.ax, lowA, sd.az], tone);
          }
        }
      }
    }

    // дно
    quad(
      [rect.x0, floorY, rect.z0], [rect.x1, floorY, rect.z0],
      [rect.x1, floorY, rect.z1], [rect.x0, floorY, rect.z1],
      toneAt(pit.exitY - floorY),
    );

    // ступени: у стены выхода — самая высокая, дальше вниз, к полу
    const alongX = side === 'n' || side === 's';
    const wallC = side === 'n' ? rect.z0 : side === 's' ? rect.z1 : side === 'w' ? rect.x0 : rect.x1;
    const dir = side === 'n' || side === 'w' ? 1 : -1;
    const w0 = alongX ? rect.x0 : rect.z0;
    const w1 = alongX ? rect.x1 : rect.z1;
    const spanA = alongX ? rect.z1 - rect.z0 : rect.x1 - rect.x0;
    const P = (u, t, y) => (alongX
      ? [u, y, wallC + dir * Math.min(t, spanA)]
      : [wallC + dir * Math.min(t, spanA), y, u]);

    for (let k = 0; k < steps; k++) {
      const t0 = (steps - 1 - k) * runPerStep;
      if (t0 >= spanA - 1e-3) continue;
      const t1 = Math.min((steps - k) * runPerStep, spanA);
      const y = floorY + k * stepH;
      const tone = toneAt(pit.exitY - (y + stepH * 0.5));
      quad(P(w0, t0, y), P(w1, t0, y), P(w1, t1, y), P(w0, t1, y), tone);
      if (k > 0) {
        const yLow = Math.max(floorY, y - stepH);
        quad(P(w0, t1, y), P(w1, t1, y), P(w1, t1, yLow), P(w0, t1, yLow), toneAt(pit.exitY - yLow));
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geo.computeVertexNormals();
    geo.computeBoundingSphere();
    pit.walls.geometry.dispose();
    pit.walls.geometry = geo;
    pit.mat.color.setHex(0xffffff);
    pit.lumpMat.color.setHex(surface === 'sand' ? 0xc0a97c : 0x866b45);
  }

  /** Копание с учётом соседних клеток: у края ямы глубина меньше */
  dugAtWeighted(x, z) {
    let best = 0;
    const cells = [
      [0, 0, 1], [1, 0, 0.6], [-1, 0, 0.6], [0, 1, 0.6], [0, -1, 0.6],
    ];
    for (const [dx, dz, w] of cells) {
      const k = this._digKey(x + dx * DIG_CELL, z + dz * DIG_CELL);
      const d = this.digStore.get(k);
      if (d) best = Math.max(best, d * w);
    }
    return best;
  }

  /**
   * Выровнять площадку под постройку: узлы сетки в радиусе садятся на одну
   * высоту, к краю — плавный переход. Так костёр, верстак и точило стоят
   * на ровной земле, а не висят на склоне.
   * Возвращает высоту площадки.
   */
  levelSpot(x, z, radius = 1.9, y = null) {
    const half = SIZE / 2;
    const cx = Math.round((x + half) / STEP);
    const cz = Math.round((z + half) / STEP);
    const reach = Math.ceil((radius + STEP * 1.3) / STEP) + 1;
    // средняя высота под площадкой — чтобы не поднимать и не топить её зря
    let sum = 0;
    let count = 0;
    for (let iz = cz - 1; iz <= cz + 1; iz++) {
      for (let ix = cx - 1; ix <= cx + 1; ix++) {
        if (ix < 1 || iz < 1 || ix > GRID - 2 || iz > GRID - 2) continue;
        sum += this.heights[iz * GRID + ix];
        count++;
      }
    }
    const target = y !== null ? y : count ? sum / count : this.heightAt(x, z);
    // Узлы сетки редкие (1.8 м), поэтому ровной площадку делает не радиус,
    // а гарантия, что все узлы под постройкой стоят на одной высоте.
    // Ядро площадки — радиус плюс полшага: тогда уклон по ней строго 0.
    const inner = radius + STEP * 0.62;
    const outer = inner + STEP * 1.1;
    for (let iz = Math.max(1, cz - reach); iz <= Math.min(GRID - 2, cz + reach); iz++) {
      for (let ix = Math.max(1, cx - reach); ix <= Math.min(GRID - 2, cx + reach); ix++) {
        // клетки выкопанных ям не трогаем: иначе дыра «зарастёт» обратно
        if (this._terrainCellCut(ix, iz)) continue;
        const nx = -half + ix * STEP;
        const nz = -half + iz * STEP;
        const d = Math.hypot(nx - x, nz - z);
        if (d > outer) continue;
        const t = d <= inner ? 1 : 1 - smoothstep(inner, outer, d);
        const i = iz * GRID + ix;
        this.heights[i] = this.heights[i] * (1 - t) + target * t;
        if (t >= 1) this.flatCore.add(i);
        // «рельеф до копания» тоже двигаем: край будущей ямы рядом с
        // площадкой должен идти по новой, ровной земле
        if (this.baseHeights) this.baseHeights[i] = this.heights[i];
      }
    }
    this._quantizeSlopes();
    this._applyHeights();
    return target;
  }

  /** Пересчитать вершины рельефа и карту глубин для воды */
  _applyHeights() {
    const geo = this.terrain && this.terrain.geometry;
    if (!geo) return;
    const pos = geo.attributes.position;
    for (let i = 0; i < GRID * GRID; i++) {
      pos.setY(i, this._gridHeightAt(pos.getX(i), pos.getZ(i)));
    }
    pos.needsUpdate = true;
    // После изменения узлов заново интерполируем только рассечённые грани:
    // край ямы продолжает совпадать с треугольниками поверхности.
    if (this.cutCells.size) this._rebuildTerrainIndex();
    else { geo.computeVertexNormals(); geo.computeBoundingSphere(); }

    if (this.depthTexture) {
      const data = this.depthTexture.image.data;
      for (let i = 0; i < this.heights.length; i++) {
        const h = this.heights[i];
        data[i] = Math.max(0, Math.min(255, Math.round(((h + 16) / 44) * 255)));
      }
      this.depthTexture.needsUpdate = true;
    }
  }

  /**
   * Столкновения со стволами, валунами и постройками.
   * feetY — низ героя: низкие валуны (ниже колена) переступаем, а не упираемся.
   */
  resolveCollisions(pos, radius, velocity = null, feetY = -Infinity, stepUp = 0.55) {
    for (const c of this.colliders) {
      if (c.disabled || c.soft || c.meshShell) continue;
      // низкий предмет под ногами — переступаем
      if (c.height && c.height < stepUp && feetY > -Infinity) continue;
      const dx = pos.x - c.x;
      const dz = pos.z - c.z;
      const min = c.r + radius;
      const d2 = dx * dx + dz * dz;
      if (d2 < min * min) {
        const d = Math.sqrt(d2);
        const nx = d > 1e-6 ? dx / d : 1;
        const nz = d > 1e-6 ? dz / d : 0;
        const push = min - d;
        pos.x += nx * push;
        pos.z += nz * push;
        if (velocity) {
          const into = velocity.x * nx + velocity.z * nz;
          if (into < 0) {
            velocity.x -= nx * into;
            velocity.z -= nz * into;
          }
        }
      }
    }
  }

  /**
   * Отсечение растительности по чанкам: невидимые (за камерой, вне пирамиды
   * видимости или слишком далёкие) чанки не рисуются вовсе. Дальние плавно
   * уходят в туман, поэтому «моргания» на границе не видно.
   */
  updateChunks(camera) {
    if (!camera || !this.chunkMeshes.length) return;
    this._frustum = this._frustum || new THREE.Frustum();
    this._proj = this._proj || new THREE.Matrix4();
    this._sphere = this._sphere || new THREE.Sphere();
    this._proj.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
    this._frustum.setFromProjectionMatrix(this._proj);
    const cp = camera.position;
    let visible = 0;
    for (const c of this.chunkMeshes) {
      const dx = c.x - cp.x;
      const dz = c.z - cp.z;
      const d2 = dx * dx + dz * dz;
      let vis = d2 < c.far * c.far;
      if (vis) {
        this._sphere.center.copy(c.center);
        this._sphere.radius = c.radius;
        vis = this._frustum.intersectsSphere(this._sphere);
      }
      c.mesh.visible = vis;
      if (c.farMesh) {
        // вблизи — полная крона, вдали — лёгкий прокси
        const near = d2 < c.lodDist * c.lodDist;
        c.mesh.visible = vis && near;
        c.farMesh.visible = vis && !near;
      }
      if (vis) visible++;
    }
    this.chunkStats = { total: this.chunkMeshes.length, visible };
  }

  update(dt, camera, sunDir, nightFactor, fogColor) {
    this.time += dt;
    for (const mat of this.windMaterials) {
      const u = mat.userData.uniforms;
      if (u && u.uTime) u.uTime.value = this.time;
    }
    this.waterUniforms.uTime.value = this.time;
    this.waterUniforms.uNight.value = nightFactor;
    if (sunDir) this.waterUniforms.uSunDir.value.copy(sunDir);
    if (fogColor) this.waterUniforms.uFog.value.copy(fogColor);
    if (camera && this.waterUniforms) {
      // смотрим ли мы из-под воды: по высоте камеры относительно поверхности
      const x = camera.position.x, z = camera.position.z, t = this.time;
      const wave = Math.sin(x * 0.115 + t * 1.15) * 0.15
        + Math.sin(z * 0.165 - t * 0.9) * 0.11
        + Math.sin((x + z) * 0.055 + t * 0.6) * 0.22
        + Math.sin(Math.hypot(x, z) * 0.22 - t * 1.4) * 0.07;
      this.waterUniforms.uUnder.value = camera.position.y < CONFIG.world.seaLevel + wave ? 1 : 0;
    }

    // лёгкое вращение предметов на земле — их проще заметить
    for (let i = 0; i < this.pickups.length; i++) {
      this.pickups[i].mesh.rotation.y += dt * 0.35;
    }
    // и сразу в инстанс-матрицы (их всего пять — по одной на вид предмета)
    for (const kind in this.pickupInstances) this._refreshPickupBatch(kind);
  }
}
