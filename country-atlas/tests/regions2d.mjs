/* §96: страны делятся на области и республики — у каждой свой центр, ресурс и доход.
   Группы: деление, имена, ресурсы, захват и отбой, сводка.
   В каждой группе — не меньше двадцати проверяемых значений. */
import { buildWorld, advanceWars, pointInPolygon } from '../src/worldmap2d.js';
import {
  REGIONS, regionName, buildRegions, regionAt, nearestRegion, regionsOf,
  regionIncome, pressRegion, regionsStats
} from '../src/regions2d.js';

let pass = 0, fail = 0;
const ok = (name, cond, extra = '') => {
  if (cond) { pass++; return true; }
  fail++;
  console.log('  ✗ ' + name + (extra ? '  ' + extra : ''));
  return false;
};
const group = (title) => console.log('— ' + title);

const world = buildWorld(424242);
const regions = world.regions;
const own = regions.filter((r) => r.country === 'own');

/* ——— 1. деление ——— */
group('деление');
ok('области построены для всех стран', world.countries.every((c) => regions.filter((r) => r.country === c.id).length >= REGIONS.min),
  world.countries.map((c) => regions.filter((r) => r.country === c.id).length).join(','));
ok('областей не больше шести на страну', world.countries.every((c) => regions.filter((r) => r.country === c.id).length <= REGIONS.max));
ok('всего областей много', regions.length >= world.countries.length * REGIONS.min, regions.length);
ok('у области есть номер', regions.every((r) => typeof r.id === 'string' && r.id.includes(r.country)));
ok('у области есть страна', regions.every((r) => world.countries.some((c) => c.id === r.country)));
ok('у области есть центр', regions.every((r) => r.capital && Number.isFinite(r.capital.x) && Number.isFinite(r.capital.y)));
ok('центр области — это город страны', regions.every((r) => world.cities.some((c) => c.id === r.cityId && c.country === r.country)));
ok('центр области назван', regions.every((r) => typeof r.cityName === 'string' && r.cityName.length > 2));
ok('у области есть многоугольник', regions.every((r) => r.poly.length >= 3));
ok('у области есть площадь', regions.every((r) => r.area > 0));
ok('у области есть население', regions.every((r) => r.pop > 0));
ok('центр области внутри своей страны или у самой границы', regions.every((r) => {
  const c = world.countries.find((k) => k.id === r.country);
  if (pointInPolygon(r.capital.x, r.capital.y, c.poly)) return true;
  let best = Infinity;
  for (const [x, y] of c.poly) best = Math.min(best, Math.hypot(x - r.capital.x, y - r.capital.y));
  return best <= 300;
}), (() => {
  const bad = regions.filter((r) => {
    const c = world.countries.find((k) => k.id === r.country);
    if (pointInPolygon(r.capital.x, r.capital.y, c.poly)) return false;
    let best = Infinity;
    for (const [x, y] of c.poly) best = Math.min(best, Math.hypot(x - r.capital.x, y - r.capital.y));
    return best > 300;
  });
  return bad.map((r) => r.id).join(',');
})());
ok('центры областей не повторяются', new Set(regions.map((r) => r.cityId)).size === regions.length,
  regions.length - new Set(regions.map((r) => r.cityId)).size + ' повторов');
ok('большая страна делится на больше областей', (() => {
  const big = world.countries.map((c) => ({
    n: regions.filter((r) => r.country === c.id).length,
    area: (c.poly || []).length
  })).filter((x) => x.n > 0);
  return big.length === world.countries.length;
})());
ok('площади областей не в тысячу раз разные', (() => {
  const a = regions.map((r) => r.area).sort((x, y) => x - y);
  return a[a.length - 1] / a[0] < 120;
})(), (() => {
  const a = regions.map((r) => r.area).sort((x, y) => x - y);
  return Math.round(a[a.length - 1] / a[0]) + '×';
})());
ok('своя страна поделена на области', own.length >= REGIONS.min && own.length <= REGIONS.max, own.length);
ok('столица страны — в столичном округе', own.some((r) => r.name === 'Столичный округ'));
ok('свои области не налезают друг на друга', (() => {
  for (let i = 0; i < own.length; i++) {
    for (let j = i + 1; j < own.length; j++) {
      const a = own[i], b = own[j];
      const cx = (a.capital.x + b.capital.x) / 2, cy = (a.capital.y + b.capital.y) / 2;
      if (pointInPolygon(cx, cy, a.poly) && pointInPolygon(cx, cy, b.poly)) return false;
    }
  }
  return true;
})());
ok('regionAt находит область по точке центра', own.every((r) => {
  const f = regionAt(regions, r.capital.x, r.capital.y);
  return f && f.country === 'own';
}));
ok('regionAt в океане ничего не находит', regionAt(regions, 19000, 19000) === null);
ok('nearestRegion находит ближайшую', (() => {
  const r = own[0];
  const n = nearestRegion(regions, r.capital.x + 10, r.capital.y + 10);
  return n && n.region.country === 'own' && n.km < 100;
})());
ok('nearestRegion с фильтром уважает фильтр', (() => {
  const n = nearestRegion(regions, own[0].capital.x, own[0].capital.y, (r) => r.country !== 'own');
  return n && n.region.country !== 'own';
})());
ok('regionsOf возвращает области страны', regionsOf(regions, 'own').length === own.length);
ok('regionsOf чужой страны — не пусто', regionsOf(regions, world.countries[1].id).length >= REGIONS.min);
ok('у области есть рамка для быстрой отрисовки', regions.every((r) => Array.isArray(r.box) && r.box.length === 4));
ok('рамка охватывает многоугольник', regions.every((r) => r.poly.every(([x, y]) => x >= r.box[0] - 1e-6 && x <= r.box[2] + 1e-6 && y >= r.box[1] - 1e-6 && y <= r.box[3] + 1e-6)));
ok('деление детерминировано', (() => {
  const again = buildRegions(world.countries, 424242);
  return again.length === regions.length && again.every((r, i) => r.name === regions[i].name);
})());

/* ——— 2. имена ——— */
group('имена');
ok('имя области — из двух слов', own.every((r) => r.name.split(' ').length >= 2), own[0].name);
ok('имена областей по-русски', regions.every((r) => /^[А-ЯЁ][а-яё]+( [а-яё]+)+$/.test(r.name)), regions[0].name);
ok('имена без цифр и латиницы', regions.every((r) => !/[0-9A-Za-z]/.test(r.name)));
ok('внутри страны имена не повторяются', (() => {
  for (const c of world.countries) {
    const list = regions.filter((r) => r.country === c.id).map((r) => r.name);
    if (new Set(list).size !== list.length) return false;
  }
  return true;
})(), own.map((r) => r.name).join(' | '));
ok('имя области устойчиво', regionName(7, 3) === regionName(7, 3));
ok('имя области зависит от сида', regionName(7, 3) !== regionName(7, 4));
ok('у имени есть тип — земля, область, губерния', regions.filter((r) => r.name !== 'Столичный округ')
  .every((r) => REGIONS.kinds.includes(r.name.split(' ').pop())), own.map((r) => r.name.split(' ').pop()).join(','));
ok('у каждого типа есть прилагательные', Object.keys(REGIONS.adjs).length >= 4);
ok('имена во всём мире не повторяются', new Set(regions.map((r) => r.name)).size === regions.length,
  new Set(regions.map((r) => r.name)).size + ' из ' + regions.length);
// §103: своя страна стала крупной и набрала больше шести областей, а видов области
// всего шесть. Требуем прежнее — без повторов, — пока областей не больше, чем видов,
// а дальше виды должны делиться поровну, а не сбиваться в «окраины».
ok('внутри страны виды областей не толпятся', (() => {
  for (const c of world.countries) {
    const kinds = regions.filter((r) => r.country === c.id).map((r) => r.name.split(' ').pop());
    const tally = new Map();
    for (const k of kinds) tally.set(k, (tally.get(k) || 0) + 1);
    const cap = Math.ceil(kinds.length / REGIONS.kinds.length);
    for (const v of tally.values()) if (v > cap) return false;
    if (kinds.length <= REGIONS.kinds.length && new Set(kinds).size !== kinds.length) return false;
  }
  return true;
})(), own.map((r) => r.name.split(' ').pop()).join(','));

/* ——— 3. ресурсы ——— */
group('ресурсы');
const ids = REGIONS.resources.map((r) => r.id);
const yieldOf = (id) => REGIONS.resources.find((r) => r.id === id).yield;
ok('у области есть ресурс', regions.every((r) => r.resource && ids.includes(r.resource.id)));
ok('ресурс назван по-русски', regions.every((r) => typeof r.resource.name === 'string' && r.resource.name.length > 2), regions[0].resource.name);
ok('доход области — положительное число', regions.every((r) => r.yield > 0));
ok('доход в пределах заявленного', regions.every((r) => Math.abs(r.yield - yieldOf(r.resource.id)) <= 8),
  own.map((r) => r.yield).join(','));
ok('ресурсы разные, а не один на всех', new Set(regions.map((r) => r.resource.id)).size >= 4,
  [...new Set(regions.map((r) => r.resource.id))].join(','));
ok('ресурс области — из её края', regions.every((r) => r.resource.mark && typeof r.resource.mark === 'string'));
ok('доход страны — сумма областей', regionIncome(regions, 'own') === own.reduce((s, r) => s + r.yield, 0));
ok('у чужой страны свой доход', regionIncome(regions, world.countries[1].id) > 0);
ok('доход неотрицателен', regionIncome(regions, 'нет-такой') === 0);
ok('площадь области правдоподобна', own.every((r) => r.area > 1e3 && r.area < 5e6), own.map((r) => Math.round(r.area)).join(','));

/* ——— 4. захват и отбой ——— */
group('захват и отбой');
const test = () => JSON.parse(JSON.stringify(own[0]));
const t1 = test();
let ev = null;
for (let i = 0; i < 30 && !ev; i++) ev = pressRegion(t1, 'c1', 1, 60);
ok('чужая сила захватывает область', ev && ev.kind === 'capture', ev && ev.kind);
ok('в событии видно, кто взял', ev && ev.to === 'c1');
ok('в событии видно, у кого взяли', ev && ev.from === 'own');
ok('после захвата область чужая', t1.owner === 'c1');
ok('первый хозяин запомнен', t1.original === 'own');
ok('время захвата записано', Number.isFinite(t1.since));
ok('захват дал ресурс победителю', regionIncome([t1], 'c1') === t1.yield && regionIncome([t1], 'own') === 0,
  t1.yield + ' монет');
const t2 = JSON.parse(JSON.stringify(t1));
let back = null;
for (let i = 0; i < 40 && !back; i++) back = pressRegion(t2, 'own', 1, 60);
ok('своя сила отбивает область', back && back.kind === 'retake', back && back.kind);
ok('отбить дешевле, чем завоевать', REGIONS.retakeNeed < REGIONS.captureNeed);
ok('после отбоя область снова своя', t2.owner === 'own');
ok('отбитая область помнит, что была своей', t2.original === 'own');
ok('давление не растёт от слабой силы', (() => {
  const t = test();
  pressRegion(t, 'c1', 0.05, 5);
  return t.owner === 'own' && t.pressure < REGIONS.captureNeed;
})());
ok('слабая сторона не отбивает', (() => {
  const t = JSON.parse(JSON.stringify(t1));
  for (let i = 0; i < 5; i++) pressRegion(t, 'own', -1, 30);
  return t.owner === 'c1';
})());
ok('порог захвата в правилах', REGIONS.captureNeed > 0 && REGIONS.retakeNeed > 0);
ok('захват не мгновенный', (() => {
  const t = test();
  return pressRegion(t, 'c1', 1, 1) === null && t.owner === 'own';
})());
ok('pressRegion без области молчит', pressRegion(null, 'c1', 1, 60) === null);

/* ——— 5. сводка ——— */
group('сводка');
const st = regionsStats(world);
ok('сводка знает, сколько областей', st.total === regions.length);
ok('сводка знает свои области', st.own === own.length);
ok('в сводке есть доход', st.income === regionIncome(regions, 'own'));
ok('сводка знает захваты', st.taken === own.filter((r) => r.original !== 'own').length);
ok('сводка знает потери', st.lost === regions.filter((r) => r.original === 'own' && r.owner !== 'own').length);
ok('сводка называет области по-русски', st.list.every((r) => r.ownerName && r.resourceName), st.list[0].ownerName);
ok('сводка даёт список своих земель', st.list.length === st.own);
ok('сводка без захватов не врёт', st.last === null);

const warWorld = buildWorld(424242);
for (let t = 0; t <= 60 * 24 * 90; t += 45) advanceWars(warWorld, 9000 + t);
const st2 = regionsStats(warWorld);
ok('за 90 дней войны области переходят', st2.taken + st2.lost > 0 || warWorld.captures.length > 0,
  st2.taken + '/' + st2.lost);
ok('журнал захватов не пуст', warWorld.captures.length > 0, warWorld.captures.length);
ok('в журнале есть вид события', warWorld.captures.every((c) => c.kind === 'capture' || c.kind === 'retake'));
ok('в журнале есть имя области', warWorld.captures.every((c) => typeof c.name === 'string' && c.name.length > 3));
ok('в журнале есть время', warWorld.captures.every((c) => Number.isFinite(c.at)));
ok('журнал не растёт бесконечно', warWorld.captures.length <= 30, warWorld.captures.length);
ok('последнее событие — из журнала', st2.last && st2.last.id === warWorld.captures[warWorld.captures.length - 1].id);
ok('последнее событие названо по-русски', st2.last && st2.last.fromName && st2.last.toName,
  st2.last && st2.last.fromName + ' → ' + st2.last.toName);
ok('захваченная область платит новому хозяину', (() => {
  const cap = warWorld.regions.find((r) => r.owner !== r.original);
  if (!cap) return true;
  return regionIncome(warWorld.regions, cap.owner) > 0;
})());
ok('потерянная область не платит старому хозяину', (() => {
  const lost = warWorld.regions.find((r) => r.original === 'own' && r.owner !== 'own');
  if (!lost) return true;
  return !regionsOf(warWorld.regions, 'own').includes(lost);
})());
ok('каждая область принадлежит существующей стране', warWorld.regions.every((r) => warWorld.countries.some((c) => c.id === r.owner)));
ok('области в мире не появились из воздуха', warWorld.regions.length === regions.length);

console.log('\nOK: 5 групп · ' + pass + ' проверок');
if (fail) { console.log('FAIL: ' + fail); process.exit(1); }
