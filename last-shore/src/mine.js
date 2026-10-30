// ============================================================
//  Подземелье: два слоя под островом.
//    1) каменный слой — прямо под травой: руды, жилы, коридоры;
//    2) глубинный слой — под камнем: магма, лава и драгоценные
//       жилы (кристаллы, обсидиан) — там их куда больше.
//
//  Мир под землёй — сетка клеток. Открытые клетки — коридоры,
//  закрытые — стены, которые пробиваются киркой: за ними руда.
//  Стены и вкрапления — InstancedMesh, поэтому пробитую клетку
//  можно честно убрать из кадра, а не оставить «призрак».
// ============================================================

import * as THREE from 'three';
import { makeRng, clamp } from './noise.js';

const CELL = 3.6;          // размер клетки, м
const W = 34;              // клеток по стороне
const HALF = (W * CELL) / 2;
const WALL_H = 3.2;        // высота коридора
const LEVEL_DEPTH = [-16, -48];

// что выпадает из жилы
const VEIN_DROPS = {
  stone: {},
  ore: { ironOre: [1, 3], flint: [0, 1] },
  crystal: { crystal: [1, 2], ironOre: [0, 1] },
  obsidian: { obsidian: [1, 2], crystal: [0, 1] },
};

export const VEIN_HP = Object.freeze({ stone: 2.6, ore: 3.4, crystal: 3.8, obsidian: 4.2 });

export class Mine {
  constructor(scene, world, seed = 1) {
    this.scene = scene;
    this.world = world;
    this.rng = makeRng(seed + 90210);
    this.group = new THREE.Group();
    this.group.name = 'mine';
    this.group.visible = false;
    scene.add(this.group);

    this.levels = [];
    this.active = null;
    this.time = 0;
    this.entrances = [];
    this.currentEntrance = null;

    this._buildLevel(0);
    this._buildLevel(1);
    this._buildEntrances();
  }

  _cellKey(cx, cz) {
    return cz * W + cx;
  }

  // ------------------------------------------------------------
  //  Генерация
  // ------------------------------------------------------------

  _buildLevel(index) {
    const rng = this.rng;
    const deep = index === 1;
    const grid = new Array(W * W).fill(null);

    const setOpen = (cx, cz) => {
      if (cx < 1 || cz < 1 || cx >= W - 1 || cz >= W - 1) return;
      const k = this._cellKey(cx, cz);
      if (!grid[k]) grid[k] = { open: true, type: 'air' };
    };

    const startX = Math.floor(W / 2);
    const startZ = Math.floor(W / 2);
    const room = (cx, cz, r) => {
      for (let dz = -r; dz <= r; dz++) {
        for (let dx = -r; dx <= r; dx++) setOpen(cx + dx, cz + dz);
      }
    };
    room(startX, startZ, 2);

    const walkers = deep ? 6 : 5;
    const steps = deep ? 560 : 440;
    for (let w = 0; w < walkers; w++) {
      let cx = startX;
      let cz = startZ;
      let dir = Math.floor(rng() * 4);
      for (let i = 0; i < steps; i++) {
        if (rng() < 0.22) dir = (dir + (rng() < 0.5 ? 1 : 3)) % 4;
        const dx = dir === 0 ? 1 : dir === 1 ? -1 : 0;
        const dz = dir === 2 ? 1 : dir === 3 ? -1 : 0;
        cx = clamp(cx + dx, 1, W - 2);
        cz = clamp(cz + dz, 1, W - 2);
        setOpen(cx, cz);
        if (rng() < 0.4) setOpen(cx + (rng() < 0.5 ? 1 : 0), cz + (rng() < 0.5 ? 1 : 0));
      }
    }
    for (let i = 0; i < (deep ? 4 : 3); i++) {
      room(3 + Math.floor(rng() * (W - 6)), 3 + Math.floor(rng() * (W - 6)), 1 + Math.floor(rng() * 2));
    }

    const level = {
      index, deep, y: LEVEL_DEPTH[index], grid,
      veins: new Map(), wallHP: new Map(), start: { cx: startX, cz: startZ }, meshes: [],
    };

    // найти жилы: закрытые клетки, прилегающие к коридору
    for (let cz = 1; cz < W - 1; cz++) {
      for (let cx = 1; cx < W - 1; cx++) {
        const k = this._cellKey(cx, cz);
        if (grid[k]) continue;
        const nearOpen = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dz]) => {
          const n = grid[this._cellKey(cx + dx, cz + dz)];
          return n && n.open;
        });
        if (!nearOpen) continue;
        const roll = rng();
        let type = 'stone';
        if (deep) {
          if (roll < 0.3) type = 'ore';
          else if (roll < 0.46) type = 'crystal';
          else if (roll < 0.55) type = 'obsidian';
        } else if (roll < 0.2) type = 'ore';
        else if (roll < 0.23) type = 'crystal';
        level.veins.set(k, { cx, cz, type, hp: VEIN_HP[type] });
      }
    }

    // лавовые озёра в глубинном слое
    if (deep) {
      let lava = 0;
      for (let cz = 2; cz < W - 2 && lava < 30; cz++) {
        for (let cx = 2; cx < W - 2 && lava < 30; cx++) {
          const cell = grid[this._cellKey(cx, cz)];
          if (!cell || !cell.open) continue;
          if (rng() < 0.17) { cell.type = 'lava'; lava++; }
        }
      }
    }

    this.levels.push(level);
    this._renderLevel(level);
  }

  // ------------------------------------------------------------
  //  Геометрия слоя
  // ------------------------------------------------------------

  _worldX(cx) { return cx * CELL - HALF + CELL / 2; }
  _worldZ(cz) { return cz * CELL - HALF + CELL / 2; }

  _renderLevel(level) {
    const rng = this.rng;
    const y = level.y;
    const floors = [];
    const ceilings = [];
    const lavas = [];

    const box = (w, h, d, x, yy, z, color) => {
      const g = new THREE.BoxGeometry(w, h, d);
      g.translate(x, yy, z);
      return { geo: g, color };
    };

    for (let cz = 0; cz < W; cz++) {
      for (let cx = 0; cx < W; cx++) {
        const cell = level.grid[this._cellKey(cx, cz)];
        if (!cell || !cell.open) continue;
        const x = this._worldX(cx);
        const z = this._worldZ(cz);
        const tone = (level.hell ? 0x8b514b : 0xffffff) - Math.floor(rng() * 5) * 0x050505;
        if (cell.type === 'lava') {
          lavas.push(box(CELL, 0.3, CELL, x, y - 0.16, z, 0xff8a3a));
        } else {
          floors.push(box(CELL, 0.36, CELL, x, y - 0.2, z, tone));
        }
        ceilings.push(box(CELL, 0.4, CELL, x, y + WALL_H, z, (level.hell ? 0x704039 : 0x8f8a80) - Math.floor(rng() * 3) * 0x040404));
      }
    }

    const flatMat = (opts) => new THREE.MeshStandardMaterial({ roughness: 0.96, metalness: 0.02, flatShading: true, ...opts });
    const rockMat = flatMat({ color: 0xffffff });
    const ceilMat = flatMat({ color: 0x8f8a80 });
    const lavaMat = new THREE.MeshStandardMaterial({
      color: 0xff8a3a, emissive: 0xff4d12, emissiveIntensity: 1.6, roughness: 0.5, flatShading: true,
    });

    const merged = (list, material, name) => {
      if (!list.length) return null;
      const byColor = new Map();
      for (const { geo, color } of list) {
        if (!byColor.has(color)) byColor.set(color, []);
        byColor.get(color).push(geo);
      }
      const group = new THREE.Group();
      group.name = name;
      for (const [color, geos] of byColor) {
        const g = mergeGeo(geos);
        if (!g) continue;
        const m = g && new THREE.Mesh(g, material.clone());
        m.material.color = new THREE.Color(color);
        m.receiveShadow = true;
        m.frustumCulled = false;
        group.add(m);
      }
      level.meshes.push(group);
      this.group.add(group);
      return group;
    };

    level.floorGroup = merged(floors, rockMat, 'floor');
    level.ceilingGroup = merged(ceilings, ceilMat, 'ceiling');
    level.lavaGroup = merged(lavas, lavaMat, 'lava');
    level.lavaMat = lavaMat;

    // --- стены: InstancedMesh, по одному блоку на жилу ---
    const veinList = [...level.veins.values()];
    const wallGeo = new THREE.BoxGeometry(CELL, WALL_H, CELL);
    const wallMesh = new THREE.InstancedMesh(wallGeo, flatMat({ color: level.hell ? 0x6d3a35 : level.deep ? 0x9a8f84 : 0xb3ab9c }), Math.max(1, veinList.length));
    wallMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    wallMesh.frustumCulled = false;
    wallMesh.receiveShadow = true;
    wallMesh.name = 'mine-walls';
    const dummy = new THREE.Object3D();
    level.wallIndex = new Map();
    veinList.forEach((vein, i) => {
      dummy.position.set(this._worldX(vein.cx), y + WALL_H / 2, this._worldZ(vein.cz));
      dummy.rotation.set(0, 0, 0);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      wallMesh.setMatrixAt(i, dummy.matrix);
      level.wallIndex.set(this._cellKey(vein.cx, vein.cz), i);
    });
    wallMesh.count = veinList.length;
    wallMesh.instanceMatrix.needsUpdate = true;
    this.group.add(wallMesh);
    level.wallMesh = wallMesh;
    level.meshes.push(wallMesh);

    // --- вкрапления руды на стенах: тоже инстансами, чтобы гасить вместе со стеной ---
    const gemGeo = new THREE.OctahedronGeometry(0.22, 0);
    const gemMat = new THREE.MeshStandardMaterial({
      color: 0xffffff, emissive: 0x2b8fa0, emissiveIntensity: 1.1, roughness: 0.3, metalness: 0.25, flatShading: true,
    });
    const perVein = 3;
    const gems = new THREE.InstancedMesh(gemGeo, gemMat, Math.max(1, veinList.length * perVein));
    gems.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    gems.frustumCulled = false;
    const gemColors = {
      ore: new THREE.Color(0x8fb8cc),
      crystal: new THREE.Color(0x62e6d8),
      obsidian: new THREE.Color(0xa16ff0),
      stone: new THREE.Color(0x8b8478),
    };
    level.gemIndex = new Map();
    let gi = 0;
    veinList.forEach((vein) => {
      const idxs = [];
      const tx = this._worldX(vein.cx);
      const tz = this._worldZ(vein.cz);
      for (let i = 0; i < perVein; i++) {
        const a = rng() * Math.PI * 2;
        const r = CELL * (0.28 + rng() * 0.14);
        dummy.position.set(tx + Math.cos(a) * r, y + 0.6 + rng() * 2.1, tz + Math.sin(a) * r);
        dummy.rotation.set(rng() * 3, rng() * 3, rng() * 3);
        dummy.scale.set(1, 1.5 + rng() * 0.6, 1);
        dummy.updateMatrix();
        gems.setMatrixAt(gi, dummy.matrix);
        gems.setColorAt(gi, gemColors[vein.type] || gemColors.stone);
        idxs.push(gi);
        gi++;
      }
      level.gemIndex.set(this._cellKey(vein.cx, vein.cz), idxs);
    });
    gems.count = gi;
    gems.instanceMatrix.needsUpdate = true;
    if (gems.instanceColor) gems.instanceColor.needsUpdate = true;
    this.group.add(gems);
    level.gemMesh = gems;
    level.meshes.push(gems);

    // --- пыль в воздухе: шахта не должна выглядеть мёртвой ---
    const dustCount = level.deep ? 220 : 160;
    const dustPos = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount; i++) {
      dustPos[i * 3] = (rng() - 0.5) * W * CELL;
      dustPos[i * 3 + 1] = y + rng() * WALL_H;
      dustPos[i * 3 + 2] = (rng() - 0.5) * W * CELL;
    }
    const dustGeo = new THREE.BufferGeometry();
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
    const dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({
      color: level.deep ? 0xffb070 : 0xd8d2c2,
      size: 0.07, transparent: true, opacity: 0.5, depthWrite: false, sizeAttenuation: true,
    }));
    dust.frustumCulled = false;
    dust.name = 'mine-dust';
    this.group.add(dust);
    level.dust = dust;
    level.meshes.push(dust);

    // --- настенные факелы: тёплые пятна света и живое пламя ---
    const torches = [];
    const openCells = [];
    for (let cz = 2; cz < W - 2; cz += 1) {
      for (let cx = 2; cx < W - 2; cx += 1) {
        const cell = level.grid[this._cellKey(cx, cz)];
        if (cell && cell.open && cell.type !== 'lava') openCells.push({ cx, cz });
      }
    }
    const torchCount = Math.min(level.deep ? 7 : 5, openCells.length);
    for (let i = 0; i < torchCount; i++) {
      const cell = openCells[Math.floor(rng() * openCells.length)];
      if (!cell) continue;
      const tx = this._worldX(cell.cx);
      const tz = this._worldZ(cell.cz);
      const torch = new THREE.Group();
      const stick = new THREE.Mesh(
        new THREE.BoxGeometry(0.08, 0.7, 0.08),
        new THREE.MeshStandardMaterial({ color: 0x6f5233, roughness: 1, flatShading: true })
      );
      stick.position.y = 1.5;
      torch.add(stick);
      const flame = new THREE.Mesh(
        new THREE.ConeGeometry(0.13, 0.34, 5),
        new THREE.MeshBasicMaterial({ color: 0xffb457 })
      );
      flame.position.y = 1.94;
      torch.add(flame);
      const light = new THREE.PointLight(0xffa552, 1.5, 11, 2);
      light.position.y = 1.95;
      torch.add(light);
      torch.position.set(tx + CELL * 0.3, y, tz + CELL * 0.3);
      this.group.add(torch);
      level.meshes.push(torch);
      torches.push({ torch, flame, light, phase: rng() * 10 });
    }
    level.torches = torches;

    // свет у входа в слой
    const light = new THREE.PointLight(level.deep ? 0xff8a4a : 0xa8c8e8, level.deep ? 1.6 : 1.0, 30, 2);
    light.position.set(this._worldX(level.start.cx), y + 2.4, this._worldZ(level.start.cz));
    this.group.add(light);
    level.light = light;
    level.meshes.push(light);

    // лестница наверх/вниз — видимый ориентир
    const ladder = new THREE.Group();
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x7a5a34, roughness: 0.95, flatShading: true });
    for (let i = 0; i < 5; i++) {
      const rung = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.12, 0.16), woodMat);
      rung.position.set(0, 0.4 + i * 0.55, 0);
      ladder.add(rung);
    }
    for (const side of [-1, 1]) {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(0.14, 3, 0.14), woodMat);
      rail.position.set(side * 0.58, 1.5, 0);
      ladder.add(rail);
    }
    ladder.position.set(this._worldX(level.start.cx), y, this._worldZ(level.start.cz) + 1.2);
    this.group.add(ladder);
    level.ladder = ladder;
    level.meshes.push(ladder);
    level.lightPos = { x: ladder.position.x, z: ladder.position.z - 1.2 };
  }

  _buildEntrances() {
    const world = this.world;
    const spots = [];
    for (let attempt = 0; attempt < 6000 && spots.length < 3; attempt++) {
      const a = this.rng() * Math.PI * 2;
      const r = 25 + this.rng() * 85;
      const x = Math.cos(a) * r;
      const z = Math.sin(a) * r;
      const h = world.heightAt(x, z);
      if (h < 2 || h > 16) continue;
      if (world.slopeAt(x, z) > 0.45) continue;
      if (spots.some((s) => Math.hypot(s.x - x, s.z - z) < 55)) continue;
      // арка не должна стоять в дереве или камне: вокруг 3.2 м свободны
      if (typeof world.isFree === 'function' && !world.isFree(x, z, 3.2)) continue;
      spots.push({ x, z, h });
    }

    const stoneMat = new THREE.MeshStandardMaterial({ color: 0x8b8478, roughness: 0.95, flatShading: true });
    const darkMat = new THREE.MeshStandardMaterial({ color: 0x08090a, roughness: 1 });

    const ground = new THREE.Group();
    ground.name = 'mine-entrances';
    this.scene.add(ground);
    this.entranceGroup = ground;

    for (const spot of spots) {
      const group = new THREE.Group();
      group.position.set(spot.x, spot.h, spot.z);

      const hole = new THREE.Mesh(new THREE.CircleGeometry(1.4, 14), darkMat);
      hole.rotation.x = -Math.PI / 2;
      hole.position.y = 0.025;
      group.add(hole);

      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        if (Math.sin(a) > 0.45) continue;
        const block = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.85 + Math.random() * 0.5, 0.6), stoneMat);
        block.position.set(Math.cos(a) * 1.8, 0.42 + Math.random() * 0.2, Math.sin(a) * 1.8);
        block.rotation.y = Math.random() * Math.PI;
        block.castShadow = true;
        group.add(block);
      }
      for (const side of [-1, 1]) {
        const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.7, 2.7, 0.7), stoneMat);
        pillar.position.set(side * 1.8, 1.35, 0);
        pillar.rotation.y = Math.random() * 0.2;
        pillar.castShadow = true;
        group.add(pillar);
      }
      const beam = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.45, 0.8), stoneMat);
      beam.position.y = 2.85;
      group.add(beam);

      // дымка над входом: видно издалека, куда идти
      const beacon = new THREE.Mesh(
        new THREE.CylinderGeometry(0.35, 1.1, 14, 8, 1, true),
        new THREE.MeshBasicMaterial({ color: 0xffd8a0, transparent: true, opacity: 0.09, side: THREE.DoubleSide, depthWrite: false })
      );
      beacon.position.y = 9;
      group.add(beacon);
      group.userData.beacon = beacon;

      ground.add(group);
      group.visible = true;          // вход виден и снаружи
      this.entrances.push({ x: spot.x, z: spot.z, y: spot.h, group });
      world.colliders.push({ x: spot.x, z: spot.z, r: 1.5, height: 3, kind: 'mine', soft: true });
    }
  }

  // ------------------------------------------------------------
  //  Переходы
  // ------------------------------------------------------------

  enter(index = 0, entrance = null) {
    this.active = index;
    this.currentEntrance = entrance || this.currentEntrance || this.entrances[0] || null;
    this.group.visible = true;
    for (const e of this.entrances) if (e.group) e.group.visible = false;
    for (let i = 0; i < this.levels.length; i++) {
      const lvl = this.levels[i];
      const on = i === index;
      for (const m of lvl.meshes) m.visible = on;
    }
    const lvl = this.levels[index];
    return { x: this._worldX(lvl.start.cx), y: lvl.y, z: this._worldZ(lvl.start.cz) + 0.6 };
  }

  /**
   * Вход в шахту из выкопанного хода: ищем ближайшую открытую клетку
   * каменного слоя к точке на поверхности и ставим героя туда.
   */
  enterNear(x, z, index = 0) {
    const lvl = this.levels[index];
    if (!lvl) return this.enter(index, null);
    const cx0 = Math.round((x + HALF - CELL / 2) / CELL);
    const cz0 = Math.round((z + HALF - CELL / 2) / CELL);
    let best = null;
    let bestD = Infinity;
    for (let cz = 1; cz < W - 1; cz++) {
      for (let cx = 1; cx < W - 1; cx++) {
        const cell = lvl.grid[this._cellKey(cx, cz)];
        if (!cell || !cell.open) continue;
        const d = Math.hypot(cx - cx0, cz - cz0);
        if (d < bestD) { bestD = d; best = { cx, cz }; }
      }
    }
    const entrance = this.currentEntrance || this.entrances[0] || null;
    this.enter(index, entrance);
    if (!best) return { x: this._worldX(lvl.start.cx), y: lvl.y, z: this._worldZ(lvl.start.cz) + 0.6 };
    return { x: this._worldX(best.cx), y: lvl.y, z: this._worldZ(best.cz) };
  }

  leave() {
    this.active = null;
    this.group.visible = false;
    for (const lvl of this.levels) for (const m of lvl.meshes) m.visible = false;
    for (const e of this.entrances) if (e.group) e.group.visible = true;
    const e = this.currentEntrance || this.entrances[0];
    this.currentEntrance = null;
    if (e) return { x: e.x, y: e.y + 0.05, z: e.z + 2.2 };
    return { x: 0, y: this.world.heightAt(0, 0) + 0.05, z: 0 };
  }

  /**
   * Копать вглубь: под текущим слоем появляется новый — с жилами,
   * лавой и своей лестницей. Так шахта растёт, а не кончается.
   */
  digDown() {
    const cur = this.level;
    if (!cur) return null;
    if (this.hasDeeper()) return this.switchLevel(1);
    if (this.levels.length >= 7) return null;

    const y = cur.y - 16;
    const start = { cx: cur.start.cx, cz: cur.start.cz };
    const grid = new Array(W * W).fill(null);
    const open = (cx, cz) => {
      if (cx < 1 || cz < 1 || cx >= W - 1 || cz >= W - 1) return;
      const k = this._cellKey(cx, cz);
      if (!grid[k]) grid[k] = { open: true, type: 'air' };
    };

    // шахта вниз: комната под лестницей и два штрека
    for (let dz = -2; dz <= 2; dz++) for (let dx = -2; dx <= 2; dx++) open(start.cx + dx, start.cz + dz);
    for (let i = 0; i < 30; i++) {
      open(start.cx + i, start.cz);
      open(start.cx, start.cz - i);
      open(start.cx + i, start.cz + 1);
      open(start.cx - 1, start.cz - i);
      if (i % 6 === 0) open(start.cx + i, start.cz - 1);
    }

    const level = {
      index: this.levels.length,
      deep: true,
      hell: true,
      y,
      grid,
      veins: new Map(),
      wallHP: new Map(),
      start,
      meshes: [],
    };

    // жилы: чем глубже, тем больше драгоценного
    const depthIndex = this.levels.length;
    for (let cz = 1; cz < W - 1; cz++) {
      for (let cx = 1; cx < W - 1; cx++) {
        const k = this._cellKey(cx, cz);
        if (grid[k]) continue;
        const nearOpen = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dz]) => {
          const n = grid[this._cellKey(cx + dx, cz + dz)];
          return n && n.open;
        });
        if (!nearOpen) continue;
        const roll = this.rng();
        let type = 'stone';
        const rareBias = Math.min(0.34, depthIndex * 0.09);
        if (roll < 0.24) type = 'ore';
        else if (roll < 0.24 + 0.2 + rareBias) type = 'crystal';
        else if (roll < 0.24 + 0.34 + rareBias * 1.3) type = 'obsidian';
        level.veins.set(k, { cx, cz, type, hp: VEIN_HP[type] });
      }
    }

    // лава в новых залах
    let lava = 0;
    for (let cz = 2; cz < W - 2 && lava < 60; cz++) {
      for (let cx = 2; cx < W - 2 && lava < 60; cx++) {
        const cell = grid[this._cellKey(cx, cz)];
        if (!cell || !cell.open) continue;
        if (Math.abs(cx - start.cx) <= 2 && Math.abs(cz - start.cz) <= 2) continue;
        if (this.rng() < 0.42) { cell.type = 'lava'; lava++; }
      }
    }

    this.levels.push(level);
    this._renderLevel(level);
    this.deepest = level.index;
    return this.enter(level.index, this.currentEntrance);
  }

  /** Есть ли слой ниже текущего */
  hasDeeper() {
    return this.active !== null && this.active + 1 < this.levels.length;
  }

  switchLevel(dir = 1) {
    if (this.active === null) return null;
    const next = this.active + dir;
    if (next < 0) return null;
    if (next >= this.levels.length) return null;
    return this.enter(next, this.currentEntrance);
  }

  get level() {
    return this.active === null ? null : this.levels[this.active];
  }

  floorAt(x, z) {
    const lvl = this.level;
    if (!lvl) return this.world.heightAt(x, z);
    void x; void z;
    return lvl.y;
  }

  _cellAt(x, z) {
    const lvl = this.level;
    if (!lvl) return null;
    const cx = Math.floor((x + HALF) / CELL);
    const cz = Math.floor((z + HALF) / CELL);
    if (cx < 0 || cz < 0 || cx >= W || cz >= W) return { cx, cz, cell: null };
    return { cx, cz, cell: lvl.grid[this._cellKey(cx, cz)] };
  }

  isOpen(x, z) {
    const c = this._cellAt(x, z);
    return !!(c && c.cell && c.cell.open);
  }

  canStand(x, z, radius = 0.4) {
    const lvl = this.level;
    if (!lvl) return true;
    for (const [dx, dz] of [[0, 0], [radius, 0], [-radius, 0], [0, radius], [0, -radius]]) {
      if (!this.isOpen(x + dx, z + dz)) return false;
    }
    return true;
  }

  inLava(x, z) {
    const c = this._cellAt(x, z);
    return !!(c && c.cell && c.cell.open && c.cell.type === 'lava');
  }

  /** Стоит ли игрок у лестницы (можно подняться/спуститься) */
  nearLadder(pos, reach = 2.4) {
    const lvl = this.level;
    if (!lvl || !lvl.lightPos) return false;
    return Math.hypot(pos.x - lvl.lightPos.x, pos.z - lvl.lightPos.z) < reach;
  }

  /** Игрок рядом со входом в шахту на поверхности */
  nearEntrance(pos, reach = 3.2) {
    for (const e of this.entrances) {
      if (Math.hypot(e.x - pos.x, e.z - pos.z) < reach) return e;
    }
    return null;
  }

  // ------------------------------------------------------------
  //  Добыча
  // ------------------------------------------------------------

  /** Что под прицелом: клетка стены и тип жилы (без урона) */
  probe(origin, dirX, dirZ, reach = 3.4) {
    const lvl = this.level;
    if (!lvl) return null;
    const len = Math.hypot(dirX, dirZ) || 1;
    const dx = dirX / len;
    const dz = dirZ / len;
    for (let d = 0.4; d <= reach; d += 0.25) {
      const x = origin.x + dx * d;
      const z = origin.z + dz * d;
      const c = this._cellAt(x, z);
      if (!c) continue;
      if (!c.cell || !c.cell.open) {
        const key = this._cellKey(c.cx, c.cz);
        const vein = lvl.veins.get(key) || null;
        const type = vein ? vein.type : 'stone';
        return { cx: c.cx, cz: c.cz, type, dist: d, key, hp: vein ? vein.hp : (lvl.wallHP.get(key) ?? VEIN_HP.stone), maxHp: VEIN_HP[type] };
      }
    }
    return null;
  }

  /**
   * Удар по стене по направлению взгляда.
   * Возвращает { type, broken, drops, hp } или null.
   */
  strike(origin, dirX, dirZ, power, reach = 2.8) {
    const lvl = this.level;
    if (!lvl) return null;

    let hit = null;
    for (let d = 0.3; d <= reach; d += 0.3) {
      const x = origin.x + dirX * d;
      const z = origin.z + dirZ * d;
      const c = this._cellAt(x, z);
      if (!c || !c.cell || !c.cell.open) {
        if (!c) continue;
        const key = this._cellKey(c.cx, c.cz);
        hit = { cx: c.cx, cz: c.cz, key, vein: lvl.veins.get(key) || null };
        break;
      }
    }
    if (!hit) return null;

    const type = hit.vein ? hit.vein.type : 'stone';
    const damage = 1 + power * 2.2;
    const hp = (hit.vein ? hit.vein.hp : (lvl.wallHP.get(hit.key) ?? VEIN_HP.stone)) - damage;
    const result = { type, broken: false, drops: {}, hp: Math.max(0, hp), maxHp: VEIN_HP[type], cx: hit.cx, cz: hit.cz };

    if (hp <= 0) {
      lvl.grid[hit.key] = { open: true, type: 'air' };
      if (hit.vein) {
        const table = VEIN_DROPS[type] || {};
        for (const [id, [min, max]] of Object.entries(table)) {
          const n = min + Math.floor(this.rng() * (max - min + 1));
          if (n > 0) result.drops[id] = (result.drops[id] || 0) + n;
        }
        lvl.veins.delete(hit.key);
      }
      lvl.wallHP.delete(hit.key);
      result.broken = true;
      result.hp = 0;
      this._openCell(lvl, hit.cx, hit.cz, hit.key);
    } else if (hit.vein) {
      hit.vein.hp = hp;
    } else {
      lvl.wallHP.set(hit.key, hp);
    }
    return result;
  }

  /** Убрать стену и вкрапления, добавить пол и потолок в пробитой клетке */
  _openCell(lvl, cx, cz, key) {
    const dummy = new THREE.Object3D();
    const x = this._worldX(cx);
    const z = this._worldZ(cz);

    const hide = (mesh, index) => {
      if (!mesh || index === undefined) return;
      dummy.position.set(0, -9999, 0);
      dummy.rotation.set(0, 0, 0);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      mesh.setMatrixAt(index, dummy.matrix);
      mesh.instanceMatrix.needsUpdate = true;
    };

    hide(lvl.wallMesh, lvl.wallIndex.get(key));
    const gemIdxs = lvl.gemIndex.get(key);
    if (gemIdxs) gemIdxs.forEach((i) => hide(lvl.gemMesh, i));

    // пол и потолок
    const mat = new THREE.MeshStandardMaterial({ color: 0x9a9284, roughness: 0.96, flatShading: true });
    const floor = new THREE.Mesh(new THREE.BoxGeometry(CELL, 0.36, CELL), mat);
    floor.position.set(x, lvl.y - 0.2, z);
    floor.receiveShadow = true;
    this.group.add(floor);
    lvl.meshes.push(floor);

    const ceil = new THREE.Mesh(new THREE.BoxGeometry(CELL, 0.4, CELL), new THREE.MeshStandardMaterial({ color: 0x8f8a80, roughness: 1 }));
    ceil.position.set(x, lvl.y + WALL_H, z);
    this.group.add(ceil);
    lvl.meshes.push(ceil);
  }

  // ------------------------------------------------------------
  //  Кадр
  // ------------------------------------------------------------

  update(dt) {
    this.time += dt;

    // дымка над входами живёт и снаружи
    if (this.entranceGroup) {
      this.entranceGroup.children.forEach((g, i) => {
        const b = g.userData.beacon;
        if (b) {
          b.material.opacity = 0.06 + Math.sin(this.time * 1.3 + i) * 0.035;
          b.rotation.y += dt * 0.25;
        }
      });
    }
    const lvl = this.level;
    if (!lvl) return;
    if (lvl.lavaGroup) for (const mesh of lvl.lavaGroup.children) mesh.material.emissiveIntensity = 1.3 + Math.sin(this.time * 2.1) * 0.4;
    if (lvl.light) lvl.light.intensity = (lvl.deep ? 1.6 : 1.0) * (0.9 + Math.sin(this.time * 3.1) * 0.08);
    if (lvl.gemMesh && lvl.gemMesh.material) {
      lvl.gemMesh.material.emissiveIntensity = 0.9 + Math.sin(this.time * 1.7) * 0.25;
    }

    // факелы дышат, пыль медленно плывёт
    if (lvl.torches) {
      for (const t of lvl.torches) {
        const f = 0.85 + Math.sin(this.time * 7.3 + t.phase) * 0.12 + Math.sin(this.time * 13.1 + t.phase) * 0.05;
        t.light.intensity = 1.5 * f;
        t.flame.scale.set(1, f, 1);
        t.flame.rotation.y += 0.02;
      }
    }
    if (lvl.dust) {
      const pos = lvl.dust.geometry.attributes.position;
      for (let i = 0; i < pos.count; i += 3) {
        let py = pos.getY(i) + 0.05 * dt;
        if (py > lvl.y + WALL_H - 0.2) py = lvl.y + 0.2;
        pos.setY(i, py);
        pos.setX(i, pos.getX(i) + Math.sin(this.time * 0.4 + i) * 0.01);
      }
      pos.needsUpdate = true;
    }
  }
}

/** Слить геометрии в одну (только позиции/нормали/uv) */
function mergeGeo(list) {
  try {
    const parts = list.map((g) => (g.index ? g.toNonIndexed() : g));
    const total = parts.reduce((n, g) => n + g.attributes.position.count, 0);
    const pos = new Float32Array(total * 3);
    const nor = new Float32Array(total * 3);
    const uv = new Float32Array(total * 2);
    let o = 0;
    for (const g of parts) {
      const p = g.attributes.position;
      const n = g.attributes.normal;
      const u = g.attributes.uv;
      for (let i = 0; i < p.count; i++) {
        pos[(o + i) * 3] = p.getX(i);
        pos[(o + i) * 3 + 1] = p.getY(i);
        pos[(o + i) * 3 + 2] = p.getZ(i);
        if (n) {
          nor[(o + i) * 3] = n.getX(i);
          nor[(o + i) * 3 + 1] = n.getY(i);
          nor[(o + i) * 3 + 2] = n.getZ(i);
        }
        if (u) {
          uv[(o + i) * 2] = u.getX(i);
          uv[(o + i) * 2 + 1] = u.getY(i);
        }
      }
      o += p.count;
      g.dispose?.();
    }
    const out = new THREE.BufferGeometry();
    out.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    out.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
    out.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
    out.computeBoundingSphere();
    return out;
  } catch (err) {
    console.warn('mine merge failed', err);
    return null;
  }
}

/**
 * Подмена мира для физики героя: снаружи — обычный остров,
 * под землёй — клетки шахты. Player.update просто получает
 * этот объект вместо world и ничего не знает о шахте.
 */
export function createMineWorld(mine, world) {
  const adapter = {
    get underground() { return mine.active !== null; },
    get colliders() { return mine.active !== null ? [] : world.colliders; },
    get shells() { return mine.active !== null ? null : world.shells; },
    heightAt(x, z) {
      return mine.active !== null ? mine.floorAt(x, z) : world.heightAt(x, z);
    },
    slopeAt(x, z) {
      return mine.active !== null ? 0 : world.slopeAt(x, z);
    },
    resolveCollisions(pos, radius, velocity, feetY, stepUp) {
      if (mine.active === null) return world.resolveCollisions(pos, radius, velocity, feetY, stepUp);
      // стены шахты: если клетка занята — выталкиваем героя назад
      const step = radius * 0.9;
      const tests = [[1, 0], [-1, 0], [0, 1], [0, -1]];
      for (const [dx, dz] of tests) {
        const nx = pos.x + dx * step;
        const nz = pos.z + dz * step;
        if (mine.isOpen(nx, nz)) continue;
        if (dx > 0) { pos.x = Math.min(pos.x, nx - step); velocity.x = Math.min(velocity.x, 0); }
        if (dx < 0) { pos.x = Math.max(pos.x, nx + step); velocity.x = Math.max(velocity.x, 0); }
        if (dz > 0) { pos.z = Math.min(pos.z, nz - step); velocity.z = Math.min(velocity.z, 0); }
        if (dz < 0) { pos.z = Math.max(pos.z, nz + step); velocity.z = Math.max(velocity.z, 0); }
      }
    },
  };
  return adapter;
}

export { CELL, W, HALF, WALL_H, LEVEL_DEPTH };
