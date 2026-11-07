// Тактический ИИ отряда: FSM «Двигаться → Занять → Подавить → Штурмовать → Отступить → Перегруппироваться»,
// фазы алгоритма директивы, формации, перекаты, фланги.
import { clamp, dist, angleTo, lerp } from '../core/mathx.js';

const PHASE_STATE = {
  attack: 'assault', hold: 'suppress', avoid: 'retreat',
};

export class SquadAI {
  constructor(game) {
    this.game = game;
    this.journal = [];
  }

  update(dt) {
    const game = this.game;
    for (const sq of game.squads.values()) {
      if (sq.state === 'destroyed') continue;
      const units = sq.units();
      sq.unitCount = units.length;
      if (!units.length) { if (sq.state !== 'destroyed') { sq.state = 'destroyed'; sq.stateLabel = 'уничтожен'; } continue; }
      if (sq.updateThink(dt)) this.think(sq);
      this.moveAnchor(sq, dt);
      if (sq.phase) sq.leapfrogTimer += dt;
    }
  }

  think(sq) {
    const game = this.game;
    const cfg = game.cfg.ai.squad;
    sq.thinkTimer = 0.5 + game.rng.next() * 0.3;
    const units = sq.units();
    const c = sq.centroid();
    sq.contact = units.some((u) => u.perception.hasContact);
    const hp = sq.hpRatio();
    const ammo = sq.ammoRatio();
    const morale = sq.morale();
    sq.phase = game.cfg.strategy(sq.strategyId).phases[Math.min(sq.phaseIndex, game.cfg.strategy(sq.strategyId).phases.length - 1)];

    // Отступление по стойке, потерям, морали или патронам
    const wantRetreat = sq.shouldRetreat() || hp < 0.32 || morale < 22 || (ammo < 0.03 && sq.contact);
    if (wantRetreat && sq.state !== 'retreat' && sq.state !== 'regroup') {
      const rally = this.findRally(sq);
      sq.state = 'retreat';
      sq.stateLabel = 'отступает';
      sq.behavior = 'avoid';
      sq.retreatPoint = rally;
      sq.reason = sq.losses() >= 0.3 ? `потери ${Math.round(sq.losses() * 100)}% — отход` :
        morale < 22 ? `мораль ${Math.round(morale)} — отход` :
        ammo < 0.03 ? 'нет патронов — отход' : 'отход на рубеж';
      this.log(sq, sq.reason);
      game.events.emit('squadRetreat', { squad: sq, reason: sq.reason, t: game.time });
      return;
    }

    // Перегруппировка: у рубежа, пока не восстановим мораль/патроны
    if (sq.state === 'retreat') {
      const rp = sq.retreatPoint || c;
      const atRally = dist(c.x, c.y, rp.x, rp.y) < 130;
      sq.anchor = { x: rp.x, y: rp.y };
      sq.stateLabel = 'отступление';
      if (atRally) {
        sq.state = 'regroup';
        sq.stateLabel = 'перегруппировка';
        sq.reason = 'отряд перегруппировывается у рубежа';
      }
      return;
    }
    if (sq.state === 'regroup') {
      if (morale > cfg.regroupMorale && ammo > 0.35) {
        sq.behavior = sq.objective ? 'attack' : 'hold';
        sq.state = sq.objective ? 'advance' : 'hold';
        sq.stateLabel = sq.objective ? 'возвращается к задаче' : 'держит позицию';
        sq.reason = 'мораль и патроны восстановлены';
        this.log(sq, sq.reason);
      } else {
        sq.stateLabel = 'перегруппировка';
        if (ammo < 0.35) sq.requestedSupply = true;
        return;
      }
    }

    // Цель выполнена?
    if (sq.objective?.type === 'capture' && sq.objective.pointId) {
      const pt = game.world.pointById(sq.objective.pointId);
      if (pt && pt.owner === sq.faction) {
        this.completeObjective(sq, pt);
        return;
      }
    }
    if (sq.objective?.type === 'attack' && sq.objective.targetUnitId != null) {
      const t = game.unitById(sq.objective.targetUnitId);
      if (!t || !t.alive) this.completeObjective(sq, null);
    }
    if (sq.objective && dist(c.x, c.y, sq.objective.x, sq.objective.y) < 90) {
      if (sq.objective.type === 'move' || sq.objective.type === 'retreat') {
        sq.state = 'hold';
        sq.stateLabel = 'на позиции';
        sq.reason = 'прибыл в точку приказа';
      } else if (sq.objective.type === 'hold') {
        sq.state = 'hold';
        sq.stateLabel = 'держит позицию';
      }
    }

    // Фазы алгоритма
    this.advancePhase(sq);
    const phase = sq.phase;
    sq.behavior = phase.stance === 'hold' ? 'hold' : phase.stance === 'avoid' ? 'avoid' : sq.objective ? 'attack' : 'hold';
    sq.fire = phase.fire;
    sq.formation = phase.formation;
    sq.wantLeapfrog = phase.advance > 0.15 && phase.advance < 0.95 && sq.contact;
    if (sq.wantLeapfrog) {
      sq.leapfrogTimer += 0.5;
      if (sq.leapfrogTimer > cfg.leapfrogToggleSeconds) { sq.leapfrogTimer = 0; sq.leapfrog = 1 - sq.leapfrog; }
    }

    // Позиция якоря
    if (sq.state === 'hold' && !sq.holdsAt) sq.holdsAt = { x: c.x, y: c.y };
    if (sq.state !== 'hold') sq.holdsAt = null;

    // Фланговый маневр: смещение цели вбок
    this.flankOffset(sq);

    if (sq.requestedSupply && ammo < 0.4) {
      sq.requestedSupply = false;
      if (game.autopilot.areaEnabled(sq.faction, 'supply')) game.logistics.requestSquadSupply(sq);
    }
    if (game.autopilot.areaEnabled(sq.faction, 'build') && sq.objective?.type === 'capture' && sq.state === 'hold' && sq.terrainHeld) {
      sq.terrainHeld = false;
    }
  }

  advancePhase(sq) {
    const game = this.game;
    const strategy = game.cfg.strategy(sq.strategyId);
    const phase = strategy.phases[Math.min(sq.phaseIndex, strategy.phases.length - 1)];
    if (!sq.phaseEnteredAt) sq.phaseEnteredAt = game.time;
    const until = phase.until || {};
    const c = sq.centroid();
    let next = false;
    if (until.losses != null && sq.losses() >= until.losses) next = true;
    if (until.ammo != null && sq.ammoRatio() <= until.ammo) next = true;
    if (until.contact && sq.contact) next = true;
    if (until.suppression != null && sq.contact) {
      let supp = 0;
      for (const u of sq.units()) supp += u.suppression;
      supp /= Math.max(1, sq.units().length);
      if (supp >= until.suppression) next = true;
    }
    if (until.reached && sq.objective && dist(c.x, c.y, sq.objective.x, sq.objective.y) < 110) next = true;
    if (until.regrouped && sq.state === 'regroup') next = true;
    if (next && sq.phaseIndex < strategy.phases.length - 1) {
      sq.phaseIndex++;
      sq.phaseEnteredAt = game.time;
      sq.reason = `фаза «${strategy.phases[sq.phaseIndex].id}» алгоритма «${strategy.name}»`;
      this.log(sq, sq.reason);
    }
  }

  flankOffset(sq) {
    const phase = sq.phase || { flank: 0 };
    if (!sq.objective) return;
    if (!sq.originalObjective) sq.originalObjective = { x: sq.objective.x, y: sq.objective.y };
    const base = sq.originalObjective;
    const side = sq.id % 2 === 0 ? 1 : -1;
    const width = this.game.cfg.ai.squad.flankWidth * (phase.flank || 0);
    const ang = Math.atan2(base.y - sq.anchor.y, base.x - sq.anchor.x) + Math.PI / 2;
    sq.objectiveOffset = {
      x: base.x + Math.cos(ang) * width * side,
      y: base.y + Math.sin(ang) * width * side,
    };
  }

  moveAnchor(sq, dt) {
    const game = this.game;
    const c = sq.centroid();
    let target = null;
    if (sq.state === 'retreat' || sq.state === 'regroup') target = sq.retreatPoint;
    else if (sq.state === 'hold' && sq.holdsAt) target = sq.holdsAt;
    else if (sq.objective) target = sq.objectiveOffset || sq.objective;
    if (!target) {
      sq.anchor = { x: c.x, y: c.y };
      sq.field = null;
      return;
    }
    // Якорь = цель: отряд не «ползёт» отдельным якорем, а идёт к точке общей задачей.
    sq.anchor = { x: target.x, y: target.y };
    sq.facing = angleTo(c.x, c.y, target.x, target.y);
    sq.fieldTimer = (sq.fieldTimer || 0) - dt;
    const far = !sq.fieldTarget || dist(sq.fieldTarget.x, sq.fieldTarget.y, target.x, target.y) > 120;
    if (sq.fieldTimer <= 0 || far || !sq.field) {
      sq.field = game.nav.field(target.x, target.y);
      sq.fieldTarget = { x: target.x, y: target.y };
      sq.fieldTimer = 1.5;
    }
  }

  findRally(sq) {
    const game = this.game;
    const c = sq.centroid();
    let best = null, bd = Infinity;
    for (const p of game.world.points) {
      if (p.owner !== sq.faction) continue;
      const d = dist(c.x, c.y, p.x, p.y);
      const value = d * (p.type === 'hq' ? 0.7 : p.type === 'depot' ? 0.8 : 1);
      if (value < bd) { bd = value; best = p; }
    }
    if (best) return { x: best.x + game.rng.range(-60, 60), y: best.y + game.rng.range(-60, 60) };
    return { x: c.x + (sq.faction === 0 ? -200 : 200), y: c.y };
  }

  completeObjective(sq, point) {
    const game = this.game;
    sq.objective = null;
    sq.originalObjective = null;
    sq.objectiveOffset = null;
    sq.state = 'hold';
    sq.stateLabel = 'задача выполнена';
    sq.reason = point ? `${point.name} взят — держим` : 'цель уничтожена';
    this.log(sq, sq.reason);
    if (sq.directiveId) {
      game.awardXP(sq.faction, 'infantry', 'directiveDone', 1);
      sq.directiveId = null;
    }
    if (game.autopilot.areaEnabled(sq.faction, 'build') && point) game.autopilot.onSectorSecured(sq.faction, point);
  }

  log(sq, text) {
    if (this.journal.length > 120) this.journal.shift();
    this.journal.push({ t: this.game.time, squad: sq.name, faction: sq.faction, text });
  }
}
