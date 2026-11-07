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
      blueprints: (game.build.blueprints || []).filter((b) => !b.built).map((b) => ({
        type: b.type, faction: b.faction, x: b.x, y: b.y, pointId: b.pointId || null,
      })),
      stock: game.logistics.stock,
      squads, units,
    };
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
      game.world.addBuilding({ type: b.type, faction: b.faction, x: b.x, y: b.y, instant: true, pointId: b.pointId });
    }
    game.world.rebuildNav();
    if (data.stock) game.logistics.stock = data.stock.map((s) => ({ ...s }));

    game.units.clear();
    game.unitGrid.clear();
    game.squads.clear();
    game.nextUnitId = 1;
    game.nextSquadId = 1;
    for (const s of data.squads || []) {
      const squad = new Squad(game, { faction: s.faction, templateId: s.templateId, name: s.name, id: s.id });
      squad.state = s.state;
      squad.objective = s.objective;
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
    for (const u of data.units || []) {
      const unit = game.spawnUnit(u.faction, u.role, u.x, u.y, { squadId: u.squadId });
      unit.hp = u.hp;
      unit.morale = u.morale;
      unit.mag = u.mag;
      unit.reserve = u.reserve;
      unit.facing = u.facing;
      if (u.downed) unit.downed = true;
      const squad = u.squadId != null ? game.squads.get(u.squadId) : null;
      if (squad) squad.addUnit(unit);
    }
    game.time = data.time || 0;
    game.stats = data.stats || game.stats;
    return true;
  },
};
