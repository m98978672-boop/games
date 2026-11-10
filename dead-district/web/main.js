(function (global) {
  'use strict';

  var DD = global.DD = global.DD || {};
  var Sys = DD.Systems;
  var TILE = DD.TILE;
  var DataDB = DD.DataDB;

  var MAX_WORLD_ZOMBIES = 1200;
  var MAX_ACTIVE_ZOMBIES = 150;

  var state = null;
  var keys = {};
  var touchVec = { x: 0, y: 0 };
  var canvasEl = null;
  var activeModal = '';
  var rafId = 0;
  var lastTime = 0;

  function addToast(msg) {
    if (!state) return;
    state.logs.push(msg);
    if (state.logs.length > 5) state.logs.shift();
    var el = document.getElementById('hud-log');
    if (el) el.textContent = state.logs.join(' · ');
  }

  function emitNoise(x, y, db, tag) {
    if (!state) return;
    state.lastNoise = { x: x, y: y, ttl: 4.0, tag: tag };
    var floorDb = state.tw.weather === 'storm' ? 64 : (state.tw.weather === 'rain' ? 52 : (state.tw.hour >= 22 || state.tw.hour < 5 ? 24 : 34));
    var maxR = DD.NoiseSystem.maxRadiusTiles(db, floorDb);
    state.noiseRings.push({ x: x, y: y, r: maxR, ttl: 0.55 });
    var ids = state.spatial.queryRadius(x, y, maxR);
    for (var i = 0; i < ids.length; i++) {
      var z = state.zombies[ids[i]];
      if (!z || z.state === DD.ZSTATE.DEAD || z.state === DD.ZSTATE.STUNNED) continue;
      var recDb = DD.NoiseSystem.receivedDb(x, y, z.x, z.y, db, state.world);
      if (recDb >= 40) {
        z.tx = x; z.ty = y;
        if (z.state !== DD.ZSTATE.CHASE && !z.crippled) z.state = DD.ZSTATE.INVESTIGATE_NOISE;
      }
    }
  }

  function newGame(fromSave) {
    DD.reseed(20261110);
    var world = new DD.ChunkWorld(20261110);
    for (var cy = -1; cy <= 1; cy++) {
      for (var cx = -1; cx <= 1; cx++) world.generateChunk(cx, cy);
    }

    var saved = fromSave ? DD.SaveManager.load() : null;
    state = {
      world: world,
      tw: Sys.createTimeWeather(),
      util: Sys.createUtilities(),
      needs: Sys.createNeeds(),
      health: Sys.createHealth(),
      inv: Sys.createInventory(),
      player: {
        x: 15.0, y: 15.0, fx: 0, fy: 1,
        weapon: 'baseball_bat',
        ammo: { glock_17: 17, m1911: 7, mossberg_500: 6, ar15: 30 },
        flashlightOn: true, inVehicleId: '', attackCd: 0, stepTimer: 0
      },
      zombies: [],
      npcs: [],
      vehicles: [],
      farms: [],
      campfires: [],
      spatial: new DD.SpatialHash(8),
      flowField: {},
      visible: {},
      explored: {},
      noiseRings: [],
      lastNoise: { x: 15, y: 15, ttl: 0 },
      logs: ['Добро пожаловать в Dead District! Выживите любой ценой.'],
      paused: false,
      elapsed: 0,
      flowTimer: 0,
      kills: 0
    };

    if (saved && saved.player) {
      if (Number.isFinite(saved.player.x)) state.player.x = saved.player.x;
      if (Number.isFinite(saved.player.y)) state.player.y = saved.player.y;
      if (saved.player.weapon) state.player.weapon = saved.player.weapon;
      if (saved.tw) state.tw = saved.tw;
      if (saved.needs) state.needs = saved.needs;
      if (saved.health) state.health = saved.health;
      if (saved.inv) state.inv = saved.inv;
      if (saved.util) state.util = saved.util;
      addToast('Сохранение загружено.');
    }

    // Спавним транспорт из чанков
    var cKeys = Object.keys(world.chunks);
    for (var i = 0; i < cKeys.length; i++) {
      var ch = world.chunks[cKeys[i]];
      for (var v = 0; v < ch.vehicleSpawns.length; v++) {
        var vs = ch.vehicleSpawns[v];
        state.vehicles.push({
          id: 'veh_' + vs.tx + '_' + vs.ty,
          type: vs.type, name: vs.type.replace('veh_', '').toUpperCase(),
          x: vs.tx + 0.5, y: vs.ty + 0.5, angle: 0, speed: 0,
          fuel: DD.randRange(14, 48), maxFuel: 70, condition: 85
        });
      }
    }

    // Спавним стартовую орду с учётом 5 типов и лимита 1200/150
    var zTypes = ['walker', 'walker', 'walker', 'runner', 'crawler', 'brute', 'infected'];
    var zid = 1;
    for (var k = 0; k < 42 && state.zombies.length < MAX_WORLD_ZOMBIES; k++) {
      var ang = DD.randRange(0, Math.PI * 2);
      var dist = DD.randRange(9, 40);
      var zx = Math.round(state.player.x + Math.cos(ang) * dist);
      var zy = Math.round(state.player.y + Math.sin(ang) * dist);
      if (world.isWalkable(zx, zy)) {
        var zt = zTypes[DD.randInt(0, zTypes.length - 1)];
        state.zombies.push(Sys.createZombie(zid++, zt, zx + 0.5, zy + 0.5));
      }
    }

    // Спавним 3 ближайших выживших NPC
    var archKeys = Object.keys(DataDB.npcsMap);
    for (var n = 0; n < Math.min(3, archKeys.length); n++) {
      var nx = Math.round(state.player.x + (n - 1) * 7);
      var ny = Math.round(state.player.y + 5);
      if (world.isWalkable(nx, ny)) {
        state.npcs.push(Sys.createNpc(n + 1, DataDB.npcsMap[archKeys[n]], nx + 0.5, ny + 0.5));
      }
    }

    recomputeFovAndFlow();
    closeModals();
    updateHud();
    global.DD_STATE = state;
  }

  function recomputeFovAndFlow() {
    if (!state) return;
    var ptx = Math.round(state.player.x);
    var pty = Math.round(state.player.y);
    var rad = (state.tw.darkness < 0.35 || state.player.flashlightOn) ? 16 : 7;
    state.visible = DD.computeFov(ptx, pty, rad, state.world);
    var visKeys = Object.keys(state.visible);
    for (var i = 0; i < visKeys.length; i++) state.explored[visKeys[i]] = true;
    state.flowField = DD.computeFlowField(ptx, pty, 22, state.world);
  }

  function stepSimulation(dt) {
    if (!state || state.paused || state.health.dead) return;
    state.elapsed += dt;
    if (state.player.attackCd > 0) state.player.attackCd = Math.max(0, state.player.attackCd - dt);

    // 1. Ввод игрока (клавиатура + мобильный тач)
    var ix = (keys.KeyD || keys.ArrowRight ? 1 : 0) - (keys.KeyA || keys.ArrowLeft ? 1 : 0) + touchVec.x;
    var iy = (keys.KeyS || keys.ArrowDown ? 1 : 0) - (keys.KeyW || keys.ArrowUp ? 1 : 0) + touchVec.y;
    var len = Math.hypot(ix, iy);
    if (len > 1) { ix /= len; iy /= len; }

    var sprint = Boolean(keys.ShiftLeft || keys.ShiftRight) && state.needs.stamina > 8;
    var sneak = Boolean(keys.ControlLeft || keys.KeyC);

    if (state.player.inVehicleId) {
      var veh = null;
      for (var vi = 0; vi < state.vehicles.length; vi++) {
        if (state.vehicles[vi].id === state.player.inVehicleId) { veh = state.vehicles[vi]; break; }
      }
      if (veh && veh.fuel > 0) {
        var throttle = -iy;
        var steer = ix;
        veh.speed += (throttle * 13 - veh.speed) * Math.min(1, 5 * dt);
        if (Math.abs(veh.speed) > 0.3) veh.angle += steer * 2.4 * Math.sign(veh.speed) * dt;
        var vx = veh.x + Math.cos(veh.angle) * veh.speed * dt;
        var vy = veh.y + Math.sin(veh.angle) * veh.speed * dt;
        if (state.world.isWalkable(Math.round(vx), Math.round(vy))) {
          veh.x = vx; veh.y = vy;
          veh.fuel = Math.max(0, veh.fuel - Math.abs(veh.speed) * dt * 0.002);
          state.player.x = veh.x; state.player.y = veh.y;
          if (Math.abs(veh.speed) > 4.5) {
            for (var zi = 0; zi < state.zombies.length; zi++) {
              var zc = state.zombies[zi];
              if (zc.state !== DD.ZSTATE.DEAD && Math.hypot(zc.x - veh.x, zc.y - veh.y) < 1.3) {
                if (Sys.damageZombie(zc, 95, 0.9)) state.kills += 1;
              }
            }
          }
        } else {
          veh.speed = 0;
        }
      }
    } else if (len > 0.02) {
      var nlen = Math.hypot(ix, iy);
      state.player.fx = ix / nlen;
      state.player.fy = iy / nlen;
      var spd = sprint ? 7.2 : (sneak ? 2.6 : 4.6);
      if (state.health.parts.LEG_L.fractureDays > 0 || state.health.parts.LEG_R.fractureDays > 0) spd *= 0.45;
      if (Sys.getTotalWeight(state.inv) > Sys.getMaxWeight(state.inv)) spd *= 0.72;
      var nx = state.player.x + state.player.fx * spd * dt;
      var ny = state.player.y + state.player.fy * spd * dt;
      if (state.world.isWalkable(Math.round(nx), Math.round(state.player.y))) state.player.x = nx;
      if (state.world.isWalkable(Math.round(state.player.x), Math.round(ny))) state.player.y = ny;

      state.player.stepTimer += dt;
      if (state.player.stepTimer >= (sprint ? 0.28 : 0.45)) {
        state.player.stepTimer = 0;
        emitNoise(state.player.x, state.player.y, sprint ? 76 : (sneak ? 36 : 54), 'step');
      }
      var pcx = Math.floor(state.player.x / 32);
      var pcy = Math.floor(state.player.y / 32);
      state.world.generateChunk(pcx, pcy);
    }

    // 2. Время, погода, потребности и медицина
    var dh = dt / 45.0;
    Sys.stepTimeWeather(state.tw, dh);
    if (state.util.gridPowerOn && state.tw.day >= state.util.powerShutoffDay) {
      state.util.gridPowerOn = false;
      addToast('Отключение городской электросети!');
    }
    if (state.util.gridWaterOn && state.tw.day >= state.util.waterShutoffDay) {
      state.util.gridWaterOn = false;
      addToast('Отключение городского водопровода!');
    }
    if (!state.util.gridPowerOn) state.util.hoursOutage += dh;

    state.needs.hunger = Math.max(0, state.needs.hunger - (sprint ? 5.0 : 3.2) * dh);
    state.needs.thirst = Math.max(0, state.needs.thirst - (sprint ? 6.0 : 4.2) * dh);
    state.needs.fatigue = Math.min(100, state.needs.fatigue + 3.5 * dh);
    state.needs.stamina = sprint ? Math.max(0, state.needs.stamina - 16 * dt) : Math.min(100, state.needs.stamina + 18 * dt);

    var ptx = Math.round(state.player.x), pty = Math.round(state.player.y);
    var indoor = state.world.isIndoor(ptx, pty);
    var effAmbient = state.tw.ambientTempC + (indoor ? 5 : 0);
    var targetTemp = 37.0 + Math.min(0, effAmbient - 21 + 4.5) * 0.12;
    state.needs.bodyTempC += (Math.max(29, Math.min(41, targetTemp)) - state.needs.bodyTempC) * Math.min(1, dh * 1.5);

    var bleedTotal = 0;
    for (var bi = 0; bi < DD.BODY_PARTS.length; bi++) {
      var pr = state.health.parts[DD.BODY_PARTS[bi]];
      var bl = pr.bandaged ? pr.bleedRate * 0.05 : pr.bleedRate;
      bleedTotal += bl;
      if (pr.bandaged) {
        pr.hp = Math.min(100, pr.hp + 2.5 * dh);
        pr.bleedRate = Math.max(0, pr.bleedRate - 25 * dh);
      }
    }
    state.health.bloodMl = Math.max(0, Math.min(state.health.maxBloodMl, state.health.bloodMl - bleedTotal * dh + (bleedTotal < 20 ? 110 * dh : 0)));
    if (state.needs.hunger <= 0) state.health.globalHp = Math.max(0, state.health.globalHp - 3.5 * dh);
    if (state.needs.thirst <= 0) state.health.globalHp = Math.max(0, state.health.globalHp - 6.0 * dh);
    if ((1 - state.health.bloodMl / state.health.maxBloodMl) >= 0.40) {
      state.health.dead = true;
      state.health.deathCause = 'Гиповолемический шок (потеря >40% крови)';
    } else if (state.health.zombification > 0) {
      state.health.zombification = Math.min(100, state.health.zombification + 2.2 * dh);
      if (state.health.zombification >= 100) {
        state.health.dead = true;
        state.health.deathCause = 'Обращение от инфекции укуса';
      }
    } else if (state.health.globalHp <= 0) {
      state.health.dead = true;
      state.health.deathCause = 'Истощение и полученные раны';
    }

    if (state.health.dead) {
      showDeathScreen(state.health.deathCause);
      return;
    }

    // 3. Обновление грядок фермы
    for (var fi = 0; fi < state.farms.length; fi++) {
      var fp = state.farms[fi];
      if (fp.dead) continue;
      if (state.tw.rainIntensity > 0.1) fp.water = Math.min(100, fp.water + 35 * state.tw.rainIntensity * dh);
      else fp.water = Math.max(0, fp.water - 1.8 * dh);
      if (fp.water > 15) {
        fp.growthDays += dh / 24;
        var ratio = fp.growthDays / fp.targetDays;
        fp.stage = ratio >= 1 ? 3 : (ratio >= 0.65 ? 2 : (ratio >= 0.25 ? 1 : 0));
      }
    }

    // 4. Построение SpatialHash, FlowField, LOD зомби и шаг ИИ
    state.flowTimer += dt;
    if (state.flowTimer >= 0.25) {
      state.flowTimer = 0;
      recomputeFovAndFlow();
    }
    state.spatial.clear();
    var activeList = [];
    for (var i = 0; i < state.zombies.length; i++) {
      var z = state.zombies[i];
      if (z.state === DD.ZSTATE.DEAD) continue;
      state.spatial.insert(i, z.x, z.y);
      var d2 = (z.x - state.player.x) * (z.x - state.player.x) + (z.y - state.player.y) * (z.y - state.player.y);
      if (d2 <= 38 * 38) activeList.push({ idx: i, d2: d2 });
      else z.lod = 'DORMANT';
    }
    if (activeList.length > MAX_ACTIVE_ZOMBIES) {
      activeList.sort(function (a, b) { return a.d2 - b.d2; });
    }
    for (var ai = 0; ai < activeList.length; ai++) {
      state.zombies[activeList[ai].idx].lod = ai < MAX_ACTIVE_ZOMBIES ? 'ACTIVE' : 'DORMANT';
    }

    for (var j = 0; j < state.zombies.length; j++) {
      var zb = state.zombies[j];
      if (zb.state === DD.ZSTATE.DEAD) continue;
      if (zb.lod === 'ACTIVE') {
        var vis = Boolean(state.visible[Math.round(zb.x) + ',' + Math.round(zb.y)]);
        var atk = Sys.stepZombieActive(zb, dt, state.player.x, state.player.y, vis, state.flowField, state.world);
        if (atk && atk.attack) {
          var hitPart = DD.BODY_PARTS[DD.randInt(0, DD.BODY_PARTS.length - 1)];
          var torsoMeta = state.inv.equipment.torso ? DataDB.getItem(state.inv.equipment.torso) : null;
          var armor = { biteDef: (torsoMeta && torsoMeta.bite_def) || 0, scratchDef: (torsoMeta && torsoMeta.scratch_def) || 0 };
          var wr = Sys.applyWound(state.health, hitPart, atk.damage, atk.biteChance, atk.infectChance, armor);
          if (wr) addToast('Ранение (' + wr.part + '): ' + wr.wound);
          DD.Renderer.playSfx('sfx_zombie_bite.wav');
        }
      } else if (state.lastNoise.ttl > 0 && Math.hypot(zb.x - state.lastNoise.x, zb.y - state.lastNoise.y) < 80) {
        var ndx = state.lastNoise.x - zb.x, ndy = state.lastNoise.y - zb.y;
        var ndl = Math.max(0.01, Math.hypot(ndx, ndy));
        zb.x += (ndx / ndl) * zb.speed * 0.4 * dt;
        zb.y += (ndy / ndl) * zb.speed * 0.4 * dt;
      }
    }

    if (state.lastNoise.ttl > 0) state.lastNoise.ttl = Math.max(0, state.lastNoise.ttl - dt);
    for (var ri = state.noiseRings.length - 1; ri >= 0; ri--) {
      state.noiseRings[ri].ttl -= dt;
      if (state.noiseRings[ri].ttl <= 0) state.noiseRings.splice(ri, 1);
    }

    // 5. Выжившие NPC
    var isNight = state.tw.darkness > 0.45;
    for (var ni = 0; ni < state.npcs.length; ni++) {
      var npc = state.npcs[ni];
      var nearIds = state.spatial.queryRadius(npc.x, npc.y, 12);
      var nearZ = null, bestZd = 999;
      for (var q = 0; q < nearIds.length; q++) {
        var cand = state.zombies[nearIds[q]];
        if (!cand || cand.state === DD.ZSTATE.DEAD) continue;
        var cd = Math.hypot(cand.x - npc.x, cand.y - npc.y);
        if (cd < bestZd) { bestZd = cd; nearZ = cand; }
      }
      if (Sys.stepNpc(npc, dt, state.player.x, state.player.y, nearZ, nearIds.length, isNight, state.world)) {
        Sys.applyWound(state.health, 'TORSO', 16, 0, 0, { biteDef: 0, scratchDef: 0 });
        addToast(npc.name + ' открыл огонь!');
      }
    }
  }

  function performAttack() {
    if (!state || state.paused || state.health.dead || state.player.attackCd > 0) return;
    var wmeta = DataDB.getItem(state.player.weapon) || { cat: 'melee', damage: 22, range: 1.8, noise_db: 70 };
    if (wmeta.cat === 'firearm') {
      var mag = state.player.ammo[state.player.weapon] || 0;
      if (mag <= 0) {
        performReload();
        return;
      }
      state.player.ammo[state.player.weapon] = mag - 1;
      state.player.attackCd = wmeta.fire_rate || 0.3;
      emitNoise(state.player.x, state.player.y, wmeta.noise_db || 145, 'gunshot');
      DD.Renderer.playSfx(state.player.weapon === 'mossberg_500' ? 'sfx_gun_shotgun.wav' : 'sfx_gun_pistol.wav');
      var maxR = wmeta.range || 16;
      var bestZ = null, bestT = maxR;
      for (var i = 0; i < state.zombies.length; i++) {
        var z = state.zombies[i];
        if (z.state === DD.ZSTATE.DEAD) continue;
        var rx = z.x - state.player.x, ry = z.y - state.player.y;
        var proj = rx * state.player.fx + ry * state.player.fy;
        if (proj > 0 && proj < bestT) {
          var perp = Math.abs(rx * state.player.fy - ry * state.player.fx);
          if (perp <= 0.75) { bestT = proj; bestZ = z; }
        }
      }
      if (bestZ) {
        if (Sys.damageZombie(bestZ, wmeta.damage || 38, 0.25)) state.kills += 1;
      }
    } else {
      state.player.attackCd = 0.42;
      emitNoise(state.player.x, state.player.y, wmeta.noise_db || 70, 'melee');
      DD.Renderer.playSfx('sfx_melee_swing.wav');
      var ids = state.spatial.queryRadius(state.player.x, state.player.y, (wmeta.range || 1.8) + 0.6);
      for (var j = 0; j < ids.length; j++) {
        var zm = state.zombies[ids[j]];
        if (!zm || zm.state === DD.ZSTATE.DEAD) continue;
        var d = Math.hypot(zm.x - state.player.x, zm.y - state.player.y);
        if (d <= (wmeta.range || 1.8)) {
          if (Sys.damageZombie(zm, wmeta.damage || 24, wmeta.stun || 0.3)) state.kills += 1;
          DD.Renderer.playSfx('sfx_melee_hit.wav');
          break;
        }
      }
    }
    updateHud();
  }

  function performReload() {
    if (!state) return;
    var wmeta = DataDB.getItem(state.player.weapon);
    if (!wmeta || wmeta.cat !== 'firearm') return;
    var need = (wmeta.mag_cap || 10) - (state.player.ammo[state.player.weapon] || 0);
    if (need <= 0) return;
    var avail = Sys.countItem(state.inv, wmeta.ammo_type);
    var take = Math.min(need, avail);
    if (take > 0) {
      Sys.removeItem(state.inv, wmeta.ammo_type, take);
      state.player.ammo[state.player.weapon] = (state.player.ammo[state.player.weapon] || 0) + take;
      DD.Renderer.playSfx('sfx_gun_reload.wav');
      addToast('Перезаряжено +' + take);
      updateHud();
    }
  }

  function performInteract() {
    if (!state || state.paused || state.health.dead) return;
    if (state.player.inVehicleId) {
      state.player.inVehicleId = '';
      addToast('Вы вышли из машины.');
      return;
    }
    for (var vi = 0; vi < state.vehicles.length; vi++) {
      var v = state.vehicles[vi];
      if (Math.hypot(v.x - state.player.x, v.y - state.player.y) <= 2.5) {
        state.player.inVehicleId = v.id;
        addToast('За рулём: ' + v.name + ' (топливо ' + v.fuel.toFixed(1) + ' л)');
        return;
      }
    }
    for (var ni = 0; ni < state.npcs.length; ni++) {
      var npc = state.npcs[ni];
      if (npc.hp > 0 && Math.hypot(npc.x - state.player.x, npc.y - state.player.y) <= 2.8) {
        openNpcModal(npc);
        return;
      }
    }
    var candidates = [
      [Math.round(state.player.x + state.player.fx), Math.round(state.player.y + state.player.fy)],
      [Math.round(state.player.x), Math.round(state.player.y)]
    ];
    for (var ci = 0; ci < candidates.length; ci++) {
      var tx = candidates[ci][0], ty = candidates[ci][1];
      var k = tx + ',' + ty;
      if (state.world.getTile(tx, ty) === TILE.DOOR && state.world.toggleDoor(tx, ty)) {
        DD.Renderer.playSfx('sfx_door_open.wav');
        emitNoise(tx, ty, 58, 'door');
        recomputeFovAndFlow();
        return;
      }
      var cont = state.world.containers[k];
      if (cont && !cont.looted) {
        cont.looted = true;
        var found = Sys.rollZoneLoot(cont.zone, state.util.hoursOutage);
        for (var fi = 0; fi < found.length; fi++) {
          Sys.addItem(state.inv, found[fi].id, found[fi].qty, found[fi].freshness);
        }
        addToast('Обыск: найдено предметов ' + found.length);
        return;
      }
      for (var pi = 0; pi < state.farms.length; pi++) {
        var fp = state.farms[pi];
        if (fp.tx === tx && fp.ty === ty && fp.stage >= 3 && !fp.dead) {
          Sys.addItem(state.inv, fp.crop, 3, 1);
          state.farms.splice(pi, 1);
          addToast('Собран урожай: ' + fp.crop);
          return;
        }
      }
    }
  }

  function updateHud() {
    if (!state) return;
    var set = function (id, txt) { var el = document.getElementById(id); if (el) el.textContent = txt; };
    set('hud-hp', Math.round(state.health.globalHp) + '%');
    set('hud-blood', Math.round(state.health.bloodMl) + ' мл');
    set('hud-hunger', Math.round(state.needs.hunger) + '%');
    set('hud-thirst', Math.round(state.needs.thirst) + '%');
    set('hud-temp', state.needs.bodyTempC.toFixed(1) + '°C');
    var hh = Math.floor(state.tw.hour);
    var mm = Math.floor((state.tw.hour - hh) * 60);
    set('hud-time', 'День ' + state.tw.day + ' ' + String(hh).padStart(2, '0') + ':' + String(mm).padStart(2, '0') + ' · ' + state.tw.weather.toUpperCase());
    var wmeta = DataDB.getItem(state.player.weapon);
    var wtxt = (wmeta && wmeta.name) || state.player.weapon;
    if (wmeta && wmeta.cat === 'firearm') {
      wtxt += ' (' + (state.player.ammo[state.player.weapon] || 0) + '/' + Sys.countItem(state.inv, wmeta.ammo_type) + ')';
    }
    set('hud-weapon', wtxt);
    var aliveZ = 0, actZ = 0;
    for (var i = 0; i < state.zombies.length; i++) {
      if (state.zombies[i].state !== DD.ZSTATE.DEAD) {
        aliveZ++;
        if (state.zombies[i].lod === 'ACTIVE') actZ++;
      }
    }
    set('hud-zombies', actZ + '/' + aliveZ + ' (убито ' + state.kills + ')');

    var moodles = [];
    if (state.needs.hunger < 40) moodles.push('Голод');
    if (state.needs.thirst < 40) moodles.push('Жажда');
    if (state.needs.bodyTempC < 35) moodles.push('Переохлаждение');
    if (state.health.bloodMl < 4200) moodles.push('Кровопотеря');
    if (Sys.getTotalWeight(state.inv) > Sys.getMaxWeight(state.inv)) moodles.push('Перегруз');
    set('hud-moodles', moodles.length ? moodles.join(', ') : 'Норма');
  }

  function closeModals() {
    activeModal = '';
    var mo = document.getElementById('modal-overlay');
    if (mo) mo.hidden = true;
    var po = document.getElementById('pause-overlay');
    if (po) po.hidden = true;
    var dO = document.getElementById('death-overlay');
    if (dO) dO.hidden = true;
  }

  function openModal(kind) {
    if (!state) return;
    if (activeModal === kind) { closeModals(); return; }
    activeModal = kind;
    var mo = document.getElementById('modal-overlay');
    var title = document.getElementById('modal-title');
    var body = document.getElementById('modal-body');
    var list = document.getElementById('modal-list');
    if (!mo || !title || !body || !list) return;
    mo.hidden = false;
    list.innerHTML = '';

    if (kind === 'inv') {
      title.textContent = 'ИНВЕНТАРЬ (' + Sys.getTotalWeight(state.inv).toFixed(1) + '/' + Sys.getMaxWeight(state.inv).toFixed(1) + ' кг)';
      body.textContent = 'Нажмите на предмет: еда утолит голод/жажду, оружие экипируется, семена сажаются под ноги.';
      for (var i = 0; i < state.inv.items.length; i++) {
        (function (slot) {
          var meta = DataDB.getItem(slot.id) || { name: slot.id };
          var btn = document.createElement('button');
          btn.className = 'dd-btn';
          btn.textContent = meta.name + ' x' + slot.qty + ' (' + ((meta.weight || 0.1) * slot.qty).toFixed(1) + ' кг)';
          btn.addEventListener('click', function () {
            if (meta.cat === 'food' || meta.cat === 'drink') {
              Sys.removeItem(state.inv, slot.id, 1);
              state.needs.hunger = Math.min(100, state.needs.hunger + (meta.hunger || 0));
              state.needs.thirst = Math.min(100, state.needs.thirst + (meta.thirst || 0));
              DD.Renderer.playSfx('sfx_eat_drink.wav');
              addToast('Употреблено: ' + meta.name);
            } else if (meta.cat === 'melee' || meta.cat === 'firearm') {
              state.player.weapon = slot.id;
              addToast('Экипировано: ' + meta.name);
            } else if (meta.cat === 'clothing' && meta.slot) {
              var prev = state.inv.equipment[meta.slot];
              Sys.removeItem(state.inv, slot.id, 1);
              if (prev) Sys.addItem(state.inv, prev, 1, 1);
              state.inv.equipment[meta.slot] = slot.id;
              addToast('Надето: ' + meta.name);
            } else if (meta.cat === 'seed') {
              var ptx = Math.round(state.player.x), pty = Math.round(state.player.y);
              var tt = state.world.getTile(ptx, pty);
              if (tt === TILE.GRASS || tt === TILE.DIRT) {
                Sys.removeItem(state.inv, slot.id, 1);
                state.farms.push({ tx: ptx, ty: pty, crop: meta.crop, growthDays: 0, targetDays: 4, stage: 0, water: 70, dead: false });
                addToast('Посажена грядка: ' + meta.crop);
              }
            }
            activeModal = '';
            openModal('inv');
            updateHud();
          });
          list.appendChild(btn);
        })(state.inv.items[i]);
      }
    } else if (kind === 'health') {
      title.textContent = 'ЗДОРОВЬЕ ЧАСТЕЙ ТЕЛА';
      body.textContent = 'Кровь: ' + Math.round(state.health.bloodMl) + ' мл | Вирус: ' + Math.round(state.health.zombification) + '%';
      for (var p = 0; p < DD.BODY_PARTS.length; p++) {
        (function (partName) {
          var pr = state.health.parts[partName];
          var btn = document.createElement('button');
          btn.className = 'dd-btn';
          btn.textContent = partName + ': ' + Math.round(pr.hp) + '% | Ран:' + (pr.scratches + pr.lacerations) + ' Укус:' + pr.bites + ' Бинт:' + (pr.bandaged ? 'ДА' : 'НЕТ');
          btn.addEventListener('click', function () {
            if (Sys.removeItem(state.inv, 'sterile_bandage', 1) || Sys.removeItem(state.inv, 'bandage', 1)) {
              pr.bandaged = true;
              pr.bandageClean = true;
              DD.Renderer.playSfx('sfx_bandage_wrap.wav');
              addToast('Перевязано: ' + partName);
            } else if (Sys.removeItem(state.inv, 'antiseptic', 1)) {
              pr.disinfected = true;
              addToast('Обработано антисептиком: ' + partName);
            } else {
              addToast('Нет бинта или антисептика');
            }
            activeModal = '';
            openModal('health');
            updateHud();
          });
          list.appendChild(btn);
        })(DD.BODY_PARTS[p]);
      }
    } else if (kind === 'craft') {
      title.textContent = 'КРАФТ И СТРОЙКА';
      var nearHeat = state.campfires.some(function (cf) { return Math.hypot(cf.tx - state.player.x, cf.ty - state.player.y) <= 6; });
      body.textContent = 'Костёр рядом: ' + (nearHeat ? 'ДА' : 'НЕТ');
      var rKeys = Object.keys(DataDB.recipesMap);
      for (var ri = 0; ri < rKeys.length; ri++) {
        (function (rid) {
          var rec = DataDB.recipesMap[rid];
          var btn = document.createElement('button');
          btn.className = 'dd-btn';
          btn.textContent = 'Крафт: ' + rec.name;
          btn.addEventListener('click', function () {
            var res = Sys.craftRecipe(rid, state.inv, true, nearHeat);
            addToast(res.msg);
            updateHud();
          });
          list.appendChild(btn);
        })(rKeys[ri]);
      }
      var cfBtn = document.createElement('button');
      cfBtn.className = 'dd-btn';
      cfBtn.textContent = 'Построить костёр (2 доски)';
      cfBtn.addEventListener('click', function () {
        if (Sys.removeItem(state.inv, 'wood_plank', 2)) {
          state.campfires.push({ tx: Math.round(state.player.x + state.player.fx), ty: Math.round(state.player.y + state.player.fy) });
          addToast('Костёр разведён!');
        } else addToast('Нужны 2 доски');
        activeModal = '';
        openModal('craft');
      });
      list.appendChild(cfBtn);
    } else if (kind === 'qa') {
      title.textContent = 'ДИАГНОСТИКА И QA-БОТЫ';
      var okSave = DD.SaveManager.save({ test: 1, tw: state.tw }, 'dd_qa_test');
      var loaded = DD.SaveManager.load('dd_qa_test');
      var lines = [
        'ErrorManager: ' + Object.keys(DD.ErrorManager.catalog).length + ' кодов',
        'DataDB: ' + Object.keys(DataDB.itemsMap).length + ' предметов, ' + Object.keys(DataDB.realMap).length + ' /data/real/',
        'SaveManager: ' + (okSave && loaded ? 'OK (checksum + .bak)' : 'FAIL'),
        'Чанков сгенерировано: ' + Object.keys(state.world.chunks).length,
        'Зомби в мире: ' + state.zombies.length + ' (лимит 1200, активных <=150)'
      ];
      body.textContent = lines.join(' | ');
    }
  }

  function openNpcModal(npc) {
    activeModal = 'npc';
    var mo = document.getElementById('modal-overlay');
    var title = document.getElementById('modal-title');
    var body = document.getElementById('modal-body');
    var list = document.getElementById('modal-list');
    if (!mo || !title || !body || !list) return;
    mo.hidden = false;
    title.textContent = npc.name + ' (' + npc.action + ')';
    body.textContent = (npc.dialogues && npc.dialogues.greet) || 'Будь осторожен в этом районе.';
    list.innerHTML = '';
    if (npc.hostility < 0.45) {
      var btn = document.createElement('button');
      btn.className = 'dd-btn';
      btn.textContent = 'Обменять консервы на бинт';
      btn.addEventListener('click', function () {
        if (Sys.removeItem(state.inv, 'canned_beans', 1)) {
          Sys.addItem(state.inv, 'bandage', 1, 1);
          addToast('Обмен с ' + npc.name + ' завершён!');
        } else addToast('Нет консервов для обмена.');
      });
      list.appendChild(btn);
    }
  }

  function showDeathScreen(cause) {
    closeModals();
    var dO = document.getElementById('death-overlay');
    var dr = document.getElementById('death-reason');
    if (dr) dr.textContent = cause + ' · Прожито дней: ' + state.tw.day + ' · Убито зомби: ' + state.kills;
    if (dO) dO.hidden = false;
  }

  function loop(ts) {
    if (!lastTime) lastTime = ts;
    var dt = Math.min(0.05, Math.max(0.001, (ts - lastTime) / 1000));
    lastTime = ts;
    stepSimulation(dt);
    DD.Renderer.renderFrame(canvasEl, state);
    updateHud();
    rafId = global.requestAnimationFrame(loop);
  }

  function bindUi() {
    var onClick = function (id, fn) {
      var el = document.getElementById(id);
      if (el) el.addEventListener('click', fn);
    };
    onClick('btn-inv', function () { openModal('inv'); });
    onClick('btn-health', function () { openModal('health'); });
    onClick('btn-craft', function () { openModal('craft'); });
    onClick('btn-catalog', function () { if (DD.CatalogF3) DD.CatalogF3.toggle(); });
    onClick('btn-qa', function () { openModal('qa'); });
    onClick('btn-interact', performInteract);
    onClick('btn-attack', performAttack);
    onClick('btn-flash', function () { if (state) { state.player.flashlightOn = !state.player.flashlightOn; recomputeFovAndFlow(); } });
    onClick('btn-reload', performReload);
    onClick('btn-save', function () {
      if (state && DD.SaveManager.save({ player: state.player, tw: state.tw, needs: state.needs, health: state.health, inv: state.inv, util: state.util })) {
        addToast('Игра сохранена!');
      }
    });
    onClick('btn-load', function () { newGame(true); });
    onClick('btn-pause', function () {
      if (!state) return;
      state.paused = !state.paused;
      var po = document.getElementById('pause-overlay');
      if (po) po.hidden = !state.paused;
    });
    onClick('btn-mute', function () {
      DD.Renderer.setMuted(!DD.Renderer.isMuted());
      addToast(DD.Renderer.isMuted() ? 'Звук выключен' : 'Звук включён');
    });
    onClick('btn-new', function () { newGame(false); });
    onClick('modal-close', closeModals);
    onClick('btn-resume', function () { if (state) { state.paused = false; closeModals(); } });
    onClick('btn-pause-save', function () {
      if (state && DD.SaveManager.save({ player: state.player, tw: state.tw, needs: state.needs, health: state.health, inv: state.inv, util: state.util })) addToast('Сохранено!');
    });
    onClick('btn-pause-load', function () { newGame(true); });
    onClick('btn-pause-new', function () { newGame(false); });
    onClick('btn-death-restart', function () { newGame(false); });

    // Сенсорная крестовина на телефоне
    var bindHold = function (id, dx, dy) {
      var el = document.getElementById(id);
      if (!el) return;
      var start = function (e) { if (e && e.preventDefault) e.preventDefault(); touchVec.x = dx; touchVec.y = dy; };
      var stop = function () { touchVec.x = 0; touchVec.y = 0; };
      el.addEventListener('pointerdown', start);
      el.addEventListener('pointerup', stop);
      el.addEventListener('pointerleave', stop);
      el.addEventListener('touchstart', start);
      el.addEventListener('touchend', stop);
    };
    bindHold('touch-up', 0, -1);
    bindHold('touch-down', 0, 1);
    bindHold('touch-left', -1, 0);
    bindHold('touch-right', 1, 0);
    onClick('touch-attack', performAttack);
    onClick('touch-interact', performInteract);

    global.addEventListener('keydown', function (e) {
      if (e.code === 'F3') {
        if (e.preventDefault) e.preventDefault();
        if (DD.CatalogF3) DD.CatalogF3.toggle();
        return;
      }
      var activeTag = document.activeElement && document.activeElement.tagName;
      if (activeTag === 'INPUT' || activeTag === 'TEXTAREA') {
        if (e.code === 'Escape' && DD.CatalogF3 && DD.CatalogF3.isOpen()) DD.CatalogF3.close();
        return;
      }
      keys[e.code] = true;
      if (e.code === 'KeyE') performInteract();
      else if (e.code === 'KeyR') performReload();
      else if (e.code === 'KeyF' && state) { state.player.flashlightOn = !state.player.flashlightOn; recomputeFovAndFlow(); }
      else if (e.code === 'KeyI') openModal('inv');
      else if (e.code === 'KeyH') openModal('health');
      else if (e.code === 'KeyC') openModal('craft');
      else if (e.code === 'Space') performAttack();
      else if (e.code === 'Escape') {
        if (DD.CatalogF3 && DD.CatalogF3.isOpen()) DD.CatalogF3.close();
        else if (activeModal) closeModals();
        else if (state) {
          state.paused = !state.paused;
          var po = document.getElementById('pause-overlay');
          if (po) po.hidden = !state.paused;
        }
      }
    });
    global.addEventListener('keyup', function (e) { keys[e.code] = false; });

    if (canvasEl) {
      canvasEl.addEventListener('mousedown', function (e) {
        if (!state || state.paused || activeModal || (DD.CatalogF3 && DD.CatalogF3.isOpen())) return;
        if (e.button === 0) performAttack();
      });
    }
  }

  function init() {
    canvasEl = document.getElementById('game');
    DD.Renderer.initSprites();
    if (DD.CatalogF3) {
      DD.CatalogF3.init({
        onToggle: function (open) {
          if (state) state.paused = open;
        }
      });
    }
    bindUi();
    newGame(false);
    DD.Renderer.renderFrame(canvasEl, state);
    if (!rafId && typeof global.requestAnimationFrame === 'function') {
      rafId = global.requestAnimationFrame(loop);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})(window);
