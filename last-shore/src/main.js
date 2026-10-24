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

const SAVE_KEY = 'lastshore.save.v1';

const WEATHERS = {
  clear: { label: 'ясно', rain: 0, sun: 1.0, fog: 1.0, next: { clear: 0.45, cloudy: 0.4, rain: 0.15 } },
  cloudy: { label: 'облачно', rain: 0, sun: 0.68, fog: 1.25, next: { clear: 0.35, cloudy: 0.35, rain: 0.3 } },
  rain: { label: 'дождь', rain: 0.85, sun: 0.4, fog: 1.7, next: { cloudy: 0.55, rain: 0.3, storm: 0.15 } },
  storm: { label: 'гроза', rain: 1, sun: 0.26, fog: 2.1, next: { rain: 0.6, cloudy: 0.4 } },
};

class Game {
  constructor() {
    this.canvas = document.getElementById('scene');
    this.ui = new UI();
    this.audio = new Audio();

    try {
      this.renderer = new THREE.WebGLRenderer({
        canvas: this.canvas,
        antialias: true,
        powerPreference: 'high-performance',
      });
    } catch (err) {
      this.ui.showScreen('nogl');
      return;
    }
    if (!this.renderer.getContext()) {
      this.ui.showScreen('nogl');
      return;
    }

    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(64, window.innerWidth / window.innerHeight, 0.25, 1400);

    this.world = new World(this.scene);
    this.sky = new Sky(this.scene, this.renderer);
    this.player = new Player(this.scene);
    this.rain = new Rain(this.scene);

    this.state = {
      health: 100,
      thirst: 78,
      hunger: 72,
      warmth: 100,
      inventory: { wood: 0, stone: 0, fiber: 0, coconut: 0, berries: 0 },
      collected: 0,
    };

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

    this.updateHotbarUI();
    this.ui.setCounts(this.state.inventory);

    const save = this.loadSave();
    if (save) {
      document.getElementById('btn-continue').classList.remove('hidden');
      document.getElementById('btn-continue').textContent = `Продолжить — день ${save.day}`;
    }

    this.renderer.setAnimationLoop(() => this.frame());
  }

  // ------------------------------------------------------------
  //  Старт
  // ------------------------------------------------------------

  spawnPlayer() {
    const R = (CONFIG.world.size / 2) * 0.94;
    let best = null;
    for (let i = 0; i < 900 && !best; i++) {
      const angle = Math.PI / 2 + (i / 900) * Math.PI * 2 + Math.random() * 0.02;
      for (let r = R; r > R * 0.35; r -= 2) {
        const x = Math.cos(angle) * r;
        const z = Math.sin(angle) * r;
        const h = this.world.heightAt(x, z);
        if (h > 1.1 && h < 3.2 && this.world.slopeAt(x, z) < 0.4) {
          best = { x, z };
          break;
        }
      }
    }
    if (!best) best = { x: 4, z: 40 };

    this.player.setPosition(best.x, best.z, this.world);
    const dx = -best.x;
    const dz = -best.z;
    this.player.yaw = Math.atan2(-dx, -dz);
    this.player.facing = this.player.yaw + Math.PI;
    this.player.applyCamera(this.camera, this.world, 1);
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

    document.getElementById('btn-start').addEventListener('click', () => this.start(false));
    document.getElementById('btn-continue').addEventListener('click', () => this.start(true));
    document.getElementById('btn-resume').addEventListener('click', () => this.resume());
    document.getElementById('btn-restart').addEventListener('click', () => {
      try { localStorage.removeItem(SAVE_KEY); } catch (err) { /* ignore */ }
      window.location.reload();
    });

    document.querySelectorAll('.slot').forEach((slot) => {
      slot.addEventListener('click', () => {
        const key = slot.dataset.slot === '0' ? 'coconut' : 'berries';
        this.consume(key);
      });
    });

    window.addEventListener('keydown', (e) => this.onKeyDown(e));
    window.addEventListener('keyup', (e) => this.onKeyUp(e));

    this.canvas.addEventListener('mousedown', (e) => {
      if (!this.running || this.paused) return;
      if (!this.locked) {
        this.dragging = true;
        this.tryLock();
      }
      if (e.button === 0) this.audio.resume();
    });
    window.addEventListener('mouseup', () => { this.dragging = false; });

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
      if (p && typeof p.catch === 'function') p.catch(() => { this.dragLook = true; });
    } catch (err) {
      this.dragLook = true;
    }
  }

  onKeyDown(e) {
    if (e.repeat) return;
    const code = e.code;

    if (code === 'Escape') {
      if (this.ui.isInventoryOpen()) { this.ui.toggleInventory(false); return; }
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
      case 'KeyE': this.pickup(); break;
      case 'Digit1': this.consume('coconut'); break;
      case 'Digit2': this.consume('berries'); break;
      case 'KeyI': case 'Tab':
        e.preventDefault();
        this.ui.toggleInventory();
        this.ui.setInventory(this.state.inventory);
        break;
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
    this.audio.init();
    this.audio.resume();

    if (continueSave) this.loadGame();

    this.ui.hideScreens();
    this.ui.setBars(this.readBars());
    this.ui.setInventory(this.state.inventory);
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

  pickup() {
    const p = this.world.nearestPickup(this.player.position, CONFIG.interact.reach + 0.6);
    if (!p) return;
    this.state.inventory[p.kind] = (this.state.inventory[p.kind] || 0) + 1;
    this.state.collected++;
    this.world.removePickup(p);
    this.audio.pickup();
    this.ui.toast(`+ ${p.name}`);
    this.ui.setCounts(this.state.inventory);
    this.ui.setInventory(this.state.inventory);
    this.highlight.visible = false;
  }

  consume(kind) {
    if (!this.running || this.paused || this.dead) return;
    const inv = this.state.inventory;
    if ((inv[kind] || 0) <= 0) {
      this.ui.toast(kind === 'coconut' ? 'Кокосов нет' : 'Ягод нет', true);
      return;
    }
    inv[kind]--;

    if (kind === 'coconut') {
      this.state.thirst = Math.min(100, this.state.thirst + CONFIG.food.coconut.thirst);
      this.state.hunger = Math.min(100, this.state.hunger + CONFIG.food.coconut.hunger);
      this.audio.drink();
      this.ui.toast('Кокос: +20 жажды, +6 еды');
    } else {
      this.state.hunger = Math.min(100, this.state.hunger + CONFIG.food.berries.hunger);
      this.audio.eat();
      this.ui.toast('Горсть ягод: +12 еды');
    }
    this.ui.setCounts(inv);
    this.ui.setInventory(inv);
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

    // --- подсветка ближайшего предмета ---
    this.nearest = this.world.nearestPickup(this.player.position, CONFIG.interact.reach + 0.6);
    if (this.nearest) {
      this.highlight.visible = true;
      const p = this.nearest.mesh.position;
      this.highlight.position.set(p.x, this.world.heightAt(p.x, p.z) + 0.06, p.z);
      this.highlight.material.opacity = 0.6 + Math.sin(performance.now() * 0.005) * 0.25;
      this.ui.setPrompt(`<b>E</b> — подобрать ${this.nearest.name.toLowerCase()}`);
    } else {
      this.highlight.visible = false;
      this.ui.setPrompt(null);
    }

    // --- потребности ---
    const sprinting = this.input.sprint && Math.hypot(this.player.velocity.x, this.player.velocity.z) > 5;
    const moveMul = sprinting ? 1.3 : 1;
    const wetMul = this.rainIntensity > 0.3 ? 1.12 : 1;

    state.thirst = Math.max(0, state.thirst - CONFIG.needs.thirstDrain * moveMul * wetMul * dt);
    state.hunger = Math.max(0, state.hunger - CONFIG.needs.hungerDrain * moveMul * wetMul * dt);

    const warmthTarget = Math.max(26, 100 - skyInfo.night * 42 - this.rainIntensity * 26);
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

    if (this.ui.isInventoryOpen()) this.ui.setInventory(state.inventory);

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
    this.state.inventory = Object.assign({ wood: 0, stone: 0, fiber: 0, coconut: 0, berries: 0 }, data.inv || {});
    this.state.collected = data.collected || 0;
    this.player.applyCamera(this.camera, this.world, 1);
    this.ui.setCounts(this.state.inventory);
    this.ui.toast(`Загружено: день ${this.sky.day}, ${this.sky.clockString()}`);
  }

  // ------------------------------------------------------------
  //  Цикл
  // ------------------------------------------------------------

  updateHotbarUI() {
    this.ui.setCounts(this.state.inventory);
  }

  frame() {
    const now = performance.now();
    let dt = (now - this.lastTime) / 1000;
    this.lastTime = now;
    if (dt > 0.1) dt = 0.1;          // защита от рывков при сворачивании окна

    if (this.running && !this.paused && !this.dead) this.update(dt);
    else if (this.paused || this.dead) this.world.update(dt * 0.2, this.camera);

    this.renderer.render(this.scene, this.camera);

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

window.addEventListener('DOMContentLoaded', () => {
  window.__game = new Game();
});
