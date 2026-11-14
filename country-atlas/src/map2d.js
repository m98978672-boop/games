/* 2D-карта: обзор мира, детальный патч, сетка, поселения, масштабная линейка.
   Движение простое: тянуть — сдвиг, колесо — зум, без поворотов. */
import { WORLD2D, settlements, rankSettlements, heightKm, colorAtKm } from './world2d.js';
import { buildRoads, ROAD_CLASS } from './roads2d.js';
import { buildTransport, advance as advanceTransport, vehiclePosition, screenLengthPx, VEHICLE } from './transport2d.js';
import { buildCity, cityLod, ZONE, CITY_STREET_SCALE, CITY_BUILDING_SCALE, buildingOutlinePx } from './city2d.js';
import { buildBorders, BORDER } from './borders2d.js';
import { buildEconomy, advanceEconomy, RESOURCE_ORDER, RESOURCE } from './economy2d.js';
import { buildWater, RIVER, riverStrokePx, riverKeepCount, riverVisibleAt } from './rivers2d.js';
import { screenToWorld, worldToScreen, clampCenter, zoomAt, shiftBy, gridStep, scaleBarKm, patchPixels, fitScale } from './view2d.js';

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
    this.showVehicles = true;   // слой транспорта §44
    this.transport = null;
    this.showBorders = true;    // границы §7
    this.borders = null;
    this.showCities = true;     // города §9–§10
    this.cityCache = new Map();
    this.economy = null;        // экономика §31.33
    this.lastEconomyDay = 0;
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
    // озёра — настоящим очертанием (§5.6), а не кружком
    for (const lake of w.lakes) {
      if (Math.abs(lake.x - this.center.x) > halfW || Math.abs(lake.y - this.center.y) > halfH) continue;
      const ring = lake.ring;
      ctx.beginPath();
      ctx.moveTo(X(ring[0][0]), Y(ring[0][1]));
      for (let i = 1; i < ring.length; i++) ctx.lineTo(X(ring[i][0]), Y(ring[i][1]));
      ctx.closePath();
      ctx.fillStyle = 'rgba(58,117,155,0.95)';
      ctx.fill();
      // отмель у берега и тёмная кромка — озеро не выглядит заливкой
      ctx.strokeStyle = 'rgba(150,200,222,0.65)';
      ctx.lineWidth = Math.max(0.8, 0.9 * Math.min(3, s * 0.6));
      ctx.stroke();
      ctx.strokeStyle = 'rgba(34,78,110,0.55)';
      ctx.lineWidth = 0.6;
      ctx.stroke();
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
      ctx.globalAlpha = rank < 40 ? 0.9 : 0.5;
      ctx.beginPath();
      ctx.moveTo(X(line.pts[0].x), Y(line.pts[0].y));
      for (let i = 1; i < line.pts.length; i++) ctx.lineTo(X(line.pts[i].x), Y(line.pts[i].y));
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
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
    if (this.transport && this.economy) {
      const day = Math.floor(this.transport.minutes / 1440);
      if (day > this.lastEconomyDay) {
        advanceEconomy(this.economy, day - this.lastEconomyDay);
        this.lastEconomyDay = day;
        this.updateEconomyPanel();
      }
    }
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
    if (this.showBorders && this.borders) this.drawBorders(ctx, originX, originY, s);
    if (this.showRoads && this.roads) this.drawRoads(ctx, originX, originY, s);
    if (this.showCities && cityLod(s) > 0) this.drawCities(ctx, originX, originY, s);
    if (this.showGrid) this.drawGrid(ctx, originX, originY, s);
    if (this.showSettlements) this.drawSettlements(ctx, originX, originY, s);
    if (this.showQ) this.drawQ(ctx, originX, originY, s);
    ctx.restore();

    this.drawScaleBar(ctx);
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
    }
  }

  drawRoads(ctx, originX, originY, s) {
    // на мелком зуме ширина картографическая (иначе дорога тоньше пикселя), на крупном — по метрам
    const MIN = { M: 2.6, R: 2.0, L: 1.5, G: 1.0 };
    const order = { G: 0, L: 1, R: 2, M: 3 };
    const edges = this.roads.edges.slice().sort((a, b) => order[a.cls] - order[b.cls]);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    for (const e of edges) {
      const meta = ROAD_CLASS[e.cls] || ROAD_CLASS.L;
      const real = (meta.widthM / 1000) * s;
      const w = Math.max(MIN[e.cls] || 1, Math.min(30, real));
      ctx.beginPath();
      for (let i = 0; i < e.points.length; i++) {
        const p = e.points[i];
        const sx = originX + p[0] * s, sy = originY - p[1] * s;
        if (i === 0) ctx.moveTo(sx, sy); else ctx.lineTo(sx, sy);
      }
      // тёмная обводка — дорога читается на любом фоне
      ctx.setLineDash([]);
      ctx.strokeStyle = 'rgba(28,32,26,0.55)';
      ctx.lineWidth = w + 1.6;
      ctx.stroke();
      const [r, g, b] = meta.tone;
      ctx.strokeStyle = 'rgb(' + r + ',' + g + ',' + b + ')';
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
      ctx.strokeStyle = v.tone;
      ctx.lineWidth = w;
      ctx.beginPath();
      ctx.moveTo(sx - ca * len * 0.5, sy + sa * len * 0.5);
      ctx.lineTo(sx + ca * len * 0.5, sy - sa * len * 0.5);
      ctx.stroke();
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

  updateHud() {
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
      const day = Math.floor(total / 1440) + 1;
      const hh = String(Math.floor((total % 1440) / 60)).padStart(2, '0');
      const mm = String(total % 60).padStart(2, '0');
      this.hud.clock.textContent = 'день ' + day + ' · ' + hh + ':' + mm;
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
