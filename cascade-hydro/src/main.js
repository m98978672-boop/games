// ============================================================================
//  КАСКАД: ЖИВАЯ ВОДА — Главный игровой модуль, ввод, UI и цикл оптимизаций
// ============================================================================

import * as THREE from 'three';
import {
  WORLD,
  QUALITY_PROFILES,
  WEATHER_MODES,
  TOOLS,
  MILESTONES,
} from './config.js';
import { detectDevice, wantsSafeMode } from './device.js';
import { probeWebGL, formatDiagReport } from './diag.js';
import { clamp, lerp } from './noise.js';
import { HydroSimulation } from './hydro.js';
import { EconomyAndCities } from './economy.js';
import { WorldView } from './world-view.js';
import { SprayAndRainSystem } from './spray.js';
import { ValleyCameraController } from './camera.js';
import { HydroAudio } from './audio.js';
import { SVG_ICONS } from './icons.js';

const WEATHER_ORDER = ['normal', 'rain', 'flood', 'low_water'];
const SPEED_MODES = [0, 1, 2, 5];

class CascadeHydroGame {
  constructor() {
    this.canvas = document.getElementById('scene');
    this.device = detectDevice();
    const safe = wantsSafeMode();

    const savedQuality = this._loadSetting('quality', null);
    const initialQualityId = safe ? 'low' : (savedQuality || this.device.recommendedQuality);
    this.profile = QUALITY_PROFILES[initialQualityId] || QUALITY_PROFILES.medium;

    this.audio = new HydroAudio();
    this._initRenderer();

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(46, window.innerWidth / window.innerHeight, 1.5, 1600);
    this.camCtrl = new ValleyCameraController(this.camera, this.canvas);

    // Инициализация ядра физики воды и экономики растущих городов
    this.hydro = new HydroSimulation(this.profile.grid);
    this.economy = new EconomyAndCities(this.hydro, {
      onNotify: (msg, kind) => this.notify(msg, kind),
      onMilestone: (m) => {
        this.audio.playMilestone();
        this.notify(`★ Грант Минэнерго «${m.title}»: +${m.reward.toLocaleString('ru-RU')} ₽!`, 'good');
      },
    });

    this.worldView = new WorldView(this.scene, this.hydro, this.economy, this.profile);
    this.spray = new SprayAndRainSystem(this.scene, this.profile.maxParticles);

    // Предкомпиляция всех шейдеров (оптимизация из last-shore — ноль фризов при первой стройке!)
    this.renderer.compile(this.scene, this.camera);

    // Состояние инструментов и управления
    this.activeToolId = 'canal_dig';
    this.brushRadius = 8.5;
    this.manualYaw = null;
    this.showContours = false;
    this.speedIndex = 1; // ×1
    this.selectedStruct = null;

    this.pointerDown = false;
    this.lastBrushWorld = null;
    this.lockedGradeElev = null;
    this.hoverWorld = null;

    // Счётчики FPS и диагностики F3
    this.showDiag = false;
    this.fps = 60;
    this._fpsFrames = 0;
    this._fpsAccum = 0;
    this._frameCount = 0;
    this._uiRefreshAccum = 0;
    this._lastTime = performance.now();

    this._initUI();
    this._bindWorldInput();
    this._onResize();
    window.addEventListener('resize', () => this._onResize());

    // Приветственная подсказка
    this.notify('≈ Добро пожаловать в долину р. Быстрица! Перегородите теснину плотиной или срежьте излучину собственным каналом!', 'info');

    requestAnimationFrame((t) => this._loop(t));
  }

  _loadSetting(key, fallback) {
    try {
      const v = localStorage.getItem(`cascade.${key}`);
      return v || fallback;
    } catch {
      return fallback;
    }
  }

  _saveSetting(key, val) {
    try {
      localStorage.setItem(`cascade.${key}`, val);
    } catch { /* ignore */ }
  }

  _initRenderer() {
    // Трёхступенчатое создание WebGL-контекста (по образцу last-shore)
    const tiers = [
      { antialias: this.profile.id !== 'low', powerPreference: 'high-performance' },
      { antialias: false, powerPreference: 'default' },
      { antialias: false, failIfMajorPerformanceCaveat: false },
    ];

    let lastErr = null;
    for (const opts of tiers) {
      try {
        this.renderer = new THREE.WebGLRenderer({
          canvas: this.canvas,
          antialias: opts.antialias,
          powerPreference: opts.powerPreference,
          alpha: false,
        });
        if (this.renderer && this.renderer.getContext()) break;
      } catch (err) {
        lastErr = err;
        this.renderer = null;
      }
    }

    if (!this.renderer) {
      const gl = probeWebGL();
      const modal = document.getElementById('nogl-modal');
      const reason = document.getElementById('nogl-reason');
      if (modal) modal.classList.remove('hidden');
      if (reason) reason.textContent = gl.reason || (lastErr && lastErr.message) || 'WebGL недоступен';
      throw new Error('WebGL context unavailable');
    }

    const dpr = Math.min(window.devicePixelRatio || 1, this.profile.maxPixelRatio);
    this.renderer.setPixelRatio(dpr);
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    // Оптимизация теней из last-shore: ручное обновление карты теней раз в N кадров!
    this.renderer.shadowMap.enabled = !!this.profile.shadows;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    this.renderer.shadowMap.autoUpdate = false;
    this.renderer.shadowMap.needsUpdate = true;
  }

  _onResize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.camera.aspect = w / Math.max(1, h);
    this.camera.updateProjectionMatrix();
    const dpr = Math.min(window.devicePixelRatio || 1, this.profile.maxPixelRatio);
    this.renderer.setPixelRatio(dpr);
    this.renderer.setSize(w, h);
  }

  // ==========================================================================
  //  БЫСТРЫЙ АНАЛИТИЧЕСКИЙ RAYMARCH ПО ВЫСОТАМ ДОЛИНЫ (в 300 раз быстрее BVH!)
  // ==========================================================================
  raycastValley(clientX, clientY) {
    const rect = this.canvas.getBoundingClientRect();
    const ndcX = ((clientX - rect.left) / rect.width) * 2 - 1;
    const ndcY = -((clientY - rect.top) / rect.height) * 2 + 1;

    const raycaster = this._raycaster || (this._raycaster = new THREE.Raycaster());
    raycaster.setFromCamera({ x: ndcX, y: ndcY }, this.camera);
    const orig = raycaster.ray.origin;
    const dir = raycaster.ray.direction;

    if (dir.y >= -0.01) return null;

    // Шагаем вдоль луча от верхней отметки (72 м) до пересечения с рельефом/водой
    const tStart = Math.max(2.0, (orig.y - 72.0) / (-dir.y));
    const tEnd = Math.min(1100.0, (orig.y - (-2.0)) / (-dir.y));
    if (tEnd <= tStart) return null;

    const steps = 64;
    const dt = (tEnd - tStart) / steps;
    let prevT = tStart;
    const half = WORLD.size * 0.495;

    for (let s = 1; s <= steps; s++) {
      const t = tStart + s * dt;
      const px = orig.x + dir.x * t;
      const py = orig.y + dir.y * t;
      const pz = orig.z + dir.z * t;

      if (Math.abs(px) > half || Math.abs(pz) > half) {
        prevT = t;
        continue;
      }

      const sample = this.hydro.sampleAtWorld(px, pz);
      const surfH = sample.bed;
      if (py <= surfH) {
        // Уточняем дихотомией за 5 шагов до точности ~5 см!
        let lo = prevT;
        let hi = t;
        for (let b = 0; b < 5; b++) {
          const mid = (lo + hi) * 0.5;
          const mx = orig.x + dir.x * mid;
          const my = orig.y + dir.y * mid;
          const mz = orig.z + dir.z * mid;
          const ms = this.hydro.sampleAtWorld(mx, mz);
          if (my <= ms.bed) hi = mid;
          else lo = mid;
        }
        const ft = (lo + hi) * 0.5;
        return {
          wx: clamp(orig.x + dir.x * ft, -half, half),
          wy: orig.y + dir.y * ft,
          wz: clamp(orig.z + dir.z * ft, -half, half),
        };
      }
      prevT = t;
    }
    return null;
  }

  // ==========================================================================
  //  ИНТЕРФЕЙС, ХОТБАР, ИНСПЕКТОР АГРЕГАТОВ И ГОРЯЧИЕ КЛАВИШИ
  // ==========================================================================
  _initUI() {
    // 1. Хотбар инструментов
    const hotbar = document.getElementById('hotbar');
    hotbar.innerHTML = '';
    for (const tool of TOOLS) {
      const btn = document.createElement('button');
      btn.className = `tool-slot${tool.id === this.activeToolId ? ' active' : ''}`;
      btn.dataset.tool = tool.id;
      btn.innerHTML = `
        <span class="tool-key">[${tool.key}]</span>
        <span class="tool-icon">${SVG_ICONS[tool.id] || '◈'}</span>
        <span class="tool-name">${tool.short}</span>
        <span class="tool-price">${tool.costLabel}</span>
      `;
      btn.addEventListener('click', () => {
        this.audio.unlock();
        this.selectTool(tool.id);
      });
      hotbar.appendChild(btn);
    }
    this._updateToolHint();

    // 2. Размеры кисти / ширины канала и поворот
    document.querySelectorAll('.size-btn[data-size]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.brushRadius = parseFloat(btn.dataset.size);
        document.querySelectorAll('.size-btn[data-size]').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });

    document.getElementById('btn-rotate').addEventListener('click', () => this.rotatePlacement());

    // 3. Верхние кнопки управления
    document.getElementById('btn-speed').addEventListener('click', () => this.cycleSpeed());
    document.getElementById('btn-contours').addEventListener('click', () => this.toggleContours());
    document.getElementById('btn-weather-cycle').addEventListener('click', () => {
      const idx = (WEATHER_ORDER.indexOf(this.economy.weatherId) + 1) % WEATHER_ORDER.length;
      const next = WEATHER_ORDER[idx];
      this.economy.setWeather(next);
      const w = WEATHER_MODES[next];
      this.notify(`${w.icon} Включён режим: ${w.label} (приток ×${w.inflowMult.toFixed(2)})`, 'info');
      this._refreshHUD();
    });

    const creativeBtn = document.getElementById('btn-creative');
    creativeBtn.addEventListener('click', () => {
      this.economy.creative = !this.economy.creative;
      creativeBtn.classList.toggle('active', this.economy.creative);
      this.notify(
        this.economy.creative
          ? '🛠️ Режим «Инженерный креатив» включён: стройка и каналы без ограничений бюджета!'
          : '💼 Возвращён экономический режим с бюджетом.',
        'info',
      );
      this._refreshHUD();
    });

    const qualityBtn = document.getElementById('btn-quality');
    qualityBtn.textContent = `⚙ ${this.profile.label}`;
    qualityBtn.addEventListener('click', () => {
      const order = ['low', 'medium', 'high'];
      const nextId = order[(order.indexOf(this.profile.id) + 1) % order.length];
      this._saveSetting('quality', nextId);
      this.profile = QUALITY_PROFILES[nextId];
      qualityBtn.textContent = `⚙ ${this.profile.label}`;
      this.renderer.shadowMap.enabled = !!this.profile.shadows;
      this.renderer.shadowMap.needsUpdate = true;
      this._onResize();
      this.notify(`Графика переключена: ${this.profile.label} (полная смена сетки воды — после перезагрузки страницы)`, 'info');
    });

    const muteBtn = document.getElementById('btn-mute');
    muteBtn.addEventListener('click', () => {
      const m = this.audio.toggleMute();
      muteBtn.textContent = m ? '✕ Без звука' : '♪ Звук';
    });

    // Справка
    const helpModal = document.getElementById('help-modal');
    document.getElementById('btn-help').addEventListener('click', () => helpModal.classList.toggle('hidden'));
    document.getElementById('help-close').addEventListener('click', () => helpModal.classList.add('hidden'));
    document.getElementById('help-start-btn').addEventListener('click', () => {
      this.audio.unlock();
      helpModal.classList.add('hidden');
    });

    // Кнопки быстрого перелёта к ключевым створам
    document.querySelectorAll('.lm-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const [x, z, dist] = btn.dataset.fly.split(',').map(Number);
        const bed = this.hydro.sampleAtWorld(x, z).bed;
        this.camCtrl.flyTo(x, z, dist, bed);
      });
    });

    // Сворачивание боковой панели
    const panelBody = document.getElementById('panel-body');
    const toggleBtn = document.getElementById('btn-toggle-panel');
    toggleBtn.addEventListener('click', () => {
      const hidden = panelBody.classList.toggle('hidden');
      toggleBtn.textContent = hidden ? '▸' : '▾';
    });

    // Кредиты / Облигации
    document.getElementById('btn-loan').addEventListener('click', () => {
      const res = this.economy.takeGreenLoan();
      if (res.ok) this.notify(`💵 Выпущены зелёные облигации ГЭС: +${res.amount.toLocaleString('ru-RU')} ₽`, 'good');
      else this.notify(res.reason, 'warn');
      this._refreshHUD();
    });

    document.getElementById('btn-repay').addEventListener('click', () => {
      const res = this.economy.repayLoan();
      if (res.ok) this.notify(`Погашена часть облигаций: -${res.amount.toLocaleString('ru-RU')} ₽`, 'info');
      else this.notify(res.reason, 'warn');
      this._refreshHUD();
    });

    // Инспектор турбины / водосброса
    document.getElementById('insp-close').addEventListener('click', () => {
      this.selectedStruct = null;
      document.getElementById('struct-inspector').classList.add('hidden');
    });

    document.getElementById('insp-slider').addEventListener('input', (e) => {
      if (!this.selectedStruct) return;
      const ratio = Number(e.target.value) / 100;
      if (this.selectedStruct.kind === 'turbine') {
        this.selectedStruct.throttle = ratio;
        this.selectedStruct.autoDispatch = false;
        document.getElementById('insp-auto').checked = false;
      } else {
        this.selectedStruct.openRatio = ratio;
        this.selectedStruct.autoRegulate = false;
        document.getElementById('insp-auto').checked = false;
        this.hydro._syncSpillwayGateCells(this.selectedStruct);
      }
      this._refreshInspector();
    });

    document.getElementById('insp-auto').addEventListener('change', (e) => {
      if (!this.selectedStruct) return;
      const checked = e.target.checked;
      if (this.selectedStruct.kind === 'turbine') {
        this.selectedStruct.autoDispatch = checked;
      } else {
        this.selectedStruct.autoRegulate = checked;
      }
      this._refreshInspector();
    });

    // Горячие клавиши
    window.addEventListener('keydown', (e) => {
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT')) return;
      if (e.code === 'F3') {
        e.preventDefault();
        this.showDiag = !this.showDiag;
        document.getElementById('diag-panel').classList.toggle('hidden', !this.showDiag);
        return;
      }
      const keyUpper = e.key.toUpperCase();
      for (const tool of TOOLS) {
        if (tool.key === keyUpper) {
          this.selectTool(tool.id);
          return;
        }
      }
      if (e.code === 'KeyV' || e.code === 'Space') {
        e.preventDefault();
        this.cycleSpeed();
      } else if (e.code === 'KeyC') {
        this.toggleContours();
      } else if (e.code === 'KeyR') {
        this.rotatePlacement();
      } else if (e.code === 'KeyK') {
        creativeBtn.click();
      } else if (e.code === 'KeyM') {
        muteBtn.click();
      } else if (e.code === 'KeyH') {
        helpModal.classList.toggle('hidden');
      }
    });

    this._renderCityCards();
    this._refreshHUD();
  }

  selectTool(id) {
    this.activeToolId = id;
    document.querySelectorAll('.tool-slot').forEach((el) => {
      el.classList.toggle('active', el.dataset.tool === id);
    });
    this._updateToolHint();
  }

  _updateToolHint() {
    const t = TOOLS.find((x) => x.id === this.activeToolId);
    const hint = document.getElementById('tool-hint');
    if (t && hint) hint.textContent = `▸ ${t.name}: ${t.desc}`;
  }

  rotatePlacement() {
    if (this.manualYaw === null) this.manualYaw = 0;
    else this.manualYaw += Math.PI * 0.25;
    if (this.manualYaw > Math.PI * 2) this.manualYaw = null; // возврат в авто-ориентацию по напору!
    this.notify(
      this.manualYaw === null
        ? '↻ Авто-ориентация створа по уклону воды включена'
        : `↻ Ручной угол створа: ${Math.round((this.manualYaw * 180) / Math.PI)}°`,
      'info',
    );
  }

  cycleSpeed() {
    this.speedIndex = (this.speedIndex + 1) % SPEED_MODES.length;
    const mult = SPEED_MODES[this.speedIndex];
    const btn = document.getElementById('btn-speed');
    btn.textContent = mult === 0 ? '⏸ Пауза' : `▶ ×${mult}`;
    btn.classList.toggle('active', mult > 1);
  }

  toggleContours() {
    this.showContours = !this.showContours;
    this.worldView.terrainMat.uniforms.uShowContours.value = this.showContours ? 1.0 : 0.0;
    document.getElementById('btn-contours').classList.toggle('active', this.showContours);
  }

  // ==========================================================================
  //  ВЗАИМОДЕЙСТВИЕ С РЕЛЬЕФОМ, КОПКА КАНАЛОВ И СТРОИТЕЛЬСТВО ГЭС
  // ==========================================================================
  _bindWorldInput() {
    this.canvas.addEventListener('pointerdown', (e) => {
      this.audio.unlock();
      if (e.button !== 0) return;
      if (this.camCtrl.touches.size >= 2) return;

      const hit = this.raycastValley(e.clientX, e.clientY);
      if (!hit) return;

      // Если кликнули по существующему агрегату в режиме осмотра (или зажали Alt) — открываем инспектор
      const nearStruct = this.hydro.findStructureNear(hit.wx, hit.wz, 12);
      if (nearStruct && (this.activeToolId === 'inspect' || e.altKey)) {
        this.selectedStruct = nearStruct;
        document.getElementById('struct-inspector').classList.remove('hidden');
        this._refreshInspector();
        return;
      }

      // Разовые кликовые инструменты (Турбины, Водосбросы, ЛЭП, Снос)
      if (this.activeToolId === 'spillway' || this.activeToolId.startsWith('turbine_') ||
          this.activeToolId === 'powerline' || this.activeToolId === 'demolish' ||
          this.activeToolId === 'inspect') {
        this._applySingleClickTool(hit.wx, hit.wz);
        return;
      }

      // Непрерывные трассовые инструменты (Копка канала, Облицовка, Грунтовая дамба, Бетонная плотина)
      this.pointerDown = true;
      this.lastBrushWorld = { wx: hit.wx, wz: hit.wz };
      const s = this.hydro.sampleAtWorld(hit.wx, hit.wz);

      if (this.activeToolId === 'canal_dig') {
        // При зажатом Shift фиксируем отметку дна в точке старта для идеального ровного канала!
        this.lockedGradeElev = e.shiftKey ? (s.bed - 1.8) : null;
      } else if (this.activeToolId === 'concrete_dam') {
        // Фиксируем единую горизонтальную отметку гребня плотины вдоль всего мазка через каньон!
        this.lockedGradeElev = Math.max(s.bed, s.surface) + 5.2;
      } else if (this.activeToolId === 'earth_dam') {
        this.lockedGradeElev = Math.max(s.bed, s.surface) + 4.0;
      } else {
        this.lockedGradeElev = null;
      }

      this._applyContinuousStrokePoint(hit.wx, hit.wz, 0);
    });

    window.addEventListener('pointermove', (e) => {
      const hit = this.raycastValley(e.clientX, e.clientY);
      this.hoverWorld = hit;
      if (hit) {
        this.worldView.updateCursor(hit.wx, hit.wz, this.brushRadius, this.activeToolId, this.manualYaw, true);
        this._updateProbeBar(hit.wx, hit.wz);
      } else {
        this.worldView.updateCursor(0, 0, this.brushRadius, this.activeToolId, this.manualYaw, false);
      }

      if (!this.pointerDown || !hit || !this.lastBrushWorld) return;
      if (this.camCtrl.touches.size >= 2) return;

      const dx = hit.wx - this.lastBrushWorld.wx;
      const dz = hit.wz - this.lastBrushWorld.wz;
      const dist = Math.hypot(dx, dz);
      const stepLen = Math.max(2.2, this.brushRadius * 0.35);
      if (dist < stepLen) return;

      const steps = Math.min(20, Math.ceil(dist / stepLen));
      for (let i = 1; i <= steps; i++) {
        const t = i / steps;
        const ix = lerp(this.lastBrushWorld.wx, hit.wx, t);
        const iz = lerp(this.lastBrushWorld.wz, hit.wz, t);
        // Для ровного канала с Shift делаем плавный гидравлический уклон 0.5% по ходу движения!
        if (this.activeToolId === 'canal_dig' && this.lockedGradeElev !== null) {
          this.lockedGradeElev -= (dist / steps) * 0.005;
        }
        this._applyContinuousStrokePoint(ix, iz, i);
      }
      this.lastBrushWorld = { wx: hit.wx, wz: hit.wz };
    });

    window.addEventListener('pointerup', () => {
      this.pointerDown = false;
      this.lastBrushWorld = null;
      this.lockedGradeElev = null;
    });
  }

  _applyContinuousStrokePoint(wx, wz, subIdx) {
    const budget = this.economy.cash;
    const creative = this.economy.creative;

    if (this.activeToolId === 'canal_dig') {
      const res = this.hydro.excavateCanal(wx, wz, this.brushRadius, 1.35, this.lockedGradeElev, budget, creative);
      if (res.excavatedM3 > 0) {
        this.economy.spend(res.cost);
        if (subIdx === 0) {
          this.audio.playDig();
          const s = this.hydro.sampleAtWorld(wx, wz);
          this.spray.spawnDigSplash(wx, s.bed, wz, 8);
        }
      } else if (!creative && budget < 35 && subIdx === 0) {
        this.notify('Недостаточно средств на земляные работы!', 'warn');
      }
    } else if (this.activeToolId === 'canal_liner') {
      const res = this.hydro.lineCanalConcrete(wx, wz, this.brushRadius, budget, creative);
      if (res.count > 0) {
        this.economy.spend(res.cost);
        if (subIdx === 0) this.audio.playBuild();
      }
    } else if (this.activeToolId === 'earth_dam') {
      const res = this.hydro.buildEarthDam(wx, wz, this.brushRadius, 1.8, this.lockedGradeElev, budget, creative);
      if (res.addedM3 > 0) {
        this.economy.spend(res.cost);
        if (subIdx === 0) this.audio.playDig();
      }
    } else if (this.activeToolId === 'concrete_dam') {
      const crest = this.lockedGradeElev ?? (this.hydro.sampleAtWorld(wx, wz).bed + 5.0);
      const res = this.hydro.buildConcreteDam(wx, wz, this.brushRadius, crest, budget, creative);
      if (res.addedM3 > 0) {
        this.economy.spend(res.cost);
        if (subIdx === 0) this.audio.playBuild();
      } else if (!creative && budget < 150 && subIdx === 0) {
        this.notify('Недостаточно бетона/средств (можно выпустить зелёные облигации справа!)', 'warn');
      }
    }
  }

  _applySingleClickTool(wx, wz) {
    const budget = this.economy.cash;
    const creative = this.economy.creative;

    if (this.activeToolId === 'inspect') {
      const st = this.hydro.findStructureNear(wx, wz, 15);
      if (st) {
        this.selectedStruct = st;
        document.getElementById('struct-inspector').classList.remove('hidden');
        this._refreshInspector();
      }
      return;
    }

    if (this.activeToolId === 'spillway') {
      const res = this.hydro.placeSpillway(wx, wz, this.manualYaw, budget, creative);
      if (!res.ok) {
        this.notify(res.reason, 'warn');
        return;
      }
      this.economy.spend(res.cost);
      this.audio.playBuild();
      this.selectedStruct = res.structure;
      document.getElementById('struct-inspector').classList.remove('hidden');
      this._refreshInspector();
      this.notify('🌊 Установлен водосброс с сегментным затвором и автозащитой от перелива!', 'good');
      return;
    }

    if (this.activeToolId.startsWith('turbine_')) {
      const typeId = this.activeToolId.replace('turbine_', '');
      const res = this.hydro.placeTurbine(typeId, wx, wz, this.manualYaw, budget, creative);
      if (!res.ok) {
        this.notify(res.reason, 'warn');
        return;
      }
      this.economy.spend(res.cost);
      this.audio.playBuild();
      this.selectedStruct = res.structure;
      document.getElementById('struct-inspector').classList.remove('hidden');
      this._refreshInspector();
      this.notify(`⚡ Смонтирован гидроагрегат ${res.structure.spec.name}! Копите напор верхнего бьефа.`, 'good');
      return;
    }

    if (this.activeToolId === 'powerline') {
      // Находим ближайший город к клику
      let bestCity = null;
      let bestD = 95;
      for (const c of this.economy.cities) {
        const d = Math.hypot(c.x - wx, c.z - wz);
        if (d < bestD) { bestD = d; bestCity = c; }
      }
      if (!bestCity) {
        this.notify('Кликните ближе к городу (или нажмите «Подключить ЛЭП» в карточке города справа)', 'info');
        return;
      }
      const res = this.economy.connectCityGrid(bestCity.id);
      if (!res.ok) this.notify(res.reason, 'warn');
      else this.audio.playBuild();
      this._renderCityCards();
      return;
    }

    if (this.activeToolId === 'demolish') {
      const res = this.hydro.demolishAt(wx, wz);
      if (res.removed) {
        this.economy.earn(res.refund);
        this.audio.playDig();
        if (this.selectedStruct && !this.hydro.turbines.includes(this.selectedStruct) && !this.hydro.spillways.includes(this.selectedStruct)) {
          this.selectedStruct = null;
          document.getElementById('struct-inspector').classList.add('hidden');
        }
        this.notify(res.refund > 0 ? `Демонтаж выполнен (возврат +${res.refund.toLocaleString('ru-RU')} ₽)` : 'Участок расчищен', 'info');
      }
    }
  }

  // ==========================================================================
  //  ОБНОВЛЕНИЕ HUD, КАРТОЧЕК РАСТУЩИХ ГОРОДОВ И ИНСПЕКТОРА
  // ==========================================================================
  _updateProbeBar(wx, wz) {
    const s = this.hydro.sampleAtWorld(wx, wz);
    const el = document.getElementById('probe-readout');
    if (!el) return;
    const regime = s.depth < 0.03 ? 'сухо' : (s.froude > 1.0 ? 'бурный Fr>1' : 'спокойный');
    const cover = s.concrete > 0.2 ? 'Бетон плотины' : (s.lined ? 'Бетон канала' : (s.earthDam ? 'Насыпь дамбы' : 'Грунт/Скала'));
    el.textContent = `Дно: ${s.bed.toFixed(1)} м (${cover}) · Вода: ${s.depth > 0.02 ? s.surface.toFixed(1) + ' м' : '—'} · Глуб.: ${s.depth.toFixed(2)} м · V: ${s.speed.toFixed(2)} м/с (${regime})`;
  }

  _renderCityCards() {
    const wrap = document.getElementById('cities-list');
    if (!wrap) return;
    wrap.innerHTML = '';

    for (const c of this.economy.cities) {
      const card = document.createElement('div');
      card.className = `city-card${c.isFlooded ? ' flooded' : ''}`;
      card.id = `city-card-${c.id}`;

      const lineCost = this.economy.estimatePowerLineCost(c);
      const pct = Math.round(c.growthProgress * 100);
      const supplyText = c.connected
        ? `⚡ ${c.suppliedMW.toFixed(2)} / ${c.currentDemandMW.toFixed(2)} МВт`
        : `Не подключён (спрос ${c.currentDemandMW.toFixed(2)} МВт)`;

      let extraNote = '';
      if (c.isFlooded) {
        extraNote = `<div class="city-note warn">! Кварталы подтоплены! Рост остановлен</div>`;
      } else if (c.needsIrrigation) {
        extraNote = c.irrigated
          ? `<div class="city-note">◈ Оросительный канал активен (+95 ₽/с, рост ×1.75)</div>`
          : `<div class="city-note warn">◈ Подведите канал к зелёному кольцу (+95 ₽/с)</div>`;
      }

      card.innerHTML = `
        <div class="city-top">
          <span class="city-name" data-flycity="${c.id}">▸ ${c.name}</span>
          <span class="city-badge">${c.levelName} · ${c.buildingIndices.length} зд.</span>
        </div>
        <div class="city-meta">
          <span>Нас.: ${c.population.toLocaleString('ru-RU')}</span>
          <span>${supplyText}</span>
        </div>
        <div class="progress-track" title="Прогресс самостоятельной застройки нового квартала">
          <div class="progress-fill" style="width:${pct}%"></div>
        </div>
        ${extraNote}
        ${!c.connected ? `<div class="city-actions"><button class="connect-btn" data-connect="${c.id}">⚡ Подключить ЛЭП (${lineCost.toLocaleString('ru-RU')} ₽)</button></div>` : ''}
      `;
      wrap.appendChild(card);
    }

    wrap.querySelectorAll('[data-flycity]').forEach((el) => {
      el.addEventListener('click', () => {
        const c = this.economy.cities.find((x) => x.id === el.dataset.flycity);
        if (c) this.camCtrl.flyTo(c.x, c.z, 118, c.baseElevation);
      });
    });

    wrap.querySelectorAll('[data-connect]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const res = this.economy.connectCityGrid(btn.dataset.connect);
        if (!res.ok) this.notify(res.reason, 'warn');
        else this.audio.playBuild();
        this._renderCityCards();
        this._refreshHUD();
      });
    });
  }

  _refreshHUD() {
    const sum = this.economy.getSummary();
    document.getElementById('hud-cash').textContent = this.economy.creative
      ? '∞ КРЕАТИВ'
      : `${Math.round(sum.cash).toLocaleString('ru-RU')} ₽`;

    const netSign = sum.netPerSec >= 0 ? '+' : '';
    const netEl = document.getElementById('hud-net');
    netEl.textContent = `${netSign}${Math.round(sum.netPerSec).toLocaleString('ru-RU')} ₽/с`;
    netEl.style.color = sum.netPerSec >= 0 ? '#4ade80' : '#f87171';

    document.getElementById('hud-mw').textContent = `${sum.totalMW.toFixed(2)} МВт`;
    document.getElementById('hud-demand').textContent = `Сеть: ${sum.suppliedCityMW.toFixed(2)} / ${sum.connectedDemandMW.toFixed(2)} МВт`;

    const hh = Math.floor(sum.hour);
    const mm = Math.floor((sum.hour - hh) * 60);
    document.getElementById('hud-clock').textContent = `День ${sum.day} · ${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
    document.getElementById('hud-tariff').textContent = sum.periodLabel;
    const chipTariff = document.getElementById('chip-tariff');
    chipTariff.className = `stat-chip stat-tariff ${sum.periodClass}`;

    document.getElementById('hud-weather').textContent = `${sum.weather.icon} ${sum.weather.label}`;
    document.getElementById('hud-stockpile').textContent = `Отвал грунта: ${Math.round(sum.soilStockpileM3).toLocaleString('ru-RU')} м³`;
    document.getElementById('hud-pop-total').textContent = `Население долины: ${sum.totalPopulation.toLocaleString('ru-RU')} жит.`;
    document.getElementById('hud-loan').textContent = `Долг по облигациям: ${Math.round(sum.loan).toLocaleString('ru-RU')} ₽`;

    // Следующий активный грант
    const nextMs = MILESTONES.find((m) => !this.economy.completedMilestones.has(m.id));
    if (nextMs) {
      document.getElementById('ms-title').textContent = `${nextMs.title} (+${nextMs.reward.toLocaleString('ru-RU')} ₽)`;
      document.getElementById('ms-desc').textContent = nextMs.desc;
    } else {
      document.getElementById('ms-title').textContent = 'Все государственные гранты получены!';
      document.getElementById('ms-desc').textContent = 'Ваш каскад ГЭС стал энергетическим сердцем долины.';
    }

    this._renderCityCards();
    if (this.selectedStruct) this._refreshInspector();
  }

  _refreshInspector() {
    const st = this.selectedStruct;
    if (!st) return;
    const title = document.getElementById('insp-title');
    const metrics = document.getElementById('insp-metrics');
    const slider = document.getElementById('insp-slider');
    const sliderLbl = document.getElementById('insp-slider-label');
    const autoChk = document.getElementById('insp-auto');
    const autoLbl = document.getElementById('insp-auto-label');

    if (st.kind === 'turbine') {
      title.textContent = `⚙️ ${st.spec.name} (#${st.id})`;
      metrics.innerHTML = `
        <span>Мощность: <b>${st.powerMW.toFixed(2)} МВт</b></span>
        <span>Напор чист.: <b>${st.netHead.toFixed(1)} м</b></span>
        <span>Расход Q: <b>${st.flowQ.toFixed(1)} м³/с</b></span>
        <span>КПД η: <b>${Math.round(st.efficiency * 100)}%</b></span>
        <span>Ресурс: <b>${Math.round(st.condition * 100)}%</b></span>
        <span>Кавитация: <b>${st.cavitation > 0.2 ? '⚠️ есть' : 'норма'}</b></span>
      `;
      const pct = Math.round(st.throttle * 100);
      slider.value = pct;
      sliderLbl.textContent = `Открытие направляющего аппарата: ${pct}%`;
      autoChk.checked = !!st.autoDispatch;
      autoLbl.textContent = 'Авто-диспетчер по пикам энергорынка (копить ночью)';
    } else {
      title.textContent = `🌊 Водосброс с трамплином (#${st.id})`;
      metrics.innerHTML = `
        <span>Сброс Q: <b>${st.currentFlowQ.toFixed(1)} м³/с</b></span>
        <span>Скорость струи: <b>${st.jetSpeed.toFixed(1)} м/с</b></span>
        <span>Отметка порога: <b>${st.sillElev.toFixed(1)} м</b></span>
        <span>Уставка бьефа: <b>${st.targetHeadElev.toFixed(1)} м</b></span>
      `;
      const pct = Math.round(st.openRatio * 100);
      slider.value = pct;
      sliderLbl.textContent = `Подъём сегментного затвора: ${pct}%`;
      autoChk.checked = !!st.autoRegulate;
      autoLbl.textContent = 'Авто-сброс паводка при переполнении верхнего бьефа';
    }
  }

  notify(text, kind = 'info') {
    const stack = document.getElementById('toast-stack');
    if (!stack) return;
    const div = document.createElement('div');
    div.className = `toast ${kind}`;
    div.textContent = text;
    stack.prepend(div);
    while (stack.children.length > 4) {
      stack.lastElementChild.remove();
    }
    setTimeout(() => {
      if (div.parentNode) div.remove();
    }, 5200);
  }

  // ==========================================================================
  //  ГЛАВНЫЙ ЦИКЛ СИМУЛЯЦИИ И РЕНДЕРА
  // ==========================================================================
  _loop(now) {
    requestAnimationFrame((t) => this._loop(t));

    const rawDt = Math.min(0.08, Math.max(0.001, (now - this._lastTime) / 1000));
    this._lastTime = now;
    this._frameCount++;

    // Подсчёт реального FPS
    this._fpsFrames++;
    this._fpsAccum += rawDt;
    if (this._fpsAccum >= 0.5) {
      this.fps = Math.round(this._fpsFrames / this._fpsAccum);
      this._fpsFrames = 0;
      this._fpsAccum = 0;
    }

    // Скорость времени подшагами (как в frontline-steel-and-drones: стабильность CFL на ×2 и ×5!)
    const speedMult = SPEED_MODES[this.speedIndex];
    if (speedMult > 0) {
      const macroPasses = speedMult <= 2 ? 1 : 2;
      const simDtPerPass = (rawDt * speedMult) / macroPasses;
      for (let p = 0; p < macroPasses; p++) {
        this.hydro.step(simDtPerPass, this.profile.substepsCap);
      }
      this.economy.update(rawDt * speedMult);
    }

    // Камера и атмосфера суток
    const camGround = this.hydro.sampleAtWorld(this.camCtrl.goalTarget.x, this.camCtrl.goalTarget.z).bed;
    this.camCtrl.update(rawDt, camGround);

    const weather = WEATHER_MODES[this.economy.weatherId] || WEATHER_MODES.normal;
    const { isNight, dayFactor } = this.worldView.updateAtmosphere(this.economy.hour, weather);

    // Если рельеф менялся (копка канала, дамба или размыв Шильдса) — обновляем только dirty-rect!
    const dirtyRect = this.hydro.consumeTerrainDirty();
    if (dirtyRect) {
      this.worldView.updateTerrainGeometryRect(dirtyRect.x0, dirtyRect.z0, dirtyRect.x1, dirtyRect.z1);
      if (this.renderer.shadowMap.enabled) this.renderer.shadowMap.needsUpdate = true;
    }

    // Обновляем водную поверхность, 3D-брызги, агрегаты и инстансы растущих городов
    this.worldView.updateWaterAndWetness(this.hydro.simTime);
    this.worldView.syncHydroStructures();

    if (this.economy.buildingsDirty || (this._frameCount % 12 === 0)) {
      this.worldView.syncCityInstances();
      this.economy.buildingsDirty = false;
      if (this.renderer.shadowMap.enabled && this.profile.shadowEvery > 0 && (this._frameCount % 30 === 0)) {
        this.renderer.shadowMap.needsUpdate = true;
      }
    }

    const rainAmt = this.economy.weatherId === 'flood' ? 1.0 : (this.economy.weatherId === 'rain' ? 0.6 : 0);
    this.spray.update(rawDt * Math.max(1, Math.min(2, speedMult)), this.hydro, this.camCtrl.target, dayFactor, rainAmt);

    // Обновляем звук воды и турбин
    let totalSpillQ = 0;
    for (const s of this.hydro.spillways) totalSpillQ += s.currentFlowQ;
    this.audio.updateContinuous(this.camCtrl.distance, totalSpillQ, this.economy.totalMW);

    // Троттлинг карты теней (как в last-shore: не каждый кадр!)
    if (this.renderer.shadowMap.enabled && this.profile.shadowEvery > 0) {
      if ((this._frameCount % this.profile.shadowEvery) === 0) {
        this.renderer.shadowMap.needsUpdate = true;
      }
    }

    this.renderer.render(this.scene, this.camera);

    // Обновляем DOM HUD экономно (4 раза в секунду — ноль лишнего layout thrashing!)
    this._uiRefreshAccum += rawDt;
    if (this._uiRefreshAccum >= 0.25) {
      this._uiRefreshAccum = 0;
      this._refreshHUD();
      if (this.showDiag) {
        const diagEl = document.getElementById('diag-panel');
        diagEl.textContent = formatDiagReport({
          fps: this.fps,
          hydroMs: this.hydro.lastStepMs,
          grid: `${this.hydro.grid}×${this.hydro.grid}`,
          activeTiles: this.hydro.activeTileCount,
          totalTiles: this.hydro.totalTiles,
          substeps: this.hydro.lastSubsteps,
          waterVolumeM3: this.hydro.totalWaterVolumeM3,
          drawCalls: this.renderer.info.render.calls,
          triangles: this.renderer.info.render.triangles,
          cityBuildings: this.economy.allBuildings.length,
          shadows: this.renderer.shadowMap.enabled ? `вкл (1/${this.profile.shadowEvery} кадра)` : 'выкл',
        });
      }
    }
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.__game = new CascadeHydroGame();
});
