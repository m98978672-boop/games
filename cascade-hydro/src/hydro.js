// ============================================================================
//  ЯДРО ФИЗИКИ ВОДЫ «REAL-LIFE HYDRO» (2.5D Audusse Well-Balanced SWE +
//  Vorticity Confinement + размыв Шильдса + затворы + напорные турбины ГЭС)
// ============================================================================

import { WORLD, TURBINE_SPECS } from './config.js';
import { clamp, lerp } from './noise.js';
import { buildValleyTerrain } from './valley.js';

const G = WORLD.gravity;
const RHO = WORLD.waterDensity;
const EPS_H = 0.014;
const EPS_H4 = EPS_H * EPS_H * EPS_H * EPS_H;
const MAX_SPEED = 26.0;
const TILE = 8; // размер тайла 8×8 для пропуска сухих горных склонов

export class HydroSimulation {
  constructor(grid = 160) {
    this.grid = grid;
    this.count = grid * grid;
    this.dx = WORLD.size / grid;
    this.cellArea = this.dx * this.dx;

    // Слои рельефа и покрытий
    this.bedrock = new Float32Array(this.count);
    this.soil = new Float32Array(this.count);
    this.concrete = new Float32Array(this.count);
    this.gateWall = new Float32Array(this.count);
    this.zb = new Float32Array(this.count);           // суммарная отметка дна/стен
    this.linedMask = new Uint8Array(this.count);      // 1 = бетонная облицовка русла
    this.earthDamMask = new Uint8Array(this.count);   // 1 = насыпная грунтовая дамба (легче размывается при переливе!)

    // Основные консервативные переменные мелкой воды Сен-Венана
    this.h = new Float32Array(this.count);
    this.hu = new Float32Array(this.count);
    this.hv = new Float32Array(this.count);

    // Буферы приращений потоков (Zero-GC)
    this.dH = new Float32Array(this.count);
    this.dHU = new Float32Array(this.count);
    this.dHV = new Float32Array(this.count);

    // Вторичные физические поля
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

    // Грязный прямоугольник рельефа (обновляем только изменённый участок меша!)
    this.terrainDirty = true;
    this.dirtyMinX = 0;
    this.dirtyMinZ = 0;
    this.dirtyMaxX = grid - 1;
    this.dirtyMaxZ = grid - 1;

    // Гидротехнические сооружения
    this.turbines = [];
    this.spillways = [];
    this.nextStructId = 1;

    // Отвал вынутого грунта (снижает цену грунтовых дамб!) и статистика
    this.soilStockpileM3 = 0;
    this.totalExcavatedM3 = 0;
    this.inflowMult = 1.0;
    this.rainRate = 0.0;
    this.lastSubsteps = 0;
    this.lastStepMs = 0;
    this.totalWaterVolumeM3 = 0;
    this.simTime = 0;
    this._erosionTick = 0;

    // Очередь выброса 3D-брызг для рендера водосбросов и нижнего бьефа
    this.jetEmitters = [];

    this.resetValley();
  }

  resetValley() {
    this.bedrock.fill(0);
    this.soil.fill(0);
    this.concrete.fill(0);
    this.gateWall.fill(0);
    this.linedMask.fill(0);
    this.earthDamMask.fill(0);
    this.h.fill(0);
    this.hu.fill(0);
    this.hv.fill(0);
    this.vort.fill(0);
    this.sediment.fill(0);
    this.foam.fill(0);
    this.wetness.fill(0);
    this.turbines = [];
    this.spillways = [];
    this.soilStockpileM3 = 0;
    this.totalExcavatedM3 = 0;

    buildValleyTerrain(this.grid, this);
    this.recomputeZbRange(0, 0, this.grid - 1, this.grid - 1);
    this._rebuildVelocitiesAll();
    this._rebuildActiveTiles();

    // Короткий прогрев русла (18 подшагов), чтобы поток лёг по излучинам с естественным уклоном
    for (let i = 0; i < 18; i++) {
      this._substep(0.045);
    }
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
        this.zb[i] = this.bedrock[i] + this.soil[i] + this.concrete[i] + this.gateWall[i];
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

  /** Замер параметров потока в мировой точке (для гидропоста и курсора) */
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
      lined: this.linedMask[i] === 1,
      earthDam: this.earthDamMask[i] === 1,
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
  //  ИНСТРУМЕНТЫ ТЕРРАФОРМИНГА, КАНАЛОВ, ПЛОТИН И ГИДРОУЗЛОВ
  // ==========================================================================

  /**
   * Прокопка собственного канала (с опцией targetFloor для идеально ровного уклона по Shift!)
   * Возвращает стоимость работ и вынутый объём.
   */
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
        if (this.concrete[i] > 0.25 || this.gateWall[i] > 0.1) continue; // не ломаем плотину ковшом

        // Трапецеидальный профиль канала: плоское дно в центре и аккуратные откосы по краям
        const edgeT = clamp(dist / (radiusMeters || 1), 0, 1);
        const profile = edgeT < 0.55 ? 1.0 : Math.cos(((edgeT - 0.55) / 0.45) * Math.PI * 0.5);
        if (profile <= 0.02) continue;

        const currentTop = this.bedrock[i] + this.soil[i];
        let desiredCut = digStep * profile;
        if (Number.isFinite(targetFloor)) {
          const bankSlopeOffset = edgeT > 0.55 ? (edgeT - 0.55) * 4.2 : 0;
          const goalElev = targetFloor + bankSlopeOffset;
          if (currentTop <= goalElev) continue;
          desiredCut = Math.min(digStep * 1.8, currentTop - goalElev);
        }
        if (desiredCut <= 0.01) continue;

        const cutSoil = Math.min(this.soil[i], desiredCut);
        const remCut = Math.max(0, desiredCut - cutSoil);
        const cutRock = Math.min(Math.max(0, this.bedrock[i] - 1.2), remCut * 0.55);

        const cellCost = (cutSoil * 3.5 + cutRock * 16.0) * this.cellArea * 0.22;
        if (!creative && totalCost + cellCost > maxBudget) continue;

        this.soil[i] -= cutSoil;
        this.bedrock[i] -= cutRock;
        this.earthDamMask[i] = 0;

        // Вода при копке под водой мутнеет от поднятого ила!
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
      this.totalExcavatedM3 += soilCutM3 + rockCutM3;
      this.recomputeZbRange(x0, z0, x1, z1);
      this._activateArea(x0, z0, x1, z1);
    }

    return { cost: totalCost, excavatedM3: soilCutM3 + rockCutM3 };
  }

  /** Бетонная облицовка русла канала (ускоряет течение и защищает от размыва) */
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
        if (!creative && cost + 42 > maxBudget) break;
        this.linedMask[i] = 1;
        this.earthDamMask[i] = 0;
        cost += 42;
        count++;
      }
    }
    if (count > 0) {
      this.markTerrainDirty(x0, z0, x1, z1);
    }
    return { cost, count };
  }

  /** Отсыпка грунтовой дамбы / строительной перемычки (использует грунт из отвала со скидкой 70%!) */
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
        if (this.concrete[i] > 0.2) continue;

        const profile = Math.cos((dist / (radiusMeters || 1)) * Math.PI * 0.46);
        let addH = raiseStep * profile;
        if (Number.isFinite(targetCrest)) {
          const cur = this.zb[i];
          const goal = targetCrest - (dist / (radiusMeters || 1)) * 1.4;
          if (cur >= goal) continue;
          addH = Math.min(raiseStep * 1.7, goal - cur);
        }
        if (addH <= 0.02) continue;

        const vol = addH * this.cellArea;
        const fromStock = Math.min(this.soilStockpileM3, vol);
        const bought = vol - fromStock;
        const cellCost = (fromStock * 1.5 + bought * 5.5) * 0.22;
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

  /** Возведение монолитной бетонной плотины (вытесняет воду, не размывается, держит высокий напор) */
  buildConcreteDam(wx, wz, radiusMeters, targetCrest, maxBudget, creative = false) {
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
        if (this.gateWall[i] > 0.05) continue;

        // У плотины плоский гребень и лёгкий уклон граней (трапеция гравитационной плотины)
        const edgeRatio = dist / (radiusMeters || 1);
        const crestHere = edgeRatio < 0.62 ? targetCrest : targetCrest - (edgeRatio - 0.62) * 3.2;
        const curZ = this.bedrock[i] + this.soil[i] + this.concrete[i];
        if (curZ >= crestHere) continue;

        const addC = Math.min(5.0, crestHere - curZ);
        const vol = addC * this.cellArea;
        const cellCost = vol * 24.0 * 0.16;
        if (!creative && totalCost + cellCost > maxBudget) continue;

        this.concrete[i] += addC;
        this.earthDamMask[i] = 0;
        this.linedMask[i] = 1;
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

  /** Определяет вектор градиента напора вокруг точки (от верхнего бьефа к нижнему) */
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
        // Учитываем уровень свободной поверхности воды + рельеф дна
        const head = (this.bedrock[ni] + this.soil[ni]) + this.h[ni] * 1.8;
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

  /** Установка регулируемого водосброса с затвором и носком-трамплином */
  placeSpillway(wx, wz, forcedYaw, maxBudget, creative = false) {
    const cost = 4200;
    if (!creative && maxBudget < cost) return { ok: false, reason: 'Недостаточно средств (нужно 4 200 ₽)' };
    const { gx, gz } = this.worldToGrid(wx, wz);
    if (gx < 4 || gx > this.grid - 5 || gz < 4 || gz > this.grid - 5) {
      return { ok: false, reason: 'Слишком близко к краю карты' };
    }

    // Проверка пересечения с другими агрегатами
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
    // Определяем высоту соседних устоев плотины, чтобы врезать лоток водосброса аккуратно
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
        maxNeighborCrest = Math.max(maxNeighborCrest, this.zb[i]);
      }
    }

    const sillElev = Math.max(minNaturalBed + 1.5, maxNeighborCrest - 7.5);
    const gateMaxHeight = Math.max(6.5, maxNeighborCrest - sillElev + 2.0);

    for (const i of cells) {
      const nat = this.bedrock[i] + this.soil[i];
      this.concrete[i] = Math.max(0.4, sillElev - nat);
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
      openRatio: 0.35,      // 35% открыт по умолчанию
      autoRegulate: true,   // авто-сброс паводка при превышении отметки!
      targetHeadElev: sillElev + gateMaxHeight * 0.82,
      cells,
      currentFlowQ: 0,
      jetSpeed: 0,
    };

    this.spillways.push(sw);
    this._syncSpillwayGateCells(sw);
    this.recomputeZbRange(gx - 2, gz - 2, gx + 2, gz + 2);
    this._activateArea(gx - 3, gz - 3, gx + 3, gz + 3);
    return { ok: true, cost, structure: sw };
  }

  _syncSpillwayGateCells(sw) {
    const barrier = (1.0 - clamp(sw.openRatio, 0, 1)) * sw.wallHeight;
    for (let k = 0; k < sw.cells.length; k++) {
      const i = sw.cells[k];
      this.gateWall[i] = barrier;
      this.zb[i] = this.bedrock[i] + this.soil[i] + this.concrete[i] + barrier;
    }
    this.markTerrainDirty(sw.gx - 2, sw.gz - 2, sw.gx + 2, sw.gz + 2);
  }

  /** Установка гидроагрегата ГЭС (Каплана, Фрэнсиса или Пелтона) */
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
    const reach = Math.max(4, Math.ceil(14.5 / this.dx)); // дистанция водозабора и отводящего лотка (~15 м за тело плотины)
    const intakeGx = clamp(Math.round(gx - dir.dx * reach), 2, this.grid - 3);
    const intakeGz = clamp(Math.round(gz - dir.dz * reach), 2, this.grid - 3);
    const outfallGx = clamp(Math.round(gx + dir.dx * reach), 2, this.grid - 3);
    const outfallGz = clamp(Math.round(gz + dir.dz * reach), 2, this.grid - 3);

    // Возводим бетонное тело здания ГЭС (3×3 ячейки), чтобы оно само герметично перекрывало створ!
    let neighborDamTop = 0;
    for (let oz = -3; oz <= 3; oz++) {
      for (let ox = -3; ox <= 3; ox++) {
        const ni = clamp(gz + oz, 0, this.grid - 1) * this.grid + clamp(gx + ox, 0, this.grid - 1);
        neighborDamTop = Math.max(neighborDamTop, this.zb[ni]);
      }
    }
    const centerIdx = gz * this.grid + gx;
    const baseNat = this.bedrock[centerIdx] + this.soil[centerIdx];
    const blockCrest = Math.max(baseNat + 11.0, neighborDamTop);

    const bodyCells = [];
    for (let oz = -1; oz <= 1; oz++) {
      for (let ox = -1; ox <= 1; ox++) {
        const cx = gx + ox;
        const cz = gz + oz;
        const i = cz * this.grid + cx;
        const nat = this.bedrock[i] + this.soil[i];
        const prevConcrete = this.concrete[i];
        this.concrete[i] = Math.max(prevConcrete, blockCrest - nat);
        this.linedMask[i] = 1;
        this.earthDamMask[i] = 0;
        bodyCells.push({ i, prevConcrete });
      }
    }

    // Расчищаем и облицуем приёмный водозабор и отводящий приямок (если плотина была широкой)
    for (let oz = -1; oz <= 1; oz++) {
      for (let ox = -1; ox <= 1; ox++) {
        const ii = (intakeGz + oz) * this.grid + (intakeGx + ox);
        const oi = (outfallGz + oz) * this.grid + (outfallGx + ox);
        if (this.concrete[ii] > 0) {
          bodyCells.push({ i: ii, prevConcrete: this.concrete[ii] });
          this.concrete[ii] = 0;
        }
        if (this.concrete[oi] > 0) {
          bodyCells.push({ i: oi, prevConcrete: this.concrete[oi] });
          this.concrete[oi] = 0;
        }
        this.linedMask[ii] = 1;
        this.linedMask[oi] = 1;
      }
    }

    const pos = this.gridToWorld(gx, gz);
    const intakeWorld = this.gridToWorld(intakeGx, intakeGz);
    const outfallWorld = this.gridToWorld(outfallGx, outfallGz);

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
      dirX: dir.dx,
      dirZ: dir.dz,
      yaw: dir.yaw,
      intakeGx,
      intakeGz,
      intakeWx: intakeWorld.wx,
      intakeWz: intakeWorld.wz,
      outfallGx,
      outfallGz,
      outfallWx: outfallWorld.wx,
      outfallWz: outfallWorld.wz,
      bodyCells,
      throttle: 1.0,        // открытие направляющего аппарата 0..1
      autoDispatch: false,  // режим авто-следования за пиками тарифа
      grossHead: 0,
      netHead: 0,
      flowQ: 0,
      efficiency: 0,
      powerMW: 0,
      cavitation: 0,
      condition: 1.0,       // технический ресурс 100%
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

    return { ok: true, cost: spec.cost, structure: turb };
  }

  /** Снос агрегата, затвора или разборка бетонного массива */
  demolishAt(wx, wz) {
    const { gx, gz } = this.worldToGrid(wx, wz);

    const tIdx = this.turbines.findIndex((t) => Math.hypot(t.gx - gx, t.gz - gz) <= 2.4);
    if (tIdx >= 0) {
      const t = this.turbines[tIdx];
      for (const c of t.bodyCells) {
        this.concrete[c.i] = c.prevConcrete;
      }
      this.turbines.splice(tIdx, 1);
      this.recomputeZbRange(t.gx - 2, t.gz - 2, t.gx + 2, t.gz + 2);
      return { removed: 'turbine', refund: Math.round(t.spec.cost * 0.45) };
    }

    const sIdx = this.spillways.findIndex((s) => Math.hypot(s.gx - gx, s.gz - gz) <= 2.4);
    if (sIdx >= 0) {
      const s = this.spillways[sIdx];
      for (const i of s.cells) {
        this.gateWall[i] = 0;
        this.concrete[i] = 0;
      }
      this.spillways.splice(sIdx, 1);
      this.recomputeZbRange(s.gx - 2, s.gz - 2, s.gx + 2, s.gz + 2);
      return { removed: 'spillway', refund: 1800 };
    }

    // Иначе разбираем бетон на участке 2×2
    let removedConcrete = 0;
    for (let oz = -1; oz <= 1; oz++) {
      for (let ox = -1; ox <= 1; ox++) {
        const cx = clamp(gx + ox, 1, this.grid - 2);
        const cz = clamp(gz + oz, 1, this.grid - 2);
        const i = cz * this.grid + cx;
        if (this.concrete[i] > 0) {
          removedConcrete += this.concrete[i];
          this.concrete[i] = Math.max(0, this.concrete[i] - 4.0);
        }
        this.linedMask[i] = 0;
      }
    }
    if (removedConcrete > 0) {
      this.recomputeZbRange(gx - 2, gz - 2, gx + 2, gz + 2);
      return { removed: 'concrete', refund: 0 };
    }
    return { removed: null, refund: 0 };
  }

  findStructureNear(wx, wz, maxDist = 14) {
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
  //  ШАГ СИМУЛЯЦИИ С АВТОМАТИЧЕСКИМ КОНТРОЛЕМ КУРАНТА (CFL <= 0.44)
  // ==========================================================================

  step(frameDt, maxSubsteps = 8) {
    const t0 = typeof performance !== 'undefined' ? performance.now() : Date.now();
    this.jetEmitters.length = 0;

    // Ограничиваем dt кадра для стабильности
    const totalDt = clamp(frameDt, 0.001, 0.16);
    this._rebuildActiveTiles();

    // Оцениваем максимальную волновую скорость для CFL
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

    // Вторичные эффекты раз в кадр: перенос взвеси/пены, размыв русла и прорыв грунтовых дамб
    this._stepSecondaryTransportAndErosion(subDt * substeps);

    this.lastSubsteps = substeps;
    const t1 = typeof performance !== 'undefined' ? performance.now() : Date.now();
    this.lastStepMs = t1 - t0;
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

    // Всегда держим активными истоки и установленные турбины
    this._activateArea(0, 0, g - 1, 6);
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

    // 1. Приток горных рек, осадки и открытый сток в устье
    this._applyRiverBoundariesAndRain(dt);

    // 2. Напорный пропуск через турбины ГЭС и авторегуляция затворов водосброса
    this._stepTurbinesAndSpillways(dt);

    // 3. Обнуляем приращения только на активных тайлах
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

    // 4. Потоки Сен-Венана с гидростатической реконструкцией Audusse–Bouchut–Bristeau
    for (let ti = 0; ti < this.activeTileCount; ti++) {
      const tileIdx = this.activeTiles[ti];
      const x0 = Math.max(0, (tileIdx % this.tilesN) * TILE);
      const z0 = Math.max(0, Math.floor(tileIdx / this.tilesN) * TILE);
      const x1 = Math.min(g - 1, x0 + TILE);
      const z1 = Math.min(g - 1, z0 + TILE);

      // Грани вдоль X (между i и i+1) и вдоль Z (между i и i+g)
      for (let gz = z0; gz < z1; gz++) {
        const row = gz * g;
        for (let gx = x0; gx < x1; gx++) {
          const i = row + gx;

          // --- Грань X: L = i, R = i + 1 ---
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
                // Точная well-balanced коррекция гидростатического давления на склоне!
                dHU[i] -= (fqx - pL);
                dHU[r] += (fqx - pR);
                dHV[i] -= fqz;
                dHV[r] += fqz;
              }
            }
          }

          // --- Грань Z: L = i, R = i + g ---
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

    // 5. Обновление консервативных переменных + неявное донное трение Маннинга
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

          // Десингуляризация скорости Курганова — Петровой
          const h2 = nh * nh;
          const h4 = h2 * h2;
          const invDenom = Math.SQRT2 * nh / Math.sqrt(h4 + (h4 > EPS_H4 ? h4 : EPS_H4));
          let ux = nqx * invDenom;
          let vz = nqz * invDenom;

          // Шероховатость по Маннингу: гладкий бетон (0.012) разгоняет поток в канале!
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

    // 6. Вихревое удержание Кармана (Vorticity Confinement) — живые водовороты и улова!
    this._applyVorticityConfinement(dt);
  }

  _applyRiverBoundariesAndRain(dt) {
    const g = this.grid;

    // Главный горный исток «Быстрица» around (-68, -280) — мощная полноводная горная река!
    const mainInflowQ = 138.0 * this.inflowMult;
    const mCenter = this.worldToGrid(-68, -278);
    this._injectSpring(mCenter.gx, mCenter.gz, 2, mainInflowQ, 0.42, 0.91, dt);

    // Ледниковый приток «Серебрянка» around (112, -278)
    const creekInflowQ = 44.0 * this.inflowMult;
    const cCenter = this.worldToGrid(112, -276);
    this._injectSpring(cCenter.gx, cCenter.gz, 2, creekInflowQ, -0.68, 0.73, dt);

    // Атмосферные осадки в паводок/грозу (собираются со склонов ручьями в реки и каналы!)
    if (this.rainRate > 0) {
      const addRain = this.rainRate * dt;
      // Дождь выпадает равномерно по водосбору (каждую 4-ю клетку с 4× весом для скорости!)
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

    // Южное устье (gz = g - 2, g - 1): мягкий неотражающий речной сток
    const rowOut = (g - 2) * g;
    const rowEdge = (g - 1) * g;
    for (let gx = 1; gx < g - 1; gx++) {
      const i = rowOut + gx;
      const bed = this.zb[i];
      if (this.h[i] > 0.01) {
        // Нормальный подпор нижнего течения на отметке 6.15 м (глубина ~1.65 м в русле)
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
      // Крайний ряд поглощает выход без отражений
      this.h[rowEdge + gx] = this.h[i] * 0.85;
      this.hu[rowEdge + gx] = 0;
      this.hv[rowEdge + gx] = 0;
    }

    // Непроницаемые борта каньона по западу/востоку/северу
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
        const gx = clamp(cx + ox, 1, this.grid - 2);
        const gz = clamp(cz + oz, 1, this.grid - 2);
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

    // --- А. Регулируемые водосбросы + выброс 3D-струй с носка-трамплина ---
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

      // Измеряем фактический расход воды через лоток водосброса
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

    // --- Б. Напорные гидроагрегаты ГЭС: P = rho * g * Q * H_net * eta ---
    for (let tIdx = 0; tIdx < this.turbines.length; tIdx++) {
      const t = this.turbines[tIdx];
      const spec = t.spec;

      // Собираем доступную воду в приямке водозабора 3×3 (верхний бьеф)
      let upSurfSum = 0;
      let upWetCount = 0;
      let availVol = 0;
      for (let oz = -1; oz <= 1; oz++) {
        for (let ox = -1; ox <= 1; ox++) {
          const i = (t.intakeGz + oz) * g + (t.intakeGx + ox);
          const d = this.h[i];
          if (d > 0.12) {
            upSurfSum += this.zb[i] + d;
            upWetCount++;
            availVol += (d - 0.08) * this.cellArea;
          }
        }
      }

      // Отметка нижнего бьефа в отводящем канале 3×3
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

      // Регулятор напора верхнего бьефа: не сливает водохранилище в ноль на малом напоре,
      // давая воде быстро поднять уровень перед плотиной до рабочей отметки!
      const headGovernor = clamp((grossHead - spec.minHead * 0.35) / (spec.optHead * 0.55), 0.12, 1.0);
      const orificeQ = t.throttle * headGovernor * spec.maxArea * Math.sqrt(2.0 * G * grossHead);
      const maxMassSafeQ = (availVol * 0.42) / dt;
      const Q = Math.min(orificeQ, maxMassSafeQ);

      // Гидравлические потери напора на трение в водоводе
      const headLoss = spec.frictionK * Q * Q;
      const netHead = Math.max(0, grossHead - headLoss);

      // Реальная холмообразная характеристика КПД турбины eta(H, throttle)
      const headDiff = (netHead - spec.optHead) / spec.headSigma;
      const headFactor = Math.exp(-0.55 * headDiff * headDiff);
      const partLoadFactor = t.throttle < 0.28 ? (0.55 + (t.throttle / 0.28) * 0.45) : 1.0;
      const conditionFactor = 0.65 + 0.35 * t.condition;
      const eta = clamp(spec.peakEta * headFactor * partLoadFactor * conditionFactor, 0.18, spec.peakEta);

      // Кавитация возникает при работе далеко за пределами расчётного напора
      const cavRisk = netHead > spec.maxHead ? (netHead - spec.maxHead) / 15.0
        : (netHead < spec.minHead ? (spec.minHead - netHead) / 6.0 : 0);
      t.cavitation = clamp(cavRisk, 0, 1);

      // Мощность в МВт по фундаментальной формуле гидроэнергетики: P = rho * g * Q * H_net * eta / 1e6
      const rawMW = (RHO * G * Q * netHead * eta) * 1e-6;
      const powerMW = Math.min(spec.ratedMW * 1.18, rawMW);

      t.netHead = netHead;
      t.flowQ = Q;
      t.efficiency = eta;
      t.powerMW = powerMW;
      t.rotorPhase = (t.rotorPhase + dt * (2.5 + powerMW * 1.35)) % (Math.PI * 2);

      // Забираем объём воды Q*dt из водозабора верхнего бьефа (100% сохранение массы!)
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

      // Выбрасываем ТОЧНО этот же объём removedSoFar в отводящий канал нижнего бьефа с реактивной струёй и пеной!
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

    // Шаг А: вычисляем вихрь omega = dv/dx - du/dz
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

    // Шаг Б: сила удержания водоворотов Кармана f_vc = eps * dx * (Nz * omega, -Nx * omega)
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
    let morphMinX = g;
    let morphMinZ = g;
    let morphMaxX = -1;
    let morphMaxZ = -1;

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

          // Намокание и высыхание берегов (капиллярная влажность вокруг уреза воды)
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

          // Полу-лагранжева адвекция пены и взвешенного ила вдоль вектора скорости (u, v)
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

          // Дивергенция скорости: сжатие потока на гидравлическом прыжке порождает мощную шапку пены!
          const div = ((u[i + 1] - u[i - 1]) + (v[i + g] - v[i - g])) * 0.5 * invDx;
          const jumpGen = (froude > 0.95 && div < -0.12) ? Math.min(0.65, (-div) * 0.45 * dt * 8.0) : 0;
          const rapidGen = speed > 3.6 ? (speed - 3.6) * 0.085 * dt : 0;

          foamNext[i] = clamp(advFoam * Math.exp(-dt * 0.72) + jumpGen + rapidGen, 0, 1.0);

          // Критерий Шильдса: размыв необлицованного грунта и ПРОРЫВ земляных дамб при переливе!
          let sed = advSed * Math.exp(-dt * 0.16); // постепенное осаждение ила в тихом водохранилище
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
                  this.zb[i] = this.bedrock[i] + this.soil[i] + this.concrete[i] + this.gateWall[i];
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

    // Копируем обратно только активные тайлы
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
