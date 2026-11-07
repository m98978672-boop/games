// Строительство: чертежи, призрак, работа инженеров, профили обороны, ремонт, пулемётные гнёзда.
import { clamp, dist, angleTo } from '../core/mathx.js';

export const FORT_TYPES = ['sandbags', 'wire', 'trench', 'mg_nest', 'bunker', 'watchtower'];

export class BuildSystem {
  constructor(game) {
    this.game = game;
    this.blueprints = [];
    this.turretTimer = 0;
    this.alertCooldown = 0;
    this.placedCount = 0;
  }

  canPlace(type, x, y, faction, ignoreCost = false) {
    const game = this.game;
    const def = game.cfg.building(type);
    if (!def) return { ok: false, reason: 'неизвестная постройка' };
    if (def.category !== 'fort' && def.category !== 'point') return { ok: false, reason: 'эту постройку нельзя ставить вручную' };
    if (x < 60 || y < 60 || x > game.world.W - 60 || y > game.world.H - 60) return { ok: false, reason: 'за границей карты' };
    if (!game.world.isWalkable(x, y)) return { ok: false, reason: 'здесь вода или препятствие' };
    if (type === 'bunker' && !(game.modsFor(faction).unlock_build || []).includes('bunker')) {
      return { ok: false, reason: 'нужен навык «Бункеры»' };
    }
    const half = def.size / 2;
    for (const [ox, oy] of [[-half, -half], [half, -half], [-half, half], [half, half]]) {
      if (!game.world.isWalkable(x + ox, y + oy)) return { ok: false, reason: 'постройка не помещается' };
    }
    const near = game.world.buildingGrid.query(x, y, def.size + 20);
    for (const b of near) {
      if (b.dead) continue;
      if (dist(x, y, b.x, b.y) < (b.w + def.size) * 0.5 - 4) return { ok: false, reason: 'место занято' };
    }
    if (!ignoreCost && !game.logistics.canAfford(faction, def.cost || {})) {
      const need = Object.entries(def.cost || {}).map(([k, v]) => `${game.cfg.resources.types[k].name}: ${v}`).join(', ');
      return { ok: false, reason: `не хватает ресурсов (${need})` };
    }
    return { ok: true };
  }

  place(type, x, y, faction, { instant = false, free = false, pointId = null } = {}) {
    const game = this.game;
    const check = this.canPlace(type, x, y, faction, free || instant);
    if (!check.ok) return check;
    const def = game.cfg.building(type);
    if (!free && !instant) {
      if (!game.logistics.spend(faction, def.cost || {})) return { ok: false, reason: 'не хватает ресурсов' };
    }
    const b = game.world.addBuilding({ type, faction, x, y, pointId, instant, blueprint: !instant });
    this.blueprints.push(b);
    this.placedCount++;
    game.sound('blueprint', x, y);
    game.events.emit('blueprintPlaced', { building: b, faction, t: game.time });
    return { ok: true, building: b };
  }

  nearestWork(u, radius) {
    let best = null, bd = radius;
    for (const b of this.blueprints) {
      if (b.dead || b.built) continue;
      if (b.faction !== u.faction) continue;
      const d = dist(u.x, u.y, b.x, b.y);
      if (d < bd) { bd = d; best = b; }
    }
    return best;
  }

  nearestRepair(u, radius) {
    let best = null, bd = radius;
    for (const b of this.game.world.buildings) {
      if (b.dead || !b.built) continue;
      if (b.faction !== u.faction) continue;
      if (b.hp >= b.maxHp * 0.85) continue;
      const d = dist(u.x, u.y, b.x, b.y);
      if (d < bd) { bd = d; best = b; }
    }
    return best;
  }

  work(b, dt, engineer) {
    const game = this.game;
    if (!b || b.built || b.dead) return;
    const stock = game.logistics.supply(b.faction);
    if (stock.materials < 0.6) {
      b.paused = true;
      b.pauseReason = 'нет материалов на складе';
      if (this.alertCooldown <= 0) {
        this.alertCooldown = 15;
        game.alertLog.push({ kind: 'supply', text: 'Стройка встала: нет материалов', x: b.x, y: b.y, t: game.time });
      }
      return;
    }
    b.paused = false;
    stock.materials -= 0.55 * dt;
    const mods = game.modsFor(b.faction);
    const power = (engineer?.buildPower || 10) * (mods.build_speed_mult || 1);
    const time = Math.max(1, b.def.time);
    b.progress = clamp(b.progress + (dt * power) / (time * 12), 0, 1);
    b.builders = 1;
    if (b.progress >= 1) {
      b.built = true;
      b.hp = b.def.hp * (mods.build_hp_mult || 1);
      b.maxHp = b.hp;
      b.blueprint = false;
      b.builders = 0;
      game.world.rebuildNav();
      game.awardXP(b.faction, 'engineer', 'build', 1);
      game.sound('build_done', b.x, b.y);
      game.events.emit('buildingDone', { building: b, faction: b.faction, t: game.time });
      if (engineer) engineer.built++;
    }
  }

  repair(b, dt, engineer) {
    const game = this.game;
    const stock = game.logistics.supply(engineer.faction);
    if (stock.materials < 0.2) { b.paused = true; b.pauseReason = 'нет материалов для ремонта'; return; }
    stock.materials -= 0.15 * dt;
    const mods = game.modsFor(engineer.faction);
    b.hp = Math.min(b.maxHp, b.hp + (engineer.buildPower || 10) * (mods.repair_mult || 1) * dt * 1.6);
    if (b.hp >= b.maxHp) b.paused = false;
  }

  autoRepair(faction) {
    const game = this.game;
    const engineers = [...game.units.values()].filter((u) => u.faction === faction && u.alive && !u.downed && u.role === 'engineer');
    if (!engineers.length) return;
    for (const b of game.world.buildings) {
      if (b.dead || !b.built || b.faction !== faction) continue;
      if (b.hp >= b.maxHp * 0.6) continue;
      const eng = engineers.find((e) => dist(e.x, e.y, b.x, b.y) < 300);
      if (eng) eng.repairTarget = b;
    }
  }

  // Профиль обороны: расставляем постройки дугой в сторону угрозы.
  planProfile(profileId, cx, cy, faction, pointId = null) {
    const game = this.game;
    const profile = game.cfg.profiles[profileId] || game.cfg.profiles.medium;
    const enemyPoint = game.world.enemyHQ(faction);
    const threat = enemyPoint ? angleTo(cx, cy, enemyPoint.x, enemyPoint.y) : 0;
    let index = 0, placed = 0, blockedReason = '';
    for (const item of profile.items) {
      const type = item.type;
      for (let k = 0; k < item.count; k++) {
        const arc = (index % 2 === 0 ? 1 : -1) * (0.25 + ((index * 0.37) % 1) * 0.75);
        const ring = 95 + ((index * 29) % 3) * 42;
        const x = cx + Math.cos(threat + arc) * ring;
        const y = cy + Math.sin(threat + arc) * ring;
        const res = this.place(type, x, y, faction, {});
        if (res.ok) placed++;
        else blockedReason = res.reason;
        index++;
      }
    }
    if (placed === 0) {
      game.alertLog.push({ kind: 'supply', text: `Профиль «${profile.name}» не поставлен: ${blockedReason || 'нет места'}`, x: cx, y: cy, t: game.time });
      return { ok: false, reason: blockedReason || 'нет места' };
    }
    game.alertLog.push({ kind: 'build', text: `Профиль «${profile.name}»: ${placed} чертежей`, x: cx, y: cy, t: game.time });
    return { ok: true, placed };
  }

  demolish(b) {
    if (!b || b.dead) return;
    b.dead = true;
    b.built = false;
    this.game.world.rebuildNav();
    this.game.events.emit('buildingRemoved', { building: b, t: this.game.time });
  }

  update(dt) {
    this.alertCooldown = Math.max(0, this.alertCooldown - dt);
    this.blueprints = this.blueprints.filter((b) => !b.dead);
    if (this.blueprints.length > 400) this.blueprints.splice(0, this.blueprints.length - 400);
    this.turretTimer -= dt;
    if (this.turretTimer > 0) return;
    this.turretTimer = 0.7;
    const game = this.game;
    for (const b of game.world.buildings) {
      if (b.dead || !b.built) continue;
      if (b.type !== 'mg_nest' && b.type !== 'bunker') continue;
      if (b.faction < 0) continue;
      const stock = game.logistics.supply(b.faction);
      if (stock.ammo < 1) continue;
      let target = null, bd = b.type === 'bunker' ? 640 : 520;
      for (const u of game.nearbyEnemies({ x: b.x, y: b.y, faction: b.faction }, bd)) {
        if (!u.alive || u.downed) continue;
        const d = dist(b.x, b.y, u.x, u.y);
        if (d < bd && game.world.hasLOS(b.x, b.y, u.x, u.y, false)) { bd = d; target = u; }
      }
      if (target) {
        stock.ammo -= 0.6;
        const dmg = b.type === 'bunker' ? 16 : 10;
        game.addTracer(b.x, b.y, target.x, target.y, null, '#ffd98a');
        game.sound('shot_mg', b.x, b.y);
        game.fxAt('muzzle', b.x, b.y, angleTo(b.x, b.y, target.x, target.y));
        if (game.rng.chance(0.45)) game.applyDamageToUnit(target, dmg, null, {});
      }
    }
  }
}
