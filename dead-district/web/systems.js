(function (global) {
  'use strict';

  var DD = global.DD = global.DD || {};
  var TILE = DD.TILE;
  var DataDB = DD.DataDB;
  var ErrorManager = DD.ErrorManager;

  var BODY_PARTS = ['HEAD', 'TORSO', 'ARM_L', 'ARM_R', 'LEG_L', 'LEG_R'];
  DD.BODY_PARTS = BODY_PARTS;

  var ZSTATE = {
    IDLE: 0, WANDER: 1, INVESTIGATE_NOISE: 2, CHASE: 3, ATTACK: 4,
    CLIMB_WINDOW: 5, BREAK_DOOR: 6, STUNNED: 7, CRAWLING: 8, DEAD: 9
  };
  DD.ZSTATE = ZSTATE;

  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

  // 1. Время и климат
  function createTimeWeather() {
    return {
      day: 1, hour: 8.0, weather: 'clear',
      ambientTempC: 20.0, darkness: 0.0,
      rainIntensity: 0.0, snowIntensity: 0.0, fogIntensity: 0.0,
      weatherTimerH: 0.0
    };
  }

  function stepTimeWeather(tw, dh) {
    tw.hour += dh;
    if (tw.hour >= 24) { tw.hour -= 24; tw.day += 1; }
    tw.weatherTimerH += dh;
    var yearDay = (tw.day - 1) % 120;
    var season = yearDay < 30 ? 'spring' : (yearDay < 60 ? 'summer' : (yearDay < 90 ? 'autumn' : 'winter'));
    if (tw.weatherTimerH >= 4.0) {
      tw.weatherTimerH = 0;
      var r = DD.rand();
      if (season === 'winter') {
        tw.weather = r < 0.28 ? 'snow' : (r < 0.45 ? 'fog' : (r < 0.72 ? 'cloudy' : 'clear'));
      } else {
        tw.weather = r < 0.14 ? 'storm' : (r < 0.34 ? 'rain' : (r < 0.48 ? 'fog' : (r < 0.72 ? 'cloudy' : 'clear')));
      }
    }
    var janC = DataDB.getReal('clim_jan_mean_temp_c', 1.6);
    var julC = DataDB.getReal('clim_july_mean_temp_c', 26.3);
    var mean = (julC + janC) * 0.5 + (julC - janC) * 0.5 * Math.sin((yearDay / 120) * Math.PI * 2);
    var diur = 5.5 * Math.sin(((tw.hour - 9) / 24) * Math.PI * 2);
    tw.rainIntensity = tw.weather === 'storm' ? 1.0 : (tw.weather === 'rain' ? 0.65 : 0.0);
    tw.snowIntensity = tw.weather === 'snow' ? 0.8 : 0.0;
    tw.fogIntensity = tw.weather === 'fog' ? 0.85 : 0.0;
    var wMod = tw.weather === 'snow' ? -6 : (tw.weather === 'storm' ? -4.5 : (tw.weather === 'rain' ? -3 : (tw.weather === 'fog' ? -2 : (tw.weather === 'cloudy' ? -1.5 : 0))));
    tw.ambientTempC = clamp(mean + diur + wMod, -18, 40);
    if (tw.hour >= 6.5 && tw.hour <= 19.5) tw.darkness = 0;
    else if (tw.hour > 19.5 && tw.hour < 21.5) tw.darkness = ((tw.hour - 19.5) / 2) * 0.85;
    else if (tw.hour >= 5.0 && tw.hour < 6.5) tw.darkness = ((6.5 - tw.hour) / 1.5) * 0.85;
    else tw.darkness = 0.85;
    if (tw.weather === 'storm') tw.darkness = Math.min(0.9, tw.darkness + 0.18);
    tw.season = season;
  }

  // 2. Коммунальные сети и генераторы
  function createUtilities() {
    var shutDay = Math.round(DataDB.getReal('power_grid_shutoff_days', 14));
    return {
      gridPowerOn: true,
      gridWaterOn: true,
      powerShutoffDay: shutDay,
      waterShutoffDay: shutDay + 2,
      hoursOutage: 0,
      generators: []
    };
  }

  // 3. Потребности и здоровье
  function createNeeds() {
    return {
      hunger: 85, thirst: 85, fatigue: 10,
      bodyTempC: DataDB.getReal('med_normal_body_temp_c', 37.0),
      stress: 5, boredom: 10, stamina: 100
    };
  }

  function createHealth() {
    var maxB = DataDB.getReal('med_blood_volume_ml', 5000);
    var parts = {};
    for (var i = 0; i < BODY_PARTS.length; i++) {
      parts[BODY_PARTS[i]] = {
        hp: 100, scratches: 0, lacerations: 0, bites: 0,
        bleedRate: 0, bandaged: false, bandageClean: true,
        disinfected: false, bacterial: 0, fractureDays: 0, splinted: false
      };
    }
    return {
      maxBloodMl: maxB, bloodMl: maxB, globalHp: 100, pain: 0,
      zombification: 0, dead: false, deathCause: '', parts: parts
    };
  }

  function applyWound(health, part, rawDmg, biteChance, infectChance, armor) {
    if (health.dead) return null;
    var p = health.parts[part] ? part : BODY_PARTS[DD.randInt(0, BODY_PARTS.length - 1)];
    var rec = health.parts[p];
    var absorbed = rawDmg * Math.min(0.75, (armor && armor.scratchDef) || 0);
    var dmg = Math.max(2, rawDmg - absorbed);
    rec.hp = Math.max(0, rec.hp - dmg);
    health.globalHp = Math.max(0, health.globalHp - dmg * 0.45);
    var wound = 'царапина';
    var r = DD.rand();
    if (r < biteChance * (1 - ((armor && armor.biteDef) || 0))) {
      wound = 'укус';
      rec.bites += 1;
      rec.bleedRate += 420;
      rec.bandaged = false;
      health.pain = Math.min(100, health.pain + 45);
      if (DD.rand() < infectChance) health.zombification = Math.max(health.zombification, 5);
    } else if (r < 0.45 * (1 - ((armor && armor.scratchDef) || 0))) {
      wound = 'рваная рана';
      rec.lacerations += 1;
      rec.bleedRate += 320;
      rec.bandaged = false;
      health.pain = Math.min(100, health.pain + 30);
    } else {
      rec.scratches += 1;
      rec.bleedRate += 110;
      rec.bandaged = false;
      health.pain = Math.min(100, health.pain + 15);
    }
    if (p === 'HEAD' && rec.hp <= 0) {
      health.dead = true;
      health.deathCause = 'Смертельная черепно-мозговая травма';
    }
    return { part: p, wound: wound, dmg: dmg };
  }

  // 4. Инвентарь
  function createInventory() {
    var inv = {
      items: [],
      equipment: { head: '', torso: 'tshirt', legs: 'jeans', feet: 'sneakers', hands: '', back: '' }
    };
    var starter = [
      ['baseball_bat', 1], ['glock_17', 1], ['ammo_9mm', 24],
      ['canned_beans', 2], ['bottled_water', 2], ['bandage', 3],
      ['antiseptic', 1], ['can_opener', 1], ['flashlight', 1],
      ['wood_plank', 2], ['nails', 3], ['seeds_radish', 2]
    ];
    for (var i = 0; i < starter.length; i++) {
      addItem(inv, starter[i][0], starter[i][1], 1.0);
    }
    return inv;
  }

  function countItem(inv, id) {
    var total = 0;
    for (var i = 0; i < inv.items.length; i++) {
      if (inv.items[i].id === id) total += inv.items[i].qty;
    }
    return total;
  }

  function getTotalWeight(inv) {
    var w = 0;
    for (var i = 0; i < inv.items.length; i++) {
      var meta = DataDB.getItem(inv.items[i].id);
      w += ((meta && meta.weight) || 0.1) * inv.items[i].qty;
    }
    var back = inv.equipment.back ? DataDB.getItem(inv.equipment.back) : null;
    if (back && back.weight_reduction) w *= (1 - Math.min(0.5, back.weight_reduction * 0.5));
    return w;
  }

  function getMaxWeight(inv) {
    var cap = 14.0;
    var back = inv.equipment.back ? DataDB.getItem(inv.equipment.back) : null;
    if (back && back.cap_bonus) cap += back.cap_bonus;
    return cap;
  }

  function addItem(inv, id, qty, freshness) {
    var meta = DataDB.getItem(id);
    if (!meta || qty <= 0) return false;
    if (getTotalWeight(inv) + (meta.weight || 0.1) * qty > 34.0) return false;
    var maxStack = meta.stack || 1;
    var rem = qty;
    if (maxStack > 1) {
      for (var i = 0; i < inv.items.length && rem > 0; i++) {
        if (inv.items[i].id === id && inv.items[i].qty < maxStack) {
          var addNow = Math.min(rem, maxStack - inv.items[i].qty);
          inv.items[i].qty += addNow;
          rem -= addNow;
        }
      }
    }
    while (rem > 0) {
      var chunk = Math.min(rem, maxStack);
      inv.items.push({ id: id, qty: chunk, freshness: clamp(freshness === undefined ? 1 : freshness, 0, 1) });
      rem -= chunk;
    }
    return true;
  }

  function removeItem(inv, id, qty) {
    if (qty <= 0 || countItem(inv, id) < qty) return false;
    var rem = qty;
    for (var i = inv.items.length - 1; i >= 0 && rem > 0; i--) {
      if (inv.items[i].id === id) {
        var take = Math.min(rem, inv.items[i].qty);
        inv.items[i].qty -= take;
        rem -= take;
        if (inv.items[i].qty <= 0) inv.items.splice(i, 1);
      }
    }
    return true;
  }

  // 5. Лут, крафт, стройка, фермерство, транспорт
  function rollZoneLoot(zoneId, outageH) {
    var z = DataDB.lootZones[zoneId] || DataDB.lootZones.residential;
    if (!z || !z.entries || !z.entries.length) return [{ id: 'canned_beans', qty: 1, freshness: 1 }];
    var totalW = 0;
    for (var i = 0; i < z.entries.length; i++) totalW += (z.entries[i].weight || 1);
    var rolls = DD.randInt((z.rolls && z.rolls[0]) || 2, (z.rolls && z.rolls[1]) || 4);
    var out = [];
    for (var r = 0; r < rolls; r++) {
      var pick = DD.rand() * totalW;
      var acc = 0;
      for (var j = 0; j < z.entries.length; j++) {
        acc += (z.entries[j].weight || 1);
        if (pick <= acc) {
          var iid = z.entries[j].id;
          var meta = DataDB.getItem(iid);
          var qty = (meta && meta.cat === 'ammo') ? DD.randInt(5, 16) : 1;
          var fresh = (meta && meta.perishable && outageH > 4) ? clamp(1 - (outageH - 4) / 48, 0, 1) : 1;
          out.push({ id: iid, qty: qty, freshness: fresh });
          break;
        }
      }
    }
    return out;
  }

  function craftRecipe(recipeId, inv, nearWb, nearHeat) {
    var rec = DataDB.recipesMap[recipeId];
    if (!rec) return { ok: false, msg: 'Рецепт не найден' };
    if (rec.requires_workbench && !nearWb) return { ok: false, msg: 'Нужен верстак (или костёр рядом)' };
    if (rec.requires_heat && !nearHeat) return { ok: false, msg: 'Нужен костёр или плита' };
    var tools = rec.tools || [];
    for (var t = 0; t < tools.length; t++) {
      if (countItem(inv, tools[t]) <= 0) return { ok: false, msg: 'Нет инструмента: ' + tools[t] };
    }
    var ings = rec.ingredients || [];
    for (var i = 0; i < ings.length; i++) {
      if (countItem(inv, ings[i].id) < ings[i].qty) return { ok: false, msg: 'Не хватает: ' + ings[i].id };
    }
    for (var j = 0; j < ings.length; j++) removeItem(inv, ings[j].id, ings[j].qty);
    if (rec.result && rec.result.id && rec.result.id !== 'repair_equipped_melee') {
      addItem(inv, rec.result.id, rec.result.qty || 1, 1.0);
    }
    return { ok: true, msg: 'Скрафчено: ' + rec.name };
  }

  // 6. Зомби FSM (10 состояний, 5 типов) + LOD (150 активных / 1200 всего)
  function createZombie(id, type, x, y) {
    var st = DataDB.zombiesMap[type] || DataDB.zombiesMap.walker || {};
    return {
      id: id, type: type, x: x, y: y, dx: 0, dy: 1,
      hp: st.hp || 100, maxHp: st.hp || 100,
      speed: st.speed || 2.35, damage: st.damage || 16,
      vision: st.vision_range || 14, doorDmg: st.door_damage || 14,
      infectChance: st.infect_chance || 0.12, biteChance: st.bite_chance || 0.28,
      state: type === 'crawler' ? ZSTATE.CRAWLING : ZSTATE.IDLE,
      lod: 'DORMANT', tx: x, ty: y, timer: DD.randRange(0.5, 3.0), attackCd: 0,
      crippled: type === 'crawler'
    };
  }

  function damageZombie(z, dmg, stunChance) {
    if (z.state === ZSTATE.DEAD) return false;
    z.hp = Math.max(0, z.hp - dmg);
    if (z.hp <= 0) {
      z.state = ZSTATE.DEAD;
      return true;
    }
    if (!z.crippled && z.hp < z.maxHp * 0.35 && DD.rand() < 0.35) {
      z.crippled = true;
      z.speed *= 0.45;
      z.state = ZSTATE.CRAWLING;
    } else if (DD.rand() < stunChance) {
      z.timer = 0.65;
      z.state = ZSTATE.STUNNED;
    }
    return false;
  }

  function stepZombieActive(z, dt, px, py, playerVisible, flowField, world) {
    if (z.state === ZSTATE.DEAD) return null;
    if (z.attackCd > 0) z.attackCd = Math.max(0, z.attackCd - dt);
    var dist = Math.hypot(px - z.x, py - z.y);

    if (z.state === ZSTATE.STUNNED) {
      z.timer -= dt;
      if (z.timer <= 0) z.state = z.crippled ? ZSTATE.CRAWLING : ZSTATE.CHASE;
      return null;
    }

    if ((playerVisible && dist <= z.vision) || dist <= 3.5) {
      z.tx = px; z.ty = py;
      if (!z.crippled && z.state !== ZSTATE.CLIMB_WINDOW && z.state !== ZSTATE.BREAK_DOOR) {
        z.state = ZSTATE.CHASE;
      }
    }

    if (dist <= 1.2) {
      z.state = ZSTATE.ATTACK;
      if (z.attackCd <= 0) {
        z.attackCd = 1.15;
        return { attack: true, damage: z.damage, biteChance: z.biteChance, infectChance: z.infectChance };
      }
      return null;
    }

    if (z.state === ZSTATE.IDLE) {
      z.timer -= dt;
      if (z.timer <= 0) {
        z.timer = DD.randRange(2, 5);
        z.tx = z.x + DD.randRange(-6, 6);
        z.ty = z.y + DD.randRange(-6, 6);
        z.state = ZSTATE.WANDER;
      }
    } else if (z.state === ZSTATE.WANDER || z.state === ZSTATE.INVESTIGATE_NOISE) {
      var spd = z.speed * (z.state === ZSTATE.WANDER ? 0.55 : 0.85);
      steerZombie(z, z.tx, z.ty, spd, dt, world, false);
      if (Math.hypot(z.tx - z.x, z.ty - z.y) < 0.7) {
        z.state = ZSTATE.IDLE;
        z.timer = DD.randRange(1, 3);
      }
    } else if (z.state === ZSTATE.CHASE || z.state === ZSTATE.CRAWLING || z.state === ZSTATE.ATTACK) {
      var fdir = DD.sampleFlow(flowField, Math.round(z.x), Math.round(z.y));
      var mx = (fdir.x !== 0 || fdir.y !== 0) ? z.x + fdir.x * 2 : px;
      var my = (fdir.x !== 0 || fdir.y !== 0) ? z.y + fdir.y * 2 : py;
      var res = steerZombie(z, mx, my, z.speed, dt, world, true);
      if (res === 'door') z.state = ZSTATE.BREAK_DOOR;
      else if (res === 'window') { z.state = ZSTATE.CLIMB_WINDOW; z.timer = 1.1; }
    } else if (z.state === ZSTATE.BREAK_DOOR) {
      var dtx = Math.round(z.x + z.dx * 0.9);
      var dty = Math.round(z.y + z.dy * 0.9);
      if (world.getTile(dtx, dty) === TILE.DOOR && world.doors[dtx + ',' + dty] && !world.doors[dtx + ',' + dty].open) {
        if (z.attackCd <= 0) {
          z.attackCd = 0.9;
          if (world.damageDoor(dtx, dty, z.doorDmg)) z.state = ZSTATE.CHASE;
        }
      } else {
        z.state = ZSTATE.CHASE;
      }
    } else if (z.state === ZSTATE.CLIMB_WINDOW) {
      z.timer -= dt;
      if (z.timer <= 0) {
        z.x += z.dx * 1.4;
        z.y += z.dy * 1.4;
        z.state = z.crippled ? ZSTATE.CRAWLING : ZSTATE.CHASE;
      }
    }
    return null;
  }

  function steerZombie(z, tx, ty, spd, dt, world, checkObs) {
    var dx = tx - z.x;
    var dy = ty - z.y;
    var len = Math.hypot(dx, dy);
    if (len < 0.01) return 'ok';
    z.dx = dx / len;
    z.dy = dy / len;
    var nx = z.x + z.dx * spd * dt;
    var ny = z.y + z.dy * spd * dt;
    var rtx = Math.round(nx), rty = Math.round(ny);
    if (world.isWalkable(rtx, rty)) {
      z.x = nx; z.y = ny;
      return 'ok';
    }
    if (checkObs) {
      var tt = world.getTile(rtx, rty);
      if (tt === TILE.DOOR) return 'door';
      if (tt === TILE.WINDOW && !z.crippled) return 'window';
    }
    if (world.isWalkable(Math.round(nx), Math.round(z.y))) z.x = nx;
    else if (world.isWalkable(Math.round(z.x), Math.round(ny))) z.y = ny;
    return 'blocked';
  }

  // 7. Utility AI выживших NPC
  function createNpc(id, arch, x, y) {
    return {
      id: 'npc_' + id + '_' + arch.id,
      archetype: arch.id, name: arch.name, x: x, y: y,
      hp: 100, hunger: 72, thirst: 70,
      hostility: arch.hostility || 0.15, bravery: arch.bravery || 0.55,
      action: 'IDLE_PATROL', tradePool: (arch.trade_pool || ['bandage']).slice(),
      dialogues: arch.dialogues || {}, tx: x, ty: y, dx: 0, dy: 1, cd: 0
    };
  }

  function stepNpc(npc, dt, px, py, nearZ, nearCount, isNight, world) {
    if (npc.hp <= 0) return false;
    npc.hunger = Math.max(0, npc.hunger - 0.08 * dt);
    npc.thirst = Math.max(0, npc.thirst - 0.10 * dt);
    if (npc.cd > 0) npc.cd = Math.max(0, npc.cd - dt);

    var zdist = nearZ ? Math.hypot(nearZ.x - npc.x, nearZ.y - npc.y) : 999;
    var pdist = Math.hypot(px - npc.x, py - npc.y);
    var threat = clamp(nearCount * 0.25 + (1 - clamp(zdist / 14, 0, 1)) * 0.6, 0, 1);

    var scores = {
      FLEE_DANGER: clamp(threat * (1.15 - npc.bravery) + ((100 - npc.hp) / 100) * 0.65, 0, 1),
      COMBAT_THREAT: clamp(threat * npc.bravery * (npc.hp / 100) + (npc.hostility * 0.6 * (pdist < 10 ? 1 : 0)), 0, 1),
      SEEK_FOOD_WATER: clamp(Math.max((60 - npc.hunger) / 60, (60 - npc.thirst) / 60), 0, 1),
      TRADE_WITH_PLAYER: (npc.hostility < 0.45 && pdist <= 4.5 && nearCount === 0) ? 0.72 : 0,
      SEEK_SHELTER: (isNight && nearCount === 0) ? 0.58 : 0.15,
      IDLE_PATROL: 0.22
    };
    var best = 'IDLE_PATROL';
    var bestS = -1;
    var keys = Object.keys(scores);
    for (var i = 0; i < keys.length; i++) {
      if (scores[keys[i]] > bestS) { bestS = scores[keys[i]]; best = keys[i]; }
    }
    npc.action = best;

    var mx = 0, my = 0, spd = 2.6, attackPlayer = false;
    if (best === 'FLEE_DANGER') {
      var ax = nearZ ? nearZ.x : px, ay = nearZ ? nearZ.y : py;
      var fl = Math.max(0.01, Math.hypot(npc.x - ax, npc.y - ay));
      mx = (npc.x - ax) / fl; my = (npc.y - ay) / fl; spd = 5.0;
    } else if (best === 'COMBAT_THREAT') {
      if (npc.hostility >= 0.7 && pdist < 10) {
        var pl = Math.max(0.01, pdist);
        mx = (px - npc.x) / pl; my = (py - npc.y) / pl;
        if (pdist <= 7.5 && npc.cd <= 0) { npc.cd = 1.4; attackPlayer = true; }
      } else if (nearZ) {
        if (zdist > 2) {
          mx = (nearZ.x - npc.x) / zdist; my = (nearZ.y - npc.y) / zdist;
        } else if (npc.cd <= 0) {
          npc.cd = 0.9;
          damageZombie(nearZ, 28, 0.35);
        }
      }
    } else if (best === 'SEEK_FOOD_WATER') {
      npc.hunger = Math.min(100, npc.hunger + 20);
      npc.thirst = Math.min(100, npc.thirst + 20);
    } else if (best !== 'TRADE_WITH_PLAYER') {
      if (Math.hypot(npc.tx - npc.x, npc.ty - npc.y) < 1.0 || DD.rand() < 0.02) {
        npc.tx = npc.x + DD.randRange(-10, 10);
        npc.ty = npc.y + DD.randRange(-10, 10);
      }
      var dl = Math.max(0.01, Math.hypot(npc.tx - npc.x, npc.ty - npc.y));
      mx = (npc.tx - npc.x) / dl; my = (npc.ty - npc.y) / dl;
    }

    if (mx !== 0 || my !== 0) {
      npc.dx = mx; npc.dy = my;
      var nx = npc.x + mx * spd * dt;
      var ny = npc.y + my * spd * dt;
      if (world.isWalkable(Math.round(nx), Math.round(ny))) { npc.x = nx; npc.y = ny; }
    }
    return attackPlayer;
  }

  DD.Systems = {
    createTimeWeather: createTimeWeather,
    stepTimeWeather: stepTimeWeather,
    createUtilities: createUtilities,
    createNeeds: createNeeds,
    createHealth: createHealth,
    applyWound: applyWound,
    createInventory: createInventory,
    countItem: countItem,
    getTotalWeight: getTotalWeight,
    getMaxWeight: getMaxWeight,
    addItem: addItem,
    removeItem: removeItem,
    rollZoneLoot: rollZoneLoot,
    craftRecipe: craftRecipe,
    createZombie: createZombie,
    damageZombie: damageZombie,
    stepZombieActive: stepZombieActive,
    createNpc: createNpc,
    stepNpc: stepNpc
  };
})(window);
