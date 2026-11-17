/* §87: начальная сцена. Вместо глухой заставки — пролёт над своей страной:
   подложка из чуть размытой карты мира (наша страна на ней видна), поверх — резкая
   карта страны, камера медленно идёт от города к городу. Пока идёт пролёт, движок
   занят загрузкой; когда готово — появляется кнопка «Начать игру».
   Модуль считает только камеру и слои: время и решения остаются в main2d. */
import { WorldView, WV } from './worldview.js';
import { MARK, pointInPolygon } from './worldmap2d.js';
import { drawMark } from './worldview.js';

export const INTRO = {
  hopSec: 4.2,          // сколько камера идёт от точки к точке
  scaleMin: 0.16,       // px на км: ближе всего к земле
  scaleMax: 0.26,       // px на км: дальше всего
  layerPx: 2200,        // сторона резкого слоя своей страны
  blurPx: 4,            // размытие подложки
  vignette: 0.55,       // насколько темнеют края
  fadeMs: 420
};

/* F-305: маршрут пролёта — столица, затем города по кругу; ровный обход без рывков. */
export function tourWaypoints(own) {
  const cities = own.cities.slice().sort((a, b) => Math.atan2(a.y, a.x) - Math.atan2(b.y, b.x));
  return cities.map((c) => ({ x: c.x, y: c.y, name: c.name }));
}

/* F-306: камера пролёта в момент t (секунды). Идёт по кругу, между точками — плавно. */
export function tourCam(points, t, scaleMin = INTRO.scaleMin, scaleMax = INTRO.scaleMax) {
  if (!points.length) return { x: 0, y: 0, scale: scaleMin, i: 0, name: '' };
  const hop = INTRO.hopSec;
  // время может прийти мусором (кадр без метки) — считаем, что оно стоит
  const safeT = Number.isFinite(t) ? t : 0;
  const pos = ((safeT / hop) % points.length + points.length) % points.length;
  const i = Math.floor(pos);
  const k = pos - i;
  const e = k * k * (3 - 2 * k);
  const a = points[i % points.length];
  const b = points[(i + 1) % points.length];
  return {
    x: a.x + (b.x - a.x) * e,
    y: a.y + (b.y - a.y) * e,
    // масштаб гуляет по синусу: то ближе к земле, то выше
    scale: scaleMin + (scaleMax - scaleMin) * (0.5 + 0.5 * Math.sin(t * 0.6)),
    i: i % points.length,
    name: b.name
  };
}

export function insideOwn(own, x, y) {
  return pointInPolygon(x, y, own.poly);
}

export class Intro {
  constructor(canvas, world, opts = {}) {
    this.canvas = canvas;
    this.world = world;
    this.opts = opts;
    this.ctx = canvas.getContext('2d');
    this.view = { w: 1, h: 1 };
    this.dpr = 1;
    this.t = 0;
    this.raf = 0;
    this.running = false;
    this.ready = false;
    this.points = tourWaypoints(world.own);
    this.bg = null;          // размытая подложка: карта мира
    this.layer = null;       // резкий слой своей страны
    this.edge = null;        // подложка по краям: размытая карта мира
    this.lastDrawMs = 0;
    this.frames = 0;
  }

  resize() {
    this.edge = null;
    const r = this.canvas.getBoundingClientRect ? this.canvas.getBoundingClientRect() : { width: 900, height: 600 };
    this.dpr = Math.min(2, (typeof window !== 'undefined' && window.devicePixelRatio) || 1);
    this.view.w = Math.max(1, r.width);
    this.view.h = Math.max(1, r.height);
    this.canvas.width = Math.round(this.view.w * this.dpr);
    this.canvas.height = Math.round(this.view.h * this.dpr);
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    return this.view;
  }

  /* Подложка: карта мира целиком в базовом слое, но размытая — она «на фоне». */
  buildBackground() {
    const wv = new WorldView(this.canvas, this.opts);
    wv.setWorld(this.world);
    wv.paintBasePass(0);
    wv.paintBasePass(1);
    this.bg = wv.base;
    return this.bg;
  }

  /* Резкий слой своей страны: шире мира не нужно — только 7000 км вокруг столицы. */
  buildLayer() {
    const size = INTRO.layerPx;
    const world = this.world;
    const own = world.own;
    const span = world.sizeKm / 2;                 // 7000 км в каждую сторону от центра
    const cv = this.opts.createCanvas ? this.opts.createCanvas(size, size) : document.createElement('canvas');
    cv.width = size; cv.height = size;
    const ctx = cv.getContext('2d');
    const k = size / (span * 2);
    const toPx = (v) => (v + span) * k;
    ctx.fillStyle = '#3f4a34';
    ctx.beginPath();
    own.poly.forEach(([x, y], i) => (i ? ctx.lineTo(toPx(x), toPx(y)) : ctx.moveTo(toPx(x), toPx(y))));
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(240,244,246,0.9)';
    ctx.lineWidth = 3;
    ctx.stroke();
    // отметки рельефа внутри страны — только свои, чужие не тащим
    const marks = world.marks;
    for (let i = 0; i < marks.length; i += 3) {
      if (!pointInPolygon(marks[i], marks[i + 1], own.poly)) continue;
      const type = ['forest', 'swamp', 'mountain', 'steppe', 'desert', 'tundra'][marks[i + 2]] || 'forest';
      drawMark(ctx, toPx(marks[i]), toPx(marks[i + 1]), type, 1.5);
    }
    // дороги
    for (const r of world.roads) {
      if (r.country !== 'own') continue;
      ctx.beginPath();
      ctx.moveTo(toPx(r.x1), toPx(r.y1));
      ctx.lineTo(toPx(r.x2), toPx(r.y2));
      ctx.strokeStyle = r.kind === 'international' ? 'rgba(255,214,110,0.85)' : 'rgba(232,238,244,0.45)';
      ctx.lineWidth = r.kind === 'international' ? 3 : 1.6;
      ctx.stroke();
    }
    // города
    ctx.font = '15px sans-serif';
    for (const c of own.cities) {
      const x = toPx(c.x), y = toPx(c.y);
      ctx.beginPath();
      ctx.arc(x, y, c.capital ? 7 : 5, 0, Math.PI * 2);
      ctx.fillStyle = c.capital ? '#f4f6f8' : 'rgba(232,238,244,0.92)';
      ctx.fill();
      ctx.fillStyle = 'rgba(244,246,248,0.95)';
      ctx.fillText(c.name, x + 10, y + 5);
    }
    this.layer = cv;
    return cv;
  }

  /* Края кадра: размытая карта мира, плавно проявляющаяся к границам.
     Собирается один раз при старте и при смене размера. */
  buildEdge() {
    const { view } = this;
    if (!this.bg) return null;
    const cv = this.opts.createCanvas ? this.opts.createCanvas(Math.ceil(view.w), Math.ceil(view.h)) : document.createElement('canvas');
    cv.width = Math.ceil(view.w * this.dpr);
    cv.height = Math.ceil(view.h * this.dpr);
    const ctx = cv.getContext('2d');
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    const span = this.world.sizeKm;
    const scale = Math.max(view.w, view.h) / span * 1.1;
    ctx.globalAlpha = 0.85;
    if (ctx.filter !== undefined) ctx.filter = 'blur(' + INTRO.blurPx + 'px)';
    ctx.drawImage(this.bg, (view.w - span * scale) / 2, (view.h - span * scale) / 2, span * scale, span * scale);
    if (ctx.filter !== undefined) ctx.filter = 'none';
    ctx.globalAlpha = 1;
    // маска: в центре прозрачно (там резкая страна), к краям подложка проявляется
    const g = ctx.createRadialGradient(view.w / 2, view.h / 2, Math.min(view.w, view.h) * 0.30,
      view.w / 2, view.h / 2, Math.max(view.w, view.h) * 0.62);
    g.addColorStop(0, 'rgba(0,0,0,0)');
    g.addColorStop(1, 'rgba(0,0,0,1)');
    ctx.globalCompositeOperation = 'destination-in';
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, view.w, view.h);
    ctx.globalCompositeOperation = 'source-over';
    this.edge = cv;
    return cv;
  }

  start() {
    if (this.running) return this;
    this.running = true;
    this.resize();
    if (!this.bg) this.buildBackground();
    if (!this.layer) this.buildLayer();
    if (!this.edge) this.buildEdge();
    const loop = (ms) => {
      if (!this.running) { this.raf = 0; return; }
      this.raf = requestAnimationFrame(loop);
      const now = Number.isFinite(ms) ? ms : (this.last || 0) + 16;
      const dt = Math.min(0.1, (now - (this.last || now)) / 1000 || 0.016);
      this.last = now;
      this.t += Number.isFinite(dt) ? dt : 0.016;
      this.draw();
    };
    this.raf = requestAnimationFrame(loop);
    return this;
  }

  stop() {
    this.running = false;
    if (this.raf) { cancelAnimationFrame(this.raf); this.raf = 0; }
    return this;
  }

  draw() {
    const t0 = (typeof performance !== 'undefined' ? performance.now() : Date.now());
    const { ctx, view, world } = this;
    if (!this.bg) return this;
    const cam = tourCam(this.points, this.t);
    ctx.save();
    // 1. подложка: вся карта мира, размытая, чуть притушенная
    ctx.fillStyle = '#08131c';
    ctx.fillRect(0, 0, view.w, view.h);
    const span = world.sizeKm;
    const baseScale = Math.max(view.w, view.h) / span * 1.18;
    const bx = view.w / 2 - (cam.x * 0.4) * baseScale / 8;
    const by = view.h / 2 - (cam.y * 0.4) * baseScale / 8;
    ctx.globalAlpha = 0.5;
    if (ctx.filter !== undefined) ctx.filter = 'blur(' + INTRO.blurPx + 'px)';
    ctx.drawImage(this.bg, bx - span * baseScale / 2, by - span * baseScale / 2, span * baseScale, span * baseScale);
    if (ctx.filter !== undefined) ctx.filter = 'none';
    ctx.globalAlpha = 1;

    // 2. резкая страна: камера идёт от города к городу
    if (this.layer) {
      const k = cam.scale;
      const lx = view.w / 2 - (cam.x + world.sizeKm / 2) * k;
      const ly = view.h / 2 - (cam.y + world.sizeKm / 2) * k;
      const side = world.sizeKm * k;
      ctx.drawImage(this.layer, lx, ly, side, side);
      // края: снова размытая карта мира, уже поверх резкой страны
      if (this.edge) ctx.drawImage(this.edge, 0, 0, view.w, view.h);
      // 3. края мягко уходят в размытую подложку
      const g = ctx.createRadialGradient(view.w / 2, view.h / 2, Math.min(view.w, view.h) * 0.18,
        view.w / 2, view.h / 2, Math.max(view.w, view.h) * 0.72);
      g.addColorStop(0, 'rgba(8,19,28,0)');
      g.addColorStop(1, 'rgba(8,19,28,' + INTRO.vignette + ')');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, view.w, view.h);
    }
    // 4. тёмный верх и низ, чтобы текст читался на любом кадре
    const gt = ctx.createLinearGradient(0, 0, 0, view.h * 0.42);
    gt.addColorStop(0, 'rgba(6,14,20,0.82)');
    gt.addColorStop(1, 'rgba(6,14,20,0)');
    ctx.fillStyle = gt;
    ctx.fillRect(0, 0, view.w, view.h * 0.42);
    const gb = ctx.createLinearGradient(0, view.h * 0.55, 0, view.h);
    gb.addColorStop(0, 'rgba(6,14,20,0)');
    gb.addColorStop(1, 'rgba(6,14,20,0.9)');
    ctx.fillStyle = gb;
    ctx.fillRect(0, view.h * 0.55, view.w, view.h * 0.45);
    ctx.restore();
    this.frames++;
    this.lastDrawMs = (typeof performance !== 'undefined' ? performance.now() : Date.now()) - t0;
    return this;
  }
}

export { MARK, WV };
