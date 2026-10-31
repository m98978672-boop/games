// ============================================================================
//  3D-РЕНДЕРЕР МИРА «КАСКАД: ЖИВАЯ ВОДА»
//  Включает оптимизации из других игр репозитория (last-shore):
//  - Все леса, камни, опоры ЛЭП и сотни растущих зданий городов — InstancedMesh!
//  - matrixAutoUpdate = false на всей статике и инстансах
//  - Частичное обновление меша рельефа по dirty-rect при копке каналов
//  - Предкомпиляция шейдеров renderer.compile() без фризов
// ============================================================================

import * as THREE from 'three';
import { WORLD } from './config.js';
import { clamp, makeRng } from './noise.js';
import {
  createWaterDetailTexture,
  createValleyTerrainMaterial,
  createRealisticWaterMaterial,
  createCityFacadeMaterial,
} from './water-shader.js';

const _mat4 = new THREE.Matrix4();
const _pos = new THREE.Vector3();
const _quat = new THREE.Quaternion();
const _scale = new THREE.Vector3();
const _euler = new THREE.Euler();
const _color = new THREE.Color();

export class WorldView {
  constructor(scene, hydro, economy, qualityProfile) {
    this.scene = scene;
    this.hydro = hydro;
    this.economy = economy;
    this.profile = qualityProfile;

    this.detailTex = createWaterDetailTexture(256);

    // Освещение долины (Солнце + Небо, без лишних динамических источников света!)
    this.hemiLight = new THREE.HemisphereLight(0x8ec5ff, 0x3d4f35, 0.72);
    this.scene.add(this.hemiLight);

    this.sunLight = new THREE.DirectionalLight(0xfff3db, 1.45);
    this.sunLight.position.set(180, 260, 140);
    if (qualityProfile.shadows) {
      this.sunLight.castShadow = true;
      this.sunLight.shadow.mapSize.set(1536, 1536);
      this.sunLight.shadow.camera.near = 40;
      this.sunLight.shadow.camera.far = 760;
      const d = 295;
      this.sunLight.shadow.camera.left = -d;
      this.sunLight.shadow.camera.right = d;
      this.sunLight.shadow.camera.top = d;
      this.sunLight.shadow.camera.bottom = -d;
      this.sunLight.shadow.bias = -0.0008;
    }
    this.scene.add(this.sunLight);

    // Фоновый купол неба
    this.skyColorZenith = new THREE.Color(0x2864ad);
    this.skyColorHorizon = new THREE.Color(0xa6cde8);
    this.fogColor = new THREE.Color(0xa6cde8);
    this.scene.background = this.fogColor.clone();

    // 1. Меш рельефа долины и меш реалистичной воды
    this._buildTerrainMesh();
    this._buildWaterMesh();

    // 2. Оптимизированные леса и скальные валуны через InstancedMesh
    this._buildNatureInstances();

    // 3. Оптимизированные саморастущие города через InstancedMesh (3 draw calls на сотни зданий!)
    this._buildCityInstancedPools();

    // 4. Группа 3D-зданий ГЭС, сегментных затворов и инстансированных опор ЛЭП
    this.structuresGroup = new THREE.Group();
    this.scene.add(this.structuresGroup);
    this.structMeshes = new Map();
    this._buildPowerLinePools();

    // 5. Инженерный 3D-курсор / голограмма строительства и оросительный ориентир
    this._buildCursorPreview();
    this._buildIrrigationBeacon();
  }

  _buildTerrainMesh() {
    const g = this.hydro.grid;
    const count = g * g;
    const dx = this.hydro.dx;
    const half = WORLD.size * 0.5;

    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const normals = new Float32Array(count * 3);
    const meta = new Float32Array(count * 4); // soil, concrete, wetness, subDepth

    for (let gz = 0; gz < g; gz++) {
      const wz = -half + (gz + 0.5) * dx;
      for (let gx = 0; gx < g; gx++) {
        const wx = -half + (gx + 0.5) * dx;
        const i = gz * g + gx;
        const i3 = i * 3;
        positions[i3] = wx;
        positions[i3 + 1] = this.hydro.zb[i];
        positions[i3 + 2] = wz;
        normals[i3 + 1] = 1;
      }
    }

    const indices = new Uint32Array((g - 1) * (g - 1) * 6);
    let ptr = 0;
    for (let gz = 0; gz < g - 1; gz++) {
      for (let gx = 0; gx < g - 1; gx++) {
        const a = gz * g + gx;
        const b = a + 1;
        const c = a + g;
        const d = c + 1;
        indices[ptr++] = a;
        indices[ptr++] = c;
        indices[ptr++] = b;
        indices[ptr++] = b;
        indices[ptr++] = c;
        indices[ptr++] = d;
      }
    }

    geo.setIndex(new THREE.BufferAttribute(indices, 1));
    this.terrainPosAttr = new THREE.BufferAttribute(positions, 3);
    this.terrainPosAttr.setUsage(THREE.DynamicDrawUsage);
    this.terrainNormAttr = new THREE.BufferAttribute(normals, 3);
    this.terrainNormAttr.setUsage(THREE.DynamicDrawUsage);
    this.terrainMetaAttr = new THREE.BufferAttribute(meta, 4);
    this.terrainMetaAttr.setUsage(THREE.DynamicDrawUsage);

    geo.setAttribute('position', this.terrainPosAttr);
    geo.setAttribute('normal', this.terrainNormAttr);
    geo.setAttribute('aTerrainMeta', this.terrainMetaAttr);

    this.terrainMat = createValleyTerrainMaterial(this.detailTex);
    this.terrainMesh = new THREE.Mesh(geo, this.terrainMat);
    this.terrainMesh.receiveShadow = !!this.profile.shadows;
    this.terrainMesh.castShadow = !!this.profile.shadows;
    this.terrainMesh.matrixAutoUpdate = false;
    this.terrainMesh.updateMatrix();
    this.scene.add(this.terrainMesh);

    // Каменный цоколь по периметру долины (как срез диорамы)
    const skirtMat = new THREE.MeshLambertMaterial({ color: 0x2a2f35 });
    const skirtGeo = new THREE.BoxGeometry(WORLD.size, 26, WORLD.size);
    const skirt = new THREE.Mesh(skirtGeo, skirtMat);
    skirt.position.set(0, -12.6, 0);
    skirt.matrixAutoUpdate = false;
    skirt.updateMatrix();
    this.scene.add(skirt);

    this.updateTerrainGeometryRect(0, 0, g - 1, g - 1);
  }

  _buildWaterMesh() {
    const g = this.hydro.grid;
    const count = g * g;
    const dx = this.hydro.dx;
    const half = WORLD.size * 0.5;

    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const normals = new Float32Array(count * 3);
    const hydro1 = new Float32Array(count * 4);
    const hydro2 = new Float32Array(count * 4);

    for (let gz = 0; gz < g; gz++) {
      const wz = -half + (gz + 0.5) * dx;
      for (let gx = 0; gx < g; gx++) {
        const wx = -half + (gx + 0.5) * dx;
        const i = gz * g + gx;
        const i3 = i * 3;
        positions[i3] = wx;
        positions[i3 + 1] = this.hydro.zb[i] + this.hydro.h[i];
        positions[i3 + 2] = wz;
        normals[i3 + 1] = 1;
      }
    }

    // Делимся индексным буфером с рельефом (экономия видеопамяти!)
    geo.setIndex(this.terrainMesh.geometry.getIndex());

    this.waterPosAttr = new THREE.BufferAttribute(positions, 3);
    this.waterPosAttr.setUsage(THREE.DynamicDrawUsage);
    this.waterNormAttr = new THREE.BufferAttribute(normals, 3);
    this.waterNormAttr.setUsage(THREE.DynamicDrawUsage);
    this.waterH1Attr = new THREE.BufferAttribute(hydro1, 4);
    this.waterH1Attr.setUsage(THREE.DynamicDrawUsage);
    this.waterH2Attr = new THREE.BufferAttribute(hydro2, 4);
    this.waterH2Attr.setUsage(THREE.DynamicDrawUsage);

    geo.setAttribute('position', this.waterPosAttr);
    geo.setAttribute('normal', this.waterNormAttr);
    geo.setAttribute('aHydro1', this.waterH1Attr);
    geo.setAttribute('aHydro2', this.waterH2Attr);

    this.waterMat = createRealisticWaterMaterial(this.detailTex);
    this.waterMesh = new THREE.Mesh(geo, this.waterMat);
    this.waterMesh.renderOrder = 2;
    this.waterMesh.matrixAutoUpdate = false;
    this.waterMesh.updateMatrix();
    this.scene.add(this.waterMesh);
  }

  _buildNatureInstances() {
    const rng = makeRng(424242);
    const maxTrees = this.profile.treeCount;
    const maxRocks = this.profile.rockCount;

    const trunkGeo = new THREE.CylinderGeometry(0.22, 0.38, 2.2, 5);
    trunkGeo.translate(0, 1.1, 0);
    const crownGeo = new THREE.ConeGeometry(1.85, 5.6, 6);
    crownGeo.translate(0, 4.4, 0);

    const trunkMat = new THREE.MeshLambertMaterial({ color: 0x5c4028 });
    const crownMat = new THREE.MeshLambertMaterial({ color: 0xffffff });

    this.treeTrunks = new THREE.InstancedMesh(trunkGeo, trunkMat, maxTrees);
    this.treeCrowns = new THREE.InstancedMesh(crownGeo, crownMat, maxTrees);
    this.treeCrowns.castShadow = !!this.profile.shadows;

    this.treeSlots = [];
    let placed = 0;
    let attempts = 0;
    while (placed < maxTrees && attempts < maxTrees * 8) {
      attempts++;
      const wx = (rng() - 0.5) * (WORLD.size - 24);
      const wz = (rng() - 0.5) * (WORLD.size - 24);
      const s = this.hydro.sampleAtWorld(wx, wz);
      if (s.depth > 0.02 || s.bed > 51 || s.bed < 7.5 || s.soil < 0.75) continue;

      // Не сажаем деревья на площадках городов и деривационной трассе у створа
      let nearCity = false;
      for (const c of this.economy.cities) {
        if (Math.hypot(wx - c.x, wz - c.z) < c.plateauRadius * 1.08) {
          nearCity = true;
          break;
        }
      }
      if (nearCity) continue;

      const scale = 0.72 + rng() * 0.75;
      _pos.set(wx, s.bed - 0.15, wz);
      _euler.set(0, rng() * Math.PI * 2, 0);
      _quat.setFromEuler(_euler);
      _scale.set(scale, scale * (0.9 + rng() * 0.35), scale);
      _mat4.compose(_pos, _quat, _scale);

      this.treeTrunks.setMatrixAt(placed, _mat4);
      this.treeCrowns.setMatrixAt(placed, _mat4);
      _color.setHSL(0.29 + (rng() - 0.5) * 0.06, 0.46 + rng() * 0.16, 0.24 + rng() * 0.11);
      this.treeCrowns.setColorAt(placed, _color);

      this.treeSlots.push({ index: placed, wx, wz, baseBed: s.bed, alive: true });
      placed++;
    }

    this.treeTrunks.count = placed;
    this.treeCrowns.count = placed;
    this.treeTrunks.instanceMatrix.needsUpdate = true;
    this.treeCrowns.instanceMatrix.needsUpdate = true;
    if (this.treeCrowns.instanceColor) this.treeCrowns.instanceColor.needsUpdate = true;
    this.treeTrunks.matrixAutoUpdate = false;
    this.treeCrowns.matrixAutoUpdate = false;
    this.scene.add(this.treeTrunks);
    this.scene.add(this.treeCrowns);

    // Прибрежные и горные валуны — 1 InstancedMesh
    const rockGeo = new THREE.DodecahedronGeometry(1.3, 0);
    const rockMat = new THREE.MeshLambertMaterial({ color: 0x7b7974 });
    this.rockInstances = new THREE.InstancedMesh(rockGeo, rockMat, maxRocks);
    this.rockSlots = [];
    let rPlaced = 0;
    for (let i = 0; i < maxRocks * 5 && rPlaced < maxRocks; i++) {
      const wx = (rng() - 0.5) * (WORLD.size - 18);
      const wz = (rng() - 0.5) * (WORLD.size - 18);
      const s = this.hydro.sampleAtWorld(wx, wz);
      if (s.depth > 0.4) continue;
      let nearCity = false;
      for (const c of this.economy.cities) {
        if (Math.hypot(wx - c.x, wz - c.z) < c.plateauRadius) { nearCity = true; break; }
      }
      if (nearCity) continue;

      _pos.set(wx, s.bed + 0.2, wz);
      _euler.set(rng() * 3, rng() * 3, rng() * 3);
      _quat.setFromEuler(_euler);
      _scale.set(0.6 + rng() * 1.4, 0.45 + rng() * 0.9, 0.6 + rng() * 1.4);
      _mat4.compose(_pos, _quat, _scale);
      this.rockSlots.push({ index: rPlaced, wx, wz, baseBed: s.bed, alive: true });
      this.rockInstances.setMatrixAt(rPlaced++, _mat4);
    }
    this.rockInstances.count = rPlaced;
    this.rockInstances.instanceMatrix.needsUpdate = true;
    this.rockInstances.matrixAutoUpdate = false;
    this.scene.add(this.rockInstances);
  }

  _buildCityInstancedPools() {
    const maxB = 320;
    const bodyGeo = new THREE.BoxGeometry(1, 1, 1);
    bodyGeo.translate(0, 0.5, 0);
    this.cityPoweredArr = new Float32Array(maxB);
    this.cityPoweredAttr = new THREE.InstancedBufferAttribute(this.cityPoweredArr, 1);
    this.cityPoweredAttr.setUsage(THREE.DynamicDrawUsage);
    bodyGeo.setAttribute('aPowered', this.cityPoweredAttr);

    const roofGeo = new THREE.ConeGeometry(0.76, 0.42, 4);
    roofGeo.rotateY(Math.PI * 0.25);
    roofGeo.translate(0, 0.21, 0);

    this.cityBodyMat = createCityFacadeMaterial();
    const roofMat = new THREE.MeshLambertMaterial({ color: 0xffffff });

    this.cityBodies = new THREE.InstancedMesh(bodyGeo, this.cityBodyMat, maxB);
    this.cityRoofs = new THREE.InstancedMesh(roofGeo, roofMat, maxB);

    this.cityBodies.castShadow = !!this.profile.shadows;
    this.cityBodies.receiveShadow = !!this.profile.shadows;
    this.cityBodies.matrixAutoUpdate = false;
    this.cityRoofs.matrixAutoUpdate = false;

    this.scene.add(this.cityBodies);
    this.scene.add(this.cityRoofs);

    // Асфальтовые/грунтовые площади под каждым городом
    for (const c of this.economy.cities) {
      const diskGeo = new THREE.RingGeometry(4.0, c.plateauRadius * 0.85, 32);
      diskGeo.rotateX(-Math.PI * 0.5);
      const diskMat = new THREE.MeshLambertMaterial({
        color: c.archetype === 'agro' ? 0x6f7f43 : 0x565b63,
        transparent: true,
        opacity: 0.42,
      });
      const disk = new THREE.Mesh(diskGeo, diskMat);
      const centerBed = this.hydro.sampleAtWorld(c.x, c.z).bed;
      disk.position.set(c.x, centerBed + 0.08, c.z);
      disk.matrixAutoUpdate = false;
      disk.updateMatrix();
      this.scene.add(disk);
    }
  }

  _buildPowerLinePools() {
    const maxPylons = 180;
    const pylonGeo = new THREE.CylinderGeometry(0.18, 0.95, 11.5, 4);
    pylonGeo.translate(0, 5.75, 0);
    const pylonMat = new THREE.MeshLambertMaterial({ color: 0x9aa6b2 });
    this.pylonMesh = new THREE.InstancedMesh(pylonGeo, pylonMat, maxPylons);
    this.pylonMesh.count = 0;
    this.pylonMesh.matrixAutoUpdate = false;
    this.scene.add(this.pylonMesh);

    const wireGeo = new THREE.BufferGeometry();
    this.wirePositions = new Float32Array(maxPylons * 12);
    this.wireAttr = new THREE.BufferAttribute(this.wirePositions, 3);
    wireGeo.setAttribute('position', this.wireAttr);
    this.wireMat = new THREE.LineBasicMaterial({ color: 0xffe082, transparent: true, opacity: 0.85 });
    this.wireLines = new THREE.LineSegments(wireGeo, this.wireMat);
    this.wireLines.frustumCulled = false;
    this.scene.add(this.wireLines);
  }

  _buildCursorPreview() {
    this.cursorGroup = new THREE.Group();
    this.cursorGroup.visible = false;

    const ringGeo = new THREE.RingGeometry(0.88, 1.0, 36);
    ringGeo.rotateX(-Math.PI * 0.5);
    this.cursorRingMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
      depthTest: false,
    });
    this.cursorRing = new THREE.Mesh(ringGeo, this.cursorRingMat);
    this.cursorGroup.add(this.cursorRing);

    // Стрелка направления напора при установке турбины или водосброса
    this.flowArrow = new THREE.Group();
    const shaft = new THREE.Mesh(
      new THREE.BoxGeometry(14, 0.8, 1.6),
      new THREE.MeshBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.8 }),
    );
    const cone = new THREE.Mesh(
      new THREE.ConeGeometry(2.8, 5.5, 12),
      new THREE.MeshBasicMaterial({ color: 0x34d399, transparent: true, opacity: 0.9 }),
    );
    cone.rotation.z = -Math.PI * 0.5;
    cone.position.x = 9.0;
    const intakeBall = new THREE.Mesh(
      new THREE.SphereGeometry(2.1, 12, 12),
      new THREE.MeshBasicMaterial({ color: 0x3b82f6, transparent: true, opacity: 0.85 }),
    );
    intakeBall.position.x = -9.0;
    this.flowArrow.add(shaft, cone, intakeBall);
    this.flowArrow.visible = false;
    this.cursorGroup.add(this.flowArrow);

    this.scene.add(this.cursorGroup);
  }

  _buildIrrigationBeacon() {
    // Визуальный ориентир оросительного приёмника у Агродолины (128, 76)
    const ringGeo = new THREE.RingGeometry(9.5, 11.2, 28);
    ringGeo.rotateX(-Math.PI * 0.5);
    this.irrRingMat = new THREE.MeshBasicMaterial({
      color: 0x34d399,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.55,
    });
    const bed = this.hydro.sampleAtWorld(128, 76).bed;
    this.irrBeacon = new THREE.Mesh(ringGeo, this.irrRingMat);
    this.irrBeacon.position.set(128, bed + 0.35, 76);
    this.scene.add(this.irrBeacon);
  }

  /** Частичное обновление изменённого участка рельефа (dirty-rect!) + вырубка деревьев в канале */
  updateTerrainGeometryRect(x0, z0, x1, z1) {
    const g = this.hydro.grid;
    const dx = this.hydro.dx;
    const pos = this.terrainPosAttr.array;
    const norm = this.terrainNormAttr.array;
    const meta = this.terrainMetaAttr.array;
    const { zb, soil, concrete, wetness, h, linedMask } = this.hydro;

    for (let gz = z0; gz <= z1; gz++) {
      const row = gz * g;
      for (let gx = x0; gx <= x1; gx++) {
        const i = row + gx;
        pos[i * 3 + 1] = zb[i];
        const i4 = i * 4;
        meta[i4] = soil[i];
        meta[i4 + 1] = concrete[i] + (linedMask[i] ? 0.5 : 0.0);
        meta[i4 + 2] = wetness[i];
        meta[i4 + 3] = h[i];
      }
    }

    // Гладкие нормали центральными разностями
    const nx0 = clamp(x0 - 1, 0, g - 1);
    const nz0 = clamp(z0 - 1, 0, g - 1);
    const nx1 = clamp(x1 + 1, 0, g - 1);
    const nz1 = clamp(z1 + 1, 0, g - 1);
    const twoDx = 2.0 * dx;

    for (let gz = nz0; gz <= nz1; gz++) {
      const zPrev = Math.max(0, gz - 1) * g;
      const zNext = Math.min(g - 1, gz + 1) * g;
      const row = gz * g;
      for (let gx = nx0; gx <= nx1; gx++) {
        const xPrev = Math.max(0, gx - 1);
        const xNext = Math.min(g - 1, gx + 1);
        const dzdx = (zb[row + xNext] - zb[row + xPrev]) / twoDx;
        const dzdz = (zb[zNext + gx] - zb[zPrev + gx]) / twoDx;
        const len = Math.hypot(dzdx, 1.0, dzdz);
        const i3 = (row + gx) * 3;
        norm[i3] = -dzdx / len;
        norm[i3 + 1] = 1.0 / len;
        norm[i3 + 2] = -dzdz / len;
      }
    }

    this.terrainPosAttr.needsUpdate = true;
    this.terrainNormAttr.needsUpdate = true;
    this.terrainMetaAttr.needsUpdate = true;

    // Если игрок прокопал канал или затопил лес — убираем деревья в затронутой зоне
    if (this.treeSlots && (x1 - x0 < g - 2)) {
      const half = WORLD.size * 0.5;
      const wx0 = -half + x0 * dx - 2;
      const wx1 = -half + (x1 + 1) * dx + 2;
      const wz0 = -half + z0 * dx - 2;
      const wz1 = -half + (z1 + 1) * dx + 2;
      let treeChanged = false;
      for (let k = 0; k < this.treeSlots.length; k++) {
        const tr = this.treeSlots[k];
        if (!tr.alive) continue;
        if (tr.wx >= wx0 && tr.wx <= wx1 && tr.wz >= wz0 && tr.wz <= wz1) {
          const s = this.hydro.sampleAtWorld(tr.wx, tr.wz);
          if (Math.abs(s.bed - tr.baseBed) > 0.35 || s.concrete > 0.1 || s.lined) {
            tr.alive = false;
            _mat4.makeScale(0, 0, 0);
            this.treeTrunks.setMatrixAt(tr.index, _mat4);
            this.treeCrowns.setMatrixAt(tr.index, _mat4);
            treeChanged = true;
          }
        }
      }
      if (treeChanged) {
        this.treeTrunks.instanceMatrix.needsUpdate = true;
        this.treeCrowns.instanceMatrix.needsUpdate = true;
      }
      if (this.rockSlots) {
        let rockChanged = false;
        for (let k = 0; k < this.rockSlots.length; k++) {
          const rk = this.rockSlots[k];
          if (!rk.alive) continue;
          if (rk.wx >= wx0 && rk.wx <= wx1 && rk.wz >= wz0 && rk.wz <= wz1) {
            const s = this.hydro.sampleAtWorld(rk.wx, rk.wz);
            if (Math.abs(s.bed - rk.baseBed) > 0.3 || s.concrete > 0.1 || s.lined) {
              rk.alive = false;
              _mat4.makeScale(0, 0, 0);
              this.rockInstances.setMatrixAt(rk.index, _mat4);
              rockChanged = true;
            }
          }
        }
        if (rockChanged) this.rockInstances.instanceMatrix.needsUpdate = true;
      }
    }
  }

  /** Ежекадровое обновление водной поверхности и влажности берегов */
  updateWaterAndWetness(timeSec) {
    const g = this.hydro.grid;
    const twoDx = 2.0 * this.hydro.dx;
    const { zb, h, u, v, foam, sediment, vort, wetness, soil, concrete, linedMask } = this.hydro;

    const wPos = this.waterPosAttr.array;
    const wNorm = this.waterNormAttr.array;
    const h1 = this.waterH1Attr.array;
    const h2 = this.waterH2Attr.array;
    const tMeta = this.terrainMetaAttr.array;

    // 1. Обновляем высоты воды с умным горизонтальным подрезом у берегов и плотин (без «водяных занавесок»!)
    for (let gz = 0; gz < g; gz++) {
      const row = gz * g;
      for (let gx = 0; gx < g; gx++) {
        const i = row + gx;
        const depth = h[i];
        const i3 = i * 3;
        const i4 = i * 4;

        // Обновляем влажность и подводную глубину для шейдера рельефа (мокрые берега + каустика)
        tMeta[i4] = soil[i];
        tMeta[i4 + 1] = concrete[i] + (linedMask[i] ? 0.5 : 0.0);
        tMeta[i4 + 2] = wetness[i];
        tMeta[i4 + 3] = depth;

        if (depth > 0.014) {
          wPos[i3 + 1] = zb[i] + depth;
          h1[i4] = depth;
          h1[i4 + 1] = u[i];
          h1[i4 + 2] = v[i];
          h1[i4 + 3] = foam[i];
          h2[i4] = sediment[i];
          h2[i4 + 1] = vort[i];
          h2[i4 + 2] = (concrete[i] > 0.05 || linedMask[i]) ? 1.0 : 0.0;
          h2[i4 + 3] = 1.0;
        } else {
          // Если сухая вершина граничит с мокрой — прижимаем её на уровень соседней воды (не выше её берега!),
          // чтобы треугольник воды горизонтально врезался в склон/плотину по Z-буферу!
          let wetSum = 0;
          let wetCnt = 0;
          if (gx > 0 && h[i - 1] > 0.014) { wetSum += zb[i - 1] + h[i - 1]; wetCnt++; }
          if (gx < g - 1 && h[i + 1] > 0.014) { wetSum += zb[i + 1] + h[i + 1]; wetCnt++; }
          if (gz > 0 && h[i - g] > 0.014) { wetSum += zb[i - g] + h[i - g]; wetCnt++; }
          if (gz < g - 1 && h[i + g] > 0.014) { wetSum += zb[i + g] + h[i + g]; wetCnt++; }

          if (wetCnt > 0) {
            const avgSurf = wetSum / wetCnt;
            wPos[i3 + 1] = Math.min(zb[i] + 0.025, avgSurf);
            h1[i4] = 0.0;
            h1[i4 + 1] = 0;
            h1[i4 + 2] = 0;
            h1[i4 + 3] = 0;
            h2[i4 + 3] = 1.0;
          } else {
            wPos[i3 + 1] = zb[i] - 0.55;
            h1[i4] = 0.0;
            h2[i4 + 3] = 0.0;
          }
        }
      }
    }

    // 2. Макро-нормали водной поверхности по активным тайлам (наклоны волн и прыжков!)
    for (let ti = 0; ti < this.hydro.activeTileCount; ti++) {
      const tileIdx = this.hydro.activeTiles[ti];
      const x0 = Math.max(1, (tileIdx % this.hydro.tilesN) * 8);
      const z0 = Math.max(1, Math.floor(tileIdx / this.hydro.tilesN) * 8);
      const x1 = Math.min(g - 2, x0 + 8);
      const z1 = Math.min(g - 2, z0 + 8);

      for (let gz = z0; gz <= z1; gz++) {
        const row = gz * g;
        for (let gx = x0; gx <= x1; gx++) {
          const i = row + gx;
          if (h[i] <= 0.014) continue;
          const sL = wPos[(i - 1) * 3 + 1];
          const sR = wPos[(i + 1) * 3 + 1];
          const sU = wPos[(i - g) * 3 + 1];
          const sD = wPos[(i + g) * 3 + 1];
          const dsdx = clamp((sR - sL) / twoDx, -0.65, 0.65);
          const dsdz = clamp((sD - sU) / twoDx, -0.65, 0.65);
          const len = Math.hypot(dsdx, 1.0, dsdz);
          const i3 = i * 3;
          wNorm[i3] = -dsdx / len;
          wNorm[i3 + 1] = 1.0 / len;
          wNorm[i3 + 2] = -dsdz / len;
        }
      }
    }

    this.waterPosAttr.needsUpdate = true;
    this.waterNormAttr.needsUpdate = true;
    this.waterH1Attr.needsUpdate = true;
    this.waterH2Attr.needsUpdate = true;
    this.terrainMetaAttr.needsUpdate = true;

    this.waterMat.uniforms.uTime.value = timeSec;
    this.terrainMat.uniforms.uTime.value = timeSec;
  }

  /** Обновляет инстансы растущих зданий городов и их многоэтажные светящиеся окна (всего 2 draw calls!) */
  syncCityInstances() {
    const buildings = this.economy.allBuildings;
    const cityMap = new Map();
    for (const c of this.economy.cities) cityMap.set(c.id, c);

    const count = Math.min(buildings.length, this.cityBodies.instanceMatrix.count);
    for (let i = 0; i < count; i++) {
      const b = buildings[i];
      const city = cityMap.get(b.cityId);
      const powered = city && city.connected && city.powerRatio >= 0.45;
      const animH = b.sy * Math.max(0.08, b.anim);

      _pos.set(b.wx, b.wy - 0.25, b.wz);
      _euler.set(0, b.yaw, 0);
      _quat.setFromEuler(_euler);
      _scale.set(b.sx, animH, b.sz);
      _mat4.compose(_pos, _quat, _scale);
      this.cityBodies.setMatrixAt(i, _mat4);
      this.cityPoweredArr[i] = powered ? 1.0 : 0.0;

      if (b.kind === 'skyscraper') {
        _color.setHSL(0.56 + b.tint * 0.06, 0.32, 0.56);
      } else if (b.kind === 'factory') {
        _color.setHex(0x8d7b6d);
      } else if (b.kind === 'greenhouse') {
        _color.setHex(0xa7e8bd);
      } else if (b.kind === 'apartment') {
        _color.setHSL(0.08 + b.tint * 0.08, 0.24, 0.72);
      } else {
        _color.setHSL(0.09 + b.tint * 0.05, 0.38, 0.66);
      }
      this.cityBodies.setColorAt(i, _color);

      if (b.kind === 'cottage' || b.kind === 'townhouse') {
        _pos.set(b.wx, b.wy - 0.25 + animH, b.wz);
        _scale.set(b.sx * 1.08, 1.8 + b.sy * 0.18, b.sz * 1.08);
        _mat4.compose(_pos, _quat, _scale);
        _color.setHex(b.kind === 'cottage' ? 0x9e3f2c : 0x69453a);
      } else {
        _mat4.makeScale(0, 0, 0);
      }
      this.cityRoofs.setMatrixAt(i, _mat4);
      this.cityRoofs.setColorAt(i, _color);
    }

    this.cityBodies.count = count;
    this.cityRoofs.count = count;
    this.cityBodies.instanceMatrix.needsUpdate = true;
    this.cityRoofs.instanceMatrix.needsUpdate = true;
    this.cityPoweredAttr.needsUpdate = true;
    if (this.cityBodies.instanceColor) this.cityBodies.instanceColor.needsUpdate = true;
    if (this.cityRoofs.instanceColor) this.cityRoofs.instanceColor.needsUpdate = true;
  }

  /** Синхронизирует 3D-модели машинных залов ГЭС, роторов турбин и сегментных затворов */
  syncHydroStructures() {
    const activeIds = new Set();

    // 1. Машинные залы ГЭС
    for (const t of this.hydro.turbines) {
      activeIds.add(`t_${t.id}`);
      let meshGroup = this.structMeshes.get(`t_${t.id}`);
      if (!meshGroup) {
        meshGroup = this._createTurbinePowerhouseMesh(t);
        this.structMeshes.set(`t_${t.id}`, meshGroup);
        this.structuresGroup.add(meshGroup);
        this.economy.powerLinesDirty = true;
      }
      // Вращаем ротор генератора со скоростью, пропорциональной выработке МВт!
      const rotor = meshGroup.userData.rotor;
      if (rotor) {
        rotor.rotation.y = t.rotorPhase;
      }
      const lamp = meshGroup.userData.statusLamp;
      if (lamp) {
        lamp.material.color.setHex(t.powerMW > 0.1 ? 0x34d399 : 0xf59e0b);
      }
    }

    // 2. Сегментные затворы водосбросов
    for (const sw of this.hydro.spillways) {
      activeIds.add(`s_${sw.id}`);
      let swGroup = this.structMeshes.get(`s_${sw.id}`);
      if (!swGroup) {
        swGroup = this._createSpillwayMesh(sw);
        this.structMeshes.set(`s_${sw.id}`, swGroup);
        this.structuresGroup.add(swGroup);
      }
      // Поднимаем/опускаем стальной щит затвора в реальном времени!
      const gateLeaf = swGroup.userData.gateLeaf;
      if (gateLeaf) {
        gateLeaf.position.y = sw.sillElev + sw.wallHeight * 0.5 + sw.openRatio * (sw.wallHeight * 0.78);
      }
    }

    // Удаляем снесённые сооружения
    for (const [key, obj] of this.structMeshes.entries()) {
      if (!activeIds.has(key)) {
        this.structuresGroup.remove(obj);
        this.structMeshes.delete(key);
        this.economy.powerLinesDirty = true;
      }
    }

    if (this.economy.powerLinesDirty) {
      this._rebuildPowerLines();
      this.economy.powerLinesDirty = false;
    }
  }

  _createTurbinePowerhouseMesh(t) {
    const grp = new THREE.Group();
    grp.position.set(t.wx, 0, t.wz);
    grp.rotation.y = -t.yaw;

    const hallY = t.crestY;
    // Машинный зал с витражным остеклением
    const hall = new THREE.Mesh(
      new THREE.BoxGeometry(9.2, 6.2, 8.6),
      new THREE.MeshLambertMaterial({ color: 0xe2e8f0 }),
    );
    hall.position.set(0, hallY + 3.1, 0);
    hall.castShadow = !!this.profile.shadows;

    const roofBand = new THREE.Mesh(
      new THREE.BoxGeometry(9.8, 0.9, 9.2),
      new THREE.MeshLambertMaterial({ color: t.spec.color }),
    );
    roofBand.position.set(0, hallY + 6.4, 0);

    // Видимый вращающийся вал и крыльчатка гидрогенератора на крыше/в шахте
    const rotor = new THREE.Group();
    rotor.position.set(0, hallY + 7.4, 0);
    const hub = new THREE.Mesh(
      new THREE.CylinderGeometry(1.3, 1.3, 1.2, 10),
      new THREE.MeshLambertMaterial({ color: 0x1e293b }),
    );
    const blade1 = new THREE.Mesh(
      new THREE.BoxGeometry(5.2, 0.35, 0.9),
      new THREE.MeshLambertMaterial({ color: t.spec.color }),
    );
    const blade2 = blade1.clone();
    blade2.rotation.y = Math.PI * 0.5;
    rotor.add(hub, blade1, blade2);

    // Силовой повышающий трансформатор и портал ЛЭП
    const xfmr = new THREE.Mesh(
      new THREE.BoxGeometry(2.6, 2.8, 2.4),
      new THREE.MeshLambertMaterial({ color: 0x475569 }),
    );
    xfmr.position.set(-2.2, hallY + 1.4, 5.2);

    const statusLamp = new THREE.Mesh(
      new THREE.SphereGeometry(0.65, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0xf59e0b }),
    );
    statusLamp.position.set(3.2, hallY + 7.5, 0);

    grp.add(hall, roofBand, rotor, xfmr, statusLamp);
    grp.userData.rotor = rotor;
    grp.userData.statusLamp = statusLamp;
    return grp;
  }

  _createSpillwayMesh(sw) {
    const grp = new THREE.Group();
    grp.position.set(sw.wx, 0, sw.wz);
    grp.rotation.y = -sw.yaw;

    const pierMat = new THREE.MeshLambertMaterial({ color: 0x94a3b8 });
    const pierL = new THREE.Mesh(new THREE.BoxGeometry(8.5, sw.wallHeight + 4.5, 1.5), pierMat);
    pierL.position.set(0, sw.sillElev + (sw.wallHeight + 4.5) * 0.5 - 1, -4.4);
    const pierR = pierL.clone();
    pierR.position.z = 4.4;

    // Подъёмная балка с механизмом
    const bridge = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.2, 10.4), pierMat);
    bridge.position.set(0, sw.sillElev + sw.wallHeight + 3.8, 0);

    // Стальной затвор
    const gateLeaf = new THREE.Mesh(
      new THREE.BoxGeometry(1.1, sw.wallHeight, 7.6),
      new THREE.MeshLambertMaterial({ color: 0xd97706 }),
    );
    gateLeaf.position.set(0, sw.sillElev + sw.wallHeight * 0.5, 0);

    // Бетонный носок-трамплин на выходе водосброса
    const flipBucket = new THREE.Mesh(
      new THREE.BoxGeometry(4.2, 1.4, 7.6),
      pierMat,
    );
    flipBucket.rotation.z = 0.24;
    flipBucket.position.set(4.6, sw.sillElev + 0.4, 0);

    grp.add(pierL, pierR, bridge, gateLeaf, flipBucket);
    grp.userData.gateLeaf = gateLeaf;
    return grp;
  }

  _rebuildPowerLines() {
    // Соединяем опорами ЛЭП ближайший машинный зал ГЭС (или центральную подстанцию) с каждым подключённым городом
    const hubPos = this.hydro.turbines.length > 0
      ? { x: this.hydro.turbines[0].wx, z: this.hydro.turbines[0].wz }
      : { x: 10, z: -118 };

    let pylonIdx = 0;
    let wireFloats = 0;
    const maxPylons = this.pylonMesh.instanceMatrix.count;

    for (const c of this.economy.cities) {
      if (!c.connected) continue;
      // Выбираем ближайшую турбину как точку питания
      let src = hubPos;
      let bestD = Math.hypot(c.x - src.x, c.z - src.z);
      for (const t of this.hydro.turbines) {
        const d = Math.hypot(c.x - t.wx, c.z - t.wz);
        if (d < bestD) {
          bestD = d;
          src = { x: t.wx, z: t.wz };
        }
      }

      const steps = clamp(Math.ceil(bestD / 42), 2, 12);
      let prevTop = null;
      for (let s = 0; s <= steps; s++) {
        if (pylonIdx >= maxPylons) break;
        const t = s / steps;
        const px = src.x + (c.x - src.x) * t;
        const pz = src.z + (c.z - src.z) * t;
        const groundY = this.hydro.sampleAtWorld(px, pz).bed;

        _pos.set(px, groundY, pz);
        _quat.identity();
        _scale.set(1, 1, 1);
        _mat4.compose(_pos, _quat, _scale);
        this.pylonMesh.setMatrixAt(pylonIdx++, _mat4);

        const topY = groundY + 11.2;
        if (prevTop && wireFloats + 6 <= this.wirePositions.length) {
          this.wirePositions[wireFloats++] = prevTop.x;
          this.wirePositions[wireFloats++] = prevTop.y;
          this.wirePositions[wireFloats++] = prevTop.z;
          this.wirePositions[wireFloats++] = px;
          this.wirePositions[wireFloats++] = topY;
          this.wirePositions[wireFloats++] = pz;
        }
        prevTop = { x: px, y: topY, z: pz };
      }
    }

    // Очищаем оставшиеся сегменты проводов
    for (let k = wireFloats; k < this.wirePositions.length; k++) {
      this.wirePositions[k] = 0;
    }

    this.pylonMesh.count = pylonIdx;
    this.pylonMesh.instanceMatrix.needsUpdate = true;
    this.wireAttr.needsUpdate = true;
  }

  /** Плавная смена освещения суток (утро -> полдень -> золотой вечерний пик -> звёздная ночь с огнями городов!) */
  updateAtmosphere(hour, weather) {
    const sunAngle = ((hour - 6.0) / 24.0) * Math.PI * 2.0;
    const sunY = Math.sin(sunAngle);
    const sunXZ = Math.cos(sunAngle);

    const sunDir = new THREE.Vector3(sunXZ * 0.78, Math.max(-0.35, sunY), 0.48).normalize();
    const dayFactor = clamp((sunY + 0.16) / 0.65, 0.0, 1.0);
    const sunsetFactor = Math.exp(-Math.pow((sunY - 0.08) / 0.18, 2.0));

    // Цвета неба, солнца и тумана
    const nightZenith = new THREE.Color(0x091426);
    const dayZenith = new THREE.Color(0x2563ab);
    const nightHor = new THREE.Color(0x132642);
    const dayHor = new THREE.Color(0x9ecae8);
    const sunsetHor = new THREE.Color(0xf29f67);

    this.skyColorZenith.copy(nightZenith).lerp(dayZenith, dayFactor);
    this.skyColorHorizon.copy(nightHor).lerp(dayHor, dayFactor).lerp(sunsetHor, sunsetFactor * 0.62);
    this.fogColor.copy(this.skyColorHorizon);

    const sunCol = new THREE.Color(0x3b588c)
      .lerp(new THREE.Color(0xfff5e2), dayFactor)
      .lerp(new THREE.Color(0xffa95e), sunsetFactor * 0.75);

    this.sunLight.position.copy(sunDir).multiplyScalar(320);
    this.sunLight.color.copy(sunCol);
    this.sunLight.intensity = (0.18 + 1.32 * dayFactor) * weather.sunIntensity;
    this.hemiLight.intensity = 0.25 + 0.55 * dayFactor;
    this.scene.background.copy(this.fogColor);

    // Пробрасываем в шейдеры рельефа и воды
    const lightDirForShaders = sunY > -0.05 ? sunDir : new THREE.Vector3(-sunDir.x, 0.35, -sunDir.z).normalize();
    this.terrainMat.uniforms.uSunDir.value.copy(lightDirForShaders);
    this.terrainMat.uniforms.uSunColor.value.copy(sunCol).multiplyScalar(0.32 + 0.78 * dayFactor);
    this.terrainMat.uniforms.uSkyColor.value.copy(this.skyColorZenith).lerp(new THREE.Color(0xffffff), 0.35);
    this.terrainMat.uniforms.uFogColor.value.copy(this.fogColor);
    this.terrainMat.uniforms.uFogDensity.value = weather.fogDensity;

    this.waterMat.uniforms.uSunDir.value.copy(lightDirForShaders);
    this.waterMat.uniforms.uSunColor.value.copy(sunCol).multiplyScalar(dayFactor);
    this.waterMat.uniforms.uSkyZenith.value.copy(this.skyColorZenith);
    this.waterMat.uniforms.uSkyHorizon.value.copy(this.skyColorHorizon);
    this.waterMat.uniforms.uFogColor.value.copy(this.fogColor);
    this.waterMat.uniforms.uFogDensity.value = weather.fogDensity;

    if (this.cityBodyMat) {
      this.cityBodyMat.uniforms.uSunDir.value.copy(lightDirForShaders);
      this.cityBodyMat.uniforms.uSunColor.value.copy(sunCol).multiplyScalar(0.28 + 0.82 * dayFactor);
      this.cityBodyMat.uniforms.uSkyColor.value.copy(this.skyColorZenith).lerp(new THREE.Color(0xffffff), 0.35);
      this.cityBodyMat.uniforms.uNightFactor.value = clamp(1.0 - (sunY + 0.05) / 0.28, 0.0, 1.0);
      this.cityBodyMat.uniforms.uFogColor.value.copy(this.fogColor);
      this.cityBodyMat.uniforms.uFogDensity.value = weather.fogDensity;
    }

    // Пульсация маячка орошения, пока Агродолина ждёт воду
    if (this.irrBeacon) {
      this.irrBeacon.visible = !this.economy.agroIrrigated;
      if (this.irrBeacon.visible) {
        const s = 1.0 + Math.sin(performance.now() * 0.004) * 0.08;
        this.irrBeacon.scale.set(s, 1, s);
      }
    }

    return { isNight: sunY < 0.06, dayFactor };
  }

  updateCursor(wx, wz, radius, toolId, yawAngle, visible) {
    this.cursorGroup.visible = visible;
    if (!visible) return;
    const s = this.hydro.sampleAtWorld(wx, wz);
    const y = Math.max(s.bed, s.surface) + 0.35;
    this.cursorGroup.position.set(wx, y, wz);
    this.cursorRing.scale.set(radius, radius, 1);

    const isUnit = toolId === 'spillway' || toolId.startsWith('turbine_');
    this.flowArrow.visible = isUnit;
    if (isUnit) {
      const { gx, gz } = this.hydro.worldToGrid(wx, wz);
      const dir = this.hydro.detectHydraulicDirection(gx, gz, yawAngle);
      this.flowArrow.rotation.y = -dir.yaw;
      this.cursorRingMat.color.setHex(0x34d399);
    } else if (toolId === 'canal_dig') {
      this.cursorRingMat.color.setHex(0x38bdf8);
    } else if (toolId === 'concrete_dam' || toolId === 'earth_dam') {
      this.cursorRingMat.color.setHex(0xfbbf24);
    } else if (toolId === 'demolish') {
      this.cursorRingMat.color.setHex(0xef4444);
    } else {
      this.cursorRingMat.color.setHex(0xa78bfa);
    }
  }
}
