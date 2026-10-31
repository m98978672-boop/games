// ============================================================================
//  ЭКОНОМИКА ГЭС, ПОТЕРИ ОРУ 110 кВ, ЭНЕРГОРЫНОК И 5 САМОРАСТУЩИХ ГОРОДОВ
//  Работает на фиксированном шаге FixedClock (ядро «Переплёт» 30 Гц)
// ============================================================================

import { FixedClock } from '../../pereplet-prototype/clock.mjs';
import {
  WORLD,
  ECONOMY,
  CONSTRUCTION,
  CITY_DEFS,
  MILESTONES,
  WEATHER_MODES,
  spotTariffMultiplier,
  spotPeriodLabel,
} from './config.js';
import { clamp, makeRng } from './noise.js';

export class EconomyAndCities {
  constructor(hydro, callbacks = {}) {
    this.hydro = hydro;
    this.callbacks = callbacks;

    this.clock = new FixedClock({ step: 1 / 30, maxSteps: 6 });
    this._rng = makeRng(987654);

    this.resetEconomy();
  }

  resetEconomy() {
    this.cash = ECONOMY.startingCash;
    this.loan = 0;
    this.creative = false;

    this.day = 1;
    this.hour = 8.0;
    this.weatherId = 'normal';
    this.weatherTimer = 54;

    this.totalMW = 0;
    this.netDeliveredMW = 0;
    this.gridLossPct = 0;
    this.connectedDemandMW = 0;
    this.totalCityDemandMW = 0;
    this.suppliedCityMW = 0;
    this.exportedMW = 0;
    this.spotMultiplier = spotTariffMultiplier(this.hour);
    this.incomePerSec = 0;
    this.upkeepPerSec = 0;
    this.netPerSec = 0;
    this.totalEarned = 0;
    this.totalMWhGenerated = 0;
    this.agroIrrigated = false;
    this._seepageWarnCooldown = 0;

    this.completedMilestones = new Set();

    this.cities = [];
    this.allBuildings = [];
    this.buildingsDirty = true;
    this.powerLinesDirty = true;

    this._initCities();
    this._applyWeatherToHydro();
  }

  _initCities() {
    this.cities = [];
    this.allBuildings = [];

    for (let cIdx = 0; cIdx < CITY_DEFS.length; cIdx++) {
      const def = CITY_DEFS[cIdx];
      const rng = makeRng(1000 + cIdx * 777);

      const lots = [];
      for (let ring = 1; ring <= 5; ring++) {
        const countInRing = ring * 6 + 3;
        const baseR = 9.0 + (ring - 1) * 9.2;
        for (let k = 0; k < countInRing; k++) {
          if (lots.length >= 62) break;
          const ang = (k / countInRing) * Math.PI * 2 + ring * 0.43 + (rng() - 0.5) * 0.16;
          const r = baseR + (rng() - 0.5) * 2.4;
          if (r > def.plateauRadius * 0.92) continue;
          const lx = def.x + Math.cos(ang) * r;
          const lz = def.z + Math.sin(ang) * r;
          const sample = this.hydro.sampleAtWorld(lx, lz);
          lots.push({
            wx: lx,
            wz: lz,
            wy: sample.bed,
            yaw: Math.round((ang + Math.PI * 0.5) / (Math.PI * 0.5)) * (Math.PI * 0.5) + (rng() - 0.5) * 0.12,
            ring,
            occupied: false,
            buildingIndex: -1,
          });
        }
      }

      const city = {
        ...def,
        connected: !!def.connectedAtStart,
        population: def.startPop,
        level: 1,
        levelName: 'Посёлок',
        satisfaction: 0.76,
        powerRatio: 0,
        currentDemandMW: def.baseDemandMW,
        suppliedMW: 0,
        growthProgress: 0.16,
        isFlooded: false,
        irrigated: false,
        lots,
        buildingIndices: [],
        blackoutTimer: 0,
      };

      const initialBuildings = def.archetype === 'metropolis' ? 14 : (def.archetype === 'industrial' ? 11 : 8);
      for (let b = 0; b < initialBuildings && b < lots.length; b++) {
        this._spawnBuildingInCity(city, lots[b], 1.0, rng);
      }
      this._recalcCityTier(city);
      this.cities.push(city);
    }

    this.buildingsDirty = true;
    this.powerLinesDirty = true;
  }

  _chooseBuildingKind(city, ring, tierBoost, rng) {
    if (city.archetype === 'agro' && ring >= 3 && rng() < 0.52) return 'greenhouse';
    if (city.archetype === 'industrial' && ring >= 2 && rng() < 0.44) return 'factory';
    if (city.archetype === 'metropolis' && ring <= 2 && city.level >= 3 && rng() < 0.65) return 'skyscraper';
    const score = (4 - Math.min(3, ring)) + tierBoost + rng() * 1.4;
    if (score >= 4.4) return 'skyscraper';
    if (score >= 2.9) return 'apartment';
    if (score >= 1.9 && rng() < 0.35) return 'factory';
    if (score >= 1.6) return 'townhouse';
    return 'cottage';
  }

  _spawnBuildingInCity(city, lot, initialAnim = 0.05, rng = this._rng) {
    lot.occupied = true;
    const kind = this._chooseBuildingKind(city, lot.ring, city.level * 0.55, rng);

    let sx = 4.4, sy = 3.8, sz = 4.4;
    if (kind === 'cottage') {
      sx = 4.0 + rng() * 1.3;
      sy = 3.0 + rng() * 1.2;
      sz = 4.0 + rng() * 1.3;
    } else if (kind === 'townhouse') {
      sx = 5.0 + rng() * 1.6;
      sy = 5.6 + rng() * 2.4;
      sz = 4.6 + rng() * 1.3;
    } else if (kind === 'apartment') {
      sx = 5.8 + rng() * 2.0;
      sy = 11.0 + rng() * 7.0;
      sz = 5.4 + rng() * 1.7;
    } else if (kind === 'factory') {
      sx = 7.8 + rng() * 2.4;
      sy = 6.0 + rng() * 2.5;
      sz = 6.5 + rng() * 2.2;
    } else if (kind === 'greenhouse') {
      sx = 7.2 + rng() * 2.2;
      sy = 2.8 + rng() * 0.9;
      sz = 5.0 + rng() * 1.5;
    } else if (kind === 'skyscraper') {
      sx = 6.6 + rng() * 2.0;
      sy = 19.0 + rng() * 14.0;
      sz = 6.6 + rng() * 2.0;
    }

    const sample = this.hydro.sampleAtWorld(lot.wx, lot.wz);
    const bIdx = this.allBuildings.length;
    const bObj = {
      index: bIdx,
      cityId: city.id,
      kind,
      wx: lot.wx,
      wy: sample.bed,
      wz: lot.wz,
      yaw: lot.yaw,
      sx,
      sy,
      sz,
      tier: city.level,
      anim: initialAnim,
      lit: 1.0,
      tint: rng(),
    };
    lot.buildingIndex = bIdx;
    this.allBuildings.push(bObj);
    city.buildingIndices.push(bIdx);
    this.buildingsDirty = true;
    return bObj;
  }

  _recalcCityTier(city) {
    const n = city.buildingIndices.length;
    if (n >= 42) {
      city.level = 5;
      city.levelName = 'Мегаполис';
    } else if (n >= 30) {
      city.level = 4;
      city.levelName = 'Индустриальный центр';
    } else if (n >= 20) {
      city.level = 3;
      city.levelName = 'Крупный город';
    } else if (n >= 13) {
      city.level = 2;
      city.levelName = 'Городок';
    } else {
      city.level = 1;
      city.levelName = 'Посёлок';
    }
  }

  connectCityGrid(cityId) {
    const city = this.cities.find((c) => c.id === cityId);
    if (!city) return { ok: false, reason: 'Город не найден' };
    if (city.connected) return { ok: false, reason: 'Город уже подключён к энергосети' };

    const cost = this.estimatePowerLineCost(city);
    if (!this.creative && this.cash < cost) {
      return { ok: false, reason: `Нужно ${cost.toLocaleString('ru-RU')} ₽ на строительство ЛЭП 110 кВ` };
    }
    if (!this.creative) this.cash -= cost;
    city.connected = true;
    this.powerLinesDirty = true;
    if (this.callbacks.onNotify) {
      this.callbacks.onNotify(`✦ Магистраль ЛЭП 110 кВ подключена к г. ${city.name}!`, 'good');
    }
    return { ok: true, cost, city };
  }

  estimatePowerLineCost(city) {
    let bestDist = Math.hypot(city.x - 12, city.z - (-152));
    for (const sub of this.hydro.substations) {
      const d = Math.hypot(city.x - sub.wx, city.z - sub.wz);
      if (d < bestDist) bestDist = d;
    }
    for (const t of this.hydro.turbines) {
      const d = Math.hypot(city.x - t.wx, city.z - t.wz);
      if (d < bestDist) bestDist = d;
    }
    return Math.max(1900, Math.round(bestDist * 13));
  }

  canAfford(amount) {
    return this.creative || this.cash >= amount;
  }

  spend(amount) {
    if (this.creative || amount <= 0) return true;
    if (this.cash < amount) return false;
    this.cash -= amount;
    return true;
  }

  earn(amount) {
    if (amount > 0) {
      this.cash += amount;
      this.totalEarned += amount;
    }
  }

  takeGreenLoan() {
    if (this.loan >= ECONOMY.maxLoan) {
      return { ok: false, reason: 'Лимит зелёных облигаций исчерпан' };
    }
    this.loan += ECONOMY.loanChunk;
    this.cash += ECONOMY.loanChunk;
    return { ok: true, amount: ECONOMY.loanChunk };
  }

  repayLoan() {
    if (this.loan <= 0) return { ok: false, reason: 'Кредитов нет' };
    const pay = Math.min(this.cash, Math.min(ECONOMY.loanChunk, this.loan));
    if (pay <= 100) return { ok: false, reason: 'Недостаточно средств для погашения' };
    this.cash -= pay;
    this.loan -= pay;
    return { ok: true, amount: pay };
  }

  setWeather(weatherId) {
    if (!WEATHER_MODES[weatherId]) return;
    this.weatherId = weatherId;
    this._applyWeatherToHydro();
  }

  _applyWeatherToHydro() {
    const w = WEATHER_MODES[this.weatherId] || WEATHER_MODES.normal;
    this.hydro.inflowMult = w.inflowMult;
    this.hydro.rainRate = w.rainRate;
  }

  update(dt) {
    this.clock.advance(dt, (step, tick) => this._simulateFixedStep(step, tick));

    let animChanged = false;
    for (let i = 0; i < this.allBuildings.length; i++) {
      const b = this.allBuildings[i];
      if (b.anim < 1.0) {
        b.anim = Math.min(1.0, b.anim + dt * 1.4);
        animChanged = true;
      }
    }
    if (animChanged) this.buildingsDirty = true;
  }

  _simulateFixedStep(step, tick) {
    const hoursPerSec = 24.0 / WORLD.dayLengthSec;
    this.hour += step * hoursPerSec;
    if (this.hour >= 24.0) {
      this.hour -= 24.0;
      this.day += 1;
    }

    if (this._seepageWarnCooldown > 0) this._seepageWarnCooldown -= step;

    this.weatherTimer -= step;
    if (this.weatherTimer <= 0) {
      this.weatherTimer = 40 + this._rng() * 34;
      const cur = WEATHER_MODES[this.weatherId] || WEATHER_MODES.normal;
      const roll = this._rng();
      let acc = 0;
      for (const [nextId, prob] of Object.entries(cur.next)) {
        acc += prob;
        if (roll <= acc) {
          if (nextId !== this.weatherId) {
            this.weatherId = nextId;
            this._applyWeatherToHydro();
            const nw = WEATHER_MODES[nextId];
            if (this.callbacks.onNotify) {
              this.callbacks.onNotify(
                `${nw.icon} Гидропрогноз: ${nw.label} (приток рек ×${nw.inflowMult.toFixed(2)})`,
                nextId === 'flood' ? 'warn' : 'info',
              );
            }
          }
          break;
        }
      }
    }

    this.spotMultiplier = spotTariffMultiplier(this.hour);
    for (let i = 0; i < this.hydro.turbines.length; i++) {
      const t = this.hydro.turbines[i];
      if (t.autoDispatch) {
        const targetThrottle = this.spotMultiplier >= 1.5 ? 1.0
          : (this.spotMultiplier < 0.7 ? 0.32 : 0.74);
        t.throttle += (targetThrottle - t.throttle) * clamp(step * 1.8, 0, 1);
      }
      if (t.cavitation > 0.25) {
        t.condition = Math.max(0.45, t.condition - t.cavitation * 0.0012 * step);
      }
    }

    let genMW = 0;
    let upkeep = 0;
    for (let i = 0; i < this.hydro.turbines.length; i++) {
      const t = this.hydro.turbines[i];
      genMW += t.powerMW;
      upkeep += t.spec.upkeepPerSec;
    }
    upkeep += this.hydro.substations.length * 4;
    this.totalMW = genMW;
    this.totalMWhGenerated += (genMW * step) / 3600;

    // Учёт потерь в длинных ЛЭП долины 768×768 м: с подстанцией ОРУ 110 кВ потери падают с 16% до 3%!
    const hasSubstation = this.hydro.substations.length > 0;
    const lossFraction = hasSubstation
      ? CONSTRUCTION.gridLossWithSub
      : (genMW > 3.0 ? CONSTRUCTION.baseGridLossNoSub : 0.06);
    this.gridLossPct = Math.round(lossFraction * 100);
    const deliveredMW = genMW * (1.0 - lossFraction);
    this.netDeliveredMW = deliveredMW;

    // Инженерное предупреждение о фильтрации под высокой нецементированной плотиной
    if (this.hydro.totalSeepageQ > 2.2 && this._seepageWarnCooldown <= 0) {
      this._seepageWarnCooldown = 36;
      if (this.callbacks.onNotify) {
        this.callbacks.onNotify(
          '▲ Обнаружена фильтрация воды под подошвой плотины! Укрепите створ инструментом [6] Контрфорс / Цементация.',
          'warn',
        );
      }
    }

    if ((tick % 10) === 0) {
      this._checkHydroCityInteractions();
    }

    const h = this.hour;
    const demandCurve = (h >= 17 && h < 22.5) ? 1.32
      : ((h >= 6.5 && h < 11) ? 1.14 : (h < 6 ? 0.74 : 1.0));

    let totalDemand = 0;
    let connectedDemand = 0;
    for (let i = 0; i < this.cities.length; i++) {
      const c = this.cities[i];
      const bCount = c.buildingIndices.length;
      c.currentDemandMW = (c.baseDemandMW + bCount * c.demandPerBuilding) * demandCurve;
      totalDemand += c.currentDemandMW;
      if (c.connected) connectedDemand += c.currentDemandMW;
    }
    this.totalCityDemandMW = totalDemand;
    this.connectedDemandMW = connectedDemand;

    let remainingMW = deliveredMW;
    let suppliedSum = 0;
    let salesRevenuePerSec = 0;

    for (let i = 0; i < this.cities.length; i++) {
      const c = this.cities[i];
      if (!c.connected) {
        c.suppliedMW = 0;
        c.powerRatio = 0;
        c.satisfaction = Math.max(0.35, c.satisfaction - step * 0.01);
        continue;
      }

      const giveMW = Math.min(c.currentDemandMW, remainingMW);
      remainingMW = Math.max(0, remainingMW - giveMW);
      c.suppliedMW = giveMW;
      c.powerRatio = c.currentDemandMW > 1e-4 ? clamp(giveMW / c.currentDemandMW, 0, 1) : 1;
      suppliedSum += giveMW;

      salesRevenuePerSec += c.suppliedMW * ECONOMY.baseRatePerMWSec * this.spotMultiplier * c.tariffBonus;

      if (c.powerRatio >= 0.55 && !c.isFlooded) {
        c.blackoutTimer = 0;
        c.satisfaction = Math.min(1.0, c.satisfaction + step * 0.05);

        const irrMult = (c.needsIrrigation && c.irrigated) ? 1.78 : 1.0;
        const speedByPower = 0.36 + 0.96 * c.powerRatio;
        c.growthProgress += (step / 14.0) * speedByPower * irrMult;

        if (c.growthProgress >= 1.0) {
          c.growthProgress -= 1.0;
          this._growCityOneStep(c);
        }
      } else {
        c.satisfaction = Math.max(0.15, c.satisfaction - step * (c.isFlooded ? 0.08 : 0.025));
        if (genMW > 0.05 && c.powerRatio < 0.4) {
          c.blackoutTimer += step;
        }
      }
    }

    const surplusMW = Math.max(0, deliveredMW - suppliedSum);
    const hasGridLink = this.cities.some((c) => c.connected);
    this.exportedMW = hasGridLink ? surplusMW : 0;
    if (this.exportedMW > 0) {
      salesRevenuePerSec += this.exportedMW * ECONOMY.baseRatePerMWSec * this.spotMultiplier * ECONOMY.overSupplyExportFactor;
    }

    if (this.agroIrrigated) {
      salesRevenuePerSec += ECONOMY.irrigationBonusPerSec;
    }

    const loanInterest = this.loan * ECONOMY.loanInterestPerSec;
    this.suppliedCityMW = suppliedSum;
    this.incomePerSec = salesRevenuePerSec;
    this.upkeepPerSec = upkeep + loanInterest;
    this.netPerSec = this.incomePerSec - this.upkeepPerSec;

    const deltaCash = this.netPerSec * step;
    if (deltaCash >= 0) {
      this.earn(deltaCash);
    } else if (!this.creative) {
      this.cash = Math.max(0, this.cash + deltaCash);
    }

    if ((tick % 15) === 0) {
      this._checkMilestones();
    }
  }

  _checkHydroCityInteractions() {
    for (let i = 0; i < this.cities.length; i++) {
      const c = this.cities[i];

      let wetLots = 0;
      const checkStep = Math.max(1, Math.floor(c.lots.length / 8));
      let checked = 0;
      for (let k = 0; k < c.lots.length; k += checkStep) {
        const s = this.hydro.sampleAtWorld(c.lots[k].wx, c.lots[k].wz);
        checked++;
        if (s.depth > 0.44) wetLots++;
      }
      const wasFlooded = c.isFlooded;
      c.isFlooded = checked > 0 && (wetLots / checked) >= 0.25;
      if (c.isFlooded && !wasFlooded && this.callbacks.onNotify) {
        this.callbacks.onNotify(`! Внимание! Подтоплены улицы г. ${c.name}! Откройте водосброс или насыпьте дамбу!`, 'danger');
      }

      if (c.needsIrrigation && c.irrigationTarget) {
        const t = c.irrigationTarget;
        let wetIrr = false;
        const offsets = [[0, 0], [-12, -8], [12, 8], [-10, 10], [10, -10]];
        for (let o = 0; o < offsets.length; o++) {
          const s = this.hydro.sampleAtWorld(t.x + offsets[o][0], t.z + offsets[o][1]);
          if (s.depth > 0.16) {
            wetIrr = true;
            break;
          }
        }
        if (wetIrr && !c.irrigated) {
          c.irrigated = true;
          this.agroIrrigated = true;
          if (this.callbacks.onNotify) {
            this.callbacks.onNotify('◈ Вода пришла в оросительный бассейн Агродолины! Поля и теплицы пошли в бурный рост!', 'good');
          }
        } else if (!wetIrr && c.irrigated) {
          c.irrigated = false;
          this.agroIrrigated = false;
        }
      }
    }
  }

  _growCityOneStep(city) {
    const freeLot = city.lots.find((l) => !l.occupied);
    if (freeLot) {
      const newB = this._spawnBuildingInCity(city, freeLot, 0.05, this._rng);
      const popGain = newB.kind === 'skyscraper' ? 260
        : (newB.kind === 'apartment' ? 150 : (newB.kind === 'factory' ? 115 : 72));
      city.population += popGain;
      const prevLevel = city.level;
      this._recalcCityTier(city);
      if (city.level > prevLevel && this.callbacks.onNotify) {
        this.callbacks.onNotify(
          `★ ${city.name} вырос до статуса «${city.levelName}» (${city.population.toLocaleString('ru-RU')} жит.)!`,
          'good',
        );
      }
      return;
    }

    for (let k = 0; k < city.buildingIndices.length; k++) {
      const b = this.allBuildings[city.buildingIndices[k]];
      if (b.kind === 'cottage' || b.kind === 'townhouse') {
        b.kind = city.archetype === 'industrial' ? 'factory' : 'apartment';
        b.sy = Math.min(28, b.sy * 2.1);
        b.sx *= 1.15;
        b.sz *= 1.15;
        b.anim = 0.35;
        city.population += 180;
        this.buildingsDirty = true;
        return;
      }
      if (b.kind === 'apartment' && b.sy < 24) {
        b.kind = 'skyscraper';
        b.sy = Math.min(34, b.sy * 1.65);
        b.anim = 0.45;
        city.population += 240;
        this.buildingsDirty = true;
        return;
      }
    }
  }

  _checkMilestones() {
    const totalPop = this.cities.reduce((s, c) => s + c.population, 0);
    const connectedCount = this.cities.filter((c) => c.connected).length;
    const state = {
      totalMW: this.totalMW,
      excavatedM3: this.hydro.totalExcavatedM3,
      agroIrrigated: this.agroIrrigated,
      connectedCities: connectedCount,
      totalPopulation: totalPop,
      reinforcedCells: this.hydro.reinforcedCellCount,
      substations: this.hydro.substations.length,
    };

    for (let i = 0; i < MILESTONES.length; i++) {
      const m = MILESTONES[i];
      if (this.completedMilestones.has(m.id)) continue;
      if (m.check(state)) {
        this.completedMilestones.add(m.id);
        this.earn(m.reward);
        if (this.callbacks.onMilestone) {
          this.callbacks.onMilestone(m);
        }
      }
    }
  }

  getSummary() {
    const totalPop = this.cities.reduce((s, c) => s + c.population, 0);
    const period = spotPeriodLabel(this.hour);
    return {
      cash: this.cash,
      loan: this.loan,
      day: this.day,
      hour: this.hour,
      weather: WEATHER_MODES[this.weatherId] || WEATHER_MODES.normal,
      spotMultiplier: this.spotMultiplier,
      periodLabel: period.label,
      periodClass: period.cls,
      totalMW: this.totalMW,
      netDeliveredMW: this.netDeliveredMW,
      gridLossPct: this.gridLossPct,
      connectedDemandMW: this.connectedDemandMW,
      totalCityDemandMW: this.totalCityDemandMW,
      suppliedCityMW: this.suppliedCityMW,
      exportedMW: this.exportedMW,
      incomePerSec: this.incomePerSec,
      upkeepPerSec: this.upkeepPerSec,
      netPerSec: this.netPerSec,
      totalPopulation: totalPop,
      soilStockpileM3: this.hydro.soilStockpileM3,
      rockStockpileM3: this.hydro.rockStockpileM3,
      pendingPourM3: this.hydro.pendingPourVolumeM3,
      maxDamStress: this.hydro.maxDamStress,
      seepageQ: this.hydro.totalSeepageQ,
      agroIrrigated: this.agroIrrigated,
      substationsCount: this.hydro.substations.length,
    };
  }
}
