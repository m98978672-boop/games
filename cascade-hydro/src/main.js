// ============================================================================
//  КАСКАД: ЖИВАЯ ВОДА v0.5 — Главный контроллер игры:
//  - Готовые цельные комплексы ГЭС/ГАЭС (стартовая сухая Деривационная ГЭС-1 + в 1 клик [8/9/0])
//  - Геймплей разведки перепада высот ΔH [1], прокладки деривационных каналов [2] и облицовки [4]
//  - 7 многосоставных архитектурных 3D-моделей городских зданий с неискажёнными гранными UV
//  - Система логики 8 городов (5 контуров потребностей, указы генплана, премия за водоводы)
// ============================================================================

import * as THREE from 'three';
import {
  WORLD,
  MAP_SCALES,
  applyMapScale,
  CONSTRUCTION,
  VALLEY_PRESETS,
  STARTER_READY_HPP_SITES,
  QUALITY_PROFILES,
  WEATHER_MODES,
  TOOLS,
  MILESTONES,
} from './config.js';
import { CITY_FOCUS_MODES } from './city-logic.js';
import { detectDevice, wantsSafeMode } from './device.js';
import { probeWebGL, formatDiagReport } from './diag.js';
import { clamp, lerp } from './noise.js';
import { buildValleyTerrain, getValleyHeadwaterSources } from './valley.js';
import { HydroSimulation } from './hydro.js';
import { EconomyAndCities, REVENUE_STREAM_DEFS } from './economy.js';
import { buildAllProceduralTextures, TEXTURE_SHADE_CATALOG } from './textures.js';
import { ANIMATION_REGISTRY } from './living-world.js';
import { WorldView } from './world-view.js';
import { SprayAndRainSystem } from './spray.js';
import { ValleyCameraController } from './camera.js';
import { HydroAudio } from './audio.js';
import { TutorialController } from './tutorial.js';
import { SVG_ICONS } from './icons.js';

const WEATHER_ORDER = ['normal', 'rain', 'flood', 'low_water'];
const SPEED_MODES = [0, 1, 2, 5];

function nextFrame() {
  return new Promise((resolve) => requestAnimationFrame(() => resolve()));
}

class CascadeHydroGame {
  constructor() {
    this.canvas = document.getElementById('scene');
    this.device = detectDevice();
    const safe = wantsSafeMode();

    const savedQuality = this._loadSetting('quality', null);
    const initialQualityId = safe ? 'low' : (savedQuality || this.device.recommendedQuality);
    this.profile = QUALITY_PROFILES[initialQualityId] || QUALITY_PROFILES.medium;

    this.selectedScaleId = 'km5'; // 5×5 км по умолчанию!
    applyMapScale(this.selectedScaleId);

    this.selectedPresetId = 'bystritsa';
    this.selectedMode = 'standard';
    this.activeSideTab = 'cities';
    this.isInPreGameLoader = true;
    this.isLoadingMap = true;
    this.ready = false;

    this.audio = new HydroAudio();
    this._initRenderer();

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(46, window.innerWidth / window.innerHeight, 2.0, 28500);
    this.camCtrl = new ValleyCameraController(this.camera, this.canvas);

    // Состояние инструментов
    this.activeToolId = 'concrete_dam';
    this.brushSizeIndex = 1;
    this.brushRadius = WORLD.brushSizes[1];
    this.damTierIndex = 1;
    this.manualYaw = null;
    this.showContours = false;
    this.speedIndex = 1;
    this.selectedStruct = null;

    this.pointerDown = false;
    this.lastBrushWorld = null;
    this.lockedGradeElev = null;
    this.hoverWorld = null;

    this.showDiag = false;
    this.fps = 60;
    this._fpsFrames = 0;
    this._fpsAccum = 0;
    this._frameCount = 0;
    this._uiRefreshAccum = 0;
    this._lastTime = performance.now();

    this._onResize();
    window.addEventListener('resize', () => this._onResize());

    this._bindLoaderUI();
    this._bootAsync();
  }

  _setLoaderProgress(pct, text) {
    const bar = document.getElementById('loader-bar-fill');
    const lbl = document.getElementById('loader-stage');
    const pctEl = document.getElementById('loader-pct');
    if (bar) bar.style.width = `${pct}%`;
    if (lbl) lbl.textContent = text;
    if (pctEl) pctEl.textContent = `${Math.round(pct)}%`;
  }

  _syncScaleLabelsInUI() {
    const sc = MAP_SCALES[this.selectedScaleId] || MAP_SCALES.km5;
    const badge = document.getElementById('hud-scale-badge');
    if (badge) badge.textContent = sc.short;

    const mBystr = document.getElementById('scen-meta-bystritsa');
    const mRapids = document.getElementById('scen-meta-rapids');
    const mDelta = document.getElementById('scen-meta-delta');
    if (mBystr) mBystr.textContent = `${sc.short} · ${sc.areaKm2} · 3 реки и ледники`;
    if (mRapids) mRapids.textContent = `${sc.short} · ${sc.areaKm2} · Двойной каньон ГАЭС`;
    if (mDelta) mDelta.textContent = `${sc.short} · ${sc.areaKm2} · Судоходное русло`;

    // Обновляем 4 прецизионные кнопки кисти и 4 яруса высоты плотины под масштаб карты!
    for (let i = 0; i < 4; i++) {
      const bBtn = document.getElementById(`brush-btn-${i}`);
      if (bBtn && WORLD.brushSizes[i] !== undefined) {
        bBtn.textContent = `${Math.round(WORLD.brushSizes[i] * 2)}м`;
      }

      const tBtn = document.getElementById(`tier-btn-${i}`);
      const addH = Math.round(CONSTRUCTION.damHeightTiers[i]?.addHeight || 11);
      if (tBtn) tBtn.textContent = `+${addH}м`;
    }
    this.brushSizeIndex = clamp(this.brushSizeIndex, 0, WORLD.brushSizes.length - 1);
    this.brushRadius = WORLD.brushSizes[this.brushSizeIndex] || WORLD.brushSizes[1];
  }

  _bindLoaderUI() {
    const enterBtn = document.getElementById('btn-enter-valley');
    const stdPill = document.getElementById('pill-mode-std');
    const crePill = document.getElementById('pill-mode-cre');
    const tutChk = document.getElementById('chk-start-tutorial');

    if (tutChk && this._loadSetting('tutorialDone', '') === '1') {
      tutChk.checked = false;
    }

    // Переключение масштаба карты: 0.8×0.8 км / 5×5 км / 10×10 км
    document.querySelectorAll('.scale-card').forEach((card) => {
      card.addEventListener('click', () => {
        if (this.isLoadingMap) return;
        const scaleId = card.dataset.scale;
        if (!scaleId || scaleId === this.selectedScaleId) return;
        this.selectedScaleId = scaleId;
        applyMapScale(scaleId);
        this.camCtrl.syncToWorldScale();
        this._syncScaleLabelsInUI();
        document.querySelectorAll('.scale-card').forEach((c) => c.classList.remove('active'));
        card.classList.add('active');
        this.loadValleyMapAsync(this.selectedPresetId);
      });
    });

    // Переключение топографии долины
    document.querySelectorAll('.scenario-card').forEach((card) => {
      card.addEventListener('click', () => {
        if (this.isLoadingMap) return;
        const presetId = card.dataset.preset;
        if (!presetId || presetId === this.selectedPresetId) return;
        document.querySelectorAll('.scenario-card').forEach((c) => c.classList.remove('active'));
        card.classList.add('active');
        this.loadValleyMapAsync(presetId);
      });
    });

    const setMode = (mode) => {
      this.selectedMode = mode;
      stdPill.classList.toggle('active', mode === 'standard');
      crePill.classList.toggle('active', mode === 'creative');
    };
    stdPill.addEventListener('click', () => setMode('standard'));
    crePill.addEventListener('click', () => setMode('creative'));

    enterBtn.addEventListener('click', () => {
      if (this.isLoadingMap) return;
      this.audio.unlock();
      this.enterValley();
    });
  }

  async _bootAsync() {
    const enterBtn = document.getElementById('btn-enter-valley');
    if (enterBtn) {
      enterBtn.disabled = true;
      enterBtn.textContent = 'Генерация бассейна…';
    }
    this._syncScaleLabelsInUI();

    this._setLoaderProgress(10, 'Синтез текстуры воды 512×512, мега-атласа 64 фасадов и 432 пресетов оттенков…');
    await nextFrame();
    this.textures = buildAllProceduralTextures(this.renderer);

    const sc = MAP_SCALES[this.selectedScaleId];
    this._setLoaderProgress(24, `Выделение памяти уравнений Сен-Венана (${sc.label})…`);
    await nextFrame();
    this.hydro = new HydroSimulation(this.profile.grid, this.selectedPresetId, true);

    const g = this.hydro.grid;
    const z1 = Math.floor(g / 3);
    const z2 = Math.floor((g * 2) / 3);

    this._setLoaderProgress(40, 'Геодезическая съёмка ледниковых хребтов и скальных ущелий (1/3)…');
    await nextFrame();
    buildValleyTerrain(g, this.hydro, this.selectedPresetId, 0, z1);

    this._setLoaderProgress(56, 'Формирование террас под 8 городов и деривационного плато (2/3)…');
    await nextFrame();
    buildValleyTerrain(g, this.hydro, this.selectedPresetId, z1, z2);

    this._setLoaderProgress(72, 'Наполнение рек «Быстрица», «Серебрянка» и «Гремучий» (3/3)…');
    await nextFrame();
    buildValleyTerrain(g, this.hydro, this.selectedPresetId, z2, g);
    this.hydro.finalizeValleySetup(18);
    this.hydro.spawnStarterReadyHPP(this.selectedPresetId);

    this._setLoaderProgress(86, 'Запуск Готовой ГЭС-1, системы логики 8 городов и 300 анимаций…');
    await nextFrame();
    this.economy = new EconomyAndCities(this.hydro, {
      onNotify: (msg, kind) => this.notify(msg, kind),
      onMilestone: (m) => {
        this.audio.playMilestone();
        this.notify(`★ Грант Минэнерго «${m.title}»: +${m.reward.toLocaleString('ru-RU')} ₽!`, 'good');
      },
    });

    this.worldView = new WorldView(this.scene, this.hydro, this.economy, this.profile, this.renderer, this.textures);
    this.spray = new SprayAndRainSystem(this.scene, this.profile.maxParticles);
    this.tutorial = new TutorialController(this);

    this._setLoaderProgress(96, 'Предкомпиляция WebGL-шейдеров воды, 3D-перелива и мега-атласа городов…');
    await nextFrame();
    this.renderer.compile(this.scene, this.camera);

    this._initUI();
    this._populateWorldCatalogTab();
    this._bindWorldInput();
    this._rebuildLandmarksBar();
    this.worldView.syncCityInstances();
    this.worldView.syncEngineeredVolumes();

    this._setLoaderProgress(100, `Бассейн «${VALLEY_PRESETS[this.selectedPresetId].name}» (${sc.short}, ${sc.areaKm2}) готов!`);
    this.isLoadingMap = false;
    this.ready = true;

    const loaderBackdrop = document.getElementById('map-loader');
    if (loaderBackdrop) loaderBackdrop.classList.add('ready-preview');
    if (enterBtn) {
      enterBtn.disabled = false;
      enterBtn.textContent = `▶ Войти в бассейн (${sc.short}) и начать строительство`;
    }

    this._lastTime = performance.now();
    requestAnimationFrame((t) => this._loop(t));

    if (window.location.search.includes('autostart=1')) {
      this.enterValley();
    }
  }

  async loadValleyMapAsync(presetId) {
    this.isLoadingMap = true;
    this.selectedPresetId = presetId;
    const sc = MAP_SCALES[this.selectedScaleId];
    const enterBtn = document.getElementById('btn-enter-valley');
    if (enterBtn) {
      enterBtn.disabled = true;
      enterBtn.textContent = `Генерация карты ${sc.short}…`;
    }

    this._setLoaderProgress(18, `Перестройка бассейна «${VALLEY_PRESETS[presetId].name}» (${sc.label})…`);
    await nextFrame();
    this.hydro.presetId = presetId;
    this.hydro._clearArrays();

    const g = this.hydro.grid;
    const halfG = Math.floor(g / 2);

    this._setLoaderProgress(48, 'Скульптурирование хребтов, ущелий и террас 8 городов (1/2)…');
    await nextFrame();
    buildValleyTerrain(g, this.hydro, presetId, 0, halfG);

    this._setLoaderProgress(76, 'Наполнение русел рек и прогрев гидродинамики Сен-Венана (2/2)…');
    await nextFrame();
    buildValleyTerrain(g, this.hydro, presetId, halfG, g);
    this.hydro.finalizeValleySetup(18);
    this.hydro.spawnStarterReadyHPP(presetId);

    this._setLoaderProgress(92, 'Размещение Готовой ГЭС-1, 8 городов, флота, поездов, ВЭС и лесов…');
    await nextFrame();
    this.economy.resetEconomy();
    this.worldView.rebuildForNewValley();
    this.camCtrl.syncToWorldScale();
    this._syncScaleLabelsInUI();
    this._rebuildLandmarksBar();
    this.selectedStruct = null;
    document.getElementById('struct-inspector').classList.add('hidden');
    this._refreshHUD();

    this._setLoaderProgress(100, `Карта «${VALLEY_PRESETS[presetId].name}» (${sc.short}) готова!`);
    this.isLoadingMap = false;
    if (enterBtn) {
      enterBtn.disabled = false;
      enterBtn.textContent = `▶ Войти в бассейн (${sc.short}) и начать строительство`;
    }
  }

  enterValley() {
    this.isInPreGameLoader = false;
    this.camCtrl.clearKeys();
    const loader = document.getElementById('map-loader');
    if (loader) loader.classList.add('hidden');

    const wantCreative = this.selectedMode === 'creative';
    this.economy.creative = wantCreative;
    document.getElementById('btn-creative').classList.toggle('active', wantCreative);

    const starterT = this.hydro.turbines.find((t) => t.isStarterReady) || this.hydro.turbines[0];
    if (starterT) {
      const dist = 132 * Math.pow(WORLD.horizScale, 0.68);
      this.camCtrl.flyTo(starterT.wx, starterT.wz, dist, starterT.baseY);
    } else {
      const lm = VALLEY_PRESETS[this.selectedPresetId].landmarks[0];
      const bed = this.hydro.sampleAtWorld(lm.x, lm.z).bed;
      this.camCtrl.flyTo(lm.x, lm.z + 25 * WORLD.horizScale, lm.dist, bed);
    }

    const tutChk = document.getElementById('chk-start-tutorial');
    if (tutChk && tutChk.checked) {
      this.tutorial.start(0);
    } else {
      this.tutorial.stop();
      const sc = MAP_SCALES[this.selectedScaleId];
      this.notify(
        `✦ Бассейн «${VALLEY_PRESETS[this.selectedPresetId].name}» (${sc.short}): перед вами Готовая ГЭС-1 — проройте к ней подводящий канал [2] или ставьте новые ГЭС [8/9/0]!`,
        'info',
      );
    }

    this._refreshHUD();
  }

  openMapLoader() {
    this.isInPreGameLoader = true;
    this.camCtrl.clearKeys();
    const loader = document.getElementById('map-loader');
    if (loader) {
      loader.classList.remove('hidden');
      loader.classList.add('ready-preview');
    }
  }

  _flyToCityByIndex(idx) {
    if (!this.economy || !this.economy.cities.length) return;
    const len = this.economy.cities.length;
    this._cityNavIndex = ((idx % len) + len) % len;
    const c = this.economy.cities[this._cityNavIndex];
    const flyZoom = 135 * Math.pow(WORLD.horizScale, 0.72);
    this.camCtrl.flyTo(c.x, c.z, flyZoom, c.baseElevation);
    if (this._cityNavLabelEl) {
      this._cityNavLabelEl.textContent = `⌖ ${c.name} (${this._cityNavIndex + 1}/${len})`;
    }
  }

  _rebuildLandmarksBar() {
    const bar = document.getElementById('landmarks-bar');
    if (!bar) return;
    bar.innerHTML = '';
    this._cityNavIndex = 0;

    const preset = VALLEY_PRESETS[this.selectedPresetId] || VALLEY_PRESETS.bystritsa;
    const gorgeLm = preset.landmarks[0];
    if (gorgeLm) {
      const damBtn = document.createElement('button');
      damBtn.className = 'lm-btn';
      damBtn.title = 'Перелететь к Готовой ГЭС-1 или действующему гидроузлу';
      damBtn.textContent = '▲ К Готовой ГЭС';
      damBtn.addEventListener('click', () => {
        if (this.hydro.turbines.length > 0) {
          const t = this.hydro.turbines.find((x) => x.isStarterReady) || this.hydro.turbines[0];
          const zoom = 128 * Math.pow(WORLD.horizScale, 0.68);
          this.camCtrl.flyTo(t.wx, t.wz, zoom, t.baseY);
        } else {
          const bed = this.hydro.sampleAtWorld(gorgeLm.x, gorgeLm.z).bed;
          this.camCtrl.flyTo(gorgeLm.x, gorgeLm.z, gorgeLm.dist, bed);
        }
      });
      bar.appendChild(damBtn);
    }

    // Быстрый перелёт по перспективным створам с высоким перепадом высот ΔH для новых ГЭС и каналов!
    const siteCfg = STARTER_READY_HPP_SITES[this.selectedPresetId] || STARTER_READY_HPP_SITES.bystritsa;
    if (siteCfg && siteCfg.prospectSites && siteCfg.prospectSites.length > 0) {
      this._prospectNavIndex = 0;
      const pBtn = document.createElement('button');
      pBtn.className = 'lm-btn';
      pBtn.title = 'Показать перспективные места с большим перепадом высот ΔH под новые каналы и Готовые ГЭС';
      pBtn.textContent = '◈ Створы ΔH';
      pBtn.addEventListener('click', () => {
        const list = siteCfg.prospectSites;
        const pr = list[this._prospectNavIndex % list.length];
        this._prospectNavIndex = (this._prospectNavIndex + 1) % list.length;
        const wx = pr.baseX * WORLD.horizScale;
        const wz = pr.baseZ * WORLD.horizScale;
        const bed = this.hydro.sampleAtWorld(wx, wz).bed;
        const zoom = (pr.dist || 136) * Math.pow(WORLD.horizScale, 0.68);
        this.camCtrl.flyTo(wx, wz, zoom, bed);
        const site = this.hydro.evaluateHppSite(wx, wz, null, 'kaplan');
        this.notify(`${pr.label} — перепад ΔH ${site.grossHead.toFixed(1)} м, потенциал ~${site.potentialMW.toFixed(1)} МВт!`, 'info');
      });
      bar.appendChild(pBtn);
    }

    // Быстрый перелёт к 3 природным истокам рек (ледниковые гроты и скальные ключи)
    const hwSources = getValleyHeadwaterSources(this.selectedPresetId);
    if (hwSources.length > 0) {
      this._hwNavIndex = 0;
      const hwBtn = document.createElement('button');
      hwBtn.className = 'lm-btn';
      hwBtn.title = 'Показать откуда идёт вода: перелёт по 3 горным истокам рек';
      hwBtn.textContent = `❄ Исток: ${hwSources[0].name}`;
      hwBtn.addEventListener('click', () => {
        const list = getValleyHeadwaterSources(this.selectedPresetId);
        const src = list[this._hwNavIndex % list.length];
        this._hwNavIndex = (this._hwNavIndex + 1) % list.length;
        const bed = this.hydro.sampleAtWorld(src.outX, src.outZ).bed;
        const zoom = 128 * Math.pow(WORLD.horizScale, 0.68);
        this.camCtrl.flyTo(src.outX, src.outZ, zoom, bed);
        hwBtn.textContent = `❄ Исток: ${src.name}`;
      });
      bar.appendChild(hwBtn);
    }

    if (this.economy && this.economy.cities.length > 0) {
      const prevBtn = document.createElement('button');
      prevBtn.className = 'lm-btn';
      prevBtn.title = 'Предыдущий город';
      prevBtn.textContent = '◀';
      prevBtn.addEventListener('click', () => this._flyToCityByIndex((this._cityNavIndex || 0) - 1));

      const cityBtn = document.createElement('button');
      cityBtn.className = 'lm-btn';
      cityBtn.textContent = `⌖ ${this.economy.cities[0].name} (1/${this.economy.cities.length})`;
      cityBtn.addEventListener('click', () => this._flyToCityByIndex(this._cityNavIndex || 0));
      this._cityNavLabelEl = cityBtn;

      const nextBtn = document.createElement('button');
      nextBtn.className = 'lm-btn';
      nextBtn.title = 'Следующий город';
      nextBtn.textContent = '▶';
      nextBtn.addEventListener('click', () => this._flyToCityByIndex((this._cityNavIndex || 0) + 1));

      bar.append(prevBtn, cityBtn, nextBtn);
    }
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
  //  МАСШТАБИРУЕМЫЙ АНАЛИТИЧЕСКИЙ RAYMARCH (0.8×0.8 км, 5×5 км и 10×10 км!)
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

    const maxPeakY = 148.0 * WORLD.elevScale;
    const maxRayDist = Math.max(2200.0, WORLD.size * 2.65);
    const tStart = Math.max(2.0, (orig.y - maxPeakY) / (-dir.y));
    const tEnd = Math.min(maxRayDist, (orig.y - (-6.0)) / (-dir.y));
    if (tEnd <= tStart) return null;

    const steps = 96;
    const dt = (tEnd - tStart) / steps;
    let prevT = tStart;
    const half = WORLD.size * 0.496;

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
      if (py <= sample.bed) {
        let lo = prevT;
        let hi = t;
        for (let b = 0; b < 6; b++) {
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
  //  ИНТЕРФЕЙС, 14 ИНСТРУМЕНТОВ, ВКЛАДКИ ГИДРОЛОГИИ / 12 ДОХОДОВ И ИНСПЕКТОР
  // ==========================================================================
  _initUI() {
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

    // Вкладки правой диспетчерской панели (Города / Вода / Доходы / 300-432)
    document.querySelectorAll('.side-tab').forEach((tabBtn) => {
      tabBtn.addEventListener('click', () => {
        const tabId = tabBtn.dataset.tab;
        this.activeSideTab = tabId;
        document.querySelectorAll('.side-tab').forEach((b) => b.classList.toggle('active', b === tabBtn));
        ['cities', 'water', 'revenue', 'world'].forEach((id) => {
          const pane = document.getElementById(`tab-pane-${id}`);
          if (pane) pane.classList.toggle('hidden', id !== tabId);
        });
        this._refreshHUD();
      });
    });

    // Кнопка оптовой отгрузки щебня
    const sellAggBtn = document.getElementById('btn-sell-aggregate');
    if (sellAggBtn) {
      sellAggBtn.addEventListener('click', () => {
        const res = this.economy.sellAggregateBatch();
        if (!res.ok) {
          this.notify(res.reason, 'warn');
        } else {
          this.audio.playMilestone();
          this.notify(`▲ Отгружена баржа гранитного щебня (${res.soldM3.toLocaleString('ru-RU')} м³): +${res.revenue.toLocaleString('ru-RU')} ₽!`, 'good');
          this._refreshHUD();
        }
      });
    }

    // Ширина кисти (4 точных калибра под масштаб карты!)
    document.querySelectorAll('.size-btn[data-size-idx]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.setBrushSizeByIndex(parseInt(btn.dataset.sizeIdx, 10) || 0, false);
      });
    });

    // Ярус высоты объёмной 3D-плотины (без повторного умножения на elevScale!)
    document.querySelectorAll('.tier-btn[data-tier]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.damTierIndex = parseInt(btn.dataset.tier, 10) || 0;
        document.querySelectorAll('.tier-btn[data-tier]').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        const tier = CONSTRUCTION.damHeightTiers[this.damTierIndex];
        const addH = Math.round(tier?.addHeight || 11);
        this.notify(`▲ Выбран профиль 3D-плотины (${tier?.label || '+' + addH + 'м'}): +${addH} м к основанию`, 'info');
      });
    });

    document.getElementById('btn-rotate').addEventListener('click', (e) => this.rotatePlacement(!!e.shiftKey));
    document.getElementById('btn-speed').addEventListener('click', () => this.cycleSpeed());
    document.getElementById('btn-open-loader').addEventListener('click', () => this.openMapLoader());
    document.getElementById('btn-contours').addEventListener('click', () => this.toggleContours());

    document.getElementById('btn-weather-cycle').addEventListener('click', () => {
      const idx = (WEATHER_ORDER.indexOf(this.economy.weatherId) + 1) % WEATHER_ORDER.length;
      const next = WEATHER_ORDER[idx];
      this.economy.setWeather(next);
      const w = WEATHER_MODES[next];
      this.notify(`${w.icon} Метеорежим: ${w.label} (приток рек ×${w.inflowMult.toFixed(2)})`, 'info');
      this._refreshHUD();
    });

    const creativeBtn = document.getElementById('btn-creative');
    creativeBtn.addEventListener('click', () => {
      this.economy.creative = !this.economy.creative;
      creativeBtn.classList.toggle('active', this.economy.creative);
      this.notify(
        this.economy.creative
          ? '★ Режим «Инженерный креатив» включён: мгновенная стройка и бесконечный бюджет!'
          : '◈ Включён инженерный режим: 3-этапное бетонирование кранами и реальный бюджет.',
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
      this.notify(`Графика переключена: ${this.profile.label}`, 'info');
    });

    const muteBtn = document.getElementById('btn-mute');
    muteBtn.addEventListener('click', () => {
      const m = this.audio.toggleMute();
      muteBtn.textContent = m ? '✕ Без звука' : '♪ Звук';
    });

    const helpModal = document.getElementById('help-modal');
    document.getElementById('btn-help').addEventListener('click', () => helpModal.classList.toggle('hidden'));
    document.getElementById('help-close').addEventListener('click', () => helpModal.classList.add('hidden'));
    document.getElementById('help-start-btn').addEventListener('click', () => {
      this.audio.unlock();
      helpModal.classList.add('hidden');
    });

    const panelBody = document.getElementById('panel-body');
    const toggleBtn = document.getElementById('btn-toggle-panel');
    toggleBtn.addEventListener('click', () => {
      const hidden = panelBody.classList.toggle('hidden');
      toggleBtn.textContent = hidden ? '▸' : '▾';
    });

    document.getElementById('btn-loan').addEventListener('click', () => {
      const res = this.economy.takeGreenLoan();
      if (res.ok) this.notify(`+ Выпущены зелёные облигации ГЭС: +${res.amount.toLocaleString('ru-RU')} ₽`, 'good');
      else this.notify(res.reason, 'warn');
      this._refreshHUD();
    });

    document.getElementById('btn-repay').addEventListener('click', () => {
      const res = this.economy.repayLoan();
      if (res.ok) this.notify(`Погашена часть облигаций: -${res.amount.toLocaleString('ru-RU')} ₽`, 'info');
      else this.notify(res.reason, 'warn');
      this._refreshHUD();
    });

    // Инспектор агрегата ГЭС / ГАЭС / водосброса
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

    document.getElementById('insp-gaes').addEventListener('change', (e) => {
      if (this.selectedStruct && this.selectedStruct.kind === 'turbine') {
        this.selectedStruct.pumpedStorage = e.target.checked;
        this.notify(
          e.target.checked
            ? '≈ Включён обратимый режим ГАЭС: ночью (00:00–06:00) агрегат закачает воду в верхний бьеф!'
            : 'Режим ночной закачки ГАЭС отключён.',
          'info',
        );
        this._refreshInspector();
      }
    });

    document.getElementById('insp-clean-btn').addEventListener('click', () => {
      if (this.selectedStruct && this.selectedStruct.kind === 'turbine') {
        this.selectedStruct.trashLoad = 0;
        this.audio.playBuild();
        this.notify('Сороудерживающая решётка водоприёмника промыта!', 'good');
        this._refreshInspector();
      }
    });

    // Горячие клавиши (по физическим кодам клавиш e.code — работают и в русской, и в английской раскладке!)
    const codeToToolKey = {
      Digit1: '1', Digit2: '2', Digit3: '3', Digit4: '4', Digit5: '5',
      Digit6: '6', Digit7: '7', Digit8: '8', Digit9: '9', Digit0: '0',
      KeyB: 'B', KeyG: 'G', KeyN: 'N', KeyL: 'L', KeyF: 'F', KeyP: 'P', KeyX: 'X',
    };
    window.addEventListener('keydown', (e) => {
      if (this.isInPreGameLoader) return;
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT')) return;
      if (e.code === 'F3') {
        e.preventDefault();
        this.showDiag = !this.showDiag;
        document.getElementById('diag-panel').classList.toggle('hidden', !this.showDiag);
        return;
      }
      if (e.code === 'BracketLeft') {
        this.setBrushSizeByIndex(this.brushSizeIndex - 1, true);
        return;
      }
      if (e.code === 'BracketRight') {
        this.setBrushSizeByIndex(this.brushSizeIndex + 1, true);
        return;
      }
      const mappedKey = codeToToolKey[e.code] || e.key.toUpperCase();
      // Исключаем пересечение с клавишами движения камеры WASD/QE
      if (e.code !== 'KeyW' && e.code !== 'KeyA' && e.code !== 'KeyS' && e.code !== 'KeyD' && e.code !== 'KeyQ' && e.code !== 'KeyE') {
        for (const tool of TOOLS) {
          if (tool.key === mappedKey) {
            this.selectTool(tool.id);
            return;
          }
        }
      }
      if (e.code === 'KeyV' || e.code === 'Space') {
        e.preventDefault();
        this.cycleSpeed();
      } else if (e.code === 'KeyC') {
        this.toggleContours();
      } else if (e.code === 'KeyR') {
        this.rotatePlacement(!!e.shiftKey);
      } else if (e.code === 'KeyT') {
        document.getElementById('btn-tutorial').click();
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

  _populateWorldCatalogTab() {
    const animWrap = document.getElementById('anim-groups-list');
    const texWrap = document.getElementById('tex-families-list');
    if (animWrap) {
      const counts = new Map();
      for (const a of ANIMATION_REGISTRY) {
        counts.set(a.groupLabel, (counts.get(a.groupLabel) || 0) + 1);
      }
      let html = '';
      for (const [label, cnt] of counts.entries()) {
        html += `<div class="wb-row"><span>${label}</span><strong>${cnt} аним.</strong></div>`;
      }
      html += `<div class="wb-row total"><span>Всего активных анимаций</span><strong>${ANIMATION_REGISTRY.length}</strong></div>`;
      animWrap.innerHTML = html;
    }

    if (texWrap) {
      const famCounts = new Map();
      for (const sh of TEXTURE_SHADE_CATALOG) {
        famCounts.set(sh.familyLabel, (famCounts.get(sh.familyLabel) || 0) + 1);
      }
      let html = '';
      for (const [label, cnt] of famCounts.entries()) {
        html += `<div class="wb-row"><span>${label}</span><strong>${cnt} пресета</strong></div>`;
      }
      html += `<div class="wb-row total"><span>Всего текстур и оттенков</span><strong>${TEXTURE_SHADE_CATALOG.length}</strong></div>`;
      texWrap.innerHTML = html;
    }
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

  setBrushSizeByIndex(idx, showNote = false) {
    const maxIdx = Math.max(0, WORLD.brushSizes.length - 1);
    this.brushSizeIndex = clamp(idx, 0, maxIdx);
    this.brushRadius = WORLD.brushSizes[this.brushSizeIndex];
    document.querySelectorAll('.size-btn[data-size-idx]').forEach((b) => {
      b.classList.toggle('active', parseInt(b.dataset.sizeIdx, 10) === this.brushSizeIndex);
    });
    if (showNote) {
      this.notify(`◈ Диаметр инженерной кисти: ${Math.round(this.brushRadius * 2)} м`, 'info');
    }
  }

  rotatePlacement(resetToAuto = false) {
    if (resetToAuto) {
      this.manualYaw = null;
    } else if (this.manualYaw === null) {
      this.manualYaw = 0;
    } else {
      this.manualYaw += Math.PI / 12; // Ювелирный шаг 15°!
      if (this.manualYaw >= Math.PI * 2 - 0.001) this.manualYaw = null;
    }
    this.notify(
      this.manualYaw === null
        ? '↻ Авто-ориентация створа по уклону воды включена'
        : `↻ Точный угол створа: ${Math.round((this.manualYaw * 180) / Math.PI)}° (шаг 15°, Shift+R — авто)`,
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
  //  ВЗАИМОДЕЙСТВИЕ С КАРТОЙ (14 ИНСТРУМЕНТОВ)
  // ==========================================================================
  _bindWorldInput() {
    this.canvas.addEventListener('pointerdown', (e) => {
      if (this.isInPreGameLoader) return;
      this.audio.unlock();
      if (e.button !== 0) return;
      if (this.camCtrl.touches.size >= 2) return;

      const hit = this.raycastValley(e.clientX, e.clientY);
      if (!hit) return;

      const nearStruct = this.hydro.findStructureNear(hit.wx, hit.wz);
      if (nearStruct && (this.activeToolId === 'inspect' || e.altKey)) {
        this.selectedStruct = nearStruct;
        document.getElementById('struct-inspector').classList.remove('hidden');
        this._refreshInspector();
        return;
      }

      if (
        this.activeToolId === 'spillway' ||
        this.activeToolId.startsWith('turbine_') ||
        this.activeToolId === 'concrete_plant' ||
        this.activeToolId === 'pump_station' ||
        this.activeToolId === 'wind_meteo' ||
        this.activeToolId === 'nav_lock' ||
        this.activeToolId === 'fish_eco' ||
        this.activeToolId === 'powerline' ||
        this.activeToolId === 'demolish' ||
        this.activeToolId === 'inspect'
      ) {
        this._applySingleClickTool(hit.wx, hit.wz);
        return;
      }

      this.pointerDown = true;
      this.lastBrushWorld = { wx: hit.wx, wz: hit.wz };
      const s = this.hydro.sampleAtWorld(hit.wx, hit.wz);
      // addHeight в CONSTRUCTION.damHeightTiers уже масштабирован в applyMapScale()!
      const tierAdd = CONSTRUCTION.damHeightTiers[this.damTierIndex]?.addHeight || 11.2;

      if (this.activeToolId === 'canal_dig') {
        this.lockedGradeElev = e.shiftKey ? (s.bed - 1.35 * WORLD.elevScale) : null;
      } else if (this.activeToolId === 'concrete_dam') {
        this.lockedGradeElev = Math.max(s.bed, s.surface) + tierAdd;
      } else if (this.activeToolId === 'earth_dam') {
        this.lockedGradeElev = Math.max(s.bed, s.surface) + 3.2 * WORLD.elevScale;
      } else {
        this.lockedGradeElev = null;
      }

      this._applyContinuousStrokePoint(hit.wx, hit.wz, 0);
    });

    window.addEventListener('pointermove', (e) => {
      if (this.isInPreGameLoader) return;
      const hit = this.raycastValley(e.clientX, e.clientY);
      this.hoverWorld = hit;
      const tierAdd = CONSTRUCTION.damHeightTiers[this.damTierIndex]?.addHeight || 11.2;
      if (hit) {
        this.worldView.updateCursor(hit.wx, hit.wz, this.brushRadius, this.activeToolId, this.manualYaw, tierAdd, true);
        this._updateProbeBar(hit.wx, hit.wz);
      } else {
        this.worldView.updateCursor(0, 0, this.brushRadius, this.activeToolId, this.manualYaw, tierAdd, false);
      }

      if (!this.pointerDown || !hit || !this.lastBrushWorld) return;
      if (this.camCtrl.touches.size >= 2) return;

      const dx = hit.wx - this.lastBrushWorld.wx;
      const dz = hit.wz - this.lastBrushWorld.wz;
      const dist = Math.hypot(dx, dz);
      const stepLen = Math.max(this.hydro.dx * 0.42, this.brushRadius * 0.28);
      if (dist < stepLen) return;

      const steps = Math.min(28, Math.ceil(dist / stepLen));
      for (let i = 1; i <= steps; i++) {
        const t = i / steps;
        const ix = lerp(this.lastBrushWorld.wx, hit.wx, t);
        const iz = lerp(this.lastBrushWorld.wz, hit.wz, t);
        if (this.activeToolId === 'canal_dig' && this.lockedGradeElev !== null) {
          this.lockedGradeElev -= (dist / steps) * 0.0035;
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
      const res = this.hydro.excavateCanal(wx, wz, this.brushRadius, 1.15, this.lockedGradeElev, budget, creative);
      if (res.excavatedM3 > 0) {
        this.economy.spend(res.cost);
        if (subIdx === 0) {
          this.audio.playDig();
          const s = this.hydro.sampleAtWorld(wx, wz);
          this.spray.spawnDigSplash(wx, s.bed, wz, 8);
        }
      } else if (!creative && budget < 40 && subIdx === 0) {
        this.notify('Недостаточно средств на земляные работы!', 'warn');
      }
    } else if (this.activeToolId === 'canal_liner') {
      const res = this.hydro.lineCanalConcrete(wx, wz, this.brushRadius, budget, creative);
      if (res.count > 0) {
        this.economy.spend(res.cost);
        if (subIdx === 0) this.audio.playBuild();
      }
    } else if (this.activeToolId === 'earth_dam') {
      const res = this.hydro.buildEarthDam(wx, wz, this.brushRadius, 1.35, this.lockedGradeElev, budget, creative);
      if (res.addedM3 > 0) {
        this.economy.spend(res.cost);
        if (subIdx === 0) this.audio.playDig();
      }
    } else if (this.activeToolId === 'concrete_dam') {
      const tierAdd = CONSTRUCTION.damHeightTiers[this.damTierIndex]?.addHeight || 11.2;
      const crest = this.lockedGradeElev ?? (this.hydro.sampleAtWorld(wx, wz).bed + tierAdd);
      const res = this.hydro.buildConcreteDam(wx, wz, this.brushRadius, crest, budget, creative, false);
      if (res.addedM3 > 0) {
        this.economy.spend(res.cost);
        if (subIdx === 0) this.audio.playBuild();
      } else if (!creative && budget < 180 && subIdx === 0) {
        this.notify('Недостаточно средств на бетонирование (можно выпустить зелёные облигации справа!)', 'warn');
      }
    } else if (this.activeToolId === 'foundation') {
      const res = this.hydro.reinforceFoundation(wx, wz, this.brushRadius, budget, creative);
      if (res.count > 0) {
        this.economy.spend(res.cost);
        if (subIdx === 0) this.audio.playBuild();
      } else if (!creative && budget < 140 && subIdx === 0) {
        this.notify('Недостаточно средств на скальную цементацию и 3D-контрфорсы!', 'warn');
      }
    }
  }

  _applySingleClickTool(wx, wz) {
    const budget = this.economy.cash;
    const creative = this.economy.creative;

    if (this.activeToolId === 'inspect') {
      const st = this.hydro.findStructureNear(wx, wz);
      if (st) {
        this.selectedStruct = st;
        document.getElementById('struct-inspector').classList.remove('hidden');
        this._refreshInspector();
      } else {
        const site = this.hydro.evaluateHppSite(wx, wz, this.manualYaw, 'kaplan');
        this.notify(
          `⌖ Разведка створа: перепад ΔH ${site.grossHead.toFixed(1)} м (${site.siteGrade}) · Потенциал ~${site.potentialMW.toFixed(1)} МВт · ВБ ${site.upElev.toFixed(1)} м → НБ ${site.downElev.toFixed(1)} м`,
          site.grossHead >= 6 ? 'good' : 'info',
        );
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
      this.notify('≈ Смонтирован 3D-водосброс с сегментным затвором и трамплином!', 'good');
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
      if (res.structure.isTurnkeyComplex) {
        this.worldView.rebuildTerrainMesh(true);
        this.worldView.syncEngineeredVolumes();
      }
      this.audio.playBuild();
      this.selectedStruct = res.structure;
      document.getElementById('struct-inspector').classList.remove('hidden');
      this._refreshInspector();
      this.notify(
        res.structure.isTurnkeyComplex
          ? `✦ Возведён готовый комплекс ${res.structure.spec.name}: подведите воду каналом [2] в приёмную аванкамеру!`
          : `✦ Встроена приплотинная ${res.structure.spec.name}: водоприёмник наверху, машзал в нижнем бьефе!`,
        'good',
      );
      return;
    }

    if (this.activeToolId === 'concrete_plant') {
      const res = this.hydro.placeConcretePlant(wx, wz, this.manualYaw, budget, creative);
      if (!res.ok) {
        this.notify(res.reason, 'warn');
        return;
      }
      this.economy.spend(res.cost);
      this.audio.playBuild();
      this.notify('▲ Бетонный завод БСУ введён в строй: заливка плотин ×2 быстрее, бетон -22%, ускорена стройка кварталов и трасс!', 'good');
      this._refreshHUD();
      return;
    }

    if (this.activeToolId === 'pump_station') {
      const res = this.hydro.placePumpStation(wx, wz, this.manualYaw, budget, creative);
      if (!res.ok) {
        this.notify(res.reason, 'warn');
        return;
      }
      this.economy.spend(res.cost);
      this.audio.playBuild();
      this.notify('≈ Береговая насосная станция запущена: рост дохода Горводоканала и напорная подача воды!', 'good');
      this._refreshHUD();
      return;
    }

    if (this.activeToolId === 'wind_meteo') {
      const res = this.hydro.placeWindMeteoStation(wx, wz, budget, creative);
      if (!res.ok) {
        this.notify(res.reason, 'warn');
        return;
      }
      this.economy.spend(res.cost);
      this.audio.playBuild();
      this.notify('✦ Метео-ветрокомплекс ВЭС запущен: генерация чистых МВт от реальной физики ветра (P ~ v³)!', 'good');
      this._refreshHUD();
      return;
    }

    if (this.activeToolId === 'nav_lock') {
      const res = this.hydro.placeNavigationLock(wx, wz, this.manualYaw, budget, creative);
      if (!res.ok) {
        this.notify(res.reason, 'warn');
        return;
      }
      this.economy.spend(res.cost);
      this.audio.playBuild();
      this.notify('✦ Открыт судоходный шлюз! Речной флот начал приносить навигационный сбор.', 'good');
      this._refreshHUD();
      return;
    }

    if (this.activeToolId === 'fish_eco') {
      const res = this.hydro.placeFishEcoFarm(wx, wz, budget, creative);
      if (!res.ok) {
        this.notify(res.reason, 'warn');
        return;
      }
      this.economy.spend(res.cost);
      this.audio.playBuild();
      this.notify('✦ Развёрнуты садки форелевого хозяйства и яхт-марина (+доход аквакультуры и туризма)!', 'good');
      this._refreshHUD();
      return;
    }

    if (this.activeToolId === 'powerline') {
      let bestCity = null;
      let bestD = 92 * WORLD.horizScale;
      for (const c of this.economy.cities) {
        const d = Math.hypot(c.x - wx, c.z - wz);
        if (d < bestD) { bestD = d; bestCity = c; }
      }
      if (bestCity) {
        const res = this.economy.connectCityGrid(bestCity.id);
        if (!res.ok) this.notify(res.reason, 'warn');
        else this.audio.playBuild();
        this._renderCityCards();
        return;
      }

      const subRes = this.hydro.placeSubstation(wx, wz, budget, creative);
      if (!subRes.ok) {
        this.notify(subRes.reason, 'warn');
        return;
      }
      this.economy.spend(subRes.cost);
      this.economy.powerLinesDirty = true;
      this.audio.playBuild();
      this.notify('✦ Построена узловая 3D-подстанция ОРУ 220 кВ! Потери передачи снижены с 16% до 3%!', 'good');
      this._refreshHUD();
      return;
    }

    if (this.activeToolId === 'demolish') {
      const res = this.hydro.demolishAt(wx, wz);
      if (res.removed) {
        this.economy.earn(res.refund);
        this.audio.playDig();
        if (
          this.selectedStruct &&
          !this.hydro.turbines.includes(this.selectedStruct) &&
          !this.hydro.spillways.includes(this.selectedStruct)
        ) {
          this.selectedStruct = null;
          document.getElementById('struct-inspector').classList.add('hidden');
        }
        this.notify(
          res.refund > 0
            ? `Демонтаж выполнен (возврат +${res.refund.toLocaleString('ru-RU')} ₽)`
            : 'Секция расчищена',
          'info',
        );
      }
    }
  }

  // ==========================================================================
  //  ОБНОВЛЕНИЕ ГИДРОПОСТА, 8 ГОРОДОВ, НАУЧНОГО БАЛАНСА ВОДЫ И 12 ДОХОДОВ
  // ==========================================================================
  _updateProbeBar(wx, wz) {
    const s = this.hydro.sampleAtWorld(wx, wz);
    const el = document.getElementById('probe-readout');
    if (!el) return;

    // Для разведки створа [1] и Готовых ГЭС [8/9/0] показываем перепад высот ΔH и прогноз МВт в реальном времени!
    if (this.activeToolId === 'inspect' || this.activeToolId.startsWith('turbine_')) {
      const tType = this.activeToolId.startsWith('turbine_')
        ? this.activeToolId.replace('turbine_', '')
        : 'kaplan';
      const site = this.hydro.evaluateHppSite(wx, wz, this.manualYaw, tType);
      el.textContent = `Створ ГЭС: ΔH ${site.grossHead.toFixed(1)} м (${site.siteGrade}) · Потенциал ~${site.potentialMW.toFixed(1)} МВт · ВБ ${site.upElev.toFixed(1)} м → НБ ${site.downElev.toFixed(1)} м · Глуб. ${s.depth.toFixed(2)} м`;
      return;
    }

    let stageTxt = '';
    if (s.targetConcrete > s.concrete + 0.08) {
      const pct = Math.round(s.buildProgress * 100);
      stageTxt = ` · Стройка ${pct}%`;
    } else if (s.reinforced) {
      stageTxt = ' · [Контрфорс]';
    }

    const cover = s.concrete > 0.8
      ? '3D-Монолит плотины'
      : (s.lined ? 'Ж/Б лоток (n=0.014)' : (s.earthDam ? 'Насыпь дамбы' : (s.soil < 0.75 * WORLD.elevScale ? 'Гранит (n=0.032)' : `Грунт (влажн. ${Math.round(s.saturation * 100)}%)`)));
    const regime = s.depth < 0.03 ? 'сухо' : (s.froude > 1.0 ? 'Fr>1 бурный' : 'спокойный');
    const windStr = `Ветер ${(this.hydro.windSpeedMs || 4.8).toFixed(1)} м/с`;

    el.textContent = `Дно: ${s.bed.toFixed(1)} м (${cover})${stageTxt} · Вода: ${s.depth > 0.02 ? s.surface.toFixed(1) + ' м' : '—'} · H: ${s.depth.toFixed(2)} м · V: ${s.speed.toFixed(2)} м/с (${regime}) · ${windStr}`;
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
      const happy = c.happinessPct ?? Math.round((c.satisfaction || 0.7) * 100);
      const supplyText = c.connected
        ? `◈ ${c.suppliedMW.toFixed(1)} / ${c.currentDemandMW.toFixed(1)} МВт`
        : `Не в сети (спрос ${c.currentDemandMW.toFixed(1)} МВт)`;

      const d = c.districts || { housing: 0, industry: 0, techCom: 0, civicUtil: 0 };
      const waterBadge = c.canalAqueductConnected ? `Вода ${c.waterScore}% [Водовод]` : `Вода ${c.waterScore ?? 50}%`;
      const logicDiag = c.bottleneckText || '';

      let buildNote = '';
      if (c.currentProjectLabel) {
        const whyTxt = c.nextPlanReason ? ` — ${c.nextPlanReason}` : '';
        buildNote = `<div class="city-note">▲ Стройка (${c.activeBuildCount} кр.): ${c.currentProjectLabel}${whyTxt}</div>`;
      }

      const cityRoutes = (this.economy.roadNetwork && this.economy.roadNetwork.routes)
        ? this.economy.roadNetwork.routes.filter((r) => r.fromId === c.id || r.toId === c.id)
        : [];
      const doneRoutes = cityRoutes.filter((r) => r.completed).length;
      const activeRoute = cityRoutes.find((r) => !r.completed && r.activeCrew);
      const roadInfo = activeRoute
        ? ` · Трасса ${Math.round(activeRoute.buildProgress * 100)}%`
        : ` · Трасс ${doneRoutes}/${cityRoutes.length}`;

      const curFocus = c.focusMode || 'balanced';
      const focusButtonsHtml = Object.values(CITY_FOCUS_MODES).map((m) => `
        <button type="button" class="city-focus-btn${curFocus === m.id ? ' active' : ''}" data-focuscity="${c.id}" data-focusmode="${m.id}" title="${m.title}">${m.label}</button>
      `).join('');

      card.innerHTML = `
        <div class="city-top">
          <button type="button" class="city-fly-btn" data-flycity="${c.id}" title="Плавно перелететь камерой к городу">⌖ ${c.name}</button>
          <span class="city-badge">★ ${happy}% · ${c.levelName} · ${c.buildingIndices.length} зд.${roadInfo}</span>
        </div>
        <div class="city-meta">
          <span>Нас.: ${c.population.toLocaleString('ru-RU')}</span>
          <span>${supplyText}</span>
        </div>
        <div class="city-logic-strip">
          <span>Свет ${c.powerScore ?? 0}%</span>
          <span>${waterBadge}</span>
          <span>Трассы ${c.roadScore ?? 30}%</span>
          <span>Среда ${c.comfortScore ?? 70}%</span>
        </div>
        <div class="city-districts-row">
          Жильё: <b>${d.housing}</b> · Пром: <b>${d.industry}</b> · ИТ/Наука: <b>${d.techCom}</b> · Службы: <b>${d.civicUtil}</b>
        </div>
        <div class="progress-track">
          <div class="progress-fill" style="width:${pct}%"></div>
        </div>
        ${logicDiag ? `<div class="city-note${c.isFlooded || !c.connected ? ' warn' : ''}">${logicDiag}</div>` : ''}
        ${buildNote}
        <div class="city-focus-bar" role="group" aria-label="Генплан города">
          <span class="city-focus-lbl">Генплан:</span>
          ${focusButtonsHtml}
        </div>
        ${!c.connected ? `<div class="city-actions"><button class="connect-btn" data-connect="${c.id}">◈ Подключить ЛЭП (${lineCost.toLocaleString('ru-RU')} ₽)</button></div>` : ''}
      `;
      wrap.appendChild(card);
    }

    wrap.querySelectorAll('[data-flycity]').forEach((el) => {
      el.addEventListener('pointerdown', () => {
        const idx = this.economy.cities.findIndex((x) => x.id === el.dataset.flycity);
        if (idx >= 0) this._flyToCityByIndex(idx);
      });
    });

    wrap.querySelectorAll('[data-focuscity]').forEach((btn) => {
      btn.addEventListener('pointerdown', (ev) => {
        ev.preventDefault();
        this.economy.setCityFocusMode(btn.dataset.focuscity, btn.dataset.focusmode);
        this._renderCityCards();
        this._refreshHUD();
      });
    });

    wrap.querySelectorAll('[data-connect]').forEach((btn) => {
      btn.addEventListener('pointerdown', () => {
        const res = this.economy.connectCityGrid(btn.dataset.connect);
        if (!res.ok) this.notify(res.reason, 'warn');
        else this.audio.playBuild();
        this._renderCityCards();
        this._refreshHUD();
      });
    });
  }

  _renderWaterBalanceTab(wb) {
    const whyEl = document.getElementById('wb-why-note');
    const meteoEl = document.getElementById('wb-meteo-strip');
    const inTable = document.getElementById('wb-in-table');
    const outTable = document.getElementById('wb-out-table');
    const nodeTable = document.getElementById('wb-node-table');
    if (!inTable || !wb) return;

    if (whyEl) whyEl.textContent = wb.whenWhySummary;
    if (meteoEl) {
      const wCompass = wb.windCompass || 'ЮЗ';
      const wSpd = (wb.windSpeedMs ?? 4.8).toFixed(1);
      const wGust = (wb.windGustMs ?? 6.5).toFixed(1);
      const pHpa = Math.round(wb.pressureHPa ?? 1013);
      const tWat = (wb.waterTempC ?? 11.5).toFixed(1);
      const dew = (wb.dewPointC ?? 8.0).toFixed(1);
      const sunW = Math.round(wb.solarIrradianceWm2 ?? 420);
      meteoEl.textContent =
        `Воздух: ${wb.airTempC >= 0 ? '+' : ''}${wb.airTempC.toFixed(1)}°C (роса ${dew}°C) · Ледники: ${wb.mountainTempC >= 0 ? '+' : ''}${wb.mountainTempC.toFixed(1)}°C · Tводы: +${tWat}°C · Ветер ${wCompass} ${wSpd} м/с (порыв ${wGust}) · ${pHpa} гПа · Инсол. ${sunW} Вт/м² · Зеркало ${wb.wetAreaHa.toFixed(1)} га`;
    }

    const fmtQ = (v) => `${v.toFixed(1)} м³/с`;
    inTable.innerHTML = `
      <div class="wb-row"><span>Истоки 3 рек (верховья)</span><strong>+${fmtQ(wb.inRiversQ)}</strong></div>
      <div class="wb-row"><span>Таяние горных ледников (днём)</span><strong>+${fmtQ(wb.inSnowmeltQ)} (${wb.cumSnowmeltK.toFixed(0)} тыс.м³)</strong></div>
      <div class="wb-row"><span>Накапало дождя на водосбор</span><strong>+${fmtQ(wb.inPrecipQ)} (${wb.cumPrecipK.toFixed(0)} тыс.м³)</strong></div>
      <div class="wb-row"><span>Подземные родники каньона</span><strong>+${fmtQ(wb.inGroundwaterQ)}</strong></div>
      <div class="wb-row"><span>Ночной возврат ГАЭС в ВБ</span><strong>+${fmtQ(wb.inPumpedGAESQ)}</strong></div>
      <div class="wb-row total"><span>Всего пришло в бассейн</span><strong>+${fmtQ(wb.inTotalQ)} (${wb.cumArrivedK.toFixed(0)} тыс.м³)</strong></div>
    `;

    outTable.innerHTML = `
      <div class="wb-row"><span>Испарилось с зеркала (${wb.evapMmPerDay.toFixed(1)} мм/сут)</span><strong>-${fmtQ(wb.outEvapQ)} (${wb.cumEvaporatedK.toFixed(1)} тыс.м³)</strong></div>
      <div class="wb-row"><span>Впиталось в сухой грунт (Хортон)</span><strong>-${fmtQ(wb.outInfiltQ)}</strong></div>
      <div class="wb-row"><span>Фильтрация Дарси под плотиной</span><strong>-${fmtQ(wb.outSeepageQ)}</strong></div>
      <div class="wb-row"><span>Водозабор городов и полей</span><strong>-${fmtQ(wb.outCitiesAgroQ)} (${wb.cumConsumedK.toFixed(0)} тыс.м³)</strong></div>
      <div class="wb-row"><span>Свободный сток устья в море</span><strong>-${fmtQ(wb.outMouthQ)} (${wb.cumMouthOutK.toFixed(0)} тыс.м³)</strong></div>
      <div class="wb-row total"><span>Итого ушло из бассейна</span><strong>-${fmtQ(wb.outTotalQ)}</strong></div>
    `;

    const volMil = wb.totalVolumeM3 / 1e6;
    nodeTable.innerHTML = `
      <div class="wb-row"><span>Через турбины ГЭС (полезная работа)</span><strong>${fmtQ(wb.nodeTurbineQ)}</strong></div>
      <div class="wb-row"><span>3D-перелив плотин + водосброс</span><strong>${fmtQ(wb.nodeSpillOverflowQ)}</strong></div>
      <div class="wb-row"><span>КПД использования стока гидроузлом</span><strong>${wb.hydroUtilizationPct}%</strong></div>
      <div class="wb-row total"><span>Запас воды в бассейне сейчас</span><strong>${volMil >= 1 ? volMil.toFixed(2) + ' млн м³' : (wb.totalVolumeM3 / 1000).toFixed(0) + ' тыс. м³'}</strong></div>
    `;
  }

  _renderRevenueTab(sum) {
    const list = document.getElementById('revenue-streams-list');
    if (!list) return;
    let html = '';
    for (const def of REVENUE_STREAM_DEFS) {
      const rate = sum.revenueRates[def.id] || 0;
      const tot = sum.revenueTotals[def.id] || 0;
      html += `
        <div class="wb-row">
          <span style="color:${rate > 1 ? '#f1f5f9' : '#94a3b8'}">● ${def.label}</span>
          <strong style="color:${rate > 1 ? def.color : '#64748b'}">+${Math.round(rate)} ₽/с (${Math.round(tot).toLocaleString('ru-RU')} ₽)</strong>
        </div>
      `;
    }
    html += `
      <div class="wb-row total">
        <span>Суммарная выручка (12 статей)</span>
        <strong>+${Math.round(sum.incomePerSec).toLocaleString('ru-RU')} ₽/с</strong>
      </div>
    `;
    list.innerHTML = html;
  }

  _refreshHUD() {
    if (!this.economy) return;
    const sum = this.economy.getSummary();
    const wb = sum.waterReport;

    document.getElementById('hud-cash').textContent = this.economy.creative
      ? '∞ КРЕАТИВ'
      : `${Math.round(sum.cash).toLocaleString('ru-RU')} ₽`;

    const netSign = sum.netPerSec >= 0 ? '+' : '';
    const netEl = document.getElementById('hud-net');
    netEl.textContent = `${netSign}${Math.round(sum.netPerSec).toLocaleString('ru-RU')} ₽/с`;
    netEl.style.color = sum.netPerSec >= 0 ? '#4ade80' : '#f87171';

    const pumpTxt = sum.pumpedConsumeMW > 0.1 ? ` (ГАЭС -${sum.pumpedConsumeMW.toFixed(1)})` : '';
    const windTxt = (sum.windMW || 0) > 0.05 ? ` (ВЭС +${sum.windMW.toFixed(1)})` : '';
    document.getElementById('hud-mw').textContent = `${sum.totalMW.toFixed(1)} МВт${windTxt}${pumpTxt}`;
    document.getElementById('hud-demand').textContent =
      `Сеть: ${sum.suppliedCityMW.toFixed(1)}/${sum.connectedDemandMW.toFixed(1)} · Потери ${sum.gridLossPct}%`;

    const hh = Math.floor(sum.hour);
    const mm = Math.floor((sum.hour - hh) * 60);
    document.getElementById('hud-clock').textContent = `День ${sum.day} · ${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
    document.getElementById('hud-tariff').textContent = sum.periodLabel;
    document.getElementById('chip-tariff').className = `stat-chip stat-tariff ${sum.periodClass}`;

    document.getElementById('hud-weather').textContent = sum.pendingPourM3 > 5
      ? `▲ Бетон: ${Math.round(sum.pendingPourM3 * this.hydro.volPriceNorm)} усл.м³${sum.concretePlantsCount > 0 ? ' (БСУ ×' + (1 + Math.min(2, sum.concretePlantsCount) * 0.95).toFixed(1) + ')' : ''}`
      : `${sum.weather.icon} ${sum.weather.label} · ${wb.windCompass || 'ЮЗ'} ${(wb.windSpeedMs || 4.8).toFixed(1)} м/с`;

    document.getElementById('hud-stockpile').textContent =
      `Приток +${Math.round(wb.inTotalQ)} · Сток в море -${Math.round(wb.outMouthQ)} м³/с`;

    document.getElementById('hud-pop-total').textContent =
      `8 городов (${sum.totalBuildings} зд., 48 тип.) · Трасс ${sum.roadsBuiltCount}/${sum.roadsTotalCount} · ${sum.totalPopulation.toLocaleString('ru-RU')} жит.`;
    document.getElementById('hud-loan').textContent = `Долг по облигациям: ${Math.round(sum.loan).toLocaleString('ru-RU')} ₽`;

    const damBanner = document.getElementById('dam-health-banner');
    const damStatus = document.getElementById('hud-dam-status');
    const ovfCount = this.hydro.overflowEdges.length;
    if (sum.pendingPourM3 > 5) {
      damBanner.className = 'dam-health-banner warn';
      damStatus.textContent = `Башенные краны бетонируют створ плотины…`;
    } else if (sum.seepageQ > 1.8 * WORLD.flowScale || sum.maxDamStress > 78) {
      damBanner.className = 'dam-health-banner warn';
      damStatus.textContent = `Нагрузка ${Math.round(sum.maxDamStress)}% · Фильтрация Дарси! Ставьте [6] Контрфорс`;
    } else if (ovfCount > 0) {
      damBanner.className = 'dam-health-banner';
      damStatus.textContent = `3D-перелив активен (${ovfCount} струй) · Шлюзы: ${sum.navLocksCount} · Рыбхозы: ${sum.fishFarmsCount}`;
    } else {
      damBanner.className = 'dam-health-banner';
      damStatus.textContent = `БСУ: ${sum.concretePlantsCount || 0} · Насос.: ${sum.pumpStationsCount || 0} · ВЭС: ${sum.windMeteoCount || 0} · ОРУ: ${sum.substationsCount} · Шлюзы: ${sum.navLocksCount}`;
    }

    const nextMs = MILESTONES.find((m) => !this.economy.completedMilestones.has(m.id));
    if (nextMs) {
      document.getElementById('ms-title').textContent = `${nextMs.title} (+${nextMs.reward.toLocaleString('ru-RU')} ₽)`;
      document.getElementById('ms-desc').textContent = nextMs.desc;
    } else {
      document.getElementById('ms-title').textContent = 'Все государственные гранты получены!';
      document.getElementById('ms-desc').textContent = 'Ваш каскад ГЭС/ГАЭС стал эталоном гидроэнергетики.';
    }

    if (this.activeSideTab === 'cities') {
      this._renderCityCards();
    } else if (this.activeSideTab === 'water') {
      this._renderWaterBalanceTab(wb);
    } else if (this.activeSideTab === 'revenue') {
      this._renderRevenueTab(sum);
    }

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
    const gaesRow = document.getElementById('insp-gaes-row');
    const gaesChk = document.getElementById('insp-gaes');
    const cleanBtn = document.getElementById('insp-clean-btn');

    if (st.kind === 'turbine') {
      title.textContent = `⚙ ${st.spec.name} (#${st.id})`;
      const trashPct = Math.round((st.trashLoad || 0) * 100);
      const modeStr = st.isPumpingNow
        ? `<b style="color:#22d3ee">Закачка ГАЭС (-${st.pumpConsumeMW.toFixed(1)} МВт)</b>`
        : `<b>${st.powerMW.toFixed(2)} МВт</b>`;
      metrics.innerHTML = `
        <span>Режим: ${modeStr}</span>
        <span>Напор чист.: <b>${st.netHead.toFixed(1)} м</b></span>
        <span>Расход Q: <b>${Math.abs(st.flowQ).toFixed(1)} м³/с</b></span>
        <span>КПД η: <b>${Math.round(st.efficiency * 100)}%</b></span>
        <span>Решётка: <b>${trashPct > 4 ? `засор ${trashPct}%` : 'чистая'}</b></span>
        <span>Кавитация: <b>${st.cavitation > 0.2 ? '▲ есть' : 'норма'}</b></span>
      `;
      const pct = Math.round(st.throttle * 100);
      slider.value = pct;
      sliderLbl.textContent = `Открытие направляющего аппарата: ${pct}%`;
      autoChk.checked = !!st.autoDispatch;
      autoLbl.textContent = 'Авто-диспетчер по пикам ОРЭМ + сороочистка';
      if (gaesRow) gaesRow.classList.toggle('hidden', !st.spec.reversible);
      if (gaesChk) gaesChk.checked = !!st.pumpedStorage;
      cleanBtn.classList.toggle('hidden', trashPct <= 2);
    } else {
      title.textContent = `≈ 3D-Водосброс с трамплином (#${st.id})`;
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
      autoLbl.textContent = 'Авто-сброс паводка при переполнении бьефа';
      if (gaesRow) gaesRow.classList.add('hidden');
      cleanBtn.classList.add('hidden');
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
  //  ГЛАВНЫЙ ЦИКЛ СИМУЛЯЦИИ, 300 АНИМАЦИЙ, 3D-ПЕРЕЛИВА И РЕНДЕРА
  // ==========================================================================
  _loop(now) {
    requestAnimationFrame((t) => this._loop(t));

    const rawDt = Math.min(0.08, Math.max(0.001, (now - this._lastTime) / 1000));
    this._lastTime = now;
    this._frameCount++;

    this._fpsFrames++;
    this._fpsAccum += rawDt;
    if (this._fpsAccum >= 0.5) {
      this.fps = Math.round(this._fpsFrames / this._fpsAccum);
      this._fpsFrames = 0;
      this._fpsAccum = 0;
    }

    if (this.isInPreGameLoader) {
      this.hydro.step(rawDt * 0.75, 4);
      const gY = this.hydro.sampleAtWorld(this.camCtrl.goalTarget.x, this.camCtrl.goalTarget.z).bed;
      this.camCtrl.updatePreviewOrbit(rawDt, gY);
      const weather = WEATHER_MODES[this.economy.weatherId] || WEATHER_MODES.normal;
      this.worldView.updateAtmosphere(this.economy.hour, weather, this.camCtrl.target, rawDt);
      this.worldView.updateWaterAndWetness(this.hydro.simTime);
      if (this.renderer.shadowMap.enabled && (this._frameCount % 6 === 0)) {
        this.renderer.shadowMap.needsUpdate = true;
      }
      this.renderer.render(this.scene, this.camera);
      return;
    }

    const speedMult = SPEED_MODES[this.speedIndex];
    if (speedMult > 0) {
      const macroPasses = speedMult <= 2 ? 1 : 2;
      const simDtPerPass = (rawDt * speedMult) / macroPasses;
      for (let p = 0; p < macroPasses; p++) {
        this.hydro.step(simDtPerPass, this.profile.substepsCap);
      }
      this.economy.update(rawDt * speedMult);
    }

    const camGround = this.hydro.sampleAtWorld(this.camCtrl.goalTarget.x, this.camCtrl.goalTarget.z).bed;
    this.camCtrl.update(rawDt, camGround, (cx, cz) => this.hydro.sampleAtWorld(cx, cz).bed);

    const weather = WEATHER_MODES[this.economy.weatherId] || WEATHER_MODES.normal;
    const animDt = rawDt * Math.max(0, Math.min(2.5, speedMult));
    const { dayFactor } = this.worldView.updateAtmosphere(this.economy.hour, weather, this.camCtrl.target, animDt);

    const dirtyRect = this.hydro.consumeTerrainDirty();
    if (dirtyRect) {
      this.worldView.updateTerrainGeometryRect(dirtyRect.x0, dirtyRect.z0, dirtyRect.x1, dirtyRect.z1);
      if (this.renderer.shadowMap.enabled) this.renderer.shadowMap.needsUpdate = true;
    }

    this.worldView.updateWaterAndWetness(this.hydro.simTime);
    this.worldView.syncEngineeredVolumes();
    this.worldView.animateConstructionCranes(this.hydro.simTime);
    this.worldView.syncHydroStructures(this.hydro.simTime);

    if (this.economy.buildingsDirty || (this._frameCount % 12 === 0)) {
      this.worldView.syncCityInstances();
      this.economy.buildingsDirty = false;
      if (this.renderer.shadowMap.enabled && this.profile.shadowEvery > 0 && (this._frameCount % 30 === 0)) {
        this.renderer.shadowMap.needsUpdate = true;
      }
    }

    const rainAmt = this.economy.weatherId === 'flood' ? 1.0 : (this.economy.weatherId === 'rain' ? 0.6 : 0);
    this.spray.update(rawDt * Math.max(1, Math.min(2, speedMult)), this.hydro, this.camCtrl.target, dayFactor, rainAmt);

    let totalSpillQ = this.hydro.lastCrestOverflowQ || 0;
    let distToHydro = Infinity;
    for (const s of this.hydro.spillways) {
      totalSpillQ += s.currentFlowQ;
      const d = Math.hypot(s.wx - this.camCtrl.target.x, s.wz - this.camCtrl.target.z);
      if (d < distToHydro) distToHydro = d;
    }
    for (const t of this.hydro.turbines) {
      const d = Math.hypot(t.wx - this.camCtrl.target.x, t.wz - this.camCtrl.target.z);
      if (d < distToHydro) distToHydro = d;
    }
    this.audio.updateContinuous(this.camCtrl.distance, totalSpillQ, this.economy.totalMW, distToHydro);

    if (this.renderer.shadowMap.enabled && this.profile.shadowEvery > 0) {
      if ((this._frameCount % this.profile.shadowEvery) === 0) {
        this.renderer.shadowMap.needsUpdate = true;
      }
    }

    this.renderer.render(this.scene, this.camera);

    this._uiRefreshAccum += rawDt;
    if (this._uiRefreshAccum >= 0.25) {
      this._uiRefreshAccum = 0;
      this.tutorial.update();
      this._refreshHUD();
      if (this.showDiag) {
        const diagEl = document.getElementById('diag-panel');
        diagEl.textContent = formatDiagReport({
          fps: this.fps,
          hydroMs: this.hydro.lastStepMs,
          grid: `${this.hydro.grid}×${this.hydro.grid} (${WORLD.size}×${WORLD.size}м)`,
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
