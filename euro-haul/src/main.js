// ЕВРОТРАК — точка входа: игровой цикл, камера, ввод, экономика и карьера.
import * as THREE from 'three';
import { UI } from './ui/ui.js';
import { RoadWorld } from './world/road.js';
import { TruckView, EYE } from './world/truck3d.js';
import { Traffic } from './world/traffic.js';
import { SkySystem } from './world/sky.js';
import { buildRouteGeometry, buildNetwork, networkRouteKm, speedLimitAt } from './world/roadnet.js';
import { CITY_BY_ID, COUNTRIES } from './data/cities.js';
import { TRUCK_MODELS, PAINT_COLORS, UPGRADES, levelForXp, SKILLS } from './data/trucks.js';
import { TruckSim } from './core/physics.js';
import { AudioSystem } from './core/audio.js';
import { makeOffers } from './core/jobs.js';
import { payoutFor, jobXp } from './core/jobs.js';
import { fmtMoney, fmtDuration, fmtTime, clamp, lerp, hashString } from './core/math.js';
import { ACHIEVEMENTS } from './data/achievements.js';
import {
  loadSaves,
  saveGame,
  loadSettings,
  saveSettings,
  DEFAULT_SETTINGS,
  createProfile,
  upgradeProfile,
  skillPrice,
} from './core/save.js';
import { cityDistanceKm } from './world/geo.js';

const $ = (id) => document.getElementById(id);
const CAMERA_MODES = ['interior', 'hood', 'chase', 'far'];
const SAVE_INTERVAL = 20;

class Game {
  constructor() {
    this.audio = new AudioSystem();
    this.settings = loadSettings();
    this.saves = loadSaves();
    this.profile = null;
    this.slot = 0;
    this.state = 'menu';
    this.paused = false;
    this.offers = [];
    this.route = null;
    this.job = null;
    this.phase = null;
    this.clock = { day: 1, minutes: 8 * 60 };
    this.input = { keys: new Set(), touch: {}, touchSteer: 0 };
    this.cameraMode = CAMERA_MODES.includes(this.settings.camera) ? this.settings.camera : 'interior';
    this.cameraUserSet = CAMERA_MODES.includes(this.settings.camera);
    this.collisionCooldown = 0;
    this.cameraShake = 0;
    this.lastHudUpdate = 0;
    this.lastSave = 0;
    this.weatherTimer = 0;
    this.interaction = null;
    this.parkedAtDepot = null;
    this.work = null;
    this.driverIncomeTimer = 0;
    this.fines = 0;
    this.camerasHit = new Set();
    this.lastGear = 0;
    this.tipsShown = new Set();
    this.fps = 60;
    this.fpsAccum = 0;
    this.fpsFrames = 0;
    this.drivingDistance = 0;
    this.nightDistance = 0;
    this.lightsOn = false;
    this.network = buildNetwork();
    this.device = this.detectDevice();
    this.ui = new UI(this);
    this.audio.setVolume(this.settings.volume);
    this.audio.setEnabled(this.settings.sound);

    this.init3D();
    this.applyDeviceSettings();
    this.bindInput();
    this.refreshSaveInfo();
    this.ui.setScreen('menu');

    this.last = performance.now();
    this.accumulator = 0;
    this.raf = this.loop.bind(this);
    requestAnimationFrame(this.raf);
  }

  // ---------------------------------------------------------------- Устройства
  /** phone / tablet / desktop по UA, типу указателя и размеру экрана. */
  detectDevice() {
    const nav = typeof navigator !== 'undefined' ? navigator : {};
    const ua = nav.userAgent || '';
    const mm = window.matchMedia ? window.matchMedia.bind(window) : null;
    const coarse = mm ? mm('(pointer: coarse)').matches : false;
    const touch = 'ontouchstart' in window || (nav.maxTouchPoints || 0) > 0;
    const phoneUa = /Android.*Mobile|iPhone|iPod|Windows Phone|Opera Mini|IEMobile/i.test(ua);
    const tabletUa = /iPad|Tablet|PlayBook|Silk/i.test(ua) || (/Macintosh/i.test(ua) && (nav.maxTouchPoints || 0) > 1);
    const small = Math.min(window.innerWidth || 1280, window.innerHeight || 800) < 820;
    if (phoneUa) return 'phone';
    if (tabletUa) return 'tablet';
    if (coarse && touch) return small ? 'phone' : 'tablet';
    return 'desktop';
  }

  /** Итоговое качество с учётом «авто» и типа устройства. */
  resolveQuality() {
    const q = this.settings.quality || 'auto';
    if (q !== 'auto') return q;
    if (this.device === 'phone') return 'low';
    if (this.device === 'tablet') return 'medium';
    return 'high';
  }

  /** Сенсорное управление включено? */
  touchEnabled() {
    const mode = this.settings.touchControls || 'auto';
    if (mode === 'on') return true;
    if (mode === 'off') return false;
    return this.device !== 'desktop';
  }

  trafficCount() {
    const q = this.resolveQuality();
    if (q === 'low') return 14;
    if (q === 'medium') return 20;
    return 26;
  }

  /** Единая точка применения настроек под устройство. */
  applyDeviceSettings() {
    const body = document.body;
    body.classList.toggle('is-touch', this.touchEnabled());
    body.classList.remove('device-phone', 'device-tablet', 'device-desktop', 'quality-low', 'quality-medium', 'quality-high');
    body.classList.add('device-' + this.device);
    const q = this.resolveQuality();
    body.classList.add('quality-' + q);
    this.quality = q;
    if (this.renderer) {
      const dpr = window.devicePixelRatio || 1;
      const phoneCap = 1.4;
      let ratio = q === 'low' ? 0.85 : q === 'medium' ? 1.1 : Math.min(dpr, 1.75);
      if (this.device === 'phone') ratio = Math.min(ratio, phoneCap);
      this.renderer.setPixelRatio(Math.max(0.6, ratio));
      const w = window.innerWidth;
      const h = window.innerHeight;
      if (w > 0 && h > 0) {
        this.renderer.setSize(w, h, false);
        if (this.camera) {
          this.camera.aspect = w / h;
          this.camera.updateProjectionMatrix();
        }
      }
    }
    if (this.sky && this.sky.setQuality) this.sky.setQuality(q);
    if (this.road) this.applyWorldShadows();
    if (!this.cameraUserSet) this.cameraMode = this.touchEnabled() ? 'chase' : 'interior';
    if (this.traffic && this.traffic.count !== this.trafficCount()) {
      const route = this.route;
      const playerS = this.truck ? this.truck.s : 0;
      this.traffic.dispose();
      this.traffic = new Traffic(this.scene, route, this.trafficCount());
      this.traffic.reset(route);
      this.traffic.playerS = playerS;
    }
  }

  toggleFullscreen() {
    const el = document.documentElement;
    const isFs = document.fullscreenElement || document.webkitFullscreenElement;
    const req = el.requestFullscreen || el.webkitRequestFullscreen;
    const exit = document.exitFullscreen || document.webkitExitFullscreen;
    if (!isFs && req) {
      Promise.resolve(req.call(el)).catch(() => this.ui.toast('Полный экран недоступен на этом устройстве', 'info'));
    } else if (isFs && exit) {
      Promise.resolve(exit.call(document)).catch(() => {});
    } else {
      this.ui.toast('Полный экран недоступен на этом устройстве', 'info');
    }
  }

  // ---------------------------------------------------------------- 3D
  init3D() {
    try {
      this.renderer = new THREE.WebGLRenderer({
        canvas: $('scene'),
        antialias: true,
        powerPreference: 'high-performance',
        alpha: false,
        preserveDrawingBuffer: true,
      });
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75)); // уточняется в applyDeviceSettings
      this.renderer.setSize(window.innerWidth, window.innerHeight, false);
      this.renderer.outputColorSpace = THREE.SRGBColorSpace;
      this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
      this.renderer.toneMappingExposure = 0.98;
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      this.renderer.shadowMap.autoUpdate = true;
    } catch (err) {
      console.error(err);
      $('webgl-error').classList.remove('hidden');
      return;
    }
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(68, window.innerWidth / window.innerHeight, 0.08, 5200);
    this.camera.position.set(0, 3, 0);
    this.sky = new SkySystem(this.scene, this.renderer);
    this.sky.enableShadows();
    this.buildContactShadow();
    this.truckView = new TruckView(this.scene, 0x2f7fa8);
    this.truckView.root.traverse((o) => {
      if (o.isMesh) o.castShadow = true;
    });
    this.truckView.setInteriorVisible(true);
    this.road = null;
    this.traffic = null;
    this.truckPos = new THREE.Vector3();
    this.tmpVec = new THREE.Vector3();
    this.camTarget = new THREE.Vector3();
    this.camLookAt = new THREE.Vector3();
    this.tmpVec2 = new THREE.Vector3();
    this.camLook = new THREE.Vector3();
    this.camPos = new THREE.Vector3(0, 0, 0);
    this.smoothCam = null;

    const onResize = () => {
      const nextDevice = this.detectDevice();
      if (nextDevice !== this.device) {
        this.device = nextDevice;
        this.applyDeviceSettings();
      }
      if (!this.renderer) return;
      const w = window.innerWidth;
      const h = window.innerHeight;
      this.renderer.setSize(w, h, false);
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', () => setTimeout(onResize, 120));
  }

  /** Мягкое затемнение под тягачом и прицепом: без него тени «висят в воздухе». */
  buildContactShadow() {
    const c = document.createElement('canvas');
    c.width = 64;
    c.height = 256;
    const g = c.getContext('2d');
    const grd = g.createLinearGradient(0, 0, 0, 256);
    grd.addColorStop(0, 'rgba(0,0,0,0)');
    grd.addColorStop(0.12, 'rgba(0,0,0,0.55)');
    grd.addColorStop(0.5, 'rgba(0,0,0,0.62)');
    grd.addColorStop(0.88, 'rgba(0,0,0,0.55)');
    grd.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = grd;
    g.fillRect(0, 0, 64, 256);
    const grd2 = g.createLinearGradient(0, 0, 64, 0);
    grd2.addColorStop(0, 'rgba(0,0,0,0)');
    grd2.addColorStop(0.22, 'rgba(0,0,0,1)');
    grd2.addColorStop(0.78, 'rgba(0,0,0,1)');
    grd2.addColorStop(1, 'rgba(0,0,0,0)');
    g.globalCompositeOperation = 'destination-in';
    g.fillStyle = grd2;
    g.fillRect(0, 0, 64, 256);
    const tex = new THREE.CanvasTexture(c);
    const mat = new THREE.MeshBasicMaterial({
      map: tex,
      transparent: true,
      depthWrite: false,
      opacity: 0.5,
      color: 0x0b0f12,
      blending: THREE.NormalBlending,
      polygonOffset: true,
      polygonOffsetFactor: -2,
    });
    // Кабина и прицеп — две отдельные «капли» тени.
    this.contactShadow = new THREE.Group();
    const cabShadow = new THREE.Mesh(new THREE.PlaneGeometry(6.2, 12.5), mat);
    cabShadow.rotation.x = -Math.PI / 2;
    cabShadow.position.set(0, 0.045, 2.2);
    const trailerShadow = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 24), mat);
    trailerShadow.rotation.x = -Math.PI / 2;
    trailerShadow.position.set(0, 0.04, -12.6);
    cabShadow.renderOrder = 2;
    trailerShadow.renderOrder = 2;
    this.contactShadow.add(cabShadow, trailerShadow);
    this.contactShadow.visible = false;
    this.contactShadowMat = mat;
    this.scene.add(this.contactShadow);
  }

  /** Что отбрасывает и что принимает тень в мире дороги. */
  applyWorldShadows() {
    const q = this.quality || this.resolveQuality();
    // Тени включены на всех устройствах: на низком качестве — карта 512 и узкий охват.
    const on = true;
    if (!this.renderer) return;
    this.renderer.shadowMap.enabled = on;
    if (this.sky && this.sky.sunLight) {
      this.sky.sunLight.castShadow = on;
      this.sky.shadowQuality(q);
    }
    const mark = (root, cast, receive) => {
      if (!root) return;
      root.traverse((o) => {
        if (!o.isMesh) return;
        o.castShadow = on && cast(o);
        o.receiveShadow = on && receive(o);
      });
    };
    if (this.road) {
      this.road.shadowOn = on;
      if (this.road.setQuality) this.road.setQuality(q);
      this.road.applyShadowFlags();
    }
    mark(this.traffic?.group, () => true, () => true);
    if (this.truckView) {
      this.truckView.root.traverse((o) => {
        if (!o.isMesh) return;
        let inside = false;
        let node = o;
        while (node) {
          if (node === this.truckView.interior) { inside = true; break; }
          node = node.parent;
        }
        // Салон не отбрасывает тень (иначе артефакты на самом себе), но принимает:
        // так кузов затеняет приборку и салон не «светится» на солнце.
        o.castShadow = on && !inside;
        o.receiveShadow = on;
      });
    }
  }

  // ---------------------------------------------------------------- Input
  bindInput() {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && this.state === 'driving' && !this.paused) this.togglePause();
    });
    window.addEventListener('gamepadconnected', () => {
      this.ui.toast('Геймпад подключён: RT — газ, LT — тормоз, стик — руль', 'good', 5000);
    });
    window.addEventListener('keydown', (e) => {
      if (e.target && ['INPUT', 'SELECT', 'TEXTAREA'].includes(e.target.tagName)) return;
      if (this.state !== 'driving') return;
      this.input.keys.add(e.code);
      switch (e.code) {
        case 'Escape':
          e.preventDefault();
          if (!$('modal-root').classList.contains('hidden')) this.ui.closeModal();
          else this.togglePause();
          break;
        case 'KeyC':
          this.toggleCruise();
          break;
        case 'KeyV':
          this.cycleCamera();
          break;
        case 'KeyM':
          this.toggleGearbox();
          break;
        case 'KeyL':
          this.toggleLights();
          break;
        case 'KeyE':
          this.interact();
          break;
        case 'KeyH':
          this.audio.honk();
          break;
        case 'KeyP':
          this.takeScreenshot();
          break;
        case 'Comma':
          this.toggleIndicator(-1);
          break;
        case 'Period':
          this.toggleIndicator(1);
          break;
        case 'KeyR':
          if (this.truck.toggleReverse()) {
            this.audio.shift();
            this.ui.toast(this.truck.gear === -1 ? 'Задний ход' : 'Нейтральная передача', 'info', 1400);
          }
          break;
        case 'KeyF':
          this.truck.toggleEngine();
          this.audio.blip(180, 0.25, 'sawtooth', 0.05);
          break;
        case 'ShiftLeft':
        case 'PageUp':
          if (!this.truck.autoGearbox) {
            this.truck.shiftUp();
            this.audio.shift();
          }
          break;
        case 'ControlLeft':
        case 'PageDown':
          if (!this.truck.autoGearbox) {
            this.truck.shiftDown();
            this.audio.shift();
          }
          break;
        default:
          break;
      }
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) e.preventDefault();
    });
    window.addEventListener('keyup', (e) => this.input.keys.delete(e.code));
    window.addEventListener('blur', () => {
      this.input.keys.clear();
      for (const k of Object.keys(this.input.touch)) this.input.touch[k] = false;
    });
  }

  key(...codes) {
    return codes.some((c) => this.input.keys.has(c));
  }

  pollGamepad() {
    if (!navigator.getGamepads) return null;
    const pads = navigator.getGamepads();
    const pad = pads && (pads[0] || pads[1] || pads[2] || pads[3]);
    if (!pad) return null;
    const dead = 0.16;
    const axis = Math.abs(pad.axes[0] || 0) > dead ? pad.axes[0] : 0;
    const rt = pad.buttons[7]?.value || 0;
    const lt = pad.buttons[6]?.value || 0;
    return { steer: axis, throttle: rt, brake: lt, buttons: pad.buttons };
  }

  padButton(index) {
    const pad = this.pollGamepad();
    return pad ? !!pad.buttons[index]?.pressed : false;
  }

  handlePadButtons() {
    const prev = this.padPrev || {};
    const check = (idx, name, action) => {
      const now = this.padButton(idx);
      if (now && !prev[name]) action();
      prev[name] = now;
    };
    check(3, 'camera', () => this.cycleCamera());
    check(2, 'interact', () => this.interact());
    check(9, 'pause', () => this.togglePause());
    check(0, 'cruise', () => this.toggleCruise());
    check(1, 'lights', () => this.toggleLights());
    check(12, 'up', () => { if (!this.truck.autoGearbox) { this.truck.shiftUp(); this.audio.shift(); } });
    check(13, 'down', () => { if (!this.truck.autoGearbox) { this.truck.shiftDown(); this.audio.shift(); } });
    this.padPrev = prev;
  }

  toggleIndicator(dir) {
    if (!this.truck) return;
    this.indicator = this.indicator === dir ? 0 : dir;
    this.indicatorTimer = 0;
    this.blinkPhase = 0;
    if (this.indicator) this.ui.toast(dir < 0 ? 'Левый поворотник' : 'Правый поворотник', 'info', 1200);
  }

  controls() {
    const t = this.input.touch;
    let throttle = 0;
    let brake = 0;
    let raw = 0;
    if (this.key('KeyW', 'ArrowUp') || t.KeyW) throttle = 1;
    if (this.key('KeyS', 'ArrowDown') || t.KeyS) brake = 1;
    if (this.key('Space')) throttle = 0;
    if (this.truck) this.truck.handbrake = this.key('Space');
    if (this.key('KeyA', 'ArrowLeft') || t.KeyA) raw -= 1;
    if (this.key('KeyD', 'ArrowRight') || t.KeyD) raw += 1;
    // Сенсорный руль-рейка даёт аналоговый сигнал: он мягче кнопок.
    const touchSteer = clamp(this.input.touchSteer || 0, -1, 1);
    if (Math.abs(touchSteer) > 0.02) raw = clamp(raw + touchSteer, -1, 1);
    const pad = this.pollGamepad();
    if (pad) {
      if (Math.abs(pad.steer) > 0) raw = clamp(raw + pad.steer, -1, 1);
      if (pad.throttle > 0.05) throttle = Math.max(throttle, pad.throttle);
      if (pad.brake > 0.05) brake = Math.max(brake, pad.brake);
    }
    // Клавиатура даёт только -1/0/1. Чтобы машина не «дёргалась», ввод руля
    // сглаживается: полный ход примерно за 0.42 с, возврат — за 0.28 с,
    // а перекладка из стороны в сторону — быстрее (контрруль).
    const dt = clamp(this.frameDt || 0.016, 0.001, 0.05);
    const prev = this.steerAxis || 0;
    let target = clamp(raw, -1, 1);
    // Мягкая кривая: половина хода руля = примерно 0.42 усилия (для геймпада).
    const sensitivity = clamp(Number(this.settings.steerSensitivity) || 1, 0.5, 1.6);
    target = Math.sign(target) * Math.pow(Math.abs(target), 1.35) * sensitivity;
    target = clamp(target, -1, 1);
    let rate;
    if (target === 0) rate = 5.2;
    else if (prev * target < 0) rate = 7.4;
    else rate = 3.3;
    const maxStep = rate * dt;
    this.steerAxis = prev + clamp(target - prev, -maxStep, maxStep);
    if (Math.abs(this.steerAxis) < 0.004) this.steerAxis = 0;
    return { throttle, brake, steer: this.steerAxis, assist: this.settings.steerAssist !== false };
  }

  // ---------------------------------------------------------------- Меню и профили
  refreshSaveInfo() {
    const filled = this.saves.slots.filter(Boolean);
    $('btn-continue').disabled = filled.length === 0;
    $('menu-save-info').textContent = filled.length
      ? `Сохранений: ${filled.length} · последнее: ${filled[0]?.name || filled[1]?.name || filled[2]?.name}`
      : 'Сохранений пока нет — начните карьеру';
    const slotName = this.saves.slots[this.saves.lastSlot];
    $('btn-continue').textContent = slotName ? `Продолжить: ${slotName.name}` : 'Продолжить карьеру';
  }

  continueCareer() {
    const idx = this.saves.slots.findIndex((s) => s && s.id === this.saves.slots[this.saves.lastSlot]?.id);
    this.loadSlot(idx >= 0 ? idx : this.saves.slots.findIndex(Boolean));
  }

  loadSlot(index) {
    const raw = this.saves.slots[index];
    if (!raw) {
      this.newCareerDialog(index);
      return;
    }
    this.slot = index;
    this.profile = upgradeProfile(raw);
    this.clock = { ...this.profile.clock };
    this.audio.init();
    this.enterGarage();
  }

  newCareerDialog(presetSlot) {
    const slot = Number.isInteger(presetSlot) ? presetSlot : this.saves.slots.findIndex((s) => !s);
    const target = slot >= 0 ? slot : 0;
    this.ui.openModal({
      eyebrow: 'НОВАЯ КАРЬЕРА',
      title: 'Начать путь',
      body: `<p>Вы — владелец подержанного тягача и участник европейского рынка грузоперевозок.</p>
        <div class="field-row"><label>Имя водителя</label><input type="text" id="new-name" value="Водитель" maxlength="18"></div>
        <div class="field-row"><label>Стартовый город</label>
          <select id="new-city" style="background:rgba(255,255,255,.06);border:1px solid var(--line);color:var(--text);padding:8px 10px;border-radius:8px;font-family:inherit">
            ${['berlin', 'amsterdam', 'paris', 'warsaw', 'vienna', 'prague', 'munich', 'milan']
              .map((id) => `<option value="${id}">${CITY_BY_ID.get(id).name}</option>`)
              .join('')}
          </select></div>
        <div class="field-row"><label>Слот сохранения</label><b>${target + 1}</b></div>
        <p style="font-size:12px">Стартовый капитал: 9 200 €, тягач Auriga 3 · 330 л.с. Заработать на новый грузовик можно рейсами.</p>`,
      actions: [
        { label: 'Отмена', act: 'close' },
        { label: 'Начать карьеру', primary: true, act: 'create-career', arg: String(target) },
      ],
    });
    // Добавляем обработку кнопки создания.
    const btn = $('modal-foot').querySelector('[data-act="create-career"]');
    if (btn) {
      btn.addEventListener('click', () => {
        const name = ($('new-name')?.value || 'Водитель').trim().slice(0, 18) || 'Водитель';
        const city = $('new-city')?.value || 'berlin';
        this.ui.closeModal();
        this.createCareer(name, city, target);
      });
    }
  }

  createCareer(name, cityId, slot) {
    const profile = createProfile(name);
    profile.currentCity = cityId;
    profile.companyName = 'Auriga Logistics';
    this.slot = slot;
    this.profile = profile;
    this.clock = { ...profile.clock };
    this.audio.init();
    this.saveNow();
    this.enterGarage();
    this.ui.toast('Карьера создана. Возьмите первый груз!', 'good', 4200);
  }

  profilesDialog() {
    const slots = this.saves.slots;
    const body = `<div class="slot-list">${slots
      .map((s, i) => {
        if (!s) {
          return `<div class="slot" data-act="new-slot" data-arg="${i}">
            <div class="slot-num">${i + 1}</div>
            <div class="slot-info"><b>Свободный слот</b><small>Начать новую карьеру</small></div>
            <button class="btn btn-sm">Создать</button>
          </div>`;
        }
        return `<div class="slot">
          <div class="slot-num">${i + 1}</div>
          <div class="slot-info"><b>${s.name}</b>
            <small>${CITY_BY_ID.get(s.currentCity)?.name || '—'} · ${s.stats?.deliveries || 0} рейсов · ${fmtMoney(s.money)}</small>
          </div>
          <button class="btn btn-sm btn-primary" data-act="load-slot" data-arg="${i}">Загрузить</button>
          <button class="btn btn-sm btn-ghost" data-act="delete-slot" data-arg="${i}">Удалить</button>
        </div>`;
      })
      .join('')}</div>`;
    this.ui.openModal({
      eyebrow: 'ПРОФИЛИ',
      title: 'Сохранения',
      body,
      actions: [{ label: 'Закрыть', act: 'close' }],
    });
  }

  deleteSlot(index) {
    this.saves.slots[index] = null;
    saveGame(this.saves.slots, this.saves.lastSlot);
    if (this.profile && this.slot === index) {
      this.profile = null;
      this.state = 'menu';
    }
    this.refreshSaveInfo();
    this.profilesDialog();
  }

  returnToMenu() {
    if (this.profile) this.saveNow();
    this.state = 'menu';
    this.paused = false;
    this.ui.setScreen('menu');
    this.refreshSaveInfo();
    this.disposeWorld();
  }

  // ---------------------------------------------------------------- Гараж
  enterGarage(tab = 'jobs') {
    this.state = 'garage';
    this.paused = false;
    this.disposeWorld();
    this.profile.level = levelForXp(this.profile.xp || 0).level;
    this.clock = { ...this.profile.clock };
    this.refreshOffers();
    this.ui.setScreen('garage');
    this.ui.navTab = tab;
    this.ui.renderGarage();
    this.saveNow();
  }

  openGarageTab(tab) {
    this.enterGarage(tab);
  }

  currentMinutes() {
    return (this.clock.day - 1) * 1440 + this.clock.minutes;
  }

  refreshOffers(force = false) {
    if (!this.profile) return;
    const now = this.currentMinutes();
    if (!force && this.offers.length) {
      this.offers = this.offers.filter((o) => o.expires > now);
      if (this.offers.length >= 6) return;
    }
    const seedBase = Math.floor(now / 240);
    this.offers = makeOffers(this.profile, this.profile.currentCity, 10, now, seedBase);
  }

  freeDrive(cityId) {
    if (!cityId || cityId === this.profile.currentCity) {
      this.ui.toast('Выберите другой город для поездки', 'info');
      return;
    }
    const job = {
      id: 'free-' + Date.now(),
      from: this.profile.currentCity,
      to: cityId,
      fromName: CITY_BY_ID.get(this.profile.currentCity).name,
      toName: CITY_BY_ID.get(cityId)?.name || cityId,
      cargo: 'Без груза',
      mass: 0,
      category: 'general',
      trailer: 'curtain',
      pay: 0,
      deadlineMin: 9999,
      distance: Math.max(5, cityDistanceKm(CITY_BY_ID.get(this.profile.currentCity), CITY_BY_ID.get(cityId))),
      free: true,
      seed: Date.now() % 100000,
    };
    this.ui.closeModal();
    this.startDrive(job);
  }

  // ---------------------------------------------------------------- Рынок и рейсы
  acceptJob(job) {
    if (this.profile.activeJob) {
      this.ui.openModal({
        eyebrow: 'ВНИМАНИЕ',
        title: 'Уже есть активный рейс',
        body: `<p>Сначала завершите текущий контракт: ${this.profile.activeJob.fromName} → ${this.profile.activeJob.toName}.</p>`,
        actions: [
          { label: 'К активному рейсу', primary: true, act: 'continue-job' },
          { label: 'Отмена', act: 'close' },
        ],
      });
      return;
    }
    const city = CITY_BY_ID.get(job.from);
    if (job.free !== true && city.id !== this.profile.currentCity) {
      this.ui.toast('Контракт доступен только из текущего города', 'bad');
      return;
    }
    const routeJob = {
      ...job,
      seed: job.seed || hashString(job.id),
      acceptedAt: this.currentMinutes(),
      routeCities: null,
    };
    this.profile.activeJob = routeJob;
    this.startDrive(routeJob);
  }

  continueActiveJob() {
    if (!this.profile.activeJob) {
      this.ui.toast('Нет активного рейса', 'info');
      return;
    }
    this.ui.closeModal();
    this.startDrive(this.profile.activeJob);
  }

  abandonJob() {
    this.profile.activeJob = null;
    this.enterGarage();
    this.ui.toast('Рейс отменён', 'info');
  }

  startDrive(job) {
    this.ui.loading('Строим маршрут…', `${job.fromName} → ${job.toName}`);
    this.state = 'loading';
    setTimeout(() => {
      try {
        this.setupWorld(job);
        this.state = 'driving';
        this.ui.setScreen('driving');
        this.paused = false;
      } catch (err) {
        console.error(err);
        this.ui.toast('Не удалось построить маршрут', 'bad');
        this.enterGarage();
      }
    }, 60);
  }

  setupWorld(job) {
    this.disposeWorld();
    const seed = job.seed || 1234;
    // Путь по городам: сохраняем, чтобы рейс восстанавливался одинаково.
    const route = buildRouteGeometry(job.routeCities || this.pathFor(job.from, job.to), seed);
    job.routeCities = route.cityIds;
    this.route = route;
    this.job = job;
    job.distance = Math.round(route.km * 10) / 10;
    this.phase = job.free ? 'free' : 'pickup';
    this.fines = 0;
    this.camerasHit.clear();
    this.work = null;
    this.parkedAtDepot = null;
    this.interaction = null;

    const paint = PAINT_COLORS.find((c) => c.id === this.profile.truck.paint) || PAINT_COLORS[1];
    this.truckView.setPaint(paint.hex);
    this.truckView.setInteriorVisible(this.cameraMode === 'interior');
    const model = TRUCK_MODELS.find((m) => m.id === this.profile.truck.modelId) || TRUCK_MODELS[0];
    const engineUpg = UPGRADES.engine[this.profile.truck.engine || 0];
    this.truck = new TruckSim({
      model,
      upgradePower: engineUpg.power,
      tireGrip: UPGRADES.tires[this.profile.truck.tires || 0].grip,
      retarder: UPGRADES.retarder[this.profile.truck.retarder || 0].strength,
      cargoMass: 0,
      fuel: Math.round(this.profile.truck.fuel),
      engine: this.profile.truck.condition.engine,
      tires: this.profile.truck.condition.tires,
      brakes: this.profile.truck.condition.brakes,
      odometer: this.profile.truck.odometer,
    });
    this.truck.engineOn = true;
    this.truck.handbrake = false;

    const firstMark = route.marks[0];
    const lastMark = route.marks[route.marks.length - 1];
    this.startS = 40;
    this.pickupS = clamp(firstMark.s + 1100, 200, route.length - 200);
    this.deliveryS = clamp((lastMark?.s || route.length) - 700, 300, route.length - 60);
    this.phaseStartS = this.startS;
    this.truck.s = this.startS;
    this.truck.lat = -1.85;
    this.playerSpeed = 0;
    if (job.playerS != null) {
      this.truck.s = clamp(job.playerS, 20, route.length - 40);
      this.phase = job.phase || this.phase;
      this.cargoDamage = job.cargoDamage || 0;
      if (this.phase === 'delivery') this.truck.cargoMass = job.mass || 0;
    }
    this.phaseStartS = this.phase === 'delivery' ? this.pickupS : this.startS;

    this.depots = [
      { s: this.pickupS, label: 'ПОГРУЗКА', sub: this.job.company || '', color: '#1f5c3a' },
      { s: this.deliveryS, label: 'ВЫГРУЗКА', sub: this.job.toName || '', color: '#8a5a12' },
    ];
    this.road = new RoadWorld(this.scene, route, this.depots);
    this.traffic = new Traffic(this.scene, route, this.trafficCount());
    this.traffic.reset(route);
    this.applyWorldShadows();

    this.setWeather(this.pickWeather(), true);
    this.drivingDistance = 0;
    this.nightDistance = 0;
    this.ui.toast('Двигатель работает. W — газ, E — погрузка, V — камера', 'info', 5000);
    this.updateCamera(0.016, true);
  }

  pathFor(from, to) {
    return networkRouteKm(from, to).path;
  }

  targetS() {
    if (this.phase === 'pickup') return this.pickupS;
    return this.deliveryS;
  }

  remainingMeters() {
    if (!this.route || !this.truck) return 0;
    return this.targetS() - this.truck.s;
  }

  phaseDistance() {
    if (this.phase === 'pickup') return Math.max(1, Math.abs(this.pickupS - this.startS));
    if (this.phase === 'delivery') return Math.max(1, this.deliveryS - this.pickupS);
    return Math.max(1, this.deliveryS - this.startS);
  }

  etaMinutes() {
    const remains = Math.abs(this.remainingMeters());
    const speed = Math.max(8, Math.abs(this.truck?.speed || 0) * 3.6 * 0.9);
    return Math.round((remains / 1000 / speed) * 60);
  }

  jobElapsed() {
    if (!this.job) return 0;
    return Math.max(0, this.currentMinutes() - (this.job.acceptedAt ?? this.currentMinutes()));
  }

  // ---------------------------------------------------------------- Погода и время
  pickWeather() {
    // Первый выезд — всегда солнечный: первое впечатление задаёт картинка.
    if ((this.profile?.stats?.jobs || 0) < 1 && !this.weatherRolled) {
      this.weatherRolled = true;
      return 'clear';
    }
    const r = Math.random();
    if (r < 0.36) return 'clear';
    if (r < 0.62) return 'cloudy';
    if (r < 0.78) return 'overcast';
    if (r < 0.9) return 'rain';
    if (r < 0.95) return 'storm';
    return 'fog';
  }

  setWeather(id, instant = false) {
    this.weatherId = id;
    this.sky.setWeather(id, instant);
    this.weatherTimer = 900 + Math.random() * 1500; // игровые минуты
  }

  advanceClock(realDt) {
    const scale = Number(this.settings.timeScale) || 3;
    const gameMinutes = (realDt * scale) / 60;
    this.clock.minutes += gameMinutes;
    while (this.clock.minutes >= 1440) {
      this.clock.minutes -= 1440;
      this.clock.day++;
      this.payDriverIncome();
    }
    this.weatherTimer -= gameMinutes;
    if (this.weatherTimer <= 0) this.setWeather(this.pickWeather());
    this.driverIncomeTimer += gameMinutes;
    if (this.driverIncomeTimer >= 60) {
      this.driverIncomeTimer = 0;
      this.payDriverIncome();
    }
  }

  payDriverIncome() {
    if (!this.profile) return;
    const drivers = this.profile.drivers || [];
    if (!drivers.length) return;
    let total = 0;
    for (const d of drivers) {
      total += d.rate;
      d.earned = (d.earned || 0) + d.rate;
      d.exp = (d.exp || 0) + 1;
      d.rate = Math.min(600, Math.round(d.rate * 1.004));
    }
    this.profile.money += total;
    if (total > 0 && this.state === 'driving') this.ui.toast(`Водители заработали ${fmtMoney(total)}`, 'good');
  }

  airTemp() {
    const t = (this.clock.minutes - 360) / 1440;
    const base = 12 + Math.sin(t * Math.PI * 2) * 7;
    const w = this.weatherId;
    return Math.round(base + (w === 'rain' || w === 'storm' ? -3 : w === 'clear' ? 3 : 0));
  }

  // ---------------------------------------------------------------- Игровой цикл
  loop(now) {
    const dt = Math.min(0.05, (now - this.last) / 1000);
    this.last = now;
    this.fpsAccum += dt;
    this.fpsFrames++;
    if (this.fpsAccum > 0.5) {
      this.fps = this.fpsFrames / this.fpsAccum;
      this.fpsAccum = 0;
      this.fpsFrames = 0;
      // Автоснижение качества, если устройство не тянет (только в режиме «авто»).
      const auto = (this.settings?.quality || 'auto') === 'auto';
      if (auto && this.state === 'driving') {
        this.lowFpsTime = this.fps < 26 ? (this.lowFpsTime || 0) + 0.5 : 0;
        if (this.lowFpsTime > 4 && !this.degradedShadows && this.renderer?.shadowMap.enabled) {
          this.degradedShadows = true;
          this.renderer.shadowMap.enabled = false;
          if (this.sky?.sunLight) this.sky.sunLight.castShadow = false;
          if (this.contactShadowMat) this.contactShadowMat.opacity = Math.min(0.7, this.contactShadowMat.opacity + 0.12);
        } else if (this.lowFpsTime > 9 && !this.degradedPixelRatio) {
          this.degradedPixelRatio = true;
          this.renderer.setPixelRatio(Math.max(0.65, (this.renderer.getPixelRatio() || 1) * 0.78));
        }
      }
    }
    if (this.state === 'driving' && !this.paused && this.truck) {
      this.updateDriving(dt);
    } else if ((this.state === 'garage' || this.state === 'menu') && this.clock) {
      // В гараже время идёт, но медленнее.
      if (this.profile) this.advanceClock(dt * 0.25);
    }
    if (this.renderer) {
      this.renderer.render(this.scene, this.camera);
    }
    requestAnimationFrame(this.raf);
  }

  updateDriving(dt) {
    this.frameDt = dt;
    this.advanceClock(dt);
    this.sky.setTime(this.clock.minutes);
    const env = this.sky.update(dt, this.camera, this.clock.minutes);
    this.night = env.night;
    this.road.night = env.night;
    this.road.weatherWetness = env.wet;
    this.road.update(this.truck.s, dt);

    this.handlePadButtons();
    this.updateIndicators(dt);
    this.truck.wetness = env.wet;
    this.truck.fatigue = this.profile.fatigue || 0;
    const controls = this.controls();
    if (this.work) {
      controls.throttle = 0;
      controls.brake = 1;
      this.work.elapsed += dt;
      const p = this.work.elapsed / this.work.duration;
      if (this.work.elapsed >= this.work.duration) {
        const done = this.work.onDone;
        this.work = null;
        this.ui.showWork('', 0, false);
        done();
      } else if (this.truck.speed > 0.4) {
        this.work = null;
        this.ui.showWork('', 0, false);
        this.ui.toast('Погрузка прервана', 'bad');
      } else {
        this.ui.showWork(this.work ? this.work.title : '', p);
      }
    }

    // Физика с фиксированным шагом.
    this.accumulator += dt;
    const step = 1 / 90;
    let iterations = 0;
    while (this.accumulator >= step && iterations < 8) {
      const p0 = this.route.pointAt(this.truck.s);
      const p1 = this.route.pointAt(this.truck.s + 2);
      const grade = (p1.y - p0.y) / 2;
      const limit = speedLimitAt(this.route, this.truck.s);
      this.truck.step(step, controls, { curv: p0.curv, grade, speedLimit: limit });
      this.accumulator -= step;
      iterations++;
    }
    this.currentLimit = speedLimitAt(this.route, this.truck.s);
    this.updateTruckTransform(dt);
    this.traffic.update(dt, this.truck.s, this.truck.lat, this.truck.speed, env.night);
    this.checkCollisions(dt);
    this.checkTriggers(dt);
    this.checkCameras();
    this.updateFatigue(dt);

    // Позиция и камера.
    // При смене режима камеру ставим сразу, иначе она «летит» через полкарты.
    this.updateCamera(dt, this.cameraMode !== this.lastCameraMode);
    this.lastCameraMode = this.cameraMode;

    // Звук.
    this.audio.update({
      rpm: this.truck.rpm,
      throttle: this.truck.throttle,
      speed: this.truck.speed,
      rain: env.rain,
      engineOn: this.truck.engineOn,
      gear: this.truck.gear,
    });
    this.truckView.setNight(env.night, this.lightsOn || env.night > 0.55);
    if (this.lightsOn !== this.lastLights && this.truck) {
      this.lastLights = this.lightsOn;
    }

    // Предупреждение о низком уровне топлива.
    if (this.truck.fuel / this.truck.fuelCapacity < 0.14 && !this.lowFuelWarned) {
      this.lowFuelWarned = true;
      this.ui.toast('Мало топлива — заправьтесь на АЗС (E)', 'bad', 4200);
    }
    if (this.truck.fuel / this.truck.fuelCapacity > 0.25) this.lowFuelWarned = false;

    // Кончилось топливо — предлагаем техпомощь.
    if (this.truck.fuel <= 0.05 && !this.fuelHelpShown && Math.abs(this.truck.speed) < 0.6) {
      this.fuelHelpShown = true;
      this.offerFuelHelp();
    }
    if (this.truck.fuel > 1) this.fuelHelpShown = false;

    // Статистика.
    const moved = Math.abs(this.truck.speed) * dt;
    this.drivingDistance += moved;
    this.profile.stats.distance += moved / 1000;
    if (env.night > 0.5) this.nightDistance += moved;
    this.profile.stats.topSpeed = Math.max(this.profile.stats.topSpeed || 0, this.truck.speed * 3.6);

    // Поворотники и капли на стекле.
    const leftEl = $('ind-left');
    const rightEl = $('ind-right');
    const blinkOn = this.indicator && Math.floor(this.blinkPhase / 0.31) % 2 === 0;
    if (leftEl) leftEl.className = 'ind' + (blinkOn && this.indicator < 0 ? ' on-left' : '');
    if (rightEl) rightEl.className = 'ind' + (blinkOn && this.indicator > 0 ? ' on-right' : '');
    const vig = $('fatigue-vignette');
    if (vig) vig.style.opacity = String(clamp(((this.profile.fatigue || 0) - 45) / 55, 0, 0.85));
    const shield = $('windshield');
    if (shield) {
      const interior = this.cameraMode === 'interior' || this.cameraMode === 'hood';
      const rain = env.rain || 0;
      shield.className = 'windshield' + (interior && rain > 0.55 ? ' heavy' : interior && rain > 0.08 ? ' wet' : '');
    }

    // HUD.
    this.lastHudUpdate += dt;
    if (this.lastHudUpdate > 0.1) {
      this.lastHudUpdate = 0;
      this.updateHud(env);
    }
    // Автосохранение.
    this.lastSave += dt;
    if (this.lastSave > SAVE_INTERVAL) {
      this.lastSave = 0;
      this.syncProfileFromTruck();
      this.saveNow(true);
    }
  }

  updateHud(env) {
    this.ui.updateHud({
      speedKmh: Math.abs(this.truck.speed) * 3.6,
      rpm: this.truck.rpm,
      gear: this.truck.gear,
      fuel: this.truck.fuel,
      fuelPct: this.truck.fuel / this.truck.fuelCapacity,
      temp: this.truck.temp,
      condition: Math.min(this.truck.engine, this.truck.tires * 1.15, 100),
      fatigue: this.profile.fatigue || 0,
      speedLimit: this.currentLimit || 80,
      cruise: this.truck.cruise,
      autoGearbox: this.truck.autoGearbox,
      weatherName: env.weatherName,
      airTemp: this.airTemp(),
      fps: this.fps,
    });
  }

  updateTruckTransform(dt) {
    const p = this.route.pointAt(this.truck.s);
    const pos = this.route.worldPos(this.truck.s, this.truck.lat);
    const pitch = this.truck.pitch + (this.truck.bounce || 0);
    const roll =
      this.truck.roll +
      (this.truck.slip ? Math.sin(performance.now() * 0.02) * 0.01 * this.truck.slip : 0) +
      (this.truck.jackknife ? Math.sin(performance.now() * 0.03) * 0.006 * this.truck.jackknife : 0);
    this.truckView.setPosition(pos.x, pos.y, pos.z, p.hdg + this.truck.yawRel, pitch, roll);
    this.truckView.setTrailerAngle(this.truck.trailerYawOffset, this.truck.trailerRoll);
    this.truckView.update(
      {
        speedKmh: Math.abs(this.truck.speed) * 3.6,
        rpm: this.truck.rpm,
        gear: this.truck.gear,
        fuel: this.truck.fuel,
        temp: this.truck.temp,
        clock: this.clock.minutes,
      },
      dt,
      {
        steer: this.truck.steer / 0.55,
        brake: this.truck.brake,
        rain: this.sky.weather.rain,
        trailerType: this.job?.trailer || 'curtain',
        company: this.job?.company || 'Auriga Logistics',
      }
    );
    this.truckView.drawNav({
      title: this.phase === 'pickup' ? 'ЗАБРАТЬ ГРУЗ' : 'ДОСТАВКА',
      distance: this.fmtDistanceShort(Math.abs(this.remainingMeters())),
      eta: 'ETA ' + fmtTime(this.clock.minutes + this.etaMinutes()),
    });
    this.truckPos.set(pos.x, pos.y, pos.z);
    if (this.sky) this.sky.focus.copy(this.truckPos);
    if (this.contactShadow) {
      this.contactShadow.visible = this.state === 'driving';
      this.contactShadow.position.copy(pos);
      this.contactShadow.rotation.y = p.hdg + this.truck.yawRel;
      const nightDim = 0.28 + 0.5 * clamp(1 - (this.night || 0), 0, 1);
      this.contactShadowMat.opacity = nightDim;
    }
  }

  fmtDistanceShort(m) {
    return m >= 1000 ? (m / 1000).toFixed(1).replace('.', ',') + ' км' : Math.round(m) + ' м';
  }

  updateCamera(dt, instant = false) {
    if (!this.truck) return;
    const mode = this.cameraMode;
    const root = this.truckView.root;
    const shake = this.cameraShake > 0 ? this.cameraShake * 0.06 * Math.sin(performance.now() * 0.05) : 0;
    this.cameraShake = Math.max(0, this.cameraShake - dt * 3);
    const speed = Math.abs(this.truck.speed);

    // Курс камеры сзади сглаживается отдельно от курса машины: при рулении кадр
    // не «облетает» тягач, а плавно доворачивает за направлением движения.
    const yaw = root.rotation.y;
    if (this.camYaw === undefined || instant) this.camYaw = yaw;
    else {
      let d = yaw - this.camYaw;
      while (d > Math.PI) d -= Math.PI * 2;
      while (d < -Math.PI) d += Math.PI * 2;
      // Чем быстрее едем, тем охотнее камера держится за трассой (но без рывков).
      const rate = 1.4 + clamp(speed * 0.12, 0, 1.6);
      this.camYaw += d * (1 - Math.exp(-dt * rate));
    }

    if (mode === 'interior' || mode === 'hood') {
      this.truckView.setInteriorVisible(mode === 'interior');
      root.updateMatrixWorld(true);
      const offset = mode === 'interior' ? new THREE.Vector3(-EYE.x, EYE.y, EYE.z) : new THREE.Vector3(0, 4.06, 2.55);
      this.tmpVec.copy(offset);
      root.localToWorld(this.tmpVec);
      this.camera.position.copy(this.tmpVec);
      // Голова водителя смотрит по ходу кабины: никакого «поворота за рулём».
      const euler = new THREE.Euler(
        (mode === 'interior' ? -0.075 : -0.12) + root.rotation.x * 0.6,
        root.rotation.y + Math.PI,
        root.rotation.z * 0.25 + shake,
        'YXZ'
      );
      this.camera.quaternion.setFromEuler(euler);
      this.camera.fov = mode === 'interior' ? 56 : 68;
    } else {
      this.truckView.setInteriorVisible(false);
      const back = mode === 'far' ? 34 : 23;
      const up = mode === 'far' ? 13 : 6.6;
      const fwdX = Math.sin(this.camYaw);
      const fwdZ = Math.cos(this.camYaw);
      const target = this.camTarget.set(
        this.truckPos.x - fwdX * back,
        this.truckPos.y + up,
        this.truckPos.z - fwdZ * back
      );
      const look = this.camLookAt.set(this.truckPos.x + fwdX * 12, this.truckPos.y + 1.9, this.truckPos.z + fwdZ * 12);
      const follow = instant ? 1 : clamp(dt * 4.2, 0.05, 1);
      this.camera.position.lerp(target, follow);
      this.camLook.lerp(look, follow);
      this.camera.lookAt(this.camLook);
      this.camera.fov = mode === 'far' ? 58 : 66;
      this.camera.rotateZ(shake * 0.35);
    }
    const targetFov = this.camera.fov + clamp(speed * 0.08, 0, 2.2);
    this.camera.fov = lerp(this.camera.fov, targetFov, 0.06);
    this.camera.updateProjectionMatrix();
  }

  updateIndicators(dt) {
    if (!this.truck) return;
    this.indicatorTimer = (this.indicatorTimer || 0) + dt;
    if (this.indicator && this.indicatorTimer > 18) this.indicator = 0; // автозатухание
    this.blinkPhase = (this.blinkPhase || 0) + dt;
    if (this.indicator && this.blinkPhase > 0.62) {
      this.blinkPhase = 0;
      this.audio.indicator();
    }
    // Автоотключение после завершения манёвра.
    if (this.indicator && this.truck.speed > 6 && this.indicatorTimer > 6 && Math.abs(this.truck.steer) < 0.02) {
      this.indicator = 0;
    }
  }

  cycleCamera() {
    this.cameraUserSet = true;
    const idx = CAMERA_MODES.indexOf(this.cameraMode);
    this.cameraMode = CAMERA_MODES[(idx + 1) % CAMERA_MODES.length];
    this.cameraMode = this.cameraMode;
    if (this.cameraMode !== 'interior' && this.cameraMode !== 'hood') {
      this.camLook.set(this.truckPos.x, this.truckPos.y + 1.8, this.truckPos.z);
    }
    this.ui.toast(
      'Камера: ' +
        ({ interior: 'из кабины', hood: 'с капота', chase: 'сзади', far: 'сверху сзади' }[this.cameraMode]),
      'info',
      1400
    );
  }

  toggleCruise() {
    if (!this.truck) return;
    if (this.truck.cruise != null) {
      this.truck.cruise = null;
      this.ui.toast('Круиз-контроль выключен', 'info', 1600);
    } else if (this.truck.speed > 5) {
      this.truck.cruise = Math.round(Math.abs(this.truck.speed) * 3.6);
      this.ui.toast('Круиз-контроль: ' + this.truck.cruise + ' км/ч', 'good', 1800);
    } else {
      this.ui.toast('Для круиза нужна скорость выше 20 км/ч', 'info');
    }
  }

  toggleGearbox() {
    if (!this.truck) return;
    this.truck.autoGearbox = !this.truck.autoGearbox;
    this.ui.toast(this.truck.autoGearbox ? 'Коробка: автоматический режим' : 'Коробка: ручной режим (Shift/Ctrl)', 'info', 2200);
  }

  toggleLights() {
    this.lightsOn = !this.lightsOn;
    this.truckView.setNight(this.night || 0, this.lightsOn);
    this.ui.toast(this.lightsOn ? 'Фары включены' : 'Фары выключены', 'info', 1400);
  }

  // ---------------------------------------------------------------- Коллизии и события
  checkCollisions(dt) {
    if (this.collisionCooldown > 0) this.collisionCooldown -= dt;
    const hit = this.traffic.collide(this.truck.s, this.truck.lat);
    if (hit && this.collisionCooldown <= 0 && Math.abs(this.truck.speed) > 0.5) {
      const relSpeed = Math.abs(this.truck.speed - hit.speed);
      const damage = clamp(4 + relSpeed * 0.8, 4, 26);
      this.truck.engine = Math.max(0, this.truck.engine - damage * 0.5);
      this.truck.brakes = Math.max(0, this.truck.brakes - damage * 0.2);
      this.profile.stats.collisions++;
      this.collisionCooldown = 1.6;
      this.cameraShake = 1.2;
      this.truck.speed = Math.min(this.truck.speed, hit.speed * 0.55);
      this.truck.cruise = null;
      this.ui.flashDamage();
      this.ui.toast('Столкновение с ' + (hit.type === 'truck' ? 'грузовиком' : hit.type === 'bus' ? 'автобусом' : 'автомобилем'), 'bad');
      this.audio.alarm();
      this.damageCargo(damage);
      hit.s += 6;
    }
    // Отбойник.
    if (this.truck.lat < -4.95 || this.truck.lat > 4.0) {
      if (this.cameraShake < 0.1) {
        this.cameraShake = 0.35;
        this.audio.blip(90, 0.2, 'sawtooth', 0.06);
      }
      this.truck.lat = clamp(this.truck.lat, -4.95, 4.0);
      this.truck.speed *= 1 - dt * 0.8;
      this.truck.engine = Math.max(0, this.truck.engine - dt * 0.6);
    }
  }

  damageCargo(amount) {
    if (this.phase !== 'delivery') return;
    this.cargoDamage = clamp((this.cargoDamage || 0) + amount * 0.7, 0, 100);
  }

  checkCameras() {
    const limit = this.currentLimit || 80;
    const speed = Math.abs(this.truck.speed) * 3.6;
    if (speed < limit + 11) return;
    for (const z of this.route.zones) {
      const key = 'zone' + z.from;
      if (!this.camerasHit.has(key) && this.truck.s > z.from && this.truck.s < z.from + 30) {
        this.camerasHit.add(key);
        this.fine(Math.round(90 + (speed - limit) * 9), 'Превышение скорости');
      }
    }
    for (const w of this.route.works) {
      const key = 'work' + w.from;
      if (!this.camerasHit.has(key) && this.truck.s > w.from && this.truck.s < w.from + 25) {
        this.camerasHit.add(key);
        this.fine(150, 'Скорость в зоне работ');
      }
    }
  }

  fine(amount, reason) {
    const value = Math.min(amount, Math.max(0, this.profile.money));
    this.profile.money -= value;
    this.profile.stats.fines += value;
    this.fines += value;
    this.ui.toast(`${reason}: штраф ${fmtMoney(value)}`, 'bad', 4200);
    this.audio.alarm();
  }

  checkTriggers(dt) {
    this.interaction = null;
    this.parkedAtDepot = null;
    const speedKmh = Math.abs(this.truck.speed) * 3.6;
    const s = this.truck.s;
    if (this.work) return;

    if (this.phase === 'pickup' || this.phase === 'delivery' || this.phase === 'free') {
      const dist = Math.abs(s - this.targetS());
      if (dist < 34) {
        if (speedKmh < 3) {
          this.parkedAtDepot = {
            act: 'interact',
            label: this.phase === 'pickup' ? 'E — начать погрузку' : this.phase === 'free' ? 'E — завершить поездку' : 'E — выгрузить груз',
          };
          this.interaction = { hint: this.phase === 'pickup' ? 'Вы на месте погрузки. Нажмите E' : 'Вы на месте выгрузки. Нажмите E' };
        } else {
          this.interaction = { hint: 'Остановитесь, чтобы продолжить' };
        }
      } else if (dist < 400) {
        this.interaction = { hint: `До цели ${Math.round(dist)} м` };
      } else if (s > this.targetS() + 40) {
        this.interaction = { hint: 'Пункт позади: включите задний ход (R)' };
        if (!this.tipsShown.has('overshoot')) {
          this.tipsShown.add('overshoot');
          this.ui.toast('Вы проехали пункт. Задний ход — клавиша R', 'info', 4200);
        }
      }
    }

    // Заправки на нашей стороне.
    for (const st of this.route.stations) {
      if (st.side < 0) continue;
      if (Math.abs(st.s - s) < 26 && speedKmh < 2.5 && !this.parkedAtDepot) {
        this.parkedAtDepot = { act: 'interact', label: `E — заправка (${st.brand})` };
        this.interaction = { hint: 'Заправка: остановитесь и нажмите E' };
        break;
      }
    }
    for (const rest of this.route.rests) {
      if (rest.side < 0) continue;
      if (Math.abs(rest.s - s) < 26 && speedKmh < 2.5 && !this.parkedAtDepot) {
        this.parkedAtDepot = { act: 'interact', label: 'E — зона отдыха' };
        this.interaction = { hint: 'Зона отдыха' };
        break;
      }
    }
    void dt;
  }

  interact() {
    if (this.work) return;
    const p = this.parkedAtDepot;
    if (!p) {
      if (this.phase === 'delivery' && Math.abs(this.truck.s - this.deliveryS) < 60) return;
      this.ui.toast('Здесь нечего делать. Подъедьте к цели и остановитесь', 'info', 2200);
      return;
    }
    const s = this.truck.s;
    if (this.phase === 'pickup' && Math.abs(s - this.pickupS) < 34) {
      this.startWork('Погрузка груза', 7, () => this.finishPickup());
      return;
    }
    if ((this.phase === 'delivery' || this.phase === 'free') && Math.abs(s - this.deliveryS) < 34) {
      this.startWork(this.phase === 'free' ? 'Завершение поездки' : 'Выгрузка груза', 4, () => this.finishDelivery());
      return;
    }
    for (const st of this.route.stations) {
      if (st.side > 0 && Math.abs(st.s - s) < 26) {
        const price = COUNTRIES[this.route.pointAt(st.s).country]?.fuel * st.priceMod || 1.75;
        this.openFuel(price);
        return;
      }
    }
    for (const rest of this.route.rests) {
      if (rest.side > 0 && Math.abs(rest.s - s) < 26) {
        this.ui.confirmRest();
        return;
      }
    }
  }

  startWork(title, duration, onDone) {
    this.work = { title, duration, elapsed: 0, onDone };
    this.truck.handbrake = true;
    this.truck.throttle = 0;
    this.audio.blip(420, 0.12, 'triangle', 0.05);
    this.ui.toast(title + '…', 'info', 2000);
  }

  finishPickup() {
    if (this.job.free) {
      this.phase = 'free';
      this.startS = this.pickupS;
      this.ui.toast('Свободная поездка началась', 'good');
      return;
    }
    this.phase = 'delivery';
    this.phaseStartS = this.truck.s;
    const cargoMass = this.job.mass || 10;
    this.truck.cargoMass = cargoMass;
    this.cargoDamage = 0;
    this.truck.handbrake = false;
    this.truck.inertia = 0;
    this.audio.cash();
    this.ui.toast(`Груз «${this.job.cargo}» (${this.job.mass} т) загружен. В путь!`, 'good', 4200);
    this.job.loadedAt = this.currentMinutes();
  }

  finishDelivery() {
    if (this.job.free || this.phase === 'free') {
      this.job = null;
      this.profile.activeJob = null;
      this.state = 'garage';
      this.enterGarage();
      this.ui.toast('Вы доехали. Свободная поездка завершена', 'good');
      return;
    }
    const job = this.job;
    const late = Math.max(0, this.jobElapsed() - job.deadlineMin);
    const damage = clamp(this.cargoDamage || 0, 0, 100);
    const result = payoutFor(job, damage, late, 0);
    const xp = jobXp(job, damage, late);
    const beforeMoney = this.profile.money;
    this.profile.money += result.total;
    this.profile.xp += xp;
    this.profile.stats.deliveries++;
    this.profile.stats.earnings += result.total;
    if (late > 0) this.profile.stats.late++;
    this.profile.currentCity = job.to;
    this.profile.activeJob = null;
    this.profile.truck.fuel = this.truck.fuel;
    this.profile.truck.odometer = this.truck.odometer;
    const prevLevel = levelForXp(this.profile.xp - xp).level;
    const newLevel = levelForXp(this.profile.xp).level;
    this.audio.cash();
    this.checkAchievements({ damage, late, job });
    this.saveNow();
    this.disposeWorld();
    this.enterGarage('jobs');
    this.ui.deliveryResult({
      job,
      pay: result.total,
      notes: result.notes,
      xp,
      stats: { distance: job.distance },
      levelUp: newLevel > prevLevel ? newLevel : null,
    });
    void beforeMoney;
  }

  updateFatigue(dt) {
    if (!this.profile) return;
    if (!this.profile.fatigue) this.profile.fatigue = 0;
    const moving = Math.abs(this.truck.speed) > 1;
    this.profile.fatigue = clamp(this.profile.fatigue + (moving ? dt * (100 / 2700) : dt * 0.004), 0, 100);
    if (this.profile.fatigue > 72 && !this.tipsShown.has('fatigue')) {
      this.tipsShown.add('fatigue');
      this.ui.toast('Вы устали. Найдите зону отдыха (E)', 'bad', 4600);
    }
    if (this.profile.fatigue > 96 && !this.tipsShown.has('fatigue2')) {
      this.tipsShown.add('fatigue2');
      this.ui.toast('Срочно нужен отдых! Внимание снижено', 'bad', 5000);
    }
  }

  // ---------------------------------------------------------------- Магазин и сервис
  refuelDialog() {
    const model = TRUCK_MODELS.find((m) => m.id === this.profile.truck.modelId) || TRUCK_MODELS[0];
    const city = CITY_BY_ID.get(this.profile.currentCity);
    const price = (COUNTRIES[city?.country]?.fuel || 1.7) * 1.02;
    const fuel = this.profile.truck.fuel;
    this.fuelPrice = price;
    this.ui.fuelDialog(price, fuel, model.tank, this.profile.money);
  }

  openFuel(price) {
    this.paused = true;
    this.fuelPause = true;
    this.ui.fuelDialog(price, this.truck.fuel, this.truck.fuelCapacity, this.profile.money);
    this.fuelContext = 'road';
    this.fuelPrice = price;
  }

  refuel(amount) {
    const price = this.fuelPrice || this.gameFuelPrice || 1.75;
    const cost = Math.min(this.profile.money, amount * price);
    const liters = Math.min(amount, cost / price);
    this.profile.money -= cost;
    this.profile.stats.fuelSpent = (this.profile.stats.fuelSpent || 0) + cost;
    if (this.truck) {
      this.truck.fuel = Math.min(this.truck.fuelCapacity, this.truck.fuel + liters);
      this.profile.truck.fuel = this.truck.fuel;
    } else {
      const model = TRUCK_MODELS.find((m) => m.id === this.profile.truck.modelId) || TRUCK_MODELS[0];
      this.profile.truck.fuel = Math.min(model.tank, this.profile.truck.fuel + liters);
    }
    this.audio.cash();
    this.ui.toast(`Заправлено ${Math.round(liters)} л за ${fmtMoney(cost)}`, 'good');
    this.paused = false;
    this.fuelPause = false;
    this.ui.renderGarage();
    this.saveNow();
  }

  repairDialog() {
    const c = this.profile.truck.condition;
    const cost = Math.round((100 - c.engine) * 42 + (100 - c.tires) * 26 + (100 - c.brakes) * 18);
    this.ui.confirmRepair(Math.max(0, cost), 'Двигатель, шины и тормоза будут восстановлены до 100%.');
  }

  repair() {
    const c = this.profile.truck.condition;
    const cost = Math.round((100 - c.engine) * 42 + (100 - c.tires) * 26 + (100 - c.brakes) * 18);
    if (this.profile.money < cost) {
      this.ui.toast('Недостаточно денег на ремонт', 'bad');
      return;
    }
    this.profile.money -= cost;
    c.engine = 100;
    c.tires = 100;
    c.brakes = 100;
    if (this.truck) {
      this.truck.engine = 100;
      this.truck.tires = 100;
      this.truck.brakes = 100;
    }
    this.audio.cash();
    this.ui.toast('Ремонт выполнен', 'good');
    this.ui.renderGarage();
    this.saveNow();
  }

  fullService() {
    this.repairDialog();
  }

  restDialog() {
    this.ui.confirmRest();
  }

  rest() {
    if (this.profile.money < 45) {
      this.ui.toast('Не хватает 45 € на стоянку', 'bad');
      return;
    }
    this.profile.money -= 45;
    this.profile.fatigue = 0;
    this.clock.minutes += 9 * 60;
    while (this.clock.minutes >= 1440) {
      this.clock.minutes -= 1440;
      this.clock.day++;
    }
    this.setWeather(this.pickWeather(), true);
    if (this.truck) {
      this.truck.handbrake = true;
      this.truck.speed = 0;
      this.truck.engineOn = false;
    }
    this.paused = false;
    this.ui.toast('Вы отдохнули 9 часов', 'good');
    this.saveNow();
    this.ui.renderGarage();
  }

  buyTruckDialog(model) {
    const current = TRUCK_MODELS.find((m) => m.id === this.profile.truck.modelId) || TRUCK_MODELS[0];
    const tradeIn = Math.round(current.price * 0.52);
    this.ui.confirmBuyTruck(model, tradeIn);
  }

  buyTruck(modelId) {
    const model = TRUCK_MODELS.find((m) => m.id === modelId);
    if (!model) return;
    if (this.profile.level < model.level) {
      this.ui.toast(`Нужен ${model.level}-й уровень`, 'bad');
      return;
    }
    const current = TRUCK_MODELS.find((m) => m.id === this.profile.truck.modelId) || TRUCK_MODELS[0];
    const tradeIn = Math.round(current.price * 0.52);
    const price = Math.max(0, model.price - tradeIn);
    if (this.profile.money < price) {
      this.ui.toast('Недостаточно денег', 'bad');
      return;
    }
    this.profile.money -= price;
    this.profile.owned = this.profile.owned || [];
    this.profile.owned.push({ ...this.profile.truck });
    this.profile.truck = {
      modelId: model.id,
      paint: this.profile.truck.paint,
      engine: 0,
      tires: 0,
      retarder: model.hp > 500 ? 1 : 0,
      condition: { engine: 100, tires: 100, brakes: 100 },
      odometer: 0,
      fuel: model.tank,
    };
    this.profile.stats.deliveries = this.profile.stats.deliveries;
    this.audio.cash();
    this.ui.toast('Куплен ' + model.name, 'good', 4200);
    this.checkAchievements({ purchased: true });
    this.ui.closeModal();
    this.ui.renderGarage();
    this.saveNow();
  }

  sellTruckDialog() {
    const owned = this.profile.owned || [];
    if (!owned.length) {
      this.ui.openModal({
        eyebrow: 'ГАРАЖ',
        title: 'Продажа тягача',
        body: '<p>Нельзя продать единственный тягач — он нужен для работы. Купите второй в автосалоне, чтобы освободить этот.</p>',
        actions: [{ label: 'Понятно', primary: true, act: 'close' }],
      });
      return;
    }
    const model = TRUCK_MODELS.find((m) => m.id === this.profile.truck.modelId) || TRUCK_MODELS[0];
    const price = Math.round(model.price * 0.52);
    this.ui.openModal({
      eyebrow: 'ГАРАЖ',
      title: 'Продать ' + model.name,
      body: `<p>Вы продадите текущий тягач и пересядете на предыдущий из гаража.</p>
        <div class="field-row"><label>Выручка</label><b style="color:var(--green)">${fmtMoney(price)}</b></div>`,
      actions: [
        { label: 'Отмена', act: 'close' },
        { label: 'Продать', primary: true, act: 'sell-confirm' },
      ],
    });
    const btn = $('modal-foot').querySelector('[data-act="sell-confirm"]');
    if (btn)
      btn.addEventListener('click', () => {
        this.profile.money += price;
        this.profile.truck = this.profile.owned.pop();
        this.ui.closeModal();
        this.ui.renderGarage();
        this.saveNow();
        this.ui.toast('Тягач продан', 'good');
      });
  }

  setPaint(id) {
    this.profile.truck.paint = id;
    const paint = PAINT_COLORS.find((c) => c.id === id);
    if (paint) this.truckView.setPaint(paint.hex);
    this.ui.renderGarage();
    this.saveNow();
  }

  buyUpgrade(kind, id) {
    const list = UPGRADES[kind];
    if (!list) return;
    const item = list[id];
    if (!item) return;
    if (this.profile.truck[kind] >= id) return;
    if (this.profile.money < item.price) {
      this.ui.toast('Недостаточно денег', 'bad');
      return;
    }
    this.profile.money -= item.price;
    this.profile.truck[kind] = id;
    this.audio.cash();
    this.ui.toast('Установлено: ' + item.name, 'good');
    this.ui.renderGarage();
    this.saveNow();
  }

  selectTruck(id) {
    void id;
  }

  takeOwnedTruck(index) {
    const owned = this.profile.owned || [];
    const truck = owned[index];
    if (!truck) return;
    owned[index] = this.profile.truck;
    this.profile.truck = truck;
    this.ui.renderGarage();
    this.saveNow();
    this.ui.toast('Вы пересели на другой тягач', 'good');
  }

  buyGarage(cityId) {
    const city = CITY_BY_ID.get(cityId);
    const price = 24000 + (city?.size || 1) * 12000;
    if (this.profile.money < price) {
      this.ui.toast('Недостаточно денег', 'bad');
      return;
    }
    this.profile.money -= price;
    this.profile.garages.push(cityId);
    this.checkAchievements({ garage: true });
    this.audio.cash();
    this.ui.toast('Гараж куплен в ' + city.name, 'good');
    this.ui.renderGarage();
    this.saveNow();
  }

  hireDriverDialog() {
    const cost = 12000;
    if (this.profile.money < cost) {
      this.ui.toast('Нужно 12 000 €', 'bad');
      return;
    }
    if (!this.profile.garages.length) {
      this.ui.toast('Сначала купите гараж', 'info');
      return;
    }
    const names = ['Алексей', 'Марек', 'Лукас', 'Петер', 'Иржи', 'Матео', 'Оле', 'Юрген', 'Томаш', 'Анри', 'Дитер', 'Свен', 'Марко', 'Павел', 'Нильс'];
    const name = names[Math.floor(Math.random() * names.length)] + ' ' + String.fromCharCode(65 + Math.floor(Math.random() * 26)) + '.';
    this.profile.money -= cost;
    this.profile.drivers.push({
      id: 'd' + Date.now().toString(36),
      name,
      city: this.profile.garages[Math.floor(Math.random() * this.profile.garages.length)],
      rate: 220 + Math.round(Math.random() * 180),
      exp: Math.floor(Math.random() * 30),
      earned: 0,
      hired: this.currentMinutes(),
    });
    this.checkAchievements({ driver: true });
    this.audio.cash();
    this.ui.toast('Нанят водитель: ' + name, 'good');
    this.ui.renderGarage();
    this.saveNow();
  }

  fireDriver(id) {
    this.profile.drivers = this.profile.drivers.filter((d) => d.id !== id);
    this.ui.renderGarage();
    this.saveNow();
  }

  buySkill(skill) {
    const meta = SKILLS.find((s) => s.id === skill);
    if (!meta) return;
    const level = this.profile.skills[skill] || 0;
    const cost = skillPrice(this.profile, skill);
    if (level >= 5) return;
    if (this.profile.money < cost) {
      this.ui.toast('Недостаточно денег', 'bad');
      return;
    }
    this.profile.money -= cost;
    this.profile.skills[skill] = level + 1;
    this.audio.cash();
    this.ui.toast(`${meta.name}: уровень ${level + 1}`, 'good');
    this.refreshOffers(true);
    this.ui.renderGarage();
    this.saveNow();
  }

  setSetting(key, value) {
    this.settings[key] = value;
    saveSettings(this.settings);
    if (key === 'sound') this.audio.setEnabled(!!value);
    if (key === 'volume') this.audio.setVolume(Number(value));
    if (key === 'quality' || key === 'touchControls') this.applyDeviceSettings();
    if (this.state !== 'garage' && !$('modal-root').classList.contains('hidden')) this.ui.showSettings(true);
    if (key === 'camera') {
      this.cameraUserSet = true;
      this.cameraMode = CAMERA_MODES.includes(value) ? value : 'interior';
    }
    this.ui.renderGarage();
  }

  resetSettings() {
    this.settings = { ...DEFAULT_SETTINGS };
    this.cameraMode = 'interior';
    saveSettings(this.settings);
    this.audio.setEnabled(this.settings.sound);
    this.audio.setVolume(this.settings.volume);
    this.ui.renderGarage();
    this.ui.toast('Настройки сброшены', 'info');
  }

  resetDialog() {
    this.ui.openModal({
      eyebrow: 'ОПАСНО',
      title: 'Удалить карьеру?',
      body: '<p>Весь прогресс в текущем слоте будет удалён безвозвратно: деньги, грузовики, водители и достижения.</p>',
      actions: [
        { label: 'Отмена', act: 'close' },
        {
          label: 'Удалить навсегда',
          danger: true,
          act: 'reset-confirm',
        },
      ],
    });
    const btn = $('modal-foot').querySelector('[data-act="reset-confirm"]');
    if (btn)
      btn.addEventListener('click', () => {
        this.saves.slots[this.slot] = null;
        saveGame(this.saves.slots, this.saves.lastSlot);
        this.profile = null;
        this.ui.closeModal();
        this.returnToMenu();
        this.ui.toast('Карьера удалена', 'info');
      });
  }

  // ---------------------------------------------------------------- Пауза
  togglePause() {
    if (this.state !== 'driving') return;
    this.paused = !this.paused;
    if (this.paused) {
      this.ui.openModal({
        eyebrow: 'ПАУЗА',
        title: this.job ? `${this.job.fromName} → ${this.job.toName}` : 'Пауза',
        body: `<p>${this.job ? `${this.job.cargo} · ${this.job.mass} т · осталось ${this.fmtDistanceShort(Math.abs(this.remainingMeters()))}` : ''}</p>
          <div class="field-row"><label>Игровое время</label><b>${fmtTime(this.clock.minutes)} · день ${this.clock.day}</b></div>
          <div class="field-row"><label>До срока</label><b>${this.job ? fmtDuration(Math.max(0, this.job.deadlineMin - this.jobElapsed())) : '—'}</b></div>
          <div class="field-row"><label>Заработано за рейс</label><b>${this.job ? fmtMoney(this.job.pay) : '—'}</b></div>
          <h4>Управление</h4>
          <p style="font-size:12px;line-height:1.8">W/S — газ и тормоз · A/D — руль · E — взаимодействие · C — круиз · M — режим КПП · V — камера · L — фары · H — сигнал · P — снимок · F — двигатель</p>`,
        actions: [
          { label: 'Продолжить', primary: true, act: 'resume' },
          { label: 'Сохранить', act: 'save' },
          { label: 'Покинуть рейс', danger: true, act: 'quit-to-garage' },
        ],
      });
      const foot = $('modal-foot');
      foot.querySelector('[data-act="resume"]')?.addEventListener('click', () => {
        this.paused = false;
        this.ui.closeModal();
      });
      foot.querySelector('[data-act="save"]')?.addEventListener('click', () => {
        this.syncProfileFromTruck();
        this.saveNow();
        this.ui.toast('Сохранено', 'good');
      });
      foot.querySelector('[data-act="quit-to-garage"]')?.addEventListener('click', () => {
        this.syncProfileFromTruck();
        this.saveNow();
        this.paused = false;
        this.ui.closeModal();
        this.disposeWorld();
        this.enterGarage();
      });
    } else {
      this.ui.closeModal();
    }
    this.syncProfileFromTruck();
    this.saveNow(true);
  }

  offerFuelHelp() {
    this.paused = true;
    this.fuelPause = true;
    this.ui.openModal({
      eyebrow: 'ТЕХПОМОЩЬ',
      title: 'Топливо закончилось',
      body: `<p>Бак пуст. Можно вызвать передвижную заправку: 60 литров с доставкой.</p>
        <div class="field-row"><label>Стоимость</label><b>${fmtMoney(320)}</b></div>
        <div class="field-row"><label>В кошельке</label><b>${fmtMoney(this.profile.money)}</b></div>`,
      actions: [
        { label: 'Ждать', act: 'close' },
        { label: 'Вызвать техпомощь', primary: true, act: 'fuel-help' },
      ],
    });
    const btn = $('modal-foot').querySelector('[data-act="fuel-help"]');
    if (btn)
      btn.addEventListener('click', () => {
        if (this.profile.money < 320) {
          this.ui.toast('Недостаточно денег', 'bad');
          return;
        }
        this.profile.money -= 320;
        this.truck.fuel = Math.min(this.truck.fuelCapacity, this.truck.fuel + 60);
        this.truck.engineOn = true;
        this.profile.truck.fuel = this.truck.fuel;
        this.paused = false;
        this.fuelPause = false;
        this.ui.closeModal();
        this.ui.toast('Техпомощь привезла 60 л топлива', 'good');
        this.saveNow();
      });
  }

  onModalClosed() {
    if (this.fuelPause) {
      this.fuelPause = false;
      this.paused = false;
    }
  }

  takeScreenshot() {
    try {
      const url = this.renderer.domElement.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = `eurotrak-${Date.now()}.png`;
      a.click();
      this.ui.toast('Снимок сохранён', 'good');
    } catch {
      this.ui.toast('Не удалось сделать снимок', 'bad');
    }
  }

  // ---------------------------------------------------------------- Служебное
  syncProfileFromTruck() {
    if (!this.truck || !this.profile) return;
    this.profile.truck.fuel = this.truck.fuel;
    this.profile.truck.odometer = this.truck.odometer;
    this.profile.truck.condition = {
      engine: this.truck.engine,
      tires: this.truck.tires,
      brakes: this.truck.brakes,
    };
    this.profile.clock = { day: this.clock.day, minutes: this.clock.minutes };
    if (this.job && this.job.id && this.job.free !== true && this.route) {
      this.job.distance = Math.round(this.route.km * 10) / 10;
      this.job.playerS = this.truck.s;
      this.job.phase = this.phase;
      this.job.cargoDamage = this.cargoDamage || 0;
      this.profile.activeJob = { ...this.job };
    }
  }

  saveNow(silent = false) {
    if (!this.profile) return;
    this.profile.clock = { day: this.clock.day, minutes: this.clock.minutes };
    this.profile.level = levelForXp(this.profile.xp || 0).level;
    this.profile.lastPlayed = Date.now();
    this.saves.slots[this.slot] = JSON.parse(JSON.stringify(this.profile));
    this.saves.lastSlot = this.slot;
    const ok = saveGame(this.saves.slots, this.saves.lastSlot);
    this.refreshSaveInfo();
    if (!ok && !silent) this.ui.toast('Не удалось сохранить (localStorage недоступен)', 'bad', 4200);
  }

  checkAchievements(ctx = {}) {
    const p = this.profile;
    if (!p) return;
    const unlock = (id) => {
      if (p.achievements.includes(id)) return;
      p.achievements.push(id);
      const a = ACHIEVEMENTS.find((x) => x.id === id);
      if (a) this.ui.toast(`Достижение: ${a.icon} ${a.name}`, 'good', 5000);
      this.audio.cash();
    };
    if (p.stats.deliveries >= 1) unlock('first');
    if (p.stats.deliveries >= 10) unlock('ten');
    if (p.stats.deliveries >= 50) unlock('fifty');
    if (p.stats.distance >= 1000) unlock('km1000');
    if (p.stats.distance >= 10000) unlock('km10000');
    if (p.money >= 100000) unlock('rich');
    if (ctx.damage !== undefined && ctx.damage < 1 && ctx.job && !ctx.job.free) unlock('clean');
    if (this.nightDistance >= 50000) unlock('night');
    if (ctx.job && !ctx.job.free && ctx.job.distance > 400) unlock('longhaul');
    if (ctx.job && ctx.job.adr) unlock('adr');
    if (ctx.purchased) unlock('dealer');
    if (ctx.garage) unlock('garage');
    if (ctx.driver) unlock('driver');
    if (levelForXp(p.xp).level >= 10) unlock('level10');
    if (this.lightsOn && this.nightDistance > 20000) unlock('nightride');
    this.network = this.network;
  }

  cityPos(id) {
    return CITY_BY_ID.get(id) ? this._cityWorld(id) : { x: 0, z: 0 };
  }

  _cityWorld(id) {
    const c = CITY_BY_ID.get(id);
    const scale = 0.1;
    const kx = 111320 * Math.cos((50 * Math.PI) / 180) * scale;
    const kz = 110540 * scale;
    return { x: (c.lon - 10) * kx, z: -(c.lat - 50) * kz };
  }

  disposeWorld() {
    if (this.road) {
      this.road.dispose();
      this.road = null;
    }
    if (this.traffic) {
      this.traffic.dispose();
      this.traffic = null;
    }
    this.truck = null;
    this.route = null;
    this.job = null;
    this.work = null;
  }
}

const game = new Game();
window.__game = game;
// Отладочный доступ к THREE (только с ?debug в адресе): удобно стрелять рейкастом
// из консоли браузера, когда нужно понять, что это за артефакт в кадре.
if (typeof location !== 'undefined' && location.search.includes('debug')) window.__THREE = THREE;
// Отладочный доступ к three для оффлайн-скриншотов и диагностики.
window.__THREE = THREE;
window.__eurotrakSave = () => {
  game.syncProfileFromTruck();
  game.saveNow();
  game.ui.toast('Сохранено', 'good');
};
