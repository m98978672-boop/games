// ============================================================================
//  3D-РЕНДЕРЕР МИРА, КАНОНИЧЕСКОЙ ГЭС/ГАЭС, 3D-ПЕРЕЛИВА И ЖИВОЙ ДОЛИНЫ v0.3
//  - Поддержка масштабов 0.8×0.8 км, 5×5 км (25 км²) и 10×10 км (100 км²) на 60 FPS
//  - Каноническая приплотинная ГЭС/ГАЭС (машзал ВНИЗУ в нижнем бьефе у подошвы плотины,
//    водоприёмник в ВБ, наклонные стальные напорные водоводы, отсасывающие трубы, ОРУ и кран!)
//  - Видимая 3D-анимация переливания воды через гребень плотин и лотки водосбросов (параболическая пелена!)
//  - 8 саморастущих городов, 32 архитектурных типа зданий, мега-атлас 64 фасадов × 432 оттенка текстур
//  - Интеграция LivingWorldSystem (300 анимаций: корабли, яхты, поезда, авто, ВЭС, СЭС, градирни, птицы, рыбы)
// ============================================================================

import * as THREE from 'three';
import { WORLD } from './config.js';
import { clamp, lerp, makeRng } from './noise.js';
import {
  createValleyTerrainMaterial,
  createRealisticWaterMaterial,
  createOverflowWaterMaterial,
  createCityFacadeMaterial,
  createOuterSeaFogMaterial,
  createHorizonMistMaterial,
} from './water-shader.js';
import { buildAllProceduralTextures, pickCatalogShade } from './textures.js';
import { getValleyHeadwaterSources } from './valley.js';
import { LivingWorldSystem } from './living-world.js';
import { RoadAndBridgeRenderer, createOpenScaffoldCageGeometry } from './roads-and-cities.js';

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

/**
 * Изогнутая по баллистической параболе 3D-геометрия переливной водной струи (Overflow Nappe):
 * Верхняя кромка лежит на гребне плотины (y = 0, x = -0.15), затем поток плавно разгоняется
 * вперёд по +X и падает вниз до водобойного колодца (y = -1.0, x = +0.85), имея объёмную толщину!
 */
function createCurvedOverflowNappeGeometry() {
  const segY = 8;
  const segZ = 2;
  const positions = [];
  const normals = [];
  const uvs = [];
  const indices = [];

  // Строим двухстороннюю изогнутую объёмную ленту (верхняя и нижняя грань струи)
  for (let pass = 0; pass < 2; pass++) {
    const thicknessSign = pass === 0 ? 1 : -1;
    const baseVertex = positions.length / 3;
    for (let iy = 0; iy <= segY; iy++) {
      const s = iy / segY; // 0 на гребне -> 1 у подножия водопада
      // Баллистическая траектория свободного перелива через водослив практического профиля
      const cx = -0.12 + 0.38 * s + 0.56 * s * s;
      const cy = 0.04 * Math.sin(s * Math.PI * 0.5) - s * s;
      const thick = (0.16 * (1.0 - 0.35 * s)) * thicknessSign;

      // Касательная и нормаль к параболе
      const tx = 0.38 + 1.12 * s;
      const ty = -2.0 * s;
      const tLen = Math.hypot(tx, ty) || 1;
      const nx = (-ty / tLen) * thicknessSign;
      const ny = (tx / tLen) * thicknessSign;

      for (let iz = 0; iz <= segZ; iz++) {
        const zFrac = (iz / segZ) - 0.5;
        positions.push(cx + nx * Math.abs(thick), cy + ny * Math.abs(thick), zFrac);
        normals.push(nx, ny, 0);
        uvs.push(iz / segZ, s * 1.35);
      }
    }

    for (let iy = 0; iy < segY; iy++) {
      for (let iz = 0; iz < segZ; iz++) {
        const a = baseVertex + iy * (segZ + 1) + iz;
        const b = a + 1;
        const c = a + (segZ + 1);
        const d = c + 1;
        if (pass === 0) {
          indices.push(a, c, b, b, c, d);
        } else {
          indices.push(a, b, c, b, d, c);
        }
      }
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  return geo;
}

export class WorldView {
  constructor(scene, hydro, economy, qualityProfile, renderer = null, prebuiltTextures = null) {
    this.scene = scene;
    this.hydro = hydro;
    this.economy = economy;
    this.profile = qualityProfile;

    this.textures = prebuiltTextures || buildAllProceduralTextures(renderer);
    this.detailTex = this.textures.waterDetail;

    this.hemiLight = new THREE.HemisphereLight(0x8ec5ff, 0x3d4f35, 0.74);
    this.scene.add(this.hemiLight);

    this.sunLight = new THREE.DirectionalLight(0xfff3db, 1.48);
    this.sunLight.position.set(220, 310, 170);
    this.scene.add(this.sunLight.target);
    if (qualityProfile.shadows) {
      this.sunLight.castShadow = true;
      this.sunLight.shadow.mapSize.set(2048, 2048);
      this.sunLight.shadow.bias = -0.0006;
    }
    this.scene.add(this.sunLight);
    this._syncShadowFrustum();

    this.skyColorZenith = new THREE.Color(0x2864ad);
    this.skyColorHorizon = new THREE.Color(0xa6cde8);
    this.fogColor = new THREE.Color(0xa6cde8);
    this.scene.background = this.fogColor.clone();

    // 1. Меш рельефа, меш воды, бескрайнее внешнее море с туманом за картой, 3D-пелена перелива и 3D-гроты истоков рек!
    this._buildTerrainMesh();
    this._buildWaterMesh();
    this._buildOuterWorldSeaAndFog();
    this._buildOverflow3DPools();
    this.headwatersGroup = new THREE.Group();
    this.scene.add(this.headwatersGroup);
    this.headwaterCascades = [];
    this._rebuildHeadwaterSources3D();

    // 2. Текстурированные леса и гранитные валуны (с 432 оттенками флоры и пород!)
    this._buildNatureInstances();

    // 3. Саморастущие 8 городов (32 типа зданий: корпуса, крыши, цилиндрические силосы/градирни, купола!)
    this.cityDisksGroup = new THREE.Group();
    this.scene.add(this.cityDisksGroup);
    this._buildCityInstancedPools();
    this._rebuildCityDisks();

    // 3b. Междугородние трассы A*, железобетонные мосты на быках и строящиеся городские улицы!
    this.roadRenderer = new RoadAndBridgeRenderer(
      this.scene,
      this.hydro,
      this.economy,
      this.textures,
      !!this.profile.shadows,
    );
    this.roadRenderer.syncGeometry();

    // 4. Объёмная 3D-стройка: монолитные блоки плотин, контрфорсы, опалубка, борта каналов и башенные краны!
    this._buildVolumetricConstructionPools();

    // 5. Канонические ГЭС/ГАЭС в нижнем бьефе, водосбросы с 3D-струёй, шлюзы, рыбхозы, ОРУ и ЛЭП
    this.structuresGroup = new THREE.Group();
    this.scene.add(this.structuresGroup);
    this.structMeshes = new Map();
    this._buildPowerLinePools();

    // 6. Живой мир долины (300 анимаций: флот, яхты, поезда, машины, ВЭС, СЭС, пар градирен, птицы, рыбы, облака)
    this.livingWorld = new LivingWorldSystem(this.scene, this.hydro, this.economy, this.textures);

    // 7. 3D голограмма курсора, маяк орошения и 3D-маяк обучения
    this._buildCursorPreview();
    this._buildIrrigationBeacon();
    this._buildTutorialBeacon();
  }

  _syncShadowFrustum() {
    if (!this.profile.shadows) return;
    // Следящий теневой каскад: охватывает активную зону вокруг камеры на 0.8, 5 и 10 км!
    const d = clamp(420 * Math.pow(WORLD.horizScale, 0.55), 395, 1650);
    this.sunLight.shadow.camera.near = 40;
    this.sunLight.shadow.camera.far = d * 3.8;
    this.sunLight.shadow.camera.left = -d;
    this.sunLight.shadow.camera.right = d;
    this.sunLight.shadow.camera.top = d;
    this.sunLight.shadow.camera.bottom = -d;
    this.sunLight.shadow.camera.updateProjectionMatrix();
  }

  /** Полная перестройка геометрии и шейдеров при смене и масштаба карты (0.8 / 5 / 10 км), и долины */
  rebuildForNewValley() {
    const g = this.hydro.grid;
    const dx = this.hydro.dx;
    const half = WORLD.size * 0.5;

    // Обновляем мировые координаты X/Z вершин рельефа и воды под новый WORLD.size!
    const tPos = this.terrainPosAttr.array;
    const wPos = this.waterPosAttr.array;
    for (let gz = 0; gz < g; gz++) {
      const wz = -half + (gz + 0.5) * dx;
      for (let gx = 0; gx < g; gx++) {
        const wx = -half + (gx + 0.5) * dx;
        const i3 = (gz * g + gx) * 3;
        tPos[i3] = wx;
        tPos[i3 + 2] = wz;
        wPos[i3] = wx;
        wPos[i3 + 2] = wz;
      }
    }
    this.terrainMesh.geometry.boundingSphere = null;
    this.waterMesh.geometry.boundingSphere = null;

    if (this.skirtMesh) {
      this.skirtMesh.scale.set(WORLD.size, 32 * WORLD.elevScale, WORLD.size);
      this.skirtMesh.position.set(0, -15.6 * WORLD.elevScale, 0);
      this.skirtMesh.updateMatrix();
    }

    // Обновляем масштабные юниформы в шейдерах рельефа, воды и внешнего моря за картой
    this.terrainMat.uniforms.uHorizScale.value = WORLD.horizScale;
    this.terrainMat.uniforms.uElevScale.value = WORLD.elevScale;
    this.terrainMat.uniforms.uSnowLine.value = WORLD.snowLineY;
    this.terrainMat.uniforms.uMapHalf.value = half;
    this.waterMat.uniforms.uHorizScale.value = WORLD.horizScale;
    this.waterMat.uniforms.uElevScale.value = WORLD.elevScale;
    this.waterMat.uniforms.uMapHalf.value = half;
    this._syncOuterSeaScale();

    this._syncShadowFrustum();
    this.updateTerrainGeometryRect(0, 0, g - 1, g - 1);
    this._populateNatureInstances();
    this._rebuildCityDisks();
    this._rebuildHeadwaterSources3D();

    for (const [, obj] of this.structMeshes.entries()) {
      this.structuresGroup.remove(obj);
    }
    this.structMeshes.clear();

    const agroCity = this.economy.cities.find((c) => c.archetype === 'agro');
    if (this.irrBeacon && agroCity && agroCity.irrigationTarget) {
      const ix = agroCity.irrigationTarget.x;
      const iz = agroCity.irrigationTarget.z;
      const bed = this.hydro.sampleAtWorld(ix, iz).bed;
      const bScale = Math.pow(WORLD.horizScale, 0.65);
      this.irrBeacon.position.set(ix, bed + 0.45 * WORLD.elevScale, iz);
      this.irrBeacon.userData.baseScale = bScale;
    }

    if (this.roadRenderer) {
      this.roadRenderer.syncGeometry();
    }
    if (this.livingWorld) {
      this.livingWorld.rebuildWorldActors();
    }

    this.hydro.engineeredDirty = true;
    this.economy.buildingsDirty = true;
    this.economy.powerLinesDirty = true;
    this.syncEngineeredVolumes();
    this.syncCityInstances();
    this.syncHydroStructures();
    this.updateOverflowWater3D(0);
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
    this.terrainMat.uniforms.uHorizScale.value = WORLD.horizScale;
    this.terrainMat.uniforms.uElevScale.value = WORLD.elevScale;
    this.terrainMat.uniforms.uSnowLine.value = WORLD.snowLineY;
    this.terrainMat.uniforms.uMapHalf.value = half;
    this.terrainMesh = new THREE.Mesh(geo, this.terrainMat);
    this.terrainMesh.receiveShadow = !!this.profile.shadows;
    this.terrainMesh.castShadow = !!this.profile.shadows;
    this.terrainMesh.frustumCulled = false;
    this.terrainMesh.matrixAutoUpdate = false;
    this.terrainMesh.updateMatrix();
    this.scene.add(this.terrainMesh);

    const skirtMat = new THREE.MeshLambertMaterial({ color: 0x262c34, map: this.textures.rock });
    const skirtGeo = new THREE.BoxGeometry(1, 1, 1);
    this.skirtMesh = new THREE.Mesh(skirtGeo, skirtMat);
    this.skirtMesh.scale.set(WORLD.size, 32 * WORLD.elevScale, WORLD.size);
    this.skirtMesh.position.set(0, -15.6 * WORLD.elevScale, 0);
    this.skirtMesh.frustumCulled = false;
    this.skirtMesh.matrixAutoUpdate = false;
    this.skirtMesh.updateMatrix();
    this.scene.add(this.skirtMesh);

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
    this.waterMat.uniforms.uHorizScale.value = WORLD.horizScale;
    this.waterMat.uniforms.uElevScale.value = WORLD.elevScale;
    this.waterMat.uniforms.uMapHalf.value = half;
    this.waterMesh = new THREE.Mesh(geo, this.waterMat);
    this.waterMesh.renderOrder = 2;
    this.waterMesh.frustumCulled = false;
    this.waterMesh.matrixAutoUpdate = false;
    this.waterMesh.updateMatrix();
    this.scene.add(this.waterMesh);
  }

  /**
   * Бескрайняя вода и кольцо объёмного тумана ЗА ПРЕДЕЛАМИ КАРТЫ:
   * скрывают края сетки и создают живой морской горизонт с дымкой вокруг всей долины!
   */
  _buildOuterWorldSeaAndFog() {
    const seaGeo = new THREE.PlaneGeometry(1, 1, 1, 1);
    seaGeo.rotateX(-Math.PI * 0.5);
    this.outerSeaMat = createOuterSeaFogMaterial(this.detailTex);
    this.outerSeaMesh = new THREE.Mesh(seaGeo, this.outerSeaMat);
    this.outerSeaMesh.renderOrder = 1;
    this.outerSeaMesh.frustumCulled = false;
    this.outerSeaMesh.matrixAutoUpdate = false;
    this.scene.add(this.outerSeaMesh);

    const mistGeo = new THREE.CylinderGeometry(1, 1, 1, 48, 1, true);
    mistGeo.translate(0, 0.5, 0);
    this.horizonMistMat = createHorizonMistMaterial();
    this.horizonMistMesh = new THREE.Mesh(mistGeo, this.horizonMistMat);
    this.horizonMistMesh.renderOrder = 4;
    this.horizonMistMesh.frustumCulled = false;
    this.horizonMistMesh.matrixAutoUpdate = false;
    this.scene.add(this.horizonMistMesh);

    this._syncOuterSeaScale();
  }

  _syncOuterSeaScale() {
    if (!this.outerSeaMesh) return;
    const half = WORLD.size * 0.5;
    const seaY = 3.2 * WORLD.elevScale;
    const span = WORLD.size * 14.0;

    this.outerSeaMesh.position.set(0, seaY, 0);
    this.outerSeaMesh.scale.set(span, 1, span);
    this.outerSeaMesh.updateMatrix();
    this.outerSeaMat.uniforms.uMapHalf.value = half;
    this.outerSeaMat.uniforms.uHorizScale.value = WORLD.horizScale;

    if (this.horizonMistMesh) {
      const mistR = WORLD.size * 2.25;
      const mistH = Math.max(240, 340 * WORLD.elevScale);
      this.horizonMistMesh.position.set(0, seaY - 4 * WORLD.elevScale, 0);
      this.horizonMistMesh.scale.set(mistR, mistH, mistR);
      this.horizonMistMesh.updateMatrix();
    }
  }

  /**
   * 3D-пелена ПЕРЕЛИВА ВОДЫ через гребень реальных плотин и водосбросов!
   * Вращающийся белый цилиндр-овал plungeRollerIM полностью удалён (никаких белых овалов у берегов!).
   */
  _buildOverflow3DPools() {
    this.overflowWaterMat = createOverflowWaterMaterial(this.textures.overflowCascade);
    const nappeGeo = createCurvedOverflowNappeGeometry();
    this.maxOverflows = 260;
    this.overflowNappeIM = new THREE.InstancedMesh(nappeGeo, this.overflowWaterMat, this.maxOverflows);
    this.overflowNappeIM.count = 0;
    this.overflowNappeIM.renderOrder = 3;
    this.overflowNappeIM.frustumCulled = false;
    this.scene.add(this.overflowNappeIM);
  }

  /**
   * Наглядные 3D-истоки всех 3 рек (ледниковые гроты «Белый Ледник» и «Серебряный Ключ» +
   * скальный источник «Гремучая Теснина»), откуда зримо рождается и бьёт поток каждой реки!
   */
  _rebuildHeadwaterSources3D() {
    while (this.headwatersGroup.children.length > 0) {
      this.headwatersGroup.remove(this.headwatersGroup.children[0]);
    }
    this.headwaterCascades = [];

    const sources = getValleyHeadwaterSources(this.hydro.presetId || 'bystritsa');
    const uScale = Math.pow(WORLD.horizScale, 0.58);
    const rockMat = new THREE.MeshLambertMaterial({ color: 0x64748b, map: this.textures.rock });
    const darkCavernMat = new THREE.MeshBasicMaterial({ color: 0x07192b });
    const snowCapMat = new THREE.MeshLambertMaterial({ color: 0xf1f7ff });
    const iceMat = new THREE.MeshStandardMaterial({
      color: 0xdcf4ff,
      map: this.textures.glacierIce || this.textures.concreteMap,
      emissive: new THREE.Color(0x0ea5e9),
      emissiveIntensity: 0.16,
      roughness: 0.24,
      metalness: 0.08,
    });

    for (let i = 0; i < sources.length; i++) {
      const src = sources[i];
      const grp = new THREE.Group();
      const sampOut = this.hydro.sampleAtWorld(src.outX, src.outZ);
      const basePoolY = Math.max(sampOut.bed, sampOut.surface - 0.35 * WORLD.elevScale);
      const dropH = Math.max(5.5 * WORLD.elevScale, src.dropHeight);
      const archW = Math.max(10.5 * uScale, src.width * 1.15);

      // Ставим портал истока между кромкой карты и чашей приёмного бассейна и ориентируем вдоль русла!
      const px = (src.x * 0.45 + src.outX * 0.55);
      const pz = (src.z * 0.45 + src.outZ * 0.55);
      const flowYaw = Math.atan2(src.tz, src.tx);
      grp.position.set(px, basePoolY, pz);
      grp.rotation.y = -flowYaw;

      const isGlacial = src.kind === 'glacier' || src.kind === 'alpine_spring';
      const mainPortalMat = isGlacial ? iceMat : rockMat;

      // 1. Скальные устои горного амфитеатра по бокам грота
      for (const side of [-1, 1]) {
        const cliff = new THREE.Mesh(
          new THREE.DodecahedronGeometry(archW * 0.48, 1),
          rockMat,
        );
        cliff.position.set(-archW * 0.18, dropH * 0.52, side * archW * 0.56);
        cliff.scale.set(1.15, (dropH * 1.35) / (archW * 0.48), 0.92);
        cliff.castShadow = !!this.profile.shadows;
        grp.add(cliff);
      }

      // 2. Сводчатый ледниковый язык / скальная арка грота и тёмное устье подземной реки
      const archVault = new THREE.Mesh(
        new THREE.DodecahedronGeometry(archW * 0.62, 1),
        mainPortalMat,
      );
      archVault.position.set(-archW * 0.28, dropH * 0.96, 0);
      archVault.scale.set(1.25, 0.72, 1.35);
      archVault.castShadow = !!this.profile.shadows;
      grp.add(archVault);

      if (isGlacial) {
        // Острые кристаллические сераки голубого ледника над гротом!
        for (let s = -2; s <= 2; s++) {
          const spire = new THREE.Mesh(
            new THREE.ConeGeometry(archW * 0.16, dropH * (0.65 + (Math.abs(s) % 2) * 0.28), 5),
            iceMat,
          );
          spire.position.set(-archW * (0.35 + Math.abs(s) * 0.06), dropH * 1.25, s * archW * 0.22);
          spire.rotation.z = -0.18;
          grp.add(spire);
        }
      } else {
        const snowCrown = new THREE.Mesh(new THREE.DodecahedronGeometry(archW * 0.52, 1), snowCapMat);
        snowCrown.position.set(-archW * 0.30, dropH * 1.32, 0);
        snowCrown.scale.set(1.1, 0.38, 1.2);
        grp.add(snowCrown);
      }

      const cavernMouth = new THREE.Mesh(
        new THREE.CylinderGeometry(archW * 0.34, archW * 0.42, archW * 0.35, 10),
        darkCavernMat,
      );
      cavernMouth.rotation.z = Math.PI * 0.5;
      cavernMouth.position.set(-archW * 0.12, dropH * 0.62, 0);
      grp.add(cavernMouth);

      // 3. Бурный 3D-каскад воды, вырывающийся прямо из грота и питающий русло реки!
      const cascade = new THREE.Mesh(createCurvedOverflowNappeGeometry(), this.overflowWaterMat);
      const throwX = Math.max(archW * 0.78, dropH * 0.88);
      cascade.position.set(-archW * 0.04, dropH * 0.68, 0);
      cascade.scale.set(throwX, dropH * 0.72, archW * 0.68);
      cascade.renderOrder = 3;
      grp.add(cascade);

      this.headwatersGroup.add(grp);
      this.headwaterCascades.push({
        cascade,
        baseThrowX: throwX,
        baseDropY: dropH * 0.72,
        baseWidthZ: archW * 0.68,
        outX: src.outX,
        outZ: src.outZ,
        poolY: basePoolY,
        tx: src.tx,
        tz: src.tz,
        phase: i * 2.1,
      });
    }
  }

  /** Ежекадровое обновление 3D-лент перелива плотин и живых водопадов истоков 3 рек */
  updateOverflowWater3D(timeSec) {
    this.overflowWaterMat.uniforms.uTime.value = timeSec;

    // Пульсация 3 горных истоков от погоды и таяния ледников!
    const inflowFactor = clamp((this.hydro.inflowMult || 1.0) * 0.85 + 0.15, 0.65, 1.65);
    for (let k = 0; k < this.headwaterCascades.length; k++) {
      const hc = this.headwaterCascades[k];
      const pulse = 1.0 + Math.sin(timeSec * 6.4 + hc.phase) * 0.06;
      hc.cascade.scale.set(
        hc.baseThrowX * pulse * Math.pow(inflowFactor, 0.35),
        hc.baseDropY,
        hc.baseWidthZ * Math.pow(inflowFactor, 0.25),
      );
    }

    const edges = this.hydro.overflowEdges || [];
    const n = Math.min(edges.length, this.maxOverflows);
    for (let i = 0; i < n; i++) {
      const e = edges[i];
      const pulse = 1.0 + Math.sin(timeSec * 9.5 + i * 1.3) * 0.06;
      const forwardSpan = Math.max(this.hydro.dx * 0.65, e.dropH * 0.42);

      // Баллистическая 3D-пелена воды от гребня плотины до нижнего бьефа
      _pos.set(e.wx, e.crestY, e.wz);
      _euler.set(0, -e.yaw, 0);
      _quat.setFromEuler(_euler);
      _scale.set(forwardSpan * pulse, e.dropH, e.width * 1.08);
      _mat4.compose(_pos, _quat, _scale);
      this.overflowNappeIM.setMatrixAt(i, _mat4);
    }

    this.overflowNappeIM.count = n;
    if (n > 0) {
      this.overflowNappeIM.instanceMatrix.needsUpdate = true;
    }
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
    this.treeTrunks.frustumCulled = false;
    this.treeCrowns.frustumCulled = false;
    this.treeTrunks.matrixAutoUpdate = false;
    this.treeCrowns.matrixAutoUpdate = false;
    this.scene.add(this.treeTrunks);
    this.scene.add(this.treeCrowns);

    const rockGeo = new THREE.DodecahedronGeometry(1.35, 1);
    const rockMat = new THREE.MeshLambertMaterial({ color: 0xffffff, map: this.textures.rock });
    this.rockInstances = new THREE.InstancedMesh(rockGeo, rockMat, maxRocks);
    this.rockInstances.castShadow = !!this.profile.shadows;
    this.rockInstances.frustumCulled = false;
    this.rockInstances.matrixAutoUpdate = false;
    this.scene.add(this.rockInstances);

    this._populateNatureInstances();
  }

  _populateNatureInstances() {
    const rng = makeRng(424242);
    const maxTrees = this.profile.treeCount;
    const maxRocks = this.profile.rockCount;
    const treeScale = Math.pow(WORLD.horizScale, 0.56);
    const treeLineMaxY = WORLD.snowLineY * 0.78;
    const minBankY = 6.8 * WORLD.elevScale;

    this.treeSlots = [];
    let placed = 0;
    let attempts = 0;
    while (placed < maxTrees && attempts < maxTrees * 9) {
      attempts++;
      const wx = (rng() - 0.5) * (WORLD.size * 0.96);
      const wz = (rng() - 0.5) * (WORLD.size * 0.96);
      const s = this.hydro.sampleAtWorld(wx, wz);
      if (s.depth > 0.03 || s.bed > treeLineMaxY || s.bed < minBankY || s.soil < 0.65 * WORLD.elevScale) continue;

      let nearCity = false;
      for (const c of this.economy.cities) {
        if (Math.hypot(wx - c.x, wz - c.z) < c.plateauRadius * 1.05) {
          nearCity = true;
          break;
        }
      }
      if (nearCity) continue;

      const scale = (0.74 + rng() * 0.82) * treeScale;
      _pos.set(wx, s.bed - 0.15, wz);
      _euler.set(0, rng() * Math.PI * 2, 0);
      _quat.setFromEuler(_euler);
      _scale.set(scale, scale * (0.92 + rng() * 0.38), scale);
      _mat4.compose(_pos, _quat, _scale);

      this.treeTrunks.setMatrixAt(placed, _mat4);
      this.treeCrowns.setMatrixAt(placed, _mat4);

      const fShade = pickCatalogShade('flora_agro', placed + Math.floor(rng() * 50));
      _color.setRGB(fShade.r * 1.25, fShade.g * 1.25, fShade.b * 1.25);
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
    for (let i = 0; i < maxRocks * 6 && rPlaced < maxRocks; i++) {
      const wx = (rng() - 0.5) * (WORLD.size * 0.96);
      const wz = (rng() - 0.5) * (WORLD.size * 0.96);
      const s = this.hydro.sampleAtWorld(wx, wz);
      if (s.depth > 0.5) continue;
      let nearCity = false;
      for (const c of this.economy.cities) {
        if (Math.hypot(wx - c.x, wz - c.z) < c.plateauRadius) { nearCity = true; break; }
      }
      if (nearCity) continue;

      _pos.set(wx, s.bed + 0.18, wz);
      _euler.set(rng() * 3, rng() * 3, rng() * 3);
      _quat.setFromEuler(_euler);
      _scale.set(
        (0.65 + rng() * 1.5) * treeScale,
        (0.45 + rng() * 0.95) * treeScale,
        (0.65 + rng() * 1.5) * treeScale,
      );
      _mat4.compose(_pos, _quat, _scale);
      const rShade = pickCatalogShade('rock_strata', rPlaced * 3);
      _color.setRGB(rShade.r * 1.35, rShade.g * 1.35, rShade.b * 1.35);
      this.rockInstances.setColorAt(rPlaced, _color);
      this.rockSlots.push({ index: rPlaced, wx, wz, baseBed: s.bed, alive: true });
      this.rockInstances.setMatrixAt(rPlaced++, _mat4);
    }
    this.rockInstances.count = rPlaced;
    this.rockInstances.instanceMatrix.needsUpdate = true;
    if (this.rockInstances.instanceColor) this.rockInstances.instanceColor.needsUpdate = true;
  }

  _buildCityInstancedPools() {
    const maxB = 720;
    const bodyGeo = new THREE.BoxGeometry(1, 1, 1);
    bodyGeo.translate(0, 0.5, 0);
    this.cityPoweredArr = new Float32Array(maxB);
    this.cityStyleArr = new Float32Array(maxB);
    this.cityBuildProgArr = new Float32Array(maxB).fill(1.0);
    this.cityPoweredAttr = new THREE.InstancedBufferAttribute(this.cityPoweredArr, 1);
    this.cityPoweredAttr.setUsage(THREE.DynamicDrawUsage);
    this.cityStyleAttr = new THREE.InstancedBufferAttribute(this.cityStyleArr, 1);
    this.cityStyleAttr.setUsage(THREE.DynamicDrawUsage);
    this.cityBuildProgAttr = new THREE.InstancedBufferAttribute(this.cityBuildProgArr, 1);
    this.cityBuildProgAttr.setUsage(THREE.DynamicDrawUsage);
    bodyGeo.setAttribute('aPowered', this.cityPoweredAttr);
    bodyGeo.setAttribute('aStyleId', this.cityStyleAttr);
    bodyGeo.setAttribute('aBuildProg', this.cityBuildProgAttr);

    // Цилиндрический пул для элеваторов, гиперболоидных градирен и маяков (silo)
    const siloGeo = new THREE.CylinderGeometry(0.42, 0.52, 1.0, 12);
    siloGeo.translate(0, 0.5, 0);
    this.siloPoweredArr = new Float32Array(maxB);
    this.siloStyleArr = new Float32Array(maxB);
    this.siloBuildProgArr = new Float32Array(maxB).fill(1.0);
    this.siloPoweredAttr = new THREE.InstancedBufferAttribute(this.siloPoweredArr, 1);
    this.siloStyleAttr = new THREE.InstancedBufferAttribute(this.siloStyleArr, 1);
    this.siloBuildProgAttr = new THREE.InstancedBufferAttribute(this.siloBuildProgArr, 1);
    this.siloBuildProgAttr.setUsage(THREE.DynamicDrawUsage);
    siloGeo.setAttribute('aPowered', this.siloPoweredAttr);
    siloGeo.setAttribute('aStyleId', this.siloStyleAttr);
    siloGeo.setAttribute('aBuildProg', this.siloBuildProgAttr);

    // Скатные крыши и сферические купола общественных зданий / обсерваторий
    const roofGeo = new THREE.ConeGeometry(0.76, 0.44, 4);
    roofGeo.rotateY(Math.PI * 0.25);
    roofGeo.translate(0, 0.22, 0);

    const domeGeo = new THREE.SphereGeometry(0.52, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.5);

    this.cityBodyMat = createCityFacadeMaterial(this.textures.roof, this.textures.facadeAtlas);
    const roofMat = new THREE.MeshLambertMaterial({ color: 0xffffff, map: this.textures.roof });
    const domeMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.28, metalness: 0.48 });

    this.cityBodies = new THREE.InstancedMesh(bodyGeo, this.cityBodyMat, maxB);
    this.citySilos = new THREE.InstancedMesh(siloGeo, this.cityBodyMat, maxB);
    this.cityRoofs = new THREE.InstancedMesh(roofGeo, roofMat, maxB);
    this.cityDomes = new THREE.InstancedMesh(domeGeo, domeMat, maxB);

    this.cityBodies.castShadow = !!this.profile.shadows;
    this.cityBodies.receiveShadow = !!this.profile.shadows;
    this.citySilos.castShadow = !!this.profile.shadows;
    this.cityBodies.frustumCulled = false;
    this.citySilos.frustumCulled = false;
    this.cityRoofs.frustumCulled = false;
    this.cityDomes.frustumCulled = false;

    // Инженерные элементы РЕАЛЬНОЙ СТРОЙКИ ГОРОДОВ: фундаментные плиты, сквозные леса и городские башенные краны!
    const foundGeo = new THREE.BoxGeometry(1.16, 1.0, 1.16);
    foundGeo.translate(0, 0.5, 0);
    const foundMat = new THREE.MeshLambertMaterial({ color: 0x94a3b8, map: this.textures.concreteMap });
    this.cityFoundations = new THREE.InstancedMesh(foundGeo, foundMat, maxB);
    this.cityFoundations.count = 0;
    this.cityFoundations.frustumCulled = false;

    const scaffGeo = createOpenScaffoldCageGeometry();
    const scaffMat = new THREE.MeshLambertMaterial({ color: 0xd97706 });
    this.cityScaffolds = new THREE.InstancedMesh(scaffGeo, scaffMat, 120);
    this.cityScaffolds.count = 0;
    this.cityScaffolds.frustumCulled = false;

    const maxCityCranes = 40;
    const cMastGeo = new THREE.BoxGeometry(0.85, 1.0, 0.85);
    cMastGeo.translate(0, 0.5, 0);
    const cYellowMat = new THREE.MeshLambertMaterial({ color: 0xf59e0b, map: this.textures.steel });
    this.cityCraneMasts = new THREE.InstancedMesh(cMastGeo, cYellowMat, maxCityCranes);
    this.cityCraneMasts.count = 0;
    this.cityCraneMasts.frustumCulled = false;

    const cJibGeo = new THREE.BoxGeometry(15.5, 0.72, 0.82);
    cJibGeo.translate(3.4, 0, 0);
    this.cityCraneJibs = new THREE.InstancedMesh(cJibGeo, cYellowMat, maxCityCranes);
    this.cityCraneJibs.count = 0;
    this.cityCraneJibs.frustumCulled = false;
    this.activeCityCraneSites = [];

    this.scene.add(
      this.cityFoundations,
      this.cityBodies,
      this.citySilos,
      this.cityRoofs,
      this.cityDomes,
      this.cityScaffolds,
      this.cityCraneMasts,
      this.cityCraneJibs,
    );
  }

  _rebuildCityDisks() {
    while (this.cityDisksGroup.children.length > 0) {
      this.cityDisksGroup.remove(this.cityDisksGroup.children[0]);
    }
    for (const c of this.economy.cities) {
      const diskGeo = new THREE.CircleGeometry(c.plateauRadius * 0.90, 44);
      diskGeo.rotateX(-Math.PI * 0.5);
      const diskCol = c.archetype === 'agro' ? 0xa3be8c
        : (c.archetype === 'resort' ? 0xe5d5b7 : 0xd8dee9);
      const diskMat = new THREE.MeshLambertMaterial({
        color: diskCol,
        map: this.textures.urbanPlaza || this.textures.concreteMap,
        transparent: true,
        opacity: 0.88,
        depthWrite: false,
      });
      const disk = new THREE.Mesh(diskGeo, diskMat);
      const centerBed = this.hydro.sampleAtWorld(c.x, c.z).bed;
      disk.position.set(c.x, centerBed + 0.14 * WORLD.elevScale, c.z);
      disk.renderOrder = 1;
      disk.frustumCulled = false;
      disk.matrixAutoUpdate = false;
      disk.updateMatrix();
      this.cityDisksGroup.add(disk);
    }
  }

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

    const damBlockGeo = new THREE.BoxGeometry(1, 1, 1);
    damBlockGeo.translate(0, 0.5, 0);
    this.damMonolithMesh = new THREE.InstancedMesh(damBlockGeo, concMat, 2600);
    this.damMonolithMesh.count = 0;
    this.damMonolithMesh.castShadow = !!this.profile.shadows;
    this.damMonolithMesh.receiveShadow = !!this.profile.shadows;
    this.damMonolithMesh.frustumCulled = false;
    this.damMonolithMesh.matrixAutoUpdate = false;
    this.scene.add(this.damMonolithMesh);

    const cageGeo = new THREE.BoxGeometry(1.06, 1, 1.06);
    cageGeo.translate(0, 0.5, 0);
    this.scaffoldingMesh = new THREE.InstancedMesh(cageGeo, rebarMat, 1400);
    this.scaffoldingMesh.count = 0;
    this.scaffoldingMesh.castShadow = !!this.profile.shadows;
    this.scaffoldingMesh.frustumCulled = false;
    this.scaffoldingMesh.matrixAutoUpdate = false;
    this.scene.add(this.scaffoldingMesh);

    const buttressGeo = new THREE.CylinderGeometry(0.32, 0.92, 1.0, 4);
    buttressGeo.rotateY(Math.PI * 0.25);
    buttressGeo.translate(0, 0.5, 0.25);
    this.buttressMesh = new THREE.InstancedMesh(buttressGeo, concMat, 1600);
    this.buttressMesh.count = 0;
    this.buttressMesh.castShadow = !!this.profile.shadows;
    this.buttressMesh.receiveShadow = !!this.profile.shadows;
    this.buttressMesh.frustumCulled = false;
    this.buttressMesh.matrixAutoUpdate = false;
    this.scene.add(this.buttressMesh);

    const curbGeo = new THREE.BoxGeometry(1, 1, 1);
    curbGeo.translate(0, 0.5, 0);
    this.canalCurbMesh = new THREE.InstancedMesh(curbGeo, concMat, 2000);
    this.canalCurbMesh.count = 0;
    this.canalCurbMesh.receiveShadow = !!this.profile.shadows;
    this.canalCurbMesh.frustumCulled = false;
    this.canalCurbMesh.matrixAutoUpdate = false;
    this.scene.add(this.canalCurbMesh);

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

    const base = new THREE.Mesh(new THREE.BoxGeometry(4.2, 1.2, 4.2), darkMat);
    base.position.y = 0.6;
    grp.add(base);

    const mast = new THREE.Mesh(new THREE.BoxGeometry(1.35, 19.0, 1.35), yellowMat);
    mast.position.y = 10.1;
    mast.castShadow = !!this.profile.shadows;
    grp.add(mast);

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

        if (cH >= 1.35 && gateWall[i] < 0.05 && damIdx < maxDam) {
          _pos.set(wx, baseElev - 0.35, wz);
          _quat.identity();
          _scale.set(dx * 0.96, cH + 0.52, dx * 0.96);
          _mat4.compose(_pos, _quat, _scale);
          this.damMonolithMesh.setMatrixAt(damIdx, _mat4);
          // Лёгкая вариация гидротехнических марок бетона М300–М500 из каталога 432 оттенков!
          const cShade = pickCatalogShade('hydro_concrete', gx * 7 + gz * 13);
          _color.setRGB(cShade.r * 1.28, cShade.g * 1.28, cShade.b * 1.28);
          this.damMonolithMesh.setColorAt(damIdx, _color);
          damIdx++;
        }

        if (tH > cH + 0.08 && cageIdx < maxCage) {
          const cageBottom = baseElev + cH * 0.85;
          const cageHeight = Math.max(1.2, (tH - cH * 0.85) + 0.65);
          _pos.set(wx, cageBottom, wz);
          _quat.identity();
          _scale.set(dx * 1.02, cageHeight, dx * 1.02);
          _mat4.compose(_pos, _quat, _scale);
          this.scaffoldingMesh.setMatrixAt(cageIdx++, _mat4);
        }

        if (reinf && buttIdx < maxButt) {
          const totalH = Math.max(2.6 * WORLD.elevScale, Math.max(cH, tH) * 0.92 + 1.4);
          _pos.set(wx, baseElev - 0.6, wz);
          _euler.set(0, -buttressYaw[i] + Math.PI * 0.5, 0);
          _quat.setFromEuler(_euler);
          _scale.set(dx * 0.88, totalH, dx * 1.38);
          _mat4.compose(_pos, _quat, _scale);
          this.buttressMesh.setMatrixAt(buttIdx++, _mat4);
        }

        if (lined && cH < 1.1 && tH < 1.1 && curbIdx < maxCurb) {
          const isEdge = !linedMask[i - 1] || !linedMask[i + 1] || !linedMask[i - g] || !linedMask[i + g];
          if (isEdge) {
            _pos.set(wx, baseElev - 0.15, wz);
            _quat.identity();
            _scale.set(dx * 0.92, 0.72 * WORLD.elevScale, dx * 0.92);
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
    if (this.damMonolithMesh.instanceColor) this.damMonolithMesh.instanceColor.needsUpdate = true;
    this.scaffoldingMesh.instanceMatrix.needsUpdate = true;
    this.buttressMesh.instanceMatrix.needsUpdate = true;
    this.canalCurbMesh.instanceMatrix.needsUpdate = true;
  }

  animateConstructionCranes(timeSec) {
    const sites = this.hydro.activeBuildSites;
    const cScale = Math.pow(WORLD.horizScale, 0.56);
    for (let i = 0; i < this.cranes.length; i++) {
      const crane = this.cranes[i];
      if (i < sites.length) {
        const site = sites[i];
        crane.visible = true;
        crane.scale.setScalar(cScale);
        crane.position.set(site.wx + 5.5 * cScale, site.wy - 0.5, site.wz - 4.5 * cScale);
        const phase = timeSec * 0.85 + crane.userData.seed;
        crane.userData.slew.rotation.y = Math.sin(phase) * 1.15;
        crane.userData.hoist.position.x = 8.5 + Math.cos(phase * 1.4) * 5.2;
      } else {
        crane.visible = false;
      }
    }

    // Живое вращение стрел городских башенных кранов над возводимыми кварталами 8 городов!
    if (this.cityCraneJibs && this.activeCityCraneSites && this.activeCityCraneSites.length > 0) {
      const nCranes = this.activeCityCraneSites.length;
      for (let k = 0; k < nCranes; k++) {
        const cs = this.activeCityCraneSites[k];
        const slewYaw = cs.baseYaw + Math.sin(timeSec * 0.72 + cs.seed) * 1.35;
        _pos.set(cs.x, cs.topY, cs.z);
        _euler.set(0, slewYaw, 0);
        _quat.setFromEuler(_euler);
        _scale.setScalar(cs.scale);
        _mat4.compose(_pos, _quat, _scale);
        this.cityCraneJibs.setMatrixAt(k, _mat4);
      }
      this.cityCraneJibs.count = nCranes;
      this.cityCraneJibs.instanceMatrix.needsUpdate = true;
    } else if (this.cityCraneJibs) {
      this.cityCraneJibs.count = 0;
    }
  }

  _buildPowerLinePools() {
    const maxPylons = 420;
    const pylonGeo = new THREE.CylinderGeometry(0.22, 1.05, 12.8, 4);
    pylonGeo.translate(0, 6.4, 0);
    const pylonMat = new THREE.MeshLambertMaterial({ color: 0xaab6c2, map: this.textures.steel });
    this.pylonMesh = new THREE.InstancedMesh(pylonGeo, pylonMat, maxPylons);
    this.pylonMesh.count = 0;
    this.pylonMesh.frustumCulled = false;
    this.pylonMesh.matrixAutoUpdate = false;
    this.scene.add(this.pylonMesh);

    const armGeo = new THREE.BoxGeometry(4.6, 0.28, 0.35);
    armGeo.translate(0, 11.4, 0);
    this.pylonArmMesh = new THREE.InstancedMesh(armGeo, pylonMat, maxPylons);
    this.pylonArmMesh.count = 0;
    this.pylonArmMesh.frustumCulled = false;
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
    const agroCity = this.economy.cities.find((c) => c.archetype === 'agro');
    const ix = agroCity && agroCity.irrigationTarget ? agroCity.irrigationTarget.x : 168 * WORLD.horizScale;
    const iz = agroCity && agroCity.irrigationTarget ? agroCity.irrigationTarget.z : 98 * WORLD.horizScale;
    const bed = this.hydro.sampleAtWorld(ix, iz).bed;
    this.irrBeacon = new THREE.Mesh(ringGeo, this.irrRingMat);
    this.irrBeacon.position.set(ix, bed + 0.45 * WORLD.elevScale, iz);
    this.irrBeacon.userData.baseScale = Math.pow(WORLD.horizScale, 0.65);
    this.scene.add(this.irrBeacon);
  }

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
            wPos[i3 + 1] = zb[i] - 0.65 * WORLD.elevScale;
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
    if (this.waterMat.uniforms.uWindVec) {
      this.waterMat.uniforms.uWindVec.value.set(
        this.hydro.windDirX || 0.75,
        this.hydro.windSpeedMs || 4.8,
        this.hydro.windDirZ || 0.66,
      );
    }
    this.terrainMat.uniforms.uTime.value = timeSec;
    if (this.outerSeaMat) this.outerSeaMat.uniforms.uTime.value = timeSec;
    this.terrainMat.uniforms.uMeltOffset.value = this.economy.hydrology
      ? this.economy.hydrology.snowMeltVisualOffset
      : 0.0;

    // 3D-анимация перелива воды через гребни плотин и живых истоков 3 рек!
    this.updateOverflowWater3D(timeSec);
  }

  /** Отрисовка всех 32 типов зданий + РЕАЛЬНАЯ ПОЭТАПНАЯ 3D-СТРОЙКА (фундамент, леса, этажи, башенные краны!) */
  syncCityInstances() {
    const buildings = this.economy.allBuildings;
    const cityMap = new Map();
    for (const c of this.economy.cities) cityMap.set(c.id, c);

    const maxCap = this.cityBodies.instanceMatrix.count;
    const maxScaff = this.cityScaffolds.instanceMatrix.count;
    const maxCityCranes = this.cityCraneMasts.instanceMatrix.count;
    const cScale = Math.pow(WORLD.horizScale, 0.52);
    const foundH = 0.62 * Math.pow(WORLD.elevScale, 0.68);

    let boxIdx = 0;
    let siloIdx = 0;
    let roofIdx = 0;
    let domeIdx = 0;
    let foundIdx = 0;
    let scaffIdx = 0;
    let craneIdx = 0;
    this.activeCityCraneSites.length = 0;

    for (let i = 0; i < buildings.length && i < maxCap; i++) {
      const b = buildings[i];
      const city = cityMap.get(b.cityId);
      const powered = city && city.connected && city.powerRatio >= 0.45 ? 1.0 : 0.0;
      const prog = clamp(b.anim ?? 1.0, 0.0, 1.0);

      // 1. Бетонная фундаментная плита (заливается первой на этапе 0..16%)
      const foundScale = clamp(prog / 0.16, 0.25, 1.0);
      _pos.set(b.wx, b.wy - 0.35, b.wz);
      _euler.set(0, b.yaw, 0);
      _quat.setFromEuler(_euler);
      _scale.set(b.sx * foundScale, foundH, b.sz * foundScale);
      _mat4.compose(_pos, _quat, _scale);
      this.cityFoundations.setMatrixAt(foundIdx++, _mat4);

      // 2. Поэтажный подъём монолитного каркаса здания (с плавной ступенчатостью этажей!)
      let riseFrac = 0.05;
      if (prog > 0.10) {
        const rawRise = clamp((prog - 0.10) / 0.82, 0.0, 1.0);
        const floors = Math.max(2.0, Math.round(b.sy / (3.2 * Math.pow(WORLD.elevScale, 0.65))));
        const stepped = Math.floor(rawRise * floors) / floors;
        riseFrac = Math.max(0.06, lerp(stepped, rawRise, 0.62));
      }
      const animH = b.sy * (prog >= 0.96 ? 1.0 : riseFrac);

      _pos.set(b.wx, b.wy - 0.22, b.wz);
      _color.setRGB(b.shadeR || 0.72, b.shadeG || 0.74, b.shadeB || 0.78);

      if (b.roofType === 'silo') {
        _scale.set(b.sx, animH, b.sz);
        _mat4.compose(_pos, _quat, _scale);
        this.citySilos.setMatrixAt(siloIdx, _mat4);
        this.citySilos.setColorAt(siloIdx, _color);
        this.siloPoweredArr[siloIdx] = powered;
        this.siloStyleArr[siloIdx] = b.styleId || 13;
        this.siloBuildProgArr[siloIdx] = prog;
        siloIdx++;
      } else {
        _scale.set(b.sx, animH, b.sz);
        _mat4.compose(_pos, _quat, _scale);
        this.cityBodies.setMatrixAt(boxIdx, _mat4);
        this.cityBodies.setColorAt(boxIdx, _color);
        this.cityPoweredArr[boxIdx] = powered;
        this.cityStyleArr[boxIdx] = b.styleId || 0;
        this.cityBuildProgArr[boxIdx] = prog;
        boxIdx++;

        // Монтаж скатной крыши и купола выполняется на завершающей стадии (prog >= 0.80)
        if (prog >= 0.80) {
          const roofAppear = clamp((prog - 0.80) / 0.18, 0.05, 1.0);
          if (b.roofType === 'gable' && roofIdx < maxCap) {
            _pos.set(b.wx, b.wy - 0.22 + animH, b.wz);
            _scale.set(
              b.sx * 1.08,
              (1.8 * Math.pow(WORLD.elevScale, 0.7) + animH * 0.16) * roofAppear,
              b.sz * 1.08,
            );
            _mat4.compose(_pos, _quat, _scale);
            _color.setRGB(b.roofR || 0.68, b.roofG || 0.34, b.roofB || 0.26);
            this.cityRoofs.setMatrixAt(roofIdx, _mat4);
            this.cityRoofs.setColorAt(roofIdx, _color);
            roofIdx++;
          } else if (b.roofType === 'dome' && domeIdx < maxCap) {
            _pos.set(b.wx, b.wy - 0.22 + animH, b.wz);
            const domeR = Math.min(b.sx, b.sz) * 0.78 * roofAppear;
            _scale.set(domeR, domeR * 0.75, domeR);
            _mat4.compose(_pos, _quat, _scale);
            this.cityDomes.setMatrixAt(domeIdx++, _mat4);
          }
        }
      }

      // 3. Сквозные стальные строительные леса и башенный кран у активно возводимых зданий!
      if (prog >= 0.05 && prog < 0.92) {
        if (scaffIdx < maxScaff) {
          const dismantle = prog > 0.82 ? (1.0 - (prog - 0.82) / 0.10) : 1.0;
          const scaffH = Math.max(2.2 * WORLD.elevScale, animH * 1.08) * dismantle;
          _pos.set(b.wx, b.wy - 0.22, b.wz);
          _euler.set(0, b.yaw, 0);
          _quat.setFromEuler(_euler);
          _scale.set(b.sx * 1.12, scaffH, b.sz * 1.12);
          _mat4.compose(_pos, _quat, _scale);
          this.cityScaffolds.setMatrixAt(scaffIdx++, _mat4);
        }

        if (craneIdx < maxCityCranes) {
          const craneOffX = Math.cos(b.yaw) * (b.sx * 0.68 + 2.4 * cScale);
          const craneOffZ = -Math.sin(b.yaw) * (b.sz * 0.68 + 2.4 * cScale);
          const cx = b.wx + craneOffX;
          const cz = b.wz + craneOffZ;
          const mastH = Math.max(b.sy * 0.85, animH) + 7.5 * Math.pow(WORLD.elevScale, 0.72);
          _pos.set(cx, b.wy - 0.2, cz);
          _euler.set(0, b.yaw, 0);
          _quat.setFromEuler(_euler);
          _scale.set(cScale, mastH, cScale);
          _mat4.compose(_pos, _quat, _scale);
          this.cityCraneMasts.setMatrixAt(craneIdx, _mat4);

          this.activeCityCraneSites.push({
            x: cx,
            topY: b.wy - 0.2 + mastH,
            z: cz,
            baseYaw: b.yaw + Math.PI,
            scale: cScale * 0.92,
            seed: i * 1.37,
          });
          craneIdx++;
        }
      }
    }

    this.cityFoundations.count = foundIdx;
    this.cityBodies.count = boxIdx;
    this.citySilos.count = siloIdx;
    this.cityRoofs.count = roofIdx;
    this.cityDomes.count = domeIdx;
    this.cityScaffolds.count = scaffIdx;
    this.cityCraneMasts.count = craneIdx;

    this.cityFoundations.instanceMatrix.needsUpdate = true;
    this.cityBodies.instanceMatrix.needsUpdate = true;
    this.cityPoweredAttr.needsUpdate = true;
    this.cityStyleAttr.needsUpdate = true;
    this.cityBuildProgAttr.needsUpdate = true;
    if (this.cityBodies.instanceColor) this.cityBodies.instanceColor.needsUpdate = true;

    this.citySilos.instanceMatrix.needsUpdate = true;
    this.siloPoweredAttr.needsUpdate = true;
    this.siloStyleAttr.needsUpdate = true;
    this.siloBuildProgAttr.needsUpdate = true;
    if (siloIdx > 0 && this.citySilos.instanceColor) {
      this.citySilos.instanceColor.needsUpdate = true;
    }
    this.cityRoofs.instanceMatrix.needsUpdate = true;
    if (roofIdx > 0 && this.cityRoofs.instanceColor) {
      this.cityRoofs.instanceColor.needsUpdate = true;
    }
    this.cityDomes.instanceMatrix.needsUpdate = true;
    this.cityScaffolds.instanceMatrix.needsUpdate = true;
    this.cityCraneMasts.instanceMatrix.needsUpdate = true;
  }

  /** Синхронизирует канонические 3D-комплексы ГЭС/ГАЭС, водосбросы с 3D-струёй, шлюзы, рыбхозы и ОРУ */
  syncHydroStructures(timeSec = 0) {
    const activeIds = new Set();

    // 1. Приплотинные и русловые ГЭС / ГАЭС (машзал ВНИЗУ у подошвы плотины!)
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

      const gantry = meshGroup.userData.gantryTrolley;
      if (gantry) {
        gantry.position.z = Math.sin(timeSec * 0.45 + t.id) * meshGroup.userData.gantryTravel;
      }

      const lamp = meshGroup.userData.statusLamp;
      if (lamp) {
        if (t.isPumpingNow) {
          lamp.material.color.setHex(0x22d3ee); // бирюзовый = ночная закачка ГАЭС!
        } else if (t.cavitation > 0.45) {
          lamp.material.color.setHex(0xef4444); // кавитация
        } else {
          lamp.material.color.setHex(t.powerMW > 0.1 ? 0x34d399 : 0xf59e0b);
        }
      }
    }

    // 2. Сегментные затворы водосбросов + 3D-струя воды по лотку и трамплину!
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
        gateLeaf.position.y = sw.sillElev + sw.wallHeight * 0.5 + sw.openRatio * (sw.wallHeight * 0.80);
      }
      // Видимая 3D-анимация потока воды в лотке водосброса и прыжка с трамплина!
      const chuteWater = swGroup.userData.chuteWater;
      const skiJump = swGroup.userData.skiJump;
      const flowActive = sw.currentFlowQ > 0.35 && sw.openRatio > 0.03;
      if (chuteWater) {
        chuteWater.visible = flowActive;
        if (flowActive) {
          const hThickness = clamp(0.35 + sw.openRatio * 1.45, 0.35, 2.2);
          chuteWater.scale.y = hThickness;
        }
      }
      if (skiJump) {
        skiJump.visible = flowActive;
        if (flowActive) {
          const throwDist = swGroup.userData.baseThrow * (0.7 + clamp(sw.jetSpeed / 12.0, 0.15, 1.1));
          skiJump.scale.x = throwDist;
        }
      }
    }

    // 3. Судоходные шлюзы [L] с растворяющимися воротами и камерой!
    for (const lk of this.hydro.navLocks) {
      activeIds.add(`l_${lk.id}`);
      let lkGroup = this.structMeshes.get(`l_${lk.id}`);
      if (!lkGroup) {
        lkGroup = this._createNavLockMesh(lk);
        this.structMeshes.set(`l_${lk.id}`, lkGroup);
        this.structuresGroup.add(lkGroup);
      }
      const cyc = lk.cyclePhase || 0;
      const gateAngle = cyc < 0.25 ? Math.sin((cyc / 0.25) * Math.PI) * 0.95 : 0;
      if (lkGroup.userData.gateLeft) lkGroup.userData.gateLeft.rotation.y = gateAngle;
      if (lkGroup.userData.gateRight) lkGroup.userData.gateRight.rotation.y = -gateAngle;
      if (lkGroup.userData.chamberWater) {
        const chamberLift = Math.sin(cyc * Math.PI * 2) * 1.8 * WORLD.elevScale;
        lkGroup.userData.chamberWater.position.y = lk.baseY + 2.4 * WORLD.elevScale + chamberLift;
      }
    }

    // 4. Рыбоводные садки форели и яхт-марины [F] на воде!
    for (const ff of this.hydro.fishFarms) {
      activeIds.add(`f_${ff.id}`);
      let ffGroup = this.structMeshes.get(`f_${ff.id}`);
      if (!ffGroup) {
        ffGroup = this._createFishFarmMesh(ff);
        this.structMeshes.set(`f_${ff.id}`, ffGroup);
        this.structuresGroup.add(ffGroup);
      }
      const s = this.hydro.sampleAtWorld(ff.wx, ff.wz);
      ffGroup.position.y = Math.max(s.bed, s.surface);
      if (ffGroup.userData.aerator) {
        ffGroup.userData.aerator.rotation.y = timeSec * 4.5;
      }
    }

    // 5. Узловые 3D-подстанции ОРУ 110/220 кВ
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

    // 6. Бетонные заводы БСУ и Стройбазы [B] с вращающимся миксером и конвейером
    if (this.hydro.concretePlants) {
      for (const cp of this.hydro.concretePlants) {
        activeIds.add(`cp_${cp.id}`);
        let cpGroup = this.structMeshes.get(`cp_${cp.id}`);
        if (!cpGroup) {
          cpGroup = this._createConcretePlantMesh(cp);
          this.structMeshes.set(`cp_${cp.id}`, cpGroup);
          this.structuresGroup.add(cpGroup);
        }
        if (cpGroup.userData.mixerDrum) {
          cpGroup.userData.mixerDrum.rotation.x = timeSec * 2.4;
        }
      }
    }

    // 7. Береговые насосные станции и Водоканал [G]
    if (this.hydro.pumpStations) {
      for (const ps of this.hydro.pumpStations) {
        activeIds.add(`ps_${ps.id}`);
        let psGroup = this.structMeshes.get(`ps_${ps.id}`);
        if (!psGroup) {
          psGroup = this._createPumpStationMesh(ps);
          this.structMeshes.set(`ps_${ps.id}`, psGroup);
          this.structuresGroup.add(psGroup);
        }
        if (psGroup.userData.clarifierArm) {
          psGroup.userData.clarifierArm.rotation.y = timeSec * 1.15;
        }
      }
    }

    // 8. Метео-ветрокомплексы ВЭС [W] (рыскание гондолы по реальному ветру и вращение от скорости ветра!)
    if (this.hydro.windMeteoStations) {
      const windYaw = -(this.hydro.windAzimuthRad || 0);
      const windSpd = this.hydro.windSpeedMs || 4.8;
      for (const wm of this.hydro.windMeteoStations) {
        activeIds.add(`wm_${wm.id}`);
        let wmGroup = this.structMeshes.get(`wm_${wm.id}`);
        if (!wmGroup) {
          wmGroup = this._createWindMeteoMesh(wm);
          this.structMeshes.set(`wm_${wm.id}`, wmGroup);
          this.structuresGroup.add(wmGroup);
        }
        if (wmGroup.userData.nacelleHead) {
          wmGroup.userData.nacelleHead.rotation.y = windYaw;
        }
        if (wmGroup.userData.rotorHub) {
          wmGroup.userData.rotorHub.rotation.z = timeSec * (0.6 + windSpd * 0.42);
        }
        if (wmGroup.userData.radarDish) {
          wmGroup.userData.radarDish.rotation.y = timeSec * 1.6;
        }
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

  /**
   * ИСПРАВЛЕННАЯ АРХИТЕКТУРА ГИДРОЭЛЕКТРОСТАНЦИИ (по канонам Википедии «Гидроэлектростанция»):
   * 1) Напорный водоприёмник с сороудерживающей решёткой и козловым краном стоит на напорном фронте (x <= 0).
   * 2) Стальные напорные водоводы с кольцами жёсткости идут ВНИЗ по низовому откосу плотины.
   * 3) Здание машинного зала ГЭС стоит СТРОГО ВНИЗУ у подошвы плотины в нижнем бьефе (hallFloorY = hallBaseY)!
   *    Высокие светящиеся арочные окна машзала, трансформаторная палуба, порталы ОРУ и выходные диффузоры отсасывающих труб!
   */
  _createTurbinePowerhouseMesh(t) {
    const grp = new THREE.Group();
    grp.position.set(t.wx, 0, t.wz);
    grp.rotation.y = -t.yaw;

    const uScale = Math.pow(WORLD.horizScale, 0.52);
    const concMat = new THREE.MeshLambertMaterial({ color: 0xe2e8f0, map: this.textures.concreteMap });
    const darkConcMat = new THREE.MeshLambertMaterial({ color: 0x94a3b8, map: this.textures.concreteMap });
    const steelMat = new THREE.MeshStandardMaterial({
      color: 0xcbd5e1,
      map: this.textures.steel,
      roughness: 0.36,
      metalness: 0.68,
    });
    const accentMat = new THREE.MeshLambertMaterial({ color: t.spec.color, map: this.textures.steel });
    const craneYellow = new THREE.MeshLambertMaterial({ color: 0xf59e0b, map: this.textures.steel });
    const windowGlowMat = new THREE.MeshBasicMaterial({ color: 0xffe8a3 });

    // Отметка нижнего бьефа (подошва машзала) и отметка гребня напорного водоприёмника
    const tailBedY = Math.min(t.baseY, t.outfallBedY);
    const hallFloorY = tailBedY + 1.1 * WORLD.elevScale;
    const damCrestY = Math.max(hallFloorY + 5.2 * uScale, t.crestY);
    const damHeight = Math.max(5.0 * uScale, damCrestY - tailBedY);

    // Расстояние смещения машзала в нижний бьеф (+X вдоль потока!)
    const hallOffsetX = Math.max(8.8 * uScale, Math.hypot(t.hallWx - t.wx, t.hallWz - t.wz));

    // --- А. СТАНЦИОННАЯ НАПОРНАЯ СЕКЦИЯ ПЛОТИНЫ И ВОДОПРИЁМНИК (x = 0) ---
    const damPillar = new THREE.Mesh(
      new THREE.BoxGeometry(6.8 * uScale, damHeight, 12.6 * uScale),
      concMat,
    );
    damPillar.position.set(-1.2 * uScale, tailBedY + damHeight * 0.5, 0);
    damPillar.castShadow = !!this.profile.shadows;
    damPillar.receiveShadow = !!this.profile.shadows;

    // Бычки водоприёмника и мелкая стальная сороудерживающая решётка со стороны ВБ (-X)
    const intakeH = Math.max(4.8 * uScale, damHeight * 0.72);
    const trashRack = new THREE.Mesh(
      new THREE.BoxGeometry(0.6 * uScale, intakeH, 9.6 * uScale),
      new THREE.MeshLambertMaterial({ color: 0x1e293b, map: this.textures.steel }),
    );
    trashRack.position.set(-4.7 * uScale, damCrestY - intakeH * 0.52, 0);

    for (const pz of [-4.8, 0, 4.8]) {
      const pier = new THREE.Mesh(
        new THREE.BoxGeometry(2.4 * uScale, intakeH + 1.8 * uScale, 1.1 * uScale),
        darkConcMat,
      );
      pier.position.set(-4.5 * uScale, damCrestY - intakeH * 0.45 + 0.6 * uScale, pz * uScale);
      grp.add(pier);
    }

    // Козловой кран водоприёмника на гребне напорного фронта
    const gantryTrolley = new THREE.Group();
    gantryTrolley.position.set(-1.2 * uScale, damCrestY, 0);
    const gLegL = new THREE.Mesh(new THREE.BoxGeometry(0.6 * uScale, 3.8 * uScale, 0.6 * uScale), craneYellow);
    gLegL.position.set(-1.8 * uScale, 1.9 * uScale, 0);
    const gLegR = gLegL.clone();
    gLegR.position.x = 1.8 * uScale;
    const gBridge = new THREE.Mesh(new THREE.BoxGeometry(4.6 * uScale, 0.85 * uScale, 2.2 * uScale), craneYellow);
    gBridge.position.set(0, 3.9 * uScale, 0);
    gantryTrolley.add(gLegL, gLegR, gBridge);

    // --- Б. ПАРА СТАЛЬНЫХ НАКЛОННЫХ НАПОРНЫХ ВОДОВОДОВ (PENSTOCKS) С КОЛЬЦАМИ ЖЁСТКОСТИ ---
    const penRadius = (t.type === 'francis' ? 1.25 : (t.type === 'pelton' ? 1.05 : 1.38)) * uScale;
    const pStart = new THREE.Vector3(-0.5 * uScale, damCrestY - 2.2 * uScale, 0);
    const pEnd = new THREE.Vector3(hallOffsetX - 2.6 * uScale, hallFloorY + 1.8 * uScale, 0);
    const pVec = new THREE.Vector3().subVectors(pEnd, pStart);
    const pLen = Math.max(2.5, pVec.length());
    const pQuat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), pVec.clone().normalize());

    for (const zOff of [-2.4 * uScale, 2.4 * uScale]) {
      const pipe = new THREE.Mesh(new THREE.CylinderGeometry(penRadius, penRadius, pLen, 14), steelMat);
      pipe.position.copy(pStart).addScaledVector(pVec, 0.5);
      pipe.position.z = zOff;
      pipe.quaternion.copy(pQuat);
      pipe.castShadow = !!this.profile.shadows;
      grp.add(pipe);

      // Стальные бандажные кольца-компенсаторы вдоль напорного трубопровода
      for (const frac of [0.25, 0.55, 0.82]) {
        const ring = new THREE.Mesh(
          new THREE.CylinderGeometry(penRadius * 1.18, penRadius * 1.18, 0.42 * uScale, 14),
          accentMat,
        );
        ring.position.copy(pStart).addScaledVector(pVec, frac);
        ring.position.z = zOff;
        ring.quaternion.copy(pQuat);
        grp.add(ring);
      }
    }

    // --- В. ЗДАНИЕ МАШИННОГО ЗАЛА ГЭС В НИЖНЕМ БЬЕФЕ У ПОДОШВЫ ПЛОТИНЫ! ---
    const hallW = 9.4 * uScale;
    const hallH = 6.6 * uScale;
    const hallZ = 13.2 * uScale;

    // 1. Подводный бетонный блок спиральных камер и отсасывающих труб (уходит на 3 м ниже дна!)
    const subH = 4.6 * uScale;
    const subBlock = new THREE.Mesh(new THREE.BoxGeometry(hallW + 2.4 * uScale, subH, hallZ + 0.6 * uScale), darkConcMat);
    subBlock.position.set(hallOffsetX + 0.8 * uScale, hallFloorY - subH * 0.5 + 0.6 * uScale, 0);
    subBlock.receiveShadow = !!this.profile.shadows;

    // 2. Выходные окна диффузоров отсасывающих труб (Draft Tubes) в нижний бьеф (+X)
    for (const zOff of [-2.8 * uScale, 2.8 * uScale]) {
      const draftMouth = new THREE.Mesh(
        new THREE.BoxGeometry(1.4 * uScale, 2.5 * uScale, 3.8 * uScale),
        new THREE.MeshBasicMaterial({ color: 0x0b2239 }),
      );
      draftMouth.position.set(hallOffsetX + hallW * 0.5 + 1.5 * uScale, hallFloorY - 0.8 * uScale, zOff);
      grp.add(draftMouth);
    }

    // 3. Светлый архитектурный корпус машинного зала с высокими панорамными окнами и пилястрами
    const hallBody = new THREE.Mesh(new THREE.BoxGeometry(hallW, hallH, hallZ), concMat);
    hallBody.position.set(hallOffsetX, hallFloorY + hallH * 0.5, 0);
    hallBody.castShadow = !!this.profile.shadows;
    hallBody.receiveShadow = !!this.profile.shadows;

    // Светящиеся вертикальные витражи машинного зала ГЭС со стороны нижнего бьефа
    for (let wIdx = -2; wIdx <= 2; wIdx++) {
      const win = new THREE.Mesh(
        new THREE.BoxGeometry(0.25 * uScale, hallH * 0.62, 1.45 * uScale),
        windowGlowMat,
      );
      win.position.set(hallOffsetX + hallW * 0.5 + 0.05 * uScale, hallFloorY + hallH * 0.54, wIdx * 2.3 * uScale);
      grp.add(win);
    }

    // Цветной фриз крыши по типу гидроагрегата (Каплан / Фрэнсис / обратимая ГАЭС)
    const roofCornice = new THREE.Mesh(
      new THREE.BoxGeometry(hallW + 0.8 * uScale, 0.85 * uScale, hallZ + 0.8 * uScale),
      accentMat,
    );
    roofCornice.position.set(hallOffsetX, hallFloorY + hallH + 0.35 * uScale, 0);

    // Вращающийся зонтичный гидрогенератор под куполом машзала
    const rotor = new THREE.Group();
    rotor.position.set(hallOffsetX, hallFloorY + hallH + 1.15 * uScale, 0);
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(1.35 * uScale, 1.35 * uScale, 1.1 * uScale, 12), steelMat);
    const blade1 = new THREE.Mesh(new THREE.BoxGeometry(5.2 * uScale, 0.35 * uScale, 0.85 * uScale), accentMat);
    const blade2 = blade1.clone();
    blade2.rotation.y = Math.PI * 0.5;
    rotor.add(hub, blade1, blade2);

    // --- Г. ОТКРЫТАЯ ПАЛУБА СИЛОВЫХ ТРАНСФОРМАТОРОВ 220 кВ И ПОРТАЛ ВЫДАЧИ МОЩНОСТИ ---
    const xfmrDeckY = hallFloorY + 1.2 * uScale;
    const xfmr = new THREE.Mesh(new THREE.BoxGeometry(2.6 * uScale, 2.8 * uScale, 3.2 * uScale), steelMat);
    xfmr.position.set(hallOffsetX - hallW * 0.35, xfmrDeckY + 1.4 * uScale, hallZ * 0.5 + 2.0 * uScale);
    const portalA = new THREE.Mesh(new THREE.CylinderGeometry(0.18 * uScale, 0.32 * uScale, 6.2 * uScale, 4), steelMat);
    portalA.position.set(hallOffsetX, hallFloorY + hallH + 3.1 * uScale, hallZ * 0.38);

    const statusLamp = new THREE.Mesh(
      new THREE.SphereGeometry(0.68 * uScale, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0xf59e0b }),
    );
    statusLamp.position.set(hallOffsetX + hallW * 0.38, hallFloorY + hallH + 1.5 * uScale, hallZ * 0.38);

    grp.add(
      damPillar,
      trashRack,
      gantryTrolley,
      subBlock,
      hallBody,
      roofCornice,
      rotor,
      xfmr,
      portalA,
      statusLamp,
    );
    grp.userData.rotor = rotor;
    grp.userData.gantryTrolley = gantryTrolley;
    grp.userData.gantryTravel = 3.8 * uScale;
    grp.userData.statusLamp = statusLamp;
    return grp;
  }

  /**
   * 3D-водосброс с сегментным затвором + ВИДИМОЙ 3D-СТРУЁЙ ВОДЫ в лотке и прыжком с трамплина!
   */
  _createSpillwayMesh(sw) {
    const grp = new THREE.Group();
    grp.position.set(sw.wx, 0, sw.wz);
    grp.rotation.y = -sw.yaw;

    const uScale = Math.pow(WORLD.horizScale, 0.50);
    const pierMat = new THREE.MeshLambertMaterial({ color: 0xcbd5e1, map: this.textures.concreteMap });
    const steelMat = new THREE.MeshLambertMaterial({ color: 0xd97706, map: this.textures.steel });

    const pierH = sw.wallHeight + 4.8 * WORLD.elevScale;
    const chuteW = Math.max(7.6 * uScale, this.hydro.dx * 1.6);

    const pierL = new THREE.Mesh(new THREE.BoxGeometry(10.5 * uScale, pierH, 1.5 * uScale), pierMat);
    pierL.position.set(1.2 * uScale, sw.sillElev + pierH * 0.5 - 1.0, -chuteW * 0.55);
    pierL.castShadow = !!this.profile.shadows;
    const pierR = pierL.clone();
    pierR.position.z = chuteW * 0.55;

    const bridge = new THREE.Mesh(new THREE.BoxGeometry(2.8 * uScale, 1.3 * uScale, chuteW * 1.28), pierMat);
    bridge.position.set(0, sw.sillElev + pierH - 0.5, 0);

    const gateLeaf = new THREE.Mesh(new THREE.BoxGeometry(1.2 * uScale, sw.wallHeight, chuteW * 0.96), steelMat);
    gateLeaf.position.set(0, sw.sillElev + sw.wallHeight * 0.5, 0);

    // Наклонный водосливной лоток с трамплином-виражом (носок-трамплин!)
    const dropToBed = Math.max(2.0, sw.sillElev - (sw.downBedY || sw.sillElev - 4.0));
    const chuteLen = Math.max(8.0 * uScale, dropToBed * 1.15);
    const chutePitch = -Math.atan2(dropToBed * 0.55, chuteLen);

    const chuteSlab = new THREE.Mesh(new THREE.BoxGeometry(chuteLen, 1.2 * uScale, chuteW), pierMat);
    chuteSlab.rotation.z = chutePitch;
    chuteSlab.position.set(chuteLen * 0.45, sw.sillElev - dropToBed * 0.28, 0);

    // 1. 3D-водяной поток прямо в наклонном лотке водосброса!
    const chuteWater = new THREE.Mesh(
      new THREE.BoxGeometry(chuteLen * 1.02, 1.0 * uScale, chuteW * 0.92),
      this.overflowWaterMat,
    );
    chuteWater.rotation.z = chutePitch;
    chuteWater.position.set(chuteLen * 0.45, sw.sillElev - dropToBed * 0.28 + 0.95 * uScale, 0);
    chuteWater.renderOrder = 3;
    chuteWater.visible = false;

    // 2. Баллистическая 3D-струя отрыва воды с носка-трамплина в нижний бьеф!
    const skiJump = new THREE.Mesh(createCurvedOverflowNappeGeometry(), this.overflowWaterMat);
    const tipX = chuteLen * 0.92;
    const tipY = sw.sillElev - dropToBed * 0.52 + 0.8 * uScale;
    const remDrop = Math.max(2.2, tipY - (sw.downBedY || tipY - 4.0));
    const baseThrow = Math.max(6.0 * uScale, remDrop * 0.95);
    skiJump.position.set(tipX, tipY, 0);
    skiJump.scale.set(baseThrow, remDrop, chuteW * 0.90);
    skiJump.renderOrder = 3;
    skiJump.visible = false;

    grp.add(pierL, pierR, bridge, gateLeaf, chuteSlab, chuteWater, skiJump);
    grp.userData.gateLeaf = gateLeaf;
    grp.userData.chuteWater = chuteWater;
    grp.userData.skiJump = skiJump;
    grp.userData.baseThrow = baseThrow;
    return grp;
  }

  /** Судоходный шлюз [L] с бетонной камерой и растворяющимися воротами */
  _createNavLockMesh(lk) {
    const grp = new THREE.Group();
    grp.position.set(lk.wx, 0, lk.wz);
    grp.rotation.y = -lk.yaw;

    const uScale = Math.pow(WORLD.horizScale, 0.55);
    const concMat = new THREE.MeshLambertMaterial({ color: 0xd8dee9, map: this.textures.concreteMap });
    const gateMat = new THREE.MeshLambertMaterial({ color: 0x1d4ed8, map: this.textures.steel });

    const chamberLen = 22.0 * uScale;
    const chamberW = 7.4 * uScale;
    const wallH = 6.8 * WORLD.elevScale;

    const wallL = new THREE.Mesh(new THREE.BoxGeometry(chamberLen, wallH, 1.6 * uScale), concMat);
    wallL.position.set(0, lk.baseY + wallH * 0.5, -chamberW * 0.5);
    const wallR = wallL.clone();
    wallR.position.z = chamberW * 0.5;

    const chamberWater = new THREE.Mesh(
      new THREE.BoxGeometry(chamberLen * 0.92, 0.8, chamberW * 0.84),
      new THREE.MeshBasicMaterial({ color: 0x0ea5e9, transparent: true, opacity: 0.78 }),
    );
    chamberWater.position.set(0, lk.baseY + wallH * 0.45, 0);

    // Двустворчатые ворота шлюза с анимацией открытия/закрытия
    const gateLeft = new THREE.Mesh(new THREE.BoxGeometry(0.6 * uScale, wallH * 0.88, chamberW * 0.46), gateMat);
    gateLeft.position.set(chamberLen * 0.45, lk.baseY + wallH * 0.46, -chamberW * 0.24);
    const gateRight = gateLeft.clone();
    gateRight.position.z = chamberW * 0.24;

    grp.add(wallL, wallR, chamberWater, gateLeft, gateRight);
    grp.userData.gateLeft = gateLeft;
    grp.userData.gateRight = gateRight;
    grp.userData.chamberWater = chamberWater;
    return grp;
  }

  /** Плавучие круглые форелевые садки и яхтенный пирс [F] */
  _createFishFarmMesh(ff) {
    const grp = new THREE.Group();
    grp.position.set(ff.wx, ff.wy, ff.wz);
    const uScale = Math.pow(WORLD.horizScale, 0.55);

    const ringMat = new THREE.MeshLambertMaterial({ color: 0xf97316 });
    const netMat = new THREE.MeshBasicMaterial({ color: 0x075985, transparent: true, opacity: 0.65 });
    const deckMat = new THREE.MeshLambertMaterial({ color: 0xe2e8f0, map: this.textures.roof });

    const offsets = [[-4.2, -3.5], [4.2, -3.5], [-4.2, 3.5], [4.2, 3.5]];
    for (const [ox, oz] of offsets) {
      const torus = new THREE.Mesh(new THREE.TorusGeometry(3.1 * uScale, 0.28 * uScale, 6, 18), ringMat);
      torus.rotation.x = Math.PI * 0.5;
      torus.position.set(ox * uScale, 0.25 * uScale, oz * uScale);
      const net = new THREE.Mesh(new THREE.CircleGeometry(2.9 * uScale, 16), netMat);
      net.rotation.x = -Math.PI * 0.5;
      net.position.set(ox * uScale, 0.18 * uScale, oz * uScale);
      grp.add(torus, net);
    }

    const walkway = new THREE.Mesh(new THREE.BoxGeometry(13.0 * uScale, 0.35 * uScale, 1.8 * uScale), deckMat);
    walkway.position.y = 0.35 * uScale;

    const aerator = new THREE.Mesh(
      new THREE.BoxGeometry(2.6 * uScale, 0.45 * uScale, 0.55 * uScale),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8 }),
    );
    aerator.position.set(0, 0.85 * uScale, 0);

    grp.add(walkway, aerator);
    grp.userData.aerator = aerator;
    return grp;
  }

  _createSubstationMesh(sub) {
    const grp = new THREE.Group();
    grp.position.set(sub.wx, sub.wy, sub.wz);
    const uScale = Math.pow(WORLD.horizScale, 0.52);

    const concMat = new THREE.MeshLambertMaterial({ color: 0xcbd5e1, map: this.textures.concreteMap });
    const steelMat = new THREE.MeshLambertMaterial({ color: 0x94a3b8, map: this.textures.steel });
    const copperMat = new THREE.MeshLambertMaterial({ color: 0x38bdf8 });

    const pad = new THREE.Mesh(new THREE.BoxGeometry(16.5 * uScale, 1.0 * uScale, 14.5 * uScale), concMat);
    pad.position.y = -0.3 * uScale;
    grp.add(pad);

    for (const ox of [-3.6, 3.6]) {
      const tx = new THREE.Mesh(new THREE.BoxGeometry(3.8 * uScale, 3.8 * uScale, 4.6 * uScale), steelMat);
      tx.position.set(ox * uScale, 2.0 * uScale, 0);
      tx.castShadow = !!this.profile.shadows;
      grp.add(tx);

      for (const oz of [-1.2, 0, 1.2]) {
        const bush = new THREE.Mesh(new THREE.CylinderGeometry(0.18 * uScale, 0.26 * uScale, 2.1 * uScale, 6), copperMat);
        bush.position.set(ox * uScale, 4.8 * uScale, oz * uScale);
        grp.add(bush);
      }
    }

    for (const pz of [-5.2, 5.2]) {
      const legL = new THREE.Mesh(new THREE.CylinderGeometry(0.22 * uScale, 0.42 * uScale, 11.5 * uScale, 4), steelMat);
      legL.position.set(-5.8 * uScale, 5.75 * uScale, pz * uScale);
      const legR = legL.clone();
      legR.position.x = 5.8 * uScale;
      const crossbar = new THREE.Mesh(new THREE.BoxGeometry(12.8 * uScale, 0.45 * uScale, 0.45 * uScale), steelMat);
      crossbar.position.set(0, 11.2 * uScale, pz * uScale);
      grp.add(legL, legR, crossbar);
    }

    const beacon = new THREE.Mesh(
      new THREE.SphereGeometry(0.65 * uScale, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8 }),
    );
    beacon.position.set(0, 12.2 * uScale, 5.2 * uScale);
    grp.add(beacon);

    return grp;
  }

  /** 3D Бетонный завод БСУ и Стройбаза [B]: два силоса цемента, наклонный конвейер, башня миксера, конусы щебня и бытовка */
  _createConcretePlantMesh(cp) {
    const grp = new THREE.Group();
    grp.position.set(cp.wx, cp.wy, cp.wz);
    grp.rotation.y = -(cp.yaw || 0);
    const uScale = Math.pow(WORLD.horizScale, 0.52);

    const concMat = new THREE.MeshLambertMaterial({ color: 0xd8dee9, map: this.textures.concreteMap });
    const siloMat = new THREE.MeshLambertMaterial({ color: 0xe2e8f0, map: this.textures.steel });
    const orangeMat = new THREE.MeshLambertMaterial({ color: 0xf59e0b, map: this.textures.steel });
    const blueCabinMat = new THREE.MeshLambertMaterial({ color: 0x2563eb });
    const gravelMat = new THREE.MeshLambertMaterial({ color: 0x78716c, map: this.textures.rock });

    const pad = new THREE.Mesh(new THREE.BoxGeometry(19.0 * uScale, 0.9 * uScale, 15.0 * uScale), concMat);
    pad.position.y = -0.3 * uScale;
    grp.add(pad);

    // Два высоких силоса цемента с сигнальными поясами
    for (const sz of [-3.2, 1.2]) {
      const silo = new THREE.Mesh(new THREE.CylinderGeometry(2.1 * uScale, 2.1 * uScale, 13.5 * uScale, 12), siloMat);
      silo.position.set(-4.5 * uScale, 6.8 * uScale, sz * uScale);
      silo.castShadow = !!this.profile.shadows;
      const cap = new THREE.Mesh(new THREE.ConeGeometry(2.25 * uScale, 1.8 * uScale, 12), orangeMat);
      cap.position.set(-4.5 * uScale, 14.4 * uScale, sz * uScale);
      grp.add(silo, cap);
    }

    // Смесительная башня БСУ с вращающимся барабаном бетоносмесителя
    const mixerTower = new THREE.Mesh(new THREE.BoxGeometry(5.6 * uScale, 8.6 * uScale, 5.2 * uScale), concMat);
    mixerTower.position.set(2.2 * uScale, 4.3 * uScale, -1.0 * uScale);
    mixerTower.castShadow = !!this.profile.shadows;
    grp.add(mixerTower);

    const mixerDrum = new THREE.Mesh(new THREE.CylinderGeometry(1.55 * uScale, 1.25 * uScale, 3.8 * uScale, 10), orangeMat);
    mixerDrum.rotation.z = Math.PI * 0.5;
    mixerDrum.position.set(2.2 * uScale, 9.6 * uScale, -1.0 * uScale);
    grp.add(mixerDrum);

    // Наклонная галерея ленточного конвейера подачи щебня
    const conv = new THREE.Mesh(new THREE.BoxGeometry(10.8 * uScale, 1.1 * uScale, 1.4 * uScale), orangeMat);
    conv.rotation.z = 0.46;
    conv.position.set(5.2 * uScale, 5.2 * uScale, 3.4 * uScale);
    grp.add(conv);

    // Терриконы гранитного щебня и строительная диспетчерская бытовка
    const heap1 = new THREE.Mesh(new THREE.ConeGeometry(3.2 * uScale, 3.0 * uScale, 9), gravelMat);
    heap1.position.set(6.4 * uScale, 1.5 * uScale, 4.4 * uScale);
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(4.8 * uScale, 2.8 * uScale, 3.0 * uScale), blueCabinMat);
    cabin.position.set(-4.2 * uScale, 1.4 * uScale, 4.8 * uScale);
    grp.add(heap1, cabin);

    grp.userData.mixerDrum = mixerDrum;
    return grp;
  }

  /** 3D Береговая насосная станция и Водоканал [G]: насосный павильон, круглый отстойник с фермой и стальные водоводы */
  _createPumpStationMesh(ps) {
    const grp = new THREE.Group();
    grp.position.set(ps.wx, ps.wy, ps.wz);
    grp.rotation.y = -(ps.yaw || 0);
    const uScale = Math.pow(WORLD.horizScale, 0.52);

    const concMat = new THREE.MeshLambertMaterial({ color: 0xe2e8f0, map: this.textures.concreteMap });
    const pipeMat = new THREE.MeshLambertMaterial({ color: 0x0284c7, map: this.textures.steel });
    const waterPoolMat = new THREE.MeshBasicMaterial({ color: 0x0ea5e9, transparent: true, opacity: 0.85 });

    const pad = new THREE.Mesh(new THREE.BoxGeometry(14.5 * uScale, 1.0 * uScale, 12.0 * uScale), concMat);
    pad.position.y = -0.3 * uScale;
    grp.add(pad);

    const hall = new THREE.Mesh(new THREE.BoxGeometry(6.8 * uScale, 5.2 * uScale, 6.2 * uScale), concMat);
    hall.position.set(-2.6 * uScale, 2.6 * uScale, 0);
    hall.castShadow = !!this.profile.shadows;
    grp.add(hall);

    // Круглый резервуар-осветлитель Горводоканала с вращающейся скребковой фермой
    const tankWall = new THREE.Mesh(new THREE.CylinderGeometry(3.6 * uScale, 3.6 * uScale, 2.6 * uScale, 16), concMat);
    tankWall.position.set(3.6 * uScale, 1.3 * uScale, 0);
    const tankWater = new THREE.Mesh(new THREE.CircleGeometry(3.3 * uScale, 16), waterPoolMat);
    tankWater.rotation.x = -Math.PI * 0.5;
    tankWater.position.set(3.6 * uScale, 2.65 * uScale, 0);
    const clarifierArm = new THREE.Mesh(new THREE.BoxGeometry(6.4 * uScale, 0.35 * uScale, 0.55 * uScale), pipeMat);
    clarifierArm.position.set(3.6 * uScale, 2.85 * uScale, 0);
    grp.add(tankWall, tankWater, clarifierArm);

    // Всасывающие стальные водоводы в сторону реки
    for (const pz of [-1.6, 1.6]) {
      const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.55 * uScale, 0.55 * uScale, 8.2 * uScale, 10), pipeMat);
      pipe.rotation.z = Math.PI * 0.38;
      pipe.position.set(-6.8 * uScale, 0.4 * uScale, pz * uScale);
      grp.add(pipe);
    }

    grp.userData.clarifierArm = clarifierArm;
    return grp;
  }

  /** 3D Метео-ветрокомплекс ВЭС [W]: башня ВЭС с поворотной гондолой по ветру + купол доплеровского метеорадара */
  _createWindMeteoMesh(wm) {
    const grp = new THREE.Group();
    grp.position.set(wm.wx, wm.wy, wm.wz);
    const uScale = Math.pow(WORLD.horizScale, 0.54);

    const whiteMat = new THREE.MeshLambertMaterial({ color: 0xf8fafc, map: this.textures.steel });
    const accentMat = new THREE.MeshLambertMaterial({ color: 0x0ea5e9 });
    const concMat = new THREE.MeshLambertMaterial({ color: 0xcbd5e1, map: this.textures.concreteMap });

    const pad = new THREE.Mesh(new THREE.BoxGeometry(11.0 * uScale, 0.9 * uScale, 9.5 * uScale), concMat);
    pad.position.y = -0.25 * uScale;
    grp.add(pad);

    const towerH = 24.0 * uScale;
    const tower = new THREE.Mesh(new THREE.CylinderGeometry(0.62 * uScale, 1.35 * uScale, towerH, 10), whiteMat);
    tower.position.set(-1.5 * uScale, towerH * 0.5, 0);
    tower.castShadow = !!this.profile.shadows;
    grp.add(tower);

    // Поворотная гондола, разворачивающаяся навстречу реальному вектору ветра!
    const nacelleHead = new THREE.Group();
    nacelleHead.position.set(-1.5 * uScale, towerH, 0);
    const nacelleBox = new THREE.Mesh(new THREE.BoxGeometry(2.1 * uScale, 1.9 * uScale, 4.4 * uScale), whiteMat);
    nacelleHead.add(nacelleBox);

    const rotorHub = new THREE.Group();
    rotorHub.position.set(0, 0, 2.35 * uScale);
    const nose = new THREE.Mesh(new THREE.ConeGeometry(0.85 * uScale, 1.8 * uScale, 8), accentMat);
    nose.rotation.x = Math.PI * 0.5;
    rotorHub.add(nose);

    const bladeLen = 11.5 * uScale;
    for (let b = 0; b < 3; b++) {
      const bladePivot = new THREE.Group();
      bladePivot.rotation.z = (b * Math.PI * 2) / 3;
      const blade = new THREE.Mesh(new THREE.BoxGeometry(0.75 * uScale, bladeLen, 0.18 * uScale), whiteMat);
      blade.position.y = bladeLen * 0.5;
      bladePivot.add(blade);
      rotorHub.add(bladePivot);
    }
    nacelleHead.add(rotorHub);
    grp.add(nacelleHead);

    // Рядом — опора и белый сферический купол доплеровского метеорадара Росгидромета
    const radarPed = new THREE.Mesh(new THREE.CylinderGeometry(1.1 * uScale, 1.4 * uScale, 4.2 * uScale, 8), concMat);
    radarPed.position.set(3.2 * uScale, 2.1 * uScale, 0);
    const radarDish = new THREE.Mesh(new THREE.SphereGeometry(1.85 * uScale, 12, 10), whiteMat);
    radarDish.position.set(3.2 * uScale, 5.2 * uScale, 0);
    const radarBand = new THREE.Mesh(new THREE.TorusGeometry(1.86 * uScale, 0.12 * uScale, 6, 16), accentMat);
    radarBand.rotation.x = Math.PI * 0.5;
    radarDish.add(radarBand);
    grp.add(radarPed, radarDish);

    grp.userData.nacelleHead = nacelleHead;
    grp.userData.rotorHub = rotorHub;
    grp.userData.radarDish = radarDish;
    return grp;
  }

  _rebuildPowerLines() {
    const hs = WORLD.horizScale;
    const pScale = Math.pow(hs, 0.56);
    const defaultHub = this.hydro.substations.length > 0
      ? { x: this.hydro.substations[0].wx, z: this.hydro.substations[0].wz }
      : (this.hydro.turbines.length > 0
        ? { x: this.hydro.turbines[0].wx, z: this.hydro.turbines[0].wz }
        : { x: 12 * hs, z: -152 * hs });

    let pylonIdx = 0;
    let wireFloats = 0;
    const maxPylons = this.pylonMesh.instanceMatrix.count;

    const corridors = [];
    for (const sub of this.hydro.substations) {
      for (const t of this.hydro.turbines) {
        if (Math.hypot(t.wx - sub.wx, t.wz - sub.wz) < 220 * hs) {
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

    const spanStep = 52 * hs;
    for (const corr of corridors) {
      const dist = Math.hypot(corr.x1 - corr.x0, corr.z1 - corr.z0);
      const steps = clamp(Math.ceil(dist / spanStep), 2, 18);
      const yaw = Math.atan2(corr.x1 - corr.x0, corr.z1 - corr.z0);
      let prevTop = null;

      for (let s = 0; s <= steps; s++) {
        if (pylonIdx >= maxPylons) break;
        const t = s / steps;
        const px = corr.x0 + (corr.x1 - corr.x0) * t;
        const pz = corr.z0 + (corr.z1 - corr.z0) * t;
        const samp = this.hydro.sampleAtWorld(px, pz);
        const groundY = Math.max(samp.bed, samp.surface);

        _pos.set(px, groundY, pz);
        _euler.set(0, yaw, 0);
        _quat.setFromEuler(_euler);
        _scale.set(pScale, pScale, pScale);
        _mat4.compose(_pos, _quat, _scale);
        this.pylonMesh.setMatrixAt(pylonIdx, _mat4);
        this.pylonArmMesh.setMatrixAt(pylonIdx, _mat4);
        pylonIdx++;

        const topY = groundY + 12.1 * pScale;
        if (prevTop && wireFloats + 12 <= this.wirePositions.length) {
          const midX = (prevTop.x + px) * 0.5;
          const midZ = (prevTop.z + pz) * 0.5;
          const midY = (prevTop.y + topY) * 0.5 - 2.1 * pScale;

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

  updateAtmosphere(hour, weather, cameraTarget = null, dt = 0.016) {
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

    // Адаптивная плотность тумана под 0.8 км / 5×5 км / 10×10 км (чтобы дальние горы 10 км были видны чётко!)
    const scaledFogDensity = weather.fogDensity / Math.pow(WORLD.horizScale, 0.84);

    // Следящий за камерой теневой источник света
    const cx = cameraTarget ? cameraTarget.x : 0;
    const cz = cameraTarget ? cameraTarget.z : 0;
    const sunDist = 480 * Math.pow(WORLD.horizScale, 0.55);
    this.sunLight.target.position.set(cx, 0, cz);
    this.sunLight.position.set(
      cx + sunDir.x * sunDist,
      Math.max(120, sunDir.y * sunDist),
      cz + sunDir.z * sunDist,
    );
    this.sunLight.color.copy(sunCol);
    this.sunLight.intensity = (0.18 + 1.34 * dayFactor) * weather.sunIntensity;
    this.hemiLight.intensity = 0.26 + 0.56 * dayFactor;
    this.scene.background.copy(this.fogColor);

    const lightDirForShaders = sunY > -0.05 ? sunDir : new THREE.Vector3(-sunDir.x, 0.35, -sunDir.z).normalize();
    this.terrainMat.uniforms.uSunDir.value.copy(lightDirForShaders);
    this.terrainMat.uniforms.uSunColor.value.copy(sunCol).multiplyScalar(0.32 + 0.78 * dayFactor);
    this.terrainMat.uniforms.uSkyColor.value.copy(this.skyColorZenith).lerp(new THREE.Color(0xffffff), 0.35);
    this.terrainMat.uniforms.uFogColor.value.copy(this.fogColor);
    this.terrainMat.uniforms.uFogDensity.value = scaledFogDensity;

    this.waterMat.uniforms.uSunDir.value.copy(lightDirForShaders);
    this.waterMat.uniforms.uSunColor.value.copy(sunCol).multiplyScalar(dayFactor);
    this.waterMat.uniforms.uSkyZenith.value.copy(this.skyColorZenith);
    this.waterMat.uniforms.uSkyHorizon.value.copy(this.skyColorHorizon);
    this.waterMat.uniforms.uFogColor.value.copy(this.fogColor);
    this.waterMat.uniforms.uFogDensity.value = scaledFogDensity;

    if (this.overflowWaterMat) {
      this.overflowWaterMat.uniforms.uSunFactor.value = 0.25 + 0.75 * dayFactor;
      this.overflowWaterMat.uniforms.uFogColor.value.copy(this.fogColor);
      this.overflowWaterMat.uniforms.uFogDensity.value = scaledFogDensity;
    }

    if (this.outerSeaMat) {
      this.outerSeaMat.uniforms.uSunDir.value.copy(lightDirForShaders);
      this.outerSeaMat.uniforms.uSunColor.value.copy(sunCol).multiplyScalar(dayFactor);
      this.outerSeaMat.uniforms.uSkyZenith.value.copy(this.skyColorZenith);
      this.outerSeaMat.uniforms.uSkyHorizon.value.copy(this.skyColorHorizon);
      this.outerSeaMat.uniforms.uFogColor.value.copy(this.fogColor);
      this.outerSeaMat.uniforms.uFogDensity.value = scaledFogDensity;
    }
    if (this.horizonMistMat) {
      this.horizonMistMat.uniforms.uFogColor.value.copy(this.fogColor);
      this.horizonMistMat.uniforms.uOpacity.value = weather.id === 'flood' ? 0.88 : (weather.id === 'rain' ? 0.80 : 0.68);
    }

    if (this.cityBodyMat) {
      this.cityBodyMat.uniforms.uSunDir.value.copy(lightDirForShaders);
      this.cityBodyMat.uniforms.uSunColor.value.copy(sunCol).multiplyScalar(0.28 + 0.82 * dayFactor);
      this.cityBodyMat.uniforms.uSkyColor.value.copy(this.skyColorZenith).lerp(new THREE.Color(0xffffff), 0.35);
      this.cityBodyMat.uniforms.uNightFactor.value = clamp(1.0 - (sunY + 0.05) / 0.28, 0.0, 1.0);
      this.cityBodyMat.uniforms.uFogColor.value.copy(this.fogColor);
      this.cityBodyMat.uniforms.uFogDensity.value = scaledFogDensity;
    }

    if (this.roadRenderer) {
      const nightFactor = clamp(1.0 - (sunY + 0.05) / 0.28, 0.0, 1.0);
      this.roadRenderer.updateCrewAnimations(
        this.hydro.simTime || 0,
        lightDirForShaders,
        this.cityBodyMat ? this.cityBodyMat.uniforms.uSunColor.value : sunCol,
        this.cityBodyMat ? this.cityBodyMat.uniforms.uSkyColor.value : this.skyColorZenith,
        this.fogColor,
        scaledFogDensity,
        nightFactor,
      );
    }

    // Обновляем живой мир долины (корабли, яхты, поезда, машины, ВЭС, СЭС, градирни, птиц, рыб и облака!)
    if (this.livingWorld && dt > 0) {
      this.livingWorld.update(dt, hour, dayFactor, lightDirForShaders);
    }

    const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
    if (this.irrBeacon) {
      this.irrBeacon.visible = !this.economy.agroIrrigated;
      if (this.irrBeacon.visible) {
        const bs = this.irrBeacon.userData.baseScale || 1;
        const s = bs * (1.0 + Math.sin(now * 0.004) * 0.08);
        this.irrBeacon.scale.set(s, 1, s);
      }
    }

    if (this.tutorialBeacon && this.tutorialBeacon.visible) {
      const bScale = Math.pow(WORLD.horizScale, 0.56);
      const pulse = bScale * (1.0 + Math.sin(now * 0.0055) * 0.10);
      this.tutorialBeacon.scale.set(pulse, bScale, pulse);
      this.tutorialBeacon.userData.pointer.position.y = 21 + Math.sin(now * 0.006) * 2.8;
      this.tutorialBeacon.userData.pointer.rotation.y = now * 0.0022;
    }

    return { isNight: sunY < 0.06, dayFactor };
  }

  updateCursor(wx, wz, radius, toolId, yawAngle, damTierAddH = 15.3, visible = true) {
    this.cursorGroup.visible = visible;
    if (!visible) return;
    const s = this.hydro.sampleAtWorld(wx, wz);
    const y = Math.max(s.bed, s.surface) + 0.35 * WORLD.elevScale;
    this.cursorGroup.position.set(wx, y, wz);
    this.cursorRing.scale.set(radius, radius, 1);

    const isUnit = (
      toolId === 'spillway' ||
      toolId === 'nav_lock' ||
      toolId === 'concrete_plant' ||
      toolId === 'pump_station' ||
      toolId.startsWith('turbine_')
    );
    this.flowArrow.visible = isUnit;

    const showGhost = toolId === 'concrete_dam' || toolId === 'earth_dam' || toolId === 'foundation';
    this.ghostVolume.visible = showGhost;
    if (showGhost) {
      // damTierAddH уже переведён в метры масштаба карты в applyMapScale!
      const hPreview = toolId === 'concrete_dam'
        ? damTierAddH
        : ((toolId === 'earth_dam' ? 3.8 : 4.5) * WORLD.elevScale);
      const effR = toolId === 'concrete_dam' ? Math.max(this.hydro.dx * 0.5, radius * 0.82) : radius;
      this.ghostVolume.scale.set(effR, hPreview, effR);
      this.ghostVolumeMat.color.setHex(toolId === 'foundation' ? 0xf59e0b : 0xfbbf24);
    }

    if (isUnit || toolId === 'wind_meteo') {
      const { gx, gz } = this.hydro.worldToGrid(wx, wz);
      const dir = this.hydro.detectHydraulicDirection(gx, gz, yawAngle);
      const arrowScale = Math.pow(WORLD.horizScale, 0.55);
      this.flowArrow.scale.setScalar(arrowScale);
      this.flowArrow.rotation.y = -dir.yaw;
      this.cursorRingMat.color.setHex(0x34d399);
    } else if (toolId === 'canal_dig' || toolId === 'fish_eco') {
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
