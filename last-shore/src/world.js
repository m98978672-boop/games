// ============================================================
//  Мир: остров, рельеф, океан, растительность, камни, подбираемые вещи.
// ============================================================

import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { CONFIG, COLORS } from './config.js';
import { fbm, ridged, makeRng, clamp, smoothstep } from './noise.js';

const SIZE = CONFIG.world.size;
const GRID = CONFIG.world.segments + 1; // 201 точка на сторону
const STEP = SIZE / (GRID - 1);

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

// ---------- модели растений ----------

function makePalmGeometry(rng) {
  const parts = [];
  const h = 6.5 + rng() * 3.5;
  const lean = (rng() - 0.5) * 0.35;
  const seg = 7;
  const trunk = new THREE.CylinderGeometry(0.17, 0.32, h, seg, 1);
  addPart(parts, trunk, COLORS.trunk, 0, h / 2, 0, 0, 0, lean * 0.35);

  const topX = Math.sin(lean * 0.35) * h * 0.9;
  const topY = h - 0.15;

  // листья-«перья»
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + rng() * 0.3;
    const len = 2.6 + rng() * 1.6;
    const frond = new THREE.ConeGeometry(0.55, len, 4, 1);
    const geo = frond.clone();
    geo.scale(1, 1, 0.28);
    addPart(
      parts,
      geo,
      i % 2 ? COLORS.frond : COLORS.frondLight,
      topX + Math.cos(a) * len * 0.42,
      topY + 0.1 - 0.25,
      Math.sin(a) * len * 0.42,
      Math.PI / 2 - 0.55,
      -a,
      0
    );
  }
  // кокосы
  for (let i = 0; i < 3; i++) {
    const a = rng() * Math.PI * 2;
    addPart(
      parts,
      new THREE.IcosahedronGeometry(0.22, 0),
      COLORS.coconut,
      topX + Math.cos(a) * 0.3,
      topY - 0.35,
      Math.sin(a) * 0.3
    );
  }
  const merged = mergeGeometries(parts, false);
  merged.computeVertexNormals();
  return merged;
}

function makeTreeGeometry(rng) {
  const parts = [];
  const h = 4.5 + rng() * 5.5;
  const trunk = new THREE.CylinderGeometry(0.28, 0.55, h, 6, 1);
  addPart(parts, trunk, COLORS.trunk, 0, h / 2, 0);

  const crownY = h * 0.78;
  const blobs = 3 + Math.floor(rng() * 3);
  for (let i = 0; i < blobs; i++) {
    const r = 1.9 + rng() * 1.7;
    const a = rng() * Math.PI * 2;
    const d = rng() * 1.5;
    const geo = new THREE.IcosahedronGeometry(r, 0);
    addPart(
      parts,
      geo,
      i % 2 ? COLORS.jungle : 0x4d7a3d,
      Math.cos(a) * d,
      crownY + rng() * 2.2,
      Math.sin(a) * d
    );
  }
  const merged = mergeGeometries(parts, false);
  merged.computeVertexNormals();
  return merged;
}

function makeBushGeometry(rng, withBerries) {
  const parts = [];
  const n = 3 + Math.floor(rng() * 3);
  for (let i = 0; i < n; i++) {
    const r = 0.45 + rng() * 0.45;
    addPart(
      parts,
      new THREE.IcosahedronGeometry(r, 0),
      i % 2 ? COLORS.bush : 0x5a8a46,
      (rng() - 0.5) * 0.9,
      r * 0.7 + rng() * 0.25,
      (rng() - 0.5) * 0.9
    );
  }
  if (withBerries) {
    for (let i = 0; i < 6; i++) {
      addPart(
        parts,
        new THREE.IcosahedronGeometry(0.09, 0),
        COLORS.berry,
        (rng() - 0.5) * 1.1,
        0.5 + rng() * 0.6,
        (rng() - 0.5) * 1.1
      );
    }
  }
  const merged = mergeGeometries(parts, false);
  merged.computeVertexNormals();
  return merged;
}

function makeRockGeometry(rng) {
  const geo = new THREE.IcosahedronGeometry(1, 0);
  jitterGeo(geo, 0.45, rng);
  geo.scale(1, 0.72, 1);
  return colorize(geo, COLORS.stone);
}

// ---------- мир ----------

export class World {
  constructor(scene, seed = CONFIG.world.seed) {
    this.scene = scene;
    this.seed = seed;
    this.rng = makeRng(seed);
    this.heights = new Float32Array(GRID * GRID);
    this.colliders = [];        // { x, z, r }
    this.pickups = [];          // { mesh, kind, name }
    this.time = 0;

    this._buildHeights();
    this._buildTerrain();
    this._buildWater();
    this._buildVegetation();
    this._buildPickups();
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
    }

    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geo.computeVertexNormals();

    const mat = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.96,
      metalness: 0,
    });

    this.terrain = new THREE.Mesh(geo, mat);
    this.terrain.receiveShadow = true;
    this.terrain.castShadow = false;
    this.scene.add(this.terrain);
  }

  _buildWater() {
    const geo = new THREE.PlaneGeometry(SIZE * 1.9, SIZE * 1.9, 110, 110);
    geo.rotateX(-Math.PI / 2);

    this.waterUniforms = {
      uTime: { value: 0 },
      uDeep: { value: new THREE.Color(0x0d4358) },
      uShallow: { value: new THREE.Color(0x2fa3b8) },
      uSunDir: { value: new THREE.Vector3(0.4, 0.8, 0.3) },
      uSunColor: { value: new THREE.Color(0xffe8b0) },
      uFog: { value: new THREE.Color(0x9fc3d6) },
      uNight: { value: 0 },
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
        void main() {
          vec3 pos = position;
          float w = sin(pos.x * 0.12 + uTime * 1.25) * 0.16
                  + sin(pos.z * 0.17 - uTime * 0.95) * 0.12
                  + sin((pos.x + pos.z) * 0.06 + uTime * 0.65) * 0.22;
          pos.y += w;
          vWorldPos = (modelMatrix * vec4(pos, 1.0)).xyz;
          vWave = w;
          gl_Position = projectionMatrix * viewMatrix * vec4(vWorldPos, 1.0);
        }
      `,
      fragmentShader: /* glsl */ `
        uniform vec3 uDeep;
        uniform vec3 uShallow;
        uniform vec3 uSunDir;
        uniform vec3 uSunColor;
        uniform vec3 uFog;
        uniform float uNight;
        uniform float uTime;
        varying vec3 vWorldPos;
        varying float vWave;

        void main() {
          vec3 viewDir = normalize(cameraPosition - vWorldPos);
          float dx = cos(vWorldPos.x * 0.12) * 0.16 * 0.12
                   + cos((vWorldPos.x + vWorldPos.z) * 0.06) * 0.22 * 0.06;
          float dz = -sin(vWorldPos.z * 0.17) * 0.12 * 0.17
                   + cos((vWorldPos.x + vWorldPos.z) * 0.06) * 0.22 * 0.06;
          vec3 n = normalize(vec3(-dx * 9.0, 1.0, -dz * 9.0));

          float fres = pow(1.0 - max(dot(n, viewDir), 0.0), 3.0);
          float diff = max(dot(n, normalize(uSunDir)), 0.0);
          vec3 col = mix(uDeep, uShallow, clamp(0.45 + vWave * 1.1, 0.0, 1.0));
          col += uSunColor * pow(diff, 28.0) * 1.1 * (1.0 - uNight * 0.85);
          col = mix(col, vec3(0.72, 0.84, 0.9), fres * 0.32 * (1.0 - uNight * 0.6));

          float dist = length(cameraPosition - vWorldPos);
          col = mix(col, uFog, clamp((dist - 45.0) / 190.0, 0.0, 0.8));

          gl_FragColor = vec4(col, 0.9);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }
      `,
    });

    this.water = new THREE.Mesh(geo, mat);
    this.water.position.y = CONFIG.world.seaLevel;
    this.water.renderOrder = 2;
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

    const pushOne = (arr, x, z, h, extra) => arr.push({ x, z, h, s: 0.8 + rng() * 0.55, rot: rng() * Math.PI * 2, ...extra });

    // пальмы — вдоль берега
    for (let i = 0; i < 1400; i++) {
      const a = rng() * Math.PI * 2;
      const r = (0.28 + Math.sqrt(rng()) * 0.42) * SIZE * 0.5;
      const x = Math.cos(a) * r;
      const z = Math.sin(a) * r;
      const h = this.heightAt(x, z);
      if (h > 1.0 && h < 3.6 && this.slopeAt(x, z) < 0.5) {
        pushOne(palms, x, z, h);
        this.colliders.push({ x, z, r: 0.38 });
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
      pushOne(trees, x, z, h);
      this.colliders.push({ x, z, r: 0.36 });
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
      pushOne(bushes, x, z, h, { berries: rng() < 0.35 });
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
      if (slope < 0.35 && rng() > 0.25) continue;
      const s = 0.45 + rng() * 1.5;
      pushOne(rocks, x, z, h, { s });
      if (s > 0.8 && rng() < 0.85) this.colliders.push({ x, z, r: s * 0.8 });
      if (rocks.length >= 520) break;
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

    // --- инстансы ---
    const plantMat = new THREE.MeshStandardMaterial({
      vertexColors: true, roughness: 0.9, metalness: 0, flatShading: true,
    });

    const makeInstanced = (geos, list, opts = {}) => {
      if (!list.length) return [];
      return geos.map((geo, idx) => {
        const mesh = new THREE.InstancedMesh(geo, plantMat, Math.ceil((list.length - idx) / geos.length));
        mesh.castShadow = opts.castShadow !== false;
        mesh.receiveShadow = false;
        const dummy = new THREE.Object3D();
        let k = 0;
        for (let i = idx; i < list.length; i += geos.length) {
          const it = list[i];
          dummy.position.set(it.x, it.h - 0.15, it.z);
          dummy.rotation.set(0, it.rot, 0);
          const s = it.s ?? 1;
          dummy.scale.set(s, s, s);
          dummy.updateMatrix();
          mesh.setMatrixAt(k, dummy.matrix);
          // обратная ссылка: по ней можно спрятать конкретное дерево
          it.mesh = mesh;
          it.instIdx = k;
          it.baseMatrix = dummy.matrix.clone();
          it.baseScale = s;
          k++;
        }
        mesh.count = k;
        mesh.frustumCulled = false;
        this.scene.add(mesh);
        return mesh;
      });
    };

    const palmGeos = [makePalmGeometry(rng), makePalmGeometry(rng), makePalmGeometry(rng)];
    const treeGeos = [makeTreeGeometry(rng), makeTreeGeometry(rng), makeTreeGeometry(rng), makeTreeGeometry(rng)];
    const bushGeos = [
      makeBushGeometry(rng, false), makeBushGeometry(rng, true),
      makeBushGeometry(rng, false), makeBushGeometry(rng, true),
    ];
    const rockGeos = [makeRockGeometry(rng), makeRockGeometry(rng), makeRockGeometry(rng)];

    this.stats = {
      palms: palms.length, trees: trees.length, bushes: bushes.length,
      rocks: rocks.length, tufts: tufts.length,
    };

    this.palmList = palms;
    this.treeList = trees;
    this.bushList = bushes;
    this.rockList = rocks;

    this.palms = makeInstanced(palmGeos, palms);
    this.trees = makeInstanced(treeGeos, trees);
    this.bushes = makeInstanced(bushGeos, bushes);
    this.rocks = makeInstanced(rockGeos, rocks);

    // трава: много, без теней
    // пучок травы: три узких «пера» вместо одного конуса
    const blades = [];
    for (let i = 0; i < 3; i++) {
      const blade = new THREE.ConeGeometry(0.13, 0.55 + i * 0.12, 3, 1);
      blade.translate((i - 1) * 0.16, 0.28, (i % 2) * 0.12);
      blades.push(colorize(blade, i === 1 ? 0x74a052 : 0x608c47));
    }
    const tuftGeo = mergeGeometries(blades, false);
    this.tufts = makeInstanced([tuftGeo], tufts, { castShadow: false });
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

    this.pickupGeos = {
      wood: new THREE.CylinderGeometry(0.07, 0.09, 0.95, 5),
      stone: new THREE.IcosahedronGeometry(0.3, 0),
      coconut: new THREE.IcosahedronGeometry(0.24, 1),
      fiber: new THREE.ConeGeometry(0.2, 0.7, 4),
      berry: new THREE.IcosahedronGeometry(0.11, 0),
    };

    const kinds = [
      { kind: 'wood', name: 'Палка', geo: 'wood', mat: 'wood' },
      { kind: 'stone', name: 'Камень', geo: 'stone', mat: 'stone' },
      { kind: 'fiber', name: 'Волокно', geo: 'fiber', mat: 'fiber' },
      { kind: 'coconut', name: 'Кокос', geo: 'coconut', mat: 'coconut' },
      { kind: 'berries', name: 'Ягоды', geo: 'berry', mat: 'berry' },
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
    if (!item || !item.mesh) return;
    const dummy = this._dummy || (this._dummy = new THREE.Object3D());
    const target = item.baseScale ?? 1;
    dummy.position.set(item.x, item.h - 0.15, item.z);
    dummy.rotation.set(0, item.rot || 0, 0);
    dummy.scale.setScalar(visible ? target : 0.0001);
    dummy.updateMatrix();
    item.mesh.setMatrixAt(item.instIdx, dummy.matrix);
    item.mesh.instanceMatrix.needsUpdate = true;
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
  resolveCollisions(pos, radius, velocity = null) {
    for (const c of this.colliders) {
      if (c.disabled) continue;
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
