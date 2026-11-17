/* §86: отрисовка карты мира (R-86.5…R-86.8).
   Движок здесь не «рисует всё каждый кадр»: сначала считается базовый слой — океан, страны,
   отметки рельефа — в отдельную канву один раз; дальше каждый кадр только блит готовой
   картинки и живой слой поверх (дороги, города, армии, взрывы, разрушения, оккупация).
   Загрузка идёт в два прохода прямо во время анимации перехода: сначала страны и границы,
   потом отметки. Пока не готово — карта честно показывает то, что уже есть. */
import { MARK, countryAt, canSeeArmies, pointInPolygon } from './worldmap2d.js';

export const WV = {
  baseSize: 1400,          // сторона базового слоя, px
  minScale: 0.004,         // px на км: дальше уже некуда
  maxScale: 0.9,
  overviewScale: 0.045,    // «вся планета» в кадре 900 px
  transitionMs: 900,
  loadPasses: 2,
  markPx: 3.2,
  cityPx: 2.4,
  labelScale: 0.16,
  armyScale: 0.1
};

/* F-301: масштаб, при котором в кадр влезает континент.
   span — диаметр обитаемой части мира (по побережью), а не сторона квадрата карты. */
export function overviewScale(view, padPx = 40, spanKm = 23200) {
  const w = Math.max(1, view.w), h = Math.max(1, view.h);
  return Math.min(w - padPx * 2, h - padPx * 2) / spanKm;
}

export function clampViewScale(s) {
  if (!Number.isFinite(s)) return WV.overviewScale;
  return Math.max(WV.minScale, Math.min(WV.maxScale, s));
}

export function worldToScreen(cam, view, x, y) {
  return { x: view.w / 2 + (x - cam.x) * cam.scale, y: view.h / 2 + (y - cam.y) * cam.scale };
}

export function screenToWorld(cam, view, sx, sy) {
  return { x: cam.x + (sx - view.w / 2) / cam.scale, y: cam.y + (sy - view.h / 2) / cam.scale };
}

export function visibleRect(cam, view) {
  const halfW = view.w / (2 * cam.scale), halfH = view.h / (2 * cam.scale);
  return { x0: cam.x - halfW, y0: cam.y - halfH, x1: cam.x + halfW, y1: cam.y + halfH };
}

/* F-302: плавное приближение камеры — из игрового кадра в обзор мира.
   Кривая easeInOut: начало и конец без рывка. */
export function lerpCam(from, to, t) {
  const k = t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t);
  return {
    x: from.x + (to.x - from.x) * k,
    y: from.y + (to.y - from.y) * k,
    // масштаб интерполируем по логарифму: иначе середина пути «прыгает»
    scale: Math.exp(Math.log(from.scale) + (Math.log(to.scale) - Math.log(from.scale)) * k)
  };
}

export class WorldView {
  constructor(canvas, opts = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.view = { w: 1, h: 1 };
    this.cam = { x: 0, y: 0, scale: WV.overviewScale };
    this.world = null;
    this.base = null;              // базовый слой
    this.ready = 0;                // 0…2 сколько проходов отрисовано
    this.transition = null;        // {from, to, t, ms}
    this.alpha = 1;
    this.showArmies = true;
    this.labels = true;
    this.dpr = 1;
    this.frames = 0;
    this.detail = null;          // слой дорог и городов: перерисовывается только при сдвиге камеры
    this.detailCam = { x: 0, y: 0, scale: 0 };
    this.detailRev = -1;
    this.detailPad = 96;
    this.rebuilds = 0;
    this.lastDrawMs = 0;
    this.opts = opts;
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect ? this.canvas.getBoundingClientRect() : { width: 900, height: 600 };
    this.dpr = Math.min(2, (typeof window !== 'undefined' && window.devicePixelRatio) || 1);
    this.view.w = Math.max(1, rect.width);
    this.view.h = Math.max(1, rect.height);
    this.canvas.width = Math.round(this.view.w * this.dpr);
    this.canvas.height = Math.round(this.view.h * this.dpr);
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    return this.view;
  }

  setWorld(world) {
    this.world = world;
    this.ready = 0;
    this.base = null;
    return this;
  }

  /* F-303: переход. Камера летит из игрового кадра в обзор мира, а базовый слой
     в это же время дорисовывается по проходам — анимация и есть загрузка. */
  open(fromCam = null, ms = WV.transitionMs) {
    const to = { x: 0, y: 0, scale: overviewScale(this.view) };
    this.transition = fromCam
      ? { from: { x: fromCam.x, y: fromCam.y, scale: clampViewScale(fromCam.scale) }, to, t: 0, ms }
      : null;
    this.cam = fromCam ? { ...this.transition.from } : { ...to };
    this.alpha = fromCam ? 0.25 : 1;
    return this;
  }

  close() {
    this.transition = null;
    return this;
  }

  /* шаг анимации и подгрузки: вызывается из кадра */
  step(dtSec = 1 / 60) {
    if (this.transition) {
      this.transition.t = Math.min(1, this.transition.t + (dtSec * 1000) / this.transition.ms);
      this.cam = lerpCam(this.transition.from, this.transition.to, this.transition.t);
      this.alpha = 0.25 + 0.75 * Math.min(1, this.transition.t * 1.4);
      if (this.transition.t >= 1) this.transition = null;
    } else {
      this.alpha = Math.min(1, this.alpha + dtSec * 4);
    }
    // по одному проходу базового слоя за кадр — карта «проявляется», а не висит
    if (this.world && this.ready < WV.loadPasses) this.paintBasePass(this.ready++);
    return this;
  }

  get loading() { return !this.world || this.ready < WV.loadPasses; }

  ensureBase() {
    if (this.base) return this.base;
    const size = WV.baseSize;
    const c = this.opts.createCanvas ? this.opts.createCanvas(size, size) : document.createElement('canvas');
    c.width = size;
    c.height = size;
    this.base = c;
    this.baseCtx = c.getContext('2d');
    return c;
  }

  /* Один проход базового слоя. Пасс 0: океан, страны, границы. Пасс 1: отметки рельефа. */
  paintBasePass(pass) {
    if (!this.world) return;
    const size = WV.baseSize;
    const c = this.ensureBase();
    const ctx = this.baseCtx;
    const k = size / this.world.sizeKm;
    const toPx = (x) => (x + this.world.sizeKm / 2) * k;
    if (pass === 0) {
      ctx.fillStyle = '#0b1a26';
      ctx.fillRect(0, 0, size, size);
      // суша: страны заливаются своим тоном, наша — светлее
      for (const ctry of this.world.countries) {
        ctx.beginPath();
        ctry.poly.forEach(([x, y], i) => (i ? ctx.lineTo(toPx(x), toPx(y)) : ctx.moveTo(toPx(x), toPx(y))));
        ctx.closePath();
        ctx.fillStyle = ctry.own ? '#55633f' : shadeFor(ctry);
        ctx.fill();
        ctx.strokeStyle = ctry.own ? 'rgba(240,244,246,0.9)' : 'rgba(20,30,36,0.55)';
        ctx.lineWidth = ctry.own ? 2.2 : 1.1;
        ctx.stroke();
      }
      return;
    }
    // пасс 1: отметки рельефа значками, как на настоящих картах
    const marks = this.world.marks;
    for (let i = 0; i < marks.length; i += 3) {
      const x = toPx(marks[i]), y = toPx(marks[i + 1]);
      const type = ['forest', 'swamp', 'mountain', 'steppe', 'desert', 'tundra'][marks[i + 2]] || 'forest';
      drawMark(ctx, x, y, type, 0.9);
    }
    // границы поверх отметок, чтобы линии читались
    for (const ctry of this.world.countries) {
      ctx.beginPath();
      ctry.poly.forEach(([x, y], i) => (i ? ctx.lineTo(toPx(x), toPx(y)) : ctx.moveTo(toPx(x), toPx(y))));
      ctx.closePath();
      ctx.strokeStyle = ctry.own ? 'rgba(240,244,246,0.9)' : 'rgba(12,18,24,0.5)';
      ctx.lineWidth = ctry.own ? 2.2 : 1;
      ctx.stroke();
    }
  }

  draw() {
    const t0 = (typeof performance !== 'undefined' ? performance.now() : Date.now());
    const { ctx, view } = this;
    const world = this.world;
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.fillStyle = '#08131c';
    ctx.fillRect(0, 0, view.w, view.h);
    if (!world) { ctx.restore(); return this; }

    // базовый слой: целиком или по готовности
    if (this.base) {
      const span = world.sizeKm * this.cam.scale;
      const originX = view.w / 2 - (this.cam.x + world.sizeKm / 2) * this.cam.scale;
      const originY = view.h / 2 - (this.cam.y + world.sizeKm / 2) * this.cam.scale;
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(this.base, originX, originY, span, span);
    }

    const cam = this.cam;
    const p = (x, y) => ({ x: view.w / 2 + (x - cam.x) * cam.scale, y: view.h / 2 + (y - cam.y) * cam.scale });
    const visibleArmies = this.showArmies && canSeeArmies(world, 'own');

    // F-302: дороги, города и их подписи живут в отдельном слое с полями по краям.
    // Пока камера стоит (а смотрят карту мира именно так), слой просто копируется.
    if (this.needsDetail()) this.paintDetail();
    if (this.detail) ctx.drawImage(this.detail, -this.detailPad, -this.detailPad, this.detail.width / this.dpr, this.detail.height / this.dpr);

    // оккупация — буферные полосы; игрок их только видит
    for (const o of world.occupied) {
      const c0 = p(o.x, o.y);
      const r = Math.max(3, o.rKm * cam.scale);
      if (c0.x < -r || c0.y < -r || c0.x > view.w + r || c0.y > view.h + r) continue;
      ctx.beginPath();
      ctx.arc(c0.x, c0.y, r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(196,66,48,0.13)';
      ctx.fill();
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = 'rgba(196,66,48,0.5)';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // армии — только если спутник видит
    if (visibleArmies) {
      // метка армии растёт вместе с масштабом: на обзоре мира это искра, вблизи — флажок
      const size = Math.max(4, Math.min(10, 70 * cam.scale + 3));
      const wMark = size * 1.7, hMark = size;
      for (const a of world.armies) {
        const s1 = p(a.x, a.y);
        if (s1.x < -20 || s1.y < -20 || s1.x > view.w + 20 || s1.y > view.h + 20) continue;
        ctx.fillStyle = 'rgba(6,12,17,0.55)';
        ctx.fillRect(s1.x - wMark / 2 - 1, s1.y - hMark / 2 - 1, wMark + 2, hMark + 2);
        ctx.fillStyle = a.country === 'own' ? 'rgba(120,200,255,0.98)' : 'rgba(255,170,90,0.95)';
        ctx.fillRect(s1.x - wMark / 2, s1.y - hMark / 2, wMark, hMark);
        // штрих посередине — армия не путается с городом
        ctx.fillStyle = 'rgba(6,12,17,0.8)';
        ctx.fillRect(s1.x - wMark / 4, s1.y - 0.6, wMark / 2, 1.2);
      }
    }

    // взрывы: большое кольцо и малое, гаснут со временем
    for (const e of world.explosions) {
      const age = Math.max(0, world.minutes - e.at) / 40;
      const fade = Math.max(0, 1 - age);
      const s2 = p(e.x, e.y);
      const r = Math.max(2.5, e.rKm * cam.scale) * (e.big ? 1.6 : 1);
      ctx.beginPath();
      ctx.arc(s2.x, s2.y, r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,' + Math.round(120 + 80 * fade) + ',60,' + (0.35 * fade + 0.15) + ')';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(s2.x, s2.y, r * 1.9, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255,150,80,' + (0.35 * fade) + ')';
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }

    // подпись своей страны: контур и имя, чтобы не потерялась
    const own = world.own;
    if (own && cam.scale < WV.labelScale * 2) {
      const s3 = p(0, 0);
      ctx.strokeStyle = 'rgba(240,244,246,0.55)';
      ctx.lineWidth = 1;
      ctx.strokeRect(s3.x - 4, s3.y - 4, 8, 8);
      ctx.fillStyle = 'rgba(240,244,246,0.92)';
      ctx.font = '12px sans-serif';
      ctx.fillText(own.name, s3.x + 8, s3.y - 6);
    }
    ctx.restore();
    this.frames++;
    this.lastDrawMs = (typeof performance !== 'undefined' ? performance.now() : Date.now()) - t0;
    return this;
  }

  /* Нужно ли пересобирать слой подробностей: камера ушла за поля, масштаб
     изменился больше чем на 2 %, либо мир сообщил о разрушениях. */
  needsDetail() {
    if (!this.world) return false;
    if (!this.detail) return true;
    const pad = this.detailPad;
    const dw = Math.abs(this.detail.width / this.dpr - (this.view.w + pad * 2)) > 0.5;
    const dh = Math.abs(this.detail.height / this.dpr - (this.view.h + pad * 2)) > 0.5;
    if (dw || dh) return true;
    if ((this.world.rev || 0) !== this.detailRev) return true;
    const c = this.cam;
    const dx = Math.abs((c.x - this.detailCam.x) * c.scale);
    const dy = Math.abs((c.y - this.detailCam.y) * c.scale);
    if (dx > this.detailPad * 0.55 || dy > this.detailPad * 0.55) return true;
    return Math.abs(c.scale / this.detailCam.scale - 1) > 0.02;
  }

  paintDetail() {
    const world = this.world;
    const pad = this.detailPad;
    const w = Math.ceil(this.view.w + pad * 2), h = Math.ceil(this.view.h + pad * 2);
    if (!this.detail) this.detail = this.opts.createCanvas ? this.opts.createCanvas(w, h) : document.createElement('canvas');
    const cv = this.detail;
    cv.width = Math.round(w * this.dpr);
    cv.height = Math.round(h * this.dpr);
    const ctx = cv.getContext('2d');
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    ctx.translate(pad, pad);
    const cam = this.cam, view = this.view;
    // без промежуточных объектов: только числа
    const k = cam.scale;
    const ox = view.w / 2 - cam.x * k, oy = view.h / 2 - cam.y * k;
    // границы видимой области в мировых координатах (а не в экранных)
    const x0 = (-ox - pad) / k, x1 = (view.w - ox + pad) / k;
    const y0 = (-oy - pad) / k, y1 = (view.h - oy + pad) / k;
    ctx.lineCap = 'butt';
    for (const r of world.roads) {
      if (Math.max(r.x1, r.x2) < x0 || Math.min(r.x1, r.x2) > x1) continue;
      if (Math.max(r.y1, r.y2) < y0 || Math.min(r.y1, r.y2) > y1) continue;
      const broken = world.destroyed.roads.includes(r.id);
      ctx.beginPath();
      ctx.moveTo(r.x1 * k + ox, r.y1 * k + oy);
      ctx.lineTo(r.x2 * k + ox, r.y2 * k + oy);
      ctx.strokeStyle = broken ? 'rgba(214,64,48,0.55)'
        : r.kind === 'international' ? 'rgba(255,214,110,0.75)' : 'rgba(232,238,244,0.35)';
      ctx.lineWidth = r.kind === 'international' ? 1.6 : 0.9;
      ctx.setLineDash(broken ? [3, 4] : []);
      ctx.stroke();
    }
    ctx.setLineDash([]);
    const showLabels = this.labels && cam.scale >= WV.labelScale;
    ctx.font = '11px sans-serif';
    for (const city of world.cities) {
      const sx = city.x * k + ox, sy = city.y * k + oy;
      if (sx < -24 || sy < -24 || sx > view.w + 24 || sy > view.h + 24) continue;
      const dead = world.destroyed.cities.includes(city.id);
      ctx.beginPath();
      ctx.arc(sx, sy, city.capital ? 3 : 2, 0, Math.PI * 2);
      ctx.fillStyle = dead ? '#d64030' : city.capital ? '#f4f6f8' : 'rgba(232,238,244,0.8)';
      ctx.fill();
      if (dead) {
        ctx.strokeStyle = '#d64030';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(sx - 4, sy - 4); ctx.lineTo(sx + 4, sy + 4);
        ctx.moveTo(sx + 4, sy - 4); ctx.lineTo(sx - 4, sy + 4);
        ctx.stroke();
      }
      if (showLabels && city.capital) {
        ctx.fillStyle = 'rgba(240,244,246,0.9)';
        ctx.fillText(city.name, sx + 6, sy + 4);
      }
    }
    this.detailCam = { x: cam.x, y: cam.y, scale: cam.scale };
    this.detailRev = world.rev || 0;
    this.rebuilds++;
    return this;
  }

  /* F-304: попадание по точке — какая страна под курсором (для подсказки). */
  countryAtScreen(sx, sy) {
    if (!this.world) return null;
    const w = screenToWorld(this.cam, this.view, sx, sy);
    return countryAt(this.world, w.x, w.y);
  }

  zoomAt(sx, sy, factor) {
    const before = screenToWorld(this.cam, this.view, sx, sy);
    this.cam.scale = clampViewScale(this.cam.scale * factor);
    const after = screenToWorld(this.cam, this.view, sx, sy);
    this.cam.x += before.x - after.x;
    this.cam.y += before.y - after.y;
    this.clampCam();
    return this;
  }

  panBy(dxPx, dyPx) {
    this.cam.x -= dxPx / this.cam.scale;
    this.cam.y -= dyPx / this.cam.scale;
    this.clampCam();
    return this;
  }

  clampCam() {
    const half = (this.world ? this.world.sizeKm : 24000) / 2;
    this.cam.x = Math.max(-half, Math.min(half, this.cam.x));
    this.cam.y = Math.max(-half, Math.min(half, this.cam.y));
    return this;
  }
}

/* Значок рельефа: лес — ёлочки, болото — чёрточки, горы — галочки, пустыня — точки,
   тундра — крестики, степь — короткие штрихи. Как на настоящих топокартах. */
export function drawMark(ctx, x, y, type, k = 1) {
  const s = WV.markPx * k;
  ctx.strokeStyle = MARK[type] ? MARK[type].tone : '#4a5a46';
  ctx.fillStyle = ctx.strokeStyle;
  ctx.lineWidth = 1;
  if (type === 'forest') {
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath();
      ctx.moveTo(x + i * s, y - s * 0.8);
      ctx.lineTo(x + i * s - s * 0.5, y + s * 0.6);
      ctx.lineTo(x + i * s + s * 0.5, y + s * 0.6);
      ctx.closePath();
      ctx.fill();
    }
  } else if (type === 'swamp') {
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath();
      ctx.moveTo(x - s, y + i * s * 0.7);
      ctx.lineTo(x + s, y + i * s * 0.7);
      ctx.stroke();
    }
  } else if (type === 'mountain') {
    ctx.beginPath();
    ctx.moveTo(x - s, y + s * 0.6);
    ctx.lineTo(x, y - s);
    ctx.lineTo(x + s, y + s * 0.6);
    ctx.stroke();
  } else if (type === 'desert') {
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.arc(x + (i - 1) * s * 0.9, y + (i % 2 ? s * 0.4 : -s * 0.3), 0.8, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (type === 'tundra') {
    ctx.beginPath();
    ctx.moveTo(x - s * 0.6, y - s * 0.6); ctx.lineTo(x + s * 0.6, y + s * 0.6);
    ctx.moveTo(x + s * 0.6, y - s * 0.6); ctx.lineTo(x - s * 0.6, y + s * 0.6);
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.moveTo(x - s, y); ctx.lineTo(x + s, y);
    ctx.stroke();
  }
}

function shadeFor(country) {
  const seed = country.id.charCodeAt(1) * 31 + country.id.length * 7;
  const tones = ['#39443a', '#41463a', '#3a463f', '#464a3c', '#38453c', '#433f36'];
  return tones[seed % tones.length];
}

export function isOwnPoint(world, x, y) {
  return world && world.own ? pointInPolygon(x, y, world.own.poly) : false;
}
