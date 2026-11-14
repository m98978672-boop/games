/* Экономика страны по §31.33: восемь ресурсов, приход от земли, расход по-человечески.
   Нормы взяты реальные (еда 2.5 кг/чел·сут, вода 150 л, энергия 0.35 кВт + 0.9 кВт на
   рабочее место, §31.33), приход — из площади угодий: пашня, лес, горы, шельф.
   Всё детерминировано и считается по тем же полям высот и влаги, что и карта. */
import { WORLD2D, heightKm, moistureKm, settlements, rankSettlements } from './world2d.js';
import { cityCensus, classFor, cityPopulation } from './city2d.js';

/* Нормы расхода — §31.33 и бытовые справочники. */
export const NORMS = {
  foodKg: 2.5,            // кг на человека в сутки
  waterL: 150,            // литров на человека в сутки
  energyKw: 0.35,         // кВт на человека
  workplaceKw: 0.9,       // кВт на рабочее место
  workplacesPerCapita: 0.45,
  timberKg: 1.5,          // кг на человека в сутки (ремонт, мебель, стройка)
  stoneKg: 4.0,           // кг (бетон и щебень на дороги и фундаменты)
  metalKg: 0.8,           // кг (арматура, машины, трубы)
  fishKg: 0.05,           // кг
  moneyRub: 200,          // ₽ на человека в сутки (налоги и сборы)
  upkeepShare: 0.55,      // доля налогов, которая тратится на содержание
  taxShare: 0.6           // доля налоговой базы, которая реально собирается
};

/* Приход с земли: урожайность на км² в сутки. */
/* Урожайность — на км² в сутки, уже с долей реально используемых земель:
   пашня 300 т/км²·год (мир — около 2.8 млрд т зерна), но распахано 35 % пригодной земли,
   лес рубится на 35 % прироста, руду берут с четверти гор. */
export const YIELD = {
  arableT: 0.29,          // пашня: 300 т/км²·год × распахано 35 %
  pastureT: 0.02,         // пастбище: 7 т/км²·год
  forestT: 0.096,         // лес: 35 т/км²·год рубки (35 % прироста)
  mineT: 0.05,            // горы: камень и щебень, 18 т/км²·год
  metalT: 0.01,           // горы: руда, 3.7 т/км²·год
  fishT: 0.002,           // шельф: улов, 0.73 т/км²·год
  waterM3: 0.8,           // водозабор с км² суши: 1 % осадков 600 мм/год
  energyGwh: 0.000096     // энергия с км² суши: 96 кВт·ч в сутки (ветер, гидро, солнце)
};

export const RESOURCE_ORDER = ['food', 'water', 'energy', 'timber', 'stone', 'metal', 'fish', 'money'];

export const RESOURCE = {
  food:   { id: 'food',   name: 'Еда',           unit: 'т/сут',     kind: 'mass' },
  water:  { id: 'water',  name: 'Вода',          unit: 'м³/сут',    kind: 'volume' },
  energy: { id: 'energy', name: 'Энергия',       unit: 'ГВт·ч/сут', kind: 'power' },
  timber: { id: 'timber', name: 'Древесина',     unit: 'т/сут',     kind: 'mass' },
  stone:  { id: 'stone',  name: 'Камень/бетон',  unit: 'т/сут',     kind: 'mass' },
  metal:  { id: 'metal',  name: 'Металл',        unit: 'т/сут',     kind: 'mass' },
  fish:   { id: 'fish',   name: 'Рыба',          unit: 'т/сут',     kind: 'mass' },
  money:  { id: 'money',  name: 'Деньги',        unit: 'млн ₽/сут', kind: 'cash' }
};

/* Площадь угодий: обходим мир сеткой и раскладываем клетки по видам земли. */
export function landAreas(stepKm = 60) {
  const cellKm2 = stepKm * stepKm;
  const half = WORLD2D.halfKm;
  const n = Math.round(WORLD2D.sizeKm / stepKm);
  const areas = { land: 0, arable: 0, pasture: 0, forest: 0, mountain: 0, shelf: 0, water: 0, built: 0 };
  for (let j = 0; j < n; j++) {
    const y = half - (j + 0.5) * stepKm;
    for (let i = 0; i < n; i++) {
      const x = -half + (i + 0.5) * stepKm;
      const h = heightKm(x, y);
      if (h < 0) {
        if (h > -200) areas.shelf += cellKm2;          // шельф — рыбный промысел
        else areas.water += cellKm2;
        continue;
      }
      areas.land += cellKm2;
      const m = moistureKm(x, y);
      if (h > 700) areas.mountain += cellKm2;
      else if (m >= 0.56 && h < 1500) areas.forest += cellKm2;
      else if (m >= 0.42 && h < 1000) areas.arable += cellKm2;
      else if (h < 1500) areas.pasture += cellKm2;
      else areas.mountain += cellKm2;
    }
  }
  return areas;
}

/* F-128: расход страны в сутки — строго по людям и нормам §31.33. */
export function consumption(population, n = NORMS) {
  return {
    food: population * n.foodKg / 1000,                                  // т/сут
    water: population * n.waterL / 1000,                                 // м³/сут
    energy: population * (n.energyKw + n.workplacesPerCapita * n.workplaceKw) * 24 / 1e6,   // ГВт·ч/сут
    timber: population * n.timberKg / 1000,
    stone: population * n.stoneKg / 1000,
    metal: population * n.metalKg / 1000,
    fish: population * n.fishKg / 1000,
    money: population * n.moneyRub * n.upkeepShare / 1e6                  // млн ₽/сут на содержание
  };
}

/* F-129: приход страны в сутки — из площади угодий и урожайности. */
export function production(areas, population, y = YIELD) {
  return {
    food: areas.arable * y.arableT + areas.pasture * y.pastureT,
    water: areas.land * y.waterM3,
    energy: areas.land * y.energyGwh,
    timber: areas.forest * y.forestT,
    stone: areas.mountain * y.mineT + areas.land * 0.008 * y.mineT,
    metal: areas.mountain * y.metalT,
    fish: areas.shelf * y.fishT,
    money: population * NORMS.moneyRub * NORMS.taxShare / 1e6
  };
}

/* F-130: дефицит и «нужность» §31.34. */
export function balanceOf(prod, cons) {
  const out = {};
  for (const id of RESOURCE_ORDER) {
    const p = prod[id], c = cons[id];
    const deficit = Math.max(0, c - p) / Math.max(1e-9, c);
    out[id] = {
      production: p,
      consumption: c,
      balance: p - c,
      perCapita: c,                    // сколько нужно на страну — для подписи
      deficit,
      need: Math.pow(deficit, 1.5) * (id === 'food' ? 1.4 : id === 'energy' ? 1.3 : 1)
    };
  }
  return out;
}

/* Страна целиком: население, угодья, приход, расход, запасы на 30 суток. */
export function buildEconomy(towns = settlements(), ranks = null) {
  const r = ranks || rankSettlements(towns, 10);
  const census = cityCensus(towns, 10);
  const areas = landAreas();
  const cons = consumption(census.population);
  const prod = production(areas, census.population);
  const balance = balanceOf(prod, cons);
  const stocks = {};
  for (const id of RESOURCE_ORDER) stocks[id] = Math.max(balance[id].consumption, 1) * 30;   // запас на месяц
  return { population: census.population, byClass: census.byClass, areas, consumption: cons, production: prod, balance, stocks, days: 0 };
}

/* F-131: шаг экономики. Сутки за сутки: склады живут по разнице прихода и расхода. */
export function advanceEconomy(economy, days) {
  if (!(days > 0)) return economy;
  for (const id of RESOURCE_ORDER) {
    const b = economy.balance[id];
    economy.stocks[id] = Math.max(0, economy.stocks[id] + b.balance * days);
  }
  economy.days += days;
  return economy;
}

/* Сколько суток продержится склад при текущем дефиците. */
export function stockDays(economy, id) {
  const b = economy.balance[id];
  if (b.balance >= 0) return Infinity;
  return economy.stocks[id] / -b.balance;
}

/* Короткая строка для HUD. */
export function economyLine(economy, id) {
  const b = economy.balance[id];
  const res = RESOURCE[id];
  const k = b.consumption >= 1 ? 1 : 1000;
  const unit = b.consumption >= 1 ? res.unit : res.unit.replace('/сут', '×10⁻³/сут');
  const fmt = (v) => Math.round(v / k).toLocaleString('ru-RU');
  const sign = b.balance >= 0 ? '+' : '−';
  return fmt(b.consumption) + ' / ' + sign + fmt(Math.abs(b.balance)) + ' ' + unit;
}
