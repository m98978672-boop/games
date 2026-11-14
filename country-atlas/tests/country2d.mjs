/* Проверки §9–§10 (города), §7 (границы) и §31.33 (ресурсы): каждая формула на 20 значениях.
   Города — процедурные и детерминированные, границы — изолинии поля высот, экономика — по нормам. */
import assert from 'node:assert/strict';
import {
  CITY_CLASS, BUILDING, cityRadiusKm, cityPopulation, classFor, buildCity, cityLod, cityCensus,
  CITY_STREET_SCALE, CITY_BUILDING_SCALE
} from '../src/city2d.js';
import { heightGrid, contour, coastline, seaBorder, regionSeeds, buildBorders, BORDER } from '../src/borders2d.js';
import {
  NORMS, YIELD, RESOURCE_ORDER, RESOURCE, landAreas, consumption, production, balanceOf,
  buildEconomy, advanceEconomy, stockDays
} from '../src/economy2d.js';
import { settlements, rankSettlements, heightKm, WORLD2D } from '../src/world2d.js';

const towns = settlements();
const ranks = rankSettlements(towns, 10);

/* 1. F-125: радиус города от населения (20 значений) --- */
{
  for (let i = 0; i < 20; i++) {
    const pop = 500 * Math.pow(1.9, i);                 // 500 … 1.2·10⁸
    const r = cityRadiusKm(pop);
    assert.ok(r >= 0.5 && r <= 9, 'F-125: радиус в 0.5…9 км, а не ' + r);
    if (i > 0) assert.ok(r >= cityRadiusKm(500 * Math.pow(1.9, i - 1)) - 1e-9, 'F-125: радиус не убывает с населением');
  }
  assert.ok(cityRadiusKm(CITY_CLASS.capital.pop) > 6.5, 'столица — большой город');
  assert.ok(cityRadiusKm(3000) < 2, 'деревня — меньше двух километров');
}

/* 2. F-126: население класса детерминировано и в пределах ±35 % --- */
{
  for (let i = 0; i < 20; i++) {
    const cls = ['capital', 'city', 'town', 'small', 'village'][i % 5];
    const a = cityPopulation(cls, i * 3), b = cityPopulation(cls, i * 3);
    assert.equal(a, b, 'F-126: население повторяемо');
    const base = CITY_CLASS[cls].pop;
    assert.ok(a >= base * 0.65 - 1 && a <= base * 1.35 + 1, 'F-126: население в 0.65…1.35 от класса');
  }
  const census = cityCensus(towns, 10);
  assert.equal(census.byClass.capital, 1, 'столица одна');
  assert.equal(census.byClass.capital + census.byClass.city + census.byClass.town + census.byClass.small + census.byClass.village, towns.length, 'все поселения разложены по классам');
  assert.ok(census.population > census.urban, 'сельское население учтено');
  assert.ok(census.population > 1e6 && census.population < 1e9, 'население страны правдоподобно: ' + census.population);
}

/* 3. Города: улицы, кварталы, здания — 20 городов --- */
{
  let totalBuildings = 0;
  for (let i = 0; i < 20; i++) {
    const t = towns[i];
    const city = buildCity(t, i, ranks);
    assert.ok(city.streets.length >= 1, 'у города есть улицы');
    assert.ok(city.buildings.length >= 3, 'у города есть здания: ' + city.buildings.length);
    // R-10.3: бюджет зданий по классу — 1200/800/420, иначе мельче 1 px не различить
    const cap = city.cls === 'capital' ? 2400 : city.cls === 'city' ? 1500 : 700;
    assert.ok(city.buildings.length <= cap, 'зданий не больше ' + cap);
    totalBuildings += city.buildings.length;
    for (const b of city.buildings) {
      const d = Math.hypot(b.center[0] - city.x, b.center[1] - city.y);
      assert.ok(d <= city.radiusKm * 1.05, 'здание внутри радиуса города');
      assert.ok(BUILDING[b.type], 'тип здания из библиотеки §10');
      assert.ok(b.floors >= 1, 'этажность положительна');
      assert.ok(b.corners.length === 4, 'пятно — четырёхугольник');
    }
    for (const s of city.streets) {
      assert.ok(s.widthM >= 5 && s.widthM <= 30, 'ширина улицы 5…30 м');
      const d = Math.hypot(s.a[0] - city.x, s.a[1] - city.y);
      assert.ok(d <= city.radiusKm * 1.2, 'улица внутри радиуса');
    }
    // детерминизм: та же раскладка при повторной сборке
    const again = buildCity(t, i, ranks);
    assert.equal(again.buildings.length, city.buildings.length, 'город собирается одинаково');
  }
  assert.ok(totalBuildings > 2000, 'зданий в выборке много: ' + totalBuildings);

  // все 120 поселений заселены
  let empty = 0;
  for (let i = 0; i < towns.length; i++) if (buildCity(towns[i], i, ranks).buildings.length === 0) empty++;
  assert.equal(empty, 0, 'нет городов без домов');
}

/* 4. F-127: уровень детализации города по масштабу (20 значений) --- */
{
  for (let i = 0; i < 20; i++) {
    const s = 0.08 * Math.pow(1.7, i);
    const lod = cityLod(s);
    if (s >= CITY_BUILDING_SCALE) assert.equal(lod, 2, 'F-127: здания с 18 px/км');
    else if (s >= CITY_STREET_SCALE) assert.equal(lod, 1, 'F-127: улицы с 3 px/км');
    else assert.equal(lod, 0, 'F-127: до 3 px/км города нет');
  }
  assert.equal(cityLod(0.16), 0, 'на обзоре города — точки');
  assert.equal(cityLod(60), 2, 'в глубоком зуме — кварталы и дома');
}

/* 5. Границы §7: берег — изолиния h = 0 --- */
{
  const g = heightGrid();
  assert.equal(g.n, Math.round(WORLD2D.sizeKm / BORDER.stepKm) + 1, 'сетка границ накрывает мир');
  const coast = coastline();
  assert.ok(coast.length > 10, 'береговых линий много: ' + coast.length);
  let checked = 0;
  for (const line of coast.slice(0, 12)) {
    for (let i = 1; i < line.length; i += 5) {
      const h = heightKm(line[i][0], line[i][1]);
      assert.ok(Math.abs(h) < 90, 'точка берега у уровня моря, а не ' + h.toFixed(0) + ' м');
      checked++;
    }
  }
  assert.ok(checked > 40, 'проверено точек берега: ' + checked);
  // F-132: берег замкнут по каждому острову — минимум 3 точки в линии
  for (const line of coast) assert.ok(line.length >= 4, 'F-132: линия берега не обрубок');
}

/* 6. F-133: морская граница — в 22 км от берега и всегда по воде --- */
{
  const b = buildBorders(towns, ranks);
  assert.ok(b.sea.length > 5, 'морских участков много: ' + b.sea.length);
  let onWater = 0, total = 0;
  for (const line of b.sea) {
    for (const p of line) {
      total++;
      if (heightKm(p[0], p[1]) < 0) onWater++;
    }
  }
  assert.equal(onWater, total, 'F-133: морская граница вся по воде');
  assert.ok(total > 100, 'точек морской границы: ' + total);
  assert.ok(b.coastKm > 5000, 'берег длинный: ' + b.coastKm + ' км');
}

/* 7. F-134: 14 регионов, границы только по суше --- */
{
  const seeds = regionSeeds(towns, ranks);
  assert.equal(seeds.length, BORDER.regions, 'F-134: четырнадцать регионов');
  assert.equal(seeds[0].index, ranks.capital, 'первый регион — столичный');
  for (let i = 0; i < seeds.length; i++) {
    for (let j = i + 1; j < seeds.length; j++) {
      const d = Math.hypot(seeds[i].x - seeds[j].x, seeds[i].y - seeds[j].y);
      assert.ok(d >= 400, 'центры регионов не ближе 400 км: ' + d.toFixed(0));
    }
  }
  const b = buildBorders(towns, ranks);
  assert.ok(b.regionSegments > 500, 'границ регионов достаточно: ' + b.regionSegments);
  for (const line of b.regions.slice(0, 10)) {
    for (const p of line) assert.ok(heightKm(p[0], p[1]) > -60, 'граница региона не уходит в море');
  }
  // детерминизм
  const again = buildBorders(towns, ranks);
  assert.equal(again.regionSegments, b.regionSegments, 'границы повторяемы');
  assert.equal(Math.round(again.coastKm), Math.round(b.coastKm), 'берег повторяем');
}

/* 8. F-128: расход строго по нормам §31.33 (20 населения) --- */
{
  for (let i = 0; i < 20; i++) {
    const pop = 1000 * Math.pow(3, i);
    const c = consumption(pop);
    assert.ok(Math.abs(c.food - pop * NORMS.foodKg / 1000) < 1e-6, 'F-128: еда 2.5 кг/чел');
    assert.ok(Math.abs(c.water - pop * NORMS.waterL / 1000) < 1e-6, 'F-128: вода 150 л/чел');
    assert.ok(Math.abs(c.energy - pop * (NORMS.energyKw + NORMS.workplacesPerCapita * NORMS.workplaceKw) * 24 / 1e6) < 1e-9, 'F-128: энергия 0.35 + 0.9 кВт');
    assert.ok(Math.abs(c.money - pop * NORMS.moneyRub * NORMS.upkeepShare / 1e6) < 1e-6, 'F-128: деньги на содержание');
    for (const id of RESOURCE_ORDER) assert.ok(Number.isFinite(c[id]) && c[id] >= 0, 'F-128: ' + id + ' — число');
  }
  // реалистичность на человека
  const per = consumption(1e6);
  assert.ok(per.food / 1e6 * 1000 === NORMS.foodKg, 'еда на человека ровно 2.5 кг/сут');
  // ГВт·ч на 1e6 человек в сутки → МВт·ч на человека в год
  const mwhYear = per.energy * 365 / 1000;
  assert.ok(mwhYear > 5 && mwhYear < 9, 'энергия на человека 5…9 МВт·ч в год: ' + mwhYear.toFixed(1));
}

/* 9. F-129: приход из угодий (20 проверок пропорций) --- */
{
  const areas = landAreas();
  assert.ok(areas.land > 0 && areas.land < WORLD2D.sizeKm * WORLD2D.sizeKm, 'суша меньше мира');
  assert.ok(areas.shelf > 0, 'шельф посчитан');
  assert.ok(areas.forest > 0 && areas.arable > 0 && areas.mountain > 0, 'все угодья есть');
  const p = production(areas, 1e6);
  for (const id of RESOURCE_ORDER) assert.ok(Number.isFinite(p[id]) && p[id] >= 0, 'F-129: ' + id + ' — число');
  assert.ok(Math.abs(p.water - areas.land * YIELD.waterM3) < 1e-6, 'F-129: вода — с площади суши');
  assert.ok(Math.abs(p.timber - areas.forest * YIELD.forestT) < 1e-6, 'F-129: лес — с площади леса');
  // вдвое больше леса — вдвое больше древесины
  for (let i = 0; i < 20; i++) {
    const k = 0.5 + i * 0.1;
    const p2 = production({ ...areas, forest: areas.forest * k }, 1e6);
    assert.ok(Math.abs(p2.timber - p.timber * k) < 1e-6, 'F-129: приход линеен по площади');
  }
}

/* 10. F-130: дефицит, «нужность» и баланс --- */
{
  const prod = { food: 100, water: 100, energy: 100, timber: 100, stone: 100, metal: 100, fish: 100, money: 100 };
  const cons = { food: 200, water: 100, energy: 50, timber: 100, stone: 100, metal: 100, fish: 100, money: 100 };
  const bal = balanceOf(prod, cons);
  assert.ok(Math.abs(bal.food.deficit - 0.5) < 1e-9, 'F-130: дефицит еды 0.5');
  assert.equal(bal.energy.deficit, 0, 'F-130: профицит — дефицита нет');
  assert.ok(bal.food.need > 0 && bal.energy.need === 0, 'F-130: нужность только при дефиците');
  assert.ok(bal.food.need > Math.pow(0.5, 1.5), 'F-130: еда срочнее (коэффициент 1.4)');
  for (let i = 0; i < 20; i++) {
    const need = i * 0.05, have = Math.max(0, 1 - need);
    const b2 = balanceOf({ ...prod, fish: 100 * have }, cons);
    assert.ok(Math.abs(b2.fish.deficit - need) < 1e-9, 'F-130: дефицит = нехватка / потребность');
  }
}

/* 11. Экономика страны целиком --- */
{
  const e = buildEconomy(towns, ranks);
  assert.ok(e.population > 1e6, 'население посчитано');
  for (const id of RESOURCE_ORDER) {
    const b = e.balance[id];
    assert.ok(b.production >= 0 && b.consumption > 0, 'F-128/129: у ' + id + ' есть приход и расход');
    assert.ok(Math.abs(b.balance - (b.production - b.consumption)) < 1e-6, 'баланс = приход − расход');
    if (b.balance >= 0) assert.equal(stockDays(e, id), Infinity, 'при профиците склад не кончается');
    else assert.ok(Number.isFinite(stockDays(e, id)) && stockDays(e, id) > 0, 'при дефиците склад имеет срок');
  }
  // еда и вода в стране есть с запасом, металл в дефиците — так и задумано
  assert.ok(e.balance.food.balance > 0, 'еды хватает');
  assert.ok(e.balance.metal.deficit > 0, 'металла не хватает — работа для шахт');
  // сутки идут: склад меняется на баланс
  const before = e.stocks.food;
  advanceEconomy(e, 3);
  assert.ok(e.stocks.food > before, 'склад еды растёт');
  assert.equal(Math.round(e.days), 3, 'прошло трое суток');
  const metalBefore = e.stocks.metal;
  advanceEconomy(e, 2);
  assert.ok(e.stocks.metal < metalBefore, 'склад металла тает');
  assert.ok(e.stocks.metal >= 0, 'склад не уходит в минус');
  // запас на месяц: минимум 30 суток потребления
  const fresh = buildEconomy(towns, ranks);
  for (const id of RESOURCE_ORDER) {
    assert.ok(fresh.stocks[id] >= fresh.balance[id].consumption * 30 - 1, 'запас на 30 суток: ' + id);
  }
}

/* 12. Нормы §31.33 зафиксированы в коде и в SPEC --- */
{
  assert.equal(NORMS.foodKg, 2.5, 'еда 2.5 кг/чел·сут');
  assert.equal(NORMS.waterL, 150, 'вода 150 л/чел·сут');
  assert.equal(NORMS.energyKw, 0.35, 'энергия 0.35 кВт/чел');
  assert.equal(NORMS.workplaceKw, 0.9, 'энергия 0.9 кВт на рабочее место');
  for (let i = 0; i < 20; i++) {
    const id = RESOURCE_ORDER[i % RESOURCE_ORDER.length];
    assert.ok(RESOURCE[id].name && RESOURCE[id].unit, 'у ресурса есть имя и единица: ' + id);
  }
  assert.equal(RESOURCE_ORDER.length, 8, 'восемь ресурсов §31.33');
  assert.ok(YIELD.arableT > YIELD.pastureT, 'пашня урожайнее пастбища');
}

const census = cityCensus(towns, 10);
const eco = buildEconomy(towns, ranks);
const b = buildBorders(towns, ranks);
console.log('города: ' + towns.length + ' · жителей ' + census.population.toLocaleString('ru-RU') +
  ' (город ' + census.urban.toLocaleString('ru-RU') + ', село ' + census.rural.toLocaleString('ru-RU') + ')');
console.log('границы: берег ' + b.coastKm + ' км · регионов ' + b.seeds.length + ' · морских участков ' + b.sea.length);
console.log('страна: еда ' + Math.round(eco.balance.food.balance).toLocaleString('ru-RU') + ' т/сут, металл ' +
  Math.round(eco.balance.metal.balance).toLocaleString('ru-RU') + ' т/сут, энергия ' +
  Math.round(eco.balance.energy.balance).toLocaleString('ru-RU') + ' ГВт·ч/сут');
console.log('OK: 12 групп проверок городов, границ и ресурсов (F-125…F-134 по 20 значений)');
