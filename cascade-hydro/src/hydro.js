// ============================================================================
//  ЯДРО ФИЗИКИ ВОДЫ И ОБЪЁМНОЙ СТРОЙКИ «REAL-LIFE HYDRO v2»
//  - 2.5D Audusse Well-Balanced SWE + вихри Кармана + размыв Шильдса
//  - 3-этапное объёмное бетонирование (шпунт -> армокаркас/опалубка -> 3D-монолит)
//  - Геология основания, фильтрация под подошвой, цементация и 3D-контрфорсы
//  - Баланс земляных и скальных масс (отвал грунта + щебень со скидкой 38% на бетон)
//  - Напорные водоводы турбин ГЭС, сегментные затворы и подстанции ОРУ 110 кВ
// ============================================================================

import { WORLD, TURBINE_SPECS, CONSTRUCTION, VALLEY_PRESETS } from './config.js';
import { clamp, lerp } from './noise.js';
import { buildValleyTerrain, VALLEY_RIVERS } from './valley.js';

const G = WORLD.gravity;
const RHO = WORLD.waterDensity;
const EPS_H = 0.014;
const EPS_H4 = EPS_H * EPS_H * EPS_H * EPS_H;
const MAX_SPEED = 26.0;
const TILE = 8;

export class HydroSimulation {
  constructor(grid = 208, presetId = 'bystritsa', skipInitialBuild = false) {
    this.grid = grid;
    this.presetId = presetId;
    this.count = grid * grid;
    this.dx = WORLD.size / grid;
    this.cellArea = this.dx * this.dx;

    // Слои рельефа, опалубки и инженерных конструкций
    this.bedrock = new Float32Array(this.count);
    this.soil = new Float32Array(this.count);
    this.concrete = new Float32Array(this.count);       // набранный монолитный бетон
    this.targetConcrete = new Float32Array(this.count); // проектная высота бетонирования
    this.formworkWall = new Float32Array(this.count);   // временный шпунт/опалубка на время заливки
    this.buildProgress = new Float32Array(this.count);  // 0..1 прогресс стройки секции
    this.gateWall = new Float32Array(this.count);
    this.zb = new Float32Array(this.count);

    this.linedMask = new Uint8Array(this.count);        // 1 = Ж/Б лоток и борта канала
    this.earthDamMask = new Uint8Array(this.count);     // 1 = насыпная перемычка
    this.foundationMask = new Uint8Array(this.count);   // 1 = скальная цементация + 3D-контрфорс
    this.buttressYaw = new Float32Array(this.count);    // угол разворота контрфорса

    // Консервативные переменные мелкой воды Сен-Венана
    this.h = new Float32Array(this.count);
    this.hu = new Float32Array(this.count);
    this.hv = new Float32Array(this.count);

    this.dH = new Float32Array(this.count);
    this.dHU = new Float32Array(this.count);
    this.dHV = new Float32Array(this.count);

    this.u = new Float32Array(this.count);
    this.v = new Float32Array(this.count);
    this.vort = new Float32Array(this.count);
    this.sediment = new Float32Array(this.count);
    this.foam = new Float32Array(this.count);
    this.sedNext = new Float32Array(this.count);
    this.foamNext = new Float32Array(this.count);
    this.wetness = new Float32Array(this.count);

    // Оптимизация активных тайлов 8×8
    this.tilesN = Math.ceil(grid / TILE);
    this.totalTiles = this.tilesN * this.tilesN;
    this.tileWet = new Uint8Array(this.totalTiles);
    this.activeTiles = new Int32Array(this.totalTiles);
    this.activeTileCount = 0;

    // Грязный прямоугольник рельефа + флаг обновления 3D-инстансов стройки
    this.terrainDirty = true;
    this.dirtyMinX = 0;
    this.dirtyMinZ = 0;
    this.dirtyMaxX = grid - 1;
    this.dirtyMaxZ = grid - 1;
    this.engineeredDirty = true;

    // Активные ячейки стройплощадки (чтобы не обходить всю сетку каждый кадр!)
    this.activeBuildCells = [];
    this.activeBuildSet = new Uint8Array(this.count);
    this.activeBuildSites = []; // координаты центров для 3D башенных кранов

    // Сооружения гидроузла и ОРУ
    this.turbines = [];
    this.spillways = [];
    this.substations = [];
    this.nextStructId = 1;

    // Склады материалов и инженерная телеметрия
    this.soilStockpileM3 = 0;
    this.rockStockpileM3 = 0;
    this.totalExcavatedM3 = 0;
    this.damCellCount = 0;
    this.reinforcedCellCount = 0;
    this.maxDamStress = 0;
    this.totalSeepageQ = 0;
    this.pendingPourVolumeM3 = 0;

    this.inflowMult = 1.0;
    this.rainRate = 0.0;
    this.lastSubsteps = 0;
    this.lastStepMs = 0;
    this.totalWaterVolumeM3 = 0;
    this.simTime = 0;
    this._erosionTick = 0;

    this.jetEmitters = [];

    if (!skipInitialBuild) {
      this.resetValley(presetId);
    }
  }

  _clearArrays() {
    this.bedrock.fill(0);
    this.soil.fill(0);
    this.concrete.fill(0);
    this.targetConcrete.fill(0);
    this.formworkWall.fill(0);
    this.buildProgress.fill(1);
    this.gateWall.fill(0);
    this.linedMask.fill(0);
    this.earthDamMask.fill(0);
    this.foundationMask.fill(0);
    this.buttressYaw.fill(0);
    this.h.fill(0);
    this.hu.fill(0);
    this.hv.fill(0);
    this.vort.fill(0);
    this.sediment.fill(0);
    this.foam.fill(0);
    this.wetness.fill(0);
    this.activeBuildCells = [];
    this.activeBuildSet.fill(0);
    this.activeBuildSites = [];
    this.turbines = [];
    this.spillways = [];
    this.substations = [];
    this.soilStockpileM3 = 0;
    this.rockStockpileM3 = 0;
    this.totalExcavatedM3 = 0;
    this.damCellCount = 0;
    this.reinforcedCellCount = 0;
    this.maxDamStress = 0;
    this.totalSeepageQ = 0;
    this.pendingPourVolumeM3 = 0;
    this.engineeredDirty = true;
  }

  resetValley(presetId = this.presetId) {
    this.presetId = presetId;
    this._clearArrays();
    buildValleyTerrain(this.grid, this, presetId, 0, this.grid);
    this.finalizeValleySetup(18);
  }

  /** Завершает предзагрузку рельефа после чанковой генерации */
  finalizeValleySetup(warmupSteps = 18) {
    this.recomputeZbRange(0, 0, this.grid - 1, this.grid - 1);
    this._rebuildVelocitiesAll();
    this._rebuildActiveTiles();
    for (let i = 0; i < warmupSteps; i++) {
      this._substep(0.045);
    }
    this.engineeredDirty = true;
  }

  worldToGrid(wx, wz) {
    const half = WORLD.size * 0.5;
    const gx = Math.floor((wx + half) / this.dx);
    const gz = Math.floor((wz + half) / this.dx);
    return {
      gx: clamp(gx, 0, this.grid - 1),
      gz: clamp(gz, 0, this.grid - 1),
    };
  }

  gridToWorld(gx, gz) {
    const half = WORLD.size * 0.5;
    return {
      wx: -half + (gx + 0.5) * this.dx,
      wz: -half + (gz + 0.5) * this.dx,
    };
  }

  recomputeZbRange(x0, z0, x1, z1) {
    const g = this.grid;
    const ax0 = clamp(x0, 0, g - 1);
    const az0 = clamp(z0, 0, g - 1);
    const ax1 = clamp(x1, 0, g - 1);
    const az1 = clamp(z1, 0, g - 1);
    for (let gz = az0; gz <= az1; gz++) {
      const row = gz * g;
      for (let gx = ax0; gx <= ax1; gx++) {
        const i = row + gx;
        const effWall = Math.max(this.concrete[i], this.formworkWall[i]);
        this.zb[i] = this.bedrock[i] + this.soil[i] + effWall + this.gateWall[i];
      }
    }
    this.markTerrainDirty(ax0, az0, ax1, az1);
  }

  markTerrainDirty(x0, z0, x1, z1) {
    if (!this.terrainDirty) {
      this.terrainDirty = true;
      this.dirtyMinX = x0;
      this.dirtyMinZ = z0;
      this.dirtyMaxX = x1;
      this.dirtyMaxZ = z1;
    } else {
      if (x0 < this.dirtyMinX) this.dirtyMinX = x0;
      if (z0 < this.dirtyMinZ) this.dirtyMinZ = z0;
      if (x1 > this.dirtyMaxX) this.dirtyMaxX = x1;
      if (z1 > this.dirtyMaxZ) this.dirtyMaxZ = z1;
    }
  }

  consumeTerrainDirty() {
    if (!this.terrainDirty) return null;
    const rect = {
      x0: clamp(this.dirtyMinX - 1, 0, this.grid - 1),
      z0: clamp(this.dirtyMinZ - 1, 0, this.grid - 1),
      x1: clamp(this.dirtyMaxX + 1, 0, this.grid - 1),
      z1: clamp(this.dirtyMaxZ + 1, 0, this.grid - 1),
    };
    this.terrainDirty = false;
    return rect;
  }

  sampleAtWorld(wx, wz) {
    const { gx, gz } = this.worldToGrid(wx, wz);
    const i = gz * this.grid + gx;
    const depth = this.h[i];
    const bed = this.zb[i];
    const ux = this.u[i];
    const vz = this.v[i];
    const speed = Math.hypot(ux, vz);
    const froude = depth > 0.03 ? speed / Math.sqrt(G * depth) : 0;
    return {
      gx,
      gz,
      bed,
      bedrock: this.bedrock[i],
      soil: this.soil[i],
      concrete: this.concrete[i],
      targetConcrete: this.targetConcrete[i],
      buildProgress: this.buildProgress[i],
      lined: this.linedMask[i] === 1,
      earthDam: this.earthDamMask[i] === 1,
      reinforced: this.foundationMask[i] === 1,
      depth,
      surface: bed + depth,
      u: ux,
      v: vz,
      speed,
      froude,
      vorticity: this.vort[i],
      sediment: this.sediment[i],
      foam: this.foam[i],
    };
  }

  // ==========================================================================
  //  ИНСТРУМЕНТЫ КАНАЛОВ, ОБЪЁМНЫХ 3D-ПЛОТИН, ФУНДАМЕНТА, ГЭС И ОРУ 110 кВ
  // ==========================================================================

  /** Экскавация канала / котлована: пополняет и отвал грунта, и склад гранитного щебня! */
  excavateCanal(wx, wz, radiusMeters, digStep, targetFloor, maxBudget, creative = false) {
    const { gx: cx, gz: cz } = this.worldToGrid(wx, wz);
    const rCells = Math.max(1, Math.ceil(radiusMeters / this.dx));
    let totalCost = 0;
    let soilCutM3 = 0;
    let rockCutM3 = 0;

    const x0 = clamp(cx - rCells, 1, this.grid - 2);
    const x1 = clamp(cx + rCells, 1, this.grid - 2);
    const z0 = clamp(cz - rCells, 1, this.grid - 2);
    const z1 = clamp(cz + rCells, 1, this.grid - 2);

    for (let gz = z0; gz <= z1; gz++) {
      for (let gx = x0; gx <= x1; gx++) {
        const dist = Math.hypot(gx - cx, gz - cz) * this.dx;
        if (dist > radiusMeters) continue;

        const i = gz * this.grid + gx;
        if (this.concrete[i] > 0.25 || this.targetConcrete[i] > 0.25 || this.gateWall[i] > 0.1) continue;

        const edgeT = clamp(dist / (radiusMeters || 1), 0, 1);
        const profile = edgeT < 0.56 ? 1.0 : Math.cos(((edgeT - 0.56) / 0.44) * Math.PI * 0.5);
        if (profile <= 0.02) continue;

        const currentTop = this.bedrock[i] + this.soil[i];
        let desiredCut = digStep * profile;
        if (Number.isFinite(targetFloor)) {
          const bankSlopeOffset = edgeT > 0.56 ? (edgeT - 0.56) * 4.2 : 0;
          const goalElev = targetFloor + bankSlopeOffset;
          if (currentTop <= goalElev) continue;
          desiredCut = Math.min(digStep * 1.85, currentTop - goalElev);
        }
        if (desiredCut <= 0.01) continue;

        const cutSoil = Math.min(this.soil[i], desiredCut);
        const remCut = Math.max(0, desiredCut - cutSoil);
        const cutRock = Math.min(Math.max(0, this.bedrock[i] - 1.2), remCut * 0.58);

        const cellCost = (cutSoil * 3.4 + cutRock * 14.5) * this.cellArea * 0.21;
        if (!creative && totalCost + cellCost > maxBudget) continue;

        this.soil[i] -= cutSoil;
        this.bedrock[i] -= cutRock;
        this.earthDamMask[i] = 0;

        if (this.h[i] > 0.05 || cutSoil > 0.05) {
          this.sediment[i] = Math.min(1.4, this.sediment[i] + 0.55);
        }

        totalCost += cellCost;
        soilCutM3 += cutSoil * this.cellArea;
        rockCutM3 += cutRock * this.cellArea;
      }
    }

    if (soilCutM3 > 0 || rockCutM3 > 0) {
      this.soilStockpileM3 += soilCutM3;
      this.rockStockpileM3 += rockCutM3 * 1.15; // дроблёный гранитный щебень для бетона!
      this.totalExcavatedM3 += soilCutM3 + rockCutM3;
      this.recomputeZbRange(x0, z0, x1, z1);
      this._activateArea(x0, z0, x1, z1);
    }

    return { cost: totalCost, excavatedM3: soilCutM3 + rockCutM3, rockM3: rockCutM3 };
  }

  /** Укладка железобетонного лотка и 3D-бортов канала (использует щебень из отвала!) */
  lineCanalConcrete(wx, wz, radiusMeters, maxBudget, creative = false) {
    const { gx: cx, gz: cz } = this.worldToGrid(wx, wz);
    const rCells = Math.max(1, Math.ceil(radiusMeters / this.dx));
    let cost = 0;
    let count = 0;

    const x0 = clamp(cx - rCells, 1, this.grid - 2);
    const x1 = clamp(cx + rCells, 1, this.grid - 2);
    const z0 = clamp(cz - rCells, 1, this.grid - 2);
    const z1 = clamp(cz + rCells, 1, this.grid - 2);

    for (let gz = z0; gz <= z1; gz++) {
      for (let gx = x0; gx <= x1; gx++) {
        if (Math.hypot(gx - cx, gz - cz) * this.dx > radiusMeters) continue;
        const i = gz * this.grid + gx;
        if (this.linedMask[i] === 1) continue;

        const useRock = Math.min(this.rockStockpileM3, 3.5);
        const unitCost = useRock > 1.0 ? 58 * (1.0 - CONSTRUCTION.rockAggregateDiscount) : 58;
        if (!creative && cost + unitCost > maxBudget) break;

        this.rockStockpileM3 = Math.max(0, this.rockStockpileM3 - useRock);
        this.linedMask[i] = 1;
        this.earthDamMask[i] = 0;
        cost += unitCost;
        count++;
      }
    }
    if (count > 0) {
      this.markTerrainDirty(x0, z0, x1, z1);
      this.engineeredDirty = true;
    }
    return { cost, count };
  }

  /** Временная насыпная грунтовая перемычка / дамба */
  buildEarthDam(wx, wz, radiusMeters, raiseStep, targetCrest, maxBudget, creative = false) {
    const { gx: cx, gz: cz } = this.worldToGrid(wx, wz);
    const rCells = Math.max(1, Math.ceil(radiusMeters / this.dx));
    let totalCost = 0;
    let addedM3 = 0;

    const x0 = clamp(cx - rCells, 1, this.grid - 2);
    const x1 = clamp(cx + rCells, 1, this.grid - 2);
    const z0 = clamp(cz - rCells, 1, this.grid - 2);
    const z1 = clamp(cz + rCells, 1, this.grid - 2);

    for (let gz = z0; gz <= z1; gz++) {
      for (let gx = x0; gx <= x1; gx++) {
        const dist = Math.hypot(gx - cx, gz - cz) * this.dx;
        if (dist > radiusMeters) continue;
        const i = gz * this.grid + gx;
        if (this.concrete[i] > 0.2 || this.targetConcrete[i] > 0.2) continue;

        const profile = Math.cos((dist / (radiusMeters || 1)) * Math.PI * 0.46);
        let addH = raiseStep * profile;
        if (Number.isFinite(targetCrest)) {
          const cur = this.zb[i];
          const goal = targetCrest - (dist / (radiusMeters || 1)) * 1.4;
          if (cur >= goal) continue;
          addH = Math.min(raiseStep * 1.75, goal - cur);
        }
        if (addH <= 0.02) continue;

        const vol = addH * this.cellArea;
        const fromStock = Math.min(this.soilStockpileM3, vol);
        const bought = vol - fromStock;
        const cellCost = (fromStock * 1.4 + bought * 5.2) * 0.22;
        if (!creative && totalCost + cellCost > maxBudget) continue;

        this.soilStockpileM3 = Math.max(0, this.soilStockpileM3 - fromStock);
        this.soil[i] += addH;
        this.linedMask[i] = 0;
        this.earthDamMask[i] = 1;
        totalCost += cellCost;
        addedM3 += vol;
      }
    }

    if (addedM3 > 0) {
      this.recomputeZbRange(x0, z0, x1, z1);
      this._activateArea(x0, z0, x1, z1);
    }
    return { cost: totalCost, addedM3 };
  }

  /**
   * Возведение объёмной 3D бетонной плотины!
   * В обычном режиме запускает 3-этапное строительство (шпунт -> арматура/опалубка -> бетон с кранами).
   * В креативе или при instant=true возводит монолит мгновенно.
   */
  buildConcreteDam(wx, wz, radiusMeters, targetCrest, maxBudget, creative = false, instant = false) {
    const { gx: cx, gz: cz } = this.worldToGrid(wx, wz);
    const rCells = Math.max(1, Math.ceil(radiusMeters / this.dx));
    let totalCost = 0;
    let addedM3 = 0;
    const isInstant = creative || instant;

    const x0 = clamp(cx - rCells, 1, this.grid - 2);
    const x1 = clamp(cx + rCells, 1, this.grid - 2);
    const z0 = clamp(cz - rCells, 1, this.grid - 2);
    const z1 = clamp(cz + rCells, 1, this.grid - 2);

    for (let gz = z0; gz <= z1; gz++) {
      for (let gx = x0; gx <= x1; gx++) {
        const dist = Math.hypot(gx - cx, gz - cz) * this.dx;
        if (dist > radiusMeters) continue;
        const i = gz * this.grid + gx;
        if (this.gateWall[i] > 0.05) continue;

        const edgeRatio = dist / (radiusMeters || 1);
        const crestHere = edgeRatio < 0.64 ? targetCrest : targetCrest - (edgeRatio - 0.64) * 3.4;
        const plannedTop = Math.max(this.concrete[i], this.targetConcrete[i]);
        const curZ = this.bedrock[i] + this.soil[i] + plannedTop;
        if (curZ >= crestHere) continue;

        const addC = Math.min(7.5, crestHere - curZ);
        const vol = addC * this.cellArea;

        // Используем гранитный щебень из выемки каналов со скидкой 38% + надбавка за укладку в глубокую воду без перемычки
        const fromRock = Math.min(this.rockStockpileM3, vol * 0.55);
        const rockDiscount = vol > 0 ? (fromRock / (vol * 0.55)) * CONSTRUCTION.rockAggregateDiscount : 0;
        const underwaterPenalty = this.h[i] > 2.2 ? 1.28 : 1.0;
        const cellCost = vol * 22.0 * 0.155 * (1.0 - rockDiscount) * underwaterPenalty;

        if (!creative && totalCost + cellCost > maxBudget) continue;
        this.rockStockpileM3 = Math.max(0, this.rockStockpileM3 - fromRock);

        const wasDam = plannedTop > 1.2;
        const newTarget = plannedTop + addC;
        this.targetConcrete[i] = newTarget;
        this.earthDamMask[i] = 0;
        this.linedMask[i] = 1;

        if (isInstant) {
          this.concrete[i] = newTarget;
          this.formworkWall[i] = 0;
          this.buildProgress[i] = 1.0;
        } else {
          // Сразу ставим шпунтовую стенку/опалубку, чтобы отжать реку, а бетон заливают краны!
          this.formworkWall[i] = Math.max(
            this.formworkWall[i],
            this.concrete[i] + addC * CONSTRUCTION.cofferdamInstantRatio,
          );
          this.buildProgress[i] = clamp(this.concrete[i] / Math.max(0.5, newTarget), 0.06, 0.92);
          if (!this.activeBuildSet[i]) {
            this.activeBuildSet[i] = 1;
            this.activeBuildCells.push(i);
          }
        }

        if (!wasDam && newTarget > 1.2) {
          this.damCellCount++;
        }

        totalCost += cellCost;
        addedM3 += vol;
      }
    }

    if (addedM3 > 0) {
      if (!isInstant) {
        this.pendingPourVolumeM3 += addedM3;
        if (this.activeBuildSites.length < 6) {
          const wp = this.gridToWorld(cx, cz);
          const ci = cz * this.grid + cx;
          this.activeBuildSites.push({
            wx: wp.wx,
            wz: wp.wz,
            wy: this.bedrock[ci] + this.soil[ci] + Math.max(this.concrete[ci], this.formworkWall[ci]),
            progress: this.buildProgress[ci],
          });
        }
      }
      this.recomputeZbRange(x0, z0, x1, z1);
      this._activateArea(x0, z0, x1, z1);
      this.engineeredDirty = true;
    }
    return { cost: totalCost, addedM3 };
  }

  /**
   * Скальная цементация основания и монтаж объёмных 3D-контрфорсов плотины!
   * Убирает фильтрацию под подошвой на мягких грунтах и кратно повышает прочность створа.
   */
  reinforceFoundation(wx, wz, radiusMeters, maxBudget, creative = false) {
    const { gx: cx, gz: cz } = this.worldToGrid(wx, wz);
    const rCells = Math.max(1, Math.ceil((radiusMeters * 0.85) / this.dx));
    let cost = 0;
    let count = 0;

    const x0 = clamp(cx - rCells, 1, this.grid - 2);
    const x1 = clamp(cx + rCells, 1, this.grid - 2);
    const z0 = clamp(cz - rCells, 1, this.grid - 2);
    const z1 = clamp(cz + rCells, 1, this.grid - 2);

    const dir = this.detectHydraulicDirection(cx, cz, null);

    for (let gz = z0; gz <= z1; gz++) {
      for (let gx = x0; gx <= x1; gx++) {
        if (Math.hypot(gx - cx, gz - cz) * this.dx > radiusMeters * 0.85) continue;
        const i = gz * this.grid + gx;
        if (this.foundationMask[i] === 1) continue;

        const useRock = Math.min(this.rockStockpileM3, 5.0);
        const unitCost = useRock > 1.5 ? 135 * (1.0 - CONSTRUCTION.rockAggregateDiscount) : 135;
        if (!creative && cost + unitCost > maxBudget) break;

        this.rockStockpileM3 = Math.max(0, this.rockStockpileM3 - useRock);

        // Цементация: преобразуем рыхлый грунт основания в монолитную скальную плиту!
        const consolidate = this.soil[i] * 0.82;
        this.soil[i] -= consolidate;
        this.bedrock[i] += consolidate;
        if (this.concrete[i] < 0.8 && this.targetConcrete[i] < 0.8) {
          // Создаём железобетонную подушку ростверка даже до основной плотины
          this.concrete[i] = 0.85;
          this.targetConcrete[i] = 0.85;
          this.buildProgress[i] = 1.0;
        }
        this.foundationMask[i] = 1;
        this.buttressYaw[i] = dir.yaw;
        this.earthDamMask[i] = 0;
        this.linedMask[i] = 1;
        this.reinforcedCellCount++;
        cost += unitCost;
        count++;
      }
    }

    if (count > 0) {
      this.recomputeZbRange(x0, z0, x1, z1);
      this.engineeredDirty = true;
    }
    return { cost, count };
  }

  /** Строительство узловой 3D-подстанции ОРУ 110 кВ (снижает потери передачи в 5 раз!) */
  placeSubstation(wx, wz, maxBudget, creative = false) {
    const cost = CONSTRUCTION.substationCost;
    if (!creative && maxBudget < cost) {
      return { ok: false, reason: `Недостаточно средств на ОРУ 110 кВ (нужно ${cost.toLocaleString('ru-RU')} ₽)` };
    }
    const s = this.sampleAtWorld(wx, wz);
    if (s.depth > 0.35) {
      return { ok: false, reason: 'Подстанцию ОРУ 110 кВ нужно строить на сухом берегу выше воды!' };
    }
    for (const sub of this.substations) {
      if (Math.hypot(sub.wx - wx, sub.wz - wz) < 28) {
        return { ok: false, reason: 'Рядом уже работает подстанция ОРУ 110 кВ' };
      }
    }

    // Выравниваем бетонную площадку под порталы и трансформаторы ОРУ
    const { gx, gz } = this.worldToGrid(wx, wz);
    const padElev = s.bed + 0.6;
    for (let oz = -1; oz <= 1; oz++) {
      for (let ox = -1; ox <= 1; ox++) {
        const cx = clamp(gx + ox, 1, this.grid - 2);
        const cz = clamp(gz + oz, 1, this.grid - 2);
        const i = cz * this.grid + cx;
        const nat = this.bedrock[i] + this.soil[i];
        this.concrete[i] = Math.max(this.concrete[i], Math.max(0.4, padElev - nat));
        this.targetConcrete[i] = Math.max(this.targetConcrete[i], this.concrete[i]);
        this.linedMask[i] = 1;
      }
    }
    this.recomputeZbRange(gx - 2, gz - 2, gx + 2, gz + 2);

    const sub = {
      id: this.nextStructId++,
      kind: 'substation',
      gx,
      gz,
      wx,
      wz,
      wy: padElev,
    };
    this.substations.push(sub);
    this.engineeredDirty = true;
    return { ok: true, cost, structure: sub };
  }

  detectHydraulicDirection(gx, gz, forcedYaw = null) {
    if (typeof forcedYaw === 'number') {
      return { dx: Math.cos(forcedYaw), dz: Math.sin(forcedYaw), yaw: forcedYaw };
    }
    let gradX = 0;
    let gradZ = 0;
    const span = 4;
    for (let oz = -span; oz <= span; oz++) {
      for (let ox = -span; ox <= span; ox++) {
        if (ox === 0 && oz === 0) continue;
        const nx = clamp(gx + ox, 0, this.grid - 1);
        const nz = clamp(gz + oz, 0, this.grid - 1);
        const ni = nz * this.grid + nx;
        const head = (this.bedrock[ni] + this.soil[ni]) + this.h[ni] * 1.85;
        const w = 1.0 / (ox * ox + oz * oz);
        gradX -= ox * head * w;
        gradZ -= oz * head * w;
      }
    }
    const len = Math.hypot(gradX, gradZ);
    if (len < 1e-3) {
      return { dx: 0, dz: 1, yaw: Math.PI * 0.5 };
    }
    const dx = gradX / len;
    const dz = gradZ / len;
    return { dx, dz, yaw: Math.atan2(dz, dx) };
  }

  placeSpillway(wx, wz, forcedYaw, maxBudget, creative = false) {
    const cost = 4400;
    if (!creative && maxBudget < cost) return { ok: false, reason: 'Недостаточно средств (нужно 4 400 ₽)' };
    const { gx, gz } = this.worldToGrid(wx, wz);
    if (gx < 4 || gx > this.grid - 5 || gz < 4 || gz > this.grid - 5) {
      return { ok: false, reason: 'Слишком близко к краю карты' };
    }

    for (const t of this.turbines) {
      if (Math.hypot(t.gx - gx, t.gz - gz) < 3.5) {
        return { ok: false, reason: 'Место занято гидроагрегатом' };
      }
    }
    for (const s of this.spillways) {
      if (Math.hypot(s.gx - gx, s.gz - gz) < 3.0) {
        return { ok: false, reason: 'Рядом уже установлен водосброс' };
      }
    }

    const dir = this.detectHydraulicDirection(gx, gz, forcedYaw);
    let maxNeighborCrest = 0;
    let minNaturalBed = Infinity;
    const cells = [];

    for (let oz = -1; oz <= 1; oz++) {
      for (let ox = -1; ox <= 1; ox++) {
        const cx = gx + ox;
        const cz = gz + oz;
        const i = cz * this.grid + cx;
        cells.push(i);
        minNaturalBed = Math.min(minNaturalBed, this.bedrock[i] + this.soil[i]);
      }
    }
    for (let oz = -3; oz <= 3; oz++) {
      for (let ox = -3; ox <= 3; ox++) {
        const i = clamp(gz + oz, 0, this.grid - 1) * this.grid + clamp(gx + ox, 0, this.grid - 1);
        const top = this.bedrock[i] + this.soil[i] + Math.max(this.concrete[i], this.targetConcrete[i]);
        maxNeighborCrest = Math.max(maxNeighborCrest, top);
      }
    }

    const sillElev = Math.max(minNaturalBed + 1.5, maxNeighborCrest - 7.8);
    const gateMaxHeight = Math.max(6.8, maxNeighborCrest - sillElev + 2.2);

    for (const i of cells) {
      const nat = this.bedrock[i] + this.soil[i];
      const cVal = Math.max(0.5, sillElev - nat);
      this.concrete[i] = cVal;
      this.targetConcrete[i] = cVal;
      this.formworkWall[i] = 0;
      this.buildProgress[i] = 1.0;
      this.linedMask[i] = 1;
      this.earthDamMask[i] = 0;
    }

    const worldPos = this.gridToWorld(gx, gz);
    const sw = {
      id: this.nextStructId++,
      kind: 'spillway',
      gx,
      gz,
      wx: worldPos.wx,
      wz: worldPos.wz,
      dirX: dir.dx,
      dirZ: dir.dz,
      yaw: dir.yaw,
      sillElev,
      wallHeight: gateMaxHeight,
      openRatio: 0.35,
      autoRegulate: true,
      targetHeadElev: sillElev + gateMaxHeight * 0.82,
      cells,
      currentFlowQ: 0,
      jetSpeed: 0,
    };

    this.spillways.push(sw);
    this._syncSpillwayGateCells(sw);
    this.recomputeZbRange(gx - 2, gz - 2, gx + 2, gz + 2);
    this._activateArea(gx - 3, gz - 3, gx + 3, gz + 3);
    this.engineeredDirty = true;
    return { ok: true, cost, structure: sw };
  }

  _syncSpillwayGateCells(sw) {
    const barrier = (1.0 - clamp(sw.openRatio, 0, 1)) * sw.wallHeight;
    for (let k = 0; k < sw.cells.length; k++) {
      const i = sw.cells[k];
      this.gateWall[i] = barrier;
      this.zb[i] = this.bedrock[i] + this.soil[i] + Math.max(this.concrete[i], this.formworkWall[i]) + barrier;
    }
    this.markTerrainDirty(sw.gx - 2, sw.gz - 2, sw.gx + 2, sw.gz + 2);
  }

  placeTurbine(typeId, wx, wz, forcedYaw, maxBudget, creative = false) {
    const spec = TURBINE_SPECS[typeId];
    if (!spec) return { ok: false, reason: 'Неизвестный тип турбины' };
    if (!creative && maxBudget < spec.cost) {
      return { ok: false, reason: `Недостаточно средств (нужно ${spec.cost.toLocaleString('ru-RU')} ₽)` };
    }

    const { gx, gz } = this.worldToGrid(wx, wz);
    if (gx < 6 || gx > this.grid - 7 || gz < 6 || gz > this.grid - 7) {
      return { ok: false, reason: 'Слишком близко к границе долины' };
    }

    for (const t of this.turbines) {
      if (Math.hypot(t.gx - gx, t.gz - gz) < 3.6) {
        return { ok: false, reason: 'Здесь уже стоит гидроагрегат' };
      }
    }
    for (const s of this.spillways) {
      if (Math.hypot(s.gx - gx, s.gz - gz) < 3.2) {
        return { ok: false, reason: 'Место занято водосбросом' };
      }
    }

    const dir = this.detectHydraulicDirection(gx, gz, forcedYaw);
    const reach = Math.max(4, Math.ceil(16.0 / this.dx));
    const intakeGx = clamp(Math.round(gx - dir.dx * reach), 2, this.grid - 3);
    const intakeGz = clamp(Math.round(gz - dir.dz * reach), 2, this.grid - 3);
    const outfallGx = clamp(Math.round(gx + dir.dx * reach), 2, this.grid - 3);
    const outfallGz = clamp(Math.round(gz + dir.dz * reach), 2, this.grid - 3);

    let neighborDamTop = 0;
    for (let oz = -3; oz <= 3; oz++) {
      for (let ox = -3; ox <= 3; ox++) {
        const ni = clamp(gz + oz, 0, this.grid - 1) * this.grid + clamp(gx + ox, 0, this.grid - 1);
        const top = this.bedrock[ni] + this.soil[ni] + Math.max(this.concrete[ni], this.targetConcrete[ni]);
        neighborDamTop = Math.max(neighborDamTop, top);
      }
    }
    const centerIdx = gz * this.grid + gx;
    const baseNat = this.bedrock[centerIdx] + this.soil[centerIdx];
    const blockCrest = Math.max(baseNat + 11.5, neighborDamTop);

    const bodyCells = [];
    for (let oz = -1; oz <= 1; oz++) {
      for (let ox = -1; ox <= 1; ox++) {
        const cx = gx + ox;
        const cz = gz + oz;
        const i = cz * this.grid + cx;
        const nat = this.bedrock[i] + this.soil[i];
        const prevConcrete = this.concrete[i];
        const cH = Math.max(prevConcrete, blockCrest - nat);
        this.concrete[i] = cH;
        this.targetConcrete[i] = Math.max(this.targetConcrete[i], cH);
        this.formworkWall[i] = 0;
        this.buildProgress[i] = 1.0;
        this.linedMask[i] = 1;
        this.earthDamMask[i] = 0;
        bodyCells.push({ i, prevConcrete });
      }
    }

    for (let oz = -1; oz <= 1; oz++) {
      for (let ox = -1; ox <= 1; ox++) {
        const ii = (intakeGz + oz) * this.grid + (intakeGx + ox);
        const oi = (outfallGz + oz) * this.grid + (outfallGx + ox);
        if (this.concrete[ii] > 0 || this.targetConcrete[ii] > 0) {
          bodyCells.push({ i: ii, prevConcrete: this.concrete[ii] });
          this.concrete[ii] = 0;
          this.targetConcrete[ii] = 0;
          this.formworkWall[ii] = 0;
        }
        if (this.concrete[oi] > 0 || this.targetConcrete[oi] > 0) {
          bodyCells.push({ i: oi, prevConcrete: this.concrete[oi] });
          this.concrete[oi] = 0;
          this.targetConcrete[oi] = 0;
          this.formworkWall[oi] = 0;
        }
        this.linedMask[ii] = 1;
        this.linedMask[oi] = 1;
      }
    }

    const pos = this.gridToWorld(gx, gz);
    const intakeWorld = this.gridToWorld(intakeGx, intakeGz);
    const outfallWorld = this.gridToWorld(outfallGx, outfallGz);
    const intakeBed = this.bedrock[intakeGz * this.grid + intakeGx] + this.soil[intakeGz * this.grid + intakeGx];
    const outfallBed = this.bedrock[outfallGz * this.grid + outfallGx] + this.soil[outfallGz * this.grid + outfallGx];

    const turb = {
      id: this.nextStructId++,
      kind: 'turbine',
      type: typeId,
      spec,
      gx,
      gz,
      wx: pos.wx,
      wz: pos.wz,
      crestY: blockCrest,
      baseY: baseNat,
      dirX: dir.dx,
      dirZ: dir.dz,
      yaw: dir.yaw,
      intakeGx,
      intakeGz,
      intakeWx: intakeWorld.wx,
      intakeWz: intakeWorld.wz,
      intakeBedY: intakeBed,
      outfallGx,
      outfallGz,
      outfallWx: outfallWorld.wx,
      outfallWz: outfallWorld.wz,
      outfallBedY: outfallBed,
      bodyCells,
      throttle: 1.0,
      autoDispatch: false,
      grossHead: 0,
      netHead: 0,
      flowQ: 0,
      efficiency: 0,
      powerMW: 0,
      cavitation: 0,
      trashLoad: 0,      // засорение сороудерживающей решётки плавником/илом (0..0.35)
      condition: 1.0,
      rotorPhase: 0,
    };

    this.turbines.push(turb);
    this.recomputeZbRange(
      Math.min(gx, intakeGx, outfallGx) - 2,
      Math.min(gz, intakeGz, outfallGz) - 2,
      Math.max(gx, intakeGx, outfallGx) + 2,
      Math.max(gz, intakeGz, outfallGz) + 2,
    );
    this._activateArea(
      Math.min(gx, intakeGx, outfallGx) - 2,
      Math.min(gz, intakeGz, outfallGz) - 2,
      Math.max(gx, intakeGx, outfallGx) + 2,
      Math.max(gz, intakeGz, outfallGz) + 2,
    );
    this.engineeredDirty = true;

    return { ok: true, cost: spec.cost, structure: turb };
  }

  demolishAt(wx, wz) {
    const { gx, gz } = this.worldToGrid(wx, wz);

    const tIdx = this.turbines.findIndex((t) => Math.hypot(t.gx - gx, t.gz - gz) <= 2.5);
    if (tIdx >= 0) {
      const t = this.turbines[tIdx];
      for (const c of t.bodyCells) {
        this.concrete[c.i] = c.prevConcrete;
        this.targetConcrete[c.i] = c.prevConcrete;
        this.formworkWall[c.i] = 0;
      }
      this.turbines.splice(tIdx, 1);
      this.recomputeZbRange(t.gx - 2, t.gz - 2, t.gx + 2, t.gz + 2);
      this.engineeredDirty = true;
      return { removed: 'turbine', refund: Math.round(t.spec.cost * 0.45) };
    }

    const sIdx = this.spillways.findIndex((s) => Math.hypot(s.gx - gx, s.gz - gz) <= 2.5);
    if (sIdx >= 0) {
      const s = this.spillways[sIdx];
      for (const i of s.cells) {
        this.gateWall[i] = 0;
        this.concrete[i] = 0;
        this.targetConcrete[i] = 0;
        this.formworkWall[i] = 0;
      }
      this.spillways.splice(sIdx, 1);
      this.recomputeZbRange(s.gx - 2, s.gz - 2, s.gx + 2, s.gz + 2);
      this.engineeredDirty = true;
      return { removed: 'spillway', refund: 1900 };
    }

    const subIdx = this.substations.findIndex((sub) => Math.hypot(sub.wx - wx, sub.wz - wz) <= 14);
    if (subIdx >= 0) {
      this.substations.splice(subIdx, 1);
      this.engineeredDirty = true;
      return { removed: 'substation', refund: Math.round(CONSTRUCTION.substationCost * 0.45) };
    }

    let removedConcrete = 0;
    for (let oz = -1; oz <= 1; oz++) {
      for (let ox = -1; ox <= 1; ox++) {
        const cx = clamp(gx + ox, 1, this.grid - 2);
        const cz = clamp(gz + oz, 1, this.grid - 2);
        const i = cz * this.grid + cx;
        if (this.concrete[i] > 0 || this.targetConcrete[i] > 0 || this.foundationMask[i]) {
          removedConcrete += Math.max(this.concrete[i], this.targetConcrete[i]) + 1;
          this.concrete[i] = Math.max(0, this.concrete[i] - 5.0);
          this.targetConcrete[i] = this.concrete[i];
          this.formworkWall[i] = 0;
          this.buildProgress[i] = 1.0;
          if (this.concrete[i] <= 0.1 && this.foundationMask[i]) {
            this.foundationMask[i] = 0;
            this.reinforcedCellCount = Math.max(0, this.reinforcedCellCount - 1);
          }
        }
        this.linedMask[i] = 0;
      }
    }
    if (removedConcrete > 0) {
      this.recomputeZbRange(gx - 2, gz - 2, gx + 2, gz + 2);
      this.engineeredDirty = true;
      return { removed: 'concrete', refund: 0 };
    }
    return { removed: null, refund: 0 };
  }

  findStructureNear(wx, wz, maxDist = 15) {
    let best = null;
    let bestD = maxDist;
    for (const t of this.turbines) {
      const d = Math.hypot(t.wx - wx, t.wz - wz);
      if (d < bestD) { bestD = d; best = t; }
    }
    for (const s of this.spillways) {
      const d = Math.hypot(s.wx - wx, s.wz - wz);
      if (d < bestD) { bestD = d; best = s; }
    }
    return best;
  }

  // ==========================================================================
  //  ШАГ СИМУЛЯЦИИ + ПОЭТАПНАЯ ЗАЛИВКА БЕТОНА + КОНТРОЛЬ ПРОЧНОСТИ И ФИЛЬТРАЦИИ
  // ==========================================================================

  step(frameDt, maxSubsteps = 8) {
    const t0 = typeof performance !== 'undefined' ? performance.now() : Date.now();
    this.jetEmitters.length = 0;

    const totalDt = clamp(frameDt, 0.001, 0.16);

    // 0. Продвигаем 3-этапное объёмное бетонирование плотин строительными бригадами и кранами
    if (this.activeBuildCells.length > 0) {
      this._stepConstructionQueue(totalDt);
    }

    this._rebuildActiveTiles();

    let maxWaveSpeed = 6.5;
    const g = this.grid;
    for (let ti = 0; ti < this.activeTileCount; ti++) {
      const tileIdx = this.activeTiles[ti];
      const tx0 = (tileIdx % this.tilesN) * TILE;
      const tz0 = Math.floor(tileIdx / this.tilesN) * TILE;
      const tx1 = Math.min(g, tx0 + TILE);
      const tz1 = Math.min(g, tz0 + TILE);
      for (let gz = tz0; gz < tz1; gz += 2) {
        const row = gz * g;
        for (let gx = tx0; gx < tx1; gx += 2) {
          const i = row + gx;
          const depth = this.h[i];
          if (depth > 0.02) {
            const ws = Math.abs(this.u[i]) + Math.abs(this.v[i]) + Math.sqrt(G * depth);
            if (ws > maxWaveSpeed) maxWaveSpeed = ws;
          }
        }
      }
    }

    const cflDt = (0.43 * this.dx) / maxWaveSpeed;
    const substeps = clamp(Math.ceil(totalDt / cflDt), 1, maxSubsteps);
    const subDt = Math.min(totalDt / substeps, cflDt);

    for (let s = 0; s < substeps; s++) {
      this._substep(subDt);
    }

    this._stepSecondaryTransportAndErosion(subDt * substeps);

    this.lastSubsteps = substeps;
    const t1 = typeof performance !== 'undefined' ? performance.now() : Date.now();
    this.lastStepMs = t1 - t0;
  }

  /** Поэтапное бетонирование активных секций плотины + расчёт точек для 3D башенных кранов */
  _stepConstructionQueue(dt) {
    const g = this.grid;
    const n = this.activeBuildCells.length;
    if (n === 0) {
      this.pendingPourVolumeM3 = 0;
      this.activeBuildSites.length = 0;
      return;
    }

    // Распределяем производительность бетонного завода между активными секциями (с гарантированным минимумом)
    const dhPerCell = Math.max(0.85 * dt, (CONSTRUCTION.pourRateM3PerSec * dt) / (Math.min(n, 28) * this.cellArea));
    let minX = g, minZ = g, maxX = -1, maxZ = -1;
    let remainingVol = 0;
    const nextList = [];
    const sites = [];

    for (let k = 0; k < n; k++) {
      const i = this.activeBuildCells[k];
      const target = this.targetConcrete[i];
      let cur = this.concrete[i];

      if (target <= cur + 0.01) {
        this.concrete[i] = target;
        this.formworkWall[i] = 0;
        this.buildProgress[i] = 1.0;
        this.activeBuildSet[i] = 0;
        continue;
      }

      const gx = i % g;
      const gz = (i / g) | 0;

      // Если бурный паводок переливается через ещё сырую опалубку (<45%), укладка идёт медленнее
      const overtopSpeed = this.h[i] > 0.6 ? Math.hypot(this.u[i], this.v[i]) : 0;
      const floodSlowdown = overtopSpeed > 3.5 ? 0.42 : 1.0;

      cur = Math.min(target, cur + dhPerCell * floodSlowdown);
      this.concrete[i] = cur;
      const prog = clamp(cur / Math.max(0.4, target), 0.05, 1.0);
      this.buildProgress[i] = prog;

      if (cur >= target - 0.015) {
        this.concrete[i] = target;
        this.formworkWall[i] = 0;
        this.buildProgress[i] = 1.0;
        this.activeBuildSet[i] = 0;
      } else {
        this.formworkWall[i] = Math.max(cur, this.formworkWall[i]);
        nextList.push(i);
        remainingVol += (target - cur) * this.cellArea;
        if (sites.length < 6 && (k % Math.max(1, Math.floor(n / 4)) === 0)) {
          const wp = this.gridToWorld(gx, gz);
          sites.push({
            wx: wp.wx,
            wz: wp.wz,
            wy: this.bedrock[i] + this.soil[i] + Math.max(cur, this.formworkWall[i]),
            progress: prog,
          });
        }
      }

      const effWall = Math.max(this.concrete[i], this.formworkWall[i]);
      this.zb[i] = this.bedrock[i] + this.soil[i] + effWall + this.gateWall[i];
      if (gx < minX) minX = gx;
      if (gz < minZ) minZ = gz;
      if (gx > maxX) maxX = gx;
      if (gz > maxZ) maxZ = gz;
    }

    this.activeBuildCells = nextList;
    this.activeBuildSites = sites;
    this.pendingPourVolumeM3 = remainingVol;
    this.engineeredDirty = true;

    if (maxX >= minX) {
      this.markTerrainDirty(minX, minZ, maxX, maxZ);
    }
  }

  _activateArea(x0, z0, x1, z1) {
    const tx0 = clamp(Math.floor(x0 / TILE) - 1, 0, this.tilesN - 1);
    const tz0 = clamp(Math.floor(z0 / TILE) - 1, 0, this.tilesN - 1);
    const tx1 = clamp(Math.floor(x1 / TILE) + 1, 0, this.tilesN - 1);
    const tz1 = clamp(Math.floor(z1 / TILE) + 1, 0, this.tilesN - 1);
    for (let tz = tz0; tz <= tz1; tz++) {
      for (let tx = tx0; tx <= tx1; tx++) {
        this.tileWet[tz * this.tilesN + tx] = 1;
      }
    }
  }

  _rebuildActiveTiles() {
    const g = this.grid;
    const tn = this.tilesN;
    this.tileWet.fill(0);

    let volSum = 0;
    for (let tz = 0; tz < tn; tz++) {
      const z0 = tz * TILE;
      const z1 = Math.min(g, z0 + TILE);
      for (let tx = 0; tx < tn; tx++) {
        const x0 = tx * TILE;
        const x1 = Math.min(g, x0 + TILE);
        let hasWater = false;
        for (let gz = z0; gz < z1; gz++) {
          const row = gz * g;
          for (let gx = x0; gx < x1; gx++) {
            const d = this.h[row + gx];
            if (d > 0.0015) {
              hasWater = true;
              volSum += d;
            }
          }
        }
        if (hasWater || this.rainRate > 0) {
          for (let oz = -1; oz <= 1; oz++) {
            const ntz = tz + oz;
            if (ntz < 0 || ntz >= tn) continue;
            for (let ox = -1; ox <= 1; ox++) {
              const ntx = tx + ox;
              if (ntx < 0 || ntx >= tn) continue;
              this.tileWet[ntz * tn + ntx] = 1;
            }
          }
        }
      }
    }

    // Истоки 3 рек и площадки гидроагрегатов всегда активны
    this._activateArea(0, 0, g - 1, 6);
    this._activateArea(0, Math.floor(g * 0.55), 6, Math.floor(g * 0.72));
    for (let k = 0; k < this.turbines.length; k++) {
      const t = this.turbines[k];
      this._activateArea(
        Math.min(t.intakeGx, t.outfallGx) - 2,
        Math.min(t.intakeGz, t.outfallGz) - 2,
        Math.max(t.intakeGx, t.outfallGx) + 2,
        Math.max(t.intakeGz, t.outfallGz) + 2,
      );
    }

    let count = 0;
    for (let i = 0; i < this.totalTiles; i++) {
      if (this.tileWet[i]) {
        this.activeTiles[count++] = i;
      }
    }
    this.activeTileCount = count;
    this.totalWaterVolumeM3 = volSum * this.cellArea;
  }

  _substep(dt) {
    this.simTime += dt;
    const g = this.grid;
    const invDx = 1.0 / this.dx;
    const { h, hu, hv, zb, u, v, dH, dHU, dHV } = this;

    this._applyRiverBoundariesAndRain(dt);
    this._stepTurbinesAndSpillways(dt);

    for (let ti = 0; ti < this.activeTileCount; ti++) {
      const tileIdx = this.activeTiles[ti];
      const x0 = (tileIdx % this.tilesN) * TILE;
      const z0 = Math.floor(tileIdx / this.tilesN) * TILE;
      const x1 = Math.min(g, x0 + TILE);
      const z1 = Math.min(g, z0 + TILE);
      for (let gz = z0; gz < z1; gz++) {
        const row = gz * g;
        for (let gx = x0; gx < x1; gx++) {
          const i = row + gx;
          dH[i] = 0;
          dHU[i] = 0;
          dHV[i] = 0;
        }
      }
    }

    for (let ti = 0; ti < this.activeTileCount; ti++) {
      const tileIdx = this.activeTiles[ti];
      const x0 = Math.max(0, (tileIdx % this.tilesN) * TILE);
      const z0 = Math.max(0, Math.floor(tileIdx / this.tilesN) * TILE);
      const x1 = Math.min(g - 1, x0 + TILE);
      const z1 = Math.min(g - 1, z0 + TILE);

      for (let gz = z0; gz < z1; gz++) {
        const row = gz * g;
        for (let gx = x0; gx < x1; gx++) {
          const i = row + gx;

          // Грань X
          {
            const r = i + 1;
            const hL = h[i];
            const hR = h[r];
            if (hL > 1e-5 || hR > 1e-5) {
              const zbL = zb[i];
              const zbR = zb[r];
              const zbStar = zbL > zbR ? zbL : zbR;
              const hLs = Math.max(0, zbL + hL - zbStar);
              const hRs = Math.max(0, zbR + hR - zbStar);

              if (hLs > 1e-6 || hRs > 1e-6) {
                const uL = u[i];
                const vL = v[i];
                const uR = u[r];
                const vR = v[r];
                const qxL = hLs * uL;
                const qzL = hLs * vL;
                const qxR = hRs * uR;
                const qzR = hRs * vR;

                const aL = Math.abs(uL) + Math.sqrt(G * hLs);
                const aR = Math.abs(uR) + Math.sqrt(G * hRs);
                const a = aL > aR ? aL : aR;

                const pL = 0.5 * G * hLs * hLs;
                const pR = 0.5 * G * hRs * hRs;

                const fh = 0.5 * (qxL + qxR - a * (hRs - hLs));
                const fqx = 0.5 * (qxL * uL + pL + qxR * uR + pR - a * (qxR - qxL));
                const fqz = 0.5 * (qxL * vL + qxR * vR - a * (qzR - qzL));

                dH[i] -= fh;
                dH[r] += fh;
                dHU[i] -= (fqx - pL);
                dHU[r] += (fqx - pR);
                dHV[i] -= fqz;
                dHV[r] += fqz;
              }
            }
          }

          // Грань Z
          {
            const b = i + g;
            const hL = h[i];
            const hR = h[b];
            if (hL > 1e-5 || hR > 1e-5) {
              const zbL = zb[i];
              const zbR = zb[b];
              const zbStar = zbL > zbR ? zbL : zbR;
              const hLs = Math.max(0, zbL + hL - zbStar);
              const hRs = Math.max(0, zbR + hR - zbStar);

              if (hLs > 1e-6 || hRs > 1e-6) {
                const uL = u[i];
                const vL = v[i];
                const uR = u[b];
                const vR = v[b];
                const qxL = hLs * uL;
                const qzL = hLs * vL;
                const qxR = hRs * uR;
                const qzR = hRs * vR;

                const aL = Math.abs(vL) + Math.sqrt(G * hLs);
                const aR = Math.abs(vR) + Math.sqrt(G * hRs);
                const a = aL > aR ? aL : aR;

                const pL = 0.5 * G * hLs * hLs;
                const pR = 0.5 * G * hRs * hRs;

                const fh = 0.5 * (qzL + qzR - a * (hRs - hLs));
                const fqx = 0.5 * (qzL * uL + qzR * uR - a * (qxR - qxL));
                const fqz = 0.5 * (qzL * vL + pL + qzR * vR + pR - a * (qzR - qzL));

                dH[i] -= fh;
                dH[b] += fh;
                dHU[i] -= fqx;
                dHU[b] += fqx;
                dHV[i] -= (fqz - pL);
                dHV[b] += (fqz - pR);
              }
            }
          }
        }
      }
    }

    const scale = dt * invDx;
    for (let ti = 0; ti < this.activeTileCount; ti++) {
      const tileIdx = this.activeTiles[ti];
      const x0 = Math.max(1, (tileIdx % this.tilesN) * TILE);
      const z0 = Math.max(1, Math.floor(tileIdx / this.tilesN) * TILE);
      const x1 = Math.min(g - 1, (tileIdx % this.tilesN) * TILE + TILE);
      const z1 = Math.min(g - 1, Math.floor(tileIdx / this.tilesN) * TILE + TILE);

      for (let gz = z0; gz < z1; gz++) {
        const row = gz * g;
        for (let gx = x0; gx < x1; gx++) {
          const i = row + gx;
          let nh = h[i] + scale * dH[i];
          if (nh <= 1e-5) {
            h[i] = 0;
            hu[i] = 0;
            hv[i] = 0;
            u[i] = 0;
            v[i] = 0;
            continue;
          }

          let nqx = hu[i] + scale * dHU[i];
          let nqz = hv[i] + scale * dHV[i];

          const h2 = nh * nh;
          const h4 = h2 * h2;
          const invDenom = Math.SQRT2 * nh / Math.sqrt(h4 + (h4 > EPS_H4 ? h4 : EPS_H4));
          let ux = nqx * invDenom;
          let vz = nqz * invDenom;

          const manning = this.linedMask[i] ? 0.012 : (this.soil[i] < 0.6 ? 0.026 : 0.036);
          const speed = Math.hypot(ux, vz);
          if (speed > 1e-4) {
            const hEff = nh > 0.045 ? nh : 0.045;
            const drag = dt * G * manning * manning * speed / Math.pow(hEff, 1.3333333);
            const damp = 1.0 / (1.0 + drag);
            ux *= damp;
            vz *= damp;

            if (speed * damp > MAX_SPEED) {
              const cap = MAX_SPEED / (speed * damp);
              ux *= cap;
              vz *= cap;
            }
          }

          h[i] = nh;
          u[i] = ux;
          v[i] = vz;
          hu[i] = nh * ux;
          hv[i] = nh * vz;
        }
      }
    }

    this._applyVorticityConfinement(dt);
  }

  _applyRiverBoundariesAndRain(dt) {
    const g = this.grid;
    const preset = VALLEY_PRESETS[this.presetId] || VALLEY_PRESETS.bystritsa;
    const rivers = VALLEY_RIVERS[this.presetId] || VALLEY_RIVERS.bystritsa;

    // 1. Главный горный исток «Быстрица»
    const pMain = rivers.main[0];
    const mCenter = this.worldToGrid(pMain.x, pMain.z + 6);
    this._injectSpring(mCenter.gx, mCenter.gz, 2, preset.mainInflowQ * this.inflowMult, 0.42, 0.91, dt);

    // 2. Восточный ледниковый приток «Серебрянка»
    const pEast = rivers.eastCreek[0];
    const eCenter = this.worldToGrid(pEast.x, pEast.z + 6);
    this._injectSpring(eCenter.gx, eCenter.gz, 2, preset.creekInflowQ * this.inflowMult, -0.68, 0.73, dt);

    // 3. Западный горный ручей «Гремучий»
    const pWest = rivers.westCreek[0];
    const wCenter = this.worldToGrid(pWest.x + 6, pWest.z);
    this._injectSpring(wCenter.gx, wCenter.gz, 2, preset.westCreekQ * this.inflowMult, 0.92, 0.38, dt);

    // Атмосферные осадки
    if (this.rainRate > 0) {
      const addRain = this.rainRate * dt;
      const phase = ((this.simTime * 60) | 0) & 3;
      const ox = phase & 1;
      const oz = (phase >> 1) & 1;
      for (let gz = 2 + oz; gz < g - 2; gz += 2) {
        const row = gz * g;
        for (let gx = 2 + ox; gx < g - 2; gx += 2) {
          this.h[row + gx] += addRain * 4.0;
        }
      }
    }

    // Южное устье: неотражающий речной сток
    const rowOut = (g - 2) * g;
    const rowEdge = (g - 1) * g;
    for (let gx = 1; gx < g - 1; gx++) {
      const i = rowOut + gx;
      const bed = this.zb[i];
      if (this.h[i] > 0.01) {
        const normalDepth = Math.max(0, 6.15 - bed);
        if (this.h[i] > normalDepth) {
          const excess = this.h[i] - normalDepth;
          const outSpeed = Math.max(this.v[i], Math.sqrt(G * this.h[i]) * 0.72);
          const drain = Math.min(excess, (outSpeed * this.h[i] * dt) / this.dx);
          this.h[i] = Math.max(normalDepth, this.h[i] - drain);
          this.v[i] = Math.max(this.v[i], outSpeed * 0.65);
          this.hv[i] = this.h[i] * this.v[i];
        }
      }
      this.h[rowEdge + gx] = this.h[i] * 0.85;
      this.hu[rowEdge + gx] = 0;
      this.hv[rowEdge + gx] = 0;
    }

    for (let k = 0; k < g; k++) {
      this.hu[k * g + 1] = Math.max(0, this.hu[k * g + 1]);
      this.hu[k * g + (g - 2)] = Math.min(0, this.hu[k * g + (g - 2)]);
      this.hv[1 * g + k] = Math.max(0, this.hv[1 * g + k]);
    }
  }

  _injectSpring(cx, cz, radiusCells, dischargeM3s, dirX, dirZ, dt) {
    let count = 0;
    for (let oz = -radiusCells; oz <= radiusCells; oz++) {
      for (let ox = -radiusCells; ox <= radiusCells; ox++) {
        if (ox * ox + oz * oz <= radiusCells * radiusCells + 1) count++;
      }
    }
    if (!count) return;
    const dhPerCell = (dischargeM3s * dt) / (count * this.cellArea);
    const initSpeed = 2.5;
    for (let oz = -radiusCells; oz <= radiusCells; oz++) {
      for (let ox = -radiusCells; ox <= radiusCells; ox++) {
        if (ox * ox + oz * oz > radiusCells * radiusCells + 1) continue;
        const gx = clamp(cx + ox, 1, this.grid - 2);
        const gz = clamp(cz + oz, 1, this.grid - 2);
        const i = gz * this.grid + gx;
        this.h[i] += dhPerCell;
        this.hu[i] += dhPerCell * dirX * initSpeed;
        this.hv[i] += dhPerCell * dirZ * initSpeed;
        const nh = this.h[i];
        this.u[i] = this.hu[i] / nh;
        this.v[i] = this.hv[i] / nh;
      }
    }
  }

  _stepTurbinesAndSpillways(dt) {
    const g = this.grid;

    // А. Регулируемые водосбросы
    for (let sIdx = 0; sIdx < this.spillways.length; sIdx++) {
      const sw = this.spillways[sIdx];
      const upGx = clamp(Math.round(sw.gx - sw.dirX * 3), 1, g - 2);
      const upGz = clamp(Math.round(sw.gz - sw.dirZ * 3), 1, g - 2);
      const upI = upGz * g + upGx;
      const upSurf = this.zb[upI] + this.h[upI];

      if (sw.autoRegulate) {
        const diff = upSurf - sw.targetHeadElev;
        const desiredOpen = clamp(0.08 + diff * 0.28, 0.0, 1.0);
        if (Math.abs(desiredOpen - sw.openRatio) > 0.015) {
          sw.openRatio = lerp(sw.openRatio, desiredOpen, clamp(dt * 2.5, 0, 1));
          this._syncSpillwayGateCells(sw);
        }
      }

      let qSum = 0;
      let maxSpd = 0;
      for (let k = 0; k < sw.cells.length; k++) {
        const ci = sw.cells[k];
        const depth = this.h[ci];
        if (depth > 0.03) {
          const along = Math.max(0, this.u[ci] * sw.dirX + this.v[ci] * sw.dirZ);
          qSum += depth * along * (this.dx / 3.0);
          if (along > maxSpd) maxSpd = along;
          this.foam[ci] = Math.min(1.0, this.foam[ci] + 0.35);
        }
      }
      sw.currentFlowQ = qSum;
      sw.jetSpeed = maxSpd;

      if (qSum > 1.2 && sw.openRatio > 0.05) {
        const crestI = sw.gz * g + sw.gx;
        this.jetEmitters.push({
          wx: sw.wx + sw.dirX * 3.5,
          wy: this.zb[crestI] + Math.max(0.3, this.h[crestI] * 0.6),
          wz: sw.wz + sw.dirZ * 3.5,
          vx: sw.dirX * Math.max(4.8, maxSpd * 1.25),
          vy: 1.4 + maxSpd * 0.14,
          vz: sw.dirZ * Math.max(4.8, maxSpd * 1.25),
          intensity: clamp(qSum / 35.0, 0.15, 1.8),
          kind: 'spillway',
        });
      }
    }

    // Б. Напорные гидроагрегаты ГЭС с водоводами и сороудерживающими решётками
    for (let tIdx = 0; tIdx < this.turbines.length; tIdx++) {
      const t = this.turbines[tIdx];
      const spec = t.spec;

      let upSurfSum = 0;
      let upWetCount = 0;
      let availVol = 0;
      let intakeSed = 0;
      for (let oz = -1; oz <= 1; oz++) {
        for (let ox = -1; ox <= 1; ox++) {
          const i = (t.intakeGz + oz) * g + (t.intakeGx + ox);
          const d = this.h[i];
          if (d > 0.12) {
            upSurfSum += this.zb[i] + d;
            upWetCount++;
            availVol += (d - 0.08) * this.cellArea;
            intakeSed += this.sediment[i];
          }
        }
      }

      let downSurfSum = 0;
      let downCount = 0;
      for (let oz = -1; oz <= 1; oz++) {
        for (let ox = -1; ox <= 1; ox++) {
          const i = (t.outfallGz + oz) * g + (t.outfallGx + ox);
          downSurfSum += this.zb[i] + this.h[i];
          downCount++;
        }
      }

      if (upWetCount === 0 || availVol <= 0.05 || t.throttle <= 0.005) {
        t.grossHead = 0;
        t.netHead = 0;
        t.flowQ = 0;
        t.efficiency = 0;
        t.powerMW = 0;
        t.cavitation = 0;
        continue;
      }

      // Плавное накопление плавника/ила на решётке водоприёмника при мутном паводке
      const avgSed = intakeSed / upWetCount;
      if (t.autoDispatch) {
        t.trashLoad = Math.max(0, t.trashLoad - dt * 0.02); // автоматическая сороочистная машина!
      } else if (avgSed > 0.25) {
        t.trashLoad = Math.min(0.28, t.trashLoad + (avgSed - 0.25) * 0.004 * dt);
      }

      const zUp = upSurfSum / upWetCount;
      const zDown = downSurfSum / (downCount || 1);
      const grossHead = Math.max(0, zUp - zDown);
      t.grossHead = grossHead;

      if (grossHead < spec.minHead * 0.45) {
        t.netHead = grossHead;
        t.flowQ = 0;
        t.efficiency = 0;
        t.powerMW = 0;
        t.cavitation = 0;
        continue;
      }

      const trashFactor = 1.0 - t.trashLoad;
      const headGovernor = clamp((grossHead - spec.minHead * 0.35) / (spec.optHead * 0.55), 0.14, 1.0);
      const orificeQ = t.throttle * headGovernor * trashFactor * spec.maxArea * Math.sqrt(2.0 * G * grossHead);
      const maxMassSafeQ = (availVol * 0.42) / dt;
      const Q = Math.min(orificeQ, maxMassSafeQ);

      const headLoss = spec.frictionK * Q * Q + t.trashLoad * 1.4;
      const netHead = Math.max(0, grossHead - headLoss);

      const headDiff = (netHead - spec.optHead) / spec.headSigma;
      const headFactor = Math.exp(-0.55 * headDiff * headDiff);
      const partLoadFactor = t.throttle < 0.28 ? (0.55 + (t.throttle / 0.28) * 0.45) : 1.0;
      const conditionFactor = 0.65 + 0.35 * t.condition;
      const eta = clamp(spec.peakEta * headFactor * partLoadFactor * conditionFactor, 0.18, spec.peakEta);

      const cavRisk = netHead > spec.maxHead ? (netHead - spec.maxHead) / 15.0
        : (netHead < spec.minHead ? (spec.minHead - netHead) / 6.0 : 0);
      t.cavitation = clamp(cavRisk, 0, 1);

      const rawMW = (RHO * G * Q * netHead * eta) * 1e-6;
      const powerMW = Math.min(spec.ratedMW * 1.18, rawMW);

      t.netHead = netHead;
      t.flowQ = Q;
      t.efficiency = eta;
      t.powerMW = powerMW;
      t.rotorPhase = (t.rotorPhase + dt * (2.5 + powerMW * 1.35)) % (Math.PI * 2);

      const volMoved = Q * dt;
      let removedSoFar = 0;
      for (let oz = -1; oz <= 1; oz++) {
        for (let ox = -1; ox <= 1; ox++) {
          const i = (t.intakeGz + oz) * g + (t.intakeGx + ox);
          const d = this.h[i];
          if (d > 0.12) {
            const share = ((d - 0.08) * this.cellArea) / availVol;
            const takeDepth = Math.min(d - 0.05, (volMoved * share) / this.cellArea);
            this.h[i] -= takeDepth;
            this.hu[i] = this.h[i] * this.u[i];
            this.hv[i] = this.h[i] * this.v[i];
            removedSoFar += takeDepth * this.cellArea;
          }
        }
      }

      const dhOut = removedSoFar / (9.0 * this.cellArea);
      const exitSpeed = clamp(2.2 + Math.sqrt(2 * G * Math.max(0.5, netHead)) * 0.22, 2.0, 9.5);
      for (let oz = -1; oz <= 1; oz++) {
        for (let ox = -1; ox <= 1; ox++) {
          const oi = (t.outfallGz + oz) * g + (t.outfallGx + ox);
          this.h[oi] += dhOut;
          this.hu[oi] += dhOut * t.dirX * exitSpeed;
          this.hv[oi] += dhOut * t.dirZ * exitSpeed;
          const nh = this.h[oi];
          if (nh > 1e-4) {
            this.u[oi] = clamp(this.hu[oi] / nh, -MAX_SPEED, MAX_SPEED);
            this.v[oi] = clamp(this.hv[oi] / nh, -MAX_SPEED, MAX_SPEED);
            this.hu[oi] = nh * this.u[oi];
            this.hv[oi] = nh * this.v[oi];
          }
          this.foam[oi] = Math.min(1.0, this.foam[oi] + 0.42);
        }
      }

      if (Q > 2.5) {
        const oiCenter = t.outfallGz * g + t.outfallGx;
        this.jetEmitters.push({
          wx: t.outfallWx,
          wy: this.zb[oiCenter] + this.h[oiCenter] + 0.2,
          wz: t.outfallWz,
          vx: t.dirX * exitSpeed * 0.75,
          vy: 1.15,
          vz: t.dirZ * exitSpeed * 0.75,
          intensity: clamp(powerMW / 8.0, 0.2, 1.35),
          kind: 'tailrace',
        });
      }
    }
  }

  _applyVorticityConfinement(dt) {
    const g = this.grid;
    const inv2Dx = 0.5 / this.dx;
    const { h, u, v, hu, hv, vort } = this;

    for (let ti = 0; ti < this.activeTileCount; ti++) {
      const tileIdx = this.activeTiles[ti];
      const x0 = Math.max(2, (tileIdx % this.tilesN) * TILE);
      const z0 = Math.max(2, Math.floor(tileIdx / this.tilesN) * TILE);
      const x1 = Math.min(g - 2, (tileIdx % this.tilesN) * TILE + TILE);
      const z1 = Math.min(g - 2, Math.floor(tileIdx / this.tilesN) * TILE + TILE);

      for (let gz = z0; gz < z1; gz++) {
        const row = gz * g;
        for (let gx = x0; gx < x1; gx++) {
          const i = row + gx;
          if (h[i] < 0.18) {
            vort[i] = 0;
            continue;
          }
          const dvdx = (v[i + 1] - v[i - 1]) * inv2Dx;
          const dudz = (u[i + g] - u[i - g]) * inv2Dx;
          vort[i] = dvdx - dudz;
        }
      }
    }

    const epsVC = 0.34 * this.dx * dt;
    for (let ti = 0; ti < this.activeTileCount; ti++) {
      const tileIdx = this.activeTiles[ti];
      const x0 = Math.max(2, (tileIdx % this.tilesN) * TILE);
      const z0 = Math.max(2, Math.floor(tileIdx / this.tilesN) * TILE);
      const x1 = Math.min(g - 2, (tileIdx % this.tilesN) * TILE + TILE);
      const z1 = Math.min(g - 2, Math.floor(tileIdx / this.tilesN) * TILE + TILE);

      for (let gz = z0; gz < z1; gz++) {
        const row = gz * g;
        for (let gx = x0; gx < x1; gx++) {
          const i = row + gx;
          const depth = h[i];
          const w = vort[i];
          if (depth < 0.25 || Math.abs(w) < 0.015) continue;

          const gxMag = Math.abs(vort[i + 1]) - Math.abs(vort[i - 1]);
          const gzMag = Math.abs(vort[i + g]) - Math.abs(vort[i - g]);
          const norm = Math.hypot(gxMag, gzMag) + 1e-5;
          const nx = gxMag / norm;
          const nz = gzMag / norm;

          const du = epsVC * nz * w;
          const dv = -epsVC * nx * w;
          u[i] = clamp(u[i] + du, -MAX_SPEED, MAX_SPEED);
          v[i] = clamp(v[i] + dv, -MAX_SPEED, MAX_SPEED);
          hu[i] = depth * u[i];
          hv[i] = depth * v[i];
        }
      }
    }
  }

  _stepSecondaryTransportAndErosion(dt) {
    const g = this.grid;
    const invDx = 1.0 / this.dx;
    const { h, u, v, foam, foamNext, sediment, sedNext, wetness } = this;

    this._erosionTick++;
    const doBedMorph = (this._erosionTick % 3) === 0;
    const doSeepageCheck = (this._erosionTick % 6) === 0;
    let morphMinX = g, morphMinZ = g, morphMaxX = -1, morphMaxZ = -1;
    let maxStress = 0;
    let seepSum = 0;

    for (let ti = 0; ti < this.activeTileCount; ti++) {
      const tileIdx = this.activeTiles[ti];
      const x0 = Math.max(1, (tileIdx % this.tilesN) * TILE);
      const z0 = Math.max(1, Math.floor(tileIdx / this.tilesN) * TILE);
      const x1 = Math.min(g - 1, (tileIdx % this.tilesN) * TILE + TILE);
      const z1 = Math.min(g - 1, Math.floor(tileIdx / this.tilesN) * TILE + TILE);

      for (let gz = z0; gz < z1; gz++) {
        const row = gz * g;
        for (let gx = x0; gx < x1; gx++) {
          const i = row + gx;
          const depth = h[i];

          // Проверка фильтрации под подошвой и нагрузки на высокую плотину без контрфорсов
          if (doSeepageCheck && this.concrete[i] > 5.0 && gz > 2 && gz < g - 3 && gx > 2 && gx < g - 3) {
            const upH = Math.max(h[i - g * 2], h[i - 2], h[i + 2], h[i + g * 2]);
            if (upH > 2.5) {
              const safeLimit = this.foundationMask[i] ? 36.0 : CONSTRUCTION.maxUnreinforcedHead;
              const stress = clamp((upH / safeLimit) * 100, 0, 125);
              if (stress > maxStress) maxStress = stress;

              // Подземная фильтрация на рыхлом нецементированном грунте при напоре > 10.5 м
              if (!this.foundationMask[i] && this.soil[i] > 1.2 && upH > CONSTRUCTION.highDamHeadThreshold) {
                const seepRate = (upH - CONSTRUCTION.highDamHeadThreshold) * 0.08 * (this.soil[i] / 3.0);
                seepSum += seepRate;
              }
            }
          }

          const neighborWet = (h[i - 1] > 0.03 || h[i + 1] > 0.03 || h[i - g] > 0.03 || h[i + g] > 0.03);
          if (depth > 0.02 || neighborWet) {
            wetness[i] = Math.min(1.0, wetness[i] + dt * 2.5);
          } else if (wetness[i] > 0) {
            wetness[i] = Math.max(0, wetness[i] - dt * 0.08);
          }

          if (depth <= 0.015) {
            foamNext[i] = foam[i] * 0.75;
            sedNext[i] = sediment[i] * 0.85;
            continue;
          }

          const backX = clamp(gx - u[i] * dt * invDx, 0.5, g - 1.5);
          const backZ = clamp(gz - v[i] * dt * invDx, 0.5, g - 1.5);
          const ix = backX | 0;
          const iz = backZ | 0;
          const fx = backX - ix;
          const fz = backZ - iz;
          const b00 = iz * g + ix;
          const b10 = b00 + 1;
          const b01 = b00 + g;
          const b11 = b01 + 1;

          const advFoam = lerp(lerp(foam[b00], foam[b10], fx), lerp(foam[b01], foam[b11], fx), fz);
          const advSed = lerp(lerp(sediment[b00], sediment[b10], fx), lerp(sediment[b01], sediment[b11], fx), fz);

          const speed2 = u[i] * u[i] + v[i] * v[i];
          const speed = Math.sqrt(speed2);
          const froude = speed / Math.sqrt(G * Math.max(0.08, depth));

          const div = ((u[i + 1] - u[i - 1]) + (v[i + g] - v[i - g])) * 0.5 * invDx;
          const jumpGen = (froude > 0.95 && div < -0.12) ? Math.min(0.65, (-div) * 0.45 * dt * 8.0) : 0;
          const rapidGen = speed > 3.6 ? (speed - 3.6) * 0.085 * dt : 0;

          foamNext[i] = clamp(advFoam * Math.exp(-dt * 0.72) + jumpGen + rapidGen, 0, 1.0);

          let sed = advSed * Math.exp(-dt * 0.16);
          if (this.linedMask[i] === 0 && this.concrete[i] < 0.05 && this.soil[i] > 0.02) {
            const isEarthDam = this.earthDamMask[i] === 1;
            const critSpeed = isEarthDam ? 1.85 : 3.9;
            if (speed > critSpeed) {
              const excess = speed - critSpeed;
              sed = Math.min(1.5, sed + excess * (isEarthDam ? 0.45 : 0.14) * dt);

              if (doBedMorph) {
                const erodeRate = isEarthDam ? 0.095 : 0.008;
                const cut = Math.min(this.soil[i], excess * erodeRate * dt * 3.0);
                if (cut > 0.001) {
                  this.soil[i] -= cut;
                  this.zb[i] = this.bedrock[i] + this.soil[i] + Math.max(this.concrete[i], this.formworkWall[i]) + this.gateWall[i];
                  if (gx < morphMinX) morphMinX = gx;
                  if (gz < morphMinZ) morphMinZ = gz;
                  if (gx > morphMaxX) morphMaxX = gx;
                  if (gz > morphMaxZ) morphMaxZ = gz;
                }
              }
            }
          }
          sedNext[i] = sed;
        }
      }
    }

    if (doSeepageCheck) {
      this.maxDamStress = lerp(this.maxDamStress, maxStress, 0.35);
      this.totalSeepageQ = lerp(this.totalSeepageQ, seepSum, 0.35);
    }

    for (let ti = 0; ti < this.activeTileCount; ti++) {
      const tileIdx = this.activeTiles[ti];
      const x0 = Math.max(1, (tileIdx % this.tilesN) * TILE);
      const z0 = Math.max(1, Math.floor(tileIdx / this.tilesN) * TILE);
      const x1 = Math.min(g - 1, (tileIdx % this.tilesN) * TILE + TILE);
      const z1 = Math.min(g - 1, Math.floor(tileIdx / this.tilesN) * TILE + TILE);
      for (let gz = z0; gz < z1; gz++) {
        const row = gz * g;
        for (let gx = x0; gx < x1; gx++) {
          const i = row + gx;
          foam[i] = foamNext[i];
          sediment[i] = sedNext[i];
        }
      }
    }

    if (morphMaxX >= morphMinX) {
      this.markTerrainDirty(morphMinX, morphMinZ, morphMaxX, morphMaxZ);
    }
  }

  _rebuildVelocitiesAll() {
    for (let i = 0; i < this.count; i++) {
      const nh = this.h[i];
      if (nh <= 1e-4) {
        this.u[i] = 0;
        this.v[i] = 0;
        this.hu[i] = 0;
        this.hv[i] = 0;
      } else {
        this.u[i] = this.hu[i] / nh;
        this.v[i] = this.hv[i] / nh;
      }
    }
  }
}
