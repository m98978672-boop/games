// Стены зданий: сегменты с материалом и проёмами, коллизия движения, пули, обзор,
// направленное укрытие, двери, разрушение и ремонт.
//
// Геометрия приходит из data/outlines/<type>.json (генерируется tools/gen-walls.mjs).
// Правило симметрии: модуль не знает про фракции — одинаковые стены и правила для всех.
import { clamp, dist, angleDiff } from '../core/mathx.js';

const CELL = 128;
// Числовой ключ ячейки сетки: без строк и аллокаций в горячем пути (мир ≤ 4096 px).
const cellKey = (cx, cy) => cx * 65536 + cy;

export class Walls {
  constructor(game) {
    this.game = game;
    this.cfg = game.cfg;
    this.world = game.world;
    this.materials = this.cfg.wallMaterials?.materials || {};
    this.openingDefs = this.cfg.wallMaterials?.openings || {};
    this.coverCfg = this.cfg.coverRules?.heightClasses || {};
    this.stageDefs = this.cfg.wallMaterials?.stages || {};
    this.pointCfg = this.cfg.coverRules?.points || { offset: 14, step: 28 };
    this.dirCfg = this.cfg.coverRules?.directional || { rays: 3, raySpreadPx: 10, cacheSeconds: 0.35 };
    this.budget = this.cfg.navBudget || { chunk: 512, maxChunksPerFrame: 2, budgetMs: 1.5 };
    this.instances = new Map(); // buildingId → состояние
    this.grid = new Map(); // "cx,cy" → [segment refs]
    this.coverCache = new Map();
    this.doorTimer = 0;
    this._stamp = 0;
    this.dirty = true;
    this.navQueue = new Set();
    this.stats = { hits: 0, penetrations: 0, blockedShots: 0, breaches: 0, doorsOpened: 0, coverChecks: 0,
      calls: { move: 0, ray: 0, cover: 0 }, updateMs: 0, updates: 0 };
    this.build();
  }

  enabled() { return this.game.cfg.flag('wall_collision_v2', true); }
  destructionEnabled() { return this.enabled() && this.game.cfg.flag('wall_destruction', true); }

  outlineFor(type) { return this.cfg.outlines?.[type] || null; }

  // ---------- построение кэша ----------

  build() {
    this.instances.clear();
    this.grid.clear();
    this.coverCache.clear();
    for (const b of this.world.buildings) this.attach(b);
    this.dirty = false;
  }

  attach(b) {
    const outline = this.outlineFor(b.type);
    if (!outline) return null;
    if (!b.built) return null;
    let st = this.instances.get(b.id);
    if (!st) {
      st = {
        segs: outline.segments.map((s) => ({
          id: s.id, hp: s.hp, maxHp: s.hp, breached: false,
        })),
        doors: {},
        openingState: {},
        outline,
        stamp: 0,
      };
      for (const o of outline.openings || []) {
        if (o.type === 'door' || o.type === 'gate') st.doors[o.id] = { state: 'open', closeAt: 0 };
        if (o.type === 'door_closed') st.doors[o.id] = { state: 'closed', closeAt: 0 };
      }
      this.instances.set(b.id, st);
    }
    b.wall = st;
    this.reindex(b.id, st);
    return st;
  }

  detach(b) {
    if (!b) return;
    this.instances.delete(b.id);
    b.wall = null;
    this.reindex(b.id, null);
  }

  state(b) { return this.instances.get(b.id) || null; }

  segState(b, segId) {
    const st = this.state(b);
    return st ? st.segs.find((s) => s.id === segId) : null;
  }

  // Пересобрать пространственный индекс для одного здания.
  reindex(bid, st) {
    for (const key of [...this.grid.keys()]) {
      const list = this.grid.get(key).filter((r) => r.bid !== bid);
      if (list.length) this.grid.set(key, list); else this.grid.delete(key);
    }
    if (!st) return;
    const b = this.world.buildings.find((x) => x.id === bid);
    if (!b || b.dead || !b.built) return;
    for (const s of st.segs) {
      const geo = st.outline.segments.find((g) => g.id === s.id);
      if (!geo) continue;
      const ref = {
        bid, kind: 'segment', segId: s.id, st,
        x1: b.x + geo.points[0][0], y1: b.y + geo.points[0][1],
        x2: b.x + geo.points[1][0], y2: b.y + geo.points[1][1],
        thickness: geo.thickness, material: geo.material, heightClass: geo.heightClass,
        blocksMove: geo.blocksMove, blocksVision: geo.blocksVision, geo,
      };
      ref.bx0 = Math.min(ref.x1, ref.x2); ref.bx1 = Math.max(ref.x1, ref.x2);
      ref.by0 = Math.min(ref.y1, ref.y2); ref.by1 = Math.max(ref.y1, ref.y2);
      ref.breached = !!s.breached;
      this.insertRef(ref);
    }
    for (const o of st.outline.openings || []) {
      const ref = {
        bid, kind: 'opening', segId: null, opening: o, st,
        x1: b.x + o.p1[0], y1: b.y + o.p1[1], x2: b.x + o.p2[0], y2: b.y + o.p2[1],
        thickness: st.outline.thickness || 12, material: st.outline.spec?.material || 'wood',
        heightClass: 2, blocksMove: false, blocksVision: false, geo: null,
      };
      ref.bx0 = Math.min(ref.x1, ref.x2); ref.bx1 = Math.max(ref.x1, ref.x2);
      ref.by0 = Math.min(ref.y1, ref.y2); ref.by1 = Math.max(ref.y1, ref.y2);
      ref.breached = false;
      this.insertRef(ref);
    }
  }

  insertRef(ref) {
    const minX = Math.min(ref.x1, ref.x2) - ref.thickness;
    const maxX = Math.max(ref.x1, ref.x2) + ref.thickness;
    const minY = Math.min(ref.y1, ref.y2) - ref.thickness;
    const maxY = Math.max(ref.y1, ref.y2) + ref.thickness;
    for (let cx = Math.floor(minX / CELL); cx <= Math.floor(maxX / CELL); cx++) {
      for (let cy = Math.floor(minY / CELL); cy <= Math.floor(maxY / CELL); cy++) {
        const key = cellKey(cx, cy);
        if (!this.grid.has(key)) this.grid.set(key, []);
        this.grid.get(key).push(ref);
      }
    }
  }

  refsNear(x, y, radius = 48) {
    if (!this.enabled()) return [];
    const found = [];
    const stamp = ++this._stamp;
    const r = Math.ceil(radius / CELL) + 1;
    const cx = Math.floor(x / CELL), cy = Math.floor(y / CELL);
    for (let i = -r; i <= r; i++) {
      for (let j = -r; j <= r; j++) {
        const list = this.grid.get(cellKey(cx + i, cy + j));
        if (!list) continue;
        for (let k = 0; k < list.length; k++) {
          const ref = list[k];
          if (ref.stamp === stamp) continue;
          ref.stamp = stamp;
          found.push(ref);
        }
      }
    }
    return found;
  }

  static distPointSegment(px, py, x1, y1, x2, y2) {
    const dx = x2 - x1, dy = y2 - y1;
    const len2 = dx * dx + dy * dy;
    if (len2 < 1e-9) return { d: Math.hypot(px - x1, py - y1), t: 0 };
    let t = ((px - x1) * dx + (py - y1) * dy) / len2;
    t = t < 0 ? 0 : t > 1 ? 1 : t;
    return { d: Math.hypot(px - (x1 + dx * t), py - (y1 + dy * t)), t };
  }

  // Квадрат расстояния точка-отрезок: без объекта и hypot в горячем пути.
  static dist2PointSegment(px, py, x1, y1, x2, y2) {
    const dx = x2 - x1, dy = y2 - y1;
    const len2 = dx * dx + dy * dy;
    if (len2 < 1e-9) {
      const ax = px - x1, ay = py - y1;
      return ax * ax + ay * ay;
    }
    let t = ((px - x1) * dx + (py - y1) * dy) / len2;
    t = t < 0 ? 0 : t > 1 ? 1 : t;
    const qx = px - (x1 + dx * t), qy = py - (y1 + dy * t);
    return qx * qx + qy * qy;
  }

  static closestBetween(x1, y1, x2, y2, px1, py1, px2, py2) {
    const d1x = x2 - x1, d1y = y2 - y1, d2x = px2 - px1, d2y = py2 - py1;
    const rx = x1 - px1, ry = y1 - py1;
    const a = d1x * d1x + d1y * d1y, e = d2x * d2x + d2y * d2y;
    const b = d1x * d2x + d1y * d2y, c = d1x * rx + d1y * ry, f = d2x * rx + d2y * ry;
    const den = a * e - b * b;
    let s = den > 1e-9 ? clamp((b * f - c * e) / den, 0, 1) : 0;
    let t = b * s + f;
    t = t <= 0 ? 0 : t >= e ? 1 : t / e;
    s = (b * t - c) / (a || 1);
    s = s < 0 ? 0 : s > 1 ? 1 : s;
    const qx = x1 + d1x * s - (px1 + d2x * t), qy = y1 + d1y * s - (py1 + d2y * t);
    return { d: Math.hypot(qx, qy), t: s };
  }

  static segIntersect(x1, y1, x2, y2, x3, y3, x4, y4) {
    const d1x = x2 - x1, d1y = y2 - y1;
    const d2x = x4 - x3, d2y = y4 - y3;
    const den = d1x * d2y - d1y * d2x;
    if (Math.abs(den) < 1e-9) return null;
    const t = ((x3 - x1) * d2y - (y3 - y1) * d2x) / den;
    const u = ((x3 - x1) * d1y - (y3 - y1) * d1x) / den;
    if (t < 0 || t > 1 || u < 0 || u > 1) return null;
    return { t, u, x: x1 + d1x * t, y: y1 + d1y * t };
  }

  openingFor(bid, openingId) {
    const st = this.instances.get(bid);
    if (!st) return null;
    return (st.outline.openings || []).find((o) => o.id === openingId) || null;
  }

  doorOpen(bid, openingId) {
    const st = this.instances.get(bid);
    if (!st) return false;
    const d = st.doors[openingId];
    return d ? d.state === 'open' : true;
  }

  // Проём в данном здании, покрывающий точку (для проходимости окон и бойниц).
  openingAt(bid, x, y, pad = 6) {
    const st = this.instances.get(bid);
    if (!st) return null;
    const b = this.world.buildings.find((bb) => bb.id === bid);
    if (!b) return null;
    for (const o of st.outline.openings || []) {
      const d = Walls.distPointSegment(x, y, b.x + o.p1[0], b.y + o.p1[1], b.x + o.p2[0], b.y + o.p2[1]);
      if (d.d <= (st.outline.thickness || 12) * 0.6 + pad) return o;
    }
    return null;
  }

  // ---------- движение ----------

  blocksMove(x, y, radius = 8, mover = null) {
    if (!this.enabled()) return false;
    this.stats.calls.move++;
    const grid = this.grid;
    const rc = Math.ceil((radius + 26) / CELL) + 1;
    const cx = Math.floor(x / CELL), cy = Math.floor(y / CELL);
    const isVeh = !!(mover && mover.isVehicle);
    for (let i = -rc; i <= rc; i++) {
      for (let j = -rc; j <= rc; j++) {
        const list = grid.get(cellKey(cx + i, cy + j));
        if (!list) continue;
        for (let k = 0; k < list.length; k++) {
          const ref = list[k];
          if (ref.breached) continue;
          const lim = radius + ref.thickness * 0.5;
          if (x < ref.bx0 - lim || x > ref.bx1 + lim || y < ref.by0 - lim || y > ref.by1 + lim) continue;
          if (ref.kind === 'segment') {
            if (!ref.blocksMove) continue;
            if (isVeh && !this.vehicleBlocked(ref)) continue;
            if (Walls.dist2PointSegment(x, y, ref.x1, ref.y1, ref.x2, ref.y2) <= lim * lim) return true;
            continue;
          }
          if (Walls.dist2PointSegment(x, y, ref.x1, ref.y1, ref.x2, ref.y2) > lim * lim) continue;
          const o = ref.opening;
          if (o.type === 'window' || o.type === 'embrasure') return true;
          if (o.type === 'door' || o.type === 'gate') {
            if (isVeh && o.type !== 'gate') return true;
            if (!this.doorOpen(ref.bid, o.id)) return true;
            continue;
          }
          if (o.type === 'door_closed' && !this.doorOpen(ref.bid, o.id)) return true;
        }
      }
    }
    return false;
  }

  vehicleBlocked(ref) { return !!(ref.blocksMove && (ref.material === 'concrete' || ref.material === 'brick' || ref.material === 'metal')); }

  segStateOf(ref) { return ref.st.segs.find((s) => s.id === ref.segId) || null; }

  // Ближайшая стена перед движущимся юнитом (для антизастревания и «подойти к двери»)
  nearestDoor(b) {
    const st = this.state(b);
    if (!st) return null;
    let best = null, bd = Infinity;
    for (const o of st.outline.openings || []) {
      if (!['door', 'gate', 'breach'].includes(o.type)) continue;
      const d = dist(b.x + o.cx, b.y + o.cy, b.x, b.y);
      if (d < bd) { bd = d; best = o; }
    }
    return best ? { opening: best, x: b.x + best.cx, y: b.y + best.cy } : null;
  }

  // ---------- пули и взрывы ----------

  // Пробиваемость: вероятность из wall_materials + бонус за стадию повреждения.
  penetrationChance(material, weaponId, stageKey = 'intact') {
    const mat = this.materials[material];
    if (!mat) return 0;
    let p = mat.penetration?.[weaponId] ?? mat.penetration?.rifle ?? 0;
    const bonus = this.stageDefs?.[stageKey]?.penetrationBonus || 0;
    if (p > 0 && p < 1) p = clamp(p + bonus * (1 - p), 0, 1);
    else if (p === 0 && bonus > 0) p = clamp(bonus * 0.25, 0, 1);
    return p;
  }

  damageLossFactor(material, weaponId) {
    const mat = this.materials[material];
    return mat?.damageLoss?.[weaponId] ?? 0.7;
  }

  stageOf(seg) {
    const ratio = seg.hp / Math.max(1, seg.maxHp);
    if (seg.breached) return 'breach';
    if (ratio < 0.25) return 'critical';
    if (ratio < 0.6) return 'damaged';
    return 'intact';
  }

  stageCoverMult(seg) {
    return this.stageDefs?.[this.stageOf(seg)]?.coverMult ?? 1;
  }

  // Результат попадания пули/снаряда: что встретилось и что с этим стало.
  bulletRay(x1, y1, x2, y2, weaponId = 'rifle', rng = null) {
    if (!this.enabled()) return { blocked: false };
    this.stats.calls.ray++;
    let hit = null;
    for (const ref of this.refsNear((x1 + x2) / 2, (y1 + y2) / 2, dist(x1, y1, x2, y2) / 2 + 64)) {
      if (ref.kind === 'segment') {
        const seg = this.segStateOf(ref);
        if (seg && seg.breached) continue;
        const cross = Walls.segIntersect(x1, y1, x2, y2, ref.x1, ref.y1, ref.x2, ref.y2);
        if (!cross) {
          // тонкая стена: задевание считаем по честной дистанции между отрезками,
          // иначе соседний сегмент «съедает» пулю, летящую через проём рядом с торцом
          const near = Walls.closestBetween(x1, y1, x2, y2, ref.x1, ref.y1, ref.x2, ref.y2);
          if (near.d > ref.thickness / 2 + 1) continue;
          const hx = x1 + (x2 - x1) * near.t, hy = y1 + (y2 - y1) * near.t;
          if (!hit || near.t < hit.t) hit = { t: near.t, x: hx, y: hy, ref, seg, kind: 'segment' };
          continue;
        }
        if (!hit || cross.t < hit.t) hit = { t: cross.t, x: cross.x, y: cross.y, ref, seg, kind: 'segment' };
        continue;
      }
      const o = ref.opening;
      const cross = Walls.segIntersect(x1, y1, x2, y2, ref.x1, ref.y1, ref.x2, ref.y2);
      if (!cross) continue;
      const d = Walls.distPointSegment(cross.x, cross.y, ref.x1, ref.y1, ref.x2, ref.y2);
      if (d.d > 2) continue;
      if (!hit || cross.t < hit.t) hit = { t: cross.t, x: cross.x, y: cross.y, ref, opening: o, kind: 'opening' };
    }
    if (!hit) return { blocked: false };
    const b = this.world.buildings.find((bb) => bb.id === hit.ref.bid);
    if (hit.kind === 'opening') {
      const o = hit.opening;
      if (o.type === 'window' || o.type === 'breach') return { blocked: false, through: o.type };
      if (o.type === 'door' || o.type === 'gate') {
        if (this.doorOpen(hit.ref.bid, o.id)) return { blocked: false, through: o.type };
        return { blocked: true, breakDoor: true, opening: o, building: b, hitPoint: { x: hit.x, y: hit.y }, material: hit.ref.material, weaponId };
      }
      if (o.type === 'embrasure') {
        const chance = this.openingDefs.embrasure?.penetrationFactor ?? 0.15;
        const roll = rng ? rng.next() : Math.random();
        return roll < chance
          ? { blocked: false, through: 'embrasure' }
          : { blocked: true, through: 'embrasure', building: b, hitPoint: { x: hit.x, y: hit.y }, material: hit.ref.material, weaponId };
      }
      return { blocked: true, building: b, hitPoint: { x: hit.x, y: hit.y }, material: hit.ref.material, weaponId };
    }
    // сплошной сегмент: пробивание
    const seg = hit.seg;
    const stageKey = seg ? this.stageOf(seg) : 'intact';
    const chance = this.penetrationChance(hit.ref.material, weaponId, stageKey);
    const roll = rng ? rng.next() : Math.random();
    this.stats.hits++;
    if (roll < chance) {
      this.stats.penetrations++;
      return {
        blocked: false, penetrated: true, material: hit.ref.material, building: b,
        segId: hit.ref.segId, damageMult: this.damageLossFactor(hit.ref.material, weaponId),
        hitPoint: { x: hit.x, y: hit.y }, weaponId,
      };
    }
    this.stats.blockedShots++;
    return {
      blocked: true, material: hit.ref.material, building: b, segId: hit.ref.segId,
      hitPoint: { x: hit.x, y: hit.y }, weaponId, stage: stageKey,
    };
  }

  // Урон стене: урон по сегменту, стадии, пролом.
  damageSegment(building, segId, amount, weaponId = 'rifle') {
    if (!this.destructionEnabled()) return { ok: false };
    const st = this.state(building);
    if (!st || !segId) return { ok: false };
    const seg = st.segs.find((s) => s.id === segId);
    if (!seg || seg.breached) return { ok: false };
    const mat = this.materials[st.outline.spec?.material || 'wood'];
    const kind = this.cfg.weapon(weaponId)?.kind === 'shell' ? 'shell' : 'bullet';
    const mult = mat?.structural?.[kind] ?? 1;
    seg.hp -= amount * mult;
    if (seg.hp <= 0) {
      seg.hp = 0;
      seg.breached = true;
      this.stats.breaches++;
      this.reindex(building.id, st);
      this.invalidateCover(building);
      this.queueNavRebuild(building);
      building.hp = Math.max(1, building.hp - (building.maxHp || 100) * 0.12);
      this.game.events?.emit('wallBreach', { building, segId, t: this.game.time });
    }
    return { ok: true, stage: this.stageOf(seg), breached: seg.breached, hp: seg.hp };
  }

  // Снаряд/взрыв: достаётся ближайшему сегменту
  damageNearest(building, amount, fromX, fromY, weaponId = 'tank_cannon') {
    const st = this.state(building);
    if (!st) return { ok: false };
    let best = null, bd = Infinity;
    for (const s of st.segs) {
      if (s.breached) continue;
      const geo = st.outline.segments.find((g) => g.id === s.id);
      if (!geo) continue;
      const x = building.x + (geo.points[0][0] + geo.points[1][0]) / 2;
      const y = building.y + (geo.points[0][1] + geo.points[1][1]) / 2;
      const d = dist(x, y, fromX, fromY);
      if (d < bd) { bd = d; best = s; }
    }
    if (!best) return { ok: false };
    return this.damageSegment(building, best.id, amount, weaponId);
  }

  repair(building, amount) {
    const st = this.state(building);
    if (!st) return 0;
    let repaired = 0;
    for (const s of st.segs) {
      if (s.hp >= s.maxHp) continue;
      const need = s.maxHp - s.hp;
      const add = Math.min(need, amount);
      s.hp += add;
      amount -= add;
      repaired += add;
      if (s.breached && s.hp > 0) {
        s.breached = false;
        this.reindex(building.id, st);
        this.invalidateCover(building);
        this.queueNavRebuild(building);
      }
      if (amount <= 0) break;
    }
    return repaired;
  }

  // ---------- обзор ----------

  // true, если стены полностью перекрывают взгляд (окна и бойницы считаем частичными).
  blocksVision(x1, y1, x2, y2) {
    if (!this.enabled()) return false;
    for (const ref of this.refsNear((x1 + x2) / 2, (y1 + y2) / 2, dist(x1, y1, x2, y2) / 2 + 64)) {
      if (ref.kind === 'segment') {
        const seg = this.segStateOf(ref);
        if (seg && seg.breached) continue;
        if (!ref.blocksVision) continue;
        const cross = Walls.segIntersect(x1, y1, x2, y2, ref.x1, ref.y1, ref.x2, ref.y2);
        if (cross) return true;
        continue;
      }
      const o = ref.opening;
      const cross = Walls.segIntersect(x1, y1, x2, y2, ref.x1, ref.y1, ref.x2, ref.y2);
      if (!cross) continue;
      if (o.type === 'window' || o.type === 'breach') continue; // видно
      if (o.type === 'door' || o.type === 'gate') {
        if (this.doorOpen(ref.bid, o.id)) continue;
        return true;
      }
      if (o.type === 'door_closed') {
        if (!this.doorOpen(ref.bid, o.id)) return true;
        continue;
      }
      if (o.type === 'embrasure') return true;
    }
    return false;
  }

  // ---------- направленное укрытие ----------

  // Три луча от стрелка к цели: центр и две стороны. Считаем, какая доля перекрыта.
  coverAt(x, y, fromX, fromY) {
    if (!this.enabled()) return { value: 0, class: 0, full: false, partial: false };
    this.stats.calls.cover++;
    const key = `${Math.round(x / 12)},${Math.round(y / 12)},${Math.round(fromX / 24)},${Math.round(fromY / 24)}`;
    const now = this.game.time;
    const cached = this.coverCache.get(key);
    if (cached && now - cached.t < (this.dirCfg.cacheSeconds ?? 0.35)) return cached.value;
    this.stats.coverChecks++;
    const spread = this.dirCfg.raySpreadPx ?? 10;
    const ang = Math.atan2(y - fromY, x - fromX);
    const px = Math.cos(ang + Math.PI / 2) * spread;
    const py = Math.sin(ang + Math.PI / 2) * spread;
    const rays = [
      [x, y],
      [x + px, y + py],
      [x - px, y - py],
    ];
    let blockedCount = 0, classSum = 0;
    for (const [tx, ty] of rays) {
      const hit = this.coverRay(fromX, fromY, tx, ty);
      if (hit.blocked) { blockedCount++; classSum += hit.heightClass || 3; }
    }
    const share = blockedCount / rays.length;
    const avgClass = blockedCount ? classSum / blockedCount : 0;
    const stanceMult = this.stanceMult(avgClass);
    const value = clamp(share * (this.coverCfg[String(Math.round(avgClass))]?.stand ?? 0.8) * stanceMult, 0, 1);
    const result = {
      value,
      class: Math.round(avgClass),
      full: share >= 0.99,
      partial: share > 0 && share < 0.99,
      blockedCount,
    };
    this.coverCache.set(key, { t: now, value: result });
    if (this.coverCache.size > 4000) this.coverCache.clear();
    return result;
  }

  stanceMult(heightClass) {
    const cls = this.coverCfg[String(clamp(Math.round(heightClass), 1, 3))];
    if (!cls) return 1;
    // В нашей игре юнит всегда «стоит» в бою, приседание включается подавлением:
    // берём среднее стойка/присед и нормируем по лучшему классу, чтобы
    // высокая стена давала не меньше защиты, чем низкая (монотонность по классу).
    if (this._stanceBest === undefined) {
      let best = 0.001;
      for (const c of Object.values(this.coverCfg)) best = Math.max(best, ((c.stand ?? 0) + (c.crouch ?? 0)) / 2);
      this._stanceBest = best;
    }
    return clamp(((cls.stand + cls.crouch) / 2) / this._stanceBest, 0, 1);
  }

  coverRay(x1, y1, x2, y2) {
    let best = null;
    for (const ref of this.refsNear((x1 + x2) / 2, (y1 + y2) / 2, dist(x1, y1, x2, y2) / 2 + 64)) {
      if (ref.kind === 'segment') {
        const seg = this.segStateOf(ref);
        if (seg && seg.breached) continue;
        if (!ref.blocksVision && (ref.heightClass || 1) < 2) {
          // низкая стена: видно, но укрытие даёт
        }
        const cross = Walls.segIntersect(x1, y1, x2, y2, ref.x1, ref.y1, ref.x2, ref.y2);
        if (!cross) continue;
        if (!best || cross.t < best.t) {
          best = {
            t: cross.t, blocked: true,
            heightClass: (ref.heightClass || 2) * (this.stageCoverMult(ref.segId ? this.segStateOf(ref) || {} : {})),
            kind: 'wall', ref,
          };
        }
        continue;
      }
      const o = ref.opening;
      const cross = Walls.segIntersect(x1, y1, x2, y2, ref.x1, ref.y1, ref.x2, ref.y2);
      if (!cross) continue;
      if (o.type === 'window' || o.type === 'breach') continue;
      if ((o.type === 'door' || o.type === 'gate') && this.doorOpen(ref.bid, o.id)) continue;
      if (!best || cross.t < best.t) best = { t: cross.t, blocked: true, heightClass: 2, kind: o.type, ref };
    }
    return best || { blocked: false };
  }

  invalidateCover(building = null) {
    this.coverCache.clear();
    void building;
  }

  // Точки укрытия рядом (для ИИ и подсказок игроку)
  coverSpotsNear(x, y, radius = 200, faction = -1) {
    if (!this.enabled()) return []; // флаг off = прежнее поведение, без стеновых укрытий
    const spots = [];
    for (const [bid, st] of this.instances) {
      const b = this.world.buildings.find((bb) => bb.id === bid);
      if (!b || b.dead || !b.built) continue;
      if (Math.abs(b.x - x) > radius + 200 || Math.abs(b.y - y) > radius + 200) continue;
      if (faction >= 0 && b.faction >= 0 && b.faction !== faction && b.def?.category === 'point') continue;
      for (const p of st.outline.cover_points || []) {
        const px = b.x + p.x, py = b.y + p.y;
        const d = dist(x, y, px, py);
        if (d > radius) continue;
        spots.push({ x: px, y: py, nx: p.nx, ny: p.ny, heightClass: p.heightClass, kind: p.kind, building: b, d });
      }
    }
    spots.sort((a, b) => a.d - b.d);
    return spots.slice(0, 40);
  }

  garrisonSlotsNear(x, y, radius = 260) {
    if (!this.enabled()) return [];
    const slots = [];
    for (const [bid, st] of this.instances) {
      const b = this.world.buildings.find((bb) => bb.id === bid);
      if (!b || b.dead || !b.built) continue;
      if (dist(b.x, b.y, x, y) > radius) continue;
      for (const s of st.outline.garrison_slots || []) {
        slots.push({ ...s, x: b.x + s.x, y: b.y + s.y, building: b, d: dist(x, y, b.x + s.x, b.y + s.y) });
      }
    }
    slots.sort((a, b) => a.d - b.d);
    return slots.slice(0, 24);
  }

  // Точка внутри стенового ядра: слот у окна или внутренняя точка укрытия.
  interiorSpot(building, x, y) {
    const st = this.state(building);
    if (!st) return null;
    const hx = (st.outline.size || 64) / 2;
    const inside = Math.abs(x - building.x) < hx && Math.abs(y - building.y) < hx;
    if (!inside) return null;
    const slots = (st.outline.garrison_slots || []).map((sl) => ({ x: building.x + sl.x, y: building.y + sl.y, kind: 'window' }));
    const covers = (st.outline.cover_points || [])
      .filter((cp) => cp.kind === 'wall' && Math.abs(cp.x) < hx - 4 && Math.abs(cp.y) < hx - 4)
      .map((cp) => ({ x: building.x + cp.x, y: building.y + cp.y, kind: 'wall' }));
    const all = slots.concat(covers);
    if (!all.length) return null;
    all.sort((a, b) => dist(a.x, a.y, x, y) - dist(b.x, b.y, x, y));
    return all[0];
  }

  // Ближайшее здание со стенами, внутри которого точка
  buildingAtPoint(x, y) {
    if (!this.enabled()) return null;
    for (const [bid, st] of this.instances) {
      const b = this.world.buildings.find((bb) => bb.id === bid);
      if (!b || b.dead || !b.built) continue;
      const hx = (st.outline.size || 64) / 2;
      if (Math.abs(x - b.x) < hx && Math.abs(y - b.y) < hx) return b;
    }
    return null;
  }

  // Путевая точка «через проём»: если юнит и цель разделены стеной здания,
  // направление движения ведёт к ближайшей двери/воротам (обычный шаг, не телепорт).
  doorWaypoint(u, gx, gy) {
    if (!this.enabled() || !u) return null;
    const bU = this.buildingAtPoint(u.x, u.y);
    const bG = this.buildingAtPoint(gx, gy);
    let b = null;
    if (bU && bU !== bG) b = bU;        // надо выйти из своего здания
    else if (!bU && bG) b = bG;         // надо войти в здание цели
    if (!b) return null;
    const st = this.state(b);
    if (!st) return null;
    let best = null, bd = Infinity;
    for (const o of st.outline.openings || []) {
      if (o.type !== 'door' && o.type !== 'gate') continue;
      if (u.isVehicle && o.type !== 'gate') continue;
      const px = b.x + o.cx, py = b.y + o.cy;
      const cost = dist(u.x, u.y, px, py) + dist(px, py, gx, gy);
      if (cost < bd) { bd = cost; best = { x: px, y: py }; }
    }
    return best;
  }

  // ---------- двери ----------

  openDoor(building, openingId) {
    const st = this.state(building);
    if (!st) return { ok: false };
    const d = st.doors[openingId];
    if (!d) return { ok: false };
    if (d.state !== 'open') {
      d.state = 'open';
      d.closeAt = this.game.time + (this.budget.doorAutoCloseSeconds ?? 12);
      this.stats.doorsOpened++;
      this.queueNavRebuild(building);
      this.game.events?.emit('doorOpened', { building, openingId, t: this.game.time });
    }
    return { ok: true, state: d.state };
  }

  closeDoor(building, openingId) {
    const st = this.state(building);
    if (!st) return { ok: false };
    const d = st.doors[openingId];
    if (!d) return { ok: false };
    d.state = 'closed';
    d.closeAt = 0;
    this.queueNavRebuild(building);
    this.game.events?.emit('doorClosed', { building, openingId, t: this.game.time });
    return { ok: true, state: d.state };
  }

  toggleDoor(building, openingId) {
    const st = this.state(building);
    if (!st || !st.doors[openingId]) return { ok: false };
    return st.doors[openingId].state === 'open'
      ? this.closeDoor(building, openingId)
      : this.openDoor(building, openingId);
  }

  // Автооткрытие двери перед юнитом и авто-закрытие, если рядом никого.
  // Попадание в закрытую дверь: она ломается и становится проломом.
  breakDoorHit(building, opening, amount) {
    const st = this.state(building);
    if (!st || !opening) return { ok: false };
    const d = st.doors[opening.id];
    if (!d) return { ok: false };
    d.hp = (d.hp ?? opening.breakHp ?? 90) - amount;
    if (d.hp <= 0) {
      d.state = 'open';
      d.broken = true;
      d.closeAt = 0;
      this.queueNavRebuild(building);
      this.invalidateCover(building);
      this.game.events?.emit('doorBroken', { building, openingId: opening.id, t: this.game.time });
    }
    return { ok: true, broken: !!d.broken, hp: d.hp };
  }

  doorsForUnit(u) {
    if (!this.enabled()) return;
    const near = this.world.buildingGrid.query(u.x, u.y, 120);
    for (const b of near) {
      const st = this.state(b);
      if (!st) continue;
      for (const o of st.outline.openings || []) {
        if (o.type !== 'door' && o.type !== 'gate') continue;
        if (u.isVehicle && o.type !== 'gate') continue;
        if (dist(u.x, u.y, b.x + o.cx, b.y + o.cy) < (this.budget.doorOpenRadius ?? 48)) {
          this.openDoor(b, o.id);
        }
      }
    }
  }

  // Если в здании заперты свои (или любые) юниты — двери открыты принудительно.
  unseal() {
    for (const [bid, st] of this.instances) {
      const b = this.world.buildings.find((bb) => bb.id === bid);
      if (!b || b.dead) continue;
      const half = (st.outline.size || 64) / 2 + 8;
      let inside = 0;
      for (const u of this.game.units.values()) {
        if (!u.alive || u.downed) continue;
        if (Math.abs(u.x - b.x) < half && Math.abs(u.y - b.y) < half) { inside++; break; }
      }
      if (!inside) continue;
      for (const [oid, d] of Object.entries(st.doors)) {
        if (d.state === 'closed' && !d.broken) {
          d.state = 'open';
          d.closeAt = this.game.time + 6;
          this.queueNavRebuild(b);
        }
      }
    }
  }

  // ---------- навигация ----------

  queueNavRebuild(building) {
    this.navQueue.add(building.id);
  }

  flushNav() {
    if (!this.navQueue.size) return;
    let budget = this.budget.maxChunksPerFrame ?? 2;
    for (const id of [...this.navQueue]) {
      if (budget-- <= 0) break;
      this.navQueue.delete(id);
      this.world.rebuildNav();
      const b = this.world.buildings.find((bb) => bb.id === id);
      if (b) this.reindex(b.id, this.state(b));
    }
  }

  // ---------- сохранения ----------

  serialize() {
    const out = {};
    for (const [bid, st] of this.instances) {
      const b = this.world.buildings.find((bb) => bb.id === bid);
      if (!b) continue;
      out[`${b.type}:${Math.round(b.x)}:${Math.round(b.y)}`] = {
        segs: st.segs.map((s) => ({ id: s.id, hp: Math.round(s.hp), breached: !!s.breached })),
        doors: Object.fromEntries(Object.entries(st.doors).map(([k, v]) => [k, { state: v.state }])),
      };
    }
    return out;
  }

  applySaved(saved) {
    if (!saved) return 0;
    let restored = 0;
    for (const b of this.world.buildings) {
      if (b.dead || !b.built) continue;
      const key = `${b.type}:${Math.round(b.x)}:${Math.round(b.y)}`;
      const data = saved[key];
      const st = this.attach(b);
      if (!data || !st) continue;
      for (const s of data.segs || []) {
        const seg = st.segs.find((x) => x.id === s.id);
        if (!seg) continue;
        seg.hp = clamp(s.hp, 0, seg.maxHp);
        seg.breached = !!s.breached || seg.hp <= 0;
      }
      for (const [k, v] of Object.entries(data.doors || {})) {
        if (st.doors[k]) st.doors[k].state = v.state === 'open' ? 'open' : 'closed';
      }
      this.reindex(b.id, st);
      restored++;
    }
    this.invalidateCover();
    return restored;
  }

  // ---------- тик ----------

  update(dt) {
    if (!this.enabled()) return;
    const t0 = (typeof performance !== 'undefined' ? performance.now() : Date.now());
    this.stats.updates++;
    this._perfStart = t0;
    this.flushNav();
    this.doorTimer -= dt;
    if (this.doorTimer > 0) return;
    this.doorTimer = 1;
    const now = this.game.time;
    this.unseal();
    const anim = this.cfg.wallMaterials?.doorAnimSeconds ?? 0.35;
    for (const [bid, st] of this.instances) {
      const b = this.world.buildings.find((bb) => bb.id === bid);
      if (!b || b.dead) { this.instances.delete(bid); continue; }
      for (const [oid, d] of Object.entries(st.doors)) {
        // плавная анимация створки: 0 — закрыта, 1 — открыта
        const target = d.state === 'open' ? 1 : 0;
        const k = Math.min(1, dt / Math.max(0.05, anim));
        d.anim = d.anim === undefined ? target : d.anim + (target - d.anim) * k;
      }
      for (const [oid, d] of Object.entries(st.doors)) {
        if (d.state !== 'open' || !d.closeAt) continue;
        if (now < d.closeAt) continue;
        const o = st.outline.openings.find((x) => x.id === oid);
        const cx = b.x + (o?.cx || 0), cy = b.y + (o?.cy || 0);
        let occupied = false;
        // рядом с дверью или внутри здания кто-то есть — не запираем
        const half = (st.outline.size || 64) / 2 + 12;
        for (const u of this.game.units.values()) {
          if (!u.alive || u.downed) continue;
          if (dist(u.x, u.y, cx, cy) < 52) { occupied = true; break; }
          if (Math.abs(u.x - b.x) < half && Math.abs(u.y - b.y) < half) { occupied = true; break; }
        }
        if (!occupied) { d.state = 'closed'; d.closeAt = 0; this.queueNavRebuild(b); }
        else d.closeAt = now + 3;
      }
    }
    // сброс устаревшего кэша укрытий
    if (this.coverCache.size > 2000) this.coverCache.clear();
    const t1 = (typeof performance !== 'undefined' ? performance.now() : Date.now());
    this.stats.updateMs += t1 - (this._perfStart ?? t1);
  }

  // ---------- отладка ----------

  debugInfo() {
    const buildings = this.instances.size;
    let segs = 0, breached = 0, points = 0;
    for (const [, st] of this.instances) {
      segs += st.segs.length;
      breached += st.segs.filter((s) => s.breached).length;
      points += (st.outline.cover_points || []).length;
    }
    return { buildings, segs, breached, coverPoints: points, ...this.stats };
  }
}
