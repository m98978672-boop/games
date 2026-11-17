// RatCore v1.0.0 Demo Game: «СТРАЖА ЦИТАДЕЛИ» (Citadel Watch)
// Чистая игровая логика: 100 % через RatCore.tools.* (проходит аудит ToolGuard Барьер 4!).
// Работает идентично в браузере (index.html) и в Node.js headless-тестах (demo-game.mjs).

import { createEngine } from '../../ratcore.js';

export function createCitadelWatchGame({ seed = 2026, viewport = { width: 320, height: 180 }, manifest = null } = {}) {
  const engine = createEngine({
    preset: 'survival',
    packs: [
      'pack:destruction',
      'pack:styles',
      'pack:ecology',
      'pack:voice',
      'pack:companion',
      'pack:assist',
      'pack:cinema',
      'pack:studio',
    ],
    seed,
    viewport,
    manifest,
  });

  const T = engine.tools;

  // Настройка декларативного ввода и экономики
  T.input.startRecord();
  T.sim.setResource({ id: 'wood', amount: 18, unitWeight: 1 });
  T.sim.setResource({ id: 'stone', amount: 12, unitWeight: 1 });
  T.sim.setResource({ id: 'food', amount: 25, unitWeight: 1 });
  T.sim.defineRecipe({ id: 'tower_kit', inputs: { wood: 6, stone: 4 }, outputs: { tower_kit: 1 } });

  // Сборка моделей строго через запечатанный конвейер ToolGuard
  const citadelMesh = T.build.fromRecipe({
    modelId: 'citadel_keep',
    ops: [
      { tool: 'build.primitive', args: { shape: 'box', w: 3.4, h: 4.2, d: 3.4, color: '#60a5fa' } },
      { tool: 'build.primitive', args: { shape: 'roof', w: 3.8, h: 2.0, d: 3.8, color: '#f59e0b' }, offset: [0, 4.2, 0] },
    ],
  }).data;

  const turretMesh = T.build.fromRecipe({
    modelId: 'defense_turret',
    ops: [
      { tool: 'build.primitive', args: { shape: 'cylinder', radius: 0.75, h: 2.8, color: '#34d399' } },
      { tool: 'build.primitive', args: { shape: 'box', w: 1.2, h: 0.6, d: 1.2, color: '#22d3ee' }, offset: [0, 2.8, 0] },
    ],
  }).data;

  const droneMesh = T.build.primitive({ shape: 'box', w: 1.1, h: 0.9, d: 1.1, color: '#ef4444' }).data;
  const buddyMesh = T.build.primitive({ shape: 'cylinder', radius: 0.55, h: 1.7, color: '#a78bfa' }).data;
  const wallMesh = T.build.primitive({ shape: 'box', w: 2.4, h: 1.6, d: 0.7, color: '#94a3b8' }).data;

  // Возводим Цитадель и защитный периметр
  T.build.placeEntity({ id: 'citadel_keep', mesh: citadelMesh, x: 0, y: 0, h: 1, allowWater: true });
  T.build.placeEntity({ id: 'wall_n', mesh: wallMesh, x: 0, y: 4.5, h: 1, allowWater: true });
  T.build.placeEntity({ id: 'wall_s', mesh: wallMesh, x: 0, y: -4.5, h: 1, allowWater: true });
  T.build.placeEntity({ id: 'buddy_barsik', mesh: buddyMesh, x: -3, y: -2, h: 1, allowWater: true });

  // Регистрируем опорный граф цитадели в pack:destruction
  T.destroy.registerStructure({
    id: 'citadel_wall',
    blocks: [
      { id: 'base_left', hp: 100, isGround: true },
      { id: 'base_right', hp: 100, isGround: true },
      { id: 'upper_parapet', hp: 60, isGround: false },
    ],
    edges: [
      ['base_left', 'upper_parapet'],
      ['base_right', 'upper_parapet'],
    ],
  });

  // Создаём ИИ-напарника Барсика и настраиваем доступность/субтитры
  T.coopAi.spawn({ id: 'barsik', name: 'Барсик', x: -3, y: -2, h: 1, skills: ['cover', 'scout', 'build'] });
  T.assist.setAudioSubtitles({ enabled: true, showDirection: true, maxItems: 3 });

  // Инициализация COW «Машины времени»
  T.save.timelineInit({ keyframeInterval: 30 });

  const state = {
    wave: 1,
    maxWaves: 5,
    score: 0,
    citadelHp: 100,
    maxCitadelHp: 100,
    status: 'playing', // 'playing' | 'victory' | 'defeat'
    cameraAngle: 0.4,
    cameraDist: 16,
    cameraHeight: 9.5,
    turrets: [],
    drones: [],
    nextDroneId: 1,
    nextTurretId: 1,
    fireCooldown: 0,
    waveSpawnRemaining: 0,
    spawnTimer: 0.6,
    styleIdx: 0,
    colorblindIdx: 0,
    lastVoice: null,
    elapsedSec: 0,
    tickCount: 0,
  };

  const styles = ['none', 'ps1', 'crt', 'thermal', 'nightvision', 'cel'];
  const cbModes = ['none', 'protanopia', 'deuteranopia', 'tritanopia'];

  function syncHud() {
    const simSt = T.sim.state().data;
    T.ui.setWidget({ id: 'citadel_hp', kind: 'bar', label: 'Цитадель', value: state.citadelHp, max: state.maxCitadelHp, tone: state.citadelHp > 40 ? 'ok' : 'danger' });
    T.ui.setWidget({ id: 'wave', kind: 'counter', label: 'Волна', value: `${state.wave}/${state.maxWaves}`, max: state.maxWaves, tone: 'info' });
    T.ui.setWidget({ id: 'score', kind: 'counter', label: 'Счёт', value: state.score, max: 5000, tone: 'ok' });
    T.ui.setWidget({ id: 'wood', kind: 'counter', label: 'Дерево', value: simSt.inventory.wood || 0, max: 100, tone: 'warn' });
    T.ui.setWidget({ id: 'stone', kind: 'counter', label: 'Камень', value: simSt.inventory.stone || 0, max: 100, tone: 'info' });
    T.ui.setWidget({ id: 'turrets', kind: 'counter', label: 'Башни', value: state.turrets.length, max: 6, tone: 'ok' });
  }

  function startWave(waveNum) {
    state.wave = waveNum;
    state.waveSpawnRemaining = 2 + waveNum * 2;
    state.spawnTimer = 0.4;
    T.ui.notify({ text: `Волна ${waveNum}/${state.maxWaves}: дроны на подходе!`, level: 'warn', ttlSec: 4 });
    // Смена освещения по волнам
    const hours = [11, 15.5, 18.5, 22.0, 6.2][(waveNum - 1) % 5];
    const weather = ['clear', 'cloudy', 'rain', 'storm', 'snow'][(waveNum - 1) % 5];
    T.env.setTime({ hours });
    T.env.setWeather({ kind: weather, intensity: 0.65 });
    T.save.timelineRecord({ tick: state.tickCount, forceKeyframe: true });
    syncHud();
  }

  function spawnDrone() {
    const id = `drone_${state.nextDroneId++}`;
    const ang = ((state.nextDroneId * 1.9 + state.wave * 0.7) % (Math.PI * 2));
    const r = 13.5;
    const x = Number((Math.cos(ang) * r).toFixed(2));
    const y = Number((Math.sin(ang) * r).toFixed(2));
    const hp = 25 + state.wave * 10;
    const speed = 1.6 + state.wave * 0.25;
    const placed = T.build.placeEntity({ id, mesh: droneMesh, x, y, h: 1.5, allowWater: true });
    if (placed.ok) {
      state.drones.push({ id, x, y, h: 1.5, hp, maxHp: hp, speed });
      T.hear.emit({ kind: 'Дрон', x, y, h: 1.5, loudnessDb: 74, sourceId: id });
    }
  }

  function fireCannon() {
    if (state.status !== 'playing' || state.fireCooldown > 0) return { fired: false, reason: 'cooldown' };
    state.fireCooldown = 0.28;
    const sfx = T.audio.synthesize({ preset: 'shot', seed: state.tickCount + 1 }).data;
    T.fx.addCameraShake({ trauma: 0.28 });

    if (state.drones.length === 0) {
      return { fired: true, hit: false, sfx };
    }
    // Бьём по ближайшему к цитадели вражескому дрону
    state.drones.sort((a, b) => Math.hypot(a.x, a.y) - Math.hypot(b.x, b.y));
    const target = state.drones[0];
    target.hp -= 35;
    T.fx.emitBurst({ x: target.x, y: target.y, h: target.h, count: 16, speed: 5, lifeSec: 0.8 });
    T.hear.emit({ kind: 'Выстрел', x: target.x, y: target.y, h: target.h, loudnessDb: 86 });

    let destroyed = false;
    if (target.hp <= 0) {
      T.remove.entity({ id: target.id });
      state.drones.shift();
      state.score += 100;
      destroyed = true;
      // Трофейные ресурсы
      const inv = T.sim.state().data.inventory;
      T.sim.setResource({ id: 'wood', amount: Math.min(40, (inv.wood || 0) + 3), unitWeight: 1 });
      T.sim.setResource({ id: 'stone', amount: Math.min(40, (inv.stone || 0) + 2), unitWeight: 1 });
      T.ui.notify({ text: `Дрон ${target.id} сбит! +100 очков (+3 дерева, +2 камня)`, level: 'success', ttlSec: 2.8 });
    }
    syncHud();
    return { fired: true, hit: true, targetId: target.id, destroyed, sfx };
  }

  function buildTurret() {
    if (state.status !== 'playing') return { ok: false, reason: 'not-playing' };
    if (state.turrets.length >= 6) {
      T.ui.notify({ text: 'Построен максимум башен (6/6)', level: 'warn', ttlSec: 2.5 });
      return { ok: false, reason: 'max-turrets' };
    }
    const crafted = T.sim.craft({ recipeId: 'tower_kit', times: 1 });
    if (!crafted.ok) {
      T.ui.notify({ text: 'Недостаточно ресурсов (нужно 6 дерева и 4 камня)', level: 'danger', ttlSec: 3 });
      return { ok: false, reason: crafted.error.message };
    }
    const idx = state.nextTurretId++;
    const ang = (idx * Math.PI) / 3;
    const x = Number((Math.cos(ang) * 5.2).toFixed(2));
    const y = Number((Math.sin(ang) * 5.2).toFixed(2));
    const id = `turret_${idx}`;
    T.build.placeEntity({ id, mesh: turretMesh, x, y, h: 1, allowWater: true });
    state.turrets.push({ id, x, y, cooldown: 0 });
    state.score += 50;
    T.ui.notify({ text: `Башня ${id} возведена! Авто-огонь активен`, level: 'success', ttlSec: 3 });
    syncHud();
    return { ok: true, id, x, y };
  }

  function orderCompanion(text = 'Прикрой слева у стены!') {
    const ord = T.coopAi.order({ companionId: 'barsik', text, playerPos: { x: 0, y: 0, h: 1 } });
    // Барсик немедленно поражает ближайший дрон при поддержке
    let assistedKill = null;
    if (state.drones.length > 0) {
      const target = state.drones[0];
      target.hp -= 25;
      T.fx.emitBurst({ x: target.x, y: target.y, h: target.h, count: 10, speed: 4, lifeSec: 0.6 });
      if (target.hp <= 0) {
        T.remove.entity({ id: target.id });
        state.drones.shift();
        state.score += 80;
        assistedKill = target.id;
      }
    }
    T.ui.notify({ text: `Барсик: ${ord.data.explanation}`, level: 'info', ttlSec: 4.5 });
    syncHud();
    return { ...ord.data, assistedKill };
  }

  function speakRadio(text = 'Цитадель держится, приём!') {
    const sp = T.voice.speak({ profileId: 'commander-radio', text, emotion: state.citadelHp < 50 ? 'urgent' : 'calm' }).data;
    state.lastVoice = { voiceId: sp.voiceId, durationSec: sp.durationSec, timeSec: 0 };
    T.ui.notify({ text: `Рация: «${text}» (${sp.visemeCount} визем, 0 КБ аудио)`, level: 'info', ttlSec: 3.2 });
    return sp;
  }

  function cycleStyle() {
    state.styleIdx = (state.styleIdx + 1) % styles.length;
    const res = T.shader.applyPreset({ preset: styles[state.styleIdx] }).data;
    T.ui.notify({ text: `Стиль кадра: ${res.activePreset}`, level: 'info', ttlSec: 2 });
    return res;
  }

  function cycleColorblind() {
    state.colorblindIdx = (state.colorblindIdx + 1) % cbModes.length;
    const res = T.assist.setVisualMode({ colorblind: cbModes[state.colorblindIdx], highContrast: state.colorblindIdx > 0 }).data;
    T.ui.notify({ text: `Режим зрения: ${res.colorblind}`, level: 'info', ttlSec: 2.5 });
    return res;
  }

  function freezeRiverWinter() {
    T.eco.setSeason({ season: 'winter' });
    const ice = T.eco.stepIce({ tempC: -20, hours: 18 }).data;
    const stress = T.eco.iceStressTest({ massKg: 4200 }).data;
    T.env.setWeather({ kind: 'snow', intensity: 0.85 });
    T.ui.notify({ text: `Зима! Лёд ${ice.iceThicknessCm} см · грузовик 4.2 т: ${stress.safe ? 'выдержит' : 'проломит!'}`, level: 'info', ttlSec: 3.5 });
    return { ice, stress };
  }

  function rewindTimeline() {
    const snap = T.save.scrubTo({ tick: 0, branchId: 'main' }).data;
    state.citadelHp = Math.min(state.maxCitadelHp, state.citadelHp + 25);
    T.ui.notify({ text: `Машина времени: откат к тику ${snap.restoredFromKeyframeTick} (+25 HP цитадели)`, level: 'warn', ttlSec: 3.5 });
    syncHud();
    return snap;
  }

  function step(dt = 1 / 30) {
    const stepDt = Math.min(0.1, Math.max(0.001, Number(dt)));
    state.elapsedSec += stepDt;
    state.tickCount++;
    engine.clock.advance(stepDt, () => {});

    // Опрос декларативного ввода (WASD / стрелки вращают камеру и двигают наводку)
    const inp = T.input.poll().data;
    state.cameraAngle += (inp.moveX * 1.9 + 0.16) * stepDt;
    state.cameraDist = Math.max(11, Math.min(22, state.cameraDist - inp.moveY * 6 * stepDt));
    if (inp.buttons & 1) fireCannon();

    state.fireCooldown = Math.max(0, state.fireCooldown - stepDt);
    T.fx.step({ dt: stepDt });
    T.ui.tick({ dt: stepDt });

    // Продвигаем напарника Барсика и синхронизируем его 3D-сущность
    const bStep = T.coopAi.step({ companionId: 'barsik', dt: stepDt, speed: 3.5 }).data;
    T.move.entity({ id: 'buddy_barsik', x: bStep.x, y: bStep.y, h: 1 });

    if (state.status === 'playing') {
      // Спавн дронов текущей волны
      if (state.waveSpawnRemaining > 0) {
        state.spawnTimer -= stepDt;
        if (state.spawnTimer <= 0) {
          spawnDrone();
          state.waveSpawnRemaining--;
          state.spawnTimer = Math.max(0.7, 2.0 - state.wave * 0.22);
        }
      }

      // Автоогонь построенных башен
      for (const tur of state.turrets) {
        tur.cooldown = Math.max(0, tur.cooldown - stepDt);
        if (tur.cooldown <= 0 && state.drones.length > 0) {
          const target = state.drones[0];
          target.hp -= 18;
          tur.cooldown = 1.1;
          T.fx.emitBurst({ x: target.x, y: target.y, h: target.h, count: 6, speed: 3, lifeSec: 0.5 });
          if (target.hp <= 0) {
            T.remove.entity({ id: target.id });
            state.drones.shift();
            state.score += 75;
          }
        }
      }

      // Движение вражеских дронов к цитадели
      for (let i = state.drones.length - 1; i >= 0; i--) {
        const d = state.drones[i];
        const dist = Math.hypot(d.x, d.y);
        if (dist <= 2.4) {
          // Удар по цитадели + повреждение стены в pack:destruction
          state.citadelHp = Math.max(0, state.citadelHp - 12);
          T.destroy.damage({ structureId: 'citadel_wall', blockId: 'base_left', amount: 15 });
          T.fx.addCameraShake({ trauma: 0.45 });
          T.fx.emitBurst({ x: d.x, y: d.y, h: d.h, count: 18, speed: 5, lifeSec: 0.9 });
          T.hear.emit({ kind: 'Взрыв', x: d.x, y: d.y, h: d.h, loudnessDb: 96 });
          T.remove.entity({ id: d.id });
          state.drones.splice(i, 1);
          T.ui.notify({ text: `Удар по цитадели! Осталось ${state.citadelHp} HP`, level: 'danger', ttlSec: 3 });
        } else {
          d.x -= (d.x / dist) * d.speed * stepDt;
          d.y -= (d.y / dist) * d.speed * stepDt;
          T.move.entity({ id: d.id, x: Number(d.x.toFixed(3)), y: Number(d.y.toFixed(3)), h: d.h });
        }
      }

      if (state.citadelHp <= 0) {
        state.status = 'defeat';
        T.ui.notify({ text: 'Цитадель пала! Нажми [T] для отката во времени или [R] для рестарта.', level: 'danger', ttlSec: 10 });
      } else if (state.waveSpawnRemaining === 0 && state.drones.length === 0) {
        if (state.wave >= state.maxWaves) {
          state.status = 'victory';
          state.score += 500;
          T.ui.notify({ text: `ПОБЕДА! Все ${state.maxWaves} волн отражены! Итог: ${state.score} очков`, level: 'success', ttlSec: 12 });
        } else {
          startWave(state.wave + 1);
        }
      }
    }

    // Движение камеры с учётом тряски из fx
    const fxState = T.fx.step({ dt: 0.001 }).data;
    const camX = Math.sin(state.cameraAngle) * state.cameraDist + fxState.shake.offsetX;
    const camY = -Math.cos(state.cameraAngle) * state.cameraDist + fxState.shake.offsetY;
    T.look.at({
      x: camX,
      y: camY,
      h: state.cameraHeight + fxState.shake.offsetH,
      targetX: 0,
      targetY: 0,
      targetH: 2.0,
    });

    // Визема рта для активной радиопередачи
    let activeViseme = null;
    if (state.lastVoice) {
      state.lastVoice.timeSec += stepDt;
      if (state.lastVoice.timeSec <= state.lastVoice.durationSec) {
        activeViseme = T.voice.getViseme({ voiceId: state.lastVoice.voiceId, timeSec: state.lastVoice.timeSec }).data;
      } else {
        state.lastVoice = null;
      }
    }

    syncHud();
    return {
      status: state.status,
      wave: state.wave,
      score: state.score,
      citadelHp: state.citadelHp,
      dronesAlive: state.drones.length,
      turrets: state.turrets.length,
      activeViseme,
      hud: T.ui.hudSummary().data,
      subtitles: T.assist.audioSubtitles({ listenerPos: { x: 0, y: 0, h: 1 } }).data.captions,
    };
  }

  startWave(1);

  return {
    engine,
    state,
    step,
    fireCannon,
    buildTurret,
    orderCompanion,
    speakRadio,
    cycleStyle,
    cycleColorblind,
    freezeRiverWinter,
    rewindTimeline,
    exportFortressHtml: () => T.studio.exportSingleHtml({ title: `Стража Цитадели · Волна ${state.wave}` }).data,
    saveWire2: () => T.save.exportWire2().data,
  };
}
