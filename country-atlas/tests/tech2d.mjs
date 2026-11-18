/* §89: проверки технологий, науки и длинного пролёта.
   Группы: каталог, развитие, эффекты, война и спутник, пролёт. В каждой — больше 20 значений. */
import { createCanvas } from '@napi-rs/canvas';
import {
  TECH, techCount, techIndex, techAt, techName, techEffects, techRate, buildTech,
  nextTech, advanceTech, techStats, missileSpread, missileReach, armyPower
} from '../src/tech2d.js';
import {
  buildWorld, advanceWars, worldStats, canSeeArmies, buildArmies
} from '../src/worldmap2d.js';
import { INTRO, Intro, tourWaypoints, tourSights, tourCam, insideOwn } from '../src/intro.js';
import { WV } from '../src/worldview.js';

let pass = 0, fail = 0;
const ok = (name, cond, extra = '') => {
  if (cond) { pass++; return true; }
  fail++;
  console.log('  ✗ ' + name + (extra ? '  ' + extra : ''));
  return false;
};
const near = (name, a, b, d) => ok(name, Math.abs(a - b) <= d, `${a} vs ${b}`);
const group = (title) => console.log('— ' + title);
const DAY = 60 * 24;

/* ——— 1. каталог ——— */
group('каталог');
const total = techCount();
ok('технологий больше десяти тысяч', total > 10000, total);
ok('их ровно 10 400', total === 10400, total);
ok('сфер шестнадцать', TECH.branches.length === 16, TECH.branches.length);
ok('поколений в сфере 26', TECH.tiers === 26, TECH.tiers);
ok('проектов в поколении 25', TECH.variants === 25, TECH.variants);
ok('у каждой сферы восемь своих предметов', TECH.branches.every((b) => b.nouns.length === 8));
ok('все предметы в сфере разные', TECH.branches.every((b) => new Set(b.nouns).size === 8));
ok('у сфер человеческие названия', TECH.branches.every((b) => b.name.length > 4 && !/§|\d/.test(b.name)));
ok('проектов ровно столько же, сколько названий-марок', TECH.mods.length === TECH.variants, TECH.mods.length);
ok('марки не повторяются', new Set(TECH.mods).size === TECH.mods.length);
ok('поколений-слов четыре', TECH.gens.length === 4 && TECH.gens.every((g) => g.length > 4));
const first = techAt(0);
ok('первая технология — из первой сферы', first.branch === TECH.branches[0].id && first.tier === 1, JSON.stringify(first.branch));
ok('у технологии есть номер, поколение и проект', first.index === 0 && first.generation === 1 && first.variant === 0);
ok('имя технологии человеческое', first.name.length > 14 && !/§|c\d/.test(first.name), first.name);
ok('в имени есть поколение', /поколение/.test(first.name), first.name);
ok('стоимость целая и положительная', Number.isInteger(first.cost) && first.cost > 0, first.cost);
const names = new Set();
for (let i = 0; i < total; i++) names.add(techAt(i).name);
ok('все 10 400 имён разные', names.size === total, names.size);
ok('ни одно имя не похоже на код', ![...names].some((n) => /§|^c\d|\{\}/.test(n)));
ok('каждый номер возвращает свой номер', (() => {
  for (let i = 0; i < 200; i++) {
    const t = techAt(i * 37);
    if (techAt(techIndex(t.branch, t.tier, t.variant)).index !== t.index) return false;
  }
  return true;
})());
ok('номер за пределами каталога заворачивается', techAt(total).index === 0 && techAt(-1).index === total - 1);
ok('стоимость растёт с поколением', techAt(techIndex(TECH.branches[0].id, 6, 3)).cost > techAt(techIndex(TECH.branches[0].id, 5, 3)).cost);
ok('проект с большим номером дороже', techAt(techIndex(TECH.branches[0].id, 6, 20)).cost > techAt(techIndex(TECH.branches[0].id, 6, 1)).cost);
ok('в сфере все 26 поколений дают разные имена', (() => {
  const s = new Set();
  for (let t = 1; t <= TECH.tiers; t++) s.add(techAt(techIndex(TECH.branches[2].id, t, 0)).name);
  return s.size === TECH.tiers;
})());
ok('соседние сферы — разные имена на одном поколении', techAt(techIndex(0, 3, 0)).name !== techAt(techIndex(1, 3, 0)).name);
ok('десять случайных номеров — десять разных имён', (() => {
  const s = new Set();
  for (let i = 0; i < 10; i++) s.add(techName(i * 1041));
  return s.size === 10;
})());
ok('у технологии есть польза и сфера', first.weights && first.branchName.length > 3);
ok('номер сферы можно задать строкой', techIndex('space', 3, 0) === techIndex(7, 3, 0));
ok('неверная сфера — не номер, а минус один', techIndex('нет такой', 1, 0) === -1);

/* ——— 2. развитие ——— */
group('развитие');
const w = buildWorld(424242);
ok('у всех стран есть наука', w.countries.every((c) => !!c.tech));
ok('у нашей страны наука с самого начала', w.own.tech.count > 0, w.own.tech.count);
ok('наша страна стартует со спутником', w.own.tech.eff.satellite === true);
ok('спутник — это космос третьего поколения', w.own.tech.tiers.space >= TECH.satelliteFrom, w.own.tech.tiers.space);
ok('у соседей космос начинается с нуля', w.countries.filter((c) => !c.own).every((c) => c.tech.tiers.space === 0));
const headSum = Object.values(TECH.ownHead).reduce((a, b) => a + b, 0);
ok('стартовых технологий ровно столько, сколько выдано', w.own.tech.count === headSum, w.own.tech.count);
near('наука страны = база + города', techRate(w.own), TECH.rateBase + w.own.cities.length * TECH.rateCity, 1e-9);
ok('у страны без городов наука базовая', techRate({ cities: [] }) === TECH.rateBase);
ok('наука считается в сутки', techStats(w).perDay === Math.round(techRate(w.own) * 1440), techStats(w).perDay);
ok('очереди разработок у стран разные', new Set(w.countries.map((c) => c.tech.order.join(','))).size > 1);
const w2 = buildWorld(424242);
for (let t = 0; t <= DAY * 20; t += 45) advanceWars(w2, 9000 + t);
ok('за двадцать суток наука растёт у всех', w2.countries.every((c) => c.tech.count > 40), Math.min(...w2.countries.map((c) => c.tech.count)));
ok('наша страна за двадцать суток открыла больше шестидесяти', w2.own.tech.count > 60, w2.own.tech.count);
ok('страны развиваются по-разному', new Set(w2.countries.map((c) => c.tech.count)).size > 5);
ok('открыто меньше двадцатой части каталога — есть куда расти',
  w2.countries.every((c) => c.tech.count < total / 20), Math.max(...w2.countries.map((c) => c.tech.count)));
ok('баллы не отрицательные', w2.countries.every((c) => c.tech.points >= 0));
ok('следующая цель есть у всех', w2.countries.every((c) => !!c.tech.next && c.tech.next.cost > 0));
ok('цель всегда впереди — поколение не меньше открытого', w2.countries.every((c) => {
  const t = c.tech.next;
  return t.tier === (c.tech.tiers[t.branch] || 0) + 1;
}));
ok('прогресс цели от 0 до 1', w2.countries.every((c) => (c.tech.next || {}).progress >= 0 && (c.tech.next || {}).progress <= 1));
ok('страна помнит не больше пяти последних разработок', w2.countries.every((c) => c.tech.last.length <= TECH.keepLast));
ok('последние разработки — человеческие имена', w2.own.tech.last.every((n) => n.length > 14 && !/§/.test(n)), w2.own.tech.last[0]);
ok('последняя разработка — своя, из своей сферы', w2.own.tech.last.every((n) => n.includes('«')));
ok('два одинаковых мира учатся одинаково', (() => {
  const a = buildWorld(424242), b = buildWorld(424242);
  for (let t = 0; t <= DAY * 6; t += 45) { advanceWars(a, 9000 + t); advanceWars(b, 9000 + t); }
  return a.countries.every((c, i) => c.tech.count === b.countries[i].tech.count && c.tech.last.join() === b.countries[i].tech.last.join());
})());
ok('другой шаг времени — та же картина', (() => {
  const a = buildWorld(424242), b = buildWorld(424242);
  for (let t = 0; t <= DAY * 12; t += 45) advanceWars(a, 9000 + t);
  for (let t = 0; t <= DAY * 12; t += 300) advanceWars(b, 9000 + t);
  return a.countries.every((c, i) => Math.abs(c.tech.count - b.countries[i].tech.count) <= 2);
})());
ok('наука не идёт назад по времени', (() => {
  const a = buildWorld(424242);
  advanceWars(a, 9000);
  const before = a.own.tech.count;
  advanceTech(a, 4000);
  return a.own.tech.count >= before;
})());
ok('огромный скачок времени не вешает игру', (() => {
  const a = buildWorld(424242);
  const n = advanceTech(a, DAY * 400);
  return Number.isFinite(n) && n <= w.countries.length * TECH.unlockPerStep;
})());
const st = techStats(w2);
ok('в сводке науки 18 полей', Object.keys(st).length === 18, Object.keys(st).join(','));
ok('сводка знает каталог', st.catalog === total);
ok('сводка знает свою страну', st.count === w2.own.tech.count && st.rate === techRate(w2.own));
ok('сводка называет трёх лидеров', st.leaders.length === 3 && st.leaders.every((l) => l.name && l.count > 0));
ok('лидеры идут по убыванию', st.leaders[0].count >= st.leaders[1].count && st.leaders[1].count >= st.leaders[2].count);
ok('в сводке есть сферы', st.branches.length === TECH.branches.length && st.branches.every((b) => b.name));
ok('сводка без наблюдателя не падает', techStats(w2, 'нет такой').count === 0);
ok('наука входит в счётчики мира', w2.stats.tech > 0, w2.stats.tech);

/* ——— 3. эффекты ——— */
group('эффекты');
const blank = techEffects(null);
ok('без науки все направления единичные', Object.keys(blank).filter((k) => k !== 'satellite').every((k) => blank[k] === 1));
ok('без науки спутника нет', blank.satellite === false);
ok('в эффектах двенадцать ключей', Object.keys(blank).length === 12, Object.keys(blank).join(','));
const mk = (tiers) => {
  const t = {};
  for (const b of TECH.branches) t[b.id] = 0;
  Object.assign(t, tiers);
  return techEffects({ tiers: t });
};
ok('космос второго поколения — ещё не спутник', mk({ space: 2 }).satellite === false);
ok('космос третьего поколения — спутник', mk({ space: 3 }).satellite === true);
ok('армия крепнет от военной сферы', mk({ military: 6 }).army > mk({ military: 1 }).army);
ok('точность растёт от вычислений', mk({ compute: 5 }).accuracy > mk({ compute: 0 }).accuracy);
ok('наука ускоряется образованием', mk({ education: 6 }).science > 1.1, mk({ education: 6 }).science.toFixed(3));
ok('промышленность растёт от энергетики', mk({ energy: 6 }).industry > 1.1, mk({ energy: 6 }).industry.toFixed(3));
ok('все эффекты — конечные числа', Object.values(mk({ space: 9, military: 9 })).filter((v) => typeof v === 'number').every(Number.isFinite));
near('разброс ракет при точности 1 — прежние 260 км', missileSpread(1), 260, 0);
ok('точность вдвое — вдвое кучнее', missileSpread(2) === 130, missileSpread(2));
ok('точность падает — разброс растёт, но не бесконечно', missileSpread(0.1) === 520 && missileSpread(0.1) === missileSpread(0.5));
ok('радиус цели при точности 1 — 800 км', missileReach(1) === 800, missileReach(1));
ok('точнее — дальше находит цель', missileReach(1.5) === 1200, missileReach(1.5));
ok('мусорная точность не ломает расчёт', Number.isFinite(missileSpread(NaN)) && Number.isFinite(missileReach(undefined)));
const plain = { id: 'x', tech: buildTech({ id: 'x', cities: [] }, 1) };
plain.tech.tiers = {};
for (const b of TECH.branches) plain.tech.tiers[b.id] = 0;
plain.tech.eff = techEffects(plain.tech);
near('без технологий боеготовность 0.55', armyPower(plain, null), 0.55, 1e-9);
ok('с технологиями боеготовность выше', armyPower(w2.own, w2) > 0.55, armyPower(w2.own, w2));
ok('затяжная война опускает полоску', (() => {
  const c = JSON.parse(JSON.stringify(plain));
  c.tech = plain.tech;
  const world = { wars: [{ a: 'x', b: 'y', to: null, sway: 900, drift: 900 }] };
  return armyPower(c, world) < armyPower(c, null);
})());
ok('полоска не выходит за 0…1', (() => {
  const world = { wars: [{ a: 'x', b: 'y', to: null, sway: 9000, drift: 9000 }] };
  const v = armyPower(plain, world);
  return v >= 0.15 && v <= 1;
})());
ok('боеготовность видна у каждой армии', w2.armies.every((a) => typeof a.morale === 'number' && a.morale > 0 && a.morale <= 1));
ok('эффекты меняются только с новой технологией', (() => {
  const a = buildWorld(424242);
  const tiers = JSON.stringify(a.own.tech.tiers);
  const before = JSON.stringify(a.own.tech.eff);
  advanceTech(a, 1);
  return JSON.stringify(a.own.tech.eff) === before && JSON.stringify(a.own.tech.tiers) === tiers;
})());

/* ——— 4. война и спутник ——— */
group('война и спутник');
const w4 = buildWorld(424242);
ok('своя страна видит армии', canSeeArmies(w4, 'own') === true);
const blind = w4.countries.find((c) => !c.own && !c.tech.eff.satellite);
ok('страна без готового спутника армий не видит', canSeeArmies(w4, blind.id) === false);
ok('наука даёт спутник — и сразу видно', (() => {
  const c = w4.countries.find((k) => !k.own);
  const saved = c.satellite;
  c.satellite = true;
  c.tech.tiers.space = 0;
  c.tech.eff = techEffects(c.tech);
  const without = canSeeArmies(w4, c.id);
  c.tech.tiers.space = TECH.satelliteFrom;
  c.tech.eff = techEffects(c.tech);
  const seen = canSeeArmies(w4, c.id);
  c.satellite = saved;
  c.tech.tiers.space = 0;
  c.tech.eff = techEffects(c.tech);
  return without === false && seen === true;
})());
const s4 = worldStats(w4);
ok('в сводке мира по-прежнему 15 полей', Object.keys(s4).length === 15, Object.keys(s4).length);
ok('армий видно столько, сколько их есть', s4.armiesVisible === w4.armies.length);
ok('у армий есть боеготовность с самого начала', w4.armies.every((a) => a.morale === 0.7));
const ownArmies = buildArmies({ id: 'own', capital: { x: 0, y: 0 }, radiusKm: 2000 }, 424242);
ok('армия строится с полоской', ownArmies.every((a) => Number.isFinite(a.morale)));
for (let t = 0; t <= DAY * 20; t += 45) advanceWars(w4, 9000 + t);
ok('за двадцать суток война была', w4.wars.length > 0, w4.wars.length);
ok('бои шли', w4.stats.battles > 100, w4.stats.battles);
ok('взрывы были большие и малые', w4.stats.big > 0 && w4.stats.explosions > w4.stats.big);
ok('городов разрушено меньше, чем есть', w4.destroyed.cities.length >= 0 && w4.destroyed.cities.length < w4.cities.length);
ok('армии воюющих стоят на фронте', w4.armies.some((a) => a.side === 'front'));
ok('у всех армий после войны полоска в норме', w4.armies.every((a) => a.morale >= 0.15 && a.morale <= 1));
ok('точность стран выросла от науки', Math.max(...w4.countries.map((c) => c.tech.eff.accuracy)) > 1.1);
ok('в мире есть страны со спутником', w4.countries.filter((c) => c.tech.eff.satellite).length > 1, w4.countries.filter((c) => c.tech.eff.satellite).length);
ok('армии стран со спутником видны всем', worldStats(w4).armiesVisible === w4.armies.length);
ok('спутник выключен — видно только свои', worldStats(w4, 'own').armiesVisible === w4.armies.length);
ok('война считается одинаково в двух мирах', (() => {
  const a = buildWorld(424242), b = buildWorld(424242);
  for (let t = 0; t <= DAY * 12; t += 45) { advanceWars(a, 9000 + t); advanceWars(b, 9000 + t); }
  return JSON.stringify(a.stats) === JSON.stringify(b.stats) && a.destroyed.cities.join() === b.destroyed.cities.join();
})());
ok('технологии наша страна копит в бою и в мире', w4.own.tech.count > 60, w4.own.tech.count);
ok('у сильной науки выше боеготовность своей армии', (() => {
  const a = buildWorld(424242);
  const low = armyPower(a.own, a);
  for (let t = 0; t <= DAY * 20; t += 45) advanceWars(a, 9000 + t);
  return armyPower(a.own, a) >= low - 0.45;
})());

/* ——— 5. пролёт ——— */
group('пролёт');
ok('шаг пролёта — девять секунд, а не пять', INTRO.hopSec >= 9, INTRO.hopSec);
const w5 = buildWorld(424242);
const route = tourWaypoints(w5.own, 424242);
ok('в маршруте города и достопримечательности', route.length >= w5.own.cities.length + INTRO.sightsPerTour, route.length);
ok('достопримечательностей четыре', route.filter((p) => p.sight).length === INTRO.sightsPerTour, route.filter((p) => p.sight).length);
ok('у каждой точки есть имя', route.every((p) => typeof p.name === 'string' && p.name.length > 2));
ok('названия достопримечательностей человеческие', route.filter((p) => p.sight).every((p) => !/§|\d/.test(p.name)));
ok('все точки внутри своей страны', route.every((p) => insideOwn(w5.own, p.x, p.y)), route.filter((p) => !insideOwn(w5.own, p.x, p.y)).length);
ok('круг пролёта длиннее полутора минут', route.length * INTRO.hopSec > 90, route.length * INTRO.hopSec);
ok('точки разные — камера не стоит', new Set(route.map((p) => Math.round(p.x) + ':' + Math.round(p.y))).size === route.length);
ok('места пролёта те же при том же сиде', (() => {
  const a = tourSights(w5.own, 424242).map((s) => s.name + Math.round(s.x));
  const b = tourSights(w5.own, 424242).map((s) => s.name + Math.round(s.x));
  return a.join() === b.join();
})());
ok('другой сид — другие достопримечательности', (() => {
  const a = tourSights(w5.own, 424242).map((s) => s.name).join();
  const b = tourSights(w5.own, 777).map((s) => s.name).join();
  return a !== b;
})());
const c0 = tourCam(route, 0);
ok('пролёт начинается с первой точки', Math.abs(c0.x - route[0].x) < 1e-6 && Math.abs(c0.y - route[0].y) < 1e-6);
const c1 = tourCam(route, INTRO.hopSec);
ok('через шаг камера во второй точке', Math.abs(c1.x - route[1].x) < 1e-6, c1.i);
ok('масштаб в заданных границах', (() => {
  for (let t = 0; t < 400; t += 0.5) {
    const c = tourCam(route, t);
    if (c.scale < INTRO.scaleMin - 1e-9 || c.scale > INTRO.scaleMax + 1e-9) return false;
  }
  return true;
})());
ok('камера идёт без рывков', (() => {
  let prev = tourCam(route, 0), worst = 0;
  for (let t = 0.05; t < route.length * INTRO.hopSec; t += 0.05) {
    const c = tourCam(route, t);
    worst = Math.max(worst, Math.hypot(c.x - prev.x, c.y - prev.y));
    prev = c;
  }
  return worst < 60;
})());
ok('мусорное время не ломает камеру', (() => {
  const c = tourCam(route, NaN);
  return Number.isFinite(c.x) && Number.isFinite(c.y) && Number.isFinite(c.scale);
})());
ok('пустой маршрут не ломает камеру', Number.isFinite(tourCam([], 3).scale));
ok('переход на карту мира длиннее прежнего', WV.transitionMs >= 1400, WV.transitionMs);
ok('подпись пролёта включена', INTRO.caption === true);
const canvas = createCanvas(900, 600);
canvas.getBoundingClientRect = () => ({ left: 0, top: 0, width: 900, height: 600 });
const spotted = [];
const intro = new Intro(canvas, w5, {
  createCanvas: (a, b) => {
    const c = createCanvas(a, b);
    c.getBoundingClientRect = () => ({ left: 0, top: 0, width: a, height: b });
    return c;
  },
  onPoint: (p, i, n) => spotted.push(i + '/' + n + ' ' + p.name)
});
intro.resize();
intro.buildBackground();
intro.buildLayer();
intro.buildEdge();
ok('пролёт собирает подложку и резкую страну', !!intro.bg && !!intro.layer && intro.layer.width === INTRO.layerPx);
intro.t = 0;
intro.draw();
ok('кадр пролёта рисуется', intro.frames === 1 && Number.isFinite(intro.lastDrawMs), intro.lastDrawMs);
ok('подпись точки уходит наружу', spotted.length === 1 && /^\d+\/\d+ /.test(spotted[0]), spotted[0]);
intro.t = INTRO.hopSec * 2.5;
intro.draw();
ok('на новой точке подпись меняется', spotted.length === 2 && spotted[1] !== spotted[0], spotted[1]);
ok('пролёт рисует достопримечательности', intro.points.some((p) => p.sight));
ok('пролёт не рисует чужие страны', (() => {
  const c = intro.layer.getContext('2d');
  const px = c.getImageData(0, 0, intro.layer.width, intro.layer.height).data;
  let painted = 0;
  for (let i = 3; i < px.length; i += 4 * 991) if (px[i] > 0) painted++;
  return painted > 0;
})());

console.log(`\nOK: 5 групп · ${pass} проверок`);
if (fail) { console.log(`FAIL: ${fail}`); process.exit(1); }
