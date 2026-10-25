// ============================================================
//  Мир: остров, рельеф, океан, растительность, камни, подбираемые вещи.
// ============================================================

import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { CONFIG, COLORS } from './config.js';
import { createTerrainMaterial, createPlantMaterial, createStoneMaterial } from './terrain.js';
import { fbm, ridged, makeRng, clamp, smoothstep } from './noise.js';
import {
  makePalmParts, makeTreeParts, makeBushParts, makeRockParts, makePickupGeometries,
} from './models.js';

const SIZE = CONFIG.world.size;
const GRID = CONFIG.world.segments + 1; // 201 точка на сторону
const STEP = SIZE / (GRID - 1);

// Толщина слоёв под ногами: сначала земля/песок, под ней — камень (тот самый
// каменный слой, в котором идут шахты). Пробив камень насквозь, попадаешь в пустоту.
const SOIL_THICK = 1.35;
const STONE_THICK = 2.4;
const DIG_CELL = 1.4;

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
    this.digEvents = 0;
    this.surfaceStore = new Map();  // чем была клетка до копания: песок/земля/камень
    this.pits = new Map();          // выкопанные лунки: стенки и дно со срезом породы
    this.baseColors = null;     // исходные цвета рельефа (для показа среза породы)
    this.pickups = [];          // { mesh, kind, name }
    this.time = 0;

    this._buildHeights();
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

    return seaH + (landH - seaH) * mass;
  }

  _buildHeights() {
    for (let iz = 0; iz < GRID; iz++) {
      for (let ix = 0; ix < GRID; ix++) {
        const x = -SIZE / 2 + ix * STEP;
        const z = -SIZE / 2 + iz * STEP;
        this.heights[iz * GRID + ix] = this._rawHeight(x, z);
      }
    }
  }

  /** Высота рельефа в мировых координатах (билинейно по сетке) */
  heightAt(x, z) {
    const gx = clamp((x + SIZE / 2) / STEP, 0, GRID - 1.001);
    const gz = clamp((z + SIZE / 2) / STEP, 0, GRID - 1.001);
    const ix = Math.floor(gx);
    const iz = Math.floor(gz);
    const fx = gx - ix;
    const fz = gz - iz;
    const h00 = this.heights[iz * GRID + ix];
    const h10 = this.heights[iz * GRID + ix + 1];
    const h01 = this.heights[(iz + 1) * GRID + ix];
    const h11 = this.heights[(iz + 1) * GRID + ix + 1];
    const a = h00 + (h10 - h00) * fx;
    const b = h01 + (h11 - h01) * fx;
    return a + (b - a) * fz;
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
      c.setHex(COLORS.sandWet);
    } else if (h < 2.15 + moisture * 0.45) {
      c.setHex(COLORS.sand);
    } else if (slope > 0.85 || h > 19) {
      c.setHex(slope > 1.2 ? COLORS.rockDark : COLORS.rock);
    } else if (h > 15) {
      c.lerpColors(new THREE.Color(COLORS.rock), new THREE.Color(COLORS.snow), smoothstep(17, 24, h));
    } else {
      const grass = new THREE.Color(COLORS.grass);
      const jungle = new THREE.Color(COLORS.jungle);
      c.copy(grass).lerp(jungle, clamp((moisture - 0.25) * 1.05, 0, 1));
      // сухая трава на прогалинах
      const dry = fbm(x * 0.021 + 60, z * 0.021 - 12, 3, this.seed + 91);
      if (dry > 0.58) c.lerp(new THREE.Color(0xb2a765), (dry - 0.58) * 1.6);
      // мелкая «пятнистость» травы
      const n = fbm(x * 0.09, z * 0.09, 2, this.seed + 55);
      c.offsetHSL(0, 0, (n - 0.5) * 0.06);
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

  _buildVegetation() {
    const rng = this.rng;
    const palms = [];
    const trees = [];
    const bushes = [];
    const rocks = [];
    const tufts = [];


    const moistureAt = (x, z) => fbm(x * 0.009 + 3, z * 0.009 - 8, 3, this.seed + 31);
    const forestAt = (x, z) => fbm(x * 0.012 - 17, z * 0.012 + 6, 3, this.seed + 44);

    const nextScale = () => 0.8 + rng() * 0.55;
    const pushOne = (arr, x, z, h, extra) => arr.push({ x, z, h, s: 0.8 + rng() * 0.55, rot: rng() * Math.PI * 2, ...extra });

    // зазор между моделями: хитбокс не должен рождаться внутри чужого
    const freeSpot = (x, z, r) => this.isFree(x, z, r);

    // пальмы — вдоль берега
    for (let i = 0; i < 1400; i++) {
      const a = rng() * Math.PI * 2;
      const r = (0.28 + Math.sqrt(rng()) * 0.42) * SIZE * 0.5;
      const x = Math.cos(a) * r;
      const z = Math.sin(a) * r;
      const h = this.heightAt(x, z);
      const s = nextScale();
      if (h > 1.0 && h < 3.6 && this.slopeAt(x, z) < 0.5 && freeSpot(x, z, 0.55 * s)) {
        pushOne(palms, x, z, h, { s });
        this.colliders.push({ x, z, r: 0.55 * s, height: 8, kind: 'palm' });
      }
    }

    // джунгли и редколесье
    for (let i = 0; i < 4000; i++) {
      const a = rng() * Math.PI * 2;
      const r = Math.sqrt(rng()) * SIZE * 0.36;
      const x = Math.cos(a) * r;
      const z = Math.sin(a) * r;
      const h = this.heightAt(x, z);
      if (h < 1.8 || h > 16) continue;
      if (this.slopeAt(x, z) > 0.8) continue;
      const f = forestAt(x, z);
      if (f < 0.42) continue;
      if (rng() > 0.55 + f * 0.4) continue;
      const s = nextScale();
      if (!freeSpot(x, z, 0.55 * s)) continue;
      pushOne(trees, x, z, h, { s });
      this.colliders.push({ x, z, r: 0.55 * s, height: 6.5, kind: 'tree' });
      if (trees.length >= 900) break;
    }

    // кусты
    for (let i = 0; i < 2600; i++) {
      const a = rng() * Math.PI * 2;
      const r = Math.sqrt(rng()) * SIZE * 0.38;
      const x = Math.cos(a) * r;
      const z = Math.sin(a) * r;
      const h = this.heightAt(x, z);
      if (h < 1.3 || h > 14) continue;
      if (this.slopeAt(x, z) > 0.7) continue;
      if (moistureAt(x, z) < 0.42) continue;
      const s = nextScale();
      if (!freeSpot(x, z, 0.95 * s)) continue;
      pushOne(bushes, x, z, h, { s, berries: rng() < 0.35 });
      // куст не мешает ходить, но закрывает обзор мелким зверям
      if (this.colliders.length < 4000) this.colliders.push({ x, z, r: 0.95 * s, height: 1.1, kind: 'bush', soft: true });
      if (bushes.length >= 700) break;
    }

    // камни
    for (let i = 0; i < 4000; i++) {
      const a = rng() * Math.PI * 2;
      const r = Math.sqrt(rng()) * SIZE * 0.4;
      const x = Math.cos(a) * r;
      const z = Math.sin(a) * r;
      const h = this.heightAt(x, z);
      const slope = this.slopeAt(x, z);
      if (h < 0.6 || h > 26) continue;
      // камней на поверхности заметно меньше: они лежат на кручах и осыпях
      if (slope < 0.25 && rng() > 0.12) continue;
      if (rng() > 0.3) continue;
      const s = 0.45 + rng() * 1.2;
      // руда на поверхности — большая редкость: всё ценное ушло под землю
      const ore = s > 0.9 && rng() < 0.035;
      if (!freeSpot(x, z, s * 1.0)) continue;
      pushOne(rocks, x, z, h, { s, ore, kind: ore ? 'ore' : 'stone' });
      this.colliders.push({ x, z, r: s * 1.0, height: s * 1.1, kind: 'rock' });
      if (rocks.length >= 210) break;
    }

    // трава
    for (let i = 0; i < 9000; i++) {
      const a = rng() * Math.PI * 2;
      const r = Math.sqrt(rng()) * SIZE * 0.4;
      const x = Math.cos(a) * r;
      const z = Math.sin(a) * r;
      const h = this.heightAt(x, z);
      if (h < 1.4 || h > 15) continue;
      if (this.slopeAt(x, z) > 0.85) continue;
      tufts.push({ x, z, h, s: 0.6 + rng() * 0.9, rot: rng() * Math.PI * 2 });
      if (tufts.length >= 2600) break;
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
    const buildInstances = (variants, list, { castShadow = true, variantOf = null, solidR = 0 } = {}) => {
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

        list.forEach((it, i) => {
          const want = variantOf ? variantOf(it, i) : i % groups;
          if (want === v) items.push(it);
        });
        if (!items.length) continue;

        for (const [layer, geo] of Object.entries(variant)) {
          if (!geo) continue;
          const mat = layerMaterials[layer] || leafMat;
          const mesh = new THREE.InstancedMesh(geo, mat, items.length);
          mesh.castShadow = castShadow;
          mesh.receiveShadow = false;
          mesh.frustumCulled = false;

          items.forEach((it, k) => {
            const s = it.s ?? 1;
            dummy.position.set(it.x, it.h - 0.15, it.z);
            dummy.rotation.set(0, it.rot, 0);
            dummy.scale.set(s, s, s);
            dummy.updateMatrix();
            mesh.setMatrixAt(k, dummy.matrix);
            mesh.instanceMatrix.needsUpdate = true;

            if (!it.bbox && vbox) {
              it.bbox = {
                w: (vbox.max.x - vbox.min.x) * s,
                h: (vbox.max.y - vbox.min.y) * s,
                d: (vbox.max.z - vbox.min.z) * s,
                minY: vbox.min.y * s,
              };
            }
            // «твёрдая» часть модели: ствол/куст/валун по footprint'у, а не крона.
            // Крона не должна становиться невидимой стеной, а хитбоксы —
            // наезжать друг на друга: footprint уже радиуса расстановки.
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
            it.parts = it.parts || [];
            it.parts.push({ mesh, idx: k, baseScale: s, layer });
            it.mesh = mesh;
            it.instIdx = k;
          });

          mesh.count = items.length;
          this.scene.add(mesh);
          meshes.push(mesh);
        }

        // вариант с ягодами — значит, с этого куста можно собрать урожай
        if (variant.fruit) items.forEach((it) => { it.berries = true; });
        // рудный вариант: другой дроп и название в подсказке
        if (variant.ore) items.forEach((it) => { it.kind = 'ore'; });
      }
      return meshes;
    };

    // варианты моделей
    const palmVariants = [makePalmParts(rng), makePalmParts(rng), makePalmParts(rng)];
    const treeVariants = [makeTreeParts(rng), makeTreeParts(rng), makeTreeParts(rng), makeTreeParts(rng)];
    const bushVariants = [
      makeBushParts(rng, false), makeBushParts(rng, true),
      makeBushParts(rng, false), makeBushParts(rng, true),
    ];
    const rockVariants = [
      makeRockParts(rng, 'boulder'),
      makeRockParts(rng, 'slab'),
      makeRockParts(rng, 'ore'),
    ];

    this.stats = {
      palms: palms.length, trees: trees.length, bushes: bushes.length,
      rocks: rocks.length, tufts: tufts.length,
    };

    this.palmList = palms;
    this.treeList = trees;
    this.bushList = bushes;
    this.rockList = rocks;

    this.palms = buildInstances(palmVariants, palms, { solidR: 0.55 });
    this.trees = buildInstances(treeVariants, trees, { solidR: 0.55 });
    this.bushes = buildInstances(bushVariants, bushes, { solidR: 0.95 });
    // валуны чередуются, а рудный вариант достаётся только рудным камням
    this.rocks = buildInstances(rockVariants, rocks, {
      solidR: 1.0,
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
    this.tufts = buildInstances([{ leaf: tuftGeo }], tufts, { castShadow: false });
    // у травы свой материал (сильнее качается)
    for (const mesh of this.tufts) mesh.material = grassMat;
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

  /** Положить предмет на землю (используется и для стартового набора) */
  addPickup(kind, x, z, scale = 1) {
    const info = this.kindInfo[kind];
    if (!info) return null;
    const h = this.heightAt(x, z);
    const mesh = new THREE.Mesh(this.pickupGeos[info.geo], this.pickupMats[info.mat]);
    mesh.castShadow = true;
    mesh.scale.setScalar(scale);
    mesh.position.set(x, h + 0.22, z);
    mesh.rotation.set((Math.random() - 0.5) * 0.4, Math.random() * Math.PI * 2, (Math.random() - 0.5) * 0.4);
    this.pickupGroup.add(mesh);
    const item = { mesh, kind, name: info.name, baseY: h + 0.22 };
    this.pickups.push(item);
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
    this.pickupGroup.remove(p.mesh);
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
    return {
      surface,
      layer,
      dug,
      cap,
      stone: surface === 'stone' ? dug : Math.max(0, dug - SOIL_THICK),
      bottom: this.heightAt(x, z),
    };
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
    if (probe.layer === 'stone' && mine < 1.5) {
      // камень без кирки не берётся
      return { layer: 'stone', dug: already, flooded: false, hard: true, sandFill: 0, depth: 0 };
    }

    // камень идёт тяжелее и мельче: кирка снимает 0.35 м, креатив — слой целиком
    const isStone = probe.layer === 'stone';
    const stepDepth = isStone
      ? depth * (mine >= 40 ? 0.8 : mine >= 2.5 ? 0.8 : 0.55)
      : depth;

    const before = this.heightAt(x, z);
    const half = SIZE / 2;
    const ix0 = Math.max(1, Math.floor((x - radius + half) / STEP));
    const ix1 = Math.min(GRID - 2, Math.ceil((x + radius + half) / STEP));
    const iz0 = Math.max(1, Math.floor((z - radius + half) / STEP));
    const iz1 = Math.min(GRID - 2, Math.ceil((z + radius + half) / STEP));

    for (let iz = iz0; iz <= iz1; iz++) {
      for (let ix = ix0; ix <= ix1; ix++) {
        const vx = -half + ix * STEP;
        const vz = -half + iz * STEP;
        const d = Math.hypot(vx - x, vz - z);
        if (d > radius) continue;
        // в центре лунки снимаем полный слой, к краям — меньше
        const falloff = d <= STEP * 0.8 ? 1 : 1 - Math.pow((d - STEP * 0.8) / Math.max(0.001, radius - STEP * 0.8), 1.5);
        const k = iz * GRID + ix;
        this.heights[k] = Math.max(-6, this.heights[k] - stepDepth * Math.max(0, falloff));
      }
    }

    // песок не держит стенку: часть осыпается обратно в яму
    let sandFill = 0;
    if (probe.layer === 'sand') {
      let ring = 0;
      let ringCount = 0;
      for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
        const rx = x + Math.cos(a) * (radius + 0.8);
        const rz = z + Math.sin(a) * (radius + 0.8);
        ring += this.heightAt(rx, rz);
        ringCount++;
      }
      const avg = ring / Math.max(1, ringCount);
      const after = this.heightAt(x, z);
      if (avg > after + 0.15) {
        sandFill = Math.min(0.22, (avg - after) * 0.35);
        const lift = Math.min(sandFill, depth);
        for (let iz = iz0; iz <= iz1; iz++) {
          for (let ix = ix0; ix <= ix1; ix++) {
            const vx = -half + ix * STEP;
            const vz = -half + iz * STEP;
            const d = Math.hypot(vx - x, vz - z);
            if (d > radius * 0.75) continue;
            this.heights[iz * GRID + ix] += lift;
          }
        }
      }
    }

    this.digStore.set(key, already + stepDepth);
    this.digEvents++;
    this._applyHeights();
    this._updatePit(x, z, radius, this.surfaceOf(x, z).h0, already + stepDepth, probe.surface);

    const after = this.heightAt(x, z);
    const next = this.probeAt(x, z);
    // вода появляется только там, где яма дошла до морской воды —
    // то есть на песчаном пляже, ниже уровня моря. В глубине острова её нет.
    const flooded = probe.surface === 'sand' && after < CONFIG.world.seaLevel - 0.05;
    return {
      layer: probe.layer,
      dug: already + stepDepth,
      depth: before - after,
      flooded,
      waterSource: flooded ? 'sea' : null,
      hard: false,
      sandFill,
      stone: probe.layer === 'stone',
      stoneLeft: Math.max(0, next.cap - next.dug),
      void: next.layer === 'void',
      bottom: after,
    };
  }

  /**
   * Лунка как модель: стенки и дно со срезом породы.
   * Рельеф — сетка в 1.8 м, одной ямки в пару метров она не покажет,
   * поэтому в яме ставится конус из камня/земли нужной глубины.
   */
  _updatePit(x, z, radius, surfaceH, dug, surface) {
    if (!this.pitGroup) return;
    const key = this._digKey(x, z);
    let pit = this.pits.get(key);
    const depth = Math.max(0.35, dug + 0.15);
    if (!pit) {
      const wallMat = this.textures
        ? createStoneMaterial(this.textures.rockDetail, { repeat: [2.5, 1.6] })
        : new THREE.MeshStandardMaterial({ color: 0x8b8478, roughness: 1, flatShading: true });
      wallMat.side = THREE.DoubleSide;
      wallMat.color = new THREE.Color(surface === 'sand' ? 0xcbb488 : surface === 'stone' ? 0x8f8a80 : 0x96775a);
      const group = new THREE.Group();
      const wall = new THREE.Mesh(new THREE.CylinderGeometry(1, 0.72, 1, 12, 1, true), wallMat);
      const bottom = new THREE.Mesh(new THREE.CircleGeometry(0.74, 12), wallMat);
      bottom.rotation.x = -Math.PI / 2;
      wall.castShadow = false;
      wall.receiveShadow = true;
      bottom.receiveShadow = true;
      group.add(wall, bottom);
      group.position.set(x, surfaceH, z);
      group.renderOrder = 1;
      this.pitGroup.add(group);
      pit = { group, wall, bottom, mat: wallMat, dug: 0 };
      this.pits.set(key, pit);
    }
    pit.dug = dug;
    const r = Math.max(0.9, radius * 0.92);
    pit.wall.scale.set(r, depth, r);
    pit.wall.position.y = -depth / 2 + 0.02;
    pit.bottom.scale.setScalar(r);
    pit.bottom.position.y = -depth + 0.03;
    // чем глубже, тем темнее и «каменнее» срез
    const rock = dug > SOIL_THICK;
    const tint = rock ? 0x7d766a : surface === 'sand' ? 0xc0a985 : 0x7d6446;
    pit.mat.color.setHex(tint);
    pit.mat.roughness = rock ? 0.9 : 1;
  }

  /** Пересчитать вершины рельефа и карту глубин для воды */
  _applyHeights() {
    const geo = this.terrain && this.terrain.geometry;
    if (!geo) return;
    const pos = geo.attributes.position;
    const col = geo.attributes.color;
    const base = this.baseColors;
    const soilCut = new THREE.Color(0x6a5334);
    const rockCut = new THREE.Color(0x7d766a);
    const darkCut = new THREE.Color(0x4a463f);
    const tmp = new THREE.Color();
    const needColor = !!(col && base);
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      pos.setY(i, this.heightAt(x, z));
      // у выкопанной лунки показываем срез породы: земля -> камень -> темнота
      if (needColor) {
        const dug = this.dugAt(x, z);
        if (dug > 0.4) {
          const k = clamp((dug - 0.4) / 1.1, 0, 1);
          tmp.setRGB(base[i * 3], base[i * 3 + 1], base[i * 3 + 2]);
          if (dug < SOIL_THICK) tmp.lerp(soilCut, k * 0.75);
          else if (dug < SOIL_THICK + STONE_THICK * 0.72) {
            tmp.lerp(rockCut, clamp(0.55 + (dug - SOIL_THICK) * 0.4, 0, 1));
          } else {
            tmp.copy(rockCut).lerp(darkCut, clamp((dug - SOIL_THICK - STONE_THICK * 0.72) * 1.4, 0, 1));
          }
          col.setXYZ(i, tmp.r, tmp.g, tmp.b);
        } else if (col.getX(i) !== base[i * 3]) {
          col.setXYZ(i, base[i * 3], base[i * 3 + 1], base[i * 3 + 2]);
        }
      }
    }
    pos.needsUpdate = true;
    if (col) col.needsUpdate = true;
    geo.computeVertexNormals();
    geo.computeBoundingSphere();

    if (this.depthTexture) {
      const data = this.depthTexture.image.data;
      for (let i = 0; i < this.heights.length; i++) {
        const h = this.heights[i];
        data[i] = Math.max(0, Math.min(255, Math.round(((h + 16) / 44) * 255)));
      }
      this.depthTexture.needsUpdate = true;
    }
  }

  resolveCollisions(pos, radius, velocity = null) {
    for (const c of this.colliders) {
      if (c.disabled || c.soft) continue;
      const dx = pos.x - c.x;
      const dz = pos.z - c.z;
      const min = c.r + radius;
      const d2 = dx * dx + dz * dz;
      if (d2 < min * min && d2 > 1e-6) {
        const d = Math.sqrt(d2);
        const nx = dx / d;
        const nz = dz / d;
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

    // лёгкое вращение предметов на земле — их проще заметить
    for (let i = 0; i < this.pickups.length; i++) {
      const p = this.pickups[i];
      p.mesh.rotation.y += dt * 0.35;
    }
  }
}
