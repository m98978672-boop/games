// Правила «Если → То»: простые пары триггер-действие, превращаются в обычные приказы Command API.
import { clamp, dist } from '../core/mathx.js';

export class RulesEngine {
  constructor(game) {
    this.game = game;
    this.rules = new Map();
    for (const f of game.cfg.factions) this.rules.set(f.id, ['losses40', 'ammo20', 'captured']);
    this.cooldown = new Map();
    this.timer = 0;
    this.journal = [];
  }

  slots(faction) {
    const base = this.game.cfg.ai.limits.rulesBase;
    return base + (this.game.modsFor(faction).rules_slots_add || 0);
  }

  list(faction) { return this.rules.get(faction) || []; }

  setRules(faction, ids) {
    const limit = this.slots(faction);
    this.rules.set(faction, ids.slice(0, limit));
  }

  toggle(faction, id) {
    const cur = this.list(faction);
    if (cur.includes(id)) this.setRules(faction, cur.filter((r) => r !== id));
    else if (cur.length < this.slots(faction)) this.setRules(faction, [...cur, id]);
    else this.game.events.emit('ruleRejected', { faction, reason: 'нет свободных слотов правил', t: this.game.time });
  }

  update(dt) {
    this.timer -= dt;
    if (this.timer > 0) return;
    this.timer = 1.0;
    for (const f of this.game.cfg.factions) this.evaluate(f.id);
  }

  cooldownOf(faction, id) {
    const key = faction + ':' + id;
    return this.cooldown.get(key) || 0;
  }
  setCooldown(faction, id, seconds) { this.cooldown.set(faction + ':' + id, seconds); }

  tickCooldowns(dt) {
    for (const [k, v] of this.cooldown) this.cooldown.set(k, Math.max(0, v - dt));
  }

  evaluate(faction) {
    const game = this.game;
    const ids = this.list(faction);
    if (!ids.length) return;
    const squads = [...game.squads.values()].filter((s) => s.faction === faction && s.state !== 'destroyed' && s.count() > 0);
    const free = squads.filter((s) => !s.objective || s.state === 'hold');
    for (const id of ids) {
      if (this.cooldownOf(faction, id) > 0) continue;
      const preset = game.cfg.rules[id];
      if (!preset) continue;
      const res = this.test(faction, preset, squads, free);
      if (!res) continue;
      this.setCooldown(faction, id, 20);
      this.apply(faction, preset, res);
    }
    this.tickCooldowns(1);
  }

  test(faction, preset, squads, free) {
    const game = this.game;
    const trg = preset.trigger;
    if (trg.type === 'losses') {
      const sq = squads.find((s) => s.losses() >= trg.value && s.state !== 'retreat');
      return sq ? { squads: [sq], reason: `потери ${Math.round(sq.losses() * 100)}% > ${Math.round(trg.value * 100)}%` } : null;
    }
    if (trg.type === 'ammo') {
      const sq = squads.find((s) => s.ammoRatio() < trg.value && s.state !== 'regroup');
      return sq ? { squads: [sq], reason: `боеприпасы ${Math.round(sq.ammoRatio() * 100)}% < ${Math.round(trg.value * 100)}%` } : null;
    }
    if (trg.type === 'morale') {
      const sq = squads.find((s) => s.morale() < trg.value && s.state !== 'retreat');
      return sq ? { squads: [sq], reason: `мораль ${Math.round(sq.morale())} < ${trg.value}` } : null;
    }
    if (trg.type === 'enemySector') {
      for (const s of game.world.sectors) {
        if (s.owner !== faction) continue;
        if (s.units[1 - faction] <= s.units[faction]) continue;
        if (!free.length) continue;
        const nearest = free.slice().sort((a, b) => {
          const ca = a.centroid(), cb = b.centroid();
          return dist(ca.x, ca.y, s.cx, s.cy) - dist(cb.x, cb.y, s.cx, s.cy);
        })[0];
        return { squads: [nearest], sector: s, reason: `враг в секторе «${s.name}»` };
      }
      return null;
    }
    if (trg.type === 'captured') {
      const recent = game.influence?.lastCapture;
      if (!recent || game.time - recent.t > 15) return null;
      if (recent.faction !== faction) return null;
      return { point: recent.point, reason: `сектор «${recent.point.name}» захвачен` };
    }
    if (trg.type === 'noSupply') {
      for (const s of game.world.sectors) {
        if (s.owner !== faction) continue;
        const v = game.logistics.sectorSupplyFor(faction, s.id);
        if (v < 0.3) return { sector: s, reason: `нет снабжения в «${s.name}»` };
      }
      return null;
    }
    return null;
  }

  apply(faction, preset, res) {
    const game = this.game;
    const source = faction === game.playerFaction ? 'rules' : 'enemyAI';
    const action = preset.action;
    this.journal.push({ t: game.time, faction, rule: preset.name, action: action.type, reason: res.reason });
    if (this.journal.length > 80) this.journal.shift();
    if (action.type === 'retreat' || action.type === 'regroup') {
      const sq = res.squads?.[0];
      if (!sq) return;
      const hq = game.world.hqOf(faction);
      game.api.issue({
        source, type: 'retreat', faction, squadIds: [sq.id],
        target: { x: hq.x + game.rng.range(-120, 120), y: hq.y + game.rng.range(-120, 120) },
        params: {}, reason: res.reason,
      });
    } else if (action.type === 'resupply') {
      const sq = res.squads?.[0];
      if (sq) game.api.issue({ source, type: 'resupply', faction, squadIds: [sq.id], target: sq.centroid(), params: {}, reason: res.reason });
    } else if (action.type === 'sendFreeSquads') {
      for (const sq of res.squads || []) {
        game.api.issue({
          source, type: 'hold', faction, squadIds: [sq.id],
          target: { sectorId: res.sector?.id, x: res.sector?.cx, y: res.sector?.cy },
          params: {}, reason: res.reason,
        });
      }
    } else if (action.type === 'buildProfile') {
      if (!game.build.buildWanted(faction)) return;
      game.api.issue({
        source, type: 'build_profile', faction,
        target: { x: res.point?.x ?? res.sector?.cx, y: res.point?.y ?? res.sector?.cy, sectorId: res.sector?.id },
        params: { profile: action.profile, pointId: res.point?.id }, reason: res.reason,
      });
      game.build.noteBuild(faction);
    } else if (action.type === 'fallbackDepot') {
      const depot = game.world.nearestPoint(game.world.hqOf(faction)?.x || 0, game.world.hqOf(faction)?.y || 0, (p) => p.type === 'depot' && p.owner === faction).point;
      if (depot) game.logistics.requestSector(game.world.sectorAt(depot.x, depot.y).id, faction);
    }
  }
}
