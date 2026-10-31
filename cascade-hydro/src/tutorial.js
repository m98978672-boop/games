// ============================================================================
//  ИНТЕРАКТИВНОЕ ПОШАГОВОЕ ОБУЧЕНИЕ «ШКОЛА ГЛАВНОГО ГИДРОСТРОИТЕЛЯ v0.4» (10 шагов)
//  Охватывает 3D-истоки рек из ледниковых гротов, тонкую стройку, Бетонозавод БСУ [B],
//  Насосную станцию [G], Метео-ВЭС [W], физику ветра/климата, рост городов и трасс!
// ============================================================================

import { WORLD } from './config.js';
import { getScaledValleyRivers, getValleyHeadwaterSources } from './valley.js';
import { clamp } from './noise.js';

export class TutorialController {
  constructor(game) {
    this.game = game;
    this.active = false;
    this.completed = false;
    this.stepIndex = 0;
    this.visitedHeadwater = false;
    this.visitedGorge = false;

    this.cardEl = document.getElementById('tutorial-card');
    this.stepBadgeEl = document.getElementById('tut-step-badge');
    this.titleEl = document.getElementById('tut-title');
    this.bodyEl = document.getElementById('tut-body');
    this.progFillEl = document.getElementById('tut-prog-fill');
    this.progTextEl = document.getElementById('tut-prog-text');
    this.rewardEl = document.getElementById('tut-reward');

    this._bindButtons();
  }

  _getGorgeCoords() {
    const preset = this.game.hydro.presetId || 'bystritsa';
    const rivers = getScaledValleyRivers(preset);
    const g = rivers.gorges[0] || { x: 12 * WORLD.horizScale, z: -158 * WORLD.horizScale };
    return { x: g.x, z: g.z };
  }

  _getHeadwaterCoords() {
    const preset = this.game.hydro.presetId || 'bystritsa';
    const sources = getValleyHeadwaterSources(preset);
    const s0 = sources[0] || { outX: -58 * WORLD.horizScale, outZ: -342 * WORLD.horizScale };
    return { x: s0.outX, z: s0.outZ };
  }

  _getSteps() {
    const gorge = this._getGorgeCoords();
    const headwater = this._getHeadwaterCoords();
    const hs = WORLD.horizScale;
    const zoomScale = Math.pow(hs, 0.68);
    const ps = WORLD.powerScale;

    return [
      {
        id: 'headwaters_recon',
        title: 'Ледниковые гроты: откуда идёт вода',
        toolId: 'inspect',
        reward: 2000,
        target: { x: headwater.x, z: headwater.z, dist: 132 * zoomScale },
        body: 'Нажмите <b>«⌖ Показать место»</b> (или переместитесь на <code>WASD</code>), чтобы увидеть <b>3D-грот «Белый Ледник»</b> — природный исток главной реки! Днём солнце и тёплый долинный бриз усиливают таяние ледников, а вода без застоя бежит к морю.',
        progress: () => {
          const d = Math.hypot(this.game.camCtrl.target.x - headwater.x, this.game.camCtrl.target.z - headwater.z);
          if (d < 135 * hs) this.visitedHeadwater = true;
          return {
            ratio: this.visitedHeadwater ? 1.0 : 0.25,
            label: this.visitedHeadwater
              ? 'Исток реки изучен!'
              : 'Нажмите «⌖ Показать место», чтобы осмотреть ледниковый исток',
            done: this.visitedHeadwater,
          };
        },
      },
      {
        id: 'recon',
        title: 'Геодезия каньона и тонкая кисть',
        toolId: 'inspect',
        reward: 2000,
        target: { x: gorge.x, z: gorge.z, dist: 128 * zoomScale },
        body: 'Перелетите к скальному створу кнопкой <b>«⌖ Показать место»</b> и включите геодезические изолинии <b>[≡ Высоты]</b> (<code>C</code>). Клавишами <code>[</code> и <code>]</code> можно переключать <b>4 точных размера кисти</b>!',
        progress: () => {
          const d = Math.hypot(this.game.camCtrl.target.x - gorge.x, this.game.camCtrl.target.z - gorge.z);
          if (d < 105 * hs) this.visitedGorge = true;
          const p = (this.visitedGorge ? 0.6 : 0) + (this.game.showContours ? 0.4 : 0);
          return {
            ratio: clamp(p, 0, 1),
            label: this.visitedGorge
              ? (this.game.showContours ? 'Створ плотины изучен!' : 'Нажмите [C] («≡ Высоты») или «Взять инструмент»')
              : 'Наведите камеру на створ ущелья',
            done: this.visitedGorge && this.game.showContours,
          };
        },
      },
      {
        id: 'concrete_plant_site',
        title: 'Бетонный завод БСУ и Стройбаза [B]',
        toolId: 'concrete_plant',
        reward: 4000,
        target: { x: gorge.x + 34 * hs, z: gorge.z + 10 * hs, dist: 132 * zoomScale },
        body: 'Новинка строительной индустрии: выберите <b>[B] Бетонозавод</b> и разместите его на сухом берегу у ущелья! Он <b>удвоит скорость заливки 3D-плотин</b>, снизит расход бюджета на бетон на <b>22%</b> и ускорит стройку кварталов и трасс.',
        progress: () => {
          const plants = this.game.hydro.concretePlants ? this.game.hydro.concretePlants.length : 0;
          const damStarted = this.game.hydro.damCellCount >= 4;
          const done = plants >= 1 || damStarted;
          return {
            ratio: done ? 1.0 : 0.15,
            label: plants >= 1 ? 'Бетонный завод БСУ запущен!' : 'Постройте [B] Бетонозавод на сухом берегу у створа',
            done,
          };
        },
      },
      {
        id: 'volumetric_dam',
        title: 'Тонкая послойная стройка 3D-плотины [5]',
        toolId: 'concrete_dam',
        reward: 5500,
        target: { x: gorge.x, z: gorge.z, dist: 122 * zoomScale },
        body: 'Выберите <b>[5] 3D Плотина</b>, подберите тонкую или среднюю кисть и один из <b>4 точных ярусов высоты</b> (от ювелирной подсыпки гребня до высокой плотины). Протяните плотину от левой щеки каньона к правой!',
        progress: () => {
          const cells = this.game.hydro.damCellCount;
          const ratio = clamp(cells / 6, 0, 1);
          return {
            ratio,
            label: `Возведено секций 3D-плотины: ${Math.min(cells, 6)} / 6`,
            done: cells >= 6,
          };
        },
      },
      {
        id: 'buttress_spillway',
        title: 'Цементация Дарси [6] и 3D-водосброс [7]',
        toolId: 'foundation',
        reward: 4500,
        target: { x: gorge.x, z: gorge.z + 8 * hs, dist: 122 * zoomScale },
        body: 'Накопленный верхний бьеф создаёт напор и фильтрацию Дарси! Укрепите основание инструментом <b>[6] Контрфорс</b> и установите <b>[7] Водосброс</b> с сегментным затвором и носком-трамплином.',
        progress: () => {
          const r = this.game.hydro.reinforcedCellCount;
          const sw = this.game.hydro.spillways.length;
          const ratio = clamp(Math.min(1, r / 3) * 0.5 + (sw > 0 ? 0.5 : 0), 0, 1);
          return {
            ratio,
            label: `Контрфорсы: ${Math.min(r, 3)}/3 · Водосброс: ${sw}/1`,
            done: r >= 3 && sw >= 1,
          };
        },
      },
      {
        id: 'turbine_launch',
        title: 'Приплотинная ГЭС в нижнем бьефе [8/9/0]',
        toolId: 'turbine_kaplan',
        reward: 6500,
        target: { x: gorge.x, z: gorge.z, dist: 118 * zoomScale },
        body: 'Выберите <b>[8] Каплан</b>, <b>[9] Фрэнсис</b> или <b>[0] ГАЭС</b> (<code>R</code> — точный поворот с шагом 15°) и кликните по плотине: машзал встанет строго у подножия в нижнем бьефе без подъёма рельефа!',
        progress: () => {
          const hasT = this.game.hydro.turbines.length > 0;
          const goalMW = +(0.35 * ps).toFixed(1);
          const mw = Math.max(this.game.economy.totalMW, this.game.economy.pumpedConsumeMW);
          const ratio = clamp((hasT ? 0.45 : 0) + Math.min(0.55, (mw / Math.max(0.1, goalMW)) * 0.55), 0, 1);
          return {
            ratio,
            label: hasT ? `Выработка энергоузла: ${mw.toFixed(1)} / ${goalMW} МВт` : 'Установите гидроагрегат в створ плотины',
            done: hasT && mw >= goalMW,
          };
        },
      },
      {
        id: 'substation_grid',
        title: 'ОРУ 220 кВ [P], стройка городов и трасс',
        toolId: 'powerline',
        reward: 5500,
        target: { x: gorge.x + 36 * hs, z: gorge.z + 18 * hs, dist: 145 * zoomScale },
        body: 'Выберите <b>[P] ОРУ / ЛЭП</b>: кликните на сухом берегу у ГЭС для постройки <b>подстанции ОРУ</b> (снижает потери с 16% до 3%) и подключите соседний город — краны начнут возводить <b>48 типов зданий</b> и междугородние трассы!',
        progress: () => {
          const subs = this.game.hydro.substations.length;
          const conn = this.game.economy.cities.filter((c) => c.connected).length;
          const ratio = clamp((subs > 0 ? 0.5 : 0) + (conn >= 2 ? 0.5 : 0), 0, 1);
          return {
            ratio,
            label: `Подстанция ОРУ: ${Math.min(1, subs)}/1 · Городов в сети: ${conn}/2`,
            done: subs >= 1 || conn >= 2,
          };
        },
      },
      {
        id: 'pump_wind_canal',
        title: 'Насосная [G], Метео-ВЭС [N] или Канал [2]',
        toolId: 'pump_station',
        reward: 6500,
        target: { x: 142 * hs, z: 68 * hs, dist: 142 * zoomScale },
        body: 'Расширьте инженерный комплекс: постройте у воды <b>[G] Насосную станцию</b> (доход Горводоканала и подача воды в Агродолину!), на холме <b>[N] Метео-ВЭС</b> (генерация МВт от живого ветра!) или проройте тонкий <b>[2] Канал</b> (<code>Shift</code> — ровный уклон)!',
        progress: () => {
          const pumps = this.game.hydro.pumpStations ? this.game.hydro.pumpStations.length : 0;
          const winds = this.game.hydro.windMeteoStations ? this.game.hydro.windMeteoStations.length : 0;
          const extras = pumps + winds + this.game.hydro.navLocks.length + this.game.hydro.fishFarms.length;
          const cut = this.game.hydro.excavatedNormM3;
          const ratio = extras > 0 ? 1.0 : clamp(cut / 180, 0, 1);
          return {
            ratio,
            label: extras > 0
              ? 'Инженерный объект введён в строй!'
              : `Постройте [G] Насосную / [N] ВЭС или проройте канал (${Math.round(ratio * 100)}%)`,
            done: extras > 0 || cut >= 180,
          };
        },
      },
      {
        id: 'spot_dispatch',
        title: 'Физика ветра, климат и режим ГАЭС',
        toolId: 'inspect',
        reward: 4500,
        target: { x: gorge.x, z: gorge.z, dist: 118 * zoomScale },
        body: 'Откройте справа вкладку <b>«Вода и 12 доходов»</b>, чтобы видеть азимут и порывы ветра, давление, температуру воды и баланс рек, затем выберите <b>[1] Осмотр</b>, кликните по ГЭС и включите <b>«Авто-диспетчер»</b> или <b>«ГАЭС»</b>!',
        progress: () => {
          const anyAuto = this.game.hydro.turbines.some((t) => t.autoDispatch || t.pumpedStorage);
          return {
            ratio: anyAuto ? 1 : 0.25,
            label: anyAuto ? 'Интеллектуальный режим ГЭС/ГАЭС активен!' : 'Включите Авто-диспетчер / ГАЭС в инспекторе ГЭС [1]',
            done: anyAuto,
          };
        },
      },
      {
        id: 'master_diploma',
        title: 'Диплом Главного Гидростроителя!',
        toolId: 'turbine_francis',
        reward: 12000,
        target: { x: 168 * hs, z: 98 * hs, dist: 165 * zoomScale },
        body: `Финальная цель: выведите суммарную мощность энергосистемы (ГЭС + ВЭС) на <b>${(1.4 * ps).toFixed(0)} МВт</b> ИЛИ подайте воду в <b>Агродолину</b> (каналом <b>[2]</b> либо береговой насосной <b>[G]</b>)!`,
        progress: () => {
          const goalMW = 1.4 * ps;
          const mw = this.game.economy.totalMW;
          const irr = this.game.economy.agroIrrigated;
          const ratio = irr ? 1.0 : clamp(mw / goalMW, 0, 1);
          return {
            ratio,
            label: irr ? 'Агродолина обеспечена водой!' : `Мощность каскада: ${mw.toFixed(1)} / ${goalMW.toFixed(0)} МВт`,
            done: irr || mw >= goalMW,
          };
        },
      },
    ];
  }

  _bindButtons() {
    const flyBtn = document.getElementById('tut-btn-fly');
    const equipBtn = document.getElementById('tut-btn-equip');
    const skipBtn = document.getElementById('tut-btn-skip');
    const closeBtn = document.getElementById('tut-close');
    const topTutBtn = document.getElementById('btn-tutorial');

    if (flyBtn) {
      flyBtn.addEventListener('click', () => {
        const step = this._getSteps()[this.stepIndex];
        if (!step) return;
        const bed = this.game.hydro.sampleAtWorld(step.target.x, step.target.z).bed;
        this.game.camCtrl.flyTo(step.target.x, step.target.z, step.target.dist, bed);
        if (step.id === 'headwaters_recon') this.visitedHeadwater = true;
        if (step.id === 'recon') this.visitedGorge = true;
      });
    }

    if (equipBtn) {
      equipBtn.addEventListener('click', () => {
        const step = this._getSteps()[this.stepIndex];
        if (!step) return;
        if (step.id === 'headwaters_recon') {
          const bed = this.game.hydro.sampleAtWorld(step.target.x, step.target.z).bed;
          this.game.camCtrl.flyTo(step.target.x, step.target.z, step.target.dist, bed);
          this.visitedHeadwater = true;
        }
        if (step.id === 'recon' && !this.game.showContours) {
          this.game.toggleContours();
        }
        if (step.toolId) {
          this.game.selectTool(step.toolId);
        }
      });
    }

    if (skipBtn) {
      skipBtn.addEventListener('click', () => {
        this._advanceStep(true);
      });
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        this.stop();
      });
    }

    if (topTutBtn) {
      topTutBtn.addEventListener('click', () => {
        if (this.active) {
          this.stop();
        } else {
          if (this.completed) this.stepIndex = 0;
          this.start(this.stepIndex);
        }
      });
    }
  }

  start(fromIndex = 0) {
    this.active = true;
    this.completed = false;
    this.stepIndex = fromIndex;
    if (this.cardEl) this.cardEl.classList.remove('hidden');
    const topTutBtn = document.getElementById('btn-tutorial');
    if (topTutBtn) topTutBtn.classList.add('active');
    this._renderCurrentStep(true);
  }

  stop() {
    this.active = false;
    if (this.cardEl) this.cardEl.classList.add('hidden');
    const topTutBtn = document.getElementById('btn-tutorial');
    if (topTutBtn) topTutBtn.classList.remove('active');
    this._clearToolHighlight();
    this.game.worldView.setTutorialTarget(0, 0, false);
  }

  _clearToolHighlight() {
    document.querySelectorAll('.tool-slot.tut-pulse').forEach((el) => el.classList.remove('tut-pulse'));
  }

  _renderCurrentStep(flyHint = false) {
    const steps = this._getSteps();
    const step = steps[this.stepIndex];
    if (!step) {
      this._finishAll();
      return;
    }

    this.stepBadgeEl.textContent = `ШКОЛА ГИДРОСТРОЯ v0.4 · ШАГ ${this.stepIndex + 1} ИЗ ${steps.length}`;
    this.titleEl.textContent = step.title;
    this.bodyEl.innerHTML = step.body;
    this.rewardEl.textContent = `Премия: +${step.reward.toLocaleString('ru-RU')} ₽`;

    this._clearToolHighlight();
    if (step.toolId) {
      const slot = document.querySelector(`.tool-slot[data-tool="${step.toolId}"]`);
      if (slot) slot.classList.add('tut-pulse');
    }

    this.game.worldView.setTutorialTarget(step.target.x, step.target.z, true);
    if (flyHint && this.stepIndex === 0) {
      const bed = this.game.hydro.sampleAtWorld(step.target.x, step.target.z).bed;
      this.game.camCtrl.flyTo(step.target.x, step.target.z, step.target.dist * 1.08, bed);
    }

    this.update();
  }

  _advanceStep(skipped = false) {
    const steps = this._getSteps();
    const prev = steps[this.stepIndex];
    if (prev && !skipped) {
      this.game.economy.earn(prev.reward);
      this.game.audio.playMilestone();
      this.game.notify(`✦ Шаг обучения выполнен: «${prev.title}» (+${prev.reward.toLocaleString('ru-RU')} ₽)!`, 'good');
    }

    this.stepIndex++;
    if (this.stepIndex >= steps.length) {
      this._finishAll();
    } else {
      this._renderCurrentStep(false);
    }
  }

  _finishAll() {
    this.completed = true;
    this.active = false;
    this._clearToolHighlight();
    this.game.worldView.setTutorialTarget(0, 0, false);
    if (this.cardEl) this.cardEl.classList.add('hidden');
    const topTutBtn = document.getElementById('btn-tutorial');
    if (topTutBtn) topTutBtn.classList.remove('active');
    this.game.notify('★ Поздравляем! Вы окончили Школу Главного Гидростроителя v0.4 и освоили весь каскад!', 'good');
    try {
      localStorage.setItem('cascade.tutorialDone', '1');
    } catch { /* ignore */ }
  }

  update() {
    if (!this.active) return;
    const steps = this._getSteps();
    const step = steps[this.stepIndex];
    if (!step) return;

    const status = step.progress();
    if (this.progFillEl) {
      this.progFillEl.style.width = `${Math.round(status.ratio * 100)}%`;
    }
    if (this.progTextEl) {
      this.progTextEl.textContent = status.label;
    }

    if (status.done) {
      this._advanceStep(false);
    }
  }
}
