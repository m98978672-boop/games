// Строительство: чертежи, проверки размещения с кодами причин, линии, зоны по профилю,
// шаблоны, приоритеты, очередь, работа инженеров, ремонт, пулемётные гнёзда.
// Правила одинаковы для игрока и ИИ: любая постановка идёт через Command API.
import { clamp, dist, angleTo } from '../core/mathx.js';

export const FORT_TYPES = ['sandbags', 'wire', 'trench', 'mg_nest', 'bunker', 'watchtower'];
export const LINE_TYPES = ['sandbags', 'wire', 'trench'];
export const PRIORITIES = { low: 0, normal: 1, urgent: 2 };
export const PRIORITY_LABEL = { 0: 'низкий', 1: 'обычный', 2: 'срочно' };

// Коды причин: те же для подсказки под курсором, журнала приказов и панели стройки.
export const REASONS = {
  OK: 'можно ставить',
  TERRAIN: 'здесь вода или препятствие',
  OVERLAP: 'место занято',
  RANGE: 'за границей карты',
  SKILL: 'нужен навык',
  CATEGORY: 'эту постройку нельзя ставить вручную',
  RESOURCES: 'не хватает ресурсов',
  LIMIT: 'достигнут лимит построек этого типа',
  FOG: 'точка в тумане войны',
  FOG_BEHIND: 'за линией фронта строить нельзя',
  BLOCKS_PATH: 'перекрывает единственный проход',
  ACCESS: 'нет подхода для строителей',
  ENEMY_NEAR: 'рядом противник',
  NO_UNITS: 'нет инженеров',
};

const THREAT_DECAY = 0.85;

export class BuildSystem {
  constructor(game) {
    this.game = game;
    this.blueprints = [];
    this.turretTimer = 0;
    this.alertCooldown = 0;
    this.placedCount = 0;
    this.planTimer = 0;
    this.threat = [new Map(), new Map()]; // сектор → угроза по фракциям
    this.lastReject = new Map(); // причина → счётчик (для отчёта и тестов)
  }

  // ---------- проверки размещения ----------

  footprint(def, x, y) {
    const half = def.size / 2;
    return [[-half, -half], [half, -half], [-half, half], [half, half], [0, 0]]
      .map(([ox, oy]) => ({ x: x + ox, y: y + oy, walk: this.game.world.isWalkable(x + ox, y + oy) }));
  }

  // Проверка «чертёж перекрывает проход»: если вокруг пятна почти всё непроходимо,
  // это узкое место — ставим предупреждение, но не запрещаем.
  blocksPath(def, x, y) {
    if (!this.game.cfg.flag('build_path_warning', true)) return false;
    let blocked = 0;
    const r = def.size * 0.9;
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      if (!this.game.world.isWalkable(x + Math.cos(a) * r, y + Math.sin(a) * r)) blocked++;
    }
    return blocked >= 6;
  }

  fogAllows(faction, x, y) {
    const game = this.game;
    const sec = game.world.sectorAt(x, y);
    if (!sec) return true;
    if (sec.owner === faction) return true;
    if (sec.influence * (faction === 0 ? 1 : -1) > -0.15) return true;
    return false;
  }

  countOf(faction, type) {
    let n = 0;
    for (const b of this.game.world.buildings) {
      if (!b.dead && b.faction === faction && b.type === type) n++;
    }
    return n;
  }

  validate(type, x, y, faction, { ignoreCost = false, ignoreFog = false } = {}) {
    const game = this.game;
    const def = game.cfg.building(type);
    const fail = (code, extra = '') => {
      const reason = `${REASONS[code] || code}${extra ? `: ${extra}` : ''}`;
      this.lastReject.set(code, (this.lastReject.get(code) || 0) + 1);
      return { ok: false, code, reason, reasonText: reason };
    };
    if (!def) return fail('CATEGORY', 'неизвестная постройка');
    if (def.category !== 'fort' && def.category !== 'point') return fail('CATEGORY');
    if (x < 60 || y < 60 || x > game.world.W - 60 || y > game.world.H - 60) return fail('RANGE');
    if (def.category === 'fort' && !(def.requires || []).every((sk) => (game.modsFor(faction).unlock_build || []).includes(sk))) {
      // навыки открывают тяжёлые постройки; список в buildings.json → requires
      return fail('SKILL', (def.requires || []).join(', '));
    }
    if (type === 'bunker' && !(game.modsFor(faction).unlock_build || []).includes('bunker')) {
      return fail('SKILL', 'Бункеры');
    }
    const foot = this.footprint(def, x, y);
    if (foot.some((p) => !p.walk)) return fail('TERRAIN');
    const near = game.world.buildingGrid.query(x, y, def.size + 20);
    for (const b of near) {
      if (b.dead) continue;
      if (dist(x, y, b.x, b.y) < (b.w + def.size) * 0.5 - 4) return fail('OVERLAP');
    }
    for (const bp of this.blueprints) {
      if (bp.dead || bp.built) continue;
      if (dist(x, y, bp.x, bp.y) < (bp.w + def.size) * 0.5 - 4) return fail('OVERLAP');
    }
    const limit = (game.modsFor(faction).build_limit_add || 0) + (def.limit ?? Infinity);
    if (this.countOf(faction, type) >= limit) return fail('LIMIT', String(limit));
    if (!ignoreFog && !this.fogAllows(faction, x, y)) return fail('FOG_BEHIND');
    if (!ignoreCost && !game.logistics.canAfford(faction, def.cost || {})) {
      const need = Object.entries(def.cost || {}).map(([k, v]) => `${game.cfg.resources.types[k].name}: ${v}`).join(', ');
      const res = fail('RESOURCES', need);
      res.soft = true; // чертёж всё равно можно поставить, стройка ждёт материалов
      return res;
    }
    // предупреждения — не запрет
    const warns = [];
    if (this.blocksPath(def, x, y)) warns.push({ code: 'BLOCKS_PATH', reason: REASONS.BLOCKS_PATH });
    if (this.enemyNear(faction, x, y, 320)) warns.push({ code: 'ENEMY_NEAR', reason: REASONS.ENEMY_NEAR });
    if (!this.hasBuilderNear(faction, x, y, 900)) warns.push({ code: 'ACCESS', reason: REASONS.ACCESS });
    return { ok: true, code: 'OK', reason: REASONS.OK, warn: warns };
  }

  // Старый API: возвращает мягкий отказ для нехватки ресурсов (чертёж ставится, стройка ждёт).
  canPlace(type, x, y, faction, ignoreCost = false) {
    const res = this.validate(type, x, y, faction, { ignoreCost });
    if (!res.ok && res.soft) return { ok: true, code: res.code, reason: res.reason, warn: [{ code: 'RESOURCES', reason: res.reason }] };
    return res;
  }

  enemyNear(faction, x, y, radius) {
    for (const u of this.game.nearbyEnemies({ x, y, faction }, radius)) {
      if (u.alive && !u.downed && dist(x, y, u.x, u.y) < radius) return true;
    }
    return false;
  }

  hasBuilderNear(faction, x, y, radius) {
    for (const u of this.game.units.values()) {
      if (!u.alive || u.downed || u.faction !== faction) continue;
      if (u.role === 'engineer' && dist(x, y, u.x, u.y) < radius) return true;
    }
    return false;
  }

  // ---------- постановка ----------

  place(type, x, y, faction, { instant = false, free = false, pointId = null, priority = 'normal', reason = '' } = {}) {
    const game = this.game;
    const check = this.canPlace(type, x, y, faction, free || instant);
    if (!check.ok) return check;
    const def = game.cfg.building(type);
    if (!free && !instant) {
      if (!game.logistics.spend(faction, def.cost || {})) return { ok: false, code: 'RESOURCES', reason: REASONS.RESOURCES };
    }
    const b = game.world.addBuilding({ type, faction, x, y, pointId, instant, blueprint: !instant });
    // Приоритеты — за флагом: выключенный флаг возвращает прежнее поведение (все чертежи равны).
    b.priority = game.cfg.flag('build_priority', true) ? (PRIORITIES[priority] ?? 1) : 1;
    b.reason = reason;
    b.createdAt = game.time;
    b.stall = 'ok';
    this.blueprints.push(b);
    this.placedCount++;
    game.sound('blueprint', x, y);
    game.events.emit('blueprintPlaced', { building: b, faction, t: game.time });
    return { ok: true, building: b, code: 'OK', warn: check.warn || [] };
  }

  // Линия: шаг = размер секции, автосоединение по направлению.
  planLine(type, a, b, faction) {
    const def = this.game.cfg.building(type);
    if (!def) return [];
    const len = Math.max(1, dist(a.x, a.y, b.x, b.y));
    const step = Math.max(28, def.size * 0.95);
    const n = clamp(Math.round(len / step), 1, 64);
    const out = [];
    for (let i = 0; i <= n; i++) {
      const t = n === 0 ? 0 : i / n;
      const x = a.x + (b.x - a.x) * t;
      const y = a.y + (b.y - a.y) * t;
      const horizontal = Math.abs(b.x - a.x) >= Math.abs(b.y - a.y);
      out.push({ type, x, y, dir: horizontal ? 'h' : 'v', faction });
    }
    return out;
  }

  placeLine(type, a, b, faction, { priority = 'normal', reason = 'линия' } = {}) {
    const items = this.planLine(type, a, b, faction);
    const placed = [], rejected = [];
    for (const it of items) {
      const res = this.place(type, it.x, it.y, faction, { priority, reason });
      if (res.ok) { res.building.dir = it.dir; placed.push(res.building); }
      else rejected.push({ x: Math.round(it.x), y: Math.round(it.y), code: res.code, reason: res.reason });
    }
    return { ok: placed.length > 0, placed: placed.length, rejected, total: items.length };
  }

  // Зона по профилю: эшелоны от направления угрозы, выбор позиций по полезности.
  planZone(poly, profileId, faction, { budget = null, pointId = null } = {}) {
    const game = this.game;
    const profile = game.cfg.profiles[profileId] || game.cfg.profiles.medium;
    if (!game.cfg.flag('build_zone', true)) return [];
    const xs = poly.map((p) => p.x), ys = poly.map((p) => p.y);
    const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
    const cx = (minX + maxX) / 2, cy = (minY + maxY) / 2;
    const threatDir = this.threatDirection(faction, cx, cy);
    const spend = budget ?? profile.budget ?? 500;
    let left = spend;
    const items = [];
    const placedAt = [];
    const cells = [];
    const step = 40;
    for (let y = minY; y <= maxY; y += step) {
      for (let x = minX; x <= maxX; x += step) {
        if (!this.inside(poly, x, y)) continue;
        if (!game.world.isWalkable(x, y)) continue;
        // проекция на направление угрозы: 0 — передний край, 1 — тыл
        const proj = (x - cx) * threatDir.x + (y - cy) * threatDir.y;
        const depthNorm = clamp(0.5 - proj / Math.max(1, maxX - minX), 0, 1);
        const value = this.threatAt(faction, x, y) * (profile.threatWeight ?? 1) + defCover(this.game, profile) * 0.15 - depthNorm * 0.25;
        cells.push({ x, y, value, depthNorm });
      }
    }
    cells.sort((a, b) => b.value - a.value);
    if (!cells.length) return [];
    // Не дублируем уже построенное: позиция рядом со своим строением/чертежом занята.
    const dedup = profile.dedup ?? 96;
    const occupied = (x, y) => {
      if (placedAt.some((p) => dist(p.x, p.y, x, y) < dedup)) return true;
      for (const b of game.world.buildingGrid.query(x, y, dedup)) {
        if (b.dead || b.faction !== faction) continue;
        if (dist(b.x, b.y, x, y) < dedup) return true;
      }
      for (const bp of this.blueprints) {
        if (bp.dead || bp.built || bp.faction !== faction) continue;
        if (dist(bp.x, bp.y, x, y) < dedup) return true;
      }
      return false;
    };
    const openCells = cells.filter((c) => !occupied(c.x, c.y));
    cells.length = 0;
    cells.push(...openCells);
    if (!cells.length) return [];
    const slots = this.itemsByEchelon(profile);
    const totalItems = slots.length;
    const quota = Math.max(1, Math.min(totalItems, Math.round((cells.length * (profile.density ?? 10)) / 100) + 2));
    let taken = 0;
    // Дешёвые секции ставятся первыми: экономика важнее «сразу самое сильное».
    slots.sort((a, b) => a.cost - b.cost);
    for (const slot of slots) {
      if (taken >= quota) break;
      const def = game.cfg.building(slot.type);
      if (!def || !def.category) continue;
      if (slot.cost > left) continue;
      const cell = cells.find((c) => {
        const near = placedAt.some((p) => dist(p.x, p.y, c.x, c.y) < Math.max(34, def.size * 0.95));
        return !near && c.depthNorm >= slot.from && c.depthNorm <= slot.to;
      });
      if (!cell) continue;
      const check = this.canPlace(slot.type, cell.x, cell.y, faction);
      if (!check.ok) continue;
      items.push({ type: slot.type, x: cell.x, y: cell.y, echelon: slot.name });
      placedAt.push(cell);
      left -= slot.cost;
      taken++;
    }
    return items;
  }

  // Раскладываем элементы профиля по эшелонам: тяжёлое — вперёд, тыловое — назад.
  itemsByEchelon(profile) {
    const order = { bunker: 0, mg_nest: 0, trench: 0.2, wire: 0.35, sandbags: 0.55, watchtower: 0.7 };
    const echelons = profile.echelons && profile.echelons.length
      ? profile.echelons
      : [{ name: 'main', depth: 140, share: 1 }];
    const all = [];
    for (const it of profile.items || []) for (let k = 0; k < (it.count || 1); k++) all.push({ type: it.type });
    all.sort((a, b) => (order[a.type] ?? 0.5) - (order[b.type] ?? 0.5));
    const out = [];
    all.forEach((it, i) => {
      const idx = Math.min(echelons.length - 1, Math.floor((i / Math.max(1, all.length)) * echelons.length));
      const e = echelons[idx];
      const def = this.game.cfg.building(it.type);
      out.push({
        type: it.type, name: e.name,
        from: idx === 0 ? 0 : (0.9 * idx) / echelons.length,
        to: idx === echelons.length - 1 ? 1 : (0.9 * (idx + 1)) / echelons.length,
        cost: Object.values(def?.cost || {}).reduce((a, v) => a + v, 0),
      });
    });
    return out;
  }

  placeZone(poly, profileId, faction, { priority = 'normal', budget = null, pointId = null, reason = 'зона по профилю' } = {}) {
    const items = this.planZone(poly, profileId, faction, { budget, pointId });
    const placed = [], rejected = [];
    for (const it of items) {
      const res = this.place(it.type, it.x, it.y, faction, { priority, reason, pointId });
      if (res.ok) placed.push(res.building);
      else rejected.push({ type: it.type, x: Math.round(it.x), y: Math.round(it.y), code: res.code, reason: res.reason });
    }
    return { ok: placed.length > 0, placed: placed.length, rejected, planned: items.length, profile: profileId };
  }

  // Совместимость: профиль вокруг точки (дуга в сторону угрозы).
  planProfile(profileId, cx, cy, faction, pointId = null) {
    const profileDef = this.game.cfg.profiles[profileId] || this.game.cfg.profiles.medium;
    // Не перестраиваем один и тот же узел заново: считаем уже стоящие форты рядом.
    const cap = profileDef.maxFortsPerPoint ?? 4;
    let existing = 0;
    for (const b of this.game.world.buildings) {
      if (b.dead || b.faction !== faction) continue;
      if (this.game.cfg.building(b.type)?.category !== 'fort') continue;
      if (dist(b.x, b.y, cx, cy) < 240) existing++;
    }
    for (const bp of this.blueprints) {
      if (bp.dead || bp.built || bp.faction !== faction) continue;
      if (dist(bp.x, bp.y, cx, cy) < 240) existing++;
    }
    if (existing >= cap) return { ok: true, placed: 0, skipped: true, reason: 'узел уже укреплён' };
    const radius = 170;
    const poly = [];
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      poly.push({ x: cx + Math.cos(a) * radius, y: cy + Math.sin(a) * radius });
    }
    const res = this.placeZone(poly, profileId, faction, { pointId, reason: 'профиль обороны' });
    const profile = this.game.cfg.profiles[profileId] || this.game.cfg.profiles.medium;
    if (!res.ok) {
      this.game.alertLog.push({ kind: 'build', text: `Профиль «${profile.name}» не поставлен: нет места`, x: cx, y: cy, t: this.game.time });
      return { ok: false, reason: 'нет места' };
    }
    this.game.alertLog.push({ kind: 'build', text: `Профиль «${profile.name}»: ${res.placed} чертежей`, x: cx, y: cy, t: this.game.time });
    return { ok: true, placed: res.placed };
  }

  // Шаблон: смещения из data/build_templates.json, поворот и зеркало.
  placeTemplate(templateId, x, y, faction, { rot = 0, mirror = false, priority = 'normal' } = {}) {
    const tpl = this.game.cfg.template(templateId);
    if (!tpl) return { ok: false, code: 'CATEGORY', reason: 'нет такого шаблона' };
    if (!this.game.cfg.flag('build_templates', true)) return { ok: false, code: 'CATEGORY', reason: 'шаблоны выключены флагом' };
    const placed = [], rejected = [];
    const cos = Math.cos(rot), sin = Math.sin(rot);
    for (const it of tpl.items || []) {
      const dx0 = mirror ? -it.dx : it.dx;
      const dx = dx0 * cos - it.dy * sin;
      const dy = dx0 * sin + it.dy * cos;
      const res = this.place(it.type, x + dx, y + dy, faction, { priority, reason: `шаблон «${tpl.name}»` });
      if (res.ok) placed.push(res.building);
      else rejected.push({ type: it.type, code: res.code, reason: res.reason });
    }
    return { ok: placed.length > 0, placed: placed.length, rejected, total: (tpl.items || []).length, template: templateId };
  }

  inside(poly, x, y) {
    let inside = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const xi = poly[i].x, yi = poly[i].y, xj = poly[j].x, yj = poly[j].y;
      if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi + 1e-9) + xi) inside = !inside;
    }
    return inside;
  }

  // ---------- карта угроз и планировщик ИИ ----------

  threatDirection(faction, cx, cy) {
    const game = this.game;
    let vx = 0, vy = 0;
    for (const u of game.units.values()) {
      if (!u.alive || u.downed || u.faction === faction) continue;
      const d = dist(cx, cy, u.x, u.y);
      if (d > 2600) continue;
      const w = 1 / Math.max(120, d);
      vx += (u.x - cx) * w;
      vy += (u.y - cy) * w;
    }
    const hq = game.world.enemyHQ(faction);
    if (hq) {
      const d = dist(cx, cy, hq.x, hq.y) || 1;
      vx += ((hq.x - cx) / d) * 0.25;
      vy += ((hq.y - cy) / d) * 0.25;
    }
    const len = Math.hypot(vx, vy) || 1;
    return { x: vx / len, y: vy / len };
  }

  threatAt(faction, x, y) {
    const game = this.game;
    const sec = game.world.sectorAt(x, y);
    if (!sec) return 0;
    const map = this.threat[faction];
    return map.get(sec.id) ?? 0;
  }

  // Угроза сектора: близость вражеских юнитов и территории + давление соседей.
  refreshThreat(faction) {
    const game = this.game;
    const map = this.threat[faction];
    const enemy = 1 - faction;
    const enemySectors = game.world.sectors.filter((s) => s.owner === enemy);
    for (const s of game.world.sectors) {
      const foe = s.strength?.[enemy] ?? 0;
      let value = foe * 0.35 - (s.strength?.[faction] ?? 0) * 0.08;
      // близость вражеской территории: 0..1.2
      let nearest = Infinity;
      for (const e of enemySectors) {
        const d = Math.hypot(e.cx - s.cx, e.cy - s.cy);
        if (d < nearest) nearest = d;
      }
      if (nearest < 1400) value += clamp(1 - nearest / 1400, 0, 1) * 1.2;
      // линия фронта симметрична: у карты нет «своей» половины
      value += clamp(1 - Math.abs(s.cx - game.world.W / 2) / 1400, 0, 1) * 1.6;
      // давление соседей
      for (const nid of s.neighbors) {
        const n = game.world.sectorById(nid);
        if (!n) continue;
        value += (n.strength?.[enemy] ?? 0) * 0.15;
        if (n.owner === enemy) value += 0.25;
      }
      const prev = map.get(s.id) ?? 0;
      map.set(s.id, prev * THREAT_DECAY + value);
    }
  }

  // Политика ИИ: строим только когда армия в порядке и есть запас материалов.
  // Правила одинаковы для автопилота игрока и ИИ врага; ручные приказы игрока не ограничены.
  buildWanted(faction) {
    const game = this.game;
    const cfgB = game.cfg.ai.build || {};
    if (game.time < (this.buildCooldown?.[faction] ?? 0)) return false;
    const army = [...game.units.values()].filter((u) => u.alive && !u.downed && u.faction === faction).length;
    if (army < (cfgB.minArmy ?? 24)) return false;
    const stock = game.logistics.supply(faction);
    if ((stock.materials || 0) < (cfgB.reserveMaterials ?? 150)) return false;
    const open = this.blueprints.filter((b) => b.faction === faction && !b.dead && !b.built).length;
    if (open >= (cfgB.maxOpenBlueprints ?? 10)) return false;
    return true;
  }

  noteBuild(faction) {
    this.buildCooldown = this.buildCooldown || [0, 0];
    this.buildCooldown[faction] = this.game.time + (this.game.cfg.ai.build?.cooldownSeconds ?? 25);
  }

  // ИИ-планировщик: укрепляем угрожаемые свои точки через ту же очередь чертежей.
  autoPlan(faction) {
    const game = this.game;
    if (!game.cfg.flag('ai_auto_plan', true)) return 0;
    if (!game.autopilot.areaEnabled(faction, 'build')) return 0;
    if (!this.buildWanted(faction)) return 0;
    const targets = game.world.points
      .filter((p) => p.owner === faction && ['city', 'depot', 'hq', 'factory'].includes(p.type))
      .map((p) => ({ p, threat: this.threatAt(faction, p.x, p.y) }))
      .sort((a, b) => b.threat - a.threat);
    const target = targets[0];
    if (!target || target.threat < 0.8) return 0;
    let forts = 0;
    for (const b of game.world.buildings) {
      if (!b.dead && b.faction === faction && dist(b.x, b.y, target.p.x, target.p.y) < 260) forts++;
    }
    if (forts >= 4) return 0;
    const profileId = target.threat > 2.5 ? 'medium' : 'light';
    const res = game.api.issue({
      source: faction === game.playerFaction ? 'autopilot' : 'enemyAI',
      type: 'build_zone', faction,
      target: { x: target.p.x, y: target.p.y, sectorId: game.world.sectorAt(target.p.x, target.p.y)?.id },
      params: { profile: profileId, radius: 190, pointId: target.p.id },
      priority: 2, reason: `укрепление ${target.p.name} (угроза ${target.threat.toFixed(1)})`,
    });
    if (res?.ok) this.noteBuild(faction);
    return res?.ok ? 1 : 0;
  }

  // ---------- очередь и работа ----------

  queue(faction) {
    return this.blueprints
      .filter((b) => !b.dead && !b.built && b.faction === faction)
      .sort((a, b) => (b.priority ?? 1) - (a.priority ?? 1) || a.createdAt - b.createdAt);
  }

  setPriority(b, priority) {
    if (!this.game.cfg.flag('build_priority', true)) return { ok: false, code: 'CATEGORY', reason: 'приоритеты выключены флагом' };
    if (!b || b.dead) return { ok: false, code: 'CATEGORY', reason: 'нет чертежа' };
    b.priority = PRIORITIES[priority] ?? 1;
    return { ok: true, reason: `приоритет: ${PRIORITY_LABEL[b.priority]}` };
  }

  cancel(b) {
    if (!b || b.dead) return { ok: false, code: 'CATEGORY', reason: 'нет чертежа' };
    const game = this.game;
    const def = game.cfg.building(b.type);
    const ratio = b.built ? 0.4 : b.progress > 0 ? 0.6 : 1.0;
    const back = {};
    for (const [k, v] of Object.entries((def && def.cost) || {})) back[k] = Math.round(v * ratio);
    game.logistics.supply(b.faction);
    const stock = game.logistics.supply(b.faction);
    for (const [k, v] of Object.entries(back)) stock[k] = (stock[k] || 0) + v;
    this.demolish(b);
    return { ok: true, reason: `отмена, возврат ${Math.round(ratio * 100)}%`, refund: back };
  }

  stall(b) {
    const game = this.game;
    if (b.built || b.dead) return 'ok';
    if (b.paused) return b.pauseReason || 'paused';
    const stock = game.logistics.supply(b.faction);
    if ((stock.materials || 0) < 1) return 'NO_MATERIALS';
    if (this.enemyNear(b.faction, b.x, b.y, 260)) return 'DANGER';
    if (!this.hasBuilderNear(b.faction, b.x, b.y, 1200)) return 'NO_ENGINEERS';
    if (!game.world.isWalkable(b.x, b.y)) return 'UNREACHABLE';
    return 'ok';
  }

  queueInfo(faction) {
    return this.queue(faction).slice(0, 8).map((b) => {
      const def = this.game.cfg.building(b.type);
      return {
        id: b.id, type: b.type, name: def?.name || b.type,
        progress: Math.round((b.progress || 0) * 100),
        priority: b.priority ?? 1, priorityLabel: PRIORITY_LABEL[b.priority ?? 1],
        stall: this.stall(b), x: Math.round(b.x), y: Math.round(b.y),
      };
    });
  }

  // Строителя выбираем по полезности: близко, безопасно, есть навык, не занят, важен чертёж.
  scoreBuilder(u, b) {
    const game = this.game;
    const w = game.cfg.ai.buildWeights || { dist: 1, safe: 1.2, skill: 0.6, busy: 0.8, prio: 1 };
    const d = dist(u.x, u.y, b.x, b.y);
    const danger = this.enemyNear(u.faction, b.x, b.y, 300) ? 1 : 0;
    const busy = u.buildTarget && u.buildTarget !== b ? 1 : 0;
    return (
      w.dist * (1 - clamp(d / 900, 0, 1)) +
      w.safe * (1 - danger) +
      w.skill * clamp((u.buildPower || 10) / 20, 0, 1) +
      w.prio * ((b.priority ?? 1) / 2) -
      w.busy * busy
    );
  }

  nearestWork(u, radius) {
    const utility = this.game.cfg.flag('build_builder_utility', true);
    let best = null, bs = utility ? -Infinity : Infinity;
    for (const b of this.blueprints) {
      if (b.dead || b.built) continue;
      if (b.faction !== u.faction) continue;
      const d = dist(u.x, u.y, b.x, b.y);
      if (d > radius) continue;
      // приоритетные чертежи притягивают строителей даже через полкарты
      const reach = utility ? radius * (1 + (b.priority ?? 1) * 0.25) : radius;
      if (d > reach) continue;
      if (utility) {
        const s = this.scoreBuilder(u, b);
        if (s > bs) { bs = s; best = b; }
      } else if (d < bs) { bs = d; best = b; }
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
      b.pauseReason = 'NO_MATERIALS';
      b.stall = 'NO_MATERIALS';
      if (this.alertCooldown <= 0) {
        this.alertCooldown = 15;
        game.alertLog.push({ kind: 'supply', text: 'Стройка встала: нет материалов', x: b.x, y: b.y, t: game.time });
      }
      return;
    }
    b.paused = false;
    b.pauseReason = null;
    b.stall = 'ok';
    stock.materials -= 0.55 * dt;
    const mods = game.modsFor(b.faction);
    const power = (engineer?.buildPower || 10) * (mods.build_speed_mult || 1);
    const time = Math.max(1, b.def.time);
    b.progress = clamp(b.progress + (dt * power) / (time * 12), 0, 1);
    b.builders = 1;
    b.buildersIds = b.buildersIds || [];
    if (engineer) { b.buildersIds.push(engineer.id); if (b.buildersIds.length > 8) b.buildersIds.shift(); }
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
    if (stock.materials < 0.2) { b.paused = true; b.pauseReason = 'NO_MATERIALS'; return; }
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
    const game = this.game;

    // карта угроз и планировщик ИИ — раз в 5 с, по фракциям
    this.planTimer -= dt;
    if (this.planTimer <= 0) {
      this.planTimer = 5;
      for (const f of [0, 1]) {
        this.refreshThreat(f);
        if (game.cfg.flag('ai_auto_plan', true) && game.time > 30) this.autoPlan(f);
      }
    }

    this.turretTimer -= dt;
    if (this.turretTimer > 0) return;
    this.turretTimer = 0.7;
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

function defCover(game, profile) {
  let best = 0;
  for (const it of profile.items || []) {
    const def = game.cfg.building(it.type);
    if (def) best = Math.max(best, def.cover || 0);
  }
  return best;
}
