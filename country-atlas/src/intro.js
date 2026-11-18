/* §87: начальная сцена. Вместо глухой заставки — пролёт над своей страной:
   подложка из чуть размытой карты мира (наша страна на ней видна), поверх — резкая
   карта страны, камера медленно идёт от города к городу. Пока идёт пролёт, движок
   занят загрузкой; когда готово — появляется кнопка «Начать игру».
   Модуль считает только камеру и слои: время и решения остаются в main2d. */
import { WorldView, WV } from './worldview.js';
import { MARK, pointInPolygon } from './worldmap2d.js';
import { drawMark } from './worldview.js';
import { hash01 } from './accidents2d.js';
import { fixedClock, engineRng } from './engine2d.js';
import { tourProgress, flightBank } from './startscene2d.js';

export const INTRO = {
  hopSec: 9.2,          // сколько камера идёт от точки к точке — пролёт видно, а не «пять секунд»
  scaleMin: 0.15,       // px на км: ближе всего к земле
  scaleMax: 0.25,       // px на км: дальше всего
  layerPx: 2200,        // сторона резкого слоя своей страны
  blurPx: 4,            // размытие подложки
  vignette: 0.55,       // насколько темнеют края
  fadeMs: 420,
  sightKm: 0.55,        // достопримечательности стоят в этом поясе от столицы (доля радиуса)
  sights: ['Старая крепость', 'Северный мост', 'Соляные шахты', 'Обсерватория на холме',
    'Старая мельница', 'Каменный круг', 'Портовый маяк', 'Курган предков'],
  sightsPerTour: 4,     // сколько достопримечательностей вплетается в маршрут
  caption: true,
  progress: true,       // полоска круга внизу кадра
  cacheCaption: true,   // ширина подписи меряется один раз на точку, а не 60 раз в секунду
  fadeInSec: 0.9,       // заставка проявляется из темноты, а не «включается»
  bankMax: 0.035,       // крен камеры на повороте маршрута, радианы
  narrowW: 560          // уже этой ширины подпись кадра короче, чтобы не лезть на полоску
};

/* F-305: достопримечательности страны. Места детерминированы сидом: те же холмы,
   тот же мост и та же крепость при каждом запуске. */
export function tourSights(own, seed = 424242) {
  const out = [];
  const names = INTRO.sights.slice();
  const n = Math.min(INTRO.sightsPerTour, names.length);
  const start = Math.floor(hash01(seed + 4711, 181) * names.length) % names.length;
  // §103: своя страна стоит на своём берегу, а не в центре мира: достопримечательности
  // отсчитываются от столицы, иначе пролёт уводил камеру в чужое море
  const cx = own.capital ? own.capital.x : 0;
  const cy = own.capital ? own.capital.y : 0;
  for (let i = 0; i < n; i++) {
    const a = hash01(seed + i * 53, 183) * Math.PI * 2;
    let r = own.radiusKm * INTRO.sightKm * (0.55 + hash01(seed + i * 71, 187) * 0.55);
    let x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r;
    // место должно быть в своей стране: если вылетели за границу — подходим ближе к столице
    for (let k = 0; k < 8 && !pointInPolygon(x, y, own.poly); k++) {
      r *= 0.6; x = cx + Math.cos(a) * r; y = cy + Math.sin(a) * r;
    }
    if (!pointInPolygon(x, y, own.poly)) { x = cx; y = cy; }
    out.push({ x, y, name: names[(start + i) % names.length], sight: true });
  }
  return out;
}

/* F-305: маршрут пролёта — города по кругу и достопримечательности между ними;
   ровный обход без рывков, чтобы страну можно было рассмотреть. */
export function tourWaypoints(own, seed = 424242) {
  // §103: обход городов — кругом вокруг столицы, а не вокруг центра мира
  const cx = own.capital ? own.capital.x : 0;
  const cy = own.capital ? own.capital.y : 0;
  const cities = own.cities.slice()
    .sort((a, b) => Math.atan2(a.y - cy, a.x - cx) - Math.atan2(b.y - cy, b.x - cx))
    .map((c) => ({ x: c.x, y: c.y, name: c.name, sight: false }));
  const sights = tourSights(own, seed);
  const out = [];
  const step = Math.max(1, Math.round(cities.length / (sights.length + 1)));
  let si = 0;
  cities.forEach((c, i) => {
    out.push(c);
    if (si < sights.length && (i + 1) % step === 0) out.push(sights[si++]);
  });
  while (si < sights.length) out.push(sights[si++]);
  return out;
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
    scale: scaleMin + (scaleMax - scaleMin) * (0.5 + 0.5 * Math.sin(safeT * 0.6)),
    i: i % points.length,
    name: b.name
  };
}

export function insideOwn(own, x, y) {
  return pointInPolygon(x, y, own.poly);
}

/* F-347: рисуем из большого слоя только видимый прямоугольник.
   Кадр остаётся прежним (тот же слой, те же CSS-координаты), но браузер не
   пересэмплирует весь буфер: на телефоне это 19 → 2 мс на кадр. */
export function drawLayerCrop(ctx, img, cam, view, sizeKm, bank = 0) {
  if (!img || !img.width) return;
  const k = cam.scale;                        // CSS-пикселей на километр
  const side = sizeKm * k;                    // сколько CSS-пикселей занимает весь слой
  if (!(side > 0)) return;
  const kp = img.width / side;                // пикселей слоя на CSS-пиксель
  // при крене кадр поворачивается — берём кусок с запасом, чтобы углы не пустели
  const pad = Math.ceil(Math.max(view.w, view.h) * Math.abs(bank)) + 2;
  const lx = view.w / 2 - (cam.x + sizeKm / 2) * k;
  const ly = view.h / 2 - (cam.y + sizeKm / 2) * k;
  let dx = -pad, dy = -pad, dw = view.w + pad * 2, dh = view.h + pad * 2;
  let sx = (dx - lx) * kp, sy = (dy - ly) * kp, sw = dw * kp, sh = dh * kp;
  // обрезаем источник по буферу и на столько же подрезаем приёмник
  if (sx < 0) { const cut = -sx; dx += cut / kp; dw -= cut / kp; sw -= cut; sx = 0; }
  if (sy < 0) { const cut = -sy; dy += cut / kp; dh -= cut / kp; sh -= cut; sy = 0; }
  const maxX = img.width - sx, maxY = img.height - sy;
  if (sw > maxX) { const over = sw - maxX; dw -= over / kp; sw = maxX; }
  if (sh > maxY) { const over = sh - maxY; dh -= over / kp; sh = maxY; }
  if (sw <= 0 || sh <= 0 || dw <= 0 || dh <= 0) return;
  ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
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
    this.fade = 0;           // 0 — темнота, 1 — кадр проявился
    this.bank = 0;           // крен камеры на вираже
    this.dir = null;
    this.prevCam = null;
    // F-336: время анимации идёт фиксированным шагом движка, а не «как получится»
    this.clock = fixedClock({ tickHz: 60 });
    // F-337: украшения пролёта берут случайность у движка — от сида мира, чтобы кадр повторялся
    this.rng = engineRng(world.seed || 1);
    this.captionW = new Map();   // F-345: ширина подписи по её тексту
    this.raf = 0;
    this.lastDrawAt = 0;
    this.running = false;
    this.ready = false;
    this.points = tourWaypoints(world.own, world.seed);
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
    // F-348: размытие подложки запекаем один раз. Раньше `filter = blur(4px)` стоял
    // в каждом кадре — на телефоне это 10 мс из 27 на ровном месте.
    this.bg = this.blurOnce(wv.base, this.bgBlurPx());
    return this.bg;
  }

  /* F-348: радиус размытия в пикселях буфера — из того, как подложка ляжет в кадр,
     чтобы после масштабирования получились те же 4 px, что и раньше. */
  bgBlurPx() {
    const baseScale = Math.max(this.view.w, this.view.h) / this.world.sizeKm * 1.18;
    const drawn = this.world.sizeKm * baseScale / Math.max(1, this.bg ? this.bg.width : INTRO.bgPx);
    return Math.max(0.5, INTRO.blurPx / Math.max(0.05, drawn));
  }

  blurOnce(src, px) {
    const size = Math.ceil(src.width) || 1;
    const cv = this.opts.createCanvas ? this.opts.createCanvas(size, size) : document.createElement('canvas');
    cv.width = size; cv.height = size;
    const ctx = cv.getContext('2d');
    if (!ctx) return src;
    if (ctx.filter !== undefined) {
      ctx.filter = 'blur(' + px.toFixed(2) + 'px)';
      ctx.drawImage(src, 0, 0);
      ctx.filter = 'none';
      return cv;
    }
    ctx.drawImage(src, 0, 0);
    return cv;
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
    // достопримечательности: ромбик и имя — их и видно в пролёте
    ctx.font = '14px sans-serif';
    for (const s of this.points) {
      if (!s.sight) continue;
      const x = toPx(s.x), y = toPx(s.y);
      ctx.beginPath();
      ctx.moveTo(x, y - 6); ctx.lineTo(x + 6, y); ctx.lineTo(x, y + 6); ctx.lineTo(x - 6, y);
      ctx.closePath();
      ctx.fillStyle = 'rgba(255,214,110,0.95)';
      ctx.fill();
      ctx.fillStyle = 'rgba(255,236,178,0.92)';
      ctx.fillText(s.name, x + 10, y + 5);
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
      const raw = (now - (this.last || now)) / 1000;
      this.last = now;
      // F-336: шаг не бывает отрицательным — иначе пролёт откатывался бы назад
      // (так бывает после сворачивания вкладки: браузер начинает отсчёт заново)
      const step = Number.isFinite(raw) && raw > 0 ? Math.min(0.1, raw) : 0.016;
      this.clock.advance(step, (fixed) => { this.t += fixed; });
      this.fade = Math.min(1, this.fade + step / INTRO.fadeInSec);
      // F-350: слабое устройство не должно «зависать» — рисуем реже, время идёт так же
      if (typeof document !== 'undefined' && document.hidden) return;
      if (now < this.lastDrawAt) this.lastDrawAt = now;      // часы браузера начались заново
      const budget = this.lastDrawMs > 12 ? 33 : 16;
      if (now - this.lastDrawAt < budget - 3) return;
      this.lastDrawAt = now;
      // пролёт — украшение: если канва не умеет чего-то, игра всё равно должна открыться
      try { this.draw(); } catch (err) { this.stop(); }
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
    // F-344: на повороте маршрута камера закладывает вираж — кадр перестаёт быть рывком
    if (this.prevCam) {
      const dx = cam.x - this.prevCam.x, dy = cam.y - this.prevCam.y;
      if (Math.hypot(dx, dy) > 2) {
        const dir = { a: Math.atan2(dy, dx) };
        if (this.dir) this.bank = this.bank * 0.9 + flightBank(this.dir, dir, INTRO.bankMax) * 0.1;
        this.dir = dir;
      }
    }
    this.prevCam = { x: cam.x, y: cam.y };
    ctx.save();
    // 1. подложка: вся карта мира, размытая, чуть притушенная
    ctx.fillStyle = '#08131c';
    ctx.fillRect(0, 0, view.w, view.h);
    const span = world.sizeKm;
    const baseScale = Math.max(view.w, view.h) / span * 1.18;
    const bx = view.w / 2 - (cam.x * 0.4) * baseScale / 8;
    const by = view.h / 2 - (cam.y * 0.4) * baseScale / 8;
    ctx.globalAlpha = 0.5;
    ctx.drawImage(this.bg, bx - span * baseScale / 2, by - span * baseScale / 2, span * baseScale, span * baseScale);
    ctx.globalAlpha = 1;

    // 2. резкая страна: камера идёт от города к городу
    if (this.layer) {
      ctx.save();
      if (this.bank) {
        ctx.translate(view.w / 2, view.h / 2);
        ctx.rotate(this.bank);
        ctx.translate(-view.w / 2, -view.h / 2);
      }
      // F-347: из слоя страны берём только видимый кусок — иначе каждый кадр
      // браузер пересэмплирует все 2200² пикселя, даже если видно 10 % кадра
      drawLayerCrop(ctx, this.layer, cam, view, world.sizeKm, this.bank);
      ctx.restore();
      // F-349: подложка краёв — статичная размытая картинка на весь кадр: кладём её
      // 1:1 в пикселях холста. Раньше она каждый кадр проходила через поворот и
      // масштаб — 15 из 27 мс кадра на телефоне.
      if (this.edge) {
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.drawImage(this.edge, 0, 0);
        ctx.restore();
      }
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

    // F-344: заставка проявляется из темноты — начало пролёта видно, а не «уже поздно»
    if (this.fade < 1) {
      ctx.fillStyle = 'rgba(6,14,20,' + (1 - this.fade).toFixed(3) + ')';
      ctx.fillRect(0, 0, view.w, view.h);
    }

    // F-306: подпись точки пролёта — видно, над чем именно летит камера
    if (INTRO.caption !== false && this.points.length) {
      // F-343: подпись называет точку, к которой летим, — ту же, что видит камера
      const n = this.points.length;
      const i = (cam.i + 1) % n;
      const pt = this.points[i] || { name: '' };
      if (this.shownPoint !== pt.name && typeof this.opts.onPoint === 'function') {
        this.shownPoint = pt.name;
        try { this.opts.onPoint(pt, i + 1, n); } catch (err) { /* подпись — украшение */ }
      }
      // F-343: на узком экране подпись короче — иначе она наезжает на полоску круга
      const tail = (i + 1) + ' из ' + n + ' · ' + pt.name;
      const text = view.w < INTRO.narrowW ? tail : 'пролёт над страной · ' + tail;
      ctx.font = '12px sans-serif';
      // F-345: подпись меняется раз в 9.2 с, а кадров 60 в секунду — мерим один раз
      let tw = INTRO.cacheCaption === false ? undefined : this.captionW.get(text);
      if (tw === undefined) {
        tw = ctx.measureText ? ctx.measureText(text).width : text.length * 6;
        this.captionW.set(text, tw);
      }
      ctx.fillStyle = 'rgba(6,14,20,0.62)';
      ctx.fillRect(12, view.h - 36, tw + 18, 23);
      ctx.fillStyle = 'rgba(226,234,240,0.92)';
      ctx.fillText(text, 21, view.h - 20);
    }

    // F-343: полоска круга — видно, что пролёт длинный и он идёт
    if (INTRO.progress !== false) {
      const pw = Math.max(90, Math.min(220, view.w * 0.32));
      const px0 = view.w - pw - 14, py0 = view.h - 18;
      const done = tourProgress(this.t, INTRO.hopSec, this.points.length);
      ctx.fillStyle = 'rgba(6,14,20,0.62)';
      ctx.fillRect(px0, py0, pw, 3.5);
      ctx.fillStyle = 'rgba(255,214,110,0.88)';
      ctx.fillRect(px0, py0, Math.max(2, pw * done), 3.5);
    }
    ctx.restore();
    this.frames++;
    this.lastDrawMs = (typeof performance !== 'undefined' ? performance.now() : Date.now()) - t0;
    return this;
  }
}

export { MARK, WV };
