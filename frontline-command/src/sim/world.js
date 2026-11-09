// Мир: рельеф, гексагональные сектора, ключевые точки, постройки, проходимость и видимость.
import { RNG } from '../core/rng.js';
import { hexCenter, pixelToHex, hexDistance, hexNeighbors, clamp, dist, angleDiff } from '../core/mathx.js';
import { SpatialHash } from '../core/spatial.js';

export const T_GRASS = 0, T_DIRT = 1, T_FOREST = 2, T_WATER = 3, T_ROAD = 4, T_CITY = 5;

function hash2(x, y, seed) {
  let h = x * 374761393 + y * 668265263 + seed * 1442695040888963407;
  h = (h ^ (h >>> 13)) * 1274126177;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}
function valueNoise(x, y, seed) {
  const ix = Math.floor(x), iy = Math.floor(y), fx = x - ix, fy = y - iy;
  const ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy);
  const a = hash2(ix, iy, seed), b = hash2(ix + 1, iy, seed);
  const c = hash2(ix, iy + 1, seed), d = hash2(ix + 1, iy + 1, seed);
  return (a + (b - a) * ux) * (1 - uy) + (c + (d - c) * ux) * uy;
}
function fbm(x, y, seed, oct = 3) {
  let v = 0, amp = 0.55, f = 1;
  for (let i = 0; i < oct; i++) { v += valueNoise(x * f, y * f, seed + i * 91) * amp; amp *= 0.5; f *= 2; }
  return v;
}

export class World {
  constructor(cfg, seed = 1) {
    this.cfg = cfg;
    this.rng = new RNG(seed);
    this.W = cfg.sectors.map.width;
    this.H = cfg.sectors.map.height;
    this.T = cfg.sectors.map.tile;
    this.cols = Math.floor(this.W / this.T);
    this.rows = Math.floor(this.H / this.T);
    const n = this.cols * this.rows;
    this.terrain = new Uint8Array(n);
    this.walk = new Uint8Array(n);
    // Рельеф и наследуемые препятствия без грубой растеризации стен.
    this.baseWalk = new Uint8Array(n);
    this.losBlock = new Uint8Array(n);
    this.solidBlock = new Uint8Array(n);
    this.buildings = [];
    this.buildingGrid = new SpatialHash(128, this.W, this.H);
    this.nextBuildingId = 1;
    this.events = [];
    this.sectors = this._buildSectors();
    this.points = this._buildPoints();
    // «домашняя» принадлежность точки не меняется никогда — по ней считаются победа и ключевые города
    for (const p of this.points) p.home = p.owner;
    this._generateTerrain();
    this._buildPointStructures();
    this.rebuildNav();
  }

  // ---------- гексагональные сектора ----------
  _buildSectors() {
    const { hex, names } = this.cfg.sectors;
    const list = [];
    const index = new Map();
    for (let r = 0; r < hex.rows; r++) {
      for (let q = 0; q < hex.cols; q++) {
        const c = hexCenter(q, r, hex.size, hex.originX, hex.originY);
        // сектора за пределами карты не нужны: они пустые и мешают фронту
        if (c.x < 0 || c.y < 0 || c.x > this.W || c.y > this.H) continue;
        const s = {
          id: list.length, q, r, cx: c.x, cy: c.y,
          name: names[list.length % names.length],
          influence: 0, owner: -1, target: 0,
          neighbors: [], points: [], units: [0, 0], strength: [0, 0],
          supplied: [1, 1],
        };
        list.push(s);
        index.set(q + ',' + r, s);
      }
    }
    for (const s of list) {
      for (const nb of hexNeighbors(s.q, s.r)) {
        const n = index.get(nb.q + ',' + nb.r);
        if (n) s.neighbors.push(n.id);
      }
    }
    return list;
  }

  sectorAt(x, y) {
    const { hex } = this.cfg.sectors;
    const { q, r } = pixelToHex(x, y, hex.size, hex.originX, hex.originY);
    return this.sectors.find((s) => s.q === q && s.r === r) || null;
  }
  sectorById(id) { return this.sectors[id] || null; }
  sectorDistance(a, b) {
    if (!a || !b) return 99;
    return hexDistance(a.q, a.r, b.q, b.r);
  }

  // ---------- точки ----------
  _buildPoints() {
    return this.cfg.sectors.points.map((p, i) => {
      const b = this.cfg.buildings[p.type === 'city' ? 'city' : p.type];
      return {
        id: p.id, index: i, name: p.name, type: p.type, x: p.x, y: p.y,
        owner: p.owner, key: !!p.key,
        radius: { hq: 160, city: 140, depot: 120, factory: 120, farm: 95, bridge: 85 }[p.type] || 110,
        hp: b ? b.hp : 500, maxHp: b ? b.hp : 500,
        capture: 0, capturer: -1, structure: null,
        supplied: [1, 1], supplyTimer: 0, lastOwnerChange: 0,
      };
    });
  }

  _buildPointStructures() {
    for (const p of this.points) {
      const b = this.addBuilding({
        type: p.type === 'city' ? 'city' : p.type, faction: p.owner,
        x: p.x, y: p.y, pointId: p.id, instant: true,
      });
      p.structure = b;
      p.structure.point = p;
    }
  }

  // ---------- генерация рельефа ----------
  _generateTerrain() {
    const { terrain: tc, river, roads } = this.cfg.sectors;
    const seeds = [tc.seed, tc.seed + 17, tc.seed + 53];
    for (let cy = 0; cy < this.rows; cy++) {
      for (let cx = 0; cx < this.cols; cx++) {
        const i = cx + cy * this.cols;
        // Рельеф симметричен относительно центра карты (поворот на 180°):
        // обе стороны играют в одинаковых условиях — правило §23 «симметрия».
        const sx = Math.min(cx, this.cols - 1 - cx), sy = Math.min(cy, this.rows - 1 - cy);
        const fx = sx / 14, fy = sy / 14;
        const n = fbm(fx, fy, seeds[0], 3);
        const d = fbm(fx * 0.7 + 40, fy * 0.7 - 20, seeds[1], 2);
        this.terrain[i] = n > 0.66 ? T_FOREST : d > 0.63 ? T_DIRT : T_GRASS;
      }
    }
    // река (симметричная относительно центра карты).
    // Важно: строка тайлов считается по ЦЕНТРУ строки, а не шагом 8 px — иначе зеркальные
    // шаги попадают в соседнюю строку и река получается несимметричной (было 3.3% тайлов).
    const halfH = this.H / 2;
    const half = river.width / 2;
    for (let j = 0; j < this.rows; j++) {
      const y = j * this.T + this.T / 2;
      const yy = y <= halfH ? y : this.H - y;
      const rxUpper = river.baseX + river.amplitude * Math.sin(yy / river.period + river.phase);
      const rx = y <= halfH ? rxUpper : this.W - rxUpper;
      const i0 = this._tile(rx - half) - 1;
      const i1 = this._tile(rx + half) + 1;
      for (let i = i0; i <= i1; i++) {
        if (i < 0 || i >= this.cols) continue;
        const d = Math.abs((i + 0.5) * this.T - rx);
        if (d <= half) this.terrain[i + j * this.cols] = T_WATER;
        else if (d <= half + 12) this.terrain[i + j * this.cols] = T_DIRT;
      }
    }
    // площади городов и штабов
    for (const p of this.points) {
      if (['city', 'hq', 'depot', 'factory'].includes(p.type)) this._paintCircle(p.x, p.y, p.type === 'hq' ? 260 : 200, T_CITY);
      else if (p.type === 'farm') this._paintCircle(p.x, p.y, 110, T_DIRT);
    }
    // дороги (проходят через мосты) + их зеркальные копии для симметрии
    for (const road of roads) {
      for (let i = 1; i < road.length; i++) this._road(road[i - 1], road[i]);
      for (let i = 1; i < road.length; i++) {
        this._road([this.W - road[i - 1][0], this.H - road[i - 1][1]], [this.W - road[i][0], this.H - road[i][1]]);
      }
    }
    // проходимость
    for (let i = 0; i < this.terrain.length; i++) {
      this.walk[i] = this.terrain[i] === T_WATER ? 0 : 1;
      this.losBlock[i] = this.terrain[i] === T_FOREST ? 1 : 0;
      this.solidBlock[i] = 0;
    }
  }

  _idx(x, y) {
    const cx = clamp(Math.floor(x / this.T), 0, this.cols - 1);
    const cy = clamp(Math.floor(y / this.T), 0, this.rows - 1);
    return cx + cy * this.cols;
  }
  terrainAt(x, y) { return this.terrain[this._idx(x, y)]; }
  // Индекс тайла, согласованный с зеркалом карты: при координатах, кратных T, floor() даёт сдвиг
  // на тайл — объект ровно на границе тайлов (город в центре карты) красился несимметрично.
  _tile(v) { return Math.ceil(v / this.T) - 1; }
  _paint(x, y, type, radius = 0) {
    const r = Math.floor(radius / this.T);
    const cx = this._tile(x), cy = this._tile(y);
    for (let j = cy - r; j <= cy + r; j++) for (let i = cx - r; i <= cx + r; i++) {
      if (i < 0 || j < 0 || i >= this.cols || j >= this.rows) continue;
      this.terrain[i + j * this.cols] = type;
    }
  }
  _paintCircle(x, y, radius, type) {
    const r = Math.ceil(radius / this.T);
    const cx = this._tile(x), cy = this._tile(y);
    for (let j = cy - r; j <= cy + r; j++) for (let i = cx - r; i <= cx + r; i++) {
      if (i < 0 || j < 0 || i >= this.cols || j >= this.rows) continue;
      const dx = (i + 0.5) * this.T - x, dy = (j + 0.5) * this.T - y;
      if (dx * dx + dy * dy <= radius * radius) this.terrain[i + j * this.cols] = type;
    }
  }
  _road(a, b) {
    const d = dist(a[0], a[1], b[0], b[1]);
    const steps = Math.max(1, Math.ceil(d / 12));
    for (let s = 0; s <= steps; s++) {
      const t = s / steps;
      const x = a[0] + (b[0] - a[0]) * t, y = a[1] + (b[1] - a[1]) * t;
      const cx = this._tile(x), cy = this._tile(y);
      for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) {
        const xx = cx + i, yy = cy + j;
        if (xx < 0 || yy < 0 || xx >= this.cols || yy >= this.rows) continue;
        const k = xx + yy * this.cols;
        // воду и площади городов дорога не перекрывает: иначе стык «дорога/город»
        // растеризуется по-разному с зеркалом и карта перестаёт быть симметричной
        if (this.terrain[k] === T_WATER || this.terrain[k] === T_CITY) continue;
        this.terrain[k] = T_ROAD;
      }
    }
  }

  // ---------- постройки ----------
  addBuilding({ type, faction = -1, x, y, pointId = null, instant = false, blueprint = false, progress = 0 }) {
    const def = this.cfg.building(type);
    if (!def) throw new Error('unknown building ' + type);
    const isPoint = !!def.pointType;
    const w = type === 'bridge' ? 176 : def.size;
    const h = type === 'bridge' ? 88 : def.size;
    const b = {
      id: this.nextBuildingId++, type, faction, x, y, w, h,
      hp: instant ? def.hp : Math.max(1, def.hp * 0.05),
      maxHp: def.hp, def, cover: def.cover || 0,
      progress: instant ? 1 : progress, built: !!instant,
      blueprint: !!blueprint, pointId, dead: false,
      builders: 0, lastHit: -99, occupants: 0,
      infra: isPoint,
    };
    this.buildings.push(b);
    this.buildingGrid.insert(b);
    if (pointId) {
      const p = this.points.find((q) => q.id === pointId);
      if (p) { b.point = p; if (instant) p.hp = b.hp; }
    }
    if (type === 'bridge' && !b.dead) this._markBridge(b, true);
    this.rebuildNav();
    return b;
  }

  buildingAtPoint(pointId) { return this.buildings.find((b) => b.pointId === pointId && !b.dead); }

  _markBridge(b, passable) {
    const cellsX = Math.ceil(b.w / this.T), cellsY = Math.ceil(b.h / this.T);
    const cx = this._tile(b.x), cy = this._tile(b.y);
    for (let j = -Math.floor(cellsY / 2); j <= Math.floor(cellsY / 2); j++) {
      for (let i = -Math.floor(cellsX / 2); i <= Math.floor(cellsX / 2); i++) {
        const x = cx + i, y = cy + j;
        if (x < 0 || y < 0 || x >= this.cols || y >= this.rows) continue;
        const k = x + y * this.cols;
        if (this.terrain[k] !== T_WATER) continue;
        if (passable) this.walk[k] = 1;
      }
    }
  }

  rebuildNav() {
    this.navVersion = (this.navVersion || 0) + 1;
    // Проходимость = рельеф (вода непроходима) + мосты + застройка.
    for (let i = 0; i < this.terrain.length; i++) {
      this.walk[i] = this.terrain[i] === T_WATER ? 0 : 1;
    }
    const wallsOn = !!(this.walls && this.walls.enabled && this.walls.enabled());
    for (const b of this.buildings) {
      if (b.dead) continue;
      if (b.type === 'bridge') { this._markBridge(b, true); continue; }
      if (!b.built) continue;
      // Стены v2: непроходимость задают сегменты стен (ниже), а не весь контур здания.
      if (wallsOn && this.walls.state(b)) continue;
      // Точки (штаб, город, склад, фабрика, ферма) — это районы, по ним можно ходить.
      if (b.def?.category === 'point') continue;
      // Из укреплений дорогу перекрывает только бункер: мешки, окопы и проволока — укрытия,
      // вокруг которых пехота проходит (иначе отряды запирают себя же построенной обороной).
      if (b.type !== 'bunker') continue;
      const halfW = b.w / 2, halfH = b.h / 2;
      const cx0 = this._tile(b.x - halfW), cx1 = this._tile(b.x + halfW);
      const cy0 = this._tile(b.y - halfH), cy1 = this._tile(b.y + halfH);
      for (let y = cy0; y <= cy1; y++) for (let x = cx0; x <= cx1; x++) {
        if (x < 0 || y < 0 || x >= this.cols || y >= this.rows) continue;
        this.walk[x + y * this.cols] = 0;
      }
    }
    // Сохраняем рельеф отдельно: точная коллизия стен проверяется сегментами.
    this.baseWalk.set(this.walk);
    // Стены зданий: блокируем тайлы вдоль сегментов, проёмы-двери оставляем проходимыми.
    if (wallsOn) this._markWallTiles();
    // LOS: лес + крупные постройки
    for (let i = 0; i < this.terrain.length; i++) this.losBlock[i] = this.terrain[i] === T_FOREST ? 1 : 0;
    this.solidBlock.fill(0);
    for (const b of this.buildings) {
      if (b.dead || !b.built) continue;
      // Пули и взгляд блокируют только тяжёлые бункеры: остальное — укрытия, а не стены.
      if (b.type !== 'bunker') continue;
      const halfW = b.w / 2, halfH = b.h / 2;
      const cx0 = this._tile(b.x - halfW), cx1 = this._tile(b.x + halfW);
      const cy0 = this._tile(b.y - halfH), cy1 = this._tile(b.y + halfH);
      for (let y = cy0; y <= cy1; y++) for (let x = cx0; x <= cx1; x++) {
        if (x < 0 || y < 0 || x >= this.cols || y >= this.rows) continue;
        this.losBlock[x + y * this.cols] = 1;
        this.solidBlock[x + y * this.cols] = 1;
      }
    }
  }

  // Тайлы вдоль сегментов стен: движение и навигация видят стены, проёмы — нет.
  _markWallTiles(bounds = null) {
    const pad = 6;
    for (const b of this.buildings) {
      if (b.dead || !b.built) continue;
      const st = this.walls.state(b);
      if (!st) continue;
      const markSeg = (x1, y1, x2, y2, thickness) => {
        const r = thickness / 2 + pad;
        const minX = Math.min(x1, x2) - r, maxX = Math.max(x1, x2) + r;
        const minY = Math.min(y1, y2) - r, maxY = Math.max(y1, y2) + r;
        const cx0 = bounds ? Math.max(this._tile(minX), bounds.x0) : this._tile(minX);
        const cx1 = bounds ? Math.min(this._tile(maxX), bounds.x1) : this._tile(maxX);
        const cy0 = bounds ? Math.max(this._tile(minY), bounds.y0) : this._tile(minY);
        const cy1 = bounds ? Math.min(this._tile(maxY), bounds.y1) : this._tile(maxY);
        for (let cy = cy0; cy <= cy1; cy++) {
          for (let cx = cx0; cx <= cx1; cx++) {
            if (cx < 0 || cy < 0 || cx >= this.cols || cy >= this.rows) continue;
            const px = (cx + 0.5) * this.T, py = (cy + 0.5) * this.T;
            const dx = x2 - x1, dy = y2 - y1;
            const len2 = dx * dx + dy * dy || 1;
            let t = ((px - x1) * dx + (py - y1) * dy) / len2;
            t = clamp(t, 0, 1);
            const d = Math.hypot(px - (x1 + dx * t), py - (y1 + dy * t));
            if (d <= r) this.walk[cx + cy * this.cols] = 0;
          }
        }
      };
      for (const geo of st.outline.segments) {
        if (!geo.blocksMove) continue;
        const seg = st.segs.find((x) => x.id === geo.id);
        if (seg && seg.breached) continue;
        markSeg(b.x + geo.points[0][0], b.y + geo.points[0][1], b.x + geo.points[1][0], b.y + geo.points[1][1], geo.thickness);
      }
      for (const o of st.outline.openings || []) {
        const door = st.doors[o.id];
        const passable = (o.type === 'door' || o.type === 'gate') && door && door.state === 'open';
        if (passable) continue;
        if (o.type === 'breach') continue;
        markSeg(b.x + o.p1[0], b.y + o.p1[1], b.x + o.p2[0], b.y + o.p2[1], st.outline.thickness || 12);
      }
    }
  }

  // Только геометрия стен/дверей: базовый рельеф и маски LOS не менялись.
  // Для всех остальных изменений по-прежнему обязателен полный rebuildNav.
  rebuildWallTiles(b, st) {
    if (!b || !st || b.dead || !b.built || !this.walls?.enabled()) return null;
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    const include = (p1, p2, thickness) => {
      const r = thickness / 2 + 6; // те же границы, что в _markWallTiles
      minX = Math.min(minX, b.x + p1[0] - r, b.x + p2[0] - r);
      maxX = Math.max(maxX, b.x + p1[0] + r, b.x + p2[0] + r);
      minY = Math.min(minY, b.y + p1[1] - r, b.y + p2[1] - r);
      maxY = Math.max(maxY, b.y + p1[1] + r, b.y + p2[1] + r);
    };
    for (const geo of st.outline.segments) if (geo.blocksMove) include(geo.points[0], geo.points[1], geo.thickness);
    for (const o of st.outline.openings || []) if (o.type !== 'breach') include(o.p1, o.p2, st.outline.thickness || 12);
    if (![minX, maxX, minY, maxY].every(Number.isFinite)) return null;
    const bounds = { x0: Math.max(0, this._tile(minX)), x1: Math.min(this.cols - 1, this._tile(maxX)),
      y0: Math.max(0, this._tile(minY)), y1: Math.min(this.rows - 1, this._tile(maxY)) };
    if (bounds.x0 > bounds.x1 || bounds.y0 > bounds.y1) return null;
    for (let y = bounds.y0; y <= bounds.y1; y++) {
      const from = y * this.cols + bounds.x0, to = y * this.cols + bounds.x1 + 1;
      this.walk.set(this.baseWalk.subarray(from, to), from);
    }
    // Нельзя рисовать только изменённое здание: соседние стены могут перекрывать
    // тот же тайл. Ограничиваем запись, но учитываем все пересекающие сегменты.
    this._markWallTiles(bounds);
    this.navVersion = (this.navVersion || 0) + 1;
    return bounds;
  }

  isWalkable(x, y) {
    if (x < 0 || y < 0 || x >= this.W || y >= this.H) return false;
    return this.walk[this._idx(x, y)] === 1;
  }

  isBaseWalkable(x, y) {
    if (x < 0 || y < 0 || x >= this.W || y >= this.H) return false;
    return this.baseWalk[this._idx(x, y)] === 1;
  }

  speedAt(x, y) {
    const t = this.terrainAt(x, y);
    const tc = this.cfg.sectors.terrain;
    if (t === T_ROAD) return tc.roadSpeed;
    if (t === T_FOREST) return tc.forestSlow;
    if (t === T_DIRT) return tc.dirtSpeed;
    return 1;
  }

  paintNearby(x, y, radius, out) {
    out.length = 0;
    const r = Math.ceil(radius / 128);
    this.buildingGrid.query(x, y, radius, out);
    return out;
  }

  hasLOS(x1, y1, x2, y2, vision = true) {
    // стены: точная геометрия сегментов (сетка тайлов слишком груба для тонких стен)
    if (this.walls && this.walls.enabled() && this.walls.blocksVision(x1, y1, x2, y2)) return false;
    const d = dist(x1, y1, x2, y2);
    const steps = Math.max(1, Math.ceil(d / 20));
    const skip = Math.ceil(40 / Math.max(1, d / steps));
    for (let s = skip; s < steps; s++) {
      const t = s / steps;
      const x = x1 + (x2 - x1) * t, y = y1 + (y2 - y1) * t;
      const k = this._idx(x, y);
      if (this.solidBlock[k]) return false;
      if (vision && this.losBlock[k]) return false;
    }
    return true;
  }

  // Лучшее укрытие рядом с юнитом (Utility: близость, угол к угрозе, дистанция до цели приказа).
  bestCover(x, y, threatAngle, radius, occupiedFn) {
    // Стены v2: сначала точки укрытия вдоль стен (направленные), потом старые постройки.
    if (this.walls && this.walls.enabled()) {
      const spots = this.walls.coverSpotsNear(x, y, radius);
      let bestSpot = null, bestSpotScore = -1;
      for (const sp of spots) {
        const d = sp.d;
        const toThreat = Math.cos(threatAngle) * sp.nx + Math.sin(threatAngle) * sp.ny;
        const alignment = 0.5 + 0.5 * toThreat;
        if (alignment < 0.35) continue;
        const height = this.cfg.coverRules?.heightClasses?.[String(sp.heightClass || 2)];
        const coverValue = height ? (height.stand + height.crouch) / 2 : 0.7;
        let score = (1 - d / radius) * 0.35 + alignment * 0.25 + coverValue * 0.5;
        if (occupiedFn) score -= occupiedFn(sp) * 0.45;
        if (score > bestSpotScore) {
          bestSpotScore = score;
          bestSpot = { x: sp.x, y: sp.y, cover: coverValue, spot: true, building: sp.building, nx: sp.nx, ny: sp.ny, heightClass: sp.heightClass, occupants: 0 };
        }
      }
      if (bestSpot) return bestSpot;
    }
    const found = [];
    this.buildingGrid.query(x, y, radius, found);
    let best = null, bestScore = -1;
    for (const b of found) {
      if (b.dead || !b.built || b.cover <= 0) continue;
      const d = dist(x, y, b.x, b.y);
      if (d > radius) continue;
      const toCover = Math.atan2(b.y - y, b.x - x);
      const alignment = 0.5 + 0.5 * Math.cos(toCover - threatAngle);
      if (alignment < 0.35) continue;
      let score = (1 - d / radius) * 0.5 + alignment * 0.3 + b.cover * 0.5;
      if (occupiedFn) score -= occupiedFn(b) * 0.5;
      if (score > bestScore) { bestScore = score; best = b; }
    }
    return best;
  }

  pointById(id) { return this.points.find((p) => p.id === id) || null; }
  pointsOf(faction) { return this.points.filter((p) => p.owner === faction); }
  hqOf(faction) { return this.points.find((p) => p.type === 'hq' && p.owner === faction) || this.points.find((p) => p.type === 'hq' && p.home === faction) || null; }
  homeHQ(faction) { return this.points.find((p) => p.type === 'hq' && p.home === faction) || null; }
  enemyHQ(faction) { return this.points.find((p) => p.type === 'hq' && p.owner !== faction) || null; }
  keyCities() { return this.points.filter((p) => p.type === 'city' && p.key); }

  nearestPoint(x, y, filter = null) {
    let best = null, bd = Infinity;
    for (const p of this.points) {
      if (filter && !filter(p)) continue;
      const d = dist(x, y, p.x, p.y);
      if (d < bd) { bd = d; best = p; }
    }
    return { point: best, distance: bd };
  }

  pointAt(x, y, pad = 0) {
    for (const p of this.points) {
      if (dist(x, y, p.x, p.y) <= p.radius + pad) return p;
    }
    return null;
  }

  damageBuilding(b, amount, sourceFaction = -1) {
    if (!b || b.dead) return;
    b.hp -= amount;
    b.lastHit = 0;
    if (b.hp <= 0) {
      b.hp = 0;
      b.dead = true;
      b.built = false;
      if (b.point) {
        b.point.hp = 0;
        this.events.push({ type: 'buildingDestroyed', building: b, point: b.point });
      } else {
        this.events.push({ type: 'buildingDestroyed', building: b });
      }
      this.rebuildNav();
    }
  }

  drainEvents() { const e = this.events; this.events = []; return e; }

  // Проверка проходимости линии для пуль: используется в бою.
  bulletBlocked(x1, y1, x2, y2) { return !this.hasLOS(x1, y1, x2, y2, false); }
}
