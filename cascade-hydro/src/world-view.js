// ============================================================================
//  3D-РЕНДЕРЕР МИРА И ОБЪЁМНОЙ СТРОЙКИ «КАСКАД: ЖИВАЯ ВОДА v2»
//  - Процедурные текстуры бетона с опалубкой, стали, черепицы, хвои и гранита
//  - Объёмные 3D-блоки плотин, наклонные контрфорсы, арматурная опалубка и борта каналов (InstancedMesh!)
//  - Анимированные 3D башенные краны с поворотной стрелой и бадьёй бетона на активных стройках
//  - Водоприёмники, стальные 3D напорные водоводы, козловые краны ГЭС и подстанции ОРУ 110 кВ
//  - Провисающие по цепной линии провода ЛЭП и 3D-маяк пошагового обучения
// ============================================================================

import * as THREE from 'three';
import { WORLD } from './config.js';
import { clamp, makeRng } from './noise.js';
import {
  createValleyTerrainMaterial,
  createRealisticWaterMaterial,
  createCityFacadeMaterial,
} from './water-shader.js';
import { buildAllProceduralTextures } from './textures.js';

const _mat4 = new THREE.Matrix4();
const _pos = new THREE.Vector3();
const _quat = new THREE.Quaternion();
const _scale = new THREE.Vector3();
const _euler = new THREE.Euler();
const _color = new THREE.Color();

/** Создаёт 2-ярусную крону ели/сосны в одной геометрии (0 лишних draw calls!) */
function createLayeredPineCrownGeometry() {
  const g1 = new THREE.ConeGeometry(1.95, 3.8, 7);
  g1.translate(0, 3.5, 0);
  const g2 = new THREE.ConeGeometry(1.42, 3.3, 7);
  g2.translate(0, 5.5, 0);

  const p1 = g1.attributes.position.array;
  const n1 = g1.attributes.normal.array;
  const u1 = g1.attributes.uv.array;
  const i1 = g1.index.array;

  const p2 = g2.attributes.position.array;
  const n2 = g2.attributes.normal.array;
  const u2 = g2.attributes.uv.array;
  const i2 = g2.index.array;

  const vCount1 = p1.length / 3;
  const pos = new Float32Array(p1.length + p2.length);
  pos.set(p1, 0);
  pos.set(p2, p1.length);

  const norm = new Float32Array(n1.length + n2.length);
  norm.set(n1, 0);
  norm.set(n2, n1.length);

  const uv = new Float32Array(u1.length + u2.length);
  uv.set(u1, 0);
  uv.set(u2, u1.length);

  const idx = new Uint16Array(i1.length + i2.length);
  idx.set(i1, 0);
  for (let k = 0; k < i2.length; k++) {
    idx[i1.length + k] = i2[k] + vCount1;
  }

  const out = new THREE.BufferGeometry();
  out.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  out.setAttribute('normal', new THREE.BufferAttribute(norm, 3));
  out.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  out.setIndex(new THREE.BufferAttribute(idx, 1));
  g1.dispose();
  g2.dispose();
  return out;
}

export class WorldView {
  constructor(scene, hydro, economy, qualityProfile, renderer = null, prebuiltTextures = null) {
    this.scene = scene;
    this.hydro = hydro;
    this.economy = economy;
    this.profile = qualityProfile;

    this.textures = prebuiltTextures || buildAllProceduralTextures(renderer);
    this.detailTex = this.textures.waterDetail;

    // Освещение долины 768×768 м
    this.hemiLight = new THREE.HemisphereLight(0x8ec5ff, 0x3d4f35, 0.74);
    this.scene.add(this.hemiLight);

    this.sunLight = new THREE.DirectionalLight(0xfff3db, 1.48);
    this.sunLight.position.set(220, 310, 170);
    if (qualityProfile.shadows) {
      this.sunLight.castShadow = true;
      this.sunLight.shadow.mapSize.set(2048, 2048);
      this.sunLight.shadow.camera.near = 40;
      this.sunLight.shadow.camera.far = 960;
      const d = 395;
      this.sunLight.shadow.camera.left = -d;
      this.sunLight.shadow.camera.right = d;
      this.sunLight.shadow.camera.top = d;
      this.sunLight.shadow.camera.bottom = -d;
      this.sunLight.shadow.bias = -0.0007;
    }
    this.scene.add(this.sunLight);

    this.skyColorZenith = new THREE.Color(0x2864ad);
    this.skyColorHorizon = new THREE.Color(0xa6cde8);
    this.fogColor = new THREE.Color(0xa6cde8);
    this.scene.background = this.fogColor.clone();

    // 1. Меш рельефа и меш воды
    this._buildTerrainMesh();
    this._buildWaterMesh();

    // 2. Текстурированные леса и гранитные валуны
    this._buildNatureInstances();

    // 3. Саморастущие 5 городов с текстурированными кровлями и фасадами
    this.cityDisksGroup = new THREE.Group();
    this.scene.add(this.cityDisksGroup);
    this._buildCityInstancedPools();
    this._rebuildCityDisks();

    // 4. Объёмная 3D-стройка: монолитные блоки плотин, контрфорсы, опалубка с арматурой, борта каналов и башенные краны!
    this._buildVolumetricConstructionPools();

    // 5. Машинные залы ГЭС с водоводами, затворы, подстанции ОРУ 110 кВ и ЛЭП
    this.structuresGroup = new THREE.Group();
    this.scene.add(this.structuresGroup);
    this.structMeshes = new Map();
    this._buildPowerLinePools();

    // 6. 3D голограмма курсора, маяк орошения и 3D-маяк обучения
    this._buildCursorPreview();
    this._buildIrrigationBeacon();
    this._buildTutorialBeacon();
  }

  /** Перестройка визуального мира при загрузке новой карты долины */
  rebuildForNewValley() {
    const g = this.hydro.grid;
    this.updateTerrainGeometryRect(0, 0, g - 1, g - 1);
    this._populateNatureInstances();
    this._rebuildCityDisks();

    for (const [, obj] of this.structMeshes.entries()) {
      this.structuresGroup.remove(obj);
    }
    this.structMeshes.clear();

    if (this.irrBeacon) {
      const bed = this.hydro.sampleAtWorld(168, 98).bed;
      this.irrBeacon.position.set(168, bed + 0.38, 98);
    }

    this.hydro.engineeredDirty = true;
    this.economy.buildingsDirty = true;
    this.economy.powerLinesDirty = true;
    this.syncEngineeredVolumes(0);
    this.syncCityInstances();
    this.syncHydroStructures();
  }

  _buildTerrainMesh() {
    const g = this.hydro.grid;
    const count = g * g;
    const dx = this.hydro.dx;
    const half = WORLD.size * 0.5;

    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const normals = new Float32Array(count * 3);
    const meta = new Float32Array(count * 4);

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

    this.terrainMat = createValleyTerrainMaterial(this.detailTex, this.textures.concreteMap);
    this.terrainMesh = new THREE.Mesh(geo, this.terrainMat);
    this.terrainMesh.receiveShadow = !!this.profile.shadows;
    this.terrainMesh.castShadow = !!this.profile.shadows;
    this.terrainMesh.matrixAutoUpdate = false;
    this.terrainMesh.updateMatrix();
    this.scene.add(this.terrainMesh);

    const skirtMat = new THREE.MeshLambertMaterial({ color: 0x262c34, map: this.textures.rock });
    const skirtGeo = new THREE.BoxGeometry(WORLD.size, 32, WORLD.size);
    const skirt = new THREE.Mesh(skirtGeo, skirtMat);
    skirt.position.set(0, -15.6, 0);
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
    const maxTrees = this.profile.treeCount;
    const maxRocks = this.profile.rockCount;

    const trunkGeo = new THREE.CylinderGeometry(0.20, 0.38, 2.3, 6);
    trunkGeo.translate(0, 1.15, 0);
    const crownGeo = createLayeredPineCrownGeometry();

    const trunkMat = new THREE.MeshLambertMaterial({ map: this.textures.bark });
    const crownMat = new THREE.MeshLambertMaterial({ color: 0xffffff, map: this.textures.foliage });

    this.treeTrunks = new THREE.InstancedMesh(trunkGeo, trunkMat, maxTrees);
    this.treeCrowns = new THREE.InstancedMesh(crownGeo, crownMat, maxTrees);
    this.treeCrowns.castShadow = !!this.profile.shadows;
    this.treeTrunks.matrixAutoUpdate = false;
    this.treeCrowns.matrixAutoUpdate = false;
    this.scene.add(this.treeTrunks);
    this.scene.add(this.treeCrowns);

    const rockGeo = new THREE.DodecahedronGeometry(1.35, 1);
    const rockMat = new THREE.MeshLambertMaterial({ color: 0xd8dad6, map: this.textures.rock });
    this.rockInstances = new THREE.InstancedMesh(rockGeo, rockMat, maxRocks);
    this.rockInstances.castShadow = !!this.profile.shadows;
    this.rockInstances.matrixAutoUpdate = false;
    this.scene.add(this.rockInstances);

    this._populateNatureInstances();
  }

  _populateNatureInstances() {
    const rng = makeRng(424242);
    const maxTrees = this.profile.treeCount;
    const maxRocks = this.profile.rockCount;

    this.treeSlots = [];
    let placed = 0;
    let attempts = 0;
    while (placed < maxTrees && attempts < maxTrees * 8) {
      attempts++;
      const wx = (rng() - 0.5) * (WORLD.size - 28);
      const wz = (rng() - 0.5) * (WORLD.size - 28);
      const s = this.hydro.sampleAtWorld(wx, wz);
      if (s.depth > 0.02 || s.bed > 55 || s.bed < 7.2 || s.soil < 0.72) continue;

      let nearCity = false;
      for (const c of this.economy.cities) {
        if (Math.hypot(wx - c.x, wz - c.z) < c.plateauRadius * 1.08) {
          nearCity = true;
          break;
        }
      }
      if (nearCity) continue;

      const scale = 0.74 + rng() * 0.78;
      _pos.set(wx, s.bed - 0.15, wz);
      _euler.set(0, rng() * Math.PI * 2, 0);
      _quat.setFromEuler(_euler);
      _scale.set(scale, scale * (0.9 + rng() * 0.38), scale);
      _mat4.compose(_pos, _quat, _scale);

      this.treeTrunks.setMatrixAt(placed, _mat4);
      this.treeCrowns.setMatrixAt(placed, _mat4);
      _color.setHSL(0.30 + (rng() - 0.5) * 0.06, 0.44 + rng() * 0.16, 0.36 + rng() * 0.14);
      this.treeCrowns.setColorAt(placed, _color);

      this.treeSlots.push({ index: placed, wx, wz, baseBed: s.bed, alive: true });
      placed++;
    }

    this.treeTrunks.count = placed;
    this.treeCrowns.count = placed;
    this.treeTrunks.instanceMatrix.needsUpdate = true;
    this.treeCrowns.instanceMatrix.needsUpdate = true;
    if (this.treeCrowns.instanceColor) this.treeCrowns.instanceColor.needsUpdate = true;

    this.rockSlots = [];
    let rPlaced = 0;
    for (let i = 0; i < maxRocks * 5 && rPlaced < maxRocks; i++) {
      const wx = (rng() - 0.5) * (WORLD.size - 22);
      const wz = (rng() - 0.5) * (WORLD.size - 22);
      const s = this.hydro.sampleAtWorld(wx, wz);
      if (s.depth > 0.4) continue;
      let nearCity = false;
      for (const c of this.economy.cities) {
        if (Math.hypot(wx - c.x, wz - c.z) < c.plateauRadius) { nearCity = true; break; }
      }
      if (nearCity) continue;

      _pos.set(wx, s.bed + 0.18, wz);
      _euler.set(rng() * 3, rng() * 3, rng() * 3);
      _quat.setFromEuler(_euler);
      _scale.set(0.65 + rng() * 1.5, 0.45 + rng() * 0.95, 0.65 + rng() * 1.5);
      _mat4.compose(_pos, _quat, _scale);
      this.rockSlots.push({ index: rPlaced, wx, wz, baseBed: s.bed, alive: true });
      this.rockInstances.setMatrixAt(rPlaced++, _mat4);
    }
    this.rockInstances.count = rPlaced;
    this.rockInstances.instanceMatrix.needsUpdate = true;
  }

  _buildCityInstancedPools() {
    const maxB = 420;
    const bodyGeo = new THREE.BoxGeometry(1, 1, 1);
    bodyGeo.translate(0, 0.5, 0);
    this.cityPoweredArr = new Float32Array(maxB);
    this.cityPoweredAttr = new THREE.InstancedBufferAttribute(this.cityPoweredArr, 1);
    this.cityPoweredAttr.setUsage(THREE.DynamicDrawUsage);
    bodyGeo.setAttribute('aPowered', this.cityPoweredAttr);

    const roofGeo = new THREE.ConeGeometry(0.76, 0.44, 4);
    roofGeo.rotateY(Math.PI * 0.25);
    roofGeo.translate(0, 0.22, 0);

    this.cityBodyMat = createCityFacadeMaterial(this.textures.roof);
    const roofMat = new THREE.MeshLambertMaterial({ color: 0xffffff, map: this.textures.roof });

    this.cityBodies = new THREE.InstancedMesh(bodyGeo, this.cityBodyMat, maxB);
    this.cityRoofs = new THREE.InstancedMesh(roofGeo, roofMat, maxB);

    this.cityBodies.castShadow = !!this.profile.shadows;
    this.cityBodies.receiveShadow = !!this.profile.shadows;
    this.cityBodies.matrixAutoUpdate = false;
    this.cityRoofs.matrixAutoUpdate = false;

    this.scene.add(this.cityBodies);
    this.scene.add(this.cityRoofs);
  }

  _rebuildCityDisks() {
    while (this.cityDisksGroup.children.length > 0) {
      this.cityDisksGroup.remove(this.cityDisksGroup.children[0]);
    }
    for (const c of this.economy.cities) {
      const diskGeo = new THREE.RingGeometry(4.2, c.plateauRadius * 0.86, 36);
      diskGeo.rotateX(-Math.PI * 0.5);
      const diskMat = new THREE.MeshLambertMaterial({
        color: c.archetype === 'agro' ? 0x6f7f43 : 0x5c636c,
        map: this.textures.concreteMap,
        transparent: true,
        opacity: 0.46,
      });
      const disk = new THREE.Mesh(diskGeo, diskMat);
      const centerBed = this.hydro.sampleAtWorld(c.x, c.z).bed;
      disk.position.set(c.x, centerBed + 0.09, c.z);
      disk.matrixAutoUpdate = false;
      disk.updateMatrix();
      this.cityDisksGroup.add(disk);
    }
  }

  /**
   * 4. Пулы ОБЪЁМНОЙ 3D-СТРОЙКИ (всего 4 InstancedMesh + до 6 анимированных башенных кранов!)
   */
  _buildVolumetricConstructionPools() {
    const concMat = new THREE.MeshPhongMaterial({
      color: 0xdde3ea,
      map: this.textures.concreteMap,
      bumpMap: this.textures.concreteBump,
      bumpScale: 0.35,
      shininess: 14,
    });

    const rebarMat = new THREE.MeshLambertMaterial({
      color: 0xffffff,
      map: this.textures.rebarFormwork,
    });

    // 4.1 3D-монолитные секции бетонной плотины с оголовком-парапетом
    const damBlockGeo = new THREE.BoxGeometry(1, 1, 1);
    damBlockGeo.translate(0, 0.5, 0);
    this.damMonolithMesh = new THREE.InstancedMesh(damBlockGeo, concMat, 2200);
    this.damMonolithMesh.count = 0;
    this.damMonolithMesh.castShadow = !!this.profile.shadows;
    this.damMonolithMesh.receiveShadow = !!this.profile.shadows;
    this.damMonolithMesh.matrixAutoUpdate = false;
    this.scene.add(this.damMonolithMesh);

    // 4.2 3D-опалубка и армокаркас строящихся секций (показывает активные этапы стройки!)
    const cageGeo = new THREE.BoxGeometry(1.06, 1, 1.06);
    cageGeo.translate(0, 0.5, 0);
    this.scaffoldingMesh = new THREE.InstancedMesh(cageGeo, rebarMat, 1200);
    this.scaffoldingMesh.count = 0;
    this.scaffoldingMesh.castShadow = !!this.profile.shadows;
    this.scaffoldingMesh.matrixAutoUpdate = false;
    this.scene.add(this.scaffoldingMesh);

    // 4.3 3D-наклонные контрфорсы и скальные анкерные бычки ([6] Контрфорс / Цементация)
    const buttressGeo = new THREE.CylinderGeometry(0.32, 0.92, 1.0, 4);
    buttressGeo.rotateY(Math.PI * 0.25);
    buttressGeo.translate(0, 0.5, 0.25);
    this.buttressMesh = new THREE.InstancedMesh(buttressGeo, concMat, 1400);
    this.buttressMesh.count = 0;
    this.buttressMesh.castShadow = !!this.profile.shadows;
    this.buttressMesh.receiveShadow = !!this.profile.shadows;
    this.buttressMesh.matrixAutoUpdate = false;
    this.scene.add(this.buttressMesh);

    // 4.4 Объёмные 3D-борта железобетонных каналов ([3] Ж/Б лоток)
    const curbGeo = new THREE.BoxGeometry(1, 1, 1);
    curbGeo.translate(0, 0.5, 0);
    this.canalCurbMesh = new THREE.InstancedMesh(curbGeo, concMat, 1800);
    this.canalCurbMesh.count = 0;
    this.canalCurbMesh.receiveShadow = !!this.profile.shadows;
    this.canalCurbMesh.matrixAutoUpdate = false;
    this.scene.add(this.canalCurbMesh);

    // 4.5 Пул из 6 анимированных 3D башенных кранов на активных участках бетонирования!
    this.cranes = [];
    for (let i = 0; i < 6; i++) {
      const crane = this._createTowerCraneMesh(i);
      crane.visible = false;
      this.scene.add(crane);
      this.cranes.push(crane);
    }
  }

  _createTowerCraneMesh(seedIdx) {
    const grp = new THREE.Group();
    const yellowMat = new THREE.MeshLambertMaterial({ color: 0xf59e0b, map: this.textures.steel });
    const darkMat = new THREE.MeshLambertMaterial({ color: 0x334155, map: this.textures.concreteMap });

    // Бетонная крестовина основания крана
    const base = new THREE.Mesh(new THREE.BoxGeometry(4.2, 1.2, 4.2), darkMat);
    base.position.y = 0.6;
    grp.add(base);

    // Решётчатая мачта башенного крана
    const mast = new THREE.Mesh(new THREE.BoxGeometry(1.35, 19.0, 1.35), yellowMat);
    mast.position.y = 10.1;
    mast.castShadow = !!this.profile.shadows;
    grp.add(mast);

    // Поворотная оголовок-стрела (вращается во время заливки бетона!)
    const slew = new THREE.Group();
    slew.position.y = 19.6;

    const cab = new THREE.Mesh(new THREE.BoxGeometry(2.1, 2.2, 2.1), yellowMat);
    cab.position.set(0.6, 0.8, 0);

    const jib = new THREE.Mesh(new THREE.BoxGeometry(21.0, 0.95, 1.05), yellowMat);
    jib.position.set(4.5, 1.4, 0);
    jib.castShadow = !!this.profile.shadows;

    const apex = new THREE.Mesh(new THREE.ConeGeometry(0.9, 3.4, 4), yellowMat);
    apex.position.set(0, 3.4, 0);

    const counterWeight = new THREE.Mesh(new THREE.BoxGeometry(3.4, 1.8, 2.0), darkMat);
    counterWeight.position.set(-4.8, 0.9, 0);

    // Каретка, трос и бадья с бетоном («туфелька»)
    const hoist = new THREE.Group();
    hoist.position.set(10.5, 1.0, 0);
    const cable = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.08, 9.5, 5),
      new THREE.MeshBasicMaterial({ color: 0xcbd5e1 }),
    );
    cable.position.y = -4.75;
    const bucket = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 0.55, 1.8, 8), darkMat);
    bucket.position.y = -9.6;
    hoist.add(cable, bucket);

    slew.add(cab, jib, apex, counterWeight, hoist);
    grp.add(slew);

    grp.userData.slew = slew;
    grp.userData.hoist = hoist;
    grp.userData.seed = seedIdx * 1.7;
    return grp;
  }

  /** Обновляет все 3D-инстансы монолитных плотин, опалубки, контрфорсов и бортов каналов */
  syncEngineeredVolumes() {
    if (!this.hydro.engineeredDirty) return;
    this.hydro.engineeredDirty = false;

    const g = this.hydro.grid;
    const dx = this.hydro.dx;
    const half = WORLD.size * 0.5;
    const { bedrock, soil, concrete, targetConcrete, foundationMask, buttressYaw, linedMask, gateWall } = this.hydro;

    let damIdx = 0;
    let cageIdx = 0;
    let buttIdx = 0;
    let curbIdx = 0;

    const maxDam = this.damMonolithMesh.instanceMatrix.count;
    const maxCage = this.scaffoldingMesh.instanceMatrix.count;
    const maxButt = this.buttressMesh.instanceMatrix.count;
    const maxCurb = this.canalCurbMesh.instanceMatrix.count;

    for (let gz = 1; gz < g - 1; gz++) {
      const wz = -half + (gz + 0.5) * dx;
      const row = gz * g;
      for (let gx = 1; gx < g - 1; gx++) {
        const i = row + gx;
        const cH = concrete[i];
        const tH = targetConcrete[i];
        const reinf = foundationMask[i] === 1;
        const lined = linedMask[i] === 1;

        if (cH < 0.9 && tH < 0.9 && !reinf && !lined) continue;

        const wx = -half + (gx + 0.5) * dx;
        const baseElev = bedrock[i] + soil[i];

        // 1. Объёмный 3D-блок плотины (выступает рельефными картами опалубки и оголовком!)
        if (cH >= 1.35 && gateWall[i] < 0.05 && damIdx < maxDam) {
          _pos.set(wx, baseElev - 0.35, wz);
          _quat.identity();
          _scale.set(dx * 0.96, cH + 0.52, dx * 0.96);
          _mat4.compose(_pos, _quat, _scale);
          this.damMonolithMesh.setMatrixAt(damIdx++, _mat4);
        }

        // 2. Строительная 3D-опалубка с армокаркасом на строящихся секциях
        if (tH > cH + 0.08 && cageIdx < maxCage) {
          const cageBottom = baseElev + cH * 0.85;
          const cageHeight = Math.max(1.2, (tH - cH * 0.85) + 0.65);
          _pos.set(wx, cageBottom, wz);
          _quat.identity();
          _scale.set(dx * 1.02, cageHeight, dx * 1.02);
          _mat4.compose(_pos, _quat, _scale);
          this.scaffoldingMesh.setMatrixAt(cageIdx++, _mat4);
        }

        // 3. Объёмные наклонные 3D-контрфорсы и скальные анкерные опоры
        if (reinf && buttIdx < maxButt) {
          const totalH = Math.max(2.6, Math.max(cH, tH) * 0.92 + 1.4);
          _pos.set(wx, baseElev - 0.6, wz);
          _euler.set(0, -buttressYaw[i] + Math.PI * 0.5, 0);
          _quat.setFromEuler(_euler);
          _scale.set(dx * 0.88, totalH, dx * 1.38);
          _mat4.compose(_pos, _quat, _scale);
          this.buttressMesh.setMatrixAt(buttIdx++, _mat4);
        }

        // 4. Железобетонные бордюры/парапеты по бровке облицованного канала
        if (lined && cH < 1.1 && tH < 1.1 && curbIdx < maxCurb) {
          const isEdge = !linedMask[i - 1] || !linedMask[i + 1] || !linedMask[i - g] || !linedMask[i + g];
          if (isEdge) {
            _pos.set(wx, baseElev - 0.15, wz);
            _quat.identity();
            _scale.set(dx * 0.92, 0.72, dx * 0.92);
            _mat4.compose(_pos, _quat, _scale);
            this.canalCurbMesh.setMatrixAt(curbIdx++, _mat4);
          }
        }
      }
    }

    this.damMonolithMesh.count = damIdx;
    this.scaffoldingMesh.count = cageIdx;
    this.buttressMesh.count = buttIdx;
    this.canalCurbMesh.count = curbIdx;

    this.damMonolithMesh.instanceMatrix.needsUpdate = true;
    this.scaffoldingMesh.instanceMatrix.needsUpdate = true;
    this.buttressMesh.instanceMatrix.needsUpdate = true;
    this.canalCurbMesh.instanceMatrix.needsUpdate = true;
  }

  /** Плавная анимация башенных кранов над активными стройплощадками */
  animateConstructionCranes(timeSec) {
    const sites = this.hydro.activeBuildSites;
    for (let i = 0; i < this.cranes.length; i++) {
      const crane = this.cranes[i];
      if (i < sites.length) {
        const site = sites[i];
        crane.visible = true;
        crane.position.set(site.wx + 5.5, site.wy - 0.5, site.wz - 4.5);
        const phase = timeSec * 0.85 + crane.userData.seed;
        crane.userData.slew.rotation.y = Math.sin(phase) * 1.15;
        crane.userData.hoist.position.x = 8.5 + Math.cos(phase * 1.4) * 5.2;
      } else {
        crane.visible = false;
      }
    }
  }

  _buildPowerLinePools() {
    const maxPylons = 260;
    const pylonGeo = new THREE.CylinderGeometry(0.22, 1.05, 12.8, 4);
    pylonGeo.translate(0, 6.4, 0);
    const pylonMat = new THREE.MeshLambertMaterial({ color: 0xaab6c2, map: this.textures.steel });
    this.pylonMesh = new THREE.InstancedMesh(pylonGeo, pylonMat, maxPylons);
    this.pylonMesh.count = 0;
    this.pylonMesh.matrixAutoUpdate = false;
    this.scene.add(this.pylonMesh);

    // Поперечные траверсы опор ЛЭП (второй компактный инстанс)
    const armGeo = new THREE.BoxGeometry(4.6, 0.28, 0.35);
    armGeo.translate(0, 11.4, 0);
    this.pylonArmMesh = new THREE.InstancedMesh(armGeo, pylonMat, maxPylons);
    this.pylonArmMesh.count = 0;
    this.pylonArmMesh.matrixAutoUpdate = false;
    this.scene.add(this.pylonArmMesh);

    const wireGeo = new THREE.BufferGeometry();
    this.wirePositions = new Float32Array(maxPylons * 24);
    this.wireAttr = new THREE.BufferAttribute(this.wirePositions, 3);
    wireGeo.setAttribute('position', this.wireAttr);
    this.wireMat = new THREE.LineBasicMaterial({ color: 0xffe082, transparent: true, opacity: 0.88 });
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

    // 3D объёмная голограмма высоты строящейся плотины / контрфорса
    const ghostGeo = new THREE.CylinderGeometry(0.82, 1.0, 1.0, 20, 1, true);
    ghostGeo.translate(0, 0.5, 0);
    this.ghostVolumeMat = new THREE.MeshBasicMaterial({
      color: 0xfbbf24,
      transparent: true,
      opacity: 0.24,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    this.ghostVolume = new THREE.Mesh(ghostGeo, this.ghostVolumeMat);
    this.ghostVolume.visible = false;
    this.cursorGroup.add(this.ghostVolume);

    // Стрелка направления напора
    this.flowArrow = new THREE.Group();
    const shaft = new THREE.Mesh(
      new THREE.BoxGeometry(15, 0.85, 1.7),
      new THREE.MeshBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.82 }),
    );
    const cone = new THREE.Mesh(
      new THREE.ConeGeometry(2.9, 5.8, 12),
      new THREE.MeshBasicMaterial({ color: 0x34d399, transparent: true, opacity: 0.92 }),
    );
    cone.rotation.z = -Math.PI * 0.5;
    cone.position.x = 9.5;
    const intakeBall = new THREE.Mesh(
      new THREE.SphereGeometry(2.2, 12, 12),
      new THREE.MeshBasicMaterial({ color: 0x3b82f6, transparent: true, opacity: 0.86 }),
    );
    intakeBall.position.x = -9.5;
    this.flowArrow.add(shaft, cone, intakeBall);
    this.flowArrow.visible = false;
    this.cursorGroup.add(this.flowArrow);

    this.scene.add(this.cursorGroup);
  }

  _buildIrrigationBeacon() {
    const ringGeo = new THREE.RingGeometry(10.5, 12.6, 32);
    ringGeo.rotateX(-Math.PI * 0.5);
    this.irrRingMat = new THREE.MeshBasicMaterial({
      color: 0x34d399,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.58,
    });
    const bed = this.hydro.sampleAtWorld(168, 98).bed;
    this.irrBeacon = new THREE.Mesh(ringGeo, this.irrRingMat);
    this.irrBeacon.position.set(168, bed + 0.38, 98);
    this.scene.add(this.irrBeacon);
  }

  /** Светящийся 3D-маяк цели текущего шага обучения в долине! */
  _buildTutorialBeacon() {
    this.tutorialBeacon = new THREE.Group();
    this.tutorialBeacon.visible = false;

    const ring = new THREE.Mesh(
      new THREE.RingGeometry(9.0, 11.4, 36),
      new THREE.MeshBasicMaterial({ color: 0x22d3ee, side: THREE.DoubleSide, transparent: true, opacity: 0.82 }),
    );
    ring.rotateX(-Math.PI * 0.5);

    const beam = new THREE.Mesh(
      new THREE.CylinderGeometry(1.4, 4.5, 36, 16, 1, true),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide, transparent: true, opacity: 0.22, depthWrite: false }),
    );
    beam.position.y = 18;

    const pointer = new THREE.Mesh(
      new THREE.ConeGeometry(3.4, 6.8, 6),
      new THREE.MeshBasicMaterial({ color: 0xfde047 }),
    );
    pointer.rotation.x = Math.PI;
    pointer.position.y = 22;

    this.tutorialBeacon.add(ring, beam, pointer);
    this.tutorialBeacon.userData.pointer = pointer;
    this.scene.add(this.tutorialBeacon);
  }

  setTutorialTarget(wx, wz, visible = true) {
    if (!this.tutorialBeacon) return;
    this.tutorialBeacon.visible = visible;
    if (!visible) return;
    const s = this.hydro.sampleAtWorld(wx, wz);
    this.tutorialBeacon.position.set(wx, Math.max(s.bed, s.surface) + 0.45, wz);
  }

  updateTerrainGeometryRect(x0, z0, x1, z1) {
    const g = this.hydro.grid;
    const dx = this.hydro.dx;
    const pos = this.terrainPosAttr.array;
    const norm = this.terrainNormAttr.array;
    const meta = this.terrainMetaAttr.array;
    const { zb, soil, concrete, formworkWall, wetness, h, linedMask } = this.hydro;

    for (let gz = z0; gz <= z1; gz++) {
      const row = gz * g;
      for (let gx = x0; gx <= x1; gx++) {
        const i = row + gx;
        pos[i * 3 + 1] = zb[i];
        const i4 = i * 4;
        meta[i4] = soil[i];
        meta[i4 + 1] = Math.max(concrete[i], formworkWall[i] * 0.5) + (linedMask[i] ? 0.5 : 0.0);
        meta[i4 + 2] = wetness[i];
        meta[i4 + 3] = h[i];
      }
    }

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
          if (Math.abs(s.bed - tr.baseBed) > 0.35 || s.concrete > 0.1 || s.targetConcrete > 0.1 || s.lined) {
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
            if (Math.abs(s.bed - rk.baseBed) > 0.3 || s.concrete > 0.1 || s.targetConcrete > 0.1 || s.lined) {
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

  updateWaterAndWetness(timeSec) {
    const g = this.hydro.grid;
    const twoDx = 2.0 * this.hydro.dx;
    const { zb, h, u, v, foam, sediment, vort, wetness, soil, concrete, formworkWall, linedMask } = this.hydro;

    const wPos = this.waterPosAttr.array;
    const wNorm = this.waterNormAttr.array;
    const h1 = this.waterH1Attr.array;
    const h2 = this.waterH2Attr.array;
    const tMeta = this.terrainMetaAttr.array;

    for (let gz = 0; gz < g; gz++) {
      const row = gz * g;
      for (let gx = 0; gx < g; gx++) {
        const i = row + gx;
        const depth = h[i];
        const i3 = i * 3;
        const i4 = i * 4;

        tMeta[i4] = soil[i];
        tMeta[i4 + 1] = Math.max(concrete[i], formworkWall[i] * 0.5) + (linedMask[i] ? 0.5 : 0.0);
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
          wNorm[i3 + 2] = -dzsSafe(dsdz) / len;
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
        _color.setHSL(0.56 + b.tint * 0.06, 0.30, 0.58);
      } else if (b.kind === 'factory') {
        _color.setHex(0x948274);
      } else if (b.kind === 'greenhouse') {
        _color.setHex(0xa7e8bd);
      } else if (b.kind === 'apartment') {
        _color.setHSL(0.08 + b.tint * 0.08, 0.24, 0.74);
      } else {
        _color.setHSL(0.09 + b.tint * 0.05, 0.36, 0.68);
      }
      this.cityBodies.setColorAt(i, _color);

      if (b.kind === 'cottage' || b.kind === 'townhouse') {
        _pos.set(b.wx, b.wy - 0.25 + animH, b.wz);
        _scale.set(b.sx * 1.08, 1.9 + b.sy * 0.18, b.sz * 1.08);
        _mat4.compose(_pos, _quat, _scale);
        _color.setHex(b.kind === 'cottage' ? 0xb44c38 : 0x7a5244);
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

  /** Синхронизирует объёмные 3D-комплексы ГЭС (с водоприёмником и водоводом!), затворы и подстанции ОРУ 110 кВ */
  syncHydroStructures() {
    const activeIds = new Set();

    // 1. Машинные залы ГЭС с водоводами
    for (const t of this.hydro.turbines) {
      activeIds.add(`t_${t.id}`);
      let meshGroup = this.structMeshes.get(`t_${t.id}`);
      if (!meshGroup) {
        meshGroup = this._createTurbinePowerhouseMesh(t);
        this.structMeshes.set(`t_${t.id}`, meshGroup);
        this.structuresGroup.add(meshGroup);
        this.economy.powerLinesDirty = true;
      }
      const rotor = meshGroup.userData.rotor;
      if (rotor) rotor.rotation.y = t.rotorPhase;
      const lamp = meshGroup.userData.statusLamp;
      if (lamp) lamp.material.color.setHex(t.powerMW > 0.1 ? 0x34d399 : 0xf59e0b);
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
      const gateLeaf = swGroup.userData.gateLeaf;
      if (gateLeaf) {
        gateLeaf.position.y = sw.sillElev + sw.wallHeight * 0.5 + sw.openRatio * (sw.wallHeight * 0.78);
      }
    }

    // 3. Узловые 3D-подстанции ОРУ 110 кВ
    for (const sub of this.hydro.substations) {
      activeIds.add(`u_${sub.id}`);
      let subGroup = this.structMeshes.get(`u_${sub.id}`);
      if (!subGroup) {
        subGroup = this._createSubstationMesh(sub);
        this.structMeshes.set(`u_${sub.id}`, subGroup);
        this.structuresGroup.add(subGroup);
        this.economy.powerLinesDirty = true;
      }
    }

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

    const concMat = new THREE.MeshLambertMaterial({ color: 0xe2e8f0, map: this.textures.concreteMap });
    const steelMat = new THREE.MeshLambertMaterial({ color: 0xcbd5e1, map: this.textures.steel });
    const accentMat = new THREE.MeshLambertMaterial({ color: t.spec.color, map: this.textures.steel });

    const hallY = t.crestY;
    // Массивный цоколь турбинной камеры до дна + машинный зал
    const subHeight = Math.max(6.0, hallY - t.baseY + 2.0);
    const substructure = new THREE.Mesh(new THREE.BoxGeometry(10.6, subHeight, 10.2), concMat);
    substructure.position.set(0, hallY - subHeight * 0.5 + 0.5, 0);
    substructure.castShadow = !!this.profile.shadows;

    const hall = new THREE.Mesh(new THREE.BoxGeometry(10.2, 6.8, 9.6), concMat);
    hall.position.set(0, hallY + 3.4, 0);
    hall.castShadow = !!this.profile.shadows;

    const roofBand = new THREE.Mesh(new THREE.BoxGeometry(10.8, 1.0, 10.2), accentMat);
    roofBand.position.set(0, hallY + 7.1, 0);

    // Козловой кран на крыше машинного зала ГЭС!
    const gantryL = new THREE.Mesh(new THREE.BoxGeometry(0.55, 3.6, 8.8), steelMat);
    gantryL.position.set(-3.6, hallY + 9.2, 0);
    const gantryR = gantryL.clone();
    gantryR.position.x = 3.6;
    const gantryBeam = new THREE.Mesh(new THREE.BoxGeometry(8.2, 0.75, 1.2), accentMat);
    gantryBeam.position.set(0, hallY + 10.8, 0);

    // Вращающийся гидрогенератор
    const rotor = new THREE.Group();
    rotor.position.set(0, hallY + 8.1, 0);
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(1.45, 1.45, 1.3, 12), steelMat);
    const blade1 = new THREE.Mesh(new THREE.BoxGeometry(5.6, 0.38, 0.95), accentMat);
    const blade2 = blade1.clone();
    blade2.rotation.y = Math.PI * 0.5;
    rotor.add(hub, blade1, blade2);

    // 3D водоприёмный оголовок с сороудерживающей решёткой в верхнем бьефе (-X в локальных координатах!)
    const intakeDist = Math.hypot(t.intakeWx - t.wx, t.intakeWz - t.wz);
    const intakeTowerH = Math.max(7.5, hallY - t.intakeBedY + 2.5);
    const intakeTower = new THREE.Mesh(new THREE.BoxGeometry(4.6, intakeTowerH, 6.8), concMat);
    intakeTower.position.set(-intakeDist + 2.2, t.intakeBedY + intakeTowerH * 0.5, 0);

    const trashrack = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, intakeTowerH * 0.72, 5.4),
      new THREE.MeshLambertMaterial({ color: 0x334155, map: this.textures.steel }),
    );
    trashrack.position.set(-intakeDist - 0.1, t.intakeBedY + intakeTowerH * 0.42, 0);

    // 3D стальной напорный трубопровод (Penstock) от водоприёмника к спиральной камере турбины!
    const pStart = new THREE.Vector3(-intakeDist + 2.5, Math.max(t.intakeBedY + 2.2, hallY - 2.6), 0);
    const pEnd = new THREE.Vector3(-3.2, Math.max(t.outfallBedY + 2.0, hallY - 5.5), 0);
    const pVec = new THREE.Vector3().subVectors(pEnd, pStart);
    const pLen = Math.max(2.0, pVec.length());
    const penstockRadius = t.type === 'francis' ? 1.55 : (t.type === 'pelton' ? 1.25 : 1.70);
    const penstock = new THREE.Mesh(
      new THREE.CylinderGeometry(penstockRadius, penstockRadius, pLen, 14),
      steelMat,
    );
    penstock.position.copy(pStart).addScaledVector(pVec, 0.5);
    penstock.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), pVec.clone().normalize());
    penstock.castShadow = !!this.profile.shadows;

    // Бетонный выходной портал отсасывающей трубы в нижнем бьефе (+X)
    const draftPortal = new THREE.Mesh(new THREE.BoxGeometry(4.2, 4.4, 7.6), concMat);
    draftPortal.position.set(5.8, t.outfallBedY + 2.2, 0);

    // Блочный трансформатор и портал выдачи мощности
    const xfmr = new THREE.Mesh(new THREE.BoxGeometry(2.9, 3.1, 2.7), steelMat);
    xfmr.position.set(-2.2, hallY + 1.55, 5.8);

    const statusLamp = new THREE.Mesh(
      new THREE.SphereGeometry(0.7, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0xf59e0b }),
    );
    statusLamp.position.set(3.6, hallY + 8.2, 0);

    grp.add(
      substructure, hall, roofBand, gantryL, gantryR, gantryBeam,
      rotor, intakeTower, trashrack, penstock, draftPortal, xfmr, statusLamp,
    );
    grp.userData.rotor = rotor;
    grp.userData.statusLamp = statusLamp;
    return grp;
  }

  _createSpillwayMesh(sw) {
    const grp = new THREE.Group();
    grp.position.set(sw.wx, 0, sw.wz);
    grp.rotation.y = -sw.yaw;

    const pierMat = new THREE.MeshLambertMaterial({ color: 0xcbd5e1, map: this.textures.concreteMap });
    const steelMat = new THREE.MeshLambertMaterial({ color: 0xd97706, map: this.textures.steel });

    const pierL = new THREE.Mesh(new THREE.BoxGeometry(9.6, sw.wallHeight + 5.2, 1.7), pierMat);
    pierL.position.set(0, sw.sillElev + (sw.wallHeight + 5.2) * 0.5 - 1, -4.5);
    pierL.castShadow = !!this.profile.shadows;
    const pierR = pierL.clone();
    pierR.position.z = 4.5;

    const bridge = new THREE.Mesh(new THREE.BoxGeometry(2.8, 1.4, 11.0), pierMat);
    bridge.position.set(0, sw.sillElev + sw.wallHeight + 4.2, 0);

    const gateLeaf = new THREE.Mesh(new THREE.BoxGeometry(1.25, sw.wallHeight, 7.6), steelMat);
    gateLeaf.position.set(0, sw.sillElev + sw.wallHeight * 0.5, 0);

    const flipBucket = new THREE.Mesh(new THREE.BoxGeometry(5.2, 1.6, 7.8), pierMat);
    flipBucket.rotation.z = 0.25;
    flipBucket.position.set(5.0, sw.sillElev + 0.45, 0);

    grp.add(pierL, pierR, bridge, gateLeaf, flipBucket);
    grp.userData.gateLeaf = gateLeaf;
    return grp;
  }

  /** Детализированная 3D-подстанция ОРУ 110 кВ */
  _createSubstationMesh(sub) {
    const grp = new THREE.Group();
    grp.position.set(sub.wx, sub.wy, sub.wz);

    const concMat = new THREE.MeshLambertMaterial({ color: 0xcbd5e1, map: this.textures.concreteMap });
    const steelMat = new THREE.MeshLambertMaterial({ color: 0x94a3b8, map: this.textures.steel });
    const copperMat = new THREE.MeshLambertMaterial({ color: 0x38bdf8 });

    const pad = new THREE.Mesh(new THREE.BoxGeometry(16.5, 1.0, 14.5), concMat);
    pad.position.y = -0.3;
    grp.add(pad);

    // 2 мощных автотрансформатора 110 кВ
    for (const ox of [-3.6, 3.6]) {
      const tx = new THREE.Mesh(new THREE.BoxGeometry(3.8, 3.8, 4.6), steelMat);
      tx.position.set(ox, 2.0, 0);
      tx.castShadow = !!this.profile.shadows;
      grp.add(tx);

      // Высоковольтные вводы-изоляторы
      for (const oz of [-1.2, 0, 1.2]) {
        const bush = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.26, 2.1, 6), copperMat);
        bush.position.set(ox, 4.8, oz);
        grp.add(bush);
      }
    }

    // Высокие П-образные порталы ошиновки 110 кВ
    for (const pz of [-5.2, 5.2]) {
      const legL = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.42, 11.5, 4), steelMat);
      legL.position.set(-5.8, 5.75, pz);
      const legR = legL.clone();
      legR.position.x = 5.8;
      const crossbar = new THREE.Mesh(new THREE.BoxGeometry(12.8, 0.45, 0.45), steelMat);
      crossbar.position.set(0, 11.2, pz);
      grp.add(legL, legR, crossbar);
    }

    const beacon = new THREE.Mesh(
      new THREE.SphereGeometry(0.65, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8 }),
    );
    beacon.position.set(0, 12.2, 5.2);
    grp.add(beacon);

    return grp;
  }

  _rebuildPowerLines() {
    const defaultHub = this.hydro.substations.length > 0
      ? { x: this.hydro.substations[0].wx, z: this.hydro.substations[0].wz }
      : (this.hydro.turbines.length > 0
        ? { x: this.hydro.turbines[0].wx, z: this.hydro.turbines[0].wz }
        : { x: 12, z: -152 });

    let pylonIdx = 0;
    let wireFloats = 0;
    const maxPylons = this.pylonMesh.instanceMatrix.count;

    // Если есть и турбины, и ОРУ 110 кВ — соединяем турбины с ближайшей ОРУ!
    const corridors = [];
    for (const sub of this.hydro.substations) {
      for (const t of this.hydro.turbines) {
        if (Math.hypot(t.wx - sub.wx, t.wz - sub.wz) < 160) {
          corridors.push({ x0: t.wx, z0: t.wz, x1: sub.wx, z1: sub.wz });
        }
      }
    }

    for (const c of this.economy.cities) {
      if (!c.connected) continue;
      let src = defaultHub;
      let bestD = Math.hypot(c.x - src.x, c.z - src.z);
      for (const sub of this.hydro.substations) {
        const d = Math.hypot(c.x - sub.wx, c.z - sub.wz);
        if (d < bestD) { bestD = d; src = { x: sub.wx, z: sub.wz }; }
      }
      for (const t of this.hydro.turbines) {
        const d = Math.hypot(c.x - t.wx, c.z - t.wz);
        if (d < bestD) { bestD = d; src = { x: t.wx, z: t.wz }; }
      }
      corridors.push({ x0: src.x, z0: src.z, x1: c.x, z1: c.z });
    }

    for (const corr of corridors) {
      const dist = Math.hypot(corr.x1 - corr.x0, corr.z1 - corr.z0);
      const steps = clamp(Math.ceil(dist / 46), 2, 14);
      const yaw = Math.atan2(corr.x1 - corr.x0, corr.z1 - corr.z0);
      let prevTop = null;

      for (let s = 0; s <= steps; s++) {
        if (pylonIdx >= maxPylons) break;
        const t = s / steps;
        const px = corr.x0 + (corr.x1 - corr.x0) * t;
        const pz = corr.z0 + (corr.z1 - corr.z0) * t;
        const groundY = this.hydro.sampleAtWorld(px, pz).bed;

        _pos.set(px, groundY, pz);
        _euler.set(0, yaw, 0);
        _quat.setFromEuler(_euler);
        _scale.set(1, 1, 1);
        _mat4.compose(_pos, _quat, _scale);
        this.pylonMesh.setMatrixAt(pylonIdx, _mat4);
        this.pylonArmMesh.setMatrixAt(pylonIdx, _mat4);
        pylonIdx++;

        const topY = groundY + 12.1;
        if (prevTop && wireFloats + 12 <= this.wirePositions.length) {
          // Двухсегментное провисание провода по параболе (эффект реального троса!)
          const midX = (prevTop.x + px) * 0.5;
          const midZ = (prevTop.z + pz) * 0.5;
          const midY = (prevTop.y + topY) * 0.5 - 1.85;

          this.wirePositions[wireFloats++] = prevTop.x;
          this.wirePositions[wireFloats++] = prevTop.y;
          this.wirePositions[wireFloats++] = prevTop.z;
          this.wirePositions[wireFloats++] = midX;
          this.wirePositions[wireFloats++] = midY;
          this.wirePositions[wireFloats++] = midZ;

          this.wirePositions[wireFloats++] = midX;
          this.wirePositions[wireFloats++] = midY;
          this.wirePositions[wireFloats++] = midZ;
          this.wirePositions[wireFloats++] = px;
          this.wirePositions[wireFloats++] = topY;
          this.wirePositions[wireFloats++] = pz;
        }
        prevTop = { x: px, y: topY, z: pz };
      }
    }

    for (let k = wireFloats; k < this.wirePositions.length; k++) {
      this.wirePositions[k] = 0;
    }

    this.pylonMesh.count = pylonIdx;
    this.pylonArmMesh.count = pylonIdx;
    this.pylonMesh.instanceMatrix.needsUpdate = true;
    this.pylonArmMesh.instanceMatrix.needsUpdate = true;
    this.wireAttr.needsUpdate = true;
  }

  updateAtmosphere(hour, weather) {
    const sunAngle = ((hour - 6.0) / 24.0) * Math.PI * 2.0;
    const sunY = Math.sin(sunAngle);
    const sunXZ = Math.cos(sunAngle);

    const sunDir = new THREE.Vector3(sunXZ * 0.78, Math.max(-0.35, sunY), 0.48).normalize();
    const dayFactor = clamp((sunY + 0.16) / 0.65, 0.0, 1.0);
    const sunsetFactor = Math.exp(-Math.pow((sunY - 0.08) / 0.18, 2.0));

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

    this.sunLight.position.copy(sunDir).multiplyScalar(420);
    this.sunLight.color.copy(sunCol);
    this.sunLight.intensity = (0.18 + 1.34 * dayFactor) * weather.sunIntensity;
    this.hemiLight.intensity = 0.26 + 0.56 * dayFactor;
    this.scene.background.copy(this.fogColor);

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

    const now = performance.now();
    if (this.irrBeacon) {
      this.irrBeacon.visible = !this.economy.agroIrrigated;
      if (this.irrBeacon.visible) {
        const s = 1.0 + Math.sin(now * 0.004) * 0.08;
        this.irrBeacon.scale.set(s, 1, s);
      }
    }

    if (this.tutorialBeacon && this.tutorialBeacon.visible) {
      const pulse = 1.0 + Math.sin(now * 0.0055) * 0.10;
      this.tutorialBeacon.scale.set(pulse, 1, pulse);
      this.tutorialBeacon.userData.pointer.position.y = 21 + Math.sin(now * 0.006) * 2.8;
      this.tutorialBeacon.userData.pointer.rotation.y = now * 0.0022;
    }

    return { isNight: sunY < 0.06, dayFactor };
  }

  updateCursor(wx, wz, radius, toolId, yawAngle, damTierAddH = 6.2, visible = true) {
    this.cursorGroup.visible = visible;
    if (!visible) return;
    const s = this.hydro.sampleAtWorld(wx, wz);
    const y = Math.max(s.bed, s.surface) + 0.35;
    this.cursorGroup.position.set(wx, y, wz);
    this.cursorRing.scale.set(radius, radius, 1);

    const isUnit = toolId === 'spillway' || toolId.startsWith('turbine_');
    this.flowArrow.visible = isUnit;

    // Показываем объёмный 3D-призрак высоты для плотины, перемычки и контрфорса!
    const showGhost = toolId === 'concrete_dam' || toolId === 'earth_dam' || toolId === 'foundation';
    this.ghostVolume.visible = showGhost;
    if (showGhost) {
      const hPreview = toolId === 'concrete_dam' ? damTierAddH : (toolId === 'earth_dam' ? 4.2 : 6.0);
      this.ghostVolume.scale.set(radius, hPreview, radius);
      this.ghostVolumeMat.color.setHex(toolId === 'foundation' ? 0xf59e0b : 0xfbbf24);
    }

    if (isUnit) {
      const { gx, gz } = this.hydro.worldToGrid(wx, wz);
      const dir = this.hydro.detectHydraulicDirection(gx, gz, yawAngle);
      this.flowArrow.rotation.y = -dir.yaw;
      this.cursorRingMat.color.setHex(0x34d399);
    } else if (toolId === 'canal_dig') {
      this.cursorRingMat.color.setHex(0x38bdf8);
    } else if (toolId === 'concrete_dam' || toolId === 'earth_dam' || toolId === 'foundation') {
      this.cursorRingMat.color.setHex(0xfbbf24);
    } else if (toolId === 'demolish') {
      this.cursorRingMat.color.setHex(0xef4444);
    } else {
      this.cursorRingMat.color.setHex(0xa78bfa);
    }
  }
}

function dzsSafe(v) {
  return v;
}
