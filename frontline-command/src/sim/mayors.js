// ============================================================
//  МЭРЫ ПОВЕРХ ШТАБА — мозги городов из COUNTRY ATLAS на фронтлайне.
//
//  В COUNTRY ATLAS каждый город живёт своей жизнью: у него есть мэр,
//  бюджет, жилищный спрос, загруженность школ и больниц, пробки,
//  настроение, безработица и возраст моста. Раз в игровой день мэр
//  выбирает одно полезное дело — и в журнале остаётся строка «почему»:
//  какие факторы перевесили. Это и есть «мозги страны».
//
//  В FRONTLINE есть штаб: StrategicAI считает секторы, копит силы и
//  выдаёт директивы отрядам. Он хорошо воюет, но ничего не понимает в
//  городах: для него city — просто точка с ценой 1.5.
//
//  Здесь эти два слоя соединяются. Мэр города — не декоративный счётчик
//  состояния, а надстройка над штабом:
//
//    1. Мэр решает, что городу нужнее (жильё, больница, объездная…), и
//       платит за это из бюджета, который наполняется налогами. Тот же
//       расчёт utility, что и в COUNTRY ATLAS, — с журналом «почему».
//    2. Решение мэра становится ЗАКАЗОМ для штаба. Город с переполненным
//       жильём требует обороны (штаб держит там гарнизон), город с
//       деньгами на объездную требует, чтобы через него шло снабжение,
//       а недавно взятый город просит время закрепиться.
//    3. Штаб видит эти заказы как поправку к привлекательности сектора:
//       attack и defense считаются с весом от мэров, а не только от
//       силы и цены точки.
//    4. Что вышло — записывается обратно в город: бой рядом портит
//       настроение и пробки, взятие города даёт бюджет, долгая осада
//       старит мост. Мэр отвечает на это на следующий день.
//
//  Порядок вызовов: mayors.update(dt) ДО strategic[i].plan(). Тогда штаб
//  планирует уже с учётом того, что решили города.
// ============================================================
import { clamp } from '../core/mathx.js';

/* Действия мэра — те же, что в COUNTRY ATLAS, но с фронтлайновым
   смыслом. need — когда действие вообще имеет смысл; cost — доля
   бюджета; weight — насколько сильно решение подталкивает штаб. */
export const MAYOR_ACTIONS = [
  { id: 'housing', name: 'жилой квартал', cost: 0.22, weight: 0.9,
    need: (m) => m.housingDemand > 1.1 },
  { id: 'hospital', name: 'больница', cost: 0.24, weight: 1.1,
    need: (m) => m.socialLoad > 1.0 },
  { id: 'school', name: 'школа', cost: 0.18, weight: 0.6,
    need: (m) => m.socialLoad > 0.8 && m.socialLoad <= 1.0 },
  { id: 'road', name: 'расширение дороги', cost: 0.2, weight: 0.8,
    need: (m) => m.jams > 0.55 },
  { id: 'bypass', name: 'объездная', cost: 0.34, weight: 1.2,
    need: (m) => m.jams > 0.8 },
  { id: 'park', name: 'парк', cost: 0.12, weight: 0.5,
    need: (m) => m.mood < 0.55 },
  { id: 'industry', name: 'промзона', cost: 0.26, weight: 0.7,
    need: (m) => m.unemployment > 0.12 },
  { id: 'bridge', name: 'ремонт моста', cost: 0.15, weight: 0.55,
    need: (m) => m.bridgeAge > 40 },
  { id: 'fortify', name: 'укрепления', cost: 0.3, weight: 1.5,
    need: (m) => m.frontline > 0.55 },
  { id: 'supply', name: 'склад снабжения', cost: 0.24, weight: 1.0,
    need: (m) => m.supplyStrain > 0.6 },
];

const ACTION_BY_ID = new Map(MAYOR_ACTIONS.map((a) => [a.id, a]));

/* Детерминированный генератор: те же сиды — те же мэры. */
function makeRng(seed) {
  let a = (seed >>> 0) || 1;
  return function rng() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* «Почему» — короткая строка с двумя самыми весомыми факторами.
   Ровно то же поведение, что whуText в COUNTRY ATLAS, чтобы журнал
   читался одинаково в обоих разделах. */
const PART_NAMES = {
  benefit: 'польза', price: 'цена', politics: 'политика',
  space: 'место', trend: 'тренд', fear: 'страх фронта',
};

export function whyText(mayor, action, u) {
  const parts = Object.entries(u.parts)
    .filter(([, v]) => Math.abs(v) > 0.005)
    .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
    .slice(0, 2)
    .map(([k, v]) => (PART_NAMES[k] || k) + ' ' + (v >= 0 ? '+' : '') + v.toFixed(2))
    .join(', ');
  return mayor.name + ': ' + action.name + ' — ' + (parts || 'накопление') +
    ' (итог ' + u.score.toFixed(2) + ')';
}

/* Выгода от действия — в терминах города, а не страны в целом. */
function benefitOf(m, action) {
  switch (action.id) {
    case 'housing': return (m.housingDemand - 1) * 1.7;
    case 'hospital': return m.socialLoad * 0.9;
    case 'school': return m.socialLoad * 0.7;
    case 'road': return m.jams * 1.2;
    case 'bypass': return m.jams * 0.95;
    case 'park': return (1 - m.mood) * 1.3;
    case 'industry': return m.unemployment * 4.0;
    case 'bridge': return (m.bridgeAge - 40) / 40;
    /* Укрепления нужны там, где фронт близко: город у передовой тратит
       на бетон охотнее, чем тыловой. */
    case 'fortify': return m.frontline * 2.2 - 0.4;
    case 'supply': return m.supplyStrain * 1.8 - 0.3;
    default: return 0;
  }
}

/*
 * Полезность действия: пять факторов, как в COUNTRY ATLAS
 * (польза, цена, политика, место, тренд) плюс шестой — страх фронта.
 * Именно наличие фронта делает эти мозги фронтлайновыми: без него
 * мэр жил бы обычной городской жизнью и не замечал войны.
 */
export function utility(mayor, action) {
  const m = mayor;
  const benefit = benefitOf(m, action);
  const price = -action.cost * 1.8 * (1 - m.budget);
  const politics = 0.22 * Math.sin((m.politics || 0) + action.cost * 6);
  const space = (action.id === 'housing' || action.id === 'industry')
    ? (m.freeLand - 0.3) * 0.7 : 0.1;
  const trend = 0.16 * Math.cos((m.day || 0) / 9 + action.cost * 4);
  /* Страх: когда бой у самого города, укрепления и снабжение выигрывают
     у парка и школы. Это не запрет — просто вес. */
  const fear = m.frontline * (action.id === 'fortify' ? 1.0 : action.id === 'supply' ? 0.5 : -0.25);
  const score = benefit + price + politics + space + trend + fear;
  return { score, parts: { benefit, price, politics, space, trend, fear } };
}

function applyDecision(mayor, action) {
  switch (action.id) {
    case 'housing':
      mayor.housingDemand = Math.max(0.8, mayor.housingDemand - 0.35);
      mayor.freeLand = Math.max(0, mayor.freeLand - 0.1);
      mayor.socialLoad += 0.05; break;
    case 'school':
      mayor.socialLoad = Math.max(0.3, mayor.socialLoad - 0.3);
      mayor.mood = Math.min(1, mayor.mood + 0.05); break;
    case 'hospital':
      mayor.socialLoad = Math.max(0.3, mayor.socialLoad - 0.45);
      mayor.mood = Math.min(1, mayor.mood + 0.08); break;
    case 'road': mayor.jams = Math.max(0, mayor.jams - 0.2); break;
    case 'bypass':
      mayor.jams = Math.max(0, mayor.jams - 0.35);
      mayor.freeLand = Math.max(0, mayor.freeLand - 0.08); break;
    case 'park': mayor.mood = Math.min(1, mayor.mood + 0.22); break;
    case 'industry':
      mayor.unemployment = Math.max(0.02, mayor.unemployment - 0.05);
      mayor.jams = Math.min(1, mayor.jams + 0.06); break;
    case 'bridge': mayor.bridgeAge = 0; break;
    case 'fortify':
      mayor.fortify = clamp((mayor.fortify || 0) + 0.45, 0, 1);
      mayor.mood = Math.max(0, mayor.mood - 0.02); break;
    case 'supply':
      mayor.supplyStrain = Math.max(0, mayor.supplyStrain - 0.5);
      mayor.supply = clamp((mayor.supply || 0) + 0.4, 0, 1); break;
  }
}

/*
 * Совет мэра штабу — то, ради чего этот модуль существует.
 * Возвращает { attack, defense, supply, reason }: поправки к оценке
 * сектора. Штаб складывает их со своими и решает уже иначе.
 */
export function advisory(mayor) {
  const m = mayor;
  let attack = 0;
  let defense = 0;
  let supply = 0;
  const notes = [];

  /* Город, который только что взяли, просит время закрепиться: мэр
     боится контрудара и просит гарнизон. */
  if (m.justCaptured > 0) {
    defense += 0.7 * m.justCaptured;
    notes.push('только взят');
  }
  /* Переполненное жильё и загруженные больницы — город кормит армию, но
     сам на грани: оборона важнее нового наступления. */
  if (m.housingDemand > 1.25) { defense += 0.5; notes.push('жилья нет'); }
  if (m.socialLoad > 1.3) { defense += 0.45; notes.push('больницы полны'); }
  /* Укрепления и склады прямо конвертируются в обороноспособность. */
  defense += (m.fortify || 0) * 0.8;
  supply += (m.supply || 0) * 0.7;

  /* Промзона и большой бюджет — город способен содержать наступление:
     он платит за боеприпасы и технику. */
  /* Город может подтолкнуть штаб, но не приказывать ему. Пределы ниже
     штрафа памяти (0.45 за первое предупреждение): если здесь уже дважды
     отступали, тёплое мнение мэра не отменяет выученный урок. */
  /* Бюджет и рабочие руки — довод за НАСТУПЛЕНИЕ, и он обращён к тем
     секторам, куда войска ещё не пришли. Уже занятый собственным
     гарнизоном сектор мэр не просит атаковать: там он просит держать. */
  if (m.budget > 0.62) { attack += 0.18; notes.push('бюджет полон'); }
  if (m.unemployment > 0.15) { attack += 0.12; notes.push('лишние руки'); }
  if (m.mood < 0.35) { attack -= 0.35; notes.push('город устал'); }
  /* Пробки: через такой город снабжение идёт медленно, и штаб должен
     знать, что опираться на него в наступлении рискованно. */
  if (m.jams > 0.7) { supply -= 0.4; notes.push('пробки'); }

  return {
    attack,
    defense,
    supply,
    reason: notes.length ? notes.join(' · ') : 'спокойно',
  };
}

/* ---------- сам слой мэров ---------- */

export class Mayors {
  constructor(game) {
    this.game = game;
    this.enabled = game.cfg?.ai?.mayors?.enabled !== false;
    this.day = 0;
    this.dayTimer = 0;
    this.dayLength = game.cfg?.ai?.mayors?.daySeconds ?? 6;
    this.journal = [];
    this.byPoint = new Map();
    this.list = [];
    this.lastTick = null;
    this.seed = (game.seed || 1) >>> 0;
    if (this.enabled) this.build();
  }

  /* Городами считаются точки city — те же, что штаб зовёт «city» и
     ценит в 1.5. Штабные точки (hq, depot, factory) остаются за штабом:
     это военные объекты, а не городская жизнь. */
  build() {
    const game = this.game;
    const rand = makeRng(this.seed ^ 0x5eed);
    /* Точки мира не переезжают: ссылку на точку и сектор города можно
       найти один раз при построении, а не в каждом совете штабу. Совет
       запрашивается на каждый сектор при каждом плане, поэтому поиски
       по всем точкам там — лишняя работа на пустом месте. */
    this.pointById = new Map(game.world.points.map((p) => [p.id, p]));
    const cities = game.world.points.filter((p) => p.type === 'city');
    for (const p of cities) {
      const r = rand();
      const mayor = {
        name: p.name || ('город ' + (p.index + 1)),
        pointId: p.id,
        x: p.x, y: p.y,
        index: p.index,
        home: p.home,
        budget: 0.35 + 0.5 * r,
        housingDemand: 0.9 + 0.4 * r,
        socialLoad: 0.5 + 0.6 * r,
        jams: 0.2 + 0.5 * r,
        mood: 0.45 + 0.4 * r,
        unemployment: 0.05 + 0.12 * r,
        bridgeAge: 10 + 45 * r,
        freeLand: 0.3 + 0.4 * r,
        politics: r * 6.28,
        day: 0,
        decisions: 0,
        log: [],
        // фронтлайновые поля
        front: 0,          // 0..1, насколько близко бой
        frontline: 0,      // то же, но уже сглаженное — «страх фронта»
        supplyStrain: 0,   // 0..1, насколько город растянут снабжением
        fortify: 0,        // накопленные укрепления
        supply: 0,         // накопленный запас
        justCaptured: 0,   // 1 → только что взят, гаснет со временем
        owner: p.owner,
        underFire: false,
        sectorId: game.world.sectorAt(p.x, p.y)?.id ?? -1,
      };
      this.list.push(mayor);
      this.byPoint.set(p.id, mayor);
    }
  }

  get size() { return this.list.length; }

  /* ---------- наблюдение за боем ---------- */

  /* Насколько близко к городу идёт бой. Считаем по живым юнитам всех
     фракций в радиусе близости; город с боем под стенами чувствует
     войну, тиловой — нет. */
  measureFront(mayor) {
    const game = this.game;
    const near = 900;
    let enemies = 0;
    let own = 0;
    for (const u of game.units.values()) {
      if (!u.alive) continue;
      const d = Math.hypot(u.x - mayor.x, u.y - mayor.y);
      if (d > near) continue;
      if (u.faction === mayor.home) own++; else enemies++;
    }
    const pressure = Math.min(1, enemies / 14) * (own > 0 ? 1 : 0.75);
    return { front: pressure, enemies, own };
  }

  /* Раз в день мэр делает ход. Возвращает список решений — для тестов и HUD. */
  tickDay() {
    if (!this.enabled) return [];
    const game = this.game;
    const rand = makeRng(this.seed ^ (this.day * 2654435761));
    this.day++;
    const decisions = [];

    for (const m of this.list) {
      const point = this.pointById?.get(m.pointId) || null;
      if (point) {
        /* Смена хозяина — событие для города: бюджет на восстановление,
           страх контрудара, настроение падает. */
        if (point.owner !== m.owner) {
          if (point.owner === m.home) {
            m.justCaptured = 1;
            m.budget = Math.min(1, m.budget + 0.18);
            m.mood = Math.max(0, m.mood - 0.05);
          } else {
            m.mood = Math.max(0, m.mood - 0.2);
            m.budget = Math.max(0, m.budget - 0.15);
          }
          m.owner = point.owner;
        }
        /* Бой у города: настроение вниз, пробки вверх (колонны, госпитали,
           беженцы), мост стареет от нагрузкой техники. */
        const { front } = this.measureFront(m);
        m.front = front;
        m.frontline = clamp(m.frontline * 0.6 + front * 0.4, 0, 1);
        m.underFire = front > 0.45;
        if (m.underFire) {
          m.mood = Math.max(0, m.mood - 0.06);
          m.jams = Math.min(1, m.jams + 0.07);
          m.bridgeAge += 0.4;
        } else {
          m.mood = Math.min(1, m.mood + 0.02);
          m.jams = Math.max(0, m.jams - 0.03);
        }
        /* Снабжение: город у передовой растягивает логистику штаба. */
        m.supplyStrain = clamp(m.supplyStrain + (m.underFire ? 0.18 : -0.06), 0, 1);
      }
      m.justCaptured = Math.max(0, m.justCaptured - 0.34);

      /* Сам расчёт — тот же, что в COUNTRY ATLAS: до трёх дел в день,
         каждое только если есть нужда и хватает бюджета. */
      m.day++;
      const n = 1 + (rand() < 0.45 ? 1 : 0) + (rand() < 0.15 ? 1 : 0);
      for (let k = 0; k < n; k++) {
        let best = null;
        for (const action of MAYOR_ACTIONS) {
          if (!action.need(m)) continue;
          if (action.cost > m.budget) continue;
          const u = utility(m, action);
          const noised = u.score + (rand() - 0.5) * 0.08;
          if (!best || noised > best.noised) best = { action, u, noised };
        }
        if (!best || best.u.score <= 0) break;
        m.budget = Math.max(0, m.budget - best.action.cost);
        m.decisions++;
        applyDecision(m, best.action);
        const why = whyText(m, best.action, best.u);
        m.log.push(why);
        if (m.log.length > 12) m.log.shift();
        this.pushJournal({ day: this.day, city: m.name, text: why });
        decisions.push({ day: this.day, pointId: m.pointId, city: m.name, action: best.action.id, text: why });
      }

      /* Городская жизнь идёт своим ходом. */
      m.housingDemand = Math.max(0.6, m.housingDemand + (rand() - 0.45) * 0.08);
      m.socialLoad = Math.min(2, m.socialLoad + (rand() - 0.5) * 0.05);
      m.mood = Math.min(1, Math.max(0, m.mood + (rand() - 0.55) * 0.06));
      m.bridgeAge += 1 / 12;
      m.budget = Math.min(1, m.budget + 0.04);
      m.politics += 0.31;
      m.fortify = Math.max(0, (m.fortify || 0) - 0.02);
      m.supply = Math.max(0, (m.supply || 0) - 0.02);
    }
    this.lastTick = { day: this.day, decisions };
    return decisions;
  }

  pushJournal(entry, cap = 60) {
    this.journal.push(entry);
    while (this.journal.length > cap) this.journal.shift();
    return this.journal;
  }

  update(dt) {
    if (!this.enabled) return null;
    this.dayTimer += dt;
    /* День мэра не равен игровому дню: на фронте всё быстрее, поэтому
       по умолчанию один городской день — 6 секунд боя. */
    if (this.dayTimer < this.dayLength) return null;
    this.dayTimer = 0;
    return this.tickDay();
  }

  /* ---------- то, что читает штаб ---------- */

  /* Поправки к оценке сектора. Сектор получает сумму по своим городам,
     нормированную по числу городов: два малых города не должны
     перевешивать один большой. */
  adviceForSector(sectorId) {
    if (!this.enabled) return null;
    const game = this.game;
    let attack = 0, defense = 0, supply = 0;
    let count = 0;
    const notes = [];
    for (const m of this.list) {
      if (m.sectorId !== sectorId) continue;
      const p = this.pointById?.get(m.pointId);
      if (!p) continue;
      if (p.owner !== m.home) continue;   // захваченный чужой город мэра не слушает
      const adv = advisory(m);
      attack += adv.attack;
      defense += adv.defense;
      supply += adv.supply;
      count++;
      if (adv.reason !== 'спокойно') notes.push(m.name + ': ' + adv.reason);
    }
    if (!count) return null;
    return {
      attack: attack / count,
      defense: defense / count,
      supply: supply / count,
      count,
      notes,
    };
  }

  /* Сводка для HUD и тестов — как mayorStats в COUNTRY ATLAS. */
  stats() {
    if (!this.list.length) {
      return { count: 0, decisions: 0, jams: 0, mood: 0, budget: 0, underFire: 0, fortify: 0, day: this.day };
    }
    let dec = 0, jams = 0, mood = 0, budget = 0, underFire = 0, fortify = 0;
    for (const m of this.list) {
      dec += m.decisions; jams += m.jams; mood += m.mood; budget += m.budget;
      if (m.underFire) underFire++;
      fortify += m.fortify || 0;
    }
    const n = this.list.length;
    return {
      count: n, decisions: dec,
      jams: jams / n, mood: mood / n, budget: budget / n,
      underFire, fortify: fortify / n, day: this.day,
    };
  }

  /* Для сохранения: только то, что нельзя пересчитать (решения и история). */
  toJSON() {
    return {
      day: this.day,
      dayTimer: this.dayTimer,
      journal: this.journal.slice(-20),
      mayors: this.list.map((m) => ({
        pointId: m.pointId, budget: m.budget, housingDemand: m.housingDemand,
        socialLoad: m.socialLoad, jams: m.jams, mood: m.mood,
        unemployment: m.unemployment, bridgeAge: m.bridgeAge, freeLand: m.freeLand,
        decisions: m.decisions, fortify: m.fortify || 0, supply: m.supply || 0,
        justCaptured: m.justCaptured || 0, owner: m.owner,
      })),
    };
  }

  load(data) {
    if (!data || !this.enabled) return;
    this.day = data.day || 0;
    this.dayTimer = data.dayTimer || 0;
    if (Array.isArray(data.journal)) this.journal = data.journal.slice(-20);
    for (const saved of data.mayors || []) {
      const m = this.byPoint.get(saved.pointId);
      if (!m) continue;
      Object.assign(m, saved);
    }
  }

  /* Лучшее «почему» для показа на экране: последнее решение любого мэра. */
  headline() {
    return this.journal.length ? this.journal[this.journal.length - 1].text : '';
  }
}
