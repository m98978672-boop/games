// ============================================================================
//  ИНЖЕНЕРНАЯ СЕТЬ МЕЖДУГОРОДНИХ ДОРОГ, МОСТОВ И ГОРОДСКИХ КВАРТАЛОВ v0.3.2
//  - Умная трассировка A* по реальному рельефу в обход крутых скал и створов плотин
//  - Арочно-балочные железобетонные мосты на быках-опорах через реки и ручьи
//  - Реальная поэтапная стройка дорог километр за километром (щебень -> каток -> асфальт)
//  - Растущая уличная сеть внутри всех 8 городов по мере застройки колец
//  - Строительные леса для возводимых зданий городов (1 объединённый каркас)
// ============================================================================

import * as THREE from 'three';
import { WORLD } from './config.js';
import { getScaledValleyRivers } from './valley.js';
import { clamp, lerp } from './noise.js';
import { createHighwayRoadMaterial } from './water-shader.js';

// Региональный план развития 9 автомагистралей и мостовых переходов между всеми 8 городами
export const HIGHWAY_BLUEPRINTS = [
  { id: 'west_south',   from: 'posad',      to: 'svetlograd', name: 'Приречный тракт (Речной Посад — Светлоград)',       initProg: 0.30 },
  { id: 'east_south',   from: 'agro',       to: 'ustport',    name: 'Южное шоссе (Агродолина — Усть-Порт)',              initProg: 0.24 },
  { id: 'west_mid',     from: 'svetlograd', to: 'kremniy',    name: 'Техно-магистраль (Светлоград — Кремниевый Плёс)',   initProg: 0.14 },
  { id: 'bridge_south', from: 'posad',      to: 'ustport',    name: 'Южный Дельтовый Мост (Речной Посад — Усть-Порт)',   initProg: 0.06 },
  { id: 'east_mid',     from: 'agro',       to: 'alumingrad', name: 'Восточное промшоссе (Агродолина — Алюминград)',     initProg: 0.00 },
  { id: 'west_north',   from: 'kremniy',    to: 'sever',      name: 'Северный серпантин (Кремниевый Плёс — Североборск)',initProg: 0.00 },
  { id: 'east_north',   from: 'alumingrad', to: 'kamen',      name: 'Рудный тракт (Алюминград — Каменногорск)',          initProg: 0.00 },
  { id: 'bridge_mid',   from: 'svetlograd', to: 'agro',       name: 'Центральный Мост (Светлоград — Агродолина)',        initProg: 0.00 },
  { id: 'bridge_north', from: 'kremniy',    to: 'kamen',      name: 'Высокогорный Мост (Кремниевый Плёс — Каменногорск)',initProg: 0.00 },
];

/**
 * Создаёт лёгкий сквозной 3D-каркас строительных лесов вокруг строящегося здания
 * (4 угловые стойки + 3 яруса настилов + диагональные связи в одном BufferGeometry!)
 */
export function createOpenScaffoldCageGeometry() {
  const parts = [];
  const addBeam = (cx, cy, cz, sx, sy, sz) => {
    const g = new THREE.BoxGeometry(sx, sy, sz);
    g.translate(cx, cy, cz);
    parts.push(g);
  };

  const t = 0.038;
  // 4 угловые вертикальные стойки лесов
  for (const sx of [-0.5, 0.5]) {
    for (const sz of [-0.5, 0.5]) {
      addBeam(sx, 0.5, sz, t, 1.0, t);
    }
  }
  // 3 горизонтальных яруса строительных подмостей
  for (const ry of [0.32, 0.66, 0.98]) {
    addBeam(0, ry, -0.5, 1.04, t * 0.85, t);
    addBeam(0, ry,  0.5, 1.04, t * 0.85, t);
    addBeam(-0.5, ry, 0, t, t * 0.85, 1.04);
    addBeam( 0.5, ry, 0, t, t * 0.85, 1.04);
  }
  // Промежуточные средние стойки фасада
  addBeam(0, 0.5, -0.5, t * 0.75, 1.0, t * 0.75);
  addBeam(0, 0.5,  0.5, t * 0.75, 1.0, t * 0.75);
  addBeam(-0.5, 0.5, 0, t * 0.75, 1.0, t * 0.75);
  addBeam( 0.5, 0.5, 0, t * 0.75, 1.0, t * 0.75);

  let totalV = 0;
  let totalI = 0;
  for (const p of parts) {
    totalV += p.attributes.position.count;
    totalI += p.index.count;
  }

  const pos = new Float32Array(totalV * 3);
  const norm = new Float32Array(totalV * 3);
  const idx = new Uint16Array(totalI);
  let vOff = 0;
  let iOff = 0;
  for (const p of parts) {
    pos.set(p.attributes.position.array, vOff * 3);
    norm.set(p.attributes.normal.array, vOff * 3);
    const pi = p.index.array;
    for (let k = 0; k < pi.length; k++) {
      idx[iOff + k] = pi[k] + vOff;
    }
    vOff += p.attributes.position.count;
    iOff += pi.length;
    p.dispose();
  }

  const out = new THREE.BufferGeometry();
  out.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  out.setAttribute('normal', new THREE.BufferAttribute(norm, 3));
  out.setIndex(new THREE.BufferAttribute(idx, 1));
  return out;
}

/** Быстрая бинарная куча минимума для навигационного A* графа рельефа */
class MinHeap {
  constructor(maxSize) {
    this.nodes = new Int32Array(maxSize);
    this.prios = new Float32Array(maxSize);
    this.size = 0;
  }

  clear() {
    this.size = 0;
  }

  push(node, prio) {
    let i = this.size++;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (this.prios[p] <= prio) break;
      this.nodes[i] = this.nodes[p];
      this.prios[i] = this.prios[p];
      i = p;
    }
    this.nodes[i] = node;
    this.prios[i] = prio;
  }

  pop() {
    const top = this.nodes[0];
    const lastN = this.nodes[--this.size];
    const lastP = this.prios[this.size];
    if (this.size > 0) {
      let i = 0;
      const half = this.size >> 1;
      while (i < half) {
        let l = (i << 1) + 1;
        const r = l + 1;
        if (r < this.size && this.prios[r] < this.prios[l]) l = r;
        if (lastP <= this.prios[l]) break;
        this.nodes[i] = this.nodes[l];
        this.prios[i] = this.prios[l];
        i = l;
      }
      this.nodes[i] = lastN;
      this.prios[i] = lastP;
    }
    return top;
  }
}

/**
 * Инженерная модель дорожной сети: строит трассы по перевалам, возводит мосты через реки
 * и поэтапно продвигает укладку асфальта между 8 городами!
 */
export class RoadNetworkSimulation {
  constructor() {
    this.routes = [];
    this.meshDirty = true;
    this.completedCount = 0;
    this._navN = 88;
    const cap = this._navN * this._navN;
    this._heap = new MinHeap(cap * 2);
    this._gScore = new Float32Array(cap);
    this._cameFrom = new Int32Array(cap);
    this._closed = new Uint8Array(cap);
    this._bedGrid = new Float32Array(cap);
    this._depthGrid = new Float32Array(cap);
    this._penaltyGrid = new Float32Array(cap);
  }

  rebuildRoutes(hydro, cities) {
    this.routes = [];
    this.completedCount = 0;
    this.meshDirty = true;
    if (!hydro || !cities || cities.length === 0) return;

    const N = this._navN;
    const span = WORLD.size * 0.90;
    const origin = -span * 0.5;
    const step = span / (N - 1);
    const rivers = getScaledValleyRivers(hydro.presetId || 'bystritsa');
    const gorges = rivers.gorges || [];
    const gorgeAvoidR = 54 * WORLD.horizScale;

    // 1. Снимаем карту высот, глубин рек и зон обхода (створы плотин + центры городов)
    for (let iz = 0; iz < N; iz++) {
      const wz = origin + iz * step;
      for (let ix = 0; ix < N; ix++) {
        const wx = origin + ix * step;
        const idx = iz * N + ix;
        const s = hydro.sampleAtWorld(wx, wz);
        this._bedGrid[idx] = s.bed;
        this._depthGrid[idx] = s.depth;

        let pen = 0;
        // Обходим главные скальные каньоны под плотины ГЭС, чтобы мосты не мешали плотинам!
        for (let g = 0; g < gorges.length; g++) {
          const dG = Math.hypot(wx - gorges[g].x, wz - gorges[g].z);
          if (dG < gorgeAvoidR) {
            pen += (1.0 - dG / gorgeAvoidR) * 28.0;
          }
        }
        // Обходим внутреннюю застройку транзитных городов
        for (let c = 0; c < cities.length; c++) {
          const dC = Math.hypot(wx - cities[c].x, wz - cities[c].z);
          const innerR = cities[c].plateauRadius * 0.56;
          if (dC < innerR) {
            pen += (1.0 - dC / innerR) * 18.0;
          }
        }
        this._penaltyGrid[idx] = pen;
      }
    }

    const cityById = new Map();
    for (const c of cities) {
      c.connectedRoadsCount = 0;
      c.builtStreetRings = Math.max(1, Math.min(5, Math.ceil(c.buildingIndices.length / 8)));
      cityById.set(c.id, c);
    }

    // 2. Прокладываем каждую из 9 региональных трасс по рельефу через A*
    for (let rIdx = 0; rIdx < HIGHWAY_BLUEPRINTS.length; rIdx++) {
      const bp = HIGHWAY_BLUEPRINTS[rIdx];
      const cityA = cityById.get(bp.from);
      const cityB = cityById.get(bp.to);
      if (!cityA || !cityB) continue;

      const angAB = Math.atan2(cityB.z - cityA.z, cityB.x - cityA.x);
      const rA = cityA.plateauRadius * 0.60;
      const rB = cityB.plateauRadius * 0.60;
      const startX = cityA.x + Math.cos(angAB) * rA;
      const startZ = cityA.z + Math.sin(angAB) * rA;
      const endX = cityB.x - Math.cos(angAB) * rB;
      const endZ = cityB.z - Math.sin(angAB) * rB;

      const rawWaypoints = this._findTerrainRouteAStar(startX, startZ, endX, endZ, origin, step, N);
      const points = this._buildEngineeredProfile(rawWaypoints, hydro);

      const totalLengthM = points.length > 0 ? points[points.length - 1].arc : 0;
      const hasBridge = points.some((p) => p.isBridge);
      const initProg = clamp(bp.initProg || 0, 0, 1);
      const builtSeg = Math.floor(initProg * Math.max(0, points.length - 1));

      this.routes.push({
        index: rIdx,
        id: bp.id,
        name: bp.name,
        fromId: bp.from,
        toId: bp.to,
        fromName: cityA.name,
        toName: cityB.name,
        points,
        totalLengthM,
        hasBridge,
        buildProgress: initProg,
        builtSeg,
        completed: initProg >= 1.0,
        activeCrew: false,
      });
    }
  }

  _findTerrainRouteAStar(sx, sz, ex, ez, origin, step, N) {
    const toGrid = (v) => clamp(Math.round((v - origin) / step), 0, N - 1);
    const sxG = toGrid(sx);
    const szG = toGrid(sz);
    const exG = toGrid(ex);
    const ezG = toGrid(ez);
    const startNode = szG * N + sxG;
    const goalNode = ezG * N + exG;

    this._gScore.fill(1e12);
    this._cameFrom.fill(-1);
    this._closed.fill(0);
    this._heap.clear();

    this._gScore[startNode] = 0;
    this._heap.push(startNode, Math.hypot(exG - sxG, ezG - szG) * step);

    const dirs = [
      [1, 0, 1.0], [-1, 0, 1.0], [0, 1, 1.0], [0, -1, 1.0],
      [1, 1, 1.4142], [-1, 1, 1.4142], [1, -1, 1.4142], [-1, -1, 1.4142],
    ];

    while (this._heap.size > 0) {
      const cur = this._heap.pop();
      if (cur === goalNode) break;
      if (this._closed[cur]) continue;
      this._closed[cur] = 1;

      const cx = cur % N;
      const cz = (cur / N) | 0;
      const bedA = this._bedGrid[cur];
      const curG = this._gScore[cur];

      for (let d = 0; d < 8; d++) {
        const nx = cx + dirs[d][0];
        const nz = cz + dirs[d][1];
        if (nx < 0 || nx >= N || nz < 0 || nz >= N) continue;
        const nxt = nz * N + nx;
        if (this._closed[nxt]) continue;

        const ds = dirs[d][2] * step;
        const bedB = this._bedGrid[nxt];
        const depthB = this._depthGrid[nxt];
        const grade = Math.abs(bedB - bedA) / ds;

        // Крутые скалы обходим пологими перевалами и террасами!
        let slopeMult = 1.0;
        if (grade > 0.21) {
          slopeMult = 4.2 + (grade - 0.21) * 125.0;
        } else if (grade > 0.08) {
          slopeMult = 1.0 + (grade - 0.08) * 24.0;
        }

        // Реку пересекаем коротко поперёк русла по мосту, не идя вдоль воды!
        const waterMult = depthB > 0.04 ? (3.5 + Math.min(3.5, depthB * 0.35)) : 0.0;
        const highSnowMult = bedB > WORLD.snowLineY * 0.85 ? 5.5 : 0.0;
        const zoneMult = (nxt === goalNode || cur === startNode) ? 0.0 : this._penaltyGrid[nxt];

        const moveCost = ds * (slopeMult + waterMult + highSnowMult + zoneMult);
        const tentG = curG + moveCost;

        if (tentG < this._gScore[nxt]) {
          this._cameFrom[nxt] = cur;
          this._gScore[nxt] = tentG;
          const heur = Math.hypot(exG - nx, ezG - nz) * step * 0.98;
          this._heap.push(nxt, tentG + heur);
        }
      }
    }

    const raw = [];
    let node = goalNode;
    if (this._cameFrom[node] === -1 && node !== startNode) {
      return [{ x: sx, z: sz }, { x: (sx + ex) * 0.5, z: (sz + ez) * 0.5 }, { x: ex, z: ez }];
    }
    while (node !== -1) {
      const ix = node % N;
      const iz = (node / N) | 0;
      raw.push({ x: origin + ix * step, z: origin + iz * step });
      if (node === startNode) break;
      node = this._cameFrom[node];
    }
    raw.reverse();
    raw[0] = { x: sx, z: sz };
    raw[raw.length - 1] = { x: ex, z: ez };
    return raw;
  }

  _buildEngineeredProfile(waypoints, hydro) {
    // 1. Двухпроходное сглаживание углов Чайкина (плавные виражи горного шоссе!)
    let pts = waypoints;
    for (let pass = 0; pass < 2; pass++) {
      if (pts.length < 3) break;
      const next = [pts[0]];
      for (let i = 0; i < pts.length - 1; i++) {
        const a = pts[i];
        const b = pts[i + 1];
        next.push({ x: a.x * 0.75 + b.x * 0.25, z: a.z * 0.75 + b.z * 0.25 });
        next.push({ x: a.x * 0.25 + b.x * 0.75, z: a.z * 0.25 + b.z * 0.75 });
      }
      next.push(pts[pts.length - 1]);
      pts = next;
    }

    // 2. Равномерная разбивка по длине трассы (шаг сегмента адаптирован под 0.8 / 5 / 10 км)
    const targetSegLen = clamp(14.5 * Math.pow(WORLD.horizScale, 0.72), 13.0, 96.0);
    const resampled = [{ x: pts[0].x, z: pts[0].z, arc: 0 }];
    let accArc = 0;
    let carry = 0;
    for (let i = 0; i < pts.length - 1; i++) {
      const ax = pts[i].x;
      const az = pts[i].z;
      const bx = pts[i + 1].x;
      const bz = pts[i + 1].z;
      const segD = Math.hypot(bx - ax, bz - az);
      if (segD < 1e-4) continue;
      let distAlong = targetSegLen - carry;
      while (distAlong <= segD) {
        const t = distAlong / segD;
        accArc += targetSegLen;
        resampled.push({
          x: lerp(ax, bx, t),
          z: lerp(az, bz, t),
          arc: accArc,
        });
        distAlong += targetSegLen;
      }
      carry = segD - (distAlong - targetSegLen);
    }
    const lastRaw = pts[pts.length - 1];
    const prevR = resampled[resampled.length - 1];
    const tailD = Math.hypot(lastRaw.x - prevR.x, lastRaw.z - prevR.z);
    if (tailD > targetSegLen * 0.25 || resampled.length < 2) {
      accArc += tailD;
      resampled.push({ x: lastRaw.x, z: lastRaw.z, arc: accArc });
    } else {
      prevR.x = lastRaw.x;
      prevR.z = lastRaw.z;
    }

    // 3. Инженерный расчёт отметок полотна и мостовых переходов через реки
    const eS = WORLD.elevScale;
    const out = resampled.map((p) => {
      const s = hydro.sampleAtWorld(p.x, p.z);
      return {
        wx: p.x,
        wz: p.z,
        arc: p.arc,
        bed: s.bed,
        waterDepth: s.depth,
        waterSurf: s.surface,
        deckY: s.bed + 0.34 * eS,
        isBridge: s.depth > 0.045,
        nx: 1,
        nz: 0,
        yaw: 0,
        pitch: 0,
      };
    });

    // Расширяем мостовые подходы на 2 сегмента в оба берега для плавных устоев моста
    const bridgeFlags = out.map((p) => p.isBridge);
    for (let i = 0; i < out.length; i++) {
      if (bridgeFlags[i]) {
        for (let k = Math.max(1, i - 2); k <= Math.min(out.length - 2, i + 2); k++) {
          out[k].isBridge = true;
        }
      }
    }

    // Сглаживаем продольный профиль грунтовых участков (насыпи над микро-ложбинами)
    for (let pass = 0; pass < 3; pass++) {
      for (let i = 1; i < out.length - 1; i++) {
        if (out[i].isBridge) continue;
        const avg = 0.25 * out[i - 1].deckY + 0.5 * out[i].deckY + 0.25 * out[i + 1].deckY;
        out[i].deckY = Math.max(out[i].bed + 0.32 * eS, avg);
      }
    }

    // Формируем высокие арочно-балочные пролёты всех мостов над зеркалом рек!
    let idx = 0;
    while (idx < out.length) {
      if (!out[idx].isBridge) {
        idx++;
        continue;
      }
      const bStart = Math.max(0, idx - 1);
      while (idx < out.length && out[idx].isBridge) idx++;
      const bEnd = Math.min(out.length - 1, idx);

      let maxSurf = -Infinity;
      for (let k = bStart; k <= bEnd; k++) {
        if (out[k].waterDepth > 0.03) {
          maxSurf = Math.max(maxSurf, out[k].waterSurf);
        } else {
          maxSurf = Math.max(maxSurf, out[k].bed);
        }
      }
      const clearanceY = maxSurf + 3.8 * eS;
      const bankStartY = Math.max(out[bStart].deckY, out[bStart].bed + 0.6 * eS);
      const bankEndY = Math.max(out[bEnd].deckY, out[bEnd].bed + 0.6 * eS);
      const spanSteps = Math.max(1, bEnd - bStart);
      const camber = clamp(spanSteps * 0.24 * eS, 1.2 * eS, 4.8 * eS);

      for (let k = bStart; k <= bEnd; k++) {
        const u = (k - bStart) / spanSteps;
        const chordY = lerp(bankStartY, bankEndY, u);
        const archBell = Math.sin(u * Math.PI);
        const targetBridgeY = Math.max(chordY, lerp(chordY, clearanceY, Math.min(1.0, archBell * 1.45))) + camber * archBell;
        out[k].deckY = Math.max(out[k].bed + 0.36 * eS, targetBridgeY);
      }
    }

    // Касательные, нормали в плане и продольный уклон для укладки полотна и движения авто
    for (let i = 0; i < out.length; i++) {
      const a = out[Math.max(0, i - 1)];
      const b = out[Math.min(out.length - 1, i + 1)];
      const dx = b.wx - a.wx;
      const dz = b.wz - a.wz;
      const dy = b.deckY - a.deckY;
      const lenXZ = Math.hypot(dx, dz) || 1;
      const tx = dx / lenXZ;
      const tz = dz / lenXZ;
      out[i].nx = -tz;
      out[i].nz = tx;
      out[i].yaw = Math.atan2(dx, dz);
      out[i].pitch = Math.atan2(dy, lenXZ);
    }

    return out;
  }

  /** Шаг реального строительства междугородних трасс, мостов и городских улиц */
  step(dt, economy) {
    if (dt <= 0 || this.routes.length === 0) return;

    const cityById = new Map();
    for (const c of economy.cities) {
      cityById.set(c.id, c);
      const targetRings = clamp(Math.ceil(c.buildingIndices.length / 8), 1, 6);
      if (targetRings !== c.builtStreetRings) {
        c.builtStreetRings = targetRings;
        this.meshDirty = true;
      }
    }

    // Одновременно работают до 3 дорожно-строительных колонн!
    let activeCrews = 0;
    const maxConcurrentRoads = 3;
    const mwBoost = economy.totalMW > 0.5 ? 1.45 : 1.0;

    for (let i = 0; i < this.routes.length; i++) {
      const r = this.routes[i];
      if (r.completed) {
        r.activeCrew = false;
        continue;
      }
      if (activeCrews >= maxConcurrentRoads) {
        r.activeCrew = false;
        continue;
      }

      r.activeCrew = true;
      activeCrews++;

      const cA = cityById.get(r.fromId);
      const cB = cityById.get(r.toId);
      const connBonus = ((cA && cA.connected) ? 0.55 : 0) + ((cB && cB.connected) ? 0.55 : 0);
      const bridgeFactor = r.hasBridge ? 0.84 : 1.0;
      const plantCount = (economy.hydro && economy.hydro.concretePlants) ? economy.hydro.concretePlants.length : 0;
      const plantBoost = 1.0 + Math.min(0.95, plantCount * 0.45);

      // В креативе строится стремительно, в обычной игре — плавно и ускоряется Бетонозаводом БСУ [B]!
      const baseRate = economy.creative ? 0.26 : 0.023;
      const progDelta = baseRate * (1.0 + connBonus) * mwBoost * bridgeFactor * plantBoost * dt;

      r.buildProgress = Math.min(1.0, r.buildProgress + progDelta);
      const newSeg = Math.floor(r.buildProgress * Math.max(0, r.points.length - 1));
      if (newSeg !== r.builtSeg) {
        // Если игрок прорыл новый канал или поднял бьеф на участке впереди катка — автоматически поднимаем эстакаду моста!
        if (economy.hydro && newSeg < r.points.length) {
          for (let k = Math.max(0, r.builtSeg); k <= Math.min(r.points.length - 1, newSeg + 2); k++) {
            const pt = r.points[k];
            const s = economy.hydro.sampleAtWorld(pt.wx, pt.wz);
            if (s.depth > 0.25) {
              pt.isBridge = true;
              pt.waterDepth = s.depth;
              pt.waterSurf = s.surface;
              pt.deckY = Math.max(pt.deckY, s.surface + 3.6 * WORLD.elevScale);
              r.hasBridge = true;
            }
          }
        }
        r.builtSeg = newSeg;
        this.meshDirty = true;
      }

      if (r.buildProgress >= 1.0 && !r.completed) {
        r.completed = true;
        r.activeCrew = false;
        r.builtSeg = Math.max(0, r.points.length - 1);
        this.completedCount++;
        this.meshDirty = true;
        if (cA) cA.connectedRoadsCount = (cA.connectedRoadsCount || 0) + 1;
        if (cB) cB.connectedRoadsCount = (cB.connectedRoadsCount || 0) + 1;
        if (economy.callbacks && economy.callbacks.onNotify) {
          economy.callbacks.onNotify(
            `✦ Построена междугородняя трасса: ${r.name}! Открыто движение транспорта.`,
            'good',
          );
        }
      }
    }

    let doneCnt = 0;
    for (const c of economy.cities) c.connectedRoadsCount = 0;
    for (const r of this.routes) {
      if (r.completed) {
        doneCnt++;
        const cA = cityById.get(r.fromId);
        const cB = cityById.get(r.toId);
        if (cA) cA.connectedRoadsCount++;
        if (cB) cB.connectedRoadsCount++;
      }
    }
    this.completedCount = doneCnt;
  }
}

/**
 * 3D-рендерер строящихся междугородних трасс, мостовых быков, дорожных катков и городских проспектов
 */
export class RoadAndBridgeRenderer {
  constructor(scene, hydro, economy, textures, shadowEnabled = false) {
    this.scene = scene;
    this.hydro = hydro;
    this.economy = economy;
    this.textures = textures;
    this.shadowEnabled = shadowEnabled;

    this.group = new THREE.Group();
    this.scene.add(this.group);

    this._dummy = new THREE.Object3D();
    this._buildMeshes();
  }

  _buildMeshes() {
    // 1. Динамическая лента всех дорог, пролётов мостов, щебёночных подушек и улиц (1 draw call!)
    const maxQuads = 9500;
    this.maxVerts = maxQuads * 4;
    this.maxIndices = maxQuads * 6;

    const geo = new THREE.BufferGeometry();
    this.posArr = new Float32Array(this.maxVerts * 3);
    this.normArr = new Float32Array(this.maxVerts * 3);
    this.uvArr = new Float32Array(this.maxVerts * 2);
    this.kindArr = new Float32Array(this.maxVerts);
    const indices = new Uint32Array(this.maxIndices);
    for (let q = 0; q < maxQuads; q++) {
      const v = q * 4;
      const k = q * 6;
      indices[k]     = v;
      indices[k + 1] = v + 2;
      indices[k + 2] = v + 1;
      indices[k + 3] = v + 1;
      indices[k + 4] = v + 2;
      indices[k + 5] = v + 3;
    }

    this.posAttr = new THREE.BufferAttribute(this.posArr, 3);
    this.posAttr.setUsage(THREE.DynamicDrawUsage);
    this.normAttr = new THREE.BufferAttribute(this.normArr, 3);
    this.normAttr.setUsage(THREE.DynamicDrawUsage);
    this.uvAttr = new THREE.BufferAttribute(this.uvArr, 2);
    this.uvAttr.setUsage(THREE.DynamicDrawUsage);
    this.kindAttr = new THREE.BufferAttribute(this.kindArr, 1);
    this.kindAttr.setUsage(THREE.DynamicDrawUsage);

    geo.setIndex(new THREE.BufferAttribute(indices, 1));
    geo.setAttribute('position', this.posAttr);
    geo.setAttribute('normal', this.normAttr);
    geo.setAttribute('uv', this.uvAttr);
    geo.setAttribute('aRoadKind', this.kindAttr);
    geo.setDrawRange(0, 0);

    this.roadMat = createHighwayRoadMaterial();
    this.roadMesh = new THREE.Mesh(geo, this.roadMat);
    this.roadMesh.receiveShadow = this.shadowEnabled;
    this.roadMesh.frustumCulled = false;
    this.group.add(this.roadMesh);

    // 2. Мостовые бетонные опоры-быки в реках + перильные ограждения мостов
    this.maxPiers = 380;
    const pierGeo = new THREE.CylinderGeometry(0.45, 0.62, 1.0, 8);
    pierGeo.translate(0, -0.5, 0);
    const pierMat = new THREE.MeshLambertMaterial({ color: 0xcbd5e1, map: this.textures.concreteMap });
    this.bridgePierIM = new THREE.InstancedMesh(pierGeo, pierMat, this.maxPiers);
    this.bridgePierIM.count = 0;
    this.bridgePierIM.castShadow = this.shadowEnabled;
    this.bridgePierIM.frustumCulled = false;
    this.group.add(this.bridgePierIM);

    this.maxRails = 640;
    const railGeo = new THREE.BoxGeometry(0.22, 0.72, 1.0);
    railGeo.translate(0, 0.36, 0);
    const railMat = new THREE.MeshLambertMaterial({ color: 0xe2e8f0, map: this.textures.steel });
    this.bridgeRailIM = new THREE.InstancedMesh(railGeo, railMat, this.maxRails);
    this.bridgeRailIM.count = 0;
    this.bridgeRailIM.frustumCulled = false;
    this.group.add(this.bridgeRailIM);

    // 3. Дорожно-строительная техника на активном фронте укладки дорог (каток + самосвал + маяк!)
    this.maxCrews = 12;
    const rollerBodyGeo = new THREE.BoxGeometry(2.2, 1.55, 3.6);
    rollerBodyGeo.translate(0, 1.0, 0);
    const machineMat = new THREE.MeshLambertMaterial({ color: 0xf59e0b });
    this.roadMachineIM = new THREE.InstancedMesh(rollerBodyGeo, machineMat, this.maxCrews);
    this.roadMachineIM.count = 0;
    this.roadMachineIM.frustumCulled = false;

    const drumGeo = new THREE.CylinderGeometry(0.82, 0.82, 2.5, 12);
    drumGeo.rotateZ(Math.PI * 0.5);
    const drumMat = new THREE.MeshLambertMaterial({ color: 0x475569, map: this.textures.steel });
    this.roadDrumIM = new THREE.InstancedMesh(drumGeo, drumMat, this.maxCrews);
    this.roadDrumIM.count = 0;
    this.roadDrumIM.frustumCulled = false;

    const beaconGeo = new THREE.SphereGeometry(0.55, 8, 8);
    this.beaconMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24 });
    this.roadBeaconIM = new THREE.InstancedMesh(beaconGeo, this.beaconMat, this.maxCrews);
    this.roadBeaconIM.count = 0;
    this.roadBeaconIM.frustumCulled = false;

    this.group.add(this.roadMachineIM, this.roadDrumIM, this.roadBeaconIM);
  }

  _appendQuad(vCursor, ax, ay, az, anx, anz, bx, by, bz, bnx, bnz, halfW, arcA, arcB, roadKind) {
    if (vCursor + 4 > this.maxVerts) return vCursor;
    const p = this.posArr;
    const n = this.normArr;
    const u = this.uvArr;
    const kd = this.kindArr;

    const coords = [
      ax - anx * halfW, ay, az - anz * halfW, 0.0, arcA,
      ax + anx * halfW, ay, az + anz * halfW, 1.0, arcA,
      bx - bnx * halfW, by, bz - bnz * halfW, 0.0, arcB,
      bx + bnx * halfW, by, bz + bnz * halfW, 1.0, arcB,
    ];

    for (let k = 0; k < 4; k++) {
      const vi = vCursor + k;
      const i3 = vi * 3;
      const i2 = vi * 2;
      const c5 = k * 5;
      p[i3]     = coords[c5];
      p[i3 + 1] = coords[c5 + 1];
      p[i3 + 2] = coords[c5 + 2];
      n[i3]     = 0;
      n[i3 + 1] = 1;
      n[i3 + 2] = 0;
      u[i2]     = coords[c5 + 3];
      u[i2 + 1] = coords[c5 + 4];
      kd[vi]    = roadKind;
    }
    return vCursor + 4;
  }

  /** Перестраивает геометрию построенных дорог, мостов, щебёночных насыпей и городских улиц */
  syncGeometry() {
    const net = this.economy.roadNetwork;
    if (!net) return;

    const hs = WORLD.horizScale;
    const es = WORLD.elevScale;
    const wScale = Math.pow(hs, 0.56);
    const hwyHalfW = 4.2 * wScale;
    const subHalfW = 4.7 * wScale;
    const cityHalfW = 3.1 * wScale;

    let vCursor = 0;
    let pierIdx = 0;
    let railIdx = 0;
    const d = this._dummy;

    // 1. Внутригородские кольцевые проспекты и радиальные улицы (растут вместе с кварталами города!)
    for (const c of this.economy.cities) {
      const ringsCount = clamp(c.builtStreetRings || 1, 1, 6);
      const centerY = this.hydro.sampleAtWorld(c.x, c.z).bed + 0.22 * es;
      const ringSegs = 24;

      for (let r = 1; r <= ringsCount; r++) {
        const ringR = (6.2 + (r - 1) * 8.4) * hs;
        if (ringR > c.plateauRadius * 0.84) break;
        let arc = 0;
        for (let s = 0; s < ringSegs; s++) {
          const a0 = (s / ringSegs) * Math.PI * 2;
          const a1 = ((s + 1) / ringSegs) * Math.PI * 2;
          const ax = c.x + Math.cos(a0) * ringR;
          const az = c.z + Math.sin(a0) * ringR;
          const bx = c.x + Math.cos(a1) * ringR;
          const bz = c.z + Math.sin(a1) * ringR;
          const ay = Math.max(centerY, this.hydro.sampleAtWorld(ax, az).bed + 0.22 * es);
          const by = Math.max(centerY, this.hydro.sampleAtWorld(bx, bz).bed + 0.22 * es);
          const segLen = Math.hypot(bx - ax, bz - az);
          vCursor = this._appendQuad(
            vCursor,
            ax, ay, az, Math.cos(a0), Math.sin(a0),
            bx, by, bz, Math.cos(a1), Math.sin(a1),
            cityHalfW * 0.85,
            arc / Math.max(1, wScale),
            (arc + segLen) / Math.max(1, wScale),
            3.0,
          );
          arc += segLen;
        }
      }

      // 4 радиальных бульвара внутри застроенных колец города
      const maxRadialR = Math.min(c.plateauRadius * 0.72, (6.2 + (ringsCount - 0.3) * 8.4) * hs);
      for (let av = 0; av < 4; av++) {
        const ang = av * Math.PI * 0.5 + 0.32;
        const ca = Math.cos(ang);
        const sa = Math.sin(ang);
        const nx = -sa;
        const nz = ca;
        const rStart = 4.2 * hs;
        if (maxRadialR <= rStart + 2) continue;
        const steps = 4;
        for (let st = 0; st < steps; st++) {
          const r0 = lerp(rStart, maxRadialR, st / steps);
          const r1 = lerp(rStart, maxRadialR, (st + 1) / steps);
          const ax = c.x + ca * r0;
          const az = c.z + sa * r0;
          const bx = c.x + ca * r1;
          const bz = c.z + sa * r1;
          const ay = Math.max(centerY, this.hydro.sampleAtWorld(ax, az).bed + 0.23 * es);
          const by = Math.max(centerY, this.hydro.sampleAtWorld(bx, bz).bed + 0.23 * es);
          vCursor = this._appendQuad(
            vCursor,
            ax, ay, az, nx, nz,
            bx, by, bz, nx, nz,
            cityHalfW,
            r0 / Math.max(1, wScale),
            r1 / Math.max(1, wScale),
            3.0,
          );
        }
      }
    }

    // 2. Междугородние трассы, бетонные мосты на опорах и строящаяся щебёночная подушка
    for (let rIdx = 0; rIdx < net.routes.length; rIdx++) {
      const r = net.routes[rIdx];
      const pts = r.points;
      if (!pts || pts.length < 2) continue;

      const builtEnd = clamp(r.builtSeg, 0, pts.length - 1);

      // А. Уже уложенный асфальт и построенные мостовые пролёты
      for (let i = 0; i < builtEnd; i++) {
        const a = pts[i];
        const b = pts[i + 1];
        const isBridge = a.isBridge || b.isBridge;
        const kind = isBridge ? 1.0 : 0.0;
        const thickLift = isBridge ? 0.22 * es : 0.0;

        vCursor = this._appendQuad(
          vCursor,
          a.wx, a.deckY + thickLift, a.wz, a.nx, a.nz,
          b.wx, b.deckY + thickLift, b.wz, b.nx, b.nz,
          hwyHalfW,
          a.arc / Math.max(1, wScale),
          b.arc / Math.max(1, wScale),
          kind,
        );

        // Бетонные быки-опоры и перильные ограждения под построенными мостами!
        if (isBridge) {
          const segLen = Math.hypot(b.wx - a.wx, b.wz - a.wz);
          const mx = (a.wx + b.wx) * 0.5;
          const mz = (a.wz + b.wz) * 0.5;
          const my = (a.deckY + b.deckY) * 0.5 + thickLift;

          for (const side of [-1, 1]) {
            if (railIdx < this.maxRails) {
              d.position.set(mx + a.nx * hwyHalfW * 0.92 * side, my, mz + a.nz * hwyHalfW * 0.92 * side);
              d.rotation.set(-a.pitch, a.yaw, 0);
              d.scale.set(wScale, Math.pow(es, 0.68), segLen * 1.03);
              d.updateMatrix();
              this.bridgeRailIM.setMatrixAt(railIdx++, d.matrix);
            }
          }

          if ((i % 2 === 0) && pierIdx + 1 < this.maxPiers) {
            const pierH = Math.max(2.5, (a.deckY + thickLift) - (a.bed - 2.2 * es));
            for (const side of [-0.54, 0.54]) {
              d.position.set(a.wx + a.nx * hwyHalfW * side, a.deckY + thickLift - 0.1 * es, a.wz + a.nz * hwyHalfW * side);
              d.rotation.set(0, a.yaw, 0);
              d.scale.set(wScale * 1.15, pierH, wScale * 1.15);
              d.updateMatrix();
              this.bridgePierIM.setMatrixAt(pierIdx++, d.matrix);
            }
          }
        }
      }

      // Б. Подготовленная щебёночная насыпь прямо перед дорожно-строительной колонной!
      if (!r.completed && r.activeCrew) {
        const subEnd = Math.min(pts.length - 1, builtEnd + 5);
        for (let i = builtEnd; i < subEnd; i++) {
          const a = pts[i];
          const b = pts[i + 1];
          vCursor = this._appendQuad(
            vCursor,
            a.wx, a.deckY - 0.06 * es, a.wz, a.nx, a.nz,
            b.wx, b.deckY - 0.06 * es, b.wz, b.nx, b.nz,
            subHalfW,
            a.arc / Math.max(1, wScale),
            b.arc / Math.max(1, wScale),
            2.0,
          );
        }
      }
    }

    const quadCount = (vCursor / 4) | 0;
    this.roadMesh.geometry.setDrawRange(0, quadCount * 6);
    this.posAttr.needsUpdate = true;
    this.normAttr.needsUpdate = true;
    this.uvAttr.needsUpdate = true;
    this.kindAttr.needsUpdate = true;

    this.bridgePierIM.count = pierIdx;
    this.bridgeRailIM.count = railIdx;
    this.bridgePierIM.instanceMatrix.needsUpdate = true;
    this.bridgeRailIM.instanceMatrix.needsUpdate = true;

    net.meshDirty = false;
  }

  /** Ежекадровая анимация дорожных катков, укладчиков и сигнальных маяков на фронте стройки дорог */
  updateCrewAnimations(timeSec, sunDir, sunColor, skyColor, fogColor, fogDensity, nightFactor) {
    const u = this.roadMat.uniforms;
    u.uSunDir.value.copy(sunDir);
    u.uSunColor.value.copy(sunColor);
    u.uSkyColor.value.copy(skyColor);
    u.uFogColor.value.copy(fogColor);
    u.uFogDensity.value = fogDensity;
    u.uNightFactor.value = nightFactor;

    const net = this.economy.roadNetwork;
    if (!net) return;
    if (net.meshDirty) {
      this.syncGeometry();
    }

    const wScale = Math.pow(WORLD.horizScale, 0.56);
    const d = this._dummy;
    let mIdx = 0;

    for (let i = 0; i < net.routes.length && mIdx + 1 < this.maxCrews; i++) {
      const r = net.routes[i];
      if (r.completed || !r.activeCrew || r.points.length < 3) continue;

      const frontIdx = clamp(r.builtSeg, 0, r.points.length - 2);
      const a = r.points[frontIdx];
      const b = r.points[frontIdx + 1];

      // 1. Асфальтоукладчик / дорожный каток возвратно-поступательно укатывает свежий край полотна
      const shuttle = 0.5 + 0.45 * Math.sin(timeSec * 1.8 + i * 2.1);
      const rx = lerp(a.wx, b.wx, shuttle);
      const ry = lerp(a.deckY, b.deckY, shuttle) + 0.15 * WORLD.elevScale;
      const rz = lerp(a.wz, b.wz, shuttle);

      d.position.set(rx, ry, rz);
      d.rotation.set(-a.pitch, a.yaw, 0);
      d.scale.set(wScale * 1.15, wScale * 1.15, wScale * 1.15);
      d.updateMatrix();
      this.roadMachineIM.setMatrixAt(mIdx, d.matrix);

      // Вращающийся стальной валец впереди катка
      const fwdX = Math.sin(a.yaw) * 2.2 * wScale;
      const fwdZ = Math.cos(a.yaw) * 2.2 * wScale;
      d.position.set(rx + fwdX, ry + 0.75 * wScale, rz + fwdZ);
      d.rotation.set(timeSec * 4.5, a.yaw, 0);
      d.scale.set(wScale, wScale, wScale);
      d.updateMatrix();
      this.roadDrumIM.setMatrixAt(mIdx, d.matrix);

      // Пульсирующий оранжевый проблесковый маячок дорожной службы
      const blink = 0.75 + 0.45 * Math.sin(timeSec * 9.0 + i * 1.7);
      d.position.set(rx, ry + 2.9 * wScale, rz);
      d.rotation.set(0, 0, 0);
      d.scale.setScalar(wScale * blink);
      d.updateMatrix();
      this.roadBeaconIM.setMatrixAt(mIdx, d.matrix);
      mIdx++;
    }

    this.roadMachineIM.count = mIdx;
    this.roadDrumIM.count = mIdx;
    this.roadBeaconIM.count = mIdx;
    if (mIdx > 0) {
      this.roadMachineIM.instanceMatrix.needsUpdate = true;
      this.roadDrumIM.instanceMatrix.needsUpdate = true;
      this.roadBeaconIM.instanceMatrix.needsUpdate = true;
    }
  }
}
