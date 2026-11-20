import { unsafeRest, safeRestGoal } from './rest_positions.js';
import { motionWallSweepFree } from './motion_wall_sweep.js';
// Юнит: данные, движение, Perception, урон и стрельба. Один код для игрока, ботов и врага.
import {
  clamp, dist, dist2, angleTo, angleDiff, degToRad, lerp, TAU, normAngle, approachAngle,
} from '../core/mathx.js';
import { updateSmartRoute, discardSmartRoute, cancelSelectedSmartRoute, smartRouteSearching, truckRouteAssist } from './smart_route.js';
import { doorPairWaypoint, doorPairPositionFree } from './door_pair.js';
import { solidUnitMoveFree, occupiedDetour, blockingUnit } from './solid_units.js';
import { courtesyYield } from './door_courtesy.js';
import { chooseVisionNavigation } from './vision_nav_policy.js';
import { wallSafeGoal } from './wall_goal.js';
import { clearCrowdState, prepareCrowdNavigation, setCrowdDetour, crowdPositionFree } from './crowd_nav.js';

export const NEAR_RADIUS = 40;
// Счётчики для debug-оверлея (F3) и тестов баланса.
export const combatStats = { shots: 0, blocked: 0, hits: 0, damage: 0, downed: 0, killed: 0 };
export function resetCombatStats() { for (const k of Object.keys(combatStats)) combatStats[k] = 0; }

export class Unit {
  constructor(game, { faction = 0, role = 'infantry', x = 0, y = 0, squadId = null, player = false, spawnPoint = null }) {
    const cfg = game.cfg;
    const def = cfg.unit(role);
    this.id = game.nextUnitId++;
    this.game = game;
    this.faction = faction;
    this.role = role;
    this.def = def;
    this.kind = def.class || 'foot';
    this.player = player;
    this.squadId = squadId;
    this.spawnPoint = spawnPoint;
    this.x = x; this.y = y;
    this.vx = 0; this.vy = 0;
    this.radius = this.kind === 'vehicle' ? (def.size || 44) * 0.42 : 9;
    const mods = game.modsFor(faction);
    this.maxHp = Math.round((def.hp + (mods.hp_add || 0)) * (mods.hp_mult || 1));
    this.hp = this.maxHp;
    this.baseSpeed = def.speed * (mods.speed_mult || 1) * (this.kind === 'vehicle' ? (mods.drive_speed_mult || 1) : 1);
    this.speed = this.baseSpeed;
    this.vision = def.vision * (mods.vision_mult || 1);
    this.armor = def.armor || 0;
    this.weaponId = (player && game.playerWeapon) || def.weapon || 'pistol';
    this.weapon = cfg.weapon(this.weaponId);
    this.damageMult = mods.damage_mult || 1;
    this.spreadMult = mods.spread_mult || 1;
    this.reloadMult = mods.reload_mult || 1;
    if (this.kind === 'vehicle') this.damageMult *= mods.tank_damage_mult || 1;
    if (this.kind === 'vehicle') this.armor += mods.tank_armor_add || 0;
    this.mag = this.weapon.mag;
    this.reserve = this.weapon.mag * 8;
    this.magCapacity = this.weapon.mag;
    this.reserveCapacity = this.weapon.mag * 8;
    this.cool = 0; this.reloadT = 0; this.reloading = false;
    this.facing = game.rng.range(-Math.PI, Math.PI);
    this.aimAngle = this.facing;
    this.turretAngle = this.facing;
    this.morale = cfg.ai.morale.start;
    this.suppression = 0;
    this.state = 'idle';
    this.stateLabel = 'ожидает';
    this.goal = null;
    this.flowDir = null;
    this.arrived = true;
    this.thinkTimer = game.rng.range(0, 0.4);
    this.perception = { enemies: [], lastKnown: null, memory: 0, heard: null, threatAngle: 0, hasContact: false };
    this.targetId = null;
    this.coverBuilding = null;
    this.coverValue = 0;
    this.downed = false;
    this.bleed = 0;
    this.alive = true;
    this.deadTimer = 0;
    this.kills = 0;
    this.stuck = 0;
    this.lastCheck = { x, y, t: 0 };
    this.medkits = def.medkit || 0;
    this.buildPower = def.buildPower || 0;
    this.healPower = def.healPower || 0;
    this.cargo = 0;
    this.cargoType = null;
    this.homePoint = spawnPoint;
    this.order = null;
    this.formationIndex = 0;
    this.activity = 'idle';
    this.engineDamage = 0; this.turretDamage = 0;
    this.repairTarget = null;
    this.buildTarget = null;
    this.healTarget = null;
    this.reviveTarget = null;
    this.age = 0;
    this.inSquad = !!squadId;
    this.input = { mx: 0, my: 0, aim: 0, fire: false, interact: false };
    this.playerControlled = false;
    this.delivered = 0;
    this.healed = 0;
    this.built = 0;
    this.tracers = 0;
    this.roadPath = null;
  }

  get isVehicle() { return this.kind === 'vehicle'; }
  get squad() { return this.squadId != null ? this.game.squads.get(this.squadId) : null; }

  power() {
    if (!this.alive) return 0;
    const base = this.isVehicle ? 4 : 1.1;
    return base * (this.hp / this.maxHp) * (this.downed ? 0.25 : 1);
  }

  ammoRatio() {
    const total = this.mag + this.reserve;
    return clamp(total / (this.magCapacity + this.reserveCapacity), 0, 1);
  }

  resupply(rounds = 120) {
    const add = Math.min(rounds, this.reserveCapacity - this.reserve);
    this.reserve += add;
    return add;
  }

  aimAt(x, y) { this.aimAngle = angleTo(this.x, this.y, x, y); }
}

// ---------- Восприятие ----------
export function updatePerception(game, u, dt) {
  const p = u.perception;
  p.memory = Math.max(0, p.memory - dt);
  if (u.downed || !u.alive) { p.hasContact = false; p.enemies.length = 0; return; }
  const cone = degToRad(game.cfg.ai.perception.coneDeg);
  // All directions within the existing vision radius, with actual LOS.
  // Existing hearing and memory remain separate; this is not x-ray vision.
  // The flag retains the previous cone as a reproducible comparison fallback.
  const surround = game.cfg.flag('bot_surround_vision_v1', false);
  const enemies = game.nearbyEnemies(u, u.vision + 60);
  let best = null, bestScore = -Infinity;
  p.enemies.length = 0;
  for (const e of enemies) {
    if (!e.alive || e.downed) continue;
    const d = dist(u.x, u.y, e.x, e.y);
    if (d > u.vision) continue;
    let visible;
    if (surround) {
      visible = game.world.hasLOS(u.x, u.y, e.x, e.y, true);
    } else {
      visible = d < game.cfg.ai.perception.closeAwareness;
      if (!visible) {
        const a = angleTo(u.x, u.y, e.x, e.y);
        if (angleDiff(a, u.facing) < cone / 2) {
          visible = game.world.hasLOS(u.x, u.y, e.x, e.y, true);
        }
      }
    }
    if (!visible) continue;
    p.enemies.push(e);
    const threat = (e.isVehicle ? 2 : 1) * (1 - d / (u.vision + 1)) + (e.targetId === u.id ? 0.6 : 0);
    if (threat > bestScore) { bestScore = threat; best = e; p.threatAngle = angleTo(u.x, u.y, e.x, e.y); }
  }
  p.hasContact = p.enemies.length > 0;
  if (best) { p.lastKnown = { x: best.x, y: best.y, id: best.id }; p.memory = game.cfg.ai.perception.memorySeconds; }
  // цель: ближайший видимый враг, приоритет тому, кто стрелял по нам
  if (best) u.targetId = best.id;
  else if (p.memory <= 0) u.targetId = null;
}

export function hearShot(game, shooter, weapon) {
  const range = (game.cfg.ai.perception.hearingRange * (weapon.sound === 'shot_sniper' ? 1.3 : weapon.sound === 'shot_cannon' ? 1.6 : 1));
  const near = game.unitsNear(shooter.x, shooter.y, range);
  for (const u of near) {
    if (!u.alive || u.downed || u.faction === shooter.faction) continue;
    if (u.perception.hasContact) continue;
    const d = dist(u.x, u.y, shooter.x, shooter.y);
    if (d > range) continue;
    if (u.squad && u.squad.fire === 'hold') continue;
    u.perception.heard = { x: shooter.x + game.rng.range(-60, 60), y: shooter.y + game.rng.range(-60, 60), t: 4 };
    if (u.state === 'idle' && u.role !== 'engineer') u.perception.investigate = true;
  }
}

// A remembered ID is not sight. Recheck the real range and LOS at use time;
// the enemy may have moved behind a wall since the last perception update.
export function vehicleHasCurrentSight(game, u, target) {
  return !!target && target.alive && !target.downed && target.faction !== u.faction &&
    !!u.perception.hasContact && u.perception.enemies.includes(target) &&
    dist(u.x,u.y,target.x,target.y) <= u.vision && game.world.hasLOS(u.x,u.y,target.x,target.y,true);
}

// ---------- Стрельба ----------
// id оружия нужен для таблицы пробиваемости стены (weapons.json)
function weaponIdOf(u) {
  return u.weaponId || u.def?.weapon || 'rifle';
}

export function tryShoot(game, u, target, dt) {
  if (u.downed || !u.alive || u.reloading || u.cool > 0 || u.weapon.damage <= 0) return false;
  if (!target || !target.alive || target.downed) return false;
  const d = dist(u.x, u.y, target.x, target.y);
  if (d > u.weapon.range) return false;
  if (u.mag <= 0) { startReload(game, u); return false; }
  if (u.kind === 'vehicle') {
    const want = angleTo(u.x, u.y, target.x, target.y);
    if (angleDiff(u.turretAngle, want) > 0.14) return false;
  }
  // время на вскидку: ствол должен быть направлен на цель
  const aim = angleTo(u.x, u.y, target.x, target.y);
  if (angleDiff(u.aimAngle, aim) > 0.35) { u.aimAngle = approachAngle(u.aimAngle, aim, dt * 3.2); return false; }
  let spread = degToRad(u.weapon.spread * u.spreadMult);
  spread *= 1 + clamp(d / u.weapon.range, 0, 1) * 0.9;
  spread *= 1 + u.suppression * (game.cfg.ai.combat.suppressionSpreadMult - 1);
  if (u.morale < 30) spread *= 1.3;
  const err = game.rng.gauss() * spread * 0.5;
  const shotAngle = aim + err;
  u.cool = 1 / Math.max(0.01, u.weapon.rof);
  u.mag--;
  u.shotsFired = (u.shotsFired || 0) + 1;
  combatStats.shots++;
  const shotLen = Math.min(u.weapon.range, d + 120);
  const ex = u.x + Math.cos(shotAngle) * shotLen;
  const ey = u.y + Math.sin(shotAngle) * shotLen;
  // Стены зданий: тонкие сегменты с материалом и проёмами. Проверяем точной геометрией.
  const wall = game.walls && game.walls.enabled()
    ? game.walls.bulletRay(u.x, u.y, target.x, target.y, weaponIdOf(u), game.rng)
    : null;
  if (wall && wall.blocked) {
    game.walls.damageSegment(wall.building, wall.segId, u.weapon.damage * u.damageMult, weaponIdOf(u));
    if (wall.breakDoor) game.walls.breakDoorHit(wall.building, wall.opening, u.weapon.damage);
    game.addTracer(u.x, u.y, wall.hitPoint.x, wall.hitPoint.y, u);
    const matDef = game.walls.materials?.[wall.material] || {};
    game.fxAt(matDef.fx || 'impact', wall.hitPoint.x, wall.hitPoint.y);
    game.sound(matDef.sound || 'hit_cover', wall.hitPoint.x, wall.hitPoint.y);
    game.fxAt('muzzle', u.x + Math.cos(u.aimAngle) * (u.isVehicle ? 30 : 12), u.y + Math.sin(u.aimAngle) * (u.isVehicle ? 30 : 12), shotAngle);
    game.sound(u.weapon.sound, u.x, u.y);
    if (u.mag <= 0) startReload(game, u);
    return true;
  }
  const wallLoss = wall && wall.penetrated ? (wall.damageMult ?? 1) : 1;
  if (wall && wall.penetrated) {
    game.walls.damageSegment(wall.building, wall.segId, u.weapon.damage * u.damageMult * 0.5, weaponIdOf(u));
  }
  const blockedAt = game.raycastBlocked(u.x, u.y, ex, ey);
  let hit = false;
  if (blockedAt) {
    combatStats.blocked++;
    game.addTracer(u.x, u.y, blockedAt.x, blockedAt.y, u);
    game.fxAt('impact', blockedAt.x, blockedAt.y);
    game.sound('hit_cover', blockedAt.x, blockedAt.y);
  } else {
    // Перпендикулярное расстояние от цели до луча: |cos(θ)·dy − sin(θ)·dx|
    const perp = Math.abs(Math.cos(shotAngle) * (target.y - u.y) - Math.sin(shotAngle) * (target.x - u.x));
    const radius = (target.isVehicle ? 26 : 12) * (1 - target.coverValue * 0.75);
    hit = perp < radius;
    game.addTracer(u.x, u.y, u.x + Math.cos(shotAngle) * d, u.y + Math.sin(shotAngle) * d, u);
  }
  game.sound(u.weapon.sound, u.x, u.y);
  game.fxAt('muzzle', u.x + Math.cos(u.aimAngle) * (u.isVehicle ? 30 : 12), u.y + Math.sin(u.aimAngle) * (u.isVehicle ? 30 : 12), shotAngle);
  hearShot(game, u, u.weapon);
  if (hit) {
    combatStats.hits++;
    if (u.weapon.kind === 'shell') {
      game.explode(ex, ey, u.weapon.aoe, u.weapon.damage, u);
    } else {
      applyDamage(game, target, u.weapon.damage * u.damageMult * wallLoss * game.accuracyFactor(u), u, { kind: 'bullet' });
    }
    game.sound('hit_flesh', target.x, target.y);
  } else {
    // подавление: пуля прошла рядом
    for (const n of game.unitsNear(ex, ey, 60)) {
      if (n.faction !== u.faction && n.alive) n.suppression = clamp(n.suppression + u.weapon.suppression / 220, 0, 1);
    }
  }
  if (u.mag <= 0) startReload(game, u);
  return true;
}

// Штурм укреплений: стрельба по вражеской постройке (мешки, окопы, гнёзда, бункеры).
export function tryShootBuilding(game, u, b, dt) {
  if (u.downed || !u.alive || u.reloading || u.cool > 0 || u.weapon.damage <= 0) return false;
  if (!b || b.dead || !b.built) return false;
  if (b.faction < 0 || b.faction === u.faction) return false;
  const d = dist(u.x, u.y, b.x, b.y);
  if (d > u.weapon.range) return false;
  if (u.mag <= 0) { startReload(game, u); return false; }
  const aim = angleTo(u.x, u.y, b.x, b.y);
  if (u.isVehicle && angleDiff(u.turretAngle, aim) > 0.16) return false;
  if (angleDiff(u.aimAngle, aim) > 0.4) { u.aimAngle = approachAngle(u.aimAngle, aim, dt * 3.2); return false; }
  let spread = degToRad(u.weapon.spread * u.spreadMult) * 1.15;
  spread *= 1 + clamp(d / u.weapon.range, 0, 1) * 0.9;
  spread *= 1 + u.suppression * (game.cfg.ai.combat.suppressionSpreadMult - 1);
  const err = game.rng.gauss() * spread * 0.5;
  const shotAngle = aim + err;
  u.cool = 1 / Math.max(0.01, u.weapon.rof);
  u.mag--;
  u.shotsFired = (u.shotsFired || 0) + 1;
  combatStats.shots++;
  const ex = u.x + Math.cos(shotAngle) * Math.min(u.weapon.range, d + 60);
  const ey = u.y + Math.sin(shotAngle) * Math.min(u.weapon.range, d + 60);
  game.addTracer(u.x, u.y, ex, ey, u);
  game.sound(u.weapon.sound, u.x, u.y);
  game.fxAt('muzzle', u.x + Math.cos(u.aimAngle) * (u.isVehicle ? 30 : 12), u.y + Math.sin(u.aimAngle) * (u.isVehicle ? 30 : 12), shotAngle);
  hearShot(game, u, u.weapon);
  const perp = Math.abs(Math.cos(shotAngle) * (b.y - u.y) - Math.sin(shotAngle) * (b.x - u.x));
  const radius = Math.max(14, (b.w || 32) * 0.5) + 6;
  if (perp < radius) {
    if (u.weapon.kind === 'shell') {
      game.explode(b.x, b.y, u.weapon.aoe, u.weapon.damage, u);
    } else {
      // постройки держат удар: пули бьют по ним слабее, чем по людям
      game.world.damageBuilding(b, u.weapon.damage * u.damageMult * 0.9, u.faction);
      game.fxAt('impact', b.x + game.rng.range(-8, 8), b.y + game.rng.range(-8, 8));
    }
    game.sound('hit_cover', b.x, b.y);
  } else {
    game.fxAt('impact', ex, ey);
  }
  if (u.mag <= 0) startReload(game, u);
  return true;
}

export function startReload(game, u) {
  if (u.reloading) return;
  if (u.reserve <= 0) { u.stateLabel = 'нет патронов'; return; }
  u.reloading = true;
  u.reloadT = u.weapon.reload * u.reloadMult;
  game.sound('reload', u.x, u.y);
}

export function finishReload(u) {
  if (!u.reloading) return;
  u.reloading = false;
  const need = u.magCapacity - u.mag;
  const take = Math.min(need, u.reserve);
  u.mag += take;
  u.reserve -= take;
}

export function applyDamage(game, target, amount, source = null, opts = {}) {
  if (!target || !target.alive) return 0;
  let dmg = amount;
  if (target.isVehicle) dmg *= 1 - clamp(target.armor * 0.06, 0, 0.55);
  else dmg *= 1 - clamp(target.armor * 0.06, 0, 0.4);
  dmg = Math.max(1, dmg);
  combatStats.damage += dmg;
  if (source && source.faction !== target.faction) target.lastAttacker = { id: source.id, faction: source.faction, t: game.time };
  target.hp -= dmg;
  if (target.isVehicle && target.hp > 0) {
    if (target.hp / target.maxHp < 0.55 && game.rng.chance(0.25)) {
      if (game.rng.chance(0.5)) target.engineDamage = 1; else target.turretDamage = 1;
    }
  }
  game.addBloodAt(target.x, target.y, !target.isVehicle);
  if (source && source.faction !== target.faction) {
    target.suppression = clamp(target.suppression + 0.25, 0, 1);
    if (source.squad) source.squad.stats.shotsHit++;
  }
  if (target.hp <= 0) {
    if (target.isVehicle) killUnit(game, target, source);
    else if (!target.downed) {
      target.downed = true;
      target.hp = 1;
      target.bleed = game.cfg.ai.combat.downedBleedSeconds;
      combatStats.downed++;
      target.state = 'downed';
      target.stateLabel = 'ранен';
      target.flowDir = null;
      game.events.emit('unitDowned', { unit: target, t: game.time });
      game.fxAt('blood', target.x, target.y);
      const sq = target.squad;
      if (sq) sq.onCasualty(target);
    }
  }
  return dmg;
}

export function killUnit(game, u, source = null) {
  if (!u.alive) return;
  combatStats.killed++;
  if (!source && u.lastAttacker && game.time - u.lastAttacker.t < 60) {
    const k = game.unitById(u.lastAttacker.id);
    if (k && k.faction !== u.faction) source = k;
  }
  u.alive = false;
  u.downed = false;
  u.hp = 0;
  u.deadTimer = 0;
  u.state = 'dead';
  u.stateLabel = 'убит';
  u.flowDir = null;
  if (!u.isVehicle) game.markBloodAt(u.x, u.y);
  if (u.isVehicle) {
    game.explode(u.x, u.y, 70, 40, null, true);
    game.fxAt('wreck', u.x, u.y);
  }
  if (source && source.faction !== u.faction) {
    source.kills++;
    game.awardXP(source.faction, source.def.xpRole, 'kill', 1);
    game.awardXP(u.faction, u.def.xpRole, 'death', 0);
    if (source.squad) source.squad.stats.kills++;
  }
  const sq = u.squad;
  if (sq) sq.onDeath(u);
  game.events.emit('unitKilled', { unit: u, source, t: game.time });
  if (u.player && game.onPlayerDeath) game.onPlayerDeath(u);
}

export function reviveUnit(game, u) {
  if (!u.downed || !u.alive) return false;
  // A prone body is not an obstacle, but standing up may not create a new
  // overlap. Keep the wounded unit down until the area is clear.
  if (game.cfg.flag('movement_occupancy_v1', false) && [...game.units.values()].some(v=>
    v!==u && v.alive && !v.downed && Math.hypot(v.x-u.x,v.y-u.y)<v.radius+u.radius+0.01)) return false;
  u.downed = false;
  u.hp = Math.round(u.maxHp * (game.modsFor(u.faction).revive_hp || 0.35));
  u.bleed = 0;
  u.state = 'active';
  u.stateLabel = 'поднят';
  game.events.emit('unitRevived', { unit: u, t: game.time });
  return true;
}

// ---------- Движение ----------
export function moveUnit(game, u, dx, dy, dt, visionChoice = null, { skipDoorWaypoint = false } = {}) {
  if (u._crowdActive && (!(game.cfg.flag('crowd_nav_v2', false) || game.cfg.flag('movement_occupancy_v1', false)) || u.playerControlled || u.perception.hasContact || !u.goal)) clearCrowdState(u);
  if (u._smartRoute && ((!game.cfg.flag('smart_route_v2', false) && !game.cfg.flag('bot_obstacle_vision_v1', false) && !truckRouteAssist(game,u)) || !u.goal || u.perception.hasContact || u.playerControlled)) discardSmartRoute(u);
  if (!u.alive || u.downed) return;
  const solid = game.cfg.flag('unit_solid_2d_v1', false);
  const occupancy = game.cfg.flag('movement_occupancy_v1', false);
  const motionX = u.x, motionY = u.y;
  let speed = u.speed;
  speed *= game.world.speedAt(u.x, u.y);
  if (u.isVehicle && u.engineDamage) speed *= 0.55;
  if (u.suppression > 0.5) speed *= 0.9;
  // Внутри стенового ядра путь к внешней цели идёт через проём.
  if (game.walls && u.goal && !skipDoorWaypoint) {
    const wp = game.walls.doorWaypoint(u, u.goal.x, u.goal.y);
    // После упора в другую стену дальняя дверь не должна постоянно
    // перекрывать поле маршрута. В бою сохраняем текущую реакцию.
    const retryFlow = game.cfg.flag('pathing_v2', false) && !u.perception.hasContact &&
      (u.stuck || 0) >= (game.cfg.navBudget?.antiStuck?.doorFlowAfter ?? 1);
    if (wp && !retryFlow) { dx = wp.x - u.x; dy = wp.y - u.y; }
  }
  // Обход упора (антизастревание): без телепорта — короткий крюк в свободную точку.
  // Работает только со стенами: с выключенным флагом остаётся прежняя логика.
  const anti = game.cfg.navBudget?.antiStuck || { stuckThreshold: 1.5, detourSeconds: 1.6 };
  const wallsOn = !!(game.walls && game.walls.enabled());
  const tankDetour = u.role === 'tank' && !u.playerControlled && game.cfg.flag('tank_detour_v1', false);
  if (wallsOn && u.isVehicle && u.goal && game.cfg.flag('pathing_v2', false) && (game.cfg.flag('vehicle_detour_v2', false) || tankDetour) &&
      !u.perception.hasContact && (u.stuck || 0) >= (anti.vehicleDetourThreshold ?? 1) && (!u.detour || game.time >= u.detour.until) &&
      !game.walls.buildingAtPoint?.(u.x, u.y) && !game.walls.buildingAtPoint?.(u.goal.x, u.goal.y)) {
    // Ограниченный маршрут вне зданий. Точки доступны обычным
    // движением, а их порядок определяется общим полем стоимости без RNG.
    const field = game.nav.field(u.goal.x, u.goal.y);
    // Включённый эксперимент применяется лишь когда поле требует движения
    // от цели; это ещё не гарантия для всех маршрутов и он по умолчанию off.
    const fieldDir = game.nav.step(field, u.x, u.y);
    if (fieldDir && fieldDir.dx * (u.goal.x - u.x) + fieldDir.dy * (u.goal.y - u.y) < 0) {
      let best = null, bestScore = Infinity;
      const steps = anti.detourTries ?? 12;
      const radius = anti.detourMax ?? 110;
      for (let k = 0; k < steps; k++) {
        const a = k * Math.PI * 2 / steps;
        const px = u.x + Math.cos(a) * radius, py = u.y + Math.sin(a) * radius;
        const n = Math.ceil(radius / u.radius);
        let free = true;
        for (let j = 1; j <= n; j++) {
          const x = u.x + (px - u.x) * j / n, y = u.y + (py - u.y) * j / n, r = u.radius;
          if (!game.world.isBaseWalkable(x,y) || !game.world.isBaseWalkable(x-r,y-r) || !game.world.isBaseWalkable(x+r,y-r) ||
              !game.world.isBaseWalkable(x-r,y+r) || !game.world.isBaseWalkable(x+r,y+r) ||
              game.walls.blocksMove(x,y,r,u)) { free = false; break; }
        }
        if (!free || !field) continue;
        const cost = field.dist[game.nav.idxOf(px,py)];
        if (cost < bestScore) { bestScore = cost; best = { x: px, y: py }; }
      }
      if (best && Number.isFinite(bestScore)) {
        u.detour = { ...best, until: game.time + (anti.detourSeconds ?? 1.6) };
        if (game._detourMetrics) game._detourMetrics.fieldDetours++;
        u.stuck = anti.stuckAfterDetour ?? 0.8;
      }
    }
  }
  if (wallsOn && u.detour && game.time < u.detour.until) {
    dx = u.detour.x - u.x;
    dy = u.detour.y - u.y;
  } else if (wallsOn && (u.stuck || 0) > anti.stuckThreshold) {
    let best = null, bd = Infinity;
    for (let k = 0; k < (anti.detourTries ?? 12); k++) {
      const a = game.rng.range(0, Math.PI * 2);
      const r = game.rng.range(anti.detourMin ?? 48, anti.detourMax ?? 110);
      const px = u.x + Math.cos(a) * r, py = u.y + Math.sin(a) * r;
      if (!game.world.isWalkable(px, py)) continue;
      if (game.walls.blocksMove(px, py, u.radius + 2, u)) continue;
      const d = Math.hypot(px - u.goal?.x || 0, py - u.goal?.y || 0);
      if (d < bd) { bd = d; best = { x: px, y: py }; }
    }
    if (best) {
      u.detour = { x: best.x, y: best.y, until: game.time + (anti.detourSeconds ?? 1.6) };
      dx = best.x - u.x;
      dy = best.y - u.y;
      u.stuck = anti.stuckAfterDetour ?? 0.8;
    }
  }
  const yieldPoint = game.cfg.flag('door_courtesy_v1', false) && (!visionChoice || visionChoice.mode !== 'combat')
    ? courtesyYield(game,u,visionChoice?.visibleIds || null) : null;
  if (yieldPoint) {
    u.stuck = 0;
    if (Math.hypot(yieldPoint.x-u.x,yieldPoint.y-u.y)<2) return;
    dx = yieldPoint.x-u.x; dy = yieldPoint.y-u.y;
  }
  const allowPair = !visionChoice || (visionChoice.mode === 'pair' && !game.cfg.flag('door_courtesy_v1', false));
  const doorLane = !yieldPoint && allowPair && game.cfg.flag('door_pair_lanes_v1', false) ? doorPairWaypoint(game,u) : null;
  if (visionChoice && !allowPair && u._doorPass) u._doorPass = null;
  if (!doorLane && u._doorPass && !game.cfg.flag('door_pair_lanes_v1', false)) u._doorPass = null;
  if (doorLane) { dx = doorLane.x-u.x; dy = doorLane.y-u.y; }
  // Keep the requested direction separately from the short avoidance vector.
  const intentLen=occupancy?Math.hypot(dx,dy):0, intentX=intentLen>1?dx/intentLen:dx, intentY=intentLen>1?dy/intentLen:dy;
  const groupSweep = game.cfg.flag('crowd_swept_units_v1', false) && (u._crowdActive || !!doorLane);
  // No other unit can move while this call runs. Reuse one conservative
  // neighborhood for lookahead, all candidate steps and the rescue step.
  const nearbyRadius=u.radius+(game.occupancyMaxRadius||0);
  const occupancyReach = Math.max(Math.hypot(nearbyRadius+28,nearbyRadius+6),
    nearbyRadius+speed*dt+(anti.pushSpeedMult??1.5)*Math.max(u.speed,anti.pushSpeedFloor??30)*dt+1);
  const occupancyNeighbors = occupancy ? game.occupancyGrid.queryRange(u.x,u.y,occupancyReach) : null;
  if (occupancy && !yieldPoint && !doorLane && !u._crowdActive) {
    const detour=occupiedDetour(game,u,dx,dy,game.occupancyGrid,occupancyNeighbors);
    if (detour) { dx=detour.x;dy=detour.y; }
  }
  const len = Math.hypot(dx, dy);
  if (len > 1) { dx /= len; dy /= len; }
  // расталкивание (steering separation)
  if (u.kind !== 'vehicle') {
    const near = game.unitGrid.query(u.x, u.y, NEAR_RADIUS);
    let sx = 0, sy = 0;
    for (const o of near) {
      if (o === u || !o.alive || o.downed) continue;
      const dd = dist2(u.x, u.y, o.x, o.y);
      const r = u.radius + o.radius + 4;
      if (dd > r * r || dd < 0.01) continue;
      const d = Math.sqrt(dd);
      sx += ((u.x - o.x) / d) * (1 - d / r);
      sy += ((u.y - o.y) / d) * (1 - d / r);
    }
    dx += sx * 0.9; dy += sy * 0.9;
    if (u._crowdActive || doorLane || solid || occupancy || yieldPoint) {
      const length=Math.hypot(dx,dy);
      if(length>1){dx/=length;dy/=length;}
    }
  }
  // Diagnostic hook only: absent in normal play. It adjusts direction before
  // the existing terrain, wall and occupancy safety checks, never position.
  if (game._experimentalSteering) {
    const v = game._experimentalSteering(u, dx, dy, dt);
    if (v && Number.isFinite(v.x) && Number.isFinite(v.y)) {
      dx = v.x; dy = v.y;
      const length = Math.hypot(dx, dy);
      if (length > 1) { dx /= length; dy /= length; }
    }
  }
  let step = speed * dt;
  if (yieldPoint) step=Math.min(step, Math.hypot(u.x-yieldPoint.x,u.y-yieldPoint.y));
  if (u._crowdActive && u._crowdPoint) step=Math.min(step, Math.hypot(u.x-u._crowdPoint.x,u.y-u._crowdPoint.y));
  const nx = u.x + dx * step, ny = u.y + dy * step;
  const r = u.radius;
  // двери открываются перед юнитом (и закрываются сами, если рядом никого)
  if (game.walls) game.walls.doorsForUnit(u);
  const wallFree = (x, y) => !game.walls || !game.walls.enabled() || !game.walls.blocksMove(x, y, r, u);
  // Грубая 32-px маска стен может закрывать часть дверного проёма. В новом
  // режиме рельеф проверяется отдельно, а стены — точной геометрией с радиусом.
  const walk = wallsOn && game.cfg.flag('pathing_v2', false)
    ? (x, y) => game.world.isBaseWalkable(x, y)
    : (x, y) => game.world.isWalkable(x, y);
  const free = (x, y) => (!occupancy || solidUnitMoveFree(game,u,x,y,0.01,game.occupancyGrid,occupancyNeighbors)) &&
    walk(x - r, y - r) && walk(x + r, y - r) && walk(x - r, y + r) && walk(x + r, y + r) && walk(x, y) && wallFree(x, y) &&
    motionWallSweepFree(game, u, x, y) && crowdPositionFree(game, u, x, y) && (!doorLane || doorPairPositionFree(game, u, x, y)) &&
    (occupancy || !(solid || groupSweep) || solidUnitMoveFree(game, u, x, y, groupSweep ? 0.01 : 0));
  const probe = game._motionDiagnostic, startX = probe && u.x, startY = probe && u.y;
  // A zero-length axis slide must not suppress the alternate-direction search.
  const avoidNoopSlide = occupancy || game.cfg.flag('motion_slide_guard_v1', false);
  if (free(nx, ny)) { u.x = nx; u.y = ny; }
  else if ((!avoidNoopSlide || Math.abs(nx-u.x)>1e-9) && free(nx, u.y)) { u.x = nx; }
  else if ((!avoidNoopSlide || Math.abs(ny-u.y)>1e-9) && free(u.x, ny)) { u.y = ny; }
  else {
    // обход препятствия: пробуем скользить под углом (wall follow)
    let moved = false;
    for (const a of [0.7, -0.7, 1.2, -1.2]) {
      const rx = dx * Math.cos(a) - dy * Math.sin(a);
      const ry = dx * Math.sin(a) + dy * Math.cos(a);
      const tx = u.x + rx * step, ty = u.y + ry * step;
      if (free(tx, ty)) { u.x = tx; u.y = ty; moved = true; break; }
    }
    if (!moved) u.stuck = (u.stuck || 0) + dt * 2;
  }
  if (occupancy && game.cfg.flag('movement_queue_wait_v1',true) && !u.playerControlled && u.goal && !u.perception.hasContact && intentLen>0.1 &&
      Math.hypot(u.x-motionX,u.y-motionY)<0.01) {
    const tx=motionX+intentX*step,ty=motionY+intentY*step;
    // Waiting is recognised only when terrain/walls allow the intended step;
    // a wall blockage alone must still trigger the normal stuck recovery.
    const terrainFree=walk(tx-r,ty-r)&&walk(tx+r,ty-r)&&walk(tx-r,ty+r)&&walk(tx+r,ty+r)&&walk(tx,ty)&&wallFree(tx,ty)&&motionWallSweepFree(game,u,tx,ty);
    const blocker=terrainFree && blockingUnit(game,u,tx,ty,0.01,game.occupancyGrid,occupancyNeighbors);
    if(blocker) {
      const w=u._occupancyWait;
      if(!w || w.goalX!==u.goal.x || w.goalY!==u.goal.y || game.time-w.lastBlocked>0.5)
        u._occupancyWait={goalX:u.goal.x,goalY:u.goal.y,since:game.time,lastBlocked:game.time,blockerId:blocker.id};
      else { w.lastBlocked=game.time;w.blockerId=blocker.id; }
      // A short queue is not a navigation failure. Do not hide a permanent
      // blockade: after ten seconds the ordinary recovery/failure resumes.
      if(game.time-u._occupancyWait.since<10)u.stuck=0;
    } else u._occupancyWait=null;
  } else if(occupancy) u._occupancyWait=null;
  if (probe) probe(u,startX,startY,u.x,u.y,'ordinary');
  const rescueX = probe && u.x, rescueY = probe && u.y;
  // Антизастревание без телепорта: если юнит оказался в непроходимой клетке
  // (закрылась дверь, достроилась стена), выталкиваем его к ближайшей свободной.
  if (wallsOn && (!walk(u.x, u.y) || game.walls.blocksMove(u.x, u.y, r * 0.5, u))) {
    let best = null, bd = Infinity;
    const angles = anti.pushAngles ?? 16;
    const stepR = anti.pushRadiusStep ?? 12;
    for (let k = 0; k < angles; k++) {
      const a = (k / angles) * Math.PI * 2;
      for (let rr = anti.pushRadiusMin ?? 12; rr <= (anti.pushRadiusMax ?? 64); rr += stepR) {
        const px = u.x + Math.cos(a) * rr, py = u.y + Math.sin(a) * rr;
        if (!walk(px, py)) continue;
        if (game.walls.blocksMove(px, py, r * 0.5, u)) continue;
        if (rr < bd) { bd = rr; best = { x: px, y: py }; }
        break;
      }
    }
    if (best) {
      // Выталкивание идёт обычным шагом: не быстрее 1.5× своей скорости (это не телепорт)
      const maxStep = (anti.pushSpeedMult ?? 1.5) * Math.max(u.speed, anti.pushSpeedFloor ?? 30) * dt;
      const dd = Math.hypot(best.x - u.x, best.y - u.y) || 1;
      const k = Math.min(1, maxStep / dd);
      const pushX = u.x + (best.x - u.x) * k, pushY = u.y + (best.y - u.y) * k;
      if (!(solid || groupSweep || occupancy) || solidUnitMoveFree(game, u, pushX, pushY, (groupSweep || occupancy) ? 0.01 : 0,
        occupancy ? game.occupancyGrid : game.unitGrid, occupancyNeighbors)) {
        u.x = pushX; u.y = pushY;
        u.stuck = Math.max(0, (u.stuck || 0) - dt * 4);
      }
    }
  }
  u.x = clamp(u.x, 8, game.world.W - 8);
  u.y = clamp(u.y, 8, game.world.H - 8);
  if (occupancy) {
    game.occupancyGrid.update(u);
    // Actual displacement vector (world +Y down) per simulated second.
    u.vx = dt > 0 ? (u.x - motionX) / dt : 0;
    u.vy = dt > 0 ? (u.y - motionY) / dt : 0;
  }
  if (probe) probe(u,rescueX,rescueY,u.x,u.y,'rescue');
  if (Math.hypot(dx, dy) > 0.1) u.facing = approachAngle(u.facing, Math.atan2(dy, dx), dt * (u.role === 'tank' && game.cfg.flag('tank_smooth_turn_v1', true) ? 2 : 8));
}

export function updateTimers(game, u, dt) {
  u.age += dt;
  if (u.cool > 0) u.cool -= dt;
  if (u.reloading) {
    u.reloadT -= dt;
    if (u.reloadT <= 0) finishReload(u);
  }
  u.suppression = Math.max(0, u.suppression - dt * 0.35);
  if (u.downed) {
    u.bleed -= dt;
    if (u.bleed <= 0) { u.downed = false; killUnit(game, u, null); }
  }
  if (u.perception.heard) {
    u.perception.heard.t -= dt;
    if (u.perception.heard.t <= 0) u.perception.heard = null;
  }
  if (u.isVehicle) {
    if (u.targetId == null && game.cfg.flag('tank_smooth_turn_v1', true)) u.turretAngle = approachAngle(u.turretAngle, u.facing, dt * 2.4);
    if (u.targetId != null) {
      const t = game.unitById(u.targetId);
      if (t && t.alive && dist(u.x, u.y, t.x, t.y) < u.vision &&
          (!(game.cfg.flag('vehicle_visible_fire_v1', false) || (game.cfg.flag('tank_tactical_v1', true) && game.walls?.enabled())) || vehicleHasCurrentSight(game, u, t))) {
        u.turretAngle = approachAngle(u.turretAngle, angleTo(u.x, u.y, t.x, t.y), dt * (u.turretDamage ? 1.2 : 2.4));
      }
    }
  }
  // антизастревание
  if (u.age - u.lastCheck.t > 2.5) {
    const moved = dist(u.x, u.y, u.lastCheck.x, u.lastCheck.y);
    u.lastCheck = { x: u.x, y: u.y, t: u.age };
    // Arrival may persist while the next order is being assigned. Recheck the
    // current goal and any crowd slot; a stale `arrived` flag is not enough.
    const arrivedAtCurrentGoal = (game.cfg.flag('arrival_stuck_guard_v1', false) || game.cfg.flag('movement_occupancy_v1', false)) && u.arrived && u.goal &&
      dist(u.x,u.y,u.goal.x,u.goal.y) < (game.walls && game.walls.enabled()
        ? (game.cfg.navBudget?.arriveRadius?.walls ?? 34) : (game.cfg.navBudget?.arriveRadius?.legacy ?? 24)) &&
      (!u._crowdActive || !u._crowdPoint || dist(u.x,u.y,u._crowdPoint.x,u._crowdPoint.y)<2);
    const wait=u._occupancyWait, blocker=wait&&game.units.get(wait.blockerId);
    const waitingForUnit=game.cfg.flag('movement_occupancy_v1',false) && game.cfg.flag('movement_queue_wait_v1',true) && !u.playerControlled && !u.perception.hasContact &&
      u.goal && wait && wait.goalX===u.goal.x && wait.goalY===u.goal.y && game.time-wait.lastBlocked<=0.5 &&
      game.time-wait.since<10 && blocker?.alive && !blocker.downed &&
      dist(u.x,u.y,blocker.x,blocker.y)<=u.radius+blocker.radius+Math.max(u.speed,1)*(game.dt||0.1)+3;
    const planningRoute = smartRouteSearching(game, u);
    if (u.goal && moved < 6 && u.alive && !u.downed && !arrivedAtCurrentGoal && !waitingForUnit && !planningRoute) {
      u.stuck += 1;
      if (u.stuck >= 2) {
        if (game.cfg.flag('alg_deadlock', false)) {
          // Это только наблюдение старого сброса цели, не разрешение дедлока.
          const event = { t: game.time, unitId: u.id, faction: u.faction, role: u.role,
            x: u.x, y: u.y, goalX: u.goal.x, goalY: u.goal.y };
          const stats = game.deadlockStats || (game.deadlockStats = { pathFailures: [0, 0], recent: [] });
          if (u.faction === 0 || u.faction === 1) stats.pathFailures[u.faction]++;
          const limit = Math.max(0, Math.floor(game.cfg.navBudget?.antiStuck?.failureLogLimit ?? 128));
          if (limit > 0) {
            stats.recent.push(event);
            if (stats.recent.length > limit) stats.recent.splice(0, stats.recent.length - limit);
          }
          game.events.emit('pathFailed', event);
        }
        u.goal = null; u.flowDir = null; u.stuck = 0; u.pathFailed = true;
      }
    } else if (arrivedAtCurrentGoal || waitingForUnit || moved > 20) u.stuck = 0;
  }
}

export function moveAlongFlow(game, u, dt) {
  if (!u.goal) { if (u._smartRoute || game._smartRouteState?.active?.unit === u) cancelSelectedSmartRoute(game,u); if (u._crowdActive || u._crowdGroupGoal) clearCrowdState(u); u.flowDir = null; return; }
  // Adjust a destination embedded in a wall before asking for a flow field.
  // This does not validate all intermediate edges of the coarse nav grid.
  if (game.cfg.flag('wall_goal_guard_v1', false) && game.walls?.enabled() &&
      game.walls.blocksMove(u.goal.x, u.goal.y, u.radius, u)) {
    const goal = u.goal, safe = wallSafeGoal(game,u);
    if (u._smartRoute) discardSmartRoute(u);
    if (u._crowdActive || u._crowdGroupGoal) clearCrowdState(u);
    u.flowDir = null; u.stuck = 0;
    if (!safe) {
      u.goal = null; u.pathFailed = true;
      game.events?.emit('pathFailed', {t:game.time,unitId:u.id,faction:u.faction,role:u.role,
        x:u.x,y:u.y,goalX:goal.x,goalY:goal.y,reason:'goal_blocked_by_wall'});
      return;
    }
    u.goal = safe;
  }
  // A vehicle cannot squeeze through pedestrian doors. Orders targeting the
  // centre of a walled building are approached from an accessible exterior.
  if (u.isVehicle && !u.playerControlled && game.cfg.flag('vehicle_exterior_v1', true) &&
      game.walls?.enabled() && game.walls.buildingAtPoint && game.logistics?.exteriorPoint) {
    const b = game.walls.buildingAtPoint(u.goal.x,u.goal.y);
    const st = b && game.walls.state(b);
    // Preserve the original target only if a real, sufficiently wide gate
    // exists. Infantry-only doors must still send vehicles to the exterior.
    const usableGate = st && game.cfg.flag('vehicle_gate_access_v1', false) &&
      st.outline.openings.some(o => game.walls.vehicleFitsGate(u, o, st.outline));
    const outside = !!(st && game.walls.buildingAtPoint(u.x,u.y) !== b);
    if (outside && game._vehicleGateMetrics && usableGate) game._vehicleGateMetrics.preserved++;
    if (outside && !usableGate) {
      const safe = game.logistics.exteriorPoint(u,b);
      cancelSelectedSmartRoute(game,u);
      if (u._crowdActive || u._crowdGroupGoal) clearCrowdState(u);
      u.flowDir = null;
      if (!safe) { u.goal = null; u.pathFailed = true; return; }
      u.goal = {...u.goal, x:safe.x, y:safe.y};
    }
  }
  // Bot destinations are parking places, not waypoints: keep door transit legal.
  if (!u.playerControlled && game.walls?.enabled() && unsafeRest(game, u.goal.x, u.goal.y, u.radius)) {
    const goal = u.goal, safe = safeRestGoal(game, u, goal);
    cancelSelectedSmartRoute(game, u);
    if (u._crowdActive || u._crowdGroupGoal) clearCrowdState(u);
    if (!safe) {
      u.goal = null; u.flowDir = null; u.pathFailed = true;
      game.events?.emit('pathFailed', {t:game.time,unitId:u.id,faction:u.faction,role:u.role,
        x:u.x,y:u.y,goalX:goal.x,goalY:goal.y,reason:'no_safe_rest_position'});
      return;
    }
    u.goal = safe; u.flowDir = null; u.stuck = 0;
  }
  // updateTimers при отказе удаляет цель. Новая цель бойца или танка — новая
  // попытка; F8 не должен игнорировать её из-за прошлого отказа. Грузовики
  // управляются отдельно логистикой, которая сама обрабатывает этот статус.
  if (u.pathFailed && u.role !== 'truck') u.pathFailed = false;
  const d = dist(u.x, u.y, u.goal.x, u.goal.y);
  const visionChoice = game.cfg.flag('vision_nav_policy_v1', false) ? chooseVisionNavigation(game,u) : null;
  // The two-person formation is restricted to a visibly opposing exit. This
  // avoids silently reforming normal squads when their members disperse.
  const allowPair = !!visionChoice && visionChoice.mode !== 'combat' && game.cfg.flag('group_nav_pair_v1', false) &&
    (u._crowdPairManaged || !!courtesyYield(game,u,visionChoice.visibleIds));
  const managedPair = allowPair && visionChoice.mode === 'pair' && (!u._crowdGroupGoal || u._crowdPairManaged);
  // A formed 3+ group must not silently lose its reservations when a casualty
  // leaves two visible members. Keep only the existing formation, never create
  // a new pair, and immediately yield to combat/changed goals as before.
  const survivorPair = game.cfg.flag('crowd_group_survivor_v1', false) && visionChoice?.mode === 'pair' &&
    u._crowdGroupGoal && !u._crowdPairManaged && Math.hypot(u.goal.x-u._crowdGroupGoal.x,u.goal.y-u._crowdGroupGoal.y)<1 &&
    game.unitGrid.query(u.x,u.y,220).some(v=>v!==u && visionChoice.visibleIds.has(v.id) && v.alive && !v.downed &&
      !v.perception?.hasContact && v.faction===u.faction && v.goal && v._crowdGroupGoal &&
      Math.hypot(v.goal.x-u.goal.x,v.goal.y-u.goal.y)<1 &&
      Math.hypot(v._crowdGroupGoal.x-u._crowdGroupGoal.x,v._crowdGroupGoal.y-u._crowdGroupGoal.y)<1);
  if (!visionChoice || visionChoice.mode === 'group' || managedPair || survivorPair) prepareCrowdNavigation(game, u, d, managedPair ? 2 : undefined, allowPair);
  else if (u._crowdActive || u._crowdGroupGoal) clearCrowdState(u);
  // Радиус прибытия: со стенами чуть больше (юнит стоит у стены, а не в центре точки),
  // с выключенным флагом — прежние 24 px, чтобы поведение не менялось.
  const arrive = game.cfg.navBudget?.arriveRadius || { legacy: 24, walls: 34 };
  const arriveD = game.walls && game.walls.enabled() ? arrive.walls : arrive.legacy;
  const inPassage = !u.playerControlled && unsafeRest(game, u.x, u.y, u.radius);
  if (d < arriveD && !inPassage && (!u._crowdActive || !u._crowdPoint || Math.hypot(u.x-u._crowdPoint.x,u.y-u._crowdPoint.y)<2)) {
    // A unit can reach its goal while its incremental search is still active.
    // Release that job immediately; otherwise another unit may wait six seconds.
    if (u._smartRoute || game._smartRouteState?.active?.unit === u) cancelSelectedSmartRoute(game,u);
    u.arrived = true; u.flowDir = null; return;
  }
  u.arrived = false;
  // Near a safe goal, step directly out of a doorway if the swept path is clear.
  if (inPassage && d > 0.01 && d < 80 && game.walls.blocksMoveSweep &&
      !game.walls.blocksMoveSweep(u.x,u.y,u.goal.x,u.goal.y,u.radius,u)) {
    moveUnit(game,u,u.goal.x-u.x,u.goal.y-u.y,dt,null,{skipDoorWaypoint:true});
    return;
  }
  if (visionChoice && (visionChoice.mode === 'combat' || ((visionChoice.mode === 'group' || visionChoice.mode === 'pair') && u._crowdActive))) cancelSelectedSmartRoute(game,u);
  else if (game.cfg.flag('smart_route_v2', false) || game.cfg.flag('bot_obstacle_vision_v1', false) || truckRouteAssist(game,u)) {
    if (!visionChoice || visionChoice.obstacle || (u.stuck || 0) >= 1 || u._smartRoute || game._smartRouteState?.active?.unit === u)
      updateSmartRoute(game,u);
  } else if (u._smartRoute || game._smartRouteState?.active?.unit === u) cancelSelectedSmartRoute(game,u);
  if (!u.flowDir || u.flowTimer <= 0) {
    // Отряд идёт по общему полю (одно на отряд), персональное поле — только для одиночек.
    const sq = u.squad;
    let st = null;
    if (sq && sq.field && d > 130 && (u.activity === 'advance' || u.activity === 'retreat' || u.activity === 'idle')) {
      st = game.nav.step(sq.field, u.x, u.y);
    }
    if (!st) {
      const field = game.nav.field(u.goal.x, u.goal.y);
      st = field ? game.nav.step(field, u.x, u.y) : null;
    }
    if (st) u.flowDir = { x: st.dx, y: st.dy };
    else {
      u.flowDir = { x: (u.goal.x - u.x) / d, y: (u.goal.y - u.y) / d };
    }
    u.flowTimer = 0.45 + game.rng.next() * 0.25;
  }
  u.flowTimer -= dt;
  setCrowdDetour(game,u);
  let mx=u.flowDir.x,my=u.flowDir.y;
  if(game.cfg.flag('near_goal_direct_v1',false) && !u.isVehicle && !u.playerControlled &&
     !u.perception.hasContact && !u._crowdActive && !u.detour && d<90 && game.walls?.enabled() &&
     !game.walls.buildingAtPoint(u.x,u.y) && !game.walls.buildingAtPoint(u.goal.x,u.goal.y)) {
    let clear=true;const r=u.radius,steps=Math.ceil(d/6),w=game.world;
    for(let i=1;i<=steps;i++){
      const x=u.x+(u.goal.x-u.x)*i/steps,y=u.y+(u.goal.y-u.y)*i/steps;
      if(!w.isBaseWalkable(x,y)||!w.isBaseWalkable(x-r,y-r)||!w.isBaseWalkable(x+r,y-r)||
         !w.isBaseWalkable(x-r,y+r)||!w.isBaseWalkable(x+r,y+r)||game.walls.blocksMove(x,y,r,u)){clear=false;break;}
    }
    if(clear){mx=u.goal.x-u.x;my=u.goal.y-u.y;}
  }
  moveUnit(game, u, mx, my, dt, visionChoice);
}
