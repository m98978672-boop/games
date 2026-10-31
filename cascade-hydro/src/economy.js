// ============================================================================
//  ЭКОНОМИКА ГЭС/ГАЭС, 12 ВИДОВ ДОХОДА, НАУЧНЫЙ БАЛАНС ВОДЫ И 8 ГОРОДОВ (32 ТИПА ЗДАНИЙ)
//  Работает на фиксированном шаге FixedClock (ядро «Переплёт» 30 Гц)
// ============================================================================

import { FixedClock } from '../../pereplet-prototype/clock.mjs';
import {
  WORLD,
  ECONOMY,
  CONSTRUCTION,
  CITY_DEFS,
  BUILDING_ARCHETYPES,
  MILESTONES,
  WEATHER_MODES,
  spotTariffMultiplier,
  spotPeriodLabel,
} from './config.js';
import { clamp, makeRng } from './noise.js';
import { HydrologicalBalanceEngine } from './hydrology-science.js';
import { pickCatalogShade } from './textures.js';
import { RoadNetworkSimulation } from './roads-and-cities.js';

export const REVENUE_STREAM_DEFS = [
  { id: 'spotEnergy',      label: 'Спотовый рынок ОРЭМ (пики МВт·ч)',     color: '#fbbf24' },
  { id: 'industrialPPA',   label: 'Прямые контракты (Алюминий + ЦОД ИИ)', color: '#38bdf8' },
  { id: 'capacityMarket',  label: 'Маневренная мощность АРЧМ (50 Гц)',    color: '#a78bfa' },
  { id: 'gaesArbitrage',   label: 'Ценовой арбитраж ГАЭС (ночь → пик)',   color: '#2dd4bf' },
  { id: 'navigationLocks', label: 'Судоходные шлюзы и речной флот',       color: '#60a5fa' },
  { id: 'waterSupply',     label: 'Горводоканал и техводоснабжение',      color: '#34d399' },
  { id: 'agroIrrigation',  label: 'Агро-ирригация полей и теплиц',        color: '#84cc16' },
  { id: 'aquaculture',     label: 'Форелевые рыбхозы и аквакультура',     color: '#fb923c' },
  { id: 'ecoTourism',      label: 'Яхт-марины и круизный эко-туризм',     color: '#f472b6' },
  { id: 'aggregateSales',  label: 'Экспорт гранитного щебня с выемок',    color: '#cbd5e1' },
  { id: 'carbonCredits',   label: 'Зелёные углеродные сертификаты CO₂',   color: '#4ade80' },
  { id: 'floodControl',    label: 'Премия МЧС за срезку паводков',        color: '#f87171' },
];

export class EconomyAndCities {
  constructor(hydro, callbacks = {}) {
    this.hydro = hydro;
    this.callbacks = callbacks;

    this.clock = new FixedClock({ step: 1 / 30, maxSteps: 6 });
    this._rng = makeRng(987654);
    this.hydrology = new HydrologicalBalanceEngine();
    this.roadNetwork = new RoadNetworkSimulation();

    this.resetEconomy();
  }

  resetEconomy() {
    this.cash = ECONOMY.startingCash;
    this.loan = 0;
    this.creative = false;

    this.day = 1;
    this.hour = 8.5;
    this.weatherId = 'normal';
    this.weatherTimer = 54;

    this.totalMW = 0;
    this.pumpedConsumeMW = 0;
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
    this.totalCO2SavedTons = 0;
    this.agroIrrigated = false;
    this._seepageWarnCooldown = 0;
    this._gaesStoredMWh = 0;

    // 12 источников дохода (мгновенный ₽/с и накопленный ₽ за сессию)
    this.revenueRates = {};
    this.revenueTotals = {};
    for (const def of REVENUE_STREAM_DEFS) {
      this.revenueRates[def.id] = 0;
      this.revenueTotals[def.id] = 0;
    }

    this.completedMilestones = new Set();
    this.hydrology.reset();

    this.cities = [];
    this.allBuildings = [];
    this.buildingsDirty = true;
    this.powerLinesDirty = true;

    this._initCities();
    this.roadNetwork.rebuildRoutes(this.hydro, this.cities);
    this._applyWeatherToHydro();
  }

  _initCities() {
    this.cities = [];
    this.allBuildings = [];
    const lotScale = WORLD.horizScale;

    for (let cIdx = 0; cIdx < CITY_DEFS.length; cIdx++) {
      const def = CITY_DEFS[cIdx];
      const rng = makeRng(1000 + cIdx * 777);

      const lots = [];
      for (let ring = 1; ring <= 6; ring++) {
        const countInRing = ring * 6 + 4;
        const baseR = (8.5 + (ring - 1) * 8.4) * lotScale;
        for (let k = 0; k < countInRing; k++) {
          if (lots.length >= 78) break;
          const ang = (k / countInRing) * Math.PI * 2 + ring * 0.43 + (rng() - 0.5) * 0.16;
          const r = baseR + (rng() - 0.5) * 2.2 * lotScale;
          if (r > def.plateauRadius * 0.92) continue;
          const lx = def.x + Math.cos(ang) * r;
          const lz = def.z + Math.sin(ang) * r;
          if (Math.abs(lx) > WORLD.half * 0.94 || Math.abs(lz) > WORLD.half * 0.94) continue;
          const sample = this.hydro.sampleAtWorld(lx, lz);
          if (sample.depth > 0.25) continue;
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
        satisfaction: 0.78,
        powerRatio: 0,
        currentDemandMW: def.baseDemandMW,
        suppliedMW: 0,
        growthProgress: 0.18,
        isFlooded: false,
        irrigated: false,
        lots,
        buildingIndices: [],
        blackoutTimer: 0,
        activeBuildCount: 0,
        currentProjectLabel: '',
        builtStreetRings: 1,
        connectedRoadsCount: 0,
      };

      // Стартовое историческое ядро (5–7 готовых зданий) + сразу 2 активные стройплощадки с кранами и лесами!
      const starterFinished = def.archetype === 'metropolis' ? 7
        : (def.archetype === 'industrial' || def.archetype === 'smelter' ? 6 : 5);
      for (let b = 0; b < starterFinished && b < lots.length; b++) {
        this._spawnBuildingInCity(city, lots[b], 1.0, rng);
      }
      if (starterFinished < lots.length) {
        const b1 = this._spawnBuildingInCity(city, lots[starterFinished], 0.52, rng);
        city.activeBuildCount++;
        city.currentProjectLabel = `${b1.label} (52%)`;
      }
      if (starterFinished + 1 < lots.length) {
        this._spawnBuildingInCity(city, lots[starterFinished + 1], 0.14, rng);
        city.activeBuildCount++;
      }
      this._recalcCityTier(city);
      this.cities.push(city);
    }

    this.buildingsDirty = true;
    this.powerLinesDirty = true;
  }

  /** Подбирает один из 48 архитектурных и строительных типов зданий под специализацию города и район */
  _chooseBuildingArchetype(city, ring, rng) {
    const allowedByArchetype = {
      town:       ['res', 'mid', 'civ', 'util', 'bld', 'ind'],
      metropolis: ['res', 'mid', 'high', 'civ', 'util', 'sci', 'bld'],
      civic:      ['res', 'mid', 'high', 'civ', 'util', 'sci'],
      industrial: ['ind', 'bld', 'mid', 'res', 'util', 'civ'],
      industry:   ['ind', 'bld', 'mid', 'res', 'util', 'civ'],
      agro:       ['agro', 'res', 'util', 'bld', 'civ'],
      science:    ['sci', 'res', 'civ', 'mid', 'util'],
      alpine:     ['res', 'civ', 'sci', 'port'],
      smelter:    ['smlt', 'ind', 'bld', 'util', 'mid'],
      datacenter: ['dc', 'sci', 'high', 'mid', 'civ'],
      tech:       ['dc', 'sci', 'high', 'mid', 'civ'],
      port:       ['port', 'bld', 'mid', 'res', 'ind', 'civ'],
      resort:     ['port', 'res', 'civ', 'mid'],
    };
    const allowedCats = allowedByArchetype[city.archetype] || ['res', 'mid', 'civ', 'bld'];
    const pool = BUILDING_ARCHETYPES.filter((a) => allowedCats.includes(a.cat));
    if (pool.length === 0) return BUILDING_ARCHETYPES[0];

    // В центре мегаполиса и технопарка предпочитаем высотки и общественные доминанты
    if (ring <= 2 && city.level >= 2) {
      const corePool = pool.filter((a) => a.hMax >= 22 || a.shape === 'spire' || a.shape === 'tower' || a.cat === 'dc');
      if (corePool.length > 0 && rng() < 0.65) {
        return corePool[Math.floor(rng() * corePool.length)];
      }
    }
    // На внешних кольцах промзон и городов чаще размещаем строительные комбинаты БСУ/ДСК/склады ЖБИ
    if (ring >= 2 && rng() < 0.26) {
      const bldPool = pool.filter((a) => a.cat === 'bld');
      if (bldPool.length > 0) {
        return bldPool[Math.floor(rng() * bldPool.length)];
      }
    }
    return pool[Math.floor(rng() * pool.length)];
  }

  _spawnBuildingInCity(city, lot, initialAnim = 0.05, rng = this._rng) {
    lot.occupied = true;
    const arch = this._chooseBuildingArchetype(city, lot.ring, rng);
    const bScale = Math.pow(WORLD.horizScale, 0.56);
    const hScale = Math.pow(WORLD.elevScale, 0.68);

    const sx = (arch.w * (0.86 + rng() * 0.28)) * bScale;
    const sz = (arch.d * (0.86 + rng() * 0.28)) * bScale;
    const sy = (arch.hMin + rng() * (arch.hMax - arch.hMin)) * hScale;

    const shade = pickCatalogShade('city_facades', Math.floor(rng() * 1000) + this.allBuildings.length * 7);
    const roofShade = pickCatalogShade('roofs_metals', Math.floor(rng() * 1000) + this.allBuildings.length * 13);

    const roofType = (arch.shape === 'cyl' || arch.shape === 'cool')
      ? 'silo'
      : ((arch.shape === 'arch' || arch.shape === 'spire')
        ? 'dome'
        : (arch.shape === 'gable' ? 'gable' : 'flat'));

    const popByCat = {
      res: 28, mid: 135, high: 380, civ: 45, agro: 22, ind: 34, bld: 38, smlt: 40, dc: 26, port: 48, util: 18, sci: 36,
    };

    const sample = this.hydro.sampleAtWorld(lot.wx, lot.wz);
    const bIdx = this.allBuildings.length;
    const bObj = {
      index: bIdx,
      cityId: city.id,
      kind: arch.id,
      cat: arch.cat,
      label: arch.name,
      roofType,
      styleId: arch.style % 64, // 0..63 тайл 1024×1024 мега-атласа фасадов!
      shadeHex: shade.hex,
      shadeR: shade.r,
      shadeG: shade.g,
      shadeB: shade.b,
      roofR: roofShade.r,
      roofG: roofShade.g,
      roofB: roofShade.b,
      wx: lot.wx,
      wy: sample.bed,
      wz: lot.wz,
      yaw: lot.yaw,
      sx,
      sy,
      sz,
      popGain: popByCat[arch.cat] || 40,
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
    if (n >= 46) {
      city.level = 5;
      city.levelName = 'Мегаполис';
    } else if (n >= 32) {
      city.level = 4;
      city.levelName = 'Крупный узел';
    } else if (n >= 21) {
      city.level = 3;
      city.levelName = 'Развитый город';
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
      return { ok: false, reason: `Нужно ${cost.toLocaleString('ru-RU')} ₽ на строительство ЛЭП` };
    }
    if (!this.creative) this.cash -= cost;
    city.connected = true;
    this.powerLinesDirty = true;
    if (this.callbacks.onNotify) {
      this.callbacks.onNotify(`✦ Магистраль ЛЭП подключена к: ${city.name}!`, 'good');
    }
    return { ok: true, cost, city };
  }

  estimatePowerLineCost(city) {
    let bestDist = Math.hypot(city.x - 12 * WORLD.horizScale, city.z - (-152 * WORLD.horizScale));
    for (const sub of this.hydro.substations) {
      const d = Math.hypot(city.x - sub.wx, city.z - sub.wz);
      if (d < bestDist) bestDist = d;
    }
    for (const t of this.hydro.turbines) {
      const d = Math.hypot(city.x - t.wx, city.z - t.wz);
      if (d < bestDist) bestDist = d;
    }
    // Нормируем погонную стоимость ЛЭП к масштабу карты
    const normDist = bestDist / WORLD.horizScale;
    return Math.max(1900, Math.round(normDist * 13.5));
  }

  /** Разовая оптовая продажа добытого гранитного щебня строительным трестам */
  sellAggregateBatch() {
    const availNorm = this.hydro.rockStockpileM3 * this.hydro.volPriceNorm;
    if (availNorm < 40) {
      return { ok: false, reason: 'На складе мало щебня — проройте канал или скальную выемку!' };
    }
    const sellFraction = 0.65;
    const soldRawM3 = this.hydro.rockStockpileM3 * sellFraction;
    const soldNormM3 = availNorm * sellFraction;
    this.hydro.rockStockpileM3 -= soldRawM3;
    const revenue = Math.round(soldNormM3 * ECONOMY.aggregateSellPricePerM3 * 3.2);
    this.earn(revenue);
    this.revenueTotals.aggregateSales += revenue;
    return { ok: true, soldM3: Math.round(soldRawM3), revenue };
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

    // Реальная поэтапная стройка междугородних дорог и мостов
    this.roadNetwork.step(dt, this);

    // Реальная поэтапная 3D-стройка зданий в городах (котлован -> леса и кран -> этажи -> кровля)
    const cityMap = new Map();
    for (let c = 0; c < this.cities.length; c++) {
      const city = this.cities[c];
      city.activeBuildCount = 0;
      city.currentProjectLabel = '';
      cityMap.set(city.id, city);
    }

    let animChanged = false;
    const plantCount = this.hydro.concretePlants ? this.hydro.concretePlants.length : 0;
    const plantCitySpeed = 1.0 + Math.min(0.75, plantCount * 0.38);
    for (let i = 0; i < this.allBuildings.length; i++) {
      const b = this.allBuildings[i];
      if (b.anim < 1.0) {
        const city = cityMap.get(b.cityId);
        const poweredBoost = (city && city.connected && city.powerRatio >= 0.45) ? 1.85 : 1.0;
        const buildRate = this.creative ? 0.45 : (0.072 * poweredBoost * plantCitySpeed);
        b.anim = Math.min(1.0, b.anim + dt * buildRate);
        animChanged = true;
        if (b.anim < 0.995 && city) {
          city.activeBuildCount++;
          if (!city.currentProjectLabel) {
            city.currentProjectLabel = `${b.label} (${Math.round(b.anim * 100)}%)`;
          }
        }
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

    // 1. Погодный цикл
    this.weatherTimer -= step;
    if (this.weatherTimer <= 0) {
      this.weatherTimer = 42 + this._rng() * 34;
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

    // 2. Передаём флаг ночного минимума для обратимых насос-турбин ГАЭС
    this.spotMultiplier = spotTariffMultiplier(this.hour);
    this.hydro.isOffPeakNight = (this.hour >= 0.2 && this.hour < 5.8);

    // 3. Научный водный баланс (таяние ледников днём, испарение с зеркала, фильтрация, водозабор)
    const connectedCount = this.cities.filter((c) => c.connected).length;
    this.hydrology.step(step, this.hydro, this.hour, this.weatherId, connectedCount, this.agroIrrigated);

    // 4. Автодиспетчер и износ гидроагрегатов
    for (let i = 0; i < this.hydro.turbines.length; i++) {
      const t = this.hydro.turbines[i];
      if (t.autoDispatch && !t.isPumpingNow) {
        const targetThrottle = this.spotMultiplier >= 1.45 ? 1.0
          : (this.spotMultiplier < 0.7 ? 0.28 : 0.76);
        t.throttle += (targetThrottle - t.throttle) * clamp(step * 1.8, 0, 1);
      }
      if (t.cavitation > 0.25) {
        t.condition = Math.max(0.45, t.condition - t.cavitation * 0.0012 * step);
      }
    }

    let genMW = 0;
    let pumpMW = 0;
    let ratedCapacitySumMW = 0;
    let upkeep = 0;
    for (let i = 0; i < this.hydro.turbines.length; i++) {
      const t = this.hydro.turbines[i];
      genMW += t.powerMW;
      pumpMW += t.pumpConsumeMW || 0;
      if (t.grossHead > t.spec.minHead * 0.5 || t.isPumpingNow) {
        ratedCapacitySumMW += t.spec.ratedMW;
      }
      upkeep += t.spec.upkeepPerSec;
    }
    // Ветро-метеокомплексы ВЭС [W] добавляют чистую ветровую мощность в общую энергосистему!
    const windMW = this.hydro.totalWindPowerMW || 0;
    const windCount = this.hydro.windMeteoStations ? this.hydro.windMeteoStations.length : 0;
    const concretePlantCount = this.hydro.concretePlants ? this.hydro.concretePlants.length : 0;
    const pumpStationCount = this.hydro.pumpStations ? this.hydro.pumpStations.length : 0;

    genMW += windMW;
    ratedCapacitySumMW += windCount * 2.4 * WORLD.powerScale;

    upkeep += this.hydro.substations.length * 4;
    upkeep += this.hydro.navLocks.length * 3;
    upkeep += this.hydro.fishFarms.length * 2;
    upkeep += concretePlantCount * 4;
    upkeep += pumpStationCount * 3;
    upkeep += windCount * 3;

    this.totalMW = genMW;
    this.pumpedConsumeMW = pumpMW;
    const stepMWh = (genMW * step) / 3600;
    this.totalMWhGenerated += stepMWh;
    this.totalCO2SavedTons += stepMWh * 0.82 * 120; // в игровом масштабе времени

    // Нормализуем МВт к экономическому масштабу, чтобы на 5×5 и 10×10 км баланс доходов был плавным и интересным!
    const mwEconFactor = 1.0 / Math.pow(WORLD.powerScale, 0.72);

    const hasSubstation = this.hydro.substations.length > 0;
    const lossFraction = hasSubstation
      ? CONSTRUCTION.gridLossWithSub
      : (genMW > 3.0 * WORLD.powerScale ? CONSTRUCTION.baseGridLossNoSub : 0.06);
    this.gridLossPct = Math.round(lossFraction * 100);
    const deliveredMW = genMW * (1.0 - lossFraction);
    this.netDeliveredMW = deliveredMW;

    if (this.hydro.totalSeepageQ > 2.2 * WORLD.flowScale && this._seepageWarnCooldown <= 0) {
      this._seepageWarnCooldown = 38;
      if (this.callbacks.onNotify) {
        this.callbacks.onNotify(
          '▲ Фильтрация Дарси под подошвой высокой плотины! Укрепите створ инструментом [6] Контрфорс / Цементация.',
          'warn',
        );
      }
    }

    if ((tick % 10) === 0) {
      this._checkHydroCityInteractions();
    }

    // 5. Суточная кривая энергопотребления 8 городов и распределение мощности
    const h = this.hour;
    const demandCurve = (h >= 17 && h < 22.5) ? 1.32
      : ((h >= 6.5 && h < 11) ? 1.15 : (h < 6 ? 0.74 : 1.0));

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

    let suppliedSum = 0;
    let rSpotEnergy = 0;
    let rIndustrialPPA = 0;
    let anyFlooded = false;

    // Умная пропорционально-приоритетная диспетчеризация сети (без голодания городов в конце списка!)
    const supplyCoverage = connectedDemand > 1e-4 ? clamp(deliveredMW / connectedDemand, 0, 1) : 1;

    for (let i = 0; i < this.cities.length; i++) {
      const c = this.cities[i];
      if (c.isFlooded) anyFlooded = true;
      if (!c.connected) {
        c.suppliedMW = 0;
        c.powerRatio = 0;
        c.satisfaction = Math.max(0.35, c.satisfaction - step * 0.01);
        // Автономная муниципальная застройка посёлков (до 18 зданий, максимум 2 крана одновременно)
        if (!c.isFlooded && c.buildingIndices.length < 18 && (c.activeBuildCount || 0) < 2) {
          c.growthProgress += (step / 20.0) * (1.0 + concretePlantCount * 0.25);
          if (c.growthProgress >= 1.0) {
            c.growthProgress -= 1.0;
            this._growCityOneStep(c);
          }
        }
        continue;
      }

      const giveMW = c.currentDemandMW * supplyCoverage;
      c.suppliedMW = giveMW;
      c.powerRatio = supplyCoverage;
      suppliedSum += giveMW;

      const roadTradeBonus = 1.0 + Math.min(0.24, (c.connectedRoadsCount || 0) * 0.08);
      const isIndTech = (c.archetype === 'smelter' || c.archetype === 'tech' || c.archetype === 'datacenter' || c.archetype === 'industrial');
      if (isIndTech) {
        rIndustrialPPA += giveMW * mwEconFactor * ECONOMY.baseRatePerMWSec * (0.85 + 0.45 * this.spotMultiplier) * c.tariffBonus * ECONOMY.industrialPPAMultiplier * roadTradeBonus;
      } else {
        rSpotEnergy += giveMW * mwEconFactor * ECONOMY.baseRatePerMWSec * this.spotMultiplier * c.tariffBonus * roadTradeBonus;
      }

      if ((c.powerRatio >= 0.48 || this.creative) && !c.isFlooded) {
        c.blackoutTimer = 0;
        c.satisfaction = Math.min(1.0, c.satisfaction + step * (0.05 + pumpStationCount * 0.01));

        const irrMult = (c.needsIrrigation && c.irrigated) ? 1.85 : 1.0;
        const roadBonus = 1.0 + Math.min(0.42, (c.connectedRoadsCount || 0) * 0.14);
        const plantBoost = 1.0 + Math.min(0.55, concretePlantCount * 0.25);
        const effPower = this.creative ? Math.max(0.88, c.powerRatio) : c.powerRatio;
        const speedByPower = (0.50 + 1.08 * effPower) * roadBonus * plantBoost * (this.creative ? 2.2 : 1.0);
        if ((c.activeBuildCount || 0) < 3) {
          c.growthProgress += (step / 10.2) * speedByPower * irrMult;
        }

        if (c.growthProgress >= 1.0) {
          c.growthProgress -= 1.0;
          this._growCityOneStep(c);
        }
      } else {
        c.satisfaction = Math.max(0.15, c.satisfaction - step * (c.isFlooded ? 0.08 : 0.025));
        if (genMW > 0.05 && c.powerRatio < 0.4) {
          c.blackoutTimer += step;
        }
        if (!c.isFlooded && c.buildingIndices.length < 18 && (c.activeBuildCount || 0) < 2) {
          c.growthProgress += (step / 20.0) * (1.0 + concretePlantCount * 0.25);
          if (c.growthProgress >= 1.0) {
            c.growthProgress -= 1.0;
            this._growCityOneStep(c);
          }
        }
      }
    }

    const surplusMW = Math.max(0, deliveredMW - suppliedSum);
    const hasGridLink = this.cities.some((c) => c.connected);
    this.exportedMW = hasGridLink ? surplusMW : 0;
    if (this.exportedMW > 0) {
      rSpotEnergy += this.exportedMW * mwEconFactor * ECONOMY.baseRatePerMWSec * this.spotMultiplier * ECONOMY.overSupplyExportFactor;
    }

    // ========================================================================
    //  РАСЧЁТ ВСЕХ 12 РАЗНООБРАЗНЫХ ИСТОЧНИКОВ ЗАРАБОТКА ГИДРОКАСКАДА!
    // ========================================================================

    // 3. Рынок маневренной мощности АРЧМ (плата за готовность ГЭС регулировать частоту 50 Гц)
    const rCapacity = hasGridLink ? ratedCapacitySumMW * mwEconFactor * ECONOMY.capacityPaymentPerMWSec : 0;

    // 4. Ценовой арбитраж ГАЭС (ночью покупаем дешёвую энергию на закачку, в пик продаём с премией!)
    let rGaesArbitrage = 0;
    if (pumpMW > 0.05) {
      this._gaesStoredMWh += pumpMW * mwEconFactor * step * 0.84;
      upkeep += pumpMW * mwEconFactor * ECONOMY.baseRatePerMWSec * ECONOMY.pumpedNightBuyFactor;
    } else if (this._gaesStoredMWh > 0.01 && this.spotMultiplier >= 1.35 && genMW > 0.5) {
      const release = Math.min(this._gaesStoredMWh, genMW * mwEconFactor * step * 0.65);
      this._gaesStoredMWh -= release;
      rGaesArbitrage = (release / step) * ECONOMY.baseRatePerMWSec * 1.48;
    }

    // 5. Судоходные шлюзы и речной транзит (зависит от числа шлюзов + портовых городов)
    const portConnected = this.cities.some((c) => c.archetype === 'port' && c.connected);
    const lockActiveFactor = clamp(this.hydrology.wetSurfaceHectares / Math.max(1.5, 4.0 * WORLD.horizScale), 0.35, 1.8);
    const rNavigation = (this.hydro.navLocks.length * ECONOMY.navLockTollPerSec + (portConnected ? 32 : 8)) * lockActiveFactor;
    for (let i = 0; i < this.hydro.navLocks.length; i++) {
      this.hydro.navLocks[i].cyclePhase = (this.hydro.navLocks[i].cyclePhase + step * 0.18) % 1.0;
    }

    // 6. Горводоканал и техводоснабжение (усиливается Береговыми насосными станциями [G]!)
    const connectedPopK = this.cities.reduce((s, c) => s + (c.connected ? c.population : 0), 0) / 1000;
    const hasReservoir = this.hydro.damCellCount > 4;
    const pumpMult = 1.0 + pumpStationCount * 0.48;
    const rWaterSupply = ((hasReservoir ? 1.0 : 0.42) * connectedPopK * ECONOMY.municipalWaterPerKPopSec + pumpStationCount * 36) * pumpMult;

    // 7. Агро-ирригация полей и теплиц Агродолины
    const agroCity = this.cities.find((c) => c.archetype === 'agro');
    const agroScale = agroCity ? (1.0 + agroCity.level * 0.28) : 1.0;
    const rAgro = this.agroIrrigated ? ECONOMY.irrigationBonusPerSec * agroScale : 0;

    // 8. Форелевые рыбхозы и аквакультура (чистая вода даёт бонус!)
    const waterCleanliness = clamp(1.18 - this.hydro.meanReservoirTurbidity * 0.85, 0.45, 1.25);
    const rAquaculture = this.hydro.fishFarms.length * ECONOMY.fishFarmIncomePerSec * waterCleanliness;

    // 9. Эко-туризм, круизы и яхт-марины (растёт от площади рукотворного озера + курорта Лазурный Берег!)
    const resortCity = this.cities.find((c) => c.archetype === 'resort');
    const resortMult = (resortCity && resortCity.connected) ? 2.1 : 1.0;
    const lakeFactor = hasReservoir ? clamp(this.hydrology.wetSurfaceHectares / (8.0 * WORLD.horizScale * WORLD.horizScale), 0.25, 2.5) : 0.15;
    const rTourism = (ECONOMY.ecoTourismPerMarinaSec * lakeFactor * resortMult) + (this.hydro.fishFarms.length * 14);

    // 10. Автоматический экспорт гранитного щебня и товарного бетона с Бетонозаводов БСУ [B]
    let rAggregates = concretePlantCount * 38;
    const reserveRaw = 450 / this.hydro.volPriceNorm;
    if (this.hydro.rockStockpileM3 > reserveRaw) {
      const autoSellRaw = Math.min(this.hydro.rockStockpileM3 - reserveRaw, (8.5 / this.hydro.volPriceNorm) * step);
      this.hydro.rockStockpileM3 -= autoSellRaw;
      rAggregates += ((autoSellRaw * this.hydro.volPriceNorm) / step) * ECONOMY.aggregateSellPricePerM3;
    }

    // 11. Зелёные углеродные сертификаты CO₂ (за чистую генерацию без угля и газа)
    const rCarbon = genMW * mwEconFactor * ECONOMY.carbonCreditPerMWSec;

    // 12. Премия МЧС за срезку паводка и защиту долины от наводнения!
    const isStormy = (this.weatherId === 'rain' || this.weatherId === 'flood');
    const rFloodControl = (isStormy && hasReservoir && !anyFlooded)
      ? ECONOMY.floodProtectionBonusSec * (this.weatherId === 'flood' ? 1.65 : 1.0)
      : 0;

    // Сохраняем все 12 потоков дохода и накапливаем за сессию
    const rates = this.revenueRates;
    rates.spotEnergy = rSpotEnergy;
    rates.industrialPPA = rIndustrialPPA;
    rates.capacityMarket = rCapacity;
    rates.gaesArbitrage = rGaesArbitrage;
    rates.navigationLocks = rNavigation;
    rates.waterSupply = rWaterSupply;
    rates.agroIrrigation = rAgro;
    rates.aquaculture = rAquaculture;
    rates.ecoTourism = rTourism;
    rates.aggregateSales = rAggregates;
    rates.carbonCredits = rCarbon;
    rates.floodControl = rFloodControl;

    let totalRevenuePerSec = 0;
    for (const def of REVENUE_STREAM_DEFS) {
      const val = rates[def.id] || 0;
      totalRevenuePerSec += val;
      this.revenueTotals[def.id] += val * step;
    }

    const loanInterest = this.loan * ECONOMY.loanInterestPerSec;
    this.suppliedCityMW = suppliedSum;
    this.incomePerSec = totalRevenuePerSec;
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
    const offScale = WORLD.horizScale;
    for (let i = 0; i < this.cities.length; i++) {
      const c = this.cities[i];

      let wetLots = 0;
      const checkStep = Math.max(1, Math.floor(c.lots.length / 8));
      let checked = 0;
      for (let k = 0; k < c.lots.length; k += checkStep) {
        const s = this.hydro.sampleAtWorld(c.lots[k].wx, c.lots[k].wz);
        checked++;
        if (s.depth > 0.48 * WORLD.elevScale) wetLots++;
      }
      const wasFlooded = c.isFlooded;
      c.isFlooded = checked > 0 && (wetLots / checked) >= 0.25;
      if (c.isFlooded && !wasFlooded && this.callbacks.onNotify) {
        this.callbacks.onNotify(`! Внимание! Подтоплены кварталы г. ${c.name}! Откройте водосброс или укрепите берег!`, 'danger');
      }

      if (c.needsIrrigation && c.irrigationTarget) {
        const t = c.irrigationTarget;
        let wetIrr = false;
        const d = 12 * offScale;
        const offsets = [[0, 0], [-d, -d * 0.7], [d, d * 0.7], [-d * 0.8, d * 0.8], [d * 0.8, -d * 0.8]];
        for (let o = 0; o < offsets.length; o++) {
          const s = this.hydro.sampleAtWorld(t.x + offsets[o][0], t.z + offsets[o][1]);
          if (s.depth > 0.16) {
            wetIrr = true;
            break;
          }
        }
        // Либо подача воды напорным трубопроводом от Береговой насосной станции [G] поблизости!
        if (!wetIrr && this.hydro.pumpStations && this.hydro.pumpStations.length > 0) {
          for (let p = 0; p < this.hydro.pumpStations.length; p++) {
            const ps = this.hydro.pumpStations[p];
            if (Math.hypot(ps.wx - t.x, ps.wz - t.z) < 175 * WORLD.horizScale) {
              wetIrr = true;
              break;
            }
          }
        }
        if (wetIrr && !c.irrigated) {
          c.irrigated = true;
          this.agroIrrigated = true;
          if (this.callbacks.onNotify) {
            this.callbacks.onNotify('◈ Вода пришла в оросительный бассейн Агродолины! Фермы и элеваторы пошли в рост!', 'good');
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
      city.population += newB.popGain || 95;
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

    const hScale = Math.pow(WORLD.elevScale, 0.78);
    for (let k = 0; k < city.buildingIndices.length; k++) {
      const b = this.allBuildings[city.buildingIndices[k]];
      if (b.sy < 18 * hScale) {
        b.sy = Math.min(36 * hScale, b.sy * 1.55);
        b.sx *= 1.12;
        b.sz *= 1.12;
        b.styleId = 9; // модернизация в высотный стеклянный фасад
        b.roofType = 'flat';
        b.anim = 0.35;
        city.population += 210;
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
      excavatedNormM3: this.hydro.excavatedNormM3,
      agroIrrigated: this.agroIrrigated,
      connectedCities: connectedCount,
      totalPopulation: totalPop,
      reinforcedCells: this.hydro.reinforcedCellCount,
      substations: this.hydro.substations.length,
      navLocks: this.hydro.navLocks.length,
      fishFarms: this.hydro.fishFarms.length,
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
      pumpedConsumeMW: this.pumpedConsumeMW,
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
      totalBuildings: this.allBuildings.length,
      co2SavedTons: this.totalCO2SavedTons,
      soilStockpileM3: this.hydro.soilStockpileM3,
      rockStockpileM3: this.hydro.rockStockpileM3,
      pendingPourM3: this.hydro.pendingPourVolumeM3,
      maxDamStress: this.hydro.maxDamStress,
      seepageQ: this.hydro.totalSeepageQ,
      agroIrrigated: this.agroIrrigated,
      substationsCount: this.hydro.substations.length,
      navLocksCount: this.hydro.navLocks.length,
      fishFarmsCount: this.hydro.fishFarms.length,
      roadsBuiltCount: this.roadNetwork.completedCount,
      roadsTotalCount: this.roadNetwork.routes.length,
      revenueRates: this.revenueRates,
      revenueTotals: this.revenueTotals,
      waterReport: this.hydrology.getReport(this.hydro, this.hour),
    };
  }
}
