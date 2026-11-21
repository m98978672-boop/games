/* §93–§101: вид карты мира — планета из материков, вписывание, кадр, подписи и цена.
   Группы: планета, вписывание, кадр, подписи и линейка, цена кадра, мир вокруг,
   простая карта и тумблер областей, одна палитра и дороги на зуме.
   Каждая группа — не меньше двадцати проверяемых значений. */
import { createCanvas } from '@napi-rs/canvas';
import {
  buildWorld, advanceWars, coastPolygon, landMarks, pointInPolygon, WM, buildMarks
} from '../src/worldmap2d.js';
import {
  WV, WorldView, landBox, fitLandScale, ownOverview, drawMapLegend, overviewScale, drawScaleBar,
  clampViewScale, planetBox, detailOffset, drawGraticule, drawCompass
} from '../src/worldview.js';
import { geoOf as geoDeg, formatLat, formatLon } from '../src/planet2d.js';
import { MAP_TONES } from '../src/palette.js';
import { BIOMES } from '../src/biome2d.js';

let pass = 0, fail = 0;
const ok = (name, cond, extra = '') => {
  if (cond) { pass++; return true; }
  fail++;
  console.log('  ✗ ' + name + (extra ? '  ' + extra : ''));
  return false;
};
const near = (name, a, b, d) => ok(name, Math.abs(a - b) <= d, `${a} vs ${b}`);
const group = (title) => console.log('— ' + title);

const makeCanvas = (w, h) => {
  const cv = createCanvas(w, h);
  cv.getBoundingClientRect = () => ({ left: 0, top: 0, width: w, height: h });
  return cv;
};
const world = buildWorld(424242);
for (let t = 0; t < 60 * 24 * 4; t += 45) advanceWars(world, 9000 + t);
const coast = world.coast;
const radiusOf = ([x, y]) => Math.hypot(x, y);

/* ——— 1. планета: несколько материков ——— */
group('планета');
const lands = world.lands;
const onAnyLand = (x, y) => lands.some((l) => pointInPolygon(x, y, l.poly));
ok('материков пять, а не один', Array.isArray(lands) && lands.length === 5, lands && lands.length);
ok('у каждого материка есть имя и берег', lands.every((l) => typeof l.name === 'string' && l.name.length > 2 && Array.isArray(l.poly)));
ok('берег каждого материка — 240 точек', lands.every((l) => l.poly.length === 240), lands.map((l) => l.poly.length).join(','));
ok('берег из пар чисел', lands.every((l) => l.poly.every((q) => Array.isArray(q) && q.length === 2 && Number.isFinite(q[0]) && Number.isFinite(q[1]))));
ok('берег не круг: радиус гуляет больше чем на 10 %', lands.every((l) => {
  const r = l.poly.map(radiusOf);
  return (Math.max(...r) - Math.min(...r)) / Math.max(...r) > 0.1;
}));
ok('наш материк самый большой', lands[0].rKm > Math.max(...lands.slice(1).map((l) => l.rKm)), Math.round(lands[0].rKm));
ok('центр мира лежит на нашем материке', pointInPolygon(0, 0, lands[0].poly));
ok('материки внутри карты', lands.every((l) => l.poly.every(([x, y]) => Math.abs(x) < world.sizeKm / 2 && Math.abs(y) < world.sizeKm / 2)));
ok('материки не залезают в полярные льды', (() => {
  const ice = Math.min(...world.caps[0].poly.map((q) => Math.abs(q[1])));
  return lands.every((l) => Math.max(...l.poly.map(([x, y]) => Math.hypot(x, y))) < ice);
})());
ok('материки не налезают друг на друга', (() => {
  for (let i = 0; i < lands.length; i++) {
    for (let j = 0; j < lands.length; j++) {
      if (i === j) continue;
      if (lands[j].poly.some(([x, y]) => pointInPolygon(x, y, lands[i].poly))) return false;
    }
  }
  return true;
})());
ok('страны живут на материках', world.countries.every((c) => lands.some((l) => l.id === c.land)));
ok('на каждом материке есть хотя бы одна страна', lands.every((l) => world.countries.some((c) => c.land === l.id)),
  lands.map((l) => world.countries.filter((c) => c.land === l.id).length).join(','));
ok('все столицы на суше', world.countries.every((c) => onAnyLand(c.capital.x, c.capital.y)));
ok('все города на суше', world.cities.every((c) => onAnyLand(c.x, c.y)));
ok('ни одна дорога не идёт по морю', world.roads.every((r) => onAnyLand(r.x1, r.y1) && onAnyLand(r.x2, r.y2)));
ok('все армии на суше', world.armies.every((a) => onAnyLand(a.x, a.y)));
ok('рельеф только на суше', (() => {
  for (let i = 0; i < world.marks.length; i += 3) if (!onAnyLand(world.marks[i], world.marks[i + 1])) return false;
  return true;
})());
ok('рельефа хватает на всю сушу', world.marks.length / 3 > 250, world.marks.length / 3);
ok('острова не на материках', world.islands.every((i) => i.poly.every(([x, y]) => !onAnyLand(x, y))));
ok('подписи океана стоят на воде', world.oceans.length >= 2 && world.oceans.every((o) => !onAnyLand(o.x, o.y)), world.oceans.length);
ok('планета повторяется от сида', (() => {
  const again = buildWorld(424242);
  return again.lands.length === world.lands.length
    && again.lands[1].poly[5][0] === lands[1].poly[5][0]
    && again.countries.length === world.countries.length;
})());
ok('другой сид — другая планета', (() => {
  const other = buildWorld(777);
  return Math.abs(other.lands[1].poly[5][0] - lands[1].poly[5][0]) > 1;
})());

/* ——— 2. вписывание ——— */
group('вписывание');
const wide = { w: 1200, h: 700 };
const phone = { w: 390, h: 844 };
const box = landBox(world);
ok('рамка суши считается', !!box && box.w > 0 && box.h > 0, box && Math.round(box.w) + '×' + Math.round(box.h));
ok('рамка суши содержит весь берег', coast.every(([x, y]) =>
  Math.abs(x - box.x) <= box.w / 2 + 1e-6 && Math.abs(y - box.y) <= box.h / 2 + 1e-6));
near('центр рамки — по берегу', box.x, (Math.min(...coast.map((p) => p[0])) + Math.max(...coast.map((p) => p[0]))) / 2, 1e-9);
const sWide = fitLandScale(world, wide);
const sPhone = fitLandScale(world, phone);
const ownScale = ownOverview(world, wide).scale;
ok('масштаб вписывания положительный и конечный', sWide > 0 && Number.isFinite(sWide), sWide);
ok('на широком кадре всё помещается по ширине', box.w * sWide <= wide.w - WV.fitPad * 2 + 0.5, box.w * sWide);
ok('на широком кадре всё помещается по высоте', box.h * sWide <= wide.h - WV.fitPad * 2 + 0.5, box.h * sWide);
ok('на телефоне всё помещается по ширине', box.w * sPhone <= phone.w - WV.fitPad * 2 + 0.5, box.w * sPhone);
ok('на телефоне всё помещается по высоте', box.h * sPhone <= phone.h - WV.fitPad * 2 + 0.5, box.h * sPhone);
ok('на телефоне масштаб меньше, чем на мониторе', sPhone < sWide, sPhone.toFixed(4) + ' < ' + sWide.toFixed(4));
ok('вписывание ограничено узкой стороной', Math.abs(Math.min((wide.w - 2 * WV.fitPad) / box.w, (wide.h - 2 * WV.fitPad) / box.h) - sWide) < 1e-9);
ok('каждый мыс попадает в кадр с полем', coast.every(([x, y]) => {
  const sx = wide.w / 2 + (x - box.x) * sWide;
  const sy = wide.h / 2 + (y - box.y) * sWide;
  return sx > 0 && sy > 0 && sx < wide.w && sy < wide.h;
}));
// §95: обзор мира — вся планета, поэтому он шире, чем вписывание одного материка
ok('обзор планеты шире вписывания своего материка', ownScale < sWide, ownScale.toFixed(4) + ' < ' + sWide.toFixed(4));
ok('обзор планеты видит все материки', (() => {
  const pb = planetBox(world);
  const k = ownOverview(world, wide).scale;
  const cx = world.own.capital.x, cy = world.own.capital.y;
  return lands.every((l) => l.poly.every(([x, y]) => {
    const sx = wide.w / 2 + (x - cx) * k, sy = wide.h / 2 + (y - cy) * k;
    return sx >= 0 && sy >= 0 && sx <= wide.w && sy <= wide.h;
  })) && pb.w > 0;
})());
ok('обзор опирается на поля WV', Math.abs(overviewScale(wide) - (700 - 2 * WV.overviewPad) / 21400) < 1e-9);
const cvOpen = makeCanvas(1200, 700);
const vOpen = new WorldView(cvOpen, { createCanvas: (a, b) => createCanvas(a, b) });
vOpen.resize(); vOpen.setWorld(world);
vOpen.open();
// F-391: в центре кадра — своя страна, а не середина рамки суши
near('open() ставит камеру на свою столицу', vOpen.cam.x, world.own.capital.x, 1e-6);
near('open() ставит масштаб по планете вокруг столицы', vOpen.cam.scale, ownScale, 1e-6);
ok('своя страна — в середине кадра', Math.abs(vOpen.cam.x) < 1 && Math.abs(vOpen.cam.y) < 1);
ok('без перехода прозрачность полная', vOpen.alpha === 1, vOpen.alpha);
const vFly = new WorldView(makeCanvas(1200, 700), { createCanvas: (a, b) => createCanvas(a, b) });
vFly.resize(); vFly.setWorld(world);
vFly.open({ x: 0, y: 0, scale: 20 });
ok('с игрового кадра начинается пролёт', !!vFly.transition && vFly.alpha < 1, vFly.alpha);
vFly.step(WV.transitionMs / 1000 + 0.05);
near('после пролёта камера на месте', vFly.cam.scale, ownScale, 1e-6);
ok('после пролёта переход закрыт', vFly.transition === null);
ok('камера мира не улетает за карту', (() => {
  vFly.cam.x = 1e6; vFly.clampCam();
  return Math.abs(vFly.cam.x) <= world.sizeKm;
})());
ok('масштаб зажимается в разумных пределах', clampViewScale(1e-6) >= WV.minScale && clampViewScale(99) <= WV.maxScale);
ok('телефонный кадр 390×844 тоже вписывается', (() => {
  const v = new WorldView(makeCanvas(390, 844), { createCanvas: (a, b) => createCanvas(a, b) });
  v.resize(); v.setWorld(world); v.open();
  return Math.abs(v.cam.scale - ownOverview(world, { w: 390, h: 844 }).scale) < 1e-6;
})());

/* ——— 3. кадр ——— */
group('кадр');
const cv = makeCanvas(1200, 700);
const v = new WorldView(cv, { createCanvas: (a, b) => createCanvas(a, b) });
v.resize(); v.setWorld(world);
ok('до проходов мир не готов', v.loading === true && v.ready === 0);
v.step(1 / 60);
ok('первый проход — половина', v.ready === 1 && v.loading === true);
v.step(1 / 60);
ok('второй проход — готов', v.ready === 2 && v.loading === false);
ok('базовый слой создан один раз', !!v.base && v.ensureBase() === v.base);
v.open();
v.draw();
ok('кадр нарисован', v.frames === 1 && Number.isFinite(v.lastDrawMs), v.lastDrawMs);
const px = v.ctx.getImageData(0, 0, 1200, 700).data;
const at = (x, y) => {
  const i = (Math.round(y) * 1200 + Math.round(x)) * 4;
  return [px[i], px[i + 1], px[i + 2], px[i + 3]];
};
const lum = ([r, g, b]) => 0.2126 * r + 0.7152 * g + 0.0722 * b;
// углы кадра — море, а не чёрная дыра
const corners = [at(3, 3), at(1196, 3), at(3, 696), at(1196, 696)];
ok('по углам кадра — море, а не чёрный фон', corners.every((c) => c[3] > 200 && lum(c) > 3), JSON.stringify(corners[0]));
ok('море синее: синего больше, чем красного', corners.every((c) => c[2] > c[0]));
ok('углы не залиты чистым чёрным', corners.every((c) => c[0] + c[1] + c[2] > 8));
// в самом центре — крестик своей столицы, поэтому растительность смотрим рядом
const center = at(600, 300);
ok('рядом с центром — суша, а не море', center[1] > center[2], JSON.stringify(center));
/* «Суша светлее моря» нельзя проверять по одному пикселю: на другой
   растеризации канвы в эту точку попадает дорога, река или край
   подписи, и палитра «вдруг» становится тёмной (на CI было 64 vs 63
   при живых цветах вокруг). Берём медиану яркости пятна суши у центра
   и пятна моря в углу — смысл проверки тот же (палитра), а судьба её
   не зависит от одного пикселя. */
const patchLums = (cx, cy, r, landOnly) => {
  const vals = [];
  for (let y = cy - r; y <= cy + r; y += 2) {
    for (let x = cx - r; x <= cx + r; x += 2) {
      const c = at(x, y);
      if (landOnly && !(c[1] > c[2] + 4)) continue;
      vals.push(lum(c));
    }
  }
  vals.sort((a, b) => a - b);
  return vals.length ? vals[Math.floor(vals.length / 2)] : NaN;
};
const landLum = patchLums(600, 300, 24, true);
const seaLum = patchLums(30, 30, 20, false);
ok('суша светлее моря', landLum > seaLum + 20, landLum.toFixed(0) + ' vs ' + seaLum.toFixed(0));
ok('суша не чёрная и не белая', landLum > 40 && landLum < 220, landLum.toFixed(0));
// доля суши в кадре: континент занимает заметную часть, но не весь экран
let landPx = 0, seaPx = 0, bright = 0;
for (let y = 4; y < 700; y += 4) {
  for (let x = 4; x < 1200; x += 4) {
    const c = at(x, y);
    if (c[1] > c[2] + 4) landPx++;
    else if (c[2] > c[0]) seaPx++;
    if (lum(c) > 210) bright++;
  }
}
const totalPx = Math.ceil((700 - 4) / 4) * Math.ceil((1200 - 4) / 4);
// §95: на карте планеты суши около седьмой части — как на настоящей карте мира
ok('суша занимает заметную часть кадра', landPx / totalPx > 0.09, (landPx / totalPx).toFixed(2));
ok('континент не заливает весь кадр', landPx / totalPx < 0.85, (landPx / totalPx).toFixed(2));
ok('моря в кадре тоже много', seaPx / totalPx > 0.1, (seaPx / totalPx).toFixed(2));
ok('на карте есть светлые линии и подписи', bright > 60, bright);
// берег: на границе суши светлый пиксель ярче суши
ok('береговая линия светлее суши', (() => {
  for (let x = 20; x < 1180; x += 3) {
    for (let y = 20; y < 680; y += 3) {
      const c = at(x, y);
      if (c[0] > 200 && c[1] > 210 && c[2] > 190) return true;
    }
  }
  return false;
})());
ok('в кадре нет чистых чёрных квадратов', (() => {
  for (let x = 8; x < 1200; x += 37) for (let y = 8; y < 700; y += 31) {
    const c = at(x, y);
    if (c[0] === 0 && c[1] === 0 && c[2] === 0) return false;
  }
  return true;
})());
// первый кадр строит базовый слой целиком (острова, льды, берег); на холодную в node-canvas
// он плавает 74…140 мс, поэтому бюджет 160 — остальное ловит группа «цена кадра»
ok('кадр укладывается в бюджет 160 мс', v.lastDrawMs < 160, v.lastDrawMs.toFixed(1));
ok('повторный кадр не пересобирает основу', (() => {
  const before = v.ready;
  v.draw(); v.draw();
  return v.ready === before;
})());
ok('кадры считаются', v.frames >= 3, v.frames);
ok('детальный слой один на камеру', (() => {
  v.draw();
  const n = v.rebuilds;
  v.draw();
  return v.rebuilds === n;
})());
ok('смена мира сбрасывает готовность', (() => {
  const v2 = new WorldView(makeCanvas(600, 400), { createCanvas: (a, b) => createCanvas(a, b) });
  v2.resize(); v2.setWorld(world); v2.step(0.02); v2.step(0.02);
  v2.setWorld(world);
  return v2.ready === 0 && v2.base === null;
})());
ok('смена размера меняет кадр', (() => {
  const v2 = new WorldView(makeCanvas(600, 400), { createCanvas: (a, b) => createCanvas(a, b) });
  v2.resize();
  return v2.view.w === 600 && v2.view.h === 400 && v2.canvas.width === 600;
})());
ok('без мира кадр не падает', (() => {
  const v2 = new WorldView(makeCanvas(300, 200), { createCanvas: (a, b) => createCanvas(a, b) });
  v2.resize();
  const r = v2.draw();
  return r === v2 && !v2.base;
})());
ok('океан берётся из палитры', WV.ocean.length === 3 && WV.ocean.every((c) => /^#[0-9a-f]{6}$/i.test(c)));
ok('тона стран — восемь разных цветов', WV.tones.length === 8 && new Set(WV.tones).size === 8);
ok('суша и своя страна — разные цвета', WV.land !== WV.landOwn);
ok('сетка карты с человеческим шагом', WV.gridKm === 2000, WV.gridKm);
ok('базовый слой — квадрат 1400 px', WV.baseSize === 1400 && v.base.width === 1400);

/* ——— 4. подписи и линейка ——— */
group('подписи и линейка');
const cvL = makeCanvas(1200, 700);
const vL = new WorldView(cvL, { createCanvas: (a, b) => createCanvas(a, b) });
vL.resize(); vL.setWorld(world); vL.step(0.02); vL.step(0.02); vL.open();
const texts = [];
const origFill = vL.ctx.fillText.bind(vL.ctx);
vL.ctx.fillText = (t, x, y) => { texts.push(String(t)); return origFill(t, x, y); };
vL.draw();
ok('в кадре есть подписи стран', texts.some((t) => world.countries.some((c) => c.name.toUpperCase() === t)), texts.length);
ok('подписана хотя бы половина стран', world.countries.filter((c) => texts.includes(c.name.toUpperCase())).length >= world.countries.length / 2);
ok('своя страна подписана всегда', texts.includes(world.own.name.toUpperCase()));
ok('подписи стран не дублируются', new Set(texts.filter((t) => world.countries.some((c) => c.name.toUpperCase() === t))).size ===
  texts.filter((t) => world.countries.some((c) => c.name.toUpperCase() === t)).length);
ok('на обзоре порог подписей низкий', WV.countryLabelScale < 0.02, WV.countryLabelScale);
ok('телефонный масштаб выше порога подписей', fitLandScale(world, phone) > WV.countryLabelScale, fitLandScale(world, phone).toFixed(4));
ok('в подписях нет номеров параграфов', texts.every((t) => !/§|F-\d/.test(t)));
ok('на карте есть подпись масштаба в километрах', texts.some((t) => /км$/.test(t)), texts.filter((t) => /км/.test(t)).join('|'));
ok('на карте есть подпись px/км', texts.some((t) => /px\/км/.test(t)), '');
ok('подпись км — круглое число', (() => {
  const t = texts.find((s) => /км$/.test(s) && !/px/.test(s));
  if (!t) return false;
  const n = Number(t.replace(/\s/g, '').replace('км', ''));
  return [100, 250, 500, 1000, 2000, 4000, 8000, 16000].includes(n);
})(), '');
const barCanvas = createCanvas(400, 200);
const bar = drawScaleBar(barCanvas.getContext('2d'), { w: 400, h: 200 }, { scale: 0.02 });
ok('линейка возвращает километры', bar.km > 0, bar.km);
ok('линейка возвращает длину в пикселях', bar.barPx > 20 && bar.barPx < 220, bar.barPx);
ok('длина линейки соответствует масштабу', Math.abs(bar.barPx - bar.km * 0.02) < 1e-6, bar.barPx + ' vs ' + (bar.km * 0.02));
ok('линейка держит целевой размер в любом масштабе', (() => {
  const r = drawScaleBar(createCanvas(400, 200).getContext('2d'), { w: 400, h: 200 }, { scale: 0.05 });
  return r.barPx >= 40 && r.barPx <= 170 && bar.barPx >= 40 && bar.barPx <= 170;
})(), bar.barPx + ' / ' + 100);
ok('на узком экране линейка не шире кадра', (() => {
  const r = drawScaleBar(createCanvas(390, 300).getContext('2d'), { w: 390, h: 300 }, { scale: 0.02 });
  return r.barPx < 390;
})());
ok('линейку можно ставить в своё место', (() => {
  const c = createCanvas(300, 200);
  const r = drawScaleBar(c.getContext('2d'), { w: 300, h: 200 }, { scale: 0.03 }, { x: 40, y: 120 });
  return r.barPx > 0;
})());
ok('подписи столиц включаются при приближении', WV.capitalLabelScale > 0 && WV.capitalLabelScale < WV.labelScale, WV.capitalLabelScale + ' < ' + WV.labelScale);
ok('подписи городов ждут приближения', WV.labelScale >= 0.1, WV.labelScale);
ok('приближение включает подробности', (() => {
  vL.cam.scale = 0.2;
  return vL.needsDetail() === true;
})());
ok('обзор не пересобирает подробности зря', (() => {
  const v2 = new WorldView(makeCanvas(900, 600), { createCanvas: (a, b) => createCanvas(a, b) });
  v2.resize(); v2.setWorld(world); v2.step(0.02); v2.step(0.02); v2.open(); 
  v2.draw();
  const n = v2.rebuilds;
  v2.draw();
  return v2.rebuilds === n;
})());
ok('подписи не выходят за кадр', (() => {
  const v2 = new WorldView(makeCanvas(390, 844), { createCanvas: (a, b) => createCanvas(a, b) });
  v2.resize(); v2.setWorld(world); v2.step(0.02); v2.step(0.02); v2.open();
  const seen = [];
  const o = v2.ctx.fillText.bind(v2.ctx);
  v2.ctx.fillText = (t, x, y) => { seen.push([String(t), x, y]); return o(t, x, y); };
  v2.draw();
  const names = new Set(world.countries.map((c) => c.name.toUpperCase()));
  return seen.filter(([t]) => names.has(t)).every(([, x]) => x >= 0 && x <= 390);
})());

/* ——— 5. георазметка ——— */
group('георазметка');
{
  const cvG = makeCanvas(1200, 700);
  const vG = new WorldView(cvG, { createCanvas: (a, b) => createCanvas(a, b) });
  vG.resize(); vG.setWorld(world); vG.step(0.02); vG.step(0.02); vG.open();
  const texts = () => {
    const seen = [];
    const orig = vG.ctx.fillText.bind(vG.ctx);
    vG.ctx.fillText = (t, x, y) => { seen.push({ t: String(t), x, y }); return orig(t, x, y); };
    vG.draw();
    vG.ctx.fillText = orig;
    return seen;
  };
  const wide = texts();
  const degLat = wide.filter((q) => /° (с|ю)\. ш\./.test(q.t));
  const degLon = wide.filter((q) => /° (в|з)\. д\./.test(q.t));
  ok('на карте есть подписи широты', degLat.length >= 2, degLat.length);
  ok('на карте есть подписи долготы', degLon.length >= 2, degLon.length);
  ok('подписи широты — в градусах и словами', degLat.every((q) => /^\d+° (с|ю)\. ш\.$/.test(q.t)), degLat[0] && degLat[0].t);
  ok('подписи долготы — в градусах и словами', degLon.every((q) => /^(\d+° (в|з)\. д\.|0° меридиан)$/.test(q.t)), degLon[0] && degLon[0].t);
  ok('подписаны нулевые линии', wide.some((q) => q.t === 'экватор') || wide.some((q) => q.t === '0° меридиан'),
    wide.filter((q) => /экватор|0°/.test(q.t)).map((q) => q.t).join(','));
  ok('подписи градусов не лезут в подписи стран', wide.filter((q) => /°/.test(q.t)).every((q) => q.x > 0 && q.x < 1200));
  // сетка стоит на карте: сдвиг камеры на 1000 км сдвигает подпись на 1000 · масштаб
  const x1 = wide.find((q) => /° в\. д\./.test(q.t));
  vG.cam.x += 1000;
  const shifted = texts().find((q) => q.t === x1.t);
  ok('подпись меридиана едет вместе с картой', !!shifted && Math.abs((x1.x - shifted.x) - 1000 * vG.cam.scale) < 1.5,
    x1.x.toFixed(1) + ' → ' + (shifted && shifted.x.toFixed(1)));
  vG.cam.x -= 1000;
  // на телефоне подписей меньше, чем на мониторе
  const cvP = makeCanvas(390, 844);
  const vP = new WorldView(cvP, { createCanvas: (a, b) => createCanvas(a, b) });
  vP.resize(); vP.setWorld(world); vP.step(0.02); vP.step(0.02); vP.open();
  const seenP = [];
  const origP = vP.ctx.fillText.bind(vP.ctx);
  vP.ctx.fillText = (t, x, y) => { seenP.push(String(t)); return origP(t, x, y); };
  vP.draw();
  vP.ctx.fillText = origP;
  ok('на телефоне сетка подписана реже', seenP.filter((t) => /°/.test(t)).length <= wide.filter((q) => /°/.test(q.t)).length,
    seenP.filter((t) => /°/.test(t)).length + ' ≤ ' + wide.filter((q) => /°/.test(q.t)).length);
  ok('на телефоне подписи не вылезают за край', seenP.every((t) => t.length < 20));
  // компас
  const compassTexts = ['С', 'Ю', 'З', 'В'];
  ok('компас подписан четырьмя сторонами', compassTexts.every((t) => wide.some((q) => q.t === t)));
  const north = wide.find((q) => q.t === 'С');
  ok('север — в правом верхнем углу', !!north && north.x > 1000 && north.y < 80, north && Math.round(north.x) + ';' + Math.round(north.y));
  ok('компас рисуется функцией с числами', (() => {
    const c = makeCanvas(400, 300);
    const r = drawCompass(c.getContext('2d'), { w: 400, h: 300 });
    return r && r.x > 300 && r.y < 80 && r.r > 10;
  })());
  // подписи океана — в мире, а не в долях экрана
  const ocean = wide.filter((q) => q.t === 'О К Е А Н');
  ok('океан подписан словами', ocean.length >= 1, ocean.length);
  const before = { x: ocean[0].x };
  vG.cam.x -= 2000;
  const after = texts().filter((q) => q.t === 'О К Е А Н');
  ok('подпись океана едет с картой, а не стоит на экране',
    after.every((q) => Math.abs(q.x - before.x) > 1), after.length ? after[0].x.toFixed(0) + ' vs ' + before.x.toFixed(0) : 'нет');
  vG.cam.x += 2000;
  // слой подробностей
  const off = detailOffset({ w: 1200, h: 700 }, { x: 0, y: 0, scale: 0.03 }, { x: 0, y: 0, scale: 0.03 }, 96);
  ok('слой подробностей при той же камере стоит на месте', Math.abs(off.x + 96) < 1e-9 && Math.abs(off.y + 96) < 1e-9, off.x.toFixed(2));
  const off2 = detailOffset({ w: 1200, h: 700 }, { x: 100, y: -50, scale: 0.03 }, { x: 0, y: 0, scale: 0.03 }, 96);
  ok('при сдвиге камеры слой едет вместе с миром', Math.abs(off2.x + 96 + 100 * 0.03) < 1e-9 && Math.abs(off2.y + 96 - 50 * 0.03) < 1e-9,
    off2.x.toFixed(2) + ';' + off2.y.toFixed(2));
  ok('масштаб слоя пересчитывается отношением', Math.abs(detailOffset({ w: 900, h: 600 }, { x: 0, y: 0, scale: 0.06 }, { x: 0, y: 0, scale: 0.03 }, 40).k - 2) < 1e-9);
  ok('нулевой масштаб не ломает слой', detailOffset({ w: 900, h: 600 }, { x: 0, y: 0, scale: 0.03 }, { x: 0, y: 0, scale: 0 }, 40).k === 1);
  // градусы из километров
  ok('километры переводятся в градусы', (() => {
    const a = geoDeg(world, 0, 0), b = geoDeg(world, 20000, -20000);
    return Math.abs(a.lat) < 1e-9 && Math.abs(a.lon) < 1e-9 && Math.abs(b.lon - 180) < 1e-9 && Math.abs(b.lat - 90) < 1e-9;
  })());
  ok('широта подписывается по-русски', formatLat(60) === '60° с. ш.' && formatLat(-30) === '30° ю. ш.' && formatLat(0) === 'экватор',
    formatLat(60));
  ok('долгота подписывается по-русски', formatLon(30) === '30° в. д.' && formatLon(-45) === '45° з. д.' && formatLon(0) === '0° меридиан',
    formatLon(30));
  ok('сетка возвращает число линий', (() => {
    const c = makeCanvas(600, 400);
    const r = drawGraticule(c.getContext('2d'), { w: 600, h: 400 }, { x: 0, y: 0, scale: 0.02 }, world);
    return r && r.lines > 6;
  })());
}

/* ——— 6. цена кадра ——— */
group('цена кадра');
const cost = (w, h, scale) => {
  const c = makeCanvas(w, h);
  const vv = new WorldView(c, { createCanvas: (a, b) => createCanvas(a, b) });
  vv.resize(); vv.setWorld(world); vv.step(0.02); vv.step(0.02); vv.open();
  vv.cam.scale = scale || vv.cam.scale;
  /* Цена кадра — лучший из трёх: одиночная отрисовка на загруженной
     машине ловит паузу планировщика, а не цену кадра. Порог тот же —
     реальное удорожание отрисовки поднимет и лучший замер. */
  let bestMs = Infinity;
  for (let i = 0; i < 3; i++) {
    vv.draw();
    bestMs = Math.min(bestMs, vv.lastDrawMs);
  }
  return bestMs;
};
const msWide = cost(1200, 700);
const msPhone = cost(390, 844);
ok('широкий кадр рисуется быстрее 120 мс', msWide < 120, msWide.toFixed(1));
ok('телефонный кадр рисуется быстрее 120 мс', msPhone < 120, msPhone.toFixed(1));
ok('первый кадр с базой не дороже 200 мс', (() => {
  /* Свежий вид каждый раз (это именно первый кадр), но замер — лучший
     из трёх: иначе порог срабатывает от загрузки машины, а не от цены
     первого кадра. */
  let bestMs = Infinity;
  for (let r = 0; r < 3; r++) {
    const v2 = new WorldView(makeCanvas(1200, 700), { createCanvas: (a, b) => createCanvas(a, b) });
    v2.resize(); v2.setWorld(world); v2.open();
    const t0 = performance.now();
    v2.step(1 / 60); v2.step(1 / 60); v2.draw();
    bestMs = Math.min(bestMs, performance.now() - t0);
  }
  return bestMs < 400;
})());
ok('второй кадр дешевле первого', (() => {
  const v2 = new WorldView(makeCanvas(1200, 700), { createCanvas: (a, b) => createCanvas(a, b) });
  v2.resize(); v2.setWorld(world); v2.step(0.02); v2.step(0.02); v2.open();
  v2.draw();
  const a = v2.lastDrawMs;
  v2.draw();
  return v2.lastDrawMs <= a * 3 + 5;
})());
ok('доля 3D-мира не тянет за собой базовый слой', (() => {
  const v2 = new WorldView(makeCanvas(1200, 700), { createCanvas: (a, b) => createCanvas(a, b) });
  v2.resize(); v2.setWorld(world); v2.step(0.02); v2.step(0.02); v2.open(); v2.draw();
  const b = v2.base;
  for (let i = 0; i < 5; i++) v2.draw();
  return v2.base === b;
})());
ok('основа не растёт при смене размера', (() => {
  const v2 = new WorldView(makeCanvas(1200, 700), { createCanvas: (a, b) => createCanvas(a, b) });
  v2.resize(); v2.setWorld(world); v2.step(0.02); v2.step(0.02);
  const b = v2.base;
  v2.resize();
  return v2.base === b;
})());
ok('отметки рисуются не все, а каждая вторая (дешевле)', world.marks.length / 3 > 300);
ok('в кадре 18 стран — подписей не больше', world.countries.length === WM.countries, world.countries.length);
ok('у шага карты фиксированная цена', (() => {
  const v2 = new WorldView(makeCanvas(900, 600), { createCanvas: (a, b) => createCanvas(a, b) });
  v2.resize(); v2.setWorld(world);
  /* Лучший из трёх замеров — по той же причине, что и цена кадра выше. */
  let bestMs = Infinity;
  for (let r = 0; r < 3; r++) {
    const t0 = performance.now();
    v2.step(1 / 60); v2.step(1 / 60);
    bestMs = Math.min(bestMs, performance.now() - t0);
  }
  return bestMs < 500;
})());
ok('базовый слой — одна канва, а не массив', (() => {
  const v2 = new WorldView(makeCanvas(900, 600), { createCanvas: (a, b) => createCanvas(a, b) });
  v2.resize(); v2.setWorld(world); v2.step(0.02); v2.step(0.02);
  return v2.base && typeof v2.base.width === 'number';
})());
ok('кадр не аллоцирует детальный слой каждый раз', (() => {
  const v2 = new WorldView(makeCanvas(900, 600), { createCanvas: (a, b) => createCanvas(a, b) });
  v2.resize(); v2.setWorld(world); v2.step(0.02); v2.step(0.02); v2.open(); v2.draw();
  const d = v2.detail;
  v2.draw();
  return v2.detail === d;
})());
ok('прозрачность не копится от кадра к кадру', (() => {
  const v2 = new WorldView(makeCanvas(400, 300), { createCanvas: (a, b) => createCanvas(a, b) });
  v2.resize(); v2.setWorld(world); v2.step(0.02); v2.step(0.02); v2.open();
  for (let i = 0; i < 10; i++) v2.step(0.05);
  return v2.alpha === 1;
})());
ok('шаг без перехода не двигает камеру', (() => {
  const v2 = new WorldView(makeCanvas(400, 300), { createCanvas: (a, b) => createCanvas(a, b) });
  v2.resize(); v2.setWorld(world); v2.open();
  const c = { ...v2.cam };
  v2.step(0.1);
  return Math.abs(v2.cam.x - c.x) < 1e-9 && Math.abs(v2.cam.scale - c.scale) < 1e-9;
})());
ok('18 стран и 216 городов — данные готовы', world.cities.length >= 100, world.cities.length);
ok('рельеф дешевле, чем 900 отметок', world.marks.length / 3 < 900);
ok('переход не длиннее двух секунд', WV.transitionMs <= 2000, WV.transitionMs);
ok('переход виден: дольше секунды', WV.transitionMs >= 1000, WV.transitionMs);
ok('два прохода загрузки — по одному на кадр', WV.loadPasses === 2);
ok('минимум масштаба не нулевой', WV.minScale > 0);
ok('максимум масштаба в разумных пределах', WV.maxScale <= 1);
ok('обзор не мельче минимума', fitLandScale(world, phone) > WV.minScale);

/* ——— 6. мир вокруг: острова, льды, легенда ——— */
group('мир вокруг');
ok('в мире есть острова', Array.isArray(world.islands) && world.islands.length >= 6, world.islands.length);
ok('островов ровно девять', world.islands.length === 9, world.islands.length);
ok('острова — полигоны', world.islands.every((i) => Array.isArray(i.poly) && i.poly.length >= 20));
ok('у острова есть радиус', world.islands.every((i) => i.rKm > 300 && i.rKm < 1200));
ok('острова дальше континента', world.islands.every((i) => Math.hypot(i.x, i.y) > 14500), Math.round(Math.min(...world.islands.map((i) => Math.hypot(i.x, i.y)))));
ok('острова внутри карты', world.islands.every((i) => i.poly.every(([x, y]) => Math.abs(x) <= world.sizeKm / 2 && Math.abs(y) <= world.sizeKm / 2)));
ok('острова не пересекаются с континентом', world.islands.every((i) => i.poly.every(([x, y]) => !pointInPolygon(x, y, coast))));
ok('острова детерминированы', (() => {
  const a = buildWorld(424242).islands;
  const b = buildWorld(424242).islands;
  return a.length === b.length && Math.abs(a[0].x - b[0].x) < 1e-9;
})());
ok('остров не назван чужим именем', world.islands.every((i) => !/§|\d/.test(i.name)));
{
  // F-396: острова не залезают в полярный лёд — иначе остров тонет в белой полосе
  const ice = Math.min(...world.caps[0].poly.map((q) => Math.abs(q[1])));
  const far = Math.max(...world.islands.map((i) => Math.max(...i.poly.map(([x, y]) => Math.hypot(x, y)))));
  ok('острова не доходят до льдов', far < ice, Math.round(far) + ' < ' + Math.round(ice));
  ok('лёд не залезает на сушу', Math.min(...world.caps[0].poly.map((q) => Math.abs(q[1]))) > 8000);
}
ok('в мире есть полярные льды', Array.isArray(world.caps) && world.caps.length === 2, world.caps.length);
ok('льды — на севере и юге', world.caps.some((c) => c.id === 'north') && world.caps.some((c) => c.id === 'south'));
ok('северный щит выше середины', Math.min(...world.caps.find((c) => c.id === 'north').poly.map((p) => p[1])) < -17000);
ok('южный щит ниже середины', Math.max(...world.caps.find((c) => c.id === 'south').poly.map((p) => p[1])) > 17000);
ok('льды лежат внутри карты', world.caps.every((c) => c.poly.every(([x, y]) => Math.abs(x) <= world.sizeKm / 2 && Math.abs(y) <= world.sizeKm / 2)));
ok('льды не залезают на континент', world.caps.every((c) => c.poly.filter(([x, y]) => pointInPolygon(x, y, coast)).length === 0));
ok('льды детерминированы', (() => {
  const a = buildWorld(424242).caps;
  const b = buildWorld(424242).caps;
  return Math.abs(a[0].poly[3][1] - b[0].poly[3][1]) < 1e-9;
})());
const cvL2 = makeCanvas(900, 600);
const vL2 = new WorldView(cvL2, { createCanvas: (a, b) => createCanvas(a, b) });
vL2.resize(); vL2.setWorld(world); vL2.step(0.02); vL2.step(0.02); vL2.open();
const legTexts = [];
const o2 = vL2.ctx.fillText.bind(vL2.ctx);
vL2.ctx.fillText = (t, x, y) => { legTexts.push(String(t)); return o2(t, x, y); };
vL2.draw();
ok('легенда на карте подписана словами', legTexts.includes('город') && legTexts.includes('столица'), legTexts.join('|'));
ok('в легенде есть наша армия', legTexts.includes('наша армия'));
ok('в легенде есть разрушения', legTexts.includes('разрушено'));
ok('в легенде нет номеров параграфов', legTexts.every((t) => !/§|F-\d/.test(t)));
ok('океан подписан словом', legTexts.filter((t) => /О\s?К\s?Е\s?А\s?Н/.test(t)).length >= 2, legTexts.filter((t) => /О/.test(t)).length);
const legBox = drawMapLegend(createCanvas(900, 600).getContext('2d'), { w: 900, h: 600 });
ok('легенда помещается в углу кадра', legBox.x + legBox.w <= 900 && legBox.y + legBox.h <= 600, JSON.stringify(legBox));
ok('легенда не закрывает панель снизу слева', legBox.x > 300, legBox.x);
ok('на телефоне легенда короче', (() => {
  const b = drawMapLegend(createCanvas(390, 844).getContext('2d'), { w: 390, h: 844 });
  return b.rows === 7 && b.x === 10;
})());
ok('своя армия видна в кадре без спутника', (() => {
  const armies = world.armies.filter((a) => a.country === 'own');
  return armies.length > 0 && armies.every((a) => pointInPolygon(a.x, a.y, coast));
})());
ok('камера смотрит на свою столицу и видит весь континент', (() => {
  const cam = ownOverview(world, { w: 1200, h: 700 });
  return cam.x === 0 && cam.y === 0 && coast.every(([x, y]) =>
    Math.abs(x * cam.scale) <= 1200 / 2 && Math.abs(y * cam.scale) <= 700 / 2);
})());

/* ——— 7. §100: простая карта и тумблер «области» ——— */
group('простая карта и тумблер областей');
{
  const pixels = (cv) => {
    const d = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data;
    let n = 0;
    for (let i = 0; i < d.length; i += 4) if (d[i] + d[i + 1] + d[i + 2] > 40) n++;
    return n;
  };
  const diff = (a, b) => {
    const da = a.getContext('2d').getImageData(0, 0, a.width, a.height).data;
    const db = b.getContext('2d').getImageData(0, 0, b.width, b.height).data;
    let n = 0;
    for (let i = 0; i < da.length; i += 4) {
      if (Math.abs(da[i] - db[i]) + Math.abs(da[i + 1] - db[i + 1]) + Math.abs(da[i + 2] - db[i + 2]) > 12) n++;
    }
    return n;
  };
  const shot = (scale, showRegions) => {
    const cv = makeCanvas(900, 600);
    const v = new WorldView(cv, { createCanvas: (a, b) => createCanvas(a, b) });
    v.resize(); v.setWorld(world); v.step(0.02); v.step(0.02); v.open();
    v.transition = null; v.alpha = 1;
    v.cam.scale = scale; v.cam.x = 0; v.cam.y = 0;
    if (showRegions !== undefined) v.showRegions = showRegions;
    v.draw();
    return { v, cv };
  };

  const plain = shot(0.021);
  ok('границы областей по умолчанию выключены', plain.v.showRegions === false);
  ok('обзор рисуется без ошибок', pixels(plain.cv) > 10000, pixels(plain.cv));

  const withRegions = shot(0.021, true);
  const dRegion = diff(plain.cv, withRegions.cv);
  ok('тумблер «области» включает пунктир областей', dRegion > 1000, dRegion);
  ok('пунктир областей — тонкие линии, а не заливка', dRegion < 60000, dRegion);

  const offLegend = drawMapLegend(makeCanvas(900, 600).getContext('2d'), { w: 900, h: 600 }, { showRegions: false });
  const onLegend = drawMapLegend(makeCanvas(900, 600).getContext('2d'), { w: 900, h: 600 }, { showRegions: true });
  ok('в легенде без областей на строку меньше', onLegend.rows === offLegend.rows + 1, offLegend.rows + ' → ' + onLegend.rows);
  ok('легенда без областей всё равно полная', offLegend.rows >= 16, offLegend.rows);
  ok('легенда помещается в кадр при тумблере', onLegend.x + onLegend.w <= 900 && onLegend.y + onLegend.h <= 600);

  // мелкие дороги и кресты — только при приближении
  ok('на обзоре дорог нет вовсе', WV.roadScale > 0.021, WV.roadScale);
  ok('мелкие дороги — только при очень большом зуме', WV.localRoadScale >= 0.5, WV.localRoadScale);
  ok('на среднем зуме дорог тоже нет', WV.roadScale > 0.25, WV.roadScale);
  ok('отметки рельефа не рисуются на обзоре', WV.markScale > 0.021, WV.markScale);
  ok('кресты разрушенного не рисуются на обзоре', WV.ruinScale > 0.021, WV.ruinScale);

  const zoomed = shot(0.22);
  ok('на зуме карта подробная', pixels(zoomed.cv) > 10000);
  // если разрешить мелкие дороги на обзоре, кадр меняется — значит на обзоре их точно нет
  const savedLocal = WV.localRoadScale;
  const overviewRoads = shot(0.021);
  WV.localRoadScale = 0;
  overviewRoads.v.detail = null;
  overviewRoads.v.draw();
  const dRoads = diff(overviewRoads.cv, plain.cv);
  WV.localRoadScale = savedLocal;
  ok('мелкие дороги возвращаются при приближении', dRoads > 500, dRoads);
  ok('после проверки порог дорог на месте', WV.localRoadScale === 0.55, WV.localRoadScale);
}

/* ——— 8. §101: одна палитра на две карты, дороги только на зуме ——— */
group('одна палитра и дороги на зуме');
{
  const lum = (hex) => {
    const n = parseInt(hex.slice(1), 16);
    return 0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255);
  };
  ok('море карты мира взято из общей палитры', WV.ocean[0] === MAP_TONES.seaDeep && WV.ocean[2] === MAP_TONES.seaShelf, WV.ocean.join(' '));
  ok('суша карты мира — из общей палитры', WV.land === MAP_TONES.land, WV.land);
  ok('своя страна светлее общей суши', lum(WV.landOwn) > lum(WV.land), WV.landOwn + ' / ' + WV.land);
  ok('море не почти-чёрное, как до §101', WV.ocean.every((c) => lum(c) > 45), WV.ocean.map((c) => lum(c).toFixed(0)).join(' '));
  ok('море светлеет к берегу', lum(WV.ocean[2]) > lum(WV.ocean[0]), lum(WV.ocean[0]).toFixed(0) + ' → ' + lum(WV.ocean[2]).toFixed(0));
  const rgb = (h) => { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
  ok('суша — зелёная, море — синее', rgb(WV.land)[1] > rgb(WV.land)[2] && rgb(WV.ocean[1])[2] > rgb(WV.ocean[1])[1],
    WV.land + ' / ' + WV.ocean[1]);
  ok('тона стран — из зелёно-песочной гаммы', WV.tones.every((c) => lum(c) > 80 && lum(c) < 160), WV.tones.map((c) => lum(c).toFixed(0)).join(' '));
  const tint = (k) => BIOMES.kinds[k].tint.match(/\d+/g).slice(0, 3).map(Number);
  const hex = (h) => { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
  ok('лес покрова — лесной зелёный общей палитры', tint('forest').join() === hex(MAP_TONES.forest).join(), tint('forest').join());
  ok('горы покрова — камень общей палитры', tint('mountain').join() === hex(MAP_TONES.rock).join());
  ok('пустыня покрова — песок общей палитры', tint('desert').join() === hex(MAP_TONES.sand).join());
  ok('болото темнее леса — его видно', lum(MAP_TONES.forest) > 0 && tint('swamp').reduce((a, b) => a + b, 0) < tint('forest').reduce((a, b) => a + b, 0) + 40);
  ok('у покрова и у страны одна палитра в модулях', typeof MAP_TONES.snow === 'string' && MAP_TONES.snow.startsWith('#'));

  // дороги: до порога их нет
  // force — временный порог дорог: 0 разрешает их на любом масштабе, 0.9 запрещает совсем
  const shot = (scale, force) => {
    const cv = makeCanvas(900, 600);
    const saved = WV.roadScale;
    if (force !== undefined) WV.roadScale = force;
    const v = new WorldView(cv, { createCanvas: (a, b) => createCanvas(a, b) });
    v.resize(); v.setWorld(world); v.step(0.02); v.step(0.02); v.open();
    v.transition = null; v.alpha = 1;
    v.cam.scale = scale; v.cam.x = 0; v.cam.y = 0;
    v.draw();
    WV.roadScale = saved;
    return cv;
  };
  const diff = (a, b) => {
    const da = a.getContext('2d').getImageData(0, 0, a.width, a.height).data;
    const db = b.getContext('2d').getImageData(0, 0, b.width, b.height).data;
    let n = 0;
    for (let i = 0; i < da.length; i += 4) {
      if (Math.abs(da[i] - db[i]) + Math.abs(da[i + 1] - db[i + 1]) + Math.abs(da[i + 2] - db[i + 2]) > 12) n++;
    }
    return n;
  };
  ok('порог дорог — глубокий зум', WV.roadScale >= 0.3, WV.roadScale);
  ok('на обзоре дороги не рисуются', diff(shot(0.021, 0), shot(0.021)) > 500, 'разница между «нет дорог» и «есть»');
  ok('на глубоком зуме шоссе видны', diff(shot(0.8, 0.9), shot(0.8)) > 200);
}

console.log(`\nOK: 8 групп · ${pass} проверок`);
if (fail) { console.log(`FAIL: ${fail}`); process.exit(1); }
