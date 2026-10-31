// ============================================================================
//  ИНТЕРАКТИВНОЕ ПОШАГОВОЕ ОБУЧЕНИЕ «ШКОЛА ГЛАВНОГО ГИДРОСТРОИТЕЛЯ» (8 шагов)
//  Ведёт игрока через геодезию, 3-этапную объёмную стройку с кранами,
//  контрфорсы, пуск турбины с водоводом, ОРУ 110 кВ, свой канал и энергорынок
// ============================================================================

import { VALLEY_RIVERS } from './valley.js';
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
    const g = (VALLEY_RIVERS[preset] && VALLEY_RIVERS[preset].gorges[0]) || { x: 12, z: -158 };
    return { x: g.x, z: g.z };
  }

  _getSteps() {
    const gorge = this._getGorgeCoords();
    return [
      {
        id: 'recon',
        title: 'Разведка ущелья и геодезия',
        toolId: 'inspect',
        reward: 2000,
        target: { x: gorge.x, z: gorge.z, dist: 128 },
        body: 'Перелетите к скальному ущелью кнопкой <b>«⌖ Показать место»</b> (или клавишами <code>WASD</code> + колесо мыши) и включите изолинии высот <b>[≡ Высоты]</b> (<code>C</code>), чтобы увидеть каменные щёки каньона.',
        progress: () => {
          const d = Math.hypot(this.game.camCtrl.target.x - gorge.x, this.game.camCtrl.target.z - gorge.z);
          if (d < 92) this.visitedGorge = true;
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
        title: 'Объёмная 3D-плотина (3 этапа)',
        toolId: 'concrete_dam',
        reward: 5000,
        target: { x: gorge.x, z: gorge.z, dist: 124 },
        body: 'Выберите <b>[5] 3D Плотина</b>, укажите ярус высоты (например <b>+11м</b>) и протяните ЛКМ от левой скалы ущелья к правой. Вы увидите шпунт, 3D-армокаркас с опалубкой и работу башенных кранов!',
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
        title: 'Контрфорсы и защита от паводка',
        toolId: 'foundation',
        reward: 4500,
        target: { x: gorge.x, z: gorge.z + 8, dist: 122 },
        body: 'Высокий напор давит на основание! Укрепите плотину инструментом <b>[6] Контрфорс</b> (убирает подземную фильтрацию) и врежьте сбоку <b>[7] Водосброс</b> с подъёмным затвором.',
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
        title: 'Пуск ГЭС с 3D напорным водоводом',
        toolId: 'turbine_kaplan',
        reward: 6500,
        target: { x: gorge.x, z: gorge.z, dist: 118 },
        body: 'Выберите <b>[8] Каплан 7 МВт</b> (или <b>[9] Фрэнсис</b>) и кликните прямо по гребню плотины так, чтобы синий шар водозабора смотрел в водохранилище, а стрелка — вниз по реке. Дождитесь <b>0.35 МВт</b>!',
        progress: () => {
          const hasT = this.game.hydro.turbines.length > 0;
          const mw = this.game.economy.totalMW;
          const ratio = clamp((hasT ? 0.45 : 0) + Math.min(0.55, (mw / 0.35) * 0.55), 0, 1);
          return {
            ratio,
            label: hasT ? `Выработка ГЭС: ${mw.toFixed(2)} / 0.35 МВт (копится напор)` : 'Установите гидроагрегат в створ плотины',
            done: hasT && mw >= 0.35,
          };
        },
      },
      {
        id: 'substation_grid',
        title: 'Подстанция ОРУ 110 кВ и ЛЭП к городам',
        toolId: 'powerline',
        reward: 5500,
        target: { x: gorge.x + 36, z: gorge.z + 16, dist: 145 },
        body: 'Выберите <b>[P] ОРУ / ЛЭП</b> и кликните на сухом берегу рядом с ГЭС, чтобы возвести <b>3D-подстанцию ОРУ 110 кВ</b> (снижает потери с 16% до 3%), затем подключите ещё один город справа!',
        progress: () => {
          const subs = this.game.hydro.substations.length;
          const conn = this.game.economy.cities.filter((c) => c.connected).length;
          const ratio = clamp((subs > 0 ? 0.5 : 0) + (conn >= 2 ? 0.5 : 0), 0, 1);
          return {
            ratio,
            label: `Подстанция ОРУ 110 кВ: ${Math.min(1, subs)}/1 · Городов в сети: ${conn}/2`,
            done: subs >= 1 || conn >= 2,
          };
        },
      },
      {
        id: 'custom_canal',
        title: 'Прокладка собственного канала и Ж/Б лоток',
        toolId: 'canal_dig',
        reward: 6500,
        target: { x: 146, z: 72, dist: 140 },
        body: 'Выберите <b>[2] Экскаватор канала</b>, зажмите <code>Shift</code> (ровный уклон дна!) и прокопайте канал (например от восточной излучины к зелёному кольцу Агродолины). Каменная выемка даст щебень со скидкой 38% на <b>[3] Ж/Б лоток</b>!',
        progress: () => {
          const cut = this.game.hydro.totalExcavatedM3;
          const ratio = clamp(cut / 220, 0, 1);
          return {
            ratio,
            label: `Вынуто породы под свой канал: ${Math.round(Math.min(cut, 220))} / 220 м³`,
            done: cut >= 220,
          };
        },
      },
      {
        id: 'spot_dispatch',
        title: 'Спотовый рынок и Авто-диспетчер',
        toolId: 'inspect',
        reward: 4000,
        target: { x: gorge.x, z: gorge.z, dist: 115 },
        body: 'Вечером с 17:00 до 22:00 цена энергии взлетает в <b>×2.35 раза</b>! Выберите <b>[1] Осмотр</b>, кликните по зданию ГЭС и включите в инспекторе <b>«Авто-диспетчер по пикам энергорынка»</b>.',
        progress: () => {
          const anyAuto = this.game.hydro.turbines.some((t) => t.autoDispatch);
          return {
            ratio: anyAuto ? 1 : 0.2,
            label: anyAuto ? 'Авто-диспетчер включён!' : 'Откройте инспектор ГЭС и включите Авто-диспетчер',
            done: anyAuto,
          };
        },
      },
      {
        id: 'master_diploma',
        title: 'Энергетическое сердце долины!',
        toolId: 'turbine_francis',
        reward: 12000,
        target: { x: 168, z: 98, dist: 165 },
        body: 'Финальный экзамен: доведите выработку каскада до <b>2.0 МВт</b> (нарастив плотину или добавив агрегат) ИЛИ подайте воду каналом в оросительный бассейн <b>Агродолины</b>!',
        progress: () => {
          const mw = this.game.economy.totalMW;
          const irr = this.game.economy.agroIrrigated;
          const ratio = irr ? 1.0 : clamp(mw / 2.0, 0, 1);
          return {
            ratio,
            label: irr ? 'Орошение Агродолины запущено!' : `Мощность ГЭС: ${mw.toFixed(2)} / 2.00 МВт (или оросите Агродолину)`,
            done: irr || mw >= 2.0,
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
      this.game.camCtrl.flyTo(step.target.x, step.target.z, step.target.dist + 25, bed);
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
