// ============================================================================
//  ИНТЕРАКТИВНОЕ ПОШАГОВОЕ ОБУЧЕНИЕ «ШКОЛА ГЛАВНОГО ГИДРОСТРОИТЕЛЯ» (8 шагов)
//  Адаптировано под любые масштабы карт (0.8×0.8 км, 5×5 км и 10×10 км)
// ============================================================================

import { WORLD } from './config.js';
import { getScaledValleyRivers } from './valley.js';
import { clamp } from './noise.js';

export class TutorialController {
  constructor(game) {
    this.game = game;
    this.active = false;
    this.completed = false;
    this.stepIndex = 0;
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

  _getSteps() {
    const gorge = this._getGorgeCoords();
    const hs = WORLD.horizScale;
    const zoomScale = Math.pow(hs, 0.68);
    const ps = WORLD.powerScale;

    return [
      {
        id: 'recon',
        title: 'Разведка ущелья и геодезия',
        toolId: 'inspect',
        reward: 2000,
        target: { x: gorge.x, z: gorge.z, dist: 128 * zoomScale },
        body: 'Перелетите к скальному ущелью кнопкой <b>«⌖ Показать место»</b> (или клавишами <code>WASD</code> + колесо мыши) и включите изолинии высот <b>[≡ Высоты]</b> (<code>C</code>), чтобы увидеть каменные щёки каньона.',
        progress: () => {
          const d = Math.hypot(this.game.camCtrl.target.x - gorge.x, this.game.camCtrl.target.z - gorge.z);
          if (d < 98 * hs) this.visitedGorge = true;
          const p = (this.visitedGorge ? 0.6 : 0) + (this.game.showContours ? 0.4 : 0);
          return {
            ratio: clamp(p, 0, 1),
            label: this.visitedGorge
              ? (this.game.showContours ? 'Створ изучен!' : 'Включите изолинии [C] или нажмите «Далее»')
              : 'Наведите камеру на ущелье «Ворота Грома»',
            done: this.visitedGorge && this.game.showContours,
          };
        },
      },
      {
        id: 'volumetric_dam',
        title: 'Объёмная 3D-плотина и перелив',
        toolId: 'concrete_dam',
        reward: 5000,
        target: { x: gorge.x, z: gorge.z, dist: 124 * zoomScale },
        body: 'Выберите <b>[5] 3D Плотина</b>, укажите ярус высоты и протяните ЛКМ от левой скалы ущелья к правой. При наполнении водохранилища вы увидите живой 3D-перелив воды через гребень!',
        progress: () => {
          const cells = this.game.hydro.damCellCount;
          const ratio = clamp(cells / 6, 0, 1);
          return {
            ratio,
            label: `Возведено объёмных секций плотины: ${Math.min(cells, 6)} / 6`,
            done: cells >= 6,
          };
        },
      },
      {
        id: 'buttress_spillway',
        title: 'Контрфорсы и 3D-водосброс',
        toolId: 'foundation',
        reward: 4500,
        target: { x: gorge.x, z: gorge.z + 8 * hs, dist: 122 * zoomScale },
        body: 'Высокий напор вызывает фильтрацию Дарси под основанием! Укрепите плотину инструментом <b>[6] Контрфорс</b> и врежьте сбоку <b>[7] Водосброс</b> с 3D-лотком и носком-трамплином.',
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
        title: 'Приплотинная ГЭС в нижнем бьефе',
        toolId: 'turbine_kaplan',
        reward: 6500,
        target: { x: gorge.x, z: gorge.z, dist: 118 * zoomScale },
        body: 'Выберите <b>[8] Каплан</b>, <b>[9] Фрэнсис</b> или <b>[0] ГАЭС</b> и кликните по плотине: водоприёмник встанет в верхнем бьефе, стальные водоводы пойдут вниз, а машзал аккуратно разместится у подножия в нижнем бьефе!',
        progress: () => {
          const hasT = this.game.hydro.turbines.length > 0;
          const goalMW = +(0.35 * ps).toFixed(1);
          const mw = Math.max(this.game.economy.totalMW, this.game.economy.pumpedConsumeMW);
          const ratio = clamp((hasT ? 0.45 : 0) + Math.min(0.55, (mw / Math.max(0.1, goalMW)) * 0.55), 0, 1);
          return {
            ratio,
            label: hasT ? `Выработка ГЭС: ${mw.toFixed(1)} / ${goalMW} МВт` : 'Установите гидроагрегат в створ плотины',
            done: hasT && mw >= goalMW,
          };
        },
      },
      {
        id: 'substation_grid',
        title: 'ОРУ 220 кВ, шлюзы и 8 городов',
        toolId: 'powerline',
        reward: 5500,
        target: { x: gorge.x + 36 * hs, z: gorge.z + 16 * hs, dist: 145 * zoomScale },
        body: 'Выберите <b>[P] ОРУ / ЛЭП</b> и кликните на сухом берегу рядом с ГЭС, чтобы возвести <b>3D-подстанцию ОРУ</b> (снижает потери с 16% до 3%), затем подключите ещё один город справа (например Алюмград или Технопарк ИИ)!',
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
        id: 'custom_canal',
        title: 'Свой канал, шлюз [L] или рыбхоз [F]',
        toolId: 'canal_dig',
        reward: 6500,
        target: { x: 146 * hs, z: 72 * hs, dist: 140 * zoomScale },
        body: 'Выберите <b>[2] Канал</b> (с <code>Shift</code> для ровного дна!) и проройте русло к зелёному кольцу Агродолины — либо постройте <b>[L] Шлюз</b> / <b>[F] Рыбхоз</b> для новых источников дохода!',
        progress: () => {
          const cut = this.game.hydro.excavatedNormM3;
          const extras = this.game.hydro.navLocks.length + this.game.hydro.fishFarms.length;
          const ratio = extras > 0 ? 1.0 : clamp(cut / 220, 0, 1);
          return {
            ratio,
            label: extras > 0 ? 'Построен шлюз / рыбхоз!' : `Прогресс земляных работ канала: ${Math.round(ratio * 100)}%`,
            done: extras > 0 || cut >= 220,
          };
        },
      },
      {
        id: 'spot_dispatch',
        title: 'Энергорынок, ГАЭС и водный баланс',
        toolId: 'inspect',
        reward: 4000,
        target: { x: gorge.x, z: gorge.z, dist: 115 * zoomScale },
        body: 'Изучите вкладку <b>«Вода и 12 доходов»</b> справа, а затем выберите <b>[1] Осмотр</b>, кликните по машзалу ГЭС и включите <b>«Авто-диспетчер»</b> или <b>«Ночную закачку ГАЭС»</b>!',
        progress: () => {
          const anyAuto = this.game.hydro.turbines.some((t) => t.autoDispatch || t.pumpedStorage);
          return {
            ratio: anyAuto ? 1 : 0.2,
            label: anyAuto ? 'Интеллектуальный режим ГЭС/ГАЭС активен!' : 'Откройте инспектор ГЭС и включите Авто-диспетчер / ГАЭС',
            done: anyAuto,
          };
        },
      },
      {
        id: 'master_diploma',
        title: 'Повелитель речного бассейна!',
        toolId: 'turbine_francis',
        reward: 12000,
        target: { x: 168 * hs, z: 98 * hs, dist: 165 * zoomScale },
        body: `Финальный экзамен: доведите выработку каскада до <b>${(1.4 * ps).toFixed(0)} МВт</b> ИЛИ подайте воду каналом в оросительный бассейн <b>Агродолины</b>!`,
        progress: () => {
          const goalMW = 1.4 * ps;
          const mw = this.game.economy.totalMW;
          const irr = this.game.economy.agroIrrigated;
          const ratio = irr ? 1.0 : clamp(mw / goalMW, 0, 1);
          return {
            ratio,
            label: irr ? 'Орошение Агродолины запущено!' : `Мощность ГЭС: ${mw.toFixed(1)} / ${goalMW.toFixed(0)} МВт`,
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
        if (step.id === 'recon') this.visitedGorge = true;
      });
    }

    if (equipBtn) {
      equipBtn.addEventListener('click', () => {
        const step = this._getSteps()[this.stepIndex];
        if (!step) return;
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

    this.stepBadgeEl.textContent = `ОБУЧЕНИЕ · ШАГ ${this.stepIndex + 1} ИЗ ${steps.length}`;
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
      this.game.camCtrl.flyTo(step.target.x, step.target.z, step.target.dist * 1.12, bed);
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
    this.game.notify('★ Поздравляем! Вы окончили Школу Главного Гидростроителя и освоили весь каскад!', 'good');
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
