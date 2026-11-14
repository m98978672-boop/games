/**
 * Уравнения состояния точки (§33).
 *
 * Зачем это нужно: карта — график (X восток, Y север, H высота). Точка без уравнения
 * может «телепортироваться» — уехать на бесконечную координату из-за NaN/Infinity — и её
 * больше не найти ни в одном чанке. Здесь три вещи:
 *
 *   1. состояние точки — не только вектор: (pos, v, mode, heading, t, p);
 *   2. шаг интегрирования с инвариантом «|Δpos| ≤ vmax·Δt + 1 см» и откатом в lastGood;
 *   3. загрузка маршрута и выбор дороги: точки считаются, боты — другим символом и с весом.
 *
 * Единицы: метры и секунды. Мир — 640×480 км (§31.1), поэтому X ∈ [−320000; 320000] м.
 */
import { mulberry32, hashString } from "../core/rng.js";

/* ------------------------------------------------------------------ *
 * 1. Справочники: символы и режимы
 * ------------------------------------------------------------------ */

export const SYMBOLS = {
  A: { name: "агент", vmax: 1.4, p: 1.0, priority: 1 },   // человек пешком
  B: { name: "бот", vmax: 1.4, p: 0.25, priority: 0 },    // фоновая толпа
  V: { name: "машина", vmax: 33, p: 1.0, priority: 1 },
  T: { name: "грузовик", vmax: 25, p: 1.5, priority: 1 },
  P: { name: "поезд", vmax: 33, p: 3.0, priority: 2 },
  F: { name: "судно", vmax: 12, p: 2.0, priority: 2 },
  S: { name: "служба", vmax: 33, p: 2.5, priority: 3 },   // скорая, пожарные
  R: { name: "самолёт", vmax: 250, p: 5.0, priority: 2 },
  G: { name: "гость", vmax: 25, p: 1.2, priority: 1 },
  X: { name: "отладка", vmax: 0, p: 0, priority: 0 }
};

export const MODES = {
  rest: { vmax: 0, label: "покой" },
  think: { vmax: 0, label: "раздумье" },
  move: { vmax: null, label: "движение" },
  wait: { vmax: 0, label: "ожидание" },
  work: { vmax: 0, label: "работа" },
  ride: { vmax: 33, label: "поездка" },
  gone: { vmax: 0, label: "ушла" },
  fault: { vmax: 0, label: "сбой" }
};

export const WORLD = {
  xMin: -320000, xMax: 320000,   // X: запад…восток, км×1000
  yMin: -240000, yMax: 240000,   // Y: юг…север
  hMin: 0, hMax: 9000,           // h: 0 — море, до 9000 м (самолёты)
  maxStep: 0.1,                  // фиксированный шаг интегрирования, с
  eps: 0.01                      // допуск инварианта «не телепортируется», м
};

/* ------------------------------------------------------------------ *
 * 2. Точка и её состояние
 * ------------------------------------------------------------------ */

export function createPoint({ id, sym = "A", x = 0, y = 0, h = 0, mode = "rest", p } = {}) {
  if (!id) throw new Error("точке нужен id");
  if (!SYMBOLS[sym]) throw new Error(`неизвестный символ: ${sym}`);
  if (!MODES[mode]) throw new Error(`неизвестный режим: ${mode}`);
  if (![x, y, h].every(Number.isFinite)) throw new Error(`некорректная координата у ${id}: ${x},${y},${h}`);
  return {
    id,
    sym,
    pos: { x, y, h },
    v: { vx: 0, vy: 0 },
    mode,
    heading: 0,
    t: 0,
    p: p === undefined ? SYMBOLS[sym].p : p,
    edge: null,        // на каком ребре считается загрузка
    dir: "+",          // направление ребра
    target: null,      // куда идёт, {x, y}
    route: null,       // маршрут-цепочка, если едет
    errors: 0,
    lastGood: { x, y, h }
  };
}

export const speedOf = (p) => Math.hypot(p.v.vx, p.v.vy);

export function vmaxOf(point, opts = {}) {
  const symMax = SYMBOLS[point.sym].vmax;
  const modeMax = MODES[point.mode] ? MODES[point.mode].vmax : null;
  if (modeMax === 0) return 0;
  let v = modeMax === null ? symMax : Math.min(symMax, modeMax);
  const k = opts.surface === "rain" ? 0.7 : opts.surface === "snow" ? 0.5 : 1;
  return v * k;
}

export function isFiniteState(p) {
  return [p.pos.x, p.pos.y, p.pos.h, p.v.vx, p.v.vy, p.heading].every(Number.isFinite);
}

export const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);

export function azimuth(point) {
  const { vx, vy } = point.v;
  if (Math.hypot(vx, vy) < 0.1) return point.heading;   // нулевой вектор курс не меняет
  return ((Math.atan2(vx, vy) * 180) / Math.PI + 360) % 360;
}

/** Прогноз позиции: pos + v·t. Нужен для столкновений и для загрузки дорог. */
export function predict(point, seconds) {
  const s = Math.max(0, Number(seconds) || 0);
  return { x: point.pos.x + point.v.vx * s, y: point.pos.y + point.v.vy * s, h: point.pos.h };
}

/* ------------------------------------------------------------------ *
 * 3. Шаг интегрирования и инвариант «точка не телепортируется»
 * ------------------------------------------------------------------ */

export function setMode(point, mode, { why = "", now = point.t } = {}) {
  if (!MODES[mode]) throw new Error(`неизвестный режим: ${mode}`);
  const from = point.mode;
  point.mode = mode;
  if (MODES[mode].vmax === 0) { point.v.vx = 0; point.v.vy = 0; }
  if (mode === "think") {
    const rnd = mulberry32(hashString(`${point.id}|think|${Math.round(now * 10)}`));
    point.reaction = 0.4 + rnd() * 2.6;              // 0.4…3.0 с (§33.2)
    point.thinkUntil = now + point.reaction;
  } else {
    point.reaction = 0;
    point.thinkUntil = null;
  }
  return { cmd: "setMode", point: point.id, from, to: mode, why, t: now };
}

/**
 * Один шаг уравнения.
 *
 * @returns {{ok:boolean, reason?:string, clamped?:boolean, moved:number}}
 *   ok=false — шаг отменён, позиция откатилась в lastGood (телепорт/NaN).
 */
export function stepPoint(point, dt, opts = {}) {
  if (!MODES[point.mode]) throw new Error(`неизвестный режим: ${point.mode}`);
  if (point.mode === "gone") return { ok: true, moved: 0 };

  const h = Math.min(Math.max(0, Number(dt) || 0), 0.5);
  const vmax = vmaxOf(point, opts);

  /* раздумье: стоит, но может «додумать» и сменить режим — само, без диспетчера */
  if (point.mode === "think") {
    point.t += h;
    if (point.thinkUntil !== null && point.t >= point.thinkUntil && opts.onThinkDone) {
      opts.onThinkDone(point);
    }
    return { ok: true, moved: 0 };
  }

  /* покой / ожидание / работа: позиция заморожена, время идёт */
  if (vmax === 0) {
    point.v.vx = 0;
    point.v.vy = 0;
    point.t += h;
    point.lastGood = { ...point.pos };
    return { ok: true, moved: 0 };
  }

  /* инвариант до шага: точка не может оказаться далеко от своей последней верной позиции
   * (это ловит и телепорт, и внешнюю запись координаты в обход уравнения) */
  const drift = Math.hypot(
    point.pos.x - point.lastGood.x,
    point.pos.y - point.lastGood.y,
    point.pos.h - point.lastGood.h
  );
  if (!Number.isFinite(drift) || drift > vmax * h + WORLD.eps) {
    point.pos = { ...point.lastGood };
    point.v = { vx: 0, vy: 0 };
    point.errors += 1;
    point.mode = point.errors >= 3 ? "fault" : "think";
    return { ok: false, reason: "teleport-blocked", moved: drift };
  }

  const vx = clamp(point.v.vx, -vmax, vmax);
  const vy = clamp(point.v.vy, -vmax, vmax);
  const next = { x: point.pos.x + vx * h, y: point.pos.y + vy * h, h: point.pos.h };
  const moved = Math.hypot(next.x - point.pos.x, next.y - point.pos.y);

  /* инвариант «не телепортируется» (§33.3, R-33.6) */
  if (!Number.isFinite(moved) || moved > vmax * h + WORLD.eps) {
    point.pos = { ...point.lastGood };
    point.v = { vx: 0, vy: 0 };
    point.errors += 1;
    point.mode = point.errors >= 3 ? "fault" : "think";
    return { ok: false, reason: "teleport-blocked", moved };
  }

  /* защита от NaN/Infinity (§33.7) */
  if (![next.x, next.y, next.h, vx, vy].every(Number.isFinite)) {
    point.pos = { ...point.lastGood };
    point.v = { vx: 0, vy: 0 };
    point.errors += 1;
    point.mode = "think";
    return { ok: false, reason: "non-finite", moved };
  }

  let clamped = false;
  const cx = clamp(next.x, WORLD.xMin, WORLD.xMax);
  const cy = clamp(next.y, WORLD.yMin, WORLD.yMax);
  const ch = clamp(next.h, WORLD.hMin, WORLD.hMax);
  if (cx !== next.x || cy !== next.y || ch !== next.h) clamped = true;

  point.pos = { x: cx, y: cy, h: ch };
  point.v = { vx, vy };
  point.heading = azimuth(point);
  point.t += h;
  point.errors = 0;
  point.lastGood = { ...point.pos };
  return { ok: true, moved, clamped };
}

/* ------------------------------------------------------------------ *
 * 4. Загрузка ребра
 * ------------------------------------------------------------------ */

export function bpr(rho, freeSpeed, { alpha = 0.15, beta = 4 } = {}) {
  const r = Math.max(0, Number(rho) || 0);
  return freeSpeed / (1 + alpha * Math.pow(r, beta));
}

export function makeRoad({ id, from, to, length, capacity, freeSpeed = 60 / 3.6, name = "" }) {
  return { id, from, to, length, capacity, freeSpeed, name, fwd: 0, back: 0 };
}

/* ------------------------------------------------------------------ *
 * 5. Диспетчер: только команды, никакого setPosition
 * ------------------------------------------------------------------ */

const ALLOWED = new Set(["setMode", "assignRoute", "setTarget", "setPriority", "spawn", "despawn", "reroute"]);

export class Dispatcher {
  constructor({ alpha = 0.15, beta = 4, saturated = 0.95 } = {}) {
    this.points = new Map();
    this.roads = new Map();
    this.journal = [];
    this.alpha = alpha;
    this.beta = beta;
    this.saturated = saturated;
    this.clock = 0;
    this.teleports = 0;
  }

  addRoad(road) {
    this.roads.set(road.id, road);
    return road;
  }

  road(id) {
    const r = this.roads.get(id);
    if (!r) throw new Error(`нет ребра ${id}`);
    return r;
  }

  addPoint(point) {
    this.points.set(point.id, point);
    if (point.edge) this._load(point, +1);
    return point;
  }

  _load(point, sign) {
    const road = this.roads.get(point.edge);
    if (!road) return;
    if (point.dir === "-") road.back = Math.max(0, road.back + sign * point.p);
    else road.fwd = Math.max(0, road.fwd + sign * point.p);
  }

  _journal(rec) {
    if (!rec.why) throw new Error("закон объяснимости: у команды нет why (R-33.23.7)");
    this.journal.push(rec);
    if (this.journal.length > 2000) this.journal.shift();
    return rec;
  }

  /** Единственный вход для приказов. setPosition не существует — и не должен (§33.7). */
  command(pointId, cmd, args = {}, why = "") {
    if (!ALLOWED.has(cmd)) throw new Error(`команда запрещена: ${cmd}`);
    const point = this.points.get(pointId);
    if (!point) throw new Error(`нет точки ${pointId}`);
    const t = this.clock;

    switch (cmd) {
      case "setMode":
        return this._journal(setMode(point, args.mode, { why, now: t }));
      case "setPriority": {
        const from = point.p;
        point.p = args.p;
        return this._journal({ cmd, point: pointId, from, to: args.p, why, t });
      }
      case "setTarget": {
        point.target = { ...args.target };
        point.mode = "move";
        const dx = point.target.x - point.pos.x;
        const dy = point.target.y - point.pos.y;
        const len = Math.hypot(dx, dy);
        const speed = vmaxOf(point) * 0.9;
        point.v = len < 1e-6 ? { vx: 0, vy: 0 } : { vx: (dx / len) * speed, vy: (dy / len) * speed };
        return this._journal({ cmd, point: pointId, to: point.target, why, t });
      }
      case "assignRoute": {
        point.route = args.route ? args.route.slice() : null;
        if (args.edge) {
          this._load(point, -1);
          point.edge = args.edge;
          point.dir = args.dir || "+";
          this._load(point, +1);
        }
        return this._journal({ cmd, point: pointId, route: point.route, edge: point.edge, why, t });
      }
      case "reroute": {
        point.mode = "think";
        return this._journal({ cmd, point: pointId, to: args.route || null, why, t });
      }
      case "spawn": {
        const np = createPoint({ id: args.id, sym: args.sym || "B", x: args.x, y: args.y, h: args.h || 0, mode: "move" });
        this.points.set(np.id, np);
        return this._journal({ cmd, point: np.id, why, t });
      }
      case "despawn": {
        this._load(point, -1);
        point.mode = "gone";
        point.edge = null;
        return this._journal({ cmd, point: pointId, why, t });
      }
      default:
        throw new Error(`команда не реализована: ${cmd}`);
    }
  }

  /** ρ ребра в направлении +/-: сумма весов точек, включая ботов. */
  load(edgeId, dir = "+") {
    const road = this.road(edgeId);
    const raw = dir === "-" ? road.back : road.fwd;
    return raw / road.capacity;
  }

  /** Полный пересчёт — только для теста и для сверки с инкрементальным. */
  recount(edgeId, dir = "+") {
    let sum = 0;
    for (const p of this.points.values()) {
      if (p.edge === edgeId && p.dir === dir && p.mode !== "gone") sum += p.p;
    }
    return sum / this.road(edgeId).capacity;
  }

  vEff(edgeId, dir = "+", road = null) {
    const r = road || this.road(edgeId);
    return bpr(this.load(edgeId, dir), r.freeSpeed, { alpha: this.alpha, beta: this.beta });
  }

  travelTime(edgeId, dir = "+") {
    const r = this.road(edgeId);
    return r.length / Math.max(0.1, this.vEff(edgeId, dir, r));
  }

  /**
   * Маршрут с минимальной обобщённой стоимостью (§33.6, R-33.19).
   * Граф маленький (ребра дорог), поэтому Дейкстра по узлам — это дёшево.
   * Ничья решается по id ребра, чтобы выбор был воспроизводимым.
   */
  chooseRoute(from, to, { penalty = 0 } = {}) {
    const edges = [...this.roads.values()];
    const dist = new Map([[from, 0]]);
    const prev = new Map();
    const used = new Set();

    while (true) {
      let bestNode = null;
      let best = Infinity;
      for (const [node, d] of dist) {
        if (used.has(node)) continue;
        if (d < best) { best = d; bestNode = node; }
      }
      if (bestNode === null) break;
      if (bestNode === to) break;
      used.add(bestNode);

      for (const e of edges) {
        let next = null;
        if (e.from === bestNode) next = e.to;
        else if (e.to === bestNode) next = e.from;
        if (next === null) continue;
        const rho = this.load(e.id);
        const cost = e.length / Math.max(0.1, bpr(rho, e.freeSpeed, { alpha: this.alpha, beta: this.beta }))
          + (rho > this.saturated ? penalty : 0);
        const cand = best + cost + Number(e.id.replace(/\D/g, "")) * 1e-9;  // ничья → меньший id
        if (cand < (dist.get(next) ?? Infinity)) {
          dist.set(next, cand);
          prev.set(next, { edge: e.id, node: bestNode });
        }
      }
    }

    if (!dist.has(to)) return null;
    const route = [];
    let cur = to;
    while (cur !== from) {
      const step = prev.get(cur);
      if (!step) return null;
      route.push(step.edge);
      cur = step.node;
    }
    return route.reverse();
  }

  /** Шаг мира: все точки, потом — решения по перегруженным рёбрам. */
  tick(dt) {
    const h = Math.min(Math.max(0, Number(dt) || 0), 0.5);
    let blocked = 0;
    for (const p of this.points.values()) {
      if (p.mode === "gone") continue;
      const r = stepPoint(p, h);
      if (!r.ok) {
        blocked += 1;
        this.teleports += 1;
        this._journal({ cmd: "guard", point: p.id, reason: r.reason, why: "уравнение поймало скачок" });
      }
      /* дошёл до конца ребра — снимаем загрузку и встаём */
      if (p.edge && p.route && p.route.length === 1 && p.mode === "move") {
        const edge = this.road(p.edge);
        if (!p.startedAt) p.startedAt = this.clock;
        if (this.clock - p.startedAt >= edge.length / Math.max(0.1, this.vEff(edge.id, p.dir, edge))) {
          this._load(p, -1);
          p.edge = null;
          p.route = null;
          p.mode = "rest";
          this._journal({ cmd: "arrive", point: p.id, why: "дошёл до конца ребра" });
        }
      }
    }
    this.clock += h;

    /* перегруз: у кого ρ > saturated — в раздумье с перемаршрутом */
    for (const road of this.roads.values()) {
      for (const dir of ["+", "-"]) {
        if (this.load(road.id, dir) <= this.saturated) continue;
        const victims = [...this.points.values()].filter(
          (p) => p.edge === road.id && p.dir === dir && p.mode === "move"
        ).slice(0, 2);
        for (const v of victims) {
          this.command(v.id, "reroute", { route: null }, `ребро ${road.id} загружено ${this.load(road.id, dir).toFixed(2)}`);
        }
      }
    }
    return { blocked, points: this.points.size, clock: this.clock };
  }

  stats() {
    const bySym = {};
    for (const p of this.points.values()) bySym[p.sym] = (bySym[p.sym] || 0) + 1;
    return { points: this.points.size, bySym, teleports: this.teleports, clock: this.clock };
  }
}
