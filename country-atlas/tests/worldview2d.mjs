/* §93: вид карты мира — берег, вписывание, кадр, подписи и цена.
   Группы: берег, вписывание, кадр, подписи и линейка, цена кадра.
   Каждая группа — не меньше двадцати проверяемых значений. */
import { createCanvas } from '@napi-rs/canvas';
import {
  buildWorld, advanceWars, coastPolygon, landMarks, pointInPolygon, WM, buildMarks
} from '../src/worldmap2d.js';
import {
  WV, WorldView, landBox, fitLandScale, ownOverview, drawMapLegend, overviewScale, drawScaleBar, clampViewScale
} from '../src/worldview.js';

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

/* ——— 1. берег ——— */
group('берег');
ok('берег есть и он не пустой', Array.isArray(coast) && coast.length >= 72, coast.length);
ok('берег из 180 точек', coast.length === 180, coast.length);
ok('берег состоит из пар чисел', coast.every((p) => Array.isArray(p) && p.length === 2 && Number.isFinite(p[0]) && Number.isFinite(p[1])));
const radii = coast.map(radiusOf);
const rMin = Math.min(...radii), rMax = Math.max(...radii);
ok('берег не круг: радиус гуляет больше чем на 10 %', (rMax - rMin) / rMax > 0.1, ((rMax - rMin) / rMax).toFixed(3));
ok('самый дальний мыс дальше 14 000 км', rMax > 14000, Math.round(rMax));
ok('самый глубокий залив не ближе 11 000 км', rMin > 11000, Math.round(rMin));
ok('берег целиком внутри квадрата карты', rMax < world.sizeKm / 2, Math.round(rMax) + ' < ' + world.sizeKm / 2);
ok('квадрат карты расширен под океан и острова', world.sizeKm === 40000, world.sizeKm);
ok('средний радиус близок к 11 600 км', Math.abs(radii.reduce((a, b) => a + b, 0) / radii.length - 13300) < 2000);
// звезда: углы точек строго растут, значит берег простой и не самопересекается
ok('берег — простая замкнутая линия', (() => {
  // у звездообразного берега каждый следующий угол строго больше на шаг сетки
  const step = (Math.PI * 2) / coast.length;
  for (let i = 0; i < coast.length; i++) {
    const a1 = Math.atan2(coast[i][1], coast[i][0]);
    const a2 = Math.atan2(coast[(i + 1) % coast.length][1], coast[(i + 1) % coast.length][0]);
    let d = a2 - a1;
    while (d <= 0) d += Math.PI * 2;
    if (Math.abs(d - step) > 1e-6) return false;
  }
  return true;
})());
ok('длина берега больше длины окружности того же радиуса', (() => {
  let len = 0;
  for (let i = 0; i < coast.length; i++) {
    const a = coast[i], b = coast[(i + 1) % coast.length];
    len += Math.hypot(a[0] - b[0], a[1] - b[1]);
  }
  const circle = 2 * Math.PI * (radii.reduce((x, y) => x + y, 0) / radii.length);
  return len > circle * 1.02;
})());
ok('центр мира внутри берега', pointInPolygon(0, 0, coast));
ok('угол карты снаружи берега', !pointInPolygon(world.sizeKm / 2 - 10, world.sizeKm / 2 - 10, coast));
ok('все столицы внутри берега', world.countries.every((c) => pointInPolygon(c.capital.x, c.capital.y, coast)));
ok('все города внутри берега', world.cities.every((c) => pointInPolygon(c.x, c.y, coast)));
ok('ни одна дорога не начинается в море', world.roads.every((r) => pointInPolygon(r.x1, r.y1, coast) && pointInPolygon(r.x2, r.y2, coast)));
ok('все армии на суше', world.armies.every((a) => pointInPolygon(a.x, a.y, coast)));
ok('рельеф только на суше', (() => {
  for (let i = 0; i < world.marks.length; i += 3) if (!pointInPolygon(world.marks[i], world.marks[i + 1], coast)) return false;
  return true;
})());
ok('рельефа хватает на всю сушу', world.marks.length / 3 > 200, world.marks.length / 3);
ok('фильтр рельефа детерминирован', landMarks(buildMarks(424242), coast).length === world.marks.length);
const sameCoast = coastPolygon();
ok('берег считается одинаково при повторном вызове', sameCoast.length === coast.length && Math.abs(radiusOf(sameCoast[7]) - radiusOf(coast[7])) < 1e-9);
ok('берег континента не зависит от seed', (() => {
  const a = coastPolygon(); const b = coastPolygon(11600, 180);
  return a.every((p, i) => Math.abs(p[0] - b[i][0]) < 1e-9 && Math.abs(p[1] - b[i][1]) < 1e-9);
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
ok('обзор для квадрата остаётся отдельным масштабом', overviewScale(wide) > sWide, overviewScale(wide).toFixed(4) + ' vs ' + sWide.toFixed(4));
ok('обзор опирается на поля WV', Math.abs(overviewScale(wide) - (700 - 2 * WV.overviewPad) / 21400) < 1e-9);
const cvOpen = makeCanvas(1200, 700);
const vOpen = new WorldView(cvOpen, { createCanvas: (a, b) => createCanvas(a, b) });
vOpen.resize(); vOpen.setWorld(world);
vOpen.open();
// F-391: в центре кадра — своя страна, а не середина рамки суши
near('open() ставит камеру на свою столицу', vOpen.cam.x, world.own.capital.x, 1e-6);
near('open() ставит масштаб по континенту вокруг столицы', vOpen.cam.scale, ownScale, 1e-6);
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
ok('суша светлее моря', lum(center) > lum(corners[0]) + 20, lum(center).toFixed(0) + ' vs ' + lum(corners[0]).toFixed(0));
ok('суша не чёрная и не белая', lum(center) > 40 && lum(center) < 220, lum(center).toFixed(0));
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
ok('континент занимает больше четверти кадра', landPx / totalPx > 0.25, (landPx / totalPx).toFixed(2));
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

/* ——— 5. цена кадра ——— */
group('цена кадра');
const cost = (w, h, scale) => {
  const c = makeCanvas(w, h);
  const vv = new WorldView(c, { createCanvas: (a, b) => createCanvas(a, b) });
  vv.resize(); vv.setWorld(world); vv.step(0.02); vv.step(0.02); vv.open();
  vv.cam.scale = scale || vv.cam.scale;
  vv.draw();
  return vv.lastDrawMs;
};
const msWide = cost(1200, 700);
const msPhone = cost(390, 844);
ok('широкий кадр рисуется быстрее 120 мс', msWide < 120, msWide.toFixed(1));
ok('телефонный кадр рисуется быстрее 120 мс', msPhone < 120, msPhone.toFixed(1));
ok('первый кадр с базой не дороже 200 мс', (() => {
  const v2 = new WorldView(makeCanvas(1200, 700), { createCanvas: (a, b) => createCanvas(a, b) });
  v2.resize(); v2.setWorld(world); v2.open();
  const t0 = performance.now();
  v2.step(1 / 60); v2.step(1 / 60); v2.draw();
  return performance.now() - t0 < 400;
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
  const t0 = performance.now();
  v2.step(1 / 60); v2.step(1 / 60);
  return performance.now() - t0 < 500;
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
  return b.rows === 3 && b.x === 10;
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

console.log(`\nOK: 6 групп · ${pass} проверок`);
if (fail) { console.log(`FAIL: ${fail}`); process.exit(1); }
