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
import { Mine, createMineWorld } from './mine.js';
import {
  FORMS, MATERIALS, forge, forgeCost, sharpen, canSharpen,
  effectiveTool, effectiveWeapon, registerForged,
  buildWorkbench, buildGrindstone, buildModel as buildForgedModel,
} from './forge.js';
import { HitboxSystem } from './hitboxes.js';
import { InspectorBot } from './bot.js';
import { BUILD, probeWebGL, collectDiag, wantsSafeMode } from './diag.js';
import { createTextures } from './textures.js';
import { makeBoat } from './models.js';

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

    // --- подземелье: два слоя под островом ---
    this.mine = new Mine(this.scene, this.world, CONFIG.world.seed);
    this.mineWorld = createMineWorld(this.mine, this.world);
    this.underground = false;
    this.stations = [];          // верстаки и точила, поставленные игроком
    this.forged = {};            // id -> данные кованого предмета (для сохранения)
    this.ws = { mode: 'forge', form: 'sword', mat: 'flint', station: null };
    this.aim = null;

    // фонарь под землёй: без него в шахте нечего делать
    this.mineLight = new THREE.PointLight(0xffcf8a, 2.3, 16, 2);
    this.mineLight.visible = false;
    this.scene.add(this.mineLight);

    this.projectiles = [];
    this.chips = [];            // щепки, крошка и ягоды — короткие частицы

    // ---- прогрев шейдеров: компилируем всё заранее, чтобы первый кадр и
    // первая постановка костра/постройки не «подвешивали» игру ----
    try {
      this.player.position.set(this.spawn?.x || 0, this.world.heightAt(0, 0), this.spawn?.z || 0);
      this.player.applyCamera(this.camera, this.world, 1);
      this.renderer.compile(this.scene, this.camera);
    } catch (e) { /* прогрев не критичен */ }

    // ---- лодка: плавает по волнам, на ней можно уйти к другим островам ----
    this.boat = null;
    this.sailing = false;
    this.shadowDirty = true;   // карту теней пересобрать на первом кадре

    // ---- хитбоксы: у каждой модели своя невидимая коробка ----
    // Ничего не прячем и не «догружаем»: модели всегда на месте,
    // зато у каждой есть своя коробка — и у героя по частям тела.
    this.recipes = RECIPES;
    this.hitboxes = new HitboxSystem(this.scene, this.player);
    this.bot = null;            // бот-инспектор по F8
    this.cursorFree = false;    // F9: курсор отпущен, обзор мышью выключен
    this.hitboxIds = { mobs: new Map(), nodes: new Map(), pickups: new Map() };
    this.registerStaticHitboxes();
    this.registerMobHitboxes();
    this.syncPickupHitboxes();

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
    this.inLavaTimer = 0;
    this.lavaHurtAt = 0;
    this.creative = false;
    this.creativeArmed = false;
    this.digCooldown = 0;
    this.wounds = [];
    this.armPenalty = 1;            // ранения по частям тела
    this.woundTimer = 0;
    this.thoughtTimer = 45 + Math.random() * 40;
    this.fireflies = null;

    this.weather = 'clear';
    this.weatherTimer = 2.5;      // в игровых часах до смены погоды
    this.rainIntensity = 0;
    this.weatherSunMul = 1;
    this.weatherFogMul = 1;

    this.input = { forward: false, back: false, left: false, right: false, sprint: false, jump: false, jumpHeld: false };
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

    this.buildFireflies();
    this.spawnPlayer();
    this.buildHighlight();
    this.bindEvents();

    this.refreshHotbar();
    this.ui.renderBag(this.state.inventory, this.state.hotbar);

    this.renderer.setAnimationLoop(() => this.frame());
  }

  // ------------------------------------------------------------
  //  Хитбоксы всех моделей мира
  // ------------------------------------------------------------

  /** Деревья, камни, кусты, костры, родники, станки, входы в шахту */
  registerStaticHitboxes() {
    for (const node of this.resources.nodes) {
      // коробка ровно по габаритам модели (их считает world при сборке)
      const bbox = node.item && (node.item.bboxSolid || node.item.bbox)
        ? (node.item.bboxSolid || node.item.bbox)
        : { w: 1, h: 2, d: 1, minY: 0 };
      const id = this.hitboxes.registerStatic(
        node.type === 'tree' || node.type === 'palm' ? 'tree' : node.type,
        {
          x: node.x,
          y: node.y + (bbox.minY || -0.15),
          z: node.z,
          w: bbox.w,
          h: bbox.h,
          d: bbox.d,
          // footprint деревьев/камней квадратный: поворот не раздувает коробку
          yaw: 0,
        },
        { physical: false, ref: node, enabled: () => node.alive }
      );
      this.hitboxIds.nodes.set(node, id);
    }

    for (const fire of this.resources.campfires) {
      this.hitboxes.registerStatic('fire', { x: fire.x, y: fire.y, z: fire.z, w: 1.2, h: 0.9, d: 1.2 }, { ref: fire, physical: false });
    }
    for (const spring of this.resources.springs) {
      this.hitboxes.registerStatic('spring', { x: spring.x, y: spring.y, z: spring.z, w: 3.2, h: 0.4, d: 3.2 }, { ref: spring, physical: false });
    }
    for (const st of this.stations) {
      st.hitboxId = this.hitboxes.registerStatic('station', { x: st.x, y: st.y, z: st.z, w: 1.5, h: 1.15, d: 0.9 }, { ref: st, physical: true });
    }
    for (const e of this.mine.entrances) {
      this.hitboxes.registerStatic('mine', { x: e.x, y: e.y, z: e.z, w: 4.2, h: 3.0, d: 4.2 }, { ref: e, physical: false });
    }
  }

  /** У каждого зверя — своя коробка, отдельная от остальных */
  registerMobHitboxes() {
    for (const mob of this.mobs.list) {
      const hb = mob.hitboxSize || mob.def.hitbox;
      const c = mob.hitboxCenter || { x: 0, y: hb.h / 2, z: 0 };
      const id = this.hitboxes.register('mob', () => {
        if (!mob.alive) return null;
        // модель повёрнута на facing − 90°, значит и смещение коробки тоже
        const yaw = (mob.facing || 0) - Math.PI / 2;
        const cos = Math.cos(yaw);
        const sin = Math.sin(yaw);
        const ox = c.x * cos + c.z * sin;
        const oz = -c.x * sin + c.z * cos;
        return {
          x: mob.x + ox,
          y: (mob.y || 0) + (mob.def.flying ? mob.flyY || 0 : 0) + c.y - hb.h / 2,
          z: mob.z + oz,
          w: hb.w,
          h: hb.h,
          d: hb.d,
          yaw,
        };
      }, { physical: true, ref: mob });
      this.hitboxIds.mobs.set(mob, id);
    }
  }

  /** Хитбоксы лежащих на земле предметов */
  syncPickupHitboxes() {
    for (const p of this.world.pickups) {
      if (this.hitboxIds.pickups.has(p)) continue;
      const pos = p.mesh.position;
      const id = this.hitboxes.registerStatic('pickup',
        { x: pos.x, y: pos.y, z: pos.z, w: 0.5, h: 0.5, d: 0.5 },
        { physical: false, ref: p, enabled: () => !!(p.mesh && p.mesh.parent) });
      this.hitboxIds.pickups.set(p, id);
    }
    for (const [p, id] of this.hitboxIds.pickups) {
      if (!this.world.pickups.includes(p)) {
        this.hitboxes.unregister(id);
        this.hitboxIds.pickups.delete(p);
      }
    }
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
    if (!this.boat) {
      this.buildBoat();
      this.placeBoatNearShore();
    }
    console.log(`[LAST SHORE] высадка: ${best.x.toFixed(1)}, ${best.z.toFixed(1)} · море в ${best.seaDist | 0} м · пляж ${best.sand}/12`);
  }

  /** Светляки: ночью над травой — маленькие тёплые точки, живые и даром */
  buildFireflies() {
    const count = 180;
    const pos = new Float32Array(count * 3);
    const phase = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 40;
      pos[i * 3 + 1] = 0.6 + Math.random() * 3.2;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 40;
      phase[i] = Math.random() * Math.PI * 2;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({
      color: 0xffe6a0, size: 0.14, transparent: true, opacity: 0.9,
      depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true,
    });
    this.fireflies = new THREE.Points(geo, mat);
    this.fireflies.frustumCulled = false;
    this.fireflies.visible = false;
    this.scene.add(this.fireflies);
    this.fireflyPhase = phase;
    this.fireflyClock = 0;
  }

  updateFireflies(dt, night) {
    if (!this.fireflies) return;
    const show = night > 0.35 && !this.underground;
    this.fireflies.visible = show;
    if (!show) return;
    this.fireflyClock += dt;
    const p = this.player.position;
    this.fireflies.position.set(p.x, p.y, p.z);
    this.fireflies.material.opacity = 0.35 + Math.sin(this.fireflyClock * 1.7) * 0.25 + night * 0.35;
    const pos = this.fireflies.geometry.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const ph = this.fireflyPhase[i];
      pos.setX(i, pos.getX(i) + Math.sin(this.fireflyClock * 0.8 + ph) * 0.02);
      pos.setY(i, pos.getY(i) + Math.cos(this.fireflyClock * 1.1 + ph) * 0.014);
      pos.setZ(i, pos.getZ(i) + Math.cos(this.fireflyClock * 0.7 + ph) * 0.02);
    }
    pos.needsUpdate = true;
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
      // F9: курсор был отпущен — первый клик только возвращает обзор, без удара
      if (this.cursorFree) {
        this.captureCursor();
        e.preventDefault();
        return;
      }
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
      if (this.cursorFree) return;
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
      if (this.locked) {
        this.lockErrors = 0;
        this.cursorFree = false;
        this.ui.setCursorFree?.(false);
      }

      // курсор отпустили специально, чтобы кликать по крафту/сумке
      if (!this.locked && this.panelUnlock) {
        this.panelUnlock = false;
        return;
      }
      if (wasLocked && !this.locked && this.running && !this.paused && !this.dead && !this.cursorFree) {
        this.pause();
      }
    });
    document.addEventListener('pointerlockerror', () => {
      // браузер не даёт захватить мышь сразу после Esc/F9 — пробуем ещё раз,
      // и только если не вышло дважды, включаем обзор «зажми ЛКМ и веди»
      this.lockErrors = (this.lockErrors || 0) + 1;
      if (this.cursorFree) {
        // пока курсор отпущен, ошибка захвата ни на что не влияет
        return;
      }
      if (this.lockErrors <= 2) {
        clearTimeout(this._lockRetry);
        this._lockRetry = setTimeout(() => {
          if (!this.locked && !this.cursorFree && this.running && !this.paused) this.tryLock(true);
        }, 1200);
        return;
      }
      this.fallbackLook();
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

  tryLock(force = false) {
    // dragLook — режим обзора «зажми ЛКМ»; F9 может принудительно попробовать захват
    if (this.dragLook && !force) return;
    try {
      const p = this.canvas.requestPointerLock?.();
      if (p && typeof p.catch === 'function') p.catch(() => this.fallbackLook());
    } catch (err) {
      this.fallbackLook();
      return;
    }
    // некоторые браузеры просто игнорируют запрос (например, в iframe)
    setTimeout(() => {
      if (!this.locked && this.running && !this.paused && !this.cursorFree) this.fallbackLook();
    }, 900);
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
      if (this.cursorFree) {
        this.captureCursor();
        return;
      }
      if (this.running && !this.paused) this.pause();
      return;
    }

    // F8 и F9 работают и на паузе: это служебные клавиши
    if (code === 'F8') {
      e.preventDefault();
      if (this.running) this.toggleBot();
      return;
    }
    if (code === 'F9') {
      e.preventDefault();
      if (this.running) this.toggleCursor();
      return;
    }

    if (!this.running || this.paused) return;

    switch (code) {
      case 'KeyW': case 'ArrowUp': this.input.forward = true; break;
      case 'KeyS': case 'ArrowDown': this.input.back = true; break;
      case 'KeyA': case 'ArrowLeft': this.input.left = true; break;
      case 'KeyD': case 'ArrowRight': this.input.right = true; break;
      case 'ShiftLeft': case 'ShiftRight': this.input.sprint = true; break;
      case 'Space':
        // jump — одиночный импульс прыжка, jumpHeld — «клавиша зажата» для полёта
        this.jumpRepeat = e.repeat;
        this.input.jump = true;
        this.input.jumpHeld = true;
        e.preventDefault();
        break;
      case 'KeyE': this.interact(); break;
      case 'KeyF':
        if (this.creativeArmed) {
          this.creativeArmed = false;
          this.toggleCreative();
          break;
        }
        if (this.debugArmed) {
          this.debugArmed = false;
          const on = this.mobs.toggleHitboxes();
          this.hitboxes.setDebug(on);
          if (!on) this.hitboxes.clearDebug();
          this.ui.toast(on
            ? `Хитбоксы включены: ${this.hitboxes.stats().models} моделей, ${this.hitboxes.stats().parts} частей тела`
            : 'Хитбоксы выключены');
          this.audio.uiClick();
        } else {
          this.placeSelected();
        }
        break;
      case 'KeyX':
        // выход из шахты в любой точке
        if (this.underground) this.exitMine();
        break;
      case 'KeyG':
        // на поверхности: если под прицелом пробита пустота — спускаемся в шахту
        if (!this.underground) {
          const t = this.aim && this.aim.target;
          const pt = t && t.kind === 'ground' ? t.point : this.player.position;
          const pr = this.world.probeAt(pt.x, pt.z);
          if (pr.layer !== 'void') {
            this.ui.toast('Ход в шахту ещё не пробит: копай вниз (земля → камень → пустота)', true);
            break;
          }
          const spot = this.mine.enterNear(pt.x, pt.z, 0);
          this.underground = true;
          this.mineLight.visible = true;
          this.player.setPosition(spot.x, spot.z, this.mineWorld);
          this.player.position.y = this.mine.floorAt(spot.x, spot.z);
          this.player.applyCamera(this.camera, this.mineWorld, 1);
          this.audio.stoneBreak?.();
          this.spawnChips(spot.x, spot.y + 0.6, spot.z, { count: 18, color: 0x8f8a80, size: 0.09, spread: 2.6, up: 2.6 });
          this.ui.toast('Ты спустился по своему ходу в каменный слой шахты');
          this.save();
          break;
        }
        if (!this.creative) {
          const tool = this.equippedTool();
          if (!tool || !(tool.mine > 1.5)) {
            this.ui.toast('Копать вглубь — только киркой', true);
            break;
          }
        }
        {
          const spot = this.mine.digDown();
          if (!spot) {
            this.ui.toast('Глубже уже не пробиться', true);
            break;
          }
          this.player.setPosition(spot.x, spot.z, this.mineWorld);
          this.player.position.y = this.mine.floorAt(spot.x, spot.z);
          this.player.applyCamera(this.camera, this.mineWorld, 1);
          this.audio.stoneBreak?.();
          this.spawnChips(spot.x, spot.y + 0.6, spot.z, { count: 16, color: 0x9a958c, size: 0.08, spread: 2.4, up: 2.4 });
          this.ui.toast(`Новый слой: −${Math.abs(this.mine.level.y) | 0} м. Жил здесь больше.`);
          this.save();
        }
        break;
      case 'KeyR':
        // вниз по лестнице: глубинный слой с магмой
        if (!this.underground) break;
        if (!this.mine.nearLadder(this.player.position, 3.2)) {
          this.ui.toast('Спуск глубже — только у лестницы (жёлтая метка)', true);
          break;
        }
        this.descendMine();
        break;
      case 'F2':
        e.preventDefault();
        this.creativeArmed = true;
        this.ui.toast('Креатив: нажми F — включить/выключить режим');
        break;
      case 'F3':
        e.preventDefault();
        this.debugArmed = true;
        this.ui.toast('Отладка: F — хитбоксы, Ж — обводки моделей (невидимые треугольники)');
        break;
      // Ж на клавиатуре — та же клавиша, что «;» в латинской раскладке
      case 'Semicolon':
      case 'KeyZ': {
        if (!this.debugArmed) break;
        e.preventDefault();
        this.debugArmed = false;
        const on = this.world.shells.toggle();
        this.ui.toast(on
          ? `Обводки включены: ${this.world.shells.stats.prisms} моделей, ${this.world.shells.stats.triangles} треугольников — сквозь них не пройти`
          : 'Обводки выключены (F3 → Ж — снова показать)');
        break;
      }
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
      case 'ShiftLeft': case 'ShiftRight': this.input.sprint = false; this.input.altHeld = false; break;
      case 'Space': this.input.jumpHeld = false; this.input.jump = false; break;
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
    this.ui.setAir(this.player.air, false);
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
    if (!continueSave) {
      setTimeout(() => {
        this.ui.toast('В горах — арки с дымкой: это вход в шахту. Там руда, кристаллы и обсидиан.');
      }, 4000);
    }
  }

  pause() {
    if (!this.running || this.dead) return;
    this.paused = true;
    // на паузе курсор всегда обычный: иначе после «Продолжить» обзор не вернётся
    this.cursorFree = false;
    this.ui.setCursorFree?.(false);
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

  // ------------------------------------------------------------
  //  Креатив (F2 → F)
  // ------------------------------------------------------------

  toggleCreative() {
    this.creative = !this.creative;
    this.player.fly = this.creative;
    // при выходе из полёта не тащим вниз остаток вертикальной скорости
    this.player.velocity.y = 0;
    this.player.flyT = 0;
    this.ui.setCreative(this.creative);
    this.audio.uiClick?.();

    if (this.creative) {
      // всё под рукой и бесконечно
      for (const id of Object.keys(ITEMS)) {
        this.state.inventory[id] = Math.max(this.state.inventory[id] || 0, 999);
      }
      this.wounds = [];
      this.ui.setWounds([]);
      this.state.health = 100;
      this.state.thirst = 100;
      this.state.hunger = 100;
      this.state.warmth = 100;
      this.refreshHotbar();
      this.ui.renderBag(this.state.inventory, this.state.hotbar);
      this.ui.toast('Креатив: ∞ предметы, полёт (Space — вверх, Shift — вниз), мгновенная добыча');
    } else {
      this.state.health = 100;
      this.ui.toast('Креатив выключен: снова выживание');
    }
    this.player.setEquipped(this.equippedId());
    this.save();
  }

  // ------------------------------------------------------------
  //  Копание земли: один слой за удар, песок осыпается, вода заливает
  // ------------------------------------------------------------

  /** Сила копания: лопата быстрее, руками медленно, в креативе — сразу */
  digPower() {
    if (this.creative) return 99;
    const tool = this.equippedTool();
    if (tool && tool.dig) return tool.dig;
    return 0.9;           // руками: медленно, но можно
  }

  /** Кирка в руках? Без неё каменный слой не берётся */
  digMinePower() {
    if (this.creative) return 99;
    const tool = this.equippedTool();
    return tool && tool.mine ? tool.mine : 0;
  }

  /** Снять слой земли под прицелом: земля → песок → камень → пустота шахты */
  digGroundAt(point) {
    const w = this.world;
    const probe = w.probeAt(point.x, point.z);
    const power = this.digPower();
    const minePower = this.digMinePower();

    // под землёй уже пустота — предлагаем спуститься в шахту
    if (probe.layer === 'void') {
      this.ui.toast('Дальше пустота — это ход в шахту. Нажми G, чтобы спуститься', true);
      this.audio.rustle?.();
      return;
    }

    // камень руками не взять — только киркой, и у каждой породы свой порог
    if (probe.layer === 'stone' && minePower < (probe.needMine || 1.5)) {
      const rockName = probe.rockName || 'камень';
      this.ui.toast(`${rockName} не поддаётся — нужна кирка крепче (прочность ${(probe.needMine || 1.5).toFixed(1)}). Тут уже начинаются шахты`, true);
      this.audio.stoneCrack?.();
      this.spawnChips(point.x, point.y + 0.15, point.z, {
        count: 5, color: 0x8b8478, size: 0.05, spread: 1.0, up: 1.4,
      });
      return;
    }

    if (power < 2 && probe.layer !== 'stone' && Math.random() < 0.45) {
      // руками: первый удар только рыхлит
      this.spawnChips(point.x, point.y + 0.15, point.z, {
        count: 4, color: probe.layer === 'sand' ? 0xdfcb95 : 0x7d6544, size: 0.05, spread: 1.1, up: 1.2,
      });
      this.audio.rustle?.();
      this.ui.toast('Разрыхлил землю — ещё удар', true);
      return;
    }

    // ступени в яме разворачиваются туда, где стоит герой
    w.playerPos = this.player.position;
    const res = w.dig(point.x, point.z, {
      radius: power > 2 ? 2.0 : 1.45,
      depth: this.creative ? 0.7 : 0.45,
      mine: minePower,
    });
    if (!res) return;
    if (res.hard) {
      this.ui.toast('Камень не поддаётся — нужна кирка', true);
      this.audio.stoneCrack?.();
      return;
    }

    this.player.shake(0.07);

    // --- обвал: стенка между ямами рухнула, дыры слились в одну ---
    if (res.collapse) {
      this.audio.collapse?.();
      this.player.shake(0.18);
      this.spawnChips(point.x, point.y + 0.1, point.z, {
        count: 22, color: 0x8a7047, size: 0.09, spread: 2.6, up: 2.2,
      });
      this.spawnChips(point.x, point.y + 0.05, point.z, {
        count: 14, color: 0x6f5a3c, size: 0.11, spread: 3.2, up: 1.4,
      });
      this.ui.toast('Стенка обвалилась — ямы соединились в одну', true);
    }

    if (res.stone) {
      // каменный слой: у каждой породы своя прочность, цвет и добыча
      const rock = res.rock || { name: 'Камень', id: 'granite', dust: 0x8f8a80, hard: 1 };
      this.audio.stoneCrack?.();
      this.audio.oreHit?.();
      this.spawnChips(point.x, point.y + 0.2, point.z, {
        count: 10, color: rock.dust, size: 0.07, spread: 1.5, up: 1.7,
      });
      // добыча зависит от породы: гранит даёт камень, базальт — железо,
      // обсидиан — обсидиан и иногда кристалл
      if (rock.id === 'sandstone') {
        this.addItem('stone', 1);
        if (Math.random() < 0.35) this.addItem('sand', 1);
      } else if (rock.id === 'granite') {
        this.addItem('stone', 2);
        if (Math.random() < 0.3) this.addItem('flint', 1);
        if (Math.random() < 0.1) this.addItem('ironOre', 1);
      } else if (rock.id === 'basalt') {
        this.addItem('stone', 1);
        if (Math.random() < 0.4) this.addItem('ironOre', 1);
      } else {
        if (Math.random() < 0.45) this.addItem('obsidian', 1);
        if (Math.random() < 0.18) this.addItem('crystal', 1);
        this.addItem('stone', 1);
      }
      if (res.void) {
        this.ui.toast('Каменный слой пробит: внизу пустота шахты. Нажми G, чтобы спуститься');
        this.audio.stoneBreak?.();
      } else {
        this.ui.toast(`${rock.name} (прочность ${rock.hard.toFixed(1)}): снято ${(res.step ?? res.depth).toFixed(2)} м · до пустоты ${res.stoneLeft.toFixed(1)} м`);
      }
      return;
    }

    this.audio.rustle?.();
    const color = res.layer === 'sand' ? 0xdfcb95 : 0x6f5a3c;
    this.spawnChips(point.x, point.y + 0.2, point.z, { count: 9, color, size: 0.06, spread: 1.6, up: 1.8 });
    if (res.layer === 'sand') this.addItem('sand', 1);
    else if (Math.random() < 0.35) this.addItem('stone', 1);

    if (res.flooded) {
      this.ui.toast('На пляже яма дошла до морской воды — дно заливает. В глубине острова воды нет');
      this.audio.drink?.();
    } else if (res.sandFill > 0.05) {
      this.ui.toast('Песок осыпался в яму — края поплыли');
    } else {
      const name = res.layer === 'sand' ? 'песок' : 'земля';
      const pr2 = w.probeAt(point.x, point.z);
      const hint = pr2.dug < 1.35
        ? `до камня ${(1.35 - pr2.dug).toFixed(1)} м`
        : `до пустоты ${Math.max(0, pr2.cap - pr2.dug).toFixed(1)} м`;
      this.ui.toast(`Снят слой: ${name} · ${res.dug.toFixed(1)} м · ${hint}`);
    }
  }

  // ------------------------------------------------------------
  //  Ранения по частям тела
  // ------------------------------------------------------------

  woundPartLabel(part) {
    if (part.startsWith('head') || part === 'neck') return { label: 'Голова', icon: '🧠' };
    if (part === 'chest' || part === 'belly' || part === 'hip') return { label: 'Торс', icon: '🩹' };
    if (part.startsWith('arm') || part.startsWith('forearm') || part.startsWith('hand') || part.startsWith('shoulder')) {
      return { label: part.endsWith('L') ? 'Левая рука' : 'Правая рука', icon: '💪' };
    }
    return { label: part.endsWith('L') ? 'Левая нога' : 'Правая нога', icon: '🦵' };
  }

  /** Куда пришёлся удар: по хитбоксам ищем ближайшую к зверю часть тела */
  pickWoundPart(source) {
    const parts = this.hitboxes.playerParts(this.player.position, this.player.facing || 0, 0);
    if (!parts.length) return 'chest';
    const sx = source && Number.isFinite(source.x) ? source.x : this.player.position.x + Math.sin(this.player.facing) * 2;
    const sz = source && Number.isFinite(source.z) ? source.z : this.player.position.z + Math.cos(this.player.facing) * 2;
    let best = null;
    let bestD = Infinity;
    for (const p of parts) {
      if (p.id === 'footL' || p.id === 'footR') continue;
      const d = Math.hypot(p.x - sx, p.z - sz) + (p.y < this.player.position.y + 0.9 ? 0.05 : 0);
      if (d < bestD) { bestD = d; best = p.id; }
    }
    // торс чаще остального: зверь бьёт в корпус, а не в мизинец
    if (best && Math.random() < 0.35) return 'chest';
    return best || 'chest';
  }

  addWound(part, severity = 0.55) {
    const existing = this.wounds.find((w) => w.part === part);
    if (existing) {
      existing.severity = Math.min(1, existing.severity + severity * 0.6);
      return existing;
    }
    const info = this.woundPartLabel(part);
    const wound = { part, severity, label: info.label, icon: info.icon, time: 0 };
    this.wounds.push(wound);
    // последствия: рука слабее бьёт, нога медленнее, голова мутная
    if (part.startsWith('thigh') || part.startsWith('shin')) {
      this.player.speedMul = 0.72;
      this.ui.toast('Ранена нога: идёшь медленнее', true);
    } else if (part.startsWith('arm') || part.startsWith('forearm') || part.startsWith('hand')) {
      this.armPenalty = 0.65;
      this.ui.toast('Ранена рука: удары слабее', true);
    } else if (part === 'head' || part === 'neck') {
      this.player.landShake = Math.max(this.player.landShake, 0.6);
      this.ui.toast('Удар в голову: в глазах темнеет', true);
    } else {
      this.ui.toast('Рана в корпус: идёт кровь', true);
    }
    return wound;
  }

  healWound() {
    if (!this.wounds.length) return false;
    this.wounds.sort((a, b) => b.severity - a.severity);
    const w = this.wounds.shift();
    if (w.part.startsWith('thigh') || w.part.startsWith('shin')) this.player.speedMul = 1;
    if (w.part.startsWith('arm') || w.part.startsWith('forearm') || w.part.startsWith('hand')) this.armPenalty = 1;
    this.ui.toast(`Перевязано: ${w.label.toLowerCase()}`);
    return true;
  }

  /** Раны заживают и понемногу кровят */
  updateWounds(dt) {
    if (this.creative) {
      if (this.wounds.length) { this.wounds = []; this.ui.setWounds([]); }
      return;
    }
    let bleed = 0;
    for (const w of this.wounds) {
      w.time += dt;
      w.severity = Math.max(0, w.severity - dt * 0.0075);
      bleed += w.severity * 0.22;
    }
    this.wounds = this.wounds.filter((w) => w.severity > 0.02);
    if (!this.wounds.some((w) => w.part.startsWith('thigh') || w.part.startsWith('shin'))) this.player.speedMul = 1;
    if (!this.wounds.some((w) => w.part.startsWith('arm') || w.part.startsWith('forearm') || w.part.startsWith('hand'))) this.armPenalty = 1;
    if (bleed > 0) this.state.health = Math.max(0, this.state.health - bleed * dt);
    this.ui.setWounds(this.wounds.map((w) => ({ part: w.part, label: w.label, severity: w.severity, icon: w.icon })));
  }

  // ------------------------------------------------------------
  //  Подземелье
  // ------------------------------------------------------------

  /** Войти в шахту через арку на поверхности */
  enterMine(entrance) {
    const spot = this.mine.enter(0, entrance || this.aim?.entrance || null);
    this.underground = true;
    this.mineLight.visible = true;
    this.player.setPosition(spot.x, spot.z, this.mineWorld);
    this.player.position.y = this.mine.floorAt(spot.x, spot.z);
    this.player.pitch = 0.04;
    this.player.applyCamera(this.camera, this.mineWorld, 1);
    this.audio.mineEnter?.() || this.audio.rustle?.();
    this.ui.toast('Ты в шахте. Каменный слой: руда, жилы, темнота. Кирка обязательна.');
    this.save();
  }

  /** Выйти на поверхность */
  exitMine() {
    const spot = this.mine.leave();
    this.underground = false;
    this.mineLight.visible = false;
    this.player.setPosition(spot.x, spot.z, this.world);
    this.player.applyCamera(this.camera, this.world, 1);
    this.audio.pickup?.();
    this.ui.toast('Снова наверху. Свет, ветер, чайки.');
    this.save();
  }

  /** Спуститься на слой ниже — туда, где магма и драгоценные жилы */
  descendMine() {
    if (this.mine.active === null) return;
    if (!this.mine.hasDeeper()) {
      this.ui.toast('Ниже пока нет хода — копай вглубь (G) киркой', true);
      return;
    }
    const spot = this.mine.switchLevel(1);
    if (!spot) return;
    this.player.setPosition(spot.x, spot.z, this.mineWorld);
    this.player.position.y = this.mine.floorAt(spot.x, spot.z);
    this.player.applyCamera(this.camera, this.mineWorld, 1);
    this.audio.stoneCrack?.();
    this.ui.toast(`Ниже: −${Math.abs(this.mine.level.y) | 0} м, жар и жилы`);
    this.save();
  }

  /** Подняться на слой выше (из глубины — в камень) */
  ascendMine() {
    if (this.mine.active === null) {
      this.exitMine();
      return;
    }
    if (this.mine.active === 0) {
      this.exitMine();
      return;
    }
    const spot = this.mine.switchLevel(-1);
    if (!spot) return;
    this.player.setPosition(spot.x, spot.z, this.mineWorld);
    this.player.position.y = this.mine.floorAt(spot.x, spot.z);
    this.player.applyCamera(this.camera, this.mineWorld, 1);
    this.ui.toast(`Выше: −${Math.abs(this.mine.level.y) | 0} м`);
  }

  // ------------------------------------------------------------
  //  Верстак и точильный станок
  // ------------------------------------------------------------

  placeStation(type) {
    const id = type === 'grind' ? 'grindstone' : 'workbench';
    if ((this.state.inventory[id] || 0) <= 0) {
      this.ui.toast(`Сначала сделай: ${ITEMS[id].name} (C)`, true);
      return;
    }
    const p = this.player.position;
    const x = p.x + Math.sin(this.player.facing) * 1.9;
    const z = p.z + Math.cos(this.player.facing) * 1.9;
    if (this.underground) {
      this.ui.toast('Под землёй ставить некуда — поднимись наверх', true);
      return;
    }
    const h = this.world.heightAt(x, z);
    if (h < 0.45) {
      this.ui.toast('В воде станок не поставить', true);
      return;
    }
    // под станком выравниваем площадку: он должен стоять на ровном
    const flatY = this.world.levelSpot(x, z, 1.7, h);
    this.takeItem(id, 1);
    const group = type === 'grind' ? buildGrindstone() : buildWorkbench();
    group.position.set(x, flatY, z);
    group.rotation.y = -this.player.facing + Math.PI / 2;
    group.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    this.scene.add(group);
    const station = { type, x, y: flatY, z, group };
    this.stations.push(station);
    this.world.colliders.push({ x, z, r: 0.95, height: 1.1, kind: 'station' });
    station.hitboxId = this.hitboxes.registerStatic('station',
      { x: station.x, y: station.y, z: station.z, w: 1.5, h: 1.15, d: 0.9 },
      { physical: true, ref: station });
    this.audio.craft?.();
    this.ui.toast(`${ITEMS[id].name} поставлен · E — работать`);
    if (this.equippedId() === id && (this.state.inventory[id] || 0) === 0) this.player.setEquipped(null);
    this.save();
  }

  openStation(station) {
    if (!this.running || this.paused || this.dead) return;
    this.ws.mode = station.type === 'grind' ? 'grind' : 'forge';
    this.ws.station = station;
    if (document.pointerLockElement) {
      this.panelUnlock = true;
      document.exitPointerLock();
    }
    this.ui.toggleWorkshop(true);
    this.renderWorkshop();
    this.audio.uiClick?.();
  }

  renderWorkshop() {
    const inv = this.state.inventory;
    const tools = Object.values(ITEMS)
      .filter((def) => def.forged && (inv[def.id] || 0) > 0)
      .map((def) => ({
        def,
        dmg: effectiveWeapon(def).toFixed(0),
        can: canSharpen(def) && (inv.stone || 0) > 0,
      }));

    this.ui.renderWorkshop({
      mode: this.ws.mode,
      forms: Object.values(FORMS),
      materials: Object.values(MATERIALS),
      materialsDef: MATERIALS,
      inv,
      form: this.ws.form,
      mat: this.ws.mat,
      tools,
      onPick: (kind, id) => {
        if (kind === 'form') this.ws.form = id;
        else this.ws.mat = id;
        this.renderWorkshop();
      },
      onForge: () => this.forgeItem(),
      onSharpen: (id) => this.sharpenItem(id),
    });
  }

  forgeItem() {
    const cost = forgeCost(this.ws.form, this.ws.mat);
    const inv = this.state.inventory;
    for (const [id, n] of Object.entries(cost)) {
      if ((inv[id] || 0) < n) {
        this.ui.toast(`Не хватает: ${ITEMS[id]?.name || id}`, true);
        return;
      }
    }
    for (const [id, n] of Object.entries(cost)) this.takeItem(id, n);
    const def = forge(this.ws.form, this.ws.mat, (Date.now() ^ (Math.random() * 1e9)) >>> 0);
    this.forged[def.id] = {
      id: def.id, form: def.form, mat: def.mat, name: def.name,
      quality: def.quality, roll: def.roll, tool: def.tool,
      sharp: def.sharp, tuned: def.tuned, icon: def.icon,
    };
    this.addItem(def.id, 1);
    this.audio.craft?.();
    this.audio.hammer?.() || this.audio.stoneCrack?.();
    this.player.shake(0.08);
    this.spawnChips(this.player.position.x, this.player.position.y + 1.1, this.player.position.z,
      { count: 10, color: 0xffd08a, size: 0.05, spread: 1.6, up: 2.2 });
    this.ui.toast(`Выковано: ${def.name} · урон ${def.tool.weapon} · не заточено`);
    this.ui._lastCraftSig = '';
    this.renderWorkshop();
    this.refreshBag();
    this.save();
  }

  sharpenItem(id) {
    const def = ITEMS[id];
    if (!def) return;
    if ((this.state.inventory.stone || 0) <= 0) {
      this.ui.toast('Нужен камень для точила', true);
      return;
    }
    const res = sharpen(def);
    if (!res.ok) {
      this.ui.toast(res.text, true);
      return;
    }
    this.takeItem('stone', 1);
    if (this.forged[id]) {
      this.forged[id].sharp = def.sharp;
      this.forged[id].tuned = def.tuned;
    }
    this.audio.grind?.() || this.audio.stoneCrack?.();
    const p = this.player.position;
    this.spawnChips(p.x, p.y + 1.0, p.z, { count: 8, color: 0xffc46a, size: 0.04, spread: 1.2, up: 1.8 });
    this.ui.toast(res.text);
    this.player.setEquipped(this.equippedId());
    this.renderWorkshop();
    this.save();
  }

  // ------------------------------------------------------------
  //  Прицел в центре экрана: всё, что делаем, делаем по нему
  // ------------------------------------------------------------

  _raySphere(origin, dir, p, r) {
    const ox = origin.x - p.x;
    const oy = origin.y - p.y;
    const oz = origin.z - p.z;
    const b = ox * dir.x + oy * dir.y + oz * dir.z;
    const c = ox * ox + oy * oy + oz * oz - r * r;
    const disc = b * b - c;
    if (disc < 0) return null;
    const t = -b - Math.sqrt(disc);
    return t > 0.15 ? t : null;
  }

  /** Пересчитать цель под прицелом: луч идёт по хитбоксам моделей */
  computeAim() {
    const cam = this.camera;
    cam.updateMatrixWorld();
    const dir = new THREE.Vector3();
    cam.getWorldDirection(dir);
    const origin = cam.position.clone();
    const reach = 6.5;
    const aim = { dir, origin, target: null, t: reach, entrance: null };

    const apply = (kind, dist, data) => {
      if (dist === null || dist === undefined || dist > reach || dist >= aim.t) return;
      aim.t = dist;
      aim.target = { kind, t: dist, ...data };
    };

    if (this.underground) {
      // стены шахты и лестница
      const probe = this.mine.probe(origin, dir.x, dir.z, Math.min(reach, 4.2));
      if (probe) apply('minewall', probe.dist, { probe });
      const lvl = this.mine.level;
      if (lvl && lvl.lightPos) {
        const t = this._raySphere(origin, dir, { x: lvl.lightPos.x, y: lvl.y + 1.4, z: lvl.lightPos.z }, 1.2);
        apply('ladder', t, { ladder: lvl.lightPos });
      }
      aim.underground = true;
      this.aim = aim;
      return aim;
    }

    // земля под прицелом: один слой можно снять руками или лопатой
    const ground = this._aimGround(origin, dir, 3.6);
    if (ground) apply('ground', ground.t, { point: ground.point });

    // всё остальное — по невидимым хитбоксам моделей
    const hit = this.hitboxes.raycast(origin, dir, reach);
    if (hit) {
      switch (hit.kind) {
        case 'mob': apply('mob', hit.dist, { mob: hit.ref }); break;
        case 'tree':
        case 'palm':
        case 'rock':
        case 'bush':
          apply('node', hit.dist, { node: hit.ref });
          break;
        case 'station': apply('station', hit.dist, { station: hit.ref }); break;
        case 'fire': apply('campfire', hit.dist, { fire: hit.ref }); break;
        case 'spring': apply('spring', hit.dist, { spring: hit.ref }); break;
        case 'mine':
          apply('entrance', hit.dist, { entrance: hit.ref });
          aim.entrance = hit.ref;
          break;
        case 'pickup': apply('pickup', hit.dist, { pickup: hit.ref }); break;
        default: break;
      }
    }

    this.aim = aim;
    return aim;
  }

  /** Пересечение луча с рельефом (шагами по высоте) */
  _aimGround(origin, dir, reach = 3.6) {
    if (this.underground) return null;
    for (let d = 0.5; d <= reach; d += 0.22) {
      const x = origin.x + dir.x * d;
      const z = origin.z + dir.z * d;
      const y = origin.y + dir.y * d;
      const h = this.world.heightAt(x, z);
      if (y <= h) {
        return { t: d, point: { x, y: h, z } };
      }
    }
    return null;
  }

  /** Что показать в прицеле словами */
  aimPromptHtml() {
    const aim = this.aim;
    if (!aim || !aim.target) {
      return this.underground
        ? '<span class="prompt-dim">Прицелься в стену и бей киркой</span>'
        : null;
    }
    const t = aim.target;
    switch (t.kind) {
      case 'minewall': {
        const type = t.probe.type;
        const names = { stone: 'порода', ore: 'железная жила', crystal: 'кристальная жила', obsidian: 'обсидиановая жила' };
        return `<b>ЛКМ</b> — ${names[type] || 'порода'}${type === 'stone' ? '' : ' <span class="prompt-warn">ценная</span>'}`;
      }
      case 'ladder':
        return '<b>E</b> — на слой выше · <b>R</b> — вниз · <b>G</b> — копать глубже · <b>X</b> — выход';
      case 'entrance':
        return '<b>E</b> — спуститься в шахту';
      case 'mob':
        return `<b>ЛКМ</b> — ${t.mob.def.label.toLowerCase()} <span class="prompt-warn">${Math.max(0, Math.round(t.mob.hp))}/${t.mob.maxHp}</span>`;
      case 'node': {
        const node = t.node;
        const def = this.nodeDef(node);
        if (node.type === 'bush' && this.resources.canPickBerries(node)) return '<b>E</b> или <b>ЛКМ</b> — собрать ягоды';
        return `<b>ЛКМ</b> — ${def.label.toLowerCase()}${def.need ? ` (нужен ${def.need})` : ''}`;
      }
      case 'campfire': {
        const pct = Math.round((t.fire.fuel / t.fire.maxFuel) * 100);
        return `<b>E</b> — подложить палки (огонь ${pct}%)`;
      }
      case 'spring':
        return '<b>E</b> — попить из родника';
      case 'station':
        return t.station.type === 'grind'
          ? '<b>E</b> — точить кованое'
          : '<b>E</b> — верстак: ковать';
      case 'ground': {
        const layer = this.world.layerAt(t.point.x, t.point.z);
        const tool = this.equippedTool();
        const fast = this.creative || (tool && tool.dig);
        const name = layer === 'sand' ? 'песок' : layer === 'stone' ? 'камень' : 'земля';
        return `<b>ЛКМ</b> — копать ${name} ${fast ? '' : '· <span class="prompt-warn">руками медленно</span>'}`;
      }
      case 'pickup':
        return `<b>E</b> — подобрать ${t.pickup.name.toLowerCase()}`;
      default:
        return null;
    }
  }

  /** Где нарисовать кольцо-подсветку под целью */
  aimMarkerPos() {
    const aim = this.aim;
    if (!aim || !aim.target) return null;
    const t = aim.target;
    switch (t.kind) {
      case 'minewall':
        return { x: this.mine._worldX(t.probe.cx), z: this.mine._worldZ(t.probe.cz), y: this.mine.level.y };
      case 'ladder': {
        const lvl = this.mine.level;
        return { x: lvl.lightPos.x, z: lvl.lightPos.z, y: lvl.y };
      }
      case 'entrance': return { x: t.entrance.x, z: t.entrance.z, y: t.entrance.y };
      case 'mob': return { x: t.mob.x, z: t.mob.z, y: t.mob.y || 0 };
      case 'node': return { x: t.node.x, z: t.node.z, y: t.node.y };
      case 'campfire': return { x: t.fire.x, z: t.fire.z, y: t.fire.y };
      case 'spring': return { x: t.spring.x, z: t.spring.z, y: t.spring.y };
      case 'station': return { x: t.station.x, z: t.station.z, y: t.station.y };
      case 'ground': return { x: t.point.x, z: t.point.z, y: t.point.y };
      case 'pickup': return { x: t.pickup.mesh.position.x, z: t.pickup.mesh.position.z, y: t.pickup.mesh.position.y };
      default: return null;
    }
  }

  readBars() {
    return {
      health: this.state.health,
      thirst: this.state.thirst,
      hunger: this.state.hunger,
      warmth: this.state.warmth,
      stamina: this.player.stamina,
      air: this.player.air,
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
    if (!id || !ITEMS[id].tool) return null;
    // кованый клинок бьёт по-разному в зависимости от заточки
    return ITEMS[id].forged ? effectiveTool(ITEMS[id]) : ITEMS[id].tool;
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
    if (this.creative) return true;          // креатив ничего не тратит
    if ((this.state.inventory[id] || 0) < count) return false;
    this.state.inventory[id] -= count;
    this.refreshHotbar();
    this.ui.renderBag(this.state.inventory, this.state.hotbar);
    this.ui._lastCraftSig = '';
    return true;
  }

  pickup(target = null) {
    const p = target || this.world.nearestPickup(this.player.position, CONFIG.interact.reach + 0.6);
    if (!p) return false;
    this.addItem(p.kind, 1);
    this.world.removePickup(p);
    this.audio.pickup();
    this.ui.toast(`+ ${p.name}`);
    this.highlight.visible = false;
    return true;
  }

  /** E — действие по прицелу: подобрать, попить, войти в шахту, открыть станок */
  // ------------------------------------------------------------
  //  Лодка и вода
  // ------------------------------------------------------------

  /** Высота волны в точке — по ней качается лодка */
  waveAt(x, z, t = this.world.time) {
    return Math.sin(x * 0.32 + t * 1.15) * 0.14 + Math.sin(z * 0.24 - t * 0.85) * 0.09;
  }

  buildBoat() {
    const built = makeBoat();
    built.group.visible = false;
    this.scene.add(built.group);
    this.boat = {
      group: built.group,
      parts: built.parts,
      x: 0, z: 0, y: 0, heading: 0, speed: 0, wave: 0,
      placed: false,
    };
  }

  /** Поставить лодку на воду у берега рядом с местом высадки */
  placeBoatNearShore() {
    const w = this.world;
    const p = this.player.position;
    let best = null;
    for (let r = 8; r <= 70 && !best; r += 2) {
      for (let i = 0; i < 28 && !best; i++) {
        const a = (i / 28) * Math.PI * 2;
        const x = p.x + Math.cos(a) * r;
        const z = p.z + Math.sin(a) * r;
        const h = w.heightAt(x, z);
        if (h > -1.4 || h < -5) continue;         // нужна вода от метра глубиной
        let shore = false;                        // и берег неподалёку
        for (let j = 0; j < 8; j++) {
          const aa = (j / 8) * Math.PI * 2;
          if (w.heightAt(x + Math.cos(aa) * 4.5, z + Math.sin(aa) * 4.5) > -0.15) shore = true;
        }
        if (shore) best = { x, z };
      }
    }
    if (!best) {
      for (let r = 10; r <= 120 && !best; r += 4) {
        for (let i = 0; i < 20 && !best; i++) {
          const a = (i / 20) * Math.PI * 2;
          const x = p.x + Math.cos(a) * r;
          const z = p.z + Math.sin(a) * r;
          if (w.heightAt(x, z) < -1.6) best = { x, z };
        }
      }
    }
    const b = this.boat;
    if (!b) return null;
    if (!best) best = { x: p.x, z: p.z };
    b.x = best.x;
    b.z = best.z;
    // Нос — в открытое море: ищем самое глубокое направление вокруг лодки,
    // чтобы первое же движение вперёд уводило от берега, а не в мель.
    let deepA = 0;
    let deepH = Infinity;
    for (let i = 0; i < 24; i++) {
      const a = (i / 24) * Math.PI * 2;
      const hh = w.heightAt(best.x - Math.sin(a) * 10, best.z - Math.cos(a) * 10);
      if (hh < deepH) { deepH = hh; deepA = a; }
    }
    b.heading = deepA;
    b.y = this.waveAt(b.x, b.z);
    b.placed = true;
    b.group.visible = true;
    b.group.position.set(b.x, b.y - 0.1, b.z);
    b.group.rotation.y = b.heading;
    return b;
  }

  /** Физика воды: волны, качка, сопротивление; на сушу лодка не выходит */
  updateBoat(dt) {
    const b = this.boat;
    if (!b || !b.placed) return;
    const t = this.world.time;
    if (this.sailing) {
      const inp = this.input;
      const thrust = (inp.forward ? 1 : 0) - (inp.back ? 1 : 0);
      const turn = (inp.left ? 1 : 0) - (inp.right ? 1 : 0);
      const maxSpeed = inp.sprint ? 10.5 : 6.2;
      b.speed += (thrust * maxSpeed - b.speed) * Math.min(1, dt * 1.4);
      // вода тормозит: без вёсел лодка постепенно встаёт
      b.speed *= Math.max(0, 1 - dt * (thrust ? 0.25 : 0.9));
      b.heading += turn * dt * (0.85 + Math.min(1, Math.abs(b.speed) / 6) * 0.75);

      const dirX = -Math.sin(b.heading);
      const dirZ = -Math.cos(b.heading);
      const nx = b.x + dirX * b.speed * dt;
      const nz = b.z + dirZ * b.speed * dt;
      const ahead = this.world.heightAt(nx, nz);
      if (ahead < -0.6) {
        b.x = nx;
        b.z = nz;
      } else {
        // мель: нос упирается, лодка отходит
        b.speed *= -0.25;
      }
      // лодка не заплывает за край карты
      const lim = CONFIG.world.size * 0.47;
      b.x = Math.max(-lim, Math.min(lim, b.x));
      b.z = Math.max(-lim, Math.min(lim, b.z));
    } else {
      b.speed *= Math.max(0, 1 - dt * 1.6);
    }

    // --- качка на волне ---
    b.wave = this.waveAt(b.x, b.z, t);
    b.group.position.set(b.x, CONFIG.world.seaLevel + b.wave - 0.12, b.z);
    b.group.rotation.y = b.heading + Math.PI / 2;
    b.group.rotation.x = Math.sin(t * 1.35 + b.x * 0.2) * 0.04 - Math.min(0.09, Math.abs(b.speed) * 0.012);
    b.group.rotation.z = Math.sin(t * 1.05 + b.z * 0.25) * 0.05;
    if (b.parts.sail) {
      b.parts.sail.rotation.y = Math.sin(t * 1.7) * 0.12 + (this.sailing ? -0.18 : 0);
      b.parts.sail.scale.x = 0.85 + Math.min(0.3, Math.max(0, b.speed) * 0.03);
    }
    if (b.parts.oar) b.parts.oar.rotation.x = this.sailing ? Math.sin(t * 3.4) * 0.14 : 0;

    // герой стоит на палубе
    if (this.sailing) {
      const p = this.player;
      p.position.set(b.x, CONFIG.world.seaLevel + b.wave + 0.34, b.z);
      p.velocity.set(0, 0, 0);
      p.facing = b.heading;
      p.grounded = true;
      p.model.position.copy(p.position);
      p.model.rotation.y = b.heading;
    }
  }

  /** Сесть в лодку / выйти на берег */
  toggleSailing() {
    const b = this.boat;
    if (!b || !b.placed) return false;
    if (!this.sailing) {
      const d = Math.hypot(this.player.position.x - b.x, this.player.position.z - b.z);
      if (d > 3.2) {
        this.ui.toast('Лодка далеко — подойди к ней ближе', true);
        return false;
      }
      this.sailing = true;
      if (this.player.fly) {
        this.creative = false;
        this.player.fly = false;
        this.ui.setCreative?.(false);
      }
      this.player.model.visible = this.player.viewMode !== 'first';
      this.audio.uiClick?.();
      this.ui.toast('Ты в лодке: W/S — ход, A/D — поворот, Shift — быстрее, E — выйти');
      return true;
    }

    // выход: нужен берег рядом
    let exit = null;
    for (let r = 1.5; r <= 12 && !exit; r += 1.2) {
      for (let i = 0; i < 16 && !exit; i++) {
        const a = (i / 16) * Math.PI * 2;
        const x = b.x + Math.cos(a) * r;
        const z = b.z + Math.sin(a) * r;
        const h = this.world.heightAt(x, z);
        if (h > -0.45 && h < 3.5) exit = { x, z, h };
      }
    }
    if (!exit) {
      this.ui.toast('Кругом глубоко — ищи берег', true);
      return false;
    }
    this.sailing = false;
    b.speed = 0;
    this.player.setPosition(exit.x, exit.z, this.world);
    this.player.model.visible = this.player.viewMode !== 'first';
    this.audio.pickup?.();
    this.ui.toast('Ты сошёл на берег. Лодка ждёт у воды.');
    return true;
  }

  interact() {
    if (!this.running || this.paused || this.dead) return;
    // лодка: рядом — садимся, на лодке — выходим на берег
    const boat = this.boat;
    if (boat && boat.placed) {
      const dBoat = Math.hypot(this.player.position.x - boat.x, this.player.position.z - boat.z);
      if (this.sailing || dBoat < 3.2) {
        this.toggleSailing();
        return;
      }
    }
    const t = this.aim && this.aim.target;
    if (!t) {
      this.ui.toast(this.underground ? 'Наведи прицел на стену или лестницу' : 'Наведи прицел на предмет', true);
      return;
    }

    switch (t.kind) {
      case 'pickup':
        this.pickup(t.pickup);
        return;
      case 'spring': {
        const before = this.state.thirst;
        this.state.thirst = Math.min(100, before + 30);
        this.audio.drink();
        this.ui.toast(before > 99 ? 'Ты не хочешь пить' : 'Родник: +30 жажды');
        return;
      }
      case 'campfire': {
        if ((this.state.inventory.wood || 0) <= 0) {
          this.ui.toast('Нужны палки для костра', true);
          return;
        }
        this.takeItem('wood', 1);
        this.resources.addFuel(t.fire.fire || t.fire, 45);
        this.audio.eat();
        this.ui.toast('Костёр: +45 с огня');
        return;
      }
      case 'node': {
        const node = t.node;
        if (node.type === 'bush' && this.resources.canPickBerries(node)) {
          this.gatherBerries(node);
        } else if (node.type === 'bush') {
          this.ui.toast('Ягоды ещё не поспели — подожди немного', true);
        } else {
          this.ui.toast('Добывай ударами: зажми левую кнопку мыши', true);
        }
        return;
      }
      case 'station':
        this.openStation(t.station);
        return;
      case 'entrance':
        this.enterMine(t.entrance);
        return;
      case 'ladder':
        this.ascendMine();
        return;
      case 'minewall':
        this.ui.toast('Стену не открыть руками: нужна кирка (ЛКМ)', true);
        return;
      default:
        this.ui.toast('Здесь нечего делать', true);
    }
  }

  /** ЛКМ: удар строго по прицелу — по зверю, дереву, камню или стене шахты */
  attack() {
    if (!this.running || this.paused || this.dead) return;
    if (this.attackCooldown > 0) return;

    const toolId = this.equippedId();
    const def = toolId ? ITEMS[toolId] : null;
    const ranged = def && def.ranged;
    const target = this.aim && this.aim.target;
    const kindName = target ? target.kind : 'air';

    // замах и скорость удара зависят от того, во что целимся
    let swing = 'attack';
    if (kindName === 'minewall') swing = 'mine';
    else if (kindName === 'ground') swing = 'gather';
    else if (kindName === 'node') swing = target.node.type === 'rock' ? 'mine' : 'chop';
    this.player.swing(swing);
    this.attackCooldown = swing === 'mine' ? 0.7 : swing === 'chop' ? 0.66 : 0.62;

    if (ranged) {
      this.audio.swing?.();
      this.shootArrow();
      return;
    }
    this.audio.swing?.();

    if (!target) {
      this.audio.whoosh?.();
      return;
    }

    // --- земля: снимаем слой ---
    if (target.kind === 'ground') {
      if (this.digCooldown > 0) return;
      this.digCooldown = this.creative ? 0.12 : this.equippedTool()?.dig ? 0.42 : 0.62;
      this.digGroundAt(target.point);
      return;
    }

    // --- стена шахты: пробиваем клетку и получаем руду ---
    if (target.kind === 'minewall') {
      const tool = this.equippedTool() || {};
      const power = this.creative ? 99 : tool.mine !== undefined ? tool.mine : 0.25;
      const aimDir = this.aim && this.aim.dir;
      const dx = aimDir ? aimDir.x : Math.sin(this.player.facing);
      const dz = aimDir ? aimDir.z : Math.cos(this.player.facing);
      const res = this.mine.strike(this.player.position, dx, dz, power, 3.4);
      const probe = target.probe;
      const pos = { x: this.mine._worldX(probe.cx), z: this.mine._worldZ(probe.cz), y: this.mine.level.y + 1.2 };
      const color = probe.type === 'crystal' ? 0x62e6d8
        : probe.type === 'obsidian' ? 0xa16ff0
          : probe.type === 'ore' ? 0x9fc4d4 : 0x9a958c;
      this.spawnChips(pos.x, pos.y, pos.z, { count: 8, color, size: 0.07, spread: 1.8, up: 2.2 });
      this.player.shake(0.16);
      this.audio.stoneCrack?.();
      if (power < 0.5) this.ui.toast('Без кирки порода почти не поддаётся', true);

      if (res && res.broken) {
        this.audio.stoneBreak?.();
        this.spawnChips(pos.x, pos.y, pos.z, { count: 14, color, size: 0.08, spread: 2.6, up: 2.6 });
        const parts = [];
        for (const [id, n] of Object.entries(res.drops)) {
          this.addItem(id, n);
          parts.push(`${ITEMS[id].name} +${n}`);
        }
        if (parts.length) this.ui.toast(`Из жилы: ${parts.join(', ')}`);
        else this.ui.toast('Порода пробита — пусто');
        this.audio.pickup?.();
      }
      return;
    }

    // --- зверь ---
    if (target.kind === 'mob') {
      const m = target.mob;
      const weapon = (def ? effectiveWeapon(def) : 4) * (this.armPenalty || 1);
      // луч прицела точнее веера: бьём именно того, на кого смотрим
      const got = this.mobs.hitAt(m, weapon);
      if (!got) { this.audio.whoosh?.(); return; }
      const killed = got.killed;
      this.audio.hitFlesh?.();
      this.player.shake(0.18);
      this.spawnChips(m.x, (m.y || 0) + 0.9, m.z, { count: 5, color: 0x9c2c3c, size: 0.06, spread: 1.4, up: 1.6 });
      if (killed) {
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

    // --- узел: дерево, камень, куст ---
    if (target.kind === 'node') {
      const node = target.node;
      if (node.type === 'bush' && this.resources.canPickBerries(node)) {
        this.gatherBerries(node);
        this.attackCooldown = 0.6;
        return;
      }
      const tool = this.creative ? { chop: 99, mine: 99, weapon: 99 } : this.equippedTool();
      const res = this.resources.strike(node, tool);
      const actionDef = this.nodeDef(node);
      const power = tool && tool[actionDef.tool ?? 'chop'] !== undefined ? tool[actionDef.tool ?? 'chop'] : 0.35;
      if (res.need && (!tool || power < 1)) this.ui.toast(`Нужен ${res.need}: так почти не выходит`, true);

      const hitY = node.y + (node.type === 'tree' || node.type === 'palm' ? 1.1 : 0.7);
      if (node.type === 'rock') {
        this.player.shake(0.14);
        this.spawnChips(node.x, hitY, node.z, { count: 7, color: node.ore ? 0x8fc9d8 : 0x9a958c, size: 0.06, spread: 1.8, up: 2.0 });
        if (node.ore) this.audio.oreHit?.(); else this.audio.mine?.();
        this.audio.stoneCrack?.();
      } else {
        this.player.shake(0.08);
        this.spawnChips(node.x, hitY, node.z, { count: 6, color: 0x8a6a42, size: 0.06, spread: 1.5, up: 2.0 });
        this.spawnChips(node.x, hitY + 0.2, node.z, { count: 3, color: 0x5f9150, size: 0.05, spread: 1.2, up: 1.4 });
        this.audio.chop?.();
      }

      if (res.depleted) {
        const parts = [];
        for (const [id, n] of Object.entries(res.drops)) {
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
      return;
    }

    this.audio.whoosh?.();
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

  /** F — поставить то, что держим: костёр, верстак или точило */
  placeSelected() {
    const id = this.equippedId();
    if (id === 'workbench') this.placeStation('bench');
    else if (id === 'grindstone') this.placeStation('grind');
    else this.placeCampfire();
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
    // костёр тоже ставим на ровную площадку, а не на косогор
    this.world.levelSpot(x, z, 1.6, h);
    this.takeItem('campfireKit', 1);
    const fire = this.resources.addCampfire(x, z);
    this.resources.addFuel(fire, 90);
    this.hitboxes.registerStatic('fire', { x: fire.x, y: fire.y, z: fire.z, w: 1.2, h: 0.9, d: 1.2 }, { ref: fire, physical: false });
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
    if (kind === 'bandage') this.healWound();
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
    // под землёй физика другая: клетки шахты вместо рельефа острова
    if (this.sailing) {
      // на лодке физика воды: герой стоит на палубе, идёт волна и качка
      const idle = { forward: false, back: false, left: false, right: false, sprint: false, jump: false, jumpHeld: false };
      this.player.update(dt, idle, this.mineWorld);
    } else {
      this.player.update(dt, this.input, this.mineWorld);
    }
    this.updateBoat(dt);
    // сбрасываем только импульс прыжка: «пробел зажат» (input.jumpHeld) живёт до keyup
    this.input.jump = false;

    // сквозь зверей не пройти: расталкиваем игрока и зверя
    if (!this.underground) {
      this.mobs.resolvePlayer(this.player.position, this.player.velocity, CONFIG.player.radius);
    }
    // ни одна часть тела не влезает в чужую модель: разводим хитбоксы
    this.hitboxes.resolvePlayer(this.player, this.mineWorld, { mobs: this.mobs });
    this.player.applyCamera(this.camera, this.mineWorld, dt);
    this.computeAim();

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

    // под водой: свет гаснет с глубиной, дальний план тонет в сине-зелёной мгле
    if (this.player && this.player.underwater) {
      const d = Math.max(0, CONFIG.world.seaLevel - (this.player.position.y + 1.6));
      const murk = Math.min(1, 0.35 + d * 0.16);
      this.sky.sun.intensity *= 1 - murk * 0.72;
      this.sky.hemi.intensity *= 1 - murk * 0.5;
      // без этого герой и дно под водой остаются «солнечно-яркими»
      this.sky.ambient.intensity *= 1 - murk * 0.45;
      this.scene.fog.color.setRGB(0.05 + 0.02 * (1 - murk), 0.22 - 0.06 * murk, 0.3 - 0.04 * murk);
      this.scene.fog.near = 0.35;
      this.scene.fog.far = Math.max(7, 30 - d * 3.8);
      // поверхность воды снизу светится тем же цветом, что и мгла
      this.world.waterUniforms.uFog.value.copy(this.scene.fog.color);
    } else if (this.player && this.player.swimming) {
      // у самой поверхности вода чуть подсвечена снизу
      this.scene.fog.color.lerp(new THREE.Color(0x2f7f96), 0.35);
    }

    // под землёй солнце не достаёт: остаётся только фонарь в руке
    if (this.underground) {
      this.sky.sun.intensity *= 0.06;
      this.sky.hemi.intensity *= 0.14;
      this.scene.fog.color.setHex(0x0b0d10);
      this.scene.fog.near = 2;
      this.scene.fog.far = 26;
    }
    this.world.update(dt, this.camera, skyInfo.sunDir, skyInfo.night, skyInfo.fogColor);
    this.world.updateChunks(this.camera);

    if (this.hitboxes.debug) this.hitboxes.updateDebug(this.player);

    // --- жизнь вокруг: светляки ночью, мысли героя о своём ---
    this.updateFireflies(dt, skyInfo.night);
    this.thoughtTimer -= dt;
    if (this.thoughtTimer <= 0) {
      this.thoughtTimer = 50 + Math.random() * 55;
      const thoughts = this.underground
        ? [
            'Здесь пахнет железом и старой землёй.',
            'Если лампа погаснет, дорогу обратно придётся искать на ощупь.',
            'Где-то ниже гудит магма. Она не спит.',
            'Обсидиан холодит ладонь даже через рукав.',
          ]
        : [
            'Море шумит так, будто ему всё равно.',
            'Птицы знают дорогу, а я — нет.',
            'Пахнет солью и дымом. Неплохо для начала.',
            'Когда-нибудь я уплыву отсюда. Когда-нибудь.',
            'Кокос — это не еда, кокос — это надежда.',
          ];
      this.ui.toast(thoughts[Math.floor(Math.random() * thoughts.length)]);
    }

    // --- шахта ---
    this.mine.update(dt);
    if (this.underground) {
      this.mineLight.position.set(this.player.position.x, this.player.position.y + 1.5, this.player.position.z);
      this.mineLight.intensity = 2.2 + Math.sin(performance.now() * 0.007) * 0.22;
      if (this.mine.inLava(this.player.position.x, this.player.position.z)) {
        this.inLavaTimer += dt;
        if (performance.now() - this.lavaHurtAt > 700) {
          this.lavaHurtAt = performance.now();
          this.takeDamage(6, 'лава');
          this.spawnChips(this.player.position.x, this.player.position.y + 0.4, this.player.position.z,
            { count: 8, color: 0xff8a3a, size: 0.06, spread: 1.4, up: 2.4 });
        }
      } else {
        this.inLavaTimer = 0;
      }
    } else {
      this.mineLight.visible = false;
    }

    // станки живут: камень точила крутится, когда рядом работают
    for (const st of this.stations) {
      const wheel = st.group?.userData?.wheel;
      if (wheel) wheel.rotation.x += dt * 0.4;
    }

    // --- ресурсы и костры ---
    this.resources.update(dt);

    // --- звери (ничего не прячем: все модели прогружены) ---
    if (this.frameIndex % 30 === 0) this.syncPickupHitboxes();
    this.mobs.update(dt, this.player, {
      audio: this.audio,
      night: skyInfo.night,
      listener: { x: this.player.position.x, z: this.player.position.z, yaw: this.player.yaw },
      onHit: (dmg, cause, mob) => this.takeDamage(dmg, cause, mob),
      onDrop: (items) => { for (const [id, n] of Object.entries(items)) this.addItem(id, n); },
    });
    this.updateProjectiles(dt);
    this.updateChips(dt);
    this.attackCooldown = Math.max(0, this.attackCooldown - dt);
    this.digCooldown = Math.max(0, (this.digCooldown || 0) - dt);
    this.updateWounds(dt);
    if (this.bot) this.bot.update(dt);
    if (this.holdingAttack && this.attackCooldown <= 0) this.attack();

    const fireWarm = this.resources.fireWarmth(this.player.position);
    this.nearFire = fireWarm.fire;
    this.audio.updateAmbience(dt, { night: skyInfo.night, fire: fireWarm.warmth > 0 ? fireWarm.warmth : 0 });
    this.ui.setFuel(fireWarm.warmth > 0.05 && fireWarm.fire ? fireWarm.fire : null);

    // --- подсветка цели и подсказка: всё по прицелу ---
    const markerInfo = this.aimMarkerPos();
    this.ui.setPrompt(this.aimPromptHtml());
    if (markerInfo) {
      this.highlight.visible = true;
      const groundY = this.underground
        ? this.mine.floorAt(markerInfo.x, markerInfo.z)
        : this.world.heightAt(markerInfo.x, markerInfo.z);
      this.highlight.position.set(markerInfo.x, groundY + 0.07, markerInfo.z);
      this.highlight.material.opacity = 0.5 + Math.sin(performance.now() * 0.005) * 0.28;
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
    // кончился воздух под водой — здоровье тает, пока герой не всплывёт
    if (this.player.air <= 0.01 && this.player.underwater) {
      dmg += CONFIG.needs.healthDrain * 1.6;
      cause = cause || 'нехватка воздуха';
    }
    this.ui.setAir(this.player.air, this.player.swimming || this.player.underwater || this.player.air < CONFIG.player.airMax - 0.5);

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

  /** Урон от зверя: тряска, звук, предупреждение, ранение части тела */
  takeDamage(amount, cause, source = null) {
    if (!this.running || this.paused || this.dead || amount <= 0) return;
    if (this.creative) return;              // в креативе не ранят
    this.state.health = Math.max(0, this.state.health - amount);
    this.player.landShake = Math.max(this.player.landShake, 0.45);
    this.audio.hurt();

    // удар приходится в конкретную часть тела — по хитбоксам
    if (source || cause.includes('клык') || cause.includes('змеи') || cause.includes('звер')) {
      const part = this.pickWoundPart(source);
      this.addWound(part, Math.min(1, 0.35 + amount / 40));
    }

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
        pos: this.underground && this.mine.currentEntrance
          ? [this.mine.currentEntrance.x, this.mine.currentEntrance.z]
          : [this.player.position.x, this.player.position.z],
        under: this.underground,
        yaw: this.player.yaw,
        facing: this.player.facing,
        need: [this.state.health, this.state.thirst, this.state.hunger, this.state.warmth],
        inv: this.state.inventory,
        hotbar: this.state.hotbar,
        selected: this.selected,
        view: this.view,
        campfires: this.resources.campfires.map((f) => ({ x: f.x, z: f.z, fuel: Math.round(f.fuel) })),
        stations: this.stations.map((st) => ({ type: st.type, x: st.x, z: st.z })),
        forged: this.forged,
        wounds: this.wounds.map((w) => ({ part: w.part, severity: w.severity })),
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

    // кованые предметы восстанавливаем до чтения сумки: иначе id незнаком
    this.forged = data.forged || {};
    for (const meta of Object.values(this.forged)) registerForged(meta);
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
    this.wounds = [];
    for (const w of data.wounds || []) {
      if (typeof w.part === 'string' && typeof w.severity === 'number' && w.severity > 0.02) {
        const info = this.woundPartLabel(w.part);
        this.wounds.push({ part: w.part, severity: w.severity, label: info.label, icon: info.icon, time: 0 });
      }
    }
    this.ui.setWounds(this.wounds);

    for (const f of data.campfires || []) {
      const fire = this.resources.addCampfire(f.x, f.z);
      fire.fuel = Math.max(0, Math.min(fire.maxFuel, f.fuel || 0));
    }
    for (const st of data.stations || []) {
      if (st.type !== 'bench' && st.type !== 'grind') continue;
      const group = st.type === 'grind' ? buildGrindstone() : buildWorkbench();
      const h = this.world.heightAt(st.x, st.z);
      group.position.set(st.x, h, st.z);
      group.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
      this.scene.add(group);
      const station = { type: st.type, x: st.x, y: h, z: st.z, group };
      this.stations.push(station);
      station.hitboxId = this.hitboxes.registerStatic('station',
        { x: station.x, y: station.y, z: station.z, w: 1.5, h: 1.15, d: 0.9 },
        { physical: true, ref: station });
    }
    this.player.applyCamera(this.camera, this.world, 1);
    this.refreshHotbar();
    this.ui.renderBag(this.state.inventory, this.state.hotbar);
    this.player.setEquipped(this.equippedId());
    this.ui.toast(`Загружено: день ${this.sky.day}, ${this.sky.clockString()}`);
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
    this.cursorFree = false;
    this.ui.setCursorFree?.(false);
    this.tryLock(true);
  }

  /** F9: отпустить курсор для кликов по интерфейсу и вернуть его обратно */
  toggleCursor() {
    if (this.cursorFree) this.captureCursor();
    else this.releaseCursor();
  }

  /** F9: курсор свободен — игра идёт, но мышь не крутит камеру */
  releaseCursor() {
    this.cursorFree = true;
    this.dragging = false;
    this.holdingAttack = false;
    this.lockErrors = 0;
    // пока курсор свободен, автозахват по клику и фолбэк-обзор не вмешиваются
    this.ui.setCursorFree?.(true);
    if (document.pointerLockElement) document.exitPointerLock();
    this.ui.toast('F9: курсор свободен — можно кликать по панелям. Ещё раз F9 или клик по сцене вернут обзор');
    this.audio.uiClick?.();
  }

  /** F9 повторно: снова захватить мышь для обзора */
  captureCursor() {
    this.cursorFree = false;
    this.ui.setCursorFree?.(false);
    if (this.dragLook) {
      // мышь не захватывается (iframe/настройки браузера) — обзор зажатой ЛКМ
      this.ui.toast('Обзор: зажми левую кнопку мыши и веди');
      return;
    }
    this.tryLock(true);
    // если браузер не дал захват, честно говорим, как смотреть
    clearTimeout(this._cursorHint);
    this._cursorHint = setTimeout(() => {
      if (!this.locked && !this.cursorFree && !this.dragLook) this.fallbackLook();
    }, 1000);
    this.audio.uiClick?.();
  }

  /** F8: робот-инспектор проверяет игру по описанию */
  toggleBot() {
    if (!this.bot) this.bot = new InspectorBot(this);
    this.bot.toggle();
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

    // --- тени: обновляем карту не каждый кадр ---
    // Солнце идёт медленно, а тени пересчитываются дорого: двух кадров из трёх
    // хватает, разницы не видно, а кадровое время падает заметно.
    try {
      if (this.renderer.shadowMap.enabled) {
        this.renderer.shadowMap.autoUpdate = false;
        const need = (this.frameIndex % 2 === 0) || this.shadowDirty;
        this.renderer.shadowMap.needsUpdate = need;
        this.shadowDirty = false;
      }
    } catch (e) { /* старые драйверы — не критично */ }

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
// для тестов и консоли: кузница доступна снаружи
window.__forge = { forge, sharpen, canSharpen, buildModel: buildForgedModel, effectiveWeapon, FORMS, MATERIALS };
window.__botCtor = InspectorBot;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initMenu);
} else {
  initMenu();
}
