// Отряд: состав, стойки, формации, приём приказов и отказ с причиной.
import { clamp, dist, angleTo, TAU, normAngle } from '../core/mathx.js';

const NAMES = ['Альфа', 'Браво', 'Чарли', 'Дельта', 'Эхо', 'Фокстрот', 'Гольф', 'Хотэл', 'Индия', 'Джульет', 'Кило', 'Лима', 'Майк', 'Ноябрь', 'Оскар', 'Папа', 'Квебек', 'Ромео', 'Сьерра', 'Танго'];

export class Squad {
  constructor(game, { faction, templateId = 'custom', name = null, id = null }) {
    this.game = game;
    this.id = id != null ? id : game.nextSquadId++;
    this.faction = faction;
    this.templateId = templateId;
    this.template = game.cfg.templates[templateId] || game.cfg.templates.custom;
    this.name = name || `${NAMES[(this.id - 1) % NAMES.length]}`;
    this.memberIds = new Set();
    this.commanderId = null;
    this.behavior = 'attack';
    this.fire = 'free';
    this.formation = 'wedge';
    this.retreatTier = '50';
    this.strategyId = 'cautious';
    this.phaseIndex = 0;
    this.state = 'forming';
    this.stateLabel = 'собирается';
    this.objective = null;
    this.order = null;
    this.queue = [];
    this.reason = 'сформирован на базе';
    this.anchor = { x: 0, y: 0 };
    this.facing = 0;
    this.initialCount = 0;
    this.stats = { kills: 0, losses: 0, shotsFired: 0, shotsHit: 0, delivered: 0, built: 0, ordersOk: 0, ordersRefused: 0 };
    this.createdAt = game.time;
    this.lastOrderAt = -99;
    this.autoResupply = true;
    this.rallyPoint = null;
    this.patrol = null;
    this.patrolIndex = 0;
    this.leapfrog = 0;
    this.thinkTimer = game.rng.range(0, 0.5);
    this.directiveId = null;
    this.supplyTimer = 0;
    this.targetId = null;
    this.unitCount = 0;
    this.requestedSupply = false;
    this.leapfrog = 0;
    this.leapfrogTimer = 0;
    this.phaseEnteredAt = 0;
    this.contact = false;
    this.holdsAt = null;
  }

  // Перекаты: половина отряда стреляет, половина двигается.
  leapfrogHold(index) {
    if (!this.wantLeapfrog) return false;
    return index % 2 === this.leapfrog;
  }

  units(game = this.game) {
    const out = [];
    for (const id of this.memberIds) {
      const u = game.unitById(id);
      if (u && u.alive && !u.downed) out.push(u);
    }
    return out;
  }
  allUnits(game = this.game) {
    const out = [];
    for (const id of this.memberIds) {
      const u = game.unitById(id);
      if (u && u.alive) out.push(u);
    }
    return out;
  }
  get commander() { return this.commanderId != null ? this.game.unitById(this.commanderId) : null; }

  addUnit(u) {
    this.memberIds.add(u.id);
    u.squadId = this.id;
    u.inSquad = true;
    this.initialCount = Math.max(this.initialCount, this.memberIds.size);
    if (this.commanderId == null || !this.commander || this.commander.downed || !this.commander.alive) this.commanderId = u.id;
    this.assignment();
  }
  removeUnit(u) {
    this.memberIds.delete(u.id);
    if (this.commanderId === u.id) this.pickCommander();
  }
  pickCommander() {
    const units = this.units();
    this.commanderId = units.length ? units[0].id : null;
    if (this.commander) this.reason = `командир — ${this.commander.roleName || this.commander.def.name}`;
  }
  count() { return this.units().length; }
  morale() {
    const units = this.units();
    if (!units.length) return 0;
    let s = 0;
    for (const u of units) s += u.morale;
    return s / units.length;
  }
  hpRatio() {
    const units = this.units();
    if (!units.length) return 0;
    let hp = 0, max = 0;
    for (const u of units) { hp += u.hp; max += u.maxHp; }
    return hp / max;
  }
  ammoRatio() {
    const units = this.units();
    if (!units.length) return 0;
    let s = 0;
    for (const u of units) s += u.ammoRatio();
    return s / units.length;
  }
  losses() {
    if (!this.initialCount) return 0;
    return clamp(this.stats.losses / this.initialCount, 0, 1);
  }
  strength() {
    let s = 0;
    for (const u of this.units()) s += u.power();
    return s;
  }
  centroid() {
    const units = this.units();
    if (!units.length) return { x: this.anchor.x, y: this.anchor.y };
    let x = 0, y = 0;
    for (const u of units) { x += u.x; y += u.y; }
    return { x: x / units.length, y: y / units.length };
  }
  onDeath(u) {
    this.stats.losses++;
    if (this.commanderId === u.id) this.pickCommander();
    const live = this.units();
    if (!live.length) {
      this.state = 'destroyed';
      this.stateLabel = 'уничтожен';
      this.reason = 'все бойцы погибли';
      this.game.events.emit('squadDestroyed', { squad: this, t: this.game.time });
    } else {
      // мораль падает у всех, кто рядом
      for (const o of live) {
        if (dist(o.x, o.y, u.x, u.y) < 220) o.morale = clamp(o.morale + this.game.cfg.ai.morale.allyDeath, 0, 100);
      }
    }
  }
  onCasualty(u) {
    for (const o of this.units()) {
      if (dist(o.x, o.y, u.x, u.y) < 200) o.morale = clamp(o.morale + this.game.cfg.ai.morale.allyDeath * 0.5, 0, 100);
    }
  }

  assignment() {
    const units = this.units();
    units.forEach((u, i) => { u.formationIndex = i; });
    this.unitCount = units.length;
  }

  // Слот в формации относительно якоря отряда.
  slotFor(index, count, cx, cy, facing, spacing) {
    const f = this.formation;
    const alongX = Math.cos(facing), alongY = Math.sin(facing);
    const perpX = -alongY, perpY = alongX;
    let ox = 0, oy = 0;
    if (f === 'column') {
      const k = index;
      ox = -alongX * spacing * k;
      oy = -alongY * spacing * k;
    } else if (f === 'line') {
      const k = index - (count - 1) / 2;
      ox = perpX * spacing * k;
      oy = perpY * spacing * k;
    } else if (f === 'wedge') {
      if (index === 0) { ox = 0; oy = 0; }
      else {
        const rank = Math.ceil(index / 2);
        const side = index % 2 === 1 ? 1 : -1;
        ox = perpX * spacing * rank * side - alongX * spacing * rank * 0.55;
        oy = perpY * spacing * rank * side - alongY * spacing * rank * 0.55;
      }
    } else {
      const a = (index / Math.max(1, count)) * TAU + this.id;
      const r = spacing * (0.7 + ((index * 37) % 10) / 20);
      ox = Math.cos(a) * r; oy = Math.sin(a) * r;
    }
    return { x: cx + ox, y: cy + oy };
  }

  setStance(key, value) {
    if (key === 'behavior') this.behavior = value;
    else if (key === 'fire') this.fire = value;
    else if (key === 'formation') this.formation = value;
    else if (key === 'retreat') this.retreatTier = value;
    this.reason = 'смена стойки: ' + key + ' = ' + value;
    this.game.events.emit('stanceChanged', { squad: this, key, value, t: this.game.time });
  }

  shouldRetreat() {
    if (this.retreatTier === 'never') return false;
    if (this.retreatTier === 'ammo') return this.ammoRatio() < 0.15;
    const limit = this.retreatTier === '30' ? 0.3 : 0.5;
    return this.losses() >= limit;
  }

  receiveOrder(order, api) {
    const game = this.game;
    const units = this.units();
    if (!units.length) return { accepted: false, reason: 'нет живых бойцов' };
    if (order.type === 'disband') {
      game.disbandSquad(this, 'приказ');
      return { accepted: true, reason: '' };
    }
    if (order.type === 'stance') {
      for (const [k, v] of Object.entries(order.params || {})) this.setStance(k, v);
      return { accepted: true, reason: 'стойка изменена' };
    }
    if (order.type === 'resupply') {
      const depot = game.world.nearestPoint(this.centroid().x, this.centroid().y, (p) => ['depot', 'hq', 'factory'].includes(p.type) && p.owner === this.faction && p.hp > 0);
      if (!depot) return { accepted: false, reason: 'нет своего склада' };
      this.objective = { x: depot.x, y: depot.y, pointId: depot.id, type: 'resupply' };
      this.retreatPoint = { x: depot.x, y: depot.y };
      this.state = 'regroup'; this.stateLabel = 'за снабжением';
      this.reason = 'запрошено снабжение → ближайший склад';
      return { accepted: true, reason: 'идём за снабжением' };
    }
    const morale = this.morale();
    if (morale < 40 && order.type !== 'retreat' && order.type !== 'hold') {
      const chance = 1 - morale / 100;
      if (game.rng.chance(chance)) {
        this.stats.ordersRefused++;
        const reason = `мораль ${Math.round(morale)}: отказались выполнять`;
        this.reason = reason;
        return { accepted: false, reason };
      }
    }
    if ((order.type === 'attack' || order.type === 'capture') && this.ammoRatio() < 0.05) {
      this.stats.ordersRefused++;
      const reason = 'нет боеприпасов';
      this.reason = reason;
      return { accepted: false, reason };
    }
    if (this.state === 'retreat' && (order.type === 'attack' || order.type === 'capture') && this.hpRatio() < 0.5) {
      this.stats.ordersRefused++;
      const reason = 'отряд отступает и не готов атаковать';
      this.reason = reason;
      return { accepted: false, reason };
    }
    this.order = order;
    this.lastOrderAt = game.time;
    this.originalObjective = null;
    this.objectiveOffset = null;
    this.phaseIndex = 0;
    this.phaseEnteredAt = game.time;
    this.addObjectiveFromOrder(order);
    this.stats.ordersOk++;
    this.reason = order.reason || `приказ: ${orderLabel(order.type)}`;
    return { accepted: true, reason: '' };
  }

  addObjectiveFromOrder(order) {
    const p = order.params || {};
    let x = order.target?.x, y = order.target?.y;
    let pointId = order.target?.pointId || null;
    let sectorId = order.target?.sectorId ?? null;
    const world = this.game.world;
    if (pointId) { const pt = world.pointById(pointId); if (pt) { x = pt.x; y = pt.y; } }
    if ((x == null || y == null) && sectorId != null) { const s = world.sectorById(sectorId); if (s) { x = s.cx; y = s.cy; } }
    if (x == null || y == null) { const c = this.centroid(); x = c.x; y = c.y; }
    switch (order.type) {
      case 'move':
        this.objective = { x, y, pointId, sectorId, type: 'move' };
        this.state = 'advance'; this.stateLabel = 'выдвигается';
        break;
      case 'attack':
        this.objective = { x, y, pointId, sectorId, targetUnitId: order.target?.unitId ?? null, type: 'attack' };
        this.behavior = 'attack'; this.state = 'advance'; this.stateLabel = 'атакует';
        break;
      case 'capture':
        this.objective = { x, y, pointId, sectorId, type: 'capture' };
        this.behavior = 'attack'; this.state = 'advance'; this.stateLabel = 'захват';
        break;
      case 'hold':
        this.objective = { x, y, pointId, sectorId, type: 'hold' };
        this.behavior = 'hold'; this.state = 'hold'; this.stateLabel = 'держит позицию';
        break;
      case 'retreat':
        this.objective = { x, y, pointId, sectorId, type: 'retreat' };
        this.behavior = 'avoid'; this.state = 'retreat'; this.stateLabel = 'отходит';
        this.rallyPoint = { x, y };
        break;
      case 'patrol':
        this.objective = { x, y, pointId, sectorId, type: 'patrol' };
        this.patrol = p.waypoints || [{ x, y }];
        this.patrolIndex = 0;
        this.state = 'advance'; this.stateLabel = 'патруль';
        break;
      case 'escort':
        this.objective = { x, y, pointId, sectorId, type: 'escort', escortUnitId: p.unitId };
        this.state = 'advance'; this.stateLabel = 'сопровождение';
        break;
      case 'directive':
        this.objective = { x, y, pointId, sectorId, type: p.goalType || 'capture' };
        this.strategyId = p.strategy || 'cautious';
        this.phaseIndex = 0;
        // директива «удерживать» — это пост, его можно переназначить; «захватить» держит id до выполнения
        this.directiveId = (p.goalType === 'capture') ? order.id : null;
        this.state = 'advance'; this.stateLabel = 'директива';
        if (p.after === 'hold') this.behavior = 'hold';
        break;
      case 'build':
        this.objective = { x, y, pointId, sectorId, type: 'build', blueprintId: p.blueprintId };
        this.state = 'advance'; this.stateLabel = 'стройка';
        break;
      default:
        this.objective = { x, y, pointId, sectorId, type: 'move' };
    }
  }

  updateThink(dt) {
    this.thinkTimer -= dt;
    return this.thinkTimer <= 0;
  }
}

export function orderLabel(type) {
  return {
    move: 'идти', attack: 'атаковать', capture: 'захватить', hold: 'удерживать',
    retreat: 'отступить', patrol: 'патруль', escort: 'сопровождать', build: 'строить',
    repair: 'чинить', resupply: 'снабдить', supply: 'снабдить', create_squad: 'создать отряд',
    disband: 'расформировать', stance: 'сменить стойку', directive: 'директива',
  }[type] || type;
}
