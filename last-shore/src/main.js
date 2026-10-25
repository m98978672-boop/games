// ============================================================
//  LAST SHORE — точка входа: игровой цикл, состояние, ввод, HUD.
// ============================================================

import * as THREE from 'three';
import { CONFIG } from './config.js';
import { World } from './world.js';
import { Sky } from './sky.js';
import { Player } from './player.js';
import { Audio } from './audio.js';
import { UI } from './ui.js';
import { Rain } from './effects.js';
import { ITEMS, HOTBAR_SIZE, BAG_ORDER, RECIPES } from './items.js';
import { Resources, NODE_DEFS } from './nodes.js';
import { Mobs } from './mobs.js';
import { VisibilityCuller } from './visibility.js';
import { BUILD, probeWebGL, collectDiag, wantsSafeMode } from './diag.js';
import { createTextures } from './textures.js';

const SAVE_KEY = 'lastshore.save.v1';

function emptyInventory() {
  const inv = {};
  for (const id of Object.keys(ITEMS)) inv[id] = 0;
  return inv;
}

/** Хотбар из сохранения: ровно 10 слотов, только известные предметы */
function normalizeHotbar(raw) {
  const out = new Array(HOTBAR_SIZE).fill(null);
  if (!Array.isArray(raw)) return out;
  raw.slice(0, HOTBAR_SIZE).forEach((id, i) => {
    if (id && ITEMS[id]) out[i] = id;
  });
  return out;
}

const WEATHERS = {
  clear: { label: 'ясно', rain: 0, sun: 1.0, fog: 1.0, next: { clear: 0.45, cloudy: 0.4, rain: 0.15 } },
  cloudy: { label: 'облачно', rain: 0, sun: 0.68, fog: 1.25, next: { clear: 0.35, cloudy: 0.35, rain: 0.3 } },
  rain: { label: 'дождь', rain: 0.85, sun: 0.4, fog: 1.7, next: { cloudy: 0.55, rain: 0.3, storm: 0.15 } },
  storm: { label: 'гроза', rain: 1, sun: 0.26, fog: 2.1, next: { rain: 0.6, cloudy: 0.4 } },
};

class Game {
  constructor() {
    this.canvas = document.getElementById('scene');
    this.ui = new UI(ITEMS, HOTBAR_SIZE, BAG_ORDER);
    this.ui.onAssign = (id, slot) => this.assignHotbar(id, slot);
    this.ui.onClear = (slot) => this.clearHotbar(slot);
    this.ui.onClickItem = (id) => this.assignHotbarFirst(id);

    this.audio = new Audio();

    // Пытаемся создать контекст по трём ступеням: от красивого к «хоть как-нибудь»
    const safe = wantsSafeMode();
    this.quality = safe ? 2 : 0;
    const attempts = [
      { antialias: true, powerPreference: 'high-performance', shadows: true, label: 'высокое' },
      { antialias: false, powerPreference: 'default', shadows: true, label: 'обычное' },
      { antialias: false, powerPreference: 'default', shadows: false, label: 'лёгкое' },
    ];

    let lastError = null;
    for (let i = this.quality; i < attempts.length; i++) {
      const attempt = attempts[i];
      try {
        this.renderer = new THREE.WebGLRenderer({
          canvas: this.canvas,
          antialias: attempt.antialias,
          powerPreference: attempt.powerPreference,
          failIfMajorPerformanceCaveat: false,
          alpha: false,
        });
        if (!this.renderer || !this.renderer.getContext()) throw new Error('контекст не создан');
        this.quality = i;
        this.qualityLabel = attempt.label;
        this.useShadows = attempt.shadows;
        break;
      } catch (err) {
        lastError = err;
        this.renderer = null;
      }
    }

    if (!this.renderer) {
      const gl = probeWebGL();
      this.ui.showScreen('nogl');
      const reason = document.getElementById('nogl-reason');
      if (reason) {
        reason.textContent = gl.reason
          ? `${gl.reason}. ${gl.error || ''}`
          : `Не удалось создать 3D-контекст: ${lastError?.message || 'неизвестная ошибка'}`;
      }
      const err = lastError || new Error('WebGL недоступен');
      err.handled = true;               // панель «нет WebGL» уже показана
      throw err;
    }

    this.renderer.setPixelRatio(this.quality >= 2 ? 1 : Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = this.useShadows !== false;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.setClearColor(0x9fc3d6, 1);

    // потеря WebGL-контекста (редко, но бывает на слабых GPU) — говорим об этом
    this.canvas.addEventListener('webglcontextlost', (e) => {
      e.preventDefault();
      if (!this._contextLostShown) {
        this._contextLostShown = true;
        this.ui.toast('Видеокарта отключила 3D. Перезагрузи страницу.', true);
        showFatal(new Error('WebGL context lost'), 'видеокарта');
      }
    });
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(64, window.innerWidth / window.innerHeight, 0.25, 1400);

    const maxAniso = this.renderer.capabilities ? this.renderer.capabilities.getMaxAnisotropy() : 4;
    this.textures = createTextures(Math.min(8, maxAniso || 4));
    this.world = new World(this.scene, CONFIG.world.seed, this.textures);
    this.sky = new Sky(this.scene, this.renderer, this.textures);
    this.player = new Player(this.scene);
    this.rain = new Rain(this.scene);
    this.resources = new Resources(this.scene, this.world);
    this.mobs = new Mobs(this.scene, this.world, CONFIG.world.seed);
    this.projectiles = [];
    this.chips = [];            // щепки, крошка и ягоды — короткие частицы

    // всё, что может быть спрятано за деревом/камнем/кустом
    this.culler = new VisibilityCuller(this.world, this.camera);
    for (const mob of this.mobs.list) {
      this.culler.track(mob.group, {
        radius: mob.def.radius + 0.6,
        height: mob.def.hitbox.h,
        getPos: () => ({ x: mob.x, y: mob.y || 0, z: mob.z }),
      });
    }
    this.trackedPickups = new Set();
    this.syncCuller();

    this.state = {
      health: 100,
      thirst: 78,
      hunger: 72,
      warmth: 100,
      inventory: emptyInventory(),
      hotbar: new Array(HOTBAR_SIZE).fill(null),   // игрок заполняет сам
      collected: 0,
    };
    this.selected = 0;
    this.view = 'third';
    this.attackCooldown = 0;
    this.holdingAttack = false;
    this.nearNode = null;
    this.target = null;

    this.weather = 'clear';
    this.weatherTimer = 2.5;      // в игровых часах до смены погоды
    this.rainIntensity = 0;
    this.weatherSunMul = 1;
    this.weatherFogMul = 1;

    this.input = { forward: false, back: false, left: false, right: false, sprint: false, jump: false };
    this.nearest = null;

    this.running = false;
    this.paused = false;
    this.dead = false;
    this.locked = false;
    this.dragging = false;
    this.dragLook = false;

    this.debugArmed = false;       // F3 нажат — следующий F переключит хитбоксы
    this.frameIndex = 0;
    this.panelUnlock = false;      // курсор отпущен ради панели, а не паузы
    this.slowFrames = 0;
    this.slowTimer = 0;
    this.lastTime = performance.now();
    this.fpsAccum = 0;
    this.fpsFrames = 0;
    this.fpsValue = 60;
    this.saveTimer = 0;

    this.spawnPlayer();
    this.buildHighlight();
    this.bindEvents();

    this.refreshHotbar();
    this.ui.renderBag(this.state.inventory, this.state.hotbar);

    this.renderer.setAnimationLoop(() => this.frame());
  }

  // ------------------------------------------------------------
  //  Старт
  // ------------------------------------------------------------

  spawnPlayer() {
    const world = this.world;
    const half = CONFIG.world.size / 2;

    // 1) ищем пологий пляж с видом на воду и без деревьев вплотную
    const candidates = [];
    for (let i = 0; i < 2400; i++) {
      const angle = (i / 2400) * Math.PI * 2;
      for (let r = half * 1.02; r > half * 0.35; r -= 2) {
        const x = Math.cos(angle) * r;
        const z = Math.sin(angle) * r;
        const h = world.heightAt(x, z);
        if (h < 0.8 || h > 2.6) continue;
        if (world.slopeAt(x, z) > 0.42) continue;

        // куда смотрит море: ищем воду в 12-30 м
        let seaX = 0;
        let seaZ = 0;
        let seaDist = 999;
        for (let a = 0; a < Math.PI * 2; a += Math.PI / 8) {
          for (let d = 10; d < 34; d += 3) {
            const hx = x + Math.cos(a) * d;
            const hz = z + Math.sin(a) * d;
            if (world.heightAt(hx, hz) < -0.5) {
              if (d < seaDist) { seaDist = d; seaX = Math.cos(a); seaZ = Math.sin(a); }
              break;
            }
          }
        }
        if (seaDist > 30) continue;

        // свободная площадка: 6 м без стволов
        let clear = true;
        for (const c of world.colliders) {
          const dx = c.x - x;
          const dz = c.z - z;
          if (dx * dx + dz * dz < 36) { clear = false; break; }
        }
        // площадь пляжа — не крошечный пятачок
        let sand = 0;
        for (let a = 0; a < Math.PI * 2; a += Math.PI / 6) {
          const hh = world.heightAt(x + Math.cos(a) * 5, z + Math.sin(a) * 5);
          if (hh > 0.5 && hh < 4) sand++;
        }

        candidates.push({ x, z, seaX, seaZ, seaDist, clear, sand, h });
        break;
      }
    }

    let best = null;
    let bestScore = -Infinity;
    for (const c of candidates) {
      const score = (c.clear ? 6 : 0) + c.sand * 0.8 + (30 - Math.abs(c.seaDist - 18)) * 0.2;
      if (score > bestScore) { bestScore = score; best = c; }
    }

    if (!best) {
      for (let i = 0; i < 6000 && !best; i++) {
        const x = (Math.random() - 0.5) * CONFIG.world.size * 0.7;
        const z = (Math.random() - 0.5) * CONFIG.world.size * 0.7;
        const h = world.heightAt(x, z);
        if (h > 0.8 && h < 3.4 && world.slopeAt(x, z) < 0.55) best = { x, z, seaX: -x, seaZ: -z };
      }
    }
    if (!best) best = { x: 4, z: 40, seaX: 0, seaZ: 1 };

    this.player.setPosition(best.x, best.z, world);
    this.world.spawnStarterKit(this.player.position);
    this.player.yaw = Math.atan2(-best.seaX, -best.seaZ);
    this.player.facing = this.player.yaw + Math.PI;
    this.player.applyCamera(this.camera, world, 1);
    this.spawnPoint = { x: best.x, z: best.z };
    console.log(`[LAST SHORE] высадка: ${best.x.toFixed(1)}, ${best.z.toFixed(1)} · море в ${best.seaDist | 0} м · пляж ${best.sand}/12`);
  }

  buildHighlight() {
    const geo = new THREE.RingGeometry(0.32, 0.44, 24);
    geo.rotateX(-Math.PI / 2);
    this.highlight = new THREE.Mesh(
      geo,
      new THREE.MeshBasicMaterial({ color: 0xf0c069, transparent: true, opacity: 0.85, depthWrite: false })
    );
    this.highlight.visible = false;
    this.highlight.renderOrder = 3;
    this.scene.add(this.highlight);
  }

  // ------------------------------------------------------------
  //  Ввод
  // ------------------------------------------------------------

  bindEvents() {
    window.addEventListener('resize', () => this.onResize());

    this.ui.bindHotbar(
      (index) => this.selectSlot(index),
      () => this.useSelected()
    );

    window.addEventListener('keydown', (e) => this.onKeyDown(e));
    window.addEventListener('keyup', (e) => this.onKeyUp(e));

    this.canvas.addEventListener('mousedown', (e) => {
      if (!this.running || this.paused) return;
      if (this.ui.isPanelOpen()) return;     // панель открыта — клики по ней, а не по миру
      if (!this.locked) {
        this.dragging = true;
        this.tryLock();
      }
      if (e.button === 0) {
        this.audio.resume();
        this.holdingAttack = true;
        this.attack();
      } else if (e.button === 2) {
        this.useSelected();
      }
    });
    window.addEventListener('mouseup', () => { this.dragging = false; this.holdingAttack = false; });

    window.addEventListener('mousemove', (e) => {
      if (!this.running || this.paused) return;
      if (this.locked || this.dragging) {
        this.player.look(e.movementX || 0, e.movementY || 0);
      }
    });

    window.addEventListener('wheel', (e) => {
      if (!this.running || this.paused) return;
      if (e.shiftKey) {
        const dist = CONFIG.player.cameraDistance + e.deltaY * 0.004;
        CONFIG.player.cameraDistance = Math.max(2.2, Math.min(12, dist));
        return;
      }
      const step = e.deltaY > 0 ? 1 : -1;
      const next = (this.selected + step + HOTBAR_SIZE) % HOTBAR_SIZE;
      this.selectSlot(next);
    }, { passive: true });

    document.addEventListener('pointerlockchange', () => {
      const wasLocked = this.locked;
      this.locked = document.pointerLockElement === this.canvas;

      // курсор отпустили специально, чтобы кликать по крафту/сумке
      if (!this.locked && this.panelUnlock) {
        this.panelUnlock = false;
        return;
      }
      if (wasLocked && !this.locked && this.running && !this.paused && !this.dead) {
        this.pause();
      }
    });
    document.addEventListener('pointerlockerror', () => {
      this.dragLook = true;
    });

    // Сворачивание вкладки — пауза и сохранение.
    // (blur специально не слушаем: внутри iframe он срабатывает ложно и «ломает» игру.)
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) return;
      if (this.running && !this.paused && !this.dead) this.pause();
      this.save();
    });

    window.addEventListener('beforeunload', () => this.save());
  }

  tryLock() {
    if (this.dragLook) return;
    try {
      const p = this.canvas.requestPointerLock?.();
      if (p && typeof p.catch === 'function') p.catch(() => this.fallbackLook());
    } catch (err) {
      this.fallbackLook();
      return;
    }
    // некоторые браузеры просто игнорируют запрос (например, в iframe)
    setTimeout(() => {
      if (!this.locked && this.running && !this.paused) this.fallbackLook();
    }, 700);
  }

  fallbackLook() {
    if (this.dragLook) return;
    this.dragLook = true;
    this.ui.toast('Обзор: зажми левую кнопку мыши и веди');
  }

  onKeyDown(e) {
    if (e.repeat) return;
    const code = e.code;

    if (code === 'Escape') {
      if (this.ui.isPanelOpen()) {
        this.ui.closePanels();
        this.relock();
        return;
      }
      if (this.running && !this.paused) this.pause();
      return;
    }

    if (!this.running || this.paused) return;

    switch (code) {
      case 'KeyW': case 'ArrowUp': this.input.forward = true; break;
      case 'KeyS': case 'ArrowDown': this.input.back = true; break;
      case 'KeyA': case 'ArrowLeft': this.input.left = true; break;
      case 'KeyD': case 'ArrowRight': this.input.right = true; break;
      case 'ShiftLeft': case 'ShiftRight': this.input.sprint = true; break;
      case 'Space': this.input.jump = true; e.preventDefault(); break;
      case 'KeyE': this.interact(); break;
      case 'KeyF':
        if (this.debugArmed) {
          this.debugArmed = false;
          const on = this.mobs.toggleHitboxes();
          this.ui.toast(on ? 'Хитбоксы включены (F3 → F)' : 'Хитбоксы выключены');
          this.audio.uiClick();
        } else {
          this.placeCampfire();
        }
        break;
      case 'F3':
        e.preventDefault();
        this.debugArmed = true;
        this.ui.toast('Отладка: нажми F — показать хитбоксы зверей');
        break;
      case 'KeyV': this.toggleView(); break;
      case 'F1': e.preventDefault(); this.showDiag(); break;
      case 'KeyC': {
        e.preventDefault();
        this.togglePanel('craft');
        break;
      }
      case 'KeyI': case 'Tab':
        e.preventDefault();
        this.togglePanel('bag');
        break;
      case 'Digit1': case 'Digit2': case 'Digit3': case 'Digit4': case 'Digit5':
      case 'Digit6': case 'Digit7': case 'Digit8': case 'Digit9': case 'Digit0': {
        const digit = Number(code.replace('Digit', ''));
        const n = digit === 0 ? 9 : digit - 1;
        this.selectSlot(n);
        this.useSelected();
        break;
      }
    }
  }

  onKeyUp(e) {
    switch (e.code) {
      case 'KeyW': case 'ArrowUp': this.input.forward = false; break;
      case 'KeyS': case 'ArrowDown': this.input.back = false; break;
      case 'KeyA': case 'ArrowLeft': this.input.left = false; break;
      case 'KeyD': case 'ArrowRight': this.input.right = false; break;
      case 'ShiftLeft': case 'ShiftRight': this.input.sprint = false; break;
    }
  }

  onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  // ------------------------------------------------------------
  //  Состояния игры
  // ------------------------------------------------------------

  start(continueSave = false) {
    try {
      this.audio.init();
      this.audio.resume();
    } catch (err) {
      console.warn('audio disabled:', err);
    }

    if (continueSave) this.loadGame();

    this.ui.hideScreens();
    this.ui.setBars(this.readBars());
    this.ui.renderBag(this.state.inventory, this.state.hotbar);
    this.refreshHotbar();
    this.player.setEquipped(this.equippedId());
    this.running = true;
    this.paused = false;
    this.dead = false;
    this.startedAt = performance.now();
    this.lastTime = performance.now();
    this.tryLock();
    this.audio.uiClick();
  }

  pause() {
    if (!this.running || this.dead) return;
    this.paused = true;
    this.save();
    const days = this.sky.day;
    const mins = Math.floor((performance.now() - (this.startedAt || performance.now())) / 60000);
    this.ui.setPauseStats(`День ${days} · в игре ${mins} мин · собрано ${this.state.collected} предметов`);
    this.ui.showScreen('pause');
    if (document.pointerLockElement) document.exitPointerLock();
    this.dragging = false;
  }

  resume() {
    this.paused = false;
    this.ui.hideScreens();
    this.lastTime = performance.now();
    this.tryLock();
    this.audio.resume();
  }

  nodeDef(node) {
    return NODE_DEFS[node.type] || { label: 'Объект', need: null };
  }

  readBars() {
    return {
      health: this.state.health,
      thirst: this.state.thirst,
      hunger: this.state.hunger,
      warmth: this.state.warmth,
      stamina: this.player.stamina,
    };
  }

  // ------------------------------------------------------------
  //  Действия
  // ------------------------------------------------------------

  equippedId() {
    const id = this.state.hotbar[this.selected];
    if (!id) return null;
    const item = ITEMS[id];
    if (item.kind === 'tool' || item.kind === 'placeable') {
      return (this.state.inventory[id] || 0) > 0 ? id : null;
    }
    return null;
  }

  equippedTool() {
    const id = this.equippedId();
    return id && ITEMS[id].tool ? ITEMS[id].tool : null;
  }

  selectSlot(index) {
    if (index < 0 || index >= HOTBAR_SIZE) return;
    this.selected = index;
    this.refreshHotbar();
    this.player.setEquipped(this.equippedId());
  }

  /** Перерисовать хотбар и сумку одним движением */
  refreshHotbar() {
    this.ui.setHotbar(this.state.inventory, this.state.hotbar, this.selected);
  }

  refreshBag() {
    this.ui.renderBag(this.state.inventory, this.state.hotbar);
  }

  /** Положить предмет в конкретный слот (перетаскивание из сумки) */
  assignHotbar(id, slot) {
    if (!ITEMS[id] || slot < 0 || slot >= HOTBAR_SIZE) return;
    if ((this.state.inventory[id] || 0) <= 0) {
      this.ui.toast(`${ITEMS[id].name}: в сумке пусто`, true);
      return;
    }
    const prev = this.state.hotbar[slot];
    this.state.hotbar[slot] = id;
    this.refreshHotbar();
    this.refreshBag();
    this.player.setEquipped(this.equippedId());

    if (prev && prev !== id) this.ui.toast(`${ITEMS[prev].name} убран из слота ${slot + 1}`);
    else this.ui.toast(`${ITEMS[id].name} → слот ${slot + 1}`);
    this.audio.uiClick?.();
    this.save();
  }

  /** Убрать предмет из слота (перетащили обратно в сумку) */
  clearHotbar(slot) {
    if (slot < 0 || slot >= HOTBAR_SIZE) return;
    const id = this.state.hotbar[slot];
    if (!id) return;
    this.state.hotbar[slot] = null;
    this.refreshHotbar();
    this.refreshBag();
    this.player.setEquipped(this.equippedId());
    this.ui.toast(`${ITEMS[id].name} убран из слота`);
    this.audio.uiClick?.();
    this.save();
  }

  /** Клик по предмету в сумке — в первый свободный слот */
  assignHotbarFirst(id) {
    const free = this.state.hotbar.indexOf(null);
    if (free < 0) {
      this.ui.toast('Все слоты заняты — перетащи предмет на нужный', true);
      return;
    }
    this.assignHotbar(id, free);
  }

  addItem(id, count = 1) {
    if (!ITEMS[id]) return;
    this.state.inventory[id] = (this.state.inventory[id] || 0) + count;
    this.state.collected += count;
    this.refreshHotbar();
    this.ui.renderBag(this.state.inventory, this.state.hotbar);
    if (this.ui.el.craft && !this.ui.el.craft.classList.contains('hidden')) {
      this.ui._lastCraftSig = '';
      this.ui.renderCraft(RECIPES, this.state.inventory, (rid) => this.craft(rid));
    }
  }

  takeItem(id, count = 1) {
    if ((this.state.inventory[id] || 0) < count) return false;
    this.state.inventory[id] -= count;
    this.refreshHotbar();
    this.ui.renderBag(this.state.inventory, this.state.hotbar);
    this.ui._lastCraftSig = '';
    return true;
  }

  pickup() {
    const p = this.world.nearestPickup(this.player.position, CONFIG.interact.reach + 0.6);
    if (!p) return false;
    this.addItem(p.kind, 1);
    this.world.removePickup(p);
    this.audio.pickup();
    this.ui.toast(`+ ${p.name}`);
    this.highlight.visible = false;
    return true;
  }

  /** E — универсальное действие: подобрать, попить, подложить дров */
  interact() {
    if (!this.running || this.paused || this.dead) return;

    if (this.pickup()) return;

    const target = this.resources.nearest(this.player.position, 4.6);
    if (!target) {
      this.ui.toast('Рядом нечего взять', true);
      return;
    }

    if (target.kind === 'spring') {
      const before = this.state.thirst;
      this.state.thirst = Math.min(100, before + 30);
      this.audio.drink();
      this.ui.toast(before > 99 ? 'Ты не хочешь пить' : 'Родник: +30 жажды');
      return;
    }

    if (target.kind === 'campfire') {
      if ((this.state.inventory.wood || 0) <= 0) {
        this.ui.toast('Нужны палки для костра', true);
        return;
      }
      this.takeItem('wood', 1);
      this.resources.addFuel(target.fire, 45);
      this.audio.eat();
      this.ui.toast(`Костёр: +45 с огня`);
      return;
    }

    if (target.kind === 'node') {
      const node = target.node;
      if (node.type === 'bush' && this.resources.canPickBerries(node)) {
        this.gatherBerries(node);
        return;
      }
      if (node.type === 'bush') {
        this.ui.toast('Ягоды ещё не поспели — подожди немного', true);
        return;
      }
      this.ui.toast('Добывай ударами: зажми левую кнопку мыши', true);
    }
  }

  /** ЛКМ: удар по дереву/камню/кусту или в воздух */
  attack() {
    if (!this.running || this.paused || this.dead) return;
    if (this.attackCooldown > 0) return;

    const toolId = this.equippedId();
    const ranged = toolId && ITEMS[toolId].ranged;

    // что перед нами — от этого зависит и замах, и звук, и частицы
    const mobNear = ranged ? null : this.mobs.nearest(this.player.position, 3.2);
    const target = this.resources.nearest(this.player.position, 3.8);
    const node = !mobNear && target && target.kind === 'node' ? target.node : null;

    let kind = 'attack';
    if (node) {
      kind = node.type === 'rock' ? 'mine' : node.type === 'bush' ? 'chop' : 'chop';
    }

    this.player.swing(kind);
    this.attackCooldown = kind === 'mine' ? 0.7 : kind === 'chop' ? 0.66 : 0.62;

    if (ranged) {
      this.audio.swing?.();
      this.shootArrow();
      return;
    }
    this.audio.swing?.();

    // --- звери ---
    if (mobNear) {
      const facing = this.player.facing;
      const dirX = Math.sin(facing);
      const dirZ = Math.cos(facing);
      const weapon = (this.equippedTool()?.weapon) || 4;
      const mobHit = this.mobs.hit(this.player.position, dirX, dirZ, 3.2, weapon);
      if (mobHit) {
        this.audio.hitFlesh?.();
        this.player.shake(0.18);
        const m = mobHit.mob;
        this.spawnChips(m.x, m.y + 0.9, m.z, { count: 5, color: 0x9c2c3c, size: 0.06, spread: 1.4, up: 1.6 });
        if (mobHit.killed) {
          this.audio.mobDeath?.();
          const drops = [];
          for (const drop of m.def.drops) {
            const n = drop.min + Math.floor(Math.random() * (drop.max - drop.min + 1));
            if (n > 0) {
              this.addItem(drop.id, n);
              drops.push(`${ITEMS[drop.id].name} +${n}`);
            }
          }
          this.ui.toast(`${m.def.label} побеждён: ${drops.join(', ') || 'без добычи'}`);
        } else {
          this.ui.toast(`${m.def.label}: ${Math.max(0, Math.round(m.hp))}/${m.maxHp}`);
        }
        return;
      }
    }

    if (!node) {
      // ударили в пустоту — только шорох воздуха
      this.audio.whoosh?.();
      return;
    }

    // --- ягоды с куста: сначала урожай, потом уже ветки ---
    if (node.type === 'bush' && this.resources.canPickBerries(node)) {
      this.gatherBerries(node);
      this.attackCooldown = 0.6;
      return;
    }

    const tool = this.equippedTool();
    const def = this.resources.strike(node, tool);
    const actionDef = this.nodeDef(node);
    const power = tool && tool[actionDef.tool ?? 'chop'] !== undefined
      ? tool[actionDef.tool ?? 'chop']
      : 0.35;

    if (def.need && (!tool || power < 1)) {
      this.ui.toast(`Нужен ${def.need}: так почти не выходит`, true);
    }

    // попадание: частицы, звук, отдача — у дерева, камня и руды по-разному
    const hitY = node.y + (node.type === 'tree' || node.type === 'palm' ? 1.1 : 0.7);
    if (node.type === 'rock') {
      this.player.shake(0.14);
      this.spawnChips(node.x, hitY, node.z, {
        count: 7,
        color: node.ore ? 0x8fc9d8 : 0x9a958c,
        size: 0.06,
        spread: 1.8,
        up: 2.0,
      });
      if (node.ore) this.audio.oreHit?.(); else this.audio.mine?.();
      this.audio.stoneCrack?.();
    } else {
      this.player.shake(0.08);
      this.spawnChips(node.x, hitY, node.z, { count: 6, color: 0x8a6a42, size: 0.06, spread: 1.5, up: 2.0 });
      this.spawnChips(node.x, hitY + 0.2, node.z, { count: 3, color: 0x5f9150, size: 0.05, spread: 1.2, up: 1.4 });
      this.audio.chop?.();
    }

    if (def.depleted) {
      const parts = [];
      for (const [id, n] of Object.entries(def.drops)) {
        this.addItem(id, n);
        parts.push(`${ITEMS[id].name} +${n}`);
      }
      this.ui.toast(parts.length ? `${node.label} добыт: ${parts.join(', ')}` : `${node.label} пуст`);
      if (node.type === 'tree' || node.type === 'palm') {
        this.audio.treeFall?.();
        this.spawnChips(node.x, hitY + 0.8, node.z, { count: 14, color: 0x5f9150, size: 0.07, spread: 2.4, up: 2.6 });
      } else if (node.type === 'rock') {
        this.audio.stoneBreak?.();
        this.spawnChips(node.x, hitY, node.z, { count: 12, color: node.ore ? 0x9fd8e6 : 0x9a958c, size: 0.07, spread: 2.4, up: 2.4 });
      } else {
        this.audio.rustle?.();
        this.spawnChips(node.x, hitY, node.z, { count: 10, color: 0x6b9c55, size: 0.07, spread: 2.2, up: 2.2 });
      }
      this.audio.pickup();
      if (this.nearNode === node) this.nearNode = null;
    }
  }

  /** Выстрел из лука: стрела летит и бьёт первого зверя на пути */
  /**
   * Короткий выброс частиц: щепки от дерева, крошка от камня, ягоды с куста.
   * Живут меньше секунды и падают вниз — дешёвый, но убедительный отклик.
   */
  spawnChips(x, y, z, { count = 8, color = 0x8a6a42, size = 0.07, spread = 1.6, up = 2.2 } = {}) {
    const geo = new THREE.BoxGeometry(size, size, size);
    for (let i = 0; i < count; i++) {
      const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.9, flatShading: true });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x + (Math.random() - 0.5) * 0.35, y + Math.random() * 0.5, z + (Math.random() - 0.5) * 0.35);
      mesh.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3);
      this.scene.add(mesh);
      this.chips.push({
        mesh,
        vx: (Math.random() - 0.5) * spread,
        vy: up * (0.4 + Math.random() * 0.8),
        vz: (Math.random() - 0.5) * spread,
        spin: (Math.random() - 0.5) * 12,
        life: 0.7 + Math.random() * 0.5,
      });
    }
  }

  updateChips(dt) {
    for (let i = this.chips.length - 1; i >= 0; i--) {
      const c = this.chips[i];
      c.life -= dt;
      if (c.life <= 0) {
        this.scene.remove(c.mesh);
        c.mesh.material.dispose();
        this.chips.splice(i, 1);
        continue;
      }
      c.vy -= 9.5 * dt;
      c.mesh.position.x += c.vx * dt;
      c.mesh.position.y += c.vy * dt;
      c.mesh.position.z += c.vz * dt;
      c.mesh.rotation.x += c.spin * dt;
      c.mesh.rotation.z += c.spin * 0.7 * dt;
      c.mesh.scale.setScalar(Math.min(1, c.life / 0.35));
    }
  }

  /** Собрать ягоды с ближайшего куста (E или удар по кусту) */
  gatherBerries(node) {
    const res = this.resources.pickBerries(node);
    this.player.swing('gather');
    this.audio.berryPick?.();
    this.audio.rustle?.();

    // ягоды осыпаются с куста
    this.spawnChips(node.x, node.y + 0.85, node.z, { count: 7, color: 0xb9334a, size: 0.08, spread: 1.2, up: 1.6 });
    if (res.fiber) this.spawnChips(node.x, node.y + 0.5, node.z, { count: 3, color: 0x8fae5a, size: 0.05, spread: 1.0, up: 1.2 });

    if (res.berries) this.addItem('berries', res.berries);
    if (res.fiber) this.addItem('fiber', res.fiber);

    const parts = [];
    if (res.berries) parts.push(`${ITEMS.berries.name} +${res.berries}`);
    if (res.fiber) parts.push(`${ITEMS.fiber.name} +${res.fiber}`);
    this.ui.toast(parts.length ? `Собрано: ${parts.join(', ')}` : 'Ягод больше нет');
    this.audio.pickup?.();
  }

  /** Выстрел из лука: стрела летит и бьёт первого зверя на пути */
  shootArrow() {
    if ((this.state.inventory.arrows || 0) <= 0) {
      this.ui.toast('Нет стрел: сделай их из палки, кремня и пера', true);
      return;
    }
    this.takeItem('arrows', 1);
    this.audio.bowShot?.();

    const mesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.02, 0.02, 0.7, 4),
      new THREE.MeshStandardMaterial({ color: 0xd8cfbc, roughness: 0.7 })
    );
    const p = this.player.position;
    const facing = this.player.facing;
    const dirX = Math.sin(facing);
    const dirZ = Math.cos(facing);
    const pitch = this.player.pitch || 0;
    mesh.position.set(p.x + dirX * 0.6, p.y + 1.35, p.z + dirZ * 0.6);
    mesh.rotation.set(-pitch - Math.PI / 2, facing, 0);
    this.scene.add(mesh);
    this.projectiles.push({
      mesh,
      vx: dirX * 34,
      vy: 2.5 - pitch * 8,
      vz: dirZ * 34,
      life: 2.2,
    });
  }

  updateProjectiles(dt) {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const a = this.projectiles[i];
      a.life -= dt;
      a.vy -= 9.8 * dt;
      a.mesh.position.x += a.vx * dt;
      a.mesh.position.y += a.vy * dt;
      a.mesh.position.z += a.vz * dt;
      const hitGround = a.mesh.position.y < this.world.heightAt(a.mesh.position.x, a.mesh.position.z) + 0.1;

      const hp = a.mesh.position;
      const strike = this.mobs.hit(hp, a.vx, a.vz, 0.9, 16);
      if (strike) {
        this.audio.hitFlesh?.();
        if (strike.killed) {
          this.audio.mobDeath?.();
          const drops = [];
          for (const drop of strike.mob.def.drops) {
            const n = drop.min + Math.floor(Math.random() * (drop.max - drop.min + 1));
            if (n > 0) {
              this.addItem(drop.id, n);
              drops.push(`${ITEMS[drop.id].name} +${n}`);
            }
          }
          this.ui.toast(`${strike.mob.def.label} побеждён стрелой: ${drops.join(', ') || 'без добычи'}`);
        }
      }
      if (strike || hitGround || a.life <= 0) {
        this.scene.remove(a.mesh);
        a.mesh.geometry.dispose();
        this.projectiles.splice(i, 1);
      }
    }
  }

  craft(recipeId) {
    const recipe = RECIPES.find((r) => r.id === recipeId);
    if (!recipe) return;
    const inv = this.state.inventory;

    if (recipe.needFire && !this.nearFire) {
      this.ui.toast(`${recipe.name}: нужен костёр рядом`, true);
      return;
    }
    for (const [id, need] of Object.entries(recipe.need)) {
      if ((inv[id] || 0) < need) {
        this.ui.toast(`Не хватает: ${ITEMS[id].name}`, true);
        return;
      }
    }
    for (const [id, need] of Object.entries(recipe.need)) this.takeItem(id, need);
    for (const [id, give] of Object.entries(recipe.gives)) this.addItem(id, give);

    this.audio.craft?.();
    this.ui.toast(`Сделано: ${recipe.name}`);
    this.ui._lastCraftSig = '';
    this.ui.renderCraft(RECIPES, inv, (rid) => this.craft(rid));

    // хотбар заполняет игрок сам: подсказываем, что вещь лежит в сумке
    if (ITEMS[recipeId] && !this.state.hotbar.includes(recipeId)) {
      this.ui.toast(`${ITEMS[recipeId].name} — в сумке (I), перетащи в слот`);
    }
  }

  /** F — поставить костёр из набора */
  placeCampfire() {
    if (!this.running || this.paused || this.dead) return;
    if ((this.state.inventory.campfireKit || 0) <= 0) {
      this.ui.toast('Сначала сделай костровое место (C)', true);
      return;
    }
    const p = this.player.position;
    const x = p.x + Math.sin(this.player.facing) * 1.9;
    const z = p.z + Math.cos(this.player.facing) * 1.9;
    const h = this.world.heightAt(x, z);
    if (h < 0.45) {
      this.ui.toast('В воде костёр не поставить', true);
      return;
    }
    this.takeItem('campfireKit', 1);
    const fire = this.resources.addCampfire(x, z);
    this.resources.addFuel(fire, 90);
    this.audio.pickup();
    this.ui.toast('Костёр горит · E — подложить палки');
    if (this.equippedId() === 'campfireKit' && (this.state.inventory.campfireKit || 0) === 0) {
      this.player.setEquipped(null);
    }
  }

  /** Использовать выбранный слот: еда/питьё — съесть, инструмент — просто держим */
  useSelected() {
    const id = this.state.hotbar[this.selected];
    if (!id) {
      this.ui.toast('Слот пуст — открой сумку (I) и перетащи предмет', true);
      return;
    }
    const item = ITEMS[id];
    if (item.kind === 'food') this.consume(id);
    else if (this.equippedId() !== id) this.selectSlot(this.selected);
  }

  consume(kind) {
    if (!this.running || this.paused || this.dead) return;
    const inv = this.state.inventory;
    if ((inv[kind] || 0) <= 0) {
      this.ui.toast(`${ITEMS[kind].name}: нет`, true);
      return;
    }
    const effects = {
      coconut: { thirst: 22, hunger: 6, text: 'Кокос: +22 жажды, +6 еды' },
      berries: { hunger: 12, thirst: 2, text: 'Горсть ягод: +12 еды' },
      cookedMeat: { hunger: 34, thirst: -4, text: 'Жареное мясо: +34 еды' },
      rawMeat: { hunger: 16, thirst: -2, text: 'Сырое мясо: +16 еды, противно' },
      cookedWater: { thirst: 38, hunger: 0, text: 'Кипячёная вода: +38 жажды' },
      driedMeat: { hunger: 26, thirst: -1, text: 'Вяленое мясо: +26 еды' },
      brew: { thirst: 30, hunger: 8, health: 14, text: 'Отвар: +30 жажды и +14 здоровья' },
      bandage: { health: 30, text: 'Перевязал раны: +30 здоровья' },
    };
    const ef = effects[kind];
    if (!ef) return;

    this.takeItem(kind, 1);
    this.state.thirst = Math.max(0, Math.min(100, this.state.thirst + (ef.thirst || 0)));
    this.state.hunger = Math.max(0, Math.min(100, this.state.hunger + (ef.hunger || 0)));
    if (ef.health) {
      this.state.health = Math.max(1, Math.min(100, this.state.health + ef.health));
      this.audio.heal?.();
    }
    if (kind === 'rawMeat' && Math.random() < 0.45) {
      this.state.health = Math.max(1, this.state.health - 6);
      this.ui.toast('Сырое мясо — живот скрутило', true);
    }
    if (ef.thirst > 0) this.audio.drink();
    else this.audio.eat();
    this.ui.toast(ef.text);
  }

  // ------------------------------------------------------------
  //  Погода
  // ------------------------------------------------------------

  updateWeather(dt) {
    const gameHours = (dt / CONFIG.time.dayLength) * 24;
    this.weatherTimer -= gameHours;

    if (this.weatherTimer <= 0) {
      const table = WEATHERS[this.weather].next;
      let roll = Math.random();
      let next = 'clear';
      for (const [key, chance] of Object.entries(table)) {
        if (roll < chance) { next = key; break; }
        roll -= chance;
      }
      this.weather = next;
      this.weatherTimer = 3 + Math.random() * 4;
    }

    const w = WEATHERS[this.weather];
    this.rainIntensity += (w.rain - this.rainIntensity) * Math.min(1, dt * 0.7);
    this.weatherSunMul += (w.sun - this.weatherSunMul) * Math.min(1, dt * 0.5);
    this.weatherFogMul += (w.fog - this.weatherFogMul) * Math.min(1, dt * 0.5);
  }

  // ------------------------------------------------------------
  //  Обновление
  // ------------------------------------------------------------

  update(dt) {
    const state = this.state;

    // --- игрок ---
    this.player.update(dt, this.input, this.world);
    this.input.jump = false;

    // сквозь зверей не пройти: расталкиваем игрока и зверя
    this.mobs.resolvePlayer(this.player.position, this.player.velocity, CONFIG.player.radius);
    this.player.applyCamera(this.camera, this.world, dt);

    // --- небо и погода ---
    this.updateWeather(dt);
    const skyInfo = this.sky.update(dt, this.player.position);
    this.sky.sun.intensity *= this.weatherSunMul;
    this.sky.hemi.intensity *= (0.8 + this.weatherSunMul * 0.25);
    this.scene.fog.far /= this.weatherFogMul;
    this.scene.fog.near /= this.weatherFogMul;
    this.sky.skyUniforms.uTop.value.multiplyScalar(0.75 + this.weatherSunMul * 0.3);
    this.sky.skyUniforms.uBottom.value.multiplyScalar(0.8 + this.weatherSunMul * 0.2);

    this.sky.cloudiness = this.weather === 'clear' ? 0.55 : this.weather === 'cloudy' ? 1.0 : 1.5;
    this.rain.setIntensity(this.rainIntensity);
    this.rain.update(dt, this.player.position);
    this.audio.setNight(skyInfo.night);
    this.audio.updateMusic(dt, skyInfo.night);

    this.world.update(dt, this.camera, skyInfo.sunDir, skyInfo.night, skyInfo.fogColor);

    // --- ресурсы и костры ---
    this.resources.update(dt);

    // --- видимость и звери ---
    if (this.frameIndex % 30 === 0) this.syncCuller();
    this.culler.update(dt);
    this.mobs.update(dt, this.player, {
      audio: this.audio,
      culler: this.culler,
      night: skyInfo.night,
      listener: { x: this.player.position.x, z: this.player.position.z, yaw: this.player.yaw },
      onHit: (dmg, cause) => this.takeDamage(dmg, cause),
      onDrop: (items) => { for (const [id, n] of Object.entries(items)) this.addItem(id, n); },
    });
    this.updateProjectiles(dt);
    this.updateChips(dt);
    this.attackCooldown = Math.max(0, this.attackCooldown - dt);
    if (this.holdingAttack && this.attackCooldown <= 0) this.attack();

    const fireWarm = this.resources.fireWarmth(this.player.position);
    this.nearFire = fireWarm.fire;
    this.audio.updateAmbience(dt, { night: skyInfo.night, fire: fireWarm.warmth > 0 ? fireWarm.warmth : 0 });
    this.ui.setFuel(fireWarm.warmth > 0.05 && fireWarm.fire ? fireWarm.fire : null);

    // --- подсветка цели и подсказка ---
    this.nearest = this.world.nearestPickup(this.player.position, CONFIG.interact.reach + 0.6);
    const nodeTarget = this.resources.nearest(this.player.position, 3.9);
    let marker = null;

    const nearMob = this.mobs.nearest(this.player.position, 6.5);
    if (nearMob && (nearMob.state === 'chase' || nearMob.hp < nearMob.maxHp)) {
      this.ui.setPrompt(
        `<b>ЛКМ</b> — ${nearMob.def.label.toLowerCase()} ` +
        `<span class="prompt-warn">${Math.max(0, Math.round(nearMob.hp))}/${nearMob.maxHp}</span>`
      );
      marker = new THREE.Vector3(nearMob.x, nearMob.y + 0.1, nearMob.z);
    } else if (this.nearest) {
      marker = this.nearest.mesh.position;
      this.ui.setPrompt(`<b>E</b> — подобрать ${this.nearest.name.toLowerCase()}`);
    } else if (nodeTarget && nodeTarget.kind === 'node') {
      const node = nodeTarget.node;
      const def = this.nodeDef(node);
      marker = new THREE.Vector3(node.x, node.y + 0.1, node.z);
      const toolOk = !def.need || this.equippedTool();
      if (node.type === 'bush' && this.resources.canPickBerries(node)) {
        this.ui.setPrompt('<b>E</b> или <b>ЛКМ</b> — собрать ягоды');
      } else {
        this.ui.setPrompt(
          `<b>ЛКМ</b> — ${def.label.toLowerCase()}${def.need ? ` (нужен ${def.need})` : ''}` +
          (toolOk ? '' : ' · <span class="prompt-warn">медленно</span>')
        );
      }
    } else if (nodeTarget && nodeTarget.kind === 'campfire') {
      marker = new THREE.Vector3(nodeTarget.fire.x, nodeTarget.fire.y + 0.1, nodeTarget.fire.z);
      const fuelPct = Math.round((nodeTarget.fire.fuel / nodeTarget.fire.maxFuel) * 100);
      this.ui.setPrompt(`<b>E</b> — подложить палки (огонь ${fuelPct}%)`);
    } else if (nodeTarget && nodeTarget.kind === 'spring') {
      marker = new THREE.Vector3(nodeTarget.spring.x, nodeTarget.spring.y + 0.1, nodeTarget.spring.z);
      this.ui.setPrompt('<b>E</b> — попить из родника');
    } else {
      this.ui.setPrompt(null);
    }

    if (marker) {
      this.highlight.visible = true;
      this.highlight.position.set(marker.x, this.world.heightAt(marker.x, marker.z) + 0.06, marker.z);
      this.highlight.material.opacity = 0.55 + Math.sin(performance.now() * 0.005) * 0.25;
    } else {
      this.highlight.visible = false;
    }

    // --- потребности ---
    const sprinting = this.input.sprint && Math.hypot(this.player.velocity.x, this.player.velocity.z) > 5;
    const moveMul = sprinting ? 1.3 : 1;
    const wetMul = this.rainIntensity > 0.3 ? 1.12 : 1;

    state.thirst = Math.max(0, state.thirst - CONFIG.needs.thirstDrain * moveMul * wetMul * dt);
    state.hunger = Math.max(0, state.hunger - CONFIG.needs.hungerDrain * moveMul * wetMul * dt);

    let warmthTarget = Math.max(26, 100 - skyInfo.night * 42 - this.rainIntensity * 26);
    if (fireWarm.warmth > 0) warmthTarget = Math.max(warmthTarget, 60 + fireWarm.warmth * 45);
    const dw = warmthTarget - state.warmth;
    state.warmth = Math.max(0, Math.min(100, state.warmth + Math.sign(dw) * Math.min(Math.abs(dw), dt * 3.4)));

    // --- здоровье ---
    let cause = null;
    let dmg = 0;
    if (state.thirst <= 0) { dmg += CONFIG.needs.healthDrain * 0.8; cause = 'обезвоживание'; }
    if (state.hunger <= 0) { dmg += CONFIG.needs.healthDrain * 0.6; cause = cause || 'истощение'; }
    if (state.warmth < 12) { dmg += CONFIG.needs.coldDrain * 0.5; cause = cause || 'переохлаждение'; }

    if (dmg > 0) {
      state.health -= dmg * dt;
    } else if (state.thirst > 45 && state.hunger > 45) {
      state.health = Math.min(100, state.health + CONFIG.needs.healthRegen * dt);
    }
    state.health = Math.max(0, Math.min(100, state.health));

    // --- звук шагов ---
    const hspeed = Math.hypot(this.player.velocity.x, this.player.velocity.z);
    if (hspeed > 0.6 && this.player.grounded) {
      this.audio.stepTimer -= dt;
      if (this.audio.stepTimer <= 0) {
        const h = this.world.heightAt(this.player.position.x, this.player.position.z);
        const surface = h < 0.05 ? 'water' : h < 1.6 ? 'sand' : 'grass';
        this.audio.step(surface, hspeed > 5.5);
        this.audio.stepTimer = hspeed > 5.5 ? 0.31 : 0.46;
      }
    } else {
      this.audio.stepTimer = 0;
    }

    // --- смерть ---
    if (state.health <= 0 && !this.dead) this.die(cause || 'ты не выжил');

    // --- интерфейс ---
    this.ui.setBars(this.readBars());
    this.ui.setTop({
      day: this.sky.day,
      clock: this.sky.clockString(),
      weather: WEATHERS[this.weather].label,
    });

    if (this.ui.isPanelOpen()) this.ui.renderBag(state.inventory, this.state.hotbar);

    // --- автосейв ---
    this.saveTimer += dt;
    if (this.saveTimer > 15) {
      this.saveTimer = 0;
      this.save();
    }
  }

  /** Урон от зверя: тряска, звук, предупреждение */
  takeDamage(amount, cause) {
    if (!this.running || this.paused || this.dead || amount <= 0) return;
    this.state.health = Math.max(0, this.state.health - amount);
    this.player.landShake = Math.max(this.player.landShake, 0.45);
    this.audio.hurt();
    this.ui.toast(`−${Math.round(amount)} здоровья: ${cause}`, true);
    if (this.state.health <= 0) this.die(cause);
  }

  die(cause) {
    this.dead = true;
    this.running = false;
    // смерть = конец забега: сохранение стираем, иначе «Продолжить» вернёт к жизни
    try { localStorage.removeItem(SAVE_KEY); } catch (err) { /* ignore */ }
    const days = this.sky.day;
    this.ui.showDeath(days, `Причина: ${cause}.`);
    this.audio.hurt();
    if (document.pointerLockElement) document.exitPointerLock();
  }

  // ------------------------------------------------------------
  //  Сохранения (localStorage)
  // ------------------------------------------------------------

  save() {
    if (!this.running || this.dead) return;
    try {
      const data = {
        v: 1,
        day: this.sky.day,
        hour: this.sky.hour,
        pos: [this.player.position.x, this.player.position.z],
        yaw: this.player.yaw,
        facing: this.player.facing,
        need: [this.state.health, this.state.thirst, this.state.hunger, this.state.warmth],
        inv: this.state.inventory,
        hotbar: this.state.hotbar,
        selected: this.selected,
        view: this.view,
        campfires: this.resources.campfires.map((f) => ({ x: f.x, z: f.z, fuel: Math.round(f.fuel) })),
        collected: this.state.collected,
        weather: this.weather,
        savedAt: Date.now(),
      };
      localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    } catch (err) {
      /* приватный режим или нет места — молча продолжаем */
    }
  }

  loadSave() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return null;
      const data = JSON.parse(raw);
      if (!data || data.v !== 1) return null;
      return data;
    } catch (err) {
      return null;
    }
  }

  loadGame() {
    const data = this.loadSave();
    if (!data) return;
    this.sky.day = data.day || 1;
    this.sky.hour = data.hour ?? CONFIG.time.startHour;
    this.weather = data.weather && WEATHERS[data.weather] ? data.weather : 'clear';
    const [x, z] = data.pos || [4, 40];
    this.player.setPosition(x, z, this.world);
    this.player.yaw = data.yaw ?? this.player.yaw;
    this.player.facing = data.facing ?? this.player.facing;
    const [health, thirst, hunger, warmth] = data.need || [100, 78, 72, 100];
    this.state.health = health;
    this.state.thirst = thirst;
    this.state.hunger = hunger;
    this.state.warmth = warmth;
    this.state.inventory = Object.assign(emptyInventory(), data.inv || {});
    this.selected = Math.max(0, Math.min(HOTBAR_SIZE - 1, data.selected || 0));
    this.state.hotbar = normalizeHotbar(data.hotbar);
    this.view = data.view === 'first' ? 'first' : 'third';
    this.state.collected = data.collected || 0;

    for (const f of data.campfires || []) {
      const fire = this.resources.addCampfire(f.x, f.z);
      fire.fuel = Math.max(0, Math.min(fire.maxFuel, f.fuel || 0));
    }
    this.player.applyCamera(this.camera, this.world, 1);
    this.refreshHotbar();
    this.ui.renderBag(this.state.inventory, this.state.hotbar);
    this.player.setEquipped(this.equippedId());
    this.ui.toast(`Загружено: день ${this.sky.day}, ${this.sky.clockString()}`);
  }

  /** Новые предметы на земле тоже попадают под отсечку видимости */
  syncCuller() {
    for (const p of this.world.pickups) {
      if (this.trackedPickups.has(p.mesh)) continue;
      this.trackedPickups.add(p.mesh);
      this.culler.track(p.mesh, { radius: 0.5, height: 0.6 });
    }
  }

  /**
   * Панели (сумка/крафт) требуют свободного курсора: отпускаем pointer lock,
   * а при закрытии — возвращаем его в игру.
   */
  togglePanel(kind) {
    const wasOpen = this.ui.isPanelOpen();

    if (wasOpen) {
      this.ui.closePanels();
      this.relock();
      this.audio.uiClick();
      return;
    }

    if (document.pointerLockElement) {
      this.panelUnlock = true;
      document.exitPointerLock();
    }

    if (kind === 'craft') {
      this.ui.toggleCraft(true, RECIPES, this.state.inventory, (id) => this.craft(id));
    } else {
      this.ui.toggleBag(true);
      this.ui.renderBag(this.state.inventory, this.state.hotbar);
    }
    this.audio.uiClick();
  }

  /** Вернуть управление мышью (если игра идёт) */
  relock() {
    if (!this.running || this.paused || this.dead) return;
    if (this.dragLook) return;
    this.tryLock();
  }

  /** Переключение «третье лицо / от первого лица» */
  toggleView() {
    this.view = this.view === 'first' ? 'third' : 'first';
    this.player.setViewMode(this.view, this.camera);
    this.ui.toast(this.view === 'first' ? 'Вид от первого лица' : 'Вид от третьего лица');
    this.audio.uiClick();
  }

  /** Панель диагностики: всё, что нужно для «не работает» */
  showDiag() {
    const diag = document.getElementById('diag');
    const text = document.getElementById('diag-text');
    if (!diag || !text) return;
    text.textContent = collectDiag({
      'Режим графики': this.qualityLabel || '—',
      'Тени': this.renderer?.shadowMap?.enabled ? 'вкл' : 'выкл',
      'FPS': this.fpsValue,
      'Мир': this.world ? `${this.world.pickups.length} предметов, ${this.resources?.nodes?.length || 0} узлов` : 'не построен',
      'Игра запущена': this.running ? 'да' : 'нет',
      'Пауза': this.paused ? 'да' : 'нет',
      'Pointer lock': this.locked ? 'захвачен' : (this.dragLook ? 'обзор перетаскиванием' : 'нет'),
    });
    diag.classList.remove('hidden');
    if (this.running && !this.paused) this.pause();
  }

  /** Если долго меньше 26 fps — упрощаем графику, чтобы игра не превращалась в слайд-шоу */
  autoQuality() {
    if (!this.running || this.paused) return;
    if (this.fpsValue < 26) {
      this.slowTimer += 0.5;
      if (this.slowTimer > 4) {
        this.slowTimer = 0;
        this.degradeQuality();
      }
    } else {
      this.slowTimer = Math.max(0, this.slowTimer - 0.5);
    }
  }

  degradeQuality() {
    if (this.quality >= 2) return;
    this.quality += 1;
    if (this.quality === 1) {
      this.renderer.setPixelRatio(1);
      this.rain.count = Math.min(this.rain.count, 900);
      this.ui.toast('Графика упрощена: сглаживание и лишние частицы выключены');
    } else {
      this.renderer.shadowMap.enabled = false;
      this.sky.sun.castShadow = false;
      this.renderer.setPixelRatio(1);
      this.ui.toast('Тени выключены — так быстрее');
    }
  }

  // ------------------------------------------------------------
  //  Цикл
  // ------------------------------------------------------------

  frame() {
    this.frameIndex = (this.frameIndex + 1) % 100000;
    const now = performance.now();
    let dt = (now - this.lastTime) / 1000;
    this.lastTime = now;
    if (dt > 0.1) dt = 0.1;          // защита от рывков при сворачивании окна

    if (this.running && !this.paused && !this.dead) this.update(dt);
    else if (this.paused || this.dead) this.world.update(dt * 0.2, this.camera);

    try {
      this.renderer.render(this.scene, this.camera);
    } catch (err) {
      if (!this._renderErrorShown) {
        this._renderErrorShown = true;
        showFatal(err, 'отрисовка кадра');
      }
    }

    // счётчик FPS
    this.fpsAccum += dt;
    this.fpsFrames++;
    if (this.fpsAccum > 0.5) {
      this.fpsValue = Math.round(this.fpsFrames / this.fpsAccum);
      this.fpsAccum = 0;
      this.fpsFrames = 0;
      if (this.running) this.ui.setTop({ fps: this.fpsValue });
      this.autoQuality(dt);
    }
  }
}

// ============================================================
//  Запуск: мир строится по клику, любая ошибка видна на экране.
// ============================================================

let booting = false;
let menuReady = false;

function showFatal(err, where = 'запуск') {
  const box = document.getElementById('fatal');
  const text = document.getElementById('fatal-text');
  const whereEl = document.getElementById('fatal-where');
  if (!box || !text) return;
  const msg = (err && (err.stack || err.message)) || String(err);
  text.textContent = String(msg).slice(0, 4000);
  if (whereEl) whereEl.textContent = where;
  box.classList.remove('hidden');
  const hud = document.getElementById('hud');
  if (hud) hud.classList.add('hidden');
  console.error(err);
}

function setBootStatus(text, bad = false) {
  const el = document.getElementById('boot-status');
  if (!el) return;
  el.textContent = text;
  el.style.color = bad ? '#e08070' : '';
}

function hasSave() {
  try {
    return !!localStorage.getItem(SAVE_KEY);
  } catch (err) {
    return false;
  }
}

/** Создаёт игру (один раз) и запускает её. Все ошибки — на экран. */
function boot(continueSave = false) {
  if (booting) return;
  booting = true;

  try {
    if (!window.__game) {
      const t0 = performance.now();
      const game = new Game();
      window.__game = game;
      console.log(`[LAST SHORE] мир собран за ${Math.round(performance.now() - t0)} мс`);
    }
    window.__game.start(continueSave);
    setBootStatus('движок готов · день ' + window.__game.sky.day);
  } catch (err) {
    if (!err || !err.handled) showFatal(err, 'создание мира');
    else setBootStatus('нет 3D-ускорения — смотри пояснение на экране', true);
    if (err && err.handled) {
      setBootStatus('нет 3D-ускорения — включи аппаратное ускорение в браузере', true);
    }
    const btn = document.getElementById('btn-start');
    if (btn) { btn.disabled = false; btn.textContent = 'Начать'; }
  } finally {
    booting = false;
  }
}

/** Клик -> пауза на 40 мс (чтобы кнопка успела перерисоваться) -> сборка мира */
function scheduleBoot(continueSave) {
  if (booting) return;
  booting = true;
  const btn = document.getElementById('btn-start');
  if (btn) { btn.disabled = true; btn.textContent = 'Строим остров…'; }
  setBootStatus('строим остров…');
  setTimeout(() => {
    booting = false;
    boot(continueSave);
  }, 40);
}

function initMenu() {
  if (menuReady) return;
  menuReady = true;

  const continueBtn = document.getElementById('btn-continue');
  const reloadBtn = document.getElementById('btn-reload');
  if (reloadBtn) reloadBtn.addEventListener('click', () => window.location.reload());

  const diagBtn = document.getElementById('btn-diag');
  if (diagBtn) {
    diagBtn.addEventListener('click', () => {
      const diag = document.getElementById('diag');
      const text = document.getElementById('diag-text');
      if (!diag || !text) return;
      text.textContent = collectDiag({ 'Игра запущена': window.__game?.running ? 'да' : 'нет' });
      diag.classList.remove('hidden');
    });
  }
  const noglDiag = document.getElementById('btn-nogl-diag');
  if (noglDiag) {
    noglDiag.addEventListener('click', () => {
      const diag = document.getElementById('diag');
      const text = document.getElementById('diag-text');
      if (!diag || !text) return;
      text.textContent = collectDiag();
      diag.classList.remove('hidden');
    });
  }
  const diagClose = document.getElementById('btn-diag-close');
  if (diagClose) {
    diagClose.addEventListener('click', () => document.getElementById('diag')?.classList.add('hidden'));
  }
  const diagCopy = document.getElementById('btn-diag-copy');
  if (diagCopy) {
    diagCopy.addEventListener('click', async () => {
      const text = document.getElementById('diag-text')?.textContent || '';
      try {
        await navigator.clipboard.writeText(text);
        diagCopy.textContent = 'Скопировано';
      } catch (err) {
        diagCopy.textContent = 'Выдели и скопируй текст';
      }
    });
  }

  // Делегирование: работает, даже если кнопка перерисована или перекрыта
  document.addEventListener('click', (e) => {
    const t = e.target;
    if (!t || !t.closest) return;
    if (t.closest('#btn-start')) { scheduleBoot(false); return; }
    if (t.closest('#btn-continue')) { scheduleBoot(true); return; }
    if (t.closest('#btn-resume') && window.__game) { window.__game.resume(); return; }
    if (t.closest('#btn-restart')) {
      try { localStorage.removeItem(SAVE_KEY); } catch (err) { /* ignore */ }
      window.location.reload();
    }
  });

  // запасной путь: Enter или пробел на стартовом экране
  window.addEventListener('keydown', (e) => {
    if (window.__game && window.__game.running) return;
    if (e.code === 'Enter' || e.code === 'NumpadEnter' || e.code === 'Space') {
      e.preventDefault();
      scheduleBoot(false);
    }
  });

  if (hasSave()) {
    try {
      const data = JSON.parse(localStorage.getItem(SAVE_KEY));
      if (continueBtn) {
        continueBtn.classList.remove('hidden');
        continueBtn.textContent = `Продолжить — день ${data.day || 1}`;
      }
    } catch (err) { /* ignore */ }
  }

  setBootStatus('движок готов · нажми «Начать»');
}

// ошибки до старта игры показываем сразу и по-русски
window.addEventListener('error', (e) => {
  if (!window.__game) showFatal(e.error || new Error(e.message), 'загрузка скрипта');
});
window.addEventListener('unhandledrejection', (e) => {
  if (!window.__game) showFatal(e.reason, 'обещание');
});

window.__boot = boot;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initMenu);
} else {
  initMenu();
}
