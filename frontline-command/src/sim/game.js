// Оркестратор: связывает мир, юнитов, ИИ, Command API, экономику и прокачку.
// Ни одна система не вызывает другую напрямую «мимо» API/шины событий для приказов.
import { RNG } from '../core/rng.js';
import { EventBus } from '../core/eventbus.js';
import { SpatialHash } from '../core/spatial.js';
import { clamp, dist, dist2, angleTo, angleDiff } from '../core/mathx.js';
import { World } from './world.js';
import { Nav } from './nav.js';
import { Unit, killUnit, applyDamage, updateTimers } from './units.js';
import { Squad, orderLabel } from './squads.js';
import { CommandAPI } from './command_api.js';
import { InfluenceSystem } from './influence.js';
import { SquadAI } from './ai_squad.js';
import { StrategicAI } from './ai_strategic.js';
import { updateSoldier } from './ai_soldier.js';
import { BuildSystem } from './build.js';
import { Walls } from './walls.js';
import { Logistics } from './logistics.js';
import { RulesEngine } from './rules.js';
import { Autopilot } from './autopilot.js';
import { Skills, techMods, xpFor } from './skills.js';

export class Game {
  constructor({ cfg, seed = 1, difficulty = 'regular', meta = null, settings = {}, aiVsAi = false, mode = 'soldier', swapSides = false }) {
    this.cfg = cfg;
    this.seed = seed;
    this.rng = new RNG(seed);
    this.aiVsAi = aiVsAi;
    this.playerFaction = aiVsAi ? null : 0;
    this.difficultyId = difficulty;
    this.difficulty = cfg.difficultyOf(difficulty);
    this.settings = Object.assign({ autopilotInSoldier: true, hints: true, colorblind: false, uiScale: 1, volume: 0.7, music: 0.5 }, settings);
    this.events = new EventBus();
    this.mode = mode; // 'soldier' | 'commander' — режим управления игрока

    this.world = new World(cfg, seed);
    // Тест симметрии: карта та же, но стороны меняются местами —
    // проверяем, что правила не дают преимущества конкретной фракции.
    if (swapSides) {
      for (const p of this.world.points) if (p.owner === 0 || p.owner === 1) { p.owner = 1 - p.owner; p.home = p.owner; }
      for (const b of this.world.buildings) if (b.owner === 0 || b.owner === 1) b.owner = 1 - b.owner;
      for (const s of this.world.sectors) if (s.owner === 0 || s.owner === 1) s.owner = 1 - s.owner;
      this.world.rebuildNav();
    }
    this.nav = new Nav(this.world, cfg);
    // Стены зданий: коллизия, пули, обзор, укрытия. Мир получает ссылку, чтобы
    // hasLOS/rebuildNav учитывали стены, не создавая цикл импортов.
    this.walls = new Walls(this);
    this.world.walls = this.walls;
    // Мир построил навигацию до появления стен — пересобираем сетку с учётом сегментов.
    this.world.rebuildNav();
    this.units = new Map();
    this.unitGrid = new SpatialHash(128, this.world.W, this.world.H);
    this.squads = new Map();
    this.nextUnitId = 1;
    this.nextSquadId = 1;
    this.time = 0;
    this.dt = 0;
    this.speed = 1;
    this.paused = false;
    this.decals = [];
    this.tracers = [];
    this.fx = [];
    this.soundQueue = [];
    this.alertLog = [];
    this.warOver = false;
    this.outcome = null;
    this.noArmySince = [null, null];
    this.tickUnits = [];
    this.focus = { x: this.world.W / 2, y: this.world.H / 2 };
    this.camera = { x: this.world.W / 2, y: this.world.H / 2, zoom: 0.5 };
    this.selectedSquads = new Set();
    this.selectedUnits = new Set();
    this.groups = {};
    this.playerUnit = null;
    this.playerDead = false;
    this.playerSpawns = 0;
    this.playerRole = 'infantry';
    this.playerWeapon = null;
    this.stats = {
      kills: [0, 0], losses: [0, 0], captures: [0, 0], deliveries: [0, 0], built: [0, 0],
    };
    this.warStats = { playerKills: 0, playerCaptures: 0, playerDeliveries: 0, playerBuilt: 0, playerHeals: 0 };
    this.meta = meta || { xp: 0, learned: [], spent: 0, warCount: 0, bestContribution: 0 };
    this.skills = new Skills(cfg, this.meta);
    this.keyCities = { 0: [], 1: [] };
    for (const p of this.world.points) if (p.type === 'city' && p.key && (p.home === 0 || p.home === 1)) this.keyCities[p.home].push(p.id);

    this.api = new CommandAPI(this);
    this.logistics = new Logistics(this);
    this.build = new BuildSystem(this);
    this.influence = new InfluenceSystem(this);
    this.autopilot = new Autopilot(this);
    this.rules = new RulesEngine(this);
    this.squadAI = new SquadAI(this);
    this.strategic = [new StrategicAI(this, 0), new StrategicAI(this, 1)];

    this.events.on('unitKilled', ({ unit, source }) => {
      this.stats.losses[unit.faction]++;
      if (source) {
        this.stats.kills[source.faction]++;
        if (source === this.playerUnit) this.warStats.playerKills++;
      }
    });
    this.events.on('pointCaptured', ({ faction }) => { this.stats.captures[faction]++; });

    this.spawnInitialArmies();
    // в режиме командира игрок не спавнит бойца: он может переключиться на солдата позже
    if (!aiVsAi && mode !== 'commander') this.startPlayer();
  }

  // ---------- базовые аксессоры ----------
  unitById(id) { return this.units.get(id) || null; }
  sectorOf(x, y) { return this.world.sectorAt(x, y); }

  modsFor(faction) {
    if (this.playerFaction != null && faction === this.playerFaction) return this.skills.mods();
    return techMods(this.techLevel(faction));
  }
  techLevel(faction) {
    const cfg = this.cfg.ai.limits;
    const lvl = Math.floor(this.time / cfg.enemyTechCurveSeconds);
    return clamp(lvl, 0, cfg.enemyTechSteps);
  }
  squadLimit(faction) {
    const cities = this.world.points.filter((p) => p.owner === faction && p.type === 'city').length;
    return this.cfg.ai.limits.squadBase + cities * this.cfg.ai.limits.squadPerCity + (this.modsFor(faction).squad_limit_add || 0);
  }
  directiveLimit(faction) {
    return this.cfg.ai.limits.directiveBase + (this.modsFor(faction).directive_limit_add || 0);
  }

  // Точность ИИ зависит от сложности (единственная разрешённая настройка сложности)
  accuracyFactor(u) {
    if (!u || u.playerControlled) return 1;
    if (this.playerFaction == null) return this.difficulty.accuracy;
    return u.faction === this.playerFaction ? 1 : this.difficulty.accuracy;
  }

  thinkInterval(u) {
    const l = this.cfg.ai.lod;
    const d = dist(u.x, u.y, this.focus.x, this.focus.y);
    let hz = d < l.nearPx ? l.nearHz : d < l.midPx ? l.midHz : l.farHz;
    hz = hz / (this.difficulty.thinkSlow || 1);
    return clamp(1 / hz, 0.1, 2.0);
  }

  // ---------- юниты ----------
  spawnUnit(faction, role, x, y, { squadId = null, player = false, spawnPoint = null } = {}) {
    const u = new Unit(this, { faction, role, x, y, squadId, player, spawnPoint });
    this.units.set(u.id, u);
    this.unitGrid.insert(u);
    this.events.emit('unitSpawned', { unit: u, t: this.time });
    return u;
  }

  unitsNear(x, y, radius) {
    return this.unitGrid.query(x, y, radius).filter((u) => u.alive);
  }
  nearbyEnemies(like, radius) {
    return this.unitGrid.query(like.x, like.y, radius).filter((u) => u.alive && u.faction !== like.faction);
  }

  templateSize(templateId) {
    const t = this.cfg.templates[templateId] || this.cfg.templates.custom;
    return Object.values(t.composition).reduce((a, b) => a + b, 0);
  }
  squadCost(templateId) {
    const t = this.cfg.templates[templateId] || this.cfg.templates.custom;
    const cost = {};
    for (const [role, n] of Object.entries(t.composition)) {
      const rc = this.cfg.unit(role).cost || {};
      for (const [k, v] of Object.entries(rc)) cost[k] = (cost[k] || 0) + v * n;
    }
    return cost;
  }
  canAffordSquad(faction, templateId) { return this.logistics.canAfford(faction, this.squadCost(templateId)); }

  // Точка спавна вне стенового кольца: юниты не рождаются в запертом дворе.
  wallRadiusOf(point) {
    const b = point && this.world.buildingAtPoint(point.id);
    const st = b ? this.walls.state(b) : null;
    return st ? (st.outline.size || 64) / 2 : 0;
  }

  // Позиция спавна: при включённых стенах — снаружи контура здания,
  // при выключенном флаге — ровно прежняя формула (сравнение «флаг off = старое поведение»).
  spawnPos(point, min, max, mode = 'polar') {
    if (this.walls && this.walls.enabled()) return this.spawnSpot(point, min, max);
    if (mode === 'box') {
      return { x: point.x + this.rng.range(-max, max), y: point.y + this.rng.range(-max, max) };
    }
    const a = this.rng.range(0, Math.PI * 2);
    const r = this.rng.range(min, max);
    return { x: point.x + Math.cos(a) * r, y: point.y + Math.sin(a) * r };
  }

  spawnSpot(point, spreadMin = 24, spreadMax = 110) {
    const base = this.wallRadiusOf(point) + 26;
    for (let i = 0; i < 30; i++) {
      const a = this.rng.range(0, Math.PI * 2);
      const r = base + this.rng.range(spreadMin, spreadMax);
      const x = point.x + Math.cos(a) * r;
      const y = point.y + Math.sin(a) * r;
      if (x < 40 || y < 40 || x > this.world.W - 40 || y > this.world.H - 40) continue;
      if (!this.world.isWalkable(x, y)) continue;
      if (this.walls && this.walls.enabled() && this.walls.blocksMove(x, y, 12)) continue;
      return { x, y };
    }
    return { x: point.x, y: point.y };
  }

  createSquadAtBase(faction, templateId, { free = false, name = null } = {}) {
    const t = this.cfg.templates[templateId] || this.cfg.templates.custom;
    const limit = this.squadLimit(faction);
    const alive = [...this.squads.values()].filter((s) => s.faction === faction && s.state !== 'destroyed' && s.count() > 0);
    if (alive.length >= limit) return { ok: false, reason: `лимит отрядов: ${alive.length}/${limit} (растёт в ветке «Командование»)` };
    const hq = this.world.hqOf(faction);
    if (!hq || hq.owner !== faction) return { ok: false, reason: 'нет своей базы' };
    const cost = this.squadCost(templateId);
    if (!free && !this.logistics.canAfford(faction, cost)) {
      return { ok: false, reason: 'не хватает ресурсов: ' + this.logistics.missing(faction, cost).join(', ') };
    }
    if (!free) this.logistics.spend(faction, cost);
    const squad = new Squad(this, { faction, templateId, name });
    this.squads.set(squad.id, squad);
    const escort = [];
    for (const [role, count] of Object.entries(t.composition)) {
      for (let i = 0; i < count; i++) {
        const spot = this.spawnPos(hq, 20, 90);
        const u = this.spawnUnit(faction, role, spot.x, spot.y, { squadId: squad.id, spawnPoint: hq.id });
        squad.addUnit(u);
        escort.push(u);
      }
    }
    squad.initialCount = squad.memberIds.size;
    squad.assignment();
    squad.anchor = squad.centroid();
    squad.reason = 'отряд сформирован на базе';
    this.events.emit('squadCreated', { squad, t: this.time });
    this.sound('squad_created', hq.x, hq.y);
    return { ok: true, squad };
  }

  createSquadFromUnits(unitIds, name = null) {
    const units = unitIds.map((id) => this.unitById(id)).filter((u) => u && u.alive && !u.squadId);
    if (units.length < 1) return { ok: false, reason: 'нет свободных бойцов' };
    const faction = units[0].faction;
    if (units.some((u) => u.faction !== faction)) return { ok: false, reason: 'бойцы разных фракций' };
    const alive = [...this.squads.values()].filter((s) => s.faction === faction && s.state !== 'destroyed' && s.count() > 0);
    if (alive.length >= this.squadLimit(faction)) return { ok: false, reason: 'достигнут лимит отрядов' };
    const squad = new Squad(this, { faction, templateId: 'custom', name });
    this.squads.set(squad.id, squad);
    for (const u of units) squad.addUnit(u);
    squad.initialCount = units.length;
    squad.assignment();
    squad.anchor = squad.centroid();
    squad.reason = 'отряд создан игроком';
    this.events.emit('squadCreated', { squad, t: this.time });
    this.sound('squad_created', squad.anchor.x, squad.anchor.y);
    return { ok: true, squad };
  }

  reinforceSquad(squad) {
    const t = this.cfg.templates[squad.templateId] || this.cfg.templates.custom;
    const hq = this.world.hqOf(squad.faction);
    if (!hq) return { ok: false, reason: 'нет базы' };
    const missing = [];
    for (const [role, count] of Object.entries(t.composition)) {
      const have = squad.units().filter((u) => u.role === role).length;
      for (let i = have; i < count; i++) missing.push(role);
    }
    if (!missing.length) return { ok: false, reason: 'отряд полон' };
    const cost = {};
    for (const role of missing) {
      const rc = this.cfg.unit(role).cost || {};
      for (const [k, v] of Object.entries(rc)) cost[k] = (cost[k] || 0) + v;
    }
    if (!this.logistics.canAfford(squad.faction, cost)) return { ok: false, reason: 'не хватает ресурсов на пополнение' };
    this.logistics.spend(squad.faction, cost);
    for (const role of missing) {
      const u = this.spawnUnit(squad.faction, role, hq.x + this.rng.range(-70, 70), hq.y + this.rng.range(-70, 70), { squadId: squad.id, spawnPoint: hq.id });
      squad.addUnit(u);
    }
    squad.initialCount = Math.max(squad.initialCount, squad.count());
    squad.reason = 'отряд пополнен с базы';
    return { ok: true, reason: `пополнение: ${missing.length}` };
  }

  disbandSquad(squad, reason = '') {
    for (const id of [...squad.memberIds]) {
      const u = this.unitById(id);
      if (u) { u.squadId = null; u.inSquad = false; u.goal = null; }
    }
    squad.memberIds.clear();
    squad.state = 'destroyed';
    squad.stateLabel = 'расформирован';
    squad.reason = reason || 'расформирован';
    this.events.emit('squadDisbanded', { squad, reason, t: this.time });
  }

  joinSquad(unit, squadId) {
    const sq = this.squads.get(squadId);
    if (!sq || sq.faction !== unit.faction) return { ok: false, reason: 'нет такого отряда' };
    if (unit.squadId) return { ok: false, reason: 'уже в отряде' };
    sq.addUnit(unit);
    unit.squadId = sq.id;
    sq.reason = 'игрок присоединился к отряду';
    return { ok: true, squad: sq };
  }

  // ---------- игрок ----------
  startPlayer() {
    const hq = this.world.hqOf(this.playerFaction) || this.world.hqOf(0);
    this.spawnPlayerAt(hq, this.playerRole, this.playerWeapon);
  }

  spawnPlayerAt(point, role = 'infantry', weaponId = null) {
    if (this.playerUnit && this.playerUnit.alive) { this.playerUnit.input = { mx: 0, my: 0, aim: 0, fire: false }; this.playerUnit = null; }
    this.playerRole = role;
    this.playerWeapon = weaponId;
    const mods = this.skills.mods();
    const unlocked = mods.unlock_weapon;
    role = role || 'infantry';
    if (role === 'sniper' && !(Array.isArray(unlocked) && unlocked.includes('sniper'))) role = 'infantry';
    const spot = this.spawnPos(point, 0, 40, 'box');
    const u = this.spawnUnit(this.playerFaction, role, spot.x, spot.y, { player: true, spawnPoint: point.id });
    u.playerControlled = true;
    u.medkits = Math.max(1, (u.def.medkit || 0) + (mods.medkit_add || 0));
    u.hp = u.maxHp = Math.round(u.maxHp * (mods.hp_mult || 1)) + (mods.hp_add || 0);
    this.playerUnit = u;
    this.playerDead = false;
    this.playerSpawns++;
    this.mode = 'soldier';
    this.focus = { x: u.x, y: u.y };
    this.camera.x !== undefined && (this.camera.x = u.x);
    this.events.emit('playerSpawned', { unit: u, t: this.time });
    return u;
  }

  onPlayerDeath(u) {
    this.playerDead = true;
    this.warStats.playerDeaths = (this.warStats.playerDeaths || 0) + 1;
    this.events.emit('playerDied', { unit: u, t: this.time });
    this.alertLog.push({ kind: 'death', text: 'Вы погибли. Прокачка сохранена.', x: u.x, y: u.y, t: this.time });
  }

  // ---------- приказы ----------
  issuePlayerOrder(type, target, { squadIds = null, params = {}, source = 'player' } = {}) {
    const ids = squadIds || [...this.selectedSquads];
    if (!ids.length) return { ok: false, reason: 'отряд не выбран' };
    const order = this.api.issue({ source, type, faction: this.playerFaction, squadIds: ids, target, params });
    return { ok: true, order };
  }

  // Контекстный ПКМ: игра сама понимает смысл по цели под курсором.
  contextOrderAt(x, y, opts = {}) {
    const ids = opts.squadIds || [...this.selectedSquads];
    if (!ids.length) return { ok: false, reason: 'сначала выдели отряд' };
    const squads = ids.map((id) => this.squads.get(id)).filter(Boolean);
    const faction = this.playerFaction;
    const nearUnit = this.unitsNear(x, y, 34).filter((u) => u.alive && !u.downed)
      .sort((a, b) => dist2(a.x, a.y, x, y) - dist2(b.x, b.y, x, y))[0];
    if (nearUnit && nearUnit.faction !== faction) {
      return { ok: true, type: 'attack', target: { x: nearUnit.x, y: nearUnit.y, unitId: nearUnit.id }, hint: 'Атаковать врага' };
    }
    const downed = this.unitsNear(x, y, 40).find((u) => u.faction === faction && u.downed);
    if (downed && squads.some((s) => s.units().some((u) => u.role === 'medic'))) {
      return { ok: true, type: 'move', target: { x: downed.x, y: downed.y }, hint: 'Медик поднимет раненого' };
    }
    const bp = this.build.blueprints.find((b) => !b.built && dist(b.x, b.y, x, y) < 60);
    if (bp && bp.faction === faction) {
      return { ok: true, type: 'build', target: { x: bp.x, y: bp.y }, params: { blueprintId: bp.id }, hint: 'Достроить объект' };
    }
    const pt = this.world.pointAt(x, y, 50);
    if (pt) {
      if (pt.owner === faction) {
        if (pt.type === 'depot' || pt.type === 'factory') {
          return { ok: true, type: 'hold', target: { x: pt.x, y: pt.y, pointId: pt.id }, hint: `Занять и охранять «${pt.name}»` };
        }
        return { ok: true, type: 'hold', target: { x: pt.x, y: pt.y, pointId: pt.id }, hint: `Занять «${pt.name}»` };
      }
      return { ok: true, type: 'capture', target: { x: pt.x, y: pt.y, pointId: pt.id }, hint: `Захватить «${pt.name}»` };
    }
    const b = this.world.buildingGrid.query(x, y, 40).find((bb) => !bb.dead && bb.built && dist(bb.x, bb.y, x, y) < 40);
    if (b && b.def?.category === 'fort') {
      if (b.faction === faction) return { ok: true, type: 'hold', target: { x: b.x, y: b.y }, hint: 'Занять укрытие' };
      return { ok: true, type: 'attack', target: { x: b.x, y: b.y }, hint: 'Атаковать укрепление' };
    }
    const sector = this.world.sectorAt(x, y);
    if (sector && sector.owner !== faction) {
      return { ok: true, type: 'capture', target: { x, y, sectorId: sector.id }, hint: `Захватить сектор «${sector.name}»` };
    }
    return { ok: true, type: 'move', target: { x, y, sectorId: sector?.id }, hint: 'Идти в точку' };
  }

  _zonePolygonAround(x, y, r) {
    const poly = [];
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2;
      poly.push({ x: x + Math.cos(a) * r, y: y + Math.sin(a) * r });
    }
    return poly;
  }

  executeCommand(order) {
    if (order.type === 'place_build') {
      // Единственный путь поставить постройку — приказ через Command API (игрок и ИИ равны)
      const res = this.build.place(order.params.buildType, order.target.x, order.target.y, order.faction, {
        pointId: order.params.pointId || null, priority: order.params.priority || 'normal', reason: order.reason,
      });
      return { accepted: !!res.ok, reason: res.reason || 'чертёж поставлен' };
    }
    if (order.type === 'build_line') {
      if (!this.cfg.flag('build_line', true)) return { accepted: false, reason: 'линии выключены флагом' };
      // Линия: точки передаются в params.from / params.to (или target + params.to)
      const from = order.params.from || { x: order.target.x, y: order.target.y };
      const to = order.params.to || from;
      const res = this.build.placeLine(order.params.buildType, from, to, order.faction, {
        priority: order.params.priority || 'normal', reason: order.reason || 'линия',
      });
      return {
        accepted: !!res.ok,
        reason: res.ok ? `линия: ${res.placed}/${res.total} секций` : (res.rejected?.[0]?.reason || 'линия не поставлена'),
        details: res,
      };
    }
    if (order.type === 'build_zone') {
      const poly = order.params.poly || this._zonePolygonAround(order.target.x, order.target.y, order.params.radius || 180);
      const res = this.build.placeZone(poly, order.params.profile || 'light', order.faction, {
        priority: order.params.priority || 'normal', pointId: order.params.pointId || null, budget: order.params.budget ?? null,
        reason: order.reason || 'зона по профилю',
      });
      return {
        accepted: !!res.ok,
        reason: res.ok ? `зона «${res.profile}»: ${res.placed}/${res.planned}` : (res.rejected?.[0]?.reason || 'зона не поставлена'),
        details: res,
      };
    }
    if (order.type === 'build_template') {
      const res = this.build.placeTemplate(order.params.template, order.target.x, order.target.y, order.faction, {
        rot: order.params.rot || 0, mirror: !!order.params.mirror, priority: order.params.priority || 'normal',
      });
      return {
        accepted: !!res.ok,
        reason: res.ok ? `шаблон: ${res.placed}/${res.total}` : (res.reason || res.rejected?.[0]?.reason || 'шаблон не поставлен'),
        details: res,
      };
    }
    if (order.type === 'set_build_priority') {
      const b = this.build.blueprints.find((bb) => bb.id === order.params.blueprintId && !bb.dead);
      if (!b) return { accepted: false, reason: 'чертёж не найден' };
      const res = this.build.setPriority(b, order.params.priority || 'normal');
      return { accepted: !!res.ok, reason: res.reason };
    }
    if (order.type === 'cancel_build') {
      const b = this.build.blueprints.find((bb) => bb.id === order.params.blueprintId && !bb.dead);
      if (!b) return { accepted: false, reason: 'чертёж не найден' };
      const res = this.build.cancel(b);
      return { accepted: !!res.ok, reason: res.reason };
    }
    if (order.type === 'demolish') {
      const b = this.world.buildingGrid.query(order.target.x, order.target.y, 48).find((bb) => !bb.dead && bb.faction === order.faction);
      if (!b) return { accepted: false, reason: 'нет постройки' };
      this.build.demolish(b);
      return { accepted: true, reason: 'постройка снесена' };
    }
    if (order.type === 'reinforce') {
      const sq = this.squads.get(order.params.squadId);
      if (!sq) return { accepted: false, reason: 'отряд не найден' };
      const res = this.reinforceSquad(sq);
      return { accepted: !!res.ok, reason: res.reason };
    }
    if (order.type === 'create_squad') {
      const res = this.createSquadAtBase(order.faction, order.params.templateId || 'custom');
      return { accepted: !!res.ok, reason: res.reason || (res.squad ? `отряд ${res.squad.name} создан` : '') };
    }
    if (order.type === 'build_profile') {
      const res = this.build.planProfile(order.params.profile || 'medium', order.target.x, order.target.y, order.faction, order.params.pointId);
      return { accepted: !!res.ok, reason: res.reason || `чертежей: ${res.placed}` };
    }
    if (order.type === 'produce') {
      this.logistics.priorities[order.faction] = order.params.priority || 'balanced';
      return { accepted: true, reason: 'приоритет производства: ' + order.params.priority };
    }
    if (order.type === 'set_autopilot') {
      this.autopilot.setArea(order.faction, order.params.area, order.params.on);
      return { accepted: true, reason: 'автопилот обновлён' };
    }
    if (order.type === 'upgrade') {
      if (order.faction !== this.playerFaction) return { accepted: false, reason: 'недоступно' };
      const res = this.skills.buy(order.params.nodeId);
      return { accepted: res.ok, reason: res.ok ? 'навык изучен' : res.reason };
    }
    return { accepted: false, reason: 'неизвестный приказ' };
  }

  // ---------- визуальные события ----------
  sound(name, x = null, y = null) {
    // Звук за стеной глуше: считаем, перекрыт ли обзор от слушателя к источнику.
    let muffle = 1;
    if (x != null && y != null && this.walls && this.walls.enabled() && this.cfg.flag('wall_sound_muffle', true)) {
      const l = this.playerUnit && this.playerUnit.alive ? this.playerUnit : this.focus;
      if (l && this.walls.blocksVision(l.x, l.y, x, y)) muffle = this.cfg.audio?.muffleFactor ?? 0.45;
    }
    this.soundQueue.push({ name, x, y, muffle });
    if (this.soundQueue.length > 48) this.soundQueue.shift();
  }
  fxAt(type, x, y, angle = 0) {
    this.fx.push({ type, x, y, angle, t: 0, life: type === 'muzzle' ? 0.07 : type === 'explosion' ? 0.55 : type === 'blood' ? 0.3 : 0.4 });
    if (this.fx.length > 260) this.fx.shift();
  }
  addTracer(x1, y1, x2, y2, unit, color = null) {
    this.tracers.push({ x1, y1, x2, y2, t: 0, life: 0.08, color: color || (unit && unit.faction === 0 ? '#ffe6a8' : '#ffb08a') });
    if (this.tracers.length > 320) this.tracers.shift();
  }
  addBloodAt(x, y) {
    if (this.rng.chance(0.5)) return;
    this.fx.push({ type: 'blood', x, y, t: 0, life: 0.5, angle: 0 });
  }
  raycastBlocked(x1, y1, x2, y2) {
    const d = dist(x1, y1, x2, y2);
    const steps = Math.ceil(d / 14);
    const skip = Math.ceil(46 / Math.max(1, d / steps));
    for (let s = skip; s <= steps; s++) {
      const t = s / steps;
      const x = x1 + (x2 - x1) * t, y = y1 + (y2 - y1) * t;
      if (x < 0 || y < 0 || x >= this.world.W || y >= this.world.H) return { x, y };
      if (this.world.solidBlock[this.world._idx(x, y)]) return { x, y };
    }
    // стены зданий проверяем точной геометрией (тонкие сегменты сетка не ловит)
    if (this.walls) {
      const hit = this.walls.bulletRay(x1, y1, x2, y2, 'rifle', this.rng);
      if (hit.blocked) return hit.hitPoint || { x: x2, y: y2 };
    }
    return null;
  }
  unitUnderAim(u) {
    let best = null, bestPerp = 22;
    for (const e of this.nearbyEnemies(u, u.weapon.range)) {
      const d = dist(u.x, u.y, e.x, e.y);
      if (d > u.weapon.range) continue;
      const a = angleTo(u.x, u.y, e.x, e.y);
      if (angleDiff(a, u.aimAngle) > 0.12) continue;
      const perp = Math.abs(Math.sin(a - u.aimAngle) * d);
      if (perp < bestPerp) { bestPerp = perp; best = e; }
    }
    return best;
  }
  applyDamageToUnit(target, amount, source, opts = {}) {
    return applyDamage(this, target, amount, source, opts);
  }
  explode(x, y, radius, damage, source = null, visualOnly = false) {
    this.fxAt('explosion', x, y);
    if (!visualOnly && this.walls) {
      // Сегменты стен рядом со взрывом получают урон: снаряд пробивает стену.
      for (const b of this.world.buildingGrid.query(x, y, radius + 24)) {
        if (b.dead || !b.built) continue;
        if (this.cfg.building(b.type)?.category === 'point') continue;
        this.walls.damageNearest(b, damage * 0.6, x, y, 'tank_cannon');
      }
    }
    this.sound(damage > 100 ? 'explosion_big' : damage > 50 ? 'explosion_mid' : 'explosion_small', x, y);
    if (visualOnly) return;
    for (const u of this.unitsNear(x, y, radius)) {
      if (!u.alive) continue;
      if (source && u.faction === source.faction) continue;
      const d = dist(x, y, u.x, u.y);
      const fall = 1 - (d / radius) * this.cfg.ai.combat.aoeDamageFalloff;
      if (fall <= 0) continue;
      applyDamage(this, u, damage * fall, source, { kind: 'aoe' });
      u.suppression = clamp(u.suppression + 0.4, 0, 1);
    }
    for (const b of this.world.buildings) {
      if (b.dead || !b.built) continue;
      const d = dist(x, y, b.x, b.y);
      if (d < radius + b.w * 0.4) this.world.damageBuilding(b, damage * 0.7, source?.faction ?? -1);
    }
  }

  // ---------- опыт и война ----------
  awardXP(faction, role, kind, amount = 1) {
    if (this.playerFaction == null) return;
    if (faction !== this.playerFaction) return;
    const xp = xpFor(this.cfg, kind, amount);
    if (xp <= 0) return;
    this.skills.xp += xp;
    this.meta.xp = this.skills.xp;
    this.warStats.xp = (this.warStats.xp || 0) + xp;
    if (kind === 'capture') this.warStats.playerCaptures++;
    if (kind === 'build') this.warStats.playerBuilt++;
    if (kind === 'deliver') this.warStats.playerDeliveries++;
    if (kind === 'heal') this.warStats.playerHeals++;
  }

  // Армия кончилась: если у фракции нет ни одного живого юнита дольше surrenderSeconds,
  // война заканчивается капитуляцией, а не тянется до горизонта симуляции.
  trackArmies() {
    const limit = this.cfg.ai.surrenderSeconds ?? 90;
    for (const f of [0, 1]) {
      let alive = 0;
      for (const u of this.units.values()) if (u.alive && u.faction === f) { alive = 1; break; }
      if (alive) { this.noArmySince[f] = null; continue; }
      if (this.noArmySince[f] == null) this.noArmySince[f] = this.time;
    }
    for (const f of [0, 1]) {
      const since = this.noArmySince[f];
      if (since != null && this.time - since >= limit) {
        this.endWar(1 - f, `Армия ${this.cfg.faction(f).name} уничтожена`);
        return;
      }
    }
  }

  checkVictory() {
    if (this.warOver) return;
    this.trackArmies();
    if (this.warOver) return;
    // Измор: после долгой войны побеждает тот, кто держит больше ключевых городов.
    if (this.cfg.flag('sudden_death', true)) {
      const limit = this.cfg.ai.capture?.suddenDeathSeconds;
      if (limit && this.time > limit) return this.resolveByPoints();
    }
    // Победа/поражение считается по домашней принадлежности штаба, а не по id точки:
    // так тест симметрии может менять стороны местами без переписывания условий.
    for (const faction of [0, 1]) {
      const hq = this.world.homeHQ(faction);
      if (hq && hq.owner !== faction && (hq.owner === 0 || hq.owner === 1)) {
        return this.endWar(1 - faction, `Штаб ${this.cfg.faction(faction).name} захвачен`);
      }
    }
    for (const faction of [0, 1]) {
      const ids = this.keyCities[faction] || [];
      if (!ids.length) continue;
      const lost = ids.every((id) => {
        const p = this.world.pointById(id);
        return p && p.owner !== faction;
      });
      if (lost) return this.endWar(1 - faction, `Все ключевые города ${this.cfg.faction(faction).name} потеряны`);
    }
  }

  resolveByPoints() {
    const score = (f) => {
      const key = (this.keyCities[f] || []).filter((id) => this.world.pointById(id)?.owner === f).length;
      const pts = this.world.points.filter((p) => p.owner === f).length;
      const units = [...this.units.values()].filter((u) => u.alive && !u.downed && u.faction === f).length;
      const power = [...this.units.values()].filter((u) => u.alive && !u.downed && u.faction === f).reduce((a, u) => a + u.power(), 0);
      return { key, pts, units, power };
    };
    const a = score(0), b = score(1);
    const better = (k) => (a[k] > b[k] ? 0 : b[k] > a[k] ? 1 : null);
    for (const k of ['key', 'pts', 'units', 'power']) {
      const w = better(k);
      if (w != null) {
        const label = { key: 'ключевых городов', pts: 'точек', units: 'живых бойцов', power: 'силы армий' }[k];
        return this.endWar(w, `Война на измор: больше ${label} (${this.cfg.faction(w).name})`);
      }
    }
    return this.endWar(0, 'Война на измор: полный паритет');
  }

  endWar(winner, reason) {
    if (this.warOver) return;
    this.warOver = true;
    this.outcome = { winner, reason, t: this.time };
    if (this.playerFaction != null) {
      this.awardXP(this.playerFaction, 'infantry', winner === this.playerFaction ? 'warWin' : 'warLoss', 1);
    }
    this.meta.warCount = (this.meta.warCount || 0) + 1;
    this.skills.warCount = this.meta.warCount;
    this.events.emit('warOver', { winner, reason, t: this.time });
    this.sound(winner === this.playerFaction ? 'alert_capture' : 'alert_loss');
  }

  nextWar(seed = this.seed + 1) {
    const meta = this.persistMeta();
    return new Game({
      cfg: this.cfg, seed, difficulty: this.difficultyId, meta, settings: this.settings,
      aiVsAi: this.aiVsAi, mode: this.aiVsAi ? 'commander' : 'soldier',
    });
  }

  persistMeta() {
    return { ...this.skills.serialize(), warCount: this.meta.warCount || 0, bestContribution: this.meta.bestContribution || 0 };
  }

  // ---------- армии ----------
  spawnInitialArmies() {
    for (const f of this.cfg.factions) {
      const faction = f.id;
      const hq = this.world.hqOf(faction);
      if (!hq) continue;
      this.createSquadAtBase(faction, 'assault', { free: true, name: 'Альфа' });
      this.createSquadAtBase(faction, 'defense', { free: true, name: 'Браво' });
      this.createSquadAtBase(faction, 'assault', { free: true, name: 'Чарли' });
      this.createSquadAtBase(faction, 'engineer', { free: true, name: 'Инженеры' });
      const tankSpot = this.spawnPos(hq, 0, 70, 'box');
      this.spawnUnit(faction, 'tank', tankSpot.x, tankSpot.y, { spawnPoint: hq.id });
      for (let i = 0; i < 2; i++) {
        const t = this.spawnPos(hq, 0, 100, 'box');
        this.spawnUnit(faction, 'truck', t.x, t.y, { spawnPoint: hq.id });
      }
    }
    // стартовые приказы: оборона своих городов
    for (const f of this.cfg.factions) {
      const squads = [...this.squads.values()].filter((s) => s.faction === f.id).slice(0, 2);
      const city = this.world.points.find((p) => p.owner === f.id && p.type === 'city');
      if (city) squads.forEach((sq) => this.api.issue({
        source: f.id === this.playerFaction ? 'autopilot' : 'enemyAI', type: 'hold', faction: f.id,
        squadIds: [sq.id], target: { x: city.x, y: city.y, pointId: city.id }, reason: 'стартовая оборона',
      }));
    }
  }

  // ---------- главный цикл ----------
  step(realDt) {
    if (this.paused || this.warOver) return;
    const dt = Math.min(0.1, realDt) * this.speed;
    if (dt <= 0) return;
    this.deltaAcc = (this.deltaAcc || 0) + dt;
    this.dt = dt;
    this.time += dt;
    this.nav.advance();

    this.unitGrid.clear();
    for (const u of this.units.values()) if (u.alive) this.unitGrid.insert(u);

    // Порядок обхода юнитов чередуется по тикам: тот, кто обновляется первым, стреляет
    // первым и получает преимущество первого хода. Чередование убирает перекос в пользу
    // фракции, чьи юниты созданы раньше (обычно это игрок/Альянс).
    // Порядок обхода юнитов перемешивается каждый тик: кто обновляется первым, тот стреляет
    // первым. Фиксированный порядок (по порядку создания) давал системное преимущество
    // первой фракции — в чистой дуэли 10 зеркальных отрядов она выигрывала 9 раз из 12.
    this.tickUnits.length = 0;
    for (const u of this.units.values()) if (u.alive) this.tickUnits.push(u);
    for (let k = this.tickUnits.length - 1; k > 0; k--) {
      const j = this.rng.int(k + 1);
      const tmp = this.tickUnits[k];
      this.tickUnits[k] = this.tickUnits[j];
      this.tickUnits[j] = tmp;
    }
    for (let k = 0; k < this.tickUnits.length; k++) {
      const u = this.tickUnits[k];
      if (!u.alive || u.role === 'truck') continue;
      updateSoldier(this, u, dt);
    }

    this.squadAI.update(dt);
    for (const ai of this.strategic) ai.update(dt);
    this.autopilot.update(dt);
    this.rules.update(dt);
    this.logistics.update(dt);
    this.build.update(dt);
    this.walls.update(dt);
    this.influence.update(dt);
    this.api.update();
    this.cleanup(dt);
    this.checkVictory();
    this.updateFocus();
  }

  updateFocus() {
    if (this.playerUnit && this.playerUnit.alive) { this.focus = { x: this.playerUnit.x, y: this.playerUnit.y }; return; }
    if (this.selectedSquads.size) {
      const sq = this.squads.get([...this.selectedSquads][0]);
      if (sq) { const c = sq.centroid(); this.focus = c; return; }
    }
    this.focus = { x: this.camera.x, y: this.camera.y };
  }

  cleanup(dt) {
    for (const [id, u] of this.units) {
      if (!u.alive) {
        u.deadTimer += dt;
        if (u.deadTimer > 12 && u !== this.playerUnit) this.units.delete(id);
      }
    }
    for (const [id, sq] of this.squads) {
      if (sq.state === 'destroyed' && this.time - sq.createdAt > 120) this.squads.delete(id);
    }
    for (let i = this.tracers.length - 1; i >= 0; i--) {
      const t = this.tracers[i];
      t.t += dt;
      if (t.t >= t.life) this.tracers.splice(i, 1);
    }
    for (let i = this.fx.length - 1; i >= 0; i--) {
      const f = this.fx[i];
      f.t += dt;
      if (f.t >= f.life) this.fx.splice(i, 1);
    }
    if (this.alertLog.length > 60) this.alertLog.splice(0, this.alertLog.length - 60);
    for (const b of this.world.buildings) if (b.dead) b.hp = 0;
    if (this.logistics.requests.length > 40) this.logistics.requests.splice(0, this.logistics.requests.length - 40);
    for (const f of this.cfg.factions) {
      const faction = f.id;
      this.stats.deliveries[faction] = this.logistics.delivered[faction];
    }
  }

  drainSounds() {
    const q = this.soundQueue;
    this.soundQueue = [];
    return q;
  }

  // Снимок для UI/рендера (без тяжёлых структур)
  snapshot() {
    return {
      time: this.time, warOver: this.warOver, outcome: this.outcome,
      units: this.units.size, squads: this.squads.size,
    };
  }
}
