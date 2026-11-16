/* 2D-карта: обзор мира, детальный патч, сетка, поселения, масштабная линейка.
   Движение простое: тянуть — сдвиг, колесо — зум, без поворотов. */
import { WORLD2D, settlements, rankSettlements, heightKm, colorAtKm } from './world2d.js';
import { buildRoads, ROAD_CLASS } from './roads2d.js';
import { buildTransport, advance as advanceTransport, vehiclePosition, screenLengthPx, VEHICLE } from './transport2d.js';
import { buildCity, cityLod, cityPopulation, classFor, cityRadiusKm, ZONE, CITY_STREET_SCALE, CITY_BUILDING_SCALE, buildingOutlinePx } from './city2d.js';
import { buildBorders, BORDER } from './borders2d.js';
import { buildEconomy, advanceEconomy, RESOURCE_ORDER, RESOURCE } from './economy2d.js';
import { buildWater, RIVER, riverStrokePx, riverKeepCount, riverVisibleAt } from './rivers2d.js';
import { buildDams, DAM } from './dams2d.js';
import { iceState, lakeFreezes, riverFreezes, iceThicknessCm, north01, tideM, icebreakerAt, ICE } from './ice2d.js';
import { buildTides, tidalBand, tidalQuads, flatsKm, TIDE2D } from './tide2d.js';
import { buildPedestrians, advancePeds, pedPositions, pedBudget, PED, PED_LOD, PED_CAP } from './ped2d.js';
import { MARK_LOD, JUNCTION_LOD, LANES, markingWidthPx, dashPattern, turnRadiusM, isSolidAt,
  junctionType, ringDiameterM, zebra, junctions, roadFill, clipPolyline } from './markings2d.js';
import { lightAt, overlayCss, cityLights, clockText, phaseAt, sunAltitudeDeg, seasonOf, snowCover01, DAY_MINUTES, dayOfYearOf, hourWithPhase } from './light2d.js';
import { screenToWorld, worldToScreen, clampCenter, zoomAt, shiftBy, gridStep, scaleBarKm, patchPixels, fitScale } from './view2d.js';
import { buildMayors, advanceMayors, mayorStats, DRIVER } from './ai2d.js';
import { buildPlay, stepPlay, playStats, PROFILE_COLOR, PLAY2D } from './play2d.js';
import { buildRail, stepRail, trainPoints, buildAir, stepAir, buildSea, stepSea, shipPoint,
  transitStats, RAIL, AIR, SEA } from './transit2d.js';
import { loadFrom, saveTo, elapsedMinutes, catchUp, formatReport, OFFLINE } from './offline2d.js';
import { buildGrowth, applyGrowth, growthStats, progressAt, GROWTH } from './growth2d.js';
import { buildCrowd, stepCrowd, crowdStats, mayCross } from './pedsoc2d.js';

export class Map2D {
  constructor(canvas, hud) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.hud = hud || {};
    this.center = { x: 0, y: 0 };
    this.scale = 0.16;           // пикселей на километр: весь мир 7000 км на экране
    this.minScale = 0.08;
    this.maxScale = 600;          // 1 px ≈ 1.7 м: в этом зуме видно и машину, и дом
    this.overview = null;        // canvas с обзором 700 км
    this.detail = null;          // { canvas, x0, y0, sizeKm }
    this.detailWanted = null;
    this.settlements = settlements();
    this.ranks = rankSettlements(this.settlements, 10);
    this.roads = null;
    this.selected = null;
    this.showGrid = true;
    this.showSettlements = true;
    this.showQ = true;
    this.showRoads = true;
    this.showMarkings = true;   // разметка и развязки §8.9–8.14
    this.showDams = true;       // плотины и ГЭС §5.9
    this.showIce = true;        // лёд и иней §5.11
    this.showTides = true;      // приливные отмели и доки §5.10
    this.tides = null;
    this.ice = null;            // состояние льда на текущий час (пересчитывается по календарю)
    this.dams = null;
    this.junctionCache = null;
    this.showVehicles = true;   // слой транспорта §44
    this.transport = null;
    this.showBorders = true;    // границы §7
    this.borders = null;
    this.showCities = true;     // города §9–§10
    this.cityCache = new Map();
    this.showPeds = true;       // пешеходы §13
    this.pedCache = new Map();
    this.pedsInFrame = 0;
    this.light = lightAt(8 * 60, dayOfYearOf(0));   // время суток §14; обновляется из tick
    this.economy = null;        // экономика §31.33
    this.lastEconomyDay = 0;
    this.showAI = true;        // мэры и журнал «почему» §16.8
    this.mayors = null;
    this.why = [];             // последние решения мэров — то самое «почему»
    this.lastMayorDay = 0;
    this.showPlay = true;      // полигон IDM и светофор §16.4
    this.showTrains = true;    // железная дорога и поезда §16.7
    this.rail = null;
    this.showAir = true;       // аэропорты, самолёты и вышка §16.7
    this.air = null;
    this.showSeaTraffic = true;// суда, фарватер и разводные мосты §16.7
    this.seaTraffic = null;
    this.catchUpReport = null; // что случилось, пока окна не было (F-218…F-220)
    this.showGrowth = true;    // рост городов от решений мэров §16.8
    this.growth = new Map();   // индекс города → что там выросло
    this.showPedAI = true;     // социальные силы и переходы §16.6
    this.crowds = new Map();   // индекс города → толпа
    this.play = null;
    this.showWater = true;      // реки, озёра и мосты §5
    this.water = null;
    this.worker = null;
    this.pendingPatch = false;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.view = { w: 1, h: 1 };
    this.pointer = { x: 0, y: 0, inside: false };
    this.drag = null;
    this.frames = 0; this.fpsT = performance.now(); this.fps = 0;
    this.chunksReady = 0;
  }

  /* ---------------- воркер ---------------- */
  makeWorker() {
    if (typeof Worker === 'undefined' || location.protocol === 'file:') return null;
    try {
      const w = new Worker(new URL('map-worker.min.js', document.baseURI).toString());
      return w;
    } catch (e) { return null; }
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = Math.max(1, Math.round(rect.width * this.dpr));
    this.canvas.height = Math.max(1, Math.round(rect.height * this.dpr));
    this.view.w = rect.width;
    this.view.h = rect.height;
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
  }

  /* ---------------- обзор мира ---------------- */
  async init(onProgress) {
    const size = 1280;
    const worker = this.makeWorker();
    this.worker = worker;

    const canvas = document.createElement('canvas');
    canvas.width = size; canvas.height = size;
    const ctx = canvas.getContext('2d');

    // грубый мир растягиваем на весь холст, резкие плитки потом ложатся поверх
    const paintQuick = (buffer, lowSize) => {
      const tmp = document.createElement('canvas');
      tmp.width = lowSize; tmp.height = lowSize;
      tmp.getContext('2d').putImageData(new ImageData(new Uint8ClampedArray(buffer), lowSize, lowSize), 0, 0);
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(tmp, 0, 0, size, size);
      this.overview = canvas;
    };
    const paintTile = (buffer, tileSize, i, j) => {
      const tmp = document.createElement('canvas');
      tmp.width = tileSize; tmp.height = tileSize;
      tmp.getContext('2d').putImageData(new ImageData(new Uint8ClampedArray(buffer), tileSize, tileSize), 0, 0);
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(tmp, i * tileSize, j * tileSize);
      this.overview = canvas;
    };

    if (worker) {
      await new Promise((resolve) => {
        let settled = false;
        const done = () => { if (!settled) { settled = true; resolve(); } };
        worker.onmessage = (e) => {
          if (e.data.type === 'overview') { paintQuick(e.data.buffer, e.data.size); done(); }
          else if (e.data.type === 'tile') { paintTile(e.data.buffer, e.data.size, e.data.i, e.data.j); this.draw(); }
          else if (e.data.type === 'patch') this.acceptPatch(e.data);
          else if (e.data.type === 'roads') { this.roads = e.data.net; this.buildTransport(); this.draw(); }
        };
        worker.onerror = () => { done(); };
        worker.postMessage({ type: 'overview', size });
        worker.postMessage({ type: 'roads' });
        // запасной путь, если воркер молчит
        setTimeout(() => {
          if (!this.overview) { this.overviewLocal(size); done(); }
        }, 6000);
      });
    } else {
      await nextFrame();
      this.overviewLocal(size);
      this.roads = buildRoads();
      this.buildTransport();
    }

    if (onProgress) onProgress(this.overview ? 1 : 0, 1);
    return this;
  }

  overviewLocal(size) {
    const canvas = document.createElement('canvas');
    canvas.width = size; canvas.height = size;
    const ctx = canvas.getContext('2d');
    const img = ctx.createImageData(size, size);
    const step = WORLD2D.sizeKm / size;
    for (let j = 0; j < size; j++) {
      const y = WORLD2D.halfKm - (j + 0.5) * step;
      for (let i = 0; i < size; i++) {
        const x = -WORLD2D.halfKm + (i + 0.5) * step;
        const [r, g, b] = colorAtKm(x, y);
        const k = (j * size + i) * 4;
        img.data[k] = r; img.data[k + 1] = g; img.data[k + 2] = b; img.data[k + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
    this.overview = canvas;
  }

  /* ---------------- детальный слой ---------------- */
  requestDetail() {
    if (!this.worker || this.scale < 0.55) return;
    const s = this.scale;
    const wKm = Math.min(WORLD2D.sizeKm, Math.max(4, this.view.w / s));
    const hKm = Math.min(WORLD2D.sizeKm, Math.max(4, this.view.h / s));
    const x0 = this.center.x, y0 = this.center.y;
    const w = patchPixels(this.view.w, this.dpr, 768);
    const h = patchPixels(this.view.h, this.dpr, 768);
    const key = [Math.round(x0), Math.round(y0), Math.round(wKm), Math.round(hKm), w, h].join(':');
    if (this.detail && this.detail.key === key) return;
    if (this.detailWanted === key || this.pendingPatch) return;
    this.detailWanted = key;
    this.pendingPatch = true;
    this.worker.postMessage({ type: 'patch', key, x0, y0, wKm, hKm, w, h });
  }

  acceptPatch(data) {
    this.pendingPatch = false;
    if (data.key !== this.detailWanted) return;   // устаревший патч выбрасываем
    const canvas = document.createElement('canvas');
    canvas.width = data.w; canvas.height = data.h;
    const ctx = canvas.getContext('2d');
    ctx.putImageData(new ImageData(new Uint8ClampedArray(data.buffer), data.w, data.h), 0, 0);
    this.detail = { canvas, x0: data.x0, y0: data.y0, wKm: data.wKm, hKm: data.hKm, key: data.key };
  }

  /* ---------------- координаты ---------------- */
  toScreen(x, y) { return worldToScreen(this.center, this.view, this.scale, x, y); }
  toWorld(sx, sy) { return screenToWorld(this.center, this.view, this.scale, sx, sy); }
  clampCenter() { this.center = clampCenter(this.center, this.view, this.scale); }
  shift(dx, dy) { this.center = shiftBy(this.center, this.view, this.scale, dx, dy); }
  fitWorld() {
    this.scale = Math.max(this.minScale, Math.min(this.maxScale, fitScale(this.view)));
    this.center = { x: 0, y: 0 };
    this.clampCenter();
    this.draw();
  }
  /* ближайшее поселение к экранной точке (в пределах 10 px) */
  townAt(sx, sy) {
    let best = null, bestD = 12;
    for (const p of this.settlements) {
      const q = this.toScreen(p.x, p.y);
      const d = Math.hypot(q.x - sx, q.y - sy);
      if (d < bestD) { bestD = d; best = p; }
    }
    return best;
  }

  setZoom(next, anchor) {
    const r = zoomAt(this.center, this.view, this.scale, next, anchor, { min: this.minScale, max: this.maxScale });
    this.center = r.center;
    this.scale = r.scale;
    this.draw();
  }

  /* Транспорт §44: маршруты строятся по готовой сети дорог — A и B у каждой единицы. */
  /* Границы §7: берег, морская граница и 14 регионов — считаются один раз. */
  buildBorders() {
    if (this.borders) return this.borders;
    this.borders = buildBorders(this.settlements, this.ranks);
    return this.borders;
  }

  /* Реки, озёра и мосты §5: сток по сетке 10 км, ~0.9 с один раз при старте. */
  buildWater() {
    if (this.water) return this.water;
    this.water = buildWater(this.roads);
    return this.water;
  }

  /* Порты §5.10: строятся один раз — 4 порта в устьях больших рек у тёплого моря. */
  buildTides() {
    if (this.tides) return this.tides;
    if (!this.water) return null;
    this.tides = buildTides(this.water, this.borders || buildBorders(), this.settlements);
    return this.tides;
  }

  /* Плотины и ГЭС §5.9: 2–3 створа на самых полноводных реках, рядом с городом. */
  buildDams() {
    if (this.dams) return this.dams;
    if (!this.water) return null;
    this.dams = buildDams(this.water, this.settlements, DAM.count);
    return this.dams;
  }

  /* Вода §5: реки — лента шириной по расходу (F-135), озёра — заливка, мосты дороги рисуют сами.
     На мировом обзоре видны только главные реки, вблизи — вся сеть. */
  drawWater(ctx, originX, originY, s) {
    const w = this.water;
    if (!w) return;
    const X = (x) => originX + x * s;
    const Y = (y) => originY - y * s;
    const halfW = this.view.w / 2 / s + 40, halfH = this.view.h / 2 / s + 40;
    const visible = (pts) => {
      let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
      for (const p of pts) {
        if (p.x < x0) x0 = p.x; if (p.x > x1) x1 = p.x;
        if (p.y < y0) y0 = p.y; if (p.y > y1) y1 = p.y;
      }
      return !(x1 < this.center.x - halfW || x0 > this.center.x + halfW ||
               y1 < this.center.y - halfH || y0 > this.center.y + halfH);
    };
    // внутренние моря: вода ниже уровня моря, не связанная с океаном (§5.6)
    const seas = w.inland || [];
    for (const lake of seas) {
      if (Math.abs(lake.x - this.center.x) > halfW + 60 || Math.abs(lake.y - this.center.y) > halfH + 60) continue;
      const ring = lake.ring;
      ctx.beginPath();
      ctx.moveTo(X(ring[0][0]), Y(ring[0][1]));
      for (let i = 1; i < ring.length; i++) ctx.lineTo(X(ring[i][0]), Y(ring[i][1]));
      ctx.closePath();
      ctx.fillStyle = 'rgba(52,110,146,0.97)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(126,182,212,0.6)';
      ctx.lineWidth = Math.max(0.8, Math.min(4, 1.2 * s * 0.3));
      ctx.stroke();
    }
    // озёра — настоящим очертанием (§5.6), а не кружком; зимой северные встают (§5.11)
    const ice = this.showIce ? this.updateIce() : null;
    for (const lake of w.lakes) {
      if (Math.abs(lake.x - this.center.x) > halfW || Math.abs(lake.y - this.center.y) > halfH) continue;
      const ring = lake.ring;
      const frozen = ice && ice.iceByLake && ice.iceByLake.has(lake);
      ctx.beginPath();
      ctx.moveTo(X(ring[0][0]), Y(ring[0][1]));
      for (let i = 1; i < ring.length; i++) ctx.lineTo(X(ring[i][0]), Y(ring[i][1]));
      ctx.closePath();
      // лёд — не белое пятно: голубовато-серый, с береговой кромкой
      ctx.fillStyle = frozen ? 'rgba(196,216,226,0.96)' : 'rgba(58,117,155,0.95)';
      ctx.fill();
      ctx.strokeStyle = frozen ? 'rgba(238,246,250,0.85)' : 'rgba(150,200,222,0.65)';
      ctx.lineWidth = Math.max(0.8, 0.9 * Math.min(3, s * 0.6));
      ctx.stroke();
      ctx.strokeStyle = frozen ? 'rgba(120,150,170,0.8)' : 'rgba(34,78,110,0.55)';
      ctx.lineWidth = 0.6;
      ctx.stroke();
      // трещины на льду — в глубоком зуме, по хешу озера
      if (frozen && s >= 40) {
        const cm = ice.iceByLake.get(lake);
        let h = Math.round((lake.x * 7 + lake.y * 13) % 1000) | 0;
        const rnd = () => { h = (h * 1103515245 + 12345) & 0x7fffffff; return h / 0x7fffffff; };
        ctx.strokeStyle = 'rgba(120,148,168,' + Math.min(0.75, 0.25 + cm / 140) + ')';
        ctx.lineWidth = Math.max(0.6, s / 900);
        const n = Math.min(9, 3 + Math.round(cm / 12));
        for (let k = 0; k < n; k++) {
          const a = rnd() * Math.PI * 2, r = rnd() * 0.55;
          const cx0 = lake.x + Math.cos(a) * r * (lake.areaKm2 ** 0.5) * 0.02;
          const cy0 = lake.y + Math.sin(a) * r * (lake.areaKm2 ** 0.5) * 0.02;
          const len = 0.25 + rnd() * 0.9;
          const ang = rnd() * Math.PI;
          ctx.beginPath();
          ctx.moveTo(X(cx0), Y(cy0));
          ctx.lineTo(X(cx0 + Math.cos(ang) * len), Y(cy0 + Math.sin(ang) * len));
          ctx.stroke();
        }
      }
    }
    // реки: главные заметны всегда, остальные — с 0.4 px ширины
    ctx.strokeStyle = RIVER.riverColor;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    // Генерализация §5.5: на обзоре страны рисуем только крупнейшие русла — иначе карта
    // превращается в «дождь» из четырёх тысяч коротких ручьёв (R-50.14)
    if (!this.riverRank) {
      // значимость = длина русла (точек × 3 км), а не расход: расход в модели насыщается,
      // и по нему на обзор вылезали короткие ручьи-«гребёнки» (R-50.14)
      const order = w.rivers.lines.map((l, i) => i)
        .sort((a, b) => w.rivers.lines[b].pts.length - w.rivers.lines[a].pts.length);
      this.riverRank = new Map(order.map((idx, r) => [idx, r]));
    }
    const keep = riverKeepCount(s, w.rivers.lines.length);
    for (let ri = 0; ri < w.rivers.lines.length; ri++) {
      const line = w.rivers.lines[ri];
      if (!riverVisibleAt(s, line.pts.length, this.riverRank.get(ri), keep)) continue;
      // ширина русла в МЕТРАХ → в пиксели: /1000 (было widthM * s — река в 1000 раз толще,
      // отсюда «огромные синие пятна» на обзоре, R-50.13)
      const main = line.flowKm2 > 40000;
      const rank = this.riverRank.get(ri);
      if (!main && line.flowKm2 < 4000 && (line.widthM / 1000) * s < 0.12) continue;
      if (!visible(line.pts)) continue;
      ctx.lineWidth = riverStrokePx(line.widthM, s, main || rank < 40);
      // §5.11: мелкая таёжная река зимой встаёт — рисуем льдом, а не водой
      const iced = ice && riverFreezes(line.widthM, ice.snow, north01(line.pts[0].y));
      if (iced) {
        ctx.strokeStyle = 'rgba(206,224,232,0.95)';
        ctx.globalAlpha = rank < 60 ? 0.85 : 0.45;
      } else {
        ctx.strokeStyle = RIVER.riverColor;
        ctx.globalAlpha = rank < 40 ? 0.9 : 0.5;
      }
      ctx.beginPath();
      ctx.moveTo(X(line.pts[0].x), Y(line.pts[0].y));
      for (let i = 1; i < line.pts.length; i++) ctx.lineTo(X(line.pts[i].x), Y(line.pts[i].y));
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    ctx.strokeStyle = RIVER.riverColor;
  }

  /* Экономика §31.33: население, угодья, приход и расход ресурсов. */
  buildEconomy() {
    if (this.economy) return this.economy;
    this.economy = buildEconomy(this.settlements, this.ranks);
    return this.economy;
  }

  /* Раскладка города: считается при первом подходе и лежит в кэше. */
  cityAt(index) {
    if (!this.cityCache.has(index)) {
      this.cityCache.set(index, buildCity(this.settlements[index], index, this.ranks));
    }
    return this.cityCache.get(index);
  }

  buildTransport() {
    if (!this.roads) return null;
    const t0 = (typeof performance !== 'undefined' ? performance.now() : Date.now());
    this.transport = buildTransport(this.roads, this.settlements);
    this.transport.buildMs = Math.round((typeof performance !== 'undefined' ? performance.now() : Date.now()) - t0);
    return this.transport;
  }

  /* Шаг мира: реальные секунды → игровые часы (F-120). */
  tick(dtSec) {
    if (this.transport) advanceTransport(this.transport, dtSec);
    this.updateLight();
    if (this.showPeds) for (const pack of this.pedCache.values()) advancePeds(pack, dtSec);
    if (this.transport) {
      const day = Math.floor(this.transport.minutes / 1440);
      if (this.economy && day > this.lastEconomyDay) {
        advanceEconomy(this.economy, day - this.lastEconomyDay);
        this.lastEconomyDay = day;
        this.updateEconomyPanel();
      }
      // §16.8: мэр думает раз в игровой день — свои часы, независимо от панели страны
      if (this.showAI && day > this.lastMayorDay) {
        const mayors = this.buildMayorsLayer();
        const events = advanceMayors(mayors, this.why, day - this.lastMayorDay);
        this.lastMayorDay = day;
        // R-16.28: решение видно в мире — дома, парк, объездная
        if (this.showGrowth) {
          for (const e of events) {
            const g = this.growthAt(e.index);
            applyGrowth(g, e.action, g.decisions, day);
          }
        }
        this.updateWhyPanel(events);
      }
    }
    if (this.showTrains && this.roads) stepRail(this.buildRailLayer(), dtSec);
    if (this.showAir) stepAir(this.buildAirLayer(), dtSec);
    if (this.showSeaTraffic && this.water) {
      const sea = this.buildSeaLayer();
      const tides = this.buildTides();
      const bridges = (this.water.bridges && this.water.bridges.list) || [];
      stepSea(sea, tides.ports, dtSec, bridges, this.transport ? this.transport.minutes : 0);
    }
    if (this.showPedAI && this.showPeds) this.stepCrowds(dtSec);
    this.updatePlay(dtSec);
  }

  /* ---------------- отрисовка ---------------- */
  /* Ключ неподвижных слоёв: пока камера и галочки не менялись, мир не пересобирается,
     а живой транспорт рисуется поверх готовой картинки (§44.10). */
  staticKey() {
    const d = this.detail;
    return [
      this.view.w, this.view.h, this.dpr, this.center.x, this.center.y, this.scale,
      this.showGrid ? 1 : 0, this.showRoads ? 1 : 0, this.showSettlements ? 1 : 0, this.showQ ? 1 : 0,
      this.showBorders ? 1 : 0, this.showCities ? 1 : 0, this.borders ? 1 : 0,
      this.showWater ? 1 : 0, this.water ? 1 : 0,
      this.overview ? this.overview.width : 0,
      d ? d.canvas.width + ':' + d.x0.toFixed(2) + ':' + d.y0.toFixed(2) : '',
      this.selected ? this.selected.name : ''
    ].join('|');
  }

  draw() {
    const { ctx, view } = this;
    const key = this.staticKey();
    if (key !== this.paintedKey || !this.staticLayer) {
      this.paintStatic(key);
      this.paintedKey = key;
    }
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.drawImage(this.staticLayer, 0, 0);
    ctx.restore();

    const s = this.scale;
    const originX = view.w / 2 - this.center.x * s;
    const originY = view.h / 2 + this.center.y * s;
    if (this.showVehicles && this.transport) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(originX - WORLD2D.halfKm * s, originY - WORLD2D.halfKm * s, WORLD2D.sizeKm * s, WORLD2D.sizeKm * s);
      ctx.clip();
      this.drawVehicles(ctx, originX, originY, s);
      ctx.restore();
    }
    if (this.showPeds && s >= PED_LOD) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(originX - WORLD2D.halfKm * s, originY - WORLD2D.halfKm * s, WORLD2D.sizeKm * s, WORLD2D.sizeKm * s);
      ctx.clip();
      this.drawPeds(ctx, originX, originY, s);
      ctx.restore();
    }

    /* §14: ночь и огни. Сначала всё притухает наложением, потом поверх зажигаются окна
       и фонари — так город ночью читается, а не просто «темнеет». */
    const light = this.light || this.updateLight();
    if (light.strength < 0.98) {
      ctx.save();
      ctx.fillStyle = overlayCss(light.strength, light.tone);
      ctx.fillRect(0, 0, view.w, view.h);
      ctx.restore();
    }
    if (light.artificial.windows > 0.02) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(originX - WORLD2D.halfKm * s, originY - WORLD2D.halfKm * s, WORLD2D.sizeKm * s, WORLD2D.sizeKm * s);
      ctx.clip();
      this.drawLights(ctx, originX, originY, s, light.artificial);
      ctx.restore();
    }

    this.frames++;
    const now = performance.now();
    if (now - this.fpsT > 500) {
      this.fps = Math.round(this.frames * 1000 / (now - this.fpsT));
      this.frames = 0; this.fpsT = now;
      this.updateHud();
    }
  }

  /* Неподвижный слой: море, обзор, патч, сетка, дороги, поселения, Q-кольцо, линейка. */
  paintStatic(key) {
    if (!this.staticLayer) {
      this.staticLayer = document.createElement('canvas');
      this.staticCtx = this.staticLayer.getContext('2d');
    }
    const layer = this.staticLayer;
    const pw = Math.max(1, Math.round(this.view.w * this.dpr));
    const ph = Math.max(1, Math.round(this.view.h * this.dpr));
    if (layer.width !== pw || layer.height !== ph) { layer.width = pw; layer.height = ph; }
    const ctx = this.staticCtx;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    const { view } = this;

    ctx.fillStyle = '#0d2233';
    ctx.fillRect(0, 0, view.w, view.h);

    const s = this.scale;
    const originX = view.w / 2 - this.center.x * s;
    const originY = view.h / 2 + this.center.y * s;

    if (this.overview) {
      ctx.imageSmoothingEnabled = s < 2.2;
      ctx.drawImage(this.overview, originX - WORLD2D.halfKm * s, originY - WORLD2D.halfKm * s, WORLD2D.sizeKm * s, WORLD2D.sizeKm * s);
    }

    if (this.detail && s >= 0.55) {
      const d = this.detail;
      ctx.imageSmoothingEnabled = false;
      const dx = originX + (d.x0 - d.wKm / 2) * s;
      const dy = originY - (d.y0 + d.hKm / 2) * s;
      ctx.drawImage(d.canvas, dx, dy, d.wKm * s, d.hKm * s);
    }

    ctx.save();
    ctx.beginPath();
    ctx.rect(originX - WORLD2D.halfKm * s, originY - WORLD2D.halfKm * s, WORLD2D.sizeKm * s, WORLD2D.sizeKm * s);
    ctx.clip();

    if (this.showWater && this.water) this.drawWater(ctx, originX, originY, s);
    if (this.showDams && this.showMarkings !== null && this.buildDams()) this.drawDams(ctx, originX, originY, s);
    if (this.showIce && this.ice) this.drawIce(ctx, originX, originY, s);
    if (this.showTides && this.buildTides()) this.drawTides(ctx, originX, originY, s);
    if (this.showBorders && this.borders) this.drawBorders(ctx, originX, originY, s);
    if (this.showRoads && this.roads) this.drawRoads(ctx, originX, originY, s);
    if (this.showRoads && this.showMarkings && this.roads && s >= JUNCTION_LOD) this.drawJunctions(ctx, originX, originY, s);
    if (this.showRoads && this.showMarkings && this.roads && s >= MARK_LOD) this.drawMarkings(ctx, originX, originY, s);
    if (this.showTrains && this.rail && s >= 0.35) this.drawRail(ctx, originX, originY, s);
    if (this.showCities && cityLod(s) > 0) this.drawCities(ctx, originX, originY, s);
    if (this.showTrains && this.rail && s >= 6) this.drawTrains(ctx, originX, originY, s);
    if (this.showSeaTraffic && this.seaTraffic && s >= 0.3) this.drawSeaTraffic(ctx, originX, originY, s);
    if (this.showAir && this.air && s >= 1.0) this.drawAirports(ctx, originX, originY, s);
    if (this.showAir && this.air) this.drawPlanes(ctx, originX, originY, s);
    if (this.showGrid) this.drawGrid(ctx, originX, originY, s);
    if (this.showSettlements) this.drawSettlements(ctx, originX, originY, s);
    if (this.showQ) this.drawQ(ctx, originX, originY, s);
    ctx.restore();

    this.drawScaleBar(ctx);
    if (this.showPlay && this.play) this.drawPlayPanel(ctx);
    this.paintedKey = key;
  }

  /* Границы §7: регионы — тонкий пунктир, государственная — охра, морская — пунктир по воде. */
  drawBorders(ctx, originX, originY, s) {
    const b = this.borders;
    if (!b) return;
    const X = (x) => originX + x * s;
    const Y = (y) => originY - y * s;

    // регионы: 14 областей, линии тонкие и тихие
    ctx.strokeStyle = 'rgba(138,115,80,0.55)';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 4]);
    ctx.beginPath();
    for (const line of b.regions) {
      ctx.moveTo(X(line[0][0]), Y(line[0][1]));
      for (let i = 1; i < line.length; i++) ctx.lineTo(X(line[i][0]), Y(line[i][1]));
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // государственная граница: тёмная подложка + светлая нить — читается на любом фоне
    ctx.lineJoin = 'round';
    ctx.strokeStyle = 'rgba(40,20,14,0.55)';
    ctx.lineWidth = Math.max(2.6, 0.01 * s);
    ctx.beginPath();
    for (const line of b.coast) {
      ctx.moveTo(X(line[0][0]), Y(line[0][1]));
      for (let i = 1; i < line.length; i++) ctx.lineTo(X(line[i][0]), Y(line[i][1]));
    }
    ctx.stroke();
    ctx.strokeStyle = BORDER.coastTone;
    ctx.lineWidth = Math.max(1.4, 0.006 * s);
    ctx.stroke();

    // морская граница — пунктир по воде (§7.6)
    ctx.strokeStyle = BORDER.seaTone;
    ctx.lineWidth = Math.max(1, 0.004 * s);
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    for (const line of b.sea) {
      ctx.moveTo(X(line[0][0]), Y(line[0][1]));
      for (let i = 1; i < line.length; i++) ctx.lineTo(X(line[i][0]), Y(line[i][1]));
    }
    ctx.stroke();
    ctx.setLineDash([]);
  }

  /* Города §9–§10: пятно застройки, улицы и — в глубоком зуме — отдельные здания. */
  drawCities(ctx, originX, originY, s) {
    const lod = cityLod(s);
    const view = this.view;
    const pad = 80;
    for (let i = 0; i < this.settlements.length; i++) {
      const t = this.settlements[i];
      const sx = originX + t.x * s, sy = originY - t.y * s;
      if (sx < -pad || sy < -pad || sx > view.w + pad || sy > view.h + pad) continue;
      const city = this.cityAt(i);
      const X = (x) => originX + x * s;
      const Y = (y) => originY - y * s;

      // кварталы — по зонам §9.9: парк зелёный, промзона серая, центр тёплый, частный сектор светлый
      if (lod >= 1) {
        for (const bl of city.blocks) {
          const c = bl.corners;
          ctx.beginPath();
          ctx.moveTo(X(c[0][0]), Y(c[0][1]));
          for (let k = 1; k < c.length; k++) ctx.lineTo(X(c[k][0]), Y(c[k][1]));
          ctx.closePath();
          ctx.fillStyle = (ZONE[bl.zone] || ZONE.mid).fill;
          ctx.fill();
        }
      }

      // улицы: переулки тише, проспекты ярче; кольцевые — ломаной pts (R-9.6)
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      const drawStreet = (st, style, minPx) => {
        const pts = st.pts || [st.a, st.b];
        if (!pts || pts.length < 2) return;
        ctx.strokeStyle = style;
        ctx.lineWidth = Math.max(minPx, (st.widthM / 1000) * s);
        ctx.beginPath();
        ctx.moveTo(X(pts[0][0]), Y(pts[0][1]));
        for (let k = 1; k < pts.length; k++) ctx.lineTo(X(pts[k][0]), Y(pts[k][1]));
        ctx.stroke();
      };
      for (const st of city.streets) if (!st.major) drawStreet(st, 'rgba(244,238,226,0.62)', 0.6);
      for (const st of city.streets) if (st.major) drawStreet(st, 'rgba(252,248,238,0.95)', 1);

      // парки: деревья в глубоком зуме, чтобы зелёное пятно читалось как парк
      if (lod >= 2) {
        ctx.fillStyle = 'rgba(72,104,60,0.75)';
        for (const bl of city.blocks) {
          if (bl.zone !== 'park') continue;
          const c = bl.corners;
          let bx0 = Infinity, bx1 = -Infinity, by0 = Infinity, by1 = -Infinity;
          for (const q of c) {
            const px = X(q[0]), py = Y(q[1]);
            if (px < bx0) bx0 = px; if (px > bx1) bx1 = px;
            if (py < by0) by0 = py; if (py > by1) by1 = py;
          }
          const step = 9;
          for (let yy = by0 + 4; yy < by1 - 2; yy += step) {
            for (let xx = bx0 + 4; xx < bx1 - 2; xx += step) {
              if ((xx * 7 + yy * 13) % 11 > 6) continue;
              ctx.beginPath();
              ctx.arc(xx, yy, Math.max(1, 0.5 + s * 0.004), 0, Math.PI * 2);
              ctx.fill();
            }
          }
        }
      }

      // §16.8: объездная и расширенная дорога видны уже с общего вида города
      if (this.showGrowth && this.growth.has(i)) this.drawGrowth(ctx, X, Y, s, lod, this.growth.get(i), false);

      if (lod < 2) continue;
      // здания: пятно + крыша
      const cw = ctx.canvas.width, ch = ctx.canvas.height;
      for (const b of city.buildings) {
        const c = b.corners;
        // отсечение по экрану: у столицы 2400 домов, за кадром их рисовать незачем
        let bx0 = Infinity, bx1 = -Infinity, by0 = Infinity, by1 = -Infinity;
        for (const q of c) {
          const px = X(q[0]), py = Y(q[1]);
          if (px < bx0) bx0 = px; if (px > bx1) bx1 = px;
          if (py < by0) by0 = py; if (py > by1) by1 = py;
        }
        if (bx1 < -4 || by1 < -4 || bx0 > cw + 4 || by0 > ch + 4) continue;
        // генерализация: дом мельче 1.6 px растягиваем вокруг центра, иначе квартал выглядит пустым
        const span = Math.max(bx1 - bx0, by1 - by0, 0.01);
        const grow = span < 1.6 ? Math.min(3.2, 1.6 / span) : 1;
        const cxm = (bx0 + bx1) / 2, cym = (by0 + by1) / 2;
        ctx.beginPath();
        ctx.moveTo(cxm + (X(c[0][0]) - cxm) * grow, cym + (Y(c[0][1]) - cym) * grow);
        for (let k = 1; k < c.length; k++) ctx.lineTo(cxm + (X(c[k][0]) - cxm) * grow, cym + (Y(c[k][1]) - cym) * grow);
        ctx.closePath();
        // R-52.7: дом мельче 1.6 px растягиваем и обводим, иначе квартал — светлая «крупа»
        const outPx = buildingOutlinePx(span * grow);
        if (outPx > 0) {
          ctx.fillStyle = 'rgba(46,42,34,0.28)';
          ctx.fill();   // тёмная подложка по тому же контуру
        }
        ctx.fillStyle = b.wall;
        ctx.fill();
        // обводка: тонкая кромка при 1.6 px, крыша — когда дом крупнее 3 px (R-52.7)
        if (outPx > 0) {
          ctx.strokeStyle = b.roof;
          ctx.lineWidth = outPx;
          ctx.stroke();
        }
      }

      // §16.8: новые дома, парк, склады и школа/больница — поверх старых кварталов
      if (this.showGrowth && this.growth.has(i)) this.drawGrowth(ctx, X, Y, s, lod, this.growth.get(i), true);
    }
  }

  /* Пешеходы §13: точка с подшагом ног. Видны с 40 px/км и не больше 400 в кадре,
     иначе на карте не жизнь, а «крупа» (R-13.1 в редакции 2D). */
  /* §16.8: мэры строятся один раз при первом дне — 39 городов от 25 000 жителей. */
  buildMayorsLayer() {
    if (this.mayors) return this.mayors;
    this.mayors = buildMayors(this.settlements, this.ranks);
    return this.mayors;
  }

  /* §16.7: рельсы строятся из магистралей один раз — 98 перегонов и 8 составов. */
  buildRailLayer() {
    if (this.rail) return this.rail;
    this.rail = buildRail(this.roads || buildRoads(), this.settlements);
    return this.rail;
  }

  buildAirLayer() {
    if (this.air) return this.air;
    this.air = buildAir(this.settlements, this.ranks);
    return this.air;
  }

  buildSeaLayer() {
    if (this.seaTraffic) return this.seaTraffic;
    const tides = this.buildTides();
    const bridges = (this.water && this.water.bridges && this.water.bridges.list) || [];
    this.seaTraffic = buildSea(tides.ports, bridges);
    return this.seaTraffic;
  }

  /* F-218…F-220: пока окна не было, страна жила числами — догоняем теми же системами. */
  catchUpOffline(minutes, now = Date.now()) {
    const days = Math.floor(minutes / 1440);
    const leftMin = minutes - days * 1440;
    if (this.transport) this.transport.minutes += leftMin;
    const self = this;
    const report = catchUp({
      transport: this.transport,
      economy: this.economy,
      advanceEconomy: advanceEconomy,
      mayors: this.showAI ? this.buildMayorsLayer() : null,
      journal: this.why,
      advanceMayors: advanceMayors,
      applyGrowth: (index, action) => {
        const g = self.growthAt(index, true);
        return applyGrowth(g, action, g.decisions, Math.floor(self.transport.minutes / 1440));
      }
    }, days);
    if (report.days) {
      this.lastMayorDay = Math.floor(this.transport.minutes / 1440);
      this.lastEconomyDay = this.lastMayorDay;
      this.catchUpReport = report;
      this.updateWhyPanel(this.why.slice(-3));
    }
    return report;
  }

  /* §16.7: железная дорога. На обзоре — тонкая нить вдоль трассы, в зуме — два рельса
     и шпалы, а по ним идут составы: голова, вагоны и огонёк спереди. */
  drawRail(ctx, originX, originY, s) {
    const X = (x) => originX + x * s;
    const Y = (y) => originY - y * s;
    const view = this.view, pad = 60;
    const halfW = view.w / 2 / s + 20, halfH = view.h / 2 / s + 20;
    const deep = s >= 70, mid = s >= 6;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    for (const line of this.rail.lines) {
      // грубое отсечение по габаритам перегона
      let mx = 0, my = 0;
      for (const p of line.pts) { mx += p[0]; my += p[1]; }
      mx /= line.pts.length; my /= line.pts.length;
      if (Math.abs(mx - this.center.x) > halfW + line.lengthKm / 2 || Math.abs(my - this.center.y) > halfH + line.lengthKm / 2) continue;

      ctx.strokeStyle = 'rgba(30,28,26,0.55)';
      ctx.lineWidth = Math.max(1.1, Math.min(4, 0.004 * s + 1));
      ctx.beginPath();
      ctx.moveTo(X(line.pts[0][0]), Y(line.pts[0][1]));
      for (let k = 1; k < line.pts.length; k++) ctx.lineTo(X(line.pts[k][0]), Y(line.pts[k][1]));
      ctx.stroke();

      if (deep) {
        // два рельса: колея 1.52 м
        const off = 0.00076 * s;
        if (off >= 0.35) {
          ctx.strokeStyle = 'rgba(206,214,220,0.75)';
          ctx.lineWidth = 0.7;
          for (const side of [-1, 1]) {
            ctx.beginPath();
            for (let k = 1; k < line.pts.length; k++) {
              const dx = line.pts[k][0] - line.pts[k - 1][0], dy = line.pts[k][1] - line.pts[k - 1][1];
              const l = Math.max(1e-9, Math.hypot(dx, dy));
              const nx = -dy / l * 0.00076 * side, ny = dx / l * 0.00076 * side;
              if (k === 1) ctx.moveTo(X(line.pts[0][0] + nx), Y(line.pts[0][1] + ny));
              ctx.lineTo(X(line.pts[k][0] + nx), Y(line.pts[k][1] + ny));
            }
            ctx.stroke();
          }
        }
        // шпалы
        const stepKm = 0.012;
        if (s * stepKm >= 2) {
          ctx.strokeStyle = 'rgba(92,74,56,0.55)';
          ctx.lineWidth = Math.max(0.6, s * 0.0016);
          ctx.beginPath();
          for (let d = 0; d < line.lengthKm; d += stepKm) {
            const p = pointOnLineLocal(line, d);
            if (Math.abs(p.x - this.center.x) > halfW || Math.abs(p.y - this.center.y) > halfH) continue;
            const px = X(p.x), py = Y(p.y);
            if (px < -pad || py < -pad || px > view.w + pad || py > view.h + pad) continue;
            ctx.moveTo(px - p.dy * 2.6, py + p.dx * 2.6);
            ctx.lineTo(px + p.dy * 2.6, py - p.dx * 2.6);
          }
          ctx.stroke();
        }
      }
      if (s >= 12) {
        ctx.fillStyle = 'rgba(246,240,228,0.9)';
        for (const st of this.rail.stations) {
          if (st.index !== line.from && st.index !== line.to) continue;
          const px = X(st.x), py = Y(st.y);
          if (px < -6 || py < -6 || px > view.w + 6 || py > view.h + 6) continue;
          ctx.beginPath();
          ctx.rect(px - 2.2, py - 2.2, 4.4, 4.4);
          ctx.fill();
        }
      }
    }

    if (!mid) return;
  }

  /* §16.7: составы рисуются поверх застройки — поезд в городе не должен прятаться под кварталами. */
  drawTrains(ctx, originX, originY, s) {
    const X = (x) => originX + x * s;
    const Y = (y) => originY - y * s;
    const pad = 60;
    for (const t of this.rail.trains) {
      const pts = trainPoints(this.rail, t);
      if (!pts) continue;
      const px = X(pts.x), py = Y(pts.y);
      if (px < -pad || py < -pad || px > view.w + pad || py > view.h + pad) continue;
      const w = Math.max(2.2, Math.min(7, s * 0.0026));
      ctx.strokeStyle = 'rgba(16,20,24,0.85)';
      ctx.lineWidth = w + 1.8;
      ctx.beginPath();
      ctx.moveTo(px, py);
      for (const q of pts.tail) ctx.lineTo(X(q.x), Y(q.y));
      ctx.stroke();
      ctx.strokeStyle = t.tone;
      ctx.lineWidth = w;
      ctx.beginPath();
      ctx.moveTo(px, py);
      for (const q of pts.tail) ctx.lineTo(X(q.x), Y(q.y));
      ctx.stroke();
      // голова состава: локомотив светится
      ctx.fillStyle = t.state === 'wait' ? '#ff8f6a' : '#fff4c2';
      ctx.beginPath();
      ctx.arc(px, py, w * 0.55 + 1, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  /* §16.7: аэропорты — полоса, перрон и круг ожидания. */
  drawAirports(ctx, originX, originY, s) {
    const X = (x) => originX + x * s;
    const Y = (y) => originY - y * s;
    for (const a of this.air.airports) {
      const px = X(a.x), py = Y(a.y);
      if (px < -200 || py < -200 || px > this.view.w + 200 || py > this.view.h + 200) continue;
      const L = AIR.runwayKm * s;
      const ca = Math.cos(a.heading), sa = Math.sin(a.heading);
      // круг ожидания — если кто-то ждёт
      if (this.air.planes.some((p) => p.state === 'hold' && p.to === a.index)) {
        ctx.strokeStyle = 'rgba(255,214,110,0.45)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 5]);
        ctx.beginPath();
        ctx.arc(px, py, AIR.holdKm * s, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }
      // полоса
      ctx.strokeStyle = 'rgba(58,58,62,0.95)';
      ctx.lineWidth = Math.max(2.2, AIR.runwayM * s / 1000);
      ctx.beginPath();
      ctx.moveTo(px - ca * L / 2, py + sa * L / 2);
      ctx.lineTo(px + ca * L / 2, py - sa * L / 2);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(244,244,238,0.85)';
      ctx.lineWidth = Math.max(0.6, s * 0.0012);
      ctx.setLineDash([Math.max(2, s * 0.02), Math.max(2, s * 0.02)]);
      ctx.beginPath();
      ctx.moveTo(px - ca * L / 2, py + sa * L / 2);
      ctx.lineTo(px + ca * L / 2, py - sa * L / 2);
      ctx.stroke();
      ctx.setLineDash([]);
      // перрон
      ctx.fillStyle = 'rgba(210,208,200,0.85)';
      ctx.beginPath();
      ctx.arc(px - sa * Math.max(4, s * 0.06), py - ca * Math.max(4, s * 0.06), Math.max(2, s * 0.012), 0, Math.PI * 2);
      ctx.fill();
    }
  }

  /* §16.7: самолёты — треугольник носом по курсу, на круге видно, кто ждёт полосу. */
  drawPlanes(ctx, originX, originY, s) {
    const X = (x) => originX + x * s;
    const Y = (y) => originY - y * s;
    for (const p of this.air.planes) {
      const px = X(p.x), py = Y(p.y);
      if (px < -30 || py < -30 || px > this.view.w + 30 || py > this.view.h + 30) continue;
      const to = this.air.airports.find((a) => a.index === p.to);
      const from = this.air.airports.find((a) => a.index === p.from);
      let ca = 1, sa = 0;
      if (p.state === 'hold' && to) { ca = -Math.sin(p.holdAngle); sa = Math.cos(p.holdAngle); }
      else if (to && from && p.state !== 'taxi') {
        const dx = to.x - from.x, dy = to.y - from.y, l = Math.max(1e-9, Math.hypot(dx, dy));
        ca = dx / l; sa = dy / l;
      } else if (to) { ca = Math.cos(to.heading); sa = Math.sin(to.heading); }
      const r = Math.max(3, Math.min(9, s * 0.022));
      ctx.fillStyle = p.state === 'hold' ? '#ffd75e' : p.state === 'runway' ? '#9fe0a0' : '#f4f6f8';
      ctx.strokeStyle ='rgba(20,26,32,0.7)';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(px + ca * r, py - sa * r);
      ctx.lineTo(px - ca * r * 0.55 + sa * r * 0.7, py + sa * r * 0.55 + ca * r * 0.7);
      ctx.lineTo(px - ca * r * 0.55 - sa * r * 0.7, py + sa * r * 0.55 - ca * r * 0.7);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
  }

  /* §16.7: суда и диспетчер — фарватер, разводные мосты и швартовка. */
  drawSeaTraffic(ctx, originX, originY, s) {
    const X = (x) => originX + x * s;
    const Y = (y) => originY - y * s;
    const ports = this.tides ? this.tides.ports : [];
    ctx.strokeStyle = 'rgba(120,190,220,0.22)';
    ctx.lineWidth = Math.max(0.8, Math.min(3, s * 0.0016));
    ctx.setLineDash([Math.max(3, s * 0.03), Math.max(4, s * 0.03)]);
    for (const lane of this.seaTraffic.lanes) {
      const A = ports[lane.a], B = ports[lane.b];
      if (!A || !B) continue;
      ctx.beginPath();
      ctx.moveTo(X(A.x), Y(A.y));
      ctx.lineTo(X(B.x), Y(B.y));
      ctx.stroke();
    }
    ctx.setLineDash([]);
    // разводные мосты
    for (const lane of this.seaTraffic.lanes) {
      for (const br of lane.bridges || []) {
        const px = X(br.x), py = Y(br.y);
        if (px < -20 || py < -20 || px > this.view.w + 20 || py > this.view.h + 20) continue;
        const size = Math.max(4, s * 0.02);
        ctx.strokeStyle = 'rgba(60,56,50,0.9)';
        ctx.lineWidth = Math.max(1.2, s * 0.0025);
        ctx.beginPath();
        ctx.moveTo(px - size, py - size * 0.4);
        ctx.lineTo(px + size, py + size * 0.4);
        ctx.stroke();
        ctx.fillStyle = 'rgba(255,214,110,0.9)';
        ctx.beginPath();
        ctx.arc(px - size, py - size * 0.4, Math.max(1.2, s * 0.003), 0, Math.PI * 2);
        ctx.arc(px + size, py + size * 0.4, Math.max(1.2, s * 0.003), 0, Math.PI * 2);
        ctx.fill();
      }
    }
    // суда
    for (const ship of this.seaTraffic.ships) {
      const p = shipPoint(this.seaTraffic, ship, ports);
      if (!p) continue;
      const px = X(p.x), py = Y(p.y);
      if (px < -25 || py < -25 || px > this.view.w + 25 || py > this.view.h + 25) continue;
      const lane = this.seaTraffic.lanes.find((l) => l.id === ship.lane);
      const A = ports[lane.a], B = ports[lane.b];
      const dx = B.x - A.x, dy = B.y - A.y, l = Math.max(1e-9, Math.hypot(dx, dy));
      const dirX = (dx / l) * ship.dir, dirY = (dy / l) * ship.dir;
      const len = Math.max(6, Math.min(26, 0.12 * s));
      ctx.strokeStyle = 'rgba(12,26,34,0.6)';
      ctx.lineWidth = Math.max(2, len * 0.28) + 1.4;
      ctx.beginPath();
      ctx.moveTo(px - dirX * len / 2, py + dirY * len / 2);
      ctx.lineTo(px + dirX * len / 2, py - dirY * len / 2);
      ctx.stroke();
      ctx.strokeStyle = ship.state === 'bridge' ? '#ffd75e' : '#e6f2f8';
      ctx.lineWidth = Math.max(2, len * 0.28);
      ctx.stroke();
      // кильватерный след
      if (ship.v > 0 && s >= 4) {
        ctx.strokeStyle = 'rgba(230,242,248,0.25)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(px - dirX * len * 0.6, py + dirY * len * 0.6);
        ctx.lineTo(px - dirX * len * 2.4, py + dirY * len * 2.4);
        ctx.stroke();
      }
    }
  }

  /* §16.8: что выросло в городе от решений мэра (R-16.28). При догоне §98 раскладку
     города не строим: радиус берём из населения — иначе 82 раскладки стоят полсекунды. */
  growthAt(index, fast = false) {
    if (!this.growth.has(index)) {
      if (fast) {
        const cls = classFor(this.settlements[index], index, this.ranks);
        const r = cityRadiusKm(cityPopulation(cls, index));
        this.growth.set(index, buildGrowth(this.settlements[index], null, r));
      } else {
        this.growth.set(index, buildGrowth(this.settlements[index], this.cityAt(index)));
      }
    }
    return this.growth.get(index);
  }

  /* §16.6: толпа города — стороны тротуаров, желание перейти и давление соседей. */
  crowdAt(index) {
    if (!this.crowds.has(index)) {
      const pack = this.pedsAt(index);
      this.crowds.set(index, buildCrowd(pack, 424242 + index));
    }
    return this.crowds.get(index);
  }

  /* §16.4: полигон IDM — 12 машин на кольце и светофор, живой кусок тех же мозгов. */
  updatePlay(dtSec) {
    if (!this.play) this.play = buildPlay();
    if (this.showPlay) stepPlay(this.play, Math.min(0.5, dtSec));
    return this.play;
  }

  /* Время суток §14: минуты мира → фаза, сила света и расписание огней. */
  updateLight() {
    const m = this.transport ? this.transport.minutes : 8 * 60;
    this.light = lightAt(m, dayOfYearOf(Math.floor(m / DAY_MINUTES)));
    return this.light;
  }

  /* Лёд и иней §5.11: пересчитываем не каждый кадр, а раз в игровой час — за это время
     ничего не меняется, а обход 5294 русел и 25 озёр стоит денег. */
  updateIce() {
    const m = Math.floor((this.transport ? this.transport.minutes : 8 * 60) / 60) * 60;
    const key = m + ':' + Math.round(this.center.y);
    if (this.ice && this.iceKey === key) return this.ice;
    this.iceKey = key;
    this.ice = iceState(this.water, this.light, {
      minutes: m, doy: dayOfYearOf(Math.floor(m / DAY_MINUTES)), centerY: this.center.y
    });
    return this.ice;
  }

  /* Перевести часы на нужную фазу (утро, вечер): час ищется по текущему сезону. */
  setClockPhase(phaseId) {
    const day = this.transport ? Math.floor(this.transport.minutes / DAY_MINUTES) : 0;
    this.setClockHour(hourWithPhase(phaseId, dayOfYearOf(day)));
  }

  /* Перевести часы: та же игровая дата, заданный час (кнопки «утро/день/вечер/ночь»). */
  setClockHour(hour) {
    if (!this.transport) return;
    const day = Math.floor(this.transport.minutes / DAY_MINUTES);
    this.transport.minutes = day * DAY_MINUTES + hour * 60;
    this.updateLight();
    this.draw();
    this.updateHud();
  }

  pedsAt(index) {
    if (!this.pedCache.has(index)) {
      this.pedCache.set(index, buildPedestrians(this.cityAt(index), index));
    }
    return this.pedCache.get(index);
  }

  /* §16.6: шаг социальных сил для городов, попавших в кадр, — не больше 12 одновременно. */
  stepCrowds(dtSec) {
    if (this.scale < 20) return;                 // пешеходы и так не видны (§13 LOD 40)
    this.crowdAcc = (this.crowdAcc || 0) + dtSec;
    if (this.crowdAcc < 0.1) return;            // 10 раз в секунду хватает: шаг 4.8 км/ч
    const dt = this.crowdAcc;
    this.crowdAcc = 0;
    const hour = ((this.transport ? this.transport.minutes : 480) % 1440) / 60;
    const lightState = this.play ? this.play.light.state : 'green';
    const halfW = this.view.w / (2 * this.scale) + 8, halfH = this.view.h / (2 * this.scale) + 8;
    let n = 0;
    for (let i = 0; i < this.settlements.length && n < 12; i++) {
      const t = this.settlements[i];
      if (Math.abs(t.x - this.center.x) > halfW || Math.abs(t.y - this.center.y) > halfH) continue;
      const pack = this.pedsAt(i);
      if (!pack || !pack.peds.length) continue;
      const crowd = this.crowdAt(i);
      const pos = pedPositions(pack);
      stepCrowd(pack, crowd, pos, dt, { light: lightState, regulated: true, hour });
      n++;
    }
  }

  drawPeds(ctx, originX, originY, s) {
    this.pedsInFrame = 0;
    this.light = lightAt(8 * 60, dayOfYearOf(0));   // время суток §14; обновляется из tick
    const X = (x) => originX + x * s;
    const Y = (y) => originY - y * s;
    const view = this.view;
    const pad = 60;
    let drawn = 0;
    const deep = s >= 160;                       // с этого масштаба видно подшаг ног
    for (let i = 0; i < this.settlements.length; i++) {
      const t = this.settlements[i];
      const sx = X(t.x), sy = Y(t.y);
      const reach = 12 * s + pad;
      if (sx < -reach || sy < -reach || sx > view.w + reach || sy > view.h + reach) continue;
      if (cityLod(s) < 2) break;                 // пешеходы только среди домов (§9.10)
      const pack = this.pedsAt(i);
      const budget = pedBudget(s, pack.count);
      if (!budget) continue;
      const list = pedPositions(pack);
      const crowd = this.showPedAI ? this.crowdAt(i) : null;
      const samePack = crowd && crowd.side.length === pack.peds.length;
      for (const p of list) {
        if (drawn >= Math.min(budget, PED_CAP)) break;
        // §16.6: сторона тротуара и сдвиг к середине от толпы
        let wx = p.x, wy = p.y;
        if (samePack && p.idx != null) {
          const base = pack.peds[p.idx];
          const off = base ? base.offsetKm : 0;
          const side = crowd.side[p.idx] || (off >= 0 ? 1 : -1);
          const mag = Math.max(0, Math.abs(off) - (crowd.shiftKm[p.idx] || 0));
          const nx = -p.dy, ny = p.dx;
          const delta = side * mag - off;
          wx = p.x + nx * delta;
          wy = p.y + ny * delta;
        }
        const x = X(wx), y = Y(wy);
        if (x < -8 || y < -8 || x > view.w + 8 || y > view.h + 8) continue;
        drawn++;
        const spec = PED[p.kind] || PED.walker;
        // тень-направление: короткий штрих по ходу движения, читается как «человек идёт»
        ctx.strokeStyle = spec.dark;
        ctx.globalAlpha = 0.55;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x - p.dx * 2.4, y + p.dy * 2.4);
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.globalAlpha = 1;
        if (p.bike) {
          // велосипед: короткая поперечная черта вместо фигуры
          ctx.strokeStyle = spec.tone;
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          ctx.moveTo(x - p.dy * 2.8, y - p.dx * 2.8);
          ctx.lineTo(x + p.dy * 2.8, y + p.dx * 2.8);
          ctx.stroke();
        }
        ctx.fillStyle = spec.tone;
        ctx.strokeStyle = spec.dark;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.arc(x, y, 1.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        if (p.dog) {
          // собака на поводке: точка позади и сбоку
          ctx.fillStyle = '#6b5a48';
          ctx.beginPath();
          ctx.arc(x - p.dx * 3.6 - p.dy * 2.4, y + p.dy * 3.6 - p.dx * 2.4, 1.1, 0, Math.PI * 2);
          ctx.fill();
        }
        if (deep) {
          // подшаг: две ноги качаются по фазе
          const amp = 2.0;
          ctx.strokeStyle = spec.dark;
          ctx.lineWidth = 0.6;
          ctx.beginPath();
          ctx.moveTo(x - p.dy * amp * p.stride, y - p.dx * amp * p.stride);
          ctx.lineTo(x + p.dy * amp * p.stride, y + p.dx * amp * p.stride);
          ctx.stroke();
        }
      }
    }
    this.pedsInFrame = drawn;
  }

  /* Огни §14.3: окна домов и фонари. Ночью далёкий город — тёплое пятно, в зуме — точки
     в кварталах. Точки детерминированы номером квартала, поэтому не мигают от кадра к кадру. */
  /* Приливы §5.10. При малой воде у пологого берега обнажается песок, в портах видно,
     как причалы стоят над осушкой. Уровень — тот же `tideM`, что в HUD (§62). */
  drawTides(ctx, originX, originY, s) {
    const t = this.tides;
    if (!t) return;
    const X = (x) => originX + x * s;
    const Y = (y) => originY - y * s;
    const view = this.view;
    const minutes = this.transport ? this.transport.minutes : 8 * 60;
    const tide = tideM(minutes);
    const flats = flatsKm(tide);
    const halfW = view.w / 2 / s + 30, halfH = view.h / 2 / s + 30;

    // полоса осушки вдоль берега
    if (flats > 0.02) {
      ctx.fillStyle = 'rgba(226,210,172,0.92)';
      for (const line of t.shoreLines) {
        let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
        for (const p of line) {
          if (p[0] < x0) x0 = p[0]; if (p[0] > x1) x1 = p[0];
          if (p[1] < y0) y0 = p[1]; if (p[1] > y1) y1 = p[1];
        }
        if (x1 < this.center.x - halfW || x0 > this.center.x + halfW ||
            y1 < this.center.y - halfH || y0 > this.center.y + halfH) continue;
        // полосами по сегментам: кольцо на изгибах пересекается и заливает сушу
        for (const quad of tidalQuads(line, tide)) {
          ctx.beginPath();
          ctx.moveTo(X(quad[0][0]), Y(quad[0][1]));
          for (let i = 1; i < 4; i++) ctx.lineTo(X(quad[i][0]), Y(quad[i][1]));
          ctx.closePath();
          ctx.fill();
        }
      }
    }

    // порты: набережная, причалы, сваи
    for (const port of t.ports) {
      const px = X(port.x), py = Y(port.y);
      if (px < -60 || py < -60 || px > view.w + 60 || py > view.h + 60) continue;
      const wQuay = Math.max(1.2, 0.02 * s);
      ctx.strokeStyle = 'rgba(74,70,62,0.95)';
      ctx.lineWidth = wQuay;
      ctx.beginPath();
      ctx.moveTo(X(port.quay[0][0]), Y(port.quay[0][1]));
      ctx.lineTo(X(port.quay[1][0]), Y(port.quay[1][1]));
      ctx.stroke();
      ctx.strokeStyle = 'rgba(238,232,214,0.9)';
      ctx.lineWidth = Math.max(0.6, wQuay * 0.4);
      ctx.stroke();

      for (const pier of port.piers) {
        ctx.strokeStyle = 'rgba(84,78,68,0.95)';
        ctx.lineWidth = Math.max(1, 0.014 * s);
        ctx.beginPath();
        ctx.moveTo(X(pier.root[0]), Y(pier.root[1]));
        ctx.lineTo(X(pier.tip[0]), Y(pier.tip[1]));
        ctx.stroke();
        if (s >= 20) {
          ctx.fillStyle = 'rgba(60,56,48,0.9)';
          for (let k = 1; k <= pier.piles; k++) {
            const tt = k / (pier.piles + 1);
            const cx0 = pier.root[0] + (pier.tip[0] - pier.root[0]) * tt;
            const cy0 = pier.root[1] + (pier.tip[1] - pier.root[1]) * tt;
            const r = Math.max(0.6, 0.006 * s);
            ctx.beginPath();
            ctx.arc(X(cx0), Y(cy0), r, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      // склад у набережной
      if (s >= 12) {
        const bw = Math.max(1.6, 0.05 * s), bh = Math.max(1.2, 0.035 * s);
        const cx0 = X(port.x - port.nx * 0.12), cy0 = Y(port.y - port.ny * 0.12);
        ctx.fillStyle = 'rgba(198,186,166,0.95)';
        ctx.fillRect(cx0 - bw / 2, cy0 - bh / 2, bw, bh);
        ctx.strokeStyle = 'rgba(88,78,64,0.9)';
        ctx.lineWidth = 0.6;
        if (ctx.strokeRect) ctx.strokeRect(cx0 - bw / 2, cy0 - bh / 2, bw, bh);
      }
    }
  }

  /* Иней §5.11: на юге утром трава седая, но снега нет. Это не туман — налёт тонкий,
     поэтому альфа не больше 0.07, иначе карта «выцветает». Ледокол — точка с курсом. */
  drawIce(ctx, originX, originY, s) {
    const ice = this.ice;
    if (!ice) return;
    const view = this.view;
    if (ice.frost > 0.25) {
      ctx.save();
      ctx.fillStyle = 'rgba(255,255,255,' + (0.07 * Math.min(1, ice.frost)).toFixed(3) + ')';
      ctx.fillRect(0, 0, view.w, view.h);
      ctx.restore();
    }
    if (ice.breakerPos && s >= 1.5) {
      const px = originX + ice.breakerPos.x * s, py = originY - ice.breakerPos.y * s;
      if (px > -20 && py > -20 && px < view.w + 20 && py < view.h + 20) {
        const r = Math.max(1.6, Math.min(5, s * 0.9));
        ctx.fillStyle = 'rgba(196,66,48,0.95)';
        ctx.beginPath();
        ctx.arc(px, py, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.9)';
        ctx.lineWidth = Math.max(0.7, r * 0.4);
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(px + Math.cos(ice.breakerPos.heading) * r * 2.2, py - Math.sin(ice.breakerPos.heading) * r * 2.2);
        ctx.stroke();
      }
    }
  }

  /* Плотины и ГЭС §5.9. Водохранилище рисуем вместе с водой (это вода), стену, машинный зал,
     водосброс с пеной и ЛЭП — в глубоком зуме, иначе от них остаются точки в пиксель. */
  drawDams(ctx, originX, originY, s) {
    const d = this.dams;
    if (!d || !d.dams.length) return;
    const X = (x) => originX + x * s;
    const Y = (y) => originY - y * s;
    const view = this.view;

    // водохранилище: полосы вдоль русла — ширина растёт от стены к верховью
    for (const dam of d.dams) {
      const axis = dam.axis || [];
      if (axis.length < 2) continue;
      ctx.fillStyle = 'rgba(44,98,138,0.95)';
      for (let k = 1; k < axis.length; k++) {
        const a = axis[k - 1], b = axis[k];
        const dx = b.x - a.x, dy = b.y - a.y;
        const len = Math.hypot(dx, dy) || 1e-6;
        const nx = -dy / len, ny = dx / len;
        ctx.beginPath();
        ctx.moveTo(X(a.x + nx * a.half), Y(a.y + ny * a.half));
        ctx.lineTo(X(b.x + nx * b.half), Y(b.y + ny * b.half));
        ctx.lineTo(X(b.x - nx * b.half), Y(b.y - ny * b.half));
        ctx.lineTo(X(a.x - nx * a.half), Y(a.y - ny * a.half));
        ctx.closePath();
        ctx.fill();
      }
      // круглые стыки полос: на резких изгибах без них остаются «зубцы»
      for (let k = 1; k < axis.length; k++) {
        ctx.beginPath();
        ctx.arc(X(axis[k].x), Y(axis[k].y), Math.max(0.5, axis[k].half * s), 0, Math.PI * 2);
        ctx.fill();
      }
      // кромка чаши: тонкая тёмная линия по берегам
      if (s >= 10 && dam.reservoir.length) {
        ctx.strokeStyle = 'rgba(30,74,104,0.85)';
        ctx.lineWidth = Math.max(0.6, s / 1500);
        ctx.beginPath();
        for (let i = 0; i < dam.reservoir.length; i++) {
          const p = dam.reservoir[i];
          const px = X(p.x), py = Y(p.y);
          if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.stroke();
      }
    }

    if (s < 6) return;                    // ниже значки не читаются
    for (const dam of d.dams) {
      const px = X(dam.x), py = Y(dam.y);
      if (px < -40 || py < -40 || px > view.w + 40 || py > view.h + 40) continue;

      // стена: поперёк русла, тёмный бетон с гребнем
      const line = this.water.rivers.lines[dam.riverIndex];
      const i = Math.min(dam.index, (line ? line.pts.length : 1) - 1);
      const a = line ? line.pts[Math.max(0, i - 1)] : { x: dam.x, y: dam.y };
      const b = line ? line.pts[Math.min(line.pts.length - 1, i + 1)] : { x: dam.x + 1, y: dam.y };
      const dx = b.x - a.x, dy = b.y - a.y;
      const len = Math.hypot(dx, dy) || 1;
      const halfKm = dam.wall.lengthKm / 2;
      const ax = dam.x - (dx / len) * 0 + (-dy / len) * halfKm;
      const ay = dam.y - (dy / len) * 0 + (dx / len) * halfKm;
      const bx = dam.x + (dy / len) * halfKm;
      const by = dam.y - (dx / len) * halfKm;
      const wpx = Math.max(1.4, (dam.wall.thicknessM / 1000) * s);
      ctx.strokeStyle = 'rgba(70,68,64,0.95)';
      ctx.lineWidth = wpx;
      ctx.beginPath();
      ctx.moveTo(X(ax), Y(ay));
      ctx.lineTo(X(bx), Y(by));
      ctx.stroke();
      if (s >= 12) {
        ctx.strokeStyle = 'rgba(238,236,228,0.9)';
        ctx.lineWidth = Math.max(0.6, wpx * 0.35);
        ctx.beginPath();
        ctx.moveTo(X(ax), Y(ay));
        ctx.lineTo(X(bx), Y(by));
        ctx.stroke();
      }

      if (s < 12) continue;
      // машинный зал — небольшой прямоугольник у подошвы, со стороны города
      const toCity = Math.atan2(dam.cityY - dam.y, dam.cityX - dam.x);
      const hx = dam.x + Math.cos(toCity) * (dam.wall.lengthKm * 0.55 + 0.25) - Math.sin(toCity) * 0.3;
      const hy = dam.y + Math.sin(toCity) * (dam.wall.lengthKm * 0.55 + 0.25) + Math.cos(toCity) * 0.3;
      const hw = Math.max(1.6, 0.18 * s), hh = Math.max(1.2, 0.12 * s);
      ctx.fillStyle = 'rgba(196,190,178,0.95)';
      ctx.strokeStyle = 'rgba(70,64,56,0.9)';
      ctx.lineWidth = 0.7;
      ctx.fillRect(X(hx) - hw / 2, Y(hy) - hh / 2, hw, hh);
      ctx.strokeRect ? ctx.strokeRect(X(hx) - hw / 2, Y(hy) - hh / 2, hw, hh) : null;

      // водосброс: пена ниже по течению
      if (s >= 20) {
        ctx.fillStyle = 'rgba(255,255,255,0.85)';
        for (const f of dam.foam) {
          const fx = dam.x + (dx / len) * f.dx - (dy / len) * f.dy;
          const fy = dam.y + (dy / len) * f.dx + (dx / len) * f.dy;
          const r = Math.max(0.5, (f.r * 0.5 * s) / 1000);
          ctx.beginPath();
          ctx.arc(X(fx), Y(fy), r, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // ЛЭП: пунктир к городу и точки опор
      if (s >= 8 && dam.towers.count > 1) {
        ctx.strokeStyle = 'rgba(120,110,92,0.55)';
        ctx.lineWidth = Math.max(0.6, s / 1400);
        ctx.setLineDash([Math.max(2, s / 60), Math.max(2, s / 90)]);
        ctx.beginPath();
        ctx.moveTo(X(dam.x), Y(dam.y));
        ctx.lineTo(X(dam.cityX), Y(dam.cityY));
        ctx.stroke();
        ctx.setLineDash([]);
        if (s >= 20) {
          ctx.fillStyle = 'rgba(96,86,70,0.8)';
          const step = Math.max(1, Math.ceil(dam.towers.count / 24));   // бюджет точек на кадр
          for (let k = 0; k < dam.towers.count; k += step) {
            const t = dam.towers.towers[k];
            ctx.fillRect(X(t.x) - 0.7, Y(t.y) - 0.7, 1.4, 1.4);
          }
        }
      }
    }
  }

  /* Развязки §8.9–8.11: значок в узле. Клевер — четыре лепестка, труба — петля,
     кольцо — круг в 26…60 м, перекрёсток — точка со светофором. */
  junctionAt() {
    if (!this.junctionCache) {
      this.junctionCache = junctions(this.roads.edges).map((j) => ({
        ...j,
        type: junctionType(j.clsA, j.clsB, j.angleDeg, 1.2)
      }));
    }
    return this.junctionCache;
  }

  drawJunctions(ctx, originX, originY, s) {
    const X = (x) => originX + x * s;
    const Y = (y) => originY - y * s;
    const view = this.view;
    for (const j of this.junctionAt()) {
      const px = X(j.x), py = Y(j.y);
      if (px < -30 || py < -30 || px > view.w + 30 || py > view.h + 30) continue;
      const cls = j.clsA === 'M' || j.clsB === 'M' ? 'M' : j.clsA === 'R' || j.clsB === 'R' ? 'R' : 'L';
      ctx.strokeStyle = cls === 'M' ? 'rgba(96,72,28,0.9)' : cls === 'R' ? 'rgba(88,84,74,0.8)' : 'rgba(96,90,80,0.6)';
      ctx.fillStyle = 'rgba(250,246,236,0.85)';
      ctx.lineWidth = Math.max(0.8, cls === 'M' ? 1.4 : 1);
      if (j.type === 'clover') {
        const r = Math.max(3, (ringDiameterM(4) / 2) * s / 1000);
        ctx.beginPath();
        ctx.arc(px, py, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        for (let k = 0; k < 4; k++) {
          const a = (k / 4) * Math.PI * 2 + Math.PI / 4;
          ctx.beginPath();
          ctx.arc(px + Math.cos(a) * r, py + Math.sin(a) * r, r * 0.45, 0, Math.PI * 2);
          ctx.stroke();
        }
      } else if (j.type === 'ring') {
        const r = Math.max(2.2, (ringDiameterM(2) / 2) * s / 1000);
        ctx.beginPath();
        ctx.arc(px, py, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      } else if (j.type === 'trumpet') {
        const r = Math.max(2.4, 20 * s / 1000 + 2);
        ctx.beginPath();
        ctx.arc(px, py, r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(px + r * 0.8, py - r * 0.8, r * 0.7, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        const r = Math.max(1.6, 8 * s / 1000 + 1);
        ctx.beginPath();
        ctx.arc(px, py, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
    }
  }

  /* Разметка §8.14: краевая линия, прерывистая осевая (сплошная на повороте), «зебра»
     у въезда в город. Растёт из масштаба: до 25 px/км её физически не видно. */
  drawMarkings(ctx, originX, originY, s) {
    const X = (x) => originX + x * s;
    const Y = (y) => originY - y * s;
    const view = this.view;
    const dash = dashPattern(s);
    const lineW = markingWidthPx(s, 0.15);
    const kx0 = (-originX - 40) / s, kx1 = (view.w - originX + 40) / s;
    const kyA = (originY - view.h - 40) / s, kyB = (originY + 40) / s;
    for (const e of this.roads.edges) {
      if (e.cls === 'F' || !e.points || e.points.length < 2) continue;
      // рисуем только видимый кусок (R-58.2), иначе ломаная в тысячи км съедает кадр
      const visible = clipPolyline(e.points, kx0, Math.min(kyA, kyB), kx1, Math.max(kyA, kyB));
      if (visible.length < 2) continue;

      // сплошная на поворотах (R-8.14): ищем самый крутой изгиб
      let solid = false;
      for (let i = 1; i < visible.length - 1; i++) {
        if (isSolidAt(e.cls, turnRadiusM(visible[i - 1], visible[i], visible[i + 1]))) { solid = true; break; }
      }
      const widthPx = Math.max(2, ((ROAD_CLASS[e.cls] || ROAD_CLASS.L).widthM * s) / 1000);

      // краевая линия — только там, где полос больше одной
      if ((LANES[e.cls] || 1) >= 2 && widthPx >= 4) {
        ctx.strokeStyle = 'rgba(255,252,244,0.8)';
        ctx.lineWidth = lineW;
        ctx.setLineDash([]);
        for (const side of [-1, 1]) {
          ctx.beginPath();
          for (let i = 0; i < visible.length; i++) {
            const prev = visible[Math.max(0, i - 1)], next = visible[Math.min(visible.length - 1, i + 1)];
            const dx = next[0] - prev[0], dy = next[1] - prev[1];
            const len = Math.hypot(dx, dy) || 1;
            const off = (widthPx / 2 - Math.max(1, lineW * 1.5)) / s;   // отступ в км
            const nx = -dy / len * off * side, ny = dx / len * off * side;
            const px = X(visible[i][0] + nx), py = Y(visible[i][1] + ny);
            if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
          }
          ctx.stroke();
        }
      }

      // полосы: у четырёхполосной магистрали — пунктир между полосами каждого направления
      if ((LANES[e.cls] || 1) >= 4 && widthPx >= 8) {
        ctx.strokeStyle = 'rgba(250,244,228,0.55)';
        ctx.lineWidth = lineW;
        ctx.setLineDash([dash.stroke, dash.gap]);
        for (const side of [-1, 1]) {
          ctx.beginPath();
          for (let i = 0; i < visible.length; i++) {
            const prev = visible[Math.max(0, i - 1)], next = visible[Math.min(visible.length - 1, i + 1)];
            const dx = next[0] - prev[0], dy = next[1] - prev[1];
            const len = Math.hypot(dx, dy) || 1;
            const off = (widthPx / 4) / s * side;
            const nx = -dy / len * off, ny = dx / len * off;
            const px = X(visible[i][0] + nx), py = Y(visible[i][1] + ny);
            if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
          }
          ctx.stroke();
        }
        ctx.setLineDash([]);
      }

      // осевая: прерывистая или сплошная
      ctx.strokeStyle = solid ? 'rgba(255,236,170,0.95)' : 'rgba(255,252,244,0.92)';
      ctx.lineWidth = lineW;
      ctx.setLineDash(solid ? [] : [dash.stroke, dash.gap]);
      ctx.beginPath();
      for (let i = 0; i < visible.length; i++) {
        const px = X(visible[i][0]), py = Y(visible[i][1]);
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // «зебра» у въезда в город: 80…120 м от узла, поперёк дороги (R-8.14)
    for (const t of this.settlements) {
      const cx = X(t.x), cy = Y(t.y);
      if (cx < -40 || cy < -40 || cx > view.w + 40 || cy > view.h + 40) continue;
      for (const e of this.roads.edges) {
        if (!e.points || e.points.length < 2) continue;
        const widthM = (ROAD_CLASS[e.cls] || ROAD_CLASS.L).widthM;
        const z = zebra(s, widthM);
        if (!z) continue;
        for (const [p, q] of [[e.points[0], e.points[1]], [e.points[e.points.length - 1], e.points[e.points.length - 2]]]) {
          const d = Math.hypot(p[0] - t.x, p[1] - t.y);
          if (d > 3) continue;                       // переход только у самого въезда
          const dx = q[0] - p[0], dy = q[1] - p[1];
          const len = Math.hypot(dx, dy) || 1;
          const ux = dx / len, uy = dy / len;
          const off = Math.min(0.12, len * 0.3);     // 80…120 м от узла
          const bx = p[0] + ux * off, by = p[1] + uy * off;
          ctx.fillStyle = 'rgba(252,250,242,0.8)';
          for (let i = 0; i < z.count; i++) {
            const shift = (i - (z.count - 1) / 2) * (z.stripe * 2) / s;
            const px = X(bx - uy * shift), py = Y(by + ux * shift);
            ctx.fillRect(px - z.stripe / 2, py - z.stripe / 2, z.stripe, z.stripe);
          }
        }
      }
    }
  }

  drawLights(ctx, originX, originY, s, artificial) {
    const X = (x) => originX + x * s;
    const Y = (y) => originY - y * s;
    const view = this.view;
    const conf = cityLights(artificial, s);
    const windows = artificial.windows, lamps = artificial.lamps;
    /* хеш-дробь: свет в квартале не мигает от кадра к кадру (§16.1, без Math.random) */
    const h01 = (n) => {
      let x = Math.imul(n | 0, 2246822519) ^ 0x9e3779b9;
      x = Math.imul(x ^ (x >>> 15), 3266489917);
      return ((x ^ (x >>> 13)) >>> 0) / 4294967296;
    };
    // сколько городов в кадре — столько и делим бюджет огней
    const visible = [];
    for (let i = 0; i < this.settlements.length; i++) {
      const t = this.settlements[i];
      const glow = Math.min(16, Math.max(2.5, this.cityAt(i).radiusKm * s * 0.06));
      const cx = X(t.x), cy = Y(t.y);
      if (cx < -glow || cy < -glow || cx > view.w + glow || cy > view.h + glow) continue;
      visible.push({ i, t, cx, cy, glow });
    }
    const perCity = Math.max(60, Math.round(1600 / Math.max(1, visible.length)));
    let dots = 0;
    for (const { i, cx, cy, glow } of visible) {
      // свечение города — символ, а не контур застройки: три круга убывающей плотности
      if (s < 40) {
        const g = [0.26, 0.16, 0.09];
        for (let k = 0; k < 3; k++) {
          ctx.fillStyle = 'rgba(255,208,142,' + (g[k] * windows).toFixed(3) + ')';
          ctx.beginPath();
          ctx.arc(cx, cy, glow * (1 - k * 0.3), 0, Math.PI * 2);
          ctx.fill();
        }
      }
      if (s < 20) continue;                       // в кварталах огни только в зуме
      const city = this.cityAt(i);
      const blocks = city.blocks;
      const stride = Math.max(1, Math.ceil(blocks.length / perCity));
      for (let b = 0; b < blocks.length; b += stride) {
        if (dots >= 2200) return;
        const bl = blocks[b];
        if (bl.zone === 'park') continue;
        if (h01(b * 131 + i * 17) > windows * 0.85) continue;
        const c = bl.corners;
        let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
        for (const q of c) {
          if (q[0] < x0) x0 = q[0]; if (q[0] > x1) x1 = q[0];
          if (q[1] < y0) y0 = q[1]; if (q[1] > y1) y1 = q[1];
        }
        const count = windows > 0.6 ? 2 : 1;
        for (let k = 0; k < count; k++) {
          const fx = 0.2 + 0.6 * h01(b * 977 + k * 37 + i * 5);
          const fy = 0.2 + 0.6 * h01(b * 613 + k * 91 + i * 29);
          const px = X(x0 + (x1 - x0) * fx), py = Y(y0 + (y1 - y0) * fy);
          if (px < -4 || py < -4 || px > view.w + 4 || py > view.h + 4) continue;
          ctx.fillStyle = bl.zone === 'center'
            ? 'rgba(255,226,168,0.92)'
            : 'rgba(255,214,150,' + (0.5 + 0.4 * windows).toFixed(2) + ')';
          ctx.beginPath();
          ctx.arc(px, py, conf.radiusPx, 0, Math.PI * 2);
          ctx.fill();
          dots++;
        }
      }
      // фонари по кольцам и проспектам
      if (s >= 40 && lamps > 0.1) {
        for (const st of city.streets) {
          if (!st.major || !st.pts || st.pts.length < 2) continue;
          for (let k = 1; k < st.pts.length; k++) {
            if (dots >= 2200) return;
            const [x1, y1] = st.pts[k - 1], [x2, y2] = st.pts[k];
            const len = Math.hypot(x2 - x1, y2 - y1);
            for (let d = 0.18; d < len; d += 0.18) {
              if (dots >= 2200) return;
              const u = d / len;
              const px = X(x1 + (x2 - x1) * u), py = Y(y1 + (y2 - y1) * u);
              if (px < -4 || py < -4 || px > view.w + 4 || py > view.h + 4) continue;
              ctx.fillStyle = 'rgba(255,238,190,' + (0.8 * lamps).toFixed(2) + ')';
              ctx.beginPath();
              ctx.arc(px, py, Math.max(0.6, conf.radiusPx * 0.7), 0, Math.PI * 2);
              ctx.fill();
              dots++;
            }
          }
        }
      }
    }
  }

  drawRoads(ctx, originX, originY, s) {
    // на мелком зуме ширина картографическая (иначе дорога тоньше пикселя), на крупном — по метрам
    const MIN = { M: 2.6, R: 2.0, L: 1.5, G: 1.0 };
    const order = { G: 0, L: 1, R: 2, M: 3 };
    const edges = this.roads.edges.slice().sort((a, b) => order[a.cls] - order[b.cls]);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    // кадр в километрах: дальше рисуем только видимые куски дорог (R-58.2)
    const view = this.view;
    const kx0 = (-originX - 40) / s, kx1 = (view.w - originX + 40) / s;
    const kyA = (originY - view.h - 40) / s, kyB = (originY + 40) / s;
    for (const e of edges) {
      const meta = ROAD_CLASS[e.cls] || ROAD_CLASS.L;
      const real = (meta.widthM / 1000) * s;
      const w = Math.max(MIN[e.cls] || 1, Math.min(30, real));
      const pts = clipPolyline(e.points, kx0, Math.min(kyA, kyB), kx1, Math.max(kyA, kyB));
      if (pts.length < 2) continue;
      ctx.beginPath();
      for (let i = 0; i < pts.length; i++) {
        const p = pts[i];
        const sx = originX + p[0] * s, sy = originY - p[1] * s;
        if (i === 0) ctx.moveTo(sx, sy); else ctx.lineTo(sx, sy);
      }
      // тёмная обводка — дорога читается на любом фоне
      ctx.setLineDash([]);
      ctx.strokeStyle = 'rgba(28,32,26,0.55)';
      ctx.lineWidth = w + 1.6;
      ctx.stroke();
      const fill = roadFill(e.cls, s);          // R-58.1: в глубоком зуме — асфальт
      const [r, g, b] = meta.tone;
      ctx.strokeStyle = fill || ('rgb(' + r + ',' + g + ',' + b + ')');
      ctx.lineWidth = w;
      if (meta.dash) ctx.setLineDash(meta.dash.map((v) => v * Math.max(1, w / 1.5)));
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }

  drawGrid(ctx, originX, originY, s) {
    const stepKm = gridStep(s);
    ctx.strokeStyle = 'rgba(255,255,255,0.16)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = -WORLD2D.halfKm; x <= WORLD2D.halfKm; x += stepKm) {
      const sx = originX + x * s;
      if (sx < 0 || sx > this.view.w) continue;
      ctx.moveTo(sx, 0); ctx.lineTo(sx, this.view.h);
    }
    for (let y = -WORLD2D.halfKm; y <= WORLD2D.halfKm; y += stepKm) {
      const sy = originY - y * s;
      if (sy < 0 || sy > this.view.h) continue;
      ctx.moveTo(0, sy); ctx.lineTo(this.view.w, sy);
    }
    ctx.stroke();

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = '10px ui-monospace, monospace';
    for (let x = -WORLD2D.halfKm; x <= WORLD2D.halfKm; x += stepKm * 2) {
      const sx = originX + x * s;
      if (sx < 24 || sx > this.view.w - 24) continue;
      ctx.fillText(x + ' км', sx + 3, this.view.h - 8);
    }
    for (let y = -WORLD2D.halfKm; y <= WORLD2D.halfKm; y += stepKm * 2) {
      const sy = originY - y * s;
      if (sy < 14 || sy > this.view.h - 26) continue;
      ctx.fillText(y + ' км', 6, sy - 3);
    }
  }

  /* F-116: единица видна на любом масштабе — не меньше 3 px; в зуме — почти в размер. */
  drawVehicles(ctx, originX, originY, s) {
    const view = this.view;
    const pad = 40;
    const list = this.transport.vehicles;
    ctx.lineCap = 'round';
    // сначала наземные, потом суда и самолёты — транспорт читается поверх дорог
    for (const v of list) {
      const p = vehiclePosition(v);
      const sx = originX + p.x * s, sy = originY - p.y * s;
      if (sx < -pad || sy < -pad || sx > view.w + pad || sy > view.h + pad) continue;
      const len = screenLengthPx(v.lengthM, s);
      const dir = v.dir >= 0 ? 1 : -1;
      const ca = Math.cos(p.angle) * dir, sa = Math.sin(p.angle) * dir;
      if (v.kind === 'plane') {
        // самолёт: треугольник носом по курсу, размер фиксированный и заметный
        const r = Math.max(3.2, len * 0.9);
        ctx.fillStyle = '#101820';
        ctx.beginPath();
        ctx.moveTo(sx + ca * r, sy - sa * r);
        ctx.lineTo(sx - ca * r * 0.6 + sa * r * 0.75, sy + sa * r * 0.6 + ca * r * 0.75);
        ctx.lineTo(sx - ca * r * 0.6 - sa * r * 0.75, sy + sa * r * 0.6 - ca * r * 0.75);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = v.tone;
        ctx.beginPath();
        ctx.moveTo(sx + ca * r * 0.8, sy - sa * r * 0.8);
        ctx.lineTo(sx - ca * r * 0.45 + sa * r * 0.55, sy + sa * r * 0.45 + ca * r * 0.55);
        ctx.lineTo(sx - ca * r * 0.45 - sa * r * 0.55, sy + sa * r * 0.45 - ca * r * 0.55);
        ctx.closePath();
        ctx.fill();
        continue;
      }
      if (v.refuelMin > 0) {
        // F-123: стоит у колонки — вокруг точки тонкое кольцо, чтобы это было видно
        ctx.strokeStyle = 'rgba(255,214,110,0.85)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(sx, sy, Math.max(4, len * 0.6 + 3), 0, Math.PI * 2);
        ctx.stroke();
      }
      const w = v.kind === 'ship' ? Math.max(2.4, len * 0.34) : Math.max(1.6, len * 0.5);
      // тёмный контур, затем корпус — иначе на светлой дороге машина теряется
      ctx.strokeStyle = 'rgba(12,18,24,0.85)';
      ctx.lineWidth = w + 1.6;
      ctx.beginPath();
      ctx.moveTo(sx - ca * len * 0.5, sy + sa * len * 0.5);
      ctx.lineTo(sx + ca * len * 0.5, sy - sa * len * 0.5);
      ctx.stroke();
      // §16.6: в близком зуме видно, кто за рулём — спокойный, агрессивный, новичок
      ctx.strokeStyle = (s >= 18 && v.profile) ? PROFILE_COLOR[v.profile.id] : v.tone;
      ctx.lineWidth = w;
      ctx.beginPath();
      ctx.moveTo(sx - ca * len * 0.5, sy + sa * len * 0.5);
      ctx.lineTo(sx + ca * len * 0.5, sy - sa * len * 0.5);
      ctx.stroke();
      if (s >= 40 && v.kind === 'car') {
        // характер читается и точкой у капота: цвет = школа вождения
        ctx.fillStyle = PROFILE_COLOR[v.profile.id];
        ctx.beginPath();
        ctx.arc(sx + ca * len * 0.62, sy - sa * len * 0.62, Math.max(1.4, w * 0.42), 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  /* §16.8: то, что выросло от решений мэра (R-16.28). Дома, парк, склады, школа/больница;
     недостроенное стоит в лесах. Всё считается от прогресса стройки в игровых днях. */
  drawGrowth(ctx, X, Y, s, lod, growth, small) {
    const day = Math.floor((this.transport ? this.transport.minutes : 0) / 1440);
    const toPx = (km) => km * s;

    // расширение дороги: кольцо вокруг города становится шире (полосы)
    if (growth.widen > 0 && lod >= 1) {
      const r = growth.radiusKm * 0.995;
      ctx.strokeStyle = 'rgba(58,58,62,0.85)';
      ctx.lineWidth = Math.max(1.4, toPx(0.008 + 0.004 * growth.widen));
      ctx.beginPath();
      ctx.arc(X(growth.cx), Y(growth.cy), r * s, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(246,240,226,0.8)';
      ctx.lineWidth = Math.max(0.6, toPx(0.0016));
      ctx.setLineDash([Math.max(2, toPx(0.006)), Math.max(2, toPx(0.006))]);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // объездная: дуга вокруг города
    if (growth.bypass && lod >= 1) {
      const bp = growth.bypass;
      const p = progressAt(bp, day);
      ctx.strokeStyle = p >= 1 ? 'rgba(64,62,58,0.95)' : 'rgba(120,110,96,0.8)';
      ctx.lineWidth = Math.max(1.6, toPx(0.011));
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(X(bp.pts[0][0]), Y(bp.pts[0][1]));
      for (let k = 1; k < bp.pts.length; k++) ctx.lineTo(X(bp.pts[k][0]), Y(bp.pts[k][1]));
      ctx.stroke();
      ctx.strokeStyle = 'rgba(246,240,226,0.75)';
      ctx.lineWidth = Math.max(0.6, toPx(0.0014));
      ctx.setLineDash([Math.max(2, toPx(0.007)), Math.max(2, toPx(0.007))]);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    if (!small || lod < 2) return;

    // парк: пятно, дорожка, деревья
    for (const park of growth.parks) {
      const p = progressAt(park, day);
      const c = park.corners;
      ctx.beginPath();
      ctx.moveTo(X(c[0][0]), Y(c[0][1]));
      for (let k = 1; k < c.length; k++) ctx.lineTo(X(c[k][0]), Y(c[k][1]));
      ctx.closePath();
      ctx.fillStyle = 'rgba(96,128,74,' + (0.35 + 0.5 * p).toFixed(2) + ')';
      ctx.fill();
      if (p >= 1) {
        const path = park.paths[0];
        ctx.strokeStyle = 'rgba(214,204,178,0.9)';
        ctx.lineWidth = Math.max(0.8, toPx(0.0022));
        ctx.beginPath();
        ctx.moveTo(X(path.x0), Y(path.y0));
        ctx.lineTo(X(path.x1), Y(path.y1));
        ctx.stroke();
        ctx.fillStyle = 'rgba(58,92,50,0.92)';
        for (const t of park.trees) {
          ctx.beginPath();
          ctx.arc(X(t.x), Y(t.y), Math.max(1, toPx(t.r)), 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // дома, склады, школа/больница: готовое — с крышей, в стройке — леса
    const drawBox = (item, toneFallback) => {
      const p = progressAt(item, day);
      const c = item.corners;
      ctx.beginPath();
      ctx.moveTo(X(c[0][0]), Y(c[0][1]));
      for (let k = 1; k < c.length; k++) ctx.lineTo(X(c[k][0]), Y(c[k][1]));
      ctx.closePath();
      if (p < 1) {
        // стройка: светлый контур и стойки лесов
        ctx.fillStyle = 'rgba(196,186,168,0.35)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(122,106,84,0.9)';
        ctx.lineWidth = Math.max(0.8, toPx(0.0014));
        ctx.setLineDash([2, 2]);
        ctx.stroke();
        ctx.setLineDash([]);
        return;
      }
      ctx.fillStyle = item.tone || toneFallback;
      ctx.fill();
      ctx.strokeStyle = item.roof || 'rgba(96,74,54,0.9)';
      ctx.lineWidth = Math.max(0.6, toPx(0.0012));
      ctx.stroke();
    };
    for (const h of growth.houses) drawBox(h, '#d8c8ae');
    for (const w of growth.industry) drawBox(w, '#9aa0a2');
    for (const c of growth.civic) {
      drawBox(c, '#d9c9a6');
      if (progressAt(c, day) >= 1) {
        // двор: светлое пятно рядом с больницей/школой
        const dx = X(c.x), dy = Y(c.y);
        const r = Math.max(2, toPx(GROWTH.civicW * 0.75));
        ctx.fillStyle = 'rgba(206,208,198,0.55)';
        ctx.beginPath();
        ctx.arc(dx, dy, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = c.tone;
        ctx.beginPath();
        ctx.arc(dx, dy, r * 0.42, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  drawSettlements(ctx, originX, originY, s) {
    const cap = this.ranks.capital;
    const hubSet = this.ranks.hubSet;
    const labelTowns = s >= 0.45;
    ctx.textBaseline = 'middle';
    for (let i = 0; i < this.settlements.length; i++) {
      const p = this.settlements[i];
      const sx = originX + p.x * s, sy = originY - p.y * s;
      if (sx < -40 || sy < -40 || sx > this.view.w + 40 || sy > this.view.h + 40) continue;
      const isCap = i === cap, isHub = hubSet.has(i);
      const r = isCap ? Math.max(5, Math.min(9, s * 4)) : isHub ? Math.max(3.6, Math.min(7, s * 3)) : Math.max(2.2, Math.min(5, s * 2));
      // мягкое свечение — город видно на любом фоне
      const glow = ctx.createRadialGradient
        ? ctx.createRadialGradient(sx, sy, r * 0.4, sx, sy, r * 2.6)
        : null;
      if (glow) {
        glow.addColorStop(0, isCap ? 'rgba(255,226,140,0.55)' : 'rgba(255,255,255,0.35)');
        glow.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = glow;
        ctx.beginPath(); ctx.arc(sx, sy, r * 2.6, 0, Math.PI * 2); ctx.fill();
      }
      ctx.beginPath();
      ctx.arc(sx, sy, r, 0, Math.PI * 2);
      ctx.fillStyle = isCap ? '#ffd75e' : '#fdfaf2';
      ctx.fill();
      ctx.lineWidth = isCap ? 2 : 1.3;
      ctx.strokeStyle = '#141414';
      ctx.stroke();
      if (isCap) {
        // звезда столицы
        ctx.beginPath();
        for (let k = 0; k < 10; k++) {
          const a = -Math.PI / 2 + k * Math.PI / 5;
          const rr = k % 2 ? r * 0.45 : r * 1.05;
          const px = sx + Math.cos(a) * rr, py = sy + Math.sin(a) * rr;
          if (k === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fillStyle = '#2a2010';
        ctx.fill();
      }
      if (p === this.selected) {
        ctx.beginPath();
        ctx.arc(sx, sy, r + 4, 0, Math.PI * 2);
        ctx.strokeStyle = '#ffd75e';
        ctx.lineWidth = 2;
        ctx.setLineDash([3, 3]);
        ctx.stroke();
        ctx.setLineDash([]);
      }
      if (isCap || isHub || p === this.selected || (labelTowns && s * 6 > 8)) {
        const size = isCap ? 13 : isHub ? 12 : 11;
        ctx.font = (isCap ? '600 ' : '') + size + 'px ui-monospace, monospace';
        const text = p.name;
        const tx = sx + r + 5, ty = sy;
        ctx.lineWidth = 3;
        ctx.strokeStyle = 'rgba(8,14,20,0.85)';
        ctx.strokeText(text, tx, ty);
        ctx.fillStyle = isCap ? '#ffe9a8' : '#ffffff';
        ctx.fillText(text, tx, ty);
      }
    }
  }

  drawQ(ctx, originX, originY, s) {
    // QООВЗ: круг видимых значений вокруг центра камеры; в 2D прямоугольник — это сам экран
    const R = 250; // метров
    const rpx = (R / 1000) * s;
    if (rpx < 6) return;
    const cx = originX + this.center.x * s;
    const cy = originY - this.center.y * s;
    ctx.beginPath();
    ctx.arc(cx, cy, rpx, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,255,255,0.85)';
    ctx.setLineDash([5, 4]);
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.setLineDash([]);
  }

  /* §16.4: полигон ИИ в кадре — 12 машин на кольце, светофор по F-193, очередь и «прошло».
     Коробка живёт в правом нижнем углу над линейкой масштаба и стоит 12 машин, а не 966. */
  drawPlayPanel(ctx) {
    const play = this.play;
    const st = playStats(play);
    const w = 246, h = 108;
    // внизу по центру: слева легенда и HUD, справа колонка и линейка — там тесно
    const x = Math.max(12, (this.view.w - w) / 2), y = this.view.h - h - 42;
    ctx.save();
    ctx.fillStyle = 'rgba(8,16,24,0.72)';
    ctx.strokeStyle = 'rgba(150,190,220,0.35)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = 'rgba(206,226,240,0.92)';
    ctx.font = '10.5px ui-monospace, monospace';
    ctx.textBaseline = 'top';
    ctx.fillText('ИИ §16.4 · IDM, полигон', x + 9, y + 7);

    // полоса: кольцо 700 м укладывается в 220 px
    const roadX = x + 13, roadY = y + 40, roadW = w - 26;
    const k = roadW / PLAY2D.ringM;
    ctx.strokeStyle = 'rgba(120,140,155,0.85)';
    ctx.lineWidth = 9;
    ctx.beginPath();
    ctx.moveTo(roadX, roadY);
    ctx.lineTo(roadX + roadW, roadY);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(232,238,244,0.35)';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 6]);
    ctx.beginPath();
    ctx.moveTo(roadX, roadY);
    ctx.lineTo(roadX + roadW, roadY);
    ctx.stroke();
    ctx.setLineDash([]);
    // стоп-линия и светофор
    const stopX = roadX + PLAY2D.stopM * k;
    ctx.strokeStyle = 'rgba(245,245,240,0.9)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(stopX, roadY - 8);
    ctx.lineTo(stopX, roadY + 8);
    ctx.stroke();
    const lamp = st.state === 'green' ? '#5ddc84' : st.state === 'yellow' ? '#ffd75e' : '#ff6a52';
    ctx.fillStyle = 'rgba(6,10,14,0.9)';
    ctx.beginPath();
    ctx.arc(stopX + 9, roadY - 15, 5.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = lamp;
    ctx.beginPath();
    ctx.arc(stopX + 9, roadY - 15, 3.6, 0, Math.PI * 2);
    ctx.fill();

    // машины: короткие штрихи по характеру; тормозящие — с красной искрой
    for (const c of play.cars) {
      const cx = roadX + c.x * k;
      ctx.strokeStyle = PROFILE_COLOR[c.profile.id];
      ctx.lineWidth = 4.4;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(cx - 2.4, roadY - 1);
      ctx.lineTo(cx + 2.4, roadY - 1);
      ctx.stroke();
      if (c.braking > 0.15) {
        ctx.fillStyle = 'rgba(255,90,70,' + (0.3 + 0.6 * c.braking).toFixed(2) + ')';
        ctx.beginPath();
        ctx.arc(cx + 2.6, roadY - 5.2, 1.7, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.lineCap = 'butt';

    ctx.fillStyle = 'rgba(196,214,228,0.85)';
    ctx.font = '10px ui-monospace, monospace';
    const names = { green: 'зелёный', yellow: 'жёлтый', red: 'красный' };
    ctx.fillText('свет ' + names[st.state] + ' · очередь ' + st.queue + ' · зелёный ' + st.green.toFixed(0) + ' с', x + 9, y + 58);
    ctx.fillText('прошло ' + st.passed + ' · в среднем ' + st.avgKmh.toFixed(0) + ' км/ч · зазор ' +
      (st.minGap === null ? '—' : st.minGap.toFixed(1) + ' м'), x + 9, y + 73);
    const byProf = Object.entries(st.byProfile).filter(([, n]) => n > 0)
      .map(([id, n]) => (DRIVER[id] ? DRIVER[id].name : id) + ' ' + n).join(' · ');
    ctx.fillStyle = 'rgba(150,172,188,0.9)';
    ctx.fillText(byProf, x + 9, y + 88);
    ctx.restore();
  }

  /* §16.8: журнал «почему» — последние решения мэров с решающими факторами. */
  updateWhyPanel(events) {
    const el = this.hud.whyList;
    if (!el) return;
    const rows = (events || []).slice(-3);
    if (!rows.length) {
      if (this.why.length) rows.push(...this.why.slice(-3));
      else { el.innerHTML = '<li>пока тихо</li>'; return; }
    }
    el.innerHTML = rows.map((e) => '<li>' + e.text + '</li>').join('');
    this.updateAiHud();
    if (this.hud.mayors) {
      const s = mayorStats(this.mayors || []);
      this.hud.mayors.textContent = s.count + ' мэр · ' + s.decisions + ' решений';
    }
  }

  drawScaleBar(ctx) {
    const km = scaleBarKm(this.scale);
    const w = km * this.scale;
    const x = this.view.w - w - 18, y = this.view.h - 22;
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, y); ctx.lineTo(x + w, y);
    ctx.moveTo(x, y - 4); ctx.lineTo(x, y + 4);
    ctx.moveTo(x + w, y - 4); ctx.lineTo(x + w, y + 4);
    ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.font = '11px ui-monospace, monospace';
    ctx.fillText(km + ' км', x + w / 2 - 12, y - 8);
  }

  /* Панель страны §31.33: население, восемь ресурсов, приход/расход и запас в сутках. */
  updateEconomyPanel() {
    const e = this.economy;
    if (!e || !this.hud.country) return;
    const rows = [];
    rows.push('<tr><td>население</td><td>' + e.population.toLocaleString('ru-RU') + '</td></tr>');
    rows.push('<tr><td>города</td><td>' + (e.byClass ? Object.entries(e.byClass).filter(([, v]) => v).length + ' классов · ' + this.settlements.length + ' поселений' : '—') + '</td></tr>');
    for (const id of RESOURCE_ORDER) {
      const b = e.balance[id];
      const res = RESOURCE[id];
      const pct = b.consumption > 0 ? (b.balance / b.consumption) * 100 : 0;
      const num = (v) => v >= 100 ? Math.round(v).toLocaleString('ru-RU') : v.toFixed(1);
      const sign = b.balance >= 0 ? '+' : '−';
      const cls = b.deficit > 0.01 ? 'bad' : b.balance >= 0 ? 'good' : '';
      rows.push('<tr class="' + cls + '"><td>' + res.name + '</td><td>' + num(b.production) + ' / ' + num(b.consumption) +
        ' · ' + sign + Math.abs(pct).toFixed(0) + '%</td></tr>');
    }
    rows.push('<tr><td>сутки</td><td>' + Math.floor(e.days) + '</td></tr>');
    this.hud.country.innerHTML = rows.join('');
  }

  /* §16.6 и §16.8: строки HUD про толпу и стройку — обновляются и по дням, и по кадрам. */
  updateAiHud() {
    if (this.hud.crowd) {
      if (!this.showPedAI || !this.showPeds) this.hud.crowd.textContent = 'выключена';
      else if (!this.crowds.size) this.hud.crowd.textContent = '— (нужен зум от 20 px/км)';
      else {
        let waiting = 0, crossed = 0, pressure = 0, n = 0;
        for (const c of this.crowds.values()) {
          const s3 = crowdStats(c);
          waiting += s3.waiting; crossed += s3.crossed; pressure += s3.pressure; n++;
        }
        this.hud.crowd.textContent = n + ' город · ждут ' + waiting + ' · перешли ' + crossed +
          ' · давка ' + Math.round((pressure / Math.max(1, n)) * 100) + '%';
      }
    }
    if (this.hud.trains) {
      if (!this.showTrains) this.hud.trains.textContent = 'выключены';
      else if (!this.rail) this.hud.trains.textContent = '— (мир строится)';
      else {
        const st = transitStats(this.rail, null, null);
        this.hud.trains.textContent = st.trains + ' составов · держат блок ' + st.waiting +
          ' · на станции ' + st.atStation + ' · ' + st.railKm.toLocaleString('ru-RU') + ' км';
      }
    }
    if (this.hud.air) {
      if (!this.showAir) this.hud.air.textContent = 'выключена';
      else if (!this.air) this.hud.air.textContent = '—';
      else {
        const st = transitStats(this.rail || { trains: [], totalKm: 0 }, this.air, null);
        this.hud.air.textContent = st.planes + ' бортов · на круге ' + st.holding +
          ' · сели ' + st.landed;
      }
    }
    if (this.hud.sea) {
      if (!this.showSeaTraffic) this.hud.sea.textContent = 'выключены';
      else if (!this.seaTraffic) this.hud.sea.textContent = '—';
      else {
        const st = transitStats({ trains: [], totalKm: 0 }, null, this.seaTraffic);
        this.hud.sea.textContent = st.ships + ' судна · уступают ' + st.giveWay + ' · у моста ' +
          st.bridgeWaiting + ' · на стоянке ' + st.moored;
      }
    }
    if (this.hud.offline) {
      if (this.catchUpReport && this.catchUpReport.days) {
        this.hud.offline.textContent = formatReport(this.catchUpReport) +
          (this.catchUpReport.capped ? ' (дальше не считаем)' : '');
      } else if (!this.hud.offline.textContent || this.hud.offline.textContent === '—') {
        this.hud.offline.textContent = 'всё под контролем';
      }
    }
    if (this.hud.growth) {
      if (!this.showGrowth) this.hud.growth.textContent = 'выключен';
      else if (!this.growth.size) this.hud.growth.textContent = '— (с первого дня)';
      else {
        let houses = 0, parks = 0, civic = 0, building = 0, bypass = 0;
        for (const g of this.growth.values()) {
          const st2 = growthStats(g);
          houses += st2.houses; parks += st2.parks; civic += st2.civic;
          building += st2.building; if (st2.bypass) bypass++;
        }
        this.hud.growth.textContent = houses + ' домов · ' + parks + ' парков · ' + civic +
          ' обществ. · в лесах ' + building + (bypass ? ' · объездных ' + bypass : '');
      }
    }
  }

  updateHud() {
    this.updateAiHud();
    const p = this.pointer;
    const w = this.toWorld(p.x, p.y);
    const h = heightKm(w.x, w.y);
    if (this.hud.pos) this.hud.pos.textContent = w.x.toFixed(0) + '; ' + w.y.toFixed(0) + ' км';
    if (this.hud.height) this.hud.height.textContent = Math.round(h) + ' м';
    if (this.hud.zoom) this.hud.zoom.textContent = this.scale < 1
      ? (1 / this.scale).toFixed(1) + ' км/px'
      : this.scale.toFixed(1) + ' px/км';
    if (this.hud.fps) this.hud.fps.textContent = this.fps;
    if (this.hud.center) this.hud.center.textContent = this.center.x.toFixed(0) + '; ' + this.center.y.toFixed(0) + ' км';
    if (this.hud.roads) {
      const n = this.roads;
      this.hud.roads.textContent = n ? n.edges.length + ' · ' + n.totalKm + ' км' : '—';
    }
    if (this.hud.clock) {
      const total = Math.floor(this.transport ? this.transport.minutes : 8 * 60);
      const doy = dayOfYearOf(Math.floor(total / DAY_MINUTES));
      const season = { winter: 'зима', spring: 'весна', summer: 'лето', autumn: 'осень' }[seasonOf(doy)];
      const alt = Math.round(sunAltitudeDeg(total, doy));
      const snow = snowCover01(doy);
      const ice = this.showIce ? this.updateIce() : null;
      const iceText = ice && ice.maxIce >= 10 ? ' · лёд до ' + Math.round(ice.maxIce) + ' см' : '';
      const frostText = ice && ice.frost >= 0.3 ? ' · иней' : '';
      const tide = tideM(total);
      const tideText = Math.abs(tide) >= 0.4 ? ' · прилив ' + (tide > 0 ? '+' : '') + tide.toFixed(1) + ' м' : '';
      this.hud.clock.textContent = clockText(total, doy) + ' · ' + season +
        ' · солнце ' + (alt > 0 ? '+' : '') + alt + '°' + (snow > 0.05 ? ' · снег ' + Math.round(snow * 100) + '%' : '') +
        iceText + frostText + tideText;
    }
    if (this.hud.peds) {
      this.hud.peds.textContent = this.pedsInFrame
        ? this.pedsInFrame + ' в кадре'
        : (this.showPeds ? '— (с 40 px/км)' : 'выключены');
    }
    if (this.hud.hint) {
      const t = this.transport;
      this.hud.hint.textContent = 'тяните — сдвиг · колесо и щипок — зум · двойной клик — ближе · клик по городу — выбрать' +
        (t ? ' · §44: ' + t.vehicles.length + ' ед. в пути' : '') +
        (this.pedsInFrame ? ' · §13: ' + this.pedsInFrame + ' пешеходов' : '');
    }
    if (this.hud.play) {
      const p2 = this.play;
      if (!p2 || !this.showPlay) this.hud.play.textContent = this.showPlay ? '—' : 'выключен';
      else {
        const st = playStats(p2);
        const names = { green: 'зелёный', yellow: 'жёлтый', red: 'красный' };
        this.hud.play.textContent = 'свет ' + names[st.state] + ' · очередь ' + st.queue + ' · прошло ' + st.passed;
      }
    }
    if (this.hud.mayors) {
      if (!this.showAI) this.hud.mayors.textContent = 'выключены';
      else if (!this.mayors) this.hud.mayors.textContent = '— (с первого дня)';
      else {
        const s2 = mayorStats(this.mayors);
        this.hud.mayors.textContent = s2.count + ' мэр · ' + s2.decisions + ' решений · пробки ' +
          Math.round(s2.jams * 100) + '%';
      }
    }
    if (this.hud.cars) {
      const t = this.transport;
      if (!t) this.hud.cars.textContent = '—';
      else {
        const k = t.counts.byKind;
        const ref = t.refueling || 0;
        this.hud.cars.textContent = t.vehicles.length + ' ед. · ' + k.car + ' авто · ' + k.ship + ' судов · ' +
          k.plane + ' самолётов' + (ref ? ' · на заправке ' + ref : '');
      }
    }
  }
}

function nextFrame() {
  return new Promise((r) => setTimeout(r, 0));
}

/* Локальная копия F-211 для отрисовки рельсов: без импорта лишнего модуля в горячем пути. */
function pointOnLineLocal(line, sKm) {
  const s = Math.max(0, Math.min(line.lengthKm, sKm));
  let i = 1;
  while (i < line.acc.length - 1 && line.acc[i] < s) i++;
  const a = line.pts[i - 1], b = line.pts[i];
  const seg = Math.max(1e-9, line.acc[i] - line.acc[i - 1]);
  const u = Math.max(0, Math.min(1, (s - line.acc[i - 1]) / seg));
  let dx = (b[0] - a[0]) / seg, dy = (b[1] - a[1]) / seg;
  if (Math.hypot(dx, dy) < 1e-6) { dx = 1; dy = 0; }
  return { x: a[0] + (b[0] - a[0]) * u, y: a[1] + (b[1] - a[1]) * u, dx, dy };
}
