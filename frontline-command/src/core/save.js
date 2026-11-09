// Сохранение и загрузка: настройки, мета-прогресс (дерево навыков) и полное состояние войны.
// В браузере роль user:// выполняет localStorage; формат совместим с save.json из ТЗ.
import { Squad } from '../sim/squads.js';
const KEY_SETTINGS = 'frontline.settings.v1';
const KEY_META = 'frontline.meta.v1';
const KEY_WAR = 'frontline.war.v1';

const read = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    console.warn('сохранение повреждено, берём значение по умолчанию', key, e);
    return fallback;
  }
};
const write = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    console.warn('не удалось сохранить', key, e);
    return false;
  }
};

// Часть состояния отрядов, не входящая в формат v1. Ссылки на бойцов
// восстанавливаются только после пересоздания состава и проверки ID.
const squadNumbers = ['facing', 'thinkTimer', 'lastOrderAt', 'createdAt', 'supplyTimer',
  'leapfrogTimer', 'phaseEnteredAt'];
const squadBooleans = ['autoResupply', 'requestedSupply', 'contact', 'wantLeapfrog'];
const squadStatKeys = ['kills', 'losses', 'shotsFired', 'shotsHit', 'delivered', 'built', 'ordersOk', 'ordersRefused'];
function saveSquads(game) {
  return [...game.squads.values()].filter((s) => s.state !== 'destroyed').map((s) => ({
    id: s.id, commanderId: s.commanderId, initialCount: s.initialCount,
    retreatTier: s.retreatTier, phaseIndex: s.phaseIndex, phaseId: s.phase?.id ?? null,
    leapfrog: s.leapfrog, stats: { ...s.stats },
    ...Object.fromEntries(squadNumbers.map((key) => [key, s[key]])),
    ...Object.fromEntries(squadBooleans.map((key) => [key, s[key]])),
  }));
}
function restoreSquads(game, states, restoreIds) {
  if (!Array.isArray(states)) return;
  const seen = new Set();
  for (const state of states) {
    if (!state || !Number.isSafeInteger(state.id) || seen.has(state.id)) continue;
    seen.add(state.id);
    const squad = game.squads.get(state.id);
    if (!squad) continue;
    if (restoreIds && Number.isSafeInteger(state.commanderId) && squad.memberIds.has(state.commanderId)) {
      const commander = game.unitById(state.commanderId);
      if (commander?.alive && !commander.downed && commander.faction === squad.faction) squad.commanderId = state.commanderId;
    }
    if (Number.isSafeInteger(state.initialCount) && state.initialCount >= squad.memberIds.size) squad.initialCount = state.initialCount;
    if (['never', 'ammo', '30', '50'].includes(state.retreatTier)) squad.retreatTier = state.retreatTier;
    const phases = game.cfg.strategy(squad.strategyId)?.phases;
    if (Array.isArray(phases) && Number.isSafeInteger(state.phaseIndex) && state.phaseIndex >= 0 && state.phaseIndex < phases.length) squad.phaseIndex = state.phaseIndex;
    if (Array.isArray(phases) && typeof state.phaseId === 'string') {
      const phase = phases.find((p) => p.id === state.phaseId);
      if (phase) squad.phase = phase;
    }
    if (state.leapfrog === 0 || state.leapfrog === 1) squad.leapfrog = state.leapfrog;
    for (const key of squadNumbers) if (Number.isFinite(state[key])) squad[key] = state[key];
    for (const key of squadBooleans) if (typeof state[key] === 'boolean') squad[key] = state[key];
    if (state.stats && typeof state.stats === 'object' && !Array.isArray(state.stats)) {
      for (const key of squadStatKeys) if (Number.isSafeInteger(state.stats[key]) && state.stats[key] >= 0) squad.stats[key] = state.stats[key];
    }
  }
}

// Запросы могут встречаться в очереди и одновременно в нескольких задачах.
// Сохраняем ссылки как индексы, а не независимые копии: unloadTruck удаляет
// заявку по идентичности объекта. Сам объект точки не сериализуется (в нём
// есть циклические ссылки на постройку).
function saveTransport(game) {
  const logistics = game.logistics;
  const requests = [], ids = new Map();
  const requestId = (r) => {
    if (!r || typeof r !== 'object') return null;
    if (!ids.has(r)) { ids.set(r, requests.length); requests.push({ ...r }); }
    return ids.get(r);
  };
  const queue = logistics.requests.map(requestId);
  const trucks = [...game.units.values()].filter((u) => u.alive && u.role === 'truck').map((u) => {
    const t = u.truckTask;
    return {
      id: u.id, cargo: u.cargo, cargoType: u.cargoType,
      goal: u.goal ? { x: u.goal.x, y: u.goal.y } : null,
      arrived: !!u.arrived, pathFailed: !!u.pathFailed,
      task: t ? { state: t.state, request: requestId(t.request), source: t.source?.id ?? null, amount: t.amount ?? 0 } : null,
    };
  });
  return {
    version: 1, requests, queue, trucks,
    sectorSupply: logistics.sectorSupply.map((map) => [...map]),
    productionAcc: logistics.productionAcc, supplyAcc: logistics.supplyAcc,
    requestAcc: logistics.requestAcc, resupplyAcc: logistics.resupplyAcc,
    alertCooldown: [...logistics.alertCooldown], priorities: [...logistics.priorities],
    delivered: [...logistics.delivered], lastTank: logistics.lastTank ? [...logistics.lastTank] : null,
  };
}

function restoreTransport(game, data) {
  if (!data || data.version !== 1 || !Array.isArray(data.requests) ||
      !Array.isArray(data.queue) || !Array.isArray(data.trucks)) return;
  const logistics = game.logistics;
  if (Array.isArray(data.sectorSupply) && data.sectorSupply.length === logistics.sectorSupply.length) {
    data.sectorSupply.forEach((entries, faction) => {
      if (!Array.isArray(entries)) return;
      const ids = new Set();
      const valid = entries.every((entry) => {
        if (!Array.isArray(entry) || entry.length !== 2 || !Number.isSafeInteger(entry[0]) || !game.world.sectorById(entry[0]) ||
            ids.has(entry[0]) || !Number.isFinite(entry[1]) || entry[1] < 0 || entry[1] > 1) return false;
        ids.add(entry[0]);
        return true;
      });
      if (valid) logistics.sectorSupply[faction] = new Map(entries);
    });
  }
  for (const name of ['productionAcc', 'supplyAcc', 'requestAcc', 'resupplyAcc']) {
    if (Number.isFinite(data[name]) && data[name] >= 0) logistics[name] = data[name];
  }
  for (const name of ['alertCooldown', 'delivered', 'lastTank']) {
    if (Array.isArray(data[name]) && data[name].length === game.cfg.factions.length &&
        data[name].every((n) => Number.isFinite(n) && n >= 0)) logistics[name] = [...data[name]];
  }
  if (Array.isArray(data.priorities) && data.priorities.length === game.cfg.factions.length &&
      data.priorities.every((p) => typeof p === 'string')) logistics.priorities = [...data.priorities];
  const requests = data.requests.map((r) => {
    if (!r || !game.cfg.factions.some((f) => f.id === r.faction) ||
        !['sector', 'squad'].includes(r.kind) || !Number.isFinite(r.x) || !Number.isFinite(r.y) ||
        !Number.isFinite(r.created) || !Number.isFinite(r.priority)) return null;
    return { ...r };
  });
  const requestAt = (id) => Number.isInteger(id) && id >= 0 && id < requests.length ? requests[id] : null;
  game.logistics.requests = data.queue.map(requestAt).filter(Boolean);
  const seen = new Set();
  for (const saved of data.trucks) {
    if (!saved || seen.has(saved.id)) continue;
    seen.add(saved.id);
    const truck = game.unitById(saved.id);
    if (!truck || truck.role !== 'truck') continue;
    if (Number.isFinite(saved.cargo) && saved.cargo >= 0) truck.cargo = saved.cargo;
    if (saved.cargoType == null || typeof saved.cargoType === 'string') truck.cargoType = saved.cargoType;
    if (saved.goal === null) truck.goal = null;
    else if (Number.isFinite(saved.goal?.x) && Number.isFinite(saved.goal?.y)) truck.goal = { x: saved.goal.x, y: saved.goal.y };
    if (typeof saved.arrived === 'boolean') truck.arrived = saved.arrived;
    if (typeof saved.pathFailed === 'boolean') truck.pathFailed = saved.pathFailed;
    const t = saved.task;
    if (!t) { truck.truckTask = null; continue; }
    if (t.state === 'idle' || t.state === 'idleTruck') { truck.truckTask = { state: t.state }; continue; }
    const request = requestAt(t.request), source = game.world.pointById(t.source);
    if (['toSource', 'toTarget'].includes(t.state) && request && request.faction === truck.faction && source &&
        Number.isFinite(t.amount) && t.amount >= 0) {
      truck.truckTask = { state: t.state, request, source, amount: t.amount };
    } else {
      // Не отдаём машину с грузом автоматически новой заявке: это могло бы
      // перезаписать груз. Повреждённый рейс явно остаётся на стоянке.
      truck.truckTask = { state: 'idleTruck' };
      truck.goal = null;
      console.warn(`сохранение: повреждён рейс грузовика ${truck.id}, груз оставлен на стоянке`);
    }
  }
}

// Незавершённые постройки восстанавливаем без повторного вызова place():
// материалы за них уже списаны. ID пересозданных зданий отличаются от старых.
function saveBlueprints(game) {
  return (game.build.blueprints || []).filter((b) => !b.dead && !b.built).map((b) => ({
    id: b.id, type: b.type, faction: b.faction, x: b.x, y: b.y, pointId: b.pointId,
    progress: b.progress, hp: b.hp, maxHp: b.maxHp, priority: b.priority, createdAt: b.createdAt,
    reason: b.reason, dir: b.dir, paused: b.paused, pauseReason: b.pauseReason, stall: b.stall,
    builders: b.builders, buildersIds: b.buildersIds,
  }));
}
function restoreBlueprints(game, saved, validUnitIds) {
  const map = new Map();
  if (!Array.isArray(saved)) return map;
  const counts = new Map();
  for (const b of saved) if (Number.isSafeInteger(b?.id) && b.id > 0) counts.set(b.id, (counts.get(b.id) || 0) + 1);
  game.build.blueprints = [];
  for (const b of saved) {
    const def = b && typeof b.type === 'string' && Object.hasOwn(game.cfg.buildings, b.type) ? game.cfg.buildings[b.type] : null;
    const valid = b && Number.isSafeInteger(b.id) && b.id > 0 && counts.get(b.id) === 1 && def &&
      game.cfg.factions.some((f) => f.id === b.faction) && Number.isFinite(b.x) && b.x >= 0 && b.x < game.world.W &&
      Number.isFinite(b.y) && b.y >= 0 && b.y < game.world.H &&
      (b.pointId == null || !!game.world.pointById(b.pointId)) &&
      Number.isFinite(b.progress) && b.progress >= 0 && b.progress < 1 &&
      Number.isFinite(b.maxHp) && b.maxHp > 0 && Number.isFinite(b.hp) && b.hp >= 0 && b.hp <= b.maxHp;
    if (!valid) { console.warn('сохранение: повреждённый чертёж пропущен'); continue; }
    const restored = game.world.addBuilding({ type: b.type, faction: b.faction, x: b.x, y: b.y,
      pointId: b.pointId ?? null, blueprint: true, progress: b.progress });
    restored.hp = b.hp; restored.maxHp = b.maxHp;
    if (Number.isInteger(b.priority) && b.priority >= 0 && b.priority <= 2) restored.priority = b.priority;
    if (Number.isFinite(b.createdAt)) restored.createdAt = b.createdAt;
    for (const key of ['reason', 'pauseReason', 'stall']) {
      if (typeof b[key] === 'string' || b[key] === null) restored[key] = b[key];
    }
    if (b.dir === 'h' || b.dir === 'v') restored.dir = b.dir;
    if (typeof b.paused === 'boolean') restored.paused = b.paused;
    if (Number.isInteger(b.builders) && b.builders >= 0) restored.builders = b.builders;
    if (validUnitIds && Array.isArray(b.buildersIds) && b.buildersIds.every((id) => Number.isSafeInteger(id) && id > 0)) {
      restored.buildersIds = b.buildersIds.filter((id) => validUnitIds.has(id));
    }
    game.build.blueprints.push(restored);
    map.set(b.id, restored.id);
  }
  return map;
}

export const Save = {
  settings: {
    volume: 0.7,
    music: 0.4,
    uiScale: 1,
    colorblind: false,
    showHints: true,
    autosave: true,
  },
  meta: { xp: 0, learned: [], spent: 0, warCount: 0, bestContribution: 0 },

  loadSettings() {
    this.settings = Object.assign({}, this.settings, read(KEY_SETTINGS, {}));
    return this.settings;
  },
  saveSettings(partial = {}) {
    Object.assign(this.settings, partial);
    write(KEY_SETTINGS, this.settings);
    return this.settings;
  },

  loadMeta() {
    this.meta = Object.assign({}, this.meta, read(KEY_META, {}));
    return this.meta;
  },
  saveMeta(meta) {
    this.meta = meta || this.meta;
    write(KEY_META, this.meta);
    return this.meta;
  },
  resetMeta() {
    this.meta = { xp: 0, learned: [], spent: 0, warCount: 0, bestContribution: 0 };
    write(KEY_META, this.meta);
    return this.meta;
  },

  // Полное состояние войны: только данные, без ссылок на объекты классов.
  saveWar(game) {
    if (!game || game.warOver) return false;
    const squads = [...game.squads.values()].filter((s) => s.state !== 'destroyed').map((s) => ({
      id: s.id, faction: s.faction, templateId: s.templateId, name: s.name,
      memberIds: [...s.memberIds], state: s.state, objective: s.objective,
      holdsAt: s.holdsAt, anchor: s.anchor, strategyId: s.strategyId,
      behavior: s.behavior, fire: s.fire, formation: s.formation,
      directiveId: s.directiveId, retreatPoint: s.retreatPoint,
    }));
    const units = [...game.units.values()].filter((u) => u.alive).map((u) => ({
      id: u.id, faction: u.faction, role: u.role, x: Math.round(u.x), y: Math.round(u.y),
      hp: Math.round(u.hp), morale: Math.round(u.morale), squadId: u.squadId,
      mag: u.mag, reserve: u.reserve, facing: +u.facing.toFixed(3), downed: !!u.downed,
    }));
    const payload = {
      version: 1,
      savedAt: Date.now(),
      seed: game.seed,
      time: +game.time.toFixed(1),
      difficultyId: game.difficultyId,
      mode: game.mode,
      aiVsAi: game.aiVsAi,
      settings: game.settings,
      meta: game.meta,
      stats: game.stats,
      points: game.world.points.map((p) => ({ id: p.id, owner: p.owner, hp: Math.round(p.hp), capture: +p.capture.toFixed(2) })),
      sectors: game.world.sectors.map((s) => ({ id: s.id, owner: s.owner, influence: +s.influence.toFixed(3) })),
      buildings: game.world.buildings.filter((b) => !b.dead && b.built).map((b) => ({
        type: b.type, faction: b.faction, x: b.x, y: b.y, hp: Math.round(b.hp), pointId: b.pointId || null,
      })),
      // Стены v2: HP сегментов, проломы и состояние дверей. Старые сейвы блока не имеют.
      walls: game.walls && game.walls.enabled() ? game.walls.serialize() : null,
      blueprints: (game.build.blueprints || []).filter((b) => !b.built).map((b) => ({
        type: b.type, faction: b.faction, x: b.x, y: b.y, pointId: b.pointId || null,
      })),
      stock: game.logistics.stock,
      squads, units,
    };
    // Расширение необязательно: старый формат и ветка с выключенным флагом не меняются.
    if (game.cfg.flag('alg_save', false)) {
      payload.saveExt = {
        version: 1,
        rngState: game.rng.s,
        nextUnitId: game.nextUnitId,
        nextSquadId: game.nextSquadId,
        playerUnitId: game.playerUnit && game.playerUnit.alive ? game.playerUnit.id : null,
        playerDead: game.playerDead,
        playerRole: game.playerRole,
        playerWeapon: game.playerWeapon,
        playerControlled: !!game.playerUnit?.playerControlled,
        exactTime: game.time,
        transport: saveTransport(game),
        blueprints: saveBlueprints(game),
        squads: saveSquads(game),
        api: {
          orders: game.api.orders.filter((order) => order.status === 'queued'),
          nextId: game.api.nextId, seq: game.api.seq,
          stats: game.api.stats, journal: game.api.journal,
        },
        units: [...game.units.values()].filter((u) => u.alive).map((u) => ({
          id: u.id, x: u.x, y: u.y, hp: u.hp, morale: u.morale, facing: u.facing,
          bleed: u.bleed, cool: u.cool, reloadT: u.reloadT, reloading: u.reloading,
          suppression: u.suppression,
        })),
      };
    }
    return write(KEY_WAR, payload);
  },

  loadWar() {
    return read(KEY_WAR, null);
  },
  hasWar() {
    return !!this.loadWar();
  },
  clearWar() {
    try { localStorage.removeItem(KEY_WAR); } catch (e) { /* приватный режим */ }
  },

  // Применение сохранения к новой игре (созданной с теми же seed/difficulty).
  applyWar(game, data) {
    if (!game || !data) return false;
    const saveV2 = game.cfg.flag('alg_save', false);
    const ext = saveV2 && data.saveExt?.version === 1 ? data.saveExt : null;
    const savedUnits = data.units || [];
    // В старом формате ID также могут быть сохранены, но при повреждении
    // любых ID ссылки на бойцов не должны перенаправляться на чужие объекты.
    const savedIds = savedUnits.map((u) => u.id);
    const restoreIds = saveV2 && savedIds.every((id) => Number.isSafeInteger(id) && id > 0 && id < Number.MAX_SAFE_INTEGER) && new Set(savedIds).size === savedIds.length;
    const byId = new Map(game.world.points.map((p) => [p.id, p]));
    for (const p of data.points || []) {
      const point = byId.get(p.id);
      if (!point) continue;
      point.owner = p.owner;
      point.hp = p.hp;
      point.capture = p.capture || 0;
      if (point.structure) { point.structure.faction = p.owner; point.structure.hp = p.hp; }
    }
    const sectorById = new Map(game.world.sectors.map((s) => [s.id, s]));
    for (const s of data.sectors || []) {
      const sector = sectorById.get(s.id);
      if (sector) { sector.owner = s.owner; sector.influence = s.influence; }
    }
    // здания: сносим стартовые, ставим сохранённые
    for (const b of game.world.buildings) b.dead = true;
    for (const b of data.buildings || []) {
      const built = game.world.addBuilding({ type: b.type, faction: b.faction, x: b.x, y: b.y, instant: true, pointId: b.pointId });
      if (game.cfg.flag('alg_save', false)) {
        if (Number.isFinite(b.hp) && b.hp >= 0 && b.hp <= built.maxHp) built.hp = b.hp;
        // pointId также используется для оборонительных построек в зоне точки.
        // Основная структура — только исходный тип и координаты самой точки.
        const p = byId.get(b.pointId);
        const type = p?.type === 'city' ? 'city' : p?.type;
        if (p && b.type === type && b.x === p.x && b.y === p.y) p.structure = built;
      }
    }
    if (game.cfg.flag('alg_save', false)) {
      // addBuilding(instant) меняет HP точки даже для укреплений с pointId;
      // исходное значение точки может отличаться от HP её структуры.
      for (const saved of data.points || []) {
        const point = byId.get(saved.id);
        if (point && Number.isFinite(saved.hp) && saved.hp >= 0) point.hp = saved.hp;
      }
    }
    const blueprintIds = saveV2 ? restoreBlueprints(game, ext?.blueprints, restoreIds ? new Set(savedIds) : null) : new Map();
    // стены: пересобираем инстансы под новые здания и восстанавливаем урон/двери
    if (game.walls) {
      game.walls.build();
      if (data.walls) game.walls.applySaved(data.walls);
    }
    game.world.rebuildNav();
    if (data.stock) game.logistics.stock = data.stock.map((s) => ({ ...s }));

    game.units.clear();
    game.unitGrid.clear();
    game.squads.clear();
    game.nextUnitId = 1;
    game.nextSquadId = 1;
    if (ext) {
      game.playerUnit = null;
      game.playerDead = !!ext.playerDead;
      game.playerRole = ext.playerRole || game.playerRole;
      game.playerWeapon = ext.playerWeapon || null;
    }
    for (const s of data.squads || []) {
      const squad = new Squad(game, { faction: s.faction, templateId: s.templateId, name: s.name, id: s.id });
      squad.state = s.state;
      squad.objective = s.objective;
      if (saveV2 && squad.objective && Number.isSafeInteger(squad.objective.blueprintId)) {
        squad.objective = { ...squad.objective, blueprintId: blueprintIds.get(squad.objective.blueprintId) ?? null };
      }
      squad.holdsAt = s.holdsAt;
      squad.anchor = s.anchor || squad.anchor;
      squad.strategyId = s.strategyId;
      squad.behavior = s.behavior;
      squad.fire = s.fire;
      squad.formation = s.formation;
      squad.directiveId = s.directiveId;
      squad.retreatPoint = s.retreatPoint;
      game.squads.set(squad.id, squad);
      game.nextSquadId = Math.max(game.nextSquadId, s.id + 1);
    }
    const exactUnits = new Map();
    if (restoreIds && Array.isArray(ext?.units)) {
      for (const state of ext.units) {
        if (state && Number.isSafeInteger(state.id) && !exactUnits.has(state.id)) exactUnits.set(state.id, state);
      }
    }
    for (const u of savedUnits) {
      if (restoreIds) game.nextUnitId = u.id;
      const isPlayer = !!(ext && restoreIds && ext.playerUnitId === u.id);
      const unit = game.spawnUnit(u.faction, u.role, u.x, u.y, { squadId: u.squadId, ...(isPlayer ? { player: true } : {}) });
      if (isPlayer) {
        unit.playerControlled = !!ext.playerControlled;
        game.playerUnit = unit;
      }
      unit.hp = u.hp;
      unit.morale = u.morale;
      unit.mag = u.mag;
      unit.reserve = u.reserve;
      unit.facing = u.facing;
      if (u.downed) unit.downed = true;
      const exact = exactUnits.get(u.id);
      if (exact) {
        // Дополнительные поля старые версии не содержат; повреждённые значения
        // игнорируем вместо записи NaN в физику и таймеры.
        for (const key of ['x', 'y', 'hp', 'morale', 'facing', 'bleed', 'cool', 'reloadT', 'suppression']) {
          if (Number.isFinite(exact[key])) unit[key] = exact[key];
        }
        if (typeof exact.reloading === 'boolean') unit.reloading = exact.reloading;
        game.unitGrid.update(unit);
      }
      const squad = u.squadId != null ? game.squads.get(u.squadId) : null;
      if (squad) squad.addUnit(unit);
    }
    if (restoreIds) {
      const maxId = savedIds.reduce((max, id) => Math.max(max, id), 0);
      game.nextUnitId = Math.max(maxId + 1, Number.isSafeInteger(ext?.nextUnitId) ? ext.nextUnitId : 1);
    }
    if (ext) restoreSquads(game, ext.squads, restoreIds);
    // Рейсы ссылаются на ID машин и заявки/точки; не восстанавливаем ссылки,
    // если ID юнитов повреждены и загрузчик перешёл на legacy-нумерацию.
    if (restoreIds && ext?.transport) restoreTransport(game, ext.transport);
    // Отложенные приказы привязаны к ID юнитов/отрядов, поэтому их можно
    // восстанавливать только после создания исполнителей и проверки ID.
    if (ext?.api && Array.isArray(ext.api.orders)) {
      const seenOrders = new Set();
      game.api.orders = restoreIds ? ext.api.orders.filter((order) => {
        if (!order || order.status !== 'queued' || !Number.isSafeInteger(order.id) || order.id <= 0 ||
            order.id >= Number.MAX_SAFE_INTEGER || seenOrders.has(order.id) ||
            !Array.isArray(order.unitIds) || !Array.isArray(order.squadIds) || typeof order.type !== 'string' ||
            !Number.isFinite(order.deliverAt)) return false;
        seenOrders.add(order.id);
        return true;
      }).map((order) => JSON.parse(JSON.stringify(order))).filter((order) => {
        if (!order.params || !Object.hasOwn(order.params, 'blueprintId') || order.params.blueprintId == null) return true;
        const mapped = blueprintIds.get(order.params.blueprintId);
        if (!mapped) return false; // нельзя перенаправлять приказ на чужой ID
        order.params.blueprintId = mapped;
        return true;
      }) : [];
      const maxOrderId = game.api.orders.reduce((max, order) => Math.max(max, order.id), 0);
      game.api.nextId = Math.max(maxOrderId + 1, Number.isSafeInteger(ext.api.nextId) ? ext.api.nextId : 1);
      if (Number.isSafeInteger(ext.api.seq) && ext.api.seq >= 0) game.api.seq = ext.api.seq;
      if (ext.api.stats && typeof ext.api.stats === 'object') game.api.stats = { ...ext.api.stats };
      if (Array.isArray(ext.api.journal)) game.api.journal = JSON.parse(JSON.stringify(ext.api.journal));
    }
    if (ext) {
      // Расформированные отряды в сейв не попадают, но отложенный приказ
      // может всё ещё ссылаться на них. Не присваиваем их ID новым отрядам.
      // Для старого расширения учитываем хотя бы ID ожидающих приказов.
      const validId = (id) => Number.isSafeInteger(id) && id > 0 && id < Number.MAX_SAFE_INTEGER - 1;
      const queuedMax = game.api.orders.reduce((max, order) => (order.status === 'queued' && Array.isArray(order.squadIds))
        ? order.squadIds.reduce((n, id) => validId(id) ? Math.max(n, id) : n, max) : max, 0);
      game.nextSquadId = Math.max(game.nextSquadId, queuedMax + 1, validId(ext.nextSquadId) ? ext.nextSquadId : 1);
    }
    // При создании объектов расходуется RNG; восстанавливаем его только после
    // пересоздания. Это сохраняет поток, но не заменяет полное состояние игры.
    if (ext && Number.isInteger(ext.rngState) && ext.rngState >= 0 && ext.rngState <= 0xffffffff) game.rng.s = ext.rngState;
    game.time = ext && Number.isFinite(ext.exactTime) && ext.exactTime >= 0 ? ext.exactTime : data.time || 0;
    game.stats = data.stats || game.stats;
    return true;
  },
};
