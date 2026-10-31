// ============================================================================
//  ИНТЕРАКТИВНОЕ ПОШАГОВОЕ ОБУЧЕНИЕ «ШКОЛА ГИДРОИНЖЕНЕРА v0.5» (10 шагов)
//  Охватывает стартовую Готовую ГЭС-1, разведку перепада высот ΔH [1], прокладку
//  подводящих и отводящих каналов [2], установку готовых комплексов ГЭС [8/9/0] в 1 клик
//  и управление новой системой логики городов (5 потребностей + указы мэрии + водоводы)!
// ============================================================================

import { WORLD, STARTER_READY_HPP_SITES } from './config.js';
import { getScaledValleyRivers } from './valley.js';
import { clamp } from './noise.js';

export class TutorialController {
  constructor(game) {
    this.game = game;
    this.active = false;
    this.completed = false;
    this.stepIndex = 0;
    this.visitedStarterHpp = false;
    this.visitedProspect = false;

    this.cardEl = document.getElementById('tutorial-card');
    this.stepBadgeEl = document.getElementById('tut-step-badge');
    this.titleEl = document.getElementById('tut-title');
    this.bodyEl = document.getElementById('tut-body');
    this.progFillEl = document.getElementById('tut-prog-fill');
    this.progTextEl = document.getElementById('tut-prog-text');
    this.rewardEl = document.getElementById('tut-reward');

    this._bindButtons();
  }

  _getStarterSiteCoords() {
    const preset = this.game.hydro.presetId || 'bystritsa';
    const cfg = STARTER_READY_HPP_SITES[preset] || STARTER_READY_HPP_SITES.bystritsa;
    const hs = WORLD.horizScale;
    return { x: cfg.baseX * hs, z: cfg.baseZ * hs };
  }

  _getProspectCoords() {
    const preset = this.game.hydro.presetId || 'bystritsa';
    const cfg = STARTER_READY_HPP_SITES[preset] || STARTER_READY_HPP_SITES.bystritsa;
    const p1 = (cfg.prospectSites && cfg.prospectSites[1]) ? cfg.prospectSites[1] : null;
    if (p1) {
      return { x: p1.baseX * WORLD.horizScale, z: p1.baseZ * WORLD.horizScale };
    }
    const rivers = getScaledValleyRivers(preset);
    const g = rivers.gorges[0] || { x: 12 * WORLD.horizScale, z: -158 * WORLD.horizScale };
    return { x: g.x, z: g.z };
  }

  _getSteps() {
    const starter = this._getStarterSiteCoords();
    const prospect = this._getProspectCoords();
    const hs = WORLD.horizScale;
    const zoomScale = Math.pow(hs, 0.68);
    const ps = WORLD.powerScale;

    return [
      {
        id: 'starter_hpp_inspect',
        title: 'Готовая ГЭС-1: изучите приёмный ковш',
        toolId: 'inspect',
        reward: 2500,
        target: { x: starter.x, z: starter.z, dist: 126 * zoomScale },
        body: 'Нажмите <b>«⌖ Показать место»</b>! На перешейке излучины уже возведена <b>Готовая Деривационная ГЭС-1</b> с П-образной аванкамерой (пульсирующее голубое кольцо входа), водоводами и машзалом. Ваша задача — <b>находить перепады высот и подводить к ГЭС воду каналами!</b>',
        progress: () => {
          const d = Math.hypot(this.game.camCtrl.target.x - starter.x, this.game.camCtrl.target.z - starter.z);
          if (d < 130 * hs) this.visitedStarterHpp = true;
          return {
            ratio: this.visitedStarterHpp ? 1.0 : 0.25,
            label: this.visitedStarterHpp
              ? 'Готовая ГЭС-1 и её приёмный ковш осмотрены!'
              : 'Нажмите «⌖ Показать место», чтобы перелететь к Готовой ГЭС-1',
            done: this.visitedStarterHpp,
          };
        },
      },
      {
        id: 'canal_to_starter_hpp',
        title: 'Подведите воду каналом [2] в Готовую ГЭС!',
        toolId: 'canal_dig',
        reward: 5000,
        target: { x: starter.x, z: starter.z - 28 * hs, dist: 142 * zoomScale },
        body: 'Выберите <b>[2] Прорыть канал</b> (<code>Shift</code> держит ровную отметку дна!) и соедините <b>верхний плёс реки</b> с голубым входом аванкамеры Готовой ГЭС-1, а отводящий ковш — с нижним руслом. Как только вода пойдёт через турбину, ГЭС сразу начнёт давать МВт!',
        progress: () => {
          const starterT = this.game.hydro.turbines.find((t) => t.isStarterReady) || this.game.hydro.turbines[0];
          const spinning = starterT && (starterT.powerMW > 0.05 || starterT.flowQ > 0.12);
          const cut = this.game.hydro.excavatedNormM3;
          const ratio = spinning ? 1.0 : clamp(cut / 110, 0, 0.92);
          return {
            ratio,
            label: spinning
              ? `Готовая ГЭС запущена водой канала (${starterT.powerMW.toFixed(2)} МВт)!`
              : `Выемка подводящего канала: ${Math.round(cut)} / 110 м³ (соедините реку с входом ГЭС)`,
            done: !!(spinning || cut >= 120),
          };
        },
      },
      {
        id: 'canal_lining_speed',
        title: 'Бетонная облицовка канала [3] и запруда [4]',
        toolId: 'canal_liner',
        reward: 3500,
        target: { x: starter.x, z: starter.z - 18 * hs, dist: 132 * zoomScale },
        body: 'Укрепите русло вашего канала инструментом <b>[3] Ж/Б лоток</b> (гладкий бетон <code>n = 0.014</code> разгоняет поток в 2.3 раза и убирает фильтрацию!) либо направьте реку запрудой <b>[4]</b> / плотиной <b>[5]</b>.',
        progress: () => {
          let lined = 0;
          const lm = this.game.hydro.linedMask;
          for (let i = 0; i < lm.length; i++) if (lm[i]) lined++;
          const dams = this.game.hydro.damCellCount;
          const ratio = clamp(Math.max(lined / 16, dams / 6), 0, 1);
          return {
            ratio,
            label: `Ж/Б облицовка канала: ${lined}/16 (или напорных секций: ${Math.min(6, dams)}/6)`,
            done: lined >= 16 || dams >= 6,
          };
        },
      },
      {
        id: 'geodesic_site_hunt',
        title: 'Поиск нового места: Разведка створа ΔH [1]',
        toolId: 'inspect',
        reward: 3500,
        target: { x: prospect.x, z: prospect.z, dist: 136 * zoomScale },
        body: 'Нажмите <b>«⌖ Показать место»</b> и включите изолинии высот <b>[≡ Высоты]</b> (<code>C</code>). Водите инструментом <b>[1] Разведка створа</b> по порогам и перешейкам: стрелка курсора и пробник покажут <b>перепад высот ΔH (м)</b> и прогноз мощности МВт!',
        progress: () => {
          const d = Math.hypot(this.game.camCtrl.target.x - prospect.x, this.game.camCtrl.target.z - prospect.z);
          if (d < 120 * hs) this.visitedProspect = true;
          const p = (this.visitedProspect ? 0.6 : 0) + (this.game.showContours ? 0.4 : 0);
          return {
            ratio: clamp(p, 0, 1),
            label: this.visitedProspect
              ? (this.game.showContours ? 'Перспективный створ с высоким ΔH найден!' : 'Включите изолинии высот [C] («≡ Высоты»)')
              : 'Перелетите к перспективному створу кнопкой «⌖ Показать место»',
            done: this.visitedProspect && this.game.showContours,
          };
        },
      },
      {
        id: 'turnkey_hpp_place',
        title: 'Готовая ГЭС в 1 клик на новом створе [8/9/0]',
        toolId: 'turbine_kaplan',
        reward: 6500,
        target: { x: prospect.x, z: prospect.z, dist: 124 * zoomScale },
        body: 'Выберите <b>[8] Готовая ГЭС Каплан</b>, <b>[9] Фрэнсис</b> или <b>[0] ГАЭС</b> и кликните прямо на порог реки или крутой склон под новый канал! Цельный гидроузел со встроенным напорным фронтом, аванкамерой и водосливом встанет в 1 клик.',
        progress: () => {
          const count = this.game.hydro.turbines.length;
          const goalMW = +(0.35 * ps).toFixed(1);
          const mw = Math.max(this.game.economy.totalMW, this.game.economy.pumpedConsumeMW);
          const done = count >= 2 || mw >= goalMW;
          return {
            ratio: done ? 1.0 : 0.3,
            label: count >= 2
              ? `В каскаде работают ${count} готовых гидроузла (${mw.toFixed(1)} МВт)!`
              : 'Поставьте вторую Готовую ГЭС [8/9/0] на выгодном перепаде высот',
            done,
          };
        },
      },
      {
        id: 'substation_grid',
        title: 'ОРУ 220 кВ [P] и выдача мощности в города',
        toolId: 'powerline',
        reward: 5500,
        target: { x: starter.x + 32 * hs, z: starter.z + 18 * hs, dist: 148 * zoomScale },
        body: 'Выберите <b>[P] ОРУ / ЛЭП</b>: поставьте на сухом берегу у ГЭС <b>подстанцию ОРУ</b> (снижает потери сети с 16% до 3%) и подключите ближайший город — краны начнут возводить выразительные <b>3D-здания 7 архитектурных типов</b>!',
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
        id: 'city_logic_decree',
        title: 'Система логики городов и Указ мэрии',
        toolId: 'inspect',
        reward: 4500,
        target: { x: -138 * hs, z: -48 * hs, dist: 145 * zoomScale },
        body: 'Откройте справа вкладку <b>«Города (8)»</b>! У каждого города есть <b>5 контуров жизни</b> (свет, вода, трассы, баланс жилья/работы, комфорт) и диагностика узкого места. Выберите для любого города указ генплана: <b>«Индустрия»</b> или <b>«Наука и Эко»</b>!',
        progress: () => {
          const customDecree = this.game.economy.cities.some((c) => c.focusMode && c.focusMode !== 'balanced');
          const conn = this.game.economy.cities.filter((c) => c.connected).length;
          return {
            ratio: (customDecree || conn >= 3) ? 1.0 : 0.35,
            label: customDecree
              ? 'Генплан города переключён! Город перестраивает кварталы под ваш указ.'
              : 'Переключите указ развития любого города во вкладке «Города (8)» справа',
            done: customDecree || conn >= 3,
          };
        },
      },
      {
        id: 'municipal_water_canal',
        title: 'Водовод в город: Канал [2] или Насосная [G]',
        toolId: 'pump_station',
        reward: 6500,
        target: { x: 142 * hs, z: 68 * hs, dist: 145 * zoomScale },
        body: 'Города платят <b>+7 500 ₽ муниципальной премии</b> и растут на <b>24% быстрее</b>, когда вы подводите к ним свежую воду! Прокопайте водоводный <b>[2] Канал</b> к городу/Агродолине или поставьте у реки <b>[G] Насосную станцию</b>.',
        progress: () => {
          const pumps = this.game.hydro.pumpStations ? this.game.hydro.pumpStations.length : 0;
          const wateredCity = this.game.economy.cities.some((c) => c.canalAqueductConnected);
          const muniRev = (this.game.economy.revenueRates && this.game.economy.revenueRates.waterSupply) || 0;
          const done = pumps > 0 || wateredCity || this.game.economy.agroIrrigated || muniRev > 25;
          return {
            ratio: done ? 1.0 : 0.25,
            label: done
              ? 'Городской водовод подключён! Благополучие жителей растёт.'
              : 'Подведите канал [2] к городу или постройте [G] Насосную станцию',
            done,
          };
        },
      },
      {
        id: 'concrete_wind_locks',
        title: 'Стройиндустрия БСУ [B], ВЭС [N] и Шлюзы [L]',
        toolId: 'concrete_plant',
        reward: 5000,
        target: { x: starter.x + 28 * hs, z: starter.z + 24 * hs, dist: 138 * zoomScale },
        body: 'Ускорьте экономику долины: <b>[B] Бетонозавод</b> ускоряет прокладку межгородских трасс и мостов, <b>[N] Метео-ВЭС</b> даёт ветровую энергию на хребтах, а <b>[L] Шлюз</b> и <b>[F] Рыбхоз</b> открывают речной транзит и эко-доходы!',
        progress: () => {
          const plants = this.game.hydro.concretePlants ? this.game.hydro.concretePlants.length : 0;
          const winds = this.game.hydro.windMeteoStations ? this.game.hydro.windMeteoStations.length : 0;
          const extras = plants + winds + this.game.hydro.navLocks.length + this.game.hydro.fishFarms.length;
          return {
            ratio: extras > 0 ? 1.0 : 0.2,
            label: extras > 0 ? 'Инфраструктура долины развёрнута!' : 'Постройте [B] Бетонозавод, [N] ВЭС, [L] Шлюз или [F] Рыбхоз',
            done: extras > 0,
          };
        },
      },
      {
        id: 'master_diploma',
        title: 'Диплом Главного Гидроинженера Каскада!',
        toolId: 'turbine_francis',
        reward: 12000,
        target: { x: 168 * hs, z: 98 * hs, dist: 165 * zoomScale },
        body: `Финальная цель: выведите суммарную мощность ваших готовых ГЭС, деривационных каналов и ВЭС на <b>${(1.4 * ps).toFixed(0)} МВт</b> ИЛИ обеспечьте водой <b>Агродолину</b>!`,
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
        if (step.id === 'starter_hpp_inspect') this.visitedStarterHpp = true;
        if (step.id === 'geodesic_site_hunt') this.visitedProspect = true;
      });
    }

    if (equipBtn) {
      equipBtn.addEventListener('click', () => {
        const step = this._getSteps()[this.stepIndex];
        if (!step) return;
        if (step.id === 'starter_hpp_inspect') {
          const bed = this.game.hydro.sampleAtWorld(step.target.x, step.target.z).bed;
          this.game.camCtrl.flyTo(step.target.x, step.target.z, step.target.dist, bed);
          this.visitedStarterHpp = true;
        }
        if (step.id === 'geodesic_site_hunt' && !this.game.showContours) {
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
