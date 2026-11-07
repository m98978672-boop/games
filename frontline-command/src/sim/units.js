// Юнит: данные, движение, Perception, урон и стрельба. Один код для игрока, ботов и врага.
import {
  clamp, dist, dist2, angleTo, angleDiff, degToRad, lerp, TAU, normAngle, approachAngle,
} from '../core/mathx.js';

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
  const enemies = game.nearbyEnemies(u, u.vision + 60);
  let best = null, bestScore = -Infinity;
  p.enemies.length = 0;
  for (const e of enemies) {
    if (!e.alive || e.downed) continue;
    const d = dist(u.x, u.y, e.x, e.y);
    if (d > u.vision) continue;
    let visible = d < game.cfg.ai.perception.closeAwareness;
    if (!visible) {
      const a = angleTo(u.x, u.y, e.x, e.y);
      if (angleDiff(a, u.facing) < cone / 2) {
        visible = game.world.hasLOS(u.x, u.y, e.x, e.y, true);
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

// ---------- Стрельба ----------
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
      applyDamage(game, target, u.weapon.damage * u.damageMult * game.accuracyFactor(u), u, { kind: 'bullet' });
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
  game.addBloodAt(target.x, target.y);
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
  game.decals.push({ type: u.isVehicle ? 'wreck' : 'corpse', x: u.x, y: u.y, faction: u.faction, angle: u.facing, t: game.time });
  if (game.decals.length > 160) game.decals.shift();
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
  if (!u.downed || !u.alive) return;
  u.downed = false;
  u.hp = Math.round(u.maxHp * (game.modsFor(u.faction).revive_hp || 0.35));
  u.bleed = 0;
  u.state = 'active';
  u.stateLabel = 'поднят';
  game.events.emit('unitRevived', { unit: u, t: game.time });
}

// ---------- Движение ----------
export function moveUnit(game, u, dx, dy, dt) {
  if (!u.alive || u.downed) return;
  let speed = u.speed;
  speed *= game.world.speedAt(u.x, u.y);
  if (u.isVehicle && u.engineDamage) speed *= 0.55;
  if (u.suppression > 0.5) speed *= 0.9;
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
  }
  const step = speed * dt;
  const nx = u.x + dx * step, ny = u.y + dy * step;
  const r = u.radius;
  const free = (x, y) => game.world.isWalkable(x - r, y - r) && game.world.isWalkable(x + r, y - r) &&
    game.world.isWalkable(x - r, y + r) && game.world.isWalkable(x + r, y + r) && game.world.isWalkable(x, y);
  if (free(nx, ny)) { u.x = nx; u.y = ny; }
  else if (free(nx, u.y)) { u.x = nx; }
  else if (free(u.x, ny)) { u.y = ny; }
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
  u.x = clamp(u.x, 8, game.world.W - 8);
  u.y = clamp(u.y, 8, game.world.H - 8);
  if (Math.hypot(dx, dy) > 0.1) u.facing = approachAngle(u.facing, Math.atan2(dy, dx), dt * 8);
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
    if (u.targetId != null) {
      const t = game.unitById(u.targetId);
      if (t && t.alive && dist(u.x, u.y, t.x, t.y) < u.vision) {
        u.turretAngle = approachAngle(u.turretAngle, angleTo(u.x, u.y, t.x, t.y), dt * (u.turretDamage ? 1.2 : 2.4));
      }
    }
  }
  // антизастревание
  if (u.age - u.lastCheck.t > 2.5) {
    const moved = dist(u.x, u.y, u.lastCheck.x, u.lastCheck.y);
    u.lastCheck = { x: u.x, y: u.y, t: u.age };
    if (u.goal && moved < 6 && u.alive && !u.downed) {
      u.stuck += 1;
      if (u.stuck >= 2) { u.goal = null; u.flowDir = null; u.stuck = 0; u.pathFailed = true; }
    } else if (moved > 20) u.stuck = 0;
  }
}

export function moveAlongFlow(game, u, dt) {
  if (!u.goal) { u.flowDir = null; return; }
  const d = dist(u.x, u.y, u.goal.x, u.goal.y);
  if (d < 24) { u.arrived = true; u.flowDir = null; return; }
  u.arrived = false;
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
  moveUnit(game, u, u.flowDir.x, u.flowDir.y, dt);
}
