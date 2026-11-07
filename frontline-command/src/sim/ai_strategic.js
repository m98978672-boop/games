// Стратегический ИИ фракции: Utility AI по influence map, выдаёт ДИРЕКТИВЫ через Command API.
// Один и тот же класс управляет и врагом, и (при автопилоте) фракцией игрока.
import { clamp, dist } from '../core/mathx.js';

const VALUE = { hq: 3.0, city: 1.5, depot: 0.8, factory: 1.0, farm: 0.4, bridge: 0.7 };

export class StrategicAI {
  constructor(game, faction) {
    this.game = game;
    this.faction = faction;
    this.timer = game.rng.range(0, 1.5);
    this.journal = [];
    this.assignments = new Map();
    this.lastCapture = null;
  }

  active() {
    return this.game.autopilot.areaEnabled(this.faction, 'combat') || this.game.autopilot.areaEnabled(this.faction, 'defense');
  }
  combatAllowed() { return this.game.autopilot.areaEnabled(this.faction, 'combat'); }
  defenseAllowed() { return this.game.autopilot.areaEnabled(this.faction, 'defense'); }

  update(dt) {
    if (this.game.warOver) return;
    this.timer -= dt;
    if (this.timer > 0) return;
    const cfg = this.game.cfg.ai.strategic;
    const diff = this.game.difficulty;
    this.timer = (diff.strategicInterval || cfg.interval) * this.game.rng.range(0.85, 1.15);
    if (!this.active()) return;
    this.plan(cfg);
  }

  plan(cfg) {
    const game = this.game;
    const faction = this.faction;
    const enemy = 1 - faction;
    const persona = cfg.personaWeights[game.cfg.faction(faction).persona] || cfg.personaWeights.balanced;
    const w = cfg.weights;
    const mySquads = [...game.squads.values()].filter((s) => s.faction === faction && s.state !== 'destroyed' && s.count() > 0);
    if (!mySquads.length) return;
    // Свободен тот, у кого нет задачи наступления: обороняющиеся посты можно переназначить,
    // но армия не остаётся без защитников — оборонную ветку план считает первой.
    const free = mySquads.filter((s) => {
      if (!s.objective) return true;
      if (s.objective.type === 'capture') return false;
      return s.state !== 'retreat' && s.state !== 'regroup';
    });
    const limit = game.directiveLimit(faction);
    const assigned = new Map();
    const used = new Set();
    const hq = game.world.hqOf(faction);

    // 1. Оценка секторов (атака и оборона)
    const scored = game.world.sectors.map((s) => {
      const points = game.world.points.filter((p) => game.world.sectorAt(p.x, p.y)?.id === s.id);
      const value = points.reduce((acc, p) => acc + (VALUE[p.type] || 0.3) + (p.key ? 0.4 : 0), 0);
      const ownPower = s.strength[faction], enemyPower = s.strength[enemy];
      const enemyPoints = points.filter((p) => p.owner === enemy);
      const neutralPoints = points.filter((p) => p.owner === -1);
      const d = hq ? dist(hq.x, hq.y, s.cx, s.cy) / 4200 : 0.5;
      const adjacentEnemy = s.neighbors.some((nid) => {
        const n = game.world.sectorById(nid);
        return n && (n.owner === enemy || n.influence * (faction === 0 ? 1 : -1) < -0.15);
      });
      const weakness = clamp(1 - enemyPower / (ownPower + 2), 0, 1);
      const attackable = (enemyPoints.length > 0 || neutralPoints.length > 0 || adjacentEnemy) && (s.owner !== faction || enemyPoints.length > 0);
      const attack = attackable
        ? (weakness * w.weakness + value * w.value - d * w.distance - (enemyPower > ownPower * 1.8 ? w.risk : 0)) * persona.attack
        : -99;
      const threat = enemyPower + (s.owner === faction ? 1 : 0) + (adjacentEnemy ? 0.3 : 0);
      const defense = s.owner === faction
        ? (threat * w.threat + value * w.value + clamp(s.influence * (faction === 0 ? 1 : -1), 0, 1)) * persona.defense
        : -99;
      return { sector: s, points, value, attack, defense, ownPower, enemyPower, enemyPoints, neutralPoints, hasEnemyHQ: enemyPoints.some((p) => p.type === 'hq') };
    });
    // Добивание: когда враг почти разбит, стратег снижает порог сил и идёт на штаб —
    // война должна заканчиваться, а не тянуться до тайм-аута.
    const enemyUnits = [...game.units.values()].filter((u) => u.alive && u.faction === enemy).length;
    const finishing = enemyUnits <= (cfg.finishUnitsBelow ?? 12);
    // Армия выродилась в один-два отряда или давно нет захватов — идём в all-in:
    // иначе остатки войск «сторожат» точки, и война заканчивается только тайм-аутом.
    const sinceCapture = game.time - (this.lastCapture?.t ?? 0);
    const stalled = sinceCapture > (cfg.stallSeconds ?? 240);
    const allIn = stalled || (mySquads.length <= 2 && enemyUnits <= 24);
    if (finishing) {
      for (const t of scored) {
        if (!t.hasEnemyHQ) continue;
        t.attack = Math.max(t.attack, 0) * (cfg.finishHqBoost ?? 2) + 1.5;
      }
    }

    // 2. Оборона: подкрепления к своим угрожаемым точкам.
    // Оборона НЕ съедает всю армию: часть директив зарезервирована под наступление,
    // иначе отряды бесконечно перебрасываются по фронту и война не заканчивается.
    // В all-in обороны нет: последние отряды идут на штурм, иначе они «сторожат» точки вечно.
    // В обычном режиме один отряд всегда остаётся в резерве под наступление.
    const defenseCap = Math.min(
      allIn ? 0 : finishing ? 2 : Math.max(1, Math.min(limit - 1, Math.round(limit * 0.6))),
      Math.max(0, mySquads.length - 1),
    );
    // Оборону держим превентивно (сосед уже под угрозой), но только за свои ключевые точки:
    // иначе армия размазывается по всему фронту и наступление не начинается.
    const worthHolding = (t) => t.points.some((p) => p.owner === faction && (p.key || p.type === 'hq' || p.type === 'city'));
    const threats = this.defenseAllowed()
      ? scored.filter((t) => t.defense > cfg.defendThreshold && t.ownPower < t.enemyPower + 2 &&
        (t.enemyPower >= 1 || worthHolding(t)))
        .sort((a, b) => b.defense - a.defense)
      : [];
    for (const t of threats) {
      if (used.size >= Math.min(limit, defenseCap)) break;
      const sq = this.pickSquad(free, t.sector, used, t.enemyPower);
      if (!sq) continue;
      const point = t.points.find((p) => p.owner === faction) || null;
      this.issue(sq, 'hold', t.sector, point, 'defense_depth', 'оборона угрожаемого сектора');
      used.add(sq.id);
      assigned.set(sq.id, { target: t.sector.id, at: game.time });
    }

    // 3. Атака: сильнейшие цели, только собранной группой (не в самоубийство по одному отряду)
    // «Разминка»: в первые минуты порог атаки выше, чтобы война не решалась одним броском
    // на 90-й секунде, пока вторая сторона ещё разворачивается.
    const opening = clamp(1 - game.time / Math.max(1, cfg.openingSeconds ?? 1), 0, 1);
    const attackThreshold = cfg.attackThreshold * (1 + (cfg.openingThresholdMult ?? 0) * opening);
    const attacks = this.combatAllowed()
      ? scored.filter((t) => t.attack > attackThreshold).sort((a, b) => b.attack - a.attack)
      : [];
    const totalSquads = mySquads.length;
    // Концентрация сил: одновременно ведём 1–2 наступления, а не «по отряду на цель».
    const maxTargets = finishing || allIn ? 1 : 2;
    const attacked = new Set();
    for (const t of attacks) {
      if (used.size >= limit) break;
      if (attacked.size >= maxTargets) break;
      if (!allIn && totalSquads <= 2 && game.world.hqOf(faction) && t.value < 2) continue;
      const already = t.sector.id;
      const count = [...assigned.values()].filter((a) => a.target === already).length;
      const maxForTarget = t.points.some((p) => p.type === 'hq') ? Math.min(3, limit) : cfg.maxSquadsPerTarget;
      if (count >= maxForTarget) continue;
      const point = this.bestTargetPoint(t, enemy, faction);
      if (!point) continue;
      // оцениваем, хватит ли сил: сила отрядов против силы врага в секторе и рядом
      let need = (t.enemyPower + 1) * (finishing ? (cfg.finishPowerFactor ?? 1) : 1.25);
      need *= 1 + (cfg.openingPowerMult ?? 0) * opening;
      if (allIn) need = Math.max(1, need * (cfg.allInPowerFactor ?? 0.55));
      const group = [];
      let power = 0;
      const candidates = free.filter((s) => !used.has(s.id))
        .sort((a, b) => dist(a.centroid().x, a.centroid().y, point.x, point.y) - dist(b.centroid().x, b.centroid().y, point.x, point.y));
      for (const sq of candidates) {
        group.push(sq);
        power += sq.strength();
        if (power >= need || group.length >= cfg.maxSquadsPerTarget) break;
      }
      if (!group.length || power < need) continue;
      const strategy = this.chooseStrategy(group[0], t, count, persona);
      for (const sq of group) {
        this.issue(sq, 'capture', t.sector, point, strategy, `атака: ${point.name}`);
        used.add(sq.id);
        assigned.set(sq.id, { target: t.sector.id, at: game.time });
      }
      attacked.add(t.sector.id);
    }

    // 4. Снабжение: отряды без патронов
    for (const sq of mySquads) {
      if (sq.ammoRatio() < 0.22 && game.time - (sq.lastSupplyOrder || 0) > 30) {
        sq.lastSupplyOrder = game.time;
        game.api.issue({
          source: faction === game.playerFaction ? 'autopilot' : 'enemyAI',
          type: 'resupply', faction, squadIds: [sq.id], target: sq.centroid(),
          params: {}, reason: `патроны ${Math.round(sq.ammoRatio() * 100)}%`,
        });
      }
    }
    // 5. Ключевые сектора без защитников: занять.
    // Только когда армия не в режиме «последний бросок»: иначе часовой съедает единственный атакующий отряд.
    if (!allIn && !finishing && mySquads.length >= 3 && free.length && used.size < limit) {
      const undefended = scored.filter((t) => t.points.some((p) => p.owner === faction && p.key) && t.ownPower === 0)
        .sort((a, b) => b.value - a.value)[0];
      if (undefended) {
        const sq = free.find((s) => !used.has(s.id));
        if (sq) {
          const point = undefended.points.find((p) => p.owner === faction);
          this.issue(sq, 'hold', undefended.sector, point, 'defense_depth', 'ключевая точка без охраны');
          used.add(sq.id);
        }
      }
    }
    this.journal.push({
      t: game.time, faction,
      text: `свободных ${free.length}/${mySquads.length}, целей ${attacks.length}, угроз ${threats.length}, назначено ${used.size}/${limit}${finishing ? ' [добивание]' : allIn ? ' [all-in]' : ''}`,
      topAttack: attacks.slice(0, 3).map((a) => `${a.sector.name}:${a.attack.toFixed(2)}`),
    });
    if (this.journal.length > 60) this.journal.shift();
  }

  pickSquad(free, sector, used, enemyPower) {
    const game = this.game;
    let best = null, score = -Infinity;
    for (const sq of free) {
      if (used.has(sq.id)) continue;
      const c = sq.centroid();
      const d = dist(c.x, c.y, sector.cx, sector.cy);
      const last = this.assignments.get(sq.id);
      if (last && last.target === sector.id && game.time - last.at < 25) continue;
      const strength = sq.strength();
      const s = (2000 - d) / 1000 + strength * 2 - (enemyPower > strength * 2.2 ? 4 : 0);
      if (s > score) { score = s; best = sq; }
    }
    return best;
  }

  bestTargetPoint(t, enemy, faction) {
    const list = t.points.filter((p) => p.owner !== faction);
    if (!list.length) return null;
    list.sort((a, b) => (VALUE[b.type] + (b.key ? 0.5 : 0)) - (VALUE[a.type] + (a.key ? 0.5 : 0)));
    return list[0];
  }

  chooseStrategy(sq, target, assignedCount, persona) {
    const ratio = (sq.strength() + 1) / (target.enemyPower + 1);
    const fortified = this.game.world.buildings.filter((b) =>
      b.built && !b.dead && b.faction !== sq.faction && dist(b.x, b.y, target.sector.cx, target.sector.cy) < 700 &&
      ['bunker', 'trench', 'mg_nest'].includes(b.type)).length;
    if (target.points.some((p) => p.type === 'hq')) return ratio > 1.8 ? 'rush' : 'encircle';
    if (ratio > 1.7) return 'rush';
    if (fortified >= 3) return 'flank';
    if (assignedCount >= 1) return 'encircle';
    if (ratio < 0.8) return persona.attack > 1.2 ? 'attrition' : 'defense_depth';
    if (persona.defense > 1.2) return 'cautious';
    return 'cautious';
  }

  issue(sq, type, sector, point, strategy, reason) {
    const game = this.game;
    const px = point ? point.x : sector.cx;
    const py = point ? point.y : sector.cy;
    game.api.issue({
      source: this.faction === game.playerFaction ? 'autopilot' : 'enemyAI',
      type: 'directive', faction: this.faction, squadIds: [sq.id],
      target: { x: px, y: py, pointId: point ? point.id : null, sectorId: sector.id },
      params: { goalType: type === 'capture' ? 'capture' : 'hold', strategy, after: 'hold' },
      priority: 2, reason,
    });
  }

  onPointCaptured(point, faction) {
    if (faction === this.faction) {
      this.lastCapture = { point, t: this.game.time };
      for (const sq of this.game.squads.values()) {
        if (sq.faction === this.faction && sq.objective?.pointId === point.id) sq.terrainHeld = true;
      }
    }
  }
}
