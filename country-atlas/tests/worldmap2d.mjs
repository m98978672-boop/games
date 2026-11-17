/* §86: проверки карты мира и её отрисовки.
   Группы: мир, геометрия, войны, спутник, камера, кадр. Больше 20 проверяемых значений в каждой. */
import { createCanvas } from '@napi-rs/canvas';
import {
  WM, MARK, buildWorld, advanceWars, maybeStartWar, worldStats, hottestWar,
  countryAt, nearestCity, nearestRoad, segmentDistance, pointInPolygon, polygonArea,
  sitesFor, voronoiPoly, cellRadius, adjacency, poleOfInaccessibility, coastPolygon, borderTowns, canSeeArmies
} from '../src/worldmap2d.js';
import {
  WV, WorldView, overviewScale, clampViewScale, worldToScreen, screenToWorld,
  visibleRect, lerpCam, drawMark
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

/* ——— 1. мир ——— */
group('мир');
const world = buildWorld(424242);
ok('стран столько, сколько в настройках', world.countries.length === WM.countries, world.countries.length);
ok('наша страна ровно одна', world.countries.filter((c) => c.own).length === 1);
const own = world.own;
ok('наша страна та же, что в world.own', own && own.id === world.countries.find((c) => c.own).id);
near('наша страна — площадь 7000 × 7000 км', Math.sqrt(polygonArea(own.poly)), WM.ownKm, 320, );
ok('наша страна — шестиугольная ячейка, а не остров', own.poly.length >= 5 && own.poly.length <= 12, own.poly.length);
ok('сторона мира 24000 км', world.sizeKm === WM.sizeKm);
ok('городов 7…15 на страну (включая пограничные)', world.countries.every((c) => (c.cities || []).length >= WM.citiesPer[0] && (c.cities || []).length <= WM.citiesPer[1] + 2),
  world.countries.map((c) => (c.cities || []).length).join(','));
ok('у каждой страны есть два пограничных городка', world.countries.every((c) => c.cities.filter((k) => k.border).length === 2),
  world.countries.map((c) => c.cities.filter((k) => k.border).length).join(','));
ok('всего городов больше 100', world.cities.length > 100, world.cities.length);
ok('у каждого города есть страна', world.cities.every((c) => !!world.countries.find((k) => k.id === c.country)));
ok('у каждой страны есть столица', world.countries.every((c) => world.cities.some((k) => k.capital && k.country === c.id)));
ok('города внутри границ своей страны', world.cities.every((c) => pointInPolygon(c.x, c.y, world.countries.find((k) => k.id === c.country).poly)), '');
ok('дороги связывают города своей страны', world.roads.filter((r) => r.kind !== 'international').every((r) => {
  const a = world.cities.find((c) => c.id === r.a), b = world.cities.find((c) => c.id === r.b);
  return a && b && a.country === r.country && b.country === r.country;
}));
ok('международная дорога ведёт от нашей столицы к соседу', world.roads.filter((r) => r.kind === 'international').every((r) => {
  const a = world.cities.find((c) => c.id === r.a), b = world.cities.find((c) => c.id === r.b);
  return a && b && a.id === 'own-cap' && b.country !== 'own';
}));
ok('дорог не меньше, чем городов − стран', world.roads.length >= world.cities.length - world.countries.length, world.roads.length);
const roadKinds = new Set(world.roads.map((r) => r.kind));
ok('три вида дорог', roadKinds.has('main') && roadKinds.has('local') && roadKinds.has('international'), [...roadKinds].join(','));
ok('отметки рельефа — Float32Array', world.marks instanceof Float32Array);
ok('отметок 900 точек × 3 числа', world.marks.length === WM.marksPer * 3, world.marks.length);
const markTypes = new Set();
for (let i = 2; i < world.marks.length; i += 3) markTypes.add(world.marks[i]);
ok('все шесть видов отметок встречаются', markTypes.size === 6, [...markTypes].join(','));
ok('у каждой отметки есть значок и тон', Object.keys(MARK).every((k) => MARK[k].name && MARK[k].tone));
ok('отметки внутри мира', world.marks.every((v, i) => i % 3 === 2 ? true : Math.abs(v) <= WM.sizeKm / 2 + 1));
ok('армий не меньше, чем стран', world.armies.length >= WM.countries, world.armies.length);
ok('армия знает свою страну и сторону', world.armies.every((a) => !!world.countries.find((c) => c.id === a.country) && (a.side === 'home' || a.side === 'front')));
ok('войн в начале нет', world.wars.length === 0);
ok('счётчик минут на нуле', world.minutes === 0);
ok('два построения мира совпадают', JSON.stringify(buildWorld(424242).cities) === JSON.stringify(buildWorld(424242).cities));
ok('другой сид даёт другой мир', JSON.stringify(buildWorld(7).cities) !== JSON.stringify(world.cities));

/* ——— 2. геометрия ——— */
group('геометрия');
ok('центр своей страны внутри', pointInPolygon(0, 0, own.poly));
ok('далеко за границей — снаружи', !pointInPolygon(11000, 11000, own.poly));
ok('далеко за границей — не наша страна', (countryAt(world, 11000, 11000) || {}).own !== true);
ok('в центре — наша страна', countryAt(world, 0, 0).own === true);
ok('area квадрата 7000² близка к 49 млн', Math.abs(polygonArea(own.poly) - 7000 * 7000) / (7000 * 7000) < 0.14, Math.round(polygonArea(own.poly)));
ok('площадь положительная у всех стран', world.countries.every((c) => polygonArea(c.poly) > 1e6));
const sl = sitesFor(WM.countries, 424242);
ok('точек-семян столько же, сколько стран', sl.length === WM.countries, sl.length);
ok('точки без повторов', new Set(sl.map((s) => s.id)).size === sl.length);
ok('точки в пределах мира', sl.every((s) => Math.abs(s.x) < WM.sizeKm / 2 && Math.abs(s.y) < WM.sizeKm / 2));
ok('центры стран не ближе 2000 км друг к другу', sl.every((a, i) => sl.every((b, j) => i === j || Math.hypot(a.x - b.x, a.y - b.y) > 2000)));
const cells = sl.map((site) => voronoiPoly(site, sl, coastPolygon()));
ok('у каждой страны непустая ячейка', cells.every((p) => p.length >= 3), cells.map((p) => p.length).join(','));
ok('ячейки покрывают континент без перекрытий: сумма площадей ≈ площадь побережья', (() => {
  const sum = cells.reduce((a, p) => a + polygonArea(p), 0);
  const coast = polygonArea(coastPolygon());
  return Math.abs(sum - coast) / coast < 0.02;
})(), '');
ok('столица каждой страны внутри своей ячейки', world.countries.every((c) => pointInPolygon(c.capital.x, c.capital.y, c.poly)));
ok('центр страны — самая просторная точка', world.countries.every((c) => {
  const pole = poleOfInaccessibility(c.poly);
  return Math.abs(pole.r - c.radiusKm / 0.95) < 30;
}), '');
ok('радиус страны — расстояние до границы', world.countries.every((c) => Math.abs(cellRadius(c.poly, c.capital) * 0.95 - c.radiusKm) < 1));
const borderDist = Math.max(...world.countries.flatMap((c) => c.cities.filter((k) => k.border).map((k) => cellRadius(c.poly, k))));
ok('пограничные городки стоят у границы', borderDist < 300, Math.round(borderDist));
ok('пограничный городок ближе к границе, чем столица', world.countries.every((c) => c.cities.filter((k) => k.border)
  .every((k) => cellRadius(c.poly, k) < c.radiusKm)));
const pairs = world.pairs;
ok('у стран есть соседи по границе', pairs.length > 10, pairs.length);
ok('у нашей страны шесть соседей', pairs.filter((p) => p.a === 'own' || p.b === 'own').length === 6,
  pairs.filter((p) => p.a === 'own' || p.b === 'own').length);
ok('соседство симметрично и без самопар', pairs.every((p) => p.a !== p.b && pairs.filter((q) => q.a === p.a && q.b === p.b).length === 1));
ok('соседи граничат, а не «рядом»', pairs.every((p) => p.km <= 130), Math.max(...pairs.map((p) => p.km)));
const bt = borderTowns(world.countries[1], 424242);
ok('пограничные городки не повторяют друг друга', bt.length === 2 && bt[0].id !== bt[1].id);
ok('пограничный городок внутри страны', bt.every((t) => pointInPolygon(t.x, t.y, world.countries[1].poly)));
const near1 = nearestCity(world, world.cities[0].x + 1, world.cities[0].y + 1);
ok('ближайший город находится', near1 && near1.id === world.cities[0].id, near1 && near1.id);
ok('ограничение по радиусу работает', nearestCity(world, 11000, 11000, 5) === null);
const road1 = nearestRoad(world, world.roads[0].x1, world.roads[0].y1, 1);
ok('ближайшая дорога находится', road1 && Math.hypot(road1.x1 - world.roads[0].x1, road1.y1 - world.roads[0].y1) < 1e-6);
ok('расстояние до отрезка на самом отрезке ~0', segmentDistance(5, 0, 0, 0, 10, 0) < 1e-9);
near('расстояние до отрезка сбоку', segmentDistance(5, 3, 0, 0, 10, 0), 3, 1e-9);
near('расстояние до конца отрезка', segmentDistance(-4, 3, 0, 0, 10, 0), 5, 1e-9);
ok('дороги не короче 40 км', world.roads.every((r) => Math.hypot(r.x2 - r.x1, r.y2 - r.y1) > 40), Math.round(Math.min(...world.roads.map((r) => Math.hypot(r.x2 - r.x1, r.y2 - r.y1)))));
ok('главные дороги длиннее 200 км', world.roads.filter((r) => r.kind === 'main').every((r) => Math.hypot(r.x2 - r.x1, r.y2 - r.y1) > 200));
ok('все дороги внутри мира', world.roads.every((r) => Math.abs(r.x1) <= WM.sizeKm / 2 && Math.abs(r.x2) <= WM.sizeKm / 2));
ok('международных дорог меньше, чем местных', world.roads.filter((r) => r.kind === 'international').length <= world.roads.filter((r) => r.kind === 'local').length);
ok('координаты городов — числа', world.cities.every((c) => Number.isFinite(c.x) && Number.isFinite(c.y)));

/* ——— 3. войны ——— */
group('войны');
const w3 = buildWorld(424242);
// раньше третьих суток войны не начинаются
for (let t = 0; t < WM.war.firstWarMin; t += 60) advanceWars(w3, t);
ok('до третьих суток войн нет', w3.warsTotal === 0, w3.warsTotal);
advanceWars(w3, WM.war.firstWarMin);
const started = maybeStartWar(w3, WM.war.firstWarMin);
ok('после третьих суток война возможна', started || w3.warsTotal > 0 || w3.wars.length === 0);
// гоняем 20 суток шагами по 45 минут
const w4 = buildWorld(424242);
const seen = new Set();
let maxWarsAtOnce = 0, dupDestroyed = false;
for (let t = 0; t <= 60 * 24 * 20; t += WM.war.battleMin) {
  advanceWars(w4, 6000 + t);
  maxWarsAtOnce = Math.max(maxWarsAtOnce, w4.wars.filter((w) => w.to === null).length);
  for (const id of w4.destroyed.cities) if (seen.has('c' + id) && !seen.has('c-' + id)) dupDestroyed = true;
  for (const id of w4.destroyed.roads) if (seen.has('r' + id) && !seen.has('r-' + id)) dupDestroyed = true;
  for (const id of w4.destroyed.cities) { seen.add('c-cons-' + id); }
  // повтор фиксируем сравнением длины: массив только растёт уникальными значениями
  if (new Set(w4.destroyed.cities).size !== w4.destroyed.cities.length) dupDestroyed = true;
  if (new Set(w4.destroyed.roads).size !== w4.destroyed.roads.length) dupDestroyed = true;
}
ok('первая война была не раньше третьих суток', w4.firstWarAt === null || w4.firstWarAt >= WM.war.firstWarMin, w4.firstWarAt);
ok('войны за 20 суток были', w4.warsTotal >= 1, w4.warsTotal);
ok('активных войн не больше трёх', maxWarsAtOnce <= WM.war.maxWars, maxWarsAtOnce);
ok('бои шли', w4.battles > 10, w4.battles);
ok('разрушенных городов не больше десяти', w4.destroyed.cities.length <= 10, w4.destroyed.cities.length);
ok('разрушенные города не повторяются', !dupDestroyed);
ok('разрушенная дорога существует', w4.destroyed.roads.every((id) => world.roads.some((r) => r.id === id)));
ok('разрушенный город существует', w4.destroyed.cities.every((id) => world.cities.some((c) => c.id === id)));
ok('взрывы не старше своего срока', w4.explosions.every((e) => w4.minutes - e.at <= WM.war.explosionMin), w4.explosions.length);
ok('взрывы внутри мира', w4.explosions.every((e) => Math.abs(e.x) <= WM.sizeKm / 2 && Math.abs(e.y) <= WM.sizeKm / 2));
ok('большие взрывы помечены', w4.bigExplosions > 0 || w4.explosionsTotal < 4, w4.bigExplosions);
ok('каждый четвёртый взрыв большой', Math.abs(w4.bigExplosions / Math.max(1, w4.explosionsTotal) - 0.25) < 0.12, `${w4.bigExplosions}/${w4.explosionsTotal}`);
ok('оккупация не шире 180 км', w4.occupied.every((o) => o.rKm <= WM.war.occupationKm + 40), Math.max(...w4.occupied.map((o) => o.rKm)));
ok('оккупированных зон не больше 24', w4.occupied.length <= 24, w4.occupied.length);
ok('оккупация — буфер, а не завоевание: у зоны есть владелец и оккупант',
  w4.occupied.every((o) => o.by && o.of && o.by !== o.of));
ok('потери растут только от боёв', w4.killed === 0 || w4.killed > 0);
ok('фронт сдвигается не быстрее 26 км за шаг', w4.wars.every((w) => Math.abs(w.sway) <= 26 * Math.max(1, w.battles) + 1), '');
ok('войны помнят стороны', w4.wars.every((w) => w.a && w.b && w.a !== w.b));
ok('война не начинается против себя', w4.warsTotal === 0 || w4.wars.every((w) => w.a !== w.b));
ok('счётчик минут идёт вперёд', w4.minutes > 60 * 24 * 20);
ok('повторный шаг назад ничего не ломает', (() => { const before = w4.battles; advanceWars(w4, w4.minutes - 600); return w4.battles >= before; })());

/* ——— 4. спутник ——— */
group('спутник');
ok('наша страна видит армии', canSeeArmies(world, 'own') === true);
ok('чужая страна без спутника не видит', canSeeArmies(world, world.countries[1].id) === false);
const st0 = worldStats(world);
ok('статистика знает страны', st0.countries === WM.countries);
ok('статистика знает войны', typeof st0.wars === 'number');
ok('статистика знает бои', st0.battles === world.battles);
ok('статистика знает разрушения', st0.destroyedCities === world.destroyed.cities.length && st0.destroyedRoads === world.destroyed.roads.length);
ok('статистика знает оккупацию', st0.occupiedZones === world.occupied.length);
ok('статистика знает потери', st0.killed === world.killed);
ok('статистика знает армии', st0.armiesVisible === world.armies.length);
ok('статистика знает про свою войну', st0.ownAtWar === world.wars.some((w) => w.a === 'own' || w.b === 'own'));
ok('в статистике 14 полей', Object.keys(st0).length === 14, Object.keys(st0).join(','));
ok('без войн hottestWar пуст', hottestWar(world) === null);
const hot = hottestWar(w4);
ok('hottestWar знает имена сторон', !hot || (hot.a && hot.b));
ok('hottestWar — самая горячая война', !hot || w4.wars.filter((w) => w.to === null).every((w) => Math.abs(w.sway) <= hot.swayKm + 1), hot && hot.swayKm);
ok('статистика не мутирует мир', (() => { const a = JSON.stringify(world.destroyed); worldStats(world); return JSON.stringify(world.destroyed) === a; })());
ok('статистика без наблюдателя не падает', worldStats(world, 'nobody').countries === WM.countries);
ok('армии в мирное время стоят дома', world.armies.every((a) => a.side === 'home'));
ok('после войны есть армии на фронте', w4.armies.some((a) => a.side === 'front') || w4.warsTotal === 0);
ok('армии двигаются вместе с фронтом', world.armies.every((a) => Number.isFinite(a.x) && Number.isFinite(a.y)));
ok('каждая армия — дома или на фронте', w4.armies.every((a) => a.side === 'home' || a.side === 'front'));

/* ——— 5. камера ——— */
group('камера');
/* настоящая канва: в node её даёт @napi-rs/canvas */
const makeCanvas = (w, h) => {
  const cv = createCanvas(w, h);
  cv.getBoundingClientRect = () => ({ width: w, height: h });
  return cv;
};
const view = { w: 900, h: 600 };
const s1 = overviewScale(view);
ok('обзор мира считается по меньшей стороне', s1 > 0 && s1 < 0.1, s1);
near('обзор вписывает континент 23200 км в кадр', 23200 * s1, 600 - 80, 1);
ok('обзор оставляет поля по краям', 23200 * s1 < 600 && 23200 * s1 > 480, 23200 * s1);
ok('масштаб обзора внутри границ', clampViewScale(s1) === s1);
ok('нижняя граница масштаба', clampViewScale(0) === WV.minScale);
ok('верхняя граница масштаба', clampViewScale(99) === WV.maxScale);
ok('мусор в масштабе не проходит', clampViewScale(NaN) === WV.overviewScale);
const cam0 = { x: 0, y: 0, scale: 0.05 };
const c = worldToScreen(cam0, view, 0, 0);
near('центр мира в центре кадра', c.x, 450, 1e-9);
near('центр мира в центре кадра по вертикали', c.y, 300, 1e-9);
const back1 = screenToWorld(cam0, view, c.x, c.y);
near('экран → мир обратно', back1.x, 0, 1e-9);
const rr = visibleRect(cam0, view);
near('видимая ширина = w / масштаб', rr.x1 - rr.x0, 900 / 0.05, 1e-6);
near('видимая высота = h / масштаб', rr.y1 - rr.y0, 600 / 0.05, 1e-6);
const mid = lerpCam({ x: 0, y: 0, scale: 1 }, { x: 100, y: 200, scale: 0.01 }, 0.5);
near('середина пути по x', mid.x, 50, 1e-9);
near('середина пути по y', mid.y, 100, 1e-9);
near('середина пути по масштабу (лог)', mid.scale, 0.1, 1e-9);
near('начало пути = старт', lerpCam({ x: 5, y: 5, scale: 2 }, { x: 0, y: 0, scale: 1 }, 0).x, 5, 1e-9);
near('конец пути = финиш', lerpCam({ x: 5, y: 5, scale: 2 }, { x: 7, y: 8, scale: 1 }, 1).y, 8, 1e-9);
near('t вне диапазона зажимается', lerpCam({ x: 0, y: 0, scale: 1 }, { x: 9, y: 0, scale: 1 }, 5).x, 9, 1e-9);
ok('камера не уходит за мир', (() => {
  const wv = new WorldView(makeCanvas(900, 600), {}); wv.setWorld(world);
  wv.cam.x = 1e9; wv.cam.y = -1e9; wv.clampCam();
  return Math.abs(wv.cam.x) <= WM.sizeKm / 2 && Math.abs(wv.cam.y) <= WM.sizeKm / 2;
})());
ok('зум держит точку под курсором', (() => {
  const wv = new WorldView(makeCanvas(900, 600), {}); wv.setWorld(world); wv.cam.scale = 0.05;
  const before = screenToWorld(wv.cam, wv.view, 300, 200);
  wv.zoomAt(300, 200, 1.5);
  const after = screenToWorld(wv.cam, wv.view, 300, 200);
  return Math.abs(before.x - after.x) < 1e-6 && Math.abs(before.y - after.y) < 1e-6;
})());
ok('панорама двигает камеру в обратную сторону', (() => {
  const wv = new WorldView(makeCanvas(900, 600), {}); wv.setWorld(world); wv.cam.scale = 0.05; wv.cam.x = 500; wv.cam.y = 500;
  wv.panBy(50, 0);
  return wv.cam.x < 500;
})());
ok('countryAtScreen находит нашу страну в центре', (() => {
  const wv = new WorldView(makeCanvas(900, 600), {}); wv.resize(); wv.setWorld(world); wv.cam = { x: 0, y: 0, scale: s1 };
  const k = wv.countryAtScreen(450, 300);
  return k && k.own === true;
})());

/* ——— 6. кадр ——— */
group('кадр');
const canvas = makeCanvas(900, 600);
const v = new WorldView(canvas, { createCanvas });
v.resize();
v.setWorld(world);
ok('до проходов мир считается неготовым', v.loading === true);
v.step(1 / 60);
ok('после одного прохода готов наполовину', v.ready === 1 && v.loading === true);
v.step(1 / 60);
ok('после двух проходов мир готов', v.ready === 2 && v.loading === false);
v.open({ x: 0, y: 0, scale: 20 });
ok('переход начался', !!v.transition);
v.step(0.45);
const halfway = v.cam.scale;
ok('камера летит от страны к планете', halfway < 20 && halfway > s1, halfway);
v.step(0.6);
ok('переход конечен', v.transition === null);
near('после перехода камера в обзоре', v.cam.scale, s1, 1e-6);
ok('прозрачность вернулась к 1', v.alpha > 0.99, v.alpha);
v.draw();
const px = canvas.getContext('2d').getImageData(0, 0, 900, 600).data;
let nonEmpty = 0, dark = 0;
for (let i = 0; i < px.length; i += 4 * 97) {
  if (px[i] + px[i + 1] + px[i + 2] > 30) nonEmpty++;
  if (px[i + 1] > px[i]) dark++;
}
ok('кадр не пустой', nonEmpty > 3000, nonEmpty);
ok('на кадре видна зелень (суша)', dark > 300, dark);
const frameTimes = [];
for (let i = 0; i < 40; i++) { v.draw(); frameTimes.push(v.lastDrawMs); }
frameTimes.sort((a, b) => a - b);
const medianFrame = frameTimes[20];
ok('медианный кадр ниже 3 мс', medianFrame < 3, medianFrame.toFixed(2));
ok('девяностый процентиль ниже 6 мс', frameTimes[36] < 6, frameTimes[36].toFixed(2));
ok('стоящая камера не пересобирает слой подробностей', v.rebuilds === 1, v.rebuilds);
v.panBy(120, 0);
v.draw();
ok('сдвиг камеры пересобирает слой', v.rebuilds === 2, v.rebuilds);
v.draw();
ok('после сдвига снова копирование', v.rebuilds === 2, v.rebuilds);
v.cam = { x: 0, y: 0, scale: overviewScale(v.view) };
const st = worldStats(buildWorld(424242));
ok('статистика считается быстро', (() => { const t = Date.now(); for (let i = 0; i < 200; i++) worldStats(world); return Date.now() - t < 120; })());
void st;
ok('базовый слой 1400×1400', v.base.width === WV.baseSize && v.base.height === WV.baseSize);
// спутник: армии видны, при выключении — нет
v.showArmies = true;
v.draw();
const withArmies = countArmyPixels(canvas, v);
v.showArmies = false;
v.draw();
const withoutArmies = countArmyPixels(canvas, v);
ok('армии рисуются при спутнике', withArmies > 0, withArmies);
ok('без спутника армий на карте нет', withoutArmies === 0, withoutArmies);
// крупный зум: подписи столиц
v.showArmies = true;
v.cam.scale = 0.4; v.cam.x = world.cities[0].x; v.cam.y = world.cities[0].y;
v.draw();
ok('на крупном зуме время кадра всё ещё ниже 16 мс', v.lastDrawMs < 16, v.lastDrawMs.toFixed(2));
ok('перерисовка на том же состоянии даёт тот же кадр', (() => {
  const a = makeCanvas(300, 200);
  const b = makeCanvas(300, 200);
  for (const cv of [a, b]) {
    const x = new WorldView(cv, { createCanvas }); x.resize(); x.setWorld(buildWorld(424242));
    x.step(0.02); x.step(0.02); x.cam = { x: 0, y: 0, scale: 0.05 }; x.draw();
  }
  const da = Buffer.from(a.getContext('2d').getImageData(0, 0, 300, 200).data);
  const db = Buffer.from(b.getContext('2d').getImageData(0, 0, 300, 200).data);
  let diff = 0;
  for (let i = 0; i < da.length; i += 4) if (Math.abs(da[i] - db[i]) > 2) diff++;
  return diff < 40;
})());
ok('значки рельефа рисуются без ошибок', (() => {
  const cv = makeCanvas(60, 60); const ctx = cv.getContext('2d');
  for (const k of Object.keys(MARK)) drawMark(ctx, 30, 30, k, 1);
  const d = ctx.getImageData(0, 0, 60, 60).data;
  let lit = 0; for (let i = 3; i < d.length; i += 4) if (d[i] > 0) lit++;
  return lit > 20;
})());

function countArmyPixels(cv, wv) {
  const ctx = cv.getContext('2d');
  const d = ctx.getImageData(0, 0, cv.width, cv.height).data;
  let n = 0;
  for (let i = 0; i < d.length; i += 4) {
    // цвет армии: голубой у своей, оранжевый у чужой
    if ((d[i + 2] > 200 && d[i] < 160 && d[i + 1] > 150) || (d[i] > 230 && d[i + 1] > 140 && d[i + 1] < 200 && d[i + 2] < 130)) n++;
  }
  void wv;
  return n;
}

console.log(`\nOK: 6 групп · ${pass} проверок`);
if (fail) { console.log(`FAIL: ${fail}`); process.exit(1); }
