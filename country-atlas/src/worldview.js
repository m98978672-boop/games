/* §86: отрисовка карты мира (R-86.5…R-86.8).
   Движок здесь не «рисует всё каждый кадр»: сначала считается базовый слой — океан, страны,
   отметки рельефа — в отдельную канву один раз; дальше каждый кадр только блит готовой
   картинки и живой слой поверх (дороги, города, армии, взрывы, разрушения, оккупация).
   Загрузка идёт в два прохода прямо во время анимации перехода: сначала страны и границы,
   потом отметки. Пока не готово — карта честно показывает то, что уже есть. */
import { MARK, countryAt, canSeeArmies, visibleArmiesFor, pointInPolygon } from './worldmap2d.js';
import { BIOMES, BIOME_ORDER, biomeAt, passabilityAt } from './biome2d.js';
import { MAP_TONES } from './palette.js';
import { regionAt as regionOf } from './regions2d.js';
import { countryAt as countryAtWorld } from './worldmap2d.js';

export const WV = {
  baseSize: 1400,          // сторона базового слоя, px
  minScale: 0.004,         // px на км: дальше уже некуда
  maxScale: 0.9,
  overviewScale: 0.045,    // «вся планета» в кадре 900 px
  transitionMs: 1500,      // §89: переход на карту мира длиннее — видно, как камера улетает
  loadPasses: 2,
  markPx: 3.2,
  cityPx: 2.4,
  labelScale: 0.16,
  overviewPad: 26,           // поля обзора, px
  fitPad: 18,                // поля вписывания континента по берегу, px
  // F-368: подписи стран видны и на обзоре, и на телефоне (масштаб там ~0.015).
  // Раньше порог 0.085 держал подписи только при приближении — карта была немой.
  countryLabelScale: 0.008,
  armyScale: 0.1,
  gridKm: 2000,              // шаг сетки меридианов и параллелей
  // F-357 + §101: палитра карты мира — та же, что у карты страны (MAP_TONES):
  // море, песок, луг, лес, камень. Раньше планета была почти чёрной, светлой была
  // только карта страны — получались два разных мира.
  ocean: [MAP_TONES.seaDeep, MAP_TONES.seaMid, MAP_TONES.seaShelf],
  land: MAP_TONES.land,
  landOwn: MAP_TONES.own,
  tones: ['#6e8557', '#7d7a53', '#5f7a58', '#87794f', '#67805f', '#7d7450', '#708049', '#637652'],
  capitalLabelScale: 0.05,   // с этого масштаба подписываем столицы
  // §101: дороги на карте мира — только при очень большом зуме. Владелец: «почему дороги
  // такие большие, если на карте мира я их должен видеть только при очень большом зуме».
  // До 0,12 px/км дорог нет вовсе: на обзоре это были жёлтые толстые линии поверх стран.
  roadScale: 0.12,
  localRoadScale: 0.25,
  ruinScale: 0.05,
  // §100: отметки рельефа — тоже подробность: на обзоре планеты это серая пыль
  // поверх покрова, поэтому они появляются вместе с мелкими дорогами
  markScale: 0.05
};

/* F-301: масштаб, при котором в кадр влезает континент.
   span — диаметр обитаемой части мира (по побережью), а не сторона квадрата карты. */
export function overviewScale(view, padPx = WV.overviewPad, spanKm = 21400) {
  const w = Math.max(1, view.w), h = Math.max(1, view.h);
  return Math.min(w - padPx * 2, h - padPx * 2) / spanKm;
}

/* F-359: масштаб «континент целиком» — по берегу, а не по стороне квадрата карты.
   Раньше берег был кругом 11 600 км и вписывался в кадр; с изрезанным берегом
   нужен настоящий прямоугольник суши, иначе подписи у края срезаются. */
export function landBox(world) {
  const coast = world && world.coast;
  if (!coast || !coast.length) return null;
  let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
  for (const [x, y] of coast) {
    if (x < x0) x0 = x; if (x > x1) x1 = x;
    if (y < y0) y0 = y; if (y > y1) y1 = y;
  }
  return { x: (x0 + x1) / 2, y: (y0 + y1) / 2, w: Math.max(1, x1 - x0), h: Math.max(1, y1 - y0) };
}

/* F-391: камера смотрит на свою страну. В К30 камера встала в середину рамки суши,
   и карта «уехала»: наша страна оказалась слева от центра, хотя не должна была
   двигаться. Теперь центр кадра — своя столица, а масштаб вписывает континент
   в кадр с полем: кадр остаётся честным, страна — в середине. */
export function ownOverview(world, view, padPx = WV.fitPad) {
  const center = world && world.own && world.own.capital ? world.own.capital : { x: 0, y: 0 };
  if (!world) return { x: center.x, y: center.y, scale: overviewScale(view) };
  // §95: обзор мира — вся планета, а не один материк. Владелец спрашивал
  // «почему на карте мира 1 материк»: теперь в кадр влезают все материки и острова.
  // §95: на телефоне планета целиком — это мелкая горошина в середине кадра.
  // Там обзор по своему материку: страны и подписи читаются, а планета — по кнопке «мир».
  if (view.w < 560) return ownLandOverview(world, view, padPx);
  const box = planetBox(world);
  if (!box) return { x: center.x, y: center.y, scale: overviewScale(view) };
  // камера стоит на своей столице (иначе страна «уезжает»), а масштаб вписывает
  // в кадр всю планету — все материки и острова вокруг неё
  const halfW = Math.max(Math.abs(box.x - center.x) + box.w / 2, Math.abs(box.x - center.x) + box.w / 2);
  const w = Math.max(1, view.w) - padPx * 2, h = Math.max(1, view.h) - padPx * 2;
  const spanX = Math.max(1, 2 * (Math.abs(box.x - center.x) + box.w / 2));
  const spanY = Math.max(1, 2 * (Math.abs(box.y - center.y) + box.h / 2));
  return { x: center.x, y: center.y, scale: Math.min(w / spanX, h / spanY) };
}

/* §95: рамка всей планеты — материки и острова. По ней считается обзор мира. */
export function planetBox(world) {
  if (!world) return null;
  const lands = world.lands && world.lands.length ? world.lands : (world.coast ? [{ poly: world.coast }] : []);
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  const add = (poly) => {
    for (const [x, y] of poly) {
      if (x < x0) x0 = x;
      if (x > x1) x1 = x;
      if (y < y0) y0 = y;
      if (y > y1) y1 = y;
    }
  };
  for (const land of lands) add(land.poly);
  for (const isl of world.islands || []) add(isl.poly);
  if (!Number.isFinite(x0)) return null;
  return { x: (x0 + x1) / 2, y: (y0 + y1) / 2, w: Math.max(1, x1 - x0), h: Math.max(1, y1 - y0) };
}

/* §95: масштаб, при котором в кадр влезает наш материк целиком — для кнопки «своя страна». */
export function ownLandOverview(world, view, padPx = WV.fitPad) {
  const center = world && world.own && world.own.capital ? world.own.capital : { x: 0, y: 0 };
  const coast = world && world.coast;
  if (!coast || !coast.length) return { x: center.x, y: center.y, scale: overviewScale(view) };
  let mx = 0, my = 0;
  for (const [x, y] of coast) {
    mx = Math.max(mx, Math.abs(x - center.x));
    my = Math.max(my, Math.abs(y - center.y));
  }
  const w = Math.max(1, view.w) - padPx * 2, h = Math.max(1, view.h) - padPx * 2;
  return { x: center.x, y: center.y, scale: Math.min(w / (2 * Math.max(1, mx)), h / (2 * Math.max(1, my))) };
}

export function fitLandScale(world, view, padPx = WV.fitPad) {
  const box = landBox(world);
  if (!box) return overviewScale(view);
  return Math.min((Math.max(1, view.w) - padPx * 2) / box.w, (Math.max(1, view.h) - padPx * 2) / box.h);
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

/* F-358: масштабная линейка. Круглое число километров, которое влезает в ~140 px. */
/* §96: политический окрас карты. Владелец просил «подсветку врагов и союзников»:
   союзники и друзья подкрашиваются зелёным, враги и те, с кем идёт война, — красным,
   захваченные области получают штриховку цвета захватчика. Считается по отношениям,
   которые живут вместе с войной, поэтому слой рисуется каждый кадр, а не в базовый. */
const POLITICS = {
  ally: 'rgba(120,214,150,0.13)',
  allyLine: 'rgba(120,214,150,0.5)',
  enemy: 'rgba(226,86,64,0.13)',
  enemyLine: 'rgba(226,86,64,0.55)',
  taken: 'rgba(255,196,96,0.85)'
};

/* §96: штриховка захваченных областей — готовый узор, а не две сотни линий на кадр.
   Узор собирается один раз на цвет и дальше только заливается в полигон. */
const hatchCache = new Map();
function hatchPattern(ctx, color) {
  const key = color;
  if (hatchCache.has(key)) return hatchCache.get(key);
  const size = 8;
  const cv = (typeof document !== 'undefined' && document.createElement)
    ? document.createElement('canvas')
    : null;
  if (!cv) return null;
  cv.width = size;
  cv.height = size;
  const c2 = cv.getContext('2d');
  c2.strokeStyle = color;
  c2.lineWidth = 1;
  c2.beginPath();
  c2.moveTo(-2, size + 2);
  c2.lineTo(size + 2, -2);
  c2.moveTo(size - 2, size + 2);
  c2.lineTo(size + 2, size - 2);
  c2.stroke();
  const pat = ctx.createPattern ? ctx.createPattern(cv, 'repeat') : null;
  hatchCache.set(key, pat);
  return pat;
}

/* §96: политический окрас рисуется каждый кадр, поэтому здесь важна дешевизна:
   страны проверяются по рамке, штриховка берётся из готового узора. */


/* §99: отметки рельефа и значки болот и гор рисуются в кадре, а не в базовом слое.
   Размер значка — в пикселях экрана, поэтому на зуме он не превращается в дерево
   в пол-экрана, а остаётся значком. Значки копятся по видам в общие пути:
   720 отметок — это двенадцать вызовов рисования, а не две тысячи. */
const MARK_TYPES = ['forest', 'swamp', 'mountain', 'steppe', 'desert', 'tundra'];

export function paintMarksScreen(ctx, view, cam, world, toPx) {
  if (!world) return 0;
  const halfW = view.w / (2 * cam.scale) + 200, halfH = view.h / (2 * cam.scale) + 200;
  const inside = (x, y) => Math.abs(x - cam.x) <= halfW && Math.abs(y - cam.y) <= halfH;
  const px = cam.scale > 0.25 ? 2.4 : (cam.scale > 0.06 ? 2.1 : 1.9);
  const byKind = new Map();
  const push = (kind, sx, sy) => {
    if (!byKind.has(kind)) byKind.set(kind, []);
    byKind.get(kind).push(sx, sy);
  };
  const marks = world.marks || [];
  // §99: на обзоре планеты значков много, а различить их нельзя — берём каждый второй,
  // иначе отметки читаются «пылью», а путь из 2 000 треугольников стоит 1,7 мс
  const step = cam.scale < 0.05 ? 12 : 3;
  for (let i = 0; i < marks.length; i += step) {
    if (!inside(marks[i], marks[i + 1])) continue;
    const kind = MARK_TYPES[marks[i + 2]] || 'forest';
    const s = toPx(marks[i], marks[i + 1]);
    push(kind, s.x, s.y);
  }
  // значки покрова: болото «≡», горы «∧», тундра точками
  const g = world.biomes;
  if (g && cam.scale > 0.02) {
    const cellKm = g.sizeKm / g.size;
    if (cellKm * cam.scale > 7) {
      const half = g.sizeKm / 2;
      for (let j = 0; j < g.size; j++) {
        for (let i = 0; i < g.size; i++) {
          const c = g.code[j * g.size + i];
          if (c !== 2 && c !== 3 && c !== 6) continue;
          const x = -half + (i + 0.5) * cellKm, y = -half + (j + 0.5) * cellKm;
          if (!inside(x, y)) continue;
          const s = toPx(x, y);
          push(c === 2 ? 'swamp' : (c === 3 ? 'mountain' : 'tundra'), s.x, s.y);
        }
      }
    }
  }
  let drawn = 0;
  const k = px / WV.markPx;
  ctx.save();
  ctx.lineWidth = 1;
  for (const [kind, pts] of byKind) {
    const tone = MARK[kind] ? MARK[kind].tone : '#4a5a46';
    const size = WV.markPx * k;
    if (kind === 'forest') {
      ctx.beginPath();
      for (let i = 0; i < pts.length; i += 2) {
        const x = pts[i], y = pts[i + 1];
        for (let j = -1; j <= 1; j++) {
          ctx.moveTo(x + j * size - size * 0.5, y + size * 0.6);
          ctx.lineTo(x + j * size, y - size * 0.8);
          ctx.lineTo(x + j * size + size * 0.5, y + size * 0.6);
          ctx.closePath();
        }
      }
      ctx.fillStyle = tone;
      ctx.fill();
    } else if (kind === 'mountain') {
      ctx.beginPath();
      for (let i = 0; i < pts.length; i += 2) {
        const x = pts[i], y = pts[i + 1];
        ctx.moveTo(x - size, y + size * 0.6);
        ctx.lineTo(x, y - size);
        ctx.lineTo(x + size, y + size * 0.6);
      }
      ctx.strokeStyle = tone;
      ctx.stroke();
    } else if (kind === 'swamp') {
      ctx.beginPath();
      for (let i = 0; i < pts.length; i += 2) {
        const x = pts[i], y = pts[i + 1];
        for (let j = -1; j <= 1; j++) {
          ctx.moveTo(x - size, y + j * size * 0.7);
          ctx.lineTo(x + size, y + j * size * 0.7);
        }
      }
      ctx.strokeStyle = tone;
      ctx.stroke();
    } else {
      // степь, пустыня, тундра — короткие штрихи
      ctx.beginPath();
      for (let i = 0; i < pts.length; i += 2) {
        const x = pts[i], y = pts[i + 1];
        ctx.moveTo(x - size * 0.6, y);
        ctx.lineTo(x + size * 0.6, y);
      }
      ctx.strokeStyle = tone;
      ctx.stroke();
    }
    drawn += pts.length / 2;
  }
  ctx.restore();
  return drawn;
}

/* §99: покров на глубоком зуме. В базовом слое клетки растягиваются в мутные квадраты,
   поэтому при приближении видимые клетки перерисовываются в кадре — резко и по размеру. */
export function paintBiomeScreen(ctx, view, cam, world, toPx) {
  const g = world && world.biomes;
  if (!g) return 0;
  const cellKm = g.sizeKm / g.size;
  if (cellKm * cam.scale < 6) return 0;                 // мелко — хватает базового слоя
  const half = g.sizeKm / 2;
  const halfW = view.w / (2 * cam.scale) + cellKm, halfH = view.h / (2 * cam.scale) + cellKm;
  const i0 = Math.max(0, Math.floor((cam.x - halfW + half) / cellKm));
  const i1 = Math.min(g.size - 1, Math.ceil((cam.x + halfW + half) / cellKm));
  const j0 = Math.max(0, Math.floor((cam.y - halfH + half) / cellKm));
  const j1 = Math.min(g.size - 1, Math.ceil((cam.y + halfH + half) / cellKm));
  const byKind = new Map();
  for (let j = j0; j <= j1; j++) {
    for (let i = i0; i <= i1; i++) {
      const c = g.code[j * g.size + i];
      if (!c) continue;
      const kind = BIOME_ORDER[c - 1];
      if (!byKind.has(kind)) byKind.set(kind, []);
      byKind.get(kind).push(i, j);
    }
  }
  let drawn = 0;
  for (const [kind, cells] of byKind) {
    const tint = BIOMES.kinds[kind] && BIOMES.kinds[kind].tint;
    if (!tint) continue;
    ctx.beginPath();
    for (let k = 0; k < cells.length; k += 2) {
      const x = -half + cells[k] * cellKm, y = -half + cells[k + 1] * cellKm;
      const a = toPx(x, y), b = toPx(x + cellKm, y + cellKm);
      ctx.rect(a.x, a.y, b.x - a.x, b.y - a.y);
      drawn++;
    }
    ctx.fillStyle = tint;
    ctx.fill();
  }
  return drawn;
}


/* §99: границы стран — в кадре. Своя страна светлая и толще, остальные тёмные:
   по карте видно, где кончается страна, а где начинается область. */
export function drawCountryBorders(ctx, view, cam, world, toPx) {
  if (!world || !world.countries) return 0;
  const halfW = view.w / (2 * cam.scale) + 600, halfH = view.h / (2 * cam.scale) + 600;
  const near = (poly) => {
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const [x, y] of poly) {
      if (x < x0) x0 = x; if (x > x1) x1 = x;
      if (y < y0) y0 = y; if (y > y1) y1 = y;
    }
    return !(x0 > cam.x + halfW || x1 < cam.x - halfW || y0 > cam.y + halfH || y1 < cam.y - halfH);
  };
  const w = cam.scale > 0.1 ? 2 : 1.4;
  let drawn = 0;
  for (const pass of [0, 1]) {
    ctx.beginPath();
    for (const c of world.countries) {
      if ((c.own ? 1 : 0) !== pass) continue;
      if (!near(c.poly)) continue;
      for (let i = 0; i < c.poly.length; i++) {
        const s = toPx(c.poly[i][0], c.poly[i][1]);
        if (i) ctx.lineTo(s.x, s.y); else ctx.moveTo(s.x, s.y);
      }
      ctx.closePath();
      drawn++;
    }
    ctx.strokeStyle = pass ? 'rgba(250,252,244,0.9)' : 'rgba(10,16,20,0.55)';
    ctx.lineWidth = pass ? w + 0.8 : w;
    ctx.stroke();
  }
  return drawn;
}

/* §99: границы областей — в кадре, тонким пунктиром. Своя страна светлее и чуть толще;
   на любом масштабе линия остаётся линией, а не «колючей проволокой». */
export function drawRegionBorders(ctx, view, cam, world, toPx) {
  const regions = (world && world.regions) || [];
  if (!regions.length) return 0;
  const halfW = view.w / (2 * cam.scale) + 400, halfH = view.h / (2 * cam.scale) + 400;
  const visible = regions.filter((r) => {
    if (!r.box) return true;
    return !(r.box[0] > cam.x + halfW || r.box[2] < cam.x - halfW
      || r.box[1] > cam.y + halfH || r.box[3] < cam.y - halfH);
  });
  if (!visible.length) return 0;
  const trace = (list) => {
    ctx.beginPath();
    for (const r of list) {
      const pts = r.poly;
      if (!pts || pts.length < 3) continue;
      for (let i = 0; i < pts.length; i++) {
        const s = toPx(pts[i][0], pts[i][1]);
        if (i) ctx.lineTo(s.x, s.y); else ctx.moveTo(s.x, s.y);
      }
      ctx.closePath();
    }
  };
  const own = visible.filter((r) => r.country === 'own');
  // §100: слой теперь по тумблеру, и когда игрок его включил, он ждёт все области,
  // а не только свои. Раньше чужие границы прятались на обзоре ради кадра — при
  // выключенном по умолчанию слое экономить нечего
  const other = visible.filter((r) => r.country !== 'own');
  const w = cam.scale > 0.1 ? 1.4 : 1;
  if (other.length) {
    trace(other);
    ctx.setLineDash([]);
    ctx.strokeStyle = 'rgba(8,12,16,0.28)';
    ctx.lineWidth = w + 1.2;
    ctx.stroke();
    ctx.setLineDash([5, 5]);
    ctx.strokeStyle = 'rgba(238,242,226,0.34)';
    ctx.lineWidth = w;
    ctx.stroke();
  }
  if (own.length) {
    trace(own);
    ctx.setLineDash([]);
    ctx.strokeStyle = 'rgba(8,12,16,0.42)';
    ctx.lineWidth = w + 1.6;
    ctx.stroke();
    ctx.setLineDash([6, 4]);
    ctx.strokeStyle = 'rgba(255,252,236,0.82)';
    ctx.lineWidth = w + 0.2;
    ctx.stroke();
  }
  ctx.setLineDash([]);
  return visible.length;
}

/* §99: клетки покрова одним общим путём на вид. 13 000 клеток — это 13 000 вызовов
   fillRect, если рисовать по клетке; общий путь на вид — шесть заливок. */
export function paintBiomeCells(ctx, biomes, toPx) {
  if (!biomes || !biomes.code) return;
  const n = biomes.size;
  const cellPx = (biomes.sizeKm / n) ;
  const byKind = new Map();
  for (let j = 0; j < n; j++) {
    const row = j * n;
    for (let i = 0; i < n; i++) {
      const c = biomes.code[row + i];
      if (!c) continue;
      const kind = BIOME_ORDER[c - 1];
      if (!byKind.has(kind)) byKind.set(kind, []);
      byKind.get(kind).push(i, j);
    }
  }
  const half = biomes.sizeKm / 2;
  for (const [kind, cells] of byKind) {
    const tint = BIOMES.kinds[kind] && BIOMES.kinds[kind].tint;
    if (!tint) continue;
    ctx.beginPath();
    for (let k = 0; k < cells.length; k += 2) {
      const i = cells[k], j = cells[k + 1];
      const x = -half + i * cellPx, y = -half + j * cellPx;
      const a = toPx(x), b = toPx(y);
      const a2 = toPx(x + cellPx), b2 = toPx(y + cellPx);
      // клетки чуть перекрываются: швов между пятнами не видно
      ctx.rect(a - 0.5, b - 0.5, a2 - a + 1, b2 - b + 1);
    }
    ctx.fillStyle = tint;
    ctx.fill();
  }
}

/* §99: слой «где технике тяжело» — болота и горы штрихуются, лес и тундра помечаются
   точками. Включается кнопкой: в обычном виде карта остаётся чистой. */
export function drawTerrainBad(ctx, view, cam, world, toPx) {
  if (!world || !world.biomes) return { bad: 0, slow: 0 };
  const n = world.biomes.size;
  const cellPx = world.biomes.sizeKm / n;
  const half = world.biomes.sizeKm / 2;
  const halfW = view.w / (2 * cam.scale), halfH = view.h / (2 * cam.scale);
  const badCells = [], slowCells = [];
  for (let j = 0; j < n; j++) {
    const y = -half + (j + 0.5) * cellPx;
    if (y < cam.y - halfH - cellPx || y > cam.y + halfH + cellPx) continue;
    for (let i = 0; i < n; i++) {
      const c = world.biomes.code[j * n + i];
      if (!c) continue;
      const x = -half + (i + 0.5) * cellPx;
      if (x < cam.x - halfW - cellPx || x > cam.x + halfW + cellPx) continue;
      const pass = BIOMES.kinds[BIOME_ORDER[c - 1]].pass;
      if (pass < BIOMES.bad) badCells.push(i, j);
      else if (pass < BIOMES.slow) slowCells.push(i, j);
    }
  }
  const paint = (cells, fill, stroke) => {
    if (!cells.length) return;
    ctx.beginPath();
    for (let k = 0; k < cells.length; k += 2) {
      const x = -half + cells[k] * cellPx, y = -half + cells[k + 1] * cellPx;
      // toPx в кадре — это p(x, y), две координаты; одним аргументом вышел бы NaN
      const a = toPx(x, y), b = toPx(x + cellPx, y + cellPx);
      ctx.rect(a.x, a.y, b.x - a.x, b.y - a.y);
    }
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 0.6; ctx.stroke(); }
  };
  paint(slowCells, 'rgba(232,196,96,0.10)', null);
  paint(badCells, 'rgba(214,72,48,0.22)', 'rgba(222,96,64,0.45)');
  return { bad: badCells.length / 2, slow: slowCells.length / 2 };
}

export function drawPolitics(ctx, view, cam, world, toScreen) {
  if (!world || !world.countries) return { allies: 0, enemies: 0, taken: 0 };
  const own = world.own;
  if (!own) return { allies: 0, enemies: 0, taken: 0 };
  const rel = world.relations;
  const wars = world.wars || [];
  const atWar = new Set();
  for (const war of wars) {
    if (war.to !== null) continue;
    if (war.a === 'own') atWar.add(war.b);
    if (war.b === 'own') atWar.add(war.a);
  }
  const level = (id) => {
    if (!rel || !rel.get) return 0;
    const k = 'own' < id ? 'own|' + id : id + '|own';
    const rec = rel.get(k);
    return rec ? rec.score : 0;
  };
  let allies = 0, enemies = 0;
  const p = toScreen;
  const halfW = view.w / (2 * cam.scale), halfH = view.h / (2 * cam.scale);
  const vis = (poly) => {
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const [x, y] of poly) {
      if (x < x0) x0 = x; if (x > x1) x1 = x;
      if (y < y0) y0 = y; if (y > y1) y1 = y;
    }
    return !(x0 > cam.x + halfW || x1 < cam.x - halfW || y0 > cam.y + halfH || y1 < cam.y - halfH);
  };
  ctx.save();
  // §97: оптимизация кадра — полигоны союзников и врагов копятся в два общих пути,
  // а не рисуются по стране. Было до 18 пар fill/stroke за кадр, стало 2 + 2.
  const allyPath = [], foePath = [];
  for (const c of world.countries) {
    if (c.own) continue;
    if (!vis(c.poly)) continue;
    const score = level(c.id);
    const war = atWar.has(c.id);
    const friend = !war && score >= 20;
    const foe = war || score <= -20;
    if (!friend && !foe) continue;
    if (friend) allies++; else enemies++;
    (friend ? allyPath : foePath).push(c.poly);
  }
  const traceAll = (polys) => {
    ctx.beginPath();
    for (const pts of polys) {
      for (let i = 0; i < pts.length; i++) {
        const s = p(pts[i][0], pts[i][1]);
        if (i) ctx.lineTo(s.x, s.y); else ctx.moveTo(s.x, s.y);
      }
      ctx.closePath();
    }
  };
  if (allyPath.length) {
    traceAll(allyPath);
    ctx.fillStyle = POLITICS.ally;
    ctx.fill();
    ctx.strokeStyle = POLITICS.allyLine;
    ctx.lineWidth = 1;
    ctx.stroke();
  }
  if (foePath.length) {
    traceAll(foePath);
    ctx.fillStyle = POLITICS.enemy;
    ctx.fill();
    ctx.strokeStyle = POLITICS.enemyLine;
    ctx.lineWidth = 1.4;
    ctx.stroke();
  }
  // захваченные области: штриховка цвета того, кто их держит
  let taken = 0;
  const regions = world.regions || [];
  const ownTaken = [], foeTaken = [];
  for (const r of regions) {
    if (r.owner === r.original) continue;
    if (!vis(r.poly)) continue;
    taken++;
    (r.owner === 'own' ? ownTaken : foeTaken).push(r.poly);
  }
  for (const [polys, fill, hatch] of [
    [ownTaken, 'rgba(255,206,110,0.16)', 'rgba(255,214,120,0.42)'],
    [foeTaken, 'rgba(226,86,64,0.16)', 'rgba(236,110,84,0.42)']
  ]) {
    if (!polys.length) continue;
    traceAll(polys);
    ctx.fillStyle = fill;
    ctx.fill();
    const pat = hatchPattern(ctx, hatch);
    if (pat) { ctx.fillStyle = pat; ctx.fill(); }
  }
  // границы областей внутри своей страны: один общий путь вместо пути на область
  const ownPolys = [];
  for (const r of regions) {
    if (r.owner !== 'own') continue;
    if (!vis(r.poly)) continue;
    ownPolys.push(r.poly);
  }
  if (ownPolys.length) {
    traceAll(ownPolys);
    ctx.strokeStyle = 'rgba(242,246,232,0.16)';
    ctx.lineWidth = 0.8;
    ctx.stroke();
  }
  // §96: на крупном масштабе у областей есть названия — видно, чем страна живёт
  if (cam.scale > 0.05) {
    ctx.font = '9px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(250,244,224,0.72)';
    for (const r of regions) {
      if (r.owner !== 'own') continue;
      if (!vis(r.poly)) continue;
      const c0 = p(r.capital.x, r.capital.y);
      if (c0.x < 20 || c0.y < 20 || c0.x > view.w - 20 || c0.y > view.h - 20) continue;
      ctx.fillText(r.name, c0.x, c0.y + 12);
    }
    ctx.textAlign = 'left';
  }
  ctx.restore();
  return { allies, enemies, taken };
}

/* F-401: градусная сетка с числами. Мир — равнопромежуточная карта: 40 000 км по
   долготе и 180° по широте, поэтому одна и та же сетка читается числами градусов.
   Сетка живёт в мире: линии и подписи едут вместе с картой. */
/* §95: лежит ли мировая точка на суше (для подписей сетки). */
function onLand(world, x, y) {
  const lands = world.lands || [];
  for (const land of lands) if (pointInPolygon(x, y, land.poly)) return true;
  return !lands.length && pointInPolygon(x, y, world.coast || []);
}

/* F-399: куда ставить слой подробностей. Он нарисован для камеры detailCam,
   и его нужно поставить так, чтобы мир под ним не съезжал. */
export function detailOffset(view, cam, detailCam, pad) {
  const dk = detailCam && detailCam.scale > 0 ? cam.scale / detailCam.scale : 1;
  const base = detailCam || cam;
  return {
    k: dk,
    x: view.w / 2 + (base.x - cam.x) * cam.scale - (view.w / 2 + pad) * dk,
    y: view.h / 2 + (base.y - cam.y) * cam.scale - (view.h / 2 + pad) * dk
  };
}

export function drawGraticule(ctx, view, cam, world, opts = {}) {
  if (!world || !world.sizeKm) return { lines: 0 };
  const size = world.sizeKm;
  const narrow = view.w < 560;
  const stepDeg = opts.stepDeg || (narrow ? 30 : 15);
  const labelEvery = opts.labelEvery || 3;      // подписываем каждую третью линию = 45°
  const halfKm = size / 2;
  const k = cam.scale;
  const sx = (x) => view.w / 2 + (x - cam.x) * k;
  const sy = (y) => view.h / 2 + (y - cam.y) * k;
  const lonToX = (lon) => (lon / 360) * size;
  const latToY = (lat) => -(lat / 180) * size;
  // сетка не выходит за лист карты: за краем мира её нет
  const x0 = Math.max(0, sx(-halfKm)), x1 = Math.min(view.w, sx(halfKm));
  const y0 = Math.max(0, sy(-halfKm)), y1 = Math.min(view.h, sy(halfKm));
  let lines = 0;
  ctx.save();
  ctx.lineWidth = 1;
  ctx.font = '600 9px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  // параллели
  for (let lat = -90 + stepDeg; lat <= 90 - stepDeg; lat += stepDeg) {
    const y = sy(latToY(lat));
    if (y < -1 || y > view.h + 1) continue;
    lines++;
    const zero = lat === 0;
    if (x1 <= x0) continue;
    ctx.strokeStyle = zero ? 'rgba(120,74,20,0.32)' : 'rgba(12,52,70,0.14)';
    ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke();
    if ((Math.round(lat / stepDeg) % labelEvery) !== 0) continue;
    const text = zero ? 'экватор' : Math.abs(lat) + '° ' + (lat > 0 ? 'с. ш.' : 'ю. ш.');
    // подпись стоит на самой линии в мировых координатах — при движении карты едет с ней
    const lons = zero ? [-150] : (narrow ? [40] : [-140, 40]);
    for (const lon of lons) {
      const x = sx(lonToX(lon));
      if (x < 46 || x > view.w - 46) continue;
      // на суше подписи не ставим: там уже есть названия стран
      if (onLand(world, lonToX(lon), latToY(lat))) continue;
      ctx.fillStyle = 'rgba(12,48,66,0.62)';
      ctx.fillText(text, x, y - 8);
    }
  }
  // меридианы
  for (let lon = -180 + stepDeg; lon < 180; lon += stepDeg) {
    const x = sx(lonToX(lon));
    if (x < -1 || x > view.w + 1) continue;
    lines++;
    const zero = lon === 0;
    if (y1 <= y0) continue;
    ctx.strokeStyle = zero ? 'rgba(255,214,140,0.26)' : 'rgba(160,208,230,0.13)';
    ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x, y1); ctx.stroke();
    if ((Math.round(lon / stepDeg) % labelEvery) !== 0 && !zero) continue;
    const text = zero ? '0° меридиан' : Math.abs(lon) + '° ' + (lon > 0 ? 'в. д.' : 'з. д.');
    for (let lat = 60; lat >= -60; lat -= 60) {
      const y = sy(latToY(lat));
      if (y < 22 || y > view.h - 22) continue;
      if (onLand(world, lonToX(lon), latToY(lat))) continue;
      ctx.fillStyle = 'rgba(12,48,66,0.62)';
      ctx.fillText(text, x, y);
      break;
    }
  }
  ctx.restore();
  return { lines };
}

/* F-402: компас. Маленькая роза со стрелкой на север в правом верхнем углу:
   без неё непонятно, где у карты верх. */
export function drawCompass(ctx, view, opts = {}) {
  const r = opts.r || 20;
  const x = opts.x != null ? opts.x : view.w - r - 14;
  const y = opts.y != null ? opts.y : r + 22;
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(6,14,20,0.55)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(200,222,232,0.35)';
  ctx.lineWidth = 1;
  ctx.stroke();
  // стрелка: половина к северу — светлая, половина к югу — тёмная
  ctx.beginPath();
  ctx.moveTo(x, y - r * 0.72);
  ctx.lineTo(x - r * 0.32, y + r * 0.3);
  ctx.lineTo(x, y + r * 0.06);
  ctx.closePath();
  ctx.fillStyle = 'rgba(240,246,240,0.92)';
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x, y - r * 0.72);
  ctx.lineTo(x + r * 0.32, y + r * 0.3);
  ctx.lineTo(x, y + r * 0.06);
  ctx.closePath();
  ctx.fillStyle = 'rgba(150,178,196,0.7)';
  ctx.fill();
  ctx.font = '700 9px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = 'rgba(240,246,240,0.95)';
  ctx.fillText('С', x, y - r - 7);
  ctx.fillStyle = 'rgba(170,196,210,0.75)';
  ctx.fillText('Ю', x, y + r + 7);
  ctx.fillText('З', x - r - 7, y);
  ctx.fillText('В', x + r + 7, y);
  ctx.restore();
  return { x, y, r };
}

export function drawScaleBar(ctx, view, cam, opts = {}) {
  const steps = [100, 250, 500, 1000, 2000, 4000, 8000, 16000];
  const target = Math.max(80, Math.min(170, view.w * 0.2));
  const kmPerPx = 1 / cam.scale;
  let km = steps[0];
  for (const step of steps) if (step / kmPerPx <= target) km = step;
  const barPx = km / kmPerPx;
  const x = opts.x != null ? opts.x : 18;
  const y = opts.y != null ? opts.y : view.h - 26;
  ctx.save();
  ctx.fillStyle = 'rgba(6,14,20,0.55)';
  ctx.fillRect(x - 7, y - 17, barPx + 14, 27);
  ctx.strokeStyle = 'rgba(232,240,232,0.9)';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(x, y - 6); ctx.lineTo(x, y); ctx.lineTo(x + barPx, y); ctx.lineTo(x + barPx, y - 6);
  ctx.moveTo(x + barPx / 2, y); ctx.lineTo(x + barPx / 2, y - 3);
  ctx.stroke();
  ctx.fillStyle = 'rgba(240,246,238,0.95)';
  ctx.font = '11px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(km.toLocaleString('ru-RU') + ' км', x, y - 9);
  // сколько пикселей на километр — число, по которому видно масштаб
  ctx.fillStyle = 'rgba(178,196,204,0.9)';
  ctx.fillText(cam.scale.toFixed(3) + ' px/км', x + barPx + 12, y - 1);
  ctx.restore();
  return { km, barPx };
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
    this.showTerrain = false;   // §99: слой «где технике тяжело» по кнопке
    // §100: границы областей — по тумблеру и по умолчанию выключены: на общей карте
    // они давали паутину пунктира поверх стран, и было непонятно, что нарисовано
    this.showRegions = false;
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
    // F-391: в кадре — своя страна в середине и весь континент вокруг неё
    const to = ownOverview(this.world, this.view);
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

  /* Один проход базового слоя. Пасс 0: море, суша, страны и берег.
     Пасс 1: отметки рельефа и границы — как на бумажной карте. */
  paintBasePass(pass) {
    if (!this.world) return;
    const size = WV.baseSize;
    const c = this.ensureBase();
    const ctx = this.baseCtx;
    const k = size / this.world.sizeKm;
    const toPx = (x) => (x + this.world.sizeKm / 2) * k;
    const coast = this.world.coast || [];
    const coastPath = () => {
      ctx.beginPath();
      coast.forEach(([x, y], i) => (i ? ctx.lineTo(toPx(x), toPx(y)) : ctx.moveTo(toPx(x), toPx(y))));
      ctx.closePath();
    };
    const polyPath = (pts) => {
      ctx.beginPath();
      pts.forEach(([x, y], i) => (i ? ctx.lineTo(toPx(x), toPx(y)) : ctx.moveTo(toPx(x), toPx(y))));
      ctx.closePath();
    };
    const islands = this.world.islands || [];
    const caps = this.world.caps || [];
    if (pass === 0) {
      // F-357: море — глубина растёт к краю: у берега светлее, в океане темнее
      const half0 = this.world.sizeKm / 2;
      const g = ctx.createRadialGradient(size / 2, size / 2, size * 0.16, size / 2, size / 2, size * 0.66);
      g.addColorStop(0, WV.ocean[2]);
      g.addColorStop(0.5, WV.ocean[1]);
      g.addColorStop(1, WV.ocean[0]);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, size, size);
      // F-403: глубины океана. Раньше море было ровным градиентом, и карта читалась
      // как пустой фон. Теперь у океана есть котловины и поднятия — пятна света и тени.
      const hs = (a) => {
        const v = Math.sin(a * 12.9898 + 78.233) * 43758.5453;
        return v - Math.floor(v);
      };
      for (let i = 0; i < 9; i++) {
        const bx = -half0 + hs(i * 1.7) * size, by = -half0 + hs(i * 2.3 + 0.5) * size;
        const br = size * (0.10 + hs(i * 3.1) * 0.16);
        const deep = hs(i * 4.7) > 0.5;
        const g2 = ctx.createRadialGradient(bx, by, 0, bx, by, br);
        g2.addColorStop(0, deep ? 'rgba(2,10,16,0.35)' : 'rgba(36,96,120,0.14)');
        g2.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g2;
        ctx.fillRect(bx - br, by - br, br * 2, br * 2);
      }
      // сетка: меридианы и параллели через 2000 км, экватор чуть светлее
      const step = WV.gridKm * k;
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(150,200,220,0.07)';
      for (let x = 0; x <= size + 0.5; x += step) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, size); ctx.stroke();
      }
      for (let y = 0; y <= size + 0.5; y += step) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(size, y); ctx.stroke();
      }
      // F-374: полярные льды — по ним видно, что мир круглый, а карта не обрезана
      for (const cap of caps) {
        // край льда тает к воде: у кромки почти прозрачно, у полюса — плотный лёд
        const capYs = cap.poly.map((q) => q[1]);
        const capInner = cap.id === 'north' ? Math.max(...capYs) : Math.min(...capYs);
        const capOuter = cap.id === 'north' ? -this.world.sizeKm / 2 : this.world.sizeKm / 2;
        const ice = ctx.createLinearGradient(0, toPx(capInner), 0, toPx(capOuter));
        ice.addColorStop(0, 'rgba(206,228,236,0.10)');
        ice.addColorStop(0.45, 'rgba(214,232,238,0.55)');
        ice.addColorStop(1, 'rgba(238,248,252,0.95)');
        polyPath(cap.poly);
        ctx.fillStyle = ice;
        ctx.fill();
        // F-396: трещины на льду — без них полоса читалась как серая плашка интерфейса
        ctx.save();
        polyPath(cap.poly);
        ctx.clip();
        ctx.strokeStyle = 'rgba(146,186,210,0.85)';
        ctx.lineWidth = 1.3;
        const halfKm = this.world.sizeKm / 2;
        const hs = (a) => {
          const v = Math.sin(a * 12.9898 + 78.233) * 43758.5453;
          return v - Math.floor(v);
        };
        const ys = cap.poly.map((q) => q[1]);
        const innerY = cap.id === 'north' ? Math.max(...ys) : Math.min(...ys);
        const dir = cap.id === 'north' ? -1 : 1;
        for (let i = 0; i < 40; i++) {
          const h = hs(this.world.seed * 0.001 + i * 1.37);
          const h2 = hs(this.world.seed * 0.001 + i * 2.11);
          const x1 = -halfKm + (i / 40) * this.world.sizeKm + h * 760;
          const y1 = innerY + dir * (60 + h2 * 1500);
          ctx.beginPath();
          ctx.moveTo(toPx(x1), toPx(y1));
          ctx.lineTo(toPx(x1 + 300 + h2 * 620), toPx(y1 + dir * (80 + h * 260)));
          ctx.stroke();
        }
        ctx.restore();
        polyPath(cap.poly);
        ctx.strokeStyle = 'rgba(246,252,255,0.9)';
        ctx.lineWidth = 1.6;
        ctx.stroke();
      }
      // F-373: острова — земля, отмель и берег, как у континента, но без стран
      for (const isl of islands) {
        ctx.save();
        ctx.translate(size * 0.004, size * 0.006);
        polyPath(isl.poly);
        ctx.fillStyle = 'rgba(3,9,13,0.5)';
        ctx.fill();
        ctx.restore();
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, 0, size, size);
        isl.poly.forEach(([x, y], i) => (i ? ctx.lineTo(toPx(x), toPx(y)) : ctx.moveTo(toPx(x), toPx(y))));
        ctx.closePath();
        ctx.clip('evenodd');
        for (const [w, a] of [[22, 0.06], [12, 0.09], [5, 0.14]]) {
          polyPath(isl.poly);
          ctx.strokeStyle = 'rgba(126,196,220,' + a + ')';
          ctx.lineWidth = w;
          ctx.stroke();
        }
        ctx.restore();
        polyPath(isl.poly);
        ctx.fillStyle = WV.land;
        ctx.fill();
        polyPath(isl.poly);
        ctx.strokeStyle = 'rgba(232,240,224,0.5)';
        ctx.lineWidth = 1.1;
        ctx.stroke();
      }
      // §95: суша — это несколько материков. У каждого свои тень, отмель, климат и берег:
      // раньше мир был одним континентом, и карта читалась как «блин».
      const lands = this.world.lands && this.world.lands.length
        ? this.world.lands
        : (coast.length ? [{ id: 'l0', poly: coast, rKm: 7000, x: 0, y: 0 }] : []);
      const landPathAll = () => {
        ctx.beginPath();
        for (const land of lands) {
          land.poly.forEach(([x, y], i) => (i ? ctx.lineTo(toPx(x), toPx(y)) : ctx.moveTo(toPx(x), toPx(y))));
          ctx.closePath();
        }
      };
      for (const land of lands) {
        const lp = () => polyPath(land.poly);
        // тень под материком — суша читается как суша, а не как пятно
        ctx.save();
        ctx.translate(size * 0.004, size * 0.006);
        lp();
        ctx.fillStyle = 'rgba(3,9,13,0.55)';
        ctx.fill();
        ctx.restore();
        // отмель: три кольца вокруг берега, снаружи суши
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, 0, size, size);
        land.poly.forEach(([x, y], i) => (i ? ctx.lineTo(toPx(x), toPx(y)) : ctx.moveTo(toPx(x), toPx(y))));
        ctx.closePath();
        ctx.clip('evenodd');
        for (const [w, a] of [[34, 0.06], [20, 0.09], [9, 0.14]]) {
          lp();
          ctx.strokeStyle = 'rgba(126,196,220,' + a + ')';
          ctx.lineWidth = w;
          ctx.stroke();
        }
        ctx.restore();
        // сама суша
        lp();
        ctx.fillStyle = WV.land;
        ctx.fill();
      }
      // страны: приглушённый политический тон поверх суши, своя — светлее.
      // F-363: тон и границы режем по берегу — даже если ячейка страны вышла
      // за контур континента, на воде не остаётся ни пятна, ни линии.
      if (lands.length) { ctx.save(); landPathAll(); ctx.clip(); }
      for (const ctry of this.world.countries) {
        ctx.beginPath();
        ctry.poly.forEach(([x, y], i) => (i ? ctx.lineTo(toPx(x), toPx(y)) : ctx.moveTo(toPx(x), toPx(y))));
        ctx.closePath();
        // §99: тон страны полупрозрачный — под ним виден покров земли, а не ровное пятно
        ctx.fillStyle = ctry.own ? 'rgba(158,172,112,0.30)' : hexToRgba(shadeFor(ctry), 0.16);
        ctx.fill();
      }
      if (lands.length) ctx.restore();
      // §99: покров земли — леса, болота, горы, степи, пустыни и тундра. Рисуется
      // клетками по одному общему пути на вид: видно, где лес и где технике тяжело.
      if (this.world.biomes) {
        if (lands.length) { ctx.save(); landPathAll(); ctx.clip(); }
        paintBiomeCells(ctx, this.world.biomes, toPx);
        if (lands.length) ctx.restore();
      }
      if (lands.length) {
        // F-366: климат по широте — у полюсов суша холоднее (тундра), у экватора
        // суше (степь и пустыня). Градиент один на всю планету, но суша перестаёт
        // быть одноцветным блином.
        ctx.save();
        landPathAll();
        ctx.clip();
        const half = this.world.sizeKm / 2;
        const clim = ctx.createLinearGradient(0, toPx(-half), 0, toPx(half));
        clim.addColorStop(0, 'rgba(126,148,152,0.16)');
        clim.addColorStop(0.22, 'rgba(120,136,120,0.05)');
        clim.addColorStop(0.5, 'rgba(198,176,116,0.08)');
        clim.addColorStop(0.78, 'rgba(120,136,120,0.05)');
        clim.addColorStop(1, 'rgba(126,148,152,0.16)');
        ctx.fillStyle = clim;
        ctx.fillRect(0, 0, size, size);
        // мягкая тень у самого берега: суша «встаёт» над водой
        for (const land of lands) {
          polyPath(land.poly);
          ctx.strokeStyle = 'rgba(8,16,20,0.22)';
          ctx.lineWidth = 16;
          ctx.stroke();
        }
        ctx.restore();
      }
      // берег: светлая линия и мягкая «пена» внутри
      for (const land of lands) {
        polyPath(land.poly);
        ctx.strokeStyle = 'rgba(232,240,224,0.55)';
        ctx.lineWidth = 1.4;
        ctx.stroke();
        polyPath(land.poly);
        ctx.strokeStyle = 'rgba(214,228,196,0.12)';
        ctx.lineWidth = 7;
        ctx.stroke();
      }
      return;
    }
    // пасс 1: §99 — здесь больше ничего не рисуется. Отметки рельефа, значки болот и гор,
    // границы областей и стран переехали в кадр: в базовом слое на глубоком зуме они
    // растягивались в мутные пятна и «колючую проволоку» вместо тонких линий.
  }

  draw() {
    const t0 = (typeof performance !== 'undefined' ? performance.now() : Date.now());
    const { ctx, view } = this;
    const world = this.world;
    ctx.save();
    ctx.globalAlpha = this.alpha;
    // F-367: за краем базового квадрата — тот же океан, а не чёрная полоса.
    // F-395: и тот же градиент глубины, иначе видно шов по краю базового слоя.
    const seaCam = this.cam;
    const seaSpan = world ? world.sizeKm * seaCam.scale : Math.max(view.w, view.h);
    const cx = view.w / 2 - seaCam.x * seaCam.scale;
    const cy = view.h / 2 - seaCam.y * seaCam.scale;
    // F-395: градиент глубины считается так же, как в базовом слое, иначе по краю
    // базового квадрата видно шов: тайл-оптимизация давала расхождение оттенка.
    const sea = ctx.createRadialGradient(cx, cy, seaSpan * 0.16, cx, cy, seaSpan * 0.66);
    sea.addColorStop(0, WV.ocean[2]);
    sea.addColorStop(0.5, WV.ocean[1]);
    sea.addColorStop(1, WV.ocean[0]);
    ctx.fillStyle = sea;
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
    // F-392: своя армия видна всегда, чужая — только спутнику
    const shownArmies = this.showArmies ? visibleArmiesFor(world, 'own') : [];

    // §99: на глубоком зуме покров перерисовывается резко, в кадре
    paintBiomeScreen(ctx, view, cam, world, p);
    // §99: отметки рельефа и значки болот и гор — в кадре, размером в пикселях экрана.
    // §100: на обзоре планеты их нет — покров и так виден цветом, а серые значки
    // читались как пыль; появляются вместе с мелкими дорогами при приближении
    if (cam.scale >= WV.markScale) paintMarksScreen(ctx, view, cam, world, p);

    // F-302: дороги, города и их подписи живут в отдельном слое с полями по краям.
    // Пока камера стоит (а смотрят карту мира именно так), слой просто копируется.
    if (this.needsDetail()) this.paintDetail();
    if (this.detail) {
      // F-399: слой подробностей нарисован для камеры detailCam. Раньше он всегда
      // клеился в угол экрана (-pad, -pad), поэтому дороги, города и подписи стояли
      // на месте, пока карта уезжала под ними, и «перескакивали» при перерисовке.
      // Теперь слой едет вместе с миром, а поля по краям гасят разницу до перерисовки.
      const off = detailOffset(view, cam, this.detailCam, this.detailPad);
      const dw = (this.detail.width / this.dpr) * off.k;
      const dh = (this.detail.height / this.dpr) * off.k;
      ctx.drawImage(this.detail, off.x, off.y, dw, dh);
    }

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

    // §99: границы стран и областей — в кадре, тонкими линиями поверх карты и дорог
    drawCountryBorders(ctx, view, cam, world, p);
    // §100: границы областей — по тумблеру «области», по умолчанию карта без них
    if (this.showRegions) drawRegionBorders(ctx, view, cam, world, p);

    // §99: режим «где технике тяжело» — готовый слой поверх карты, а не пересчёт клеток
    // на каждом кадре. Включается кнопкой, в обычном виде карта остаётся чистой.
    if (this.showTerrain) {
      const layer = this.ensureTerrainLayer();
      if (layer) {
        const span = world.sizeKm * cam.scale;
        const ox = view.w / 2 - (cam.x + world.sizeKm / 2) * cam.scale;
        const oy = view.h / 2 - (cam.y + world.sizeKm / 2) * cam.scale;
        ctx.drawImage(layer, ox, oy, span, span);
      }
    }

    // §96: политический окрас — кто союзник, кто враг, чьи области захвачены.
    // Рисуется каждый кадр поверх базового слоя: отношения живут вместе с войной,
    // а базовый слой статичен.
    drawPolitics(ctx, view, cam, world, p);

    // взрывы рисуются до армий: вспышка не закрывает метки и полоски боеготовности
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

    // армии — только если спутник видит
    if (shownArmies.length) {
      // метка армии растёт вместе с масштабом: на обзоре мира это искра, вблизи — флажок
      const size = Math.max(4, Math.min(10, 70 * cam.scale + 3));
      const wMark = size * 1.7, hMark = size;
      // F-331: у каждой видимой армии — полоска боеготовности; своя выделена цветом и длиной
      const barW = Math.max(12, Math.min(22, 130 * cam.scale + 8));
      const barH = Math.max(2, Math.min(3.4, 10 * cam.scale + 1.6));
      for (const a of shownArmies) {
        const s1 = p(a.x, a.y);
        if (s1.x < -20 || s1.y < -20 || s1.x > view.w + 20 || s1.y > view.h + 20) continue;
        ctx.fillStyle = 'rgba(6,12,17,0.55)';
        ctx.fillRect(s1.x - wMark / 2 - 1, s1.y - hMark / 2 - 1, wMark + 2, hMark + 2);
        ctx.fillStyle = a.country === 'own' ? 'rgba(120,200,255,0.98)' : 'rgba(255,170,90,0.95)';
        ctx.fillRect(s1.x - wMark / 2, s1.y - hMark / 2, wMark, hMark);
        // штрих посередине — армия не путается с городом
        ctx.fillStyle = 'rgba(6,12,17,0.8)';
        ctx.fillRect(s1.x - wMark / 4, s1.y - 0.6, wMark / 2, 1.2);
        // полоска: сколько армия ещё может — от технологий и от того, как долго идёт война
        const val = Number.isFinite(a.morale) ? a.morale : 0.7;
        const by = s1.y + hMark / 2 + 2;
        ctx.fillStyle = 'rgba(6,12,17,0.72)';
        ctx.fillRect(s1.x - barW / 2, by, barW, barH);
        ctx.fillStyle = a.country === 'own' ? 'rgba(146,236,178,0.96)' : 'rgba(255,198,120,0.9)';
        ctx.fillRect(s1.x - barW / 2, by, Math.max(1.2, barW * val), barH);
        if (a.country === 'own') {
          ctx.strokeStyle = 'rgba(146,236,178,0.55)';
          ctx.lineWidth = 0.8;
          ctx.strokeRect(s1.x - barW / 2 - 0.5, by - 0.5, barW + 1, barH + 1);
        }
      }
    }

    // F-400: подписи океана стоят на карте, а не на экране. Раньше «О К Е А Н» рисовался
    // в долях кадра, и при движении камеры слово ползло вместе с ней по воде, хотя
    // море под ним стояло. Теперь у океана есть точки в мире, и слово едет с картой.
    if (this.labels && view.w >= 380) {
      ctx.font = '600 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      // §101: море стало светлым, как на карте страны, — слово «ОКЕАН» тёмной краской
      ctx.fillStyle = 'rgba(12,48,66,0.62)';
      const spots = (world.oceans && world.oceans.length) ? world.oceans
        : [{ x: -12000, y: 14000 }, { x: 12000, y: -14000 }];
      for (const spot of spots) {
        const s4 = p(spot.x, spot.y);
        if (s4.x < 60 || s4.y < 60 || s4.x > view.w - 60 || s4.y > view.h - 60) continue;
        ctx.fillText(spot.name || 'О К Е А Н', s4.x, s4.y);
      }
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
    }

    // F-356: подписи стран. Раньше на обзоре карта была немой: подписи включались
    // только при приближении и висели в слое подробностей.
    if (this.labels && cam.scale >= WV.countryLabelScale) {
      const px = Math.max(9, Math.min(13, 9 + (cam.scale - WV.countryLabelScale) * 30));
      ctx.font = '600 ' + px.toFixed(1) + 'px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      // F-356: подписи не наезжают друг на друга — ставим по одной, своя страна первой
      const placed = [];
      const order = [world.own, ...world.countries.filter((c) => !c.own)];
      for (const ctry of order) {
        if (!ctry) continue;
        const s3 = p(ctry.capital.x, ctry.capital.y);
        if (s3.x < -60 || s3.y < -20 || s3.x > view.w + 60 || s3.y > view.h + 20) continue;
        const name = ctry.name.toUpperCase();
        const wide = ctx.measureText ? ctx.measureText(name).width : name.length * px * 0.6;
        const box = { x: s3.x - wide / 2, y: s3.y - px * 1.6 - px * 0.7, w: wide, h: px * 1.4 };
        // §95: подпись целиком в кадре — иначе на телефоне название страны
        // свисает за край и читается обрезанным
        if (box.x < 6 || box.x + box.w > view.w - 6) continue;
        if (placed.some((r) => Math.abs(r.y - box.y) < px * 2.4 && Math.abs(r.x + r.w / 2 - (box.x + box.w / 2)) < (r.w + box.w) / 2 + 14)) continue;
        placed.push(box);
        ctx.lineWidth = 3;
        ctx.strokeStyle = 'rgba(6,14,20,0.72)';
        ctx.strokeText(name, s3.x, box.y + box.h / 2);
        ctx.fillStyle = ctry.own ? 'rgba(248,252,240,0.98)' : 'rgba(226,236,222,0.85)';
        ctx.fillText(name, s3.x, box.y + box.h / 2);
      }
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
    }
    // своя страна: маленький крестик-столица, чтобы не терялась среди подписей
    const own = world.own;
    if (own && cam.scale < WV.labelScale * 2) {
      const s3 = p(0, 0);
      ctx.strokeStyle = 'rgba(240,244,246,0.75)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(s3.x - 5, s3.y); ctx.lineTo(s3.x + 5, s3.y);
      ctx.moveTo(s3.x, s3.y - 5); ctx.lineTo(s3.x, s3.y + 5);
      ctx.stroke();
    }

    // F-401: градусная сетка с числами — «60° с. ш.», «30° в. д.», экватор и нулевой
    // меридиан. Это и есть георазметка: линии и подписи живут в мире, поэтому едут
    // вместе с картой, а не с экраном.
    drawGraticule(ctx, view, cam, world);
    // F-402: компас — на любой карте видно, где север
    drawCompass(ctx, view);
    // F-358: линейка масштаба и числа мира — по ним видно, что это карта, а не картинка
    drawScaleBar(ctx, view, cam);
    drawMapLegend(ctx, view, { showRegions: this.showRegions, showRoads: cam.scale >= WV.roadScale });
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
    // подписи стран появляются, когда мир приблизили: на обзоре они бы слиплись
    const countryLabels = this.cam.scale >= WV.countryLabelScale;
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
    // F-364: дороги есть только на суше. Раньше редкая дорога между двумя
    // прибрежными городками шла по прямой через залив — линия уходила в море
    // и даже за кадр. Режем дороги по берегу.
    const coast = world.coast;
    let landClip = false;
    if (coast && coast.length) {
      ctx.save();
      ctx.beginPath();
      coast.forEach(([x, y], i) => (i ? ctx.lineTo(x * k + ox, y * k + oy) : ctx.moveTo(x * k + ox, y * k + oy)));
      ctx.closePath();
      ctx.clip();
      landClip = true;
    }
    // §97: оптимизация. Раньше каждая дорога рисовалась своим путём: 300+ stroke на слой.
    // Теперь дороги копятся в четыре общих пути (шоссе с осевой, местные, разрушенные)
    // и заливаются один раз каждый — столько же линий на экране, вчетверо меньше вызовов.
    const brokenRoads = world.destroyed.roads;
    const brokenSet = brokenRoads.length ? new Set(brokenRoads) : null;
    const roadPaths = { highway: [], local: [], broken: [] };
    for (const r of world.roads) {
      if (Math.max(r.x1, r.x2) < x0 || Math.min(r.x1, r.x2) > x1) continue;
      if (Math.max(r.y1, r.y2) < y0 || Math.min(r.y1, r.y2) > y1) continue;
      const broken = !!(brokenSet && brokenSet.has(r.id));
      const highway = r.kind === 'highway' || r.kind === 'international';
      roadPaths[broken ? 'broken' : highway ? 'highway' : 'local'].push(r);
    }
    const traceRoads = (list, dash) => {
      if (!list.length) return;
      ctx.beginPath();
      for (const r of list) {
        ctx.moveTo(r.x1 * k + ox, r.y1 * k + oy);
        ctx.lineTo(r.x2 * k + ox, r.y2 * k + oy);
      }
      ctx.setLineDash(dash);
      ctx.stroke();
    };
    // §101: дороги — только при очень большом зуме. На обзоре планеты шоссе были
    // толстыми жёлтыми линиями поверх стран: их видно, но карту они закрывают.
    // До WV.roadScale дорог нет совсем; местные — от WV.localRoadScale.
    const showRoads = cam.scale >= WV.roadScale;
    const showLocal = cam.scale >= WV.localRoadScale;
    // §99: дорога — это корпус и сердцевина, как на настоящих картах: тёмный контур
    // отделяет её от леса и болота, светлая середина показывает, что ехать можно.
    // §99: на глубоком зуме дорога толще — в масштабе она должна оставаться дорогой
    // §101: толщина растёт с масштабом плавно — на пороге дорога тонкая, на зуме толстая
    const zk = cam.scale >= 0.4 ? 1.9 : (cam.scale >= 0.25 ? 1.45 : 0.8);
    if (showLocal) {
      ctx.strokeStyle = 'rgba(24,30,26,0.55)';
      ctx.lineWidth = 2.6 * zk;
      traceRoads(roadPaths.local, []);
      ctx.strokeStyle = 'rgba(226,232,224,0.66)';
      ctx.lineWidth = 1.1 * zk;
      traceRoads(roadPaths.local, []);
    }
    if (showRoads) {
      ctx.strokeStyle = 'rgba(38,28,10,0.6)';
      ctx.lineWidth = 3.8 * zk;
      traceRoads(roadPaths.highway, []);
      // §96: шоссе между странами — тёплая линия с пунктирной осевой
      ctx.strokeStyle = 'rgba(255,214,110,0.95)';
      ctx.lineWidth = 2.2 * zk;
      traceRoads(roadPaths.highway, []);
      ctx.strokeStyle = 'rgba(214,64,48,0.62)';
      ctx.lineWidth = 1.2;
      traceRoads(roadPaths.broken, [3, 4]);
      if (roadPaths.highway.length && cam.scale >= 0.25) {
        ctx.strokeStyle = 'rgba(40,32,16,0.5)';
        ctx.lineWidth = 1;
        traceRoads(roadPaths.highway, [5, 5]);
      }
    }
    ctx.setLineDash([]);
    if (landClip) { ctx.restore(); landClip = false; }
    // разрушенные мосты: короткая перечёркнутая перемычка на середине дороги
    for (const id of world.destroyed.bridges) {
      const r = world.roads.find((k) => k.id === id);
      if (!r) continue;
      const mx = (r.x1 + r.x2) / 2 * k + ox, my = (r.y1 + r.y2) / 2 * k + oy;
      if (mx < -20 || my < -20 || mx > view.w + 20 + 2 * this.detailPad || my > view.h + 20 + 2 * this.detailPad) continue;
      ctx.strokeStyle = 'rgba(214,64,48,0.85)';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(mx - 4, my - 3); ctx.lineTo(mx + 4, my + 3);
      ctx.moveTo(mx + 4, my - 3); ctx.lineTo(mx - 4, my + 3);
      ctx.stroke();
    }
    // §97: города тоже копятся по группам — столицы, города, разрушенные. Раньше
    // на 216 городов приходилось 216 fill и столько же arc-путей; теперь три заливки.
    const showLabels = this.labels && cam.scale >= WV.labelScale;
    const deadCities = world.destroyed.cities;
    const deadSet = deadCities.length ? new Set(deadCities) : null;
    const caps = [], towns = [], ruins = [];
    for (const city of world.cities) {
      const sx = city.x * k + ox, sy = city.y * k + oy;
      if (sx < -24 || sy < -24 || sx > view.w + 24 || sy > view.h + 24) continue;
      const dead = !!(deadSet && deadSet.has(city.id));
      if (dead) ruins.push([sx, sy]);
      else if (city.capital) caps.push([sx, sy]);
      else towns.push([sx, sy]);
    }
    const dots = (list, rad, color) => {
      if (!list.length) return;
      ctx.beginPath();
      for (const [sx, sy] of list) { ctx.moveTo(sx + rad, sy); ctx.arc(sx, sy, rad, 0, Math.PI * 2); }
      ctx.fillStyle = color;
      ctx.fill();
    };
    dots(towns, 2, 'rgba(232,238,244,0.8)');
    dots(caps, 3, '#f4f6f8');
    dots(ruins, cam.scale >= WV.ruinScale ? 2 : 1.6, '#d64030');
    if (ruins.length && cam.scale >= WV.ruinScale) {
      ctx.strokeStyle = '#d64030';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      for (const [sx, sy] of ruins) {
        ctx.moveTo(sx - 4, sy - 4); ctx.lineTo(sx + 4, sy + 4);
        ctx.moveTo(sx + 4, sy - 4); ctx.lineTo(sx - 4, sy + 4);
      }
      ctx.stroke();
    }
    if (showLabels) {
      ctx.font = '11px sans-serif';
      ctx.fillStyle = 'rgba(240,244,246,0.9)';
      for (const city of world.cities) {
        if (!city.capital) continue;
        const sx = city.x * k + ox, sy = city.y * k + oy;
        if (sx < -24 || sy < -24 || sx > view.w + 24 || sy > view.h + 24) continue;
        if (deadSet && deadSet.has(city.id)) continue;
        ctx.fillText(city.name, sx + 6, sy + 4);
      }
    }
    // F-356: подписи стран живут в draw(), чтобы не дублироваться в слое подробностей
    void countryLabels;
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


  /* §99: слой «где технике тяжело» считается один раз и лежит готовой картинкой:
     болота и горы штрихуются, лес, тундра и пустыня помечаются тёплым. Каждый кадр
     его просто переносят на экран — 7 000 клеток заново рисовать не нужно. */
  ensureTerrainLayer() {
    if (this.terrainLayer) return this.terrainLayer;
    const world = this.world;
    if (!world || !world.biomes) return null;
    const size = WV.baseSize;
    const cv = (typeof document !== 'undefined' && document.createElement)
      ? document.createElement('canvas') : null;
    if (!cv) return null;
    cv.width = size; cv.height = size;
    const c2 = cv.getContext('2d');
    if (!c2) return null;
    const biomes = world.biomes;
    const n = biomes.size;
    const cellKm = biomes.sizeKm / n;
    const half = biomes.sizeKm / 2;
    const toPx = (v) => ((v + half) / world.sizeKm) * size;
    const paths = { bad: [], slow: [] };
    for (let j = 0; j < n; j++) {
      for (let i = 0; i < n; i++) {
        const c = biomes.code[j * n + i];
        if (!c) continue;
        const pass = BIOMES.kinds[BIOME_ORDER[c - 1]].pass;
        if (pass < BIOMES.bad) paths.bad.push(i, j);
        else if (pass < BIOMES.slow) paths.slow.push(i, j);
      }
    }
    const paint = (cells, fill, stroke) => {
      if (!cells.length) return;
      c2.beginPath();
      for (let k = 0; k < cells.length; k += 2) {
        const x = -half + cells[k] * cellKm, y = -half + cells[k + 1] * cellKm;
        c2.rect(toPx(x), toPx(y), toPx(x + cellKm) - toPx(x), toPx(y + cellKm) - toPx(y));
      }
      c2.fillStyle = fill;
      c2.fill();
      if (stroke) { c2.strokeStyle = stroke; c2.lineWidth = 0.6; c2.stroke(); }
    };
    paint(paths.slow, 'rgba(232,196,96,0.16)', null);
    paint(paths.bad, 'rgba(214,72,48,0.34)', 'rgba(226,108,72,0.5)');
    this.terrainLayer = cv;
    return cv;
  }

  /* §99: что под курсором — покров, проходимость, область и страна. Панель показывает
     это словами: «болото · технике тяжело · Лесная окраина, Ратград». */
  infoAtScreen(sx, sy) {
    if (!this.world) return null;
    const w = screenToWorld(this.cam, this.view, sx, sy);
    const b = this.world.biomes ? biomeAt(this.world.biomes, w.x, w.y) : null;
    const r = this.world.regions ? regionOf(this.world.regions, w.x, w.y) : null;
    const ctry = countryAtWorld(this.world, w.x, w.y);
    const pass = this.world.biomes ? passabilityAt(this.world.biomes, w.x, w.y) : 0;
    return {
      x: Math.round(w.x),
      y: Math.round(w.y),
      biome: b ? b.name : 'вода',
      biomeKind: b ? b.kind : 'water',
      pass: b ? b.pass : 0,
      hard: !!b && b.pass < BIOMES.bad,
      slow: !!b && b.pass >= BIOMES.bad && b.pass < BIOMES.slow,
      region: r ? r.name : null,
      country: ctry ? ctry.name : null
    };
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
/* F-394: обозначения прямо на карте. Владелец сказал «не понятные значки»:
   легенда лежала ниже в панели, и её не видели. Теперь шесть значков с подписями
   словами стоят в углу кадра, где не мешают ни панели, ни подписям стран. */
export function drawMapLegend(ctx, view, opts = {}) {
  // §96: в легенде появились союзники, враги и захваченные области — иначе
  // красные и зелёные пятна на карте читаются как «просто так покрасили»
  // §99: и покров земли — лес, болото, горы, пустыня, «технике тяжело», дороги
  // и граница области. Без этого зелёные и бурые пятна на карте — загадка.
  const all = [
    ['city', 'город'], ['capital', 'столица'], ['own', 'наша столица'],
    ['army', 'наша армия'], ['armybar', 'боеготовность'],
    ['road', 'дорога'], ['highway', 'шоссе'], ['region', 'граница области'],
    ['ally', 'союзник'], ['enemy', 'враг'], ['taken', 'захвачено'],
    ['forest', 'лес'], ['swamp', 'болото'], ['mountain', 'горы'],
    ['desert', 'пустыня, степь'], ['bad', 'технике тяжело'],
    ['battle', 'бой и взрыв'], ['ruin', 'разрушено']
  ];
  // §100: строку про границы областей показываем только когда тумблер «области» включён —
  // легенда не должна расшифровывать то, чего на карте нет
  const entries = opts.entries || all.filter((e) =>
    (e[0] !== 'region' || opts.showRegions !== false) &&
    ((e[0] !== 'road' && e[0] !== 'highway') || opts.showRoads !== false));
  const narrow = view.w < 560;
  // на телефоне места мало: оставляем то, без чего карта непонятна — своя страна,
  // лес, болото, дорога, союзники, враги и захваченные области
  const keep = ['own', 'forest', 'swamp', 'road', 'ally', 'enemy', 'taken'];
  const chosen = narrow ? keep.map((k) => entries.find((e) => e[0] === k)).filter(Boolean) : entries;
  // на широком экране легенда в две колонки — иначе она закрывает пол-карты
  const cols = narrow ? 1 : (chosen.length > 10 ? 2 : 1);
  const rowsPerCol = Math.ceil(chosen.length / cols);
  const rows = chosen;
  const rowH = narrow ? 13 : 14;
  const colW = narrow ? 132 : 168;
  const wBox = narrow ? colW : colW * cols;
  const hBox = rowsPerCol * rowH + 14;
  const x = narrow ? 10 : view.w - wBox - 12;
  const y = narrow ? 56 : view.h - hBox - 12;
  ctx.save();
  ctx.fillStyle = 'rgba(6,14,20,0.62)';
  ctx.fillRect(x, y, wBox, hBox);
  ctx.strokeStyle = 'rgba(150,196,214,0.25)';
  ctx.lineWidth = 1;
  ctx.strokeRect(x + 0.5, y + 0.5, wBox - 1, hBox - 1);
  ctx.font = '10px sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  rows.forEach(([kind, label], i) => {
    const col = Math.floor(i / rowsPerCol);
    const row = i % rowsPerCol;
    const cy = y + 7 + row * rowH + rowH / 2 - 3;
    const cx = x + 12 + col * colW;
    if (kind === 'city') {
      ctx.beginPath(); ctx.arc(cx, cy, 2.2, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(232,238,244,0.85)'; ctx.fill();
    } else if (kind === 'capital') {
      ctx.beginPath(); ctx.arc(cx, cy, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#f4f6f8'; ctx.fill();
      ctx.strokeStyle = 'rgba(6,14,20,0.7)'; ctx.lineWidth = 0.8; ctx.stroke();
    } else if (kind === 'own') {
      ctx.strokeStyle = 'rgba(248,252,240,0.95)'; ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(cx - 3.5, cy); ctx.lineTo(cx + 3.5, cy);
      ctx.moveTo(cx, cy - 3.5); ctx.lineTo(cx, cy + 3.5);
      ctx.stroke();
    } else if (kind === 'armybar') {
      // §96: полоска боеготовности — как у полка на карте
      ctx.fillStyle = 'rgba(6,12,17,0.72)';
      ctx.fillRect(cx - 5, cy - 2, 10, 4);
      ctx.fillStyle = 'rgba(146,236,178,0.95)';
      ctx.fillRect(cx - 5, cy - 2, 6.5, 4);
    } else if (kind === 'army') {
      ctx.fillStyle = 'rgba(6,12,17,0.6)';
      ctx.fillRect(cx - 4, cy - 3, 8, 6);
      ctx.fillStyle = 'rgba(120,200,255,0.98)';
      ctx.fillRect(cx - 3.4, cy - 2.4, 6.8, 4.8);
      ctx.fillStyle = 'rgba(146,236,178,0.95)';
      ctx.fillRect(cx - 3.4, cy + 3.4, 6.8, 1.8);
    } else if (kind === 'battle') {
      ctx.beginPath(); ctx.arc(cx, cy, 3.4, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,150,80,0.5)'; ctx.fill();
      ctx.beginPath(); ctx.arc(cx, cy, 1.6, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,190,120,0.95)'; ctx.fill();
    } else if (kind === 'road' || kind === 'highway') {
      // §99: дорога показана так же, как на карте — корпус и светлая середина
      ctx.strokeStyle = 'rgba(24,30,26,0.7)';
      ctx.lineWidth = kind === 'highway' ? 3.6 : 2.6;
      ctx.beginPath(); ctx.moveTo(cx - 7, cy); ctx.lineTo(cx + 7, cy); ctx.stroke();
      ctx.strokeStyle = kind === 'highway' ? 'rgba(255,214,110,0.95)' : 'rgba(226,232,224,0.7)';
      ctx.lineWidth = kind === 'highway' ? 2 : 1.1;
      ctx.beginPath(); ctx.moveTo(cx - 7, cy); ctx.lineTo(cx + 7, cy); ctx.stroke();
    } else if (kind === 'region') {
      // §99: граница области — светлая линия в тёмной обводке
      ctx.strokeStyle = 'rgba(8,12,16,0.5)'; ctx.lineWidth = 2.2;
      ctx.beginPath(); ctx.moveTo(cx - 7, cy); ctx.lineTo(cx + 7, cy); ctx.stroke();
      ctx.strokeStyle = 'rgba(255,252,236,0.85)'; ctx.lineWidth = 1.1;
      ctx.beginPath(); ctx.moveTo(cx - 7, cy); ctx.lineTo(cx + 7, cy); ctx.stroke();
    } else if (kind === 'forest' || kind === 'swamp' || kind === 'mountain' || kind === 'desert') {
      // §99: покров земли — тот же цвет, что и пятна на карте
      const key = kind === 'desert' ? 'desert' : kind;
      ctx.fillStyle = BIOMES.kinds[key].tint;
      ctx.fillRect(cx - 6, cy - 5, 12, 10);
      ctx.strokeStyle = 'rgba(8,12,16,0.35)'; ctx.lineWidth = 1;
      ctx.strokeRect(cx - 6, cy - 5, 12, 10);
      if (kind === 'swamp') {
        ctx.strokeStyle = 'rgba(226,240,236,0.7)'; ctx.lineWidth = 1;
        ctx.beginPath();
        for (let k = -1; k <= 1; k++) { ctx.moveTo(cx - 4, cy + k * 2.4); ctx.lineTo(cx + 4, cy + k * 2.4); }
        ctx.stroke();
      } else if (kind === 'mountain') {
        ctx.strokeStyle = 'rgba(240,240,232,0.8)'; ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cx - 4, cy + 3); ctx.lineTo(cx, cy - 3); ctx.lineTo(cx + 4, cy + 3);
        ctx.stroke();
      }
    } else if (kind === 'bad') {
      // §99: «технике тяжело» — красная штриховка
      ctx.fillStyle = 'rgba(214,72,48,0.28)';
      ctx.fillRect(cx - 6, cy - 5, 12, 10);
      ctx.strokeStyle = 'rgba(222,96,64,0.85)'; ctx.lineWidth = 1;
      ctx.strokeRect(cx - 6, cy - 5, 12, 10);
      ctx.beginPath();
      ctx.moveTo(cx - 5, cy + 4); ctx.lineTo(cx + 5, cy - 4);
      ctx.stroke();
    } else if (kind === 'ally') {
      ctx.fillStyle = POLITICS.ally;
      ctx.fillRect(cx - 5, cy - 4, 10, 8);
      ctx.strokeStyle = POLITICS.allyLine; ctx.lineWidth = 1;
      ctx.strokeRect(cx - 5, cy - 4, 10, 8);
    } else if (kind === 'enemy') {
      ctx.fillStyle = POLITICS.enemy;
      ctx.fillRect(cx - 5, cy - 4, 10, 8);
      ctx.strokeStyle = POLITICS.enemyLine; ctx.lineWidth = 1;
      ctx.strokeRect(cx - 5, cy - 4, 10, 8);
    } else if (kind === 'taken') {
      ctx.fillStyle = 'rgba(255,206,110,0.35)';
      ctx.fillRect(cx - 5, cy - 4, 10, 8);
      ctx.strokeStyle = 'rgba(255,206,110,0.8)'; ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx - 4, cy + 3); ctx.lineTo(cx + 3, cy - 4);
      ctx.stroke();
    } else if (kind === 'ruin') {
      ctx.strokeStyle = '#d64030'; ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(cx - 3, cy - 3); ctx.lineTo(cx + 3, cy + 3);
      ctx.moveTo(cx + 3, cy - 3); ctx.lineTo(cx - 3, cy + 3);
      ctx.stroke();
    }
    ctx.fillStyle = 'rgba(214,226,234,0.92)';
    ctx.fillText(label, cx + 13, cy);
  });
  ctx.textBaseline = 'alphabetic';
  ctx.restore();
  return { x, y, w: wBox, h: hBox, rows: rows.length };
}

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
  return WV.tones[seed % WV.tones.length];
}

/* '#616f4b' + прозрачность → 'rgba(97,111,75,a)' */
function hexToRgba(hex, alpha) {
  const h = String(hex).replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
  return 'rgba(' + ((n >> 16) & 255) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',' + alpha + ')';
}

export function isOwnPoint(world, x, y) {
  return world && world.own ? pointInPolygon(x, y, world.own.poly) : false;
}
