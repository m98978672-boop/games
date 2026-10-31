// ============================================================================
//  НАУЧНАЯ ГИДРОЛОГИЯ И ВОДНЫЙ БАЛАНС РЕЧНОГО БАССЕЙНА (src/hydrology-science.js)
//  По уравнениям гидрологии суши, физики ГЭС/ГАЭС (Википедия «Гидроэлектростанция»,
//  уравнение испарения Дальтона — Пенмана, таяние ледников Хокка, фильтрация Дарси,
//  инфильтрация Хортона): отвечает на вопросы ЧТО, ОТКУДА, КУДА, КОГДА и ПОЧЕМУ!
// ============================================================================

import { WORLD, WEATHER_MODES } from './config.js';
import { clamp } from './noise.js';

export class HydrologicalBalanceEngine {
  constructor() {
    this.reset();
  }

  reset() {
    // Мгновенные потоки (м³/с)
    this.inflowRiversQ = 0;       // Приток из верховий 3 рек
    this.snowmeltQ = 0;           // Таяние высокогорных снежников и ледников
    this.precipDirectQ = 0;       // Накапало дождя на зеркало и склоны
    this.groundwaterBaseQ = 0;    // Родниковое и подземное питание каньона
    this.pumpedReturnQ = 0;       // Возврат воды насосами ГАЭС в верхний бьеф ночью

    this.evaporationQ = 0;        // Испарилось с зеркала водохранилища и рек (Дальтон—Пенман)
    this.infiltrationQ = 0;       // Впиталось в необлицованный грунт и берега (Хортон)
    this.damSeepageQ = 0;         // Просочилось под подошвой плотин без цементации (Дарси)
    this.waterSupplyWithdrawQ = 0;// Забрано Горводоканалом, заводами и полями орошения
    this.mouthOutflowQ = 0;       // Свободный сток через устье реки в море

    // Внутренний энергетический оборот гидроузлов (не уходит из бассейна, но переходит из ВБ в НБ!)
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

    // Метеопараметры и геометрия водного зеркала
    this.airTempC = 18.0;
    this.mountainTempC = 4.0;
    this.relHumidity = 0.55;
    this.windSpeedMs = 4.5;
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

  /**
   * Вычисляет физические скорости испарения, осадков, таяния ледников и инфильтрации на шаге dt
   */
  step(dt, hydro, hourOfDay, weatherId, connectedCitiesCount = 1, agroIrrigated = false) {
    if (dt <= 0) return;
    const w = WEATHER_MODES[weatherId] || WEATHER_MODES.normal;

    // 1. Суточная волна температуры воздуха (минимум в 04:30, максимум в 15:30)
    const diurnal = Math.sin(((hourOfDay - 9.5) / 24.0) * Math.PI * 2.0);
    const sunDay = clamp(Math.sin(((hourOfDay - 6.0) / 24.0) * Math.PI * 2.0), 0, 1);
    this.airTempC = w.baseTempC + 6.4 * diurnal;
    // Влажноадиабатический градиент в горах: -6.5 °C на 1000 м (приведённый к высоте снежной линии)
    this.mountainTempC = this.airTempC - 11.5;
    this.relHumidity = clamp(w.relHumidity - 0.14 * diurnal, 0.20, 0.98);
    this.windSpeedMs = w.windSpeedMs * (0.85 + 0.30 * sunDay);

    // 2. Площадь открытого водного зеркала (рек + разлившегося водохранилища + каналов)
    this.wetSurfaceAreaM2 = hydro.wetCellCount * hydro.cellArea;
    this.wetSurfaceHectares = this.wetSurfaceAreaM2 / 10000.0;

    // 3. Физическое испарение с зеркала воды (закон Дальтона — Пенмана)
    const es = this._satVaporPressureKPa(this.airTempC);
    const ea = es * this.relHumidity;
    this.vaporDeficitKPa = Math.max(0.02, es - ea);

    // Интенсивность испарения (мм/сутки -> наглядно усилено для игрового масштаба времени, чтобы игрок видел физику!)
    this.evapMmPerDay = (0.42 + 0.34 * this.windSpeedMs) * this.vaporDeficitKPa * (0.55 + 1.15 * sunDay);
    // Перевод в м/с для сетки симуляции (с игровым коэффициентом времени суток)
    const evapMetersPerSec = (this.evapMmPerDay * 1e-3 / WORLD.dayLengthSec) * 2.4;
    this.evaporationQ = evapMetersPerSec * this.wetSurfaceAreaM2;

    // 4. Ледниковое и снеговое питание на вершинах (Degree-Day Model Хокка: тает днём на солнце!)
    const meltDegree = Math.max(0, this.mountainTempC + 3.5 * sunDay);
    this.snowmeltQ = meltDegree * (3.2 * WORLD.flowScale) * (0.35 + 0.85 * sunDay);
    this.snowMeltVisualOffset = clamp((this.mountainTempC + 2.0) * 1.4, -6.0, 16.0);

    // 5. Подземное родниковое питание каньона (базисный сток водоносных пластов)
    this.groundwaterBaseQ = 8.5 * WORLD.flowScale * (w.id === 'low_water' ? 0.85 : 1.12);

    // 6. Атмосферные осадки — «накапало» прямо на зеркало и склоны водосбора
    this.precipDirectQ = hydro.lastRainAddedQ || 0;

    // 7. Транзитный приток рек и фильтрация/инфильтрация из солвера
    this.inflowRiversQ = hydro.lastRiverInflowQ || 0;
    this.infiltrationQ = hydro.lastInfiltrationQ || 0;
    this.damSeepageQ = hydro.totalSeepageQ || 0;
    this.mouthOutflowQ = hydro.lastMouthOutflowQ || 0;
    this.pumpedReturnQ = hydro.lastPumpedUpQ || 0;

    // 8. Полезный расход турбин ГЭС vs холостой сброс и перелив через плотины
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

    // 9. Водозабор городов (Горводоканал), заводов и полей орошения Агродолины
    this.waterSupplyWithdrawQ =
      (connectedCitiesCount * 1.35 + (agroIrrigated ? 6.8 : 0.0)) * Math.pow(WORLD.flowScale, 0.75);

    // Передаём скорость испарения и таяния в гидродинамическое ядро
    hydro.currentEvapRateMps = evapMetersPerSec;
    hydro.currentSnowmeltBonusQ = this.snowmeltQ + this.groundwaterBaseQ;
    hydro.currentWithdrawQ = this.waterSupplyWithdrawQ;

    // 10. Интегрируем накопленные объёмы (м³) за время сессии
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
   * Формирует подробную научную сводку водного баланса:
   * ЧТО, ОТКУДА, КУДА, КОГДА, ЗАЧЕМ и ПОЧЕМУ происходит с водой прямо сейчас!
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
      whenWhySummary = 'Сейчас циклон: капли дождя дают прямой склоновый сток в реки, влажность высокая — испарение с зеркала минимально.';
    } else if (h >= 11 && h <= 17.5) {
      whenWhySummary = 'Дневной прогрев: солнце растапливает горные снежники (+приток сверху), но одновременно усиливает испарение с широкого зеркала водохранилища.';
    } else if (h >= 0 && h < 6) {
      whenWhySummary = 'Ночное охлаждение: ледники в горах подмёрзли, испарение упало — идеальное окно для накопления бьефа и закачки ГАЭС!';
    } else {
      whenWhySummary = 'Пиковые часы энергосистемы: накопленный объём водохранилища срабатывается через напорные водоводы ГЭС для максимума выручки.';
    }

    return {
      airTempC: this.airTempC,
      mountainTempC: this.mountainTempC,
      relHumidityPct: Math.round(this.relHumidity * 100),
      windSpeedMs: this.windSpeedMs,
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
