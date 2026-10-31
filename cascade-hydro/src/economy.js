// ============================================================================
//  ЭКОНОМИКА ГЭС, ЭНЕРГОРЫНОК И САМОРАЗВИВАЮЩИЕСЯ ГОРОДА
//  Работает на фиксированном шаге FixedClock (ядро «Переплёт» 30 Гц)
// ============================================================================

import { FixedClock } from '../../pereplet-prototype/clock.mjs';
import {
  WORLD,
  ECONOMY,
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

    // Фиксированный шаг 1/30 с из ядра «Переплёт» (не теряет накопленное время)
    this.clock = new FixedClock({ step: 1 / 30, maxSteps: 6 });

    this.cash = ECONOMY.startingCash;
    this.loan = 0;
    this.creative = false;

    // Время суток: старт в 08:00 утра (утренний пик тарифа — отличный старт!)
    this.day = 1;
    this.hour = 8.0;
    this.weatherId = 'normal';
    this.weatherTimer = 52;
    this._rng = makeRng(987654);

    // Сводные показатели энергосистемы
    this.totalMW = 0;
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

    // Выполненные гранты
    this.completedMilestones = new Set();

    // Города и их здания
    this.cities = [];
    this.allBuildings = []; // плоский список для InstancedMesh рендерера
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

      // Генерируем до 58 строительных участков по квартальной сетке + кольцам
      const lots = [];
      for (let ring = 1; ring <= 5; ring++) {
        const countInRing = ring * 6 + 2;
        const baseR = 8.5 + (ring - 1) * 8.6;
        for (let k = 0; k < countInRing; k++) {
          if (lots.length >= 58) break;
          const ang = (k / countInRing) * Math.PI * 2 + ring * 0.43 + (rng() - 0.5) * 0.16;
          const r = baseR + (rng() - 0.5) * 2.2;
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
        satisfaction: 0.75,
        powerRatio: def.connectedAtStart ? 0 : 0,
        currentDemandMW: def.baseDemandMW,
        suppliedMW: 0,
        growthProgress: 0.15,
        isFlooded: false,
        irrigated: false,
        lots,
        buildingIndices: [],
        blackoutTimer: 0,
      };

      // Стартовая застройка центра города
      const initialBuildings = cIdx === 3 ? 13 : (cIdx === 2 ? 10 : 8);
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
    if (city.archetype === 'agro' && ring >= 3 && rng() < 0.52) {
      return 'greenhouse';
    }
    if (city.archetype === 'industrial' && ring >= 2 && rng() < 0.42) {
      return 'factory';
    }
    if (city.archetype === 'metropolis' && ring <= 2 && city.level >= 3 && rng() < 0.65) {
      return 'skyscraper';
    }
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

    let sx = 4.2, sy = 3.6, sz = 4.2;
    if (kind === 'cottage') {
      sx = 3.8 + rng() * 1.2;
      sy = 2.8 + rng() * 1.1;
      sz = 3.8 + rng() * 1.2;
    } else if (kind === 'townhouse') {
      sx = 4.8 + rng() * 1.5;
      sy = 5.4 + rng() * 2.2;
      sz = 4.4 + rng() * 1.2;
    } else if (kind === 'apartment') {
      sx = 5.6 + rng() * 1.8;
      sy = 10.5 + rng() * 6.5;
      sz = 5.2 + rng() * 1.6;
    } else if (kind === 'factory') {
      sx = 7.4 + rng() * 2.2;
      sy = 5.8 + rng() * 2.4;
      sz = 6.2 + rng() * 2.0;
    } else if (kind === 'greenhouse') {
      sx = 6.8 + rng() * 2.0;
      sy = 2.6 + rng() * 0.8;
      sz = 4.8 + rng() * 1.4;
    } else if (kind === 'skyscraper') {
      sx = 6.4 + rng() * 1.8;
      sy = 18.0 + rng() * 13.0;
      sz = 6.4 + rng() * 1.8;
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
      anim: initialAnim, // 0..1 плавный рост из фундамента
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

  /** Подключение города линией ЛЭП 110 кВ */
  connectCityGrid(cityId) {
    const city = this.cities.find((c) => c.id === cityId);
    if (!city) return { ok: false, reason: 'Город не найден' };
    if (city.connected) return { ok: false, reason: 'Город уже подключён к энергосети' };

    const cost = this.estimatePowerLineCost(city);
    if (!this.creative && this.cash < cost) {
      return { ok: false, reason: `Нужно ${cost.toLocaleString('ru-RU')} ₽ на строительство ЛЭП` };
    }
    if (!this.creative) this.cash -= cost;
    city.connected = true;
    this.powerLinesDirty = true;
    if (this.callbacks.onNotify) {
      this.callbacks.onNotify(`⚡ ЛЭП 110 кВ подключена к г. ${city.name}! Спрос сети вырос.`, 'good');
    }
    return { ok: true, cost, city };
  }

  estimatePowerLineCost(city) {
    // Считаем расстояние от ближайшей турбины или центра створа (10, -110)
    let bestDist = Math.hypot(city.x - 10, city.z - (-110));
    for (const t of this.hydro.turbines) {
      const d = Math.hypot(city.x - t.wx, city.z - t.wz);
      if (d < bestDist) bestDist = d;
    }
    return Math.max(1800, Math.round(bestDist * 14));
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

  /** Продвижение экономики и роста городов через FixedClock («Переплёт») */
  update(dt) {
    this.clock.advance(dt, (step, tick) => this._simulateFixedStep(step, tick));

    // Плавная анимация достройки новых зданий между фиксированными шагами
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
    // 1. Суточные часы и смена погоды
    const hoursPerSec = 24.0 / WORLD.dayLengthSec;
    this.hour += step * hoursPerSec;
    if (this.hour >= 24.0) {
      this.hour -= 24.0;
      this.day += 1;
    }

    this.weatherTimer -= step;
    if (this.weatherTimer <= 0) {
      this.weatherTimer = 38 + this._rng() * 32;
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

    // 2. Авто-диспетчеризация турбин по суточному тарифу (если включена на агрегате)
    this.spotMultiplier = spotTariffMultiplier(this.hour);
    for (let i = 0; i < this.hydro.turbines.length; i++) {
      const t = this.hydro.turbines[i];
      if (t.autoDispatch) {
        // Ночью прижимаем затворы и копим водохранилище, в пик открываем на 100%!
        const targetThrottle = this.spotMultiplier >= 1.5 ? 1.0
          : (this.spotMultiplier < 0.7 ? 0.32 : 0.72);
        t.throttle += (targetThrottle - t.throttle) * clamp(step * 1.8, 0, 1);
      }
      // Медленный износ при сильной кавитации
      if (t.cavitation > 0.25) {
        t.condition = Math.max(0.45, t.condition - t.cavitation * 0.0012 * step);
      }
    }

    // 3. Суммарная выработка ГЭС и эксплуатационные расходы
    let genMW = 0;
    let upkeep = 0;
    for (let i = 0; i < this.hydro.turbines.length; i++) {
      const t = this.hydro.turbines[i];
      genMW += t.powerMW;
      upkeep += t.spec.upkeepPerSec;
    }
    this.totalMW = genMW;
    this.totalMWhGenerated += (genMW * step) / 3600;

    // 4. Проверка орошения Агродолины и подтопления городов (раз в 10 тиков = 3 раза/сек)
    if ((tick % 10) === 0) {
      this._checkHydroCityInteractions();
    }

    // 5. Суточный профиль спроса городов и распределение энергии
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

    // Распределяем выработку между подключёнными городами в порядке приоритета (чтобы малые города росли сразу, а не падали все вместе!)
    let remainingMW = genMW;
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

      // Доход от продажи энергии городу с учётом суточного спот-тарифа и бонуса города
      salesRevenuePerSec += c.suppliedMW * ECONOMY.baseRatePerMWSec * this.spotMultiplier * c.tariffBonus;

      // Рост города! При обеспеченности энергией >= 55% и без затопления город активно строит новые кварталы:
      if (c.powerRatio >= 0.55 && !c.isFlooded) {
        c.blackoutTimer = 0;
        c.satisfaction = Math.min(1.0, c.satisfaction + step * 0.05);

        const irrMult = (c.needsIrrigation && c.irrigated) ? 1.75 : 1.0;
        const speedByPower = 0.35 + 0.95 * c.powerRatio;
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

    // Излишки мощности (или вся генерация при наличии хотя бы одного подключения к сети) экспортируются в межрегиональную сеть
    const surplusMW = Math.max(0, genMW - suppliedSum);
    const hasGridLink = this.cities.some((c) => c.connected);
    this.exportedMW = hasGridLink ? surplusMW : 0;
    if (this.exportedMW > 0) {
      salesRevenuePerSec += this.exportedMW * ECONOMY.baseRatePerMWSec * this.spotMultiplier * ECONOMY.overSupplyExportFactor;
    }

    // Доход от водоканала при орошении Агродолины
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

    // 6. Проверка государственных грантов и вех раз в 15 тиков
    if ((tick % 15) === 0) {
      this._checkMilestones();
    }
  }

  _checkHydroCityInteractions() {
    for (let i = 0; i < this.cities.length; i++) {
      const c = this.cities[i];

      // Проверяем подтопление центра и кварталов
      let wetLots = 0;
      const checkStep = Math.max(1, Math.floor(c.lots.length / 8));
      let checked = 0;
      for (let k = 0; k < c.lots.length; k += checkStep) {
        const s = this.hydro.sampleAtWorld(c.lots[k].wx, c.lots[k].wz);
        checked++;
        if (s.depth > 0.42) wetLots++;
      }
      const wasFlooded = c.isFlooded;
      c.isFlooded = checked > 0 && (wetLots / checked) >= 0.25;
      if (c.isFlooded && !wasFlooded && this.callbacks.onNotify) {
        this.callbacks.onNotify(`! Внимание! Подтоплены улицы г. ${c.name}! Откройте водосброс или насыпьте дамбу!`, 'danger');
      }

      // Проверяем приход воды по оросительному каналу в Агродолину
      if (c.needsIrrigation && c.irrigationTarget) {
        const t = c.irrigationTarget;
        let wetIrr = false;
        const offsets = [[0, 0], [-10, -6], [10, 6], [-8, 8], [8, -8]];
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
    // Сначала ищем свободный участок под новую застройку
    const freeLot = city.lots.find((l) => !l.occupied);
    if (freeLot) {
      const newB = this._spawnBuildingInCity(city, freeLot, 0.05, this._rng);
      const popGain = newB.kind === 'skyscraper' ? 260
        : (newB.kind === 'apartment' ? 150 : (newB.kind === 'factory' ? 110 : 70));
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

    // Если все участки заняты — реконструируем старое малоэтажное здание в высотку/башню!
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
      connectedDemandMW: this.connectedDemandMW,
      totalCityDemandMW: this.totalCityDemandMW,
      suppliedCityMW: this.suppliedCityMW,
      exportedMW: this.exportedMW,
      incomePerSec: this.incomePerSec,
      upkeepPerSec: this.upkeepPerSec,
      netPerSec: this.netPerSec,
      totalPopulation: totalPop,
      soilStockpileM3: this.hydro.soilStockpileM3,
      agroIrrigated: this.agroIrrigated,
    };
  }
}
