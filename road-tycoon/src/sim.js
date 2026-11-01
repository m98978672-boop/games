/* Ядро игры: состояние, экономика, строительство, трафик, события, заказы. */
(function () {
  const TR = (window.TR = window.TR || {});
  const U = TR.Util;
  const C = TR.CONFIG;
  const Sim = (TR.Sim = {});

  const pathCache = new Map();
  let neighborsCache = null;
  let neighborsVer = -1;
  let roadIndexCache = null;
  let roadIndexVer = -1;
  let facIndexCache = null;
  let facIndexVer = -1;

  /* ---------------------------------------------------------------- база */

  Sim.newGame = function (seed) {
    const s = {
      v: C.version,
      seed: seed || 1,
      time: C.dayStartHour / 24,
      money: C.startMoney,
      debt: 0,
      xp: 0,
      level: 1,
      won: false,
      winShown: false,
      cities: C.cities.map((c, i) => ({ id: i, pop: c.pop, sat: 1, acc: 0 })),
      roads: [],
      facilities: [],
      vehicles: [],
      effects: [],
      contracts: [],
      objIndex: 0,
      objDone: [],
      upgrades: { crew: 3, fleet: 0, marketing: 0, quality: 0, maintenance: 0 },
      stats: {
        incomeToday: 0, expenseToday: 0, servicesToday: 0, vehiclesToday: 0, tradeToday: 0,
        totalIncome: 0, totalExpense: 0, totalKm: 0, totalServices: 0,
        incomeLastDay: 0, expenseLastDay: 0, history: [],
      },
      nextRoadId: 1, nextFacId: 1, nextContractId: 1,
      graphVersion: 1, facVersion: 1,
      notices: [], floats: [], sfx: [], news: [],
      dailyReport: null,
      nextEventDay: 1.4,
      crisis: null,
      nextCrisisDay: 7 + Math.random() * 3,
      rushHour: 0,
      tutorial: { step: 0, done: false },
      settings: { sound: true },
    };
    s.stats.history = [];

    C.startRoads.forEach((r) => {
      const road = {
        id: s.nextRoadId++, a: r.a, b: r.b, quality: r.quality, target: r.quality,
        open: true, building: false, totalKm: U.dist(C.cities[r.a].x, C.cities[r.a].y, C.cities[r.b].x, C.cities[r.b].y),
        builtKm: U.dist(C.cities[r.a].x, C.cities[r.a].y, C.cities[r.b].x, C.cities[r.b].y),
        byPlayer: false, toll: false, blockedUntil: 0, trafficToday: 0, level: 0,
      };
      s.roads.push(road);
    });
    Sim.invalidatePaths(s);
    s.news.push({ day: 1, text: 'Компания «Трасса» получила первый подряд. Стройте дороги и зарабатывайте на мелочах.', kind: 'info' });
    return s;
  };

  Sim.invalidatePaths = function (s) {
    s.graphVersion++;
    pathCache.clear();
    neighborsCache = null;
    neighborsVer = -1;
  };

  Sim.notice = function (s, kind, text) {
    s.notices.push({ kind, text, id: Math.random() });
    if (s.notices.length > 40) s.notices.shift();
  };
  Sim.addNews = function (s, kind, text) {
    s.news.unshift({ day: U.dayNumber(s.time), text, kind });
    if (s.news.length > 40) s.news.pop();
  };
  Sim.addFloat = function (s, x, y, text, kind) {
    s.floats.push({
      x: x + (Math.random() - 0.5) * 3,
      y: y + (Math.random() - 0.5) * 2.2,
      text, kind: kind || 'coin', life: 1.25, max: 1.25,
    });
    if (s.floats.length > 70) s.floats.shift();
  };

  Sim.roadById = function (s, id) {
    if (roadIndexVer !== s.graphVersion || !roadIndexCache) {
      roadIndexCache = new Map();
      s.roads.forEach((r) => roadIndexCache.set(r.id, r));
      roadIndexVer = s.graphVersion;
    }
    return roadIndexCache.get(id);
  };

  Sim.roadSpeed = function (road, s) {
    const base = C.roadTypes[road.quality].speed;
    if (road.blockedUntil && s && road.blockedUntil > s.time) return base * 0.3;
    return base;
  };

  Sim.neighbors = function (s) {
    if (neighborsVer === s.graphVersion && neighborsCache) return neighborsCache;
    const map = new Map();
    for (let i = 0; i < C.cities.length; i++) map.set(i, []);
    for (const r of s.roads) {
      if (!r.open) continue;
      if (r.blockedUntil && r.blockedUntil > s.time) continue;
      const time = r.totalKm / C.roadTypes[r.quality].speed;
      map.get(r.a).push({ to: r.b, road: r, time });
      map.get(r.b).push({ to: r.a, road: r, time });
    }
    neighborsCache = map;
    neighborsVer = s.graphVersion;
    return map;
  };

  Sim.findPath = function (s, from, to) {
    if (from === to) return null;
    const key = from + '>' + to + '@' + s.graphVersion;
    if (pathCache.has(key)) return pathCache.get(key);
    const n = C.cities.length;
    const dist = new Array(n).fill(Infinity);
    const prev = new Array(n).fill(null);
    const visited = new Array(n).fill(false);
    dist[from] = 0;
    const nb = Sim.neighbors(s);
    for (let k = 0; k < n; k++) {
      let u = -1, best = Infinity;
      for (let i = 0; i < n; i++) if (!visited[i] && dist[i] < best) { best = dist[i]; u = i; }
      if (u < 0) break;
      visited[u] = true;
      if (u === to) break;
      for (const e of nb.get(u)) {
        const nd = best + e.time;
        if (nd < dist[e.to]) {
          dist[e.to] = nd;
          prev[e.to] = { city: u, road: e.road };
        }
      }
    }
    if (dist[to] === Infinity) { pathCache.set(key, null); return null; }
    const path = [];
    let cur = to, guard = 0;
    while (cur !== from && guard++ < 64) {
      const p = prev[cur];
      if (!p) { pathCache.set(key, null); return null; }
      path.push({ roadId: p.road.id, dir: p.road.a === p.city ? 1 : -1 });
      cur = p.city;
    }
    path.reverse();
    pathCache.set(key, path);
    return path;
  };

  Sim.reachable = function (s, from) {
    const nb = Sim.neighbors(s);
    const seen = new Set([from]);
    const queue = [from];
    while (queue.length) {
      const u = queue.pop();
      for (const e of nb.get(u)) {
        if (!seen.has(e.to)) { seen.add(e.to); queue.push(e.to); }
      }
    }
    seen.delete(from);
    return [...seen];
  };

  Sim.connectedCityCount = function (s) {
    const n = C.cities.length;
    const seen = new Set();
    let best = 0;
    const nb = Sim.neighbors(s);
    for (let i = 0; i < n; i++) {
      if (seen.has(i)) continue;
      const queue = [i];
      seen.add(i);
      let size = 0;
      while (queue.length) {
        const u = queue.pop();
        size++;
        for (const e of nb.get(u)) if (!seen.has(e.to)) { seen.add(e.to); queue.push(e.to); }
      }
      if (size > best) best = size;
    }
    // учитываем только сеть, где есть первая дорога; изолированный город = 1
    return best;
  };

  Sim.connectedComponents = function (s) {
    const n = C.cities.length;
    const comp = new Array(n).fill(-1);
    const nb = Sim.neighbors(s);
    let cid = 0;
    const sizes = [];
    for (let i = 0; i < n; i++) {
      if (comp[i] >= 0) continue;
      const queue = [i];
      comp[i] = cid;
      let size = 0;
      while (queue.length) {
        const u = queue.pop();
        size++;
        for (const e of nb.get(u)) if (comp[e.to] < 0) { comp[e.to] = cid; queue.push(e.to); }
      }
      sizes[cid] = size;
      cid++;
    }
    return { comp, sizes };
  };

  /* ------------------------------------------------------------ экономика */

  Sim.buildRate = function (s) {
    const crew = s.upgrades.crew;
    const fleet = s.upgrades.fleet;
    return (30 + crew * 14) * (1 + fleet * 0.2) * Sim.effectMul(s, 'build');
  };
  Sim.maxProjects = (s) => 1 + s.upgrades.fleet;
  Sim.crewFactor = (s) => 0.4 + s.upgrades.crew * 0.2;

  Sim.roadUpkeep = function (s) {
    let sum = 0;
    const cut = 1 - s.upgrades.maintenance * 0.09;
    for (const r of s.roads) {
      if (!r.open) continue;
      const rt = C.roadTypes[r.quality];
      // содержание дороги + износ от проезжающих машин
      sum += (r.totalKm * rt.upkeep + (r.trafficToday || 0) * (rt.wear || 0)) * cut;
    }
    return sum * Sim.crisisMul(s, 'upkeep');
  };
  Sim.facilityUpkeep = function (s) {
    let sum = 0;
    const cut = 1 - s.upgrades.maintenance * 0.09;
    for (const f of s.facilities) {
      if (!f.ready) continue;
      const def = C.facilityByKey[f.type];
      sum += def.upkeep * (1 + 0.35 * (f.level - 1)) * cut;
    }
    return sum * Sim.crisisMul(s, 'upkeep');
  };
  Sim.salaries = function (s) {
    return s.upgrades.crew * 190;
  };
  Sim.interest = function (s) {
    return s.debt * C.loanRate;
  };
  Sim.dailyExpense = function (s) {
    return Sim.roadUpkeep(s) + Sim.facilityUpkeep(s) + Sim.salaries(s) + Sim.interest(s);
  };
  Sim.subsidies = function (s) {
    let sum = 0;
    for (const f of s.facilities) {
      if (!f.ready) continue;
      const def = C.facilityByKey[f.type];
      if (def.subsidy) sum += def.subsidy * (1 + 0.4 * (f.level - 1));
    }
    return sum * Sim.crisisMul(s, 'subsidy');
  };

  Sim.companyValue = function (s) {
    let value = s.money - s.debt;
    for (const r of s.roads) {
      if (!r.open && !r.building) continue;
      value += r.totalKm * C.roadTypes[r.quality].cost * 0.5;
    }
    for (const f of s.facilities) {
      const def = C.facilityByKey[f.type];
      value += def.cost * (0.6 + 0.16 * (f.level - 1)) * (f.ready ? 1 : 0.5);
    }
    return value;
  };

  Sim.levelFromXp = function (xp) {
    let lvl = 1;
    for (let i = 0; i < C.levelXp.length; i++) if (xp >= C.levelXp[i]) lvl = i + 1;
    return lvl;
  };
  Sim.addXp = function (s, amount) {
    s.xp += amount;
    const lvl = Sim.levelFromXp(s.xp);
    if (lvl > s.level) {
      s.level = lvl;
      Sim.notice(s, 'levelup', `Уровень компании ${lvl}! Доступны новые объекты.`);
      Sim.addNews(s, 'level', `Компания выросла до уровня ${lvl}.`);
      s.sfx.push('levelup');
    }
  };

  Sim.crisisMul = function (s, key) {
    if (!s.crisis || !s.crisis.mods) return 1;
    const v = s.crisis.mods[key];
    return typeof v === 'number' ? v : 1;
  };

  Sim.startCrisis = function (s, forceId) {
    const c = forceId ? C.crises.find((x) => x.id === forceId) : pickWeighted(C.crises, 'weight');
    if (!c) return null;
    s.crisis = { id: c.id, title: c.title, text: c.text, until: s.time + c.days, mods: Object.assign({}, c.mods) };
    s.nextCrisisDay = s.time + c.days + 6 + Math.random() * 7;
    Sim.notice(s, 'bad', `Кризис: ${c.title}. ${c.text}`);
    Sim.addNews(s, 'bad', `Кризис: «${c.title}». ${c.text}`);
    s.sfx.push('bad');
    return s.crisis;
  };

  Sim.crisisInfo = function (s) {
    if (!s.crisis) return null;
    return { title: s.crisis.title, text: s.crisis.text, daysLeft: Math.max(0, s.crisis.until - s.time) };
  };

  Sim.effectMul = function (s, kind) {
    let mul = 1;
    for (const e of s.effects) if (e.kind === kind) mul *= e.mul;
    return mul;
  };
  Sim.addEffect = function (s, kind, mul, days, title) {
    s.effects.push({ kind, mul, until: s.time + days, title });
    Sim.addNews(s, 'event', `${title}: ${mul > 1 ? '+' : ''}${Math.round((mul - 1) * 100)}%.`);
    Sim.invalidatePaths(s);
  };

  /* ------------------------------------------------------- стоимость дорог */

  Sim.roadQuote = function (s, world, a, b, quality) {
    if (a === b) return { ok: false, error: 'Выберите другой город' };
    const len = U.dist(C.cities[a].x, C.cities[a].y, C.cities[b].x, C.cities[b].y);
    if (len < 8) return { ok: false, error: 'Слишком короткий участок (минимум 8 км)' };
    if (len > 78) return { ok: false, error: 'Слишком далеко (максимум 78 км)' };
    const dup = s.roads.find((r) => (r.a === a && r.b === b) || (r.a === b && r.b === a));
    if (dup) return { ok: false, error: 'Дорога между городами уже есть', existing: dup };
    const factor = TR.World.roadFactor(world, a, b);
    const cost = Math.round(len * C.roadTypes[quality].cost * factor * Sim.crisisMul(s, 'buildCost'));
    if (quality === 3 && s.level < 4) return { ok: false, error: 'Автобан откроется на 4 уровне' };
    if (quality === 2 && s.level < 2) return { ok: false, error: 'Асфальт откроется на 2 уровне' };
    return { ok: true, cost, len, factor };
  };

  Sim.buildRoad = function (s, world, a, b, quality) {
    const q = Sim.roadQuote(s, world, a, b, quality);
    if (!q.ok) return q;
    if (s.money < q.cost) return { ok: false, error: 'Не хватает денег: нужно ' + U.money(q.cost) };
    const active = s.roads.filter((r) => r.building).length + s.facilities.filter((f) => !f.ready).length;
    if (active >= Sim.maxProjects(s)) {
      return { ok: false, error: 'Все бригады заняты. Улучшите «Спецтехнику» для параллельных строек.' };
    }
    s.money -= q.cost;
    const road = {
      id: s.nextRoadId++, a, b, quality, target: quality,
      open: false, building: true, totalKm: q.len, builtKm: 0,
      byPlayer: true, toll: false, blockedUntil: 0, trafficToday: 0, level: 1,
    };
    s.roads.push(road);
    Sim.invalidatePaths(s);
    Sim.addXp(s, 70 + Math.round(q.len * 3));
    Sim.notice(s, 'info', `Начата стройка: ${C.cities[a].name} — ${C.cities[b].name}, ${U.km(q.len)}.`);
    Sim.addNews(s, 'build', `Начата дорога ${C.cities[a].name} — ${C.cities[b].name} (${C.roadTypes[quality].name}).`);
    s.sfx.push('build');
    return { ok: true, road, cost: q.cost };
  };

  Sim.upgradeCost = function (road, quality, s) {
    const cur = C.roadTypes[road.quality];
    const target = C.roadTypes[quality];
    if (quality <= road.quality) return 0;
    const mult = s ? Sim.crisisMul(s, 'buildCost') : 1;
    return Math.round(road.totalKm * (target.cost - cur.cost) * target.upgrade * mult);
  };

  Sim.upgradeRoad = function (s, roadId, quality) {
    const road = Sim.roadById(s, roadId);
    if (!road) return { ok: false, error: 'Дорога не найдена' };
    if (road.building) return { ok: false, error: 'Дорога ещё строится' };
    if (quality <= road.quality) return { ok: false, error: 'Класс не выше текущего' };
    if (C.roadTypes[quality].unlock > s.level) return { ok: false, error: `Откроется на ${C.roadTypes[quality].unlock} уровне` };
    const active = s.roads.filter((r) => r.building).length + s.facilities.filter((f) => !f.ready).length;
    if (active >= Sim.maxProjects(s)) return { ok: false, error: 'Все бригады заняты' };
    const cost = Sim.upgradeCost(road, quality, s);
    if (s.money < cost) return { ok: false, error: 'Не хватает денег: нужно ' + U.money(cost) };
    s.money -= cost;
    road.building = true;
    road.target = quality;
    road.builtKm = 0;
    Sim.notice(s, 'info', `Реконструкция: ${C.cities[road.a].name} — ${C.cities[road.b].name} → ${C.roadTypes[quality].name}.`);
    s.sfx.push('build');
    return { ok: true, cost };
  };

  Sim.demolishRoad = function (s, roadId) {
    const idx = s.roads.findIndex((r) => r.id === roadId);
    if (idx < 0) return { ok: false, error: 'Дорога не найдена' };
    const road = s.roads[idx];
    if (road.building) return { ok: false, error: 'Сначала завершите стройку' };
    const refund = Math.round(road.totalKm * C.roadTypes[road.quality].cost * 0.15);
    s.money += refund;
    s.facilities = s.facilities.filter((f) => f.roadId !== road.id);
    s.roads.splice(idx, 1);
    Sim.invalidatePaths(s);
    s.facVersion++;
    Sim.notice(s, 'info', `Участок разобран. Возврат ${U.money(refund)}.`);
    return { ok: true, refund };
  };

  /* ------------------------------------------------------------- объекты */

  Sim.facilitiesOnRoad = function (s, roadId) {
    if (facIndexVer !== s.facVersion || !facIndexCache) {
      facIndexCache = new Map();
      for (const f of s.facilities) {
        if (!facIndexCache.has(f.roadId)) facIndexCache.set(f.roadId, []);
        facIndexCache.get(f.roadId).push(f);
      }
      facIndexVer = s.facVersion;
    }
    return facIndexCache.get(roadId) || [];
  };

  Sim.canPlace = function (s, typeKey, roadId, t) {
    const def = C.facilityByKey[typeKey];
    if (!def) return { ok: false, error: 'Неизвестный объект' };
    if (def.unlock > s.level) return { ok: false, error: `Откроется на ${def.unlock} уровне` };
    const road = Sim.roadById(s, roadId);
    if (!road) return { ok: false, error: 'Нужна дорога' };
    if (!road.open || road.building) return { ok: false, error: 'Дорога ещё не готова' };
    if (road.quality < (def.minQuality || 0)) {
      return { ok: false, error: `Нужно покрытие «${C.roadTypes[def.minQuality].name}»` };
    }
    const list = Sim.facilitiesOnRoad(s, road.id);
    if (def.edgeWide) {
      if (list.some((f) => f.type === typeKey)) return { ok: false, error: 'На этом участке уже есть' };
      return { ok: true, def };
    }
    if (t < 0.04 || t > 0.96) return { ok: false, error: 'Слишком близко к городу' };
    const minGap = 3.2; // км между объектами
    for (const f of list) {
      if (Math.abs(f.t - t) * road.totalKm < minGap) {
        return { ok: false, error: 'Слишком близко к другому объекту' };
      }
    }
    if (def.cat === 'city') {
      const p = U.curvePoint(U.curve(road), t);
      const near = C.cities.some((c) => U.dist(c.x, c.y, p.x, p.y) < 24);
      if (!near) return { ok: false, error: 'Благоустройство — только у городов (до 24 км)' };
    }
    if (s.money < def.cost) return { ok: false, error: 'Не хватает денег: нужно ' + U.money(def.cost) };
    return { ok: true, def, road };
  };

  Sim.placeFacility = function (s, typeKey, roadId, t, side) {
    const chk = Sim.canPlace(s, typeKey, roadId, t);
    if (!chk.ok) return chk;
    const def = chk.def;
    s.money -= def.cost;
    const facility = {
      id: s.nextFacId++, type: typeKey, roadId, t: U.clamp(t, 0.03, 0.97), side: side || 1,
      level: 1, ready: false, progress: 0,
      revenueToday: 0, revenueLastDay: 0, visitsToday: 0, totalRevenue: 0, totalVisits: 0,
    };
    s.facilities.push(facility);
    s.facVersion++;
    Sim.addXp(s, 30 + Math.round(def.cost / 500));
    Sim.notice(s, 'info', `${def.name}: строительство начато.`);
    Sim.addNews(s, 'build', `Поставлен объект: ${def.name}.`);
    s.sfx.push('place');
    return { ok: true, facility };
  };

  Sim.facilityUpgradeCost = function (f) {
    const def = C.facilityByKey[f.type];
    return Math.round(def.cost * 0.72 * Math.pow(f.level, 1.32));
  };
  Sim.upgradeFacility = function (s, id) {
    const f = s.facilities.find((x) => x.id === id);
    if (!f) return { ok: false, error: 'Объект не найден' };
    if (f.level >= 5) return { ok: false, error: 'Максимальный уровень' };
    const cost = Sim.facilityUpgradeCost(f);
    if (s.money < cost) return { ok: false, error: 'Не хватает денег: нужно ' + U.money(cost) };
    s.money -= cost;
    f.level++;
    s.facVersion++;
    Sim.notice(s, 'good', `${C.facilityByKey[f.type].name} улучшен до ${f.level} уровня.`);
    s.sfx.push('coin');
    return { ok: true, cost };
  };
  Sim.demolishFacility = function (s, id) {
    const idx = s.facilities.findIndex((f) => f.id === id);
    if (idx < 0) return { ok: false, error: 'Объект не найден' };
    const f = s.facilities[idx];
    const def = C.facilityByKey[f.type];
    const refund = Math.round(def.cost * (f.ready ? 0.35 : 0.6));
    s.money += refund;
    s.facilities.splice(idx, 1);
    s.facVersion++;
    Sim.notice(s, 'info', `${def.name} снесён. Возврат ${U.money(refund)}.`);
    return { ok: true, refund };
  };

  /* ------------------------------------------------------- улучшения, банк */

  Sim.upgradeInfo = function (s, key) {
    const def = C.upgrades.find((u) => u.key === key);
    const lvl = s.upgrades[key];
    const maxed = lvl >= def.max;
    const cost = maxed ? 0 : Math.round(def.baseCost * Math.pow(def.growth, Math.max(0, lvl - (key === 'crew' ? 3 : 0))));
    return { def, lvl, maxed, cost };
  };
  Sim.buyUpgrade = function (s, key) {
    const info = Sim.upgradeInfo(s, key);
    if (info.maxed) return { ok: false, error: 'Максимальный уровень' };
    if (s.money < info.cost) return { ok: false, error: 'Не хватает денег: нужно ' + U.money(info.cost) };
    s.money -= info.cost;
    s.upgrades[key]++;
    if (key === 'fleet' || key === 'crew') Sim.invalidatePaths(s);
    Sim.notice(s, 'good', `${info.def.name}: уровень ${s.upgrades[key]}.`);
    s.sfx.push('levelup');
    return { ok: true };
  };

  Sim.loanLimit = function (s) {
    const fromValue = Math.round(Sim.companyValue(s) * 0.12);
    return Math.max(C.loanBaseLimit, fromValue) + (s.level - 1) * 20000;
  };
  Sim.takeLoan = function (s, amount) {
    const limit = Sim.loanLimit(s);
    const room = limit - s.debt;
    if (room <= 0) return { ok: false, error: 'Кредитный лимит исчерпан' };
    const sum = Math.min(amount, room);
    s.debt += sum;
    s.money += sum;
    Sim.notice(s, 'info', `Кредит получен: ${U.money(sum)}. Ставка ${(C.loanRate * 100).toFixed(1)}% в день.`);
    s.sfx.push('coin');
    return { ok: true, sum };
  };
  Sim.repayLoan = function (s, amount) {
    const sum = Math.min(amount, s.debt, s.money);
    if (sum <= 0) return { ok: false, error: 'Нечего погашать' };
    s.debt -= sum;
    s.money -= sum;
    Sim.notice(s, 'good', `Долг погашен на ${U.money(sum)}.`);
    return { ok: true, sum };
  };

  /* --------------------------------------------------------------- трафик */

  const KIND_COLORS = {
    car: ['#e6e2d8', '#d9624e', '#5a8fbf', '#6fb37a', '#c9b04a', '#9c7bc4', '#dcdcdc', '#4f5a66'],
    truck: ['#e7e3d6', '#c96a4a', '#5d7fa3', '#cfc9b8'],
    bus: ['#e8b545'],
    ev: ['#55d9c2'],
  };
  const WANTS = {
    car: ['food', 'fuel', 'wash', 'rest'],
    truck: ['fuel', 'food', 'repair', 'rest'],
    bus: ['food', 'rest', 'fuel', 'wash'],
    ev: ['charge', 'food', 'wash'],
  };

  function pickWants(kind) {
    const pool = WANTS[kind].slice();
    const count = Math.random() < 0.55 ? 2 : 1;
    const want = [];
    while (want.length < count && pool.length) {
      const i = Math.floor(Math.random() * pool.length);
      want.push(pool.splice(i, 1)[0]);
    }
    return want;
  }

  function weightedCityPick(s, ids, weightFn) {
    let total = 0;
    const weights = ids.map((id) => {
      const w = Math.max(0.05, weightFn(id));
      total += w;
      return w;
    });
    let r = Math.random() * total;
    for (let i = 0; i < ids.length; i++) {
      r -= weights[i];
      if (r <= 0) return ids[i];
    }
    return ids[ids.length - 1];
  }

  function spawnVehicle(s) {
    if (s.vehicles.length >= C.maxVehicles) return;
    const nb = Sim.neighbors(s);
    const sources = [];
    for (let i = 0; i < C.cities.length; i++) {
      if (nb.get(i).length > 0) sources.push(i);
    }
    if (!sources.length) return;
    const from = weightedCityPick(s, sources, (id) => s.cities[id].pop * s.cities[id].sat);
    const dests = Sim.reachable(s, from);
    if (!dests.length) return;
    const to = weightedCityPick(s, dests, (id) => {
      const d = U.dist(C.cities[from].x, C.cities[from].y, C.cities[id].x, C.cities[id].y);
      return s.cities[id].pop * (0.7 + Math.min(d, 90) / 110);
    });
    const path = Sim.findPath(s, from, to);
    if (!path || !path.length) return;
    const r = Math.random();
    const kind = r < 0.66 ? 'car' : r < 0.86 ? 'truck' : r < 0.94 ? 'ev' : 'bus';
    const colorSet = KIND_COLORS[kind];
    const v = {
      id: Math.random().toString(36).slice(2, 9),
      kind, color: colorSet[Math.floor(Math.random() * colorSet.length)],
      path, edgeIdx: 0, t: 0, dir: path[0].dir,
      want: pickWants(kind), stops: 2,
      pause: 0, x: 0, y: 0, angle: 0, lane: 0.22 + Math.random() * 0.34,
      from, to, hit: {},
      len: kind === 'truck' || kind === 'bus' ? 1.25 : 1,
    };
    placeVehicle(s, v, true);
    s.vehicles.push(v);
    s.stats.vehiclesToday++;
    onEnterRoad(s, v, Sim.roadById(s, path[0].roadId));
  }

  function placeVehicle(s, v, initial) {
    const step = v.path[v.edgeIdx];
    if (!step) return;
    const road = Sim.roadById(s, step.roadId);
    if (!road) return;
    const c = U.curve(road);
    const tw = step.dir === 1 ? v.t : 1 - v.t;
    const p = U.curvePoint(c, tw);
    const ang = U.curveAngle(c, tw);
    const lane = v.lane || 0.4;
    v.x = p.x + Math.cos(ang + Math.PI / 2) * lane * step.dir;
    v.y = p.y + Math.sin(ang + Math.PI / 2) * lane * step.dir;
    v.angle = ang + (step.dir === 1 ? 0 : Math.PI);
    if (initial) v.pause = 0.2 + Math.random() * 0.4;
  }

  function onEnterRoad(s, v, road) {
    if (!road) return;
    road.trafficToday++;
    const facs = Sim.facilitiesOnRoad(s, road.id);
    for (const f of facs) {
      if (!f.ready || !f.type) continue;
      const def = C.facilityByKey[f.type];
      if (def.edgeWide && def.key === 'toll') {
        const amount = addIncome(s, C.tollPrice * (1 + 0.1 * s.upgrades.quality) * (0.9 + Math.random() * 0.2), f);
        f.visitsToday++;
        f.totalVisits++;
        if (Math.random() < 0.5) addFloatAt(s, f, road, amount);
      }
    }
  }

  function addIncome(s, amount, facility, kind) {
    const rounded = Math.max(1, Math.round(amount));
    s.money += rounded;
    s.stats.incomeToday += rounded;
    s.stats.tradeToday += rounded;
    s.stats.totalIncome += rounded;
    if (facility) {
      facility.revenueToday += rounded;
      facility.totalRevenue += rounded;
    }
    return rounded;
  }

  function addFloatAt(s, facility, road, amount) {
    const c = U.curve(road);
    const p = U.curvePoint(c, facility.t);
    Sim.addFloat(s, p.x, p.y, '+' + U.num(amount) + ' ₽', 'coin');
  }

  function serviceVehicle(s, v, facility, road) {
    const def = C.facilityByKey[facility.type];
    const p = U.curvePoint(U.curve(road), facility.t);
    const fx = p.x, fy = p.y;
    void fx; void fy;

    if (def.passive) {
      if (def.edgeWide) return; // платный пункт считается при въезде
      if (Math.random() > 0.4) return; // не каждый смотрит на щит
      const amount = addIncome(s, def.perPass * (1 + 0.1 * (s.upgrades.quality)) * (0.8 + Math.random() * 0.4), facility);
      facility.visitsToday++;
      facility.totalVisits++;
      if (Math.random() < 0.35) Sim.addFloat(s, fx, fy, '+' + U.num(amount) + ' ₽', 'coin');
      return;
    }

    if (v.stops <= 0) return;
    if (!v.want.includes(def.want)) return;
    const light = road.light ? 1.06 : 1;
    const comfort = 1 + Sim.effectMul(s, 'comfort') * 0 + (road.light ? 0 : 0);
    let chance = def.chance * (0.75 + s.upgrades.marketing * 0.07) * light * comfort;
    if (Math.random() > chance) return;
    const capacity = def.capacity * (1 + 0.3 * (facility.level - 1));
    if (facility.visitsToday >= capacity) return;

    let multiplier = 1;
    multiplier *= 1 + 0.55 * (facility.level - 1);
    multiplier *= 1 + 0.1 * s.upgrades.quality;
    multiplier *= Sim.effectMul(s, 'income') * Sim.crisisMul(s, 'income');
    if (def.nightBonus && U.isNight(s.time)) multiplier *= def.nightBonus;
    if (U.isNight(s.time) && def.want === 'food') multiplier *= 1.15;

    const amount = addIncome(s, def.income * multiplier * (0.9 + Math.random() * 0.2), facility);
    facility.visitsToday++;
    facility.totalVisits++;
    s.stats.servicesToday++;
    s.stats.totalServices++;
    v.want = v.want.filter((w) => w !== def.want);
    v.stops--;
    v.pause = 0.35 + Math.random() * 0.5;
    addFloatAt(s, facility, road, amount);
    if (Math.random() < 0.16) s.sfx.push('coin');
    // иногда водитель пишет отзыв
    if (Math.random() < 0.006) {
      const phrases = [
        'Водители хвалят ' + def.name.toLowerCase() + ' — очередь.',
        'Водитель фуры оставил 5 звёзд: «быстро и по-человечески».',
        'Кто-то оставил чаевые на кассе. Мелочь, а приятно.',
      ];
      Sim.addNews(s, 'good', phrases[Math.floor(Math.random() * phrases.length)]);
    }
    return amount;
  }

  function updateVehicles(s, dt, dHours) {
    const step = dHours * C.trafficTimeMul;
    for (let i = s.vehicles.length - 1; i >= 0; i--) {
      const v = s.vehicles[i];
      if (v.pause > 0) {
        v.pause -= dt;
        continue;
      }
      let budget = step * C.roadTypes[0].speed;
      let road = Sim.roadById(s, v.path[v.edgeIdx].roadId);
      if (!road) { s.vehicles.splice(i, 1); continue; }
      const speed = Sim.roadSpeed(road, s) / C.roadTypes[0].speed;
      budget *= speed;

      let alive = true;
      let guard = 0;
      while (budget > 0 && guard++ < 12) {
        road = Sim.roadById(s, v.path[v.edgeIdx].roadId);
        if (!road) { alive = false; break; }
        const len = Math.max(2, road.totalKm);
        const remaining = (1 - v.t) * len;
        const facs = Sim.facilitiesOnRoad(s, road.id);
        const prevT = v.t;
        if (budget < remaining) {
          v.t += budget / len;
          budget = 0;
          checkPass(s, v, road, facs, prevT, v.t);
        } else {
          budget -= remaining;
          v.t = 1;
          checkPass(s, v, road, facs, prevT, 1);
          v.edgeIdx++;
          v.t = 0;
          if (v.edgeIdx >= v.path.length) { alive = false; break; }
          v.dir = v.path[v.edgeIdx].dir;
          onEnterRoad(s, v, Sim.roadById(s, v.path[v.edgeIdx].roadId));
        }
        if (v.pause > 0) break;
      }
      if (!alive) { s.vehicles.splice(i, 1); continue; }
      placeVehicle(s, v, false);
    }
  }

  function checkPass(s, v, road, facs, fromT, toT) {
    if (!facs || !facs.length) return;
    const step = v.dir;
    for (let k = 0; k < facs.length; k++) {
      const f = facs[k];
      if (!f.ready) continue;
      const crossed = step === 1
        ? f.t > fromT && f.t <= toT
        : f.t < fromT && f.t >= toT;
      if (!crossed) continue;
      const key = f.id;
      if (v.hit[key + ':' + road.id]) continue;
      v.hit[key + ':' + road.id] = 1;
      serviceVehicle(s, v, f, road);
      if (v.pause > 0) return;
    }
  }

  /* ------------------------------------------------------ довольство города */

  function updateCities(s) {
    for (let i = 0; i < C.cities.length; i++) {
      const city = s.cities[i];
      const c = C.cities[i];
      let beauty = 0, services = 0;
      for (const f of s.facilities) {
        if (!f.ready) continue;
        const road = Sim.roadById(s, f.roadId);
        if (!road) continue;
        const p = U.curvePoint(U.curve(road), f.t);
        const d = U.dist(c.x, c.y, p.x, p.y);
        const def = C.facilityByKey[f.type];
        if (def.cat === 'city' && d < 26) beauty += def.beauty * (1 + 0.3 * (f.level - 1));
        if (def.cat === 'service' && d < 16) services += 0.025;
      }
      let sat = 0.95 + Math.min(0.55, beauty) + Math.min(0.15, services);
      sat *= Sim.effectMul(s, 'comfort');
      city.sat = U.clamp(sat, 0.6, 1.8);
      // города понемногу растут, если о них заботятся
      if (city.sat > 1.05) {
        city.pop = Math.min(150000, city.pop * 1.0008);
      }
    }
  }

  /* ------------------------------------------------------------- контракты */

  function pickWeighted(list, key) {
    let total = 0;
    for (const item of list) total += item[key] || 1;
    let r = Math.random() * total;
    for (const item of list) {
      r -= item[key] || 1;
      if (r <= 0) return item;
    }
    return list[list.length - 1];
  }

  Sim.spawnContract = function (s, force) {
    if (!force && s.contracts.length >= 3) return null;
    if (s.contracts.length >= 4) return null;
    const kind = pickWeighted(C.contractPool, 'weight').kind;
    const contract = { id: s.nextContractId++, kind, expires: s.time + 3 + Math.random() * 3, xp: 100 };

    if (kind === 'connect') {
      const pairs = [];
      for (let a = 0; a < C.cities.length; a++) {
        for (let b = a + 1; b < C.cities.length; b++) {
          const d = U.dist(C.cities[a].x, C.cities[a].y, C.cities[b].x, C.cities[b].y);
          if (d < 10 || d > 70) continue;
          if (s.roads.some((r) => (r.a === a && r.b === b) || (r.a === b && r.b === a))) continue;
          pairs.push({ a, b, d });
        }
      }
      if (!pairs.length) return null;
      const pair = pairs[Math.floor(Math.random() * pairs.length)];
      contract.params = { a: pair.a, b: pair.b };
      contract.title = `Дорога ${C.cities[pair.a].name} — ${C.cities[pair.b].name}`;
      contract.desc = `Проложите дорогу между городами (${Math.round(pair.d)} км). Любой класс покрытия.`;
      contract.reward = Math.round(14000 + pair.d * 520);
      contract.xp = 180;
    } else if (kind === 'facility') {
      const options = C.facilities.filter((f) => f.cat === 'service' && !f.passive && f.unlock <= s.level);
      if (!options.length) return null;
      const def = options[Math.floor(Math.random() * options.length)];
      const count = 1 + (Math.random() < 0.3 ? 1 : 0);
      contract.params = { type: def.key, count };
      contract.title = `${def.name} × ${count}`;
      contract.desc = `Постройте ${count} ${U.plural(count, 'объект', 'объекта', 'объектов')} «${def.name}» у любой дороги.`;
      contract.reward = Math.round(def.cost * 0.85 * count + 6000);
      contract.xp = 140;
    } else if (kind === 'beauty') {
      const count = 2 + Math.floor(Math.random() * 2);
      contract.params = { count };
      contract.title = `Благоустройство: ${count} ${U.plural(count, 'объект', 'объекта', 'объектов')}`;
      contract.desc = `Поставьте ${count} объекта благоустройства (озеленение, остановка, освещение, сквер).`;
      contract.reward = Math.round(9000 + count * 8000);
      contract.xp = 130;
    } else {
      const km = 20 + Math.round(Math.random() * 20);
      contract.params = { km, quality: 2 };
      contract.title = `Асфальт: ${km} км`;
      contract.desc = `Уложите асфальт или автобан суммарно на ${km} км.`;
      contract.reward = Math.round(km * 1250 + 8000);
      contract.xp = 200;
    }
    s.contracts.push(contract);
    Sim.notice(s, 'contract', `Новый заказ: ${contract.title} · ${U.money(contract.reward)}`);
    s.sfx.push('contract');
    return contract;
  };

  Sim.contractProgress = function (s, c) {
    if (c.kind === 'connect') {
      const road = s.roads.find((r) => r.open && ((r.a === c.params.a && r.b === c.params.b) || (r.a === c.params.b && r.b === c.params.a)));
      const building = s.roads.find((r) => r.building && ((r.a === c.params.a && r.b === c.params.b) || (r.a === c.params.b && r.b === c.params.a)));
      return {
        done: !!road,
        text: road ? 'Дорога готова' : building ? `Строится: ${Math.round((building.builtKm / building.totalKm) * 100)}%` : 'Дороги пока нет',
        ratio: road ? 1 : building ? building.builtKm / building.totalKm : 0,
      };
    }
    if (c.kind === 'facility') {
      const count = s.facilities.filter((f) => f.type === c.params.type).length;
      return { done: count >= c.params.count, text: `${Math.min(count, c.params.count)} / ${c.params.count}`, ratio: Math.min(1, count / c.params.count) };
    }
    if (c.kind === 'beauty') {
      const keys = ['trees', 'busstop', 'lights', 'square'];
      const count = s.facilities.filter((f) => keys.includes(f.type)).length;
      return { done: count >= c.params.count, text: `${Math.min(count, c.params.count)} / ${c.params.count}`, ratio: Math.min(1, count / c.params.count) };
    }
    const km = s.roads.reduce((sum, r) => sum + (r.open && r.quality >= 2 ? r.totalKm : 0), 0);
    return { done: km >= c.params.km, text: `${Math.round(km)} / ${c.params.km} км`, ratio: Math.min(1, km / c.params.km) };
  };

  function updateContracts(s) {
    for (let i = s.contracts.length - 1; i >= 0; i--) {
      const c = s.contracts[i];
      const p = Sim.contractProgress(s, c);
      if (p.done) {
        s.contracts.splice(i, 1);
        s.money += c.reward;
        s.stats.incomeToday += c.reward;
        s.stats.totalIncome += c.reward;
        Sim.addXp(s, c.xp);
        Sim.notice(s, 'contract', `Заказ выполнен: ${c.title} · +${U.money(c.reward)}`);
        Sim.addNews(s, 'contract', `Выполнен заказ «${c.title}» — ${U.money(c.reward)}.`);
        s.sfx.push('contract');
      } else if (s.time > c.expires) {
        s.contracts.splice(i, 1);
        Sim.notice(s, 'bad', `Заказ просрочен: ${c.title}`);
      }
    }
  }

  /* --------------------------------------------------------------- цели */

  function checkObjectives(s) {
    let changed = false;
    for (const o of C.objectives) {
      if (s.objDone.includes(o.id)) continue;
      let done = false;
      try { done = o.check(s); } catch (e) { done = false; }
      if (!done) continue;
      s.objDone.push(o.id);
      changed = true;
      if (o.reward) {
        // награда за цель — разовое поступление: касса и общий итог, но не «выручка дня»
        s.money += o.reward;
        s.stats.totalIncome += o.reward;
      }
      Sim.addXp(s, o.xp);
      Sim.notice(s, 'objective', `Цель: «${o.title}» — +${U.money(o.reward)}`);
      Sim.addNews(s, 'objective', `Цель выполнена: ${o.title}.`);
      s.sfx.push('objective');
    }
    if (changed) {
      let idx = 0;
      while (idx < C.objectives.length && s.objDone.includes(C.objectives[idx].id)) idx++;
      s.objIndex = idx;
      if (s.objDone.length >= C.objectives.length && !s.won) {
        s.won = true;
        Sim.notice(s, 'win', 'Дорожная империя построена! Вы можете продолжать развивать сеть.');
      }
    }
  }

  Sim.currentObjective = function (s) {
    for (const o of C.objectives) if (!s.objDone.includes(o.id)) return o;
    return null;
  };

  /* ------------------------------------------------------------- события */

  function triggerEvent(s) {
    const ev = pickWeighted(C.events, 'weight');
    const city = C.cities[Math.floor(Math.random() * C.cities.length)];
    s.nextEventDay = s.time + 1.6 + Math.random() * 2.4;
    // не повторяем одно и то же событие подряд
    if (s.lastEvent === ev.id) return;
    s.lastEvent = ev.id;
    try { ev.apply(s, city); } catch (e) { /* защита от ошибок в событии */ }
    const title = ev.title.replace('{city}', city.name);
    const text = ev.text.replace(/{city}/g, city.name);
    Sim.addNews(s, ev.good ? 'event' : 'bad', `${title}. ${text}`);
    s.sfx.push(ev.good ? 'event' : 'bad');
  }

  /* ---------------------------------------------------------- конец дня */

  function finishDay(s) {
    const subsidies = Sim.subsidies(s);
    if (subsidies > 0) {
      s.money += subsidies;
      s.stats.incomeToday += subsidies;
      s.stats.totalIncome += subsidies;
    }
    const upkeep = Sim.roadUpkeep(s) + Sim.facilityUpkeep(s);
    const salaries = Sim.salaries(s);
    const interest = Sim.interest(s);
    const tax = s.stats.incomeToday * C.taxRate * Sim.crisisMul(s, 'tax');
    const expense = upkeep + salaries + interest + tax;
    s.money -= expense;
    s.stats.totalExpense += expense;
    s.stats.expenseToday = expense;
    s.stats.expenseLastDay = expense;
    s.stats.incomeLastDay = s.stats.incomeToday;

    const day = U.dayNumber(s.time);
    s.stats.history.unshift({
      day, income: Math.round(s.stats.incomeToday), expense: Math.round(expense),
      net: Math.round(s.stats.incomeToday - expense),
      services: s.stats.servicesToday, vehicles: s.stats.vehiclesToday, trade: Math.round(s.stats.tradeToday),
    });
    if (s.stats.history.length > 24) s.stats.history.pop();

    s.dailyReport = {
      day,
      income: Math.round(s.stats.incomeToday),
      expense: Math.round(expense),
      net: Math.round(s.stats.incomeToday - expense),
      upkeep: Math.round(upkeep),
      salaries: Math.round(salaries),
      tax: Math.round(tax),
      interest: Math.round(interest),
      subsidies: Math.round(subsidies),
      services: s.stats.servicesToday,
      vehicles: s.stats.vehiclesToday,
    };

    for (const f of s.facilities) {
      f.revenueLastDay = f.revenueToday;
      f.revenueToday = 0;
      f.visitsToday = 0;
    }
    for (const r of s.roads) r.trafficToday = 0;

    s.stats.incomeToday = 0;
    s.stats.expenseToday = 0;
    s.stats.servicesToday = 0;
    s.stats.vehiclesToday = 0;
    s.stats.tradeToday = 0;

    Sim.addXp(s, Math.round(s.dailyReport.income / 90));
    Sim.addNews(s, 'day', `Итоги дня ${day}: выручка ${U.money(s.dailyReport.income)}, расходы ${U.money(expense)}.`);

    if (s.money < 0) Sim.notice(s, 'bad', 'Касса в минусе! Возьмите кредит или урежьте расходы.');
    if (Math.random() < 0.5) Sim.spawnContract(s, false);
    if (s.time >= s.nextEventDay) triggerEvent(s);
    checkObjectives(s);
  }

  /* --------------------------------------------------------------- тик */

  Sim.tick = function (s, dt) {
    if (dt <= 0) return;
    const dHours = dt * C.hoursPerSecond;
    const dDays = dHours / 24;
    const prevDay = Math.floor(s.time);
    s.time += dDays;

    // кризисы
    if (s.crisis && s.time >= s.crisis.until) {
      const t = s.crisis.title;
      s.crisis = null;
      Sim.notice(s, 'good', `Кризис «${t}» закончился.`);
      Sim.addNews(s, 'good', `Кризис «${t}» закончился — экономика восстанавливается.`);
      s.sfx.push('good');
    }
    if (!s.crisis && s.time >= (s.nextCrisisDay || 7)) Sim.startCrisis(s);

    // стройка
    const projects = s.roads.filter((r) => r.building).length + s.facilities.filter((f) => !f.ready).length;
    if (projects > 0) {
      const rate = Sim.buildRate(s) / projects;
      for (const r of s.roads) {
        if (!r.building) continue;
        r.builtKm = Math.min(r.totalKm, r.builtKm + rate * dDays);
        if (r.builtKm >= r.totalKm - 1e-6) {
          r.building = false;
          r.open = true;
          r.quality = r.target;
          r.builtKm = r.totalKm;
          Sim.invalidatePaths(s);
          Sim.addXp(s, 80 + Math.round(r.totalKm * 4));
          Sim.notice(s, 'good', `Готово: ${C.cities[r.a].name} — ${C.cities[r.b].name} (${C.roadTypes[r.quality].name}).`);
          Sim.addNews(s, 'build', `Открыта дорога ${C.cities[r.a].name} — ${C.cities[r.b].name}.`);
          s.sfx.push('ready');
        }
      }
      for (const f of s.facilities) {
        if (f.ready) continue;
        const def = C.facilityByKey[f.type];
        f.progress = Math.min(1, f.progress + (dDays / def.buildDays) * Sim.crewFactor(s));
        if (f.progress >= 1) {
          f.ready = true;
          Sim.notice(s, 'good', `${def.name} открыт и принимает клиентов.`);
          s.sfx.push('ready');
        }
      }
    }

    // эффекты
    for (let i = s.effects.length - 1; i >= 0; i--) {
      if (s.effects[i].until <= s.time) {
        s.effects.splice(i, 1);
        Sim.invalidatePaths(s);
      }
    }

    // перекрытия
    let reopened = false;
    for (const r of s.roads) {
      if (r.blockedUntil && r.blockedUntil <= s.time) {
        r.blockedUntil = 0;
        reopened = true;
      }
    }
    if (reopened) Sim.invalidatePaths(s);

    // трафик
    const trafficMul = Sim.effectMul(s, 'traffic') * Sim.crisisMul(s, 'traffic');
    for (let i = 0; i < C.cities.length; i++) {
      const city = s.cities[i];
      const hasRoad = Sim.neighbors(s).get(i).length > 0;
      if (!hasRoad) { city.acc = 0; continue; }
      city.acc += (city.pop / 1000) * 4.2 * city.sat * trafficMul * dDays;
      let guard = 0;
      while (city.acc >= 1 && guard++ < 6) {
        city.acc -= 1;
        spawnVehicle(s);
      }
      if (city.acc > 6) city.acc = 6;
    }
    updateVehicles(s, dt, dHours);

    // довольство городов — несколько раз в день
    s.satTimer = (s.satTimer || 0) + dDays;
    if (s.satTimer > 0.18) { s.satTimer = 0; updateCities(s); }

    // заказы
    s.contractTimer = (s.contractTimer || 0) + dDays;
    if (s.contractTimer > 0.12) { s.contractTimer = 0; updateContracts(s); }

    // цели
    s.objTimer = (s.objTimer || 0) + dt;
    if (s.objTimer > 0.8) { s.objTimer = 0; checkObjectives(s); }

    if (Math.floor(s.time) > prevDay) finishDay(s);
  };

  /* Прогноз и вспомогательные данные для интерфейса */
  Sim.forecast = function (s) {
    const h = s.stats.history;
    if (!h.length) return { net: 0, income: 0, expense: 0 };
    const n = Math.min(3, h.length);
    let inc = 0, exp = 0;
    for (let i = 0; i < n; i++) { inc += h[i].income; exp += h[i].expense; }
    return { net: (inc - exp) / n, income: inc / n, expense: exp / n };
  };

  Sim.facilityTraffic = function (s, f) {
    const road = Sim.roadById(s, f.roadId);
    return road ? road.trafficToday : 0;
  };

  Sim.upgradeList = function (s) {
    return C.upgrades.map((u) => Sim.upgradeInfo(s, u.key));
  };

  Sim.serializable = function (s) {
    const copy = Object.assign({}, s);
    copy.vehicles = [];
    copy.notices = [];
    copy.floats = [];
    copy.sfx = [];
    copy.dailyReport = null;
    return copy;
  };

  Sim.deserialize = function (data) {
    if (!data || data.v !== C.version) return null;
    const s = Object.assign(Sim.newGame(data.seed), data);
    s.vehicles = [];
    s.notices = [];
    s.floats = [];
    s.sfx = [];
    s.dailyReport = null;
    // восстановим вычисляемые поля
    s.roads.forEach((r) => { if (!r.builtKm && r.open) r.builtKm = r.totalKm; });
    if (typeof s.stats.tradeToday !== 'number') s.stats.tradeToday = 0;
    Sim.invalidatePaths(s);
    return s;
  };
})();
