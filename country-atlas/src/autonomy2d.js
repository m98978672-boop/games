/* §94: страна живёт сама (F-384…F-392).
   До этого страна «жила» только тем, что игрок смотрел на карту: наука копилась,
   а города, армии и дороги не менялись. Теперь у страны есть казна и своё
   правительство: раз в полдня оно решает, что построить — город, армию или
   отремонтировать мост. Всё считается числами от игровых минут и сида, поэтому
   жизнь идёт и когда окно не в фокусе: часы игры тикают сами.
   Ни DOM, ни камеры модуль не знает. */
import { regionIncome } from './regions2d.js';
import { hash01, idToInt } from './accidents2d.js';
import { pointInPolygon, cellRadius } from './worldmap2d.js';

export const AUTONOMY = {
  dayMin: 1440,            // игровых минут в сутках
  decisionMin: 720,        // раз в полдня правительство что-то решает
  treasuryStart: 1500,     // казна на старте, монет
  cityIncome: 22,          // монет в сутки с города
  techIncome: 5,           // и за каждую открытую технологию
  warDrain: 90,            // война съедает казну в сутки
  cityCost: 1400,          // новый город
  armyCost: 900,           // новая армия
  roadCost: 260,           // ремонт дороги
  bridgeCost: 420,         // ремонт моста
  roadBuildCost: 1200,     // новая магистраль, когда казна с избытком
  cityCap: 24,             // больше городов страна не тянет
  armyCap: 9,              // и армий тоже
  keepLog: 10,             // сколько решений помнит журнал
  maxStepMin: 720          // предохранитель: за один шаг не больше полсуток
};

/* F-384: стартовая казна и журнал. Вызывается из buildWorld. */
export function buildAutonomy(world) {
  const gov = {
    treasury: AUTONOMY.treasuryStart + Math.round(hash01(world.seed + 17, 401) * 600),
    decisions: 0,
    at: 0,
    cityCap: AUTONOMY.cityCap,
    armyCap: AUTONOMY.armyCap,
    log: []
  };
  world.gov = gov;
  return gov;
}

/* F-385: доход за отрезок времени. Считается по городам и технологиям страны:
   чем больше страна, тем больше казна, но война съедает часть. */
export function incomePerDay(world) {
  const own = world && world.own;
  if (!own) return 0;
  const cities = own.cities ? own.cities.length : 0;
  const tech = own.tech ? own.tech.count : 0;
  const wars = world.wars ? world.wars.filter((w) => !w.to && (w.a === 'own' || w.b === 'own')).length : 0;
  // §96: каждая своя область приносит свой ресурс — зерно, лес, руду, нефть, уголь, рыбу.
  // Захваченная чужая область тоже платит, пока её не отбили; потерянная — нет.
  const land = world.regions ? regionIncome(world.regions, 'own') : 0;
  const gross = AUTONOMY.cityIncome * cities + AUTONOMY.techIncome * tech + land;
  return Math.max(0, gross - AUTONOMY.warDrain * wars);
}

/* F-386: свободное место под новый город — внутри своей страны, подальше от старых.
   Кандидаты перебираются детерминированно: тот же мир — тот же город. */
export function citySpot(world, minutes) {
  const own = world && world.own;
  if (!own || !own.poly || own.poly.length < 3) return null;
  const r = own.radiusKm || cellRadius(own.poly, own.capital || { x: 0, y: 0 });
  let best = null, bestGap = -Infinity;
  for (let i = 0; i < 24; i++) {
    const a = hash01(world.seed + minutes + i * 71, 409) * Math.PI * 2;
    const d = Math.sqrt(hash01(world.seed + minutes + i * 131, 419)) * r * 0.78;
    const x = (own.capital ? own.capital.x : 0) + Math.cos(a) * d;
    const y = (own.capital ? own.capital.y : 0) + Math.sin(a) * d;
    if (!pointInPolygon(x, y, own.poly)) continue;
    let gap = Infinity;
    for (const c of own.cities || []) gap = Math.min(gap, Math.hypot(c.x - x, c.y - y));
    if (gap > bestGap) { bestGap = gap; best = { x, y, gap }; }
  }
  return best && best.gap > 60 ? best : null;
}

/* F-387: имя нового города — из слогов страны, без номеров параграфов и латиницы. */
const CITY_HEAD = ['Ново', 'Крас', 'Бело', 'Зареч', 'Верхн', 'Нижн', 'Свет', 'Тих', 'Дал', 'Ясно'];
const CITY_TAIL = ['град', 'поль', 'горск', 'вец', 'берск', 'дольск', 'речск', 'мышль', 'рад', 'стан'];
export function cityName(seed, n) {
  const i = Math.floor(hash01(seed + n * 53, 421) * CITY_HEAD.length) % CITY_HEAD.length;
  const j = Math.floor(hash01(seed + n * 97, 431) * CITY_TAIL.length) % CITY_TAIL.length;
  return CITY_HEAD[i] + CITY_TAIL[j];
}

/* F-388: одно решение правительства. Возвращает запись журнала или null. */
export function decideOnce(world, minutes) {
  const own = world && world.own;
  const gov = world && world.gov;
  if (!own || !gov) return null;
  const cities = own.cities ? own.cities.length : 0;
  const armies = (world.armies || []).filter((a) => a.country === 'own').length;
  const atWar = (world.wars || []).some((w) => !w.to && (w.a === 'own' || w.b === 'own'));
  const spot = () => citySpot(world, minutes);

  // 1. ремонт: разрушенное войной возвращается в строй, если есть деньги
  const brokenBridge = (world.destroyed.bridges || [])[0];
  if (brokenBridge && gov.treasury >= AUTONOMY.bridgeCost) {
    world.destroyed.bridges.shift();
    const ri = world.destroyed.roads.indexOf(brokenBridge);
    if (ri >= 0) world.destroyed.roads.splice(ri, 1);
    const road = (world.roads || []).find((r) => r.id === brokenBridge);
    gov.treasury -= AUTONOMY.bridgeCost;
    world.rev++;
    // §96: в журнале — название страны, а не её код в данных («у c7» — это баг)
    const where = road ? ((world.countries || []).find((c) => c.id === road.country) || {}).name : '';
    return { at: minutes, kind: 'bridge', text: 'отремонтирован мост' + (where ? ' в стране ' + where : '') };
  }
  const brokenRoad = (world.destroyed.roads || [])[0];
  if (brokenRoad && gov.treasury >= AUTONOMY.roadCost) {
    world.destroyed.roads.shift();
    gov.treasury -= AUTONOMY.roadCost;
    world.rev++;
    return { at: minutes, kind: 'road', text: 'отремонтирована дорога' };
  }
  // 2. мирное время: сначала город — он дешевле и кормит казну. Но если городов
  // уже много, а полков мало, страна держит в казне запас и на армию (§95)
  const thinArmy = armies * 4 < cities;
  const cityNeed = AUTONOMY.cityCost + (thinArmy ? AUTONOMY.armyCost : 0);
  if (!atWar && cities < AUTONOMY.cityCap && gov.treasury >= cityNeed) {
    const p = spot();
    if (p) {
      const id = 'own-' + minutes;
      const city = {
        id, name: cityName(world.seed, cities), x: p.x, y: p.y, capital: false,
        pop: 120 + Math.round(hash01(world.seed + minutes, 449) * 260), country: 'own'
      };
      own.cities.push(city);
      world.cities.push(city);
      // дорога к ближайшему городу: новый город не висит в поле
      let near = null, best = Infinity;
      for (const c of own.cities) {
        if (c === city) continue;
        const d = Math.hypot(c.x - city.x, c.y - city.y);
        if (d < best) { best = d; near = c; }
      }
      if (near) {
        const road = {
          id: 'own-rd' + minutes, country: 'own', a: near.id, b: id,
          x1: near.x, y1: near.y, x2: city.x, y2: city.y,
          kind: 'local', bridge: false
        };
        world.roads.push(road);
        if (own.roads) own.roads.push(road);
      }
      gov.treasury -= AUTONOMY.cityCost;
      world.rev++;
      return { at: minutes, kind: 'city', text: 'основан город ' + city.name };
    }
  }
  // 3. армия: в войну — сразу, в мир — когда казна с запасом
  // §95: страна держит армию соразмерно числу городов — одна на четыре города,
  // а в войну поднимает полки сразу, как только есть деньги
  const wantArmy = atWar
    ? armies < AUTONOMY.armyCap && gov.treasury >= AUTONOMY.armyCost
    : armies < AUTONOMY.armyCap && thinArmy && gov.treasury >= AUTONOMY.armyCost;
  if (wantArmy) {
    const a = (hash01(world.seed + minutes, 433) * 2 - 1) * Math.PI;
    // полк стоит в своей стране: перебираем радиусы, пока точка не окажется внутри границы
    let ax = own.capital.x, ay = own.capital.y;
    for (const k of [0.8, 0.62, 0.45, 0.3, 0.15]) {
      const tx = own.capital.x + Math.cos(a) * own.radiusKm * k;
      const ty = own.capital.y + Math.sin(a) * own.radiusKm * k;
      if (pointInPolygon(tx, ty, own.poly)) { ax = tx; ay = ty; break; }
    }
    const army = {
      id: 'own-x' + (world.armies.length + 1),
      country: 'own',
      x: ax,
      y: ay,
      size: 500 + Math.round(hash01(world.seed + minutes, 439) * 900),
      side: 'home',
      at: minutes,
      morale: 0.6 + hash01(world.seed + minutes, 443) * 0.3
    };
    world.armies.push(army);
    gov.treasury -= AUTONOMY.armyCost;
    world.rev++;
    return { at: minutes, kind: 'army', text: 'поднята армия · ' + army.size + ' человек' };
  }
  // 4. казна с избытком — страна строит магистрали между дальними городами
  const ownRoads = (world.roads || []).filter((r) => r.country === 'own');
  if (cities >= 10 && ownRoads.length < cities * 1.5 && gov.treasury >= AUTONOMY.roadBuildCost * 2) {
    const cs = own.cities || [];
    let a = cs[0], b = cs[1], best = -1;
    for (let i = 0; i < cs.length; i++) {
      for (let j = i + 1; j < cs.length; j++) {
        const d = Math.hypot(cs[i].x - cs[j].x, cs[i].y - cs[j].y);
        if (d > best) { best = d; a = cs[i]; b = cs[j]; }
      }
    }
    const id = 'own-mg' + minutes;
    if (a && b && !(world.roads || []).some((r) => r.id === id)) {
      const road = {
        id, country: 'own', a: a.id, b: b.id, x1: a.x, y1: a.y, x2: b.x, y2: b.y,
        kind: 'main', bridge: false
      };
      world.roads.push(road);
      if (own.roads) own.roads.push(road);
      gov.treasury -= AUTONOMY.roadBuildCost;
      world.rev++;
      return { at: minutes, kind: 'magistral', text: 'проложена магистраль ' + a.name + ' — ' + b.name };
    }
  }
  // 5. копить — это не событие: в журнал такие шаги не пишем, чтобы он не шумел
  return null;
}

/* F-389: шаг страны. Доход начисляется за прожитые минуты, решение — раз в полдня.
   Шаг ограничен полуcутками, поэтому догон времени даёт тот же результат, что и
   постепенная жизнь: проверяется в tests/autonomy2d.mjs. */
export function advanceAutonomy(world, minutes) {
  if (!world || !world.own) return 0;
  if (!world.gov) buildAutonomy(world);
  const gov = world.gov;
  const prev = Number.isFinite(gov.at) ? gov.at : 0;
  const now = Number.isFinite(minutes) ? minutes : prev;
  if (!(now > prev)) return 0;
  const dt = Math.min(AUTONOMY.maxStepMin, now - prev);
  // доход по кускам: длинный догон не даёт «золотого дождя» за один шаг
  let left = dt, done = 0;
  while (left > 0) {
    const chunk = Math.min(AUTONOMY.decisionMin, left);
    gov.treasury += (incomePerDay(world) * chunk) / AUTONOMY.dayMin;
    gov.at = prev + (dt - left) + chunk;
    left -= chunk;
    if (gov.at - (gov.lastDecisionAt || 0) >= AUTONOMY.decisionMin) {
      gov.lastDecisionAt = gov.at;
      const rec = decideOnce(world, gov.at);
      if (rec) {
        gov.decisions++;
        gov.log.push(rec);
        if (gov.log.length > AUTONOMY.keepLog) gov.log.shift();
        done++;
      }
    }
  }
  gov.at = now;
  return done;
}

/* F-390: сводка для панели — что страна сделала сама. */
export function autonomyStats(world) {
  const gov = (world && world.gov) || null;
  const own = world && world.own;
  const armies = world && world.armies ? world.armies.filter((a) => a.country === 'own').length : 0;
  const last = gov && gov.log.length ? gov.log[gov.log.length - 1] : null;
  return {
    treasury: gov ? Math.round(gov.treasury) : 0,
    income: Math.round(incomePerDay(world)),
    decisions: gov ? gov.decisions : 0,
    cities: own && own.cities ? own.cities.length : 0,
    armies,
    cityCap: gov ? gov.cityCap : AUTONOMY.cityCap,
    armyCap: gov ? gov.armyCap : AUTONOMY.armyCap,
    last: last ? last.text : null,
    lastAt: last ? last.at : 0,
    log: gov ? gov.log.slice() : []
  };
}
