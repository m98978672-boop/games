/* §96: страны делятся на области и республики, а война забирает их по одной.

   Владелец: «раздели страны на республики/области и так далее… при войне если захватывается
   1 из территорий другой страны, то эта территория становится моей пока её обратно не заберут,
   и ресурсы страны мои».

   Здесь страна режется на 3–6 административных единиц: у каждой свой центр, население,
   свой ресурс и своя доля дохода. Область можно захватить — она переходит победителю
   вместе с ресурсом, пока её не отобьют.

   Модуль не знает ни канвы, ни камеры: только числа, полигоны и детерминированный сид. */

import { pick, insidePoly, polyArea } from './planet2d.js';

export const REGIONS = {
  min: 3,                  // меньше трёх областей страна не делится
  max: 6,
  capitalShare: 0.42,      // радиус, внутри которого области не режут столицу
  captureNeed: 100,        // сколько «давления» нужно, чтобы область перешла к врагу
  pressureStep: 9,         // сколько давления даёт один бой с перевесом
  retakeNeed: 60,          // сколько нужно, чтобы отбить свою область обратно
  kinds: ['область', 'республика', 'губерния', 'волость', 'земля', 'окраина'],
  // прилагательные в женском роде: 20 × 6 видов = 120 имён — хватает на весь мир без повторов
  adjs: ['Северная', 'Верхняя', 'Заречная', 'Степная', 'Лесная', 'Каменная', 'Приморская',
    'Дальняя', 'Средняя', 'Тихая', 'Ярская', 'Долинная', 'Южная', 'Западная', 'Восточная',
    'Солнечная', 'Ветряная', 'Озёрная', 'Липовая', 'Тенистая',
    // §103: стран и областей стало больше (своя страна выросла на своём берегу), и
    // 120 имён на 104 области — впритык: вида области уже не хватало на всех
    'Полуденная', 'Заозёрная', 'Сосновая', 'Вербная', 'Житная', 'Кленовая',
    'Черёмуховая', 'Ржаная', 'Глиняная', 'Скалистая', 'Туманная', 'Ветлужская'],
  // ресурсы: сколько монет в сутки даёт захваченная или своя область
  resources: [
    { id: 'grain', name: 'хлеб', yield: 16, mark: 'grain' },
    { id: 'forest', name: 'лес', yield: 14, mark: 'forest' },
    { id: 'ore', name: 'руда', yield: 20, mark: 'mountain' },
    { id: 'oil', name: 'нефть', yield: 24, mark: 'desert' },
    { id: 'coal', name: 'уголь', yield: 18, mark: 'mountain' },
    { id: 'fish', name: 'рыба', yield: 13, mark: 'swamp' }
  ]
};

/* Полуплоскость: оставляем то, что ближе к своему центру области. */
function clipHalf(poly, mx, my, dx, dy) {
  const out = [];
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i], b = poly[(i + 1) % poly.length];
    const da = (a[0] - mx) * dx + (a[1] - my) * dy;
    const db = (b[0] - mx) * dx + (b[1] - my) * dy;
    if (da <= 0) out.push(a);
    if ((da < 0 && db > 0) || (da > 0 && db < 0)) {
      const t = da / (da - db);
      out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]);
    }
  }
  return out;
}

/* Ячейка области: начинаем со страны и отрезаем всё, что ближе к соседнему центру. */
export function cellOf(site, sites, clip) {
  let poly = clip.map((p) => [p[0], p[1]]);
  for (const other of sites) {
    if (other.id === site.id) continue;
    const mx = (site.x + other.x) / 2, my = (site.y + other.y) / 2;
    poly = clipHalf(poly, mx, my, other.x - site.x, other.y - site.y);
    if (poly.length < 3) return [];
  }
  return poly;
}

/* Название области: прилагательное + тип, всё в женском роде — «Северная губерния»,
   «Заречная республика». Тип и прилагательное берутся из сида, поэтому одинаковы всегда. */
export function regionName(seed, i, kindIndex = null) {
  const kind = REGIONS.kinds[(kindIndex == null ? Math.floor(pick(seed + i * 71, 601) * REGIONS.kinds.length) : kindIndex) % REGIONS.kinds.length];
  const adj = REGIONS.adjs[Math.floor(pick(seed + i * 97, 607) * REGIONS.adjs.length) % REGIONS.adjs.length];
  return adj + ' ' + kind;
}

/* §96: имя области, которого ещё нет в мире. Перебор идёт по всем парам
   «прилагательное + вид», поэтому 86 областей получают 86 разных имён. */
export function uniqueRegionName(seed, i, used, base = null, avoidKinds = null) {
  if (base && !used.has(base)) return base;
  const adjs = REGIONS.adjs, kinds = REGIONS.kinds;
  const total = adjs.length * kinds.length;
  const start = Math.abs(Math.floor(pick(seed + i * 71, 601) * total)) % total;
  // два прохода: сначала ищем имя с ещё не занятым видом (в стране не три «окраины»),
  // потом — любое свободное
  for (const pass of avoidKinds ? [0, 1] : [1]) {
    for (let k = 0; k < total; k++) {
      const n = (start + k) % total;
      const kind = kinds[Math.floor(n / adjs.length) % kinds.length];
      if (pass === 0 && avoidKinds.has(kind)) continue;
      const name = adjs[n % adjs.length] + ' ' + kind;
      if (!used.has(name)) return name;
    }
  }
  return (base || 'Безымянная область') + ' вторая';
}


/* Точки внутри страны, равномерно закрывающие её форму: жадный выбор самой далёкой
   от уже выбранных. Сетка 14×14 плюс вершины и середины рёбер — дешево и детерминировано. */
export function spreadPoints(poly, n) {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const [x, y] of poly) {
    if (x < x0) x0 = x; if (x > x1) x1 = x;
    if (y < y0) y0 = y; if (y > y1) y1 = y;
  }
  const w = x1 - x0, h = y1 - y0;
  const cand = [];
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i], b = poly[(i + 1) % poly.length];
    cand.push({ x: a[0], y: a[1] });
    cand.push({ x: (a[0] + b[0]) / 2, y: (a[1] + b[1]) / 2 });
  }
  const step = Math.max(w, h) / 14 || 1;
  for (let x = x0 + step / 2; x < x1; x += step) {
    for (let y = y0 + step / 2; y < y1; y += step) {
      if (insidePoly(x, y, poly)) cand.push({ x, y });
    }
  }
  const chosen = [{ x: poly[0][0], y: poly[0][1] }];
  while (chosen.length < Math.max(1, n + 2) && cand.length) {
    let best = null, bestD = -Infinity;
    for (const c of cand) {
      let d = Infinity;
      for (const s of chosen) {
        const dd = Math.hypot(c.x - s.x, c.y - s.y);
        if (dd < d) d = dd;
      }
      if (d > bestD) { bestD = d; best = c; }
    }
    if (!best) break;
    chosen.push(best);
    const i = cand.indexOf(best);
    if (i >= 0) cand.splice(i, 1);
  }
  chosen.shift();
  return chosen;
}

/* Деление страны на области. Центры областей — кольцо вокруг столицы: в середине
   страны остаётся столичный округ, дальше — области по секторам, чтобы у каждой
   был выход к своей части границы. */
export function splitCountry(country, seed = 424242, count = null) {
  const poly = country.poly || [];
  if (poly.length < 3) return [];
  const cap = country.capital || { x: 0, y: 0 };
  const r = country.radiusKm || 600;
  // §96: большая страна делится на больше областей — по площади, а не по жребию
  const countryArea = polyArea(poly);
  const want = Math.round(countryArea / 2.6e6) + 2;
  const n = count || Math.min(REGIONS.max, Math.max(REGIONS.min,
    want + Math.floor(pick(seed + 17, 613) * 2)));
  // §96: центры областей расставляются по форме страны, а не по кругу вокруг столицы:
  // вытянутая страна получала три области у левого края и одну на весь остаток.
  // Теперь это выбор «самой далёкой от уже выбранных» точки внутри границы.
  const sites = [{ id: (country.id || 'c') + '-rc', x: cap.x, y: cap.y, ring: 0 }];
  const spots = spreadPoints(poly, n);
  for (let k = 0; k < spots.length && sites.length < n; k++) {
    sites.push({ id: (country.id || 'c') + '-r' + sites.length, x: spots[k].x, y: spots[k].y, ring: 1 });
  }
  void r;
  const out = [];
  for (const site of sites) {
    const cell = cellOf(site, sites, poly);
    if (cell.length < 3) continue;
    const area = polyArea(cell);
    if (area < 4000) continue;                       // огрызки не считаем областью
    const idx = out.length;
    const center = site.ring === 0 ? cap : { x: site.x, y: site.y };
    const res = REGIONS.resources[Math.floor(pick(seed + idx * 211 + 7, 623) * REGIONS.resources.length) % REGIONS.resources.length];
    // имена внутри страны не повторяются: соседние «Верхняя земля» путали бы карту
    const base = site.ring === 0 ? 'Столичный округ' : null;
    const local = new Set(out.map((r) => r.name));
    const localKinds = new Set(out.map((r) => r.name.split(' ').pop()));
    const localAdjs = new Set(out.map((r) => r.name.split(' ')[0]));
    let name = uniqueRegionName(seed, idx + (country.id ? country.id.length * 7 : 0), local, base, localKinds);
    // внутри страны не повторяются ни вид, ни прилагательное — иначе «Северная область»
    // и «Северная республика» рядом читаются как одно и то же
    for (let attempt = 1; attempt <= 24; attempt++) {
      const kind = name.split(' ').pop(), adj = name.split(' ')[0];
      if (!localKinds.has(kind) && !localAdjs.has(adj)) break;
      const alt = uniqueRegionName(seed + attempt * 191, idx + attempt, local, null, localKinds);
      if (localKinds.has(alt.split(' ').pop()) || localAdjs.has(alt.split(' ')[0])) continue;
      name = alt;
      break;
    }
    out.push({
      name,
      id: (country.id || 'c') + '-r' + idx,
      country: country.id,
      owner: country.id,                  // чей сейчас: война меняет это поле
      original: country.id,               // чей по праву
      capital: { x: center.x, y: center.y },
      area,
      pop: Math.round(area / 900) + 40,
      resource: res,
      yield: res.yield,
      pressure: 0,                        // накопленное давление войны
      by: null,
      since: null,
      poly: cell
    });
  }
  return out;
}

/* Области всех стран: одна плоская таблица и быстрый поиск по рамке. */
export function buildRegions(countries, seed = 424242) {
  const out = [];
  const used = new Set();               // §96: имена не повторяются во всём мире, а не только в стране
  for (const c of countries) {
    // у каждой страны своё число областей: сид считается по её коду, а не по длине строки
    let code = 0;
    for (let i = 0; i < (c.id || '').length; i++) code = code * 31 + c.id.charCodeAt(i);
    const list = splitCountry(c, seed + Math.abs(code));
    // имя не повторяется во всём мире: занятое имя заменяем на свободное,
    // по возможности с ещё не занятым в этой стране видом и прилагательным
    for (const r of list) {
      if (used.has(r.name)) {
        const localKinds = new Set(list.filter((k) => k !== r).map((k) => k.name.split(' ').pop()));
        const localAdjs = new Set(list.filter((k) => k !== r).map((k) => k.name.split(' ')[0]));
        let picked = null;
        for (let attempt = 0; attempt < 60; attempt++) {
          const alt = uniqueRegionName(seed + Math.abs(code) + attempt * 389, out.length + list.indexOf(r) + attempt, used, null, localKinds);
          if (localKinds.has(alt.split(' ').pop()) || localAdjs.has(alt.split(' ')[0])) continue;
          picked = alt;
          break;
        }
        // «Столичный округ» уже занят другой страной — столица получает обычное имя
        if (!picked) picked = uniqueRegionName(seed + Math.abs(code) + 991, out.length, used);
        r.name = picked;
      }
      used.add(r.name);
    }
    c.regions = list.map((r) => r.id);
    out.push(...list);
  }
  for (const r of out) {
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const [x, y] of r.poly) {
      if (x < x0) x0 = x;
      if (y < y0) y0 = y;
      if (x > x1) x1 = x;
      if (y > y1) y1 = y;
    }
    r.box = [x0, y0, x1, y1];
  }
  return out;
}

/* Какая область накрывает точку. Сначала рамка — это в разы дешевле, чем полный обход. */
export function regionAt(regions, x, y) {
  for (const r of regions) {
    const b = r.box || [0, 0, 0, 0];
    if (x < b[0] || y < b[1] || x > b[2] || y > b[3]) continue;
    if (insidePoly(x, y, r.poly)) return r;
  }
  return null;
}

/* Ближайшая область страны к точке боя: фронт захватывает ту, что под ним. */
export function nearestRegion(regions, x, y, pred = null) {
  let best = null, bestD = Infinity;
  for (const r of regions) {
    if (pred && !pred(r)) continue;
    const d = Math.hypot(r.capital.x - x, r.capital.y - y);
    if (d < bestD) { bestD = d; best = r; }
  }
  return best ? { region: best, km: bestD } : null;
}

export function regionsOf(regions, countryId) {
  return regions.filter((r) => r.owner === countryId);
}

/* Доход страны с областей: своя область кормит, захваченная — тоже, пока её не отбили. */
export function regionIncome(regions, countryId) {
  let sum = 0;
  for (const r of regions) if (r.owner === countryId) sum += r.yield;
  return sum;
}

/* Давление войны на область. winnerId — кто сильнее на этом фронте.
   Давление — это натиск на того, кто держит область сейчас. Хозяин, который
   побеждает, гасит натиск; чужой, который побеждает, копит его и при перевесе
   забирает область вместе с ресурсом. Отбить свою землю дешевле, чем завоевать
   чужую: хозяину по праву нужно retakeNeed, чужому — captureNeed. */
export function pressRegion(region, winnerId, balance, minutes) {
  if (!region) return null;
  const step = Math.abs(balance) * REGIONS.pressureStep;
  if (winnerId === region.owner) {
    // хозяин области держится: натиск спадает и уходит в запас, но не бесконечно
    region.pressure -= step;
    if (region.pressure < -REGIONS.captureNeed) region.pressure = -REGIONS.captureNeed;
    return null;
  }
  region.pressure += step;
  // своя земля возвращается легче: 60 против 100
  const need = winnerId === region.original ? REGIONS.retakeNeed : REGIONS.captureNeed;
  if (region.pressure >= need && region.owner !== winnerId) {
    const from = region.owner;
    const back = winnerId === region.original;      // возвращает свою землю
    region.owner = winnerId;
    region.by = winnerId;
    region.since = minutes;
    region.pressure = 0;
    return { kind: back ? 'retake' : 'capture', region, from, to: winnerId, at: minutes };
  }
  return null;
}

/* Сводка для панели: сколько областей, сколько захвачено, сколько дают дохода. */
export function regionsStats(world, countryId = 'own') {
  const list = (world && world.regions) || [];
  const names = new Map();
  for (const c of ((world && world.countries) || [])) names.set(c.id, c.name);
  const nameOf = (id) => names.get(id) || id;
  const mine = list.filter((r) => r.owner === countryId);
  const taken = mine.filter((r) => r.original !== countryId);
  const lost = list.filter((r) => r.original === countryId && r.owner !== countryId);
  // §96: у области сразу есть готовые подписи — чья она и что даёт
  for (const r of list) {
    r.ownerName = nameOf(r.owner);
    r.fromName = nameOf(r.original);
    r.resourceName = r.resource ? r.resource.name : '';
    r.km2 = Math.round(r.area || 0);
  }
  return {
    total: list.length,
    own: mine.length,
    taken: taken.length,
    lost: lost.length,
    income: regionIncome(list, countryId),
    list: mine,
    takenList: taken,
    lostList: lost,
    last: (world && world.captures && world.captures.length)
      ? Object.assign({}, world.captures[world.captures.length - 1],
        { fromName: nameOf(world.captures[world.captures.length - 1].from), toName: nameOf(world.captures[world.captures.length - 1].to) })
      : null
  };
}
