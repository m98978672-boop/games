import { solidUnitMoveFree } from './solid_units.js';
import { unsafeRest, safeRestGoal } from './rest_positions.js';
// Индивидуальный ИИ солдата: Behavior Tree с приоритетами из спецификации,
// мораль, укрытия, медики, инженеры, а также ручное управление игроком.
import { clamp, dist, dist2, angleTo, angleDiff, degToRad, lerp } from '../core/mathx.js';
import {
  tryShoot, startReload, moveUnit, moveAlongFlow, updateTimers, reviveUnit, applyDamage, updatePerception, tryShootBuilding, vehicleHasCurrentSight,
} from './units.js';

const tankTactics = (game) => game.cfg.flag('tank_tactical_v1', true) && !!game.walls?.enabled();
const state = (u, s, label) => { if (u.state !== s) { u.state = s; u.stateLabel = label; } };

export function updateSoldier(game, u, dt) {
  if (!u.alive) return;
  updateTimers(game, u, dt);
  if (u.downed) { u.flowDir = null; return; }
  if (u.playerControlled) { updatePlayerUnit(game, u, dt); return; }
  moraleTick(game, u, dt);
  // «мысли» с LOD-частотой, движение и огонь — каждый кадр
  const interval = game.thinkInterval(u);
  u.thinkTimer -= dt;
  if (u.thinkTimer <= 0) {
    u.thinkTimer = interval;
    thinkSoldier(game, u);
  }
  // A bot that has no travel goal must vacate an opening before working or idling.
  // Never teleport, and do not interrupt a unit that is traversing a doorway.
  if (!u.isVehicle && (!u.goal || u.arrived) && unsafeRest(game, u.x, u.y, u.radius)) {
    const safe = safeRestGoal(game, u, { x: u.x, y: u.y });
    if (safe) { u.goal = safe; u.arrived = false; u.healBusy = false; u.buildBusy = false; moveAlongFlow(game, u, dt); return; }
  }
  if (u.isVehicle) updateVehicle(game, u, dt);
  else actSoldier(game, u, dt);
}

function moraleTick(game, u, dt) {
  const m = game.cfg.ai.morale;
  let delta = 0;
  const sq = u.squad;
  const cmd = sq && sq.commander;
  const inCover = !!u.coverBuilding && !u.coverBuilding.dead && dist(u.x, u.y, u.coverBuilding.x, u.coverBuilding.y) < 60;
  const cmdOk = cmd && cmd.alive && !cmd.downed;
  if (cmdOk) {
    const dc = cmd === u ? 0 : dist(u.x, u.y, cmd.x, cmd.y);
    delta += dc < 420 ? m.commanderPerSec : m.noCommanderPerSec;
  } else if (sq) delta += m.noCommanderPerSec;
  if (inCover) delta += m.inCoverPerSec;
  if (u.suppression > 0.05) delta -= m.suppressedPerSec * u.suppression;
  // передышка без боя: мораль медленно восстанавливается, отряд не застревает в панике
  if (!u.perception.hasContact && sq && sq.state !== 'retreat') delta += 1.0;
  if (u.faction === game.playerFaction && game.soldierMoraleBonus) delta += 0.2;
  u.morale = clamp(u.morale + delta * dt, 0, 100);
}

// Local, bounded withdrawal: only directly observed nearby threats and a
// clearly traversable path. This is not a strategic retreat or global planner.
export function tacticalRetreatPoint(game, u, target) {
  const d = dist(u.x, u.y, target.x, target.y);
  if (d < 1 || d > 150 || !game.world.hasLOS(u.x, u.y, target.x, target.y, true)) return null;
  const away = angleTo(target.x, target.y, u.x, u.y), r = u.radius;
  for (const offset of [0, 0.45, -0.45, 0.8, -0.8]) {
    const x = u.x + Math.cos(away + offset) * 80, y = u.y + Math.sin(away + offset) * 80;
    if (x < r || y < r || x >= game.world.W-r || y >= game.world.H-r || unsafeRest(game, x, y, r)) continue;
    if (game.walls?.enabled() && game.walls.blocksMoveSweep(u.x, u.y, x, y, r, u)) continue;
    if (!solidUnitMoveFree(game, u, x, y, 0.01, game.cfg.flag('movement_occupancy_v1', false) ? game.occupancyGrid : game.unitGrid)) continue;
    let clear = true;
    for (let i = 0; i <= 16 && clear; i++) {
      const px = u.x + (x-u.x)*i/16, py = u.y + (y-u.y)*i/16;
      for (const [ox,oy] of [[0,0],[-r,-r],[r,-r],[-r,r],[r,r]]) {
        if (!game.world.isBaseWalkable(px+ox, py+oy)) { clear = false; break; }
      }
    }
    if (clear) return {x,y};
  }
  return null;
}

// ---------- Behavior Tree ----------
export function thinkSoldier(game, u) {
  if (u.downed) return;
  updatePerception(game, u, game.dt);
  // Vehicle target memory and legacy close-awareness are not line of sight.
  const vehicleCanEngage = !u.isVehicle || !(game.cfg.flag('vehicle_visible_fire_v1', false) || tankTactics(game)) ||
    vehicleHasCurrentSight(game, u, game.unitById(u.targetId));
  // 1. Паника
  if (u.morale < game.cfg.ai.morale.panicBelow) {
    state(u, 'panic', 'паника');
    u.activity = 'flee';
    const sq = u.squad;
    const cmd = sq && sq.commander;
    // паника тянет к командиру/рубежу, а не разбрасывает бойцов по карте
    const rally = sq ? (sq.retreatPoint || sq.anchor) : null;
    const behind = cmd && cmd !== u ? { x: cmd.x, y: cmd.y } : rally || { x: u.x + (u.faction === 0 ? -160 : 160), y: u.y };
    const cover = game.world.bestCover(u.x, u.y, u.perception.threatAngle, 120, (b) => (b.occupants || 0) > 1 ? 1 : 0);
    u.goal = cover && dist(u.x, u.y, behind.x, behind.y) < 260 ? { x: cover.x, y: cover.y } : behind;
    return;
  }
  const squadNow = u.squad;
  // 1b. Отряд отходит или перегруппировывается — не задерживаемся в бою
  if (squadNow && (squadNow.state === 'retreat' || squadNow.state === 'regroup')) {
    const rp = squadNow.retreatPoint || squadNow.objective || squadNow.anchor;
    state(u, 'retreat', 'отходит');
    u.activity = 'retreat';
    const spread = 26 + (u.formationIndex % 4) * 16;
    u.goal = { x: rp.x + ((u.id % 5) - 2) * spread * 0.5, y: rp.y + ((u.id % 7) - 3) * spread * 0.5 };
    if (u.perception.hasContact && vehicleCanEngage) {
      const t = game.unitById(u.targetId);
      if (t && t.alive && dist(u.x, u.y, t.x, t.y) < 170) {
        u.aimAngle = angleTo(u.x, u.y, t.x, t.y);
        tryShoot(game, u, t, game.dt);
      }
    }
    return;
  }
  // Hold/retreat/regroup orders have priority; never replace the player's
  // explicit hold with an automatic local withdrawal.
  const target = game.unitById(u.targetId);
  const canWithdraw = game.cfg.flag('tactical_withdraw_v1', true) && !u.isVehicle &&
    squadNow?.state !== 'hold' && squadNow?.behavior !== 'hold';
  if (canWithdraw && u._withdrawUntil > game.time && u.goal && u.goal === u._withdrawGoal) {
    state(u, 'withdraw', 'отходит под огнём'); u.activity = 'retreat';
    if (target && u.perception.hasContact) {
      u.aimAngle = angleTo(u.x, u.y, target.x, target.y);
      tryShoot(game, u, target, game.dt);
    }
    return;
  }
  if (canWithdraw && (u._withdrawCooldown || 0) <= game.time && u.perception.hasContact && target &&
      (u.hp < u.maxHp * 0.4 || u.suppression > 0.7 || u.ammoRatio() <= 0.02)) {
    const point = tacticalRetreatPoint(game, u, target);
    if (point) {
      u._withdrawUntil = game.time + 2; u._withdrawCooldown = game.time + 8;
      u.goal = point; u._withdrawGoal = point; u.arrived = false; u.flowDir = null;
      u.healBusy = false; u.buildBusy = false;
      state(u, 'withdraw', 'отходит под огнём'); u.activity = 'retreat';
      game.events.emit('tacticalWithdraw', { unit: u, target, goal: point, t: game.time });
      u.aimAngle = angleTo(u.x, u.y, target.x, target.y);
      tryShoot(game, u, target, game.dt);
      return;
    }
  }
  // 1c. Патроны кончились и врага не видно — идём на склад
  if (u.ammoRatio() <= 0.02 && !u.perception.hasContact) {
    const dep = game.world.nearestPoint(u.x, u.y, (p) => p.owner === u.faction && p.hp > 0 && ['depot', 'hq', 'factory'].includes(p.type)).point;
    if (dep) {
      state(u, 'reload', 'за патронами');
      u.activity = 'resupply';
      u.goal = { x: dep.x + game.rng.range(-60, 60), y: dep.y + game.rng.range(-60, 60) };
      return;
    }
  }
  // 2. Ранен — лечиться (медика нет у самого себя, аптечка есть)
  if (u.hp < u.maxHp * 0.3 && u.medkits > 0 && !u.perception.hasContact) {
    state(u, 'heal', 'лечится');
    u.activity = 'heal';
    u.medkits--;
    u.hp = Math.min(u.maxHp, u.hp + u.maxHp * 0.45);
    game.awardXP(u.faction, u.def.xpRole, 'heal', 0.2);
    return;
  }
  // 3. Видит врага
  if (u.perception.hasContact && vehicleCanEngage) {
    const target = game.unitById(u.targetId);
    const d = target ? dist(u.x, u.y, target.x, target.y) : Infinity;
    if (target && u.ammoRatio() <= 0.02) {
      state(u, 'reload', 'нет патронов');
      u.activity = 'reload';
      requestResupply(game, u);
      const dep = game.world.nearestPoint(u.x, u.y, (p) => p.owner === u.faction && p.hp > 0 && ['depot', 'hq', 'factory'].includes(p.type)).point;
      u.goal = dep ? { x: dep.x + game.rng.range(-50, 50), y: dep.y + game.rng.range(-50, 50) } : null;
      return;
    }
    if (u.suppression > 0.55 && u.behavior !== 'hold') {
      const cover = game.world.bestCover(u.x, u.y, u.perception.threatAngle, 200, (b) => (b.occupants || 0) > 1 ? 1 : 0);
      if (cover) { u.goal = { x: cover.x, y: cover.y }; state(u, 'cover', 'в укрытие'); u.activity = 'cover'; return; }
    }
    if (target) {
      const sq = u.squad;
      const fireOk = !sq || sq.fire !== 'hold';
      const weaponRange = u.weapon.range;
      if (fireOk && d <= weaponRange) {
        // перекаты: половина стреляет, половина двигается
        const leap = sq && sq.leapfrogHold(u.formationIndex);
        state(u, 'fight', 'бой');
        u.activity = 'fight';
        u.aimAngle = angleTo(u.x, u.y, target.x, target.y);
        if (!leap) {
          const desired = Math.max(70, weaponRange * (u.weapon.kind === 'shell' ? 0.6 : 0.72));
          if (d > desired) {
            u.goal = { x: target.x + (u.x - target.x) * 0.25, y: target.y + (u.y - target.y) * 0.25 };
          } else {
            u.goal = null;
            chooseCoverForFight(game, u);
          }
        } else u.goal = null;
        tryShoot(game, u, target, game.dt);
        return;
      }
    }
  }
  // 3б. Штурм укреплений: живой цели нет, но на пути вражеская постройка
  if (game.cfg.flag('assault_forts', true) && u.ammoRatio() > 0.05) {
    const sq0 = u.squad;
    const pushing = !sq0 || ['advance', 'fight', 'capture'].includes(sq0.state);
    if (pushing && (u.activity === 'advance' || u.activity === 'fight' || !u.perception.hasContact)) {
      const forts = game.world.buildingGrid.query(u.x, u.y, Math.max(260, u.weapon.range))
        .filter((b) => !b.dead && b.built && b.faction >= 0 && b.faction !== u.faction
          && (game.cfg.building(b.type)?.category === 'fort'));
      const near = forts
        .filter((b) => dist(u.x, u.y, b.x, b.y) <= Math.max(260, u.weapon.range) && game.world.hasLOS(u.x, u.y, b.x, b.y, false))
        .sort((a, b) => dist(u.x, u.y, a.x, a.y) - dist(u.x, u.y, b.x, b.y))[0];
      if (near) {
        const d = dist(u.x, u.y, near.x, near.y);
        if (d <= u.weapon.range) {
          state(u, 'assault', 'штурмует укрепление');
          u.activity = 'fight';
          u.aimAngle = angleTo(u.x, u.y, near.x, near.y);
          u.goal = null;
          tryShootBuilding(game, u, near, game.dt);
          return;
        }
        // подходим на дистанцию огня, держась за укрытиями
        const cover = game.world.bestCover(u.x, u.y, angleTo(u.x, u.y, near.x, near.y), 120, (b) => (b.occupants || 0) > 1 ? 1 : 0);
        u.goal = cover ? { x: cover.x, y: cover.y } : { x: near.x + (u.x - near.x) * 0.4, y: near.y + (u.y - near.y) * 0.4 };
        state(u, 'advance', 'к укреплению');
        u.activity = 'advance';
        return;
      }
    }
  }
  // 4. Слышал выстрелы — проверить (если стойка не «держать»)
  if (u.perception.heard && u.perception.investigate) {
    const sq = u.squad;
    if (!sq || (sq.fire !== 'hold' && sq.state !== 'retreat')) {
      state(u, 'investigate', 'проверяет шум');
      u.activity = 'investigate';
      u.goal = { x: u.perception.heard.x, y: u.perception.heard.y };
      u.perception.investigate = false;
      if (dist(u.x, u.y, u.goal.x, u.goal.y) < 60) u.perception.heard = null;
      return;
    }
  }
  // смотрит туда, куда идёт (иначе конус зрения «слепой»)
  if (!u.perception.hasContact) u.aimAngle = u.facing;
  // 5. Приказ отряда / позиция в формации
  const sq = u.squad;
  if (uq(sq)) {
    if (sq.state === 'retreat') {
      state(u, 'retreat', 'отступает');
      u.activity = 'retreat';
    } else if (sq.behavior === 'hold' || sq.state === 'hold') {
      state(u, 'hold', 'держит позицию');
      u.activity = 'defend';
      const threat = expectedThreatAngle(game, u);
      u.facing = threat;
      u.aimAngle = threat;
      chooseCoverForFight(game, u, true);
    } else {
      state(u, 'move', 'выдвигается');
      u.activity = 'advance';
    }
    let slot = squadSlot(game, u, sq);
    // Внутри стенового ядра Formation-слот может упираться в стену:
    // занимаем место у окна (гарнизон) или внутреннюю точку укрытия.
    if (slot && game.walls && game.walls.enabled()) {
      const b = game.walls.buildingAtPoint(slot.x, slot.y);
      if (b) {
        const spot = game.walls.interiorSpot(b, slot.x, slot.y);
        if (spot) slot = { x: spot.x, y: spot.y };
      }
    }
    if (slot && u.isVehicle && game.cfg.flag('vehicle_exterior_v1', true) && game.walls?.enabled()) {
      const b = game.walls.buildingAtPoint(slot.x,slot.y);
      if (b) slot = game.logistics.exteriorPoint(u,b);
    }
    if (slot) {
      u.goal = slot;
      if ((!u.isVehicle || !game.cfg.flag('vehicle_exterior_v1', true) || !game.walls?.enabled()) && (u.activity === 'defend' || sq.behavior === 'hold')) {
        const cover = game.world.bestCover(slot.x, slot.y, expectedThreatAngle(game, u), 150, (b) => (b.occupants || 0) > 1 ? 1 : 0);
        if (cover) u.goal = { x: cover.x, y: cover.y };
      }
    }
    return;
  }
  // 6. Свободный юнит: оборона ближайшей своей точки
  if (!u.isVehicle) {
    state(u, 'idle', 'ожидает');
    u.activity = 'idle';
    const p = game.world.nearestPoint(u.x, u.y, (pt) => pt.owner === u.faction).point;
    if (p && dist(u.x, u.y, p.x, p.y) > 220) {
      u.goal = { x: p.x + game.rng.range(-110, 110), y: p.y + game.rng.range(-110, 110) };
      state(u, 'move', 'к точке');
    } else {
      u.goal = null;
      u.facing = expectedThreatAngle(game, u);
      u.aimAngle = u.facing;
    }
  } else {
    updateVehicleThink(game, u);
  }
}

const uq = (sq) => !!sq && sq.state !== 'destroyed' && !!sq.objective;

function expectedThreatAngle(game, u) {
  const enemyHQ = game.world.enemyHQ(u.faction);
  if (enemyHQ) return angleTo(u.x, u.y, enemyHQ.x, enemyHQ.y);
  return u.aimAngle;
}

function chooseCoverForFight(game, u, force = false) {
  if (!force && u.coverBuilding && !u.coverBuilding.dead && dist(u.x, u.y, u.coverBuilding.x, u.coverBuilding.y) < 50) return;
  const threat = u.perception.hasContact ? u.perception.threatAngle : expectedThreatAngle(game, u);
  const cover = game.world.bestCover(u.x, u.y, threat, 190, (b) => (b.occupants || 0) > 1 ? 1 : 0);
  if (cover) {
    if (u.coverBuilding && u.coverBuilding !== cover) u.coverBuilding.occupants = Math.max(0, (u.coverBuilding.occupants || 0) - 1);
    u.coverBuilding = cover;
    cover.occupants = (cover.occupants || 0) + 1;
    u.coverValue = cover.cover;
    u.goal = { x: cover.x, y: cover.y };
  } else {
    u.coverBuilding = null;
    u.coverValue = 0;
  }
}

// Слот гарнизона у окна/бойницы в стеновом здании своей фракции, которое отряд держит.
function garrisonSlot(game, u, sq, units) {
  const walls = game.walls;
  if (!walls || !walls.enabled()) return null;
  const cfg = game.cfg.coverRules?.garrison;
  if (cfg && cfg.enabled === false) return null;
  if (!sq.holdsAt && sq.state !== 'hold' && sq.state !== 'defend') return null;
  const anchor = sq.anchor || sq.holdsAt;
  if (!anchor) return null;
  const slots = walls.garrisonSlotsNear(anchor.x, anchor.y, cfg?.radius ?? 260)
    .filter((g) => g.building.faction === sq.faction || g.building.faction < 0);
  if (!slots.length) return null;
  const share = Math.max(0, Math.min(1, cfg?.share ?? 0.6));
  const count = Math.max(1, Math.round(units.length * share));
  const idx = units.indexOf(u);
  if (idx < 0 || idx >= count) return null;
  const slot = slots[idx % slots.length];
  // Keep the window garrison on the inside of its building, not in the opening.
  return safeRestGoal(game, { x: slot.x, y: slot.y, radius: u.radius }, { x: slot.x, y: slot.y });
}

function squadSlot(game, u, sq) {
  const units = sq.units();
  if (!units.length) return null;
  // Гарнизон: отряд держит стеновое здание — часть бойцов занимает слоты у окон.
  // Те же правила для обеих фракций (решение зависит только от позиции и владельца здания).
  const garr = garrisonSlot(game, u, sq, units);
  if (garr) return garr;
  const spacing = game.cfg.ai.squad.formationSpacing;
  const offset = sq.slotFor(units.indexOf(u), units.length, sq.anchor.x, sq.anchor.y, sq.facing, spacing);
  if (game.world.isWalkable(offset.x, offset.y)) return offset;
  // слот занят постройкой/водой — ищем ближайшую свободную точку
  for (let r = 24; r <= 120; r += 24) {
    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * Math.PI * 2 + sq.id;
      const x = offset.x + Math.cos(a) * r, y = offset.y + Math.sin(a) * r;
      if (game.world.isWalkable(x, y)) return { x, y };
    }
  }
  return offset;
}

function requestResupply(game, u) {
  if (!u._resupplyAsked || game.time - u._resupplyAsked > 20) {
    u._resupplyAsked = game.time;
    const sq = u.squad;
    if (sq) sq.requestedSupply = true;
  }
}

// ---------- Действия (движение, лечение, стройка) ----------
function actSoldier(game, u, dt) {
  if (u.state === 'withdraw' && u.goal && u.goal === u._withdrawGoal && u._withdrawUntil > game.time) {
    const dx = u.goal.x-u.x, dy = u.goal.y-u.y;
    if (Math.hypot(dx,dy) > 4) moveUnit(game, u, dx, dy, dt, null, { skipDoorWaypoint: true });
    return;
  }
  // Do not start work or treatment while occupying a passage.
  if (unsafeRest(game, u.x, u.y, u.radius)) { if (u.goal) moveAlongFlow(game, u, dt); return; }
  // медик: поднимает и лечит раненых рядом
  if (u.role === 'medic') { medicAct(game, u, dt); if (u.healBusy) return; }
  // Боевой контакт имеет приоритет: стройка не должна отменять цель боя
  // и удерживать инженера у чертежа после обнаружения врага.
  if (u.role === 'engineer') {
    if (game.cfg.flag('engineer_combat_priority_v2', false) && u.perception.hasContact) u.buildBusy = false;
    else { if (engineerAct(game, u, dt) || u.buildBusy) return; }
  }
  if (u.goal) moveAlongFlow(game, u, dt);
  else if (u.perception.hasContact) {
    const target = game.unitById(u.targetId);
    if (target && dist(u.x, u.y, target.x, target.y) <= u.weapon.range) {
      u.aimAngle = lerpAngleSafe(u.aimAngle, angleTo(u.x, u.y, target.x, target.y), dt * 6);
    }
  }
}

function lerpAngleSafe(a, b, t) {
  let d = b - a;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return a + d * clamp(t, 0, 1);
}

function medicAct(game, u, dt) {
  u.healBusy = false;
  if (!u.healTarget || !u.healTarget.alive) {
    let best = null, bd = 320;
    for (const o of game.unitsNear(u.x, u.y, 320)) {
      if (o.faction !== u.faction || !o.alive) continue;
      if (!o.downed && o.hp > o.maxHp * 0.75) continue;
      const d = dist(u.x, u.y, o.x, o.y);
      if (d < bd) { bd = d; best = o; }
    }
    u.healTarget = best;
  }
  const t = u.healTarget;
  if (t && t.alive && t !== u) {
    const d = dist(u.x, u.y, t.x, t.y);
    if (d > 34) { u.goal = { x: t.x, y: t.y }; u.healBusy = false; return; }
    u.goal = null;
    u.healBusy = true;
    state(u, 'heal', t.downed ? 'поднимает' : 'лечит');
    u.activity = 'heal';
    u.aimAngle = angleTo(u.x, u.y, t.x, t.y);
    if (t.downed) {
      t.reviveProgress = (t.reviveProgress || 0) + dt * (1 + (u.healPower || 10) / 20) * ((game.modsFor(u.faction).heal_speed_mult) || 1);
      if (t.reviveProgress >= 2 && reviveUnit(game, t)) { t.reviveProgress = 0; game.awardXP(u.faction, 'medic', 'heal', 1); game.sound('heal', t.x, t.y); }
    } else {
      t.hp = Math.min(t.maxHp, t.hp + (u.healPower || 10) * dt * ((game.modsFor(u.faction).heal_speed_mult) || 1));
      u.healed += dt;
      game.awardXP(u.faction, 'medic', 'heal', dt * 0.4);
      if (t.hp >= t.maxHp) u.healTarget = null;
    }
  }
}

function engineerAct(game, u, dt) {
  u.buildBusy = false;
  const bp = game.build.nearestWork(u, 320);
  if (bp) {
    const d = dist(u.x, u.y, bp.x, bp.y);
    if (d > 60) { u.goal = { x: bp.x + game.rng.range(-20, 20), y: bp.y + game.rng.range(-20, 20) }; return; }
    u.goal = null;
    u.buildBusy = true;
    state(u, 'build', 'строит');
    u.activity = 'build';
    u.aimAngle = angleTo(u.x, u.y, bp.x, bp.y);
    game.build.work(bp, dt, u);
    return;
  }
  if (game.cfg.flag('wall_engineer_repair_v1', false) && !u.perception.hasContact) {
    const wall = game.build.nearestDamagedWall(u, 320);
    if (wall) {
      if (wall.distance > 60) {
        u.goal = wall.goal;
        // Flow fields can point away from the near side of a wall, especially
        // inside a building. Use a direct approach only when the entire swept
        // circle and terrain corridor are clear. Otherwise retain normal routing.
        const dx = wall.goal.x - u.x, dy = wall.goal.y - u.y;
        const steps = Math.ceil(Math.hypot(dx, dy) / 6), r = u.radius;
        let clear = !game.walls.blocksMoveSweep(u.x, u.y, wall.goal.x, wall.goal.y, r, u);
        for (let i = 0; clear && i <= steps; i++) {
          const t = steps ? i / steps : 0, x = u.x + dx * t, y = u.y + dy * t;
          for (const [ox, oy] of [[0, 0], [-r, -r], [r, -r], [-r, r], [r, r]]) {
            if (!game.world.isBaseWalkable(x + ox, y + oy)) { clear = false; break; }
          }
        }
        if (clear) {
          moveUnit(game, u, dx, dy, dt, null, { skipDoorWaypoint: true });
          return true;
        }
        return;
      }
      if (game.build.repairWall(wall, dt, u) > 0) {
        u.goal = null; u.buildBusy = true;
        state(u, 'repair', 'чинит стену'); u.activity = 'repair';
        return;
      }
    }
  }
  const rep = game.build.nearestRepair(u, 320);
  if (rep) {
    const d = dist(u.x, u.y, rep.x, rep.y);
    if (d > 60) { u.goal = { x: rep.x, y: rep.y }; return; }
    u.buildBusy = true;
    state(u, 'repair', 'чинит');
    u.activity = 'repair';
    game.build.repair(rep, dt, u);
  }
}

// ---------- Игрок ----------
export function updatePlayerUnit(game, u, dt) {
  if (!u.alive || u.downed) { u.flowDir = null; return; }
  const inp = u.input;
  let dx = inp.mx, dy = inp.my;
  if (dx || dy) {
    moveUnit(game, u, dx, dy, dt);
    if (!u.perception.hasContact) state(u, 'move', 'в пути');
  }
  // прицел мышью
  u.aimAngle = inp.aim;
  u.facing = lerpAngleSafe(u.facing, inp.aim, dt * 12);
  if (inp.reload) startReload(game, u);
  if (inp.fire) playerShoot(game, u);
  if (inp.interact) playerInteract(game, u);
}

export function playerShoot(game, u) {
  if (u.cool > 0 || u.reloading) return false;
  if (u.mag <= 0) { startReload(game, u); return false; }
  const t = game.unitUnderAim(u);
  if (t) return tryShoot(game, u, t, game.dt);
  // стрельба в пустоту: трассер и звук, урон только при попадании
  const w = u.weapon;
  if (w.damage <= 0) return false;
  u.cool = 1 / Math.max(0.01, w.rof);
  u.mag--;
  const range = w.range;
  const ex = u.x + Math.cos(u.aimAngle) * range;
  const ey = u.y + Math.sin(u.aimAngle) * range;
  const blocked = game.raycastBlocked(u.x, u.y, ex, ey);
  game.addTracer(u.x, u.y, blocked ? blocked.x : ex, blocked ? blocked.y : ey, u);
  game.sound(w.sound, u.x, u.y);
  game.fxAt('muzzle', u.x + Math.cos(u.aimAngle) * 14, u.y + Math.sin(u.aimAngle) * 14, u.aimAngle);
  if (u.mag <= 0) startReload(game, u);
  return true;
}

export function playerInteract(game, u) {
  if (u.interactCooldown > 0) return;
  u.interactCooldown = 0.5;
  // поднять раненого
  const downed = game.unitsNear(u.x, u.y, 44).find((o) => o.faction === u.faction && o.downed && o.alive);
  if (downed) { reviveUnit(game, downed); return; }
  // построить/починить ближайший чертёж
  const bp = game.build.nearestWork(u, 70);
  if (bp) { game.build.work(bp, 1.2, u); return; }
  // пополниться на складе
  const p = game.world.pointAt(u.x, u.y, 60);
  if (p && p.owner === u.faction && p.type === 'depot') {
    u.reserve = u.reserveCapacity;
    u.medkits = Math.max(u.medkits, u.def.medkit || 1);
    game.sound('heal', u.x, u.y);
  }
}

// ---------- Техника ----------
function updateVehicleThink(game, u) {
  const tactical = tankTactics(game);
  if (u.isVehicle && u.weapon.kind === 'shell') {
    const target = game.unitById(u.targetId);
    const visible = target && target.alive &&
      (!(game.cfg.flag('vehicle_visible_fire_v1', false) || tactical) || vehicleHasCurrentSight(game, u, target));
    if (visible) {
      if (!tactical || dist(u.x,u.y,target.x,target.y) <= u.weapon.range * 0.9) { u.goal = null; return; }
      // Close distance on a visible target instead of freezing out of range.
      u.goal = {x:target.x,y:target.y}; u.activity = 'advance'; return;
    }
  }
  if (tactical && u.arrived && u._tankPatrolPoint != null) {
    const p = game.world.pointById(u._tankPatrolPoint);
    if (!p || p.owner === u.faction || p.hp <= 0) { u.goal = null; u._tankPatrolPoint = null; }
  }
  if (!u.goal) {
    const p = game.world.nearestPoint(u.x, u.y, (pt) => tactical ? pt.owner !== u.faction && pt.hp > 0 : pt.owner === u.faction).point;
    if (p && tactical) {
      const b = game.world.buildingAtPoint(p.id);
      const goal = b && game.walls?.enabled() && game.walls.state(b) ? game.logistics.exteriorPoint(u,b) : p;
      if (goal) { u.goal = {x:goal.x,y:goal.y}; u._tankPatrolPoint = p.id; u.activity = 'advance'; }
    } else if (p) u.goal = { x: p.x + game.rng.range(-200, 200), y: p.y + game.rng.range(-200, 200) };
  }
}

function updateVehicle(game, u, dt) {
  const target = game.unitById(u.targetId);
  if (target && target.alive && (!(game.cfg.flag('vehicle_visible_fire_v1', false) || tankTactics(game)) || vehicleHasCurrentSight(game, u, target))) {
    const d = dist(u.x, u.y, target.x, target.y);
    if (d < u.weapon.range) {
      tryShoot(game, u, target, dt);
      if (d > 240 && u.goal) moveAlongFlow(game, u, dt);
      return;
    }
  }
  if (u.goal) moveAlongFlow(game, u, dt);
}
