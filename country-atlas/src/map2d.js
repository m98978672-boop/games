/* 2D-карта: обзор мира, детальный патч, сетка, поселения, масштабная линейка.
   Движение простое: тянуть — сдвиг, колесо — зум, без поворотов. */
import { WORLD2D, settlements, heightKm, colorAtKm } from './world2d.js';
import { screenToWorld, worldToScreen, clampCenter, zoomAt, shiftBy, gridStep, scaleBarKm, patchPixels } from './view2d.js';

export class Map2D {
  constructor(canvas, hud) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.hud = hud || {};
    this.center = { x: 0, y: 0 };
    this.scale = 1.6;            // пикселей на километр
    this.minScale = 0.35;
    this.maxScale = 90;
    this.overview = null;        // canvas с обзором 700 км
    this.detail = null;          // { canvas, x0, y0, sizeKm }
    this.detailWanted = null;
    this.settlements = settlements(18);
    this.showGrid = true;
    this.showSettlements = true;
    this.showQ = true;
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
    const size = 1024;
    const worker = this.makeWorker();
    this.worker = worker;

    const canvas = document.createElement('canvas');
    canvas.width = size; canvas.height = size;
    const ctx = canvas.getContext('2d');

    const paint = (buffer) => {
      const img = new ImageData(new Uint8ClampedArray(buffer), size, size);
      ctx.putImageData(img, 0, 0);
      this.overview = canvas;
    };

    if (worker) {
      await new Promise((resolve) => {
        let settled = false;
        const done = () => { if (!settled) { settled = true; resolve(); } };
        worker.onmessage = (e) => {
          if (e.data.type === 'overview') { paint(e.data.buffer); done(); }
          else if (e.data.type === 'patch') this.acceptPatch(e.data);
        };
        worker.onerror = () => { done(); };
        worker.postMessage({ type: 'overview', size });
        // запасной путь, если воркер молчит
        setTimeout(() => {
          if (!this.overview) { this.overviewLocal(size); done(); }
        }, 6000);
      });
    } else {
      await nextFrame();
      this.overviewLocal(size);
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
    if (!this.worker || this.scale < 3.5) return;
    const s = this.scale;
    const wKm = Math.min(WORLD2D.sizeKm, Math.max(4, this.view.w / s));
    const hKm = Math.min(WORLD2D.sizeKm, Math.max(4, this.view.h / s));
    const x0 = this.center.x, y0 = this.center.y;
    const w = patchPixels(this.view.w, this.dpr);
    const h = patchPixels(this.view.h, this.dpr);
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

  setZoom(next, anchor) {
    const r = zoomAt(this.center, this.view, this.scale, next, anchor, { min: this.minScale, max: this.maxScale });
    this.center = r.center;
    this.scale = r.scale;
    this.draw();
  }

  /* ---------------- отрисовка ---------------- */
  draw() {
    const { ctx, view } = this;
    ctx.save();
    ctx.fillStyle = '#0d2233';
    ctx.fillRect(0, 0, view.w, view.h);

    const s = this.scale;
    const originX = view.w / 2 - this.center.x * s;
    const originY = view.h / 2 + this.center.y * s;

    if (this.overview) {
      ctx.imageSmoothingEnabled = s < 2.2;
      ctx.drawImage(this.overview, originX - WORLD2D.halfKm * s, originY - WORLD2D.halfKm * s, WORLD2D.sizeKm * s, WORLD2D.sizeKm * s);
    }

    if (this.detail && s >= 3.5) {
      const d = this.detail;
      ctx.imageSmoothingEnabled = false;
      const dx = originX + (d.x0 - d.wKm / 2) * s;
      const dy = originY - (d.y0 + d.hKm / 2) * s;
      ctx.drawImage(d.canvas, dx, dy, d.wKm * s, d.hKm * s);
    }

    // сетка, поселения и Q-кольцо не выходят за карту
    ctx.save();
    ctx.beginPath();
    ctx.rect(originX - WORLD2D.halfKm * s, originY - WORLD2D.halfKm * s, WORLD2D.sizeKm * s, WORLD2D.sizeKm * s);
    ctx.clip();

    if (this.showGrid) this.drawGrid(ctx, originX, originY, s);
    if (this.showSettlements) this.drawSettlements(ctx, originX, originY, s);
    if (this.showQ) this.drawQ(ctx, originX, originY, s);
    ctx.restore();

    this.drawScaleBar(ctx);
    ctx.restore();

    this.frames++;
    const now = performance.now();
    if (now - this.fpsT > 500) {
      this.fps = Math.round(this.frames * 1000 / (now - this.fpsT));
      this.frames = 0; this.fpsT = now;
      this.updateHud();
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

  drawSettlements(ctx, originX, originY, s) {
    if (s < 1.4) return;
    for (const p of this.settlements) {
      const sx = originX + p.x * s, sy = originY - p.y * s;
      ctx.beginPath();
      ctx.arc(sx, sy, 3.2, 0, Math.PI * 2);
      ctx.fillStyle = '#f6f1e4';
      ctx.fill();
      ctx.lineWidth = 1.4;
      ctx.strokeStyle = '#1a1a1a';
      ctx.stroke();
      if (s > 4) {
        ctx.fillStyle = 'rgba(255,255,255,0.9)';
        ctx.font = '11px ui-monospace, monospace';
        ctx.fillText(p.name + ' · ' + Math.round(p.h) + ' м', sx + 6, sy + 4);
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

  updateHud() {
    const p = this.pointer;
    const w = this.toWorld(p.x, p.y);
    const h = heightKm(w.x, w.y);
    if (this.hud.pos) this.hud.pos.textContent = w.x.toFixed(0) + '; ' + w.y.toFixed(0) + ' км';
    if (this.hud.height) this.hud.height.textContent = Math.round(h) + ' м';
    if (this.hud.zoom) this.hud.zoom.textContent = this.scale.toFixed(1) + ' px/км';
    if (this.hud.fps) this.hud.fps.textContent = this.fps;
    if (this.hud.center) this.hud.center.textContent = this.center.x.toFixed(0) + '; ' + this.center.y.toFixed(0) + ' км';
  }
}

function nextFrame() {
  return new Promise((r) => setTimeout(r, 0));
}
