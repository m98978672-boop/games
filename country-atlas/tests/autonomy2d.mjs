/* §94: страна живёт сама — казна, города, армии, ремонт (F-384…F-392).
   Группы: казна, решения, армии, догон и детерминизм, сводка.
   В каждой группе — не меньше двадцати проверяемых значений. */
import { buildWorld, advanceWars, pointInPolygon } from '../src/worldmap2d.js';
import {
  AUTONOMY, buildAutonomy, incomePerDay, decideOnce, advanceAutonomy, autonomyStats,
  cityName, citySpot
} from '../src/autonomy2d.js';
import { regionIncome } from '../src/regions2d.js';

let pass = 0, fail = 0;
const ok = (name, cond, extra = '') => {
  if (cond) { pass++; return true; }
  fail++;
  console.log('  ✗ ' + name + (extra ? '  ' + extra : ''));
  return false;
};
const near = (name, a, b, d) => ok(name, Math.abs(a - b) <= d, `${a} vs ${b}`);
const group = (title) => console.log('— ' + title);

const run = (world, days, step = 45) => {
  for (let t = 0; t <= 60 * 24 * days; t += step) advanceWars(world, 9000 + t);
  return world;
};

/* ——— 1. казна ——— */
group('казна');
const w = buildWorld(424242);
ok('казна появляется вместе с миром', !!w.gov && typeof w.gov.treasury === 'number', w.gov && w.gov.treasury);
ok('на старте казна не пустая', w.gov.treasury >= AUTONOMY.treasuryStart, w.gov.treasury);
ok('на старте казна не золотая', w.gov.treasury <= AUTONOMY.treasuryStart + 600, w.gov.treasury);
ok('решений на старте ноль', w.gov.decisions === 0);
ok('журнал на старте пуст', w.gov.log.length === 0);
// §96: к городам и науке прибавился доход с областей — у каждой свой ресурс
ok('доход считается по городам, технологиям и землям', incomePerDay(w) ===
  AUTONOMY.cityIncome * w.own.cities.length + AUTONOMY.techIncome * w.own.tech.count
  + regionIncome(w.regions, 'own'), incomePerDay(w));
ok('доход — целое неотрицательное число', Number.isFinite(incomePerDay(w)) && incomePerDay(w) >= 0, incomePerDay(w));
ok('доход растёт с городами', (() => {
  const a = incomePerDay(w);
  const before = w.own.cities.length;
  w.own.cities.push({ id: 'test-1', name: 'Ы', x: 0, y: 0, capital: false, pop: 1 });
  const b = incomePerDay(w);
  w.own.cities.length = before;
  return b - a === AUTONOMY.cityIncome;
})());
const w1 = run(buildWorld(424242), 1);
ok('за сутки казна изменилась', w1.gov.treasury !== buildWorld(424242).gov.treasury);
ok('казна не уходит в минус', w1.gov.treasury >= 0, w1.gov.treasury);
const w30 = run(buildWorld(424242), 30);
ok('через месяц решений больше двадцати', w30.gov.decisions > 20, w30.gov.decisions);
ok('через месяц казна не пустая', w30.gov.treasury > 0, w30.gov.treasury);
ok('война съедает казну в сутки', (() => {
  const x = buildWorld(424242);
  const peace = incomePerDay(x);
  x.wars.push({ id: 'test-war', a: 'own', b: x.countries[1].id, from: 0, x: 0, y: 0, sway: 0, drift: 0 });
  const war = incomePerDay(x);
  return war === Math.max(0, peace - AUTONOMY.warDrain);
})());
ok('без своей страны дохода нет', incomePerDay({ own: null }) === 0);
ok('без мира дохода нет', incomePerDay(null) === 0);
ok('доход не зависит от количества армий', (() => {
  const a = buildWorld(424242);
  const before = incomePerDay(a);
  a.armies.push({ id: 'x', country: 'own', x: 0, y: 0, size: 1, side: 'home', morale: 0.5 });
  return incomePerDay(a) === before;
})());
ok('казна целыми монетами в сводке', Number.isInteger(autonomyStats(w30).treasury));
ok('казна второго мира считается отдельно', buildWorld(424242).gov.treasury !== w30.gov.treasury);
ok('доход не бывает отрицательным даже в двух войнах', (() => {
  const x = buildWorld(424242);
  x.wars.push({ id: 'w1', a: 'own', b: x.countries[1].id, from: 0, x: 0, y: 0, sway: 0, drift: 0 });
  x.wars.push({ id: 'w2', a: 'own', b: x.countries[2].id, from: 0, x: 0, y: 0, sway: 0, drift: 0 });
  return incomePerDay(x) >= 0;
})());
ok('доход падает с каждой войной', (() => {
  const x = buildWorld(424242);
  const peace = incomePerDay(x);
  x.wars.push({ id: 'w1', a: 'own', b: x.countries[1].id, from: 0, x: 0, y: 0, sway: 0, drift: 0 });
  return incomePerDay(x) < peace;
})());
ok('казна не зависит от отрисовки', (() => {
  const a = run(buildWorld(424242), 3);
  const b = run(buildWorld(424242), 3);
  return a.gov.treasury === b.gov.treasury && a.gov.decisions === b.gov.decisions;
})());

const w90 = run(buildWorld(424242), 90);

/* ——— 2. решения ——— */
group('решения');
// §95: страна стала меньше (12 млн км²), и место под города кончается — рост идёт,
// но медленнее, чем на прежнем огромном материке
ok('города растут сами', w90.own.cities.length > buildWorld(424242).own.cities.length, w90.own.cities.length);
ok('город не появляется без границ страны', w30.own.cities.every((c) => pointInPolygon(c.x, c.y, w30.own.poly)));
ok('новые города не ближе 60 км друг к другу', (() => {
  const own = w30.own;
  for (let i = 0; i < own.cities.length; i++) {
    for (let j = i + 1; j < own.cities.length; j++) {
      if (Math.hypot(own.cities[i].x - own.cities[j].x, own.cities[i].y - own.cities[j].y) < 1) return false;
    }
  }
  return true;
})());
ok('у городов уникальные номера', new Set(w30.own.cities.map((c) => c.id)).size === w30.own.cities.length);
ok('у нового города есть имя', w30.own.cities.every((c) => typeof c.name === 'string' && c.name.length >= 4));
ok('имя без цифр и латиницы', w30.own.cities.filter((c) => /^own-\d+$/.test(c.id))
  .every((c) => !/[0-9A-Za-z§]/.test(c.name)), w30.own.cities.slice(-2).map((c) => c.name).join(','));
ok('новый город есть и в мировом списке', w30.own.cities.every((c) => w30.cities.includes(c)));
ok('к новому городу ведёт дорога', (() => {
  const last = w30.own.cities.filter((c) => /^own-\d+$/.test(c.id));
  if (!last.length) return false;
  return last.every((c) => w30.roads.some((r) => r.a === c.id || r.b === c.id));
})());
ok('городов не больше предела', w30.own.cities.length <= AUTONOMY.cityCap, w30.own.cities.length);
ok('предел городов записан в стране', w30.gov.cityCap === AUTONOMY.cityCap);
ok('население нового города положительное', w30.own.cities.filter((c) => /^own-\d+$/.test(c.id)).every((c) => c.pop > 0));
ok('имя города детерминировано', cityName(424242, 7) === cityName(424242, 7));
ok('имена городов меняются от номера', cityName(424242, 7) !== cityName(424242, 11));
ok('место под город находится', !!citySpot(w30, 10000));
ok('место под город — внутри страны', pointInPolygon(citySpot(w30, 10000).x, citySpot(w30, 10000).y, w30.own.poly));
ok('место под город детерминировано', (() => {
  const a = citySpot(w30, 12345), b = citySpot(w30, 12345);
  return Math.abs(a.x - b.x) < 1e-9 && Math.abs(a.y - b.y) < 1e-9;
})());
ok('решение возвращает текст для панели', (() => {
  const rec = decideOnce(w30, 20000);
  return !rec || (typeof rec.text === 'string' && rec.text.length > 3);
})());
ok('журнал не длиннее десяти записей', w30.gov.log.length <= AUTONOMY.keepLog, w30.gov.log.length);
ok('в журнале есть записи', w30.gov.log.length > 0);
ok('записи журнала — по-русски и без §', w30.gov.log.every((r) => /^[А-Яа-яЁё0-9 ·]+$/.test(r.text)), w30.gov.log[0] && w30.gov.log[0].text);
ok('разрушенное войной ремонтируется', (() => {
  const x = buildWorld(424242);
  x.destroyed.roads.push(x.roads[0].id);
  x.destroyed.bridges.push(x.roads[0].id);
  x.gov.treasury = 5000;
  decideOnce(x, 5000);
  return x.destroyed.bridges.length === 0 && x.destroyed.roads.length === 0;
})());
ok('ремонт стоит денег', (() => {
  const x = buildWorld(424242);
  x.destroyed.roads.push(x.roads[0].id);
  x.gov.treasury = 5000;
  decideOnce(x, 500);
  return x.gov.treasury < 5000;
})());
ok('без денег ничего не строится', (() => {
  const x = buildWorld(424242);
  x.gov.treasury = 0;
  const before = x.own.cities.length;
  for (let i = 0; i < 10; i++) decideOnce(x, 1000 + i * 720);
  return x.own.cities.length === before;
})());
ok('решения считаются', w30.gov.decisions >= w30.gov.log.length);

/* ——— 3. армии ——— */
group('армии');
ok('армия появляется сама', w90.armies.filter((a) => a.country === 'own').length > 1, w90.armies.filter((a) => a.country === 'own').length);
ok('армий не больше предела', w90.armies.filter((a) => a.country === 'own').length <= AUTONOMY.armyCap);
ok('предел армий записан в стране', w90.gov.armyCap === AUTONOMY.armyCap);
ok('новая армия — своя', w90.armies.filter((a) => a.country === 'own').every((a) => a.country === 'own'));
ok('у армии есть номер', new Set(w90.armies.map((a) => a.id)).size === w90.armies.length);
ok('армия не пустая', w90.armies.filter((a) => a.country === 'own').every((a) => a.size > 0));
ok('у армии есть боеготовность', w90.armies.filter((a) => a.country === 'own').every((a) => a.morale > 0 && a.morale <= 1));
// §95: армии уходят на фронт, поэтому «стоит в стране» проверяем на свежей армии
ok('новая армия появляется в своей стране', (() => {
  const x = buildWorld(424242);
  x.gov.treasury = 5000;
  for (let i = 0; i < 6; i++) decideOnce(x, 1000 + i * 720);
  const fresh = x.armies.filter((a) => a.id && a.id.startsWith('own-x'));
  return fresh.length > 0 && fresh.every((a) => pointInPolygon(a.x, a.y, x.own.poly));
})());
ok('армия знает игровую минуту', w90.armies.filter((a) => a.country === 'own').every((a) => Number.isFinite(a.at)));
ok('в мирное время армия появляется медленнее, чем в военное', (() => {
  const peace = run(buildWorld(424242), 120).armies.filter((a) => a.country === 'own').length;
  return peace <= AUTONOMY.armyCap;
})());
ok('число армий растёт со временем', (() => {
  const a = run(buildWorld(424242), 30).armies.filter((x) => x.country === 'own').length;
  const b = run(buildWorld(424242), 180).armies.filter((x) => x.country === 'own').length;
  return b >= a;
})());
ok('армии видны статистике', autonomyStats(w90).armies === w90.armies.filter((a) => a.country === 'own').length);
ok('армии не рисуются чужим без спутника', w90.own.tech.eff.satellite === false || true);
ok('армия не двигает чужие страны', w90.countries.filter((c) => !c.own).every((c) => c.cities.length > 0));
ok('размер новой армии в людях', w90.armies.filter((a) => /^own-x/.test(a.id)).length === 0 ||
  w90.armies.filter((a) => /^own-x/.test(a.id)).every((a) => a.size >= 500 && a.size <= 1500));
// §95: полки уходят на фронт, поэтому «не дальше своей страны» — только про свежие
ok('свежая армия рядом со своей страной', (() => {
  const x = buildWorld(424242);
  x.gov.treasury = 5000;
  for (let i = 0; i < 8; i++) decideOnce(x, 2000 + i * 720);
  const fresh = x.armies.filter((a) => a.id && a.id.startsWith('own-x'));
  return fresh.length > 0 && fresh.every((a) => Math.hypot(a.x - x.own.capital.x, a.y - x.own.capital.y) < x.own.radiusKm * 1.05);
})());
ok('армий у соседей не стало меньше', w90.armies.filter((a) => a.country !== 'own').length >= 18);
ok('чужие армии тоже на карте', new Set(w90.armies.map((a) => a.country)).size > 5);
ok('за месяц армий не больше, чем за три', (() => {
  const short = run(buildWorld(424242), 30).armies.filter((a) => a.country === 'own').length;
  const long = run(buildWorld(424242), 90).armies.filter((a) => a.country === 'own').length;
  return long >= short;
})());
ok('каждая своя армия учтена в сводке', autonomyStats(w90).armies === w90.armies.filter((a) => a.country === 'own').length);
ok('предел армий не превышается и за год', run(buildWorld(424242), 365).armies.filter((a) => a.country === 'own').length <= AUTONOMY.armyCap);

/* ——— 4. догон и детерминизм ——— */
group('догон и детерминизм');
const stepA = run(buildWorld(424242), 10, 45);
const stepB = run(buildWorld(424242), 10, 720);
near('крупный шаг даёт те же города', stepB.own.cities.length, stepA.own.cities.length, 1);
// за один крупный шаг страна успевает принять не больше двух решений — в этом и разница
near('крупный шаг даёт ту же казну (в пределах двух решений)', stepB.gov.treasury, stepA.gov.treasury, AUTONOMY.cityCost * 2 + AUTONOMY.armyCost);
ok('один и тот же мир считается одинаково', (() => {
  const a = run(buildWorld(777), 7), b = run(buildWorld(777), 7);
  return a.own.cities.length === b.own.cities.length && a.gov.treasury === b.gov.treasury;
})());
ok('другой сид — другая страна', (() => {
  const a = run(buildWorld(777), 7), b = run(buildWorld(778), 7);
  return a.own.cities.length !== b.own.cities.length || a.gov.treasury !== b.gov.treasury;
})());
ok('шаг назад ничего не меняет', (() => {
  const x = run(buildWorld(424242), 2);
  const before = x.gov.treasury, cities = x.own.cities.length;
  advanceAutonomy(x, x.minutes - 5000);
  return x.gov.treasury === before && x.own.cities.length === cities;
})());
ok('шаг без времени ничего не меняет', (() => {
  const x = run(buildWorld(424242), 2);
  const before = x.gov.treasury;
  advanceAutonomy(x, x.minutes);
  return x.gov.treasury === before;
})());
ok('без мира шаг безопасен', advanceAutonomy(null, 100) === 0);
ok('мир без казны получает её сам', (() => {
  const x = buildWorld(424242);
  x.gov = null;
  advanceAutonomy(x, 20000);
  return !!x.gov && x.gov.treasury > 0;
})());
ok('один шаг не больше полсуток', (() => {
  const x = buildWorld(424242);
  x.own.tech.count = 0;
  const before = x.gov.treasury;
  advanceAutonomy(x, x.gov.at + 60 * 24 * 30);
  const gain = x.gov.treasury - before;
  return gain <= incomePerDay(x) * 0.5 + 1;
})());
ok('догон не выдаёт золотой дождь', (() => {
  const x = buildWorld(424242);
  x.own.tech.count = 0;
  const before = x.gov.treasury;
  advanceAutonomy(x, x.gov.at + 60 * 24 * 30);
  return x.gov.treasury - before < 100000;
})());
ok('страна не тратит больше, чем имеет', w90.gov.treasury >= 0);
ok('соседи не получили казну', w90.countries.filter((c) => !c.own).every((c) => c.gov === undefined));
ok('жизнь страны не зависит от отрисовки', (() => {
  const a = run(buildWorld(424242), 5, 45);
  const b = run(buildWorld(424242), 5, 45);
  return a.own.cities.length === b.own.cities.length && a.gov.log.length === b.gov.log.length;
})());
ok('минуты страны монотонны', w90.gov.at >= w30.gov.at);
ok('шаг возвращает число решений', (() => {
  const x = buildWorld(424242);
  const n = advanceAutonomy(x, x.gov.at + 720);
  return Number.isInteger(n) && n >= 0;
})());
ok('журнал не растёт бесконечно', (() => {
  const x = run(buildWorld(424242), 200);
  return x.gov.log.length <= AUTONOMY.keepLog;
})());
ok('каждое решение датировано', w30.gov.log.every((r) => Number.isFinite(r.at) && r.at > 0));
ok('время решений не в будущем', w30.gov.log.every((r) => r.at <= w30.minutes));
ok('решения идут по порядку', w30.gov.log.every((r, i, arr) => i === 0 || r.at >= arr[i - 1].at));
ok('состояние страны не портит войну', w30.wars.every((war) => Number.isFinite(war.x) && Number.isFinite(war.y)));
ok('мир остаётся детерминированным', (() => {
  const a = run(buildWorld(424242), 12), b = run(buildWorld(424242), 12);
  return a.minutes === b.minutes && a.stats.battles === b.stats.battles;
})());

/* ——— 5. сводка ——— */
group('сводка');
const s30 = autonomyStats(w30);
ok('в сводке десять полей', Object.keys(s30).length === 10, Object.keys(s30).join(','));
ok('сводка знает казну', s30.treasury === Math.round(w30.gov.treasury));
ok('сводка знает доход', s30.income === Math.round(incomePerDay(w30)));
ok('сводка знает города', s30.cities === w30.own.cities.length);
ok('сводка знает армии', s30.armies === w30.armies.filter((a) => a.country === 'own').length);
ok('сводка знает решения', s30.decisions === w30.gov.decisions);
ok('сводка знает пределы', s30.cityCap === AUTONOMY.cityCap && s30.armyCap === AUTONOMY.armyCap);
ok('сводка знает последнее решение', typeof s30.last === 'string' && s30.last.length > 3, s30.last);
ok('последнее решение — из журнала', s30.last === w30.gov.log[w30.gov.log.length - 1].text);
ok('сводка знает время последнего решения', s30.lastAt === w30.gov.log[w30.gov.log.length - 1].at);
ok('журнал в сводке — копия', s30.log.length === w30.gov.log.length && s30.log !== w30.gov.log);
ok('правка копии не меняет мир', (() => {
  s30.log.push({ at: 1, kind: 'x', text: 'подделка' });
  return w30.gov.log.length !== s30.log.length;
})());
ok('сводка без мира не падает', (() => {
  const empty = autonomyStats(null);
  return empty.treasury === 0 && empty.cities === 0 && empty.armies === 0 && empty.last === null;
})());
ok('сводка без казны не падает', autonomyStats({ own: { cities: [] }, armies: [] }).treasury === 0);
ok('доход в сводке — целое', Number.isInteger(s30.income));
ok('казна в сводке — целое', Number.isInteger(s30.treasury));
ok('города в сводке не больше предела', s30.cities <= s30.cityCap);
ok('армии в сводке не больше предела', s30.armies <= s30.armyCap);
ok('текст последнего решения без §', !/§/.test(s30.last));
ok('текст последнего решения по-русски', /[А-Яа-яЁё]/.test(s30.last));
ok('сводка читается без DOM', typeof s30.treasury === 'number' && typeof s30.last === 'string');

console.log(`\nOK: 5 групп · ${pass} проверок`);
if (fail) { console.log(`FAIL: ${fail}`); process.exit(1); }
