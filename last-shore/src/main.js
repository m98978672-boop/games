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
import { ITEMS, HOTBAR, BAG_ORDER, RECIPES } from './items.js';
import { Resources, NODE_DEFS } from './nodes.js';

const SAVE_KEY = 'lastshore.save.v1';

function emptyInventory() {
  const inv = {};
  for (const id of Object.keys(ITEMS)) inv[id] = 0;
  return inv;
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
    this.ui = new UI(ITEMS, HOTBAR, BAG_ORDER);
    this.audio = new Audio();

    try {
      this.renderer = new THREE.WebGLRenderer({
        canvas: this.canvas,
        antialias: true,
        powerPreference: 'high-performance',
      });
    } catch (err) {
      this.ui.showScreen('nogl');
      throw err;
    }
    if (!this.renderer.getContext()) {
      this.ui.showScreen('nogl');
      throw new Error('WebGL: контекст не создан');
    }

    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
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

    this.world = new World(this.scene);
    this.sky = new Sky(this.scene, this.renderer);
    this.player = new Player(this.scene);
    this.rain = new Rain(this.scene);
    this.resources = new Resources(this.scene, this.world);

    this.state = {
      health: 100,
      thirst: 78,
      hunger: 72,
      warmth: 100,
      inventory: emptyInventory(),
      collected: 0,
    };
    this.selected = 0;
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

    this.lastTime = performance.now();
    this.fpsAccum = 0;
    this.fpsFrames = 0;
    this.fpsValue = 60;
    this.saveTimer = 0;

    this.spawnPlayer();
    this.buildHighlight();
    this.bindEvents();

    this.ui.setHotbar(this.state.inventory, this.selected);
    this.ui.renderBag(this.state.inventory);

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
      if (!this.locked) {
        this.dragging = true;
        this.tryLock();
      }
      if (e.button === 0) {
        this.audio.resume();
        this.holdingAttack = true;
        this.attack();
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
      const dist = CONFIG.player.cameraDistance + e.deltaY * 0.004;
      CONFIG.player.cameraDistance = Math.max(2.2, Math.min(12, dist));
    }, { passive: true });

    document.addEventListener('pointerlockchange', () => {
      const wasLocked = this.locked;
      this.locked = document.pointerLockElement === this.canvas;
      if (wasLocked && !this.locked && this.running && !this.paused && !this.dead) {
        this.pause();
      }
    });
    document.addEventListener('pointerlockerror', () => {
      this.dragLook = true;
    });

    // потеря фокуса — ставим на паузу, чтобы не умереть «за кадром»
    window.addEventListener('blur', () => {
      const settled = performance.now() - (this.startedAt || 0) > 1500;
      if (settled && this.running && !this.paused && !this.dead) this.pause();
    });

    window.addEventListener('beforeunload', () => this.save());
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) this.save();
    });
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
      if (this.ui.isPanelOpen()) { this.ui.closePanels(); return; }
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
      case 'KeyF': this.placeCampfire(); break;
      case 'KeyC': {
        e.preventDefault();
        this.ui.toggleCraft(undefined, RECIPES, this.state.inventory, (id) => this.craft(id));
        break;
      }
      case 'KeyI': case 'Tab':
        e.preventDefault();
        this.ui.toggleBag(undefined);
        this.ui.renderBag(this.state.inventory);
        break;
      case 'Digit1': case 'Digit2': case 'Digit3': case 'Digit4':
      case 'Digit5': case 'Digit6': case 'Digit7': case 'Digit8': {
        const n = Number(code.replace('Digit', '')) - 1;
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
    this.ui.renderBag(this.state.inventory);
    this.ui.setHotbar(this.state.inventory, this.selected);
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
    const id = HOTBAR[this.selected];
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
    if (index < 0 || index >= HOTBAR.length) return;
    this.selected = index;
    this.ui.setHotbar(this.state.inventory, this.selected);
    this.player.setEquipped(this.equippedId());
  }

  addItem(id, count = 1) {
    if (!ITEMS[id]) return;
    this.state.inventory[id] = (this.state.inventory[id] || 0) + count;
    this.state.collected += count;
    this.ui.setHotbar(this.state.inventory, this.selected);
    this.ui.renderBag(this.state.inventory);
    if (this.ui.el.craft && !this.ui.el.craft.classList.contains('hidden')) {
      this.ui._lastCraftSig = '';
      this.ui.renderCraft(RECIPES, this.state.inventory, (rid) => this.craft(rid));
    }
  }

  takeItem(id, count = 1) {
    if ((this.state.inventory[id] || 0) < count) return false;
    this.state.inventory[id] -= count;
    this.ui.setHotbar(this.state.inventory, this.selected);
    this.ui.renderBag(this.state.inventory);
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
      this.ui.toast('Добывай ударами: зажми левую кнопку мыши', true);
    }
  }

  /** ЛКМ: удар по дереву/камню/кусту или в воздух */
  attack() {
    if (!this.running || this.paused || this.dead) return;
    if (this.attackCooldown > 0) return;
    this.attackCooldown = 0.62;

    this.player.swing();
    this.audio.step('grass', false);

    const target = this.resources.nearest(this.player.position, 3.8);
    if (!target || target.kind !== 'node') return;

    const node = target.node;
    const tool = this.equippedTool();
    const def = this.resources.strike(node, tool);

    // не тот инструмент — предупреждаем, но добыча всё равно идёт медленно
    const power = tool && tool[this.nodeDef(node).tool ?? 'chop'] !== undefined
      ? tool[this.nodeDef(node).tool ?? 'chop']
      : 0.35;
    if (def.need && (!tool || power < 1)) {
      this.ui.toast(`Нужен ${def.need}: так почти не выходит`, true);
    }

    if (def.depleted) {
      const parts = [];
      for (const [id, n] of Object.entries(def.drops)) {
        this.addItem(id, n);
        parts.push(`${ITEMS[id].name} +${n}`);
      }
      this.ui.toast(parts.length ? `${node.label} добыт: ${parts.join(', ')}` : `${node.label} пуст`);
      this.audio.pickup();
      if (this.nearNode === node) this.nearNode = null;
    } else {
      this.audio.step('rock', true);
    }
  }

  craft(recipeId) {
    const recipe = RECIPES.find((r) => r.id === recipeId);
    if (!recipe) return;
    const inv = this.state.inventory;

    for (const [id, need] of Object.entries(recipe.need)) {
      if ((inv[id] || 0) < need) {
        this.ui.toast(`Не хватает: ${ITEMS[id].name}`, true);
        return;
      }
    }
    for (const [id, need] of Object.entries(recipe.need)) this.takeItem(id, need);
    for (const [id, give] of Object.entries(recipe.gives)) this.addItem(id, give);

    this.audio.pickup();
    this.ui.toast(`Сделано: ${recipe.name}`);
    this.ui._lastCraftSig = '';
    this.ui.renderCraft(RECIPES, inv, (rid) => this.craft(rid));

    // если сделали инструмент — сразу берём его в руку
    if (ITEMS[recipeId]?.kind === 'tool') {
      const idx = HOTBAR.indexOf(recipeId);
      if (idx >= 0) this.selectSlot(idx);
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
    const id = HOTBAR[this.selected];
    if (!id) return;
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
    };
    const ef = effects[kind];
    if (!ef) return;

    this.takeItem(kind, 1);
    this.state.thirst = Math.max(0, Math.min(100, this.state.thirst + (ef.thirst || 0)));
    this.state.hunger = Math.max(0, Math.min(100, this.state.hunger + (ef.hunger || 0)));
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

    this.rain.setIntensity(this.rainIntensity);
    this.rain.update(dt, this.player.position);
    this.audio.setNight(skyInfo.night);

    this.world.update(dt, this.camera, skyInfo.sunDir, skyInfo.night, skyInfo.fogColor);

    // --- ресурсы и костры ---
    this.resources.update(dt);
    this.attackCooldown = Math.max(0, this.attackCooldown - dt);
    if (this.holdingAttack && this.attackCooldown <= 0) this.attack();

    const fireWarm = this.resources.fireWarmth(this.player.position);
    this.nearFire = fireWarm.fire;
    this.ui.setFuel(fireWarm.warmth > 0.05 && fireWarm.fire ? fireWarm.fire : null);

    // --- подсветка цели и подсказка ---
    this.nearest = this.world.nearestPickup(this.player.position, CONFIG.interact.reach + 0.6);
    const nodeTarget = this.resources.nearest(this.player.position, 3.9);
    let marker = null;

    if (this.nearest) {
      marker = this.nearest.mesh.position;
      this.ui.setPrompt(`<b>E</b> — подобрать ${this.nearest.name.toLowerCase()}`);
    } else if (nodeTarget && nodeTarget.kind === 'node') {
      const def = this.nodeDef(nodeTarget.node);
      marker = new THREE.Vector3(nodeTarget.node.x, nodeTarget.node.y + 0.1, nodeTarget.node.z);
      const toolOk = !def.need || this.equippedTool();
      this.ui.setPrompt(
        `<b>ЛКМ</b> — ${def.label.toLowerCase()}${def.need ? ` (нужен ${def.need})` : ''}` +
        (toolOk ? '' : ' · <span class="prompt-warn">медленно</span>')
      );
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

    if (this.ui.isPanelOpen()) this.ui.renderBag(state.inventory);

    // --- автосейв ---
    this.saveTimer += dt;
    if (this.saveTimer > 15) {
      this.saveTimer = 0;
      this.save();
    }
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
        selected: this.selected,
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
    this.selected = Math.max(0, Math.min(HOTBAR.length - 1, data.selected || 0));
    this.state.collected = data.collected || 0;

    for (const f of data.campfires || []) {
      const fire = this.resources.addCampfire(f.x, f.z);
      fire.fuel = Math.max(0, Math.min(fire.maxFuel, f.fuel || 0));
    }
    this.player.applyCamera(this.camera, this.world, 1);
    this.ui.setHotbar(this.state.inventory, this.selected);
    this.ui.renderBag(this.state.inventory);
    this.player.setEquipped(this.equippedId());
    this.ui.toast(`Загружено: день ${this.sky.day}, ${this.sky.clockString()}`);
  }

  // ------------------------------------------------------------
  //  Цикл
  // ------------------------------------------------------------

  frame() {
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
    showFatal(err, 'создание мира');
    setBootStatus('ошибка запуска — текст на экране', true);
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
