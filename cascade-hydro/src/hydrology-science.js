// ============================================================================
//  НАУЧНАЯ ГИДРОЛОГИЯ, МИКРОКЛИМАТ, ВЕТРОВОЕ ПОЛЕ И ВОДНЫЙ БАЛАНС (src/hydrology-science.js)
//  По уравнениям гидрологии суши, физики атмосферы и ГЭС/ГАЭС:
//  - динамический 2D-вектор ветра, порывы, горно-долинный бриз и касательное напряжение τ_wind;
//  - барометрическое давление, точка росы Магнуса, радиационно-аэродинамическое испарение Пенмана;
//  - термический баланс воды водохранилищ и ледниковое таяние Хокка;
//  - фильтрация Дарси и инфильтрация Хортона.
// ============================================================================

import { WORLD, WEATHER_MODES } from './config.js';
import { clamp, lerp } from './noise.js';

const COMPASS_8 = ['С', 'СВ', 'В', 'ЮВ', 'Ю', 'ЮЗ', 'З', 'СЗ'];

function angleLerp(a, b, t) {
  let diff = ((b - a + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
  return a + diff * t;
}

export class HydrologicalBalanceEngine {
  constructor() {
    this.reset();
  }

  reset() {
    // Мгновенные потоки (м³/с)
    this.inflowRiversQ = 0;       // Приток из ледниковых гротов и ключей 3 рек
    this.snowmeltQ = 0;           // Таяние высокогорных снежников и ледников
    this.precipDirectQ = 0;       // Накапало дождя на зеркало и склоны
    this.groundwaterBaseQ = 0;    // Родниковое и подрусловое питание каньона
    this.pumpedReturnQ = 0;       // Возврат воды насосами ГАЭС в верхний бьеф ночью

    this.evaporationQ = 0;        // Испарилось с зеркала водохранилища и рек (Дальтон—Пенман)
    this.infiltrationQ = 0;       // Впиталось в необлицованный грунт и берега (Хортон)
    this.damSeepageQ = 0;         // Просочилось под подошвой плотин без цементации (Дарси)
    this.waterSupplyWithdrawQ = 0;// Забрано Горводоканалом, насосными, заводами и полями орошения
    this.mouthOutflowQ = 0;       // Свободный сток через морские границы карты

    // Внутренний энергетический оборот гидроузлов
    this.turbineWorkingQ = 0;     // Прошло через турбины ГЭС с выработкой МВт
    this.spillwayAndOverflowQ = 0;// Холостой сброс затворами + перелив через гребень

    // Накопленные объёмы с начала сессии (м³)
    this.cumArrivedM3 = 0;
    this.cumPrecipM3 = 0;
    this.cumSnowmeltM3 = 0;
    this.cumEvaporatedM3 = 0;
    this.cumInfiltratedM3 = 0;
    this.cumConsumedM3 = 0;
    this.cumMouthOutM3 = 0;
    this.cumTurbinePassedM3 = 0;
    this.cumSpilledM3 = 0;

    // Тонкая физика микроклимата, ветра и температуры воды
    this.simClock = 0;
    this.airTempC = 17.5;
    this.mountainTempC = 5.5;
    this.waterTempC = 11.2;
    this.dewPointC = 8.4;
    this.pressureHPa = 1014.0;
    this.cloudCover = 0.30;
    this.solarIrradianceWm2 = 480;
    this.relHumidity = 0.56;
    this.windSpeedMs = 4.8;
    this.windGustMs = 6.2;
    this.windAzimuthRad = (285 * Math.PI) / 180; // откуда дует метеорологически
    this.windAzimuthDeg = 285;
    this.windCompass = 'СЗ';
    this.windDirX = 0.75;  // куда толкает воду и облака по X
    this.windDirZ = 0.66;  // куда толкает воду и облака по Z
    this.thermalBreezeLabel = 'Горно-долинный баланс';
    this.vaporDeficitKPa = 0.85;
    this.wetSurfaceAreaM2 = 0;
    this.wetSurfaceHectares = 0;
    this.evapMmPerDay = 0;
    this.snowMeltVisualOffset = 0;
    this.prevVolumeM3 = 0;
    this.dVdT = 0;
  }

  /** Давление насыщенного водяного пара по формуле Магнуса — Теттенса (кПа) */
  _satVaporPressureKPa(tempC) {
    return 0.6108 * Math.exp((17.27 * tempC) / (tempC + 237.3));
  }

  /** Точка росы по температуре и относительной влажности (°C) */
  _computeDewPointC(tempC, rh) {
    const safeRh = clamp(rh, 0.05, 1.0);
    const gamma = Math.log(safeRh) + (17.27 * tempC) / (tempC + 237.3);
    return (237.3 * gamma) / (17.27 - gamma);
  }

  /**
   * Вычисляет физику ветра, микроклимата, испарения, таяния ледников и инфильтрации на шаге dt
   */
  step(dt, hydro, hourOfDay, weatherId, connectedCitiesCount = 1, agroIrrigated = false) {
    if (dt <= 0) return;
    this.simClock += dt;
    const w = WEATHER_MODES[weatherId] || WEATHER_MODES.normal;

    // 1. Суточная волна температуры, давления, облачности и солнечной радиации
    const diurnal = Math.sin(((hourOfDay - 9.5) / 24.0) * Math.PI * 2.0);
    const sunDay = clamp(Math.sin(((hourOfDay - 6.0) / 24.0) * Math.PI * 2.0), 0, 1);
    const targetAirTemp = w.baseTempC + 6.2 * diurnal;
    this.airTempC = lerp(this.airTempC, targetAirTemp, clamp(dt * 0.6, 0, 1));
    // Высотная поясность температуры (-6.5 °C / км + охлаждение у ледников)
    this.mountainTempC = this.airTempC - 11.6;
    this.relHumidity = clamp(w.relHumidity - 0.14 * diurnal, 0.20, 0.98);
    this.dewPointC = this._computeDewPointC(this.airTempC, this.relHumidity);

    const targetPressure = (w.pressureHPa || 1013) - 1.8 * diurnal + Math.sin(this.simClock * 0.035) * 1.4;
    this.pressureHPa = lerp(this.pressureHPa, targetPressure, clamp(dt * 0.25, 0, 1));
    this.cloudCover = lerp(this.cloudCover, w.cloudCover ?? 0.35, clamp(dt * 0.3, 0, 1));
    this.solarIrradianceWm2 = Math.round(940 * sunDay * (1.0 - 0.68 * this.cloudCover));

    // 2. Тонкая физика ветра: синоптический поток + горно-долинный бриз + турбулентные порывы
    const synAzimuth = ((w.windAzimuthDeg ?? 285) * Math.PI) / 180;
    // Днём тёплый воздух поднимается вверх по долине к ледникам (южный долинный ветер, ~185°),
    // ночью холодный плотный воздух стекает с ледников на юг (катабатический горный ветер, ~355°)!
    const valleyBreezeStrength = diurnal; // >0 днём, <0 ночью
    let thermalAzimuth = synAzimuth;
    if (valleyBreezeStrength > 0.22) {
      thermalAzimuth = angleLerp(synAzimuth, Math.PI * 1.02, 0.28 * valleyBreezeStrength);
      this.thermalBreezeLabel = 'Дневной долинный бриз ↑ к хребтам';
    } else if (valleyBreezeStrength < -0.22) {
      thermalAzimuth = angleLerp(synAzimuth, 0.04, 0.32 * (-valleyBreezeStrength));
      this.thermalBreezeLabel = 'Ночной ледниковый стоковый ветер ↓';
    } else {
      this.thermalBreezeLabel = 'Синоптический перенос воздушных масс';
    }
    const wander = Math.sin(this.simClock * 0.055) * 0.14 + Math.cos(this.simClock * 0.13) * 0.07;
    this.windAzimuthRad = angleLerp(this.windAzimuthRad, thermalAzimuth + wander, clamp(dt * 0.35, 0, 1));
    const normDeg = (((this.windAzimuthRad * 180) / Math.PI) % 360 + 360) % 360;
    this.windAzimuthDeg = Math.round(normDeg);
    this.windCompass = COMPASS_8[Math.round(normDeg / 45) % 8];

    // Турбулентные порывы ветра (спектр Кармана в компактном гармоническом виде)
    const gustWave = 0.5 + 0.5 * Math.sin(this.simClock * 0.62) * Math.cos(this.simClock * 0.27 + 1.1);
    const meanWind = w.windSpeedMs * (0.84 + 0.30 * sunDay);
    this.windSpeedMs = Math.max(0.6, meanWind + (gustWave - 0.45) * 1.65);
    this.windGustMs = +(this.windSpeedMs * (1.24 + 0.22 * gustWave)).toFixed(1);

    // Вектор куда дует ветер (противоположен метео-азимуту «откуда дует»)
    // 0° (Север) -> дует на Юг (+Z), 270° (Запад) -> дует на Восток (+X)
    this.windDirX = -Math.sin(this.windAzimuthRad);
    this.windDirZ = Math.cos(this.windAzimuthRad);

    // 3. Термический баланс воды в реках и водохранилищах
    const glacialCooling = clamp(this.snowmeltQ / Math.max(25, 95 * WORLD.flowScale), 0, 0.45) * 3.8;
    const eqWaterTemp = clamp(this.airTempC * 0.66 + 3.4 * sunDay - glacialCooling, 3.2, 24.5);
    this.waterTempC = lerp(this.waterTempC, eqWaterTemp, clamp(dt * 0.08, 0, 1));

    // 4. Площадь открытого водного зеркала
    this.wetSurfaceAreaM2 = hydro.wetCellCount * hydro.cellArea;
    this.wetSurfaceHectares = this.wetSurfaceAreaM2 / 10000.0;

    // 5. Радиационно-аэродинамическое испарение (Пенман — Дальтон с учётом ветра и прогрева воды!)
    const esWater = this._satVaporPressureKPa(Math.max(this.airTempC, this.waterTempC));
    const eaAir = this._satVaporPressureKPa(this.airTempC) * this.relHumidity;
    this.vaporDeficitKPa = Math.max(0.02, esWater - eaAir);

    const radFactor = 0.48 + (this.solarIrradianceWm2 / 940) * 1.18;
    this.evapMmPerDay = (0.38 + 0.35 * this.windSpeedMs) * this.vaporDeficitKPa * radFactor;
    const evapMetersPerSec = (this.evapMmPerDay * 1e-3 / WORLD.dayLengthSec) * 2.35;
    this.evaporationQ = evapMetersPerSec * this.wetSurfaceAreaM2;

    // 6. Ледниковое и снеговое питание из высокогорных гротов (Degree-Day Model Хокка)
    const meltDegree = Math.max(0, this.mountainTempC + 4.0 * sunDay);
    this.snowmeltQ = meltDegree * (3.25 * WORLD.flowScale) * (0.38 + 0.84 * sunDay);
    this.snowMeltVisualOffset = clamp((this.mountainTempC + 2.0) * 1.4, -6.0, 16.0);

    // 7. Подземное родниковое питание каньона
    this.groundwaterBaseQ = 8.8 * WORLD.flowScale * (w.id === 'low_water' ? 0.86 : 1.14);

    // 8. Обратная связь из SWE-солвера
    this.precipDirectQ = hydro.lastRainAddedQ || 0;
    this.inflowRiversQ = hydro.lastRiverInflowQ || 0;
    this.infiltrationQ = hydro.lastInfiltrationQ || 0;
    this.damSeepageQ = hydro.totalSeepageQ || 0;
    this.mouthOutflowQ = hydro.lastMouthOutflowQ || 0;
    this.pumpedReturnQ = hydro.lastPumpedUpQ || 0;

    // 9. Полезный расход турбин ГЭС vs холостой сброс и перелив
    let turbQ = 0;
    for (let i = 0; i < hydro.turbines.length; i++) {
      if (hydro.turbines[i].flowQ > 0) turbQ += hydro.turbines[i].flowQ;
    }
    let spillQ = hydro.lastCrestOverflowQ || 0;
    for (let i = 0; i < hydro.spillways.length; i++) {
      spillQ += hydro.spillways[i].currentFlowQ || 0;
    }
    this.turbineWorkingQ = turbQ;
    this.spillwayAndOverflowQ = spillQ;

    // 10. Водозабор городов, береговых насосных станций [G] и полей Агродолины
    const pumpStationsCount = hydro.pumpStations ? hydro.pumpStations.length : 0;
    this.waterSupplyWithdrawQ =
      (connectedCitiesCount * 1.35 + pumpStationsCount * 2.2 + (agroIrrigated ? 6.8 : 0.0)) * Math.pow(WORLD.flowScale, 0.75);

    // Передаём тонкую физику климата и ветрового касательного напряжения прямо в SWE-солвер!
    hydro.currentEvapRateMps = evapMetersPerSec;
    hydro.currentSnowmeltBonusQ = this.snowmeltQ + this.groundwaterBaseQ;
    hydro.currentWithdrawQ = this.waterSupplyWithdrawQ;
    hydro.windSpeedMs = this.windSpeedMs;
    hydro.windGustMs = this.windGustMs;
    hydro.windDirX = this.windDirX;
    hydro.windDirZ = this.windDirZ;
    hydro.windAzimuthRad = this.windAzimuthRad;
    hydro.waterTempC = this.waterTempC;

    // Касательное напряжение ветра на водной глади τ / ρ_w = (ρ_air/ρ_w) * C_d * |W| * W
    // (с наглядным масштабным множителем для образования реального ветрового нагона и дрейфовых течений!)
    const aeroAccel = 0.00058 * this.windSpeedMs * Math.min(18.0, this.windSpeedMs);
    hydro.windAccelX = this.windDirX * aeroAccel;
    hydro.windAccelZ = this.windDirZ * aeroAccel;

    // 11. Интегрируем накопленные объёмы (м³)
    const totalInQ = this.inflowRiversQ + this.snowmeltQ + this.groundwaterBaseQ + this.precipDirectQ;
    this.cumArrivedM3 += totalInQ * dt;
    this.cumPrecipM3 += this.precipDirectQ * dt;
    this.cumSnowmeltM3 += this.snowmeltQ * dt;
    this.cumEvaporatedM3 += this.evaporationQ * dt;
    this.cumInfiltratedM3 += (this.infiltrationQ + this.damSeepageQ) * dt;
    this.cumConsumedM3 += this.waterSupplyWithdrawQ * dt;
    this.cumMouthOutM3 += this.mouthOutflowQ * dt;
    this.cumTurbinePassedM3 += this.turbineWorkingQ * dt;
    this.cumSpilledM3 += this.spillwayAndOverflowQ * dt;

    if (this.prevVolumeM3 > 0) {
      this.dVdT = (hydro.totalWaterVolumeM3 - this.prevVolumeM3) / Math.max(0.05, dt);
    }
    this.prevVolumeM3 = hydro.totalWaterVolumeM3;
  }

  /**
   * Формирует полную научную сводку водного баланса, ветра и микроклимата
   */
  getReport(hydro, hourOfDay) {
    const totalInQ = this.inflowRiversQ + this.snowmeltQ + this.groundwaterBaseQ + this.precipDirectQ;
    const totalOutQ = this.mouthOutflowQ + this.evaporationQ + this.infiltrationQ + this.damSeepageQ + this.waterSupplyWithdrawQ;
    const totalNodePassQ = Math.max(0.01, this.turbineWorkingQ + this.spillwayAndOverflowQ);
    const hydroUtilizationPct = (this.turbineWorkingQ + this.spillwayAndOverflowQ) > 0.5
      ? Math.round((this.turbineWorkingQ / totalNodePassQ) * 100)
      : 0;

    const h = ((hourOfDay % 24) + 24) % 24;
    let whenWhySummary = '';
    if (this.precipDirectQ > 5) {
      whenWhySummary = `Циклон (${Math.round(this.pressureHPa)} гПа, ветер ${this.windCompass} ${this.windSpeedMs.toFixed(1)} м/с): ливень разгоняет склоновый сток в реки, ветровой нагон давит на бьефы.`;
    } else if (h >= 11 && h <= 17.5) {
      whenWhySummary = `Дневной прогрев (${this.solarIrradianceWm2} Вт/м², ${this.thermalBreezeLabel}): ледниковые гроты активно питают 3 реки, испарение и ветровое волнение усилены.`;
    } else if (h >= 0 && h < 6) {
      whenWhySummary = `Ночной стоковый ветер с ледников (${this.windCompass} ${this.windSpeedMs.toFixed(1)} м/с, вода +${this.waterTempC.toFixed(1)}°C): испарение минимально — лучшее окно закачки ГАЭС!`;
    } else {
      whenWhySummary = `Пик энергосистемы (давление ${Math.round(this.pressureHPa)} гПа, ветер ${this.windCompass} ${this.windSpeedMs.toFixed(1)} м/с): водохранилище работает на ГЭС, ВЭС дают бонус от ветра.`;
    }

    return {
      airTempC: this.airTempC,
      mountainTempC: this.mountainTempC,
      waterTempC: this.waterTempC,
      dewPointC: this.dewPointC,
      pressureHPa: Math.round(this.pressureHPa),
      solarIrradianceWm2: this.solarIrradianceWm2,
      relHumidityPct: Math.round(this.relHumidity * 100),
      windSpeedMs: this.windSpeedMs,
      windGustMs: this.windGustMs,
      windCompass: this.windCompass,
      windAzimuthDeg: this.windAzimuthDeg,
      windDirX: this.windDirX,
      windDirZ: this.windDirZ,
      thermalBreezeLabel: this.thermalBreezeLabel,
      evapMmPerDay: this.evapMmPerDay,
      wetAreaHa: this.wetSurfaceHectares,
      totalVolumeM3: hydro.totalWaterVolumeM3,
      netDeltaQ: totalInQ - totalOutQ,
      hydroUtilizationPct,
      whenWhySummary,

      // Приход (Откуда пришла, м³/с)
      inTotalQ: totalInQ,
      inRiversQ: this.inflowRiversQ,
      inSnowmeltQ: this.snowmeltQ,
      inPrecipQ: this.precipDirectQ,
      inGroundwaterQ: this.groundwaterBaseQ,
      inPumpedGAESQ: this.pumpedReturnQ,

      // Расход (Куда ушла, м³/с)
      outTotalQ: totalOutQ,
      outMouthQ: this.mouthOutflowQ,
      outEvapQ: this.evaporationQ,
      outInfiltQ: this.infiltrationQ,
      outSeepageQ: this.damSeepageQ,
      outCitiesAgroQ: this.waterSupplyWithdrawQ,

      // Работа гидроузла (ВБ -> НБ)
      nodeTurbineQ: this.turbineWorkingQ,
      nodeSpillOverflowQ: this.spillwayAndOverflowQ,

      // Накопительные итоги за сессию (тыс. м³)
      cumArrivedK: this.cumArrivedM3 / 1000,
      cumPrecipK: this.cumPrecipM3 / 1000,
      cumSnowmeltK: this.cumSnowmeltM3 / 1000,
      cumEvaporatedK: this.cumEvaporatedM3 / 1000,
      cumInfiltratedK: this.cumInfiltratedM3 / 1000,
      cumConsumedK: this.cumConsumedM3 / 1000,
      cumMouthOutK: this.cumMouthOutM3 / 1000,
      cumTurbineK: this.cumTurbinePassedM3 / 1000,
      cumSpilledK: this.cumSpilledM3 / 1000,
    };
  }
}
